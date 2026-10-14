import type { VizMeta } from '../../core';

export const meta: VizMeta = {
  id: 'pom-ripple',
  title: 'One UI change, six specs: with and without a page object',
  blurb: 'Rename the Login button, change an input id or add an MFA step, then fix the suite. Without POM you edit every spec; with POM one edit in LoginPage.ts turns all six green. Follow spec → page object → locator → DOM.',
  placements: [
    { topic: 'pw-pom-data', heading: 'Page Object Model: what it is' },
    { topic: 'pw-pom-data', heading: 'Building a LoginPage' },
  ],
};
