// Shared display constants. These MUST match the backend's constants in main.py:
//   - FORMAT_NAMES keys  ↔  main.py's DISPLAY_MODES
//   - SKILL_LABELS keys  ↔  main.py's TRACKED_SKILLS
//
// If you rename a skill or format here without renaming it in main.py (or vice
// versa), the mastery bars go blank and the format badge shows "undefined" —
// with no error. That's how we learned to keep the two lists side by side.

// Pretty labels for the four presentation formats the bandit can pick.
export const FORMAT_NAMES = Object.freeze({
  plain_text: "Plain Text",
  open_dyslexic: "OpenDyslexic",
  audio: "Audio",
  simplified_text: "Simplified",
});

// Human-readable names for the three skills the BKT engine tracks.
export const SKILL_LABELS = Object.freeze({
  short_vowels: "Short Vowels",
  sight_words: "Sight Words",
  comprehension: "Comprehension",
});

// Canonical skill list — derived, not duplicated. If a new skill shows up
// in main.py, it still won't appear here until we add a label for it, but at
// least the two lists can't drift out of sync.
export const SKILLS = Object.keys(SKILL_LABELS);

// Safe lookups. Callers should use these instead of indexing the maps
// directly — that way an unknown format/skill from a future backend build
// shows as a readable string instead of "undefined" in the UI.
export function formatLabel(id) {
  return FORMAT_NAMES[id] ?? id;
}

export function skillLabel(id) {
  return SKILL_LABELS[id] ?? id;
}
