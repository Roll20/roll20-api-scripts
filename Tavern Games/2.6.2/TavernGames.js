/**
 * Tavern Games 2.6.2
 * Author: Kingkiller546
 * Updated: 2026-10-26
 * SPDX-License-Identifier: MIT
 *
 * Seven fantasy tavern dice games with authenticated seats, private hands,
 * GM-run NPCs, optional ScriptCards presentation and recorded fictional stakes.
 * Commands: !tavern, !tavern games, !tavern rules, !tavern refresh-rules (GM).
 * Configuration: use GM lobby buttons to choose seats, denomination and stakes.
 * No source edits, sheet attributes, token changes or external services required.
 * Install one copy only. ScriptCards is optional; missing/unsafe rendering uses
 * quoted native whispers. Player-owned dice never fall back to the GM group.
 * Rules handout is created on ready, shared for reading, and managed by stored ID.
 * See README.md for rules, house defaults, privacy and upgrade limitations.
 *
 * MIT License
 * 
 * Copyright (c) 2026 Kingkiller546
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
(function () {
    'use strict';
    var KEY = 'TavernGamesV1', ANTE_KEY = 'TavernGamesAnteV1', GELT_KEY = 'TavernGamesGeltV1', GOBLIN_KEY = 'TavernGamesGoblinV1', CLASSIC_KEY = 'TavernGamesClassicV1', DUEL_KEY = 'TavernGamesDuelV1', HUNT_KEY = 'TavernGamesHuntV1', S, T, G, C, R, U, V;
    var VERSION = '2.6.2', RULES_KEY = 'TavernGamesRulesHandoutV1', rulesBusy = false, rulesQueued = false;
    var RULE_TEXT = {
        liars: '<b>Liar\'s Dice</b><br>Five d6 per seat. On your turn raise quantity with any face, or keep quantity and raise face. Never reduce quantity. Ones are wild for faces 2–6; bids of ones count actual ones only. Any surviving seat except the last bidder may challenge the current bid with Liar, even out of turn. GM chooses the NPC challenger explicitly. If matching dice are below the bid, bidder loses; otherwise challenger loses. All hands are revealed, loser loses one die, then everyone rerolls. Loser starts next round; if eliminated, next surviving seat starts. Last seat wins the dice game. GM runs NPCs. Pause and Resume retain seats, hands, bids, round and pool. Manual End clears the lobby, all hands and the recorded pool without payout. Recorded stakes: every surviving seat contributes the configured amount once at each round start, including round 1. No sheet balances change. On each valid current-bid Liar call, the last bidder wins the current pool if the bid holds; otherwise the challenger wins it. The loser still loses one die. Next round starts a fresh pool; there is no carryover or extra final-game payout.', ante: '<b>Three-Dragon Ante - dice variant</b><br>This is a blackjack-style dice variant, not the official Three-Dragon Ante card game.<br>Each seat contributes the GM-set ante and rolls private 3d6. Betting runs in seat order: Check when nothing is owed, Call to match the current target, Raise by a positive whole-number increase to that target, or Fold. A raise reopens action; everyone remaining must respond and match. There are no bankrolls, all-ins or side pots.<br>Each remaining seat then chooses one public fourth die, d6 or d8. After all roll, reveal remaining hands: highest total at or below 21 wins. Ties split whole denomination units, with odd coins going to lower seat numbers first. All bust carries the pot to the next hand. If only one seat remains after folds, it wins without revealing hands. GM starts Next Hand; seats and ante remain. Pause/Resume preserve state; End clears the current game and recorded pot without payout. No sheet money changes.', gelt: '<b>Gelt</b><br>Each seat contributes the GM-set entry stake and rolls one public d20. Natural 1 automatically loses and cannot buy a reroll; natural 20 automatically locks but waits for everyone else. Other seats decide in seat order: Lock, or pay the configured fee for one reroll. The reroll replaces and locks the result, even if lower; natural 1 loses and natural 20 qualifies for the house bonus. No second reroll.<br>Highest final result other than 1 wins. Tied highest seats split whole denomination units; odd coins go to lower tied seat numbers first. If the highest is 20, the house adds one final pot, so the total payout is twice the pot once, split among tied 20s. House contribution is shown separately. All natural 1 carries the pot to the next hand. GM starts Next Hand with the same seats/setup and new entries. Pause/Resume preserve the round; End clears it and the recorded pot without payout. No balances, bankrolls or sheet money changes.', goblin: '<b>Goblin\'s Challenge</b><br>3-6 seats, including GM-run NPCs. Every seat starts with 2d12 and 3d6 for the entire game. GM starts each round and rolls one d20 challenge. Seat order, with the starting seat rotating each round and exhausted seats skipped.<br>On your turn choose counts of remaining d12 and d6, at least one die. Roll the whole chosen combination once and total it. All selected dice are spent permanently, even on a miss; no replenishment and no free passes. First total matching or exceeding the challenge earns 1 point and immediately ends the round; later seats retain their dice. If every eligible seat misses, nobody scores. GM starts Next Round with a new challenge. When all inventories are empty, most points wins; tied leaders share victory. Pause/Resume preserve state; End clears it. No wagering or currency.', classic: '<b>Classic Dice - each bet against the house</b><br>2 or more seats, up to 12 in this script. GM sets one denomination and equal default bet per seat. Each shooter explicitly rolls 2d6. On the first (come-out) roll, 7 or 11 wins; 2, 3 or 12 loses. Any other total sets the point. Thereafter only rolling the point wins, and 7 loses; all other totals, including 2, 3, 11 and 12, continue with the same shooter and point.<br>A win returns the stake plus an equal house amount: gross return 2 times stake, net profit +stake. A loss returns nothing: net -stake. This is not a contested or shared pot. Stakes and net outcomes are recorded only; no sheet balances change. Each shooter keeps the turn until resolved, then the next seat plays. After all resolve, GM starts Next Round, preserving the net ledger. No automatic roll loops. Pause/Resume preserve state; End clears everything.', duel: '<b>Wizard\'s Duel</b><br>Exactly two seats, any player/NPC combination. Each starts with 10 game-only points. Each round, each wizard submits one private 3d20 roll. Dice remain private until both are submitted. Compare die 1 with die 1, die 2 with die 2 and die 3 with die 3, in original order; never sort. For each strictly higher die, the opponent loses 1 point. Equal pairs cost neither wizard any points. Apply both wizards\' point losses together, clamping at 0. A wizard reaching 0 loses; if both reach 0 together, the result is a draw. Otherwise GM starts Next Round, retaining remaining points and clearing submitted dice only. No rerolls, wagering, or character-sheet changes. Pause/Resume preserve pending dice and points; End clears the game.', hunt: '<b>Treasure Hunt</b><br>GM rolls seven d12s and sums them, then caps the final DC at 70: DC = minimum of the raw 7d12 total and 70. All seven target dice, raw total and capped DC are shown. Each hunter clicks Ascending or Descending once to roll the whole ordered seven-die set: d4,d6,d8,d10,d10,d12,d20 or its reverse. The two d10s are independent dice. The card displays every die and running total, highlights the earliest roll meeting/exceeding DC, and uses that prefix length as the score. Later displayed dice do not change that score. If all seven fail to reach DC, the seat has no success. All hunters finish before fewest-roll success wins. Ties split whole denomination units, odd coins to lower tied seat numbers. No success carries the treasure to Next Hunt, which adds new entries once and rolls a fresh capped 7d12 target. No automatic target rerolls. Previously committed partial attempts retain their dice/order and complete only the remainder with one click; already completed attempts retain their result. Free play is allowed. Pause/Resume preserve progress; End clears the hunt and recorded treasure without payout. No sheet balances change.'
    };
    RULE_TEXT.goblin = RULE_TEXT.goblin.replace('No wagering or currency.', 'The dice-count selectors offer 0 and Skip; Skip means use none of that die type. Both types set to zero is invalid and cannot pass the turn. No wagering or currency.');
    var esc = function (s) {
        return String(s).replace(/[&<>"'\[\]{}@|`\r\n%$!+\-]/g, function (c) {
            return '&#' + c.charCodeAt(0) + ';';
        });
    };
    function say(t, title) {
        render(t, title || 'Tavern Games - Result', null, false);
    }
    // Authentication comes from msg.playerid, never msg.who or a command argument.
    // Roll20's reserved gm recipient is safe for GM controls/NPC dice, not player secrets.
    function whisper(id, t, cardTitle, plain, playerSecret) {
        var p = getObj('player', id), name = p && p.get('_displayname'), reason = '';
        if (typeof name !== 'string' || ! name.trim()) {
            reason = 'missing player display name';
        } else if (/["\r\n\\@{}\[\]|\x00-\x1f\x7f]/.test(name) || name !== name.trim()) {
            reason = 'unsafe whisper recipient syntax';
        } else if (name.toLowerCase() === 'gm') {
            reason = 'reserved GM recipient name';
        } else if (findObjs({
            _type: 'player'
        }).filter(function (x) {
            return String(x.get('_displayname')).trim().toLowerCase() === name.toLowerCase();
        }).length !== 1) {
            reason = 'duplicate or unresolved player display name';
        } else if (findObjs({
            _type: 'character'
        }).some(function (x) {
            return String(x.get('name')).trim().toLowerCase() === name.toLowerCase();
        })) {
            reason = 'player and character name collision';
        }
        if (reason) {
            if (p && playerIsGM(id) && ! playerSecret) {
                log('Tavern Games private routing for player ' + id + ': ' + reason + '; using the GM-only recipient.');
                return render(t, cardTitle || 'Tavern Games - Notice', 'gm', plain);
            }
            log('Tavern Games private routing for player ' + id + ': ' + reason + '; private content withheld.');
            render('Private delivery refused: ' + reason + '. No private content was sent. ' +(p && playerIsGM(id) ? 'This card contains a player hand and cannot be shared with all GMs.': "GM: check this player's display name and any matching player/character names."), 'Tavern Games - Notice', 'gm', false);
            return false;
        }
        return render(t, cardTitle || 'Tavern Games - Notice', name, plain);
    }
    function render(t, cardTitle, name, plain) {
        if (! plain && typeof API_Meta !== 'undefined' && API_Meta.ScriptCards && API_Meta.ScriptCards.version &&(! name || ! /[,\-+%$!&<>`]/.test(name) && ! /^(0|self)$/i.test(name))) {
            // Roll20 documents sendChat API messages firing chat:message; ScriptCards queues them.
            // Explicit validated recipient, never "self" (the generated message has playerid API).
            var body = t.replace(/\[([^\]]+)\]\((!tavern [^)]*)\)/g, '[button]$1::$2[/button]').replace(/<span data-tg-bid-face="([1-6])">D6 face \1<\/span>/g, function (all, face) {
                return '<span role="img" aria-label="D6 face ' + face + '" title="D6 face ' + face + '">[d6]' + face + '[/d6]</span>';
            }).replace(/<span data-tg-public-die="(4|6|8|10|12|20):([1-9]|1[0-9]|20)">D\1 face \2<\/span>/g, function (all, sides, face) {
                return '<span role="img" aria-label="D' + sides + ' face ' + face + '" title="D' + sides + ' face ' + face + '">[d' + sides + ']' + face + '[/d' + sides + ']</span>';
            }).replace(/(NPC hand|Your hand|Dice): ([1-6](?:, [1-6])*)/g, function (all, label, dice) {
                return label + ': ' + dice.split(', ').map(function (d) {
                    return '[d6]' + d + '[/d6]';
                }).join(' ');
            });
            var settings = ['title|' + cardTitle, 'titlecardbackground|#553826', 'titlecardgradient|0', 'oddrowbackground|#f4ead7', 'evenrowbackground|#fffaf0', 'bodyfontsize|13px', 'buttonbackground|#553826', 'buttontextcolor|#ffffff', 'dicefontcolor|#553826', 'dicefontsize|1.7em', 'dontcheckbuttonsforapi|1', 'disablevariableexpansion|1', 'disablerollprocessing|1', 'disableattributereplacement|1'];
            if (name) {
                settings.push('whisper|' + name);
            }
            var card = '!scriptcards {{ ' + settings.map(function (v) {
                return '--#' + v;
            }).join(' ') + ' ' + body.split('<br>').map(function (line) {
                return '--+|' + line;
            }).join(' ') + ' }}';
            try {
                sendChat('Tavern Games', card, null, {
                    noarchive: ! ! name
                });
                return true;
            } catch (e) {
                log('Tavern Games: ScriptCards delivery failed; using plain menu.');
            }
        }
        if (cardTitle) {
            t = '<div style="border:1px solid #553826;border-radius:6px;padding:8px;background:#fffaf0;color:#281c13"><b>' + cardTitle + '</b><br>' + t + '<br><small>Plain presentation (ScriptCards unavailable or bypassed).</small></div>';
        }
        sendChat('Tavern Games',(name ? '/w "' + name + '" ': '') + t, null, {
            noarchive: ! ! name
        });
        return true;
    }
    function need(ok, text) {
        if (! ok) {
            throw new Error(text);
        }
    }
    function gm(id) {
        need(playerIsGM(id), 'GM only.');
    }
    function btn(label, command) {
        return '[' + label + '](!tavern ' + command + ')';
    }
    function bidText(quantity, face) {
        return quantity + ' &#215; <span data-tg-bid-face="' + face + '">D6 face ' + face + '</span>';
    }
    function ticket() {
        return String(S.rev);
    }
    function touch() {
        S.rev += 1;
    }
    function alive() {
        return S.seats.filter(function (s) {
            return s.count > 0;
        });
    }
    function freshStakes(configured) {
        return {
            denom: 'GP', amount: 0, pot: 0, chargedRound: 0, configured: configured, lastPayout: null
        };
    }
    function clearGame(phase) {
        var rev = S.rev, pending = S.legacyTrackerCleanup;
        S = {
            schema: 1, rev: rev, phase: phase, seats: [], round: 0, turn: 0, bid: null, stakes: freshStakes(false)
        };
        if (pending) {
            S.legacyTrackerCleanup = pending;
        }
        state[KEY] = S;
    }
    function safe(n) {
        return typeof n === 'number' && n >= 0 && n <= 9007199254740991 && Math.floor(n) === n;
    }
    function contribution(seats, existingPot) {
        var bet = S.stakes, pot = existingPot === undefined ? bet.pot: existingPot;
        need(safe(bet.amount) && safe(pot) &&(bet.amount === 0 || seats <= Math.floor((9007199254740991 - pot) / bet.amount)), 'Pool would exceed the safe integer limit.');
        return bet.amount * seats;
    }
    function chargeRound() {
        if (S.stakes.chargedRound >= S.round) {
            return;
        }
        S.stakes.pot += contribution(alive().length);
        S.stakes.chargedRound = S.round;
    }
    function poolStatus() {
        var bet = S.stakes, payout = bet.lastPayout;
        return '<b>Current pool: ' + bet.pot + ' ' + bet.denom + '</b><br>Stake: ' + bet.amount + ' ' + bet.denom + ' per surviving seat at each round start (record only).<br>Liar winner takes this round\'s pool; next round starts a fresh pool.' +(payout ? '<br>Last payout - round ' + payout.round + ': ' + esc(payout.label) + ' won ' + payout.amount + ' ' + payout.denom + '.': '');
    }
    function current() {
        return S.seats[S.turn];
    }
    function controls(id, s) {
        if (s.npc) {
            return playerIsGM(id);
        }
        var c = getObj('character', s.char), owners = c && String(c.get('controlledby') || '').split(',');
        return s.owner === id && owners &&(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1);
    }
    function seat(n) {
        need(/^[1-9]\d*$/.test(n || ''), 'Invalid seat.');
        var s = S.seats[Number(n) - 1];
        need(s, 'No such seat.');
        return s;
    }
    function next(i) {
        do {
            i =(i + 1) % S.seats.length;
        }
        while (S.seats[i].count === 0);
        return i;
    }
    // Upgrade-only cleanup. Never restore a saved combat snapshot or drive the native tracker.
    function cleanupLegacyTracker() {
        var t = S.tracker || S.legacyTrackerCleanup;
        if (! t) {
            return;
        }
        delete S.tracker;
        delete S.legacyTrackerCleanup;
        var owned = Array.isArray(t.owned) ? t.owned.filter(function (r) {
            return r && r.id === '-1' && typeof r.custom === 'string' && r.custom.indexOf('[TG:' + t.tag + ':') === 0;
        }): [];
        if (! owned.length) {
            return;
        }
        try {
            var raw = Campaign().get('turnorder'), rows = JSON.parse(raw || '[]');
            need(Array.isArray(rows), 'Invalid turn order.');
            var signatures = owned.map(JSON.stringify);
            var kept = rows.filter(function (r) {
                return signatures.indexOf(JSON.stringify(r)) === - 1;
            });
            if (kept.length !== rows.length) {
                Campaign().set('turnorder', JSON.stringify(kept));
            }
            if (kept.some(function (r) {
                return r && r.id === '-1' && typeof r.custom === 'string' && r.custom.indexOf('[TG:' + t.tag + ':') === 0;
            })) {
                render('Some old Tavern seat rows were edited and were left untouched. Remove those rows manually if desired.', 'Tavern Games - Upgrade', 'gm', false);
            }
        } catch (e) {
            S.legacyTrackerCleanup = {
                tag: t.tag, owned: owned
            };
            render('Old seat rows could not be safely cleaned up. Turn order was left untouched; repair its data and restart, or remove old Tavern rows manually.', 'Tavern Games - Upgrade', 'gm', false);
        }
    }
    function status(includeNpcHands) {
        return '<b>Liar\'s Dice — ' + esc(S.phase) + ', round ' + S.round + '</b><br>' + S.seats.map(function (s) {
            var row = s.num + '. ' + esc(s.label) + ' (' + s.count + ' dice)' +(s === current() && S.phase !== 'lobby' ? ' - ACTIVE': '');
            if (includeNpcHands === true && s.npc) {
                row += '<br>&nbsp;&nbsp;NPC hand: ' +(s.count === 0 ? 'eliminated':(S.phase === 'playing' || S.phase === 'paused') && s.hand.length === s.count ? s.hand.join(', '): 'no current hand');
            }
            return row;
        }).join('<br>') + '<br>Last bid: ' +(S.bid ? bidText(S.bid.q, S.bid.f) + ' by ' + esc(S.seats[S.bid.by].label): 'none');
    }
    function menu(id, plain) {
        var r = ticket(), text = status(playerIsGM(id)) + '<br>' + poolStatus();
        var own = S.seats.filter(function (s) {
            return ! s.npc && s.owner === id && controls(id, s);
        })[0];
        if (own) {
            text += '<br><b>Your hand: ' +(own.count === 0 ? 'eliminated':(S.phase === 'playing' || S.phase === 'paused') && own.hand.length === own.count ? own.hand.join(', '): 'no current hand') + '</b>';
        }
        text += '<br>' + btn('Show Rules', 'liars-rules') + ' ' + btn('Refresh', 'liars-menu') + ' ' + btn('Choose game', 'games');
        if (S.phase === 'lobby') {
            text += '<br>' + btn('Join character', 'join ' + r + ' ?{Character ID}');
        }
        if (S.phase === 'playing') {
            if (controls(id, current())) {
                text += '<br><b>Your turn to bid</b><br>' + btn('Raise bid', 'bid ' + r + ' ?{Quantity} ?{Face|1|2|3|4|5|6}');
            }
            if (S.bid) {
                var challengers = S.seats.filter(function (s) {
                    return s.count > 0 && s.num - 1 !== S.bid.by && controls(id, s);
                });
                if (challengers.length) {
                    text += '<br><b>Challenge the current bid (any time)</b><br>' + challengers.map(function (s) {
                        return btn('Liar as ' + esc(s.label), 'liar ' + r + ' ' + s.num);
                    }).join(' ');
                }
            }
        }
        if (playerIsGM(id)) {
            if (S.phase === 'lobby') {
                text += '<br><b>GM - Recorded stakes</b><br>Each surviving seat contributes once per round, including round 1.<br>' + ['CP', 'SP', 'EP', 'GP', 'PP'].map(function (d) {
                    return btn(d, 'stake ' + r + ' ' + d + ' ?{Amount per surviving seat per round|1}');
                }).join(' ') + ' ' + btn('Free play', 'stake ' + r + ' GP 0');
            }
            if (['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1) {
                text += '<br>' + btn('New lobby', 'new ' + r);
            }
            if (S.phase === 'lobby') {
                text += '<br><b>GM - Lobby and seating</b><br>' + btn('Add NPC', 'npc ' + r + ' ?{NPC name}') + '<br>' + btn('Start random', 'start ' + r + ' random') + ' ' + btn('Start chosen seat', 'start ' + r + ' ?{First seat number}');
            }
            if (['lobby', 'playing', 'paused', 'finished'].indexOf(S.phase) !== - 1) {
                text += '<br><b>GM - Game controls</b><br>' +(S.phase === 'playing' ? btn('Pause', 'pause ' + r) + ' ': '') +(S.phase === 'paused' ? btn('Resume', 'resume ' + r) + ' ': '') + btn('End', 'end ' + r);
            }
        }
        text += '<br>' + btn('Plain menu', 'plain');
        whisper(id, text, 'Tavern Games - Liar\'s Dice', plain, ! !(own && own.hand.length));
    }
    function rules(id) {
        whisper(id, RULE_TEXT.liars, 'Tavern Games - Rules');
    }
    function hands() {
        S.seats.forEach(function (s) {
            s.hand = [];
            for (var j = 0; j < s.count; j ++) {
                s.hand.push(randomInteger(6));
            }
        });
    }
    function anteActive() {
        return ['lobby', 'betting', 'fourth', 'paused', 'settled'].indexOf(T.phase) !== - 1;
    }
    function anteSeat(n) {
        need(/^[1-9]\d*$/.test(n || ''), 'Invalid seat.');
        var s = T.seats[Number(n) - 1];
        need(s, 'No such seat.');
        return s;
    }
    function anteControls(id, s) {
        return controls(id, s);
    }
    function anteFresh(phase, rev) {
        return {
            schema: 1, rev: rev, phase: phase, round: 0, seats: [], results: null, stakes: {
                configured: false, denom: 'GP', amount: 0, pot: 0
            }, betting: null, pausedFrom: null
        };
    }
    function anteLive() {
        return T.seats.filter(function (s) {
            return ! s.folded;
        });
    }
    function anteAdd(amount) {
        need(safe(amount) && safe(T.stakes.pot) && amount <= 9007199254740991 - T.stakes.pot, 'Pool would exceed the safe integer limit.');
    }
    function anteBeginHand() {
        need(T.stakes.configured, 'Choose an ante or Free play first.');
        need(T.seats.length >= 2, 'Need at least two seats.');
        need(T.stakes.amount <= Math.floor((9007199254740991 - T.stakes.pot) / T.seats.length), 'Ante would exceed the safe pool limit.');
        var contribution = T.stakes.amount * T.seats.length;
        anteAdd(contribution);
        T.stakes.pot += contribution;
        T.round ++;
        T.phase = 'betting';
        T.results = null;
        T.pausedFrom = null;
        T.betting = {
            target: 0, turn: 0
        };
        T.seats.forEach(function (s) {
            s.hand = [randomInteger(6), randomInteger(6), randomInteger(6)];
            s.fourth = null;
            s.folded = false;
            s.bet = 0;
            s.acted = false;
        });
    }
    function antePay(winners, kind) {
        var pot = T.stakes.pot, base = Math.floor(pot / winners.length), remainder = pot % winners.length;
        var payouts = winners.slice().sort(function (a, b) {
            return a.num - b.num;
        }).map(function (s, i) {
            return {
                seat: s.num, label: s.label, amount: base +(i < remainder ? 1: 0)
            };
        });
        T.results = {
            kind: kind, round: T.round, pot: pot, denom: T.stakes.denom, payouts: payouts
        };
        T.stakes.pot = 0;
        T.phase = 'settled';
        T.betting = null;
        return payouts.map(function (p) {
            return esc(p.label) + ' wins ' + p.amount + ' ' + T.stakes.denom;
        }).join('; ') + '. Recorded only; no sheet money changes.';
    }
    function anteShowdown() {
        var eligible = anteLive();
        need(eligible.every(function (s) {
            return s.fourth;
        }), 'Wait for every remaining fourth die.');
        var totals = eligible.map(function (s) {
            return {
                s: s, total: s.hand.reduce(function (a, b) {
                    return a + b;
                }, 0) + s.fourth.value
            };
        });
        var valid = totals.filter(function (v) {
            return v.total <= 21;
        }), out = '<b>Showdown - hand ' + T.round + '</b><br>' + totals.map(function (v) {
            return esc(v.s.label) + ' - Dice: ' + v.s.hand.join(', ') + '; fourth: <span data-tg-public-die="' + v.s.fourth.sides + ':' + v.s.fourth.value + '">D' + v.s.fourth.sides + ' face ' + v.s.fourth.value + '</span>; total ' + v.total +(v.total > 21 ? ' - BUST': '');
        }).join('<br>');
        if (! valid.length) {
            T.results = {
                kind: 'allbust', round: T.round, pot: T.stakes.pot, denom: T.stakes.denom, payouts: []
            };
            T.phase = 'settled';
            T.betting = null;
            out += '<br>All remaining seats bust. ' + T.stakes.pot + ' ' + T.stakes.denom + ' carries to the next hand.';
        } else {
            var best = Math.max.apply(null, valid.map(function (v) {
                return v.total;
            }));
            out += '<br>' + antePay(valid.filter(function (v) {
                return v.total === best;
            }).map(function (v) {
                return v.s;
            }), 'showdown');
        }
        say(out, 'Tavern Games - Ante Showdown');
    }
    function anteBetAdvance(actor) {
        var live = anteLive();
        if (live.length === 1) {
            say(antePay(live, 'folds') + ' No private hands revealed.', 'Tavern Games - Ante Result');
            return;
        }
        if (live.every(function (s) {
            return s.acted && s.bet === T.betting.target;
        })) {
            T.phase = 'fourth';
            T.betting = null;
            return;
        }
        for (var j = 1; j <= T.seats.length; j ++) {
            var n =(actor + j) % T.seats.length;
            if (! T.seats[n].folded &&(! T.seats[n].acted || T.seats[n].bet !== T.betting.target)) {
                T.betting.turn = n;
                return;
            }
        }
        throw new Error('No eligible betting seat found.');
    }
    function anteStatus() {
        var out = '<b>Three-Dragon Ante - dice variant</b><br>Hand ' + T.round + ' - ' + esc(T.phase) + '<br>Current pool: ' + T.stakes.pot + ' ' + T.stakes.denom + '<br>Ante: ' + T.stakes.amount + ' ' + T.stakes.denom + ' per seat per hand (record only).<br>' + T.seats.map(function (s) {
            return s.num + '. ' + esc(s.label) +(s.folded ? ' - folded': s.fourth ? ' - fourth die: <span data-tg-public-die="' + s.fourth.sides + ':' + s.fourth.value + '">D' + s.fourth.sides + ' face ' + s.fourth.value + '</span>': ' - fourth die not rolled') +(T.betting && T.betting.turn === s.num - 1 ? ' - BETTING TURN': '');
        }).join('<br>');
        if (T.betting) {
            out += '<br>Betting target: ' + T.betting.target + ' ' + T.stakes.denom;
        }
        if (T.results) {
            out += '<br>Last result - hand ' + T.results.round + ': ' +(T.results.kind === 'allbust' ? 'all bust; pool carries forward.': T.results.payouts.map(function (p) {
                return esc(p.label) + ' won ' + p.amount + ' ' + T.results.denom;
            }).join('; '));
        }
        return out;
    }
    function rulesBlock(id) {
        var titles = ["Liar's Dice", "Three-Dragon Ante — dice variant", "Gelt", "Goblin's Challenge", "Classic Dice", "Wizard's Duel", "Treasure Hunt"];
        return '<div><p>TG_RULES_OWNER_' + id.replace(/[^a-zA-Z0-9]/g, '') + '</p><h1>Tavern Games — Rules</h1><p>Generated by Tavern Games ' + VERSION + '. Keep GM additions outside this maintained block. Fictional stakes only; no character-sheet balances or attributes change. GM controls NPCs; private player dice remain private until the game requires a reveal.</p>' + Object.keys(RULE_TEXT).map(function (k, i) {
            return '<h2>' + titles[i] + '</h2><p>' + RULE_TEXT[k].replace(/^<b>.*?<\/b><br>/, '').replace(/<br>/g, '</p><p>') + '</p>';
        }).join('') + '</div>';
    }
    function ensureRules() {
        if (rulesBusy) {
            rulesQueued = true;
            return;
        }
        rulesBusy = true;
        function done() {
            rulesBusy = false;
            if (rulesQueued) {
                rulesQueued = false;
                ensureRules();
            }
        }
        function fresh() {
            var h = createObj('handout', {
                name: 'Tavern Games - Rules (generated)', inplayerjournals: 'all', controlledby: '', archived: false
            });
            if (! h) throw new Error('Could not create rules handout.');
            var block = rulesBlock(h.id);
            state[RULES_KEY] = {
                schema: 1, id: h.id, lastBlock: block, version: VERSION, pending: true
            };
            h.set('notes', block);
            state[RULES_KEY].pending = false;
        }
        function failed(e) {
            log('Tavern Games rules handout: ' + e.message);
            done();
        }
        try {
            var meta = state[RULES_KEY], h = meta && meta.id && getObj('handout', meta.id);
            if (! h) {
                fresh();
                done();
                return;
            }
            h.get('notes', function (notes) {
                try {
                    if (state[RULES_KEY] !== meta) {
                        done();
                        return;
                    }
                    if (! getObj('handout', h.id)) {
                        fresh();
                        done();
                        return;
                    }
                    notes = String(notes || '');
                    if (/^%3C/i.test(notes)) {
                        try {
                            notes = decodeURIComponent(notes);
                        } catch (ignore) {
                        }
                    }
                    var previous = meta.lastBlock, marker = 'TG_RULES_OWNER_' + h.id.replace(/[^a-zA-Z0-9]/g, ''), next = rulesBlock(h.id);
                    if (meta.pending && notes === '') {
                        h.set('notes', next);
                    } else if (typeof previous === 'string' && previous.indexOf(marker) !== - 1 && notes.indexOf(previous) !== - 1 && notes.indexOf(previous) === notes.lastIndexOf(previous)) {
                        if (previous !== next) h.set('notes', notes.replace(previous, next));
                    } else {
                        fresh();
                        log('Tavern Games: previous rules handout content preserved; a new maintained handout was created.');
                        done();
                        return;
                    }
                    if (h.get('inplayerjournals') !== 'all') h.set('inplayerjournals', 'all');
                    if (h.get('controlledby') !== '') h.set('controlledby', '');
                    meta.lastBlock = next;
                    meta.version = VERSION;
                    meta.pending = false;
                    done();
                } catch (e) {
                    failed(e);
                }
            });
        } catch (e) {
            failed(e);
        }
    }
    function gamesMenu(id, plain) {
        var text = '<b>Tavern Games</b><br>' + btn('Liar\'s Dice', 'liars-menu') + '<br>' + btn('Three-Dragon Ante', 'ante-menu') + '<br>' + btn('Gelt', 'gelt-menu') + '<br>' + btn('Goblin\'s Challenge', 'goblin-menu') + '<br>' + btn('Classic Dice', 'classic-menu') + '<br>' + btn('Wizard\'s Duel', 'duel-menu') + '<br>' + btn('Treasure Hunt', 'hunt-menu');
        var meta = state[RULES_KEY], handout = meta && meta.id && getObj('handout', meta.id);
        if (handout) text += '<br><a href="https://journal.roll20.net/handout/' + encodeURIComponent(handout.id) + '">All game rules</a>';
        whisper(id, text, 'Tavern Games - Choose Game', plain);
    }
    function anteRules(id) {
        whisper(id, RULE_TEXT.ante, 'Tavern Games - Ante Rules');
    }
    function anteMenu(id, plain) {
        var text = anteStatus();
        T.seats.forEach(function (s) {
            if (anteControls(id, s)) {
                text += '<br>' + esc(s.label) + ' - ' +(s.npc ? 'NPC hand: ': 'Your hand: ') +(s.hand.length ? s.hand.join(', '): 'no current hand');
                if (s.hand.length) {
                    text += ' (private subtotal ' + s.hand.reduce(function (a, b) {
                        return a + b;
                    }, 0) + ')';
                }
                if (T.phase === 'betting' && T.betting.turn === s.num - 1) {
                    var owed = T.betting.target - s.bet;
                    text += '<br>' + esc(s.label) + ' owes ' + owed + ' ' + T.stakes.denom + '.<br>' +(owed === 0 ? btn('Check as ' + esc(s.label), 'ante-check ' + T.rev + ' ' + s.num): btn('Call ' + owed + ' as ' + esc(s.label), 'ante-call ' + T.rev + ' ' + s.num)) + ' ' + btn('Raise as ' + esc(s.label), 'ante-raise ' + T.rev + ' ' + s.num + ' ?{Increase target by|1}') + ' ' + btn('Fold as ' + esc(s.label), 'ante-fold ' + T.rev + ' ' + s.num);
                }
                if (T.phase === 'fourth' && ! s.folded && ! s.fourth) {
                    text += '<br>' + btn('Roll d6 as ' + esc(s.label), 'ante-fourth ' + T.rev + ' ' + s.num + ' 6') + ' ' + btn('Roll d8 as ' + esc(s.label), 'ante-fourth ' + T.rev + ' ' + s.num + ' 8');
                }
            }
        });
        text += '<br>' + btn('Show Rules', 'ante-rules') + ' ' + btn('Refresh', 'ante-menu') + ' ' + btn('Choose game', 'games') + ' ' + btn('Plain menu', 'ante-plain');
        if (T.phase === 'lobby') {
            text += '<br>' + btn('Join character', 'ante-join ' + T.rev + ' ?{Character ID}');
        }
        if (playerIsGM(id)) {
            if (['idle', 'ended', 'finished'].indexOf(T.phase) !== - 1) {
                text += '<br>' + btn('New Ante lobby', 'ante-new ' + T.rev);
            }
            if (T.phase === 'lobby') {
                text += '<br>Ante denomination and amount:<br>' + ['CP', 'SP', 'EP', 'GP', 'PP'].map(function (d) {
                    return btn(d, 'ante-stake ' + T.rev + ' ' + d + ' ?{Ante per seat per hand|1}');
                }).join(' ') + ' ' + btn('Free play', 'ante-stake ' + T.rev + ' GP 0') + '<br>' + btn('Add NPC', 'ante-npc ' + T.rev + ' ?{NPC name}') + ' ' + btn('Deal private 3d6', 'ante-start ' + T.rev);
            }
            if (T.phase === 'settled') {
                text += '<br>' + btn('Next Hand', 'ante-next ' + T.rev);
            }
            if (T.phase === 'betting' || T.phase === 'fourth') {
                text += '<br>' + btn('Pause', 'ante-pause ' + T.rev);
            }
            if (T.phase === 'paused') {
                text += '<br>' + btn('Resume', 'ante-resume ' + T.rev);
            }
            if (anteActive()) {
                text += '<br>' + btn('End', 'ante-end ' + T.rev);
            }
        }
        whisper(id, text, 'Tavern Games - Three-Dragon Ante', plain, T.seats.some(function (s) {
            return ! s.npc && anteControls(id, s) && s.hand.length;
        }));
    }
    function anteMenus() {
        var sent = {
        };
        T.seats.forEach(function (s) {
            if (! s.npc && anteControls(s.owner, s) && ! sent[s.owner]) {
                sent[s.owner] = true;
                anteMenu(s.owner);
            }
        });
        findObjs({
            _type: 'player'
        }).forEach(function (p) {
            if (playerIsGM(p.id) && ! sent[p.id]) {
                sent[p.id] = true;
                anteMenu(p.id);
            }
        });
    }
    function anteCommand(id, op, args) {
        if (op === 'ante-menu' || op === 'ante-plain' || op === 'ante-rules') {
            need(! args.length, 'Unexpected arguments.');
            if (op === 'ante-rules') {
                anteRules(id);
            } else {
                anteMenu(id, op === 'ante-plain');
            }
            return;
        }
        need(args.shift() === String(T.rev), 'Stale Ante action. Open !tavern for fresh buttons.');
        if (op === 'ante-new') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            need(! huntActive(), 'End Treasure Hunt first.');
            need(! duelActive(), 'End Wizard\'s Duel first.');
            need(! classicActive(), 'End Classic Dice first.');
            need(! goblinActive(), 'End Goblin\'s Challenge first.');
            need(! geltActive(), 'End Gelt first.');
            need(! anteActive(), 'End the current Ante game first.');
            need(['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End Liar\'s Dice first.');
            T = anteFresh('lobby', T.rev);
            state[ANTE_KEY] = T;
        } else if (op === 'ante-stake') {
            gm(id);
            need(T.phase === 'lobby' && args.length === 2 && /^(CP|SP|EP|GP|PP)$/.test(args[0]) && /^(0|[1-9]\d{0,15})$/.test(args[1]) && safe(Number(args[1])), 'Set a valid denomination and nonnegative safe whole-number ante in the lobby.');
            T.stakes = {
                configured: true, denom: args[0], amount: Number(args[1]), pot: 0
            };
        } else if (op === 'ante-join' || op === 'ante-npc') {
            need(T.phase === 'lobby' && T.seats.length < 12, 'Join only in a lobby, maximum 12 seats.');
            var c = null, label;
            if (op === 'ante-npc') {
                gm(id);
                label = args.join(' ');
                need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1-60 characters.');
            } else {
                need(args.length === 1, 'Supply a character ID.');
                c = getObj('character', args[0]);
                need(c, 'Character not found.');
                var owners = String(c.get('controlledby') || '').split(',');
                need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                need(! T.seats.some(function (s) {
                    return ! s.npc && s.owner === id || s.char === c.id;
                }), 'Player or character already seated.');
                label = String(c.get('name')).slice(0, 60);
            }
            T.seats.push({
                num: T.seats.length + 1, label: label, char: c && c.id, owner: id, npc: op === 'ante-npc', hand: [], fourth: null
            });
        } else if (op === 'ante-start') {
            gm(id);
            need(! args.length && T.phase === 'lobby' && T.seats.length >= 2, 'Need a lobby with at least two seats.');
            anteBeginHand();
        } else if (op === 'ante-next') {
            gm(id);
            need(! args.length && T.phase === 'settled', 'Next Hand is available only after settlement.');
            anteBeginHand();
        } else if (/^ante-(check|call|raise|fold)$/.test(op)) {
            need(T.phase === 'betting' && args.length ===(op === 'ante-raise' ? 2: 1), 'Invalid betting action or phase.');
            var actor = anteSeat(args[0]);
            need(anteControls(id, actor) && ! actor.folded, 'You do not control that betting seat.');
            need(T.betting.turn === actor.num - 1, 'It is not that seat\'s betting turn.');
            var owed = T.betting.target - actor.bet, payment = 0, newTarget = T.betting.target;
            if (op === 'ante-check') {
                need(owed === 0, 'Cannot check while a call is owed.');
            }
            if (op === 'ante-call') {
                need(owed > 0, 'Nothing is owed; use Check.');
                payment = owed;
            }
            if (op === 'ante-raise') {
                need(/^[1-9]\d{0,15}$/.test(args[1]) && safe(Number(args[1])), 'Raise by a positive safe whole number.');
                var increase = Number(args[1]);
                need(increase <= 9007199254740991 - newTarget, 'Betting target would overflow.');
                newTarget += increase;
                payment = newTarget - actor.bet;
            }
            anteAdd(payment);
            if (op === 'ante-raise') {
                T.seats.forEach(function (s) {
                    s.acted = false;
                });
                T.betting.target = newTarget;
            }
            actor.bet += payment;
            T.stakes.pot += payment;
            actor.acted = true;
            if (op === 'ante-fold') {
                actor.folded = true;
            }
            say(esc(actor.label) + ' ' + op.substring(5) +(payment ? ' - contributes ' + payment + ' ' + T.stakes.denom: '') + '.', 'Tavern Games - Ante Betting');
            anteBetAdvance(actor.num - 1);
        } else if (op === 'ante-fourth') {
            need(T.phase === 'fourth' && args.length === 2 && /^(6|8)$/.test(args[1]), 'Fourth die requires completed betting and d6 or d8.');
            var s = anteSeat(args[0]);
            need(anteControls(id, s) && ! s.folded, 'You do not control an eligible seat.');
            need(! s.fourth, 'Fourth die already rolled.');
            s.fourth = {
                sides: Number(args[1]), value: randomInteger(Number(args[1]))
            };
            say(esc(s.label) + ' rolls public fourth die: <span data-tg-public-die="' + s.fourth.sides + ':' + s.fourth.value + '">D' + s.fourth.sides + ' face ' + s.fourth.value + '</span>.', 'Tavern Games - Ante Fourth Die');
            if (anteLive().every(function (s) {
                return s.fourth;
            })) {
                anteShowdown();
            }
        } else if (op === 'ante-pause' || op === 'ante-resume') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            if (op === 'ante-pause') {
                need(T.phase === 'betting' || T.phase === 'fourth', 'No active Ante hand to pause.');
                T.pausedFrom = T.phase;
                T.phase = 'paused';
            } else {
                need(T.phase === 'paused' &&(T.pausedFrom === 'betting' || T.pausedFrom === 'fourth'), 'Ante is not paused.');
                T.phase = T.pausedFrom;
                T.pausedFrom = null;
            }
        } else if (op === 'ante-end') {
            gm(id);
            need(! args.length && anteActive(), 'No current Ante game.');
            T = anteFresh('ended', T.rev + 1);
            state[ANTE_KEY] = T;
            say('Game ended.', 'Tavern Games - Game ended');
            return;
        } else {
            throw new Error('Unknown Ante command.');
        }
        T.rev ++;
        say(anteStatus(), 'Tavern Games - Three-Dragon Ante');
        anteMenus();
    }
    function geltFresh(phase, rev) {
        return {
            schema: 1, rev: rev, phase: phase, round: 0, seats: [], turn: 0, pausedFrom: null, results: null, stakes: {
                configured: false, denom: 'GP', ante: 0, fee: 1, pot: 0
            }
        };
    }
    function geltActive() {
        return ['lobby', 'playing', 'paused', 'settled'].indexOf(G.phase) !== - 1;
    }
    function geltSeat(n) {
        need(/^[1-9]\d*$/.test(n || ''), 'Invalid seat.');
        var s = G.seats[Number(n) - 1];
        need(s, 'No such Gelt seat.');
        return s;
    }
    function d20face(value) {
        return '<span data-tg-public-die="20:' + value + '">D20 face ' + value + '</span>';
    }
    function geltCollect(amount) {
        need(safe(amount) && safe(G.stakes.pot) && amount <= 4503599627370495 - G.stakes.pot, 'Gelt pool would exceed the safe limit for a doubled payout.');
    }
    function geltSettle() {
        need(G.seats.every(function (s) {
            return s.locked;
        }), 'Wait for all Gelt decisions.');
        var eligible = G.seats.filter(function (s) {
            return s.roll !== 1;
        }), pot = G.stakes.pot;
        need(safe(pot) && pot <= 4503599627370495, 'Invalid Gelt pool total.');
        if (! eligible.length) {
            G.results = {
                kind: 'allones', round: G.round, pot: pot, house: 0, total: 0, denom: G.stakes.denom, payouts: []
            };
            G.phase = 'settled';
            say('Every seat rolled natural 1 and loses. ' + pot + ' ' + G.stakes.denom + ' carries to the next hand.', 'Tavern Games - Gelt Result');
            return;
        }
        var best = Math.max.apply(null, eligible.map(function (s) {
            return s.roll;
        })), winners = eligible.filter(function (s) {
            return s.roll === best;
        }).sort(function (a, b) {
            return a.num - b.num;
        }), house = best === 20 ? pot: 0, total = pot + house;
        need(safe(total), 'Doubled Gelt payout would overflow.');
        var base = Math.floor(total / winners.length), odd = total % winners.length, payouts = winners.map(function (s, i) {
            return {
                seat: s.num, label: s.label, amount: base +(i < odd ? 1: 0)
            };
        });
        G.results = {
            kind: 'paid', round: G.round, pot: pot, house: house, total: total, denom: G.stakes.denom, payouts: payouts
        };
        G.stakes.pot = 0;
        G.phase = 'settled';
        say('<b>Gelt result - round ' + G.round + '</b><br>Final pool: ' + pot + ' ' + G.stakes.denom + '<br>House contribution: ' + house + ' ' + G.stakes.denom + '<br>Total payout: ' + total + ' ' + G.stakes.denom + '<br>' + payouts.map(function (p) {
            return esc(p.label) + ' wins ' + p.amount + ' ' + G.stakes.denom;
        }).join('<br>') + '<br>Recorded only; no sheet balances change.', 'Tavern Games - Gelt Result');
    }
    function geltAdvance() {
        var nextSeat = G.seats.findIndex(function (s) {
            return ! s.locked;
        });
        if (nextSeat === - 1) {
            geltSettle();
        } else {
            G.turn = nextSeat;
        }
    }
    function geltBegin() {
        need(G.stakes.configured && G.seats.length >= 2, 'Need a configured lobby with at least two seats.');
        need(G.stakes.ante <= Math.floor((4503599627370495 - G.stakes.pot) / G.seats.length), 'Entry stakes exceed the safe Gelt pool limit.');
        var entry = G.stakes.ante * G.seats.length;
        geltCollect(entry);
        G.stakes.pot += entry;
        G.round ++;
        G.phase = 'playing';
        G.pausedFrom = null;
        G.results = null;
        G.turn = 0;
        G.seats.forEach(function (s) {
            s.roll = randomInteger(20);
            s.locked = s.roll === 1 || s.roll === 20;
            s.rerolls = 0;
        });
        say(geltStatus(), 'Tavern Games - Gelt Initial Rolls');
        geltAdvance();
    }
    function geltStatus() {
        var text = '<b>Gelt</b><br>Round ' + G.round + ' - ' + esc(G.phase) + '<br>Current pool: ' + G.stakes.pot + ' ' + G.stakes.denom + '<br>Entry ' + G.stakes.ante + '; one reroll costs ' + G.stakes.fee + ' ' + G.stakes.denom + ' (record only).<br>' + G.seats.map(function (s) {
            return s.num + '. ' + esc(s.label) + ' - ' +(s.roll ? d20face(s.roll) + ' = ' + s.roll +(s.roll === 1 ? ' - natural 1, loses': s.roll === 20 ? ' - natural 20, locked': s.locked ? ' - locked': ' - choosing') +(s.rerolls ? ' - reroll used': ''): 'not rolled') +(G.phase === 'playing' && ! s.locked && G.turn === s.num - 1 ? ' - DECISION TURN': '');
        }).join('<br>');
        if (G.results) {
            text += '<br>Last result - round ' + G.results.round + ': ' +(G.results.kind === 'allones' ? 'all natural 1; ' + G.results.pot + ' ' + G.results.denom + ' carries forward.': G.results.payouts.map(function (p) {
                return esc(p.label) + ' won ' + p.amount + ' ' + G.results.denom;
            }).join('; ') + '<br>House contribution: ' + G.results.house + ' ' + G.results.denom + '; total payout ' + G.results.total + ' ' + G.results.denom);
        }
        return text;
    }
    function geltRules(id) {
        whisper(id, RULE_TEXT.gelt, 'Tavern Games - Gelt Rules');
    }
    function geltMenu(id, plain) {
        var text = geltStatus() + '<br>' + btn('Show Rules', 'gelt-rules') + ' ' + btn('Refresh', 'gelt-menu') + ' ' + btn('Choose game', 'games') + ' ' + btn('Plain menu', 'gelt-plain');
        if (G.phase === 'lobby') text += '<br>' + btn('Join character', 'gelt-join ' + G.rev + ' ?{Character ID}');
        if (playerIsGM(id)) {
            if (! geltActive()) text += '<br>' + btn('New Gelt lobby', 'gelt-new ' + G.rev);
            if (G.phase === 'lobby') text += '<br>' + ['CP', 'SP', 'EP', 'GP', 'PP'].map(function (d) {
                return btn(d, 'gelt-stake ' + G.rev + ' ' + d + ' ?{Ante per seat|1} ?{Fee per reroll|1}');
            }).join(' ') + ' ' + btn('Free play', 'gelt-stake ' + G.rev + ' GP 0 0') + '<br>' + btn('Add NPC', 'gelt-npc ' + G.rev + ' ?{NPC name}') + ' ' + btn('Roll initial d20s', 'gelt-start ' + G.rev);
            if (G.phase === 'playing') text += '<br>' + btn('Pause', 'gelt-pause ' + G.rev);
            if (G.phase === 'settled') text += '<br>' + btn('Next Hand', 'gelt-next ' + G.rev);
            if (G.phase === 'paused') text += '<br>' + btn('Resume', 'gelt-resume ' + G.rev);
            if (geltActive()) text += '<br>' + btn('End', 'gelt-end ' + G.rev);
        }
        if (G.phase === 'playing') {
            var active = G.seats[G.turn];
            if (active && ! active.locked && controls(id, active)) {
                text += '<br>' + btn('Lock as ' + esc(active.label), 'gelt-lock ' + G.rev + ' ' + active.num) + ' ' + btn('Pay ' + G.stakes.fee + ' and reroll as ' + esc(active.label), 'gelt-reroll ' + G.rev + ' ' + active.num);
            }
        }
        whisper(id, text, 'Tavern Games - Gelt', plain);
    }
    function geltMenus() {
        var sent = {
        };
        G.seats.forEach(function (s) {
            if (! s.npc && controls(s.owner, s) && ! sent[s.owner]) {
                sent[s.owner] = true;
                geltMenu(s.owner);
            }
        });
        findObjs({
            _type: 'player'
        }).forEach(function (p) {
            if (playerIsGM(p.id) && ! sent[p.id]) geltMenu(p.id);
        });
    }
    function geltCommand(id, op, args) {
        if (op === 'gelt-menu' || op === 'gelt-plain' || op === 'gelt-rules') {
            need(! args.length, 'Unexpected arguments.');
            if (op === 'gelt-rules') geltRules(id);
            else geltMenu(id, op === 'gelt-plain');
            return;
        }
        need(args.shift() === String(G.rev), 'Stale Gelt action. Open !tavern for fresh buttons.');
        if (op === 'gelt-new') {
            gm(id);
            need(! args.length && ! geltActive(), 'End the current Gelt game first.');
            need(! huntActive() && ! duelActive() && ! classicActive() && ! goblinActive() && ! anteActive() && ['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End the other game first.');
            G = geltFresh('lobby', G.rev);
            state[GELT_KEY] = G;
        } else if (op === 'gelt-join' || op === 'gelt-npc') {
            need(G.phase === 'lobby' && G.seats.length < 12, 'Join only in a lobby, maximum 12 seats.');
            var c = null, label;
            if (op === 'gelt-npc') {
                gm(id);
                label = args.join(' ');
                need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1-60 characters.');
            } else {
                need(args.length === 1, 'Supply a character ID.');
                c = getObj('character', args[0]);
                need(c, 'Character not found.');
                var owners = String(c.get('controlledby') || '').split(',');
                need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                need(! G.seats.some(function (s) {
                    return ! s.npc && s.owner === id || s.char === c.id;
                }), 'Player or character already seated.');
                label = String(c.get('name')).slice(0, 60);
            }
            G.seats.push({
                num: G.seats.length + 1, label: label, char: c && c.id, owner: id, npc: op === 'gelt-npc', roll: null, locked: false, rerolls: 0
            });
        } else if (op === 'gelt-stake') {
            gm(id);
            need(G.phase === 'lobby' && args.length === 3 && /^(CP|SP|EP|GP|PP)$/.test(args[0]) && args.slice(1).every(function (x) {
                return /^(0|[1-9]\d{0,15})$/.test(x) && safe(Number(x));
            }), 'Set denomination, nonnegative whole-number ante and reroll fee in the lobby.');
            G.stakes = {
                configured: true, denom: args[0], ante: Number(args[1]), fee: Number(args[2]), pot: 0
            };
        } else if (op === 'gelt-start') {
            gm(id);
            need(! args.length && G.phase === 'lobby', 'Start only in the Gelt lobby.');
            geltBegin();
        } else if (op === 'gelt-next') {
            gm(id);
            need(! args.length && G.phase === 'settled', 'Next Hand only after Gelt settlement.');
            geltBegin();
        } else if (op === 'gelt-lock' || op === 'gelt-reroll') {
            need(G.phase === 'playing' && args.length === 1, 'No current Gelt decision or unexpected arguments.');
            var actor = geltSeat(args[0]);
            need(controls(id, actor), 'You do not control that Gelt seat.');
            need(! actor.locked && actor.num - 1 === G.turn, 'It is not that seat\'s decision turn.');
            geltCollect(0);
            if (op === 'gelt-reroll') {
                need(actor.rerolls === 0, 'The one reroll is already used.');
                geltCollect(G.stakes.fee);
                var rolled = randomInteger(20);
                G.stakes.pot += G.stakes.fee;
                actor.roll = rolled;
                actor.rerolls = 1;
                actor.locked = true;
                say(esc(actor.label) + ' pays ' + G.stakes.fee + ' ' + G.stakes.denom + ' and must keep ' + d20face(rolled) + ' = ' + rolled + '.', 'Tavern Games - Gelt Reroll');
            } else {
                actor.locked = true;
                say(esc(actor.label) + ' locks ' + d20face(actor.roll) + ' = ' + actor.roll + '.', 'Tavern Games - Gelt Lock');
            }
            geltAdvance();
        } else if (op === 'gelt-pause' || op === 'gelt-resume') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            if (op === 'gelt-pause') {
                need(G.phase === 'playing', 'No active Gelt round.');
                G.pausedFrom = G.phase;
                G.phase = 'paused';
            } else {
                need(G.phase === 'paused', 'Gelt is not paused.');
                G.phase = G.pausedFrom;
                G.pausedFrom = null;
            }
        } else if (op === 'gelt-end') {
            gm(id);
            need(! args.length && geltActive(), 'No current Gelt game.');
            G = geltFresh('ended', G.rev + 1);
            state[GELT_KEY] = G;
            say('Game ended.', 'Tavern Games - Game ended');
            return;
        } else throw new Error('Unknown Gelt command.');
        G.rev ++;
        say(geltStatus(), 'Tavern Games - Gelt');
        geltMenus();
    }
    function goblinFresh(phase, rev) {
        return {
            schema: 1, rev: rev, phase: phase, round: 0, seats: [], challenge: null, turn: 0, starter: 0, pausedFrom: null, results: null
        };
    }
    function goblinActive() {
        return ['lobby', 'round', 'paused', 'between', 'finished'].indexOf(C.phase) !== - 1;
    }
    function goblinSeat(n) {
        need(/^[1-9]\d*$/.test(n || ''), 'Invalid Goblin seat.');
        var s = C.seats[Number(n) - 1];
        need(s, 'No such Goblin seat.');
        return s;
    }
    function goblinDice(s, d12, d6) {
        need(/^[0-2]$/.test(d12 || '') && /^[0-3]$/.test(d6 || ''), 'Choose 0-2 d12 and 0-3 d6.');
        var a = Number(d12), b = Number(d6);
        need(a + b > 0, 'Choose at least one die.');
        need(a <= s.d12 && b <= s.d6, 'Those dice have already been spent.');
        return {
            d12: a, d6: b
        };
    }
    function goblinAvailable(s) {
        return s.d12 + s.d6 > 0;
    }
    function goblinNext(from, unattempted) {
        for (var j = 1; j <= C.seats.length; j ++) {
            var i =(from + j) % C.seats.length;
            if (goblinAvailable(C.seats[i]) &&(! unattempted || ! C.seats[i].attempted)) return i;
        }
        return - 1;
    }
    function goblinBegin() {
        var starter = C.round === 0 ? C.seats.findIndex(goblinAvailable): goblinNext(C.starter, false);
        need(starter !== - 1, 'No dice remain.');
        var target = randomInteger(20);
        C.round ++;
        C.starter = starter;
        C.turn = starter;
        C.challenge = target;
        C.phase = 'round';
        C.results = null;
        C.seats.forEach(function (s) {
            s.attempted = false;
            s.lastRoll = null;
        });
    }
    function goblinFinish() {
        var best = Math.max.apply(null, C.seats.map(function (s) {
            return s.points;
        })), winners = C.seats.filter(function (s) {
            return s.points === best;
        });
        C.phase = 'finished';
        C.results.final = {
            points: best, winners: winners.map(function (s) {
                return {
                    seat: s.num, label: s.label
                };
            })
        };
        say('All dice are spent.<br>' + winners.map(function (s) {
            return esc(s.label);
        }).join(', ') +(winners.length > 1 ? ' share victory': ' wins') + ' with ' + best + ' points.<br>No wagering.', 'Tavern Games - Goblin Winner');
    }
    function goblinStatus() {
        var text = '<b>Goblin\'s Challenge</b><br>Round ' + C.round + ' - ' + esc(C.phase) + '<br>Challenge: ' +(C.challenge ? d20face(C.challenge) + ' = ' + C.challenge: 'not rolled') + '<br>' + C.seats.map(function (s) {
            return s.num + '. ' + esc(s.label) + ' - ' + s.points + ' points; remaining ' + s.d12 + 'd12 + ' + s.d6 + 'd6' +(! goblinAvailable(s) ? ' - exhausted': '') +(C.phase === 'round' && C.turn === s.num - 1 ? ' - ATTEMPT TURN': '');
        }).join('<br>');
        if (C.round) text += '<br>Starting seat this round: ' + esc(C.seats[C.starter].label);
        if (C.results) {
            text += '<br>Round ' + C.results.round + ': ' +(C.results.winner ? esc(C.results.winner.label) + ' earns 1 point.': 'everyone missed; no point awarded.');
            if (C.results.final) text += '<br>' + C.results.final.winners.map(function (w) {
                return esc(w.label);
            }).join(', ') +(C.results.final.winners.length > 1 ? ' share victory': ' wins') + ' with ' + C.results.final.points + ' points.';
        }
        return text;
    }
    function goblinRules(id) {
        whisper(id, RULE_TEXT.goblin, 'Tavern Games - Goblin Rules');
    }
    function goblinMenu(id, plain) {
        var text = goblinStatus() + '<br>' + btn('Show Rules', 'goblin-rules') + ' ' + btn('Refresh', 'goblin-menu') + ' ' + btn('Choose game', 'games') + ' ' + btn('Plain menu', 'goblin-plain');
        if (C.phase === 'lobby') text += '<br>' + btn('Join character', 'goblin-join ' + C.rev + ' ?{Character ID}');
        if (C.phase === 'round') {
            var actor = C.seats[C.turn];
            if (actor && controls(id, actor)) {
                var options12 = [], options6 = [];
                for (var i = 0; i <= actor.d12; i ++) options12.push(i);
                for (var j = 0; j <= actor.d6; j ++) options6.push(j);
                if (actor.d6 > 0) {
                    options6.splice(1, 1);
                    options6.unshift(1);
                } else if (actor.d12 > 0) {
                    options12.splice(1, 1);
                    options12.unshift(1);
                }
                // A distinct second label keeps Roll20's exhausted-count query a dropdown.
                // Label,value syntax submits numeric zero; the server still requires a die overall.
                options12.push('Skip,0');
                options6.push('Skip,0');
                text += '<br>' + esc(actor.label) + ' may spend up to ' + actor.d12 + 'd12 and ' + actor.d6 + 'd6. Choose at least one die.<br>' + btn('Attempt as ' + esc(actor.label), 'goblin-attempt ' + C.rev + ' ' + actor.num + ' ?{Number of d12|' + options12.join('|') + '} ?{Number of d6|' + options6.join('|') + '}');
            }
        }
        if (playerIsGM(id)) {
            if (! goblinActive()) text += '<br>' + btn('New Goblin lobby', 'goblin-new ' + C.rev);
            if (C.phase === 'lobby') text += '<br>' + btn('Add NPC', 'goblin-npc ' + C.rev + ' ?{NPC name}') + ' ' + btn('Start', 'goblin-start ' + C.rev);
            if (C.phase === 'round') text += '<br>' + btn('Pause', 'goblin-pause ' + C.rev);
            if (C.phase === 'paused') text += '<br>' + btn('Resume', 'goblin-resume ' + C.rev);
            if (C.phase === 'between') text += '<br>' + btn('Next Round', 'goblin-next ' + C.rev);
            if (goblinActive()) text += '<br>' + btn('End', 'goblin-end ' + C.rev);
        }
        whisper(id, text, 'Tavern Games - Goblin\'s Challenge', plain);
    }
    function goblinMenus() {
        var sent = {
        };
        C.seats.forEach(function (s) {
            if (! s.npc && controls(s.owner, s) && ! sent[s.owner]) {
                sent[s.owner] = true;
                goblinMenu(s.owner);
            }
        });
        findObjs({
            _type: 'player'
        }).forEach(function (p) {
            if (playerIsGM(p.id) && ! sent[p.id]) goblinMenu(p.id);
        });
    }
    function goblinCommand(id, op, args) {
        if (op === 'goblin-menu' || op === 'goblin-plain' || op === 'goblin-rules') {
            need(! args.length, 'Unexpected arguments.');
            if (op === 'goblin-rules') goblinRules(id);
            else goblinMenu(id, op === 'goblin-plain');
            return;
        }
        need(args.shift() === String(C.rev), 'Stale Goblin action. Open !tavern for fresh buttons.');
        if (op === 'goblin-new') {
            gm(id);
            need(! args.length && ! goblinActive(), 'End the current Goblin game first.');
            need(! huntActive() && ! duelActive() && ! classicActive() && ! anteActive() && ! geltActive() && ['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End the other game first.');
            C = goblinFresh('lobby', C.rev);
            state[GOBLIN_KEY] = C;
        } else if (op === 'goblin-join' || op === 'goblin-npc') {
            need(C.phase === 'lobby' && C.seats.length < 6, 'Join only in a lobby, maximum 6 seats.');
            var c = null, label;
            if (op === 'goblin-npc') {
                gm(id);
                label = args.join(' ');
                need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1-60 characters.');
            } else {
                need(args.length === 1, 'Supply a character ID.');
                c = getObj('character', args[0]);
                need(c, 'Character not found.');
                var owners = String(c.get('controlledby') || '').split(',');
                need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                need(! C.seats.some(function (s) {
                    return ! s.npc && s.owner === id || s.char === c.id;
                }), 'Player or character already seated.');
                label = String(c.get('name')).slice(0, 60);
            }
            C.seats.push({
                num: C.seats.length + 1, label: label, char: c && c.id, owner: id, npc: op === 'goblin-npc', d12: 2, d6: 3, points: 0, lastRoll: null, attempted: false
            });
        } else if (op === 'goblin-start') {
            gm(id);
            need(! args.length && C.phase === 'lobby' && C.seats.length >= 3 && C.seats.length <= 6, 'Need a lobby with 3-6 seats.');
            goblinBegin();
        } else if (op === 'goblin-next') {
            gm(id);
            need(! args.length && C.phase === 'between', 'Next Round is available after a completed round.');
            goblinBegin();
        } else if (op === 'goblin-attempt') {
            need(C.phase === 'round' && args.length === 3, 'Choose a seat, d12 count and d6 count during a round.');
            var actor = goblinSeat(args[0]);
            need(controls(id, actor), 'You do not control that Goblin seat.');
            need(C.turn === actor.num - 1 && ! actor.attempted && goblinAvailable(actor), 'It is not that seat\'s attempt turn.');
            var chosen = goblinDice(actor, args[1], args[2]), rolls = [], total = 0;
            for (var a = 0; a < chosen.d12; a ++) {
                var v = randomInteger(12);
                rolls.push({
                    sides: 12, value: v
                });
                total += v;
            }
            for (var b = 0; b < chosen.d6; b ++) {
                var w = randomInteger(6);
                rolls.push({
                    sides: 6, value: w
                });
                total += w;
            }
            actor.d12 -= chosen.d12;
            actor.d6 -= chosen.d6;
            actor.attempted = true;
            actor.lastRoll = {
                dice: rolls, total: total
            };
            var success = total >= C.challenge;
            if (success) actor.points ++;
            say(esc(actor.label) + ' rolls ' + rolls.map(function (d) {
                return '<span data-tg-public-die="' + d.sides + ':' + d.value + '">D' + d.sides + ' face ' + d.value + '</span>';
            }).join(' + ') + ' = ' + total + ' against challenge ' + C.challenge + '.<br>' + chosen.d12 + 'd12 and ' + chosen.d6 + 'd6 spent permanently.<br>' +(success ? 'Success - earns 1 point.': 'Miss - no point.'), 'Tavern Games - Goblin Attempt');
            var nextActor = success ? - 1: goblinNext(C.turn, true);
            if (success || nextActor === - 1) {
                C.results = {
                    round: C.round, challenge: C.challenge, winner: success ? {
                        seat: actor.num, label: actor.label
                    }
                    : null, final: null
                };
                C.phase = 'between';
                if (! C.seats.some(goblinAvailable)) goblinFinish();
            } else C.turn = nextActor;
        } else if (op === 'goblin-pause' || op === 'goblin-resume') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            if (op === 'goblin-pause') {
                need(C.phase === 'round', 'No active Goblin round.');
                C.pausedFrom = C.phase;
                C.phase = 'paused';
            } else {
                need(C.phase === 'paused' && C.pausedFrom === 'round', 'Goblin game is not paused.');
                C.phase = C.pausedFrom;
                C.pausedFrom = null;
            }
        } else if (op === 'goblin-end') {
            gm(id);
            need(! args.length && goblinActive(), 'No current Goblin game.');
            C = goblinFresh('ended', C.rev + 1);
            state[GOBLIN_KEY] = C;
            say('Game ended.', 'Tavern Games - Game ended');
            return;
        } else throw new Error('Unknown Goblin command.');
        C.rev ++;
        say(goblinStatus(), 'Tavern Games - Goblin\'s Challenge');
        goblinMenus();
    }
    function classicFresh(phase, rev) {
        return {
            schema: 1, rev: rev, phase: phase, round: 0, seats: [], turn: 0, point: null, entryPlaced: false, pausedFrom: null, lastRoll: null, lastResult: null, setup: {
                configured: false, denom: 'GP', bet: 0
            }
        };
    }
    function classicActive() {
        return ['lobby', 'playing', 'paused', 'between'].indexOf(R.phase) !== - 1;
    }
    function classicSeat(n) {
        need(/^[1-9]\d*$/.test(n || ''), 'Invalid Classic seat.');
        var s = R.seats[Number(n) - 1];
        need(s, 'No such Classic seat.');
        return s;
    }
    function signed(n) {
        return typeof n === 'number' && Math.floor(n) === n && Math.abs(n) <= 9007199254740991;
    }
    function classicLedgerCheck(s, placeEntry) {
        var bet = R.setup.bet, gross = bet * 2, max = 9007199254740991;
        need(safe(bet) && bet <= 4503599627370495 && safe(s.staked) && safe(s.returned) && signed(s.net) && safe(s.wins) && safe(s.losses), 'Invalid Classic stake or ledger.');
        need((! placeEntry || bet <= max - s.staked) && gross <= max - s.returned && s.net <= max - bet && s.net >= - max + bet && s.wins < max && s.losses < max, 'Classic ledger would exceed the safe integer limit.');
    }
    function classicBegin() {
        need(R.setup.configured && R.seats.length >= 2, 'Configure a lobby with at least two seats.');
        need(safe(R.round) && R.round < 9007199254740991, 'Classic round counter exhausted.');
        R.seats.forEach(function (s) {
            classicLedgerCheck(s, true);
        });
        R.round ++;
        R.phase = 'playing';
        R.turn = 0;
        R.point = null;
        R.entryPlaced = false;
        R.pausedFrom = null;
        R.lastRoll = null;
        R.seats.forEach(function (s) {
            s.roundResult = null;
        });
    }
    function classicStatus() {
        var active = R.seats[R.turn], out = '<b>Classic Dice - against the house</b><br>Round ' + R.round + ' - ' + esc(R.phase) + '<br>Bet per shooter: ' + R.setup.bet + ' ' + R.setup.denom + ' (record only).<br>Point: ' +(R.point === null ? 'none - come-out roll': R.point) + '<br>' + R.seats.map(function (s) {
            return s.num + '. ' + esc(s.label) + ' - wins ' + s.wins + ', losses ' + s.losses + '; net ' +(s.net >= 0 ? '+': '') + s.net + ' ' + R.setup.denom + '; staked ' + s.staked + ', gross returned ' + s.returned +(R.phase === 'playing' && active === s ? ' - SHOOTER': '');
        }).join('<br>');
        if (R.lastResult) out += '<br>Last result - round ' + R.lastResult.round + ': ' + esc(R.lastResult.label) + ' ' +(R.lastResult.won ? 'wins': 'loses') + '; net ' +(R.lastResult.net >= 0 ? '+': '') + R.lastResult.net + ' ' + R.setup.denom + '; gross return ' + R.lastResult.gross + ' ' + R.setup.denom + '.';
        return out;
    }
    function classicRules(id) {
        whisper(id, RULE_TEXT.classic, 'Tavern Games - Classic Rules');
    }
    function classicMenu(id, plain) {
        var text = classicStatus() + '<br>' + btn('Show Rules', 'classic-rules') + ' ' + btn('Refresh', 'classic-menu') + ' ' + btn('Choose game', 'games') + ' ' + btn('Plain menu', 'classic-plain');
        if (R.phase === 'lobby') text += '<br>' + btn('Join character', 'classic-join ' + R.rev + ' ?{Character ID}');
        if (R.phase === 'playing') {
            var s = R.seats[R.turn];
            if (s && controls(id, s)) text += '<br>' + btn('Roll 2d6 as ' + esc(s.label), 'classic-roll ' + R.rev + ' ' + s.num);
        }
        if (playerIsGM(id)) {
            if (! classicActive()) text += '<br>' + btn('New Classic lobby', 'classic-new ' + R.rev);
            if (R.phase === 'lobby') text += '<br>' + ['CP', 'SP', 'EP', 'GP', 'PP'].map(function (d) {
                return btn(d, 'classic-stake ' + R.rev + ' ' + d + ' ?{Bet per shooter|1}');
            }).join(' ') + ' ' + btn('Free play', 'classic-stake ' + R.rev + ' GP 0') + '<br>' + btn('Add NPC', 'classic-npc ' + R.rev + ' ?{NPC name}') + ' ' + btn('Start', 'classic-start ' + R.rev);
            if (R.phase === 'playing') text += '<br>' + btn('Pause', 'classic-pause ' + R.rev);
            if (R.phase === 'paused') text += '<br>' + btn('Resume', 'classic-resume ' + R.rev);
            if (R.phase === 'between') text += '<br>' + btn('Next Round', 'classic-next ' + R.rev);
            if (classicActive()) text += '<br>' + btn('End', 'classic-end ' + R.rev);
        }
        whisper(id, text, 'Tavern Games - Classic Dice', plain);
    }
    function classicMenus() {
        var sent = {
        };
        R.seats.forEach(function (s) {
            if (! s.npc && controls(s.owner, s) && ! sent[s.owner]) {
                sent[s.owner] = true;
                classicMenu(s.owner);
            }
        });
        findObjs({
            _type: 'player'
        }).forEach(function (p) {
            if (playerIsGM(p.id) && ! sent[p.id]) classicMenu(p.id);
        });
    }
    function classicCommand(id, op, args) {
        if (op === 'classic-menu' || op === 'classic-plain' || op === 'classic-rules') {
            need(! args.length, 'Unexpected arguments.');
            if (op === 'classic-rules') classicRules(id);
            else classicMenu(id, op === 'classic-plain');
            return;
        }
        need(args.shift() === String(R.rev), 'Stale Classic action. Open !tavern for fresh buttons.');
        if (op === 'classic-new') {
            gm(id);
            need(! args.length && ! classicActive(), 'End the current Classic game first.');
            need(! huntActive() && ! duelActive() && ! anteActive() && ! geltActive() && ! goblinActive() && ['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End the other game first.');
            R = classicFresh('lobby', R.rev);
            state[CLASSIC_KEY] = R;
        } else if (op === 'classic-join' || op === 'classic-npc') {
            need(R.phase === 'lobby' && R.seats.length < 12, 'Join only in a lobby, maximum 12 seats.');
            var c = null, label;
            if (op === 'classic-npc') {
                gm(id);
                label = args.join(' ');
                need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1-60 characters.');
            } else {
                need(args.length === 1, 'Supply a character ID.');
                c = getObj('character', args[0]);
                need(c, 'Character not found.');
                var owners = String(c.get('controlledby') || '').split(',');
                need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                need(! R.seats.some(function (s) {
                    return ! s.npc && s.owner === id || s.char === c.id;
                }), 'Player or character already seated.');
                label = String(c.get('name')).slice(0, 60);
            }
            R.seats.push({
                num: R.seats.length + 1, label: label, char: c && c.id, owner: id, npc: op === 'classic-npc', net: 0, staked: 0, returned: 0, wins: 0, losses: 0, roundResult: null
            });
        } else if (op === 'classic-stake') {
            gm(id);
            need(R.phase === 'lobby' && args.length === 2 && /^(CP|SP|EP|GP|PP)$/.test(args[0]) && /^(0|[1-9]\d{0,15})$/.test(args[1]) && safe(Number(args[1])) && Number(args[1]) <= 4503599627370495, 'Set a denomination and safe nonnegative whole-number bet; maximum 4503599627370495.');
            R.setup = {
                configured: true, denom: args[0], bet: Number(args[1])
            };
        } else if (op === 'classic-start') {
            gm(id);
            need(! args.length && R.phase === 'lobby', 'Start only in the Classic lobby.');
            classicBegin();
        } else if (op === 'classic-next') {
            gm(id);
            need(! args.length && R.phase === 'between', 'Next Round only after every shooter resolves.');
            classicBegin();
        } else if (op === 'classic-roll') {
            need(R.phase === 'playing' && args.length === 1, 'Roll for an explicit current shooter.');
            var actor = classicSeat(args[0]);
            need(controls(id, actor), 'You do not control that shooter.');
            need(R.turn === actor.num - 1, 'It is not that seat\'s shooting turn.');
            classicLedgerCheck(actor, ! R.entryPlaced);
            var first = R.point === null, oldPoint = R.point, a = randomInteger(6), b = randomInteger(6), sum = a + b, won = first ?(sum === 7 || sum === 11): sum === oldPoint, lost = first ?(sum === 2 || sum === 3 || sum === 12): sum === 7;
            if (! R.entryPlaced) {
                actor.staked += R.setup.bet;
                R.entryPlaced = true;
            }
            R.lastRoll = {
                round: R.round, seat: actor.num, dice: [a, b], sum: sum, point: oldPoint
            };
            var out = esc(actor.label) + ' rolls <span data-tg-public-die="6:' + a + '">D6 face ' + a + '</span> + <span data-tg-public-die="6:' + b + '">D6 face ' + b + '</span> = ' + sum + '<br>' +(first ? 'Come-out roll.': 'Point was ' + oldPoint + '.');
            if (won || lost) {
                var change = won ? R.setup.bet: - R.setup.bet, gross = won ? R.setup.bet * 2: 0;
                actor.net += change;
                actor.returned += gross;
                if (won) actor.wins ++;
                else actor.losses ++;
                actor.roundResult = {
                    round: R.round, won: won, net: change, gross: gross, stake: R.setup.bet
                };
                R.lastResult = {
                    round: R.round, label: actor.label, won: won, net: change, gross: gross
                };
                out += '<br>' +(won ? 'WIN': 'LOSS') + ' against the house. Net ' +(change >= 0 ? '+': '') + change + ' ' + R.setup.denom + '; gross return ' + gross + ' ' + R.setup.denom + '.<br>No sheet balances changed.';
                R.point = null;
                R.entryPlaced = false;
                if (R.turn + 1 < R.seats.length) R.turn ++;
                else R.phase = 'between';
            } else {
                if (first) R.point = sum;
                out += '<br>' +(first ? 'Point established: ' + R.point + '.': 'Continue: point ' + R.point + ' remains.') + ' Same shooter rolls again when ready.';
            }
            say(out, 'Tavern Games - Classic Roll');
        } else if (op === 'classic-pause' || op === 'classic-resume') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            if (op === 'classic-pause') {
                need(R.phase === 'playing', 'No active Classic round.');
                R.pausedFrom = R.phase;
                R.phase = 'paused';
            } else {
                need(R.phase === 'paused' && R.pausedFrom === 'playing', 'Classic is not paused.');
                R.phase = R.pausedFrom;
                R.pausedFrom = null;
            }
        } else if (op === 'classic-end') {
            gm(id);
            need(! args.length && classicActive(), 'No current Classic game.');
            R = classicFresh('ended', R.rev + 1);
            state[CLASSIC_KEY] = R;
            say('Game ended.', 'Tavern Games - Game ended');
            return;
        } else throw new Error('Unknown Classic command.');
        R.rev ++;
        say(classicStatus(), 'Tavern Games - Classic Dice');
        classicMenus();
    }
    function duelFresh(phase, rev) {
        return {
            schema: 1, rev: rev, phase: phase, round: 0, roundTicket: 0, seats: [], pausedFrom: null, results: null
        };
    }
    function duelActive() {
        return ['lobby', 'round', 'paused', 'between', 'finished'].indexOf(U.phase) !== - 1;
    }
    function duelSeat(n) {
        need(/^[1-2]$/.test(n || ''), 'Choose Duel seat 1 or 2.');
        var s = U.seats[Number(n) - 1];
        need(s, 'No such Duel seat.');
        return s;
    }
    function duelBegin() {
        need(U.seats.length === 2 && U.seats.every(function (s) {
            return s.points > 0;
        }), 'Need two wizards with points remaining.');
        need(safe(U.round) && U.round < 9007199254740991, 'Duel round counter exhausted.');
        U.round ++;
        U.phase = 'round';
        U.roundTicket = U.rev + 1;
        U.results = null;
        U.pausedFrom = null;
        U.seats.forEach(function (s) {
            s.roll = null;
        });
    }
    function duelResolve() {
        need(U.seats.every(function (s) {
            return s.roll && s.roll.length === 3;
        }), 'Wait for both submissions.');
        var left = U.seats[0], right = U.seats[1], lost = [0, 0], pairs = [];
        for (var i = 0; i < 3; i ++) {
            var a = left.roll[i], b = right.roll[i], winner = a > b ? 1: b > a ? 2: null;
            if (winner === 1) lost[1] ++;
            if (winner === 2) lost[0] ++;
            pairs.push({
                index: i + 1, a: a, b: b, winner: winner
            });
        }
        left.points = Math.max(0, left.points - lost[0]);
        right.points = Math.max(0, right.points - lost[1]);
        var outcome = left.points === 0 && right.points === 0 ? 'draw': left.points === 0 || right.points === 0 ? 'win': 'continue', winner = outcome === 'win' ?(left.points > 0 ? 1: 2): null;
        U.results = {
            round: U.round, pairs: pairs, lost: lost, remaining: [left.points, right.points], outcome: outcome, winner: winner
        };
        U.phase = outcome === 'continue' ? 'between': 'finished';
        var out = '<b>Wizard\'s Duel - round ' + U.round + '</b><br>' + pairs.map(function (p) {
            return 'Pair ' + p.index + ': ' + esc(left.label) + ' ' + d20face(p.a) + ' vs ' + esc(right.label) + ' ' + d20face(p.b) + ' - ' +(p.winner === null ? 'tie; no points lost': esc(U.seats[p.winner === 1 ? 1: 0].label) + ' loses 1 point');
        }).join('<br>') + '<br>Both results applied together: ' + esc(left.label) + ' loses ' + lost[0] + ' points; ' + esc(right.label) + ' loses ' + lost[1] + ' points.<br>Points remaining: ' + esc(left.label) + ' ' + left.points + '; ' + esc(right.label) + ' ' + right.points + '.';
        if (outcome === 'draw') out += '<br>Both reach 0 points - draw.';
        else if (outcome === 'win') out += '<br>' + esc(U.seats[winner - 1].label) + ' wins!';
        else out += '<br>GM may start Next Round.';
        say(out, 'Tavern Games - Duel Reveal');
    }
    function duelStatus() {
        var text = '<b>Wizard\'s Duel - game-only points</b><br>Round ' + U.round + ' - ' + esc(U.phase) + '<br>' + U.seats.map(function (s) {
            return s.num + '. ' + esc(s.label) + ' - ' + s.points + ' points remaining; ' +(s.roll ? 'submitted': 'awaiting submission');
        }).join('<br>');
        if (U.results) text += '<br>Round result: ' +(U.results.outcome === 'draw' ? 'draw - both reach 0 points': U.results.outcome === 'win' ? esc(U.seats[U.results.winner - 1].label) + ' wins': U.results.lost[0] + ' / ' + U.results.lost[1] + ' points lost simultaneously');
        return text;
    }
    function duelRules(id) {
        whisper(id, RULE_TEXT.duel, 'Tavern Games - Duel Rules');
    }
    function duelMenu(id, plain) {
        var text = duelStatus();
        U.seats.forEach(function (s) {
            if (controls(id, s)) {
                if (s.roll) text += '<br>' + esc(s.label) + ' - ' +(s.npc ? 'NPC submitted dice: ': 'Your submitted dice: ') + s.roll.map(function (v, i) {
                    return 'Die ' +(i + 1) + ' ' + d20face(v);
                }).join('; ');
                if (U.phase === 'round' && ! s.roll) text += '<br>' + btn('Submit 3d20 as ' + esc(s.label), 'duel-roll ' + U.roundTicket + ' ' + s.num);
            }
        });
        text += '<br>' + btn('Show Rules', 'duel-rules') + ' ' + btn('Refresh', 'duel-menu') + ' ' + btn('Choose game', 'games') + ' ' + btn('Plain menu', 'duel-plain');
        if (U.phase === 'lobby' && U.seats.length < 2) text += '<br>' + btn('Join character', 'duel-join ' + U.rev + ' ?{Character ID}');
        if (playerIsGM(id)) {
            if (! duelActive()) text += '<br>' + btn('New Duel lobby', 'duel-new ' + U.rev);
            if (U.phase === 'lobby') text += '<br>' +(U.seats.length < 2 ? btn('Add NPC', 'duel-npc ' + U.rev + ' ?{NPC name}') + ' ': '') + btn('Start', 'duel-start ' + U.rev);
            if (U.phase === 'round') text += '<br>' + btn('Pause', 'duel-pause ' + U.rev);
            if (U.phase === 'paused') text += '<br>' + btn('Resume', 'duel-resume ' + U.rev);
            if (U.phase === 'between') text += '<br>' + btn('Next Round', 'duel-next ' + U.rev);
            if (duelActive()) text += '<br>' + btn('End', 'duel-end ' + U.rev);
        }
        whisper(id, text, 'Tavern Games - Wizard\'s Duel', plain, U.seats.some(function (s) {
            return ! s.npc && controls(id, s) && s.roll;
        }));
    }
    function duelMenus() {
        var sent = {
        };
        U.seats.forEach(function (s) {
            if (! s.npc && controls(s.owner, s) && ! sent[s.owner]) {
                sent[s.owner] = true;
                duelMenu(s.owner);
            }
        });
        findObjs({
            _type: 'player'
        }).forEach(function (p) {
            if (playerIsGM(p.id) && ! sent[p.id]) duelMenu(p.id);
        });
    }
    function duelCommand(id, op, args) {
        if (op === 'duel-menu' || op === 'duel-plain' || op === 'duel-rules') {
            need(! args.length, 'Unexpected arguments.');
            if (op === 'duel-rules') duelRules(id);
            else duelMenu(id, op === 'duel-plain');
            return;
        }
        need(args.shift() === String(op === 'duel-roll' ? U.roundTicket: U.rev), 'Stale Duel action. Open !tavern for fresh buttons.');
        if (op === 'duel-new') {
            gm(id);
            need(! args.length && ! duelActive(), 'End the current Duel first.');
            need(! huntActive() && ! classicActive() && ! anteActive() && ! geltActive() && ! goblinActive() && ['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End the other game first.');
            U = duelFresh('lobby', U.rev);
            state[DUEL_KEY] = U;
        } else if (op === 'duel-join' || op === 'duel-npc') {
            need(U.phase === 'lobby' && U.seats.length < 2, 'Duel lobby has exactly two seats.');
            var c = null, label;
            if (op === 'duel-npc') {
                gm(id);
                label = args.join(' ');
                need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1-60 characters.');
            } else {
                need(args.length === 1, 'Supply a character ID.');
                c = getObj('character', args[0]);
                need(c, 'Character not found.');
                var owners = String(c.get('controlledby') || '').split(',');
                need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                need(! U.seats.some(function (s) {
                    return ! s.npc && s.owner === id || s.char === c.id;
                }), 'Player or character already seated.');
                label = String(c.get('name')).slice(0, 60);
            }
            U.seats.push({
                num: U.seats.length + 1, label: label, char: c && c.id, owner: id, npc: op === 'duel-npc', points: 10, roll: null
            });
        } else if (op === 'duel-start') {
            gm(id);
            need(! args.length && U.phase === 'lobby', 'Start only in the Duel lobby.');
            duelBegin();
        } else if (op === 'duel-next') {
            gm(id);
            need(! args.length && U.phase === 'between', 'Next Round only after both submissions resolve.');
            duelBegin();
        } else if (op === 'duel-roll') {
            need(U.phase === 'round' && args.length === 1, 'Submit for one explicit seat in an active round.');
            var actor = duelSeat(args[0]);
            need(controls(id, actor), 'You do not control that wizard.');
            need(! actor.roll, 'That wizard already submitted this round.');
            actor.roll = [randomInteger(20), randomInteger(20), randomInteger(20)];
            if (U.seats.every(function (s) {
                return s.roll;
            })) duelResolve();
            else say(esc(actor.label) + ' has submitted. Waiting for the other wizard.', 'Tavern Games - Duel Submission');
        } else if (op === 'duel-pause' || op === 'duel-resume') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            if (op === 'duel-pause') {
                need(U.phase === 'round', 'No pending Duel round.');
                U.pausedFrom = U.phase;
                U.phase = 'paused';
            } else {
                need(U.phase === 'paused' && U.pausedFrom === 'round', 'Duel is not paused.');
                U.phase = U.pausedFrom;
                U.pausedFrom = null;
            }
            U.roundTicket = U.rev + 1;
        } else if (op === 'duel-end') {
            gm(id);
            need(! args.length && duelActive(), 'No current Duel game.');
            U = duelFresh('ended', U.rev + 1);
            state[DUEL_KEY] = U;
            say('Game ended.', 'Tavern Games - Game ended');
            return;
        } else throw new Error('Unknown Duel command.');
        U.rev ++;
        say(duelStatus(), 'Tavern Games - Wizard\'s Duel');
        duelMenus();
    }
    function huntFresh(phase, rev) {
        return {
            schema: 1, rollMode: 2, rev: rev, phase: phase, round: 0, seats: [], turn: 0, dc: null, rawDC: null, dcRolls: [], pausedFrom: null, results: null, setup: {
                configured: false, denom: 'GP', entry: 0, pot: 0
            }
        };
    }
    function huntActive() {
        return ['lobby', 'playing', 'paused', 'settled'].indexOf(V.phase) !== - 1;
    }
    function huntSeat(n) {
        need(/^[1-9]\d*$/.test(n || ''), 'Invalid Hunt seat.');
        var s = V.seats[Number(n) - 1];
        need(s, 'No such Hunt seat.');
        return s;
    }
    function huntSequence(direction) {
        return direction === 'asc' ? [4, 6, 8, 10, 10, 12, 20]: [20, 12, 10, 10, 8, 6, 4];
    }
    function huntMetrics(rolls, dc) {
        var total = 0, cumulative = [], score = null;
        rolls.forEach(function (d, i) {
            total += d.value;
            cumulative.push(total);
            if (score === null && total >= dc) score = i + 1;
        });
        return {
            total: total, cumulative: cumulative, score: score
        };
    }
    function huntValidateRolls(s) {
        need(Array.isArray(s.rolls) && s.rolls.length <= 7, 'Invalid saved Hunt dice.');
        need(s.direction === null && s.rolls.length === 0 || s.direction === 'asc' || s.direction === 'desc', 'Invalid saved Hunt order.');
        var seq = huntSequence(s.direction);
        s.rolls.forEach(function (d, i) {
            need(d && d.sides === seq[i] && safe(d.value) && d.value >= 1 && d.value <= d.sides, 'Saved Hunt dice do not match their locked order.');
        });
    }
    function huntMigrate() {
        if (V.rollMode === 2) return;
        try {
            if (['playing', 'paused', 'settled'].indexOf(V.phase) !== - 1) need(safe(V.dc) && V.dc >= 7 && V.dc <= 70, 'Invalid saved Hunt target.');
            need(V.setup && safe(V.setup.pot), 'Invalid saved Hunt treasure.');
            var records = V.seats.map(function (s) {
                huntValidateRolls(s);
                var m = huntMetrics(s.rolls, V.dc);
                need(! s.done || s.rolls.length === 7 || s.success && m.score !== null, 'Incomplete saved Hunt result.');
                need(! s.done || ! ! s.success ===(m.score !== null), 'Inconsistent saved Hunt result.');
                return {
                    s: s, m: m
                };
            });
            records.forEach(function (r) {
                r.s.total = r.m.total;
                r.s.cumulative = r.m.cumulative;
                r.s.scoreRolls = r.m.score;
                r.s.legacyCompleted = ! ! r.s.done && r.s.rolls.length < 7;
            });
            V.rollMode = 2;
        } catch (e) {
            V.migrationError = 'Saved Hunt dice could not be safely read. No dice were rerolled. End this Hunt and start a new lobby.';
            render(V.migrationError, 'Tavern Games - Hunt Upgrade', 'gm', false);
        }
    }
    function huntDcText() {
        return V.dc === null ? 'DC not rolled': 'Rolled ' + V.rawDC + ' &#8594; DC ' + V.dc +(V.rawDC > 70 ? ' (capped at 70)': ' (uncapped; maximum DC 70)');
    }
    function huntSettle() {
        need(V.seats.every(function (s) {
            return s.done;
        }), 'Wait for every hunter.');
        need(safe(V.setup.pot), 'Invalid treasure total.');
        var successful = V.seats.filter(function (s) {
            return s.success;
        }), pot = V.setup.pot;
        if (! successful.length) {
            V.results = {
                kind: 'none', hunt: V.round, dc: V.dc, rawDC: V.rawDC, pot: pot, denom: V.setup.denom, winners: []
            };
            V.phase = 'settled';
            say('Nobody reached DC ' + V.dc + '. Treasure ' + pot + ' ' + V.setup.denom + ' carries to the next hunt.', 'Tavern Games - Hunt Result');
            return;
        }
        var fewest = Math.min.apply(null, successful.map(function (s) {
            return s.scoreRolls;
        })), winners = successful.filter(function (s) {
            return s.scoreRolls === fewest;
        }).sort(function (a, b) {
            return a.num - b.num;
        }), base = Math.floor(pot / winners.length), odd = pot % winners.length;
        var payouts = winners.map(function (s, i) {
            return {
                seat: s.num, label: s.label, rolls: s.scoreRolls, total: s.cumulative[s.scoreRolls - 1], fullTotal: s.total, amount: base +(i < odd ? 1: 0)
            };
        });
        V.results = {
            kind: 'paid', hunt: V.round, dc: V.dc, rawDC: V.rawDC, pot: pot, denom: V.setup.denom, winners: payouts
        };
        V.setup.pot = 0;
        V.phase = 'settled';
        say('<b>Treasure Hunt result</b><br>All hunters compared. Fewest successful rolls: ' + fewest + '.<br>' + payouts.map(function (p) {
            return esc(p.label) + ' reached ' + p.total + ' in ' + p.rolls + ' rolls and wins ' + p.amount + ' ' + V.setup.denom;
        }).join('<br>') + '<br>Recorded treasure only; no sheet balances changed.', 'Tavern Games - Hunt Result');
    }
    function huntStatus() {
        if (V.migrationError) return '<b>Treasure Hunt</b><br>' + V.migrationError;
        var text = '<b>Treasure Hunt</b><br>Hunt ' + V.round + ' - ' + esc(V.phase) + '<br>' + huntDcText() + '<br>Recorded treasure: ' + V.setup.pot + ' ' + V.setup.denom + '; entry ' + V.setup.entry + ' per seat.<br>' + V.seats.map(function (s) {
            return s.num + '. ' + esc(s.label) + ' - displayed total ' + s.total + ', ' + s.rolls.length + ' dice shown; ' +(s.direction === null ? 'order not chosen': s.direction === 'asc' ? 'ascending': 'descending') +(s.done ?(s.success ? ' - reached DC at roll ' + s.scoreRolls: ' - no success'):(V.phase === 'playing' && V.turn === s.num - 1 ? ' - CURRENT HUNTER': '')) +(s.legacyCompleted ? ' (completed before upgrade; retained)': '');
        }).join('<br>');
        if (V.results) text += '<br>Last hunt result: ' +(V.results.kind === 'none' ? 'no success; ' + V.results.pot + ' ' + V.results.denom + ' carries forward': V.results.winners.map(function (p) {
            return esc(p.label) + ' won ' + p.amount + ' ' + V.results.denom + ' in ' + p.rolls + ' rolls';
        }).join('; '));
        return text;
    }
    function huntRules(id) {
        whisper(id, RULE_TEXT.hunt, 'Tavern Games - Hunt Rules');
    }
    function huntMenu(id, plain) {
        var text = huntStatus() + '<br>' + btn('Show Rules', 'hunt-rules') + ' ' + btn('Refresh', 'hunt-menu') + ' ' + btn('Choose game', 'games') + ' ' + btn('Plain menu', 'hunt-plain');
        if (V.phase === 'lobby') text += '<br>' + btn('Join character', 'hunt-join ' + V.rev + ' ?{Character ID}');
        if (V.phase === 'playing' && ! V.migrationError) {
            var s = V.seats[V.turn];
            if (s && controls(id, s)) {
                if (s.direction === null) text += '<br>' + btn('Ascending - full set as ' + esc(s.label), 'hunt-roll ' + V.rev + ' ' + s.num + ' asc') + ' ' + btn('Descending - full set as ' + esc(s.label), 'hunt-roll ' + V.rev + ' ' + s.num + ' desc');
                else text += '<br>' + s.rolls.length + ' earlier dice preserved.<br>' + btn('Complete locked ' +(s.direction === 'asc' ? 'ascending': 'descending') + ' set as ' + esc(s.label), 'hunt-roll ' + V.rev + ' ' + s.num + ' ' + s.direction);
            }
        }
        if (playerIsGM(id)) {
            if (! huntActive()) text += '<br>' + btn('New Hunt lobby', 'hunt-new ' + V.rev);
            if (V.phase === 'lobby') text += '<br>' + ['CP', 'SP', 'EP', 'GP', 'PP'].map(function (d) {
                return btn(d, 'hunt-stake ' + V.rev + ' ' + d + ' ?{Entry per seat|1}');
            }).join(' ') + ' ' + btn('Free play', 'hunt-stake ' + V.rev + ' GP 0') + '<br>' + btn('Add NPC', 'hunt-npc ' + V.rev + ' ?{NPC name}') + ' ' + btn('Start', 'hunt-start ' + V.rev);
            if (V.phase === 'playing') text += '<br>' + btn('Pause', 'hunt-pause ' + V.rev);
            if (V.phase === 'paused') text += '<br>' + btn('Resume', 'hunt-resume ' + V.rev);
            if (V.phase === 'settled') text += '<br>' + btn('Next Hunt', 'hunt-next ' + V.rev);
            if (huntActive()) text += '<br>' + btn('End', 'hunt-end ' + V.rev);
        }
        whisper(id, text, 'Tavern Games - Treasure Hunt', plain);
    }
    function huntMenus() {
        var sent = {
        };
        V.seats.forEach(function (s) {
            if (! s.npc && controls(s.owner, s) && ! sent[s.owner]) {
                sent[s.owner] = true;
                huntMenu(s.owner);
            }
        });
        findObjs({
            _type: 'player'
        }).forEach(function (p) {
            if (playerIsGM(p.id) && ! sent[p.id]) huntMenu(p.id);
        });
    }
    function huntBegin() {
        need(! V.migrationError, 'End this Hunt and create a new lobby to recover saved dice.');
        need(V.seats.length >= 1 && V.setup.configured, 'Configure a Hunt lobby with at least one seat.');
        need(safe(V.round) && V.round < 9007199254740991 && safe(V.setup.entry) && safe(V.setup.pot), 'Invalid hunt counter or treasure.');
        need(V.setup.entry <= Math.floor((9007199254740991 - V.setup.pot) / V.seats.length), 'Hunt treasure would overflow.');
        var dcRolls = [];
        for (var i = 0; i < 7; i ++) dcRolls.push(randomInteger(12));
        V.setup.pot += V.setup.entry * V.seats.length;
        V.round ++;
        V.dcRolls = dcRolls;
        V.rawDC = dcRolls.reduce(function (a, b) {
            return a + b;
        }, 0);
        V.dc = Math.min(V.rawDC, 70);
        V.phase = 'playing';
        V.turn = 0;
        V.pausedFrom = null;
        V.results = null;
        V.rollMode = 2;
        V.seats.forEach(function (s) {
            s.direction = null;
            s.rolls = [];
            s.total = 0;
            s.cumulative = [];
            s.scoreRolls = null;
            s.legacyCompleted = false;
            s.done = false;
            s.success = false;
        });
        say('DC rolls (7d12): ' + dcRolls.map(function (v) {
            return '<span data-tg-public-die="12:' + v + '">D12 face ' + v + '</span>';
        }).join(' + ') + ' = ' + V.rawDC + '.<br>' + huntDcText() + '.', 'Tavern Games - Hunt DC');
    }
    function huntCommand(id, op, args) {
        if (op === 'hunt-menu' || op === 'hunt-plain' || op === 'hunt-rules') {
            need(! args.length, 'Unexpected arguments.');
            if (op === 'hunt-rules') huntRules(id);
            else huntMenu(id, op === 'hunt-plain');
            return;
        }
        need(args.shift() === String(V.rev), 'Stale Hunt action. Open !tavern for fresh buttons.');
        if (op === 'hunt-new') {
            gm(id);
            need(! args.length && ! huntActive(), 'End the current Hunt first.');
            need(! duelActive() && ! classicActive() && ! anteActive() && ! geltActive() && ! goblinActive() && ['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End the other game first.');
            V = huntFresh('lobby', V.rev);
            state[HUNT_KEY] = V;
        } else if (op === 'hunt-join' || op === 'hunt-npc') {
            need(V.phase === 'lobby' && V.seats.length < 12, 'Join only in a lobby, maximum 12 seats.');
            var c = null, label;
            if (op === 'hunt-npc') {
                gm(id);
                label = args.join(' ');
                need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1-60 characters.');
            } else {
                need(args.length === 1, 'Supply a character ID.');
                c = getObj('character', args[0]);
                need(c, 'Character not found.');
                var owners = String(c.get('controlledby') || '').split(',');
                need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                need(! V.seats.some(function (s) {
                    return ! s.npc && s.owner === id || s.char === c.id;
                }), 'Player or character already seated.');
                label = String(c.get('name')).slice(0, 60);
            }
            V.seats.push({
                num: V.seats.length + 1, label: label, char: c && c.id, owner: id, npc: op === 'hunt-npc', direction: null, rolls: [], total: 0, cumulative: [], scoreRolls: null, legacyCompleted: false, done: false, success: false
            });
        } else if (op === 'hunt-stake') {
            gm(id);
            need(V.phase === 'lobby' && args.length === 2 && /^(CP|SP|EP|GP|PP)$/.test(args[0]) && /^(0|[1-9]\d{0,15})$/.test(args[1]) && safe(Number(args[1])), 'Set a safe denomination/entry in the lobby.');
            V.setup = {
                configured: true, denom: args[0], entry: Number(args[1]), pot: 0
            };
        } else if (op === 'hunt-start') {
            gm(id);
            need(! args.length && V.phase === 'lobby', 'Start only in a Hunt lobby.');
            huntBegin();
        } else if (op === 'hunt-next') {
            gm(id);
            need(! args.length && V.phase === 'settled', 'Next Hunt only after all hunters resolve.');
            huntBegin();
        } else if (op === 'hunt-roll') {
            need(! V.migrationError, 'End this Hunt and create a new lobby to recover saved dice.');
            need(V.phase === 'playing' && args.length === 2 && /^(asc|desc)$/.test(args[1]), 'Choose an explicit seat and ascending or descending order.');
            var actor = huntSeat(args[0]);
            need(controls(id, actor) && V.turn === actor.num - 1 && ! actor.done, 'You do not control the current hunter.');
            need(actor.direction === null || actor.direction === args[1], 'Order is locked by previously committed dice.');
            huntValidateRolls(actor);
            need(safe(V.setup.pot), 'Invalid treasure total.');
            var sequence = huntSequence(args[1]), preserved = actor.rolls.length, rolls = actor.rolls.map(function (d) {
                return {
                    sides: d.sides, value: d.value
                };
            });
            for (var i = preserved; i < 7; i ++) {
                var sides = sequence[i];
                rolls.push({
                    sides: sides, value: randomInteger(sides)
                });
            }
            var metrics = huntMetrics(rolls, V.dc);
            actor.direction = args[1];
            actor.rolls = rolls;
            actor.total = metrics.total;
            actor.cumulative = metrics.cumulative;
            actor.scoreRolls = metrics.score;
            actor.success = metrics.score !== null;
            actor.done = true;
            actor.legacyCompleted = false;
            var out = '<b>' + esc(actor.label) + ' - ' +(actor.direction === 'asc' ? 'Ascending': 'Descending') + ' full set</b><br>DC ' + V.dc + '.' +(preserved ? '<br>' + preserved + ' previously committed dice preserved.': '') + '<br>' + rolls.map(function (d, index) {
                var line = 'Roll ' +(index + 1) + ': <span data-tg-public-die="' + d.sides + ':' + d.value + '">D' + d.sides + ' face ' + d.value + '</span> - running total ' + metrics.cumulative[index];
                if (metrics.score === index + 1) return '<b>' + line + ' - FIRST REACH; score ' + metrics.score + ' rolls</b>';
                if (metrics.score !== null && index + 1 > metrics.score) return line + ' - display only; does not change score';
                return line;
            }).join('<br>') + '<br>' +(actor.success ? 'Successful score: ' + actor.scoreRolls + ' rolls.': 'No success after all 7 dice.') + ' Full displayed total: ' + actor.total + '.';
            say(out, 'Tavern Games - Hunt Set');
            if (V.turn + 1 < V.seats.length) V.turn ++;
            else huntSettle();
        } else if (op === 'hunt-pause' || op === 'hunt-resume') {
            gm(id);
            need(! args.length, 'Unexpected arguments.');
            if (op === 'hunt-pause') {
                need(V.phase === 'playing', 'No active Hunt.');
                V.pausedFrom = V.phase;
                V.phase = 'paused';
            } else {
                need(V.phase === 'paused' && V.pausedFrom === 'playing', 'Hunt is not paused.');
                V.phase = V.pausedFrom;
                V.pausedFrom = null;
            }
        } else if (op === 'hunt-end') {
            gm(id);
            need(! args.length && huntActive(), 'No current Hunt game.');
            V = huntFresh('ended', V.rev + 1);
            state[HUNT_KEY] = V;
            say('Game ended.', 'Tavern Games - Game ended');
            return;
        } else throw new Error('Unknown Hunt command.');
        V.rev ++;
        say(huntStatus(), 'Tavern Games - Treasure Hunt');
        huntMenus();
    }
    function command(msg) {
        if (msg.type !== 'api' || ! /^!tavern(?:\s|$)/.test(msg.content) || ! getObj('player', msg.playerid)) {
            return;
        }
        var id = msg.playerid;
        try {
            need(msg.content.length < 600, 'Command too long.');
            var a = msg.content.trim().split(/\s+/), op = a[1] || 'menu', args = a.slice(2), beganRound = false;
            if (op === 'refresh-rules') {
                gm(id);
                need(! args.length, 'Unexpected arguments.');
                ensureRules();
                whisper(id, 'Rules handout refresh requested. Use !tavern games for its link.');
                return;
            }
            if (op === 'games' || op === 'games-plain' || op === 'liars-menu' || op === 'liars-rules') {
                need(! args.length, 'Unexpected arguments.');
                if (op === 'games' || op === 'games-plain') {
                    gamesMenu(id, op === 'games-plain');
                } else if (op === 'liars-rules') {
                    rules(id);
                } else {
                    menu(id);
                }
                return;
            }
            if (op.indexOf('ante-') === 0) {
                anteCommand(id, op, args);
                return;
            }
            if (op.indexOf('gelt-') === 0) {
                geltCommand(id, op, args);
                return;
            }
            if (op.indexOf('goblin-') === 0) {
                goblinCommand(id, op, args);
                return;
            }
            if (op.indexOf('classic-') === 0) {
                classicCommand(id, op, args);
                return;
            }
            if (op.indexOf('duel-') === 0) {
                duelCommand(id, op, args);
                return;
            }
            if (op.indexOf('hunt-') === 0) {
                huntCommand(id, op, args);
                return;
            }
            if ((op === 'menu' || op === 'plain') && huntActive()) {
                need(! args.length, 'Unexpected arguments.');
                huntMenu(id, op === 'plain');
                return;
            }
            if (op === 'rules' && huntActive()) {
                need(! args.length, 'Unexpected arguments.');
                huntRules(id);
                return;
            }
            if ((op === 'menu' || op === 'plain') && duelActive()) {
                need(! args.length, 'Unexpected arguments.');
                duelMenu(id, op === 'plain');
                return;
            }
            if (op === 'rules' && duelActive()) {
                need(! args.length, 'Unexpected arguments.');
                duelRules(id);
                return;
            }
            if ((op === 'menu' || op === 'plain') && classicActive()) {
                need(! args.length, 'Unexpected arguments.');
                classicMenu(id, op === 'plain');
                return;
            }
            if (op === 'rules' && classicActive()) {
                need(! args.length, 'Unexpected arguments.');
                classicRules(id);
                return;
            }
            if ((op === 'menu' || op === 'plain') && goblinActive()) {
                need(! args.length, 'Unexpected arguments.');
                goblinMenu(id, op === 'plain');
                return;
            }
            if (op === 'rules' && goblinActive()) {
                need(! args.length, 'Unexpected arguments.');
                goblinRules(id);
                return;
            }
            if ((op === 'menu' || op === 'plain') && geltActive()) {
                need(! args.length, 'Unexpected arguments.');
                geltMenu(id, op === 'plain');
                return;
            }
            if (op === 'rules' && geltActive()) {
                need(! args.length, 'Unexpected arguments.');
                geltRules(id);
                return;
            }
            if ((op === 'menu' || op === 'plain') && anteActive()) {
                need(! args.length, 'Unexpected arguments.');
                anteMenu(id, op === 'plain');
                return;
            }
            if ((op === 'menu' || op === 'plain') && ['idle', 'ended'].indexOf(S.phase) !== - 1 && ! anteActive()) {
                need(! args.length, 'Unexpected arguments.');
                gamesMenu(id, op === 'plain');
                return;
            }
            if (op === 'rules' && anteActive()) {
                need(! args.length, 'Unexpected arguments.');
                anteRules(id);
                return;
            }
            if (op === 'menu' || op === 'plain' || op === 'rules') {
                need(! args.length, 'Unexpected arguments.');
                if (op === 'rules') {
                    rules(id);
                } else {
                    menu(id, op === 'plain');
                }
                return;
            }
            if (op === 'hand') {
                need(args.length <= 1, 'Usage: hand [NPC seat].');
                var mine = args.length ? seat(args[0]): S.seats.filter(function (s) {
                    return ! s.npc && s.owner === id;
                })[0];
                need(mine && controls(id, mine), 'You do not control that seat.');
                need(! args.length || mine.npc, 'Explicit seat access is for GM NPC hands only.');
                need(S.phase === 'playing' || S.phase === 'paused', 'No active hand.');
                whisper(id, esc(mine.label) + ' - round ' + S.round + '<br>' +(mine.npc ? 'NPC hand: ': 'Your hand: ') +(mine.hand.join(', ') || 'eliminated'), 'Tavern Games - Private Hand', false, ! mine.npc && mine.hand.length > 0);
                return;
            }
            need(args.shift() === ticket(), 'Stale action. Open !tavern for fresh buttons.');
            need(! huntActive(), 'End Treasure Hunt before changing Liar\'s Dice.');
            need(! duelActive(), 'End Wizard\'s Duel before changing Liar\'s Dice.');
            need(! classicActive(), 'End Classic Dice before changing Liar\'s Dice.');
            need(! goblinActive(), 'End Goblin\'s Challenge before changing Liar\'s Dice.');
            need(! geltActive(), 'End Gelt before changing Liar\'s Dice.');
            need(! anteActive(), 'End Three-Dragon Ante before changing Liar\'s Dice.');
            if (op === 'new') {
                gm(id);
                need(! args.length, 'Unexpected arguments.');
                need(['idle', 'ended', 'finished'].indexOf(S.phase) !== - 1, 'End the current game first.');
                clearGame('lobby');
            } else if (op === 'stake') {
                gm(id);
                need(S.phase === 'lobby', 'Stakes can only change before starting.');
                need(args.length === 2 && /^(CP|SP|EP|GP|PP)$/.test(args[0]) && /^(0|[1-9]\d{0,15})$/.test(args[1]), 'Choose CP, SP, EP, GP or PP and a nonnegative whole-number amount.');
                var amount = Number(args[1]);
                need(safe(amount), 'Amount exceeds the safe integer limit.');
                S.stakes = freshStakes(true);
                S.stakes.denom = args[0];
                S.stakes.amount = amount;
            } else if (op === 'join' || op === 'npc') {
                need(S.phase === 'lobby', 'Joining is only allowed in the lobby.');
                need(S.seats.length < 12, 'Maximum 12 seats.');
                var label, char = null;
                if (op === 'npc') {
                    gm(id);
                    label = args.join(' ');
                    need(label.length > 0 && label.length <= 60 && ! /[\x00-\x1f]/.test(label), 'NPC label must be 1–60 characters.');
                } else {
                    need(args.length === 1, 'Usage: join REV CHARACTER_ID.');
                    char = getObj('character', args[0]);
                    need(char, 'Character not found.');
                    var owners = String(char.get('controlledby') || '').split(',');
                    need(owners.indexOf(id) !== - 1 || owners.indexOf('all') !== - 1, 'You must control that character.');
                    need(! S.seats.some(function (s) {
                        return s.owner === id && ! s.npc || s.char === char.id;
                    }), 'Player or character already seated.');
                    label = String(char.get('name')).slice(0, 60);
                }
                S.seats.push({
                    num: S.seats.length + 1, label: label, char: char && char.id, owner: id, npc: op === 'npc', count: 5, hand: []
                });
            } else if (op === 'start') {
                gm(id);
                need(S.phase === 'lobby' && S.seats.length >= 2, 'Need a lobby with at least two seats.');
                need(args.length === 1, 'Choose random or a seat.');
                need(S.stakes.configured, 'Choose recorded stakes or Free play before starting.');
                contribution(S.seats.length);
                var first;
                if (args[0] === 'random') {
                    var contenders = S.seats.slice(), tie = 0;
                    while (contenders.length > 1 && tie < 100) {
                        var rolls = contenders.map(function (s) {
                            var x = randomInteger(6), y = randomInteger(6);
                            return {
                                s: s, x: x, y: y, total: x + y
                            };
                        });
                        say('First-player roll: ' + rolls.map(function (v) {
                            return esc(v.s.label) + ': ' + v.x + '+' + v.y + '=' + v.total;
                        }).join('; '));
                        var max = Math.max.apply(null, rolls.map(function (v) {
                            return v.total;
                        }));
                        contenders = rolls.filter(function (v) {
                            return v.total === max;
                        }).map(function (v) {
                            return v.s;
                        });
                        tie ++;
                    }
                    need(contenders.length === 1, 'Too many ties; choose a seat explicitly.');
                    first = contenders[0];
                } else {
                    first = seat(args[0]);
                }
                S.turn = first.num - 1;
                S.phase = 'playing';
                S.round = 1;
                S.bid = null;
                chargeRound();
                hands();
                beganRound = true;
            } else if (op === 'bid' || op === 'liar') {
                need(S.phase === 'playing', 'Game is not playing.');
                if (op === 'bid') {
                    need(controls(id, current()), 'It is not your turn.');
                    need(args.length === 2 && /^[1-9]\d{0,2}$/.test(args[0]) && /^[1-6]$/.test(args[1]), 'Use quantity 1–999 and face 1–6.');
                    var q = Number(args[0]), f = Number(args[1]);
                    need(! S.bid || q > S.bid.q || q === S.bid.q && f > S.bid.f, 'Raise quantity, or same quantity with higher face.');
                    S.bid = {
                        q: q, f: f, by: S.turn
                    };
                    say(esc(current().label) + ' bids ' + bidText(q, f) + '.');
                    S.turn = next(S.turn);
                } else {
                    need(S.bid && args.length <= 1, 'No current bid to challenge, or unexpected arguments.');
                    var owned = S.seats.filter(function (s) {
                        return s.count > 0 && controls(id, s);
                    });
                    var challenger;
                    if (args.length) {
                        challenger = seat(args[0]);
                    } else {
                        need(! playerIsGM(id) && owned.length === 1, 'Choose an explicit challenger seat using its Liar button.');
                        challenger = owned[0];
                    }
                    need(challenger.count > 0 && controls(id, challenger), 'You do not control a surviving challenger seat.');
                    need(challenger.num - 1 !== S.bid.by, 'The bidder cannot challenge their own bid.');
                    var challengeIndex = challenger.num - 1;
                    var actual = 0;
                    S.seats.forEach(function (s) {
                        s.hand.forEach(function (d) {
                            if (d === S.bid.f || d === 1 && S.bid.f !== 1) {
                                actual ++;
                            }
                        });
                    });
                    var loser = actual < S.bid.q ? S.bid.by: challengeIndex;
                    var winner = actual < S.bid.q ? challengeIndex: S.bid.by;
                    var survivingNext = alive().length -(S.seats[loser].count === 1 ? 1: 0);
                    need(safe(S.stakes.pot), 'Invalid pool total.');
                    if (survivingNext > 1) {
                        contribution(survivingNext, 0);
                    }
                    var reveal = '<b>Reveal round ' + S.round + '</b><br>Bid: ' + bidText(S.bid.q, S.bid.f) + ' by ' + esc(S.seats[S.bid.by].label) + '<br>Challenger: ' + esc(challenger.label) + '<br>' + S.seats.map(function (s) {
                        return esc(s.label) + ' - Dice: ' +(s.hand.join(', ') || 'eliminated');
                    }).join('<br>');
                    S.stakes.lastPayout = {
                        round: S.round, seat: winner + 1, label: S.seats[winner].label, amount: S.stakes.pot, denom: S.stakes.denom
                    };
                    S.stakes.pot = 0;
                    reveal += '<br>' + esc(S.seats[winner].label) + ' wins the recorded pool: ' + S.stakes.lastPayout.amount + ' ' + S.stakes.denom + '. No sheet balances changed.';
                    S.seats[loser].count --;
                    reveal += '<br>Matching count: ' + actual + '. ' + esc(S.seats[loser].label) + ' loses one die' +(S.seats[loser].count === 0 ? ' and is eliminated': '') + '.';
                    say(reveal, 'Tavern Games - Reveal');
                    S.bid = null;
                    if (alive().length === 1) {
                        S.phase = 'finished';
                        S.turn = alive()[0].num - 1;
                        S.seats.forEach(function (s) {
                            s.hand = [];
                        });
                        say(esc(current().label) + ' wins!');
                    } else {
                        S.turn = S.seats[loser].count ? loser: next(loser);
                        S.round ++;
                        chargeRound();
                        hands();
                        beganRound = true;
                    }
                }
            } else if (op === 'pause' || op === 'resume') {
                gm(id);
                need(! args.length && S.phase ===(op === 'pause' ? 'playing': 'paused'), 'Invalid phase or arguments.');
                S.phase = op === 'pause' ? 'paused': 'playing';
            } else if (op === 'end') {
                gm(id);
                need(! args.length && ['lobby', 'playing', 'paused', 'finished'].indexOf(S.phase) !== - 1, 'No current game.');
                clearGame('ended');
                touch();
                say('Game ended.', 'Tavern Games - Game ended');
                return;
            } else if (op === 'tracker') {
                throw new Error('Native tracker display has been removed.');
            } else {
                throw new Error('Unknown command. Use !tavern.');
            }
            touch();
            say(status() + '<br>' + poolStatus(), 'Tavern Games - Round ' + S.round);
            // Send only after revision advances: automatic GM buttons must be current.
            if (beganRound || op === 'bid') {
                S.seats.forEach(function (s) {
                    if (! s.npc && controls(s.owner, s) && ! playerIsGM(s.owner)) {
                        menu(s.owner);
                    }
                });
            }
            findObjs({
                _type: 'player'
            }).forEach(function (p) {
                if (playerIsGM(p.id)) {
                    menu(p.id);
                }
            });
            if (! playerIsGM(id) && ! beganRound && op !== 'bid') {
                menu(id);
            }
        } catch (e) {
            whisper(id, 'Tavern Games: ' + esc(e.message));
        }
    }
    on('ready', function () {
        if (! state[KEY]) {
            state[KEY] = {
                schema: 1, rev: 0, phase: 'idle', seats: [], round: 0, turn: 0, bid: null
            };
        }
        S = state[KEY];
        if (S.schema !== 1) {
            log('Tavern Games: unsupported state schema; disabled.');
            return;
        }
        if (! state[ANTE_KEY]) {
            state[ANTE_KEY] = anteFresh('idle', 0);
        }
        T = state[ANTE_KEY];
        if (T.schema !== 1) {
            log('Tavern Games: unsupported Ante state schema; disabled.');
            return;
        }
        T.rev ++;
        if (! state[GELT_KEY]) state[GELT_KEY] = geltFresh('idle', 0);
        G = state[GELT_KEY];
        if (G.schema !== 1) {
            log('Tavern Games: unsupported Gelt state schema; disabled.');
            return;
        }
        G.rev ++;
        if (! state[GOBLIN_KEY]) state[GOBLIN_KEY] = goblinFresh('idle', 0);
        C = state[GOBLIN_KEY];
        if (C.schema !== 1) {
            log('Tavern Games: unsupported Goblin state schema; disabled.');
            return;
        }
        C.rev ++;
        if (! state[CLASSIC_KEY]) state[CLASSIC_KEY] = classicFresh('idle', 0);
        R = state[CLASSIC_KEY];
        if (R.schema !== 1) {
            log('Tavern Games: unsupported Classic state schema; disabled.');
            return;
        }
        R.rev ++;
        if (! state[DUEL_KEY]) state[DUEL_KEY] = duelFresh('idle', 0);
        U = state[DUEL_KEY];
        if (U.schema !== 1) {
            log('Tavern Games: unsupported Duel state schema; disabled.');
            return;
        }
        U.rev ++;
        U.roundTicket = U.rev;
        if (! state[HUNT_KEY]) state[HUNT_KEY] = huntFresh('idle', 0);
        V = state[HUNT_KEY];
        if (V.schema !== 1) {
            log('Tavern Games: unsupported Hunt state schema; disabled.');
            return;
        }
        V.rev ++;
        huntMigrate();
        // Pre-stakes games migrate to free play with no historical or restart charge.
        if (! S.stakes) {
            S.stakes = freshStakes(true);
            S.stakes.chargedRound = S.round;
        }
        touch();
        // Invalidate every pre-restart action, but preserve dice and authoritative turn.
        cleanupLegacyTracker();
        if (S.phase === 'ended') {
            clearGame('ended');
        }
        on('chat:message', command);
        ensureRules();
        log('Tavern Games ' + VERSION + ' ready. Use !tavern games.');
    });
}());
