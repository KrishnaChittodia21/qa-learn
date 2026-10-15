// Tiny window-event bus so any component can open app-level overlays owned by Layout.
export type AppEvent = 'open-guide' | 'open-palette';

export function emit(name: AppEvent) {
  window.dispatchEvent(new CustomEvent(`qa-learn:${name}`));
}

export function on(name: AppEvent, fn: () => void) {
  const handler = () => fn();
  window.addEventListener(`qa-learn:${name}`, handler);
  return () => window.removeEventListener(`qa-learn:${name}`, handler);
}

export const openGuide = () => emit('open-guide');
export const openPalette = () => emit('open-palette');

/** true when the user asked the OS to reduce motion */
export const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
