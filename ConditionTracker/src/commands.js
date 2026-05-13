import {
  ACTOR_TYPE_AUTO,
  ACTOR_TYPE_IGNORED,
  ACTOR_TYPE_PC,
  VALID_ACTOR_CLASSIFY_TYPES,
  classifyToken,
  classifyTokenDetail,
  clearCharacterOverrideAttr,
  getExplicitClassification,
  setCharacterOverrideAttr,
} from './actorClassification.js';
import {
  announceHtml,
  buildButton,
  buildRemoveButton,
  htmlTable,
  rawHtml,
  whisper,
  whisperError,
  whisperGms,
  whisperWarning,
} from './chat.js';
import {
  buildApplyMessage,
  buildDisplayText,
  getCanonicalCondition,
  getConditionDisplayName,
  isCustomEffectType,
  isCustomTextCondition,
} from './conditions.js';
import {
  COLOR_ACCENT_DARK,
  COLOR_ACCENT_LIGHT,
  COLOR_BG_SOFT_BLACK,
  COLOR_HEADER_DARK,
  COLOR_HEADER_LIGHT,
  COMMAND,
  COMMAND_CLASSIFY,
  COMMAND_REPORT_TOKEN,
  COMMAND_SAVED,
  DURATION_OPTIONS,
  DURATION_UNTIL_REMOVED,
  HANDOUT_NAME,
  MACRO_NAME,
  MACRO_NAME_CLASSIFY,
  MACRO_NAME_MULTI_TARGET,
  MACRO_NAME_REPORT_TOKEN,
  MACRO_NAME_SAVED,
  MENU_REMOVE,
  SCRIPT_NAME,
  SCRIPT_VERSION,
} from './constants.js';
import { parseDuration } from './durations.js';
import { applyMarker, getCampaignTokenMarkers, resolveMarkerTag } from './markers.js';
import { extractConditionTrackerCommand, parseCommand } from './parser.js';
import { removeConditionById } from './removal.js';
import {
  addActiveCondition,
  clearActorTokenOverride,
  createDefaultConfig,
  ensureState,
  findActiveCondition,
  getActiveBySource,
  getActiveByTarget,
  getConfig,
  getLastApplyPayload,
  setActorTokenOverride,
  setConfig,
  setLastApplyPayload,
  someActiveCondition,
} from './state.js';

import { runCleanup } from './cleanup.js';
import { installHandout } from './handout.js';
import { LOCALE_DEFINITIONS, getLocale, getLocalizedLanguageName, t, tRaw } from './i18n.js';
import { getGmVisibleTo, installMacro } from './macros.js';
import { getSavedEffectsForToken } from './savedEffects.js';
import { handleSaved } from './savedEffectsCommands.js';
import { GAME_SYSTEM_DEFINITIONS, getSystemProfile } from './systems/index.js';
import {
  getCurrentTurnTokenId,
  getTokenRowId,
  getTurnOrder,
  insertConditionRow,
  insertConditionRows,
  removeTokenRow,
  reorderAllConditionRows,
} from './turnOrder.js';
import {
  createId,
  escapeHtml,
  getGraphicToken,
  getTokenName,
  queryObjects,
  toText,
} from './utils.js';
import {
  isGmMessage,
  resolveTokenReference,
  validateApplyArgs,
  validateBoolean,
  validateGameSystem,
  validateHealthBar,
  validateLocale,
  validateMarkerConfig,
} from './validation.js';

const SUBJECT_NONE = '__none__';

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
 * Builds an in-card section heading distinct from the message header.
 *
 * @param {string} text Heading text.
 * @returns {object} Trusted HTML line.
 */
export function heading(text) {
  return rawHtml(`<div style="${SECTION_HEADING_STYLE}">${escapeHtml(text)}</div>`);
}

/**
 * Wraps a value in chat-safe code tags.
 *
 * @param {string} text Text to render as code.
 * @returns {string} HTML fragment.
 */
function code(text) {
  return `<code>${escapeHtml(text)}</code>`;
}

/**
 * Decodes simple HTML entities used in localized handout source text before chat escaping.
 *
 * @param {*} value Localized value.
 * @returns {string} Text ready for the chat escaping pipeline.
 */
function decodeHelpText(value) {
  return toText(value).replaceAll('&lt;', '<').replaceAll('&gt;', '>').replaceAll('&amp;', '&');
}

/**
 * Builds a Twemoji asset URL for a locale flag.
 *
 * @param {string} flag Unicode regional-indicator flag.
 * @returns {string} SVG asset URL or an empty string.
 */
function flagAssetUrl(flag) {
  const codepoints = Array.from(toText(flag))
    .map((character) => character.codePointAt(0).toString(16))
    .join('-');
  return codepoints
    ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
    : '';
}

/**
 * Builds an accessible flag image label for chat output.
 *
 * @param {object} locale Locale metadata.
 * @returns {string} Trusted HTML flag fragment.
 */
function localeFlag(locale) {
  const label = escapeHtml(locale.flagLabel || locale.name);
  const url = flagAssetUrl(locale.flag);
  if (!url) {
    return '';
  }
  return `<img src="${escapeHtml(url)}" alt="${label}" title="${label}" style="width:1.1em;height:1.1em;vertical-align:-0.15em;margin-right:4px;" />`;
}

/**
 * Builds the readable language label for a locale in the active configured language.
 *
 * @param {object} locale Locale metadata.
 * @returns {string} Trusted HTML locale label.
 */
function localeLabel(locale) {
  const displayLocale = getConfig().language;
  return `${localeFlag(locale)} ${escapeHtml(getLocalizedLanguageName(locale.code, displayLocale))}`;
}

/**
 * Builds a readable locale name for confirmation messages without flag imagery.
 *
 * @param {string} localeCode Locale code.
 * @returns {string} Human-readable locale label.
 */
function localeDisplayName(localeCode) {
  const locale = LOCALE_DEFINITIONS.find((definition) => definition.code === localeCode);
  if (!locale) {
    return localeCode;
  }

  const nativeName =
    locale.nativeName && locale.nativeName !== locale.name ? ` (${locale.nativeName})` : '';
  return `${locale.name}${nativeName} [${locale.code}]`;
}

/**
 * Builds a localized intro for invalid locale warnings.
 *
 * @param {string} locale Active locale.
 * @returns {string} Intro text ending before the locale table.
 */
function invalidLocaleIntro(locale) {
  return t('ui.msg.invalidLocale', locale, { locales: '' })
    .replace(/\s*:?\s*\.?$/, ':')
    .trim();
}

/**
 * Builds rows for the supported-locale help table.
 *
 * @returns {string[][]} Trusted HTML table rows.
 */
function localeTableRows() {
  return LOCALE_DEFINITIONS.map((locale) => [code(locale.code), localeLabel(locale)]);
}

/**
 * Builds a token choice button for the requested wizard slot.
 *
 * @param {object} token Token entry.
 * @param {object} args Current wizard args.
 * @param {"source"|"target"|"subject"} slot Which slot to fill.
 * @returns {object} Trusted HTML button.
 */
function buildTokenChoiceButton(token, args, slot) {
  return buildButton(token.name, buildWizardBase({ ...args, [slot]: token.id }));
}

/**
 * Builds the command URL for a duration choice.
 *
 * @param {object} args Current wizard args.
 * @param {string} duration Canonical duration label.
 * @returns {string} Roll20 API command.
 */
function buildDurationCommand(args, duration) {
  const sourceId = toText(args.source);
  const targetId = toText(args.target);
  const targetsRaw = toText(args.targets);
  const condition = getCanonicalCondition(toText(args.condition));
  const langRaw = toText(args.lang);
  const parts = [
    `--source ${sourceId}`,
    targetsRaw ? `--targets ${targetsRaw}` : `--target ${targetId}`,
    `--condition ${condition}`,
    `--duration ${duration}`,
  ];
  if (langRaw) parts.push(`--lang ${langRaw}`);
  return buildCommand(parts);
}

/**
 * Converts localized handout rows into escaped chat table rows.
 *
 * @param {string[][]} rows Raw localized rows.
 * @returns {string[][]} Escaped HTML rows.
 */
function toEscapedHandoutTableRows(rows) {
  return rows.map(([a, b]) => [code(decodeHelpText(a)), escapeHtml(decodeHelpText(b))]);
}

/**
 * Adds light spacing between structured sections.
 *
 * @returns {object} Trusted HTML spacer.
 */
function sectionSpacer() {
  return rawHtml('<br><br>');
}

/**
 * Returns true when a token is classified as a player character.
 *
 * Delegates to classifyToken so that explicit overrides, sheet adapters, and
 * generic attribute detection are all applied consistently.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {boolean} True for player tokens.
 */
export function isPlayerToken(token) {
  return classifyToken(token) === ACTOR_TYPE_PC;
}

/**
 * Returns the display name for a token: the token's own name field, falling
 * back to the linked character's name when the token field is blank.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {string} Display name, or empty string if none found.
 */
function getTokenDisplayName(token) {
  const tokenName = toText(token.get('name'));
  if (tokenName) return tokenName;
  const characterId = toText(token.get('represents'));
  if (!characterId) return '';
  const character = getObj('character', characterId);
  return character ? toText(character.get('name')) : '';
}

/**
 * Returns true when a token's configured HP bar is explicitly set to zero or
 * below. Tokens with no value on the bar (empty string) are not considered
 * dead and return false.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {boolean} True when the token has zero or negative HP.
 */
function hasZeroHp(token) {
  const bar = getConfig().healthBar;
  const raw = token.get(bar);
  if (raw === '' || raw === null || raw === undefined) return false;
  const value = Number(raw);
  return Number.isFinite(value) && value <= 0;
}

/**
 * Converts one Roll20 graphic token into a token entry, or null when the
 * token has no resolvable name, has zero HP, or is classified as ignored.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {{id: string, name: string, isPlayer: boolean}|null} Token entry.
 */
function tokenToEntry(token) {
  if (hasZeroHp(token)) return null;
  const actorType = classifyToken(token);
  if (actorType === ACTOR_TYPE_IGNORED) return null;
  const name = getTokenDisplayName(token);
  if (!name) return null;
  return { id: token.id, name, isPlayer: actorType === ACTOR_TYPE_PC };
}

/**
 * Returns token entries sourced from the current turn order.
 *
 * Custom text rows (id "-1") are ignored. Tokens that no longer exist or
 * have no resolvable name are skipped. Each token id appears at most once.
 *
 * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
 */
function getTokensFromTurnOrder() {
  const seen = new Set();
  const entries = [];
  for (const row of getTurnOrder()) {
    const tokenId = getTokenRowId(row);
    if (!tokenId || seen.has(tokenId)) continue;
    seen.add(tokenId);
    const token = getGraphicToken(tokenId);
    if (!token) continue;
    const entry = tokenToPromptEntry(token);
    if (entry) entries.push(entry);
  }
  return entries;
}

/**
 * Returns a prompt-friendly token entry.
 *
 * Unlike the combat list, this keeps named tokens even if they are zero HP or
 * unlinked. Only excludes tokens not on the main token layer ('objects') or
 * explicitly classified as ignored via --classify.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {{id: string, name: string, isPlayer: boolean}|null} Token entry.
 */
function tokenToPromptEntry(token) {
  const layer = toText(token.get?.('_layer'));
  if (layer && layer !== 'objects') return null;
  if (getExplicitClassification(token) === ACTOR_TYPE_IGNORED) return null;
  const name = getTokenDisplayName(token);
  if (!name) return null;
  const actorType = classifyToken(token);
  return { id: token.id, name, isPlayer: actorType === ACTOR_TYPE_PC };
}

/**
 * Returns token entries sourced from the active player page.
 *
 * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
 */
function getTokensFromPage() {
  const pageId = Campaign().get('playerpageid');
  return queryObjects({ _type: 'graphic', _subtype: 'token', _pageid: pageId })
    .map(tokenToPromptEntry)
    .filter(Boolean);
}

/**
 * Returns token entries from all pages as a broad fallback.
 *
 * Used when the active page/turn-order context has no named tokens to show.
 *
 * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
 */
function getTokensFromAllPages() {
  return queryObjects({ _type: 'graphic', _subtype: 'token' })
    .map(tokenToPromptEntry)
    .filter(Boolean);
}

/**
 * Returns named combat tokens sorted alphabetically.
 *
 * Uses turn order token IDs when initiative is running — this works regardless
 * of which page the GM is viewing and naturally excludes custom text rows
 * (e.g. "Round 1"). Falls back to the active player page when the turn order
 * contains no real token entries (pre-combat).
 *
 * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
 */
function getPageTokens() {
  const fromTurnOrder = getTokensFromTurnOrder();
  const fromPage = fromTurnOrder.length > 0 ? fromTurnOrder : getTokensFromPage();
  const entries = fromPage.length > 0 ? fromPage : getTokensFromAllPages();
  return entries.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Builds a partial wizard command string carrying all resolved args forward.
 *
 * Only includes args that have valid, non-empty values. Condition is
 * canonicalized and dropped if unrecognized.
 *
 * @param {object} args Current parsed command arguments.
 * @returns {string} Command prefix for wizard step buttons.
 */
function buildWizardBase(args) {
  const parts = ['--prompt'];
  const sourceId = toText(args.source);
  const subjectRaw = toText(args.subject);
  const subjectId = subjectRaw === SUBJECT_NONE ? '' : subjectRaw;
  const targetId = toText(args.target);
  const targetsRaw = toText(args.targets);
  const selectedIdsRaw = toText(args['selected-ids']);
  const conditionRaw = toText(args.condition);
  const canonical = conditionRaw ? getCanonicalCondition(conditionRaw) : '';
  const durationRaw = toText(args.duration);
  const langRaw = toText(args.lang);

  if (sourceId) parts.push(`--source ${sourceId}`);
  if (subjectRaw === SUBJECT_NONE) parts.push(`--subject ${SUBJECT_NONE}`);
  else if (subjectId) parts.push(`--subject ${subjectId}`);
  if (targetId) parts.push(`--target ${targetId}`);
  if (targetsRaw) parts.push(`--targets ${targetsRaw}`);
  else if (selectedIdsRaw) parts.push(`--selected-ids ${selectedIdsRaw}`);
  if (canonical) parts.push(`--condition ${canonical}`);
  if (durationRaw) parts.push(`--duration ${durationRaw}`);
  if (langRaw) parts.push(`--lang ${langRaw}`);
  return buildCommand(parts);
}

/**
 * Resolves a wizard token argument to an id when possible.
 *
 * Token names are accepted for prompt flow so the wizard can continue using
 * the same resolver as direct apply.
 *
 * @param {string} rawRef User-provided token reference.
 * @param {'source'|'target'|'subject'} role Token role for messages.
 * @returns {{valid: boolean, value: string, message?: string}} Resolution result.
 */
function resolveWizardTokenArg(rawRef, role) {
  const ref = toText(rawRef);
  if (!ref || ref === SUBJECT_NONE) {
    return { valid: true, value: '' };
  }

  const locale = getConfig().language;
  const result = resolveTokenReference(ref, role, locale);
  if (!result.valid) {
    return { valid: false, value: ref, message: result.message };
  }

  return { valid: true, value: result.token.id };
}

/**
 * Builds a Roll20 command string with the script command prefix.
 *
 * @param {string[]} parts Command parts excluding the base command.
 * @returns {string} Joined command string.
 */
function buildCommand(parts) {
  return [COMMAND, ...parts].join(' ');
}

/**
 * Builds a Roll20 duration query string with an optional leading default.
 *
 * Custom values not in the standard list are prepended so they appear first.
 *
 * @param {string} defaultDuration Duration label to pre-select, or empty.
 * @returns {string} Roll20 `?{...}` query string.
 */
function buildDurationQuery(defaultDuration) {
  const text = toText(defaultDuration);
  if (text) {
    const rest = DURATION_OPTIONS.filter((o) => o !== text);
    const options = DURATION_OPTIONS.includes(text) ? [text, ...rest] : [text, ...DURATION_OPTIONS];
    return `?{Duration|${options.join('|')}}`;
  }
  return `?{Duration|${DURATION_OPTIONS.join('|')}}`;
}

/**
 * Builds table rows for two uneven button columns.
 *
 * @param {string[]} leftButtons Left column button HTML.
 * @param {string[]} rightButtons Right column button HTML.
 * @returns {string[][]} Table rows with blank-cell padding.
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

/**
 * Whispers named token buttons for one wizard slot in a two-column layout.
 *
 * Player-controlled tokens appear in the left column and NPCs in the right.
 * An optional description is shown above the table to explain the role.
 *
 * @param {string} playerId GM player id.
 * @param {string} title Step heading.
 * @param {object} args Current wizard args.
 * @param {"source"|"target"|"subject"} slot Which slot to fill.
 * @param {string} [description] Optional context shown above the token list.
 * @returns {void}
 */
function showTokenStep(playerId, title, args, slot, description) {
  const locale = getConfig().language;
  const tokens = getPageTokens();
  if (tokens.length === 0) {
    whisper(playerId, title, t('ui.wizard.noTokens', locale));
    return;
  }

  const playerButtons = tokens
    .filter((tok) => tok.isPlayer)
    .map((tok) => buildTokenChoiceButton(tok, args, slot));
  const npcButtons = tokens
    .filter((tok) => !tok.isPlayer)
    .map((tok) => buildTokenChoiceButton(tok, args, slot));
  const tableRows = buildTwoColumnRows(playerButtons, npcButtons);

  const body = [];
  if (description) {
    body.push(
      rawHtml(`<div style="font-style:italic;margin:2px 0 4px;">${escapeHtml(description)}</div>`)
    );
  }
  if (slot === 'subject') {
    body.push(
      buildButton(
        t('ui.wizard.noneBtn', locale),
        buildWizardBase({ ...args, subject: SUBJECT_NONE })
      )
    );
  }
  if (slot === 'target') {
    const sourceId = toText(args.source);
    if (sourceId) {
      body.push(
        buildButton(
          t('ui.wizard.noneOrSourceBtn', locale),
          buildWizardBase({ ...args, target: sourceId })
        )
      );
    }
  }
  body.push(htmlTable([t('ui.col.players', locale), t('ui.col.npcs', locale)], tableRows));
  whisper(playerId, title, body);
}

/**
 * Whispers a confirmation card listing the pre-selected tokens with a single
 * "Confirm target list" button that advances the wizard to the duration step.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Current wizard args.
 * @returns {void}
 */
function showMultiTargetStep(playerId, args) {
  const locale = getConfig().language;
  const selectedIdsRaw = toText(args['selected-ids']);
  const ids = selectedIdsRaw.split(',').filter(Boolean);

  const resolved = ids
    .map((id) => {
      const token = getGraphicToken(id);
      if (!token) return null;
      const name = getTokenDisplayName(token);
      return name ? { id, name } : null;
    })
    .filter(Boolean);

  if (resolved.length === 0) {
    whisperWarning(playerId, t('ui.msg.reSelectTokens', locale));
    return;
  }

  const confirmedIds = resolved.map((tok) => tok.id).join(',');
  const confirmCmd = buildWizardBase({
    ...args,
    targets: confirmedIds,
    'selected-ids': '',
  });
  const tokenListHtml = resolved
    .map((tok) => `<div style="padding:1px 0;">• ${escapeHtml(tok.name)}</div>`)
    .join('');

  whisper(playerId, t('ui.wizard.confirmTargetTitle', locale), [
    rawHtml(
      `<div style="margin-bottom:4px;font-style:italic;">${escapeHtml(t('ui.wizard.confirmIntro', locale))}</div>`
    ),
    rawHtml(tokenListHtml),
    buildButton(t('ui.wizard.confirmBtn', locale), confirmCmd),
  ]);
}

/**
 * Whispers condition selection buttons in a two-column layout.
 *
 * Left column: system standard conditions. Right column: system custom effect types.
 * All buttons advance the wizard to the target/subject step.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Current wizard args.
 * @returns {void}
 */
function showConditionStep(playerId, args) {
  const config = getConfig();
  const locale = config.language;
  const profile = getSystemProfile(config.gameSystem);
  const base = buildWizardBase(args);

  const standardButtons = profile.STANDARD_CONDITIONS.map((c) =>
    buildButton(getConditionDisplayName(c, profile, locale), `${base} --condition ${c}`)
  );

  const customButtons = profile.CUSTOM_EFFECT_TYPES.map((c) =>
    buildButton(getConditionDisplayName(c, profile, locale), `${base} --condition ${c}`)
  );

  const tableRows = buildTwoColumnRows(standardButtons, customButtons);

  whisper(playerId, t('ui.wizard.selectCondition', locale), [
    htmlTable([t('ui.col.conditions', locale), t('ui.col.customEffects', locale)], tableRows),
  ]);
}

/**
 * Whispers duration buttons in a two-column table layout.
 *
 * Left column: permanent and turn-end options.
 * Right column: fixed round counts plus a custom-round entry.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Current wizard args.
 * @returns {void}
 */
function showDurationStep(playerId, args) {
  const locale = getConfig().language;

  // English canonical values used in command URLs; localized labels shown on buttons
  const leftOptions = [
    { dur: 'Until removed', label: t('ui.dur.untilRemoved', locale) },
    {
      dur: 'End of target next turn',
      label: t('ui.dur.endOfTargetTurn', locale),
    },
    {
      dur: 'End of source next turn',
      label: t('ui.dur.endOfSourceTurn', locale),
    },
  ];
  const rightOptions = [
    { dur: '1 round', label: t('ui.dur.round1', locale) },
    { dur: '2 rounds', label: t('ui.dur.round2', locale) },
    { dur: '3 rounds', label: t('ui.dur.round3', locale) },
    { dur: '10 rounds', label: t('ui.dur.round10', locale) },
  ];
  const customPrompt = t('ui.dur.customPrompt', locale);
  const customCmd = buildDurationCommand(args, `?{${customPrompt}|} rounds`);

  const leftButtons = leftOptions.map(({ dur, label }) =>
    buildButton(label, buildDurationCommand(args, dur))
  );
  const rightButtons = [
    ...rightOptions.map(({ dur, label }) => buildButton(label, buildDurationCommand(args, dur))),
    buildButton(t('ui.dur.custom', locale), customCmd),
  ];

  const tableRows = buildTwoColumnRows(leftButtons, rightButtons);

  whisper(playerId, t('ui.wizard.selectDuration', locale), [
    htmlTable([t('ui.col.permanentTurnEnd', locale), t('ui.col.rounds', locale)], tableRows),
  ]);
}

/**
 * Whispers a button with native query dialogs for effect text and duration.
 *
 * Used for Spell, Ability, and Other when description or duration is missing
 * and cannot be collected through the wizard button flow.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Current wizard args.
 * @param {string} condition Canonical condition (Spell, Ability, or Other).
 * @returns {void}
 */
function showCustomTextStep(playerId, args, condition) {
  const locale = getConfig().language;
  const sourceId = toText(args.source);
  const targetId = toText(args.target);
  const targetsRaw = toText(args.targets);
  const langRaw = toText(args.lang);
  const durationQuery = buildDurationQuery(toText(args.duration));
  const prompt =
    condition === 'Other'
      ? t('ui.wizard.otherText', locale)
      : t('ui.wizard.effectDetails', locale, { condition });
  const parts = [
    `--source ${sourceId}`,
    targetsRaw ? `--targets ${targetsRaw}` : `--target ${targetId}`,
    `--condition ${condition}`,
    `--other ?{${prompt}|}`,
    `--duration ${durationQuery}`,
  ];
  if (langRaw) parts.push(`--lang ${langRaw}`);
  const cmd = buildCommand(parts);
  whisper(playerId, t('ui.wizard.applyEffectTitle', locale, { condition }), [
    buildButton(t('ui.wizard.enterDetails', locale), cmd),
  ]);
}

/**
 * Returns false when --subject is supplied for a standard (non-custom) condition.
 *
 * @param {string} subjectId Parsed --subject value.
 * @param {string} canonical Canonical condition label.
 * @returns {boolean} True when the combination is valid.
 */
function isSubjectAllowed(subjectId, canonical) {
  const value = subjectId === SUBJECT_NONE ? '' : subjectId;
  if (!value || !canonical) return true;
  return isCustomEffectType(canonical);
}

/**
 * Dispatches to the correct detail step once source, target, and condition are known.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Resolved wizard args.
 * @param {string} canonical Canonical condition label.
 * @returns {void}
 */
function showEffectDetailStep(playerId, args, canonical) {
  const targetsRaw = toText(args.targets);
  if (isCustomTextCondition(canonical)) {
    if (toText(args.other) && toText(args.duration)) {
      if (targetsRaw) {
        handleMultiApply(playerId, args);
      } else {
        handleApply(playerId, args);
      }
      return;
    }
    showCustomTextStep(playerId, args, canonical);
    return;
  }
  if (toText(args.duration)) {
    if (targetsRaw) {
      handleMultiApply(playerId, args);
    } else {
      handleApply(playerId, args);
    }
    return;
  }
  showDurationStep(playerId, args);
}

/**
 * Advances the condition application wizard based on which arguments are present.
 *
 * Steps in order: condition, subject (custom effects), source token,
 * target token, and duration.
 * Each step whispers buttons to the GM. Any step whose value is already
 * supplied is skipped. Calls handleApply directly when all values are present.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
export function showPromptUi(playerId, args) {
  const conditionRaw = toText(args.condition);
  const canonical = conditionRaw ? getCanonicalCondition(conditionRaw) : '';
  const resolved = resolvePromptWizardArgs(args, canonical);
  if (!resolved.valid) {
    whisperWarning(playerId, resolved.message);
    return;
  }

  const resolvedWizardArgs = resolved.args;
  const locale = getConfig().language;

  if (!isSubjectAllowed(toText(resolvedWizardArgs.subject), canonical)) {
    whisperWarning(playerId, t('ui.msg.subjectOnlyCustom', locale));
    return;
  }

  if (showPromptStep(playerId, resolvedWizardArgs, canonical, locale)) return;

  const subjectRaw = toText(resolvedWizardArgs.subject);
  const resolvedArgs =
    subjectRaw === SUBJECT_NONE ? { ...resolvedWizardArgs, subject: '' } : resolvedWizardArgs;

  showEffectDetailStep(playerId, resolvedArgs, canonical);
}

/**
 * Resolves wizard command arguments and token references.
 *
 * @param {object} args Parsed command arguments.
 * @param {string} canonical Canonical condition label.
 * @returns {{valid:boolean,args?:object,message?:string}} Resolution result.
 */
function resolvePromptWizardArgs(args, canonical) {
  const config = getConfig();
  const subjectBypassForCommand = resolveSubjectPromptBypassOverride(
    args,
    config.subjectPromptBypass
  );
  if (!subjectBypassForCommand.valid) {
    return { valid: false, message: subjectBypassForCommand.message };
  }

  const shouldBypassSubject = subjectBypassForCommand.value && isCustomEffectType(canonical);
  const wizardArgs = shouldBypassSubject ? { ...args, subject: SUBJECT_NONE } : args;

  const sourceResult = resolveWizardTokenArg(wizardArgs.source, 'source');
  if (!sourceResult.valid) return sourceResult;

  const subjectResult = resolveWizardTokenArg(wizardArgs.subject, 'subject');
  if (!subjectResult.valid) return subjectResult;

  const targetResult = resolveWizardTokenArg(wizardArgs.target, 'target');
  if (!targetResult.valid) return targetResult;

  return {
    valid: true,
    args: {
      ...wizardArgs,
      source: sourceResult.value,
      subject: subjectResult.value || wizardArgs.subject,
      target: targetResult.value,
    },
  };
}

/**
 * Shows the next wizard step if core inputs are still missing.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Resolved wizard args.
 * @param {string} canonical Canonical condition label.
 * @param {string} locale Locale code.
 * @returns {boolean} True when a wizard step was rendered.
 */
function showPromptStep(playerId, args, canonical, locale) {
  if (!canonical) {
    showConditionStep(playerId, args);
    return true;
  }

  const subjectRaw = toText(args.subject);
  const subjectId = subjectRaw === SUBJECT_NONE ? '' : subjectRaw;
  const subjectChosen = Boolean(subjectId) || subjectRaw === SUBJECT_NONE;
  if (isCustomEffectType(canonical) && !subjectChosen) {
    showTokenStep(
      playerId,
      t('ui.wizard.selectSubject', locale),
      args,
      'subject',
      t('ui.wizard.subjectDesc', locale)
    );
    return true;
  }

  if (!toText(args.source)) {
    showTokenStep(
      playerId,
      t('ui.wizard.selectSource', locale),
      args,
      'source',
      t('ui.wizard.sourceDesc', locale)
    );
    return true;
  }

  if (toText(args.target) || toText(args.targets)) {
    return false;
  }

  if (toText(args['selected-ids'])) {
    showMultiTargetStep(playerId, args);
    return true;
  }

  showTokenStep(
    playerId,
    t('ui.wizard.selectTarget', locale),
    args,
    'target',
    t('ui.wizard.targetDesc', locale)
  );
  return true;
}

/**
 * Resolves a per-command override for subjectPromptBypass.
 *
 * Supports either --subjectPromptBypass or --subject-prompt-bypass.
 * If omitted, the persisted config value is used.
 *
 * @param {object} args Parsed command arguments.
 * @param {boolean} configDefault Current config default.
 * @returns {{valid: boolean, value?: boolean, message?: string}} Resolution result.
 */
function resolveSubjectPromptBypassOverride(args, configDefault) {
  const overrideRaw = args.subjectPromptBypass ?? args['subject-prompt-bypass'];
  if (overrideRaw === undefined) {
    return { valid: true, value: configDefault };
  }

  if (overrideRaw === true) {
    return { valid: true, value: true };
  }

  const parsed = validateBoolean(overrideRaw);
  if (!parsed.valid) {
    return {
      valid: false,
      message: t('ui.msg.subjectBypassInvalid', getConfig().language),
    };
  }

  return { valid: true, value: parsed.value };
}

/**
 * Handles Roll20 API chat input.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (!isConditionTrackerMessage(msg)) {
    return;
  }

  try {
    ensureState();
    routeCommand(msg, parseCommand(msg.content));
  } catch (error) {
    whisperError(msg.playerid, t('ui.msg.commandFailed', getConfig().language));
    log(`${SCRIPT_NAME} error: ${error.message}`);
  }
}

/**
 * Returns true when a chat message belongs to this mod.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {boolean} True for Condition Tracker API messages.
 */
export function isConditionTrackerMessage(msg) {
  return Boolean(msg && msg.type === 'api' && extractConditionTrackerCommand(msg.content));
}

/**
 * Routes a parsed command to the correct handler.
 *
 * @param {object} msg Roll20 chat message.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
export function routeCommand(msg, args) {
  if (args.help) {
    showHelp(msg.playerid);
    return;
  }

  if (!isGmMessage(msg)) {
    whisperError(msg.playerid, t('ui.msg.gmOnly', getConfig().language));
    return;
  }

  if (!prepareSelectedTargetArg(msg, args)) return;
  if (routePrimaryCommand(msg, args)) return;

  routeZeroHpCommand(msg.playerid, args);
}

/**
 * Resolves --selected-target into args.target from current token selection.
 *
 * @param {object} msg Roll20 chat message.
 * @param {object} args Parsed command arguments.
 * @returns {boolean} True when routing can continue.
 */
function prepareSelectedTargetArg(msg, args) {
  if (args['selected-target'] === undefined) return true;

  const locale = getConfig().language;
  const selected = Array.isArray(msg.selected) ? msg.selected : [];
  const targetId = toText(selected[0]?._id);
  if (!targetId) {
    whisperWarning(msg.playerid, t('ui.msg.noSelection', locale));
    return false;
  }

  args.target = targetId;
  return true;
}

/**
 * Routes non-zero-HP commands.
 *
 * @param {object} msg Roll20 chat message.
 * @param {object} args Parsed command arguments.
 * @returns {boolean} True when a command handler ran.
 */
function routePrimaryCommand(msg, args) {
  if (args['multi-target'] !== undefined) {
    handleMultiTargetTrigger(msg);
    return true;
  }
  if (args.prompt !== undefined) {
    showPromptUi(msg.playerid, args);
    return true;
  }
  if (args.menu) {
    showMenu(msg.playerid, args.menu);
    return true;
  }
  if (args.remove) {
    handleRemove(msg.playerid, args.remove);
    return true;
  }
  if (args.cleanup) {
    runCleanup(msg.playerid);
    return true;
  }
  if (args['reorder-conditions'] !== undefined) {
    handleReorderConditions(msg.playerid);
    return true;
  }
  if (args['reinstall-macro']) {
    handleReinstallMacro(msg.playerid);
    return true;
  }
  if (args['reinstall-handout']) {
    handleReinstallHandout(msg.playerid);
    return true;
  }
  if (args['report-token'] !== undefined) {
    handleReportToken(msg);
    return true;
  }
  if (args.saved !== undefined) {
    handleSaved(msg, args);
    return true;
  }
  if (args.classify !== undefined) {
    handleClassify(msg, args);
    return true;
  }
  if (args['create-macro-last'] !== undefined) {
    handleCreateMacroLast(msg.playerid, args);
    return true;
  }
  if (args.config) {
    handleConfig(msg.playerid, args.config);
    return true;
  }
  if (args.targets) {
    handleMultiApply(msg.playerid, args);
    return true;
  }
  if (args.source || args.target || args.subject || args.condition) {
    handleApply(msg.playerid, args);
    return true;
  }
  return false;
}

/**
 * Dispatches zero-HP event commands, falling back to the main menu.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
function routeZeroHpCommand(playerId, args) {
  if (args['zero-hp-dead']) {
    handleZeroHpDead(playerId, args['zero-hp-dead']);
    return;
  }
  if (args['zero-hp-incapacitated']) {
    handleZeroHpIncapacitated(playerId, args['zero-hp-incapacitated']);
    return;
  }
  if (args['zero-hp-remove-all']) {
    handleZeroHpRemoveAll(playerId, args['zero-hp-remove-all']);
    return;
  }
  if (args['zero-hp-remove-from-turn']) {
    handleZeroHpRemoveFromTurnOrder(playerId, args['zero-hp-remove-from-turn']);
    return;
  }
  if (args['zero-hp-to-map']) {
    handleZeroHpToMapLayer(playerId, args['zero-hp-to-map']);
    return;
  }
  showMenu(playerId, 'main');
}

/**
 * Reads the tokens currently selected by the GM and launches the multi-target
 * wizard, encoding the selected token ids into --selected-ids.
 *
 * @param {object} msg Roll20 chat message (used for playerid and selected).
 * @returns {void}
 */
function handleMultiTargetTrigger(msg) {
  const locale = getConfig().language;
  const selected = Array.isArray(msg.selected) ? msg.selected : [];
  if (selected.length === 0) {
    whisperWarning(msg.playerid, t('ui.msg.noSelection', locale));
    return;
  }
  const selectedIds = selected
    .map((s) => toText(s._id))
    .filter(Boolean)
    .join(',');
  if (!selectedIds) {
    whisperWarning(msg.playerid, t('ui.msg.invalidIds', locale));
    return;
  }
  showPromptUi(msg.playerid, { prompt: true, 'selected-ids': selectedIds });
}

/**
 * Validates args, checks for duplicates, and builds a ready-to-persist condition.
 *
 * Does not modify state or the turn order. Returns null and whispers a warning
 * to the GM when any step fails.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @returns {{condition: object, markerNotice: string, locale: string, extraLocale: string}|null}
 */
function prepareApply(playerId, args) {
  const validation = validateApplyArgs(args);
  if (!validation.valid) {
    whisperWarning(playerId, validation.message);
    return null;
  }

  const config = getConfig();
  const locale = config.language;
  const extraLocale = getLocale(toText(args.lang));
  const durationResult = parseDuration(args.duration, {
    sourceTokenId: validation.sourceToken.id,
    targetTokenId: validation.targetToken.id,
    currentTurnTokenId: getCurrentTurnTokenId(),
  });

  if (!durationResult.valid) {
    whisperWarning(playerId, durationResult.message);
    return null;
  }

  if (
    isDuplicate(
      validation.sourceToken.id,
      validation.subjectToken?.id || '',
      validation.subjectName || '',
      validation.targetToken.id,
      validation.condition,
      validation.customText
    )
  ) {
    whisperWarning(playerId, t('ui.msg.duplicate', locale));
    return null;
  }

  const condition = buildConditionRecord(validation, config, durationResult.duration, locale);
  const markerNotice = applyConfiguredMarker(validation.targetToken, condition, config, locale);
  return { condition, markerNotice, locale, extraLocale };
}

/**
 * Applies a condition or custom effect to multiple target tokens.
 *
 * Validates and adds each condition to state sequentially (preserving duplicate
 * detection across targets), then inserts all Turn Tracker rows in a single
 * read-write cycle.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments (must include targets).
 * @returns {void}
 */
export function handleMultiApply(playerId, args) {
  const targetsRaw = toText(args.targets);
  const targetIds = targetsRaw.split(',').filter(Boolean);
  if (targetIds.length === 0) {
    whisperWarning(playerId, t('ui.msg.noTargets', getConfig().language));
    return;
  }

  const prepared = [];
  for (const targetId of targetIds) {
    const prep = prepareApply(playerId, {
      ...args,
      target: targetId,
      targets: '',
    });
    if (!prep) continue;
    addActiveCondition(prep.condition);
    prepared.push(prep);
  }

  if (prepared.length === 0) return;

  const insertResults = insertConditionRows(prepared.map((p) => p.condition));

  setLastApplyPayload(playerId, {
    authorId: playerId,
    sourceArg: prepared[0].condition.sourceTokenId,
    targetArg: '',
    targetsArg: prepared.map((p) => p.condition.targetTokenId).join(','),
    conditionArg: prepared[0].condition.condition,
    durationArg: toText(args.duration),
    otherArg: toText(args.other),
    langArg: toText(args.lang),
  });

  for (let i = 0; i < prepared.length; i++) {
    const { condition, markerNotice, locale, extraLocale } = prepared[i];
    const { appended } = insertResults[i];
    announceHtml(buildApplyMessage(condition, locale));
    if (extraLocale !== locale) {
      announceHtml(buildApplyMessage(condition, extraLocale));
    }
    whisperApplySummary(playerId, condition, appended, markerNotice, locale, null);
  }
}

/**
 * Applies a condition or custom effect.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
export function handleApply(playerId, args) {
  const prep = prepareApply(playerId, args);
  if (!prep) return;

  const { condition, markerNotice, locale, extraLocale } = prep;
  addActiveCondition(condition);
  const insertResult = insertConditionRow(condition);

  setLastApplyPayload(playerId, {
    authorId: playerId,
    sourceArg: condition.sourceTokenId,
    targetArg: condition.targetTokenId,
    targetsArg: '',
    conditionArg: condition.condition,
    durationArg: toText(args.duration),
    otherArg: toText(args.other),
    langArg: toText(args.lang),
  });

  const macroMode = toText(args['macro-mode']).toLowerCase();
  const mode = macroMode === 'selected' || macroMode === 'all' ? macroMode : null;
  announceHtml(buildApplyMessage(condition, locale));
  if (extraLocale !== locale) {
    announceHtml(buildApplyMessage(condition, extraLocale));
  }
  whisperApplySummary(playerId, condition, insertResult.appended, markerNotice, locale, mode);
}

/**
 * Builds an active condition record.
 *
 * @param {object} validation Validated apply arguments.
 * @param {object} config Current config.
 * @param {object} duration Stored duration.
 * @param {string} [locale] Output locale for displayText.
 * @returns {object} Active condition record.
 */
export function buildConditionRecord(validation, config, duration, locale) {
  const sourceName = getTokenName(validation.sourceToken);
  const subjectName = validation.subjectToken
    ? getTokenName(validation.subjectToken)
    : validation.subjectName || '';
  const targetName = getTokenName(validation.targetToken);
  const marker = toText(config.markers[validation.condition]) || '';
  const details = {
    sourceName,
    subjectName,
    targetName,
    isSelfTarget: validation.sourceToken.id === validation.targetToken.id,
    condition: validation.condition,
    customText: validation.customText,
    useIcons: config.useIcons,
  };

  const id = createId();
  return {
    id,
    sourceTokenId: validation.sourceToken.id,
    subjectTokenId: validation.subjectToken?.id || '',
    targetTokenId: validation.targetToken.id,
    sourceName,
    subjectName,
    targetName,
    condition: validation.condition,
    customText: validation.customText,
    displayText: buildDisplayText(details, locale),
    marker,
    turnOrderCustomId: id,
    duration,
    createdAt: Date.now(),
  };
}

/**
 * Applies the configured marker and returns a GM-facing notice.
 *
 * @param {Graphic} targetToken Target token.
 * @param {object} condition Condition record.
 * @param {object} config Current config.
 * @param {string} [locale] Output locale.
 * @returns {string} Marker notice.
 */
export function applyConfiguredMarker(targetToken, condition, config, locale) {
  if (!config.useMarkers) {
    return t('ui.msg.markersDisabled', locale);
  }

  if (!condition.marker) {
    return t('ui.msg.noMarkerConfigured', locale);
  }

  const added = applyMarker(targetToken, condition.marker);
  return added
    ? t('ui.msg.markerApplied', locale, { marker: condition.marker })
    : t('ui.msg.markerPresent', locale, { marker: condition.marker });
}

/**
 * Returns true when an exact duplicate is already active.
 *
 * @param {string} sourceTokenId Source token id.
 * @param {string} subjectTokenId Subject token id.
 * @param {string} subjectName Subject display name.
 * @param {string} targetTokenId Target token id.
 * @param {string} condition Condition label.
 * @param {string} customText Custom effect text.
 * @returns {boolean} True for an exact duplicate.
 */
export function isDuplicate(
  sourceTokenId,
  subjectTokenId,
  subjectName,
  targetTokenId,
  condition,
  customText
) {
  return someActiveCondition((activeCondition) => {
    const sameSource = activeCondition.sourceTokenId === sourceTokenId;
    const sameSubject = (activeCondition.subjectTokenId || '') === (subjectTokenId || '');
    const sameSubjectName = (activeCondition.subjectName || '') === (subjectName || '');
    const sameTarget = activeCondition.targetTokenId === targetTokenId;
    const sameCondition = activeCondition.condition === condition;
    const sameCustomText = activeCondition.customText === customText;
    return (
      sameSource && sameSubject && sameSubjectName && sameTarget && sameCondition && sameCustomText
    );
  });
}

/**
 * Removes one active condition by id.
 *
 * @param {string} playerId GM player id.
 * @param {string} conditionId Condition id.
 * @returns {void}
 */
export function handleRemove(playerId, conditionId) {
  const locale = getConfig().language;
  const condition = findActiveCondition(toText(conditionId));
  if (!condition) {
    whisperWarning(playerId, t('ui.msg.conditionNotFound', locale));
    return;
  }

  removeConditionById(condition.id, {
    playerId,
    reason: t('ui.msg.manuallyRemoved', locale),
    publicAnnounce: true,
    whisperResult: true,
    locale,
  });
}

/**
 * Applies a classify override to a single token and its linked character based
 * on the requested scope.
 *
 * Returns a display-friendly summary line for the whisper confirmation.
 *
 * @param {object} token Roll20 graphic object.
 * @param {string} tokenName Human-readable token name.
 * @param {string} classifyValue Classify value: pc, npc, ignored, or auto.
 * @param {'token'|'character'} scope Override scope.
 * @param {string} locale Output locale.
 * @returns {string} Human-readable result line.
 */
function applyClassifyOverride(token, tokenName, classifyValue, scope, locale) {
  const tokenId = token.id;
  const characterId = toText(token.get('represents'));
  const name = escapeHtml(tokenName);

  if (scope === 'token') {
    if (classifyValue === ACTOR_TYPE_AUTO) {
      clearActorTokenOverride(tokenId);
      return t('ui.classify.cleared', locale, { name, scope: 'token' });
    }
    setActorTokenOverride(tokenId, classifyValue);
    return t('ui.classify.set', locale, { name, type: classifyValue, scope: 'token' });
  }

  // scope === 'character'
  if (!characterId) {
    // No linked character — fall back to token override
    if (classifyValue === ACTOR_TYPE_AUTO) {
      clearActorTokenOverride(tokenId);
      return t('ui.classify.clearedTokenFallback', locale, { name });
    }
    setActorTokenOverride(tokenId, classifyValue);
    return t('ui.classify.setTokenFallback', locale, { name, type: classifyValue });
  }

  if (classifyValue === ACTOR_TYPE_AUTO) {
    clearCharacterOverrideAttr(characterId);
    return t('ui.classify.cleared', locale, { name, scope: 'character' });
  }
  setCharacterOverrideAttr(characterId, classifyValue);
  return t('ui.classify.set', locale, { name, type: classifyValue, scope: 'character' });
}

/**
 * Whispers a classification diagnostic for each selected token.
 *
 * @param {string} playerId GM player id.
 * @param {object[]} selected Roll20 selected token references.
 * @param {string} locale Output locale.
 * @returns {void}
 */
function handleClassifyShow(playerId, selected, locale) {
  const lines = [heading(t('ui.classify.showHeading', locale))];
  let found = 0;

  for (const sel of selected) {
    const tokenId = toText(sel._id);
    const token = getGraphicToken(tokenId);
    if (!token) continue;

    const tokenName = getTokenDisplayName(token);
    const detail = classifyTokenDetail(token, tokenName);
    lines.push(
      htmlTable(
        [t('ui.col.field', locale), t('ui.col.value', locale)],
        [
          [t('ui.classify.fieldToken', locale), escapeHtml(tokenName || tokenId)],
          [t('ui.classify.fieldType', locale), escapeHtml(detail.type)],
          [t('ui.classify.fieldSource', locale), escapeHtml(detail.source)],
          [t('ui.classify.fieldReason', locale), escapeHtml(detail.reason)],
        ]
      )
    );
    found += 1;
  }

  if (found === 0) {
    whisperWarning(playerId, t('ui.msg.reSelectTokens', locale));
    return;
  }

  whisper(playerId, t('ui.classify.showTitle', locale), lines);
}

/**
 * Handles --classify commands, applying or showing actor type overrides for
 * selected tokens.
 *
 * @param {object} msg Roll20 chat message.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
export function handleClassify(msg, args) {
  const locale = getConfig().language;
  const classifyRaw = toText(args.classify).toLowerCase() || 'show';
  const scopeRaw = toText(args.scope).toLowerCase() || 'character';
  const selected = Array.isArray(msg.selected) ? msg.selected : [];

  if (selected.length === 0) {
    whisperWarning(msg.playerid, t('ui.classify.noSelection', locale));
    return;
  }

  if (classifyRaw === 'show') {
    handleClassifyShow(msg.playerid, selected, locale);
    return;
  }

  if (!VALID_ACTOR_CLASSIFY_TYPES.has(classifyRaw)) {
    whisperWarning(msg.playerid, t('ui.classify.invalidType', locale, { type: classifyRaw }));
    return;
  }

  const scope = scopeRaw === 'token' ? 'token' : 'character';
  const resultLines = [];

  for (const sel of selected) {
    const tokenId = toText(sel._id);
    const token = getGraphicToken(tokenId);
    if (!token) continue;

    const tokenName = getTokenDisplayName(token);
    const line = applyClassifyOverride(token, tokenName, classifyRaw, scope, locale);
    resultLines.push(line);
  }

  if (resultLines.length === 0) {
    whisperWarning(msg.playerid, t('ui.msg.reSelectTokens', locale));
    return;
  }

  whisper(msg.playerid, t('ui.classify.title', locale), [
    heading(t('ui.classify.resultHeading', locale)),
    ...resultLines.map((l) => rawHtml(`<div>${l}</div>`)),
  ]);
}

/**
 * Handles configuration commands.
 *
 * @param {string} playerId GM player id.
 * @param {string|boolean} configText Config command text.
 * @returns {void}
 */
export function handleConfig(playerId, configText) {
  if (configText === true || !toText(configText)) {
    showConfig(playerId);
    return;
  }

  const parts = toText(configText).split(/\s+/);
  const option = parts[0];
  const value = parts.slice(1).join(' ');

  if (option === 'marker') {
    updateMarkerConfig(playerId, value);
    return;
  }

  if (option === 'marker-pick') {
    showMarkerPicker(playerId, value);
    return;
  }

  if (option === 'marker-clear') {
    clearMarkerConfig(playerId, value);
    return;
  }

  if (option === 'useMarkers') {
    updateBooleanConfig(playerId, 'useMarkers', value);
    return;
  }

  if (option === 'icons') {
    updateBooleanConfig(playerId, 'useIcons', value);
    return;
  }

  if (option === 'subjectPromptBypass') {
    updateBooleanConfig(playerId, 'subjectPromptBypass', value);
    return;
  }

  if (option === 'suppressPublicChat') {
    updateBooleanConfig(playerId, 'suppressPublicChat', value);
    return;
  }

  if (option === 'enablePostApplyMacroButtons') {
    updateBooleanConfig(playerId, 'enablePostApplyMacroButtons', value);
    return;
  }

  if (option === 'healthBar') {
    updateHealthBarConfig(playerId, value);
    return;
  }

  if (option === 'language') {
    updateLocaleConfig(playerId, value);
    return;
  }

  if (option === 'gameSystem') {
    updateGameSystemConfig(playerId, value);
    return;
  }

  if (option === 'reset') {
    resetConfig(playerId);
    return;
  }

  whisperWarning(playerId, t('ui.msg.unknownConfig', getConfig().language));
}

/**
 * Restores all configuration settings to their defaults.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
export function resetConfig(playerId) {
  const defaultConfig = createDefaultConfig();
  setConfig(defaultConfig);
  installHandout(defaultConfig.language);
  whisper(
    playerId,
    t('ui.title.configTracker', defaultConfig.language),
    t('ui.msg.configReset', defaultConfig.language)
  );
}

/**
 * Updates the language setting.
 *
 * @param {string} playerId GM player id.
 * @param {string} value Locale string.
 * @returns {void}
 */
export function updateLocaleConfig(playerId, value) {
  const result = validateLocale(value);
  if (!result.valid) {
    const locale = getConfig().language;
    whisperWarning(playerId, [
      invalidLocaleIntro(locale),
      htmlTable(
        [
          t('handout.availableLocales.colLocale', locale),
          t('handout.availableLocales.colLanguage', locale),
        ],
        localeTableRows()
      ),
    ]);
    return;
  }

  applyConfigUpdate(
    playerId,
    (config) => {
      config.language = result.value;
    },
    t('ui.msg.langSet', result.value, {
      locale: localeDisplayName(result.value),
    }),
    result.value
  );

  installHandout(result.value);
}

/**
 * Updates the active game system, resetting markers to the new system's defaults.
 *
 * @param {string} playerId GM player id.
 * @param {string} value Game system id.
 * @returns {void}
 */
export function updateGameSystemConfig(playerId, value) {
  const result = validateGameSystem(value);
  if (!result.valid) {
    const locale = getConfig().language;
    whisperWarning(playerId, [
      t('ui.msg.invalidGameSystem', locale),
      htmlTable(
        [t('ui.col.option', locale), t('ui.col.description', locale)],
        gameSystemTableRows()
      ),
    ]);
    return;
  }

  const config = getConfig();
  const profile = getSystemProfile(result.value);
  applyConfigUpdate(
    playerId,
    (cfg) => {
      cfg.gameSystem = result.value;
      cfg.markers = { ...profile.DEFAULT_MARKERS };
    },
    t('ui.msg.gameSystemSet', config.language, { system: result.value })
  );
  installHandout(getConfig().language);
}

/**
 * Builds display rows for the supported game systems table.
 *
 * Each row contains the system id as a code span and the human-readable name.
 * Used in both the invalid-system warning and the --help output.
 *
 * @returns {string[][]} Two-column table rows: [[id, name], ...].
 */
function gameSystemTableRows() {
  return GAME_SYSTEM_DEFINITIONS.map((def) => [code(def.id), escapeHtml(def.name)]);
}

/**
 * Updates a marker mapping.
 *
 * @param {string} playerId GM player id.
 * @param {string} value Marker assignment text.
 * @returns {void}
 */
export function updateMarkerConfig(playerId, value) {
  const locale = getConfig().language;
  const separatorIndex = value.indexOf('=');
  if (separatorIndex < 1) {
    whisperWarning(playerId, t('ui.msg.markerConfigFormat', locale));
    return;
  }

  const result = validateMarkerConfig(
    value.slice(0, separatorIndex),
    value.slice(separatorIndex + 1)
  );
  if (!result.valid) {
    whisperWarning(playerId, result.message);
    return;
  }

  const resolvedMarker = resolveMarkerTag(result.marker);

  applyConfigUpdate(
    playerId,
    (config) => {
      config.markers[result.condition] = resolvedMarker;
    },
    t('ui.msg.markerSet', locale, {
      condition: result.condition,
      marker: resolvedMarker,
    })
  );
}

/**
 * Shows an icon picker card for selecting a token marker for a condition.
 *
 * Each marker is rendered as a clickable icon button that sends the
 * `--config marker` command to set that marker for the condition.
 *
 * @param {string} playerId GM player id.
 * @param {string} condition Raw condition name from the command.
 * @returns {void}
 */
export function showMarkerPicker(playerId, condition) {
  const locale = getConfig().language;
  const canonical = getCanonicalCondition(condition);
  if (!canonical || isCustomEffectType(canonical)) {
    whisperWarning(playerId, t('ui.msg.markerPredefinedRequired', locale));
    return;
  }

  const allMarkers = getCampaignTokenMarkers();
  const iconMarkers = allMarkers.filter((m) => toText(m.url));

  if (iconMarkers.length === 0) {
    whisperWarning(playerId, t('ui.msg.noMarkersFound', locale));
    return;
  }

  const currentMarker = getConfig().markers[canonical] || '';

  const ICON_BTN_BASE = [
    'display:inline-block',
    'margin:1px',
    'padding:2px',
    'border-radius:3px',
    `background:${COLOR_ACCENT_DARK}`,
    'vertical-align:middle',
    'line-height:0',
  ].join(';');

  const ICON_BTN_SELECTED = `${ICON_BTN_BASE};outline:2px solid ${COLOR_ACCENT_LIGHT}`;

  const iconButtons = iconMarkers.map((m) => {
    const isSelected = m.tag === currentMarker || m.name === currentMarker;
    const btnStyle = isSelected ? ICON_BTN_SELECTED : ICON_BTN_BASE;
    const cmd = `${COMMAND} --config marker ${canonical}=${m.name}`;
    return (
      `<a href="${escapeHtml(cmd)}" style="${btnStyle}" title="${escapeHtml(m.name)}">` +
      `<img src="${escapeHtml(m.url)}" width="28" height="28" /></a>`
    );
  });

  const currentLabel = currentMarker
    ? t('ui.msg.markerPickerCurrent', locale, { marker: currentMarker })
    : t('ui.msg.markerPickerNone', locale);

  const clearCmd = `${COMMAND} --config marker-clear ${canonical}`;

  whisper(playerId, t('ui.title.markerPicker', locale, { condition: canonical }), [
    currentLabel,
    buildButton(t('ui.btn.clearMarker', locale), clearCmd),
    rawHtml(`<div style="margin-top:4px;line-height:0;">${iconButtons.join('')}</div>`),
  ]);
}

/**
 * Clears the marker mapping for a condition.
 *
 * @param {string} playerId GM player id.
 * @param {string} condition Raw condition name from the command.
 * @returns {void}
 */
export function clearMarkerConfig(playerId, condition) {
  const locale = getConfig().language;
  const canonical = getCanonicalCondition(condition);
  if (!canonical || isCustomEffectType(canonical)) {
    whisperWarning(playerId, t('ui.msg.markerPredefinedRequired', locale));
    return;
  }

  applyConfigUpdate(
    playerId,
    (config) => {
      delete config.markers[canonical];
    },
    t('ui.msg.markerCleared', locale, { condition: canonical })
  );
}

/**
 * Persists a config mutation and whispers the success message.
 *
 * @param {string} playerId GM player id.
 * @param {(config: object) => void} applyMutation Config mutator.
 * @param {string} successMessage Success message body.
 * @param {string} [locale] Locale for the config title (defaults to current config language).
 * @returns {void}
 */
function applyConfigUpdate(playerId, applyMutation, successMessage, locale) {
  const config = getConfig();
  applyMutation(config);
  setConfig(config);
  const lang = locale || config.language;
  whisper(playerId, t('ui.title.configTracker', lang), successMessage);
}

/**
 * Updates a boolean config setting.
 *
 * @param {string} playerId GM player id.
 * @param {string} key Config key.
 * @param {string} value Boolean text.
 * @returns {void}
 */
export function updateBooleanConfig(playerId, key, value) {
  const locale = getConfig().language;
  const result = validateBoolean(value);
  if (!result.valid) {
    whisperWarning(playerId, result.message);
    return;
  }

  applyConfigUpdate(
    playerId,
    (config) => {
      config[key] = result.value;
    },
    t('ui.msg.boolSet', locale, { key, value: String(result.value) })
  );
}

/**
 * Updates the configured health bar.
 *
 * @param {string} playerId GM player id.
 * @param {string} value Health bar setting.
 * @returns {void}
 */
export function updateHealthBarConfig(playerId, value) {
  const locale = getConfig().language;
  const result = validateHealthBar(value);
  if (!result.valid) {
    whisperWarning(playerId, result.message);
    return;
  }

  applyConfigUpdate(
    playerId,
    (config) => {
      config.healthBar = result.value;
    },
    t('ui.msg.healthBarSet', locale, { bar: result.value })
  );
}

/**
 * Shows the main or removal menu.
 *
 * @param {string} playerId GM player id.
 * @param {string|boolean} menu Menu name.
 * @returns {void}
 */
export function showMenu(playerId, menu) {
  const config = getConfig();
  const locale = config.language;
  if (menu === MENU_REMOVE) {
    showRemovalMenu(playerId);
    return;
  }

  const cmdPrompt = `${COMMAND} --prompt`;
  const cmdMultiTarget = `${COMMAND} --multi-target`;
  const cmdClassify = `${COMMAND_CLASSIFY} show`;
  const cmdReportToken = COMMAND_REPORT_TOKEN;
  const cmdSaved = COMMAND_SAVED;
  const cmdRemoveMenu = `${COMMAND} --menu remove`;
  const cmdConfig = `${COMMAND} --config`;
  const cmdCleanup = `${COMMAND} --cleanup`;
  const cmdReorder = `${COMMAND} --reorder-conditions`;
  const cmdReinstall = `${COMMAND} --reinstall-macro`;
  const cmdReinstallHandout = `${COMMAND} --reinstall-handout`;
  const cmdHelp = `${COMMAND} --help`;

  whisper(playerId, t('ui.title.menu', locale), [
    heading(t('ui.heading.quickActions', locale)),
    htmlTable(
      [t('ui.col.command', locale), t('ui.col.result', locale)],
      [
        [code(cmdPrompt), buildButton(t('ui.btn.openWizard', locale), cmdPrompt)],
        [code(cmdMultiTarget), buildButton(t('ui.btn.openMultiTarget', locale), cmdMultiTarget)],
        [code(cmdClassify), buildButton(t('ui.classify.title', locale), cmdClassify)],
        [code(cmdReportToken), buildButton(t('ui.btn.reportToken', locale), cmdReportToken)],
        [code(cmdSaved), buildButton(t('ui.btn.savedEffects', locale), cmdSaved)],
        [code(cmdRemoveMenu), buildButton(t('ui.btn.openRemovalList', locale), cmdRemoveMenu)],
        [code(cmdConfig), buildButton(t('ui.btn.showConfig', locale), cmdConfig)],
        [code(cmdCleanup), buildButton(t('ui.btn.runCleanup', locale), cmdCleanup)],
        [code(cmdReorder), buildButton(t('ui.btn.reorderConditions', locale), cmdReorder)],
        [code(cmdReinstall), buildButton(t('ui.btn.reinstallMacros', locale), cmdReinstall)],
        [
          code(cmdReinstallHandout),
          buildButton(t('ui.btn.reinstallHandout', locale), cmdReinstallHandout),
        ],
        [code(cmdHelp), buildButton(t('ui.btn.showHelp', locale), cmdHelp)],
      ]
    ),
    sectionSpacer(),
    heading(t('ui.heading.settings', locale)),
    htmlTable(
      [t('ui.col.option', locale), t('ui.col.value', locale)],
      [
        [
          'enablePostApplyMacroButtons',
          buildButton(
            config.enablePostApplyMacroButtons
              ? t('ui.btn.macroButtonsDisable', locale)
              : t('ui.btn.macroButtonsEnable', locale),
            `${COMMAND} --config enablePostApplyMacroButtons ${!config.enablePostApplyMacroButtons}`
          ),
        ],
      ]
    ),
  ]);
}

/**
 * Shows active conditions with remove buttons.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
export function showRemovalMenu(playerId) {
  const locale = getConfig().language;
  const active = ensureState().active;
  if (active.length === 0) {
    whisper(playerId, t('ui.title.removalMenu', locale), t('ui.msg.noActive', locale));
    return;
  }

  const lines = [];
  for (const condition of active) {
    lines.push(buildRemoveButton(condition));
  }

  whisper(playerId, t('ui.title.removalMenu', locale), lines);
}

/**
 * Shows the current configuration.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
export function showConfig(playerId) {
  const config = getConfig();
  const locale = config.language;
  const profile = getSystemProfile(config.gameSystem);
  const allConditions = [...profile.STANDARD_CONDITIONS, ...profile.CUSTOM_EFFECT_TYPES];
  const markerRows = allConditions.map((condition) => [
    escapeHtml(getConditionDisplayName(condition, profile, locale)),
    code(config.markers[condition] || '(none)'),
  ]);

  const systemDef = GAME_SYSTEM_DEFINITIONS.find((d) => d.id === config.gameSystem);
  const systemLabel = systemDef ? `${config.gameSystem} — ${systemDef.name}` : config.gameSystem;

  whisper(playerId, t('ui.title.config', locale), [
    heading(t('ui.heading.settings', locale)),
    htmlTable(
      [t('ui.col.option', locale), t('ui.col.value', locale)],
      [
        ['gameSystem', code(systemLabel)],
        ['useMarkers', code(String(config.useMarkers))],
        ['useIcons', code(String(config.useIcons))],
        ['subjectPromptBypass', code(String(config.subjectPromptBypass))],
        ['suppressPublicChat', code(String(config.suppressPublicChat))],
        ['enablePostApplyMacroButtons', code(String(config.enablePostApplyMacroButtons))],
        ['healthBar', code(config.healthBar)],
        ['language', code(config.language)],
      ]
    ),
    sectionSpacer(),
    heading(t('ui.heading.markerMappings', locale)),
    htmlTable([t('ui.col.condition', locale), t('ui.col.marker', locale)], markerRows),
  ]);
}

/**
 * Shows command help.
 *
 * @param {string} playerId Player id.
 * @returns {void}
 */
export function showHelp(playerId) {
  const locale = getConfig().language;
  const commandRows = /** @type {string[][]} */ (tRaw('handout.commandsRef.rows', locale) || []);
  const exampleRows = /** @type {string[][]} */ (tRaw('handout.examples.rows', locale) || []);
  const configRows = /** @type {string[][]} */ (tRaw('handout.configuration.rows', locale) || []);
  const quickStartRows = /** @type {string[][]} */ (tRaw('handout.quickStart.rows', locale) || []);

  const configTableRows = configRows.map(([option, values, description]) => [
    code(decodeHelpText(option)),
    escapeHtml(decodeHelpText(values)),
    escapeHtml(decodeHelpText(description)),
  ]);

  whisper(playerId, t('ui.title.help', locale), [
    heading(t('ui.heading.info', locale)),
    htmlTable(
      [t('ui.col.item', locale), t('ui.col.details', locale)],
      [
        [escapeHtml(SCRIPT_NAME), code(SCRIPT_VERSION)],
        [escapeHtml(HANDOUT_NAME), escapeHtml(t('handout.subtitle', locale))],
        [
          escapeHtml(t('handout.overview.heading', locale)),
          escapeHtml(decodeHelpText(t('handout.overview.body', locale))),
        ],
      ]
    ),
    sectionSpacer(),
    heading(t('ui.heading.examples', locale)),
    t('handout.examples.intro', locale),
    htmlTable(
      [t('handout.examples.colMacro', locale), t('handout.examples.colEvent', locale)],
      toEscapedHandoutTableRows(exampleRows)
    ),
    sectionSpacer(),
    heading(t('ui.heading.commandOptions', locale)),
    htmlTable(
      [t('handout.commandsRef.colFlag', locale), t('handout.commandsRef.colDesc', locale)],
      toEscapedHandoutTableRows(commandRows)
    ),
    sectionSpacer(),
    heading(t('handout.configuration.heading', locale)),
    htmlTable(
      [
        t('handout.configuration.colOption', locale),
        t('handout.configuration.colValues', locale),
        t('handout.configuration.colDesc', locale),
      ],
      configTableRows
    ),
    sectionSpacer(),
    heading(t('handout.gameSystems.heading', locale)),
    t('handout.gameSystems.intro', locale),
    htmlTable(
      [t('handout.gameSystems.colId', locale), t('handout.gameSystems.colName', locale)],
      gameSystemTableRows()
    ),
    sectionSpacer(),
    heading(t('handout.availableLocales.heading', locale)),
    t('handout.availableLocales.intro', locale),
    htmlTable(
      [
        t('handout.availableLocales.colLocale', locale),
        t('handout.availableLocales.colLanguage', locale),
      ],
      localeTableRows()
    ),
    sectionSpacer(),
    heading(t('handout.quickStart.heading', locale)),
    htmlTable(
      [t('handout.quickStart.colCommand', locale), t('handout.quickStart.colDesc', locale)],
      toEscapedHandoutTableRows(quickStartRows)
    ),
    sectionSpacer(),
  ]);
}

/**
 * Tries baseName first, then baseName_2, baseName_3, etc.
 *
 * @param {string} baseName Requested macro name.
 * @param {string} playerId GM player id.
 * @returns {string} Unique macro name.
 */
function resolveUniqueMacroName(baseName, playerId) {
  const existingMacros = queryObjects({ _type: 'macro', playerid: playerId });
  const existingNames = new Set(existingMacros.map((m) => m.get('name')));

  if (!existingNames.has(baseName)) {
    return baseName;
  }

  let suffix = 2;
  while (existingNames.has(`${baseName} (${suffix})`)) {
    suffix += 1;
  }
  return `${baseName} (${suffix})`;
}

/**
 * Builds the create-macro command with a localized Roll20 query prompt.
 *
 * @param {'all'|'selected'} mode Macro creation mode.
 * @param {string} locale Locale code.
 * @returns {string} Roll20 API command.
 */
function buildCreateMacroCommand(mode, locale) {
  return `${COMMAND} --create-macro-last ${mode} --macro-name ?{${t('ui.msg.macroNamePrompt', locale)}|}`;
}

/**
 * Creates a macro from the last-apply payload for the invoking GM.
 *
 * Mode 'all' replays the exact same targets; mode 'selected' substitutes
 * @{selected|token_id} so the macro runs on whoever is currently selected.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
function handleCreateMacroLast(playerId, args) {
  const locale = getConfig().language;
  const mode = toText(args['create-macro-last']).toLowerCase();
  const macroName = toText(args['macro-name']).trim();

  const payload = getLastApplyPayload(playerId);
  if (!payload || payload.authorId !== playerId) {
    whisperWarning(playerId, t('ui.msg.macroMissingLastAction', locale));
    return;
  }

  if (!payload.sourceArg || !payload.conditionArg) {
    whisperWarning(playerId, t('ui.msg.macroMissingRequiredData', locale));
    return;
  }

  if (!macroName) {
    whisperWarning(playerId, t('ui.msg.macroInvalidName', locale));
    return;
  }

  const parts = buildMacroParts(payload, mode);

  const resolvedName = resolveUniqueMacroName(macroName, playerId);
  const macroAction = buildCommand(parts);

  let created = false;
  try {
    createObj('macro', {
      playerid: playerId,
      name: resolvedName,
      action: macroAction,
      visibleto: getGmVisibleTo(),
      istokenaction: false,
    });
    created = true;
  } catch (error) {
    log(`${SCRIPT_NAME} macro creation error: ${error.message}`);
  }

  if (!created) {
    whisper(
      playerId,
      t('ui.title.macroCreateFailed', locale),
      t('ui.msg.macroCreateFailed', locale, { reason: 'macro-create-failed' })
    );
    return;
  }

  const otherModeCmd =
    mode === 'selected'
      ? buildCreateMacroCommand('all', locale)
      : buildCreateMacroCommand('selected', locale);

  const otherModeBtn = buildOtherMacroModeButton(mode, payload, locale, otherModeCmd);

  whisper(playerId, t('ui.title.macroCreated', locale), [
    t('ui.msg.macroCreated', locale, { macroName: resolvedName }),
    buildButton(t('ui.btn.runMacroNow', locale), macroAction),
    otherModeBtn,
  ]);
}

/**
 * Builds macro command arguments from a last-apply payload.
 *
 * @param {object} payload Last apply payload.
 * @param {string} mode Macro creation mode.
 * @returns {string[]} Command argument parts.
 */
function buildMacroParts(payload, mode) {
  let targetPart = '--selected-target';
  if (mode !== 'selected') {
    if (payload.targetsArg) {
      targetPart = `--targets ${payload.targetsArg}`;
    } else {
      targetPart = `--target ${payload.targetArg}`;
    }
  }

  return [
    `--source ${payload.sourceArg}`,
    targetPart,
    `--condition ${payload.conditionArg}`,
    `--macro-mode ${mode}`,
    ...(payload.durationArg ? [`--duration ${payload.durationArg}`] : []),
    ...(payload.otherArg ? [`--other ${payload.otherArg}`] : []),
    ...(payload.langArg ? [`--lang ${payload.langArg}`] : []),
  ];
}

/**
 * Builds the opposite-mode macro button after successful macro creation.
 *
 * @param {string} mode Current macro mode.
 * @param {object} payload Last apply payload.
 * @param {string} locale Locale code.
 * @param {string} otherModeCmd Command for the alternate mode.
 * @returns {string} Button HTML.
 */
function buildOtherMacroModeButton(mode, payload, locale, otherModeCmd) {
  if (mode !== 'selected') {
    return buildButton(t('ui.btn.createMacroSelectedTarget', locale), otherModeCmd);
  }

  const firstTargetId = payload.targetArg || (payload.targetsArg || '').split(',')[0];
  const firstToken = firstTargetId ? getGraphicToken(firstTargetId) : null;
  const targetNameHint = firstToken ? getTokenName(firstToken) : '';
  return buildButton(
    t('ui.btn.createMacroSameTargets', locale, { targetName: targetNameHint || firstTargetId }),
    otherModeCmd
  );
}

/**
 * Whispers application details to the GM.
 *
 * @param {string} playerId GM player id.
 * @param {object} condition Active condition record.
 * @param {boolean} appended Whether the row was appended.
 * @param {string} markerNotice Marker notice.
 * @param {string} [locale] Output locale.
 * @param {'all'|'selected'|null} [mode] Macro mode: 'selected' or 'all' suppresses the matching button; null shows both.
 * @returns {void}
 */
export function whisperApplySummary(
  playerId,
  condition,
  appended,
  markerNotice,
  locale,
  mode = null
) {
  const body = [
    heading(t('ui.heading.result', locale)),
    htmlTable(
      [t('ui.col.field', locale), t('ui.col.value', locale)],
      [
        [t('ui.removal.conditionField', locale), escapeHtml(condition.displayText)],
        [
          t('ui.title.turnOrder', locale),
          appended ? t('ui.apply.turnAppended', locale) : t('ui.apply.turnInserted', locale),
        ],
        [t('ui.removal.markerField', locale), escapeHtml(markerNotice)],
        ['Duration', escapeHtml(formatDuration(condition.duration, locale))],
      ]
    ),
  ];

  const config = getConfig();
  if (config.enablePostApplyMacroButtons) {
    const payload = getLastApplyPayload(playerId);
    if (payload && payload.authorId === playerId) {
      const allCmd = buildCreateMacroCommand('all', locale);
      const selectedCmd = buildCreateMacroCommand('selected', locale);
      const buttons = [];
      if (mode !== 'all') {
        buttons.push(
          buildButton(
            t('ui.btn.createMacroSameTargets', locale, {
              targetName: condition.targetName || condition.targetTokenId,
            }),
            allCmd
          )
        );
      }
      if (mode !== 'selected') {
        buttons.push(buildButton(t('ui.btn.createMacroSelectedTarget', locale), selectedCmd));
      }
      if (buttons.length > 0) {
        body.push(heading(t('ui.heading.macroActions', locale)), ...buttons);
      }
    }
  }

  whisper(playerId, t('ui.title.applied', locale), body);
}

/**
 * Builds body lines for one token's condition report.
 *
 * Produces two sections: conditions applied to the token (it is the target)
 * and conditions applied by the token to others (it is the source but not
 * the target, so self-target conditions appear only in the first section).
 *
 * @param {string} tokenId Token id.
 * @param {string} tokenName Token display name.
 * @param {string} locale Output locale.
 * @returns {(string|object)[]} Body lines for the report.
 */
function buildTokenReportSections(tokenId, tokenName, locale) {
  const appliedTo = getActiveByTarget(tokenId);
  const appliedBy = getActiveBySource(tokenId).filter((c) => c.targetTokenId !== tokenId);

  const lines = [heading(tokenName)];

  lines.push(heading(t('ui.heading.appliedTo', locale)));
  if (appliedTo.length === 0) {
    lines.push(t('ui.msg.noConditionsAppliedTo', locale, { name: tokenName }));
  } else {
    lines.push(
      htmlTable(
        [t('ui.col.condition', locale), t('ui.col.duration', locale), ''],
        appliedTo.map((c) => [
          escapeHtml(c.displayText),
          escapeHtml(formatDuration(c.duration, locale)),
          buildButton('🗑', `${COMMAND} --remove ${c.id}`),
        ])
      )
    );
  }

  lines.push(heading(t('ui.heading.appliedBy', locale)));
  if (appliedBy.length === 0) {
    lines.push(t('ui.msg.noConditionsAppliedBy', locale, { name: tokenName }));
  } else {
    lines.push(
      htmlTable(
        [t('ui.col.condition', locale), t('ui.col.duration', locale), ''],
        appliedBy.map((c) => [
          escapeHtml(c.displayText),
          escapeHtml(formatDuration(c.duration, locale)),
          buildButton('🗑', `${COMMAND} --remove ${c.id}`),
        ])
      )
    );
  }

  const savedEffects = getSavedEffectsForToken(tokenId);
  lines.push(heading(t('ui.heading.savedEffectsFor', locale, { name: tokenName })));
  if (savedEffects.length === 0) {
    lines.push(t('ui.msg.noSavedEffects', locale, { name: tokenName }));
  } else {
    lines.push(
      htmlTable(
        [t('ui.saved.field.gmLabel', locale), t('ui.saved.field.visibility', locale), ''],
        savedEffects.map((effect) => {
          const label = effect.gmLabel || effect.condition || '';
          const snoozedLabel = effect.snooze
            ? `${label} (${t('ui.saved.snoozed', locale)})`
            : label;
          return [
            escapeHtml(snoozedLabel),
            escapeHtml(t(`ui.saved.visibility.${effect.visibility}`, locale)),
            buildButton('🗑', `${COMMAND} --saved remove ${effect.id}`),
          ];
        })
      )
    );
  }

  return lines;
}

/**
 * Whispers a GM-only condition report for each selected token.
 *
 * Lists conditions applied to and applied by each token. Requires at least
 * one token to be selected. Output is sent only to the requesting GM.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleReportToken(msg) {
  const locale = getConfig().language;
  const selected = Array.isArray(msg.selected) ? msg.selected : [];

  if (selected.length === 0) {
    whisperWarning(msg.playerid, t('ui.msg.noTokensSelectedReport', locale));
    return;
  }

  const tokenIds = selected.map((s) => toText(s._id)).filter(Boolean);
  if (tokenIds.length === 0) {
    whisperWarning(msg.playerid, t('ui.msg.invalidIds', locale));
    return;
  }

  const bodyLines = [];
  let tokenCount = 0;

  for (const tokenId of tokenIds) {
    const token = getGraphicToken(tokenId);
    if (!token) continue;

    if (tokenCount > 0) {
      bodyLines.push(sectionSpacer());
    }

    const tokenName = getTokenName(token);
    bodyLines.push(...buildTokenReportSections(tokenId, tokenName, locale));
    tokenCount += 1;
  }

  if (tokenCount === 0) {
    whisperWarning(msg.playerid, t('ui.msg.reSelectTokens', locale));
    return;
  }

  whisper(msg.playerid, t('ui.title.tokenReport', locale), bodyLines);
}

/**
 * Formats a stored duration for chat.
 *
 * @param {object} duration Stored duration.
 * @param {string} [locale] Output locale.
 * @returns {string} Human-readable duration.
 */
export function formatDuration(duration, locale) {
  if (!duration || duration.type === DURATION_UNTIL_REMOVED) {
    return t('ui.dur.untilRemovedDisplay', locale);
  }

  return t('ui.dur.turnsRemaining', locale, { n: duration.remaining });
}

/**
 * Whispers all GMs a prompt to selectively remove conditions when a token hits 0 HP.
 * For player tokens, does nothing when there are no active conditions.
 * For NPC tokens, always sends the turn order removal prompt even with no conditions.
 *
 * @param {object} token Roll20 graphic object.
 * @param {string} targetName Token display name.
 * @param {boolean} isPlayer Whether the token is a player-controlled token.
 * @returns {void}
 */
export function promptZeroHpConditionRemoval(token, targetName, isPlayer) {
  const locale = getConfig().language;
  const tokenId = token.id;
  const active = getActiveByTarget(tokenId);
  const title = t('ui.title.zeroHp', locale, { name: targetName });

  if (active.length === 0) {
    if (isPlayer) {
      return;
    }
    whisperGms(title, [
      t('ui.msg.zeroHpNoConditions', locale, { name: targetName }),
      buildButton(
        t('ui.msg.removeFromTurnOrder', locale),
        `${COMMAND} --zero-hp-remove-from-turn ${tokenId}`
      ),
    ]);
    return;
  }

  const lines = [
    t('ui.msg.zeroHpConditions', locale, { name: targetName }),
    ...active.map((condition) => buildRemoveButton(condition)),
    buildButton(
      t('ui.msg.removeAllBtn', locale, { name: targetName }),
      `${COMMAND} --zero-hp-remove-all ${tokenId}`
    ),
  ];

  if (isPlayer) {
    lines.push(
      buildButton(
        t('ui.msg.markIncapacitated', locale),
        `${COMMAND} --zero-hp-incapacitated ${tokenId}`
      )
    );
  } else {
    lines.push(
      buildButton(
        t('ui.msg.removeFromTurnOrder', locale),
        `${COMMAND} --zero-hp-remove-from-turn ${tokenId}`
      )
    );
  }

  whisperGms(title, lines);
}

/**
 * Removes expired duration conditions.
 *
 * @param {string} playerId GM player id.
 * @param {object[]} expired Expired conditions.
 * @returns {void}
 */
export function removeExpiredConditions(playerId, expired) {
  const locale = getConfig().language;
  for (const condition of expired) {
    removeConditionById(condition.id, {
      playerId,
      reason: t('ui.msg.durationExpired', locale),
      publicAnnounce: true,
      whisperResult: true,
      locale,
    });
  }
}

/**
 * Removes all active conditions for a token, used when the GM clicks "Remove All" at 0 HP.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @returns {void}
 */
export function handleZeroHpRemoveAll(playerId, tokenId) {
  const locale = getConfig().language;
  const token = getGraphicToken(tokenId);
  const targetName = token ? getTokenName(token) : tokenId;
  const active = getActiveByTarget(tokenId);
  if (active.length === 0) {
    whisper(playerId, t('ui.title.noConditions', locale), [
      t('ui.msg.noActiveConditions', locale, { name: targetName }),
    ]);
    return;
  }
  for (const condition of active) {
    removeConditionById(condition.id, {
      playerId,
      reason: t('ui.msg.reachedZeroHp', locale, { name: targetName }),
      publicAnnounce: true,
      whisperResult: true,
      locale,
    });
  }
}

/**
 * Removes an NPC token's own row from the turn order when it hits 0 HP,
 * then prompts all GMs to optionally move the token to the map layer.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @returns {void}
 */
export function handleZeroHpRemoveFromTurnOrder(playerId, tokenId) {
  const locale = getConfig().language;
  const token = getGraphicToken(tokenId);
  const targetName = token ? getTokenName(token) : tokenId;
  const removed = removeTokenRow(tokenId);
  const message = removed
    ? t('ui.msg.tokenRemovedFromTurn', locale, { name: targetName })
    : t('ui.msg.tokenNotInTurn', locale, { name: targetName });
  whisper(playerId, t('ui.title.turnOrder', locale), [message]);

  if (token) {
    whisperGms(t('ui.title.moveToken', locale, { name: targetName }), [
      t('ui.msg.moveTokenPrompt', locale, { name: targetName }),
      buildButton(
        t('ui.msg.moveTokenBtn', locale, { name: targetName }),
        `${COMMAND} --zero-hp-to-map ${tokenId}`
      ),
    ]);
  }
}

/**
 * Moves a token to the map layer so it stays visible but is no longer interactive.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @returns {void}
 */
export function handleZeroHpToMapLayer(playerId, tokenId) {
  const locale = getConfig().language;
  const token = getGraphicToken(tokenId);
  if (!token) {
    whisperError(playerId, t('ui.msg.tokenNotFound', locale));
    return;
  }

  const targetName = getTokenName(token);
  token.set('layer', 'map');
  whisper(playerId, t('ui.title.tokenMoved', locale), [
    t('ui.msg.tokenMoved', locale, { name: targetName }),
  ]);
}

/**
 * Removes all active conditions for a player token marked as dead.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @returns {void}
 */
export function handleZeroHpDead(playerId, tokenId) {
  const locale = getConfig().language;
  const token = getGraphicToken(tokenId);
  const targetName = token ? getTokenName(token) : tokenId;
  const active = getActiveByTarget(tokenId);
  if (active.length === 0) {
    whisper(playerId, t('ui.title.markedDead', locale), [
      t('ui.msg.deadNoConditions', locale, { name: targetName }),
    ]);
    return;
  }
  for (const condition of active) {
    removeConditionById(condition.id, {
      playerId,
      reason: t('ui.msg.markedAsDead', locale, { name: targetName }),
      publicAnnounce: true,
      whisperResult: true,
      locale,
    });
  }
}

/**
 * Applies the Incapacitated condition to a player token at 0 HP.
 *
 * @param {string} playerId GM player id.
 * @param {string} tokenId Target token id.
 * @returns {void}
 */
export function handleZeroHpIncapacitated(playerId, tokenId) {
  const config = getConfig();
  const locale = config.language;
  const token = getGraphicToken(tokenId);
  if (!token) {
    whisperError(playerId, t('ui.msg.tokenNotFound', locale));
    return;
  }

  const tokenName = getTokenName(token);

  if (isDuplicate(tokenId, '', '', tokenId, 'Incapacitated', '')) {
    whisperWarning(playerId, t('ui.msg.alreadyIncapacitated', locale, { name: tokenName }));
    return;
  }

  const validation = {
    sourceToken: token,
    subjectToken: null,
    targetToken: token,
    condition: 'Incapacitated',
    customText: '',
  };
  const duration = { type: DURATION_UNTIL_REMOVED };
  const condition = buildConditionRecord(validation, config, duration, locale);
  const markerNotice = applyConfiguredMarker(token, condition, config, locale);
  addActiveCondition(condition);
  const insertResult = insertConditionRow(condition);

  announceHtml(buildApplyMessage(condition, locale));
  whisperApplySummary(playerId, condition, insertResult.appended, markerNotice, locale, null);
}

/**
 * Reorders all condition rows to follow their anchor tokens.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
function handleReorderConditions(playerId) {
  const locale = getConfig().language;
  reorderAllConditionRows();
  whisper(
    playerId,
    t('ui.title.conditionReorder', locale),
    t('ui.msg.conditionsReordered', locale)
  );
}

/**
 * Reinstalls all GM macros for all current GM players.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
export function handleReinstallMacro(playerId) {
  const locale = getConfig().language;
  installMacro();
  whisper(
    playerId,
    t('ui.title.macroReinstalled', locale),
    t('ui.msg.macroReinstalled', locale, {
      wizard: MACRO_NAME,
      multiTarget: MACRO_NAME_MULTI_TARGET,
      reportToken: MACRO_NAME_REPORT_TOKEN,
      saved: MACRO_NAME_SAVED,
      classify: MACRO_NAME_CLASSIFY,
    })
  );
}

/**
 * Reinstalls the localized help handout for the current configured language.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
export function handleReinstallHandout(playerId) {
  const locale = getConfig().language;
  installHandout(locale);
  whisper(
    playerId,
    t('ui.title.handoutReinstalled', locale),
    t('ui.msg.handoutReinstalled', locale, { handout: HANDOUT_NAME })
  );
}
