// =============================================================================
// Mirror v1.0.0
// Last Updated: 2026-06-15
// Author: Kenan Millet
//
// Description:
//   Flat property syncing between tokens. No transforms, no offsets -- when a
//   property changes on one token, the same value is copied to linked tokens.
//   Supports unidirectional (link) and bidirectional ring (chain) modes.
//
// Dependencies: none
//
// Commands:
//   !mirror link [props] [ids...]      Link selected/listed tokens (unidirectional)
//   !mirror unlink [props] [ids...]    Remove link (or specific properties)
//   !mirror chain [props] [ids...]     Bidirectional ring link
//   !mirror unchain [props] [ids...]   Remove chain (or specific properties)
//   !mirror status                     Show mirror state for selected tokens
//   !mirror --help                     Command reference
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
                // linkId → { props: [...], ids: [...], mode: 'link'|'chain' }
                links: {}
            };
        }
    };

    // =========================================================================
    // Link Management
    // =========================================================================

    const getSelectedIds = (msg) => {
        return (msg.selected || []).map(function(s) { return s._id; }).filter(Boolean);
    };

    const parseArgs = (args) => {
        var props = [];
        var ids = [];
        args.forEach(function(arg) {
            if (ALL_PROPS.indexOf(arg) !== -1) props.push(arg);
            else if (arg.startsWith('-')) ids.push(arg); // Roll20 IDs start with -
        });
        return { props: props, ids: ids };
    };

    const createLink = (mode, props, ids) => {
        var s = state[SCRIPT_NAME];
        var linkId = genId();
        s.links[linkId] = { props: props, ids: ids, mode: mode };
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
            delete s.links[linkId];
        } else {
            link.props = link.props.filter(function(p) { return propsToRemove.indexOf(p) === -1; });
            if (link.props.length === 0) delete s.links[linkId];
        }
    };

    // =========================================================================
    // Sync Engine
    // =========================================================================

    var syncing = false;

    const onGraphicChanged = (obj) => {
        if (syncing) return;
        var s = state[SCRIPT_NAME];
        var tokenId = obj.get('id');

        // Find all links this token participates in
        Object.values(s.links).forEach(function(link) {
            var idx = link.ids.indexOf(tokenId);
            if (idx === -1) return;

            // Determine which tokens to update
            var targets;
            if (link.mode === 'chain') {
                // Bidirectional: update all others in the link
                targets = link.ids.filter(function(id) { return id !== tokenId; });
            } else {
                // Unidirectional: only propagate if this is the source (first id)
                if (idx !== 0) return;
                targets = link.ids.slice(1);
            }

            // Build updates from changed properties that are in this link's prop list
            var updates = {};
            link.props.forEach(function(prop) {
                updates[prop] = obj.get(prop);
            });

            syncing = true;
            targets.forEach(function(targetId) {
                var target = getObj('graphic', targetId);
                if (target) target.set(updates);
            });
            syncing = false;
        });
    };

    // =========================================================================
    // Commands
    // =========================================================================

    const doLink = (msg, args) => {
        var parsed = parseArgs(args);
        var ids = parsed.ids.concat(getSelectedIds(msg));
        // Deduplicate
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; });

        if (ids.length < 2) { reply(msg, 'Error', 'Link requires at least 2 tokens.'); return; }
        var props = parsed.props.length > 0 ? parsed.props : ALL_PROPS.slice();
        var linkId = createLink('link', props, ids);
        reply(msg, 'Link', 'Linked ' + ids.length + ' tokens (' + props.length + ' properties). Source: first selected/listed.');
    };

    const doUnlink = (msg, args) => {
        var parsed = parseArgs(args);
        var ids = parsed.ids.concat(getSelectedIds(msg));
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; });

        if (ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }

        var removed = 0;
        ids.forEach(function(id) {
            var links = findLinksForToken(id);
            links.forEach(function(entry) {
                if (entry.link.mode === 'link') {
                    removePropsFromLink(entry.id, parsed.props.length > 0 ? parsed.props : null);
                    removed++;
                }
            });
        });
        reply(msg, 'Unlink', 'Removed ' + removed + ' link(s).');
    };

    const doChain = (msg, args) => {
        var parsed = parseArgs(args);
        var ids = parsed.ids.concat(getSelectedIds(msg));
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; });

        if (ids.length < 2) { reply(msg, 'Error', 'Chain requires at least 2 tokens.'); return; }
        var props = parsed.props.length > 0 ? parsed.props : ALL_PROPS.slice();
        var linkId = createLink('chain', props, ids);
        reply(msg, 'Chain', 'Chain-linked ' + ids.length + ' tokens (' + props.length + ' properties).');
    };

    const doUnchain = (msg, args) => {
        var parsed = parseArgs(args);
        var ids = parsed.ids.concat(getSelectedIds(msg));
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; });

        if (ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }

        var removed = 0;
        ids.forEach(function(id) {
            var links = findLinksForToken(id);
            links.forEach(function(entry) {
                if (entry.link.mode === 'chain') {
                    removePropsFromLink(entry.id, parsed.props.length > 0 ? parsed.props : null);
                    removed++;
                }
            });
        });
        reply(msg, 'Unchain', 'Removed ' + removed + ' chain(s).');
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
                out += entry.link.mode + ' (' + entry.link.props.length + ' props, ' + entry.link.ids.length + ' tokens)<br>';
            });
        });
        reply(msg, out);
    };

    const HELP_TEXT = '<b>' + SCRIPT_NAME + ' v' + SCRIPT_VERSION + '</b><br><br>'
        + '<code>' + CMD + ' link [props] [ids...]</code> -- Unidirectional link<br>'
        + '<code>' + CMD + ' unlink [props] [ids...]</code> -- Remove link<br>'
        + '<code>' + CMD + ' chain [props] [ids...]</code> -- Bidirectional ring<br>'
        + '<code>' + CMD + ' unchain [props] [ids...]</code> -- Remove chain<br>'
        + '<code>' + CMD + ' status</code> -- Show links for selected<br>'
        + '<code>' + CMD + ' --help</code> -- This help<br>'
        + '<br>Properties: ' + ALL_PROPS.join(', ');

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
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        // Listen to all property changes we care about
        on('change:graphic:left', onGraphicChanged);
        on('change:graphic:top', onGraphicChanged);
        on('change:graphic:rotation', onGraphicChanged);
        on('change:graphic:width', onGraphicChanged);
        on('change:graphic:height', onGraphicChanged);
        on('change:graphic:layer', onGraphicChanged);
        on('change:graphic:flipv', onGraphicChanged);
        on('change:graphic:fliph', onGraphicChanged);
        on('change:graphic:bar1_value', onGraphicChanged);
        on('change:graphic:bar1_max', onGraphicChanged);
        on('change:graphic:bar2_value', onGraphicChanged);
        on('change:graphic:bar2_max', onGraphicChanged);
        on('change:graphic:bar3_value', onGraphicChanged);
        on('change:graphic:bar3_max', onGraphicChanged);
        on('change:graphic:statusmarkers', onGraphicChanged);
        on('change:graphic:name', onGraphicChanged);
        on('change:graphic:tint_color', onGraphicChanged);
        on('change:graphic:light_radius', onGraphicChanged);
        on('change:graphic:light_dimradius', onGraphicChanged);
        on('change:graphic:currentSide', onGraphicChanged);
    };

    return { checkInstall, registerEventHandlers };
})();

on('ready', () => {
    'use strict';
    Mirror.checkInstall();
    Mirror.registerEventHandlers();
});
