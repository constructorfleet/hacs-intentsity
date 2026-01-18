import {
    LitElement,
    html,
    css,
} from "lit";

class IntentsityPanel extends LitElement {
    render() {
        return html`<h1>Assist Intent Review</h1>
            <p> Track Assist pipeline runs, curate expected responses, and mark conversations as reviewed.</p >
        <div class="controls">
            <label for="limit">Rows:</label>
            <input id="limit" type="number" min="1" max="500" value="100" />
            <button type="button" onclick="loadRuns()">Refresh</button>
        </div>
        <div class="layout">
            <section>
                <section id="run-list" class="run-grid"></section>
            </section>
            <aside id="editor" class="editor-panel">
                <div class="editor-empty">
                    <h2>Review workspace</h2>
                    <p>Select an IntentStart to reorder events and pin the expected response.</p>
                </div>
            </aside>
        </div>
        <script>
            const DEFAULT_LIMIT = 100;
            const MAX_LIMIT = 500;
            const LIST_COMMAND = 'list_events';
            const SUBSCRIBE_COMMAND = 'subscribe_events';
            const SAVE_COMMAND = 'save_review';
            const state = {
                runs: [],
                limit: DEFAULT_LIMIT,
                selectedRunId: null,
                selectedStartId: null,
                editorSteps: [],
                editorWarning: '',
                matchedExpectations: true,
                isSaving: false,
            };

            let unsubscribe = null;

            function clampLimit(raw) {
                const value = Number.isFinite(raw) ? raw : DEFAULT_LIMIT;
                return Math.max(1, Math.min(MAX_LIMIT, value || DEFAULT_LIMIT));
            }

            async function getConnection() {
                if (!window.hassConnection) {
                    throw new Error('Home Assistant connection unavailable');
                }
                const { conn } = await window.hassConnection;
                return conn;
            }

            function formatJson(value) {
                if (!value) {
                    return '{\n  \n}';
                }
                try {
                    return JSON.stringify(value, null, 2);
                } catch (err) {
                    return '{\n  "raw": "unserializable"\n}';
                }
            }

            function updateRuns(runs) {
                state.runs = Array.isArray(runs) ? runs : [];
                renderRunList();
                renderEditor();
            }

            function renderRunList() {
                const container = document.getElementById('run-list');
                container.innerHTML = '';
                state.runs.forEach((run) => {
                    const card = document.createElement('article');
                    card.className = 'run-card';
                    const reviewed = Boolean(run.review);
                    const reviewLabel = reviewed ? 'Reviewed' : 'Needs review';
                    const reviewClass = reviewed ? 'pill badge-reviewed' : 'pill badge-pending';
                    const header = \`
                    <div class="run-header">
                        <h2>\${run.name || 'Assist Run'}</h2>
                        <span class="pill">\${run.run_id.slice(0, 8)} · \${new Date(run.created_at).toLocaleString()}</span>
                        <span class="pill">\${run.conversation_engine || 'engine'} · \${run.language || 'lang'}</span>
                        <span class="\${reviewClass}">\${reviewLabel}</span>
                    </div>
                \`;
                    const startButtons = (run.intent_starts || [])
                        .map((start, idx) => {
                            const startId = typeof start.id === 'number' ? start.id : null;
                            const isActive = state.selectedRunId === run.run_id && state.selectedStartId === startId;
                            if (!startId) {
                                return \`<button type="button" class="start-button" disabled title="Requires database ID">Start \${idx + 1}</button>\`;
                            }
                            const label = start.intent_input || \`Start \${idx + 1}\`;
                            return \`<button type="button" class="start-button\${isActive ? ' active' : ''}" data-run="\${run.run_id}" data-start="\${startId}">\${label}</button>\`;
                        })
                        .join('');

                    const starts = \`
                    <div class="section">
                        <h3>Intent Starts</h3>
                        <div class="start-grid">\${startButtons || '<span class="pill badge-pending">No starts yet</span>'}</div>
                    </div>
                \`;

                    const progress = renderSection('Intent Progress', run.intent_progress || [], (item) => \`
                    \${item.chat_log_delta ? \`<div>Chat Delta:<pre>\${JSON.stringify(item.chat_log_delta, null, 2)}</pre></div>\` : ''}
                    \${typeof item.tts_start_streaming !== 'undefined' && item.tts_start_streaming !== null ? \`<div>TTS Streaming: \${item.tts_start_streaming}</div>\` : ''}
                \`);
                    const ends = renderSection('Intent Ends', run.intent_ends || [], (item) => \`
                    <div>Processed locally: \${item.processed_locally ?? 'n/a'}</div>
                    <div>Intent Output:<pre>\${JSON.stringify(item.intent_output || {}, null, 2)}</pre></div>
                \`);

                    card.innerHTML = header + starts + progress + ends;
                    container.appendChild(card);
                });

                container.querySelectorAll('[data-start]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const runId = button.getAttribute('data-run');
                        const startId = parseInt(button.getAttribute('data-start'), 10);
                        selectStart(runId, startId);
                    });
                });
            }

            function renderSection(title, items, formatter) {
                if (!items || !items.length) {
                    return '';
                }
                const rows = items
                    .map(
                        (item) => \`
                    <div class="entry">
                        <time>\${new Date(item.timestamp).toLocaleString()}</time>
                        \${formatter(item)}
                    </div>\`
                    )
                    .join('');
                return \`<div class="section"><h3>\${title}</h3>\${rows}</div>\`;
            }

            function selectStart(runId, startId) {
                state.selectedRunId = runId;
                state.selectedStartId = startId;
                state.editorWarning = '';
                const run = state.runs.find((candidate) => candidate.run_id === runId);
                if (!run) {
                    return;
                }
                const review = run.review && (!run.review.intent_start_id || run.review.intent_start_id === startId) ? run.review : null;
                const stepsFromReview = deriveStepsFromReview(review);
                const steps = stepsFromReview || deriveStepsFromRun(run);
                if (!steps.length) {
                    state.editorSteps = [];
                    state.editorWarning = 'This run has not emitted INTENT_END yet.';
                } else {
                    state.editorSteps = steps;
                }
                state.matchedExpectations = review ? Boolean(review.matched_expectations) : true;
                renderRunList();
                renderEditor();
            }

            function deriveStepsFromReview(review) {
                if (!review || !review.expected_end) {
                    return null;
                }
                const steps = [];
                (review.expected_progress || []).forEach((item) => {
                    steps.push({
                        kind: 'progress',
                        chatText: formatJson(item.chat_log_delta || {}),
                        tts_start_streaming: typeof item.tts_start_streaming === 'boolean' ? item.tts_start_streaming : null,
                    });
                });
                steps.push({
                    kind: 'end',
                    intentText: formatJson(review.expected_end.intent_output || {}),
                    processed_locally: typeof review.expected_end.processed_locally === 'boolean' ? review.expected_end.processed_locally : null,
                });
                return steps;
            }

            function deriveStepsFromRun(run) {
                const steps = [];
                (run.intent_progress || []).forEach((item) => {
                    steps.push({
                        kind: 'progress',
                        chatText: formatJson(item.chat_log_delta || {}),
                        tts_start_streaming: typeof item.tts_start_streaming === 'boolean' ? item.tts_start_streaming : null,
                    });
                });
                const endEvent = (run.intent_ends || [])[0];
                if (endEvent) {
                    steps.push({
                        kind: 'end',
                        intentText: formatJson(endEvent.intent_output || {}),
                        processed_locally: typeof endEvent.processed_locally === 'boolean' ? endEvent.processed_locally : null,
                    });
                }
                return steps;
            }

            function renderEditor() {
                const editor = document.getElementById('editor');
                const run = state.runs.find((candidate) => candidate.run_id === state.selectedRunId);
                const start = run?.intent_starts?.find((item) => item.id === state.selectedStartId);

                if (!run || !state.selectedStartId) {
                    editor.innerHTML = \`
                    <div class="editor-empty">
                        <h2>Review workspace</h2>
                        <p>Select an IntentStart to reorder events and pin the expected response.</p>
                    </div>
                \`;
                    return;
                }

                if (!state.editorSteps.length) {
                    editor.innerHTML = \`
                    <div class="editor-empty">
                        <h2>\${start?.intent_input || 'Intent start'}</h2>
                        <p>\${state.editorWarning || 'No reviewable events yet.'}</p>
                    </div>
                \`;
                    return;
                }

                const stepsMarkup = state.editorSteps
                    .map((step, index) => renderStepCard(step, index))
                    .join('');

                editor.innerHTML = \`
                <div class="editor-meta">
                    <strong>\${start?.intent_input || 'Intent start'}</strong>
                    <span>Run • \${run.run_id.slice(0, 8)}</span>
                    \${start?.device_id ? \`<span>Device • \${start.device_id}</span>\` : ''}
                </div>
                <div class="step-list">\${stepsMarkup}</div>
                <div class="footer-actions">
                    <label class="switch">
                        <input type="checkbox" id="matched-switch" \${state.matchedExpectations ? 'checked' : ''} />
                        <span>Matched expectations</span>
                    </label>
                    <button id="save-review" type="button" \${state.isSaving ? 'disabled' : ''}>\${state.isSaving ? 'Saving…' : 'Save review'}</button>
                </div>
            \`;

                editor.querySelectorAll('[data-move-step]').forEach((button) => {
                    button.addEventListener('click', () => {
                        const index = parseInt(button.getAttribute('data-index'), 10);
                        const direction = parseInt(button.getAttribute('data-move-step'), 10);
                        moveStep(index, direction);
                    });
                });

                editor.querySelectorAll('[data-json-field]').forEach((area) => {
                    area.addEventListener('input', () => {
                        const index = parseInt(area.getAttribute('data-index'), 10);
                        const field = area.getAttribute('data-json-field');
                        handleJsonInput(index, field, area.value);
                    });
                });

                editor.querySelectorAll('[data-boolean-field]').forEach((select) => {
                    select.addEventListener('change', () => {
                        const index = parseInt(select.getAttribute('data-index'), 10);
                        const field = select.getAttribute('data-boolean-field');
                        handleBooleanChange(index, field, select.value);
                    });
                });

                const matchedSwitch = editor.querySelector('#matched-switch');
                matchedSwitch?.addEventListener('change', () => {
                    state.matchedExpectations = matchedSwitch.checked;
                });

                const saveButton = editor.querySelector('#save-review');
                saveButton?.addEventListener('click', handleSaveReview);
            }

            function renderStepCard(step, index) {
                const isEnd = step.kind === 'end';
                const label = isEnd ? 'Intent End' : \`Intent Progress \${index + 1}\`;
                const jsonField = isEnd ? 'intentText' : 'chatText';
                const jsonLabel = isEnd ? 'Intent Output (JSON)' : 'Chat Delta (JSON)';
                const selectField = isEnd ? 'processed_locally' : 'tts_start_streaming';
                const selectLabel = isEnd ? 'Processed locally' : 'TTS starts streaming';
                const selectValue = step[selectField];
                const canMoveUp = !isEnd && index > 0;
                const canMoveDown = !isEnd && index < state.editorSteps.length - 2;

                return \`
                <article class="step-card\${isEnd ? ' step-card--end' : ''}">
                    <header style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
                        <strong>\${label}</strong>
                        \${!isEnd ? \`<div class="step-controls">
                            <button type="button" class="ghost-button" data-move-step="-1" data-index="\${index}" \${canMoveUp ? '' : 'disabled'}>↑</button>
                            <button type="button" class="ghost-button" data-move-step="1" data-index="\${index}" \${canMoveDown ? '' : 'disabled'}>↓</button>
                        </div>\` : '<span class="pill badge-reviewed">END</span>'}
                    </header>
                    <label>
                        \${jsonLabel}
                        <textarea data-json-field="\${jsonField}" data-index="\${index}">\${step[jsonField] || ''}</textarea>
                    </label>
                    <label>
                        \${selectLabel}
                        <select data-boolean-field="\${selectField}" data-index="\${index}">
                            <option value="unknown" \${selectValue === null ? 'selected' : ''}>Unknown</option>
                            <option value="true" \${selectValue === true ? 'selected' : ''}>True</option>
                            <option value="false" \${selectValue === false ? 'selected' : ''}>False</option>
                        </select>
                    </label>
                </article>
            \`;
            }

            function handleJsonInput(index, field, value) {
                state.editorSteps[index][field] = value;
            }

            function handleBooleanChange(index, field, rawValue) {
                if (rawValue === 'true') {
                    state.editorSteps[index][field] = true;
                } else if (rawValue === 'false') {
                    state.editorSteps[index][field] = false;
                } else {
                    state.editorSteps[index][field] = null;
                }
            }

            function moveStep(index, direction) {
                const steps = state.editorSteps.slice();
                const target = index + direction;
                if (target < 0 || target >= steps.length - 1) {
                    return;
                }
                const [item] = steps.splice(index, 1);
                steps.splice(target, 0, item);
                state.editorSteps = steps;
                renderEditor();
            }

            async function handleSaveReview() {
                if (!state.selectedRunId || !state.selectedStartId) {
                    alert('Select an IntentStart to review.');
                    return;
                }
                if (!state.editorSteps.length) {
                    alert('Nothing to save yet.');
                    return;
                }

                const stepsPayload = [];
                let encounteredEnd = false;
                try {
                    state.editorSteps.forEach((step, index) => {
                        if (step.kind === 'end') {
                            encounteredEnd = true;
                            stepsPayload.push({
                                order_index: index,
                                kind: 'end',
                                processed_locally: step.processed_locally,
                                intent_output: step.intentText ? JSON.parse(step.intentText) : null,
                            });
                            return;
                        }
                        stepsPayload.push({
                            order_index: index,
                            kind: 'progress',
                            chat_log_delta: step.chatText ? JSON.parse(step.chatText) : null,
                            tts_start_streaming: step.tts_start_streaming,
                        });
                    });
                } catch (err) {
                    alert('Ensure all JSON fields are valid before saving.');
                    return;
                }

                if (!encounteredEnd) {
                    alert('The last element must be INTENT_END.');
                    return;
                }

                state.isSaving = true;
                renderEditor();

                try {
                    const conn = await getConnection();
                    await conn.sendMessagePromise({
                        type: SAVE_COMMAND,
                        run_id: state.selectedRunId,
                        intent_start_id: state.selectedStartId,
                        matched_expectations: state.matchedExpectations,
                        steps: stepsPayload,
                    });
                } catch (error) {
                    console.error(error);
                    alert('Failed to save review');
                } finally {
                    state.isSaving = false;
                    renderEditor();
                }
            }

            async function requestSnapshot(limit) {
                try {
                    const conn = await getConnection();
                    const response = await conn.sendMessagePromise({ type: LIST_COMMAND, limit });
                    updateRuns(response.runs || []);
                } catch (error) {
                    console.error(error);
                    alert('Failed to load runs');
                }
            }

            async function ensureSubscription(limit) {
                const conn = await getConnection();
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
                }
                unsubscribe = await conn.subscribeMessage((message) => {
                    const payload = message.event?.runs || message.runs || [];
                    updateRuns(payload);
                }, {
                    type: SUBSCRIBE_COMMAND,
                    limit,
                });
            }

            async function loadRuns() {
                const limitInput = document.getElementById('limit');
                const limit = clampLimit(parseInt(limitInput.value, 10));
                limitInput.value = limit;
                state.limit = limit;
                await requestSnapshot(limit);
                await ensureSubscription(limit);
            }

            window.onload = loadRuns;
            window.addEventListener('beforeunload', () => {
                if (unsubscribe) {
                    unsubscribe();
                    unsubscribe = null;
                }
            });
        </script>`;
    }

    static get styles() {
        return css`
        :root {
            --bg-gradient: radial-gradient(circle at top, #111430, #05060f 55%);
            --card-bg: rgba(9, 12, 25, 0.92);
            --card-border: rgba(125, 212, 255, 0.25);
            --accent: #7dd4ff;
            --danger: #ff8a7d;
            --text: #f4fbff;
            --muted: #9fb1cc;
        }

        * {
            box-sizing: border-box;
        }

        body {
            font-family: 'Space Grotesk', 'Segoe UI', sans-serif;
            margin: 0;
            padding: 32px;
            min-height: 100vh;
            color: var(--text);
            background: var(--bg-gradient);
        }

        h1 {
            margin: 0 0 8px;
            font-size: 30px;
        }

        p {
            margin: 0 0 24px;
            color: var(--muted);
        }

        .controls {
            display: flex;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
        }

        label {
            font-weight: 600;
        }

        input[type="number"] {
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid var(--card-border);
            color: var(--text);
            padding: 6px 10px;
            border-radius: 8px;
            width: 120px;
        }

        button {
            padding: 8px 18px;
            border-radius: 999px;
            border: none;
            background: var(--accent);
            color: #041727;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        button:hover {
            transform: translateY(-1px);
            box-shadow: 0 12px 28px rgba(125, 212, 255, 0.35);
        }

        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

        .layout {
            display: grid;
            grid-template-columns: minmax(0, 2fr) minmax(320px, 1fr);
            gap: 28px;
        }

        .run-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 18px;
        }

        .run-card {
            background: var(--card-bg);
            border: 1px solid var(--card-border);
            border-radius: 18px;
            padding: 18px;
            display: flex;
            flex-direction: column;
            gap: 14px;
            box-shadow: 0 26px 46px rgba(3, 5, 16, 0.7);
            animation: fadeIn 0.35s ease;
        }

        .run-header {
            display: flex;
            flex-direction: column;
            gap: 6px;
        }

        .pill {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 4px 12px;
            border-radius: 999px;
            background: rgba(125, 212, 255, 0.15);
            color: var(--accent);
            font-size: 12px;
            letter-spacing: 0.03em;
        }

        .pill.badge-reviewed {
            background: rgba(125, 255, 200, 0.12);
            color: #7dffbf;
        }

        .pill.badge-pending {
            background: rgba(255, 138, 125, 0.15);
            color: var(--danger);
        }

        .section {
            border-top: 1px solid rgba(255, 255, 255, 0.05);
            padding-top: 12px;
        }

        .section h3 {
            margin: 0 0 6px;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--muted);
        }

        .entry {
            margin: 0 0 6px;
            padding: 8px;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.03);
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .entry:last-child {
            margin-bottom: 0;
        }

        .start-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }

        .start-button {
            padding: 6px 14px;
            border-radius: 999px;
            border: 1px solid rgba(125, 212, 255, 0.4);
            background: transparent;
            color: var(--text);
            font-size: 13px;
            transition: background 0.2s ease;
        }

        .start-button.active {
            background: rgba(125, 212, 255, 0.2);
            color: var(--accent);
        }

        .start-button:disabled {
            opacity: 0.5;
            border-style: dashed;
        }

        .editor-panel {
            background: rgba(3, 5, 16, 0.85);
            border: 1px solid var(--card-border);
            border-radius: 22px;
            padding: 20px;
            box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05);
            min-height: 460px;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }

        .editor-panel h2 {
            margin: 0;
            font-size: 20px;
        }

        .editor-empty {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: var(--muted);
            border: 1px dashed rgba(255, 255, 255, 0.15);
            border-radius: 16px;
            padding: 24px;
        }

        .editor-meta {
            display: flex;
            flex-direction: column;
            gap: 6px;
            background: rgba(255, 255, 255, 0.02);
            border-radius: 14px;
            padding: 12px 14px;
        }

        .step-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .step-card {
            background: rgba(15, 20, 40, 0.9);
            border: 1px solid rgba(255, 255, 255, 0.07);
            border-radius: 14px;
            padding: 12px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }

        .step-card--end {
            border-color: rgba(125, 255, 200, 0.4);
        }

        textarea {
            width: 100%;
            min-height: 120px;
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 10px;
            padding: 8px;
            color: var(--text);
            font-family: 'JetBrains Mono', 'Fira Code', monospace;
        }

        select {
            background: rgba(0, 0, 0, 0.35);
            border: 1px solid rgba(255, 255, 255, 0.12);
            border-radius: 999px;
            padding: 4px 10px;
            color: var(--text);
        }

        .step-controls {
            display: flex;
            gap: 8px;
        }

        .ghost-button {
            border-radius: 10px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            background: transparent;
            color: var(--text);
            padding: 6px 10px;
        }

        .footer-actions {
            margin-top: auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 12px;
            flex-wrap: wrap;
        }

        .switch {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;
        }

        .switch input {
            accent-color: var(--accent);
        }

        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translateY(8px);
            }

            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @media (max-width: 960px) {
            .layout {
                grid-template-columns: 1fr;
            }

            .editor-panel {
                order: -1;
            }
        }

        @media (max-width: 600px) {
            body {
                padding: 20px;
            }

            input[type="number"] {
                width: 100%;
            }
        }
        `;
    }
}
customElements.define("intentsity", IntentsityPanel);