// Script:  Ping Buddy
// By:      Keith Curtis, page-start function adapted from Nick Olivo
// Contact: https://app.roll20.net/users/162065/keithcurtis
// Forum:   https://app.roll20.net/forum/post/11095028/script-ping-buddy
// 1.0.0    Rebuilt: !ping command, menus, seen and unseen pulls, Follow settings, Follow the turn,
//          map pins, help handout. Older commands and tooltip codes still work.

const PingBuddy = (() => {
    'use strict';

    // Config
    const scriptName = 'PingBuddy';
    const displayName = 'Ping Buddy';
    const command = '!ping';
    const version = '1.0.0';
    const lastUpdate = 1793644302;
    const schemaVersion = 1.2;
    const DEBUG = false;

    const PAGE_CHANGE_DELAY = 1500;
    const HELP_HANDOUT = 'Help: Ping Buddy';
    const HELP_FOR_PLAYERS = true; // new help handout is shared with all players
    // Tooltip code words and what they do: all* pulls everyone on the page, me* pulls the token's controller
    const CODES = {
        party: 'allunseen', pingallunseen: 'allunseen',
        pingallseen: 'allseen', ping: 'allseen',
        pingmeseen: 'meseen', pingme: 'meseen',
        pingmeunseen: 'meunseen', pingmesilent: 'meunseen'
    };
    const FOLLOW_CODES = { seen: 'pingmeseen', unseen: 'pingmeunseen' };
    const MODES = { off: 'Off', seen: 'Seen', unseen: 'Unseen' };
    const LAYERS = {
        objects: { label: 'Token layer', color: '#296a30' },
        gmlayer: { label: 'GM layer', color: '#256293' },
        map: { label: 'Map layer', color: '#870750' },
        foreground: { label: 'Foreground layer', color: '#cb4e00' },
        walls: { label: 'Lighting layer', color: '#996700' }
    };

    // CSS
    const CSS = {
        box: 'background-color:#888;border-radius:18px;color:#000;font-family:Arial;font-size:13px;padding:8px;',
        header: 'display:block;background-color:#333;color:#f0c040;font-weight:bold;padding:2px;border-radius:20px;text-align:center;',
        section: 'background-color:#ccc;border:1px solid black;padding:3px 8px;border-radius:15px;margin-top:6px;',
        button: 'background-color:#333;color:#eee;text-decoration:none;border:1px solid #f0c040;border-radius:15px;padding:0 6px;display:inline-block;',
        buttonLabel: 'color:#eee;',
        buttonGap: 'margin:2px 2px 2px 0;',
        muted: 'color:#333;font-size:12px;',
        // Token lists
        listHead: 'font-weight:bold;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#333;margin:6px 0 2px 0;',
        row: 'margin:2px 0;line-height:26px;',
        // Links in chat get Roll20's default button look unless background, border and padding are set
        rowImgLink: 'display:inline-block;vertical-align:middle;margin:0 6px 0 0;padding:0;border:none;background-color:transparent;text-decoration:none;',
        rowNameLink: 'vertical-align:middle;margin:0;padding:0;border:none;background-color:transparent;color:#000;text-decoration:none;',
        rowNameLabel: 'color:#000;',
        rowImg: 'width:24px;height:24px;vertical-align:middle;border:1px solid #555;border-radius:3px;background-color:#eee;',
        rowCount: 'vertical-align:middle;color:#333;font-size:12px;',
        followLine: 'margin:0 0 3px 30px;font-size:11px;color:#333;white-space:nowrap;',
        pillGroup: 'white-space:nowrap;',
        // Rows are one-line tables: names wrap in their own cell, buttons stay on the right
        rowTable: 'width:100%;border-collapse:collapse;margin:1px 0;',
        tdImg: 'width:30px;padding:0;vertical-align:middle;',
        tdBar: 'width:4px;padding:0 3px 0 0;vertical-align:middle;',
        bar: 'width:4px;font-size:0;line-height:0;',
        tdName: 'padding:0;vertical-align:middle;line-height:15px;font-size:13px;',
        tdRight: 'padding:0 0 0 4px;text-align:right;white-space:nowrap;vertical-align:middle;',
        pill: 'display:inline-block;background-color:#ddd;border:1px solid #999;border-radius:7px;padding:0 4px;margin:0 0 0 2px;font-size:10px;line-height:14px;text-decoration:none;',
        pillLabel: 'color:#000;',
        pillOn: 'display:inline-block;background-color:#333;border:1px solid #f0c040;border-radius:7px;padding:0 4px;margin:0 0 0 2px;font-size:10px;line-height:14px;text-decoration:none;',
        pillOnLabel: 'color:#f0c040;',
        pillDim: 'display:inline-block;background-color:#eee;border:1px solid #ccc;border-radius:7px;padding:0 4px;margin:0 0 0 2px;font-size:10px;line-height:14px;text-decoration:none;',
        pillDimLabel: 'color:#999;',
        gmNote: 'font-size:10px;color:#555;',
        playerHead: 'width:100%;border-collapse:collapse;margin:4px 0 1px 0;border-top:1px solid #999;',
        playerName: 'padding:3px 0 1px 0;vertical-align:middle;font-weight:bold;line-height:15px;font-size:13px;',
        centerLine: 'font-size:12px;margin:0 0 4px 0;',
        divider: 'border-top:1px solid #999;margin:4px 0;',
        menuButton: 'display:block;background-color:#333;color:#eee;text-decoration:none;border:1px solid #f0c040;border-radius:15px;padding:1px 8px;margin:3px 0;text-align:center;',
        // Help handout
        hH1: 'font-family:Arial;font-size:20px;font-weight:bold;margin:0 0 6px 0;',
        hH2: 'font-family:Arial;font-size:16px;font-weight:bold;margin:14px 0 4px 0;border-bottom:1px solid #999;',
        hPara: 'font-family:Arial;font-size:13px;margin:0 0 6px 0;',
        hList: 'font-family:Arial;font-size:13px;margin:0 0 6px 0;padding-left:20px;',
        hCode: 'font-family:monospace;background-color:#eee;padding:0 3px;border-radius:3px;',
        hToc: 'font-family:Arial;font-size:13px;margin:0 0 10px 0;',
        hTable: 'border-collapse:collapse;margin:0 0 8px 0;font-family:Arial;font-size:12px;',
        hTh: 'border:1px solid #999;padding:2px 6px;background-color:#ddd;text-align:left;vertical-align:top;',
        hTd: 'border:1px solid #999;padding:2px 6px;vertical-align:top;',
        hNote: 'font-family:Arial;font-size:11px;color:#555;font-style:italic;margin:0 0 8px 0;'
    };

    // Logger
    const Logger = {
        log: (msg) => log(`${scriptName} | ${msg}`),
        debug: (msg) => { if (DEBUG) log(`${scriptName} [DEBUG] | ${msg}`); },
        error: (msg) => log(`${scriptName} [ERROR] | ${msg}`)
    };

    // State
    const State = {
        initialize: () => {
            if (!state[scriptName] || state[scriptName].version !== schemaVersion) {
                Logger.log(`Updating schema to v${schemaVersion}`);

                // Carry over the single stored color from versions before 1.0.0
                const legacy = state.pingBuddy && state.pingBuddy.restoreColor;
                const legacyColor = (legacy && legacy !== 'transparent') ? legacy : null;

                const s = state[scriptName];
                switch (s && s.version) {
                    case 1.0:
                        s.center = {};
                        /* falls through */
                    case 1.1: {
                        // 1.2: Always center becomes Follow all, with seen/unseen values; adds Follow the turn
                        const renamed = { on: 'seen', quiet: 'unseen' };
                        s.followAll = {};
                        Object.keys(s.center || {}).forEach(id => {
                            if (renamed[s.center[id]]) s.followAll[id] = renamed[s.center[id]];
                        });
                        delete s.center;
                        s.followTurn = { mode: 'off', to: 'everyone' };
                        s.version = schemaVersion;
                        break;
                    }
                    default:
                        state[scriptName] = {
                            version: schemaVersion,
                            restoreColors: {},
                            legacyColor,
                            helpVersion: null,
                            followAll: {},
                            followTurn: { mode: 'off', to: 'everyone' }
                        };
                        break;
                }
                delete state.pingBuddy;
            }
        },
        get: () => state[scriptName]
    };

    // Parser: !ping --key value | --key multi word value
    const Parser = {
        parse: (content) => {
            const tokens = content.trim().split(/\s+/);
            const cmd = tokens.shift();
            const args = {};
            let currentKey = null;

            tokens.forEach(token => {
                if (token.startsWith('--')) {
                    currentKey = token.replace(/^--/, '').toLowerCase();
                    args[currentKey] = true;
                    return;
                }
                if (!currentKey) return;
                if (token.includes('|') && args[currentKey] === true) {
                    const [k, ...rest] = token.split('|');
                    args[currentKey] = rest.join('|') || k;
                } else if (args[currentKey] === true) {
                    args[currentKey] = token;
                } else {
                    args[currentKey] += ` ${token}`;
                }
            });

            return { command: cmd, args };
        }
    };

    // Utilities
    const escapeHTML = (s) => String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const toMap = (v) => {
        if (!v) return {};
        if (typeof v === 'string') {
            try { return JSON.parse(v) || {}; } catch (e) { return {}; }
        }
        return v;
    };

    const getPageForPlayer = (playerid) => {
        const player = getObj('player', playerid);
        if (player && playerIsGM(playerid)) {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }
        const psp = toMap(Campaign().get('playerspecificpages'));
        if (psp[playerid]) return psp[playerid];
        return Campaign().get('playerpageid');
    };

    // Players: GM lookup and token control
    const Players = {
        splitIds: (s) => (s || '').split(',').map(x => x.trim()).filter(x => x && x !== 'all'),

        getGMs: () => findObjs({ _type: 'player' }).filter(p => playerIsGM(p.id)),

        // The API does not report who moved a token, so prefer an online GM viewing that page
        getGMForPage: (pageId) => {
            const gms = Players.getGMs();
            return gms.find(g => g.get('_online') && getPageForPlayer(g.id) === pageId)
                || gms.find(g => g.get('_online'))
                || gms[0];
        },

        getCharacterControllers: (token) => {
            const char = getObj('character', token.get('represents'));
            return char ? Players.splitIds(char.get('controlledby')) : [];
        },

        // Character controllers first, token controllers if the character has none; players before GMs
        getControllers: (token) => {
            const ids = Players.getCharacterControllers(token);
            const list = ids.length ? ids : Players.splitIds(token.get('controlledby'));
            return list.filter(id => !playerIsGM(id)).concat(list.filter(id => playerIsGM(id)));
        },

        controls: (token, playerid) =>
            Players.getCharacterControllers(token).includes(playerid)
            || Players.splitIds(token.get('controlledby')).includes(playerid),

        getName: (playerid) => {
            const p = getObj('player', playerid);
            return p ? p.get('_displayname') : 'Unknown player';
        }
    };

    // Name matching: case-insensitive exact, then starts-with, then contains
    const Match = {
        norm: (s) => (s || '').toLowerCase().replace(/\s+/g, ' ').trim(),

        findByName: (tokens, query) => {
            const q = Match.norm(query);
            if (!q) return undefined;
            const named = tokens
                .map(t => ({ t, n: Match.norm(t.get('name')) }))
                .filter(o => o.n);
            const hit = named.find(o => o.n === q)
                || named.find(o => o.n.startsWith(q))
                || named.find(o => o.n.includes(q));
            return hit && hit.t;
        }
    };

    // Token behaviors: a tooltip that is exactly a code word, then the first [code] in the tooltip, then a token named "Party"
    const CODE_RE = /\[(pingallunseen|pingallseen|pingmeunseen|pingmeseen|pingmesilent|pingme|party|ping)\]/i;
    const FOLLOW_RE = /\s*\[(pingmeunseen|pingmeseen|pingmesilent|pingme)\]/gi;

    const Behavior = {
        get: (token) => {
            const tip = Match.norm(token.get('tooltip'));
            if (CODES[tip]) return CODES[tip];
            const m = tip.match(CODE_RE);
            if (m) return CODES[m[1].toLowerCase()];
            if (Match.norm(token.get('name')) === 'party') return 'allunseen';
            return null;
        },

        // Codes that pull everyone are set by the GM and are not changed by the Follow buttons
        isGMSet: (token) => ['allunseen', 'allseen'].includes(Behavior.get(token)),

        followMode: (token) => {
            const b = Behavior.get(token);
            if (b === 'meseen') return 'seen';
            if (b === 'meunseen') return 'unseen';
            return 'off';
        },

        // Removes any Follow code (current or older) and adds the new one; other tooltip text is kept
        setFollow: (token, mode) => {
            const raw = token.get('tooltip') || '';
            const bare = ['pingme', 'pingmesilent', 'pingmeseen', 'pingmeunseen'].includes(Match.norm(raw));
            let tip = bare ? '' : raw.replace(FOLLOW_RE, '').trim();
            if (FOLLOW_CODES[mode]) tip = tip ? `${tip} [${FOLLOW_CODES[mode]}]` : `[${FOLLOW_CODES[mode]}]`;
            if (tip !== raw) token.set('tooltip', tip);
        },

        // The Party token: pulls everyone unseen; also the page-start target
        isParty: (token) => Behavior.get(token) === 'allunseen',
        findPartyToken: (pageId) =>
            findObjs({ _type: 'graphic', _pageid: pageId }).find(Behavior.isParty)
    };

    // Follow all: a player's view follows every token whose character lists them as its first player controller
    const FollowAll = {
        modeFor: (pid) => (State.get().followAll || {})[pid] || 'off',

        set: (pid, mode) => {
            const f = State.get().followAll = State.get().followAll || {};
            if (mode === 'off') delete f[pid]; else f[pid] = mode;
        },

        // "All players" does not count, and GMs are skipped
        ownerOf: (token) => {
            const char = getObj('character', token.get('represents'));
            if (!char) return null;
            return Players.splitIds(char.get('controlledby')).find(id => !playerIsGM(id)) || null;
        }
    };

    // Follow the turn: GM setting. TurnMarker1, Combat Master, Combat Assistant and CombatTracker also pull on turn change
    const FollowTurn = {
        get: () => State.get().followTurn || { mode: 'off', to: 'everyone' },
        set: (mode, to) => { State.get().followTurn = { mode, to }; },
        // typeof is safe for names that were never declared
        conflicts: () => {
            const found = [];
            if (typeof TurnMarker !== 'undefined') found.push('TurnMarker1');
            if (typeof CombatMaster !== 'undefined') found.push('Combat Master');
            if (typeof CombatAssistant !== 'undefined') found.push('Combat Assistant');
            if (typeof CombatTracker !== 'undefined') found.push('CombatTracker');
            return found;
        }
    };

    // Earlier versions hid the ping animation by making the GM color transparent; repair any left that way
    const Color = {
        repairAll: () => {
            const saved = State.get().restoreColors || {};
            Players.getGMs().forEach(gm => {
                const c = gm.get('color');
                if (c && c !== 'transparent') return;
                const color = saved[gm.id] || State.get().legacyColor;
                if (!color) return;
                gm.set('color', color);
                Logger.log(`Restored player color for GM ${gm.get('_displayname')}`);
            });
        }
    };

    // Ping rules, from live tests:
    // - sent as a player and shown only to them: they are pulled with no ping circle (unseen)
    // - sent as the GM and shown only to a player: they are pulled and see the circle in the GM's color (seen)
    // - a ping shown only to some players does not affect anyone else, including the GM
    // - a GM always sees the circle for a ping sent to them, so a GM can only get a seen pull
    // - Roll20 sometimes moves a GM's view along with the players' pings and sometimes not
    const Ping = {
        // Everyone on the page, seen, sent as the GM
        all: (left, top, pageId, gmId) => sendPing(left, top, pageId, gmId, true),

        // Each person is pulled by a ping sent as themselves
        unseenFor: (left, top, pageId, ids) => {
            [...new Set(ids)].forEach(id => sendPing(left, top, pageId, id, true, id));
        },

        // One person, pulled with the circle shown in the GM's color
        seenFor: (left, top, pageId, id) => {
            const gm = Players.getGMForPage(pageId);
            sendPing(left, top, pageId, gm ? gm.id : id, true, id);
        },

        // Online GMs whose last-opened page is this one
        gmsViewing: (pageId) => Players.getGMs()
            .filter(g => g.get('_online') && getPageForPlayer(g.id) === pageId)
            .map(g => g.id),

        // Seen pull for GMs viewing the page, so the GM reliably follows along
        gmFollow: (left, top, pageId) => {
            Ping.gmsViewing(pageId).forEach(id => sendPing(left, top, pageId, id, true, id));
        },

        // Online non-GM players viewing the page
        viewers: (pageId) => findObjs({ _type: 'player' })
            .filter(p => !playerIsGM(p.id) && p.get('_online') && getPageForPlayer(p.id) === pageId)
            .map(p => p.id),

        // Requester's pull: everyone on the page (seen, GM color), or only the requester with --solo
        forRequest: (pid, left, top, pageId, solo) => {
            if (solo) return Ping.seenFor(left, top, pageId, pid);
            const gm = playerIsGM(pid) ? getObj('player', pid) : Players.getGMForPage(pageId);
            Ping.all(left, top, pageId, gm && gm.id);
        },

        // Unseen pull to the page's Party token: the given players, or every player viewing
        partyOnPage: (pageId, playerIds) => {
            const token = Behavior.findPartyToken(pageId);
            if (!token) return;
            const ids = (playerIds || Ping.viewers(pageId)).filter(id => !playerIsGM(id));
            Ping.unseenFor(token.get('left'), token.get('top'), pageId, ids);
        }
    };

    // Points: object centers, and the middle of the box around several of them
    const Points = {
        // Graphics, paths and text use left/top as center; pathv2 and pins use x/y
        center: (obj) => {
            const left = Number(obj.get('left'));
            const top = Number(obj.get('top'));
            if (Number.isFinite(left) && Number.isFinite(top)) return { left, top };
            const x = Number(obj.get('x'));
            const y = Number(obj.get('y'));
            if (Number.isFinite(x) && Number.isFinite(y)) return { left: x, top: y };
            return null;
        },

        // Middle of the bounding box, so a cluster does not outweigh a single distant object
        boxCenter: (objs) => {
            const pts = objs.map(Points.center).filter(Boolean);
            if (!pts.length) return null;
            const xs = pts.map(p => p.left);
            const ys = pts.map(p => p.top);
            return {
                left: (Math.min(...xs) + Math.max(...xs)) / 2,
                top: (Math.min(...ys) + Math.max(...ys)) / 2
            };
        }
    };

    // Cycling through a list of token IDs, per player and list; resets on sandbox restart
    const Cycle = (() => {
        const positions = {};
        const next = (pid, ids) => {
            const key = `${pid}|${ids.join(',')}`;
            const i = positions[key] || 0;
            positions[key] = (i + 1) % ids.length;
            return ids[i % ids.length];
        };
        return { next };
    })();

    // Token queries shared by commands and menus
    const Tokens = {
        onPage: (pageId) => findObjs({ _type: 'graphic', _subtype: 'token', _pageid: pageId }),

        // Explicit control only: a GM's automatic control of everything does not count
        ownedBy: (pid, pageId, objectsOnly = true) => Tokens.onPage(pageId)
            .filter(t => (!objectsOnly || t.get('layer') === 'objects') && Players.controls(t, pid)),

        partyCharacterIds: () => new Set(
            findObjs({ _type: 'character' }).filter(c => [true, 'true'].includes(c.get('inParty'))).map(c => c.id)),

        // One row per name: { name, tokens, layers }, sorted by name
        groupByName: (tokens) => {
            const rows = {};
            tokens.forEach(t => {
                const name = (t.get('name') || '').trim();
                if (!name) return;
                const row = rows[name] = rows[name] || { name, tokens: [], layers: [] };
                row.tokens.push(t);
                if (!row.layers.includes(t.get('layer'))) row.layers.push(t.get('layer'));
            });
            return Object.values(rows).sort((a, b) =>
                a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
        }
    };

    // Output
    const Output = {
        box: (body, title) =>
            `<div style="${CSS.box}">` +
            (title ? `<div style="${CSS.header}">${title}</div>` : '') +
            `<div style="${CSS.section}">${body}</div></div>`,

        button: (label, link) =>
            `<a style="${CSS.button}" href="${link}"><span style="${CSS.buttonLabel}">${label}</span></a>`,

        whisper: (playerid, body, title) => {
            let target = 'gm';
            if (!playerIsGM(playerid)) {
                const p = getObj('player', playerid);
                if (p) target = p.get('_displayname').replace(/"/g, '');
            }
            sendChat(displayName, `/w "${target}" ${Output.box(body, title)}`, null, { noarchive: true });
        }
    };

    // Menus: token lists and the GM button card
    const Menus = {
        idCommand: (tokens, solo) => `${command} --ids ${tokens.map(t => t.id).join(',')}${solo ? ' --solo' : ''}`,

        // 4px bar before the token image, one stacked segment per layer the row's tokens are on
        bar: (layers) => {
            const height = 26;
            const seg = Math.floor(height / layers.length);
            const title = layers.map(l => (LAYERS[l] || { label: l }).label).join(', ');
            return `<div style="${CSS.bar}" title="${escapeHTML(title)}">` +
                layers.map((l, i) => {
                    const h = i === layers.length - 1 ? height - seg * (layers.length - 1) : seg;
                    return `<div style="width:4px;height:${h}px;background-color:${(LAYERS[l] || { color: '#888' }).color};"></div>`;
                }).join('') + `</div>`;
        },

        pill: (label, cmd, state, title) => {
            const box = state === 'on' ? CSS.pillOn : state === 'dim' ? CSS.pillDim : CSS.pill;
            const text = state === 'on' ? CSS.pillOnLabel : state === 'dim' ? CSS.pillDimLabel : CSS.pillLabel;
            return `<a style="${box}" href="${cmd}"${title ? ` title="${title}"` : ''}><span style="${text}">${label}</span></a>`;
        },

        // Off | Seen | Unseen buttons
        pills: (current, cmdFor, { dim, dimTitle } = {}) =>
            Object.keys(MODES).map(mode =>
                Menus.pill(MODES[mode], cmdFor(mode), dim ? 'dim' : (mode === current ? 'on' : 'off'), dim ? dimTitle : '')
            ).join(''),

        // Follow buttons for a row: a line under the name, or (compact) on the right of the name's line
        followHtml: (tokens, from, followAllOn, compact) => {
            if (tokens.some(Behavior.isGMSet)) {
                return compact
                    ? `<span style="${CSS.gmNote}">Set by GM</span>`
                    : `<div style="${CSS.followLine}">Following is set by the GM.</div>`;
            }
            const ids = tokens.map(t => t.id).join(',');
            const pills = Menus.pills(Behavior.followMode(tokens[0]),
                mode => `${command} --follow ${mode} --ids ${ids} --from ${from}`,
                { dim: followAllOn, dimTitle: 'Follow all is on' });
            return compact
                ? pills
                : `<div style="${CSS.followLine}">Follow: ${pills}${followAllOn ? ' <i>Follow all is on.</i>' : ''}</div>`;
        },

        // Player menu: Follow all, then the tokens on this page
        followAllLine: (pid) => {
            const pills = Menus.pills(FollowAll.modeFor(pid), mode => `${command} --followall ${mode}`);
            return `<div style="${CSS.centerLine}">Follow all my tokens:<br><span style="${CSS.pillGroup}">${pills}</span></div>` +
                `<div style="${CSS.divider}"></div><div style="${CSS.centerLine}">On this page:</div>`;
        },

        // GM Players list: name on the left, Follow all buttons on the right
        playerHeader: (p, first) => {
            const pills = Menus.pills(FollowAll.modeFor(p.id), mode => `${command} --followall ${mode} --ids ${p.id}`);
            return `<table style="${CSS.playerHead}${first ? 'border-top:none;margin-top:0;' : ''}"><tr>` +
                `<td style="${CSS.playerName}">${escapeHTML(p.get('_displayname'))}</td>` +
                `<td style="${CSS.tdRight}padding-top:3px;" title="Follow all">${pills}</td>` +
                `</tr></table>`;
        },

        // Image: pull everyone (imagePublic) or only me; name: always only me
        // follow: { from, show(row), followAllOn(row), compact } adds Follow buttons to rows players control
        row: (row, { imagePublic, follow }) => {
            const img = row.tokens[0].get('imgsrc') || '';
            const cycle = row.tokens.length > 1 ? ', repeat to cycle' : '';
            const count = row.tokens.length > 1 ? ` <span style="${CSS.rowCount}">&times;${row.tokens.length}</span>` : '';
            const followHtml = follow && follow.show(row)
                ? Menus.followHtml(row.tokens, follow.from, follow.followAllOn(row), follow.compact) : '';
            return `<table style="${CSS.rowTable}"><tr>` +
                `<td style="${CSS.tdBar}">${Menus.bar(row.layers)}</td>` +
                `<td style="${CSS.tdImg}"><a style="${CSS.rowImgLink}" href="${Menus.idCommand(row.tokens, !imagePublic)}" title="${imagePublic ? 'Pull everyone' : 'Pull only me'}${cycle}">` +
                `<img style="${CSS.rowImg}" src="${escapeHTML(img)}" alt=""></a></td>` +
                `<td style="${CSS.tdName}"><a style="${CSS.rowNameLink}" href="${Menus.idCommand(row.tokens, true)}" title="Pull only me${cycle}">` +
                `<span style="${CSS.rowNameLabel}">${escapeHTML(row.name)}</span></a>${count}</td>` +
                (follow && follow.compact ? `<td style="${CSS.tdRight}">${followHtml}</td>` : '') +
                `</tr></table>` + (follow && !follow.compact ? followHtml : '');
        },

        list: (rows, opts) => rows.map(r => Menus.row(r, opts)).join(''),

        gmCard: () => [
            ['Selected', command, 'Pull everyone to the center of the selected objects'],
            ['Find by name', `${command} --me ?{Token name} --solo`, 'Pull only you to a token by name'],
            ['In party', `${command} --inparty`, 'Pull everyone to the party members'],
            ['Turn', `${command} --turn`, 'Pull everyone to the token at the top of the turn order'],
            ['Page list', `${command} --page`, 'List the named tokens on this page'],
            ['Players', `${command} --players`, 'Follow settings for each player'],
            ['Follow selected', `${command} --follow ?{Follow for the selected tokens|Seen,seen|Unseen,unseen|Off,off}`, 'Set Follow on the selected tokens'],
            ['Follow turn', `${command} --followturn`, 'Pull to the token whose turn it is'],
            ['Help', `${command} --help`, 'Help links']
        ].map(([label, cmd, title]) =>
            `<a style="${CSS.menuButton}" href="${cmd}" title="${title}"><span style="${CSS.buttonLabel}">${label}</span></a>`
        ).join(''),

        // Follow the turn card: who is pulled, and how
        followTurnCard: () => {
            const ft = FollowTurn.get();
            const who = ['everyone', 'controller'].map(to =>
                Menus.pill(to === 'everyone' ? 'Everyone' : 'Controller', `${command} --followturn ${ft.mode} --to ${to}`, to === ft.to ? 'on' : 'off')
            ).join('');
            const how = Menus.pills(ft.mode, mode => `${command} --followturn ${mode} --to ${ft.to}`);
            return `<table style="${CSS.rowTable}"><tr><td style="${CSS.tdName}">Follow turn</td><td style="${CSS.tdRight}">${how}</td></tr>` +
                `<tr><td style="${CSS.tdName}">Pull</td><td style="${CSS.tdRight}">${who}</td></tr></table>` +
                `<div style="${CSS.muted}margin-top:4px;">When the turn order advances, pull to the token whose turn it is. The GM viewing the page always gets a seen pull.</div>`;
        }
    };

    // Help content: data only, rendered by Help.render. Inline markup: `code`
    // Blocks: a string is a paragraph, an array is a list, { table } is a table (first row is the header),
    // { note } is a small note, { older: true } is the footnote that links to Older Forms
    const OLDER = { older: true };
    const HELP_SECTIONS = [
        {
            title: 'Commands',
            blocks: [
                'Each command pulls everyone on the page to its target, with the ping circle. Add `--solo` to pull only yourself.',
                ['`!ping`: the center of the selected objects. With nothing selected, it opens your menu.',
                 '`!ping --me`: your first token on your current page.',
                 '`!ping --me Name`: a token by name. The name can also go at the end, after `--solo`.',
                 '`!ping --pin Name`: a map pin, by its title.',
                 '`!ping --inparty`: the center of the party members\' tokens.',
                 '`!ping --turn`: the token at the top of the turn order (GM only).',
                 '`!ping --ids TokenID`: a specific token. A comma-separated list cycles through the tokens, one per use.',
                 '`!ping --menu`: the GM\'s button menu, or a player\'s list of their tokens and Follow settings.',
                 '`!ping --page`: the named tokens on this page (GM only).',
                 '`!ping --players`: each player\'s Follow settings (GM only).',
                 '`!ping --follow seen|unseen|off`: set Follow on the selected tokens, or on the tokens listed with `--ids`.',
                 '`!ping --followall seen|unseen|off`: set Follow all for yourself. The GM adds `--ids PlayerID` (a comma-separated list) to set it for players.',
                 '`!ping --followturn seen|unseen|off --to everyone|controller`: follow the turn order (GM only). With no value, it shows the settings.',
                 '`!ping --help`: help links in chat. When the GM runs it, this handout is also rebuilt.'],
                'Seen means the ping circle is shown; Unseen means it isn\'t. Either way, the view moves to the target.',
                OLDER
            ]
        },
        {
            title: 'Finding Tokens and Places',
            blocks: [
                '`!ping --me` finds the first token on your current page that you control. You control a token if you are listed as controlling it or its character. A GM\'s automatic control of everything does not count, so a GM needs to be listed too.',
                '`!ping --me Name` finds a token by name. Capitalization does not matter. If there is no exact match, the first name starting with the text is used, then the first name containing it. Players can only find tokens they control; the GM can find any token on any layer.',
                '`!ping --pin Name` finds a map pin on your current page by its title, the same way. Players only find pins that are shown to them.',
                '`!ping` with objects selected pulls to the middle of the area they cover, so a cluster of tokens does not outweigh one far away. It works for tokens, drawings and text.',
                '`!ping --inparty` does the same for the Token layer tokens whose characters are party members. If there are none on the page, it uses the Party token.'
            ]
        },
        {
            title: 'Tokens That Pull',
            blocks: [
                'A token can pull people to it whenever it moves, whoever moves it. Put one of these codes in its tooltip, in brackets, anywhere in the text, for example `Caravan [party]`. Capitalization does not matter. If a tooltip holds more than one code, the first one counts.',
                { table: [
                    ['Code', 'Players on the page', 'The token\'s controller', 'GM viewing the page'],
                    ['`[party]` or `[pingallunseen]`', 'Pulled, unseen', '(same as players)', 'Pulled, seen'],
                    ['`[pingallseen]`', 'Pulled, seen', '(same as players)', 'Pulled, seen'],
                    ['`[pingmeseen]`', 'Not affected', 'Pulled, seen', 'Not pulled by Ping Buddy *'],
                    ['`[pingmeunseen]`', 'Not affected', 'Pulled, unseen', 'Not pulled by Ping Buddy *']
                ] },
                { note: '* Roll20 sometimes moves the GM\'s view along without the ping circle. Ping Buddy does not control this.' },
                'A token named `Party` works like `[party]`. This is the Party token: it can sit on the GM layer, and an invisible token lets you move everyone\'s view anywhere on the map. It is also where players land when they arrive on a page.',
                'The controller is the first player listed as controlling the token\'s character, or the token itself if it has no character. "All players" does not count. If no player controls the token, the GM viewing the page is pulled, seen.',
                'It makes no difference who moves the token. A controller who moves their own token is still pulled, so their view centers where they dropped it.',
                OLDER
            ]
        },
        {
            title: 'Following',
            blocks: [
                'Players can have their view follow their tokens. Open your menu with `!ping --menu`, or `!ping` with nothing selected.',
                ['Follow, on each token on this page: when that token moves, your view moves with it.',
                 'Follow all my tokens: the same for every token whose character you control, on every page. While it is on, it replaces each token\'s own Follow setting.',
                 'Seen shows the ping circle; Unseen doesn\'t.'],
                'If a token shows "Following is set by the GM", it is a token that pulls everyone, and it can\'t be changed from the player menu.',
                'The GM can change these settings for any player from Players on the GM menu or from the page list, or use Follow selected on any selected tokens. Follow is saved in the token\'s tooltip as `[pingmeseen]` or `[pingmeunseen]`. Follow all is saved for the player.'
            ]
        },
        {
            title: 'Follow the Turn',
            blocks: [
                'When the turn order advances, Ping Buddy can pull to the token whose turn it is. It is off until the GM turns it on, from Follow turn on the GM menu or with `!ping --followturn seen|unseen|off --to everyone|controller`.',
                ['Everyone: all players on the page are pulled.',
                 'Controller: only the player who controls that token is pulled.',
                 'Either way, the GM viewing the page gets a seen pull.'],
                'Turn order entries without a token, such as a round counter, are skipped.',
                'TurnMarker1, Combat Master, Combat Assistant and CombatTracker can also pull players at the start of a turn. If one of them is installed, Ping Buddy asks you to confirm before turning this on.'
            ]
        },
        {
            title: 'Menus',
            blocks: [
                '`!ping --menu` for the GM shows buttons for Selected, Find by name, In party, Turn, Page list, Players, Follow selected, Follow turn and Help.',
                'For a player, it shows Follow all, then the tokens they control on their current page, each with its Follow setting. Clicking a token\'s picture or name pulls only that player to it.',
                '`!ping --page` (GM only) lists the named tokens on the page in alphabetical order, party members first. Tokens with the same name share a row with a count; repeated clicks cycle through them. Clicking the picture pulls everyone; clicking the name pulls only you. The bar before each picture shows the layers the row\'s tokens are on:',
                ['Green: Token layer', 'Blue: GM layer', 'Purple: Map layer', 'Orange: Foreground layer', 'Gold: Lighting layer'],
                '`!ping --players` (GM only) lists every player in the game with their Follow all setting, and their tokens on the GM\'s current page with Follow settings. Players with tokens on that page come first.'
            ]
        },
        {
            title: 'Page Start',
            blocks: [
                'When the player ribbon moves to a page, all players on that page are pulled to its Party token, unseen. This is useful for maps that don\'t start in the upper left corner.',
                'When you move individual players to a page, or return them to the ribbon, only those players are pulled to the Party token on their new page.'
            ]
        },
        {
            title: 'How Unseen Pulls Work',
            blocks: [
                'For an unseen pull, each player gets a ping sent as themselves and shown only to them. Roll20 does not draw the ping circle for a player\'s own ping.',
                'A GM always sees the circle for a ping sent to them, so a GM can only get a seen pull. No one\'s player color is changed.',
                'Earlier versions hid the circle by briefly making the GM\'s player color transparent. If a GM color was left transparent that way, it is restored the next time the Mod sandbox starts.'
            ]
        },
        {
            title: 'For Script Authors',
            blocks: [
                'Other scripts can call `PingBuddy.pull(target, playerIds, options)`. The target is a token or other object, or `{ left, top, pageid }`. Leave out `playerIds` to pull everyone on the page, or pass one player ID or an array to pull only those players. Pass `{ unseen: true }` as options to pull without the ping circle. It returns true if a ping was sent.'
            ]
        },
        {
            title: 'Older Forms',
            blocks: [
                'These forms from earlier versions still work, so existing games and macros keep working. New setups should use the current forms.',
                { table: [
                    ['Older form', 'Current form'],
                    ['`!pingme`', '`!ping --me`'],
                    ['`!pingme Name`', '`!ping --me Name`'],
                    ['`[ping]`', '`[pingallseen]`'],
                    ['`[pingme]`', '`[pingmeseen]`'],
                    ['`[pingmesilent]`', '`[pingmeunseen]`'],
                    ['A tooltip that is only a code word, such as `party`', 'The code in brackets, such as `[party]`']
                ] }
            ]
        },
        {
            title: 'Credits',
            blocks: [
                'By Keith Curtis. The page start function is adapted from a script by Nick Olivo.'
            ]
        }
    ];

    // Help handout: created on install, rebuilt when the version changes or the GM asks for help
    const Help = {
        find: () => findObjs({ _type: 'handout', name: HELP_HANDOUT })[0],

        url: (h) => `http://journal.roll20.net/handout/${h.id}`,
        anchorUrl: (h, title) => `${Help.url(h)}/#${encodeURIComponent(title)}`,

        inline: (text) => escapeHTML(text).replace(/`([^`]+)`/g, `<span style="${CSS.hCode}">$1</span>`),

        renderBlock: (block, h) => {
            if (Array.isArray(block)) {
                return `<ul style="${CSS.hList}">${block.map(i => `<li>${Help.inline(i)}</li>`).join('')}</ul>`;
            }
            if (block && block.table) {
                const [head, ...rows] = block.table;
                return `<table style="${CSS.hTable}"><tr>${head.map(c => `<th style="${CSS.hTh}">${Help.inline(c)}</th>`).join('')}</tr>` +
                    rows.map(r => `<tr>${r.map(c => `<td style="${CSS.hTd}">${Help.inline(c)}</td>`).join('')}</tr>`).join('') +
                    `</table>`;
            }
            if (block && block.note) return `<p style="${CSS.hNote}">${Help.inline(block.note)}</p>`;
            if (block && block.older) {
                return `<p style="${CSS.hNote}">Forms from earlier versions still work. See <a href="${Help.anchorUrl(h, 'Older Forms')}">Older Forms</a>.</p>`;
            }
            return `<p style="${CSS.hPara}">${Help.inline(block)}</p>`;
        },

        render: (h) => {
            const toc = HELP_SECTIONS
                .map(s => `<a href="${Help.anchorUrl(h, s.title)}">${escapeHTML(s.title)}</a>`)
                .join(' &bull; ');

            return [
                `<h1 style="${CSS.hH1}">Ping Buddy v${version}</h1>`,
                `<p style="${CSS.hPara}">Ping Buddy moves players' views to tokens, pins and other places on the map: from chat commands, from menus, and automatically when certain tokens move.</p>`,
                `<p style="${CSS.hPara}">` +
                    `<a style="${CSS.button}${CSS.buttonGap}" href="https://youtu.be/8-2YQ4oo4nA"><span style="${CSS.buttonLabel}">Video Demo</span></a>` +
                    `<a style="${CSS.button}${CSS.buttonGap}" href="https://wiki.roll20.net/Invisible_Token"><span style="${CSS.buttonLabel}">Get Invisible Token</span></a>` +
                `</p>`,
                `<p style="${CSS.hToc}">${toc}</p>`,
                ...HELP_SECTIONS.map(s =>
                    `<h2 style="${CSS.hH2}">${escapeHTML(s.title)}</h2>` + s.blocks.map(b => Help.renderBlock(b, h)).join(''))
            ].join('');
        },

        // force: rebuild even if the stored version matches
        ensure: (force = false) => {
            let h = Help.find();
            if (!h) {
                h = createObj('handout', {
                    name: HELP_HANDOUT,
                    inplayerjournals: HELP_FOR_PLAYERS ? 'all' : '',
                    archived: false
                });
                force = true;
            }
            if (force || State.get().helpVersion !== version) {
                h.set('notes', Help.render(h));
                State.get().helpVersion = version;
                Logger.log(`Help handout "${HELP_HANDOUT}" written`);
            }
            return h;
        },

        // Visibility is left to the GM after creation, so check it rather than assume it
        sharedWith: (h, playerid) => {
            if (playerIsGM(playerid)) return true;
            const v = h.get('inplayerjournals') || '';
            return v === 'all' || v.split(',').includes(playerid);
        },

        // Chat card: one button for the handout, one per section
        card: (h) =>
            Output.button('Open Help', Help.url(h)) +
            `<div style="margin-top:6px;">` +
            HELP_SECTIONS.map(s =>
                `<a style="${CSS.button}${CSS.buttonGap}" href="${Help.anchorUrl(h, s.title)}"><span style="${CSS.buttonLabel}">${escapeHTML(s.title)}</span></a>`
            ).join('') +
            `</div>`
    };

    // Turn order: the first entry that is a real token
    const Turns = {
        order: (raw) => {
            try { return JSON.parse(raw || '[]') || []; } catch (e) { return []; }
        },
        firstToken: (order) => order
            .filter(e => e && e.id && e.id !== '-1')
            .map(e => getObj('graphic', e.id))
            .find(Boolean),
        currentToken: () => Turns.firstToken(Turns.order(Campaign().get('turnorder')))
    };

    // Commands
    const Commands = {
        // One target per command, first match wins; no target pulls to the selection
        root: (msg, parsed) => {
            const { args } = parsed;
            const val = (v) => (v === undefined || v === true ? '' : String(v).trim());
            const solo = args.solo !== undefined;
            // Text after --solo counts as the name, so the name can go at the end
            const soloText = val(args.solo);

            if (args.help) return Commands.help(msg);
            if (args.follow !== undefined) return Commands.follow(msg, val(args.follow), val(args.ids), val(args.from));
            if (args.followall !== undefined) return Commands.followAll(msg, val(args.followall), val(args.ids));
            if (args.followturn !== undefined) return Commands.followTurn(msg, val(args.followturn), val(args.to), args.confirm !== undefined);
            if (args.players) return Commands.players(msg);
            if (args.menu) return Commands.menu(msg);
            if (args.page) return Commands.page(msg);
            if (args.turn) return Commands.turn(msg, solo);
            if (args.inparty) return Commands.inparty(msg, solo);
            if (args.pin !== undefined) return Commands.pin(msg, val(args.pin) || soloText, solo);
            if (args.ids !== undefined) return Commands.ids(msg, val(args.ids), solo);
            if (args.me !== undefined || soloText) return Commands.me(msg, val(args.me) || soloText, solo);
            return Commands.selected(msg, solo);
        },

        // Middle of the box around the selected objects; nothing selected opens the menu
        selected: (msg, solo) => {
            const objs = (msg.selected || [])
                .map(s => getObj(s._type, s._id))
                .filter(Boolean);
            if (!objs.length) return Commands.menu(msg);
            const point = Points.boxCenter(objs);
            if (!point) return;
            Ping.forRequest(msg.playerid, point.left, point.top, objs[0].get('_pageid'), solo);
        },

        // Your first token, or a token by name; the older !pingme and !pingme Name land here
        me: (msg, name, solo = false) => {
            const pid = msg.playerid;
            const isGM = playerIsGM(pid);
            const pageId = getPageForPlayer(pid);

            if (!name) {
                const token = Tokens.ownedBy(pid, pageId)[0];
                if (!token) {
                    return Output.whisper(pid, `No character belonging to ${escapeHTML(Players.getName(pid))} can be found on this page.`);
                }
                return Ping.forRequest(pid, token.get('left'), token.get('top'), pageId, solo);
            }

            const pool = isGM ? Tokens.onPage(pageId) : Tokens.ownedBy(pid, pageId);
            const token = Match.findByName(pool, name);
            if (!token) {
                const scope = isGM ? '' : ' that you control';
                return Output.whisper(pid, `No token named ${escapeHTML(name)}${scope} can be found on this page.`);
            }
            Ping.forRequest(pid, token.get('left'), token.get('top'), pageId, solo);
        },

        // A map pin by title. Players only find pins shown to all players or to them
        pin: (msg, name, solo) => {
            const pid = msg.playerid;
            const isGM = playerIsGM(pid);
            const pageId = getPageForPlayer(pid);
            if (!name) return Output.whisper(pid, `Use ${command} --pin Name`);
            const visible = (pin) => {
                if (isGM) return true;
                const v = String(pin.get('visibleTo') || '');
                return v === 'all' || v.split(',').map(x => x.trim()).includes(pid);
            };
            const pins = findObjs({ _type: 'pin', _pageid: pageId }).filter(visible);
            const named = pins.map(p => ({ get: (k) => (k === 'name' ? p.get('title') : p.get(k)), pin: p }));
            const hit = Match.findByName(named, name);
            if (!hit) return Output.whisper(pid, `No pin named ${escapeHTML(name)} can be found on this page.`);
            const point = Points.center(hit.pin);
            if (point) Ping.forRequest(pid, point.left, point.top, pageId, solo);
        },

        // Middle of the box around party members' Token layer tokens; falls back to the Party token
        inparty: (msg, solo) => {
            const pid = msg.playerid;
            const pageId = getPageForPlayer(pid);
            const ids = Tokens.partyCharacterIds();
            const tokens = Tokens.onPage(pageId)
                .filter(t => t.get('layer') === 'objects' && ids.has(t.get('represents')));
            const point = Points.boxCenter(tokens);
            if (point) return Ping.forRequest(pid, point.left, point.top, pageId, solo);

            const partyToken = Behavior.findPartyToken(pageId);
            if (partyToken) return Ping.forRequest(pid, partyToken.get('left'), partyToken.get('top'), pageId, solo);

            Output.whisper(pid, 'No party members and no Party token can be found on this page.');
        },

        // GM only: the first turn order entry that is a real token
        turn: (msg, solo) => {
            const pid = msg.playerid;
            if (!playerIsGM(pid)) return;
            const token = Turns.currentToken();
            if (!token) return Output.whisper(pid, 'The turn order has no tokens.');
            Ping.forRequest(pid, token.get('left'), token.get('top'), token.get('_pageid'), solo);
        },

        // One ID pulls to that token; a comma list cycles through them. Players may only use their own tokens
        ids: (msg, idList, solo) => {
            const pid = msg.playerid;
            const isGM = playerIsGM(pid);
            const tokens = idList.split(',').map(x => x.trim()).filter(Boolean)
                .map(id => getObj('graphic', id))
                .filter(t => t && (isGM || Players.controls(t, pid)));
            if (!tokens.length) return Output.whisper(pid, 'That token can no longer be found.');
            const token = getObj('graphic', Cycle.next(pid, tokens.map(t => t.id)));
            Ping.forRequest(pid, token.get('left'), token.get('top'), token.get('_pageid'), solo);
        },

        // GM only: named tokens on the page, party members first, one row per name
        page: (msg) => {
            const pid = msg.playerid;
            if (!playerIsGM(pid)) return;
            const pageId = getPageForPlayer(pid);
            const page = getObj('page', pageId);
            const partyIds = Tokens.partyCharacterIds();
            const all = Tokens.onPage(pageId);
            const party = Tokens.groupByName(all.filter(t => partyIds.has(t.get('represents'))));
            const others = Tokens.groupByName(all.filter(t => !partyIds.has(t.get('represents'))));
            const opts = {
                imagePublic: true,
                follow: {
                    from: 'page',
                    compact: true,
                    show: (row) => row.tokens.some(t => Players.getControllers(t).some(id => !playerIsGM(id))),
                    followAllOn: (row) => {
                        const owner = FollowAll.ownerOf(row.tokens[0]);
                        return !!owner && FollowAll.modeFor(owner) !== 'off';
                    }
                }
            };

            let body = '';
            if (party.length) body += `<div style="${CSS.listHead}">Party</div>${Menus.list(party, opts)}`;
            if (others.length) body += `<div style="${CSS.listHead}">${party.length ? 'Others' : 'Tokens'}</div>${Menus.list(others, opts)}`;
            if (!body) body = `<span style="${CSS.muted}">No named tokens on this page.</span>`;
            body += `<div style="${CSS.muted}margin-top:4px;">Image: pull everyone. Name: pull only you. Buttons: the player's Follow setting.</div>`;

            Output.whisper(pid, body, escapeHTML(page ? page.get('name') : 'Page'));
        },

        // GM: button card. Player: Follow all, then their tokens on their page
        menu: (msg) => {
            const pid = msg.playerid;
            if (playerIsGM(pid)) return Output.whisper(pid, Menus.gmCard(), `${displayName} v${version}`);

            const pageId = getPageForPlayer(pid);
            const rows = Tokens.groupByName(Tokens.ownedBy(pid, pageId, false));
            const allOn = FollowAll.modeFor(pid) !== 'off';
            const follow = { from: 'menu', show: () => true, followAllOn: (row) => allOn && row.tokens.some(t => FollowAll.ownerOf(t) === pid) };
            const body = Menus.followAllLine(pid) +
                (rows.length
                    ? Menus.list(rows, { imagePublic: false, follow })
                    : `<span style="${CSS.muted}">You control no named tokens on this page.</span>`) +
                `<div style="${CSS.muted}margin-top:4px;">Click a token's picture or name to find it.<br>` +
                `Follow: when this token moves, your view moves with it. Seen shows the ping circle; Unseen doesn't.<br>` +
                `Follow all does this for all your tokens on all pages.</div>`;
            Output.whisper(pid, body, 'Your Tokens');
        },

        // GM only: every player and their Follow settings; players with tokens on the GM's page first
        players: (msg) => {
            const gid = msg.playerid;
            if (!playerIsGM(gid)) return;
            const pageId = getPageForPlayer(gid);
            const byName = (a, b) => a.p.get('_displayname').localeCompare(b.p.get('_displayname'), undefined, { sensitivity: 'base' });
            const entries = findObjs({ _type: 'player' })
                .filter(p => !playerIsGM(p.id))
                .map(p => ({ p, rows: Tokens.groupByName(Tokens.ownedBy(p.id, pageId, false)) }));
            const ordered = entries.filter(e => e.rows.length).sort(byName)
                .concat(entries.filter(e => !e.rows.length).sort(byName));

            const body = ordered.length ? ordered.map(({ p, rows }, i) => {
                const allOn = FollowAll.modeFor(p.id) !== 'off';
                const follow = { from: 'players', compact: true, show: () => true, followAllOn: (row) => allOn && row.tokens.some(t => FollowAll.ownerOf(t) === p.id) };
                return Menus.playerHeader(p, i === 0) +
                    (rows.length ? Menus.list(rows, { imagePublic: true, follow }) : `<div style="${CSS.muted}">No tokens on this page.</div>`);
            }).join('') : `<span style="${CSS.muted}">There are no players in this game.</span>`;

            Output.whisper(gid, body +
                `<div style="${CSS.muted}margin-top:4px;border-top:1px solid #999;padding-top:3px;">` +
                `Buttons beside a player: Follow all. Beside a token: Follow. Seen shows the ping circle; Unseen doesn't.<br>` +
                `Image: pull everyone. Name: pull only you.</div>`, 'Players');
        },

        // Follow: sets [pingmeseen] / [pingmeunseen] on the listed or selected tokens.
        // Players may only change tokens they control. The selection form is silent unless nothing could be changed
        follow: (msg, mode, idList, from) => {
            const pid = msg.playerid;
            const isGM = playerIsGM(pid);
            mode = mode.toLowerCase();
            if (!MODES[mode]) {
                return Output.whisper(pid, `Use ${command} --follow seen|unseen|off, with tokens selected or --ids TokenID.`);
            }
            const fromSelection = !idList;
            const candidates = fromSelection
                ? (msg.selected || []).filter(x => x._type === 'graphic').map(x => getObj('graphic', x._id))
                : idList.split(',').map(x => x.trim()).filter(Boolean).map(id => getObj('graphic', id));
            const tokens = candidates.filter(t => t && (isGM || Players.controls(t, pid)) && !Behavior.isGMSet(t));
            tokens.forEach(t => Behavior.setFollow(t, mode));

            if (!fromSelection) return Commands.refresh(msg, from);
            if (!candidates.length) return Output.whisper(pid, 'Select one or more tokens first.');
            if (!tokens.length) return Output.whisper(pid, 'None of the selected tokens can be changed. Tokens that pull everyone are set by the GM.');
        },

        // Follow all: a player sets their own; the GM sets it for players listed with --ids
        followAll: (msg, mode, idList) => {
            const pid = msg.playerid;
            const isGM = playerIsGM(pid);
            mode = mode.toLowerCase();
            if (!MODES[mode]) return Output.whisper(pid, `Use ${command} --followall seen|unseen|off`);
            const targets = isGM
                ? idList.split(',').map(x => x.trim()).filter(id => id && getObj('player', id) && !playerIsGM(id))
                : [pid];
            if (!targets.length) {
                return Output.whisper(pid, `Choose players: ${command} --followall seen|unseen|off --ids PlayerID, or use the Players list.`);
            }
            targets.forEach(id => FollowAll.set(id, mode));
            Commands.refresh(msg, isGM ? 'players' : 'menu');
        },

        // GM only. No value shows the card; turning it on asks for confirmation when another turn script is installed
        followTurn: (msg, mode, to, confirmed) => {
            const pid = msg.playerid;
            if (!playerIsGM(pid)) return;
            const title = 'Follow Turn';
            if (!mode) return Output.whisper(pid, Menus.followTurnCard(), title);

            mode = mode.toLowerCase();
            to = (to || FollowTurn.get().to).toLowerCase();
            if (!MODES[mode] || !['everyone', 'controller'].includes(to)) {
                return Output.whisper(pid, `Use ${command} --followturn seen|unseen|off --to everyone|controller`);
            }
            const others = FollowTurn.conflicts();
            if (mode !== 'off' && FollowTurn.get().mode === 'off' && others.length && !confirmed) {
                return Output.whisper(pid,
                    `${others.join(', ')} ${others.length > 1 ? 'are' : 'is'} installed, and usually pulls players to the token whose turn it is. ` +
                    `Turning this on as well may pull players twice.<br>` +
                    Output.button('Turn it on anyway', `${command} --followturn ${mode} --to ${to} --confirm`), title);
            }
            FollowTurn.set(mode, to);
            Output.whisper(pid, Menus.followTurnCard(), title);
        },

        // Redraw the list a setting button came from
        refresh: (msg, from) => {
            if (!playerIsGM(msg.playerid)) return Commands.menu(msg);
            if (from === 'page') return Commands.page(msg);
            return Commands.players(msg);
        },

        // GM: rebuild the handout, then link it. Player: link it only if it is shared with them
        help: (msg) => {
            const pid = msg.playerid;
            const h = playerIsGM(pid) ? Help.ensure(true) : Help.find();
            if (!h || !Help.sharedWith(h, pid)) {
                return Output.whisper(pid,
                    `<span style="${CSS.muted}">The Ping Buddy help handout isn't shared with players in this game.</span>`,
                    `${displayName} v${version}`);
            }
            Output.whisper(pid, Help.card(h), `${displayName} v${version}`);
        }
    };

    // Event handlers
    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
        const content = msg.content.trim();
        const cmd = content.split(/\s+/)[0].toLowerCase();

        switch (cmd) {
            case command:
                return Commands.root(msg, Parser.parse(content));
            // Legacy form, kept for existing macros
            case '!pingme':
                return Commands.me(msg, content.slice(cmd.length).replace(/\s+/g, ' ').trim());
        }
    };

    const handleGraphicChange = (obj, prev) => {
        if (obj.get('left') === prev.left && obj.get('top') === prev.top) return;

        const behavior = Behavior.get(obj);
        const owner = FollowAll.ownerOf(obj);
        const allMode = owner ? FollowAll.modeFor(owner) : 'off';
        if (!behavior && allMode === 'off') return;

        const pageId = obj.get('_pageid');
        const left = obj.get('left');
        const top = obj.get('top');
        const gm = Players.getGMForPage(pageId);
        // No player controller: the GM viewing the page is pulled (a GM always gets a seen pull)
        const controller = Players.getControllers(obj)[0] || Ping.gmsViewing(pageId)[0];

        // Tokens that pull everyone already include the owner; otherwise Follow all replaces the token's Follow setting
        if (!Behavior.isGMSet(obj) && allMode !== 'off') {
            if (allMode === 'unseen') Ping.unseenFor(left, top, pageId, [owner]);
            else Ping.seenFor(left, top, pageId, owner);
            return;
        }

        switch (behavior) {
            case 'allunseen':
                Ping.unseenFor(left, top, pageId, Ping.viewers(pageId));
                Ping.gmFollow(left, top, pageId);
                break;
            case 'allseen':
                Ping.all(left, top, pageId, gm && gm.id);
                break;
            case 'meseen':
                if (controller) Ping.seenFor(left, top, pageId, controller);
                break;
            case 'meunseen':
                if (controller) Ping.unseenFor(left, top, pageId, [controller]);
                break;
        }
    };

    // Follow the turn: when the top entry changes to a token, pull to it. Custom entries are skipped
    const handleTurnOrderChange = (obj, prev) => {
        const ft = FollowTurn.get();
        if (ft.mode === 'off') return;
        const now = Turns.order(obj.get('turnorder'))[0];
        const before = Turns.order(prev && prev.turnorder)[0];
        if (!now || !now.id || now.id === '-1' || (before && before.id === now.id)) return;
        const token = getObj('graphic', now.id);
        if (!token) return;

        const pageId = token.get('_pageid');
        const left = token.get('left');
        const top = token.get('top');
        if (ft.to === 'everyone') {
            if (ft.mode === 'seen') {
                const gm = Players.getGMForPage(pageId);
                return Ping.all(left, top, pageId, gm && gm.id);
            }
            Ping.unseenFor(left, top, pageId, Ping.viewers(pageId));
        } else {
            const controller = Players.getControllers(token).find(id => !playerIsGM(id));
            if (controller) {
                if (ft.mode === 'seen') Ping.seenFor(left, top, pageId, controller);
                else Ping.unseenFor(left, top, pageId, [controller]);
            }
        }
        Ping.gmFollow(left, top, pageId);
    };

    const handlePlayerPageChange = () => {
        setTimeout(() => {
            const pageId = Campaign().get('playerpageid');
            if (pageId) Ping.partyOnPage(pageId);
        }, PAGE_CHANGE_DELAY);
    };

    // Pull only the players whose page changed, grouped by their new page
    const handleSpecificPagesChange = (obj, prev) => {
        const current = toMap(obj.get('playerspecificpages'));
        const previous = toMap(prev && prev.playerspecificpages);
        const ribbon = obj.get('playerpageid');
        const groups = {};

        [...new Set([...Object.keys(current), ...Object.keys(previous)])].forEach(id => {
            const before = previous[id] || ribbon;
            const after = current[id] || ribbon;
            if (!after || before === after) return;
            (groups[after] = groups[after] || []).push(id);
        });

        if (!Object.keys(groups).length) return;
        setTimeout(() => {
            Object.keys(groups).forEach(pageId => Ping.partyOnPage(pageId, groups[pageId]));
        }, PAGE_CHANGE_DELAY);
    };

    // Wrap handlers so one error does not take down the sandbox
    const safe = (fn, label) => (...a) => {
        try { fn(...a); } catch (err) { Logger.error(`${label}: ${err && err.stack ? err.stack : err}`); }
    };

    const registerEventHandlers = () => {
        on('chat:message', safe(handleInput, 'chat'));
        on('change:graphic', safe(handleGraphicChange, 'graphic'));
        on('change:campaign:turnorder', safe(handleTurnOrderChange, 'turnorder'));
        on('change:campaign:playerpageid', safe(handlePlayerPageChange, 'playerpageid'));
        on('change:campaign:playerspecificpages', safe(handleSpecificPagesChange, 'playerspecificpages'));
    };

    const checkInstall = () => {
        log(`-=> ${displayName} v${version} is loaded. Help command is ${command} --help`);
        Logger.debug(`Last update ${new Date(lastUpdate * 1000)}`);
        State.initialize();
        Color.repairAll();
        Help.ensure();
        return true;
    };

    on('ready', () => {
        try {
            if (checkInstall()) registerEventHandlers();
        } catch (err) {
            Logger.error(`Startup: ${err && err.stack ? err.stack : err}`);
        }
    });

    const dumpState = () => log(`${scriptName} state: ${JSON.stringify(state[scriptName])}`);

    // Public: pull players to a token/object or { left, top, pageid }.
    // playerIds: omit to pull everyone on the page; one ID or an array to pull only those players.
    // options.unseen: no ping circle (each person is pulled by a ping sent as themselves)
    const pull = (target, playerIds, options = {}) => {
        try {
            if (!target) return false;
            const point = typeof target.get === 'function'
                ? Object.assign(Points.center(target) || {}, { pageId: target.get('_pageid') })
                : { left: Number(target.left), top: Number(target.top), pageId: target.pageid || target.pageId };
            if (!Number.isFinite(point.left) || !Number.isFinite(point.top) || !point.pageId) return false;
            const ids = [].concat(playerIds || []).filter(Boolean);
            const { left, top, pageId } = point;
            if (options.unseen) {
                Ping.unseenFor(left, top, pageId, ids.length ? ids : Ping.viewers(pageId));
            } else if (ids.length) {
                ids.forEach(id => Ping.seenFor(left, top, pageId, id));
            } else {
                const gm = Players.getGMForPage(pageId);
                Ping.all(left, top, pageId, gm && gm.id);
            }
            return true;
        } catch (err) {
            Logger.error(`pull: ${err && err.stack ? err.stack : err}`);
            return false;
        }
    };

    return { pull, dumpState };
})();
