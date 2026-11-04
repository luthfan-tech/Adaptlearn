import random
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AdaptLearn 100")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"])

# Hardcoded, real lessons. No generators. No identical text.
CURRICULUM = [
    {
        "id": "module_0", "title": "Phonics", "icon": "🌱",
        "passages": [
            {"id": "m0_l1", "title": "Level 1: The Cat", "text": "The cat sat on the mat.", "simplified": "The cat sat.", "questions": [{"id": "q1", "skill": "short_vowels", "prompt": "Where did the cat sit?", "answer": "mat", "explanation": "The cat sat on the mat."}, {"id": "q2", "skill": "sight_words", "prompt": "What animal is this?", "answer": "cat", "explanation": "It is a cat."}, {"id": "q3", "skill": "comprehension", "prompt": "Did the cat sit? (yes/no)", "answer": "yes", "explanation": "Yes, the cat sat."}]},
            {"id": "m0_l2", "title": "Level 2: The Hen", "text": "The red hen is in the pen.", "simplified": "The hen is in the pen.", "questions": [{"id": "q4", "skill": "short_vowels", "prompt": "What color is the hen?", "answer": "red", "explanation": "The hen is red."}, {"id": "q5", "skill": "sight_words", "prompt": "Where is the hen?", "answer": "pen", "explanation": "The hen is in the pen."}, {"id": "q6", "skill": "comprehension", "prompt": "Is the hen big or small?", "answer": "small", "explanation": "Hens are small."}]},
            {"id": "m0_l3", "title": "Level 3: The Pig", "text": "The big pig likes to dig.", "simplified": "The pig digs.", "questions": [{"id": "q7", "skill": "short_vowels", "prompt": "What does the pig like to do?", "answer": "dig", "explanation": "The pig likes to dig."}, {"id": "q8", "skill": "sight_words", "prompt": "Is the pig big?", "answer": "yes", "explanation": "The pig is big."}, {"id": "q9", "skill": "comprehension", "prompt": "What animal is this?", "answer": "pig", "explanation": "It is a pig."}]},
            {"id": "m0_l4", "title": "Level 4: The Hot Pot", "text": "The pot is very hot.", "simplified": "The pot is hot.", "questions": [{"id": "q10", "skill": "short_vowels", "prompt": "What is hot?", "answer": "pot", "explanation": "The pot is hot."}, {"id": "q11", "skill": "sight_words", "prompt": "Is the pot cold?", "answer": "no", "explanation": "The pot is hot."}, {"id": "q12", "skill": "comprehension", "prompt": "Should you touch a hot pot?", "answer": "no", "explanation": "No, it will burn you."}]},
            {"id": "m0_l5", "title": "Level 5: The Bug", "text": "A bug is on the rug.", "simplified": "The bug is on the rug.", "questions": [{"id": "q13", "skill": "short_vowels", "prompt": "Where is the bug?", "answer": "rug", "explanation": "The bug is on the rug."}, {"id": "q14", "skill": "sight_words", "prompt": "Is the bug on the bed?", "answer": "no", "explanation": "The bug is on the rug."}, {"id": "q15", "skill": "comprehension", "prompt": "What is on the rug?", "answer": "bug", "explanation": "A bug is on the rug."}]},
            {"id": "m0_l6", "title": "Level 6: The Sad Man", "text": "The man is sad.", "simplified": "The man is sad.", "questions": [{"id": "q16", "skill": "short_vowels", "prompt": "How does the man feel?", "answer": "sad", "explanation": "The man is sad."}, {"id": "q17", "skill": "sight_words", "prompt": "Is the man happy?", "answer": "no", "explanation": "He is sad."}, {"id": "q18", "skill": "comprehension", "prompt": "Who is sad?", "answer": "man", "explanation": "The man is sad."}]},
            {"id": "m0_l7", "title": "Level 7: The Fox", "text": "The fox is in the box.", "simplified": "The fox is in the box.", "questions": [{"id": "q19", "skill": "short_vowels", "prompt": "Where is the fox?", "answer": "box", "explanation": "The fox is in the box."}, {"id": "q20", "skill": "sight_words", "prompt": "What animal is in the box?", "answer": "fox", "explanation": "The fox is in the box."}, {"id": "q21", "skill": "comprehension", "prompt": "Is the box empty?", "answer": "no", "explanation": "The fox is inside."}]},
            {"id": "m0_l8", "title": "Level 8: The Sun", "text": "The sun is up.", "simplified": "The sun is up.", "questions": [{"id": "q22", "skill": "short_vowels", "prompt": "What is up?", "answer": "sun", "explanation": "The sun is up."}, {"id": "q23", "skill": "sight_words", "prompt": "Is it night time?", "answer": "no", "explanation": "The sun is up."}, {"id": "q24", "skill": "comprehension", "prompt": "What gives us light?", "answer": "sun", "explanation": "The sun gives light."}]},
            {"id": "m0_l9", "title": "Level 9: The Web", "text": "A spider made a web.", "simplified": "A spider made a web.", "questions": [{"id": "q25", "skill": "short_vowels", "prompt": "What did the spider make?", "answer": "web", "explanation": "The spider made a web."}, {"id": "q26", "skill": "sight_words", "prompt": "Who made the web?", "answer": "spider", "explanation": "A spider made it."}, {"id": "q27", "skill": "comprehension", "prompt": "Where do spiders live?", "answer": "web", "explanation": "Spiders live in webs."}]},
            {"id": "m0_l10", "title": "Level 10: The Vet", "text": "The vet helps the pet.", "simplified": "The vet helps.", "questions": [{"id": "q28", "skill": "short_vowels", "prompt": "Who helps the pet?", "answer": "vet", "explanation": "The vet helps the pet."}, {"id": "q29", "skill": "sight_words", "prompt": "Does the vet help animals?", "answer": "yes", "explanation": "Vets help animals."}, {"id": "q30", "skill": "comprehension", "prompt": "What is the animal called?", "answer": "pet", "explanation": "It is a pet."}]}
        ]
    },
    {
        "id": "module_1", "title": "Daily Life", "icon": "🌍",
        "passages": [
            {"id": "m1_l1", "title": "Level 1: Morning", "text": "I wake up in the morning.", "simplified": "I wake up.", "questions": [{"id": "q31", "skill": "sight_words", "prompt": "When do I wake up?", "answer": "morning", "explanation": "I wake up in the morning."}, {"id": "q32", "skill": "comprehension", "prompt": "What do I do first?", "answer": "wake up", "explanation": "I wake up."}, {"id": "q33", "skill": "short_vowels", "prompt": "Does 'up' have a short u?", "answer": "yes", "explanation": "Yes, it does."}]},
            {"id": "m1_l2", "title": "Level 2: Brushing", "text": "I brush my teeth.", "simplified": "I brush my teeth.", "questions": [{"id": "q34", "skill": "sight_words", "prompt": "What do I brush?", "answer": "teeth", "explanation": "I brush my teeth."}, {"id": "q35", "skill": "comprehension", "prompt": "Should you brush your teeth?", "answer": "yes", "explanation": "Yes, to keep them clean."}, {"id": "q36", "skill": "short_vowels", "prompt": "What letter does 'teeth' start with?", "answer": "t", "explanation": "It starts with T."}]},
            {"id": "m1_l3", "title": "Level 3: Breakfast", "text": "I eat eggs for breakfast.", "simplified": "I eat eggs.", "questions": [{"id": "q37", "skill": "sight_words", "prompt": "What do I eat?", "answer": "eggs", "explanation": "I eat eggs."}, {"id": "q38", "skill": "comprehension", "prompt": "When do I eat eggs?", "answer": "breakfast", "explanation": "For breakfast."}, {"id": "q39", "skill": "short_vowels", "prompt": "Does 'egg' have a short e?", "answer": "yes", "explanation": "Yes, it does."}]},
            {"id": "m1_l4", "title": "Level 4: Dressed", "text": "I put on my clothes.", "simplified": "I put on clothes.", "questions": [{"id": "q40", "skill": "sight_words", "prompt": "What do I put on?", "answer": "clothes", "explanation": "I put on my clothes."}, {"id": "q41", "skill": "comprehension", "prompt": "Why do we wear clothes?", "answer": "warm", "explanation": "To stay warm."}, {"id": "q42", "skill": "short_vowels", "prompt": "What do you put on your feet?", "answer": "shoes", "explanation": "You put on shoes."}]},
            {"id": "m1_l5", "title": "Level 5: The Bus", "text": "I take the bus to school.", "simplified": "The bus goes to school.", "questions": [{"id": "q43", "skill": "sight_words", "prompt": "Where do I go?", "answer": "school", "explanation": "I go to school."}, {"id": "q44", "skill": "comprehension", "prompt": "How do I get to school?", "answer": "bus", "explanation": "I take the bus."}, {"id": "q45", "skill": "short_vowels", "prompt": "What vehicle is it?", "answer": "bus", "explanation": "It is a bus."}]},
            {"id": "m1_l6", "title": "Level 6: Lunch", "text": "I eat a sandwich for lunch.", "simplified": "I eat a sandwich.", "questions": [{"id": "q46", "skill": "sight_words", "prompt": "What do I eat?", "answer": "sandwich", "explanation": "I eat a sandwich."}, {"id": "q47", "skill": "comprehension", "prompt": "What meal is it?", "answer": "lunch", "explanation": "It is lunch."}, {"id": "q48", "skill": "short_vowels", "prompt": "What food do you like?", "answer": "pizza", "explanation": "Any food is fine."}]},
            {"id": "m1_l7", "title": "Level 7: Playtime", "text": "I play with my dog.", "simplified": "I play with the dog.", "questions": [{"id": "q49", "skill": "sight_words", "prompt": "Who do I play with?", "answer": "dog", "explanation": "I play with my dog."}, {"id": "q50", "skill": "comprehension", "prompt": "Is playing fun?", "answer": "yes", "explanation": "Playing is fun."}, {"id": "q51", "skill": "short_vowels", "prompt": "What animal is it?", "answer": "dog", "explanation": "It is a dog."}]},
            {"id": "m1_l8", "title": "Level 8: Homework", "text": "I do my homework at the desk.", "simplified": "I do homework.", "questions": [{"id": "q52", "skill": "sight_words", "prompt": "Where do I do homework?", "answer": "desk", "explanation": "At the desk."}, {"id": "q53", "skill": "comprehension", "prompt": "What do I do?", "answer": "homework", "explanation": "I do my homework."}, {"id": "q54", "skill": "short_vowels", "prompt": "What do we use to write?", "answer": "pencil", "explanation": "We use a pencil."}]},
            {"id": "m1_l9", "title": "Level 9: Dinner", "text": "We eat soup for dinner.", "simplified": "We eat soup.", "questions": [{"id": "q55", "skill": "sight_words", "prompt": "What do we eat?", "answer": "soup", "explanation": "We eat soup."}, {"id": "q56", "skill": "comprehension", "prompt": "What meal is it?", "answer": "dinner", "explanation": "It is dinner."}, {"id": "q57", "skill": "short_vowels", "prompt": "Is soup hot or cold?", "answer": "hot", "explanation": "Soup is hot."}]},
            {"id": "m1_l10", "title": "Level 10: Bedtime", "text": "I go to bed at night.", "simplified": "I go to bed.", "questions": [{"id": "q58", "skill": "sight_words", "prompt": "Where do I go?", "answer": "bed", "explanation": "I go to bed."}, {"id": "q59", "skill": "comprehension", "prompt": "When do I sleep?", "answer": "night", "explanation": "I sleep at night."}, {"id": "q60", "skill": "short_vowels", "prompt": "What do you sleep on?", "answer": "bed", "explanation": "You sleep on a bed."}]}
        ]
    },
    {
        "id": "module_2", "title": "Money Math", "icon": "💰",
        "passages": [
            {"id": "m2_l1", "title": "Level 1: One Coin", "text": "I have one shiny coin.", "simplified": "One coin.", "questions": [{"id": "q61", "skill": "comprehension", "prompt": "What do I have?", "answer": "coin", "explanation": "I have a coin."}, {"id": "q62", "skill": "sight_words", "prompt": "Is the coin shiny?", "answer": "yes", "explanation": "It is shiny."}, {"id": "q63", "skill": "short_vowels", "prompt": "What letter does 'coin' start with?", "answer": "c", "explanation": "It starts with C."}]},
            {"id": "m2_l2", "title": "Level 2: Cash", "text": "The cash is in my hand.", "simplified": "Cash in hand.", "questions": [{"id": "q64", "skill": "comprehension", "prompt": "Where is the cash?", "answer": "hand", "explanation": "In my hand."}, {"id": "q65", "skill": "sight_words", "prompt": "Is cash paper or metal?", "answer": "paper", "explanation": "Cash is paper."}, {"id": "q66", "skill": "short_vowels", "prompt": "Do we use cash to buy things?", "answer": "yes", "explanation": "Yes, we do."}]},
            {"id": "m2_l3", "title": "Level 3: Buy a Toy", "text": "I want to buy a toy.", "simplified": "Buy a toy.", "questions": [{"id": "q67", "skill": "comprehension", "prompt": "What do I want to buy?", "answer": "toy", "explanation": "A toy."}, {"id": "q68", "skill": "sight_words", "prompt": "Do I need money?", "answer": "yes", "explanation": "Yes, to buy a toy."}, {"id": "q69", "skill": "short_vowels", "prompt": "What letter does 'toy' start with?", "answer": "t", "explanation": "It starts with T."}]}
        ]
    },
    {
        "id": "module_3", "title": "Shopping", "icon": "🛒",
        "passages": [
            {"id": "m3_l1", "title": "Level 1: Food", "text": "We need food at the store.", "simplified": "Food at the store.", "questions": [{"id": "q70", "skill": "comprehension", "prompt": "What do we need?", "answer": "food", "explanation": "We need food."}, {"id": "q71", "skill": "sight_words", "prompt": "Where do we go?", "answer": "store", "explanation": "To the store."}, {"id": "q72", "skill": "short_vowels", "prompt": "Does 'food' have a long oo?", "answer": "yes", "explanation": "Yes, it does."}]},
            {"id": "m3_l2", "title": "Level 2: The Cart", "text": "I push the cart down the aisle.", "simplified": "Push the cart.", "questions": [{"id": "q73", "skill": "comprehension", "prompt": "What do I push?", "answer": "cart", "explanation": "The cart."}, {"id": "q74", "skill": "sight_words", "prompt": "Where do I push it?", "answer": "aisle", "explanation": "Down the aisle."}, {"id": "q75", "skill": "short_vowels", "prompt": "What letter does 'cart' start with?", "answer": "c", "explanation": "It starts with C."}]},
            {"id": "m3_l3", "title": "Level 3: Apples", "text": "The apples are red and sweet.", "simplified": "Red sweet apples.", "questions": [{"id": "q76", "skill": "comprehension", "prompt": "What color are the apples?", "answer": "red", "explanation": "They are red."}, {"id": "q77", "skill": "sight_words", "prompt": "Are they sweet?", "answer": "yes", "explanation": "Yes, they are sweet."}, {"id": "q78", "skill": "short_vowels", "prompt": "What letter does 'apple' start with?", "answer": "a", "explanation": "It starts with A."}]}
        ]
    },
    {
        "id": "module_4", "title": "Travel", "icon": "🚌",
        "passages": [
            {"id": "m4_l1", "title": "Level 1: The Bus", "text": "I ride the yellow bus.", "simplified": "Yellow bus.", "questions": [{"id": "q79", "skill": "comprehension", "prompt": "What do I ride?", "answer": "bus", "explanation": "The bus."}, {"id": "q80", "skill": "sight_words", "prompt": "What color is the bus?", "answer": "yellow", "explanation": "It is yellow."}, {"id": "q81", "skill": "short_vowels", "prompt": "Does 'bus' have a short u?", "answer": "yes", "explanation": "Yes, it does."}]},
            {"id": "m4_l2", "title": "Level 2: The Map", "text": "I look at the map.", "simplified": "Look at the map.", "questions": [{"id": "q82", "skill": "comprehension", "prompt": "What do I look at?", "answer": "map", "explanation": "The map."}, {"id": "q83", "skill": "sight_words", "prompt": "Does a map show places?", "answer": "yes", "explanation": "Yes, it does."}, {"id": "q84", "skill": "short_vowels", "prompt": "What letter does 'map' start with?", "answer": "m", "explanation": "It starts with M."}]},
            {"id": "m4_l3", "title": "Level 3: The Car", "text": "The car goes fast.", "simplified": "Fast car.", "questions": [{"id": "q85", "skill": "comprehension", "prompt": "What goes fast?", "answer": "car", "explanation": "The car."}, {"id": "q86", "skill": "sight_words", "prompt": "Does 'car' have a short a?", "answer": "yes", "explanation": "Yes, it does."}, {"id": "q87", "skill": "short_vowels", "prompt": "What letter does 'car' start with?", "answer": "c", "explanation": "It starts with C."}]}
        ]
    }
]

# ── State & Adaptive Engine ──────────────────────────────────────────
TRACKED_SKILLS = ["short_vowels", "sight_words", "comprehension"]
DISPLAY_MODES = ["plain_text", "open_dyslexic", "audio", "simplified_text"]

def _blank_slate():
    return {
        "mastery": {sk: 0.1 for sk in TRACKED_SKILLS},
        "disability": "dyslexia",
        "bandit": {d: {m: {"total": 0.0, "count": 0} for m in DISPLAY_MODES} for d in ["dyslexia", "adhd"]},
        "history": [],
    }

learner = _blank_slate()

def _recalc_mastery(prior, correct, p_transit=0.3, p_guess=0.2, p_slip=0.1):
    if correct:
        numer = prior * (1.0 - p_slip)
        denom = numer + (1.0 - prior) * p_guess
    else:
        numer = prior * p_slip
        denom = numer + (1.0 - prior) * (1.0 - p_guess)
    if denom == 0: return prior
    posterior = numer / denom
    return posterior + (1.0 - posterior) * p_transit

def _pick_display_mode(profile, epsilon=0.2):
    if random.random() < epsilon: return random.choice(DISPLAY_MODES)
    best_mode, best_avg = DISPLAY_MODES[0], -1.0
    for mode in DISPLAY_MODES:
        rec = learner["bandit"][profile][mode]
        if rec["count"] > 0:
            avg = rec["total"] / rec["count"]
            if avg > best_avg:
                best_avg, best_mode = avg, mode
    return best_mode

def _every_passage():
    combined = []
    for mod in CURRICULUM:
        combined.extend(mod["passages"])
    return combined

# ── Models ──────────────────────────────────────────
class SubmittedAnswer(BaseModel):
    passage_id: str
    question_id: str
    response: str

class FormatFeedback(BaseModel):
    format: str
    helpful: bool

class SimplifyPayload(BaseModel):
    text: str

# ── Endpoints ───────────────────────────────────────
@app.get("/api/state")
def get_learner_snapshot(): return learner

@app.get("/api/curriculum")
def serve_curriculum():
    scrubbed = []
    for mod in CURRICULUM:
        clean_mod = {"id": mod["id"], "title": mod["title"], "icon": mod["icon"], "passages": []}
        for p in mod["passages"]:
            clean_p = {k: v for k, v in p.items() if k != "questions"}
            clean_p["questions"] = [{k: v for k, v in q.items() if k != "answer"} for q in p["questions"]]
            clean_mod["passages"].append(clean_p)
        scrubbed.append(clean_mod)
    return scrubbed

@app.post("/api/answer")
def check_answer(req: SubmittedAnswer):
    passage = next((p for p in _every_passage() if p["id"] == req.passage_id), None)
    if not passage: raise HTTPException(404, "Passage not found")
    q = next((q for q in passage["questions"] if q["id"] == req.question_id), None)
    if not q: raise HTTPException(404, "Question not found")

    given, expected = req.response.lower().strip(), q["answer"].lower()
    is_right = expected in given or given == expected

    old_val = learner["mastery"][q["skill"]]
    new_val = _recalc_mastery(old_val, is_right)
    learner["mastery"][q["skill"]] = new_val
    learner["history"].append({"question_id": req.question_id, "correct": is_right, "mastery": dict(learner["mastery"])})

    return {"correct": is_right, "mastery": new_val, "all_mastery": learner["mastery"], "expected": q["answer"], "explanation": q.get("explanation", "")}

@app.post("/api/format/choose")
def pick_format_for_student():
    return {"format": _pick_display_mode(learner["disability"]), "disability": learner["disability"]}

@app.post("/api/format/feedback")
def record_format_feedback(req: FormatFeedback):
    score = 1.0 if req.helpful else 0.0
    learner["bandit"][learner["disability"]][req.format]["total"] += score
    learner["bandit"][learner["disability"]][req.format]["count"] += 1
    return {"status": "ok", "bandit": learner["bandit"]}

@app.post("/api/profile")
def switch_learner_profile(payload: dict):
    if payload.get("disability") in ("dyslexia", "adhd"):
        learner["disability"] = payload["disability"]
    return {"disability": learner["disability"]}

@app.post("/api/reset")
def wipe_and_restart():
    global learner
    learner = _blank_slate()
    return {"status": "reset"}

app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_index():
    return FileResponse("static/index.html")