// Script: tokenActionMaker - Token Action Maker (merged Token Action // Builder + legacy Token Action Maker), development build // Author: Keith Curtis // Date: 2026-09-20

const tokenActionMaker = (() => { "use strict";

// Config

const scriptName = "TokenActionMaker";
const chatDisplayName = "Token Action Maker";
const commandName = "ta";
const version = "2.0.0-dev.21";
const schemaVersion = 1.0;

const DEBUG = false;

// Characters Roll20 won't run as a token action button (ability still
// works fine from the sheet itself). Confirmed bad so far via a
// separate diagnostic script: colon, pipe, close curly brace, open
// paren. Kept as a block list, not an allowlist, so legitimate
// accented/non-Roman characters in names aren't affected. Shared by
// abbreviateName and legacyAbbreviateName below.
const UNSUPPORTED_TOKEN_ACTION_CHARS = /[:|}(]/g;

// Logger

const Logger = {
    log: (msg) => log(`${scriptName} | ${msg}`),
    debug: (msg) => {
        if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`);
    },
    error: (msg) => log(`${scriptName} [ERROR] | ${msg}`),
    // Returns a stopper; logs elapsed ms and records it under Timing
    // when characterId is given.
    time: (consoleLabel, characterId, recordLabel) => {
        const t0 = Date.now();
        return () => {
            const ms = Date.now() - t0;
            log(`${scriptName} [TIME] | ${consoleLabel}: ${ms}ms`);
            if (characterId) {
                Timing.record(characterId, recordLabel || consoleLabel, ms);
            }
            return ms;
        };
    }
};

// Timing (per-character breakdown, in-memory only)

const Timing = (() => {
    const records = {};

    return {
        clear: (characterId) => { delete records[characterId]; },
        record: (characterId, label, ms) => {
            if (!records[characterId]) records[characterId] = [];
            records[characterId].push({ label, ms });
        },
        get: (characterId) => records[characterId] || null
    };
})();

// State

const State = {
    initialize: () => {
        if (!state[scriptName] || state[scriptName].version !== schemaVersion) {
            Logger.log(`Updating schema to v${schemaVersion}`);
            state[scriptName] = {
                version: schemaVersion,
                config: {}
            };
        }
    }
};

// Category & Macro Metadata (Beacon engine)
const categoryMeta = {
    attacks: {
        pc: {
            section: "attacks",
            macroPrefix: "repeating_attack",
            macroType: "attack",
            label: "Attack",
            namePrefix: ""
        },
        npc: null
    },
    trait: {
        pc: {
            section: "features",
            macroPrefix: "repeating_trait",
            macroType: "output",
            label: "Feature",
            namePrefix: ""
        },
        npc: {
            section: "features",
            macroPrefix: "repeating_trait",
            macroType: "output",
            label: "Feature",
            namePrefix: ""
        }
    },
    action: {
        pc: null,
        npc: {
            section: "npcactions",
            macroPrefix: "repeating_npcaction",
            macroType: "action",
            label: "NPCAction",
            namePrefix: ""
        }
    },
    bonus: {
        pc: null,
        npc: {
            section: "npcbonusactions",
            macroPrefix: "repeating_npcbonusaction",
            macroType: "action",
            label: "NPCBonus",
            namePrefix: "_B."
        }
    },
    reaction: {
        pc: null,
        npc: {
            section: "npcreactions",
            macroPrefix: "repeating_npcreaction",
            macroType: "action",
            label: "NPCReaction",
            namePrefix: "_R."
        }
    },
    legendary: {
        pc: null,
        npc: {
            section: "npcactions-l",
            macroPrefix: "repeating_npcaction-l",
            macroType: "action",
            label: "NPCLegendary",
            namePrefix: "_L_"
        }
    },
    mythic: {
        pc: null,
        npc: {
            section: "npcactions-m",
            macroPrefix: "repeating_npcaction-m",
            macroType: "action",
            label: "NPCMythic",
            namePrefix: "_M_"
        }
    }
};

// Keyword Aliases (Beacon engine's categories; "pf2" is handled
// separately below — accepted for back-compat but never mapped to a
// category, since sheet type is now auto-detected).
const keywordAliases = {
    attack: "attacks",
    attacks: "attacks",
    feature: "trait",
    features: "trait",
    trait: "trait",
    traits: "trait",
    action: "action",
    actions: "action",
    bonus: "bonus",
    bonusactions: "bonus",
    reaction: "reaction",
    reactions: "reaction",
    legendary: "legendary",
    mythic: "mythic",
    offensive: "offensive",
    reactive: "reactive",
    interaction: "interaction",
    save: "saves",
    saves: "saves",
    check: "checks",
    checks: "checks",
    init: "init",
    initiative: "init",
    spell: "spells",
    spells: "spells"
};

function isExperimentalSandbox() {
    const sandboxVersion = (typeof Campaign === "function") ? Campaign().sandboxVersion : undefined;
    return sandboxVersion === "1.5";
}

// CSS
// Covers Roll20's whisper sender header via negative margin — tune
// these two if the announcer isn't fully hidden, or if it starts
// eating into your own message text.
const HIDE_ANNOUNCER_TOP = "-30px";
const HIDE_ANNOUNCER_LEFT = "-5px";

const CSS = {
    box: "background:#e9e9e9; color:#222; padding:3px 6px; border-radius:3px; border: solid 1px #444; font-size:12px; line-height:1.4; min-height:29px;",
    boxCharacter: "background:#cfcfcf; color:#222; padding:3px 6px; border-radius:3px; border: solid 1px #444; font-size:12px; line-height:1.4; min-height:29px;",
    link: "color:#1a5fb4; text-decoration:underline; background:none; border:none; padding:0; margin:0; font:inherit; cursor:pointer;",
    hideAnnouncer: `position:relative; margin:${HIDE_ANNOUNCER_TOP} 0px 0px ${HIDE_ANNOUNCER_LEFT}; padding:0px; font-size:0px;`,
    // Help-text-only styles: section heading, <ul>/<li> list for
    // command/category lines, and a pill-shaped button for the
    // sheet-help chat menu.
    heading: "margin:8px 0 3px;font-weight:bold;font-size:11px;color:#444;border-bottom:1px solid #bbb;padding-bottom:2px;",
    list: "margin:2px 0 4px 16px;padding:0;",
    // Stacked (one per line), centered, 80% width — the official
    // sheet names are long enough that side-by-side pills wrapped
    // awkwardly.
    button: "display:block;width:80%;box-sizing:border-box;margin:4px auto;text-align:center;background:#fff;color:#1a5fb4;border:1px solid #1a5fb4;border-radius:4px;padding:4px 10px;text-decoration:none;font-weight:bold;"
};

// Output
function resolveWhisperTarget(msg) {
    if (!msg || !msg.playerid) return null;
    const playerObj = getObj("player", msg.playerid);
    return playerObj ? `"${playerObj.get("displayname")}"` : `"gm"`;
}

// Unique invisible suffix per call so Roll20 always renders a fresh
// header for the margin trick above to cover.
let sendSeq = 0;
function uniqueChatDisplayName() {
    sendSeq++;
    let suffix = "";
    for (const bit of sendSeq.toString(2)) {
        suffix += bit === "1" ? "​" : "‌";
    }
    return chatDisplayName + suffix;
}

const Output = {
    whisper: (msg, title, html) => {
        const playerName = resolveWhisperTarget(msg);
        if (!playerName) return;
        const boxed = `<div style="${CSS.hideAnnouncer}"><div style="${CSS.box}"><b>${title}</b><br>${html}</div></div>`;
        sendChat(uniqueChatDisplayName(), `/w ${playerName} ${boxed}`, null, {
            noarchive: true
        });
    },
    whisperLine: (msg, html, variant) => {
        const playerName = resolveWhisperTarget(msg);
        if (!playerName) return;
        const style = variant === "character" ? CSS.boxCharacter : CSS.box;
        const boxed = `<div style="${CSS.hideAnnouncer}"><div style="${style}">${html}</div></div>`;
        sendChat(uniqueChatDisplayName(), `/w ${playerName} ${boxed}`, null, {
            noarchive: true
        });
    },
    link: (label, command) => `<a href="${command}" style="${CSS.link}">${label}</a>`,
    button: (label, command) => `<a href="${command}" style="${CSS.button}">${label}</a>`,
    heading: (text) => `<div style="${CSS.heading}">${text}</div>`,
    list: (items) => `<ul style="${CSS.list}">${items.map(i => `<li>${i}</li>`).join("")}</ul>`
};


// Help System — split by sheet: !ta help whispers a short common
// page (usage, categories shared by every sheet, examples, legacy
// commands) with three buttons, each whispering just that sheet's
// own category list and quirks.
const ta_HELP_MAIN = `Creates token action macros for the selected token's character sheet. Supported sheets are listed below.
${Output.heading("Usage")} ${Output.list([ <code>!ta</code> — Create all standard token actions., <code>!ta name</code> — Same, but uses the character name instead of the character id (useful when moving a character to a new game)., <code>!ta [categories]</code> — Create only the specified categories., <code>!ta [categories] name</code> — Combine both of the above., <code>!ta delete</code> — Delete unprotected token actions. Protect a macro by ending its name with a period., <code>!ta deleteall</code> — Delete ALL token actions, protected or not., <code>!ta sort</code> — Same as !ta, but groups and alphabetizes NPC actions (and PC attacks) instead of leaving them in the sheet's own order. See your sheet's page for specifics., <code>!ta help</code> — Show this help message. ])} Run the command with the token(s) selected — each token's sheet is auto-detected. Tokens on an unrecognized sheet (including PF2 via Demiplane) are skipped and reported.
Macros are created as token actions, visible only when that token is selected. ${Output.heading("Categories available on every sheet")} (singular/plural both accepted) ${Output.list([ <b>spells</b>: Spellcasting chat menu., <b>checks</b>: Ability and skill checks — dropdown showing each option's current modifier., <b>saves</b>: Saving throws — dropdown showing each option's current modifier., <b>init</b>: Initiative roll. ])} The rest (attacks, actions, traits, and each sheet's own NPC ability groups) works a bit differently per sheet — pick yours for details:
{{SHEET_LINKS}} ${Output.heading("Examples")} ${Output.list([ <code>!ta</code> — Full set of NPC or PC macros., <code>!ta checks saves spells</code> — Only checks, saves, and spells., <code>!ta checks name</code> — All checks, using the character name in the macro. ])} ${Output.heading("Legacy commands (still recognized)")} ${Output.list([ <code>!deleteta</code>, <code>!deleteallta</code>, <code>!sortta</code> — old command forms, kept working for existing macros., The <code>pf2</code> keyword is still accepted but ignored — sheet detection is automatic now. ])}`;

const ta_HELP_SHEET = {
    beacon: `${Output.heading("Categories")}
${Output.list([ <b>attacks</b>: PC weapon attacks., <b>actions</b>: NPC actions., <b>trait</b> (or <b>feature</b>): Character features/traits. Not created for PCs unless requested, to keep the token bar manageable., <b>bonus</b>: NPC bonus actions., <b>reactions</b>: NPC reactions., <b>legendary</b>: NPC legendary actions., <b>mythic</b>: NPC mythic actions. ])} ${Output.heading("Notes")} ${Output.list([ NPC action types are grouped in the token bar with name prefixes: _B.Bonus Actions, _R.Reactions, _L_Legendary, _M_Mythic., <code>!ta sort</code> also groups plain NPC actions this way (prefixed _A.), so they cluster together instead of scattering alphabetically among everything else on the token bar., Checks, Saves and Init are named with a leading period (.Check/.Save/.Init) so they sort to the top of the list., Beacon characters can take a while to process. You'll get a timestamped progress update in chat as each character finishes, and the API console log also records progress along the way — so if it looks stalled, it's usually still working. ])}, legacy5e: ${Output.heading("Categories")} ${Output.list([ <b>attacks</b> (or <b>actions</b> — same keyword here): PC weapon attacks, plus NPC actions, including legendary and mythic., <b>trait</b> (or <b>feature</b>): Character features/traits. Not created for PCs unless requested, to keep the token bar manageable., <b>bonus</b>: NPC bonus actions., <b>reactions</b>: NPC reactions. ])} ${Output.heading("Notes")} ${Output.list([ NPC legendary/mythic actions are grouped in the token bar with name prefixes: _L_Legendary, _M_Mythic — same convention as Beacon., <code>!ta sort</code> groups and alphabetizes plain NPC actions and PC attacks (prefixed _A.) and bonus actions (prefixed _B.), also matching Beacon's naming. Reactions, traits, and mythic actions aren't affected by sort., Checks, Saves and Init are named with a leading period (.Check/.Save/.Init) so they sort to the top of the list. ])}, pf2: ${Output.heading("Categories")} ${Output.list([ <b>attacks</b>: PC weapon attacks, plus NPC melee/ranged strikes., <b>actions</b>: PC's general actions list., <b>offensive</b>: NPC offensive abilities., <b>reactive</b>: NPC reactive abilities., <b>interaction</b>: NPC interaction abilities. ])} ${Output.heading("Notes")} ${Output.list([ Ranged strikes get a -R suffix, plus two extra abbreviated buttons (Attack2/Attack3) alongside the main one., <code>!ta sort</code> is not recommended for PF2 and has no effect here — alphabetizing would break the Attack-Attack2-Attack3 progression, so unsorted actions are created instead and a warning is shown., Checks, Saves and Init are named with a leading period (.Check/.Save/.Init) so they sort to the top of the list. ])}` };

// Sheet Detection — identifies which engine should run for a given
// character, from the Roll20 "charactersheetname" attribute. PF2 via
// Demiplane (nexus_pathfinder2e) is explicitly out of scope and
// falls through to null, same as any other unrecognized sheet.
const SHEET_SIGNATURES = {
    beacon: "dnd2024byroll20",
    legacy5e: "ogl5e",
    pf2: "pathfinder2eofficial"
};

const SHEET_LABELS = {
    beacon: "D&D Fifth Edition (5e & 5.5e)",
    legacy5e: "D&D 5e (Classic)",
    pf2: "Pathfinder 2e (Official)"
};

// Detection is always computed live (no caching) — cheap enough to
// call fresh every time, and avoids serving a stale sheet type if a
// game's sheet changes mid-session.
const sheetDetect = (() => {
    const getCharacter = (query) => {
        const chars = findObjs({
            type: 'character'
        });
        return chars.find(c => c.id === query) ||
            chars.find(c => c.id === (getObj('graphic', query)?.get('represents'))) ||
            chars.find(c => c.get('name') === query);
    };

    const detectType = (characterId) => {
        const char = getObj("character", characterId);
        if (!char) return null;
        const sheetName = (char.get("charactersheetname") || "").toLowerCase();
        for (const [sheetType, signature] of Object.entries(SHEET_SIGNATURES)) {
            if (sheetName.includes(signature)) return sheetType;
        }
        return null;
    };

    const detect = (query) => {
        if (!query) return null;
        const char = getCharacter(query);
        if (!char) return null;
        return detectType(char.id);
    };

    return { detect };
})();


// Abbreviate Names (Beacon engine)
function abbreviateName(name, context) {
    if (!name) return "";

    name = name.replace(/ \(One[-\s]?Handed\)/i, "-1H");        // "Sword (One-Handed)" or "Sword (One Handed)" → "Sword-1H"
    name = name.replace(/ \(Two[-\s]?Handed\)/i, "-2H");        // "Greatsword (Two-Handed)" or "Greatsword (Two Handed)" → "Greatsword-2H"
    name = name.replace(/ \(Melee; One[-\s]?Handed\)/i, "-1Hm");// e.g., "Dagger (Melee; One-Handed)" → "Dagger-1Hm"
    name = name.replace(/ \(Melee; Two[-\s]?Handed\)/i, "-2Hm");// e.g., "Polearm (Melee; Two-Handed)" → "Polearm-2Hm"
    name = name.replace(/Thrown/i, "Thrn");                     // e.g., "Thrown Weapon" → "Thrn Weapon"
    name = name.replace(/Finesse/i, "Fnss");                    // e.g., "Finesse Attack" → "Fnss Attack"
    name = name.replace(/Dexterous/i, "Dex");                   // e.g., "Dexterous Strike" → "Dex Strike"
    name = name.replace(/Open Hand Technique/i, "Open Hand");   // e.g., "Open Hand Technique" → "Open Hand"
    name = name.replace(/ \(Psionics\)/i, "—Psi");              // e.g., "Mind Blast (Psionics)" → "Mind Blast—Psi"
    name = name.replace(/ \(Melee\)/i, "-m");                   // e.g., "Punch (Melee)" → "Punch-m"
    name = name.replace(/ \(Ranged\)/i, "-r");                  // e.g., "Bow (Ranged)" → "Bow-r"
    name = name.replace(/\bForm Only\b/i, "Form");              // e.g., "Bear Form Only" → "Bear Form"

    name = name.replace(/swarm has more than half hp/i, "HP>Half"); // e.g., "swarm has more than half HP" → "HP>Half"
    name = name.replace(/swarm has half hp or less/i, "HP<=Half");  // e.g., "swarm has half HP or less" → "HP<=Half"

    name = name.replace(/\s?\(Recharges?(.*?)\)|\bRecharges?\s(\d+-\d+)/i,
        (match, parenRecharge, plainRecharge) => {
            if (parenRecharge !== undefined) {
                const text = parenRecharge.trim();
                if (!text) return "—R";
                if (/Short or Long Rest/i.test(text)) return "—R Short/Long";
                if (/Short Rest/i.test(text)) return "—R Short";
                if (/Long Rest/i.test(text)) return "—R Long";
                return "—R " + text;
            }
            if (plainRecharge) return "R" + plainRecharge; // e.g., "Recharge 5-6" → "R5-6"
            return match;
        });

    name = name.replace(/\s?\((\d+)\/Day\)/i, "$1/d");       // e.g., "(3/Day)" → "3/d"
    name = name.replace(/\s\(Costs\s(.*)\sActions\)/i, "—$1a"); // e.g., "(Costs 2 Actions)" → "—2a"
    name = name.replace(/\sVariant\)/i, "—");                // e.g., "Ability (Variant)" → "Ability—"

    name = name.replace(/\s?\(/g, "—");
    name = name.replace(/\)/g, "");
    name = name.replace(/\.+$/, "");

    // Sheet-worker error template came back instead of a real name —
    // visible cue for the player to re-run this character, now logged.
    if (/template:error/i.test(name)) {
        Logger.error(`Sheet returned an error template instead of a name${context ? ` (${context})` : ""}: ${name}`);
        name = name.replace(/.*template:error.*/i, "Token Action " + (Math.floor(Math.random() * 100) + 1));
    }

    // Strip characters Roll20 won't run as a token action button
    // (see UNSUPPORTED_TOKEN_ACTION_CHARS above).
    name = name.replace(UNSUPPORTED_TOKEN_ACTION_CHARS, "");

    // Beacon won't save or even close an ability whose name has a space
    // in it — collapse any run of whitespace to a single hyphen. Last
    // step, so it also cleans up the fallback name above.
    name = name.replace(/\s+/g, "-");

    return name;
}


// Parser — !ta uses positional keywords, not --key value; a shipped
// stable contract, so it keeps its own dedicated grammar. "pf2" is
// accepted (for anyone used to typing it) but never becomes a
// category — sheet type is auto-detected now.
function parseTaCommand(msgContent) {
    const trimmed = msgContent.trim();
    const parts = trimmed.split(/\s+/).slice(1);
    const categories = new Set();
    let useNames = false;
    let userSpecified = false;
    // Bare legacy "!sortta" implies sort mode + the full default
    // category list, matching TAM's original behavior. Checked against
    // the raw command word since slice(1) above drops it.
    let sortMode = /^!sortta$/i.test(trimmed);

    parts.forEach(word => {
        const lc = word.toLowerCase();
        if (lc === "name" || lc === "names") {
            useNames = true;
            return;
        }
        if (lc === "sort" || lc === "sorted") {
            sortMode = true;
            return;
        }
        if (lc === "pf2") {
            return;
        }
        const cat = keywordAliases[lc];
        if (cat) {
            categories.add(cat);
            userSpecified = true;
        }
    });

    if (categories.size === 0) {
        // No keywords given — full default suite, shared across all
        // three engines (each engine's has() picks out only what
        // applies to it). Includes PF2-only offensive/reactive/
        // interaction so a bare !ta on a PF2 character still gets
        // them, now that sheet type is auto-detected instead of
        // keyword-gated.
        return {
            categories: [...Object.keys(categoryMeta), "saves", "checks", "init", "spells", "offensive", "reactive", "interaction"],
            useNames,
            userSpecified: false,
            sortMode
        };
    }

    return {
        categories: Array.from(categories),
        useNames,
        userSpecified: true,
        sortMode
    };
}

// Get Spells (ids) — levels fetched in parallel. (Beacon engine)
async function getSpells(characterId) {
    const levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const fetched = await Promise.all(levels.map(async (lvl) => {
        const key = lvl === 0 ? "reporder_spell-cantrip" : `reporder_spell-${lvl}`;
        try {
            const ids = await getComputed(characterId, key) || [];
            return { lvl, ids };
        } catch (err) {
            Logger.error(`getComputed failed for ${characterId} ${key}: ${err}`);
            return { lvl, ids: [] };
        }
    }));

    const result = {};
    for (const { lvl, ids } of fetched) {
        if (ids.length) result[lvl] = ids;
    }
    return result;
}

// Build spells macro with names — per-spell lookups fetched in parallel.
async function buildSpellsMacro(spells, characterName, characterId, useNames) {
    const idRef = useNames ? characterName : characterId;

    const levelEntries = await Promise.all(Object.entries(spells).map(async ([lvl, ids]) => {
        let header;
        if (lvl === "0") {
            header = "**Cantrips**";
        } else {
            const total = `[[@{${idRef}|lvl${lvl}_slots_total}]]`;
            const expended = `@{${idRef}|lvl${lvl}_slots_expended}`;
            const remaining = `[[${total} - ${expended}]]`;
            header = `**Level ${lvl}** - ${remaining} / ${total}`;
        }

        const prefix = (lvl === "0") ? "repeating_spell-cantrip" : `repeating_spell-${lvl}`;

        const buttons = await Promise.all(ids.map(async (id) => {
            let spellName;
            try {
                spellName = await getSheetItem(characterId, `repeating_spell_${id}_spellname`);
            } catch (err) {
                Logger.error(`getSheetItem failed for ${characterId} repeating_spell_${id}_spellname: ${err}`);
                spellName = null;
            }
            const label = spellName || `Spell-${id}`;
            return `[ⓘ](~${idRef}|${prefix}_${id}_output) [${label}](~${idRef}|${prefix}_${id}_spell)`;
        }));

        return { lvl: Number(lvl), header, body: buttons.join("\n") };
    }));

    levelEntries.sort((a, b) => a.lvl - b.lvl);
    const sections = levelEntries.map(e => `${e.header}\n${e.body}`);

    const title = `${characterName} Spells`;
    const template = `&{template:default} {{name=${title}}}[[]{{=${sections.join("\n\n")}}}`;
    return `/w "@{selected|character_name}" ${template}`;
}

// Get Items for Category (with names) — per-item lookups fetched in parallel.
async function getItemsForCategory(characterId, category, meta) {
    if (!meta) return [];

    const ids = await getComputed(characterId, `reporder_${meta.section}`);
    if (!ids || !ids.length) return [];

    const sizeWords = ["tiny", "small", "medium", "large", "huge", "gargantuan"];

    const rows = await Promise.all(ids.map(async (id) => {
        let nameAttr = `${meta.macroPrefix}_${id}_name`;

        // Sheet quirk: repeating_attack rows use _atkname instead of _name.
        if (meta.macroPrefix === "repeating_attack") {
            nameAttr = `${meta.macroPrefix}_${id}_atkname`;
        }

        // Sheet quirk: repeating_trait rows use repeating_traits instead of _name.
        if (meta.macroPrefix === "repeating_trait") {
            nameAttr = `repeating_traits_${id}_name`;
        }

        try {
            const rawName = await getSheetItem(characterId, nameAttr);
            return { id, rawName };
        } catch (err) {
            Logger.error(`getSheetItem failed for ${characterId} ${nameAttr}: ${err}`);
            return { id, rawName: null };
        }
    }));

    const results = [];
    for (const { id, rawName } of rows) {
        if (!rawName) continue;

        const name = meta.namePrefix + rawName;

        // Skip if the name is *exactly* a size word.
        if (sizeWords.includes(name.trim().toLowerCase())) {
            continue;
        }

        results.push({ id, name });
    }
    return results;
}


// Generate Macro (Beacon engine)
function generateMacro(characterId, characterName, category, item, meta, useNames) {
    try {
        const idRef = useNames ? characterName : characterId;
        const macroString = `%{${idRef}|${meta.macroPrefix}_${item.id}_${meta.macroType}}`;
        return {
            name: item.name,
            macro: macroString
        };
    } catch (e) {
        Logger.error(`generateMacro failed for ${characterId} ${category} item ${item?.id}: ${e}`);
        return null;
    }
}

// Create Token Action — synchronous; called through Queue.add so bulk
// writes burn down across ticks instead of one long stretch. Shared
// by every engine, sheet-agnostic.
function createTokenAction(characterId, actionName, macroString) {
    if (!macroString) return;
    let ability = findObjs({
        _type: "ability",
        characterid: characterId,
        name: actionName
    })[0];
    if (ability) {
        ability.set({
            action: macroString,
            istokenaction: true
        });
    } else {
        ability = createObj("ability", {
            characterid: characterId,
            name: actionName,
            action: macroString,
            istokenaction: true
        });
    }
}

// Process Token (Beacon engine)
async function processBeaconToken(token, categories = [], useNames = false, userSpecified = false, sortMode = false) {
    const tokenObj = getObj("graphic", token._id);
    if (!tokenObj) return null;
    const characterId = tokenObj.get("represents");
    if (!characterId) return null;
    const charObj = getObj("character", characterId);
    const characterName = charObj ? charObj.get("name") : "Character";

    Timing.clear(characterId);
    const doneToken = Logger.time(`processBeaconToken total (${characterName})`, characterId, "Total");

    let npcAttrRaw = "";
    const doneNpc = Logger.time(`  npc attr fetch (${characterName})`, characterId, "npc attribute fetch");
    try {
        npcAttrRaw = await getSheetItem(characterId, "npc");
    } catch (err) {
        Logger.error(`getSheetItem failed for ${characterId} npc: ${err}`);
    }
    doneNpc();
    const normalized = String(npcAttrRaw ?? "").toLowerCase().trim();
    const isPc = (normalized === "off" || normalized === "0" || normalized === "false");
    const type = isPc ? "pc" : "npc";

    // checks/saves share one bonus fetch instead of each re-fetching it.
    let basicAbilityBonuses = null;

    for (let category of categories) {

        if (type === "pc" && category === "trait" && !userSpecified) {
            continue;
        }

        if (category === "spells") {
            const doneFetch = Logger.time(`  [${characterName}] spells fetch (levels + names)`, characterId, "spells fetch");
            const spells = await getSpells(characterId);
            let macro = null;
            if (Object.keys(spells).length > 0) {
                macro = await buildSpellsMacro(spells, characterName, characterId, useNames);
            }
            doneFetch();
            if (macro) {
                const doneWrite = Logger.time(`  [${characterName}] spells write`, characterId, "spells write");
                await Queue.add(() => createTokenAction(characterId, "Spells", macro));
                doneWrite();
            }
            continue;
        }

        if (category === "checks" || category === "saves" || category === "init") {
            // init doesn't use bonuses — no fetch needed.
            if (category !== "init" && !basicAbilityBonuses) {
                const doneBonusFetch = Logger.time(`  [${characterName}] ability/skill bonuses fetch (shared by checks/saves)`, characterId, "ability/skill bonuses fetch");
                basicAbilityBonuses = await fetchBasicAbilityBonuses(characterId);
                doneBonusFetch();
            }
            const doneBasic = Logger.time(`  [${characterName}] ${category} write`, characterId, `${category} write`);
            createBasicAbilities(characterId, category, basicAbilityBonuses);
            doneBasic();
            continue;
        }

        let metaForType = categoryMeta[category]?.[type];
        if (!metaForType) continue;

        // Sort mode: group plain NPC actions under "_A.", same idea
        // as the always-on _B./_R./_L_/_M_ prefixes the other NPC
        // categories carry (Roll20 alphabetizes by name on its own,
        // so this only clusters, it doesn't sort).
        if (sortMode && category === "action" && type === "npc") {
            metaForType = { ...metaForType, namePrefix: "_A." };
        }

        const doneCatFetch = Logger.time(`  [${characterName}] ${category} fetch`, characterId, `${category} fetch`);
        const items = await getItemsForCategory(characterId, category, metaForType);
        doneCatFetch();

        const doneCatWrite = Logger.time(`  [${characterName}] ${category} write (${items.length} items)`, characterId, `${category} write (${items.length} items)`);
        await Promise.all(items.map(async (item) => {
            const itemName = abbreviateName(item.name, `${characterId} ${category} ${item.id}`);
            const macro = generateMacro(characterId, characterName, category, {
                ...item,
                name: itemName
            }, metaForType, useNames);
            if (macro) {
                await Queue.add(() => createTokenAction(characterId, macro.name, macro.macro));
            }
        }));
        doneCatWrite();
    }

    // Completeness check — only for basics this run actually requested;
    // one local findObjs() lookup each, not a sheet-worker round trip.
    const basicAbilityNames = { checks: ".Check", saves: ".Save", init: ".Init" };
    const missingBasics = [];
    for (const cat of categories) {
        const abilityName = basicAbilityNames[cat];
        if (!abilityName) continue;
        const found = findObjs({
            _type: "ability",
            characterid: characterId,
            name: abilityName
        }).length > 0;
        if (!found) {
            missingBasics.push(abilityName);
            Logger.error(`${characterName}: ${abilityName} was requested but is missing after processing.`);
        }
    }

    const elapsedMs = doneToken();
    return { characterId, characterName, elapsedMs, missingBasics };
}


// Legacy 5E (ogl5e) engine — reads plain synchronous character
// attributes (no getSheetItem/getComputed, unlike Beacon).

// Synchronous attribute value lookup — used to compute the +/-
// shown in a dropdown option's label. Lowercases before looking up,
// matching how the 5e OGL sheet stores its attribute names.
function legacyAttrCurrent(characterId, attrName) {
    const attr = findObjs({
        _type: "attribute",
        _characterid: characterId,
        name: attrName.toLowerCase()
    })[0];
    return attr ? attr.get("current") : undefined;
}

function legacySignedBonus(characterId, attrName) {
    const bonus = parseInt(legacyAttrCurrent(characterId, attrName)) || 0;
    return { bonus, sign: bonus >= 0 ? "+" : "" };
}

// PF2 checks/saves — TAM used one identical giant roll-template
// string for both NPC and PC (verified byte-identical across all
// four places TAM defined it), so this is ported as one shared
// constant per macro rather than four copies.
const PF2_CHECK_MACRO = "@{selected|whispertype} &{template:rolls} {{limit_height=@{selected|roll_limit_height}}} {{charactername=@{selected|character_name}}} {{roll01_type=skill}} {{notes_show=@{selected|roll_show_notes}}}  {{subheader=^{skill}}} ?{Skill|Acrobatics,{{roll01=[[1d20cs20cf1 + (@{selected|acrobatics})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|acrobatics_notes}&#125;&#125;{{header=Acrobatics&#125;&#125;|Arcana,{{roll01=[[1d20cs20cf1 + (@{selected|arcana})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|arcana_notes}&#125;&#125;{{header=Arcana&#125;&#125; |Athletics,{{roll01=[[1d20cs20cf1 + (@{selected|athletics})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|athletics_notes}&#125;&#125;{{header=athletics&#125;&#125; |Crafting,{{roll01=[[1d20cs20cf1 + (@{selected|crafting})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|crafting_notes}&#125;&#125;{{header=crafting&#125;&#125; |Deception,{{roll01=[[1d20cs20cf1 + (@{selected|deception})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|deception_notes}&#125;&#125;{{header=deception&#125;&#125; |Diplomacy,{{roll01=[[1d20cs20cf1 + (@{selected|diplomacy})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|diplomacy_notes}&#125;&#125;{{header=diplomacy&#125;&#125; |Intimidation,{{roll01=[[1d20cs20cf1 + (@{selected|intimidation})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|intimidation_notes}&#125;&#125;{{header=intimidation&#125;&#125; |Medicine,{{roll01=[[1d20cs20cf1 + (@{selected|medicine})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|medicine_notes}&#125;&#125;{{header=medicine&#125;&#125; |Nature,{{roll01=[[1d20cs20cf1 + (@{selected|nature})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|nature_notes}&#125;&#125;{{header=nature&#125;&#125; |Occultism,{{roll01=[[1d20cs20cf1 + (@{selected|occultism})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|occultism_notes}&#125;&#125;{{header=occultism&#125;&#125; |Performance,{{roll01=[[1d20cs20cf1 + (@{selected|performance})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|performance_notes}&#125;&#125;{{header=performance&#125;&#125; |Religion,{{roll01=[[1d20cs20cf1 + (@{selected|religion})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|religion_notes}&#125;&#125;{{header=religion&#125;&#125; |Society,{{roll01=[[1d20cs20cf1 + (@{selected|society})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|society_notes}&#125;&#125;{{header=society&#125;&#125; |Stealth,{{roll01=[[1d20cs20cf1 + (@{selected|stealth})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|stealth_notes}&#125;&#125;{{header=stealth&#125;&#125; |Survival,{{roll01=[[1d20cs20cf1 + (@{selected|survival})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|survival_notes}&#125;&#125;{{header=survival&#125;&#125; |Thievery,{{roll01=[[1d20cs20cf1 + (@{selected|thievery})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{notes=@{selected|thievery_notes}&#125;&#125;{{header=thievery&#125;&#125; }";
const PF2_SAVE_MACRO = "@{selected|whispertype} &{template:rolls} {{limit_height=@{selected|roll_limit_height}}} {{charactername=@{selected|character_name}}} {{subheader=^{saving_throw}}} {{roll01_type=saving-throw}} {{notes_show=@{selected|roll_show_notes}}} {{notes=@{selected|saving_throws_notes}}} ?{Save|Fortitude,{{roll01=[[1d20cs20cf1 + (@{selected|saving_throws_fortitude})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{header=fortitude&#125;&#125;|Reflex,{{roll01=[[1d20cs20cf1 + (@{selected|saving_throws_reflex})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125;{{header=reflex&#125;&#125;|Will,{{roll01=[[1d20cs20cf1 + (@{selected|saving_throws_will})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}]]]&#125;&#125; {{header=will&#125;&#125;}";

// PF2 Check/Save dropdown option labels, with the character's live
// +/- modifier appended (matching Legacy 5E and Beacon). Only
// touches each option's LABEL text via targeted string replacement
// on PF2_CHECK_MACRO/PF2_SAVE_MACRO's "|Label," substrings — the
// roll-formula body is untouched.
const PF2_SKILL_ATTRS = {
    Acrobatics: "acrobatics", Arcana: "arcana", Athletics: "athletics",
    Crafting: "crafting", Deception: "deception", Diplomacy: "diplomacy",
    Intimidation: "intimidation", Medicine: "medicine", Nature: "nature",
    Occultism: "occultism", Performance: "performance", Religion: "religion",
    Society: "society", Stealth: "stealth", Survival: "survival", Thievery: "thievery"
};
const PF2_SAVE_ATTRS = {
    Fortitude: "saving_throws_fortitude", Reflex: "saving_throws_reflex", Will: "saving_throws_will"
};

function pf2InjectModifiers(macroTemplate, characterId, attrMap) {
    let macro = macroTemplate;
    for (const [label, attrName] of Object.entries(attrMap)) {
        const { bonus, sign } = legacySignedBonus(characterId, attrName);
        macro = macro.replace(`|${label},`, `|${label} ${sign}${bonus},`);
    }
    return macro;
}

function pf2CreateCheckMacro(characterId) {
    return pf2InjectModifiers(PF2_CHECK_MACRO, characterId, PF2_SKILL_ATTRS);
}

function pf2CreateSaveMacro(characterId) {
    return pf2InjectModifiers(PF2_SAVE_MACRO, characterId, PF2_SAVE_ATTRS);
}

// PF2 Init — lets a character use a skill other than Perception for
// initiative, since a fixed %{id|initiative} reference can't
// represent that. Used for both PC and NPC. Unlike Check/Save, each
// option's label embeds its attribute directly (e.g. "Perception
// @{perception}"), so it shows live values natively and stays
// current between !ta runs with no per-character API computation.
const PF2_INIT_MACRO = "@{selected|whispertype} &{template:rolls}{{limit_height=@{selected|roll_limit_height}}} {{charactername=@{selected|character_name}}} {{header=^{initiative}}} ?{Select Initiative skill|Perception @{selected|perception},{{subheader=perception&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|perception}[PERCEPTION]|Stealth @{selected|stealth},{{subheader=stealth&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|stealth}[STEALTH]|Deception @{selected|deception},{{subheader=deception&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|deception}[DECEPTION]|Diplomacy @{selected|diplomacy},{{subheader=diplomacy&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|diplomacy}[DIPLOMACY]|Acrobatics @{selected|acrobatics},{{subheader=acrobatics&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|acrobatics}[ACROBATICS]|Arcana @{selected|arcana},{{subheader=arcana&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|arcana}[ARCANA]|Athletics @{selected|athletics},{{subheader=athletics&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|athletics}[ATHLETICS]|Crafting @{selected|crafting},{{subheader=crafting&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|crafting}[CRAFTING]|Intimidation @{selected|intimidation},{{subheader=intimidation&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|intimidation}[INTIMIDATION]|Medicine @{selected|medicine},{{subheader=medicine&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|medicine}[MEDICINE]|Nature @{selected|nature},{{subheader=nature&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|nature}[NATURE]|Occultism @{selected|occultism},{{subheader=occultism&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|occultism}[OCCULTISM]|Performance @{selected|performance},{{subheader=performance&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|performance}[PERFORMANCE]|Religion @{selected|religion},{{subheader=religion&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|religion}[RELIGION]|Society @{selected|society},{{subheader=society&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|society}[SOCIETY]|Survival @{selected|survival},{{subheader=survival&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|survival}[SURVIVAL]|Thievery @{selected|thievery},{{subheader=thievery&#125;&#125; {{roll01=[[1d20cs20cf1 + (@{selected|thievery}[THIEVERY]}) + (@{selected|initiative_modifier})[@{selected|text_modifier}] + (@{selected|query_roll_bonus})[@{selected|text_bonus}] &{tracker}]]}} {{roll01_type=initiative}}&{noerror}";

// "Oosh function" — builds the single mega-macro Check/Save dropdown
// ability. Note: the Save template has a pre-existing missing
// semicolon after the second &#125; on the rname line — that's
// original to TAM, not a transcription error, left as-is.
function legacyCreateDropDown(checkType, characterId, npc = false, selectedMacro = false) {
    const skillLabels = ['Acrobatics', 'Animal Handling', 'Arcana', 'Athletics', 'Deception', 'History', 'Insight', 'Intimidation', 'Investigation', 'Medicine', 'Nature', 'Perception', 'Performance', 'Persuasion', 'Religion', 'Sleight Of Hand', 'Stealth', 'Survival'];
    const skillArray = skillLabels.map(a => a.replace(/\s/g, '_'));
    const abilityArray = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
    const npcSaveArray = abilityArray.map((ab) => ab.slice(0, 3).toUpperCase());
    let template = (npc) ? 'npc' : 'simple',
        npcPrefix = (npc) ? 'npc_' : '',
        pcSuffix = (npc) ? '' : '_bonus',
        npcName = (npc) ? '@{npc_name_flag}' : '',
        saveArray = (npc) ? npcSaveArray : abilityArray;

    if (checkType === 'check') { // Skills & Ability Checks
        let skillMacroArray = skillArray.map((sk, i) => {
            const { bonus, sign } = legacySignedBonus(characterId, `${npcPrefix}${sk}${pcSuffix}`);
            return `|${skillLabels[i]} ${sign}${bonus},+@{${npcPrefix}${sk}${pcSuffix}}@{pbd_safe}[${(skillLabels[i] + ' ').slice(0, skillLabels[i].indexOf(' '))}]]]&#125;&#125; {{rname=${skillLabels[i]}&#125;&#125; {{mod=@{${npcPrefix}${sk}${pcSuffix}}&#125;&#125; {{r1=[[@{d20} + @{${npcPrefix}${sk}${pcSuffix}}@{pbd_safe}[${(skillLabels[i] + ' ').slice(0, skillLabels[i].indexOf(' '))}]]]`;
        }),
            abilityMacroArray = abilityArray.map((ab, i) => {
                const { bonus, sign } = legacySignedBonus(characterId, `${ab}_mod`);
                return `|${ab} ${sign}${bonus},+@{${ab}_mod}@{jack_attr}[${npcSaveArray[i]}]]]&#125;&#125; {{rname=${ab}&#125;&#125; {{mod=@{${ab}_mod}@{jack_bonus}&#125;&#125; {{r1=[[ @{d20} + @{${ab}_mod}@{jack_attr}[${npcSaveArray[i]}]]]`;
            }),
            abilityMacro = `@{wtype}&{template:${template}} ${npcName} @{rtype}?{Ability${skillMacroArray.join('')}${abilityMacroArray.join('')}}}} {{global=@{global_skill_mod}}} {{type=Check}} {{typec=Check}} @{charname_output}`;
        return (selectedMacro) ? abilityMacro.replace(/@{/g, '@{selected|') : abilityMacro;
    }

    if (checkType === 'save') { // Saves
        let saveMacroArray = abilityArray.map((ab, i) => {
            const { bonus, sign } = legacySignedBonus(characterId, `${npcPrefix}${saveArray[i]}_save${pcSuffix}`);
            // Fixed pre-existing typo: original was missing the ";"
            // after the second &#125; on this line ("&#125;&#125 {{mod=").
            return `|${ab} ${sign}${bonus}, +@{${npcPrefix}${saveArray[i]}_save${pcSuffix}}@{pbd_safe}[${npcSaveArray[i]} SAVE]]]&#125;&#125; {{rname=${ab} Save&#125;&#125; {{mod=@{${ab}_save_bonus}&#125;&#125; {{r1=[[@{d20}+@{${npcPrefix}${saveArray[i]}_save${pcSuffix}}@{pbd_safe}[${npcSaveArray[i]} SAVE]]]`;
        }),
            saveMacro = `@{wtype}&{template:${template}} ${npcName} @{rtype}?{Saving Throw${saveMacroArray.join('')}}}} {{global=@{global_save_mod}}} {{type=Save}} {{typec=Save}} @{charname_output}`;
        return (selectedMacro) ? saveMacro.replace(/@{/g, '@{selected|') : saveMacro;
    }
}

// Legacy name abbreviation — TAM's own abbreviateName, separate
// from Beacon's (different regex set, no space-to-hyphen
// collapse needed on the legacy sheet). Ported verbatim.
function legacyAbbreviateName(name) {
    name = name.replace(" (One-Handed)", "-1H");
    name = name.replace(" (Two-Handed)", "-2H");
    name = name.replace(" (Melee; One-Handed)", "-1Hm");
    name = name.replace(" (Melee; Two-Handed)", "-2Hm");
    name = name.replace(" (Psionics)", "(Psi)");
    name = name.replace(" (Melee)", "-m");
    name = name.replace(" (Ranged)", "-r");
    name = name.replace("swarm has more than half HP", "HP>Half");
    name = name.replace("swarm has half HP or less", "HP<=Half");
    name = name.replace(/\s\(Recharge(.*)Short or Long Rest\)/, "-(R Short/Long)");
    name = name.replace(/\s\(Recharge(.*)Short Rest\)/, "-(R Short)");
    name = name.replace(/\s\(Recharge(?=.*Long Rest)(?:(?!Short).)*\)/, "-(R Long)");
    name = name.replace(/\sVariant\)/, ')');
    name = name.replace(/\s\(Recharge\s(.*)\)/, '-(R$1)');
    name = name.replace(/\s\(Costs\s(.*)\sActions\)/, '-($1a)');
    name = name.replace(/\s\(Costs\s(.*)\sActions\)/, '-($1a)');
    // PF2 (unused on this sheet, kept since TAM's abbreviateName
    // is shared across sheet types)
    name = name.replace(/<One Action>/i, '<1>');
    name = name.replace(/<Two Actions>/i, '<2>');
    name = name.replace(/<Three Actions>/i, '<3>');
    // Strip characters Roll20 won't run as a token action button
    // (see UNSUPPORTED_TOKEN_ACTION_CHARS above).
    name = name.replace(UNSUPPORTED_TOKEN_ACTION_CHARS, "");
    return name;
}

// Abbreviates a name to its words' first two characters each, used
// only for PF2's Attack2/Attack3 button names.
function legacyFirstCharacters(str) {
    const result = [];
    str.split(' ').forEach(word => {
        if (word.charAt(0) !== '') {
            result.push(word.charAt(0));
            result.push(word.charAt(1));
        }
    });
    return result.join('');
}

// Repeating-section token actions for the legacy sheet (reads plain
// attributes via filterObjs, unlike Beacon's async getSheetItem).
// sheetType ('5e' or 'pf2') gates the pf2-only branches below
// (action-cost suffix, -R ranged marker, Attack2/Attack3 split
// buttons); the Attack2/Attack3 split only happens on CREATE, never
// on update of an existing ability.
function createLegacyRepeating(characterId, characterName, attrPattern, macroPatternTemplate, useNames, sheetType = '5e', sortMode = false) {
    let repeatingAttrs = filterObjs(o =>
        o.get('type') === 'attribute' &&
        o.get('characterid') === characterId &&
        o.get('name').match(attrPattern)
    );

    // Sort mode: alphabetize by the attribute's current display
    // value. Only ever passed true for the categories sort actually
    // touches (NPC actions/legendary, PC attacks, NPC bonus
    // actions) — mythic, traits, and reactions are never sorted.
    if (sortMode) {
        repeatingAttrs = repeatingAttrs.slice().sort((a, b) => {
            const av = a.get('current'), bv = b.get('current');
            return av < bv ? -1 : av > bv ? 1 : 0;
        });
    }

    for (const attr of repeatingAttrs) {
        const repeatingId = attr.get('name').split('_')[2];

        let actionCost = "";
        if (attr.get('name').includes('repeating_actions-activities')) {
            actionCost = ' <' + getAttrByName(characterId, 'repeating_actions-activities_' + repeatingId + '_actions') + '>';
            actionCost = actionCost.replace(' <>', '');
        }

        let repeatingName = legacyAbbreviateName(attr.get('current').replace(/\.\s*$/, "") + actionCost);

        // Grouping prefixes, matching Beacon's family: legendary/
        // mythic always group ("_L_"/"_M_"); plain NPC actions/PC
        // attacks and bonus actions only group when sortMode is on.
        if (macroPatternTemplate.includes('npcaction-l')) {
            repeatingName = "_L_" + repeatingName;
        } else if (macroPatternTemplate.includes('npcaction-m')) {
            repeatingName = "_M_" + repeatingName;
        } else if (sortMode && macroPatternTemplate.includes('bonusaction')) {
            repeatingName = "_B." + repeatingName;
        } else if (sortMode) {
            repeatingName = "_A." + repeatingName;
        }
        if (sheetType === 'pf2' && macroPatternTemplate.includes('repeating_ranged-strikes')) {
            repeatingName = repeatingName + '-R';
        }

        const idRef = useNames ? characterName : characterId;
        const macroSuffix = macroPatternTemplate.replace(/%%RID%%/g, repeatingId);
        const repeatingAction = `%{${idRef}|${macroSuffix}}`;

        const existing = findObjs({ _type: 'ability', _characterid: characterId, name: repeatingName })[0];
        if (existing) {
            existing.set({ action: repeatingAction });
            continue;
        }

        createObj('ability', { name: repeatingName, action: repeatingAction, characterid: characterId, istokenaction: true });

        if (sheetType === 'pf2' && repeatingAction.includes('ATTACK-DAMAGE-NPC')) {
            createObj('ability', {
                name: legacyFirstCharacters(repeatingName) + (repeatingName.includes('-R') ? '-R2' : '2'),
                action: repeatingAction.replace('ATTACK-DAMAGE-NPC', 'ATTACK-DAMAGE-NPC2'),
                characterid: characterId, istokenaction: true
            });
            createObj('ability', {
                name: legacyFirstCharacters(repeatingName) + (repeatingName.includes('-R') ? '-R3' : '3'),
                action: repeatingAction.replace('ATTACK-DAMAGE-NPC', 'ATTACK-DAMAGE-NPC3'),
                characterid: characterId, istokenaction: true
            });
        }
        if (sheetType === 'pf2' && repeatingAction.includes('ATTACK-DAMAGE') && !repeatingAction.includes('ATTACK-DAMAGE-NPC')) {
            createObj('ability', {
                name: legacyFirstCharacters(repeatingName) + (repeatingName.includes('-R') ? '-R2' : '2'),
                action: repeatingAction.replace('ATTACK-DAMAGE', 'ATTACK-DAMAGE2'),
                characterid: characterId, istokenaction: true
            });
            createObj('ability', {
                name: legacyFirstCharacters(repeatingName) + (repeatingName.includes('-R') ? '-R3' : '3'),
                action: repeatingAction.replace('ATTACK-DAMAGE', 'ATTACK-DAMAGE3'),
                characterid: characterId, istokenaction: true
            });
        }
    }
}

// Legacy 5E spell chat menu — groups repeating_spell-N entries
// by level into a single "Spells" ability. Ported verbatim,
// including TAM's own attribute-matching regex as originally
// written.
function createLegacySpell(characterId) {
    const repeatingAttrs = filterObjs(o =>
        o.get('type') === 'attribute' &&
        o.get('characterid') === characterId &&
        o.get('name').match(/repeating_spell-[^{(np)][\S+_[^_]+_spellname\b/)
    );

    if (!repeatingAttrs[0]) {
        return;
    }

    const sb = {
        'Cantrips': [],
        '1st': [], '2nd': [], '3rd': [], '4th': [], '5th': [],
        '6th': [], '7th': [], '8th': [], '9th': []
    };

    for (const s of repeatingAttrs) {
        let level = s.get('name').split('_')[1].replace('spell-', '');
        const apiButton = "[" + s.get('current') + "](~repeating_spell-" + level + "_" + s.get('name').split('_')[2] + "_spell)";

        if (level === "1") level = "1st";
        else if (level === "2") level = "2nd";
        else if (level === "3") level = "3rd";
        else if (level === "4") level = "4th";
        else if (level === "5") level = "5th";
        else if (level === "6") level = "6th";
        else if (level === "7") level = "7th";
        else if (level === "8") level = "8th";
        else if (level === "9") level = "9th";
        else level = "Cantrips";

        sb[level].push(apiButton);
    }

    for (const key of Object.keys(sb)) {
        sb[key].sort();
    }

    const sk = Object.keys(sb).filter(k => sb[k].length > 0);

    let spellText = "";
    for (const e of sk) {
        spellText += "**" + e + ":**" + "\n" + sb[e].join(' | ') + "\n\n";
    }

    createTokenAction(characterId, "Spells", "/w @{character_name} &{template:atk} {{desc=" + spellText + "}}");
}

// PF2 spell chat menu — innate/focus/cantrips/normal spells (the
// last grouped by level), each rendered as clickable buttons.
// Ported from TAM's createPF2Spell.
function createLegacyPF2Spell(characterId) {
    const repeatingAttrs = filterObjs(o =>
        o.get('type') === 'attribute' && o.get('characterid') === characterId
    );

    const allSpellInnate = repeatingAttrs.filter(a => a.get('name').includes('repeating_spellinnate'));
    let allSpellInnateText = "";
    allSpellInnate.forEach(a => {
        if (a.get('name').includes('_name')) {
            allSpellInnateText += '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ')\n';
        }
    });
    if (allSpellInnateText) allSpellInnateText = '**Innate Spells**\n' + allSpellInnateText;

    const allSpellFocus = repeatingAttrs.filter(a => a.get('name').includes('repeating_spellfocus'));
    let allSpellFocusText = "";
    allSpellFocus.forEach(a => {
        if (a.get('name').includes('_name')) {
            allSpellFocusText += '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ')\n';
        }
    });
    if (allSpellFocusText) allSpellFocusText = '**Focus Spells**\n' + allSpellFocusText;

    const allCantrips = repeatingAttrs.filter(a => a.get('name').includes('repeating_cantrip'));
    let allCantripsText = "";
    allCantrips.forEach(a => {
        if (a.get('name').includes('_name')) {
            allCantripsText += '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ') ';
        }
    });
    if (allCantripsText) allCantripsText = '**Cantrips**\n' + allCantripsText + '\n';

    const allNormalSpells = repeatingAttrs.filter(a => a.get('name').includes('repeating_normalspells'));
    let allNormalSpellsText = "";
    let combinedLevelledSpellsText = "";
    let levelCounter = 1;

    while (levelCounter < 10) {
        const level = levelCounter.toString();
        let allLevelledSpellsText = "";
        allNormalSpells.forEach(a => {
            if (a.get('name').includes('_name')) {
                const spellLevel = getAttrByName(characterId, a.get('name').replace('name', 'current_level'));
                if (spellLevel === level) {
                    allLevelledSpellsText += '[' + a.get('current') + '](~selected|' + a.get('name').replace('_name', '_spellroll') + ') ';
                }
            }
        });
        if (allLevelledSpellsText) combinedLevelledSpellsText += '\nLevel ' + level + '\n' + allLevelledSpellsText;
        levelCounter++;
    }
    if (combinedLevelledSpellsText) allNormalSpellsText = '**Normal Spells**' + combinedLevelledSpellsText;

    const spellChatMenu = `/w "@{selected|character_name}" &{template:rolls} {{charactername=@{selected|character_name}}} {{header=Spells}} {{desc=${allSpellInnateText}${allSpellFocusText}${allCantripsText}${allNormalSpellsText}}}`;

    if (allSpellInnateText || allSpellFocusText || allCantripsText || allNormalSpellsText) {
        createTokenAction(characterId, "Spells", spellChatMenu);
    }
}

// Process Token (PF2 Official engine). "attacks" is melee+ranged
// strikes only — not a synonym for "actions"/"offensive" here, PF2
// keeps those as separate keywords. "offensive" is NPC-only; PC's
// equivalent is "action"/"actions" (a different sheet section).
// "reactive"/"interaction" are NPC-only. "trait" has no effect on
// this sheet.
function processPF2Token(token, categories = [], useNames = false, userSpecified = false) {
    const tokenObj = getObj("graphic", token._id);
    if (!tokenObj) return null;
    const characterId = tokenObj.get("represents");
    if (!characterId) return null;
    const charObj = getObj("character", characterId);
    const characterName = charObj ? charObj.get("name") : "Character";

    Timing.clear(characterId);
    const doneToken = Logger.time(`processPF2Token total (${characterName})`, characterId, "Total");

    // PF2's isNpc reads "sheet_type": missing attribute or current
    // === "character" both mean PC; anything else means NPC. (TAM's
    // original default-to-PC-when-missing, preserved.)
    const sheetTypeAttr = findObjs({ _type: "attribute", _characterid: characterId, name: "sheet_type" })[0];
    const isNpc = sheetTypeAttr ? sheetTypeAttr.get("current") !== "character" : false;
    const has = (cat) => categories.includes(cat);

    if (isNpc) {
        if (has("init")) {
            createTokenAction(characterId, ".Init", PF2_INIT_MACRO);
        }
        if (has("checks")) {
            createTokenAction(characterId, ".Check", pf2CreateCheckMacro(characterId));
        }
        if (has("saves")) {
            createTokenAction(characterId, ".Save", pf2CreateSaveMacro(characterId));
        }
        if (has("attacks")) {
            createLegacyRepeating(characterId, characterName, /repeating_melee-strikes_[^_]+_weapon\b/, 'repeating_melee-strikes_%%RID%%_ATTACK-DAMAGE-NPC', useNames, 'pf2');
            createLegacyRepeating(characterId, characterName, /repeating_ranged-strikes_[^_]+_weapon\b/, 'repeating_ranged-strikes_%%RID%%_ATTACK-DAMAGE-NPC', useNames, 'pf2');
        }
        if (has("offensive")) {
            createLegacyRepeating(characterId, characterName, /repeating_actions-activities_[^_]+_name\b/, 'repeating_actions-activities_%%RID%%_action-npc', useNames, 'pf2');
        }
        if (has("reactive")) {
            createLegacyRepeating(characterId, characterName, /repeating_free-actions-reactions_[^_]+_name\b/, 'repeating_free-actions-reactions_%%RID%%_action-npc', useNames, 'pf2');
        }
        if (has("interaction")) {
            createLegacyRepeating(characterId, characterName, /repeating_interaction-abilities_[^_]+_name\b/, 'repeating_interaction-abilities_%%RID%%_action-npc', useNames, 'pf2');
        }
        if (has("spells")) {
            createLegacyPF2Spell(characterId);
        }
    } else {
        if (has("init")) {
            createTokenAction(characterId, ".Init", PF2_INIT_MACRO);
        }
        if (has("checks")) {
            createTokenAction(characterId, ".Check", pf2CreateCheckMacro(characterId));
        }
        if (has("saves")) {
            createTokenAction(characterId, ".Save", pf2CreateSaveMacro(characterId));
        }
        if (has("attacks")) {
            createLegacyRepeating(characterId, characterName, /repeating_melee-strikes_[^_]+_weapon\b/, 'repeating_melee-strikes_%%RID%%_ATTACK-DAMAGE', useNames, 'pf2');
            createLegacyRepeating(characterId, characterName, /repeating_ranged-strikes_[^_]+_weapon\b/, 'repeating_ranged-strikes_%%RID%%_ATTACK-DAMAGE', useNames, 'pf2');
        }
        if (has("action")) {
            createLegacyRepeating(characterId, characterName, /repeating_actions_[^_]+_name\b/, 'repeating_actions_%%RID%%_action', useNames, 'pf2');
        }
        if (has("spells")) {
            createLegacyPF2Spell(characterId);
        }
    }

    const elapsedMs = doneToken();
    return { characterId, characterName, elapsedMs, missingBasics: [] };
}

// Process Token (Legacy 5E engine). "attacks" and "action" are
// synonyms here — Beacon's finer-grained "legendary"/"mythic"
// keywords have no independent effect on this sheet, they're
// absorbed into "attacks". No completeness check (unlike Beacon) —
// every write here is synchronous, so nothing can silently fail.
function processLegacy5eToken(token, categories = [], useNames = false, userSpecified = false, sortMode = false) {
    const tokenObj = getObj("graphic", token._id);
    if (!tokenObj) return null;
    const characterId = tokenObj.get("represents");
    if (!characterId) return null;
    const charObj = getObj("character", characterId);
    const characterName = charObj ? charObj.get("name") : "Character";

    Timing.clear(characterId);
    const doneToken = Logger.time(`processLegacy5eToken total (${characterName})`, characterId, "Total");

    const npcAttr = findObjs({ _type: "attribute", _characterid: characterId, name: "npc" })[0];
    const isNpc = npcAttr ? parseInt(npcAttr.get("current")) === 1 : false;
    const has = (cat) => categories.includes(cat);

    if (isNpc) {
        if (has("init")) {
            const idRef = useNames ? characterName : characterId;
            createTokenAction(characterId, ".Init", `%{${idRef}|npc_init}`);
        }
        if (has("checks")) {
            createTokenAction(characterId, ".Check", legacyCreateDropDown('check', characterId, true));
        }
        if (has("saves")) {
            createTokenAction(characterId, ".Save", legacyCreateDropDown('save', characterId, true));
        }
        if (has("attacks") || has("action")) {
            createLegacyRepeating(characterId, characterName, /repeating_npcaction_[^_]+_name\b/, 'repeating_npcaction_%%RID%%_npc_action', useNames, '5e', sortMode);
            createLegacyRepeating(characterId, characterName, /repeating_npcaction-l_[^_]+_name\b/, 'repeating_npcaction-l_%%RID%%_npc_action', useNames, '5e', sortMode);
            // Mythic is never sorted — always unsorted here.
            createLegacyRepeating(characterId, characterName, /repeating_npcaction-m_[^_]+_name\b/, 'repeating_npcaction-m_%%RID%%_npc_action', useNames);
        }
        if (has("bonus")) {
            createLegacyRepeating(characterId, characterName, /repeating_npcbonusaction_[^_]+_name\b/, 'repeating_npcbonusaction_%%RID%%_npc_action', useNames, '5e', sortMode);
        }
        if (has("trait")) {
            createLegacyRepeating(characterId, characterName, /repeating_npctrait_[^_]+_name\b/, 'repeating_npctrait_%%RID%%_npc_roll_output', useNames);
        }
        if (has("reaction")) {
            createLegacyRepeating(characterId, characterName, /repeating_npcreaction_[^_]+_name\b/, 'repeating_npcreaction_%%RID%%_npc_roll_output', useNames);
        }
        if (has("spells")) {
            createLegacySpell(characterId);
        }
    } else {
        if (has("init")) {
            const idRef = useNames ? characterName : characterId;
            createTokenAction(characterId, ".Init", `%{${idRef}|initiative}`);
        }
        if (has("checks")) {
            createTokenAction(characterId, ".Check", legacyCreateDropDown('check', characterId, false));
        }
        if (has("saves")) {
            createTokenAction(characterId, ".Save", legacyCreateDropDown('save', characterId, false));
        }
        if (has("attacks") || has("action")) {
            createLegacyRepeating(characterId, characterName, /repeating_attack_[^_]+_atkname\b/, 'repeating_attack_%%RID%%_attack', useNames, '5e', sortMode);
        }
        // Trait buttons skipped for PCs by default (Builder's
        // rule, not TAM's — TAM's own default included them
        // unconditionally; harmonized since the whole script now
        // shares one command grammar).
        if (has("trait") && userSpecified) {
            createLegacyRepeating(characterId, characterName, /repeating_traits_[^_]+_name\b/, 'repeating_traits_%%RID%%_output', useNames);
        }
        if (has("spells")) {
            createLegacySpell(characterId);
        }
    }

    const elapsedMs = doneToken();
    return { characterId, characterName, elapsedMs, missingBasics: [] };
}


// Common macros for checks, skills and initiative (Beacon engine)

const basicAbilityAttrs = [
    "strength_bonus", "dexterity_bonus", "constitution_bonus",
    "intelligence_bonus", "wisdom_bonus", "charisma_bonus"
];
const basicSkillAttrs = [
    "acrobatics_bonus", "animal_handling_bonus", "arcana_bonus", "athletics_bonus",
    "deception_bonus", "history_bonus", "insight_bonus", "intimidation_bonus",
    "investigation_bonus", "medicine_bonus", "nature_bonus", "perception_bonus",
    "performance_bonus", "persuasion_bonus", "religion_bonus",
    "sleight_of_hand_bonus", "stealth_bonus", "survival_bonus"
];

// Shared by "saves" and "checks" so a token needing both only pays this
// fetch once; "init" never calls this.
async function fetchBasicAbilityBonuses(characterId) {
    const allAttrs = [...basicAbilityAttrs, ...basicSkillAttrs];

    const values = await Promise.all(
        allAttrs.map(attr =>
            getSheetItem(characterId, attr).catch((err) => {
                Logger.error(`getSheetItem failed for ${characterId} ${attr}: ${err}`);
                return 0;
            })
        )
    );

    const bonuses = {};
    allAttrs.forEach((attr, i) => {
        bonuses[attr] = parseInt(values[i]) || 0;
    });
    return bonuses;
}

function formatBasicAbilityOption(label, attr, bonus) {
    const sign = bonus >= 0 ? "+" : "";
    return `| ${label} ${sign}${bonus}, %{selected&#124;${attr}&#125;`;
}

function createBasicAbilities(characterId, which, bonuses) {
    if (which === "init") {
        createTokenAction(characterId, ".Init", "%{selected|initiative}");
        return;
    }

    if (which === "saves") {
        const saveOptionsRaw = [
            ["Strength", "npc_strength_save", bonuses.strength_bonus],
            ["Dexterity", "npc_dexterity_save", bonuses.dexterity_bonus],
            ["Constitution", "npc_constitution_save", bonuses.constitution_bonus],
            ["Intelligence", "npc_intelligence_save", bonuses.intelligence_bonus],
            ["Wisdom", "npc_wisdom_save", bonuses.wisdom_bonus],
            ["Charisma", "npc_charisma_save", bonuses.charisma_bonus]
        ];

        const saveOptions = saveOptionsRaw.map(([label, attr, bonus]) => formatBasicAbilityOption(label, attr, bonus));
        if (saveOptions.length) {
            saveOptions[saveOptions.length - 1] = saveOptions[saveOptions.length - 1].replace(/&#125;$/, "&#125;}");
        }
        const saveAction = `?{Saving Throw?\n${saveOptions.join("\n")}`;
        createTokenAction(characterId, ".Save", saveAction);
        return;
    }

    if (which === "checks") {
        const checkOptions = [];

        for (let [label, attr] of [
                ["Strength", "strength"],
                ["Dexterity", "dexterity"],
                ["Constitution", "constitution"],
                ["Intelligence", "intelligence"],
                ["Wisdom", "wisdom"],
                ["Charisma", "charisma"]
            ]) {
            checkOptions.push(formatBasicAbilityOption(label, attr, bonuses[`${attr}_bonus`] || 0));
        }

        for (let skill of basicSkillAttrs) {
            const bonus = bonuses[skill] || 0;
            const cleanName = skill.replace("_bonus", "").replace(/_/g, " ");
            const baseName = skill.replace("_bonus", "");
            const labelName = cleanName.replace(/\b\w/g, c => c.toUpperCase());
            checkOptions.push(formatBasicAbilityOption(labelName, baseName, bonus));
        }

        if (checkOptions.length) {
            checkOptions[checkOptions.length - 1] = checkOptions[checkOptions.length - 1].replace(/&#125;$/, "&#125;}");
        }
        const checkAction = `?{Check?\n${checkOptions.join("\n")}`;
        createTokenAction(characterId, ".Check", checkAction);
        return;
    }
}


// Delete Token Actions — sheet-agnostic. Works for any character
// regardless of detected sheet type, since deletion only depends on
// the istokenaction flag, never on which engine wrote the ability.
async function deleteTokenActions(selectedTokens, protectPeriodEnding = true) {
    if (!selectedTokens || selectedTokens.length === 0) return;
    for (let token of selectedTokens) {
        const tokenObj = getObj("graphic", token._id);
        if (!tokenObj) continue;
        const characterId = tokenObj.get("represents");
        if (!characterId) continue;
        const abilities = findObjs({
            _type: "ability",
            characterid: characterId
        }).filter(a => a.get("istokenaction"));
        for (let ab of abilities) {
            const name = ab.get("name");
            if (protectPeriodEnding && name.endsWith(".")) continue;
            ab.remove();
        }
    }
}

// Queue (burndown) — async-aware; Queue.add resolves once the job
// runs. Jobs run one per tick (setTimeout 0) so bulk writes don't hold
// the sandbox in one long synchronous stretch.
const Queue = (() => {
    let queue = [];
    let active = false;

    const process = () => {
        if (!queue.length) {
            active = false;
            return;
        }

        active = true;

        const { job, resolve, reject } = queue.shift();
        try {
            resolve(job());
        } catch (err) {
            Logger.error(err);
            reject(err);
        }

        setTimeout(process, 0);
    };

    return {
        add: (job) => new Promise((resolve, reject) => {
            queue.push({ job, resolve, reject });
            if (!active) process();
        })
    };
})();

// Commands (single root: !ta, plus recognized legacy bare commands)
const Commands = {

    root: async (msg) => {
        const cmd = msg.content.trim();

        // Help — one common page, plus a per-sheet page reached via
        // chat-menu buttons.
        if (cmd === "!ta help") {
            const sheetLinks = Object.keys(SHEET_LABELS)
                .map(key => Output.button(SHEET_LABELS[key], `!ta help ${key}`))
                .join("");
            Output.whisper(msg, "Token Action Maker Help", ta_HELP_MAIN.replace("{{SHEET_LINKS}}", sheetLinks));
            return;
        }
        if (cmd === "!ta help beacon" || cmd === "!ta help legacy5e" || cmd === "!ta help pf2") {
            const sheetKey = cmd.slice("!ta help ".length);
            Output.whisper(msg, SHEET_LABELS[sheetKey], ta_HELP_SHEET[sheetKey]);
            return;
        }

        // Timing breakdown (clicked from the report; needs no selection)
        if (cmd.startsWith("!ta timings ")) {
            const timingCharacterId = cmd.slice("!ta timings ".length).trim();
            const charObj = getObj("character", timingCharacterId);
            const characterName = charObj ? charObj.get("name") : timingCharacterId;
            const entries = Timing.get(timingCharacterId);
            if (!entries || !entries.length) {
                Output.whisper(msg, "Timing Breakdown", `No timing data cached for ${characterName}. This only lives in memory for the current session (cleared on sandbox restart) — re-run !ta on this token to regenerate it.`);
                return;
            }
            const lines = entries.map(e => `${e.label}: ${(e.ms / 1000).toFixed(2)}s`);
            Output.whisper(msg, `Timing Breakdown — ${characterName}`, lines.join("<br>"));
            return;
        }

        // Validate token selection
        if (!msg.selected || msg.selected.length === 0) {
            Output.whisper(msg, "Error", "No tokens selected!");
            return;
        }

        // Classify every selected token by detected sheet type
        const classified = [];
        for (let token of msg.selected) {
            const tokenObj = getObj("graphic", token._id);
            if (!tokenObj) continue;
            const characterId = tokenObj.get("represents");
            if (!characterId) continue;
            const sheetType = sheetDetect.detect(characterId);
            classified.push({ token, tokenObj, characterId, sheetType });
        }

        if (!classified.length) {
            Output.whisper(msg, "Error", "None of the selected tokens are linked to a character.");
            return;
        }

        // Delete token actions (protected by period) — any recognized sheet
        if (cmd === "!ta delete" || cmd === "!deleteta") {
            const targets = classified.map(c => c.token);
            const deletedTokens = classified.map(c => c.tokenObj.get("name") || "Unknown");
            await deleteTokenActions(targets, true);
            Output.whisper(msg, "Token Actions Deleted", `Token actions deleted (except protected macros whose name ends in a period) for <br>${deletedTokens.join(" <br> ")}.`);
            return;
        }

        // Ask for confirmation before deleting all token actions
        if (cmd === "!ta deleteall" || cmd === "!deleteallta") {
            const buttonMessage = `Are you sure you wish to delete ALL token actions on the selected characters? This cannot be undone.<br>${Output.link("Delete ALL", "!ta deleteallconfirmed")} | ${Output.link("Cancel", "!ta cancel")}`;
            Output.whisper(msg, "Confirmation Required", buttonMessage);
            return;
        }

        // Delete all token actions after confirmation
        if (cmd === "!ta deleteallconfirmed") {
            const targets = classified.map(c => c.token);
            const deletedTokens = classified.map(c => c.tokenObj.get("name") || "Unknown");
            await deleteTokenActions(targets, false);
            Output.whisper(msg, "All Token Actions Deleted", `All token actions deleted for:<br>${deletedTokens.join("<br>")}.`);
            return;
        }

        // Cancel deletion
        if (cmd === "!ta cancel") {
            Output.whisper(msg, "Deletion Canceled", "No token actions were deleted.");
            return;
        }

        // Validate keywords before proceeding ("pf2" is accepted but
        // ignored, same as "name"/"names")
        const args = cmd.split(/\s+/).slice(1);
        const validKeywords = Object.keys(keywordAliases);

        const invalid = args.filter(arg => {
            const lc = arg.toLowerCase();
            return !validKeywords.includes(lc) && lc !== "name" && lc !== "names" && lc !== "pf2" && lc !== "sort" && lc !== "sorted";
        });

        if (invalid.length > 0) {
            Output.whisper(
                msg,
                "Invalid Command",
                `One or more keywords used in the last command were invalid: ${invalid.map(x => `<code>${x}</code>`).join(", ")} <br>Type <code>!ta help</code> for a list of valid keywords.`
            );
            return;
        }

        // Standard !ta command to create token actions
        const parsed = parseTaCommand(msg.content);
        const categories = parsed.categories || [];
        const useNames = !!parsed.useNames;
        const userSpecified = !!parsed.userSpecified;
        const sortMode = !!parsed.sortMode;
        const sortedSuffix = sortMode ? " (sorted)" : "";

        // Priority order: fast sheets (Legacy 5E, PF2, synchronous)
        // and unrecognized sheets run first; Beacon (slow,
        // sheet-worker bound) runs last.
        const FAST_FIRST = { legacy5e: 0, pf2: 0, beacon: 1 };
        const ordered = classified.slice().sort((a, b) => {
            const orderA = a.sheetType === null ? 0 : (FAST_FIRST[a.sheetType] ?? 0);
            const orderB = b.sheetType === null ? 0 : (FAST_FIRST[b.sheetType] ?? 0);
            return orderA - orderB;
        });

        const sandboxOk = isExperimentalSandbox();

        const total = ordered.length;
        Output.whisperLine(msg, `Processing ${total} character${total === 1 ? "" : "s"}...`);

        const doneRun = Logger.time(`!ta run TOTAL (${total} token(s), categories: ${categories.join(",")})`);

        let failedCount = 0;
        let position = 0;
        for (const entry of ordered) {
            position++;

            const { token, tokenObj, characterId, sheetType } = entry;
            const tokenName = tokenObj?.get("name") || "Unknown";

            let ok = true;
            let statusText;

            if (sheetType === "beacon") {
                if (!sandboxOk) {
                    ok = false;
                    statusText = `${tokenName} — SKIPPED: Beacon sheets require the EXPERIMENTAL (1.5) sandbox. Please switch sandboxes on your mods page.`;
                } else {
                    let elapsedMs = null;
                    let resultCharacterId = characterId;
                    let errorText = null;
                    let missingBasics = [];

                    try {
                        const result = await processBeaconToken(token, categories, useNames, userSpecified, sortMode);
                        resultCharacterId = result?.characterId || characterId;
                        elapsedMs = result?.elapsedMs ?? null;
                        missingBasics = result?.missingBasics || [];
                    } catch (err) {
                        ok = false;
                        errorText = String(err);
                        Logger.error(`ERROR processing token "${tokenName}": ${err}`);
                    }

                    const seconds = typeof elapsedMs === "number" ? ` (${(elapsedMs / 1000).toFixed(1)}s)` : "";
                    const nameLabel = resultCharacterId
                        ? Output.link(`${tokenName}${seconds}`, `!ta timings ${resultCharacterId}`)
                        : `${tokenName}${seconds}`;
                    statusText = ok
                        ? (missingBasics.length ? `${nameLabel}${sortedSuffix} — missing: ${missingBasics.join(", ")}` : `${nameLabel}${sortedSuffix}`)
                        : `${nameLabel} — FAILED: ${errorText}`;
                }
            } else if (sheetType === "legacy5e") {
                let errorText = null;
                try {
                    processLegacy5eToken(token, categories, useNames, userSpecified, sortMode);
                } catch (err) {
                    ok = false;
                    errorText = String(err);
                    Logger.error(`ERROR processing token "${tokenName}": ${err}`);
                }
                statusText = ok
                    ? `${tokenName} — ${SHEET_LABELS.legacy5e}${sortedSuffix}`
                    : `${tokenName} — FAILED: ${errorText}`;
            } else if (sheetType === "pf2") {
                // Sort mode never touches PF2 processing — output
                // stays identical to plain !ta pf2, with just a
                // warning whispered alongside it.
                let errorText = null;
                try {
                    processPF2Token(token, categories, useNames, userSpecified);
                } catch (err) {
                    ok = false;
                    errorText = String(err);
                    Logger.error(`ERROR processing token "${tokenName}": ${err}`);
                }
                statusText = ok
                    ? `${tokenName} — ${SHEET_LABELS.pf2}${sortMode ? " (sort not applied)" : ""}`
                    : `${tokenName} — FAILED: ${errorText}`;
                if (sortMode && ok) {
                    Output.whisperLine(msg, `<b>Note:</b> Using sort for Pathfinder characters is not recommended — alphabetization destroys the logical order of the Attack-Attack2-Attack3 progression. Unsorted PF2 token actions were created instead for ${tokenName}.`);
                }
            } else {
                ok = false;
                statusText = `${tokenName} — SKIPPED: sheet not recognized (supported: ${Object.values(SHEET_LABELS).join(", ")}).`;
            }

            if (!ok) failedCount++;

            Output.whisperLine(msg, `${position} of ${total}: ${statusText}`, "character");
        }

        doneRun();

        const doneText = failedCount
            ? `Done — ${total} character${total === 1 ? "" : "s"} processed (${failedCount} skipped/failed).`
            : `Done — ${total} character${total === 1 ? "" : "s"} processed.`;
        Output.whisperLine(msg, doneText);
    }
};

// Input Handler / Event Registration — !ta is the primary command;
// the bare legacy TAM commands are still recognized (no arguments,
// matching how they always worked) so existing workflows don't break.
const LEGACY_BARE_COMMANDS = ["!deleteta", "!deleteallta", "!sortta"];

const handleInput = (msg) => {
    if (msg.type !== "api") return;
    const content = msg.content;
    const isTa = content === `!${commandName}` || content.startsWith(`!${commandName} `);
    const isLegacy = LEGACY_BARE_COMMANDS.includes(content);
    if (!isTa && !isLegacy) return;
    Commands.root(msg);
};

const registerEventHandlers = () => {
    on("chat:message", handleInput);
};

// Initialization
const checkInstall = () => {
    Logger.log(`-=> Token Action Maker v${version} loaded (development build — Beacon, Legacy 5E, and PF2 all live). Use !ta for token actions. Type !ta help for instructions.`);
    State.initialize();
    return true;
};

on('ready', () => {
    if (checkInstall()) {
        registerEventHandlers();
    }
});

return {};
})();