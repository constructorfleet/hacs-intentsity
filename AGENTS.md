# Assist Intent Logger – Agent Playbook

This repository ships a Home Assistant custom component that records Assist Pipeline intent events into a SQLite store and exposes them through a review UI. Use this playbook whenever you author code, docs, or tests through an agentic workflow.

## Mission Overview
- Patch `PipelineRun.process_event` exactly once during `async_setup` and keep the patch idempotent.
- Persist Assist `INTENT_START` and `INTENT_END` events to the local SQLite database defined in `const.py`.
- Serve training data through the custom API (`/api/intentsity/events`) and iframe panel (`/assist-intent-review`).

## Key Files
- `custom_components/intentsity/__init__.py` – runtime wiring, HTTP views, and panel registration.
- `custom_components/intentsity/models.py` – Pydantic models for intent payloads and API responses.
- `custom_components/intentsity/const.py` – domain constants and SQL schema.
- `tests/test_models.py` – unit coverage for the data models.
- `README.md` – user-facing setup and troubleshooting guidance.

## Development Workflow
1. **Plan First** – outline impacted files, migrations, and tests before editing.
2. **Validate Inputs** – run all external payloads through the Pydantic models; never trust bare dicts.
3. **Non-blocking I/O** – heavy DB reads/writes must run inside `async_add_executor_job`.
4. **Document Changes** – update README/changelog whenever the API, schema, or UX shifts.
5. **Tests & Linters** – extend `tests/` or add new suites when behavior changes; ensure pytest passes locally.
6. **Review Dependencies** – mirror new Python requirements in both `pyproject.toml` and `manifest.json` before release.
7. **Panel Assets** – keep the iframe HTML and associated assets in sync with API changes; never inline large HTML blobs inside Python.

## Quality Bar & Checks (IMPORTANT!)
- Keep logs actionable and avoid noisy tracebacks.
- Respect ASCII-only code unless a file already mandates Unicode.
- Prefer descriptive comments sparingly, only for complex code paths.
- Confirm the custom panel loads in both desktop and mobile breakpoints.
- When altering the DB schema, include migration notes and bump the manifest version.
- Enforce at least 90% pytest coverage on every change; add or update tests until the threshold is met.
- *ALWAYS* Commit each completed unit of work immediately using conventional commit messages (e.g., `feat(runtime): add pipeline patch`).
- Run `uv run pytest --cov=custom_components/intentsity --cov=tests` before opening a PR and paste the summary into the review notes.
- For behavioral changes, capture screenshots/GIFs of the panel showing the new UX and attach them to the PR.

## Release Checklist
- [ ] `manifest.json` version bumped and matches `pyproject.toml`.
- [ ] Dependencies pinned with compatible ranges (no bare `*`).
- [ ] README feature list and API endpoints reflect the new behavior.
- [ ] Tests pass on macOS and Linux runners (`uv run pytest ...`).
- [ ] Coverage report ≥90% overall.
- [ ] Conventional commits squashed/stacked logically (docs, feat, fix, test, chore).

## Troubleshooting Tips
- Use `uv run pytest tests/test_runtime.py -k intent` to quickly iterate on logging regressions.
- If the panel fails to load, check the browser console for CSP errors and verify the iframe URL matches `_PANEL_URL_PATH`.
- For database migration issues, delete `intentsity.db` locally and rerun `async_setup`; in production, ship an upgrade script before deploying breaking schema changes.
