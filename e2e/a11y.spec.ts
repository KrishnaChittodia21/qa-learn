// Accessibility (M10): axe on every page in light and dark; serious and critical issues fail the run.
// Desktop and phone: the phone layout has its own top bar, dock and More sheet.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const PAGES = [
  '/', '/today', '/contents', '/build', '/topic/mt-fundamentals?tab=learn', '/topic/sql-joins-validation?tab=learn', '/topic/mt-defects?tab=learn', '/topic/mt-fundamentals/exam',
  '/coding', '/coding/sum-array', '/roadmap', '/pw-lab', '/pw-lab/step1', '/playground', '/companies', '/weak-areas',
  '/achievements', '/settings', '/saved', '/shorts', '/short/test-pyramid',
];

for (const scheme of ['light', 'dark'] as const) {
  test(`no serious or critical axe issues, ${scheme}`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ colorScheme: scheme, reducedMotion: 'reduce' });
    await page.addInitScript(() => localStorage.setItem('qa-learn-ui-v1', JSON.stringify({ tourSeen: true })));
    const problems: string[] = [];
    for (const path of PAGES) {
      await page.goto(`/#${path}`);
      await page.locator('main').waitFor();
      await page.waitForTimeout(400);
      // nothing may make the page wider than the screen (on phones the browser then zooms out and taps miss)
      // (compare with the configured viewport: a phone browser grows innerWidth to fit the overflow)
      const screenW = page.viewportSize()!.width;
      const scrollW = await page.evaluate(() => document.documentElement.scrollWidth);
      if (scrollW > screenW) problems.push(`${path} · page is ${scrollW}px wide on a ${screenW}px screen`);
      // the breadcrumb strip is one line (a class clash once turned it into a huge empty box on every page)
      const strip = await page.locator('.shell-console').boundingBox();
      if (strip && strip.height > 80) problems.push(`${path} · breadcrumb strip is ${Math.round(strip.height)}px tall`);
      const { violations } = await new AxeBuilder({ page }).analyze();
      for (const v of violations.filter((x) => x.impact === 'serious' || x.impact === 'critical'))
        problems.push(`${path} · ${v.id} (${v.impact}): ${v.nodes.length} × ${v.nodes.slice(0, 2).map((n) => n.target.join(' ')).join(' | ')}`);
    }
    expect(problems, problems.join('\n')).toEqual([]);
  });
}
