from __future__ import annotations

import json

from custom_components.intentsity import models


def test_logged_event_round_trip() -> None:
    payload = models.LoggedIntentEvent(
        run_id="abc123",
        event_type="intent_start",
        intent_type="AssistIntentTest",
        raw_event={"foo": "bar", "confidence": 0.7},
    )

    run_id, timestamp, event_type, intent_type, raw_json = payload.to_db_row()

    assert json.loads(raw_json) == payload.raw_event

    reconstructed = models.intent_event_from_row(
        {
            "run_id": run_id,
            "timestamp": timestamp,
            "event_type": event_type,
            "intent_type": intent_type,
            "raw_event": raw_json,
        }
    )

    assert reconstructed.run_id == payload.run_id
    assert reconstructed.event_type == payload.event_type
    assert reconstructed.intent_type == payload.intent_type
    assert reconstructed.raw_event == payload.raw_event


def test_intent_event_from_row_handles_invalid_payload() -> None:
    event = models.intent_event_from_row(
        {
            "run_id": "broken",
            "timestamp": "not-a-timestamp",
            "event_type": "intent_end",
            "intent_type": None,
            "raw_event": "{not-json}",
        }
    )

    assert event.run_id == "broken"
    assert event.event_type == "intent_end"
    assert event.raw_event == {"raw": "{not-json}"}


def test_model_rebuild_calls_are_idempotent() -> None:
    models.IntentEventRecord.model_rebuild()
    models.LoggedIntentEvent.model_rebuild()
    models.IntentEventListResponse.model_rebuild()
