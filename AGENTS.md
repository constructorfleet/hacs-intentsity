# Assist Intent Logger – Agent Playbook

This repository ships a Home Assistant custom component that records Assist Pipeline intent lifecycle events into a local SQLite store and exposes them through a review UI. This document is the single source of truth for how agents should plan, implement, test, and release changes. Deviate at your own peril.

---

## Mission Overview

Agents working in this repository must enforce the following invariants:

- Patch `PipelineRun.process_event` exactly once during `async_setup`. The patch **must** be idempotent and safe across reloads.
- Persist Assist `INTENT_START` and `INTENT_END` events to the SQLite database defined in `const.py`.
- Expose captured events through:
  - REST API: `/api/intentsity/events`
  - Review panel iframe: `/assist-intent-review`
- Never block the Assist pipeline. Logging must be observational, not invasive.

If you are unsure whether a change violates one of these rules, assume it does.

---

## Repository Map (Know Where You’re Standing)

- `custom_components/intentsity/__init__.py`  
  Runtime wiring, pipeline patching, HTTP views, and panel registration.

- `custom_components/intentsity/models.py`  
  Pydantic models for Assist payloads, persistence objects, and API responses.

- `custom_components/intentsity/const.py`  
  Domain constants, schema definitions, and database configuration.

- `tests/`  
  All automated coverage. New behavior without tests is considered broken by default.

- `README.md`  
  User-facing documentation. If behavior changes and this file does not, the change is incomplete.

---

## Development Workflow (Non-Negotiable)

1. **Plan First**  
   Explicitly list impacted files, schema changes, and test strategy before touching code.

2. **Validate All Inputs**  
   Every external payload must flow through Pydantic models. Bare dicts are forbidden.

3. **Async Discipline**  
   All heavy DB reads/writes must run inside `async_add_executor_job`.  
   Blocking the event loop is a failure condition.

4. **Schema Changes**  
   - Update schema constants.
   - Document migrations.
   - Bump the manifest version.
   - Assume existing installs matter.

5. **Documentation Drift Check**  
   If API shape, schema, or UI behavior changes, update README and changelog in the same commit.

6. **Tests Are Mandatory**  
   Extend or add tests whenever behavior changes. Target edge cases, not happy paths.

7. **Panel Assets**  
   Keep iframe HTML and static assets synchronized with API behavior.  
   Never inline large HTML blobs in Python files.

---

## Quality Bar & Enforcement

The following rules are enforced by reviewers and CI. Do not negotiate with them.

- Logs must be actionable and low-noise.
- Avoid stack traces unless they materially aid debugging.
- ASCII-only source unless the file already mandates Unicode.
- Comments are allowed only for non-obvious logic.
- The custom panel must render correctly on both desktop and mobile.
- Database schema changes require explicit migration notes.
- Minimum pytest coverage: **90% overall**.
- Each completed unit of work must be committed immediately using **conventional commits**  
  Example: `feat(runtime): patch assist pipeline safely`

Before opening a PR, you must run:
```
uv run pytest --cov=custom_components/intentsity --cov=tests
```
Paste the coverage summary directly into the PR description.

---

## Release Checklist

All items must be satisfied before tagging a release:

- [ ] `manifest.json` version bumped and matches `pyproject.toml`
- [ ] Dependencies pinned with compatible ranges (no bare `*`)
- [ ] README feature list and API docs updated
- [ ] Tests pass on macOS and Linux runners
- [ ] Coverage ≥ 90%
- [ ] Commits squashed or stacked logically (docs → feat → fix → test → chore)

---

## Troubleshooting & Triage

- Fast iteration on pipeline logging:
  ```
  uv run pytest tests/test_runtime.py -k intent
  ```

- Panel fails to load:
  - Check browser console for CSP violations
  - Confirm iframe URL matches `_PANEL_URL_PATH`

- Database schema issues:
  - Local dev: delete `intentsity.db` and rerun `async_setup`
  - Production: never ship breaking schema changes without an upgrade path

If something feels fragile, it probably is. Fix it properly instead of hoping no one notices.
