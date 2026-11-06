// Keeps a page as Resizer set it. Straight after a Mod changes a page, the GM's Jumpgate client
// can save the page back with some of its old settings: seen live in 2 of 4 zooms, which kept the
// new width but put the old cell size back, doubling every distance. So for a few seconds after
// Resizer sets a page, a client change that undoes part of it while keeping the new size is
// corrected. A deliberate change, such as a new page size, is left alone.

const GUARD_MS = 10000;

/** @type {Map<string, {attrs: object, until: number}>} */
const guards = new Map();

const same = (a, b) => a === b || Number(a) === Number(b);

/**
 * Sets a page's attributes and guards them for a few seconds.
 *
 * @param {object} page Roll20 page.
 * @param {object} attrs Attributes to set.
 * @returns {void}
 */
export function setPageGuarded(page, attrs) {
  page.set(attrs);
  guards.set(page.id, { attrs: { ...attrs }, until: Date.now() + GUARD_MS });
}

/**
 * Handles change:page. Puts back what Resizer set if a client change undid part of it.
 *
 * @param {object} page Roll20 page.
 * @returns {void}
 */
export function onPageChange(page) {
  const guard = guards.get(page?.id);
  if (!guard) {
    return;
  }
  if (Date.now() > guard.until) {
    guards.delete(page.id);
    return;
  }
  // A page whose size was changed since is someone's own change: leave it
  for (const key of ['width', 'height']) {
    if (key in guard.attrs && !same(page.get(key), guard.attrs[key])) {
      guards.delete(page.id);
      return;
    }
  }
  const fix = {};
  for (const [key, value] of Object.entries(guard.attrs)) {
    if (!same(page.get(key), value)) {
      fix[key] = value;
    }
  }
  if (Object.keys(fix).length > 0) {
    page.set(fix);
  }
}
