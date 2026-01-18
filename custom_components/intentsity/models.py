from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any, Mapping

from pydantic import BaseModel, Field


class IntentEventRecord(BaseModel):
    """Normalized representation of an intent pipeline event."""

    run_id: str
    timestamp: datetime
    event_type: str
    intent_type: str | None = Field(default=None)
    raw_event: dict[str, Any] = Field(default_factory=dict)


class LoggedIntentEvent(IntentEventRecord):
    """Intent event ready to be persisted."""

    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    def to_db_row(self) -> tuple[str, str, str, str | None, str]:
        return (
            self.run_id,
            self.timestamp.isoformat(),
            self.event_type,
            self.intent_type,
            json.dumps(self.raw_event, default=str),
        )


class IntentEventListResponse(BaseModel):
    """Wire format for API responses."""

    events: list[IntentEventRecord]


def intent_event_from_row(row: Mapping[str, Any]) -> IntentEventRecord:
    raw_event_payload = row.get("raw_event")

    if isinstance(raw_event_payload, str):
        try:
            parsed = json.loads(raw_event_payload)
        except json.JSONDecodeError:
            parsed = {"raw": raw_event_payload}
    elif isinstance(raw_event_payload, dict):
        parsed = raw_event_payload
    else:
        parsed = {}

    timestamp_str = row.get("timestamp")
    timestamp = _parse_timestamp(timestamp_str) if isinstance(timestamp_str, str) else datetime.now(timezone.utc)

    return IntentEventRecord.model_validate(
        {
            "run_id": row.get("run_id", "unknown"),
            "timestamp": timestamp,
            "event_type": row.get("event_type", "unknown"),
            "intent_type": row.get("intent_type"),
            "raw_event": parsed,
        }
    )


def _parse_timestamp(value: str) -> datetime:
    try:
        return datetime.fromisoformat(value)
    except ValueError:
        return datetime.now(timezone.utc)


IntentEventRecord.model_rebuild()
LoggedIntentEvent.model_rebuild()
IntentEventListResponse.model_rebuild()
