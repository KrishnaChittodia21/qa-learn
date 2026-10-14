// Saved Playground snippets (separate from study progress, so "Reset progress" keeps them).

export interface Snippet {
  id: string;
  name: string;
  code: string;
}

export interface PlaygroundState {
  active: string;
  snippets: Snippet[];
}

const KEY = 'qa-learn-playground-v1';

const DEFAULT: PlaygroundState = {
  active: 's1',
  snippets: [{ id: 's1', name: 'Scratch', code: "// Write JavaScript here and press Run (Ctrl/⌘ + Enter)\nconsole.log('Hello, QA!');\n" }],
};

export function loadPlayground(): PlaygroundState {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as PlaygroundState) : null;
    return parsed?.snippets?.length ? parsed : DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function savePlayground(state: PlaygroundState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked: snippets just won't persist
  }
}

/** Opens `code` as a new snippet; the Playground page picks it up when it loads. */
export function sendToPlayground(name: string, code: string) {
  const state = loadPlayground();
  const id = `s${Date.now().toString(36)}`;
  savePlayground({ active: id, snippets: [...state.snippets, { id, name, code }] });
}
