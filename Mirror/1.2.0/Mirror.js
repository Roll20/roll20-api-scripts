// =============================================================================
// Mirror v1.2.0
// Last Updated: 2026-07-17
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
    const SCRIPT_VERSION = '1.2.0';
    const CMD            = '!mirror';

    // All syncable graphic properties
    const ALL_PROPS = [
        // Spatial
        'left', 'top', 'width', 'height', 'rotation',
        'flipv', 'fliph', 'layer',
        // Bars
        'bar1_value', 'bar1_max', 'bar1_link',
        'bar2_value', 'bar2_max', 'bar2_link',
        'bar3_value', 'bar3_max', 'bar3_link',
        'bar4_value', 'bar4_max', 'bar4_link',
        'bar_location', 'compact_bar',
        // Bar visibility
        'showplayers_bar1', 'showplayers_bar2', 'showplayers_bar3', 'showplayers_bar4',
        'playersedit_bar1', 'playersedit_bar2', 'playersedit_bar3', 'playersedit_bar4',
        'bar1_num_permission', 'bar2_num_permission', 'bar3_num_permission', 'bar4_num_permission',
        // Name
        'name', 'showname', 'showplayers_name', 'playersedit_name',
        // Auras
        'aura1_radius', 'aura1_color', 'aura1_square', 'aura1_options',
        'aura2_radius', 'aura2_color', 'aura2_square', 'aura2_options',
        'showplayers_aura1', 'showplayers_aura2',
        'playersedit_aura1', 'playersedit_aura2',
        // Appearance
        'tint_color', 'statusmarkers', 'baseOpacity',
        'isdrawing', 'currentSide', 'sides',
        // Tooltip
        'tooltip', 'show_tooltip', 'gm_only_tooltip',
        // UDL Light (emission)
        'emits_bright_light', 'bright_light_distance',
        'emits_low_light', 'low_light_distance', 'dim_light_opacity',
        'has_directional_bright_light', 'directional_bright_light_center', 'directional_bright_light_total',
        'has_directional_dim_light', 'directional_dim_light_center', 'directional_dim_light_total',
        'lightColor',
        // UDL Vision (sight)
        'has_bright_light_vision', 'has_night_vision', 'night_vision_distance',
        'night_vision_effect', 'night_vision_tint', 'light_sensitivity_multiplier',
        'has_limit_field_of_vision', 'limit_field_of_vision_center', 'limit_field_of_vision_total',
        'has_limit_field_of_night_vision', 'limit_field_of_night_vision_center', 'limit_field_of_night_vision_total',
        // Legacy Dynamic Lighting
        'light_radius', 'light_dimradius', 'light_angle', 'light_otherplayers',
        'light_hassight', 'light_losangle', 'light_multiplier',
        'adv_fow_view_distance',
        // Movement / interaction
        'lockMovement', 'disableSnapping', 'disableTokenMenu',
        // Foreground layer
        'fadeOnOverlap', 'fadeOpacity', 'renderAsScenery', 'renderAsDarkness',
        // Reactions
        'interactionTriggered', 'interactionManualReset'
    ];

    // Property groups
    const PROP_GROUPS = {
        position: ['left', 'top'],
        size: ['width', 'height'],
        spatial: ['left', 'top', 'rotation', 'width', 'height'],
        bars: ['bar1_value', 'bar1_max', 'bar1_link',
               'bar2_value', 'bar2_max', 'bar2_link',
               'bar3_value', 'bar3_max', 'bar3_link',
               'bar4_value', 'bar4_max', 'bar4_link',
               'bar_location', 'compact_bar',
               'showplayers_bar1', 'showplayers_bar2', 'showplayers_bar3', 'showplayers_bar4',
               'playersedit_bar1', 'playersedit_bar2', 'playersedit_bar3', 'playersedit_bar4',
               'bar1_num_permission', 'bar2_num_permission', 'bar3_num_permission', 'bar4_num_permission'],
        name: ['name', 'showname', 'showplayers_name', 'playersedit_name'],
        auras: ['aura1_radius', 'aura1_color', 'aura1_square', 'aura1_options',
                'aura2_radius', 'aura2_color', 'aura2_square', 'aura2_options',
                'showplayers_aura1', 'showplayers_aura2',
                'playersedit_aura1', 'playersedit_aura2'],
        light: ['emits_bright_light', 'bright_light_distance',
                'emits_low_light', 'low_light_distance', 'dim_light_opacity',
                'has_directional_bright_light', 'directional_bright_light_center', 'directional_bright_light_total',
                'has_directional_dim_light', 'directional_dim_light_center', 'directional_dim_light_total',
                'lightColor',
                'light_radius', 'light_dimradius', 'light_angle', 'light_otherplayers',
                'light_losangle', 'light_multiplier', 'adv_fow_view_distance'],
        sight: ['has_bright_light_vision', 'has_night_vision', 'night_vision_distance',
                'night_vision_effect', 'night_vision_tint', 'light_sensitivity_multiplier',
                'light_hassight',
                'has_limit_field_of_vision', 'limit_field_of_vision_center', 'limit_field_of_vision_total',
                'has_limit_field_of_night_vision', 'limit_field_of_night_vision_center', 'limit_field_of_night_vision_total'],
        flip: ['flipv', 'fliph'],
        anchor: ['left', 'top', 'width', 'height', 'rotation', 'flipv', 'fliph', 'layer'],
        tooltip: ['tooltip', 'show_tooltip', 'gm_only_tooltip'],
        reactions: ['interactionTriggered', 'interactionManualReset', 'fadeOnOverlap', 'fadeOpacity']
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
        var ignoreSelected = args.indexOf('--ignore-selected') !== -1;
        args = args.filter(function(a) { return a !== '--soft' && a !== '--align' && a !== '--ignore-selected'; });

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
        if (!ignoreSelected) ids = ids.concat(getSelectedIds(msg));
        ids = ids.filter(function(id, i) { return ids.indexOf(id) === i; }); // dedupe

        // Determine if using 'all' or specific props
        // null means "no props specified" (let the caller decide context-dependent behavior)
        var props;
        if (resolved.props.length === 0) {
            props = null; // no props specified
        } else if (resolved.props.length === getKnownProps().length) {
            props = 'all'; // explicit 'all' group
        } else {
            // Explicit prop list: apply --exclude as immediate filter
            props = excludes.length > 0
                ? resolved.props.filter(function(p) { return excludes.indexOf(p) === -1; })
                : resolved.props;
            excludes = []; // already applied, don't store
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

        // Guard: children in a hard link can't have multiple hard parents or join chains
        if (mode === 'link' && !soft) {
            // Check that child IDs (ids[1:]) don't already have a hard parent
            for (var i = 1; i < ids.length; i++) {
                var existing = findLinksForToken(ids[i]);
                var hasHardParent = existing.some(function(e) {
                    return e.link.mode === 'link' && !e.link.soft && e.link.ids[0] !== ids[i];
                });
                if (hasHardParent) {
                    log(SCRIPT_NAME + ': Cannot hard-link ' + ids[i] + ' — already has a hard parent.');
                    return null;
                }
                if (s.chainedIds[ids[i]]) {
                    log(SCRIPT_NAME + ': Cannot hard-link ' + ids[i] + ' — token is in a chain.');
                    return null;
                }
            }
        }

        if (mode === 'chain') {
            // Check that none of the IDs have a hard parent link as a child
            for (var i = 0; i < ids.length; i++) {
                var existing = findLinksForToken(ids[i]);
                var hasHardParent = existing.some(function(e) {
                    return e.link.mode === 'link' && !e.link.soft && e.link.ids[0] !== ids[i];
                });
                if (hasHardParent) {
                    log(SCRIPT_NAME + ': Cannot chain ' + ids[i] + ' — has a hard parent link.');
                    return null;
                }
            }
            ids.forEach(function(id) { s.chainedIds[id] = true; });
        }

        var linkId = genId();
        s.links[linkId] = { props: props, ids: ids, mode: mode, soft: soft, excludes: excludes || [] };
        updatePlacementLocks(linkId);
        return linkId;
    };

    /**
     * Set/clear lockMovement for children in a link based on whether left+top are hard-linked.
     */
    const updatePlacementLocks = (linkId) => {
        var s = state[SCRIPT_NAME];
        var link = s.links[linkId];
        if (!link) return;
        if (!s.placementLockedByMirror) s.placementLockedByMirror = {};

        var effectiveProps = getEffectiveProps(link);
        var hasLeftTop = effectiveProps.indexOf('left') !== -1 && effectiveProps.indexOf('top') !== -1;
        var shouldLock = hasLeftTop && !link.soft;

        // Children are ids[1:] for links, all ids for chains
        var children = link.mode === 'chain' ? link.ids : link.ids.slice(1);
        children.forEach(function(id) {
            var obj = getObj('graphic', id);
            if (!obj) return;
            if (shouldLock && !obj.get('lockMovement')) {
                obj.set('lockMovement', true);
                s.placementLockedByMirror[id] = true;
            } else if (!shouldLock && s.placementLockedByMirror[id]) {
                obj.set('lockMovement', false);
                delete s.placementLockedByMirror[id];
            }
        });
    };

    /**
     * Clear lockMovement for a token if we set it.
     */
    const clearPlacementLock = (tokenId) => {
        var s = state[SCRIPT_NAME];
        if (!s.placementLockedByMirror || !s.placementLockedByMirror[tokenId]) return;
        var obj = getObj('graphic', tokenId);
        if (obj) obj.set('lockMovement', false);
        delete s.placementLockedByMirror[tokenId];
    };

    /**
     * Re-evaluate lockMovement for a token across all its links.
     */
    const updatePlacementLocksForToken = (tokenId) => {
        var links = findLinksForToken(tokenId);
        var shouldLock = links.some(function(entry) {
            var link = entry.link;
            if (link.soft) return false;
            var effectiveProps = getEffectiveProps(link);
            if (effectiveProps.indexOf('left') === -1 || effectiveProps.indexOf('top') === -1) return false;
            // Only lock children, not the parent
            if (link.mode === 'link' && link.ids[0] === tokenId) return false;
            return true;
        });
        var s = state[SCRIPT_NAME];
        if (!s.placementLockedByMirror) s.placementLockedByMirror = {};
        var obj = getObj('graphic', tokenId);
        if (!obj) return;
        if (shouldLock && !obj.get('lockMovement')) {
            obj.set('lockMovement', true);
            s.placementLockedByMirror[tokenId] = true;
        } else if (!shouldLock && s.placementLockedByMirror[tokenId]) {
            obj.set('lockMovement', false);
            delete s.placementLockedByMirror[tokenId];
        }
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
            // Remove entire link — clear locks for children
            var children = link.mode === 'chain' ? link.ids : link.ids.slice(1);
            children.forEach(function(id) { clearPlacementLock(id); });
            if (link.mode === 'chain') {
                link.ids.forEach(function(id) { rebuildChainedIds(id, linkId); });
            }
            delete s.links[linkId];
        } else {
            link.props = link.props.filter(function(p) { return propsToRemove.indexOf(p) === -1; });
            if (link.props.length === 0) {
                var children = link.mode === 'chain' ? link.ids : link.ids.slice(1);
                children.forEach(function(id) { clearPlacementLock(id); });
                if (link.mode === 'chain') {
                    link.ids.forEach(function(id) { rebuildChainedIds(id, linkId); });
                }
                delete s.links[linkId];
            } else {
                updatePlacementLocks(linkId);
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

    /**
     * Recursively propagate updates to targets and their children.
     * visited prevents infinite loops in circular link structures.
     */
    const propagateUpdates = (tokenId, updates, visited) => {
        var s = state[SCRIPT_NAME];
        Object.values(s.links).forEach(function(link) {
            var idx = link.ids.indexOf(tokenId);
            if (idx === -1) return;

            var effectiveProps = getEffectiveProps(link);
            var relevantUpdates = {};
            Object.keys(updates).forEach(function(p) {
                if (effectiveProps.indexOf(p) !== -1) relevantUpdates[p] = updates[p];
            });
            if (Object.keys(relevantUpdates).length === 0) return;

            if (link.mode === 'chain') {
                link.ids.forEach(function(id) {
                    if (id === tokenId || visited.has(id)) return;
                    visited.add(id);
                    var target = getObj('graphic', id);
                    if (target) {
                        target.set(relevantUpdates);
                        propagateUpdates(id, relevantUpdates, visited);
                    }
                });
            } else if (idx === 0) {
                // Source: propagate down to children
                link.ids.slice(1).forEach(function(id) {
                    if (visited.has(id)) return;
                    visited.add(id);
                    var target = getObj('graphic', id);
                    if (target) {
                        target.set(relevantUpdates);
                        propagateUpdates(id, relevantUpdates, visited);
                    }
                });
            }
        });
    };

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

        syncing = true;
        var visited = new Set([tokenId]);

        Object.values(s.links).forEach(function(link) {
            var idx = link.ids.indexOf(tokenId);
            if (idx === -1) return;

            var effectiveProps = getEffectiveProps(link);
            var relevantProps = changed.filter(function(p) { return effectiveProps.indexOf(p) !== -1; });
            if (relevantProps.length === 0) return;

            var updates = {};
            relevantProps.forEach(function(p) { updates[p] = obj.get(p); });

            if (link.mode === 'chain') {
                link.ids.forEach(function(id) {
                    if (visited.has(id)) return;
                    visited.add(id);
                    var target = getObj('graphic', id);
                    if (target) {
                        target.set(updates);
                        propagateUpdates(id, updates, visited);
                    }
                });
            } else if (idx === 0) {
                // Source: propagate to children recursively
                link.ids.slice(1).forEach(function(id) {
                    if (visited.has(id)) return;
                    visited.add(id);
                    var target = getObj('graphic', id);
                    if (target) {
                        target.set(updates);
                        propagateUpdates(id, updates, visited);
                    }
                });
            } else if (!link.soft) {
                // Hard lock: revert child to source value
                var source = getObj('graphic', link.ids[0]);
                if (source) {
                    var revert = {};
                    relevantProps.forEach(function(p) { revert[p] = source.get(p); });
                    obj.set(revert);
                }
            }
        });

        syncing = false;
    };

    // =========================================================================
    // Commands
    // =========================================================================

    const doLink = (msg, args) => {
        var up = args.indexOf('--up') !== -1;
        var down = args.indexOf('--down') !== -1;
        args = args.filter(function(a) { return a !== '--up' && a !== '--down'; });
        var parsed = parseCommand(msg, args);
        var linkProps = parsed.props || 'all';

        // Check if token already has an existing link
        var existingLink = null;
        if (parsed.ids.length >= 1) {
            var links = findLinksForToken(parsed.ids[0]);
            var asParent = links.filter(function(e) { return e.link.mode === 'link' && e.link.ids[0] === parsed.ids[0]; });
            var asChild = links.filter(function(e) { return e.link.mode === 'link' && e.link.ids[0] !== parsed.ids[0]; });

            if (parsed.ids.length === 1) {
                if (asParent.length > 0 && asChild.length > 0 && !up && !down) {
                    reply(msg, 'Error', 'Token is both parent and child. Use --up (modify parent link) or --down (modify child link).');
                    return;
                }
                if (up && asChild.length > 0) existingLink = asChild[0];
                else if (down && asParent.length > 0) existingLink = asParent[0];
                else if (asParent.length > 0) existingLink = asParent[0];
                else if (asChild.length > 0) existingLink = asChild[0];
            } else {
                // Multi-token: check if source has existing link as parent
                if (asParent.length > 0) existingLink = asParent[0];
            }
        }

        if (parsed.ids.length < 2 && !existingLink) {
            reply(msg, 'Error', 'Link requires at least 2 tokens (or 1 token already in a link).');
            return;
        }

        if (existingLink && Array.isArray(linkProps)) {
            var link = existingLink.link;
            if (link.props === 'all' || link.props === 'api-all') {
                link.excludes = (link.excludes || []).filter(function(p) {
                    return linkProps.indexOf(p) === -1;
                });
                reply(msg, 'Link', 'Re-included ' + linkProps.length + ' prop(s) in existing link.');
            } else {
                linkProps.forEach(function(p) {
                    if (link.props.indexOf(p) === -1) link.props.push(p);
                });
                reply(msg, 'Link', 'Added ' + linkProps.length + ' prop(s) to existing link (' + link.props.length + ' total).');
            }
        } else {
            var result = createLink('link', linkProps, parsed.ids, parsed.soft, parsed.excludes);
            if (!result) { reply(msg, 'Error', 'Cannot create link — a child token already has a hard parent or is in a chain.'); return; }
            if (parsed.align) {
                var alignProps = linkProps === 'all' ? getKnownProps().filter(function(p) { return parsed.excludes.indexOf(p) === -1; }) : linkProps;
                alignTokens(parsed.ids, alignProps);
            }
            var propCount = linkProps === 'all' ? 'all' : linkProps.length;
            reply(msg, 'Link', 'Linked ' + parsed.ids.length + ' tokens (' + propCount + ' props' + (parsed.soft ? ', soft' : ', hard-lock') + (parsed.excludes.length ? ', ' + parsed.excludes.length + ' excluded' : '') + (parsed.align ? ', aligned' : '') + ').');
        }
        parsed.ids.forEach(function(id) { updatePlacementLocksForToken(id); });
    };

    const doUnlink = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }
        var hasSpecificProps = parsed.props !== null && parsed.props !== 'all';
        var processed = 0;
        var errors = [];
        parsed.ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode === 'chain') {
                    if (hasSpecificProps) {
                        errors.push((getObj('graphic', id) || {get:function(){return id;}}).get('name') || id);
                        return;
                    }
                    // Remove this token from the chain
                    var link = entry.link;
                    link.ids = link.ids.filter(function(tid) { return tid !== id; });
                    // Rebuild chainedIds for removed token
                    rebuildChainedIds(id, entry.id);
                    // If chain has fewer than 2 members, destroy it
                    if (link.ids.length < 2) {
                        link.ids.forEach(function(tid) { rebuildChainedIds(tid, entry.id); });
                        delete state[SCRIPT_NAME].links[entry.id];
                    }
                    processed++;
                } else {
                    // Non-chain: existing behavior
                    if (!hasSpecificProps) {
                        removePropsFromLink(entry.id, null);
                    } else if (entry.link.props === 'all' || entry.link.props === 'api-all') {
                        parsed.props.forEach(function(p) {
                            if (entry.link.excludes.indexOf(p) === -1) entry.link.excludes.push(p);
                        });
                    } else {
                        removePropsFromLink(entry.id, parsed.props);
                    }
                    processed++;
                }
            });
        });
        var out = 'Processed ' + processed + ' link(s).';
        if (errors.length > 0) out += '<br>Cannot unlink specific props from chain members: ' + errors.join(', ') + '. Use <code>!mirror unchain [props]</code> instead.';
        reply(msg, 'Unlink', out);
        parsed.ids.forEach(function(id) { updatePlacementLocksForToken(id); });
    };

    const doChain = (msg, args) => {
        var parsed = parseCommand(msg, args);
        var linkProps = parsed.props; // null = no props specified, 'all' = explicit all, [...] = specific

        if (parsed.ids.length < 1) { reply(msg, 'Error', 'Select or specify at least one token.'); return; }

        // Find which selected tokens are already in chains
        var chainMap = {}; // linkId → entry
        var unchainedIds = [];
        parsed.ids.forEach(function(id) {
            var links = findLinksForToken(id);
            var inChain = links.find(function(e) { return e.link.mode === 'chain'; });
            if (inChain) chainMap[inChain.id] = inChain;
            else unchainedIds.push(id);
        });
        var existingChains = Object.values(chainMap);

        if (linkProps === null) {
            // No props specified: add unchained tokens to chain, or create new chain
            if (existingChains.length > 1) {
                reply(msg, 'Error', 'Selected tokens belong to multiple chains. Cannot merge.');
                return;
            }
            if (existingChains.length === 1) {
                // Add unchained tokens to the existing chain
                if (unchainedIds.length === 0) {
                    reply(msg, 'Error', 'No unchained tokens to add. Use <code>!mirror chain all</code> to set all props, or specify props to add.');
                    return;
                }
                var chain = existingChains[0].link;
                unchainedIds.forEach(function(id) {
                    if (chain.ids.indexOf(id) === -1) {
                        chain.ids.push(id);
                        state[SCRIPT_NAME].chainedIds[id] = true;
                    }
                });
                reply(msg, 'Chain', 'Added ' + unchainedIds.length + ' token(s) to existing chain (' + chain.ids.length + ' total).');
            } else {
                // No existing chains: create new chain with 'all'
                if (parsed.ids.length < 2) { reply(msg, 'Error', 'Chain requires at least 2 tokens.'); return; }
                var result = createLink('chain', 'all', parsed.ids, true, parsed.excludes);
                if (!result) { reply(msg, 'Error', 'Cannot create chain — a token has a hard parent link.'); return; }
                if (parsed.align) alignTokens(parsed.ids, getKnownProps().filter(function(p) { return parsed.excludes.indexOf(p) === -1; }));
                reply(msg, 'Chain', 'Chain-linked ' + parsed.ids.length + ' tokens (all props' + (parsed.align ? ', aligned' : '') + ').');
            }
        } else {
            // Props specified: modify existing chains or create new one
            if (existingChains.length > 0) {
                existingChains.forEach(function(entry) {
                    var link = entry.link;
                    var propsToApply = linkProps === 'all' ? null : linkProps;
                    if (propsToApply && (link.props === 'all' || link.props === 'api-all')) {
                        link.excludes = (link.excludes || []).filter(function(p) { return propsToApply.indexOf(p) === -1; });
                    } else if (propsToApply && Array.isArray(link.props)) {
                        propsToApply.forEach(function(p) { if (link.props.indexOf(p) === -1) link.props.push(p); });
                    }
                });
                var propCount = linkProps === 'all' ? 'all' : linkProps.length;
                var msg2 = 'Updated ' + existingChains.length + ' chain(s) (' + propCount + ' props).';
                if (unchainedIds.length > 0) msg2 += '<br>' + unchainedIds.length + ' unchained token(s) ignored (use no props to add them).';
                reply(msg, 'Chain', msg2);
            } else {
                // No existing chains: create new
                if (parsed.ids.length < 2) { reply(msg, 'Error', 'Chain requires at least 2 tokens.'); return; }
                var result = createLink('chain', linkProps, parsed.ids, true, parsed.excludes);
                if (!result) { reply(msg, 'Error', 'Cannot create chain — a token has a hard parent link.'); return; }
                if (parsed.align) {
                    var alignProps = linkProps === 'all' ? getKnownProps().filter(function(p) { return parsed.excludes.indexOf(p) === -1; }) : linkProps;
                    alignTokens(parsed.ids, alignProps);
                }
                var propCount = linkProps === 'all' ? 'all' : linkProps.length;
                reply(msg, 'Chain', 'Chain-linked ' + parsed.ids.length + ' tokens (' + propCount + ' props' + (parsed.excludes.length ? ', ' + parsed.excludes.length + ' excluded' : '') + (parsed.align ? ', aligned' : '') + ').');
            }
        }
    };

    const doUnchain = (msg, args) => {
        var parsed = parseCommand(msg, args);
        if (parsed.ids.length === 0) { reply(msg, 'Error', 'Select or specify token(s).'); return; }
        var hasSpecificProps = parsed.props !== null && parsed.props !== 'all';
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
        var up = args.indexOf('--up') !== -1;
        var down = args.indexOf('--down') !== -1;
        var ifLinked = args.indexOf('--if-linked') !== -1;
        args = args.filter(function(a) { return a !== '--linked' && a !== '--unlinked' && a !== '--up' && a !== '--down' && a !== '--chain' && a !== '--if-linked'; });
        if (!linked && !unlinked) linked = true;
        // --up takes precedence; --up --down is same as --up
        if (up) down = false;

        var parsed = parseCommand(msg, args);

        // Single-token align
        if (parsed.ids.length === 1 && linked) {
            var singleLinks = findLinksForToken(parsed.ids[0]);
            if (singleLinks.length > 0) {
                var asChild = singleLinks.filter(function(e) { return e.link.mode === 'link' && e.link.ids[0] !== parsed.ids[0]; });
                var isParentOrChain = singleLinks.some(function(e) { return e.link.mode === 'chain' || (e.link.mode === 'link' && e.link.ids[0] === parsed.ids[0]); });
                var isChild = asChild.length > 0;

                // Ambiguous: both parent/chain AND child, no flags
                if (isParentOrChain && isChild && !up && !down) {
                    reply(msg, 'Error', 'Token is both parent/chain and child. Use --up (align to parent then cascade) or --down (cascade from current value).');
                    return;
                }

                var source = getObj('graphic', parsed.ids[0]);
                if (!source) { reply(msg, 'Error', 'Token not found.'); return; }
                var aligned = 0;

                // Step 1: If --up (or unambiguous child), align self to parent
                var doUp = up || (!down && isChild && !isParentOrChain);
                if (doUp && asChild.length > 0) {
                    var parentLink = asChild[0].link;
                    var props = parsed.props === null ? getEffectiveProps(parentLink) :
                                parsed.props === 'all' ? getKnownProps() : parsed.props;
                    var parent = getObj('graphic', parentLink.ids[0]);
                    if (parent) {
                        var updates = {};
                        props.forEach(function(p) { updates[p] = parent.get(p); });
                        source.set(updates);
                        aligned++;
                    }
                }

                // Step 2: Cascade from self to chain + children recursively
                var cascadeVisited = new Set([parsed.ids[0]]);
                var cascadeFrom = function(tokenId) {
                    var tokenObj = getObj('graphic', tokenId);
                    if (!tokenObj) return;
                    var s = state[SCRIPT_NAME];
                    Object.values(s.links).forEach(function(link) {
                        var idx = link.ids.indexOf(tokenId);
                        if (idx === -1) return;
                        var requestedProps = parsed.props === null ? getEffectiveProps(link) :
                                    parsed.props === 'all' ? getKnownProps() : parsed.props;
                        // --if-linked: intersect with link's effective props
                        var linkProps = ifLinked ? requestedProps.filter(function(p) { return getEffectiveProps(link).indexOf(p) !== -1; }) : requestedProps;
                        var updates = {};
                        linkProps.forEach(function(p) { updates[p] = tokenObj.get(p); });

                        if (link.mode === 'chain') {
                            link.ids.forEach(function(tid) {
                                if (cascadeVisited.has(tid)) return;
                                cascadeVisited.add(tid);
                                var t = getObj('graphic', tid);
                                if (t) { t.set(updates); aligned++; cascadeFrom(tid); }
                            });
                        } else if (idx === 0) {
                            link.ids.slice(1).forEach(function(tid) {
                                if (cascadeVisited.has(tid)) return;
                                cascadeVisited.add(tid);
                                var t = getObj('graphic', tid);
                                if (t) { t.set(updates); aligned++; cascadeFrom(tid); }
                            });
                        }
                    });
                };
                cascadeFrom(parsed.ids[0]);

                reply(msg, 'Align', 'Aligned ' + aligned + ' token(s).');
                return;
            }
        }

        if (parsed.ids.length < 2) { reply(msg, 'Error', 'Align requires at least 2 tokens (or 1 token in a link/chain).'); return; }

        var s = state[SCRIPT_NAME];
        var aligned = 0;
        var ignored = [];

        if (linked) {
            parsed.ids.forEach(function(id) {
                var links = findLinksForToken(id);
                links.forEach(function(entry) {
                    var link = entry.link;
                    // null = use link's scope; 'all' or array = explicit
                    var props = parsed.props === null ? getEffectiveProps(link) :
                                parsed.props === 'all' ? getKnownProps() : parsed.props;
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
                var alignProps = parsed.props === null || parsed.props === 'all' ? getKnownProps() : parsed.props;
                var updates = {};
                alignProps.forEach(function(p) { updates[p] = source.get(p); });
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

    // =========================================================================
    // Command Router
    // =========================================================================

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD) return;
        if (!playerIsGM(msg.playerid) && msg.playerid !== 'API') return;

        // ScriptKit handles help, man, examples, whatsnew, gen-docs, gen-dev-docs
        if (typeof ScriptKit !== 'undefined' && ScriptKit.handleInput(msg)) return;

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
            default:        reply(msg, 'Unknown command. Try `!mirror help`'); break;
        }
    };

    // =========================================================================
    // Public API
    // =========================================================================

    /** Create a unidirectional link. props: array or 'api-all'. soft: bool. */
    const apiLink = (ids, props, soft, excludes) => {
        if (!ids || ids.length < 2) { log(SCRIPT_NAME + ': link requires at least 2 IDs.'); return null; }
        return createLink('link', props || 'api-all', ids, !!soft, excludes);
    };

    /** Create a bidirectional chain link. */
    const apiChainLink = (ids, props, excludes) => {
        if (!ids || ids.length < 2) { log(SCRIPT_NAME + ': chainLink requires at least 2 IDs.'); return null; }
        return createLink('chain', props || 'api-all', ids, true, excludes);
    };

    /** Remove links for given token IDs. props: array to remove specific, null to remove all. */
    const apiUnlink = (ids, props) => {
        ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode === 'chain') {
                    // Remove token from chain
                    entry.link.ids = entry.link.ids.filter(function(tid) { return tid !== id; });
                    rebuildChainedIds(id, entry.id);
                    if (entry.link.ids.length < 2) {
                        entry.link.ids.forEach(function(tid) { rebuildChainedIds(tid, entry.id); });
                        delete state[SCRIPT_NAME].links[entry.id];
                    }
                } else {
                    if (!props || props.length === 0) removePropsFromLink(entry.id, null);
                    else if (entry.link.props === 'all' || entry.link.props === 'api-all') {
                        props.forEach(function(p) { if (entry.link.excludes.indexOf(p) === -1) entry.link.excludes.push(p); });
                    } else {
                        removePropsFromLink(entry.id, props);
                    }
                }
            });
        });
    };

    /** Remove chain for given token IDs. props: add to excludes. null: destroy chain. */
    const apiUnchain = (ids, props) => {
        ids.forEach(function(id) {
            findLinksForToken(id).forEach(function(entry) {
                if (entry.link.mode !== 'chain') return;
                if (!props || props.length === 0) {
                    removePropsFromLink(entry.id, null);
                } else if (entry.link.props === 'all' || entry.link.props === 'api-all') {
                    props.forEach(function(p) { if (entry.link.excludes.indexOf(p) === -1) entry.link.excludes.push(p); });
                } else {
                    removePropsFromLink(entry.id, props);
                }
            });
        });
    };

    /** Add tokens to an existing chain. existingId: any ID in the chain. newIds: IDs to add. */
    const apiAddToChain = (existingId, newIds) => {
        var links = findLinksForToken(existingId);
        var chainEntry = links.find(function(e) { return e.link.mode === 'chain'; });
        if (!chainEntry) { log(SCRIPT_NAME + ': addToChain — token is not in a chain.'); return; }
        newIds.forEach(function(id) {
            if (chainEntry.link.ids.indexOf(id) === -1) {
                chainEntry.link.ids.push(id);
                state[SCRIPT_NAME].chainedIds[id] = true;
            }
        });
    };

    /** Remove a token from its chain without destroying it. */
    const apiRemoveFromChain = (tokenId) => {
        var links = findLinksForToken(tokenId);
        links.forEach(function(entry) {
            if (entry.link.mode !== 'chain') return;
            entry.link.ids = entry.link.ids.filter(function(id) { return id !== tokenId; });
            rebuildChainedIds(tokenId, entry.id);
            if (entry.link.ids.length < 2) {
                entry.link.ids.forEach(function(id) { rebuildChainedIds(id, entry.id); });
                delete state[SCRIPT_NAME].links[entry.id];
            }
        });
    };

    /** Align tokens. sourceId's values cascade to chain/children. options: { up, ifLinked, props } */
    const apiAlign = (sourceId, options) => {
        options = options || {};
        var source = getObj('graphic', sourceId);
        if (!source) { log(SCRIPT_NAME + ': align — source not found.'); return; }
        var singleLinks = findLinksForToken(sourceId);
        if (singleLinks.length === 0) return;

        // If up: align to parent first
        if (options.up) {
            var asChild = singleLinks.filter(function(e) { return e.link.mode === 'link' && e.link.ids[0] !== sourceId; });
            if (asChild.length > 0) {
                var parentLink = asChild[0].link;
                var props = options.props || getEffectiveProps(parentLink);
                var parent = getObj('graphic', parentLink.ids[0]);
                if (parent) {
                    var updates = {};
                    props.forEach(function(p) { updates[p] = parent.get(p); });
                    source.set(updates);
                }
            }
        }

        // Cascade from source
        var visited = new Set([sourceId]);
        var cascadeFrom = function(tokenId) {
            var tokenObj = getObj('graphic', tokenId);
            if (!tokenObj) return;
            Object.values(state[SCRIPT_NAME].links).forEach(function(link) {
                var idx = link.ids.indexOf(tokenId);
                if (idx === -1) return;
                var requestedProps = options.props || getEffectiveProps(link);
                var linkProps = options.ifLinked ? requestedProps.filter(function(p) { return getEffectiveProps(link).indexOf(p) !== -1; }) : requestedProps;
                if (linkProps.length === 0) return;
                var updates = {};
                linkProps.forEach(function(p) { updates[p] = tokenObj.get(p); });
                if (link.mode === 'chain') {
                    link.ids.forEach(function(tid) {
                        if (visited.has(tid)) return;
                        visited.add(tid);
                        var t = getObj('graphic', tid);
                        if (t) { t.set(updates); cascadeFrom(tid); }
                    });
                } else if (idx === 0) {
                    link.ids.slice(1).forEach(function(tid) {
                        if (visited.has(tid)) return;
                        visited.add(tid);
                        var t = getObj('graphic', tid);
                        if (t) { t.set(updates); cascadeFrom(tid); }
                    });
                }
            });
        };
        cascadeFrom(sourceId);
    };

    /** Query links for a token. Returns array of { id, link } objects. */
    const apiGetLinks = (tokenId) => findLinksForToken(tokenId);

    /** Get the parent (source) token ID for a one-way link, or null. */
    const apiGetParent = (childId) => {
        var links = findLinksForToken(childId);
        var asChild = links.find(function(e) { return e.link.mode === 'link' && e.link.ids[0] !== childId; });
        return asChild ? asChild.link.ids[0] : null;
    };

    /** Get child token IDs for one-way links where tokenId is the parent. */
    const apiGetChildren = (parentId) => {
        var children = [];
        findLinksForToken(parentId).forEach(function(e) {
            if (e.link.mode === 'link' && e.link.ids[0] === parentId) {
                children = children.concat(e.link.ids.slice(1));
            }
        });
        return children;
    };

    /** Get all token IDs in the same chain as tokenId, or empty array. */
    const apiGetChainMembers = (tokenId) => {
        var links = findLinksForToken(tokenId);
        var chain = links.find(function(e) { return e.link.mode === 'chain'; });
        return chain ? chain.link.ids.slice() : [];
    };

    /** Get/set global excludes. */
    const apiGetGlobalExcludes = () => (state[SCRIPT_NAME].globalExcludes || []).slice();
    const apiSetGlobalExcludes = (excludes) => { state[SCRIPT_NAME].globalExcludes = excludes; };

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

    const registerWithScriptKit = () => {
        if (typeof ScriptKit === 'undefined') return;
        ScriptKit.register(SCRIPT_NAME, {
            version: SCRIPT_VERSION,
            command: CMD,
            handout: 'auto',
            devHandout: 'update',
            help: {
                description: 'Flat property syncing between tokens. No transforms, no offsets — when a property changes on one token, the same value is copied to linked tokens.',
                quickStart: [
                    'Select 2+ tokens and run `!mirror link` to create a unidirectional link (first selected = source)',
                    'Use `!mirror chain` for bidirectional syncing (any change propagates to all members)',
                    'Specify property groups: `!mirror link spatial bars` to sync only those',
                    'Use `!mirror status` on a selected token to see its links',
                    'Run `!mirror unlink` or `!mirror unchain` to remove syncing',
                ],
                commands: [
                    {
                        group: 'Linking',
                        commands: [
                            {
                                syntax: 'link [--soft] [--align] [--exclude props] [props] [ids...]',
                                description: 'Create a unidirectional link (hard-lock by default)',
                                version: '1.0.0',
                                items: [
                                    { name: '--soft', description: 'Children can diverge — changes still propagate but are not reverted', version: '1.0.0' },
                                    { name: '--align', description: 'Immediately copy source props to children on creation', version: '1.1.0' },
                                    { name: '--exclude', description: 'Exclude specific props/groups from an `all` link', version: '1.1.0' },
                                    { name: 'props', description: 'Property names or group names to sync (default: all)', version: '1.0.0' },
                                    { name: 'ids', description: 'Token IDs (or use selected tokens — first = source)', version: '1.0.0' },
                                ],
                            },
                            {
                                syntax: 'unlink [props] [ids...]',
                                description: 'Remove a link or add properties to its exclude list',
                                version: '1.0.0',
                            },
                            {
                                syntax: 'chain [--align] [--exclude props] [props] [ids...]',
                                description: 'Create a bidirectional ring link (all members sync equally)',
                                version: '1.0.0',
                                items: [
                                    { name: '--align', description: 'Align all members to the first selected on creation', version: '1.1.0' },
                                    { name: '--exclude', description: 'Exclude specific props/groups', version: '1.1.0' },
                                ],
                            },
                            {
                                syntax: 'unchain [props] [ids...]',
                                description: 'Remove a chain or add excludes',
                                version: '1.0.0',
                            },
                        ],
                    },
                    {
                        group: 'Alignment',
                        commands: [
                            {
                                syntax: 'align [--up|--down] [--linked|--unlinked] [--if-linked] [props] [ids...]',
                                description: 'One-time copy of property values between linked tokens',
                                version: '1.1.0',
                                items: [
                                    { name: '--up', description: 'Align to parent (pull values from source)', version: '1.1.0' },
                                    { name: '--down', description: 'Cascade from selected token to children', version: '1.1.0' },
                                    { name: '--linked', description: 'Only align tokens that share a link', version: '1.1.0' },
                                    { name: '--unlinked', description: 'Only align tokens that do not share a link', version: '1.1.0' },
                                    { name: '--if-linked', description: 'Only align props that are actually linked', version: '1.1.0' },
                                ],
                            },
                        ],
                    },
                    {
                        group: 'Configuration',
                        commands: [
                            {
                                syntax: 'config [exclude|include|reset] [props]',
                                description: 'Manage global property excludes',
                                version: '1.1.0',
                                items: [
                                    { name: 'exclude', description: 'Add props to the global exclude list', version: '1.1.0' },
                                    { name: 'include', description: 'Remove props from the global exclude list', version: '1.1.0' },
                                    { name: 'reset', description: 'Clear all global excludes', version: '1.1.0' },
                                ],
                            },
                        ],
                    },
                    {
                        group: 'Info',
                        commands: [
                            { syntax: 'status', description: 'Show links for selected tokens', version: '1.0.0' },
                        ],
                    },
                ],
                topics: {
                    propertyGroups: {
                        title: 'Property Groups',
                        description: 'Named collections of properties for convenience',
                        version: '1.0.0',
                        body: 'Instead of listing individual properties, use group names. Multiple groups can be combined.',
                        items: [
                            { name: 'all', description: 'All known properties (dynamic — includes future additions)', version: '1.0.0' },
                            { name: 'spatial', description: 'left, top, rotation, width, height', version: '1.0.0' },
                            { name: 'position', description: 'left, top', version: '1.0.0' },
                            { name: 'size', description: 'width, height', version: '1.0.0' },
                            { name: 'bars', description: 'All bar values, links, visibility, and permissions', version: '1.0.0' },
                            { name: 'name', description: 'name, showname, showplayers_name, playersedit_name', version: '1.0.0' },
                            { name: 'auras', description: 'Both aura radii, colors, square, options, and visibility', version: '1.0.0' },
                            { name: 'light', description: 'All UDL emission and legacy dynamic lighting props', version: '1.0.0' },
                            { name: 'sight', description: 'Vision properties — bright, night, field of vision limits', version: '1.0.0' },
                            { name: 'flip', description: 'flipv, fliph', version: '1.0.0' },
                            { name: 'anchor', description: 'position + size + rotation + flip + layer (for Anchor compat)', version: '1.1.0' },
                            { name: 'tooltip', description: 'tooltip, show_tooltip, gm_only_tooltip', version: '1.2.0' },
                            { name: 'reactions', description: 'interactionTriggered, interactionManualReset, fadeOnOverlap, fadeOpacity', version: '1.2.0' },
                        ],
                    },
                    hardVsSoft: {
                        title: 'Hard vs Soft Links',
                        description: 'Understanding lock behavior',
                        version: '1.0.0',
                        body: 'By default, links are **hard** — children are locked and any manual change is immediately reverted to match the source. A child can only have one hard parent.\n\nWith `--soft`, children can diverge from the source. Changes on the source still propagate, but manual edits on children are not reverted. Soft links do not restrict other links.',
                    },
                    anchorCompat: {
                        title: 'Using with Anchor',
                        description: 'Avoiding conflicts between Mirror and Anchor spatial sync',
                        version: '1.1.0',
                        body: 'If tokens are managed by both Mirror and Anchor, exclude the spatial properties that Anchor handles:\n\n`!mirror chain --exclude anchor`\n\nThis syncs everything except left, top, width, height, rotation, flipv, fliph, and layer — which Anchor manages.',
                    },
                    scriptingApi: {
                        title: 'Scripting API',
                        description: 'Using Mirror from other scripts',
                        handouts: 'dev',
                        version: '1.0.0',
                        body: 'Access via `Mirror.*` after `on("ready")`.',
                        items: [
                            { name: 'Mirror.link(ids, props, soft, excludes)', description: 'Create unidirectional link', version: '1.0.0' },
                            { name: 'Mirror.chainLink(ids, props, excludes)', description: 'Create bidirectional chain', version: '1.0.0' },
                            { name: 'Mirror.unlink(ids, props)', description: 'Remove link or add excludes', version: '1.0.0' },
                            { name: 'Mirror.unchain(ids, props)', description: 'Remove chain or add excludes', version: '1.0.0' },
                            { name: 'Mirror.addToChain(existingId, newIds)', description: 'Add tokens to an existing chain', version: '1.1.0' },
                            { name: 'Mirror.removeFromChain(tokenId)', description: 'Remove a token from its chain', version: '1.1.0' },
                            { name: 'Mirror.align(sourceId, options)', description: 'Align tokens: { up, ifLinked, props }', version: '1.1.0' },
                            { name: 'Mirror.getLinks(tokenId)', description: '→ [{ id, link }]', version: '1.0.0' },
                            { name: 'Mirror.getParent(childId)', description: '→ parentId or null', version: '1.0.0' },
                            { name: 'Mirror.getChildren(parentId)', description: '→ [childIds]', version: '1.0.0' },
                            { name: 'Mirror.getChainMembers(tokenId)', description: '→ [ids in same chain]', version: '1.1.0' },
                            { name: 'Mirror.getGlobalExcludes()', description: '→ [excluded prop names]', version: '1.1.0' },
                            { name: 'Mirror.setGlobalExcludes(arr)', description: 'Set global excludes array', version: '1.1.0' },
                            { name: 'Mirror.ALL_PROPS', description: 'Hardcoded property list', version: '1.0.0' },
                            { name: 'Mirror.PROP_GROUPS', description: 'Named group definitions', version: '1.0.0' },
                            { name: 'Mirror.getKnownProps()', description: '→ all known prop names (dynamic)', version: '1.1.0' },
                        ],
                    },
                },
                changelog: [
                    { version: '1.2.0', changes: [
                        'Added properties: sides, interactionTriggered, interactionManualReset, renderAsDarkness, gm_only_tooltip, night_vision_tint',
                        'Added property groups: tooltip, reactions',
                        'ScriptKit integration: help, man, handout generation',
                    ]},
                    { version: '1.1.0', changes: [
                        'Added --align flag for link/chain creation',
                        'Added --exclude flag for prop filtering',
                        'Added align command with --up, --down, --linked, --unlinked, --if-linked',
                        'Added config command for global excludes',
                        'Added anchor property group for Anchor compatibility',
                        'Added addToChain and removeFromChain API methods',
                    ]},
                    { version: '1.0.0', changes: [
                        'Initial release: link, unlink, chain, unchain, status',
                        'Hard/soft link modes',
                        'Property groups: all, spatial, position, size, bars, light, auras, flip',
                        'Scripting API for inter-script linking',
                    ]},
                ],
            },
        });
    };

    return {
        checkInstall,
        registerEventHandlers,
        registerWithScriptKit,
        link: apiLink,
        chainLink: apiChainLink,
        unlink: apiUnlink,
        unchain: apiUnchain,
        addToChain: apiAddToChain,
        removeFromChain: apiRemoveFromChain,
        align: apiAlign,
        getLinks: apiGetLinks,
        getParent: apiGetParent,
        getChildren: apiGetChildren,
        getChainMembers: apiGetChainMembers,
        getGlobalExcludes: apiGetGlobalExcludes,
        setGlobalExcludes: apiSetGlobalExcludes,
        ALL_PROPS: ALL_PROPS,
        PROP_GROUPS: PROP_GROUPS,
        getKnownProps: getKnownProps
    };
})();

on('ready', () => {
    'use strict';
    Mirror.checkInstall();
    Mirror.registerEventHandlers();
    Mirror.registerWithScriptKit();
    on('chat:message', (msg) => {
        if (msg.type === 'api' && msg.content === '!scriptkit-ready') Mirror.registerWithScriptKit();
    });
});
