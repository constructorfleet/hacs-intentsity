"""
Tests for Intentsity websocket API handlers.
"""

import pytest

import custom_components.intentsity.websocket as ws


@pytest.mark.asyncio
async def test_websocket_list_intents_handler_exists():
    """Test that the websocket_list_intents handler exists and is callable."""
    assert hasattr(ws, "websocket_list_intents")
    handler = ws.websocket_list_intents
    assert callable(handler)


@pytest.mark.asyncio
async def test_websocket_create_intent_handler_exists():
    """Test that the websocket_create_intent handler exists and is callable."""
    assert hasattr(ws, "websocket_create_intent")
    handler = ws.websocket_create_intent
    assert callable(handler)
