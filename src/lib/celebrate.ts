// Celebrations: a short toast plus (unless the OS asks for reduced motion) a confetti burst.
// canvas-confetti is imported on demand so it stays out of the main bundle.
import { prefersReducedMotion } from './appEvents';

export interface Toast {
  id: number;
  title: string;
  detail?: string;
}

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

export function subscribeToasts(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export const getToasts = () => toasts;

export function dismissToast(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((l) => l());
}

export function showToast(title: string, detail?: string, ms = 3000) {
  const t = { id: nextId++, title, detail };
  toasts = [...toasts.slice(-2), t];
  listeners.forEach((l) => l());
  setTimeout(() => dismissToast(t.id), ms);
}

export function celebrate(title: string, detail?: string) {
  showToast(title, detail);
  if (prefersReducedMotion()) return;
  import('canvas-confetti')
    .then(({ default: confetti }) => {
      // the sticker fills: sun, bubblegum, mint, sky, tangerine
      const colors = ['#ffc93c', '#ff6fae', '#4fe0b6', '#7cc8ff', '#ff9a52'];
      confetti({ particleCount: 110, spread: 75, origin: { y: 0.7 }, colors, scalar: 1.1, disableForReducedMotion: true });
      setTimeout(() => confetti({ particleCount: 50, spread: 100, origin: { y: 0.6 }, colors, disableForReducedMotion: true }), 180);
    })
    .catch(() => {
      // confetti is decoration; the toast already said it
    });
}
