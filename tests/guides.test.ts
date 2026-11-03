// "Guide me" (M4): every page the app routes to has a guide, and every walkthrough stop is well-formed. Run: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { load } from './helpers.ts';

const G = await load<typeof import('../src/lib/pageGuides')>('/src/lib/pageGuides.ts');

// one example path per route in src/App.tsx (the sign-in pages open the welcome tour instead)
const PAGES = [
  '/', '/contents', '/topic/mt-fundamentals', '/topic/mt-fundamentals/exam', '/coding', '/coding/sum-array', '/roadmap',
  '/pw-lab', '/pw-lab/step1', '/playground', '/companies', '/weak-areas', '/practice', '/achievements', '/settings',
  '/saved', '/profile', '/shorts', '/short/test-pyramid',
];

test('every page has a guide with a title, an intro and at least one item', () => {
  for (const path of PAGES) {
    const g = G.guideFor(path);
    assert.ok(g, `no guide for ${path}`);
    assert.ok(g.title && g.intro && g.items.length, `incomplete guide for ${path}`);
  }
  assert.equal(G.guideFor('/login'), null, 'sign-in pages fall back to the welcome tour');
});

test('the exam page gets the exam guide, not the topic guide', () => {
  assert.equal(G.guideFor('/topic/mt-fundamentals/exam')!.title, 'Exam');
  assert.equal(G.guideFor('/topic/mt-fundamentals')!.title, 'Topic');
});

test('every walkthrough stop has a target, a title and text', () => {
  const walks = [G.MENU_WALK, ...PAGES.map((p) => G.guideFor(p)!.walk ?? [])];
  for (const step of walks.flat()) {
    assert.ok(step.target && step.title && step.text, JSON.stringify(step));
    assert.doesNotMatch(step.target, /^\s|\s$/, 'no stray spaces in selectors');
  }
});
