import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface SyllabusGuideProps {
  onSelectTopicToGenerate: (topicName: string) => void;
}

const SYLLABUS_SECTIONS = [
  {
    title: '1. Fundamentals & Data Structures',
    items: [
      {
        topic: 'Python Slicing & Sequence Operations',
        desc: '[start:stop:step], negative stride reversals, shallow copying with [:]',
      },
      {
        topic: 'Dictionary Comprehensions & Merging',
        desc: 'Dict unpacking with **, .setdefault(), safe lookups with .get(key, default)',
      },
      {
        topic: 'Sets & Set Algebra',
        desc: 'Unions (|), intersections (&), differences (-), and frozen sets',
      },
      {
        topic: 'Tuple Unpacking & Extended Slicing',
        desc: 'a, *b, c = seq, swap idioms (x, y = y, x)',
      },
    ],
  },
  {
    title: '2. Functional Patterns & Iterators',
    items: [
      {
        topic: 'Generators & Yield Mechanics',
        desc: 'Stateful lazy evaluation, memory footprints, yield vs yield from',
      },
      {
        topic: 'Itertools Essentials',
        desc: 'chain(), combinations(), groupby(), cycle(), islice()',
      },
      {
        topic: 'Decorators & Closures',
        desc: 'Function wrappers, functools.wraps, parameterized decorators',
      },
      {
        topic: 'Lambda & Higher-Order Functions',
        desc: 'map(), filter(), sorted(key=lambda x: ...), operator module',
      },
    ],
  },
  {
    title: '3. Object-Oriented & Magic Methods',
    items: [
      {
        topic: 'Object-Oriented Dunder Methods',
        desc: '__init__, __repr__, __str__, __len__, __getitem__, __eq__',
      },
      {
        topic: 'Properties & Managed Attributes',
        desc: '@property, @x.setter, @x.deleter, data encapsulation',
      },
      {
        topic: 'Cooperative Inheritance & MRO',
        desc: 'super().__init__(), Method Resolution Order (C3 Linearization)',
      },
      {
        topic: 'Context Managers & Resource Cleanup',
        desc: 'with statement protocol, __enter__, __exit__, contextlib.contextmanager',
      },
    ],
  },
  {
    title: '4. Modern Python & Performance',
    items: [
      {
        topic: 'Asyncio & Concurrency',
        desc: 'async def, await, asyncio.gather, task cancellation',
      },
      {
        topic: 'Type Hints & Structural Subtyping',
        desc: 'typing.Optional, Union, Protocol, TypedDict, Generic[T]',
      },
      {
        topic: 'Pattern Matching (Match-Case)',
        desc: 'Structural pattern matching introduced in Python 3.10',
      },
      {
        topic: 'Walrus Operator & Assignment Expressions',
        desc: 'if (n := len(a)) > 10 expression scoping',
      },
    ],
  },
];

export const SyllabusGuide: React.FC<SyllabusGuideProps> = ({
  onSelectTopicToGenerate,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-300">
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">
            Python Mastery Curriculum
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
          Explore the core curriculum roadmap for Python developers. Click on any topic to
          immediately generate a dedicated active-recall quiz deck using Gemini AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SYLLABUS_SECTIONS.map((section) => (
          <div
            key={section.title}
            className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-sky-400 font-mono tracking-tight border-b border-slate-800/80 pb-2">
              {section.title}
            </h3>

            <div className="space-y-2.5">
              {section.items.map((item) => (
                <div
                  key={item.topic}
                  className="p-3 bg-slate-950/70 border border-slate-800/80 hover:border-sky-500/40 rounded-lg group transition-all flex items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {item.topic}
                    </div>
                    <div className="text-[11px] text-slate-400 leading-tight">
                      {item.desc}
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTopicToGenerate(item.topic)}
                    className="shrink-0 p-2 text-slate-400 hover:text-sky-400 hover:bg-slate-800 rounded-md transition-all cursor-pointer flex items-center gap-1 text-[11px] font-medium"
                    title={`Create deck for ${item.topic}`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span className="hidden sm:inline">Build Deck</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
