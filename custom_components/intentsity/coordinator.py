from __future__ import annotations

from datetime import timedelta
import logging
from typing import Any

from homeassistant.components.assist_pipeline.pipeline import (
    KEY_ASSIST_PIPELINE,
    async_get_pipeline,
)
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator

from . import db
from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)


class IntentsityCoordinator(DataUpdateCoordinator[dict[str, Any]]):
    def __init__(self, hass: HomeAssistant) -> None:
        super().__init__(
            hass,
            logger=_LOGGER,
            name=DOMAIN,
            update_interval=timedelta(seconds=30),
        )

    async def _async_update_data(self) -> dict[str, Any]:
        pipeline_data = self.hass.data.get(KEY_ASSIST_PIPELINE)
        pipeline_runs: dict[str, list[str]] = {}
        pipelines: dict[str, Any] = {}

        if pipeline_data is not None:
            runs = pipeline_data.pipeline_runs._pipeline_runs
            for pipeline_id, run_map in runs.items():
                pipeline_runs[pipeline_id] = list(run_map.keys())
                try:
                    pipeline = async_get_pipeline(self.hass, pipeline_id)
                except Exception:
                    continue
                pipelines[pipeline_id] = pipeline

        uncorrected_count = await self.hass.async_add_executor_job(
            db.count_uncorrected_chats, self.hass
        )

        return {
            "pipeline_runs": pipeline_runs,
            "pipelines": pipelines,
            "uncorrected_count": uncorrected_count,
        }
