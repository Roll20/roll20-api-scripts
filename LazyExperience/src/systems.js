// Game-system profiles: which sheet fields hold XP, level and monster XP, and the
// XP tables each system uses. A profile is picked per character from the name of its
// sheet, so games that mix sheets work.
//
// Field lists are tried in order. On legacy (attribute) sheets every name is looked
// up quietly, so several candidates are fine. On Beacon sheets an unknown name logs a
// sandbox error, so Beacon profiles list only names the sheet is known to have.

import { parseChallenge, splitList, toText } from './utils.js';

// XP needed to reach each level (index 0 = level 1). D&D 5e 2014 and 2024 share it.
export const DND5E_LEVELS = [
  0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000,
  195000, 225000, 265000, 305000, 355000,
];

// D&D 5e XP by challenge rating.
const DND5E_CR_XP = {
  0: 10,
  0.125: 25,
  0.25: 50,
  0.5: 100,
  1: 200,
  2: 450,
  3: 700,
  4: 1100,
  5: 1800,
  6: 2300,
  7: 2900,
  8: 3900,
  9: 5000,
  10: 5900,
  11: 7200,
  12: 8400,
  13: 10000,
  14: 11500,
  15: 13000,
  16: 15000,
  17: 18000,
  18: 20000,
  19: 22000,
  20: 25000,
  21: 33000,
  22: 41000,
  23: 50000,
  24: 62000,
  25: 75000,
  26: 90000,
  27: 105000,
  28: 120000,
  29: 135000,
  30: 155000,
};

// Pathfinder 1e XP to reach each level, by advancement track.
export const PF1_LEVELS = {
  slow: [
    0, 3000, 7500, 14000, 23000, 35000, 53000, 77000, 115000, 160000, 235000, 330000, 475000,
    665000, 955000, 1350000, 1900000, 2700000, 3850000, 5350000,
  ],
  medium: [
    0, 2000, 5000, 9000, 15000, 23000, 35000, 51000, 75000, 105000, 155000, 220000, 315000, 445000,
    635000, 890000, 1300000, 1800000, 2550000, 3600000,
  ],
  fast: [
    0, 1300, 3300, 6000, 10000, 15000, 23000, 34000, 50000, 71000, 105000, 145000, 210000, 295000,
    425000, 600000, 850000, 1200000, 1700000, 2400000,
  ],
};

// The Pathfinder 1E track setting: one of these, a plan that changes track by level,
// or 'sheet' for the XP-for-next-level box as the GM types it.
export const PF1_TRACKS = ['fast', 'medium', 'slow'];
export const TRACK_SHEET = 'sheet';

/**
 * Parses the Pathfinder 1E track setting. A plan lists tracks with the level each
 * starts at, such as "fast 1-3, medium 4-13, slow 14+" or "fast 1, medium 4, slow 14";
 * only the first number of each part counts. A track without a level starts at 1.
 *
 * @param {string} text Setting text.
 * @returns {{from: number, track: string}[]|null} Parts from level 1, or null when invalid.
 */
export function parseTrackPlan(text) {
  const parts = toText(text)
    .toLowerCase()
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length === 0) return null;
  const plan = [];
  for (const part of parts) {
    const m = /^([a-z]+)\s*(?:(?:from\s+)?(\d+)\s*(?:[-–]\s*\d+|\+)?)?$/.exec(part);
    if (!m || !PF1_TRACKS.includes(m[1])) return null;
    const from = m[2] === undefined ? 1 : Number(m[2]);
    if (from < 1 || from > 20) return null;
    plan.push({ from, track: m[1] });
  }
  plan.sort((a, b) => a.from - b.from);
  if (plan[0].from !== 1 || plan.some((p, i) => i > 0 && p.from === plan[i - 1].from)) {
    return null;
  }
  return plan;
}

/**
 * Writes a track plan the way the setting stores it ("medium", "fast 1, medium 4").
 *
 * @param {{from: number, track: string}[]} plan Parsed plan.
 * @returns {string} Setting text.
 */
export function formatTrackPlan(plan) {
  if (plan.length === 1) return plan[0].track;
  return plan.map((p) => `${p.track} ${p.from}`).join(', ');
}

/**
 * The track a character on a level advances on.
 *
 * @param {{from: number, track: string}[]} plan Parsed plan.
 * @param {number} level Current level.
 * @returns {string} Track.
 */
export function trackForLevel(plan, level) {
  let track = plan[0].track;
  for (const p of plan) {
    if (level >= p.from) track = p.track;
  }
  return track;
}

/**
 * XP a Pathfinder 1E character needs for the next level: the total on the table of
 * the track for the level they are on now.
 *
 * @param {{from: number, track: string}[]} plan Parsed plan.
 * @param {number} level Current level.
 * @returns {number|null} XP, or null at level 20 and above.
 */
export function trackNextXp(plan, level) {
  if (!Number.isInteger(level) || level < 1 || level >= 20) return null;
  return PF1_LEVELS[trackForLevel(plan, level)][level];
}

/**
 * The level a total XP reaches when following a track plan from level 1.
 *
 * @param {{from: number, track: string}[]} plan Parsed plan.
 * @param {number} xp Total XP.
 * @returns {number} Level.
 */
export function trackLevelForXp(plan, xp) {
  let level = 1;
  while (level < 20 && xp >= trackNextXp(plan, level)) level += 1;
  return level;
}

// Pathfinder 1e XP by CR (also used by Starfinder 1e).
const PF1_CR_XP = {
  0.125: 50,
  0.167: 65,
  0.25: 100,
  0.333: 135,
  0.5: 200,
  1: 400,
  2: 600,
  3: 800,
  4: 1200,
  5: 1600,
  6: 2400,
  7: 3200,
  8: 4800,
  9: 6400,
  10: 9600,
  11: 12800,
  12: 19200,
  13: 25600,
  14: 38400,
  15: 51200,
  16: 76800,
  17: 102400,
  18: 153600,
  19: 204800,
  20: 307200,
  21: 409600,
  22: 614400,
  23: 819200,
  24: 1228800,
  25: 1638400,
};

// Pathfinder 2e XP for a creature, by its level minus the party level (Core Rulebook).
const PF2_CREATURE_XP = {
  '-4': 10,
  '-3': 15,
  '-2': 20,
  '-1': 30,
  0: 40,
  1: 60,
  2: 80,
  3: 120,
  4: 160,
};

/**
 * Looks up XP for a challenge rating in a table, matching fractions loosely.
 *
 * @param {object} table CR → XP.
 * @param {*} raw Challenge rating text.
 * @returns {number|null} XP, or null.
 */
function lookupCr(table, raw) {
  const cr = parseChallenge(raw);
  if (cr === null) {
    return null;
  }
  const key = Object.keys(table).find((k) => Math.abs(Number(k) - cr) < 0.01);
  return key === undefined ? null : table[key];
}

/**
 * Pathfinder 2e creature XP, from its level and the party's level.
 *
 * @param {*} creatureLevel Creature level.
 * @param {number} partyLevel Party level.
 * @returns {number|null} XP for the whole party, or null.
 */
export function pf2CreatureXp(creatureLevel, partyLevel) {
  const level = Number(toText(creatureLevel));
  if (!Number.isFinite(level) || !Number.isFinite(partyLevel)) {
    return null;
  }
  const diff = Math.round(level - partyLevel);
  if (diff < -4) return 0;
  if (diff > 4) return 160;
  return PF2_CREATURE_XP[String(diff)];
}

/**
 * The built-in profiles. `sheets` are the sheet names Roll20 uses (the values of the
 * Character Sheet Template list in Game Settings, which characters report as
 * `_charactersheetname`). `fingerprint` attributes pick a profile when the name is not
 * listed, for example on copies of a sheet.
 */
export const PROFILES = [
  {
    id: 'dnd2024',
    label: 'D&D 5E (2024 / 5.5E) by Roll20',
    sheets: ['dnd2024byroll20'],
    roll20Name: 'D&D Fifth Edition (5E & 5.5E)',
    access: 'beacon',
    pc: { xp: ['experience'], level: ['level'] },
    npc: { xp: ['npc_xp'], cr: ['npc_challenge'] },
    levels: DND5E_LEVELS,
    crXp: (cr) => lookupCr(DND5E_CR_XP, cr),
    levelUpHint: 'sheetButton',
    verified: 'live',
  },
  {
    id: 'dnd2014',
    label: 'D&D 5E (2014) by Roll20',
    sheets: ['ogl5e'],
    roll20Name: 'D&D 5E (Classic)',
    fingerprint: ['npc_challenge', 'base_level'],
    access: 'legacy',
    pc: { xp: ['experience'], level: ['level'] },
    npc: { xp: ['npc_xp'], cr: ['npc_challenge'] },
    levels: DND5E_LEVELS,
    crXp: (cr) => lookupCr(DND5E_CR_XP, cr),
    verified: 'live',
  },
  {
    id: 'shaped5e',
    label: 'D&D 5E Shaped',
    sheets: ['dnd5eshaped2'],
    roll20Name: 'D&D 5E (Shaped)',
    fingerprint: ['xp_next_level', 'xp_readable'],
    access: 'legacy',
    pc: { xp: ['xp'], level: ['level'], next: ['xp_next_level'] },
    npc: { xp: ['xp'], cr: ['challenge'] },
    levels: DND5E_LEVELS,
    crXp: (cr) => lookupCr(DND5E_CR_XP, cr),
    verified: 'live',
  },
  {
    id: 'pf1',
    label: 'Pathfinder (1E) by Roll20',
    sheets: ['pathfinderofficial'],
    roll20Name: 'Pathfinder',
    fingerprint: ['npc_cr', 'class1_level'],
    access: 'legacy',
    pc: { xp: ['xp'], level: ['level'], next: ['xp_max'] },
    npc: { xp: ['xp'], cr: ['npc_cr'] },
    // The sheet has no track of its own: the next-level box (the max of xp) is typed by
    // hand. The pf1Track setting picks the track, or 'sheet' reads that box.
    levels: PF1_LEVELS.medium,
    tracks: true,
    crXp: (cr) => lookupCr(PF1_CR_XP, cr),
    verified: 'live',
  },
  {
    id: 'pf1community',
    label: 'Pathfinder (1E) Community',
    sheets: ['pathfinderneceros'],
    roll20Name: 'Pathfinder Community',
    fingerprint: ['npc-cr', 'npc-xp', 'experience_max'],
    access: 'legacy',
    pc: { xp: ['experience'], level: ['level'], next: ['experience_max'] },
    npc: { xp: ['npc-xp'], cr: ['npc-cr'] },
    levels: PF1_LEVELS.medium,
    tracks: true,
    crXp: (cr) => lookupCr(PF1_CR_XP, cr),
    verified: 'live',
  },
  {
    id: 'pf2',
    label: 'Pathfinder Second Edition by Roll20',
    sheets: ['pathfinder2eofficial'],
    roll20Name: 'Pathfinder 2e (Demiplane Optional)',
    access: 'legacy',
    pc: { xp: ['xp'], level: ['level'] },
    npc: { level: ['level'] },
    // PF2 characters level at 1000 XP and then take 1000 off; the sheet does not do it.
    nextXp: () => 1000,
    levelUpHint: 'pf2',
    creatureXp: pf2CreatureXp,
    verified: 'live',
  },
  {
    id: 'sf1',
    label: 'Starfinder by Roll20',
    sheets: ['starfinder'],
    roll20Name: 'Starfinder',
    fingerprint: ['character_level'],
    access: 'legacy',
    pc: { xp: ['xp'], level: ['character_level'], next: ['xp_max'] },
    npc: { xp: ['xp'], cr: ['character_level'] },
    // Starfinder uses the Pathfinder fast track.
    levels: PF1_LEVELS.fast,
    crXp: (cr) => lookupCr(PF1_CR_XP, cr),
    verified: 'live',
  },
  {
    id: 'ose',
    label: 'Old-School Essentials',
    sheets: ['oldschoolessentialsaac'],
    roll20Name: 'Old School Essentials by Necrotic Gnome',
    fingerprint: ['ExpPercentage'],
    access: 'legacy',
    pc: { xp: ['XP'], level: ['level'], next: ['Next'] },
    npc: { xp: ['XP'] },
    levels: null,
    verified: 'live',
  },
  {
    id: 'dcc',
    label: 'Dungeon Crawl Classics',
    sheets: ['dccofficial', 'dcc'],
    roll20Name: 'Dungeon Crawl Classics by Goodman Games',
    fingerprint: ['xp_mod'],
    access: 'legacy',
    pc: { xp: ['xp'], level: ['level'] },
    npc: { xp: ['xp'] },
    levels: [0, 10, 50, 110, 190, 290, 410, 550, 710, 890, 1090],
    firstLevel: 0,
    verified: 'live',
  },
  {
    id: 'dungeonworld',
    label: 'Dungeon World',
    sheets: ['dungeonworldofficial'],
    roll20Name: 'Dungeon World by Roll20',
    fingerprint: ['isNPC', 'calc_isNPC'],
    access: 'legacy',
    pc: { xp: ['xp'], level: ['level'] },
    npc: {},
    // Level up at level + 7 XP, spending the XP.
    nextXp: (level) => level + 7,
    levelUpHint: 'spend',
    verified: 'live',
  },
  {
    id: 'wfrp4',
    label: 'Warhammer Fantasy Roleplay 4E',
    sheets: ['wfrp4official'],
    roll20Name: 'Warhammer Fantasy Roleplay 4e Official by Cubicle 7',
    fingerprint: ['current_xp', 'spent_xp'],
    access: 'legacy',
    pc: { xp: ['current_xp'], level: [] },
    npc: {},
    // The sheet adds up an XP ledger, so awards are new ledger rows.
    write: {
      kind: 'repeatingRow',
      section: 'experience',
      amount: 'experience_amount',
      note: 'experience_desc',
    },
    verified: 'partial',
  },
  {
    id: 'shadowrun5',
    label: 'Shadowrun 5E (karma)',
    sheets: ['shadowrun5thedition'],
    roll20Name: 'Shadowrun 5th Edition',
    fingerprint: ['total karma'],
    access: 'legacy',
    pc: { xp: ['karma'], level: [] },
    npc: {},
    alsoAdd: ['total karma'],
    unit: 'karma',
    verified: 'live',
  },
  {
    id: 'shadowrun6',
    label: 'Shadowrun 6E (karma)',
    sheets: ['shadowrun6world'],
    roll20Name: 'Shadowrun, Sixth World',
    fingerprint: ['total_karma'],
    access: 'legacy',
    pc: { xp: ['karma'], level: [] },
    npc: {},
    alsoAdd: ['total_karma'],
    unit: 'karma',
    verified: 'live',
  },
  {
    id: 'cypher',
    label: 'Cypher System',
    sheets: ['cypherstemsr20'],
    roll20Name: 'Cypher Systems',
    fingerprint: ['sheet_style'],
    access: 'legacy',
    pc: { xp: ['xp'], level: ['tier'] },
    npc: {},
    levels: null,
    verified: 'live',
  },
  {
    id: 'swade',
    label: 'Savage Worlds (advances)',
    sheets: ['savageworldsofficial'],
    roll20Name: 'Official Savage Worlds by Pinnacle',
    fingerprint: ['manualAdvance', 'setadvance'],
    access: 'legacy',
    pc: { xp: [], level: ['rank'] },
    npc: {},
    // The sheet counts Advances from its Edges list; XP cannot be written.
    xpless: true,
    verified: 'live',
  },
  {
    id: 'levelonly',
    label: '13th Age, Cosmere and other level-only sheets',
    sheets: ['official13thage', 'cosmereofficial'],
    roll20Name: '13th Age; Cosmere RPG (Demiplane Optional)',
    fingerprint: ['is_adversary'],
    access: 'legacy',
    pc: { xp: [], level: ['level'] },
    npc: {},
    xpless: true,
    verified: 'live',
  },
  {
    id: 'cthulhu',
    label: 'Call of Cthulhu 7E (no XP)',
    sheets: ['coc7e', 'callofcthulu'],
    roll20Name: 'Call of Cthulhu 7th Edition',
    access: 'legacy',
    pc: { xp: [], level: [] },
    npc: {},
    xpless: true,
    verified: 'live',
  },
  {
    id: 'generic',
    label: 'Other sheet (common names)',
    sheets: [],
    access: 'legacy',
    pc: {
      xp: ['experience', 'xp', 'exp', 'experience_points'],
      level: ['level', 'lvl', 'character_level'],
    },
    npc: { xp: ['npc_xp', 'xp', 'experience'], cr: ['npc_challenge', 'challenge', 'cr'] },
    levels: null,
    crXp: null,
    verified: 'none',
  },
  {
    id: 'custom',
    label: 'Custom fields',
    sheets: [],
    access: 'auto',
    pc: null,
    npc: null,
    levels: null,
    crXp: null,
    verified: 'none',
  },
];

/**
 * Returns a profile by ID.
 *
 * @param {string} id Profile ID.
 * @returns {object|undefined} Profile.
 */
export function getProfileById(id) {
  return PROFILES.find((p) => p.id === id);
}

/**
 * Lists the IDs a GM can choose for the system setting.
 *
 * @returns {string[]} IDs, auto first.
 */
export function systemIds() {
  return ['auto', ...PROFILES.map((p) => p.id)];
}

/**
 * Parses the custom level table setting ("0,300,900,…").
 *
 * @param {string} text Setting text.
 * @returns {number[]|null} XP to reach each level, or null when blank or invalid.
 */
export function parseLevelTable(text) {
  const items = splitList(text).map((s) => Number(s.replaceAll('_', '')));
  if (items.length < 2 || items.some((n) => !Number.isFinite(n) || n < 0)) {
    return null;
  }
  return items.every((n, i) => i === 0 || n > items[i - 1]) ? items : null;
}

/**
 * Builds the custom profile from the settings.
 *
 * @param {object} config Mod settings.
 * @param {string} access 'beacon' or 'legacy'.
 * @returns {object} Profile.
 */
function customProfile(config, access) {
  const base = getProfileById('custom');
  const list = (v) => splitList(v);
  return {
    ...base,
    access,
    pc: { xp: list(config.customXp), level: list(config.customLevel) },
    npc: { xp: list(config.customNpcXp), cr: list(config.customNpcCr) },
    levels: parseLevelTable(config.customLevels),
  };
}

/**
 * Picks the profile for a sheet name.
 *
 * @param {string} sheetName The character's `_charactersheetname`.
 * @returns {object} Profile (the generic one when nothing matches).
 */
export function detectProfile(sheetName, character = null) {
  const name = toText(sheetName).toLowerCase();
  const byName = PROFILES.find(
    (p) => p.sheets.includes(name) || (p.match instanceof RegExp && name && p.match.test(name))
  );
  if (byName) {
    return byName;
  }
  // Sheet names are not documented, so look for attributes only one sheet has.
  if (character) {
    const names = new Set(
      findObjs({ _type: 'attribute', _characterid: character.id }).map((a) =>
        toText(a.get('name')).toLowerCase()
      )
    );
    const byAttrs = PROFILES.find((p) =>
      (p.fingerprint || []).some((f) => names.has(f.toLowerCase()))
    );
    if (byAttrs) {
      return byAttrs;
    }
  }
  return getProfileById('generic');
}

/**
 * Returns the profile to use for a character.
 *
 * @param {object} character Roll20 character.
 * @param {object} config Mod settings.
 * @param {boolean} beaconAvailable Whether the sandbox can use Beacon sheets.
 * @returns {object} Profile.
 */
export function profileForCharacter(character, config, beaconAvailable) {
  const sheetName =
    toText(character?.get?.('_charactersheetname')) || toText(Campaign()?.sheetName);
  if (config.system === 'custom') {
    const beaconSheet = detectProfile(sheetName, character).access === 'beacon';
    return customProfile(config, beaconSheet && beaconAvailable ? 'beacon' : 'legacy');
  }
  const profile =
    config.system && config.system !== 'auto'
      ? getProfileById(config.system) || detectProfile(sheetName, character)
      : detectProfile(sheetName, character);
  return withTrack(profile, config.pf1Track);
}

/**
 * Applies the Pathfinder 1E track setting to a profile that has tracks. With a track
 * or plan, the level table and the XP for the next level come from it, and the sheet's
 * next-level box is written rather than read. 'sheet' (or an unusable value) leaves
 * the profile reading that box, with the medium track when it is blank.
 *
 * @param {object} profile Profile.
 * @param {string} setting The pf1Track setting.
 * @returns {object} Profile.
 */
export function withTrack(profile, setting) {
  if (!profile?.tracks || toText(setting).toLowerCase() === TRACK_SHEET) return profile;
  const plan = parseTrackPlan(setting);
  if (!plan) return profile;
  const levels = [0];
  for (let level = 1; level < 20; level++) levels.push(trackNextXp(plan, level));
  return {
    ...profile,
    pc: { ...profile.pc, next: [] },
    levels,
    nextXp: (level) => trackNextXp(plan, level),
    trackPlan: plan,
    nextBox: toText(profile.pc?.next?.[0]),
  };
}

/**
 * Works out the level a total XP reaches on a level table.
 *
 * @param {number[]|null} table XP to reach each level.
 * @param {number} xp Total XP.
 * @returns {number|null} Level, or null without a table.
 */
export function levelForXp(table, xp, firstLevel = 1) {
  if (!Array.isArray(table) || table.length === 0) {
    return null;
  }
  let level = firstLevel;
  for (let i = 0; i < table.length; i++) {
    if (xp >= table[i]) level = i + firstLevel;
  }
  return level;
}

/**
 * XP needed to reach the next level.
 *
 * @param {number[]|null} table XP to reach each level.
 * @param {number} level Current level.
 * @returns {number|null} XP, or null at the top of the table or without one.
 */
export function xpForNextLevel(table, level, firstLevel = 1) {
  const index = level - firstLevel + 1;
  return Array.isArray(table) && index >= 1 && index < table.length ? table[index] : null;
}
