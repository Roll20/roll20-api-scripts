// Which pages are "live": the ones effects run on.

import { isRecord, toText } from './utils.js';

/**
 * Works out the live pages from the campaign's page settings.
 *
 * Players see the ribbon page unless the GM has moved them to their own page
 * (a split party), which Roll20 records in playerspecificpages. v1 only ever
 * ran effects on the ribbon page.
 *
 * @param {object} input Page settings.
 * @param {string} input.ribbon Campaign playerpageid.
 * @param {*} input.split Campaign playerspecificpages: false or {playerId: pageId}.
 * @param {string[]} [input.gmPages=[]] Pages GMs are viewing, when previews are on.
 * @returns {Set<string>} Live page IDs.
 */
export function computeLivePages({ ribbon, split, gmPages = [] }) {
  const live = new Set();
  if (toText(ribbon)) {
    live.add(toText(ribbon));
  }
  if (isRecord(split)) {
    for (const pageId of Object.values(split)) {
      if (toText(pageId)) {
        live.add(toText(pageId));
      }
    }
  }
  for (const pageId of gmPages) {
    if (toText(pageId)) {
      live.add(toText(pageId));
    }
  }
  return live;
}

/**
 * Reads playerspecificpages, which Roll20 may hand back as an object or as JSON text.
 *
 * @param {*} raw Campaign value.
 * @returns {object|false} Map of player ID to page ID, or false.
 */
export function readSplitPages(raw) {
  if (isRecord(raw)) {
    return raw;
  }
  if (typeof raw === 'string' && raw.trim().startsWith('{')) {
    try {
      const parsed = JSON.parse(raw);
      return isRecord(parsed) ? parsed : false;
    } catch {
      return false;
    }
  }
  return false;
}

/**
 * Returns the live pages in the running game.
 *
 * @param {boolean} gmPagePreview Include pages that online GMs are viewing.
 * @returns {Set<string>} Live page IDs.
 */
export function getLivePages(gmPagePreview) {
  const campaign = Campaign();
  const gmPages = gmPagePreview
    ? findObjs({ _type: 'player' })
        .filter((p) => p.get('_online') !== false && playerIsGM(p.id))
        .map((p) => p.get('_lastpage'))
    : [];
  return computeLivePages({
    ribbon: campaign.get('playerpageid'),
    split: readSplitPages(campaign.get('playerspecificpages')),
    gmPages,
  });
}
