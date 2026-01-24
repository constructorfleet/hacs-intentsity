from __future__ import annotations

from dataclasses import asdict, is_dataclass
from datetime import timedelta
import functools
import logging
from typing import Any

from homeassistant.components.assist_pipeline.pipeline import (
    KEY_ASSIST_PIPELINE,
    PipelineEvent,
    PipelineEventType,
    PipelineRunDebug,
    async_get_pipeline,
    async_get_pipelines,
)
from homeassistant.components.conversation.chat_log import (
    DATA_CHAT_LOGS,
    SystemContent,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator


from . import db
from .const import DOMAIN
from .models import Chat, ChatMessage

_LOGGER = logging.getLogger(__name__)

HANDLED_PIPELINE_EVENTS = {
    PipelineEventType.RUN_START,
    PipelineEventType.INTENT_START,
    PipelineEventType.INTENT_PROGRESS,
}


def _process_run_start(event: PipelineEvent) -> Chat | None:
    if not event.data:
        return None
    conversation_id = event.data.get("conversation_id", "")
    if not conversation_id:
        return None
    return Chat(conversation_id=conversation_id, messages=[])


def _process_intent_start(event: PipelineEvent, chat: Chat) -> Chat | None:
    if not event.data:
        return None
    data = event.data.copy()
    chat.messages.append(
        ChatMessage(
            chat_id=chat.conversation_id,
            sender="assistant",
            text=data.pop("intent_input", ""),
            data=asdict(data) if is_dataclass(data) else data,
        )
    )
    return chat


def _process_intent_progress(event: PipelineEvent, chat: Chat) -> Chat | None:
    if not event.data:
        return None
    delta = event.data.get("chat_log_delta")
    if not delta:
        return None
    data = delta.copy()
    if "tool_calls" in data:
        chat.messages.append(
            ChatMessage(
                chat_id=chat.conversation_id,
                sender=data.get("role", "tool_calls"),
                text="",
                data=asdict(data) if is_dataclass(data) else data,  # type: ignore
            )
        )
    elif "tool_result" in data:
        tool_result = data.get("tool_result", {})
        text: str | None = tool_result.get("result", None)
        if not text:
            content = tool_result.get("content", None)
            if isinstance(content, list):
                text = "\n\n".join([c["text"] for c in content])
            elif isinstance(content, str):
                text = content

        chat.messages.append(
            ChatMessage(
                chat_id=chat.conversation_id,
                sender=data.get("role", "tool_result"),
                text=text or "",
                data=asdict(data) if is_dataclass(data) else data,  # type: ignore
            )
        )
    elif "content" in data:
        content = data.get("content", "")
        if not content:
            return chat
        if not chat.messages or chat.messages[-1].sender != data.get(
            "role", "assistant"
        ):
            chat.messages.append(
                ChatMessage(
                    chat_id=chat.conversation_id,
                    sender=data.get("role", "assistant"),
                    text="",
                    data={},
                )
            )
        chat_message = chat.messages[-1]
        chat_message.text += content
        chat_message.data.update(asdict(data) if is_dataclass(data) else data)  # type: ignore
    return chat


class IntentsityCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            logger=_LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=30),
        )
        self._subscriptions = {}

    def _process_pipeline_run(
        self,
        pipeline_run: PipelineRunDebug,
    ) -> Chat | None:
        all_chat_logs = self.hass.data[DATA_CHAT_LOGS]
        if not all_chat_logs:
            return None
        chat: Chat | None = None
        for event in [
            event
            for event in pipeline_run.events
            if event.type in HANDLED_PIPELINE_EVENTS
        ]:
            if event.type == PipelineEventType.RUN_START:
                chat = _process_run_start(event)
            else:
                if not chat:
                    return None
                if event.type == PipelineEventType.INTENT_START:
                    chat = _process_intent_start(event, chat)
                elif event.type == PipelineEventType.INTENT_PROGRESS:
                    chat = _process_intent_progress(event, chat)

        if not chat:
            return None

        chat_log = all_chat_logs.get(chat.conversation_id)
        if not chat_log:
            return chat

        system_content = [
            content
            for content in chat_log.content
            if isinstance(content, SystemContent)
        ]

        if not system_content:
            return chat

        def accumulate(acc: dict[str, Any], current: dict[str, Any]) -> dict[str, Any]:
            return {**acc, **current}

        chat.messages.insert(
            0,
            ChatMessage(
                sender="system",
                chat_id=chat.conversation_id,
                text="\n\n".join([content.content for content in system_content]),
                data=functools.reduce(
                    accumulate, [asdict(context) for context in system_content], {}
                ),
            ),
        )

        return chat

    async def _async_update_data(self) -> dict[str, Any]:
        pipeline_data = self.hass.data.get(KEY_ASSIST_PIPELINE)
        pipelines: dict[str, Any] = {}

        if pipeline_data is None:
            return {}

        for pipeline in async_get_pipelines(self.hass):
            try:
                resolved = async_get_pipeline(self.hass, pipeline.id)
            except Exception:
                _LOGGER.debug("Error resolving pipeline id=%s", pipeline.id)
                continue
            runs = pipeline_data.pipeline_debug.get(resolved.id)
            if not runs:
                continue
            for run_debug in runs.values():
                chat = self._process_pipeline_run(run_debug)
                if not chat:
                    continue

                await self.hass.async_add_executor_job(
                    db.upsert_chat,
                    self.hass,
                    chat,
                )

        uncorrected_count = await self.hass.async_add_executor_job(
            db.count_uncorrected_chats, self.hass
        )

        return {
            "pipelines": pipelines,
            "uncorrected_count": uncorrected_count,
        }
