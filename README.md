# Intentsity

A Home Assistant custom component that records Assist Pipeline intent events and surfaces them for dataset review.

## Features
- Captures `INTENT_START`, `INTENT_PROGRESS`, and `INTENT_END` events from every Assist pipeline run.
- Normalizes pipeline metadata, start/end payloads, and progress deltas (chat log + `tts_start_streaming`) into a relational SQLite database (`pipeline_runs`, `intent_starts`, `intent_progress`, `intent_ends`).
- Provides websocket commands (`intentsity/events/list` and `intentsity/events/subscribe`) that stream the latest pipeline runs with nested sections for downstream tooling.
- Registers an iframe-based sidebar panel (`Assist Intent Review`) that renders run cards with metadata plus start/progress/end sections.

## Installation
1. Copy the `custom_components/intentsity` folder into your Home Assistant `config/custom_components` directory.
2. Restart Home Assistant.
3. In **Settings → Devices & Services**, click **+ Add Integration** and select **Intentsity** to run the config flow (single instance only).
4. After setup, open the **Assist Intent Review** sidebar entry (admin users only).

## Usage
- Use the sidebar panel to filter the latest 100 entries (adjustable up to 500) and inspect their payloads.
- Automations or external tools can call the authenticated websocket commands:
	- `intentsity/events/list` with an optional `limit` (1-500) to fetch a snapshot.
	- `intentsity/events/subscribe` to receive pushes whenever new events are recorded (limit respected per subscriber).

## Development Notes
- Pipeline runs and related intent payloads are modeled with Pydantic (`models.py`), and all blocking DB calls run inside executor jobs.
- Persistence is powered by SQLAlchemy's ORM (see `custom_components/intentsity/db.py` for table layouts); update both schema and documentation when columns change.
- Run the unit suite via `pytest tests` before submitting changes.
