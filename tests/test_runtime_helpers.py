from __future__ import annotations

from datetime import datetime, timezone
from types import SimpleNamespace
from typing import Any, cast

from custom_components import intentsity as runtime
from homeassistant.components.assist_pipeline.pipeline import PipelineEvent, PipelineEventType


class _EventStub:
    def __init__(self, data):
        self.data = data


def test_resolve_run_id_prefers_attributes() -> None:
    run = cast(runtime.PipelineRun, SimpleNamespace(id="abc", run_id="fallback"))
    assert runtime._resolve_run_id(run) == "abc"

    run2 = cast(runtime.PipelineRun, SimpleNamespace(run_id=55))
    assert runtime._resolve_run_id(run2) == "55"

    run3 = cast(runtime.PipelineRun, SimpleNamespace())
    assert runtime._resolve_run_id(run3) == "unknown"


def test_ensure_run_created_at_memoizes() -> None:
    domain_data: dict[str, Any] = {}
    first = runtime._ensure_run_created_at(domain_data, "run-1")
    second = runtime._ensure_run_created_at(domain_data, "run-1")

    assert first == second
    assert domain_data[runtime.DATA_RUN_CREATED_AT]["run-1"] == first


def test_event_payload_handles_mapping_and_objects() -> None:
    mapping_event = cast(runtime.PipelineEvent, _EventStub({"foo": "bar"}))
    assert runtime._event_payload(mapping_event) == {"foo": "bar"}

    payload_obj = SimpleNamespace(alpha=1)
    object_event = cast(runtime.PipelineEvent, _EventStub(payload_obj))
    assert runtime._event_payload(object_event) == {"alpha": 1}

    empty_event = cast(runtime.PipelineEvent, _EventStub(None))
    assert runtime._event_payload(empty_event) == {}


def test_intent_progress_from_event_filters_payload() -> None:
    run_id = "run-progress"

    event_empty = PipelineEvent(PipelineEventType.INTENT_PROGRESS, None)
    assert runtime._intent_progress_from_event(run_id, event_empty) is None

    event_missing = PipelineEvent(PipelineEventType.INTENT_PROGRESS, {"other": True})
    assert runtime._intent_progress_from_event(run_id, event_missing) is None

    event_valid = PipelineEvent(
        PipelineEventType.INTENT_PROGRESS,
        {"chat_log_delta": {"content": "hi"}, "tts_start_streaming": True},
    )
    record = runtime._intent_progress_from_event(run_id, event_valid)
    assert record is not None
    assert record.chat_log_delta == {"content": "hi"}
    assert record.tts_start_streaming is True


def test_intent_start_from_event_none_for_empty_payload() -> None:
    event = PipelineEvent(PipelineEventType.INTENT_START, None)
    assert runtime._intent_start_from_event("run", event) is None

    record = runtime._intent_start_from_event(
        "run",
        PipelineEvent(PipelineEventType.INTENT_START, {"intent_input": "hello"}),
    )
    assert record is not None
    assert record.intent_input == "hello"


def test_intent_end_from_event_serializes_payload() -> None:
    event = PipelineEvent(PipelineEventType.INTENT_END, {"processed_locally": True})
    record = runtime._intent_end_from_event("run", event)
    assert record is not None
    assert record.processed_locally is True


def test_extract_pipeline_metadata_merges_sources() -> None:
    pipeline = SimpleNamespace(
        conversation_engine="conv",
        language="en",
        name="Pipe",
        prefer_local_intents=True,
    )
    run = cast(runtime.PipelineRun, SimpleNamespace(pipeline=pipeline, language="fr"))

    metadata = runtime._extract_pipeline_metadata(run)

    assert metadata["conversation_engine"] == "conv"
    assert metadata["language"] == "en"
    assert metadata["prefer_local_intents"] is True