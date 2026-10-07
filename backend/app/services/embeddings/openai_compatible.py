"""
OpenAI-compatible embedding provider.

Works with:
  - LM Studio (http://localhost:1234/v1)
  - Ollama (http://localhost:11434/v1)
  - vLLM / LocalAI / LiteLLM
  - OpenAI / OpenRouter
"""

from typing import Any
import httpx
from openai import OpenAI

from app.config import get_settings
from app.services.embeddings.base import BaseEmbeddingProvider
from app.utils.logging import get_logger

logger = get_logger(__name__)


class OpenAICompatibleEmbeddingProvider(BaseEmbeddingProvider):
    """
    Synchronous OpenAI-compatible embedding provider.
    The orchestrator handles batch sizing and asyncio.to_thread wrappers.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        base_url = self.settings.embedding_base_url.rstrip("/")
        if not base_url.endswith("/v1") and not base_url.endswith("/api"):
            base_url = f"{base_url}/v1"

        self.base_url = base_url
        self.api_key = self.settings.LOCAL_API_KEY or "not-needed"
        self.model = self.settings.LOCAL_EMBEDDING_MODEL

        self.client = OpenAI(
            base_url=self.base_url,
            api_key=self.api_key,
            timeout=httpx.Timeout(60.0, connect=10.0),
        )

    def embed_batch(self, texts: list[str], task_type: str = "RETRIEVAL_DOCUMENT") -> list[list[float]]:
        if not texts:
            return []

        logger.debug(
            "Requesting embeddings from %s for %d texts using model %s",
            self.base_url,
            len(texts),
            self.model,
        )

        response = self.client.embeddings.create(
            model=self.model,
            input=texts,
        )

        # Sort by index to guarantee input ordering
        sorted_data = sorted(response.data, key=lambda item: item.index)
        embeddings = [list(item.embedding) for item in sorted_data]

        return embeddings
