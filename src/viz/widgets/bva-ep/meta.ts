import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'bva-ep',
  title: 'Equivalence partitions and boundary values on a number line',
  blurb: 'Set a valid age range, split the domain into partitions, pick EP representatives, then derive 2-value or 3-value BVA coverage items (ISTQB v4.0) and the final test-value table.',
  placements: [
    { topic: 'mt-test-design', heading: 'Equivalence Partitioning' },
    { topic: 'mt-test-design', heading: 'Boundary Value Analysis' },
  ],
};
