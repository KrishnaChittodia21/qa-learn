import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-parallel-retries',
  title: 'Workers, shards and retries on a timeline',
  blurb: 'Twelve tests in four files, one flaky and one broken. Schedule them onto workers and shards, toggle fullyParallel, add retries, and watch the wall time and the passed / flaky / failed report change.',
  placements: [
    { topic: 'pw-git-ci', heading: 'Parallelism, workers and sharding' },
    { topic: 'pw-debug-flaky', heading: 'Retries and flaky tests' },
  ],
};
