// Weak areas (src/lib/weak.ts) and "Your next step" (src/lib/nextStep.ts): both are pure functions of progress and
// content, and drive Home, Weak areas and Practice. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load, freshProgress } from './helpers.ts';
import type { Progress } from '../src/lib/progress';

const C = await load<typeof import('../src/content')>('/src/content/index.ts');
const W = await load<typeof import('../src/lib/weak')>('/src/lib/weak.ts');
const N = await load<typeof import('../src/lib/nextStep')>('/src/lib/nextStep.ts');
const { p: empty } = await freshProgress();
const fresh = (): Progress => structuredClone(empty);
const pass = (p: Progress, id: string, score = 90) => (p.tests[id] = { best: score, last: score, attempts: 1, passedAt: '2026-02-01' });
const fail = (p: Progress, id: string, score = 40) => (p.tests[id] = { best: score, last: score, attempts: 1 });
const answer = (p: Progress, id: string, correct: boolean) => (p.mcq[id] = { seen: 1, wrong: correct ? 0 : 1, lastCorrect: correct, lastAt: '2026-02-01T12:00:00Z' });
const [first, second] = C.TOPICS;

test('every exam question maps to a real section of its own topic', () => {
  for (const t of C.TOPICS) for (const q of t.test) {
    const i = W.sectionForQuestion(t, q);
    assert.ok(i >= 0 && i < t.sections.length, `${q.id} → section ${i}`);
  }
});

test('only the latest answer counts as wrong', () => {
  const p = fresh();
  const [q1, q2] = first.test;
  answer(p, q1.id, false);
  answer(p, q2.id, true);
  assert.deepEqual(W.currentlyWrong(p, first).map((q) => q.id), [q1.id]);
  answer(p, q1.id, true);
  assert.deepEqual(W.currentlyWrong(p, first), []);
});

test('weak topics: untouched topics are not weak; failed exams come before passed ones, lowest score first', () => {
  const p = fresh();
  assert.deepEqual(W.weakTopics(p, C.TOPICS), []);
  pass(p, first.id);
  answer(p, first.test[0].id, false); // passed but with a wrong answer → still weak, after the fails
  fail(p, second.id, 60);
  fail(p, C.TOPICS[2].id, 30);
  assert.deepEqual(W.weakTopics(p, C.TOPICS).map((w) => w.topic.id), [C.TOPICS[2].id, second.id, first.id]);
});

test('weak sections group missed questions by section, most missed first', () => {
  const missed = first.test.slice(0, 6);
  const groups = W.weakSections(first, missed);
  assert.equal(groups.reduce((n, g) => n + g.missed.length, 0), missed.length);
  groups.forEach((g, i) => i && assert.ok(g.missed.length <= groups[i - 1].missed.length));
});

test('accuracy by difficulty and format uses each question once, by its latest answer', () => {
  const p = fresh();
  const qs = first.test.slice(0, 4);
  qs.forEach((q, i) => answer(p, q.id, i % 2 === 0));
  const { byDifficulty, byFormat } = W.accuracyBreakdown(p, C.TOPICS);
  const seen = Object.values(byDifficulty).reduce((n, a) => n + a.seen, 0);
  assert.equal(seen, 4);
  assert.equal(byFormat.single.seen + byFormat.multi.seen, 4);
  assert.equal(Object.values(byDifficulty).reduce((n, a) => n + a.correct, 0), 2);
  assert.equal(W.pct({ seen: 0, correct: 0 }), null);
  assert.equal(W.pct({ seen: 3, correct: 2 }), 67);
});

test('a new learner is sent to the first lesson', () => {
  const step = N.nextStep(fresh(), C.TOPICS);
  assert.equal(step.kind, 'start');
  assert.equal(step.href, `/topic/${first.id}?tab=learn&s=0`);
  assert.equal(step.secondary, undefined);
});

test('inside a topic the loop is read → labs → interview → drills → exam', () => {
  const p = fresh();
  p.sections[first.id] = [0];
  const kinds: string[] = [];
  for (let guard = 0; guard < 500; guard++) {
    const s = N.topicNextStep(p, first);
    if (kinds.at(-1) !== s.kind) kinds.push(s.kind);
    if (s.kind === 'read') p.sections[first.id] = [...(p.sections[first.id] ?? []), Number(new URL(s.href, 'http://x').searchParams.get('s'))];
    else if (s.kind === 'labs') for (const c of first.codeChallenges) p.cc[c.id] = true;
    else if (s.kind === 'interview') for (const q of first.interviewQuestions) p.iq[q.id] = 'nailed';
    else if (s.kind === 'drills') for (const q of first.envelopeQuestions) p.boe[q.id] = true;
    else break;
  }
  const order = ['read', 'labs', 'interview', 'drills', 'exam'];
  assert.deepEqual(kinds, order.filter((k) => kinds.includes(k)), `went ${kinds.join(' → ')}`);
  assert.equal(kinds.at(-1), 'exam');
});

test('the next unread section is the first one not ticked', () => {
  const p = fresh();
  p.sections[first.id] = [0, 2];
  const step = N.topicNextStep(p, first);
  assert.equal(step.kind, 'read');
  assert.ok(step.href.endsWith('&s=1'));
});

test('passing a topic moves on to the next one, with a weak area as the secondary step', () => {
  const p = fresh();
  pass(p, first.id);
  answer(p, first.test[0].id, false);
  const step = N.nextStep(p, C.TOPICS);
  assert.equal(step.topic?.id, second.id);
  assert.equal(step.secondary?.kind, 'revise');
  assert.equal(step.secondary?.topic?.id, first.id);
});

test('with every exam passed, practice points to companies, then coding, then the Playwright Lab', () => {
  const p = fresh();
  for (const t of C.TOPICS) pass(p, t.id);
  const extras = { companyTotal: C.COMPANY_QUESTIONS.length, codingTotal: C.CODING_PROBLEMS.length };
  assert.equal(N.nextStep(p, C.TOPICS, extras).href, '/companies');
  for (const q of C.COMPANY_QUESTIONS) p.company[q.id] = true;
  assert.equal(N.nextStep(p, C.TOPICS, extras).href, '/coding');
  for (const q of C.CODING_PROBLEMS) p.code[q.id] = true;
  const done = N.nextStep(p, C.TOPICS, extras);
  assert.equal(done.href, '/pw-lab');
  assert.equal(done.secondary?.kind, 'practice');
});
