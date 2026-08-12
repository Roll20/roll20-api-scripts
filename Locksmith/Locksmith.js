// Script:   Locksmith
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis

var Locksmith = Locksmith || (function() {
    'use strict';

    var VERSION = '1.0.0';
    //Changelog
    // 1.0.0 Debut
    var SCRIPT_NAME = 'Locksmith';

    // Grid constants for the proximity check (pixels/square assumed; see
    // Geometry below for the door/window axis-inversion assumption)
    var PIXELS_PER_SQUARE = 70;
    var RANGE_SQUARES = 1.5; // adjacent square plus a safety margin for edge cases/measurement

    // Report cache sizing - reports collapse to a header link, body
    // cached here by short id, oldest evicted past this cap
    var MAX_CACHED_REPORTS = 50;
    // Help handout - find-or-create pattern, same as Chronicle's help
    // handout. Reuses the same avatar image used across other scripts.
    var HELP_NAME = 'Help: Locksmith';
    var HELP_AVATAR = 'https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147';

    // Metal-panel background for every chat card - CSS.container below
    // references this directly.
    var BG_IMAGE_URL = 'https://files.d20.io/images/496924732/hbrOYO3vwmWFoP9KuD8a2w/original.webp?1786261303';

    // A function, not a static string - the TOC links have to point at
    // this handout's own URL (Roll20's internal link format is
    // journal.roll20.net/handout/<id>/#<URL-encoded heading text>, not a
    // same-page anchor), so the text can't be built until the handout
    // object exists and its id is known.
    function buildHelpText(handoutId) {
        var base = 'http://journal.roll20.net/handout/' + handoutId + '/';
        var tocGM = base + '#For%20GMs';
        var tocPlayers = base + '#For%20Players';
        // Floated, no border - text wraps around the image instead of
        // the image breaking the paragraph flow. float (not flexbox) to
        // match this project's usual handout/chat rendering approach.
        function floatImg(url, alt, caption, side) {
            var margin = (side === 'right') ? '4px 0 10px 14px' : '4px 14px 10px 0';
            return '<div style="float:' + side + ';width:280px;margin:' + margin + ';' +
                '"><img src="' + url + '" alt="' + alt + '" style="width:100%;display:block;">' +
                '<div style="font-size:0.8em;font-style:italic;color:#555;margin-top:4px;">' + caption + '</div></div>';
        }
        var clear = '<div style="clear:both;"></div>';

        return `
<div>
<h1>Locksmith</h1>
<p>Locksmith manages locked doors and windows, and automatically resolves lock-picking attempts (Thieves' Tools checks) and the Knock spell against them.</p>
<p>Works with both versions of Roll20's D&amp;D 5th Edition sheet - 5e (legacy) and 5.5e (Beacon).</p>
<p><strong>Jump to:</strong> <a href="` + tocGM + `">For GMs</a> &nbsp;|&nbsp; <a href="` + tocPlayers + `">For Players</a></p>

<h2>For GMs</h2>

<h3>Setting Up a Lock</h3>
<p><strong>Command:</strong> <code>!lock</code></p>
` + floatImg(
    'https://files.d20.io/images/497202465/3wfLwxnDmlSW93c12dIvUA/original.webp?1786471913',
    'The Locksmith menu with several doors selected',
    'The Locksmith menu with a few doors selected - each row shows a status badge plus +Key/+Loot buttons.',
    'right'
) + `
<p>Select one or more doors/windows and run the bare command to open the Locksmith menu. The menu has two rows of buttons:</p>
<ul>
<li><strong>Selected</strong> - Lock, Unlock, and Report act on whatever doors/windows are currently selected. Lock/Unlock toggle Roll20's own locked state. Report shows each selected item's current status (or, with nothing selected, every door/window on the page).</li>
<li><strong>Set</strong> - DC, Unpickable, and Magic configure the selected door(s)/window(s). DC prompts for a difficulty (8-50). Unpickable marks it unbeatable by mundane lock-picking. Magic marks it as openable only by magic (e.g. the Knock spell), not mundane picking.</li>
</ul>
<p>A door or window needs <em>both</em> a DC/Unpickable/Magic setting <em>and</em> Roll20's native locked state turned on before a pick attempt or Knock will do anything with it - a configured-but-unlocked door is treated as just an ordinary unlocked door.</p>

<h3>Show/Hide All Lock DCs</h3>
<p>Toggles a small text label above every door/window on the current page, showing its status at a glance (a difficulty number, Unpickable, Magic, or Unset). Handy while placing locks; click it again to remove the labels. A label turns yellow if a character with a token currently on that page holds a key for that door/window - a quick way to spot "someone here can already open this." This is only as current as the last time labels were shown or refreshed - giving away a key or moving a token afterward won't update the color until labels are toggled again.</p>

<h3>Report DC</h3>
<p><code>!lock --report-dc</code> (also on the menu) lists every selected door/window's status, or every door/window on the page if nothing is selected. Each name is clickable and pings its location for you.</p>
` + clear + `

<h3>How locks are stored</h3>
<p>Locksmith works off Roll20's standard color property for doors and windows - it doesn't add any extra data to your game. Because of this, <strong>manually changing the color of a door or window Locksmith has configured can break its ability to track that lock.</strong> If you need to recolor something Locksmith manages, use the menu to reconfigure it afterward rather than hand-editing its color.</p>

<h3>Keys and Keyrings</h3>
<p>Anywhere a door or window's name is shown as a clickable ping (the menu's selected list, Report DC), there's a <strong>+Key</strong> button right after it. Clicking it prompts you to pick a token on the map - that token's character receives a key for that door/window, letting them bypass its lock (DC, Unpickable, or Magic) entirely with the Use/Try all Keys buttons on their own <code>!lock --keyring</code> report. Keys, once given, live entirely with the players - there's no further GM management needed unless you want to hand out more.</p>
<p>Next to +Key is <strong>+Loot</strong>, for handing out a key without picking a token yourself - useful for treasure. Clicking it whispers you a ready-to-use macro you can paste into a handout, treasure horde, or macro button. Whoever clicks that pasted macro with their own token selected gets the key automatically - no GM step needed at that point.</p>

<h3>Troubleshooting</h3>
<p><code>!lock --coords</code> - select exactly one token and one door/window, and this reports their measured distance. Useful if pick attempts or Knock seem to be missing doors that should be in range.</p>

<h2>For Players</h2>

<h3>Picking a Lock</h3>
<p>There's no special command - just make a Thieves' Tools check as you normally would (from your character sheet) while your token is near the door or window in question. <strong>Range:</strong> roughly an adjacent square, plus a small safety margin for measurement. Locksmith automatically finds the nearest locked door/window within that range and compares your roll:</p>
<ul>
<li>If you beat the DC, you'll see a success message with an <strong>Unlock</strong> button - click it to actually unlock it.</li>
<li>If you don't beat the DC, you're told your attempt failed, but never the DC itself - only your GM knows how close you came.</li>
<li>If nothing is in range, or the door isn't actually locked, or it's unpickable/magically sealed, you'll be told plainly.</li>
</ul>

<h3>Knock</h3>
<p>Casting Knock works the same way - no extra steps. <strong>Range:</strong> the spell's own range (60 feet) - Locksmith finds the nearest valid locked door/window within that range and offers the same kind of Unlock button. Knock can open magically-sealed doors that mundane lock-picking can't, but not ones marked Unpickable.</p>

<h3>Keys</h3>
` + floatImg(
    'https://files.d20.io/images/497202464/0QJEpMcZqgG47q1zBtw4rw/original.webp?1786471913',
    'A sample keyring report showing several keys',
    'A sample keyring - Use/Give/Drop per key, plus Try all Keys at the bottom.',
    'right'
) + `
<p>If your GM has given your character a key, select your token and run <code>!lock --keyring</code> (or just <code>!keyring</code>) to see what you're holding - only you and your GM will see this. Each key has three buttons:</p>
<ul>
<li><strong>Use</strong> toggles that specific door/window's locked state if you're close enough - bypassing whatever lock it has entirely.</li>
<li><strong>Give</strong> lets you hand the key off to another character by targeting their token.</li>
<li><strong>Drop</strong> removes the key from your keyring entirely - nobody receives it, and it'll ask you to confirm first since this can't be undone.</li>
</ul>
<p>There's also a <strong>Try all Keys</strong> button that toggles the locked state of the nearest door/window within range that you hold a key for - handy for "I try my keys" moments without picking through your list one by one.</p>
` + clear + `
` + floatImg(
    'https://files.d20.io/images/497202466/gLS4JX1BCSkLWPVAy9uF3Q/original.webp?1786471917',
    'The token action created by the Create Keys Token Action button',
    'The resulting "Keys." token action, ready to click from the token itself.',
    'right'
) + `
<p>The first time you (or your GM) run <code>!keyring</code> for a character, you'll also see a <strong>Create "Keys." Token Action</strong> button - this adds a one-click token action so you can run <code>!keyring</code> straight from your token in the future without typing anything. It only shows up if that character doesn't already have one.</p>
` + clear + `
</div>
`;
    }
    // Logger
    var Logger = {
        info: function(msg) { log('[' + SCRIPT_NAME + '] ' + msg); },
        warn: function(msg) { log('[' + SCRIPT_NAME + '][WARN] ' + msg); },
        error: function(msg) { log('[' + SCRIPT_NAME + '][ERROR] ' + msg); }
    };
    // CSS - centralized style definitions for whispered chat cards
    // (float-based layout only; Roll20 chat does not support flexbox)
    // No emoji/icons anywhere in this system - text only.
    var CSS = {
        // Metal-panel background (B1 palette). #8c949b is the image's own
        // average tone, kept as a solid fallback while the image loads or
        // if it fails to load. The source image is a tileable texture, so
        // it's repeated at native size rather than stretched with
        // background-size:cover - cover was scaling a small (300x225)
        // image up to fill the card, blurring out the fine texture detail
        // that tiling preserves.
        container: 'style="border:1px solid #17212c;border-radius:6px;' +
            'background-color:#8c949b;background-image:url(\'' + BG_IMAGE_URL + '\');' +
            'background-repeat:repeat;' +
            'padding:0;margin:4px 0;overflow:hidden;' +
            'font-family:proxima-nova,sans-serif;"',
        // CONFIRMED live: background:linear-gradient(...) and box-shadow
        // do not survive Roll20's chat rendering the way a flat
        // background-color does - the whole declaration gets dropped,
        // not just downgraded, which is why buttons fell back to Roll20's
        // default pink and the header lost its panel entirely (revealing
        // the container's image behind it). Flat colors only from here.
        header: 'style="background-color:#223142;' +
            'color:#e4eaf0;padding:4px 8px;font-weight:bold;font-size:1.05em;overflow:hidden;"',
        headerLink: 'style="display:block;color:#e4eaf0 !important;' +
            'background-color:transparent !important;border:none !important;' +
            'text-decoration:none;font-weight:bold;cursor:pointer;"',
        // Same as headerLink, but inline (no display:block) - the menu's
        // "Locksmith" title has to share its line with the floated "?"
        // help link, and a block-level box there would push that float
        // out of position.
        headerTitleLink: 'style="color:#e4eaf0 !important;' +
            'background-color:transparent !important;border:none !important;' +
            'text-decoration:none;font-weight:bold;cursor:pointer;"',
        // Lower opacity than before (was 0.82, nearly obscuring the
        // texture entirely) - just enough tint to keep text legible
        // while letting the tiled metal texture actually show through.
        body: 'style="padding:4px 6px;background-color:rgba(140,148,155,0.35);"',
        row: 'style="padding:3px 0;border-bottom:1px solid #6b7278;overflow:hidden;"',
        rowLast: 'style="padding:3px 0;overflow:hidden;"',
        label: 'style="float:left;color:#223142;font-weight:bold;"',
        value: 'style="float:right;color:#1a1a1a;"',
        // Ping links reuse the report's own label/header navy - no new color.
        nameLink: 'style="color:#223142 !important;background-color:transparent !important;' +
            'border:none !important;text-decoration:underline;font-weight:bold;"',
        // Filled "badge" style - a <span>, not a link, so there's no
        // button affordance at all (no href, no clickability); pill
        // shape (much more rounded than a button's 4px corners) and no
        // border reinforce the same thing visually. Deliberately compact
        // (small font, tight padding) and never nowrap - the row already
        // has a name and two buttons sharing space with this, so if
        // something has to give under a narrow chat panel, it should be
        // this text wrapping within its own cell, not the whole row
        // forcing horizontal overflow. line-height is tightened since
        // "Magic only (Knock)" wraps to two lines and default leading
        // looked loose - safe to tighten since all-caps text has no
        // ascenders/descenders to clip.
        statusPickable: 'style="display:inline-block;padding:2px 6px;border-radius:10px;' +
            'font-weight:bold;font-size:0.75em;line-height:1;color:#fff;text-transform:uppercase;' +
            'letter-spacing:0.5px;background-color:#2e7d32;"',
        statusUnpickable: 'style="display:inline-block;padding:2px 6px;border-radius:10px;' +
            'font-weight:bold;font-size:0.75em;line-height:1;color:#fff;text-transform:uppercase;' +
            'letter-spacing:0.5px;background-color:#8b0000;"',
        statusMagic: 'style="display:inline-block;padding:2px 6px;border-radius:10px;' +
            'font-weight:bold;font-size:0.75em;line-height:1;color:#fff;text-transform:uppercase;' +
            'letter-spacing:0.5px;background-color:#4527a0;"',
        statusUnset: 'style="display:inline-block;padding:2px 6px;border-radius:10px;' +
            'font-weight:bold;font-size:0.75em;line-height:1;color:#fff;text-transform:uppercase;' +
            'letter-spacing:0.5px;background-color:#777777;"',
        footer: 'style="clear:both;padding:3px 8px;font-size:0.8em;' +
            'color:#3f4d5c;border-top:1px solid #6b7278;"',
        // Unlock button: the one place a non-neutral color (green, already
        // used for statusPickable) is deliberately kept distinct.
        button: 'style="display:block;margin:4px 0;padding:6px 8px;' +
            'background-color:#2e7d32 !important;' +
            'color:#fff !important;border:1px solid #143d18 !important;text-align:center;border-radius:4px;' +
            'text-decoration:none;font-weight:bold;"',
        // Every other button (Lock/Unlock Selected, Set DC, Report DC,
        // Unpickable, Magically Locked) shares this single neutral style -
        // the header's own navy, not a distinct color per action.
        buttonNeutral: 'style="display:block;margin:4px 0;padding:6px 8px;' +
            'background-color:#223142 !important;' +
            'color:#dfe6ec !important;border:1px solid #17212c !important;text-align:center;border-radius:4px;' +
            'text-decoration:none;font-weight:bold;"',
        // Same colors/treatment as buttonNeutral, but inline for the
        // grouped two-column menu rows (several buttons side by side).
        buttonNeutralInline: 'style="display:inline-block;margin:2px 3px 2px 0;padding:3px 6px;' +
            'background-color:#223142 !important;' +
            'color:#dfe6ec !important;border:1px solid #17212c !important;border-radius:4px;' +
            'text-decoration:none;font-weight:bold;font-size:0.85em;"',
        menuGroupLabel: 'style="font-weight:bold;color:#223142;padding:4px 6px 4px 0;' +
            'vertical-align:middle;white-space:nowrap;"',
        menuGroupCell: 'style="padding:4px 0;vertical-align:middle;"',
        menuTable: 'style="width:100%;border-collapse:collapse;"',
        // Raw CSS text (no style="" wrapper) - _buildDoorStatusTable
        // combines these with an extra property for the status column,
        // and a wrapped constant can't be safely merged with more CSS
        // without producing two style="" attributes on one element.
        lockListCellCss: 'padding:2px 3px 2px 0;border-bottom:1px solid #6b7278;',
        lockListCellLastCss: 'padding:2px 3px 2px 0;',
        menuDivider: 'style="border-top:1px solid #6b7278;margin:6px 0;"',
        // No border/padding/background - just a plain "?" floated in the
        // header bar, unlike every other button in this system.
        headerHelpLink: 'style="float:right;color:#e4eaf0 !important;' +
            'background:transparent !important;border:none !important;' +
            'padding:0;margin:0;text-decoration:none;font-weight:bold;cursor:pointer;"',
        sectionLabel: 'style="font-weight:bold;color:#223142;padding:4px 0 2px 0;"'
    };
    // Core - door/window color/DC encoding logic
        var Core = {
                MIN_DC: 8,
                MAX_DC: 50,
                DC_VALUE_OFFSET: 5, // DC = value + 5
    
                UNSET_VALUE: 0,
                UNPICKABLE_VALUE: 1,
                MAGIC_ONLY_VALUE: 2,
                MIN_DC_VALUE: 3,  // encodes MIN_DC
                MAX_DC_VALUE: 45, // encodes MAX_DC
    
                DOOR_PREFIX: 'FF99',
                WINDOW_SUFFIX: 'FFFF',
    
                // Normalizes a color string to a 6-char uppercase hex string,
                // or null if it isn't a recognizable 6-digit hex color.
                normalizeColor: function(colorStr) {
                    if (!colorStr) return null;
                    var hex = colorStr.replace('#', '').toUpperCase();
                    if (/^[0-9A-F]{6}$/.test(hex)) return hex;
                    return null;
                },
    
                // Is this door/window color one this script manages?
                isInScope: function(type, colorStr) {
                    var hex = this.normalizeColor(colorStr);
                    if (!hex) return false;
                    if (type === 'door') return hex.substring(0, 4) === this.DOOR_PREFIX;
                    if (type === 'window') return hex.substring(2, 6) === this.WINDOW_SUFFIX;
                    return false;
                },
    
                // Pulls the single encoded byte (0-255) out of an in-scope color.
                // Caller must have already checked isInScope.
                getEncodedByte: function(type, colorStr) {
                    var hex = this.normalizeColor(colorStr);
                    var byteHex = (type === 'door') ? hex.substring(4, 6) : hex.substring(0, 2);
                    return parseInt(byteHex, 16);
                },
    
                // Rebuilds the full 6-char color string with a new encoded byte.
                buildColor: function(type, value) {
                    var byteHex = value.toString(16).toUpperCase();
                    if (byteHex.length < 2) byteHex = '0' + byteHex;
                    if (type === 'door') return '#' + this.DOOR_PREFIX + byteHex;
                    return '#' + byteHex + this.WINDOW_SUFFIX;
                },
    
                valueToDC: function(value) {
                    return value + this.DC_VALUE_OFFSET;
                },
    
                // returns null if dc is outside the representable range
                dcToValue: function(dc) {
                    if (dc < this.MIN_DC || dc > this.MAX_DC) return null;
                    return dc - this.DC_VALUE_OFFSET;
                },
    
                // -> { state: 'out_of_scope' } | { state: 'unset' } |
                //    { state: 'unpickable' } | { state: 'magic_only' } |
                //    { state: 'set', dc: N } | { state: 'unrecognized', raw: N }
                getLockStatus: function(type, colorStr) {
                    if (!this.isInScope(type, colorStr)) return { state: 'out_of_scope' };
                    var value = this.getEncodedByte(type, colorStr);
                    if (value === this.UNSET_VALUE) return { state: 'unset' };
                    if (value === this.UNPICKABLE_VALUE) return { state: 'unpickable' };
                    if (value === this.MAGIC_ONLY_VALUE) return { state: 'magic_only' };
                    if (value >= this.MIN_DC_VALUE && value <= this.MAX_DC_VALUE) {
                        return { state: 'set', dc: this.valueToDC(value) };
                    }
                    return { state: 'unrecognized', raw: value };
                }
            };
    // RollParser - pulls a Thieves' Tools roll's total/mode out of chat
    // messages, for either the Beacon or legacy character sheet.
        var RollParser = {
    
                // Letters-only, lowercased - lets us compare "Thieves' Tools",
                // "Thieves’ Tools", "Thieves Tools", etc. as equivalent.
                normalize: function(str) {
                    return (str || '').replace(/[^a-z]/gi, '').toLowerCase();
                },
    
                // Resolves totals that arrive as unresolved arithmetic
                // strings (e.g. "14+2") instead of numbers. Whitelist-only,
                // safer than eval.
                resolveExpression: function(value) {
                    if (typeof value === 'number') return value;
                    if (typeof value !== 'string') return null;
                    var trimmed = value.trim();
                    if (trimmed === '') return null;
                    var asNumber = Number(trimmed);
                    if (!isNaN(asNumber)) return asNumber;
                    if (!/^[\d+\-*/().\s]+$/.test(trimmed)) return null;
                    try {
                        /* eslint-disable no-new-func */
                        var result = Function('"use strict"; return (' + trimmed + ');')();
                        return (typeof result === 'number' && !isNaN(result)) ? result : null;
                    } catch (e) {
                        return null;
                    }
                },
    
                // Walks a structured `rolls` array for the first real die
                // (dice > 0), ignoring flat "0d20+N" stub groups (e.g.
                // Reliable Talent wrappers).
                findFirstDie: function(rollsArray) {
                    if (!Array.isArray(rollsArray)) return null;
                    for (var i = 0; i < rollsArray.length; i++) {
                        var item = rollsArray[i];
                        if (!item) continue;
                        if (item.type === 'R' && item.dice > 0 && item.results && item.results.length > 0) {
                            return item.results[0].v;
                        }
                        if (item.type === 'G' && Array.isArray(item.rolls)) {
                            for (var j = 0; j < item.rolls.length; j++) {
                                var found = this.findFirstDie(item.rolls[j]);
                                if (found !== null) return found;
                            }
                        }
                    }
                    return null;
                },
    
                // --- Beacon (D&D 2024) sheet -----------------------------
                // Extracts the visible roll title, e.g. "Thieves' Tools", from
                // the rendered rolltemplate HTML.
                extractBeaconTitle: function(content) {
                    if (!content) return null;
                    var m = /<div class="header__title">\s*([^<]+?)\s*<\/div>/i.exec(content);
                    return m ? m[1] : null;
                },

                // Extracts the rolling character's name from the HTML meta
                // block, e.g. "Callexis".
                extractBeaconCharname: function(content) {
                    if (!content) return null;
                    var m = /<div class="meta__character-name">\s*([^<]+?)\s*<\/div>/i.exec(content);
                    return m ? m[1] : null;
                },
    
                // Per-source bonus breakdown only exists in Beacon's HTML,
                // not the structured rolls data.
                extractBeaconBonuses: function(content) {
                    var bonuses = [];
                    if (!content) return bonuses;
                    var re = /<div class="bonus">\s*<span class="bonus__label">([^<]*)<\/span>\s*<span class="bonus__value">([^<]*)<\/span>\s*<\/div>/gi;
                    var m;
                    while ((m = re.exec(content))) {
                        bonuses.push({ label: m[1].trim(), value: m[2].trim() });
                    }
                    return bonuses;
                },
    
                // NOTE: rolls.Base.results.total is pre-modifier - the real
                // total comes from the HTML die__total spans. Structured data
                // is still used for natural/crit/fumble.
                extractBeaconRollData: function(msg) {
                    if (!msg || msg.type !== 'advancedroll' || !msg.content) return null;
    
                    var title = this.extractBeaconTitle(msg.content);
                    if (this.normalize(title) !== 'thievestools') return null;
    
                    var modeMatch = /dnd-2024__header--(Normal|Advantage|Disadvantage)/i.exec(msg.content);
                    var mode = modeMatch ? modeMatch[1].toLowerCase() : 'unknown';
    
                    // First die__total span is always the preferred/kept one;
                    // a second (if present) is the dropped advantage/disadvantage die.
                    var dieTotals = [];
                    var dieTotalRe = /<span class="die__total[^>]*>\s*(\d+)\s*<\/span>/gi;
                    var m;
                    while ((m = dieTotalRe.exec(msg.content))) {
                        dieTotals.push(parseInt(m[1], 10));
                    }
    
                    var natural = null, otherNatural = null, isCrit = null, isFumble = null;
                    if (msg.rolls && msg.rolls.Base && msg.rolls.Base.results) {
                        var diceGroup = msg.rolls.Base.results.rolls && msg.rolls.Base.results.rolls[0];
                        if (diceGroup && diceGroup.results && diceGroup.results[0]) {
                            natural = diceGroup.results[0].v;
                            isCrit = diceGroup.results[0].isCrit;
                            isFumble = diceGroup.results[0].isFumble;
                            if (diceGroup.results[1]) otherNatural = diceGroup.results[1].v;
                        }
                    }
    
                    var needsConfirmation = (mode === 'unknown');
    
                    var result = {
                        title: title,
                        charname: this.extractBeaconCharname(msg.content),
                        mode: mode,
                        total: needsConfirmation ? null : (dieTotals.length > 0 ? dieTotals[0] : null),
                        otherTotal: needsConfirmation ? null : (dieTotals.length > 1 ? dieTotals[1] : null),
                        natural: needsConfirmation ? null : natural,
                        otherNatural: needsConfirmation ? null : otherNatural,
                        isCrit: needsConfirmation ? null : isCrit,
                        isFumble: needsConfirmation ? null : isFumble,
                        bonuses: this.extractBeaconBonuses(msg.content),
                        sheet: 'beacon',
                        playerid: msg.playerid,
                        characterId: msg.characterId,
                        needsConfirmation: needsConfirmation
                    };
    
                    if (needsConfirmation) {
                        result.confirmation = {
                            r1: { total: dieTotals.length > 0 ? dieTotals[0] : null, natural: natural },
                            r2: dieTotals.length > 1 ? { total: dieTotals[1], natural: otherNatural } : null,
                            extraRolls: []
                        };
                    }
    
                    return result;
                },
    
                // Pulls the type 'L' label out of an inlineroll's structured
                // rolls array, e.g. "GUIDANCE" or "Mods".
                extractLabel: function(inlineRoll) {
                    if (!inlineRoll || !inlineRoll.results || !Array.isArray(inlineRoll.results.rolls)) return null;
                    var rolls = inlineRoll.results.rolls;
                    for (var i = 0; i < rolls.length; i++) {
                        if (rolls[i] && rolls[i].type === 'L') return rolls[i].text;
                    }
                    return null;
                },
    
                // Reads r1/r2's actual inlinerolls index from the
                // {{key=$[[N]]}} reference in content, not a fixed position -
                // some rolls have no r2 at all.
                extractInlineRollIndex: function(content, key) {
                    if (!content) return null;
                    var re = new RegExp('\\{\\{' + key + '=\\$\\[\\[(\\d+)\\]\\]\\}\\}', 'i');
                    var m = re.exec(content);
                    return m ? parseInt(m[1], 10) : null;
                },
    
                // Legacy lumps all bonuses into one {{mod=...}} value -
                // can't be split by source like Beacon can.
                extractLegacyModValue: function(content) {
                    if (!content) return null;
                    var m = /\{\{mod=([^}]*)\}\}/i.exec(content);
                    if (!m) return null;
                    return this.resolveExpression(m[1].trim());
                },
    
                // Legacy sheet: r1/r2's array index comes from the
                // {{r1=$[[N]]}}/{{r2=$[[N]]}} refs in content, not a fixed
                // position - a roll with no {{r2=...}} has no r2 at all.
                // Mode flags: {{normal=1}} r1 only, {{advantage=1}} higher
                // of r1/r2, {{disadvantage=1}} lower, {{always=1}} both
                // rolled with no data-driven way to know which counts
                // (needsConfirmation, not guessed). Anything not r1/r2 by
                // index is a bonus die, folded into both totals up front.
                extractLegacyRollData: function(msg) {
                    if (!msg || msg.type !== 'general' || msg.rolltemplate !== 'simple' || !msg.content) return null;
                    if (!Array.isArray(msg.inlinerolls) || msg.inlinerolls.length < 1) return null;
    
                    var rnameMatch = /\{\{rname=([^}]*)\}\}/i.exec(msg.content);
                    var rname = rnameMatch ? rnameMatch[1].trim() : null;
                    if (this.normalize(rname) !== 'thievestools') return null;
    
                    var mode = 'unknown';
                    if (/\{\{advantage=1\}\}/i.test(msg.content)) mode = 'advantage';
                    else if (/\{\{disadvantage=1\}\}/i.test(msg.content)) mode = 'disadvantage';
                    else if (/\{\{normal=1\}\}/i.test(msg.content)) mode = 'normal';
                    else if (/\{\{always=1\}\}/i.test(msg.content)) mode = 'always';
    
                    var charnameMatch = /\{\{charname=([^}]*)\}\}/i.exec(msg.content);
                    var charname = charnameMatch ? charnameMatch[1].trim() : null;
    
                    // r1/r2 index comes from content, not array position -
                    // inlinerolls[1] may be a bonus die, not r2.
                    var r1Index = this.extractInlineRollIndex(msg.content, 'r1');
                    var r2Index = this.extractInlineRollIndex(msg.content, 'r2');
                    if (r1Index === null) return null; // r1 is the one required piece
    
                    var r1 = msg.inlinerolls[r1Index];
                    var r2 = (r2Index !== null) ? msg.inlinerolls[r2Index] : null;
                    var r1Total = this.resolveExpression(r1 && r1.results ? r1.results.total : null);
                    var r2Total = r2 ? this.resolveExpression(r2.results ? r2.results.total : null) : null;
                    var r1Natural = this.extractNaturalFromInlineRoll(r1);
                    var r2Natural = r2 ? this.extractNaturalFromInlineRoll(r2) : null;
    
                    // Anything else in inlinerolls - whatever its index, whether
                    // or not any macro key names it - is a bonus/penalty die.
                    var extraRolls = [];
                    var extraTotal = 0;
                    for (var i = 0; i < msg.inlinerolls.length; i++) {
                        if (i === r1Index || i === r2Index) continue;
                        var ir = msg.inlinerolls[i];
                        var irTotal = this.resolveExpression(ir && ir.results ? ir.results.total : null);
                        extraRolls.push({ label: this.extractLabel(ir), total: irTotal });
                        if (irTotal !== null) extraTotal += irTotal;
                    }
    
                    // Bonus dice are unambiguous - fold them in before mode
                    // resolution, so both r1 and r2 already reflect them.
                    if (extraTotal !== 0) {
                        if (r1Total !== null) r1Total += extraTotal;
                        if (r2Total !== null) r2Total += extraTotal;
                    }
    
                    var needsConfirmation = (mode === 'always' || mode === 'unknown');
    
                    var total = null, otherTotal = null, natural = null, otherNatural = null;
    
                    if (!needsConfirmation) {
                        if (r2 === null || r2Total === null) {
                            total = r1Total; natural = r1Natural;
                        } else if (mode === 'advantage') {
                            if (r2Total > r1Total) { total = r2Total; otherTotal = r1Total; natural = r2Natural; otherNatural = r1Natural; }
                            else { total = r1Total; otherTotal = r2Total; natural = r1Natural; otherNatural = r2Natural; }
                        } else if (mode === 'disadvantage') {
                            if (r2Total < r1Total) { total = r2Total; otherTotal = r1Total; natural = r2Natural; otherNatural = r1Natural; }
                            else { total = r1Total; otherTotal = r2Total; natural = r1Natural; otherNatural = r2Natural; }
                        } else {
                            // normal - r2, if present, is an unused stub
                            total = r1Total; natural = r1Natural;
                        }
                    }
    
                    var modValue = this.extractLegacyModValue(msg.content);
                    var bonuses = (modValue !== null)
                        ? [{ label: 'Ability + PB', value: (modValue >= 0 ? '+' : '') + modValue }]
                        : [];
    
                    var result = {
                        title: rname,
                        charname: charname,
                        mode: mode,
                        total: total,
                        otherTotal: otherTotal,
                        natural: natural,
                        otherNatural: otherNatural,
                        isCrit: (natural === 20) || null,
                        isFumble: (natural === 1) || null,
                        bonuses: bonuses,
                        sheet: 'legacy',
                        playerid: msg.playerid,
                        characterId: msg.rolledByCharacterId,
                        needsConfirmation: needsConfirmation
                    };
    
                    if (needsConfirmation) {
                        result.confirmation = {
                            r1: { total: r1Total, natural: r1Natural },
                            r2: r2 ? { total: r2Total, natural: r2Natural } : null,
                            extraRolls: extraRolls
                        };
                    }
    
                    return result;
                },
    
                extractNaturalFromInlineRoll: function(inlineRoll) {
                    if (!inlineRoll || !inlineRoll.results || !Array.isArray(inlineRoll.results.rolls)) return null;
                    return this.findFirstDie(inlineRoll.results.rolls);
                },

                // Knock is a no-roll spell, detected by title only.
                // Beacon: type 'advancedroll', characterId included.
                // Legacy: type 'whisper' (sheet whispers to GM by default),
                // rolltemplate 'spell', raw macros - NO characterId, only
                // {{charname=...}}, resolved downstream by name.
                extractKnockCast: function(msg) {
                    if (!msg || !msg.content) return null;

                    if (msg.type === 'advancedroll') {
                        var title = this.extractBeaconTitle(msg.content);
                        if (this.normalize(title) !== 'knock') return null;
                        return {
                            charname: this.extractBeaconCharname(msg.content),
                            playerid: msg.playerid,
                            characterId: msg.characterId
                        };
                    }

                    if (msg.rolltemplate === 'spell') {
                        var nameMatch = /\{\{name=([^}]*)\}\}/i.exec(msg.content);
                        var spellName = nameMatch ? nameMatch[1].trim() : null;
                        if (this.normalize(spellName) !== 'knock') return null;

                        var charnameMatch = /\{\{charname=([^}]*)\}\}/i.exec(msg.content);
                        return {
                            charname: charnameMatch ? charnameMatch[1].trim() : null,
                            playerid: msg.playerid,
                            characterId: null
                        };
                    }

                    return null;
                },

                // Tries Beacon then legacy; null if neither matches.
                extractRollData: function(msg) {
                    return this.extractBeaconRollData(msg) || this.extractLegacyRollData(msg);
                }
            };
    // PageUtils
    var PageUtils = {
        // Used verbatim for all page lookups.
        getPageForPlayer: function(playerid) {
            var player = getObj('player', playerid);
            if (playerIsGM(playerid)) {
                return player.get('lastpage') || Campaign().get('playerpageid');
            }
            var psp = Campaign().get('playerspecificpages') || {};
            if (psp[playerid]) {
                return psp[playerid];
            }
            return Campaign().get('playerpageid');
        },

        // Real-world distance per grid square, read from the page itself
        // rather than assumed - a page can be set to anything (10ft
        // squares, meters, etc), not just the 5ft D&D default. Falls back
        // to 5 if the page can't be found or has no scale set.
        getFeetPerSquare: function(pageId) {
            var page = getObj('page', pageId);
            var scale = page && page.get('scale_number');
            return (scale && scale > 0) ? scale : 5;
        },

        // The 70px/square pixel geometry this script assumes throughout
        // is a Roll20 platform constant for square grids specifically,
        // not something scale_number affects - but it does NOT hold for
        // hex grids, which have entirely different cell geometry. This
        // only detects the mismatch and lets callers warn; it doesn't
        // attempt real hex-grid support.
        isSquareGrid: function(pageId) {
            var page = getObj('page', pageId);
            var gridType = page && page.get('grid_type');
            return !gridType || gridType === 'square';
        }
    };
        // Geometry
        var Geometry = {
            // ASSUMPTION (unverified for x): door/window x/y use an
            // inverted axis vs a token's left/top - Roll20's docs only
            // confirm this for y (top 100 = y -100). Verify with !lock --coords.
            doorPixelPosition: function(doorOrWindowObj) {
                return {
                    left: doorOrWindowObj.get('x'),
                    top: -doorOrWindowObj.get('y')
                };
            },
    
            tokenPixelPosition: function(tokenObj) {
                return {
                    left: tokenObj.get('left'),
                    top: tokenObj.get('top')
                };
            },
    
            distance: function(pointA, pointB) {
                var dx = pointA.left - pointB.left;
                var dy = pointA.top - pointB.top;
                return Math.sqrt(dx * dx + dy * dy);
            },
    
            maxRangePixels: function() {
                return PIXELS_PER_SQUARE * RANGE_SQUARES;
            }
        };
        // TokenUtils
        var TokenUtils = {
            findTokensForCharacter: function(pageId, characterId) {
                if (!pageId || !characterId) return [];
                return findObjs({ _type: 'graphic', _pageid: pageId, represents: characterId }) || [];
            },

            // For messages with only a charname, no id (legacy Knock).
            // First match wins if names collide.
            findCharacterIdByName: function(charname) {
                if (!charname) return null;
                var matches = findObjs({ _type: 'character', name: charname });
                return (matches && matches.length > 0) ? matches[0].id : null;
            }
        };

        // Keys and keyrings - a custom character attribute ("keyring")
        // storing a comma-separated list of "type:id" tokens (e.g.
        // "door:-Nabc123"), one per key held. Type is stored alongside
        // the id rather than guessed later by trying both object types.
        var KeyringUtils = {
            ATTR_NAME: 'keyring',
            TOKEN_ACTION_NAME: 'Keys.',

            // The trailing period is intentional - see the comment on
            // handleKeyCreateAction for why.
            hasTokenAction: function(characterId) {
                return findObjs({ _type: 'ability', characterid: characterId, name: this.TOKEN_ACTION_NAME }).length > 0;
            },

            getAttr: function(characterId) {
                return findObjs({ _type: 'attribute', _characterid: characterId, name: this.ATTR_NAME })[0] || null;
            },

            // -> [{ type, id }, ...]
            getKeys: function(characterId) {
                var attr = this.getAttr(characterId);
                if (!attr) return [];
                var raw = attr.get('current') || '';
                return raw.split(',')
                    .map(function(s) { return s.trim(); })
                    .filter(function(s) { return s.length > 0; })
                    .map(function(token) {
                        var parts = token.split(':');
                        return { type: parts[0], id: parts[1] };
                    })
                    .filter(function(k) { return k.type && k.id; });
            },

            hasKey: function(characterId, type, id) {
                var keys = this.getKeys(characterId);
                for (var i = 0; i < keys.length; i++) {
                    if (keys[i].type === type && keys[i].id === id) return true;
                }
                return false;
            },

            // returns false if the character already had this key
            addKey: function(characterId, type, id) {
                if (this.hasKey(characterId, type, id)) return false;
                var attr = this.getAttr(characterId);
                var tokens = this.getKeys(characterId).map(function(k) { return k.type + ':' + k.id; });
                tokens.push(type + ':' + id);
                var newValue = tokens.join(',');
                if (attr) {
                    attr.set('current', newValue);
                } else {
                    createObj('attribute', { _characterid: characterId, name: this.ATTR_NAME, current: newValue });
                }
                return true;
            },

            // returns false if the character didn't have this key
            removeKey: function(characterId, type, id) {
                var attr = this.getAttr(characterId);
                if (!attr) return false;
                var keys = this.getKeys(characterId);
                var filtered = keys.filter(function(k) { return !(k.type === type && k.id === id); });
                if (filtered.length === keys.length) return false;
                attr.set('current', filtered.map(function(k) { return k.type + ':' + k.id; }).join(','));
                return true;
            }
        };
        // DoorFinder - locates the nearest Locksmith-managed door/window
        var DoorFinder = {
            // Only considers doors/windows Core.isInScope recognizes -
            // an unmanaged (non-FF99/FFFF) door is invisible to this feature,
            // same as it is to any GM setup command.
            findNearestInScopeLock: function(pageId, tokenPoint) {
                var candidates = []
                    .concat(findObjs({ _type: 'door', _pageid: pageId }) || [])
                    .concat(findObjs({ _type: 'window', _pageid: pageId }) || []);
    
                var maxRange = Geometry.maxRangePixels();
                var best = null;
    
                for (var i = 0; i < candidates.length; i++) {
                    var obj = candidates[i];
                    var type = obj.get('_type');
                    var color = obj.get('color');
                    if (!Core.isInScope(type, color)) continue;
    
                    var doorPoint = Geometry.doorPixelPosition(obj);
                    var dist = Geometry.distance(tokenPoint, doorPoint);
                    if (dist > maxRange) continue;
    
                    if (!best || dist < best.distance) {
                        best = { obj: obj, type: type, color: color, distance: dist };
                    }
                }
    
                return best;
            },

            // For the Knock spell: 60ft range (no melee safety-margin
            // tolerance - that's specific to pick-attempt measurement
            // error, not spell range), and only locked, non-unpickable targets -
            // Knock explicitly can bypass magic locks (per the spell's own
            // text about suppressing Arcane Lock), just not whatever
            // "unpickable" represents in this system.
            KNOCK_RANGE_FEET: 60,

            findNearestKnockableLock: function(pageId, casterPoint) {
                var candidates = []
                    .concat(findObjs({ _type: 'door', _pageid: pageId }) || [])
                    .concat(findObjs({ _type: 'window', _pageid: pageId }) || []);

                var feetPerSquare = PageUtils.getFeetPerSquare(pageId);
                var maxRange = PIXELS_PER_SQUARE * (this.KNOCK_RANGE_FEET / feetPerSquare);
                var best = null;

                for (var i = 0; i < candidates.length; i++) {
                    var obj = candidates[i];
                    var type = obj.get('_type');
                    var color = obj.get('color');
                    if (!Core.isInScope(type, color)) continue;
                    if (!obj.get('isLocked')) continue;

                    var status = Core.getLockStatus(type, color);
                    if (status.state === 'unpickable') continue;

                    var doorPoint = Geometry.doorPixelPosition(obj);
                    var dist = Geometry.distance(casterPoint, doorPoint);
                    if (dist > maxRange) continue;

                    if (!best || dist < best.distance) {
                        best = { obj: obj, type: type, color: color, distance: dist, status: status };
                    }
                }

                return best;
            }
        };
        // "Show/Hide All Lock DCs": GM-layer text label above every
        // door/window (id + status on two lines, one createObj call
        // each). No stored state - existing labels found live via the
        // distinctive FONT_SIZE. Fill/stroke are the same hex properties
        // as paths. OFFSET_X_* tunable per label type, default 0 - text
        // has no true centerpoint, tune in-game.
        var TextLabels = {
            FONT_SIZE: 14.01, // fractional on purpose - fingerprints script-made labels for toggle detection
            FONT_FAMILY: 'Candal',
            FILL_COLOR: '#FFFFFF',
            // Whole label (both lines) uses this instead of FILL_COLOR
            // when a character with a token on this page holds a key
            // for that specific door/window. Both lines turn yellow,
            // not just the status line - the id+status label is one
            // merged text object (see the note above this block on why),
            // and a Roll20 text object can't have mixed colors within
            // itself.
            KEY_PRESENT_COLOR: '#ffff00',
            STROKE_COLOR: '#000000',
            OFFSET_Y: -43, // 30px above the door/window, plus 8px descender clearance, plus 5px adjustment from live testing

            OFFSET_X_DC: 0,
            OFFSET_X_UNSET: 0,
            OFFSET_X_UNPICKABLE: 0,
            OFFSET_X_MAGIC: 0,

            labelTextFor: function(status) {
                if (status.state === 'set') return 'DC' + status.dc;
                if (status.state === 'unpickable') return 'Unpickable';
                if (status.state === 'magic_only') return 'Magic';
                // unset, out_of_scope, and unrecognized all read the same
                // to a GM glancing at the map - none of them are pickable
                // in their current state.
                return 'Unset';
            },

            // The id line (always 4 chars) reads as off-center above a
            // much wider status word below it - these leading spaces are
            // a manual, approximate nudge toward center, not true
            // centering (Candal isn't monospace, so exact math doesn't
            // apply anyway). DC##/Unset are already close enough in
            // width to the id line that they don't need this.
            idPaddingFor: function(status) {
                if (status.state === 'unpickable') return '     ';
                if (status.state === 'magic_only') return ' ';
                return '';
            },

            offsetXFor: function(status) {
                if (status.state === 'set') return this.OFFSET_X_DC;
                if (status.state === 'unpickable') return this.OFFSET_X_UNPICKABLE;
                if (status.state === 'magic_only') return this.OFFSET_X_MAGIC;
                return this.OFFSET_X_UNSET;
            },

            findExisting: function(pageId) {
                return findObjs({ _type: 'text', _pageid: pageId, layer: 'gmlayer', font_size: this.FONT_SIZE }) || [];
            },

            // Every "type:id" key held by any character with a token on
            // this page, computed once per createAll() call rather than
            // re-scanning all tokens for every door - a plain object used
            // as a hash-set, matching this file's existing style rather
            // than ES6 Set. Minimal/snapshot-at-refresh-time by design -
            // this does NOT stay live if a key changes hands or a token
            // moves after labels are shown; it's only as current as the
            // last label refresh, same as everything else labels show.
            _keysPresentOnPage: function(pageId) {
                var present = {};
                var tokens = findObjs({ _type: 'graphic', _pageid: pageId }) || [];
                for (var i = 0; i < tokens.length; i++) {
                    var characterId = tokens[i].get('represents');
                    if (!characterId) continue;
                    var keys = KeyringUtils.getKeys(characterId);
                    for (var k = 0; k < keys.length; k++) {
                        present[keys[k].type + ':' + keys[k].id] = true;
                    }
                }
                return present;
            },

            createAll: function(pageId) {
                var targets = []
                    .concat(findObjs({ _type: 'door', _pageid: pageId }) || [])
                    .concat(findObjs({ _type: 'window', _pageid: pageId }) || []);

                var keysPresent = this._keysPresentOnPage(pageId);

                var created = 0;
                for (var i = 0; i < targets.length; i++) {
                    var obj = targets[i];
                    var type = obj.get('_type');
                    var status = Core.getLockStatus(type, obj.get('color'));
                    // One object, two lines (id, then status) - one
                    // createObj call per door/window instead of two, since
                    // that call is the actual cost driving how slow this
                    // is on a map with many doors/windows.
                    var text = this.idPaddingFor(status) + obj.id.slice(-4) + '\n' + this.labelTextFor(status);
                    var point = Geometry.doorPixelPosition(obj);
                    var fillColor = keysPresent[type + ':' + obj.id] ? this.KEY_PRESENT_COLOR : this.FILL_COLOR;

                    var textObj = createObj('text', {
                        _pageid: pageId,
                        layer: 'gmlayer',
                        left: point.left + this.offsetXFor(status),
                        top: point.top + this.OFFSET_Y,
                        text: text,
                        font_size: this.FONT_SIZE,
                        font_family: this.FONT_FAMILY,
                        color: fillColor,
                        stroke: this.STROKE_COLOR
                    });

                    if (textObj) {
                        created++;
                        // One-time sanity check: if Roll20 rounds the
                        // fractional font_size, toggle detection silently
                        // stops working on the next click - surface that
                        // immediately rather than let it fail quietly.
                        if (created === 1 && textObj.get('font_size') !== this.FONT_SIZE) {
                            Logger.warn('font_size stored as ' + textObj.get('font_size') +
                                ' instead of ' + this.FONT_SIZE + ' - toggle detection may not work reliably.');
                        }
                    }
                }
                return created;
            },

            deleteAll: function(pageId) {
                var existing = this.findExisting(pageId);
                for (var i = 0; i < existing.length; i++) existing[i].remove();
                return existing.length;
            },

            // Regenerates all shown labels after any DC/state change,
            // rather than tracking/updating one specific label.
            refreshIfShown: function(pageId) {
                if (this.findExisting(pageId).length === 0) return;
                this.deleteAll(pageId);
                this.createAll(pageId);
            }
        };
        // Command-arg encoding for the unlock button (spaces would otherwise
        // split a character name across multiple chat command args)
    // Command-arg encoding (spaces would otherwise split a character
    // name across multiple chat command args)
    function encodeForCommand(str) {
        return String(str || '').replace(/\s+/g, '_');
    }
    function decodeFromCommand(str) {
        return String(str || '').replace(/_/g, ' ');
    }
    // Backs the collapse/expand report pattern (except Report DC, always
    // full). Capped, oldest evicted. Only persistent state this script
    // keeps - DC data lives in door/window color, never ages out.
    var ReportCache = {
        _ensureState: function() {
            if (!state.Locksmith) state.Locksmith = { reports: {}, order: [] };
            return state.Locksmith;
        },

        store: function(playerid, headerText, bodyHtml, footerText, isPublic) {
            var s = this._ensureState();
            var id = Math.floor(Math.random() * 1679616).toString(36); // up to 4 base36 chars

            s.reports[id] = {
                playerid: playerid, headerText: headerText, bodyHtml: bodyHtml,
                footerText: footerText || null, isPublic: !!isPublic
            };
            s.order.push(id);

            while (s.order.length > MAX_CACHED_REPORTS) {
                var evictedId = s.order.shift();
                delete s.reports[evictedId];
            }

            return id;
        },

        get: function(id) {
            var s = this._ensureState();
            return s.reports[id] || null;
        }
    };
    // Chat - all whispered/public output for the whole system.
    // No emoji/icons anywhere - headers are plain text.
    var Chat = {
        _displayNameFor: function(playerid) {
            var player = getObj('player', playerid);
            return player ? player.get('_displayname') : 'GM';
        },

        // Renders a list of {label, value} pairs as styled rows, with the
        // last one using CSS.rowLast automatically.
        _renderRows: function(items) {
            var out = '';
            for (var i = 0; i < items.length; i++) {
                var style = (i === items.length - 1) ? CSS.rowLast : CSS.row;
                out += '<div ' + style + '><span ' + CSS.label + '>' + items[i].label + '</span>' +
                    '<span ' + CSS.value + '>' + items[i].value + '</span></div>';
            }
            return out;
        },

        // A single styled header bar with no body and no expand link -
        // used for short, self-contained messages (errors, the "not
        // locked" short-circuit) that have nothing further to show.
        whisperHeaderOnly: function(playerid, headerText) {
            var name = this._displayNameFor(playerid);
            var html = '<div ' + CSS.container + '><div ' + CSS.header + '>' + headerText + '</div></div>';
            sendChat(SCRIPT_NAME, '/w "' + name + '" ' + html);
        },

        whisperError: function(playerid, message) {
            this.whisperHeaderOnly(playerid, message);
        },

        // Same container style as everything else, but no header row -
        // just a single button linking to the help handout.
        whisperHelpLink: function(playerid, handoutId) {
            var name = this._displayNameFor(playerid);
            var link = '<a href="http://journal.roll20.net/handout/' + handoutId + '" ' +
                CSS.buttonNeutral + '>Open Locksmith Help Documentation</a>';
            var html = '<div ' + CSS.container + '><div ' + CSS.body + '>' + link + '</div></div>';
            sendChat(SCRIPT_NAME, '/w "' + name + '" ' + html);
        },

        // Keys/keyrings are deliberately private, but visible to both the
        // sender and the GM - unlike everything else lock-related, which
        // is either fully public or GM-only. "gm" is a literal whisper
        // target Roll20 recognizes regardless of the GM's display name.
        // Skips the duplicate GM copy if the sender already is the GM.
        // headerCommand (optional) makes the header itself clickable,
        // reissuing that command - only passed by handleKeyring's own
        // calls, not the many other keyring-related messages that share
        // this function (Use/Give/Drop confirmations, errors, etc.) -
        // those stay plain text as before.
        deliverKeyMessage: function(playerid, headerText, bodyHtml, footerText, headerCommand) {
            var name = this._displayNameFor(playerid);
            var headerHtml = headerCommand ?
                '<a href="' + headerCommand + '" ' + CSS.headerLink + '>' + headerText + '</a>' :
                headerText;
            var html = '<div ' + CSS.container + '>' +
                '<div ' + CSS.header + '>' + headerHtml + '</div>' +
                (bodyHtml ? '<div ' + CSS.body + '>' + bodyHtml + '</div>' : '') +
                (footerText ? '<div ' + CSS.footer + '>' + footerText + '</div>' : '') +
                '</div>';
            sendChat(SCRIPT_NAME, '/w "' + name + '" ' + html);
            if (!playerIsGM(playerid)) {
                sendChat(SCRIPT_NAME, '/w gm ' + html);
            }
        },

        // The standard report pattern: header only, as a clickable link
        // that posts the cached full body when clicked. alwaysVisibleHtml
        // (optional) renders immediately regardless of collapse state -
        // used for the unlock button, which must never be hidden behind
        // a click.
        whisperCollapsed: function(playerid, headerText, bodyHtml, footerText, alwaysVisibleHtml) {
            var name = this._displayNameFor(playerid);
            var id = ReportCache.store(playerid, headerText, bodyHtml, footerText);
            var headerLink = '<a href="!lock --expand ' + id + '" ' + CSS.headerLink + '>' + headerText + '</a>';
            var html = '<div ' + CSS.container + '><div ' + CSS.header + '>' + headerLink + '</div>' +
                (alwaysVisibleHtml ? '<div ' + CSS.body + '>' + alwaysVisibleHtml + '</div>' : '') +
                '</div>';
            sendChat(SCRIPT_NAME, '/w "' + name + '" ' + html);
        },

        // The full card (header + body + footer), used both for expanding
        // a cached report and for reports that are never collapsed
        // (Report DC). headerCommand (optional) makes the header itself
        // clickable, reissuing that command - only passed by callers
        // that actually want this; omitted, it's plain text as before.
        whisperFull: function(playerid, headerText, bodyHtml, footerText, headerCommand) {
            var name = this._displayNameFor(playerid);
            var headerHtml = headerCommand ?
                '<a href="' + headerCommand + '" ' + CSS.headerLink + '>' + headerText + '</a>' :
                headerText;
            var html = '<div ' + CSS.container + '>' +
                '<div ' + CSS.header + '>' + headerHtml + '</div>' +
                '<div ' + CSS.body + '>' + bodyHtml + '</div>' +
                (footerText ? '<div ' + CSS.footer + '>' + footerText + '</div>' : '') +
                '</div>';
            sendChat(SCRIPT_NAME, '/w "' + name + '" ' + html);
        },

        // ---- Public versions for lock-picking outcomes (GM commands
        // above stay whispered). fromName posts as the rolling character.
        postHeaderOnly: function(fromName, headerText) {
            var html = '<div ' + CSS.container + '><div ' + CSS.header + '>' + headerText + '</div></div>';
            sendChat(fromName || SCRIPT_NAME, html);
        },

        postCollapsed: function(fromName, playerid, headerText, bodyHtml, footerText, alwaysVisibleHtml) {
            var id = ReportCache.store(playerid, headerText, bodyHtml, footerText, true);
            var headerLink = '<a href="!lock --expand ' + id + '" ' + CSS.headerLink + '>' + headerText + '</a>';
            var html = '<div ' + CSS.container + '><div ' + CSS.header + '>' + headerLink + '</div>' +
                (alwaysVisibleHtml ? '<div ' + CSS.body + '>' + alwaysVisibleHtml + '</div>' : '') +
                '</div>';
            sendChat(fromName || SCRIPT_NAME, html);
        },

        postFull: function(fromName, headerText, bodyHtml, footerText) {
            var html = '<div ' + CSS.container + '>' +
                '<div ' + CSS.header + '>' + headerText + '</div>' +
                '<div ' + CSS.body + '>' + bodyHtml + '</div>' +
                (footerText ? '<div ' + CSS.footer + '>' + footerText + '</div>' : '') +
                '</div>';
            sendChat(fromName || SCRIPT_NAME, html);
        },

        // ---- Knock spell outcome. No roll/total exists for this (it's an
        // automatic effect, not a check), so there's no detail worth
        // hiding behind an expand click - the button is just always there.
        postKnockSuccess: function(charname, best) {
            var unlockCmd = '!lock --unlock-target ' + best.type + ' ' + best.obj.id + ' ' +
                encodeForCommand(charname || 'Someone');
            var label = (best.type === 'door') ? 'Unlock the door' : 'Unlock the window';
            var button = '<a href="' + unlockCmd + '" ' + CSS.button + '>' + label + '</a>';
            this.postFull(charname, 'Knock!', button, null);
        },

        // ---- GM setup (!lock --set / --unpickable / --knock) errors only -
        // success is silent, so this only ever renders 'error' entries
        // (DC out of range, or a color write that didn't persist).
        whisperSetupResults: function(playerid, headerText, results) {
            var items = [];
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                var value = '<span ' + CSS.statusUnpickable + '>' + r.message + '</span>';
                items.push({ label: r.label, value: value });
            }
            this.whisperCollapsed(playerid, headerText, this._renderRows(items), null);
        },

        // ---- Report DC - always shown in full immediately, never collapsed ----
        // Shared by Report DC and the menu's door/window list - guarantees
        // the two look identical. One real <table>
        // with a dedicated column per piece (name, +Key, +Loot, status)
        // so buttons line up cleanly across rows regardless of how long
        // each door/window's name is - a floated label/value div can't
        // do that once there's more than one button per row.
        _statusValueHtml: function(r) {
            if (r.state === 'set') return '<span ' + CSS.statusPickable + '>DC ' + r.dc + '</span>';
            if (r.state === 'unset') return '<span ' + CSS.statusUnset + '>No DC set</span>';
            if (r.state === 'unpickable') return '<span ' + CSS.statusUnpickable + '>Unpickable</span>';
            if (r.state === 'magic_only') return '<span ' + CSS.statusMagic + '>Magic only (Knock)</span>';
            if (r.state === 'unrecognized') return '<span ' + CSS.statusUnset + '>Unrecognized</span>';
            return '<span ' + CSS.statusUnset + '>Not managed</span>';
        },

        _buildDoorStatusTable: function(results) {
            var rows = '';
            for (var i = 0; i < results.length; i++) {
                var r = results[i];
                var cellCss = (i === results.length - 1) ? CSS.lockListCellLastCss : CSS.lockListCellCss;
                var cellStyle = 'style="' + cellCss + '"';
                var statusCellStyle = 'style="' + cellCss + 'text-align:right;"';
                var pingLink = '<a href="!lock --ping ' + r.objType + ' ' + r.objId + '" ' + CSS.nameLink + '>' + r.label + '</a>';
                var addCmd = '!lock --key-add ' + r.objType + ' ' + r.objId +
                    ' &#64;{target|Give ' + r.label + ' key to whom?|token_id}';
                var addBtn = '<a href="' + addCmd + '" ' + CSS.buttonNeutralInline + '>+Key</a>';
                var lootCmd = '!lock --key-loot-macro ' + r.objType + ' ' + r.objId;
                var lootBtn = '<a href="' + lootCmd + '" ' + CSS.buttonNeutralInline + '>+Loot</a>';

                rows += '<tr>' +
                    '<td ' + cellStyle + '>' + pingLink + '</td>' +
                    '<td ' + cellStyle + '>' + addBtn + '</td>' +
                    '<td ' + cellStyle + '>' + lootBtn + '</td>' +
                    '<td ' + statusCellStyle + '>' + this._statusValueHtml(r) + '</td>' +
                    '</tr>';
            }
            return '<table ' + CSS.menuTable + '>' + rows + '</table>';
        },

        whisperReportDC: function(playerid, results, pageWide) {
            var headerText = pageWide ? (results.length + ' locks on this page') : (results.length + ' selected');
            var footerText = pageWide ? 'No selection - showing every door/window on this page.' : null;
            this.whisperFull(playerid, headerText, this._buildDoorStatusTable(results), footerText, '!lock --report-dc');
        },

        // ---- Roll-driven outcomes ----
        _rollItems: function(rollData) {
            var modeLabel = rollData.mode.charAt(0).toUpperCase() + rollData.mode.slice(1);
            var natLabel = rollData.natural;
            if (rollData.isCrit) natLabel += ' (crit)';
            if (rollData.isFumble) natLabel += ' (fumble)';

            var items = [];
            if (rollData.charname) items.push({ label: 'Character', value: rollData.charname });
            items.push({ label: 'Total', value: rollData.total });
            items.push({ label: 'Mode', value: modeLabel });
            if (rollData.otherTotal !== null) items.push({ label: 'Other die', value: rollData.otherTotal + ' (dropped)' });
            items.push({ label: 'Natural', value: natLabel });
            for (var i = 0; i < rollData.bonuses.length; i++) {
                items.push({ label: rollData.bonuses[i].label, value: rollData.bonuses[i].value });
            }
            return items;
        },

        whisperConfirmation: function(rollData) {
            var c = rollData.confirmation || { r1: null, r2: null, extraRolls: [] };
            var reasonLabel = (rollData.mode === 'always')
                ? 'Both dice rolled - mode decided verbally'
                : 'Roll mode not recognized';

            var items = [];
            if (rollData.charname) items.push({ label: 'Character', value: rollData.charname });
            if (c.r1) items.push({ label: 'r1', value: c.r1.total + ' (natural ' + c.r1.natural + ')' });
            if (c.r2) items.push({ label: 'r2', value: c.r2.total + ' (natural ' + c.r2.natural + ')' });
            for (var i = 0; i < c.extraRolls.length; i++) {
                var er = c.extraRolls[i];
                items.push({ label: er.label || 'Bonus die', value: er.total + ' (already included above)' });
            }
            for (var j = 0; j < rollData.bonuses.length; j++) {
                items.push({ label: rollData.bonuses[j].label, value: rollData.bonuses[j].value });
            }

            this.postCollapsed(rollData.charname, rollData.playerid, 'Thieves\' Tools Roll Needs Confirmation',
                this._renderRows(items), reasonLabel + ' - confirm the result with the GM.');
        },

        // The door/window isn't locked at all - nothing else is relevant.
        // A single header-only message, nothing to expand.
        whisperNotLocked: function(rollData) {
            this.postHeaderOnly(rollData.charname, 'This Door is not locked');
        },

        whisperNoLock: function(rollData) {
            var items = this._rollItems(rollData);
            items.push({ label: 'Result', value: 'No lock within reach' });
            this.postCollapsed(rollData.charname, rollData.playerid, 'No Lock In Range', this._renderRows(items), null);
        },

        whisperNoToken: function(rollData) {
            var items = this._rollItems(rollData);
            items.push({ label: 'Result', value: 'No token found on this page' });
            this.postCollapsed(rollData.charname, rollData.playerid, 'No Token Found', this._renderRows(items), null);
        },

        whisperUnset: function(rollData) {
            var items = this._rollItems(rollData);
            items.push({ label: 'Result', value: 'No DC set - ask your GM' });
            this.postCollapsed(rollData.charname, rollData.playerid, 'Lock Not Configured', this._renderRows(items), null);
        },

        // Result doesn't need to be repeated for unpickable/magic-only -
        // the roll's outcome was never in question, so no total prefix.
        whisperUnpickable: function(rollData) {
            var items = this._rollItems(rollData);
            items.push({ label: 'Result', value: 'Cannot be picked with mundane tools' });
            this.postCollapsed(rollData.charname, rollData.playerid, 'Unpickable', this._renderRows(items), null);
        },

        whisperMagicOnly: function(rollData) {
            var items = this._rollItems(rollData);
            items.push({ label: 'Result', value: 'Requires magic (e.g. Knock)' });
            this.postCollapsed(rollData.charname, rollData.playerid, 'Magically Sealed', this._renderRows(items), null);
        },

        // DC comparison happened - header is prefixed with the total. The
        // unlock button is passed as alwaysVisibleHtml so it's never
        // hidden behind the header click - only the detail rows collapse.
        whisperSuccess: function(rollData, best, status) {
            var items = this._rollItems(rollData);
            items.push({ label: 'DC', value: status.dc });

            var unlockCmd = '!lock --unlock-target ' + best.type + ' ' + best.obj.id + ' ' +
                encodeForCommand(rollData.charname || 'Someone');
            var unlockLabel = (best.type === 'door') ? 'Unlock the door' : 'Unlock the window';
            var button = '<a href="' + unlockCmd + '" ' + CSS.button + '>' + unlockLabel + '</a>';

            this.postCollapsed(rollData.charname, rollData.playerid, rollData.total + ' - Lock Picked!', this._renderRows(items), null, button);
        },

        // Deliberately does NOT include status.dc anywhere.
        whisperFailure: function(rollData) {
            var items = this._rollItems(rollData);
            items.push({ label: 'Result', value: 'DC not beaten' });
            this.postCollapsed(rollData.charname, rollData.playerid, rollData.total + ' - Lock Holds', this._renderRows(items), null);
        },

        // Public, like every other lock-picking outcome - attributed to
        // the character who picked it when a name is available.
        whisperCoordsDebug: function(playerid, tokenInfo, doorInfo, distancePx, distanceSquares, gridInfo) {
            var items = [
                { label: 'Token left/top', value: tokenInfo.left + ', ' + tokenInfo.top },
                { label: 'Door raw x/y', value: doorInfo.rawX + ', ' + doorInfo.rawY },
                { label: 'Door converted', value: doorInfo.left + ', ' + doorInfo.top },
                { label: 'Distance (px)', value: distancePx.toFixed(1) },
                { label: 'Distance (squares)', value: distanceSquares.toFixed(2) },
                { label: 'Grid type', value: gridInfo.gridType + (gridInfo.isSquare ? '' : ' - UNSUPPORTED, results below are unreliable') },
                { label: 'Feet per square', value: String(gridInfo.feetPerSquare) }
            ];
            this.whisperCollapsed(playerid, 'Coordinate Debug', this._renderRows(items), null);
        },

        // ---- The Locksmith menu (bare !lock) ----
        // One row per door/window, matching Report DC's layout - no more
        // multi-column table, since three buttons per row made that
        // cramped.
        // Computes the same {label, objType, objId, state, dc} shape
        // Report DC uses, then reuses _buildDoorStatusTable - the two
        // are now guaranteed identical, not just similar.
        _buildLockRows: function(doors, windows) {
            var all = doors.concat(windows);
            var results = [];
            for (var i = 0; i < all.length; i++) {
                var lock = all[i];
                var type = lock.get('_type');
                var typeLabel = (type === 'door') ? 'Door' : 'Window';
                var status = Core.getLockStatus(type, lock.get('color'));
                status.label = typeLabel + ' ' + lock.id.slice(-4);
                status.objType = type;
                status.objId = lock.id;
                results.push(status);
            }
            return this._buildDoorStatusTable(results);
        },

        whisperMenu: function(msg) {
            var doors = [], windows = [];
            if (msg.selected) {
                for (var i = 0; i < msg.selected.length; i++) {
                    var sel = msg.selected[i];
                    if (sel._type !== 'door' && sel._type !== 'window') continue;
                    var obj = getObj(sel._type, sel._id);
                    if (!obj) continue;
                    (sel._type === 'door' ? doors : windows).push(obj);
                }
            }

            var lockListSection = '';
            if (doors.length + windows.length > 0) {
                lockListSection = '<div ' + CSS.menuDivider + '></div>' +
                    '<div ' + CSS.sectionLabel + '>Selected Doors</div>' +
                    this._buildLockRows(doors, windows);
            }

            var selectedButtons =
                '<a href="!lock --lock-selected" ' + CSS.buttonNeutralInline + '>Lock</a>' +
                '<a href="!lock --unlock-selected" ' + CSS.buttonNeutralInline + '>Unlock</a>' +
                '<a href="!lock --report-dc" ' + CSS.buttonNeutralInline + '>Report</a>';

            var setButtons =
                '<a href="!lock --set ?{DC (8-50)|15}" ' + CSS.buttonNeutralInline + '>DC</a>' +
                '<a href="!lock --unpickable" ' + CSS.buttonNeutralInline + '>Unpickable</a>' +
                '<a href="!lock --knock" ' + CSS.buttonNeutralInline + '>Magic</a>';

            var menuTable = '<table ' + CSS.menuTable + '>' +
                '<tr><td ' + CSS.menuGroupLabel + '>Selected</td><td ' + CSS.menuGroupCell + '>' + selectedButtons + '</td></tr>' +
                '<tr><td ' + CSS.menuGroupLabel + '>Set</td><td ' + CSS.menuGroupCell + '>' + setButtons + '</td></tr>' +
                '</table>';

            var fullWidthButton = '<a href="!lock --toggle-dc-labels" ' + CSS.buttonNeutral + '>Show/Hide All Lock DCs</a>';

            var body = menuTable + fullWidthButton + lockListSection;

            var name = this._displayNameFor(msg.playerid);
            var headerHtml = '<a href="!lock" ' + CSS.headerTitleLink + '>Locksmith</a>' +
                '<a href="!lock --help" ' + CSS.headerHelpLink + '>?</a>';
            var html = '<div ' + CSS.container + '>' +
                '<div ' + CSS.header + '>' + headerHtml + '</div>' +
                '<div ' + CSS.body + '>' + body + '</div>' +
                '</div>';
            sendChat(SCRIPT_NAME, '/w "' + name + '" ' + html);
        }
    };
    // Commands
    var Commands = {

        // Bare !lock - the Locksmith menu. GM-only.
        handleMenu: function(msg) {
            if (!playerIsGM(msg.playerid)) return;
            Chat.whisperMenu(msg);
        },

        // GM-only: !lock --set / --unpickable / --knock
        handleSetup: function(msg, args) {
            if (!playerIsGM(msg.playerid)) {
                Logger.warn('Non-GM player ' + msg.playerid + ' attempted setup command.');
                return;
            }

            var doSet = false, doUnpickable = false, doKnock = false, setDC = null;

            for (var i = 0; i < args.length; i++) {
                if (args[i] === '--unpickable') {
                    doUnpickable = true;
                } else if (args[i] === '--knock') {
                    doKnock = true;
                } else if (args[i] === '--set') {
                    var n = parseInt(args[i + 1], 10);
                    if (isNaN(n)) {
                        Chat.whisperError(msg.playerid, 'Usage: !lock --set # (e.g. !lock --set 15)');
                        return;
                    }
                    doSet = true;
                    setDC = n;
                    i++;
                }
            }

            var modeCount = (doSet ? 1 : 0) + (doUnpickable ? 1 : 0) + (doKnock ? 1 : 0);

            if (modeCount > 1) {
                Chat.whisperError(msg.playerid, 'Only one of --set, --unpickable, or --knock can be used at a time.');
                return;
            }
            if (modeCount === 0) {
                Chat.whisperError(msg.playerid, 'Usage: !lock --set # | !lock --unpickable | !lock --knock');
                return;
            }
            if (!msg.selected || msg.selected.length === 0) {
                Chat.whisperError(msg.playerid, 'No door or window selected.');
                return;
            }

            var targets = [];
            for (var j = 0; j < msg.selected.length; j++) {
                var sel = msg.selected[j];
                if (sel._type === 'door' || sel._type === 'window') {
                    var obj = getObj(sel._type, sel._id);
                    if (obj) targets.push(obj);
                }
            }
            if (targets.length === 0) {
                Chat.whisperError(msg.playerid, 'Selection contains no doors or windows.');
                return;
            }

            var problems = [];

            for (var k = 0; k < targets.length; k++) {
                var target = targets[k];
                var type = target.get('_type');
                var typeLabel = (type === 'door') ? 'Door' : 'Window';
                var label = typeLabel + ' ' + target.id.slice(-4);

                // No scope check - explicit GM selection is unambiguous
                // intent, color is rebuilt from scratch regardless of before.
                var writeValue = null, rangeErrorMsg = null;

                if (doSet) {
                    writeValue = Core.dcToValue(setDC);
                    if (writeValue === null) {
                        rangeErrorMsg = 'DC ' + setDC + ' out of range (' + Core.MIN_DC + '-' + Core.MAX_DC + ')';
                    }
                } else if (doUnpickable) {
                    writeValue = Core.UNPICKABLE_VALUE;
                } else if (doKnock) {
                    writeValue = Core.MAGIC_ONLY_VALUE;
                }

                if (rangeErrorMsg) {
                    problems.push({ label: label, state: 'error', message: rangeErrorMsg });
                    continue;
                }

                var newColor = Core.buildColor(type, writeValue);
                target.set('color', newColor);
                var afterColor = target.get('color');
                var verifiedStatus = Core.getLockStatus(type, afterColor);

                Logger.info('Set ' + label + ' (' + target.id + ') attempted=[' + newColor +
                    '] readback=[' + afterColor + ']');

                var wroteCorrectly =
                    (doSet && verifiedStatus.state === 'set' && verifiedStatus.dc === setDC) ||
                    (doUnpickable && verifiedStatus.state === 'unpickable') ||
                    (doKnock && verifiedStatus.state === 'magic_only');

                // Success is intentionally silent - the color change (and,
                // if labels are shown, the refreshed label) is the
                // confirmation. Only failures need a GM's attention.
                if (!wroteCorrectly) {
                    problems.push({ label: label, state: 'error', message: 'Write did not persist (readback: ' + afterColor + ')' });
                }
            }

            if (problems.length > 0) {
                Chat.whisperSetupResults(msg.playerid, 'Lock DC Set - Problems', problems);
            }

            // Keep any shown GM-layer labels in sync with what just changed.
            var pageId = PageUtils.getPageForPlayer(msg.playerid);
            if (pageId) TextLabels.refreshIfShown(pageId);
        },

        // GM-only: !lock --lock-selected / --unlock-selected. Works on ANY
        // selected door/window regardless of Locksmith scope, since
        // isLocked is a native Roll20 property, not part of the DC encoding.
        handleLockUnlockSelected: function(msg, isLock) {
            if (!playerIsGM(msg.playerid)) return;
            if (!msg.selected || msg.selected.length === 0) {
                Chat.whisperError(msg.playerid, 'No door or window selected.');
                return;
            }

            var count = 0;
            for (var i = 0; i < msg.selected.length; i++) {
                var sel = msg.selected[i];
                if (sel._type !== 'door' && sel._type !== 'window') continue;
                var obj = getObj(sel._type, sel._id);
                if (!obj) continue;
                obj.set('isLocked', isLock);
                // Locking also closes it - if a door was left open when
                // API-locked, later API-unlocking it causes Roll20 to
                // auto-open it again, which isn't desired.
                if (isLock) obj.set('isOpen', false);
                count++;
            }

            if (count === 0) {
                Chat.whisperError(msg.playerid, 'Selection contains no doors or windows.');
            }
            // Success is silent - the door/window's icon on the map already
            // shows the new locked/unlocked state.
        },

        // GM-only: !lock --report-dc. Uses selection if any doors/windows
        // are selected, otherwise every door/window on the GM's current
        // page. Always shown in full immediately (never collapsed).
        handleReportDC: function(msg) {
            if (!playerIsGM(msg.playerid)) return;

            var targets = [];
            if (msg.selected) {
                for (var i = 0; i < msg.selected.length; i++) {
                    var sel = msg.selected[i];
                    if (sel._type === 'door' || sel._type === 'window') {
                        var obj = getObj(sel._type, sel._id);
                        if (obj) targets.push(obj);
                    }
                }
            }

            var pageWide = false;
            if (targets.length === 0) {
                pageWide = true;
                var pageId = PageUtils.getPageForPlayer(msg.playerid);
                targets = []
                    .concat(findObjs({ _type: 'door', _pageid: pageId }) || [])
                    .concat(findObjs({ _type: 'window', _pageid: pageId }) || []);
            }

            var results = [];
            for (var j = 0; j < targets.length; j++) {
                var target = targets[j];
                var type = target.get('_type');
                var typeLabel = (type === 'door') ? 'Door' : 'Window';
                var color = target.get('color');
                var status = Core.getLockStatus(type, color);
                status.label = typeLabel + ' ' + target.id.slice(-4);
                status.objType = type;
                status.objId = target.id;
                results.push(status);
            }

            Chat.whisperReportDC(msg.playerid, results, pageWide);
        },

        // GM-only: !lock --ping <type> <id>. Focus-pull ping, visible only
        // visibility - sendPing's moveAll/visibleTo behavior for this
        // is unverified against a live game.
        handlePing: function(msg, args) {
            if (!playerIsGM(msg.playerid)) return;
            var type = args[0], id = args[1];
            if (type !== 'door' && type !== 'window') return;
            var obj = getObj(type, id);
            if (!obj) {
                Chat.whisperError(msg.playerid, 'That object no longer exists.');
                return;
            }
            var point = Geometry.doorPixelPosition(obj);
            var pageId = obj.get('_pageid');
            sendPing(point.left, point.top, pageId, msg.playerid, true, msg.playerid);
        },

        // Debug aid for the geometry assumption. GM-only; select exactly
        // one token and one door/window.
        handleCoordsDebug: function(msg) {
            if (!playerIsGM(msg.playerid)) return;
            if (!msg.selected || msg.selected.length !== 2) {
                Chat.whisperError(msg.playerid, 'Select exactly one token and one door/window, then run !lock --coords.');
                return;
            }

            var tokenObj = null, doorObj = null;
            for (var i = 0; i < msg.selected.length; i++) {
                var sel = msg.selected[i];
                var obj = getObj(sel._type, sel._id);
                if (!obj) continue;
                if (sel._type === 'graphic') tokenObj = obj;
                else if (sel._type === 'door' || sel._type === 'window') doorObj = obj;
            }
            if (!tokenObj || !doorObj) {
                Chat.whisperError(msg.playerid, 'Selection must include exactly one token and one door/window.');
                return;
            }

            var tokenPoint = Geometry.tokenPixelPosition(tokenObj);
            var doorPoint = Geometry.doorPixelPosition(doorObj);
            var dist = Geometry.distance(tokenPoint, doorPoint);
            var pageId = doorObj.get('_pageid');
            var page = getObj('page', pageId);

            Chat.whisperCoordsDebug(
                msg.playerid,
                tokenPoint,
                { rawX: doorObj.get('x'), rawY: doorObj.get('y'), left: doorPoint.left, top: doorPoint.top },
                dist,
                dist / PIXELS_PER_SQUARE,
                {
                    gridType: (page && page.get('grid_type')) || 'square',
                    isSquare: PageUtils.isSquareGrid(pageId),
                    feetPerSquare: PageUtils.getFeetPerSquare(pageId)
                }
            );
        },

        // GM-only: !lock --toggle-dc-labels. Current-page scope. No state
        // stored for this at all - detects existing labels live via
        // TextLabels.findExisting, so there's nothing to keep in sync.
        handleToggleLabels: function(msg) {
            if (!playerIsGM(msg.playerid)) return;

            var pageId = PageUtils.getPageForPlayer(msg.playerid);
            if (!pageId) {
                Chat.whisperError(msg.playerid, 'Could not determine your current page.');
                return;
            }

            var existing = TextLabels.findExisting(pageId);
            if (existing.length > 0) {
                TextLabels.deleteAll(pageId);
            } else {
                TextLabels.createAll(pageId);
            }
            // Success is silent - the labels appearing/disappearing on the
            // map is the confirmation.
        },

        // !lock --help. Not GM-gated - the handout has sections for both
        // GMs and players. Find-or-create, same pattern as Chronicle's
        // help handout.
        handleHelp: function(msg) {
            var helpHandout = findObjs({ _type: 'handout', name: HELP_NAME })[0];

            if (!helpHandout) {
                var createProps = { name: HELP_NAME, inplayerjournals: 'all', archived: false };
                if (HELP_AVATAR) createProps.avatar = HELP_AVATAR;
                helpHandout = createObj('handout', createProps);
                helpHandout.set('notes', buildHelpText(helpHandout.id));
                Logger.info('Created help handout');
            } else {
                helpHandout.set('notes', buildHelpText(helpHandout.id));
                if (HELP_AVATAR) helpHandout.set('avatar', HELP_AVATAR);
                Logger.info('Updated help handout');
            }

            Chat.whisperHelpLink(msg.playerid, helpHandout.id);
        },

        // !lock --expand <id>. Not GM-gated - checked against the report's
        // original recipient instead, since many reports go to players.
        handleExpand: function(msg, args) {
            var id = args[0];
            var cached = ReportCache.get(id);
            if (!cached) {
                Chat.whisperError(msg.playerid, 'This report has expired or is no longer available.');
                return;
            }
            if (cached.isPublic) {
                // Visible to everyone already - anyone can expand it.
                Chat.postFull(null, cached.headerText, cached.bodyHtml, cached.footerText);
                return;
            }
            if (cached.playerid !== msg.playerid) {
                return; // private report - not this player's, silently ignore
            }
            Chat.whisperFull(msg.playerid, cached.headerText, cached.bodyHtml, cached.footerText);
        },

        // Only ever sent by the button Chat.whisperSuccess() generates.
        handleUnlockTarget: function(msg, args) {
            var type = args[0];
            var id = args[1];
            var charname = decodeFromCommand(args[2]);

            if (type !== 'door' && type !== 'window') return;

            var obj = getObj(type, id);
            if (!obj) {
                Chat.whisperError(msg.playerid, 'That lock no longer exists.');
                return;
            }

            obj.set('isLocked', false);

            var label = (type === 'door' ? 'The door' : 'The window');
            // Success is silent - the door/window icon changing on the map
            // is the confirmation.

            Logger.info(label + ' (' + id + ') unlocked by ' + charname + ' (player ' + msg.playerid + ')');
        },

        // GM-only: clicked from an "Add" button next to a door/window
        // name. Targets a token via @{target|...}, adds a key for that
        // door to the target's associated character's keyring.
        handleKeyAdd: function(msg, args) {
            if (!playerIsGM(msg.playerid)) return;
            var type = args[0], doorId = args[1], targetTokenId = args[2];

            var doorObj = getObj(type, doorId);
            if (!doorObj) {
                Chat.deliverKeyMessage(msg.playerid, 'That lock no longer exists.');
                return;
            }

            var targetToken = getObj('graphic', targetTokenId);
            if (!targetToken) {
                Chat.deliverKeyMessage(msg.playerid, 'No valid target was selected.');
                return;
            }

            var characterId = targetToken.get('represents');
            if (!characterId) {
                Chat.deliverKeyMessage(msg.playerid, 'That token has no associated character - key was not given.');
                return;
            }

            var character = getObj('character', characterId);
            var charname = character ? character.get('name') : 'that character';
            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);

            var added = KeyringUtils.addKey(characterId, type, doorId);
            if (added) {
                Chat.deliverKeyMessage(msg.playerid, 'Gave ' + typeLabel + ' key to ' + charname + '.');
            } else {
                Chat.deliverKeyMessage(msg.playerid, charname + ' already has a key for ' + typeLabel + '.');
            }
        },

        // Self-service version of Add - not GM-gated. Meant to be
        // triggered from a macro pasted into a treasure horde or similar,
        // using @{selected|token_id} rather than @{target|...} so it
        // grants the key to whoever has their own token selected when
        // they click, not a token the clicker picks afterward.
        handleKeyLoot: function(msg, args) {
            var type = args[0], doorId = args[1], targetTokenId = args[2];

            var doorObj = getObj(type, doorId);
            if (!doorObj) {
                Chat.deliverKeyMessage(msg.playerid, 'That lock no longer exists.');
                return;
            }

            var targetToken = getObj('graphic', targetTokenId);
            if (!targetToken) {
                Chat.deliverKeyMessage(msg.playerid, 'You must have your token selected to loot this.');
                return;
            }

            var characterId = targetToken.get('represents');
            if (!characterId) {
                Chat.deliverKeyMessage(msg.playerid, 'Your token has no associated character.');
                return;
            }

            var character = getObj('character', characterId);
            var charname = character ? character.get('name') : 'that character';
            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);

            var added = KeyringUtils.addKey(characterId, type, doorId);
            if (added) {
                Chat.deliverKeyMessage(msg.playerid, charname + ' found a key for ' + typeLabel + '!');
            } else {
                Chat.deliverKeyMessage(msg.playerid, charname + ' already has a key for ' + typeLabel + '.');
            }
        },

        // GM-only: clicked from a "+Loot" button. Whispers the raw macro
        // text (not a clickable command) for the GM to copy/paste
        // wherever they want - e.g. into a treasure handout's description.
        handleKeyLootMacro: function(msg, args) {
            if (!playerIsGM(msg.playerid)) return;
            var type = args[0], doorId = args[1];

            var doorObj = getObj(type, doorId);
            if (!doorObj) {
                Chat.whisperError(msg.playerid, 'That lock no longer exists.');
                return;
            }

            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);
            // Escaped @ - same bug as Add/Give, missed here originally.
            // Safe for copy-paste: the browser renders/copies the decoded
            // @ character regardless of whether it's inside a clickable
            // link or plain text.
            var macroText = '!lock --key-loot ' + type + ' ' + doorId + ' &#64;{selected|token_id}';
            var body = 'Copy this macro and use it to give a specific key to a player:<br>' +
                '<code>' + macroText + '</code>';

            Chat.whisperFull(msg.playerid, 'Loot Macro - ' + typeLabel, body, null);
        },

        // !lock --keyring. Requires exactly one selected token - Roll20's
        // own selection restrictions (players can only select tokens they
        // control) are what actually enforce "only the controlling player
        // or the GM" here, not any check in this script.
        handleKeyring: function(msg) {
            if (!msg.selected || msg.selected.length !== 1 || msg.selected[0]._type !== 'graphic') {
                Chat.deliverKeyMessage(msg.playerid, 'Select exactly one token, then run !keyring.');
                return;
            }

            var token = getObj('graphic', msg.selected[0]._id);
            if (!token) {
                Chat.deliverKeyMessage(msg.playerid, 'That token no longer exists.');
                return;
            }

            var characterId = token.get('represents');
            if (!characterId) {
                Chat.deliverKeyMessage(msg.playerid, 'That token has no associated character.');
                return;
            }

            var character = getObj('character', characterId);
            var charname = character ? character.get('name') : 'Unknown';

            // Setup convenience, offered regardless of whether the
            // character has any keys yet - a GM might want to hand this
            // out before a player has found their first key.
            var hasTokenAction = KeyringUtils.hasTokenAction(characterId);
            var actionBtn = hasTokenAction ? '' :
                '<a href="!lock --key-create-action ' + characterId + '" ' + CSS.buttonNeutral + '>Create "Keys." Token Action</a>';

            var keys = KeyringUtils.getKeys(characterId);
            if (keys.length === 0) {
                var emptyBody = actionBtn || null;
                Chat.deliverKeyMessage(msg.playerid, charname + "'s Keyring - No keys.", emptyBody, null, '!keyring');
                return;
            }

            var items = [];
            for (var i = 0; i < keys.length; i++) {
                var k = keys[i];
                var typeLabel = (k.type === 'door' ? 'Door' : 'Window') + ' ' + k.id.slice(-4);
                var useCmd = '!lock --key-use ' + k.type + ' ' + k.id + ' ' + characterId;
                var giveCmd = '!lock --key-give ' + k.type + ' ' + k.id + ' ' + characterId +
                    ' &#64;{target|Give this key to whom?|token_id}';
                var dropCmd = '!lock --key-drop-confirm ' + k.type + ' ' + k.id + ' ' + characterId;
                // Escaped @ - see the same note in whisperReportDC.
                var buttons = '<a href="' + useCmd + '" ' + CSS.buttonNeutralInline + '>Use</a> ' +
                    '<a href="' + giveCmd + '" ' + CSS.buttonNeutralInline + '>Give</a> ' +
                    '<a href="' + dropCmd + '" ' + CSS.buttonNeutralInline + '>Drop</a>';
                // Plain text, not pingable - unlike everywhere else, a
                // keyring listing shouldn't let a player locate the door.
                items.push({ label: typeLabel, value: buttons });
            }

            var tryAllBtn = '<a href="!lock --key-try-all ' + characterId + '" ' + CSS.buttonNeutral + '>Try all Keys</a>';
            // Create-action button, when shown, always comes last.
            var body = Chat._renderRows(items) + tryAllBtn + actionBtn;

            Chat.deliverKeyMessage(msg.playerid, charname + "'s Keyring (" + keys.length + (keys.length === 1 ? ' key)' : ' keys)'), body, null, '!keyring');
        },

        // Clicked from a keyring report's "Create \"Keys.\" Token Action"
        // button. Not GM-gated - any player who can see the button
        // (i.e. already passed the selection check in handleKeyring) can
        // create it. The trailing period in the name is intentional -
        // it's how TokenActionMaker/TokenActionBuilder flag an action as
        // protected from their own auto-cleanup, not a typo.
        handleKeyCreateAction: function(msg, args) {
            var characterId = args[0];
            var character = getObj('character', characterId);
            if (!character) {
                Chat.deliverKeyMessage(msg.playerid, 'That character no longer exists.');
                return;
            }

            if (KeyringUtils.hasTokenAction(characterId)) {
                Chat.deliverKeyMessage(msg.playerid, 'That token action already exists.');
                return;
            }

            createObj('ability', {
                characterid: characterId,
                name: KeyringUtils.TOKEN_ACTION_NAME,
                action: '!keyring',
                istokenaction: true
            });

            Chat.deliverKeyMessage(msg.playerid, 'Created the "Keys." token action for ' + character.get('name') + '.');
        },

        // Clicked from a keyring report's "Use" button. Toggles the named
        // door/window's locked state (bypassing DC/unpickable/magic
        // entirely - a key doesn't care about any of that) as long as the
        // key-holder's token is within pick range. Locking via key also
        // closes it, same reasoning as the menu's Lock Selected - an
        // API-locked door left open would auto-reopen when later
        // API-unlocked.
        handleKeyUse: function(msg, args) {
            var type = args[0], doorId = args[1], characterId = args[2];

            var doorObj = getObj(type, doorId);
            if (!doorObj) {
                Chat.deliverKeyMessage(msg.playerid, 'That lock no longer exists.');
                return;
            }

            var pageId = PageUtils.getPageForPlayer(msg.playerid);
            var tokens = TokenUtils.findTokensForCharacter(pageId, characterId);
            if (tokens.length === 0) {
                Chat.deliverKeyMessage(msg.playerid, 'No token found for that character on this page.');
                return;
            }

            var doorPoint = Geometry.doorPixelPosition(doorObj);
            var maxRange = Geometry.maxRangePixels();
            var inRange = false;
            for (var i = 0; i < tokens.length; i++) {
                var dist = Geometry.distance(Geometry.tokenPixelPosition(tokens[i]), doorPoint);
                if (dist <= maxRange) { inRange = true; break; }
            }

            if (!inRange) {
                Chat.deliverKeyMessage(msg.playerid, 'Not close enough to use that key.');
                return;
            }

            var willLock = !doorObj.get('isLocked');
            doorObj.set('isLocked', willLock);
            if (willLock) doorObj.set('isOpen', false);

            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);
            Chat.deliverKeyMessage(msg.playerid, typeLabel + (willLock ? ' locked with a key.' : ' unlocked with a key.'));
        },

        // Clicked from a keyring report's "Try all Keys" button. Toggles
        // the locked state of the nearest door/window the character
        // holds a key for, as long as it's within pick range - same
        // range as a Thieves' Tools pick attempt, same toggle behavior
        // as the individual Use button.
        handleKeyTryAll: function(msg, args) {
            var characterId = args[0];

            var pageId = PageUtils.getPageForPlayer(msg.playerid);
            var tokens = TokenUtils.findTokensForCharacter(pageId, characterId);
            if (tokens.length === 0) {
                Chat.deliverKeyMessage(msg.playerid, 'No token found for that character on this page.');
                return;
            }

            var keys = KeyringUtils.getKeys(characterId);
            if (keys.length === 0) {
                Chat.deliverKeyMessage(msg.playerid, 'No keys to try.');
                return;
            }

            var maxRange = Geometry.maxRangePixels();
            var best = null;

            for (var t = 0; t < tokens.length; t++) {
                var tokenPoint = Geometry.tokenPixelPosition(tokens[t]);
                for (var k = 0; k < keys.length; k++) {
                    var doorObj = getObj(keys[k].type, keys[k].id);
                    if (!doorObj) continue;

                    var dist = Geometry.distance(tokenPoint, Geometry.doorPixelPosition(doorObj));
                    if (dist > maxRange) continue;

                    if (!best || dist < best.distance) {
                        best = { obj: doorObj, type: keys[k].type, distance: dist };
                    }
                }
            }

            if (!best) {
                Chat.deliverKeyMessage(msg.playerid, 'None of your keys fit a door within range.');
                return;
            }

            var willLock = !best.obj.get('isLocked');
            best.obj.set('isLocked', willLock);
            if (willLock) best.obj.set('isOpen', false);
            var typeLabel = (best.type === 'door' ? 'Door' : 'Window') + ' ' + best.obj.id.slice(-4);
            Chat.deliverKeyMessage(msg.playerid, 'Found the right key - ' + typeLabel + (willLock ? ' locked.' : ' unlocked.'));
        },

        // Clicked from a keyring report's "Give" button. Removes the key
        // from the giver, targets a token via @{target|...}, adds it to
        // the target's associated character.
        handleKeyGive: function(msg, args) {
            var type = args[0], doorId = args[1], giverCharacterId = args[2], targetTokenId = args[3];

            var removed = KeyringUtils.removeKey(giverCharacterId, type, doorId);
            if (!removed) {
                Chat.deliverKeyMessage(msg.playerid, 'That key is no longer in your keyring.');
                return;
            }

            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);
            var targetToken = getObj('graphic', targetTokenId);

            if (!targetToken) {
                KeyringUtils.addKey(giverCharacterId, type, doorId); // restore - give failed
                Chat.deliverKeyMessage(msg.playerid, 'No valid target was selected - key was not given.');
                return;
            }

            var recipientCharacterId = targetToken.get('represents');
            if (!recipientCharacterId) {
                KeyringUtils.addKey(giverCharacterId, type, doorId); // restore - give failed
                Chat.deliverKeyMessage(msg.playerid, 'That token has no associated character - key was not given.');
                return;
            }

            KeyringUtils.addKey(recipientCharacterId, type, doorId);
            var recipient = getObj('character', recipientCharacterId);
            var recipientName = recipient ? recipient.get('name') : 'that character';
            var giver = getObj('character', giverCharacterId);
            var giverName = giver ? giver.get('name') : 'Someone';
            Chat.deliverKeyMessage(msg.playerid, giverName + ' gave ' + typeLabel + ' key to ' + recipientName + '.');
        },

        // Clicked from a keyring report's "Drop" button - a safety net,
        // since dropping a key is instant and irreversible otherwise.
        // Shows a confirmation card instead of deleting immediately; the
        // actual deletion is handleKeyDrop below, triggered only by
        // clicking the confirmation button.
        handleKeyDropConfirm: function(msg, args) {
            var type = args[0], doorId = args[1], characterId = args[2];

            if (!KeyringUtils.hasKey(characterId, type, doorId)) {
                Chat.deliverKeyMessage(msg.playerid, 'That key is no longer in your keyring.');
                return;
            }

            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);
            var confirmCmd = '!lock --key-drop ' + type + ' ' + doorId + ' ' + characterId;
            var confirmBtn = '<a href="' + confirmCmd + '" ' + CSS.buttonNeutralInline + '>Yes, Drop It</a>';

            Chat.deliverKeyMessage(msg.playerid, 'Drop ' + typeLabel + ' key?',
                'This cannot be undone.<br>' + confirmBtn, null);
        },

        // The actual deletion - only ever reached via the confirmation
        // button above, never directly from the keyring report itself.
        handleKeyDrop: function(msg, args) {
            var type = args[0], doorId = args[1], characterId = args[2];

            var removed = KeyringUtils.removeKey(characterId, type, doorId);
            var typeLabel = (type === 'door' ? 'Door' : 'Window') + ' ' + doorId.slice(-4);

            if (!removed) {
                Chat.deliverKeyMessage(msg.playerid, 'That key is no longer in your keyring.');
                return;
            }

            Chat.deliverKeyMessage(msg.playerid, 'Dropped ' + typeLabel + ' key.');
        },

        // Passive. Detects a Knock cast, finds the nearest locked,
        // non-unpickable door within 60ft. Returns true if handled (so
        // the caller skips handleRoll).
        handleKnockCast: function(msg) {
            var castData = RollParser.extractKnockCast(msg);
            if (!castData) return false;

            var pageId = PageUtils.getPageForPlayer(castData.playerid);
            if (!pageId) {
                Chat.postHeaderOnly(castData.charname, 'Could not determine the caster\'s current page.');
                return true;
            }

            var characterId = castData.characterId || TokenUtils.findCharacterIdByName(castData.charname);
            if (!characterId) {
                Chat.postHeaderOnly(castData.charname, 'Could not identify the casting character.');
                return true;
            }

            var tokens = TokenUtils.findTokensForCharacter(pageId, characterId);
            if (tokens.length === 0) {
                Chat.postHeaderOnly(castData.charname, 'No token found for the caster on this page.');
                return true;
            }

            var best = null;
            for (var i = 0; i < tokens.length; i++) {
                var casterPoint = Geometry.tokenPixelPosition(tokens[i]);
                var candidate = DoorFinder.findNearestKnockableLock(pageId, casterPoint);
                if (candidate && (!best || candidate.distance < best.distance)) best = candidate;
            }

            if (!best) {
                Chat.postHeaderOnly(castData.charname, 'Knock finds no valid lock within range.');
                return true;
            }

            // /fx via sendChat() fails ("Unrecognized command") - it's
            // client-only, unlike /w or /em. spawnFx() has no id variant,
            // so this depends on the geometry assumption - verify with
            // !lock --coords.
            var doorPoint = Geometry.doorPixelPosition(best.obj);
            spawnFx(doorPoint.left, doorPoint.top, 'glow-magic', pageId);

            Chat.postKnockSuccess(castData.charname, best);
            return true;
        },

        // Passive: fires on every non-api chat message. Finds and compares
        // a Thieves' Tools roll against the nearest managed lock in range.
        handleRoll: function(msg) {
            var rollData = RollParser.extractRollData(msg);
            if (!rollData) return;

            if (rollData.needsConfirmation) {
                Chat.whisperConfirmation(rollData);
                return;
            }

            var pageId = PageUtils.getPageForPlayer(rollData.playerid);
            if (!pageId) {
                Chat.whisperError(rollData.playerid, 'Could not determine your current page.');
                return;
            }

            var tokens = TokenUtils.findTokensForCharacter(pageId, rollData.characterId);
            if (tokens.length === 0) {
                Chat.whisperNoToken(rollData);
                return;
            }

            var best = null;
            for (var i = 0; i < tokens.length; i++) {
                var tokenPoint = Geometry.tokenPixelPosition(tokens[i]);
                var candidate = DoorFinder.findNearestInScopeLock(pageId, tokenPoint);
                if (candidate && (!best || candidate.distance < best.distance)) best = candidate;
            }

            if (!best) {
                Chat.whisperNoLock(rollData);
                return;
            }

            // Public, non-pull ping marking the tested door (unlike the
            // GM-only focus-pull ping elsewhere). visibleTo omitted on
            // purpose - passing literal 'all' made the ping invisible to
            // everyone; omitting it is the documented way to show all.
            var pingPoint = Geometry.doorPixelPosition(best.obj);
            sendPing(pingPoint.left, pingPoint.top, pageId, rollData.playerid, false);

            // Not-locked short-circuit: applies only here (a player's pick
            // attempt), never to any GM-facing command. Takes priority over
            // every other check - an unlocked door's DC/unpickable/magic
            // state is irrelevant.
            if (!best.obj.get('isLocked')) {
                Chat.whisperNotLocked(rollData);
                return;
            }

            var status = Core.getLockStatus(best.type, best.color);

            if (status.state === 'unset') { Chat.whisperUnset(rollData); return; }
            if (status.state === 'unpickable') { Chat.whisperUnpickable(rollData); return; }
            if (status.state === 'magic_only') { Chat.whisperMagicOnly(rollData); return; }
            if (status.state === 'unrecognized') { Chat.whisperError(rollData.playerid, 'This lock is in an unrecognized state.'); return; }

            if (rollData.total >= status.dc) {
                Chat.whisperSuccess(rollData, best, status);
            } else {
                Chat.whisperFailure(rollData);
            }
        },

        handleInput: function(msg) {
            if (msg.type === 'api') {
                var trimmed = msg.content.trim();
                var args = trimmed.split(/\s+/);
                var cmd = args.shift();

                // Alias: !keyring behaves exactly like !lock --keyring -
                // shorter to type for players who use it often.
                if (cmd === '!keyring') {
                    this.handleKeyring(msg);
                    return;
                }

                if (cmd !== '!lock') return;

                if (args.length === 0) { this.handleMenu(msg); return; }

                var flag = args.shift();
                if (flag === '--set' || flag === '--unpickable' || flag === '--knock') {
                    this.handleSetup(msg, [flag].concat(args));
                } else if (flag === '--lock-selected') {
                    this.handleLockUnlockSelected(msg, true);
                } else if (flag === '--unlock-selected') {
                    this.handleLockUnlockSelected(msg, false);
                } else if (flag === '--report-dc') {
                    this.handleReportDC(msg);
                } else if (flag === '--ping') {
                    this.handlePing(msg, args);
                } else if (flag === '--coords') {
                    this.handleCoordsDebug(msg);
                } else if (flag === '--toggle-dc-labels') {
                    this.handleToggleLabels(msg);
                } else if (flag === '--help') {
                    this.handleHelp(msg);
                } else if (flag === '--expand') {
                    this.handleExpand(msg, args);
                } else if (flag === '--unlock-target') {
                    this.handleUnlockTarget(msg, args);
                } else if (flag === '--key-add') {
                    this.handleKeyAdd(msg, args);
                } else if (flag === '--key-loot') {
                    this.handleKeyLoot(msg, args);
                } else if (flag === '--key-loot-macro') {
                    this.handleKeyLootMacro(msg, args);
                } else if (flag === '--keyring') {
                    this.handleKeyring(msg);
                } else if (flag === '--key-create-action') {
                    this.handleKeyCreateAction(msg, args);
                } else if (flag === '--key-use') {
                    this.handleKeyUse(msg, args);
                } else if (flag === '--key-try-all') {
                    this.handleKeyTryAll(msg, args);
                } else if (flag === '--key-give') {
                    this.handleKeyGive(msg, args);
                } else if (flag === '--key-drop-confirm') {
                    this.handleKeyDropConfirm(msg, args);
                } else if (flag === '--key-drop') {
                    this.handleKeyDrop(msg, args);
                }
                return;
            }
            if (this.handleKnockCast(msg)) return;
            this.handleRoll(msg);
        }
    };

    return {
        VERSION: VERSION,
        Core: Core,
        RollParser: RollParser,
        Geometry: Geometry,
        DoorFinder: DoorFinder,
        TextLabels: TextLabels,
        TokenUtils: TokenUtils,
        KeyringUtils: KeyringUtils,
        PageUtils: PageUtils,
        ReportCache: ReportCache,
        Commands: Commands,
        dumpState: function() {
            log('[' + SCRIPT_NAME + '] dumpState: v' + VERSION + '. DC data lives in door/window color (never ' +
                'ages out). state.Locksmith holds only the report cache (' +
                (state.Locksmith ? state.Locksmith.order.length : 0) + '/' + MAX_CACHED_REPORTS + ' entries).');
        }
    };

})();

on('ready', function() {
    'use strict';
    on('chat:message', function(msg) {
        Locksmith.Commands.handleInput(msg);
    });

    // One-time check, not a live monitor - a page added/changed to a
    // non-square grid type later won't be caught until the next script
    // reload. Range math throughout this script assumes a square grid;
    // hex pages are detected but not actually supported.
    var nonSquarePages = (findObjs({ _type: 'page' }) || []).filter(function(p) {
        return !Locksmith.PageUtils.isSquareGrid(p.id);
    });
    if (nonSquarePages.length > 0) {
        log('[Locksmith] WARNING: ' + nonSquarePages.length + ' page(s) are not square-grid ' +
            '(' + nonSquarePages.map(function(p) { return p.get('name') + ': ' + p.get('grid_type'); }).join(', ') + '). ' +
            'Range calculations (pick attempts, Knock, --coords) assume a square grid and will be unreliable there.');
    }

    log('[Locksmith] Locksmith v' + Locksmith.VERSION + ' loaded.');
});
