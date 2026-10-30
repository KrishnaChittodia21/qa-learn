// Shared test helpers. Source modules use extensionless imports and import.meta.glob, so they are loaded through
// Vite's module runner rather than plain node imports. Each call is a fresh module instance (no shared state).
import { runnerImport } from 'vite';
import viteConfig from '../vite.config.ts';
import type { Progress } from '../src/lib/progress';

export const load = async <T>(path: string) =>
  (await runnerImport<T>(path, { root: process.cwd(), configFile: false, logLevel: 'error', plugins: viteConfig.plugins })).module;

/** An in-memory localStorage, installed on globalThis; `saved` seeds the progress key. */
export function stubStorage(saved?: string) {
  const store = new Map<string, string>();
  if (saved !== undefined) store.set('qa-learn-progress-v1', saved);
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  };
  return store;
}

/** A fresh progress store module (defaults, nothing saved) and its starting progress. */
export async function freshProgress() {
  stubStorage();
  const mod = await load<typeof import('../src/lib/progress')>('/src/lib/progress.ts');
  return { mod, p: structuredClone(mod.getProgress()) as Progress };
}
