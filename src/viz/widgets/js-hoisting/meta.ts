import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'js-hoisting',
  title: 'Hoisting in two phases: creation, then execution',
  blurb: 'Phase 1 registers every declaration (var → undefined, let/const → TDZ, function → the whole function); phase 2 runs the lines. Watch the memory table fill up and see exactly which read throws a ReferenceError.',
  placements: [
    { topic: 'js-output-puzzles', heading: 'var, let, const: hoisting and the Temporal Dead Zone' },
    { topic: 'js-output-puzzles', heading: 'Function declarations vs function expressions' },
  ],
};
