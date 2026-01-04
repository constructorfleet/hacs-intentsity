"""
Data schemas for config flow forms.

This package contains all schemas used in config flows, options flows,
and subentry flows. Schemas are organized into separate modules for maintainability.

Note: All user, reauth, and reconfigure schemas are now no-op (no credential fields).

Package structure:
------------------
- config.py: Main config flow schemas (user, reauth, reconfigure)
- options.py: Options flow schemas

All schemas are re-exported from this __init__.py for convenient imports.
"""

from __future__ import annotations

from custom_components.intentsity.config_flow_handler.schemas.config import (
    get_reauth_schema,
    get_reconfigure_schema,
    get_user_schema,
)
from custom_components.intentsity.config_flow_handler.schemas.options import get_options_schema

# Re-export all schemas for convenient imports
__all__ = [
    "get_options_schema",
    "get_reauth_schema",
    "get_reconfigure_schema",
    "get_user_schema",
]
