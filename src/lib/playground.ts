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

/** the scratch file a first visit starts with: a small, runnable QA example to edit */
export const SAMPLE = `// A sample to start from: edit it, then press Run (Ctrl/⌘ + Enter).
// It checks a login rule against test data, like a tiny data-driven test.

const users = [
  { name: 'standard_user', password: 'secret_sauce', expected: 'ok' },
  { name: 'locked_out_user', password: 'secret_sauce', expected: 'locked' },
  { name: '', password: 'secret_sauce', expected: 'missing username' },
  { name: 'standard_user', password: '', expected: 'missing password' },
];

function login({ name, password }) {
  if (!name) return 'missing username';
  if (!password) return 'missing password';
  if (name === 'locked_out_user') return 'locked';
  return 'ok';
}

let passed = 0;
for (const u of users) {
  const got = login(u);
  const ok = got === u.expected;
  if (ok) passed++;
  console.log(ok ? 'PASS' : 'FAIL', JSON.stringify(u.name), '→', got);
}
console.log(\`\${passed}/\${users.length} checks passed\`);

// top-level await works too: a fake API call
const res = await new Promise((r) => setTimeout(() => r({ status: 200, items: 6 }), 300));
console.log('API', res);
`;

/** the one-liner a first visit used to get: an untouched copy is upgraded to the sample */
const OLD_DEFAULT = "// Write JavaScript here and press Run (Ctrl/⌘ + Enter)\nconsole.log('Hello, QA!');\n";

const DEFAULT: PlaygroundState = {
  active: 's1',
  snippets: [{ id: 's1', name: 'Scratch', code: SAMPLE }],
};

export function loadPlayground(): PlaygroundState {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as PlaygroundState) : null;
    if (!parsed?.snippets?.length) return DEFAULT;
    return { ...parsed, snippets: parsed.snippets.map((sn) => (sn.code === OLD_DEFAULT ? { ...sn, code: SAMPLE } : sn)) };
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
