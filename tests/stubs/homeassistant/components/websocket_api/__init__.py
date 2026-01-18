from __future__ import annotations

from typing import Any, Callable

import voluptuous as vol

CommandHandler = Callable[[Any, "ActiveConnection", dict], None]


def websocket_command(schema: vol.Schema | dict) -> Callable[[CommandHandler], CommandHandler]:
    def decorator(func: CommandHandler) -> CommandHandler:
        func.websocket_schema = schema  # type: ignore[attr-defined]
        return func

    return decorator


def async_register_command(hass: Any, handler: CommandHandler) -> None:
    hass.data.setdefault("__websocket_commands__", []).append(handler)


def event_message(request_id: int, event: dict) -> dict:
    return {
        "id": request_id,
        "type": "event",
        "event": event,
    }


def result_message(request_id: int, result: dict | None = None) -> dict:
    return {
        "id": request_id,
        "type": "result",
        "success": True,
        "result": result,
    }


class ActiveConnection:
    def __init__(self) -> None:
        self.subscriptions: dict[int, Callable[[], None]] = {}
        self.sent_results: list[dict] = []
        self.sent_events: list[dict] = []

    def send_result(self, request_id: int, result: dict | None = None) -> None:
        self.sent_results.append(result_message(request_id, result))

    def send_message(self, message: dict) -> None:
        if message.get("type") == "event":
            self.sent_events.append(message)
        else:
            self.sent_results.append(message)
