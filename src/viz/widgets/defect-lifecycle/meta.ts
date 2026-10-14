import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'defect-lifecycle',
  title: 'Defect life cycle: New → … → Closed',
  blurb: 'Follow a bug ticket through triage, fix and retest. Pick a scenario (reopened, duplicate, deferred, cannot reproduce) and a severity/priority mix and see who acts at each step.',
  placements: [{ topic: 'mt-defects', heading: 'Defect life cycle' }, { topic: 'qa-interview-bank', heading: 'Test design, defects and process' }],
};
