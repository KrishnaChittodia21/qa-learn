import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'js-scope-closure',
  title: 'Scope chain and closures: the backpack',
  blurb: 'Watch stack frames push and pop while environments stay alive in a function\'s backpack. Compare one counter, two independent counters, var vs let in a loop, and a unique-id generator for test data.',
  placements: [
    { topic: 'js-functions', heading: 'Closures: functions that remember' },
    { topic: 'js-functions', heading: 'Scope: global, function and block' },
  ],
};
