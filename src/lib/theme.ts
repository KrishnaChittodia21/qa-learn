import type { Accent, Settings } from './progress';

export const ACCENTS: { id: Accent; label: string }[] = [
  { id: 'indigo', label: 'Indigo' },
  { id: 'teal', label: 'Teal' },
  { id: 'rose', label: 'Rose' },
  { id: 'amber', label: 'Amber' },
];

/** Mirror the theme + accent settings onto <html> (CSS tokens key off data-theme / data-accent). */
export function applyThemeAttrs(s: Pick<Settings, 'theme' | 'accent'>) {
  const root = document.documentElement;
  if (s.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', s.theme);
  root.setAttribute('data-accent', s.accent ?? 'indigo');
}
