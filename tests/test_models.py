from __future__ import annotations

from datetime import datetime, timezone

from custom_components.intentsity import models


def test_intent_end_from_payload_handles_string_json() -> None:
    timestamp = datetime.now(timezone.utc)
    payload = {"processed_locally": True, "intent_output": {"speech": "hi"}}

    record = models.IntentEndRecord.from_payload("run-1", timestamp, payload)

    assert record.run_id == "run-1"
    assert record.processed_locally is True
    assert record.intent_output["speech"] == "hi"


def test_intent_progress_from_payload_parses_delta() -> None:
    timestamp = datetime.now(timezone.utc)
    payload = {"chat_log_delta": {"role": "assistant", "content": "Hi"}, "tts_start_streaming": True}

    record = models.IntentProgressRecord.from_payload("run-1", timestamp, payload)

    assert record.chat_log_delta == {"role": "assistant", "content": "Hi"}
    assert record.tts_start_streaming is True


def test_pipeline_run_record_defaults_lists() -> None:
    record = models.PipelineRunRecord(
        run_id="r-1",
        created_at=datetime.now(timezone.utc),
    )

    assert record.intent_starts == []
    assert record.intent_progress == []
    assert record.intent_ends == []
