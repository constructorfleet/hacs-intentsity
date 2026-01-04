"""Helper functions for storage operations in the Intentsity integration."""

from typing import Any

from custom_components.intentsity.data import IntentsityStorage


def get_intentsity_storage(entry: Any) -> IntentsityStorage:
    """Retrieve the IntentsityStorage instance for a given config entry.

    Args:
        entry: The config entry containing runtime data.

    Returns:
        The IntentsityStorage instance associated with the entry.
    """
    return entry.runtime_data.storage
