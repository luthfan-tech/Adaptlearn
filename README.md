# AdaptLearn

Adaptive learning web app for students with disabilities, built for a hackathon track focused on personalized education.

> Hackathon Track: HI-03 (Adaptive Learning for Students with Disabilities)

Ever noticed how most educational platforms deliver the same content to every learner? That approach does not work for students who need:
- OpenDyslexic fonts
- shorter, simpler text
- audio support
- reduced cognitive load
- alternative input methods

AdaptLearn adapts the learning experience to the student instead of forcing the student to adapt to the platform.

---

## Why this project exists

Many EdTech systems assume a single learning style for all students. But learners have different needs:
- dyslexic students may benefit from alternate typography and layout
- ADHD students may need shorter, more focused content
- students with motor delays may prefer dictation or speech input
- learners may need reinforcement through repetition and multimodal presentation

AdaptLearn tests a more personalized model for reading and learning support.

---

## Core features

- Contextual bandit engine to learn a student’s preferred format
  - text
  - audio
  - simplified text
  - accessibility-friendly layout
- Bayesian Knowledge Tracing (BKT) for mastery estimation
- Bimodal content delivery with text-to-speech and synchronized highlighting
- Pop-up dictionary for unfamiliar words
- Gamified motivational loop using a digital pet and celebration effects
- Dictation-based answer input for students with motor challenges
- Local progress persistence using browser storage

---

## System architecture

```text
Student
  |
  v
Frontend (Vanilla JS)
  |   \
  |    \-- saves progress to LocalStorage
  |
  v
Backend (FastAPI)
  |
  +--> BKT Engine --> updates mastery dashboard
  |
  +--> Bandit Engine --> chooses preferred presentation format
  |
  +--> Lesson Bank --> returns curated learning content
