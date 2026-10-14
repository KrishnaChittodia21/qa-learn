import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'prompt-injection-flow',
  title: 'Prompt injection: following one chatbot message through the pipeline',
  blurb: 'A support bot builds a prompt from its instructions, order data and your message. Send a normal question, a direct injection, a poisoned product review or a system-prompt extraction attempt, with defences off or on, and see what leaks and what a tester check catches.',
  placements: [
    { topic: 'ai-chatbot-testing', heading: 'Prompt injection' },
    { topic: 'ai-chatbot-testing', heading: 'Sensitive data leakage' },
  ],
};
