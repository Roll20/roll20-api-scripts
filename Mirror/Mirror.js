// =============================================================================
// Mirror v1.0.0
// Last Updated: 2026-06-15
// Author: Kenan Millet
//
// Description:
//   Flat property syncing between tokens. No transforms, no offsets -- when a
//   property changes on one token, the same value is copied to linked tokens.
//   Supports unidirectional (link) and bidirectional ring (chain) modes.
//   Unidirectional links hard-lock children by default (changes reverted).
//
// Dependencies: none
//
// Commands:
//   !mirror link [--soft] [props/groups] [ids...]   Unidirectional link
//   !mirror unlink [props/groups] [ids...]          Remove link or properties
//   !mirror chain [props/groups] [ids...]           Bidirectional ring link
//   !mirror unchain [props/groups] [ids...]         Remove chain or properties
//   !mirror status                                  Show links for selected
//   !mirror --help                                  Command reference
// =============================================================================

/* global on, sendChat, getObj, findObjs, playerIsGM, log, state */

var Mirror = Mirror || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Mirror';
    const SCRIPT_VERSION = '1.0.0';
    const CMD            = '!mirror';

    // All syncable graphic properties
    const ALL_PROPS = [
        'left', 'top', 'width', 'height', 'rotation',
        'flipv', 'fliph', 'layer',
        'bar1_value', 'bar1_max', 'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max',
        'aura1_radius', 'aura1_color', 'aura1_square',
        'aura2_radius', 'aura2_color', 'aura2_square',
        'tint_color', 'statusmarkers', 'name', 'showname',
        'light_radius', 'light_dimradius', 'light_angle', 'light_otherplayers',
        'light_hassight', 'light_losangle', 'light_multiplier',
        'has_bright_light_vision', 'has_night_vision', 'night_vision_distance',
        'emits_bright_light', 'bright_light_distance', 'emits_low_light', 'low_light_distance',
        'baseOpacity', 'currentSide'
    ];

    // Property groups
    const PROP_GROUPS = {
        position: ['left', 'top'],
        size: ['width', 'height'],
        spatial: ['left', 'top', 'rotation', 'width', 'height'],
        bars: ['bar1_value', 'bar1_max', 'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max'],
        light: ['light_radius', 'light_dimradius', 'light_angle', 'light_otherplayers',
                'light_hassight', 'light_losangle', 'light_multiplier',
                'has_bright_light_vision', 'has_night_vision', 'night_vision_distance',
                'emits_bright_light', 'bright_light_distance', 'emits_low_light', 'low_light_distance'],
        auras: ['aura1_radius', 'aura1_color', 'aura1_square', 'aura2_radius', 'aura2_color', 'aura2_square'],
        flip: ['flipv', 'fliph']
    };

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
        const prefix = text !== undefined ? ' [' + tag + ']' : '';
        const recipient = getPlayerName(msg.playerid);
        sendChat(SCRIPT_NAME + prefix, '/w "' + recipient + '" ' + body);
    };

    const genId = () => Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

    const ensureState = () => {
        if (!state[SCRIPT_NAME]) {
            state[SCRIPT_NAME] = {
                links: {},
                chainedIds: {},
                knownProps: {},
                configInitialized: false
            };
        }
        if (!state[SCRIPT_NAME].chainedIds) state[SCRIPT_NAME].chainedIds = {};
        if (!state[SCRIPT_NAME].knownProps) state[SCRIPT_NAME].knownProps = {};
        if (!state[SCRIPT_NAME].globalExcludes) state[SCRIPT_NAME].globalExcludes = [];
        // Seed global excludes from useroptions on first run
        if (!state[SCRIPT_NAME].configInitialized && typeof globalconfig !== 'undefined' && globalconfig[SCRIPT_NAME]) {
            var gc = globalconfig[SCRIPT_NAME];
            if (gc['Global Excludes'] && gc['Global Excludes'].trim()) {
                state[SCRIPT_NAME].globalExcludes = gc['Global Excludes'].split(',').map(function(s) { return s.trim(); }).filter(Boolean);
            }
            state[SCRIPT_NAME].configInitialized = true;
        }
        // Seed known props from ALL_PROPS
        ALL_PROPS.forEach(function(p) { state[SCRIPT_NAME].knownProps[p] = true; });
    };

    const hasGlobalConfig = () => {
        return typeof globalconfig !== 'undefined' && globalconfig[SCRIPT_NAME] && 'Global Excludes' in globalconfig[SCRIPT_NAME];
    };

    const getKnownProps = () => Object.keys(state[SCRIPT_NAME].knownProps);

    // =========================================================================
    // Property Resolution
    // =========================================================================

    const resolveProps = (args) => {
        var props = [];
        var remaining = [];
        args.forEach(function(arg) {
            if (arg === 'all') {
                props = props.concat(getKnownProps());
            } else if (PROP_GROUPS[arg]) {
                props = props.concat(PROP_GROUPS[arg]);
            } else if (ALL_PROPS.indexOf(arg) !== -1) {
                props.push(arg);
            } else {
                remaining.push(arg);
            }
        });
        // Deduplicate props
        props = props.filter(function(p, i) { return props.indexOf(p) === i; });
        return { props: props, remaining: remaining };
    };

    // =========================================================================
    // Link Management
    // =========================================================================

    const getSelectedIds = (msg) => {
        return (msg.selected || []).map(function(s) { return s._id; }).filter(Boolean);
    };

    const parseCommand = (msg, args) => {
        var soft = args.indexOf('--soft') !== -1;
        var align = args.indexOf('--align') !== -1;
        args = args.filter(function(a) { return a !== '--soft' && a !== '--align'; });

        // Parse --exclude
        var excludes = [];
        var exIdx = args.indexOf('--exclude');
        if (exIdx !== -1) {
            var afterExclude = args.slice(exIdx + 1);
            args = args.slice(0, exIdx);
            var exResolved = resolveProps(afterExclude);
            excludes = exResolved.props;
            // Any remaining non-prop args after --exclude are IDs
            args = args.concat(exResolved.remaining);
        }

        var resolved = resolveProps(args);
        var ids = resolved.remaining.filter(function(a) { return a.startsWith('-'); });
        ids = ids.concat(getSelectedIds(msg));
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; }); // dedupe

        // Determine if using 'all' or specific props
        var props;
        if (resolved.props.length === 0) {
            props = 'all'; // default: all
        } else if (resolved.props.length === getKnownProps().length) {
            props = 'all'; // explicit 'all' group resolved to full list
        } else {
            props = resolved.props;
        }

        return { props: props, ids: ids, soft: soft, align: align, excludes: excludes };
    };

    /**
     * Align targets to source: copy specified props from first token to all others.
     */
    const alignTokens = (ids, props) => {
        if (ids.length < 2) return;
        var source = getObj('graphic', ids[0]);
        if (!source) return;
        var updates = {};
        props.forEach(function(p) { updates[p] = source.get(p); });
        for (var i = 1; i < ids.length; i++) {
            var target = getObj('graphic', ids[i]);
            if (target) target.set(updates);
        }
    };

    const createLink = (mode, props, ids, soft, excludes) => {
        var s = state[SCRIPT_NAME];
        var linkId = genId();
        s.links[linkId] = { props: props, ids: ids, mode: mode, soft: soft, excludes: excludes || [] };
        if (mode === 'chain') {
            ids.forEach(function(id) { s.chainedIds[id] = true; });
        }
        return linkId;
    };

    /**
     * Get the effective props for a link, accounting for 'all'/'api-all' and excludes.
     */
    const getEffectiveProps = (link) => {
        if (link.props === 'all') {
            var excludes = (link.excludes || []).concat(getGlobalExcludes());
            return getKnownProps().filter(function(p) { return excludes.indexOf(p) === -1; });
        }
        if (link.props === 'api-all') {
            var excludes = link.excludes || [];
            return getKnownProps().filter(function(p) { return excludes.indexOf(p) === -1; });
        }
        return link.props;
    };

    const getGlobalExcludes = () => {
        return state[SCRIPT_NAME].globalExcludes || [];
    };

    const findLinksForToken = (tokenId) => {
        var s = state[SCRIPT_NAME];
        var results = [];
        Object.entries(s.links).forEach(function(entry) {
            if (entry[1].ids.indexOf(tokenId) !== -1) results.push({ id: entry[0], link: entry[1] });
        });
        return results;
    };

    const removePropsFromLink = (linkId, propsToRemove) => {
        var s = state[SCRIPT_NAME];
        var link = s.links[linkId];
        if (!link) return;
        if (!propsToRemove || propsToRemove.length === 0) {
            // Remove entire link
            if (link.mode === 'chain') {
                link.ids.forEach(function(id) { rebuildChainedIds(id, linkId); });
            }
            delete s.links[linkId];
        } else {
            link.props = link.props.filter(function(p) { return propsToRemove.indexOf(p) === -1; });
            if (link.props.length === 0) {
                if (link.mode === 'chain') {
                    link.ids.forEach(function(id) { rebuildChainedIds(id, linkId); });
                }
                delete s.links[linkId];
            }
        }
    };

    const rebuildChainedIds = (tokenId, excludeLinkId) => {
        var s = state[SCRIPT_NAME];
        // Check if token is still in any other chain
        var stillChained = Object.entries(s.links).some(function(entry) {
            return entry[0] !== excludeLinkId && entry[1].mode === 'chain' && entry[1].ids.indexOf(tokenId) !== -1;
        });
        if (!stillChained) delete s.chainedIds[tokenId];
    };

    // =========================================================================
    // Sync Engine
    // =========================================================================

    var syncing = false;

    const onGraphicChanged = (obj, prev) => {
        if (syncing) return;
        var s = state[SCRIPT_NAME];
        var tokenId = obj.get('id');

        // Find changed properties dynamically from prev keys
        var changed = Object.keys(prev).filter(function(k) {
            return !k.startsWith('_') && prev[k] !== obj.get(k);
        });
        if (changed.length === 0) return;

        // Grow known props set with any discovered properties
        changed.forEach(function(p) { s.knownProps[p] = true; });

        Object.values(s.links).forEach(function(link) {
            var idx = link.ids.indexOf(tokenId);
            if (idx === -1) return;

            // Determine relevant changed props for this link
            var effectiveProps = getEffectiveProps(link);
            var relevantProps = changed.filter(function(p) { return effectiveProps.indexOf(p) !== -1; });
            if (relevantProps.length === 0) return;

            if (link.mode === 'chain') {
                // Bidirectional: propagate to all others
                var updates = {};
                relevantProps.forEach(function(p) { updates[p] = obj.get(p); });
                syncing = true;
                link.ids.forEach(function(id) {
                    if (id === tokenId) return;
                    var target = getObj('graphic', id);
                    if (target) target.set(updates);
                });
                syncing = false;
            } else {
                // Unidirectional
                if (idx === 0) {
                    // Source changed: propagate to targets
                    var updates = {};
                    relevantProps.forEach(function(p) { updates[p] = obj.get(p); });
                    syncing = true;
                    link.ids.slice(1).forEach(function(id) {
                        var target = getObj('graphic', id);
                        if (target) target.set(updates);
                    });
                    syncing = false;
                } else if (!link.soft) {
                    // Hard lock: revert child to source value
                    var source = getObj('graphic', link.ids[0]);
                    if (source) {
                        var revert = {};
                        relevantProps.forEach(function(p) { revert[p] = source.get(p); });
                        syncing = true;
                        obj.set(revert);
                        syncing = false;
                    }
                }
            }
        });
    };

    // =========================================================================
    // Commands
    // =========================================================================

    const doLink = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length < 2) { reply(msg, 'Error', 'Link requires at least 2 tokens.'); return; }
        createLink('link', parsed.props, parsed.ids, parsed.soft, parsed.excludes);
        if (parsed.align) alignTokens(parsed.ids, parsed.props === 'all' ? getKnownProps().filter(function(p) { return parsed.excludes.indexOf(p) === -1; }) : parsed.props);
        var propCount = parsed.props === 'all' ? 'all' : parsed.props.length;
        reply(msg, 'Link', 'Linked ' + parsed.ids.length + ' tokens (' + propCount + ' props' + (parsed.soft ? ', soft' : ', hard-lock') + (parsed.excludes.length ? ', ' + parsed.excludes.length + ' excluded' : '') + (parsed.align ? ', aligned' : '') + ').');
    };

    const doUnlink = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }
        var hasSpecificProps = parsed.props !== 'all';
        var processed = 0;
        parsed.ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode !== 'link') return;
                if (!hasSpecificProps) {
                    // No props specified: remove entire link
                    removePropsFromLink(entry.id, null);
                } else if (entry.link.props === 'all') {
                    // Link uses 'all': add props to excludes
                    parsed.props.forEach(function(p) {
                        if (entry.link.excludes.indexOf(p) === -1) entry.link.excludes.push(p);
                    });
                } else {
                    // Link uses specific props: remove them
                    removePropsFromLink(entry.id, parsed.props);
                }
                processed++;
            });
        });
        reply(msg, 'Unlink', 'Processed ' + processed + ' link(s).');
    };

    const doChain = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length < 2) { reply(msg, 'Error', 'Chain requires at least 2 tokens.'); return; }

        // Check if tokens are already in an existing chain — if so, re-include props
        var existingChain = null;
        var links = findLinksForToken(parsed.ids[0]);
        for (var i = 0; i < links.length; i++) {
            if (links[i].link.mode === 'chain') { existingChain = links[i]; break; }
        }

        if (existingChain && parsed.props !== 'all') {
            // Re-include: remove specified props from excludes
            existingChain.link.excludes = (existingChain.link.excludes || []).filter(function(p) {
                return parsed.props.indexOf(p) === -1;
            });
            reply(msg, 'Chain', 'Re-included ' + parsed.props.length + ' prop(s) in existing chain.');
        } else {
            createLink('chain', parsed.props, parsed.ids, true, parsed.excludes);
            if (parsed.align) {
                var alignProps = parsed.props === 'all' ? getKnownProps().filter(function(p) { return parsed.excludes.indexOf(p) === -1; }) : parsed.props;
                alignTokens(parsed.ids, alignProps);
            }
            var propCount = parsed.props === 'all' ? 'all' : parsed.props.length;
            reply(msg, 'Chain', 'Chain-linked ' + parsed.ids.length + ' tokens (' + propCount + ' props' + (parsed.excludes.length ? ', ' + parsed.excludes.length + ' excluded' : '') + (parsed.align ? ', aligned' : '') + ').');
        }
    };

    const doUnchain = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }
        var hasSpecificProps = parsed.props !== 'all';
        var processed = 0;
        parsed.ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode !== 'chain') return;
                if (!hasSpecificProps) {
                    // No props specified: remove entire chain
                    removePropsFromLink(entry.id, null);
                } else if (entry.link.props === 'all') {
                    // Link uses 'all': add props to excludes
                    var propsToExclude = parsed.props;
                    propsToExclude.forEach(function(p) {
                        if (entry.link.excludes.indexOf(p) === -1) entry.link.excludes.push(p);
                    });
                } else {
                    // Link uses specific props: remove them
                    removePropsFromLink(entry.id, parsed.props);
                }
                processed++;
            });
        });
        reply(msg, 'Unchain', 'Processed ' + processed + ' chain(s).');
    };

    const doConfig = (msg, args) => {
        var s = state[SCRIPT_NAME];
        if (args.length === 0) {
            reply(msg, 'Config', '<b>Global excludes:</b> ' + (s.globalExcludes.length > 0 ? s.globalExcludes.join(', ') : '(none)'));
            return;
        }
        var sub = args.shift();
        if (sub === 'exclude') {
            var resolved = resolveProps(args);
            if (resolved.props.length === 0) { reply(msg, 'Error', 'Specify properties to exclude.'); return; }
            resolved.props.forEach(function(p) {
                if (s.globalExcludes.indexOf(p) === -1) s.globalExcludes.push(p);
            });
            reply(msg, 'Config', 'Global excludes: ' + s.globalExcludes.join(', '));
        } else if (sub === 'include') {
            var resolved = resolveProps(args);
            if (resolved.props.length === 0) { reply(msg, 'Error', 'Specify properties to include.'); return; }
            s.globalExcludes = s.globalExcludes.filter(function(p) { return resolved.props.indexOf(p) === -1; });
            reply(msg, 'Config', 'Global excludes: ' + (s.globalExcludes.length > 0 ? s.globalExcludes.join(', ') : '(none)'));
        } else if (sub === 'reset') {
            s.globalExcludes = [];
            reply(msg, 'Config', 'Global excludes cleared.');
        } else {
            reply(msg, 'Error', 'Usage: !mirror config [exclude|include|reset] [props]');
        }
    };

    const doAlign = (msg, args) => {
        var linked = args.indexOf('--linked') !== -1;
        var unlinked = args.indexOf('--unlinked') !== -1;
        args = args.filter(function(a) { return a !== '--linked' && a !== '--unlinked'; });
        // Default: --linked only
        if (!linked && !unlinked) linked = true;

        var parsed = parseCommand(msg, args);
        if (parsed.ids.length < 2) { reply(msg, 'Error', 'Align requires at least 2 tokens.'); return; }

        var s = state[SCRIPT_NAME];
        var aligned = 0;
        var ignored = [];

        if (linked) {
            parsed.ids.forEach(function(id) {
                var links = findLinksForToken(id);
                links.forEach(function(entry) {
                    var link = entry.link;
                    var props = parsed.props;
                    if (link.mode === 'chain') {
                        // Align to the first selected/passed id that is in this chain
                        var sourceId = parsed.ids.find(function(pid) { return link.ids.indexOf(pid) !== -1; });
                        if (!sourceId) return;
                        var source = getObj('graphic', sourceId);
                        if (!source) return;
                        var updates = {};
                        props.forEach(function(p) { updates[p] = source.get(p); });
                        link.ids.forEach(function(tid) {
                            if (tid === sourceId) return;
                            var t = getObj('graphic', tid);
                            if (t) { t.set(updates); aligned++; }
                        });
                    } else {
                        // One-way: parent aligns children, or child aligns to parent
                        var sourceIdx = link.ids.indexOf(id);
                        if (sourceIdx === 0) {
                            // This is the parent — align children to it
                            var source = getObj('graphic', id);
                            if (!source) return;
                            var updates = {};
                            props.forEach(function(p) { updates[p] = source.get(p); });
                            link.ids.slice(1).forEach(function(tid) {
                                var t = getObj('graphic', tid);
                                if (t) { t.set(updates); aligned++; }
                            });
                        } else {
                            // This is a child — align to parent
                            var source = getObj('graphic', link.ids[0]);
                            if (!source) return;
                            var updates = {};
                            props.forEach(function(p) { updates[p] = source.get(p); });
                            var target = getObj('graphic', id);
                            if (target) { target.set(updates); aligned++; }
                        }
                    }
                });
                if (links.length === 0) ignored.push(id);
            });
        }

        if (unlinked) {
            // Align unlinked tokens to first id in selection
            var sourceId = parsed.ids[0];
            var source = getObj('graphic', sourceId);
            if (source) {
                var updates = {};
                parsed.props.forEach(function(p) { updates[p] = source.get(p); });
                parsed.ids.slice(1).forEach(function(id) {
                    var links = findLinksForToken(id);
                    if (links.length === 0) {
                        var t = getObj('graphic', id);
                        if (t) { t.set(updates); aligned++; }
                    }
                });
            }
        }

        var out = 'Aligned ' + aligned + ' token(s).';
        if (ignored.length > 0 && linked && !unlinked) {
            out += '<br>' + ignored.length + ' token(s) ignored (not linked).';
        }
        reply(msg, 'Align', out);
    };

    const doStatus = (msg) => {
        var ids = getSelectedIds(msg);
        if (ids.length === 0) { reply(msg, 'Error', 'Select token(s).'); return; }
        var out = '';
        ids.forEach(function(id) {
            var obj = getObj('graphic', id);
            var name = obj ? (obj.get('name') || '(unnamed)') : '?';
            var links = findLinksForToken(id);
            out += '<b>' + name + '</b> (' + id + '): ';
            if (links.length === 0) { out += 'no mirror links<br>'; return; }
            links.forEach(function(entry) {
                var role = entry.link.mode === 'chain' ? 'chain' : (entry.link.ids[0] === id ? 'source' : 'target');
                out += role + ' (' + entry.link.props.length + ' props, ' + entry.link.ids.length + ' tokens' + (entry.link.soft ? ', soft' : '') + ')<br>';
            });
        });
        reply(msg, out);
    };

    const HELP_TEXT = '<b>' + SCRIPT_NAME + ' v' + SCRIPT_VERSION + '</b><br><br>'
        + '<code>' + CMD + ' link [--soft] [props] [ids...]</code> -- Unidirectional (hard-lock by default)<br>'
        + '<code>' + CMD + ' unlink [props] [ids...]</code> -- Remove link<br>'
        + '<code>' + CMD + ' chain [props] [ids...]</code> -- Bidirectional ring<br>'
        + '<code>' + CMD + ' unchain [props] [ids...]</code> -- Remove chain<br>'
        + '<code>' + CMD + ' align [--linked|--unlinked] [props] [ids...]</code> -- Align tokens<br>'
        + '<code>' + CMD + ' config [exclude|include|reset] [props]</code> -- Global excludes<br>'
        + '<code>' + CMD + ' status</code> -- Show links for selected<br>'
        + '<code>' + CMD + ' --help</code> -- This help<br>'
        + '<br><b>Groups:</b> all, spatial, position, size, bars, light, auras, flip<br>'
        + '<br><b>Props:</b> ' + ALL_PROPS.join(', ');

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
            case 'link':    doLink(msg, args);    break;
            case 'unlink':  doUnlink(msg, args);  break;
            case 'chain':   doChain(msg, args);   break;
            case 'unchain': doUnchain(msg, args); break;
            case 'align':   doAlign(msg, args);   break;
            case 'config':  doConfig(msg, args);  break;
            case 'status':  doStatus(msg);        break;
            case '--help':  reply(msg, HELP_TEXT); break;
            default:        reply(msg, HELP_TEXT); break;
        }
    };

    // =========================================================================
    // Public API
    // =========================================================================

    const link = (ids, props, soft) => {
        if (!ids || ids.length < 2) { log(SCRIPT_NAME + ': link requires at least 2 IDs.'); return null; }
        return createLink('link', props || 'api-all', ids, !!soft);
    };

    const chainLink = (ids, props) => {
        if (!ids || ids.length < 2) { log(SCRIPT_NAME + ': chainLink requires at least 2 IDs.'); return null; }
        return createLink('chain', props || 'api-all', ids, true);
    };

    const unlink = (ids, props) => {
        var s = state[SCRIPT_NAME];
        var propsToRemove = (props && props.length > 0) ? props : null;
        ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                removePropsFromLink(entry.id, propsToRemove);
            });
        });
    };

    // =========================================================================
    // Initialization
    // =========================================================================

    const checkInstall = () => {
        ensureState();
        log('-=> ' + SCRIPT_NAME + ' v' + SCRIPT_VERSION + ' Initialized <=-');
        checkConfigDrift();
    };

    const checkConfigDrift = () => {
        if (!hasGlobalConfig()) return;
        var gc = globalconfig[SCRIPT_NAME];
        var gcExcludes = (gc['Global Excludes'] || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
        var stateExcludes = state[SCRIPT_NAME].globalExcludes || [];

        // Compare
        var gcSorted = gcExcludes.slice().sort().join(',');
        var stateSorted = stateExcludes.slice().sort().join(',');
        if (gcSorted !== stateSorted) {
            sendChat(SCRIPT_NAME, '/w gm ⚠️ Mirror config drift: runtime global excludes (' +
                (stateExcludes.length > 0 ? stateExcludes.join(', ') : 'none') +
                ') differ from API Scripts page settings (' +
                (gcExcludes.length > 0 ? gcExcludes.join(', ') : 'none') +
                '). Use <code>!mirror config</code> to view/change, or update the API Scripts page to match.');
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic', onGraphicChanged);
    };

    return {
        checkInstall,
        registerEventHandlers,
        link: link,
        chainLink: chainLink,
        unlink: unlink,
        ALL_PROPS: ALL_PROPS,
        PROP_GROUPS: PROP_GROUPS
    };
})();

on('ready', () => {
    'use strict';
    Mirror.checkInstall();
    Mirror.registerEventHandlers();
});
