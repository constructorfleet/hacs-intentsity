from __future__ import annotations

from dataclasses import dataclass
from enum import Enum
from types import SimpleNamespace
from typing import Any

from homeassistant.core import HomeAssistant


class PipelineEventType(str, Enum):
    INTENT_START = "intent_start"
    INTENT_END = "intent_end"
    OTHER = "other"


@dataclass(slots=True)
class PipelineEvent:
    type: PipelineEventType
    data: SimpleNamespace

    def __init__(self, event_type: PipelineEventType, data: dict[str, Any] | None = None) -> None:
        self.type = event_type
        self.data = SimpleNamespace(**(data or {}))

    def as_dict(self) -> dict[str, Any]:
        return {"type": self.type.value, "data": vars(self.data)}


class PipelineRun:
    def __init__(self, hass: HomeAssistant, run_id: str) -> None:
        self.hass = hass
        self.run_id = run_id

    async def process_event(self, event: PipelineEvent) -> None:
        self.hass.logger.info("processed %s", event.type.value)
