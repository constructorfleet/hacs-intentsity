"""Validators for Intentsity config flow and subentry flow."""

from __future__ import annotations

from typing import Any


def validate_intent_data(data: dict[str, Any]) -> None:
    """Validate intent data for subentry flow.

    Raise :class:`ValueError` when validation fails.
    """
    # Example: Ensure required fields are present
    if not data.get("name"):
        raise ValueError("Intent name is required.")
    # Add more validation as needed
    # ...
