// Accessibility (M10): axe on every page in light and dark; serious and critical issues fail the run.
// Desktop only: the pages are the same on phones, and the colours are what change between themes.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/', '/contents', '/topic/mt-fundamentals?tab=learn', '/topic/sql-joins-validation?tab=learn', '/topic/mt-fundamentals/exam',
  '/coding', '/coding/sum-array', '/roadmap', '/pw-lab', '/pw-lab/step1', '/playground', '/companies', '/weak-areas',
  '/achievements', '/settings', '/saved', '/shorts', '/short/test-pyramid', '/login', '/signup',
];

for (const scheme of ['light', 'dark'] as const) {
  test(`no serious or critical axe issues, ${scheme}`, async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop', 'colours and markup are the same on phones');
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
    const problems: string[] = [];
    for (const path of PAGES) {
      await page.goto(`/#${path}`);
      await page.locator('main').waitFor();
      await page.waitForTimeout(400);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations.filter((x) => x.impact === 'serious' || x.impact === 'critical'))
        problems.push(`${path} · ${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
