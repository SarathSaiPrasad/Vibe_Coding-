import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAnswer, calculateMastery, splitCodeSnippet } from './quiz-evaluator.js';

test('evaluateAnswer strictly checks exact code string with trimmed whitespace', () => {
  // Exact match
  const res1 = evaluateAnswer('yield', 'yield');
  assert.equal(res1.isCorrect, true);

  // Exact match with extra outer spaces
  const res2 = evaluateAnswer('  yield  ', 'yield');
  assert.equal(res2.isCorrect, true);

  // Wrong case
  const res3 = evaluateAnswer('Yield', 'yield');
  assert.equal(res3.isCorrect, false);
  assert.match(res3.feedbackNote ?? '', /Case sensitivity/);

  // Different code
  const res4 = evaluateAnswer('return x', 'yield x');
  assert.equal(res4.isCorrect, false);
});

test('calculateMastery calculates correct percentage and bounds', () => {
  assert.equal(calculateMastery(10, 0), 100);
  assert.equal(calculateMastery(10, 3), 70);
  assert.equal(calculateMastery(10, 10), 0);
  assert.equal(calculateMastery(0, 0), 0);
});

test('splitCodeSnippet splits placeholder cleanly', () => {
  const snippet = 'def gen():\n    ___BLANK___ 42';
  const res = splitCodeSnippet(snippet, '___BLANK___');
  assert.equal(res.hasBlank, true);
  assert.equal(res.prefix, 'def gen():\n    ');
  assert.equal(res.suffix, ' 42');
});
