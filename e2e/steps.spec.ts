// Plays every step lesson to the end with the right answers (read from the lesson itself): each Watch step moves on,
// each Your turn unlocks Next once solved, and Finish marks the section read with no misses recorded.
import { expect, test, type Locator } from '@playwright/test';
import type { Step, Topic } from '../src/types';
import mtTestDesign from '../src/content/topics/mt-test-design';
import pwLocators from '../src/content/topics/pw-locators';
import sqlJoins from '../src/content/topics/sql-joins-validation';
import mtDefects from '../src/content/topics/mt-defects';
import pwWaiting from '../src/content/topics/pw-assertions-waiting';

const TOPICS_WITH_STEPS: Topic[] = [mtTestDesign, pwLocators, sqlJoins, mtDefects, pwWaiting];
const LESSONS = TOPICS_WITH_STEPS.flatMap((t) => t.sections.flatMap((s, i) => (s.steps ? [{ t, i, lesson: s.steps }] : [])));

/** the task's text as the page shows it: **bold** and `code` marks dropped */
const plain = (s: string) => s.replace(/\*\*|`/g, '');

async function solve(box: Locator, step: Extract<Step, { kind: 'turn' }>, labels: Record<string, string>) {
  const t = step.task;
  switch (t.type) {
    case 'choose':
      return box.locator('.sl-opt').filter({ has: box.page().getByText(plain(t.options[t.answer].text), { exact: true }) }).click();
    case 'number':
      return box.locator('.sl-num').getByText(t.answer.toLocaleString('en-US'), { exact: true }).click();
    case 'order':
      for (const item of t.items) await box.locator('.sl-token').getByText(item, { exact: true }).click();
      return;
    case 'pick':
      return box.locator('.sl-opt').getByText(labels[t.answer], { exact: true }).click();
    default:
      throw new Error(`no player for task type ${t.type}`);
  }
}

for (const { t, i, lesson } of LESSONS) {
  test(`steps: ${t.id} §${i + 1} plays to the end`, async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true, lessonMode: 'steps' })));
    await page.goto(`/#/topic/${t.id}?tab=learn&s=${i}`);
    const box = page.locator(`#s-${i} .sl`);
    await expect(box).toBeVisible();
    const labels = Object.fromEntries(lesson.actors.map((a) => [a.id, a.label]));
    const next = box.locator('.sl-nav .btn-primary');

    for (const [k, step] of lesson.steps.entries()) {
      await expect(box.locator('.sl-count')).toHaveText(`${k + 1} / ${lesson.steps.length}`);
      if (step.kind === 'turn') {
        await expect(next).toBeDisabled();
        await solve(box, step, labels);
      }
      await expect(next).toBeEnabled();
      await next.click();
    }

    // Finish: the section is read and the run is recorded with no misses
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('qa-learn-progress-v1') ?? '{}'));
    expect(saved.sections?.[t.id]).toContain(i);
    expect(saved.steps?.[`${t.id}:${i}`]?.missed).toBe(0);
  });
}

test('a section without a hand-written lesson gets generated Steps that play to the end', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true, lessonMode: 'steps' })));
  await page.goto('/#/topic/mt-fundamentals?tab=learn&s=0');
  const box = page.locator('#s-0 .sl');
  await expect(box).toBeVisible();
  const next = box.locator('.sl-nav .btn-primary');
  const total = Number((await box.locator('.sl-count').textContent())!.split('/')[1]);
  for (let k = 0; k < total; k++) {
    await expect(box.locator('.sl-count')).toHaveText(`${k + 1} / ${total}`);
    // every word of the drawing stays inside the stage (text is measured and scaled to fit)
    await page.waitForTimeout(1200);
    const outside = await box.evaluate((root) => {
      const svg = root.querySelector('.sl-stage svg');
      if (!svg || !svg.getBoundingClientRect().width) return [];
      const R = svg.getBoundingClientRect();
      return [...svg.querySelectorAll('text')]
        .filter((t) => t.textContent?.trim())
        .filter((t) => {
          const r = t.getBoundingClientRect();
          return r.left < R.left - 2 || r.right > R.right + 2 || r.top < R.top - 2 || r.bottom > R.bottom + 2;
        })
        .map((t) => t.textContent);
    });
    expect(outside, `step ${k + 1}: text outside the stage`).toEqual([]);
    if (await next.isDisabled()) {
      // a Your turn: try the options until one is right (wrong ones count as a miss)
      const opts = box.locator('.sl-opt');
      for (let o = 0; o < (await opts.count()) && (await next.isDisabled()); o++) {
        if (await opts.nth(o).isEnabled()) await opts.nth(o).click();
      }
    }
    await expect(next).toBeEnabled();
    await next.click();
  }
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('qa-learn-progress-v1') ?? '{}'));
  expect(saved.sections?.['mt-fundamentals']).toContain(0);
  expect(saved.steps?.['mt-fundamentals:0']).toBeTruthy();
});
