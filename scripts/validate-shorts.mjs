// Checks every Short (src/content/shorts.ts): known beat types, exactly one quiz with a valid answer, numbers where
// a beat animates one, and a topic + section heading that exist. Usage: node scripts/validate-shorts.mjs
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dir = join(root, 'src/content/topics');
const headings = new Map();
for (const f of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
  const t = (await import(pathToFileURL(join(dir, f)).href)).default;
  headings.set(t.id, t.sections.map((s) => s.heading));
}
const { SHORTS_DATA, shortProblems } = await import(pathToFileURL(join(root, 'src/content/shorts.ts')).href);
const problems = shortProblems(SHORTS_DATA, headings);
if (problems.length) {
  for (const p of problems) console.error(`✗ ${p}`);
  process.exit(1);
}
console.log(`✓ ${SHORTS_DATA.length} Shorts valid`);
