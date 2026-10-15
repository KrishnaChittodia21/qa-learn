import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'rtm-coverage',
  title: 'RTM: forward and backward traceability',
  blurb: 'Fill a coupon-feature RTM as tests are written and run. Forward trace finds the untested requirement, backward trace finds the orphan test, and a change request ripples to exactly the impacted tests.',
  placements: [{ topic: 'mt-test-artifacts', heading: 'Requirements Traceability Matrix' }, { topic: 'qa-manual-bank', heading: 'Cluster 2: Test artifacts' }],
};
