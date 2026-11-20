// Noticing defeated creatures, modelled on HealthColors: the HP bar dropping to 0 on
// the token (change:graphic), on its linked attribute (change:attribute) or through
// TokenMod, a marker going on, or DeathTracker 1.0 reporting a death. Each token
// counts once per session.

import { buildButton, buildSecondaryButton, whisper } from './chat.js';
import { COMMAND, RECENT_ATTR_MS, SCRIPT_NAME } from './constants.js';
import { t } from './i18n.js';
import { averagePartyLevel, controllingPlayers, isOnRoster } from './roster.js';
import { readCreatureXp } from './sheets.js';
import { addToPool } from './session.js';
import { getConfig, getSession } from './state.js';
import { escapeForChat, formatNumber, isRecord, toText } from './utils.js';

// Tokens just handled through change:attribute, so change:graphic does not see them twice.
const recentAttrTokens = new Set();

/**
 * Reads a previous value from a Roll20 prev snapshot or from another Mod's object.
 *
 * @param {object} prev Snapshot.
 * @param {string} key Property.
 * @returns {*} Value, or undefined.
 */
function prevValue(prev, key) {
  if (!prev) return undefined;
  if (isRecord(prev) && Object.hasOwn(prev, key)) return prev[key];
  if (typeof prev.get === 'function') return prev.get(key);
  return undefined;
}

/**
 * Parses an HP bar value. Blank or text values are not numbers.
 *
 * @param {*} raw Bar value.
 * @returns {number|null} HP, or null.
 */
function parseHp(raw) {
  const text = toText(raw);
  return /^-?\d+(\.\d+)?$/.test(text) ? Number(text) : null;
}

/**
 * Returns the statusmarkers of a token or snapshot as a list of tags.
 *
 * @param {*} raw statusmarkers text.
 * @returns {string[]} Tags (with any @number badge removed).
 */
function markerTags(raw) {
  return toText(raw)
    .split(',')
    .map((m) => m.split('@')[0].trim())
    .filter(Boolean);
}

/**
 * Returns true when the configured marker is on in a marker list. Built-in names and
 * custom set names (without the ::id) both match.
 *
 * @param {string[]} tags Marker tags.
 * @param {string} marker Configured marker.
 * @returns {boolean} True when present.
 */
export function hasMarker(tags, marker) {
  const want = toText(marker).replace(/^status_/, '');
  if (!want) return false;
  const wantName = want.split('::')[0].toLowerCase();
  return tags.some((tag) => tag === want || tag.split('::')[0].toLowerCase() === wantName);
}

/**
 * Returns the character a token stands for, when it can be defeated for XP: not on
 * the roster and not controlled by a player.
 *
 * @param {object} token Roll20 graphic.
 * @returns {object|null} Character, or null.
 */
function creatureFor(token) {
  if (!token || token.get('_subtype') === 'card') return null;
  const character = getObj('character', toText(token.get('represents')));
  if (!character) return null;
  if (isOnRoster(character.id) || controllingPlayers(character).length > 0) return null;
  return character;
}

/**
 * Looks at a token change and reports whether it is a defeat.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous values.
 * @returns {'bar'|'marker'|null} What showed the defeat.
 */
export function defeatSource(token, prev) {
  const config = getConfig();
  if (config.killBar) {
    const key = `bar${config.hpBar}_value`;
    const now = parseHp(token.get(key));
    const before = parseHp(prevValue(prev, key));
    if (now !== null && now <= 0 && before !== null && before > 0) {
      return 'bar';
    }
  }
  if (config.killMarker) {
    const now = hasMarker(markerTags(token.get('statusmarkers')), config.marker);
    const before = hasMarker(markerTags(prevValue(prev, 'statusmarkers')), config.marker);
    if (now && !before) {
      return 'marker';
    }
  }
  return null;
}

/**
 * Handles a token change from Roll20 or from another Mod's observer.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} prev Previous values.
 * @returns {void}
 */
export function handleTokenChange(token, prev) {
  if (getConfig().killMode === 'off') return;
  if (recentAttrTokens.has(token.id)) return;
  if (defeatSource(token, prev)) {
    void noticeDefeat(token);
  }
}

/**
 * Handles a change to an attribute linked to a token's HP bar. Sheets and Mods that
 * change the attribute do not always raise a token change with the old value.
 *
 * @param {object} attr Roll20 attribute.
 * @param {object} prev Previous values.
 * @returns {void}
 */
export function handleAttributeChange(attr, prev) {
  const config = getConfig();
  if (config.killMode === 'off' || !config.killBar) return;
  const now = parseHp(attr.get('current'));
  const before = parseHp(prevValue(prev, 'current'));
  if (now === null || before === null || !(now <= 0 && before > 0)) return;
  const linkKey = `bar${config.hpBar}_link`;
  for (const token of findObjs({ _type: 'graphic', represents: attr.get('_characterid') })) {
    if (token.get(linkKey) !== attr.id) continue;
    recentAttrTokens.add(token.id);
    setTimeout(() => recentAttrTokens.delete(token.id), RECENT_ATTR_MS);
    void noticeDefeat(token);
  }
}

/**
 * Handles DeathTracker 1.0's status events.
 *
 * @param {{token: object, status: string}} event DeathTracker event.
 * @returns {void}
 */
export function handleDeathTrackerStatus(event) {
  const config = getConfig();
  if (config.killMode === 'off' || !config.killDeathTracker) return;
  if (event?.status === 'dead' && event.token) {
    void noticeDefeat(event.token);
  }
}

/**
 * Works out a creature's XP and records the defeat: prompts the GM, or adds it to
 * the pool straight away in automatic mode. Does nothing for a token already counted
 * this session.
 *
 * @param {object} token Roll20 graphic.
 * @param {object} [options] Options.
 * @param {number|null} [options.xp] XP to use instead of the sheet's.
 * @param {boolean} [options.manual] Started by the GM (adds without a prompt).
 * @returns {Promise<string>} What happened: 'prompted', 'added', 'counted', 'noXp', 'notCreature'.
 */
export async function noticeDefeat(token, { xp = null, manual = false } = {}) {
  const config = getConfig();
  const session = getSession();
  const character = creatureFor(token);
  if (!character) return 'notCreature';
  const existing = session.kills[token.id];
  // Seen again by itself: already counted. The GM can still add a pending or ignored one.
  if (existing && (existing.status === 'added' || existing.status === 'reading' || !manual)) {
    return 'counted';
  }
  // Hold the token while its XP is read, so a second event for the same drop waits.
  session.kills[token.id] = { tokenId: token.id, status: 'reading', at: Date.now() };

  let value = xp;
  if (value === null) {
    try {
      value = await readCreatureXp(character, averagePartyLevel());
    } catch (err) {
      log(`${SCRIPT_NAME}: could not read XP for ${character.get('name')}: ${err?.message || err}`);
      value = null;
    }
  }
  const name = toText(token.get('name')) || toText(character.get('name'));
  const kill = {
    tokenId: token.id,
    characterId: character.id,
    name,
    xp: Number.isFinite(value) ? value : 0,
    status: 'pending',
    at: Date.now(),
  };
  session.kills[token.id] = kill;

  if ((manual || config.killMode === 'auto') && kill.xp > 0) {
    return confirmKill(token.id, kill.xp) ? 'added' : 'noXp';
  }
  promptGm(kill);
  return kill.xp > 0 ? 'prompted' : 'noXp';
}

/**
 * Whispers the GM a defeat prompt with Add / other amount / Ignore buttons.
 *
 * @param {object} kill Kill record.
 * @returns {void}
 */
function promptGm(kill) {
  const lang = getConfig().language;
  const name = escapeForChat(kill.name);
  const lines = [];
  if (kill.xp > 0) {
    lines.push(
      `<div>${t('kills.prompt', lang, { name: `<strong>${name}</strong>`, xp: `<strong>${formatNumber(kill.xp)}</strong>` })}</div>`
    );
    lines.push(
      `<div style="margin-top:4px">${buildButton(t('buttons.addKill', lang, { xp: formatNumber(kill.xp) }), `${COMMAND} kill confirm ${kill.tokenId}`)}${buildSecondaryButton(t('buttons.otherXp', lang), `${COMMAND} kill confirm ${kill.tokenId} ?{${t('prompts.xp', lang)}|${kill.xp}}`)}${buildSecondaryButton(t('buttons.ignore', lang), `${COMMAND} kill ignore ${kill.tokenId}`)}</div>`
    );
  } else {
    lines.push(`<div>${t('kills.noXp', lang, { name: `<strong>${name}</strong>` })}</div>`);
    lines.push(
      `<div style="margin-top:4px">${buildButton(t('buttons.otherXp', lang), `${COMMAND} kill confirm ${kill.tokenId} ?{${t('prompts.xp', lang)}}`)}${buildSecondaryButton(t('buttons.ignore', lang), `${COMMAND} kill ignore ${kill.tokenId}`)}</div>`
    );
  }
  whisper(null, t('titles.defeated', lang), lines);
}

/**
 * Adds a recorded defeat to the pool.
 *
 * @param {string} tokenId Token ID.
 * @param {number} [xp] XP (defaults to the recorded amount).
 * @returns {boolean} True when added.
 */
export function confirmKill(tokenId, xp) {
  const kill = getSession().kills[tokenId];
  if (!kill || kill.status === 'added') return false;
  const amount = Number.isFinite(xp) ? xp : kill.xp;
  if (!(amount > 0)) return false;
  kill.xp = amount;
  kill.status = 'added';
  void addToPool(amount, t('kills.reason', getConfig().language, { name: kill.name }), {
    source: 'kill',
    tokenId,
  });
  return true;
}

/**
 * Ignores a recorded defeat.
 *
 * @param {string} tokenId Token ID.
 * @returns {boolean} True when there was a pending defeat.
 */
export function ignoreKill(tokenId) {
  const kill = getSession().kills[tokenId];
  if (!kill || kill.status !== 'pending') return false;
  kill.status = 'ignored';
  return true;
}
