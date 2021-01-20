/*
	The One Ring Dice Checker for Roll20.
	By Michael Heilemann (michael.heilemann@me.com)
	Updated by uhu79
    
	This is an API script for Roll20.net, which checks rolls against the success
	criteria of the The One Ring system, and is best used in conjunction with
	the custom dice roll tables (https://wiki.roll20.net/The_One_Ring).
	Basically it will try to output a valuable message about the roll's success,
	and works best of supplied with a Target Number, like so:
		/roll 1d12 + 3d6 > 14
	Or as would be the case if TOR roll tables are set up properly:
		/roll 1t[feat] + 3t[normal] > 14
	Or for the enemy:
		/roll 1t[lm-feat] + 3t[normal] > 14
	It know about Gandalf's Rune, and the great lidless eye, wreathed in flame,
	and counts them as success and failure respectively (based on whether you
	use the feat or lm-feat tables to roll from).
	
	It also checks if your are using 'speaking as' and displays the name accordingly.
    
	Update: 
	it also checks if you have rolled EDGE on your feat-die with the attack roll
	this only works if your macros are following a clear structure and your roll
	commands for rolls look like this:
		
		/r 1t[feat] + @{selected|weapon_rating_1}t[@{selected|Weary}] > [[?{modifier|0} +@{selected|stance} + @{target|parry} + @{target|shield}]]
	where after ">" you have the target number for this roll
		
	and in case of an attack the roll should look like this:
		/r 1t[feat] + @{selected|weapon_rating_1}t[@{selected|Weary}] > [[?{modifier|0} +@{selected|stance} + @{target|parry} + @{target|shield}]] Edge: @{selected|weapon_edge_1}
	where at the end you put the edge-attribute of the weapon
		
	Aditionally, this script now also checks if a player rolled an eye on a missed attack.
	A chat msg is sent accordingly, stating that the opponent might try a called shot next.
 */
on('chat:message', function(e) {
	if (e.type === 'rollresult') {
		var content = JSON.parse(e.content);
		var rolls = content.rolls;
		var tn = false;
		var edge = false;
		var automatic = false;
		var eye = false;
		var tengwars = 0;
		var featResult;
		var piercing = "";
		var eyeOnAttack = "";

		//log(content);

		// determine who triggered the roll, player or character
		var characters = findObjs({_type: 'character'});
		var speaking;
		characters.forEach(function(chr) { if(chr.get('name') == e.who) speaking = chr; });
		  
		rolls.forEach(function(roll) {
			// detect Target Number
			if (roll.type === 'C') {
				var text = roll.text.replace(/\s/g, ''); // remove whitespace
				//split the string into an array separated by space
				var params = roll.text.splitArgs();
				//log(params);
				//the target number is found at position 1 of the array (see the macro)
				tn = params[1];
				//the edge value is found at position 4 of the array (see the macro)
				//a params array for attack-rolls should look like this [">", "(tn)", "Edge:", "(edge)"]
				//if this is not an attack-roll then the variable edge will be undefined
				edge = params[3];
			}

			// loop through dice results
			if (roll.type === 'R') {
				if (roll.sides === 12) {
					featResult = roll.results[0].v;
					automatic = (roll.table === 'lm-feat' && roll.results[0].tableidx === 10 ? true : automatic); // eye as adversary
					automatic = (roll.table === 'feat' && roll.results[0].tableidx === 11 ? true : automatic); // gandalf as player
					eye = (roll.table === 'feat' && roll.results[0].tableidx === 10 ? true : eye); // eye as player
				}

				if (roll.sides === 6) {
					// check for tengwars
					roll.results.forEach(function(result) {
						tengwars = (result.v === 6 ? tengwars + 1 : tengwars);
					}, this);
				}
			}
		}, this);

		//set chat msgs
		//if this is an attack, then edge is set (see macro)
		if (edge) {
			if (featResult >= edge || automatic) {
				piercing = " And might inflict a wound!";
			}
			//setting a chat-msg if player has rolled an eye during an attack
			if (eye) {
				eyeOnAttack = " And provokes the opponent to try a Called Shot next round!";
			}
		}
				
		/*
		//old version where the weapon-slot-nr was handed over via macro
		//this only worked with players though, so I changed it
			if (weapon) {
			//looking up the edge-attribute only works if a speaking as character
				if (speaking) {
					var edge = getAttrByName(speaking.id, 'weapon_edge_'+weapon, 'current');
					if (featResult >= edge || automatic) {
						piercing = " Und schlägt vielleicht eine Wunde!";
					}
				}
			}
		*/

		// gandalf rune for feat table, or eye for lm-feat table
		if (automatic) {
			if (tengwars === 0) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls an automatic success!'+piercing);
				else sendChat('player|'+e.playerid, '/desc rolls an automatic success!'+piercing);
			} else  if (tengwars === 1) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls an automatic great success!'+piercing);
				else sendChat('player|'+e.playerid, '/desc rolls an automatic great success!'+piercing);
			} else if (tengwars > 1) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls an automatic extraordinary success!'+piercing);
				else sendChat('player|'+e.playerid, '/desc rolls an automatic extraordinary success!'+piercing);
			}
					
		// a hit
		} else if (tn !== false && content.total >= tn) {
			if (tengwars === 0) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls a success!'+piercing);
				else sendChat('player|'+e.playerid, '/desc rolls a success!'+piercing);
			} else  if (tengwars === 1) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls a great success!'+piercing);
				else sendChat('player|'+e.playerid, '/desc rolls a great success!'+piercing);
			} else if (tengwars > 1) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls an extraordinary success!'+piercing);
				else sendChat('player|'+e.playerid, '/desc rolls an extraordinary success!'+piercing);
			}

		// a miss
		} else if (tn !== false && content.total < tn) {
			if(speaking) sendChat('character|'+speaking.id, '/desc misses.'+eyeOnAttack);
			else sendChat('player|'+e.playerid, '/desc misses.'+eyeOnAttack);

		} else {
			if (tengwars === 1) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls a tengwar.');
				else sendChat('player|'+e.playerid, '/desc rolls a tengwar.');
			} else if (tengwars === 2) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls two tengwars.');
				else sendChat('player|'+e.playerid, '/desc rolls two tengwars.');
			} else if (tengwars > 2) {
				if(speaking) sendChat('character|'+speaking.id, '/desc rolls whole lotta tengwars.');
				else sendChat('player|'+e.playerid, '/desc rolls whole lotta tengwars.');
			}

		}
	}
});

/**
 * Splits a string into arguments using some separator. If no separator is
 * given, whitespace will be used. Most importantly, quotes in the original
 * string will allow you to group delimited tokens. Single and double quotes
 * can be nested one level.
 * 
 * As a convenience, this function has been added to the String prototype,
 * letting you treat it like a function of the string object.  
 * 
 * Example:
on('chat:message', function(msg) {
    var command, params;
    
    params = msg.content.splitArgs();
    command = params.shift().substring(1);
    
    // msg.content: !command with parameters, "including 'with quotes'"
    // command: command
    // params: ["with", "parameters,", "including 'with quotes'"]
});     
 */
var bshields = bshields || {};
	bshields.splitArgs = (function() {
	'use strict';
    
	var version = 1.0;
    
	function splitArgs(input, separator) {
		var singleQuoteOpen = false,
			doubleQuoteOpen = false,
			tokenBuffer = [],
			ret = [],
			arr = input.split(''),
			element, i, matches;
		separator = separator || /\s/g;
        
		for (i = 0; i < arr.length; i++) {
			element = arr[i];
			matches = element.match(separator);
			if (element === '\'') {
				if (!doubleQuoteOpen) {
					singleQuoteOpen = !singleQuoteOpen;
					continue;
				}
			} else if (element === '"') {
				if (!singleQuoteOpen) {
					doubleQuoteOpen = !doubleQuoteOpen;
					continue;
				}
			}
            
			if (!singleQuoteOpen && !doubleQuoteOpen) {
				if (matches) {
					if (tokenBuffer && tokenBuffer.length > 0) {
						ret.push(tokenBuffer.join(''));
						tokenBuffer = [];
					}
				} else {
					tokenBuffer.push(element);
				}
			} else if (singleQuoteOpen || doubleQuoteOpen) {
				tokenBuffer.push(element);
			}
		}
		if (tokenBuffer && tokenBuffer.length > 0) {
			ret.push(tokenBuffer.join(''));
		}
        
		return ret;
	}
    
	return splitArgs;
}());

String.prototype.splitArgs = String.prototype.splitArgs || function(separator) {
	return bshields.splitArgs(this, separator);
};
