// Smoke journey for a first-time visitor: Home → first lesson → mark it read (kept in this browser) → set up the exam
// (one page per route change) → badges earned. Exams graded in the browser and answers: static.spec.ts.
import { expect, test } from '@playwright/test';
import { SHORTS_DATA } from '../src/content/shorts';

/** the Shorts page counter, whatever the number of Shorts */
const watched = (n: number) => new RegExp(`${n} of ${SHORTS_DATA.length} watched`);

test('a new visitor can study the first topic and reach its exam; badges are earned in this browser', async ({ page }) => {
  // ticking a section earns "Hello, Tester"; its celebration may pop up over whatever comes next
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());
  await page.goto('/');

  // first visit opens the welcome tour
  const tour = page.getByRole('dialog');
  await expect(tour).toBeVisible();
  await tour.getByRole('button', { name: 'Close the guide' }).click();
  // the first-visit tour carries on into a "Show me" walkthrough of the menu
  await expect(page.getByText(/Show me · 1 of \d+/)).toBeVisible();
  await page.getByRole('button', { name: 'Skip' }).click();
  await expect(page.getByText(/Show me · /)).toBeHidden();

  await page.getByRole('link', { name: /Start lesson one/ }).click();
  await expect(page).toHaveURL(/#\/topic\/[^?]+\?tab=learn/);

  // ticking a section is saved and survives a reload
  const tick = page.getByRole('checkbox').first();
  await tick.check();
  await expect(tick).toBeChecked();
  await page.reload();
  await expect(page.getByRole('checkbox').first()).toBeChecked();

  const topicUrl = page.url().split('?')[0];
  await page.goto(`${topicUrl}?tab=exam`);
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: /mark all as read/ }).click();
  await page.getByRole('button', { name: /Set up exam/ }).click();
  // one copy only: the outgoing page must not render the new route too (fixed in M6)
  const startRun = page.getByRole('button', { name: /Start run/ });
  await expect(startRun).toHaveCount(1);
  await expect(startRun).toBeVisible();

  // the ticked section above earned "Hello, Tester"
  await page.goto('/#/achievements');
  await expect(page.getByText('Hello, Tester').first()).toBeVisible();
});

test('Guide me explains the page and "Show me" walks through it', async ({ page }) => {
  // a returning visitor: the welcome tour has been seen
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await page.goto('/#/topic/mt-fundamentals?tab=learn');
  await expect(page.getByRole('checkbox').first()).toBeVisible();
  await page.keyboard.press('?');
  const guide = page.getByRole('dialog', { name: 'Topic' });
  await expect(guide).toBeVisible();
  await guide.getByRole('button', { name: 'Show me' }).click();
  // stops not on screen are skipped (phones have no study-path strip), so check the walk, not its first stop
  await expect(page.getByText(/Show me · 1 of \d+/)).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByText('Show me · 2 of')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByText(/Show me · /)).toBeHidden();
});

test('a Short plays to its quiz and end card, and stays watched after a reload', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  // the first watched Short earns "Opening Scene"
  const celebration = page.getByRole('button', { name: 'Woohoo, keep going' });
  await page.addLocatorHandler(celebration, () => celebration.click());

  await page.goto('/#/shorts');
  await expect(page.getByText(watched(0))).toBeVisible();
  await page.getByRole('link', { name: /Ariane 5: 37 seconds/ }).click();
  await expect(page).toHaveURL(/#\/short\/ariane-5-overflow/);

  const player = page.getByRole('region', { name: 'Ariane 5: 37 seconds' });
  const next = player.locator('.sp-navrow').getByRole('button', { name: /Next/ });
  // step through to the quiz: Next is disabled there until it is answered
  await expect(async () => {
    if (await next.isEnabled()) await next.click();
    await expect(player.getByRole('group', { name: 'Your answer' })).toBeVisible({ timeout: 500 });
  }).toPass();
  await expect(next).toBeDisabled();
  await player.getByRole('button', { name: 'A longer launch countdown' }).click();
  await expect(player.getByText('Not that one:')).toBeVisible();
  await player.getByRole('button', { name: /Ariane 5 flight data at its real boundaries/ }).click();
  await expect(player.getByText('Right.')).toBeVisible();
  await next.click();
  await expect(player.getByRole('link', { name: /Read the full lesson/ })).toBeVisible();

  await page.reload();
  await page.goto('/#/shorts');
  await expect(page.getByText(watched(1))).toBeVisible();
  await expect(page.getByRole('heading', { name: /Watched/ })).toBeVisible();
});

test('a long section collapses with Read more (remembered), and Learn more opens', async ({ page }) => {
  await page.addInitScript(() => localStorage.getItem('qa-learn-ui-v1') || localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await page.goto('/#/topic/pw-locators?tab=learn');
  const section = page.locator('section.tp-sec', { has: page.getByRole('heading', { name: /The recommended locator priority/ }) });
  const toggle = section.getByRole('button', { name: /Read more/ });
  await toggle.scrollIntoViewIfNeeded();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await toggle.click();
  await expect(section.getByRole('button', { name: /Read less/ })).toHaveAttribute('aria-expanded', 'true');
  // remembered: still open after a reload
  await page.reload();
  await expect(section.getByRole('button', { name: /Read less/ })).toHaveAttribute('aria-expanded', 'true');

  const more = section.locator('details.learn-more');
  await more.locator('summary').click();
  await expect(more.getByRole('link', { name: /Playwright: Best practices/ })).toBeVisible();
});

test('a section switches to Steps, a Your turn blocks Next until solved, and the choice is remembered', async ({ page }) => {
  // seed only once: the reload below must keep what the app saved
  await page.addInitScript(() => localStorage.getItem('qa-learn-ui-v1') || localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await page.goto('/#/topic/sql-joins-validation?tab=learn');
  const section = page.locator('section.tp-sec').first();
  await section.getByRole('button', { name: 'Steps' }).click();
  await expect(section.getByRole('button', { name: 'Steps' })).toHaveAttribute('aria-pressed', 'true');

  const lesson = section.locator('.sl');
  await lesson.getByRole('button', { name: /^Next/ }).click();
  await lesson.getByRole('button', { name: /^Next/ }).click();
  await expect(lesson.getByText('3 / 10')).toBeVisible();
  await expect(lesson.getByRole('button', { name: 'Solve it to continue' })).toBeDisabled();
  await lesson.getByRole('button', { name: '4', exact: true }).click();
  await expect(lesson.getByRole('button', { name: 'Solve it to continue' })).toBeDisabled();
  await lesson.getByRole('button', { name: '3', exact: true }).click();
  await expect(lesson.getByRole('button', { name: /^Next/ })).toBeEnabled();

  await page.reload();
  await expect(page.locator('section.tp-sec').first().getByRole('button', { name: 'Steps' })).toHaveAttribute('aria-pressed', 'true');
});

test('the Shorts player pauses, changes reading speed and goes back a beat', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await page.goto('/#/short/test-pyramid');
  const player = page.getByRole('region', { name: 'The test pyramid in 90 seconds' });
  const nav = player.locator('.sp-navrow');
  await expect(nav.getByRole('button', { name: /Back/ })).toBeDisabled();

  await player.getByRole('button', { name: 'Pause' }).click();
  await expect(player.getByText(/Paused · ▶ to play/)).toBeVisible();
  // paused: the beat does not move on by itself
  await page.waitForTimeout(6000);
  await expect(player.getByText(/Paused/)).toBeVisible();
  await player.getByRole('button', { name: 'Play' }).click();

  await player.getByRole('button', { name: /1× reading speed/ }).click();
  await expect(player.getByRole('button', { name: /1\.25× reading speed \(faster\)/ })).toBeVisible();

  await nav.getByRole('button', { name: /Next/ }).click();
  await expect(nav.getByText('2 / 5')).toBeVisible();
  await nav.getByRole('button', { name: /Back/ }).click();
  await expect(nav.getByText('1 / 5')).toBeVisible();
});

test('every page has its own Guide me, and "Show me" finds something on the page', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the same guides run on phones; the menu stops differ');
  test.setTimeout(120_000);
  await page.addInitScript(() => localStorage.getItem('qa-learn-ui-v1') || localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  const pages: [string, string][] = [
    ['/', 'Dashboard'], ['/syllabus', 'Syllabus'], ['/track', 'Track'], ['/topic/mt-fundamentals?tab=learn', 'Topic'],
    ['/coding', 'Coding'], ['/roadmap', 'Roadmap'], ['/pw-lab', 'Playwright Lab'], ['/playground', 'Playground'], ['/companies', 'Company questions'],
    ['/weak-areas', 'Weak areas'], ['/practice', 'Mistakes drill'], ['/achievements', 'Achievements'], ['/settings', 'Settings'], ['/saved', 'Saved'],
    ['/shorts', 'Shorts'], ['/short/test-pyramid', 'Short'],
  ];
  for (const [path, title] of pages) {
    await page.goto(`/#${path}`);
    await page.locator('main').waitFor();
    await page.keyboard.press('Escape');
    await page.locator('body').click({ position: { x: 5, y: 5 } });
    await page.keyboard.press('?');
    const guide = page.getByRole('dialog', { name: title });
    await expect(guide, `guide for ${path}`).toBeVisible();
    await guide.getByRole('button', { name: 'Show me' }).click();
    await expect(page.getByText(/Show me · 1 of \d+/), `walkthrough for ${path}`).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByText(/Show me · /)).toBeHidden();
  }
});

test('Settings shows one section at a time in tabs; the tab is kept on reload and arrow keys move between tabs', async ({ page }) => {
  await page.addInitScript(() => localStorage.getItem('qa-learn-ui-v1') || localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
  await page.goto('/#/settings');
  const tabs = page.getByRole('tablist', { name: 'Settings sections' });
  await expect(tabs.getByRole('tab', { name: 'Exams' })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel')).toHaveCount(1);

  await tabs.getByRole('tab', { name: 'Appearance' }).click();
  await expect(page.getByRole('tabpanel', { name: 'Appearance' })).toBeVisible();
  await expect(page.getByRole('tabpanel')).toHaveCount(1);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Appearance' })).toHaveAttribute('aria-selected', 'true');

  await page.getByRole('tab', { name: 'Appearance' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Study lock' })).toBeFocused();
  await expect(page.getByRole('tab', { name: 'Study lock' })).toHaveAttribute('aria-selected', 'true');
});
