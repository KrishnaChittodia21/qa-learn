import { useEffect, useRef, useState } from 'react';
import { CodeEditor } from '../components/ui';
import { runScript, type ScriptResult } from '../lib/runScript';
import { loadPlayground, savePlayground, type Snippet } from '../lib/playground';

const EXAMPLES: { name: string; code: string }[] = [
  {
    name: 'Array methods',
    code: `const prices = ['$29.99', '$9.99', '$15.99'];

const numbers = prices.map((p) => Number(p.replace('$', '')));
console.log(numbers);

const cheap = numbers.filter((n) => n < 20);
console.log(cheap);

const total = numbers.reduce((sum, n) => sum + n, 0);
console.log(total.toFixed(2));

// sort() compares strings by default: predict this before running!
console.log([10, 9, 1, 2].sort());
console.log([10, 9, 1, 2].sort((a, b) => a - b));`,
  },
  {
    name: 'Remove duplicates',
    code: `const ids = [3, 1, 3, 2, 1, 5];

// 1. with a Set
console.log([...new Set(ids)]);

// 2. without built-ins (what interviewers often ask for)
function unique(arr) {
  const seen = {};
  const out = [];
  for (const x of arr) {
    if (!seen[x]) {
      seen[x] = true;
      out.push(x);
    }
  }
  return out;
}
console.log(unique(ids));`,
  },
  {
    name: 'Event loop order',
    code: `console.log('1: sync');
setTimeout(() => console.log('2: timeout'), 0);
Promise.resolve().then(() => console.log('3: microtask'));
(async () => {
  console.log('4: async start');
  await null;
  console.log('5: after await');
})();
console.log('6: sync end');
// Predict the order before you press Run.`,
  },
  {
    name: 'async / await',
    code: `const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchUser(id) {
  await wait(100);
  if (id < 0) throw new Error('Invalid id ' + id);
  return { id, name: 'user' + id };
}

console.time('sequential');
const a = await fetchUser(1);
const b = await fetchUser(2);
console.timeEnd('sequential');

console.time('parallel');
const [c, d] = await Promise.all([fetchUser(3), fetchUser(4)]);
console.timeEnd('parallel');
console.log(a, b, c, d);

try {
  await fetchUser(-1);
} catch (err) {
  console.error('Caught:', err.message);
}`,
  },
  {
    name: 'Closures & var vs let',
    code: `for (var i = 1; i <= 3; i++) {
  setTimeout(() => console.log('var', i), 0);
}
for (let j = 1; j <= 3; j++) {
  setTimeout(() => console.log('let', j), 0);
}

function makeCounter() {
  let count = 0;
  return () => ++count;
}
const next = makeCounter();
console.log(next(), next(), next());`,
  },
  {
    name: 'Class (Page Object style)',
    code: `class LoginPage {
  constructor(baseUrl) {
    this.url = baseUrl + '/login';
    this.attempts = 0;
  }
  login(user, pass) {
    this.attempts++;
    return user === 'standard_user' && pass === 'secret_sauce' ? 'inventory' : 'error';
  }
}

const page = new LoginPage('https://www.saucedemo.com');
console.log(page.login('standard_user', 'wrong'));
console.log(page.login('standard_user', 'secret_sauce'));
console.log(page);`,
  },
];

export default function PlaygroundPage() {
  const [state, setState] = useState(loadPlayground);
  const [result, setResult] = useState<ScriptResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const active = state.snippets.find((s) => s.id === state.active) ?? state.snippets[0];
  const runRef = useRef<() => void>(() => {});

  useEffect(() => savePlayground(state), [state]);

  const update = (patch: Partial<Snippet>) =>
    setState((s) => ({ ...s, snippets: s.snippets.map((x) => (x.id === active.id ? { ...x, ...patch } : x)) }));

  const addSnippet = (name: string, code: string) => {
    const id = `s${Date.now().toString(36)}`;
    setState((s) => ({ active: id, snippets: [...s.snippets, { id, name, code }] }));
    setResult(null);
  };

  const remove = () => {
    if (state.snippets.length === 1) {
      update({ code: '' });
      return;
    }
    setState((s) => {
      const snippets = s.snippets.filter((x) => x.id !== active.id);
      return { active: snippets[0].id, snippets };
    });
    setResult(null);
  };

  const run = async () => {
    setBusy(true);
    setResult(await runScript(active.code));
    setBusy(false);
  };
  // keep the keyboard shortcut pointed at the latest run (current snippet)
  useEffect(() => {
    runRef.current = run;
  });

  // Ctrl/Cmd + Enter runs the code from anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runRef.current();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="page">
      <div className="topic-head">
        <div className="eyebrow">Practice</div>
        <h1>JavaScript Playground</h1>
        <p className="lead">
          Write any JavaScript, press Run and see the console output, printed the way Node prints it. Top-level <code>await</code>,
          timers and promises work. Your snippets are saved in this browser.
        </p>
      </div>

      <div className="pg-tabs">
        {state.snippets.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`chip ${s.id === active.id ? 'on' : ''}`}
            onClick={() => {
              setState((x) => ({ ...x, active: s.id }));
              setResult(null);
              setRenaming(false);
            }}
          >
            {s.name}
          </button>
        ))}
        <button type="button" className="chip" onClick={() => addSnippet(`Snippet ${state.snippets.length + 1}`, '')}>
          + New
        </button>
        <select
          className="pg-examples"
          value=""
          onChange={(e) => {
            const ex = EXAMPLES.find((x) => x.name === e.target.value);
            if (ex) addSnippet(ex.name, ex.code);
          }}
          aria-label="Open an example"
        >
          <option value="">Open an example…</option>
          {EXAMPLES.map((ex) => (
            <option key={ex.name} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      <div className="coding-grid">
        <section className="coding-work">
          <div className="row between wrap pg-toolbar">
            {renaming ? (
              <input
                className="pg-name"
                autoFocus
                value={active.name}
                onChange={(e) => update({ name: e.target.value })}
                onBlur={() => setRenaming(false)}
                onKeyDown={(e) => e.key === 'Enter' && setRenaming(false)}
                aria-label="Snippet name"
              />
            ) : (
              <button type="button" className="link-btn" onClick={() => setRenaming(true)} title="Rename">
                ✎ {active.name}
              </button>
            )}
            <div className="row gap-s">
              <button type="button" className="btn-ghost btn-xs" onClick={remove}>
                {state.snippets.length === 1 ? 'Clear' : 'Delete'}
              </button>
            </div>
          </div>
          <CodeEditor value={active.code} onChange={(code) => update({ code })} language="javascript" />
          <div className="row gap-s wrap coding-actions">
            <button className="btn btn-primary" type="button" disabled={busy} onClick={run}>
              {busy ? 'Running…' : '▶ Run'}
            </button>
            <span className="small muted">Ctrl/⌘ + Enter</span>
          </div>
        </section>

        <section className="card pg-output" aria-live="polite">
          <div className="row between">
            <div className="label">Console</div>
            {result && !result.timedOut && <span className="small muted">finished in {result.ms} ms</span>}
          </div>
          {!result && <p className="muted small">Output appears here. Try an example from the menu above.</p>}
          {result && (
            <pre className="console-out pg-console">
              {result.lines.map((l, i) => (
                <div key={i} className={`pg-line pg-${l.kind}`}>
                  {l.text}
                </div>
              ))}
              {result.error && !result.lines.some((l) => l.text.startsWith('Uncaught')) && (
                <div className="pg-line pg-error">
                  {result.timedOut ? '⏱ ' : 'Uncaught '}
                  {result.error.message}
                  {result.error.line ? `  (line ${result.error.line})` : ''}
                </div>
              )}
              {!result.lines.length && !result.error && <div className="pg-line muted">(no output)</div>}
            </pre>
          )}
          <p className="muted small">
            Runs in your browser, like Node without <code>require</code>, <code>fs</code> or <code>import</code>. Stops after 5 s.
          </p>
        </section>
      </div>
    </div>
  );
}
