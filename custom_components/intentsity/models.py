from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)



class ChatMessage(BaseModel):
    id: int | None = None
    chat_id: int | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    sender: str
    text: str
    data: dict[str, Any] = Field(default_factory=dict)


class Chat(BaseModel):
    id: int | None = None
    created_at: datetime = Field(default_factory=_utcnow)
    conversation_id: str | None = None
    messages: list[ChatMessage] = Field(default_factory=list)


class ChatListResponse(BaseModel):
    chats: list[Chat]



ChatMessage.model_rebuild()
Chat.model_rebuild()
ChatListResponse.model_rebuild()
