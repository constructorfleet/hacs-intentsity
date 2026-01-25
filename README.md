# Intentsity

A Home Assistant custom component that records Assist Pipeline chat logs and surfaces them in a clean UI.

## Features
- Records every Assist conversation into a local SQLite database (`chats` and `chat_messages`).
- Stores corrected conversations alongside originals for review and fine-tuning workflows (`corrected_chats` and `corrected_chat_messages`).
- Uses the official `async_subscribe_chat_logs` API for non-invasive, observational logging.
- Exposes a WebSocket API for listing recent chats and subscribing to live updates.
- Ships a modern, responsive LitElement-based panel for reviewing and correcting conversation history.
- Provides a sensor for the number of uncorrected conversations.

## Installation
1. Copy the `custom_components/intentsity` folder into your Home Assistant `config/custom_components` directory.
- OR -
[Add Intensity](https://my.home-assistant.io/redirect/hacs_repository/?owner=constructorfleet&repository=hacs-intentsity) in [HACS](https://hacs.xyz)
2. Restart Home Assistant.
3. In **Settings → Devices & Services**, click **+ Add Integration** and select **Intentsity**.
- OR -
[![Open your Home Assistant instance and start setting up a new integration.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=intentsity)
4. After setup, open the **Assist Chat Log** sidebar entry (admin users only).

## Usage
- The sidebar panel shows the latest 100 conversations (adjustable up to 500).
- Conversations are grouped by ID, showing both user and assistant messages with timestamps.
- Filter conversations by corrected status or by a date/time range to focus reviews.
- Use the corrected panel to reorder messages, insert new messages anywhere in the transcript, copy/paste messages across chats, edit tool calls/metadata, and save the corrected transcript.
- Use the "Refresh" button to reload the history or watch the live feed as you use Assist.
- Developers can access the logs via WebSocket:
	- `intentsity/chats/list` with a `limit` to fetch snapshots.
	- `intentsity/chats/subscribe` for live push updates.
	- `intentsity/chats/corrected/save` with `conversation_id`, `pipeline_run_id`, and `messages` to persist corrections.

## Development Notes
- Data models are strictly validated via Pydantic (`models.py`).
- SQLite persistence uses SQLAlchemy with async compatibility via executor jobs (`db.py`).
- Corrected chats are stored in new tables; existing databases will auto-create them on startup.
- Schema v2 adds a `position` column to `chat_messages` to preserve ordering on updates; it is auto-migrated on startup.
- Schema v3 uses `conversation_id` as the primary key for chats and corrected chats; existing installs are migrated on startup.
- Schema v4 adds `pipeline_run_id` to chat identity (composite key with `conversation_id`) and propagates it through corrected chats; existing installs are migrated on startup (legacy runs are tagged with `pipeline_run_id` = `legacy`).
- Schema v5 adds `run_timestamp` to chats and persists event timestamps on messages; existing installs are migrated on startup (legacy runs use `created_at` as `run_timestamp`).
- UI source is in `js/panel/main.tsx` (LitElement + TypeScript).
- Run `npm run build` to compile the panel into `custom_components/intentsity/panel.js`.
- Run `uv run pytest` to execute the test suite.
