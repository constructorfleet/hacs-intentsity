from __future__ import annotations

import asyncio
from pathlib import Path
from typing import Any, Callable


class _Config:
    def __init__(self, base_path: Path) -> None:
        self._base_path = Path(base_path)

    def path(self, relative: str) -> str:
        return str(self._base_path / relative)


class _Logger:
    def __init__(self) -> None:
        self.messages: list[tuple[str, str]] = []

    def info(self, message: str, *args: Any) -> None:
        self.messages.append(("info", message % args if args else message))

    def warning(self, message: str, *args: Any) -> None:
        self.messages.append(("warning", message % args if args else message))


class _Http:
    def __init__(self) -> None:
        self.views: list[Any] = []

    def register_view(self, view: Any) -> None:
        self.views.append(view)


class HomeAssistant:
    def __init__(self, base_path: Path) -> None:
        self.config = _Config(base_path)
        self.http = _Http()
        self.data: dict[str, Any] = {}
        self.logger = _Logger()

    async def async_add_executor_job(
        self, func: Callable[..., Any], *args: Any
    ) -> Any:
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(None, func, *args)
