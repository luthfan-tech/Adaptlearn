"""
AdaptLearn 100 — backend server
Hackathon build for HI-03 track (Adaptive Learning for Students with Disabilities)

Everything runs in-memory on purpose — no DB setup needed,
state just resets when you restart the server. Fine for a demo.
"""

import os
import random

from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel


# ─────────────────────────────────────────────────────
#  Module + level catalog
# ─────────────────────────────────────────────────────
# Each entry is (title, emoji, vocab_word_1, vocab_word_2).
# We crank out 10 levels per module → 100 total.  The passage
# text is deliberately simple because the real UX work is on the
# frontend (word highlighting, TTS, pop-up dictionary, etc.).

_MODULE_SEEDS = [
    ("Phonics",    "🌱", "cat",    "hat"),
    ("Daily Life", "🌍", "home",   "bed"),
    ("Money Math", "💰", "coin",   "cash"),
    ("Shopping",   "🛒", "food",   "cart"),
    ("Travel",     "🚌", "bus",    "map"),
    ("Health",     "🩺", "doctor", "pill"),
    ("Weather",    "🌦️",  "rain",   "sun"),
    ("Jobs",       "💼", "work",   "pay"),
    ("Safety",     "🛠️",  "fire",   "help"),
    ("Social",     "💬", "hello",  "smile"),
]


def _assemble_lesson_bank():
    """
    Builds the full 10×10 lesson catalog from the seed tuples above.
    Broke this out of a gnarly list-comp because debugging that was miserable.
    """
    bank = []

    for mod_idx, (title, icon, w1, w2) in enumerate(_MODULE_SEEDS):
        levels = []

        for lvl_num in range(10):
            tag = f"p_{mod_idx}_{lvl_num}"
            topic_lower = title.lower()

            # yeah the story template is repetitive — it's a hackathon, sue me
            story = (
                f"This is a story about {topic_lower}. "
                f"We will learn important words like {w1} and {w2}. "
                f"It is fun to learn new things!"
            )
            easy_version = f"Story about {topic_lower}. Words: {w1}, {w2}. Learning is fun!"

            levels.append({
                "id": tag,
                "title": f"Level {lvl_num + 1}: {title}",
                "text": story,
                "simplified": easy_version,
                "questions": [
                    {
                        "id":          f"q_{mod_idx}_{lvl_num}_1",
                        "skill":       "comprehension",
                        "prompt":      "What is this story about?",
                        "answer":      topic_lower.split()[0],
                        "explanation": "Look at the title!",
                    },
                    {
                        "id":          f"q_{mod_idx}_{lvl_num}_2",
                        "skill":       "sight_words",
                        "prompt":      "Which word did we learn?",
                        "answer":      w1,
                        "explanation": "We learned this word today.",
                    },
                    {
                        "id":          f"q_{mod_idx}_{lvl_num}_3",
                        "skill":       "short_vowels",
                        "prompt":      "Is learning fun? (yes/no)",
                        "answer":      "yes",
                        "explanation": "The story says learning is fun.",
                    },
                ],
            })

        bank.append({
            "id":       f"module_{mod_idx}",
            "title":    title,
            "icon":     icon,
            "passages": levels,
        })

    return bank


LESSON_BANK = _assemble_lesson_bank()


def _every_passage():
    """Flattens all passages across every module into one list.
    Used when we need to look something up by passage id."""
    combined = []
    for mod in LESSON_BANK:
        combined.extend(mod["passages"])
    return combined


# ─────────────────────────────────────────────────────
#  FastAPI app + middleware
# ─────────────────────────────────────────────────────

app = FastAPI(title="AdaptLearn 100")

# NOTE: wide-open CORS is fine for a hackathon demo — do NOT ship this
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────────────
#  Learner state + adaptive engine
# ─────────────────────────────────────────────────────

TRACKED_SKILLS = ["short_vowels", "sight_words", "comprehension"]
DISPLAY_MODES  = ["plain_text", "open_dyslexic", "audio", "simplified_text"]


def _blank_slate():
    """
    Builds a fresh learner-session dict.
    Mastery starts at 0.1 (not zero!) so the BKT posterior
    doesn't collapse on the very first wrong answer.
    """
    bandit_table = {}
    for profile_key in ("dyslexia", "adhd"):
        bandit_table[profile_key] = {}
        for mode in DISPLAY_MODES:
            bandit_table[profile_key][mode] = {"total": 0.0, "count": 0}

    return {
        "mastery":    {sk: 0.1 for sk in TRACKED_SKILLS},
        "disability": "dyslexia",
        "bandit":     bandit_table,
        "history":    [],
    }


# mutable global — perfectly fine for a single-user demo
learner = _blank_slate()


# ── Bayesian Knowledge Tracing ────────────────────────
# Straight out of Corbett & Anderson 1994.
# The param defaults (transit=0.3, guess=0.2, slip=0.1) are
# "textbook reasonable" — we didn't bother tuning for the hackathon.

def _recalc_mastery(prior, got_it_right, p_transit=0.3, p_guess=0.2, p_slip=0.1):
    """One BKT update step.  Returns the new P(known)."""

    if got_it_right:
        numer = prior * (1.0 - p_slip)
        denom = numer + (1.0 - prior) * p_guess
    else:
        numer = prior * p_slip
        denom = numer + (1.0 - prior) * (1.0 - p_guess)

    # shouldn't happen, but just in case
    if denom == 0:
        return prior

    posterior = numer / denom
    # learning-transition step
    updated = posterior + (1.0 - posterior) * p_transit
    return updated


# ── Contextual Bandit (epsilon-greedy) ────────────────
# HACK: epsilon is locked at 0.2 — ideally we'd decay it as
#       the learner gives more feedback, but this is fine for now.

def _pick_display_mode(profile, epsilon=0.2):
    """
    Picks a presentation format for the given disability profile.
    With probability epsilon we explore randomly; otherwise we
    exploit the format with the highest average reward.
    """
    # explore branch
    if random.random() < epsilon:
        return random.choice(DISPLAY_MODES)

    # exploit branch — find the top-performing mode
    best_mode = DISPLAY_MODES[0]
    best_avg  = -1.0

    for mode in DISPLAY_MODES:
        record = learner["bandit"][profile][mode]
        if record["count"] == 0:
            # never tried → skip, don't divide by zero
            continue
        avg = record["total"] / record["count"]
        if avg > best_avg:
            best_avg  = avg
            best_mode = mode

    return best_mode


def _log_bandit_reward(profile, mode, score):
    """Stash a reward observation for the bandit to learn from."""
    learner["bandit"][profile][mode]["total"] += score
    learner["bandit"][profile][mode]["count"] += 1


# ── Text simplification stub ─────────────────────────
# TODO: wire up real LLM simplification here (Gemini endpoint?)
#       Right now it just appends a label so the frontend can tell
#       it went through the "simplify" path.

def _make_easier_version(raw_text, target_grade=2):
    return raw_text + " (Simplified for you)"


# ─────────────────────────────────────────────────────
#  Request / Response shapes
# ─────────────────────────────────────────────────────

class SubmittedAnswer(BaseModel):
    passage_id: str
    question_id: str
    response: str


class FormatFeedback(BaseModel):
    format: str
    helpful: bool


class SimplifyPayload(BaseModel):
    text: str


# ─────────────────────────────────────────────────────
#  API endpoints
# ─────────────────────────────────────────────────────

@app.get("/api/state")
def get_learner_snapshot():
    """Returns the full in-memory learner state (mastery + bandit + history)."""
    return learner


@app.get("/api/curriculum")
def serve_curriculum():
    """
    Sends the lesson catalog to the client, but strips
    the correct answers out so they aren't sitting in
    the network tab for any curious student to find.
    """
    scrubbed = []

    for mod in LESSON_BANK:
        clean_mod = {
            "id":       mod["id"],
            "title":    mod["title"],
            "icon":     mod["icon"],
            "passages": [],
        }
        for passage in mod["passages"]:
            # shallow-copy everything except questions
            clean_p = {k: v for k, v in passage.items() if k != "questions"}

            # rebuild question list without the "answer" field
            safe_qs = []
            for q in passage["questions"]:
                safe_qs.append({k: v for k, v in q.items() if k != "answer"})
            clean_p["questions"] = safe_qs

            clean_mod["passages"].append(clean_p)
        scrubbed.append(clean_mod)

    return scrubbed


@app.post("/api/answer")
def check_answer(req: SubmittedAnswer):
    """Grade a student's answer and update their BKT mastery."""

    # ── locate the passage ──
    target_passage = None
    for p in _every_passage():
        if p["id"] == req.passage_id:
            target_passage = p
            break

    if target_passage is None:
        raise HTTPException(status_code=404, detail="Passage not found")

    # ── locate the question inside it ──
    target_q = None
    for q in target_passage["questions"]:
        if q["id"] == req.question_id:
            target_q = q
            break

    if target_q is None:
        raise HTTPException(status_code=404, detail="Question not found")

    # ── grade it (lenient matching) ──
    given    = req.response.lower().strip()
    expected = target_q["answer"].lower()

    # accept substring match OR exact match — handles both
    # single-word and full-sentence dictation answers
    is_right = expected in given or given == expected

    # ── BKT update ──
    which_skill = target_q["skill"]
    old_val = learner["mastery"][which_skill]
    new_val = _recalc_mastery(old_val, is_right)
    learner["mastery"][which_skill] = new_val

    # stash in history for debugging / analytics later
    learner["history"].append({
        "question_id": req.question_id,
        "correct":     is_right,
        "mastery":     dict(learner["mastery"]),
    })

    return {
        "correct":     is_right,
        "mastery":     new_val,
        "all_mastery": learner["mastery"],
        "expected":    target_q["answer"],
        "explanation": target_q.get("explanation", ""),
    }


@app.post("/api/format/choose")
def pick_format_for_student():
    """Ask the bandit to pick a display mode for the current learner profile."""
    active_profile = learner["disability"]
    chosen = _pick_display_mode(active_profile)
    return {"format": chosen, "disability": active_profile}


@app.post("/api/format/feedback")
def record_format_feedback(req: FormatFeedback):
    """Thumbs-up / thumbs-down on a presentation format → bandit reward."""
    score = 1.0 if req.helpful else 0.0
    _log_bandit_reward(learner["disability"], req.format, score)
    return {"status": "ok", "bandit": learner["bandit"]}


@app.post("/api/simplify")
def simplify_passage(req: SimplifyPayload):
    """Run text through the simplifier (currently just a stub)."""
    return {"simplified": _make_easier_version(req.text)}


@app.post("/api/profile")
def switch_learner_profile(payload: dict):
    """Toggle between dyslexia and ADHD profiles."""
    requested = payload.get("disability")
    if requested in ("dyslexia", "adhd"):
        learner["disability"] = requested
    # always echo back so the frontend can confirm the switch
    return {"disability": learner["disability"]}


@app.post("/api/reset")
def wipe_and_restart():
    """Nuke all learner state and start fresh."""
    global learner
    learner = _blank_slate()
    return {"status": "reset"}


# ─────────────────────────────────────────────────────
#  Static file serving + SPA root
# ─────────────────────────────────────────────────────

app.mount("/static", StaticFiles(directory="static"), name="static")


@app.get("/")
def serve_index():
    return FileResponse("static/index.html")
