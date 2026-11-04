# 🧠 AdaptLearn: 50 Levels of Knowledge
> **Hackathon Track:** HI-03 (Adaptive Learning for Students with Disabilities)

Ever noticed how most EdTech platforms just throw the exact same text at every student? That doesn't work for a dyslexic student who needs OpenDyslexic fonts, or an ADHD student who needs short, dopamine-driven bursts. 

I built **AdaptLearn** because I wanted to see what happens when we stop forcing the student to fit the system, and instead build a system that adapts to the student.

---

## ✨ The Core Features

- **Contextual Bandit Engine:** The backend uses an epsilon-greedy bandit to learn if a student prefers OpenDyslexic fonts, Audio, or Simplified Text based on explicit 👍/👎 feedback.
- **BKT Mastery Tracking:** I implemented Bayesian Knowledge Tracing to silently track how well the student is learning phonics, sight words, and comprehension in real-time.
- **Bimodal Presentation:** Native Text-to-Speech with real-time word highlighting. The student can hear it and see it at the exact same time.
- **Pop-Up Dictionary:** Hard words (like *coin* or *doctor*) are underlined. Tapping one opens a modal with an emoji, a real definition, and audio playback.
- **Gamified ADHD Support:** A digital pet (`🐣 → 🐥 → 🦊`) that evolves with correct answer streaks, alongside a screen-wide confetti celebration engine.
- **Smart Dictation:** Students with motor delays can use the microphone button to speak their answers instead of typing.
- **Progress Persistence:** Completed levels are saved to the browser's `localStorage` and turn green with a checkmark on the map.

---

## 🏗️ System Architecture

Here is exactly how the adaptive loop works under the hood:

```text
[ 👩‍🎓 Student ]
      │
      ▼
[ 🖥️ Frontend (Vanilla JS) ] ───(Saves Progress)───▶ [ 💾 LocalStorage ]
      │
      │ (Submits Answer)
      ▼
[ ⚙️ Backend (FastAPI) ]
      │
      ├──▶ [ 🧠 BKT Engine ] ──(Calculates Mastery %)──▶ Updates Dashboard
      │
      ├──▶ [ 🎯 Bandit Engine ] ──(Learns from 👍/👎)──▶ Picks Next Format
      │
      └──▶ [ 📚 Lesson Bank ] ──(Returns Curated Text)──▶ UI Renders

---





🛠️ Tech Stack

Backend:
https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white
https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi&logoColor=white

Frontend:
https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
https://img.shields.io/badge/JavaScript-323330?style=for-the-badge&logo=javascript&logoColor=F7DF1E

Accessibility & APIs:
https://img.shields.io/badge/Web_Speech_API-000000?style=for-the-badge&logo=googlechrome&logoColor=white
https://img.shields.io/badge/LocalStorage-FFD13B?style=for-the-badge&logo=databricks&logoColor=black





---


🚀 How to Run Locally-
If you want to run this on your own machine, it runs entirely in-memory. No databases, no complex setups.

1. Clone the repo & set up the environment:

python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt

2. Start the FastAPI server:

python -m uvicorn main:app

3. Open the browser:
Go to http://127.0.0.1:8000 (Chrome or Edge recommended for Web Speech API support).

---

🧠 Under the Hood (The Algorithms)-
    BKT (Bayesian Knowledge Tracing): Every time an answer is submitted, the backend calculates the probability the student actually knows the skill, factoring in the chance they guessed correctly or slipped up. Mastery starts at 0.1 to avoid a statistical collapse on the very first wrong answer.

    Contextual Bandit: The system uses an epsilon-greedy strategy (epsilon=0.2). 20% of the time it explores a random format, and 80% of the time it exploits the format the student has given the highest rewards to via the feedback buttons.

⚠️ Honest Limitations-
Because this was built in a single hackathon sprint, here is what I intentionally skipped:

    No Database: Learner state is stored in a Python dictionary. If the server restarts, the mastery progress resets. (Completed levels are saved in the browser's localStorage, though).

    Content Scale: I hand-wrote and curated 50 unique levels across 5 modules (Phonics, Daily Life, Money, Shopping, Travel).

    No Medical Validation: This is a prototype. The engine tracks skill mastery, but it does not diagnose or infer disabilities. The student explicitly selects their own learning profile.

    LLM Integration: The current system relies on curated text. Hooking the backend up to a live Gemini/OpenAI endpoint for dynamic text simplification is the immediate next step.
