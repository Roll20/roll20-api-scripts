/* jshint undef: true */
/* globals
 sendChat,
 randomInteger,
 _,
 on
 */

var dKrystal = (function()
{
	'use strict';
	
	/**
	 * Create the html for the roll template and send it to the chat.
	 * 
	 * @param playerId (String) the ID of the player that sent the message
	 * @param dK (Integer) number of krystal dices
	 * @param msg (String) results as a string
	 */
	function block(playerId, dK, msg)
	{
	    log(playerId);
	    var html = ""
		    + "<div style=\"background-color: #ccffcc; "
		    +              "color: #796c62; "
		    +              "font-weight: bold; "
		    +              "font-size: x-large; "
		    +              "padding: 15px 5px 5px 5px; "
		    +              "text-align: center; "
		    +              "border: solid 1px #796c62\">"
			+ "    " + dK.toString() + " Dés Krystal"
		    + "    <img src=\"https://raw.githubusercontent.com/Roll20/roll20-api-scripts/master/KrystalDice/1.0/curve.png\" "
		    +          "style=\"margin-top: 5px;\"/>"
		    + "</div>"
		    + "<div style=\"border: solid 1px #796c62; "
		    +              "padding: 15px; "
		    +              "font-size: large; "
		    +              "text-align: center;\">"
			+ "    " + msg
		    + "</div>";
		sendChat('player|' + playerId, '/direct ' + html);
	}
	
	/**
	 * Check if the result is a failure
	 * 
	 * @param d (Integer) result of a d6
	 */
	function chocKrystal(d)
	{
	    return d != 1 && d != 3 && d != 6;
	}
	
	
	/*
	 * Give a style for a single result.
	 *
	 * @param d (Integer) result of a d6
	 */
	function colorResult(d)
	{
	    var color;
	    if(chocKrystal(d)) {
            return "<span style=\""
                + " color: red;"
                //+ " border: solid 2px " + color + ";"
                //+ " padding: 3px;"
                //+ " margin-top: 2px;"
                //+ " margin-bottom: 2px;"
                + "\">" + d.toString() + "</span>";
        } else {
            return "<span style=\""
                + " color: green;"
                + " font-weight: bold;"
                //+ " border: solid 2px " + color + ";"
                //+ " padding: 3px;"
                //+ " margin-top: 2px;"
                //+ " margin-bottom: 2px;"
                + "\">" + d.toString() + "</span>";
        }
	}

	function registerEventHandlers()
	{
		on('chat:message', dKrystal.handleChatMessage);
	}

	/**
	 * Grab chat message objects
	 *
	 * @param {object} msg
	 */
	function handleChatMessage(msg)
	{

		// Check if we are dealing with a !1dk command.
		if (msg.type === "api" && msg.content.search(/!\d+dK/) !== -1)
		{
			var content = msg.content;
			var words = content.split(' ');

			// Sanity check
			if (words.length > 0)
			{
				// Sanity check
				if (words[0].match(/!\d+dK/))
				{
				    // get the number of dices
				    var dIndex = words[0].indexOf('d');
				    var stringNumberOfDices = words[0].substring(1, dIndex);
				    var numberOfDices = parseInt(stringNumberOfDices);
				    
				    // roll dices
				    var rolls = [];
				    var total = 0;
				    for(var d = 0; d < numberOfDices; ++d) {
				        rolls.push(randomInteger(6));
				        if(!chocKrystal(rolls[d])) {
				            total += rolls[d];
				        }
				    }
				    
				    // generate message
				    var message = '';
				    for(var d = 0; d < numberOfDices-1; ++d) {
				        message += colorResult(rolls[d]) + ' + '; 
				    }
				    message += colorResult(rolls[numberOfDices-1])
				            + ' = '
				            + "<span style=\" font-weight: bold;"
                            +               " border: solid 2px black;"
                            +               " padding: 3px;"
                            +               " margin-top: 2px;"
                            +               " margin-bottom: 2px;\">"
				            +       total.toString();
				            + "</span>";
				    block(msg.playerid, numberOfDices, message);
				}
			}
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
	dKrystal.registerEventHandlers();
});
