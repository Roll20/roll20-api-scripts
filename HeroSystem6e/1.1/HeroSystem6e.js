// Terminology
//
//   die = one die, d6
//
//   dice = one set of dice, 3d6
//
//   rolls = multiple dice groups that represent one grouping.  I.e, 3d6 + 1d3 for damage is a single "rolls"
//
//   results = multiple sets of "rolls".  I.e., 3d6 for attack, 5d6 + 1d3 for damage, 2d6+1 for hit location
//
// Chat command "/roll" will generate a "results", but will only ever have one "rolls"
// Inline die rolls [[3d6]] can have more than one "rolls" in the "results"
//
// Warning: the api uses the property name "results" in more than one object, leading to some confusion.
// In the api, "results" is a property in each element of the inlinerolls array, and also a property in
// each element of the rolls array.  My terminology references the use of "results" as the former.



var HeroSystem6e = HeroSystem6e || (function() {
	'use strict';

	var version = '1.1',
	lastUpdate = 1531368487971,
	lastBody = 0,

	checkInstall = function() {
	    var updated = new Date(lastUpdate);
		log('[ HeroSystem6e v'+version+', ' + updated.getFullYear() + "/" + (updated.getMonth()+1) + "/" + updated.getDate() + " ]");
	},

	getChat = function(msg) {
	    var chat, who, from, to, as;

	    from = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
	    who = msg.who.replace(/ \(GM\)/,"");
	    if (msg.type === 'whisper' && msg.target_name) to = '/w "' + msg.target_name + '" ';
	    else to = "";
		if(who === from) as = msg.who;
		else as = '(' + from + ') ' + msg.who;
	    chat = {
	        from: from,
	        to: to,
	        as: as
	    };

	    return chat;
	},

	handleInput = function(msg) {
	    var who;
		var results;
		var body;
		var has_dice;  // true if the die roll was 6-sided dice

		// parameters
		var parm_body = 0;
		var parm_last = 0;
		var parm_hit_location = 0;

		// we first check are using a roll template
		if ( msg.rolltemplate ) {
			who = getChat(msg);
			if( msg.rolltemplate === "hero6template" ) {
				hero6template(who, msg);
				return;
			}
		} else {
			if ( msg.content.toLowerCase().indexOf("show body") !== (-1) ) parm_body = 1;
			if ( msg.content.toLowerCase().indexOf("last body") !== (-1) ) parm_last = 1;
			if ( msg.content.toLowerCase().indexOf("hit location") !== (-1) ) parm_hit_location = 1;

			if( parm_last === 1 ) {
				who = getChat(msg);
				sendChat(who.as, who.to + lastBody.toString() + ' BODY');
			}

			// handle roll result ( /roll 3d6 + 1d3 )
			// only one array of rolls.  this is NOT inline rolls.
			if (msg.type === "rollresult" || msg.type === "gmrollresult"){
				who = getChat(msg);
				results = JSON.parse(msg.content);
				if( parm_body === 1 ) {
					body = countBody(who, results.rolls);
					if( ! isNaN(body) ) sendChat( who.as, who.to + body + " BODY");
				}
				if( parm_hit_location === 1 ) showHitLocation(who, results.total);
				parm_hit_location = 0;
			}

			if (msg.inlinerolls) {
				who = getChat(msg);
				// iterate through each array of rolls
				_.each(msg.inlinerolls, function(i) {
					if( parm_body === 1 ) {
						body = countBody(who, i.results.rolls);
						if( ! isNaN(body) ) sendChat( who.as, who.to + body + " BODY");
					}
					if( parm_hit_location === 1 ) showHitLocation(who, i.results.total);
				});
			}

			return;
		}
	},

	countBody = function(who, rolls) {

		var body = 0;
		var has_dice = false;

		// A set of "rolls" can be all the dice for damage, example 3d6+1d3.
		// "dice" will be each set of dice, i.e. 3d6 is one set, 1d3 is a second set.
		_.each(rolls, function(dice) {

			if(dice.type === 'R') {

				if(dice.sides === 6) {
					has_dice = true;
					_.each(dice.results, function(die) {

						switch(die.v) {
						case 1:
							// zero body
							break;
						case 6:
							// 2 body;
							body += 2;
							break;
						default:
							// 1 body
							body++;
							break;
						}
					});
				}

				if(dice.sides === 3) {
					has_dice = true;
					_.each(dice.results, function(die) {
						switch(die.v) {
						case 1:
							// zero body
							break;
						default:
							// 1 body
							body++;
							break;
						}
					});
				}
			}

		});

		if(has_dice === true ) {
			lastBody = body;
			return body;
		}
		else return NaN;
	},

	countLuck = function(who, rolls) {

		var luck = 0;
		var has_dice = false;

		// A set of "rolls" can be all the dice for damage, example 3d6+1d3.
		// "dice" will be each set of dice, i.e. 3d6 is one set, 1d3 is a second set.
		_.each(rolls, function(dice) {

			if(dice.type === 'R') {

				if(dice.sides === 6) {
					has_dice = true;
					_.each(dice.results, function(die) {

						switch(die.v) {
						case 6:
							// 1 luck;
							luck += 1;
							break;
						}
					});
				}
			}

		});

		if(has_dice === true ) return luck;
		else return NaN;
	},

	showHitLocation = function(who, roll) {
		var location;

		switch( roll ) {

			case 3:
			case 4:
			case 5:
				location = "Head";
				break;
			case 6:
				location = "Hands";
				break;
			case 7:
			case 8:
				location = "Arms";
				break;
			case 9:
				location = "Shoulders";
				break;
			case 10:
			case 11:
				location = "Chest";
				break;
			case 12:
				location = "Stomach";
				break;
			case 13:
				location = "Vitals";
				break;
			case 14:
				location = "Thighs";
				break;
			case 15:
			case 16:
				location = "Legs";
				break;
			case 17:
			case 18:
			case 19:
				location = "Feet";
				break;
			default:
				location = "huh?";
		}

		sendChat(who.as, who.to + location);
	},

	hero6template = function(who, msg) {
		// used to pull properties from template
		var content = msg.content;
		var p; // regex pattern
		var show_counts = 0;
		var has_counts = 0;
		var has_ocv = 0;
		var show_dcvhit = 0;
		var dcvhit = 0;
		var body_count = NaN;
		var luck_count = NaN;

		// properties from template
		var p_ocv = "";     // used with attacks.  generates dcvhit
		var p_attack = "";  // 3d6 roll.  will be used to generate dcvhit
		var p_count = "";   // name of counted pips; i.e. "BODY" or "Luck"

		// get all the properties from the template

		// ocv
		p = /^.*{{ocv=([+-]?[0-9][0-9]*)}}.*$/i;
		if( p.test(content) ) {
			p_ocv = parseInt(content.replace(p,"$1"));
			has_ocv = 1;
		}

		// attack roll (array index)
		p = /^.*{{attack=\$\[\[([0-9]*)\]\]}}.*$/i;
		if( p.test(content) ) {
			p_attack = parseInt(msg.inlinerolls[parseInt(content.replace(p,"$1"))].results.total);
		}

		// count what?  should be BODY or Luck
		var p = /^.*{{count=([a-z,A-Z]*)}}.*$/i;
		if( p.test(content) ) {
			p_count = content.replace(p,"$1");
			show_counts = 1;
		}

		// count pips in damage roll (array index)
		p = /^.*{{damage=\$\[\[([0-9]*)\]\]}}.*$/i;
		if( p.test(content) ) {
			body_count = countBody(who, msg.inlinerolls[parseInt(content.replace(p,"$1"))].results.rolls);
			luck_count = countLuck(who, msg.inlinerolls[parseInt(content.replace(p,"$1"))].results.rolls);
			has_counts = 1;
		}

		// count pips in total roll (array index)
		// note, if this exists, it will replace the results of the "damage roll" above
		p = /^.*{{total=\$\[\[([0-9]*)\]\]}}.*$/i;
		if( p.test(content) ) {
			body_count = countBody(who, msg.inlinerolls[parseInt(content.replace(p,"$1"))].results.rolls);
			luck_count = countLuck(who, msg.inlinerolls[parseInt(content.replace(p,"$1"))].results.rolls);
			has_counts = 1;
		}

		if( (p_attack > 0) && (has_ocv == 1) ) {
			show_dcvhit = 1;
			dcvhit = ( p_ocv - p_attack +  11 );
		}

		// can't show 'em if you ain't got 'em
		if( has_counts == 0 ) show_counts = 0;

		if( show_counts == 0 && show_dcvhit == 0 ) return; // nothing to display

		var output = "";

		output += '<div class="sheet-rolltemplate-hero6template"><div class="sheet-rt-main">';
		if( show_counts == 1 ) {
			if( p_count == "BODY" ) {
				output += '<div class="sheet-rt-body"><span>' + body_count + '</span>BODY ' + ( show_dcvhit==1 ? ',' : '' ) + '</div>';
			} else if( p_count == "Luck" ) {
				output += '<div class="sheet-rt-body"><span>' + luck_count + '</span>Luck Points ' + ( show_dcvhit==1 ? ',' : '' ) + '</div>';
			}
		}
		if( show_dcvhit == 1 ) output += '<div class="sheet-rt-dcvhit">Hit DCV: <span>' + dcvhit + '</span></div>';
		output += '</div>';
		output += '</div>';

		sendChat( who.as, who.to + output );

		return;
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
	    CheckInstall: checkInstall,
	    RegisterEventHandlers: registerEventHandlers
	};

}());

on('ready',function() {
	'use strict';

	HeroSystem6e.CheckInstall();
	HeroSystem6e.RegisterEventHandlers();
});
