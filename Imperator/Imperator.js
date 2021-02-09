/* jshint undef: true */
/* globals
 sendChat,
 randomInteger,
 _,
 on
 */

var ImperatorAPI = (function()
{
	'use strict';

	const script_name = 'IMPERATOR';
	const CSS = {
        container: 'border: 1pt solid black; background-color: white; font-size: 0.9em;',
        table: 'border:0;',
        trow: 'border-bottom: 1px solid #ddd; border-top: 1px solid #ddd;',
		thead: 'font-weight:bold; padding-left: 5px; padding-right: 5px;',
        heading: 'text-align: center; text-decoration: underline; font-size: 16px; line-height: 24px;'
    };

	function getWho(who)
	{
		return who.split(' (GM)')[0];
	}

	// !dImperator>5_<skillName>-<skillValue>_<caracName>-<caracValue>_<dice mod.>_<malus>
	function showHelp(who)
	{
		const command = "!dImperator>{difficulte}_{comp}-{compV}_{carac}-{caracV}_{modifDes}_{malus}";
		const help = {
			difficulte: "Difficulté du jet.",
			comp: "Nom de la compétence",
			compV: "Valeur de la compétence",
			carac: "Nom de la caractéristique.",
			caracV: "Valeur de la caractéristique.",
			modifDes: "Modificateur au nombre de dés.",
			malus: "Malus au nombre de dés (valeur positive)."
		};
		const commandExample = "!dImperator>5_Pugilat-2_Corpus-3_0_1";
		let output = `<div style="${CSS.container}"><h3 style="${CSS.heading}">Imperator Instructions</h3>`;
		output += command;
		output += `<table style="${CSS.table}">`;
		Object.entries(help).forEach(([key, value]) => {
			output += `<tr style="${CSS.trow}"><td style="${CSS.thead}">${key}</td><td>${value}</td></tr>`;
		});
		output += '</table>';
		output += `<strong>Exemple</strong> :<br> ${commandExample}`;
		output += '</div>';
		sendChat(script_name, `/w "${who}" ${output}`);
	}

    /*
	 * Give a style for a single result.
	 *
	 * @param d (Integer) result of a d10
	 */
	function colorResult(d)
	{
	    if(d == 1) {
            return "<span style='color: red;'>" + d.toString() + "</span>";
        } else if (d == 10) {
            return "<span style='color: green;'>" + d.toString() + "</span>";
        } else {
            return d.toString();
        }
	}
	
	/**
	 * Check if the result is a failure
	 * 
	 * @param d (Integer) result of a d10
     * @param t (Integer) threshold
	 */
	function resultDice(d, t)
	{
        if (d == 1) return -1;
        if (d == 10) return 2;
        return d >= t;
	}

	function registerEventHandlers()
	{
		on('chat:message', ImperatorAPI.handleChatMessage);
	}

	/**
	 * Grab chat message objects
	 *
	 * @param {object} msg
	 */
	function handleChatMessage(msg)
	{

		// Check if we are dealing with a [!dImperator>5_<skillName>-<skillValue>_<caracName>-<caracValue>_<dice mod.>_<malus>] command.
		if (msg.type === "api" && msg.content.search(/!dImperator>\d/) !== -1)
		{
			var content = msg.content;
			var words = content.split('_');

			// Sanity check
			if (words.length > 0)
			{
				// Sanity check
				if (words[0].match(/!dImperator>\d/))
				{
                    // get the skill data
                    var skill = words[1].split('-');
                    var skillName = skill[0];
                    var skillValue = parseInt(skill[1]);

                    // get the carac data
                    var carac = words[2].split('-');
                    var caracName = carac[0];
                    var caracValue = parseInt(carac[1]);

                    // get the dice modifiers
                    var diceMod = parseInt(words[3]);

                    // get the malus
                    var malus = parseInt(words[4]);

				    // get the number of dices
				    var numberOfDices = skillValue + caracValue + diceMod - malus;

                    // get the difficulty threshold
                    var gtIndex = words[0].indexOf('>');
                    var difficulty = parseInt(words[0].substring(gtIndex+1));
				    
				    // roll dices
				    var rolls = [];
                    var resultString = "(";
				    var total = 0;
				    for(var d = 0; d < numberOfDices; ++d) {
				        rolls.push(randomInteger(10));
				        total += resultDice(rolls[d], difficulty);
                        if (d < numberOfDices - 1)
                            resultString += colorResult(rolls[d]) + "+";
                        else
                            resultString += colorResult(rolls[d]);
				    }
                    resultString += ")";

					var totalHtml = "";
					totalHtml += "<span class=\"inlinerollresult showtip tipsy\" title=\"Rolling " + numberOfDices + "d10>" + difficulty + " = " + resultString + "\" style=\"padding: 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\">" + total.toString() + "</span>";
					log(totalHtml);

                    var message = '';
                    message += "&{template:competence} "
                            + "{{carac_name=" + caracName + "}} "
                            + "{{carac_value=" + caracValue + "}} "
                            + "{{comp_name=" + skillName + "}} "
                            + "{{comp_value=" + skillValue + "}} "
                            + "{{malus=" + malus + "}} "
                            + "{{modif_des=" + diceMod + "}} "
                            + "{{result=" + totalHtml + "}} "
                            + "{{tooltip=" + resultString + "}}";

                    sendChat('player|' + msg.playerid, '/direct ' + message);
				}
			}
		}
		else if(msg.type === "api" && msg.content.search(/!imperator --help/) !== -1)
		{
			showHelp(getWho(msg.who));
		}
	}

	return {
        registerEventHandlers: registerEventHandlers,
        handleChatMessage: handleChatMessage,
    }
}());

/**
 * Fires when the page has loaded.
 */
on("ready", function()
{
	ImperatorAPI.registerEventHandlers();
});
