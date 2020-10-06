
/* jshint undef: true */
/* globals
 sendChat,
 randomInteger,
 _,
 on
 */

var DSA41CritChecker = DSA41CritChecker || (function()
{
	'use strict';

	const messageTemplate = '<div style="border: 1px solid gray; background-color: {{color}}"><span>{{message}}</span></div>';

    function getWhisperTarget(options) {
        var nameProperty, targets, type;
        
        options = options || {};
        
        if (options.player) {
            nameProperty = 'displayname';
            type = 'player';
        } else if (options.character) {
            nameProperty = 'name';
            type = 'character';
        } else {
            return '';
        }
        
        if (options.id) {
            targets = [getObj(type, options.id)];
            
            if (targets[0]) {
                return '/w ' + targets[0].get(nameProperty).split(' ')[0] + ' ';
            }
        }
        if (options.name) {
            // Sort all players or characters (as appropriate) whose name *contains* the supplied name,
            // then sort them by how close they are to the supplied name.
            targets = _.sortBy(filterObjs(function(obj) {
                if (obj.get('type') !== type) return false;
                return obj.get(nameProperty).indexOf(options.name) >= 0;
            }), function(obj) {
                return Math.abs(levenshteinDistance(obj.get(nameProperty), options.name));
            });
            
            if (targets[0]) {
                return '/w ' + targets[0].get(nameProperty).split(' ')[0] + ' ';
            }
        }
        
        return '';
    }

    function sendMessage(content, originalMessage) {
        if (originalMessage.target) {
            var msgContent = "/w " + originalMessage.target + " " + content;
            sendChat("Game", "/w " + originalMessage.target + " " + content, null, { noarchive: true });
            if (!(originalMessage.target === "gm" && playerIsGM(originalMessage.playerid))) {
                msgContent = DSA41CritChecker.getWhisperTarget( { player: true, id: originalMessage.playerid }) + " " + content;
                sendChat("Game", DSA41CritChecker.getWhisperTarget( { player: true, id: originalMessage.playerid }) + " " + content, null, { noarchive: true });
            }
        } else {
            sendChat("Game", content, null, { noarchive: true });
        }
    }

    function handleMainRoll(mainRoll, msg) {
        const totalRoll = mainRoll.results.rolls[0];
        const totalResult = totalRoll.results[0].v;
        var critCount = 0;
        var fumbleCount = 0;
        var rolls = [];
        for (let i = 0; i < totalRoll.rolls[0].length; i++) {
            const subRoll = totalRoll.rolls[0][i];
            if (subRoll.resultType === "sum") {
                rolls.push(subRoll.rolls[0][0].results[0].v);
                if (subRoll.rolls[0][0].results[0].v === 1) {
                    critCount++;
                } else if (subRoll.rolls[0][0].results[0].v === 20) {
                    fumbleCount++;
                }
            }
        }
        var shouldSendMessage = false;
        var message = null;
        var color = null;
        if (critCount > 1) {
            color = '#d7f2cd';
            if (totalResult < 0 && rolls[0] === 1 && rolls[1] === 1) {
                shouldSendMessage = true;
                message = 'Probe kritisch gelungen trotz negativer TaP*, da 1 bei ersten beiden Würfel. Gesamtzahl gewürfelte "1": ' + critCount;
            } else if (totalResult >= 0) {
                shouldSendMessage = true;
                message = 'Probe kritisch gelungen. Anzahl gewürfelte "1": ' + critCount;
            }
        } else if (fumbleCount > 1) {
            if (totalResult >= 0 && rolls[0] === 20 && rolls[1] === 20) {
                shouldSendMessage = true;
                color = '#f2cdcd'
                message = 'Probe kritisch fehlgeschlagen trotz positiver TaP*, da 20 bei ersten beiden Würfel. Gesamtzahl gewürfelte "20": ' + fumbleCount;
            } else if (totalResult < 0) {
                shouldSendMessage = true;
                color = '#f2e3cd'
                message = 'Probe kritisch fehlgeschlagen. Anzahl gewürfelte "20": ' + fumbleCount;
            }
        }
        if (shouldSendMessage) {
            DSA41CritChecker.sendMessage(messageTemplate.replace("{{color}}", color).replace("{{message}}", message), msg);
        }
    }

	function registerEventHandlers()
	{
		on('chat:message', DSA41CritChecker.handleChatMessage);
	}

	/**
	 * Grab chat message objects
	 *
	 * @param {object} msg
	 */
	function handleChatMessage(msg)
	{

		if (msg.rolltemplate === "DSA-Talente" || msg.rolltemplate === "DSA-Zauber" || msg.rolltemplate === "DSA-Talente-eBE" || msg.rolltemplate === "DSA-Liturgien") {
            for (let i = 0; i < msg.inlinerolls.length; i++) {
                const mainRoll = msg.inlinerolls[i];
                if ((mainRoll.expression.match(/1d20cs1cf20/g) || []).length === 3) {
                    DSA41CritChecker.handleMainRoll(mainRoll, msg);
                }
            }
        }
	}

	return {
		registerEventHandlers: registerEventHandlers,
        handleChatMessage: handleChatMessage,
        sendMessage: sendMessage,
        handleMainRoll: handleMainRoll,
        getWhisperTarget: getWhisperTarget
		}
}());

/**
 * Fires when the page has loaded.
 */
on("ready", function()
{
	DSA41CritChecker.registerEventHandlers();
});
