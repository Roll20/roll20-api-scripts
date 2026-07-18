const Tether = (() =>
{
    'use strict';

    const SCRIPT = 'Tether';
    const VERSION = '1.0';

    const DEFAULTS = {
        width: 5,
        color: '#0000ff',
        layer: 'objects',
        type: 'transparent'
    };

    const VALID_LAYERS = ['objects', 'gmlayer', 'map', 'walls', 'foreground'];

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
<br><br>

<b>Remove:</b>
<br>
!untether - remove selected pair
<br>
!untether selected - remove all tethers involving selected tokens
<br>
!untether all - remove all tethers on current page
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

    const updateLink = link =>
    {

        link.width ||= DEFAULTS.width;
        link.color ||= DEFAULTS.color;
        link.layer ||= DEFAULTS.layer;
        link.type ||= DEFAULTS.type;

        const a = getObj('graphic', link.a);
        const b = getObj('graphic', link.b);

        if(!a || !b)
        {
            const old = getObj('pathv2', link.path);
            if(old) old.remove();
            return false;
        }

        const old = getObj('pathv2', link.path);
        if(old) old.remove();

        const e = getEndpoints(a, b);

        const path = createObj('pathv2',
        {
            _pageid: a.get('_pageid'),
            shape: 'pol',
            points: JSON.stringify(e.points),
            x: e.x,
            y: e.y,
            stroke: link.color,
            stroke_width: link.width,
            fill: 'transparent',
            layer: link.layer,
            barrierType: link.type
        });

        if(!path)
        {
            return true;
        }

        link.path = path.get('_id');

        return true;
    };



    const cleanup = () =>
    {
        const s = state[SCRIPT];
        if(!s || !s.links) return;

        s.links = s.links.filter(updateLink);
    };

    const findLink = (id1, id2) =>
        state[SCRIPT].links.find(link =>
            (link.a === id1 && link.b === id2) ||
            (link.a === id2 && link.b === id1)
        );

    const addLink = (a, b, opts, pageid) =>
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

            const path = getObj('pathv2', existing.path);

            if(path)
            {
                path.set(
                {
                    stroke: opts.color,
                    stroke_width: opts.width,
                    layer: opts.layer,
                    barrierType: opts.type
                });
            }

            return;
        }

        const e = getEndpoints(a, b);

        const path = createObj('pathv2',
        {
            _pageid: pageid,
            shape: 'pol',
            points: JSON.stringify(e.points),
            x: e.x,
            y: e.y,
            stroke: opts.color,
            stroke_width: opts.width,
            fill: 'transparent',
            layer: opts.layer,
            barrierType: opts.type
        });

        state[SCRIPT].links.push(
        {
            a: id1,
            b: id2,
            path: path.get('_id'),
            width: opts.width,
            color: opts.color,
            layer: opts.layer,
            type: opts.type
        });
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


        if(msg.content.trim().toLowerCase() === '!tether help')
        {
            showHelp(msg.playerid);
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

            addLink(
                a,
                b,
                opts,
                getPageForPlayer(msg.playerid)
            );
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
        cleanup();
    });

    on('change:graphic:top', obj =>
    {
        cleanup();
    });

    on('ready', () =>
    {
        checkInstall();
        cleanup();
        log(`${SCRIPT} v${VERSION} Ready`);
    });

})();
