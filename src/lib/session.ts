// Who is logged in. Better Auth keeps the session in an httpOnly cookie; this module only mirrors it for the UI and
// starts or stops progress sync as the user logs in or out. Adapted from system-design-learn's src/lib/session.ts.
import { useSyncExternalStore } from 'react';
import { api } from './api';
import { showToast } from './celebrate';
import { flushProgress, startSync, stopSync } from './progress';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
}
export type Session = { status: 'loading' } | { status: 'out'; offline?: boolean } | { status: 'in'; user: User };

let state: Session = { status: 'loading' };
const listeners = new Set<() => void>();
const set = (s: Session) => {
  state = s;
  listeners.forEach((l) => l());
};

export const useSession = () =>
  useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => state,
  );
export const getSession = () => state;

/** Reads the cookie session from the service; called on load and after every login change. */
export async function refreshSession() {
  // a sleeping server can take ~30 s to answer: after 4 s show the signed-out view (Sign in button, open lessons)
  // instead of a half-empty page; the real answer still switches it when it arrives
  const slow = setTimeout(() => state.status === 'loading' && set({ status: 'out' }), 4000);
  try {
    const s = await api<{ user: User } | null>('/api/auth/get-session');
    if (s?.user) {
      // startSync swaps in the account's cached progress before its first await, so by the time the UI hears
      // "signed in" it already has the account's settings (no flash of the signed-out theme)
      const syncing = startSync(s.user.id);
      set({ status: 'in', user: s.user });
      await syncing;
    } else {
      const ended = state.status === 'in';
      stopSync(true);
      set({ status: 'out' });
      if (ended) showToast('You have been signed out', 'Your session ended. Sign in again to keep saving your progress.', 6000);
    }
  } catch {
    // the service is unreachable: the app keeps working on local progress
    set({ status: 'out', offline: true });
  } finally {
    clearTimeout(slow);
  }
}

// Sessions end after an hour with no requests (api/src/auth.ts). Using the tab counts as activity: moving, typing,
// scrolling or coming back to it checks in at most every 5 minutes, which renews the session or shows it has ended.
const CHECK_IN_MS = 5 * 60_000;
let lastCheckIn = 0;
function onActivity() {
  if (state.status !== 'in' || document.visibilityState !== 'visible' || Date.now() - lastCheckIn < CHECK_IN_MS) return;
  lastCheckIn = Date.now();
  api<{ user: User } | null>('/api/auth/get-session').then(
    (s) => !s?.user && void refreshSession(),
    () => undefined, // a network blip is not a sign-out
  );
}
if (typeof document !== 'undefined') {
  for (const type of ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'visibilitychange'])
    document.addEventListener(type, onActivity, { passive: true });
  document.addEventListener('scroll', onActivity, { passive: true, capture: true });
}

// where Better Auth sends the browser back to after an email link (hash routes need the full URL)
const back = (route: string) => `${window.location.origin}${window.location.pathname}#${route}`;
const captchaHeader = (captcha?: string) => (captcha ? { 'x-captcha-response': captcha } : undefined);

export async function signIn(email: string, password: string, captcha?: string) {
  // the captcha is only asked for after many wrong passwords on this account (CAPTCHA_REQUIRED)
  await api('/api/auth/sign-in/email', { body: { email, password, callbackURL: back('/login?verified=1') }, headers: captchaHeader(captcha) });
  await refreshSession();
}

export async function signUp(name: string, email: string, password: string, captcha?: string) {
  await api('/api/auth/sign-up/email', { body: { name, email, password, callbackURL: back('/login?verified=1') }, headers: captchaHeader(captcha) });
}

export const resendVerification = (email: string, captcha?: string) =>
  api('/api/auth/send-verification-email', { body: { email, callbackURL: back('/login?verified=1') }, headers: captchaHeader(captcha) });

export const requestPasswordReset = (email: string, captcha?: string) =>
  api('/api/auth/request-password-reset', { body: { email, redirectTo: back('/reset') }, headers: captchaHeader(captcha) });

export const resetPassword = (token: string, newPassword: string) => api('/api/auth/reset-password', { body: { token, newPassword } });

export async function signOut() {
  await flushProgress().catch(() => undefined);
  await api('/api/auth/sign-out', { body: {} }).catch(() => undefined);
  stopSync();
  set({ status: 'out' });
}
