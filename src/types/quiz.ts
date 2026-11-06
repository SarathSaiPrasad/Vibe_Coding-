export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

export interface QuizCard {
  id: string;
  topic: string;
  conceptTitle: string;
  explanation: string;
  codeSnippet: string;       // Contains marker ___BLANK___ for the interactive input
  blankTarget: string;       // Exact expected Python string, e.g. "yield", "isinstance", "key=lambda x: x[1]"
  hint: string;              // Helpful nudge without giving away the full answer
  stepByStepSolution: string[]; // 2-4 ordered bullet points explaining the mechanics
  commonMistakes: string;    // Common pitfalls or invalid assumptions
  difficulty: DifficultyLevel;
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
  totalAttempts: number;
  firstTryCorrectCount: number;
}

export interface CardAttempt {
  cardId: string;
  userAnswer: string;
  isCorrect: boolean;
  timestamp: number;
}

export interface StudySessionSummary {
  deckId: string;
  deckTitle: string;
  totalCards: number;
  correctCount: number;
  missedCards: QuizCard[];
  scorePercentage: number;
  timeSpentSeconds: number;
  isRemediationOnly: boolean;
}
