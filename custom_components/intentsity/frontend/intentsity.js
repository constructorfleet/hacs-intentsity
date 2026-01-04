/* Enhanced frontend for Intentsity.

This file provides a basic UI for managing intents using the websocket API.
*/

(function () {
  function send(ws, type, payload) {
    const id = Math.floor(Math.random() * 1000000);
    return new Promise((resolve, reject) => {
      function handler(ev) {
        const msg = ev.detail;
        if (msg.id !== id) return;
        window.removeEventListener("intentsity_ws_response", handler);
        if (msg.type === "result") resolve(msg.result);
        else reject(msg.error);
      }
      window.addEventListener("intentsity_ws_response", handler);
      // Use the Home Assistant connection if available
      if (window.hass && window.hass.callWS) {
        window.hass
          .callWS({ type: type, entry_id: payload.entry_id, ...payload, id })
          .then((res) => {
            const event = new CustomEvent("intentsity_ws_response", { detail: { id, type: "result", result: res } });
            window.dispatchEvent(event);
          })
          .catch((err) => {
            const event = new CustomEvent("intentsity_ws_response", { detail: { id, type: "error", error: err } });
            window.dispatchEvent(event);
          });
      } else {
        reject(new Error("Home Assistant connection not available"));
      }
    });
  }

  window.intentsity = {
    listIntents: (entryId) => send(null, "intentsity/list_intents", { entry_id: entryId }),
    createIntent: (entryId, intent) => send(null, "intentsity/create_intent", { entry_id: entryId, intent }),
    updateIntent: (entryId, intentId, intent) => send(null, "intentsity/update_intent", { entry_id: entryId, intent_id: intentId, intent }),
    deleteIntent: (entryId, intentId) => send(null, "intentsity/delete_intent", { entry_id: entryId, intent_id: intentId }),
  };

  // Basic UI
  document.addEventListener("DOMContentLoaded", () => {
    const app = document.createElement("div");
    app.innerHTML = `
      <h1>Intentsity</h1>
      <button id="list-intents">List Intents</button>
      <ul id="intents-list"></ul>
      <form id="create-intent-form">
        <h2>Create Intent</h2>
        <input type="text" id="intent-id" placeholder="Intent ID" required />
        <textarea id="intent-payload" placeholder="Intent Payload (JSON)" required></textarea>
        <button type="submit">Create</button>
      </form>
    `;
    document.body.appendChild(app);

    const listButton = document.getElementById("list-intents");
    const intentsList = document.getElementById("intents-list");
    const createForm = document.getElementById("create-intent-form");

    listButton.addEventListener("click", async () => {
      const entryId = prompt("Enter Config Entry ID:");
      if (!entryId) return;
      const intents = await window.intentsity.listIntents(entryId);
      intentsList.innerHTML = intents.map((intent) => `<li>${intent.id}: ${intent.name}</li>`).join("");
    });

    createForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const entryId = prompt("Enter Config Entry ID:");
      if (!entryId) return;
      const intentId = document.getElementById("intent-id").value;
      const intentPayload = JSON.parse(document.getElementById("intent-payload").value);
      await window.intentsity.createIntent(entryId, { id: intentId, ...intentPayload });
      alert("Intent created successfully!");
    });
  });
})();
