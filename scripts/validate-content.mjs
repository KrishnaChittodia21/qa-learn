// Structural validator for topic content. Usage:
//   node scripts/validate-content.mjs            # all topics
//   node scripts/validate-content.mjs id1 id2    # selected topics
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { isDeepStrictEqual } from 'node:util';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/content/topics');
const wanted = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const files = readdirSync(dir)
  .filter((f) => f.endsWith('.ts'))
  .filter((f) => !wanted.length || wanted.includes(f.replace(/\.ts$/, '')));

// Runs `fnName` from `src` against lab tests (same semantics as the browser runner).
const clone = (v) => (v === undefined ? null : JSON.parse(JSON.stringify(v)));
async function judge(src, fnName, tests) {
  const saved = { log: console.log, info: console.info, warn: console.warn, error: console.error };
  console.log = console.info = console.warn = console.error = () => {};
  try {
    return await judgeQuietly(src, fnName, tests);
  } finally {
    Object.assign(console, saved);
  }
}
async function judgeQuietly(src, fnName, tests) {
  let fn;
  try {
    fn = new Function(`${src}\n;return typeof ${fnName} === 'function' ? ${fnName} : undefined;`)();
  } catch (e) {
    return { error: `does not parse: ${e.message}` };
  }
  if (!fn) return { error: `does not define ${fnName}` };
  const failed = [];
  for (const [i, t] of tests.entries()) {
    try {
      const got = await Promise.race([fn(...clone(t.args)), new Promise((_, rej) => setTimeout(() => rej(new Error('timeout')), 2000).unref())]);
      if (!isDeepStrictEqual(clone(got), clone(t.expected))) failed.push(i + 1);
    } catch {
      failed.push(i + 1);
    }
  }
  return { failed };
}

const MIN = { sections: 7, cheatSheet: 8, codeChallenges: 2, interviewQuestions: 7, envelopeQuestions: 3, test: 15 };
const allIds = new Map();
let failures = 0;

for (const file of files) {
  const errs = [];
  let t;
  try {
    t = (await import(pathToFileURL(join(dir, file)).href)).default;
  } catch (e) {
    console.log(`✗ ${file}: failed to import — ${e.message}`);
    failures++;
    continue;
  }
  if (!t || typeof t !== 'object') errs.push('no default export');
  else {
    if (t.id + '.ts' !== file) errs.push(`id "${t.id}" does not match filename`);
    // behavioural topics have no estimation drills and no code-reading MCQs
    const behavioral = t.id === 'qa-behavioral';
    const min = behavioral ? { ...MIN, envelopeQuestions: 0 } : MIN;
    for (const [k, n] of Object.entries(min)) {
      if (!Array.isArray(t[k]) || t[k].length < n) errs.push(`${k}: ${t[k]?.length ?? 0} < ${n}`);
    }
    const ids = [
      ...(t.codeChallenges ?? []),
      ...(t.interviewQuestions ?? []),
      ...(t.envelopeQuestions ?? []),
      ...(t.test ?? []),
    ].map((x) => x.id);
    for (const id of ids) {
      if (!id) errs.push('missing id');
      else if (allIds.has(id)) errs.push(`duplicate id ${id} (also in ${allIds.get(id)})`);
      else allIds.set(id, file);
    }
    let multi = 0;
    let withCode = 0;
    const qs = new Set();
    for (const q of t.test ?? []) {
      if (!Array.isArray(q.options) || q.options.length < 4) errs.push(`${q.id}: needs ≥4 options`);
      if (!Array.isArray(q.correct) || !q.correct.length) errs.push(`${q.id}: no correct answer`);
      for (const c of q.correct ?? []) if (c < 0 || c >= q.options.length) errs.push(`${q.id}: correct index ${c} out of range`);
      if (new Set(q.correct).size !== q.correct?.length) errs.push(`${q.id}: duplicate correct index`);
      if (q.correct?.length > 1) multi++;
      if (q.code) withCode++;
      if (!q.explanation || q.explanation.length < 80) errs.push(`${q.id}: explanation too short`);
      const norm = q.question.toLowerCase().replace(/\W+/g, ' ').trim();
      if (qs.has(norm)) errs.push(`${q.id}: duplicate question text`);
      qs.add(norm);
    }
    if (multi < 3) errs.push(`only ${multi} multi-select MCQs (need ≥3)`);
    if (!behavioral && withCode < 4) errs.push(`only ${withCode} MCQs with code (need ≥4)`);
    for (const iq of t.interviewQuestions ?? []) {
      if (!iq.followUps?.length) errs.push(`${iq.id}: no follow-ups`);
      if (!iq.modelAnswer || iq.modelAnswer.length < 400) errs.push(`${iq.id}: model answer too short`);
    }
    for (const b of t.envelopeQuestions ?? []) {
      if (!b.steps?.length || !b.assumptions?.length) errs.push(`${b.id}: missing steps/assumptions`);
    }
    // every item must carry interviewer follow-ups, so practice mimics a real interview
    const badFollowUps = (list, min) =>
      (list ?? []).filter((x) => (x.followUps ?? []).filter((f) => f?.q?.trim() && f?.a?.trim().length >= 40).length < min).map((x) => x.id);
    const missing = [
      ...badFollowUps(t.test, 1),
      ...badFollowUps(t.envelopeQuestions, 1),
      ...badFollowUps(t.codeChallenges, 1),
      ...badFollowUps(t.interviewQuestions, 2),
    ];
    // auto-judged labs: the solution passes every test, the buggy starter fails at least one
    for (const c of t.codeChallenges ?? []) {
      if (!c.tests && !c.fnName) continue;
      if (!c.fnName || !c.tests?.length) {
        errs.push(`${c.id}: auto-judged lab needs both fnName and tests`);
        continue;
      }
      if (c.tests.length < 4) errs.push(`${c.id}: only ${c.tests.length} lab tests (need ≥4)`);
      const sol = await judge(c.solution.code, c.fnName, c.tests);
      if (sol.error) errs.push(`${c.id}: solution ${sol.error}`);
      else if (sol.failed.length) errs.push(`${c.id}: solution fails test(s) ${sol.failed.join(', ')}`);
      const st = await judge(c.starter.code, c.fnName, c.tests);
      if (!st.error && !st.failed.length) errs.push(`${c.id}: buggy starter passes every test, so the tests don't catch the bug`);
    }
    if (missing.length) errs.push(`${missing.length} item(s) without enough follow-ups (MCQ/BoE/lab ≥1, interview ≥2): ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ', …' : ''}`);
  }
  if (errs.length) {
    failures++;
    console.log(`✗ ${file}\n  - ${errs.join('\n  - ')}`);
  } else {
    console.log(`✓ ${file}  (${t.sections.length} sections, ${t.test.length} MCQs, ${t.interviewQuestions.length} IQs)`);
  }
}
// ---------- cross-topic uniqueness ----------
// Near-duplicate questions (token Jaccard ≥ 0.4) across the whole app. With --strict (or when
// specific topic ids are given) any pair involving the checked topics fails validation.
const { allQuestions, tokenSet, jaccard } = await import('./find-similar.mjs');
const strict = process.argv.includes('--strict') || wanted.length > 0;
const pool = (await allQuestions()).map((q) => ({ ...q, set: tokenSet(q.text) }));
const checked = new Set(files.map((f) => f.replace(/\.ts$/, '')));
const dupes = [];
for (let i = 0; i < pool.length; i++) {
  for (let j = i + 1; j < pool.length; j++) {
    const a = pool[i];
    const b = pool[j];
    if (!checked.has(a.topic) && !checked.has(b.topic)) continue;
    const sim = jaccard(a.set, b.set);
    if (sim >= 0.4) dupes.push({ sim, a, b });
  }
}
if (dupes.length) {
  console.log(`\n${strict ? '✗' : '⚠'} ${dupes.length} near-duplicate question pair(s):`);
  for (const d of dupes.sort((x, y) => y.sim - x.sim)) {
    console.log(`  ${d.sim.toFixed(2)}  ${d.a.id}  ⇄  ${d.b.id}`);
    console.log(`        ${d.a.text.replace(/\s+/g, ' ').slice(0, 110)}`);
    console.log(`        ${d.b.text.replace(/\s+/g, ' ').slice(0, 110)}`);
  }
  if (strict) failures++;
}

console.log(`\n${files.length - failures}/${files.length} topic files valid${dupes.length ? ' (see duplicates above)' : ''}`);
process.exit(failures ? 1 : 0);
