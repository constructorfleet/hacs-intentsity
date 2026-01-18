from __future__ import annotations

import pytest
import voluptuous as vol

from custom_components.intentsity import websocket


def test_normalize_review_steps_parses_and_sorts_payloads() -> None:
    progress, end = websocket._normalize_review_steps(  # noqa: SLF001 - intentional helper coverage
        [
            {
                "order_index": 5,
                "kind": "progress",
                "chat_log_delta": '{"role": "assistant", "content": "hi"}',
                "tts_start_streaming": True,
            },
            {
                "order_index": 2,
                "kind": "progress",
                "chat_log_delta": {"role": "user", "content": "hello"},
            },
            {
                "order_index": 9,
                "kind": "end",
                "intent_output": '{"speech": "done"}',
                "processed_locally": False,
            },
        ]
    )

    assert len(progress) == 2
    assert progress[0].order_index == 0  # sorted order
    assert progress[0].chat_log_delta == {"role": "user", "content": "hello"}
    assert progress[1].order_index == 1
    assert progress[1].chat_log_delta == {"role": "assistant", "content": "hi"}
    assert progress[1].tts_start_streaming is True

    assert end is not None
    assert end.order_index == 2
    assert end.intent_output == {"speech": "done"}
    assert end.processed_locally is False


def test_normalize_review_steps_treats_last_item_as_end() -> None:
    _, end = websocket._normalize_review_steps(  # noqa: SLF001 - intentional helper coverage
        [
            {
                "order_index": 0,
                "kind": "progress",
                "chat_log_delta": {"role": "assistant", "content": "thinking"},
            },
            {
                "order_index": 1,
                "chat_log_delta": {"role": "assistant", "content": "final"},
            },
        ]
    )

    assert end is not None
    assert end.order_index == 1
    assert end.intent_output is None


def test_normalize_review_steps_requires_intent_end() -> None:
    with pytest.raises(vol.Invalid, match="INTENT_END"):
        websocket._normalize_review_steps([])  # noqa: SLF001 - intentional helper coverage


def test_normalize_review_steps_rejects_duplicate_intent_end() -> None:
    with pytest.raises(vol.Invalid, match="Only one INTENT_END"):
        websocket._normalize_review_steps(  # noqa: SLF001 - intentional helper coverage
            [
                {"order_index": 0, "kind": "end", "intent_output": {"speech": "first"}},
                {"order_index": 1, "kind": "end", "intent_output": {"speech": "second"}},
            ]
        )


def test_normalize_review_steps_validates_json_payloads() -> None:
    with pytest.raises(vol.Invalid, match="Invalid JSON payload"):
        websocket._normalize_review_steps(  # noqa: SLF001 - intentional helper coverage
            [
                {
                    "order_index": 0,
                    "kind": "end",
                    "intent_output": "{not-json}",
                }
            ]
        )
