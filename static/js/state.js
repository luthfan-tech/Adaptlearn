// Central store for everything the UI cares about.
//
// Two things to note before you add a field here:
//   1. `state` is a mutable object. Modules import it and read it directly.
//      Writes should go through update() so nothing gets surprised, but the
//      export is not frozen — this is deliberate, changing it would mean
//      touching every module and we're past the point of that being safe.
//   2. The `stats` counters are session-scoped (they reset on page reload).
//      `streak` is "correct answers in a row right now"; `correct` is
//      "correct answers this whole session" and drives the ⭐ counter in
//      the header via renderStats() in quiz.js.

export const state = {
  // filled in by /api/state on load — see app.js init()
  mastery: {},
  disability: "dyslexia",

  // position in the lesson library; 0-indexed
  modIdx: 0,
  passageIdx: 0,
  questionIdx: 0,

  // which presentation the bandit picked (see format.js). Keep the field
  // name "currentFormat" — it matches main.py's DISPLAY_MODES contract and
  // renaming it would ripple into format.js / app.js / quiz.js for no gain.
  currentFormat: "plain_text",

  // gamification counters — see quiz.js submitAnswer()
  stats: {
    answered: 0,
    correct: 0,
    streak: 0,
  },
};

// Merge a partial patch into state. Deliberately not notifying any
// subscriber set — if we ever want reactive rendering we'll add a proper
// subscriber here, but right now each caller re-renders explicitly
// (renderMastery, renderStats, etc.) and that's clearer to read.
export function update(patch) {
  Object.assign(state, patch);
}

// ── level-completion storage ──
// The source of truth for "which levels are green on the map". Stored as
// a JSON array of passage ids in localStorage. Both app.js (reading, to
// paint the map) and quiz.js (writing, on level complete) go through
// these — keeping the parse/write in one place stops the two from
// drifting if the key or shape ever changes.

const LEVEL_PROGRESS_KEY = "adaptlearn_completed";

export function readCompletedLevels() {
  const raw = localStorage.getItem(LEVEL_PROGRESS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn("Corrupt level progress in localStorage, resetting:", err);
    return [];
  }
}

export function markLevelComplete(passageId) {
  if (!passageId) return;
  const done = readCompletedLevels();
  if (done.includes(passageId)) return;
  done.push(passageId);
  localStorage.setItem(LEVEL_PROGRESS_KEY, JSON.stringify(done));
}
