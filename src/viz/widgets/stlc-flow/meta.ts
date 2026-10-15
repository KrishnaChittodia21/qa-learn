import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'stlc-flow',
  title: 'STLC: entry criteria → activities → exit criteria',
  blurb: 'Walk a release through the six STLC phases. Break the environment or inject a defect and watch execution block or loop back through dev, retest and regression; toggle the V-model mapping.',
  placements: [{ topic: 'mt-fundamentals', heading: 'STLC' }, { topic: 'qa-manual-bank', heading: 'Cluster 1: Fundamentals and the STLC' }],
};
