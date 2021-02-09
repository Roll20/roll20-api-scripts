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

	/**
	 * Whisper the help for this API to a player.
	 * 
	 * @param {String} who Name of the user asking for the help.
	 */
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

    /**
	 * Color a single result.
	 *
	 * @param {Integer} d Result of a d10
	 */
	function colorResult(d)
	{
	    if (d == 1) { // critical failure
            return "<span style='color: red;'>" + d.toString() + "</span>";
        } else if (d == 10) { // critical success
            return "<span style='color: green;'>" + d.toString() + "</span>";
        } else { // regular roll
            return d.toString();
        }
	}
	
	/**
	 * Check if the result is a failure
	 * 
	 * @param {Integer} d Result of a d10
     * @param {Integer} t Difficulty threshold
	 */
	function resultDice(d, t)
	{
        if (d == 1) return -1; // critical failure
        if (d == 10) return 2; // critical success
        return d >= t;
	}

	/**
	 * Roll for a skill check
	 * 
	 * @param {String}  playerID			  id of the player who asked for the check
	 * @param {Object}  parameters 			  Parameters for the skill check
	 * @param {Integer} parameters.difficulty Difficulty threshold of the check
	 * @param {String}  parameters.skillName  Name of the skill
	 * @param {Integer} parameters.skillValue Value of the skill
	 * @param {String}  parameters.abName 	  Name of the ability (Corpus, Charisma, Sensus, Spiritus)
	 * @param {Integer} parameters.abValue 	  Value of the ability
	 * @param {Integer} parameters.diceMod 	  Dice modifiers
	 * @param {Integer} parameters.malus 	  Malus modifier (as a positive value)
	 * @param {Integer} parameters.nDices 	  Malus modifier (as a positive value)
	 */
	function skillCheck(playerID, parameters)
	{
		// roll dices and construct the string showing all results
		var resultString = "(";
		var total = 0;
		for(var d = 0; d < parameters.nDices; ++d) {
			let roll = randomInteger(10);
			total += resultDice(roll, parameters.difficulty);
			if (d < parameters.nDices - 1)
				resultString += colorResult(roll) + "+";
			else
				resultString += colorResult(roll);
		}
		resultString += ")";

		var totalHtml = "";
		totalHtml += "<span class=\"inlinerollresult showtip tipsy\" title=\"Rolling " + parameters.nDices + "d10>" + parameters.difficulty + " = " + resultString + "\" style=\"padding: 0 3px; font-weight: bold; cursor: help; font-size: 1.1em;\">" + total.toString() + "</span>";

		var message = '';
		message += "&{template:competence} "
				+ "{{carac_name=" + parameters.abName + "}} "
				+ "{{carac_value=" + parameters.abValue + "}} "
				+ "{{comp_name=" + parameters.skillName + "}} "
				+ "{{comp_value=" + parameters.skillValue + "}} "
				+ "{{malus=" + parameters.malus + "}} "
				+ "{{modif_des=" + parameters.diceMod + "}} "
				+ "{{result=" + totalHtml + "}}";

		sendChat('player|' + playerID, '/direct ' + message);
	}

	/**
	 * Parse the parameters of the command line
	 * 
	 * @param {String} 	  commandLine Respecting scheme "!dImperator>{difficulte}{delimiter}{comp}-{compV}{delimiter}{carac}-{caracV}{delimiter}{modifDes}{delimiter}{malus}"
	 * @param {Character} delimiter 
	 */
	function parseSkillCheck(commandLine, delimiter)
	{
		let words = commandLine.split(delimiter);
		let parameters = {};

		// get the difficulty threshold
		var gtIndex = words[0].indexOf('>');
		parameters.difficulty = parseInt(words[0].substring(gtIndex+1));

		// get the skill data
		var skill = words[1].split('-');
		parameters.skillName = skill[0];
		parameters.skillValue = parseInt(skill[1]);

		// get the ability data
		var ability = words[2].split('-');
		parameters.abName = ability[0];
		parameters.abValue = parseInt(ability[1]);

		// get the dice modifiers
		parameters.diceMod = parseInt(words[3]);

		// get the malus
		parameters.malus = parseInt(words[4]);

		// get the number of dices
		parameters.nDices = parameters.skillValue + parameters.abValue + parameters.diceMod - parameters.malus;

		return parameters;
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
			skillCheck(msg.playerid, parseSkillCheck(msg.content, '_'));
		}
		else if(msg.type === "api" && msg.content.search(/!imperator --help/) !== -1)
		{
			showHelp(msg.who.split(' (GM)')[0]);
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
