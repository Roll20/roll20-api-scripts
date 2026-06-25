// =============================================================================
// Gaslight v2.0.0
// Last Updated: 2026-06-25
// Author: Kenan Millet
//
// Description:
//   Per-player map perception. Split players onto individual copies of a page
//   with tokens synchronized via Anchor and Mirror. Each player can see
//   different things while token movement stays consistent across all copies.
//   Commands auto-relay to all player pages transparently.
//
// Dependencies: Anchor, Mirror, SelectManager
//
// Commands:
//   !gaslight setup <group>                     Quick-configure from duplicates
//   !gaslight split <group> [--force]           Activate a prepared group
//   !gaslight merge [group]                     Tear down links, return players
//   !gaslight test <group>                      Dry-run linking resolution
//   !gaslight link [<name>|new] [ids...]        Set gaslight_link on tokens
//   !gaslight unlink [ids...|--group <g>]       Remove gaslight_link from tokens
//   !gaslight group <name> <player|GM>          Assign page to group
//   !gaslight ungroup <name> <player|--all>     Remove page from group
//   !gaslight stage [players...]                Propagate tokens to player pages
//   !gaslight view [player|master]              Switch relay view target
//   !gaslight relay <views...> <!command>       Manually relay command to views
//   !gaslight config [relay-add|remove|list]    Configure auto-relay commands
//   !gaslight status                            Show current state
//   !gaslight --help                            Command reference
// =============================================================================

/* global on, sendChat, getObj, findObjs, createObj, Campaign, playerIsGM, log, state, generateUUID */

var Gaslight = Gaslight || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Gaslight';
    const SCRIPT_VERSION = '2.0.0';
    const CMD            = '!gaslight';
    const CONFIG_HEADER  = '---GASLIGHT---';
    const LINK_KEY       = 'gaslight_link';
    const GLS_TAG        = '[GLS]';

    // =========================================================================
    // Helpers
    // =========================================================================

    const stripGlsTag = (name) => {
        return (name || '').replace(/^\[GLS\]\s*/i, '').trim();
    };

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
                view: null
            };
        }
        if (!state[SCRIPT_NAME].view) state[SCRIPT_NAME].view = null;
        if (!state[SCRIPT_NAME].config.relayCommands) state[SCRIPT_NAME].config.relayCommands = [];
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
     * Stage a single token to target pages using 3-step logic.
     * Returns number of clones created.
     */
    const stageTokenToPages = (token, targetPageIds) => {
        var linkId = getLinkId(token);
        var pagesToCloneTo = [];

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

        var cloned = 0;
        pagesToCloneTo.forEach(function(targetPageId) {
            var imgsrc = token.get('imgsrc');
            if (!imgsrc) return;
            var newToken = createObj('graphic', {
                _subtype: 'token',
                pageid: targetPageId,
                imgsrc: imgsrc,
                left: token.get('left'),
                top: token.get('top'),
                width: token.get('width'),
                height: token.get('height'),
                rotation: token.get('rotation'),
                layer: token.get('layer'),
                name: token.get('name'),
                represents: token.get('represents') || '',
                controlledby: token.get('controlledby') || ''
            });
            if (newToken) setLinkId(newToken, getLinkId(token));
            cloned++;
        });
        return cloned;
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
     * Read the gaslight_sync character attribute.
     * Returns:
     *   null — attribute absent (default: sync all non-spatial)
     *   '' — attribute present but empty (no sync)
     *   ['prop1','prop2',...] — specific props to sync
     */
    const getGaslightSync = (charId) => {
        if (!charId) return null;
        var attr = findObjs({ _type: 'attribute', _characterid: charId, name: 'gaslight_sync' })[0];
        if (!attr) return null;
        var val = attr.get('current');
        if (val === undefined || val === null) return null;
        val = val.trim();
        if (val === '') return '';
        // Parse comma-separated props, resolve groups
        // Prefix with ! to exclude (e.g. "!anchor" = everything except anchor props)
        var parts = val.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
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
     * Returns array of { message, severity } where severity is 'info'|'warning'|'error'.
     */
    const checkWarnings = (groupInfo) => {
        const warnings = [];
        const allPageIds = [groupInfo.master].concat(Object.values(groupInfo.players).map(function(p) { return p.pageId; }));

        // Collect all gaslight_link IDs and their page locations
        const linkIdPages = {}; // linkId → Set of pageIds
        const linkIdDupes = {}; // pageId → Set of linkIds that appear more than once
        allPageIds.forEach(function(pid) {
            var tokens = findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' });
            var seenOnPage = {};
            tokens.forEach(function(t) {
                var lid = getLinkId(t);
                if (!lid) return;
                if (!linkIdPages[lid]) linkIdPages[lid] = new Set();
                linkIdPages[lid].add(pid);
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
                warnings.push({ message: 'Duplicate gaslight_link "' + lid + '" on page "' + pageName + '"', severity: 'error' });
            });
        });

        // Info/Warning: gaslight_link missing from pages
        Object.entries(linkIdPages).forEach(function(entry) {
            var lid = entry[0], pages = entry[1];
            if (pages.size === 1) {
                warnings.push({ message: 'gaslight_link "' + lid + '" exists on only 1 page (likely mistake)', severity: 'warning' });
            } else if (pages.size < allPageIds.length) {
                warnings.push({ message: 'gaslight_link "' + lid + '" missing from some pages', severity: 'info' });
            }
        });

        return warnings;
    };

    const formatWarnings = (warnings) => {
        if (warnings.length === 0) return '';
        var out = '<br><b>Warnings:</b><br>';
        warnings.forEach(function(w) {
            var icon = w.severity === 'error' ? '🔴' : w.severity === 'warning' ? '🟡' : 'ℹ️';
            out += icon + ' ' + w.message + '<br>';
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

            // Check gaslight_sync attribute
            var syncProps = getGaslightSync(repCharId);
            // syncProps: null = default (base spatial), '' = no sync at all, array = specific

            // If empty string, skip all linking for this group
            if (syncProps === '') return;

            // Determine which props go to Anchor vs Mirror
            var allAnchorProps = ['left', 'top', 'rotation', 'width', 'height', 'flipv', 'fliph', 'layer'];
            var needsAnchor = true;
            var anchorComponents = null; // null = use Anchor defaults
            var mirrorProps = null; // null = all non-anchor
            if (Array.isArray(syncProps)) {
                var anchorRequested = syncProps.filter(function(p) { return allAnchorProps.indexOf(p) !== -1; });
                var mirrorRequested = syncProps.filter(function(p) { return allAnchorProps.indexOf(p) === -1; });
                needsAnchor = anchorRequested.length > 0;
                // Pass specific components to Anchor if not the full default set
                if (needsAnchor) {
                    anchorComponents = {};
                    anchorRequested.forEach(function(p) { anchorComponents[p] = true; });
                }
                mirrorProps = mirrorRequested.length > 0 ? mirrorRequested : false;
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
                    // Default: sync all minus whatever Anchor is handling
                    var mirrorExcludes = anchorComponents ? Object.keys(anchorComponents) : allAnchorProps;
                    Mirror.chainLink(ids, null, mirrorExcludes);
                } else if (Array.isArray(mirrorProps) && mirrorProps.length > 0) {
                    // Specific non-spatial props
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
        if (args.length < 1) { reply(msg, 'Error', 'Usage: !gaslight setup &lt;group_name&gt; [--selected | player names...]'); return; }
        var groupName = args.shift();

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
        var stripCopyOf = function(name) {
            while (name.indexOf('Copy of ') === 0) name = name.slice(8);
            return name;
        };
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
            findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(autoPopulateLinkId);
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
                out += '<br>🟡 ' + unlinkWarnings.length + ' token(s) could not be linked: ' +
                    unlinkWarnings.map(function(w) { return w.source.get('name') || w.source.get('id'); }).join(', ') + '<br>';
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
            if (player) psp[playerId] = pInfo.pageId;
            else reply(msg, 'Warning', 'Player "' + pInfo.name + '" (' + playerId + ') not found.');
        });
        Campaign().set('playerspecificpages', psp);

        // Establish links
        establishLinks(groupName, groupInfo, allLinks);

        var summary = 'Group "' + groupName + '" activated. ' +
            Object.keys(groupInfo.players).length + ' player(s), ' +
            allLinks.length + ' link(s) established.';
        if (unlinkWarnings.length > 0) {
            summary += '<br>' + unlinkWarnings.length + ' token(s) could not be linked: ' +
                unlinkWarnings.map(function(w) { return w.source.get('name') || w.source.get('id'); }).join(', ');
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
        const groupsToMerge = groupName ? [groupName] : Object.keys(s.activeGroups);
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

            var psp = Campaign().get('playerspecificpages') || {};
            Object.keys(active.playerPages).forEach(function(playerId) {
                delete psp[playerId];
            });
            Campaign().set('playerspecificpages', Object.keys(psp).length > 0 ? psp : false);
            delete s.activeGroups[gn];
        });

        reply(msg, 'Merge', 'Merged ' + groupsToMerge.length + ' group(s). Players returned to shared page.');
    };

    const doTest = (msg, args) => {
        const groupName = args[0];
        if (!groupName) { reply(msg, 'Error', 'Usage: !gaslight test &lt;group&gt;'); return; }

        const groupInfo = discoverGroup(groupName);
        if (!groupInfo.master) { reply(msg, 'Error', 'No master page for group "' + groupName + '".'); return; }

        var out = '<b>Link Test: ' + groupName + '</b><br>';
        Object.entries(groupInfo.players).forEach(function(entry) {
            var playerId = entry[0], pInfo = entry[1];
            out += '<br><b>Master → ' + pInfo.name + ':</b><br>';
            var links = resolveLinks(groupInfo.master, pInfo.pageId);
            links.forEach(function(l) {
                var srcName = l.source.get('name') || l.source.get('id');
                if (l.target) {
                    var tgtName = l.target.get('name') || l.target.get('id');
                    out += '✓ ' + srcName + ' → ' + tgtName + ' (step ' + l.step + ')<br>';
                } else {
                    out += '🟡 ' + srcName + ' — no match found<br>';
                }
            });
            if (links.length === 0) out += '(no linkable tokens)<br>';
        });

        // Global warnings
        out += formatWarnings(checkWarnings(groupInfo));

        reply(msg, out);
    };

    const doLink = (msg, args) => {
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
        reply(msg, 'Link', tokens.length + ' token(s) linked as "' + linkId + '".');
    };

    const doUnlink = (msg, args) => {
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
        tokens.forEach(removeLinkId);
        reply(msg, 'Unlink', tokens.length + ' token(s) unlinked.');
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
            var current = s.view ? Object.values(s.activeGroups).reduce(function(name, g) {
                if (name) return name;
                var entry = g.playerPages[s.view];
                return entry ? entry.name : null;
            }, null) || s.view : 'master';
            reply(msg, 'View', 'Current view: <b>' + current + '</b>');
            return;
        }
        var arg = args.join(' ').replace(/^["']|["']$/g, '');
        if (arg.toLowerCase() === 'master' || arg.toLowerCase() === 'gm') {
            s.view = null;
            reply(msg, 'View', 'Switched to <b>master</b> view. Commands target master tokens; use <code>!gaslight relay</code> for player targeting.');
        } else {
            // Resolve player
            var resolved = resolvePlayer(msg, arg, CMD + ' view');
            if (!resolved || resolved === 'ambiguous') return;
            s.view = resolved.id;
            reply(msg, 'View', 'Switched to <b>' + resolved.name + '</b> view. Commands will auto-target their linked tokens.');
        }
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
            targetPlayerIds = Object.keys(groupInfo.players);
        }

        if (targetPlayerIds.length === 0) { reply(msg, 'Error', 'No valid target players.'); return; }

        var staged = 0;
        tokens.forEach(function(token) {
            var sourcePageId = token.get('_pageid');
            var targetPages = targetPlayerIds
                .map(function(pid) { return groupInfo.players[pid].pageId; })
                .filter(function(pid) { return pid !== sourcePageId; });
            // Include master if source is not master
            if (sourcePageId !== groupInfo.master) targetPages.push(groupInfo.master);
            staged += stageTokenToPages(token, targetPages);
        });

        // Re-run linking for this group to pick up the new tokens
        if (staged > 0) {
            var groupDiscovered = discoverGroup(groupName);
            var allPageIds = [groupDiscovered.master].concat(Object.values(groupDiscovered.players).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pid) {
                findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(autoPopulateLinkId);
            });
            var allLinks = [];
            Object.values(groupDiscovered.players).forEach(function(pInfo) {
                var links = resolveLinks(groupDiscovered.master, pInfo.pageId);
                links.forEach(function(l) { if (l.target) allLinks.push(l); });
            });
            establishLinks(groupName, groupDiscovered, allLinks);
        }

        reply(msg, 'Stage', 'Staged ' + staged + ' token(s) to ' + targetPlayerIds.length + ' player page(s).');
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
        stageTokenToPages(obj, targetPages);

        // Re-link after a short delay to let createObj finish
        setTimeout(function() {
            var groupDiscovered = discoverGroup(groupName);
            var allPageIds = [groupDiscovered.master].concat(Object.values(groupDiscovered.players).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pid) {
                findObjs({ _type: 'graphic', _pageid: pid, _subtype: 'token' }).forEach(autoPopulateLinkId);
            });
            var allLinks = [];
            Object.values(groupDiscovered.players).forEach(function(pInfo) {
                var links = resolveLinks(groupDiscovered.master, pInfo.pageId);
                links.forEach(function(l) { if (l.target) allLinks.push(l); });
            });
            establishLinks(groupName, groupDiscovered, allLinks);
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
        + '<code>' + CMD + ' split &lt;group&gt;</code> -- Activate group<br>'
        + '<code>' + CMD + ' merge [group]</code> -- Tear down links<br>'
        + '<code>' + CMD + ' test &lt;group&gt;</code> -- Dry-run linking<br>'
        + '<code>' + CMD + ' link [name|new] [ids...]</code> -- Link tokens<br>'
        + '<code>' + CMD + ' unlink [ids...]</code> -- Unlink tokens<br>'
        + '<code>' + CMD + ' group &lt;group&gt; &lt;player|GM&gt;</code> -- Assign page<br>'
        + '<code>' + CMD + ' ungroup &lt;group&gt; &lt;player|GM|--all&gt;</code> -- Remove config<br>'
        + '<code>' + CMD + ' status</code> -- Show state<br>'
        + '<code>' + CMD + ' --help</code> -- This help<br>';

    // =========================================================================
    // Scripting Engine — Fetch Integration
    // =========================================================================

    // Module-level evaluation context for Fetch compProp resolution
    var evaluationContext = { scope: 'token', targetId: null, viewerPlayerId: null };

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
     * Resolution depends on evaluationContext.scope.
     */
    const registerGlCompProp = (fieldName) => {
        if (typeof Fetch === 'undefined' || !Fetch.CustomPropsByType) return;
        if (Fetch.CustomPropsByType.graphic.compProps[fieldName]) return;

        var valFn = function(o) {
            if (evaluationContext.scope === 'token') {
                return readGlField(o.gmnotes, fieldName);
            } else {
                var charId = o.represents;
                if (!charId) return '';
                return getAttrByName(charId, fieldName) || '';
            }
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
        var rx = /@\([^)]*\.(gl_[a-zA-Z0-9_]+)\)/g;
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
        var s = state[SCRIPT_NAME];

        Object.values(s.activeGroups).forEach(function(group) {
            var allPageIds = [group.masterPageId].concat(Object.values(group.playerPages).map(function(p) { return p.pageId; }));
            allPageIds.forEach(function(pageId) {
                var pins = findScriptPins(pageId);
                pins.forEach(function(pin) {
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
    const findScriptPins = (pageId) => {
        var pins = findObjs({ _type: 'pin', _pageid: pageId });
        return pins.filter(function(pin) {
            if (pin.get('link') && pin.get('linkType') === 'handout') return true;
            var notes = pin.get('gmNotes') || '';
            try { notes = decodeURIComponent(notes); } catch(e) {}
            return notes.indexOf('---GASLIGHT-SCRIPT---') !== -1;
        });
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
                        callback({ scope: 'token', filter: 'all', triggers: [] });
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
        var config = { scope: 'token', filter: 'all', triggers: [] };
        // Strip HTML and normalize line breaks
        text = text.replace(/<\/p>/gi, '\n').replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
        text.split('\n').forEach(function(line) {
            line = line.trim();
            if (line.startsWith('scope:')) config.scope = line.slice(6).trim();
            else if (line.startsWith('filter:')) config.filter = line.slice(7).trim();
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

        // Set evaluation context for Fetch compProp resolution
        evaluationContext.scope = config.scope || 'token';
        evaluationContext.targetId = viewerTarget.get('id');
        evaluationContext.viewerPlayerId = viewerPlayerId; // no linked copy on this viewer's page

        var content = scriptContent;
        // Resolve @(target.gl_*) ourselves since Fetch compProps don't fire for sendChat messages
        content = content.replace(/@\(target\.(gl_[a-zA-Z0-9_]+)\)/g, function(match, field) {
            var val = '';
            if (config.scope === 'token') {
                val = readGlField(viewerTarget.get('gmnotes'), field);
            }
            if (!val) {
                var charId = viewerTarget.get('represents');
                val = charId ? (getAttrByName(charId, field) || '') : '';
            }
            return val;
        });
        // Replace remaining @(target.*) with token ID — Fetch resolves native props
        content = content.replace(/@\(target\./g, '@(' + viewerTarget.get('id') + '.');
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

        if (dryRun) {
            lines.forEach(function(l) {
                sendChat('player|' + msg.playerid, CMD + ' --echo ' + viewerPlayerId + ' ' + viewerTarget.get('id') + ' ' + l);
            });
        } else {
            var fullCmd = lines.join('\n');
            if (fullCmd) {
                var senderId = msg.playerid;
                if (senderId === 'API') {
                    var gmPlayer = findObjs({ _type: 'player' }).find(function(p) { return playerIsGM(p.get('_id')); });
                    if (gmPlayer) senderId = gmPlayer.get('_id');
                }
                sendChat('', CMD + ' --script-lock', null, { noarchive: true });
                sendChat(getPlayerName(senderId), fullCmd);
                sendChat('', CMD + ' --script-unlock', null, { noarchive: true });
            }
        }
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

        const args = msg.content.slice(CMD.length).trim().split(/\s+/).filter(Boolean);
        const sub = (args.shift() || '').toLowerCase();

        switch (sub) {
            case 'setup':   doSetup(msg, args);   break;
            case 'split':   doSplit(msg, args);   break;
            case 'merge':   doMerge(msg, args);   break;
            case 'test':    doTest(msg, args);    break;
            case 'link':    doLink(msg, args);    break;
            case 'unlink':  doUnlink(msg, args);  break;
            case 'group':   doGroup(msg, args);   break;
            case 'ungroup': doUngroup(msg, args); break;
            case 'relay':   doRelay(msg, args);   break;
            case 'view':    doView(msg, args);    break;
            case 'stage':   doStage(msg, args);   break;
            case 'config':  doConfig(msg, args);  break;
            case 'eval':    doEval(msg, args);    break;
            case 'status':  doStatus(msg);        break;
            case '--script-lock': scripting = true; return;
            case '--script-unlock': scripting = false; return;
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
            default:        reply(msg, HELP_TEXT); break;
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
            '<li>Select party tokens on the master page, run: <code>!gaslight setup mygroup</code> — this auto-detects duplicates, assigns pages to players, and configures the group.</li>',
            '<li>Run <code>!gaslight test mygroup</code> — dry-run that shows how tokens will link without activating anything. Fix any warnings before proceeding.</li>',
            '<li>Run <code>!gaslight split mygroup</code> — activates the group: links tokens across pages, moves players to their individual pages, and begins syncing.</li>',
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
        ].join(''));
    };

    const checkInstall = () => {
        ensureState();
        createHelpHandout();
        log('-=> ' + SCRIPT_NAME + ' v' + SCRIPT_VERSION + ' Initialized <=-');
        checkDanglingGroups();
    };

    /**
     * When a linked token is deleted, delete its counterparts on other pages.
     */
    var destroying = false;
    const onTokenDestroyed = (obj) => {
        if (destroying) return;
        var s = state[SCRIPT_NAME];
        var tokenId = obj.get('id');

        // Find if this token is tracked in any active group
        var linkedIds = null;
        Object.values(s.activeGroups).forEach(function(active) {
            if (active.linkedTokens[tokenId]) {
                linkedIds = active.linkedTokens[tokenId];
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
                        if (!linkedIds) linkedIds = [entry[0]].concat(entry[1].filter(function(id) { return id !== tokenId; }));
                    }
                });
            }
        });

        if (!linkedIds || linkedIds.length === 0) return;

        // Remove Anchor/Mirror links and delete counterparts
        destroying = true;
        linkedIds.forEach(function(id) {
            if (typeof Anchor !== 'undefined') Anchor.removeAnchor(id);
            if (typeof Mirror !== 'undefined') Mirror.unlink([id]);
            var target = getObj('graphic', id);
            if (target) target.remove();
        });
        destroying = false;
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
            var targetPlayerIds = viewPlayerId ? [viewPlayerId] : Object.keys(activeEntry[1].playerPages);
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

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('chat:message', viewInterceptor);
        on('chat:message', function(msg) {
            if (msg.type === 'api' && msg.content === '!rollcapture-ready') registerWithRollCapture();
        });
        registerWithRollCapture();
        on('add:graphic', onTokenAdded);
        on('destroy:graphic', onTokenDestroyed);
        on('change:attribute', onAttributeChanged);
        on('change:graphic', onGraphicPropChanged);
        on('change:graphic:gmnotes', onGmNotesChanged);
    };

    return { checkInstall, registerEventHandlers };
})();

on('ready', () => {
    'use strict';
    Gaslight.checkInstall();
    Gaslight.registerEventHandlers();
});
