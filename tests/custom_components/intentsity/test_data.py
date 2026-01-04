"""
Test cases for the data module in the Intentsity integration.
"""

from pathlib import Path
import sys
from unittest.mock import AsyncMock, MagicMock

import pytest

from custom_components.intentsity.data import IntentsityStorage, validate_intent_payload

# Add custom_components to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent.parent / "custom_components"))


@pytest.fixture
def mock_storage(hass):
    """Fixture to create a mock IntentsityStorage instance."""
    return IntentsityStorage(hass, "test_entry_id")


@pytest.mark.asyncio
async def test_async_load_intents(mock_storage):
    """Test loading intents from storage."""
    mock_storage.async_load = AsyncMock(return_value={"__root__": {"intent1": {"name": "Test Intent"}}})
    intents = await mock_storage.async_load_intents()
    assert intents == {"intent1": {"name": "Test Intent"}}


@pytest.mark.asyncio
async def test_async_save_intents(mock_storage):
    """Test saving intents to storage."""
    mock_storage.async_save = AsyncMock()
    intents = {"intent1": {"name": "Test Intent"}}
    await mock_storage.async_save_intents(intents)
    mock_storage.async_save.assert_called_once_with({"__root__": intents})


@pytest.mark.asyncio
async def test_async_get_intent(mock_storage):
    """Test retrieving a specific intent by ID."""
    mock_storage.async_load_intents = AsyncMock(return_value={"intent1": {"name": "Test Intent"}})
    intent = await mock_storage.async_get_intent("intent1")
    assert intent == {"name": "Test Intent"}


@pytest.mark.asyncio
async def test_async_set_intent(mock_storage):
    """Test saving or updating an intent in storage."""
    mock_storage.async_load_intents = AsyncMock(return_value={})
    mock_storage.async_save_intents = AsyncMock()
    intent = MagicMock(id="intent1", to_dict=MagicMock(return_value={"name": "Test Intent"}))
    await mock_storage.async_set_intent(intent)
    mock_storage.async_save_intents.assert_called_once_with({"intent1": {"name": "Test Intent"}})


@pytest.mark.asyncio
async def test_async_delete_intent(mock_storage):
    """Test deleting an intent by ID."""
    mock_storage.async_load_intents = AsyncMock(return_value={"intent1": {"name": "Test Intent"}})
    mock_storage.async_save_intents = AsyncMock()
    await mock_storage.async_delete_intent("intent1")
    mock_storage.async_save_intents.assert_called_once_with({})


@pytest.mark.asyncio
async def test_async_list_intents(mock_storage):
    """Test listing all intents in storage."""
    mock_storage.async_load_intents = AsyncMock(
        return_value={
            "intent1": {
                "id": "intent1",
                "name": "Test Intent",
                "created_at": "2023-01-01T00:00:00Z",
                "slots": [],
                "lists": [],
                "expansions": [],
            }
        }
    )
    intents = await mock_storage.async_list_intents()
    assert len(intents) == 1
    assert intents[0].id == "intent1"
    assert intents[0].name == "Test Intent"


def test_validate_intent_payload():
    """Test validating an intent payload."""
    payload = {
        "id": "test_id",
        "name": "Test Intent",
        "created_at": "2023-01-01T00:00:00Z",
    }
    intent = validate_intent_payload(payload)
    assert intent.name == "Test Intent"

    with pytest.raises(TypeError):
        validate_intent_payload([])

    with pytest.raises(ValueError):
        validate_intent_payload({})
