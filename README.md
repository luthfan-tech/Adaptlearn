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

The biggest improvement is to turn this from a “project pitch” into a clean, credible “product README” that makes it easy for someone to understand, run, and trust the project.

What I’d improve:

    Add a clearer project summary in the first 3–5 lines
    Make the feature list more scannable and less “pitch-heavy”
    Fix heading consistency and spacing
    Add a real “Quick Start” section with exact commands
    Include project structure so people know where things live
    Add screenshots or a demo GIF
    Explain the user flow and algorithms in simpler language
    Specify environment requirements (Python version, OS notes)
    Add a “Known limitations / future work” section with clear boundaries
    Add a license and contribution section

A stronger README should answer 4 questions immediately:

    What is this?
    Why does it matter?
    How do I run it?
    What are the limitations/future roadmap?

Here’s a cleaner version of the same README:
md

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

The system continuously learns from student feedback and adapts the next lesson format based on observed preferences and performance.
Tech stack

Backend

    Python
    FastAPI

Frontend

    HTML5
    CSS3
    JavaScript

Accessibility & browser APIs

    Web Speech API
    LocalStorage

The biggest improvement is to turn this from a “project pitch” into a clean, credible “product README” that makes it easy for someone to understand, run, and trust the project.

What I’d improve:

    Add a clearer project summary in the first 3–5 lines
    Make the feature list more scannable and less “pitch-heavy”
    Fix heading consistency and spacing
    Add a real “Quick Start” section with exact commands
    Include project structure so people know where things live
    Add screenshots or a demo GIF
    Explain the user flow and algorithms in simpler language
    Specify environment requirements (Python version, OS notes)
    Add a “Known limitations / future work” section with clear boundaries
    Add a license and contribution section

A stronger README should answer 4 questions immediately:

    What is this?
    Why does it matter?
    How do I run it?
    What are the limitations/future roadmap?

Here’s a cleaner version of the same README:
md

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

The system continuously learns from student feedback and adapts the next lesson format based on observed preferences and performance.
Tech stack

Backend

    Python
    FastAPI

Frontend

    HTML5
    CSS3
    JavaScript

Accessibility & browser APIs

    Web Speech API
    LocalStorage



##How to run locally##
Requirements:

    -Python 3.10+
    -A modern browser such as Chrome or Edge for Web Speech support

1.Clone the repository:
git clone https://github.com/luthfan-tech/Adaptlearn.git
cd Adaptlearn

2.Create and activate a virtual environment
On macOS/Linux:
python3 -m venv .venv
source .venv/bin/activate

On Windows:
python -m venv .venv
.\.venv\Scripts\Activate.ps1

3.Install dependencies:
pip install -r requirements.txt

4.Start the FastAPI app:
python -m uvicorn main:app --reload

5.Open the app in your browser:
http://127.0.0.1:8000


The biggest improvement is to turn this from a “project pitch” into a clean, credible “product README” that makes it easy for someone to understand, run, and trust the project.

What I’d improve:

    Add a clearer project summary in the first 3–5 lines
    Make the feature list more scannable and less “pitch-heavy”
    Fix heading consistency and spacing
    Add a real “Quick Start” section with exact commands
    Include project structure so people know where things live
    Add screenshots or a demo GIF
    Explain the user flow and algorithms in simpler language
    Specify environment requirements (Python version, OS notes)
    Add a “Known limitations / future work” section with clear boundaries
    Add a license and contribution section

A stronger README should answer 4 questions immediately:

    What is this?
    Why does it matter?
    How do I run it?
    What are the limitations/future roadmap?

Here’s a cleaner version of the same README:
md

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

The system continuously learns from student feedback and adapts the next lesson format based on observed preferences and performance.
Tech stack

Backend

    Python
    FastAPI

Frontend

    HTML5
    CSS3
    JavaScript

Accessibility & browser APIs

    Web Speech API
    LocalStorage

How to run locally

Requirements:

    Python 3.10+
    A modern browser such as Chrome or Edge for Web Speech support

    Clone the repository

bash

git clone https://github.com/luthfan-tech/Adaptlearn.git
cd Adaptlearn

    Create and activate a virtual environment

On macOS/Linux:
bash

python3 -m venv .venv
source .venv/bin/activate

On Windows:
PowerShell

python -m venv .venv
.\.venv\Scripts\Activate.ps1

    Install dependencies

bash

pip install -r requirements.txt

    Start the FastAPI app

bash

python -m uvicorn main:app --reload

    Open the app in your browser

Text

http://127.0.0.1:8000

Project structure
Text

AdaptLearn/
├── main.py
├── requirements.txt
├── README.md
├── static/
│   ├── css/
│   ├── js/
│   └── assets/
├── templates/
│   └── ...
├── app/
│   ├── api/
│   ├── models/
│   ├── algorithms/
│   └── utils/
└── data/
    └── lessons/

Algorithm overview-

Bayesian Knowledge Tracing (BKT):-
The backend estimates how likely a student is to know a skill after each answer. It accounts for uncertainty, guessing, and slipping.

Contextual Bandit
The system uses an epsilon-greedy strategy:
    -80% of the time: choose known-good presentation formats
    -20% of the time: explore a new format
This helps the system adapt over time based on student feedback.

Known limitations:
This is a prototype built during a hackathon sprint, so it intentionally leaves out several production-grade features:

    No persistent backend database
        -learner state is stored primarily in memory
        -browser localStorage saves completed levels, but not full server-side state
    Limited content set
        -the project contains a curated set of educational levels rather than an unlimited curriculum
    No clinical validation
        -the system does not diagnose or infer disabilities
        -the student explicitly chooses their learning profile
    No live LLM integration
        -the current system uses curated text rather than dynamic AI-generated adaptation

Future work:
-Add persistent user profiles and learning state in a database
-Expand curriculum across more subjects and skill areas
-Add real-time analytics dashboard for teachers and caregivers
-Integrate generative AI for dynamic simplification and content adaptation
-Support multi-language learning content
-Add accessibility testing and compliance review

License
This project is currently intended for educational/demo use. Add a license if you plan to share it publicly beyond the hackathon context.
