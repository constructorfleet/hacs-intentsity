"""API package for intentsity."""

from .client import (
    IntentsityApiClient,
    IntentsityApiClientAuthenticationError,
    IntentsityApiClientCommunicationError,
    IntentsityApiClientError,
)

__all__ = [
    "IntentsityApiClient",
    "IntentsityApiClientAuthenticationError",
    "IntentsityApiClientCommunicationError",
    "IntentsityApiClientError",
]
