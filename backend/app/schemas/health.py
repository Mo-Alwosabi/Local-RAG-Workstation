"""
Health-check response schemas.
"""

from typing import Literal
from pydantic import BaseModel


ServiceStatus = Literal["connected", "not_connected"]


class HealthResponse(BaseModel):
    status: Literal["ok", "degraded"]
    gemini: ServiceStatus
    llm_provider: str = "gemini"
    embedding_provider: str = "gemini"
    postgres: ServiceStatus
    qdrant: ServiceStatus

    model_config = {"json_schema_extra": {
        "example": {
            "status": "ok",
            "gemini": "connected",
            "llm_provider": "gemini",
            "embedding_provider": "gemini",
            "postgres": "connected",
            "qdrant": "connected",
        }
    }}
