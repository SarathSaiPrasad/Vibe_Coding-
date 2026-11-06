import React from 'react';
import { Terminal, Plus, BookOpen, Layers } from 'lucide-react';

interface HeaderProps {
  onOpenCreateModal: () => void;
  activeView: 'dashboard' | 'arena' | 'syllabus';
  setActiveView: (view: 'dashboard' | 'syllabus') => void;
  deckCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCreateModal,
  activeView,
  setActiveView,
  deckCount,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-sky-500 to-emerald-500 flex items-center justify-center text-slate-950 font-bold shadow-sm shadow-sky-500/20">
            <Terminal className="w-5 h-5 stroke-[2.5]" />
          </div>
          <button
            onClick={() => setActiveView('dashboard')}
            className="text-left group cursor-pointer"
          >
            <span className="text-xl font-bold tracking-tight text-white group-hover:text-sky-400 transition-colors">
              PyRecall
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-mono text-slate-400">
              Python 3.12+
            </span>
          </button>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <button
            onClick={() => setActiveView('dashboard')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeView === 'dashboard'
                ? 'text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Study Decks ({deckCount})</span>
          </button>
          <button
            onClick={() => setActiveView('syllabus')}
            className={`whitespace-nowrap transition-colors flex items-center gap-2 cursor-pointer ${
              activeView === 'syllabus'
                ? 'text-sky-400 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Core Syllabus Guide</span>
          </button>
        </nav>

        {/* Zone 3: Primary Action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2 text-sm font-medium text-slate-950 bg-gradient-to-r from-sky-400 to-emerald-400 hover:from-sky-300 hover:to-emerald-300 rounded-lg shadow-sm shadow-sky-500/10 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="whitespace-nowrap">New Study Deck</span>
          </button>
        </div>
      </div>
    </header>
  );
};
