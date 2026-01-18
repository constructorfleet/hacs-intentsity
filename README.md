# Intentsity

A Home Assistant custom component that records Assist Pipeline intent events and surfaces them for dataset review.

## Features
- Captures `INTENT_START` and `INTENT_END` events from every Assist pipeline run.
- Stores raw pipeline payloads inside a local SQLite database (`intentsity.db`).
- Exposes a custom API endpoint at `/api/intentsity/events` for tooling.
- Registers an iframe-based sidebar panel (`Assist Intent Review`) that visualizes the latest events.

## Installation
1. Copy the `custom_components/intentsity` folder into your Home Assistant `config/custom_components` directory.
2. Restart Home Assistant.
3. In **Settings → Devices & Services**, click **+ Add Integration** and select **Intentsity** to run the config flow (single instance only).
4. After setup, open the **Assist Intent Review** sidebar entry (admin users only).

## Usage
- Use the sidebar panel to filter the latest 100 entries (adjustable up to 500) and inspect their payloads.
- Automations or external tools can query the `/api/intentsity/events?limit=200` endpoint (authenticated) to download datasets.

## Development Notes
- Intent payloads are normalized with Pydantic (`models.py`), and all blocking DB calls run inside executor jobs.
- Persistence is powered by SQLAlchemy's ORM (see `IntentEventRow` inside `__init__.py`); update the model definition and bump the manifest version if the schema changes.
- Run the unit suite via `pytest tests` before submitting changes.
