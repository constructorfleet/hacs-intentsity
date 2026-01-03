"""
API Client for intentsity.

This module provides the API client for communicating with external services.
It demonstrates proper error handling, authentication patterns, and async operations.

For more information on creating API clients:
https://developers.home-assistant.io/docs/api_lib_index
"""

from __future__ import annotations

import asyncio
import socket
from typing import TYPE_CHECKING, Any

import aiohttp

if TYPE_CHECKING:
    from custom_components.intentsity.coordinator import IntentsCoordinator


class IntentsityApiClientError(Exception):
    """Base exception to indicate a general API error."""


class IntentsityApiClientCommunicationError(
    IntentsityApiClientError,
):
    """Exception to indicate a communication error with the API."""


class IntentsityApiClientAuthenticationError(
    IntentsityApiClientError,
):
    """Exception to indicate an authentication error with the API."""


def _verify_response_or_raise(response: aiohttp.ClientResponse) -> None:
    """
    Verify that the API response is valid.

    Raises appropriate exceptions for authentication and HTTP errors.

    Args:
        response: The aiohttp ClientResponse to verify.

    Raises:
        IntentsityApiClientAuthenticationError: For 401/403 errors.
        aiohttp.ClientResponseError: For other HTTP errors.

    """
    if response.status in (401, 403):
        msg = "Invalid credentials"
        raise IntentsityApiClientAuthenticationError(
            msg,
        )
    response.raise_for_status()


class IntentsityApiClient:
    """
    API Client for Smart Air Purifier integration.

    This client demonstrates authentication and API communication patterns
    for Home Assistant integrations. It handles HTTP requests, error handling,
    and credential management.

    The username and password are stored and would be used for:
    - HTTP Basic Auth headers
    - OAuth token exchange
    - API key generation
    - Session token management

    Note: JSONPlaceholder is used as a demo endpoint and doesn't require auth.
    In production, replace with your actual API endpoint that validates credentials.

    For more information on API clients:
    https://developers.home-assistant.io/docs/api_lib_index

    Attributes:
        _username: The username for API authentication.
        _password: The password for API authentication.
        _session: The aiohttp ClientSession for making requests.

    """

    def __init__(
        self,
        username: str,
        password: str,
        session: aiohttp.ClientSession,
    ) -> None:
        """
        Initialize the API Client with credentials.

        Args:
            username: The username for authentication from config flow.
            password: The password for authentication from config flow.
            session: The aiohttp ClientSession to use for requests.

        """
        self._username = username
        self._password = password
        self._session = session
        # Optional runtime reference to intents coordinator (injected by integration)
        self.intents_coordinator: IntentsCoordinator | None = None

    async def async_get_data(self) -> Any:
        """
        Get data from the API.

        This method fetches the current state and sensor data from the device.
        It demonstrates where credentials would be used in production:
        - Authorization headers (Basic Auth, Bearer Token)
        - Query parameters (username, api_key)
        - Session cookies (after login)

        Returns:
            A dictionary containing the device data.

        Raises:
            IntentsityApiClientAuthenticationError: If authentication fails.
            IntentsityApiClientCommunicationError: If communication fails.
            IntentsityApiClientError: For other API errors.

        """
        # In production: Use username/password for authentication
        # Example patterns:
        # 1. Basic Auth: auth=aiohttp.BasicAuth(self._username, self._password)
        # 2. Token: headers={"Authorization": f"Bearer {self._get_token()}"}
        # 3. API Key: params={"username": self._username, "key": self._password}

        return await self._api_wrapper(
            method="get",
            url="https://jsonplaceholder.typicode.com/posts/1",
            # For demo purposes with JSONPlaceholder (no auth required)
            # In production, add authentication here
        )

    async def async_set_fan_speed(self, speed: str) -> Any:
        """
        Set the fan speed on the device.

        Args:
            speed: The fan speed to set (low, medium, high, auto).

        Returns:
            A dictionary containing the API response.

        Raises:
            IntentsityApiClientAuthenticationError: If authentication fails.
            IntentsityApiClientCommunicationError: If communication fails.
            IntentsityApiClientError: For other API errors.

        """
        # In production: Send authenticated request to change fan speed
        return await self._api_wrapper(
            method="patch",
            url="https://jsonplaceholder.typicode.com/posts/1",
            data={"fan_speed": speed, "user": self._username},
            headers={"Content-type": "application/json; charset=UTF-8"},
        )

    async def async_set_target_humidity(self, humidity: int) -> Any:
        """
        Set the target humidity on the device.

        Args:
            humidity: The target humidity percentage (30-80).

        Returns:
            A dictionary containing the API response.

        Raises:
            IntentsityApiClientAuthenticationError: If authentication fails.
            IntentsityApiClientCommunicationError: If communication fails.
            IntentsityApiClientError: For other API errors.

        """
        # In production: Send authenticated request to change humidity setting
        return await self._api_wrapper(
            method="patch",
            url="https://jsonplaceholder.typicode.com/posts/1",
            data={"target_humidity": humidity, "user": self._username},
            headers={"Content-type": "application/json; charset=UTF-8"},
        )

    async def _api_wrapper(
        self,
        method: str,
        url: str,
        data: dict | None = None,
        headers: dict | None = None,
    ) -> Any:
        """
        Wrapper for API requests with error handling.

        This method handles all HTTP requests and translates exceptions
        into integration-specific exceptions.

        Args:
            method: The HTTP method (get, post, patch, etc.).
            url: The URL to request.
            data: Optional data to send in the request body.
            headers: Optional headers to include in the request.

        Returns:
            The JSON response from the API.

        Raises:
            IntentsityApiClientAuthenticationError: If authentication fails.
            IntentsityApiClientCommunicationError: If communication fails.
            IntentsityApiClientError: For other API errors.

        """
        try:
            async with asyncio.timeout(10):
                response = await self._session.request(
                    method=method,
                    url=url,
                    headers=headers,
                    json=data,
                )
                _verify_response_or_raise(response)
                return await response.json()

        except TimeoutError as exception:
            msg = f"Timeout error fetching information - {exception}"
            raise IntentsityApiClientCommunicationError(
                msg,
            ) from exception
        except (aiohttp.ClientError, socket.gaierror) as exception:
            msg = f"Error fetching information - {exception}"
            raise IntentsityApiClientCommunicationError(
                msg,
            ) from exception
        except Exception as exception:
            msg = f"Something really wrong happened! - {exception}"
            raise IntentsityApiClientError(
                msg,
            ) from exception

    # ---- Intents persistence helpers (thin wrapper) ----
    async def async_list_intents(self) -> list[dict]:
        """List persisted intents via the intents coordinator if available."""
        if not self.intents_coordinator:
            raise NotImplementedError("Intents coordinator not available")
        intents = await self.intents_coordinator.async_list_intents()
        return [i.to_dict() for i in intents]

    async def async_get_intent(self, intent_id: str) -> dict | None:
        """Get a single intent by id via the intents coordinator."""
        if not self.intents_coordinator:
            raise NotImplementedError("Intents coordinator not available")
        intent = await self.intents_coordinator.async_get_intent(intent_id)
        return intent.to_dict() if intent else None

    async def async_create_intent(self, payload: dict) -> dict:
        """Create an intent via the intents coordinator."""
        if not self.intents_coordinator:
            raise NotImplementedError("Intents coordinator not available")
        intent = await self.intents_coordinator.async_create_intent(payload)
        return intent.to_dict()

    async def async_update_intent(self, intent_id: str, payload: dict) -> dict:
        """Update an intent via the intents coordinator."""
        if not self.intents_coordinator:
            raise NotImplementedError("Intents coordinator not available")
        intent = await self.intents_coordinator.async_update_intent(intent_id, payload)
        return intent.to_dict()

    async def async_delete_intent(self, intent_id: str) -> None:
        """Delete an intent via the intents coordinator."""
        if not self.intents_coordinator:
            raise NotImplementedError("Intents coordinator not available")
        await self.intents_coordinator.async_delete_intent(intent_id)
