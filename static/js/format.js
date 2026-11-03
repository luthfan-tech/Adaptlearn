// Presentation-format controller. Owns two things:
//   1. Picking a format via the bandit (chooseFormat)
//   2. Painting the format badge / current-format label + applying
//      OpenDyslexic when the *profile* says so (updateFormatUI)
//
// IMPORTANT: body.dyslexic is owned by app.js (profile toggle). This file
// used to toggle it based on currentFormat, which silently reverted a
// dyslexic student's font whenever the bandit picked plain_text. Do not
// re-introduce a body.classList.toggle("dyslexic", ...) here — use the
// .passage-text scope for format-specific font styling instead.

import { state, update } from "./state.js";
import { formatLabel } from "./config.js";
import { api } from "./api.js";
import { toast } from "./toast.js";

// Refresh the format badge, the "Current format:" label, and (indirectly)
// any passage-text styling that reads state.currentFormat.
export function updateFormatUI() {
  const label = formatLabel(state.currentFormat);

  const badge = document.getElementById("passageBadge");
  const currentLabelEl = document.getElementById("currentFormat");

  if (badge) badge.textContent = label;
  if (currentLabelEl) currentLabelEl.textContent = label;

  // NOTE: previously this line toggled body.dyslexic based on currentFormat.
  // Removed — the *profile* owns that class (app.js), the *format* only
  // affects how the passage itself is rendered. If you want the format to
  // also change the passage font, add a targeted rule keyed on a data
  // attribute rather than flipping a global body class.
}

// Ask the bandit for the next format. Returns the format id (string).
export async function chooseFormat() {
  try {
    const result = await api.chooseFormat();
    // result.disability echoes the server's view — currently unused, but
    // it's here if we ever want to reconcile a stale client profile.
    update({ currentFormat: result.format });
    updateFormatUI();
    return result.format;
  } catch (err) {
    // Callers (app.js) also catch and toast — but we toast here too so
    // a bare `await chooseFormat()` doesn't fail silently during dev.
    console.error("chooseFormat failed:", err);
    toast("Could not pick a format", "error");
    throw err;
  }
}

// Thumbs-up/down on the current format → bandit reward.
// Fire-and-forget by design: a network blip means this one observation
// never reaches the bandit, but we don't block the UI on it.
export async function sendFeedback(helpful) {
  try {
    await api.feedback(state.currentFormat, helpful);
    toast(helpful ? "Noted!" : "We will try something else.", "info");
  } catch (err) {
    console.error("feedback failed:", err);
    toast("Feedback failed", "error");
  }
}
