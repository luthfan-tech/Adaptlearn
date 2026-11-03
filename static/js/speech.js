// Everything to do with the browser's audio plumbing: TTS with per-word
// highlighting (bimodal reading), stop/reset, and one-shot speech-to-text
// for answering questions. Nothing here talks to the backend — that's all
// quiz.js / api.js territory.
//
// Bimodal highlighting works like this: prepareWords() wraps every visible
// word in a <span>, then readAloud() hooks SpeechSynthesisUtterance's
// onboundary event and highlights whichever span covers the current
// character index. Only words that have a dictionary entry are clickable —
// but every word is highlightable, otherwise the yellow "speaking" chip
// would jump over half the sentence.

import { hasDefinition } from "./quiz.js";

// Spans of the currently rendered passage, in document order.
// Rebuilt every time prepareWords() runs.
let wordSpans = [];

// Parallel to wordSpans: {start, end} character offsets of each word in
// the *original* text passed to prepareWords. This is what makes
// onboundary's charIndex line up with the right span even when the text
// has punctuation or multiple whitespace characters.
let wordRanges = [];

export function prepareWords(passageEl, text) {
  if (!passageEl) return;

  // Kill any utterance that's still trying to highlight the previous
  // passage. Without this, its onboundary callbacks fire against the
  // spans we're about to build, and the highlight jumps around.
  if ("speechSynthesis" in window) speechSynthesis.cancel();

  passageEl.innerHTML = "";
  wordSpans = [];
  wordRanges = [];

  let cursor = 0; // running char index in `text`
  const chunks = text.split(/(\s+)/);

  for (const chunk of chunks) {
    if (chunk === "") continue;

    if (/^\s+$/.test(chunk)) {
      passageEl.appendChild(document.createTextNode(chunk));
      cursor += chunk.length;
      continue;
    }

    const span = document.createElement("span");
    span.textContent = chunk;

    // only the "hard" words are clickable — the rest are plain text
    if (hasDefinition(chunk)) {
      span.className = "word";
      span.onclick = () => {
        if (typeof window.openDictionary === "function") {
          window.openDictionary(chunk);
        }
      };
    }

    passageEl.appendChild(span);
    wordSpans.push(span);
    wordRanges.push({ start: cursor, end: cursor + chunk.length });
    cursor += chunk.length;
  }
}

function clearHighlight() {
  for (const span of wordSpans) span.classList.remove("speaking");
}

function highlightAt(charIndex) {
  // Always clear first: if charIndex is out of range (or negative), the
  // *previous* word must not stay yellow.
  clearHighlight();

  for (let i = 0; i < wordRanges.length; i++) {
    const r = wordRanges[i];
    if (charIndex >= r.start && charIndex < r.end) {
      wordSpans[i].classList.add("speaking");
      return;
    }
  }
}

// Read text aloud and highlight each word as it's spoken.
// onEnd fires when playback completes OR is stopped — so callers can
// reliably hide a "Stop" button without duplicating the state.
export function readAloud(text, onEnd) {
  if (!("speechSynthesis" in window)) {
    if (onEnd) onEnd();
    return;
  }

  speechSynthesis.cancel();
  clearHighlight();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;

  utterance.onboundary = (evt) => {
    if (typeof evt.charIndex === "number") highlightAt(evt.charIndex);
  };

  utterance.onend = () => {
    clearHighlight();
    if (onEnd) onEnd();
  };

  // Some browsers (older Safari, some Chromium builds) fire `error` when
  // an utterance is canceled — without this, the "Stop" button gets stuck.
  utterance.onerror = () => {
    clearHighlight();
    if (onEnd) onEnd();
  };

  speechSynthesis.speak(utterance);
}

// Stop whatever is currently being read. If an onEnd callback was passed
// to readAloud(), it will fire (via utterance.onend) — see note above.
export function stopAudio() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
  clearHighlight();
}

// One-shot speech-to-text. Resolves with the transcript string.
// Rejects if the browser doesn't support it, the user denies mic access,
// or the recognizer errors out before producing a result.
export function speakAnswer() {
  return new Promise((resolve, reject) => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      reject(new Error("Speech recognition not supported"));
      return;
    }

    const recognizer = new SR();
    recognizer.lang = "en-US";
    recognizer.interimResults = false;
    recognizer.maxAlternatives = 1;

    // Guard against double-starts leaving an orphan recognizer live.
    let settled = false;
    const finish = (fn, value) => {
      if (settled) return;
      settled = true;
      try {
        recognizer.abort();
      } catch {
        /* some browsers throw on abort */
      }
      fn(value);
    };

    recognizer.onresult = (evt) => {
      finish(resolve, evt.results[0][0].transcript);
    };

    recognizer.onerror = (evt) => {
      finish(reject, new Error(evt.error || "speech recognition error"));
    };

    recognizer.onend = () => {
      // Fired when recognition ends without a result (silence, no mic,
      // user clicked away). Reject so the caller's mic button clears.
      finish(reject, new Error("no speech detected"));
    };

    try {
      recognizer.start();
    } catch (err) {
      finish(reject, err);
    }
  });
}
