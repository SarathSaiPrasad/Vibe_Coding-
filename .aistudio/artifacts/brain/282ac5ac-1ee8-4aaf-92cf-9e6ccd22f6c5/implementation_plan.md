# PyRecall: Python Active Study & Code Quizzing Engine

An interactive, active-recall Python study application designed for developers and computer science students. PyRecall transforms raw class notes, uploaded `.py`/`.md`/`.txt` files, or topic outlines into high-yield, fill-in-the-blank code quizzes with strict exact-match checking, step-by-step mechanical explanations, and persistent mastery analytics.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following product specifications were established through our interactive interview process:

- **Confirmed Decision 1: Dual Ingestion Channels**: The app supports both direct user inputs (pasting raw notes, markdown, and uploading `.py`/`.txt`/`.md` files) and prompt-driven outline generation (entering a syllabus topic such as *"Generators & Iterators"* or *"FastAPI Dependency Injection"* to synthesize a full study deck via Gemini).
- **Confirmed Decision 2: Study Mode & Output Format**: Primary focus is **Interactive Code Quizzes with Fill-in-the-Blank Snippets**, complemented by key Python concept definitions and syntax explanations rather than passive reading cards.
- **Confirmed Decision 3: Precision Evaluation**: Strict exact-match code checking with instant step-by-step walkthroughs to reinforce precise Python syntax, method names, and idiomatic idioms.
- **Confirmed Decision 4: Local Persistence & Remediation Loop**: Decks, high scores, and question attempt history are saved locally in `localStorage`, featuring a dedicated **"Retry Missed Cards"** spaced-repetition loop.

---

## 1. Overview & Core Concept

### What It Does
PyRecall allows learners to study Python effectively by transforming passive study material into active coding tests. Users can either supply their own raw notes and code scripts or select/enter a Python syllabus topic. The system structures the material into targeted code challenges where critical syntax (keywords, built-ins, slicing syntax, decorators, comprehension patterns) is blanked out. Learners type the exact Python code into an interactive terminal-styled quiz interface, receive instant mechanical feedback with line-by-line solution breakdowns, and track deck mastery scores.

### Target Audience & Persona
- **App & Software Developers**: Looking to level up their Python fundamentals, master standard library idioms, or prep for technical interviews.
- **Students & Self-Learners**: Turning scattered lecture notes, bootcamp slides, and Jupyter notebooks into bite-sized retention quizzes.

### Key Value Delivered
Eliminates passive re-reading and prevents the common "illusion of competence" by forcing real keystroke recall of Python constructs under strict syntax rules.

---

## 2. User Experience & Visual Design

### Key User Flows

```
┌────────────────────────────────────────────────────────────────────────┐
│                        1. DECK DASHBOARD                               │
│  - Browse Preloaded Core Python Decks (OOP, Iterators, Collections)    │
│  - View Mastery % & Weak Card Count                                    │
│  - Actions: "Create New Deck" | "Study Now" | "Retry Missed"          │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
             ┌──────────────────────┴──────────────────────┐
             ▼                                             ▼
┌───────────────────────────────┐             ┌──────────────────────────┐
│   2A. PASTE / UPLOAD MODE     │             │   2B. TOPIC PROMPT MODE  │
│ - Paste notes, markdown, code │             │ - Enter Python topic     │
│ - Drag-and-drop .py, .md, .txt│             │ - Select difficulty tier │
│ - Instant parse preview       │             │ - Gemini deck generator │
└──────────────┬────────────────┘             └────────────┬─────────────┘
               └──────────────────────┬────────────────────┘
                                      ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      3. INTERACTIVE QUIZ ARENA                         │
│ - Dark terminal code card with syntax-highlighted Python snippet       │
│ - Inline code blank with autofocus input                              │
│ - Single-click "Check Code" / Enter key binding                        │
│ - Strict Exact-Match evaluation & Step-by-Step Solution Breakdown     │
│ - Card Flagging: "Mark for Review"                                     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     4. MASTERY SUMMARY & RETRY                         │
│ - Scorecard (% correct on first try, time elapsed, streak)            │
│ - One-click "Drill Only Missed Questions" remediation filter           │
│ - Export Deck / Save to Library                                        │
└────────────────────────────────────────────────────────────────────────┘
```

### Visual Identity & Theme
- **Aesthetic Direction**: Modern developer workspace / IDE aesthetic combining clean technical typography with focused, distraction-free study stages.
- **Color Palette & Surface Discipline (60-30-10 Rule)**:
  - *60% Neutral Canvas*: Deep slate workspace (`#090D16` / `#0F172A`) with subtle radial contrast.
  - *30% Structural Panels*: Hairline borders (`#1E293B`), dark surface cards (`#131B2E`), and crisp syntax tokens.
  - *10% Semantic Focal Accents*: Emerald (`#10B981`) for correct matches and passing mastery, Cyan/Sky (`#0EA5E9`) for active controls and Python branding, and Coral Amber (`#F59E0B`) for missed blanks.
- **Typography & Hierarchy**:
  - *Display / Headings*: Plus Jakarta Sans (`font-sans tracking-tight font-semibold`).
  - *Code & Quizzes*: JetBrains Mono / IBM Plex Mono with `tabular-nums` for code snippets, line numbers, and inline blanks.
  - *Anti-Slop Restraint*: No decorative pulsing status dots, no pseudo-technical `//` comment headers, and zero pill-capsule clutter around metadata.

---

## 3. Key Product Decisions & Trade-Offs

| Decision | Chosen Approach | Rationale & Trade-off |
| :--- | :--- | :--- |
| **Quiz Input Style** | Inline Monospace Blank with Strict Matching | Builds exact muscle memory for Python keywords, methods, and syntax. Trimmed case-sensitive comparison prevents false positives while providing clear feedback. |
| **Content Generation** | Dual Client-Side Gemini SDK + Structured JSON Parser | Enables zero-backend generation directly in browser using `@google/genai`, while providing a robust offline fallback with high-quality built-in standard Python decks. |
| **Data Persistence** | Browser `localStorage` with JSON Import/Export | Requires no login or external database setup, ensures immediate persistence across page reloads, and respects user privacy. |
| **Remediation Loop** | Instant "Drill Missed Cards" Action | Maximizes study efficiency by letting learners skip already mastered cards and focus strictly on weak points. |

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                  │
│                                                                        │
│  ┌────────────────────┐    ┌──────────────────┐    ┌─────────────────┐ │
│  │  Deck Dashboard    │    │   Deck Creator   │    │   Quiz Engine   │ │
│  │  - Deck cards      │    │  - Text/File tab │    │  - Code viewer  │ │
│  │  - Mastery stats   │    │  - Topic Gen tab │    │  - Strict check │ │
│  │  - Filter/Search   │    │  - JSON preview  │    │  - Step breakdown││
│  └─────────┬──────────┘    └─────────┬────────┘    └────────┬────────┘ │
│            │                         │                      │          │
│            ▼                         ▼                      ▼          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   State & Persistence Store                      │  │
│  │       (Active deck, user attempts, mastery calculations)         │  │
│  └───────────────────────────────────┬──────────────────────────────┘  │
└──────────────────────────────────────┼─────────────────────────────────┘
                                       │
        ┌──────────────────────────────┴──────────────────────────────┐
        ▼                                                             ▼
┌───────────────────────────────┐             ┌──────────────────────────┐
│        LOCAL STORAGE          │             │     GEMINI 2.5 FLASH     │
│ - pyrecall_decks              │             │ - Deck generation schema │
│ - pyrecall_history            │             │ - Code explanation & fix │
└───────────────────────────────┘             └──────────────────────────┘
```

### Core Data Models

```typescript
export interface QuizCard {
  id: string;
  topic: string;
  conceptTitle: string;
  explanation: string;
  codeSnippet: string;       // Contains marker like ___BLANK___ or line highlight
  blankTarget: string;       // Strict exact match target (e.g. "yield", "isinstance", "enumerate")
  hint: string;              // Gentle syntax reminder
  stepByStepSolution: string[]; // 2-4 ordered bullet points explaining mechanics
  commonMistakes: string;    // What beginners usually do wrong
}

export interface Deck {
  id: string;
  title: string;
  description: string;
  category: 'core' | 'custom';
  tags: string[];
  cards: QuizCard[];
  createdAt: number;
  lastStudiedAt?: number;
  masteryPercentage: number;
  missedCardIds: string[];
}
```

---

## 5. Master Prompt & Scope Review

See the conversational response for the standalone Master Prompt ready to copy or build, followed by the rigorous critical evaluation against the original goal.
