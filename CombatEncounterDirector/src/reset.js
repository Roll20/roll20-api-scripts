import { filterTokenRecords, getAllTokenRecords, removeTokenRecord } from './state.js';
import { getSelectedTokens, restoreTokenFromRecord } from './tokens.js';
import { getCurrentPageId, getGraphicToken, getTokenName } from './utils.js';

/**
 * Resets selected tokens to their original values and removes their state records.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {{ reset: string[], notTracked: string[] }} Result summary.
 */
export function resetSelectedTokens(msg) {
  const tokens = getSelectedTokens(msg);
  const reset = [];
  const notTracked = [];

  for (const token of tokens) {
    const record = removeTokenRecord(token.id);
    if (!record) {
      notTracked.push(getTokenName(token));
      continue;
    }
    restoreTokenFromRecord(token, record);
    reset.push(getTokenName(token));
  }

  return { reset, notTracked };
}

/**
 * Resets all tracked tokens across all pages.
 *
 * @returns {{ reset: number, missing: number }} Result summary.
 */
export function resetAllTokens() {
  const records = getAllTokenRecords();
  let reset = 0;
  let missing = 0;

  for (const record of records) {
    const token = getGraphicToken(record.tokenId);
    removeTokenRecord(record.tokenId);
    if (!token) {
      missing++;
      continue;
    }
    restoreTokenFromRecord(token, record);
    reset++;
  }

  return { reset, missing };
}

/**
 * Resets all tracked tokens on a page.
 *
 * @param {string} [pageId] Page to reset. Pass the commanding GM's page ID
 *   (via getPlayerPageId) to avoid the wrong-GM-page issue in multi-GM games.
 *   Defaults to the first GM's current page.
 * @returns {{ reset: number, missing: number }} Result summary.
 */
export function resetCurrentPageTokens(pageId) {
  const resolvedPageId = pageId || getCurrentPageId();
  const records = filterTokenRecords((r) => r.pageId === resolvedPageId);

  let reset = 0;
  let missing = 0;

  for (const record of records) {
    const token = getGraphicToken(record.tokenId);
    removeTokenRecord(record.tokenId);
    if (!token) {
      missing++;
      continue;
    }
    restoreTokenFromRecord(token, record);
    reset++;
  }

  return { reset, missing };
}
