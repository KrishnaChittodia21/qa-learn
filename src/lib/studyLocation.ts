// "Where you left off": a readable label for a saved study location (uiPrefs.lastStudyLocation).
// Pure: content lookups are passed in, so it can be unit-tested without the content bundle.

export interface LocationLookup {
  topic: (id: string) => { title: string; sections: { heading: string }[] } | undefined;
  /** the topic tab's visible name (e.g. "Improve This", or "Answer Lab" in the behavioural topic) */
  tabLabel: (topicId: string, tab: string) => string | undefined;
  /** JS coding problem title */
  coding: (id: string) => string | undefined;
  /** Playwright Lab step title */
  labStep: (id: string) => string | undefined;
}

export const PAGE_LABELS: Record<string, string> = {
  '/contents': 'Contents',
  '/weak-areas': 'Weak areas',
  '/practice': 'Mistakes drill',
  '/coding': 'JS coding',
  '/pw-lab': 'Playwright Lab',
  '/playground': 'JS Playground',
  '/companies': 'Company Qs',
  '/roadmap': '12-week plan',
};

/** Human label, e.g. "Playwright Locators · Learn · §3 Role locators" or "JS coding · Two sum". */
export function describeLocation(loc: string, look: LocationLookup): string | null {
  if (!loc) return null;
  const [path, search = ''] = loc.split('?');
  const params = new URLSearchParams(search);
  const topic = /^\/topic\/([^/]+)/.exec(path);
  if (topic) {
    const t = look.topic(topic[1]);
    if (!t) return null;
    const tab = params.get('tab') ?? 'learn';
    const tabName = look.tabLabel(topic[1], tab) ?? look.tabLabel(topic[1], 'learn') ?? 'Learn';
    const s = Number(params.get('s'));
    const sec =
      tab === 'learn' && params.has('s') && Number.isInteger(s) && t.sections[s]
        ? ` · §${s + 1} ${t.sections[s].heading.split(' — ')[0]}`
        : '';
    return `${t.title} · ${tabName}${sec}`;
  }
  const coding = /^\/coding\/([^/]+)/.exec(path);
  if (coding) {
    const title = look.coding(coding[1]);
    return title ? `JS coding · ${title}` : PAGE_LABELS['/coding'];
  }
  const lab = /^\/pw-lab\/([^/]+)/.exec(path);
  if (lab) {
    const title = look.labStep(lab[1]);
    return title ? `Playwright Lab · ${title}` : PAGE_LABELS['/pw-lab'];
  }
  return PAGE_LABELS[path] ?? null;
}

/** path + tab of a location; a topic without ?tab= opens on Learn */
function target(loc: string): string {
  const [path, search = ''] = loc.split('?');
  if (!/^\/topic\/[^/]+$/.test(path)) return path;
  return `${path}?tab=${new URLSearchParams(search).get('tab') ?? 'learn'}`;
}

/** true when the saved location opens the same page and tab as the next step (section index ignored) */
export function sameStudyTarget(a: string, b: string): boolean {
  return target(a) === target(b);
}
