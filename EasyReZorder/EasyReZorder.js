// =============================================================================
// EasyReZorder v1.0.0
// Last Updated: 2026-06-12
// Author: Kenan Millet
//
// Description:
//   Simple z-order manipulation for Roll20 tokens, paths, and text objects.
//   Move selected objects forward/backward by steps, to front/back, or
//   ahead-of/behind a specific object.
//
// Dependencies: none
// Optional: Anchor (calls Anchor.updateZOrder after reordering)
//
// Commands:
//   !z-order forward [n]          Move forward n steps (default: 1)
//   !z-order backward [n]         Move backward n steps (default: 1)
//   !z-order front                Bring to front
//   !z-order back                 Send to back
//   !z-order ahead-of <id>        Move ahead of a specific object
//   !z-order behind <id>          Move behind a specific object
//   !z-order check                Show z-order index of selected objects
//   !z-order --help               Show command reference
// =============================================================================

/* global on, sendChat, getObj, findObjs, toFront, toBack, playerIsGM, log */

var EasyReZorder = EasyReZorder || (() => {
    'use strict';

    const SCRIPT_NAME    = 'EasyReZorder';
    const SCRIPT_VERSION = '1.0.0';
    const CMD_TOKEN      = '!z-order';

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
        sendChat(`${SCRIPT_NAME}${prefix}`, `/w "${recipient}" ${body}`);
    };

    const Z_TYPES = ['path', 'text', 'graphic'];

    const getZOrderedObj = (objid) => {
        for (const type of Z_TYPES) {
            const obj = getObj(type, objid);
            if (obj) return obj;
        }
        return undefined;
    };

    // =========================================================================
    // Z-order operations
    // =========================================================================

    const shiftNSteps = (objs, zorder, toFrontOrBackFn, steps) => {
        const movedIds = new Set();
        const moveObj = (obj) => { toFrontOrBackFn(obj); movedIds.add(obj.get('id')); };

        zorder.forEach((objid, idx) => {
            const obj = objs[objid];
            if (movedIds.has(objid) || (obj === undefined && movedIds.size === 0)) return;

            if (obj !== undefined) {
                if (idx === 0 || !(zorder[idx - 1] in objs)) {
                    let stepsRemaining = steps;
                    let scanIdx = idx;
                    while (stepsRemaining-- > 0) {
                        const nextIdx = zorder.slice(scanIdx + 1).findIndex(id => !(id in objs));
                        if (nextIdx === -1) break;
                        scanIdx += nextIdx + 1;
                        const nextId = zorder[scanIdx];
                        if (movedIds.has(nextId)) continue;
                        const nuobj = getZOrderedObj(nextId);
                        if (nuobj) moveObj(nuobj);
                    }
                }
                moveObj(obj);
                return;
            }

            const fallback = getZOrderedObj(objid);
            if (fallback) moveObj(fallback);
        });
    };

    const shift = (msg, selected, args, dirStr, modifyZOrder, toFrontOrBackFn) => {
        const objsByPage = {};
        selected.forEach(obj => {
            const pageid = obj.get('pageid');
            if (!objsByPage[pageid]) objsByPage[pageid] = {};
            objsByPage[pageid][obj.get('id')] = obj;
        });
        const steps = (args.length > 1 ? parseInt(args[1], 10) : NaN) || 1;
        Object.entries(objsByPage).forEach(([pageid, objs]) => {
            const zorder = getObj('page', pageid).get('zorder').split(',');
            modifyZOrder(zorder);
            shiftNSteps(objs, zorder, toFrontOrBackFn, steps);
            notifyAnchor(objs);
        });
        reply(msg, args[0], `Moved ${selected.length} object(s) ${dirStr} by ${steps} step(s).`);
    };

    const bringToFrontOrBack = (msg, selected, args, label, modifyZOrder, toFrontOrBackFn) => {
        const objsByPage = {};
        selected.forEach(obj => {
            const pageid = obj.get('pageid');
            if (!objsByPage[pageid]) objsByPage[pageid] = {};
            objsByPage[pageid][obj.get('id')] = obj;
        });
        Object.entries(objsByPage).forEach(([pageid, objs]) => {
            const zorder = getObj('page', pageid).get('zorder').split(',');
            modifyZOrder(zorder);
            zorder.forEach(objid => { if (objs[objid]) toFrontOrBackFn(objs[objid]); });
            notifyAnchor(objs);
        });
        reply(msg, args[0], `Sent ${selected.length} object(s) to ${label}.`);
    };

    const moveAheadOrBehind = (msg, selected, specified, args, label, modifyZOrder, toFrontOrBackFn) => {
        const selectedByPage = {};
        const specifiedByPage = {};
        [[selected, selectedByPage], [specified, specifiedByPage]].forEach(([objs, map]) => {
            objs.forEach(obj => {
                const pageid = obj.get('pageid');
                if (!map[pageid]) map[pageid] = [];
                map[pageid].push(obj);
            });
        });
        const targetByPage = {};
        Object.entries(specifiedByPage).forEach(([pageid, objs]) => {
            targetByPage[pageid] = objs.pop();
            if (objs.length > 0) {
                if (!selectedByPage[pageid]) selectedByPage[pageid] = [];
                selectedByPage[pageid].push(...objs);
            }
        });

        Object.entries(selectedByPage).forEach(([pageid, arr]) => {
            const objs = {};
            arr.forEach(obj => { objs[obj.get('id')] = obj; });
            const zorder = getObj('page', pageid).get('zorder').split(',');
            modifyZOrder(zorder);
            const target = targetByPage[pageid];
            if (!target) return;
            toFrontOrBackFn(target);
            let targetReached = false;
            zorder.forEach(objid => {
                if (objid === target.get('id')) { targetReached = true; return; }
                let obj = objs[objid];
                if (targetReached && !obj) obj = getZOrderedObj(objid);
                if (obj) toFrontOrBackFn(obj);
            });
            notifyAnchor(objs);
            reply(msg, args[0], `Moved ${Object.keys(objs).length} object(s) ${label} ${target.get('id')}.`);
        });
    };

    // =========================================================================
    // Anchor integration
    // =========================================================================

    const notifyAnchor = (objs) => {
        if (typeof Anchor === 'undefined' || !Anchor.updateZOrder) return;
        Object.values(objs).forEach(obj => {
            // If this object is an anchor, update its children's z-order
            if (Anchor.getChildren && Anchor.getChildren(obj.get('id')).length > 0) {
                Anchor.updateZOrder(obj);
            }
        });
    };

    // =========================================================================
    // Command handler
    // =========================================================================

    const HELP_TEXT = `<b>${SCRIPT_NAME} v${SCRIPT_VERSION}</b><br><br>`
        + `<code>${CMD_TOKEN} forward [n]</code> -- Move forward n steps<br>`
        + `<code>${CMD_TOKEN} backward [n]</code> -- Move backward n steps<br>`
        + `<code>${CMD_TOKEN} front</code> -- Bring to front<br>`
        + `<code>${CMD_TOKEN} back</code> -- Send to back<br>`
        + `<code>${CMD_TOKEN} ahead-of &lt;id&gt;</code> -- Move ahead of object<br>`
        + `<code>${CMD_TOKEN} behind &lt;id&gt;</code> -- Move behind object<br>`
        + `<code>${CMD_TOKEN} check</code> -- Show z-order index<br>`;

    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        if (msg.content.split(' ')[0] !== CMD_TOKEN) return;
        if (!playerIsGM(msg.playerid) && msg.playerid !== 'API') return;

        const rawArgs = msg.content.slice(CMD_TOKEN.length).trim().split(/\s+/).filter(Boolean);
        const ignoreSelected = rawArgs.includes('ignore-selected');
        const args = rawArgs.filter(a => a !== 'ignore-selected');

        if (!args.length || args[0] === '--help') { reply(msg, HELP_TEXT); return; }

        const selected = (ignoreSelected ? [] : (msg.selected || []))
            .map(s => getObj(s._type, s._id)).filter(Boolean);
        const specifiedIds = args.filter(a => getZOrderedObj(a));
        const cleanArgs = args.filter(a => !specifiedIds.includes(a));
        const specified = specifiedIds.map(id => getZOrderedObj(id));

        const cmd = cleanArgs[0];
        const all = [...selected, ...specified];

        switch (cmd) {
            case 'forward':
                shift(msg, all, cleanArgs, 'forward', z => z, toFront);
                break;
            case 'backward':
                shift(msg, all, cleanArgs, 'backward', z => z.reverse(), toBack);
                break;
            case 'front':
                bringToFrontOrBack(msg, all, cleanArgs, 'front', z => z, toFront);
                break;
            case 'back':
                bringToFrontOrBack(msg, all, cleanArgs, 'back', z => z.reverse(), toBack);
                break;
            case 'ahead-of':
                moveAheadOrBehind(msg, selected, specified, cleanArgs, 'ahead of', z => z, toFront);
                break;
            case 'behind':
                moveAheadOrBehind(msg, selected, specified, cleanArgs, 'behind', z => z.reverse(), toBack);
                break;
            case 'check': {
                const objs = all;
                const zordersByPage = {};
                objs.forEach(obj => {
                    const pageid = obj.get('pageid');
                    if (!zordersByPage[pageid]) zordersByPage[pageid] = getObj('page', pageid).get('zorder').split(',');
                });
                objs.sort((a, b) => zordersByPage[a.get('pageid')].indexOf(a.get('id')) - zordersByPage[b.get('pageid')].indexOf(b.get('id')));
                objs.forEach(obj => {
                    const zo = zordersByPage[obj.get('pageid')];
                    reply(msg, 'check', `${obj.get('id')} z-index: ${zo.indexOf(obj.get('id'))} / ${zo.length - 1}`);
                });
                break;
            }
            default:
                reply(msg, 'Error', `Unknown action: ${cmd}. Use ${CMD_TOKEN} --help.`);
        }
    };

    // =========================================================================
    // Initialisation
    // =========================================================================

    const checkInstall = () => {
        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    return { checkInstall, registerEventHandlers };
})();

on('ready', () => {
    'use strict';
    EasyReZorder.checkInstall();
    EasyReZorder.registerEventHandlers();
});
