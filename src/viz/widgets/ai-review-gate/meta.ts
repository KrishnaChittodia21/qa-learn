import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'ai-review-gate',
  title: 'The review gate: checking AI-drafted tests before you trust them',
  blurb: 'An AI drafts 8 test cases for a checkout story, or a Playwright script. Run the tester checklist item by item and watch lines get flagged and fixed, or accept the draft without review and see what escapes.',
  placements: [
    { topic: 'ai-daily-qa', heading: 'Reviewing AI output' },
    { topic: 'ai-daily-qa', heading: 'AI-generated Playwright scripts' },
  ],
};
