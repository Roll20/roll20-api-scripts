// Script:   Tether
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Changelog
// 1.0.1  Tethers can now have a range limit (threshold) and a behavior for when it is passed (exceeds):
//        fade out, remove the tether, change color, or fade or thin out as the tokens move apart.
//        Distance follows the page's own grid scale and diagonal rule.
//        Added target| to pair a selected token with one you can't select, or to pair two tokens by id
//        with nothing selected. With nothing selected, you must control at least one of the two tokens.
//        Both tokens must be on the same page. Commands sent by other scripts are not restricted.
//        Added !tether-debug to show the measured distance and preview how a tether would draw.
//        Fixed tethers being lost after an API restart, and tethers are removed as soon as a token is deleted.
//        Moving a token updates its tethers in place, so the token stays selected when moved with the arrow keys.
//        The line fades out and back in as it moves, to hide a flicker while the new position is drawn.
//        Tethers that act as Dynamic Lighting barriers move immediately instead.
//        Error messages now go to the player who ran the command.
//        Other scripts' commands that only begin with !tether or !untether no longer trigger Tether.
// 1.0.0  Initial release.

const Tether = (() =>
{
    'use strict';

    const SCRIPT = 'Tether';
    const VERSION = '1.0.1';

    const DEFAULTS = {
        width: 5,
        color: '#0000ff',
        layer: 'objects',
        type: 'transparent',
        threshold: null,
        exceeds: 'off'
    };

    const VALID_LAYERS = ['objects', 'gmlayer', 'map', 'walls', 'foreground'];
    const EXCEEDS_KEYWORDS = ['off', 'delete', 'attenuate', 'stretch'];

    // Retry delays (ms) before a missing linked token is treated as deleted.
    const READY_RETRY_DELAYS = [2000, 5000, 10000, 20000];

    // Roll20 grid size in pixels per square.
    const PIXELS_PER_SQUARE = 70;

    // Distance (scale units) within which attenuate/stretch stay at full strength.
    const FULL_STRENGTH_RANGE_UNITS = 5;

    // Move animation: fade out, move while invisible, fade in. MOVE_ANIMATION = false moves the line directly. Barrier tethers are never animated.
    const MOVE_ANIMATION = true;
    const MOVE_FADE_MS = 300;          // total for fade out + fade in
    const MOVE_FADE_STEPS = 5;         // steps in each direction
    const MOVE_INVISIBLE_MS = 100;     // wait after fully faded, before moving
    const MOVE_SETTLE_MS = 400;        // wait after moving, before fading in
    const MAX_POSITION_RETRIES = 3;

    // Animations in progress, keyed by link.
    const activeFades = new WeakMap();

    const checkInstall = () =>
    {
        if(!state[SCRIPT])
        {
            state[SCRIPT] = {};
        }

        if(!Array.isArray(state[SCRIPT].links))
        {
            state[SCRIPT].links = [];
        }
    };

    // Whisper target; commands from other scripts (playerid 'API') go to the GM.
    const whisperTarget = playerid =>
    {
        const player = getObj('player', playerid);
        return player ? `"${player.get('_displayname')}"` : 'gm';
    };

    const showHelp = playerid =>
    {

        const help = `
<div style="border:1px solid #666;background:#ccc;color:#111;padding:8px;border-radius:5px;font-size:12px;">
<b><span style = "font-size:16px;">Tether</span></b>
<br>
Connect two tokens with an updating path. Select two, select one and use target|, or use target| twice with nothing selected.
<br><br>

<b>Create:</b>
<br>
!tether [options]
<br><br>

<b>Options (with examples):</b>
<br>
width|<i>5</i>
<br>
color|<i>#0000ff</i>
<br>
layer|<i>objects,gmlayer,map,walls,foreground</i>
<br>
type|<i>transparent,wall,oneWay</i>
<br>
threshold|<i>60</i> (distance in the page's scale units)
<br>
exceeds|<i>off,delete,attenuate,stretch,</i> or a hex color
<br>
target|<i>token_id</i> (e.g. &#64;{target|token_id}) - may be used twice. Selected tokens plus target| ids must total two. With nothing selected, you must control at least one of the two tokens. Both must be on the same page.
<br><br>

<b>Remove:</b>
<br>
!untether - remove selected pair (or 1 selected + target|, or target| twice)
<br>
!untether selected - remove all tethers involving selected tokens
<br>
!untether all - remove all tethers on current page
<br><br>

<b>Debug:</b>
<br>
!tether-debug [options] - select 2 tokens (or use target|) to see computed
distance and, if threshold|/exceeds| are included, a preview of the effective
draw values
</div>`;

        sendChat(
            SCRIPT,
            `/w ${whisperTarget(playerid)} ${help.replace(/\n\s*/g,'')}`
        );
    };

    const getPageForPlayer = (playerid) =>
    {
        const player = getObj('player', playerid);
        if(!player) return Campaign().get('playerpageid');

        if(playerIsGM(playerid))
        {
            return player.get('_lastpage') || Campaign().get('playerpageid');
        }

        const psp = Campaign().get('playerspecificpages');
        if(psp && psp[playerid]) return psp[playerid];

        return Campaign().get('playerpageid');
    };

    const fixColor = c => {
        if (/^[0-9a-f]{6}([0-9a-f]{2})?$/i.test(c)) {
            return '#' + c;
        }
        return c;
    };

    const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

    // Hex color (6 or 8 digit) to RGBA parts; null if not hex.
    const hexToRgbaParts = hex => {
        if (typeof hex !== 'string') return null;
        const m = /^#?([0-9a-f]{6})([0-9a-f]{2})?$/i.exec(hex);
        if (!m) return null;

        return {
            r: parseInt(m[1].slice(0, 2), 16),
            g: parseInt(m[1].slice(2, 4), 16),
            b: parseInt(m[1].slice(4, 6), 16),
            a: m[2] ? parseInt(m[2], 16) / 255 : 1
        };
    };

    const toHexAlphaColor = (parts, alpha) => {
        const componentToHex = v => clamp(Math.round(v), 0, 255).toString(16).padStart(2, '0');
        const alphaToHex = a => clamp(Math.round(a * 255), 0, 255).toString(16).padStart(2, '0');

        return `#${componentToHex(parts.r)}${componentToHex(parts.g)}${componentToHex(parts.b)}${alphaToHex(alpha)}`;
    };

    const getPageSettings = pageid => {
        const page = getObj('page', pageid);
        return {
            diagonaltype: (page && page.get('diagonaltype')) || 'foure',
            scale_number: (page && page.get('scale_number')) || 5,
            snapping_increment: (page && page.get('snapping_increment')) || 1
        };
    };

    // Distance between token centers, in the page's scale units.
    const getDistance = (a, b) => {
        const settings = getPageSettings(a.get('_pageid'));

        let dx = Math.abs(a.get('left') - b.get('left')) / PIXELS_PER_SQUARE;
        let dy = Math.abs(a.get('top') - b.get('top')) / PIXELS_PER_SQUARE;

        dx *= settings.snapping_increment;
        dy *= settings.snapping_increment;

        let squares;
        switch (settings.diagonaltype) {
            case 'threefive': {
                const diag = Math.min(dx, dy);
                const straight = Math.abs(dx - dy);
                squares = straight + Math.floor(diag * 1.5);
                break;
            }

            case 'manhattan':
                squares = dx + dy;
                break;

            case 'pythagorean':
                squares = Math.sqrt(dx * dx + dy * dy);
                break;

            case 'foure':
            default:
                squares = Math.max(dx, dy);
                break;
        }

        return squares * settings.scale_number;
    };

    // Effective color/width for a link at a given distance (base values are never changed).
    const getEffectiveDraw = (link, distance) => {
        const base = { color: link.color, width: link.width };

        if (link.threshold == null) return base;

        const exceeds = link.exceeds || 'off';
        const overThreshold = distance > link.threshold;
        const baseParts = hexToRgbaParts(link.color);

        const fadeStart = Math.min(FULL_STRENGTH_RANGE_UNITS, link.threshold);
        const fadeRange = link.threshold - fadeStart;
        const fadeProgress = fadeRange > 0
            ? clamp((distance - fadeStart) / fadeRange, 0, 1)
            : (distance > fadeStart ? 1 : 0);

        switch (exceeds) {

            case 'off': {
                if (!overThreshold || !baseParts) return base;
                return { color: toHexAlphaColor(baseParts, 0), width: link.width };
            }

            case 'attenuate': {
                if (!baseParts) return base;

                if (overThreshold) {
                    return { color: toHexAlphaColor(baseParts, 0), width: link.width };
                }

                const alpha = baseParts.a * (1 - fadeProgress * 0.8);
                return { color: toHexAlphaColor(baseParts, alpha), width: link.width };
            }

            case 'stretch': {
                if (overThreshold) {
                    const color = baseParts ? toHexAlphaColor(baseParts, 0) : base.color;
                    return { color, width: 1 };
                }

                const width = Math.max(1, link.width - fadeProgress * (link.width - 1));
                return { color: link.color, width };
            }

            case 'delete':
                // exceeds|delete is handled by applyThresholdDeletions().
                return base;

            default: {
                // Not a keyword: exceeds is a hex color.
                if (!overThreshold) return base;
                return { color: exceeds, width: link.width };
            }
        }
    };

    const parseOptions = content =>
    {
        const opts = {
            ...DEFAULTS,
            targets: []
        };

        content.split(/\s+/).forEach(part =>
        {
            const m = part.match(/^([^|]+)\|(.+)$/);
            if(!m) return;

            let key = m[1].toLowerCase();
            let val = m[2];

            switch(key)
            {
                case 'width':
                    opts.width = parseInt(val, 10) || DEFAULTS.width;
                    break;

                case 'color':
                    opts.color = fixColor(val);
                    break;

                case 'layer':
                    opts.layer = VALID_LAYERS.includes(val) ? val : DEFAULTS.layer;
                    break;

                case 'type':
                    opts.type = val;
                    break;

                case 'threshold': {
                    const t = parseFloat(val);
                    opts.threshold = Number.isNaN(t) ? DEFAULTS.threshold : t;
                    break;
                }

                case 'exceeds': {
                    const lower = val.toLowerCase();
                    if (EXCEEDS_KEYWORDS.includes(lower)) {
                        opts.exceeds = lower;
                    } else if (/^#?[0-9a-f]{6}([0-9a-f]{2})?$/i.test(val)) {
                        opts.exceeds = fixColor(val);
                    } else {
                        opts.exceeds = DEFAULTS.exceeds;
                    }
                    break;
                }

                case 'target':
                    opts.targets.push(val);
                    break;
            }
        });

        return opts;
    };

    // GMs, or players listed in the token's or its character's controlledby.
    const playerControlsToken = (playerid, token) =>
    {
        if (playerIsGM(playerid)) return true;

        const listed = list =>
        {
            const ids = (list || '').split(',').map(s => s.trim());
            return ids.includes('all') || ids.includes(playerid);
        };

        if (listed(token.get('controlledby'))) return true;

        const charId = token.get('represents');
        if (charId)
        {
            const character = getObj('character', charId);
            if (character && listed(character.get('controlledby'))) return true;
        }

        return false;
    };

    const whisperError = (playerid, text) =>
    {
        sendChat(SCRIPT, `/w ${whisperTarget(playerid)} ${text}`);
    };

    // Resolves the pair: selected tokens plus target| ids must total two.
    const resolvePairFromMessage = (msg, requireSamePage = true) =>
    {
        const opts = parseOptions(msg.content);
        const selectedIds = (msg.selected || []).map(s => s._id);

        if (opts.targets.length === 0)
        {
            if (selectedIds.length !== 2)
            {
                return { error: 'Select exactly two tokens, or use target| with a token id.' };
            }
        }
        else if (selectedIds.length + opts.targets.length !== 2)
        {
            return { error: 'Selected tokens plus target| ids must total exactly two (one selected plus one target|, or two target|).' };
        }

        const ids = [...selectedIds, ...opts.targets];

        if (ids[0] === ids[1])
        {
            return { error: 'The two tokens must be different tokens.' };
        }

        const a = getObj('graphic', ids[0]);
        const b = getObj('graphic', ids[1]);

        if (!a || !b)
        {
            return { error: 'One of the tokens could not be found.' };
        }

        // Commands from other scripts (playerid 'API') skip the control check.
        if (selectedIds.length === 0
            && msg.playerid !== 'API'
            && !playerControlsToken(msg.playerid, a)
            && !playerControlsToken(msg.playerid, b))
        {
            return { error: 'You must control at least one of the two tokens.' };
        }

        if (requireSamePage && a.get('_pageid') !== b.get('_pageid'))
        {
            return { error: 'Both tokens must be on the same page.' };
        }

        return { a, b, opts };
    };

    const getEndpoints = (a, b) =>
    {
        const x1 = a.get('left');
        const y1 = a.get('top');
        const x2 = b.get('left');
        const y2 = b.get('top');

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        return {
            x: (minX + maxX) / 2,
            y: (minY + maxY) / 2,
            points: [
                [x1 - minX, y1 - minY],
                [x2 - minX, y2 - minY]
            ]
        };
    };

    // Fills in defaults on older saved links.
    const normalizeLink = link =>
    {
        link.width ||= DEFAULTS.width;
        link.color ||= DEFAULTS.color;
        link.layer ||= DEFAULTS.layer;
        link.type ||= DEFAULTS.type;
        if (link.threshold === undefined) link.threshold = DEFAULTS.threshold;
        if (!link.exceeds) link.exceeds = DEFAULTS.exceeds;
    };

    // Confirms an in-place path update took effect.
    const pathMatches = (path, e) =>
    {
        const close = (u, v) => Math.abs(Number(u) - Number(v)) < 0.01;

        if (!close(path.get('x'), e.x) || !close(path.get('y'), e.y)) return false;

        let pts = path.get('points');
        try { if (typeof pts === 'string') pts = JSON.parse(pts); } catch (err) { return false; }
        if (!Array.isArray(pts) || pts.length !== e.points.length) return false;

        return pts.every((p, i) => close(p[0], e.points[i][0]) && close(p[1], e.points[i][1]));
    };

    // Redraws one link. inPlace updates the existing path (keeps the token selection) and falls back to recreating it.
    const redrawLink = (link, inPlace = false) => {

        normalizeLink(link);

        const a = getObj('graphic', link.a);
        const b = getObj('graphic', link.b);

        if (!a || !b) return false;

        const old = getObj('pathv2', link.path);

        const e = getEndpoints(a, b);

        const draw = link.threshold == null
            ? { color: link.color, width: link.width }
            : getEffectiveDraw(link, getDistance(a, b));

        if (inPlace && old)
        {
            try
            {
                // The client may briefly show the new angle at the old center; not avoidable.
                old.set({
                    points: JSON.stringify(e.points),
                    x: e.x,
                    y: e.y,
                    stroke: draw.color,
                    stroke_width: draw.width
                });

                if (pathMatches(old, e)) return true;
            }
            catch (err)
            {
            }
        }

        if (old) old.remove();

        const path = createObj('pathv2', {
            _pageid: a.get('_pageid'),
            shape: 'pol',
            points: JSON.stringify(e.points),
            x: e.x,
            y: e.y,
            stroke: draw.color,
            stroke_width: draw.width,
            fill: 'transparent',
            layer: link.layer,
            barrierType: link.type
        });

        if (path) {
            link.path = path.get('_id');
        }

        return true;
    };

    // Moves a link's path with the fade animation (out, move, settle, in). Recreates the path if it can't be moved.
    const fadeMovedLink = link =>
    {
        normalizeLink(link);

        const a = getObj('graphic', link.a);
        const b = getObj('graphic', link.b);
        if (!a || !b) return;

        const path = getObj('pathv2', link.path);
        if (!path)
        {
            redrawLink(link, true);
            return;
        }

        if (activeFades.has(link)) return;
        if (pathMatches(path, getEndpoints(a, b))) return;

        const initial = hexToRgbaParts(path.get('stroke'));
        if (!initial)
        {
            redrawLink(link, true);
            return;
        }

        const stepMs = MOVE_FADE_MS / (2 * MOVE_FADE_STEPS);
        const fade = {
            phase: initial.a > 0 ? 'out' : 'move',
            step: 0,
            retries: 0
        };
        activeFades.set(link, fade);

        const setStyle = (stroke, width) =>
        {
            if (path.get('stroke_width') !== width) path.set({ stroke, stroke_width: width });
            else path.set({ stroke });
        };

        const tick = () =>
        {
            if (activeFades.get(link) !== fade) return;

            const links = state[SCRIPT] && state[SCRIPT].links;
            if (!links || !links.includes(link) || link.path !== path.get('_id') || !getObj('pathv2', link.path))
            {
                activeFades.delete(link);
                return;
            }

            let delay = stepMs;

            try
            {
                const first = getObj('graphic', link.a);
                const second = getObj('graphic', link.b);

                if (!first || !second)
                {
                    fade.phase = 'failed';
                }
                else if (fade.phase === 'out')
                {
                    fade.step++;
                    path.set('stroke', toHexAlphaColor(initial, initial.a * (1 - fade.step / MOVE_FADE_STEPS)));

                    if (fade.step >= MOVE_FADE_STEPS)
                    {
                        fade.phase = 'move';
                        delay = MOVE_INVISIBLE_MS;
                    }
                }
                else if (fade.phase === 'move')
                {
                    const e = getEndpoints(first, second);
                    const style = getEffectiveDraw(link, getDistance(first, second));
                    const attrs = { points: JSON.stringify(e.points), x: e.x, y: e.y };
                    if (path.get('stroke_width') !== style.width) attrs.stroke_width = style.width;

                    // Stroke is still invisible here.
                    path.set(attrs);

                    fade.retries = pathMatches(path, e) ? 0 : fade.retries + 1;

                    if (fade.retries >= MAX_POSITION_RETRIES)
                    {
                        fade.phase = 'failed';
                    }
                    else
                    {
                        fade.phase = 'settle';
                        delay = MOVE_SETTLE_MS;
                    }
                }
                else if (fade.phase === 'settle')
                {
                    if (pathMatches(path, getEndpoints(first, second)))
                    {
                        fade.phase = 'in';
                        fade.step = 0;
                    }
                    else
                    {
                        fade.phase = 'move';
                        delay = 0;
                    }
                }
                else if (fade.phase === 'in')
                {
                    // Token moved while waiting: reposition before showing.
                    if (fade.step === 0 && !pathMatches(path, getEndpoints(first, second)))
                    {
                        fade.phase = 'move';
                        delay = 0;
                    }
                    else
                    {
                        fade.step++;
                        const style = getEffectiveDraw(link, getDistance(first, second));
                        const parts = hexToRgbaParts(style.color);
                        const stroke = (fade.step >= MOVE_FADE_STEPS || !parts)
                            ? style.color
                            : toHexAlphaColor(parts, parts.a * fade.step / MOVE_FADE_STEPS);

                        setStyle(stroke, style.width);

                        if (fade.step >= MOVE_FADE_STEPS) fade.phase = 'done';
                    }
                }
            }
            catch (err)
            {
                log(`${SCRIPT}: fade error for ${link.path}: ${err.message}`);
                fade.phase = 'failed';
            }

            if (fade.phase === 'done')
            {
                activeFades.delete(link);
                // Picks up a move made during the fade-in.
                fadeMovedLink(link);
            }
            else if (fade.phase === 'failed')
            {
                activeFades.delete(link);
                log(`${SCRIPT}: path ${link.path} could not be moved; recreating it.`);
                redrawLink(link);
            }
            else
            {
                setTimeout(tick, delay);
            }
        };

        setTimeout(tick, fade.phase === 'out' ? stepMs : 0);
    };

    // Removes exceeds|delete links that are past their threshold.
    const applyThresholdDeletions = () => {
        const s = state[SCRIPT];
        if (!s || !s.links) return;

        const toDelete = new Set();

        s.links.forEach(link => {
            if (link.exceeds !== 'delete' || link.threshold == null) return;

            const a = getObj('graphic', link.a);
            const b = getObj('graphic', link.b);
            if (!a || !b) return;

            if (getDistance(a, b) > link.threshold) toDelete.add(link);
        });

        if (toDelete.size === 0) return;

        state[SCRIPT].links = state[SCRIPT].links.filter(link => {
            if (!toDelete.has(link)) return true;
            const p = getObj('pathv2', link.path);
            if (p) p.remove();
            return false;
        });

        log(`${SCRIPT}: auto-removed ${toDelete.size} tether(s) past their exceeds|delete threshold.`);
    };

    // In-place redraw of the links attached to one token.
    const redrawLinksForToken = tokenId => {
        const s = state[SCRIPT];
        if (!s || !s.links) return;

        s.links
            .filter(link => link.a === tokenId || link.b === tokenId)
            .forEach(link =>
            {
                const animate = MOVE_ANIMATION && (link.type || DEFAULTS.type) === 'transparent';

                if (animate) fadeMovedLink(link);
                else redrawLink(link, true);
            });

        applyThresholdDeletions();
    };

    // Removes links for a deleted token.
    const pruneLinksForToken = id => {
        const s = state[SCRIPT];
        if (!s || !s.links) return;

        s.links = s.links.filter(link => {
            const match = link.a === id || link.b === id;
            if (match) {
                const p = getObj('pathv2', link.path);
                if (p) p.remove();
            }
            return !match;
        });
    };

    // After a restart, retries before pruning links whose tokens are missing.
    const reconcileAtReady = (attempt = 0) => {
        const s = state[SCRIPT];
        if (!s || !s.links || s.links.length === 0) return;

        const stillMissing = [];

        s.links.forEach(link => {
            const ok = redrawLink(link);
            if (!ok) stillMissing.push(link);
        });

        if (stillMissing.length === 0) {
            applyThresholdDeletions();
            return;
        }

        if (attempt + 1 < READY_RETRY_DELAYS.length) {
            setTimeout(
                () => reconcileAtReady(attempt + 1),
                READY_RETRY_DELAYS[attempt + 1]
            );
            return;
        }

        // Retries exhausted: these tokens are gone.
        const missingIds = new Set();
        stillMissing.forEach(link => {
            if (!getObj('graphic', link.a)) missingIds.add(link.a);
            if (!getObj('graphic', link.b)) missingIds.add(link.b);
        });

        state[SCRIPT].links = state[SCRIPT].links.filter(link => {
            const dead = missingIds.has(link.a) || missingIds.has(link.b);
            if (dead) {
                const p = getObj('pathv2', link.path);
                if (p) p.remove();
            }
            return !dead;
        });

        log(`${SCRIPT}: pruned ${missingIds.size} tether(s) with missing tokens after ${attempt + 1} checks.`);

        applyThresholdDeletions();
    };

    const findLink = (id1, id2) =>
        state[SCRIPT].links.find(link =>
            (link.a === id1 && link.b === id2) ||
            (link.a === id2 && link.b === id1)
        );

    const addLink = (a, b, opts) =>
    {
        const id1 = a.get('_id');
        const id2 = b.get('_id');

        const existing = findLink(id1, id2);

        if(existing)
        {
            existing.width = opts.width;
            existing.color = opts.color;
            existing.layer = opts.layer;
            existing.type = opts.type;
            existing.threshold = opts.threshold;
            existing.exceeds = opts.exceeds;

            redrawLink(existing);
            applyThresholdDeletions();
            return;
        }

        const link =
        {
            a: id1,
            b: id2,
            path: null,
            width: opts.width,
            color: opts.color,
            layer: opts.layer,
            type: opts.type,
            threshold: opts.threshold,
            exceeds: opts.exceeds
        };

        state[SCRIPT].links.push(link);

        redrawLink(link);
        applyThresholdDeletions();
    };

    const removeLink = (id1, id2) =>
    {

        state[SCRIPT].links = state[SCRIPT].links.filter(link =>
        {

            const match =
                (link.a === id1 && link.b === id2) ||
                (link.a === id2 && link.b === id1);

            if(match)
            {
                const p = getObj('pathv2', link.path);
                if(p) p.remove();
                return false;
            }

            return true;
        });
    };

    const removeAllOnPage = pageid =>
    {

        state[SCRIPT].links = state[SCRIPT].links.filter(link =>
        {

            const path = getObj('pathv2', link.path);

            if(path && path.get('_pageid') === pageid)
            {
                path.remove();
                return false;
            }

            return true;
        });

    };

    const removeSelected = selectedIds =>
    {

        state[SCRIPT].links = state[SCRIPT].links.filter(link =>
        {

            const match =
                selectedIds.includes(link.a) ||
                selectedIds.includes(link.b);

            if(match)
            {
                const p = getObj('pathv2', link.path);
                if(p) p.remove();
                return false;
            }

            return true;
        });

    };

    on('chat:message', msg =>
    {

        if(msg.type !== 'api') return;

        checkInstall();

        // Match the whole command word, not a prefix.
        const command = msg.content.trim().split(/\s+/)[0];

        if(msg.content.trim().toLowerCase() === '!tether help')
        {
            showHelp(msg.playerid);
            return;
        }

        if(command === '!tether-debug')
        {
            const resolved = resolvePairFromMessage(msg);
            if(resolved.error)
            {
                whisperError(msg.playerid, resolved.error);
                return;
            }

            const { a, b, opts } = resolved;

            const settings = getPageSettings(a.get('_pageid'));
            const distance = getDistance(a, b);

            let preview = '';
            if(opts.threshold != null)
            {
                const previewLink = {
                    color: opts.color,
                    width: opts.width,
                    threshold: opts.threshold,
                    exceeds: opts.exceeds
                };
                const draw = getEffectiveDraw(previewLink, distance);

                preview = `<br><br><b>Threshold preview</b>` +
                    `<br>threshold: ${opts.threshold} | exceeds: ${opts.exceeds}` +
                    `<br>over threshold: ${distance > opts.threshold}` +
                    `<br>effective color: ${draw.color}` +
                    `<br>effective width: ${draw.width.toFixed(2)}`;
            }

            const report = `
<div style="border:1px solid #666;background:#eee;color:#111;padding:6px;border-radius:5px;font-size:12px;">
<b>Tether Debug</b>
<br>diagonaltype: ${settings.diagonaltype}
<br>scale_number: ${settings.scale_number}
<br>snapping_increment: ${settings.snapping_increment}
<br>distance: ${distance.toFixed(2)}${preview}
</div>`;

            sendChat(
                SCRIPT,
                `/w ${whisperTarget(msg.playerid)} ${report.replace(/\n\s*/g,'')}`
            );
            return;
        }

        if(command === '!tether')
        {

            const resolved = resolvePairFromMessage(msg);
            if(resolved.error)
            {
                whisperError(msg.playerid, resolved.error);
                return;
            }

            addLink(resolved.a, resolved.b, resolved.opts);
        }

        if(command === '!untether')
        {

            const args = msg.content.trim().toLowerCase().split(/\s+/);

            switch(args[1])
            {

                case 'all':
                    removeAllOnPage(
                        getPageForPlayer(msg.playerid)
                    );
                    break;

                case 'selected':
                    if(!msg.selected || msg.selected.length === 0)
                    {
                        sendChat(SCRIPT, '/w gm Select one or more tokens.');
                        return;
                    }

                    removeSelected(
                        msg.selected.map(s => s._id)
                    );
                    break;

                default: {
                    const resolved = resolvePairFromMessage(msg, false);
                    if(resolved.error)
                    {
                        whisperError(msg.playerid, resolved.error);
                        return;
                    }

                    removeLink(
                        resolved.a.get('_id'),
                        resolved.b.get('_id')
                    );
                    break;
                }
            }
        }

    });

    on('change:graphic:left', obj =>
    {
        redrawLinksForToken(obj.id);
    });

    on('change:graphic:top', obj =>
    {
        redrawLinksForToken(obj.id);
    });

    // Prunes links as soon as a token is deleted.
    on('destroy:graphic', obj =>
    {
        checkInstall();
        pruneLinksForToken(obj.id);
    });

    on('ready', () =>
    {
        checkInstall();

        log(`Tether state: ${JSON.stringify(state[SCRIPT])}`);

        setTimeout(() => {
            reconcileAtReady(0);
        }, READY_RETRY_DELAYS[0]);

        log(`${SCRIPT} v${VERSION} Ready`);
    });

})();
