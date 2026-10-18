import type { Accent, Settings } from './progress';

/** Colour themes (Settings → Colour): which spectrum hue is the action colour. Ids are the saved setting values
 *  from earlier versions, so old saves keep working (tokens.css maps each id to a Spectral hue). */
export const ACCENTS: { id: Accent; label: string }[] = [
  { id: 'indigo', label: 'Mint' },
  { id: 'teal', label: 'Cyan' },
  { id: 'rose', label: 'Lilac' },
  { id: 'amber', label: 'Lime' },
];

/** Mirror the theme + accent settings onto <html> (CSS tokens key off data-theme / data-accent). */
export function applyThemeAttrs(s: Pick<Settings, 'theme' | 'accent'>) {
  const root = document.documentElement;
  if (s.theme === 'system') root.removeAttribute('data-theme');
  else root.setAttribute('data-theme', s.theme);
  root.setAttribute('data-accent', s.accent ?? 'indigo');
}
