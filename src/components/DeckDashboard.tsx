import React, { useState, useMemo } from 'react';
import { Deck } from '../types/quiz.js';
import {
  Play,
  RotateCcw,
  Sparkles,
  Search,
  CheckCircle2,
  AlertCircle,
  Code2,
  Trash2,
  Download,
  Upload,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface DeckDashboardProps {
  decks: Deck[];
  onStartQuiz: (deck: Deck, isRemediationOnly: boolean) => void;
  onOpenCreateModal: () => void;
  onDeleteDeck: (deckId: string) => void;
  onResetDeckProgress: (deckId: string) => void;
  onImportDeck: (importedDeck: Deck) => void;
}

export const DeckDashboard: React.FC<DeckDashboardProps> = ({
  decks,
  onStartQuiz,
  onOpenCreateModal,
  onDeleteDeck,
  onResetDeckProgress,
  onImportDeck,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'core' | 'custom' | 'needs-review'>('all');
  const [expandedDeckId, setExpandedDeckId] = useState<string | null>(null);

  // Overall metrics
  const stats = useMemo(() => {
    const totalDecks = decks.length;
    const totalCards = decks.reduce((acc, d) => acc + d.cards.length, 0);
    const totalMissed = decks.reduce((acc, d) => acc + d.missedCardIds.length, 0);
    const totalAttempts = decks.reduce((acc, d) => acc + (d.totalAttempts || 0), 0);
    const totalFirstTry = decks.reduce((acc, d) => acc + (d.firstTryCorrectCount || 0), 0);
    const avgMastery =
      totalAttempts > 0
        ? Math.round((totalFirstTry / totalAttempts) * 100)
        : totalDecks > 0
        ? Math.round(decks.reduce((acc, d) => acc + d.masteryPercentage, 0) / totalDecks)
        : 0;

    return { totalDecks, totalCards, totalMissed, avgMastery };
  }, [decks]);

  // Filtered decks
  const filteredDecks = useMemo(() => {
    return decks.filter((deck) => {
      const matchesSearch =
        deck.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedCategory === 'core') return deck.category === 'core';
      if (selectedCategory === 'custom') return deck.category === 'custom';
      if (selectedCategory === 'needs-review') return deck.missedCardIds.length > 0;
      return true;
    });
  }, [decks, searchQuery, selectedCategory]);

  const handleExportDeck = (deck: Deck) => {
    const jsonStr = JSON.stringify(deck, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pyrecall-${deck.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.title && Array.isArray(parsed.cards)) {
          onImportDeck({
            ...parsed,
            id: `imported-${Date.now()}`,
            category: 'custom',
            createdAt: Date.now(),
            masteryPercentage: 0,
            missedCardIds: [],
            totalAttempts: 0,
            firstTryCorrectCount: 0,
          });
        }
      } catch (err) {
        console.error('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-8">
      {/* Hero Strip with 4 KPI Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-400">Total Study Decks</div>
          <div className="mt-2 text-2xl font-bold font-mono text-white tabular-nums">
            {stats.totalDecks}
          </div>
          <div className="mt-1 text-xs text-slate-500">Curated & Custom</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-400">Interactive Questions</div>
          <div className="mt-2 text-2xl font-bold font-mono text-sky-400 tabular-nums">
            {stats.totalCards}
          </div>
          <div className="mt-1 text-xs text-slate-500">Fill-in-the-blank code cards</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-400">Overall Code Mastery</div>
          <div className="mt-2 text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {stats.avgMastery}%
          </div>
          <div className="mt-1 text-xs text-slate-500">First-try accuracy</div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 backdrop-blur-sm">
          <div className="text-xs font-medium text-slate-400">Cards Needing Review</div>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400 tabular-nums">
            {stats.totalMissed}
          </div>
          <div className="mt-1 text-xs text-slate-500">Isolated for targeted drill</div>
        </div>
      </section>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search decks, topics, or Python syntax..."
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
          />
        </div>

        {/* Category Controls and Actions */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Decks ({decks.length})
            </button>
            <button
              onClick={() => setSelectedCategory('core')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'core'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Core Python
            </button>
            <button
              onClick={() => setSelectedCategory('custom')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'custom'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              My Decks
            </button>
            <button
              onClick={() => setSelectedCategory('needs-review')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === 'needs-review'
                  ? 'bg-amber-500/20 text-amber-300'
                  : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Needs Review ({stats.totalMissed})
            </button>
          </div>

          {/* Import JSON Button */}
          <label className="px-3 py-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 rounded-lg text-xs font-medium text-slate-300 flex items-center gap-1.5 cursor-pointer transition-colors whitespace-nowrap">
            <Upload className="w-3.5 h-3.5 text-slate-400" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="text-center py-16 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-800/80 flex items-center justify-center text-slate-400 mb-4">
            <Code2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No study decks found</h3>
          <p className="mt-1 text-sm text-slate-400 max-w-sm mx-auto">
            {searchQuery
              ? `No decks match "${searchQuery}". Try a different keyword.`
              : 'Create your first custom deck from class notes or let AI build one from a topic.'}
          </p>
          <button
            onClick={onOpenCreateModal}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate or Create Deck</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredDecks.map((deck) => {
            const hasMissed = deck.missedCardIds.length > 0;
            const isExpanded = expandedDeckId === deck.id;

            return (
              <div
                key={deck.id}
                className="bg-slate-900/70 border border-slate-800 hover:border-slate-700/80 rounded-xl p-5 flex flex-col justify-between transition-all group"
              >
                <div>
                  {/* Category and Tags */}
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="font-mono text-sky-400 font-medium">
                      {deck.category === 'core' ? 'Core Python' : 'Custom Generated'}
                    </span>
                    <span className="font-mono text-slate-500">
                      {deck.cards.length} Challenges
                    </span>
                  </div>

                  {/* Title and Description */}
                  <h3 className="mt-2 text-lg font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {deck.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {deck.description}
                  </p>

                  {/* Tags */}
                  <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 flex-wrap">
                    {deck.tags.map((tag, i) => (
                      <React.Fragment key={tag}>
                        <span className="text-slate-400">{tag}</span>
                        {i < deck.tags.length - 1 && (
                          <span className="text-slate-600" aria-hidden="true">
                            ·
                          </span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>

                  {/* Mastery Progress Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Mastery Progress</span>
                      </span>
                      <span className="font-mono font-semibold text-emerald-400 tabular-nums">
                        {deck.masteryPercentage}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500 rounded-full"
                        style={{ width: `${deck.masteryPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Remediation alert if cards missed */}
                  {hasMissed && (
                    <div className="mt-3 flex items-center gap-2 text-xs text-amber-300 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-lg">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{deck.missedCardIds.length} questions failed on last study attempt</span>
                    </div>
                  )}

                  {/* Expandable card list inspect */}
                  {isExpanded && (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-xs space-y-2">
                      <div className="font-semibold text-slate-300">Questions in this deck:</div>
                      {deck.cards.map((c, idx) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between py-1 px-2 rounded bg-slate-950/60 font-mono text-[11px]"
                        >
                          <span className="text-slate-300 truncate max-w-[240px]">
                            {idx + 1}. {c.conceptTitle}
                          </span>
                          <span className="text-sky-400 shrink-0 font-semibold">
                            target: {c.blankTarget}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Actions Bottom Strip */}
                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2">
                    {/* Primary Study Now */}
                    <button
                      onClick={() => onStartQuiz(deck, false)}
                      className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Study Full Deck</span>
                    </button>

                    {/* Retry Missed Cards */}
                    {hasMissed && (
                      <button
                        onClick={() => onStartQuiz(deck, true)}
                        className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer active:scale-95"
                        title="Drill only the questions you got wrong"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Drill Missed ({deck.missedCardIds.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center gap-1 text-slate-400">
                    <button
                      onClick={() => setExpandedDeckId(isExpanded ? null : deck.id)}
                      className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title={isExpanded ? 'Collapse questions' : 'View questions list'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleExportDeck(deck)}
                      className="p-1.5 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Export deck as JSON"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onResetDeckProgress(deck.id)}
                      className="p-1.5 hover:text-amber-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                      title="Reset study history & mastery"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    {deck.category === 'custom' && (
                      <button
                        onClick={() => onDeleteDeck(deck.id)}
                        className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                        title="Delete custom deck"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
