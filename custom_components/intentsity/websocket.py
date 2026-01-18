from __future__ import annotations

import json
from typing import Any

import voluptuous as vol

from homeassistant.components import websocket_api
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.dispatcher import async_dispatcher_connect, async_dispatcher_send

from .const import (
    DEFAULT_EVENT_LIMIT,
    MAX_EVENT_LIMIT,
    MIN_EVENT_LIMIT,
    SIGNAL_EVENT_RECORDED,
    WS_CMD_LIST_EVENTS,
    WS_CMD_SAVE_REVIEW,
    WS_CMD_SUBSCRIBE_EVENTS,
)
from .db import fetch_recent_runs, save_review
from .models import (
    ExpectedIntentEndRecord,
    ExpectedIntentProgressRecord,
    IntentRunListResponse,
)

_EVENT_LIMIT_SCHEMA = vol.All(
    vol.Coerce(int),
    vol.Range(min=MIN_EVENT_LIMIT, max=MAX_EVENT_LIMIT),
)


_REVIEW_STEP_SCHEMA = vol.Schema(
    {
        vol.Optional("order_index", default=0): vol.Coerce(int),
        vol.Optional("kind", default="progress"): vol.In(["progress", "end"]),
        vol.Optional("chat_log_delta"): object,
        vol.Optional("tts_start_streaming"): vol.Any(bool, None),
        vol.Optional("intent_output"): object,
        vol.Optional("processed_locally"): vol.Any(bool, None),
    },
    extra=vol.ALLOW_EXTRA,
)


def async_register_commands(hass: HomeAssistant) -> None:
    """Register websocket commands for Intentsity."""

    websocket_api.async_register_command(hass, websocket_list_events)
    websocket_api.async_register_command(hass, websocket_subscribe_events)
    websocket_api.async_register_command(hass, websocket_save_review)


async def _async_fetch_payload(hass: HomeAssistant, limit: int) -> dict:
    runs = await hass.async_add_executor_job(fetch_recent_runs, hass, limit)
    if isinstance(runs, IntentRunListResponse):
        return runs.model_dump(mode="json")
    return IntentRunListResponse(runs=runs).model_dump(mode="json")


async def _async_send_result(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    request_id: int,
    limit: int,
) -> None:
    payload = await _async_fetch_payload(hass, limit)
    connection.send_result(request_id, payload)


async def _async_send_event(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    request_id: int,
    limit: int,
) -> None:
    payload = await _async_fetch_payload(hass, limit)
    connection.send_message(websocket_api.event_message(request_id, payload))


def _parse_json_payload(value: Any) -> dict[str, Any] | list[Any] | None:
    if value is None:
        return None
    if isinstance(value, (dict, list)):
        return value
    if isinstance(value, str):
        data = value.strip()
        if not data:
            return None
        try:
            parsed = json.loads(data)
        except json.JSONDecodeError as err:  # pragma: no cover - defensive
            raise vol.Invalid(f"Invalid JSON payload: {err.msg}") from err
        if isinstance(parsed, (dict, list)):
            return parsed
        raise vol.Invalid("Expected JSON object or array")
    raise vol.Invalid("Expected mapping, array, or JSON string")


def _normalize_review_steps(
    raw_steps: list[dict[str, Any]],
) -> tuple[list[ExpectedIntentProgressRecord], ExpectedIntentEndRecord | None]:
    if not raw_steps:
        return [], None

    ordered_steps = sorted(raw_steps, key=lambda item: int(item.get("order_index", 0)))
    progress: list[ExpectedIntentProgressRecord] = []
    expected_end: ExpectedIntentEndRecord | None = None

    for idx, step in enumerate(ordered_steps):
        kind = (step.get("kind") or "progress").lower()
        is_last = idx == len(ordered_steps) - 1

        if kind == "end" or is_last:
            if expected_end is not None:
                raise vol.Invalid("Only one INTENT_END step is allowed")
            expected_end = ExpectedIntentEndRecord(
                order_index=idx,
                processed_locally=step.get("processed_locally"),
                intent_output=_parse_json_payload(step.get("intent_output")),
            )
            continue

        progress.append(
            ExpectedIntentProgressRecord(
                order_index=idx,
                chat_log_delta=_parse_json_payload(step.get("chat_log_delta")),
                tts_start_streaming=step.get("tts_start_streaming"),
            )
        )

    if expected_end is None:
        raise vol.Invalid("A review must include an INTENT_END step")

    return progress, expected_end


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_CMD_LIST_EVENTS,
        vol.Optional("limit", default=DEFAULT_EVENT_LIMIT): _EVENT_LIMIT_SCHEMA,
    }
)
@callback
def websocket_list_events(hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict) -> None:
    """Return a snapshot of recent intent events."""

    limit: int = msg["limit"]
    hass.async_create_task(_async_send_result(hass, connection, msg["id"], limit))


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_CMD_SUBSCRIBE_EVENTS,
        vol.Optional("limit", default=DEFAULT_EVENT_LIMIT): _EVENT_LIMIT_SCHEMA,
    }
)
@callback
def websocket_subscribe_events(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Subscribe to live intent event updates."""

    limit: int = msg["limit"]
    request_id: int = msg["id"]

    connection.send_result(request_id)

    async def _push_snapshot() -> None:
        await _async_send_event(hass, connection, request_id, limit)

    @callback
    def _handle_new_event(*_: object) -> None:
        hass.async_create_task(_push_snapshot())

    unsubscribe = async_dispatcher_connect(hass, SIGNAL_EVENT_RECORDED, _handle_new_event)

    connection.subscriptions[request_id] = unsubscribe
    hass.async_create_task(_push_snapshot())


@websocket_api.websocket_command(
    {
        vol.Required("type"): WS_CMD_SAVE_REVIEW,
        vol.Required("run_id"): str,
        vol.Optional("intent_start_id"): vol.Any(int, None),
        vol.Optional("matched_expectations"): vol.Any(bool, None),
        vol.Optional("steps", default=list): [
            _REVIEW_STEP_SCHEMA
        ],
    }
)
async def websocket_save_review(
    hass: HomeAssistant,
    connection: websocket_api.ActiveConnection,
    msg: dict,
) -> None:
    """Persist reviewer expectations for a pipeline run."""

    try:
        expected_progress, expected_end = _normalize_review_steps(msg.get("steps", []))
    except vol.Invalid as err:
        connection.send_error(msg["id"], "invalid_review", err.error_message)
        return

    matched_expectations = msg.get("matched_expectations")
    if matched_expectations is None:
        matched_expectations = bool(expected_end) and not expected_progress

    await hass.async_add_executor_job(
        save_review,
        hass,
        msg["run_id"],
        msg.get("intent_start_id"),
        matched_expectations,
        expected_progress,
        expected_end,
    )

    async_dispatcher_send(hass, SIGNAL_EVENT_RECORDED)
    connection.send_result(msg["id"], {"status": "saved"})
