# Intentsity

A Home Assistant custom component that records Assist Pipeline intent events and surfaces them for dataset review.

## Features
- Captures `INTENT_START`, `INTENT_PROGRESS`, and `INTENT_END` events from every Assist pipeline run.
- Normalizes pipeline metadata, start/end payloads, and progress deltas (chat log + `tts_start_streaming`) into a relational SQLite database (`pipeline_runs`, `intent_starts`, `intent_progress`, `intent_ends`).
- Persists reviewer expectations (selected `IntentStart`, ordered progress stack, and INTENT_END payload) through the `intentsity/review/save` websocket command, ensuring every run can be marked as reviewed.
- Provides websocket commands (`intentsity/events/list`, `intentsity/events/subscribe`, `intentsity/review/save`) that stream the latest pipeline runs and accept review submissions.
- Ships an iframe-based sidebar panel (`Assist Intent Review`) with a two-pane layout: run cards on the left, and a review workspace on the right that supports selecting an `IntentStart`, reordering progress events, editing JSON payloads, toggling expectation matches, and saving the review back to SQLite.

## Installation
1. Copy the `custom_components/intentsity` folder into your Home Assistant `config/custom_components` directory.
2. Restart Home Assistant.
3. In **Settings → Devices & Services**, click **+ Add Integration** and select **Intentsity** to run the config flow (single instance only).
4. After setup, open the **Assist Intent Review** sidebar entry (admin users only).

## Usage
- Use the sidebar panel to filter the latest 100 entries (adjustable up to 500) and inspect their payloads.
- Click any `IntentStart` pill to open the review workspace, reorder `INTENT_PROGRESS` cards (the final card is always the INTENT_END), edit the JSON payloads, and toggle whether the run matched expectations. Saving immediately creates or updates the review record and updates the run card badge. Runs must emit at least one `INTENT_END` event before reviews can be stored.
- Automations or external tools can call the authenticated websocket commands:
	- `intentsity/events/list` with an optional `limit` (1-500) to fetch a snapshot.
	- `intentsity/events/subscribe` to receive pushes whenever new events are recorded (limit respected per subscriber).
	- `intentsity/review/save` with `run_id`, `intent_start_id`, `matched_expectations`, and an ordered `steps` array (progress rows + terminal INTENT_END) to store curated expectations programmatically.

## Development Notes
- Pipeline runs and related intent payloads are modeled with Pydantic (`models.py`), and all blocking DB calls run inside executor jobs.
- Persistence is powered by SQLAlchemy's ORM (see `custom_components/intentsity/db.py` for table layouts); update both schema and documentation when columns change.
- Run the unit suite via `pytest tests` before submitting changes.
