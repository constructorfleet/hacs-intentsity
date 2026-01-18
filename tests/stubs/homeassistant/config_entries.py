from __future__ import annotations

from dataclasses import dataclass


@dataclass(slots=True)
class ConfigEntry:
    entry_id: str = "intentsity"
