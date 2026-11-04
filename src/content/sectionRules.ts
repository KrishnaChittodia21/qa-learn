// Rules for the optional parts of a Learn section (M8), shared by scripts/validate-content.mjs and the tests.
// Type-only imports, so plain node can load it.
import type { Section } from '../types';

/** What is wrong with a section's optional parts (empty when fine). */
export function sectionProblems(s: Section): string[] {
  const out: string[] = [];
  const at = `section "${s.heading}"`;
  const lm = s.learnMore;
  if (lm) {
    if (typeof lm.body !== 'string' || lm.body.trim().length < 80) out.push(`${at}: learnMore.body needs at least 80 characters`);
    for (const l of lm.links ?? []) {
      if (!l?.name?.trim() || !l?.what?.trim()) out.push(`${at}: learnMore link needs a name and a what`);
      if (!/^https:\/\/[^\s]+$/.test(l?.url ?? '')) out.push(`${at}: learnMore link "${l?.name}" needs an https URL`);
    }
  }
  return out;
}
