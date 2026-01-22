from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

from pydantic import BaseModel, Field


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _ensure_dict(raw: str | dict[str, Any] | None) -> dict[str, Any]:
    if isinstance(raw, dict):
        return raw
    if isinstance(raw, str):
        try:
            return json.loads(raw)
        except json.JSONDecodeError:
            return {"raw": raw}
    return {}



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



class IntentProgressRecord(BaseModel):
    # Retained for compatibility, but should be migrated to Chat/ChatMessage usage
    run_id: str
    id: int | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    chat_log_delta: dict[str, Any] | None = None
    tts_start_streaming: bool | None = None






# PipelineRunRecord and related intent fields are deprecated in favor of Chat/ChatMessage


class ExpectedIntentProgressRecord(BaseModel):
    order_index: int
    chat_log_delta: dict[str, Any] | list[Any] | None = None
    tts_start_streaming: bool | None = None


class ExpectedIntentEndRecord(BaseModel):
    order_index: int
    processed_locally: bool | None = None
    intent_output: dict[str, Any] | list[Any] | None = None


class IntentReviewRecord(BaseModel):
    run_id: str
    intent_start_id: int | None = None
    matched_expectations: bool
    updated_at: datetime
    expected_progress: list[ExpectedIntentProgressRecord] = Field(default_factory=list)
    expected_end: ExpectedIntentEndRecord | None = None



class ChatListResponse(BaseModel):
    chats: list[Chat]



ChatMessage.model_rebuild()
Chat.model_rebuild()
ChatListResponse.model_rebuild()
