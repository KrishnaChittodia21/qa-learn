import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'js-coercion',
  title: 'The comparison machine: == vs === and coercion',
  blurb: "Feed classic expressions through the spec's rule list and watch each operand get converted (ToNumber, ToString, ToPrimitive) until a verdict drops out. Flip to === to see it stop at the type check.",
  placements: [
    { topic: 'js-basics', heading: '== vs === and type coercion' },
    { topic: 'js-output-puzzles', heading: 'Type coercion' },
  ],
};
