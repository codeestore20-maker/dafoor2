# AI Cost Analysis Scenarios (DeepSeek V3 + Context Caching)

This document outlines the projected costs for various student usage scenarios using the new optimized architecture with **DeepSeek Context Caching**.

**Architecture Key:**
- **System Prompt:** Contains ONLY the study material content (Cached).
- **User Prompt:** Contains the specific instructions (Summarize, Quiz, Chat, etc.).
- **Cache Hit:** ~90% cheaper input tokens.

**Pricing Model (DeepSeek V3):**
- Input (Cache Miss): **$0.14** / 1M tokens
- Input (Cache Hit): **$0.014** / 1M tokens
- Output: **$0.28** / 1M tokens

---

## Scenario A: The "Quick Look" Student (Small File)
**Profile:** Uploads a short 10-page handout, gets a summary, asks 5 questions.
- **File Size:** 10 pages ≈ 5,000 words ≈ **7,000 tokens**.

1.  **Action 1: Upload & Summarize**
    - Input (Cache Miss): 7k * $0.14 = $0.00098
    - Output (Summary): 1k * $0.28 = $0.00028
    - *Cost:* **$0.00126**

2.  **Action 2: Chat (5 Questions)**
    - Input (Cache Hit): 5 * (7k * $0.014) = $0.00049
    - Output (Answers): 5 * (300 * $0.28) = $0.00042
    - *Cost:* **$0.00091**

**Total Cost Scenario A:** **$0.00217** (Two-tenths of a cent) 
*(Virtually free)*

---

## Scenario B: The "Deep Diver" Student (Medium File)
**Profile:** Uploads a 50-page chapter, gets summary, flashcards, quiz, and has a long chat session.
- **File Size:** 50 pages ≈ 25,000 words ≈ **35,000 tokens**.

1.  **Action 1: Upload & Summarize**
    - Input (Cache Miss): 35k * $0.14 = $0.0049
    - Output (Summary): 1.5k * $0.28 = $0.00042
    - *Cost:* **$0.00532**

2.  **Action 2: Generate Flashcards (15 cards)**
    - Input (Cache Hit): 35k * $0.014 = $0.00049
    - Output (JSON): 1k * $0.28 = $0.00028
    - *Cost:* **$0.00077**

3.  **Action 3: Generate Quiz (10 Questions)**
    - Input (Cache Hit): 35k * $0.014 = $0.00049
    - Output (JSON): 1k * $0.28 = $0.00028
    - *Cost:* **$0.00077**

4.  **Action 4: Heavy Chat (50 Messages)**
    - Input (Cache Hit): 50 * (35k * $0.014) = $0.0245
    - Output (Answers): 50 * (300 * $0.28) = $0.0042
    - *Cost:* **$0.0287**

**Total Cost Scenario B:** **$0.0355** (3.5 cents)
*(Extremely affordable for a full study session)*

---

## Scenario C: The "Exam Cram" Student (Large File)
**Profile:** Uploads a full 150-page textbook PDF, needs comprehensive breakdown and intensive quizzing.
- **File Size:** 150 pages ≈ 75,000 words ≈ **100,000 tokens**.

1.  **Action 1: Multi-Chapter Summary (4 Chunks)**
    - *Note: Caching applies to each chunk individually after first pass.*
    - Input (Cache Miss): 100k * $0.14 = $0.014
    - Output (Long Summary): 4k * $0.28 = $0.00112
    - *Cost:* **$0.0151**

2.  **Action 2: Generate 3 Quizzes (Different topics)**
    - Input (Cache Hit): 3 * (100k * $0.014) = $0.0042
    - Output (JSON): 3 * (1k * $0.28) = $0.00084
    - *Cost:* **$0.0050**

3.  **Action 3: Exam Prediction & Glossary**
    - Input (Cache Hit): 2 * (100k * $0.014) = $0.0028
    - Output: 2k * $0.28 = $0.00056
    - *Cost:* **$0.00336**

4.  **Action 4: Marathon Chat (100 Messages)**
    - Input (Cache Hit): 100 * (100k * $0.014) = $0.14
    - Output: 100 * (300 * $0.28) = $0.0084
    - *Cost:* **$0.1484**

**Total Cost Scenario C:** **$0.1718** (17 cents)
*(For processing an entire book and studying it for hours)*

---

## Scenario D: The "Heavy User" (Semester Load)
**Profile:** A dedicated student processing an entire semester's worth of materials.
- **Volume:** 20 Files.
- **File Size:** Average 50 pages (35k tokens) per file.
- **Activities per File:**
  - 1 Summary (3 pages long output).
  - 100 Chat Messages.
  - Flashcards & Quiz.

**Cost Breakdown (Per File):**

1.  **Initial Processing (Summary):**
    - Input (Cache Miss): 35k * $0.14 = $0.0049
    - Output (3-page Summary ≈ 1.5k tokens): $0.00042
    - *Subtotal:* **$0.0053**

2.  **Chat Session (100 Messages):**
    - Input (Cache Hit): 100 * (35k * $0.014) = $0.049
    - Output (Answers): 100 * (300 * $0.28) = $0.0084
    - *Subtotal:* **$0.0574**

3.  **Extras (Flashcards + Quiz):**
    - Input (Cache Hit): 2 * (35k * $0.014) = $0.00098
    - Output: 2k * $0.28 = $0.00056
    - *Subtotal:* **$0.0015**

**Total Cost Per File:** **$0.0642** (6.4 cents)

**Total Semester Cost (20 Files):**
$0.0642 * 20 = **$1.28**

*(Processing an entire semester's curriculum for the price of a soda)*

---

## Summary Table

| Scenario | File Size | Activities | Total Cost |
| :--- | :--- | :--- | :--- |
| **A (Quick)** | 10 Pages | Summary + 5 Chats | **$0.002** |
| **B (Standard)** | 50 Pages | Summary + Flashcards + Quiz + 50 Chats | **$0.035** |
| **C (Heavy)** | 150 Pages | Full Book + 3 Quizzes + 100 Chats | **$0.172** |
| **D (Semester)** | 20 Files (50pg) | Summary + 100 Chats + Extras (x20) | **$1.28** |

## Conclusion
The implementation of Context Caching has successfully reduced the operational costs by approximately **85-90%** for repeated interactions (Chat, Quiz, Flashcards). The system is now highly scalable and cost-effective for heavy student usage.
