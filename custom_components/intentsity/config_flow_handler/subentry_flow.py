"""Subentry flow implementation for intents."""

from __future__ import annotations

from copy import deepcopy
from typing import Any, cast

import voluptuous as vol

from custom_components.intentsity.data import Intent, validate_intent_payload
from custom_components.intentsity.utils import get_intentsity_storage
from custom_components.intentsity.utils.string_helpers import slugify_name
from homeassistant.config_entries import ConfigSubentryFlow, SubentryFlowResult
from homeassistant.helpers.selector import (
    EntitySelector,
    ObjectSelector,
    SelectOptionDict,
    SelectSelector,
    TextSelector,
)

DEFAULT_RESPONSES = {"default": "Action completed."}
PLATFORM_OPTIONS = [
    "automation",
    "button",
    "climate",
    "cover",
    "fan",
    "humidifier",
    "input_boolean",
    "input_number",
    "input_select",
    "input_text",
    "light",
    "media_player",
    "sensor",
    "switch",
    "vacuum",
]


class IntentsSubentryFlowHandler(ConfigSubentryFlow):
    """Handle creation and editing of Intentsity intent subentries."""

    def __init__(self) -> None:
        """Initialize the subentry flow handler."""
        super().__init__()
        self._intent_payload: dict[str, Any] | None = None
        self._sentence_groups: list[dict[str, Any]] = []
        self._intent_id: str | None = None
        self._created_at: str | None = None
        self._is_reconfigure = False
        self._editing_index: int | None = None

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Collect the core intent metadata before showing the sentence menu."""
        self._ensure_intent_payload()
        return await self._handle_intent_form(user_input, step_id="user")

    async def async_step_edit_intent(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Allow editing of intent metadata from the menu."""
        return await self._handle_intent_form(user_input, step_id="edit_intent")

    async def async_step_menu(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Offer sentence group management options."""
        menu_options: list[str] = ["edit_intent", "add_sentence_group"]
        if self._sentence_groups:
            menu_options.extend(["edit_sentence_group", "remove_sentence_group"])
        menu_options.append("finish")
        return self.async_show_menu(step_id="menu", menu_options=menu_options)

    async def async_step_add_sentence_group(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> SubentryFlowResult:
        """Add a new sentence group to the intent."""
        errors: dict[str, str] = {}
        responses = self._current_responses()
        if not responses:
            errors["base"] = "define_responses_first"
            return self.async_show_form(
                step_id="add_sentence_group",
                data_schema=vol.Schema({}),
                errors=errors,
                description_placeholders={"message": "Add at least one response in the intent data."},
            )

        defaults = self._get_sentence_group_defaults()
        response_options = self._build_response_options(responses)
        if user_input is not None:
            group, errors = self._parse_sentence_group_input(user_input)
            if not errors:
                self._sentence_groups.append(group)
                return await self.async_step_menu()

        return self.async_show_form(
            step_id="add_sentence_group",
            data_schema=self._build_sentence_group_schema(defaults, response_options),
            errors=errors,
        )

    async def async_step_edit_sentence_group(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> SubentryFlowResult:
        """Select a sentence group to edit."""
        if not self._sentence_groups:
            return await self.async_step_menu()
        if user_input is None:
            return self.async_show_form(
                step_id="edit_sentence_group",
                data_schema=self._build_group_selector_schema(),
            )
        index = self._coerce_index(user_input.get("group_index"))
        if index is None:
            return self.async_show_form(
                step_id="edit_sentence_group",
                data_schema=self._build_group_selector_schema(),
                errors={"base": "invalid_selection"},
            )
        self._editing_index = index
        return await self.async_step_edit_sentence_group_form()

    async def async_step_edit_sentence_group_form(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> SubentryFlowResult:
        """Edit the selected sentence group."""
        if self._editing_index is None or self._editing_index >= len(self._sentence_groups):
            return await self.async_step_menu()
        defaults = self._get_sentence_group_defaults(self._editing_index)
        response_options = self._build_response_options(self._current_responses())
        errors: dict[str, str] = {}
        if user_input is not None:
            group, errors = self._parse_sentence_group_input(user_input)
            if not errors:
                self._sentence_groups[self._editing_index] = group
                self._editing_index = None
                return await self.async_step_menu()
        return self.async_show_form(
            step_id="edit_sentence_group_form",
            data_schema=self._build_sentence_group_schema(defaults, response_options),
            errors=errors,
        )

    async def async_step_remove_sentence_group(
        self,
        user_input: dict[str, Any] | None = None,
    ) -> SubentryFlowResult:
        """Remove an existing sentence group."""
        if not self._sentence_groups:
            return await self.async_step_menu()
        if user_input is None:
            return self.async_show_form(
                step_id="remove_sentence_group",
                data_schema=self._build_group_selector_schema(),
            )
        index = self._coerce_index(user_input.get("group_index"))
        if index is not None and 0 <= index < len(self._sentence_groups):
            self._sentence_groups.pop(index)
        return await self.async_step_menu()

    async def async_step_finish(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Persist the intent and finish the sub-flow."""
        entry = self._get_entry()
        storage = get_intentsity_storage(entry)
        payload = {
            **(self._intent_payload or {}),
            "sentence_groups": deepcopy(self._sentence_groups),
        }
        if self._intent_id:
            payload["id"] = self._intent_id
        if self._created_at:
            payload["created_at"] = self._created_at

        try:
            intent = validate_intent_payload(payload)
        except (TypeError, ValueError) as exc:
            return self.async_show_form(
                step_id="finish",
                data_schema=vol.Schema({}),
                errors={"base": "validation_error"},
                description_placeholders={"message": str(exc)},
            )

        await storage.async_set_intent(intent)
        self._intent_id = intent.id
        self._created_at = intent.created_at

        if self._is_reconfigure:
            config_subentry = self._get_reconfigure_subentry()
            return cast(Any, self).async_update_subentry(
                config_subentry,
                data={"intent_id": intent.id},
                title=intent.name,
            )

        return self.async_create_entry(
            title=intent.name,
            data={"intent_id": intent.id},
            unique_id=intent.id,
        )

    async def async_step_reconfigure(self, user_input: dict[str, Any] | None = None) -> SubentryFlowResult:
        """Load an existing intent for editing."""
        entry = self._get_entry()
        config_subentry = self._get_reconfigure_subentry()
        intent_id = config_subentry.data.get("intent_id")
        if not isinstance(intent_id, str):
            return self.async_abort(reason="intent_not_found")

        storage = get_intentsity_storage(entry)
        intent_dict = await storage.async_get_intent(intent_id)
        if intent_dict is None:
            return self.async_abort(reason="intent_not_found")

        intent = Intent.from_dict(intent_dict)
        self._intent_id = intent.id
        self._created_at = intent.created_at
        self._sentence_groups = cast(list[dict[str, Any]], [group.to_dict() for group in intent.sentence_groups])
        self._intent_payload = cast(dict[str, Any], intent_dict)
        self._is_reconfigure = True
        return await self.async_step_menu()

    async def _handle_intent_form(self, user_input: dict[str, Any] | None, *, step_id: str) -> SubentryFlowResult:
        self._ensure_intent_payload()
        defaults = deepcopy(self._intent_payload or {})
        defaults.setdefault("responses", deepcopy(DEFAULT_RESPONSES))
        errors: dict[str, str] = {}
        if user_input is not None:
            parsed, errors = self._parse_intent_form_input(user_input)
            if not errors:
                self._intent_payload = parsed
                valid_responses = set(self._current_responses().keys())
                self._sentence_groups = [
                    group for group in self._sentence_groups if group.get("response") in valid_responses
                ]
                return await self.async_step_menu()

        return self.async_show_form(
            step_id=step_id,
            data_schema=self._build_intent_form_schema(defaults),
            errors=errors,
        )

    def _build_intent_form_schema(self, defaults: dict[str, Any]) -> vol.Schema:
        skip_words_text = "\n".join(defaults.get("skip_words", []))
        return vol.Schema(
            {
                vol.Required("name", default=defaults.get("name", "")): TextSelector({"multiline": False}),
                vol.Optional("description", default=defaults.get("description")): TextSelector({"multiline": True}),
                vol.Optional("platforms", default=defaults.get("platforms", [])): SelectSelector(
                    {
                        "multiple": True,
                        "options": [
                            SelectOptionDict(value=domain, label=domain.replace("_", " ").title())
                            for domain in PLATFORM_OPTIONS
                        ],
                        "custom_value": True,
                    }
                ),
                vol.Required("script", default=defaults.get("script", "")): EntitySelector({"domain": "script"}),
                vol.Optional("slots", default=defaults.get("slots", {})): ObjectSelector({}),
                vol.Optional("skip_words", default=skip_words_text): TextSelector({"multiline": True}),
                vol.Optional("expansion_rules", default=defaults.get("expansion_rules", {})): ObjectSelector({}),
                vol.Optional("lists", default=defaults.get("lists", {})): ObjectSelector({}),
                vol.Required("responses", default=defaults.get("responses", DEFAULT_RESPONSES)): ObjectSelector({}),
            }
        )

    def _parse_intent_form_input(self, user_input: dict[str, Any]) -> tuple[dict[str, Any], dict[str, str]]:
        errors: dict[str, str] = {}
        name = str(user_input.get("name", "")).strip()
        if not name:
            errors["name"] = "required"

        script = str(user_input.get("script", "")).strip()
        if not script:
            errors["script"] = "required"

        platforms = []
        for entry in user_input.get("platforms") or []:
            slug = slugify_name(str(entry))
            if slug:
                platforms.append(slug)

        skip_words = []
        raw_skip_words = str(user_input.get("skip_words", ""))
        for line in raw_skip_words.splitlines():
            slug = slugify_name(line)
            if slug:
                skip_words.append(slug)

        responses = self._normalize_responses(user_input.get("responses"))
        if not responses:
            errors["responses"] = "required"

        parsed = {
            "name": name,
            "description": user_input.get("description"),
            "platforms": platforms,
            "script": script,
            "slots": user_input.get("slots") or {},
            "skip_words": skip_words,
            "expansion_rules": user_input.get("expansion_rules") or {},
            "lists": user_input.get("lists") or {},
            "responses": responses,
        }
        return parsed, errors

    def _ensure_intent_payload(self) -> None:
        if self._intent_payload is None:
            self._intent_payload = {
                "name": "",
                "description": "",
                "platforms": [],
                "script": "",
                "slots": {},
                "skip_words": [],
                "expansion_rules": {},
                "lists": {},
                "responses": deepcopy(DEFAULT_RESPONSES),
            }

    def _current_responses(self) -> dict[str, str]:
        self._ensure_intent_payload()
        return dict((self._intent_payload or {}).get("responses", {}))

    def _build_response_options(self, responses: dict[str, str]) -> list[SelectOptionDict]:
        return [SelectOptionDict(value=key, label=f"{key}: {label}") for key, label in responses.items()]

    def _get_sentence_group_defaults(self, index: int | None = None) -> dict[str, Any]:
        if index is not None and 0 <= index < len(self._sentence_groups):
            group = self._sentence_groups[index]
        else:
            group = {
                "sentences": [],
                "slots": {},
                "expansion_rules": {},
                "lists": {},
                "requires_context": {},
                "response": next(iter(self._current_responses().keys()), ""),
            }
        sentences_text = "\n".join(group.get("sentences", []))
        return {**group, "sentences": sentences_text}

    def _build_sentence_group_schema(
        self,
        defaults: dict[str, Any],
        response_options: list[SelectOptionDict],
    ) -> vol.Schema:
        return vol.Schema(
            {
                vol.Required("sentences", default=defaults.get("sentences", "")): TextSelector({"multiline": True}),
                vol.Optional("slots", default=defaults.get("slots", {})): ObjectSelector({}),
                vol.Optional(
                    "expansion_rules",
                    default=defaults.get("expansion_rules", {}),
                ): ObjectSelector({}),
                vol.Optional("lists", default=defaults.get("lists", {})): ObjectSelector({}),
                vol.Optional(
                    "requires_context",
                    default=defaults.get("requires_context", {}),
                ): ObjectSelector({}),
                vol.Required("response", default=defaults.get("response", "")): SelectSelector(
                    {
                        "multiple": False,
                        "options": response_options,
                        "custom_value": False,
                    }
                ),
            }
        )

    def _parse_sentence_group_input(self, user_input: dict[str, Any]) -> tuple[dict[str, Any], dict[str, str]]:
        errors: dict[str, str] = {}
        sentences_text = str(user_input.get("sentences", ""))
        sentences = [line.strip() for line in sentences_text.splitlines() if line.strip()]
        if not sentences:
            errors["sentences"] = "required"

        response_key = slugify_name(str(user_input.get("response", "")))
        if response_key not in self._current_responses():
            errors["response"] = "invalid_selection"

        group = {
            "sentences": sentences,
            "slots": user_input.get("slots") or {},
            "expansion_rules": user_input.get("expansion_rules") or {},
            "lists": user_input.get("lists") or {},
            "requires_context": user_input.get("requires_context") or {},
            "response": response_key,
        }
        return group, errors

    def _build_group_selector_schema(self) -> vol.Schema:
        options = [
            SelectOptionDict(
                value=str(index),
                label=(
                    f"#{index + 1}: {group.get('response', 'response')} ({len(group.get('sentences', []))} sentences)"
                ),
            )
            for index, group in enumerate(self._sentence_groups)
        ]
        return vol.Schema(
            {
                vol.Required("group_index"): SelectSelector(
                    {
                        "multiple": False,
                        "options": options,
                    }
                )
            }
        )

    @staticmethod
    def _coerce_index(value: Any) -> int | None:
        try:
            return int(value)
        except (TypeError, ValueError):
            return None

    @staticmethod
    def _normalize_responses(value: Any) -> dict[str, str]:
        if not isinstance(value, dict):
            return {}
        normalized: dict[str, str] = {}
        for key, val in value.items():
            slug = slugify_name(str(key))
            text = str(val).strip()
            if slug and text:
                normalized[slug] = text
        return normalized


__all__ = ["IntentsSubentryFlowHandler"]
