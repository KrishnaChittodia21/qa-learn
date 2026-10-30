// Fails if any answer text reached a built UI. Usage: node scripts/check-bundle.mjs [dist-dir]
// Probes: a plain-text run from every answer field, skipping runs that also appear in public content
// (a solution that repeats a line of its starter code is not a leak). Adapted from system-design-learn.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { buildAnswerKey, loadContent, splitCoding, splitCompanyQuestions, splitTopic } from './content-split.ts';

const dist = process.argv[2] ?? 'dist';
if (!existsSync(dist)) {
  console.log(`✗ ${dist} not found: build first`);
  process.exit(1);
}

const { topics, coding, companyQuestions } = await loadContent();
// public = the split content plus every other source file (vizzes, the PW Lab and the judge reuse some lesson phrases)
const otherSources = readdirSync('src', { recursive: true })
  .map(String)
  .filter((f) => /\.(ts|tsx|json|md)$/.test(f) && !/^content[/\\](topics|coding|company)[/\\]/.test(f))
  .map((f) => readFileSync(join('src', f), 'utf8'));
const publicText =
  JSON.stringify([
    topics.map((t) => splitTopic(t).publicTopic),
    splitCoding(coding).publicProblems,
    splitCompanyQuestions(companyQuestions).publicQuestions,
  ]) + otherSources.join('\n');

const SKIP = new Set(['_id', 'topicId', 'kind', 'contentHash']);
const strings = (v, out = []) => {
  if (typeof v === 'string') out.push(v);
  else if (Array.isArray(v)) v.forEach((x) => strings(x, out));
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) if (!SKIP.has(k)) strings(x, out);
  return out;
};
const probes = new Map();
for (const doc of Object.values(await buildAnswerKey()).flat()) {
  for (const s of strings(doc)) {
    const run = s.match(/[A-Za-z0-9 ,.]{40,}/)?.[0]?.slice(0, 60).trim();
    if (run && run.length >= 30 && !publicText.includes(run)) probes.set(run, doc._id);
  }
}

const files = readdirSync(dist, { recursive: true }).map(String).filter((f) => /\.(js|mjs|css|html|json|map)$/.test(f));
const maps = files.filter((f) => f.endsWith('.map'));
const leaks = [];
for (const f of files) {
  const text = readFileSync(join(dist, f), 'utf8');
  for (const [run, id] of probes) if (text.includes(run)) leaks.push(`${id} in ${f}: "${run}"`);
}

// answer-key fields written out as data (short or code answers slip past the 40-character probes above).
// Only names that exist solely in the key: `answer` and `steps` are public field names elsewhere, and `correct` is
// also the accuracy counter in lib/weak.ts; an MCQ's correct indexes travel with its explanation, which is checked here
const KEY_ONLY = ['whatInterviewerLooksFor', 'modelAnswer', 'pitfalls', 'solution', 'explanation', 'insight', 'followUps', 'assumptions'];
const keyField = new RegExp(`[{,]"?(${KEY_ONLY.join('|')})"?:\\s*["'\`\\[{0-9]`);
for (const f of files.filter((x) => /\.(js|mjs|json|html)$/.test(x))) {
  const hit = readFileSync(join(dist, f), 'utf8').match(keyField);
  if (hit) leaks.push(`answer field "${hit[1]}" in ${f}`);
}

if (maps.length) console.log(`✗ source maps in the build: ${maps.join(', ')}`);
if (leaks.length) {
  console.log(`✗ ${leaks.length} answer texts found in ${dist}:`);
  for (const l of leaks.slice(0, 10)) console.log(`  ${l}`);
}
if (maps.length || leaks.length) process.exit(1);
console.log(`✓ ${dist}: no answers (${probes.size} probes over ${files.length} files)`);
