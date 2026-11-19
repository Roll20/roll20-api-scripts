// Chat command parsing and handling.

import { announce, buildNote, buildRow, whisper, whisperError, whisperWarning } from './chat.js';
import {
  API_PLAYER_ID,
  BUILTIN_MARKERS,
  COMMAND,
  CONFLICTING_GLOBALS,
  DEFAULT_CONFIG,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  HANDOUT_LOG_NAME,
  LONG_COMMAND,
  MAX_EXTRA_SHARES,
  SETTING_TYPES,
  SHORT_ALIAS,
} from './constants.js';
import { normalizeLocale, t } from './i18n.js';
import { installHandouts } from './journals.js';
import { confirmKill, ignoreKill, noticeDefeat } from './kills.js';
import { showLanguages, showMainMenu, showRoster, showSettings, showStatus } from './menu.js';
import { controllingPlayers, getRoster } from './roster.js';
import {
  addBonus,
  addToPool,
  endSession,
  pay,
  resetSession,
  setAbsent,
  undoLast,
  validXp,
} from './session.js';
import { readProgress } from './sheets.js';
import { coerceSetting, getCharacterRecord, getConfig, getSession, getState } from './state.js';
import {
  TRACK_SHEET,
  formatTrackPlan,
  levelForXp,
  parseLevelTable,
  parseTrackPlan,
  systemIds,
  xpForNextLevel,
} from './systems.js';
import {
  escapeForChat,
  formatNumber,
  isJumpgate,
  parseStrictInt,
  splitList,
  toText,
} from './utils.js';

/**
 * Returns the command words this game answers to.
 *
 * @returns {string[]} Commands, the main one first.
 */
export function activeCommands() {
  const list = [COMMAND, LONG_COMMAND, ...getState().aliases];
  if (shortAliasAllowed()) {
    list.push(SHORT_ALIAS);
  }
  return [...new Set(list.map((c) => c.toLowerCase()))];
}

/**
 * Returns true when !xp can be used: no other XP mod that answers to it is installed.
 *
 * @returns {boolean} True when !xp is free.
 */
export function shortAliasAllowed() {
  return CONFLICTING_GLOBALS.every((name) => typeof globalThis[name] === 'undefined');
}

/**
 * Splits a command line into words, keeping "quoted text" together.
 *
 * @param {string} text Command text.
 * @returns {string[]} Words.
 */
export function tokenize(text) {
  const words = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    words.push(m[1] ?? m[2] ?? m[3]);
  }
  return words;
}

/**
 * Pulls --flags out of a word list.
 *
 * @param {string[]} words Words.
 * @returns {{args: string[], flags: Record<string, string|true>}} Arguments and flags.
 */
export function parseFlags(words) {
  const args = [];
  const flags = {};
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    if (/^--[a-z]/i.test(w)) {
      const key = w.slice(2).toLowerCase();
      const next = words[i + 1];
      if (['ids', 'xp'].includes(key) && next !== undefined && !next.startsWith('--')) {
        flags[key] = next;
        i++;
      } else {
        flags[key] = true;
      }
    } else {
      args.push(w);
    }
  }
  return { args, flags };
}

/**
 * Works out the characters a command is for: --ids (character or token IDs), else
 * the selected tokens.
 *
 * @param {object} msg Chat message.
 * @param {object} flags Flags.
 * @returns {object[]} Roll20 characters.
 */
function targetCharacters(msg, flags) {
  const ids = typeof flags.ids === 'string' ? splitList(flags.ids) : [];
  const found = new Map();
  const addFromToken = (token) => {
    const c = token && getObj('character', toText(token.get('represents')));
    if (c) found.set(c.id, c);
  };
  if (ids.length > 0) {
    for (const id of ids) {
      const c = getObj('character', id);
      if (c) found.set(c.id, c);
      else addFromToken(getObj('graphic', id));
    }
  } else {
    for (const sel of msg.selected || []) {
      addFromToken(getObj('graphic', sel._id));
    }
  }
  return [...found.values()];
}

/**
 * Returns the selected tokens (or --ids tokens).
 *
 * @param {object} msg Chat message.
 * @param {object} flags Flags.
 * @returns {object[]} Roll20 graphics.
 */
function targetTokens(msg, flags) {
  const ids =
    typeof flags.ids === 'string' ? splitList(flags.ids) : (msg.selected || []).map((s) => s._id);
  return ids.map((id) => getObj('graphic', id)).filter(Boolean);
}

/**
 * Re-shows the card a button came from.
 *
 * @param {string} who GM to whisper.
 * @param {object} flags Flags.
 * @returns {void}
 */
function reshow(who, flags) {
  if (flags.menu) showMainMenu(who);
  if (flags.roster) showRoster(who);
  if (flags.settings) showSettings(who);
}

/**
 * Validates a setting value. Returns undefined when it cannot be used.
 *
 * @param {string} key Setting name.
 * @param {*} value Value (already coerced to the setting's type).
 * @returns {*} Value to store, or undefined.
 */
export function validateSetting(key, value) {
  const type = SETTING_TYPES[key];
  if (value === undefined || value === null) return undefined;
  if (type === 'locale') return normalizeLocale(value) || undefined;
  if (type === 'boolean') return typeof value === 'boolean' ? value : undefined;
  if (Array.isArray(type)) {
    const match = type.find((v) => String(v).toLowerCase() === String(value).toLowerCase());
    return match === undefined ? undefined : match;
  }
  if (type === 'system') return systemIds().includes(String(value)) ? String(value) : undefined;
  if (type === 'share') {
    const n = Number(value);
    return Number.isFinite(n) && n >= 0 && n <= 1 ? n : undefined;
  }
  if (type === 'count') {
    const n = Number(value);
    return Number.isInteger(n) && n >= 0 && n <= MAX_EXTRA_SHARES ? n : undefined;
  }
  if (type === 'marker') return resolveMarker(value);
  if (type === 'track') {
    const text = toText(value).toLowerCase();
    if (text === TRACK_SHEET) return TRACK_SHEET;
    const plan = parseTrackPlan(text);
    return plan ? formatTrackPlan(plan) : undefined;
  }
  if (type === 'levels') {
    const text = toText(value);
    return text === '' || parseLevelTable(text) ? text : undefined;
  }
  if (type === 'field') {
    const text = toText(value);
    return /^[\w\-.,\s]{0,120}$/.test(text) ? splitList(text).join(',') : undefined;
  }
  return value;
}

/**
 * Turns a marker name or tag into the tag Roll20 stores (custom markers are "Name::id").
 *
 * @param {*} raw Marker name or tag.
 * @returns {string|undefined} Tag, or undefined when unknown.
 */
function resolveMarker(raw) {
  const text = toText(raw).replace(/^status_/, '');
  if (!text) return undefined;
  if (BUILTIN_MARKERS.includes(text.toLowerCase())) return text.toLowerCase();
  let custom = [];
  try {
    custom = JSON.parse(
      Campaign().get('_token_markers') || Campaign().get('token_markers') || '[]'
    );
  } catch {
    custom = [];
  }
  const lower = text.toLowerCase();
  const found = custom.find(
    (m) =>
      toText(m.tag) === text ||
      toText(m.name).toLowerCase() === lower ||
      toText(m.tag).split('::')[0].toLowerCase() === lower
  );
  return found ? toText(found.tag) : undefined;
}

/**
 * Handles `set <setting> <value>`.
 *
 * @param {string} who GM.
 * @param {string[]} args Arguments.
 * @returns {boolean} True when a setting changed.
 */
function handleSet(who, args) {
  const lang = getConfig().language;
  const key = Object.keys(DEFAULT_CONFIG).find(
    (k) => k.toLowerCase() === toText(args[0]).toLowerCase()
  );
  if (!key) {
    whisperError(
      who,
      t('errors.unknownSetting', lang, { name: toText(args[0]) }),
      t('errors.settingsHint', lang)
    );
    return false;
  }
  const raw = args.slice(1).join(' ');
  const value = validateSetting(key, coerceSetting(key, raw));
  if (value === undefined) {
    whisperError(
      who,
      t('errors.badValue', lang, { name: key, value: raw }),
      t(`settings.${key}.desc`, lang)
    );
    return false;
  }
  getConfig()[key] = value;
  if (key === 'language') {
    installHandouts();
  }
  return true;
}

/**
 * Shows each party member's sheet XP and level.
 *
 * @param {string} who GM.
 * @returns {Promise<void>}
 */
async function showXp(who) {
  const lang = getConfig().language;
  const lines = [];
  const roster = getRoster();
  if (roster.length === 0) {
    lines.push(buildNote(escapeForChat(t('menu.noParty', lang))));
  }
  for (const c of roster) {
    const p = await readProgress(c);
    const level = p.level ?? levelForXp(p.profile.levels, p.xp ?? 0);
    const next = p.next ?? (level ? xpForNextLevel(p.profile.levels, level) : null);
    const parts = [
      p.xp === null ? t('show.noXp', lang) : `${formatNumber(p.xp)} XP`,
      level ? t('menu.levelTag', lang, { level }) : '',
      next ? t('show.next', lang, { xp: formatNumber(next) }) : '',
    ].filter(Boolean);
    lines.push(buildRow(c.get('name'), escapeForChat(parts.join(' • '))));
  }
  whisper(who, t('titles.partyXp', lang), lines);
}

/**
 * Shows the short help card.
 *
 * @param {string} who GM.
 * @returns {void}
 */
function showHelp(who) {
  const lang = getConfig().language;
  const rows = [
    ['', 'menu'],
    ['add <xp> [reason]', 'add'],
    ['bonus <xp> [--ids]', 'bonus'],
    ['give <xp> [--ids]', 'give'],
    ['kill [--xp n]', 'kill'],
    ['absent | present [--ids]', 'absent'],
    ['end', 'end'],
    ['undo', 'undo'],
    ['show', 'show'],
    ['roster', 'roster'],
    ['party add | remove', 'party'],
    ['settings', 'settings'],
    ['set <setting> <value>', 'set'],
    ['status', 'status'],
    ['help', 'help'],
  ].map(([cmd, key]) =>
    buildRow(`${COMMAND} ${cmd}`.trim(), escapeForChat(t(`help.${key}`, lang)))
  );
  rows.push(
    buildNote(
      escapeForChat(t('help.handouts', lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME }))
    )
  );
  whisper(who, t('titles.help', lang), rows);
}

/**
 * Handles a chat message.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleInput(msg) {
  if (msg.type !== 'api') return;
  const words = tokenize(toText(msg.content));
  const head = toText(words.shift()).toLowerCase();
  if (!activeCommands().includes(head)) return;
  const fromApi = msg.playerid === API_PLAYER_ID;
  if (!fromApi && !playerIsGM(msg.playerid)) {
    whisperError(msg.playerid, t('errors.gmOnly', getConfig().language));
    return;
  }
  const who = fromApi ? null : msg.playerid;
  void run(msg, who, words).catch((err) => {
    log(`LazyExperience ERROR: ${err?.stack || err}`);
    whisperError(
      who,
      t('errors.failed', getConfig().language, { message: err?.message || String(err) })
    );
  });
}

/**
 * Runs a subcommand.
 *
 * @param {object} msg Chat message.
 * @param {string|null} who GM to answer.
 * @param {string[]} words Words after the command.
 * @returns {Promise<void>}
 */
async function run(msg, who, words) {
  const config = getConfig();
  const lang = config.language;
  const { args, flags } = parseFlags(words);
  const sub = toText(args.shift()).toLowerCase();

  switch (sub) {
    case '':
    case 'menu':
      showMainMenu(who);
      return;
    case 'help':
      showHelp(who);
      return;
    case 'config':
    case 'settings':
      showSettings(who);
      return;
    case 'status':
      showStatus(who, activeCommands().slice(1));
      return;
    case 'lang':
    case 'language':
      if (args[0]) {
        if (handleSet(who, ['language', args[0]])) showSettings(who);
      } else {
        showLanguages(who);
      }
      return;
    case 'set':
      if (handleSet(who, args)) {
        if (!flags.settings)
          whisper(
            who,
            t('titles.settings', getConfig().language),
            escapeForChat(t('messages.saved', getConfig().language))
          );
        reshow(who, flags);
      }
      return;
    case 'roster':
    case 'refresh':
    case 'refreshcharacters':
      showRoster(who);
      return;
    case 'show':
      await showXp(who);
      return;
    case 'journal':
      installHandouts();
      whisper(who, t('titles.help', lang), escapeForChat(t('messages.handouts', lang)));
      return;
    case 'log': {
      const handout = findObjs({ _type: 'handout', name: HANDOUT_LOG_NAME })[0];
      whisper(
        who,
        t('titles.log', lang),
        handout
          ? `<a href="http://journal.roll20.net/handout/${handout.id}">${escapeForChat(HANDOUT_LOG_NAME)}</a>`
          : escapeForChat(t('messages.noLog', lang))
      );
      return;
    }
    case 'add': {
      // 0.1.x: "add session <xp>" and "add <characterid> <xp>".
      if (toText(args[0]).toLowerCase() === 'session') args.shift();
      const maybeChar = getObj('character', toText(args[0]));
      if (maybeChar) {
        args.shift();
        const xp = validXp(parseStrictInt(args.shift()), true);
        if (xp === null) return whisperError(who, t('errors.badXp', lang));
        await addBonus([maybeChar.id], xp, args.join(' '));
        if (config.payout === 'end')
          whisper(
            who,
            t('titles.bonus', lang),
            escapeForChat(
              t('messages.bonusAdded', lang, { xp: formatNumber(xp), names: maybeChar.get('name') })
            )
          );
        reshow(who, flags);
        return;
      }
      const xp = validXp(parseStrictInt(args.shift()), true);
      if (xp === null) return whisperError(who, t('errors.badXp', lang));
      await addToPool(xp, args.join(' ').trim());
      if (config.payout === 'end' && !flags.menu)
        whisper(
          who,
          t('titles.pool', lang),
          escapeForChat(t('messages.poolAdded', lang, { xp: formatNumber(xp) }))
        );
      reshow(who, flags);
      return;
    }
    case 'bonus': {
      const xp = validXp(parseStrictInt(args.shift()), true);
      if (xp === null) return whisperError(who, t('errors.badXp', lang));
      const chars = targetCharacters(msg, flags);
      if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
      await addBonus(
        chars.map((c) => c.id),
        xp,
        args.join(' ').trim()
      );
      if (config.payout === 'end' && !flags.menu)
        whisper(
          who,
          t('titles.bonus', lang),
          escapeForChat(
            t('messages.bonusAdded', lang, {
              xp: formatNumber(xp),
              names: chars.map((c) => c.get('name')).join(', '),
            })
          )
        );
      reshow(who, flags);
      return;
    }
    case 'give': {
      const xp = validXp(parseStrictInt(args.shift()), true);
      if (xp === null) return whisperError(who, t('errors.badXp', lang));
      const chars = targetCharacters(msg, flags);
      if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
      const reason = args.join(' ').trim();
      const results = await pay(chars.map((c) => ({ id: c.id, xp })));
      const names = results.map((r) => escapeForChat(r.name)).join(', ');
      const lines = [
        `<div>${t('instant.bonus', lang, { names: `<strong>${names}</strong>`, xp: formatNumber(xp) })}</div>`,
      ];
      if (reason) lines.push(buildNote(escapeForChat(reason)));
      announce(
        config.announce,
        chars.flatMap((c) => controllingPlayers(c)),
        t('titles.xpAwarded', lang),
        lines
      );
      reshow(who, flags);
      return;
    }
    case 'absent':
    case 'present': {
      const chars = targetCharacters(msg, flags);
      if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
      setAbsent(
        chars.map((c) => c.id),
        sub === 'absent'
      );
      if (!flags.menu && !flags.roster)
        whisper(
          who,
          t('titles.roster', lang),
          escapeForChat(
            t(`messages.${sub}`, lang, { names: chars.map((c) => c.get('name')).join(', ') })
          )
        );
      reshow(who, flags);
      return;
    }
    case 'share': {
      const share =
        Number(toText(args[0]).replace('%', '')) / (toText(args[0]).endsWith('%') ? 100 : 1);
      if (!Number.isFinite(share) || share < 0 || share > 10)
        return whisperError(who, t('errors.badShare', lang));
      const chars = targetCharacters(msg, flags);
      if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
      for (const c of chars) getCharacterRecord(c.id).share = share;
      reshow(who, flags.roster || flags.menu ? flags : { roster: true });
      return;
    }
    case 'exclude':
    case 'include': {
      const chars = targetCharacters(msg, flags);
      if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
      for (const c of chars) {
        const rec = getCharacterRecord(c.id);
        rec.excluded = sub === 'exclude';
        if (sub === 'include' && config.roster === 'manual') rec.member = true;
      }
      reshow(who, flags.roster || flags.menu ? flags : { roster: true });
      return;
    }
    case 'party':
      await handleParty(msg, who, args, flags);
      return;
    case 'kill':
      await handleKill(msg, who, args, flags);
      return;
    case 'undo': {
      const award = undoLast();
      whisper(
        who,
        t('titles.undo', lang),
        escapeForChat(
          award
            ? t('messages.undone', lang, {
                xp: formatNumber(award.xp),
                reason: award.reason || t(`awardKinds.${award.kind}`, lang),
              })
            : t(
                config.payout === 'instant'
                  ? 'messages.nothingToUndoInstant'
                  : 'messages.nothingToUndo',
                lang
              )
        )
      );
      reshow(who, flags);
      return;
    }
    case 'end': {
      if (toText(args[0]).toLowerCase() === 'no') return;
      await endSession();
      return;
    }
    case 'resetxp':
      resetSession();
      whisper(who, t('titles.pool', lang), escapeForChat(t('messages.sessionReset', lang)));
      reshow(who, flags.menu ? flags : { menu: true });
      return;
    case 'reset': {
      const what = toText(args[0]).toLowerCase();
      if (what === 'session') {
        resetSession();
        whisper(who, t('titles.pool', lang), escapeForChat(t('messages.sessionReset', lang)));
        return;
      }
      // 0.1.x "reset" reset the configuration.
      getState().config = { ...DEFAULT_CONFIG, language: config.language };
      installHandouts();
      showSettings(who);
      return;
    }
    default:
      whisperError(
        who,
        t('errors.unknownCommand', lang, { name: sub }),
        t('errors.helpHint', lang, { command: COMMAND })
      );
  }
}

/**
 * Handles `party add|remove`, which ticks Roll20's own Party Member box.
 *
 * @param {object} msg Chat message.
 * @param {string|null} who GM.
 * @param {string[]} args Arguments.
 * @param {object} flags Flags.
 * @returns {Promise<void>}
 */
async function handleParty(msg, who, args, flags) {
  const lang = getConfig().language;
  const action = toText(args[0]).toLowerCase();
  if (!['add', 'remove'].includes(action)) {
    showRoster(who);
    return;
  }
  const chars = targetCharacters(msg, flags);
  if (chars.length === 0) return whisperError(who, t('errors.noCharacters', lang));
  for (const c of chars) {
    c.set('inParty', action === 'add');
    const rec = getCharacterRecord(c.id);
    rec.member = action === 'add';
    if (action === 'add') rec.excluded = false;
  }
  if (!isJumpgate()) whisperWarning(who, t('warnings.partyLegacy', lang));
  if (!flags.roster)
    whisper(
      who,
      t('titles.roster', lang),
      escapeForChat(
        t(`messages.party.${action}`, lang, { names: chars.map((c) => c.get('name')).join(', ') })
      )
    );
  reshow(who, flags);
}

/**
 * Handles `kill`, `kill confirm <token> [xp]` and `kill ignore <token>`.
 *
 * @param {object} msg Chat message.
 * @param {string|null} who GM.
 * @param {string[]} args Arguments.
 * @param {object} flags Flags.
 * @returns {Promise<void>}
 */
async function handleKill(msg, who, args, flags) {
  const config = getConfig();
  const lang = config.language;
  const action = toText(args[0]).toLowerCase();
  if (action === 'confirm') {
    const xp = args[2] === undefined ? undefined : parseStrictInt(args[2]);
    if (args[2] !== undefined && !(xp > 0)) return whisperError(who, t('errors.badXp', lang));
    if (confirmKill(toText(args[1]), xp ?? undefined)) {
      const kill = getSession().kills[toText(args[1])];
      whisper(
        who,
        t('titles.defeated', lang),
        escapeForChat(t('messages.killAdded', lang, { name: kill.name, xp: formatNumber(kill.xp) }))
      );
    } else {
      whisperWarning(who, t('messages.killGone', lang));
    }
    return;
  }
  if (action === 'ignore') {
    ignoreKill(toText(args[1]));
    return;
  }
  const tokens = targetTokens(msg, flags);
  if (tokens.length === 0) return whisperError(who, t('errors.noTokens', lang));
  const xp = flags.xp === undefined ? null : parseStrictInt(flags.xp);
  if (flags.xp !== undefined && !(xp > 0)) return whisperError(who, t('errors.badXp', lang));
  const outcomes = [];
  for (const token of tokens) {
    const result = await noticeDefeat(token, { xp, manual: true });
    outcomes.push(
      `${escapeForChat(toText(token.get('name')) || '?')}: ${escapeForChat(t(`kills.result.${result}`, lang))}`
    );
  }
  whisper(who, t('titles.defeated', lang), outcomes.map((o) => `<div>${o}</div>`).join(''));
  reshow(who, flags);
}
