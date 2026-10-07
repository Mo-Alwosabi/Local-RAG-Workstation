import os
from unittest.mock import patch
from app.config import Settings
from app.services.embeddings.factory import get_embedding_provider
from app.services.embeddings.openai_compatible import OpenAICompatibleEmbeddingProvider
from app.services.rag_graph import _build_llm
from app.schemas.health import HealthResponse
from langchain_openai import ChatOpenAI


def test_local_provider_setup():
    with patch.dict(os.environ, {
        "LLM_PROVIDER": "lmstudio",
        "EMBEDDING_PROVIDER": "lmstudio",
        "LOCAL_BASE_URL": "http://localhost:1234/v1",
        "LOCAL_LLM_MODEL": "default",
        "LOCAL_EMBEDDING_MODEL": "nomic-embed-text",
        "POSTGRES_PASSWORD": "dummy",
    }):
        settings = Settings()
        assert settings.LLM_PROVIDER == "lmstudio"
        assert settings.EMBEDDING_PROVIDER == "lmstudio"

        provider = get_embedding_provider()
        assert isinstance(provider, OpenAICompatibleEmbeddingProvider)
        assert provider.base_url == "http://localhost:1234/v1"
        assert provider.model == "nomic-embed-text"

        llm = _build_llm(settings)
        assert isinstance(llm, ChatOpenAI)

        health = HealthResponse(
            status="ok",
            gemini="connected",
            llm_provider=settings.LLM_PROVIDER,
            embedding_provider=settings.EMBEDDING_PROVIDER,
            postgres="connected",
            qdrant="connected",
        )
        dump = health.model_dump()
        assert dump["llm_provider"] == "lmstudio"
        assert dump["embedding_provider"] == "lmstudio"
        print("[SUCCESS] Provider factory test passed.")


if __name__ == "__main__":
    test_local_provider_setup()
