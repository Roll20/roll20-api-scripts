// =============================================================================
// Gaslight v1.0.0
// Last Updated: 2026-06-14
// Author: Kenan Millet
//
// Description:
//   Per-player map perception. Split players onto individual copies of a page
//   with tokens synchronized via Anchor. Each player can see different things
//   while token movement stays consistent across all copies.
//
// Dependencies: Anchor
//
// Commands:
//   !gaslight split <group>                     Activate a prepared gaslight group
//   !gaslight merge [group]                     Tear down links, return players
//   !gaslight test <group>                      Dry-run linking resolution
//   !gaslight link [<name>|new] [ids...]        Set gaslight_link on tokens
//   !gaslight unlink [ids...]                   Remove gaslight_link from tokens
//   !gaslight group <name> <player>             Assign page to group
//   !gaslight master <group>                    Designate page as group master
//   !gaslight status                            Show current state
//   !gaslight --help                            Command reference
// =============================================================================

/* global on, sendChat, getObj, findObjs, createObj, Campaign, playerIsGM, log, state, generateUUID */

var Gaslight = Gaslight || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Gaslight';
    const SCRIPT_VERSION = '1.0.0';
    const CMD            = '!gaslight';
    const CONFIG_HEADER  = '---GASLIGHT---';
    const LINK_KEY       = 'gaslight_link';

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
        const match = notes.match(/gaslight_link:\s*(.+)/);
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

        // Find candidate pages: pages with the same name or name starting with masterName
        var allPages = findObjs({ _type: 'page' });
        var candidates = allPages.filter(function(p) {
            return p.get('name') === masterName || p.get('name').indexOf(masterName) === 0;
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
     * Shared relay execution: sends command to linked tokens on target pages.
     * Returns number of tokens relayed to.
     */
    const executeRelay = (sender, tokens, command, targetPlayerIds, includeMaster) => {
        var s = state[SCRIPT_NAME];
        var relayed = 0;

        if (includeMaster) {
            var masterIds = tokens.map(function(t) { return t.get('id'); });
            sendChat(sender, command + ' {& select ' + masterIds.join(', ') + '}');
            relayed += masterIds.length;
        }

        if (targetPlayerIds.length > 0) {
            // Collect linked tokens in selection order
            var orderedLinkedIds = [];
            tokens.forEach(function(token) {
                var tokenId = token.get('id');
                Object.values(s.activeGroups).forEach(function(active) {
                    var allLinked = active.linkedTokens[tokenId] || [];
                    Object.entries(active.linkedTokens).forEach(function(entry) {
                        if (entry[1].indexOf(tokenId) !== -1) {
                            allLinked = allLinked.concat([entry[0]]).concat(entry[1]);
                        }
                    });
                    allLinked = allLinked.filter(function(id, i) { return allLinked.indexOf(id) === i && id !== tokenId; });

                    allLinked.forEach(function(id) {
                        var obj = getObj('graphic', id);
                        if (!obj) return;
                        var pageId = obj.get('_pageid');
                        var isTarget = Object.entries(active.playerPages).some(function(entry) {
                            return targetPlayerIds.indexOf(entry[0]) !== -1 && entry[1].pageId === pageId;
                        });
                        if (isTarget && orderedLinkedIds.indexOf(id) === -1) orderedLinkedIds.push(id);
                    });
                });
            });

            if (orderedLinkedIds.length > 0) {
                sendChat(sender, command + ' {& select ' + orderedLinkedIds.join(', ') + '}');
                relayed += orderedLinkedIds.length;
            }
        }

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
            targetPlayerIds.forEach(function(pid) {
                var targetPageId = groupInfo.players[pid].pageId;
                // Check if already exists on target page
                var existing = findMatchingToken(token, targetPageId);
                if (existing) return;
                // Clone token to target page
                var imgsrc = token.get('imgsrc');
                if (!imgsrc) return;
                createObj('graphic', {
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
                staged++;
            });
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
            return e[1].masterPageId === pageId;
        });
        if (!activeEntry) return; // only auto-stage from master page

        var groupName = activeEntry[0];
        var groupInfo = { master: activeEntry[1].masterPageId, players: activeEntry[1].playerPages };

        // Clone to all player pages
        Object.values(groupInfo.players).forEach(function(pInfo) {
            var existing = findMatchingToken(obj, pInfo.pageId);
            if (existing) return;
            var imgsrc = obj.get('imgsrc');
            if (!imgsrc) return;
            createObj('graphic', {
                _subtype: 'token',
                pageid: pInfo.pageId,
                imgsrc: imgsrc,
                left: obj.get('left'),
                top: obj.get('top'),
                width: obj.get('width'),
                height: obj.get('height'),
                rotation: obj.get('rotation'),
                layer: obj.get('layer'),
                name: obj.get('name'),
                represents: charId,
                controlledby: obj.get('controlledby') || ''
            });
        });

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
            case 'status':  doStatus(msg);        break;
            case '--help':  reply(msg, HELP_TEXT); break;
            default:        reply(msg, HELP_TEXT); break;
        }
    };

    // =========================================================================
    // Initialization
    // =========================================================================

    const checkInstall = () => {
        ensureState();
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
     * In any active view mode, intercept non-gaslight API commands and re-emit
     * with linked player tokens as selection via SelectManager.
     * Master view: relay to ALL player pages.
     * Player view: relay to that player's page only.
     */
    const viewInterceptor = (msg) => {
        if (msg.type !== 'api') return;
        var s = state[SCRIPT_NAME];
        if (Object.keys(s.activeGroups).length === 0) return;
        var firstWord = msg.content.split(' ')[0];
        if (firstWord === CMD || firstWord === '!mirror' || firstWord === '!anchor') return;
        if (!msg.selected || msg.selected.length === 0) return;
        if (msg.content.indexOf('{& select') !== -1) return;

        var tokens = msg.selected.map(function(sel) { return getObj(sel._type, sel._id); }).filter(Boolean);
        if (tokens.length === 0) return;

        var pageId = tokens[0].get('_pageid');
        var isGM = playerIsGM(msg.playerid);

        // Case 1: GM on master page — relay based on view
        if (isGM) {
            var activeEntry = Object.entries(s.activeGroups).find(function(e) { return e[1].masterPageId === pageId; });
            if (!activeEntry) return;

            var viewPlayerId = s.view;
            var targetPlayerIds = viewPlayerId ? [viewPlayerId] : Object.keys(activeEntry[1].playerPages);
            executeRelay('player|' + msg.playerid, tokens, msg.content, targetPlayerIds, false);
            return;
        }

        // Case 2: Player on their page — relay if command is in relay-commands list
        if (s.config.relayCommands.indexOf(firstWord) === -1) return;

        // Find which group/player this page belongs to
        var activeEntry = null;
        var sourcePlayerId = null;
        Object.entries(s.activeGroups).forEach(function(e) {
            Object.entries(e[1].playerPages).forEach(function(pp) {
                if (pp[1].pageId === pageId) { activeEntry = e; sourcePlayerId = pp[0]; }
            });
        });
        if (!activeEntry) return;

        // Relay to all OTHER player pages + master
        var targetPlayerIds = Object.keys(activeEntry[1].playerPages).filter(function(id) { return id !== sourcePlayerId; });
        executeRelay('player|' + msg.playerid, tokens, msg.content, targetPlayerIds, true);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('chat:message', viewInterceptor);
        on('add:graphic', onTokenAdded);
        on('destroy:graphic', onTokenDestroyed);
    };

    return { checkInstall, registerEventHandlers };
})();

on('ready', () => {
    'use strict';
    Gaslight.checkInstall();
    Gaslight.registerEventHandlers();
});
