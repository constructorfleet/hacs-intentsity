from __future__ import annotations

import asyncio

import pytest

from custom_components import intentsity
from custom_components.intentsity.const import (
    COORDINATOR_KEY,
    DATA_API_REGISTERED,
    DATA_DB_INITIALIZED,
    DOMAIN,
)


@pytest.mark.asyncio
async def test_async_initialize_registers_api(hass, monkeypatch) -> None:
    flags: dict[str, object] = {}

    async def _register_static_paths(paths) -> None:
        flags["static_paths"] = paths

    def _init_db(_hass) -> None:
        flags["db"] = True

    def _register_commands(_hass) -> None:
        flags["ws"] = True

    def _register_panel(*args, **kwargs) -> None:
        flags["panel"] = kwargs.get("frontend_url_path")

    hass.http.async_register_static_paths = _register_static_paths

    monkeypatch.setattr(intentsity.db, "init_db", _init_db)
    monkeypatch.setattr(intentsity.websocket, "async_register_commands", _register_commands)
    monkeypatch.setattr(intentsity, "async_register_built_in_panel", _register_panel)
    monkeypatch.setattr(
        intentsity.IntentsityCoordinator,
        "async_config_entry_first_refresh",
        lambda self: asyncio.sleep(0),
    )

    await intentsity._async_initialize(hass)
    await asyncio.sleep(0)

    domain_data = hass.data[DOMAIN]
    assert domain_data[DATA_DB_INITIALIZED] is True
    assert domain_data[DATA_API_REGISTERED] is True
    assert COORDINATOR_KEY in domain_data
    assert flags["panel"] == "intentsity"

    flags.clear()
    await intentsity._async_initialize(hass)
    await asyncio.sleep(0)
    assert flags == {}


def test_intent_output_targets() -> None:
    assert intentsity._intent_output_targets({}) is None
    assert intentsity._intent_output_targets({"response": {}}) is None
    assert intentsity._intent_output_targets({"response": {"data": {}}}) is None
    assert intentsity._intent_output_targets({"response": {"data": {"targets": []}}}) is None

    payload = intentsity._intent_output_targets(
        {"response": {"data": {"targets": ["light.kitchen"], "success": [], "failed": []}}}
    )
    assert payload == {
        "targets": ["light.kitchen"],
        "success": [],
        "failed": [],
    }
