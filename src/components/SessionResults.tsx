import React from 'react';
import { StudySessionSummary } from '../types/quiz.js';
import {
  Trophy,
  RotateCcw,
  Layers,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface SessionResultsProps {
  summary: StudySessionSummary;
  onDrillMissed: () => void;
  onStudyAgain: () => void;
  onBackToDashboard: () => void;
}

export const SessionResults: React.FC<SessionResultsProps> = ({
  summary,
  onDrillMissed,
  onStudyAgain,
  onBackToDashboard,
}) => {
  const hasMissed = summary.missedCards.length > 0;
  const isPerfect = summary.scorePercentage === 100;

  const minutes = Math.floor(summary.timeSpentSeconds / 60);
  const seconds = summary.timeSpentSeconds % 60;
  const durationText = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Trophy / Result Banner */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 text-center relative overflow-hidden">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400 mb-4 shadow-lg shadow-sky-500/10">
          {isPerfect ? (
            <Trophy className="w-8 h-8 text-amber-400" />
          ) : (
            <Sparkles className="w-8 h-8 text-sky-400" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-white tracking-tight">
          {isPerfect
            ? 'Flawless Code Mastery!'
            : summary.scorePercentage >= 75
            ? 'Strong Session!'
            : 'Study Session Complete'}
        </h2>
        <p className="mt-1 text-sm text-slate-400">
          {summary.deckTitle} {summary.isRemediationOnly ? '· Targeted Remediation' : ''}
        </p>

        {/* 3 Metric Strips */}
        <div className="mt-6 grid grid-cols-3 gap-4 max-w-lg mx-auto">
          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">First-Try Accuracy</div>
            <div
              className={`mt-1 text-2xl font-mono font-bold tabular-nums ${
                summary.scorePercentage >= 80
                  ? 'text-emerald-400'
                  : summary.scorePercentage >= 60
                  ? 'text-sky-400'
                  : 'text-amber-400'
              }`}
            >
              {summary.scorePercentage}%
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Correct Answers</div>
            <div className="mt-1 text-2xl font-mono font-bold text-white tabular-nums">
              {summary.correctCount} / {summary.totalCards}
            </div>
          </div>

          <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-[11px] font-medium text-slate-400">Session Duration</div>
            <div className="mt-1 text-2xl font-mono font-bold text-slate-300 flex items-center justify-center gap-1">
              <Clock className="w-4 h-4 text-slate-500" />
              <span>{durationText}</span>
            </div>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          {hasMissed ? (
            <button
              onClick={onDrillMissed}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Drill Missed Cards Only ({summary.missedCards.length})</span>
            </button>
          ) : (
            <button
              onClick={onStudyAgain}
              className="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Again</span>
            </button>
          )}

          {hasMissed && (
            <button
              onClick={onStudyAgain}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-sm rounded-lg transition-colors cursor-pointer"
            >
              Study Full Deck
            </button>
          )}

          <button
            onClick={onBackToDashboard}
            className="px-5 py-2.5 border border-slate-800 hover:bg-slate-800/80 text-slate-300 font-medium text-sm rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Deck Hub</span>
          </button>
        </div>
      </div>

      {/* Breakdown of Missed Questions */}
      {hasMissed && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-amber-400 mb-4">
            <XCircle className="w-4 h-4" />
            <span>Cards to Review ({summary.missedCards.length})</span>
          </div>

          <div className="space-y-3">
            {summary.missedCards.map((card, idx) => (
              <div
                key={card.id || idx}
                className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{card.conceptTitle}</span>
                  <span className="text-slate-500 font-mono text-[11px]">{card.topic}</span>
                </div>
                <div className="text-xs text-slate-400">{card.explanation}</div>
                <div className="p-2 bg-slate-900 rounded font-mono text-xs flex items-center justify-between">
                  <span className="text-slate-400">Required syntax:</span>
                  <span className="text-emerald-400 font-bold">{card.blankTarget}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
