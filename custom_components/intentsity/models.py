from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field



def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ChatMessage(BaseModel):
    id: int | None = None
    chat_id: str | None = None
    position: int | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    sender: str
    text: str
    data: dict[str, Any] = Field(default_factory=dict)


class CorrectedChatMessage(BaseModel):
    id: int | None = None
    corrected_chat_id: str | None = None
    original_message_id: int | None = None
    position: int = 0
    timestamp: datetime = Field(default_factory=_utcnow)
    sender: str
    text: str
    data: dict[str, Any] = Field(default_factory=dict)


class CorrectedChat(BaseModel):
    conversation_id: str
    pipeline_run_id: str
    original_conversation_id: str
    original_pipeline_run_id: str
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    messages: list[CorrectedChatMessage] = Field(default_factory=list)


class Chat(BaseModel):
    conversation_id: str
    pipeline_run_id: str
    run_timestamp: datetime = Field(default_factory=_utcnow)
    created_at: datetime = Field(default_factory=_utcnow)
    messages: list[ChatMessage] = Field(default_factory=list)
    corrected: CorrectedChat | None = None


class ChatListResponse(BaseModel):
    chats: list[Chat]


class CorrectedChatSaveRequest(BaseModel):
    conversation_id: str
    pipeline_run_id: str
    messages: list[CorrectedChatMessage]


ChatMessage.model_rebuild()
CorrectedChatMessage.model_rebuild()
CorrectedChat.model_rebuild()
Chat.model_rebuild()
ChatListResponse.model_rebuild()
CorrectedChatSaveRequest.model_rebuild()
