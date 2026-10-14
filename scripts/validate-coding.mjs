// Validates JavaScript coding problems: structure, unique ids, and that every reference
// solution passes every test. Usage:
//   node scripts/validate-coding.mjs            # all files in src/content/coding
//   node scripts/validate-coding.mjs arrays     # selected files (without .ts)
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/content/coding');
const wanted = process.argv.slice(2);
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.ts'))
  .filter((f) => !wanted.length || wanted.includes(f.replace(/\.ts$/, '')));

const CATEGORIES = ['arrays', 'strings', 'objects', 'logic', 'async', 'qa-utils'];
const DIFFS = ['easy', 'medium', 'hard', 'expert'];
const ids = new Map();
let failures = 0;
let total = 0;

// Same shape as the browser runner: evaluate the source, then pull the named function out.
const load = (src, fnName) => new Function(`${src}\n;return typeof ${fnName} === 'function' ? ${fnName} : undefined;`)();
const clone = (v) => JSON.parse(JSON.stringify(v));

for (const file of files) {
  let problems;
  try {
    problems = (await import(pathToFileURL(join(dir, file)).href)).PROBLEMS;
  } catch (e) {
    console.log(`✗ ${file}: failed to import — ${e.message}`);
    failures++;
    continue;
  }
  if (!Array.isArray(problems)) {
    console.log(`✗ ${file}: no PROBLEMS export`);
    failures++;
    continue;
  }
  for (const p of problems) {
    total++;
    const errs = [];
    if (!p.id?.startsWith('code-')) errs.push('id must start with code-');
    if (ids.has(p.id)) errs.push(`duplicate id (also in ${ids.get(p.id)})`);
    ids.set(p.id, file);
    if (!CATEGORIES.includes(p.category)) errs.push(`bad category ${p.category}`);
    if (!DIFFS.includes(p.difficulty)) errs.push(`bad difficulty ${p.difficulty}`);
    if (!p.prompt || p.prompt.length < 120) errs.push('prompt too short');
    if (!p.explanation || p.explanation.length < 200) errs.push('explanation too short');
    if (!p.hints?.length) errs.push('no hints');
    if (!Array.isArray(p.tests) || p.tests.length < 5) errs.push(`only ${p.tests?.length ?? 0} tests (need ≥5)`);
    if (!p.tests?.some((t) => t.hidden)) errs.push('no hidden tests');
    if (!p.starter?.includes(p.fnName)) errs.push('starter does not define fnName');
    let fn;
    try {
      fn = load(p.solution, p.fnName);
      if (!fn) errs.push(`solution does not define ${p.fnName}`);
    } catch (e) {
      errs.push(`solution does not parse: ${e.message}`);
    }
    if (fn) {
      for (const [i, t] of (p.tests ?? []).entries()) {
        try {
          const got = await fn(...clone(t.args));
          if (!isDeepStrictEqual(clone(got ?? null), clone(t.expected ?? null))) {
            errs.push(`test ${i + 1}: expected ${JSON.stringify(t.expected)}, got ${JSON.stringify(got)}`);
          }
        } catch (e) {
          errs.push(`test ${i + 1} threw: ${e.message}`);
        }
      }
    }
    if (errs.length) {
      failures++;
      console.log(`✗ ${p.id ?? '(no id)'} [${file}]\n  - ${errs.join('\n  - ')}`);
    }
  }
}
console.log(`\n${total - failures}/${total} coding problems valid`);
process.exit(failures ? 1 : 0);
