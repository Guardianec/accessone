import test from 'node:test';
import assert from 'node:assert/strict';
import {
  advance,
  formatTime,
  freshSession,
  parseSession,
  progress,
} from '../src/state.ts';
import { personalityQuestions, prank, stages } from '../src/config/prank.ts';
test('the experience reaches its finite reveal and records all progress reversals', () => {
  let s = freshSession();
  for (let i = 0; i < stages.length - 1; i++) s = advance(s);
  assert.equal(s.stage, 23);
  assert.equal(s.lies, 4);
  assert.equal(s.completed.length, 23);
  assert.ok(s.achievements.includes('complete'));
  assert.ok(s.endedAt);
  assert.equal(advance(s).stage, 23);
  assert.equal(progress(15), 100);
  assert.equal(progress(16), 93);
});
test('session restores counters, rejects corrupted or out-of-range state', () => {
  const s = advance(freshSession());
  assert.deepEqual(parseSession(JSON.stringify(s)), s);
  for (const raw of [
    '{',
    'null',
    '{}',
    JSON.stringify({ ...s, stage: 999 }),
    JSON.stringify({ ...s, clicks: -2 }),
    JSON.stringify({ ...s, providers: [42] }),
    JSON.stringify({ ...s, personalityIndex: 1000 }),
  ])
    assert.equal(parseSession(raw).stage, 0);
});
test('state contains no questionnaire answers or free-text values', () => {
  const s = freshSession();
  assert.equal('answers' in s, false);
  assert.equal('nickname' in s, false);
  assert.equal(
    'answers' in
      parseSession(
        JSON.stringify({ ...s, answers: { nickname: 'do not retain' } }),
      ),
    false,
  );
  assert.ok(prank.personalityLength >= 30);
  assert.ok(prank.personalityLength <= personalityQuestions.length);
  assert.ok(prank.providers.length >= 15);
  assert.equal(prank.timing.processing, 30000);
});
test('elapsed time formats without a negative clock', () => {
  assert.equal(formatTime(522000), '08:42');
  assert.equal(formatTime(-100), '00:00');
});
