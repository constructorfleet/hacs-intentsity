from pathlib import Path
import sys
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from custom_components.intentsity.service_actions.intents import (
    async_handle_create_intent,
    async_handle_delete_intent,
    async_handle_export_intents,
    async_handle_import_intents,
    async_handle_update_intent,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.service import ServiceCall

# Add custom_components to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent / "custom_components"))


@pytest.mark.asyncio
async def test_async_handle_create_intent():
    hass = MagicMock(spec=HomeAssistant)
    entry = MagicMock()
    call = MagicMock(spec=ServiceCall)

    call.data = {"id": "test_intent", "name": "Test Intent"}

    await async_handle_create_intent(hass, entry, call)
    # Add assertions to verify behavior


@pytest.mark.asyncio
async def test_async_handle_update_intent():
    hass = MagicMock(spec=HomeAssistant)
    entry = MagicMock()
    call = MagicMock(spec=ServiceCall)

    call.data = {"id": "test_intent", "name": "Updated Intent"}

    await async_handle_update_intent(hass, entry, call)
    # Add assertions to verify behavior


@pytest.mark.asyncio
async def test_async_handle_delete_intent():
    hass = MagicMock(spec=HomeAssistant)
    entry = MagicMock()
    call = MagicMock(spec=ServiceCall)

    call.data = {"id": "test_intent"}

    await async_handle_delete_intent(hass, entry, call)
    # Add assertions to verify behavior


@pytest.mark.asyncio
async def test_async_handle_export_intents():
    hass = MagicMock(spec=HomeAssistant)
    entry = MagicMock()
    call = MagicMock(spec=ServiceCall)

    # Mock the storage and its async method
    storage = AsyncMock()
    storage.async_list_intents = AsyncMock(return_value=[])

    # Patch the storage retrieval function
    with patch("custom_components.intentsity.service_actions.intents.get_intentsity_storage", return_value=storage):
        await async_handle_export_intents(hass, entry, call)
        # Add assertions to verify behavior


@pytest.mark.asyncio
async def test_async_handle_import_intents():
    hass = MagicMock(spec=HomeAssistant)
    entry = MagicMock()
    call = MagicMock(spec=ServiceCall)

    call.data = {"intents": []}

    await async_handle_import_intents(hass, entry, call)
    # Add assertions to verify behavior
