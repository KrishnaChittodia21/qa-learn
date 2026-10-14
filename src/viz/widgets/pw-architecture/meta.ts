import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-architecture',
  title: 'One test run: runner → workers → browser → context → page',
  blurb: 'Follow `npx playwright test` from config to report. Change the worker count, put two users in one test, and switch headed/headless to see what is shared (the browser) and what is not (contexts, cookies).',
  placements: [
    { topic: 'pw-setup', heading: 'Architecture: browser → context → page' },
    { topic: 'pw-setup', heading: 'Running tests from the CLI' },
  ],
};
