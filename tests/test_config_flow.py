from __future__ import annotations

import pytest

from custom_components.intentsity import config_flow
from homeassistant import config_entries


@pytest.mark.asyncio
async def test_user_flow_creates_entry(hass):
	flow = config_flow.IntentsityConfigFlow()
	flow.hass = hass

	form = await flow.async_step_user()
	assert form["type"] == "form"

	result = await flow.async_step_user({})
	assert result["type"] == "create_entry"
	assert result["title"] == "Intentsity"
	assert result["data"] == {}


@pytest.mark.asyncio
async def test_user_flow_single_instance_abort(hass):
	flow = config_flow.IntentsityConfigFlow()
	flow.hass = hass
	flow._set_current_entries([config_entries.ConfigEntry()])

	result = await flow.async_step_user()
	assert result == {"type": "abort", "reason": "single_instance_allowed"}


@pytest.mark.asyncio
async def test_import_step_respects_single_instance(hass):
	flow = config_flow.IntentsityConfigFlow()
	flow.hass = hass

	result = await flow.async_step_import({})
	assert result["type"] == "create_entry"

	flow2 = config_flow.IntentsityConfigFlow()
	flow2.hass = hass
	flow2._set_current_entries([config_entries.ConfigEntry()])

	abort = await flow2.async_step_import({})
	assert abort == {"type": "abort", "reason": "single_instance_allowed"}
