import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'reference-vs-copy',
  title: 'Reference vs value: who points at what',
  blurb: 'Variables on the left, heap objects on the right. See why a mutation shows up through every reference, what spread really copies, and how shared test data leaks between tests.',
  placements: [{ topic: 'js-objects-strings', heading: 'Reference vs value' }],
};
