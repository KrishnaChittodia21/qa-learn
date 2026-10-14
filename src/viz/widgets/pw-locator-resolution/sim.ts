// Pure simulation of how Playwright resolves a locator against a SauceDemo-like product list.
// Facts (playwright.dev/docs/locators): locators are lazy and re-resolved against the current DOM
// on every action; any action that targets one element throws a strict-mode violation when more
// than one element matches; first()/last()/nth() opt out of strictness but are brittle. An
// ElementHandle (page.$) points at one concrete node and goes stale when the app replaces it.
import type { BaseFrame } from '../../core';

export type LocatorKind = 'role' | 'filter' | 'first' | 'testid' | 'handle';
export type Rerender = 'no' | 'yes';
export interface Params {
  locator: LocatorKind;
  rerender: Rerender;
}
export const DEFAULT_PARAMS: Params = { locator: 'role', rerender: 'no' };

export interface Product {
  slug: string;
  name: string;
  short: [string, string];
}
export const PRODUCTS: Product[] = [
  { slug: 'sauce-labs-backpack', name: 'Sauce Labs Backpack', short: ['Sauce Labs', 'Backpack'] },
  { slug: 'sauce-labs-bike-light', name: 'Sauce Labs Bike Light', short: ['Sauce Labs', 'Bike Light'] },
  { slug: 'sauce-labs-bolt-t-shirt', name: 'Sauce Labs Bolt T-Shirt', short: ['Sauce Labs', 'Bolt T-Shirt'] },
  { slug: 'sauce-labs-fleece-jacket', name: 'Sauce Labs Fleece Jacket', short: ['Sauce Labs', 'Fleece Jacket'] },
  { slug: 'sauce-labs-onesie', name: 'Sauce Labs Onesie', short: ['Sauce Labs', 'Onesie'] },
  { slug: 'test.allthethings()-t-shirt-(red)', name: 'Test.allTheThings() T-Shirt (Red)', short: ['Test.allTheThings()', 'T-Shirt (Red)'] },
];
export const TARGET = PRODUCTS[0];
const AZ = PRODUCTS.map((p) => p.slug);
const ZA = [...AZ].reverse();

export type Mark = 'none' | 'scan' | 'match' | 'reject' | 'target' | 'wrong' | 'violation' | 'stale';
export type Status = 'idle' | 'running' | 'pass' | 'fail' | 'warn';

export interface Frame extends BaseFrame {
  /** product slugs in DOM order */
  order: string[];
  /** DOM generation: 2 after the list is rebuilt */
  gen: 1 | 2;
  /** old nodes are detached but not yet replaced */
  detached: boolean;
  itemMark: Record<string, Mark>;
  btnMark: Record<string, Mark>;
  /** highlighted code line */
  line: number;
  count: number | null;
  status: Status;
  cart: string[];
  /** ElementHandle target (handle mode) */
  handle?: { slug: string; gen: 1 | 2; attached: boolean };
  error?: string;
  /** handle mode: the contrasting locator line is running */
  compare?: boolean;
}

export const CODE: Record<LocatorKind, string> = {
  role: "const add = page.getByRole('button', { name: 'Add to cart' });",
  filter: "const add = page.locator('.inventory_item').filter({ hasText: 'Sauce Labs Backpack' }).getByRole('button');",
  first: "const add = page.getByRole('button', { name: 'Add to cart' }).first();",
  testid: "const add = page.getByTestId('add-to-cart-sauce-labs-backpack'); // testIdAttribute: 'data-test'",
  handle: "const add = await page.$('[data-test=\"add-to-cart-sauce-labs-backpack\"]'); // ElementHandle",
};
export const RERENDER_LINE = "await page.getByTestId('product-sort-container').selectOption('za'); // list rebuilt";
export const CLICK_LINE = 'await add.click();';
export const COMPARE_LINE = "await page.getByTestId('add-to-cart-sauce-labs-backpack').click(); // locator";

/** node id shown in the tree: items 1-6 / 21-26, buttons 11-16 / 31-36 (by A→Z index) */
export const nodeId = (slug: string, gen: 1 | 2, btn: boolean) => AZ.indexOf(slug) + 1 + (btn ? 10 : 0) + (gen === 2 ? 20 : 0);

const blank = () => Object.fromEntries(AZ.map((s) => [s, 'none'])) as Record<string, Mark>;

export function simulate({ locator, rerender }: Params): Frame[] {
  const frames: Frame[] = [];
  const re = rerender === 'yes';
  let st: Omit<Frame, 'caption' | 'predict'> = {
    order: AZ,
    gen: 1,
    detached: false,
    itemMark: blank(),
    btnMark: blank(),
    line: 0,
    count: null,
    status: 'idle',
    cart: [],
  };
  const push = (patch: Partial<Frame>, caption: string, predict?: string) => {
    st = { ...st, ...patch, itemMark: { ...(patch.itemMark ?? st.itemMark) }, btnMark: { ...(patch.btnMark ?? st.btnMark) } };
    frames.push({ ...st, caption, predict });
  };
  const name = (slug: string) => PRODUCTS.find((p) => p.slug === slug)!.name;

  // --- creation ---
  if (locator === 'handle') {
    push({ status: 'running' }, 'page.$() is NOT lazy: it queries the DOM right now (like querySelector, first match wins) and returns an ElementHandle bound to that one node.', re ? 'The list will be rebuilt before the click. Will the handle still work?' : undefined);
    scanButtons(st.order, (s) => s === TARGET.slug, 'data-test', true);
    const b = blank();
    b[TARGET.slug] = 'target';
    push({ btnMark: b, itemMark: blank(), handle: { slug: TARGET.slug, gen: 1, attached: true }, count: 1, status: 'idle' }, `The handle now points at node #${nodeId(TARGET.slug, 1, true)} itself, not at a description of how to find it.`);
  } else {
    push(
      {},
      'Creating a locator does not touch the page. `add` is only a recipe (role + name, filter, test id…); nothing is matched yet.',
      re ? 'The list will be rebuilt before the click. Will `add` still find the right button?' : 'Has Playwright found any button yet? When will it look?',
    );
  }

  // --- optional re-render between creation and action ---
  if (re) {
    push(
      { line: 1, detached: true, itemMark: blank(), btnMark: blank(), handle: st.handle ? { ...st.handle, attached: false } : undefined },
      'Sorting Z→A makes this mock app throw away the old item nodes (#1–#16 are now detached from the document)…',
    );
    push({ order: ZA, gen: 2, detached: false }, '…and insert brand-new nodes (#21–#36) in Z→A order. Same text, same attributes, different elements.');
  }

  // --- action ---
  const clickLine = re ? 2 : 1;
  const willMatch = locator === 'role' || locator === 'first' ? 6 : 1;
  push(
    { line: clickLine, status: 'running', count: null, itemMark: blank(), btnMark: blank() },
    locator === 'handle' ? 'click() on the handle: Playwright uses the node it already holds; it does not search again.' : 'click() is where the locator is resolved: Playwright runs the recipe against the DOM as it is NOW.',
    locator === 'handle'
      ? re
        ? `Node #${nodeId(TARGET.slug, 1, true)} was removed from the page. What does click() do?`
        : `Node #${nodeId(TARGET.slug, 1, true)} is still in the page. Will the click work?`
      : `How many elements will this locator match, and what does click() do with ${willMatch === 6 ? 'them' : 'it'}?`,
  );

  if (locator === 'handle') {
    if (re) {
      const b = blank();
      b[TARGET.slug] = 'stale';
      push({ btnMark: b, status: 'fail', error: 'elementHandle.click: Element is not attached to the DOM' }, 'The handle still points at the old, detached node. elementHandle.click: Element is not attached to the DOM. The new Backpack button (#31) is right there, but the handle cannot know.');
    } else {
      const b = blank();
      b[TARGET.slug] = 'target';
      push({ btnMark: b, status: 'pass', cart: [TARGET.name] }, 'Nothing re-rendered, so the node is still attached; the click works and the cart shows 1.');
      push({}, 'It worked only because the DOM never changed. Turn on the re-render to see the handle go stale; modern React and Vue apps re-render all the time.');
    }
    // contrast: the same step written with a locator
    push(
      { compare: true, line: clickLine + 1, status: 'running', error: undefined, cart: [], btnMark: blank(), count: null },
      'Compare: the same click written with a locator. It carries no node, only the recipe, so it resolves now against the current DOM.',
      'Will the locator find the current Backpack button?',
    );
    scanButtons(st.order, (s) => s === TARGET.slug, 'data-test');
    const b2 = blank();
    b2[TARGET.slug] = 'target';
    push({ btnMark: b2, count: 1, status: 'pass', cart: [TARGET.name] }, `Locator resolved to exactly 1 element: #${nodeId(TARGET.slug, st.gen, true)}${re ? ', the NEW node' : ''}. Click succeeds. Locators are lazy; handles are snapshots.`);
    return frames;
  }

  const order = st.order;
  if (locator === 'filter') {
    // step 1: candidates .inventory_item, filtered by text
    const im = blank();
    for (const s of order) {
      im[s] = 'scan';
      push({ itemMark: { ...im } }, `'.inventory_item' #${nodeId(s, st.gen, false)}: does its text contain "Sauce Labs Backpack"? ${s === TARGET.slug ? 'Yes, keep it.' : 'No, filtered out.'}`);
      im[s] = s === TARGET.slug ? 'match' : 'reject';
    }
    push({ itemMark: { ...im } }, `filter({ hasText }) leaves 1 item. Now getByRole('button') searches only inside it.`);
    const b = blank();
    b[TARGET.slug] = 'match';
    push({ btnMark: b }, `Inside item #${nodeId(TARGET.slug, st.gen, false)} there is exactly one button: #${nodeId(TARGET.slug, st.gen, true)} "Add to cart".`);
  } else {
    const attr = locator === 'testid' ? 'data-test' : 'role';
    scanButtons(order, (s) => (locator === 'testid' ? s === TARGET.slug : true), attr);
  }

  // --- count and outcome ---
  const count = locator === 'role' || locator === 'first' ? 6 : 1;
  const bm = { ...st.btnMark };
  if (locator === 'role') {
    for (const s of order) bm[s] = 'violation';
    push({ count, btnMark: bm }, 'Resolved to 6 elements. click() needs exactly one.', 'Will Playwright click the first one, all six, or refuse?');
    push(
      { status: 'fail', error: "strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements" },
      "Error: locator.click: strict mode violation: getByRole('button', { name: 'Add to cart' }) resolved to 6 elements. Playwright refuses to guess. (count() and all() would be fine: they are multi-element operations.)",
    );
    push({ status: 'fail' }, "Strictness only applies to actions that need one target. Multi-element operations are fine: await expect(add).toHaveCount(6) and await add.count() both pass.");
    push({}, 'Fix: narrow the locator (filter by the product card, or a test id) instead of reaching for .first().');
  } else if (locator === 'first') {
    const pick = order[0];
    push({ count, btnMark: bm }, `Resolved to 6 elements, but .first() opts out of strictness and takes the first in DOM order: #${nodeId(pick, st.gen, true)}.`, 'Which product ends up in the cart?');
    for (const s of order) bm[s] = s === pick ? (pick === TARGET.slug ? 'target' : 'wrong') : 'reject';
    push({ btnMark: { ...bm } }, `Actionability checks run on #${nodeId(pick, st.gen, true)} only (visible, stable, receives events, enabled). All pass, so Playwright clicks it.`);
    if (pick === TARGET.slug) {
      push({ btnMark: { ...bm }, status: 'warn', cart: [name(pick)] }, 'It clicks the Backpack, but only because the Backpack happens to be first today. The test passes for the wrong reason.');
      push({}, 'Brittle: sort the list, add a promo item or change the API order and .first() silently clicks something else. Turn on the re-render to see it.');
    } else {
      push({ btnMark: { ...bm }, status: 'fail', cart: [name(pick)] }, `It clicks "Add to cart" for ${name(pick)}. No error, just the wrong product in the cart.`);
      push({ error: `expect(cart).toContainText('Sauce Labs Backpack') fails` }, 'The failure surfaces later, in an assertion far from the cause. That is why the docs discourage first()/nth() for picking among look-alikes.');
    }
  } else {
    for (const s of order) bm[s] = s === TARGET.slug ? 'target' : bm[s] === 'none' ? 'none' : 'reject';
    push({ count, btnMark: { ...bm } }, `Resolved to exactly 1 element (#${nodeId(TARGET.slug, st.gen, true)}), so strictness is satisfied.`);
    push({}, 'Then the actionability checks for click run on that element: visible, stable, receives events, enabled. All pass, so Playwright clicks.');
    push({ status: 'pass', cart: [TARGET.name] }, `Cart badge shows 1: Sauce Labs Backpack.${re ? ' The DOM was rebuilt after `add` was created, yet the locator found the NEW node because it resolved at click time.' : ''}`);
    push({}, locator === 'testid' ? 'Test ids survive copy and layout changes. SauceDemo uses data-test, so set use: { testIdAttribute: \'data-test\' } (the default is data-testid).' : 'Filtering by the card the user sees reads like the user story: "in the Backpack card, click its button".');
  }
  return frames;

  function scanButtons(ord: string[], ok: (s: string) => boolean, attr: string, stopAtFirst = false) {
    const b = { ...st.btnMark };
    for (const s of ord) {
      if (stopAtFirst && Object.values(b).includes('match')) break;
      b[s] = 'scan';
      const hit = ok(s);
      const why =
        attr === 'data-test'
          ? `data-test="add-to-cart-${s.length > 22 ? s.slice(0, 20) + '…' : s}" ${hit ? 'matches' : 'does not match'}`
          : 'role=button, accessible name "Add to cart": match';
      push({ btnMark: { ...b } }, `Button #${nodeId(s, st.gen, true)} (${name(s)}): ${why}.`);
      b[s] = hit ? 'match' : 'reject';
    }
    st = { ...st, btnMark: b };
  }
}
