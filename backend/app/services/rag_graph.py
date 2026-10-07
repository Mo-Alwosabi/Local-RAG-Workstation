"""
LangGraph RAG agent (Phase 4).

Graph topology:
    START → retrieve → generate → save_history → END

Streaming:
    The graph is executed via ``graph.astream_events(input, version="v2")``.
    The ``generate`` node uses a streaming-enabled ChatGoogleGenerativeAI,
    so LangChain emits ``on_chat_model_stream`` events for every token.
    The ``retrieve`` node's output is surfaced via ``on_chain_end`` events.

Conversation memory:
    History is loaded *before* the graph runs (it requires DB I/O that is
    cleaner outside the graph) and injected into the initial state.
    The ``save_history`` node persists the user+assistant turn after the
    answer is fully assembled.
"""

from __future__ import annotations

import uuid
from typing import AsyncGenerator, TypedDict

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage, SystemMessage
from langchain_core.language_models import BaseChatModel
from langchain_openai import ChatOpenAI

try:
    from langchain_google_genai import ChatGoogleGenerativeAI
except ImportError:
    ChatGoogleGenerativeAI = None

from langgraph.graph import END, START, StateGraph

from app.config import get_settings
from app.schemas.query import SourceCitation
from app.services.conversation_service import save_turn
from app.services.query_cache import global_query_cache
from app.services.retrieval_service import RetrievedChunk, retrieve_chunks
from app.utils.logging import get_logger

logger = get_logger(__name__)


# ── RAG system prompt ─────────────────────────────────────────────────────────

_SYSTEM_TEMPLATE = """\
You are a helpful RAG assistant. Answer the question concisely using the provided context. If the context does not contain the answer, say you do not know.

Context:
{context}
"""


# ── Graph state ───────────────────────────────────────────────────────────────

class RAGState(TypedDict):
    """Shared mutable state threaded through every node in the graph."""

    query: str
    conversation_id: str           # always a str; uuid.UUID is not JSON-serialisable
    history_messages: list[BaseMessage]
    top_k: int
    chunks: list[RetrievedChunk]
    sources: list[dict]            # serialisable dicts ready for SSE
    answer: str


# ── LLM factory ──────────────────────────────────────────────────────────────

def _build_llm(settings) -> BaseChatModel:
    """Return a streaming-capable chat model (Gemini or OpenAI-compatible local/cloud)."""
    provider = settings.LLM_PROVIDER.lower().strip()

    if provider in ["lmstudio", "ollama", "openai", "local", "vllm", "custom"]:
        base_url = settings.effective_local_base_url.rstrip("/")
        if not base_url.endswith("/v1") and not base_url.endswith("/api"):
            base_url = f"{base_url}/v1"

        logger.info(
            "Building ChatOpenAI with base_url=%s, model=%s",
            base_url,
            settings.LOCAL_LLM_MODEL,
        )
        return ChatOpenAI(
            base_url=base_url,
            api_key=settings.LOCAL_API_KEY or "not-needed",
            model=settings.LOCAL_LLM_MODEL,
            temperature=0.1,
            streaming=True,
        )

    # Default to Gemini
    if ChatGoogleGenerativeAI is None:
        raise RuntimeError(
            "langchain-google-genai is not installed. If you want to use local models, "
            "set LLM_PROVIDER=lmstudio or LLM_PROVIDER=ollama in your .env file."
        )
    return ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.1,          # low temperature for factual RAG
        streaming=True,           # enables on_chat_model_stream events
        convert_system_message_to_human=False,
    )


# ── Graph nodes ───────────────────────────────────────────────────────────────

async def _retrieve_node(state: RAGState) -> dict:
    """
    Embed the query and fetch the top-k chunks from Qdrant.
    Includes Smart Intent Routing: Skips retrieval for conversational greetings/thanks.
    """
    q_clean = state["query"].strip().lower()
    chitchat_phrases = {
        "مرحبا", "مرحباً", "اهلا", "أهلا", "السلام عليكم", "صباح الخير", "مساء الخير",
        "شكرا", "شكراً", "يعطيك العافية", "من انت", "من أنت", "hello", "hi", "hey",
        "thanks", "thank you", "who are you", "what can you do"
    }
    
    # Check if query is short conversational intent
    if len(q_clean.split()) <= 4 and any(phrase in q_clean for phrase in chitchat_phrases):
        logger.info("retrieve_node: detected conversational intent for query=%r, skipping retrieval", q_clean)
        return {"chunks": [], "sources": []}

    chunks = await retrieve_chunks(query=state["query"], top_k=state["top_k"])

    sources = [
        {
            "document_id": c.document_id,
            "filename": c.filename,
            "page_number": c.page_number,
            "chunk_index": c.chunk_index,
            "text_snippet": c.text[:300],
            "score": round(c.score, 4),
        }
        for c in chunks
    ]

    logger.info(
        "retrieve_node: %d chunks for query=%r",
        len(chunks),
        state["query"][:80],
    )
    return {"chunks": chunks, "sources": sources}


async def _generate_node(state: RAGState) -> dict:
    """
    Build the RAG prompt and call the LLM.

    Because the LLM has ``streaming=True``, LangGraph's event bus emits
    ``on_chat_model_stream`` events for every token while this node awaits
    the ``ainvoke`` call.  The API layer captures those events.

    Produces:
        answer — the complete assistant response text
    """
    settings = get_settings()
    llm = _build_llm(settings)

    # Build context block from retrieved chunks
    if state["chunks"]:
        context_parts: list[str] = []
        for i, chunk in enumerate(state["chunks"], start=1):
            header = (
                f"[Source {i}] {chunk.filename}, page {chunk.page_number} "
                f"(relevance: {chunk.score:.2f})"
            )
            context_parts.append(f"{header}\n{chunk.text}")
        context = "\n\n---\n\n".join(context_parts)
    else:
        context = (
            "No relevant documents were found in the knowledge base for this query."
        )

    # Trim prior AIMessage content to reduce the model's surface area for
    # repetition.  Long prior answers are the main trigger for repetition;
    # 400 chars preserves coreference ability without inviting copy-paste.
    trimmed_history: list[BaseMessage] = []
    for msg in state["history_messages"]:
        if isinstance(msg, AIMessage) and len(msg.content) > 400:
            trimmed_history.append(AIMessage(content=msg.content[:400] + " …[truncated]"))
        else:
            trimmed_history.append(msg)

    # Assemble message list:
    #   system prompt (with context) → trimmed history → current query
    #
    # The instruction reminder is embedded directly in the user turn because
    # Gemini rejects consecutive SystemMessages (returns empty output).
    # Prefixing the question with an explicit instruction is the safest,
    # most compatible way to enforce focus at generation time.
    messages: list[BaseMessage] = [
        SystemMessage(content=_SYSTEM_TEMPLATE.format(context=context)),
        *trimmed_history,
        HumanMessage(content=state["query"]),
    ]

    logger.debug(
        "generate_node: invoking LLM with %d messages (%d history)",
        len(messages),
        len(state["history_messages"]),
    )

    response = await llm.ainvoke(messages)
    answer: str = response.content if isinstance(response.content, str) else str(response.content)

    return {"answer": answer}


async def _save_history_node(state: RAGState) -> dict:
    """
    Persist the current user+assistant turn to PostgreSQL.

    This node runs after streaming completes, so the full answer is available.
    """
    await save_turn(
        conversation_id=uuid.UUID(state["conversation_id"]),
        user_message=state["query"],
        assistant_message=state["answer"],
    )
    logger.debug("save_history_node: turn saved for conv=%s", state["conversation_id"])
    return {}


# ── Graph compilation ─────────────────────────────────────────────────────────

def _compile_graph():
    graph: StateGraph = StateGraph(RAGState)

    graph.add_node("retrieve", _retrieve_node)
    graph.add_node("generate", _generate_node)
    graph.add_node("save_history", _save_history_node)

    graph.add_edge(START, "retrieve")
    graph.add_edge("retrieve", "generate")
    graph.add_edge("generate", "save_history")
    graph.add_edge("save_history", END)

    return graph.compile()


# Lazy-init singleton — the compiled graph is stateless and safe to share.
_rag_graph = None


def get_rag_graph():
    global _rag_graph
    if _rag_graph is None:
        _rag_graph = _compile_graph()
        logger.info("LangGraph RAG graph compiled and cached")
    return _rag_graph


# ── Public streaming interface ────────────────────────────────────────────────

async def stream_rag(
    query: str,
    conversation_id: str,
    history_messages: list[BaseMessage],
    top_k: int,
) -> AsyncGenerator[dict, None]:
    """
    Execute the RAG graph and yield typed event dicts for the SSE layer.

    Yielded event shapes:
        {"type": "sources",  "sources": [...], "retrieved_count": N}
        {"type": "chunk",    "content": "<token>"}
        {"type": "done",     "conversation_id": "<uuid>", "total_chars": N}

    The caller is responsible for wrapping each dict as an SSE ``data:`` line.

    Args:
        query:             User's question.
        conversation_id:   String UUID of the active conversation.
        history_messages:  Previous turns as LangChain messages.
        top_k:             Chunks to retrieve.
    """
    # ── Check Cache for Instant Response ──────────────────────────────────────
    cached = global_query_cache.get(query)
    if cached:
        logger.info("Serving query '%s' from QueryCache (instant response)", query[:50])
        yield {
            "type": "sources",
            "sources": cached.sources,
            "retrieved_count": len(cached.sources),
        }
        # Yield cached answer tokens cleanly
        yield {"type": "chunk", "content": cached.answer}
        yield {
            "type": "done",
            "conversation_id": conversation_id,
            "total_chars": len(cached.answer),
        }
        return

    graph = get_rag_graph()

    initial_state: RAGState = {
        "query": query,
        "conversation_id": conversation_id,
        "history_messages": history_messages,
        "top_k": top_k,
        "chunks": [],
        "sources": [],
        "answer": "",
    }

    sources_emitted = False
    total_chars = 0
    full_answer_parts: list[str] = []
    emitted_sources: list[dict] = []

    try:
        async for event in graph.astream_events(initial_state, version="v2"):
            kind: str = event["event"]
            name: str = event.get("name", "")

            # ── After retrieve node: emit sources ──────────────────────────────
            if kind == "on_chain_end" and name == "retrieve" and not sources_emitted:
                output = event["data"].get("output", {})
                emitted_sources = output.get("sources", [])
                yield {
                    "type": "sources",
                    "sources": emitted_sources,
                    "retrieved_count": len(emitted_sources),
                }
                sources_emitted = True

            # ── LLM token streaming ────────────────────────────────────────────
            elif kind == "on_chat_model_stream":
                chunk = event["data"].get("chunk")
                if chunk is None:
                    continue

                # AIMessageChunk.content can be str or list[dict] (multimodal)
                raw = chunk.content if hasattr(chunk, "content") else ""
                if isinstance(raw, list):
                    token = "".join(
                        part.get("text", "") if isinstance(part, dict) else str(part)
                        for part in raw
                    )
                else:
                    token = str(raw)

                if token:
                    total_chars += len(token)
                    full_answer_parts.append(token)
                    yield {"type": "chunk", "content": token}

        # ── Graph complete: store in Cache ────────────────────────────────────────
        full_answer = "".join(full_answer_parts)
        if full_answer:
            global_query_cache.set(query, full_answer, emitted_sources)

        yield {
            "type": "done",
            "conversation_id": conversation_id,
            "total_chars": total_chars,
        }
    except Exception as e:
        logger.error(f"Error during RAG generation: {e}")
        yield {
            "type": "error",
            "message": f"Generation failed: {str(e)}"
        }
