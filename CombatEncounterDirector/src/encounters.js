import {
  createTokenRecord,
  deleteEncounter,
  getAllEncounters,
  getEncounter,
  getTokenRecord,
  setEncounter,
  setTokenRecord,
} from './state.js';
import { captureOriginalValues } from './tokens.js';
import {
  getCurrentPageId,
  getGraphicToken,
  getTokenPageId,
  getTokensOnPage,
  readBarSafe,
} from './utils.js';
import { getConfig } from './state.js';

// ---------------------------------------------------------------------------
// Bar snapshot helpers
//
// Encounters save/restore only the bars this mod manages (configured HP bar
// and configured AC bar). Writing to an unmanaged bar — even writing 0 —
// activates it in the Roll20 token HUD. To prevent that:
//
//   • snapshots store null for blank/absent bar values
//   • loadEncounter skips writing any null or undefined snapshot value
//   • loadEncounter only touches configured bars, never bar3 (or whichever
//     bar is not assigned to HP or AC in the current config)
// ---------------------------------------------------------------------------

/**
 * Reads a token bar value for snapshotting.
 * Returns null when the bar is blank so that loadEncounter can skip the write.
 *
 * @param {Graphic} token Roll20 Graphic object.
 * @param {string} barName e.g. 'bar1'.
 * @param {string} field 'value' or 'max'.
 * @returns {number|null}
 */
function snapshotBar(token, barName, field) {
  const result = readBarSafe(token.get(`${barName}_${field}`));
  return result.valid ? result.value : null;
}

/**
 * Saves the current state of all tokens on the given page as an encounter template.
 *
 * Only the configured HP bar and AC bar are snapshotted. Unmanaged bars are not
 * stored, so they are never restored on load and therefore never activated.
 *
 * @param {string} name Encounter template name.
 * @param {string} [pageId] Page to snapshot. Defaults to the first GM's current page.
 * @returns {{ saved: boolean, tokenCount: number, name: string }} Result summary.
 */
export function saveEncounter(name, pageId) {
  const resolvedPageId = pageId || getCurrentPageId();
  const allTokens = getTokensOnPage(resolvedPageId);
  const { hpBar, acBar } = getConfig();

  const tokenSnapshots = allTokens.map((token) => {
    const record = getTokenRecord(token.id);

    // Only snapshot the bars this mod manages. null = bar was blank.
    const snapshot = {
      tokenId: token.id,
      name: token.get('name') || '',
      layer: token.get('layer') || 'objects',
      left: token.get('left') || 0,
      top: token.get('top') || 0,
      imgsrc: token.get('imgsrc') || '',
      hpBar,
      acBar,
      [`${hpBar}_value`]: snapshotBar(token, hpBar, 'value'),
      [`${hpBar}_max`]: snapshotBar(token, hpBar, 'max'),
      hpModifier: record?.hpModifier ?? 100,
      acModifier: record?.acModifier ?? 0,
      damageModifier: record?.damageModifier ?? 100,
      preset: record?.preset ?? null,
      original: record?.original ?? captureOriginalValues(token),
    };

    if (acBar !== 'none') {
      snapshot[`${acBar}_value`] = snapshotBar(token, acBar, 'value');
    }

    return snapshot;
  });

  const template = {
    name,
    pageId: resolvedPageId,
    savedAt: Date.now(),
    tokens: tokenSnapshots,
  };

  setEncounter(name, template);
  return { saved: true, tokenCount: tokenSnapshots.length, name };
}

/**
 * Loads a named encounter template, restoring token positions, layers, and stats.
 *
 * Only tokens that still exist on the page by their original Roll20 ID are restored.
 * Missing tokens are counted in the result but are NOT recreated — encounter load is
 * a state-restore operation, not a token-creation operation.
 *
 * Bar restoration rules:
 *   - Only the bars configured as HP and AC at save time are ever touched.
 *   - Null values (bars that were blank when saved) are not written — writing null
 *     or 0 to a blank bar would activate it and make it visible in the token HUD.
 *   - For snapshots saved with the old format (flat bar1/2/3 keys), only the
 *     configured bars from the current config are restored; others are skipped.
 *
 * @param {string} name Encounter template name.
 * @returns {{ loaded: boolean, restored: number, missing: number, notFound: boolean }} Result summary.
 */
export function loadEncounter(name) {
  const template = getEncounter(name);
  if (!template) {
    return { loaded: false, restored: 0, missing: 0, notFound: true };
  }

  const { hpBar: currentHpBar, acBar: currentAcBar } = getConfig();

  let restored = 0;
  let missing = 0;

  for (const snapshot of template.tokens) {
    const token = getGraphicToken(snapshot.tokenId);
    if (!token) {
      missing++;
      continue;
    }

    // Restore position and layer — these are safe, no bar activation risk.
    token.set('name', snapshot.name);
    token.set('layer', snapshot.layer);
    token.set('left', snapshot.left);
    token.set('top', snapshot.top);

    // Determine which bar names were used as HP/AC at save time.
    // Fall back to current config for snapshots saved before hpBar/acBar were recorded.
    const savedHpBar = snapshot.hpBar || currentHpBar;
    const savedAcBar = snapshot.acBar || currentAcBar;

    // Restore HP bar — value and max are written as an atomic pair.
    // Writing _max without _value (or vice versa) is enough to activate a
    // previously-blank bar in the Roll20 token HUD. Both must be non-null to
    // write either. Only restores when the snapshot used the current HP bar.
    if (savedHpBar === currentHpBar) {
      const hpValue = snapshot[`${savedHpBar}_value`];
      const hpMax = snapshot[`${savedHpBar}_max`];
      if (hpValue !== null && hpValue !== undefined && hpMax !== null && hpMax !== undefined) {
        token.set(`${savedHpBar}_value`, hpValue);
        token.set(`${savedHpBar}_max`, hpMax);
      }
    }

    // Restore AC bar (value only — AC bars have no meaningful max).
    // Skipped when the AC value was null (bar was blank when saved).
    if (savedAcBar !== 'none' && savedAcBar === currentAcBar) {
      const acValue = snapshot[`${savedAcBar}_value`];
      if (acValue !== null && acValue !== undefined) {
        token.set(`${savedAcBar}_value`, acValue);
      }
    }

    // Restore the state record.
    const tokenPageId = getTokenPageId(token);
    const record = createTokenRecord(snapshot.tokenId, snapshot.original, tokenPageId);
    record.hpModifier = snapshot.hpModifier;
    record.acModifier = snapshot.acModifier;
    record.damageModifier = snapshot.damageModifier;
    record.preset = snapshot.preset;
    record.lastOperation = `encounter:load:${name}`;
    record.lastModified = Date.now();
    setTokenRecord(snapshot.tokenId, record);

    restored++;
  }

  return { loaded: true, restored, missing, notFound: false };
}

/**
 * Deletes a named encounter template.
 *
 * @param {string} name Encounter template name.
 * @returns {{ deleted: boolean, name: string }} Result summary.
 */
export function deleteEncounterTemplate(name) {
  const deleted = deleteEncounter(name);
  return { deleted, name };
}

/**
 * Returns all saved encounter template names.
 *
 * @returns {string[]} Template names sorted alphabetically.
 */
export function listEncounterNames() {
  return getAllEncounters()
    .map((e) => e.name)
    .sort();
}
