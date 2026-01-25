from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field, field_validator, model_validator



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
    deleted_at: datetime | None = None


class CorrectedChatMessage(BaseModel):
    id: int | None = None
    corrected_chat_id: str | None = None
    original_message_id: int | None = None
    position: int = 0
    timestamp: datetime = Field(default_factory=_utcnow)
    sender: str
    text: str
    data: dict[str, Any] = Field(default_factory=dict)
    deleted_at: datetime | None = None


class CorrectedChat(BaseModel):
    conversation_id: str
    pipeline_run_id: str
    original_conversation_id: str
    original_pipeline_run_id: str
    created_at: datetime = Field(default_factory=_utcnow)
    updated_at: datetime = Field(default_factory=_utcnow)
    messages: list[CorrectedChatMessage] = Field(default_factory=list)
    deleted_at: datetime | None = None


class Chat(BaseModel):
    conversation_id: str
    pipeline_run_id: str
    run_timestamp: datetime = Field(default_factory=_utcnow)
    created_at: datetime = Field(default_factory=_utcnow)
    messages: list[ChatMessage] = Field(default_factory=list)
    corrected: CorrectedChat | None = None
    deleted_at: datetime | None = None


class ChatListResponse(BaseModel):
    chats: list[Chat]


class ChatListRequest(BaseModel):
    limit: int
    corrected: str = "all"
    start: datetime | None = None
    end: datetime | None = None

    @field_validator("corrected")
    @classmethod
    def _validate_corrected(cls, value: str) -> str:
        allowed = {"all", "corrected", "uncorrected"}
        if value not in allowed:
            raise ValueError("corrected must be one of: all, corrected, uncorrected")
        return value

    @field_validator("start", "end", mode="before")
    @classmethod
    def _empty_to_none(cls, value: object) -> object:
        if value == "":
            return None
        return value


class CorrectedChatSaveRequest(BaseModel):
    conversation_id: str
    pipeline_run_id: str
    messages: list[CorrectedChatMessage]


class TombstoneTarget(BaseModel):
    kind: str
    conversation_id: str | None = None
    pipeline_run_id: str | None = None
    message_id: int | None = None
    corrected_message_id: int | None = None

    @model_validator(mode="after")
    def _validate_kind(self) -> "TombstoneTarget":
        if self.kind == "chat":
            if not self.conversation_id or not self.pipeline_run_id:
                raise ValueError("chat tombstone requires conversation_id and pipeline_run_id")
            return self
        if self.kind == "message":
            if self.message_id is None:
                raise ValueError("message tombstone requires message_id")
            return self
        if self.kind == "corrected_chat":
            if not self.conversation_id or not self.pipeline_run_id:
                raise ValueError("corrected_chat tombstone requires conversation_id and pipeline_run_id")
            return self
        if self.kind == "corrected_message":
            if self.corrected_message_id is None:
                raise ValueError("corrected_message tombstone requires corrected_message_id")
            return self
        raise ValueError("invalid tombstone kind")


class TombstoneRequest(BaseModel):
    targets: list[TombstoneTarget]


ChatMessage.model_rebuild()
CorrectedChatMessage.model_rebuild()
CorrectedChat.model_rebuild()
Chat.model_rebuild()
ChatListResponse.model_rebuild()
ChatListRequest.model_rebuild()
CorrectedChatSaveRequest.model_rebuild()
TombstoneTarget.model_rebuild()
TombstoneRequest.model_rebuild()
