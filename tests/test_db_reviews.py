from __future__ import annotations

from datetime import datetime, timedelta, timezone

import pytest
from custom_components.intentsity import db
from custom_components.intentsity.models import (
    ExpectedIntentEndRecord,
    ExpectedIntentProgressRecord,
)
from homeassistant.core import HomeAssistant


def _setup_fresh_db(hass: HomeAssistant) -> None:
    db_path = db.get_db_path(hass)
    db_path.unlink(missing_ok=True)
    db.dispose_client(hass)
    db.init_db(hass)


def test_save_review_persists_expected_payloads(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    run_id = "db-review-1"
    db.upsert_pipeline_run(
        hass,
        run_id,
        {"created_at": datetime.now(timezone.utc), "name": "DB Review"},
    )

    progress = [
        ExpectedIntentProgressRecord(order_index=2, chat_log_delta={"text": "later"}),
        ExpectedIntentProgressRecord(order_index=1, chat_log_delta={"text": "first"}, tts_start_streaming=True),
    ]
    expected_end = ExpectedIntentEndRecord(
        order_index=9,
        processed_locally=True,
        intent_output={"speech": "done"},
    )

    db.save_review(hass, run_id, intent_start_id=42, matched_expectations=True, expected_progress=progress, expected_end=expected_end)

    run = db.fetch_recent_runs(hass, 1).runs[0]
    assert run.review is not None
    assert run.review.intent_start_id == 42
    assert run.review.matched_expectations is True
    assert [step.order_index for step in run.review.expected_progress] == [1, 2]
    assert run.review.expected_progress[0].chat_log_delta == {"text": "first"}
    assert run.review.expected_progress[0].tts_start_streaming is True
    assert run.review.expected_end is not None
    assert run.review.expected_end.intent_output == {"speech": "done"}
    assert run.review.expected_end.processed_locally is True


def test_save_review_replaces_existing_rows(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    run_id = "db-review-2"
    db.upsert_pipeline_run(
        hass,
        run_id,
        {"created_at": datetime.now(timezone.utc), "name": "DB Update"},
    )

    db.save_review(
        hass,
        run_id,
        intent_start_id=None,
        matched_expectations=False,
        expected_progress=[
            ExpectedIntentProgressRecord(order_index=0, chat_log_delta={"step": "original"}),
        ],
        expected_end=ExpectedIntentEndRecord(order_index=1, processed_locally=False, intent_output={"speech": "old"}),
    )

    db.save_review(
        hass,
        run_id,
        intent_start_id=7,
        matched_expectations=True,
        expected_progress=[
            ExpectedIntentProgressRecord(order_index=5, chat_log_delta={"step": "new"}),
            ExpectedIntentProgressRecord(order_index=1, chat_log_delta={"step": "insert"}),
        ],
        expected_end=ExpectedIntentEndRecord(order_index=6, processed_locally=True, intent_output=None),
    )

    run = db.fetch_recent_runs(hass, 1).runs[0]
    assert run.review is not None
    assert run.review.intent_start_id == 7
    assert run.review.matched_expectations is True
    assert [step.chat_log_delta for step in run.review.expected_progress] == [
        {"step": "insert"},
        {"step": "new"},
    ]
    assert run.review.expected_end is not None
    assert run.review.expected_end.intent_output is None
    assert run.review.expected_end.processed_locally is True


def test_fetch_recent_runs_orders_desc_and_limits(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)
    base = datetime(2025, 1, 1, tzinfo=timezone.utc)
    for idx in range(3):
        run_id = f"run-{idx}"
        db.upsert_pipeline_run(
            hass,
            run_id,
            {
                "created_at": base + timedelta(minutes=idx),
                "name": f"Run {idx}",
            },
        )

    runs = db.fetch_recent_runs(hass, 2).runs
    assert [run.run_id for run in runs] == ["run-2", "run-1"]
    assert [run.name for run in runs] == ["Run 2", "Run 1"]


def test_save_review_requires_existing_run(hass: HomeAssistant) -> None:
    _setup_fresh_db(hass)

    with pytest.raises(ValueError):
        db.save_review(
            hass,
            "missing-run",
            intent_start_id=None,
            matched_expectations=False,
            expected_progress=[],
            expected_end=None,
        )