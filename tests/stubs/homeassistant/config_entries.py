from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Dict, List


ConfigFlowResult = Dict[str, Any]


@dataclass(slots=True)
class ConfigEntry:
    entry_id: str = "intentsity"
    data: Dict[str, Any] | None = None


class ConfigFlow:
    """Minimal stand-in for Home Assistant's ConfigFlow."""

    VERSION = 1
    domain = ""

    def __init__(self) -> None:
        self.hass = None
        self._entries: List[ConfigEntry] = []
        self._unique_id: str | None = None

    def __init_subclass__(cls, **kwargs: Any) -> None:  # type: ignore[override]
        domain = kwargs.pop("domain", None)
        if domain is not None:
            cls.domain = domain
        super().__init_subclass__(**kwargs)

    def _async_current_entries(self) -> List[ConfigEntry]:
        return list(self._entries)

    def _set_current_entries(self, entries: List[ConfigEntry]) -> None:
        self._entries = entries

    async def async_set_unique_id(self, unique_id: str) -> None:
        self._unique_id = unique_id

    def async_show_form(
        self,
        *,
        step_id: str,
        data_schema: Any,
        errors: Dict[str, str] | None = None,
    ) -> ConfigFlowResult:
        return {
            "type": "form",
            "step_id": step_id,
            "data_schema": data_schema,
            "errors": errors or {},
        }

    def async_create_entry(
        self,
        *,
        title: str,
        data: Dict[str, Any],
    ) -> ConfigFlowResult:
        entry = ConfigEntry(entry_id=title.lower().replace(" ", "-"), data=data)
        self._entries.append(entry)
        return {
            "type": "create_entry",
            "title": title,
            "data": data,
            "entry": entry,
        }

    def async_abort(self, *, reason: str) -> ConfigFlowResult:
        return {"type": "abort", "reason": reason}
