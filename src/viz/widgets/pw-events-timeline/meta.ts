import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-events-timeline',
  title: 'Events vs your code: dialogs, popups and downloads',
  blurb: 'Two timelines, test code and browser. Register the dialog handler before or after the click (or forget to accept), arm waitForEvent before or after the click, and make the app react instantly or 300 ms later to see which orderings only pass by luck.',
  placements: [
    { topic: 'pw-actions', heading: 'JavaScript dialogs' },
    { topic: 'pw-actions', heading: 'New tabs and popups' },
  ],
};
