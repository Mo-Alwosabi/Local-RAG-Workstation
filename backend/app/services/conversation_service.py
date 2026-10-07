"""
Conversation history CRUD service (Phase 4).

Manages Conversation rows and Message rows in PostgreSQL.
All operations are async and use the existing get_db_session() context manager.

Responsibilities:
  - get_or_create_conversation  — resolve or mint a new session UUID
  - load_history                — fetch last N turns as LangChain messages
  - save_turn                   — persist user + assistant message pair
"""

import uuid
from datetime import datetime, timezone

from langchain_core.messages import AIMessage, BaseMessage, HumanMessage
from sqlalchemy import delete, func, select

from app.db.conversation_models import Conversation, Message
from app.db.postgres import get_db_session
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Maximum number of *pairs* (user+assistant) to load as context window.
# Kept at 3 pairs: enough for coreference resolution, small enough to prevent
# the model from repeating unrelated content from distant turns.
_DEFAULT_HISTORY_PAIRS = 3


async def get_or_create_conversation(
    conversation_id: uuid.UUID | None,
) -> uuid.UUID:
    """
    Return the UUID of the requested conversation, or create a new one.

    If *conversation_id* is provided but does not exist in the database, a
    **new** conversation is created (defensive: avoids 404 mid-stream).

    Returns:
        UUID of the resolved or newly created Conversation.
    """
    async with get_db_session() as session:
        if conversation_id is not None:
            result = await session.execute(
                select(Conversation).where(Conversation.id == conversation_id)
            )
            existing = result.scalar_one_or_none()
            if existing is not None:
                logger.debug("Resuming conversation id=%s", conversation_id)
                return existing.id

            logger.warning(
                "conversation_id=%s not found — starting new conversation",
                conversation_id,
            )

        new_conv = Conversation(id=uuid.uuid4())
        session.add(new_conv)
        await session.flush()
        conv_id = new_conv.id

    logger.info("Created new conversation id=%s", conv_id)
    return conv_id


async def load_history(
    conversation_id: uuid.UUID,
    max_pairs: int = _DEFAULT_HISTORY_PAIRS,
) -> list[BaseMessage]:
    """
    Load the most recent *max_pairs* user+assistant exchanges from the DB
    and return them as an ordered list of LangChain BaseMessage objects.

    The list is returned in chronological order (oldest first) so it can
    be directly appended to the LLM prompt.

    Args:
        conversation_id: UUID of the conversation to load.
        max_pairs:       Maximum number of user/assistant turns to include.

    Returns:
        List of HumanMessage / AIMessage objects, oldest first.
    """
    # Fetch the last (max_pairs * 2) rows to cover complete pairs
    async with get_db_session() as session:
        result = await session.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.desc())
            .limit(max_pairs * 2)
        )
        rows = list(reversed(result.scalars().all()))

    messages: list[BaseMessage] = []
    for row in rows:
        if row.role == "user":
            messages.append(HumanMessage(content=row.content))
        elif row.role == "assistant":
            messages.append(AIMessage(content=row.content))

    logger.debug(
        "Loaded %d history messages for conversation_id=%s",
        len(messages),
        conversation_id,
    )
    return messages


async def save_turn(
    conversation_id: uuid.UUID,
    user_message: str,
    assistant_message: str,
) -> None:
    """
    Persist one complete user/assistant turn.

    Both messages are written in the same transaction so they either
    both succeed or both fail — no half-saved turns.

    Also bumps Conversation.updated_at so the conversation list stays sorted.
    """
    now = datetime.now(tz=timezone.utc)

    async with get_db_session() as session:
        # Bump updated_at on the parent conversation
        conv_result = await session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conv = conv_result.scalar_one_or_none()
        if conv is not None:
            conv.updated_at = now

        session.add(Message(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            role="user",
            content=user_message,
            created_at=now,
        ))
        session.add(Message(
            id=uuid.uuid4(),
            conversation_id=conversation_id,
            role="assistant",
            content=assistant_message,
            created_at=now,
        ))

    logger.debug(
        "Saved turn for conversation_id=%s (user=%d chars, assistant=%d chars)",
        conversation_id,
        len(user_message),
        len(assistant_message),
    )


async def list_conversations(limit: int = 50) -> list[dict]:
    """
    List recent conversations with preview snippet, message count, and timestamps.
    """
    async with get_db_session() as session:
        result = await session.execute(
            select(Conversation).order_by(Conversation.updated_at.desc()).limit(limit)
        )
        conversations = result.scalars().all()

        output = []
        for conv in conversations:
            count_result = await session.execute(
                select(func.count(Message.id)).where(Message.conversation_id == conv.id)
            )
            msg_count = count_result.scalar_one() or 0

            first_msg_result = await session.execute(
                select(Message.content)
                .where(Message.conversation_id == conv.id, Message.role == "user")
                .order_by(Message.created_at.asc())
                .limit(1)
            )
            first_content = first_msg_result.scalar_one_or_none()
            title = first_content[:60] if first_content else "محادثة جديدة"

            output.append({
                "id": str(conv.id),
                "title": title,
                "message_count": msg_count,
                "created_at": conv.created_at.isoformat() if conv.created_at else None,
                "updated_at": conv.updated_at.isoformat() if conv.updated_at else None,
            })
        return output


async def get_conversation_messages(conversation_id: uuid.UUID) -> list[dict]:
    """
    Get all messages for a given conversation ordered chronologically.
    """
    async with get_db_session() as session:
        result = await session.execute(
            select(Message)
            .where(Message.conversation_id == conversation_id)
            .order_by(Message.created_at.asc())
        )
        messages = result.scalars().all()
        return [
            {
                "id": str(msg.id),
                "role": msg.role,
                "content": msg.content,
                "created_at": msg.created_at.isoformat() if msg.created_at else None,
            }
            for msg in messages
        ]


async def delete_conversation(conversation_id: uuid.UUID) -> bool:
    """
    Delete a conversation and all its messages.
    """
    async with get_db_session() as session:
        result = await session.execute(
            select(Conversation).where(Conversation.id == conversation_id)
        )
        conv = result.scalar_one_or_none()
        if not conv:
            return False
        await session.delete(conv)
    logger.info("Deleted conversation id=%s", conversation_id)
    return True

