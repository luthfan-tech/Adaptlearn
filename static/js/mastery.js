// Renders the three BKT mastery bars in the sidebar.
//
// The numbers we get from /api/state are *posteriors*, not "% correct":
// main.py seeds every skill at 0.1 and does a Bayesian update on each
// answer. So the raw value at session start is 0.1, not 0. To the student,
// "10% done before I've answered anything" is confusing — we normalize
// the prior out of the display so the bar starts at zero and hits 100%
// at true mastery. Underlying BKT math is untouched.

import { state } from "./state.js";
import { skillLabel } from "./config.js";

// Mirrors main.py's _blank_slate() starting posterior. Keep these in sync.
const BKT_PRIOR = 0.1;

// Turns a raw BKT posterior into a 0–100 display percentage.
function masteryToPercent(raw) {
  if (!Number.isFinite(raw)) {
    // NaN / null / undefined — this shouldn't happen, but if it does we
    // want to see it in the console, not just render a silent 0%.
    console.warn("mastery: non-numeric value from backend:", raw);
    return 0;
  }

  // Clamp to [0,1] before normalizing — _recalc_mastery can theoretically
  // drift outside that range if its parameters change.
  const clamped = Math.min(1, Math.max(0, raw));

  // Normalize the prior out, so 0.1 → 0% and 1.0 → 100%.
  const pct = (clamped - BKT_PRIOR) / (1 - BKT_PRIOR);
  return Math.round(Math.max(0, pct) * 100);
}

// Builds one skill's row: name + % + a progress bar.
// The aria-* attrs matter — this is the only place the app exposes
// numeric progress to assistive tech.
function skillRow(skill, pct) {
  const label = skillLabel(skill);

  return (
    `<div class="mastery-item">` +
    `<div class="mastery-label">` +
    `<strong>${label}</strong>` +
    `<span>${pct}%</span>` +
    `</div>` +
    `<div class="mastery-track"` +
    ` role="progressbar"` +
    ` aria-valuemin="0"` +
    ` aria-valuemax="100"` +
    ` aria-valuenow="${pct}"` +
    ` aria-label="${label} mastery: ${pct}%">` +
    `<div class="mastery-fill" style="width: ${pct}%"></div>` +
    `</div>` +
    `</div>`
  );
}

export function renderMastery() {
  const host = document.getElementById("masteryList");
  if (!host) return;

  // Build once, assign once — one reflow per render instead of N.
  const rows = Object.entries(state.mastery)
    .map(([skill, raw]) => skillRow(skill, masteryToPercent(raw)))
    .join("");

  host.innerHTML = rows;
}
