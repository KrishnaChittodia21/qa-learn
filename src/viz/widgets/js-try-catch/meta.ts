import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'js-try-catch',
  title: 'try, catch and finally: what really gets returned',
  blurb: 'Follow a token through try, catch and finally for five cases (no error, thrown, return in try, rethrow, return in finally) and see which value or error the function finally produces.',
  placements: [{ topic: 'js-loops-modules-errors', heading: 'try, catch and finally' }],
};
