import {
  COMMAND,
  COLOR_BG_SOFT_BLACK,
  COLOR_HEADER_DARK,
  COLOR_HEADER_LIGHT,
  DURATION_UNTIL_REMOVED,
  SAVED_SNOOZE_COMBAT,
  SAVED_SNOOZE_ROUNDS,
  SAVED_SNOOZE_TURN,
  SAVED_VISIBILITY_GM,
  SAVED_VISIBILITY_MASKED,
  SAVED_VISIBILITY_PUBLIC,
  VALID_SAVED_VISIBILITIES,
  VALID_SNOOZE_SCOPES,
} from './constants.js';
import {
  addSavedEffect,
  createSavedEffect,
  findSavedEffect,
  getSavedEffectsForToken,
  removeSavedEffect,
  updateSavedEffect,
} from './savedEffects.js';
import {
  buildButton,
  htmlTable,
  rawHtml,
  whisper,
  whisperError,
  whisperGms,
  whisperWarning,
} from './chat.js';
import { t } from './i18n.js';
import {
  createId,
  escapeHtml,
  getGraphicToken,
  getGmPlayerIds,
  getTokenName,
  toText,
} from './utils.js';
import { addActiveCondition, getConfig } from './state.js';
import { isCustomTextCondition } from './conditions.js';
import { getSystemProfile } from './systems/index.js';
import { applyMarker } from './markers.js';
import { insertConditionRow } from './turnOrder.js';

const SECTION_HEADING_STYLE = [
  `background:${COLOR_HEADER_LIGHT}`,
  `color:${COLOR_HEADER_DARK}`,
  `border-left:4px solid ${COLOR_BG_SOFT_BLACK}`,
  `border-bottom:1px solid ${COLOR_BG_SOFT_BLACK}`,
  `box-shadow:inset 0 -1px 0 ${COLOR_BG_SOFT_BLACK}`,
  `text-transform:uppercase`,
  `letter-spacing:0.06em`,
  `font-size:11px`,
  `font-weight:bold`,
  `padding:3px 6px`,
  `margin:2px 0`,
].join(';');

/**
 * Builds an in-card section heading.
 *
 * @param {string} text Heading text.
 * @returns {object} Trusted HTML line.
 */
function heading(text) {
  return rawHtml(`<div style="${SECTION_HEADING_STYLE}">${escapeHtml(text)}</div>`);
}

/**
 * Wraps text in chat-safe code tags.
 *
 * @param {string} text Text to render as code.
 * @returns {string} HTML fragment.
 */
function code(text) {
  return `<code>${escapeHtml(text)}</code>`;
}

/**
 * Builds a Roll20 command string with the script prefix.
 *
 * @param {string[]} parts Parts after the base command.
 * @returns {string} Joined command string.
 */
function buildCmd(parts) {
  return [COMMAND, ...parts].join(' ');
}

/**
 * Parses the --saved argument value into subcommand and id parts.
 *
 * The parser collapses all tokens after --saved up to the next flag into a
 * single string, so "edit ct_abc123" arrives as one value.
 *
 * @param {string|true} savedValue Raw value of args.saved.
 * @returns {{ sub: string, id: string }} Subcommand name and optional id.
 */
function parseSavedSub(savedValue) {
  if (savedValue === true || !savedValue) return { sub: 'view', id: '' };
  const parts = toText(savedValue).split(/\s+/);
  return { sub: parts[0] || 'view', id: parts.slice(1).join(' ') };
}

/**
 * Returns the localised label for a visibility mode.
 *
 * @param {string} visibility Visibility mode key.
 * @param {string} locale Locale code.
 * @returns {string} Localised label.
 */
function visibilityLabel(visibility, locale) {
  const key = `ui.saved.visibility.${visibility}`;
  return t(key, locale);
}

/**
 * Returns the localised badge string for a visibility mode, e.g. "[GM Only]".
 *
 * @param {string} visibility Visibility mode key.
 * @param {string} locale Locale code.
 * @returns {string} Badge text.
 */
function visibilityBadge(visibility, locale) {
  return `[${visibilityLabel(visibility, locale)}]`;
}

/**
 * Builds the display label for a saved effect shown to the GM.
 *
 * @param {SavedEffect} effect Saved-effect record.
 * @returns {string} Effect label for GM display.
 */
function effectGmLabel(effect) {
  return effect.gmLabel || effect.other || effect.condition;
}

/**
 * Builds the public label for a saved effect (what players see in the Turn Tracker).
 *
 * @param {SavedEffect} effect Saved-effect record.
 * @returns {string} Effect label for public display.
 */
function effectPublicLabel(effect) {
  if (effect.visibility === SAVED_VISIBILITY_MASKED && effect.publicLabel) {
    return effect.publicLabel;
  }
  return effectGmLabel(effect);
}

// ---------------------------------------------------------------------------
// Main dispatcher
// ---------------------------------------------------------------------------

/**
 * Routes a --saved command to the correct handler.
 *
 * @param {object} msg Roll20 chat message.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
export function handleSaved(msg, args) {
  const { sub, id } = parseSavedSub(args.saved);
  const playerId = msg.playerid;
  const locale = getConfig().language;

  switch (sub) {
    case 'add':
      handleSavedAdd(playerId, msg, args);
      return;

    case 'edit': {
      if (!id) {
        whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
        return;
      }
      handleSavedEdit(playerId, id, args);
      return;
    }

    case 'remove': {
      if (!id) {
        whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
        return;
      }
      executeSavedRemove(playerId, id);
      return;
    }

    case 'promote': {
      if (!id) {
        whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
        return;
      }
      const visibility = toText(args.visibility);
      if (visibility && VALID_SAVED_VISIBILITIES.has(visibility)) {
        executeSavedPromote(playerId, id, visibility, args);
      } else {
        showSavedPromoteMenu(playerId, id);
      }
      return;
    }

    case 'snooze': {
      if (!id) {
        whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
        return;
      }
      const scope = toText(args.scope);
      if (scope && VALID_SNOOZE_SCOPES.has(scope)) {
        const count = Number(toText(args.rounds)) || 0;
        executeSavedSnooze(playerId, id, scope, count, getTurnKeyFromArgs(args));
      } else {
        showSavedSnoozeMenu(playerId, id);
      }
      return;
    }

    case 'snooze-clear': {
      if (!id) {
        whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
        return;
      }
      executeSnoozeClear(playerId, id);
      return;
    }

    case 'view':
    default:
      showSavedMenuForMessage(playerId, msg);
  }
}

/**
 * Returns the turn key embedded in args, or an empty string when absent.
 *
 * @param {object} args Parsed command arguments.
 * @returns {string} Turn key.
 */
function getTurnKeyFromArgs(args) {
  return toText(args['turn-key']);
}

// ---------------------------------------------------------------------------
// View: list saved effects for the selected token
// ---------------------------------------------------------------------------

/**
 * Shows the saved-effects menu for the token selected in the GM's message.
 *
 * Falls back to a prompt when no token is selected or provided via --token.
 *
 * @param {string} playerId GM player id.
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
function showSavedMenuForMessage(playerId, msg) {
  const locale = getConfig().language;
  const tokenId = resolveTargetToken(msg);
  if (!tokenId) {
    whisperWarning(playerId, t('ui.msg.noTokenSelectedSaved', locale));
    return;
  }
  const token = getGraphicToken(tokenId);
  const tokenName = token ? getTokenName(token) : tokenId;
  showSavedMenu(playerId, tokenId, tokenName);
}

/**
 * Resolves the target token id from selected tokens or from --token arg.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {string} Token id or empty string.
 */
function resolveTargetToken(msg) {
  const selected = Array.isArray(msg.selected) ? msg.selected : [];
  if (selected.length > 0) {
    return toText(selected[0]._id) || '';
  }
  return toText(msg._args?.token || '');
}

/**
 * Whispers a GM card listing saved effects for a token with action buttons.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @param {string} tokenName Token display name.
 * @returns {void}
 */
export function showSavedMenu(playerId, tokenId, tokenName) {
  const locale = getConfig().language;
  const effects = getSavedEffectsForToken(tokenId);
  const addCmd = buildCmd([`--saved add --token ${tokenId}`]);

  const body = [
    heading(t('ui.heading.savedEffectsFor', locale, { name: tokenName })),
    buildButton(t('ui.btn.addSavedEffect', locale), addCmd),
  ];

  if (effects.length === 0) {
    body.push(t('ui.msg.noSavedEffects', locale, { name: tokenName }));
  } else {
    for (const effect of effects) {
      body.push(rawHtml('<br>'));
      body.push(...buildEffectCard(effect, locale));
    }
  }

  whisper(playerId, t('ui.title.savedEffects', locale), body);
}

/**
 * Builds the card lines for a single saved effect with action buttons.
 *
 * @param {SavedEffect} effect Saved-effect record.
 * @param {string} locale Locale code.
 * @returns {(string|object)[]} Body lines.
 */
function buildEffectCard(effect, locale) {
  const label = effectGmLabel(effect);
  const badge = visibilityBadge(effect.visibility, locale);
  const snoozeInfo = effect.snooze ? ` (${t('ui.saved.snoozed', locale)})` : '';
  const titleLine = rawHtml(
    `<strong>${escapeHtml(label)}</strong> <em>${escapeHtml(badge)}${escapeHtml(snoozeInfo)}</em>`
  );

  const editCmd = buildCmd([`--saved edit ${effect.id}`]);
  const removeCmd = buildCmd([`--saved remove ${effect.id}`]);
  const promoteCmd = buildCmd([`--saved promote ${effect.id}`]);
  const snoozeCmd = buildCmd([`--saved snooze ${effect.id}`]);

  const buttons = rawHtml(
    [
      buildButton(t('ui.btn.promoteSaved', locale), promoteCmd).__trustedHtml,
      buildButton(t('ui.btn.editSaved', locale), editCmd).__trustedHtml,
      buildButton(t('ui.btn.removeSaved', locale), removeCmd).__trustedHtml,
      buildButton(t('ui.btn.snoozeSaved', locale), snoozeCmd).__trustedHtml,
    ].join(' ')
  );

  return [titleLine, buttons];
}

// ---------------------------------------------------------------------------
// Add: wizard to create a new saved effect
// ---------------------------------------------------------------------------

/**
 * Entry point for the --saved add wizard.
 *
 * If a condition is already provided advances to the visibility step;
 * otherwise shows the condition picker.
 *
 * @param {string} playerId GM player id.
 * @param {object} msg Roll20 chat message.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
function handleSavedAdd(playerId, msg, args) {
  const locale = getConfig().language;

  // Resolve target token: prefer --token arg, then selected token
  const tokenIdFromArg = toText(args.token);
  const tokenId =
    tokenIdFromArg ||
    (Array.isArray(msg.selected) && msg.selected.length > 0 ? toText(msg.selected[0]._id) : '');

  if (!tokenId) {
    whisperWarning(playerId, t('ui.msg.noTokenSelectedSaved', locale));
    return;
  }

  const conditionRaw = toText(args.condition);

  // All fields supplied — persist the effect
  if (conditionRaw && (toText(args.visibility) || toText(args.other) || toText(args['gm-label']))) {
    executeSavedAdd(playerId, args, tokenId);
    return;
  }

  // Condition known but labels/visibility not yet collected
  if (conditionRaw) {
    showSavedAddDetailsStep(playerId, tokenId, conditionRaw, locale);
    return;
  }

  // Step 1: condition picker
  showSavedConditionStep(playerId, tokenId, locale);
}

/**
 * Whispers the condition picker for the add-saved wizard.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @param {string} locale Locale code.
 * @returns {void}
 */
function showSavedConditionStep(playerId, tokenId, locale) {
  const config = getConfig();
  const profile = getSystemProfile(config.gameSystem);

  const standardButtons = profile.STANDARD_CONDITIONS.map((c) =>
    buildButton(c, buildCmd([`--saved add --token ${tokenId} --condition ${c}`]))
  );

  const customButtons = profile.CUSTOM_EFFECT_TYPES.map((c) =>
    buildButton(c, buildCmd([`--saved add --token ${tokenId} --condition ${c}`]))
  );

  const tableRows = buildTwoColumnRows(standardButtons, customButtons);

  whisper(playerId, t('ui.title.savedAdd', locale), [
    htmlTable([t('ui.col.conditions', locale), t('ui.col.customEffects', locale)], tableRows),
  ]);
}

/**
 * Whispers visibility buttons, each embedding appropriate query prompts for
 * the GM to fill in labels and effect text.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @param {string} condition Canonical condition.
 * @param {string} locale Locale code.
 * @returns {void}
 */
function showSavedAddDetailsStep(playerId, tokenId, condition, locale) {
  const needsText = isCustomTextCondition(condition);

  const otherPart = needsText
    ? `--other ?{${t('ui.saved.prompt.enterGmLabel', locale)}|}`
    : `--other ""`;

  const publicCmd = buildCmd([
    `--saved add --token ${tokenId}`,
    `--condition ${condition}`,
    `--visibility public`,
    otherPart,
    `--gm-label ?{${t('ui.saved.prompt.enterGmLabel', locale)}|}`,
  ]);

  const maskedCmd = buildCmd([
    `--saved add --token ${tokenId}`,
    `--condition ${condition}`,
    `--visibility masked`,
    otherPart,
    `--gm-label ?{${t('ui.saved.prompt.enterGmLabel', locale)}|}`,
    `--public-label ?{${t('ui.saved.prompt.enterPublicLabel', locale)}|}`,
  ]);

  const gmCmd = buildCmd([
    `--saved add --token ${tokenId}`,
    `--condition ${condition}`,
    `--visibility gm`,
    otherPart,
    `--gm-label ?{${t('ui.saved.prompt.enterGmLabel', locale)}|}`,
  ]);

  whisper(playerId, t('ui.title.savedAdd', locale), [
    heading(t('ui.heading.visibility', locale)),
    buildButton(
      `${t('ui.saved.visibility.public', locale)} — ${t('ui.msg.visibilityPublicHint', locale)}`,
      publicCmd
    ),
    buildButton(
      `${t('ui.saved.visibility.masked', locale)} — ${t('ui.msg.visibilityMaskedHint', locale)}`,
      maskedCmd
    ),
    buildButton(
      `${t('ui.saved.visibility.gm', locale)} — ${t('ui.msg.visibilityGmHint', locale)}`,
      gmCmd
    ),
  ]);
}

/**
 * Persists a new saved effect from fully-resolved --saved add arguments.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @param {string} tokenId Target token id.
 * @returns {void}
 */
function executeSavedAdd(playerId, args, tokenId) {
  const locale = getConfig().language;
  const condition = toText(args.condition);

  if (!condition) {
    whisperWarning(playerId, t('ui.msg.savedConditionRequired', locale));
    return;
  }

  const visibility = toText(args.visibility) || SAVED_VISIBILITY_GM;
  if (!VALID_SAVED_VISIBILITIES.has(visibility)) {
    whisperWarning(playerId, t('ui.msg.savedInvalidVisibility', locale));
    return;
  }

  const other = toText(args.other);
  const gmLabel = toText(args['gm-label']) || other || condition;
  const publicLabel = toText(args['public-label']) || gmLabel;

  const token = getGraphicToken(tokenId);
  const targetCharacterId = token ? toText(token.get('represents')) : '';

  const sourceTokenId = toText(args.source);
  const sourceToken = sourceTokenId ? getGraphicToken(sourceTokenId) : null;
  const sourceCharacterId = sourceToken ? toText(sourceToken.get('represents')) : '';

  const effect = createSavedEffect({
    visibility,
    condition,
    other,
    targetTokenId: tokenId,
    targetCharacterId,
    sourceTokenId,
    sourceCharacterId,
    gmLabel,
    publicLabel,
    duration: { type: DURATION_UNTIL_REMOVED },
  });

  addSavedEffect(effect);

  const tokenName = token ? getTokenName(token) : tokenId;
  whisper(
    playerId,
    t('ui.title.savedEffects', locale),
    t('ui.msg.savedEffectAdded', locale, { name: tokenName })
  );
}

// ---------------------------------------------------------------------------
// Edit
// ---------------------------------------------------------------------------

/**
 * Shows an edit menu for an existing saved effect.
 *
 * When update args are present (e.g. --gm-label, --public-label, --visibility)
 * applies them immediately instead of showing the menu.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
function handleSavedEdit(playerId, effectId, args) {
  const locale = getConfig().language;
  const effect = findSavedEffect(effectId);
  if (!effect) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }

  const hasUpdate =
    args['gm-label'] !== undefined ||
    args['public-label'] !== undefined ||
    args.visibility !== undefined ||
    args.other !== undefined;

  if (hasUpdate) {
    const updates = {};
    if (args['gm-label'] !== undefined) updates.gmLabel = toText(args['gm-label']);
    if (args['public-label'] !== undefined) updates.publicLabel = toText(args['public-label']);
    if (args.other !== undefined) updates.other = toText(args.other);
    if (args.visibility !== undefined) {
      const v = toText(args.visibility);
      if (VALID_SAVED_VISIBILITIES.has(v)) {
        updates.visibility = v;
      } else {
        whisperWarning(playerId, t('ui.msg.savedInvalidVisibility', locale));
        return;
      }
    }
    updateSavedEffect(effectId, updates);
    whisper(playerId, t('ui.title.savedEdit', locale), t('ui.msg.savedEffectUpdated', locale));
    return;
  }

  showSavedEditMenu(playerId, effect, locale);
}

/**
 * Whispers an edit-options card for a saved effect.
 *
 * @param {string} playerId GM player id.
 * @param {SavedEffect} effect Saved-effect record.
 * @param {string} locale Locale code.
 * @returns {void}
 */
function showSavedEditMenu(playerId, effect, locale) {
  const gmLabelCmd = buildCmd([
    `--saved edit ${effect.id}`,
    `--gm-label ?{${t('ui.saved.prompt.enterGmLabel', locale)}|${escapeQueryDefault(effect.gmLabel)}}`,
  ]);

  const publicLabelCmd = buildCmd([
    `--saved edit ${effect.id}`,
    `--public-label ?{${t('ui.saved.prompt.enterPublicLabel', locale)}|${escapeQueryDefault(effect.publicLabel)}}`,
  ]);

  const visPublicCmd = buildCmd([
    `--saved edit ${effect.id} --visibility ${SAVED_VISIBILITY_PUBLIC}`,
  ]);
  const visMaskedCmd = buildCmd([
    `--saved edit ${effect.id} --visibility ${SAVED_VISIBILITY_MASKED}`,
  ]);
  const visGmCmd = buildCmd([`--saved edit ${effect.id} --visibility ${SAVED_VISIBILITY_GM}`]);

  whisper(playerId, t('ui.title.savedEdit', locale), [
    heading(effectGmLabel(effect)),
    htmlTable(
      [t('ui.col.field', locale), t('ui.col.value', locale)],
      [
        [t('ui.saved.field.gmLabel', locale), code(effect.gmLabel || '')],
        [t('ui.saved.field.publicLabel', locale), code(effect.publicLabel || '')],
        [t('ui.saved.field.visibility', locale), code(visibilityLabel(effect.visibility, locale))],
      ]
    ),
    rawHtml('<br>'),
    heading(t('ui.heading.editActions', locale)),
    buildButton(`${t('ui.saved.field.gmLabel', locale)}: ?{…}`, gmLabelCmd),
    buildButton(`${t('ui.saved.field.publicLabel', locale)}: ?{…}`, publicLabelCmd),
    rawHtml('<br>'),
    heading(t('ui.heading.visibility', locale)),
    buildButton(t('ui.saved.visibility.public', locale), visPublicCmd),
    buildButton(t('ui.saved.visibility.masked', locale), visMaskedCmd),
    buildButton(t('ui.saved.visibility.gm', locale), visGmCmd),
  ]);
}

/**
 * Escapes a string to be safe as the default value in a Roll20 query prompt.
 *
 * @param {string} text Raw text.
 * @returns {string} Escaped text.
 */
function escapeQueryDefault(text) {
  return toText(text).replaceAll('|', '').replaceAll('}', '').replaceAll('{', '');
}

// ---------------------------------------------------------------------------
// Remove
// ---------------------------------------------------------------------------

/**
 * Removes a saved effect by id and confirms to the GM.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @returns {void}
 */
function executeSavedRemove(playerId, effectId) {
  const locale = getConfig().language;
  const removed = removeSavedEffect(effectId);
  if (!removed) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }
  whisper(playerId, t('ui.title.savedRemoved', locale), t('ui.msg.savedEffectRemoved', locale));
}

// ---------------------------------------------------------------------------
// Promote
// ---------------------------------------------------------------------------

/**
 * Shows a card with promote-visibility buttons for a saved effect.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @returns {void}
 */
function showSavedPromoteMenu(playerId, effectId) {
  const locale = getConfig().language;
  const effect = findSavedEffect(effectId);
  if (!effect) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }

  const publicCmd = buildCmd([
    `--saved promote ${effectId} --visibility ${SAVED_VISIBILITY_PUBLIC}`,
  ]);
  const maskedCmd = buildCmd([
    `--saved promote ${effectId} --visibility ${SAVED_VISIBILITY_MASKED}`,
  ]);
  const gmCmd = buildCmd([`--saved promote ${effectId} --visibility ${SAVED_VISIBILITY_GM}`]);

  whisper(playerId, t('ui.title.savedPromoted', locale), [
    heading(effectGmLabel(effect)),
    heading(t('ui.heading.promoteOptions', locale)),
    buildButton(t('ui.saved.visibility.public', locale), publicCmd),
    buildButton(t('ui.saved.visibility.masked', locale), maskedCmd),
    buildButton(t('ui.saved.visibility.gm', locale), gmCmd),
  ]);
}

/**
 * Promotes a saved effect to the Turn Tracker (or marks it GM-only active).
 *
 * Public: creates a Turn Tracker row using the full GM label.
 * Masked: creates a Turn Tracker row using the public label.
 * GM: no Turn Tracker row — the reminder system surfaces it to the GM.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @param {string} visibility Promotion visibility ("public"|"masked"|"gm").
 * @param {object} _args Parsed command arguments (reserved for future use).
 * @returns {void}
 */
function executeSavedPromote(playerId, effectId, visibility, _args) {
  const locale = getConfig().language;
  const effect = findSavedEffect(effectId);
  if (!effect) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }

  if (visibility === SAVED_VISIBILITY_GM) {
    // No Turn Tracker row — remind GM via the reminder system
    updateSavedEffect(effectId, { visibility: SAVED_VISIBILITY_GM });
    whisper(playerId, t('ui.title.savedPromoted', locale), t('ui.msg.savedPromotedGm', locale));
    return;
  }

  // Build a condition record and insert it into the Turn Tracker
  const condition = buildActiveConditionFromSaved(effect, visibility);
  if (!condition) {
    whisperError(playerId, t('ui.msg.tokenNotFound', locale));
    return;
  }

  addActiveCondition(condition);
  const insertResult = insertConditionRow(condition);

  // Apply marker if configured
  const config = getConfig();
  if (config.useMarkers && condition.marker) {
    const targetToken = getGraphicToken(effect.targetTokenId);
    if (targetToken) {
      applyMarker(targetToken, condition.marker);
    }
  }

  const msg =
    visibility === SAVED_VISIBILITY_MASKED
      ? t('ui.msg.savedPromotedMasked', locale, {
          publicLabel: escapeHtml(effectPublicLabel(effect)),
        })
      : t('ui.msg.savedPromotedPublic', locale);

  whisper(playerId, t('ui.title.savedPromoted', locale), [
    msg,
    insertResult.appended ? t('ui.apply.turnAppended', locale) : t('ui.apply.turnInserted', locale),
  ]);
}

/**
 * Builds a minimal active-condition record from a saved effect for Turn Tracker insertion.
 *
 * @param {SavedEffect} effect Saved-effect record.
 * @param {string} visibility Promotion visibility mode.
 * @returns {object|null} Active condition record, or null when the target token is missing.
 */
function buildActiveConditionFromSaved(effect, visibility) {
  const targetToken = getGraphicToken(effect.targetTokenId);
  if (!targetToken) return null;

  const config = getConfig();
  const targetName = getTokenName(targetToken);
  const sourceToken = effect.sourceTokenId ? getGraphicToken(effect.sourceTokenId) : null;
  const sourceName = sourceToken ? getTokenName(sourceToken) : targetName;

  const displayText =
    visibility === SAVED_VISIBILITY_MASKED && effect.publicLabel
      ? effect.publicLabel
      : effectGmLabel(effect);

  const marker = toText(config.markers[effect.condition]) || '';

  const id = createId();

  return {
    id,
    sourceTokenId: effect.sourceTokenId || effect.targetTokenId,
    subjectTokenId: effect.subjectTokenId || '',
    targetTokenId: effect.targetTokenId,
    sourceName,
    subjectName: '',
    targetName,
    condition: effect.condition,
    customText: effect.other || '',
    displayText,
    marker,
    turnOrderCustomId: id,
    duration: effect.duration || { type: DURATION_UNTIL_REMOVED },
    createdAt: Date.now(),
  };
}

// ---------------------------------------------------------------------------
// Snooze
// ---------------------------------------------------------------------------

/**
 * Shows a snooze-options card for a saved effect.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @returns {void}
 */
function showSavedSnoozeMenu(playerId, effectId) {
  const locale = getConfig().language;
  const effect = findSavedEffect(effectId);
  if (!effect) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }

  const snoozeCmd = (scope, rounds) => {
    const parts = [`--saved snooze ${effectId} --scope ${scope}`];
    if (rounds) parts.push(`--rounds ${rounds}`);
    return buildCmd(parts);
  };

  const clearCmd = buildCmd([`--saved snooze-clear ${effectId}`]);

  whisper(playerId, t('ui.title.savedSnoozed', locale), [
    heading(effectGmLabel(effect)),
    heading(t('ui.heading.snoozeOptions', locale)),
    buildButton(t('ui.saved.snooze.thisTurn', locale), snoozeCmd(SAVED_SNOOZE_TURN, 0)),
    buildButton(t('ui.saved.snooze.oneRound', locale), snoozeCmd(SAVED_SNOOZE_ROUNDS, 1)),
    buildButton(t('ui.saved.snooze.threeRounds', locale), snoozeCmd(SAVED_SNOOZE_ROUNDS, 3)),
    buildButton(t('ui.saved.snooze.thisCombat', locale), snoozeCmd(SAVED_SNOOZE_COMBAT, 0)),
    buildButton(t('ui.btn.clearSnooze', locale), clearCmd),
  ]);
}

/**
 * Applies a snooze to a saved effect.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @param {string} scope Snooze scope: "turn" | "rounds" | "combat".
 * @param {number} rounds Round count (used for rounds scope).
 * @param {string} [turnKey] Current turn signature (used for turn-scope snooze).
 * @returns {void}
 */
function executeSavedSnooze(playerId, effectId, scope, rounds, turnKey) {
  const locale = getConfig().language;
  const effect = findSavedEffect(effectId);
  if (!effect) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }

  let snooze;
  if (scope === SAVED_SNOOZE_TURN) {
    snooze = { scope: SAVED_SNOOZE_TURN, snoozedOnTurnKey: turnKey || '' };
  } else if (scope === SAVED_SNOOZE_ROUNDS) {
    snooze = { scope: SAVED_SNOOZE_ROUNDS, roundsRemaining: rounds > 0 ? rounds : 1 };
  } else {
    snooze = { scope: SAVED_SNOOZE_COMBAT };
  }

  updateSavedEffect(effectId, { snooze });

  const scopeLabel =
    scope === SAVED_SNOOZE_ROUNDS
      ? t('ui.saved.snooze.rounds', locale, { n: snooze.roundsRemaining })
      : scope === SAVED_SNOOZE_TURN
        ? t('ui.saved.snooze.thisTurn', locale)
        : t('ui.saved.snooze.thisCombat', locale);

  whisper(
    playerId,
    t('ui.title.savedSnoozed', locale),
    t('ui.msg.savedSnoozed', locale, { scope: scopeLabel })
  );
}

/**
 * Clears the snooze on a saved effect.
 *
 * @param {string} playerId GM player id.
 * @param {string} effectId Saved-effect id.
 * @returns {void}
 */
function executeSnoozeClear(playerId, effectId) {
  const locale = getConfig().language;
  const effect = findSavedEffect(effectId);
  if (!effect) {
    whisperWarning(playerId, t('ui.msg.savedEffectNotFound', locale));
    return;
  }
  updateSavedEffect(effectId, { snooze: null });
  whisper(
    playerId,
    t('ui.title.savedSnoozeCleared', locale),
    t('ui.msg.savedSnoozeCleared', locale)
  );
}

// ---------------------------------------------------------------------------
// GM reminder system
// ---------------------------------------------------------------------------

/**
 * Returns true when a saved-effect reminder should be shown for the given turn key.
 *
 * Handles all snooze scopes and mutates snooze state when scopes expire.
 *
 * @param {SavedEffect} effect Saved-effect record.
 * @param {string} turnKey Current turn signature.
 * @returns {boolean} True when the reminder should fire.
 */
function shouldShowReminder(effect, turnKey) {
  if (!effect.snooze) return true;

  const { scope } = effect.snooze;

  if (scope === SAVED_SNOOZE_COMBAT) {
    return false;
  }

  if (scope === SAVED_SNOOZE_TURN) {
    if (effect.snooze.snoozedOnTurnKey === turnKey) {
      return false;
    }
    // Different turn — snooze expired
    updateSavedEffect(effect.id, { snooze: null });
    return true;
  }

  if (scope === SAVED_SNOOZE_ROUNDS) {
    const remaining = effect.snooze.roundsRemaining || 0;
    if (remaining > 0) {
      updateSavedEffect(effect.id, {
        snooze: { ...effect.snooze, roundsRemaining: remaining - 1 },
      });
      return false;
    }
    // Expired
    updateSavedEffect(effect.id, { snooze: null });
    return true;
  }

  return true;
}

/**
 * Fires GM reminders for any hidden (gm or masked) saved effects on the token
 * that just reached the top of the Turn Tracker.
 *
 * Deduplicates using lastReminderTurnKey so the same reminder is never shown
 * twice for the same top-of-turn state.
 *
 * @param {string} tokenId Token id now at the top of the turn order.
 * @param {string} tokenName Token display name.
 * @param {string} turnKey Current turn-order signature.
 * @returns {void}
 */
export function processSavedEffectReminders(tokenId, tokenName, turnKey) {
  const effects = getSavedEffectsForToken(tokenId);
  if (effects.length === 0) return;

  const locale = getConfig().language;
  const gmIds = getGmPlayerIds();
  if (!gmIds.length) return;

  const remindable = [];

  for (const effect of effects) {
    // Public effects are visible in the Turn Tracker — no separate reminder needed
    if (effect.visibility === SAVED_VISIBILITY_PUBLIC) continue;

    // Duplicate prevention for the same turn tick
    if (effect.lastReminderTurnKey === turnKey) continue;

    if (!shouldShowReminder(effect, turnKey)) continue;

    remindable.push(effect);
  }

  if (remindable.length === 0) return;

  // Stamp turn key so this batch is not repeated
  for (const effect of remindable) {
    updateSavedEffect(effect.id, { lastReminderTurnKey: turnKey });
  }

  const bodyLines = buildReminderCard(remindable, tokenName, locale);
  const primaryGmId = gmIds[0];
  whisper(primaryGmId, t('ui.title.hiddenEffects', locale, { name: tokenName }), bodyLines);
}

/**
 * Builds the body lines for a GM reminder card listing hidden saved effects.
 *
 * @param {SavedEffect[]} effects Effects to include in the card.
 * @param {string} tokenName Token display name.
 * @param {string} locale Locale code.
 * @returns {(string|object)[]} Body lines.
 */
function buildReminderCard(effects, tokenName, locale) {
  const lines = [t('ui.msg.hiddenEffectsReminder', locale, { name: tokenName })];

  for (const effect of effects) {
    lines.push(rawHtml('<br>'));
    lines.push(heading(effectGmLabel(effect)));

    const rows = [
      [
        t('ui.saved.field.visibility', locale),
        escapeHtml(visibilityLabel(effect.visibility, locale)),
      ],
    ];

    if (effect.visibility === SAVED_VISIBILITY_MASKED && effect.publicLabel) {
      rows.push([t('ui.saved.field.publicLabel', locale), escapeHtml(effect.publicLabel)]);
    }

    if (effect.sourceTokenId) {
      const srcToken = getGraphicToken(effect.sourceTokenId);
      const srcName = srcToken ? getTokenName(srcToken) : effect.sourceTokenId;
      rows.push([t('ui.saved.field.source', locale), escapeHtml(srcName)]);
    }

    lines.push(htmlTable([t('ui.col.field', locale), t('ui.col.details', locale)], rows));

    const promoteCmd = buildCmd([`--saved promote ${effect.id}`]);
    const editCmd = buildCmd([`--saved edit ${effect.id}`]);
    const removeCmd = buildCmd([`--saved remove ${effect.id}`]);
    const snoozeCmd = buildCmd([`--saved snooze ${effect.id}`]);

    lines.push(
      rawHtml(
        [
          buildButton(t('ui.btn.promoteSaved', locale), promoteCmd).__trustedHtml,
          buildButton(t('ui.btn.editSaved', locale), editCmd).__trustedHtml,
          buildButton(t('ui.btn.removeSaved', locale), removeCmd).__trustedHtml,
          buildButton(t('ui.btn.snoozeSaved', locale), snoozeCmd).__trustedHtml,
        ].join(' ')
      )
    );
  }

  return lines;
}

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

/**
 * Builds rows for a two-column button table with blank-cell padding.
 *
 * @param {(string|object)[]} leftButtons Left-column button items.
 * @param {(string|object)[]} rightButtons Right-column button items.
 * @returns {(string|object)[][]} Table rows.
 */
function buildTwoColumnRows(leftButtons, rightButtons) {
  const maxRows = Math.max(leftButtons.length, rightButtons.length);
  const tableRows = [];
  for (let i = 0; i < maxRows; i += 1) {
    tableRows.push([
      i < leftButtons.length ? leftButtons[i] : '',
      i < rightButtons.length ? rightButtons[i] : '',
    ]);
  }
  return tableRows;
}
