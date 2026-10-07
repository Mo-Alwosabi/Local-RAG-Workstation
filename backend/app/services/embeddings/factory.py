from app.config import get_settings
from app.services.embeddings.base import BaseEmbeddingProvider
from app.services.embeddings.gemini import GeminiEmbeddingProvider
from app.services.embeddings.openai_compatible import OpenAICompatibleEmbeddingProvider


def get_embedding_provider() -> BaseEmbeddingProvider:
    """
    Factory function to retrieve the configured embedding provider.
    Inspects settings.EMBEDDING_PROVIDER ('gemini', 'lmstudio', 'ollama', 'openai', etc.)
    """
    settings = get_settings()
    provider = settings.EMBEDDING_PROVIDER.lower().strip()

    if provider == "gemini":
        return GeminiEmbeddingProvider()

    # lmstudio, ollama, openai, local, vllm, or custom
    return OpenAICompatibleEmbeddingProvider()

