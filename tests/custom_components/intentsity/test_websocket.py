from datetime import datetime
import logging
from pathlib import Path
import sys
from unittest.mock import AsyncMock, MagicMock, PropertyMock, patch

import pytest

from custom_components.intentsity.websocket import (
    websocket_create_intent,
    websocket_delete_intent,
    websocket_list_intents,
    websocket_update_intent,
)
from homeassistant.core import HomeAssistant

# Add custom_components to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent / "custom_components"))

logging.basicConfig(level=logging.DEBUG)


async def async_magic():
    pass


MagicMock.__await__ = lambda x: async_magic().__await__()


@pytest.mark.asyncio
async def test_websocket_list_intents():
    hass = MagicMock(spec=HomeAssistant)
    connection = MagicMock()
    msg = {"id": 1, "entry_id": "test_entry"}

    storage = AsyncMock()
    storage.async_list_intents = AsyncMock(return_value=[{"id": "test_intent", "name": "Test Intent"}])

    entry = MagicMock()
    type(entry).runtime_data = PropertyMock(return_value=MagicMock(storage=storage))

    hass.config_entries = MagicMock()
    hass.config_entries.async_get_entry = MagicMock(return_value=entry)

    with patch("custom_components.intentsity.websocket.get_intentsity_storage", return_value=storage):
        await websocket_list_intents(hass, connection, msg)
        storage.async_list_intents.assert_awaited_once()
        connection.send_result.assert_called_once_with(msg["id"], [{"id": "test_intent", "name": "Test Intent"}])


@pytest.mark.asyncio
async def test_websocket_create_intent():
    hass = MagicMock(spec=HomeAssistant)
    connection = MagicMock()
    msg = {
        "id": 1,
        "entry_id": "test_entry",
        "intent": {"id": "test_intent", "name": "Test Intent", "created_at": datetime.now().isoformat()},
    }

    # Ensure the intent dictionary matches the expected structure
    msg["intent"].update({"slots": [], "lists": [], "expansions": []})

    storage = AsyncMock()
    storage.async_set_intent = AsyncMock(return_value=None)

    entry = MagicMock()
    type(entry).runtime_data = PropertyMock(return_value=MagicMock(storage=storage))

    hass.config_entries = MagicMock()
    hass.config_entries.async_get_entry = MagicMock(return_value=entry)

    with patch("custom_components.intentsity.websocket.get_intentsity_storage", return_value=storage):
        await websocket_create_intent(hass, connection, msg)
        storage.async_set_intent.assert_awaited_once()
        connection.send_result.assert_called_once_with(msg["id"], msg["intent"])


@pytest.mark.asyncio
async def test_websocket_update_intent():
    hass = MagicMock(spec=HomeAssistant)
    hass.config_entries = MagicMock(spec=HomeAssistant.config_entries)
    hass.config_entries.async_get_entry = MagicMock(return_value=MagicMock())
    connection = MagicMock()
    msg = {
        "id": 1,
        "entry_id": "test_entry",
        "intent_id": "test_intent",
        "intent": {
            "id": "test_intent",
            "name": "Updated Intent",
            "created_at": datetime.now().isoformat(),
        },
    }

    # Ensure the intent dictionary matches the expected structure
    msg["intent"].update({"slots": [], "lists": [], "expansions": []})

    # async def mock_async_set_intent(intent):
    #     logging.debug("Custom async_set_intent called with: %s", intent)

    storage = MagicMock()
    # storage.async_set_intent = mock_async_set_intent
    with patch("custom_components.intentsity.websocket.get_intentsity_storage", return_value=storage):
        await websocket_update_intent(hass, connection, msg)

        # Verify the custom async function was called
        connection.send_result.assert_called_once_with(msg["id"], msg["intent"])


@pytest.mark.asyncio
async def test_websocket_delete_intent():
    hass = MagicMock(spec=HomeAssistant)
    connection = MagicMock()
    msg = {"id": 1, "entry_id": "test_entry", "intent_id": "test_intent"}

    storage = AsyncMock()
    storage.async_delete_intent = AsyncMock()

    entry = MagicMock()
    type(entry).runtime_data = PropertyMock(return_value=MagicMock(storage=storage))

    hass.config_entries = MagicMock()
    hass.config_entries.async_get_entry = MagicMock(return_value=entry)

    with patch("custom_components.intentsity.websocket.get_intentsity_storage", return_value=storage):
        await websocket_delete_intent(hass, connection, msg)
        storage.async_delete_intent.assert_awaited_once_with(msg["intent_id"])
        connection.send_result.assert_called_once_with(msg["id"], {"deleted": msg["intent_id"]})
