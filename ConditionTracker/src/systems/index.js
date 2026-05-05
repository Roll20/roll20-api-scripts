import { dnd5eProfile } from "./dnd5e.js";
import { dnd4eProfile } from "./dnd4e.js";
import { dnd35Profile } from "./dnd35.js";
import { pathfinder1eProfile } from "./pathfinder1e.js";
import { pathfinder2eProfile } from "./pathfinder2e.js";
import { starfinderProfile } from "./starfinder.js";
import { thirteenthAgeProfile } from "./13thage.js";
import { dccProfile } from "./dcc.js";
import { oseProfile } from "./ose.js";
import { bfrpgProfile } from "./bfrpg.js";
import { sotdlProfile } from "./sotdl.js";
import { wwnProfile } from "./wwn.js";
import { callOfCthulhuProfile } from "./callofcthulhu.js";
import { deltaGreenProfile } from "./deltagreen.js";
import { vaesenProfile } from "./vaesen.js";
import { mothershipProfile } from "./mothership.js";
import { genesysProfile } from "./genesys.js";
import { cortexPrimeProfile } from "./cortexprime.js";
import { vtmProfile } from "./vtm.js";
import { wtaProfile } from "./wta.js";
import { mtaProfile } from "./mta.js";
import { htrProfile } from "./htr.js";
import { ctdProfile } from "./ctd.js";
import { shadowrunProfile } from "./shadowrun.js";
import { cyberpunkRedProfile } from "./cyberpunkred.js";
import { travellerProfile } from "./traveller.js";
import { starsWithoutNumberProfile } from "./swn.js";
import { alienRpgProfile } from "./alienrpg.js";
import { starWarsFfgProfile } from "./starwarsffg.js";
import { gurpsProfile } from "./gurps.js";
import { savageWorldsProfile } from "./savageworlds.js";
import { brpProfile } from "./brp.js";
import { heroSystemProfile } from "./herosystem.js";
import { cypherSystemProfile } from "./cyphersystem.js";
import { knaveProfile } from "./knave.js";
import { intoTheOddProfile } from "./intotheodd.js";
import { cairnProfile } from "./cairn.js";
import { wh40kProfile } from "./wh40k.js";
import { whaosProfile } from "./whaos.js";
import { wfrp4eProfile } from "./wfrp4e.js";
import { genericProfile } from "./generic.js";

/**
 * @typedef {object} ConditionData
 * @property {string} past - Past-tense description (e.g. "grappled").
 * @property {string} verb - Action verb for "[source] [verb] [target]" messages (e.g. "grapples").
 * @property {string} [suffix] - Optional suffix for "verb target suffix" phrasing (e.g. "prone").
 * @property {string} icon - Short text icon used in icon-mode Turn Tracker rows (e.g. "[G]").
 * @property {string} emoji - Emoji used in Turn Tracker rows and GM whispers (e.g. "🤛").
 * @property {boolean} [noBy] - When true, omit the "by [source]" clause from removal messages.
 */

/**
 * @typedef {object} GameSystemProfile
 * @property {string} SYSTEM_ID - Canonical system id used in config and `--config gameSystem` commands.
 * @property {string} SYSTEM_NAME - Human-readable system display name.
 * @property {readonly string[]} STANDARD_CONDITIONS - Alphabetically sorted list of standard condition names for the wizard.
 * @property {Readonly<Record<string, ConditionData>>} CONDITION_DATA - Per-condition display data keyed by condition name.
 * @property {Readonly<Record<string, string>>} DEFAULT_MARKERS - Default Roll20 status marker names keyed by condition name.
 * @property {readonly string[]} CUSTOM_EFFECT_TYPES - Ordered canonical custom-effect-type keys shown in the wizard.
 * @property {Readonly<Record<string, string>>} CUSTOM_EFFECT_LABELS - Display label overrides for canonical type keys (e.g. { Spell: "Power" }).
 */

export const DEFAULT_GAME_SYSTEM = "dnd5e";

export const GAME_SYSTEM_DEFINITIONS = Object.freeze([
  // D&D family
  { id: "dnd5e",          name: "Dungeons & Dragons 5th Edition",          profile: dnd5eProfile },
  { id: "dnd4e",          name: "Dungeons & Dragons 4th Edition",          profile: dnd4eProfile },
  { id: "dnd35",          name: "Dungeons & Dragons 3.5 Edition",          profile: dnd35Profile },
  // Pathfinder / Starfinder
  { id: "pathfinder1e",   name: "Pathfinder First Edition",                profile: pathfinder1eProfile },
  { id: "pathfinder2e",   name: "Pathfinder Second Edition",               profile: pathfinder2eProfile },
  { id: "starfinder",     name: "Starfinder",                              profile: starfinderProfile },
  // D&D-adjacent fantasy
  { id: "13thage",        name: "13th Age",                                profile: thirteenthAgeProfile },
  { id: "sotdl",          name: "Shadow of the Demon Lord",                profile: sotdlProfile },
  { id: "cyphersystem",   name: "Cypher System",                           profile: cypherSystemProfile },
  // OSR / Old-School
  { id: "dcc",            name: "Dungeon Crawl Classics",                  profile: dccProfile },
  { id: "ose",            name: "Old-School Essentials",                   profile: oseProfile },
  { id: "bfrpg",          name: "Basic Fantasy RPG",                       profile: bfrpgProfile },
  { id: "knave",          name: "Knave",                                   profile: knaveProfile },
  { id: "intotheodd",     name: "Into the Odd",                            profile: intoTheOddProfile },
  { id: "cairn",          name: "Cairn",                                   profile: cairnProfile },
  { id: "wwn",            name: "Worlds Without Number",                   profile: wwnProfile },
  { id: "swn",            name: "Stars Without Number",                    profile: starsWithoutNumberProfile },
  // Horror / Investigative
  { id: "callofcthulhu",  name: "Call of Cthulhu",                         profile: callOfCthulhuProfile },
  { id: "deltagreen",     name: "Delta Green",                             profile: deltaGreenProfile },
  { id: "vaesen",         name: "Vaesen",                                  profile: vaesenProfile },
  { id: "brp",            name: "Basic Role-Playing",                      profile: brpProfile },
  // World of Darkness
  { id: "vtm",            name: "Vampire: The Masquerade",                 profile: vtmProfile },
  { id: "wta",            name: "Werewolf: The Apocalypse",                profile: wtaProfile },
  { id: "mta",            name: "Mage: The Ascension",                     profile: mtaProfile },
  { id: "htr",            name: "Hunter: The Reckoning",                   profile: htrProfile },
  { id: "ctd",            name: "Changeling: The Dreaming",                profile: ctdProfile },
  // Sci-Fi / Cyberpunk
  { id: "alienrpg",       name: "Alien RPG",                               profile: alienRpgProfile },
  { id: "mothership",     name: "Mothership RPG",                          profile: mothershipProfile },
  { id: "traveller",      name: "Traveller",                               profile: travellerProfile },
  { id: "cyberpunkred",   name: "Cyberpunk Red",                           profile: cyberpunkRedProfile },
  { id: "shadowrun",      name: "Shadowrun",                               profile: shadowrunProfile },
  // Narrative / Cinematic
  { id: "genesys",        name: "Genesys",                                 profile: genesysProfile },
  { id: "starwarsffg",    name: "Star Wars Roleplaying Game (FFG)",        profile: starWarsFfgProfile },
  { id: "cortexprime",    name: "Cortex Prime",                            profile: cortexPrimeProfile },
  // Classless / Universal
  { id: "gurps",          name: "GURPS",                                   profile: gurpsProfile },
  { id: "herosystem",     name: "Hero System",                             profile: heroSystemProfile },
  { id: "savageworlds",   name: "Savage Worlds Adventure Edition",         profile: savageWorldsProfile },
  // Warhammer
  { id: "wfrp4e",         name: "Warhammer Fantasy Roleplay 4e",          profile: wfrp4eProfile },
  { id: "wh40k",          name: "Warhammer 40,000 RPG",                   profile: wh40kProfile },
  { id: "whaos",          name: "Warhammer Age of Sigmar: Soulbound",     profile: whaosProfile },
  // Fallback
  { id: "generic",        name: "Generic / Other",                         profile: genericProfile },
]);

export const VALID_GAME_SYSTEMS = Object.freeze(
  new Set(GAME_SYSTEM_DEFINITIONS.map((def) => def.id)),
);

export const VALID_GAME_SYSTEM_LIST = GAME_SYSTEM_DEFINITIONS.map(
  (def) => `${def.id} — ${def.name}`,
).join(" / ");

/**
 * Returns the system profile for the given system id.
 * Falls back to the D&D 5e profile when the id is unrecognised.
 *
 * @param {string} systemId Game system id.
 * @returns {object} System profile.
 */
export function getSystemProfile(systemId) {
  const def = GAME_SYSTEM_DEFINITIONS.find((d) => d.id === systemId);
  return def ? def.profile : dnd5eProfile;
}
