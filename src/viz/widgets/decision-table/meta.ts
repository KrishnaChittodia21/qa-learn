import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'decision-table',
  title: 'Decision table: full 2ⁿ table → minimised rules',
  blurb: 'Build a login or discount decision table row by row, fill in the actions per rule, then delete infeasible rules and merge "don\'t care" columns into the minimum set of test cases.',
  placements: [{ topic: 'mt-test-design', heading: 'Decision table testing' }],
};
