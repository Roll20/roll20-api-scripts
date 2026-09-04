/* HandoutImageDisplay v1.1.0 — Roll20 Mod script
 * Reuses one player-safe handout to display another handout's main image.
 * Commands: !showimage|Handout Name, !showimage --share,
 *           !showimage --hide, !showimage --help
 */
var HandoutImageDisplay = HandoutImageDisplay || (function () {
    'use strict';

    var SCRIPT = 'HandoutImageDisplay';
    var VERSION = '1.1.0';
    var DISPLAY_NAME = 'Image Display';
    var FALLBACK_NAME = 'Image Display (HandoutImageDisplay)';
    var MARKER = '[HandoutImageDisplay]';
    var MACRO_NAME = 'Handout Image Display';
    var MACRO_FALLBACK_NAME = 'Handout Image Display (API)';
    var MACRO_ACTION = '?{Image Display|Show Image,!showimage&#124;?{Handout Name&#125;|Hide Image,!showimage --hide}';

    function config() {
        state.HandoutImageDisplay = state.HandoutImageDisplay || {
            schemaVersion: 1,
            displayHandoutId: '',
            macroIds: {}
        };
        state.HandoutImageDisplay.macroIds = state.HandoutImageDisplay.macroIds || {};
        return state.HandoutImageDisplay;
    }

    function esc(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function decodeEntities(value) {
        return String(value || '').replace(/&amp;/gi, '&')
            .replace(/&quot;/gi, '"').replace(/&#39;/gi, "'")
            .replace(/&lt;/gi, '<').replace(/&gt;/gi, '>');
    }

    function decodeEditor(value) {
        try { return decodeURIComponent(String(value || '')); }
        catch (error) { return String(value || ''); }
    }

    function whisper(who, html) {
        sendChat(SCRIPT,
            '/w "' + String(who || 'gm').replace(/"/g, '') + '" ' + html,
            null, { noarchive: true });
    }

    function panel(title, body) {
        return '<div style="border:1px solid #555;background:#fff;padding:8px;border-radius:4px;">' +
            '<div style="font-weight:bold;margin-bottom:6px;">' + esc(title) + '</div>' +
            body + '</div>';
    }

    function journalUrl(handout) {
        return 'https://journal.roll20.net/handout/' + handout.id;
    }

    function resolveHandout(name) {
        var wanted = String(name || '').trim().toLowerCase();
        var matches;
        if (!wanted) { return { error: 'Enter a handout name.' }; }
        matches = findObjs({ _type: 'handout' }).filter(function (handout) {
            return String(handout.get('name') || '').trim().toLowerCase() === wanted;
        });
        if (matches.length === 1) { return { handout: matches[0] }; }
        return { error: matches.length ?
            'More than one handout has that name. Rename one and try again.' :
            'No handout with that name was found.' };
    }

    function displayHandout(createIfMissing) {
        var settings = config();
        var display = settings.displayHandoutId && getObj('handout', settings.displayHandoutId);
        var named;
        if (display) { return display; }

        named = findObjs({ _type: 'handout', name: DISPLAY_NAME });
        if (!createIfMissing) { return null; }

        display = createObj('handout', {
            name: named.length ? FALLBACK_NAME : DISPLAY_NAME,
            inplayerjournals: '',
            archived: false
        });
        settings.displayHandoutId = display.id;
        return display;
    }

    function adopt(who) {
        var matches = findObjs({ _type: 'handout', name: DISPLAY_NAME });
        if (matches.length !== 1) {
            whisper(who, panel('Cannot adopt Image Display', '<div>' +
                (matches.length ? 'More than one handout has that exact name.' :
                    'No handout named <b>Image Display</b> was found.') + '</div>'));
            return;
        }
        config().displayHandoutId = matches[0].id;
        whisper(who, panel('Image Display adopted',
            '<div>The existing handout will now be reused by this script.</div>'));
    }

    function setupMacro(playerId, who) {
        var settings = config();
        var macro = settings.macroIds[playerId] && getObj('macro', settings.macroIds[playerId]);
        var named;
        var macroName = MACRO_NAME;
        var created = false;

        if (!macro) {
            named = findObjs({ _type: 'macro', _playerid: playerId, name: MACRO_NAME });
            macro = named.filter(function (candidate) {
                return String(candidate.get('action') || '').indexOf('!showimage') !== -1;
            })[0];
            if (!macro) {
                if (named.length) { macroName = MACRO_FALLBACK_NAME; }
                macro = createObj('macro', {
                    _playerid: playerId,
                    name: macroName,
                    action: MACRO_ACTION,
                    visibleto: '',
                    istokenaction: false
                });
                created = true;
            }
            settings.macroIds[playerId] = macro.id;
        }

        if (macro.get('action') !== MACRO_ACTION || macro.get('istokenaction')) {
            macro.set({ action: MACRO_ACTION, istokenaction: false });
        }
        whisper(who, panel(created ? 'Display macro created' : 'Display macro updated',
            '<div><b>' + esc(macro.get('name')) + '</b> is ready in Collections.</div>' +
            '<div style="margin-top:5px;">Tick <b>In Bar</b> in Roll20 if you want it on your Quick Bar.</div>'));
    }

    function imageFromNotes(notes) {
        var match = decodeEditor(notes).match(/<img\b[^>]*\bsrc=(['"])([^'"]+)\1/i);
        return match ? decodeEntities(match[2]) : '';
    }

    function show(source, imageUrl, who) {
        var display;
        if (!imageUrl) {
            whisper(who, panel('No image found', '<div><b>' + esc(source.get('name')) +
                '</b> has no main image or image in its notes.</div>'));
            return;
        }
        display = displayHandout(true);
        if (source.id === display.id) {
            whisper(who, panel('Cannot display itself',
                '<div>Choose a different source handout.</div>'));
            return;
        }
        display.set({
            avatar: imageUrl,
            notes: '',
            gmnotes: MARKER + '\nCurrently displaying: ' + source.get('name'),
            inplayerjournals: 'all',
            archived: false
        });
        whisper(who, panel('Image prepared: ' + source.get('name'),
            '<div style="margin-bottom:7px;">The reusable handout contains only this image.</div>' +
            '<a style="background:#356aa0;color:#fff;padding:5px 8px;text-decoration:none;border-radius:3px;margin-right:5px;" href="' +
            journalUrl(display) + '">Open Image Display</a>' +
            '<a style="background:#4b8b3b;color:#fff;padding:5px 8px;text-decoration:none;border-radius:3px;" href="!showimage --share">Send Link to Players</a>'));
    }

    function prepare(name, who) {
        var result = resolveHandout(name);
        var source;
        var avatar;
        if (result.error) {
            whisper(who, panel('Handout not resolved', '<div>' + esc(result.error) + '</div>'));
            return;
        }
        source = result.handout;
        avatar = decodeEntities(String(source.get('avatar') || '').trim());
        if (avatar) { show(source, avatar, who); return; }
        source.get('notes', function (notes) {
            show(source, imageFromNotes(notes), who);
        });
    }

    function share(who) {
        var display = displayHandout(false);
        if (!display || !display.get('avatar')) {
            whisper(who, panel('Nothing prepared',
                '<div>Use <code>!showimage|Handout Name</code> first.</div>'));
            return;
        }
        if (display.get('inplayerjournals') !== 'all') {
            display.set('inplayerjournals', 'all');
        }
        sendChat(SCRIPT, '<div style="text-align:center;"><a style="background:#356aa0;color:#fff;padding:7px 12px;text-decoration:none;border-radius:4px;" href="' +
            journalUrl(display) + '">View Image</a></div>');
    }

    function hide(who) {
        var display = displayHandout(false);
        if (display && display.get('inplayerjournals')) {
            display.set('inplayerjournals', '');
        }
        whisper(who, panel('Image Display hidden',
            '<div>It has been removed from player journals.</div>'));
    }

    function help(who) {
        whisper(who, panel(SCRIPT + ' ' + VERSION,
            '<div><code>!showimage|Handout Name</code> — prepare the image.</div>' +
            '<div><code>!showimage --share</code> — post a player link.</div>' +
            '<div><code>!showimage --hide</code> — hide the display handout.</div>' +
            '<div><code>!showimage --adopt</code> — adopt a v1.0 Image Display handout.</div>' +
            '<div><code>!showimage --setup</code> — create or repair your Collections macro.</div>'));
    }

    function input(msg) {
        var command;
        if (msg.type !== 'api' || !/^!showimage(?:\s|\||$)/i.test(msg.content)) { return; }
        if (!playerIsGM(msg.playerid)) {
            whisper(msg.who, panel(SCRIPT, '<div>GM access is required.</div>'));
            return;
        }
        command = msg.content.replace(/^!showimage\s*/i, '').trim();
        if (/^--share$/i.test(command)) { share(msg.who); }
        else if (/^--hide$/i.test(command)) { hide(msg.who); }
        else if (/^--adopt$/i.test(command)) { adopt(msg.who); }
        else if (/^--setup$/i.test(command)) { setupMacro(msg.playerid, msg.who); }
        else if (/^--help$/i.test(command) || !command) { help(msg.who); }
        else if (command.charAt(0) === '|') { prepare(command.slice(1).trim(), msg.who); }
        else { whisper(msg.who, panel('Invalid command',
            '<div>Use <code>!showimage --help</code>.</div>')); }
    }

    function ready() {
        config();
        on('chat:message', input);
        log(SCRIPT + ' v' + VERSION + ' ready.');
    }
    return { ready: ready };
}());
on('ready', HandoutImageDisplay.ready);
