"""
Health-check service.

Performs real connectivity checks against:
  - Google Gemini   → lightweight models.list call
  - PostgreSQL      → raw asyncpg ping (SELECT 1)
  - Qdrant          → cluster info endpoint
"""

import asyncio
import httpx
import asyncpg

try:
    import google.generativeai as genai
except ImportError:
    genai = None

from app.config import get_settings
from app.db.qdrant import get_qdrant_client
from app.schemas.health import HealthResponse, ServiceStatus
from app.utils.logging import get_logger

logger = get_logger(__name__)


async def _check_gemini(settings) -> ServiceStatus:
    """
    Verify connectivity to the Gemini API by listing available models.
    Uses asyncio.to_thread because the google-generativeai SDK is synchronous.
    """
    if genai is None or not settings.GOOGLE_API_KEY:
        return "not_connected"

    try:
        genai.configure(api_key=settings.GOOGLE_API_KEY)

        def _list_models():
            models = list(genai.list_models())
            return models

        models = await asyncio.wait_for(
            asyncio.to_thread(_list_models),
            timeout=10,
        )
        logger.debug("Gemini check OK — %d models available", len(models))
        return "connected"
    except Exception as exc:
        logger.warning("Gemini check failed: %s", exc)
        return "not_connected"


async def _check_local_llm(settings) -> ServiceStatus:
    """
    Verify connectivity to local LLM server (LM Studio, Ollama, vLLM, etc.)
    by querying the /models endpoint.
    """
    base_url = settings.effective_local_base_url.rstrip("/")
    test_urls = [
        f"{base_url}/models" if base_url.endswith("/v1") else f"{base_url}/v1/models",
        f"{base_url}/models",
    ]
    if "11434" in base_url or "ollama" in settings.LLM_PROVIDER.lower():
        root_url = base_url.replace("/v1", "")
        test_urls.append(f"{root_url}/api/tags")

    headers = {}
    if settings.LOCAL_API_KEY and settings.LOCAL_API_KEY != "not-needed":
        headers["Authorization"] = f"Bearer {settings.LOCAL_API_KEY}"

    async with httpx.AsyncClient(timeout=4.0) as client:
        for url in test_urls:
            try:
                resp = await client.get(url, headers=headers)
                if resp.status_code in {200, 204}:
                    logger.debug("Local LLM check OK via %s", url)
                    return "connected"
            except Exception:
                continue

    logger.warning("Local LLM check failed for %s", base_url)
    return "not_connected"


async def _check_llm(settings) -> ServiceStatus:
    provider = settings.LLM_PROVIDER.lower().strip()
    if provider in ["lmstudio", "ollama", "openai", "local", "vllm", "custom"]:
        return await _check_local_llm(settings)
    return await _check_gemini(settings)


async def _check_postgres(settings) -> ServiceStatus:
    """Open a raw asyncpg connection and execute SELECT 1."""
    try:
        conn: asyncpg.Connection = await asyncio.wait_for(
            asyncpg.connect(
                host=settings.POSTGRES_HOST,
                port=settings.POSTGRES_PORT,
                user=settings.POSTGRES_USER,
                password=settings.POSTGRES_PASSWORD,
                database=settings.POSTGRES_DB,
            ),
            timeout=5,
        )
        await conn.fetchval("SELECT 1")
        await conn.close()
        logger.debug("PostgreSQL check OK")
        return "connected"
    except Exception as exc:
        logger.warning("PostgreSQL check failed: %s", exc)
        return "not_connected"


async def _check_qdrant() -> ServiceStatus:
    """Call Qdrant's cluster info endpoint via the async client."""
    try:
        client = get_qdrant_client()
        info = await asyncio.wait_for(client.get_collections(), timeout=5)
        logger.debug(
            "Qdrant check OK — %d collection(s)", len(info.collections)
        )
        return "connected"
    except Exception as exc:
        logger.warning("Qdrant check failed: %s", exc)
        return "not_connected"


async def get_health() -> HealthResponse:
    """
    Run all connectivity checks concurrently and return an aggregated result.
    overall status is 'ok' only when all three services are connected.
    """
    settings = get_settings()

    llm_status, postgres_status, qdrant_status = await asyncio.gather(
        _check_llm(settings),
        _check_postgres(settings),
        _check_qdrant(),
    )

    overall = (
        "ok"
        if all(
            s == "connected"
            for s in (llm_status, postgres_status, qdrant_status)
        )
        else "degraded"
    )

    return HealthResponse(
        status=overall,
        gemini=llm_status,
        llm_provider=settings.LLM_PROVIDER,
        embedding_provider=settings.EMBEDDING_PROVIDER,
        postgres=postgres_status,
        qdrant=qdrant_status,
    )
