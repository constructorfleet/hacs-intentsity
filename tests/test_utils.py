from __future__ import annotations

from datetime import datetime, timezone

from custom_components.intentsity import utils


def test_parse_timestamp_passthrough() -> None:
    now = datetime.now(timezone.utc)
    parsed = utils.parse_timestamp(now)
    assert parsed is now


def test_parse_timestamp_iso_string() -> None:
    parsed = utils.parse_timestamp("2026-01-01T00:00:00")
    assert parsed.tzinfo == timezone.utc
    assert parsed.isoformat() == "2026-01-01T00:00:00+00:00"


def test_parse_timestamp_fallbacks() -> None:
    before = datetime.now(timezone.utc)
    parsed = utils.parse_timestamp("not-a-date")
    after = datetime.now(timezone.utc)
    assert before <= parsed <= after
    assert parsed.tzinfo == timezone.utc

    before = datetime.now(timezone.utc)
    parsed = utils.parse_timestamp(1234)
    after = datetime.now(timezone.utc)
    assert before <= parsed <= after
    assert parsed.tzinfo == timezone.utc
