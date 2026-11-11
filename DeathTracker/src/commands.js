// Chat commands: !deathtracker (and !dt, !dead) with their subcommands.

import { undoDeathActions } from './actions.js';
import { whisper, whisperError, whisperWarning } from './chat.js';
import {
  API_PLAYER_ID,
  COMMAND_ALIASES,
  DEFAULT_SETTINGS,
  HANDOUT_DECK_NAME,
  HANDOUT_HELP_NAME,
  MACRO_NAME,
  MARKER_SETTINGS,
  STATUS,
} from './constants.js';
import { installMacro, parseSyncArgs, syncSaves } from './deathsaves.js';
import { clearTint } from './fx.js';
import { t } from './i18n.js';
import { installHandouts } from './journals.js';
import { applyMarkers, resolveMarker } from './markers.js';
import {
  describeValue,
  gmPageId,
  showHelp,
  showMarkers,
  showMenu,
  showSettings,
  showStatus,
  tokensWithHp,
} from './menu.js';
import { OWNER_SETTINGS, parseOwner, setOwner, tellHealthColors } from './owners.js';
import { getCharacter, tokenControllers } from './sheet.js';
import {
  dropRecord,
  getLang,
  getRecord,
  getSettings,
  getState,
  setRole,
  setSetting,
} from './state.js';
import { judge } from './tracker.js';
import { escapeForChat, toText } from './utils.js';

// 0.1.x `!dead config key|value` names.
const LEGACY_CONFIG_KEYS = {
  death_statusmarker: 'deadMarker',
  half_statusmarker: 'bloodiedMarker',
  pc_unconscious_statusmarker: 'dyingMarker',
  bar: 'hpBar',
  change_player_tint: 'tintPlayers',
  change_npc_tint: 'tintNpcs',
  fx: 'hurtFx',
  fx_type: 'hurtFxType',
  heal_fx: 'healFx',
  heal_fx_type: 'healFxType',
};

// Settings whose change alters how tokens already judged should look.
const REJUDGE_SETTINGS = [
  'hpBar',
  'bloodiedPercent',
  'bloodiedMarker',
  'dyingMarker',
  'stableMarker',
  'deadMarker',
  'pcDetection',
  'deathSaves',
  'tintPlayers',
  'tintNpcs',
];

/**
 * Splits a command line into words, keeping --flags apart.
 *
 * @param {string} content Message text.
 * @returns {{command: string, words: string[], flags: Record<string, string|true>}} Parts.
 */
export function parseCommand(content) {
  const parts = toText(content).split(/\s+/);
  const command = (parts.shift() || '').toLowerCase();
  const words = [];
  const flags = {};
  for (let i = 0; i < parts.length; i += 1) {
    const p = parts[i];
    if (p.startsWith('--')) {
      const name = p.slice(2).toLowerCase();
      if (name === 'ids' && parts[i + 1] && !parts[i + 1].startsWith('--')) {
        flags.ids = parts[i + 1];
        i += 1;
      } else {
        flags[name] = true;
      }
    } else if (p) {
      words.push(p);
    }
  }
  return { command, words, flags };
}

/**
 * Says whether a message is a DeathTracker command.
 *
 * @param {string} command First word, lower-cased.
 * @returns {boolean} True when it is.
 */
export function isOurCommand(command) {
  if (COMMAND_ALIASES.includes(command)) {
    return true;
  }
  const legacy = getState().legacyCommand;
  return !!legacy && command === `!${legacy}`;
}

/**
 * Returns the tokens a command works on: --ids, else the selection.
 *
 * @param {object} msg Chat message.
 * @param {object} flags Parsed flags.
 * @returns {object[]} Roll20 graphics.
 */
function targets(msg, flags) {
  if (typeof flags.ids === 'string') {
    return flags.ids
      .split(',')
      .map((id) => getObj('graphic', id.trim()))
      .filter(Boolean);
  }
  return (msg.selected || [])
    .filter((s) => s._type === 'graphic')
    .map((s) => getObj('graphic', s._id))
    .filter(Boolean);
}

/**
 * Judges every token DeathTracker has a record for again.
 *
 * @returns {number} Tokens judged.
 */
export function rejudgeAll() {
  let n = 0;
  for (const id of Object.keys(getState().tokens)) {
    const token = getObj('graphic', id);
    if (token) {
      judge(token);
      n += 1;
    } else {
      dropRecord(id);
    }
  }
  return n;
}

/**
 * Brings tokens up to date after the choice of who handles death saves,
 * colours and effects changed: every token DeathTracker knows, and the tokens
 * on the players' page.
 *
 * @returns {void}
 */
export function refreshForOwners() {
  rejudgeAll();
  const known = getState().tokens;
  for (const tok of tokensWithHp(Campaign().get('playerpageid'))) {
    if (!known[tok.id]) {
      judge(tok);
    }
  }
}

/**
 * Chooses who handles death saves, colours or effects (for HealthColors too)
 * and reports the result.
 *
 * @param {string} playerId GM's player ID.
 * @param {string} key One of the OWNER_SETTINGS keys.
 * @param {string} rawValue Value as typed.
 * @param {boolean} showCard Show the settings card afterwards.
 * @returns {void}
 */
function changeOwner(playerId, key, rawValue, showCard) {
  const lang = getLang();
  const owner = parseOwner(rawValue);
  if (!owner) {
    whisperError(playerId, t('messages.settingRejected', lang, { setting: key, value: rawValue }));
    return;
  }
  setOwner(OWNER_SETTINGS[key], owner);
  refreshForOwners();
  tellHealthColors();
  if (showCard) {
    showSettings(playerId);
    return;
  }
  const text = t('messages.settingChanged', lang, {
    setting: t(`settings.${key}`, lang),
    value: describeValue(key, owner, lang),
  });
  whisper(playerId, t('titles.settings', lang), escapeForChat(text));
}

/**
 * Changes a setting from chat and reports the result.
 *
 * @param {string} playerId GM's player ID.
 * @param {string} rawKey Setting name as typed.
 * @param {string} rawValue Value as typed.
 * @param {boolean} showCard Show the settings card afterwards.
 * @returns {void}
 */
function changeSetting(playerId, rawKey, rawValue, showCard) {
  const lang = getLang();
  const ownerKey = Object.keys(OWNER_SETTINGS).find(
    (k) => k.toLowerCase() === toText(rawKey).toLowerCase()
  );
  if (ownerKey) {
    changeOwner(playerId, ownerKey, rawValue, showCard);
    return;
  }
  const key = Object.keys(DEFAULT_SETTINGS).find(
    (k) => k.toLowerCase() === toText(rawKey).toLowerCase()
  );
  if (!key) {
    whisperError(
      playerId,
      t('messages.unknownSetting', lang, { setting: rawKey }),
      t('errors.hint', lang)
    );
    return;
  }
  let value = rawValue;
  if (MARKER_SETTINGS.includes(key)) {
    const found = resolveMarker(rawValue);
    if (found && !found.known) {
      whisperWarning(playerId, t('messages.markerUnknown', lang, { marker: rawValue }));
    }
    value = found ? found.tag : rawValue;
  }
  const before = getSettings()[key];
  if (!setSetting(key, value)) {
    whisperError(playerId, t('messages.settingRejected', lang, { setting: key, value: rawValue }));
    return;
  }
  const after = getSettings()[key];
  if (key === 'language') {
    installHandouts();
  }
  if (REJUDGE_SETTINGS.includes(key) && after !== before) {
    // Markers DeathTracker put on with the old setting are its to take off.
    rejudgeAll();
  }
  if (showCard) {
    showSettings(playerId);
    return;
  }
  const newLang = getLang();
  let text = t('messages.settingChanged', newLang, {
    setting: t(`settings.${key}`, newLang),
    value: describeValue(key, after, newLang),
  });
  if (key === 'hpBar') {
    text += ` ${t('messages.restartNotNeeded', newLang)}`;
  }
  whisper(playerId, t('titles.settings', newLang), escapeForChat(text));
}

/**
 * Handles the player-usable death save macro.
 *
 * @param {object} msg Chat message.
 * @param {string[]} words Words after "dsync".
 * @returns {void}
 */
function handleSync(msg, words) {
  const lang = getLang();
  const token = getObj('graphic', toText(words[0]));
  if (!token) {
    whisperError(msg.playerid, t('errors.noTokens', lang));
    return;
  }
  const gm = playerIsGM(msg.playerid) || msg.playerid === API_PLAYER_ID;
  const controllers = tokenControllers(token);
  if (!gm && !controllers.includes(msg.playerid) && !controllers.includes('all')) {
    whisperError(msg.playerid, t('errors.notYourToken', lang));
    return;
  }
  const counts = parseSyncArgs(words.slice(1));
  const result = syncSaves(token, counts);
  const saves = result.saves || counts;
  whisper(
    msg.playerid,
    t('titles.announce', lang),
    escapeForChat(
      t('messages.synced', lang, {
        name: token.get('name') || t('status.unnamed', lang),
        s: saves.s,
        f: saves.f,
      })
    )
  );
}

/**
 * Handles a chat message.
 *
 * @param {object} msg Roll20 chat message.
 * @returns {void}
 */
export function handleChat(msg) {
  if (msg.type !== 'api') {
    return;
  }
  const { command, words, flags } = parseCommand(msg.content);
  if (!isOurCommand(command)) {
    return;
  }
  const sub = (words.shift() || 'menu').toLowerCase();
  const playerId = msg.playerid;
  const lang = getLang();
  if (sub === 'dsync') {
    handleSync(msg, words);
    return;
  }
  if (!playerIsGM(playerId) && playerId !== API_PLAYER_ID) {
    whisperError(playerId, t('errors.gmOnly', lang));
    return;
  }
  // Replies to another Mod go to the GM.
  const replyTo = playerId === API_PLAYER_ID ? null : playerId;
  const tokens = () => targets(msg, flags);
  const needTokens = (list) => {
    if (!list.length) {
      whisperError(replyTo, t('errors.noTokens', lang));
      return false;
    }
    return true;
  };

  switch (sub) {
    case 'menu':
      showMenu(playerId);
      return;
    case 'help':
      showHelp(replyTo);
      return;
    case 'status': {
      let list = tokens();
      if (!list.length || words[0] === 'all') {
        list = tokensWithHp(gmPageId(playerId)).filter((tok) => getRecord(tok.id));
      }
      showStatus(replyTo, list);
      return;
    }
    case 'check': {
      const list = words[0] === 'all' ? tokensWithHp(gmPageId(playerId)) : tokens();
      if (!needTokens(list)) {
        return;
      }
      list.forEach((tok) => judge(tok));
      whisper(replyTo, t('titles.menu', lang), t('messages.checked', lang, { count: list.length }));
      return;
    }
    case 'stable': {
      const list = tokens();
      if (!needTokens(list)) {
        return;
      }
      const n = list.filter(
        (tok) => judge(tok, { force: STATUS.STABLE }).status === STATUS.STABLE
      ).length;
      whisper(
        replyTo,
        t('titles.menu', lang),
        t(n ? 'messages.stabilised' : 'messages.notDown', lang, { count: n })
      );
      return;
    }
    case 'clear': {
      const list = tokens();
      if (!needTokens(list)) {
        return;
      }
      for (const tok of list) {
        const rec = getRecord(tok.id);
        if (rec) {
          applyMarkers(tok, rec.markers, []);
          clearTint(tok, rec);
          dropRecord(tok.id);
        }
      }
      whisper(replyTo, t('titles.menu', lang), t('messages.cleared', lang, { count: list.length }));
      return;
    }
    case 'restore': {
      const list = tokens();
      if (!needTokens(list)) {
        return;
      }
      let n = 0;
      for (const tok of list) {
        const rec = getRecord(tok.id);
        if (rec?.actions) {
          const back = undoDeathActions(tok, rec.actions);
          rec.actions = null;
          if (back.layer || back.turn) {
            n += 1;
          }
        }
      }
      whisper(
        replyTo,
        t('titles.menu', lang),
        t(n ? 'messages.restored' : 'messages.nothingToRestore', lang, { count: n })
      );
      return;
    }
    case 'pc':
    case 'npc':
    case 'auto': {
      const list = tokens();
      if (!needTokens(list)) {
        return;
      }
      const names = new Set();
      for (const tok of list) {
        const character = getCharacter(tok);
        setRole(character ? character.id : tok.id, sub === 'auto' ? null : sub);
        names.add(character ? character.get('name') : tok.get('name') || t('status.unnamed', lang));
      }
      list.forEach((tok) => judge(tok));
      const role = sub === 'auto' ? t('buttons.auto', lang) : t(`status.${sub}`, lang);
      whisper(
        replyTo,
        t('titles.menu', lang),
        escapeForChat(t('messages.roleSet', lang, { names: [...names].join(', '), role }))
      );
      return;
    }
    case 'markers':
      showMarkers(playerId);
      return;
    case 'macro':
      installMacro(playerId);
      whisper(
        replyTo,
        t('titles.menu', lang),
        t('messages.macroCreated', lang, { macro: MACRO_NAME })
      );
      return;
    case 'settings':
      showSettings(playerId);
      return;
    case 'set':
      if (words.length < 2) {
        showSettings(playerId);
        return;
      }
      changeSetting(replyTo, words[0], words.slice(1).join(' '), !!flags.settings && !!replyTo);
      return;
    case 'reset': {
      const language = getSettings().language;
      getState().settings = { ...DEFAULT_SETTINGS, language };
      rejudgeAll();
      whisper(replyTo, t('titles.settings', lang), t('messages.resetDone', lang));
      if (replyTo) {
        showSettings(playerId);
      }
      return;
    }
    case 'config': {
      // 0.1.x: `!dead config` showed the settings; `!dead config key|value` changed one.
      if (!words.length) {
        showSettings(playerId);
        return;
      }
      const [oldKey, ...rest] = words.join(' ').split('|');
      const key = LEGACY_CONFIG_KEYS[toText(oldKey).toLowerCase()] || oldKey;
      changeSetting(replyTo, key, rest.join('|'), !!replyTo);
      return;
    }
    case 'journal':
    case 'handouts':
      installHandouts();
      whisper(
        replyTo,
        t('titles.menu', lang),
        escapeForChat(
          t('messages.journalRebuilt', lang, { help: HANDOUT_HELP_NAME, deck: HANDOUT_DECK_NAME })
        )
      );
      return;
    default:
      whisperError(
        replyTo,
        t('errors.unknownCommand', lang, { command: sub }),
        t('errors.hint', lang)
      );
  }
}
