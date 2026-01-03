"""Validators for the config flow steps."""

from __future__ import annotations

from custom_components.intentsity.api import (
    IntentsityApiClient,
    IntentsityApiClientAuthenticationError,
    IntentsityApiClientCommunicationError,
)
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError
from homeassistant.helpers.aiohttp_client import async_get_clientsession


class InvalidAuth(HomeAssistantError):
    """Raised when authentication fails."""


class CannotConnect(HomeAssistantError):
    """Raised when connection to the API fails."""


async def validate_credentials(hass: HomeAssistant, username: str, password: str) -> bool:
    """Validate credentials by attempting a test API call.

    This uses a temporary IntentsityApiClient instance to call `async_get_data`.
    It raises InvalidAuth on auth failure and CannotConnect on communication errors.
    """
    client = IntentsityApiClient(username=username, password=password, session=async_get_clientsession(hass))
    try:
        await client.async_get_data()
    except IntentsityApiClientAuthenticationError as exc:
        raise InvalidAuth from exc
    except IntentsityApiClientCommunicationError as exc:
        raise CannotConnect from exc
    return True
