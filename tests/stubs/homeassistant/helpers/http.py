from __future__ import annotations

from typing import Any


class HomeAssistantView:
    url: str = ""
    name: str = ""
    requires_auth: bool = True

    def json(self, data: dict[str, Any]) -> dict[str, Any]:
        return data
