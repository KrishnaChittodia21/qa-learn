import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'js-event-loop',
  title: 'The event loop: stack, microtasks, tasks',
  blurb: 'Step through classic snippets line by line and watch callbacks move between the call stack, Web APIs and the two queues. Predict each console line before it prints.',
  placements: [{ topic: 'js-async', heading: 'The event loop' }, { topic: 'qa-interview-bank', heading: 'JavaScript refresher' }],
};
