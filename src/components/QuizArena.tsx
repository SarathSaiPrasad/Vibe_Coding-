import React, { useState, useEffect, useRef } from 'react';
import { QuizCard, StudySessionSummary } from '../types/quiz.js';
import { evaluateAnswer, splitCodeSnippet, EvaluationResult } from '../utils/quiz-evaluator.js';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Flame,
  Bookmark,
  BookmarkCheck,
  RotateCcw,
  LogOut,
  Sparkles,
} from 'lucide-react';

interface QuizArenaProps {
  cards: QuizCard[];
  deckTitle: string;
  deckId: string;
  isRemediationOnly: boolean;
  onSessionComplete: (summary: StudySessionSummary) => void;
  onExit: () => void;
}

export const QuizArena: React.FC<QuizArenaProps> = ({
  cards,
  deckTitle,
  deckId,
  isRemediationOnly,
  onSessionComplete,
  onExit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isEvaluated, setIsEvaluated] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<EvaluationResult | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [bookmarkedCardIds, setBookmarkedCardIds] = useState<Set<string>>(new Set());

  // Session scoring
  const [correctCards, setCorrectCards] = useState<QuizCard[]>([]);
  const [missedCards, setMissedCards] = useState<QuizCard[]>([]);
  const [streak, setStreak] = useState(0);
  const [startTime] = useState<number>(Date.now());

  const inputRef = useRef<HTMLInputElement>(null);
  const currentCard = cards[currentIndex];

  // Autofocus input on card change
  useEffect(() => {
    setUserAnswer('');
    setIsEvaluated(false);
    setEvaluationResult(null);
    setShowHint(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [currentIndex]);

  if (!currentCard) {
    return null;
  }

  const { prefix, suffix, hasBlank } = splitCodeSnippet(currentCard.codeSnippet);

  const handleCheckCode = () => {
    if (isEvaluated) return;

    const result = evaluateAnswer(userAnswer, currentCard.blankTarget);
    setEvaluationResult(result);
    setIsEvaluated(true);

    if (result.isCorrect) {
      setCorrectCards((prev) => [...prev, currentCard]);
      setStreak((prev) => prev + 1);
    } else {
      setMissedCards((prev) => [...prev, currentCard]);
      setStreak(0);
    }
  };

  const handleNextCard = () => {
    if (currentIndex + 1 < cards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      // Session finished
      const timeSpentSeconds = Math.round((Date.now() - startTime) / 1000);
      const finalCorrectCount = correctCards.length + (evaluationResult?.isCorrect ? 1 : 0);
      const finalMissed = evaluationResult?.isCorrect
        ? missedCards
        : [...missedCards, currentCard];

      onSessionComplete({
        deckId,
        deckTitle,
        totalCards: cards.length,
        correctCount: finalCorrectCount,
        missedCards: finalMissed,
        scorePercentage: Math.round((finalCorrectCount / cards.length) * 100),
        timeSpentSeconds,
        isRemediationOnly,
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!isEvaluated) {
        handleCheckCode();
      } else {
        handleNextCard();
      }
    }
  };

  const toggleBookmark = () => {
    setBookmarkedCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(currentCard.id)) {
        next.delete(currentCard.id);
      } else {
        next.add(currentCard.id);
      }
      return next;
    });
  };

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);
  const isBookmarked = bookmarkedCardIds.has(currentCard.id);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Quiz Top Navigation Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl px-5 py-3.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onExit}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            title="Return to Dashboard"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Exit</span>
          </button>
          <div className="h-4 w-px bg-slate-800" />
          <div className="text-xs">
            <span className="text-slate-400">Studying:</span>{' '}
            <span className="font-semibold text-white">{deckTitle}</span>
            {isRemediationOnly && (
              <span className="ml-2 px-2 py-0.5 text-[10px] font-mono font-medium rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Drilling Missed Cards
              </span>
            )}
          </div>
        </div>

        {/* Progress & Streak */}
        <div className="flex items-center gap-6">
          {streak > 1 && (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono font-semibold animate-pulse">
              <Flame className="w-4 h-4 fill-current" />
              <span>{streak} Streak</span>
            </div>
          )}

          <div className="text-right">
            <div className="text-xs font-mono text-slate-400">
              <span className="text-white font-bold">{currentIndex + 1}</span> of{' '}
              <span className="text-slate-500">{cards.length}</span>
            </div>
            <div className="w-24 sm:w-32 h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden">
              <div
                className="h-full bg-sky-500 transition-all duration-300 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Concept Header Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="text-sky-400 font-mono font-medium">{currentCard.topic}</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{currentCard.difficulty} tier</span>
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {currentCard.conceptTitle}
            </h2>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed">
              {currentCard.explanation}
            </p>
          </div>

          <button
            onClick={toggleBookmark}
            className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isBookmarked
                ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
            }`}
            title={isBookmarked ? 'Card flagged for review' : 'Flag this card'}
          >
            {isBookmarked ? (
              <BookmarkCheck className="w-5 h-5 fill-current" />
            ) : (
              <Bookmark className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Interactive Code Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        {/* Terminal Chrome Header */}
        <div className="px-4 py-2.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400">solution.py</span>
          </div>
          <div className="text-[11px] font-mono text-slate-500">
            Type exact code and press Enter
          </div>
        </div>

        {/* Code Content with Inline Monospace Blank */}
        <div className="p-5 font-mono text-sm leading-relaxed text-slate-200 overflow-x-auto">
          {hasBlank ? (
            <div className="whitespace-pre">
              <span>{prefix}</span>
              <span className="inline-block align-middle my-0.5">
                <input
                  ref={inputRef}
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isEvaluated}
                  placeholder="code here..."
                  className={`px-2.5 py-1 text-sm font-mono font-semibold rounded border transition-all ${
                    !isEvaluated
                      ? 'bg-slate-900 border-sky-500 text-sky-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-inner'
                      : evaluationResult?.isCorrect
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : 'bg-rose-950/80 border-rose-500 text-rose-300'
                  }`}
                  style={{
                    minWidth: '120px',
                    width: `${Math.max(12, userAnswer.length + 3)}ch`,
                  }}
                  autoFocus
                />
              </span>
              <span>{suffix}</span>
            </div>
          ) : (
            <pre>{currentCard.codeSnippet}</pre>
          )}
        </div>
      </div>

      {/* Action Bar (Hint and Submit) */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          onClick={() => setShowHint(!showHint)}
          className="text-xs font-medium text-slate-400 hover:text-sky-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <HelpCircle className="w-4 h-4" />
          <span>{showHint ? 'Hide Hint' : 'Show Syntax Hint'}</span>
        </button>

        <div className="flex items-center gap-3">
          {!isEvaluated ? (
            <button
              onClick={handleCheckCode}
              disabled={!userAnswer.trim()}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-semibold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Check Code</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] bg-slate-950/20 text-slate-900 rounded font-mono">
                Enter ↵
              </kbd>
            </button>
          ) : (
            <button
              onClick={handleNextCard}
              className="px-6 py-2.5 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>
                {currentIndex + 1 < cards.length ? 'Next Question' : 'Finish Session'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Hint Banner */}
      {showHint && (
        <div className="p-4 bg-sky-950/40 border border-sky-800/60 rounded-xl text-xs text-sky-200 animate-in fade-in duration-200">
          <div className="font-semibold text-sky-400 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Syntax Clue</span>
          </div>
          <p>{currentCard.hint}</p>
        </div>
      )}

      {/* Mechanical Evaluation & Solution Breakdown Panel */}
      {isEvaluated && evaluationResult && (
        <div
          className={`p-6 rounded-xl border animate-in slide-in-from-bottom-2 duration-300 ${
            evaluationResult.isCorrect
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-rose-950/30 border-rose-500/30 text-rose-200'
          }`}
        >
          {/* Status Header */}
          <div className="flex items-center gap-3">
            {evaluationResult.isCorrect ? (
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <XCircle className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-white">
                {evaluationResult.isCorrect ? 'Correct! Code Matches Exactly' : 'Incorrect syntax'}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {evaluationResult.isCorrect
                  ? 'Precise Python syntax recognized.'
                  : 'Review the execution mechanics and exact keyword below.'}
              </p>
            </div>
          </div>

          {/* Diagnostic Note if near miss (e.g. case sensitivity, trailing semicolon) */}
          {evaluationResult.feedbackNote && (
            <div className="mt-3 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-xs text-amber-300">
              {evaluationResult.feedbackNote}
            </div>
          )}

          {/* Target comparison */}
          <div className="mt-4 p-3 bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Target Python token:</span>
              <span className="text-emerald-400 font-semibold">{currentCard.blankTarget}</span>
            </div>
            {!evaluationResult.isCorrect && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Your answer:</span>
                <span className="text-rose-400 font-semibold">
                  {userAnswer.trim() || '(blank)'}
                </span>
              </div>
            )}
          </div>

          {/* Step-by-Step Breakdown */}
          <div className="mt-5 pt-4 border-t border-slate-800/80">
            <div className="text-xs font-semibold text-slate-300 mb-2">
              Step-by-Step Python Execution Mechanics:
            </div>
            <ul className="space-y-1.5 text-xs text-slate-300 list-decimal list-inside leading-relaxed">
              {currentCard.stepByStepSolution.map((step, idx) => (
                <li key={idx}>
                  <span className="text-slate-200">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Common Beginner Mistake */}
          {currentCard.commonMistakes && (
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-xs">
              <span className="font-semibold text-amber-400">Common Pitfall: </span>
              <span className="text-slate-300">{currentCard.commonMistakes}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
