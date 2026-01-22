# Intentsity

A Home Assistant custom component that records Assist Pipeline chat logs and surfaces them in a clean UI.

## Features
- Records every Assist conversation into a local SQLite database (`chats` and `chat_messages`).
- Uses the official `async_subscribe_chat_logs` API for non-invasive, observational logging.
- Exposes a WebSocket API for listing recent chats and subscribing to live updates.
- Ships a modern, responsive LitElement-based panel for reviewing conversation history.

## Installation
1. Copy the `custom_components/intentsity` folder into your Home Assistant `config/custom_components` directory.
2. Restart Home Assistant.
3. In **Settings → Devices & Services**, click **+ Add Integration** and select **Intentsity**.
4. After setup, open the **Assist Chat Log** sidebar entry (admin users only).

## Usage
- The sidebar panel shows the latest 100 conversations (adjustable up to 500).
- Conversations are grouped by ID, showing both user and assistant messages with timestamps.
- Use the "Refresh" button to reload the history or watch the live feed as you use Assist.
- Developers can access the logs via WebSocket:
	- `intentsity/chats/list` with a `limit` to fetch snapshots.
	- `intentsity/chats/subscribe` for live push updates.

## Development Notes
- Data models are strictly validated via Pydantic (`models.py`).
- SQLite persistence uses SQLAlchemy with async compatibility via executor jobs (`db.py`).
- UI source is in `js/panel/main.tsx` (LitElement + TypeScript).
- Run `npm run build` to compile the panel into `custom_components/intentsity/panel.js`.
- Run `uv run pytest` to execute the test suite.
