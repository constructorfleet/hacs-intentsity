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


class IntentStartRecord(BaseModel):
    run_id: str
    id: int | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    engine: str | None = None
    language: str | None = None
    intent_input: str | None = None
    conversation_id: str | None = None
    device_id: str | None = None
    satellite_id: str | None = None
    prefer_local_intents: bool | None = None


class IntentProgressRecord(BaseModel):
    run_id: str
    id: int | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    chat_log_delta: dict[str, Any] | None = None
    tts_start_streaming: bool | None = None

    @classmethod
    def from_payload(
        cls,
        run_id: str,
        timestamp: datetime,
        payload: dict[str, Any] | None,
    ) -> "IntentProgressRecord":
        payload = payload or {}
        delta = payload.get("chat_log_delta")
        parsed_delta = _ensure_dict(delta) if isinstance(delta, (str, dict)) else None
        return cls(
            run_id=run_id,
            timestamp=timestamp,
            chat_log_delta=parsed_delta,
            tts_start_streaming=payload.get("tts_start_streaming"),
        )


class IntentEndRecord(BaseModel):
    run_id: str
    id: int | None = None
    timestamp: datetime = Field(default_factory=_utcnow)
    processed_locally: bool | None = None
    intent_output: dict[str, Any] = Field(default_factory=dict)

    @classmethod
    def from_payload(
        cls,
        run_id: str,
        timestamp: datetime,
        payload: str | dict[str, Any] | None,
    ) -> "IntentEndRecord":
        parsed = _ensure_dict(payload)
        return cls(
            run_id=run_id,
            timestamp=timestamp,
            processed_locally=parsed.get("processed_locally"),
            intent_output=parsed.get("intent_output") or parsed,
        )


class PipelineRunRecord(BaseModel):
    run_id: str
    created_at: datetime
    conversation_engine: str | None = None
    language: str | None = None
    name: str | None = None
    stt_engine: str | None = None
    stt_language: str | None = None
    tts_engine: str | None = None
    tts_language: str | None = None
    tts_voice: str | None = None
    wake_word_entity: str | None = None
    wake_word_id: str | None = None
    prefer_local_intents: bool | None = None
    intent_starts: list[IntentStartRecord] = Field(default_factory=list)
    intent_progress: list[IntentProgressRecord] = Field(default_factory=list)
    intent_ends: list[IntentEndRecord] = Field(default_factory=list)
    review: "IntentReviewRecord | None" = None


class ExpectedIntentProgressRecord(BaseModel):
    order_index: int
    chat_log_delta: dict[str, Any] | None = None
    tts_start_streaming: bool | None = None


class ExpectedIntentEndRecord(BaseModel):
    order_index: int
    processed_locally: bool | None = None
    intent_output: dict[str, Any] | None = None


class IntentReviewRecord(BaseModel):
    run_id: str
    intent_start_id: int | None = None
    matched_expectations: bool
    updated_at: datetime
    expected_progress: list[ExpectedIntentProgressRecord] = Field(default_factory=list)
    expected_end: ExpectedIntentEndRecord | None = None


class IntentRunListResponse(BaseModel):
    runs: list[PipelineRunRecord]


IntentStartRecord.model_rebuild()
IntentProgressRecord.model_rebuild()
IntentEndRecord.model_rebuild()
PipelineRunRecord.model_rebuild()
IntentRunListResponse.model_rebuild()
ExpectedIntentProgressRecord.model_rebuild()
ExpectedIntentEndRecord.model_rebuild()
IntentReviewRecord.model_rebuild()
