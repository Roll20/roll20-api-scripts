import {
  COMMAND,
  COLOR_BG_SOFT_BLACK,
  COLOR_HEADER_DARK,
  COLOR_HEADER_LIGHT,
  CUSTOM_EFFECT_TYPES,
  DURATION_OPTIONS,
  DURATION_UNTIL_REMOVED,
  MACRO_NAME,
  MACRO_NAME_MULTI_TARGET,
  HANDOUT_NAME,
  MENU_REMOVE,
  SCRIPT_NAME,
  SCRIPT_VERSION,
  STANDARD_CONDITIONS,
} from "./constants.js";
import {
  buildApplyMessage,
  buildDisplayText,
  getCanonicalCondition,
  isCustomEffectType,
  isCustomTextCondition,
} from "./conditions.js";
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
} from "./chat.js";
import { parseDuration } from "./durations.js";
import { applyMarker } from "./markers.js";
import { parseCommand } from "./parser.js";
import { removeConditionById } from "./removal.js";
import {
  addActiveCondition,
  createDefaultConfig,
  ensureState,
  findActiveCondition,
  someActiveCondition,
  getConfig,
  getActiveByTarget,
  setConfig,
} from "./state.js";
import {
  escapeHtml,
  getGraphicToken,
  getTokenName,
  createId,
  queryObjects,
  toText,
} from "./utils.js";
import {
  getCurrentTurnTokenId,
  getTurnOrder,
  getTokenRowId,
  insertConditionRow,
  insertConditionRows,
  removeTokenRow,
  reorderAllConditionRows,
} from "./turnOrder.js";
import {
  validateApplyArgs,
  validateBoolean,
  validateHealthBar,
  validateLocale,
  validateMarkerConfig,
  isGmMessage,
} from "./validation.js";
import { runCleanup } from "./cleanup.js";
import { installMacro } from "./macros.js";
import { installHandout } from "./handout.js";
import {
  getLocale,
  getLocalizedLanguageName,
  LOCALE_DEFINITIONS,
  t,
  tRaw,
} from "./i18n.js";

const SUBJECT_NONE = "__none__";

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
].join(";");

/**
 * Builds an in-card section heading distinct from the message header.
 *
 * @param {string} text Heading text.
 * @returns {object} Trusted HTML line.
 */
function heading(text) {
  return rawHtml(
    `<div style="${SECTION_HEADING_STYLE}">${escapeHtml(text)}</div>`,
  );
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
  return toText(value)
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&amp;", "&");
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
    .join("-");
  return codepoints
    ? `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${codepoints}.svg`
    : "";
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
    return "";
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
  const locale = LOCALE_DEFINITIONS.find(
    (definition) => definition.code === localeCode,
  );
  if (!locale) {
    return localeCode;
  }

  const nativeName =
    locale.nativeName && locale.nativeName !== locale.name
      ? ` (${locale.nativeName})`
      : "";
  return `${locale.name}${nativeName} [${locale.code}]`;
}

/**
 * Builds a localized intro for invalid locale warnings.
 *
 * @param {string} locale Active locale.
 * @returns {string} Intro text ending before the locale table.
 */
function invalidLocaleIntro(locale) {
  return t("ui.msg.invalidLocale", locale, { locales: "" })
    .replace(/\s*:?\s*\.?$/, ":")
    .trim();
}

/**
 * Builds rows for the supported-locale help table.
 *
 * @returns {string[][]} Trusted HTML table rows.
 */
function localeTableRows() {
  return LOCALE_DEFINITIONS.map((locale) => [
    code(locale.code),
    localeLabel(locale),
  ]);
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
  return buildButton(
    token.name,
    buildWizardBase({ ...args, [slot]: token.id }),
  );
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
  return rows.map(([a, b]) => [
    code(decodeHelpText(a)),
    escapeHtml(decodeHelpText(b)),
  ]);
}

/**
 * Adds light spacing between structured sections.
 *
 * @returns {object} Trusted HTML spacer.
 */
function sectionSpacer() {
  return rawHtml("<br><br>");
}

/**
 * Returns true when a character's sheet-level npc attribute marks it as a PC.
 *
 * Works for sheets that expose an "npc" attribute (e.g. D&D 5e OGL).
 * Returns undefined when the attribute is absent so callers can fall back.
 * Uses findObjs instead of getAttrByName to avoid Roll20 console errors when
 * the attribute does not exist on the character sheet.
 *
 * @param {string} characterId Roll20 character id.
 * @returns {boolean|undefined} True for PC, false for NPC, undefined if unknown.
 */
function isPlayerByNpcAttribute(characterId) {
  const attrs = queryObjects({
    _type: "attribute",
    _characterid: characterId,
    name: "npc",
  });
  if (attrs.length === 0) return undefined;
  return attrs[0].get("current") !== "1";
}

/**
 * Returns true when a character's controlledby field includes at least one
 * non-GM player.
 *
 * @param {object} character Roll20 character object.
 * @returns {boolean} True for player-controlled characters.
 */
function isPlayerByControlledBy(character) {
  const controlledBy = toText(character.get("controlledby"));
  if (!controlledBy) return false;
  // "all" is a Roll20 sentinel meaning every player can see the sheet —
  // it does not indicate a player character, so exclude it.
  return controlledBy
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && id !== "all")
    .some((id) => !playerIsGM(id));
}

/**
 * Returns true when a token is directly controlled by at least one non-GM player
 * via its token-level controlledby field.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {boolean} True when a non-GM player controls the token directly.
 */
function isPlayerByTokenControlledBy(token) {
  const controlledBy = toText(token.get("controlledby"));
  if (!controlledBy) return false;
  return controlledBy
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id && id !== "all")
    .some((id) => !playerIsGM(id));
}

/**
 * Returns true when a token is linked to a player character.
 *
 * Checks token-level controlledby first (catches player-owned NPC stat blocks
 * such as an Echo Knight's echo). Then falls back to sheet npc attribute and
 * the character-level controlledby field.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {boolean} True for player tokens.
 */
export function isPlayerToken(token) {
  if (isPlayerByTokenControlledBy(token)) return true;
  const characterId = toText(token.get("represents"));
  if (!characterId) return false;
  const character = getObj("character", characterId);
  if (!character) return false;
  const byAttr = isPlayerByNpcAttribute(characterId);
  if (byAttr !== undefined) return byAttr;
  return isPlayerByControlledBy(character);
}

/**
 * Returns the display name for a token: the token's own name field, falling
 * back to the linked character's name when the token field is blank.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {string} Display name, or empty string if none found.
 */
function getTokenDisplayName(token) {
  const tokenName = toText(token.get("name"));
  if (tokenName) return tokenName;
  const characterId = toText(token.get("represents"));
  if (!characterId) return "";
  const character = getObj("character", characterId);
  return character ? toText(character.get("name")) : "";
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
  if (raw === "" || raw === null || raw === undefined) return false;
  const value = Number(raw);
  return Number.isFinite(value) && value <= 0;
}

/**
 * Converts one Roll20 graphic token into a token entry, or null when the
 * token has no resolvable name or has zero HP.
 *
 * @param {object} token Roll20 graphic object.
 * @returns {{id: string, name: string, isPlayer: boolean}|null} Token entry.
 */
function tokenToEntry(token) {
  if (hasZeroHp(token)) return null;
  const name = getTokenDisplayName(token);
  if (!name) return null;
  return { id: token.id, name, isPlayer: isPlayerToken(token) };
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
    const entry = tokenToEntry(token);
    if (entry) entries.push(entry);
  }
  return entries;
}

/**
 * Returns token entries sourced from the active player page.
 *
 * @returns {{id: string, name: string, isPlayer: boolean}[]} Token entries.
 */
function getTokensFromPage() {
  const pageId = Campaign().get("playerpageid");
  return queryObjects({ _type: "graphic", _pageid: pageId })
    .map(tokenToEntry)
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
  const entries =
    fromTurnOrder.length > 0 ? fromTurnOrder : getTokensFromPage();
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
  const parts = ["--prompt"];
  const sourceId = toText(args.source);
  const subjectRaw = toText(args.subject);
  const subjectId = subjectRaw === SUBJECT_NONE ? "" : subjectRaw;
  const targetId = toText(args.target);
  const targetsRaw = toText(args.targets);
  const selectedIdsRaw = toText(args["selected-ids"]);
  const conditionRaw = toText(args.condition);
  const canonical = conditionRaw ? getCanonicalCondition(conditionRaw) : "";
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
 * Builds a Roll20 command string with the script command prefix.
 *
 * @param {string[]} parts Command parts excluding the base command.
 * @returns {string} Joined command string.
 */
function buildCommand(parts) {
  return [COMMAND, ...parts].join(" ");
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
    const options = DURATION_OPTIONS.includes(text)
      ? [text, ...rest]
      : [text, ...DURATION_OPTIONS];
    return `?{Duration|${options.join("|")}}`;
  }
  return `?{Duration|${DURATION_OPTIONS.join("|")}}`;
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
      i < leftButtons.length ? leftButtons[i] : "",
      i < rightButtons.length ? rightButtons[i] : "",
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
    whisper(playerId, title, t("ui.wizard.noTokens", locale));
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
      rawHtml(
        `<div style="font-style:italic;margin:2px 0 4px;">${escapeHtml(description)}</div>`,
      ),
    );
  }
  if (slot === "subject") {
    body.push(
      buildButton(
        t("ui.wizard.noneBtn", locale),
        buildWizardBase({ ...args, subject: SUBJECT_NONE }),
      ),
    );
  }
  if (slot === "target") {
    const sourceId = toText(args.source);
    if (sourceId) {
      body.push(
        buildButton(
          t("ui.wizard.noneOrSourceBtn", locale),
          buildWizardBase({ ...args, target: sourceId }),
        ),
      );
    }
  }
  body.push(
    htmlTable(
      [t("ui.col.players", locale), t("ui.col.npcs", locale)],
      tableRows,
    ),
  );
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
  const selectedIdsRaw = toText(args["selected-ids"]);
  const ids = selectedIdsRaw.split(",").filter(Boolean);

  const resolved = ids
    .map((id) => {
      const token = getGraphicToken(id);
      if (!token) return null;
      const name = getTokenDisplayName(token);
      return name ? { id, name } : null;
    })
    .filter(Boolean);

  if (resolved.length === 0) {
    whisperWarning(playerId, t("ui.msg.reSelectTokens", locale));
    return;
  }

  const confirmedIds = resolved.map((tok) => tok.id).join(",");
  const confirmCmd = buildWizardBase({
    ...args,
    targets: confirmedIds,
    "selected-ids": "",
  });
  const tokenListHtml = resolved
    .map((tok) => `<div style="padding:1px 0;">• ${escapeHtml(tok.name)}</div>`)
    .join("");

  whisper(playerId, t("ui.wizard.confirmTargetTitle", locale), [
    rawHtml(
      `<div style="margin-bottom:4px;font-style:italic;">${escapeHtml(t("ui.wizard.confirmIntro", locale))}</div>`,
    ),
    rawHtml(tokenListHtml),
    buildButton(t("ui.wizard.confirmBtn", locale), confirmCmd),
  ]);
}

/**
 * Whispers condition selection buttons in a two-column layout.
 *
 * Left column: standard D&D conditions. Right column: custom effect types.
 * All buttons advance the wizard to the target/subject step.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Current wizard args.
 * @returns {void}
 */
function showConditionStep(playerId, args) {
  const locale = getConfig().language;
  const base = buildWizardBase(args);

  const standardButtons = STANDARD_CONDITIONS.map((c) =>
    buildButton(t(`condNames.${c}`, locale), `${base} --condition ${c}`),
  );

  const customButtons = CUSTOM_EFFECT_TYPES.map((c) =>
    buildButton(t(`condNames.${c}`, locale), `${base} --condition ${c}`),
  );

  const tableRows = buildTwoColumnRows(standardButtons, customButtons);

  whisper(playerId, t("ui.wizard.selectCondition", locale), [
    htmlTable(
      [t("ui.col.conditions", locale), t("ui.col.customEffects", locale)],
      tableRows,
    ),
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
    { dur: "Until removed", label: t("ui.dur.untilRemoved", locale) },
    {
      dur: "End of target next turn",
      label: t("ui.dur.endOfTargetTurn", locale),
    },
    {
      dur: "End of source next turn",
      label: t("ui.dur.endOfSourceTurn", locale),
    },
  ];
  const rightOptions = [
    { dur: "1 round", label: t("ui.dur.round1", locale) },
    { dur: "2 rounds", label: t("ui.dur.round2", locale) },
    { dur: "3 rounds", label: t("ui.dur.round3", locale) },
    { dur: "10 rounds", label: t("ui.dur.round10", locale) },
  ];
  const customPrompt = t("ui.dur.customPrompt", locale);
  const customCmd = buildDurationCommand(args, `?{${customPrompt}|} rounds`);

  const leftButtons = leftOptions.map(({ dur, label }) =>
    buildButton(label, buildDurationCommand(args, dur)),
  );
  const rightButtons = [
    ...rightOptions.map(({ dur, label }) =>
      buildButton(label, buildDurationCommand(args, dur)),
    ),
    buildButton(t("ui.dur.custom", locale), customCmd),
  ];

  const tableRows = buildTwoColumnRows(leftButtons, rightButtons);

  whisper(playerId, t("ui.wizard.selectDuration", locale), [
    htmlTable(
      [t("ui.col.permanentTurnEnd", locale), t("ui.col.rounds", locale)],
      tableRows,
    ),
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
    condition === "Other"
      ? t("ui.wizard.otherText", locale)
      : t("ui.wizard.effectDetails", locale, { condition });
  const parts = [
    `--source ${sourceId}`,
    targetsRaw ? `--targets ${targetsRaw}` : `--target ${targetId}`,
    `--condition ${condition}`,
    `--other ?{${prompt}|}`,
    `--duration ${durationQuery}`,
  ];
  if (langRaw) parts.push(`--lang ${langRaw}`);
  const cmd = buildCommand(parts);
  whisper(playerId, t("ui.wizard.applyEffectTitle", locale, { condition }), [
    buildButton(t("ui.wizard.enterDetails", locale), cmd),
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
  const value = subjectId === SUBJECT_NONE ? "" : subjectId;
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
  const canonical = conditionRaw ? getCanonicalCondition(conditionRaw) : "";
  const config = getConfig();
  const subjectBypassForCommand = resolveSubjectPromptBypassOverride(
    args,
    config.subjectPromptBypass,
  );
  if (!subjectBypassForCommand.valid) {
    whisperWarning(playerId, subjectBypassForCommand.message);
    return;
  }

  const shouldBypassSubject =
    subjectBypassForCommand.value && isCustomEffectType(canonical);
  const wizardArgs = shouldBypassSubject
    ? { ...args, subject: SUBJECT_NONE }
    : args;

  const sourceId = toText(wizardArgs.source);
  const subjectRaw = toText(wizardArgs.subject);
  const subjectId = subjectRaw === SUBJECT_NONE ? "" : subjectRaw;

  const locale = getConfig().language;

  if (!isSubjectAllowed(toText(wizardArgs.subject), canonical)) {
    whisperWarning(playerId, t("ui.msg.subjectOnlyCustom", locale));
    return;
  }

  if (!canonical) {
    showConditionStep(playerId, wizardArgs);
    return;
  }

  const subjectChosen = Boolean(subjectId) || subjectRaw === SUBJECT_NONE;
  if (isCustomEffectType(canonical) && !subjectChosen) {
    showTokenStep(
      playerId,
      t("ui.wizard.selectSubject", locale),
      wizardArgs,
      "subject",
      t("ui.wizard.subjectDesc", locale),
    );
    return;
  }

  if (!sourceId) {
    showTokenStep(
      playerId,
      t("ui.wizard.selectSource", locale),
      wizardArgs,
      "source",
      t("ui.wizard.sourceDesc", locale),
    );
    return;
  }

  const targetId = toText(wizardArgs.target);
  const targetsRaw = toText(wizardArgs.targets);

  if (!targetId && !targetsRaw) {
    const selectedIdsRaw = toText(wizardArgs["selected-ids"]);
    if (selectedIdsRaw) {
      showMultiTargetStep(playerId, wizardArgs);
      return;
    }
    showTokenStep(
      playerId,
      t("ui.wizard.selectTarget", locale),
      wizardArgs,
      "target",
      t("ui.wizard.targetDesc", locale),
    );
    return;
  }

  const resolvedArgs =
    subjectRaw === SUBJECT_NONE ? { ...wizardArgs, subject: "" } : wizardArgs;

  showEffectDetailStep(playerId, resolvedArgs, canonical);
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
  const overrideRaw = args.subjectPromptBypass ?? args["subject-prompt-bypass"];
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
      message: t("ui.msg.subjectBypassInvalid", getConfig().language),
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
    whisperError(msg.playerid, t("ui.msg.commandFailed", getConfig().language));
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
  return Boolean(
    msg && msg.type === "api" && toText(msg.content).startsWith(COMMAND),
  );
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
    whisperError(msg.playerid, t("ui.msg.gmOnly", getConfig().language));
    return;
  }

  if (args["multi-target"] !== undefined) {
    handleMultiTargetTrigger(msg);
    return;
  }

  if (args.prompt !== undefined) {
    showPromptUi(msg.playerid, args);
    return;
  }

  if (args.menu) {
    showMenu(msg.playerid, args.menu);
    return;
  }

  if (args.remove) {
    handleRemove(msg.playerid, args.remove);
    return;
  }

  if (args.cleanup) {
    runCleanup(msg.playerid);
    return;
  }

  if (args["reorder-conditions"] !== undefined) {
    handleReorderConditions(msg.playerid);
    return;
  }

  if (args["reinstall-macro"]) {
    handleReinstallMacro(msg.playerid);
    return;
  }

  if (args["reinstall-handout"]) {
    handleReinstallHandout(msg.playerid);
    return;
  }

  if (args.config) {
    handleConfig(msg.playerid, args.config);
    return;
  }

  if (args.targets) {
    handleMultiApply(msg.playerid, args);
    return;
  }

  if (args.source || args.target || args.subject || args.condition) {
    handleApply(msg.playerid, args);
    return;
  }

  routeZeroHpCommand(msg.playerid, args);
}

/**
 * Dispatches zero-HP event commands, falling back to the main menu.
 *
 * @param {string} playerId GM player id.
 * @param {object} args Parsed command arguments.
 * @returns {void}
 */
function routeZeroHpCommand(playerId, args) {
  if (args["zero-hp-dead"]) {
    handleZeroHpDead(playerId, args["zero-hp-dead"]);
    return;
  }
  if (args["zero-hp-incapacitated"]) {
    handleZeroHpIncapacitated(playerId, args["zero-hp-incapacitated"]);
    return;
  }
  if (args["zero-hp-remove-all"]) {
    handleZeroHpRemoveAll(playerId, args["zero-hp-remove-all"]);
    return;
  }
  if (args["zero-hp-remove-from-turn"]) {
    handleZeroHpRemoveFromTurnOrder(playerId, args["zero-hp-remove-from-turn"]);
    return;
  }
  if (args["zero-hp-to-map"]) {
    handleZeroHpToMapLayer(playerId, args["zero-hp-to-map"]);
    return;
  }
  showMenu(playerId, "main");
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
    whisperWarning(msg.playerid, t("ui.msg.noSelection", locale));
    return;
  }
  const selectedIds = selected
    .map((s) => toText(s._id))
    .filter(Boolean)
    .join(",");
  if (!selectedIds) {
    whisperWarning(msg.playerid, t("ui.msg.invalidIds", locale));
    return;
  }
  showPromptUi(msg.playerid, { prompt: true, "selected-ids": selectedIds });
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
      validation.subjectToken?.id || "",
      validation.subjectName || "",
      validation.targetToken.id,
      validation.condition,
      validation.customText,
    )
  ) {
    whisperWarning(playerId, t("ui.msg.duplicate", locale));
    return null;
  }

  const condition = buildConditionRecord(
    validation,
    config,
    durationResult.duration,
    locale,
  );
  const markerNotice = applyConfiguredMarker(
    validation.targetToken,
    condition,
    config,
    locale,
  );
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
  const targetIds = targetsRaw.split(",").filter(Boolean);
  if (targetIds.length === 0) {
    whisperWarning(playerId, t("ui.msg.noTargets", getConfig().language));
    return;
  }

  const prepared = [];
  for (const targetId of targetIds) {
    const prep = prepareApply(playerId, {
      ...args,
      target: targetId,
      targets: "",
    });
    if (!prep) continue;
    addActiveCondition(prep.condition);
    prepared.push(prep);
  }

  if (prepared.length === 0) return;

  const insertResults = insertConditionRows(prepared.map((p) => p.condition));

  for (let i = 0; i < prepared.length; i++) {
    const { condition, markerNotice, locale, extraLocale } = prepared[i];
    const { appended } = insertResults[i];
    announceHtml(buildApplyMessage(condition, locale));
    if (extraLocale !== locale) {
      announceHtml(buildApplyMessage(condition, extraLocale));
    }
    whisperApplySummary(playerId, condition, appended, markerNotice, locale);
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

  announceHtml(buildApplyMessage(condition, locale));
  if (extraLocale !== locale) {
    announceHtml(buildApplyMessage(condition, extraLocale));
  }
  whisperApplySummary(
    playerId,
    condition,
    insertResult.appended,
    markerNotice,
    locale,
  );
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
    : validation.subjectName || "";
  const targetName = getTokenName(validation.targetToken);
  const marker = toText(config.markers[validation.condition]) || "";
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
    subjectTokenId: validation.subjectToken?.id || "",
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
    return t("ui.msg.markersDisabled", locale);
  }

  if (!condition.marker) {
    return t("ui.msg.noMarkerConfigured", locale);
  }

  const added = applyMarker(targetToken, condition.marker);
  return added
    ? t("ui.msg.markerApplied", locale, { marker: condition.marker })
    : t("ui.msg.markerPresent", locale, { marker: condition.marker });
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
  customText,
) {
  return someActiveCondition((activeCondition) => {
    const sameSource = activeCondition.sourceTokenId === sourceTokenId;
    const sameSubject =
      (activeCondition.subjectTokenId || "") === (subjectTokenId || "");
    const sameSubjectName =
      (activeCondition.subjectName || "") === (subjectName || "");
    const sameTarget = activeCondition.targetTokenId === targetTokenId;
    const sameCondition = activeCondition.condition === condition;
    const sameCustomText = activeCondition.customText === customText;
    return (
      sameSource &&
      sameSubject &&
      sameSubjectName &&
      sameTarget &&
      sameCondition &&
      sameCustomText
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
    whisperWarning(playerId, t("ui.msg.conditionNotFound", locale));
    return;
  }

  removeConditionById(condition.id, {
    playerId,
    reason: t("ui.msg.manuallyRemoved", locale),
    publicAnnounce: true,
    whisperResult: true,
    locale,
  });
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
  const value = parts.slice(1).join(" ");

  if (option === "marker") {
    updateMarkerConfig(playerId, value);
    return;
  }

  if (option === "useMarkers") {
    updateBooleanConfig(playerId, "useMarkers", value);
    return;
  }

  if (option === "icons") {
    updateBooleanConfig(playerId, "useIcons", value);
    return;
  }

  if (option === "subjectPromptBypass") {
    updateBooleanConfig(playerId, "subjectPromptBypass", value);
    return;
  }

  if (option === "healthBar") {
    updateHealthBarConfig(playerId, value);
    return;
  }

  if (option === "language") {
    updateLocaleConfig(playerId, value);
    return;
  }

  if (option === "reset") {
    resetConfig(playerId);
    return;
  }

  whisperWarning(playerId, t("ui.msg.unknownConfig", getConfig().language));
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
    t("ui.title.configTracker", defaultConfig.language),
    t("ui.msg.configReset", defaultConfig.language),
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
          t("handout.availableLocales.colLocale", locale),
          t("handout.availableLocales.colLanguage", locale),
        ],
        localeTableRows(),
      ),
    ]);
    return;
  }

  applyConfigUpdate(
    playerId,
    (config) => {
      config.language = result.value;
    },
    t("ui.msg.langSet", result.value, {
      locale: localeDisplayName(result.value),
    }),
    result.value,
  );

  installHandout(result.value);
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
  const separatorIndex = value.indexOf("=");
  if (separatorIndex < 1) {
    whisperWarning(playerId, t("ui.msg.markerConfigFormat", locale));
    return;
  }

  const result = validateMarkerConfig(
    value.slice(0, separatorIndex),
    value.slice(separatorIndex + 1),
  );
  if (!result.valid) {
    whisperWarning(playerId, result.message);
    return;
  }

  applyConfigUpdate(
    playerId,
    (config) => {
      config.markers[result.condition] = result.marker;
    },
    t("ui.msg.markerSet", locale, {
      condition: result.condition,
      marker: result.marker,
    }),
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
  whisper(playerId, t("ui.title.configTracker", lang), successMessage);
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
    t("ui.msg.boolSet", locale, { key, value: String(result.value) }),
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
    t("ui.msg.healthBarSet", locale, { bar: result.value }),
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
  const locale = getConfig().language;
  if (menu === MENU_REMOVE) {
    showRemovalMenu(playerId);
    return;
  }

  const cmdPrompt = `${COMMAND} --prompt`;
  const cmdMultiTarget = `${COMMAND} --multi-target`;
  const cmdRemoveMenu = `${COMMAND} --menu remove`;
  const cmdConfig = `${COMMAND} --config`;
  const cmdCleanup = `${COMMAND} --cleanup`;
  const cmdReorder = `${COMMAND} --reorder-conditions`;
  const cmdReinstall = `${COMMAND} --reinstall-macro`;
  const cmdReinstallHandout = `${COMMAND} --reinstall-handout`;
  const cmdHelp = `${COMMAND} --help`;

  whisper(playerId, t("ui.title.menu", locale), [
    heading(t("ui.heading.quickActions", locale)),
    htmlTable(
      [t("ui.col.command", locale), t("ui.col.result", locale)],
      [
        [
          code(cmdPrompt),
          buildButton(t("ui.btn.openWizard", locale), cmdPrompt),
        ],
        [
          code(cmdMultiTarget),
          buildButton(t("ui.btn.openMultiTarget", locale), cmdMultiTarget),
        ],
        [
          code(cmdRemoveMenu),
          buildButton(t("ui.btn.openRemovalList", locale), cmdRemoveMenu),
        ],
        [
          code(cmdConfig),
          buildButton(t("ui.btn.showConfig", locale), cmdConfig),
        ],
        [
          code(cmdCleanup),
          buildButton(t("ui.btn.runCleanup", locale), cmdCleanup),
        ],
        [
          code(cmdReorder),
          buildButton(t("ui.btn.reorderConditions", locale), cmdReorder),
        ],
        [
          code(cmdReinstall),
          buildButton(t("ui.btn.reinstallMacro", locale), cmdReinstall),
        ],
        [
          code(cmdReinstallHandout),
          buildButton(
            t("ui.btn.reinstallHandout", locale),
            cmdReinstallHandout,
          ),
        ],
        [code(cmdHelp), buildButton(t("ui.btn.showHelp", locale), cmdHelp)],
      ],
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
    whisper(
      playerId,
      t("ui.title.removalMenu", locale),
      t("ui.msg.noActive", locale),
    );
    return;
  }

  const lines = [];
  for (const condition of active) {
    lines.push(buildRemoveButton(condition));
  }

  whisper(playerId, t("ui.title.removalMenu", locale), lines);
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
  const markerRows = [];
  for (const condition of STANDARD_CONDITIONS) {
    markerRows.push([
      escapeHtml(condition),
      code(config.markers[condition] || "(none)"),
    ]);
  }

  whisper(playerId, t("ui.title.config", locale), [
    heading(t("ui.heading.settings", locale)),
    htmlTable(
      [t("ui.col.option", locale), t("ui.col.value", locale)],
      [
        ["useMarkers", code(String(config.useMarkers))],
        ["useIcons", code(String(config.useIcons))],
        ["subjectPromptBypass", code(String(config.subjectPromptBypass))],
        ["healthBar", code(config.healthBar)],
        ["language", code(config.language)],
      ],
    ),
    sectionSpacer(),
    heading(t("ui.heading.markerMappings", locale)),
    htmlTable(
      [t("ui.col.condition", locale), t("ui.col.marker", locale)],
      markerRows,
    ),
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
  const commandRows = /** @type {string[][]} */ (
    tRaw("handout.commandsRef.rows", locale) || []
  );
  const quickStartRows = /** @type {string[][]} */ (
    tRaw("handout.quickStart.rows", locale) || []
  );
  const configRows = /** @type {string[][]} */ (
    tRaw("handout.configuration.rows", locale) || []
  );

  const configTableRows = configRows.map(([option, values, description]) => [
    code(decodeHelpText(option)),
    escapeHtml(decodeHelpText(values)),
    escapeHtml(decodeHelpText(description)),
  ]);

  whisper(playerId, t("ui.title.help", locale), [
    heading(t("ui.heading.info", locale)),
    htmlTable(
      [t("ui.col.item", locale), t("ui.col.details", locale)],
      [
        [escapeHtml(SCRIPT_NAME), code(SCRIPT_VERSION)],
        [escapeHtml(HANDOUT_NAME), escapeHtml(t("handout.subtitle", locale))],
        [
          escapeHtml(t("handout.overview.heading", locale)),
          escapeHtml(decodeHelpText(t("handout.overview.body", locale))),
        ],
      ],
    ),
    sectionSpacer(),
    heading(t("ui.heading.commandOptions", locale)),
    htmlTable(
      [
        t("handout.commandsRef.colFlag", locale),
        t("handout.commandsRef.colDesc", locale),
      ],
      toEscapedHandoutTableRows(commandRows),
    ),
    sectionSpacer(),
    heading(t("handout.configuration.heading", locale)),
    htmlTable(
      [
        t("handout.configuration.colOption", locale),
        t("handout.configuration.colValues", locale),
        t("handout.configuration.colDesc", locale),
      ],
      configTableRows,
    ),
    sectionSpacer(),
    heading(t("handout.availableLocales.heading", locale)),
    t("handout.availableLocales.intro", locale),
    htmlTable(
      [
        t("handout.availableLocales.colLocale", locale),
        t("handout.availableLocales.colLanguage", locale),
      ],
      localeTableRows(),
    ),
    sectionSpacer(),
    heading(t("ui.heading.examples", locale)),
    htmlTable(
      [
        t("handout.quickStart.colCommand", locale),
        t("handout.quickStart.colDesc", locale),
      ],
      toEscapedHandoutTableRows(quickStartRows),
    ),
    sectionSpacer(),
  ]);
}

/**
 * Whispers application details to the GM.
 *
 * @param {string} playerId GM player id.
 * @param {object} condition Active condition record.
 * @param {boolean} appended Whether the row was appended.
 * @param {string} markerNotice Marker notice.
 * @param {string} [locale] Output locale.
 * @returns {void}
 */
export function whisperApplySummary(
  playerId,
  condition,
  appended,
  markerNotice,
  locale,
) {
  whisper(playerId, t("ui.title.applied", locale), [
    heading(t("ui.heading.result", locale)),
    htmlTable(
      [t("ui.col.field", locale), t("ui.col.value", locale)],
      [
        [
          t("ui.removal.conditionField", locale),
          escapeHtml(condition.displayText),
        ],
        [
          t("ui.title.turnOrder", locale),
          appended
            ? t("ui.apply.turnAppended", locale)
            : t("ui.apply.turnInserted", locale),
        ],
        [t("ui.removal.markerField", locale), escapeHtml(markerNotice)],
        ["Duration", escapeHtml(formatDuration(condition.duration, locale))],
      ],
    ),
  ]);
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
    return t("ui.dur.untilRemovedDisplay", locale);
  }

  return t("ui.dur.turnsRemaining", locale, { n: duration.remaining });
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
  const title = t("ui.title.zeroHp", locale, { name: targetName });

  if (active.length === 0) {
    if (isPlayer) {
      return;
    }
    whisperGms(title, [
      t("ui.msg.zeroHpNoConditions", locale, { name: targetName }),
      buildButton(
        t("ui.msg.removeFromTurnOrder", locale),
        `${COMMAND} --zero-hp-remove-from-turn ${tokenId}`,
      ),
    ]);
    return;
  }

  const lines = [
    t("ui.msg.zeroHpConditions", locale, { name: targetName }),
    ...active.map((condition) => buildRemoveButton(condition)),
    buildButton(
      t("ui.msg.removeAllBtn", locale, { name: targetName }),
      `${COMMAND} --zero-hp-remove-all ${tokenId}`,
    ),
  ];

  if (isPlayer) {
    lines.push(
      buildButton(
        t("ui.msg.markIncapacitated", locale),
        `${COMMAND} --zero-hp-incapacitated ${tokenId}`,
      ),
    );
  } else {
    lines.push(
      buildButton(
        t("ui.msg.removeFromTurnOrder", locale),
        `${COMMAND} --zero-hp-remove-from-turn ${tokenId}`,
      ),
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
      reason: t("ui.msg.durationExpired", locale),
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
    whisper(playerId, t("ui.title.noConditions", locale), [
      t("ui.msg.noActiveConditions", locale, { name: targetName }),
    ]);
    return;
  }
  for (const condition of active) {
    removeConditionById(condition.id, {
      playerId,
      reason: t("ui.msg.reachedZeroHp", locale, { name: targetName }),
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
    ? t("ui.msg.tokenRemovedFromTurn", locale, { name: targetName })
    : t("ui.msg.tokenNotInTurn", locale, { name: targetName });
  whisper(playerId, t("ui.title.turnOrder", locale), [message]);

  if (token) {
    whisperGms(t("ui.title.moveToken", locale, { name: targetName }), [
      t("ui.msg.moveTokenPrompt", locale, { name: targetName }),
      buildButton(
        t("ui.msg.moveTokenBtn", locale, { name: targetName }),
        `${COMMAND} --zero-hp-to-map ${tokenId}`,
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
    whisperError(playerId, t("ui.msg.tokenNotFound", locale));
    return;
  }

  const targetName = getTokenName(token);
  token.set("layer", "map");
  whisper(playerId, t("ui.title.tokenMoved", locale), [
    t("ui.msg.tokenMoved", locale, { name: targetName }),
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
    whisper(playerId, t("ui.title.markedDead", locale), [
      t("ui.msg.deadNoConditions", locale, { name: targetName }),
    ]);
    return;
  }
  for (const condition of active) {
    removeConditionById(condition.id, {
      playerId,
      reason: t("ui.msg.markedAsDead", locale, { name: targetName }),
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
    whisperError(playerId, t("ui.msg.tokenNotFound", locale));
    return;
  }

  const tokenName = getTokenName(token);

  if (isDuplicate(tokenId, "", "", tokenId, "Incapacitated", "")) {
    whisperWarning(
      playerId,
      t("ui.msg.alreadyIncapacitated", locale, { name: tokenName }),
    );
    return;
  }

  const validation = {
    sourceToken: token,
    subjectToken: null,
    targetToken: token,
    condition: "Incapacitated",
    customText: "",
  };
  const duration = { type: DURATION_UNTIL_REMOVED };
  const condition = buildConditionRecord(validation, config, duration, locale);
  const markerNotice = applyConfiguredMarker(token, condition, config, locale);
  addActiveCondition(condition);
  const insertResult = insertConditionRow(condition);

  announceHtml(buildApplyMessage(condition, locale));
  whisperApplySummary(
    playerId,
    condition,
    insertResult.appended,
    markerNotice,
    locale,
  );
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
    t("ui.title.conditionReorder", locale),
    t("ui.msg.conditionsReordered", locale),
  );
}

/**
 * Reinstalls the ConditionTrackerWizard macro for all current GM players.
 *
 * @param {string} playerId GM player id.
 * @returns {void}
 */
export function handleReinstallMacro(playerId) {
  const locale = getConfig().language;
  installMacro();
  whisper(
    playerId,
    t("ui.title.macroReinstalled", locale),
    t("ui.msg.macroReinstalled", locale, {
      wizard: MACRO_NAME,
      multiTarget: MACRO_NAME_MULTI_TARGET,
    }),
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
    t("ui.title.handoutReinstalled", locale),
    t("ui.msg.handoutReinstalled", locale, { handout: HANDOUT_NAME }),
  );
}
