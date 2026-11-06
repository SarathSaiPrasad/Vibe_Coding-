import { QuizCard } from '../types/quiz.js';

export interface EvaluationResult {
  isCorrect: boolean;
  userAnswerTrimmed: string;
  expectedTrimmed: string;
  feedbackNote?: string;
}

/**
 * Evaluates a user's answer against the expected Python code target.
 * Applies strict exact-match checking while trimming outer whitespace.
 */
export function evaluateAnswer(userAnswer: string, target: string): EvaluationResult {
  const userClean = (userAnswer ?? '').trim();
  const targetClean = (target ?? '').trim();

  const isCorrect = userClean === targetClean;

  let feedbackNote: string | undefined;

  if (!isCorrect) {
    if (userClean.toLowerCase() === targetClean.toLowerCase()) {
      feedbackNote = 'Case sensitivity mismatch: Python keywords and identifiers require exact casing.';
    } else if (userClean.replace(/['"]/g, "'") === targetClean.replace(/['"]/g, "'")) {
      feedbackNote = 'Quote style variance: Verify whether single or double quotes were expected.';
    } else if (userClean.endsWith(';')) {
      feedbackNote = 'Unnecessary semicolon: Python statements do not require trailing semicolons.';
    }
  }

  return {
    isCorrect,
    userAnswerTrimmed: userClean,
    expectedTrimmed: targetClean,
    feedbackNote,
  };
}

/**
 * Calculates mastery score percentage based on total cards and missed cards.
 */
export function calculateMastery(totalCards: number, missedCount: number): number {
  if (totalCards <= 0) return 0;
  const correct = Math.max(0, totalCards - missedCount);
  return Math.round((correct / totalCards) * 100);
}

export interface SplitCodeResult {
  prefix: string;
  suffix: string;
  hasBlank: boolean;
}

/**
 * Splits a code snippet at the blank placeholder for inline input rendering.
 */
export function splitCodeSnippet(snippet: string, placeholder = '___BLANK___'): SplitCodeResult {
  if (!snippet.includes(placeholder)) {
    return {
      prefix: snippet,
      suffix: '',
      hasBlank: false,
    };
  }

  const [prefix, suffix] = snippet.split(placeholder);
  return {
    prefix,
    suffix: suffix ?? '',
    hasBlank: true,
  };
}

/**
 * Heuristically parses raw text or markdown notes into structured QuizCards.
 * Serves as immediate client-side parser or offline fallback.
 */
export function parseNotesIntoQuizCards(rawText: string, topicName = 'Python Notes'): QuizCard[] {
  const cards: QuizCard[] = [];
  const lines = rawText.split('\n');
  
  // Try to find code blocks marked with ```python ... ``` or bullet points
  const codeBlockRegex = /```(?:python)?\s*([\s\S]*?)```/g;
  let match: RegExpExecArray | null;

  while ((match = codeBlockRegex.exec(rawText)) !== null) {
    const rawCode = match[1].trim();
    if (rawCode.length > 5) {
      // Find a suitable Python keyword or token to blank out
      const keywords = ['yield', 'return', 'def', 'class', 'import', 'lambda', 'super()', 'isinstance', 'enumerate', 'zip', 'range'];
      let targetKeyword = '';
      let snippetWithBlank = rawCode;

      for (const kw of keywords) {
        const regex = new RegExp(`\\b${kw}\\b`);
        if (regex.test(rawCode)) {
          targetKeyword = kw;
          snippetWithBlank = rawCode.replace(regex, '___BLANK___');
          break;
        }
      }

      if (targetKeyword) {
        cards.push({
          id: `card_${Date.now()}_${cards.length}`,
          topic: topicName,
          conceptTitle: `Python Syntax: ${targetKeyword}`,
          explanation: `Complete the Python code using the appropriate language construct.`,
          codeSnippet: snippetWithBlank,
          blankTarget: targetKeyword,
          hint: `Look for standard Python control flow or built-in function starting with '${targetKeyword[0]}'`,
          stepByStepSolution: [
            `Identify the required statement in the code structure.`,
            `The keyword '${targetKeyword}' performs the expected Python operation in this context.`,
          ],
          commonMistakes: `Mixing up syntax with other languages or misspelling keywords.`,
          difficulty: 'intermediate',
        });
      }
    }
  }

  // If no code blocks matched or too few, parse structured question/definition lines
  if (cards.length === 0) {
    let currentTitle = '';
    let currentCode: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('#') || (trimmed.endsWith(':') && trimmed.length < 50)) {
        if (currentTitle && currentCode.length > 0) {
          const code = currentCode.join('\n');
          cards.push({
            id: `card_${Date.now()}_${cards.length}`,
            topic: topicName,
            conceptTitle: currentTitle.replace(/^#+\s*/, ''),
            explanation: `Recall the missing Python element for ${currentTitle}.`,
            codeSnippet: code.includes('___BLANK___') ? code : `${code}\n___BLANK___`,
            blankTarget: 'pass',
            hint: 'A standard placeholder or statement.',
            stepByStepSolution: ['Complete the block as instructed.'],
            commonMistakes: 'Syntax indentation errors.',
            difficulty: 'beginner',
          });
        }
        currentTitle = trimmed;
        currentCode = [];
      } else if (trimmed.length > 0) {
        currentCode.push(line);
      }
    }
  }

  return cards;
}
