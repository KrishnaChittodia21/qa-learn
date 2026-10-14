import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'array-methods',
  title: 'Array methods, one callback at a time',
  blurb: 'Watch items flow through map, filter, reduce, find, some, every and sort. See each callback call, where it short-circuits, and why default sort puts 10 before 9.',
  placements: [
    { topic: 'js-arrays', heading: 'map, filter and reduce' },
    { topic: 'js-arrays', heading: 'Sorting' },
  ],
};
