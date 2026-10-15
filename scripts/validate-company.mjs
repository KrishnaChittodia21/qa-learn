// Validates company-reported interview questions in src/content/company/*.ts.
// Usage: node scripts/validate-company.mjs [file …]   (file names without .ts)
import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { jaccard, tokenSet } from './find-similar.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/content/company');
const wanted = process.argv.slice(2);
const files = existsSync(dir)
  ? readdirSync(dir)
      .filter((f) => f.endsWith('.ts'))
      .filter((f) => !wanted.length || wanted.includes(f.replace(/\.ts$/, '')))
  : [];

const AREAS = ['manual', 'scenario', 'api', 'sql', 'javascript', 'playwright', 'automation', 'ai', 'behavioral'];
const DIFFS = ['easy', 'medium', 'hard', 'expert'];
const topics = new Set(readdirSync(join(root, 'src/content/topics')).map((f) => f.replace(/\.ts$/, '')));
const thisYear = new Date().getFullYear();
const ids = new Map();
const all = [];
let failures = 0;

for (const file of files) {
  let qs;
  try {
    qs = (await import(pathToFileURL(join(dir, file)).href)).QUESTIONS;
  } catch (e) {
    console.log(`✗ ${file}: failed to import — ${e.message}`);
    failures++;
    continue;
  }
  if (!Array.isArray(qs)) {
    console.log(`✗ ${file}: no QUESTIONS export`);
    failures++;
    continue;
  }
  for (const q of qs) {
    const errs = [];
    if (!q.id?.startsWith('co-')) errs.push('id must start with co-');
    if (ids.has(q.id)) errs.push(`duplicate id (also in ${ids.get(q.id)})`);
    ids.set(q.id, file);
    if (!q.company?.trim()) errs.push('missing company');
    if (!AREAS.includes(q.area)) errs.push(`bad area ${q.area}`);
    if (!DIFFS.includes(q.difficulty)) errs.push(`bad difficulty ${q.difficulty}`);
    if (!q.question || q.question.length < 20) errs.push('question too short');
    if (!q.answer || q.answer.length < 250) errs.push('answer too short (≥250 chars)');
    if (q.topic && !topics.has(q.topic)) errs.push(`unknown topic ${q.topic}`);
    const s = q.source ?? {};
    if (!s.name?.trim()) errs.push('source.name missing');
    if (!/^https:\/\/[^\s]+\.[^\s]+/.test(s.url ?? '')) errs.push('source.url must be an https URL');
    if (!Number.isInteger(s.year) || s.year < 2015 || s.year > thisYear) errs.push(`source.year ${s.year} out of range`);
    for (const f of q.followUps ?? []) if (!f.q?.trim() || (f.a ?? '').length < 40) errs.push('follow-up needs q and an answer ≥40 chars');
    if (errs.length) {
      failures++;
      console.log(`✗ ${q.id ?? '(no id)'} [${file}]\n  - ${errs.join('\n  - ')}`);
    }
    all.push({ ...q, file, set: tokenSet(q.question) });
  }
}

// the same question reported at one company twice is a duplicate; across companies it is fine
const dupes = [];
for (let i = 0; i < all.length; i++)
  for (let j = i + 1; j < all.length; j++)
    if (all[i].company === all[j].company && jaccard(all[i].set, all[j].set) >= 0.6) dupes.push([all[i], all[j]]);
for (const [a, b] of dupes) console.log(`⚠ near-duplicate at ${a.company}: ${a.id} ⇄ ${b.id}`);
if (dupes.length) failures++;

const companies = new Set(all.map((q) => q.company));
console.log(`\n${all.length} company questions from ${companies.size} companies in ${files.length} file(s): ${failures ? `${failures} problem(s)` : 'all valid'}`);
process.exit(failures ? 1 : 0);
