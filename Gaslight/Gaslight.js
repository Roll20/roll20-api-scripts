// =============================================================================
// Gaslight v2.3.0
// Last Updated: 2026-08-30
// Author: Kenan Millet
//
// Description:
//   Per-player map perception. Split players onto individual copies of a page
//   with tokens synchronized via Anchor and Mirror. Each player can see
//   different things while token movement stays consistent across all copies.
//   Commands auto-relay to all player pages transparently.
//
// Dependencies: Anchor, Mirror, SelectManager, RollCapture (optional)
//
// Commands:
//   !gaslight setup [group] [players...]        Quick-configure from duplicates (group name optional)
//   !gaslight quick [group] [players...]         Configure + split using copies/scratch pages
//   !gaslight split <group> [--force]           Activate a prepared group
//   !gaslight merge [group]                     End a split (top of stack, or named); nested-split aware
//   !gaslight merge-all                         End all active splits
//   !gaslight test <group>                      Dry-run linking resolution
//   !gaslight link [<name>|new] [ids...]        Set gaslight_link on tokens
//   !gaslight unlink [ids...|--group <g>]       Remove gaslight_link from tokens
//   !gaslight group <name> <player|GM>          Assign page to group
//   !gaslight ungroup <name> <player|--all>     Remove page from group
//   !gaslight stage [players...]                Propagate tokens to player pages
//   !gaslight sync [props|all|reset]            Manage sync per token
//   !gaslight desync [props|all]                Exclude props from sync
//   !gaslight var [--silent] [actions...]       Read/set/unset gl_ variables
//   !gaslight view [player|master|off]          Switch relay view target
//   !gaslight relay <views...> <!command>       Manually relay command to views
//   !gaslight config [relay-add|remove|list]    Configure auto-relay commands
//   !gaslight hud [on|off|reset] [element]      Toggle HUD elements
//   !gaslight eval [--dry-run] [--all|<name>]   Evaluate script pins
//   !gaslight status                            Show current state
//   !gaslight --help                            Command reference
// =============================================================================

/* global on, sendChat, getObj, findObjs, createObj, Campaign, playerIsGM, log, state, generateUUID, sendPing, setTimeout, _ */

var Gaslight = Gaslight || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Gaslight';
    const SCRIPT_VERSION = '2.3.0';
    const CMD            = '!gaslight';
    const CONFIG_HEADER  = '---GASLIGHT---';
    const LINK_KEY       = 'gaslight_link';
    const SCRATCH_NAME     = 'GL-SCRATCH';
    const ANCHOR_PROPS   = ['left', 'top', 'rotation', 'width', 'height', 'flipv', 'fliph'];

    // =========================================================================
    // Helpers
    // =========================================================================

    const stripGlsTag = (name) => {
        return (name || '').replace(/^\[GLS\]\s*/i, '').trim();
    };

    // Strip repeated Roll20 "Copy of " prefixes (added when duplicating pages).
    const stripCopyOf = (name) => {
        name = name || '';
        while (name.indexOf('Copy of ') === 0) name = name.slice(8);
        return name;
    };

    // True if a page is a scratch page — its name is GL-SCRATCH, possibly behind one
    // or more "Copy of " prefixes (duplicating a scratch page keeps it usable).
    const isScratchPageName = (name) => stripCopyOf(name || '') === SCRATCH_NAME;

    var relaying = new Set();
    var scripting = false;

    const relayKey = (content, sender, selectedIds) => content + '\x01' + sender + '\x01' + selectedIds.sort().join(',');

    // =========================================================================
    // Helpers
    // =========================================================================

    const getPlayerName = (playerid) => {
        if (!playerid || playerid === 'API') return 'gm';
        const player = getObj('player', playerid);
        return player ? player.get('_displayname') : 'gm';
    };

    const reply = (msg, tag, text) => {
        const body   = text !== undefined ? text : tag;
        const prefix = text !== undefined ? ` [${tag}]` : '';
        const recipient = getPlayerName(msg.playerid);
        sendChat(SCRIPT_NAME + prefix, '/w "' + recipient + '" ' + body);
    };

    const genId = () => {
        return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
    };

    const ensureState = () => {
        if (!state[SCRIPT_NAME]) {
            state[SCRIPT_NAME] = {
                activeGroups: {},
                config: { autoCommit: false, relayCommands: [] },
                view: 'master',
                hud: { view: true, initiative: true },
                pageStacks: {}
            };
        }
        // Per-player page history: { playerId: [ { group, pageId }, ... ] } (top = last).
        // Enables nested splits — merging a group returns each player to the most
        // recent group they're still in (or the banner page if none remain).
        if (!state[SCRIPT_NAME].pageStacks) state[SCRIPT_NAME].pageStacks = {};
        // Restore the push-sequence counter from persisted stacks so ordering
        // survives sandbox restarts.
        Object.keys(state[SCRIPT_NAME].pageStacks).forEach(function(pid) {
            (state[SCRIPT_NAME].pageStacks[pid] || []).forEach(function(e) {
                if (typeof e.seq === 'number' && e.seq > _pageStackSeq) _pageStackSeq = e.seq;
            });
        });
        if (!state[SCRIPT_NAME].config.relayCommands) state[SCRIPT_NAME].config.relayCommands = [];
        if (!state[SCRIPT_NAME].hud) state[SCRIPT_NAME].hud = { view: true, initiative: true, reticle: true };
        if (state[SCRIPT_NAME].hud.initiative === undefined) state[SCRIPT_NAME].hud.initiative = false;
        if (state[SCRIPT_NAME].hud.reticle === undefined) state[SCRIPT_NAME].hud.reticle = true;
        // Migration: v2.0.0 -> v2.1.0 — view null used to mean "relay to all", now null means "off"
        if (!state[SCRIPT_NAME].version || state[SCRIPT_NAME].version < '2.1.0') {
            if (state[SCRIPT_NAME].view === null) state[SCRIPT_NAME].view = 'master';
            state[SCRIPT_NAME].version = SCRIPT_VERSION;
        }
    };

    // =========================================================================
    // Per-player page stacks (nested split support)
    // =========================================================================

    // Push (or move to top) a player's entry for a group. Called on split/quick.
    // `seq` is a monotonic push-order stamp so `merge` can find the truly
    // most-recently-activated group regardless of differing player sets.
    var _pageStackSeq = 0;
    const pushPlayerPage = (playerId, group, pageId) => {
        var stacks = state[SCRIPT_NAME].pageStacks;
        var stack = stacks[playerId] || (stacks[playerId] = []);
        for (var i = stack.length - 1; i >= 0; i--) {
            if (stack[i].group === group) stack.splice(i, 1);
        }
        stack.push({ group: group, pageId: pageId, seq: ++_pageStackSeq });
    };

    // Remove a group's entry from every player's stack. Returns a map of
    // { playerId: newTopPageId|null } ONLY for players whose CURRENT (top) page
    // belonged to the removed group — i.e. players who need reassignment.
    const removeGroupFromStacks = (group) => {
        var stacks = state[SCRIPT_NAME].pageStacks;
        var reassign = {};
        Object.keys(stacks).forEach(function(playerId) {
            var stack = stacks[playerId];
            if (!stack || stack.length === 0) return;
            var wasTop = stack[stack.length - 1].group === group;
            for (var i = stack.length - 1; i >= 0; i--) {
                if (stack[i].group === group) stack.splice(i, 1);
            }
            if (wasTop) {
                reassign[playerId] = stack.length > 0 ? stack[stack.length - 1].pageId : null;
            }
            if (stack.length === 0) delete stacks[playerId];
        });
        return reassign;
    };

    // The most-recently-activated group still present in any stack — used by
    // `merge` (no arg) to decide which group to pop. Uses the highest push seq.
    const topStackGroup = () => {
        var stacks = state[SCRIPT_NAME].pageStacks;
        var best = null, bestSeq = -1;
        Object.keys(stacks).forEach(function(playerId) {
            var stack = stacks[playerId];
            if (!stack) return;
            stack.forEach(function(entry) {
                if (entry.seq > bestSeq) { bestSeq = entry.seq; best = entry.group; }
            });
        });
        return best;
    };

    // Resolve the optional leading group-name argument shared by setup/quick.
    // If the first arg isn't a flag and does NOT resolve to a player, it's the
    // group name (shifted off args). Otherwise a readable, collision-free name is
    // generated via ScriptKit (falling back to a genId-based name). Mutates args.
    const resolveGroupName = (args) => {
        var groupName = null;
        if (args.length > 0 && args[0].indexOf('--') !== 0 && !findPlayerByNameOrId(args[0])) {
            groupName = args.shift();
        }
        if (groupName) return groupName;
        var groupExists = function(name) {
            return !!state[SCRIPT_NAME].activeGroups[name] || !!discoverGroup(name).master;
        };
        if (typeof ScriptKit !== 'undefined' && ScriptKit.randomName) {
            return ScriptKit.randomName(SCRIPT_NAME, function(base) {
                var count = 0;
                while (groupExists(count === 0 ? base : base + '-' + (count + 1))) count++;
                return count;
            });
        }
        return 'group-' + genId();
    };

    // =========================================================================
    // Config Storage — GM layer text objects
    // =========================================================================

    const getConfigsOnPage = (pageId) => {
        const texts = findObjs({ _type: 'text', _pageid: pageId, layer: 'gmlayer' });
        const configs = [];
        texts.forEach(t => {
            const content = t.get('text') || '';
            if (!content.startsWith(CONFIG_HEADER)) return;
            const data = parseConfig(content);
            if (data) configs.push({ obj: t, data: data });
        });
        return configs;
    };

    const getGroupConfigOnPage = (pageId, groupName) => {
        return getConfigsOnPage(pageId).find(c => c.data.group === groupName);
    };

    const parseConfig = (text) => {
        const lines = text.split('\n').filter(l => l.trim() && l.trim() !== CONFIG_HEADER);
        const data = {};
        lines.forEach(line => {
            const idx = line.indexOf(':');
            if (idx === -1) return;
            data[line.slice(0, idx).trim().toLowerCase()] = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        });
        return data.group ? data : null;
    };

    const serializeConfig = (data) => {
        let text = CONFIG_HEADER + '\n';
        Object.entries(data).forEach(([key, val]) => {
            if (val !== undefined && val !== '') text += key + ': ' + val + '\n';
        });
        return text.trim();
    };

    const setConfigOnPage = (pageId, groupName, data) => {
        const existing = getGroupConfigOnPage(pageId, groupName);
        const fullData = Object.assign({ group: groupName }, data);
        const text = serializeConfig(fullData);
        if (existing) {
            existing.obj.set('text', text);
        } else {
            createObj('text', {
                pageid: pageId,
                layer: 'gmlayer',
                text: text,
                left: 70,
                top: 70,
                font_size: 26,
                font_family: 'Arial',
                color: '#FFA500'
            });
        }
    };

    // =========================================================================
    // Group Discovery
    // =========================================================================

    const discoverGroup = (groupName) => {
        const pages = findObjs({ _type: 'page' });
        const result = { master: null, players: {} }; // players keyed by playerid → { pageId, name }
        pages.forEach(page => {
            const cfg = getGroupConfigOnPage(page.get('_id'), groupName);
            if (!cfg) return;
            if (cfg.data.player === 'GM') result.master = page.get('_id');
            else if (cfg.data.playerid) {
                result.players[cfg.data.playerid] = { pageId: page.get('_id'), name: cfg.data.player };
            }
        });
        return result;
    };

    // =========================================================================
    // Page Resolution
    // =========================================================================

    const resolvePageId = (msg, args) => {
        // Check for --page argument
        const pageIdx = args.indexOf('--page');
        if (pageIdx !== -1 && args[pageIdx + 1]) {
            const pageName = args.splice(pageIdx, 2)[1];
            const page = findObjs({ _type: 'page', name: pageName })[0];
            if (page) return page.get('_id');
        }
        // Fall back to selected token's page
        if (msg.selected && msg.selected.length > 0) {
            const obj = getObj(msg.selected[0]._type, msg.selected[0]._id);
            if (obj) return obj.get('_pageid');
        }
        // Last resort: player page
        return Campaign().get('playerpageid');
    };

    // =========================================================================
    // Party Detection
    // =========================================================================

    const getPartyTokens = (msg, masterPageId) => {
        if (msg.selected && msg.selected.length > 0) {
            return msg.selected.map(s => getObj(s._type, s._id)).filter(Boolean);
        }
        const characters = findObjs({ _type: 'character' });
        const partyChars = characters.filter(c => {
            const tags = c.get('tags') || '';
            return tags.toLowerCase().includes('party');
        });
        if (partyChars.length > 0) {
            const tokens = [];
            partyChars.forEach(c => {
                const t = findObjs({ _type: 'graphic', represents: c.get('_id'), _pageid: masterPageId, _subtype: 'token' });
                tokens.push.apply(tokens, t);
            });
            return tokens.length > 0 ? tokens : null;
        }
        return null;
    };

    // =========================================================================
    // Player Resolution
    // =========================================================================

    const GM_ALIASES = ['gm', 'master'];

    /**
     * Resolve a player arg to { id, name } or null.
     * If ambiguous, whispers disambiguation buttons and returns 'ambiguous'.
     * If GM alias, returns { id: 'GM', name: 'GM' }.
     */
    const resolvePlayer = (msg, playerArg, cmdPrefix) => {
        if (GM_ALIASES.indexOf(playerArg.toLowerCase()) !== -1) {
            return { id: 'GM', name: 'GM' };
        }

        // Check if it's a player ID directly (starts with -)
        if (playerArg.startsWith('-')) {
            var byId = getObj('player', playerArg);
            if (byId) return { id: byId.get('_id'), name: byId.get('_displayname') };
            reply(msg, 'Error', 'No player found with ID: ' + playerArg);
            return null;
        }

        // Search by display name
        var players = findObjs({ _type: 'player' });
        var matches = players.filter(function(p) {
            return p.get('_displayname').toLowerCase() === playerArg.toLowerCase();
        });

        // Deduplicate by player ID (Roll20 can return duplicate player objects)
        var uniqueById = {};
        matches.forEach(function(p) { uniqueById[p.get('_id')] = p; });
        matches = Object.values(uniqueById);

        if (matches.length === 1) {
            return { id: matches[0].get('_id'), name: matches[0].get('_displayname') };
        }
        if (matches.length === 0) {
            reply(msg, 'Error', 'No player found named "' + playerArg + '".');
            return null;
        }

        // Ambiguous — show disambiguation buttons
        var out = 'Multiple players named "' + playerArg + '":<br>';
        matches.forEach(function(p) {
            var chars = findObjs({ _type: 'character' }).filter(function(c) {
                return (c.get('controlledby') || '').indexOf(p.get('_id')) !== -1;
            });
            var charNames = chars.map(function(c) { return c.get('name'); }).join(', ') || 'no characters';
            out += '[' + p.get('_displayname') + ' (' + charNames + ')](' + cmdPrefix + ' ' + p.get('_id') + ')<br>';
        });
        reply(msg, 'Disambiguate', out);
        return 'ambiguous';
    };

    /**
     * Find a player by name or ID (no disambiguation, used internally).
     */
    const findPlayerByNameOrId = (nameOrId) => {
        if (nameOrId === 'GM') return null;
        if (nameOrId.startsWith('-')) return getObj('player', nameOrId);
        var players = findObjs({ _type: 'player' });
        return players.find(function(p) { return p.get('_displayname').toLowerCase() === nameOrId.toLowerCase(); });
    };

    // =========================================================================
    // Token GM Notes — gaslight_link
    // =========================================================================

    const getLinkId = (token) => {
        var notes = token.get('gmnotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) { /* already decoded */ }
        notes = notes.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
        const match = notes.match(/gaslight_link:\s*(\S+)/);
        return match ? match[1].trim() : null;
    };

    const setLinkId = (token, linkId) => {
        var notes = token.get('gmnotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}
        if (notes.match(/gaslight_link:\s*.+/)) {
            notes = notes.replace(/gaslight_link:\s*.+/, LINK_KEY + ': ' + linkId);
        } else {
            notes = (notes ? notes + '\n' : '') + LINK_KEY + ': ' + linkId;
        }
        token.set('gmnotes', notes);
    };

    const removeLinkId = (token) => {
        var notes = token.get('gmnotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}
        notes = notes.replace(/\n?gaslight_link:\s*.+/, '').trim();
        token.set('gmnotes', notes);
    };

    /**
     * Auto-populate gaslight_link from character attribute if token doesn't already have one.
     */
    /**
     * Find a matching token on another page by gaslight_link, represents+name, or represents alone.
     */
    const findMatchingToken = (sourceToken, targetPageId) => {
        // By gaslight_link
        var linkId = getLinkId(sourceToken);
        if (linkId) {
            var targets = findObjs({ _type: 'graphic', _pageid: targetPageId, _subtype: 'token' });
            var match = targets.find(function(t) { return getLinkId(t) === linkId; });
            if (match) return match;
        }
        // By represents + name
        var charId = sourceToken.get('represents');
        if (charId) {
            var name = sourceToken.get('name');
            var byName = findObjs({ _type: 'graphic', _pageid: targetPageId, represents: charId, _subtype: 'token' });
            if (name) byName = byName.filter(function(t) { return t.get('name') === name; });
            if (byName.length === 1) return byName[0];
        }
        return null;
    };

    /**
     * Test whether an imgsrc can be used with createObj.
     * Creates a temporary token, checks if it succeeded, deletes it immediately.
     * @param {string} imgsrc - URL to test
     * @param {string} pageid - page to create the test token on
     * @returns {boolean} true if the imgsrc is valid for API token creation
     */
    const canCreateWithImgsrc = (imgsrc, pageid) => {
        if (!imgsrc) return false;
        var test = createObj('graphic', {
            _subtype: 'token',
            pageid: pageid,
            imgsrc: imgsrc,
            left: -1000, top: -1000, width: 10, height: 10,
            layer: 'gmlayer'
        });
        if (test) {
            test.remove();
            return true;
        }
        return false;
    };

    /**
     * Feature-detect the experimental-sandbox graphic.createCopy(properties) method.
     * When present, a graphic can be duplicated with its Marketplace imgsrc AND sides
     * preserved (which createObj() would reject). See:
     * https://app.roll20.net/forum/post/12801404
     * @param {object} token - a Roll20 graphic object
     * @returns {boolean}
     */
    const supportsCreateCopy = (token) => {
        return !!token && typeof token.createCopy === 'function';
    };

    /**
     * Is graphic.createCopy available in this sandbox at all? Probes any graphic
     * in the game. Used to branch guides toward the `quick` vs manual workflow.
     * Memoized — createCopy support is a fixed property of the sandbox for the
     * life of the process. We only cache once a graphic exists to test (avoids
     * caching a false negative in an empty game); findObjs is relatively costly.
     * @returns {boolean}
     */
    var _createCopyMemo = null; // null = unknown, true/false = determined
    const createCopyAvailable = () => {
        if (_createCopyMemo !== null) return _createCopyMemo;
        var g = findObjs({ _type: 'graphic' })[0];
        if (!g) return false; // no graphic to test yet — don't cache, retry later
        _createCopyMemo = supportsCreateCopy(g);
        return _createCopyMemo;
    };

    /**
     * Single source of truth for "can this token be staged (copied) to another page?"
     * - No imgsrc: never copyable.
     * - createCopy available: always copyable (Marketplace imgsrc/sides preserved).
     * - Otherwise: fall back to the legacy probe (createObj rejects Marketplace URLs).
     * @param {object} token - a Roll20 graphic object
     * @param {string} [pageid] - page to probe on (defaults to the token's page)
     * @returns {boolean}
     */
    const canStageToken = (token, pageid) => {
        if (!token) return false;
        var imgsrc = token.get('imgsrc');
        if (!imgsrc) return false;
        if (supportsCreateCopy(token)) return true;
        return canCreateWithImgsrc(imgsrc, pageid || token.get('_pageid'));
    };

    // =========================================================================
    // Page cloning (for !gaslight quick)
    // =========================================================================

    // Page settings copied onto a freshly-created blank page. _id/_type/_zorder
    // are read-only and excluded; name is set separately.
    const PAGE_CLONE_PROPS = [
        'showgrid', 'showdarkness', 'showlighting', 'width', 'height',
        'snapping_increment', 'grid_opacity', 'fog_opacity', 'background_color',
        'gridcolor', 'grid_type', 'scale_number', 'scale_units', 'gridlabels',
        'diagonaltype', 'lightupdatedrop', 'lightenforcelos', 'lightrestrictmove',
        'lightglobalillum', 'jukeboxtrigger', 'dynamic_lighting_enabled',
        'daylight_mode_enabled', 'daylightModeOpacity', 'explorer_mode', 'darknessEffect'
    ];

    // Per-type property lists for cloning page objects. Positional/appearance
    // props only — _id/_type/_pageid are set by createObj/createCopy.
    const CLONE_PROPS = {
        graphic: ['left', 'top', 'width', 'height', 'rotation', 'layer', 'isdrawing',
            'flipv', 'fliph', 'name', 'gmnotes', 'controlledby', 'represents',
            'bar1_link', 'bar2_link', 'bar3_link', 'bar1_value', 'bar2_value', 'bar3_value',
            'bar1_max', 'bar2_max', 'bar3_max', 'aura1_radius', 'aura2_radius',
            'aura1_color', 'aura2_color', 'aura1_square', 'aura2_square', 'tint_color',
            'statusmarkers', 'showname', 'showplayers_name', 'showplayers_bar1',
            'showplayers_bar2', 'showplayers_bar3', 'showplayers_aura1', 'showplayers_aura2',
            'playersedit_name', 'playersedit_bar1', 'playersedit_bar2', 'playersedit_bar3',
            'playersedit_aura1', 'playersedit_aura2', 'light_radius', 'light_dimradius',
            'light_otherplayers', 'light_hassight', 'light_angle', 'light_losangle',
            'light_multiplier', 'emits_bright_light', 'bright_light_distance',
            'emits_low_light', 'low_light_distance', 'has_bright_light_vision',
            'has_night_vision', 'night_vision_distance', 'sides', 'currentSide'],
        path: ['fill', 'stroke', 'rotation', 'layer', 'stroke_width', 'width', 'height',
            'top', 'left', 'scaleX', 'scaleY', 'controlledby', 'barrierType'],
        pathv2: ['shape', 'points', 'fill', 'stroke', 'rotation', 'layer', 'stroke_width',
            'x', 'y', 'controlledby', 'barrierType', 'oneWayReversed'],
        text: ['top', 'left', 'width', 'height', 'text', 'font_size', 'rotation', 'color',
            'font_family', 'layer', 'controlledby'],
        door: ['x', 'y', 'color', 'isOpen', 'isLocked', 'isSecret', 'path'],
        window: ['x', 'y', 'color', 'isOpen', 'isLocked', 'path'],
        pin: ['x', 'y', 'bgColor', 'shape', 'icon', 'pinImage', 'customizationType',
            'useTextIcon', 'iconText', 'tooltipImageSize', 'link', 'linkType', 'subLink',
            'subLinkType', 'title', 'notes', 'gmNotes', 'tooltipImage', 'nameplateVisibleTo',
            'imageVisibleTo', 'notesVisibleTo', 'gmNotesVisibleTo', 'scale']
    };

    // Object types we clone, in the order we search for them.
    const CLONE_TYPES = ['graphic', 'path', 'pathv2', 'text', 'door', 'window', 'pin'];

    /**
     * Build a createObj-ready property object for a page object being cloned.
     */
    const buildCloneProps = (obj, destPageId) => {
        var type = obj.get('_type');
        var props = CLONE_PROPS[type] || [];
        var data = { _pageid: destPageId };
        props.forEach(function(p) {
            var v = obj.get(p);
            if (v !== undefined) data[p] = v;
        });
        return data;
    };

    /**
     * Clone one page object onto destPageId. Returns the new object or null.
     * Graphics prefer createCopy (Marketplace-safe); other types use createObj.
     */
    const clonePageObject = (obj, destPageId) => {
        var type = obj.get('_type');
        if (type === 'graphic') {
            if (supportsCreateCopy(obj)) return obj.createCopy({ pageid: destPageId }) || null;
            // Legacy fallback (Marketplace imgsrc will fail here)
            var g = buildCloneProps(obj, destPageId);
            g._subtype = 'token';
            g.imgsrc = obj.get('imgsrc');
            return createObj('graphic', g) || null;
        }
        if (type === 'path') {
            // path requires _path at creation and is immutable afterward
            var pd = buildCloneProps(obj, destPageId);
            pd._path = obj.get('_path');
            return createObj('path', pd) || null;
        }
        // pathv2, text, door, window, pin
        return createObj(type, buildCloneProps(obj, destPageId)) || null;
    };

    /**
     * Clone all objects from sourcePageId onto destPageId, preserving z-order,
     * then invoke onDone(created). Work is deferred to avoid blocking the sandbox.
     */
    const clonePageContents = (sourcePageId, destPageId, onDone) => {
        var sourcePage = getObj('page', sourcePageId);
        var zorder = (sourcePage.get('_zorder') || '').split(',').filter(Boolean);
        // Gather objects on the source page, keyed by id.
        var byId = {};
        CLONE_TYPES.forEach(function(t) {
            findObjs({ _type: t, _pageid: sourcePageId }).forEach(function(o) {
                // Skip Gaslight's own config text objects — the destination page
                // gets its own config via setConfigOnPage. Cloning the master's
                // GM config onto a player page would corrupt group discovery.
                if (o.get('_type') === 'text' && (o.get('text') || '').indexOf(CONFIG_HEADER) === 0) return;
                // Skip Gaslight script pins — these are page-specific logic markers,
                // not map content, and shouldn't be duplicated onto player pages.
                if (o.get('_type') === 'pin' && isScriptPin(o)) return;
                byId[o.id] = o;
            });
        });
        // Order by _zorder first; append any not present in _zorder (some types
        // like pins/doors/windows may not appear in the z-order list).
        var ordered = [];
        zorder.forEach(function(id) { if (byId[id]) { ordered.push(byId[id]); delete byId[id]; } });
        Object.keys(byId).forEach(function(id) { ordered.push(byId[id]); });

        var created = [];
        var i = 0;
        var step = function() {
            if (i >= ordered.length) {
                // No z-order normalization needed: objects were created in
                // _zorder order (back-to-front) and the engine sends each new
                // object to the front, so the final stacking matches the source.
                if (onDone) onDone(created);
                return;
            }
            var src = ordered[i++];
            try {
                var copy = clonePageObject(src, destPageId);
                if (copy) created.push(copy);
            } catch (e) {
                log(SCRIPT_NAME + ': quick clone failed for ' + src.get('_type') + ' ' + src.id + ' \u2014 ' + e.message);
            }
            if (typeof _ !== 'undefined' && _.defer) _.defer(step);
            else setTimeout(step, 0);
        };
        step();
    };

    /**
     * A brand-new page that has never held an object can have a non-string
     * _zorder (undefined). The engine's auto "send to front" on the first
     * createObj then throws (adjustZOrder calls _zorder.split()). Seed it with
     * an empty string so the first object can be created safely. _zorder is
     * documented read-only, so guard the set and verify it took.
     * @returns {boolean} true if the page's _zorder is a usable string
     */
    const ensurePageZOrder = (pageId) => {
        var page = getObj('page', pageId);
        if (!page) return false;
        if (typeof page.get('_zorder') === 'string') return true;
        try { page.set('_zorder', ''); } catch (e) { /* read-only in some engines */ }
        return typeof page.get('_zorder') === 'string';
    };

    /**
     * Remove all clonable objects (graphic/path/pathv2/text/door/window/pin)
     * from a page. Used to recycle scratch pages on merge.
     */
    const wipePage = (pageId) => {
        CLONE_TYPES.forEach(function(t) {
            findObjs({ _type: t, _pageid: pageId }).forEach(function(o) {
                try { o.remove(); } catch (e) { /* some types may not be removable */ }
            });
        });
    };

    const formatMarketplaceError = (failures, retryCommand) => {
        var failMsg = '<b>⚠️ ' + failures.length + ' token(s) could not be staged</b> because their images are from the Roll20 Marketplace and not in your library.<br>';
        if (failures.some(function(f) { return f.id; }) && typeof ScriptKit !== 'undefined') failMsg += '<small><i>Click a token image to ping its location.</i></small>';
        failMsg += '<br>';
        failures.forEach(function(f) {
            if (f.id && typeof ScriptKit !== 'undefined') {
                failMsg += ScriptKit.html.pingObjImg(f.id, { imgsrc: f.imgsrc, label: f.name, moveAll: true });
            } else {
                failMsg += '<div style="display:inline-block;vertical-align:middle;margin:4px;text-align:center;">'
                    + '<img src="' + f.imgsrc + '" style="width:40px;height:40px;"><br>'
                    + '<small>' + f.name + '</small></div>';
            }
        });
        failMsg += '<br><br><b>To fix:</b><ol>'
            + '<li>In the <b>Art Library</b> tab, find the asset under <b>Premium Assets → Marketplace Purchases</b>, right-click it (or the folder), and select <b>Copy to Library</b>.</li>'
            + '<li>Replace the token(s) on the master page with the library copy (drag from your library).</li>'
            + '<li>Re-run <code>' + retryCommand + '</code> with the new token(s) selected.</li>'
            + '</ol>';
        return failMsg;
    };

    /**
     * Stage a single token to target pages using 3-step logic.
     * Returns { cloned: number, failed: boolean, id: string, name: string, imgsrc: string }
     */
    const stageTokenToPages = (token, targetPageIds) => {
        var linkId = getLinkId(token);
        var pagesToCloneTo = [];
        var result = { cloned: 0, failed: false, id: token.get('id'), name: token.get('name') || '(unnamed)', imgsrc: '' };

        if (linkId) {
            // Step 1-2: find pages missing a token with this gaslight_link
            targetPageIds.forEach(function(pageId) {
                var targets = findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' });
                var hasMatch = targets.some(function(t) { return getLinkId(t) === linkId; });
                if (!hasMatch) pagesToCloneTo.push(pageId);
            });
        }

        if (!linkId || pagesToCloneTo.length === 0) {
            // Step 3: generate new gaslight_link and clone to all target pages
            var newLinkId = genId();
            setLinkId(token, newLinkId);
            pagesToCloneTo = targetPageIds;
        }

        pagesToCloneTo.forEach(function(targetPageId) {
            var imgsrc = token.get('imgsrc');
            if (!imgsrc) return;

            var newToken;
            if (supportsCreateCopy(token)) {
                // Experimental sandbox: createCopy duplicates ALL properties
                // (including Marketplace imgsrc + sides), overriding only the page.
                newToken = token.createCopy({ pageid: targetPageId });
            } else {
                // Legacy: create with spatial + identity + gmnotes (minimum for
                // Anchor/linking to work). Marketplace imgsrc will be rejected here.
                newToken = createObj('graphic', {
                    _subtype: 'token',
                    pageid: targetPageId,
                    imgsrc: imgsrc,
                    left: token.get('left'),
                    top: token.get('top'),
                    width: token.get('width'),
                    height: token.get('height'),
                    rotation: token.get('rotation'),
                    flipv: token.get('flipv'),
                    fliph: token.get('fliph'),
                    layer: token.get('layer'),
                    name: token.get('name'),
                    represents: token.get('represents') || '',
                    controlledby: token.get('controlledby') || '',
                    gmnotes: token.get('gmnotes') || ''
                });
            }
            if (newToken) {
                setLinkId(newToken, getLinkId(token));
                result.cloned++;
            } else {
                result.failed = true;
                result.imgsrc = imgsrc;
            }
        });
        return result;
    };

    const autoPopulateLinkId = (token) => {
        if (getLinkId(token)) return; // already has one
        const charId = token.get('represents');
        if (!charId) return;
        const attr = findObjs({ _type: 'attribute', _characterid: charId, name: LINK_KEY })[0];
        if (attr && attr.get('current')) {
            setLinkId(token, attr.get('current'));
        }
    };

    /**
     * Read gaslight_sync from a token's gmnotes.
     * Returns the raw string value, or null if not present.
     */
    const getSyncConfigRaw = (token) => {
        var notes = token.get('gmnotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}
        notes = notes.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
        const match = notes.match(/gaslight_sync:\s*(.+)/);
        return match ? match[1].trim() : null;
    };

    const setSyncConfig = (token, value) => {
        var notes = token.get('gmnotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}
        if (notes.match(/gaslight_sync:\s*.*/)) {
            notes = notes.replace(/gaslight_sync:\s*.*/, 'gaslight_sync: ' + value);
        } else {
            notes = (notes ? notes + '\n' : '') + 'gaslight_sync: ' + value;
        }
        token.set('gmnotes', notes);
    };

    const autoPopulateSyncConfig = (token) => {
        if (getSyncConfigRaw(token) !== null) return; // already has one
        const charId = token.get('represents');
        if (!charId) return;
        const attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
        if (attr && attr.get('current') !== undefined && attr.get('current') !== null) {
            setSyncConfig(token, attr.get('current'));
        }
    };

    /**
     * Read the gaslight_sync config for a token (from gmnotes only).
     * Returns:
     *   null — not configured (default: sync all non-spatial)
     *   '' — explicitly empty (no sync)
     *   ['prop1','prop2',...] — specific props to sync
     */
    const getGaslightSync = (token) => {
        var rawVal = null;
        if (token && typeof token === 'object' && typeof token.get === 'function') {
            rawVal = getSyncConfigRaw(token);
        } else if (typeof token === 'string') {
            // Legacy: character ID — read attribute directly (used internally only)
            var attr = findObjs({ _type: 'attribute', _characterid: token, name: 'gaslight_sync' })[0];
            if (!attr) return null;
            rawVal = (attr.get('current') || '').trim();
        }
        if (rawVal === null || rawVal === undefined) return null;
        if (rawVal === '') return '';
        // Parse comma-separated props, resolve groups
        var parts = rawVal.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        var includes = [];
        var excludes = [];
        parts.forEach(function(p) {
            var isExclude = p.startsWith('!');
            var name = isExclude ? p.slice(1) : p;
            var expanded;
            if (name === 'base' || name === 'anchor') {
                expanded = ['left', 'top', 'rotation', 'width', 'height', 'flipv', 'fliph'];
            } else if (typeof Mirror !== 'undefined' && Mirror.PROP_GROUPS[name]) {
                expanded = Mirror.PROP_GROUPS[name];
            } else {
                expanded = [name];
            }
            if (isExclude) excludes = excludes.concat(expanded);
            else includes = includes.concat(expanded);
        });
        // If only excludes specified, start from all known props and subtract
        var resolved;
        if (includes.length === 0 && excludes.length > 0) {
            var allProps = typeof Mirror !== 'undefined' ? Mirror.getKnownProps() :
                ['left', 'top', 'rotation', 'width', 'height', 'flipv', 'fliph', 'layer',
                 'bar1_value', 'bar1_max', 'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max',
                 'statusmarkers', 'tint_color', 'name', 'light_radius', 'light_dimradius', 'baseOpacity', 'currentSide'];
            resolved = allProps.filter(function(p) { return excludes.indexOf(p) === -1; });
        } else {
            resolved = includes.filter(function(p) { return excludes.indexOf(p) === -1; });
        }
        return resolved.filter(function(p, i) { return resolved.indexOf(p) === i; }); // dedupe
    };

    // =========================================================================
    // Token Linking Resolution
    // =========================================================================

    /**
     * Resolve links from sourcePageId to targetPageId.
     * Returns array of { source, target, step } objects.
     * Unmatched sources returned as { source, target: null, step: 'unlinked' }.
     */
    const resolveLinks = (sourcePageId, targetPageId) => {
        const sourceTokens = findObjs({ _type: 'graphic', _pageid: sourcePageId, _subtype: 'token' });
        const targetTokens = findObjs({ _type: 'graphic', _pageid: targetPageId, _subtype: 'token' });
        const results = [];
        const matchedTargets = new Set();

        // Step 1: gaslight_link in GM notes
        sourceTokens.forEach(src => {
            const linkId = getLinkId(src);
            if (!linkId) return;
            const match = targetTokens.find(t => !matchedTargets.has(t.get('id')) && getLinkId(t) === linkId);
            if (match) {
                results.push({ source: src, target: match, step: 1 });
                matchedTargets.add(match.get('id'));
            }
        });

        const unmatchedSources = sourceTokens.filter(s =>
            !results.some(r => r.source.get('id') === s.get('id'))
        );

        // Step 2: represents + name
        const step2Sources = unmatchedSources.filter(s => s.get('represents'));
        step2Sources.forEach(src => {
            const charId = src.get('represents');
            const name = src.get('name');
            // Check uniqueness on source page
            const samePairOnSource = sourceTokens.filter(t =>
                t.get('represents') === charId && t.get('name') === name &&
                !results.some(r => r.source.get('id') === t.get('id'))
            );
            if (samePairOnSource.length !== 1) return; // ambiguous on source page

            const candidates = targetTokens.filter(t =>
                !matchedTargets.has(t.get('id')) &&
                t.get('represents') === charId && t.get('name') === name
            );
            if (candidates.length === 1) {
                results.push({ source: src, target: candidates[0], step: 2 });
                matchedTargets.add(candidates[0].get('id'));
            }
        });

        // Step 3: represents + fingerprint
        const unmatchedAfter2 = unmatchedSources.filter(s =>
            s.get('represents') && !results.some(r => r.source.get('id') === s.get('id'))
        );
        const FINGERPRINT_PROPS = ['represents', 'left', 'top', 'width', 'height', 'rotation',
            'bar1_value', 'bar1_max', 'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max'];

        unmatchedAfter2.forEach(src => {
            const srcFP = FINGERPRINT_PROPS.map(p => String(src.get(p)));
            const candidates = targetTokens.filter(t => {
                if (matchedTargets.has(t.get('id'))) return false;
                const tFP = FINGERPRINT_PROPS.map(p => String(t.get(p)));
                return srcFP.every((v, i) => v === tFP[i]);
            });
            if (candidates.length === 1) {
                results.push({ source: src, target: candidates[0], step: 3 });
                matchedTargets.add(candidates[0].get('id'));
            }
        });

        // Step 4: unlinked — only master-page represents tokens
        unmatchedSources.forEach(src => {
            if (!results.some(r => r.source.get('id') === src.get('id'))) {
                if (src.get('represents')) {
                    results.push({ source: src, target: null, step: 4 });
                }
            }
        });

        return results;
    };

    /**
     * Check for warning conditions across all pages in a group.
     * Returns array of { message, severity, tokens? } where severity is 'info'|'warning'|'error'.
     */
    const checkWarnings = (groupInfo) => {
        const warnings = [];
        const allPageIds = [groupInfo.master].concat(Object.values(groupInfo.players).map(function(p) { return p.pageId; }));

        // Collect all gaslight_link IDs and their page locations + tokens
        const linkIdPages = {}; // linkId → Set of pageIds
        const linkIdTokens = {}; // linkId → array of token objects
        const linkIdDupes = {}; // pageId → Set of linkIds that appear more than once
        allPageIds.forEach(function(pid) {
            var tokens = findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' });
            var seenOnPage = {};
            tokens.forEach(function(t) {
                var lid = getLinkId(t);
                if (!lid) return;
                if (!linkIdPages[lid]) linkIdPages[lid] = new Set();
                linkIdPages[lid].add(pid);
                if (!linkIdTokens[lid]) linkIdTokens[lid] = [];
                linkIdTokens[lid].push(t);
                // Check for duplicates on same page
                if (seenOnPage[lid]) {
                    if (!linkIdDupes[pid]) linkIdDupes[pid] = new Set();
                    linkIdDupes[pid].add(lid);
                }
                seenOnPage[lid] = true;
            });
        });

        // Error: duplicate gaslight_link on same page
        Object.entries(linkIdDupes).forEach(function(entry) {
            var pid = entry[0], dupes = entry[1];
            var page = getObj('page', pid);
            var pageName = page ? page.get('name') : pid;
            dupes.forEach(function(lid) {
                var dupeTokens = (linkIdTokens[lid] || []).filter(function(t) { return t.get('_pageid') === pid; });
                warnings.push({ message: 'Duplicate gaslight_link on page "' + pageName + '"', severity: 'error', tokens: dupeTokens });
            });
        });

        // Info/Warning: gaslight_link missing from pages
        Object.entries(linkIdPages).forEach(function(entry) {
            var lid = entry[0], pages = entry[1];
            if (pages.size === 1) {
                warnings.push({ message: 'exists on only 1 page (likely missing from player pages)', severity: 'warning', tokens: linkIdTokens[lid] || [] });
            } else if (pages.size < allPageIds.length) {
                warnings.push({ message: 'missing from some pages', severity: 'info', tokens: linkIdTokens[lid] || [] });
            }
        });

        return warnings;
    };

    const formatWarnings = (warnings) => {
        if (warnings.length === 0) return '';
        var hasTokens = warnings.some(function(w) { return w.tokens && w.tokens.length > 0; });
        var out = '<br><b>Warnings:</b>';
        if (hasTokens && typeof ScriptKit !== 'undefined') out += '<br><small><i>Click a token image to ping its location.</i></small>';
        out += '<br>';
        warnings.forEach(function(w) {
            var icon = w.severity === 'error' ? '🔴' : w.severity === 'warning' ? '🟡' : 'ℹ️';
            if (w.tokens && w.tokens.length > 0 && typeof ScriptKit !== 'undefined') {
                var tokenImgs = w.tokens.map(function(t) {
                    return ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: t.get('name') || t.get('id'), moveAll: true, width: 30, height: 30 });
                }).join(' ');
                out += icon + ' ' + tokenImgs + ' — ' + w.message + '<br>';
            } else {
                out += icon + ' ' + w.message + '<br>';
            }
        });
        return out;
    };

    // =========================================================================
    // Anchor Integration
    // =========================================================================

    const countControllersInGroup = (token, groupInfo) => {
        const charId = token.get('represents');
        if (!charId) return 0;
        const character = getObj('character', charId);
        if (!character) return 0;
        const controlledBy = character.get('controlledby') || '';
        if (controlledBy === 'all') return Object.keys(groupInfo.players).length;
        const controllerIds = controlledBy.split(',').filter(Boolean);
        const groupPlayerIds = new Set(Object.keys(groupInfo.players));
        return controllerIds.filter(id => groupPlayerIds.has(id)).length;
    };

    const getControllingPlayerName = (token, groupInfo) => {
        const charId = token.get('represents');
        if (!charId) return null;
        const character = getObj('character', charId);
        if (!character) return null;
        const controlledBy = character.get('controlledby') || '';
        if (!controlledBy) return null;
        if (controlledBy === 'all') {
            // All players control it — return first group player as representative
            var firstPlayer = Object.keys(groupInfo.players)[0];
            return firstPlayer || null;
        }
        const controllerIds = controlledBy.split(',').filter(Boolean);
        for (var i = 0; i < controllerIds.length; i++) {
            if (groupInfo.players[controllerIds[i]]) return controllerIds[i];
        }
        return null;
    };

    const stripSight = (token) => {
        token.set({ has_bright_light_vision: false, has_night_vision: false, light_hassight: false });
    };

    /**
     * Set up Anchor links based on resolved token pairs.
     * Also writes gaslight_link IDs to token GM notes for any pair matched
     * via steps 2-3, so re-split/restart will catch them via step 1.
     */
    const establishLinks = (groupName, groupInfo, allLinks) => {
        const s = state[SCRIPT_NAME];
        if (!s.activeGroups[groupName]) {
            s.activeGroups[groupName] = {
                masterPageId: groupInfo.master,
                playerPages: groupInfo.players,
                linkedTokens: {}
            };
        }
        const active = s.activeGroups[groupName];

        if (typeof Anchor === 'undefined') {
            log(SCRIPT_NAME + ': ERROR \u2014 Anchor not loaded. Cannot establish links.');
            return;
        }

        // Group all link results by gaslight_link ID
        var linkGroups = {}; // linkId -> { id: tokenObj }
        allLinks.forEach(function(link) {
            if (!link.target) return;
            var src = link.source;
            var tgt = link.target;

            // Ensure both have a gaslight_link ID
            var existingId = getLinkId(src) || getLinkId(tgt);
            var linkId = existingId || genId();
            if (!getLinkId(src)) setLinkId(src, linkId);
            if (!getLinkId(tgt)) setLinkId(tgt, linkId);

            if (!linkGroups[linkId]) linkGroups[linkId] = {};
            linkGroups[linkId][src.get('id')] = src;
            linkGroups[linkId][tgt.get('id')] = tgt;
        });

        // For each link group, determine anchoring strategy
        Object.values(linkGroups).forEach(function(tokenMap) {
            var tokens = Object.values(tokenMap);
            if (tokens.length < 2) return;

            // Find all controlling player IDs in the group for this token
            var controllerIds = [];
            // Check the character's controlledby — use first token's character as representative
            var repCharId = null;
            for (var i = 0; i < tokens.length; i++) {
                if (tokens[i].get('represents')) { repCharId = tokens[i].get('represents'); break; }
            }
            if (repCharId) {
                var repChar = getObj('character', repCharId);
                if (repChar) {
                    var cb = repChar.get('controlledby') || '';
                    if (cb === 'all') {
                        controllerIds = Object.keys(groupInfo.players);
                    } else {
                        var cbIds = cb.split(',').filter(Boolean);
                        controllerIds = cbIds.filter(function(id) { return !!groupInfo.players[id]; });
                    }
                }
            }

            var ids = tokens.map(function(t) { return t.get('id'); });

            // Check gaslight_sync — read from first token's gmnotes (falls back to character attr)
            var syncProps = getGaslightSync(tokens[0]);
            // syncProps: null = default (base spatial), '' = no sync at all, array = specific

            // If empty string, skip all linking for this group
            if (syncProps === '') return;

            // Determine which props go to Anchor vs Mirror
            var needsAnchor = true;
            var anchorComponents = null; // null = use ANCHOR_PROPS as default
            var mirrorProps = null; // null = all non-anchor
            if (Array.isArray(syncProps)) {
                var anchorRequested = syncProps.filter(function(p) { return ANCHOR_PROPS.indexOf(p) !== -1; });
                var mirrorRequested = syncProps.filter(function(p) { return ANCHOR_PROPS.indexOf(p) === -1; });
                needsAnchor = anchorRequested.length > 0;
                // Pass specific components to Anchor if not the full default set
                if (needsAnchor) {
                    anchorComponents = {};
                    anchorRequested.forEach(function(p) { anchorComponents[p] = true; });
                }
                mirrorProps = mirrorRequested.length > 0 ? mirrorRequested : false;
            }
            // Always pass explicit components — never let Anchor default to ALL_COMPONENTS
            if (!anchorComponents) {
                anchorComponents = {};
                ANCHOR_PROPS.forEach(function(p) { anchorComponents[p] = true; });
            }

            // Set up Anchor links (spatial sync)
            if (needsAnchor) {
                if (controllerIds.length === 0) {
                    // NPC: master is parent, all others are children
                    var parent = tokens.find(function(t) { return t.get('_pageid') === groupInfo.master; });
                    if (!parent) parent = tokens[0];
                    tokens.forEach(function(t) {
                        if (t.get('id') === parent.get('id')) return;
                        Anchor.anchorObj(t.get('id'), parent.get('id'), anchorComponents);
                    });
                } else {
                    // Player-controlled: chain-link master + controlling players' pages
                    var chainPageIds = [groupInfo.master];
                    controllerIds.forEach(function(pid) {
                        if (groupInfo.players[pid]) chainPageIds.push(groupInfo.players[pid].pageId);
                    });

                    var chainTokens = tokens.filter(function(t) { return chainPageIds.indexOf(t.get('_pageid')) !== -1; });
                    var childTokens = tokens.filter(function(t) { return chainPageIds.indexOf(t.get('_pageid')) === -1; });

                    var chainIds = chainTokens.map(function(t) { return t.get('id'); });
                    if (chainIds.length >= 2) {
                        Anchor.chainAnchorObjs(chainIds, anchorComponents);
                    }

                    if (childTokens.length > 0 && chainTokens.length > 0) {
                        var chainParent = chainTokens[0];
                        childTokens.forEach(function(t) {
                            Anchor.anchorObj(t.get('id'), chainParent.get('id'), anchorComponents);
                        });
                    }
                }
            }

            // Strip sight: only controlling players' pages keep sight
            tokens.forEach(function(t) {
                var pageId = t.get('_pageid');
                if (controllerIds.length > 0) {
                    // Keep sight only on pages belonging to controlling players
                    var isControllerPage = controllerIds.some(function(pid) {
                        return groupInfo.players[pid] && groupInfo.players[pid].pageId === pageId;
                    });
                    if (!isControllerPage) stripSight(t);
                } else {
                    // NPC: strip sight from children (not master)
                    if (pageId !== groupInfo.master) stripSight(t);
                }
            });

            // Set up Mirror chain for non-spatial property sync
            if (typeof Mirror !== 'undefined' && mirrorProps !== false) {
                if (mirrorProps === null) {
                    // Default: sync all minus anchor and sight (sight stripped from children)
                    var mirrorExcludes = anchorComponents ? Object.keys(anchorComponents) : ANCHOR_PROPS;
                    // Also exclude sight unless explicitly included in gaslight_sync
                    if (typeof Mirror !== 'undefined' && Mirror.PROP_GROUPS && Mirror.PROP_GROUPS.sight) {
                        mirrorExcludes = mirrorExcludes.concat(Mirror.PROP_GROUPS.sight);
                    }
                    Mirror.chainLink(ids, null, mirrorExcludes);
                } else if (Array.isArray(mirrorProps) && mirrorProps.length > 0) {
                    // Specific non-spatial props (user explicitly chose what to sync)
                    Mirror.chainLink(ids, mirrorProps);
                }
            }

            // Track links for merge teardown
            ids.forEach(function(id) {
                if (!active.linkedTokens[id]) active.linkedTokens[id] = [];
            });
            ids.forEach(function(id) {
                ids.forEach(function(otherId) {
                    if (id !== otherId) active.linkedTokens[id].push(otherId);
                });
            });
        });
    };

    // =========================================================================
    // Commands
    // =========================================================================

    /**
     * Quick setup: auto-configure a group from duplicate pages.
     * !gaslight setup <group_name> [--selected | player1 player2 ...]
     * Expects N+1 pages with the same name (or name prefix). Assigns master + players.
     */
    const doSetup = (msg, args) => {
        args = args.slice();
        // First arg is the group name only if it doesn't resolve to a player;
        // otherwise a readable name is auto-generated (group name is optional).
        var groupName = resolveGroupName(args);

        // Determine players: selected tokens + named args, fallback to party tags
        var playerIds = [];

        // From selected tokens
        if (msg.selected && msg.selected.length > 0) {
            msg.selected.forEach(function(sel) {
                var obj = getObj(sel._type, sel._id);
                if (!obj) return;
                var charId = obj.get('represents');
                if (!charId) return;
                var character = getObj('character', charId);
                if (!character) return;
                var cb = character.get('controlledby') || '';
                if (cb && cb !== 'all') {
                    cb.split(',').filter(Boolean).forEach(function(pid) {
                        if (playerIds.indexOf(pid) === -1) playerIds.push(pid);
                    });
                }
            });
        }

        // From named args
        args.forEach(function(name) {
            var resolved = resolvePlayer(msg, name, CMD + ' setup ' + groupName);
            if (resolved && resolved !== 'ambiguous' && resolved.id !== 'GM') {
                if (playerIds.indexOf(resolved.id) === -1) playerIds.push(resolved.id);
            }
        });

        // Fallback: party-tagged characters (only if no selected and no args)
        if (playerIds.length === 0) {
            var characters = findObjs({ _type: 'character' });
            characters.forEach(function(c) {
                var tags = c.get('tags') || '';
                if (!tags.toLowerCase().includes('party')) return;
                var cb = c.get('controlledby') || '';
                if (cb && cb !== 'all') {
                    cb.split(',').filter(Boolean).forEach(function(pid) {
                        if (playerIds.indexOf(pid) === -1) playerIds.push(pid);
                    });
                }
            });
        }

        if (playerIds.length === 0) { reply(msg, 'Error', 'No players found. Use --selected, provide names, or tag party characters.'); return; }

        // Find the master page (where selected token is, or current player page)
        var masterPageId = resolvePageId(msg, []);
        var masterPage = getObj('page', masterPageId);
        if (!masterPage) { reply(msg, 'Error', 'Could not determine master page. Select a token on the master page.'); return; }
        var masterName = masterPage.get('name');

        // Find candidate pages: same base name (strip recursive "Copy of " prefixes), or already has this group's config
        var allPages = findObjs({ _type: 'page' });
        var candidates = allPages.filter(function(p) {
            var name = stripCopyOf(p.get('name'));
            if (name === masterName) return true;
            // Check if page already has config for this group
            var cfg = getGroupConfigOnPage(p.get('_id'), groupName);
            if (cfg) return true;
            return false;
        });

        // We need N+1 pages (1 master + N players)
        var needed = playerIds.length + 1;
        if (candidates.length < needed) {
            reply(msg, 'Error', 'Found ' + candidates.length + ' page(s) named "' + masterName + '..." but need ' + needed + ' (1 master + ' + playerIds.length + ' players). Duplicate the page ' + (needed - candidates.length) + ' more time(s).');
            return;
        }

        // Assign: first candidate = master, rest = players (arbitrary order)
        var masterCandidate = candidates.find(function(p) { return p.get('_id') === masterPageId; }) || candidates[0];
        var playerCandidates = candidates.filter(function(p) { return p.get('_id') !== masterCandidate.get('_id'); }).slice(0, playerIds.length);

        // Rename and configure
        masterCandidate.set('name', masterName + ' (master)');
        setConfigOnPage(masterCandidate.get('_id'), groupName, { player: 'GM' });

        var assignments = [];
        playerIds.forEach(function(pid, i) {
            var page = playerCandidates[i];
            var player = getObj('player', pid);
            var playerName = player ? player.get('_displayname') : pid;
            page.set('name', masterName + ' (' + playerName + ')');
            setConfigOnPage(page.get('_id'), groupName, { player: playerName, playerid: pid });
            assignments.push(playerName + ' → ' + page.get('name'));
        });

        var out = 'Group "<b>' + groupName + '</b>" set up:<br>';
        out += 'Master: ' + masterCandidate.get('name') + '<br>';
        out += assignments.join('<br>');
        out += '<br><br>Run <code>!gaslight test ' + groupName + '</code> to verify, then <code>!gaslight split ' + groupName + '</code> to activate.';
        reply(msg, 'Setup', out);
    };

    const doQuick = (msg, args) => {
        var s = state[SCRIPT_NAME];
        args = args.slice();

        // First arg is the group name only if it doesn't resolve to a player;
        // otherwise a readable name is auto-generated.
        var groupName = resolveGroupName(args);

        // Determine players (mirror doSetup): selected tokens' controllers,
        // named args, then party-tagged characters.
        var playerIds = [];
        if (msg.selected && msg.selected.length > 0) {
            msg.selected.forEach(function(sel) {
                var obj = getObj(sel._type, sel._id);
                if (!obj) return;
                var charId = obj.get('represents');
                if (!charId) return;
                var character = getObj('character', charId);
                if (!character) return;
                var cb = character.get('controlledby') || '';
                if (cb && cb !== 'all') {
                    cb.split(',').filter(Boolean).forEach(function(pid) {
                        if (playerIds.indexOf(pid) === -1) playerIds.push(pid);
                    });
                }
            });
        }
        args.forEach(function(name) {
            var resolved = resolvePlayer(msg, name, CMD + ' quick ' + groupName);
            if (resolved && resolved !== 'ambiguous' && resolved.id !== 'GM') {
                if (playerIds.indexOf(resolved.id) === -1) playerIds.push(resolved.id);
            }
        });
        if (playerIds.length === 0) {
            var characters = findObjs({ _type: 'character' });
            characters.forEach(function(c) {
                var tags = c.get('tags') || '';
                if (!tags.toLowerCase().includes('party')) return;
                var cb = c.get('controlledby') || '';
                if (cb && cb !== 'all') {
                    cb.split(',').filter(Boolean).forEach(function(pid) {
                        if (playerIds.indexOf(pid) === -1) playerIds.push(pid);
                    });
                }
            });
        }
        if (playerIds.length === 0) { reply(msg, 'Error', 'No players found. Select tokens, provide names, or tag party characters.'); return; }

        // Resolve the source (master) page.
        var masterPageId = resolvePageId(msg, args);
        var masterPage = getObj('page', masterPageId);
        if (!masterPage) { reply(msg, 'Error', 'Could not determine source page. Select a token on the page to clone.'); return; }

        // Gate on createCopy support (Option A): pick a graphic on the page and
        // check. If none exists or it's unsupported, fail before doing anything.
        var probe = findObjs({ _type: 'graphic', _pageid: masterPageId, _subtype: 'token' })[0];
        if (!probe) {
            reply(msg, 'Error', 'The source page has no token to verify cloning support. Add a token, or use <code>' + CMD + ' setup</code> with manually-duplicated pages.');
            return;
        }
        if (!supportsCreateCopy(probe)) {
            reply(msg, 'Error', '<b>' + CMD + ' quick</b> requires the experimental/Jumpgate sandbox (needs <code>graphic.createCopy</code>). Switch your game to the experimental sandbox, or duplicate pages manually and use <code>' + CMD + ' setup</code>.');
            return;
        }

        // Prevent re-activating an already-active group.
        if (s.activeGroups[groupName]) { reply(msg, 'Error', 'Group "' + groupName + '" is already active. Merge it first.'); return; }

        var masterName = stripGlsTag(masterPage.get('name')) || 'Map';

        // Find existing copies of the master page (same base name after stripping
        // recursive "Copy of " prefixes), excluding the master itself. These are
        // GM-made duplicates and already have their contents.
        var allPages = findObjs({ _type: 'page' });
        var copies = allPages.filter(function(p) {
            if (p.get('_id') === masterPageId) return false;
            if (isScratchPageName(p.get('name'))) return false; // scratch pages handled separately
            return stripCopyOf(stripGlsTag(p.get('name'))) === masterName;
        });

        // Find scratch pages to fill any shortfall (GL-SCRATCH, or "Copy of GL-SCRATCH", ...).
        var scratch = allPages.filter(function(p) { return isScratchPageName(p.get('name')); });

        var needed = playerIds.length; // one page per player (master is the source page)
        if (copies.length + scratch.length < needed) {
            reply(msg, 'Error', 'Need ' + needed + ' player page(s) but found only ' + copies.length + ' copy(ies) of "' + masterName + '" and ' + scratch.length + ' <code>' + SCRATCH_NAME + '</code> page(s). Duplicate the page or add more <code>' + SCRATCH_NAME + '</code> pages.');
            return;
        }

        // Configure the source page as the master.
        masterPage.set('name', masterName + ' (master)');
        setConfigOnPage(masterPageId, groupName, { player: 'GM' });

        reply(msg, 'Quick', 'Preparing ' + needed + ' player page(s) for "' + masterName + '"\u2026 this runs in the background; you\u2019ll get a notice when it\u2019s done.');

        // Assign each player a page: prefer existing copies, then scratch pages.
        // Copies are used as-is (Roll20 already duplicated their contents); scratch
        // pages get the master's settings + contents cloned onto them and are
        // tracked so merge can recycle them.
        var scratchUsed = [];
        var jobs = playerIds.map(function(pid) {
            var player = getObj('player', pid);
            var playerName = player ? player.get('_displayname') : pid;
            var page, isScratch;
            if (copies.length > 0) {
                page = copies.shift();
                isScratch = false;
            } else {
                page = scratch.shift();
                isScratch = true;
                scratchUsed.push(page.get('_id'));
            }
            return { pid: pid, playerName: playerName, page: page, isScratch: isScratch };
        });

        var idx = 0;
        var processNext = function() {
            if (idx >= jobs.length) { finish(); return; }
            var job = jobs[idx++];
            var pageId = job.page.get('_id');
            // A pristine scratch page may have an uninitialized _zorder, which makes
            // the engine crash on the first createObj. Seed it first.
            if (!ensurePageZOrder(pageId)) {
                reply(msg, 'Warning', 'Page for ' + job.playerName + ' has an uninitialized z-order and could not be prepared safely; skipping. Try placing (and deleting) any object on the ' + SCRATCH_NAME + ' page once, then retry.');
                processNext();
                return;
            }
            job.page.set('name', masterName + ' (' + job.playerName + ')');
            setConfigOnPage(pageId, groupName, { player: job.playerName, playerid: job.pid });
            if (job.isScratch) {
                // Match settings to the master, then clone contents.
                var settings = {};
                PAGE_CLONE_PROPS.forEach(function(p) {
                    var v = masterPage.get(p);
                    if (v !== undefined) settings[p] = v;
                });
                job.page.set(settings);
                clonePageContents(masterPageId, pageId, function() { processNext(); });
            } else {
                processNext();
            }
        };

        var finish = function() {
            // Run the standard split logic (link resolution, playerspecificpages,
            // Anchor/Mirror links, move players, focus-ping).
            doSplit(msg, [groupName, '--force']);
            // Track scratch pages so merge recycles them (wipe + rename back).
            if (s.activeGroups[groupName]) {
                s.activeGroups[groupName].scratchPages = scratchUsed;
                // If every player page came from a scratch page, the whole group is
                // ephemeral — remember to also strip the master's GM config on merge.
                s.activeGroups[groupName].allScratch = (jobs.length > 0 && scratchUsed.length === jobs.length);
            }
            sendChat(SCRIPT_NAME, '/w gm <b>[Quick]</b> Group "' + groupName + '" is ready: ' + jobs.length + ' player page(s) prepared and split.' + (scratchUsed.length > 0 ? ' ' + scratchUsed.length + ' scratch page(s) will be recycled on <code>' + CMD + ' merge</code>.' : ''));
        };

        processNext();
    };

    const doSplit = (msg, args) => {
        var force = args.indexOf('--force') !== -1;
        args = args.filter(function(a) { return a !== '--force'; });

        const groupName = args[0];
        if (!groupName) { reply(msg, 'Error', 'Usage: !gaslight split &lt;group&gt; [--force]'); return; }

        const groupInfo = discoverGroup(groupName);
        if (!groupInfo.master) { reply(msg, 'Error', 'No master page for group "' + groupName + '".'); return; }
        if (Object.keys(groupInfo.players).length === 0) { reply(msg, 'Error', 'No player pages for group "' + groupName + '".'); return; }

        // Auto-populate gaslight_link from character attributes
        var allPageIds = [groupInfo.master].concat(Object.values(groupInfo.players).map(function(p) { return p.pageId; }));
        allPageIds.forEach(function(pid) {
            findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(function(t) { autoPopulateLinkId(t); autoPopulateSyncConfig(t); });
        });

        // Resolve links
        var allLinks = [];
        var unlinkWarnings = [];
        Object.values(groupInfo.players).forEach(function(pInfo) {
            var links = resolveLinks(groupInfo.master, pInfo.pageId);
            links.forEach(function(l) {
                if (l.target) allLinks.push(l);
                else unlinkWarnings.push(l);
            });
        });

        // Check warnings
        var globalWarnings = checkWarnings(groupInfo);
        var hasErrors = globalWarnings.some(function(w) { return w.severity === 'error'; });
        var hasIssues = hasErrors || unlinkWarnings.length > 0 || globalWarnings.length > 0;

        // Test-first behavior (unless --force)
        if (!force && hasIssues) {
            var out = '<b>Split Test: ' + groupName + '</b><br>';
            out += allLinks.length + ' link(s) would be established.<br>';
            if (unlinkWarnings.length > 0) {
                out += '<br>🟡 ' + unlinkWarnings.length + ' token(s) could not be linked:';
                if (typeof ScriptKit !== 'undefined') out += '<br><small><i>Click a token image to ping its location.</i></small>';
                out += '<br>' +
                    unlinkWarnings.map(function(w) {
                        var t = w.source;
                        if (typeof ScriptKit !== 'undefined') {
                            return ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: t.get('name') || t.get('id'), moveAll: true });
                        }
                        return t.get('name') || t.get('id');
                    }).join(' ') + '<br>';
            }
            out += formatWarnings(globalWarnings);
            if (hasErrors) {
                out += '<br><b>Split blocked due to errors. Fix the issues above and try again.</b>';
            } else {
                out += '<br>[Proceed](' + CMD + ' split ' + groupName + ' --force)';
            }
            reply(msg, 'Split', out);
            return;
        }

        // Assign players to pages
        var psp = Campaign().get('playerspecificpages') || {};
        Object.entries(groupInfo.players).forEach(function(entry) {
            var playerId = entry[0], pInfo = entry[1];
            var player = getObj('player', playerId);
            if (player) {
                psp[playerId] = pInfo.pageId;
                // Record this group at the top of the player's page stack so a
                // later merge can restore them to their previous group's page.
                pushPlayerPage(playerId, groupName, pInfo.pageId);
            } else {
                reply(msg, 'Warning', 'Player "' + pInfo.name + '" (' + playerId + ') not found.');
            }
        });
        Campaign().set('playerspecificpages', psp);

        // Establish links
        establishLinks(groupName, groupInfo, allLinks);

        // Enable relay by default on split
        var s = state[SCRIPT_NAME];
        s.view = 'master';

        // Recreate HUD elements if enabled
        if (s.hud.view) updateViewHud();
        if (s.hud.initiative) updateInitiativeHud();

        var summary = 'Group "' + groupName + '" activated. ' +
            Object.keys(groupInfo.players).length + ' player(s), ' +
            allLinks.length + ' link(s) established.';
        if (unlinkWarnings.length > 0) {
            summary += '<br>' + unlinkWarnings.length + ' token(s) could not be linked:';
            if (typeof ScriptKit !== 'undefined') summary += '<br><small><i>Click a token image to ping its location.</i></small>';
            summary += '<br>' +
                unlinkWarnings.map(function(w) {
                    var t = w.source;
                    if (typeof ScriptKit !== 'undefined') {
                        return ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: t.get('name') || t.get('id'), moveAll: true });
                    }
                    return t.get('name') || t.get('id');
                }).join(' ');
        }
        summary += formatWarnings(globalWarnings);
        reply(msg, 'Split', summary);

        // Build trigger map and register Fetch compProps for scripting engine
        buildTriggerMap();
        registerAllCompProps();

        // Focus-ping each player to their character token on their page
        setTimeout(function() {
            Object.entries(groupInfo.players).forEach(function(entry) {
                var playerId = entry[0], pInfo = entry[1];
                // Find a token on the player's page that they control
                var playerTokens = findObjs({ _type: 'graphic', _pageid: pInfo.pageId, _subtype: 'token' });
                var charToken = playerTokens.find(function(t) {
                    var charId = t.get('represents');
                    if (!charId) return false;
                    var character = getObj('character', charId);
                    if (!character) return false;
                    var cb = character.get('controlledby') || '';
                    return cb === 'all' || cb.split(',').indexOf(playerId) !== -1;
                });
                if (charToken) {
                    sendPing(charToken.get('left'), charToken.get('top'), pInfo.pageId, playerId, true, [playerId]);
                }
            });
        }, 500);
    };

    const doMerge = (msg, args) => {
        const s = state[SCRIPT_NAME];
        const groupName = args[0];
        // No arg: pop the most-recently-activated group off the stack.
        // With a name: merge that specific group wherever it sits in the stack.
        const groupsToMerge = groupName ? [groupName] : (topStackGroup() ? [topStackGroup()] : []);
        if (groupsToMerge.length === 0) { reply(msg, 'Error', 'No active groups to merge.'); return; }

        groupsToMerge.forEach(function(gn) {
            var active = s.activeGroups[gn];
            if (!active) { reply(msg, 'Warning', 'Group "' + gn + '" is not active.'); return; }

            if (typeof Anchor !== 'undefined') {
                var allLinkedIds = new Set();
                Object.keys(active.linkedTokens).forEach(function(id) { allLinkedIds.add(id); });
                Object.values(active.linkedTokens).forEach(function(ids) {
                    ids.forEach(function(id) { allLinkedIds.add(id); });
                });
                allLinkedIds.forEach(function(id) { Anchor.removeAnchor(id); });
            }
            if (typeof Mirror !== 'undefined') {
                var allIds = new Set();
                Object.keys(active.linkedTokens).forEach(function(id) { allIds.add(id); });
                Object.values(active.linkedTokens).forEach(function(ids) {
                    ids.forEach(function(id) { allIds.add(id); });
                });
                allIds.forEach(function(id) { Mirror.unlink([id]); });
            }

            // Remove this group from every player's page stack. reassign holds
            // { playerId: newTopPageId|null } for players whose CURRENT page was
            // in this group — they need to move to their previous group's page
            // (or the banner page if their stack is now empty).
            var reassign = removeGroupFromStacks(gn);
            var psp = Campaign().get('playerspecificpages') || {};
            Object.keys(reassign).forEach(function(playerId) {
                var newPage = reassign[playerId];
                if (newPage) psp[playerId] = newPage;   // fall back to previous group's page
                else delete psp[playerId];              // no group left → banner page
            });
            // Fallback: clear any player still assigned to one of this group's
            // pages but not tracked in a stack (e.g. pre-existing/reset state).
            var groupPageIds = new Set([active.masterPageId]);
            Object.values(active.playerPages).forEach(function(p) { groupPageIds.add(p.pageId); });
            Object.keys(psp).forEach(function(playerId) {
                if (!reassign.hasOwnProperty(playerId) && groupPageIds.has(psp[playerId])) delete psp[playerId];
            });
            Campaign().set('playerspecificpages', Object.keys(psp).length > 0 ? psp : false);

            // Recycle scratch pages used by `!gaslight quick`: wipe their objects
            // and rename them back to the scratch identifier so they can be reused.
            // Players affected by this merge were already reassigned above.
            //
            // IMPORTANT: set `destroying` so the destroy:graphic handler does not
            // cascade these deletions to linked copies on the master/other pages.
            // The tokens still carry gaslight_link + tracked links at this point.
            if (active.scratchPages && active.scratchPages.length > 0) {
                var wasDestroying = destroying;
                destroying = true;
                try {
                    active.scratchPages.forEach(function(pageId) {
                        var pg = getObj('page', pageId);
                        if (!pg) return;
                        wipePage(pageId);
                        pg.set('name', SCRATCH_NAME);
                    });
                } finally {
                    destroying = wasDestroying;
                }
            }

            // If every player page was a scratch page, the group was fully
            // ephemeral — also remove the master page's GM config text and
            // restore its name so no Gaslight trace remains.
            if (active.allScratch && active.masterPageId) {
                var masterCfg = getGroupConfigOnPage(active.masterPageId, gn);
                if (masterCfg && masterCfg.obj) masterCfg.obj.remove();
                var masterPg = getObj('page', active.masterPageId);
                if (masterPg) {
                    var restored = (masterPg.get('name') || '').replace(/\s*\(master\)\s*$/, '');
                    if (restored !== masterPg.get('name')) masterPg.set('name', restored);
                }
            }

            delete s.activeGroups[gn];
        });

        reply(msg, 'Merge', 'Merged ' + groupsToMerge.length + ' group(s). Players returned to their previous page.');

        // Destroy HUD elements (preference preserved, will recreate on next split)
        Object.keys(hudRegistry).forEach(function(el) { hudRegistry[el].disable(); });
    };

    const doMergeAll = (msg) => {
        const s = state[SCRIPT_NAME];
        // Snapshot names first — doMerge mutates activeGroups. Merging every group
        // empties the page stacks regardless of order; each merge reassigns any
        // affected players to their next remaining group (or the banner page).
        var names = Object.keys(s.activeGroups);
        if (names.length === 0) { reply(msg, 'Error', 'No active groups to merge.'); return; }
        names.forEach(function(gn) {
            if (s.activeGroups[gn]) doMerge(msg, [gn]);
        });
    };

    const doTest = (msg, args) => {
        const groupName = args[0];
        if (!groupName) { reply(msg, 'Error', 'Usage: !gaslight test &lt;group&gt;'); return; }

        const groupInfo = discoverGroup(groupName);
        if (!groupInfo.master) { reply(msg, 'Error', 'No master page for group "' + groupName + '".'); return; }

        var out = '<b>Link Test: ' + groupName + '</b><br>';
        var totalLinked = 0;
        var unlinkWarnings = [];

        Object.entries(groupInfo.players).forEach(function(entry) {
            var playerId = entry[0], pInfo = entry[1];
            var links = resolveLinks(groupInfo.master, pInfo.pageId);
            links.forEach(function(l) {
                if (l.target) {
                    totalLinked++;
                } else {
                    unlinkWarnings.push({ source: l.source, playerName: pInfo.name });
                }
            });
        });

        out += totalLinked + ' link(s) would be established across ' + Object.keys(groupInfo.players).length + ' player page(s).<br>';

        if (unlinkWarnings.length > 0) {
            if (typeof ScriptKit !== 'undefined') out += '<small><i>Click a token image to ping its location.</i></small><br>';
            out += '<br>🟡 ' + unlinkWarnings.length + ' token(s) could not be linked:<br>';
            unlinkWarnings.forEach(function(w) {
                var t = w.source;
                if (typeof ScriptKit !== 'undefined') {
                    out += ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: (t.get('name') || t.get('id')) + ' (' + w.playerName + ')', moveAll: true }) + ' ';
                } else {
                    out += (t.get('name') || t.get('id')) + ' (' + w.playerName + '), ';
                }
            });
            out += '<br>';
        }

        // Global warnings
        out += formatWarnings(checkWarnings(groupInfo));

        if (unlinkWarnings.length === 0 && checkWarnings(groupInfo).length === 0) {
            out += '<br>✓ All tokens link successfully. Ready to split.';
        }

        reply(msg, out);
    };

    const doLink = (msg, args) => {
        // --default [<name>]: set gaslight_link on selected tokens' characters
        var defaultIdx = args.indexOf('--default');
        if (defaultIdx !== -1) {
            var name = args[defaultIdx + 1] && !args[defaultIdx + 1].startsWith('-') ? args[defaultIdx + 1] : null;
            var tokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
            if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) representing characters.'); return; }
            var count = 0;
            tokens.forEach(function(t) {
                var charId = t.get('represents');
                if (!charId) return;
                var linkId = name || getLinkId(t) || genId();
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: LINK_KEY })[0];
                if (attr) attr.set('current', linkId);
                else createObj('attribute', { characterid: charId, name: LINK_KEY, current: linkId });
                count++;
            });
            reply(msg, 'Link', 'Set ' + LINK_KEY + ' default on ' + count + ' character(s). New tokens representing these characters will auto-link with the stored name.');
            return;
        }

        var ignoreSelected = args.indexOf('--ignore-selected') !== -1;
        args = args.filter(function(a) { return a !== '--ignore-selected'; });

        // Determine link name
        var linkId;
        if (args.length > 0 && args[0] === 'new') {
            linkId = genId();
            args.shift();
        } else if (args.length > 0 && !args[0].startsWith('-')) {
            // Check if first arg is a token ID or a link name
            var maybeToken = getObj('graphic', args[0]);
            if (!maybeToken) {
                linkId = args.shift();
            }
        }

        // Gather tokens (deduplicated by ID)
        var tokenMap = {};
        if (!ignoreSelected && msg.selected) {
            msg.selected.forEach(function(s) {
                var obj = getObj(s._type, s._id);
                if (obj) tokenMap[obj.get('id')] = obj;
            });
        }
        args.forEach(function(id) {
            var obj = getObj('graphic', id);
            if (obj) tokenMap[obj.get('id')] = obj;
        });
        var tokens = Object.values(tokenMap);

        if (tokens.length === 0) { reply(msg, 'Error', 'No tokens specified.'); return; }

        // If no linkId provided, use existing from first token or generate
        if (!linkId) {
            linkId = getLinkId(tokens[0]) || genId();
        }

        tokens.forEach(function(t) { setLinkId(t, linkId); });

        // Re-establish links if tokens are in an active group
        var s = state[SCRIPT_NAME];
        var relinkCount = 0;
        Object.entries(s.activeGroups).forEach(function(entry) {
            var groupName = entry[0], active = entry[1];
            var allPageIds = [active.masterPageId].concat(Object.values(active.playerPages).map(function(p) { return p.pageId; }));
            var affectedTokens = tokens.filter(function(t) { return allPageIds.indexOf(t.get('_pageid')) !== -1; });
            if (affectedTokens.length === 0) return;

            // Re-resolve links for each player page
            var newLinks = [];
            Object.values(active.playerPages).forEach(function(pInfo) {
                var links = resolveLinks(active.masterPageId, pInfo.pageId);
                links.forEach(function(l) {
                    if (!l.target) return;
                    // Only include links involving the newly-linked tokens
                    var srcId = l.source.get('id'), tgtId = l.target.get('id');
                    if (affectedTokens.some(function(t) { return t.get('id') === srcId || t.get('id') === tgtId; })) {
                        newLinks.push(l);
                    }
                });
            });

            if (newLinks.length > 0) {
                var groupInfo = { master: active.masterPageId, players: active.playerPages };
                establishLinks(groupName, groupInfo, newLinks);
                relinkCount += newLinks.length;
            }
        });

        var extra = relinkCount > 0 ? ' ' + relinkCount + ' link(s) re-established.' : '';
        reply(msg, 'Link', tokens.length + ' token(s) linked as "' + linkId + '".' + extra);
    };

    const doUnlink = (msg, args) => {
        // --default: remove gaslight_link from selected tokens' characters
        var defaultIdx = args.indexOf('--default');
        if (defaultIdx !== -1) {
            var tokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
            if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) representing characters.'); return; }
            var count = 0;
            tokens.forEach(function(t) {
                var charId = t.get('represents');
                if (!charId) return;
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: LINK_KEY })[0];
                if (attr) { attr.remove(); count++; }
            });
            reply(msg, 'Unlink', 'Removed ' + LINK_KEY + ' default from ' + count + ' character(s).');
            return;
        }

        var ignoreSelected = args.indexOf('--ignore-selected') !== -1;
        args = args.filter(function(a) { return a !== '--ignore-selected'; });

        // Unlink entire group
        var groupIdx = args.indexOf('--group');
        if (groupIdx !== -1) {
            var groupName = args[groupIdx + 1];
            if (!groupName) { reply(msg, 'Error', 'Usage: !gaslight unlink --group &lt;group&gt;'); return; }
            var groupInfo = discoverGroup(groupName);
            if (!groupInfo.master) { reply(msg, 'Error', 'No master page for group "' + groupName + '".'); return; }
            var count = 0;
            var allPageIds = [groupInfo.master].concat(Object.values(groupInfo.players).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pid) {
                findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(function(t) {
                    if (getLinkId(t)) { removeLinkId(t); count++; }
                });
            });
            reply(msg, 'Unlink', 'Removed gaslight_link from ' + count + ' token(s) across group "' + groupName + '".');
            return;
        }

        var tokens = [];
        if (!ignoreSelected && msg.selected) {
            msg.selected.forEach(function(s) {
                var obj = getObj(s._type, s._id);
                if (obj) tokens.push(obj);
            });
        }
        args.forEach(function(id) {
            var obj = getObj('graphic', id);
            if (obj) tokens.push(obj);
        });

        if (tokens.length === 0) { reply(msg, 'Error', 'No tokens specified.'); return; }
        var s = state[SCRIPT_NAME];
        tokens.forEach(function(t) {
            var tokenId = t.get('id');
            var tokenPageId = t.get('_pageid');

            // Find the active group this token belongs to
            var activeGroup = null;
            Object.values(s.activeGroups).forEach(function(active) {
                if (active.linkedTokens[tokenId] || Object.values(active.linkedTokens).some(function(peers) { return peers.indexOf(tokenId) !== -1; })) {
                    activeGroup = active;
                }
            });

            // Determine if this is a parent token
            var isParent = isParentToken(t);

            if (isParent && activeGroup) {
                // Parent unlink: dissolve the entire link group
                var allIds = [tokenId].concat(activeGroup.linkedTokens[tokenId] || []);
                // Also gather any peers that list this token
                Object.entries(activeGroup.linkedTokens).forEach(function(entry) {
                    if (entry[1].indexOf(tokenId) !== -1 && allIds.indexOf(entry[0]) === -1) allIds.push(entry[0]);
                });
                // Break anchor chain ring (if token is part of one)
                if (typeof Anchor !== 'undefined') Anchor.unchainAnchorObjs(tokenId);
                // Remove anchor from all child tokens (non-chain members anchored to a chain member)
                allIds.forEach(function(id) {
                    if (typeof Anchor !== 'undefined') Anchor.removeAnchor(id);
                });
                // Break mirror chain and links
                if (typeof Mirror !== 'undefined') {
                    Mirror.unchain(allIds);
                    Mirror.unlink(allIds);
                }
                // Remove gaslight_link and clean up tracking
                allIds.forEach(function(id) {
                    var tok = getObj('graphic', id);
                    if (tok) removeLinkId(tok);
                    delete activeGroup.linkedTokens[id];
                });
                // Clean up references in peers
                Object.keys(activeGroup.linkedTokens).forEach(function(key) {
                    activeGroup.linkedTokens[key] = activeGroup.linkedTokens[key].filter(function(id) { return allIds.indexOf(id) === -1; });
                });
            } else {
                // Non-parent unlink: just remove this one token
                removeLinkId(t);
                if (typeof Mirror !== 'undefined') Mirror.unlink([tokenId]);
                if (typeof Anchor !== 'undefined') Anchor.removeAnchor(tokenId);
                // Remove from activeGroups tracking
                if (activeGroup) {
                    if (activeGroup.linkedTokens[tokenId]) {
                        var peers = activeGroup.linkedTokens[tokenId];
                        delete activeGroup.linkedTokens[tokenId];
                        peers.forEach(function(peerId) {
                            if (activeGroup.linkedTokens[peerId]) {
                                activeGroup.linkedTokens[peerId] = activeGroup.linkedTokens[peerId].filter(function(id) { return id !== tokenId; });
                            }
                        });
                    } else {
                        Object.keys(activeGroup.linkedTokens).forEach(function(key) {
                            var idx = activeGroup.linkedTokens[key].indexOf(tokenId);
                            if (idx !== -1) activeGroup.linkedTokens[key].splice(idx, 1);
                        });
                    }
                }
            }
        });
        reply(msg, 'Unlink', tokens.length + ' token(s) unlinked.');
    };

    const doSync = (msg, args) => {
        var tokens = (msg.selected || []).map(function(s) { return getObj(s._type, s._id); }).filter(Boolean);
        if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) first.'); return; }

        var useDefault = args.indexOf('--default') !== -1;
        args = args.filter(function(a) { return a !== '--default'; });

        var getVal = useDefault
            ? function(t) {
                var charId = t.get('represents'); if (!charId) return null;
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
                return attr ? (attr.get('current') || '') : null;
            }
            : function(t) { return getSyncConfigRaw(t); };

        var setVal = useDefault
            ? function(t, value) {
                var charId = t.get('represents'); if (!charId) return;
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
                if (attr) attr.set('current', value);
                else createObj('attribute', { characterid: charId, name: 'gaslight_sync', current: value });
            }
            : function(t, value) { setSyncConfig(t, value); };

        var label = useDefault ? 'character default' : 'token';

        // No args — show current config
        if (args.length === 0) {
            var results = tokens.map(function(t) {
                var raw = getVal(t);
                var name = t.get('name') || t.get('id');
                var display = (typeof ScriptKit !== 'undefined')
                    ? ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: name, moveAll: true, width: 30, height: 30 })
                    : '<b>' + name + '</b>';
                return display + ': ' + (raw === null ? '<i>(default — sync all)</i>' : raw || '<i>(empty — no sync)</i>');
            });
            reply(msg, 'Sync', results.join('<br>'));
            return;
        }

        var subCmd = args[0].toLowerCase();

        // Reset — re-copy from character attribute (only makes sense for token mode)
        if (subCmd === 'reset') {
            if (useDefault) { reply(msg, 'Error', 'Reset only applies to token sync, not --default.'); return; }
            tokens.forEach(function(t) {
                var charId = t.get('represents');
                var charVal = '';
                if (charId) {
                    var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
                    if (attr && attr.get('current') !== undefined && attr.get('current') !== null) {
                        charVal = attr.get('current').trim();
                    }
                }
                setSyncConfig(t, charVal);
            });
            reply(msg, 'Sync', 'Reset gaslight_sync to character default on ' + tokens.length + ' token(s).');
            return;
        }

        // "all" — explicitly sync everything
        if (subCmd === 'all') {
            var parentTokens = getParentTokens(tokens);
            parentTokens.forEach(function(t) {
                setVal(t, 'all');
                var info = getLinkedInfo(t.get('id'));
                info.linkedIds.forEach(function(id) {
                    var linked = getObj('graphic', id);
                    if (linked) setVal(linked, 'all');
                });
            });
            rebuildLinksForTokens(parentTokens);
            reply(msg, 'Sync', 'Set to sync all properties on ' + parentTokens.length + ' ' + label + '(s).');
            return;
        }

        // Otherwise, treat all args as props to re-enable sync for
        var props = args.join(',').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        var s = state[SCRIPT_NAME];

        // Separate into parents and children
        var parents = tokens.filter(isParentToken);
        var children = tokens.filter(function(t) { return !isParentToken(t); });

        // Helper to apply sync re-enable to a single token's config
        var applySyncToConfig = function(t) {
            var raw = getVal(t) || '';
            var existing = raw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
            var hasWhitelist = existing.some(function(e) { return !e.startsWith('!'); });
            props.forEach(function(p) {
                var excludeVersion = '!' + p;
                var exIdx = existing.indexOf(excludeVersion);
                if (exIdx !== -1) existing.splice(exIdx, 1);
                if (hasWhitelist && existing.indexOf(p) === -1) existing.push(p);
            });
            if (existing.length === 0) {
                // Remove gaslight_sync entirely (revert to character default)
                var notes = t.get('gmnotes') || '';
                try { notes = decodeURIComponent(notes); } catch(e) {}
                notes = notes.replace(/\n?gaslight_sync:\s*.*/, '');
                t.set('gmnotes', notes);
            } else {
                setVal(t, existing.join(', '));
            }
            return existing.length > 0 ? existing.join(', ') : null;
        };

        // Parents: apply to master + propagate to all linked copies, then rebuild
        if (parents.length > 0) {
            var parentMasters = getParentTokens(parents);
            parentMasters.forEach(function(t) {
                var newVal = applySyncToConfig(t);
                // Propagate to all linked copies
                var info = getLinkedInfo(t.get('id'));
                info.linkedIds.forEach(function(id) {
                    var linked = getObj('graphic', id);
                    if (linked) {
                        if (newVal) setVal(linked, newVal);
                        else {
                            var notes = linked.get('gmnotes') || '';
                            try { notes = decodeURIComponent(notes); } catch(e) {}
                            notes = notes.replace(/\n?gaslight_sync:\s*.*/, '');
                            linked.set('gmnotes', notes);
                        }
                    }
                });
            });
            rebuildLinksForTokens(parentMasters);
        }

        // Children: surgically re-add sync for just those tokens
        if (children.length > 0) {
            var spatialToAdd = props.filter(function(p) { return ANCHOR_PROPS.indexOf(p) !== -1; });
            var nonSpatialToAdd = props.filter(function(p) { return ANCHOR_PROPS.indexOf(p) === -1; });
            children.forEach(function(t) {
                var childId = t.get('id');
                applySyncToConfig(t);
                if (spatialToAdd.length > 0 && typeof Anchor !== 'undefined') {
                    var components = {};
                    spatialToAdd.forEach(function(p) { components[p] = true; });
                    Anchor.trackComponents(childId, components);
                }
                if (nonSpatialToAdd.length > 0 && typeof Mirror !== 'undefined') {
                    // Re-add to chain with these props
                    var info = getLinkedInfo(childId);
                    var allIds = [childId].concat(info.linkedIds);
                    Mirror.chainLink(allIds, nonSpatialToAdd);
                }
            });
        }

        var total = parents.length + children.length;
        reply(msg, 'Sync', 'Re-enabled [' + props.join(', ') + '] sync on ' + tokens.length + ' ' + label + '(s).');
    };

    /**
     * Determine if a token is a "parent" in any active group.
     * A parent is: on the master page, OR on a player page controlled by that player.
     */
    const isParentToken = (token) => {
        var s = state[SCRIPT_NAME];
        var tokenId = token.get('id');
        var tokenPageId = token.get('_pageid');
        var result = false;
        Object.values(s.activeGroups).forEach(function(active) {
            if (result) return;
            var inGroup = active.linkedTokens[tokenId] || Object.values(active.linkedTokens).some(function(peers) { return peers.indexOf(tokenId) !== -1; });
            if (!inGroup) return;
            if (tokenPageId === active.masterPageId) { result = true; return; }
            var controlledBy = token.get('controlledby') || '';
            if (!controlledBy) {
                var charId = token.get('represents');
                var character = charId ? getObj('character', charId) : null;
                if (character) controlledBy = character.get('controlledby') || '';
            }
            if (controlledBy) {
                var controllerIds = controlledBy.split(',').map(function(c) { return c.trim(); }).filter(Boolean);
                if (Object.entries(active.playerPages).some(function(e) { return controllerIds.indexOf(e[0]) !== -1 && e[1].pageId === tokenPageId; })) result = true;
            }
        });
        return result;
    };

    /**
     * Tear down and re-establish Anchor/Mirror links for tokens in active groups.
     * Used after sync config changes (desync/sync) to apply immediately.
     */
    const rebuildLinksForTokens = (tokens) => {
        var s = state[SCRIPT_NAME];
        var affectedGroups = {};
        tokens.forEach(function(t) {
            var tokenId = t.get('id');
            Object.entries(s.activeGroups).forEach(function(entry) {
                var groupName = entry[0], active = entry[1];
                if (active.linkedTokens[tokenId] || Object.values(active.linkedTokens).some(function(peers) { return peers.indexOf(tokenId) !== -1; })) {
                    if (!affectedGroups[groupName]) affectedGroups[groupName] = new Set();
                    var allIds = [tokenId].concat(active.linkedTokens[tokenId] || []);
                    Object.entries(active.linkedTokens).forEach(function(e) {
                        if (e[1].indexOf(tokenId) !== -1) { allIds.push(e[0]); allIds = allIds.concat(e[1]); }
                    });
                    allIds.forEach(function(id) { affectedGroups[groupName].add(id); });
                }
            });
        });

        Object.entries(affectedGroups).forEach(function(entry) {
            var groupName = entry[0], ids = [...entry[1]];
            var active = s.activeGroups[groupName];

            // Tear down existing Anchor/Mirror for these tokens
            if (typeof Anchor !== 'undefined') {
                ids.forEach(function(id) { Anchor.unchainAnchorObjs(id); });
                ids.forEach(function(id) { Anchor.removeAnchor(id); });
            }
            if (typeof Mirror !== 'undefined') {
                Mirror.unchain(ids);
                Mirror.unlink(ids);
            }
            // Remove from linkedTokens tracking
            ids.forEach(function(id) { delete active.linkedTokens[id]; });
            ids.forEach(function(id) {
                Object.keys(active.linkedTokens).forEach(function(key) {
                    var idx = active.linkedTokens[key].indexOf(id);
                    if (idx !== -1) active.linkedTokens[key].splice(idx, 1);
                });
            });

            // Re-resolve and re-establish
            var groupInfo = { master: active.masterPageId, players: active.playerPages };
            var newLinks = [];
            Object.values(active.playerPages).forEach(function(pInfo) {
                var links = resolveLinks(active.masterPageId, pInfo.pageId);
                links.forEach(function(l) {
                    if (!l.target) return;
                    var srcId = l.source.get('id'), tgtId = l.target.get('id');
                    if (ids.indexOf(srcId) !== -1 || ids.indexOf(tgtId) !== -1) {
                        newLinks.push(l);
                    }
                });
            });
            if (newLinks.length > 0) establishLinks(groupName, groupInfo, newLinks);
        });
    };

    /**
     * Given tokens, find the master-page parent tokens in their link groups.
     * gaslight_sync is read from the master token by establishLinks.
     */
    const getParentTokens = (tokens) => {
        var s = state[SCRIPT_NAME];
        var result = [];
        var seen = new Set();
        tokens.forEach(function(t) {
            var tokenId = t.get('id');
            var found = false;
            Object.values(s.activeGroups).forEach(function(active) {
                if (found) return;
                var allIds = [tokenId].concat(active.linkedTokens[tokenId] || []);
                Object.entries(active.linkedTokens).forEach(function(e) {
                    if (e[1].indexOf(tokenId) !== -1) { allIds.push(e[0]); allIds = allIds.concat(e[1]); }
                });
                allIds = [...new Set(allIds)];
                var masterToken = null;
                allIds.forEach(function(id) {
                    var obj = getObj('graphic', id);
                    if (obj && obj.get('_pageid') === active.masterPageId) masterToken = obj;
                });
                if (masterToken && !seen.has(masterToken.get('id'))) {
                    seen.add(masterToken.get('id'));
                    result.push(masterToken);
                    found = true;
                }
            });
            if (!found && !seen.has(tokenId)) {
                seen.add(tokenId);
                result.push(t);
            }
        });
        return result;
    };

    const doDesync = (msg, args) => {
        var tokens = (msg.selected || []).map(function(s) { return getObj(s._type, s._id); }).filter(Boolean);
        if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) first.'); return; }

        var useDefault = args.indexOf('--default') !== -1;
        args = args.filter(function(a) { return a !== '--default'; });

        var getVal = useDefault
            ? function(t) {
                var charId = t.get('represents'); if (!charId) return null;
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
                return attr ? (attr.get('current') || '') : null;
            }
            : function(t) { return getSyncConfigRaw(t); };

        var setVal = useDefault
            ? function(t, value) {
                var charId = t.get('represents'); if (!charId) return;
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
                if (attr) attr.set('current', value);
                else createObj('attribute', { characterid: charId, name: 'gaslight_sync', current: value });
            }
            : function(t, value) { setSyncConfig(t, value); };

        var label = useDefault ? 'character default' : 'token';

        if (args.length === 0) { reply(msg, 'Error', 'Usage: !gaslight desync [--default] <props|all>'); return; }

        // "all" — disable all syncing (set empty string = no sync)
        if (args[0].toLowerCase() === 'all') {
            var parentTokens = getParentTokens(tokens);
            parentTokens.forEach(function(t) {
                setVal(t, '');
                var info = getLinkedInfo(t.get('id'));
                info.linkedIds.forEach(function(id) {
                    var linked = getObj('graphic', id);
                    if (linked) setVal(linked, '');
                });
            });
            rebuildLinksForTokens(parentTokens);
            reply(msg, 'Desync', 'Disabled all syncing on ' + parentTokens.length + ' ' + label + '(s).' + (useDefault ? '' : ' Use <code>!gaslight sync reset</code> to restore.'));
            return;
        }

        var props = args.join(',').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        var excludeProps = props.map(function(p) { return p.startsWith('!') ? p : '!' + p; });
        var s = state[SCRIPT_NAME];

        // Separate into parents and children
        var parents = tokens.filter(isParentToken);
        var children = tokens.filter(function(t) { return !isParentToken(t); });

        // Parents: write config to master token and rebuild
        if (parents.length > 0) {
            var parentMasters = getParentTokens(parents);
            parentMasters.forEach(function(t) {
                var raw = getVal(t) || '';
                var existing = raw.split(',').map(function(x) { return x.trim(); }).filter(Boolean);
                excludeProps.forEach(function(p) { if (existing.indexOf(p) === -1) existing.push(p); });
                var newVal = existing.join(', ');
                setVal(t, newVal);
                // Propagate to all linked copies
                var info = getLinkedInfo(t.get('id'));
                info.linkedIds.forEach(function(id) {
                    var linked = getObj('graphic', id);
                    if (linked) setVal(linked, newVal);
                });
            });
            rebuildLinksForTokens(parentMasters);
        }

        // Children: surgically remove sync for just those tokens
        if (children.length > 0) {
            var spatialToRemove = props.filter(function(p) { return ANCHOR_PROPS.indexOf(p) !== -1; });
            var nonSpatialToRemove = props.filter(function(p) { return ANCHOR_PROPS.indexOf(p) === -1; });
            children.forEach(function(t) {
                var childId = t.get('id');
                if (spatialToRemove.length > 0 && typeof Anchor !== 'undefined') {
                    var components = {};
                    spatialToRemove.forEach(function(p) { components[p] = true; });
                    Anchor.untrackComponents(childId, components);
                }
                if (nonSpatialToRemove.length > 0 && typeof Mirror !== 'undefined') {
                    Mirror.unchain([childId], nonSpatialToRemove);
                }
            });
        }

        var total = parents.length + children.length;
        reply(msg, 'Desync', 'Excluded [' + props.join(', ') + '] from sync on ' + total + ' ' + label + '(s).');
    };

    /**
     * Read/set/unset gl_* variables on token gmnotes or character sheet.
     * Supports chained actions: --get, --set, --del, --setch, --delch
     * After mutations, propagates to linked tokens and triggers eval (unless --silent).
     *
     * Usage: !gaslight var [--silent] [actions...]
     *   --get <name>          Read gl_<name> (token gmnotes priority, fallback to char)
     *   --set <name> <value>  Set gl_<name> on token gmnotes
     *   --del <name>          Remove gl_<name> from token gmnotes
     *   --setch <name> <value> Set gl_<name> on character sheet attribute
     *   --delch <name>        Remove gl_<name> from character sheet attribute
     */
    const doVar = (msg, args) => {
        var silent = args.indexOf('--silent') !== -1;
        args = args.filter(function(a) { return a !== '--silent'; });

        var tokens = (msg.selected || []).map(function(s) { return getObj(s._type, s._id); }).filter(Boolean);
        if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) first.'); return; }
        if (args.length === 0) { reply(msg, 'Error', 'Usage: !gaslight var [--silent] --get|--set|--del|--setch|--delch &lt;name&gt; [value]'); return; }

        // Parse chained actions
        var actions = [];
        var i = 0;
        while (i < args.length) {
            var action = args[i].toLowerCase();
            if (action === '--get') {
                if (i + 1 >= args.length) { reply(msg, 'Error', '--get requires a name.'); return; }
                actions.push({ type: 'get', name: args[i + 1] });
                i += 2;
            } else if (action === '--set') {
                if (i + 2 >= args.length) { reply(msg, 'Error', '--set requires a name and value.'); return; }
                actions.push({ type: 'set', name: args[i + 1], value: args[i + 2] });
                i += 3;
            } else if (action === '--del') {
                if (i + 1 >= args.length) { reply(msg, 'Error', '--del requires a name.'); return; }
                actions.push({ type: 'del', name: args[i + 1] });
                i += 2;
            } else if (action === '--setch') {
                if (i + 2 >= args.length) { reply(msg, 'Error', '--setch requires a name and value.'); return; }
                actions.push({ type: 'setch', name: args[i + 1], value: args[i + 2] });
                i += 3;
            } else if (action === '--delch') {
                if (i + 1 >= args.length) { reply(msg, 'Error', '--delch requires a name.'); return; }
                actions.push({ type: 'delch', name: args[i + 1] });
                i += 2;
            } else {
                reply(msg, 'Error', 'Unknown action: ' + args[i] + '. Expected --get, --set, --del, --setch, or --delch.');
                return;
            }
        }

        // Normalize names — ensure gl_ prefix
        actions.forEach(function(a) {
            if (!a.name.startsWith('gl_')) a.name = 'gl_' + a.name;
        });

        var s = state[SCRIPT_NAME];
        var output = [];
        var mutatedTokenGmnotes = false;
        var mutatedCharAttrs = false;

        tokens.forEach(function(t) {
            var tokenName = t.get('name') || t.get('id');
            var tokenDisplay = (typeof ScriptKit !== 'undefined')
                ? ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: tokenName, moveAll: true, width: 30, height: 30 })
                : '<b>' + tokenName + '</b>';
            var tokenId = t.get('id');
            var onMaster = Object.values(s.activeGroups).some(function(active) { return t.get('_pageid') === active.masterPageId; });

            // Determine which tokens to read from / write to based on view
            var resolveViewTargets = function() {
                if (!onMaster) return [t]; // non-master: operate on itself only
                if (s.view === null) return [t]; // off: master only
                if (s.view === 'master') {
                    // All linked tokens including master
                    var targets = [t];
                    Object.values(s.activeGroups).forEach(function(active) {
                        var allLinked = (active.linkedTokens[tokenId] || []).slice();
                        Object.entries(active.linkedTokens).forEach(function(entry) {
                            if (entry[1].indexOf(tokenId) !== -1) allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
                        });
                        allLinked.filter(function(id, idx, arr) { return arr.indexOf(id) === idx && id !== tokenId; }).forEach(function(id) {
                            var linked = getObj('graphic', id);
                            if (linked) targets.push(linked);
                        });
                    });
                    return targets;
                }
                // Specific player: find their linked copy
                var playerTargets = [];
                Object.values(s.activeGroups).forEach(function(active) {
                    var targetPageId = active.playerPages[s.view] ? active.playerPages[s.view].pageId : null;
                    if (!targetPageId) return;
                    var allLinked = (active.linkedTokens[tokenId] || []).slice();
                    Object.entries(active.linkedTokens).forEach(function(entry) {
                        if (entry[1].indexOf(tokenId) !== -1) allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
                    });
                    allLinked.filter(function(id, idx, arr) { return arr.indexOf(id) === idx && id !== tokenId; }).forEach(function(id) {
                        var linked = getObj('graphic', id);
                        if (linked && linked.get('_pageid') === targetPageId) playerTargets.push(linked);
                    });
                });
                return playerTargets.length > 0 ? playerTargets : [t];
            };

            // For --get: read from view targets
            var getTargets = resolveViewTargets();
            // For --set/--del: write to view targets (master included only if view is master or off)
            var writeTargets;
            if (!onMaster || s.view === null || s.view === 'master') {
                writeTargets = resolveViewTargets();
            } else {
                // view is a specific player: only write to that player's copy, not master
                writeTargets = resolveViewTargets();
            }

            // Process --get actions against getTargets
            actions.forEach(function(a) {
                if (a.type !== 'get') return;
                if (s.view === 'master' && onMaster && getTargets.length > 1) {
                    // Compact format: show all values
                    var vals = getTargets.map(function(target) {
                        var tNotes = target.get('gmnotes') || '';
                        try { tNotes = decodeURIComponent(tNotes); } catch(e) {}
                        var val = readGlField(tNotes, a.name);
                        if (!val) {
                            var charId = target.get('represents');
                            if (charId) val = getAttrByName(charId, a.name) || '';
                        }
                        var pageName = 'master';
                        Object.values(s.activeGroups).forEach(function(active) {
                            if (target.get('_pageid') === active.masterPageId) pageName = 'master';
                            Object.entries(active.playerPages).forEach(function(e) {
                                if (target.get('_pageid') === e[1].pageId) pageName = e[1].name || e[0];
                            });
                        });
                        return pageName + ': ' + (val || '<i>∅</i>');
                    });
                    output.push(tokenDisplay + ' ' + a.name + ' — ' + vals.join(', '));
                } else {
                    var target = getTargets[0];
                    var tNotes = target.get('gmnotes') || '';
                    try { tNotes = decodeURIComponent(tNotes); } catch(e) {}
                    var val = readGlField(tNotes, a.name);
                    if (!val) {
                        var charId = target.get('represents');
                        if (charId) val = getAttrByName(charId, a.name) || '';
                    }
                    output.push(tokenDisplay + ' ' + a.name + ' = ' + (val || '<i>(not set)</i>'));
                }
            });

            // Process --set/--del/--setch/--delch against writeTargets
            var prevGmnotes_original = t.get('gmnotes') || '';
            writeTargets.forEach(function(target) {
                var prevGmnotes = target.get('gmnotes') || '';
                var notes = prevGmnotes;
                try { notes = decodeURIComponent(notes); } catch(e) {}
                var gmnotesChanged = false;

                actions.forEach(function(a) {
                    if (a.type === 'set') {
                        var rx = new RegExp(a.name + '\\s*[=:]\\s*[^\\n]*');
                        if (notes.match(rx)) {
                            notes = notes.replace(rx, a.name + ': ' + a.value);
                        } else {
                            notes = (notes ? notes + '\n' : '') + a.name + ': ' + a.value;
                        }
                        gmnotesChanged = true;
                    } else if (a.type === 'del') {
                        notes = notes.replace(new RegExp('\\n?' + a.name + '\\s*[=:]\\s*[^\\n]*'), '');
                        gmnotesChanged = true;
                    } else if (a.type === 'setch') {
                        var charId = target.get('represents');
                        if (!charId) return;
                        var attr = findObjs({ _type: 'attribute', _characterid: charId, name: a.name })[0];
                        if (attr) { attr.set('current', a.value); }
                        else { createObj('attribute', { characterid: charId, name: a.name, current: a.value }); }
                        mutatedCharAttrs = true;
                    } else if (a.type === 'delch') {
                        var charId = target.get('represents');
                        if (!charId) return;
                        var attr = findObjs({ _type: 'attribute', _characterid: charId, name: a.name })[0];
                        if (attr) attr.remove();
                        mutatedCharAttrs = true;
                    }
                });

                if (gmnotesChanged) {
                    target.set('gmnotes', notes);
                    mutatedTokenGmnotes = true;
                }
            });

            // Trigger script evaluation once, scoped to view (unless --silent)
            if (mutatedTokenGmnotes && !silent) {
                // Pick the right token to trigger from based on view
                var triggerTarget;
                if (!onMaster || s.view === null || s.view === 'master') {
                    triggerTarget = t; // master token: evaluates for all viewers
                } else {
                    // Specific player view: trigger from their copy so eval scopes to that viewer
                    triggerTarget = writeTargets[0] || t;
                }
                onGmNotesChanged(triggerTarget, { gmnotes: prevGmnotes_original });
            }

            // Trigger eval for char attr mutations (scripts may resolve from char)
            if (mutatedCharAttrs && !silent) {
                var changedFields = actions.filter(function(a) { return a.type === 'setch' || a.type === 'delch'; }).map(function(a) { return a.name; });
                changedFields.forEach(function(field) {
                    var entries = triggerMap[field];
                    if (!entries || entries.length === 0) return;
                    var masterTokenId = null;
                    Object.values(s.activeGroups).forEach(function(active) {
                        var allLinked = (active.linkedTokens[tokenId] || []).slice();
                        Object.entries(active.linkedTokens).forEach(function(entry) {
                            if (entry[1].indexOf(tokenId) !== -1) allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
                        });
                        allLinked.filter(function(id, idx) { return allLinked.indexOf(id) === idx; }).forEach(function(id) {
                            var tok = getObj('graphic', id);
                            if (tok && tok.get('_pageid') === active.masterPageId) masterTokenId = id;
                        });
                        if (t.get('_pageid') === active.masterPageId) masterTokenId = tokenId;
                    });
                    entries.forEach(function(entry) {
                        var pin = getObj('pin', entry.pinId);
                        if (!pin) return;
                        var fakeMsg = { playerid: 'API', who: 'API', type: 'api' };
                        evaluatePins([pin], fakeMsg, false, masterTokenId, t.get('_pageid'));
                    });
                });
            }
        });

        // Build summary
        var hasMutations = actions.some(function(a) { return a.type !== 'get'; });
        if (output.length > 0) {
            reply(msg, 'Var', output.join('<br>'));
        }
        if (hasMutations) {
            var summary = actions.filter(function(a) { return a.type !== 'get'; }).map(function(a) {
                if (a.type === 'set') return 'set ' + a.name + ' = ' + a.value;
                if (a.type === 'del') return 'del ' + a.name;
                if (a.type === 'setch') return 'setch ' + a.name + ' = ' + a.value;
                if (a.type === 'delch') return 'delch ' + a.name;
            }).join(', ');
            reply(msg, 'Var', summary + ' on ' + tokens.length + ' token(s).' + (silent ? ' (silent)' : ''));
        }
    };

    const doGroup = (msg, args) => {
        if (args.length < 2) { reply(msg, 'Error', 'Usage: !gaslight group &lt;group&gt; &lt;player|GM&gt;'); return; }
        const groupName = args.shift();
        const playerArg = args.join(' ').replace(/^["']|["']$/g, '');
        const pageId = resolvePageId(msg, []);
        const page = getObj('page', pageId);
        const pageName = page ? page.get('name') : 'unknown';

        var resolved = resolvePlayer(msg, playerArg, CMD + ' group ' + groupName);
        if (!resolved || resolved === 'ambiguous') return;

        var configData;
        if (resolved.id === 'GM') {
            configData = { player: 'GM' };
        } else {
            configData = { player: resolved.name, playerid: resolved.id };
        }
        setConfigOnPage(pageId, groupName, configData);
        reply(msg, 'Config', 'Page "' + pageName + '" (' + pageId + ') assigned to group "' + groupName + '" for ' + resolved.name + '.');
    };

    /**
     * Set the current view mode.
     * !gaslight view [player|master]
     */
    const doView = (msg, args) => {
        var s = state[SCRIPT_NAME];
        if (args.length === 0) {
            // Show current view
            var current;
            if (s.view === null) current = 'off (relay disabled)';
            else if (s.view === 'master') current = 'master (relay to all)';
            else {
                current = Object.values(s.activeGroups).reduce(function(name, g) {
                    if (name) return name;
                    var entry = g.playerPages[s.view];
                    return entry ? entry.name : null;
                }, null) || s.view;
            }
            reply(msg, 'View', 'Current view: <b>' + current + '</b>');
            return;
        }
        var arg = args.join(' ').replace(/^["']|["']$/g, '');
        if (arg.toLowerCase() === 'master' || arg.toLowerCase() === 'gm' || arg.toLowerCase() === 'all') {
            s.view = 'master';
            reply(msg, 'View', 'Switched to <b>master</b> view. Commands relay to all player pages.');
        } else if (arg.toLowerCase() === 'none' || arg.toLowerCase() === 'off') {
            s.view = null;
            reply(msg, 'View', 'Relay <b>disabled</b>. Commands stay on master only.');
        } else {
            // Resolve player
            var resolved = resolvePlayer(msg, arg, CMD + ' view');
            if (!resolved || resolved === 'ambiguous') return;
            s.view = resolved.id;
            reply(msg, 'View', 'Switched to <b>' + resolved.name + '</b> view. Commands will auto-target their linked tokens.');
        }
        updateViewHud();
    };

    /**
     * Relay a command to linked tokens on specific views.
     * !gaslight relay <views...> <! command...>
     * Views: player names, "all", "master"/"GM"
     */
    const doRelay = (msg, args) => {
        var s = state[SCRIPT_NAME];
        var tokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
        if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) to relay from.'); return; }

        // Split args: views are everything before first command-prefixed arg (! # %), command is the rest
        var views = [];
        var commandArgs = [];
        var foundCmd = false;
        args.forEach(function(a) {
            if (!foundCmd && (a.startsWith('!') || a.startsWith('#') || a.startsWith('%'))) foundCmd = true;
            if (foundCmd) commandArgs.push(a);
            else views.push(a);
        });

        if (views.length === 0) { reply(msg, 'Error', 'Specify view target(s): player names, "all", or "master". Usage: !gaslight relay &lt;views&gt; &lt;!command&gt;'); return; }
        if (commandArgs.length === 0) { reply(msg, 'Error', 'No command provided. Command must start with !, #, or %'); return; }
        var command = commandArgs.join(' ');

        // Resolve views
        var includeMaster = false;
        var targetPlayerIds = [];
        views.forEach(function(v) {
            var lower = v.toLowerCase().replace(/^["']|["']$/g, '');
            if (lower === 'all') {
                targetPlayerIds = Object.keys(s.activeGroups).reduce(function(acc, gn) {
                    return acc.concat(Object.keys(s.activeGroups[gn].playerPages));
                }, []);
                includeMaster = true;
            } else if (lower === 'master' || lower === 'gm') {
                includeMaster = true;
            } else {
                // Resolve as player name
                Object.values(s.activeGroups).forEach(function(active) {
                    Object.entries(active.playerPages).forEach(function(entry) {
                        if (entry[1].name && entry[1].name.toLowerCase() === lower) {
                            if (targetPlayerIds.indexOf(entry[0]) === -1) targetPlayerIds.push(entry[0]);
                        }
                    });
                });
            }
        });
        targetPlayerIds = targetPlayerIds.filter(function(id, i) { return targetPlayerIds.indexOf(id) === i; });

        var sender = 'player|' + msg.playerid;

        var relayed = executeRelay(sender, tokens, command, targetPlayerIds, includeMaster);
        reply(msg, 'Relay', 'Relayed to ' + relayed + ' token(s).');
    };

    /**
     * Relay execution: replaces token IDs in command with linked counterparts per
     * target page and appends {& select} for SelectManager cross-page targeting.
     */
    const executeRelay = (sender, tokens, command, targetPlayerIds, includeMaster) => {
        var s = state[SCRIPT_NAME];
        var relayed = 0;
        var tokenIds = tokens.map(function(t) { return t.get('id'); });

        if (includeMaster) {
            relaying.add(relayKey(command, sender, tokenIds));
            sendChat(sender, command + ' {& select ' + tokenIds.join(', ') + '}');
            relayed += tokenIds.length;
        }

        targetPlayerIds.forEach(function(playerId) {
            var linkedIds = [];
            var newCmd = command;

            Object.values(s.activeGroups).forEach(function(active) {
                var playerPage = active.playerPages[playerId];
                if (!playerPage) return;

                tokenIds.forEach(function(tokenId) {
                    // Find all linked counterparts
                    var allLinked = (active.linkedTokens[tokenId] || []).slice();
                    Object.entries(active.linkedTokens).forEach(function(entry) {
                        if (entry[1].indexOf(tokenId) !== -1) {
                            allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
                        }
                    });
                    // Filter to ones on this player's page
                    var onPage = allLinked.filter(function(id, i, arr) {
                        if (arr.indexOf(id) !== i || id === tokenId) return false;
                        var obj = getObj('graphic', id);
                        return obj && obj.get('_pageid') === playerPage.pageId;
                    });
                    onPage.forEach(function(id) {
                        newCmd = newCmd.split(tokenId).join(id);
                        if (linkedIds.indexOf(id) === -1) linkedIds.push(id);
                    });
                });
            });

            if (linkedIds.length > 0) {
                relaying.add(relayKey(newCmd, sender, linkedIds));
                sendChat(sender, newCmd + ' {& select ' + linkedIds.join(', ') + '}');
                relayed += linkedIds.length;
            }
        });

        return relayed;
    };

    /**
     * Stage selected tokens: duplicate to player pages and link.
     * !gaslight stage [playerName1 playerName2 ...]
     */
    const doStage = (msg, args) => {
        var s = state[SCRIPT_NAME];

        // --default on|off: set gaslight_stage on selected tokens' characters
        var defaultIdx = args.indexOf('--default');
        if (defaultIdx !== -1) {
            var val = args[defaultIdx + 1];
            if (val !== 'on' && val !== 'off') { reply(msg, 'Error', 'Usage: !gaslight stage --default on|off'); return; }
            var tokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
            if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) representing characters.'); return; }

            // Check for marketplace images when enabling
            if (val === 'on') {
                var marketplaceFailures = tokens.filter(function(t) {
                    return !canStageToken(t, t.get('_pageid'));
                }).map(function(t) { return { id: t.get('id'), name: t.get('name') || '(unnamed)', imgsrc: t.get('imgsrc') }; });
                if (marketplaceFailures.length > 0) {
                    reply(msg, 'Stage', formatMarketplaceError(marketplaceFailures, '!gaslight stage --default on'));
                    return;
                }
            }

            var count = 0;
            tokens.forEach(function(t) {
                var charId = t.get('represents');
                if (!charId) return;
                var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_stage' })[0];
                if (val === 'on') {
                    if (attr) attr.set('current', '1');
                    else createObj('attribute', { characterid: charId, name: 'gaslight_stage', current: '1' });
                } else {
                    if (attr) attr.remove();
                }
                count++;
            });
            reply(msg, 'Stage', 'Set gaslight_stage=' + (val === 'on' ? '1' : '(removed)') + ' on ' + count + ' character(s). Tokens representing these characters will ' + (val === 'on' ? 'auto-stage when placed on a gaslighted page.' : 'no longer auto-stage.'));
            return;
        }

        var tokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
        if (tokens.length === 0) { reply(msg, 'Error', 'Select token(s) to stage.'); return; }

        // Find which active group this page belongs to
        var pageId = tokens[0].get('_pageid');
        var activeEntry = Object.entries(s.activeGroups).find(function(e) { return e[1].masterPageId === pageId || Object.values(e[1].playerPages).some(function(p) { return p.pageId === pageId; }); });
        if (!activeEntry) { reply(msg, 'Error', 'Token is not on an active gaslit page.'); return; }
        var groupName = activeEntry[0];
        var groupInfo = { master: activeEntry[1].masterPageId, players: activeEntry[1].playerPages };

        // Determine target players
        var targetPlayerIds = [];
        if (args.length > 0) {
            args.forEach(function(name) {
                var resolved = Object.entries(groupInfo.players).find(function(e) {
                    return e[1].name && e[1].name.toLowerCase() === name.toLowerCase();
                });
                if (resolved) targetPlayerIds.push(resolved[0]);
                else reply(msg, 'Warning', 'Player "' + name + '" not found in group.');
            });
        } else {
            // Default: follow current view target
            if (s.view && s.view !== 'master' && groupInfo.players[s.view]) {
                targetPlayerIds = [s.view];
            } else {
                targetPlayerIds = Object.keys(groupInfo.players);
            }
        }

        if (targetPlayerIds.length === 0) { reply(msg, 'Error', 'No valid target players.'); return; }

        var staged = 0;
        var marketplaceFailures = [];
        tokens.forEach(function(token) {
            var sourcePageId = token.get('_pageid');
            var targetPages = targetPlayerIds
                .map(function(pid) { return groupInfo.players[pid].pageId; })
                .filter(function(pid) { return pid !== sourcePageId; });
            // Include master if source is not master
            if (sourcePageId !== groupInfo.master) targetPages.push(groupInfo.master);
            var result = stageTokenToPages(token, targetPages);
            staged += result.cloned;
            if (result.failed) marketplaceFailures.push(result);
        });

        // Re-run linking for this group to pick up the new tokens
        if (staged > 0) {
            var groupDiscovered = discoverGroup(groupName);
            var allPageIds = [groupDiscovered.master].concat(Object.values(groupDiscovered.players).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pid) {
                findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(function(t) { autoPopulateLinkId(t); autoPopulateSyncConfig(t); });
            });
            var allLinks = [];
            Object.values(groupDiscovered.players).forEach(function(pInfo) {
                var links = resolveLinks(groupDiscovered.master, pInfo.pageId);
                links.forEach(function(l) { if (l.target) allLinks.push(l); });
            });
            establishLinks(groupName, groupDiscovered, allLinks);

            // Align synced properties from source tokens to newly linked children
            if (typeof Mirror !== 'undefined' && Mirror.align) {
                tokens.forEach(function(token) {
                    Mirror.align(token.get('id'), { ifLinked: true });
                });
            }
        }

        reply(msg, 'Stage', 'Staged ' + staged + ' token(s) to ' + targetPlayerIds.length + ' player page(s).');

        // Add linked copies to initiative if the staged token is already in the turn order
        if (staged > 0) {
            var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
            var turnIds = new Set(turnOrder.map(function(e) { return e.id; }));
            var added = 0;
            tokens.forEach(function(token) {
                var tokenId = token.get('id');
                if (!turnIds.has(tokenId)) return;
                var entry = turnOrder.find(function(e) { return e.id === tokenId; });
                if (!entry) return;
                var info = getLinkedInfo(tokenId);
                info.linkedIds.forEach(function(lid) {
                    if (turnIds.has(lid)) return;
                    var linkedObj = getObj('graphic', lid);
                    if (!linkedObj) return;
                    turnOrder.push({ id: lid, pr: entry.pr, custom: entry.custom || '', _pageid: linkedObj.get('_pageid') });
                    turnIds.add(lid);
                    added++;
                });
            });
            if (added > 0) {
                turnOrder = reorderInitiative(turnOrder);
                Campaign().set('turnorder', JSON.stringify(turnOrder));
                if (s.hud.initiative) {
                    if (s.hud.initData && s.hud.initData.entries) {
                        s.hud.initData.entries.forEach(function(e) {
                            if (e.sourceId.startsWith('custom:')) return;
                            var pin = getObj('pin', e.tokenId);
                            if (!pin) return;
                            var tagStr = computeHudTag(e.sourceId);
                            var sourceToken = getObj('graphic', e.sourceId);
                            var name = sourceToken ? (sourceToken.get('name') || '') : '';
                            pin.set('title', ((tagStr ? '⚠️ ' : '') + name).trim());
                            pin.set('notes', tagStr || '');
                        });
                    }
                    updateInitiativeHud();
                }
            }
        }

        if (marketplaceFailures.length > 0) {
            reply(msg, 'Stage', formatMarketplaceError(marketplaceFailures, '!gaslight stage'));
        }
    };

    /**
     * Auto-stage: when a token is added to a gaslit page and its character has gaslight_stage=1.
     */
    const onTokenAdded = (obj) => {
        var s = state[SCRIPT_NAME];
        var charId = obj.get('represents');
        if (!charId) return;

        // Check gaslight_stage attribute
        var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_stage' })[0];
        if (!attr || attr.get('current') !== '1') return;

        // Find which active group this page belongs to
        var pageId = obj.get('_pageid');
        var activeEntry = Object.entries(s.activeGroups).find(function(e) {
            if (e[1].masterPageId === pageId) return true;
            return Object.values(e[1].playerPages).some(function(p) { return p.pageId === pageId; });
        });
        if (!activeEntry) return;

        var groupName = activeEntry[0];
        var groupInfo = { master: activeEntry[1].masterPageId, players: activeEntry[1].playerPages };

        // Clone to all OTHER pages (master + players, excluding source page)
        var targetPages = [];
        if (pageId !== groupInfo.master) targetPages.push(groupInfo.master);
        Object.values(groupInfo.players).forEach(function(pInfo) {
            if (pInfo.pageId !== pageId) targetPages.push(pInfo.pageId);
        });
        var stageResult = stageTokenToPages(obj, targetPages);
        if (stageResult.failed) {
            sendChat(SCRIPT_NAME, '/w gm ' + formatMarketplaceError([{
                id: stageResult.id,
                name: stageResult.name,
                imgsrc: stageResult.imgsrc
            }], '!gaslight stage'));
        }

        // Re-link after a short delay to let createObj finish
        setTimeout(function() {
            var groupDiscovered = discoverGroup(groupName);
            var allPageIds = [groupDiscovered.master].concat(Object.values(groupDiscovered.players).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pid) {
                findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(function(t) { autoPopulateLinkId(t); autoPopulateSyncConfig(t); });
            });
            var allLinks = [];
            Object.values(groupDiscovered.players).forEach(function(pInfo) {
                var links = resolveLinks(groupDiscovered.master, pInfo.pageId);
                links.forEach(function(l) { if (l.target) allLinks.push(l); });
            });
            establishLinks(groupName, groupDiscovered, allLinks);

            // Align synced properties from source to newly linked children
            if (typeof Mirror !== 'undefined' && Mirror.align) {
                Mirror.align(obj.get('id'), { ifLinked: true });
            }
        }, 500);
    };

    const doConfig = (msg, args) => {
        var s = state[SCRIPT_NAME];
        if (args.length === 0) {
            var cmds = s.config.relayCommands.length > 0 ? s.config.relayCommands.join(', ') : '(none)';
            reply(msg, 'Config', '<b>relay-commands:</b> ' + cmds);
            return;
        }
        var sub = args.shift();
        if (sub === 'relay-add') {
            if (args.length === 0) { reply(msg, 'Error', 'Specify command(s) to add.'); return; }
            args.forEach(function(cmd) {
                if (s.config.relayCommands.indexOf(cmd) === -1) s.config.relayCommands.push(cmd);
            });
            reply(msg, 'Config', 'relay-commands: ' + s.config.relayCommands.join(', '));
        } else if (sub === 'relay-remove') {
            if (args.length === 0) { reply(msg, 'Error', 'Specify command(s) to remove.'); return; }
            s.config.relayCommands = s.config.relayCommands.filter(function(c) { return args.indexOf(c) === -1; });
            reply(msg, 'Config', 'relay-commands: ' + (s.config.relayCommands.length > 0 ? s.config.relayCommands.join(', ') : '(none)'));
        } else if (sub === 'relay-list') {
            var cmds = s.config.relayCommands.length > 0 ? s.config.relayCommands.join(', ') : '(none)';
            reply(msg, 'Config', 'relay-commands: ' + cmds);
        } else {
            reply(msg, 'Error', 'Usage: !gaslight config [relay-add|relay-remove|relay-list] [commands...]');
        }
    };

    const doStatus = (msg) => {
        const s = state[SCRIPT_NAME];
        const groups = Object.keys(s.activeGroups);

        // Also show all configured groups (not just active)
        const allGroups = discoverAllGroups();
        var out = '<b>Configured Groups:</b><br>';
        if (Object.keys(allGroups).length === 0) {
            out += '(none)<br>';
        } else {
            Object.entries(allGroups).forEach(function(entry) {
                var gn = entry[0], info = entry[1];
                var masterName = info.master ? (getObj('page', info.master) || {get:function(){return '?';}}).get('name') : '<b>NO MASTER</b>';
                var playerNames = Object.values(info.players).join(', ') || 'none';
                out += '<b>' + gn + '</b>: master="' + masterName + '", players=' + playerNames +
                    (groups.indexOf(gn) !== -1 ? ' [ACTIVE]' : '') + '<br>';
            });
        }

        if (groups.length > 0) {
            out += '<br><b>Active Splits:</b><br>';
            groups.forEach(function(gn) {
                var g = s.activeGroups[gn];
                out += '<b>' + gn + '</b>: ' +
                    Object.keys(g.playerPages).length + ' player(s), ' +
                    Object.keys(g.linkedTokens).length + ' parent(s)<br>';
            });
        }
        reply(msg, out);
    };

    /**
     * Discover ALL groups across all pages (not just one group).
     */
    const discoverAllGroups = () => {
        const pages = findObjs({ _type: 'page' });
        const groups = {};
        pages.forEach(function(page) {
            var configs = getConfigsOnPage(page.get('_id'));
            configs.forEach(function(c) {
                var gn = c.data.group;
                if (!groups[gn]) groups[gn] = { master: null, players: {} };
                if (c.data.player === 'GM') groups[gn].master = page.get('_id');
                else if (c.data.playerid) groups[gn].players[c.data.playerid] = c.data.player;
            });
        });
        return groups;
    };

    const doUngroup = (msg, args) => {
        const groupName = args[0];
        if (!groupName) { reply(msg, 'Error', 'Usage: !gaslight ungroup &lt;group&gt; &lt;player|GM|--all&gt;'); return; }
        args = args.slice(1);

        if (args.indexOf('--all') !== -1) {
            var removed = 0;
            findObjs({ _type: 'page' }).forEach(function(page) {
                var cfg = getGroupConfigOnPage(page.get('_id'), groupName);
                if (cfg) { cfg.obj.remove(); removed++; }
            });
            reply(msg, 'Ungroup', 'Removed all ' + removed + ' config(s) for group "' + groupName + '".');
                return;
        }

        var playerArg = args.join(' ').replace(/^["']|["']$/g, '');
        if (!playerArg) { reply(msg, 'Error', 'Specify a player name, GM, or --all.'); return; }

        // First try matching directly against stored player name in config
        var found = false;
        if (playerArg.toLowerCase() === 'gm' || playerArg.toLowerCase() === 'master') {
            findObjs({ _type: 'page' }).forEach(function(page) {
                var cfg = getGroupConfigOnPage(page.get('_id'), groupName);
                if (cfg && cfg.data.player === 'GM') {
                    cfg.obj.remove();
                    found = true;
                    reply(msg, 'Ungroup', 'Removed GM (master) from group "' + groupName + '" (page: ' + page.get('name') + ').');
                }
            });
        } else {
            // Try matching by stored player name first
            findObjs({ _type: 'page' }).forEach(function(page) {
                var cfg = getGroupConfigOnPage(page.get('_id'), groupName);
                if (!cfg || cfg.data.player === 'GM') return;
                if (cfg.data.player.toLowerCase() === playerArg.toLowerCase()) {
                    cfg.obj.remove();
                    found = true;
                    reply(msg, 'Ungroup', 'Removed "' + cfg.data.player + '" from group "' + groupName + '" (page: ' + page.get('name') + ').');
                }
            });

            // If no match by stored name, try resolving as a player and match by ID
            if (!found) {
                var resolved = resolvePlayer(msg, playerArg, CMD + ' ungroup ' + groupName);
                if (!resolved || resolved === 'ambiguous') return;
                findObjs({ _type: 'page' }).forEach(function(page) {
                    var cfg = getGroupConfigOnPage(page.get('_id'), groupName);
                    if (!cfg || cfg.data.player === 'GM') return;
                    if (cfg.data.playerid === resolved.id) {
                        cfg.obj.remove();
                        found = true;
                        reply(msg, 'Ungroup', 'Removed "' + resolved.name + '" from group "' + groupName + '" (page: ' + page.get('name') + ').');
                    }
                });
            }
        }

        if (!found) {
            reply(msg, 'Error', 'No config found for "' + playerArg + '" in group "' + groupName + '".');
        }
    };

    const checkDanglingGroups = () => {
        const allGroups = discoverAllGroups();
        var dangling = [];
        Object.entries(allGroups).forEach(function(entry) {
            if (!entry[1].master) dangling.push(entry[0]);
        });
        if (dangling.length > 0) {
            var out = '⚠️ Dangling groups with no master page:<br>';
            dangling.forEach(function(gn) {
                out += '<b>' + gn + '</b>: ';
                out += '<code>!gaslight ungroup ' + gn + ' --all</code> to remove, or ';
                out += '<code>!gaslight group ' + gn + ' GM</code> to assign a master.<br>';
            });
            sendChat(SCRIPT_NAME, '/w gm ' + out);
        }
    };

    const HELP_TEXT = '<b>' + SCRIPT_NAME + ' v' + SCRIPT_VERSION + '</b><br><br>'
        + '<code>' + CMD + ' setup &lt;group&gt;</code> -- Quick-configure from duplicated pages<br>'
        + '<code>' + CMD + ' quick [group]</code> -- Configure + split using copies/scratch pages<br>'
        + '<code>' + CMD + ' split &lt;group&gt;</code> -- Activate group<br>'
        + '<code>' + CMD + ' merge [group]</code> -- Tear down links<br>'
        + '<code>' + CMD + ' merge-all</code> -- End all active splits<br>'
        + '<code>' + CMD + ' test &lt;group&gt;</code> -- Dry-run linking<br>'
        + '<code>' + CMD + ' link [name|new] [ids...]</code> -- Link tokens<br>'
        + '<code>' + CMD + ' unlink [ids...]</code> -- Unlink tokens<br>'
        + '<code>' + CMD + ' sync [props|all|reset]</code> -- Manage sync per token<br>'
        + '<code>' + CMD + ' desync [props|all]</code> -- Exclude props from sync<br>'
        + '<code>' + CMD + ' var [--silent] [actions...]</code> -- Read/set/unset gl_ vars<br>'
        + '<code>' + CMD + ' view [master|off|&lt;player&gt;]</code> -- Control relay targeting<br>'
        + '<code>' + CMD + ' relay &lt;views&gt; &lt;!cmd&gt;</code> -- Relay command to views<br>'
        + '<code>' + CMD + ' group &lt;group&gt; &lt;player|GM&gt;</code> -- Assign page<br>'
        + '<code>' + CMD + ' ungroup &lt;group&gt; &lt;player|GM|--all&gt;</code> -- Remove config<br>'
        + '<code>' + CMD + ' stage [players...]</code> -- Propagate tokens to player pages<br>'
        + '<code>' + CMD + ' config [relay-add|relay-remove|relay-list]</code> -- Configure relay<br>'
        + '<code>' + CMD + ' status</code> -- Show state<br>'
        + '<code>' + CMD + ' --help</code> -- This help<br>'
        + '<br><b>View modes:</b><br>'
        + '<code>master</code> -- relay to all (default on split)<br>'
        + '<code>off</code> -- relay disabled (GM-only changes)<br>'
        + '<code>&lt;player&gt;</code> -- relay to one player only<br>'
        + '<br><b>Initiative:</b> Linked tokens auto-sync in turn order. Non-master children are auto-skipped on turn advance.<br>'
        + '<br><b>HUD:</b><br>'
        + '<code>' + CMD + ' hud</code> -- toggle all elements<br>'
        + '<code>' + CMD + ' hud [on|off|reset]</code> -- all elements<br>'
        + '<code>' + CMD + ' hud [init|view] [on|off|reset]</code> -- specific element<br>'
        + 'Aliases: init/turn/turns = initiative, relay = view<br>';

    // =========================================================================
    // Scripting Engine — Fetch Integration
    // =========================================================================

    /**
     * Read a gl_ field from a token's gmnotes.
     */
    const readGlField = (gmnotes, fieldName) => {
        var notes = gmnotes || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}
        notes = notes.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '');
        var rx = new RegExp(fieldName + '\\s*:\\s*(\\S+)');
        var match = notes.match(rx);
        return match ? match[1] : '';
    };

    /**
     * Register a gl_ field as a Fetch compProp on the graphic type.
     * Resolves from token gmnotes first, falls back to character attribute.
     */
    const registerGlCompProp = (fieldName) => {
        if (typeof Fetch === 'undefined' || !Fetch.CustomPropsByType) return;
        if (Fetch.CustomPropsByType.graphic.compProps[fieldName]) return;

        var valFn = function(o) {
            // Token gmnotes first, fallback to character attribute
            var tokenVal = readGlField(o.gmnotes, fieldName);
            if (tokenVal) return tokenVal;
            var charId = o.represents;
            var charVal = getAttrByName(charId, fieldName) || '';
            return charVal;
        };

        Fetch.CustomPropsByType.graphic.compProps[fieldName] = { nicks: [], val: valFn };
        // Also inject into the cached PropContainers so Fetch uses it immediately
        if (Fetch.PropContainers && Fetch.PropContainers.graphic) {
            Fetch.PropContainers.graphic[fieldName] = valFn;
        }
        log(SCRIPT_NAME + ': registered Fetch compProp "' + fieldName + '"');
    };

    /**
     * Scan a script for gl_ references and register compProps for each.
     */
    const registerCompPropsFromScript = (content) => {
        var text = content.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        var rx = /@\([^)]*\.(gl_[a-zA-Z0-9_]+)/g;
        var match;
        while ((match = rx.exec(text)) !== null) {
            registerGlCompProp(match[1]);
        }
    };

    /**
     * Scan all active script handouts and register compProps.
     * Called on split and when handouts change.
     */
    const registerAllCompProps = () => {
        var s = state[SCRIPT_NAME];
        Object.values(s.activeGroups).forEach(function(group) {
            var allPageIds = [group.masterPageId].concat(Object.values(group.playerPages).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pageId) {
                var pins = findScriptPins(pageId);
                pins.forEach(function(pin) {
                    getPinScript(pin, function(content) {
                        if (content) registerCompPropsFromScript(content);
                    });
                });
            });
        });
    };

    // =========================================================================
    // Scripting Engine — Trigger Map
    // =========================================================================

    // triggerMap: attributeName → [{ pinId, pageId }]
    var triggerMap = {};
    var knownScriptPins = []; // cached pin IDs + handout links from last buildTriggerMap

    /**
     * Parse a script's conditional blocks to find referenced attributes for auto-triggering.
     * Looks for @(target.gl_*) and @(viewer.*) inside {& if} blocks.
     */
    const parseTriggersFromScript = (content) => {
        var triggers = [];
        // Strip HTML for parsing
        var text = content.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

        // Find content inside {& if ...} blocks (simple regex — catches most cases)
        var ifRx = /\{&\s*if\s+(.+?)\}/gi;
        var match;
        while ((match = ifRx.exec(text)) !== null) {
            var condition = match[1];
            // Find @(target.*) and @(viewer.*) references in the condition
            var refRx = /@\((?:target|viewer)\.([^)]+)\)/g;
            var refMatch;
            while ((refMatch = refRx.exec(condition)) !== null) {
                var field = refMatch[1];
                if (triggers.indexOf(field) === -1) triggers.push(field);
            }
        }
        return triggers;
    };

    /**
     * Build the trigger map for all active script pins.
     * Called on split, and when handouts change.
     */
    const buildTriggerMap = () => {
        triggerMap = {};
        knownScriptPins = [];
        var s = state[SCRIPT_NAME];

        Object.values(s.activeGroups).forEach(function(group) {
            var allPageIds = [group.masterPageId].concat(Object.values(group.playerPages).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pageId) {
                var pins = findScriptPins(pageId);
                pins.forEach(function(pin) {
                    knownScriptPins.push({ pinId: pin.get('_id'), pageId: pageId, handoutId: pin.get('link') || null });
                    parsePinConfig(pin, function(config) {
                        if (!config) return;
                        var explicitTriggers = config.triggers.filter(function(t) { return t.startsWith('on change '); }).map(function(t) { return t.slice(10).trim(); });
                        var manualOnly = config.triggers.some(function(t) { return t === 'manual only'; });

                        if (manualOnly) return;

                        if (explicitTriggers.length > 0) {
                            explicitTriggers.forEach(function(field) {
                                if (!triggerMap[field]) triggerMap[field] = [];
                                triggerMap[field].push({ pinId: pin.get('_id'), pageId: pageId });
                            });
                        } else {
                            getPinScript(pin, function(content) {
                                if (!content) return;
                                var autoTriggers = parseTriggersFromScript(content);
                                var ignored = config.triggers.filter(function(t) { return t.startsWith('ignore '); }).map(function(t) { return t.slice(7).trim(); });
                                autoTriggers = autoTriggers.filter(function(t) { return ignored.indexOf(t) === -1; });

                                autoTriggers.forEach(function(field) {
                                    if (!triggerMap[field]) triggerMap[field] = [];
                                    triggerMap[field].push({ pinId: pin.get('_id'), pageId: pageId });
                                });
                            });
                        }
                    });
                });
            });
        });
    };

    /**
     * Rebuild triggerMap using cached pin IDs (works in non-chat contexts where findObjs fails for pins).
     * Uses getObj('pin', id) which works in all contexts.
     */
    const rebuildTriggerMapFromCache = () => {
        if (knownScriptPins.length === 0) return;
        triggerMap = {};
        knownScriptPins.forEach(function(cached) {
            var pin = getObj('pin', cached.pinId);
            if (!pin) return;
            parsePinConfig(pin, function(config) {
                if (!config) return;
                var explicitTriggers = config.triggers.filter(function(t) { return t.startsWith('on change '); }).map(function(t) { return t.slice(10).trim(); });
                var manualOnly = config.triggers.some(function(t) { return t === 'manual only'; });
                if (manualOnly) return;

                if (explicitTriggers.length > 0) {
                    explicitTriggers.forEach(function(field) {
                        if (!triggerMap[field]) triggerMap[field] = [];
                        triggerMap[field].push({ pinId: cached.pinId, pageId: cached.pageId });
                    });
                } else {
                    getPinScript(pin, function(content) {
                        if (!content) return;
                        registerCompPropsFromScript(content);
                        var autoTriggers = parseTriggersFromScript(content);
                        var ignored = config.triggers.filter(function(t) { return t.startsWith('ignore '); }).map(function(t) { return t.slice(7).trim(); });
                        autoTriggers = autoTriggers.filter(function(t) { return ignored.indexOf(t) === -1; });
                        autoTriggers.forEach(function(field) {
                            if (!triggerMap[field]) triggerMap[field] = [];
                            triggerMap[field].push({ pinId: cached.pinId, pageId: cached.pageId });
                        });
                    });
                }
            });
        });
    };

    /**
     * Handle attribute changes — check trigger map and re-evaluate affected pins.
     */
    const onAttributeChanged = (obj) => {
        var attrName = obj.get('name');
        var entries = triggerMap[attrName];
        if (!entries || entries.length === 0) return;

        entries.forEach(function(entry) {
            var pin = getObj('pin', entry.pinId);
            if (!pin) return;
            var fakeMsg = { playerid: 'API', who: 'API', type: 'api' };
            evaluatePins([pin], fakeMsg, false);
        });
    };

    /**
     * Handle token property changes — check trigger map for graphic properties.
     */
    const onGraphicPropChanged = (obj, prev) => {
        var changed = Object.keys(prev).filter(function(k) { return !k.startsWith('_') && prev[k] !== obj.get(k) && k !== 'gmnotes'; });
        if (changed.length === 0) return;

        var triggered = false;
        changed.forEach(function(prop) {
            var entries = triggerMap[prop];
            if (!entries || entries.length === 0) return;
            if (triggered) return; // only evaluate once per change event
            triggered = true;
            entries.forEach(function(entry) {
                var pin = getObj('pin', entry.pinId);
                if (!pin) return;
                var fakeMsg = { playerid: 'API', who: 'API', type: 'api' };
                evaluatePins([pin], fakeMsg, false);
            });
        });

        // Update turn indicator if the tracked token moved or resized
        var s = state[SCRIPT_NAME];
        if (s.hud.initData && s.hud.reticleData && s.hud.reticleData.tokenId === obj.get('id')) {
            if (changed.indexOf('left') !== -1 || changed.indexOf('top') !== -1 || changed.indexOf('width') !== -1 || changed.indexOf('height') !== -1) {
                updateTurnReticle();
            }
        }
    };
    const onGmNotesChanged = (obj, prev) => {
        if (!prev || !prev.gmnotes) return;
        var oldNotes = prev.gmnotes || '';
        var newNotes = obj.get('gmnotes') || '';
        try { oldNotes = decodeURIComponent(oldNotes); } catch(e) {}
        try { newNotes = decodeURIComponent(newNotes); } catch(e) {}

        // Parse gl_ fields from old and new
        var glRx = /gl_([a-zA-Z0-9_]+)\s*[=:]\s*(.+)/g;
        var oldFields = {};
        var newFields = {};
        var m;
        while ((m = glRx.exec(oldNotes)) !== null) oldFields['gl_' + m[1]] = m[2].trim();
        glRx.lastIndex = 0;
        while ((m = glRx.exec(newNotes)) !== null) newFields['gl_' + m[1]] = m[2].trim();

        // Find changed fields
        var changedFields = Object.keys(newFields).filter(function(k) { return oldFields[k] !== newFields[k]; });
        // Also check removed fields
        Object.keys(oldFields).forEach(function(k) { if (!(k in newFields) && changedFields.indexOf(k) === -1) changedFields.push(k); });

        changedFields.forEach(function(field) {
            var entries = triggerMap[field];
            if (!entries || entries.length === 0) return;
            // Find the master page counterpart of this token
            var tokenId = obj.get('id');
            var masterTokenId = null;
            var s = state[SCRIPT_NAME];
            Object.values(s.activeGroups).forEach(function(active) {
                // Check if this token is linked; find the master copy
                var allLinked = active.linkedTokens[tokenId] || [];
                Object.entries(active.linkedTokens).forEach(function(entry) {
                    if (entry[1].indexOf(tokenId) !== -1) allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
                });
                allLinked = allLinked.filter(function(id, i) { return allLinked.indexOf(id) === i; });
                allLinked.forEach(function(id) {
                    var t = getObj('graphic', id);
                    if (t && t.get('_pageid') === active.masterPageId) masterTokenId = id;
                });
                // If the token itself is on master
                if (obj.get('_pageid') === active.masterPageId) masterTokenId = tokenId;
            });

            entries.forEach(function(entry) {
                var pin = getObj('pin', entry.pinId);
                if (!pin) return;
                var fakeMsg = { playerid: 'API', who: 'API', type: 'api' };
                evaluatePins([pin], fakeMsg, false, masterTokenId, obj.get('_pageid'));
            });
        });
    };

    // =========================================================================
    // Scripting Engine
    // =========================================================================

    /**
     * Read a handout's notes content (async → callback pattern).
     * Returns content via callback since Roll20 requires it for notes/gmnotes.
     */
    const getHandoutContent = (handoutId, callback) => {
        var handout = getObj('handout', handoutId);
        if (!handout) { callback(null); return; }
        handout.get('notes', function(notes) {
            if (!notes) { callback(''); return; }
            var text = decodeURIComponent(notes)
                .replace(/<\/p>\s*<p[^>]*>/gi, '\n')
                .replace(/<br\s*\/?>/gi, '\n')
                .replace(/<\/?[^>]+>/g, '')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>');
            callback(text);
        });
    };

    /**
     * Find pins on a page that are gaslight script pins.
     * A pin is a script pin if:
     * - It links to a handout (script in handout notes, config in handout gmNotes or pin gmNotes)
     * - OR it has ---GASLIGHT-SCRIPT--- in its own gmNotes (self-contained)
     */
    const isScriptPin = (pin) => {
        if (pin.get('_type') !== 'pin') return false;
        // Handout-linked pin: only a Gaslight script pin if the linked handout
        // is a Gaslight script (its name carries the [GLS] prefix).
        if (pin.get('link') && pin.get('linkType') === 'handout') {
            var handout = getObj('handout', pin.get('link'));
            if (handout && /^\[GLS\]\s*/i.test(handout.get('name') || '')) return true;
        }
        // Self-contained script pin marker in gmNotes.
        var notes = pin.get('gmNotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}
        return notes.indexOf('---GASLIGHT-SCRIPT---') !== -1;
    };

    const findScriptPins = (pageId) => {
        var pins = findObjs({ _type: 'pin', _pageid: pageId });
        return pins.filter(isScriptPin);
    };

    /**
     * Parse pin configuration. Checks pin gmNotes first, falls back to linked handout gmNotes.
     */
    const parsePinConfig = (pin, callback) => {
        var notes = pin.get('gmNotes') || '';
        try { notes = decodeURIComponent(notes); } catch(e) {}

        // If pin has its own config, use it
        if (notes.indexOf('---GASLIGHT-SCRIPT---') !== -1) {
            callback(parseConfigText(notes));
            return;
        }

        // Fall back to linked handout's gmNotes
        var handoutId = pin.get('link');
        if (handoutId) {
            var handout = getObj('handout', handoutId);
            if (handout) {
                handout.get('gmnotes', function(gmnotes) {
                    gmnotes = gmnotes || '';
                    try { gmnotes = decodeURIComponent(gmnotes); } catch(e) {}
                    if (gmnotes.indexOf('---GASLIGHT-SCRIPT---') !== -1) {
                        callback(parseConfigText(gmnotes));
                    } else {
                        // No config found, use defaults
                        callback({ filter: 'all', triggers: [] });
                    }
                });
                return;
            }
        }
        callback(null);
    };

    /**
     * Parse config text into structured object.
     */
    const parseConfigText = (text) => {
        var config = { filter: 'all', triggers: [] };
        // Strip HTML and normalize line breaks
        text = text.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        text.split('\n').forEach(function(line) {
            line = line.trim();
            if (line.startsWith('filter:')) config.filter = line.slice(7).trim();
            else if (line.startsWith('trigger:')) config.triggers.push(line.slice(8).trim());
        });
        return config;
    };

    /**
     * Get the script content for a pin.
     * Linked pin: from handout notes. Self-contained: from pin notes.
     */
    const getPinScript = (pin, callback) => {
        var handoutId = pin.get('link');
        if (handoutId) {
            getHandoutContent(handoutId, callback);
        } else {
            // Self-contained: script in pin notes
            var notes = pin.get('notes') || '';
            try { notes = decodeURIComponent(notes); } catch(e) {}
            callback(notes);
        }
    };

    /**
     * Get target tokens for evaluation based on pin config filter.
     */
    const getTargetTokens = (pageId, config, activeGroups) => {
        var tokens = findObjs({ _type: 'graphic', _pageid: pageId, _subtype: 'token' });
        var filter = config.filter.toLowerCase();
        if (filter === 'all') return tokens;
        if (filter === 'characters') {
            return tokens.filter(function(t) { return !!t.get('represents'); });
        }
        if (filter === 'npc') {
            return tokens.filter(function(t) {
                var charId = t.get('represents');
                if (!charId) return false;
                var character = getObj('character', charId);
                if (!character) return false;
                var cb = character.get('controlledby') || '';
                return !cb || cb === '';
            });
        }
        if (filter.startsWith('has ')) {
            var field = filter.slice(4).trim();
            return tokens.filter(function(t) {
                // Check gmnotes
                var notes = t.get('gmnotes') || '';
                try { notes = decodeURIComponent(notes); } catch(e) {}
                if (notes.indexOf(field + ':') !== -1 || notes.indexOf(field + ' :') !== -1) return true;
                // Check character attribute
                var charId = t.get('represents');
                if (charId) {
                    var attr = findObjs({ _type: 'attribute', _characterid: charId, name: field })[0];
                    if (attr) return true;
                }
                return false;
            });
        }
        return tokens;
    };

    /**
     * Find the linked counterpart of a token on a specific page.
     */
    const findLinkedTokenOnPage = (sourceToken, targetPageId) => {
        var s = state[SCRIPT_NAME];
        var sourceId = sourceToken.get('id');
        var linkedIds = [];
        Object.values(s.activeGroups).forEach(function(active) {
            var allLinked = active.linkedTokens[sourceId] || [];
            Object.entries(active.linkedTokens).forEach(function(entry) {
                if (entry[1].indexOf(sourceId) !== -1) allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
            });
            allLinked.filter(function(id, i) { return allLinked.indexOf(id) === i && id !== sourceId; }).forEach(function(id) {
                linkedIds.push(id);
            });
        });
        for (var i = 0; i < linkedIds.length; i++) {
            var obj = getObj('graphic', linkedIds[i]);
            if (obj && obj.get('_pageid') === targetPageId) return obj;
        }
        return null;
    };

    /**
     * Evaluate a script for a specific target token and viewer.
     * Resolves target to the linked copy on the viewer's page.
     */
    // ─── Viewer Aggregation ────────────────────────────────────────────────────

    const OPS = ['>=', '<=', '!=', '!~', '=', '~', '>', '<'];

    /**
     * Find `search` in `str` starting at `startIdx`, skipping quoted regions.
     * Returns index or -1.
     */
    const findUnquoted = (str, search, startIdx) => {
        var inQuote = null;
        for (var i = startIdx || 0; i <= str.length - search.length; i++) {
            var ch = str[i];
            if (inQuote) { if (ch === inQuote) inQuote = null; continue; }
            if (ch === '"' || ch === "'" || ch === '`') { inQuote = ch; continue; }
            if (str.slice(i, i + search.length) === search) return i;
        }
        return -1;
    };

    /**
     * Find the matching close paren for an open paren at `start`.
     * Skips quoted strings. Returns index of closing paren or -1.
     */
    const findCloseParen = (str, start) => {
        var depth = 0;
        var inQuote = null;
        for (var i = start; i < str.length; i++) {
            var ch = str[i];
            if (inQuote) { if (ch === inQuote) inQuote = null; continue; }
            if (ch === '"' || ch === "'" || ch === '`') { inQuote = ch; continue; }
            if (ch === '(') depth++;
            else if (ch === ')') { depth--; if (depth === 0) return i; }
        }
        return -1;
    };

    /**
     * Extract operator and RHS starting at `pos` in `str`.
     * Respects quotes and balanced parens. Stops at unbalanced ), ||, &&, or }.
     * Returns { op, rhs, end } or null.
     */
    const extractOpRhs = (str, pos) => {
        var rest = str.slice(pos).replace(/^\s*/, '');
        var offset = pos + (str.slice(pos).length - rest.length);
        for (var i = 0; i < OPS.length; i++) {
            if (rest.startsWith(OPS[i])) {
                var afterOp = rest.slice(OPS[i].length).replace(/^\s*/, '');
                var opEnd = offset + OPS[i].length + (rest.slice(OPS[i].length).length - afterOp.length);
                var rhs = '';
                var depth = 0;
                var inQ = null;
                var j = 0;
                for (; j < afterOp.length; j++) {
                    var c = afterOp[j];
                    if (inQ) { if (c === inQ) inQ = null; rhs += c; continue; }
                    if (c === '"' || c === "'" || c === '`') { inQ = c; rhs += c; continue; }
                    if (c === '(') { depth++; rhs += c; continue; }
                    if (c === ')') { if (depth === 0) break; depth--; rhs += c; continue; }
                    if (depth === 0 && j + 1 < afterOp.length && (afterOp.slice(j, j + 2) === '||' || afterOp.slice(j, j + 2) === '&&')) break;
                    if (c === '}') break;
                    rhs += c;
                }
                return { op: OPS[i], rhs: rhs.trim(), end: opEnd + j };
            }
        }
        return null;
    };

    /**
     * Extract operator and LHS ending at `pos` in `str`.
     * Respects quotes and balanced parens. Stops at unbalanced (, ||, &&, or {&.
     * Returns { op, lhs, start } or null.
     */
    const extractOpLhs = (str, pos) => {
        var before = str.slice(0, pos).replace(/\s*$/, '');
        for (var i = 0; i < OPS.length; i++) {
            if (before.endsWith(OPS[i])) {
                var beforeOp = before.slice(0, -OPS[i].length).replace(/\s*$/, '');
                var lhs = '';
                var depth = 0;
                var inQ = null;
                var j = beforeOp.length - 1;
                for (; j >= 0; j--) {
                    var c = beforeOp[j];
                    if (inQ) { if (c === inQ) inQ = null; lhs = c + lhs; continue; }
                    if (c === '"' || c === "'" || c === '`') { inQ = c; lhs = c + lhs; continue; }
                    if (c === ')') { depth++; lhs = c + lhs; continue; }
                    if (c === '(') { if (depth === 0) break; depth--; lhs = c + lhs; continue; }
                    if (j > 0 && (beforeOp.slice(j - 1, j + 1) === '||' || beforeOp.slice(j - 1, j + 1) === '&&')) { break; }
                    lhs = c + lhs;
                }
                return { op: OPS[i], lhs: lhs.trim(), start: j + 1 };
            }
        }
        return null;
    };

    /**
     * Expand any()/all()/max()/min() viewer aggregates.
     * Sweep 1: any (LHS then RHS)
     * Sweep 2: all (LHS then RHS)
     * Sweep 3: max/min (resolve to literal)
     */
    const expandAggregates = (content, ids, namespace) => {
        if (ids.length === 0) return content;
        content = expandAggregate(content, 'any', '||', ids, namespace);
        content = expandAggregate(content, 'all', '&&', ids, namespace);
        content = resolveMaxMin(content, ids, namespace);
        content = resolveJoin(content, ids, namespace);
        return content;
    };

    const expandAggregate = (content, funcName, joiner, ids, namespace) => {
        var search = funcName + '(';
        var nsRx = new RegExp('@\\(' + namespace + '\\.', 'g');
        var idx = findUnquoted(content, search, 0);
        while (idx !== -1) {
            if (idx > 0 && /\w/.test(content[idx - 1])) { idx = findUnquoted(content, search, idx + 1); continue; }
            var closeIdx = findCloseParen(content, idx + funcName.length);
            if (closeIdx === -1) break;

            var inner = content.slice(idx + funcName.length + 1, closeIdx);
            // Only expand if this aggregate contains our namespace
            if (inner.indexOf('@(' + namespace + '.') === -1) { idx = findUnquoted(content, search, idx + 1); continue; }

            var beforeAgg = content.slice(0, idx);
            var afterAgg = content.slice(closeIdx + 1);

            var opRhs = extractOpRhs(afterAgg, 0);
            if (opRhs) {
                var expanded = '(' + ids.map(function(id) {
                    return inner.replace(nsRx, '@(' + id + '.') + ' ' + opRhs.op + ' ' + opRhs.rhs;
                }).join(' ' + joiner + ' ') + ')';
                content = beforeAgg + expanded + afterAgg.slice(opRhs.end);
            } else {
                var opLhs = extractOpLhs(beforeAgg, beforeAgg.length);
                if (opLhs) {
                    var expanded = '(' + ids.map(function(id) {
                        return opLhs.lhs + ' ' + opLhs.op + ' ' + inner.replace(nsRx, '@(' + id + '.');
                    }).join(' ' + joiner + ' ') + ')';
                    content = beforeAgg.slice(0, opLhs.start) + expanded + afterAgg;
                } else {
                    var expanded = '(' + ids.map(function(id) {
                        return inner.replace(nsRx, '@(' + id + '.');
                    }).join(' ' + joiner + ' ') + ')';
                    content = beforeAgg + expanded + afterAgg;
                }
            }

            idx = findUnquoted(content, search, idx + 1);
        }
        return content;
    };

    const resolveMaxMin = (content, ids, namespace) => {
        var nsRx = new RegExp('@\\(' + namespace + '\\.', 'g');
        var nsCheck = '@(' + namespace + '.';
        ['max', 'min'].forEach(function(fn) {
            var search = fn + '(';
            var idx = findUnquoted(content, search, 0);
            while (idx !== -1) {
                if (idx > 0 && /\w/.test(content[idx - 1])) { idx = findUnquoted(content, search, idx + 1); continue; }
                var closeIdx = findCloseParen(content, idx + fn.length);
                if (closeIdx === -1) break;
                var inner = content.slice(idx + fn.length + 1, closeIdx);
                if (inner.indexOf(nsCheck) !== -1) {
                    var expanded = '{& math ' + fn + '(' + ids.map(function(id) {
                        return inner.replace(nsRx, '@(' + id + '.');
                    }).join(', ') + ')}';
                    content = content.slice(0, idx) + expanded + content.slice(closeIdx + 1);
                }
                idx = findUnquoted(content, search, idx + 1);
            }
        });
        return content;
    };

    const resolveJoin = (content, ids, namespace) => {
        var nsRx = new RegExp('@\\(' + namespace + '\\.', 'g');
        var nsCheck = '@(' + namespace + '.';
        var search = 'join(';
        var idx = findUnquoted(content, search, 0);
        while (idx !== -1) {
            if (idx > 0 && /\w/.test(content[idx - 1])) { idx = findUnquoted(content, search, idx + 1); continue; }
            var closeIdx = findCloseParen(content, idx + 4);
            if (closeIdx === -1) break;
            var inner = content.slice(idx + 5, closeIdx);
            if (inner.indexOf(nsCheck) !== -1) {
                // Check for optional delimiter: join(@(viewer.field), ",")
                var parts = inner.split(',');
                var field = parts[0].trim();
                var delim = ' ';
                if (parts.length > 1) {
                    var rawDelim = parts.slice(1).join(',').trim();
                    delim = rawDelim.replace(/^['"`]|['"`]$/g, '');
                }
                var expanded = ids.map(function(id) {
                    return field.replace(nsRx, '@(' + id + '.');
                }).join(delim);
                content = content.slice(0, idx) + expanded + content.slice(closeIdx + 1);
            }
            idx = findUnquoted(content, search, idx + 1);
        }
        return content;
    };

    const evaluateScript = (scriptContent, targetToken, viewerPlayerId, viewerPageId, config, msg, dryRun) => {
        // Find the linked token on the viewer's page
        var viewerTarget = findLinkedTokenOnPage(targetToken, viewerPageId);
        if (!viewerTarget) return;


        var content = scriptContent;
        // Replace remaining @(target.*) with token ID — Fetch resolves native props
        content = content.replace(/@\(target\./g, '@(' + viewerTarget.get('id') + '.');
        // Replace @(gm_target.*) with master page token ID
        content = content.replace(/@\(gm_target\./g, '@(' + targetToken.get('id') + '.');
        // Resolve viewer tokens for aggregation
        var viewerTokens = findObjs({ _type: 'graphic', _pageid: viewerPageId, _subtype: 'token' }).filter(function(t) {
            var cid = t.get('represents');
            if (!cid) return false;
            var c = getObj('character', cid);
            if (!c) return false;
            var cb = c.get('controlledby') || '';
            return cb === 'all' || cb.split(',').indexOf(viewerPlayerId) !== -1;
        });
        var viewerIds = viewerTokens.map(function(t) { return t.get('id'); });

        // Resolve GM tokens on master page for gm.* aggregation
        var masterPageId = targetToken.get('_pageid');
        var gmTokens = findObjs({ _type: 'graphic', _pageid: masterPageId, _subtype: 'token' }).filter(function(t) {
            var cid = t.get('represents');
            if (!cid) return false;
            var c = getObj('character', cid);
            if (!c) return false;
            var cb = c.get('controlledby') || '';
            return !cb || cb.split(',').every(function(id) { return id.trim() === '' || playerIsGM(id.trim()); });
        });
        var gmIds = gmTokens.map(function(t) { return t.get('id'); });

        // Expand any()/all()/max()/min() aggregates for viewer.* and gm.*
        content = expandAggregates(content, viewerIds, 'viewer');
        content = expandAggregates(content, gmIds, 'gm');

        // Error check: bare @(viewer.*) or @(gm.*) without aggregate
        if (content.indexOf('@(viewer.') !== -1) {
            whisper('⚠️ Script error: <code>@(viewer.*)</code> must be inside any(), all(), max(), or min()');
            return;
        }
        if (content.indexOf('@(gm.') !== -1) {
            whisper('⚠️ Script error: <code>@(gm.*)</code> must be inside any(), all(), max(), or min()');
            return;
        }

        var lines = content.split('\n').map(function(l) {
            var ci = l.indexOf('//');
            return (ci !== -1 ? l.slice(0, ci) : l).trim();
        }).filter(function(l) {
            return l && (l.startsWith('!') || l.startsWith('{&'));
        });

        var dryRunPrefix = dryRun ?
            CMD + ' --echo ' + viewerPlayerId + ' ' + viewerTarget.get('id') + ' ' :
            '';
        var selectSuffix = ' {& select ' + viewerTarget.get('id') + '}\n';
        var fullCmd = dryRunPrefix + lines.join(selectSuffix + dryRunPrefix) + selectSuffix;

        var senderId = msg.playerid;
        if (senderId === 'API') {
            var gmPlayer = findObjs({ _type: 'player' }).find(function(p) { return playerIsGM(p.get('_id')); });
            if (gmPlayer) senderId = gmPlayer.get('_id');
        }
        var batch = '!{{\n'
            + CMD + ' --script-lock\n'
            + fullCmd
            + '(^)!^gaslight --script-unlock\n'
            + '}}';
        sendChat(getPlayerName(senderId), batch);
    };

    /**
     * Evaluate all scripts on pins for a given page.
     */
    const evaluatePins = (pins, msg, dryRun, targetTokenId, sourcePageId) => {
        var s = state[SCRIPT_NAME];
        pins.forEach(function(pin) {
            var pageId = pin.get('_pageid');

            // Find the active group for this page
            var activeEntry = Object.entries(s.activeGroups).find(function(e) {
                return e[1].masterPageId === pageId || Object.values(e[1].playerPages).some(function(p) { return p.pageId === pageId; });
            });
            if (!activeEntry) return;

            var groupInfo = activeEntry[1];

            // Determine which viewers to evaluate for based on pin placement
            var viewers;
            if (pageId === groupInfo.masterPageId) {
                viewers = Object.entries(groupInfo.playerPages);
            } else {
                var playerEntry = Object.entries(groupInfo.playerPages).find(function(e) { return e[1].pageId === pageId; });
                viewers = playerEntry ? [playerEntry] : [];
            }
            // If triggered from a specific player page, narrow to that viewer only
            if (sourcePageId && sourcePageId !== groupInfo.masterPageId) {
                var sourceViewer = Object.entries(groupInfo.playerPages).find(function(e) { return e[1].pageId === sourcePageId; });
                if (sourceViewer) viewers = [sourceViewer];
            }
            if (viewers.length === 0) return;

            // Get targets from master page (source of truth for token list)
            var targets = getTargetTokens(groupInfo.masterPageId, { filter: 'all' }, s.activeGroups);

            parsePinConfig(pin, function(config) {
                if (!config) return;
                // Re-filter targets based on config
                targets = getTargetTokens(groupInfo.masterPageId, config, s.activeGroups);
                // If triggered by a specific token, only evaluate that one
                if (targetTokenId) {
                    targets = targets.filter(function(t) { return t.get('id') === targetTokenId; });
                    if (targets.length === 0) return;
                }

                getPinScript(pin, function(content) {
                    if (!content) return;
                    // Strip HTML tags from content
                    content = content.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

                    if (dryRun) {
                        var handout = pin.get('link') ? getObj('handout', pin.get('link')) : null;
                        var pinTitle = stripGlsTag(pin.get('title') || (handout && handout.get('name')) || pin.get('_id'));
                        sendChat('player|' + msg.playerid, CMD + ' --echo-header ' + pinTitle);
                    }

                    // Evaluate for each viewer + target combination
                    viewers.forEach(function(entry) {
                        var viewerPlayerId = entry[0];
                        var viewerPageId = entry[1].pageId;
                        targets.forEach(function(target) {
                            evaluateScript(content, target, viewerPlayerId, viewerPageId, config, msg, dryRun);
                        });
                    });
                });
            });
        });
    };

    /**
     * !gaslight eval [--dry] [--all | <handout_name>]
     * With pins selected: evaluate those pins.
     * With --all: evaluate all active pins.
     * With handout name: evaluate all pins linked to that handout.
     */
    const doEval = (msg, args) => {
        var dryRun = args.indexOf('--dry-run') !== -1;
        args = args.filter(function(a) { return a !== '--dry-run'; });

        var pins = [];

        if (args.indexOf('--all') !== -1) {
            // All active gaslit pages
            var s = state[SCRIPT_NAME];
            Object.values(s.activeGroups).forEach(function(group) {
                var allPageIds = [group.masterPageId].concat(Object.values(group.playerPages).map(function(p) { return p.pageId; }));
                allPageIds.forEach(function(pid) {
                    pins = pins.concat(findScriptPins(pid));
                });
            });
        } else if (args.length > 0) {
            // By handout name
            var handoutName = args.join(' ');
            var handout = findObjs({ _type: 'handout', name: handoutName })[0];
            if (!handout) { reply(msg, 'Error', 'Handout "' + handoutName + '" not found.'); return; }
            var allPins = findObjs({ _type: 'pin' });
            pins = allPins.filter(function(p) { return p.get('link') === handout.get('_id'); });
        } else if (msg.selected && msg.selected.length > 0) {
            // Selected pins
            msg.selected.forEach(function(sel) {
                var obj = getObj(sel._type, sel._id);
                if (obj && obj.get('_type') === 'pin') pins.push(obj);
            });
        }

        if (pins.length === 0) { reply(msg, 'Error', 'No pins found. Select pins, provide a handout name, or use --all.'); return; }

        reply(msg, 'Eval', 'Evaluating ' + pins.length + ' pin(s)' + (dryRun ? ' (dry run)' : '') + '...');
        evaluatePins(pins, msg, dryRun);
    };

    // =========================================================================
    // Command Router
    // =========================================================================

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD) return;
        if (!playerIsGM(msg.playerid) && msg.playerid !== 'API') return;

        // ScriptKit handles help, man, examples, whatsnew, gen-help, gen-dev-docs
        if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;

        const rawArgs = msg.content.slice(CMD.length).trim();
        const args = [];
        var argRx = /"([^"]*)"|'([^']*)'|`([^`]*)`|(\S+)/g;
        var argMatch;
        while ((argMatch = argRx.exec(rawArgs)) !== null) {
            args.push(argMatch[1] !== undefined ? argMatch[1] : argMatch[2] !== undefined ? argMatch[2] : argMatch[3] !== undefined ? argMatch[3] : argMatch[4]);
        }
        const sub = (args.shift() || '').toLowerCase();

        switch (sub) {
            case 'setup':   doSetup(msg, args);   break;
            case 'quick':   doQuick(msg, args);   break;
            case 'split':   doSplit(msg, args);   break;
            case 'merge':   doMerge(msg, args);   break;
            case 'merge-all': doMergeAll(msg);    break;
            case 'test':    doTest(msg, args);    break;
            case 'link':    doLink(msg, args);    break;
            case 'unlink':  doUnlink(msg, args);  break;
            case 'sync':    doSync(msg, args);    break;
            case 'desync':  doDesync(msg, args);  break;
            case 'var':     doVar(msg, args);     break;
            case 'group':   doGroup(msg, args);   break;
            case 'ungroup': doUngroup(msg, args); break;
            case 'relay':   doRelay(msg, args);   break;
            case 'view':    doView(msg, args);    break;
            case 'stage':   doStage(msg, args);   break;
            case 'config':  doConfig(msg, args);  break;
            case 'hud':     doHud(msg, args);     break;
            case 'init':    doInit(msg, args);    break;
            case 'eval':    doEval(msg, args);    break;
            case 'status':  doStatus(msg);        break;
            case '--script-lock':
                scripting = true;
                // WORKAROUND: API sendChat sets playerid='API', Fetch denies char access.
                // Temporarily enable playerscanids. TODO: remove when Fetch treats API as GM.
                if (state.Fetch && state.Fetch.settings) {
                    state[SCRIPT_NAME]._fetchPcidBackup = state.Fetch.settings.playerscanids;
                    state.Fetch.settings.playerscanids = true;
                }
                return;
            case '--script-unlock':
                scripting = false;
                if (state.Fetch && state.Fetch.settings && state[SCRIPT_NAME].hasOwnProperty('_fetchPcidBackup')) {
                    state.Fetch.settings.playerscanids = state[SCRIPT_NAME]._fetchPcidBackup;
                    delete state[SCRIPT_NAME]._fetchPcidBackup;
                }
                return;
            case '--assign-capture': {
                // Format: --assign-capture <rollName> <charId> <cap=val> ...
                var acRollName = args[0];
                var acCharId = args[1];
                var acCaptures = {};
                args.slice(2).forEach(function(a) {
                    var eq = a.indexOf('=');
                    if (eq > 0) acCaptures[a.slice(0, eq)] = a.slice(eq + 1);
                });
                var acTokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(function(t) {
                    return t && t.get('represents') === acCharId;
                });
                if (acTokens.length === 0) return reply(msg, 'Error', 'Select token(s) representing this character.');
                acTokens.forEach(function(t) { writeCapturesToToken(t, acRollName, acCaptures); });
                reply(msg, 'Capture', 'Assigned ' + acRollName + ' to ' + acTokens.length + ' token(s).');
                return;
            }
            case '--clear-capture': {
                // Format: --clear-capture <rollName> <charId>
                var ccRollName = args[0];
                var ccCharId = args[1];
                var ccTokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(function(t) {
                    return t && t.get('represents') === ccCharId;
                });
                if (ccTokens.length === 0) return reply(msg, 'Error', 'Select token(s) representing this character.');
                ccTokens.forEach(function(t) {
                    var gmnotes = decodeURIComponent(t.get('gmnotes') || '');
                    gmnotes = gmnotes.replace(new RegExp('(^|\\n)gl_' + ccRollName + '_[^=]+=([^\\n]*)', 'g'), '');
                    t.set('gmnotes', gmnotes.trim());
                });
                reply(msg, 'Capture', 'Cleared ' + ccRollName + ' overrides from ' + ccTokens.length + ' token(s).');
                return;
            }
            case '--echo': {
                // Internal: dry-run echo. Format: !gaslight --echo <viewerId> <targetId> <command>
                var echoRaw = msg.content.slice(msg.content.indexOf('--echo') + 6).trim();
                var [echoViewerId, echoTargetId] = echoRaw.split(' ');
                var echoCmd = echoRaw.slice(echoViewerId.length + 1 + echoTargetId.length + 1);
                var echoViewer = getObj('player', echoViewerId);
                var echoTarget = getObj('graphic', echoTargetId);
                var viewerName = echoViewer ? echoViewer.get('_displayname') : echoViewerId;
                var echoTargetName = echoTarget ? echoTarget.get('name') : '';
                var targetDisplay = echoTargetName ? echoTargetName + ' <small><code>' + echoTargetId + '</code></small>' : '<code>' + echoTargetId + '</code>';
                reply(msg, 'Eval', '<b>Dry run</b><br><b>Target:</b> ' + targetDisplay + '<br><b>Viewer:</b> ' + viewerName + ' <small><code>' + echoViewerId + '</code></small><br><code>' + echoCmd + '</code>');
                break;
            }
            case '--echo-header': {
                // Internal: dry-run pin header
                var headerContent = msg.content.slice(msg.content.indexOf('--echo-header') + 13).trim();
                reply(msg, 'Eval', '<b>Pin:</b> ' + headerContent);
                break;
            }
            case '--dump-token': {
                var sel = (msg.selected || []).map(function(s) { return getObj(s._type, s._id); }).filter(Boolean);
                sel.forEach(function(obj) {
                    log(SCRIPT_NAME + ' [dump-token ' + obj.get('id') + ']: ' + JSON.stringify(obj));
                });
                reply(msg, 'Debug', 'Dumped ' + sel.length + ' token(s) to API console.');
                break;
            }
            case '--dump-html': {
                // Debug: dump raw content to console for selected pins/tokens or named character
                if (args.length > 0) {
                    var charName = args.join(' ');
                    var charObj = findObjs({ _type: 'character', name: charName })[0];
                    if (charObj) {
                        charObj.get('bio', function(bio) { log(SCRIPT_NAME + ' [char "' + charName + '" bio]: ' + JSON.stringify(bio)); });
                        charObj.get('gmnotes', function(gn) { log(SCRIPT_NAME + ' [char "' + charName + '" gmnotes]: ' + JSON.stringify(gn)); });
                    } else {
                        reply(msg, 'Error', 'Character "' + charName + '" not found.');
                    }
                    break;
                }
                var sel = (msg.selected || []).map(function(s) { return getObj(s._type, s._id); }).filter(Boolean);
                sel.forEach(function(obj) {
                    var type = obj.get('_type') || obj.get('type');
                    if (type === 'pin') {
                        var handoutId = obj.get('link');
                        if (handoutId) {
                            var ho = getObj('handout', handoutId);
                            if (ho) {
                                ho.get('gmnotes', function(gn) { log(SCRIPT_NAME + ' [handout gmnotes]: ' + JSON.stringify(gn)); });
                                ho.get('notes', function(n) { log(SCRIPT_NAME + ' [handout notes]: ' + JSON.stringify(n)); });
                            }
                        } else {
                            log(SCRIPT_NAME + ' [pin gmNotes]: ' + JSON.stringify(obj.get('gmNotes')));
                            log(SCRIPT_NAME + ' [pin notes]: ' + JSON.stringify(obj.get('notes')));
                        }
                    } else if (type === 'graphic') {
                        log(SCRIPT_NAME + ' [token ' + (obj.get('name') || obj.get('id')) + ' gmnotes]: ' + JSON.stringify(obj.get('gmnotes')));
                    } else if (type === 'character') {
                        obj.get('bio', function(bio) { log(SCRIPT_NAME + ' [char ' + obj.get('name') + ' bio]: ' + JSON.stringify(bio)); });
                        obj.get('gmnotes', function(gn) { log(SCRIPT_NAME + ' [char ' + obj.get('name') + ' gmnotes]: ' + JSON.stringify(gn)); });
                    }
                });
                break;
            }
            case '--help':  reply(msg, HELP_TEXT); break;
            default:
                if (typeof ScriptKit !== 'undefined') ScriptKit.usage(msg);
                else reply(msg, HELP_TEXT);
                break;
        }
    };

    // =========================================================================
    // RollCapture Integration
    // =========================================================================

    const registerWithRollCapture = () => {
        if (typeof RollCapture === 'undefined' || !RollCapture.onCapture) return;
        RollCapture.onCapture(SCRIPT_NAME, onCaptureReceived);
    };

    const onCaptureReceived = (event) => {
        var s = state[SCRIPT_NAME];
        if (Object.keys(s.activeGroups).length === 0) return;

        var { charName, charId, rollName, captures, playerId, msg } = event;
        var selected = (msg && msg.selected) || [];

        // Always write to character attribute
        if (charId) {
            Object.entries(captures).forEach(function(entry) {
                var attrName = 'gl_' + rollName + '_' + entry[0];
                var val = entry[1];
                var attr = findObjs({ type: 'attribute', _characterid: charId, name: attrName })[0];
                if (val === undefined) {
                    if (attr) attr.remove();
                } else {
                    if (attr) attr.set('current', String(val));
                    else createObj('attribute', { _characterid: charId, name: attrName, current: String(val) });
                }
            });
        }

        // Token assignment — only count tokens representing this character
        var tokens = selected.map(function(sel) { return getObj(sel._type, sel._id); }).filter(function(t) {
            return t && t.get('represents') === charId;
        });

        // Fallback: if no selection, find tokens of this character on master pages
        if (tokens.length === 0 && charId) {
            var masterPageIds = Object.values(s.activeGroups).map(function(g) { return g.masterPageId; });
            tokens = findObjs({ _type: 'graphic', _subtype: 'token', represents: charId }).filter(function(t) {
                return masterPageIds.indexOf(t.get('_pageid')) !== -1;
            });
        }

        if (tokens.length === 1) {
            writeCapturesToToken(tokens[0], rollName, captures);
        } else {
            // Only prompt if any captured field is referenced by an active script
            var hasRelevantTrigger = Object.keys(captures).some(function(cap) {
                return triggerMap['gl_' + rollName + '_' + cap];
            });
            if (hasRelevantTrigger) {
                var captureArgs = Object.entries(captures).map(function(e) { return e[0] + '=' + e[1]; }).join(' ');
                whisper('**' + charName + '** rolled **' + rollName + '**: ' + captureArgs +
                    '<br>[Assign to selected](' + CMD + ' --assign-capture ' + rollName + ' ' + charId + ' ' + captureArgs + ')' +
                    ' [Clear overrides](' + CMD + ' --clear-capture ' + rollName + ' ' + charId + ')');
            }
        }

        // Manually trigger pin evaluation for changed capture fields
        var fakeMsg = { playerid: playerId || 'API', who: 'API', type: 'api' };
        var pins = Object.keys(captures).reduce(function(acc, cap) {
            var entries = triggerMap['gl_' + rollName + '_' + cap] || [];
            entries.forEach(function(entry) {
                var pin = getObj('pin', entry.pinId);
                if (pin && acc.indexOf(pin) === -1) acc.push(pin);
            });
            return acc;
        }, []);
        if (pins.length > 0) evaluatePins(pins, fakeMsg, false);
    };

    const writeCapturesToToken = (token, rollName, captures) => {
        var gmnotes = decodeURIComponent(token.get('gmnotes') || '');
        Object.entries(captures).forEach(function(entry) {
            var field = 'gl_' + rollName + '_' + entry[0];
            var val = entry[1];
            var rx = new RegExp('(^|\\n)' + field + '=[^\\n]*');
            if (val === undefined) {
                gmnotes = gmnotes.replace(rx, '');
            } else if (gmnotes.match(rx)) {
                gmnotes = gmnotes.replace(rx, '$1' + field + '=' + val);
            } else {
                gmnotes = gmnotes.trim() + '\n' + field + '=' + val;
            }
        });
        token.set('gmnotes', gmnotes);
    };

    // =========================================================================
    // Initialization
    // =========================================================================

    const HANDOUT_NAME = 'Help: Gaslight';
    const HANDOUT_AVATAR = 'https://files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385';

    const createHelpHandout = () => {
        var existing = findObjs({ type: 'handout', name: HANDOUT_NAME });
        var h = existing.length > 0 ? existing[0] : createObj('handout', { name: HANDOUT_NAME, avatar: HANDOUT_AVATAR });
        if (HANDOUT_AVATAR) h.set('avatar', HANDOUT_AVATAR);
        h.set('notes', [
            '<h2>Gaslight v' + SCRIPT_VERSION + '</h2>',
            '<p>Per-player map perception. Split players onto individual page copies with synchronized tokens. Each player can see different things while movement stays consistent.</p>',
            '<h3>Quick Start</h3>',
            '<ol>',
            '<li>Create your master page with all tokens placed.</li>',
            '<li>Duplicate it once per player (Roll20 built-in Duplicate Page).</li>',
            '<li>Select party tokens on the master page, run: <code>!gaslight setup</code> — auto-detects duplicates, assigns pages to players, and configures the group. A group name is generated (shown in the reply); add your own as the first argument to name it.</li>',
            '<li>Run <code>!gaslight test &lt;group&gt;</code> — dry-run that shows how tokens will link without activating anything. Fix any warnings before proceeding.</li>',
            '<li>Run <code>!gaslight split &lt;group&gt;</code> — activates the group: links tokens across pages, moves players to their individual pages, and begins syncing.</li>',
            '<li>When done: <code>!gaslight merge</code> — tears down all links, returns players to the banner page.</li>',
            '</ol>',
            '<h3>Commands</h3>',
            '<p><code>!gaslight setup &lt;group&gt;</code> — Quick-configure from duplicate pages</p>',
            '<p><code>!gaslight split &lt;group&gt; [--force]</code> — Activate group</p>',
            '<p><code>!gaslight merge [group]</code> — Tear down links, return players</p>',
            '<p><code>!gaslight test &lt;group&gt;</code> — Dry-run linking</p>',
            '<p><code>!gaslight link [name|new] [ids...]</code> — Manually link tokens</p>',
            '<p><code>!gaslight unlink [ids...|--group &lt;g&gt;]</code> — Remove links</p>',
            '<p><code>!gaslight group &lt;g&gt; &lt;player|GM&gt;</code> — Assign page to group</p>',
            '<p><code>!gaslight ungroup &lt;g&gt; &lt;player|--all&gt;</code> — Remove from group</p>',
            '<p><code>!gaslight stage [players...]</code> — Propagate tokens to player pages</p>',
            '<p><code>!gaslight view [player|master]</code> — Switch relay view</p>',
            '<p><code>!gaslight relay &lt;views&gt; &lt;!command&gt;</code> — Relay command to specific views</p>',
            '<p><code>!gaslight config [relay-add|relay-remove|relay-list]</code> — Configure relay commands</p>',
            '<p><code>!gaslight eval [--dry-run] [--all|&lt;handout&gt;]</code> — Evaluate script pins</p>',
            '<p><code>!gaslight status</code> — Show state</p>',
            '<h3>Auto-Relay</h3>',
            '<p>Any API command that references master-page linked tokens (via selection or token IDs in the command) is automatically relayed to all player pages. Token IDs in the command are replaced with their linked counterparts on each page. No configuration needed.</p>',
            '<p><b>Player-page commands are page-local by default.</b> A command run against tokens on a player page only affects that page. To have player-page commands relay to other player pages and master, add them to relay-commands: <code>!gaslight config relay-add !token-mod</code></p>',
            '<h3>Selective Relay</h3>',
            '<p>Use <code>!gaslight relay</code> to send a command to specific players only. Useful when you are on a player page or want to exclude certain players:</p>',
            '<p><code>!gaslight relay Alice Bob !token-mod --set layer|objects</code> — only Alice and Bob see a door open; Charlie does not.</p>',
            '<p><code>!gaslight relay all !token-mod --set bar1_value|10</code> — relay to all player pages (useful when running from a player page instead of master).</p>',
            '<h3>Token Linking</h3>',
            '<p>Tokens are linked across pages automatically by:</p>',
            '<ol>',
            '<li><code>gaslight_link</code> in token GM notes (explicit)</li>',
            '<li>Same <code>represents</code> + <code>name</code> (unique pair per page)</li>',
            '<li>Same <code>represents</code> + position fingerprint</li>',
            '</ol>',
            '<h3>Sync Control</h3>',
            '<p>Set the <code>gaslight_sync</code> attribute on a character to control what stays in sync:</p>',
            '<ul>',
            '<li><b>Absent</b> — full sync (position + all properties). Default for most tokens.</li>',
            '<li><b>Empty</b> — no sync at all. Use for tokens that are completely independent per player (e.g. a hallucination only one player sees).</li>',
            '<li><code>base</code> — position/rotation/scale only. Use for NPCs whose appearance differs per player (e.g. a disguised shapechanger) but still moves together.</li>',
            '<li><code>base, bars</code> — position + HP/bars. Use for enemies with different names or art per player but shared health pools.</li>',
            '<li><code>base, bars, light</code> — position + HP + light. Standard for most combat tokens where you want per-player auras/names but shared position and health.</li>',
            '<li><code>!anchor</code> — sync all properties except position. Use for a token that appears in different locations per player (e.g. an illusory wall) but keeps the same stats.</li>',
            '</ul>',
            '<h3>Staging</h3>',
            '<p><b>Token changes and deletion propagate automatically</b> across linked pages. However, <b>token creation does not</b> — new tokens placed on one page are not automatically copied to others.</p>',
            '<p>Use <code>!gaslight stage</code> with tokens selected to duplicate them to all player pages and link them. Alternatively, set <code>gaslight_stage = 1</code> on a character to auto-stage whenever a token representing that character is placed.</p>',
            '<h3>Scripting</h3>',
            '<p>Gaslight scripts are reactive automation stored in handouts, activated via pins on the map. Scripts evaluate per-viewer per-target and fire API commands conditionally.</p>',
            '<p><b>Setup:</b> Create a handout with your script. Place a pin on the master page, link it to the handout. Add config to the pin\'s GM notes:</p>',
            '<pre>---GASLIGHT-SCRIPT---\nscope: token\nfilter: has gl_stealth_result</pre>',
            '<p><b>Script syntax:</b></p>',
            '<pre>// Comments start with //\n!token-mod --set {& if (any(@(viewer.passive_wisdom)) >= @(target.gl_stealth_result))} layer|objects {& else} layer|gmlayer {& end}</pre>',
            '<p><b>Variables:</b></p>',
            '<ul>',
            '<li><code>@(target.*)</code> — the token being evaluated (linked per viewer page)</li>',
            '<li><code>@(target.gl_*)</code> — captured values (falls back to character attribute)</li>',
            '</ul>',
            '<p><b>Aggregate functions</b> (required for viewer.*/gm.*):</p>',
            '<ul>',
            '<li><code>any(@(viewer.field)) op value</code> — true if any viewer token passes</li>',
            '<li><code>all(@(viewer.field)) op value</code> — true if all pass</li>',
            '<li><code>max(@(viewer.field))</code> — highest value across viewer tokens</li>',
            '<li><code>min(@(viewer.field))</code> — lowest value</li>',
            '<li><code>join(@(viewer.token_id))</code> — space-separated IDs for commands</li>',
            '</ul>',
            '<p><b>Triggers:</b> Scripts auto-detect triggers from <code>@(target.gl_*)</code> references. Override with pin GM notes: <code>trigger: on change gl_stealth_result</code> or <code>trigger: manual only</code>.</p>',
            '<p><b>Evaluation:</b> <code>!gaslight eval</code> (selected pins), <code>!gaslight eval --all</code>, or <code>!gaslight eval &lt;handout name&gt;</code>. Add <code>--dry-run</code> to preview without executing.</p>',
            '<p><b>RollCapture integration:</b> Install RollCapture to automatically capture roll results into <code>gl_*</code> attributes, which trigger script re-evaluation.</p>',
        ].join(''));
    };

    // =========================================================================
    // ScriptKit Registration
    // =========================================================================

    const registerWithScriptKit = () => {
        if (typeof ScriptKit === 'undefined') return;
        ScriptKit.register(SCRIPT_NAME, {
            version: SCRIPT_VERSION,
            command: CMD,
            tag: 'GLS',
            motd: [
                'Use `!gaslight test <group>` before splitting to catch linking issues early.',
                'The `--default` flag on stage/sync/desync sets character-level config that applies automatically.',
                'Use `!gaslight view <player>` to see exactly what a player sees — great for debugging illusions.',
                'Scripts in `[GLS]` pins run reactively per-player — perfect for proximity reveals and conditional effects.',
                'The HUD supports gesture controls: swipe to advance turns, drag to reorder, delete to remove.',
            ],
            motdHeader: '🎭 **Gaslight** v' + SCRIPT_VERSION,
            motdStyle: { borderLeft: '3px solid #ff8f00' },
            help: {
                description: 'Per-player map perception. Split players onto individual page copies with synchronized tokens — each player can see different things while movement stays consistent.',
                quickStart: [
                    'Create your master page with all tokens placed.',
                    'Duplicate it once per player (Roll20 built-in Duplicate Page).',
                    'Select party tokens on the master page, run `!gaslight setup` — auto-detects duplicates, assigns pages, configures the group (a name is generated, or provide your own).',
                    '`!gaslight test <group>` — dry-run showing how tokens will link. Fix any warnings.',
                    '`!gaslight split <group>` — activates the group: links tokens, moves players, begins syncing.',
                    'When done: `!gaslight merge` — tears down all links, returns players.',
                ],
                changelog: [
                    { version: '2.3.0', date: '2026-08-31', changes: [
                        '`!gaslight quick [group] [players...]` — configure + split in one step, cloning the master onto page copies (and reusable ' + SCRATCH_NAME + ' pages) via graphic.createCopy (experimental sandbox)',
                        'Marketplace-safe token staging: stage/clone now uses createCopy when available, preserving Marketplace imgsrc and sides',
                        '`!gaslight merge-all` — end all active splits at once',
                        'Nested splits: per-player page stacks — merging a group returns each player to the most recent group they\'re still in (or the banner page)',
                        '`!gaslight merge` (no arg) now ends the most-recently-activated split (top of the stack) instead of all splits; `merge <group>` still targets a specific group anywhere in the stack',
                        'Group name is now optional for `setup` and `quick` — a readable name (e.g. arcane-dragon) is generated via ScriptKit; the first argument is treated as a player unless it doesn\'t resolve to one',
                        'Auto-stage failures are now reported to the GM instead of failing silently',
                        'Adaptive getting-started guide (quick vs manual by sandbox) plus a standalone manual-setup guide when quick is available',
                    ]},
                    { version: '2.2.2', date: '2026-08-14', changes: [
                        'Added version dates to changelog for ScriptKit date-based whatsnew queries',
                    ]},
                    { version: '2.2.1', date: '2026-08-03', changes: [
                        'Fix: `!gaslight link` re-establishes links for tokens in active groups',
                        'Fix: `!gaslight stage --default on` checks for marketplace images',
                        'Fix: `!gaslight desync` now applies immediately (parent rebuilds links, child uses Anchor.untrackComponents)',
                        'Fix: `!gaslight sync` removes !excludes correctly, propagates to all linked copies',
                        'Fix: HUD hides when turn order is empty, reappears when turns are added',
                        'Fix: HUD text offset no longer corrupts after turn advance',
                        'Fix: Turn reticle updates after pin deletion',
                        'Fix: Custom turns properly deduplicated using immutable key matching',
                        'Fix: pr=0 no longer displays as empty text',
                        'Fix: Batch additions no longer lost due to turn order race condition (debounced processing)',
                        'Fix: Fetch compProp resolution returns token gmnotes value before character attribute fallback',
                        'Tutorial: guide pings on HUD elements and customization steps',
                        'QoL: warnings/errors show clickable token images that ping location (requires ScriptKit 1.2.0)',
                        'QoL: `!gaslight test` output condensed to summary + warnings only',
                    ]},
                    { version: '2.2.0', date: '2026-07-30', changes: [
                        'Initiative HUD: pin-based turn tracker with gesture controls (swipe, drag-to-reorder, delete)',
                        'Current turn reticle: rectangle highlighting active combatant on the map',
                        '`!gaslight init` command: sync/trim linked tokens in initiative',
                        '`--default` flags for stage, sync, desync (character-level config)',
                        'Asymmetric unlink/delete: parent cascades, non-parent detaches',
                        'Auto-add to initiative on stage (mid-combat staging)',
                        'Interactive guide examples: getting-started, core-mechanics, initiative-hud, relay, scripting',
                        'ScriptKit integration: help, man, examples, annotations',
                        'GLS script fixes: compProp char-attr fallback, [default] regex, = operator',
                    ]},
                    { version: '2.1.0', date: '2026-07-05', changes: [
                        'var command for managing gl_* variables on tokens',
                        'sync/desync commands for selective token sync control',
                        'HUD system for persistent on-screen status display',
                        'Stage improvements: view-awareness, auto-link after stage',
                        'Scripting engine fixes: anchor component fix, triggerMap auto-rebuild',
                    ]},
                    { version: '2.0.0', date: '2026-06-25', changes: [
                        'Scripting engine — reactive per-player automation via map pins',
                        'RollCapture integration for automatic trigger evaluation',
                        'Auto-relay system for cross-page command forwarding',
                        'Aggregation functions: any(), all(), max(), min(), join()',
                        'Setup command for quick group configuration',
                    ]},
                ],
                commands: [
                    { group: 'Core', commands: [
                        { syntax: 'setup [group] [players...]', description: 'Quick-configure group from duplicate pages', version: '2.0.0',
                          details: 'Auto-detects page copies by name, assigns master + player pages. Players resolved from selected tokens or named explicitly. The group name is optional — a readable one is generated (and shown in the reply) if you don\'t provide one.',
                          items: [
                              { name: '[group]', description: 'Optional group name (a readable name is generated if omitted; the first arg is only treated as a group name if it doesn\'t match a player)', version: '2.3.0' },
                              { name: '[players...]', description: 'Player names to include (optional — auto-detected from selected tokens or party-tagged characters)', version: '2.0.0' },
                          ]},
                        { syntax: 'quick [group] [players...]', description: 'Configure + split using page copies and scratch pages', version: '2.3.0',
                          details: 'Uses existing duplicates of the current page for player pages, and fills any shortfall from pages named ' + SCRATCH_NAME + ' (their settings + contents are cloned from the master; requires the experimental/Jumpgate sandbox for graphic.createCopy). Configures the group and runs split in one step. Group name is optional (auto-generated if omitted). On merge, scratch pages are wiped and renamed back to ' + SCRATCH_NAME + ' for reuse; real duplicates are left untouched.',
                          items: [
                              { name: '[group]', description: 'Optional group name (a readable name like "arcane-dragon" is generated if omitted)', version: '2.3.0' },
                              { name: '[players...]', description: 'Player names to include (optional — auto-detected from selected tokens or party-tagged characters)', version: '2.3.0' },
                          ]},
                        { syntax: 'split <group> [--force]', description: 'Activate a prepared group', version: '1.0.0',
                          details: 'Links tokens across pages, moves players to individual pages, begins syncing. Runs test-first unless --force.',
                          items: [
                              { name: '--force', description: 'Skip the automatic test and split immediately', version: '1.0.0' },
                          ]},
                        { syntax: 'merge [group]', description: 'End a split; players return to their previous split (or banner)', version: '1.0.0',
                          details: 'With no argument, merges the most recently activated group. With a group name, merges that specific group wherever it sits. Because splits stack, each player returns to the most recent group they\'re still in (or the banner page if none remain). quick scratch pages are recycled on merge.',
                          items: [
                              { name: '(no args)', description: 'Merge the most-recently-activated group (top of the stack)', version: '2.3.0' },
                              { name: '<group>', description: 'Merge a specific group, wherever it is in the stack', version: '2.3.0' },
                          ]},
                        { syntax: 'merge-all', description: 'End all active splits (pop the whole stack)', version: '2.3.0',
                          details: 'Merges every active group, emptying the page stacks. Each player ends up back on the banner page.' },
                        { syntax: 'test <group>', description: 'Dry-run linking resolution', version: '1.0.0',
                          details: 'Shows which tokens would link via each resolution step (1-4) without activating anything.' },
                        { syntax: 'status', description: 'Show configured groups, active splits, linked token counts', version: '1.0.0' },
                    ]},
                    { group: 'Token Linking', commands: [
                        { syntax: 'link [<name>|new] [ids...]', description: 'Set gaslight_link on selected + explicit tokens', version: '1.0.0',
                          details: 'Assigns a shared link ID. "new" generates a fresh ID. First non-ID arg is the link name.' },
                        { syntax: 'unlink [ids...|--group <g>]', description: 'Remove gaslight_link from tokens', version: '1.0.0' },
                        { syntax: 'sync [--default] [all|reset|<props...>]', description: 'Show or modify sync config for selected tokens', version: '2.1.0',
                          details: 'Overrides the token\'s gaslight_sync config without changing the character attribute. Use "reset" to re-read from the character.',
                          items: [
                              { name: '(no args)', description: 'Show the current gaslight_sync config for each selected token', version: '2.1.0' },
                              { name: 'all', description: 'Explicitly sync all properties', version: '2.1.0' },
                              { name: 'reset', description: 'Re-copy sync config from the character\'s gaslight_sync attribute', version: '2.1.0' },
                              { name: '<props...>', description: 'Add specific properties to the sync list (comma or space separated)', version: '2.1.0' },
                              { name: '--default', description: 'Apply to character attribute instead of token (new tokens inherit)', version: '2.2.0' },
                          ]},
                        { syntax: 'desync [--default] <props...|all>', description: 'Exclude properties from sync on selected tokens', version: '2.1.0',
                          items: [
                              { name: 'all', description: 'Disable all property syncing (set empty config)', version: '2.1.0' },
                              { name: '<props...>', description: 'Add !prop exclusions (e.g. desync tint_color bar3_value)', version: '2.1.0' },
                              { name: '--default', description: 'Apply to character attribute instead of token (new tokens inherit)', version: '2.2.0' },
                          ]},
                    ]},
                    { group: 'Page Configuration', commands: [
                        { syntax: 'group <group> <player|GM>', description: 'Assign current page to a group', version: '1.0.0' },
                        { syntax: 'ungroup <group> <player|GM|--all>', description: 'Remove page from group', version: '1.0.0' },
                        { syntax: 'stage [--default on|off] [players...]', description: 'Propagate selected tokens to player pages and link', version: '1.1.0',
                          details: 'Select tokens on a gaslighted page. Clones to all other pages in the group with automatic linking. Use --default to set gaslight_stage on the character for auto-staging.',
                          items: [
                              { name: '--default on|off', description: 'Set/remove gaslight_stage=1 on the character (auto-stage on placement)', version: '2.2.0' },
                          ]},
                        { syntax: 'view [player|master|off]', description: 'Show or switch relay view target', version: '2.0.0',
                          details: 'Controls which page(s) receive relayed commands and where var writes go. Affects auto-relay, manual relay, and var command targeting.',
                          items: [
                              { name: '(no args)', description: 'Show the current view target', version: '2.0.0' },
                              { name: 'master / gm / all', description: 'Relay commands to all player pages', version: '2.0.0' },
                              { name: 'off / none', description: 'Disable auto-relay entirely', version: '2.0.0' },
                              { name: '<player>', description: 'Relay only to a specific player\'s page', version: '2.0.0' },
                          ]},
                    ]},
                    { group: 'Relay & Automation', commands: [
                        { syntax: 'relay <views...> <command>', description: 'Relay a command to specific views (select tokens first)', version: '2.0.0',
                          details: 'Views: player names, "all", "master"/"gm". Token IDs in the command are swapped with linked counterparts per page.' },
                        { syntax: 'config [relay-add|relay-remove|relay-list] [commands...]', description: 'Configure auto-relay command list', version: '2.0.0' },
                        { syntax: 'eval [--dry-run] [--all|<handout>]', description: 'Evaluate script pins', version: '2.0.0',
                          details: 'Select pins, or use --all for all active pages, or name a handout. --dry-run previews without executing.' },
                        { syntax: 'var [--silent] --set|--get|--del <name> [value]', description: 'Get/set/delete gl_* variables on selected tokens', version: '2.1.0',
                          details: 'Actions can be chained in one call (e.g. --set a 1 --set b 2 --del c). Names are auto-prefixed with gl_ if missing. View-aware: writes target the current view\'s linked tokens.',
                          items: [
                              { name: '--set <name> <value>', description: 'Set a gl_* field in token GM notes', version: '2.1.0' },
                              { name: '--get <name>', description: 'Read the current value (from GM notes or character attribute)', version: '2.1.0' },
                              { name: '--del <name>', description: 'Remove the field from token GM notes', version: '2.1.0' },
                              { name: '--setch <name> <value>', description: 'Set on the character attribute (shared across all tokens)', version: '2.1.0' },
                              { name: '--delch <name>', description: 'Delete the character attribute', version: '2.1.0' },
                              { name: '--silent', description: 'Don\'t trigger script re-evaluation after the change', version: '2.1.0' },
                          ]},
                        { syntax: 'init [sync|trim]', description: 'Sync initiative turn order with the HUD', version: '2.2.0',
                          details: 'Run after plugins add tokens to initiative. Adds missing linked copies, removes stale entries, and refreshes the HUD.',
                          items: [
                              { name: '(no args)', description: 'Sync + trim (default)', version: '2.2.0' },
                              { name: 'sync', description: 'Add missing linked tokens to turn order', version: '2.2.0' },
                              { name: 'trim', description: 'Remove entries for deleted tokens', version: '2.2.0' },
                          ]},
                        { syntax: 'hud [<element>] [on|off|reset]', description: 'Toggle HUD elements', version: '2.1.0',
                          items: [
                              { name: '(no args)', description: 'Toggle all HUD elements on/off', version: '2.1.0' },
                              { name: 'view', description: 'The view/relay status indicator', version: '2.1.0' },
                              { name: 'initiative', description: 'The initiative tracker HUD', version: '2.1.0' },
                              { name: 'reticle', description: 'Current turn indicator on the map (inherits from diamond)', version: '2.2.0' },
                              { name: 'on / off', description: 'Explicitly enable or disable', version: '2.1.0' },
                              { name: 'reset', description: 'Clear stored position and recreate from defaults', version: '2.1.0' },
                          ]},
                    ]},
                ],
                topics: {
                    linking: {
                        title: 'Token Linking',
                        description: 'How tokens are matched across pages',
                        version: '1.0.0',
                        body: 'When a group is split, Gaslight resolves token links across pages using a 4-step priority system. Higher steps only apply if previous ones don\'t match.',
                        items: [
                            { name: 'Step 1: gaslight_link', description: 'Explicit match via gaslight_link ID in token GM notes', version: '1.0.0' },
                            { name: 'Step 2: represents + name', description: 'Same character + token name (unique pair per page)', version: '1.0.0' },
                            { name: 'Step 3: represents + fingerprint', description: 'Same character + position/property fingerprint', version: '1.0.0' },
                            { name: 'Step 4: Unlinked', description: 'Has represents but no match found — not synced', version: '1.0.0' },
                        ],
                    },
                    sync: {
                        title: 'Sync Control',
                        description: 'How token properties stay synchronized',
                        version: '1.0.0',
                        details: 'Spatial sync (position, size, rotation) uses Anchor. Property sync (bars, status, tint) uses Mirror. Both respect the gaslight_sync attribute.',
                        body: 'Set `gaslight_sync` on a character to control which properties sync. Supports include/exclude syntax:',
                        items: [
                            { name: 'gaslight_sync = *', description: 'Sync everything (default)', version: '1.0.0' },
                            { name: 'gaslight_sync = bar1 bar2 statusmarkers', description: 'Only sync listed properties', version: '1.0.0' },
                            { name: 'gaslight_sync = * !tint_color', description: 'Sync everything except listed', version: '1.0.0' },
                            { name: 'gaslight_sync = none', description: 'Disable all property sync', version: '1.0.0' },
                        ],
                    },
                    scripting: {
                        title: 'Scripting Engine',
                        description: 'Reactive per-player automation via map pins',
                        version: '2.0.0',
                        details: 'Scripts are stored in handouts and activated by placing map pins on the page. Each pin evaluates per-viewer per-target with conditional logic to fire different commands for different players.',
                        body: 'Create a handout with script content. Place a map pin on the page — title it with the handout name (prefix [GLS] is stripped). The pin evaluates whenever triggered attributes change.',
                        items: [
                            { name: '@(target.field)', description: 'Reference a target token field (bar values, GM notes gl_* vars)', version: '2.0.0' },
                            { name: '@(viewer.field)', description: 'Reference the viewer\'s token field', version: '2.0.0' },
                            { name: '@(gm.field)', description: 'Reference the GM master token field', version: '2.0.0' },
                            { name: '{& if condition}...{& end}', description: 'Conditional block — evaluates per viewer', version: '2.0.0' },
                            { name: '{& select target_id}', description: 'Target selection (SelectManager integration)', version: '2.0.0' },
                            { name: 'any(), all(), max(), min()', description: 'Aggregate functions across viewer tokens', version: '2.0.0' },
                            { name: 'join()', description: 'Space-separated IDs of matching viewer tokens', version: '2.0.0' },
                        ],
                    },
                    triggers: {
                        title: 'Triggers',
                        description: 'How scripts auto-evaluate on changes',
                        version: '2.0.0',
                        body: 'Scripts auto-detect triggers from `@(target.gl_*)` references in `{& if}` blocks. Override in pin GM notes:',
                        items: [
                            { name: 'trigger: on change gl_stealth_result', description: 'Explicit trigger on specific field change', version: '2.0.0' },
                            { name: 'trigger: manual only', description: 'Only evaluate when manually run via eval command', version: '2.0.0' },
                        ],
                    },
                    relay: {
                        title: 'Auto-Relay',
                        description: 'Cross-page command forwarding',
                        version: '2.0.0',
                        details: 'Commands targeting master-page tokens can auto-relay to all player pages with token IDs swapped for linked counterparts. Configure which commands relay with the config command.',
                        body: 'Add commands to the relay list with `!gaslight config relay-add !token-mod !aura`. Commands fired on the master page automatically relay to player pages with correct token IDs.',
                    },
                    staging: {
                        title: 'Staging',
                        description: 'Adding tokens to an active split',
                        version: '1.1.0',
                        details: 'Stage propagates selected tokens from master to all player pages with automatic linking. Tokens with gaslight_stage=1 on their character auto-stage when added to the page.',
                        body: 'Select tokens on the master page and run `!gaslight stage`. Tokens are cloned to each player page, linked, and synced.\n\nSet `gaslight_stage = 1` on a character attribute for auto-staging whenever that character\'s token is added to a gaslighted page.',
                    },
                    hud: {
                        title: 'HUD',
                        description: 'Persistent on-screen status display',
                        version: '2.1.0',
                        body: 'The HUD provides on-screen elements on the master page foreground layer.\n\n**Elements:**\n- `view` - relay status text (ALL / OFF / player name)\n- `initiative` - pin-based turn tracker with gestures (swipe, drag-to-reorder, delete)\n- `reticle` - rectangle highlighting current turn token on the map\n\n**Gestures (initiative):**\n- Swipe pin right = next turn, left = previous turn\n- Drag pin up/down = reorder in initiative\n- Delete pin = remove from initiative\n- Resize pin = scale all pins\n- Resize frame vertically = show more/fewer slots\n- Drag diamond = change current turn position in frame\n\n`!gaslight hud on` / `off` / `reset` to control. Element-specific: `!gaslight hud init reset`.',
                    },
                    troubleshooting: {
                        title: 'Troubleshooting',
                        description: 'Common issues and solutions',
                        version: '1.0.0',
                        body: '**Tokens not linking** — Run `!gaslight test <group>` to see resolution steps. Ensure tokens share a character (represents) or have matching gaslight_link IDs.\n\n**Movement not syncing** — Check that Anchor is installed and the token isn\'t excluded by gaslight_sync. Verify the group is active with `!gaslight status`.\n\n**Relay not working** — Confirm the command is in the relay list: `!gaslight config relay-list`. Commands must start with ! to be intercepted.\n\n**Scripts not evaluating** — Pin must be on a page with an active split. Check pin title matches handout name. Run `!gaslight eval --dry-run` to debug.\n\n**Players see the same thing** — Make sure the group is actually split (`!gaslight status`). Player-specific changes must be made on the player\'s page, not the master.',
                    },
                },
            },
        });

        // Pin validation helper for guide steps
        const validatePin = (ctx) => {
            var pin = ctx.selected[0];
            if (!pin || pin.get('_type') !== 'pin') return 'Select the map pin you just placed.';
            var pinPage = pin.get('_pageid');
            var onMaster = Object.values(state[SCRIPT_NAME].activeGroups || {}).some(g => g.masterPageId === pinPage);
            if (!onMaster) return 'That pin is not on a master page. Place it on the master page of your active gaslight group.';
            if (ctx.handoutName) {
                var linkedHandout = pin.get('link');
                if (linkedHandout) {
                    var ho = getObj('handout', linkedHandout);
                    if (!ho || ho.get('name') !== ctx.handoutName) return 'That pin is not linked to the generated handout. Drag the "' + ctx.handoutName + '" handout onto the page to create the correct pin.';
                }
            }
        };

        // Register examples

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'getting-started',
            description: 'Set up your first per-player split: pages, setup, split, and merge (guide only)',
            guide: [
                { prompt: 'This guide walks you through creating your first **per-player split**.\n\nYou\'ll need at least 2 players in your game, but those players do not need to be online.' },
                { prompt: 'Create your **master page** with all tokens placed (NPCs, player characters, objects). This page is the GM\'s "ground truth" — all changes start here.' },

                // ---- Quick path (createCopy available) --------------------------
                { prompt: 'Good news — your sandbox supports the fast path. Create **one blank page per player**, and name each one exactly `' + SCRATCH_NAME + '`. (You can keep these around and reuse them — Gaslight recycles them automatically.)\n\nThese are scratch pages Gaslight will clone your master onto.',
                  when: () => createCopyAvailable() },
                { prompt: 'Navigate to your **master page**, then run `!gaslight quick` using one of these methods:\n\n**Option 1:** Select player-character tokens on the master page, then run `!gaslight quick` — uses controlling players of selected tokens.\n\n**Option 2:** Set the master page as the banner page and run `!gaslight quick "Player1" "Player2" ...` — uses the named players.\n\n**Option 3:** Define a Roll20 party, set the master as the banner page, and run `!gaslight quick` with no selection.\n\nGaslight clones your master onto the scratch pages, configures the group, and splits — all in one step. (A group name is optional; a readable one is generated for you.)',
                  when: () => createCopyAvailable(),
                  ...ScriptKit.waitForCommand('!gaslight quick'),
                  onContinue: () => {
                      if (Object.keys(state[SCRIPT_NAME].activeGroups || {}).length === 0) return 'No active split detected yet. Make sure you have enough `' + SCRATCH_NAME + '` pages (one per player) and run `!gaslight quick`.';
                  }
                },

                // ---- Manual path (createCopy unavailable) -----------------------
                { prompt: 'Duplicate the page **once per player** using Roll20\'s built-in **Duplicate Page** button. Leave the page names as they are — the *"Copy of"* prefix is how Gaslight auto-detects them.',
                  when: () => !createCopyAvailable() },
                { prompt: 'Navigate to the master page and run `!gaslight setup` using one of these methods:\n\n**Option 1:** Select player-character tokens on the master page, then run `!gaslight setup` — uses controlling players of selected tokens.\n\n**Option 2:** Set the master page as the banner page and run `!gaslight setup "Player1" "Player2" ...` with no selection — uses the specified player names.\n\n**Option 3:** Define a Roll20 party, set the master page as the banner page, and run `!gaslight setup` with no selection — uses controlling players of party tokens.\n\nAll options auto-detect duplicated pages and assign one per player. A group name is generated for you — or provide one as the first argument (e.g. `!gaslight setup my-battle`) if you\'d like to name it yourself.',
                  when: () => !createCopyAvailable(),
                  ...ScriptKit.waitForCommand('!gaslight setup'),
                  onContinue: () => {
                      var groups = discoverAllGroups();
                      if (Object.keys(groups).length === 0) return 'No group configured yet. Run `!gaslight setup <name>` using one of the methods above.';
                  }
                },
                { prompt: () => {
                      // Find the group that was just configured but isn't active yet.
                      var all = discoverAllGroups();
                      var active = state[SCRIPT_NAME].activeGroups || {};
                      var pending = Object.keys(all).filter(function(g) { return all[g].master && !active[g]; });
                      var name = pending.length ? pending[0] : '<group>';
                      return 'Now activate it:\n\n`!gaslight split ' + name + '`\n\nThis moves players to their individual pages and begins token syncing.\n\n(Use the group name Setup reported — shown above as **' + name + '**.)';
                  },
                  when: () => !createCopyAvailable(),
                  ...ScriptKit.waitForCommand('!gaslight split'),
                  onContinue: () => {
                      if (Object.keys(state[SCRIPT_NAME].activeGroups || {}).length === 0) return 'No active split detected. Run `!gaslight split <group>` first.';
                  }
                },
                { prompt: 'You may notice a **HUD** appeared on the master page. We\'ll cover that in a later example. For now, disable it with:\n\n`!gaslight hud off`',
                  when: () => Object.values(hudRegistry).some(function(e) { return e.isVisible(); }),
                  onEnter: (ctx, advance) => {
                      var s = state[SCRIPT_NAME];
                      var pageId = getHudPageId();
                      if (pageId) {
                          var player = ctx.player;
                          var delay = 0;
                          // Ping view indicator
                          if (s.hud.viewId) {
                              var viewObj = getObj('text', s.hud.viewId);
                              if (viewObj) {
                                  setTimeout(function() { ScriptKit.ping(pageId, viewObj.get('left'), viewObj.get('top'), { player: player, color: '#00ff00', moveAll: true }); }, delay);
                                  delay += 1500;
                              }
                          }
                          // Ping initiative HUD frame
                          if (s.hud.initData && s.hud.initData.frameId) {
                              var frameObj = getObj('pathv2', s.hud.initData.frameId);
                              if (frameObj) {
                                  setTimeout(function() { ScriptKit.ping(pageId, frameObj.get('x'), frameObj.get('y'), { player: player, color: '#4fc3f7', moveAll: true }); }, delay);
                                  delay += 1500;
                              }
                          }
                          // Ping turn reticle
                          if (s.hud.reticleData && s.hud.reticleData.id) {
                              var reticleObj = getObj('pathv2', s.hud.reticleData.id);
                              if (reticleObj) {
                                  setTimeout(function() { ScriptKit.ping(pageId, reticleObj.get('x'), reticleObj.get('y'), { player: player, color: '#ff6600', moveAll: true }); }, delay);
                              }
                          }
                      }
                      // Wait for !gaslight hud command to advance
                      ScriptKit.waitForCommand('!gaslight hud').onEnter(ctx, advance);
                  },
                  onExit: (ctx) => { ScriptKit.waitForCommand('!gaslight hud').onExit(ctx); }
                },
                { prompt: 'Your split is now active. Try moving an **NPC token** on the master page — it syncs to all player pages automatically. NPC tokens only sync when updated on the master page (one-directional).\n\nThis means you can change an NPC on a specific player\'s page without affecting anyone else — useful for hiding tokens, swapping images, or showing per-player information.' },
                { prompt: 'Now try moving a **player-controlled token** on that player\'s page. It syncs back to the master and out to other player pages — players can move their own tokens and everyone sees it (bidirectional).' },
                { prompt: 'When you\'re done with the split (e.g. combat ends, scene changes), run:\n\n`!gaslight merge`.\n\nThis tears down all links and returns players to the banner page.' },
                { prompt: '**That\'s the basics!** From here, explore the other examples to learn more about how to use gaslight.', offerExamples: ['manual-setup', 'core-mechanics', 'initiative-hud', 'relay', 'scripting'] },
            ],
        });

        // Only register the standalone manual-setup guide when `quick` exists —
        // otherwise getting-started already IS the manual walkthrough.
        if (createCopyAvailable()) {
        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'manual-setup',
            description: 'Prepare gaslight pages in advance by hand: duplicate pages, setup, split',
            guide: [
                { prompt: 'This guide covers the **manual** setup workflow — duplicating pages yourself and configuring the group by hand.\n\nThis is handy for **preparing your gaslight pages in advance** (before a session), or when you want full control over exactly which pages map to which players.' },
                { prompt: 'Create your **master page** with all tokens placed (NPCs, player characters, objects). This is the GM\'s "ground truth" — all changes start here.' },
                { prompt: 'Duplicate the page **once per player** using Roll20\'s built-in **Duplicate Page** button. Leave the names as they are — the *"Copy of"* prefix is how Gaslight auto-detects the copies.' },
                { prompt: 'Navigate to the master page and run `!gaslight setup` using one of these methods:\n\n**Option 1:** Select player-character tokens on the master page, then run `!gaslight setup`.\n\n**Option 2:** Set the master page as the banner page and run `!gaslight setup "Player1" "Player2" ...`.\n\n**Option 3:** Define a Roll20 party, set the master as the banner page, and run `!gaslight setup` with no selection.\n\nAll options auto-detect the duplicated pages and assign one per player. A group name is generated for you — or provide one as the first argument if you\'d like to name it.',
                  ...ScriptKit.waitForCommand('!gaslight setup'),
                  onContinue: () => {
                      var groups = discoverAllGroups();
                      if (Object.keys(groups).length === 0) return 'No group configured yet. Run `!gaslight setup` using one of the methods above.';
                  }
                },
                { prompt: () => {
                      var all = discoverAllGroups();
                      var active = state[SCRIPT_NAME].activeGroups || {};
                      var pending = Object.keys(all).filter(function(g) { return all[g].master && !active[g]; });
                      var name = pending.length ? pending[0] : '<group>';
                      return 'Optional: run `!gaslight test ' + name + '` first to preview how tokens will link and catch any issues before activating.';
                  } },
                { prompt: () => {
                      var all = discoverAllGroups();
                      var active = state[SCRIPT_NAME].activeGroups || {};
                      var pending = Object.keys(all).filter(function(g) { return all[g].master && !active[g]; });
                      var name = pending.length ? pending[0] : '<group>';
                      return 'Activate the group:\n\n`!gaslight split ' + name + '`\n\nPlayers are moved to their individual pages and token syncing begins.';
                  },
                  ...ScriptKit.waitForCommand('!gaslight split'),
                  onContinue: () => {
                      if (Object.keys(state[SCRIPT_NAME].activeGroups || {}).length === 0) return 'No active split detected. Run `!gaslight split <group>` first.';
                  }
                },
                { prompt: 'When you\'re done, run `!gaslight merge` to tear down the links and return players to the banner page.\n\n**Note:** manual setup leaves your duplicated pages in place after merge (unlike `!gaslight quick`, which recycles its scratch pages).' },
                { prompt: '**That\'s manual setup.** For the one-command version (when available), see the **getting-started** guide.', offerExamples: ['getting-started', 'core-mechanics', 'initiative-hud', 'relay', 'scripting'] },
            ],
        });
        }

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'core-mechanics',
            description: 'Staging, linking, syncing, and token lifecycle',
            source: SCRIPT_NAME,
            guide: [
                { prompt: '**Core Mechanics** — This guide walks through the fundamental operations that make Gaslight tick: staging tokens, managing links, controlling sync, and what happens when tokens are deleted.\n\n**Prerequisite:** You need an active split. If you haven\'t set one up yet, run the **getting-started** guide first.',
                  onContinue: () => {
                      if (Object.keys(state[SCRIPT_NAME].activeGroups || {}).length === 0) return 'No active split detected. Run `!gaslight split <group>` first, or complete the getting-started guide.';
                  }
                },
                { prompt: 'During an active split, anything new placed on a page stays only on that page until it\'s been **staged**. This ensures tokens aren\'t visible to players before you\'re ready.\n\nAdd a new token to the master page, select it, and click Continue.',
                  select: 'token', as: 'unlinked', min: 1,
                  onContinue: (ctx) => {
                      var tokens = Array.isArray(ctx.selected) ? ctx.selected : [ctx.selected];
                      var unstaged = tokens.some(token => isOnMasterPage(token.get('id')) && !isMasterToken(token.get('id')));
                      if (!unstaged) return tokens.length == 1 ? 'The selected token is already linked. Select a new (unstaged) token on the master page.' : 'All selected tokens are already linked. Select a new (unstaged) token on the master page.';
                  }
                },
                { prompt: 'Now with the token selected, run:\n\n`!gaslight stage`\n\nThis creates copies on each player page and establishes links for automatic syncing.\n\n**Note:** If staging fails, it\'s likely a marketplace image. Gaslight will warn you which tokens couldn\'t be staged. Re-upload the image to your library and swap it to fix this.',
                  ...ScriptKit.waitForCommand('!gaslight stage'),
                  onContinue: (ctx) => {
                      var tokens = Array.isArray(ctx.selections.unlinked) ? ctx.selections.unlinked : [ctx.selections.unlinked];
                      var allStaged = tokens.every(token => isMasterToken(token.get('id')));
                      if (!allStaged) return 'The previously selected token has not been staged yet. Select it and run `!gaslight stage`.';
                  }
                },
                { prompt: 'Your token is now staged — copies exist on each player page and sync automatically.\n\nYou can also set a **default** so tokens representing a character auto-stage whenever placed on a gaslighted page:\n\n`!gaslight stage --default on`\n\nTo remove the default: `!gaslight stage --default off`' },
                { prompt: '**Unlinking** disconnects a player\'s copy from the master without deleting it. Useful for making permanent per-player differences.\n\nSelect a staged token on the master page and run:\n\n`!gaslight unlink`',
                  ...ScriptKit.waitForCommand('!gaslight unlink')
                },
                { prompt: 'The player copy now lives independently — changes on the master won\'t reach it.' },
                { prompt: '**Relinking** re-establishes the connection. Select the same master token and run:\n\n`!gaslight link`\n\nThe player copy snaps back to match the master.',
                  ...ScriptKit.waitForCommand('!gaslight link')
                },
                { prompt: '**Desyncing** keeps tokens linked but pauses sync for specific properties. For example, you can move a token independently on one player\'s page while bars and status markers still sync.\n\nSelect a staged token and run:\n\n`!gaslight desync left,top`\n\nThis excludes position from syncing.',
                  ...ScriptKit.waitForCommand('!gaslight desync')
                },
                { prompt: '**Resyncing** resumes sync for a desynced property. The player copy snaps back to the master\'s current value.\n\nSelect the same token and run:\n\n`!gaslight sync left,top`',
                  ...ScriptKit.waitForCommand('!gaslight sync')
                },
                { prompt: 'You can also set sync/desync **defaults** on a character so new tokens inherit the config:\n\n`!gaslight sync --default all` — sync everything (the default)\n`!gaslight sync --default left,top,bar1_value` — sync only these props\n`!gaslight desync --default left,top` — exclude position from sync\n`!gaslight desync --default all` — disable all syncing by default\n\nUse `!gaslight sync reset` on a token to re-read the character default.' },
                { prompt: '**Token deletion behavior:**\n\n• Delete a **parent token** (master page, or controlling player\'s page for PCs) → all linked copies are removed\n• Delete a **non-parent copy** (e.g. an NPC on a player page) → only that copy is removed, others remain' },
                { prompt: '**That\'s the core!** You now know how to stage, link/unlink, sync/desync, and manage token lifecycle.\n\nNext, learn how the initiative HUD works or how to relay commands to player pages.',
                  offerExamples: ['manual-setup', 'initiative-hud', 'relay', 'scripting']
                },
            ],
        });

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'initiative-hud',
            description: 'Interactive initiative tracker HUD — gestures, customization, reticle',
            source: SCRIPT_NAME,
            guide: [
                { prompt: '**Initiative HUD** — This guide walks through the on-screen initiative tracker: how to interact with it, customize its appearance, and use the current turn reticle.\n\n**Prerequisites:** You need an active split with the HUD enabled.',
                  onContinue: () => {
                      var s = state[SCRIPT_NAME];
                      if (Object.keys(s.activeGroups || {}).length === 0) return 'No active split detected. Complete the getting-started guide first.';
                      if (!s.hud.initiative) return 'Initiative HUD is disabled. Run `!gaslight hud init on` to enable it.';
                      if (!s.hud.reticle) return 'Turn reticle is disabled. Run `!gaslight hud reticle on` to enable it.';
                  }
                },
                { prompt: 'Before we begin, clear any existing entries from the turn order. You can do this from Roll20\'s Turn Tracker panel (⚙).\n\nClear the turn order and click Continue.',
                  when: () => {
                      var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                      return turnOrder.length > 0;
                  },
                  onEnter: (ctx, advance) => {
                      ctx._clearFired = false;
                      on('change:campaign:turnorder', function() {
                          if (ctx._clearFired) return;
                          var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                          if (turnOrder.length === 0) { ctx._clearFired = true; advance(); }
                      });
                  },
                  onContinue: () => {
                      var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                      if (turnOrder.length > 0) return 'Turn order still has ' + turnOrder.length + ' entry/entries. Clear them all first.';
                  }
                },
                { prompt: 'The HUD needs tokens in the turn order. Add **6 or more tokens** to Roll20\'s initiative tracker using the **built-in Turn Tracker** (⚙ in the toolbar). Add some turns to the turnOrder (preferably with actual values).\n\n**Do NOT use a plugin command** (like GroupInitiative, etc.) to roll initiative — we\'ll cover that later.',
                  onEnter: (ctx, advance) => {
                      ctx._turnFired = false;
                      on('change:campaign:turnorder', function() {
                          if (ctx._turnFired) return;
                          var s = state[SCRIPT_NAME];
                          var entries = (s.hud.initData && s.hud.initData.entries) || [];
                          if (entries.length >= 6) { ctx._turnFired = true; advance(); }
                      });
                  },
                  onContinue: () => {
                      var s = state[SCRIPT_NAME];
                      var entries = (s.hud.initData && s.hud.initData.entries) || [];
                      if (entries.length < 6) return 'Only ' + entries.length + ' token(s) in the HUD. Add at least 6.';
                  }
                },
                { prompt: '**Why duplicates?**\n\nYou may notice the Roll20 Turn Tracker panel shows what appears to be duplicate entries — multiple entries for the same combatant. This is because each linked token (one per player page) has its own turn order entry.\n\nThe HUD **deduplicates** these automatically and shows one pin per combatant. The raw turn order is correct — it\'s just how Gaslight tracks initiative across pages.' },
                { prompt: '**HUD Layout — The Frame:**\n\nThe large rectangle behind the HUD is the **frame**. It defines the HUD\'s position and how many slots are visible. You\'ll learn how to customize it later.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.frameId) return;
                      var frame = getObj('pathv2', d.frameId);
                      if (!frame) return;
                      var pageId = frame.get('_pageid');
                      var x = frame.get('x'), y = frame.get('y');
                      var points = JSON.parse(frame.get('points') || '[]');
                      var w = points.length >= 2 ? Math.abs(points[1][0] - points[0][0]) : 100;
                      var h = points.length >= 2 ? Math.abs(points[1][1] - points[0][1]) : 500;
                      ScriptKit.ping(pageId, x, y, { color: 'transparent', moveAll: true, player: ctx.player });
                      ScriptKit.annotate(pageId, 'arrow', x + w / 2, y + h / 2, { fromX: x + w / 2 + 100, fromY: y + h / 2 + 100, color: '#ff0000' });
                  }
                },
                { prompt: '**HUD Layout — The Diamond:**\n\nThe diamond-shaped highlight marks the **current turn**. The pin inside it is the active combatant.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.highlightId) return;
                      var hl = getObj('pathv2', d.highlightId);
                      if (!hl) return;
                      var pageId = hl.get('_pageid');
                      var x = hl.get('x'), y = hl.get('y');
                      var color = (d.highlightStroke || defaultInitHud.highlightStroke);
                      ScriptKit.ping(pageId, x, y, { color: color, moveAll: true, player: ctx.player });
                      ScriptKit.annotate(pageId, 'arrow', x - 80, y, { fromX: x - 180, fromY: y, color: '#ff0000' });
                  }
                },
                { prompt: '**HUD Layout — The Pins:**\n\nEach pin represents one combatant. Pins **above** the diamond have already gone this round; pins **below** are upcoming turns. The HUD scrolls to keep the current turn visible.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.entries || d.entries.length === 0) return;
                      // Get frame bounds to filter visible pins
                      var frame = d.frameId ? getObj('pathv2', d.frameId) : null;
                      var frameY = frame ? frame.get('y') : 0;
                      var points = frame ? JSON.parse(frame.get('points') || '[]') : [];
                      var frameH = points.length >= 2 ? Math.abs(points[1][1] - points[0][1]) : 5000;
                      var minY = frameY - frameH / 2;
                      var maxY = frameY + frameH / 2;
                      // Gather pins within frame bounds, sorted top to bottom
                      var pins = d.entries.map(function(e) {
                          var p = getObj('pin', e.tokenId);
                          if (!p) return null;
                          var center = toPinCenter(p);
                          return { x: center.x, y: center.y, rawY: p.get('y'), pageId: p.get('_pageid') };
                      }).filter(function(p) { return p && p.rawY >= minY && p.rawY <= maxY; });
                      pins.sort(function(a, b) { return a.y - b.y; });
                      // Pan to the frame center first
                      var frameX = frame ? frame.get('x') : (pins[0] ? pins[0].x : 0);
                      ScriptKit.ping(pins[0].pageId, frameX, frameY, { color: 'transparent', moveAll: true, player: ctx.player });
                      pins.forEach(function(p, i) {
                          setTimeout(function() {
                              ScriptKit.ping(p.pageId, p.x, p.y, { color: '#ff0000', moveAll: false, player: ctx.player });
                          }, (i + 1) * 500);
                      });
                  }
                },
                { prompt: '**Gestures — Next turn:**\n\nSwipe the **current turn** pin (the one inside the diamond) to the **right** to advance to the next combatant.\n\nTry it now.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.highlightId || !d.entries || d.entries.length === 0) return;
                      var hl = getObj('pathv2', d.highlightId);
                      if (!hl) return;
                      var pageId = hl.get('_pageid');
                      // Find the current turn pin (closest to highlight Y)
                      var hlY = hl.get('y');
                      var current = d.entries.map(function(e) { var p = getObj('pin', e.tokenId); return p ? { pin: p, y: p.get('y') } : null; }).filter(Boolean).sort(function(a, b) { return Math.abs(a.y - hlY) - Math.abs(b.y - hlY); })[0];
                      if (!current) return;
                      var center = toPinCenter(current.pin);
                      ScriptKit.ping(pageId, center.x, center.y, { color: 'transparent', moveAll: true, player: ctx.player });
                      ScriptKit.annotate(pageId, 'arrow', center.x + 100, center.y, { fromX: center.x + 20, fromY: center.y, color: '#00ff00' });
                  }
                },
                { prompt: '**Gestures — Previous turn:**\n\nSwipe the **current turn** pin to the **left** to go back to the previous combatant.\n\nTry it now.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.highlightId || !d.entries || d.entries.length === 0) return;
                      var hl = getObj('pathv2', d.highlightId);
                      if (!hl) return;
                      var pageId = hl.get('_pageid');
                      var hlY = hl.get('y');
                      var current = d.entries.map(function(e) { var p = getObj('pin', e.tokenId); return p ? { pin: p, y: p.get('y') } : null; }).filter(Boolean).sort(function(a, b) { return Math.abs(a.y - hlY) - Math.abs(b.y - hlY); })[0];
                      if (!current) return;
                      var center = toPinCenter(current.pin);
                      ScriptKit.ping(pageId, center.x, center.y, { color: 'transparent', moveAll: true, player: ctx.player });
                      ScriptKit.annotate(pageId, 'arrow', center.x - 100, center.y, { fromX: center.x - 20, fromY: center.y, color: '#ff4444' });
                  }
                },
                { prompt: '**Gestures — Jump to turn:**\n\nSwipe any **non-current** pin to the **right** to jump forward to that combatant\'s turn. Swipe **left** to jump backward to it.\n\nTry swiping a non-current pin.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.highlightId || !d.entries || d.entries.length < 2) return;
                      var hl = getObj('pathv2', d.highlightId);
                      if (!hl) return;
                      var pageId = hl.get('_pageid');
                      var hlY = hl.get('y');
                      var frame = d.frameId ? getObj('pathv2', d.frameId) : null;
                      var frameY = frame ? frame.get('y') : 0;
                      var points = frame ? JSON.parse(frame.get('points') || '[]') : [];
                      var frameH = points.length >= 2 ? Math.abs(points[1][1] - points[0][1]) : 5000;
                      var minY = frameY - frameH / 2;
                      var maxY = frameY + frameH / 2;
                      // Find a non-current pin that's in the frame (smallest Y = topmost)
                      var nonCurrent = d.entries.map(function(e) { var p = getObj('pin', e.tokenId); return p ? { pin: p, y: p.get('y') } : null; }).filter(function(e) { return e && Math.abs(e.y - hlY) > 30 && e.y >= minY && e.y <= maxY; }).sort(function(a, b) { return a.y - b.y; })[0];
                      if (!nonCurrent) return;
                      var center = toPinCenter(nonCurrent.pin);
                      ScriptKit.ping(pageId, center.x, center.y, { color: '#ff0000', moveAll: false, player: ctx.player });
                      ScriptKit.annotate(pageId, 'arrow', center.x + 100, center.y, { fromX: center.x + 20, fromY: center.y, color: '#00ff00' });
                  }
                },
                { prompt: '**Gestures — Reordering:**\n\nDrag a HUD pin **up or down** to reorder it in initiative. The pin will snap into its new position.\n\nTry dragging a pin to a different slot.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.initData;
                      if (!d || !d.entries || d.entries.length < 2) return;
                      var frame = d.frameId ? getObj('pathv2', d.frameId) : null;
                      var frameY = frame ? frame.get('y') : 0;
                      var points = frame ? JSON.parse(frame.get('points') || '[]') : [];
                      var frameH = points.length >= 2 ? Math.abs(points[1][1] - points[0][1]) : 5000;
                      var minY = frameY - frameH / 2;
                      var maxY = frameY + frameH / 2;
                      var visible = d.entries.map(function(e) { var p = getObj('pin', e.tokenId); return p ? { pin: p, y: p.get('y') } : null; }).filter(function(e) { return e && e.y >= minY && e.y <= maxY; });
                      if (visible.length < 2) return;
                      var pin = visible[visible.length - 1];
                      var pageId = pin.pin.get('_pageid');
                      var center = toPinCenter(pin.pin);
                      var frameX = frame ? frame.get('x') : center.x;
                      var fwPts = frame ? JSON.parse(frame.get('points') || '[]') : [];
                      var fw = fwPts.length >= 2 ? Math.abs(fwPts[1][0] - fwPts[0][0]) : 70;
                      var arrowX = frameX - fw / 2;
                      ScriptKit.ping(pageId, center.x, center.y, { color: 'transparent', moveAll: true, player: ctx.player });
                      ScriptKit.annotate(pageId, 'arrow', arrowX, center.y - 80, { fromX: arrowX, fromY: center.y - 10, color: '#00ccff' });
                      ScriptKit.annotate(pageId, 'arrow', arrowX, center.y + 80, { fromX: arrowX, fromY: center.y + 10, color: '#00ccff' });
                  }
                },
                { prompt: '**Current Turn Reticle:**\n\nThe rectangle on the map highlighting the current turn\'s token is the **reticle**. It follows the active combatant wherever they are.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var d = s.hud.reticleData;
                      if (!d || !d.id) return;
                      var reticle = getObj('pathv2', d.id);
                      if (!reticle) return;
                      var pageId = reticle.get('_pageid');
                      var x = reticle.get('x'), y = reticle.get('y');
                      ScriptKit.ping(pageId, x, y, { color: 'transparent', moveAll: true, player: ctx.player });
                  }
                },
                { prompt: '**The Frame — Vertical resize:**\n\nNotice that not all 6+ pins fit in the frame — some are hidden. **Resize the frame vertically** (drag its bottom edge down) to reveal more slots.\n\nTry making the frame taller to show all your pins. HUD elements are located on the foreground layer, so you need to go to that layer to adjust them.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var pageId = getHudPageId();
                      if (pageId && s.hud.initData && s.hud.initData.frameId) {
                          var obj = getObj('pathv2', s.hud.initData.frameId);
                          if (obj) ScriptKit.ping(pageId, obj.get('x'), obj.get('y'), { player: ctx.player, color: '#4fc3f7', moveAll: true });
                      }
                  }
                },
                { prompt: '**The Frame — Diamond position:**\n\nYou can drag the **diamond highlight up or down** within the frame to shift where the current turn is displayed. Pins above and below will adjust accordingly.\n\nTry moving the diamond to a different position in the frame.' },
                { prompt: '**The Frame — Other customization:**\n\nThe frame supports additional tweaks:\n\n• **Drag** the frame to move the entire HUD\n• **Resize horizontally** to adjust padding between pins\n• Change the frame\'s **stroke color** or **fill** directly in Roll20\'s shape properties\n\nThe **diamond** can also be customized:\n\n• Change its **color**, **stroke width**, **fill**, or **rotation** directly in Roll20\'s shape properties\n\nThe HUD remembers all of these choices.' },
                { prompt: '**Reticle — Inheritance:**\n\nThe reticle inherits its **color** and **stroke width** from the diamond. It also inherits **rotation**, offset by 45° (so the diamond\'s 45° rotation becomes the reticle\'s 90°, etc.).\n\nIf you changed the diamond\'s appearance in the previous steps, the reticle should reflect those changes.\n\nTo override the reticle independently, just change its properties directly. Once overridden, it stops inheriting that property from the diamond.\n\nThe reticle can also have its positional offset from the token adjusted and you can delete it to toggle it off.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var pageId = getHudPageId();
                      if (pageId && s.hud.reticleData && s.hud.reticleData.id) {
                          var obj = getObj('pathv2', s.hud.reticleData.id);
                          if (obj) ScriptKit.ping(pageId, obj.get('x'), obj.get('y'), { player: ctx.player, color: '#ff6600', moveAll: true });
                      }
                  }
                },
                { prompt: '**Customization — Pin Scaling:**\n\nResize any HUD pin and all pins scale together. The padding between pins stays fixed.\n\nYou can resize pins by clicking the pin, selecting "Edit", then going to the Customization tab. Try resizing one of the pins.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var pageId = getHudPageId();
                      if (pageId && s.hud.initData && s.hud.initData.entries && s.hud.initData.entries.length > 0) {
                          var pinId = s.hud.initData.entries[0].tokenId;
                          var pin = pinId ? getObj('pin', pinId) : null;
                          if (pin) ScriptKit.ping(pageId, pin.get('x'), pin.get('y'), { player: ctx.player, color: '#4fc3f7', moveAll: true });
                      }
                  }
                },
                { prompt: '**Customization — HUD Text:**\n\nThe initiative value text next to each pin can be customized:\n\n• Change **font**, **size**, **color**, or **stroke** directly on any text element in Roll20 — all will update to match\n• **Drag** a text element to adjust its position relative to the frame (closer, further, up, down)\n• **Rotate** it to change the text angle\n\nTry changing the font or position of one of the text elements.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var pageId = getHudPageId();
                      if (pageId && s.hud.initData && s.hud.initData.entries && s.hud.initData.entries.length > 0) {
                          var textId = s.hud.initData.entries[0].textId;
                          var txt = textId ? getObj('text', textId) : null;
                          if (txt) ScriptKit.ping(pageId, txt.get('left'), txt.get('top'), { player: ctx.player, color: '#ff00ff', moveAll: true });
                      }
                  }
                },
                { prompt: '**Gestures — Removing:**\n\nDelete a HUD pin to remove that combatant from initiative. Try deleting one now.' },
                { prompt: '**Clearing initiative:**\n\nNow clear the rest of the initiative — delete the remaining HUD pins or clear initiative from Roll20\'s Turn Tracker panel.\n\nClear initiative before continuing.',
                  when: () => {
                      var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                      return turnOrder.length > 0;
                  },
                  onEnter: (ctx, advance) => {
                      ctx._clearFired = false;
                      on('change:campaign:turnorder', function() {
                          if (ctx._clearFired) return;
                          var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                          if (turnOrder.length === 0) { ctx._clearFired = true; advance(); }
                      });
                  },
                  onContinue: () => {
                      var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                      if (turnOrder.length > 0) return 'Turn order still has ' + turnOrder.length + ' entry/entries. Clear them all first.';
                  }
                },
                { prompt: '**Plugin-added initiative:**\n\nIf you use a plugin (GroupInitiative, etc.) to roll initiative, go ahead and use it now.\n\nIf you don\'t have one, select token(s) and click **Continue** — Gaslight will add them to initiative for you.',
                  onContinue: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var entries = (s.hud.initData && s.hud.initData.entries) || [];
                      if (entries.length > 0) return 'HUD still has pins from before. Clear initiative first (previous step).';
                      var turnOrder = JSON.parse(Campaign().get('turnorder') || '[]');
                      if (turnOrder.length >= 1) return; // Plugin already added them
                      var tokens = (ctx.msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
                      if (tokens.length === 0) return 'No tokens in initiative and none selected. Either use a plugin or select token(s).';
                      // Add selected tokens to initiative
                      tokens.forEach(function(t) {
                          var roll = Math.ceil(Math.random() * 20);
                          turnOrder.push({ id: t.get('id'), pr: roll, custom: '', _pageid: t.get('_pageid') });
                      });
                      turnOrder.sort(function(a, b) { return (b.pr || 0) - (a.pr || 0); });
                      Campaign().set('turnorder', JSON.stringify(turnOrder));
                  }
                },
                { prompt: '**The problem:** When a plugin adds tokens to initiative, it sets `Campaign().set(\'turnorder\')` — but Gaslight cannot detect that change automatically.\n\nTo sync the HUD with the current turn order, run:\n\n`!gaslight init`\n\nThis is needed whenever initiative changes via a plugin (not via the HUD gestures).',
                  ...ScriptKit.waitForCommand('!gaslight init')
                },
                { prompt: '**Reset:**\n\nIf the HUD ever gets into a weird state (misplaced elements, corrupted data), you can reset it:\n\n`!gaslight hud init reset` — destroys and recreates the initiative HUD from defaults\n`!gaslight hud reticle reset` — destroys and recreates the reticle from defaults\n\nThis preserves your turn order but resets all visual customization.' },
                { prompt: '**Toggling on/off:**\n\nYou can disable the HUD without losing your settings:\n\n`!gaslight hud init off` — hides the initiative HUD (turn order still works normally)\n`!gaslight hud init on` — shows it again with your saved customization\n`!gaslight hud reticle off` / `on` — same for the reticle independently\n`!gaslight hud off` / `on` — toggles all HUD elements at once' },
                { prompt: '**⚠️ Tags:**\n\nIf a token in initiative doesn\'t exist on all player pages, its HUD pin shows a ⚠️ icon in the title. Click the pin to see which players can\'t see it.\n\nThis usually means the token hasn\'t been staged to all pages. Run `!gaslight stage` with it selected to fix it.' },
                { prompt: '**Commands reference:**\n\n`!gaslight hud init on|off|reset` — toggle/reset the initiative HUD\n`!gaslight hud reticle on|off|reset` — toggle/reset the reticle\n`!gaslight init` — sync turn order into HUD\n`!gaslight init sync` — add missing linked tokens\n`!gaslight init trim` — remove stale entries\n\n**That\'s the initiative HUD!**',
                  offerExamples: ['manual-setup', 'core-mechanics', 'relay', 'scripting']
                },
            ],
        });

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'relay',
            description: 'Command relay, view targeting, and the view HUD',
            source: SCRIPT_NAME,
            guide: [
                { prompt: '**Relay** — This guide walks you through how commands propagate across pages.\n\n**Prerequisite:** You need an active split with at least one staged token.',
                  onContinue: () => {
                      var s = state[SCRIPT_NAME];
                      if (Object.keys(s.activeGroups || {}).length === 0) return 'No active split detected. Complete the getting-started guide first.';
                      if (!s.hud.view) return 'View HUD is disabled. Run `!gaslight hud view on` to enable it.';
                  }
                },
                { prompt: '**Try auto-relay:**\n\nSelect a **staged token on the master page** and run any command against it (e.g. `!token-mod --set bar1_value|10` if you have TokenMod, or any other API command that targets tokens).\n\nThen navigate to a player\'s page — you\'ll see the command affected their copy too. That\'s auto-relay: any command referencing a master-page token ID automatically propagates to all player pages.' },
                { prompt: '**The View HUD** shows the current relay status on the master page. It updates live as you change the relay target.',
                  onEnter: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var pageId = getHudPageId();
                      if (pageId && s.hud.viewId) {
                          var viewObj = getObj('text', s.hud.viewId);
                          if (viewObj) ScriptKit.ping(pageId, viewObj.get('left'), viewObj.get('top'), { player: ctx.player, color: '#00ff00', moveAll: true });
                      }
                  }
                },
                { prompt: '**Disable relay:**\n\nBy default, the view is set to `all` — commands relay to every player page. Let\'s turn it off first to see the difference:\n\n`!gaslight view off`\n\nNotice the View HUD updates to show relay is disabled.',
                  ...ScriptKit.waitForCommand('!gaslight view')
                },
                { prompt: '**Try a command with relay off:**\n\nSelect a staged token on the master page and run a command against it (e.g. `!token-mod --set bar1_value|+15`).\n\nNavigate to a player\'s page — their copy was **not** affected. With view `off`, commands stay on master only.' },
                { prompt: (ctx) => {
                      var s = state[SCRIPT_NAME];
                      var names = [];
                      Object.values(s.activeGroups).forEach(function(g) {
                          Object.values(g.playerPages).forEach(function(p) { if (p.name && names.indexOf(p.name) === -1) names.push(p.name); });
                      });
                      var examples = names.length > 0 ? names.map(function(n) { return '`!gaslight view "' + n + '"`'; }).join(' or ') : '`!gaslight view "<player name>"`';
                      return '**Switch to a specific player:**\n\nNow target a single player:\n\n' + examples;
                  },
                  ...ScriptKit.waitForCommand('!gaslight view')
                },
                { prompt: '**Try a command with a player view:**\n\nSelect the same staged token on the master page and run a command against it.\n\nNavigate to that player\'s page — only their copy was affected. Other players\' copies remain unchanged.' },
                { prompt: '**Switch to all:**\n\nNow switch to relaying to everyone:\n\n`!gaslight view all`\n\nThe View HUD updates again.',
                  ...ScriptKit.waitForCommand('!gaslight view')
                },
                { prompt: '**Try a command with view all:**\n\nRun the same command again with a staged token selected. Now check multiple player pages — all copies were affected. This is the default behavior.' },
                { prompt: '**Manual relay:**\n\nTo relay a command to specific players (overriding the current view), select a master token and run:\n\n`!gaslight relay all !token-mod --set bar1_value|5`\n\nYou can also target specific players:\n\n`!gaslight relay "<player name>" !token-mod --set statusmarkers|dead`' },
                { prompt: '**Player-page relay:**\n\nBy default, commands run on a **player page** only affect that page. To make a command also relay from player pages, add it to the relay list:\n\n`!gaslight config relay-add !token-mod`\n\nRemove with: `!gaslight config relay-remove !token-mod`\nView the list: `!gaslight config relay-list`' },
                { prompt: '**What doesn\'t relay:**\n\n• `!gaslight`, `!mirror`, and `!anchor` commands never auto-relay\n• Commands with no tokens selected don\'t relay unless a master token id is specified in their parameters\n• Commands run while view is `off` don\'t relay\n\n**That\'s relay!** You can now run commands from the master page and have them affect all (or specific) player views automatically.',
                  offerExamples: ['manual-setup', 'core-mechanics', 'initiative-hud', 'scripting']
                },
            ],
        });

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'scripting',
            description: 'Gaslight Scripts — build a "winds of magic" script step by step',
            source: SCRIPT_NAME,
            guide: [
                { prompt: '**Scripting** — This guide walks you through building a Gaslight Script from scratch. We\'ll create a "Winds of Magic" effect: certain tokens radiate a magical aura (status marker) that only players with "second sight" can see.\n\n**Prerequisite:** You need an active split with staged tokens.',
                  onContinue: () => {
                      if (Object.keys(state[SCRIPT_NAME].activeGroups || {}).length === 0) return 'No active split detected. Complete the getting-started guide first.';
                  }
                },
                { prompt: '**Variables:**\n\nGaslight uses `gl_` prefixed variables to drive scripts. We need two:\n\n• `gl_magical` — marks a token as radiating magical energy\n• `gl_second_sight` — marks a character as able to perceive magic\n\nSelect a staged NPC token on the master page and run:\n\n`!gaslight var --set magical 1`',
                  ...ScriptKit.waitForCommand('!gaslight var')
                },
                { prompt: '**Character variable:**\n\nNow select a **player character token** and set second sight on the character sheet (so it applies to all their tokens):\n\n`!gaslight var --setch second_sight 1`\n\nThe `--setch` flag sets it on the character, not the individual token.',
                  ...ScriptKit.waitForCommand('!gaslight var')
                },
                { prompt: '**The script handout (1/2):**\n\nCreate a new **handout** in your journal. Give it a prefix of "[GLS]" and a name (e.g. `[GLS] Winds of Magic`).\n\nIn the **Description & Notes** of the handout, paste this script:\n\n```!token-mod --set {& if @(target.gl_magical[0]) = 1 && any(@(viewer.gl_second_sight[0])) = 1}statusmarkers|+half-haze{& else}statusmarkers|-half-haze{& end}```\n\nThis adds the `half-haze` status marker to tokens that are magical — but only on pages where the viewer has second sight. Otherwise it removes it.\n\nClick Continue when done.' },
                { prompt: '**The script handout (2/2):**\n\nIn the **GM Notes**, type:\n\n```filter: all\ntrigger: gl_magical, gl_second_sight```\n\n• `filter: all` — evaluates against every staged token\n• `trigger:` — auto-re-evaluates when either variable changes\n\nClick Continue when the handout is configured.' },
                { prompt: '**The Pin:**\n\nDrag the script handout onto the master page to create a map pin. This pin represents the script and will be used to trigger evaluations.' },
                { prompt: '**Evaluate:**\n\nRun:\n\n`!gaslight eval --all`\n\nThis evaluates the script for every token. The NPC you marked as magical should now have the `half-haze` status marker on the player page(s) where the viewer has second sight — and NOT on pages where they don\'t.\n\nCheck both player pages to confirm.',
                  ...ScriptKit.waitForCommand('!gaslight eval')
                },
                { prompt: '**Test the trigger (1/2):**\n\nSelect the player character token and remove their second sight:\n\n`!gaslight var --delch second_sight`\n\nBecause `trigger: gl_second_sight` is set, the script **automatically re-evaluates**. The half-haze marker should disappear from that player\'s view.\n\nRestore it: `!gaslight var --setch second_sight 1`',
                  ...ScriptKit.waitForCommand('!gaslight var')
                },
                { prompt: '**Test the trigger (2/2):**\n\nSelect the NPC token on the master page and remove their magical status:\n\n`!gaslight var --del magical`\n\nBecause `trigger: gl_magical` is set, the script **automatically re-evaluates**. The half-haze marker should disappear from that player\'s view.\n\nRestore it: `!gaslight var --setch magical 1`',
                  ...ScriptKit.waitForCommand('!gaslight var')
                },
                { prompt: '**Debugging:**\n\nIf something doesn\'t work, use dry-run to see what would execute:\n\n`!gaslight eval --dry-run --all`\n\nThis shows the fully-expanded commands after variable substitution, so you can verify the logic without changing anything.' },
                { prompt: '**Key concepts:**\n\n• `@(target.*)` — the token being evaluated (master copy)\n• `@(viewer.*)` — the viewing player\'s copy (use inside `any()`/`all()`)\n• `@(gm_target.*)` — always resolves to the master token\n• `any(@(viewer.gl_x))` — true if ANY viewer has the value\n• `all(@(viewer.gl_x))` — true if ALL viewers have the value\n• `{& if}` / `{& else}` / `{& end}` — conditional blocks\n• `--set` vs `--setch` — token variable vs character variable\n• `trigger:` — comma-separated list of variables that auto-trigger re-evaluation\n\nSee the other applied examples for more complex scripts.',
                  offerExamples: ['manual-setup', 'core-mechanics', 'initiative-hud', 'relay', 'stealth', 'truesight', 'madness']
                },
            ],
        });

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'stealth',
            description: 'Hide/show NPCs per player based on passive perception vs stealth DC (RollCapture)',
            guide: [
                { prompt: '**Stealth** — This script automatically hides/shows NPCs based on whether each player\'s passive perception beats the NPC\'s stealth roll. Requires **RollCapture** to detect stealth rolls.\n\nClick Continue to verify RollCapture is installed.',
                  onContinue: () => {
                      if (typeof RollCapture === 'undefined') return 'RollCapture is not installed. Install it from the one-click menu first.';
                  }
                },
                { prompt: '**Configure RollCapture:**\n\nRun `!rollcapture dissect` in chat, then roll stealth for any NPC. This shows you the template fields available for capture.',
                  ...ScriptKit.waitForCommand('!rollcapture dissect')
                },
                { prompt: 'Create a RollCapture rule for skills. Run `!rollcapture rule skills` — this creates a *[RC] skills* handout. Open it in the journal.' },
                { prompt: 'Add the line `template: <name>` — where `<name>` is the roll template shown by dissect (e.g. "simple", "atk", "npc").' },
                { prompt: 'Add the line `name_field: <field>` — where `<field>` is the template field containing the skill name (e.g. "rname", "name"). This is how RollCapture identifies which skill was rolled.' },
                { prompt: 'Add the line `result: <field>` — where `<field>` is the inline roll field holding the total (e.g. "r1", "roll1").' },
                { prompt: 'Save the handout and run `!rollcapture reload` to load your new rule.',
                  ...ScriptKit.waitForCommand('!rollcapture reload')
                },
                { prompt: 'What does your character sheet call a stealth roll? This should match the value in the `name_field` when you roll stealth (e.g. "hide", "stealth").',
                  query: { name: 'rollname', default: 'stealth' }
                },
                { prompt: 'What is the **passive perception** attribute on player characters? (e.g. `passive_wisdom`, `passive_perception`)',
                  query: { name: 'perception', default: 'passive_wisdom' }
                },
                ScriptKit.handout(),
                { prompt: (ctx) => 'The script handout has been generated. Find **' + ctx.handoutName + '** from the journal and **drag it onto the master page** to create a map pin. Select the pin.',
                  select: 'pin', as: 'pin', min: 1, max: 1,
                  onContinue: validatePin
                },
                { prompt: '**Test:** Select an NPC token and roll stealth. RollCapture captures the result, which triggers this script. Players whose passive perception is lower than the roll should no longer see the NPC on their page.' },
            ],
            handout: (ctx) => ({
                notes: '!token-mod --set {& if any(@(viewer.' + ctx.params.perception + '[-999])) >= @(target.gl_' + ctx.params.rollname + '_result[0])}layer|objects{& else}layer|gmlayer{& end}',
                archived: false,
            }),
        });

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'truesight',
            description: 'Reveal true forms to viewers with truesight (swap token side)',
            guide: [
                { prompt: '**Truesight** — This script swaps multi-sided tokens between their disguised appearance (side 1) and true form (side 2) based on whether the viewer has truesight.\n\nSelect one or more **multi-sided tokens** that represent disguised creatures. *Side 1* = disguised, *side 2* = true form.',
                  select: 'token', as: 'disguised', min: 1,
                  onContinue: (ctx) => {
                      var tokens = Array.isArray(ctx.selected) ? ctx.selected : [ctx.selected];
                      var notMultiSided = tokens.filter(t => {
                          var sides = t.get('sides');
                          return !sides || sides.split('|').filter(Boolean).length < 2;
                      });
                      if (notMultiSided.length > 0) {
                          var names = notMultiSided.map(t => ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: t.get('name') || t.get('id'), moveAll: true, width: 30, height: 30 })).join(' ');
                          return ScriptKit.html.raw('These tokens are not multi-sided: ' + names + '<br>Set up multiple sides on them first.');
                      }
                  }
                },
                { prompt: 'Run `!gaslight var --setch can_disguise 1` with those tokens still selected. This marks them as targets for the truesight script.',
                  ...ScriptKit.waitForCommand('!gaslight var'),
                  onContinue: (ctx) => {
                      var tokens = Array.isArray(ctx.selections.disguised) ? ctx.selections.disguised : [ctx.selections.disguised];
                      var missing = tokens.filter(t => {
                          var charId = t.get('represents');
                          if (!charId) return true;
                          var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gl_can_disguise' })[0];
                          return !attr || attr.get('current') !== '1';
                      });
                      if (missing.length > 0) {
                          var names = missing.map(t => ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: t.get('name') || t.get('id'), moveAll: true, width: 30, height: 30 })).join(' ');
                          return ScriptKit.html.raw('These tokens do not have gl_can_disguise = 1 on their character: ' + names + '<br>Run <code>!gaslight var --setch can_disguise 1</code> (<code>--setch</code>, not <code>--set</code>) with them selected.');
                      }
                  }
                },
                { prompt: 'Now select viewer tokens that have **truesight** and run `!gaslight var --set truesight 1`.',
                  ...ScriptKit.waitForCommand('!gaslight var'),
                  select: 'token', as: 'viewers', min: 1,
                  onContinue: (ctx) => {
                      var tokens = Array.isArray(ctx.selected) ? ctx.selected : [ctx.selected];
                      var missing = tokens.filter(t => {
                          var notes = t.get('gmnotes') || '';
                          try { notes = decodeURIComponent(notes); } catch(e) {}
                          return notes.indexOf('gl_truesight') === -1 || notes.indexOf('gl_truesight: 1') === -1;
                      });
                      if (missing.length > 0) {
                          var names = missing.map(t => ScriptKit.html.pingObjImg(t.get('id'), { imgsrc: t.get('imgsrc'), label: t.get('name') || t.get('id'), moveAll: true, width: 30, height: 30 })).join(' ');
                          return ScriptKit.html.raw('These tokens do not have gl_truesight set: ' + names + '<br>Run <code>!gaslight var --set truesight 1</code> with them selected.');
                      }
                  }
                },
                ScriptKit.handout(),
                { prompt: (ctx) => 'Find **' + ctx.handoutName + '** from the journal and **drag it onto the master page** to create a map pin. Select the pin.',
                  select: 'pin', as: 'pin', min: 1, max: 1,
                  onContinue: validatePin
                },
                { prompt: '**Test:** Run `!gaslight eval --all`. Viewers with truesight should see *side 2* (true form) on disguised tokens.' },
            ],
            handout: {
                notes: '!token-mod --set {& if @(target.gl_can_disguise[0]) = 1 && any(@(viewer.gl_truesight[0])) = 1}currentSide|1{& else}currentSide|0{& end}',
                gmnotes: '---GASLIGHT-SCRIPT---\nfilter: has gl_can_disguise',
            },
        });

        ScriptKit.Gaslight.registerExample(SCRIPT_NAME, {
            name: 'madness',
            description: 'An afflicted player sees all tokens as enemies — allies swap to a chosen enemy image',
            guide: [
                { prompt: '**Madness** — When a player is "afflicted" (via a status marker), all other tokens on their page swap to a chosen enemy image with a dark tint and garbled names. Removing the marker restores everything.\n\nSelect a token that has the **status marker** you want to represent madness applied to it (e.g. "screaming"). This marker will trigger the effect when placed on a viewer\'s token.',
                  select: 'token', as: 'markerToken', min: 1, max: 1,
                  onContinue: (ctx) => {
                      var token = Array.isArray(ctx.selected) ? ctx.selected[0] : ctx.selected;
                      var markers = (token.get('statusmarkers') || '').split(',').filter(Boolean);
                      if (markers.length === 0) return 'That token has no status markers applied. Apply the marker you want to use for madness, then select the token.';
                      ctx.params._marker = markers[0].replace(/@\d+$/, '');
                  }
                },
                { prompt: 'Select an **enemy token** whose image will replace all other tokens for the afflicted viewer.',
                  select: 'token', as: 'enemyToken', min: 1, max: 1,
                  onContinue: (ctx) => {
                      var token = Array.isArray(ctx.selected) ? ctx.selected[0] : ctx.selected;
                      ctx.params._enemyId = token.get('id');
                  }
                },
                { prompt: (ctx) => 'To afflict a player, apply the **' + ctx.params._marker + '** status marker to their viewer token. Remove it to cure them.\n\nThe script will automatically store and restore original images.' },
                ScriptKit.handout(),
                { prompt: (ctx) => 'Find **' + ctx.handoutName + '** from the journal and **drag it onto the master page** to create a map pin. Select the pin.',
                  select: 'pin', as: 'pin', min: 1, max: 1,
                  onContinue: validatePin
                },
                { prompt: (ctx) => '**Test:** Apply the **' + ctx.params._marker + '** marker to a viewer token, then run `!gaslight eval --all`. All tokens on that viewer\'s page should swap to the enemy image. Remove the marker and re-eval to restore.' },
            ],
            handout: (ctx) => ({
                notes: '!token-mod --set {& if ([madness] any(@(viewer.statusmarkers)) ~ "' + ctx.params._marker + '") && !(any(@(viewer.token_id)) = @(target.token_id))}imgsrc|' + ctx.params._enemyId + ' tint_color|#000000 name|"i̒̋̃̑͝_͓̘̝̾̈̿s̵͔̤͚̬͔͉̼̞̦̲̑͊́̏̌̀̿͐ͣ̅͂̃͊͐ͦͤ̊ t̶̴̟̺̲̻̼̼̗̜̤̱̬͍̭̍ͭ͊̿ͮͬ̊̄̋̍̉̾͠_͎͔͍̻̩̣̌ͤͩ̿̾ͮḩ̛͈̫͚̺̼̻̦͔͊ͥͥ̄̅_̛͙ͭaṱ̨̩͈̘̻͚͖̺͕͔̹̱̫̠͙̳̖͕̠͙͆̍̋̍ͨͪͭ̓̂̂̀ͬͬ̃̽̈́̐̃ͯ̽̚͢͢͝ m̶̴̷̧͚̖̼͎͙̹̟̠͎̼̺͓̺̭̄̅͌̿̅̉̂͛̀̏͆̒̇̀̇ͬ̿̋ͮ̓̋̈͘͘͟ȩ̶̵̛̘̬̗̹̟̟̰͎̦͓̹͈͍̘̻ͦ̒̉̉̾̿̇̂̋ͬ́̄̆ͧ͌͊́̈́ͭͪ͛̈̚̚͟͝ͅ"{& else}imgsrc|@(gm_target.token_id) tint_color|transparent name|"@(gm_target.name)"{& end}',
                gmnotes: '---GASLIGHT-SCRIPT---\nfilter: characters\ntrigger: on change statusmarkers',
                archived: false,
            }),
        });
    };

    const checkInstall = () => {
        ensureState();
        // Crash recovery: revert Fetch playerscanids if we crashed mid-script
        if (state[SCRIPT_NAME].hasOwnProperty('_fetchPcidBackup') && state.Fetch && state.Fetch.settings) {
            state.Fetch.settings.playerscanids = state[SCRIPT_NAME]._fetchPcidBackup;
            delete state[SCRIPT_NAME]._fetchPcidBackup;
        }
        // createHelpHandout(); // Replaced by ScriptKit gen-help
        checkDanglingGroups();
        if (Object.keys(state[SCRIPT_NAME].activeGroups || {}).length > 0) {
            buildTriggerMap();
            registerAllCompProps();
        }

        // HUD recovery: if enabled but object is missing, recreate; if disabled but object exists, clean up
        var s = state[SCRIPT_NAME];
        if (s.hud.view) {
            var existing = findHudElement('view');
            if (!existing) updateViewHud();
        } else if (s.hud.viewId) {
            var orphan = getObj('text', s.hud.viewId);
            if (orphan) orphan.remove();
            s.hud.viewId = null;
        }
    };

    /**
     * When a linked token is deleted, delete its counterparts on other pages.
     */
    var destroying = false;
    const onTokenDestroyed = (obj) => {
        if (destroying) return;
        var s = state[SCRIPT_NAME];
        var tokenId = obj.get('id');
        var tokenPageId = obj.get('_pageid');

        // Find if this token is tracked in any active group
        var linkedIds = null;
        var activeGroup = null;
        Object.values(s.activeGroups).forEach(function(active) {
            if (active.linkedTokens[tokenId]) {
                linkedIds = active.linkedTokens[tokenId];
                activeGroup = active;
                // Clean up tracking
                delete active.linkedTokens[tokenId];
                linkedIds.forEach(function(id) {
                    if (active.linkedTokens[id]) {
                        active.linkedTokens[id] = active.linkedTokens[id].filter(function(lid) { return lid !== tokenId; });
                    }
                });
            } else {
                // Check if it's in someone else's list
                Object.entries(active.linkedTokens).forEach(function(entry) {
                    var idx = entry[1].indexOf(tokenId);
                    if (idx !== -1) {
                        entry[1].splice(idx, 1);
                        if (!linkedIds) {
                            linkedIds = [entry[0]].concat(entry[1].filter(function(id) { return id !== tokenId; }));
                            activeGroup = active;
                        }
                    }
                });
            }
        });

        if (!linkedIds || linkedIds.length === 0) return;
        if (!activeGroup) return;

        // Determine if this is a "parent" token:
        // - On the master page (parent for NPCs and player tokens)
        // - On the controlling player's page (parent for player-controlled tokens)
        var isParent = false;
        if (tokenPageId === activeGroup.masterPageId) {
            isParent = true;
        } else {
            // Check if this token is on its controlling player's page
            var controlledBy = obj.get('controlledby') || '';
            if (!controlledBy) {
                var charId = obj.get('represents');
                var character = charId ? getObj('character', charId) : null;
                if (character) controlledBy = character.get('controlledby') || '';
            }
            if (controlledBy) {
                var controllerIds = controlledBy.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
                var playerEntry = Object.entries(activeGroup.playerPages).find(function(e) {
                    return controllerIds.indexOf(e[0]) !== -1 && e[1].pageId === tokenPageId;
                });
                if (playerEntry) isParent = true;
            }
        }

        if (!isParent) {
            // Non-parent deletion: just clean up Mirror/Anchor links, don't cascade
            if (typeof Anchor !== 'undefined') Anchor.removeAnchor(tokenId);
            if (typeof Mirror !== 'undefined') Mirror.unlink([tokenId]);
            return;
        }

        // Parent deletion: cascade to all linked copies
        destroying = true;
        linkedIds.forEach(function(id) {
            if (typeof Anchor !== 'undefined') Anchor.removeAnchor(id);
            if (typeof Mirror !== 'undefined') Mirror.unlink([id]);
            var target = getObj('graphic', id);
            if (target) target.remove();
        });
        destroying = false;

        // Update initiative HUD if the deleted tokens were in the turn order
        if (s.hud.initiative) {
            var allRemovedIds = new Set([tokenId].concat(linkedIds));
            var order = JSON.parse(Campaign().get('turnorder') || '[]');
            var newOrder = order.filter(function(e) { return !allRemovedIds.has(e.id); });
            if (newOrder.length !== order.length) {
                Campaign().set('turnorder', JSON.stringify(newOrder));
                updateInitiativeHud();
            }
        }
    };

    /**
     * Universal relay interceptor. Automatically relays commands to linked tokens:
     * - If selected tokens or IDs in command reference master-page linked tokens
     *   AND no player-page tokens are selected/referenced → relay to all player pages.
     * - If player-page tokens are involved → only relay if command is in relayCommands.
     */
    const viewInterceptor = (msg) => {
        if (msg.type !== 'api') return;
        if (scripting) return;
        var s = state[SCRIPT_NAME];
        if (Object.keys(s.activeGroups).length === 0) return;
        var content = msg.content.trim();
        if (!content) return;
        var firstWord = content.split(' ')[0];
        if (firstWord === CMD || firstWord === '!mirror' || firstWord === '!anchor') return;

        // Check relaying set to prevent loops
        var selectedIds = (msg.selected || []).map(function(sel) { return sel._id; });
        var key = relayKey(content, 'player|' + msg.playerid, selectedIds);
        if (relaying.delete(key)) return;
        if (content.indexOf('{& select') !== -1) return;

        var tokens = (msg.selected || []).map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);

        // Scan command for token IDs that belong to linked groups
        var idRx = /-[A-Za-z0-9_-]{19}/g;
        var idsInCommand = (content.match(idRx) || []).filter(function(id, i, arr) { return arr.indexOf(id) === i; });

        // Classify: which IDs/tokens are on master pages vs player pages?
        var masterTokens = [];
        var hasPlayerPageRef = false;
        var activeEntry = null;

        // Check selected tokens
        tokens.forEach(function(t) {
            var pid = t.get('_pageid');
            var entry = Object.entries(s.activeGroups).find(function(e) { return e[1].masterPageId === pid; });
            if (entry) {
                masterTokens.push(t);
                if (!activeEntry) activeEntry = entry;
            } else {
                var playerEntry = Object.entries(s.activeGroups).find(function(e) {
                    return Object.values(e[1].playerPages).some(function(p) { return p.pageId === pid; });
                });
                if (playerEntry) hasPlayerPageRef = true;
            }
        });

        // Check IDs in command text
        idsInCommand.forEach(function(id) {
            // Skip IDs already accounted for by selection
            if (tokens.some(function(t) { return t.get('id') === id; })) return;
            var obj = getObj('graphic', id);
            if (!obj) return;
            var pid = obj.get('_pageid');
            var entry = Object.entries(s.activeGroups).find(function(e) { return e[1].masterPageId === pid; });
            if (entry) {
                // Check if this token is actually linked
                var linked = entry[1].linkedTokens[id] || [];
                var isLinked = linked.length > 0 || Object.values(entry[1].linkedTokens).some(function(arr) { return arr.indexOf(id) !== -1; });
                if (isLinked) {
                    masterTokens.push(obj);
                    if (!activeEntry) activeEntry = entry;
                }
            } else {
                var playerEntry = Object.entries(s.activeGroups).find(function(e) {
                    return Object.values(e[1].playerPages).some(function(p) { return p.pageId === pid; });
                });
                if (playerEntry) hasPlayerPageRef = true;
            }
        });

        if (masterTokens.length === 0 && !hasPlayerPageRef) return;

        // Universal relay: master-page refs, no player-page refs
        if (masterTokens.length > 0 && !hasPlayerPageRef) {
            var viewPlayerId = s.view;
            if (!viewPlayerId) return; // view off — no relay
            var targetPlayerIds = viewPlayerId === 'master'
                ? Object.keys(activeEntry[1].playerPages)
                : [viewPlayerId];
            executeRelay('player|' + msg.playerid, masterTokens, content, targetPlayerIds, false);
            return;
        }

        // Player-page involved: only relay if relayCommands allows it
        if (hasPlayerPageRef && s.config.relayCommands.indexOf(firstWord) !== -1) {
            // Find source player page
            var sourcePlayerId = null;
            var entry = null;
            Object.entries(s.activeGroups).forEach(function(e) {
                Object.entries(e[1].playerPages).forEach(function(pp) {
                    var srcToken = tokens.find(function(t) { return t.get('_pageid') === pp[1].pageId; });
                    if (srcToken) { entry = e; sourcePlayerId = pp[0]; }
                });
            });
            if (!entry) return;
            var targetPlayerIds = Object.keys(entry[1].playerPages).filter(function(id) { return id !== sourcePlayerId; });
            executeRelay('player|' + msg.playerid, tokens, content, targetPlayerIds, true);
        }
    };

    // =========================================================================
    // Initiative Tracking — sync turn order across linked tokens
    // =========================================================================

    /**
     * Get all linked token IDs for a given token across all active groups.
     * Returns { linkedIds: [...], isMaster: bool, masterPageId: string|null }
     */
    const getLinkedInfo = (tokenId) => {
        var s = state[SCRIPT_NAME];
        var linkedIds = [];
        var isMaster = false;
        var masterPageId = null;
        Object.values(s.activeGroups).forEach(function(active) {
            var ids = active.linkedTokens[tokenId];
            if (ids && ids.length > 0) {
                linkedIds = linkedIds.concat(ids);
                masterPageId = active.masterPageId;
                var obj = getObj('graphic', tokenId);
                if (obj && obj.get('_pageid') === active.masterPageId) isMaster = true;
            }
        });
        return { linkedIds: linkedIds, isMaster: isMaster, masterPageId: masterPageId };
    };

    /**
     * Determine if a token ID is a master token (on master page) in any active group.
     */
    const isOnMasterPage = (tokenId) => {
        var s = state[SCRIPT_NAME];
        var obj = getObj('graphic', tokenId);
        if (!obj) return false;
        var pageId = obj.get('_pageid');
        return Object.values(s.activeGroups).some(function(active) {
            return active.masterPageId === pageId;
        });
    };

    const isMasterToken = (tokenId) => {
        var s = state[SCRIPT_NAME];
        if (!isOnMasterPage(tokenId)) return false;
        return Object.values(s.activeGroups).some(function(active) {
            return !!active.linkedTokens[tokenId];
        });
    };

    /**
     * Check if two token IDs are linked (in the same link group).
     */
    const areLinked = (tokenIdA, tokenIdB) => {
        var info = getLinkedInfo(tokenIdA);
        return info.linkedIds.indexOf(tokenIdB) !== -1;
    };

    /**
     * Handle turnorder changes: sync linked tokens, apply [GM] tags, auto-skip children.
     */
    var _turnOrderDebounceId = null;
    var _turnOrderPrev = null;

    const onTurnOrderChanged = (obj, prev) => {
        var s = state[SCRIPT_NAME];
        if (Object.keys(s.activeGroups).length === 0) return;

        // Capture prev from the first event in the batch
        if (!_turnOrderDebounceId) {
            _turnOrderPrev = JSON.parse(prev.turnorder || '[]');
        }
        if (_turnOrderDebounceId) clearTimeout(_turnOrderDebounceId);
        _turnOrderDebounceId = setTimeout(function() {
            _turnOrderDebounceId = null;
            processTurnOrderChange(_turnOrderPrev);
        }, 100);
    };

    const processTurnOrderChange = (oldOrder) => {
        var s = state[SCRIPT_NAME];
        if (Object.keys(s.activeGroups).length === 0) return;

        var newOrder = JSON.parse(Campaign().get('turnorder') || '[]');

        // Detect direction early (before skip/reorder modifies newOrder)
        var hudDirection = 'none';
        if (oldOrder.length === newOrder.length && newOrder.length > 0) {
            var targetEntry = newOrder.find(function(e) { return e.id && e.id !== '-1'; });
            if (targetEntry) {
                var newIdx = newOrder.indexOf(targetEntry);
                var oldIdx = -1;
                for (var oi = 0; oi < oldOrder.length; oi++) {
                    if (oldOrder[oi].id === targetEntry.id) { oldIdx = oi; break; }
                }
                if (oldIdx !== -1 && oldIdx !== newIdx) {
                    var rotAmount = oldIdx - newIdx;
                    var len = newOrder.length;
                    // Normalize rotation
                    rotAmount = ((rotAmount % len) + len) % len;
                    var rotated = newOrder.slice(len - rotAmount).concat(newOrder.slice(0, len - rotAmount));
                    var oldIdStr = oldOrder.map(function(e) { return e.id; }).join(',');
                    var rotIdStr = rotated.map(function(e) { return e.id; }).join(',');
                    if (rotIdStr === oldIdStr) {
                        hudDirection = rotAmount <= len / 2 ? 'forward' : 'backward';
                    }
                }
            }
        }

        // Detect additions: entries in newOrder not in oldOrder
        var oldIds = new Set(oldOrder.map(function(e) { return e.id; }));
        var newIds = new Set(newOrder.map(function(e) { return e.id; }));
        var added = newOrder.filter(function(e) { return e.id && e.id !== '-1' && !oldIds.has(e.id); });
        var removed = oldOrder.filter(function(e) { return e.id && e.id !== '-1' && !newIds.has(e.id); });

        var modified = false;

        var modified = false;

        // Handle additions: add linked counterparts
        added.forEach(function(entry) {
            var info = getLinkedInfo(entry.id);
            if (info.linkedIds.length === 0) return;
            // Deduplicate linked IDs (can accumulate duplicates from repeated splits)
            var uniqueLinkedIds = info.linkedIds.filter(function(id, i) { return info.linkedIds.indexOf(id) === i; });
            // Only process if none of this entry's linked tokens are already in the order
            var existingIds = new Set(newOrder.map(function(e) { return e.id; }));
            var alreadyHasLinked = uniqueLinkedIds.some(function(lid) { return existingIds.has(lid); });
            if (alreadyHasLinked) return;
            uniqueLinkedIds.forEach(function(linkedId) {
                if (existingIds.has(linkedId)) return;
                var linkedObj = getObj('graphic', linkedId);
                var pushEntry = { id: linkedId, pr: entry.pr };
                if (linkedObj) pushEntry._pageid = linkedObj.get('_pageid');
                newOrder.push(pushEntry);
                modified = true;
            });
        });

        // Handle removals: remove linked counterparts
        removed.forEach(function(entry) {
            var info = getLinkedInfo(entry.id);
            if (info.linkedIds.length === 0) return;
            var before = newOrder.length;
            newOrder = newOrder.filter(function(e) {
                return info.linkedIds.indexOf(e.id) === -1;
            });
            if (newOrder.length !== before) modified = true;
        });

        // Handle value changes: sync initiative values across linked tokens
        newOrder.forEach(function(entry) {
            if (!entry.id || entry.id === '-1') return;
            var oldEntry = oldOrder.find(function(e) { return e.id === entry.id; });
            if (!oldEntry || oldEntry.pr === entry.pr) return;
            // Value changed — propagate to linked tokens
            var info = getLinkedInfo(entry.id);
            if (info.linkedIds.length === 0) return;
            info.linkedIds.forEach(function(linkedId) {
                var linkedEntry = newOrder.find(function(e) { return e.id === linkedId; });
                if (linkedEntry && linkedEntry.pr !== entry.pr) {
                    linkedEntry.pr = entry.pr;
                    modified = true;
                }
            });
        });

        // Reorder: group linked tokens together, master first (only on additions)
        if (added.length > 0) {
            var reordered = reorderInitiative(newOrder);
            if (JSON.stringify(reordered) !== JSON.stringify(newOrder)) {
                newOrder = reordered;
                modified = true;
            }
        }

        // Auto-skip: if turn advanced and new top is linked to the entry that just left the top
        // Auto-skip: if current top is a linked non-master token, skip in the correct direction
        if (newOrder.length > 1 && newOrder[0].id && newOrder[0].id !== '-1') {
            var topId = newOrder[0].id;
            var topInfo = getLinkedInfo(topId);
            if (topInfo.linkedIds.length > 0 && !topInfo.isMaster) {
                // Detect direction
                var isForward = oldOrder.length > 0 && newOrder[newOrder.length - 1].id === oldOrder[0].id;
                var isBackward = oldOrder.length > 0 && newOrder[0].id === oldOrder[oldOrder.length - 1].id;

                if (isForward || isBackward) {
                    var startId = topId;
                    var safety = newOrder.length;

                    if (isForward) {
                        // Rotate forward: shift to end until master/unlinked is on top
                        while (safety-- > 0 && newOrder.length > 1) {
                            newOrder.push(newOrder.shift());
                            var cId = newOrder[0].id;
                            if (!cId || cId === '-1') break;
                            if (cId === startId) break;
                            var cInfo = getLinkedInfo(cId);
                            if (cInfo.linkedIds.length === 0 || cInfo.isMaster) break;
                        }
                    } else {
                        // Rotate backward: pop from end to front until master/unlinked is on top
                        while (safety-- > 0 && newOrder.length > 1) {
                            newOrder.unshift(newOrder.pop());
                            var cId = newOrder[0].id;
                            if (!cId || cId === '-1') break;
                            if (cId === startId) break;
                            var cInfo = getLinkedInfo(cId);
                            if (cInfo.linkedIds.length === 0 || cInfo.isMaster) break;
                        }
                    }
                    modified = true;
                } else {
                    // Not forward/backward — manual drag. Reorder to group children after master.
                    var reordered = reorderInitiative(newOrder);
                    if (JSON.stringify(reordered) !== JSON.stringify(newOrder)) {
                        newOrder = reordered;
                        modified = true;
                    }
                }
            }
        }

        // Always ensure linked tokens are grouped below their master
        var reordered = reorderInitiative(newOrder);
        if (JSON.stringify(reordered) !== JSON.stringify(newOrder)) {
            newOrder = reordered;
            modified = true;
        }

        // Apply round calculation for custom turns that reached the top via our rotation
        // Only if we modified the order (if not modified, Roll20 handled it naturally and already applied the formula)
        if (modified && newOrder.length > 0 && newOrder[0].id === '-1' && newOrder[0].formula) {
            var topEntry = newOrder[0];
            // Only apply if this custom turn was NOT already at the top
            var wasAlreadyTop = oldOrder.length > 0 && oldOrder[0].id === '-1' && oldOrder[0].custom === topEntry.custom && oldOrder[0].pr === topEntry.pr;
            if (!wasAlreadyTop) {
                var formula = topEntry.formula.trim();
                var currentPr = parseFloat(topEntry.pr) || 0;
                var val = parseFloat(formula.replace(/^[+-]/, '')) || 0;
                var isAdd = formula.startsWith('+');
                // Forward = apply normally, backward = apply inverse
                if (hudDirection === 'backward') isAdd = !isAdd;
                topEntry.pr = isAdd ? currentPr + val : currentPr - val;
            }
        }

        if (modified) {
            var finalJson = JSON.stringify(newOrder);
            Campaign().set('turnorder', finalJson);
        }

        // Update initiative HUD if enabled
        if (state[SCRIPT_NAME].hud.initiative) {
            updateInitiativeHud(hudDirection);
        }
    };

    /**
     * Reorder initiative: group linked tokens together with master first in each group.
     */
    const reorderInitiative = (order) => {
        var s = state[SCRIPT_NAME];
        var result = [];
        var placed = new Set();

        order.forEach(function(entry) {
            if (placed.has(entry.id)) return;
            if (!entry.id || entry.id === '-1') {
                result.push(entry);
                // Don't add '-1' to placed — multiple custom entries share this ID
                return;
            }

            var info = getLinkedInfo(entry.id);
            if (info.linkedIds.length === 0) {
                // Not a linked token — just add it
                result.push(entry);
                placed.add(entry.id);
                return;
            }

            // Skip children — they'll be pulled in when we reach their master
            if (!isMasterToken(entry.id)) return;

            // Find all entries in this link group
            var groupIds = [entry.id].concat(info.linkedIds);
            var groupEntries = order.filter(function(e) {
                return groupIds.indexOf(e.id) !== -1 && !placed.has(e.id);
            });

            // Sort: master first, then children
            groupEntries.sort(function(a, b) {
                var aIsMaster = isMasterToken(a.id) ? 0 : 1;
                var bIsMaster = isMasterToken(b.id) ? 0 : 1;
                return aIsMaster - bIsMaster;
            });

            groupEntries.forEach(function(e) {
                result.push(e);
                placed.add(e.id);
            });
        });

        return result;
    };

    /**
     * !gaslight init [sync] [trim]
     * sync (default): ensure all linked tokens are in initiative, grouped with masters first.
     * trim: remove entries for tokens that no longer exist.
     * Both can be combined: trim runs first, then sync.
     */
    const doInit = (msg, args) => {
        var s = state[SCRIPT_NAME];
        var doTrim = args.indexOf('trim') !== -1;
        var doSync = args.indexOf('sync') !== -1 || args.length === 0 || (args.length === 1 && doTrim);

        var order = JSON.parse(Campaign().get('turnorder') || '[]');
        if (order.length === 0) { reply(msg, 'Init', 'Turn order is empty.'); return; }

        var trimmed = 0;
        var added = 0;
        var warnings = [];

        // Trim: remove entries for tokens that no longer exist
        if (doTrim) {
            var before = order.length;
            order = order.filter(function(e) {
                if (!e.id || e.id === '-1') return true;
                return !!getObj('graphic', e.id);
            });
            trimmed = before - order.length;
        }

        // Sync: add missing linked tokens, add missing masters, regroup
        if (doSync) {
            var existingIds = new Set(order.map(function(e) { return e.id; }));
            var toAdd = [];

            order.forEach(function(entry) {
                if (!entry.id || entry.id === '-1') return;
                var info = getLinkedInfo(entry.id);
                if (info.linkedIds.length === 0) {
                    if (isOnMasterPage(entry.id)) {
                        var token = getObj('graphic', entry.id);
                        var name = token ? (token.get('name') || entry.id) : entry.id;
                        warnings.push(name + ' is in initiative but has no linked tokens (not staged?)');
                    }
                    return;
                }

                // Add master if missing
                if (!isMasterToken(entry.id)) {
                    var masterId = info.linkedIds.find(function(lid) { return isMasterToken(lid); });
                    if (masterId && !existingIds.has(masterId)) {
                        var masterObj = getObj('graphic', masterId);
                        toAdd.push({ id: masterId, pr: entry.pr, _pageid: masterObj ? masterObj.get('_pageid') : undefined });
                        existingIds.add(masterId);
                        added++;
                    }
                }

                // Add missing linked copies
                info.linkedIds.forEach(function(linkedId) {
                    if (existingIds.has(linkedId)) return;
                    var linkedObj = getObj('graphic', linkedId);
                    if (!linkedObj) return;
                    toAdd.push({ id: linkedId, pr: entry.pr, _pageid: linkedObj.get('_pageid') });
                    existingIds.add(linkedId);
                    added++;
                });
            });

            order = order.concat(toAdd);
            order = reorderInitiative(order);
        }
        Campaign().set('turnorder', JSON.stringify(order));

        var parts = [];
        if (doTrim) parts.push(trimmed + ' stale entry(s) trimmed');
        if (doSync) parts.push(added + ' entry(s) added');
        var out = parts.join(', ') + '.';
        if (warnings.length > 0) {
            out += '<br><br>⚠️ ' + warnings.join('<br>⚠️ ');
        }
        reply(msg, 'Init', out);
        if (s.hud.initiative) {
            // Refresh tags on existing entries
            if (s.hud.initData && s.hud.initData.entries) {
                s.hud.initData.entries.forEach(function(e) {
                    if (e.sourceId.startsWith('custom:')) return;
                    var pin = getObj('pin', e.tokenId);
                    if (!pin) return;
                    var tagStr = computeHudTag(e.sourceId);
                    var sourceToken = getObj('graphic', e.sourceId);
                    var name = sourceToken ? (sourceToken.get('name') || '') : '';
                    pin.set('title', ((tagStr ? '⚠️ ' : '') + name).trim());
                    pin.set('notes', tagStr || '');
                });
            }
            updateInitiativeHud();
        }
    };

    // =========================================================================
    // HUD System — on-canvas indicators
    // =========================================================================

    const HUD_PREFIX = 'gaslight_hud_';

    var _hudCreatedIds = new Set();
    const createHudObj = (type, props) => {
        var obj = createObj(type, props);
        if (obj) _hudCreatedIds.add(obj.get('id'));
        return obj;
    };

    /**
     * Get the master page ID from the first active group.
     */
    const getHudPageId = () => {
        var s = state[SCRIPT_NAME];
        var group = Object.values(s.activeGroups)[0];
        return group ? group.masterPageId : null;
    };

    /**
     * Update or create the current-turn indicator (pathv2 rectangle around the current turn's token).
     */
    const updateTurnReticle = () => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initiative || !s.hud.reticle) return;
        if (!s.hud.initData) s.hud.initData = {};
        if (!s.hud.reticleData) s.hud.reticleData = {};
        var data = s.hud.initData;
        var rd = s.hud.reticleData;

        var pageId = getHudPageId();
        if (!pageId) { removeTurnReticle(); return; }

        // Find current turn master token
        var order = JSON.parse(Campaign().get('turnorder') || '[]');
        if (order.length === 0) { removeTurnReticle(); return; }

        var topEntry = order[0];
        if (!topEntry.id || topEntry.id === '-1') { removeTurnReticle(); return; }

        // Find the master token for this entry
        var tokenId = topEntry.id;
        if (!isMasterToken(tokenId)) {
            var info = getLinkedInfo(tokenId);
            var masterId = info.linkedIds.find(function(lid) { return isMasterToken(lid); });
            if (masterId) tokenId = masterId;
        }

        var token = getObj('graphic', tokenId);
        if (!token || token.get('_pageid') !== pageId) { removeTurnReticle(); return; }

        var tokenW = token.get('width');
        var tokenH = token.get('height');
        var x = token.get('left') + (rd.xOffset || 0) * tokenW;
        var y = token.get('top') + (rd.yOffset || 0) * tokenH;
        var w = tokenW * (rd.widthScale || 1);
        var h = tokenH * (rd.heightScale || 1);
        var stroke = rd.stroke || data.highlightStroke || defaultInitHud.highlightStroke;
        var strokeWidth = rd.strokeWidth || data.highlightStrokeWidth || defaultInitHud.highlightStrokeWidth;
        var hlRotation = data.highlightRotation != null ? data.highlightRotation : 45;
        var reticleRotation = hlRotation + (rd.rotationOffset != null ? rd.rotationOffset : -hlRotation);

        // Create or update
        var reticle = rd.id ? getObj('pathv2', rd.id) : null;
        if (reticle) {
            reticle.set({
                x: x,
                y: y,
                points: JSON.stringify([[0, 0], [w, h]]),
                stroke: stroke,
                stroke_width: strokeWidth,
                rotation: reticleRotation,
            });
        } else {
            reticle = createHudObj('pathv2', {
                _pageid: pageId,
                layer: 'foreground',
                shape: 'rec',
                x: x,
                y: y,
                points: JSON.stringify([[0, 0], [w, h]]),
                stroke: stroke,
                stroke_width: strokeWidth,
                fill: 'transparent',
                rotation: reticleRotation,
            });
            if (reticle) rd.id = reticle.get('id');
        }

        // Track which token we're following
        rd.tokenId = tokenId;
    };

    /**
     * Remove the current-turn indicator.
     */
    const removeTurnReticle = () => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.reticleData) return;
        var rd = s.hud.reticleData;
        if (rd.id) {
            var reticle = getObj('pathv2', rd.id);
            delete rd.id;
            if (reticle) reticle.remove();
        }
        delete rd.tokenId;
    };

    /**
     * Find an existing HUD text object by stored ID.
     */
    const findHudElement = (name) => {
        var s = state[SCRIPT_NAME];
        var id = s.hud[name + 'Id'];
        if (!id) return null;
        return getObj('text', id) || null;
    };

    /**
     * Create or update the view HUD element.
     */
    const updateViewHud = () => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.view) return;

        var pageId = getHudPageId();
        if (!pageId) return;

        var page = getObj('page', pageId);
        if (!page) return;

        // Determine display text
        var label;
        if (s.view === null) {
            label = '🔴 RELAY OFF';
        } else if (s.view === 'master') {
            label = '🟢 RELAY: ALL';
        } else {
            // Resolve player name
            var playerName = s.view;
            Object.values(s.activeGroups).forEach(function(g) {
                var entry = g.playerPages[s.view];
                if (entry && entry.name) playerName = entry.name;
            });
            label = '🔵 VIEW: ' + playerName;
        }

        // Find existing or create new
        var existing = findHudElement('view');
        if (existing) {
            existing.set('text', label);
        } else {
            // Use stored position/size or defaults
            var vd = s.hud.viewData || {};
            var pageWidth = page.get('width') * 70;
            var obj = createHudObj('text', {
                _pageid: pageId,
                layer: 'foreground',
                text: label,
                left: Math.round((vd.leftNorm || defaultViewHud.leftNorm) * pageWidth),
                top: vd.top || defaultViewHud.top,
                font_size: vd.fontSize || defaultViewHud.fontSize,
                color: vd.color || defaultViewHud.color,
                stroke: vd.stroke || defaultViewHud.stroke,
                font_family: vd.fontFamily || defaultViewHud.fontFamily,
                rotation: vd.rotation || 0,
            });
            s.hud.viewId = obj.get('id');
        }
    };

    /**
     * Remove the view HUD element (programmatic). Clears ID first so destroy handler ignores it.
     */
    const removeViewHud = () => {
        var s = state[SCRIPT_NAME];
        var id = s.hud.viewId;
        s.hud.viewId = null;
        if (id) {
            var obj = getObj('text', id);
            if (obj) obj.remove();
        }
    };

    // ---- Initiative HUD ----

    const defaultViewHud = {
        leftNorm: 0.5,
        top: 100,
        fontSize: 40,
        fontFamily: 'Contrail One',
        color: '#ffffff',
        stroke: '#000000',
    };

    /**
     * Convert a pin's x/y (the "point" where the teardrop points) to its visual center.
     * Pin scale 0.25 = 10px, scale 2.0 = 80px → size = scale * 40.
     * Visual center is offset upward by half the pin's visual height.
     */
    const toPinCenter = (pin) => {
        var scale = pin.get('scale') || 1;
        var size = scale * 40;
        return { x: pin.get('x'), y: pin.get('y') - size / 2 };
    };

    /**
     * Convert a target center coordinate to the pin x/y that would place
     * the pin's visual center at that point.
     */
    const toPinPosition = (x, y, scale) => {
        scale = scale || 1;
        var size = scale * 40;
        return { x: x, y: y + size / 2 };
    };

    const defaultInitHud = {
        tokenSize: 50,
        tokenPadding: 20,
        vPadding: 15,
        hPadding: 10,
        textOffset: 25,
        textFontSize: 16,
        textFontFamily: 'Contrail One',
        textColor: '#ffffff',
        textStroke: '#000000',
        frameStroke: '#ffffff',
        frameFill: 'transparent',
        frameStrokeWidth: 3,
        highlightStroke: '#ffcc00',
        highlightFill: 'transparent',
        highlightStrokeWidth: 5,
        currentTurnOffset: 0.5,
        entries: [],
        frameId: null,
        highlightId: null,
        pos: null,
        frameSize: null,
    };

    const hudSlotY = (frameCenter, offset, tokenSize, tokenPadding) => {
        return frameCenter + offset * (tokenSize + tokenPadding);
    };
    const hudPinY = (frameCenter, offset, tokenSize, tokenPadding) => {
        return hudSlotY(frameCenter, offset, tokenSize, tokenPadding) + tokenSize / 2;
    };

    /**
     * Compute how many slots should be above vs below the diamond,
     * distributing proportionally based on available space on each side.
     * Returns { above, below } counts.
     */
    const computeHudSlotDistribution = (count, slotsBelow, slotsAbove) => {
        // Entry 0 is in the diamond. Remaining entries fill below then above proportionally.
        var remaining = Math.min(count - 1, slotsBelow + slotsAbove);
        if (remaining <= 0) return { below: 0, above: 0 };
        var totalSlots = slotsBelow + slotsAbove;
        if (totalSlots === 0) return { below: 0, above: 0 };
        var below = Math.min(slotsBelow, Math.round(remaining * slotsBelow / totalSlots));
        var above = Math.min(slotsAbove, remaining - below);
        // If rounding left us short, add to whichever side has room
        while (below + above < remaining) {
            if (below < slotsBelow) below++;
            else if (above < slotsAbove) above++;
            else break;
        }
        return { below: below, above: above };
    };

    /**
     * Compute token size from frame width or stored override.
     */
    const getHudTokenSize = (frame) => {
        var s = state[SCRIPT_NAME];
        if (s.hud.initData && s.hud.initData.tokenSize) return s.hud.initData.tokenSize;
        var points = JSON.parse(frame.get('points') || '[]');
        var frameWidth = points.length >= 2 ? points[1][0] - points[0][0] : defaultInitHud.tokenSize + 2 * defaultInitHud.hPadding;
        var hPad = (s.hud.initData && s.hud.initData.hPadding) || defaultInitHud.hPadding;
        return Math.max(10, frameWidth - 2 * hPad);
    };

    /**
     * Get the deduped turn order (master tokens only, skip children).
     */
    /**
     * Generate a matching key for a turn order entry.
     * Tokens: use id. Customs: use custom + formula + _pageid + pr.
     * pr is included for customs because two customs can share the same immutable fields.
     */
    const turnEntryKey = (entry) => {
        if (entry.id && entry.id !== '-1') return entry.id;
        return 'custom§' + (entry.custom != null ? entry.custom : '') + '§' + (entry.formula != null ? entry.formula : '') + '§' + entry._pageid + '§' + entry.pr;
    };

    const getHudTurnOrder = () => {
        var s = state[SCRIPT_NAME];
        var order = JSON.parse(Campaign().get('turnorder') || '[]');
        // Collect all page IDs belonging to active groups
        var groupPageIds = new Set();
        Object.values(s.activeGroups).forEach(function(active) {
            groupPageIds.add(active.masterPageId);
            Object.values(active.playerPages).forEach(function(p) { groupPageIds.add(p.pageId); });
        });
        // Track which linked groups we've already included (by master ID or first seen ID)
        var seenGroups = new Set();
        return order.filter(function(entry) {
            if (!entry.id || entry.id === '-1') return true; // customs always
            var token = getObj('graphic', entry.id);
            if (!token) return false; // stale entry
            var pageId = token.get('_pageid');
            if (!groupPageIds.has(pageId)) return false; // not on a group page
            // Check if this token is part of a linked group
            var info = getLinkedInfo(entry.id);
            if (info.linkedIds.length === 0) return true; // unlinked token, always show
            // For linked tokens: only show if this is the master, or if master isn't in the order
            if (isMasterToken(entry.id)) {
                seenGroups.add(entry.id);
                return true;
            }
            // It's a child — check if its master is in the order
            var masterId = info.linkedIds.find(function(lid) { return isMasterToken(lid); });
            if (masterId && seenGroups.has(masterId)) return false; // master already shown
            if (masterId && order.some(function(e) { return e.id === masterId; })) {
                seenGroups.add(masterId);
                return false; // master is in order, it will be shown when we reach it
            }
            // No master in order — show this child as representative
            if (!seenGroups.has(entry.id)) {
                seenGroups.add(entry.id);
                return true;
            }
            return false;
        });
    };

    /**
     * Compute the tag string for a HUD entry (which views are missing this token's turn).
     * Returns '' if present on all views, or a "Missing from" list.
     */
    const computeHudTag = (sourceId) => {
        var s = state[SCRIPT_NAME];
        var order = JSON.parse(Campaign().get('turnorder') || '[]');
        var activeGroup = Object.values(s.activeGroups)[0];
        if (!activeGroup) return '';

        // Get all view names: GM + each player
        var allViews = ['GM'];
        var viewPageMap = { GM: activeGroup.masterPageId };
        Object.entries(activeGroup.playerPages).forEach(function(entry) {
            var name = entry[1].name || entry[0].slice(0, 6);
            allViews.push(name);
            viewPageMap[name] = entry[1].pageId;
        });

        // Find which pages have a turn for this token (or its linked copies)
        var info = getLinkedInfo(sourceId);
        var groupIds = new Set([sourceId].concat(info.linkedIds));
        var pagesWithTurn = new Set();
        order.forEach(function(e) {
            if (groupIds.has(e.id)) {
                var token = getObj('graphic', e.id);
                if (token) pagesWithTurn.add(token.get('_pageid'));
            }
        });

        // Find which views are missing
        var missingViews = allViews.filter(function(v) { return !pagesWithTurn.has(viewPageMap[v]); });

        if (missingViews.length === 0) return ''; // on all views
        return 'No Turns For:\n' + missingViews.map(function(v) { return v.length > 70 ? v.slice(0, 67) + '...' : v; }).join('\n');
    };

    /**
     * Draw a rectangle path on the foreground layer.
     */
    const createFramePath = (pageId, left, top, width, height, data) => {
        return createHudObj('pathv2', {
            _pageid: pageId,
            layer: 'foreground',
            shape: 'rec',
            x: left,
            y: top,
            points: JSON.stringify([[0, 0], [width, height]]),
            stroke: (data && data.frameStroke) || defaultInitHud.frameStroke,
            stroke_width: (data && data.frameStrokeWidth) || defaultInitHud.frameStrokeWidth,
            fill: (data && data.frameFill) || defaultInitHud.frameFill,
        });
    };

    /**
     * Build/rebuild the initiative HUD.
     */
    const updateInitiativeHud = (direction) => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initiative) return;

        var pageId = getHudPageId();
        if (!pageId) return;

        var page = getObj('page', pageId);
        if (!page) return;

        var order = getHudTurnOrder();
        if (!s.hud.initData) s.hud.initData = {};
        if (!s.hud.initData.entries) s.hud.initData.entries = [];
        var data = s.hud.initData;

        // If no turns, remove frame and highlight (will be recreated when turns are added)
        if (order.length === 0) {
            // Remove all entries
            (data.entries || []).forEach(function(entry) {
                var pin = getObj('pin', entry.tokenId);
                var txt = getObj('text', entry.textId);
                if (pin) pin.remove();
                if (txt) txt.remove();
            });
            data.entries = [];
            // Remove highlight (clear ID first so destroy handler ignores it)
            if (data.highlightId) {
                var hlId = data.highlightId;
                delete data.highlightId;
                var hl = getObj('pathv2', hlId);
                if (hl) hl.remove();
            }
            // Remove frame (clear ID first so destroy handler ignores it)
            if (data.frameId) {
                var frId = data.frameId;
                delete data.frameId;
                var fr = getObj('pathv2', frId);
                if (fr) fr.remove();
            }
            // Remove reticle
            removeTurnReticle();
            return;
        }

        var frameWidth = defaultInitHud.tokenSize + 2 * defaultInitHud.hPadding;

        // Create frame if missing
        if (!data.frameId || !getObj('pathv2', data.frameId)) {
            var pos = data.pos || { left: 100, top: Math.round(page.get('height') * 70 / 2) };
            var frameHeight = 5.5 * (defaultInitHud.tokenSize + defaultInitHud.tokenPadding) + 2 * defaultInitHud.vPadding;
            var frameSize = data.frameSize || { width: frameWidth, height: frameHeight };
            var frame = createFramePath(pageId, pos.left, pos.top, frameSize.width, frameSize.height, data);
            data.frameId = frame.get('id');
            data.pos = pos;
            data.frameSize = frameSize;
        }

        var frame = getObj('pathv2', data.frameId);
        if (!frame) return;

        // Create highlight indicator if missing
        if (!data.highlightId || !getObj('pathv2', data.highlightId)) {
            var hlTokenSize = data.tokenSize || defaultInitHud.tokenSize;
            var hlSize = hlTokenSize + 15;
            var hlOffset = data.currentTurnOffset != null ? data.currentTurnOffset : defaultInitHud.currentTurnOffset;
            var frameH = JSON.parse(frame.get('points') || '[]');
            var fH = frameH.length >= 2 ? frameH[1][1] - frameH[0][1] : 510;
            var vPadHL = data.vPadding || defaultInitHud.vPadding;
            var usableTopHL = frame.get('y') - fH / 2 + hlTokenSize / 2 + vPadHL;
            var usableBotHL = frame.get('y') + fH / 2 - hlTokenSize / 2 - vPadHL;
            var hlStep = hlTokenSize + (data.tokenPadding || defaultInitHud.tokenPadding);
            var hlMid = (usableTopHL + usableBotHL) / 2;
            var rawHlCenter = usableTopHL + (usableBotHL - usableTopHL) * hlOffset;
            var hlSlotFromCenter = hlStep > 0 ? Math.round((rawHlCenter - hlMid) / hlStep) : 0;
            var hlY = hlMid + hlSlotFromCenter * hlStep;
            var highlight = createHudObj('pathv2', {
                _pageid: pageId,
                layer: 'foreground',
                shape: 'rec',
                x: frame.get('x'),
                y: hlY,
                points: JSON.stringify([[0, 0], [hlSize, hlSize]]),
                stroke: data.highlightStroke || defaultInitHud.highlightStroke,
                stroke_width: data.highlightStrokeWidth || defaultInitHud.highlightStrokeWidth,
                fill: data.highlightFill || defaultInitHud.highlightFill,
                rotation: data.highlightRotation != null ? data.highlightRotation : 45,
            });
            data.highlightId = highlight.get('id');
        }

        var tokenSize = getHudTokenSize(frame);
        var frameLeft = frame.get('x');
        var frameTop = frame.get('y');
        var points = JSON.parse(frame.get('points') || '[]');
        var frameHeight = points.length >= 2 ? points[1][1] - points[0][1] : 510;
        var frameTopEdge = frameTop - frameHeight / 2;

        // Remove old entries no longer in the order
        // For tokens: match by ID. For customs: if order has fewer customs than we have, remove extras.
        var orderTokenIds = order.filter(function(e) { return e.id && e.id !== '-1'; }).map(function(e) { return e.id; });
        var orderCustomCount = order.filter(function(e) { return !e.id || e.id === '-1'; }).length;
        var currentCustomCount = data.entries.filter(function(e) { return e.sourceId && e.sourceId.startsWith('custom:'); }).length;

        var toRemove = [];
        var customsToRemove = currentCustomCount - orderCustomCount;
        data.entries.forEach(function(entry, i) {
            if (entry.sourceId && entry.sourceId.startsWith('custom:')) {
                if (customsToRemove > 0) { toRemove.push(i); customsToRemove--; }
            } else if (orderTokenIds.indexOf(entry.sourceId) === -1) {
                toRemove.push(i);
            }
        });
        toRemove.reverse().forEach(function(i) {
            var entry = data.entries[i];
            var pin = getObj('pin', entry.tokenId);
            var txt = getObj('text', entry.textId);
            // Splice first so destroy handler ignores
            data.entries.splice(i, 1);
            if (pin) pin.remove();
            if (txt) txt.remove();
        });

        // Add new entries not yet in the HUD
        var existingTokenIds = data.entries.filter(function(e) { return !e.sourceId.startsWith('custom:'); }).map(function(e) { return e.sourceId; });
        var customsToAdd = orderCustomCount - data.entries.filter(function(e) { return e.sourceId && e.sourceId.startsWith('custom:'); }).length;

        order.forEach(function(entry) {
            var isCustom = !entry.id || entry.id === '-1';

            if (isCustom) {
                if (customsToAdd <= 0) return;
                customsToAdd--;

                var hudPin = createHudObj('pin', {
                    _pageid: pageId,
                    x: frameLeft,
                    y: -5000,
                    title: entry.custom || 'Custom',
                    shape: 'circle',
                    bgColor: 'transparent',
                    useTextIcon: true,
                    textIcon: '',
                    scale: 1.25,
                    visibleTo: 'all',
                    notesDesynced: true,
                });

                var pinText = createHudObj('text', {
                    _pageid: pageId,
                    layer: 'foreground',
                    text: String(entry.pr != null ? entry.pr : ''),
                    left: -5000,
                    top: -5000,
                    font_size: data.textFontSize || defaultInitHud.textFontSize,
                    color: data.textColor || defaultInitHud.textColor,
                    stroke: data.textStroke || defaultInitHud.textStroke,
                    font_family: data.textFontFamily || defaultInitHud.textFontFamily,
                    rotation: data.textRotation || 0,
                });

                data.entries.push({
                    sourceId: 'custom:' + Date.now() + ':' + Math.random().toString(36).slice(2, 6),
                    tokenId: hudPin ? hudPin.get('id') : null,
                    textId: pinText.get('id'),
                    key: turnEntryKey(entry),
                });
            } else {
                if (existingTokenIds.indexOf(entry.id) !== -1) return;

                var sourceToken = getObj('graphic', entry.id);
                if (!sourceToken) return;

                var tagStr = computeHudTag(entry.id);
                var pinTitle = ((tagStr ? '⚠️ ' : '') + (sourceToken.get('name') || '')).trim();

                var hudPin = createHudObj('pin', {
                    _pageid: pageId,
                    x: frameLeft,
                    y: -5000,
                    title: pinTitle,
                    shape: 'circle',
                    bgColor: 'transparent',
                    customizationType: 'image',
                    pinImage: sourceToken.get('imgsrc').replace(/\/(?:med|max|original)\.png/, '/thumb.png'),
                    scale: 1.25,
                    visibleTo: 'all',
                    notesDesynced: true,
                    notes: tagStr || '',
                });

                var hudText = createHudObj('text', {
                    _pageid: pageId,
                    layer: 'foreground',
                    text: String(entry.pr != null ? entry.pr : ''),
                    left: 0,
                    top: 0,
                    font_size: data.textFontSize || defaultInitHud.textFontSize,
                    color: data.textColor || defaultInitHud.textColor,
                    stroke: data.textStroke || defaultInitHud.textStroke,
                    font_family: data.textFontFamily || defaultInitHud.textFontFamily,
                    rotation: data.textRotation || 0,
                });

                data.entries.push({
                    sourceId: entry.id,
                    tokenId: hudPin ? hudPin.get('id') : null,
                    textId: hudText.get('id'),
                    key: turnEntryKey(entry),
                });
            }
        });

        if (direction === undefined) {
            // Initial creation — delay reflow to give Roll20 time to register objects
            setTimeout(function() { reflowInitiativeHud('none'); updateTurnReticle(); }, 100);
        } else {
            reflowInitiativeHud(direction);
            updateTurnReticle();
        }
    };

    /**
     * Reflow initiative HUD: current turn at top, overflow hidden.
     */
    const reflowInitiativeHud = (direction) => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initiative || !s.hud.initData) return;
        var data = s.hud.initData;

        var frame = getObj('pathv2', data.frameId);
        if (!frame) return;

        var order = getHudTurnOrder();
        var frameLeft = frame.get('x');
        var frameTop = frame.get('y');
        var points = JSON.parse(frame.get('points') || '[]');
        var frameHeight = points.length >= 2 ? points[1][1] - points[0][1] : 510;
        var tokenSize = getHudTokenSize(frame);
        var tokenPadding = data.tokenPadding || defaultInitHud.tokenPadding;
        var vPadding = data.vPadding || defaultInitHud.vPadding;
        var frameTopEdge = frameTop - frameHeight / 2 + vPadding;
        var frameBotEdge = frameTop + frameHeight / 2 - vPadding;
        var step = tokenSize + tokenPadding;
        var frameMid = (frameTopEdge + frameBotEdge) / 2;
        var rawOffset = data.currentTurnOffset != null ? data.currentTurnOffset : defaultInitHud.currentTurnOffset;
        var rawCenter = (frameTopEdge + tokenSize / 2) + (frameBotEdge - frameTopEdge - tokenSize) * rawOffset;
        // Snap to nearest slot from frame center
        var slotFromCenter = step > 0 ? Math.round((rawCenter - frameMid) / step) : 0;
        var frameCenter = frameMid + slotFromCenter * step;
        // Calculate how many slots fit below and above the indicator
        var slotsBelow = 0;
        var slotsAbove = 0;
        while (frameCenter + (slotsBelow + 1) * step + tokenSize / 2 <= frameBotEdge) slotsBelow++;
        while (frameCenter - (slotsAbove + 1) * step - tokenSize / 2 >= frameTopEdge) slotsAbove++;

        // Temporary diamond offset: if there are hidden entries and the combined
        // "extra" space (fractional leftover on each side) can fit one more slot,
        // shift the diamond to make room.
        var totalVisible = 1 + slotsBelow + slotsAbove;
        if (order.length > totalVisible) {
            var extraBelow = frameBotEdge - (frameCenter + slotsBelow * step + tokenSize / 2);
            var extraAbove = (frameCenter - slotsAbove * step - tokenSize / 2) - frameTopEdge;
            if (extraBelow + extraAbove >= step) {
                // We can fit one more. Shift diamond toward the side with more slots.
                var shiftAmount;
                if (slotsBelow >= slotsAbove) {
                    // More below (or equal) — shift down to make room above
                    shiftAmount = Math.min(step - extraAbove, extraBelow);
                    frameCenter += shiftAmount;
                    slotsAbove++;
                } else {
                    // More above — shift up to make room below
                    shiftAmount = Math.min(step - extraBelow, extraAbove);
                    frameCenter -= shiftAmount;
                    slotsBelow++;
                }
            }
        }

        // Update highlight position and size
        var highlight = data.highlightId ? getObj('pathv2', data.highlightId) : null;
        if (highlight) {
            var hlSize = tokenSize + 15;
            highlight.set({
                x: frameLeft,
                y: frameCenter,
                points: JSON.stringify([[0, 0], [hlSize, hlSize]]),
            });
        }
        var frameWidth = points.length >= 2 ? points[1][0] - points[0][0] : tokenSize + 2 * (data.hPadding || defaultInitHud.hPadding);

        // Match order entries to HUD entries
        var tokenMap = {};
        data.entries.forEach(function(e) {
            if (e.sourceId && !e.sourceId.startsWith('custom:')) tokenMap[e.sourceId] = e;
        });
        var customEntries = data.entries.filter(function(e) { return e.sourceId && e.sourceId.startsWith('custom:'); });

        if (direction === 'forward' || direction === 'backward') {
            // Simple shift: move all custom pins/text by one slot, wrap at edges
            var shift = direction === 'forward'
                ? -(tokenSize + tokenPadding)
                : (tokenSize + tokenPadding);

            // Gather all HUD text Y positions (tokens + customs)
            var allTextYs = data.entries.map(function(e) {
                var t = getObj('text', e.textId);
                return t ? t.get('top') : null;
            }).filter(function(y) { return y !== null; });
            var minTextY = Math.min.apply(null, allTextYs);
            var maxTextY = Math.max.apply(null, allTextYs);

            customEntries.forEach(function(e) {
                var pin = getObj('pin', e.tokenId);
                var txt = getObj('text', e.textId);
                if (!txt) return;
                var currentY = txt.get('top');
                var newSlotY;

                if (direction === 'forward' && currentY === minTextY) {
                    // Wrapping: place at where the current max will be after shift
                    newSlotY = maxTextY;
                } else if (direction === 'backward' && currentY === maxTextY) {
                    // Wrapping: place at where the current min will be after shift
                    newSlotY = minTextY;
                } else {
                    newSlotY = currentY + shift;
                }

                var visible = (newSlotY - tokenSize / 2 >= frameTopEdge) &&
                              (newSlotY + tokenSize / 2 <= frameBotEdge);
                var newPinY = newSlotY + tokenSize / 2;
                if (pin) {
                    pin.set({ x: visible ? frameLeft : -5000, y: visible ? newPinY : -5000 });
                }
                txt.set({ top: newSlotY, color: visible ? (data.textColor || defaultInitHud.textColor) : 'transparent', stroke: visible ? (data.textStroke || defaultInitHud.textStroke) : 'transparent' });
            });

            // Update custom text values from current order based on key
            var usedOrderIndices = new Set();
            customEntries.forEach(function(e) {
                var txt = getObj('text', e.textId);
                if (!txt) return;
                // Try exact key match first
                var matchIdx = order.findIndex(function(o, i) { return !usedOrderIndices.has(i) && turnEntryKey(o) === e.key; });
                // Fallback: match by immutable parts (custom + formula + _pageid) if pr changed
                if (matchIdx === -1) {
                    var keyParts = e.key.split('§');
                    var immutableKey = keyParts.slice(0, 4).join('§'); // custom§<name>§<formula>§<pageid>
                    matchIdx = order.findIndex(function(o, i) {
                        if (usedOrderIndices.has(i)) return false;
                        if (o.id && o.id !== '-1') return false;
                        return turnEntryKey(o).startsWith(immutableKey + '§');
                    });
                }
                if (matchIdx !== -1) {
                    usedOrderIndices.add(matchIdx);
                    txt.set('text', String(order[matchIdx].pr != null ? order[matchIdx].pr : ''));
                    // Keep key in sync
                    var newKey = turnEntryKey(order[matchIdx]);
                    if (e.key !== newKey) e.key = newKey;
                }
            });

            // Reflow only token entries by ID
            var tokenDist = computeHudSlotDistribution(order.length, slotsBelow, slotsAbove);
            var tUsedBelow = tokenDist.below;
            var tUsedAbove = tokenDist.above;
            order.forEach(function(entry, i) {
                if (!entry.id || entry.id === '-1') return;
                var hudEntry = tokenMap[entry.id];
                if (!hudEntry) return;

                var pin = getObj('pin', hudEntry.tokenId);
                var txt = getObj('text', hudEntry.textId);
                if (!pin) return;

                var offset;
                if (i === 0) offset = 0;
                else if (i <= tUsedBelow) offset = i;
                else offset = -(tUsedBelow + tUsedAbove - i + 1);
                var visible = (i === 0) || (i <= tUsedBelow) || (i <= tUsedBelow + tUsedAbove);
                var yPos = hudSlotY(frameCenter, offset, tokenSize, tokenPadding);

                pin.set({ x: visible ? frameLeft : -5000, y: visible ? hudPinY(frameCenter, offset, tokenSize, tokenPadding) : -5000 });
                if (txt) {
                    txt.set({
                        left: frameLeft + frameWidth / 2 + (data.textOffset || 15),
                        top: yPos + (data.textVOffset || 0),
                        color: visible ? (data.textColor || defaultInitHud.textColor) : 'transparent', stroke: visible ? (data.textStroke || defaultInitHud.textStroke) : 'transparent',
                        text: String(entry.pr != null ? entry.pr : ''),
                    });
                }
            });
        } else {
            // Full reflow (sort/add/remove): match customs by pr value
            var visibleCustoms = customEntries.filter(function(e) {
                var obj = getObj('pin', e.tokenId);
                return obj && obj.get('y') > -1000;
            });
            var hiddenCustoms = customEntries.filter(function(e) {
                var obj = getObj('pin', e.tokenId);
                return !obj || obj.get('y') <= -1000;
            });
            var sortedCustoms = [];
            var usedVisible = new Set();
            var customOrderEntries = order.filter(function(e) { return !e.id || e.id === '-1'; });
            customOrderEntries.forEach(function(orderEntry) {
                var orderKey = turnEntryKey(orderEntry);
                var match = visibleCustoms.findIndex(function(e, i) {
                    if (usedVisible.has(i)) return false;
                    return e.key === orderKey;
                });
                // Fallback: match by pr if key doesn't match (legacy entries without key)
                if (match === -1) {
                    var prVal = String(orderEntry.pr != null ? orderEntry.pr : '');
                    match = visibleCustoms.findIndex(function(e, i) {
                        if (usedVisible.has(i)) return false;
                        var txt = getObj('text', e.textId);
                        return txt && txt.get('text') === prVal;
                    });
                }
                if (match !== -1) {
                    sortedCustoms.push(visibleCustoms[match]);
                    usedVisible.add(match);
                } else if (hiddenCustoms.length > 0) {
                    sortedCustoms.push(hiddenCustoms.shift());
                }
            });
            visibleCustoms.forEach(function(e, i) {
                if (!usedVisible.has(i)) sortedCustoms.push(e);
            });
            sortedCustoms = sortedCustoms.concat(hiddenCustoms);
            var customIdx = 0;

            var offsets = computeHudSlotDistribution(order.length, slotsBelow, slotsAbove);
            var usedBelow = offsets.below;
            var usedAbove = offsets.above;
            order.forEach(function(entry, i) {
                var isCustom = !entry.id || entry.id === '-1';
                var hudEntry = isCustom ? sortedCustoms[customIdx++] : tokenMap[entry.id];
                if (!hudEntry) return;

                var pin = getObj('pin', hudEntry.tokenId);
                var txt = getObj('text', hudEntry.textId);
                if (!pin) return;

                // Sequential: 0 = diamond, 1..usedBelow = below, above entries in order (last = closest to diamond)
                var offset;
                if (i === 0) offset = 0;
                else if (i <= usedBelow) offset = i;
                else offset = -(usedBelow + usedAbove - i + 1);
                var visible = (i === 0) || (i <= usedBelow) || (i <= usedBelow + usedAbove);
                var yPos = hudSlotY(frameCenter, offset, tokenSize, tokenPadding);

                pin.set({ x: visible ? frameLeft : -5000, y: visible ? hudPinY(frameCenter, offset, tokenSize, tokenPadding) : -5000 });
                if (isCustom) pin.set('title', entry.custom || 'Custom');

                // Keep key in sync with current turn order entry (pr may have changed)
                if (hudEntry.key !== turnEntryKey(entry)) hudEntry.key = turnEntryKey(entry);

                if (txt) {
                    txt.set({
                        left: frameLeft + frameWidth / 2 + (data.textOffset || 15),
                        top: yPos + (data.textVOffset || 0),
                        color: visible ? (data.textColor || defaultInitHud.textColor) : 'transparent', stroke: visible ? (data.textStroke || defaultInitHud.textStroke) : 'transparent',
                        text: String(entry.pr != null ? entry.pr : ''),
                    });
                }
            });
        }

    };

    /**
     * Remove the initiative HUD (programmatic).
     */
    const removeInitiativeHud = () => {
        var s = state[SCRIPT_NAME];
        var data = s.hud.initData;
        if (!data) return;

        var frameId = data.frameId;
        var highlightId = data.highlightId;
        var entries = data.entries.slice();
        // Clear IDs first so destroy handler ignores
        data.frameId = null;
        data.highlightId = null;
        data.entries = [];

        if (frameId) {
            var frame = getObj('pathv2', frameId);
            if (frame) frame.remove();
        }
        if (highlightId) {
            var hl = getObj('pathv2', highlightId);
            if (hl) hl.remove();
        }
        entries.forEach(function(entry) {
            var pin = getObj('pin', entry.tokenId);
            var txt = getObj('text', entry.textId);
            if (pin) pin.remove();
            if (txt) txt.remove();
        });
    };

    /**
     * Handle change:text — persist HUD element position/size if moved by GM.
     */
    const onHudTextChanged = (obj) => {
        var s = state[SCRIPT_NAME];
        var id = obj.get('id');
        if (id === s.hud.viewId) {
            if (!s.hud.viewData) s.hud.viewData = {};
            var vPageId = getHudPageId();
            var vPage = vPageId ? getObj('page', vPageId) : null;
            var vPageWidth = vPage ? vPage.get('width') * 70 : 1400;
            s.hud.viewData.leftNorm = obj.get('left') / vPageWidth;
            s.hud.viewData.top = obj.get('top');
            s.hud.viewData.fontSize = obj.get('font_size');
            s.hud.viewData.fontFamily = obj.get('font_family');
            var vColor = obj.get('color');
            if (vColor) s.hud.viewData.color = vColor;
            var vStroke = obj.get('stroke');
            if (vStroke) s.hud.viewData.stroke = vStroke;
            var vRotation = obj.get('rotation');
            if (vRotation !== undefined) s.hud.viewData.rotation = vRotation;
        }
        // Initiative HUD text moved or styled — update stored settings
        if (s.hud.initiative && s.hud.initData && s.hud.initData.entries) {
            var match = s.hud.initData.entries.find(function(e) { return e.textId === id; });
            if (match) {
                var data = s.hud.initData;
                var frame = getObj('pathv2', data.frameId);
                if (frame) {
                    var frameLeft = frame.get('x');
                    var pts = JSON.parse(frame.get('points') || '[]');
                    var fw = pts.length >= 2 ? pts[1][0] - pts[0][0] : 70;
                    var rightEdge = frameLeft + fw / 2;
                    var expectedLeft = rightEdge + (data.textOffset || 15);
                    var actualLeft = obj.get('left');
                    // Only update offset if the user actually moved the text (not just changed style)
                    if (Math.abs(actualLeft - expectedLeft) > 1) {
                        var newOffset = actualLeft - rightEdge;
                        data.textOffset = newOffset;
                        // Move all other texts to match offset
                        data.entries.forEach(function(e) {
                            if (e.textId === id) return;
                            var otherTxt = getObj('text', e.textId);
                            if (otherTxt) otherTxt.set('left', rightEdge + newOffset);
                        });
                    }
                }
                // Font size/family changes
                var newFontSize = obj.get('font_size');
                var newFontFamily = obj.get('font_family');
                if (newFontSize && newFontSize !== data.textFontSize) {
                    data.textFontSize = newFontSize;
                    data.entries.forEach(function(e) {
                        if (e.textId === id) return;
                        var otherTxt = getObj('text', e.textId);
                        if (otherTxt) otherTxt.set('font_size', newFontSize);
                    });
                }
                if (newFontFamily && newFontFamily !== data.textFontFamily) {
                    data.textFontFamily = newFontFamily;
                    data.entries.forEach(function(e) {
                        if (e.textId === id) return;
                        var otherTxt = getObj('text', e.textId);
                        if (otherTxt) otherTxt.set('font_family', newFontFamily);
                    });
                }
                var newColor = obj.get('color');
                if (newColor && newColor !== 'transparent' && newColor !== data.textColor) {
                    data.textColor = newColor;
                    data.entries.forEach(function(e) {
                        if (e.textId === id) return;
                        var otherTxt = getObj('text', e.textId);
                        if (otherTxt && otherTxt.get('color') !== 'transparent') otherTxt.set('color', newColor);
                    });
                }
                var newStroke = obj.get('stroke');
                if (newStroke && newStroke !== data.textStroke) {
                    data.textStroke = newStroke;
                    data.entries.forEach(function(e) {
                        if (e.textId === id) return;
                        var otherTxt = getObj('text', e.textId);
                        if (otherTxt) otherTxt.set('stroke', newStroke);
                    });
                }
                // Rotation propagation
                var newRotation = obj.get('rotation');
                if (newRotation !== undefined && newRotation !== data.textRotation) {
                    data.textRotation = newRotation;
                    data.entries.forEach(function(e) {
                        if (e.textId === id) return;
                        var otherTxt = getObj('text', e.textId);
                        if (otherTxt) otherTxt.set('rotation', newRotation);
                    });
                }
                // Vertical offset from slot position
                var newTop = obj.get('top');
                var tokenSize = data.tokenSize || defaultInitHud.tokenSize;
                var tokenPadding = data.tokenPadding || defaultInitHud.tokenPadding;
                var highlight = data.highlightId ? getObj('pathv2', data.highlightId) : null;
                var frame = data.frameId ? getObj('pathv2', data.frameId) : null;
                if (highlight && frame) {
                    var hlY = highlight.get('y');
                    var frameTop = frame.get('y');
                    var fPts = JSON.parse(frame.get('points') || '[]');
                    var fHeight = fPts.length >= 2 ? fPts[1][1] - fPts[0][1] : 510;
                    var vPadding = data.vPadding || defaultInitHud.vPadding;
                    var step = tokenSize + tokenPadding;
                    var slotsBelow = 0;
                    while (hlY + (slotsBelow + 1) * step + tokenSize / 2 <= frameTop + fHeight / 2 - vPadding) slotsBelow++;

                    // Find display index from deduplicated turn order
                    var order = getHudTurnOrder();
                    var displayIdx = -1;
                    displayIdx = order.findIndex(function(e) { return turnEntryKey(e) === match.key; });

                    if (displayIdx >= 0) {
                        var numEntries = order.length;
                        var entryOffset = displayIdx === 0 ? 0 : (displayIdx <= slotsBelow ? displayIdx : -(numEntries - displayIdx));
                        var slotY = hudSlotY(hlY, entryOffset, tokenSize, tokenPadding);
                        var expectedTop = slotY + (data.textVOffset || 0);
                        var vOffset = newTop - slotY;
                        if (Math.abs(newTop - expectedTop) > 1) {
                            data.textVOffset = vOffset;
                            data.entries.forEach(function(e) {
                                if (e.textId === id) return;
                                var otherDisplayIdx = -1;
                                if (e.sourceId && !e.sourceId.startsWith('custom:')) {
                                    otherDisplayIdx = order.findIndex(function(o) { return o.id === e.sourceId; });
                                }
                                if (otherDisplayIdx < 0) return;
                                var otherOffset = otherDisplayIdx === 0 ? 0 : (otherDisplayIdx <= slotsBelow ? otherDisplayIdx : -(numEntries - otherDisplayIdx));
                                var otherSlotY = hudSlotY(hlY, otherOffset, tokenSize, tokenPadding);
                                var otherTxt = getObj('text', e.textId);
                                if (otherTxt) otherTxt.set('top', otherSlotY + vOffset);
                            });
                        }
                    }
                }
            }
        }
    };

    /**
     * Handle destroy:text — if a HUD element is deleted, treat as turning it off.
     */
    const onHudTextDestroyed = (obj) => {
        var s = state[SCRIPT_NAME];
        var id = obj.get('id');
        if (id === s.hud.viewId) {
            s.hud.view = false;
            s.hud.viewId = null;
            sendChat(SCRIPT_NAME, '/w gm <b>HUD:</b> <b>view</b> is now off');
        }
        // Initiative HUD text
        if (s.hud.initData && s.hud.initData.entries) {
            var data = s.hud.initData;
            var matchIdx = data.entries.findIndex(function(e) { return e.textId === id; });
            if (matchIdx !== -1) {
                // If a turn order change is pending, re-create the text and abort deletion
                if (_turnOrderDebounceId) {
                    var match = data.entries[matchIdx];
                    var pageId = getHudPageId();
                    if (pageId) {
                        var newTxt = createHudObj('text', {
                            _pageid: pageId,
                            layer: 'foreground',
                            text: obj.get('text') || '',
                            left: obj.get('left') || 0,
                            top: obj.get('top') || 0,
                            font_size: data.textFontSize || defaultInitHud.textFontSize,
                            color: data.textColor || defaultInitHud.textColor,
                            stroke: data.textStroke || defaultInitHud.textStroke,
                            font_family: data.textFontFamily || defaultInitHud.textFontFamily,
                            rotation: data.textRotation || 0,
                        });
                        if (newTxt) match.textId = newTxt.get('id');
                    }
                    return;
                }

                var match = data.entries[matchIdx];
                // Splice entry first to prevent cascading destroy handlers from re-matching
                data.entries.splice(matchIdx, 1);
                var pin = getObj('pin', match.tokenId);
                if (pin) pin.remove();

                // Remove from turn order
                var order = JSON.parse(Campaign().get('turnorder') || '[]');
                if (match.sourceId && !match.sourceId.startsWith('custom:')) {
                    var info = getLinkedInfo(match.sourceId);
                    var groupIds = new Set([match.sourceId].concat(info.linkedIds));
                    order = order.filter(function(e) { return !groupIds.has(e.id); });
                } else {
                    var matchKey = match.key;
                    var customIdx = order.findIndex(function(e) { return turnEntryKey(e) === matchKey; });
                    if (customIdx !== -1) order.splice(customIdx, 1);
                }
                Campaign().set('turnorder', JSON.stringify(order));

                reflowInitiativeHud('none');
            }
        }
    };

    /**
     * Handle destroy:pin — if an initiative HUD pin is deleted, remove from turn order.
     */
    const onHudGraphicDestroyed = (obj) => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initData || !s.hud.initData.entries) return;
        var id = obj.get('id');
        var data = s.hud.initData;
        var matchIdx = data.entries.findIndex(function(e) { return e.tokenId === id; });
        if (matchIdx === -1) return;

        // If a turn order change is pending, re-create the pin and abort deletion
        if (_turnOrderDebounceId) {
            var match = data.entries[matchIdx];
            var pageId = getHudPageId();
            if (pageId) {
                var frame = getObj('pathv2', data.frameId);
                var frameLeft = frame ? frame.get('x') : 100;
                var sourceToken = match.sourceId && !match.sourceId.startsWith('custom:') ? getObj('graphic', match.sourceId) : null;
                var pinOpts = {
                    _pageid: pageId,
                    x: frameLeft,
                    y: obj.get('y') || -5000,
                    title: sourceToken ? (sourceToken.get('name') || '') : (obj.get('title') || 'Custom'),
                    shape: 'circle',
                    bgColor: 'transparent',
                    scale: 1.25,
                    visibleTo: 'all',
                    notesDesynced: true,
                };
                if (sourceToken) {
                    pinOpts.customizationType = 'image';
                    pinOpts.pinImage = sourceToken.get('imgsrc').replace(/\/(?:med|max|original)\.png/, '/thumb.png');
                } else {
                    pinOpts.useTextIcon = true;
                    pinOpts.textIcon = '';
                }
                var newPin = createHudObj('pin', pinOpts);
                if (newPin) match.tokenId = newPin.get('id');
            }
            return;
        }

        var match = data.entries[matchIdx];
        // Splice entry first — associated text will be orphaned and cleaned up on next reflow
        data.entries.splice(matchIdx, 1);
        var txt = getObj('text', match.textId);
        if (txt) txt.remove();

        // Remove from turn order
        var order = JSON.parse(Campaign().get('turnorder') || '[]');
        if (match.sourceId && !match.sourceId.startsWith('custom:')) {
            // Token — remove it and linked children from turn order
            var info = getLinkedInfo(match.sourceId);
            var groupIds = new Set([match.sourceId].concat(info.linkedIds));
            order = order.filter(function(e) { return !groupIds.has(e.id); });
        } else {
            // Custom turn — remove matching entry by key
            var matchKey = match.key;
            var customIdx = order.findIndex(function(e) { return turnEntryKey(e) === matchKey; });
            if (customIdx !== -1) order.splice(customIdx, 1);
        }
        Campaign().set('turnorder', JSON.stringify(order));

        reflowInitiativeHud('none');
        updateTurnReticle();
    };

    /**
     * Handle destroy:path — if the initiative frame is deleted, turn off.
     */
    const onHudPathDestroyed = (obj) => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initData) return;
        if (obj.get('id') === s.hud.initData.frameId) {
            s.hud.initiative = false;
            s.hud.initData.frameId = null;
            removeInitiativeHud();
            sendChat(SCRIPT_NAME, '/w gm <b>HUD:</b> <b>initiative</b> is now off');
        } else if (obj.get('id') === s.hud.initData.highlightId) {
            // Highlight deleted — just clear ID, will be recreated on next update
            s.hud.initData.highlightId = null;
        } else if (s.hud.reticleData && obj.get('id') === s.hud.reticleData.id) {
            // Turn indicator deleted — turn off reticle
            s.hud.reticleData.id = null;
            s.hud.reticleData.tokenId = null;
            s.hud.reticle = false;
            sendChat(SCRIPT_NAME, '/w gm <b>HUD:</b> Turn reticle disabled. Use <code>!gaslight hud reticle on</code> to re-enable.');
        }
    };

    /**
     * Handle frame pathv2 change — resize logic, position/style tracking.
     */
    const onFrameChanged = (obj, prev) => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initiative || !s.hud.initData) return;
        var data = s.hud.initData;
        var points = JSON.parse(obj.get('points') || '[]');
        var newWidth = points.length >= 2 ? points[1][0] - points[0][0] : 0;
        var newHeight = points.length >= 2 ? points[1][1] - points[0][1] : 0;
        var oldWidth = data.frameSize ? data.frameSize.width : newWidth;

        if (newWidth !== oldWidth) {
            var delta = newWidth - oldWidth;
            var currentHPad = data.hPadding || defaultInitHud.hPadding;
            var currentTokenSize = data.tokenSize || defaultInitHud.tokenSize;
            var minHPad = 5;

            if (delta < 0) {
                var padReduction = Math.min(Math.abs(delta) / 2, currentHPad - minHPad);
                if (padReduction > 0) {
                    data.hPadding = currentHPad - padReduction;
                    delta += padReduction * 2;
                }
                if (delta < 0) {
                    data.tokenSize = Math.max(10, currentTokenSize + delta);
                }
            } else {
                data.hPadding = currentHPad + delta / 2;
            }
        }

        data.pos = { left: obj.get('x'), top: obj.get('y') };
        data.frameSize = { width: newWidth, height: newHeight };
        var stroke = obj.get('stroke');
        var fill = obj.get('fill');
        var strokeWidth = obj.get('stroke_width');
        if (stroke !== undefined) data.frameStroke = stroke;
        if (fill !== undefined) data.frameFill = fill;
        if (strokeWidth !== undefined) data.frameStrokeWidth = strokeWidth;
        reflowInitiativeHud('none');
    };

    /**
     * Handle highlight pathv2 change — style tracking, cascade to reticle, Y offset.
     */
    const onHighlightChanged = (obj, prev) => {
        var s = state[SCRIPT_NAME];
        if (!s.hud.initiative || !s.hud.initData) return;
        var data = s.hud.initData;
        var hlStroke = obj.get('stroke');
        var hlFill = obj.get('fill');
        var hlStrokeWidth = obj.get('stroke_width');
        if (hlStroke !== undefined) data.highlightStroke = hlStroke;
        if (hlFill !== undefined) data.highlightFill = hlFill;
        if (hlStrokeWidth !== undefined) data.highlightStrokeWidth = hlStrokeWidth;
        var hlRotation = obj.get('rotation');
        if (hlRotation !== undefined) data.highlightRotation = hlRotation;
        // Cascade to reticle if not overridden
        var rd = s.hud.reticleData || {};
        var ti = rd.id ? getObj('pathv2', rd.id) : null;
        if (ti) {
            if (hlStroke !== undefined && !rd.stroke) ti.set('stroke', hlStroke);
            if (hlStrokeWidth !== undefined && !rd.strokeWidth) ti.set('stroke_width', hlStrokeWidth);
            if (hlRotation !== undefined) {
                var reticleOffset = rd.rotationOffset != null ? rd.rotationOffset : -(data.highlightRotation != null ? data.highlightRotation : 45);
                ti.set('rotation', hlRotation + reticleOffset);
            }
        }
        // Compute normalized Y offset
        var frame = getObj('pathv2', data.frameId);
        if (frame) {
            var fTop = frame.get('y');
            var fPts = JSON.parse(frame.get('points') || '[]');
            var fHeight = fPts.length >= 2 ? fPts[1][1] - fPts[0][1] : 510;
            var tknSz = data.tokenSize || defaultInitHud.tokenSize;
            var vPad = data.vPadding || defaultInitHud.vPadding;
            var usableTop = fTop - fHeight / 2 + tknSz / 2 + vPad;
            var usableBot = fTop + fHeight / 2 - tknSz / 2 - vPad;
            var hlY = obj.get('y');
            var norm = (hlY - usableTop) / (usableBot - usableTop);
            data.currentTurnOffset = Math.max(0, Math.min(1, norm));
        }
        reflowInitiativeHud('none');
    };

    /**
     * Handle reticle pathv2 change — style override, size scale, position offset.
     */
    const onReticleChanged = (obj, prev) => {
        var s = state[SCRIPT_NAME];
        var rd = s.hud.reticleData;
        if (!rd) return;
        var data = s.hud.initData || {};
        var tiStroke = obj.get('stroke');
        var tiStrokeWidth = obj.get('stroke_width');
        var tiRotation = obj.get('rotation');
        if (tiStroke !== undefined) {
            if (tiStroke === (data.highlightStroke || defaultInitHud.highlightStroke)) { rd.stroke = null; }
            else { rd.stroke = tiStroke; }
        }
        if (tiStrokeWidth !== undefined) {
            if (tiStrokeWidth === (data.highlightStrokeWidth || defaultInitHud.highlightStrokeWidth)) { rd.strokeWidth = null; }
            else { rd.strokeWidth = tiStrokeWidth; }
        }
        if (tiRotation !== undefined) {
            var hlRot = data.highlightRotation != null ? data.highlightRotation : 45;
            rd.rotationOffset = tiRotation - hlRot;
        }
        // Track proportional size relative to tracked token
        var tiPoints = JSON.parse(obj.get('points') || '[]');
        var prevPoints = prev && prev.points ? JSON.parse(prev.points) : tiPoints;
        var wasResized = JSON.stringify(tiPoints) !== JSON.stringify(prevPoints);
        if (wasResized && tiPoints.length >= 2 && rd.tokenId) {
            var token = getObj('graphic', rd.tokenId);
            if (token) {
                var tokenW = token.get('width');
                var tokenH = token.get('height');
                var reticleW = tiPoints[1][0] - tiPoints[0][0];
                var reticleH = tiPoints[1][1] - tiPoints[0][1];
                if (tokenW > 0) rd.widthScale = reticleW / tokenW;
                if (tokenH > 0) rd.heightScale = reticleH / tokenH;
                var targetX = token.get('left') + (rd.xOffset || 0) * tokenW;
                var targetY = token.get('top') + (rd.yOffset || 0) * tokenH;
                obj.set({ x: targetX, y: targetY });
            }
        }
        // Track proportional position offset from token center (move without resize)
        if (!wasResized && rd.tokenId) {
            var tiX = obj.get('x');
            var tiY = obj.get('y');
            var token = getObj('graphic', rd.tokenId);
            if (token) {
                var tokenW = token.get('width');
                var tokenH = token.get('height');
                var dx = tiX - token.get('left');
                var dy = tiY - token.get('top');
                var deadzone = 3;
                var maxThreshold = Math.max(tokenW, tokenH) * 1.5;
                var dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < deadzone) {
                    rd.xOffset = null;
                    rd.yOffset = null;
                } else if (dist <= maxThreshold) {
                    rd.xOffset = tokenW > 0 ? dx / tokenW : 0;
                    rd.yOffset = tokenH > 0 ? dy / tokenH : 0;
                }
            }
        }
    };

    /**
     * Handle !gaslight hud command.
     */
    const hudRegistry = {
        view: {
            aliases: ['relay'],
            stateKey: 'viewData',
            defaults: {},
            enable: function() { updateViewHud(); },
            disable: function() { removeViewHud(); },
            reset: function() {
                var s = state[SCRIPT_NAME];
                s.hud.viewData = {};
                var existing = findHudElement('view');
                if (existing) {
                    var pageId = getHudPageId();
                    var page = pageId ? getObj('page', pageId) : null;
                    var pageWidth = page ? page.get('width') * 70 : 1400;
                    existing.set({
                        left: Math.round(defaultViewHud.leftNorm * pageWidth),
                        top: defaultViewHud.top,
                        font_size: defaultViewHud.fontSize,
                        font_family: defaultViewHud.fontFamily,
                        color: defaultViewHud.color,
                        stroke: defaultViewHud.stroke,
                    });
                } else {
                    updateViewHud();
                }
            },
            ids: function() {
                var s = state[SCRIPT_NAME];
                return s.hud.viewId ? [s.hud.viewId] : [];
            },
            isVisible: function() {
                var s = state[SCRIPT_NAME];
                return !!(s.hud.viewId && getObj('text', s.hud.viewId));
            },
            events: {
                text: { change: onHudTextChanged, destroy: onHudTextDestroyed },
            },
        },
        initiative: {
            aliases: ['init', 'turn', 'turns'],
            stateKey: 'initData',
            defaults: function() { return Object.assign({}, defaultInitHud, { entries: [] }); },
            enable: function() { updateInitiativeHud(); },
            disable: function() { removeInitiativeHud(); },
            ids: function() {
                var s = state[SCRIPT_NAME];
                var data = s.hud.initData;
                if (!data) return [];
                var result = [];
                if (data.frameId) result.push(data.frameId);
                if (data.highlightId) result.push(data.highlightId);
                if (data.entries) data.entries.forEach(function(e) {
                    if (e.tokenId) result.push(e.tokenId);
                    if (e.textId) result.push(e.textId);
                });
                return result;
            },
            isVisible: function() {
                var s = state[SCRIPT_NAME];
                var data = s.hud.initData;
                return !!(data && data.frameId && getObj('pathv2', data.frameId));
            },
            events: {
                pathv2: {
                    change: function(obj, prev) {
                        var s = state[SCRIPT_NAME];
                        var data = s.hud.initData;
                        if (!data) return;
                        if (obj.get('id') === data.frameId) onFrameChanged(obj, prev);
                        else if (obj.get('id') === data.highlightId) onHighlightChanged(obj, prev);
                    },
                    destroy: onHudPathDestroyed,
                },
                pin: { change: null, destroy: onHudGraphicDestroyed },
                text: { change: onHudTextChanged, destroy: onHudTextDestroyed },
            },
        },
        reticle: {
            aliases: ['indicator', 'current'],
            stateKey: 'reticleData',
            defaults: function() {
                var s = state[SCRIPT_NAME];
                var data = s.hud.initData || {};
                var hlRot = data.highlightRotation != null ? data.highlightRotation : 45;
                return { rotationOffset: -hlRot };
            },
            enable: function() { updateTurnReticle(); },
            disable: function() { removeTurnReticle(); },
            ids: function() {
                var s = state[SCRIPT_NAME];
                return s.hud.reticleData && s.hud.reticleData.id ? [s.hud.reticleData.id] : [];
            },
            isVisible: function() {
                var s = state[SCRIPT_NAME];
                return !!(s.hud.reticleData && s.hud.reticleData.id && getObj('pathv2', s.hud.reticleData.id));
            },
            events: {
                pathv2: { change: onReticleChanged, destroy: onHudPathDestroyed },
            },
        },
    };

    // Generic owns check derived from ids()
    Object.keys(hudRegistry).forEach(function(key) {
        var entry = hudRegistry[key];
        if (!entry.owns) {
            entry.owns = function(id) { return entry.ids().indexOf(id) !== -1; };
        }
        // Generic reset if not overridden: disable → reset state → enable
        if (!entry.reset) {
            entry.reset = function() {
                var s = state[SCRIPT_NAME];
                entry.disable();
                var defs = typeof entry.defaults === 'function' ? entry.defaults() : Object.assign({}, entry.defaults);
                s.hud[entry.stateKey] = defs;
                entry.enable();
            };
        }
    });

    const resolveHudElement = (name) => {
        if (hudRegistry[name]) return name;
        for (var key in hudRegistry) {
            if (hudRegistry[key].aliases && hudRegistry[key].aliases.indexOf(name) !== -1) return key;
        }
        return null;
    };

    const doHud = (msg, args) => {
        var s = state[SCRIPT_NAME];
        var elementNames = Object.keys(hudRegistry);
        var toggleWords = new Set(['on', 'off', 'reset']);

        if (args.length === 0) {
            // Toggle all elements
            elementNames.forEach(function(el) {
                s.hud[el] = !s.hud[el];
                if (s.hud[el]) hudRegistry[el].enable();
                else hudRegistry[el].disable();
            });
            reply(msg, 'HUD', elementNames.map(function(el) { return '<b>' + el + '</b>: ' + (s.hud[el] ? 'on' : 'off'); }).join('<br>'));
            return;
        }

        // Single arg that's a toggle word — apply to all elements
        if (args.length === 1 && toggleWords.has(args[0].toLowerCase())) {
            var toggle = args[0].toLowerCase();
            if (toggle === 'reset') {
                elementNames.forEach(function(el) {
                    s.hud[el] = true;
                    hudRegistry[el].reset();
                });
            } else {
                elementNames.forEach(function(el) {
                    s.hud[el] = (toggle === 'on');
                    if (s.hud[el]) hudRegistry[el].enable();
                    else hudRegistry[el].disable();
                });
            }
            reply(msg, 'HUD', elementNames.map(function(el) { return '<b>' + el + '</b>: ' + (s.hud[el] ? 'on' : 'off'); }).join('<br>'));
            return;
        }

        var element = args[0].toLowerCase();
        var toggle = args[1] ? args[1].toLowerCase() : null;

        // Resolve aliases
        element = resolveHudElement(element) || element;
        if (toggle) toggle = resolveHudElement(toggle) || toggle;

        // Allow toggle before or after element: "hud reset initiative" or "hud initiative reset"
        if (toggleWords.has(element) && toggle && hudRegistry[toggle]) {
            var tmp = element;
            element = toggle;
            toggle = tmp;
        }

        if (!hudRegistry[element]) {
            reply(msg, 'Error', 'Unknown HUD element: ' + element + '. Available: ' + elementNames.join(', '));
            return;
        }

        if (toggle === 'on') {
            s.hud[element] = true;
            hudRegistry[element].enable();
        } else if (toggle === 'off') {
            s.hud[element] = false;
            hudRegistry[element].disable();
        } else if (toggle === 'reset') {
            s.hud[element] = true;
            hudRegistry[element].reset();
            reply(msg, 'HUD', '<b>' + element + '</b> reset to defaults.');
            return;
        } else {
            // Toggle
            s.hud[element] = !s.hud[element];
            if (s.hud[element]) hudRegistry[element].enable();
            else hudRegistry[element].disable();
        }

        reply(msg, 'HUD', '<b>' + element + '</b> is now ' + (s.hud[element] ? 'on' : 'off'));
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('chat:message', viewInterceptor);
        on('chat:message', function(msg) {
            if (msg.type === 'api' && msg.content === '!rollcapture-ready') registerWithRollCapture();
        });
        registerWithRollCapture();
        on('chat:message', function(msg) {
            if (msg.type === 'api' && msg.content === '!scriptkit-ready') registerWithScriptKit();
        });
        registerWithScriptKit();
        on('add:graphic', onTokenAdded);
        on('change:attribute', onAttributeChanged);
        on('change:graphic', onGraphicPropChanged);
        on('change:graphic:gmnotes', onGmNotesChanged);
        on('change:campaign:turnorder', onTurnOrderChanged);
        on('destroy:graphic', function(obj) { onTokenDestroyed(obj); });

        // HUD registry event routing
        var hudEventHandlers = {};
        Object.keys(hudRegistry).forEach(function(element) {
            var events = hudRegistry[element].events;
            if (!events) return;
            Object.keys(events).forEach(function(objType) {
                Object.keys(events[objType]).forEach(function(event) {
                    if (!events[objType][event]) return;
                    var key = event + ':' + objType;
                    if (!hudEventHandlers[key]) hudEventHandlers[key] = [];
                    hudEventHandlers[key].push({ element: element, handler: events[objType][event] });
                });
            });
        });
        Object.keys(hudEventHandlers).forEach(function(key) {
            on(key, function(obj, prev) {
                var id = obj.get('id');
                if (key.startsWith('change:') && _hudCreatedIds.delete(id)) return;
                hudEventHandlers[key].forEach(function(entry) {
                    if (hudRegistry[entry.element].owns(id)) {
                        entry.handler(obj, prev);
                    }
                });
            });
        });
        on('change:pin', function(obj, prev) {
            var s = state[SCRIPT_NAME];
            if (!s.hud.initiative || !s.hud.initData) return;
            var data = s.hud.initData;
            var match = data.entries.find(function(e) { return e.tokenId === obj.get('id'); });
            if (!match) return;

            // If a turn order change is pending (debouncing), reject the gesture and snap back
            if (_turnOrderDebounceId) {
                obj.set({ x: prev.x, y: prev.y });
                return;
            }

            var newY = obj.get('y');
            var oldY = prev.y;

            // Check if pin escaped horizontally (swipe, not reorder)
            var newX = obj.get('x');
            var frame = getObj('pathv2', data.frameId);
            var horizontalEscapePin = false;
            if (frame) {
                var frameLeftPin = frame.get('x');
                var ptsPin = JSON.parse(frame.get('points') || '[]');
                var fwPin = ptsPin.length >= 2 ? ptsPin[1][0] - ptsPin[0][0] : 70;
                horizontalEscapePin = newX > frameLeftPin + fwPin / 2 || newX < frameLeftPin - fwPin / 2;
            }

            // Pin dragged vertically — reorder turn in initiative
            if (!horizontalEscapePin && newY !== oldY) {
                var order = JSON.parse(Campaign().get('turnorder') || '[]');
                var hudOrder = getHudTurnOrder();
                var isCustomEntry = match.sourceId && match.sourceId.startsWith('custom:');

                // Find current index in hudOrder
                var currentIdx = -1;
                if (isCustomEntry) {
                    // For customs, find rank among customs and map to hudOrder position
                    var customsInData = data.entries.filter(function(e) { return e.sourceId && e.sourceId.startsWith('custom:'); });
                    var myCustomRank = customsInData.findIndex(function(e) { return e.tokenId === obj.get('id'); });
                    if (myCustomRank !== -1) {
                        var cCount = 0;
                        for (var hi = 0; hi < hudOrder.length; hi++) {
                            if (!hudOrder[hi].id || hudOrder[hi].id === '-1') {
                                if (cCount === myCustomRank) { currentIdx = hi; break; }
                                cCount++;
                            }
                        }
                    }
                } else {
                    currentIdx = hudOrder.findIndex(function(e) { return e.id === match.sourceId; });
                }
                if (currentIdx < 0 || currentIdx >= hudOrder.length) { reflowInitiativeHud('none'); return; }

                // Build a map of hudOrder index → current visual Y position
                var tknSize = data.tokenSize || defaultInitHud.tokenSize;
                var tknPad = data.tokenPadding || defaultInitHud.tokenPadding;
                var pinYByIdx = [];
                hudOrder.forEach(function(entry, idx) {
                    var hudEntry;
                    if (!entry.id || entry.id === '-1') {
                        var customsInData2 = data.entries.filter(function(e) { return e.sourceId && e.sourceId.startsWith('custom:'); });
                        var cRank = hudOrder.slice(0, idx + 1).filter(function(e) { return !e.id || e.id === '-1'; }).length - 1;
                        hudEntry = customsInData2[cRank];
                    } else {
                        hudEntry = data.entries.find(function(e) { return e.sourceId === entry.id; });
                    }
                    if (hudEntry) {
                        var pin2 = getObj('pin', hudEntry.tokenId);
                        pinYByIdx.push({ idx: idx, y: pin2 ? pin2.get('y') : -5000 });
                    } else {
                        pinYByIdx.push({ idx: idx, y: -5000 });
                    }
                });

                // Sort visible pins by Y to get visual order (top to bottom)
                var visiblePins = pinYByIdx.filter(function(p) { return p.y > -1000; });
                visiblePins.sort(function(a, b) { return a.y - b.y; });

                // Minimum drag threshold
                if (Math.abs(newY - oldY) < (tknSize + tknPad) / 3) { reflowInitiativeHud('none'); return; }

                // Find which two pins the dragged pin is between (excluding itself)
                var others = visiblePins.filter(function(p) { return p.idx !== currentIdx; });
                if (others.length === 0) { reflowInitiativeHud('none'); return; }

                var insertAfterIdx = -1;  // hudOrder idx to insert after
                var insertBeforeIdx = -1; // hudOrder idx to insert before

                if (newY <= others[0].y) {
                    // Above all others — insert before the topmost pin
                    insertBeforeIdx = others[0].idx;
                } else if (newY >= others[others.length - 1].y) {
                    // Below all others — insert after the bottommost pin
                    insertAfterIdx = others[others.length - 1].idx;
                } else {
                    // Between two pins
                    for (var vi = 0; vi < others.length - 1; vi++) {
                        if (newY >= others[vi].y && newY <= others[vi + 1].y) {
                            insertAfterIdx = others[vi].idx;
                            insertBeforeIdx = others[vi + 1].idx;
                            break;
                        }
                    }
                }

                // Skip if no valid insertion found or same position
                var targetIdx = insertAfterIdx !== -1 ? insertAfterIdx : insertBeforeIdx;
                if (targetIdx === -1 || targetIdx === currentIdx) { reflowInitiativeHud('none'); return; }

                if (true) {

                    // Collapse turn order to one entry per combatant, preserving group info
                    var collapsed = [];
                    var groupMap = {}; // collapsed index ? array of full entries for that group
                    var seen = new Set();
                    order.forEach(function(entry) {
                        if (!entry.id || entry.id === '-1') {
                            var ci = collapsed.length;
                            collapsed.push(entry);
                            groupMap[ci] = [entry];
                            return;
                        }
                        // Find the master for this token
                        var masterId = entry.id;
                        if (!isMasterToken(entry.id)) {
                            var info = getLinkedInfo(entry.id);
                            var mid = info.linkedIds.find(function(lid) { return isMasterToken(lid); });
                            if (mid) masterId = mid;
                        }
                        if (seen.has(masterId)) {
                            // Add to existing group
                            var existingIdx = collapsed.findIndex(function(e) { return e._masterId === masterId; });
                            if (existingIdx !== -1) groupMap[existingIdx].push(entry);
                            return;
                        }
                        seen.add(masterId);
                        var ci = collapsed.length;
                        var colEntry = Object.assign({}, entry, { _masterId: masterId });
                        collapsed.push(colEntry);
                        groupMap[ci] = [entry];
                    });

                    // Find source and target in collapsed order
                    var colSourceIdx = collapsed.findIndex(function(e) {
                        if (isCustomEntry) return e.id === '-1' || !e.id; // TODO: custom rank matching
                        return e._masterId === match.sourceId || e.id === match.sourceId;
                    });
                    if (colSourceIdx === -1) { reflowInitiativeHud('none'); return; }

                    // Determine insertion point in collapsed order
                    var colTargetIdx;
                    if (insertAfterIdx === -1) {
                        // Insert before the target
                        colTargetIdx = collapsed.findIndex(function(e) {
                            var hEntry = hudOrder[insertBeforeIdx];
                            if (!hEntry.id || hEntry.id === '-1') return !e.id || e.id === '-1';
                            return e._masterId === hEntry.id || e.id === hEntry.id;
                        });
                        if (colTargetIdx === -1) colTargetIdx = 0;
                    } else {
                        // Insert after the target
                        var afterEntry = hudOrder[insertAfterIdx];
                        colTargetIdx = collapsed.findIndex(function(e) {
                            if (!afterEntry.id || afterEntry.id === '-1') return !e.id || e.id === '-1';
                            return e._masterId === afterEntry.id || e.id === afterEntry.id;
                        });
                        if (colTargetIdx === -1) colTargetIdx = collapsed.length - 1;
                        colTargetIdx++; // insert AFTER
                    }

                    // Remove source from collapsed
                    var removedGroup = groupMap[colSourceIdx];
                    collapsed.splice(colSourceIdx, 1);
                    // Adjust target index if source was before target
                    if (colSourceIdx < colTargetIdx) colTargetIdx--;
                    // Rebuild groupMap indices after removal
                    var newGroupMap = {};
                    var gi = 0;
                    Object.keys(groupMap).sort(function(a, b) { return Number(a) - Number(b); }).forEach(function(key) {
                        if (Number(key) === colSourceIdx) return;
                        newGroupMap[gi] = groupMap[key];
                        gi++;
                    });

                    // Insert at target position
                    collapsed.splice(colTargetIdx, 0, { _placeholder: true });
                    // Rebuild final groupMap
                    var finalGroupMap = {};
                    var fgi = 0;
                    Object.keys(newGroupMap).sort(function(a, b) { return Number(a) - Number(b); }).forEach(function(key) {
                        var idx = Number(key);
                        if (idx >= colTargetIdx) idx++;
                        finalGroupMap[idx] = newGroupMap[key];
                        fgi++;
                    });
                    finalGroupMap[colTargetIdx] = removedGroup;

                    // Expand back to full order
                    var newOrder = [];
                    for (var ci = 0; ci < collapsed.length; ci++) {
                        var group = finalGroupMap[ci];
                        if (group) group.forEach(function(e) { newOrder.push(e); });
                    }

                    // Clean up temp properties
                    newOrder.forEach(function(e) { delete e._masterId; delete e._placeholder; });

                    Campaign().set('turnorder', JSON.stringify(newOrder));
                }
            }

            // Pin dragged horizontally — make it this turn's turn
            var oldX = prev.x;
            var verticalDrift = Math.abs(newY - oldY);
            var tknSizeP = data.tokenSize || defaultInitHud.tokenSize;
            if (newX !== oldX && verticalDrift < tknSizeP / 2 && horizontalEscapePin) {
                var frameLeftH = frame.get('x');
                var ptsH = JSON.parse(frame.get('points') || '[]');
                var fwH = ptsH.length >= 2 ? ptsH[1][0] - ptsH[0][0] : 70;
                var frameRightEdge = frameLeftH + fwH / 2;
                var swipeDir = newX > frameRightEdge ? 'forward' : 'backward';
                var fullOrder = JSON.parse(Campaign().get('turnorder') || '[]');

                // Find this entry's position in the full order
                var targetFullIdx = -1;
                if (match.sourceId && match.sourceId.startsWith('custom:')) {
                    var customsInOrder = [];
                    fullOrder.forEach(function(e, i) { if (!e.id || e.id === '-1') customsInOrder.push(i); });
                    var customRank = data.entries.filter(function(e) { return e.sourceId && e.sourceId.startsWith('custom:'); }).findIndex(function(e) { return e.tokenId === obj.get('id'); });
                    if (customRank !== -1 && customsInOrder[customRank] !== undefined) {
                        targetFullIdx = customsInOrder[customRank];
                    }
                } else {
                    targetFullIdx = fullOrder.findIndex(function(e) { return e.id === match.sourceId; });
                }

                if (targetFullIdx !== -1) {
                    if (targetFullIdx === 0) {
                        // This pin is the current turn — advance/retreat to next/prev master or custom
                        if (swipeDir === 'forward') {
                            fullOrder.push(fullOrder.shift());
                            var skip = fullOrder.length;
                            while (skip-- > 0 && fullOrder[0] && fullOrder[0].id && fullOrder[0].id !== '-1') {
                                var cInfo = getLinkedInfo(fullOrder[0].id);
                                if (cInfo.linkedIds.length === 0 || cInfo.isMaster) break;
                                fullOrder.push(fullOrder.shift());
                            }
                        } else {
                            fullOrder.unshift(fullOrder.pop());
                            var skip = fullOrder.length;
                            while (skip-- > 0 && fullOrder[0] && fullOrder[0].id && fullOrder[0].id !== '-1') {
                                var cInfo = getLinkedInfo(fullOrder[0].id);
                                if (cInfo.linkedIds.length === 0 || cInfo.isMaster) break;
                                fullOrder.unshift(fullOrder.pop());
                            }
                        }
                        // Apply formula if new top is a custom
                        if (fullOrder[0] && fullOrder[0].id === '-1' && fullOrder[0].formula) {
                            var f = fullOrder[0].formula.trim();
                            var v = parseFloat(f.replace(/^[+-]/, '')) || 0;
                            var add = f.startsWith('+');
                            if (swipeDir === 'backward') add = !add;
                            fullOrder[0].pr = (parseFloat(fullOrder[0].pr) || 0) + (add ? v : -v);
                        }
                    } else {
                        // Non-current pin — rotate to it, applying formulas to customs passed along the way
                        var rotCount = swipeDir === 'forward' ? targetFullIdx : fullOrder.length - targetFullIdx;
                        for (var ri = 0; ri < rotCount; ri++) {
                            if (swipeDir === 'forward') {
                                fullOrder.push(fullOrder.shift());
                            } else {
                                fullOrder.unshift(fullOrder.pop());
                            }
                            // Apply formula if we landed on a custom turn during rotation
                            if (fullOrder[0] && (!fullOrder[0].id || fullOrder[0].id === '-1') && fullOrder[0].formula) {
                                var f = fullOrder[0].formula.trim();
                                var v = parseFloat(f.replace(/^[+-]/, '')) || 0;
                                var add = f.startsWith('+');
                                if (swipeDir === 'backward') add = !add;
                                fullOrder[0].pr = (parseFloat(fullOrder[0].pr) || 0) + (add ? v : -v);
                            }
                        }
                    }
                }
                Campaign().set('turnorder', JSON.stringify(fullOrder));
            }

            reflowInitiativeHud('none');
            updateTurnReticle();

            // Scale change — adjust all HUD pins to match and update tokenSize
            var newScale = obj.get('scale');
            var oldScale = prev.scale;
            if (newScale !== oldScale && newScale != null) {
                newScale = Math.max(0.25, Math.min(2.0, newScale));
                obj.set('scale', newScale);
                data.tokenSize = Math.round(40 * newScale);
                // Apply scale to all HUD entry pins
                data.entries.forEach(function(e) {
                    var pin = getObj('pin', e.tokenId);
                    if (pin) pin.set('scale', newScale);
                });
                reflowInitiativeHud('none');
            }
        });

        // --- TriggerMap auto-rebuild ---

        // Helper: check if a page belongs to any active group
        var isActivePage = function(pageId) {
            var s = state[SCRIPT_NAME];
            return Object.values(s.activeGroups).some(function(g) {
                if (g.masterPageId === pageId) return true;
                return Object.values(g.playerPages).some(function(p) { return p.pageId === pageId; });
            });
        };

        // 1. Handout notes change → rebuild triggerMap from cache
        on('change:handout:notes', function(obj) {
            var s = state[SCRIPT_NAME];
            if (Object.keys(s.activeGroups).length === 0) return;
            var handoutId = obj.get('_id');
            if (knownScriptPins.some(function(p) { return p.handoutId === handoutId; })) {
                rebuildTriggerMapFromCache();
            }
        });

        // 2. Pin gmnotes change → rebuild from cache if pin is known
        on('change:pin:gmNotes', function(obj) {
            if (Object.keys(state[SCRIPT_NAME].activeGroups).length === 0) return;
            if (knownScriptPins.some(function(p) { return p.pinId === obj.get('_id'); })) {
                rebuildTriggerMapFromCache();
            }
        });

        // 3. Pin link/linkType change → rebuild from cache
        on('change:pin:link', function(obj) {
            if (Object.keys(state[SCRIPT_NAME].activeGroups).length === 0) return;
            // Update cache entry with new handout link
            var pinId = obj.get('_id');
            var cached = knownScriptPins.find(function(p) { return p.pinId === pinId; });
            if (cached) {
                cached.handoutId = obj.get('link') || null;
                rebuildTriggerMapFromCache();
            } else if (isActivePage(obj.get('_pageid')) && obj.get('link') && obj.get('linkType') === 'handout') {
                // New script pin — add to cache and rebuild
                knownScriptPins.push({ pinId: pinId, pageId: obj.get('_pageid'), handoutId: obj.get('link') });
                rebuildTriggerMapFromCache();
            }
        });
        on('change:pin:linkType', function(obj) {
            if (Object.keys(state[SCRIPT_NAME].activeGroups).length === 0) return;
            if (knownScriptPins.some(function(p) { return p.pinId === obj.get('_id'); })) {
                rebuildTriggerMapFromCache();
            }
        });

        // 4. New pin added to active page → add to cache and rebuild
        on('add:pin', function(obj) {
            if (Object.keys(state[SCRIPT_NAME].activeGroups).length === 0) return;
            if (!isActivePage(obj.get('_pageid'))) return;
            if (obj.get('link') && obj.get('linkType') === 'handout') {
                knownScriptPins.push({ pinId: obj.get('_id'), pageId: obj.get('_pageid'), handoutId: obj.get('link') });
                rebuildTriggerMapFromCache();
            }
        });
    };

    return { checkInstall, registerEventHandlers };
})();

on('ready', () => {
    'use strict';
    Gaslight.checkInstall();
    Gaslight.registerEventHandlers();
});
