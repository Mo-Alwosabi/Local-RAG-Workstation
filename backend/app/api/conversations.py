"""
Conversations API router.

Endpoints:
  - GET /conversations: List all conversation threads with snippets
  - GET /conversations/{conversation_id}: Get all messages for a specific conversation
  - DELETE /conversations/{conversation_id}: Delete a conversation and its messages
"""

import uuid
from typing import Any

from fastapi import APIRouter, HTTPException, status

from app.services.conversation_service import (
    delete_conversation,
    get_conversation_messages,
    list_conversations,
)
from app.utils.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(prefix="/conversations", tags=["Conversations"])


@router.get(
    "",
    summary="List all conversations",
    description="Returns a list of conversation sessions ordered by last update.",
)
async def get_conversations(limit: int = 50) -> list[dict[str, Any]]:
    return await list_conversations(limit=limit)


@router.get(
    "/{conversation_id}",
    summary="Get conversation message history",
    description="Returns all user and assistant messages for the given conversation.",
)
async def get_conversation(conversation_id: uuid.UUID) -> dict[str, Any]:
    messages = await get_conversation_messages(conversation_id)
    return {
        "id": str(conversation_id),
        "messages": messages,
    }


@router.delete(
    "/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a conversation",
    description="Permanently deletes a conversation session and all its messages.",
)
async def remove_conversation(conversation_id: uuid.UUID) -> None:
    deleted = await delete_conversation(conversation_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation {conversation_id} not found",
        )
