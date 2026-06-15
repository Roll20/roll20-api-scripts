import {
  BOSS_PRESETS,
  COMMAND,
  DIRECTOR_CONFLICT_STATE_KEY,
  LEGACY_COMMAND,
  DECK_VIEW_KEYS,
  ENCOUNTER_NAME_RE,
  LAYER_GM,
  LAYER_MAP,
  LAYER_TOKEN,
  PARTY_PRESETS,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  VALID_AC_BARS,
  VALID_HP_BARS,
} from './constants.js';
import {
  hideSelectedTokens,
  moveSelectedToLayer,
  restoreSelectedPositions,
  revealSelectedTokens,
  saveSelectedPositions,
} from './battlefield.js';
import { applyBossPresetToSelected, isValidBossPreset, resolveBossPreset } from './bosses.js';
import {
  buildButton,
  buildDivider,
  buildRow,
  buildSectionLabel,
  buildSecondaryButton,
  whisper,
  whisperError,
  whisperWarning,
} from './chat.js';
import {
  deleteEncounterTemplate,
  listEncounterNames,
  loadEncounter,
  saveEncounter,
} from './encounters.js';
import { t, normalizeLocale, SUPPORTED_LOCALE_LIST } from './i18n.js';
import { installControlPanelHandout, installStatusHandout } from './journals.js';
import {
  clearStatusReport,
  refreshStatusReport,
  reportChangedTokens,
  reportSelectedTokens,
} from './reporting.js';
import {
  duplicateSelectedTokens,
  enumerateSelectedTokens,
  parseDuplicateCount,
} from './reinforcements.js';
import { resetAllTokens, resetCurrentPageTokens, resetSelectedTokens } from './reset.js';
import {
  applyScalingToSelected,
  isValidPartyPreset,
  parseAcModifier,
  parseDamagePercent,
  parseHpPercent,
  parsePartySize,
  resolvePartyPreset,
  resolvePartyPresetBySize,
} from './scaling.js';
import {
  getConfig,
  getDeckView,
  getLastReinforcementIds,
  setConfig,
  setDeckView,
  setLastReinforcementIds,
} from './state.js';
import { getSelectedTokens } from './tokens.js';
import { escapeHtml, formatMod, getGraphicToken, getPlayerPageId } from './utils.js';

// ---------------------------------------------------------------------------
// Pending scaling state (per-player session state — not persisted)
// ---------------------------------------------------------------------------

/** @type {Map<string, { hp: number, ac: number, damage: number }>} */
const pendingScaling = new Map();

/**
 * Returns the pending scaling profile for a player, defaulting to 100/0/100.
 *
 * @param {string} playerId Player ID.
 * @returns {{ hp: number, ac: number, damage: number }} Pending scaling.
 */
function getPendingScaling(playerId) {
  return pendingScaling.get(playerId) || { hp: 100, ac: 0, damage: 100 };
}

/**
 * Updates one or more fields in the pending scaling profile for a player.
 *
 * @param {string} playerId Player ID.
 * @param {object} updates Partial update ({ hp, ac, damage }).
 * @returns {{ hp: number, ac: number, damage: number }} Updated pending scaling.
 */
function updatePendingScaling(playerId, updates) {
  const current = getPendingScaling(playerId);
  const next = { ...current, ...updates };
  pendingScaling.set(playerId, next);
  return next;
}

/**
 * Returns the current locale for a player, from the persisted config.
 *
 * @returns {string} Locale code.
 */
function locale() {
  return getConfig().language;
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Handles incoming chat messages, routing !ced commands to sub-handlers.
 *
 * @param {object} msg Roll20 chat message object.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') {
    return;
  }

  const rawContent = msg.content || '';
  if (!rawContent.startsWith(COMMAND)) {
    return;
  }

  if (!playerIsGM(msg.playerid)) {
    return;
  }

  const args = rawContent.slice(COMMAND.length).trim().split(/\s+/).filter(Boolean);
  const playerId = msg.playerid;

  try {
    routeCommand(msg, args, playerId);
  } catch (error) {
    log(`[${SCRIPT_NAME}] Command error: ${error.message}`);
    whisperError(
      playerId,
      t('errors.unexpectedError', locale(), { message: error.message }),
      t('errors.unexpectedErrorHint', locale())
    );
  }
}

/**
 * Handles the legacy `!ced` command for backward compatibility with v1.0.0.
 *
 * If the Director script (the community mod that also uses `!ced`) is
 * detected via its state key, only a deprecation whisper is sent and the
 * command is NOT processed — the other mod will handle it.
 *
 * If the Director script is NOT installed, the command is forwarded to the
 * normal router so existing v1.0.0 macros continue to work.
 *
 * @param {object} msg Roll20 chat message object.
 * @returns {void}
 */
export function handleLegacyInput(msg) {
  if (msg.type !== 'api') {
    return;
  }

  const rawContent = msg.content || '';
  if (!rawContent.startsWith(LEGACY_COMMAND)) {
    return;
  }

  // Ignore if the message is actually the new !ced command (prefix overlap guard).
  if (rawContent.startsWith(COMMAND)) {
    return;
  }

  if (!playerIsGM(msg.playerid)) {
    return;
  }

  const playerId = msg.playerid;

  // Detect whether the Director community mod is also loaded by checking its
  // known state namespace.  We intentionally access the global `state` object
  // directly here because there is no Roll20 API to introspect other scripts.
  const directorConflict = globalThis.state?.[DIRECTOR_CONFLICT_STATE_KEY] !== undefined;

  if (directorConflict) {
    // Another mod owns !ced — just notify the GM and bail out.
    whisperWarning(
      playerId,
      `⚠️ Command Conflict Detected — Another script is using !ced. ` +
        `Please update your macros to use !ced to access Combat Encounter Director.`
    );
    return;
  }

  // No conflict — forward to the normal router as a transparent alias.
  const args = rawContent.slice(LEGACY_COMMAND.length).trim().split(/\s+/).filter(Boolean);

  try {
    routeCommand(msg, args, playerId);
  } catch (error) {
    log(`[${SCRIPT_NAME}] Legacy command error: ${error.message}`);
    whisperError(
      playerId,
      t('errors.unexpectedError', locale(), { message: error.message }),
      t('errors.unexpectedErrorHint', locale())
    );
  }
}

/**
 * Routes a parsed command to the appropriate handler.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Command arguments (subcommands and parameters).
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function routeCommand(msg, args, playerId) {
  const [sub, ...rest] = args;

  if (!sub) {
    showMainMenu(playerId);
    return;
  }

  switch (sub) {
    case 'scale':
      handleScale(msg, rest, playerId);
      break;
    case 'boss':
      handleBoss(msg, rest, playerId);
      break;
    case 'reinforce':
      handleReinforce(msg, rest, playerId);
      break;
    case 'layer':
      handleLayer(msg, rest, playerId);
      break;
    case 'hide':
      handleHide(msg, playerId);
      break;
    case 'reveal':
      handleReveal(msg, playerId);
      break;
    case 'position':
      handlePosition(msg, rest, playerId);
      break;
    case 'encounter':
      handleEncounter(msg, rest, playerId);
      break;
    case 'reset':
      handleReset(msg, rest, playerId);
      break;
    case 'report':
      handleReport(msg, rest, playerId);
      break;
    case 'deck':
      handleDeck(rest, playerId);
      break;
    case 'journal':
      handleJournal(rest, playerId);
      break;
    case 'config':
      handleConfig(rest, playerId);
      break;
    case 'help':
      showHelp(playerId);
      break;
    default:
      whisperError(
        playerId,
        t('errors.unknownCommand', locale(), { sub }),
        t('errors.unknownCommandHint', locale())
      );
  }
}

// ---------------------------------------------------------------------------
// Sub-handlers
// ---------------------------------------------------------------------------

/**
 * Handles !ced scale ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'scale'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleScale(msg, args, playerId) {
  const [action, value] = args;
  const lang = locale();
  const handlers = {
    preset: () => handleScalePreset(msg, playerId, lang, value),
    party: () => handleScaleParty(msg, playerId, lang, value),
    hp: () => handleScaleHp(msg, playerId, lang, value),
    ac: () => handleScaleAc(msg, playerId, lang, value),
    damage: () => handleScaleDamage(msg, playerId, lang, value),
    apply: () => handleScaleApply(msg, playerId, lang),
  };

  if (handlers[action]) {
    handlers[action]();
    return;
  }

  whisperError(
    playerId,
    t('errors.unknownScaleAction', lang, { action }),
    t('errors.scaleActionHint', lang)
  );
}

/**
 * Applies a named scaling preset to pending state and selected tokens.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {string} presetKey Party preset key.
 * @returns {void}
 */
function handleScalePreset(msg, playerId, lang, presetKey) {
  if (!isValidPartyPreset(presetKey)) {
    whisperError(
      playerId,
      t('errors.unknownPartyPreset', lang, { preset: presetKey }),
      t('errors.partyPresetHint', lang, { presets: Object.keys(PARTY_PRESETS).join(', ') })
    );
    return;
  }

  const preset = resolvePartyPreset(presetKey);
  updatePendingScaling(playerId, { hp: preset.hp, ac: preset.ac, damage: preset.damage });
  const tokens = getSelectedTokens(msg);

  if (tokens.length > 0) {
    const result = applyScalingToSelected(msg, preset, `preset:${presetKey}`);
    whisper(
      playerId,
      t('titles.scalingApplied', lang),
      [
        buildRow(t('labels.preset', lang), preset.label),
        buildRow(t('labels.hp', lang), `${preset.hp}%`),
        buildRow(t('labels.ac', lang), formatMod(preset.ac)),
        buildRow(t('labels.damage', lang), `${preset.damage}%`),
        buildDivider(),
        buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
      ].join('')
    );
    return;
  }

  whisper(
    playerId,
    t('titles.scalingPresetReady', lang),
    [
      buildRow(t('labels.hp', lang), `${preset.hp}%`),
      buildRow(t('labels.ac', lang), formatMod(preset.ac)),
      buildRow(t('labels.damage', lang), `${preset.damage}%`),
      buildDivider(),
      `<div style="font-size:0.85em">${escapeHtml(t('confirm.scalingPresetPending', lang))}</div>`,
      buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
    ].join('')
  );
}

/**
 * Resolves nearest preset by party size and applies/queues it.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {string} partySizeRaw Raw party-size argument.
 * @returns {void}
 */
function handleScaleParty(msg, playerId, lang, partySizeRaw) {
  const parsed = parsePartySize(partySizeRaw);
  if (!parsed.valid) {
    whisperError(
      playerId,
      t('errors.invalidPartySize', lang, { value: partySizeRaw }),
      `Example: ${COMMAND} scale party 6`
    );
    return;
  }

  const preset = resolvePartyPresetBySize(parsed.value);
  updatePendingScaling(playerId, { hp: preset.hp, ac: preset.ac, damage: preset.damage });
  const tokens = getSelectedTokens(msg);

  if (tokens.length > 0) {
    const result = applyScalingToSelected(msg, preset, `party:${parsed.value}`);
    whisper(
      playerId,
      t('titles.scalingApplied', lang),
      [
        buildRow(t('labels.nearestPreset', lang), preset.label),
        buildRow(t('labels.hp', lang), `${preset.hp}%`),
        buildRow(t('labels.ac', lang), formatMod(preset.ac)),
        buildRow(t('labels.damage', lang), `${preset.damage}%`),
        buildDivider(),
        buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
      ].join('')
    );
    return;
  }

  whisper(
    playerId,
    t('titles.partySize', lang, { size: parsed.value }),
    [
      buildRow(t('labels.nearestPreset', lang), preset.label),
      buildRow(t('labels.hp', lang), `${preset.hp}%`),
      buildRow(t('labels.ac', lang), formatMod(preset.ac)),
      buildRow(t('labels.damage', lang), `${preset.damage}%`),
      buildDivider(),
      `<div style="font-size:0.85em">${escapeHtml(t('confirm.scalingPresetPending', lang))}</div>`,
      buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
    ].join('')
  );
}

/**
 * Updates pending HP percentage and applies/queues scaling.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {string} hpRaw Raw HP percentage argument.
 * @returns {void}
 */
function handleScaleHp(msg, playerId, lang, hpRaw) {
  const parsed = parseHpPercent(hpRaw);
  if (!parsed.valid) {
    whisperError(
      playerId,
      t('errors.invalidHpPercent', lang, { value: hpRaw }),
      `Example: ${COMMAND} scale hp 150`
    );
    return;
  }

  const next = updatePendingScaling(playerId, { hp: parsed.value });
  reportScaleProfileUpdate(msg, playerId, lang, next, t('titles.hpUpdated', lang), 'scale:hp');
}

/**
 * Updates pending AC modifier and applies/queues scaling.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {string} acRaw Raw AC modifier argument.
 * @returns {void}
 */
function handleScaleAc(msg, playerId, lang, acRaw) {
  const parsed = parseAcModifier(acRaw);
  if (!parsed.valid) {
    whisperError(
      playerId,
      t('errors.invalidAcModifier', lang, { value: acRaw }),
      `Example: ${COMMAND} scale ac +2`
    );
    return;
  }

  const next = updatePendingScaling(playerId, { ac: parsed.value });
  reportScaleProfileUpdate(msg, playerId, lang, next, t('titles.acUpdated', lang), 'scale:ac');
}

/**
 * Updates pending damage percentage and applies/queues scaling.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {string} damageRaw Raw damage percentage argument.
 * @returns {void}
 */
function handleScaleDamage(msg, playerId, lang, damageRaw) {
  const parsed = parseDamagePercent(damageRaw);
  if (!parsed.valid) {
    whisperError(
      playerId,
      t('errors.invalidDamagePercent', lang, { value: damageRaw }),
      `Example: ${COMMAND} scale damage 125`
    );
    return;
  }

  const next = updatePendingScaling(playerId, { damage: parsed.value });
  reportScaleProfileUpdate(
    msg,
    playerId,
    lang,
    next,
    t('titles.damageUpdated', lang),
    'scale:damage'
  );
}

/**
 * Applies the player's pending scaling profile to selected tokens.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @returns {void}
 */
function handleScaleApply(msg, playerId, lang) {
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }

  const profile = getPendingScaling(playerId);
  const result = applyScalingToSelected(msg, profile, 'scale:apply');
  whisper(
    playerId,
    t('titles.scalingApplied', lang),
    [
      buildRow(t('labels.hp', lang), `${profile.hp}%`),
      buildRow(t('labels.ac', lang), formatMod(profile.ac)),
      buildRow(t('labels.damage', lang), `${profile.damage}%`),
      buildDivider(),
      buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
    ].join('')
  );
}

/**
 * Applies scaling immediately when tokens are selected, otherwise queues
 * the values and shows the pending profile card.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {{ hp: number, ac: number, damage: number }} profile Scaling profile.
 * @param {string} pendingTitle Card title used when no tokens are selected.
 * @param {string} operation Operation label stored in token records.
 * @returns {void}
 */
function reportScaleProfileUpdate(msg, playerId, lang, profile, pendingTitle, operation) {
  const tokens = getSelectedTokens(msg);
  if (tokens.length > 0) {
    const result = applyScalingToSelected(msg, profile, operation);
    whisper(
      playerId,
      t('titles.scalingApplied', lang),
      [
        buildRow(t('labels.hp', lang), `${profile.hp}%`),
        buildRow(t('labels.ac', lang), formatMod(profile.ac)),
        buildRow(t('labels.damage', lang), `${profile.damage}%`),
        buildDivider(),
        buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
      ].join('')
    );
    return;
  }

  whisper(
    playerId,
    pendingTitle,
    [
      buildRow(t('labels.hp', lang), `${profile.hp}%`),
      buildRow(t('labels.ac', lang), formatMod(profile.ac)),
      buildRow(t('labels.damage', lang), `${profile.damage}%`),
      buildDivider(),
      buildButton(t('ui.applyScalingButton', lang), `${COMMAND} scale apply`),
    ].join('')
  );
}

/**
 * Handles !ced boss ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'boss'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleBoss(msg, args, playerId) {
  const [presetKey] = args;
  const lang = locale();

  if (!presetKey) {
    whisperError(
      playerId,
      t('errors.missingBossPreset', lang),
      t('errors.missingBossPresetHint', lang, { presets: Object.keys(BOSS_PRESETS).join(', ') })
    );
    return;
  }

  if (!isValidBossPreset(presetKey)) {
    whisperError(
      playerId,
      t('errors.unknownBossPreset', lang, { preset: presetKey }),
      t('errors.unknownBossPresetHint', lang, { presets: Object.keys(BOSS_PRESETS).join(', ') })
    );
    return;
  }

  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }

  const result = applyBossPresetToSelected(msg, presetKey);
  const preset = resolveBossPreset(presetKey);

  whisper(
    playerId,
    t('titles.bossPreset', lang, { preset: preset.label }),
    [
      buildRow(
        t('labels.hp', lang),
        preset.hpMode === 'set' ? `Set to ${preset.hp}` : `${preset.hp}%`
      ),
      buildRow(t('labels.acModifier', lang), preset.ac >= 0 ? `+${preset.ac}` : String(preset.ac)),
      buildRow(t('labels.damage', lang), `${preset.damage}%`),
      buildDivider(),
      buildRow(t('labels.appliedTo', lang), `${result.applied.length}`),
    ].join('')
  );
}

/**
 * Handles !ced reinforce ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'reinforce'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleReinforce(msg, args, playerId) {
  const [action, value] = args;
  const lang = locale();
  const handlers = {
    duplicate: () => handleReinforceDuplicate(msg, playerId, lang, value),
    show: () => handleReinforceShow(playerId, lang),
    enumerate: () => handleReinforceEnumerate(msg, playerId, lang),
  };

  if (handlers[action]) {
    handlers[action]();
    return;
  }

  whisperError(
    playerId,
    t('errors.unknownReinforceAction', lang, { action }),
    t('errors.reinforceActionHint', lang)
  );
}

/**
 * Handles token duplication workflow for reinforce command.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @param {string} countRaw Raw duplicate count argument.
 * @returns {void}
 */
function handleReinforceDuplicate(msg, playerId, lang, countRaw) {
  const parsed = parseDuplicateCount(countRaw);
  if (!parsed.valid) {
    whisperError(
      playerId,
      t('errors.invalidDuplicateCount', lang, { value: countRaw }),
      `Example: ${COMMAND} reinforce duplicate 3`
    );
    return;
  }

  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }

  const result = duplicateSelectedTokens(msg, parsed.value);
  if (result.limitHit) {
    whisperError(
      playerId,
      t('errors.duplicateBurstLimit', lang, {
        requested: result.requested,
        limit: result.limit,
      })
    );
    return;
  }

  setLastReinforcementIds(result.createdIds);
  whisper(
    playerId,
    t('titles.reinforcementsCreated', lang),
    [
      buildRow(t('labels.copiesPerToken', lang), String(parsed.value)),
      buildRow(t('labels.totalCreated', lang), String(result.created)),
      buildDivider(),
      ...result.names.map((n) => `<div style="font-size:0.85em">• ${escapeHtml(n)}</div>`),
      result.created > 0
        ? buildButton(t('ui.revealReinforcements', lang), `${COMMAND} reinforce show`)
        : '',
      result.failedNames.length > 0
        ? [
            buildDivider(),
            buildRow(t('labels.duplicateFailed', lang), String(result.failedCount)),
            ...result.failedNames.map(
              (n) => `<div style="font-size:0.85em">• ${escapeHtml(n)}</div>`
            ),
            `<div style="font-size:0.8em;margin-top:4px;opacity:0.75">${escapeHtml(t('labels.duplicateFailedHint', lang))}</div>`,
          ].join('')
        : '',
    ].join('')
  );
}

/**
 * Reveals the most recently created reinforcement tokens.
 *
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @returns {void}
 */
function handleReinforceShow(playerId, lang) {
  const ids = getLastReinforcementIds();
  if (!ids.length) {
    whisperError(
      playerId,
      t('errors.noReinforcementsToReveal', lang),
      t('errors.noReinforcementsToRevealHint', lang)
    );
    return;
  }

  let moved = 0;
  for (const id of ids) {
    const token = getGraphicToken(id);
    if (token) {
      token.set('layer', 'objects');
      moved++;
    }
  }

  whisper(
    playerId,
    t('titles.tokensRevealed', lang),
    buildRow(t('labels.moved', lang), String(moved))
  );
}

/**
 * Enumerates selected token names for reinforcement numbering.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @param {string} lang Locale code.
 * @returns {void}
 */
function handleReinforceEnumerate(msg, playerId, lang) {
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }

  const result = enumerateSelectedTokens(msg);
  whisper(
    playerId,
    t('titles.tokensNumbered', lang),
    [
      buildRow(t('labels.renamed', lang), String(result.renamed.length)),
      buildDivider(),
      ...result.renamed.map((n) => `<div style="font-size:0.85em">• ${escapeHtml(n)}</div>`),
    ].join('')
  );
}

/**
 * Handles !ced layer ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'layer'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleLayer(msg, args, playerId) {
  const [layerArg] = args;
  const lang = locale();
  const layerMap = { token: LAYER_TOKEN, gm: LAYER_GM, map: LAYER_MAP };
  const layer = layerMap[layerArg];

  if (!layer) {
    whisperError(
      playerId,
      t('errors.unknownLayer', lang, { layer: layerArg }),
      t('errors.layerHint', lang)
    );
    return;
  }

  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }

  const result = moveSelectedToLayer(msg, layer);
  whisper(
    playerId,
    t('titles.layerChanged', lang),
    [
      buildRow(t('labels.layer', lang), layerArg),
      buildRow(t('labels.moved', lang), String(result.moved.length)),
    ].join('')
  );
}

/**
 * Handles !ced hide command.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleHide(msg, playerId) {
  const lang = locale();
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }
  const result = hideSelectedTokens(msg);
  whisper(
    playerId,
    t('titles.tokensHidden', lang),
    buildRow(t('labels.hidden', lang), String(result.hidden.length))
  );
}

/**
 * Handles !ced reveal command.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleReveal(msg, playerId) {
  const lang = locale();
  const tokens = getSelectedTokens(msg);
  if (tokens.length === 0) {
    whisperWarning(playerId, t('errors.noTokensSelected', lang));
    return;
  }
  const result = revealSelectedTokens(msg);
  whisper(
    playerId,
    t('titles.tokensRevealed', lang),
    buildRow(t('labels.revealed', lang), String(result.revealed.length))
  );
}

/**
 * Handles !ced position ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'position'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handlePosition(msg, args, playerId) {
  const [action] = args;
  const lang = locale();

  switch (action) {
    case 'save': {
      const tokens = getSelectedTokens(msg);
      if (tokens.length === 0) {
        whisperWarning(playerId, t('errors.noTokensSelected', lang));
        return;
      }
      const result = saveSelectedPositions(msg);
      whisper(
        playerId,
        t('titles.positionsSaved', lang),
        buildRow(t('labels.saved', lang), String(result.saved.length))
      );
      break;
    }

    case 'restore': {
      const tokens = getSelectedTokens(msg);
      if (tokens.length === 0) {
        whisperWarning(playerId, t('errors.noTokensSelected', lang));
        return;
      }
      const result = restoreSelectedPositions(msg);
      const parts = [buildRow(t('labels.restored', lang), String(result.restored.length))];
      if (result.noSave.length > 0) {
        parts.push(buildRow(t('labels.noSavedPosition', lang), String(result.noSave.length)));
      }
      whisper(playerId, t('titles.positionsRestored', lang), parts.join(''));
      break;
    }

    default:
      whisperError(
        playerId,
        t('errors.unknownPositionAction', lang, { action }),
        t('errors.positionActionHint', lang)
      );
  }
}

/**
 * Handles !ced encounter ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'encounter'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleEncounter(msg, args, playerId) {
  const [action, ...nameParts] = args;
  // Multi-word names (e.g. "My Encounter") are intentionally joined back from
  // the split args. Buttons in the encounter list emit the full name as trailing
  // arguments, and the command router splits on whitespace — joining here is the
  // correct inverse. ENCOUNTER_NAME_RE prevents characters that could cause
  // ambiguous splits or injection.
  const name = nameParts.join(' ');
  const lang = locale();

  // Validate name for operations that require one
  const nameRequired = action === 'save' || action === 'load' || action === 'delete';
  if (nameRequired) {
    if (!name) {
      whisperError(
        playerId,
        t('errors.encounterNameRequired', lang),
        t('errors.encounterNameRequiredHint', lang)
      );
      return;
    }
    if (!ENCOUNTER_NAME_RE.test(name)) {
      whisperError(
        playerId,
        t('errors.invalidEncounterName', lang, { name }),
        t('errors.invalidEncounterNameHint', lang)
      );
      return;
    }
  }

  switch (action) {
    case 'save': {
      const pageId = getPlayerPageId(playerId);
      const result = saveEncounter(name, pageId);
      whisper(
        playerId,
        t('titles.encounterSaved', lang),
        [
          buildRow(t('labels.name', lang), result.name),
          buildRow(t('labels.tokensCaptured', lang), String(result.tokenCount)),
        ].join('')
      );
      break;
    }

    case 'load': {
      const result = loadEncounter(name);
      if (result.notFound) {
        whisperError(
          playerId,
          t('errors.encounterNotFound', lang, { name }),
          t('errors.encounterNotFoundHint', lang)
        );
        return;
      }
      const parts = [
        buildRow(t('labels.loaded', lang), name),
        buildRow(t('labels.restored', lang), String(result.restored)),
      ];
      if (result.missing > 0) {
        parts.push(buildRow(t('labels.missingTokens', lang), String(result.missing)));
      }
      whisper(playerId, t('titles.encounterLoaded', lang), parts.join(''));
      break;
    }

    case 'delete': {
      const result = deleteEncounterTemplate(name);
      if (!result.deleted) {
        whisperError(
          playerId,
          t('errors.encounterNotFound', lang, { name }),
          t('errors.encounterNotFoundHint', lang)
        );
        return;
      }
      whisper(
        playerId,
        t('titles.encounterDeleted', lang),
        buildRow(t('labels.deleted', lang), result.name)
      );
      break;
    }

    case 'list': {
      const names = listEncounterNames();
      if (names.length === 0) {
        whisper(
          playerId,
          t('titles.savedEncounters', lang),
          `<div style="font-style:italic">${escapeHtml(t('labels.noEncountersSaved', lang))}</div>`
        );
        return;
      }
      const rows = names.map(
        (n) =>
          `<div>${escapeHtml(n)} ` +
          buildSecondaryButton(t('ui.load', lang), `${COMMAND} encounter load ${n}`) +
          ` ` +
          buildSecondaryButton(t('ui.delete', lang), `${COMMAND} encounter delete ${n}`) +
          `</div>`
      );
      whisper(playerId, t('titles.savedEncounters', lang), rows.join(''));
      break;
    }

    default:
      whisperError(
        playerId,
        t('errors.unknownEncounterAction', lang, { action }),
        t('errors.encounterActionHint', lang)
      );
  }
}

/**
 * Handles !ced reset ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'reset'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleReset(msg, args, playerId) {
  const [scope] = args;
  const lang = locale();

  switch (scope) {
    case 'selected': {
      const tokens = getSelectedTokens(msg);
      if (tokens.length === 0) {
        whisperWarning(playerId, t('errors.noTokensSelected', lang));
        return;
      }
      const result = resetSelectedTokens(msg);
      const parts = [buildRow(t('labels.reset', lang), String(result.reset.length))];
      if (result.notTracked.length > 0) {
        parts.push(buildRow(t('labels.notTracked', lang), String(result.notTracked.length)));
      }
      whisper(playerId, t('titles.tokensReset', lang), parts.join(''));
      break;
    }

    case 'page': {
      const result = resetCurrentPageTokens(getPlayerPageId(playerId));
      const parts = [buildRow(t('labels.reset', lang), String(result.reset))];
      if (result.missing > 0) {
        parts.push(buildRow(t('labels.missingTokens', lang), String(result.missing)));
      }
      whisper(playerId, t('titles.pageReset', lang), parts.join(''));
      break;
    }

    case 'all': {
      const result = resetAllTokens();
      const parts = [buildRow(t('labels.reset', lang), String(result.reset))];
      if (result.missing > 0) {
        parts.push(buildRow(t('labels.missingTokens', lang), String(result.missing)));
      }
      whisper(playerId, t('titles.allReset', lang), parts.join(''));
      break;
    }

    default:
      whisperError(
        playerId,
        t('errors.unknownResetScope', lang, { scope }),
        t('errors.resetScopeHint', lang)
      );
  }
}

/**
 * Handles !ced report ... commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {string[]} args Remaining arguments after 'report'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleReport(msg, args, playerId) {
  const [action] = args;
  const lang = locale();

  switch (action) {
    case 'refresh': {
      const result = refreshStatusReport(getPlayerPageId(playerId));
      whisper(
        playerId,
        t('titles.reportUpdated', lang),
        buildRow(t('labels.tokensInReport', lang), String(result.tokenCount))
      );
      break;
    }

    case 'selected': {
      const result = reportSelectedTokens(msg, getPlayerPageId(playerId));
      whisper(
        playerId,
        t('titles.reportUpdated', lang),
        buildRow(t('labels.selectedTokensInReport', lang), String(result.tokenCount))
      );
      break;
    }

    case 'changed': {
      const result = reportChangedTokens(getPlayerPageId(playerId));
      whisper(
        playerId,
        t('titles.reportUpdated', lang),
        buildRow(t('labels.changedTokensInReport', lang), String(result.tokenCount))
      );
      break;
    }

    case 'clear': {
      clearStatusReport();
      whisper(
        playerId,
        t('titles.reportCleared', lang),
        escapeHtml(t('confirm.reportCleared', lang))
      );
      break;
    }

    default:
      whisperError(
        playerId,
        t('errors.unknownReportAction', lang, { action }),
        t('errors.reportActionHint', lang)
      );
  }
}

/**
 * Handles !ced journal ... commands.
 *
 * @param {string[]} args Remaining arguments after 'journal'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
/**
 * Handles !ced deck [view] commands.
 * Rebuilds the Command Deck journal in the specified or stored view.
 *
 * @param {string[]} args Remaining arguments after 'deck'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleDeck(args, playerId) {
  const [viewArg] = args;
  const lang = locale();

  let view;
  if (!viewArg) {
    // No argument: use the stored view (falls back to default via getDeckView).
    view = getDeckView();
  } else if (DECK_VIEW_KEYS.includes(viewArg)) {
    view = viewArg;
  } else {
    whisperError(
      playerId,
      t('errors.unknownDeckView', lang, { view: viewArg }),
      t('errors.deckViewHint', lang)
    );
    return;
  }

  setDeckView(view);
  installControlPanelHandout(view);
  whisper(
    playerId,
    t('titles.deckUpdated', lang),
    escapeHtml(t('confirm.deckUpdated', lang, { view }))
  );
}

function handleJournal(args, playerId) {
  const [action] = args;
  const lang = locale();

  if (action === 'rebuild') {
    installControlPanelHandout(getDeckView());
    installStatusHandout();
    whisper(
      playerId,
      t('titles.journalsRebuilt', lang),
      escapeHtml(t('confirm.journalsRebuilt', lang))
    );
  } else {
    whisperError(
      playerId,
      t('errors.unknownJournalAction', lang, { action }),
      t('errors.journalActionHint', lang)
    );
  }
}

/**
 * Handles !ced config ... commands.
 *
 * @param {string[]} args Remaining arguments after 'config'.
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
function handleConfig(args, playerId) {
  const [key, value] = args;
  const lang = locale();

  switch (key) {
    case 'hp-bar': {
      if (!VALID_HP_BARS.includes(value)) {
        whisperError(
          playerId,
          t('errors.invalidHpBar', lang, { value }),
          t('errors.invalidHpBarHint', lang, { options: VALID_HP_BARS.join(', ') })
        );
        return;
      }
      setConfig({ hpBar: value });
      whisper(playerId, t('titles.configUpdated', lang), buildRow(t('labels.hpBar', lang), value));
      break;
    }

    case 'ac-bar': {
      if (!VALID_AC_BARS.includes(value)) {
        whisperError(
          playerId,
          t('errors.invalidAcBar', lang, { value }),
          t('errors.invalidAcBarHint', lang, { options: VALID_AC_BARS.join(', ') })
        );
        return;
      }
      setConfig({ acBar: value });
      whisper(playerId, t('titles.configUpdated', lang), buildRow(t('labels.acBar', lang), value));
      break;
    }

    case 'language': {
      const normalized = normalizeLocale(value);
      if (!normalized) {
        whisperError(
          playerId,
          t('errors.invalidLanguage', lang, { value }),
          t('errors.invalidLanguageHint', lang, { locales: SUPPORTED_LOCALE_LIST })
        );
        return;
      }
      setConfig({ language: normalized });
      // Use the NEW language for the confirmation so the GM sees it's working.
      whisper(
        playerId,
        t('titles.configUpdated', normalized),
        buildRow(t('labels.language', normalized), normalized)
      );
      break;
    }

    case undefined:
    case '': {
      const config = getConfig();
      whisper(
        playerId,
        t('titles.currentConfig', lang),
        [
          buildRow(t('labels.hpBar', lang), config.hpBar),
          buildRow(t('labels.acBar', lang), config.acBar),
          buildRow(t('labels.language', lang), config.language),
          buildDivider(),
          buildSecondaryButton(t('ui.setHpBar1', lang), `${COMMAND} config hp-bar bar1`),
          buildSecondaryButton(t('ui.setHpBar2', lang), `${COMMAND} config hp-bar bar2`),
          buildDivider(),
          buildSecondaryButton(t('ui.setAcBar2', lang), `${COMMAND} config ac-bar bar2`),
          buildSecondaryButton(t('ui.disableAc', lang), `${COMMAND} config ac-bar none`),
        ].join('')
      );
      break;
    }

    default:
      whisperError(
        playerId,
        t('errors.unknownConfigKey', lang, { key }),
        t('errors.configKeyHint', lang)
      );
  }
}

// ---------------------------------------------------------------------------
// Menus
// ---------------------------------------------------------------------------

/**
 * Whispers the main quick-action menu to a GM player.
 *
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
export function showMainMenu(playerId) {
  const lang = locale();
  whisper(
    playerId,
    SCRIPT_NAME,
    [
      `<div style="font-size:0.85em;margin-bottom:4px">v${escapeHtml(SCRIPT_VERSION)} — Open the <strong>${escapeHtml(SCRIPT_NAME)}</strong> journal for the full control panel.</div>`,
      buildDivider(),
      buildSectionLabel(t('ui.quickActions', lang)),
      buildButton('Standard Party (4)', `${COMMAND} scale preset standard`),
      buildButton('Boss', `${COMMAND} boss boss`),
      buildButton('Elite', `${COMMAND} boss elite`),
      buildButton('Minion', `${COMMAND} boss minion`),
      buildDivider(),
      buildButton(t('ui.resetSelected', lang), `${COMMAND} reset selected`),
      buildButton(t('ui.refreshReport', lang), `${COMMAND} report refresh`),
      buildDivider(),
      buildSecondaryButton(t('ui.help', lang), `${COMMAND} help`),
      buildSecondaryButton(t('ui.config', lang), `${COMMAND} config`),
    ].join('')
  );
}

/**
 * Whispers the help reference card to a GM player.
 *
 * @param {string} playerId GM player ID.
 * @returns {void}
 */
export function showHelp(playerId) {
  const lang = locale();
  const cmds = [
    ['Scale by preset', `${COMMAND} scale preset standard`],
    ['Scale by party size', `${COMMAND} scale party 6`],
    ['Set HP %', `${COMMAND} scale hp 150`],
    ['Set AC modifier', `${COMMAND} scale ac +2`],
    ['Set Damage %', `${COMMAND} scale damage 125`],
    ['Apply pending scaling', `${COMMAND} scale apply`],
    ['Boss preset', `${COMMAND} boss boss`],
    ['Elite / Minion', `${COMMAND} boss elite`],
    ['Legendary', `${COMMAND} boss legendary`],
    ['Duplicate tokens', `${COMMAND} reinforce duplicate 3`],
    ['Auto-number tokens', `${COMMAND} reinforce enumerate`],
    ['Move to GM layer', `${COMMAND} layer gm`],
    ['Move to token layer', `${COMMAND} layer token`],
    ['Hide selected', `${COMMAND} hide`],
    ['Reveal selected', `${COMMAND} reveal`],
    ['Save positions', `${COMMAND} position save`],
    ['Restore positions', `${COMMAND} position restore`],
    ['Save encounter', `${COMMAND} encounter save name`],
    ['Load encounter', `${COMMAND} encounter load name`],
    ['List encounters', `${COMMAND} encounter list`],
    ['Reset selected', `${COMMAND} reset selected`],
    ['Reset page', `${COMMAND} reset page`],
    ['Reset all', `${COMMAND} reset all`],
    ['Report refresh', `${COMMAND} report refresh`],
    ['Report changed', `${COMMAND} report changed`],
    ['Config', `${COMMAND} config`],
    ['Set language', `${COMMAND} config language fr`],
    ['Rebuild journals', `${COMMAND} journal rebuild`],
  ];

  const rows = cmds.map(
    ([label, cmd]) =>
      `<div style="display:flex;justify-content:space-between;padding:1px 0;font-size:0.8em">` +
      `<span>${escapeHtml(label)}</span>` +
      `<code style="font-size:0.9em">${escapeHtml(cmd)}</code>` +
      `</div>`
  );

  whisper(playerId, t('titles.help', lang, { name: SCRIPT_NAME }), rows.join(''));
}
