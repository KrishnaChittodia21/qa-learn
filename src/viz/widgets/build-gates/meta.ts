import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'build-gates',
  title: 'Build gates: smoke → sanity → regression → release',
  blurb: 'Send a feature, bug-fix or hotfix build through the test gates. Fail the smoke test to see the build rejected, and compare full vs risk-based regression in test count and time.',
  placements: [
    { topic: 'mt-test-levels-types', heading: 'Smoke vs sanity' },
    { topic: 'mt-test-levels-types', heading: 'Regression testing' },
    { topic: 'qa-manual-bank', heading: 'Cluster 3: Levels and types' },
  ],
};
