"""
Application configuration using pydantic-settings.
All values are loaded from environment variables (or .env file).
"""

import os
from functools import lru_cache
from pydantic import model_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────────────────────
    APP_NAME: str = "RAG Agent API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: str = "development"         # development | staging | production
    DEBUG: bool = False
    LOG_LEVEL: str = "INFO"

    # ── Provider Selection ─────────────────────────────────────────────────────
    # LLM_PROVIDER: "gemini" | "lmstudio" | "ollama" | "openai" | "local"
    LLM_PROVIDER: str = "gemini"
    # EMBEDDING_PROVIDER: "gemini" | "lmstudio" | "ollama" | "openai" | "local"
    EMBEDDING_PROVIDER: str = "gemini"

    # ── Google Gemini ──────────────────────────────────────────────────────────
    GOOGLE_API_KEY: str | None = None
    GEMINI_MODEL: str = "gemini-2.5-flash"
    GEMINI_EMBEDDING_MODEL: str = "models/gemini-embedding-001"

    # ── Local / OpenAI-Compatible (LM Studio, Ollama, vLLM, OpenAI) ───────────
    LOCAL_BASE_URL: str = "http://localhost:1234/v1"
    LOCAL_API_KEY: str = "not-needed"
    LOCAL_LLM_MODEL: str = "default"
    LOCAL_EMBEDDING_MODEL: str = "nomic-embed-text"
    LOCAL_EMBEDDING_BASE_URL: str | None = None

    @property
    def effective_local_base_url(self) -> str:
        """Returns base URL, automatically translating localhost to host.docker.internal when inside Docker."""
        url = self.LOCAL_BASE_URL
        if (os.path.exists("/.dockerenv") or self.POSTGRES_HOST == "postgres") and ("localhost" in url or "127.0.0.1" in url):
            url = url.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal")
        return url

    @property
    def embedding_base_url(self) -> str:
        """Returns the base URL to use for embeddings (falls back to effective_local_base_url)."""
        base = self.LOCAL_EMBEDDING_BASE_URL or self.effective_local_base_url
        if (os.path.exists("/.dockerenv") or self.POSTGRES_HOST == "postgres") and ("localhost" in base or "127.0.0.1" in base):
            base = base.replace("localhost", "host.docker.internal").replace("127.0.0.1", "host.docker.internal")
        return base

    # ── Vector Embeddings ──────────────────────────────────────────────────────
    EMBEDDING_DIMENSION: int = 3072          # 3072 for Gemini; 768 for nomic-embed-text; 1024 for bge-m3
    EMBEDDING_BATCH_SIZE: int = 5          # chunks per embed API call

    @model_validator(mode="after")
    def validate_provider_keys(self) -> "Settings":
        llm = self.LLM_PROVIDER.lower()
        emb = self.EMBEDDING_PROVIDER.lower()
        if (llm == "gemini" or emb == "gemini") and not self.GOOGLE_API_KEY:
            raise ValueError(
                "GOOGLE_API_KEY is required when LLM_PROVIDER or EMBEDDING_PROVIDER is 'gemini'. "
                "For local LLMs (LM Studio, Ollama), set LLM_PROVIDER=lmstudio and EMBEDDING_PROVIDER=lmstudio in .env"
            )
        return self

    # ── RAG retrieval ───────────────────────────────────────────────────────────
    RETRIEVAL_TOP_K: int = 5                # default chunks to retrieve per query
    RETRIEVAL_MIN_SCORE: float = 0.63        # minimum cosine similarity score threshold
    RETRIEVAL_MAX_GAP: float = 0.05          # maximum score difference from top score to keep a candidate
    MAX_HISTORY_PAIRS: int = 3             # conversation turns kept in context window

    # ── Embedding Resiliency ──────────────────────────────────────────────────
    MAX_EMBED_RETRIES: int = 5
    INITIAL_BACKOFF: float = 1.0
    MAX_BACKOFF: float = 16.0
    ENABLE_JITTER: bool = True
    MAX_CONCURRENT_EMBEDDINGS: int = 1


    # ── PostgreSQL ─────────────────────────────────────────────────────────────
    POSTGRES_HOST: str = "postgres"
    POSTGRES_PORT: int = 5432
    POSTGRES_USER: str = "raguser"
    POSTGRES_PASSWORD: str = "change-me-strong-password"
    POSTGRES_DB: str = "ragdb"

    @property
    def postgres_dsn(self) -> str:
        return (
            f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    @property
    def postgres_dsn_sync(self) -> str:
        """Sync DSN used for health-check ping only."""
        return (
            f"postgresql://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}"
            f"@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
        )

    # ── Qdrant ─────────────────────────────────────────────────────────────────
    QDRANT_HOST: str = "qdrant"
    QDRANT_PORT: int = 6333
    QDRANT_API_KEY: str | None = None        # optional; required for Qdrant Cloud
    QDRANT_COLLECTION: str = "documents"
    QDRANT_PATH: str | None = None

    @property
    def qdrant_url(self) -> str:
        return f"http://{self.QDRANT_HOST}:{self.QDRANT_PORT}"

    # ── Upload limits ──────────────────────────────────────────────────────────
    MAX_UPLOAD_SIZE_MB: int = 50            # per-file size limit
    MAX_FILES_PER_UPLOAD: int = 10

    # ── PDF Chunking ────────────────────────────────────────────────────────────
    MIN_CHUNK_SIZE: int = 500              # target minimum chars per chunk
    MAX_CHUNK_SIZE: int = 2000             # max chars before recursive split
    CHUNK_OVERLAP: int = 200               # chars shared between consecutive chunks

    # ── CORS ───────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = ["*"]


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return a cached singleton of Settings."""
    return Settings()  # type: ignore[call-arg]
