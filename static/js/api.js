// Thin wrapper around the FastAPI backend. Nothing clever in here —
// just keeps the fetch boilerplate out of the UI modules.

async function _fetch(url, opts = {}) {
  const response = await fetch(url, opts);

  if (!response.ok) {
    // HACK: include the method in the message — "POST /api/answer failed (500)"
    // is worth ten minutes of demo-day debugging vs. just "API failed".
    const method = (opts.method || "GET").toUpperCase();
    throw new Error(`${method} ${url} failed (${response.status})`);
  }

  // Some endpoints (reset, e.g.) may return empty bodies once we clean them up.
  // r.json() would throw on "" — guard so callers get null instead of a parse error.
  const body = await response.text();
  return body ? JSON.parse(body) : null;
}

function post(url, body) {
  return _fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
  });
}

const api = {
  getState: () => _fetch("/api/state"),
  getCurriculum: () => _fetch("/api/curriculum"),

  // payload = { passage_id, question_id, response } — see SubmittedAnswer in main.py.
  // Not destructured here on purpose: the backend Pydantic model is the contract,
  // not this file. If a field gets added there, we don't touch this line.
  answer: (payload) => post("/api/answer", payload),

  // Bandit pick for the current learner profile. Empty body is required —
  // FastAPI treats POST with no body as a 422 in some configs, and it's harmless.
  chooseFormat: () => post("/api/format/choose", {}),

  feedback: (format, helpful) =>
    post("/api/format/feedback", { format, helpful }),
  simplify: (text) => post("/api/simplify", { text }),
  setProfile: (disability) => post("/api/profile", { disability }),

  // NOTE: reset wipes in-memory learner state on the server; localStorage
  // progress in the frontend is separate and not touched here.
  reset: () => post("/api/reset", {}),
};

export { api };
