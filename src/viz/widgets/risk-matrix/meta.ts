import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'risk-matrix',
  title: 'Risk matrix: likelihood × impact → test priority → hours',
  blurb: 'Drop six release changes onto a 5×5 risk matrix, score and rank them, then split a time budget: smoke first, depth for high risk, a quick tour for low. Change the budget or feed in news that moves a likelihood.',
  placements: [
    { topic: 'mt-exploratory-risk', heading: 'Risk-based testing' },
    { topic: 'mt-exploratory-risk', heading: 'Prioritising under time pressure' },
  ],
};
