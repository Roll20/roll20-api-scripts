// =============================================================================
// Anchor v2.1.0
// Last Updated: 2026-06-12
// Author: Kenan Millet
//
// Description:
//   Attach child graphics to an anchor graphic so they automatically mirror
//   the anchor's transform (position, rotation, scale, flip).
//   Supports arbitrary chains: a child can itself be an anchor to grandchildren.
//
// Dependencies: MatrixMath
//
// Commands:
//   !anchor [<anchor_id>] [flags...] [ignore-selected] [<child_id>...]
//     Anchor selected token(s) (and any listed IDs) to anchor_id.
//     By default anchors all transform components (position, rotation, scale,
//     flipv, fliph).
//     If anchor_id is omitted or not a valid token ID, an invisible anchor
//     token is automatically created at the first child's position and
//     auto-destroyed when its last child is removed. Add persist to keep it:
//     !anchor persist [anchor_id] [flags] [child_id...]
//
//   Component flags — long form (anchor-<name>) or short alias (-<name>):
//     anchor-all / -all      = every component including z-order
//     anchor / (no flags)    = default: pos+rot+scale+flip (no layer or z-order)
//     anchor-position / -pos = x + y
//     anchor-x / -x          = x position only
//     anchor-y / -y          = y position only
//     anchor-rotation / -rot = rotation only
//     anchor-scale / -scale  = width + height
//     anchor-width / -w      = width only
//     anchor-height / -h     = height only
//     anchor-layer / -layer  = layer only
//     anchor-flip / -flip    = flipv + fliph
//     anchor-flipv / -flipv  = vertical flip only
//     anchor-fliph / -fliph  = horizontal flip only
//     anchor-z / -z          = z-order (relative stacking, use Anchor.updateZOrder() after moving anchor)
//
//   !anchor remove [ignore-selected] [<child_id>...]
//     Remove anchor from selected/listed tokens.
//
//   !anchor lock [component flags] [ignore-selected] [<child_id>...]
//     Lock components for child(ren). Locked components are re-enforced every
//     poll tick — manual moves are undone, anchor changes are ignored for those
//     components. With no component flags, locks ALL components.
//     Components not yet tracked are stored as "pre-locked" and will be locked
//     automatically if/when tracking is added via !anchor track.
//
//   !anchor unlock [component flags] [ignore-selected] [<child_id>...]
//     Unlock components. With no component flags, unlocks everything.
//
//   !anchor track [component flags] [ignore-selected] [<child_id>...]
//     Add component tracking to existing anchor relationships, recording the
//     current relative state as the new stored offset. Respects any pre-locks.
//
//   !anchor untrack [component flags] [ignore-selected] [<child_id>...]
//     Remove component tracking. Does not affect locked state.
//
//   !anchor retrack [component flags] [ignore-selected] [<child_id>...]
//     Replace the tracked component set entirely. No flags = default set.
//
//   !anchor center [ignore-selected] [<child_id>...]
//     Snap child(ren) to anchor center (offset 0,0, rotation 0, scale 1:1).
//
//   !anchor update [ignore-selected] [<child_id>...]
//     Force an immediate position/transform sync for the child(ren).
//
//   !anchor info [ignore-selected] [<child_id>...]
//     Whisper current anchor state for the given token(s) to the caller.
//
//   !anchor config
//     Show current configuration values.
//
//   !anchor config <key> <value>
//     Set a config value at runtime (persists in state across restarts).
//     Keys and their defaults:
//       poll-interval <ms>                  — polling interval (default: 1000, min: 100)
//       default-anchor-layer <layer>        — gmlayer | objects | map  (default: gmlayer)
//       default-anchor-size <px>            — token size in pixels (default: 35)
//       default-anchor-name <name>          — token name (default: Anchor)
//       default-anchor-aura-color <#hex>    — GM aura colour (default: #00ffff)
//       default-anchor-aura-visible <bool>  — show GM aura (default: true)
//       allow-player-use <bool>             — let players use lock/unlock/info/update/center (default: false)
//
//   !anchor config reset
//     Reset all runtime config overrides; reverts to globalconfig / DEFAULTS.
//
//   !anchor --help
//     Whisper this help text to the caller.
//
// Configuration priority (lowest → highest):
//   Hardcoded DEFAULTS → useroptions (API Scripts page) → !anchor config (runtime state)
// =============================================================================

/* global state, on, sendChat, getObj, createObj, Campaign, playerIsGM, toFront, toBack, log, _, setInterval, setTimeout, MatrixMath */

var Anchor = Anchor || (() => {
    'use strict';

    // -------------------------------------------------------------------------
    // Constants
    // -------------------------------------------------------------------------

    const SCRIPT_NAME    = 'Anchor';
    const SCRIPT_VERSION = '2.1.0';
    const CMD_TOKEN      = '!anchor';

    const DEFAULTS = {
        // Polling
        pollIntervalMs:           1000,
        // Auto-created anchor token appearance
        defaultAnchorLayer:       'gmlayer',
        defaultAnchorSize:        35,
        defaultAnchorName:        'Anchor',
        defaultAnchorAuraColor:   '#00ffff',
        defaultAnchorAuraVisible: true,
        // Roll20's built-in default character token image — a relative path that
        // is available to all users without any library upload required.
        // Users can override this via !anchor config default-anchor-imgsrc or
        // the API Scripts page useroptions field.
        defaultAnchorImgsrc:      'https://s3.amazonaws.com/files.d20.io/images/58010319/4S4xdTsHxQGVttCDSPsmnw/thumb.png?1531339299',
        // Permissions
        allowPlayerUse:           false,
    };

    // All anchored transform components.
    // 'zorder' is special — it has no single graphic attribute but is managed
    // via toFront/toBack and stored as front/back ordered lists on the anchor.
    const COMPONENTS = {
        left:     'left',
        top:      'top',
        rotation: 'rotation',
        width:    'width',
        height:   'height',
        layer:    'layer',
        flipv:    'flipv',
        fliph:    'fliph',
        zorder:   null,   // managed separately, not a graphic attribute
    };

    // Components included in the default set (everything except zorder).
    const DEFAULT_COMPONENTS = ['left','top','rotation','width','height','flipv','fliph'];

    // All components including layer and zorder.
    const ALL_COMPONENTS = [...DEFAULT_COMPONENTS, 'layer', 'zorder'];

    // Long-form command flags that expand to component sets.
    // Short aliases (e.g. -x, -rot) map to the same expansions via ALIAS_MAP below.
    const FLAG_EXPANSIONS = {
        // Explicit component flags (long form: anchor-<name>, short form: -<alias>)
        'anchor-all':       ALL_COMPONENTS,
        'anchor':           DEFAULT_COMPONENTS,
        'anchor-position':  ['left', 'top'],
        'anchor-x':         ['left'],
        'anchor-y':         ['top'],
        'anchor-rotation':  ['rotation'],
        'anchor-scale':     ['width', 'height'],
        'anchor-width':     ['width'],
        'anchor-height':    ['height'],
        'anchor-layer':     ['layer'],
        'anchor-flip':      ['flipv', 'fliph'],
        'anchor-flipv':     ['flipv'],
        'anchor-fliph':     ['fliph'],
        'anchor-z':         ['zorder'],
    };

    // Short alias → canonical long-form flag
    const ALIAS_MAP = {
        '-all':   'anchor-all',
        '-pos':   'anchor-position',
        '-x':     'anchor-x',
        '-y':     'anchor-y',
        '-rot':   'anchor-rotation',
        '-scale': 'anchor-scale',
        '-w':     'anchor-width',
        '-h':     'anchor-height',
        '-layer': 'anchor-layer',
        '-flip':  'anchor-flip',
        '-flipv': 'anchor-flipv',
        '-fliph': 'anchor-fliph',
        '-z':     'anchor-z',
    };

    const ALL_COMMAND_FLAGS = [
        ...Object.keys(FLAG_EXPANSIONS),
        ...Object.keys(ALIAS_MAP),
        'remove', 'lock', 'unlock', 'center', 'update', 'info',
        'track', 'untrack', 'retrack',
        'chain', 'unchain',
        'ignore-selected', 'persist', 'new',
        'config',
        '--help',
    ];

    // -------------------------------------------------------------------------
    // Helpers
    // -------------------------------------------------------------------------

    const cfg = () => state[SCRIPT_NAME].config;

    /**
     * Whisper a message back to the sender. Optionally include a tag label.
     * @param {object} msg  - Roll20 chat message object
     * @param {string} tagOrText - If `text` omitted, used as the message body.
     *                             Otherwise used as a bracketed tag prefix.
     * @param {string} [text]
     */
    const reply = (msg, tagOrText, text) => {
        const tag       = text !== undefined ? ` [${tagOrText}]` : '';
        const body      = text !== undefined ? text : tagOrText;
        const recipient = msg.who.split(' ')[0];
        sendChat(`${SCRIPT_NAME}${tag}`, `/w ${recipient} ${body}`);
    };

    const isValidGraphic = (objId) => !!getObj('graphic', objId);

    /** Degrees to radians. */
    const toRad = (deg) => deg * Math.PI / 180;

    /** Normalise an angle to [0, 360). */
    const normDeg = (deg) => ((deg % 360) + 360) % 360;

    /**
     * Build a 3×3 transform matrix for a graphic's current position + rotation.
     */
    const buildTransform = (left, top, rotationDeg) => {
        let m = MatrixMath.identity(3);
        m = MatrixMath.multiply(m, MatrixMath.translate([left, top]));
        m = MatrixMath.multiply(m, MatrixMath.rotate(toRad(rotationDeg)));
        return m;
    };

    // -------------------------------------------------------------------------
    // State helpers
    // -------------------------------------------------------------------------

    /**
     * Derive the set of currently tracked components from an anchorInfo object.
     * Returns an object like { left: true, rotation: true, ... }.
     */
    const getTrackedComponentsFromInfo = (info) => {
        const tracked = {};
        if ('left'        in info) tracked.left     = true;
        if ('top'         in info) tracked.top      = true;
        if ('rotation'    in info) tracked.rotation = true;
        if ('widthRatio'  in info) tracked.width    = true;
        if ('heightRatio' in info) tracked.height   = true;
        if ('layerOffset' in info) tracked.layer    = true;
        if ('flipv'       in info) tracked.flipv    = true;
        if ('fliph'       in info) tracked.fliph    = true;
        if ('zorder'      in info) tracked.zorder   = true;
        return tracked;
    };

    /**
     * Read an object's current graphic attrs into a plain snapshot object.
     */
    const snapshotObj = (obj) => ({
        left:     obj.get('left'),
        top:      obj.get('top'),
        rotation: obj.get('rotation'),
        width:    obj.get('width'),
        height:   obj.get('height'),
        layer:    obj.get('layer'),
        flipv:    obj.get('flipv'),
        fliph:    obj.get('fliph'),
    });

    /**
     * Ensure an object has an entry in objectStates and return it.
     * If the entry doesn't exist, create it from the live graphic.
     */
    const ensureObjState = (objId) => {
        if (!objId) return undefined;
        const s = state[SCRIPT_NAME];
        if (!s.objectStates[objId]) {
            const obj = getObj('graphic', objId);
            if (!obj) return undefined;
            s.objectStates[objId] = snapshotObj(obj);
        }
        return s.objectStates[objId];
    };

    /**
     * Overwrite an object's state snapshot with current live values.
     */
    const refreshObjState = (obj) => {
        const s = state[SCRIPT_NAME];
        const id = obj.get('id');
        if (s.objectStates[id]) {
            Object.assign(s.objectStates[id], snapshotObj(obj));
        }
    };

    // -------------------------------------------------------------------------
    // Anchor relationship management
    // -------------------------------------------------------------------------

    /**
     * Compute a child's relative transform values at the time anchoring is
     * established. Returns an anchorInfo object containing only the components
     * that are being anchored.
     *
     * Position (left/top) is stored relative to the anchor's local frame so
     * that it survives the anchor rotating.
     */
    const computeAnchorInfo = (anchorId, childId, components) => {
        const anchor = getObj('graphic', anchorId);
        const child  = getObj('graphic', childId);
        if (!anchor || !child) return undefined;

        const aLeft = anchor.get('left');
        const aTop  = anchor.get('top');
        const aRot  = anchor.get('rotation');
        const cLeft = child.get('left');
        const cTop  = child.get('top');
        const cRot  = child.get('rotation');
        const aW    = anchor.get('width');
        const aH    = anchor.get('height');

        const info = { id: childId, anchor_id: anchorId };

        if (components.left || components.top) {
            // Express child position in anchor-local frame (undo anchor rotation)
            const relTransform = MatrixMath.multiply(
                MatrixMath.rotate(toRad(-aRot)),
                MatrixMath.translate([cLeft - aLeft, cTop - aTop])
            );
            if (components.left)  info.left     = relTransform[2][0];
            if (components.top)   info.top      = relTransform[2][1];
        }

        if (components.rotation) info.rotation = normDeg(cRot - aRot);
        if (components.width)    info.widthRatio  = aW > 0 ? child.get('width')  / aW : 1;
        if (components.height)   info.heightRatio = aH > 0 ? child.get('height') / aH : 1;
        if (components.layer)    info.layerOffset = 0;    // always same layer as anchor
        if (components.flipv)    info.flipv = child.get('flipv') !== anchor.get('flipv'); // true = flipped relative to parent
        if (components.fliph)    info.fliph = child.get('fliph') !== anchor.get('fliph');

        // Z-order is not stored in anchorInfo per-child; instead the anchor
        // maintains front/back ordered lists. We flag it here so setAnchor
        // knows to register the child into those lists.
        if (components.zorder)   info.zorder = true;

        return info;
    };

    /**
     * Remove stale entries for a child from anchorChildrenByAnchorId and clean
     * up the anchor's objectState if it's no longer needed.
     */
    const detachChildFromAnchor = (childId, anchorId) => {
        const s = state[SCRIPT_NAME];
        if (!anchorId || !(anchorId in s.anchorChildrenByAnchorId)) return;

        delete s.anchorChildrenByAnchorId[anchorId][childId];

        // Remove child from z-order lists if present
        if (s.anchorZOrder && s.anchorZOrder[anchorId]) {
            s.anchorZOrder[anchorId].front = s.anchorZOrder[anchorId].front.filter(id => id !== childId);
            s.anchorZOrder[anchorId].back  = s.anchorZOrder[anchorId].back.filter(id => id !== childId);
            if (s.anchorZOrder[anchorId].front.length === 0 && s.anchorZOrder[anchorId].back.length === 0) {
                delete s.anchorZOrder[anchorId];
            }
        }

        if (Object.keys(s.anchorChildrenByAnchorId[anchorId]).length === 0) {
            delete s.anchorChildrenByAnchorId[anchorId];
            // Clean up anchor's own objectState if it's not also a child
            if (!(anchorId in s.anchorInfoByChildId)) {
                delete s.objectStates[anchorId];
            }
            // Auto-destroy auto-created anchor tokens that have lost all children
            maybeDestroyAutoAnchor(anchorId);
        }
    };

    /**
     * If anchorId is an auto-created anchor token that now has no children,
     * remove it from the map and from state.
     * Called automatically; safe to call even if anchorId is not auto-created.
     */
    const maybeDestroyAutoAnchor = (anchorId) => {
        const s = state[SCRIPT_NAME];
        if (!(anchorId in s.autoCreatedAnchors)) return;
        // Don't destroy if there's a pending setup waiting for add:graphic
        if (anchorId in s.pendingAnchors) return;
        if (anchorId in s.anchorChildrenByAnchorId) return;
        delete s.autoCreatedAnchors[anchorId];
        delete s.objectStates[anchorId];
        const obj = getObj('graphic', anchorId);
        if (obj) obj.remove();
    };

    // -------------------------------------------------------------------------
    // Lock helpers
    // -------------------------------------------------------------------------

    /**
     * Return the Set of locked components for a child, or an empty Set if none.
     * Does NOT create an entry — use getOrCreateLockedSet for mutation.
     */
    const getLockedComponents = (childId) => {
        const entry = state[SCRIPT_NAME].lockedObjects[childId];
        if (!entry) return new Set();
        // Migrate old flat-value format (childId: childId) to Set on first access
        if (!(entry instanceof Set)) {
            const migrated = new Set(Object.keys(entry));
            state[SCRIPT_NAME].lockedObjects[childId] = migrated;
            return migrated;
        }
        return entry;
    };

    const getOrCreateLockedSet = (childId) => {
        const s = state[SCRIPT_NAME];
        if (!s.lockedObjects[childId] || !(s.lockedObjects[childId] instanceof Set)) {
            s.lockedObjects[childId] = new Set();
        }
        return s.lockedObjects[childId];
    };

    /**
     * Lock the given components for a child.
     * If components is empty/undefined, locks all components (tracked + all possible).
     * Components that aren't currently tracked are stored as "pre-locked".
     */
    const lockComponents = (childId, components) => {
        const s = state[SCRIPT_NAME];
        const locked = getOrCreateLockedSet(childId);
        const toAdd = (components && Object.keys(components).length > 0)
            ? Object.keys(components)
            : ALL_COMPONENTS;
        toAdd.forEach(c => locked.add(c));
    };

    /**
     * Unlock the given components for a child.
     * If components is empty/undefined, unlocks everything (clears the entry).
     */
    const unlockComponents = (childId, components) => {
        const s = state[SCRIPT_NAME];
        if (!components || Object.keys(components).length === 0) {
            delete s.lockedObjects[childId];
            return;
        }
        const locked = getLockedComponents(childId);
        Object.keys(components).forEach(c => locked.delete(c));
        if (locked.size === 0) delete s.lockedObjects[childId];
    };

    /**
     * Return true if the given component is locked for this child.
     */
    const isComponentLocked = (childId, component) =>
        getLockedComponents(childId).has(component);

    /**
     * Return true if ANY component is locked for this child.
     */
    const isAnyComponentLocked = (childId) =>
        getLockedComponents(childId).size > 0;

    // -------------------------------------------------------------------------
    // Tracking helpers (add/remove/replace tracked components)
    // -------------------------------------------------------------------------

    /**
     * Add component tracking to an existing child relationship.
     * Records the current live relative state for each new component.
     * Preserves all existing tracked component offsets.
     */
    const addTrackedComponents = (childId, components) => {
        const s = state[SCRIPT_NAME];
        const existing = s.anchorInfoByChildId[childId];
        if (!existing) return; // not anchored

        // Compute fresh info for just the new components
        const freshInfo = computeAnchorInfo(existing.anchor_id, childId, components);
        if (!freshInfo) return;

        // Merge new component data into existing info
        Object.keys(components).forEach(c => {
            // Map component name to the actual key(s) stored in anchorInfo
            switch(c) {
                case 'left':     if ('left'        in freshInfo) existing.left        = freshInfo.left;        break;
                case 'top':      if ('top'         in freshInfo) existing.top         = freshInfo.top;         break;
                case 'rotation': if ('rotation'    in freshInfo) existing.rotation    = freshInfo.rotation;    break;
                case 'width':    if ('widthRatio'  in freshInfo) existing.widthRatio  = freshInfo.widthRatio;  break;
                case 'height':   if ('heightRatio' in freshInfo) existing.heightRatio = freshInfo.heightRatio; break;
                case 'layer':    if ('layerOffset' in freshInfo) existing.layerOffset = freshInfo.layerOffset; break;
                case 'flipv':    if ('flipv'       in freshInfo) existing.flipv       = freshInfo.flipv;       break;
                case 'fliph':    if ('fliph'       in freshInfo) existing.fliph       = freshInfo.fliph;       break;
                case 'zorder':
                    existing.zorder = true;
                    registerChildZOrder(existing.anchor_id, childId);
                    break;
            }
        });
    };

    /**
     * Remove component tracking from an existing child relationship.
     * Deletes the stored offset data for those components.
     */
    const removeTrackedComponents = (childId, components) => {
        const s = state[SCRIPT_NAME];
        const existing = s.anchorInfoByChildId[childId];
        if (!existing) return;

        Object.keys(components).forEach(c => {
            switch(c) {
                case 'left':     delete existing.left;        break;
                case 'top':      delete existing.top;         break;
                case 'rotation': delete existing.rotation;    break;
                case 'width':    delete existing.widthRatio;  break;
                case 'height':   delete existing.heightRatio; break;
                case 'layer':    delete existing.layerOffset; break;
                case 'flipv':    delete existing.flipv;       break;
                case 'fliph':    delete existing.fliph;       break;
                case 'zorder':
                    delete existing.zorder;
                    // Remove from z-order lists
                    if (s.anchorZOrder && s.anchorZOrder[existing.anchor_id]) {
                        const lists = s.anchorZOrder[existing.anchor_id];
                        lists.front = lists.front.filter(id => id !== childId);
                        lists.back  = lists.back.filter(id => id !== childId);
                    }
                    break;
            }
        });
    };

    /**
     * Set or remove the anchor relationship for a single child.
     * Pass anchorId = undefined to remove.
     * Pass components = undefined when removing (ignored in that case).
     */
    const setAnchor = (childId, anchorId, components) => {
        if (!childId) return;
        const s = state[SCRIPT_NAME];

        // Detach from any previous anchor
        const existingInfo = s.anchorInfoByChildId[childId];
        if (existingInfo) {
            detachChildFromAnchor(childId, existingInfo.anchor_id);
        }

        if (!anchorId || childId === anchorId) {
            // Remove relationship entirely
            delete s.anchorInfoByChildId[childId];
            if (!(childId in s.anchorChildrenByAnchorId)) {
                delete s.objectStates[childId];
            }
            delete s.lockedObjects[childId];
            return;
        }

        const info = computeAnchorInfo(anchorId, childId, components);
        if (!info) return;

        s.anchorInfoByChildId[childId] = info;
        s.anchorChildrenByAnchorId[anchorId] = s.anchorChildrenByAnchorId[anchorId] || {};
        s.anchorChildrenByAnchorId[anchorId][childId] = childId;

        // If z-order tracking is requested, register child into the anchor's
        // front/back lists based on current live z-position.
        if (components.zorder) {
            registerChildZOrder(anchorId, childId);
        }
    };

    /**
     * Read the live _zorder for the anchor's page and insert childId into
     * the anchor's front[] or back[] list at the correct position relative
     * to the anchor and any already-registered z-ordered children.
     */
    const registerChildZOrder = (anchorId, childId) => {
        const s = state[SCRIPT_NAME];
        const anchor = getObj('graphic', anchorId);
        const child  = getObj('graphic', childId);
        if (!anchor || !child) return;

        const pageId  = anchor.get('_pageid');
        const page    = getObj('page', pageId);
        if (!page) return;

        const zorder  = page.get('_zorder').split(',');
        const aIdx    = zorder.indexOf(anchorId);
        const cIdx    = zorder.indexOf(childId);
        if (aIdx === -1 || cIdx === -1) return;

        // Ensure the anchor has z-order lists
        s.anchorZOrder = s.anchorZOrder || {};
        s.anchorZOrder[anchorId] = s.anchorZOrder[anchorId] || { front: [], back: [] };
        const lists = s.anchorZOrder[anchorId];

        // Remove from both lists in case of re-registration
        lists.front = lists.front.filter(id => id !== childId);
        lists.back  = lists.back.filter(id => id !== childId);

        if (cIdx > aIdx) {
            // Child is in front of anchor — insert into front[] maintaining order
            // front[] is ordered front-to-back (highest index first)
            let inserted = false;
            for (let i = 0; i < lists.front.length; i++) {
                const existingIdx = zorder.indexOf(lists.front[i]);
                if (cIdx > existingIdx) {
                    lists.front.splice(i, 0, childId);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) lists.front.push(childId);
        } else {
            // Child is behind anchor — insert into back[] maintaining order
            // back[] is ordered front-to-back (highest index first)
            let inserted = false;
            for (let i = 0; i < lists.back.length; i++) {
                const existingIdx = zorder.indexOf(lists.back[i]);
                if (cIdx > existingIdx) {
                    lists.back.splice(i, 0, childId);
                    inserted = true;
                    break;
                }
            }
            if (!inserted) lists.back.push(childId);
        }
    };

    /**
     * Establish anchor for multiple children at once, also ensuring objectStates
     * are initialised for anchor and all children.
     */
    const setAnchors = (anchorId, childIds, components) => {
        ensureObjState(anchorId);
        childIds.forEach(id => ensureObjState(id));
        childIds.forEach(id => setAnchor(id, anchorId, components));
    };

    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // Auto-created anchor token
    // -------------------------------------------------------------------------

    /**
     * Create a new invisible anchor graphic at the position of referenceObj
     * (or the centre of the current player page if referenceObj is undefined).
     *
     * Made invisible via tint_color:"transparent" and isdrawing:true so it
     * stays out of the turn tracker and targeting systems. A GM-only cyan
     * aura (radius 0, square) gives the GM a visible click target.
     *
     * No imgsrc is set — Roll20 renders a plain square hidden by the tint.
     * Portable: works for any user without requiring an image upload.
     *
     * Returns the new graphic object, or undefined on failure.
     */
    const createAnchorToken = (referenceObj) => {
        const c = cfg();
        const pageId = referenceObj
            ? referenceObj.get('_pageid')
            : Campaign().get('playerpageid');
        const left = referenceObj ? referenceObj.get('left') : 0;
        const top  = referenceObj ? referenceObj.get('top')  : 0;

        // Create with only the properties Roll20 reliably accepts at creation time.
        // Aura and visibility properties are applied via .set() immediately after
        // to avoid silent creation failures from unrecognised attributes.
        const token = createObj('graphic', {
            pageid:   pageId,
            left:     left,
            top:      top,
            width:    c.defaultAnchorSize,
            height:   c.defaultAnchorSize,
            layer:    c.defaultAnchorLayer,
            name:     c.defaultAnchorName,
            // A transparent 1×1 PNG from the script author's Roll20 library.
            // Roll20 requires a valid imgsrc to render the token at all —
            // without it the token exists in the data model but is invisible
            // and unselectable. The tint_color below then hides the image.
            // Per Roll20 docs, images from the author's library work for all users.
            imgsrc:   c.defaultAnchorImgsrc,
        });

        if (!token) {
            log(`${SCRIPT_NAME}: createObj failed — could not create anchor token on page ${pageId}`);
            return undefined;
        }

        // Apply additional properties after creation.
        // NOTE: isdrawing intentionally omitted for now — it prevents token
        // selection with the token tool and hides it from Ctrl+A on token layer.
        token.set({
            tint_color:        'transparent',
            // isdrawing intentionally omitted — marks token as drawing which
            // prevents selection with the token tool and hides it from Ctrl+A
            showname:          false,
            controlledby:      '',
            aura1_radius:      c.defaultAnchorAuraVisible ? '0' : '',
            aura1_color:       c.defaultAnchorAuraColor,
            aura1_square:      true,
            showplayers_aura1: false,
            playersedit_aura1: false,
        });

        return token;
    };

    // Transform application
    // -------------------------------------------------------------------------

    /**
     * Apply the anchor's current transform to a single child.
     * If onlyComponents is provided, only those components are applied.
     * Otherwise, all tracked but UNLOCKED components are applied.
     */
    const applyAnchorToChild = (childId, onlyComponents, visited) => {
        if (!visited) visited = new Set();
        if (visited.has(childId)) return;
        visited.add(childId);

        const s = state[SCRIPT_NAME];
        const info = s.anchorInfoByChildId[childId];
        if (!info) { setAnchor(childId, undefined); return; }

        const child  = getObj('graphic', childId);
        const anchor = getObj('graphic', info.anchor_id);

        if (!anchor) { setAnchor(childId, undefined); return; }
        if (!child)  { setAnchor(childId, undefined); return; }

        // Determine which components to apply:
        // If onlyComponents provided, use that. Otherwise apply all tracked
        // components that are not locked.
        const locked = getLockedComponents(childId);
        const shouldApply = (component) => {
            if (onlyComponents) return component in onlyComponents;
            return !locked.has(component);
        };

        const updates = {};

        if (('left' in info || 'top' in info) && (shouldApply('left') || shouldApply('top'))) {
            const anchorTransform = buildTransform(
                anchor.get('left'), anchor.get('top'), anchor.get('rotation')
            );

            // Mirror offsets when flip components are tracked and anchor is flipped.
            // fliph flips the anchor horizontally → mirror the x (left) offset.
            // flipv flips the anchor vertically   → mirror the y (top) offset.
            const aFlipH = anchor.get('fliph');
            const aFlipV = anchor.get('flipv');
            const localLeft = ('left' in info)
                ? (('fliph' in info) && aFlipH ? -(info.left) : info.left)
                : 0;
            const localTop  = ('top' in info)
                ? (('flipv' in info) && aFlipV ? -(info.top)  : info.top)
                : 0;

            const childWorld = MatrixMath.multiply(
                anchorTransform,
                MatrixMath.translate([localLeft, localTop])
            );
            if ('left' in info && shouldApply('left'))  updates.left  = childWorld[2][0];
            if ('top'  in info && shouldApply('top'))   updates.top   = childWorld[2][1];
        }

        if ('rotation' in info && shouldApply('rotation')) {
            updates.rotation = normDeg(anchor.get('rotation') + info.rotation);
        }

        if ('widthRatio' in info && shouldApply('width')) {
            updates.width = anchor.get('width') * info.widthRatio;
        }

        if ('heightRatio' in info && shouldApply('height')) {
            updates.height = anchor.get('height') * info.heightRatio;
        }

        if ('layerOffset' in info && shouldApply('layer')) {
            // Only propagate layer when it has actually changed on the anchor
            // (not on every positional update). This prevents auto-created anchors
            // on the GM layer from pulling children to that layer.
            const prevState = s.objectStates[info.anchor_id];
            const anchorLayer = anchor.get('layer');
            if (prevState && prevState.layer !== anchorLayer) {
                updates.layer = anchorLayer;
            }
        }

        if ('flipv' in info && shouldApply('flipv')) {
            updates.flipv = info.flipv ? !anchor.get('flipv') : anchor.get('flipv');
        }

        if ('fliph' in info && shouldApply('fliph')) {
            updates.fliph = info.fliph ? !anchor.get('fliph') : anchor.get('fliph');
        }

        child.set(updates);

        // Update snapshot to reflect the new position
        if (s.objectStates[childId]) {
            Object.assign(s.objectStates[childId], updates);
        }

        // Propagate to this child's own children (if it is also an anchor)
        if (childId in s.anchorChildrenByAnchorId) {
            Object.keys(s.anchorChildrenByAnchorId[childId])
                  .forEach(grandchildId => applyAnchorToChild(grandchildId, undefined, visited));
        }
    };

    /**
     * Restack all z-order-tracked children relative to the anchor.
     * Call this after moving the anchor in z-order (e.g. via EasyReZorder).
     *
     * Stack order built by calling toFront back-to-front:
     *   last of back[], ..., first of back[], anchor, last of front[], ..., first of front[]
     * Result from front to back: front[0], front[1], ..., anchor, back[0], back[1], ...
     */
    const applyZOrderToChildren = (anchorId) => {
        const s = state[SCRIPT_NAME];
        if (!s.anchorZOrder || !s.anchorZOrder[anchorId]) return;

        const { front, back } = s.anchorZOrder[anchorId];
        const anchor = getObj('graphic', anchorId);
        if (!anchor) return;

        // Call toFront in back-to-front build order:
        // deepest back children first, then shallower back, then anchor, then front
        const buildOrder = [...back].reverse()
            .concat([anchorId])
            .concat([...front].reverse());

        buildOrder.forEach(id => {
            const obj = id === anchorId ? anchor : getObj('graphic', id);
            if (obj) toFront(obj);
        });
    };

    /**
     * Called when a graphic changes. Handles two cases:
     *
     *   1. The changed object is an ANCHOR — propagate its new transform to
     *      all unlocked children. Locked children are skipped here; pollUpdates
     *      enforces their position every tick instead.
     *
     *   2. The changed object is an UNLOCKED CHILD — the GM has manually
     *      repositioned it, so re-record its new offset relative to its anchor.
     *      Locked children are intentionally ignored here; pollUpdates will
     *      undo any manual move on the next tick.
     *
     * childImmediateUpdate: when true, offset re-recording happens synchronously
     * (used by the public API after programmatic moves). When false it is deferred
     * via setTimeout so Roll20's own position-settling can complete first.
     */
    const onObjectChanged = (obj, _prev, childImmediateUpdate = false) => {
        if (!obj) return;
        const s = state[SCRIPT_NAME];
        const id = obj.get('id');

        // Case 1: changed object is a child — re-record offsets for unlocked components.
        // If ALL tracked components are locked, skip entirely (poll handles enforcement).
        if (id in s.anchorInfoByChildId) {
            const info = s.anchorInfoByChildId[id];
            const locked = getLockedComponents(id);
            // Determine which tracked components are not locked
            const trackedComponents = getTrackedComponentsFromInfo(info);
            const unlockedTracked = Object.fromEntries(
                Object.keys(trackedComponents).filter(c => !locked.has(c)).map(c => [c, true])
            );
            if (Object.keys(unlockedTracked).length > 0) {
                const recordOffset = () => {
                    const newInfo = computeAnchorInfo(info.anchor_id, id, unlockedTracked);
                    if (newInfo) {
                        // Merge only unlocked component data back in
                        Object.assign(s.anchorInfoByChildId[id], newInfo);
                    }
                };
                childImmediateUpdate ? recordOffset() : setTimeout(recordOffset, 0);
            }
        }

        // Case 2: changed object is an anchor — push to children for their unlocked components
        if (id in s.anchorChildrenByAnchorId) {
            const visited = new Set([id]);
            Object.keys(s.anchorChildrenByAnchorId[id])
                  .forEach(childId => applyAnchorToChild(childId, undefined, visited));
        }

        refreshObjState(obj);
    };

    const onObjectChangedImmediate = (obj) => onObjectChanged(obj, undefined, true);

    // -------------------------------------------------------------------------
    // Polling
    // -------------------------------------------------------------------------

    /**
     * Poll for position changes that the change:graphic events may have missed
     * (e.g. bulk moves, map imports). Also enforces locked-child positions.
     *
     * Lock semantics:
     *   LOCKED   — child is frozen relative to anchor; any manual move is undone
     *              every poll tick by re-applying the stored anchor transform.
     *   UNLOCKED — child follows anchor on change events normally, and if the
     *              child is manually moved the new relative offset is recorded.
     */
    const pollUpdates = () => {
        const s = state[SCRIPT_NAME];

        // Process any pending anchor setups (fallback for add:graphic not firing)
        Object.keys(s.pendingAnchors).forEach(anchorId => {
            if (!isValidGraphic(anchorId)) return;
            const pending = s.pendingAnchors[anchorId];
            delete s.pendingAnchors[anchorId];
            setAnchors(anchorId, pending.childIds, pending.components);
        });

        // Enforce locked children: for each child with any locked components,
        // re-apply just the locked tracked components to undo any manual moves.
        Object.keys(s.lockedObjects).forEach(id => {
            if (!(id in s.anchorInfoByChildId)) return;
            const info   = s.anchorInfoByChildId[id];
            const locked = getLockedComponents(id);
            const tracked = getTrackedComponentsFromInfo(info);
            // Only enforce components that are both tracked AND locked
            const lockedTracked = Object.fromEntries(
                Object.keys(tracked).filter(c => locked.has(c)).map(c => [c, true])
            );
            if (Object.keys(lockedTracked).length > 0) {
                applyAnchorToChild(id, lockedTracked);
            }
        });

        // Detect external changes by comparing live values to snapshot
        Object.entries(s.objectStates).forEach(([id, snap]) => {
            const obj = getObj('graphic', id);
            if (!obj) {
                delete s.objectStates[id];
                return;
            }
            const live = snapshotObj(obj);
            const changed = Object.keys(COMPONENTS).some(k => live[k] !== snap[k]);
            if (changed) onObjectChanged(obj, snap);
        });
    };

    // -------------------------------------------------------------------------
    // Cleanup
    // -------------------------------------------------------------------------

    /**
     * Remove all state entries that reference non-existent graphics.
     * Called on ready and can be triggered manually.
     */
    const cleanInvalidEntries = () => {
        const s = state[SCRIPT_NAME];

        // Clean anchorChildrenByAnchorId: remove bad anchor IDs and bad children
        Object.keys(s.anchorChildrenByAnchorId).forEach(anchorId => {
            if (!isValidGraphic(anchorId)) {
                delete s.anchorChildrenByAnchorId[anchorId];
                return;
            }
            Object.keys(s.anchorChildrenByAnchorId[anchorId]).forEach(childId => {
                if (!isValidGraphic(childId))
                    delete s.anchorChildrenByAnchorId[anchorId][childId];
            });
            if (Object.keys(s.anchorChildrenByAnchorId[anchorId]).length === 0)
                delete s.anchorChildrenByAnchorId[anchorId];
        });

        // Clean anchorInfoByChildId
        Object.keys(s.anchorInfoByChildId).forEach(childId => {
            const info = s.anchorInfoByChildId[childId];
            if (!isValidGraphic(childId) ||
                !info ||
                !isValidGraphic(info.anchor_id) ||
                !(info.anchor_id in s.anchorChildrenByAnchorId) ||
                !(childId in s.anchorChildrenByAnchorId[info.anchor_id])
            ) {
                delete s.anchorInfoByChildId[childId];
            }
        });

        // Clean lockedObjects — remove entries for invalid graphics
        // and migrate old flat-value entries to Sets
        Object.keys(s.lockedObjects).forEach(id => {
            if (!isValidGraphic(id)) {
                delete s.lockedObjects[id];
                return;
            }
            // Migrate old format (value was just the id string)
            if (!(s.lockedObjects[id] instanceof Set)) {
                s.lockedObjects[id] = new Set(
                    typeof s.lockedObjects[id] === 'object'
                        ? Object.keys(s.lockedObjects[id])
                        : []
                );
            }
            // Remove empty sets
            if (s.lockedObjects[id].size === 0) delete s.lockedObjects[id];
        });

        // Clean objectStates: keep only objects that are active anchors or children
        Object.keys(s.objectStates).forEach(id => {
            if (!isValidGraphic(id) ||
                (!(id in s.anchorInfoByChildId) && !(id in s.anchorChildrenByAnchorId))
            ) {
                delete s.objectStates[id];
            }
        });

        // Clean autoCreatedAnchors
        Object.keys(s.autoCreatedAnchors).forEach(id => {
            if (!isValidGraphic(id)) delete s.autoCreatedAnchors[id];
        });

        // Clean pendingAnchors: remove entries whose anchor token no longer exists
        // and filter out any child IDs that are no longer valid
        Object.keys(s.pendingAnchors).forEach(anchorId => {
            if (!isValidGraphic(anchorId)) {
                delete s.pendingAnchors[anchorId];
                return;
            }
            s.pendingAnchors[anchorId].childIds =
                s.pendingAnchors[anchorId].childIds.filter(isValidGraphic);
            if (s.pendingAnchors[anchorId].childIds.length === 0) {
                delete s.pendingAnchors[anchorId];
            }
        });

        // Clean anchorZOrder: remove entries for invalid anchors or invalid children
        Object.keys(s.anchorZOrder).forEach(anchorId => {
            if (!isValidGraphic(anchorId)) {
                delete s.anchorZOrder[anchorId];
                return;
            }
            const lists = s.anchorZOrder[anchorId];
            lists.front = lists.front.filter(isValidGraphic);
            lists.back  = lists.back.filter(isValidGraphic);
            if (lists.front.length === 0 && lists.back.length === 0) {
                delete s.anchorZOrder[anchorId];
            }
        });
    };

    // -------------------------------------------------------------------------
    // Event: destroy
    // -------------------------------------------------------------------------

    const onAddGraphic = (obj) => {
        const s = state[SCRIPT_NAME];
        const id = obj.get('id');
        const pending = s.pendingAnchors[id];
        if (!pending) return;

        delete s.pendingAnchors[id];
        setAnchors(id, pending.childIds, pending.components);
    };

    const onDestroyObject = (obj) => {
        const s = state[SCRIPT_NAME];
        const id = obj.get('id');

        // If destroyed object was a child, detach it (may trigger auto-destroy
        // of its anchor if that anchor is auto-created and now childless)
        if (id in s.anchorInfoByChildId) {
            const anchorId = s.anchorInfoByChildId[id].anchor_id;
            detachChildFromAnchor(id, anchorId);
            delete s.anchorInfoByChildId[id];
        }

        // If the destroyed object was itself an auto-created anchor, clean up
        if (id in s.autoCreatedAnchors) {
            delete s.autoCreatedAnchors[id];
        }

        // If destroyed object was an anchor, release all its children
        if (id in s.anchorChildrenByAnchorId) {
            Object.keys(s.anchorChildrenByAnchorId[id])
                  .forEach(childId => {
                      delete s.anchorInfoByChildId[childId];
                      if (!(childId in s.anchorChildrenByAnchorId))
                          delete s.objectStates[childId];
                  });
            delete s.anchorChildrenByAnchorId[id];
        }

        delete s.objectStates[id];
    };

    // -------------------------------------------------------------------------
    // Chat command helpers
    // -------------------------------------------------------------------------

    const HELP_TEXT = [
        `<b>${SCRIPT_NAME} v${SCRIPT_VERSION}</b>`,
        '',
        `<b>${CMD_TOKEN} [anchor_id] [flags] [ignore-selected] [child_id...]</b>`,
        'Anchor selected/listed tokens. Auto-creates anchor token if no anchor_id given.',
        'Long form: anchor-all, anchor, anchor-position, anchor-x, anchor-y,',
        'anchor-rotation, anchor-scale, anchor-width, anchor-height, anchor-layer,',
        'anchor-flip, anchor-flipv, anchor-fliph, anchor-z',
        'Short aliases: -all, -pos, -x, -y, -rot, -scale, -w, -h, -layer, -flip, -flipv, -fliph, -z',
        'Default (no flags): position+rotation+scale+flip. anchor-all/-all adds layer+z-order.',
        '',
        'Add <b>persist</b> flag to keep an auto-created anchor token even when childless.',
        '',
        `<b>${CMD_TOKEN} remove [ignore-selected] [child_id...]</b>`,
        'Remove anchor from tokens.',
        '',
        `<b>${CMD_TOKEN} lock [component flags] [ignore-selected] [child_id...]</b>`,
        'Lock components — re-enforced every poll tick. No flags = lock all.',
        'Untracked components are pre-locked (activate when tracking is added).',
        '',
        `<b>${CMD_TOKEN} unlock [component flags] [ignore-selected] [child_id...]</b>`,
        'Unlock components. No flags = unlock all.',
        '',
        `<b>${CMD_TOKEN} track [component flags] [ignore-selected] [child_id...]</b>`,
        'Add tracking to existing relationship (records current relative state).',
        '',
        `<b>${CMD_TOKEN} untrack [component flags] [ignore-selected] [child_id...]</b>`,
        'Remove tracking. Does not affect locked state.',
        '',
        `<b>${CMD_TOKEN} retrack [component flags] [ignore-selected] [child_id...]</b>`,
        'Replace tracked set entirely. No flags = default set.',
        '',
        `<b>${CMD_TOKEN} center [ignore-selected] [child_id...]</b>`,
        'Snap child(ren) to anchor centre (0 offset, 0 rotation, 1:1 scale).',
        '',
        `<b>${CMD_TOKEN} chain [component flags] [ignore-selected] [child_id...]</b>`,
        'Mutually anchor tokens in a ring (A\u2192B, B\u2192C, C\u2192A). Move any one, all follow.',
        '',
        `<b>${CMD_TOKEN} unchain [ignore-selected] [child_id...]</b>`,
        'Dissolve a chain ring. Select any one token in the ring.',
        '',
        `<b>${CMD_TOKEN} update [ignore-selected] [child_id...]</b>`,
        'Force immediate transform sync.',
        '',
        `<b>${CMD_TOKEN} info [ignore-selected] [child_id...]</b>`,
        'Show anchor state for token(s).',
        '',
        `<b>${CMD_TOKEN} config [key value] [reset]</b>`,
        'View or change configuration. Keys: poll-interval, default-anchor-layer,',
        'default-anchor-size, default-anchor-name, default-anchor-aura-color,',
        'default-anchor-aura-visible, allow-player-use. Use reset to clear runtime overrides.',
    ].join('<br>');

    /**
     * Parse a flat args array into { flags: Set, otherArgs: string[] }.
     * Recognised command flags are pulled out; everything else stays in otherArgs.
     */
    const parseArgs = (argsArray) => {
        const flags     = new Set();
        const otherArgs = [];
        argsArray.forEach(arg => {
            // Resolve short aliases to their canonical long-form flag
            const canonical = ALIAS_MAP[arg] || arg;
            if (ALL_COMMAND_FLAGS.includes(canonical)) flags.add(canonical);
            else otherArgs.push(arg);
        });
        return { flags, otherArgs };
    };

    /**
     * Determine which COMPONENTS are being anchored based on the set of flags.
     * If no component flags are present, defaults to DEFAULT_COMPONENTS (all
     * except zorder). Use anchor-all / -all to include zorder.
     */
    const resolveComponents = (flags) => {
        const anchorFlags = Object.keys(FLAG_EXPANSIONS).filter(f => flags.has(f));
        if (anchorFlags.length === 0) {
            // No explicit component flags → use default set (no zorder)
            return Object.fromEntries(DEFAULT_COMPONENTS.map(k => [k, true]));
        }
        const active = {};
        anchorFlags.forEach(f => FLAG_EXPANSIONS[f].forEach(c => (active[c] = true)));
        return active;
    };

    /**
     * Like resolveComponents but returns null (not the default set) when no
     * component flags are present. Used by lock/unlock where "no flags" means
     * "operate on all components" rather than "use default set".
     */
    const resolveComponentsOrNone = (flags) => {
        const anchorFlags = Object.keys(FLAG_EXPANSIONS).filter(f => flags.has(f));
        if (anchorFlags.length === 0) return null;
        const active = {};
        anchorFlags.forEach(f => FLAG_EXPANSIONS[f].forEach(c => (active[c] = true)));
        return active;
    };

    /**
     * Resolve the list of child IDs from the message context.
     * Combines selected tokens (unless ignore-selected) with explicitly listed IDs.
     */
    const resolveChildIds = (msg, flags, otherArgs) => {
        const fromSelected = flags.has('ignore-selected')
            ? []
            : (msg.selected || []).map(s => s._id);
        return [...fromSelected, ...otherArgs].filter(isValidGraphic);
    };

    // -------------------------------------------------------------------------
    // Info display
    // -------------------------------------------------------------------------

    const showInfo = (msg, id) => {
        const s     = state[SCRIPT_NAME];
        const isChild  = id in s.anchorInfoByChildId;
        const isAnchor = id in s.anchorChildrenByAnchorId;
        const info     = isChild ? s.anchorInfoByChildId[id] : null;

        let out = `<b>Token:</b> ${id}<br>`;
        out += `<b>Anchor:</b> ${info ? info.anchor_id : 'None'}<br>`;

        if (isChild && info) {
            const locked  = getLockedComponents(id);
            const tracked = getTrackedComponentsFromInfo(info);

            // Build tracked component display with lock status and stored values
            const trackedDisplay = [];
            if ('left' in info || 'top' in info) {
                const locL = locked.has('left');
                const locT = locked.has('top');
                const lockStr = (locL && locT) ? ' 🔒' : locL ? ' (x🔒)' : locT ? ' (y🔒)' : '';
                trackedDisplay.push(`pos (${(info.left||0).toFixed(1)}, ${(info.top||0).toFixed(1)})${lockStr}`);
            }
            if ('rotation' in info) {
                trackedDisplay.push(`rot ${info.rotation.toFixed(1)}°${locked.has('rotation') ? ' 🔒' : ''}`);
            }
            if ('widthRatio' in info) {
                trackedDisplay.push(`w×${info.widthRatio.toFixed(3)}${locked.has('width') ? ' 🔒' : ''}`);
            }
            if ('heightRatio' in info) {
                trackedDisplay.push(`h×${info.heightRatio.toFixed(3)}${locked.has('height') ? ' 🔒' : ''}`);
            }
            if ('layerOffset' in info) {
                trackedDisplay.push(`layer${locked.has('layer') ? ' 🔒' : ''}`);
            }
            if ('flipv' in info) {
                trackedDisplay.push(`flipv(${info.flipv ? 'flipped' : 'same'})${locked.has('flipv') ? ' 🔒' : ''}`);
            }
            if ('fliph' in info) {
                trackedDisplay.push(`fliph(${info.fliph ? 'flipped' : 'same'})${locked.has('fliph') ? ' 🔒' : ''}`);
            }
            if ('zorder' in info) {
                trackedDisplay.push(`z-order${locked.has('zorder') ? ' 🔒' : ''}`);
            }
            out += `<b>Tracked:</b> ${trackedDisplay.join(', ') || 'none'}<br>`;

            // Pre-locked: locked but not tracked
            const preLocked = [...locked].filter(c => !(c in tracked));
            if (preLocked.length > 0) {
                out += `<b>Pre-locked (untracked):</b> ${preLocked.join(', ')}<br>`;
            }
        }

        if (isAnchor) {
            const childIds = Object.keys(s.anchorChildrenByAnchorId[id]);
            out += `<b>Children:</b> ${childIds.join(', ')}<br>`;
            if (s.anchorZOrder && s.anchorZOrder[id]) {
                const { front, back } = s.anchorZOrder[id];
                if (front.length > 0) out += `<b>Z-front (front→back):</b> ${front.join(', ')}<br>`;
                if (back.length > 0)  out += `<b>Z-back (front→back):</b> ${back.join(', ')}<br>`;
            }
        }

        const isAutoCreated = id in s.autoCreatedAnchors;
        if (isAutoCreated) out += `<b>Auto-created:</b> yes (will auto-destroy when childless)<br>`;

        reply(msg, 'Info', out);
    };

    // -------------------------------------------------------------------------
    // Config commands
    // -------------------------------------------------------------------------

    const showConfig = (msg) => {
        const c = cfg();
        const lines = [
            `<b>poll-interval:</b> ${c.pollIntervalMs}ms`,
            `<b>default-anchor-layer:</b> ${c.defaultAnchorLayer}`,
            `<b>default-anchor-size:</b> ${c.defaultAnchorSize}px`,
            `<b>default-anchor-name:</b> ${c.defaultAnchorName}`,
            `<b>default-anchor-imgsrc:</b> ${c.defaultAnchorImgsrc ? '(set)' : '(not set)'}`,
            `<b>default-anchor-aura-color:</b> ${c.defaultAnchorAuraColor}`,
            `<b>default-anchor-aura-visible:</b> ${c.defaultAnchorAuraVisible}`,
            `<b>allow-player-use:</b> ${c.allowPlayerUse}`,
        ];
        reply(msg, 'Config', lines.join('<br>'));
    };

    const handleConfig = (msg, otherArgs) => {
        const c = cfg();

        if (otherArgs.length === 0) { showConfig(msg); return; }
        if (otherArgs[0] === 'reset') {
            // Delete the state config entirely so checkInstall rebuilds it
            // from DEFAULTS + globalconfig on next sandbox restart.
            // For immediate effect, also reassign from DEFAULTS now.
            delete state[SCRIPT_NAME].config;
            state[SCRIPT_NAME].config = Object.assign({}, DEFAULTS);
            reply(msg, 'Config', 'Runtime config cleared. Values now reflect API Scripts page settings (or built-in defaults). Restart the sandbox to fully re-apply useroptions.');
            showConfig(msg);
            return;
        }

        const sub = otherArgs[0];
        const val = otherArgs[1];

        if (sub === 'poll-interval') {
            const ms = parseInt(val, 10);
            if (isNaN(ms) || ms < 100) {
                reply(msg, 'Config', 'poll-interval must be a number ≥ 100.');
                return;
            }
            c.pollIntervalMs = ms;
            reply(msg, 'Config', `poll-interval set to ${ms}ms. Note: restart the API sandbox for the new interval to take effect.`);
            return;
        }

        if (sub === 'default-anchor-layer') {
            const valid = ['gmlayer', 'objects', 'map'];
            if (!valid.includes(val)) {
                reply(msg, 'Config', `default-anchor-layer must be one of: ${valid.join(', ')}`);
                return;
            }
            c.defaultAnchorLayer = val;
            reply(msg, 'Config', `default-anchor-layer set to ${val}.`);
            return;
        }

        if (sub === 'default-anchor-size') {
            const px = parseInt(val, 10);
            if (isNaN(px) || px < 1) {
                reply(msg, 'Config', 'default-anchor-size must be a positive integer.');
                return;
            }
            c.defaultAnchorSize = px;
            reply(msg, 'Config', `default-anchor-size set to ${px}px.`);
            return;
        }

        if (sub === 'default-anchor-name') {
            if (!val) {
                reply(msg, 'Config', 'default-anchor-name requires a value.');
                return;
            }
            c.defaultAnchorName = val;
            reply(msg, 'Config', `default-anchor-name set to "${val}".`);
            return;
        }

        if (sub === 'default-anchor-imgsrc') {
            if (!val) {
                reply(msg, 'Config', 'default-anchor-imgsrc requires a value — either a relative Roll20 path (e.g. /images/character.png) or a thumb URL from your Roll20 library.');
                return;
            }
            c.defaultAnchorImgsrc = val;
            reply(msg, 'Config', `default-anchor-imgsrc set.`);
            return;
        }

        if (sub === 'default-anchor-aura-color') {
            if (!val || !/^#[0-9a-fA-F]{6}$/.test(val)) {
                reply(msg, 'Config', 'default-anchor-aura-color must be a hex color (e.g. #00ffff).');
                return;
            }
            c.defaultAnchorAuraColor = val;
            reply(msg, 'Config', `default-anchor-aura-color set to ${val}.`);
            return;
        }

        if (sub === 'default-anchor-aura-visible') {
            if (val !== 'true' && val !== 'false') {
                reply(msg, 'Config', 'default-anchor-aura-visible must be true or false.');
                return;
            }
            c.defaultAnchorAuraVisible = val === 'true';
            reply(msg, 'Config', `default-anchor-aura-visible set to ${val}.`);
            return;
        }

        if (sub === 'allow-player-use') {
            if (val !== 'true' && val !== 'false') {
                reply(msg, 'Config', 'allow-player-use must be true or false.');
                return;
            }
            c.allowPlayerUse = val === 'true';
            reply(msg, 'Config', `allow-player-use set to ${val}.`);
            return;
        }

        const validKeys = [
            'poll-interval', 'default-anchor-layer', 'default-anchor-size',
            'default-anchor-name', 'default-anchor-imgsrc',
            'default-anchor-aura-color', 'default-anchor-aura-visible',
            'allow-player-use', 'reset',
        ];
        reply(msg, 'Config', `Unknown config key: ${sub}. Valid keys: ${validKeys.join(', ')}`);
    };

    // -------------------------------------------------------------------------
    // Main command handler
    // -------------------------------------------------------------------------

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        // Must start with the command token
        if (msg.content.split(' ')[0] !== CMD_TOKEN) return;

        try {
            const rawArgs  = msg.content.slice(CMD_TOKEN.length).split(' ').filter(Boolean);
            const { flags, otherArgs } = parseArgs(rawArgs);

            const isGM = playerIsGM(msg.playerid);

            // Non-GMs are blocked entirely unless allowPlayerUse is on.
            // Even with allowPlayerUse, non-GMs cannot change config or
            // create/remove anchor relationships — only info/lock/unlock/update/center
            // on tokens they control.
            if (!isGM && !cfg().allowPlayerUse) {
                reply(msg, 'Error', 'Only the GM can use Anchor commands.');
                return;
            }

            if (!isGM && (flags.has('config') || flags.has('remove') ||
                          Object.keys(FLAG_EXPANSIONS).some(f => flags.has(f)) ||
                          flags.size === 0)) {
                reply(msg, 'Error', 'Players may only use: lock, unlock, update, center, info.');
                return;
            }

            // --help
            if (flags.has('--help')) {
                reply(msg, HELP_TEXT);
                return;
            }

            // gen-dev-docs
            if (flags.has('gen-dev-docs')) {
                const handoutName = `Help: ${SCRIPT_NAME}/Scripting API`;
                let hh = findObjs({ type: 'handout', name: handoutName })[0];
                if (!hh) {
                    hh = createObj('handout', { name: handoutName, inplayerjournals: 'all', archived: false, avatar: 'https://files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385' });
                }
                let html = `<h1>${SCRIPT_NAME} — Scripting API</h1>`;
                html += `<p>Access via <code>Anchor.*</code> after <code>on('ready')</code> fires.</p>`;
                html += `<h2>Querying Relationships</h2>`;
                html += `<pre>Anchor.getAnchor(childId)       // → anchorId or undefined\nAnchor.getChildren(anchorId)    // → [graphic objects]</pre>`;
                html += `<h2>Creating / Removing</h2>`;
                html += `<pre>Anchor.anchorObj(childId, anchorId, components)\nAnchor.createAnchorFor(obj, components, persist)  // → new anchor obj\nAnchor.removeAnchor(childId)</pre>`;
                html += `<h2>Chain Linking</h2>`;
                html += `<pre>Anchor.chainAnchorObjs(ids, components)   // ring-link: A→B, B→C, C→A\nAnchor.unchainAnchorObjs(startId)          // dissolve ring from any member → [ids] or null</pre>`;
                html += `<h2>Position (anchor-local)</h2>`;
                html += `<pre>Anchor.getPosition(obj)           // → [left, top]\nAnchor.setPosition(obj, left, top)</pre>`;
                html += `<h2>Rotation (anchor-local)</h2>`;
                html += `<pre>Anchor.getRotation(obj)           // → degrees\nAnchor.setRotation(obj, degrees)</pre>`;
                html += `<h2>Scale (anchor-local)</h2>`;
                html += `<pre>Anchor.getScale(obj)              // → [widthRatio, heightRatio]\nAnchor.setScale(obj, widthRatio, heightRatio)</pre>`;
                html += `<h2>Flip (relative to parent)</h2>`;
                html += `<pre>Anchor.getFlipV(obj)              // → true (flipped) / false (same) / undefined\nAnchor.setFlipV(obj, flipped)\nAnchor.getFlipH(obj)\nAnchor.setFlipH(obj, flipped)</pre>`;
                html += `<p><b>Semantics:</b> <code>true</code> = flipped relative to parent. Consistent with world-space: an unanchored token with <code>flipv=true</code> is flipped relative to the world origin.</p>`;
                html += `<h2>Z-Order</h2>`;
                html += `<pre>Anchor.getZOffset(obj)            // → number (read-only)</pre>`;
                html += `<p>Call <code>Anchor.updateZOrder(anchorObj)</code> after moving anchor in z-order to propagate.</p>`;
                html += `<h2>Lock / Unlock</h2>`;
                html += `<pre>Anchor.getLocked(obj)             // → ['left','top',...]\nAnchor.getUnlocked(obj)           // → ['rotation',...]\nAnchor.lock(obj, ['left','top'])  // null = lock all\nAnchor.unlock(obj, ['rotation'])  // null = unlock all</pre>`;
                html += `<h2>Forcing Updates</h2>`;
                html += `<pre>Anchor.updateObj(anchorObj)        // sync all children now\nAnchor.updateZOrder(anchorObj)    // restack z-order children</pre>`;
                html += `<h2>Integration with Choreograph</h2>`;
                html += `<p>When Choreograph is loaded, Anchor registers token variables accessible as <code>token.anchor.*</code>:</p>`;
                html += `<ul>`;
                html += `<li><code>parent</code> — anchor token (or null)</li>`;
                html += `<li><code>left</code>, <code>top</code>, <code>rotation</code>, <code>scaleW</code>, <code>scaleH</code> — local-space values</li>`;
                html += `<li><code>flipV</code>, <code>flipH</code> — flip state relative to parent</li>`;
                html += `<li><code>zOffset</code> — z-order offset</li>`;
                html += `<li><code>locked</code>, <code>unlocked</code> — component arrays</li>`;
                html += `<li><code>siblings</code>, <code>children</code> — related token arrays</li>`;
                html += `</ul>`;
                html += `<h2>Integration with Sequence</h2>`;
                html += `<p>When Sequence is loaded, Anchor registers virtual attributes <code>anchor.left</code>, <code>anchor.top</code>, <code>anchor.rotation</code> for animating in anchor-local space.</p>`;
                hh.set('notes', html);
                reply(msg, `Generated <b>${handoutName}</b> — check your journal.`);
                return;
            }

            // config subcommand
            if (flags.has('config')) {
                handleConfig(msg, otherArgs);
                return;
            }

            // Validate: lock and unlock are mutually exclusive
            if (flags.has('lock') && flags.has('unlock')) {
                reply(msg, 'Error', 'lock and unlock cannot be used together.');
                return;
            }

            // Validate: remove cannot be combined with anchor-type flags
            if (flags.has('remove')) {
                const anchorFlags = Object.keys(FLAG_EXPANSIONS).filter(f => flags.has(f));
                if (anchorFlags.length > 0) {
                    reply(msg, 'Error', 'remove cannot be combined with anchor flags.');
                    return;
                }
            }

            // Only skip the first otherArg as a potential anchor ID when we're
            // establishing a new anchor relationship AND it's actually a valid graphic.
            // If there's no valid graphic as the first arg, all otherArgs are child IDs.
            const ACTION_FLAGS = ['remove', 'lock', 'unlock', 'center', 'update', 'info', 'track', 'untrack', 'retrack', 'chain', 'unchain'];
            const hasAction = ACTION_FLAGS.some(f => flags.has(f));
            const isNewAnchor = !hasAction && (Object.keys(FLAG_EXPANSIONS).some(f => flags.has(f)) || flags.has('new') || flags.size === 0);
            const firstArgIsAnchor = isNewAnchor &&
                !flags.has('remove') &&
                otherArgs.length > 0 &&
                isValidGraphic(otherArgs[0]);
            const childArgOffset = firstArgIsAnchor ? 1 : 0;
            const childIds = resolveChildIds(msg, flags, otherArgs.slice(flags.has('remove') ? 0 : childArgOffset));

            // New anchor relationship
            if (isNewAnchor && !flags.has('remove')) {
                // Must have at least one child to anchor
                if (childIds.length === 0) {
                    reply(msg, 'Error', 'Select or specify at least one token to anchor.');
                    return;
                }

                let anchorId;
                let isAutoCreated = false;

                if (otherArgs.length > 0 && isValidGraphic(otherArgs[0])) {
                    // Use the supplied existing token as the anchor
                    anchorId = otherArgs[0];
                } else if (!flags.has('new') && childIds.length > 1) {
                    // Selection-based: first selected = parent, rest = children
                    anchorId = childIds.shift();
                } else if (childIds.length === 1 && getAnchor(childIds[0]) && !flags.has('new')) {
                    // Single token already anchored — modify existing (handled below by lock/track)
                    reply(msg, 'Info', 'Token is already anchored. Use lock/unlock/track/untrack to modify, or <code>new</code> to create a new parent.');
                    return;
                } else {
                    // Auto-create invisible anchor (single selected or --new flag)
                    const refObj = getObj('graphic', childIds[0]);
                    const newToken = createAnchorToken(refObj);
                    if (!newToken) {
                        reply(msg, 'Error', 'Failed to auto-create anchor token. Try providing an existing token ID instead.');
                        return;
                    }
                    anchorId = newToken.get('id');
                    isAutoCreated = !flags.has('persist');
                    if (isAutoCreated) {
                        state[SCRIPT_NAME].autoCreatedAnchors[anchorId] = true;
                    }
                    reply(msg, 'Info',
                        `Created new anchor token: ${anchorId}` +
                        (isAutoCreated ? ' (auto-destroy when last child removed; use persist flag to keep)' : ' (persistent)')
                    );
                }

                const components = resolveComponents(flags);
                if (isAutoCreated) {
                    // Queue the anchor setup to be completed by the permanent
                    // add:graphic handler once Roll20 has fully committed the token.
                    state[SCRIPT_NAME].pendingAnchors[anchorId] = { childIds, components };
                } else {
                    setAnchors(anchorId, childIds, components);
                }
            }

            // Remove
            if (flags.has('remove')) {
                childIds.forEach(id => setAnchor(id, undefined));
            }

            // Center
            if (flags.has('center')) {
                childIds.forEach(id => {
                    const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
                    if (!info) return;
                    if ('left' in info)        info.left        = 0;
                    if ('top' in info)         info.top         = 0;
                    if ('rotation' in info)    info.rotation    = 0;
                    if ('widthRatio' in info)  info.widthRatio  = 1;
                    if ('heightRatio' in info) info.heightRatio = 1;
                    applyAnchorToChild(id);
                });
            }

            // Update (force immediate sync)
            if (flags.has('update')) {
                childIds.forEach(id => onObjectChangedImmediate(getObj('graphic', id)));
            }

            // Lock / unlock — component flags specify which components to lock/unlock.
            // With no component flags: lock/unlock ALL components (tracked + pre-lock).
            if (flags.has('unlock')) {
                const unlockComps = resolveComponentsOrNone(flags);
                childIds.forEach(id => unlockComponents(id, unlockComps));
            } else if (flags.has('lock')) {
                const lockComps = resolveComponentsOrNone(flags);
                childIds.forEach(id => lockComponents(id, lockComps));
            }

            // Track / untrack / retrack — modify which components are tracked
            // on existing anchor relationships without disturbing other offsets.
            if (flags.has('track')) {
                const comps = resolveComponents(flags);
                childIds.forEach(id => {
                    if (!(id in state[SCRIPT_NAME].anchorInfoByChildId)) {
                        reply(msg, 'Error', `${id} is not anchored. Use !anchor to establish a relationship first.`);
                        return;
                    }
                    addTrackedComponents(id, comps);
                });
            }

            if (flags.has('untrack')) {
                const comps = resolveComponents(flags);
                childIds.forEach(id => {
                    if (!(id in state[SCRIPT_NAME].anchorInfoByChildId)) return;
                    removeTrackedComponents(id, comps);
                });
            }

            if (flags.has('retrack')) {
                // Replace the tracked set entirely with the resolved components.
                // No flags = default set (DEFAULT_COMPONENTS).
                const comps = resolveComponents(flags);
                childIds.forEach(id => {
                    if (!(id in state[SCRIPT_NAME].anchorInfoByChildId)) {
                        reply(msg, 'Error', `${id} is not anchored. Use !anchor to establish a relationship first.`);
                        return;
                    }
                    const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
                    const currentTracked = getTrackedComponentsFromInfo(info);
                    // Remove components that are tracked but not in new set
                    const toRemove = Object.fromEntries(
                        Object.keys(currentTracked).filter(c => !(c in comps)).map(c => [c, true])
                    );
                    // Add components that are in new set but not tracked
                    const toAdd = Object.fromEntries(
                        Object.keys(comps).filter(c => !(c in currentTracked)).map(c => [c, true])
                    );
                    if (Object.keys(toRemove).length > 0) removeTrackedComponents(id, toRemove);
                    if (Object.keys(toAdd).length > 0)    addTrackedComponents(id, toAdd);
                });
            }

            // Chain — circular anchor ring: A→B, B→C, C→A
            if (flags.has('chain')) {
                const comps = resolveComponents(flags);
                const ids = resolveChildIds(msg, flags, otherArgs);
                if (ids.length < 2) {
                    reply(msg, 'Error', 'Chain requires at least 2 tokens.');
                } else {
                    chainAnchorObjs(ids, comps);
                    reply(msg, 'Info', 'Chain-linked ' + ids.length + ' tokens in a ring.');
                }
            }

            // Unchain — dissolve a chain ring from any member
            if (flags.has('unchain')) {
                const ids = resolveChildIds(msg, flags, otherArgs);
                if (ids.length === 0) {
                    reply(msg, 'Error', 'Select or specify a token in the chain.');
                } else {
                    var unchained = unchainAnchorObjs(ids[0]);
                    if (unchained) {
                        reply(msg, 'Info', 'Unchained ' + unchained.length + ' tokens.');
                    } else {
                        reply(msg, 'Error', 'Token is not part of a chain ring.');
                    }
                }
            }

            // Info
            if (flags.has('info')) {
                if (childIds.length > 0) {
                    // Explicit selection or specified IDs — show exactly what was asked for
                    childIds.forEach(id => showInfo(msg, id));
                } else {
                    // Nothing selected or specified — show all tracked objects,
                    // but filter to the page the sender is currently viewing.
                    const playerPages = Campaign().get('playerspecificpages');
                    const viewedPageId = (playerPages && playerPages[msg.playerid])
                        || Campaign().get('playerpageid');

                    const s = state[SCRIPT_NAME];
                    const allTracked = new Set([
                        ...Object.keys(s.anchorInfoByChildId),
                        ...Object.keys(s.anchorChildrenByAnchorId),
                    ]);

                    const onViewedPage = [...allTracked].filter(id => {
                        const obj = getObj('graphic', id);
                        return obj && obj.get('_pageid') === viewedPageId;
                    });

                    if (onViewedPage.length === 0) {
                        reply(msg, 'Info', 'No anchor relationships are active on your current page.');
                    } else {
                        onViewedPage.forEach(id => showInfo(msg, id));
                    }
                }
            }

        } catch (err) {
            log(`${SCRIPT_NAME} error in handleInput: ${err}`);
            reply(msg, 'Error', `An internal error occurred: ${err.message}`);
        }
    };

    // -------------------------------------------------------------------------
    // Public API (for use by other scripts, e.g. an animation script)
    // -------------------------------------------------------------------------

    /**
     * Returns the anchor graphic object for `objId`, or undefined if not anchored.
     */
    const getAnchor = (objId) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[objId];
        return info ? getObj('graphic', info.anchor_id) : undefined;
    };

    /**
     * Returns an array of child graphic objects anchored to `objId`.
     */
    const getChildren = (objId) => {
        const children = state[SCRIPT_NAME].anchorChildrenByAnchorId[objId];
        if (!children) return [];
        return Object.keys(children).map(id => getObj('graphic', id)).filter(Boolean);
    };

    /**
     * Programmatically anchor `childId` to `anchorId`.
     * `components` is an optional object like `{ left: true, top: true, rotation: true }`.
     * Defaults to all components if omitted.
     */
    const anchorObj = (childId, anchorId, components) => {
        const resolved = components || Object.fromEntries(Object.keys(COMPONENTS).map(k => [k, true]));
        ensureObjState(anchorId);
        ensureObjState(childId);
        setAnchor(childId, anchorId, resolved);
    };

    /** Remove the anchor relationship from a child object. */
    const removeAnchor = (childId) => setAnchor(childId, undefined);

    /**
     * Mutually anchor a list of token IDs in a ring (A→B, B→C, C→A).
     * Move any one and all others follow.
     * `components` is optional; defaults to all components.
     */
    const chainAnchorObjs = (ids, components) => {
        if (!ids || ids.length < 2) {
            log(SCRIPT_NAME + ': chainAnchorObjs requires at least 2 token IDs.');
            return;
        }
        for (var i = 0; i < ids.length; i++) {
            var nextIdx = (i + 1) % ids.length;
            anchorObj(ids[i], ids[nextIdx], components);
        }
    };

    /**
     * Walk the anchor chain from a starting token and find the ring.
     * Returns the array of IDs forming the ring, or null if no ring found.
     * The starting token does not need to be in the ring itself — if it's
     * a child of a ring member, the ring is still found.
     */
    const walkChain = (startId) => {
        const s = state[SCRIPT_NAME];
        const visited = [];
        var current = startId;
        while (true) {
            var info = s.anchorInfoByChildId[current];
            if (!info) return null; // not a child — dead end, no ring
            visited.push(current);
            var nextId = info.anchor_id;
            var idx = visited.indexOf(nextId);
            if (idx !== -1) return visited.slice(idx); // found the ring
            current = nextId;
            if (visited.length > 1000) return null; // safety cap
        }
    };

    /**
     * Unchain a ring of anchored tokens. Given any token ID in the ring,
     * walks the chain and removes all anchor relationships.
     * Returns the array of unchained IDs, or null if the token is not in a ring.
     */
    const unchainAnchorObjs = (startId) => {
        var ids = walkChain(startId);
        if (!ids) {
            log(SCRIPT_NAME + ': unchainAnchorObjs — token is not part of a chain ring.');
            return null;
        }
        ids.forEach(function(id) { removeAnchor(id); });
        return ids;
    };

    /**
     * Programmatically create an invisible auto-anchor token for `obj` and
     * establish the anchor relationship immediately.
     *
     * Equivalent to the GM running !anchor on the token from chat, but callable
     * from other scripts. The anchor is marked as auto-created and will be
     * destroyed when its last child is removed (same as the chat command).
     *
     * `components` is optional — defaults to DEFAULT_COMPONENTS (no z-order).
     * `persist` (bool, default false) — if true, the anchor token survives
     * becoming childless (same as the persist flag in the chat command).
     *
     * Returns the new anchor graphic object, or undefined on failure.
     */
    const createAnchorFor = (obj, components, persist) => {
        const childId = obj.get('id');
        if (!isValidGraphic(childId)) return undefined;

        const resolved = components || Object.fromEntries(DEFAULT_COMPONENTS.map(k => [k, true]));
        const token = createAnchorToken(obj);
        if (!token) return undefined;

        const anchorId = token.get('id');
        if (!persist) {
            state[SCRIPT_NAME].autoCreatedAnchors[anchorId] = true;
        }

        // Queue via pendingAnchors so setAnchors runs after Roll20 commits the token
        state[SCRIPT_NAME].pendingAnchors[anchorId] = {
            childIds:   [childId],
            components: resolved,
        };

        return token;
    };

    /**
     * Force an immediate transform sync for `obj` (anchor → children).
     * Call this after your script moves an anchor programmatically.
     */
    const updateObj = (obj) => onObjectChangedImmediate(obj);

    /**
     * Restack z-order-tracked children relative to their anchor.
     * Call this after moving an anchor in z-order (e.g. via EasyReZorder).
     * @param {Roll20Object} anchorObj — the anchor graphic
     */
    const updateZOrder = (anchorObj) => applyZOrderToChildren(anchorObj.get('id'));

    /**
     * Get the child's position [left, top] in anchor-local coordinates.
     * If not anchored, returns [left, top] in world coordinates.
     */
    const getPosition = (obj) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[obj.get('id')];
        return info ? [info.left || 0, info.top || 0] : [obj.get('left'), obj.get('top')];
    };

    /**
     * Set the child's position in anchor-local coordinates and apply immediately.
     */
    const setPosition = (obj, left, top) => {
        const id   = obj.get('id');
        const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
        if (info) {
            if ('left' in info) info.left = left;
            if ('top' in info)  info.top  = top;
            applyAnchorToChild(id);
        } else {
            obj.set({ left, top });
        }
    };

    /**
     * Get the child's rotation in anchor-local degrees.
     * If not anchored, returns world rotation.
     */
    const getRotation = (obj) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[obj.get('id')];
        return info && 'rotation' in info ? info.rotation : obj.get('rotation');
    };

    /**
     * Set the child's rotation in anchor-local degrees and apply immediately.
     */
    const setRotation = (obj, degrees) => {
        const id   = obj.get('id');
        const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
        if (info && 'rotation' in info) {
            info.rotation = normDeg(degrees);
            applyAnchorToChild(id);
        } else {
            obj.set('rotation', normDeg(degrees));
        }
    };

    /**
     * Get the child's scale relative to its anchor [widthRatio, heightRatio].
     * If not anchored (or scale not tracked), returns [1, 1].
     */
    const getScale = (obj) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[obj.get('id')];
        return [
            info && 'widthRatio'  in info ? info.widthRatio  : 1,
            info && 'heightRatio' in info ? info.heightRatio : 1,
        ];
    };

    /**
     * Set the child's scale relative to its anchor and apply immediately.
     */
    const setScale = (obj, widthRatio, heightRatio) => {
        const id   = obj.get('id');
        const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
        if (info) {
            if ('widthRatio'  in info) info.widthRatio  = widthRatio;
            if ('heightRatio' in info) info.heightRatio = heightRatio;
            applyAnchorToChild(id);
        } else {
            const anchor = getObj('graphic', info && info.anchor_id);
            if (anchor) {
                obj.set({ width: anchor.get('width') * widthRatio, height: anchor.get('height') * heightRatio });
            }
        }
    };

    /**
     * Get whether child is flipped vertically relative to its anchor.
     * true = flipped relative to parent, false = same as parent.
     */
    const getFlipV = (obj) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[obj.get('id')];
        return info && 'flipv' in info ? info.flipv : undefined;
    };

    /**
     * Set the child's flipv state relative to anchor.
     * true = flipped relative to parent, false = same as parent.
     */
    const setFlipV = (obj, flipped) => {
        const id = obj.get('id');
        const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
        if (info && 'flipv' in info) {
            info.flipv = !!flipped;
            applyAnchorToChild(id);
        }
    };

    /**
     * Get whether child is flipped horizontally relative to its anchor.
     */
    const getFlipH = (obj) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[obj.get('id')];
        return info && 'fliph' in info ? info.fliph : undefined;
    };

    /**
     * Set the child's fliph state relative to anchor.
     */
    const setFlipH = (obj, flipped) => {
        const id = obj.get('id');
        const info = state[SCRIPT_NAME].anchorInfoByChildId[id];
        if (info && 'fliph' in info) {
            info.fliph = !!flipped;
            applyAnchorToChild(id);
        }
    };

    /**
     * Get the child's z-order offset relative to anchor (read-only).
     * Returns 0 if not tracked.
     */
    const getZOffset = (obj) => {
        const info = state[SCRIPT_NAME].anchorInfoByChildId[obj.get('id')];
        return info && 'z_offset' in info ? info.z_offset : 0;
    };

    /**
     * Get array of locked component names for a child.
     */
    const getLocked = (obj) => {
        const s = state[SCRIPT_NAME];
        const set = s.lockedObjects && s.lockedObjects[obj.get('id')];
        return set instanceof Set ? [...set] : [];
    };

    /**
     * Get array of tracked-but-unlocked component names for a child.
     */
    const getUnlocked = (obj) => {
        const s = state[SCRIPT_NAME];
        const id = obj.get('id');
        const info = s.anchorInfoByChildId[id];
        if (!info) return [];
        const lockedSet = s.lockedObjects && s.lockedObjects[id];
        const tracked = Object.keys(info).filter(k => k !== 'anchor_id' && !k.startsWith('_'));
        return tracked.filter(k => !(lockedSet instanceof Set) || !lockedSet.has(k));
    };

    /**
     * Lock components on a child. components is an array of names or null for all.
     */
    const lock = (obj, components) => {
        const comps = components ? components.reduce((o, c) => { o[c] = true; return o; }, {}) : null;
        lockComponents(obj.get('id'), comps);
    };

    /**
     * Unlock components on a child. components is an array of names or null for all.
     */
    const unlock = (obj, components) => {
        const comps = components ? components.reduce((o, c) => { o[c] = true; return o; }, {}) : null;
        unlockComponents(obj.get('id'), comps);
    };

    // -------------------------------------------------------------------------
    // Initialisation
    // -------------------------------------------------------------------------

    // -------------------------------------------------------------------------
    // State migration
    // -------------------------------------------------------------------------

    /**
     * Migrate state from older versions to the current format.
     * Safe to run on every startup — each migration is idempotent and gated
     * on the presence of the old format.
     *
     * v1 → v2 changes:
     *   - s.stateVersion added (absent in v1)
     *   - lockedObjects values: flat string (childId) → Set<componentName>
     *     v1 stored { childId: childId }; a lock meant "all components locked".
     *     Migrated to Set containing ALL_COMPONENTS.
     *   - objectStates snapshots: v1 only stored left/top/rotation.
     *     New fields (width/height/layer/flipv/fliph) will be populated on the
     *     next poll tick via ensureObjState — no explicit migration needed.
     *   - anchorInfoByChildId: v1 entries with only left/top/rotation are valid
     *     v2 entries tracking just those components — no migration needed.
     *   - New state keys (anchorZOrder, autoCreatedAnchors, pendingAnchors)
     *     are initialised by checkInstall via the || {} pattern — no migration needed.
     */
    const migrateState = (s) => {
        const currentVersion = 2;
        const stateVersion = s.stateVersion || 1;

        if (stateVersion >= currentVersion) return;

        if (stateVersion < 2) {
            log(`${SCRIPT_NAME}: migrating state from v${stateVersion} to v2...`);

            // Migrate lockedObjects: { childId: childId } → { childId: Set(ALL_COMPONENTS) }
            // In v1, being in lockedObjects meant all components were locked.
            // We detect the old format by checking if the value is a string (not a Set).
            let migratedLocks = 0;
            Object.keys(s.lockedObjects || {}).forEach(childId => {
                const val = s.lockedObjects[childId];
                // Old format: value is the childId string itself
                // Also catch any other non-Set value
                if (!(val instanceof Set)) {
                    s.lockedObjects[childId] = new Set(ALL_COMPONENTS);
                    migratedLocks++;
                }
            });

            if (migratedLocks > 0) {
                log(`${SCRIPT_NAME}: migrated ${migratedLocks} locked object(s) to per-component format (all components locked).`);
            }

            s.stateVersion = 2;
            log(`${SCRIPT_NAME}: migration to v2 complete.`);
        }
    };

    const checkInstall = () => {
        state[SCRIPT_NAME] = state[SCRIPT_NAME] || {};
        const s = state[SCRIPT_NAME];

        // Read globalconfig (set via the API Scripts page useroptions UI).
        // Only available when installed via one-click; falls back to DEFAULTS
        // when pasted manually. Note: checkbox values arrive as strings "true"/"false".
        const gc = (typeof globalconfig !== 'undefined' && globalconfig[SCRIPT_NAME]) || {};

        const gcConfig = {};
        if (gc.pollIntervalMs !== undefined) {
            const ms = parseInt(gc.pollIntervalMs, 10);
            if (!isNaN(ms) && ms >= 100) gcConfig.pollIntervalMs = ms;
        }
        if (gc.defaultAnchorLayer !== undefined)
            gcConfig.defaultAnchorLayer = gc.defaultAnchorLayer;
        if (gc.defaultAnchorSize !== undefined) {
            const px = parseInt(gc.defaultAnchorSize, 10);
            if (!isNaN(px) && px >= 1) gcConfig.defaultAnchorSize = px;
        }
        if (gc.defaultAnchorName !== undefined)
            gcConfig.defaultAnchorName = gc.defaultAnchorName;
        if (gc.defaultAnchorAuraColor !== undefined)
            gcConfig.defaultAnchorAuraColor = gc.defaultAnchorAuraColor;
        if (gc.defaultAnchorAuraVisible !== undefined)
            gcConfig.defaultAnchorAuraVisible = gc.defaultAnchorAuraVisible !== 'false';
        if (gc.defaultAnchorImgsrc !== undefined)
            gcConfig.defaultAnchorImgsrc = gc.defaultAnchorImgsrc;
        if (gc.allowPlayerUse !== undefined)
            gcConfig.allowPlayerUse = gc.allowPlayerUse === 'true';

        // Merge order: hardcoded DEFAULTS < globalconfig < existing state (runtime overrides).
        // This means !anchor config changes persist across restarts even if globalconfig
        // is also present, giving GMs fine-grained runtime control on top of the UI.
        s.config = Object.assign({}, DEFAULTS, gcConfig, s.config || {});

        s.anchorChildrenByAnchorId = s.anchorChildrenByAnchorId || {};
        s.anchorInfoByChildId      = s.anchorInfoByChildId      || {};
        s.objectStates             = s.objectStates             || {};
        // lockedObjects: { [childId]: Set<componentName> }
        // An entry exists even for untracked components ("pre-locked").
        // Empty set means "nothing locked" — entries should be deleted when empty.
        s.lockedObjects            = s.lockedObjects            || {};
        // Z-order lists: { [anchorId]: { front: [id,...], back: [id,...] } }
        // front[] and back[] are ordered front-to-back relative to the anchor.
        s.anchorZOrder             = s.anchorZOrder             || {};
        // IDs of anchor tokens auto-created by the script.
        // These are destroyed automatically when their last child is removed.
        // Use the persist flag (!anchor persist ...) to opt out of auto-destroy.
        s.autoCreatedAnchors       = s.autoCreatedAnchors       || {};
        // pendingAnchors: { [anchorId]: { childIds, components } }
        // Set when an auto-created anchor token is waiting for add:graphic to fire.
        // Processed and cleared by the permanent add:graphic handler.
        s.pendingAnchors           = s.pendingAnchors           || {};
        // stateVersion tracks which migrations have been applied.
        // Set to current version on fresh installs; migrateState() handles upgrades.
        s.stateVersion             = s.stateVersion             || 2;

        migrateState(s);
        cleanInvalidEntries();

        // Warn if the imgsrc is not a valid Roll20 library URL — auto-created
        // anchor tokens will fail to appear without one.
        const imgsrc = s.config.defaultAnchorImgsrc || '';
        if (!imgsrc.startsWith('https://s3.amazonaws.com/files.d20.io/images/')) {
            log(`${SCRIPT_NAME} WARNING: default-anchor-imgsrc is not set to a valid Roll20 library URL. Auto-created anchor tokens will be invisible and unselectable. Upload a transparent PNG to your Roll20 library and set the thumb URL via: !anchor config default-anchor-imgsrc <url>`);
        }

        // Generate Help: Anchor handout
        (() => {
            const helpName = `Help: ${SCRIPT_NAME}`;
            let hh = findObjs({ type: 'handout', name: helpName })[0];
            if (!hh) {
                hh = createObj('handout', { name: helpName, inplayerjournals: 'all', archived: false, avatar: 'https://files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385' });
            }
            let html = `<h1>${SCRIPT_NAME} v${SCRIPT_VERSION}</h1>`;
            html += `<p>Attach child tokens to an anchor token so they automatically follow its position, rotation, scale, and flip. Layer and z-order tracking are opt-in via flags.</p>`;
            html += `<h2>Commands</h2>`;
            html += `<ul>`;
            html += `<li><code>!anchor [anchor_id] [flags]</code> — Anchor selected tokens</li>`;
            html += `<li><code>!anchor remove</code> — Remove anchor relationship</li>`;
            html += `<li><code>!anchor lock [flags]</code> — Lock components</li>`;
            html += `<li><code>!anchor unlock [flags]</code> — Unlock components</li>`;
            html += `<li><code>!anchor track [flags]</code> — Add component tracking</li>`;
            html += `<li><code>!anchor untrack [flags]</code> — Remove component tracking</li>`;
            html += `<li><code>!anchor retrack [flags]</code> — Replace tracked set</li>`;
            html += `<li><code>!anchor center</code> — Snap children to anchor center</li>`;
            html += `<li><code>!anchor update</code> — Force immediate sync</li>`;
            html += `<li><code>!anchor info</code> — Show anchor state</li>`;
            html += `<li><code>!anchor chain</code> — Mutually anchor tokens in a ring</li>`;
            html += `<li><code>!anchor unchain</code> — Dissolve a chain ring from any member</li>`;
            html += `<li><code>!anchor config [key] [value]</code> — Configuration</li>`;
            html += `<li><code>!anchor --help</code> — Command reference</li>`;
            html += `<li><code>!anchor gen-dev-docs</code> — Generate scripting API handout</li>`;
            html += `</ul>`;
            html += `<h2>Component Flags</h2>`;
            html += `<p><code>-all</code> (everything), <code>-pos</code> (x+y), <code>-x</code>, <code>-y</code>, <code>-rot</code>, <code>-scale</code>, <code>-w</code>, <code>-h</code>, <code>-layer</code>, <code>-flip</code>, <code>-flipv</code>, <code>-fliph</code>, <code>-z</code></p>`;
            hh.set('notes', html);
        })();

        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);
    };

    const registerEventHandlers = () => {
        on('chat:message',        handleInput);
        on('add:graphic',             onAddGraphic);
        on('change:graphic:left',     onObjectChanged);
        on('change:graphic:top',      onObjectChanged);
        on('change:graphic:rotation', onObjectChanged);
        on('change:graphic:width',    onObjectChanged);
        on('change:graphic:height',   onObjectChanged);
        on('change:graphic:layer',    onObjectChanged);
        on('change:graphic:flipv',    onObjectChanged);
        on('change:graphic:fliph',    onObjectChanged);
        on('destroy:graphic',         onDestroyObject);

        setInterval(pollUpdates, cfg().pollIntervalMs);

        // ── Sequence integration ──────────────────────────────────────────
        const registerWithSequence = () => {
            if (typeof Sequence === 'undefined') return;

            // Helper: update anchor object after modifying child's local state
            const refreshAnchor = (obj) => {
                const anchorId = getAnchor(obj.get('id'));
                if (anchorId) { const a = getObj('graphic', anchorId); if (a) updateObj(a); }
            };

            // Register anchor-local position as virtual attributes
            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'left', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local X position. Animates relative to anchor.',
                valueType: 'number',
                examples: ['+70  move right 70px in anchor space', '=0  snap to anchor center'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const p = getPosition(obj); return p ? p[0] : obj.get('left'); },
                set:    (obj, val) => { setPosition(obj, val, getPosition(obj)[1]); refreshAnchor(obj); },
                diff:   (prev, curr) => { const d = Math.round((curr - prev) * 10000) / 10000; return d === 0 ? null : d; },
                apply:  (obj, delta) => { const p = getPosition(obj); setPosition(obj, p[0] + delta, p[1]); refreshAnchor(obj); },
                lerp:   (a, b, t) => a + (b - a) * t,
                identity: () => ({ delta: 0 }),
                format: (d) => d >= 0 ? `+${d}` : `${d}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    if (s.startsWith('=')) return { abs: parseFloat(s.slice(1)) };
                    return { delta: parseFloat(s) };
                },
            });

            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'top', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local Y position. Animates relative to anchor.',
                valueType: 'number',
                examples: ['+70  move down 70px in anchor space', '=0  snap to anchor center'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const p = getPosition(obj); return p ? p[1] : obj.get('top'); },
                set:    (obj, val) => { const p = getPosition(obj); setPosition(obj, p[0], val); refreshAnchor(obj); },
                diff:   (prev, curr) => { const d = Math.round((curr - prev) * 10000) / 10000; return d === 0 ? null : d; },
                apply:  (obj, delta) => { const p = getPosition(obj); setPosition(obj, p[0], p[1] + delta); refreshAnchor(obj); },
                lerp:   (a, b, t) => a + (b - a) * t,
                identity: () => ({ delta: 0 }),
                format: (d) => d >= 0 ? `+${d}` : `${d}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    if (s.startsWith('=')) return { abs: parseFloat(s.slice(1)) };
                    return { delta: parseFloat(s) };
                },
            });

            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'rotation', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local rotation in degrees.',
                valueType: 'number',
                examples: ['+90  rotate 90° in anchor space'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const r = getRotation(obj); return r !== undefined ? r : 0; },
                set:    (obj, val) => { setRotation(obj, val); refreshAnchor(obj); },
                diff:   (prev, curr) => { const d = Math.round((curr - prev) * 10000) / 10000; return d === 0 ? null : d; },
                apply:  (obj, delta) => { setRotation(obj, getRotation(obj) + delta); refreshAnchor(obj); },
                lerp:   (a, b, t) => a + (b - a) * t,
                identity: () => ({ delta: 0 }),
                format: (d) => d >= 0 ? `+${d}` : `${d}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    if (s.startsWith('=')) return { abs: parseFloat(s.slice(1)) };
                    return { delta: parseFloat(s) };
                },
            });

            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'scaleW', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local width scale (multiplicative — ×2 doubles).',
                valueType: 'scale',
                examples: ['×2  double width in anchor space', '×0.5  halve width'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const s = getScale(obj); return s ? s[0] : 1; },
                set:    (obj, val) => { const s = getScale(obj); setScale(obj, val, s ? s[1] : 1); refreshAnchor(obj); },
                diff:   (prev, curr) => { if (!prev || prev === 0 || curr === prev) return null; const r = Math.round((curr / prev) * 10000) / 10000; return r === 1 ? null : r; },
                apply:  (obj, ratio) => { const s = getScale(obj); setScale(obj, (s ? s[0] : 1) * ratio, s ? s[1] : 1); refreshAnchor(obj); },
                lerp:   (a, b, t) => a + (b - a) * t,
                identity: () => ({ delta: 1 }),
                format: (ratio) => `×${ratio}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    if (s.startsWith('=')) return { abs: parseFloat(s.slice(1)) };
                    if (s.startsWith('×') || s.startsWith('*')) return { delta: parseFloat(s.slice(1)) };
                    return { delta: parseFloat(s) };
                },
            });

            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'scaleH', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local height scale (multiplicative).',
                valueType: 'scale',
                examples: ['×2  double height in anchor space'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const s = getScale(obj); return s ? s[1] : 1; },
                set:    (obj, val) => { const s = getScale(obj); setScale(obj, s ? s[0] : 1, val); refreshAnchor(obj); },
                diff:   (prev, curr) => { if (!prev || prev === 0 || curr === prev) return null; const r = Math.round((curr / prev) * 10000) / 10000; return r === 1 ? null : r; },
                apply:  (obj, ratio) => { const s = getScale(obj); setScale(obj, s ? s[0] : 1, (s ? s[1] : 1) * ratio); refreshAnchor(obj); },
                lerp:   (a, b, t) => a + (b - a) * t,
                identity: () => ({ delta: 1 }),
                format: (ratio) => `×${ratio}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    if (s.startsWith('=')) return { abs: parseFloat(s.slice(1)) };
                    if (s.startsWith('×') || s.startsWith('*')) return { delta: parseFloat(s.slice(1)) };
                    return { delta: parseFloat(s) };
                },
            });

            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'flipV', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local vertical flip (true = flipped relative to parent).',
                valueType: 'boolean',
                examples: ['=true  flip vertically', '=false  unflip'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const v = getFlipV(obj); return v !== undefined ? v : false; },
                set:    (obj, val) => { setFlipV(obj, val); refreshAnchor(obj); },
                diff:   (prev, curr) => curr === prev ? null : curr,
                apply:  (obj, val) => { setFlipV(obj, val); refreshAnchor(obj); },
                lerp:   null,
                format: (val) => `=${val}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    const v = s.startsWith('=') ? s.slice(1) : s;
                    return { abs: v === 'true' || v === '1' };
                },
            });

            Sequence.registerAttribute(SCRIPT_NAME, {
                name: 'flipH', namespace: 'anchor', objectType: 'graphic',
                description: 'Anchor-local horizontal flip (true = flipped relative to parent).',
                valueType: 'boolean',
                examples: ['=true  flip horizontally', '=false  unflip'],
                startWatch: null, stopWatch: null,
                get:    (obj) => { const v = getFlipH(obj); return v !== undefined ? v : false; },
                set:    (obj, val) => { setFlipH(obj, val); refreshAnchor(obj); },
                diff:   (prev, curr) => curr === prev ? null : curr,
                apply:  (obj, val) => { setFlipH(obj, val); refreshAnchor(obj); },
                lerp:   null,
                format: (val) => `=${val}`,
                parse:  (str) => {
                    const s = String(str).trim();
                    const v = s.startsWith('=') ? s.slice(1) : s;
                    return { abs: v === 'true' || v === '1' };
                },
            });

            log(`${SCRIPT_NAME}: registered anchor-local attributes with Sequence`);
        };

        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content === '!sequence-ready') registerWithSequence();
        });
        registerWithSequence();

        // ── Choreograph integration ───────────────────────────────────────
        const registerWithChoreograph = () => {
            if (typeof Choreograph === 'undefined') return;

            // Token variables (appear as token.anchor.parent, token.anchor.left, etc.)
            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'parent', namespace: 'anchor',
                description: 'The anchor token this token is attached to (or null)',
                returns: 'token',
                fn: (token) => {
                    const id = getAnchor(token.get('id'));
                    return id ? getObj('graphic', id) : null;
                },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'left', namespace: 'anchor',
                description: 'Anchor-local X position',
                returns: 'number',
                fn: (token) => { const p = getPosition(token); return p ? p[0] : 0; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'top', namespace: 'anchor',
                description: 'Anchor-local Y position',
                returns: 'number',
                fn: (token) => { const p = getPosition(token); return p ? p[1] : 0; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'rotation', namespace: 'anchor',
                description: 'Anchor-local rotation in degrees',
                returns: 'number',
                fn: (token) => { const r = getRotation(token); return r !== undefined ? r : 0; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'scaleW', namespace: 'anchor',
                description: 'Anchor-local width scale ratio',
                returns: 'number',
                fn: (token) => { const s = getScale(token); return s ? s[0] : 1; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'scaleH', namespace: 'anchor',
                description: 'Anchor-local height scale ratio',
                returns: 'number',
                fn: (token) => { const s = getScale(token); return s ? s[1] : 1; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'flipV', namespace: 'anchor',
                description: 'Flipped vertically relative to anchor',
                returns: 'boolean',
                fn: (token) => { const v = getFlipV(token); return v !== undefined ? v : false; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'flipH', namespace: 'anchor',
                description: 'Flipped horizontally relative to anchor',
                returns: 'boolean',
                fn: (token) => { const v = getFlipH(token); return v !== undefined ? v : false; },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'zOffset', namespace: 'anchor',
                description: 'Z-order offset relative to anchor',
                returns: 'number',
                fn: (token) => getZOffset(token),
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'locked', namespace: 'anchor',
                description: 'Locked component names',
                returns: 'string[]',
                fn: (token) => getLocked(token),
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'unlocked', namespace: 'anchor',
                description: 'Tracked but unlocked component names',
                returns: 'string[]',
                fn: (token) => getUnlocked(token),
            });

            // Functions returning token arrays
            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'siblings', namespace: 'anchor',
                description: 'Other tokens anchored to the same parent',
                returns: 'token[]',
                fn: (token) => {
                    const anchorId = getAnchor(token.get('id'));
                    if (!anchorId) return [];
                    return (getChildren(anchorId) || [])
                        .filter(t => t.get('id') !== token.get('id'));
                },
            });

            Choreograph.registerTokenVariable(SCRIPT_NAME, {
                name: 'children', namespace: 'anchor',
                description: 'Tokens anchored to this token as children',
                returns: 'token[]',
                fn: (token) => getChildren(token.get('id')) || [],
            });

            // Lifecycle hook for !anchor commands in scenes
            Choreograph.registerLifecycleHook(SCRIPT_NAME, {
                commands: [/^!anchor\b/],
                start: (ctx) => { handleInput(ctx); },
                stop: null,
                pause: null,
                resume: null,
            });

            log(`${SCRIPT_NAME}: registered with Choreograph`);
        };

        on('chat:message', (msg) => {
            if (msg.type === 'api' && msg.content === '!choreograph-ready') registerWithChoreograph();
        });
        registerWithChoreograph();
    };

    // -------------------------------------------------------------------------
    // Module export
    // -------------------------------------------------------------------------

    return {
        // Lifecycle (called by on('ready'))
        checkInstall,
        registerEventHandlers,

        // Public API for other scripts
        API: {
            getAnchor,
            getChildren,
            anchorObj,
            createAnchorFor,
            removeAnchor,
            updateObj,
            updateZOrder,
            getPosition,
            setPosition,
            getRotation,
            setRotation,
            getScale,
            setScale,
            getFlipV,
            setFlipV,
            getFlipH,
            setFlipH,
            getZOffset,
            getLocked,
            getUnlocked,
            lock,
            unlock,
            chainAnchorObjs,
            unchainAnchorObjs,
        },
    };
})();

on('ready', () => {
    'use strict';
    Anchor.checkInstall();
    Anchor.registerEventHandlers();
    // Expose the public API at the top level for other scripts:
    //   Anchor.getAnchor(id), Anchor.anchorObj(...), etc.
    Object.assign(Anchor, Anchor.API);
    delete Anchor.API;
});