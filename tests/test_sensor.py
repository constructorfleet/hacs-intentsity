from __future__ import annotations

from typing import Any

import pytest
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from custom_components.intentsity.const import COORDINATOR_KEY, DOMAIN
from custom_components.intentsity.sensor import UncorrectedChatsSensor, async_setup_entry


@pytest.mark.asyncio
async def test_uncorrected_chats_sensor_value(hass) -> None:
    coordinator = DataUpdateCoordinator(
        hass,
        logger=None,
        config_entry=None,
        name="intentsity",
        update_method=None,
    )
    coordinator.data = {"uncorrected_count": 4}
    sensor = UncorrectedChatsSensor(coordinator)
    assert sensor.native_value == 4


@pytest.mark.asyncio
async def test_async_setup_entry_adds_entity(hass) -> None:
    coordinator = DataUpdateCoordinator(
        hass,
        logger=None,
        config_entry=None,
        name="intentsity",
        update_method=None,
    )
    coordinator.data = {"uncorrected_count": 1}
    hass.data.setdefault(DOMAIN, {})[COORDINATOR_KEY] = coordinator

    added: list[Any] = []

    def _add_entities(entities, update_before_add: bool = False) -> None:
        added.extend(entities)

    await async_setup_entry(hass, None, _add_entities)

    assert len(added) == 1
    assert isinstance(added[0], UncorrectedChatsSensor)
