// Joining pages to a group. Objects already on a page (from Roll20's
// Duplicate Page, which keeps marketplace art the API cannot copy) are paired
// with the group's objects; anything missing is copied; anything extra is a
// leftover, handled by the pairLeftovers setting.

import { buildButton, buildSecondaryButton, whisper } from './chat.js';
import { COMMAND } from './constants.js';
import { createCopy, fingerprint, readProps } from './copy.js';
import {
  addPage,
  linkOf,
  markPageOnly,
  newLink,
  objectsOnPage,
  pageName,
  setLinkObject,
} from './groups.js';
import { t } from './i18n.js';
import { createRequest } from './requests.js';
import { getLang, getSetting } from './state.js';
import { copyPageSettings, layerExcluded, mirrorNew } from './sync.js';
import { escapeHtml, toText, truncate } from './utils.js';

/**
 * Returns the objects on a page that belong to no link and should be.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @returns {object[]} Objects.
 */
export function unlinkedOn(group, pageId) {
  return objectsOnPage(pageId).filter(
    (o) => !linkOf(o.id) && !group.pageOnly.includes(o.id) && !layerExcluded(group, o.get('layer'))
  );
}

/**
 * Links every unlinked object on a page as a link of its own (no copies).
 * Used for the source page when a group is made.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @returns {number} How many were linked.
 */
export function adoptPage(group, pageId) {
  let n = 0;
  for (const obj of unlinkedOn(group, pageId)) {
    newLink(
      group,
      obj.get('_type'),
      { [pageId]: obj.id },
      fingerprint(obj.get('_type'), readProps(obj))
    );
    n += 1;
  }
  return n;
}

/**
 * Returns the object that stands for a link: the source page's, or else the
 * first that still exists.
 *
 * @param {object} group Group.
 * @param {object} link Link.
 * @returns {object|null} Object.
 */
export function referenceOf(group, link) {
  const first = link.objects[group.source] ? getObj(link.type, link.objects[group.source]) : null;
  if (first) {
    return first;
  }
  for (const id of Object.values(link.objects)) {
    const obj = getObj(link.type, id);
    if (obj) {
      return obj;
    }
  }
  return null;
}

const distance = (a, b) =>
  Math.hypot(
    (Number(a.get('left')) || 0) - (Number(b.get('left')) || 0),
    (Number(a.get('top')) || 0) - (Number(b.get('top')) || 0)
  );

/**
 * Pairs a page's unlinked objects with the group's links, then copies what
 * is missing.
 *
 * @param {object} group Group.
 * @param {string} pageId Page to pair (not the source).
 * @param {object} [options] Options.
 * @param {boolean} [options.copyMissing=true] Copy links with no partner on the page.
 * @returns {{paired: number, copied: number, failed: number, leftovers: object[]}} Result.
 */
export function pairPage(group, pageId, { copyMissing = true } = {}) {
  const candidates = unlinkedOn(group, pageId);
  const byPrint = new Map();
  for (const obj of candidates) {
    const print = fingerprint(obj.get('_type'), readProps(obj));
    if (!byPrint.has(print)) {
      byPrint.set(print, []);
    }
    byPrint.get(print).push(obj);
  }
  const taken = new Set();
  const unmatched = [];
  let paired = 0;
  for (const [linkId, link] of Object.entries(group.links)) {
    if (link.objects[pageId] || group.hidden[linkId]?.[pageId]) {
      continue;
    }
    const ref = referenceOf(group, link);
    if (!ref) {
      continue;
    }
    const print = fingerprint(link.type, readProps(ref));
    const match = (byPrint.get(print) || []).find((o) => !taken.has(o.id));
    if (match) {
      taken.add(match.id);
      setLinkObject(group, linkId, pageId, match.id);
      paired += 1;
    } else {
      unmatched.push({ linkId, link, ref });
    }
  }
  // Tokens moved since the copy was made: same character and name, nearest wins.
  const stillUnmatched = [];
  for (const item of unmatched) {
    const { ref } = item;
    if (item.link.type !== 'graphic' || !toText(ref.get('represents'))) {
      stillUnmatched.push(item);
      continue;
    }
    const options = candidates.filter(
      (o) =>
        !taken.has(o.id) &&
        o.get('_type') === 'graphic' &&
        o.get('represents') === ref.get('represents') &&
        o.get('name') === ref.get('name')
    );
    options.sort((a, b) => distance(a, ref) - distance(b, ref));
    if (options[0]) {
      taken.add(options[0].id);
      setLinkObject(group, item.linkId, pageId, options[0].id);
      paired += 1;
    } else {
      stillUnmatched.push(item);
    }
  }
  let copied = 0;
  let failed = 0;
  if (copyMissing) {
    for (const { linkId, link, ref } of stillUnmatched) {
      if (layerExcluded(group, ref.get('layer'))) {
        continue;
      }
      const { obj } = createCopy(link.type, readProps(ref), pageId);
      if (obj) {
        setLinkObject(group, linkId, pageId, obj.id);
        copied += 1;
      } else {
        failed += 1;
      }
    }
  }
  return { paired, copied, failed, leftovers: candidates.filter((o) => !taken.has(o.id)) };
}

/**
 * Deals with objects that matched nothing, following pairLeftovers.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @param {object[]} leftovers Objects.
 * @param {string} [gm] GM to ask.
 * @returns {{copied: number, kept: number, asked: number}} What happened.
 */
export function handleLeftovers(group, pageId, leftovers, gm) {
  const out = { copied: 0, kept: 0, asked: 0 };
  if (!leftovers.length) {
    return out;
  }
  const mode = getSetting('pairLeftovers', group);
  if (mode === 'copy') {
    leftovers.forEach((o) => mirrorNew(group, o));
    out.copied = leftovers.length;
    return out;
  }
  if (mode === 'leave') {
    leftovers.forEach((o) => markPageOnly(group, o.id));
    out.kept = leftovers.length;
    return out;
  }
  const lang = getLang();
  const ids = leftovers.map((o) => o.id);
  const all = createRequest('leftover', gm, { groupId: group.id, ids });
  const rows = leftovers.slice(0, 10).map((o) => {
    const one = createRequest('leftover', gm, { groupId: group.id, ids: [o.id] });
    const label = truncate(
      o.get('name') || o.get('text') || t(`types.${o.get('_type')}`, lang),
      30
    );
    return `<div>${escapeHtml(label)} ${buildSecondaryButton(t('buttons.copy', lang), `${COMMAND} request ${one} copy`)}${buildSecondaryButton(t('buttons.keepHere', lang), `${COMMAND} request ${one} keep`)}</div>`;
  });
  if (leftovers.length > 10) {
    rows.push(
      `<div>${escapeHtml(t('messages.andMore', lang, { count: leftovers.length - 10 }))}</div>`
    );
  }
  whisper(gm || null, t('titles.leftovers', lang), [
    `<div>${escapeHtml(t('messages.leftovers', lang, { count: leftovers.length, page: pageName(pageId) }))}</div>`,
    ...rows,
    `<div style="margin-top:4px">${buildButton(t('buttons.copyAll', lang), `${COMMAND} request ${all} copy`)}${buildSecondaryButton(t('buttons.keepAll', lang), `${COMMAND} request ${all} keep`)}</div>`,
  ]);
  out.asked = leftovers.length;
  return out;
}

/**
 * Adds a page to a group: pairs, copies what is missing and deals with
 * leftovers.
 *
 * @param {object} group Group.
 * @param {string} pageId Page ID.
 * @param {string} [gm] GM to ask about leftovers.
 * @returns {object} Counts.
 */
export function joinPage(group, pageId, gm) {
  addPage(group, pageId);
  // Objects made on the source while it was alone have no link yet.
  adoptPage(group, group.source);
  copyPageSettings(group, { only: pageId });
  const result = pairPage(group, pageId);
  const left = handleLeftovers(group, pageId, result.leftovers, gm);
  return {
    ...result,
    leftovers: result.leftovers.length,
    leftoversCopied: left.copied,
    leftoversKept: left.kept,
  };
}
