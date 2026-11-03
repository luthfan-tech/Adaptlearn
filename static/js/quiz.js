// The learning loop. This is the busiest module — it owns:
//   - fetching the lesson library from the backend
//   - rendering the current passage + question
//   - grading answers (via the backend, not locally — the answers never
//     reach the client, so we can't cheat)
//   - the pet / streak / star gamification
//   - the pop-up dictionary (small hardcoded map, see DICTIONARY below)
//
// The pop-up dictionary is deliberately hardcoded here instead of fetched.
// It's faster, it works offline, and it lets us hand-pick kid-friendly
// definitions. If the curriculum ever adds words, update DICTIONARY — the
// hasDefinition() helper is what speech.js uses to decide which words get
// the clickable underline.

import { state, update } from "./state.js";
import { api } from "./api.js";
import { toast } from "./toast.js";
import * as speech from "./speech.js";
import { updateFormatUI } from "./format.js";
import { renderMastery } from "./mastery.js";

let curriculum = [];

const LEVEL_PROGRESS_KEY = "adaptlearn_completed";
const STARS_PER_CORRECT = 3; // policy, not magic number — see renderStats()
const PET_EVOLUTION_STREAK = 3; // correct-in-a-row to become a fox

// Words that get the "hard word" treatment: clickable + underline + popup.
// Grouped by the module they belong to, so adding a new module is one block.
const DICTIONARY = {
  // Phonics
  cat: { emoji: "🐈", def: "A small, furry pet animal that says meow." },
  hat: { emoji: "🎩", def: "A covering you wear on your head." },

  // Daily Life
  home: { emoji: "🏠", def: "The place where you live with your family." },
  bed: { emoji: "🛏️", def: "A piece of furniture you sleep on at night." },

  // Money Math
  coin: { emoji: "🪙", def: "A small, round piece of metal used as money." },
  cash: { emoji: "💵", def: "Paper money you can hold in your hand." },

  // Shopping
  food: { emoji: "🍎", def: "Things you eat, like fruits, bread, and rice." },
  cart: { emoji: "🛒", def: "A basket with wheels you push in a store." },

  // Travel
  bus: {
    emoji: "🚌",
    def: "A large vehicle that carries many people on the road.",
  },
  map: { emoji: "🗺️", def: "A drawing that shows where places are." },

  // Health
  doctor: {
    emoji: "🩺",
    def: "A person who helps you feel better when you are sick.",
  },
  pill: { emoji: "💊", def: "A small medicine you swallow with water." },

  // Weather
  rain: { emoji: "🌧️", def: "Water drops that fall from the clouds." },
  sun: { emoji: "☀️", def: "The big star that gives us light and warmth." },

  // Jobs
  work: { emoji: "💼", def: "A job or activity you do to earn money." },
  pay: { emoji: "💰", def: "Money you give someone for doing a job." },

  // Safety
  fire: { emoji: "🔥", def: "Hot, bright flames that can burn things." },
  help: {
    emoji: "🆘",
    def: "To give someone what they need, like support or care.",
  },

  // Social
  hello: { emoji: "👋", def: "A word you say when you meet someone." },
  smile: { emoji: "😊", def: "A happy expression you make with your mouth." },
};

// ── dictionary helpers ──

function normalizeWord(word) {
  // lowercase + strip punctuation so "Cat," and "CAT" both match "cat".
  // NOTE: also strips apostrophes, so "don't" becomes "dont" — fine for now,
  // there are no apostrophe words in the dictionary, but if that changes
  // we'll need a smarter tokenizer here.
  return word.toLowerCase().replace(/[^a-z]/g, "");
}

export function hasDefinition(word) {
  return normalizeWord(word) in DICTIONARY;
}

export function getDefinition(word) {
  return DICTIONARY[normalizeWord(word)] || null;
}

// ── window-level handlers (called from inline HTML / speech.js) ──
// Only defined words get the popup, which is the whole point of the
// "specific hard words" design — see the file header comment.

window.openDictionary = function (word) {
  const data = getDefinition(word);
  if (!data) return;

  const modal = document.getElementById("dictionaryModal");
  if (!modal) return;

  const wordEl = document.getElementById("dictWord");
  const emojiEl = document.getElementById("dictEmoji");
  const defEl = document.getElementById("dictDefinition");
  const clean = normalizeWord(word);

  if (wordEl) wordEl.textContent = clean;
  if (emojiEl) emojiEl.textContent = data.emoji;
  if (defEl) defEl.textContent = data.def;

  modal.classList.add("show");
  speech.readAloud(clean + ". " + data.def);
};

window.closeDictionary = function () {
  const modal = document.getElementById("dictionaryModal");
  if (modal) modal.classList.remove("show");
  speech.stopAudio();
};

window.playDictAudio = function () {
  const word = document.getElementById("dictWord")?.textContent || "";
  const def = document.getElementById("dictDefinition")?.textContent || "";
  speech.readAloud(word + ". " + def);
};

// ── curriculum ──

export async function loadCurriculum() {
  curriculum = await api.getCurriculum();
  return curriculum;
}

export function currentPassage() {
  const mod = curriculum[state.modIdx];
  return mod && mod.passages[state.passageIdx];
}

// ── localStorage progress (safe parse — see app.js's readCompletedLevels) ──
// NOTE: this duplicates app.js's helper intentionally for now. When we
// refactor state.js, these two copies merge into one. Keeping them separate
// during the refactor so neither file breaks on its own.

function readCompleted() {
  const raw = localStorage.getItem(LEVEL_PROGRESS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    console.warn("Corrupt level progress — resetting");
    return [];
  }
}

function markComplete(passageId) {
  const done = readCompleted();
  if (done.includes(passageId)) return;
  done.push(passageId);
  localStorage.setItem(LEVEL_PROGRESS_KEY, JSON.stringify(done));
}

// ── rendering ──

export function renderPassage() {
  const passage = currentPassage();
  if (!passage) return;

  const mod = curriculum[state.modIdx];

  const titleEl = document.getElementById("passageTitle");
  const aidEmoji = document.getElementById("visualAidEmoji");
  const aidText = document.getElementById("visualAidText");

  if (titleEl) titleEl.textContent = passage.title;
  if (aidEmoji) aidEmoji.textContent = mod.icon;
  if (aidText) aidText.textContent = mod.title;

  // simplified_text swaps the passage body for the LLM-rewritten version.
  // Keep in sync with main.py's /api/simplify flow (app.js's simplifyBtn
  // writes the result back to passage.simplified).
  const bodyText =
    state.currentFormat === "simplified_text"
      ? passage.simplified
      : passage.text;

  speech.stopAudio();
  const host = document.getElementById("passageText");
  if (host) speech.prepareWords(host, bodyText);

  updateFormatUI();
  renderQuestion();
}

export function renderQuestion() {
  const passage = currentPassage();
  const question = passage && passage.questions[state.questionIdx];

  const promptEl = document.getElementById("questionPrompt");
  const submitBtn = document.getElementById("submitBtn");
  const input = document.getElementById("answerInput");
  const fb = document.getElementById("feedback");

  // wipe any leftover feedback from the previous question
  if (fb) {
    fb.className = "feedback";
    fb.textContent = "";
  }

  if (!question) {
    // no more questions → end of level
    if (promptEl) promptEl.textContent = "🎉 Level complete!";
    if (submitBtn) submitBtn.disabled = true;
    if (input) input.disabled = true;
    return;
  }

  if (promptEl) promptEl.textContent = question.prompt;
  if (input) {
    input.value = "";
    input.disabled = false;
    input.focus();
  }
  if (submitBtn) submitBtn.disabled = false;
}

// ── answering ──

export async function submitAnswer() {
  const passage = currentPassage();
  const question = passage && passage.questions[state.questionIdx];
  if (!question) return;

  const input = document.getElementById("answerInput");
  if (!input) return;

  const answerText = input.value.trim();
  if (!answerText) return;

  let result;
  try {
    result = await api.answer({
      passage_id: passage.id,
      question_id: question.id,
      response: answerText,
    });
  } catch (err) {
    console.error("submitAnswer failed:", err);
    toast("Could not check your answer", "error");
    return;
  }

  // update stats locally — server response has all_mastery but not stats
  const nextStats = { ...state.stats };
  nextStats.answered += 1;

  if (result.correct) {
    nextStats.correct += 1;
    nextStats.streak += 1;

    // ADHD profile: skip the particle blast, but don't skip the reward
    // — the toast is the acknowledgement. Confetti is a known focus
    // disruptor for ADHD readers; the "nice work" signal still lands.
    if (state.disability === "adhd") {
      toast("Nice! ⭐", "success");
    } else if (window.confetti) {
      window.confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    }
    evolvePet(nextStats.streak);
  } else {
    nextStats.streak = 0;
    evolvePet(0);
  }

  // NOTE: the /api/answer response already carries all_mastery, so we don't
  // re-fetch /api/state here — the frontend never reads history or bandit,
  // so the second round-trip was pure latency.
  update({
    mastery: result.all_mastery,
    stats: nextStats,
  });

  renderMastery();
  renderStats();

  const fb = document.getElementById("feedback");
  if (fb) {
    fb.className =
      "feedback show " + (result.correct ? "correct" : "incorrect");
    fb.textContent = ""; // wipe, then build with DOM (no innerHTML injection)

    if (result.correct) {
      fb.textContent = "✅ Correct!";
    } else {
      fb.append("❌ Answer was ");
      const strong = document.createElement("strong");
      strong.textContent = result.expected;
      fb.append(strong, ".");
    }
  }
}

function evolvePet(streak) {
  const pet = document.getElementById("digitalPet");
  const levelBadge = document.getElementById("petLevel");

  if (streak >= PET_EVOLUTION_STREAK) {
    if (pet) pet.textContent = "🦊";
    if (levelBadge) levelBadge.textContent = "Lvl 3";
  } else if (streak >= 1) {
    if (pet) pet.textContent = "🐥";
    if (levelBadge) levelBadge.textContent = "Lvl " + Math.min(2, streak + 1);
  } else {
    if (pet) pet.textContent = "🐣";
    if (levelBadge) levelBadge.textContent = "Lvl 1";
  }
}

// ── level progression ──

export function nextQuestion() {
  const passage = currentPassage();
  if (!passage) return;

  if (state.questionIdx < passage.questions.length - 1) {
    update({ questionIdx: state.questionIdx + 1 });
    renderPassage();
    return;
  }

  // last question of the level → mark complete + celebrate + return to map
  markComplete(passage.id);

  toast("🎉 Level Cleared!", "success");
  // Level-clear confetti is a bigger "moment" than a single correct answer,
  // so ADHD users still get it here — but at a much lower particle count.
  // Rationale: a short burst at the end of a level is a *milestone*
  // celebration, not a per-question distraction. If you'd rather gate
  // this too, change the condition to `state.disability !== "adhd"`.
  if (window.confetti) {
    const count = state.disability === "adhd" ? 40 : 200;
    window.confetti({ particleCount: count, spread: 100, origin: { y: 0.4 } });
  }
  setTimeout(() => {
    if (window.showMap) window.showMap();
  }, 2000);

  renderPassage();
}

// ── sidebar stats ──

export function renderStats() {
  const streakEl = document.getElementById("statStreak");
  const starsEl = document.getElementById("statStars");
  if (streakEl) streakEl.textContent = "🔥 " + state.stats.streak;
  if (starsEl)
    starsEl.textContent = "⭐ " + state.stats.correct * STARS_PER_CORRECT;
}
