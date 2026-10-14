import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'llm-next-token',
  title: 'How an LLM writes a Playwright assertion, one token at a time',
  blurb: 'Watch the model score candidate next tokens and pick one. Turn the temperature up and re-roll to see different answers, open a knowledge gap to watch a fluent hallucination appear, or fill the context window until an early rule drops out.',
  placements: [
    { topic: 'ai-basics', heading: 'How an LLM generates text' },
    { topic: 'ai-basics', heading: 'Hallucinations' },
  ],
};
