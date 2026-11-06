import React, { useState, useEffect } from 'react';
import { Deck, StudySessionSummary, QuizCard } from './types/quiz.js';
import { DEFAULT_PYTHON_DECKS } from './data/default-decks.js';
import { Header } from './components/Header.js';
import { DeckDashboard } from './components/DeckDashboard.js';
import { QuizArena } from './components/QuizArena.js';
import { SessionResults } from './components/SessionResults.js';
import { DeckCreatorModal } from './components/DeckCreatorModal.js';
import { SyllabusGuide } from './components/SyllabusGuide.js';
import { calculateMastery } from './utils/quiz-evaluator.js';

const STORAGE_KEY = 'pyrecall_decks_v1';

export default function App() {
  const [decks, setDecks] = useState<Deck[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load decks from localStorage', e);
    }
    return DEFAULT_PYTHON_DECKS;
  });

  const [activeView, setActiveView] = useState<'dashboard' | 'arena' | 'results' | 'syllabus'>('dashboard');
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  const [activeCards, setActiveCards] = useState<QuizCard[]>([]);
  const [isRemediationOnly, setIsRemediationOnly] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<StudySessionSummary | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Sync decks to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    } catch (e) {
      console.error('Failed to save decks to localStorage', e);
    }
  }, [decks]);

  const handleStartQuiz = (deck: Deck, remediation: boolean) => {
    setActiveDeck(deck);
    setIsRemediationOnly(remediation);

    if (remediation && deck.missedCardIds.length > 0) {
      const missedSet = new Set(deck.missedCardIds);
      const filtered = deck.cards.filter((c) => missedSet.has(c.id));
      setActiveCards(filtered.length > 0 ? filtered : deck.cards);
    } else {
      setActiveCards(deck.cards);
    }

    setActiveView('arena');
  };

  const handleSessionComplete = (summary: StudySessionSummary) => {
    setSessionSummary(summary);

    // Update the deck's progress and stats in state
    setDecks((prevDecks) =>
      prevDecks.map((d) => {
        if (d.id !== summary.deckId) return d;

        const missedIds = summary.missedCards.map((c) => c.id);
        const newMissedCardIds = summary.isRemediationOnly
          ? Array.from(new Set([...d.missedCardIds.filter((id) => missedIds.includes(id))]))
          : missedIds;

        const mastery = calculateMastery(d.cards.length, newMissedCardIds.length);

        return {
          ...d,
          lastStudiedAt: Date.now(),
          masteryPercentage: mastery,
          missedCardIds: newMissedCardIds,
          totalAttempts: (d.totalAttempts || 0) + summary.totalCards,
          firstTryCorrectCount: (d.firstTryCorrectCount || 0) + summary.correctCount,
        };
      })
    );

    setActiveView('results');
  };

  const handleDrillMissed = () => {
    if (!activeDeck || !sessionSummary || sessionSummary.missedCards.length === 0) return;
    setActiveCards(sessionSummary.missedCards);
    setIsRemediationOnly(true);
    setActiveView('arena');
  };

  const handleStudyAgain = () => {
    if (!activeDeck) return;
    setActiveCards(activeDeck.cards);
    setIsRemediationOnly(false);
    setActiveView('arena');
  };

  const handleDeckCreated = (newDeck: Deck) => {
    setDecks((prev) => [newDeck, ...prev]);
    // Immediately offer to study the new deck
    handleStartQuiz(newDeck, false);
  };

  const handleDeleteDeck = (deckId: string) => {
    setDecks((prev) => prev.filter((d) => d.id !== deckId));
  };

  const handleResetDeckProgress = (deckId: string) => {
    setDecks((prev) =>
      prev.map((d) =>
        d.id === deckId
          ? {
              ...d,
              masteryPercentage: 0,
              missedCardIds: [],
              totalAttempts: 0,
              firstTryCorrectCount: 0,
              lastStudiedAt: undefined,
            }
          : d
      )
    );
  };

  const handleImportDeck = (importedDeck: Deck) => {
    setDecks((prev) => [importedDeck, ...prev]);
  };

  const handleSelectTopicToGenerate = (_topicName: string) => {
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500/30 selection:text-sky-200">
      <Header
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        activeView={activeView === 'syllabus' ? 'syllabus' : 'dashboard'}
        setActiveView={(view) => {
          if (view === 'dashboard') {
            setActiveView('dashboard');
          } else {
            setActiveView('syllabus');
          }
        }}
        deckCount={decks.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === 'dashboard' && (
          <DeckDashboard
            decks={decks}
            onStartQuiz={handleStartQuiz}
            onOpenCreateModal={() => setIsCreateModalOpen(true)}
            onDeleteDeck={handleDeleteDeck}
            onResetDeckProgress={handleResetDeckProgress}
            onImportDeck={handleImportDeck}
          />
        )}

        {activeView === 'arena' && activeDeck && (
          <QuizArena
            cards={activeCards}
            deckTitle={activeDeck.title}
            deckId={activeDeck.id}
            isRemediationOnly={isRemediationOnly}
            onSessionComplete={handleSessionComplete}
            onExit={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'results' && sessionSummary && (
          <SessionResults
            summary={sessionSummary}
            onDrillMissed={handleDrillMissed}
            onStudyAgain={handleStudyAgain}
            onBackToDashboard={() => setActiveView('dashboard')}
          />
        )}

        {activeView === 'syllabus' && (
          <SyllabusGuide
            onSelectTopicToGenerate={handleSelectTopicToGenerate}
          />
        )}
      </main>

      <DeckCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onDeckCreated={handleDeckCreated}
      />

      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-600">
        <p>PyRecall · Active Recall & Code Practice Engine · Built for Python 3.12+</p>
      </footer>
    </div>
  );
}
