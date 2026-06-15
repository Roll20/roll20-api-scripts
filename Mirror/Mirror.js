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
        flip: ['flipv', 'fliph'],
        all: ALL_PROPS.slice()
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
                // linkId → { props: [...], ids: [...], mode: 'link'|'chain', soft: bool }
                links: {},
                // Set of token IDs that are part of any chain (for fast lookup)
                chainedIds: {}
            };
        }
        if (!state[SCRIPT_NAME].chainedIds) state[SCRIPT_NAME].chainedIds = {};
    };

    // =========================================================================
    // Property Resolution
    // =========================================================================

    const resolveProps = (args) => {
        var props = [];
        var remaining = [];
        args.forEach(function(arg) {
            if (PROP_GROUPS[arg]) {
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
        var resolved = resolveProps(args);
        var ids = resolved.remaining.filter(function(a) { return a.startsWith('-'); });
        ids = ids.concat(getSelectedIds(msg));
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; }); // dedupe
        var props = resolved.props.length > 0 ? resolved.props : ALL_PROPS.slice();
        return { props: props, ids: ids, soft: soft, align: align };
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

    const createLink = (mode, props, ids, soft) => {
        var s = state[SCRIPT_NAME];
        var linkId = genId();
        s.links[linkId] = { props: props, ids: ids, mode: mode, soft: soft };
        if (mode === 'chain') {
            ids.forEach(function(id) { s.chainedIds[id] = true; });
        }
        return linkId;
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

        // Find changed properties
        var changed = [];
        ALL_PROPS.forEach(function(prop) {
            if (prev[prop] !== undefined && prev[prop] !== obj.get(prop)) {
                changed.push(prop);
            }
        });
        if (changed.length === 0) return;

        Object.values(s.links).forEach(function(link) {
            var idx = link.ids.indexOf(tokenId);
            if (idx === -1) return;

            // Determine relevant changed props for this link
            var relevantProps = changed.filter(function(p) { return link.props.indexOf(p) !== -1; });
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
        createLink('link', parsed.props, parsed.ids, parsed.soft);
        if (parsed.align) alignTokens(parsed.ids, parsed.props);
        reply(msg, 'Link', 'Linked ' + parsed.ids.length + ' tokens (' + parsed.props.length + ' props' + (parsed.soft ? ', soft' : ', hard-lock') + (parsed.align ? ', aligned' : '') + '). Source: first selected.');
    };

    const doUnlink = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }
        var propsToRemove = parsed.props.length > 0 && parsed.props.length < ALL_PROPS.length ? parsed.props : null;
        var removed = 0;
        parsed.ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode === 'link') { removePropsFromLink(entry.id, propsToRemove); removed++; }
            });
        });
        reply(msg, 'Unlink', 'Processed ' + removed + ' link(s).');
    };

    const doChain = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length < 2) { reply(msg, 'Error', 'Chain requires at least 2 tokens.'); return; }
        createLink('chain', parsed.props, parsed.ids, true);
        if (parsed.align) alignTokens(parsed.ids, parsed.props);
        reply(msg, 'Chain', 'Chain-linked ' + parsed.ids.length + ' tokens (' + parsed.props.length + ' props' + (parsed.align ? ', aligned' : '') + ').');
    };

    const doUnchain = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }
        var propsToRemove = parsed.props.length > 0 && parsed.props.length < ALL_PROPS.length ? parsed.props : null;
        var removed = 0;
        parsed.ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode === 'chain') { removePropsFromLink(entry.id, propsToRemove); removed++; }
            });
        });
        reply(msg, 'Unchain', 'Processed ' + removed + ' chain(s).');
    };

    const doAlign = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length < 2) { reply(msg, 'Error', 'Align requires at least 2 tokens.'); return; }
        alignTokens(parsed.ids, parsed.props);
        reply(msg, 'Align', 'Aligned ' + (parsed.ids.length - 1) + ' token(s) to source (' + parsed.props.length + ' props).');
    };

    const doStatus = (msg) => {
        var ids = getSelectedIds(msg);
        if (ids.length === 0) { reply(msg, 'Error', 'Select token(s).'); return; }
        var out = '';
        ids.forEach(function(id) {
            var obj = getObj('graphic', id);
            var name = obj ? (obj.get('name') || id) : id;
            var links = findLinksForToken(id);
            out += '<b>' + name + '</b>: ';
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
        + '<code>' + CMD + ' align [props] [ids...]</code> -- Copy props from first to others (one-shot)<br>'
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
        return createLink('link', props || ALL_PROPS.slice(), ids, !!soft);
    };

    const chainLink = (ids, props) => {
        if (!ids || ids.length < 2) { log(SCRIPT_NAME + ': chainLink requires at least 2 IDs.'); return null; }
        return createLink('chain', props || ALL_PROPS.slice(), ids, true);
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
