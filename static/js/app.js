// App entry point. This file is the *glue* — it wires the DOM buttons
// to the modules, boots the state from the server, and paints the quest map.
// All the actual logic lives elsewhere (quiz.js, format.js, speech.js, …).
//
// NOTE: there are a bunch of window.* functions in here (showMap, startQuest,
// openModule, closeLevelModal). They exist because inline onclick="..."
// handlers in dynamically injected HTML can't close over module scope.
// They're the load-bearing glue — quiz.js also stashes openDictionary,
// closeDictionary, playDictAudio on window for the same reason. Don't
// delete one of these without grepping for its name in the HTML strings.

import { api } from "./api.js";
import { state, update, readCompletedLevels } from "./state.js";
import * as quiz from "./quiz.js";
import * as format from "./format.js";
import * as speech from "./speech.js";
import { renderMastery } from "./mastery.js";
import { toast } from "./toast.js";

// renamed from curriculumData — the brief asked for "lessonLibrary"
let lessonLibrary = [];

// ── window-level handlers (called from inline HTML onclick) ──

window.showMap = function () {
  document.getElementById("questMapView").style.display = "block";
  document.getElementById("quizView").style.display = "none";
};

window.startQuest = function (modIdx, passIdx) {
  update({ modIdx, passageIdx: passIdx, questionIdx: 0 });
  quiz.renderPassage();
  document.getElementById("questMapView").style.display = "none";
  document.getElementById("quizView").style.display = "grid";
};

window.openModule = function (modIdx) {
  const module = lessonLibrary[modIdx];
  if (!module) {
    console.error("openModule: no module at index", modIdx);
    return;
  }

  const done = readCompletedLevels();

  // build the 1..10 buttons, tagging completed ones
  let levelButtons = "";
  for (let i = 0; i < module.passages.length; i++) {
    const passage = module.passages[i];
    const cssClass = done.includes(passage.id)
      ? "level-btn completed"
      : "level-btn";

    // inline onclick must call through window.startQuest, not a closure —
    // this HTML gets parsed by the browser, not by us
    levelButtons +=
      `<button class="${cssClass}" ` +
      `onclick="startQuest(${modIdx},${i}); closeLevelModal()">` +
      `${i + 1}</button>`;
  }

  // lazy-create the modal once, then reuse
  let modal = document.getElementById("levelModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "levelModal";
    modal.className = "modal-overlay";
    document.body.appendChild(modal);
  }

  modal.innerHTML =
    `<div class="modal-content sticker-card">` +
    `<div class="modal-header">` +
    `<h2>${module.icon} ${module.title}</h2>` +
    `<button class="close-btn" onclick="closeLevelModal()">✕</button>` +
    `</div>` +
    `<div class="level-list">${levelButtons}</div>` +
    `</div>`;

  modal.classList.add("show");
};

window.closeLevelModal = function () {
  const m = document.getElementById("levelModal");
  if (m) m.classList.remove("show");
};

// ── startup ──

async function init() {
  // wire the DOM first, so that even if the network is down the profile
  // toggle + back button still work. Wiring used to live inside the try
  // block, which meant one failed fetch left the page dead-ends.
  wireEvents();

  try {
    const serverState = await api.getState();
    update({
      mastery: serverState.mastery,
      disability: serverState.disability,
      bandit: serverState.bandit,
      history: serverState.history || [],
    });
  } catch (err) {
    // state fetch is nice-to-have; the app still runs on defaults
    console.error("Could not load learner state:", err);
    toast("Offline mode — progress won't sync", "error");
  }

  try {
    lessonLibrary = await quiz.loadCurriculum();
    renderMap();
  } catch (err) {
    console.error("Could not load curriculum:", err);
    toast("Could not load the lesson map", "error");
    return; // nothing else works without the map
  }

  quiz.renderStats();
  renderMastery();
  format.updateFormatUI();
}

function renderMap() {
  const grid = document.getElementById("mapGrid");
  if (!grid) {
    // this is a coding bug, not a user error — no alert
    console.error("renderMap: #mapGrid is missing from index.html");
    return;
  }

  grid.innerHTML = "";

  lessonLibrary.forEach((module, idx) => {
    const tile = document.createElement("div");
    tile.className = "map-module";
    tile.onclick = () => window.openModule(idx);
    tile.innerHTML =
      `<div class="module-icon">${module.icon}</div>` +
      `<div class="module-title">${module.title}</div>` +
      `<div class="module-progress">10 Levels</div>`;
    grid.appendChild(tile);
  });
}

// ── DOM wiring ──

function wireEvents() {
  // tiny shim so a missing element doesn't crash the whole boot
  const on = (id, handler) => {
    const el = document.getElementById(id);
    if (el) el.onclick = handler;
    else console.warn("wireEvents: #" + id + " not found");
  };

  on("submitBtn", quiz.submitAnswer);
  on("nextBtn", quiz.nextQuestion);
  on("backToMapBtn", () => window.showMap());

  // dictAudioBtn calls a handler that quiz.js stashes on window.
  // If quiz.js ever stops doing that, this click dies silently — hence
  // the existence check + warn instead of a bare call.
  on("dictAudioBtn", () => {
    if (typeof window.playDictAudio === "function") window.playDictAudio();
    else console.warn("dictAudioBtn: window.playDictAudio is not defined");
  });

  // enter-to-submit on the answer field
  const answerInput = document.getElementById("answerInput");
  if (answerInput) {
    answerInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") quiz.submitAnswer();
    });
  }

  on("chooseFormatBtn", async () => {
    try {
      const picked = await format.chooseFormat();
      quiz.renderPassage();
      toast("Format: " + picked.replace(/_/g, " "), "info");
    } catch (err) {
      console.error("chooseFormat failed:", err);
      toast("Error switching format", "error");
    }
  });

  on("helpfulBtn", () => format.sendFeedback(true));
  on("notHelpfulBtn", () => format.sendFeedback(false));

  on("readAloudBtn", () => {
    const textEl = document.getElementById("passageText");
    const stopBtn = document.getElementById("stopAudioBtn");
    if (!textEl) return;

    if (stopBtn) stopBtn.hidden = false;
    speech.readAloud(textEl.innerText, () => {
      if (stopBtn) stopBtn.hidden = true;
    });
  });

  on("stopAudioBtn", () => {
    speech.stopAudio();
    const sb = document.getElementById("stopAudioBtn");
    if (sb) sb.hidden = true;
  });

  on("micBtn", async () => {
    const btn = document.getElementById("micBtn");
    if (btn) btn.classList.add("recording");

    try {
      const transcript = await speech.speakAnswer();
      const input = document.getElementById("answerInput");
      if (input) input.value = transcript;
    } catch (err) {
      toast("Speech: " + err.message, "error");
    } finally {
      if (btn) btn.classList.remove("recording");
    }
  });

  on("simplifyBtn", async () => {
    const passage = quiz.currentPassage();
    if (!passage) return;

    const btn = document.getElementById("simplifyBtn");
    if (btn) btn.disabled = true;

    try {
      const result = await api.simplify(passage.text);
      // mutate the in-memory passage so renderPassage picks up the new text
      passage.simplified = result.simplified;
      // NOTE: key is still "currentFormat" — do NOT rename until the
      // coordinated format.js/quiz.js/state.js pass. Renaming here alone
      // would break every reader.
      update({ currentFormat: "simplified_text" });
      quiz.renderPassage();
      toast("Simplified!", "success");
    } catch (err) {
      console.error("simplify failed:", err);
      toast("Error simplifying", "error");
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  document.querySelectorAll(".profile-btn").forEach((btn) => {
    btn.onclick = async (evt) => {
      evt.preventDefault();
      const profile = evt.currentTarget.dataset.profile;

      // flip the visible active pill first — instant feedback beats
      // waiting on the server round-trip
      document
        .querySelectorAll(".profile-btn")
        .forEach((b) => b.classList.remove("active"));
      evt.currentTarget.classList.add("active");

      update({ disability: profile });

      // Two independent body classes, one per profile:
      //   .dyslexic → font swap (see style.css)
      //   .adhd     → reduced motion + narrower reading column (see style.css)
      // format.js no longer touches these — the *profile* owns them, the
      // *format* only changes the passage text rendering.
      document.body.classList.toggle("dyslexic", profile === "dyslexia");
      document.body.classList.toggle("adhd", profile === "adhd");

      // backend sync is best-effort — the UI already moved
      try {
        await api.setProfile(profile);
      } catch (err) {
        console.warn("Profile sync failed:", err);
      }

      toast("Profile: " + profile.toUpperCase(), "success");
    };
  });
}

// kick it off
init();
