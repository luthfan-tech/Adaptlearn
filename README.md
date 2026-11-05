# 🌱 AdaptLearn

An adaptive learning web app for students with disabilities, built for a hackathon track focused on personalised education.

> 🏆 Hackathon Track: HI-03 — Adaptive Learning for Students with Disabilities

Educational platforms often deliver the same content in the same format to every learner. Some learners may prefer or need:

- 🔤 Alternative typography, including an optional OpenDyslexic font
- 📝 Shorter, simpler text
- 🔊 Audio support
- 🧩 Focused content with fewer distractions
- 🎙️ Alternative input methods

AdaptLearn explores how the learning experience can adapt to individual preferences rather than requiring every student to use the same presentation.

## 🌐 Live Website

**[Try AdaptLearn →](https://adaptlearn-1mcc.onrender.com)**

---

## 💡 Why This Project Exists

Learners have different needs and preferences.

- Some learners may prefer alternative typography and layout.
- Some may find shorter, focused passages easier to work with.
- Some may prefer speaking an answer instead of typing.
- Others may find repetition and a combination of text and audio helpful.

AdaptLearn tests a personalised approach to reading and learning support.

> Individual needs vary. The prototype does not assume that one format works for everyone with a particular disability.

---

## ✨ Core Features

- 🎯 **Adaptive format selection**
  - Text
  - Audio
  - Simplified text
  - Alternative typography and layout

- 🧠 **Bayesian Knowledge Tracing**
  - Estimates skill mastery from question responses.

- 🔊 **Read-Aloud Support**
  - Text-to-speech with synchronised highlighting where supported.

- 📖 **Pop-Up Dictionary**
  - Provides explanations for selected unfamiliar words.

- 🐣 **Playful Learning**
  - A digital pet and celebration effects add encouragement.

- 🎙️ **Spoken Answers**
  - Dictation-based input where browser support is available.

- 💾 **Local Progress**
  - Saves completion records using browser storage.

---

## 🏗️ System Architecture

```text
Student
   |
   v
Frontend — Vanilla JavaScript
   |
   +----> Browser localStorage
   |      Saves completion records
   |
   v
Backend — FastAPI
   |
   +----> BKT Engine
   |      Updates mastery estimates
   |
   +----> Bandit Engine
   |      Selects presentation formats
   |
   +----> Lesson Bank
          Returns curated content
```

The system uses learner feedback to update format preferences and question responses to update mastery estimates.

---

## 🛠️ Tech Stack

<p>
  <img src="https://cdn.simpleicons.org/python/3776AB" alt="Python" width="40" height="40" />
  &nbsp;&nbsp;
  <img src="https://cdn.simpleicons.org/fastapi/009688" alt="FastAPI" width="40" height="40" />
  &nbsp;&nbsp;
  <img src="https://cdn.simpleicons.org/html5/E34F26" alt="HTML5" width="40" height="40" />
  &nbsp;&nbsp;
  <img src="https://cdn.simpleicons.org/css/663399" alt="CSS" width="40" height="40" />
  &nbsp;&nbsp;
  <img src="https://cdn.simpleicons.org/javascript/F7DF1E" alt="JavaScript" width="40" height="40" />
</p>

| Layer | Technology |
|---|---|
| 🐍 Backend language | Python |
| ⚡ Backend framework | FastAPI |
| 🧱 Page structure | HTML5 |
| 🎨 Styling | CSS3 |
| 🟨 Frontend logic | Vanilla JavaScript |
| 🔊 Speech features | Web Speech API |
| 💾 Local completion records | Browser `localStorage` |
| 🧠 Adaptive algorithms | BKT and contextual bandit |

---

## 🚀 How to Run Locally

### 📋 Requirements

- Python 3.10+
- A modern browser
- Browser support and permissions for the speech features you want to use

> Speech recognition, available voices, and highlighting behaviour may vary across browsers and devices.

### 1️⃣ Clone the Repository

```bash
git clone [https://github.com/luthfan-tech/Adaptlearn.git](https://github.com/luthfan-tech/Adaptlearn.git)
cd Adaptlearn
```

### 2️⃣ Create and Activate a Virtual Environment

#### macOS / Linux

```bash
python3 -m venv .venv
source .venv/bin/activate
```

#### Windows — PowerShell

```powershell
python -m venv .venv
..venvScriptsActivate.ps1
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

### 4️⃣ Start the FastAPI App

```bash
python -m uvicorn main:app --reload
```

### 5️⃣ Open the App

Visit:

```text
http://127.0.0.1:8000
```

---

## 🧠 Algorithm Overview

### 📈 Bayesian Knowledge Tracing — BKT

The backend estimates how likely a learner is to know a skill after each answer.

The model accounts for:

- Prior knowledge
- Learning
- Correct guesses
- Mistakes despite knowing a skill

> Mastery values are model estimates, not clinical assessments or complete measures of a learner’s ability.

### 🎯 Contextual Bandit

The format-selection system uses an epsilon-greedy strategy:

- **80% of the time:** select the format with the best current estimated reward.
- **20% of the time:** explore an available format.

Learner feedback helps update these estimates.

> A preferred format is not automatically a proven improvement in learning outcomes.

---

## ⚠️ Known Limitations

This is a hackathon prototype, not a production-ready learning service.

### 💾 No Persistent Backend Database

- Active learner state is stored primarily in server memory.
- Browser `localStorage` saves completed levels, not the full server-side state.
- Server restarts or cleared browser data can remove some progress.

### 📚 Limited Content

- The project contains a curated set of educational levels.
- It does not provide an unlimited curriculum.

### 🩺 No Clinical Validation

- The system does not diagnose or infer disabilities.
- Learners explicitly choose their learning profile.
- Its educational effectiveness has not been clinically validated.

### 🤖 No Live LLM Integration

- The current system uses curated text.
- It does not generate new explanations through a live LLM service.

### ♿ Accessibility Review Still Needed

- Accessibility features require testing across devices and assistive technologies.
- The project does not claim verified accessibility compliance.

---

## 🔭 Future Work

- [ ] 💾 Add persistent user profiles and learning state.
- [ ] 📚 Expand the curriculum across subjects and skills.
- [ ] 📊 Add useful progress summaries for teachers and caregivers, with appropriate learner privacy controls.
- [ ] 🤖 Explore generative AI for text simplification and content adaptation.
- [ ] 🌍 Support additional languages.
- [ ] ♿ Conduct accessibility testing and a compliance review.
- [ ] 🧪 Evaluate the adaptation with representative users and learning tasks.

---

## 📄 License

This project is intended for educational and demonstration use.

No open-source license has been specified yet. A license should be selected and added to clarify how others may use, modify, and distribute the code.

---

<p align="center">
  🌱 <strong>Different needs. More ways to learn.</strong>
  <br />
  Built for HI-03 — Adaptive Learning for Students with Disabilities.
</p>