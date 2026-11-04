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

```mermaid
graph TD
    %% Entities
    Student([👩‍🎓 Student])
    
    %% Frontend
    subgraph Frontend ["🖥️ Frontend (Vanilla JS)"]
        UI[UI & Quest Map]
        TTS[Browser Web Speech API]
        STT[Speech to Text]
        LocalStorage[(Local Storage)]
    end
    
    %% Backend
    subgraph Backend ["⚙️ Backend (FastAPI/Python)"]
        API[API Router]
        BKT[🧠 BKT Engine]
        Bandit[🎯 Contextual Bandit]
        Content[(Curated Lesson Bank)]
    end

    %% Flow
    Student -->|Selects Level| UI
    UI -->|Fetches Lesson| API
    API --> Content
    Content -->|Returns Text| API
    API -->|Sends JSON| UI
    
    Student -->|Answers Question| UI
    UI -->|Submit Answer| API
    API -->|Updates Mastery| BKT
    BKT -->|New Mastery %| API
    API -->|Returns Feedback| UI
    
    Student -->|Clicks 👍/👎| UI
    UI -->|Reward Feedback| API
    API -->|Updates Weights| Bandit
    Bandit -->|Picks Next Format| API
    API -->|Changes Display| UI
    
    UI -->|Saves Completed Levels| LocalStorage
    Student -->|Reads Aloud| TTS
    Student -->|Speaks Answer| STT

    %% Styling
    classDef front fill:#f4f1ea,stroke:#1a1a1a,stroke-width:2px;
    classDef back fill:#ffd13b,stroke:#1a1a1a,stroke-width:2px;
    classDef storage fill:#34d399,stroke:#1a1a1a,stroke-width:2px;
    
    class UI,TTS,STT front;
    class API,BKT,Bandit,Content back;
    class LocalStorage storage;

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
