from __future__ import annotations

import sys
from pathlib import Path

import pytest_asyncio

ROOT_PATH = Path(__file__).resolve().parents[1]
if str(ROOT_PATH) not in sys.path:
    sys.path.insert(0, str(ROOT_PATH))

from homeassistant.core import HomeAssistant  # noqa: E402  pylint: disable=C0413
from homeassistant.helpers import frame  # noqa: E402  pylint: disable=C0413

from custom_components.intentsity import db  # noqa: E402  pylint: disable=C0413


class _HttpStub:
    def __init__(self) -> None:
        self.views: list[object] = []

    def register_view(self, view: object) -> None:
        self.views.append(view)


@pytest_asyncio.fixture
async def hass(tmp_path: Path) -> HomeAssistant:
    instance = HomeAssistant(str(tmp_path))
    frame.async_setup(instance)
    instance.http = _HttpStub()
    try:
        yield instance
    finally:
        await instance.async_add_executor_job(db.dispose_client, instance)
        await instance.async_stop()
