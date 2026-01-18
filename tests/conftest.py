from __future__ import annotations

import sys
from pathlib import Path

import pytest

ROOT_PATH = Path(__file__).resolve().parents[1]
if str(ROOT_PATH) not in sys.path:
    sys.path.insert(0, str(ROOT_PATH))

STUB_PATH = ROOT_PATH / "tests" / "stubs"
if str(STUB_PATH) not in sys.path:
    sys.path.insert(0, str(STUB_PATH))

from homeassistant.core import HomeAssistant  # noqa: E402  pylint: disable=C0413


@pytest.fixture
def hass(tmp_path: Path) -> HomeAssistant:
    instance = HomeAssistant(tmp_path)
    try:
        yield instance
    finally:
        domain_data = instance.data.get("intentsity")
        engine = domain_data.pop("engine", None) if isinstance(domain_data, dict) else None
        if engine is not None:
            engine.dispose()
