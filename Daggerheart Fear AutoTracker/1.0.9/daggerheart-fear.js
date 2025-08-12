///<reference path="./roll20.d.js" />

/**
 * Daggerheart Fear AutoTracker
 * Orbotik's Roll20 Scripts & Macros
 * https://orbotik.com
 * https://github.com/orbotik
 * This script is © Christopher Eaton (aka @orbotik) and is licensed under CC BY-SA 4.0. 
 * To view a copy of this license, visit https://creativecommons.org/licenses/by-sa/4.0/
 * 
 * ## API Commands:
 * ### Any Player:
 * !fear                 Shows the current fear counter value.
 * !fear [on/off]        Turns fear notices (from duality rolls) on or off for the commanding player.
 * ### GM Only:
 * !fear spend [number]           Decreases the fear counter by 1 or a specific number (to a minimum of 0).
 * !fear gain [number]            Increases the fear counter by 1 or a specific number.
 * !fear set [number]             Sets the fear counter to a specific value.
 * !fear text {id}                Registers a text object to be updated with fear amount as it changes. The {id} is
 *                                optional, and if omitted will set the selected text object. To stop the updating on
 *                                a specific object, run the command again.
 * !fear listen [on/off]          Turn the listener for Demiplane duality rolls on or off. This is "on" by default.
 * !fear text prefix [text]       Specify (quoted) text to appear before the fear counter in text objects.
 * !fear text suffix [text]       Specify (quoted) text to appear after the fear counter in text objects.
 * !fear text [number/tally/circled/bar/dots/skulls/sparkles/exes/candles/ravens]
 *                                Switches how the fear count is displayed in the text objects.
 * !fear text update              Force the registered text objects to update with the current settings and fear value.
 *                                This also lists the IDs of any registered text objects.
 * !fear text monospace {id}      Sets the currently selected or specified (by ID) text object to use a fixed-width
 *                                predictable font.
 * !fear text spacefill [on/off]  Ensures the a uniform text length in text objects even when the fear value is low by
 *                                filling unused character spots with a space. Paired with the monospace command this
 *                                can help prevent the text objects from "jumping around" horizontally.
 * !fear announce [on/off]        Globally sets announcements to *all* players on or off when the fear amount changes.
 * !fear whispers [on/off]        Globally sets whispers to players on or off when the fear amount changes.
 * !fear reset                    Resets the fear counter to 0.
 * !fear reset objects            Clears all fear-tracking object registrations.
 * !fear reset known              Clears the known player list (players will re-receive the welcome message).
 */
class DaggerheartFearScript {

    static VERSION = '1.0.9';

    static BOT_NAME = 'The Game';

    static MAXIMUM_FEAR = 12; //per daggerheart standard rules (pg.154 §Fear, Gaining Fear).

    static ADDITIONAL_TEXT_MODES = {
        bar: '█',
        dots: '•',
        skulls: '💀',
        sparkles: '✨',
        exes: '✗',
        candles: '🕯️',
        stars: '✵',
        ravens: '🐦‍⬛'
    };

    constructor() {
        //init state
        if (!state.fear || (typeof state.fear !== 'object')) {
            state.fear = {
                version: '1.0.0',
                counter: 0,
                known: [],
                off: []
            };
        }
        //upgrade current version to latest
        let cvb = this.versionBits(state.fear.version);
        if (cvb.major <= 1 && cvb.minor <= 0 && cvb.patch < 4) {
            state.fear = Object.assign({
                whispers: false,
                announce: true,
                textMode: 'skulls',
                textPrefix: '',
                textSuffix: '',
                textSpaceFill: true,
                objects: {
                    text: []
                }
            }, state.fear);
        }
        if (cvb.major <= 1 && cvb.minor <= 0 && cvb.patch < 7) {
            delete state.fear.listener;
            state.fear.listen = true;
        }
        state.fear.version = DaggerheartFearScript.VERSION;
        //upgrade checks & initialization output
        if (state.fear.counter > DaggerheartFearScript.MAXIMUM_FEAR) {
            state.fear.counter = DaggerheartFearScript.MAXIMUM_FEAR;
        }
        log(`DaggerheartFearScript startup state is: ${JSON.stringify(state.fear, null, 4)}`);
        //events
        on('chat:message', this.chatHandler.bind(this));
    }

    /**
     * Parses a semantic version string into it's major, minor, and patch components.
     * @param {String} semver 
     * @returns {{major: Number, minor: Number, patch: Number}} Returns the parsed version components.
     */
    versionBits(semver) {
        if (!semver || typeof semver !== 'string') {
            throw new Error('A valid semver string is required.');
        }
        if (!semver.match(/^\d+\.\d+\.\d+$/)) {
            throw new Error('Invalid semver format, expected "major.minor.patch" format.');
        }
        let bits = semver.split('.').map(v => parseInt(v, 10));
        return { major: bits[0], minor: bits[1], patch: bits[2] };
    }

    /**
     * Returns the fear message that explains the current fear level.
     * @param {String} variant 
     * @returns {String}
     */
    fearMessage(variant) {
        let message = '';
        let variantVerb = '';
        if (variant && variant !== '+' && variant !== '-') {
            throw new Error('Invalid fear message variant specified.');
        } else if (variant === '+') {
            message = '<br><strong>💀 Fear has increased!</strong>';
            variantVerb = 'now ';
        } else if (variant === '-') {
            message = '<br><strong>🌸 Fear has <em>been reduced</em>!</strong>';
            variantVerb = 'still ';
        }
        if (!state.fear.counter || state.fear.counter <= 0) {
            message += `<br><strong>Have no fear.</strong> There is none to be had (<mark>0</mark>).`;
        } else if (state.fear.counter === 1) {
            message += `<br>There is ${variantVerb}<em>a single</em> fear (<mark>1</mark>).`;
        } else if (state.fear.counter < 4) {
            message += `<br>There is ${variantVerb}<em>some</em> fear (<mark>${state.fear.counter}</mark>).`;
        } else if (state.fear.counter < 7) {
            message += `<br>There is ${variantVerb}<strong>much</strong> fear (<mark>${state.fear.counter}</mark>).`;
        } else if (state.fear.counter < 10) {
            message += `<br>There is ${variantVerb}<em><strong>strong</strong></em> fear (<mark>${state.fear.counter}</mark>).`;
        } else if (state.fear.counter < DaggerheartFearScript.MAXIMUM_FEAR) {
            message += `<br>There is ${variantVerb}<em><strong>intense</strong></em> fear (<mark>${state.fear.counter}</mark>).`;
        } else {
            message += `<br>There is ${variantVerb}<em><strong>maximum</strong></em> fear (<mark>${state.fear.counter}</mark>).`;
        }
        return message;
    }

    /**
     * Send a player a private message (whisper).
     * @param {String | Object} playerObjOrID 
     * @param {String} message 
     */
    pm(playerObjOrID, message) {
        if (!message) {
            throw new Error('A message is required to send chat.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        if (typeof message !== 'string') {
            throw new Error('Message must be a string.');
        }
        if (!playerObjOrID) {
            sendChat(DaggerheartFearScript.BOT_NAME, message);
        } else {
            sendChat(DaggerheartFearScript.BOT_NAME, `/w "${playerObjOrID.get('displayname')}" ${message}`, null, { noarchive: true });
        }
    }

    /**
     * Send a player a private message of the current fear value.
     * @param {String | Object} playerObjOrID 
     * @param {String} variant 
     */
    pmFear(playerObjOrID, variant) {
        let message = this.fearMessage(variant);
        this.pm(playerObjOrID, message);
    }

    /**
     * Announce (or whisper) the current fear value to all players.
     * If whispers is enabled, only registered and whisper-"on" players are pm'd.
     * @param {String} variant 
     */
    announceFear(variant) {
        if (state.fear.whispers) {
            let players = findObjs({ _type: 'player' });
            let message = this.fearMessage(variant);
            for (let p of players) {
                if (state.fear.off.includes(p.id) === false) {
                    this.pm(p, message);
                }
            }
        } else if (state.fear.announce) {
            sendChat(DaggerheartFearScript.BOT_NAME, this.fearMessage(variant));
        }
    }

    registerPlayer(playerObjOrID) {
        if (!playerObjOrID) {
            throw new Error('Player is required to register.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        let knownIndex = state.fear.known.indexOf(playerObjOrID.id);
        let offIndex = state.fear.off.indexOf(playerObjOrID.id);
        if (knownIndex < 0 || offIndex >= 0) {
            if (knownIndex < 0) {
                state.fear.known.push(playerObjOrID.id);
            }
            if (offIndex >= 0) {
                state.fear.off.splice(offIndex, 1);
            }
            this.pm(playerObjOrID, `Your fear notices are now <mark>on</mark>.`);
            log(`Player "${playerObjOrID.get('displayname')}" registered for fear whispers.`);
        } else {
            log(`Player "${playerObjOrID.get('displayname')}" is already registered for fear whispers.`);
        }
    }

    unregisterPlayer(playerObjOrID) {
        if (!playerObjOrID) {
            throw new Error('Player is required to unregister.');
        }
        if (typeof playerObjOrID === 'string') {
            playerObjOrID = getObj('player', playerObjOrID);
        }
        if (state.fear.off.indexOf(playerObjOrID.id) < 0) {
            state.fear.off.push(playerObjOrID.id);
            this.pm(playerObjOrID, `Your fear notices are now <mark>off</mark>.`);
            log(`Player "${playerObjOrID.get('displayname')}" unregistered from fear whispers.`);
        } else {
            log(`Player "${playerObjOrID.get('displayname')}" is already unregistered from fear whispers.`);
        }
    }

    registerTextObjects(...objectIDs) {
        let textObjs = filterObjs(obj => objectIDs.includes(obj.id) && obj.get('type') === 'text');
        objectIDs = textObjs.map(o => o.id);
        for (let oid of objectIDs) {
            if (state.fear.objects.text.includes(oid) === false) {
                state.fear.objects.text.push(oid);
            }
        }
        return textObjs.map(o => o.id);
    }

    unregisterTextObjects(...objectIDs) {
        let found = [];
        for (let oid of objectIDs) {
            let index = state.fear.objects.text.indexOf(oid);
            if (index >= 0) {
                state.fear.objects.text.splice(index, 1);
                found.push(oid);
            }
        }
        return found;
    }

    monospaceTextObjects(...objectIDs) {
        let textObjs = filterObjs(obj => objectIDs.includes(obj.id) && obj.get('type') === 'text');
        for (let to of textObjs) {
            to.set('font_family', 'monospace');
        }
        return textObjs.map(o => o.id);
    }

    updateTextObjects() {
        if (state.fear.objects.text.length) {
            for (let oid of state.fear.objects.text) {
                let textObject = getObj('text', oid);
                if (!textObject) {
                    this.unregisterTextObjects(oid);
                    log(`The text object with ID "${oid}" was not found and has been unregistered as a fear tracker.`);
                } else {
                    let extraSpaces = 0;
                    let text = '';
                    if (state.fear.textMode === 'tally') {
                        text = '𝍸'.repeat(Math.floor(state.fear.counter / 5));
                        switch (state.fear.counter % 5) {
                            case 1: text += '𝍩'; break;
                            case 2: text += '𝍪'; break;
                            case 3: text += '𝍫'; break;
                            case 4: text += '𝍬'; break;
                        }
                        extraSpaces = 5 - text.length;
                    } else if (state.fear.textMode === 'circled') {
                        let parts = state.fear.counter.toString().split('');
                        let glyphs = ['⓪', '⓵', '⓶', '⓷', '⓸', '⓹', '⓺', '⓻', '⓼', '⓽'];
                        text = parts.map(n => glyphs[parseInt(n)]).join('');
                        extraSpaces = 2 - text.length;
                    } else if (DaggerheartFearScript.ADDITIONAL_TEXT_MODES[state.fear.textMode]) {
                        let charLength = DaggerheartFearScript.ADDITIONAL_TEXT_MODES[state.fear.textMode].length;
                        text = DaggerheartFearScript.ADDITIONAL_TEXT_MODES[state.fear.textMode].repeat(state.fear.counter);
                        extraSpaces = Math.min(100, DaggerheartFearScript.MAXIMUM_FEAR) - state.fear.counter;
                        if (charLength > 1) {
                            extraSpaces *= charLength;
                        }
                    } else {
                        text = state.fear.counter.toString();
                        extraSpaces = 2 - text.length;
                    }
                    if (state.fear.textSpaceFill && extraSpaces > 0) {
                        text += ' '.repeat(extraSpaces);
                    }
                    if (typeof state.fear.textPrefix === 'string' && state.fear.textPrefix) {
                        text = state.fear.textPrefix + ' ' + text;
                    }
                    if (typeof state.fear.textSuffix === 'string' && state.fear.textSuffix) {
                        text += ' ' + state.fear.textSuffix;
                    }
                    //hack around roll20 bug where the game crashes due to empty text
                    if (text === null || text === '') {
                        text = ' ';
                    }
                    textObject.set('text', text);
                }
            }
        }
    }

    /**
     * Parses a Roll20 Chat Message.
     * @param {ChatMessage} msg 
     * @returns {{command:String, args:Array.<String>, player:Player, gm:Boolean }}
     */
    chatCommand(msg) {
        if (msg.type === 'api' && !msg.rolltemplate && msg.playerid) {
            let args;
            if (msg.content.indexOf('"') > -1 || msg.content.indexOf('\'') > -1) {
                let matches = msg.content.substring(1).matchAll(/[^\s"']+|["']([^"']*)["']/gi);
                args = [];
                for (let m of matches) {
                    if (m[0]) {
                        args.push(m.length > 1 && !!m[1] ? m[1] : m[0])
                    }
                }
            } else {
                args = msg.content.substring(1).split(' ');
            }
            let command = args[0].toLowerCase();
            args.splice(0, 1);
            args = args.map(v => v.replaceAll(/[^a-zA-Z0-9 \._=@\-()&+]/g, ''));
            let player = getObj('player', msg.playerid);
            let gm = playerIsGM(msg.playerid);
            return { command, args, player, gm };
        }
        return null;
    }

    chatHandler(msg) {
        //check if new player
        if ((msg.type === 'general' || msg.type === 'api') &&
            msg.playerid &&
            msg.playerid !== 'API' &&
            state.fear.known.includes(msg.playerid) === false) {
            let p = getObj('player', msg.playerid);
            if (p) {
                this.pm(p, `<strong>Welcome to Orbotik's Daggerheart Fear Tracker!</strong> <small>v${DaggerheartFearScript.VERSION}</small><br>You may turn fear notices on and off using <strong>!fear on</strong> and <strong>!fear off</strong> commands.`);
                this.registerPlayer(p);
            }
        }
        //capture duality roll with fear
        if (msg.type === 'advancedroll' && msg.content.match(/demiplane-dice-roll-daggerheart-character/gmi) && msg.content.match(/--roll-with-fear/gmi)) {
            if (state.fear.listen) {
                state.fear.counter = Math.min(DaggerheartFearScript.MAXIMUM_FEAR, state.fear.counter + 1);
                this.updateTextObjects();
                this.announceFear('+');
            }
        } else {
            let chat = this.chatCommand(msg);
            if (chat?.command === 'fear') {
                if (chat.args.length === 0) {
                    log(`Showing fear of ${state.fear.counter ?? 0} to ${chat.player.get('displayname')}.`);
                    this.pmFear(chat.player);
                } else {
                    switch (chat.args[0]) {
                        case 'off':
                            this.unregisterPlayer(chat.player);
                            break;
                        case 'on':
                            this.registerPlayer(chat.player);
                            break;
                        case 'whisper':
                        case 'whispers':
                            if (chat.gm) {
                                if (chat.args[1] === 'on') {
                                    let message = 'Whispers are now <mark>on</mark>';
                                    state.fear.whispers = true;
                                    if (state.fear.announce) {
                                        state.fear.announce = false;
                                        message += '<br>Announcements are <mark>off</mark>';
                                    }
                                    this.pm(chat.player, message);
                                } else if (chat.args[1] === 'off') {
                                    state.fear.whispers = false;
                                    this.pm(chat.player, 'Whispers are now <mark>off</mark>');
                                } else {
                                    this.pm(chat.player, 'Invalid command arguments, expected "on" or "off"');
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'announce':
                        case 'announcements':
                            if (chat.gm) {
                                if (chat.args[1] === 'on') {
                                    let message = 'Announcements are now <mark>on</mark>';
                                    state.fear.announce = true;
                                    if (state.fear.whispers) {
                                        state.fear.whispers = false;
                                        message += '<br>Whispers are <mark>off</mark>';
                                    }
                                    this.pm(chat.player, message);
                                } else if (chat.args[1] === 'off') {
                                    state.fear.announce = false;
                                    this.pm(chat.player, 'Announcements are now <mark>off</mark>');
                                } else {
                                    this.pm(chat.player, 'Invalid command arguments, expected "on" or "off"');
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'listen':
                            if (chat.gm) {
                                if (chat.args[1] === 'on') {
                                    state.fear.listen = true;
                                    this.pm(chat.player, 'Fear roll listener is now <mark>on</mark>');
                                } else if (chat.args[1] === 'off') {
                                    state.fear.listen = false;
                                    this.pm(chat.player, 'Fear roll listener is now <mark>off</mark>');
                                } else {
                                    this.pm(chat.player, 'Invalid command arguments, expected "on" or "off"');
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'spend':
                        case 'gain':
                            if (chat.gm) {
                                let amount = 1;
                                if (chat.args.length > 1 && chat.args[1] && isFinite(parseInt(chat.args[1]))) {
                                    amount = parseInt(chat.args[1]);
                                }
                                if (chat.args[0] === 'spend' && state.fear.counter >= amount) {
                                    state.fear.counter -= amount;
                                    if (state.fear.counter < 0) {
                                        state.fear.counter = 0;
                                    }
                                    //send notices
                                    this.updateTextObjects();
                                    this.announceFear('-');
                                    this.pm(chat.player, `Fear has been spent. New value is <mark>${state.fear.counter}</mark>.`);
                                } else if (chat.args[0] === 'gain' && state.fear.counter + amount <= DaggerheartFearScript.MAXIMUM_FEAR) {
                                    state.fear.counter += amount;
                                    //send notices
                                    this.updateTextObjects();
                                    this.announceFear('+');
                                    this.pm(chat.player, `Fear has been gained. New value is <mark>${state.fear.counter}</mark>.`);
                                } else {
                                    this.pm(chat.player, `Unable to ${chat.args[0]} <mark>${amount}</mark> fear, fear is currently: <mark>${state.fear.counter}</mark>.`);
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'set':
                            if (chat.gm) {
                                let originalCounter = state.fear.counter;
                                let newCounter = Math.min(DaggerheartFearScript.MAXIMUM_FEAR, Math.max(0, parseInt(chat.args[1])));
                                if (originalCounter != newCounter) {
                                    state.fear.counter = newCounter;
                                    this.updateTextObjects();
                                    this.announceFear(originalCounter < newCounter ? '+' : '-');
                                    this.pm(chat.player, `Fear has been set to <mark>${state.fear.counter}</mark>.`);
                                } else {
                                    this.pm(chat.player, `Fear is already set to <mark>${state.fear.counter}</mark>.`);
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'text':
                            if (chat.gm) {
                                if (chat.args.length === 2 && (
                                    chat.args[1] === 'tally' || chat.args[1] === 'number' || chat.args[1] === 'circled' ||
                                    !!DaggerheartFearScript.ADDITIONAL_TEXT_MODES[chat.args[1]]
                                )) {
                                    state.fear.textMode = chat.args[1];
                                    this.updateTextObjects();
                                    this.pm(chat.player, `Text mode is now set to "${chat.args[1]}".<br><small><em>Please note that some text modes may not work across all operating systems. If you experience a problem, please report your operating system, browser, version, and text mode you are attempting to use here:<br>https://github.com/orbotik/roll20-scripts/issues</em></small>`);
                                } else if (chat.args.length === 2 && chat.args[1] === 'update') {
                                    this.updateTextObjects();
                                    let message;
                                    let ids = state.fear.objects.text;
                                    if (ids.length) {
                                        message = `(${ids.length}) Text objects have been <em>updated</em>:`;
                                        message += '<ul>';
                                        for (let id of ids) {
                                            message += `<li>ID: ${id}</li>`;
                                        }
                                        message += '</ul>';
                                    } else {
                                        message = '(0) Text objects are registered. There are no text objects to update.';
                                    }
                                    this.pm(chat.player, message);
                                } else if ((chat.args.length === 2 || chat.args.length === 3) && chat.args[1] === 'monospace') {
                                    let ids = msg.selected?.filter(s => s._type === 'text').map(s => s._id);
                                    if (chat.args.length === 3) {
                                        ids = [chat.args[2]];
                                    }
                                    if (ids && ids.length) {
                                        this.monospaceTextObjects(...ids);
                                        this.updateTextObjects();
                                        this.pm(chat.player, `The text object(s) "${ids.join('", "')}" will now use a monospace font.`);
                                    } else {
                                        this.pm(chat.player, `No text objects are selected. Please select a text object, or specify the object ID.`);
                                    }
                                } else if (chat.args.length === 3 && chat.args[1] === 'spacefill') {
                                    if (chat.args[2] === 'on' || chat.args[2] === 'off') {
                                        state.fear.textSpaceFill = chat.args[2] === 'on';
                                        this.updateTextObjects();
                                        this.pm(chat.player, `Text space-fill is now <mark>${chat.args[2]}</mark>`);
                                    } else {
                                        this.pm(chat.player, 'Invalid command arguments, expected "on" or "off"');
                                    }
                                } else if (chat.args.length === 3 && chat.args[1] === 'prefix') {
                                    state.fear.textPrefix = chat.args[2];
                                    this.updateTextObjects();
                                    this.pm(chat.player, `Text objects will now show the prefix "${state.fear.textPrefix}".`);
                                } else if (chat.args.length === 3 && chat.args[1] === 'suffix') {
                                    state.fear.textSuffix = chat.args[2];
                                    this.updateTextObjects();
                                    this.pm(chat.player, `Text objects will now show the suffix "${state.fear.textSuffix}".`);
                                } else if (chat.args.length === 1 || chat.args.length === 2) {
                                    let ids = msg.selected?.filter(s => s._type === 'text').map(s => s._id);
                                    if (chat.args.length === 2) {
                                        ids = [chat.args[1]];
                                    }
                                    if (ids && ids.length) {
                                        let message;
                                        if (ids.some(oid => state.fear.objects.text.includes(oid))) {
                                            ids = this.unregisterTextObjects(...ids);
                                            message = `(${ids.length}) Text objects have been <strong>unregistered</strong> as fear trackers.`;
                                        } else {
                                            ids = this.registerTextObjects(...ids);
                                            this.updateTextObjects();
                                            message = `(${ids.length}) Text objects have been <strong>registered</strong> as fear trackers.`;
                                        }
                                        if (ids.length) {
                                            message += '<ul>';
                                            for (let id of ids) {
                                                message += `<li>ID: ${id}</li>`;
                                            }
                                            message += '</ul>';
                                        }
                                        this.pm(chat.player, message);
                                    } else {
                                        this.pm(chat.player, `No text objects are selected. Please select a text object, or specify the object ID.`);
                                    }
                                } else {
                                    this.pm(chat.player, 'Invalid arguments. Expected either a text object ID or a text mode, or no arguments and that you have selected text objects.');
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        case 'reset':
                            if (chat.gm) {
                                if (chat.args.length === 1) {
                                    if (state.fear.counter !== 0) {
                                        state.fear.counter = 0;
                                        this.updateTextObjects();
                                        this.pm(chat.player, 'Fear has been reset to <mark>0</mark>.');
                                        this.announceFear('-');
                                    } else {
                                        this.pm(chat.player, 'Fear is already at <mark>0</mark>.');
                                    }
                                } else if (chat.args[1] === 'known') {
                                    state.fear.known = [];
                                    this.pm(chat.player, 'The list of known players has been cleared.');
                                } else if (chat.args[1] === 'objects') {
                                    state.fear.objects = { text: [] };
                                    this.pm(chat.player, 'Tracking objects have been cleared.');
                                } else {
                                    this.pm(chat.player, 'Invalid command argument(s).');
                                }
                            } else {
                                this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            }
                            break;
                        default:
                            this.pm(chat.player, 'Invalid command or parameters (or you may not be the GM).');
                            break;
                    }
                }
            }
        }
    }
}

on('ready', () => {
    log(`Daggerheart Fear script v${DaggerheartFearScript.VERSION} initializing.`);
    new DaggerheartFearScript();
    log(`Daggerheart Fear script initialized.`);
});