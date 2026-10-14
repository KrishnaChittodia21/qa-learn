import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-auto-wait',
  title: 'Auto-waiting vs hard sleeps vs web-first assertions',
  blurb: 'A Submit button appears, animates, hides under a spinner, then enables. Watch click() tick off its actionability checks, a 2 s sleep guess wrong, and toBeVisible() retry. Change how slow the app is.',
  placements: [
    { topic: 'pw-assertions-waiting', heading: 'Auto-waiting and actionability' },
    { topic: 'pw-assertions-waiting', heading: 'Web-first assertions' },
    { topic: 'qa-interview-bank', heading: 'Playwright refresher' },
  ],
};
