import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'sql-joins',
  title: 'SQL joins and logical execution order',
  blurb: 'Pair customers with orders under INNER, LEFT, RIGHT, FULL OUTER and NOT EXISTS, row by row, with NULL-filled results. Then run a query clause by clause and watch a WHERE turn a LEFT JOIN into an inner join.',
  placements: [
    { topic: 'sql-joins-validation', heading: 'Joins by example' },
    { topic: 'sql-joins-validation', heading: 'NULL in joins and the LEFT JOIN + WHERE trap' },
    { topic: 'sql-querying', heading: 'Logical query processing order' },
    { topic: 'qa-interview-bank', heading: 'SQL refresher' },
  ],
};
