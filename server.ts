import 'dotenv/config';
import express, { Request, Response } from 'express';
import { GoogleGenAI, Type } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY;
const ai = apiKey
  ? new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

// JSON schema for generating structured quiz cards
const quizCardSchema = {
  type: Type.OBJECT,
  properties: {
    deckTitle: { type: Type.STRING },
    deckDescription: { type: Type.STRING },
    tags: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
    cards: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          topic: { type: Type.STRING },
          conceptTitle: { type: Type.STRING },
          explanation: { type: Type.STRING },
          codeSnippet: {
            type: Type.STRING,
            description: 'A realistic Python snippet where exactly one critical token/keyword is replaced with ___BLANK___. Do not leave multiple blanks.',
          },
          blankTarget: {
            type: Type.STRING,
            description: 'The exact Python code token or keyword that fills the ___BLANK___ perfectly.',
          },
          hint: { type: Type.STRING },
          stepByStepSolution: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: '2 to 3 concise steps explaining how Python executes this and why the blank answer is mechanically required.',
          },
          commonMistakes: { type: Type.STRING },
          difficulty: {
            type: Type.STRING,
            description: 'beginner, intermediate, or advanced',
          },
        },
        required: [
          'topic',
          'conceptTitle',
          'explanation',
          'codeSnippet',
          'blankTarget',
          'hint',
          'stepByStepSolution',
          'commonMistakes',
          'difficulty',
        ],
      },
    },
  },
  required: ['deckTitle', 'deckDescription', 'tags', 'cards'],
};

// API: Generate Deck from Topic & Syllabus
app.post('/api/generate-deck', async (req: Request, res: Response) => {
  const { topic, difficulty = 'intermediate', cardCount = 5 } = req.body;

  if (!topic || typeof topic !== 'string') {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  // If Gemini client is available, generate via gemini-3.8-flash
  if (ai) {
    try {
      const prompt = `Create an active-recall Python study deck for the topic: "${topic}".
Difficulty: ${difficulty}.
Card count: ${Math.min(10, Math.max(3, Number(cardCount)))}.

RULES:
1. Each card MUST test a practical Python concept through an interactive fill-in-the-blank code snippet.
2. In each card's codeSnippet, place exactly ONE marker: "___BLANK___" where the learner must type code.
3. The "blankTarget" MUST be the exact, concise Python keyword, method name, expression, or operator that fits into ___BLANK___.
4. Provide step-by-step solutions that explain the underlying Python execution mechanics.
5. Provide a common beginner pitfall or mistake.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are an expert Python instructor specializing in active recall and code comprehension quizzes.',
          responseMimeType: 'application/json',
          responseSchema: quizCardSchema,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini deck generation API error, falling back to heuristic builder:', err?.message);
    }
  }

  // Graceful fallback for offline / missing key environments
  return res.json(generateFallbackDeck(topic, difficulty, Number(cardCount) || 5));
});

// API: Parse raw notes or uploaded code files into QuizCards
app.post('/api/parse-notes', async (req: Request, res: Response) => {
  const { content, fileName = 'Class Notes' } = req.body;

  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Content is required.' });
  }

  if (ai) {
    try {
      const prompt = `Convert the following Python class notes or code file into an active-recall study deck.
Source file/title: "${fileName}".
Raw content:
"""
${content.slice(0, 8000)}
"""

Extract the key Python terms, mechanics, and syntax patterns. Convert them into 4 to 8 high-yield fill-in-the-blank code quiz cards.
Each card MUST have codeSnippet with exactly one "___BLANK___" marker and the exact "blankTarget".`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction: 'You are a Python curriculum specialist converting raw notes into rigorous active-recall fill-in-the-blank questions.',
          responseMimeType: 'application/json',
          responseSchema: quizCardSchema,
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      return res.json(parsed);
    } catch (err: any) {
      console.warn('Gemini parse notes failed, using heuristic fallback:', err?.message);
    }
  }

  // Fallback heuristic conversion
  return res.json(generateFallbackDeck(fileName, 'intermediate', 4, content));
});

function generateFallbackDeck(topic: string, difficulty: string, count: number, _content?: string) {
  const cleanTitle = topic.replace(/\.[^/.]+$/, '');
  return {
    deckTitle: `Python: ${cleanTitle}`,
    deckDescription: `Active recall study deck on ${cleanTitle} with practical syntax and mechanics challenges.`,
    tags: [cleanTitle, 'Python', difficulty],
    cards: [
      {
        topic: cleanTitle,
        conceptTitle: `${cleanTitle} Execution Pattern`,
        explanation: `Demonstrates key control flow and syntax for ${cleanTitle}.`,
        codeSnippet: `# Python ${cleanTitle} demonstration\ndef process_data(items):\n    result = []\n    for item in items:\n        if item is not None:\n            result.___BLANK___(item)\n    return result`,
        blankTarget: 'append',
        hint: 'Standard list method used to insert an element at the end in-place.',
        stepByStepSolution: [
          'Lists in Python are dynamic mutable arrays.',
          'The .append() method modifies the list in-place in amortized O(1) time.',
          'Notice that unlike .extend(), .append() adds the single object as-is.',
        ],
        commonMistakes: 'Trying to assign list[i] directly on an empty list, raising IndexError.',
        difficulty,
      },
      {
        topic: cleanTitle,
        conceptTitle: 'Safe Type Introspection',
        explanation: 'Inspect object types while preserving class inheritance hierarchies.',
        codeSnippet: `value = "PyRecall"\nif ___BLANK___(value, (str, bytes)):\n    print("Text sequence verified")`,
        blankTarget: 'isinstance',
        hint: 'Built-in function that accepts a tuple of allowable classes.',
        stepByStepSolution: [
          'isinstance(val, tuple_of_types) checks if the instance matches any type in the tuple.',
          'This is preferred over type(x) == str because it safely supports subclasses.',
        ],
        commonMistakes: 'Using type(x) in (str, bytes), which is verbose and misses derived classes.',
        difficulty,
      },
      {
        topic: cleanTitle,
        conceptTitle: 'Resource Lifecycle and Cleanup',
        explanation: 'Ensure deterministic file and network handle release.',
        codeSnippet: `___BLANK___ open("config.json", "r") as stream:\n    settings = stream.read()`,
        blankTarget: 'with',
        hint: 'Keyword that establishes a context manager scope.',
        stepByStepSolution: [
          'The with statement binds the target and invokes __enter__.',
          'Upon leaving or if an exception is raised, __exit__ executes automatically to close the file descriptor.',
        ],
        commonMistakes: 'Omitting with and forgetting stream.close() in a finally block.',
        difficulty,
      },
    ],
  };
}

// Dev and Prod setup
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PyRecall server running at http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
