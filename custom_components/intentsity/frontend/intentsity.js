/* Minimal frontend helper for Intentsity.

This file provides tiny helpers to call the integration websocket API.
It's intentionally minimal — a small starting point for a full frontend panel.
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
})();
