"""
Config flow schemas.

Schemas for the main configuration flow steps:
- User setup
- Reconfiguration
- Reauthentication

When this file grows too large (>300 lines), consider splitting into:
- user.py: User setup schemas
- reauth.py: Reauthentication schemas
- reconfigure.py: Reconfiguration schemas
"""

from __future__ import annotations

from collections.abc import Mapping
from typing import Any


def get_user_schema(defaults: Mapping[str, Any] | None = None):
    """No-op user schema (no fields)."""
    return {}


def get_reconfigure_schema(username: str):
    """No-op reconfigure schema (no fields)."""
    return {}


def get_reauth_schema(username: str):
    """No-op reauth schema (no fields)."""
    return {}


__all__ = [
    "get_reauth_schema",
    "get_reconfigure_schema",
    "get_user_schema",
]
