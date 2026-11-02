# AdaptLearn

graph TD
    A[👩‍🎓 Student opens app] --> B{Picks a module<br/>from Quest Map}
    B --> C[Sees a passage<br/>+ question]
    C --> D{Answers<br/>correctly?}
    
    D -->|✅ Yes| E[+Mastery<br/>Confetti 🎉<br/>Pet evolves 🐥]
    D -->|❌ No| F[Show explanation<br/>Stay calm 😌]
    
    E --> G[Bandit re-picks format<br/>based on 👍/👎]
    F --> G
    
    G --> H[Next question<br/>in best format]
    H --> C
    
    C -.Taps hard word.-> I[📖 Dictionary<br/>emoji + audio]
    
    style A fill:#F4F1EA,stroke:#1A1A1A,stroke-width:2px
    style E fill:#34D399,stroke:#1A1A1A,stroke-width:2px
    style F fill:#F87171,stroke:#1A1A1A,stroke-width:2px
    style I fill:#FFD13B,stroke:#1A1A1A,stroke-width:2px
