const Tether = (() =>
{
    'use strict';

    const SCRIPT = 'Tether';
    const VERSION = '1.0';

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

    // How long to wait after 'ready' before checking links, and how many
    // times to retry before concluding a linked token is genuinely gone
    // (as opposed to just not being loaded into the sandbox cache yet).
    const READY_RETRY_DELAYS = [2000, 5000, 10000, 20000];

    // Roll20's grid is fixed at 70px per grid square regardless of page
    // settings - this is a platform constant, not something pages configure.
    const PIXELS_PER_SQUARE = 70;

    // Distance (in the page's own scale_units) within which attenuate/stretch
    // stay at full strength (full opacity / full width). Beyond this, effect
    // strength fades linearly all the way out to the link's threshold.
    const FULL_STRENGTH_RANGE_UNITS = 5;

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


    const showHelp = playerid =>
    {

        const help = `
<div style="border:1px solid #666;background:#ccc;color:#111;padding:8px;border-radius:5px;font-size:12px;">
<b><span style = "font-size:16px;">Tether</span></b>
<br>
Connect two selected tokens with an updating path.
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
<br><br>

<b>Remove:</b>
<br>
!untether - remove selected pair
<br>
!untether selected - remove all tethers involving selected tokens
<br>
!untether all - remove all tethers on current page
<br><br>

<b>Debug:</b>
<br>
!tether-debug [options] - select 2 tokens to see computed distance and, if
threshold|/exceeds| are included, a preview of the effective draw values
</div>`;

        sendChat(
            SCRIPT,
            `/w "${getObj('player',playerid).get('_displayname')}" ${help.replace(/\n\s*/g,'')}`
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

    // Parses a 6- or 8-digit hex color (with or without leading #) into RGBA
    // components. Returns null for anything else (named colors, malformed
    // strings) - alpha-based threshold effects are skipped gracefully in
    // that case rather than guessing.
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

    // Distance between two graphics' centerpoints, in the page's own scale
    // units, respecting the page's diagonal-counting method.
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

    // Computes the color/width that should actually be drawn for a link,
    // given its BASE color/width (as set by color|/width|, never mutated)
    // and the current distance between its tokens. This is recomputed fresh
    // on every redraw, so "reversing" as tokens move back into range just
    // falls out of the math automatically.
    const getEffectiveDraw = (link, distance) => {
        const base = { color: link.color, width: link.width };

        if (link.threshold == null) return base;

        const exceeds = link.exceeds || 'off';
        const overThreshold = distance > link.threshold;
        const baseParts = hexToRgbaParts(link.color);

        // Fade progress (0 = full strength, 1 = at threshold) across the
        // span from FULL_STRENGTH_RANGE_UNITS out to the threshold itself.
        // Degenerate case (threshold at or inside the full-strength range)
        // just snaps straight to max fade past that point.
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

                const alpha = baseParts.a * (1 - fadeProgress * 0.8); // 100% -> 20% of initial
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
                // Handled separately by applyThresholdDeletions(); draw as
                // normal until the deletion pass removes the link entirely.
                return base;

            default: {
                // Not a keyword, so exceeds is a hex colorvalue.
                if (!overThreshold) return base;
                return { color: exceeds, width: link.width };
            }
        }
    };

    const parseOptions = content =>
    {
        const opts = {
            ...DEFAULTS
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
            }
        });

        return opts;
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

    // Redraws a single link's path if (and only if) both endpoints currently
    // exist. Returns true/false but never mutates state[SCRIPT].links itself -
    // this function is intentionally non-destructive.
    const redrawLink = link => {

        link.width ||= DEFAULTS.width;
        link.color ||= DEFAULTS.color;
        link.layer ||= DEFAULTS.layer;
        link.type ||= DEFAULTS.type;
        if (link.threshold === undefined) link.threshold = DEFAULTS.threshold;
        if (!link.exceeds) link.exceeds = DEFAULTS.exceeds;

        const a = getObj('graphic', link.a);
        const b = getObj('graphic', link.b);

        if (!a || !b) return false;

        const old = getObj('pathv2', link.path);
        if (old) old.remove();

        const e = getEndpoints(a, b);

        const draw = link.threshold == null
            ? { color: link.color, width: link.width }
            : getEffectiveDraw(link, getDistance(a, b));

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

    // Separate pass for exceeds|delete links: can't safely splice the array
    // mid-forEach inside redrawLink, so we redraw everything first, then
    // sweep for any link whose current distance is past its threshold and
    // remove it exactly like !untether would.
    const applyThresholdDeletions = () => {
        const s = state[SCRIPT];
        if (!s || !s.links) return;

        const toDelete = new Set();

        s.links.forEach(link => {
            if (link.exceeds !== 'delete' || link.threshold == null) return;

            const a = getObj('graphic', link.a);
            const b = getObj('graphic', link.b);
            if (!a || !b) return; // handled by pruneLinksForToken instead

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

    // Non-destructive redraw of every link. Used on token move events. Any
    // link whose endpoints can't currently be found is simply skipped, not
    // removed - a legitimate move event implies the sandbox is fully loaded,
    // so a missing endpoint here just means "not this link's tokens", not
    // "delete this link". Also sweeps for exceeds|delete links past their
    // threshold, since a move is exactly when that needs to be checked.
    const redrawAll = () => {
        const s = state[SCRIPT];
        if (!s || !s.links) return;
        s.links.forEach(redrawLink);
        applyThresholdDeletions();
    };

    // Destructive removal, only ever called when we're confident a token is
    // actually gone (real-time destroy:graphic event, or after exhausting
    // retries at ready-time reconciliation below).
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

    // Ready-time reconciliation. Retries several times with growing delays
    // before concluding a linked token was genuinely deleted while the
    // sandbox was offline. This replaces the old single-shot cleanup() that
    // ran once at a fixed 2s delay - in larger campaigns getObj can still
    // transiently miss objects at that point, and the old code treated any
    // miss as "token deleted", permanently wiping valid links from state on
    // every restart. Now we only prune after several misses in a row.
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

        // Exhausted retries - these tokens are genuinely gone, safe to prune.
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

        if(msg.content.trim().toLowerCase() === '!tether help')
        {
            showHelp(msg.playerid);
            return;
        }

        if(msg.content.startsWith('!tether-debug'))
        {
            if(!msg.selected || msg.selected.length !== 2)
            {
                sendChat(SCRIPT, '/w gm Select exactly two tokens.');
                return;
            }

            const a = getObj('graphic', msg.selected[0]._id);
            const b = getObj('graphic', msg.selected[1]._id);

            if(!a || !b)
            {
                return;
            }

            const settings = getPageSettings(a.get('_pageid'));
            const distance = getDistance(a, b);
            const opts = parseOptions(msg.content);

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
                `/w "${getObj('player',msg.playerid).get('_displayname')}" ${report.replace(/\n\s*/g,'')}`
            );
            return;
        }

        if(msg.content.startsWith('!tether'))
        {

            if(!msg.selected || msg.selected.length !== 2)
            {
                sendChat(SCRIPT, '/w gm Select exactly two tokens.');
                return;
            }

            const a = getObj('graphic', msg.selected[0]._id);
            const b = getObj('graphic', msg.selected[1]._id);

            if(!a || !b)
            {
                return;
            }

            const opts = parseOptions(msg.content);

            addLink(a, b, opts);
        }

        if(msg.content.startsWith('!untether'))
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


                default:

                    if(!msg.selected || msg.selected.length !== 2)
                    {
                        sendChat(SCRIPT, '/w gm Select exactly two tokens.');
                        return;
                    }

                    removeLink(
                        msg.selected[0]._id,
                        msg.selected[1]._id
                    );
                    break;
            }
        }



    });

    on('change:graphic:left', obj =>
    {
        redrawAll();
    });

    on('change:graphic:top', obj =>
    {
        redrawAll();
    });

    // Real-time, reliable detection of token deletion - this is what
    // actually prunes dead links during normal play, rather than inferring
    // deletion from a failed getObj() call during unrelated events.
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