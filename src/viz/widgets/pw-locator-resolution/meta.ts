import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pw-locator-resolution',
  title: 'How a locator resolves: strictness and laziness',
  blurb: 'Six "Add to cart" buttons on a SauceDemo-style list. Watch each locator scan the DOM at click time, hit (or dodge) a strict-mode violation, and survive a re-render that leaves an ElementHandle stale.',
  placements: [
    { topic: 'pw-locators', heading: 'How a locator resolves' },
    { topic: 'pw-locators', heading: 'Strictness' },
  ],
};
