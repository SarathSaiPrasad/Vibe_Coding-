import React, { useState } from 'react';
import { Deck, QuizCard, DifficultyLevel } from '../types/quiz.js';
import { Sparkles, FileText, Upload, X, Loader2, Check } from 'lucide-react';

interface DeckCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeckCreated: (deck: Deck) => void;
}

const TOPIC_SUGGESTIONS = [
  'Decorators & Closures',
  'Asyncio Coroutines & Tasks',
  'FastAPI Dependency Injection',
  'Collections: Counter & defaultdict',
  'Itertools & Infinite Generators',
  'Python Type Hints & Pydantic',
];

const SAMPLE_OOP_NOTES = `# Python OOP Lecture Notes
class BankAccount:
    """Demonstrates encapsulation and class initialization."""
    def __init__(self, owner, balance=0):
        self.owner = owner
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    def deposit(self, amount):
        if amount <= 0:
            raise ValueError("Must deposit positive amount")
        self._balance += amount

    def __repr__(self):
        return f"BankAccount(owner={self.owner!r}, balance={self._balance})"
`;

export const DeckCreatorModal: React.FC<DeckCreatorModalProps> = ({
  isOpen,
  onClose,
  onDeckCreated,
}) => {
  const [activeTab, setActiveTab] = useState<'topic' | 'notes'>('topic');

  // Topic Tab state
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('intermediate');
  const [cardCount, setCardCount] = useState(5);

  // Notes Tab state
  const [notesContent, setNotesContent] = useState('');
  const [deckName, setDeckName] = useState('');
  const [fileName, setFileName] = useState('');

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleGenerateFromTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      setErrorMessage('Please enter a Python topic or syllabus concept.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/generate-deck', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty, cardCount }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate study deck from topic.');
      }

      const data = await response.json();
      if (!data.cards || !Array.isArray(data.cards)) {
        throw new Error('Invalid response structure returned.');
      }

      const newDeck: Deck = {
        id: `deck-ai-${Date.now()}`,
        title: data.deckTitle || `Python: ${topic}`,
        description: data.deckDescription || `AI-generated active-recall deck for ${topic}.`,
        category: 'custom',
        tags: data.tags || [topic, difficulty],
        cards: data.cards.map((c: any, idx: number) => ({
          id: `card-ai-${Date.now()}-${idx}`,
          topic: c.topic || topic,
          conceptTitle: c.conceptTitle || `Python Concept ${idx + 1}`,
          explanation: c.explanation || '',
          codeSnippet: c.codeSnippet || '# Code snippet\n___BLANK___',
          blankTarget: c.blankTarget || 'pass',
          hint: c.hint || 'Carefully inspect syntax.',
          stepByStepSolution: c.stepByStepSolution || ['Check the language rule.'],
          commonMistakes: c.commonMistakes || 'Syntax confusion.',
          difficulty: c.difficulty || difficulty,
        })),
        createdAt: Date.now(),
        masteryPercentage: 0,
        missedCardIds: [],
        totalAttempts: 0,
        firstTryCorrectCount: 0,
      };

      onDeckCreated(newDeck);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Something went wrong while generating the deck.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleParseNotes = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notesContent.trim()) {
      setErrorMessage('Please paste your lecture notes or upload a Python file.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/parse-notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: notesContent,
          fileName: deckName.trim() || fileName || 'Custom Python Notes',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to parse notes into quiz cards.');
      }

      const data = await response.json();
      const newDeck: Deck = {
        id: `deck-notes-${Date.now()}`,
        title: data.deckTitle || deckName.trim() || fileName || 'Parsed Python Deck',
        description: data.deckDescription || 'Extracted from uploaded notes and code snippets.',
        category: 'custom',
        tags: data.tags || ['Custom Notes', 'Extracted'],
        cards: (data.cards || []).map((c: any, idx: number) => ({
          id: `card-note-${Date.now()}-${idx}`,
          topic: c.topic || 'Notes Review',
          conceptTitle: c.conceptTitle || `Key Concept ${idx + 1}`,
          explanation: c.explanation || '',
          codeSnippet: c.codeSnippet || '# Code snippet\n___BLANK___',
          blankTarget: c.blankTarget || 'pass',
          hint: c.hint || 'Review the notes context.',
          stepByStepSolution: c.stepByStepSolution || ['Verify the expected construct.'],
          commonMistakes: c.commonMistakes || 'Syntax error.',
          difficulty: 'intermediate',
        })),
        createdAt: Date.now(),
        masteryPercentage: 0,
        missedCardIds: [],
        totalAttempts: 0,
        firstTryCorrectCount: 0,
      };

      onDeckCreated(newDeck);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not parse notes.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    if (!deckName) {
      setDeckName(file.name.replace(/\.[^/.]+$/, ''));
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setNotesContent(content);
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Create Python Study Deck</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Generate fill-in-the-blank code quizzes from a topic or from your notes
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 px-6 pt-2">
          <button
            onClick={() => {
              setActiveTab('topic');
              setErrorMessage('');
            }}
            className={`pb-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'topic'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Topic & Syllabus Generator</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('notes');
              setErrorMessage('');
            }}
            className={`pb-3 px-4 text-xs font-medium border-b-2 transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'notes'
                ? 'border-sky-500 text-sky-400 font-semibold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Paste Notes & Upload Code</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {errorMessage && (
            <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-xs text-rose-300">
              {errorMessage}
            </div>
          )}

          {activeTab === 'topic' ? (
            <form onSubmit={handleGenerateFromTopic} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Python Topic or Concept Name
                </label>
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g. Generators & Iterators, Decorators, FastAPI Pydantic..."
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  disabled={isLoading}
                />
              </div>

              {/* Suggestions */}
              <div>
                <div className="text-[11px] text-slate-400 mb-1.5">Quick Inspiration:</div>
                <div className="flex flex-wrap gap-1.5">
                  {TOPIC_SUGGESTIONS.map((item) => (
                    <button
                      type="button"
                      key={item}
                      onClick={() => setTopic(item)}
                      className="px-2.5 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded text-xs transition-colors cursor-pointer"
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              {/* Difficulty and Count */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Difficulty Tier
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    disabled={isLoading}
                  >
                    <option value="beginner">Beginner (Foundations & Syntax)</option>
                    <option value="intermediate">Intermediate (Standard Idioms)</option>
                    <option value="advanced">Advanced (Metaprogramming & Internals)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Number of Cards
                  </label>
                  <select
                    value={cardCount}
                    onChange={(e) => setCardCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                    disabled={isLoading}
                  >
                    <option value={4}>4 Targeted Questions (Fast Drill)</option>
                    <option value={6}>6 Questions (Recommended)</option>
                    <option value={8}>8 Comprehensive Questions</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Python Deck...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>Generate Deck</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleParseNotes} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Deck Title (Optional)
                </label>
                <input
                  type="text"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                  placeholder="e.g. Chapter 4: Python Dunder Methods"
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  disabled={isLoading}
                />
              </div>

              {/* File upload row */}
              <div className="flex items-center justify-between gap-3 p-3 bg-slate-950/80 border border-dashed border-slate-800 rounded-lg">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Upload className="w-4 h-4 text-sky-400" />
                  <span>{fileName ? `Loaded: ${fileName}` : 'Upload .py, .md, .txt, or .ipynb'}</span>
                </div>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 rounded cursor-pointer transition-colors">
                  Choose File
                  <input
                    type="file"
                    accept=".py,.md,.txt,.ipynb"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </label>
              </div>

              {/* Multi-line notes textarea */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Paste Lecture Notes, Markdown, or Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNotesContent(SAMPLE_OOP_NOTES);
                      setDeckName('Object-Oriented Python Practice');
                    }}
                    className="text-[11px] text-sky-400 hover:underline cursor-pointer"
                  >
                    Load Sample OOP Notes
                  </button>
                </div>
                <textarea
                  rows={6}
                  value={notesContent}
                  onChange={(e) => setNotesContent(e.target.value)}
                  placeholder="Paste class notes, code snippets, or definitions here..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  disabled={isLoading}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Parsing & Extracting Cards...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Extract Quiz Cards</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
