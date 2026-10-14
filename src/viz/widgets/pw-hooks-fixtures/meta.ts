import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-hooks-fixtures',
  title: 'Hooks and fixtures: the exact run order',
  blurb: 'Three tests, two workers, worker- and test-scoped fixtures. Step through the log Playwright would print, then make test 2 fail or switch to parallel/serial mode and watch workers get replaced and beforeAll re-run.',
  placements: [
    { topic: 'pw-hooks-fixtures', heading: 'Hook order' },
    { topic: 'pw-hooks-fixtures', heading: 'Custom fixtures' },
  ],
};
