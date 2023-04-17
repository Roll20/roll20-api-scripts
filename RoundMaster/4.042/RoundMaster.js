/**
 * roundMaster.js
 *
 * * Copyright 2015: Ken L.
 * Licensed under the GPL Version 3 license.
 * http://www.gnu.org/licenses/gpl.html
 * 
 * This script is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This script is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Extended for D&D2e game play by Richard Edwards, July-October, 2020
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * The goal of this script is to be an initiative tracker, that manages statuses,
 * effects, and durations.
 * 
 * 1. It should advance the turn order and display a notification in chat with
 * optional toggles. 
 * 
 * 1.1 It should have the ability to announce rounds
 * 
 * 2. It should allow some kind of underlay graphic with or without some kind of
 * underlay graphic like TurnMarker.js
 * 
 * 3. It should have the ability to tie status conditions to tokens with concise
 * visual cues to relay to chat (IE fog cloud has X turns remaining on it or has lasted N turns).
 * 
 * 4. It should be extensible to other scripts by exposing a call structure for
 * a speedier access of innate functions without cluttering up the message queue. TODO
 * 
 * 5. It should be verbose in terms of error reporting where all are recoverable.
 * 
 * 6. It should save turn information within the state object to ensure recovery
 * of all effects in the event of API connection failure.
 * 
 * 7. It should be lightweight with a minimal amount of passed messages.
 * 
 * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
 * 
 * Added by Richard Edwards (comments preceeded by RED in code
 * 
 * 7. It should expose an accessible Round Counter variable for use in macros.
 * 
 * 8. It should provide for the addition of custom items to the Turn Order,
 * allowing more than one entry with the same name but only with different values.
 * 
 * v3.001  02/01/2021 Changed the API to roundMaster.js, and the command to !rounds
 * v3.002  24/01/2021 Implemented handlers for player page change, and token addition, change & destruction
 *                    so that spell effect markers are properly handled for each of these events
 * v3.003  26/01/2021 Implemented a handler for a token death status marker being set, which immediately ends
 *                    all live effects on that token.  Added 'all' as an option for doRemoveStatus().
 * v3.004  29/01/2021 Changed all sendChat calls to add 'use3d:false' to ensure roundMaster is not generating
 *                    the spurious 3d dice rolls that are appearing.  Also softened sendResponse error on invalid pid.
 * v3.005  05/02/2021 Modified --addstatus to force the status marker to lower case.
 * v3.006  11/02/2021 Modified updateStatusDisplay() so that statuses on GM-controlled tokens are not made public.
 * v3.007  01/04/2021 Fixed bugs in doAddStatus where parameters were missing or needed trimming
 * v3.008  09/05/2021 Changed turn display so that GM sees full turn info for tokens with showplayers_name=false. 
 *                    Players continue to just see "Turn"
 * v3.009  20/05/2021 Moved --target command from MagicMaster to RoundMaster to allow the playerID to be
 *                    recognised by RoundMaster and allow GM permission messages to be created
 * v3.010  30/05/2021 Added a new --deletestatus command which does not trigger any '-end' effect macro, so that 
 *                    e.g. dancing weapons can be sheathed without setting them off dancing.
 * v3.011  19/06/2021 Added the new --viewer command which sets the PlayerID as a viewing screen for all tokens,
 *                    switching the displayed visibility for each token as they hit the top of the turn order
 * v3.012  26/06/2021 Changing the way addToTracker() works to take the absolute value for the initiative roll 
 *                    rather than a base plus increments, to make it more intuitive
 * v3.013  28/06/2021 Adapted chat message handling to use a switch statement and have a try/catch strategy 
 *                    for error capture and prevent the API falling over
 * v3.014  11/07/2021 Fixed viewer to only deal with player page tokens
 * v3.015  21/07/2021 Fixed updateStatusDisplay() to deal with --reset-ing the round number.  Deducts the right
 *                    number of rounds from the duration and, if <= 0, ends any effect and removes the status.
 *                    However, will not run multiple -turn effects.
 * v3.016  29/07/2021 Added function to trap a graphic/token being dragged onto the map and to run a
 *                    token_name-add effect if one exists.  Fixed bug in --viewer command where used on its own
 *                    (no args) it caused a reference error
 * v3.017  02/09/2021 Search for Effects libraries with extended names to allow campaign-specific effects
 * v3.018  22/09/2021 Add cross-hairs and area identification for area effect spells
 * v3.019  31/10/2021 Added Effects-DB database updating and version management
 * v3.020  10/11/2021 Changed Token bar value recovery to be more flexible and accurate.  Updated Effects-DB to 
 *                    use this altered functionality
 * v3.021  22/11/2021 Updated the --help text (belatedly), and set database creation to "controlledby:all".
 * v3.022  24/11/2021 General minor and cosmetic bug fixing.
 * v3.023  30/11/2021 Changed avatars and added version control on handouts.
 * v3.024  04/12/2021 Fixed bug which scrambled the 'play', 'pause' & 'stop' symbols portrayed in the 
 *                    turn order tracker when downloaded from the Roll20 One-Click Install
 *                    Added --removetargetstatus command to deal with a caster loosing concentration
 *                    Fixed issue with targeted statuses
 *                    Changed abilityLookup() to prioritise ability macros in user databases
 *                    Fixed bug in Effect macro processing of token bar values
 * v3.025  06/12/2021 Added --echo command to support whispers from API buttons in effect macros
 * v3.026  12/12/2021 Fixed erroneous double decrement of status counter on creation, and
 *                    added --movable-aoe command, 
 *                    and 'orientation' message to other Area of Effect shapes.
 * v3.027  17/01/2022 Updated various Effects, and fixed error on deleting a token with statuses.
 *                    Also fixed error moving statuses with Player page
 *                    Fixed illegal character rendering by One-Click install
 * v3.028  04/02/2022 Swapped Rage effect programming to latest field definitions
 *                    Added Scabbard of Enchanting & Protection vs Fiends effects
 *                    Added token _pageid to turnorder token entry
 * v3.029  25/02/2022 Fixed a crash caused by having 1 illegal dice roll character sandwiched between two
 *                    valid dice rolls in a status tune message set with --target e.g. 2d4/1d4 will
 *                    cause the crash.
 * v3.030  13/03/2022 Added new effects
 * v4.031  20/03/2022 Added use of libTokenMarkers API library and extended to use any loaded 
 *                    token marker sets.  Changed s-marker command to --listmarkers. Fixed token 
 *                    marker "stacking" issues.
 * v4.032  26/03/2022 Fixed multi-user libTokenMarkers API call
 * v4.033  05/04/2022 Changed --viewer mode so tokens/characters controlledby 'all' will not have
 *                    vision status changed: fixes trapped/locked chests getting erroneous "vision".
 *                    Trapped multiple Lib check errors within 10sec and only send 1.  Changed order
 *                    in which token fields are checked for AC/Thac0/HP so only reverts to defaults after
 *                    checking others.
 * v4.034  11/05/2022 Added effects to turn on and off Underwater Infravision.  Added error messages when
 *                    editing or moving statuses and no tokens are selected.  Sent --redo message for each 
 *                    to affected token to InitMaster API when clearing the turn order.  Allow relative 
 *                    measurements to caster token for Area of Effects (using +/-).  Fix errors in 
 *                    gatTokenValues().
 * v4.035  07/10/2022 Added additional effects for new magic items recently programmed. Moved Effects-DB 
 *                    to be held as data, as per other RPGM APIs. Added --extract-db function. Changed 
 *                    initiative modifier field from comreact to custom field init-mod
 * v4.036  11/11/2022 Added new effects to support the new race and creature databases
 * v4.037  30/11/2022 Extended the status name syntax to support hiding the effect name from the Players
 * v4.038  08/12/2022 Added ability to extend or reduce existing statuses using duration of +# or -#
 * v4.039  16/12/2022 Added more effects for creature powers.
 * v4.040  26/01/2023 Updated getTokenValues() to use new configurable default token bar mappings
 * v4.041  03/03/2023 Added effects for Rods, Staves & Wands. Fixed aoe maths for non-standard cell sizes.
 *                    Extended --aoe parameters to support sequential --target command to overcome
 *                    asynchronous command processing.
 * v4.042  16/04/2023 Added ^^duration^^ attribute tag to sendAPImacro() to pass number of rounds passed
 *                    on an effect turn for use in the Effect macro.  Added effects to support added items.
 **/
 
var RoundMaster = (function() {
	'use strict'; 
	var version = 4.042,
		author = 'Ken L. & RED',
		pending = null;
	const lastUpdate = 1681632737;
	
	var RW_StateEnum = Object.freeze({
		ACTIVE: 0,
		PAUSED: 1,
		STOPPED: 2,
		FROZEN: 3
	});

	var PR_Enum = Object.freeze({
		YESNO: 'YESNO',
		CUSTOM: 'CUSTOM',
	});

	var TO_SortEnum = Object.freeze({
		NUMASCEND: 'NUMASCEND',
		NUMDESCEND: 'NUMDESCEND',
		ALPHAASCEND: 'ALPHAASCEND',
		ALPHADESCEND: 'ALPHADESCEND',
		NOSORT: 'NOSORT'
	});	
	
	var fields = {
		feedbackName: 'RoundMaster',
		feedbackImg: 'https://s3.amazonaws.com/files.d20.io/images/11514664/jfQMTRqrT75QfmaD98BQMQ/thumb.png?1439491849',
		trackerId: '',
		trackerName: 'RoundMaster_tracker',
		trackerImg: 'https://s3.amazonaws.com/files.d20.io/images/11920268/i0nMbVlxQLNMiO12gW9h3g/thumb.png?1440939062',
		//trackerImg: 'https://s3.amazonaws.com/files.d20.io/images/6623517/8xw1KOSSOO1WocN3KQYmzw/thumb.png?1417994946',
		coneImage: 'https://s3.amazonaws.com/files.d20.io/images/250318958/dFggs3eDRDXntGCEHDUbVw/thumb.png?1634215364',
		trackerImgRatio: 2.25,
		rotation_degree: 10,
		effectlib: 'Effects-DB',
		crossHairName: 'RoundMaster_crosshair',
		chCircleImage: 'https://s3.amazonaws.com/files.d20.io/images/246879699/udrkMIWIio5-ZsMFlsdwSA/thumb.png?1632500227',
		chSquareImage: 'https://s3.amazonaws.com/files.d20.io/images/246880604/wawFdevkLcoCWNElMEHt_g/thumb.png?1632500699',
		chConeImage:   'https://s3.amazonaws.com/files.d20.io/images/246950559/Pliz5b-O8k_Sin7KuoPnJw/thumb.png?1632518407',
		
		defaultTemplate:	'default',
		initMaster:			'!init',
		dbVersion: 			['db-version','current'],
		Token_Thac0:		['bar2','value'],
		Token_MaxThac0:		['bar2','max'],
		Thac0_base:			['thac0-base','current'],
		Thac0:              ['thac0','current'],
		MonsterThac0:		['monsterthac0','current'],
		Token_HP:			['bar3','value'],
		Token_MaxHP:		['bar3','max'],
		HP:					['HP','current'],
		Token_AC:			['bar1','value'],
		Token_MaxAC:		['bar1','max'],
		MonsterAC:			['monsterarmor','current'],
		AC:					['AC','current'],
		ItemWeaponList:		['spellmem','current'],
		ItemArmourList:		['spellmem2','current'],
		ItemRingList:		['spellmem3','current'],
		ItemMiscList: 		['spellmem4','current'],
		ItemPotionList:		['spellmem10','current'],
		ItemScrollList:		['spellmem11','current'],
		ItemWandsList:		['spellmem12','current'],
		ItemDMList:			['spellmem13','current'],
	}; 

	var dbNames = Object.freeze({
	Effects_DB:		{bio:'<blockquote>Token Marker Effects Macro Library</blockquote><br><br>v6.09 03/03/2023<br><br>This database holds the definitions for all token status effects.  These are macros that optionally are triggered when a status of the same root name is placed on a token (statusname-start), each round it is still on the token (statusname-turn), and when the status countdown reaches zero or the token dies or is deleted (statusname-end)  There are also other possible status conditions such as weaponname-inhand, weaponname-dancing and weaponname-sheathed.  See the <b>RoundMaster API</b> documentation for further information.<br><br><b>Important Note:</b> Effects require a Roll20 Pro membership, and the installation of the ChatSetAttr, Tokenmod and RoundMaster API Scripts, to allow parameter passing between macros, update of character sheet variables, and marking spell effects on tokens.  If you do not have this level of subscription, I highly recommend you get it as a DM, as you get lots of other goodies as well.  If you want to know how to load the API Scripts to your game, the RoLL20 API help here gives guidance, or Richard can help you.<br><br><b>Important Note for DMs:</b> if a monster character sheet has multiple tokens associated with it, and token markers with associated Effects are placed on more than one of those Tokens, any Effect macros will run multiple times and, if changing variables on the Character Sheet using e.g. ChatSetAttr will make the changes multiple times to the same Character Sheet - generally this will cause unexpected results!  If using these Effect macros for Effects that could affect monsters in this way, it is <b>HIGHLY RECOMMENDED</b> that a 1 monster Token : 1 character sheet approach is adopted.',
					gmnotes:'<blockquote>Change Log:</blockquote><br>v6.09  03/03/2023  Added more effects for new magic items<br>v6.08  16/12/2022  Added more creature effects, such as poisons<br>v6.07  09/12/2022  Added effects to support the new Creatures database<br>v6.06  14/11/2022  Added effects to support new Race Database & Powers<br><br>v6.04  16/10/2022  Added effect for Spiritual-Hammer-end and for Chromatic-Orb Heat effects<br><br>v6.03  12/10/2022  Changed the Initiative dice roll modification field from "comreact" to the new custom field "init-mod"<br><br>v6.02  07/10/2022  Added new effects to support newly programmed magic items<br><br>v6.01  11/05/2022  Added effects to turn on and off underwater infravision<br><br>v5.8  04/02/2022  Fixed old field references when Raging<br><br>v5.7  17/01/2022  Fixed magical To-Hit adjustments for Chant to work in same way as dmg adjustment<br><br>v5.6  01/01/2022  Added multiple Effect Macros to support MagicMaster spell enhancements<br><br>v5.2-5.5 skipped to bring version numbering in line across all APIs<br><br>v5.1  10/11/2021  Changed to use virtual Token bar field names, so bar allocations can be altered<br><br>v5.0  29/10/2021  First version loaded into roundMaster API<br><br>v4.2.4  03/10/2021  Added Hairy Spider poison v4.2.3  23/05/2021  Added a Timer effect that goes with the Time-Recorder Icon, to tell you when a Timer you set starts and ends.<br><br>v4.2.2  28/03/2021  Added Regeneration every Round for @conregen points<br><br>v4.2.1  25/02/2021  Added end effect for Wandering Monster check, so it recurs every n rounds<br><br>v4.2  23/02/2021  Added effect for Infravision to change night vision settings for token.<br><br>v4.1  17/12/2020  Added effects for Dr Lexicon use of spells, inc. Vampiric Touch & Spectral Hand<br><br>v4.0.3 09/11/2020 Added effects for Cube of Force<br><br>v4.0.2 20/10/2020 Added effects of a Slow spell<br><br>v4.0.1 17/10/2020 Added Qstaff-Dancing-turn to increment a dancing quarterstaff\'s round counter<br><br>v4.0  27/09/2020 Released into the new Version 4 Testbed<br><br>v1.0.1 16/09/2020 Initial full release for Lost & Found<br><br>v0.1 30/08/2020 Initial testing version',
					controlledby:'all',
					root:'effects-db',
					avatar:'https://s3.amazonaws.com/files.d20.io/images/2795868/caxnSIYW0gsdv4kOmO294w/thumb.png?1390102911',
					version:6.10,
					db:[{name:'3min-geyser-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtotracker 3min-Geyser|-1|[[1d10]]|0|3min Geyser blows'},
						{name:'5min-geyser-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtotracker 5min-Geyser|-1|[[1d10]]|0|5min Geyser blows'},
						{name:'AE-Aerial-Combat-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-header ^^cname^^ has finished Aerial Combat --fb-content Loses bonuses to to-hit and damage --strengthhit||-1 --strengthdmg||-4'},
						{name:'AE-Aerial-Combat-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-header ^^cname^^ is undertaking Aerial Combat --fb-content Gains +1 bonus to-hit and +4 bonus to damage --strengthhit||+1 --strengthdmg||+4'},
						{name:'Aid-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^\'s *Aid* has come to an end, and Thac0 \\amp HP return to normal\n!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1 --set ^^token_hp^^|[[{ {^^hp^^},{@{^^cname^^|aid^^tid^^} } }kl1]]'},
						{name:'Aid-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^ gains *Aid* from a Priest\'s god, improving Thac0 and HP\n!setattr --silent --name ^^cname^^ --aid^^tid^^|^^hp^^\n!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1 --set ^^token_hp^^|+[[1d8]]'},
						{name:'Armour-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --charid ^^cid^^ --ac|@{^^cname^^|armour-ac}\n/w "^^cname^^" ^^tname^^\'s AC has returned to normal as the Armour spell has ended.'},
						{name:'Armour-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --charid ^^cid^^ --armour-ac|^^ac^^ --ac|[[6+@{^^cname^^|dexdefense}]]\n/w "^^cname^^" ^^tname^^\'s AC has been made AC6 (adjusted by deterity to AC[[6+@{^^cname^^|dexdefense}]]) by the Armour spell. Once taken [[8+@{^^cname^^|level-class2}]]HP, end the spell using the [End Armour](!rounds --removetargetstatus ^^tid^^|armour) button'},
						{name:'Armour-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "^^cname^^" Has ^^tname^^ taken [[8+@{^^cname^^|level-class2}]]HP yet? If so, end the spell using the [End Armour](!rounds --removetargetstatus ^^tid^^|armour) button.'},
						{name:'Bad-Luck-1-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --strengthhit||+1 --wisdef||+1 --fb-public --fb-header ^^cname^^\'s Luck Has Changed --fb-content ^^cname^^ is no longer suffering from bad luck, and attack rolls and saving throws have returned to normal.'},
						{name:'Bad-Luck-1-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --strengthhit||-1 --wisdef||-1 --fb-public --fb-header ^^cname^^ is Suffering Bad Luck --fb-content ^^cname^^ starts to suffer bad luck on attack rolls and saving throws. An automatic penalty of -1 is applied to both.'},
						{name:'Barkskin-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|@{^^cname^^|Barkskin^^tid^^}\n^^cname^^\'s AC returns to normal as Barkskin fades'},
						{name:'Barkskin-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --Barkskin^^tid^^|^^ac^^\n!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|[[{ {^^ac^^}, {[[6-floor(@{^^cname^^|casting-level}/4)]]} }kl1]]\n^^cname^^\'s AC might have improved as they get Barkskin'},
						{name:'Bless-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod {{\n --ignore-selected\n --ids ^^tid^^\n --set ^^token_thac0^^|+1\n}}\n^^cname^^\'s Bless has expired and their Thac0 has returned to normal'},
						{name:'Bless-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^ has been blessed and their Thac0 has improved\n!token-mod {{\n --ignore-selected\n --ids ^^tid^^\n --set ^^token_thac0^^|-1\n}}'},
						{name:'Blindness-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-4 --set ^^token_thac0^^|-4\n!modattr --silent --name ^^cname^^ --init-mod|-2\n^^tname^^ has recovered from blindness and no longer suffers from penalties to attacks, AC and initiative'},
						{name:'Blindness-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+4 --set ^^token_thac0^^|+4\n!modattr --silent --name ^^cname^^ --init-mod|+2\n^^tname^^ has been blinded and suffers 4 penalty to attacks \\amp AC, and 2 penalty to initiative'},
						{name:'Boots-of-Dancing-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-header Boots of Dancing --fb-content ^^cname^^\'s feet have stopped dancing (for the moment?). AC and Saves penalties are reversed --AC|-4 --wisdef||6'},
						{name:'Boots-of-Dancing-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-header Boots of Dancing --fb-content ^^cname^^\'s feet have started to dance, but not in a helpful way. AC penalty of 4, and Saving Throws at penalty of 6. --AC|4 --wisdef||-6'},
						{name:'Boots-of-Flying-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --mi-charges ^^tid^^|-1|Boots-of-Flying||recharging'},
						{name:'CO-Heat-vs-Creature-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignoreselected --ids ^^tid^^ --set ^^token_ac^^|-1 ^^token_thac0^^|-1 --report character|"^^tname^^ is no longer hot and their Thac0 and AC return to normal"'},
						{name:'CO-Heat-vs-Creature-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignoreselected --ids ^^tid^^ --set ^^token_ac^^|+1 ^^token_thac0^^|+1 --report character|"^^tname^^ is weakened by heat and suffers a penalty of 1 to Thac0 and AC"'},
						{name:'CO-Heat-vs-PC-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-public --fb-header ^^cname^^ is no longer hot --fb-content ^^cname^^\'s Strength returns to _CUR0_, and Dexterity to _CUR1_ --strength|+1 --dexterity|+1'},
						{name:'CO-Heat-vs-PC-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-public --fb-header ^^cname^^ is weakened by heat --fb-content ^^cname^^\'s Strength is reduced by 1 to _CUR0_, and Dexterity by 1 to _CUR1_ --strength|-1 --dexterity|-1'},
						{name:'Candle-of-Invocation-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --silent --level-class3|-2\n^^tname^^ is no longer benefiting from the patronage of the gods of his alignment, and loses the temporarily 2 levels.'},
						{name:'Candle-of-Invocation-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --silent --level-class3|2\n^^tname^^ is benefiting from the patronage of the gods of his alignment, and is temporarily 2 levels higher.'},
						{name:'Candle-of-Invocation-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --mi-charges ^^tid^^|-1|candle-of-invocation'},
						{name:'Chant-ally-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --strengthdmg||-1 --strengthhit||-1\nThe attacks \\amp damage done by ^^tname^^ returns to normal as *Chant* ends'},
						{name:'Chant-ally-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --strengthdmg||+1 --strengthhit||+1\nThe attacks \\amp damage done by ^^tname^^ are improved by *Chant*'},
						{name:'Chant-foe-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --strengthdmg||+1 --strengthhit||+1\nThe attacks \\amp damage done by ^^tname^^ returns to normal as *Chant* ends'},
						{name:'Chant-foe-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --strengthdmg||-1 --strengthhit||-1\nThe attacks \\amp damage done by ^^tname^^ are hindered by *Chant*'},
						{name:'Cloud-Giant-Strength-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --silent --name ^^cname^^ --strength\n^^cname^^ returns to their normal strength'},
						{name:'Cloud-Giant-Strength-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|23|@{^^cname^^|strength}\n^^cname^^ gains enormous strength'},
						{name:'Constrict-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Constriction Damage}}{{Free=Once ^^tname^^ [breaks free](!rounds --removetargetstatus ^^tid^^|Giant Constrict) click here}}\n!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_hp^^|-[[1d3]] --report all|"{name} takes {^^token_hp^^:abschange} more damage from contriction"'},
						{name:'Cube-of-Force-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --charid @{^^cname^^|Cube-user} --repeating_potions_$@{^^cname^^|Cube-row}_potionqty|@{^^cname^^|hp}\n!token-mod --ignore-selected --ids ^^tid^^ --set layer|gmlayer'},
						{name:'Cube-of-Force-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modbattr --silent --charid @{^^cname^^|Cube-user} --repeating_potions_$@{^^cname^^|Cube-row}_potionqty|[[1-@{^^cname^^|Cube-charges}]]\n!modbattr --silent --charid ^^cid^^ --hp|[[1-@{^^cname^^|Cube-charges}]] \n!rounds --edit_status change %% ^^tid^^ %% cube-of-force %% duration %% [[{{[[@{^^cname^^|hp}-@{^^cname^^|Cube-charges}]]},{1}}kh1]] --edit_status change %% ^^tid^^ %% cube-of-force %% direction %% [[([[{{[[{{[[@{^^cname^^|hp}-@{^^cname^^|Cube-charges}]]},{1}}kl1]]},{0}}kh1]])-1]]'},
						{name:'Cube-of-Force-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --charid @{^^cname^^|Cube-user} --repeating_potions_$@{^^cname^^|Cube-row}_potionqty|[[{{[[@{^^cname^^|hp}-([[(1-([[{{[[@{Initiative|round-counter}%10]]},{1}}kl1]] )) *@{^^cname^^|Cube-charges}]])]]},{0}}kh1]]\n!modbattr --silent --charid ^^cid^^ --hp|[[(([[{{[[@{Initiative|round-counter}%10]]},{1}}kl1]])-1)*@{^^cname^^|Cube-charges}]]\n!rounds --edit_status change %% ^^tid^^ %% cube-of-force %% duration %% [[{{@{^^cname^^|hp}},{1}}kh1]] --edit_status change %% ^^tid^^ %% cube-of-force %% direction %% [[([[{{[[{{@{^^cname^^|hp}},{1}}kl1]]},{0}}kh1]])-1]]'},
						{name:'Curse-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1\n^^tname^^ has recovered from being *Cursed*'},
						{name:'Curse-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1\n^^tname^^ has been *Cursed*, which affects their attacks and morale'},
						{name:'Dancing-Longbow-dancing',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtargetstatus ^^tid^^|Longbow-is-Dancing|4|-1|The Longbow is Dancing by itself. Use this time wisely!|all-for-one\n!attk --quiet-modweap ^^tid^^|Dancing-Longbow|ranged|sb:0,db:0'},
						{name:'Dancing-Longbow-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --dance ^^tid^^|Dancing-Longbow'},
						{name:'Dancing-Longbow-inhand',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtargetstatus ^^tid^^|Dancing-Longbow|4|-1|Longbow not yet dancing so keep using it|stopwatch'},
						{name:'Dancing-Longbow-sheath',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --deltargetstatus ^^tid^^|Dancing-Longbow'},
						{name:'Dancing-Longbow-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --quiet-modweap ^^tid^^|Dancing-Longbow|ranged|+:+1'},
						{name:'Dancing-Quarterstaff-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --dance ^^tid^^|Quarterstaff-of-Dancing|stop'},
						{name:'Dancing-Quarterstaff-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --quiet-modweap ^^tid^^|quarterstaff-of-dancing|melee|+:+1 --quiet-modweap ^^tid^^|quarterstaff-of-dancing|dmg|+:+1'},
						{name:'Deafness-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --init-mod|-1\n^^tname^^ has recovered from deafness and no longer suffers an initiative penalty'},
						{name:'Deafness-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --init-mod|+1\n^^tname^^ has been deafened and suffers an initiative penalty, as well as other effects'},
						{name:'Divine-Favour-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^\'s Divine Favour has run its course, and their Thac0 returns to normal\n!token-mod {{\n --ignore-selected\n --ids ^^tid^^\n --set ^^token_thac0^^|+4\n}}'},
						{name:'Divine-Favour-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^ has been granted a Divine Favour and their Thac0 has improved by 4!\n!token-mod {{\n --ignore-selected\n --ids ^^tid^^\n --set ^^token_thac0^^|-4\n}}'},
						{name:'Djinni-Whirlwind-building-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --target caster|^^tid^^|Djinni-Whirlwind|99|0|Whirlwind now usable as transport or as a weapon|lightning-helix\n!magic --message ^^tid^^|Djinni Whirlwind|The whirlwind has now built to full speed and is usable as transport or as a weapon'},
						{name:'Enchanted-by-Scabbard-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --quiet-modweap ^^tid^^|@{^^cname^^|Scabbard-Weapon}|Melee|+:-1 --quiet-modweap ^^tid^^|@{^^cname^^|Scabbard-Weapon}|Dmg|+:-1 \n/w "^^cname^^" \\amp{template:default}{{name=Scabbard of Enchanting}}{{=^^tname^^, @{^^cname^^|Scabbard-Weapon} has now lost its additional enchantment from the Scabbard. [Sheath it again](!rounds --target caster|^^tid^^|Scabbard-of-Enchanting|10|-1|Enchanting a Sheathed weapon|stopwatch\\amp#13;!attk --weapon ^^tid^^|Sheath weapon in Scabbard of Enchanting - take new one in hand)}}'},
						{name:'Enfeeble-monster-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-2 ^^token_thac0_max^^|+2\nThe monster has recovered from being enfeebled'},
						{name:'Enfeeble-monster-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+2 ^^token_thac0_max^^|-2\nThe monster has been enfeebled'},
						{name:'Exhausted-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --charid ^^cid^^ --fb-from Effects --fb-header ^^cname^^ has recovered from Exhaustion --thac0-base|-2 --ac|-2 --strengthdmg||+2'},
						{name:'Faerie-fire-darkness-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-2\n^^tname^^ has lost that glow and is now harder to aim at'},
						{name:'Faerie-fire-darkness-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+2\n^^tname^^ is surrounded by Faerie Fire, and becomes much easier to hit'},
						{name:'Faerie-fire-twilight-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-1\n^^tname^^ has lost that glow and is now harder to aim at'},
						{name:'Faerie-fire-twilight-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+1\n^^tname^^ is surrounded by Faerie Fire, and becomes easier to hit'},
						{name:'Fire-Giant-Strength-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --silent --name ^^cname^^ --strength\n^^cname^^ returns to their normal strength'},
						{name:'Fire-Giant-Strength-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|22|@{^^cname^^|strength}\n^^cname^^ gains enormous strength'},
						{name:'Flaming-oil-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set layer|gmlayer '},
						{name:'Follow-the-Standard-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1'},
						{name:'Follow-the-Standard-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1'},
						{name:'Frost-Giant-Strength-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --silent --name ^^cname^^ --strength\n^^cname^^ returns to their normal strength'},
						{name:'Frost-Giant-Strength-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|21|@{^^cname^^|strength}\n^^cname^^ gains enormous strength'},
						{name:'GS-acid-dmg-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^ takes [[1d10]] HP of acid damage from the burning on their feet!'},
						{name:'Giant-Constrict-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Constriction Damage}}{{Free=Once ^^tname^^ [breaks free](!rounds --removetargetstatus ^^tid^^|Giant Constrict) click here}}\n!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_hp^^|-[[2d4]] --report all|"{name} takes {^^token_hp^^:abschange} more damage from contriction"'},
						{name:'Giant-Sea-Constrict-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Constriction Damage}}{{Free=Once ^^tname^^ [breaks free](!rounds --removetargetstatus ^^tid^^|Giant Sea Constrict) click here}}\n!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_hp^^|-[[3d6]] --report all|"{name} takes {^^token_hp^^:abschange} more damage from contriction"'},
						{name:'Giant-Snake-Poison-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Giant Snake Poison}}{{Poison=Save vs. Poison}}{{Succeed=^^tname^^ takes only damage from bite.}}{{Fail=^^tname^^ immediately **dies** from poisoning (and takes the damage from the bite...)}}'},
						{name:'Glitterdust-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-4 --set ^^token_thac0^^|-4\n!modattr --silent --name ^^cname^^ --init-mod|-2\n^^tname^^ has recovered from Glitterdust blindness and no longer suffers from penalties to attacks, AC and initiative'},
						{name:'Glitterdust-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+4 ^^token_thac0^^|+4\n!modattr --silent --name ^^cname^^ --init-mod|+2\n^^tname^^ has been blinded by glitterdust and suffers 4 penalty to attacks \\amp AC, and 2 penalty to initiative'},
						{name:'Hairy-Spider-Poison-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-1 ^^token_thac0^^|-1\n!modattr --silent --charid ^^cid^^ --dexterity|+3'},
						{name:'Hairy-Spider-Poison-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+1 ^^token_thac0^^|+1\n!modattr --silent --charid ^^cid^^ --dexterity|-3'},
						{name:'Haste-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --init-mod|2|-2\nOne year older, ^^cname^^ is back to normal'},
						{name:'Haste-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --init-mod|-2|2\nBeing *Hasted*, ^^cname^^ moves twice as fast and has twice the number of attacks\n'},
						{name:'Heroes-Feast-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1\nThe effects of Heroes Feast have worn off, and ^^tname^^ returns to normal'},
						{name:'Heroes-Feast-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1\nHaving eaten a Heroes Feast, ^^tname^^ gains benefits to attacks as well as other bonuses'},
						{name:'Heway-poison-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Water Poisoned by Heway}}{{Save=Save vs. Poison at +2 bonus}}{{Succeed=Take 15HP damage}}{{Fail=30HP damage \\amp paralysed for 1d6 hours}}\n/w gm \\amp{template:default}{{name=Heway Poison Paralysation}}{{=If creature failed to save, press [Paralysed](!rounds --target caster|^^tid^^|Paralysis|\\amp#91;[60*1d6]\\amp#93;|-1|Paralysed by water poisoned by a Heway snake|padlock) to add a status marker}}'},
						{name:'Hill-Giant-Strength-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --silent --name ^^cname^^ --strength\n^^cname^^ returns to their normal strength'},
						{name:'Hill-Giant-Strength-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|19|@{^^cname^^|strength}\n^^cname^^ gains enormous strength'},
						{name:'Infravision-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off has_night_vision\n"Who turned out the lights?" ^^tname^^ no longer has night vision.'},
						{name:'Infravision-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --on has_night_vision --set night_distance|60\n^^tname^^ has gained 60ft infravision, which brightens up their night!'},
						{name:'Invisibility-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+4\nBecoming visible means ^^cname^^\'s AC returns to normal'},
						{name:'Invisibility-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-4\nBeing invisible improves ^^cname^^\'s AC by 4'},
						{name:'Invulnerability-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+2\n^^tname^^ is no longer invulnerable-ish'},
						{name:'Invulnerability-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-2\n^^tname^^ becomes invulnerable to normal attacks from many creatures (but not all, and not magical attacks)'},
						{name:'Irritate-Rash-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --target single|^^tid^^|^^tid^^|Rash|99|0|Broken out in Rash all over, Charisma \\amp Dexterity reducing|radioactive'},
						{name:'Light-duration-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w gm **Delete the light spell token** - the light spell has ended'},
						{name:'Light-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-4 --set ^^token_thac0^^|-4\n^^tname^^ has recovered from blindness and no longer suffers from penalties to attacks and AC'},
						{name:'Light-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+4 --set ^^token_thac0^^|+4\n^^tname^^ has been blinded by light and suffers 4 penalty to attacks \\amp AC'},
						{name:'Lightbringer-mace-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off emits_bright_light emits_low_light\n^^cname^^ has commanded his mace to go dark'},
						{name:'Lightbringer-mace-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --on emits_bright_light emits_low_light --set bright_light_distance|15 low_light_distance|15\n^^cname^^\'s mace now shines as bright as a torch.'},
						{name:'Longbow-is-Dancing-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --dance ^^tid^^|Dancing-Longbow|stop'},
						{name:'Longbow-is-Dancing-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --quiet-modweap ^^tid^^|Dancing-Longbow|ranged|+:+1'},
						{name:'Nauseous-2-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --charid ^^cid^^ --strengthhit||+2\n^^tname^^ is no longer feeling nauseous, so is no longer subject to a penalty of 2 on attacks'},
						{name:'Nauseous-2-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --charid ^^cid^^ --strengthhit||-2\n^^tname^^ is feeling very nauseous and is now at a -2 penalty to hit on attacks'},
						{name:'Oil-fire-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Oil Fire Damage Round 2}}{{Damage=^^tname^^ takes another [1d6](!\\amp#13;\\amp#47;roll 1d6)HP of fire damage from the burning oil}}'},
						{name:'Oil-of-Fumbling-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:undefined}{{name=Oil of Fumbling}}{{desc=Anything ^^tname^^ holds seems incredibly slippery! ^^tname^^ has a 50% chance of dropping anything held, including weapons, spell components, scroll being read, the sandwich they are about to take a bite out of...}}{{desc1=Roll [d6](!\\amp#13;\\amp#47;r 1d6cf\\lt3cs\\gt4) to check if ^^tname^^ drops what they are holding}}'},
						{name:'Philter-of-Persuasiveness-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --fb-header ^^tname^^ Returns to Normal --fb-content ^^tname^^\'s persuasiveness has returned to _CUR0_ --chareact|-5'},
						{name:'Philter-of-Persuasiveness-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --fb-header ^^tname^^ Becomes More Persuasive --fb-content ^^tname^^\'s persuasiveness has improved by 5 to be _CUR0_ --chareact|+5'},
						{name:'Philter-of-Stammering-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --fb-header ^^tname^^ Returns to Normal --fb-content ^^tname^^\'s persuasiveness has returned to _CUR0_ --chareact|+5'},
						{name:'Philter-of-Stammering-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --fb-header ^^tname^^ Stammers \\amp Stutters --fb-content ^^tname^^ can\'t get their words straight and their persuasiveness has dropped to _CUR0_ --chareact|-5'},
						{name:'Poison-A-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type A}}{{Poison=Save vs. Poison or ^^tname^^ takes **[[15]]HP** of damage from poison. No damage taken if succeed}}'},
						{name:'Poison-B-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type B}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[1d3]]HP** damage. If fail ^^tname^^ takes **[[20]]HP** of damage from poison}}'},
						{name:'Poison-C-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type C}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[2d4]]HP** damage. If *fail* ^^tname^^ takes **[[25]]HP** of damage from poison}}'},
						{name:'Poison-D-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type D}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[2d6]]HP** damage. If *fail* ^^tname^^ takes **30HP** of damage from poison}}'},
						{name:'Poison-G-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type G}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[10]]HP** damage. If *fail* ^^tname^^ takes **[[20]]HP** of damage from poison}}'},
						{name:'Poison-H-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type H}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[10]]HP** damage. If *fail* ^^tname^^ takes **[[20]]HP** of damage from poison}}'},
						{name:'Poison-I-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type I}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[15]]HP** damage. If *fail* ^^tname^^ takes **[[30]]HP** of damage from poison}}'},
						{name:'Poison-J-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type J}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[20]]HP** damage. If *fail* ^^tname^^ immediately **dies** from poisoning}}'},
						{name:'Poison-K-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type K}}{{Poison=Save vs. Poison or ^^tname^^ takes **[[5HP]]** of damage from poison. If fail no damage is taken}}'},
						{name:'Poison-L-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type L}}{{Poison=Save vs. Poison or ^^tname^^ takes **[[10]]HP** of damage from poison. No damage taken if succeed}}'},
						{name:'Poison-M-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type M}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[5]]HP** damage. If *fail* ^^tname^^ takes **[[20]]HP** of damage from poison}}'},
						{name:'Poison-N-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type N}}{{Poison=Save vs. Poison. If *succeed*, ^^tname^^ takes **[[25]]HP** damage. If *fail* ^^tname^^ immediately **dies** from poisoning}}'},
						{name:'Poison-O-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type O}}{{Poison=Save vs. Poison or ^^tname^^ becomes [Paralysed](!rounds --target caster|^^tid^^|Paralysed|99|0|Paralysed by poison type O for [[2d6]] hours|padlock) by poison. No damage taken if succeed}}'},
						{name:'Poison-P-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type P}}{{Poison=Save vs. Poison or ^^tname^^ becomes [Debilitated](!rounds --target caster|^^tid^^|Debilitated|99|0|Debilitated by poison type P for [[1d3]] days|back-pain) by poison}}{{Effect=Debilitating poisons weaken the character for 1d3 days. All of the character\'s ability scores are reduced by half during this time. All appropriate adjustments to attack rolls, damage, Armor Class, etc., from the lowered ability scores are applied during the course of the illness. In addition, the character moves at one-half his normal movement rate. Finally, the character cannot heal by normal or magical means until the poison is neutralized or the duration of the debilitation is elapsed.}}{{Saved=No damage taken if save}}'},
						{name:'Poison-Snake-1-4-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Snake Poison 1-4}}{{Poison=Save vs. Poison at +3 bonus or ^^tname^^ becomes [Incapacitated](!rounds --target caster|^^tid^^|Paralysed|99|0|Incapacitatedby poison type P for [[2d4]] days|back-pain) by poison}}{{Effect=Incapacitating poisons weaken the character for 2 to 8 days. All of the character\'s ability scores are reduced by half during this time. All appropriate adjustments to attack rolls, damage, Armor Class, etc., from the lowered ability scores are applied during the course of the illness. In addition, the character moves at one-half his normal movement rate. Finally, the character cannot heal by normal or magical means until the poison is neutralized or the duration of the debilitation is elapsed.}}{{Saved=Only takes the damage from the bite}}'},
						{name:'Poison-Snake-12-14-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Snake Poison 12-14}}{{Poison=Save vs. Poison or ^^tname^^ takes **[[3d4]]HP** of damage from poison. If succeed only takes the damage from the bite}}'},
						{name:'Poison-Snake-15-17-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Snake Poison 15-17}}{{Poison=Save vs. Poison at -1 penalty or ^^tname^^ becomes [Incapacitated](!rounds --target caster|^^tid^^|Paralysed|99|0|Incapacitatedby poison type P for [[1d4]] days|back-pain) by poison}}{{Effect=Incapacitating poisons weaken the character for 1 to 4 days. All of the character\'s ability scores are reduced by half during this time. All appropriate adjustments to attack rolls, damage, Armor Class, etc., from the lowered ability scores are applied during the course of the illness. In addition, the character moves at one-half his normal movement rate. Finally, the character cannot heal by normal or magical means until the poison is neutralized or the duration of the debilitation is elapsed.}}{{Saved=Only takes the damage from the bite}}'},
						{name:'Poison-Snake-18-19-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Snake Poison 18-19}}{{Poison=Save vs. Poison at -2 penalty or ^^tname^^ becomes [Incapacitated](!rounds --target caster|^^tid^^|Paralysed|99|0|Incapacitatedby poison type P for [[1d12]] days|back-pain) by poison}}{{Effect=Incapacitating poisons weaken the character for 1 to 12 days. All of the character\'s ability scores are reduced by half during this time. All appropriate adjustments to attack rolls, damage, Armor Class, etc., from the lowered ability scores are applied during the course of the illness. In addition, the character moves at one-half his normal movement rate. Finally, the character cannot heal by normal or magical means until the poison is neutralized or the duration of the debilitation is elapsed.}}{{Saved=Only takes the damage from the bite}}'},
						{name:'Poison-Snake-20-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Snake Poison 20}}{{Poison=Save vs. Poison at -3 penalty}}{{Succeed=^^tname^^ only takes the damage from the bite}}{{Fail=^^tname^^ immediately **dies** from poisoning (and takes damage from the bite...)}}'},
						{name:'Poison-Snake-5-6-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Poison Type N}}{{Poison=Save vs. Poison at +2 bonus}}{{Succeed=^^tname^^ only takes the damage from the bite}}{{Fail=^^tname^^ immediately **dies** from poisoning (and takes damage from the bite...)}}'},
						{name:'Poison-Snake-7-11-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:default}{{name=Snake Poison 7-11}}{{Poison=Save vs. Poison at +1 bonus or ^^tname^^ takes **[[2d4]]HP** of damage from poison. If succeed only takes the damage from the bite}}'},
						{name:'Potion-of-Arms-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --change-hands ^^tid^^|-[[2*@{^^cname^^|Potion-of-Arms-doses}]]\n!delattr --charid ^^cid^^ --silent --Potion-of-Arms-doses'},
						{name:'Potion-of-Heroism-1-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-1]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+1\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-1-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|1 --hp|[[1d10+3]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content With a masterful fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-1\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-2-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-2]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+2\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-2-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|2 --hp|[[2d10+2]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content With a developing fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-2\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-3-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-3]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+3\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-3-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|3 --hp|[[3d10+1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content Just starting their fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-3\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-4-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|0 --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+4\n!attk --check-saves ^^tid^^'},
						{name:'Potion-of-Heroism-4-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|+4 --hp|[[4d10]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content An ordinary commoner, ^^tname^^ drinks a potion and is now suddenly a Level 4 Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-4\n!attk --check-saves ^^tid^^'},
						{name:'Prayer-ally-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1\n!modattr --silent --name ^^cname^^ --strengthdmg||-1\n^^cname^^ loses the benefit of *Prayer*'},
						{name:'Prayer-ally-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1\n!modattr --silent --name ^^cname^^ --strengthdmg||+1\n^^cname^^ gains the benefit of *Prayer*, with improved attacks and damage'},
						{name:'Prayer-foe-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1\n!modattr --silent --name ^^cname^^ --strengthdmg||+1\n^^cname^^ loses the impact of *Prayer*'},
						{name:'Prayer-foe-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1\n!modattr --silent --name ^^cname^^ --strengthdmg||-1\n^^cname^^ bears the penalties of *Prayer*, with worse attacks and damage'},
						{name:'Prot-from-Evil-10ft-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Prot-from-Evil-10ft-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius|10ft aura1_color|0ff'},
						{name:'Prot-from-Good-10ft-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Prot-from-Good-10ft-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius|10ft aura1_color|0ff'},
						{name:'Protection-vs-Acid-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'\\amp{template:undefined}{{name=Protection vs Acid}}{{desc=If taken 20 Hit Dice of damage, [End Protection](!rounds --removetargetstatus ^^tid^^|Protection-vs-Acid)}}'},
						{name:'Protection-vs-Cold-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Cold-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|10ft aura1_color|b4d8fc'},
						{name:'Protection-vs-Electricity-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Electricity-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|10ft aura1_color|b4d8fc'},
						{name:'Protection-vs-Elementals-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Elementals-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|10ft aura1_color|faf214'},
						{name:'Protection-vs-Fiends-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Fiends-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|8ft aura1_color|0ff'},
						{name:'Protection-vs-Fire-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Fire-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|15ft aura1_color|3f7fbf'},
						{name:'Protection-vs-Gas-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Gas-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|4ft aura1_color|f214fa'},
						{name:'Protection-vs-Lycanthropes-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Lycanthropes-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|8ft aura1_color|a40316'},
						{name:'Protection-vs-Magic-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Magic-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|4ft aura1_color|5beaf9'},
						{name:'Protection-vs-Petrification-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Petrification-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|4ft aura1_color|e7f95b'},
						{name:'Protection-vs-Plants-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Plants-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|4ft aura1_color|0ff'},
						{name:'Protection-vs-Shape-Changers-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Protection-vs-Shape-Changers-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --off aura1_square --set aura1_radius|8ft aura1_color|a40316'},
						{name:'Qstaff-Dancing-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --name ^^cname^^ --dancing-round|[[(([[@{^^cname^^|dancing-round}]])%4)+1]]'},
						{name:'Quarterstaff-of-Dancing-dancing',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtargetstatus ^^tid^^|Dancing-Quarterstaff|4|-1|The Quarterstaff is Dancing by itself. Use this time wisely!|all-for-one\n!attk --quiet-modweap ^^tid^^|quarterstaff-of-dancing|melee|sb:0 --quiet-modweap ^^tid^^|quarterstaff-of-dancing|dmg|sb:0'},
						{name:'Quarterstaff-of-Dancing-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --dance ^^tid^^|Quarterstaff-of-Dancing'},
						{name:'Quarterstaff-of-Dancing-inhand',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtargetstatus ^^tid^^|Quarterstaff-of-Dancing|4|-1|Quarterstaff not yet dancing so keep using it|stopwatch'},
						{name:'Quarterstaff-of-Dancing-sheath',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --deltargetstatus ^^tid^^|Quarterstaff-of-Dancing'},
						{name:'Quarterstaff-of-Dancing-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --quiet-modweap ^^tid^^|quarterstaff-of-dancing|melee|+:+1 --quiet-modweap ^^tid^^|quarterstaff-of-dancing|dmg|+:+1\nUpdating the quarterstaff +1 to attk \\amp dmg'},
						{name:'Rage-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --charid ^^cid^^ --fb-from Effects --fb-header ^^cname^^ is now Exhausted --thac0-base|+4 --ac|+4 --strengthdmg||[[-4]] --hp|-15\n!rounds --addtargetstatus ^^tid^^|Exhausted|10|-1|Exhausted - 2 worse on attk,dmg,ac|radioactive'},
						{name:'Rage-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --fb-public --charid ^^cid^^ --fb-from Effects --fb-header ^^cname^^ is Raging! --thac0-base|-2 --ac|-2 --strengthdmg||2 --hp|+15'},
						{name:'Ray-of-Enfeeblement-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|@{^^cname^^|strength|max}\n^^tname^^ has recovered from enfeeblement'},
						{name:'Ray-of-Enfeeblement-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|5|@{^^cname^^|strength}\n^^tname^^ has been enfeebled, with impact on strength affecting hits and damage!\n'},
						{name:'Regeneration-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_hp^^|+[[@{^^cname^^|conregen}]]! --report control|"{name} regenerates {^^token_hp^^:change} HP"'},
						{name:'Repel-Insects-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius| '},
						{name:'Repel-Insects-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set aura1_radius|10ft aura1_color|0ff'},
						{name:'Ring-of-Blinking-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "^^cname^^" ^^tname^^ has stopped bkinking and their ring needs to recharge for 1 hour before it can be used again\n!rounds --target caster|^^tid^^|Ring-of-Blinking-recharge|60|-1|Ring of Blinking is recharging|stopwatch'},
						{name:'Ring-of-Blinking-recharge-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "^^cname^^" ^^tname^^\'s Ring of Blinking has recharged and can now be used again\n!magic --mi-charges ^^tid^^|0|Ring-of-Blinking|1\n'},
						{name:'Rod-of-Flailing-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --ac|+4 --wisdef||-4 --fb-header ^^tid^^\'s Rod of Flailing charge is expended --fb-content ^^tid^^ looses their +4 bonus to AC and saving throws'},
						{name:'Rod-of-Flailing-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --ac|-4 --wisdef||+4 --fb-header ^^tid^^ uses Rod of Flailing charge --fb-content ^^tid^^ gains a +4 bonus to AC and saving throws'},
						{name:'Scabbard-Enchanting-draw-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --quiet-modweap ^^tid^^|@{^^cname^^|Equip-InHand}|Melee|+:+1 --quiet-modweap ^^tid^^|@{^^cname^^|Equip-InHand}|Dmg|+:+1\n!setattr --silent --charid ^^cid^^ --Scabbard-Weapon|@{^^cname^^|Equip-InHand}\n!rounds --target caster|^^tid^^|Enchanted-by-Scabbard|10|-1|Your blade has been improved by +1 by the Scabbard of Enchantment|all-for-one\n/w "^^cname^^" \\amp{template:default}{{name=Scabbard of Enchanting}}{{=^^tname^^, @{^^cname^^|Equip-InHand} is now an additional +1. [Sheath another blade](!rounds --target caster|^^tid^^|Scabbard-of-Enchanting|10|-1|Enchanting a Sheathed weapon|stopwatch)}}\n'},
						{name:'Scabbard-Enchanting-draw-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --weapon ^^tid^^|Draw your blade from the Scabbard of Enchanting, from next round it will be an additional +1. This round\'s action is now ***Change Weapon*** and you should not do anything else!'},
						{name:'Scabbard-of-Enchanting-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "^^cname^^" \\amp{template:default}{{name=Scabbard of Enchantment}}{{=The weapon in the *Scabbard of Enchantment* is now improved by +1. [Draw from Scabbard](!rounds --target caster|^^tid^^|Scabbard-Enchanting-draw|1|-1|The weapon from the Scabbard of Enchanting is being enchanted|all-for-one) or leave until the next melee \\amp use the *Scabbard* then to draw it.}}'},
						{name:'Scroll-of-Weakness-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --charid ^^cid^^ --strength --fb-public --fb-header ^^tname^^ is Feeling Stronger --fb-content ^^tname^^ feels strong again as their strength returns to _CUR0_'},
						{name:'Scroll-of-Weakness-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --strength|[[ceil(@{^^cname^^|strength}/2)]]|@{^^cname^^|strength} --fb-public --fb-header ^^tname^^ is Feeling Weak! --fb-content ^^tname^^ suddenly feels weak as their strength reduces from @{^^cname^^|strength} to _CUR0_'},
						{name:'Shield-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --^^token_ac^^|@{^^cname^^|Temp-AC}\n^^cname^^ loses his magic shield'},
						{name:'Shield-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --Temp-AC|@{^^ac^^} --^^token_ac^^|3\n^^cname^^ is shielded by magic.'},
						{name:'Slow-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-[[4+[[abs([[{{@{^^cname^^|norm_dexdefense}},{0}}kl1]])]]]] ^^token_thac0^^|-4\n!setattr --silent --name ^^cname^^ --dexreact|@{^^cname^^|norm_dexreact} --dexmissile|@{^^cname^^|norm_dexmissile} --dexdefense|@{^^cname^^|norm_dexdefense}\n^^tname^^ is moving at their normal speed again, and their AC and attacks have returned to normal'},
						{name:'Slow-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+[[4+[[abs([[{{@{^^cname^^|dexdefense}},{0}}kl1]])]]]] ^^token_thac0^^|+4\n!setattr --silent --name ^^cname^^ --norm_dexreact|@{^^cname^^|dexreact} --norm_dexmissile|@{^^cname^^|dexmissile} --norm_dexdefense|@{^^cname^^|dexdefense} --dexreact|[[{{@{^^cname^^|dexreact}},{0}}kl1]] --dexmissile|[[{{@{^^cname^^|dexmissile}},{0}}kl1]] --dexdefense|[[{{@{^^cname^^|dexdefense}},{0}}kh1]]\n^^tname^^ is moving in slow motion, with worse AC and attacks '},
						{name:'Snake-Poison-3-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'^^cname^^ takes [[2d4]]hp of damage from the poison injected by the snake that bit them.'},
						{name:'Something-wrong-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtargetstatus ^^tid^^|GS-Acid-dmg|99|0|Take acid damage to feet|tread'},
						{name:'Spectral-hand-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-from Effects --fb-header ^^tname^^\'s Spectral Hand fades away --fb-content They can no longer cast L1-4 touch spells at a distance, and Thac0 returns to _CUR0_ --thac0|+2'},
						{name:'Spectral-hand-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --charid ^^cid^^ --fb-from Effects --fb-header ^^tname^^ uses Spectral Hand --fb-content By doing so, they can cast L1-4 touch spells at a distance at +2, so Thac0 is now _CUR0_ --thac0|-2'},
						{name:'Spiritual-Hammer-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!attk --blank-weapon ^^tid^^|Spiritual-Hammer|silent'},
						{name:'Stone-Giant-Strength-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --silent --name ^^cname^^ --strength\n^^cname^^ returns to their normal strength'},
						{name:'Stone-Giant-Strength-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|20|@{^^cname^^|strength}\n^^cname^^ gains enormous strength'},
						{name:'Storm-Giant-Strength-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!resetattr --silent --name ^^cname^^ --strength\n^^cname^^ returns to their normal strength'},
						{name:'Storm-Giant-Strength-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --name ^^cname^^ --strength|24|@{^^cname^^|strength}\n^^cname^^ gains enormous strength'},
						{name:'Strength-Drain-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --charid ^^cid^^ --strength|@{^^cname^^|strength|max}\n^^tname^^ is feeling somewhat stronger, back to their normal self... perhaps...'},
						{name:'Stun-Dart-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --caster|^^tid^^|slow|4|-1|Slowly recovering from the effects of the Stun Dart gas, penalty of 4 to attks \\amp AC, slower initiative \\amp no dex bonuses|snail'},
						{name:'Sunlight-1-toHit-Penalty-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-1'},
						{name:'Sunlight-1-toHit-Penalty-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+1'},
						{name:'Super-heroism-1-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-2]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+2\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-1-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|2 --hp|[[1d10+3]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content With a ledgendary fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-2\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-2-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-3]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+3\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-2-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|3 --hp|[[2d10+3]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content With a masterful fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-3\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-3-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-4]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+4\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-3-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|4 --hp|[[3d10+2]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content With a developing fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-4\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-4-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|[[@{^^cname^^|level-class1}-5]] --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+5\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-4-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|5 --hp|[[4d10+1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content Just starting their fighting career, ^^tname^^ drinks a potion and is now suddenly a Level _CUR0_ Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-5\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-5-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --level-class1|0 --hp|[[{ {@{^^cname^^|pot-heroism-hp}},{@{^^cname^^|hp}}}kl1]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ becomes less experienced --fb-content ^^tname^^ loses their improved abilities as a fighter, and returns to being Level _CUR0_, now with _CUR1_ Hit Points\n!delattr --silent --charid ^^cid^^ --pot-heroism-hp\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|+6\n!attk --check-saves ^^tid^^'},
						{name:'Super-heroism-5-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --charid ^^cid^^ --silent --pot-heroism-hp|@{^^cname^^|hp}\n!modattr --charid ^^cid^^ --level-class1|+6 --hp|[[5d10]] --fb-public --fb-from ^^tname^^ --fb-header ^^tname^^ has become more experienced! --fb-content An ordinary commoner, ^^tname^^ drinks a potion and is now suddenly a Level 6 Fighter with _CUR1_ Hit Points\n!token-mod --ignore-selected --ids ^^tid^^ --set bar2_value|-6\n!attk --check-saves ^^tid^^'},
						{name:'Tashas-UHL-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --strength|2\n^^cname^^ stops laughing and regains strength'},
						{name:'Tashas-UHL-monster-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|-2 ^^token_thac0_max^^|+2\nThe monster regains strength as they stop laughing'},
						{name:'Tashas-UHL-monster-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_thac0^^|+2 ^^token_thac0_max^^|-2\nThe monstr loses strength as they laugh so hard!'},
						{name:'Tashas-UHL-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!modattr --silent --name ^^cname^^ --strength|-2\n^^cname^^ loses strength as they laugh so hard!'},
						{name:'Thunderclap-stun-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!rounds --addtargetstatus ^^tid^^|Thunderclap-deaf|[[1d2]]|-1|No longer stunned, but still deafened by the thunderclap|interdiction\n/w gm ^^tname^^ is no longer stunned by the thunderclap, but is still deafened from it'},
						{name:'Underwater-infravision-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set night_vision|yes night_distance|+60'},
						{name:'Underwater-infravision-stop',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!token-mod --ignore-selected --ids ^^tid^^ --set night_distance|-60'},
						{name:'VT-bonus-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --fb-public --fb-from Effects --fb-header ^^tname^^ looses their vampiric hit point bonus --fb-content ^^tname^^\'s HP return to _CUR0_ as the effects of the Vampiric Touch spell fade away --charid ^^cid^^ --hp|[[{{@{^^cname^^|VT-original-hp}},{@{^^cname^^|hp}}}kl1]]'},
						{name:'Vampiric-touch-start',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "^^cname^^" \\amp{template:default}{{name=Vampiric Touch}}{{desc=^^tname^^ has cast Vampiric Touch, but needs to [touch the enemy](~MU-Spells-DB|VT-Attack) as a normal attack to drain their hit points}}'},
						{name:'Vampiric-touch-turn',type:'',ct:'0',charge:'uncharged',cost:'0',body:'/w "^^cname^^" \\amp{template:default}{{name=Vampiric Touch}}{{desc=^^tname^^ has cast Vampiric Touch, but needs to [touch the enemy](~MU-Spells-DB|VT-Attack) as a normal attack to drain their hit points}}'},
						{name:'Water-trap-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!roll20AM --audio,play|Glasses breaking\n!roll20AM --audio,play|breaking-window\n!token-mod --ignore-selected --ids @{^^cname^^|water-id} --set layer|objects\n/w gm Read Rm26 notes on Breaking Glass for full description of effects'},
						{name:'Weak-Ring-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!setattr --silent --charid ^^cid^^ --strength|[[{{[[@{^^cname^^|strength}-1]]},{3}}kh1]] --constitution|[[{{[[@{^^cname^^|constitution}-1]]},{3}}kh1]]\n!rounds --target caster|^^tid^^|^^tid^^|Weak Ring|100|-10||blank'},
						{name:'WoI-Audible-Illusion-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --message ^^tid^^|Wand of Illusion|Would you like to continue concentrating on the illusion? If so [;click here];\\lpar;!magic ~~mi-charges ^^tid^^|;-1|;Wand-of-Illusion\\amp#13;!rounds ~~target caster|;^^tid^^|;WoI Audible Illusion|;10|;-10|;An audible illusion with no visual component cast from a Wand of Illusion|;half-haze\\rpar;'},
						{name:'WoI-Audio-Visual-Illusion-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --message ^^tid^^|Wand of Illusion|Would you like to continue concentrating on the illusion? If so [;click here];\\lpar;!magic ~~mi-charges ^^tid^^|;-2|;Wand-of-Illusion\\amp#13;!rounds ~~target caster|;^^tid^^|;WoI Audio-Visual Illusion|;10|;-10|;An illusion with both audible and visual components cast from a Wand of Illusion|;lightning-helix\\rpar;'},
						{name:'WoI-Visual-Illusion-end',type:'',ct:'0',charge:'uncharged',cost:'0',body:'!magic --message ^^tid^^|Wand of Illusion|Would you like to continue concentrating on the illusion? If so [;click here];\\lpar;!magic ~~mi-charges ^^tid^^|;-1|;Wand-of-Illusion\\amp#13;!rounds ~~target caster|;^^tid^^|;WoI Visual Illusion|;10|;-10|;A visual illusion with no audible component cast from a Wand of Illusion|;ninja-mask\\rpar;'},
					]},
	});

	const dbTypeLists = {
		Miscellaneous:	{type:'Miscellaneous',field:fields.ItemMiscList},
		Light:			{type:'Miscellaneous',field:fields.ItemMiscList},
		Weapon:			{type:'Weapon',field:fields.ItemWeaponList},
		Melee:			{type:'Weapon',field:fields.ItemWeaponList},
		Ranged:			{type:'Weapon',field:fields.ItemWeaponList},
		Ammo:			{type:'Weapon',field:fields.ItemWeaponList},
		Armour:			{type:'Armour',field:fields.ItemArmourList},
		Ring:			{type:'Ring',field:fields.ItemRingList},
		Potion:			{type:'Potion',field:fields.ItemPotionList},
		Scroll:			{type:'Scroll',field:fields.ItemScrollList},
		Rod:			{type:'Rod',field:fields.ItemWandsList},
		Staff:			{type:'Rod',field:fields.ItemWandsList},
		Wand:			{type:'Rod',field:fields.ItemWandsList},
		MUspellL1:		{type:'MUspellL1',field:['spellmem','current']},
		MUspellL2:		{type:'MUspellL2',field:['spellmem2','current']},
		MUspellL3:		{type:'MUspellL3',field:['spellmem3','current']},
		MUspellL4:		{type:'MUspellL4',field:['spellmem4','current']},
		MUspellL5:		{type:'MUspellL5',field:['spellmem30','current']},
		MUspellL6:		{type:'MUspellL6',field:['spellmem5','current']},
		MUspellL7:		{type:'MUspellL7',field:['spellmem6','current']},
		MUspellL8:		{type:'MUspellL8',field:['spellmem7','current']},
		MUspellL9:		{type:'MUspellL9',field:['spellmem8','current']},
		MUspellL0:		{type:'MUspellL0',field:['spellmem20','current']},
		PRspellL1:		{type:'PRspellL1',field:['spellmem10','current']},
		PRspellL2:		{type:'PRspellL2',field:['spellmem11','current']},
		PRspellL3:		{type:'PRspellL3',field:['spellmem12','current']},
		PRspellL4:		{type:'PRspellL4',field:['spellmem13','current']},
		PRspellL5:		{type:'PRspellL5',field:['spellmem14','current']},
		PRspellL6:		{type:'PRspellL6',field:['spellmem15','current']},
		PRspellL7:		{type:'PRspellL7',field:['spellmem16','current']},
		PRspellL0:		{type:'PRspellL0',field:['spellmem17','current']},
		Power:			{type:'Power',field:['spellmem23','current']},
	};

	var flags = {
		rw_state: RW_StateEnum.STOPPED, image: true,
		rotation: true,
		animating: false,
		archive: false,
		clearonclose: false,
		// RED: clear turnOrder on new round if true
		clearonnewround: true,
		// RED: determine turnorder sort order on new round
		newRoundSort: TO_SortEnum.NUMASCEND,
		// RED: v1.207 determine if ChatSetAttr is present
		canSetAttr: true,
		// RED: v1.207 determine if Initiative character sheet is present
		canSetRoundCounter: true,
		// RED: v2.007 added to allow roundMaster to work with initMaster
		canUseInitMaster: true,
		// RED: v1.301 determine if all markers must be unique
		uniqueMarkers: false,
		// RED: v4.032 determine if missing libraries should be notified
		notifyLibErr: true
	};
	
	var design = {
		turncolor: '#D8F9FF',
		roundcolor: '#363574',
		statuscolor: '#F0D6FF',
		statusbgcolor: '#897A87',
		statusbordercolor: '#430D3D',
		edit_icon: 'https://s3.amazonaws.com/files.d20.io/images/11380920/W_Gy4BYGgzb7jGfclk0zVA/thumb.png?1439049597',
		delete_icon: 'https://s3.amazonaws.com/files.d20.io/images/11381509/YcG-o2Q1-CrwKD_nXh5yAA/thumb.png?1439051579',
		settings_icon: 'https://s3.amazonaws.com/files.d20.io/images/11920672/7a2wOvU1xjO-gK5kq5whgQ/thumb.png?1440940765', 
		apply_icon: 'https://s3.amazonaws.com/files.d20.io/images/11407460/cmCi3B1N0s9jU6ul079JeA/thumb.png?1439137300'
	};
	
	var aoeImages = Object.freeze ({
		ACID:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331456697/fK6w6GuAWAi-iqIuOQYGJw/thumb.png?1678211835',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470528/Fx2pfAZGUG9bUrWifIsdjA/thumb.png?1678218097',
				 BOLT:	 	'https://s3.amazonaws.com/files.d20.io/images/250364885/1iJyxTjkOYhLc5l-b9k5YQ/thumb.png?1634238992',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250364901/UMOTJRtZBfs-2kIMQdHmkQ/thumb.png?1634238999',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250364917/jidptAhe0zyUj3GERQj3CA/thumb.png?1634239006',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250364901/UMOTJRtZBfs-2kIMQdHmkQ/thumb.png?1634238999',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250365029/dey5IsSH-Ndzzv6RYxqVJQ/thumb.png?1634239057',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250365029/dey5IsSH-Ndzzv6RYxqVJQ/thumb.png?1634239057'},
		COLD:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331458150/rLhZcyN5uLqbgbSDzKnzGQ/thumb.png?1678212486',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470565/l25HNGIVmshY7fhYFx8L3w/thumb.png?1678218110',
				 BOLT:   	'https://s3.amazonaws.com/files.d20.io/images/250365049/6jB7qYbNL0SXpGj2_b3hiw/thumb.png?1634239066',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250365063/1s-17jF8nj5ceyI6CVdl9Q/thumb.png?1634239072',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250334846/UTt7fuOj_v-PxiZP-2YwpQ/thumb.png?1634226450',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250365063/1s-17jF8nj5ceyI6CVdl9Q/thumb.png?1634239072',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250365292/gftCVVIY-it7-rUDj60Fig/thumb.png?1634239180',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250365292/gftCVVIY-it7-rUDj60Fig/thumb.png?1634239180'},
		DARK:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331465372/4xhQw7dl3WJwnI5EmbMTug/thumb.png?1678215808',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470590/8GdV9UP4OYdit3eLm79tew/thumb.png?1678218122',
				 BOLT:   	'https://s3.amazonaws.com/files.d20.io/images/250365316/jtYu-J2HDivQ7l4nuMq3dQ/thumb.png?1634239190',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250365330/90rdp0d39Nx3-C8bf4u_Hg/thumb.png?1634239196',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250365553/Pj1CQ1D2yPooTYEhrFjuXw/thumb.png?1634239309',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250365330/90rdp0d39Nx3-C8bf4u_Hg/thumb.png?1634239196',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250365570/Gh-4SRf-jrguKzn23L0G6g/thumb.png?1634239314',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250365570/Gh-4SRf-jrguKzn23L0G6g/thumb.png?1634239314'},
		FIRE:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331465405/jD3yp7JT9I5BZ66mu9Qkfg/thumb.png?1678215824',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470617/CM7PFFy_3Tc1NejNlVYRbw/thumb.png?1678218132',
				 BOLT:   	'https://s3.amazonaws.com/files.d20.io/images/250365584/SvQAEtcyM-TdxRlc6bbJiw/thumb.png?1634239320',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250365798/9zHnGGJsw0rhpEx0llfqgw/thumb.png?1634239400',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250333443/ZPyK7EPeiLp3y0V40SDaQw/thumb.png?1634225721',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250365798/9zHnGGJsw0rhpEx0llfqgw/thumb.png?1634239400',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250365814/HB7bJNTar3xasqz7X9W5bg/thumb.png?1634239406',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250365814/HB7bJNTar3xasqz7X9W5bg/thumb.png?1634239406'},
		LIGHT:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331465433/FFt07jFHTw4m1vH_NfqJ0w/thumb.png?1678215837',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470649/zpWxO41lFZtcby_iNn-Qug/thumb.png?1678218142',
				 BOLT:   	'https://s3.amazonaws.com/files.d20.io/images/250365820/DI-LYWLxPj0GP5wwRJtwag/thumb.png?1634239412',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250365961/PkFip9NS6_O6hs6pnR8aBg/thumb.png?1634239466',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250365973/HfejMDi_2_MkcgJUYpqUYw/thumb.png?1634239471',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250365961/PkFip9NS6_O6hs6pnR8aBg/thumb.png?1634239466',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250365985/WFrMhE6VZE1VCAOjx3LnkA/thumb.png?1634239477',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250365985/WFrMhE6VZE1VCAOjx3LnkA/thumb.png?1634239477'},
		LIGHTNING:{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331465538/9CSJ8IhZFQOMcvNrbOI9Aw/thumb.png?1678215891',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470678/yFu8pdegShj_x5Wb4tDLOQ/thumb.png?1678218153',
				 BOLT: 		'https://s3.amazonaws.com/files.d20.io/images/250366001/tkb8HFMptLHL2vqjuf840g/thumb.png?1634239484',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250366246/TVN6nx3g5mPDJzZeN-O8Rw/thumb.png?1634239596',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250366391/HYkDYIx_aNGmTxl3T9iyEQ/thumb.png?1634239664',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250366246/TVN6nx3g5mPDJzZeN-O8Rw/thumb.png?1634239596',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250366617/6YX4WunRuiQ1C4B65RHY5A/thumb.png?1634239765',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250366617/6YX4WunRuiQ1C4B65RHY5A/thumb.png?1634239765'},
		MAGIC:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331465555/3MnHN1bNCW8xdLjj-nN9cQ/thumb.png?1678215901',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331470703/hCUwxBEdR98Md2wTyQuWjw/thumb.png?1678218164',
				 BOLT:   	'https://s3.amazonaws.com/files.d20.io/images/250366823/oX0JRhH3wLUk-3lNMOKrxg/thumb.png?1634239839',
				 CIRCLE: 	'https://s3.amazonaws.com/files.d20.io/images/250366882/XDc_tvXiMAcYbCLr_eWKOQ/thumb.png?1634239877',
				 CONE:   	'https://s3.amazonaws.com/files.d20.io/images/250367109/enzpndcQDrax2XI_KnXMmA/thumb.png?1634239955',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250366882/XDc_tvXiMAcYbCLr_eWKOQ/thumb.png?1634239877',
				 RECTANGLE: 'https://s3.amazonaws.com/files.d20.io/images/250367267/GUGEGqGSoNp6DwprW2NYBg/thumb.png?1634240001',
				 SQUARE: 	'https://s3.amazonaws.com/files.d20.io/images/250367267/GUGEGqGSoNp6DwprW2NYBg/thumb.png?1634240001'},
		COLOR:	{ARC180:	'https://s3.amazonaws.com/files.d20.io/images/331581981/fqQcmnlLdC3PQvU7A4gY7A/thumb.png?1678295001',
				 ARC90:		'https://s3.amazonaws.com/files.d20.io/images/331581976/Rqe8McypnUdxVe4mUBW1-g/thumb.png?1678294994',
				 BOLT:		'https://s3.amazonaws.com/files.d20.io/images/250450699/N-DlZe7PhXIrn2DtS3vk_A/thumb.png?1634281345',
				 CIRCLE:	'https://s3.amazonaws.com/files.d20.io/images/250450680/2SS_5Or7fNrfwpmCHj7n7A/thumb.png?1634281318',
				 CONE:		'https://s3.amazonaws.com/files.d20.io/images/250318958/dFggs3eDRDXntGCEHDUbVw/thumb.png?1634215364',
				 ELIPSE:	'https://s3.amazonaws.com/files.d20.io/images/250450680/2SS_5Or7fNrfwpmCHj7n7A/thumb.png?1634281318',
				 RECTANGLE:	'https://s3.amazonaws.com/files.d20.io/images/250450699/N-DlZe7PhXIrn2DtS3vk_A/thumb.png?1634281345',
				 SQUARE:	'https://s3.amazonaws.com/files.d20.io/images/250450699/N-DlZe7PhXIrn2DtS3vk_A/thumb.png?1634281345'},
	});
		
	var reIgnore = /[\s\-\_]*/gi;
	
	var	replacers = [
			[/\\amp/gm, "&"],
			[/\\lbrak/gm, "["],
			[/\\rbrak/gm, "]"],
			[/\\ques/gm, "?"],
			[/\\at/gm, "@"],
			[/\\dash/gm, "-"],
			[/\\n/gm, "\n"],
			[/\\vbar/gm, "|"],
			[/\\clon/gm, ":"],
			[/\\gt/gm, ">"],
			[/\\lt/gm, "<"],
		];

	var statusMarkers = Object.freeze([
		{name:"red",img:'https://s3.amazonaws.com/files.d20.io/images/8123890/TkC_M8_6X-UHy8euEymakQ/thumb.png?1425804412'},
		{name:"blue",img:'https://s3.amazonaws.com/files.d20.io/images/8123884/pV7HJJVqORAhrOftpmVHUw/thumb.png?1425804373'},
		{name:"green",img:'https://s3.amazonaws.com/files.d20.io/images/8123885/sbim5jTRF3XsuSs01ycKrg/thumb.png?1425804385'},
		{name:"brown",img:'https://s3.amazonaws.com/files.d20.io/images/8123886/q0axCUI6vBsvDGOwFbsBXw/thumb.png?1425804393'},
		{name:"purple",img:'https://s3.amazonaws.com/files.d20.io/images/8123889/xEOFbIKegEaFgN0vLnzG0g/thumb.png?1425804406'},
		{name:"pink",img:'https://s3.amazonaws.com/files.d20.io/images/8123887/iyJDiq2Ngwuh6Si3-FLztQ/thumb.png?1425804400'},
		{name:"yellow",img:'https://s3.amazonaws.com/files.d20.io/images/8123892/oL21nVVRUpDjGLaHXftstQ/thumb.png?1425804422'},
		{name:"dead",img:'https://s3.amazonaws.com/files.d20.io/images/8093499/ca_OFvFT0w_MtJKY6c83Ew/thumb.png?1425688175'},
		{name:"skull",img:'https://s3.amazonaws.com/files.d20.io/images/8074161/wpqmZJQlkzmyee0_lsNv4A/thumb.png?1425598594'},
		{name:"sleepy",img:'https://s3.amazonaws.com/files.d20.io/images/8074159/PaeQH3jsdmPbUOiODPx5fg/thumb.png?1425598590'},
		{name:"half-heart",img:'https://s3.amazonaws.com/files.d20.io/images/8074186/k5X_UUMwcuq1LZjEL58mpA/thumb.png?1425598650'},
		{name:"half-haze",img:'https://s3.amazonaws.com/files.d20.io/images/8074190/YvdObVqX0hT711vcbML7OA/thumb.png?1425598654'},
		{name:"interdiction",img:'https://s3.amazonaws.com/files.d20.io/images/8074185/cyt6rWIaUiMvq-4CnpskZQ/thumb.png?1425598647'},
		{name:"snail",img:'https://s3.amazonaws.com/files.d20.io/images/8074158/YDHHfsu8T8wcqbby33fweA/thumb.png?1425598587'},
		{name:"lightning-helix",img:'https://s3.amazonaws.com/files.d20.io/images/8074184/iUPFB-lXP9ySnktTut-3uA/thumb.png?1425598643'},
		{name:"spanner",img:'https://s3.amazonaws.com/files.d20.io/images/8074154/2qufcEnyNJqjSN_f9XrgiQ/thumb.png?1425598583'},
		{name:"chained-heart",img:'https://s3.amazonaws.com/files.d20.io/images/8074213/f6jmFoQWX-7KRsux_HaIqg/thumb.png?1425598699'},
		{name:"chemical-bolt",img:'https://s3.amazonaws.com/files.d20.io/images/8074212/B-U3tyYf06An3NonHrh1xA/thumb.png?1425598696'},
		{name:"death-zone",img:'https://s3.amazonaws.com/files.d20.io/images/8074210/CPzQbQ8h-vZnNinShD1L_Q/thumb.png?1425598689'},
		{name:"drink-me",img:'https://s3.amazonaws.com/files.d20.io/images/8074207/bElenkvmnfe15u6e23_XxQ/thumb.png?1425598686'},
		{name:"edge-crack",img:'https://s3.amazonaws.com/files.d20.io/images/8074206/7N52ErC13lHDxRwrt-igyQ/thumb.png?1425598682'},
		{name:"ninja-mask",img:'https://s3.amazonaws.com/files.d20.io/images/8074181/XDbfFm8Ul3Iy7zkiDB321w/thumb.png?1425598638'},
		{name:"stopwatch",img:'https://s3.amazonaws.com/files.d20.io/images/8074152/UW9235lWLTTryx6zCP2MQA/thumb.png?1425598581'},
		{name:"fishing-net",img:'https://s3.amazonaws.com/files.d20.io/images/8074205/v83unarpA-nUZqp2HKOr0w/thumb.png?1425598678'},
		{name:"overdrive",img:'https://s3.amazonaws.com/files.d20.io/images/8074178/CYZFHZzMBdssRjoxWvP7MQ/thumb.png?1425598630'},
		{name:"strong",img:'https://s3.amazonaws.com/files.d20.io/images/8074151/DHoYUsnyz2AOaTVGR5mV7A/thumb.png?1425598577'},
		{name:"fist",img:'https://s3.amazonaws.com/files.d20.io/images/8074201/GZ0py5UxO7pFUOfobTKGVw/thumb.png?1425598674'},
		{name:"padlock",img:'https://s3.amazonaws.com/files.d20.io/images/8074174/euydq4AuqYk_7y0GqObChw/thumb.png?1425598626'},
		{name:"three-leaves",img:'https://s3.amazonaws.com/files.d20.io/images/8074149/3GodR7irhqJXoQcfm7tkng/thumb.png?1425598573'},
		{name:"fluffy-wing",img:'https://s3.amazonaws.com/files.d20.io/images/8093436/nozRPKmjhulSuQZO-NV7xw/thumb.png?1425687966'},
		{name:"pummeled",img:'https://s3.amazonaws.com/files.d20.io/images/8074171/pPhgEmVHP6bHMbcj-wn98g/thumb.png?1425598619'},
		{name:"tread",img:'https://s3.amazonaws.com/files.d20.io/images/8074145/-hBmfcug0Bhr7nWxXMNd1A/thumb.png?1425598570'},
		{name:"arrowed",img:'https://s3.amazonaws.com/files.d20.io/images/8074234/Z48uPYYNGR5iD4DEy3RYbA/thumb.png?1425598735'},
		{name:"aura",img:'https://s3.amazonaws.com/files.d20.io/images/8074231/g6ogG9gDMBsIG_fdx-Hl5w/thumb.png?1425598731'},
		{name:"back-pain",img:'https://s3.amazonaws.com/files.d20.io/images/8074229/xdGkbAHaELU5HK9rpMUZkg/thumb.png?1425598727'},
		{name:"black-flag",img:'https://s3.amazonaws.com/files.d20.io/images/8074226/mJgQqm9Hl3ek75xoXcecVg/thumb.png?1425598724'},
		{name:"bleeding-eye",img:'https://s3.amazonaws.com/files.d20.io/images/8074224/IdGVnqxciFoDI6dXLyoSgA/thumb.png?1425598720'},
		{name:"bolt-shield",img:'https://s3.amazonaws.com/files.d20.io/images/8074221/8E3S_XJF1rpkYmkQc7iwcw/thumb.png?1425598713'},
		{name:"broken-heart",img:'https://s3.amazonaws.com/files.d20.io/images/8074218/ylXLOkQFHyAaj6kumKEaOw/thumb.png?1425598709'},
		{name:"cobweb",img:'https://s3.amazonaws.com/files.d20.io/images/8074211/KNY0AO4fj2md_M2n6Uf4IQ/thumb.png?1425598692'},
		{name:"broken-shield",img:'https://s3.amazonaws.com/files.d20.io/images/8074217/wV6Cx457yk_jTwjKzWRVXw/thumb.png?1425598706'},
		{name:"flying-flag",img:'https://s3.amazonaws.com/files.d20.io/images/8074198/n2hH7I_YrEXNYb1jh0Oo5Q/thumb.png?1425598670'},
		{name:"radioactive",img:'https://s3.amazonaws.com/files.d20.io/images/8074167/4zCBr9YKxZvRuhDo2VWQnQ/thumb.png?1425598611'},
		{name:"trophy",img:'https://s3.amazonaws.com/files.d20.io/images/8074143/QVNHRiiQ56k6Mn2rro3_bg/thumb.png?1425598567'},
		{name:"broken-skull",img:'https://s3.amazonaws.com/files.d20.io/images/8074215/rTI3ahu2dE3VKO-W7i3jcw/thumb.png?1425598702'},
		{name:"frozen-orb",img:'https://s3.amazonaws.com/files.d20.io/images/8074197/K7xZkKvW0GeMvwkm8VfxTg/thumb.png?1425598666'},
		{name:"rolling-bomb",img:'https://s3.amazonaws.com/files.d20.io/images/8074165/fd9kK4Peiprwr8wyI_pcEQ/thumb.png?1425598604'},
		{name:"white-tower",img:'https://s3.amazonaws.com/files.d20.io/images/8074141/M5p2-7dryUVxCJjhUcJe5Q/thumb.png?1425598564'},
		{name:"grab",img:'https://s3.amazonaws.com/files.d20.io/images/8074194/tfeQLEm-AmBi_IMF-h8vEg/thumb.png?1425598663'},
		{name:"screaming",img:'https://s3.amazonaws.com/files.d20.io/images/8074163/CwKqOWu7ZprFzkkcafs8cQ/thumb.png?1425598601'},
		{name:"grenade",img:'https://s3.amazonaws.com/files.d20.io/images/8074191/dd_UjtADigCKYzcP4RBCVg/thumb.png?1425598657'},
		{name:"sentry-gun",img:'https://s3.amazonaws.com/files.d20.io/images/8074162/rlpAA3Eg04Ct8csKCjbcdQ/thumb.png?1425598597'},
		{name:"all-for-one",img:'https://s3.amazonaws.com/files.d20.io/images/8074239/2VxQwqrsz5BXvXIkraKE1g/thumb.png?1425598746'},
		{name:"angel-outfit",img:'https://s3.amazonaws.com/files.d20.io/images/8074238/dKSnapoJ7JyGcINc8PIA1Q/thumb.png?1425598742'},
		{name:"archery-target",img:'https://s3.amazonaws.com/files.d20.io/images/8074237/ei4JHB51P6az3slwgZmTEw/thumb.png?1425598739'},
		{name:"blank",img:''}
	]);

	var handouts = Object.freeze({
	RoundMaster_Help:	{name:'RoundMaster Help',
						 version:1.09,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">RoundMaster Help v1.09</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>RoundMaster API v'+version+'</h1>'
							+'<p>RoundMaster is an API for the Roll20 RPG-DS.  Its purpose is to extend the functionality of the Turn Tracker capability already built in to Roll20.  It is one of several other similar APIs available on the platform that support the Turn Tracker and manage token and character statuses related to the passing of time: the USP of this one is the full richness of its functionality and the degree of user testing that has occurred over a 12 month period.</p>'
							+'<p>RoundMaster is based on the much older TrackerJacker API, and many thanks to Ken L. for creating TrackerJacker.  However, roundMaster is a considerable fix and extension to TrackerJacker, suited to many different applications in many different RPG scenarios.  RoundMaster is also the first release as part of the wider RPGMaster series of APIs for Roll20, composed of <b>RoundMaster, CommandMaster, InitiativeMaster, AttackMaster, MagicMaster</b> and <b>MoneyMaster</b> - other than RoundMaster (which is generic) these initially support only the AD&D2e RPG.</p>'
							+'<p><b><u>Note:</u></b> For some aspects of the APIs to work, the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs listed above.  This will provide the most immersive game-support environment</p>'
							+'<h2>Syntax of RoundMaster calls</h2>'
							+'<p>The roundMaster API is called using !rounds, though it reveals its history in that it can also be called using !tj (the command for the TrackerJacker API roundMaster is based on).</p>'
							+'<pre>!rounds --start<br>'
							+'!tj --start</pre>'
							+'<p>Commands to be sent to the roundMaster API must be preceeded by two hyphens \'--\' as above for the --start command.  Parameters to these commands are separated by vertical bars \'|\', for example:</p>'
							+'<pre>!rounds --addtotracker name|tokenID|3|all|sleeping|sleepy</pre>'
							+'<p>If optional parameters are not to be included, but subsequent parameters are needed, use two vertical bars together with nothing between them, e.g.</p>'
							+'<pre>!rounds --addtotracker name|tokenID|3|all||sleepy</pre>'
							+'<p>Commands can be stacked in the call, for example:</p>'
							+'<pre>!rounds --start --addtotracker name|tokenID|3|all|sleeping|sleepy --sort</pre>'
							+'<p>When specifying the commands in this document, parameters enclosed in square brackets [like this] are optional: the square brackets are not included when calling the command with an optional parameter, they are just for description purposes in this document.  Parameters that can be one of a small number of options have those options listed, separated by forward slash \'/\', meaning at least one of those listed must be provided (unless the parameter is also specified in [] as optional): again, the slash \'/\' is not part of the command.  Parameters in UPPERCASE are literal, and must be spelt as shown (though their case is actually irrelevant).</p>'
							+'<h2>How to use RoundMaster</h2>'
							+'<h3>Who uses RoundMaster calls?</h3>'
							+'<p>The vast majority of RoundMaster calls are designed for the DM/GM to use, or to be called from RPGMaster APIs and database macros, rather than being called by the Player directly.  RoundMaster should be hidden from the Players in most circumstances.  It is highly recommended that RoundMaster is used with the other RPGMaster APIs, but especially <b>InitiativeMaster API</b> which uses RoundMaster to create and manage entries in the Roll20 Turn Order Tracker.</p>'
							+'<h3>Managing the Turn Order Tracker</h3>'
							+'<p>If the <b>InitiativeMaster API</b> is used, it must be accompanied by RoundMaster - it will not work otherwise.  InitiativeMaster provides many menu-driven and data-driven means of controlling RoundMaster, making it far easier for the DM to run their campaign.  The InitiativeMaster <b>--maint</b> command supports the necessary calls to RoundMaster for control of the Turn Order Tracker, and its <b>--menu</b> command uses the data on the Character Sheet to create Turn Order initiative entries with the correct speeds and adjustments.  See the InitiativeMaster API Handout for more information.</p>'
							+'<h3>Adding and managing Token Statuses</h3>'
							+'<p>The Token status management functions allow the application and management of status markers with durations (measured in rounds) set on tokens.  The easiest way to use status markers is to use the <b>MagicMaster API</b> which runs spell and magic item macros the Player can initiate, which in turn apply the right status markers and statuses with the appropriate durations to the relevant tokens.  See the MagicMaster API handout for more information.</p>'
							+'<h3>Status Effects</h3>'
							+'<p>RoundMaster comes with a number of status "effects": Roll20 Ability Macros that are automatically run when certain matching statuses are applied to, exist on, and/or removed from a token.  These macros can use commands (typically using APIs like <b>ChatSetAttr API</b> and/or <b>Tokenmod API</b> from the Roll20 API Script Library) to temporarily or permanently alter the characteristics of the Token or the represented Character Sheet, thus impacting the state of play.</p>'
							+'<p>If used with the <b>MagicMaster API</b>, its pre-configured databases of spell and magic item macros work well with the Effect macros supplied in the Effects Database provided with this API.</p>'
							+'<p>For full information on Status Effects, how to use them, and how to add more of your own, see the separate Effects Database handout.</p>'
							+'<h3>Token Death and Removal</h3>'
							+'<p>If a token is marked as Dead by using the Dead status marker (either via the Roll20 token emoticon menu or any other means), the system will automatically end all statuses, remove all status markers and run all status-end effect macros (if any) for the token.</p>'
							+'<p>If a token is deleted on a map and not previously marked as Dead, the API will search for any other token in the Campaign (with a preference to one on the current page) with the same name and representing the same character, and if found the API will transfer all statuses and status markers to the first token found (even if not on the current page).  If no such token is found, all statuses and status markers are removed from the token being deleted, and any corresponding status-end effect macros are run.</p>'
							+'<h3>Page Change and Adding Tokens</h3>'
							+'<p>If a Player, or all Players, are moved to another Roll20 page in the campaign (i.e. a different map), the API will automatically migrate all current statuses and status markers from the previous page (and all other pages in the Campaign, to support where tokens have come from different pages) to any token on the new page with the same Token Name and representing the same Character.  These statuses and their effects will then continue to apply on the new page for their set durations.</p>'
							+'<p>If a token is added to the current map the Players are on, either by dragging a character onto the map or by dragging on a picture and editing its properties to give it a name and optionally a representation, the API will again search for tokens with the same name and representing the same character, and move statuses and markers to the new token.</p>'
							+'<p>Of course, either before or after each of these situations, the <b>--edit</b> command can be used to change or remove statuses from any token(s).</p>'
							+'<br>'
							+'<h2>Command Index</h2>'
							+'<h3>1.	Tracker commands</h3>'
							+'<pre>--start<br>'
							+'--stop<br>'
							+'--pause<br>'
							+'--reset [number]<br>'
							+'--sort<br>'
							+'--clear<br>'
							+'--clearonround [OFF/ON]<br>'
							+'--clearonclose [OFF/ON]<br>'
							+'--sortorder [NOSORT/ATOZ/ZTOA/DESCENDING/ASCENDING]<br>'
							+'--addToTracker name|tokenID/-1|priority|[qualifier]|[message]|[detail]<br>'
							+'--removefromtracker name|tokenID/-1|[retain]</pre>'
							+'<h3>2.	Token Status Marker commands</h3>'
							+'<pre>--addstatus status|duration|direction|[message]|[marker]<br>'
							+'--addtargetstatus tokenID|status|duration|direction|[message]|[marker]<br>'
							+'--edit<br>'
							+'--target CASTER|casterID|status|duration|direction|[message]|[marker]<br>'
							+'--target SINGLE/AREA|casterID|targetID|status|duration|direction|[message]|[marker]<br>'
							+'--aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]<br>'
							+'--aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]|casterID|cmd|status|duration|direction|[message]|[marker]<br>'
							+'--movable-aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]<br>'
							+'--clean<br>'
							+'--removestatus status(es) / ALL<br>'
							+'--removetargetstatus tokenID|status(es) / ALL<br>'
							+'--deletestatus status(es) / ALL<br>'
							+'--deltargetstatus tokenID|status(es) / ALL<br>'
							+'--movestatus<br>'
							+'--disptokenstatus [tokenID]<br>'
							+'--listmarkers<br>'
							+'--listfav</pre>'
							+'<h3>3.	Other commands</h3>'
							+'<pre>--help<br>'
							+'--hsq from|[command]<br>'
							+'--handshake from|[command]<br>'
							+'--debug (ON/OFF)</pre>'
							+'<br>'
							+'<h2>1.	Tracker Command detail</h2>'
							+'<pre>!rounds --start</pre>'
							+'<p>This command alternates between starting the automatic functions of the Turn Tracker, and pausing the Tracker.  In its started state, the tracker will follow the current token at the top of the tracker with a highlight graphic, report the token\'s turn to all players, and follow the options selected for "sortorder" and "clearonround".  When paused, the Tracker will not highlight the top token, report turns or execute the options.</p>'
							+'<pre>!rounds --stop</pre>'
							+'<p>Stops the tracker and removes all statuses and status markers from tokens currently held by roundMaster.  This also dumps the tables held in the campaign status object.  It is useful if you want to start a fresh version of a campaign, or if everything goes wrong.</p>'
							+'<pre>!rounds --pause</pre>'
							+'<p>Pauses the Turn Tracker in its current state without deleting any information, and is the same as using the --start command again having already called it once.  The Turn Tracker can still be moved on, cleared, sorted, and reset, but the highlight graphic is paused.  It can be restarted using --start</p>'
							+'<pre>!rounds --reset [number]</pre>'
							+'<p>Sets the round in the Turn Order to the number, or to 1 if number is not provided.</p>'
							+'<pre>!rounds --sort</pre>'
							+'<p>Sorts the Turn Tracker entries according to the previously set sort order, with the default being ascending numeric priority.</p>'
							+'<pre>!rounds --clear</pre>'
							+'<p>Clears all entries in the Turn Tracker without stopping it.</p>'
							+'<pre>!rounds --clearonround [OFF/ON]</pre>'
							+'<p>Sets the "clear on round" option.  If set, this option means that when the Tracker is running and reaches the end of the round, all entries in the Turn Tracker are automatically removed ready for players to do initiative for the next round.  Otherwise, the Turn Tracker is not cleared automatically at any point.  Any parameter other than "off" turns clearonround on.  Default on.</p>'
							+'<pre>!rounds --clearonclose [OFF/ON]</pre>'
							+'<p>Sets the "clear on close" option.  If set, this option means that when the Tracker window is closed, the Turn Tracker is cleared.  Any parameter other than "on" turns clear on close off.  Default off.</p>'
							+'<pre>!rounds --sortorder [NOSORT/ATOZ/ZTOA/DESCENDING/ASCENDING]</pre>'
							+'<p>This command sets the automatic sort order of the entries in the Turn Tracker.  The Turn Tracker is automatically sorted at the beginning of each round as the Turn Tracker is moved on to the first entry, based on the order set by this option.  Descending and Ascending are numeric sorts based on the Priority number of each entry.  AtoZ and ZtoA are alphabetic sorts based on the name of each entry in the Turn Tracker.  Nosort will mean that no sorting takes place, and the order remains the order in which the entries were made.  The default order is Ascending.</p>'
							+'<pre>!rounds --addToTracker name|tokenID/-1|priority|[qualifier]|[message]|[detail]</pre>'
							+'<p>This command adds an entry to the TurnTracker.  tokenID can either be the ID of a valid token, or -1 to create a custom entry.  If a custom entry, name is used for the entry in the Turn Tracker with the provided priority, otherwise the token name is used for the entry with the provided priority.  The visibility of the token name in the Turn Tracker window will depend on the setting of the "showplayers_name" flag on the token.  The qualifier can be one of first/last/smallest/largest/all.</p>'
							+'<ul><li>First keeps only the first entry made for that name (for custom entries) or token and removes any others, but leaves all entries for other tokens and names in the Tracker</li>'
							+'<li>Last keeps only the latest entry for that token or name (i.e. the one now being set)</li>'
							+'<li>Smallest keeps only the entry with the lowest numeric priority for that token or name</li>'
							+'<li>Largest keeps only the entry with the highest numeric priority for that token or name</li>'
							+'<li>All keeps all entries in the list and adds this one to those for that token or name, meaning that the Turn Tracker can have multiple entries for one or more tokens or names</li></ul>'
							+'<p>If the "showplayers_name" flag on the token is <i>true</i>, the optional message will be displayed on the turn announcement for this turn when it is reached in the Turn Order (otherwise only the DM will see the message).  Generally, the message relates what the player (or DM) said the character was doing for their initiative.  The optional detail can be the detail of how the initiative priority was calculated or any other additional message you want to show to the Player only when the command is processed.</p>'
							+'<p>By using the name, tokenID/-1 and qualifier parameters judiciously, group initiative, individual initiative, or any combination of other types can be created.  When used with the InitiativeMaster API, Players get menus of actions they can take (based on their weapons, powers, memorised spells, magic items, thieving skills etc) which manage the calls to RoundMaster for the desired initiative type, and the DM gets menus to control all RoundMaster functions, and to set the type of initiative to undertake.</p>'
							+'<pre>!rounds --removefromtracker name|tokenID/-1|[retain]</pre>'
							+'<p>This command removes entries from the Turn Tracker for the specified tokenID or name.  However, if the optional retain number is given, it will retain this number of entries for the specified token or name, and only remove any beyond this number.  The earliest entries made are kept when the retain parameter is set.</p>'
							+'<pre>!rounds --viewer on/off/all/tokenID</pre>'
							+'<p>This command controls the viewer mode setting for the Player who calls it.  Rather than showing what that Player\'s characters can see when Dynamic Lighting is turned on, viewer mode shows that Player what each player-character (even if not theirs) can see as their token reaches the top of the Turn Tracker and it is their turn.  Quite often, this can be a Player ID set up just to be a viewer e.g. for a DM view of what players can see, or for a touchscreen playing surface. The current player-character is defined as the token representing a character sheet controlled by any Player at the top of the Turn Tracker.  As each new token comes to the top of the Turn Tracker, if it is a player-character the display changes to only what it can see.  If it is a token representing an NPC, or when the Turn Order reaches the next round and clears, the map for the Player reverts to showing what all player-characters can see (but not what NPCs can see).</p>'
							+'<p>The on option turns on viewer mode for the Player, and off turns it off.  The all option immediately turns on vision for all player-characters, and passing a tokenID as a parameter shows vision for that token (even if it represents an NPC).  Options off, all and tokenID can be used by any Player or the DM to affect the viewer Player\'s screen.</p>'
							+'<br>'
							+'<h2>2.	Token Status Marker commands</h2>'
							+'<p>First, here is the syntax for defining statuses for status markers, which is shared across commands that set status markers and potentially trigger effects.</p>'
							+'<pre>Effect-name<br>'
							+'Effect-name_Player-text<br>'
							+'Effect-name_Player-text_Differentiator</pre>'
							+'<p>Where underscores (\'_\') are shown, they are mandatory. Otherwise, spaces or hyphens can be used and will be ignored in name matches. The above are optional syntaxes - any one can be used.</p>'
							+'<ul>'
								+'<li><i>Effect-name</i> is mandatory, and is the name of the effect in the Effects database or, if there is no associated Effect, the name of the status being applied which can be anything desired.</li>'
								+'<li><i>Player-text</i> if provided is the text that will be shown to the Player instead of the Effect/status name.</li>'
								+'<li><i>Differentiator</i> if provided just makes this Effect/status different from any other with the same Effect-name and Player-text. This will only be needed in very limited circumstances that perhaps requires the same effect to be applied twice due to two different status applications. It is only ever displayed to the DM.</p>'
							+'</ul>'
							+'<p>Next, durations for statuses are normally just an integer number of rounds. However if preceeded by \'+\', \'-\', \'<\', \'>\', or \'=\' and a status of the same name is already set on the identified token the command will modify the current duration, like so:</p>'
							+'<ul>'
								+'<li>\'+#\' will increase the duration of the status by # rounds</li>'
								+'<li>\'-#\' will reduce the duration of the status by # rounds</li>'
								+'<li>\'<#\' will compare # to the duration of the current status and use the smaller</li>'
								+'<li>\'>#\' will compare # to the duration of the current status and use the larger</li>'
								+'<li>\'=#\' (or just the number) will replace the duration of the status with # rounds</li>'
							+'</ul>'
							+'<p>If a status of the same name does not exist on the identified token, the duration will be applied as normal to a new status for that token.</p>'
							+'<pre>!rounds --addstatus status|duration|direction|[message]|[marker]</pre>'
							+'<p>Adds a status and a marker for that status to the currently selected token(s).  The status has the name given in the status parameter, with the format described above, and will be given the duration specified (or a modified duration as stated above) which will be changed by direction each round.  Thus setting a duration of 8 and direction of -1 will decrement the duration by 1 each round for 8 rounds.  If the duration gets to 0 the status and token marker will be removed automatically.  direction can be any number - including a positive one meaning duration will increase.  Each Turn Announcement for the turn of a token with one or more statuses will display the effect_name/status (or the Player Text if specified), the duration and direction, and the message, if specified.  The specified marker will be applied to the token - if it is not specified, or is not a valid token marker name, the option will be given to pick one from a menu in the chat window (which can be declined).</p>'
							+'<p>For player-characters, when the duration reaches 9 or less the duration will be counted-down by a number appearing on the marker.  For NPCs this number does not appear (so that Players don\'t see the remaining duration for statuses on NPCs), but the remaining duration does appear for DM only on the status message below the Turn Announcement on the NPCs turn.</p>'
							+'<p>If a Player other than the DM uses this command, the DM will be asked to confirm the setting of the status and marker.  This allows the DM to make any decisions on effectiveness.</p>'
							+'<p>The API-held Effects database and any GM-supplied additional Effects databases will be searched in three ways: when a status marker is set, any Ability Macro with the name Effect-name-start (where Effect-name is from the command using the syntax described above) is run.  Each round when it is the turn of a token with the status marker set, the Ability Macro with the name Effect-name-turn is run.  And when the status ends (duration reaches 0) or the status is removed using --removestatus, or the token has the Dead marker set or is deleted, an Ability Macro with the name Effect-name-end is run.  See the Effects database documentation for full information on effect macros and the options and parameters that can be used in them.</p>'
							+'<pre>!rounds --addtargetstatus tokenID|status|duration|direction|[message]|[marker]</pre>'
							+'<p>This command is identical to addstatus, except for the addition of a tokenID.  Instead of using a selected token or tokens to apply the status to, this applies the status to the specified token.</p>'
							+'<pre>!rounds --edit</pre>'
							+'<p>This command brings up a menu in the chat window showing the current status(es) set on the selected token(s), with the ability to remove or edit them.  Against each named status, a spanner icon opens another menu to edit the selected status name, duration, direction, message and marker on all the selected token(s), and also allows this status to be set as a favourite.  A bin icon will remove the status from all the selected token(s), and run any status-end macros, if any.</p>'
							+'<pre>!rounds --target CASTER|casterID|casterID|status|duration|direction|[message]|[marker]<br>'
							+'!rounds --target SINGLE/AREA|casterID|targetID|status|duration|direction|[message]|[marker]</pre>'
							+'<p>This command targets a status on a token or a series of tokens.  If a version using CASTER is called, it acts identically to the addtargetstatus command, using the casterID as the target token.  If the SINGLE version is called, the targetID is used.  If the AREA version is used, after applying the status to the targetID token, the system asks in the chat window if the status is to be applied to another target and, if confirmed, asks for the next target to be selected, repeating this process after each targeting and application.  In each case, it applies the status (with the format defined above), effect macro and marker to the specified token(s) in the same way as addtargetstatus.</p>'
							+'<pre>!rounds --aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]<br>'
							+'!rounds --aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]|casterID|SINGLE/AREA|status|duration|direction|[message]|[marker]<br>'
							+'!rounds --movable-aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]</pre>'
							+'<table>'
							+'	<tr><th scope="row">shape</th><td>[BOLT/ CIRCLE/ CONE/ ELLIPSE/ RECTANGLE/ SQUARE/ WALL]</td></tr>'
							+'	<tr><th scope="row">units</th><td>[SQUARES/ FEET/ YARDS/ UNITS]</td></tr>'
							+'	<tr><th scope="row">image</th><td>[ACID/ COLD/ DARK/ FIRE/ LIGHT/ LIGHTNING/ MAGIC/ RED/ YELLOW/ BLUE/ GREEN/ MAGENTA/ CYAN/ WHITE/ BLACK]</td></tr>'
							+'	<tr><th scope="row">confirmed</th><td>[TRUE / FALSE]</td></tr>'
							+'	<tr><th scope="row">range, length & width</th><td>numbers specified in whatever unit was specified as [units]</td></tr>'
							+'</table>'
							+'<p>This command displays an Area of Effect for an action that has or is to occur, such as a spell.  This quite often can be used before the --target area command to identify targets.  The system will present lists of options for each parameter that is not specified for the Player to select.  On executing this command, if the range is not zero the Player will be given a crosshair to position the effect, and if the range is zero the effect will be centred on the Token (or at its "finger-tips" for directional effects like cones).  The range of the effect will be centred on the TokenID specified and will be displayed as a coloured circle - the crosshair should be positioned within this area (the system does not check).  The Crosshair (or if range is zero, the Token) can be turned to affect the direction of the effect. The effect "direction" will be the direction the token/crosshair is facing.  If Confirmed is false or omitted, the Player will be asked to confirm the positioning of the token/crosshair with a button in the chat window. Setting Confirmed to true will apply the effect immediately - good for range zero circular effects (i.e. don\'t need placing or direction setting).  </p>'
							+'<p>The second form of the --aoe command, with more parameters, combines the display of an area of effect with a subsequent call to a --target command, using the parameters as described for the --target command above. Once the area of effect is shown, a button will be presented in the chat window to select a target (which can be the first in a sequence if the "AREA" parameter is used).</p>'
							+'<p>Using the aoe command means the area of effect presented is movable or deletable by the DM but not the Player(s).  If using the movable-aoe command instead, then any Player who controls the specified token can move or delete the area of effect image.  This is useful for representing spells such as Flaming Sphere</p>'
							+'<p>The effect can have one of the shapes listed:</p>'
							+'<ul><li>Bolt is a long rectangle extending away from the crosshair/token for length, and width wide.</li>'
							+'<li>Circle is a circle centred on the crosshair/token of diameter length.</li>'
							+'<li>Cone is a cone starting at the crosshair/token of length, with an end width.</li>'
							+'<li>Ellipse is an ellipse of length extending away, and width wide.</li>'
							+'<li>Rectangle is a rectangle of length extending away, and width wide.</li>'
							+'<li>Square is a square of sides length parallel with the direction the crosshair/token.</li>'
							+'<li>Wall is a rectangle perpendicular to the crosshair or token, i.e. width away and length wide.</li></ul>'
							+'<p>For the units, Feet & Yards are obvious and are scaled to the map.  Squares are map squares (whatever scale they are set to), and Units are the map scale units and are not scaled.</p>'
							+'<p>Images are set with transparency and sent to the back of the Object layer.  Red/ Yellow/ Blue/ Green/ Magenta/ Cyan/ White/ Black colour the effect area the specified colour, and Acid/ Cold/ Dark/ Fire/ Light/ Lightning/ Magic use textured fills.</p>'
							+'<pre>!rounds --clean</pre>'
							+'<p>Drops all the status markers on the selected token(s), without removing the status(es) from the campaign status object, meaning live statuses will be rebuilt at the end of the round or the next trigger event.  This deals with situations where token markers have become corrupted for some reason, and should not be needed very often.</p>'
							+'<pre>!rounds --removestatus status(es) / ALL</pre>'
							+'<p>Removes the status, a comma-delimited list of statuses, or all statuses, and their status marker(s) from the selected token(s), and runs any associated status-end Ability Macros in any existing Effects database in the campaign.  See addstatus command and the Effect database documentation for details on effect macros.  Statuses can be "all" which will remove all statuses from the selected token(s).</p>'
							+'<pre>!rounds --removetargetstatus targetID | status(es) / ALL</pre>'
							+'<p>Exactly the same as the removestatus command, but for a specified token rather than any that is selected.  Removes the status, a comma-delimited list of statuses, or all statuses, and their status marker(s) from the specified token, and runs any associated status-end Ability Macros in any existing Effects database in the campaign.  See addstatus command and the Effect database documentation for details on effect macros.  Statuses can be "all" which will remove all statuses from the token.</p>'
							+'<pre>!rounds --deletestatus status(es) / ALL</pre>'
							+'<p>Works the same as removestatus command, except that it does not run any effect macros.</p>'
							+'<pre>!rounds --deltargetstatus tokenID|status(es) / ALL</pre>'
							+'<p>Works the same as removetargetstatus command, except that it does not run any effect macros.</p>'
							+'<pre>!rounds --movestatus</pre>'
							+'<p>For each of the selected tokens in turn, searches for tokens in the whole campaign with the same name and representing the same character sheet, and moves all existing statuses and markers from all the found tokens to the selected token (removing any duplicates).  This supports Players moving from one Roll20 map to another and, indeed, roundMaster detects page changes and automatically runs this command for all tokens on the new page controlled by the Players who have moved to the new page.</p>'
							+'<pre>!rounds --disptokenstatus [tokenID]</pre>'
							+'<p>Shows the statuses on the specified token to the DM using the same display format as used in the Turn Announcement.</p>'
							+'<pre>!rounds --listmarkers</pre>'
							+'<p>Shows a display of all markers available in the API to the DM, and also lists which are currently in use.</p>'
							+'<pre>!rounds --listfav</pre>'
							+'<p>Shows statuses to the DM that have been defined as favourites (see the edit command), and provides buttons to allow the DM to apply one or more favourite statuses to the selected token(s), and to edit the favourite statuses or remove them as favourites.</p>'
							+'<h2>3.	Other commands</h2>'
							+'<pre>!rounds --help</pre>'
							+'<p>Displays a listing of RoundMaster commands and their syntax.</p>'
							+'<pre>!rounds --hsq from|[command]<br>'
							+'!rounds --handshake from|[command]</pre>'
							+'<p>Either form performs a handshake with another API, whose call (without the \'!\') is specified as from in the command parameters.  The command calls the from API command responding with its own command to confirm that RoundMaster is loaded and running: e.g. </p>'
							+'<p><i>Received:	!rounds --hsq magic</i><br>'
							+'<i>Response:	!magic --hsr rounds</i><br></p>'
							+'<p>Optionally, a command query can be made to see if the command is supported by RoundMaster if the command string parameter is added, where command is the RoundMaster command (the \'--\' text without the \'--\').  This will respond with a true/false response: e.g.</p>'
							+'<p><i>Received:	!rounds --hsq init|addtotraker</i><br>'
							+'<i>Response:	!init --hsr rounds|addtotracker|true</i></p>'
							+'<pre>!rounds --debug (ON/OFF)</pre>'
							+'<p>Takes one mandatory argument which should be ON or OFF.</p>'
							+'<p>The command turns on a verbose diagnostic mode for the API which will trace what commands are being processed, including internal commands, what attributes are being set and changed, and more detail about any errors that are occurring.  The command can be used by the DM or any Player - so the DM or a technical advisor can play as a Player and see the debugging messages.</p>'
							+'</div>',
						},
	EffectsDB_help:		{name:'Effects Database Help',
						 version:1.12,
						 avatar:'https://s3.amazonaws.com/files.d20.io/images/257656656/ckSHhNht7v3u60CRKonRTg/thumb.png?1638050703',
						 bio:'<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
							+'<span style="font-weight: bold; font-size: 125%">Effects Database Help v1.12</span>'
							+'</div>'
							+'<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
							+'<h1>Effect Database for RoundMaster API v'+version+'</h1>'
							+'<p>Effect-DB is a database character sheet created, used and updated by the <b>RoundMaster API</b> (see separate handout).  The database holds macros as Ability Macros that are run when certain matching statuses are placed on or removed from tokens (see Roll20 Help Centre for information on Ability Macros and Character Sheet maintenance).  The macros are run when various events occur, such as <i>end-of-round</i> or <i>Character\'s turn</i>, at which point no token or an incorrect token may be selected - this makes @{selected|attribute-name} useless as a macro command.  Therefore, the macros have certain defined parameters dynamically replaced when run by RoundMaster, which makes the token & character IDs and names, and values such as AC, HP and Thac0, available for manipulation.</p>'
							+'<p>The Effects database as distributed with the API holds many effects that work with the spell & magic item macros distributed with other RPGMaster APIs. The API also checks for, creates and updates the Effects database to the latest version on start-up.  DMs can add their own effects to additional databases, but the database provided is totally rewritten when new updates are released and so the DM must add their own database sheets.  If the <i>provided</i> databases are accidentally deleted or overwritten, they will be automatically recreated the next time the Campaign is opened. Additional databases should be named as <b>Effects-DB-<i>[added-name]</i></b> where <i>"[added-name]"</i> can be any name you want.</p>'
							+'<p><b>However:</b> the system will ignore any database with a name that includes a version number of the form "v#.#" where # can be any number or group of numbers e.g. Effects-DB v2.13 will be ignored.  This is so that the DM can version control their databases, with only the current one (without a version number) being live.</p>'
							+'<p>There can be as many additional databases as you want.  Other Master series APIs come with additional databases, some of which overlap - this does not cause a problem as version control and merging unique macros is managed by the APIs.</p>'
							+'<p><b>Important Note:</b> all Character Sheet databases <b><u><i>must</i></u></b> have their <i>\'ControlledBy\'</i> value (found under the [Edit] button at the top right of each sheet) set to <i>\'All Players\'</i>.  This must be for all databases, both those provided (set by the API) and any user-defined ones.  Otherwise, Players will not be able to run the macros contained in them.</p>'
							+'<p>Effect macros are primarily intended to act on the Token and its variables, but can also act on the represented Character Sheet.  A single Character Sheet can have multiple Tokens representing it, and each of these are able to do individual actions using the data on the Character Sheet jointly represented.  However, if such multi-token Characters / NPCs / creatures are likely to encounter effects that will affect the Character Sheet they must be split with each Token representing a separate Character Sheet, or else the one effect will affect all tokens associated with the Character Sheet, whether they were targeted or not!  In fact, <b>it is recommended that tokens and character sheets are 1-to-1 to keep things simple.</b></p>'
							+'<p><b><u>Note:</u></b> Effect macros are heavily dependent upon the <b>ChatSetAttr API</b> and the <b>Tokenmod API</b>, both from the Roll20 Script Library, and they must be loaded.  It is also <i>highly recommended</i> to load all the other RPGMaster series APIs: <b>InitiativeMaster, AttackMaster, MagicMaster and CommandMaster</b>.  This will provide the most immersive game-support environment</p>'
							+'<h2>Replacing Distributed Effects</h2>'
							+'<p>The RoundMaster API is distributed with an Effect Database containing effects to support items provided in other RPGMaster series APIs.  If you want to replace any Effect macro in the provided database, you can do so simply by creating an Ability Macro in one of your own Effect databases with exactly the same name as the provided item to be replaced.  The API gives preference to Ability Macros in user-defined databases, so yours will be selected in preference to the one provided with the APIs.</p>'
							+'<h2>Setup of the Token</h2>'
							+'<p>The recommended Token Bar assignments for all APIs in the Master Series are:</p>'
							+'<table>'
							+'<tr><th scope="row">Bar1<br>(Green Circle):</th><td>Armour Class (AC field) - only current value</td></tr>'
							+'<tr><th scope="row">Bar2<br>(Blue Circle):</th><td>Base Thac0 (thac0-base field) before adjustments - only current value</td></tr>'
							+'<tr><th scope="row">Bar3<br>(Red Circle):</th><td>Hit Points (HP field) - current & max</td></tr>'
							+'</table>'
							+'<p>It is recommended to use these assignments, and they are the bar assignments set by the CommandMaster API if its facilities are used to set up the tokens.  All tokens must be set the same way, whatever way you eventually choose.</p>'
							+'<p>These assignments can be changed in the RoundMaster API, by changing the fields object near the top of the API script.  See the RPGMaster Character Sheet setup Handout for details of how to do this.  However, when using the Effect place holders in the effect macros, the APIs will always search the token and character sheet for the most appropriate field assignments - if you link the token bars differently, the APIs will look at the fields so linked and attempt to use/change/maintain the appropriate ones you have assigned.</p>'
							+'<h2>Macro Parameter Fields</h2>'
							+'<p>Dynamic parameters are identified in the macros by bracketing them with two carets: <b>^^</b>parameter<b>^^</b>.  The standard Roll20 syntax of @{selected|...} is not available, as at the time the macros run the targeted token may not be selected, and @{character_name|...} will not enable the token to be affected (especially where the Character Sheet is represented by more than one token).  The ^^...^^ parameters always relate to the token on which a status has been set, and the Character Sheet it represents.  Currently available parameters are:</p>'
							+'<table>'
							+'	<thead>'
							+'		<tr><th scope="col">Place holder</th><th scope="col">Replaced with</th></tr>'
							+'	</thead>'
							+'	<tr><th scope="row">^^tid^^</th><td>TokenID</td></tr>'
							+'	<tr><th scope="row">^^tname^^</th><td>Token_name</td></tr>'
							+'	<tr><th scope="row">^^cid^^</th><td>CharacterID</td></tr>'
							+'	<tr><th scope="row">^^cname^^</th><td>Character_name</td></tr>'
							+'	<tr><th scope="row" colspan="2"><span style="background-color: lightgrey;"> </span></th></tr>'
							+'	<tr><th scope="row">^^ac^^</th><td>Armour Class value (order looked for: a token bar linked to an appropriate field, Character Sheet AC field, MonsterAC - see note)</td></tr>'
							+'	<tr><th scope="row">^^ac_max^^</th><td>Maximum value of AC, wherever it is found</td></tr>'
							+'	<tr><th scope="row">^^token_ac^^</th><td>The token field name for AC value field, if set as a token bar</td></tr>'
							+'	<tr><th scope="row">^^token_ac_max^^</th><td>The token field name for AC max field, if set as a token bar</td></tr>'
							+'	<tr><th scope="row" colspan="2"><span style="background-color: lightgrey;"> </span></th></tr>'
							+'	<tr><th scope="row">^^thac0^^</th><td>Thac0 value (order looking: a token bar linked to an appropriate field, Character Sheet Thac0_base field, MonsterThac0 - see note)</td></tr>'
							+'	<tr><th scope="row">^^thac0_max^^</th><td>Maximum value of Thac0, wherever it is found</td></tr>'
							+'	<tr><th scope="row">^^token_thac0^^</th><td>The token field name for Thac0 value field, if set as a token bar</td></tr>'
							+'	<tr><th scope="row">^^token_thac0_max^^</th><td>The token field name for Thac0 max field, if set as a token bar</td></tr>'
							+'	<tr><th scope="row" colspan="2"><span style="background-color: lightgrey;"> </span></th></tr>'
							+'	<tr><th scope="row">^^hp^^</th><td>HP value (order looked for: a token bar linked to an appropriate field, Character Sheet HP field - see note)</td></tr>'
							+'	<tr><th scope="row">^^hp_max^^</th><td>Maximum value of HP, wherever it is found</td></tr>'
							+'	<tr><th scope="row">^^token_hp^^</th><td>The token field name for HP value field, if set as a token bar</td></tr>'
							+'	<tr><th scope="row">^^token_hp_max^^</th><td>The token field name for HP max field, if set as a token bar</td></tr>'
							+'	<tr><th scope="row" colspan="2"><span style="background-color: lightgrey;"> </span></th></tr>'
							+'	<tr><th scope="row">^^bar1_current^^</th><td>Value of the token Bar1_value field</td></tr>'
							+'	<tr><th scope="row">^^bar2_current^^</th><td>Value of the token Bar2_value field</td></tr>'
							+'	<tr><th scope="row">^^bar3_current^^</th><td>Value of the token Bar3_value field</td></tr>'
							+'</table>'
							+'<p><b>Note:</b> If a legal value is not found in any of these fields, the value in the token bar specified in the API <i>fields</i> object will be used as a last resort.</p>'
							+'<p>This allows most data on both the token and the character sheet to be accessed.  For example <b>@{^^cname^^|strength}</b> will return the strength value from the represented character sheet.  Of course all loaded RPGMaster series API commands are available, along with commands for any other APIs you have loaded.</p>'
							+'<p>Two other APIs from the Roll20 Script Library are extremely useful for these macros, and indeed are used by many of the provided APIs: ChatSetAttr API from joesinghaus allows easy and flexible setting of Character Sheet attributes.  Tokenmod API from The Aaron supports easy setting and modifying of Token attributes.  Combined with the dynamic parameters above, these make for exceptionally powerful real-time effects in game-play.</p>'
							+'<h2>Effect Macro qualifiers</h2>'
							+'<p>Each effect macro runs when a particular status event occurs.  Here is the complete list of effect macro status name qualifiers that can be used.  Each of these is appended to the status whenever the status experiences the relevant event, and an effect macro with that name searched for and run if found:</p>'
							+'<table>'
							+'	<tr><th scope="row">statusname-start</th><td>The status is created on a token</td></tr>'
							+'	<tr><th scope="row">statusname-turn</th><td>Each round the status has a duration that is not zero</td></tr>'
							+'	<tr><th scope="row">statusname-end</th><td>The status duration reaches zero</td></tr>'
							+'</table>'
							+'<p>These effect macros are triggered for weapons when certain events take place:</p>'
							+'<table>'
							+'	<tr><th scope="row">weaponname-inhand</th><td>A weapon is taken in-hand (triggered by AttackMaster API --weapon command)</td></tr>'
							+'	<tr><th scope="row">weaponname-dancing</th><td>A weapon starts dancing (triggered by AttackMaster API --dance command)</td></tr>'
							+'	<tr><th scope="row">weaponname-sheathed</th><td>A weapon  is sheathed (out of hand - triggered by AttackMaster --weapon cmd)</td></tr>'
							+'</table>'
							+'<h2>Examples of Effect Macros</h2>'
							+'<p>Here is an example of an effect macro that runs when a Faerie fire (twilight form) status is placed on a token.  The following --target command might be run to set this status, with the caster token selected:</p>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">!rounds --target area|@{selected|token_id}|&#64;{target|Select first target|token_id}|Faerie-Fire-twilight|[[4*@{selected|Casting-Level}]]|-1|Outlined in dim Faerie Fire, 1 penalty to AC|aura</p>'
							+'<p>(See the RoundMaster Help handout for an explanation of the <b>--target</b> command and its parameters). This command will result in the following effect macro being run when the first token is targeted:</p>'
							+'<h3>Faerie-fire-twilight-start</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|+1<br>'
							+'^^tname^^ is surrounded by Faerie Fire, and becomes easier to hit</p>'
							+'<p>This uses the Tokenmod API to increase the AC number of the targeted token by 1 (making it 1 wose), and then display a message to all Players stating the name of the targeted token, and the effect on it.  This will be run for each token targeted, and will be individual to each. Note: the tokens are not \'selected\' in Roll20 terms, and so @{selected|...} will not work</p>'
							+'<p>When the Faerie Fire status counts down to zero, the following effect macro will be run on each of the tokens it was applied to:</p>'
							+'<h3>Faerie-fire-twilight-end</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">!token-mod --ignore-selected --ids ^^tid^^ --set ^^token_ac^^|-1<br>'
							+'^^tname^^ has lost that glow and is now harder to aim at</p>'
							+'<p>Again, the Tokenmod API is used to decrease the token AC and a message issued confirming what has happened.  If messages should only be sent to the Player(s) controlling the character represented by the token, use /w "^^cname^^" before the message.  If the message is only for the gm, use /w gm.</p>'
							+'<p>A more complex example is a Quarterstaff of Dancing, that uses the complete suite of possible effect macros and certain aspects of the AttackMaster API functionality triggered by Weapon table field settings.  The first macro is triggered by AttackMaster API when a Character takes a Quarterstaff-of-Dancing in hand to use as a weapon:</p>'
							+'<h3>Quarterstaff-of-Dancing-inhand</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">!rounds --addtargetstatus ^^tid^^|Quarterstaff-of-Dancing|4|-1|Quarterstaff not yet dancing so keep using it|stopwatch</p>'
							+'<p>This command sets a status marker on the Token of the Character taking the Quarterstaff in hand, and sets a countdown of 4 rounds, running the next effect macro in each of those rounds:</p>'
							+'<h3>Quarterstaff-of-Dancing-turn</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">'
							+'!attk --quiet-modweap ^^tid^^|quarterstaff-of-dancing|melee|+:+1 --quiet-modweap ^^tid^^|quarterstaff-of-dancing|dmg|+:+1<br>'
							+'/w "^^cname^^" Updating the quarterstaff +1 to attk & dmg</p>'
							+'<p>This command then runs each round as the Quarterstaff-of-Dancing status counts down, and uses the !attk --quiet-modweap command to gradually increment the magical to-hit and dmg plus, round by round.  Once the countdown reaches zero, the next effect macro is run:</p>'
							+'<h3>Quarterstaff-of-Dancing-end</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">'
							+'!attk --dance ^^tid^^|Quarterstaff-of-Dancing</p>'
							+'<p>This calls an AttackMaster API command to start the weapon dancing, resets the weapon to its specs that it starts dancing with, and the AttackMaster API then automatically calls the next effect macro:</p>'
							+'<h3>Quarterstaff-of-Dancing-dancing</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">'
							+'!rounds --addtargetstatus ^^tid^^|Dancing-Quarterstaff|4|-1|The Quarterstaff is Dancing by itself. Use this time wisely!|all-for-one<br>'
							+'!attk --quiet-modweap ^^tid^^|quarterstaff-of-dancing|melee|sb:0 --quiet-modweap ^^tid^^|quarterstaff-of-dancing|dmg|sb:0</p>'
							+'<p>This places a new status marker on the token representing the Character with the dancing weapon (note the new status name Dancing-Quarterstaff), and resets the Strength Bonus flags for the weapon - a dancing weapon can\'t have the Strength Bonus of the wielder.  As each round now passes, the following different status effect macro is run:</p>'
							+'<h3>Dancing-Quarterstaff-turn</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">'
							+'!attk --quiet-modweap ^^tid^^|quarterstaff-of-dancing|melee|+:+1 --quiet-modweap ^^tid^^|quarterstaff-of-dancing|dmg|+:+1</p>'
							+'<p>As per the previous -turn effect macro, this increments the magical plusses on To-Hit and Dmg, round by round.  It has to have a different name, as the -end effect macro does different actions:</p>'
							+'<h3>Dancing-Quarterstaff-end</h3>'
							+'<p style="display: inline-block; background-color: lightgrey; border: 1px solid black; padding: 4px; color: dimgrey; font-weight: extra-light;">'
							+'!attk --dance ^^tid^^|Quarterstaff-of-Dancing|stop</p>'
							+'<p>This uses the AttackMaster API command to stop the Quarterstaff from dancing.  As can be seen from the above, quite complex sequences of effect macros can be created.</p>'
							+'</div>',
						},

	});

	var RoundMaster_tmp = (function() {
		var templates = {
			button: _.template('<a style="display: inline-block; font-size: 100%; color: black; padding: 3px 3px 3px 3px; margin: 2px 2px 2px 2px; border: 1px solid black; border-radius: 0.5em; font-weight: bold; text-shadow: -1px -1px 1px #FFF, 1px -1px 1px #FFF, -1px 1px 1px #FFF, 1px 1px 1px #FFF; background-color: #C7D0D2;" href="<%= command %>"><%= text %></a>'),
			confirm_box: _.template('<div style="font-weight: bold; background-color: #FFF; text-align: center; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 1em; border: 1px solid black; margin: 5px 5px 5px 5px; padding: 2px 2px 2px 2px;">'
					+ '<div style="border-bottom: 1px solid black;">'
						+ '<%= message %>'
					+ '</div>'
					+ '<table style="text-align: center; width: 100%">'
						+ '<tr>'
							+ '<td>'
								+ '<%= confirm_button %>'
							+ '</td>'
							+ '<td>'
								+ '<%= reject_button %>'
							+ '</td>'
						+ '</tr>'
					+ '</table>'
				+ '</div>')
		};

		return {
			getTemplate: function(tmpArgs, type) {
				var retval;
				
				retval = _.find(templates, function(e,i) {
					if (type === i) {
						{return true;}
					}
				})(tmpArgs);
				
				return retval;
			},
			
			hasTemplate: function(type) {
				if (!type) 
					{return false;}
				return !!_.find(_.keys(templates), function(elem) {
					{return (elem === type);}
				});
				
			}
		};
	}());

	/**
	 * PendingResponse constructor
	 */
	var PendingResponse = function(type,func,args) {
		if (!type || !args) 
			{return undefined;}
		
		this.type = type;
		this.func = func;
		this.args = args;
	};
	
	/**
	 * PendingResponse prototypes
	 */
	PendingResponse.prototype = {
		getType: function() { return this.type; },
		getArgs: function() { return this.args; },
		doOps: function(carry) {
			if (!this.func) 
				{return null;}
			return this.func(this.args,carry); 
		},
		doCustomOps: function(args) { return this.func(args); },
	};

	/**
	 * Add a pending response to the stack, return the associated hash
	 * TODO make the search O(1) rather than O(n)
	 */
	var addPending = function(pr,hash) {
		if (!pr) 
			{return null;}
		if (!hash) 
			{hash = genHash(pr.type+pr.args,pending);}
		var retval = hash;
		if (pending) {
			if (pending[hash]) {
				throw 'hash already in pending queue';
			}
			pending[hash] = {};
			pending[hash].pr = pr; 
		} else {
			pending = {};
			pending[hash] = {};
			pending[hash].pr = pr; 
		}
		return retval;
	};
	
	/**
	 * find a pending response
	 */
	var findPending = function(hash) {
		var retval = null;
		if (!pending)
			{return retval;}
		retval = pending[hash]; 
		if (retval) 
			{retval = retval.pr;}
		return retval;
	};
	
	/**
	 * Clear pending responses
	 */
	var clearPending = function(hash) {
		if (pending[hash])
			{delete pending[hash]; }
	};

	/**
	* @author lordvlad @stackoverflow
	* @contributor Ken L.
	*/
	var genHash = function(seed,hashset) {
		if (!seed) 
			{return null;}
		seed = seed.toString();
		var hash = seed.split("").reduce(function(a,b) {a=((a<<5)-a)+b.charCodeAt(0);return a&a;},0);
		if (hashset && hashset[hash]) {
			var d = new Date();
			return genHash((hash+d.getTime()*Math.random()).toString(),hashset);
		}
		return hash;
	}; 

	/**
	 * Init
	 */
	var init = function() {
		try {
			if (!state.roundMaster)
				{state.roundMaster = {};}
			if (!state.roundMaster.effects)
				{state.roundMaster.effects = {};}
			if (!state.roundMaster.statuses) 
				{state.roundMaster.statuses = [];}
			if (!state.roundMaster.favs)
				{state.roundMaster.favs = {};}
			if (!state.roundMaster.viewer) {
				state.roundMaster.viewer = {};
				state.roundMaster.viewer.is_set = false;
				state.roundMaster.viewer.pid = '';
				state.roundMaster.viewer.echo = 'on';
			}
			if (_.isUndefined(state.roundMaster.debug))
				{state.roundMaster.debug = false;}
			if (!state.roundMaster.round)
				{state.roundMaster.round = 1;
				log(`-=> roundMaster round reset <=-`);}
				
			// RED: v3.019 check the version of any existing Effects databases,
			// and update them as necessary, creating any missing ones.
			// RED: v4.035 removed, as now read the data directly

	//		setTimeout( () => doUpdateEffectsDB(['Silent']), 10 );
			
			// RED: v3.020 added the help-text handouts and a 
			// function to create and update them
			setTimeout( () => updateHandouts(true,findTheGM()), 10);
					
			// RED: v1.301 determine if the Initiative Macro Library is present
			var initLib = findObjs({ _type: 'character' , name: 'Initiative' });
			flags.canSetRoundCounter = false;
			if (initLib) {
				flags.canSetRoundCounter = (initLib.length > 0);
			}
			
			// RED: Forced an update of the Turnorder so that the state of the
			// RoundMaster is correctly displayed on startup

			var turnorder = undefined;
			prepareTurnorder(turnorder);
			updateTurnorderMarker(turnorder);
			
			// RED: log the version of the API Script

			log('-=> RoundMaster v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
		} catch (e) {
			log('RoundMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendDebug('RoundMaster Initialisation: JavaScript '+e.name+': '+e.message+' while initialising the API');
			sendError('RoundMaster JavaScript '+e.name+': '+e.message);
		}
	}; 
	
    /**
     * RED: v1.301 Find the GM, generally when a player can't be found
     */
     
    var findTheGM = function() {
	    var playerGM,
	        players = findObjs({ _type:'player' });

		if (players.length !== 0) {
		    if (!_.isUndefined(playerGM = _.find(players, function(p) {
		        var player = p;
		        if (player) {
    		        if (playerIsGM(player.id)) {
	    	            return player.id;
                    }
		        }
            }))) {
                return playerGM.id;
            }
        }
        return undefined;
    }
	
	/*
	 * Store the Turn Order back to the Campaign object
	 */
	 
	var storeTurnorder = function( turnorder ) {
		turnorder.reduce((m,t)=>{
			let o = getObj('graphic',t.id);
			if(o){
			  t._pageid = o.get('pageid');
			}
			return [...m,t];
		},[]);
		turnorder = JSON.stringify(turnorder);
		Campaign().set('turnorder',turnorder);
		return;
	}


	/**
	 * check if the character object exists, return first match
	 */
	var characterObjExists = function(name, type, charId) {
		var retval = null;

		var obj = findObjs({
			_type: type,
			name: name,
			_characterid: charId
		});
 		if (obj.length > 0) {
			retval = obj[0];
		}

		return retval;
	}; 
	
	/*
	 * Determine if the token is controlled by a player
	 */

	var isPlayerControlled = function( curToken ) {
		
		var charID = curToken.get('represents'),
			isPlayer = false,
			charCS,
			controlledBy,
			players;
		if (charID) {
			charCS = getObj('character',charID);
		}
		if (charCS) {
			controlledBy = charCS.get('controlledby');
			if (controlledBy.length > 0) {
				controlledBy = controlledBy.split(',');
				isPlayer = _.some( controlledBy, function(playerID) {
					players = findObjs({_type: 'player', _id: playerID});
					return (players && players.length > 0);
				})
			}
		}
		return isPlayer;
	}
	
	/**
	 * Return the string with the roll formatted, this is accomplished by simply
	 * surrounding roll equations with [[ ]] TODO, should be replaced with a
	 * single regex
	 * 
	 */
	var getFormattedRoll = function(str) {
		if (!str) {return "";}
		var retval = str,
			re = /\d+d\d+/,
			idx, 
			expr, 
			roll, 
			pre, 
			post;

		if ((roll=re.exec(str))) {
			expr = getExpandedExpr(roll[0],str,roll.index);
			idx = str.indexOf(expr);
			pre = str.substring(0,idx);
			post = str.substring(idx+expr.length);
		} else { return retval;}
		return pre+"[["+expr+"]]"+getFormattedRoll(post);
	};
	
	/**
	 * Return the target expression expanded as far as it logically can span
	 * within the provided line.
	 * 
	 * ie: target = 1d20
	 *	   locHint = 4
	 *	   line = "2+1d20+5+2d4 bla (bla 1d20+8 bla) bla (4d8...) bla bla"
	 * 
	 * result = 2+1d20+5+2d4
	 */
	var getExpandedExpr = function(target, line, locHint) {
		if (!target || !line) 
			{return;}
		if (!locHint) 
			{locHint = 0;}
		var retval = target,
			re = /\d|[\+\-]|d/,
			loc = -1, 
			start = 0, 
			end = 0;
		
		if((loc=line.indexOf(target,locHint)) !== -1) {
			start = loc;
			while (start >= 0) {
				if (line[start].match(re))
					{start--;}
				else
					{start++;break;}
			}
			start = Math.max(start,0);
			end = loc;
			while (end < line.length) {
				if (line[end].match(re))
					{end++;}
				else
					{break;}
			}
			retval = line.substring(start,end);
			retval = getLegalRollExpr(retval);
		}
		
		return retval;
	};
	
	/**
	 * Gets a legal roll expression.
	 */
	var getLegalRollExpr = function(expr) {
		if (!expr) {return;}
		var retval = expr,
			stray = expr.match(/d/g),
			valid = expr.match(/\d+d\d+/g),
			errMsg = "Illegal expression " + expr; 
		
		try {
			if (expr.match(/[^\s\d\+-d]/g) || 
			!stray || 
			!valid || 
			(stray.length =! valid.length))
				{throw errMsg;}

			stray = expr.match(/\+/g);
			valid = expr.match(/\d+\+\d+/g);
			if ((stray !== null) && (valid !== null) && 
			(stray.length !== valid.length))
				{throw errMsg;}
			stray = expr.match(/-/g);
			valid = expr.match(/\d+-\d+/g);
			if ((stray !== null) && (valid !== null) && 
			(stray.length !== valid.length))
				{throw errMsg;}
		} catch (e) {
			throw e;
		}
		
		//check for leading, trailing, operands
		if (retval[0].match(/\+|-/))
			{retval = retval.substring(1);}
		if (retval[retval.length-1].match(/\+|-/))
				{retval = retval.substring(0,retval.length-1);}
		
		return retval;
	};
	
    /**
     * RED: v1.190 Added in the inline roll evaluator from ChatSetAttr script v1.9
     * by Joe Singhaus and C Levett.
    **/

	var processInlinerolls = function (msg) {
		if (msg.inlinerolls && msg.inlinerolls.length) {
			return msg.inlinerolls.map(v => {
				const ti = v.results.rolls.filter(v2 => v2.table)
					.map(v2 => v2.results.map(v3 => v3.tableItem.name).join(", "))
					.join(", ");
				return (ti.length && ti) || v.results.total || 0;
			})
				.reduce((m, v, k) => m.replace(`$[[${k}]]`, v), msg.content);
		} else {
			return msg.content;
		}
	};

	/*
	 * Function to replace special characters in a string
	 */
	 
	var parseStr=function(str){
		return replacers.reduce((m, rep) => m.replace(rep[0], rep[1]), str);
	}

	/*
	 * Find a character sheet attribute object.  If not found, create it
	 */

	var findAttrObj = function( charCS, attrName ) {
		
		var attrObj = findObjs({ type:'attribute', characterid:charCS.id, name: attrName}, {caseInsensitive: true});
		if (!attrObj || attrObj.length == 0) {
			return createObj( 'attribute', {characterid:charCS.id, name:attrName, current:'0'} );
		} else {
			return attrObj[0];
		}
	}
		
	/*
	 * Get a bar value from the right place for this token.  This should be from 
	 * a bar current value on the token (to support multi-token monsters affected 
	 * individually by +/- magic impacts on bar values) but checks if another bar allocated
	 * or, if none are, get from character sheet (monster or character)
	 * NOTE: Different from RPGMaster Library function!!!
	 */
	 
	var getTokenValues = function( curToken, tokenBar, field, altField ) {
		
		var charCS = getObj('character', curToken.get('represents')),
			attr = field[0].toLowerCase(),
			altAttr = altField ? altField[0].toLowerCase() : 'EMPTY',
			property = field[1],
			attrVal = {}, attrObj, attrName, barName, linkedToken, fieldIndex;
			
		if (state.RPGMaster && state.RPGMaster.tokenFields) {
			fieldIndex = state.RPGMaster.tokenFields.indexOf( field[0] );
		} else {
			fieldIndex = parseInt(tokenBar[4]) || -1;
		}
			
		if (_.some( ['bar2_link','bar1_link','bar3_link'], linkName=>{
			let linkID = curToken.get(linkName);
			let tokenField = linkName;
			barName = '';
			if (linkID && linkID.length) {
				linkedToken = true;
				attrObj = getObj('attribute',linkID);
				if (attrObj) {
					attrName = attrObj.get('name').toLowerCase();
					barName = tokenField.substring(0,4);
//					log('getTokenVal: searching for "'+attr+'", found link to field "'+attrName+'" in '+linkName);
					return (attrName == attr) || (attrName == altAttr);
				}
			}
			return false;
		})) {
			attrName = {current:barName+'_value', max:barName+'_max'};
			attrVal = {current:attrObj.get('current'), max:attrObj.get('max')};
		}
//		log('getTokenVal: searching for "'+attr+'", after token search attrName="'+_.chain(attrName).pairs().flatten().value()+'", attrVal='+_.chain(attrVal).pairs().flatten().value()+', barName='+barName);
		if (isNaN(attrVal) && !linkedToken && fieldIndex >= 0) {
			barName = 'bar'+(fieldIndex+1);
			attrName = {current:barName+'_value', max:barName+'_max'};
			attrVal = {current:parseFloat(curToken.get(barName+'_value')),max:parseFloat(curToken.get(barName+'_max'))};
//			log('getTokenVal: searching for "'+attr+'", after unlinked token attrName="'+_.chain(attrName).pairs().flatten().value()+'", attrVal='+_.chain(attrVal).pairs().flatten().value()+', barName='+barName);
		}
		if (charCS && isNaN(parseFloat(attrVal.current))) {
			attrName = {current:'',max:''};
			if (attr.includes('thac0')) {
				attrObj = findAttrObj( charCS, fields.Thac0_base[0] );
				attrVal = {current:parseInt(attrObj.get('current')),
							max:parseInt(attrObj.get('max'))};
//				log('getTokenVal: searching for "'+attr+'", after char sheet thac0 search attrName="'+_.chain(attrName).pairs().flatten().value()+'", attrVal='+_.chain(attrVal).pairs().flatten().value()+', barName='+barName);
			}
			if (isNaN(parseFloat(attrVal.current))) {
				attrObj = findAttrObj( charCS, field[0] );
				attrVal = {current:parseInt(attrObj.get('current')),
							max:parseInt(attrObj.get('max'))};
//				log('getTokenVal: searching for "'+attr+'", after char sheet field search attrName="'+_.chain(attrName).pairs().flatten().value()+'", attrVal='+_.chain(attrVal).pairs().flatten().value()+', barName='+barName);
			}
			if (altField && isNaN(parseFloat(attrVal.current))) {
				attrObj = findAttrObj( charCS, altField[0] );
				attrVal = {current:parseInt(attrObj.get('current')),
							max:parseInt(attrObj.get('max'))};
			}
		}
//		log('getTokenVal: searching for "'+attr+'", after all searches attrName="'+_.chain(attrName).pairs().flatten().value()+'", attrVal='+_.chain(attrVal).pairs().flatten().value()+', barName='+barName);
		return [attrVal,attrName];
	}
	
	/**
	 * Prepare the turn order by checking if the tracker is present,
	 * if so, then we're resuming a previous turnorder (perhaps a restart).
	 * Fetch information from the state and double check that all refereces
	 * line up. If any references don't line up anymore, inform the GM of
	 * this, then remove them from the tracker. In the case of items existing
	 * on the tracker, perform normal impomtu add behavior.
	 */
	var prepareTurnorder = function(turnorder) {
		if (!turnorder) 
			{turnorder = Campaign().get('turnorder');}
		if (!turnorder) 
			{turnorder = [];}
		else if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}

		var tracker,
		    rounds,
		    roundCtrCmd; 

		if (tracker = _.find(turnorder, function(e,i) {if (parseInt(e.id) === -1 && parseInt(e.pr) === -100 && e.custom.match(/Round\s*\d+/)){return true;}})) {
			// resume logic
			// RED: v1.190 Set an attribute in the character sheet Initiative to the value of round
			// RED: v1.190 Requires that the API ChatSetAttr is loaded and Initiative exists
			// RED: v1.207 Added status flags to control if ChatSetAttr & Initiative exist
			// RED: v2.007 Added status and call to new initMaster API Script to set round using --isRound command
			rounds = tracker.custom.substring(tracker.custom.indexOf('Round')).match(/\d+/); 
			if (flags.canSetAttr && flags.canSetRoundCounter) {
    			roundCtrCmd = '!setattr --silent --name Initiative --round-counter|' + rounds;
    			sendRmAPI(roundCtrCmd);
			}
			if (flags.canUseInitMaster) {
			    roundCtrCmd = '!init --isRound ' + rounds;
			    sendRmAPI(roundCtrCmd);
			}
		} else {
			turnorder.push({
				id: '-1',
				pr: '-100',
				custom: 'Round 1',
			});

    		if (!state.roundMaster)
    			{state.roundMaster = {};}
            if (!state.roundMaster.round)
			    {state.roundMaster.round = 1;}
			//TODO only clear statuses that have a duration
			updateTurnorderMarker(turnorder);
		}
		if (!state.roundMaster)
			{state.roundMaster = {};}
		if (!state.roundMaster.effects)
			{state.roundMaster.effects = {};}
		if (!state.roundMaster.statuses)
			{state.roundMaster.statuses = [];}
		if (!state.roundMaster.favs)
			{state.roundMaster.favs = {};}
		if (!state.roundMaster.round)
			{state.roundMaster.round = 1;}
	};
	

	/**
	 * update the status display that appears beneath the turn order
	 * RED: v2.009 added isTurn boolean parameter which triggers increment
	 * of status marker count & calling any '-turn' effect macro
	 * RED: v3.006 changed so that public & hidden statuses are determined
	 * by who controls the character, a player or the GM
	 */
	var updateStatusDisplay = function(curToken,isTurn) {
		if (!curToken) {return;}
		var effects = getStatusEffects(curToken),
			isPlayer = isPlayerControlled( curToken ),
			gstatus,
			statusArgs,
			toRemove = [],
			content = '',
			hcontent = ''; 
			
		_.each(effects, function(e) {
			if (!e) {return;}
			statusArgs = e;
			gstatus = statusExists(e.name); 

			// RED: v1.204 only need to increment if the first or only turn in the round
			if (isTurn && parseInt(e.round) !== parseInt(state.roundMaster.round)) {
				let change = Math.max(state.roundMaster.round - statusArgs.round,0);
				e.duration = parseInt(statusArgs.duration) + 
					(parseInt(statusArgs.direction) * change);
				e.round = state.roundMaster.round;
				if (e.duration > 0) {
					// RED: v1.301 run the relevant effect-turn macro if it exists
					setTimeout( () => sendAPImacro( curToken, statusArgs.msg, statusArgs.name, change, '-turn' ),500 );
				}
			}
			if (gstatus.marker && isPlayer)
				{content += makeStatusDisplay(e);}
			else
				{hcontent += makeStatusDisplay(e)}
		});
		effects = _.reject(effects,function(e) {
			if (e.duration <= 0) {

					// RED: v1.301 when removing the status marker
					// run the relevant effect-end macro if it exists
		log('updateStatusDisplay: trying to run -end effect');
				setTimeout( () => sendAPImacro( curToken, e.msg, e.name, 0, '-end' ),500 );
				// remove from status args
				var removedStatus = updateGlobalStatus(e.name,undefined,-1);
				toRemove.push(removedStatus); 
				return true;	
			}
		});
		setStatusEffects(curToken,effects);
		updateAllTokenMarkers(toRemove); 			
		return {public: content, hidden: hcontent};
	};
	
	/**
	 * Update the global status array, if a status is removed, return the
	 * removed status (for final cleanup)
	 */
	var updateGlobalStatus = function(statusName, marker, inc) {
		if (!statusName || !inc || isNaN(inc)) {return;}
		var retval;
		statusName = statusName.toLowerCase();
		var found = _.find(state.roundMaster.statuses, function(e) {
			if (e.name === statusName) {
				retval = e;
				e.refc += inc;
				if (e.refc <= 0) {
					state.roundMaster.statuses = _.reject(state.roundMaster.statuses, function(e) {
						if (e.name === statusName)
							{return true;}
					});
				}
				return true;
			}
			else if (e.marker && e.marker === marker) {
				return true;
			}
			return false;
		});
		
		if (!found) {
			state.roundMaster.statuses.push({
				name: statusName.toLowerCase(),
				marker: marker,
				tag: libTokenMarkers.getStatus(marker).getTag(),
				refc: inc
			}); 
		}
		return retval;
	}; 

	/**
	 * Updates every token marker related to a status
	 */
	var updateAllTokenMarkers = function(toRemove) {
		var token,
			isPlayer,
			effects,
			tokenStatusString,
			statusName,
			status,
			replaceMarker,
			foundMarker,
			foundMarkerVal,
			markerVals,
			hasRemovedEffect;
		
		_.each(_.keys(state.roundMaster.effects), function(e) {
			token = getObj('graphic',e);
			if (!token) {
				return; 
			}
			effects = _.sortBy(getStatusEffects(token) || [], 'duration').reverse();
			tokenStatusString = token.get('statusmarkers');
			if (_.isUndefined(tokenStatusString) || tokenStatusString === 'undefined') {
				return;
			}
			if (!_.isString(tokenStatusString)) {
			    return;
			}
			
			isPlayer = isPlayerControlled(token);
			tokenStatusString = tokenStatusString.split(',');

			if (!!toRemove) {
				_.each(toRemove,function(e) {
					if (!e) {return;}
					hasRemovedEffect = _.findWhere(effects,{name:e.name}); 
					if (!hasRemovedEffect) {
						let marker = libTokenMarkers.getStatuses(e.tag);
						if (marker.length) marker[0].removeFrom(token);
					}
				}); 
			}

			tokenStatusString = token.get('statusmarkers').split(/\s*,\s*/g).filter(s => s.length);
			_.each(effects, function(elem) {
				statusName = elem.name.toLowerCase(); 
				status = _.findWhere(state.roundMaster.statuses,{name: statusName});
				if (status) {
					let marker = libTokenMarkers.getStatuses(status.tag);
					if (marker.length) {
						marker[0].removeFrom(token);
						if (isPlayer && elem.duration > 0 && elem.duration <= 9 && elem.direction !== 0) {
							marker[0].applyWithNumberTo(elem.duration,token);
						} else {
							marker[0].applyTo(token);
						}
					}
				}
			});
			
		});
	}; 

	/**
	 * Update the tracker's marker in the turn order
	 */ 
	var updateTurnorderMarker = function(turnorder) {
		if (!turnorder) 
			{turnorder = Campaign().get('turnorder');}
		if (!turnorder) 
			{return;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		var tracker,
			trackerpos; 
		
		if (!!(tracker = _.find(turnorder, function(e,i) {if (parseInt(e.id) === -1 && parseInt(e.pr) === -100 && e.custom.match(/Round\s*\d+/)){trackerpos = i;return true;}}))) {
			
			var indicator,
				graphic = findTrackerGraphic(),
				rounds = tracker.custom.substring(tracker.custom.indexOf('Round')).match(/\d+/); 

			if (rounds) {
				rounds = parseInt(rounds[0]);
			    state.roundMaster.round = rounds;
			}
			
			switch(flags.rw_state) {
				case RW_StateEnum.ACTIVE:
					graphic.set('tint_color','transparent'); 
					indicator = '\u23F5 ';
					break;
				case RW_StateEnum.PAUSED:
					graphic = findTrackerGraphic();
					graphic.set('tint_color','#FFFFFF'); 
					indicator = '\u23F8 ';
					break;
				case RW_StateEnum.STOPPED:
					graphic.set('tint_color','transparent'); 
					indicator = '\u23F9 ';
					break;
				default:
					indicator = tracker.custom.substring(0,tracker.custom.indexOf('Round')).trim();
					break;
			}
			tracker.custom = indicator + 'Round ' + rounds;
			
		}
		
		storeTurnorder(turnorder);
		
	};

	/**
	 * Status exists
	 */ 
	var statusExists = function(statusName) {
		return _.findWhere(state.roundMaster.statuses,{name: statusName}); 
	}; 
	
	/**
	 * get status effects for a token
	 */
	var getStatusEffects = function(curToken) {
		if (!curToken) 
			{return undefined;}
		
		var effects = state.roundMaster.effects[curToken.get('_id')];
		if (effects && effects.length > 0) 
			{return effects;}
		return undefined;
	}; 
	
	/**
	 *  set status effects for a token
	 */ 
	var setStatusEffects = function(curToken,effects) {
		if (!curToken) 
			{return;}
		
		if(Array.isArray(effects))
			{state.roundMaster.effects[curToken.get('_id')] = effects;}
	}; 

	/**
	 * Make the display for editing a status for multiple tokens.
	 * This differs from the single edit case in that it performs
	 * across several tokens. 
	 */ 
	var makeMultiStatusConfig = function(action, statusName, idString) {
		if (!action || !statusName || !idString) 
			{return;}

		var content = '',
			globalStatus = statusExists(statusName),
			mImg; 

		if (!statusName) {
		    sendDebug('makeMultiStatusConfig: Invalid syntax - statusName undefined');
		    return '<span style="color: red; font-weight: bold;">Invalid syntax</span>'; 
		}
		if (!globalStatus) {
		    dendDebug('makeMultiStatusConfig: Status no longer exists - globalStatus undefined');
		    return '<span style="color: red; font-weight: bold;">Status no longer exists</span>'; 
		}

		mImg = libTokenMarkers.getStatuses( globalStatus.marker ); 
		if (mImg.length) 
			{mImg = '<img src="' + mImg[0].url + '"></img>';}
		else
			{mImg = 'none';}

		content += '<div style="background-color: '+design.statuscolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center;">'
			+ '<div style="border-bottom: 2px solid black;">'
				+ '<table width="100%"><tr><td width="100%"><span style="font-weight: bold; font-size: 125%">Edit Group Status "'+statusName+'"</span></td></tr></table>'
			+ '</div>'
			+ '<table width="100%">' 
				+ '<tr style="background-color: #FFF; border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Name</span><br>'+'<span style="font-style: italic;">'+statusName+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Name" href="!rounds --edit_multi_status '
							+ statusName + ' @ name @ ?{name|'+statusName+'} @ ' + idString
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>' 
				+ '<tr style="background-color: #FFF; border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Marker</span><br>'+'<span style="font-style: italic;">'+mImg+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Marker" href="!rounds --edit_multi_status '
							+ statusName + ' @ marker @ 1 @ ' + idString
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>' 
				+ '<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Duration</span><br>'+'<span style="font-style: italic;">Varies</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Duration" href="!rounds --edit_multi_status '
							+ statusName + ' @ duration @ ?{duration|1} @ ' + idString
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>' 
				+ '<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Direction</span><br>'+'<span style="font-style: italic;">Varies</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Direction" href="!rounds --edit_multi_status '
							+ statusName + ' @ direction @ ?{direction|-1} @ ' + idString
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'
				+ '<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Message</span><br>'+'<span style="font-style: italic;">Varies</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Message" href="!rounds --edit_multi_status '
							+ statusName + ' @ message @ ?{message} @ ' + idString
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'
			+ '</table>' 
			+ '</div>'; 

		return content; 
			
	}; 

	/**
	 * Make the display for multi-token configuration in selecting
	 * which status to edit for the group of tokens selected.
	 */ 
	var makeMultiTokenConfig = function(tuple) {
		if (!tuple) 
			{return;}

		var content = '',
			midcontent = '',
			gstatus,
			markerdef;   

		_.each(tuple, function(e) {
			gstatus = statusExists(e.statusName);
			if (!gstatus) 
				{return;}
			markerdef = libTokenMarkers.getStatuses(gstatus.marker);
			midcontent += 
				'<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ (markerdef.length ? ('<td width="21px" height="21px">'
						+ '<div style="width: 21px; height: 21px;"><img src="'+markerdef[0].url+'"></img></div>'
					+ '</td>'):'<td width="0px" height="0px"></td>')
					+ '<td>'
						+ e.statusName
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit '+e.statusName+' status" ' 
							+ 'href="!rounds --dispmultistatusconfig change @ ' + e.statusName + ' @ ' + e.id
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px;  border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Remove '+e.statusName+' status" '
							+ 'href="!rounds --dispmultistatusconfig remove @ ' + e.statusName + ' @ ' + e.id
							+ '"><img src="'+design.delete_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'; 
		});

		if ('' === midcontent) {
			midcontent = '<span style="font-style: italic;">No Status Effects Present</span>'; 
		}

		content += '<div style="background-color: '+design.statuscolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center;">'
			+ '<div style="border-bottom: 2px solid black; font-size: 125%; font-weight: bold; ">'
				+ 'Edit Status Group'
			+ '</div>'
			+ '<div style="border-bottom: 2px solid black; font-size: 75%; ">'
				+ '<span style="color: red; font-weight: bold;">Warning: </span> Changing a status across multiple tokens will change the status for <b><u><i>all selected</i></u></b> tokens.'
			+ '</div>'
			+ '<table width="100%">';
		content += midcontent; 
		content += '</table></div>'; 
		return content; 
	}; 

	/**
	 * Build marker selection display
	 */ 
	var makeMarkerDisplay = function(statusName,favored,custcommand) {
		var markerList = '',
			takenList = '',
			command,
			taken,
			statusMarkers = libTokenMarkers.getOrderedList(),
			content;   

		_.each(statusMarkers,function(e) {
			let sName = e.getName();
			if (!favored)
				{command = (!custcommand ? ('!rounds --marker ' + sName + ' %% ' + statusName) : (custcommand+sName));}
			else
				{command = (!custcommand ? ('!rounds --marker ' + sName + ' %% ' + statusName + ' %% ' + 'fav') : (custcommand+sName));}
			//n*m is evil
			if (!favored && (taken = _.findWhere(state.roundMaster.statuses,{marker: sName}))) {
				takenList += '<div style="float: left; padding: 1px 1px 1px 1px; width: 25px; height: 25px;">' 
					+ '<span class="showtip tipsy" title="'+taken.name+'" style="width: 21px; height: 21px"><img style="text-align: center;" src="'+e.url+'"></img></span>'
					+'</div>';
			} else {
				markerList += '<div style="float: left; padding: 1px 1px 1px 1px; width: 25px; height: 25px;">' 
					+ '<span class="showtip tipsy" title="'+sName+'" style="width: 21px; height: 21px">'
					+ '<a style="font-size: 0px; background-color: white; background-image: url('+e.url+') centre centre norepeat; width: 21px; height: 21px" href="'+command+'"><img style="text-align: center;" src="'+e.url+'"></img></a></span>'
					+ '</div>';	  
			}
		});
		content = '<div style="font-weight: bold; background-color: #FFF; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; margin-left: 2px; margin-right: 2px; padding-top: 5px; padding-bottom: 5px;">'
					+ '<div style="text-align: center;  border-bottom: 2px solid black;">'
						+ '<span style="font-weight: bold; font-size: 125%">Available Markers</span>'
					+ '</div>'
					+ '<div style="padding-left: 1px; padding-right: 1px; overflow: hidden;">'
						+ markerList
						+'<div style="clear:both;"></div>'
					+ '</div>'
					+ (takenList ? ('<br>'
						+ '<div style="border-top: 2px solid black; border-bottom: 2px solid black;">'
							+ '<span style="font-weight: bold; font-size: 125%">Taken Markers</span>'
						+ '</div>'
						+ '<div style="padding-left: 1px; padding-right: 1px; overflow: hidden;">'
							+ takenList
							+'<div style="clear:both;"></div>'
						+ '</div>'):'')
				+ '</div>'; 
		
		return content;
	};
	
	/**
	 * Build status display
	 */ 
	var makeStatusDisplay = function(statusArgs) {
		var content = '',
			gstatus = statusExists(statusArgs.name),
			markerdef; 

		if (gstatus && gstatus.marker)
			{markerdef = libTokenMarkers.getStatuses(gstatus.marker);}
		
		content += '<div style="font-weight: bold; font-style: italic; color: '+design.statuscolor+'; background-color: '+design.statusbgcolor+'; border: 2px solid '+design.statusbordercolor
			+'; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 1em; text-align: center;">'
			+ '<table width="100%">' 
			+ '<tr>'
			+ (markerdef.length ? ('<td><div style="width: 21px; height: 21px;"><img src="'+markerdef[0].url+'"></img></div></td>'):'')
			+ '<td width="100%">'+(/_([^_]+)_?/.exec(statusArgs.name) || ['',statusArgs.name])[1] + ' ' + (parseInt(statusArgs.direction) === 0 ? '': (parseInt(statusArgs.duration) <= 0 ? '<span style="color: red;">Expiring</span>':statusArgs.duration))
			+ (parseInt(statusArgs.direction)===0 ? '<span style="font-size: larger; color: blue;">\u221E</span>' : (parseInt(statusArgs.direction) > 0 ? '<span style="color: green;">\u25B2(+'+statusArgs.direction+')</span>':'<span style="color: red;">\u25BC('+statusArgs.direction+')</span>'))
			+ ((statusArgs.msg) ? ('<br><span style="color: #000">' + getFormattedRoll(parseStr(statusArgs.msg)) + '</span>'):'')+'</td>'
			+ '</tr>' 
			+ '</table>'
			+ '</div>'; 
		return content;
	};
	
	/**
	 * Build round display
	 */ 
	var makeRoundDisplay = function(round) {
		if (!round) 
			{return;}
		var content = '';
		
		content += '<div style="padding: 10px 10px 10px 10px; text-shadow: 1px 1px 2px #000, 0px 0px 1em #FFF, 0px 0px 0.2em #FFF, 1px 1px 1px #FFF; font-style: normal; font-size: 150%; font-weight: bold; color: #FFF; background-color: '+design.roundcolor+'; border: 3px solid #FFF; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 2em; text-align: center;">'
			+ 'Round ' + round
			+'</div>';
		return content;
	};

	/**
	 * Build turn display
	 */ 
	var makeTurnDisplay = function(curToken,msg,isGM=false) {
		if (!curToken) 
			{return;}

		var content = '', 
			journal, 
			journalId,
			name, 
			player,
			action = '',
			speedobj,
			speed = 0,
			controllers = getTokenControllers(curToken);  

        // RED: v1.202 don't ever display a name if !showplayers_name
		if (curToken.get('showplayers_name') || isGM) {
			if ((journal = getObj('character',curToken.get('represents')))) {
    
				journalId = journal.get('_id');
				name = characterObjExists('character_name','attribute',journalId); 
				if (name) {
					name = name.get('current');
				} else {
					name = curToken.get('name');
				}
    			// else 
    			// 	{name = journal.get('name');}
				if (!msg && (action = characterObjExists('init_action','attribute',journalId)))
					{action = action.get('current');}
				else
					{action = msg;}
				if (speedobj = characterObjExists('init_speed','attribute',journalId)) {
				    speed = parseInt(speedobj.get('current'))/10;
				    if (speed > 1) {
				        speedobj.set('current',(speed*10)-10);
				        if (speedobj = characterObjExists('init-carry_speed','attribute',journalId))
				            {speedobj.set('current',(speed*10)-10);}
				    } else if (speedobj = characterObjExists('init-carry','attribute',journalId)) {
				        speedobj.set('current',0);
				    }
				} 
			} else {
				name = curToken.get('name');
			}
		}
		
		content += '<div style="background-color: '+design.turncolor+'; font-weight: bold; font-style: italic; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center; min-height: 50px;">'
			+ '<table width="100%">'
			+ '<tr>'
			+ '<td width="50px" height="50px"><div style="margin-right 2px; padding-top: 2px; padding-bottom: 2px; padding-left: 2px; padding-right: 2px; text-align: center; width: 50px">' 
			+ '<img width="50px" height="50px" src="' + curToken.get('imgsrc') + '"></img></div></td>'
			+ '<td width="100%">' 
			+ (name ? ('It is ' + name + '\'s turn ' + action + (speed > 1 ? (' for ' + speed + ' more rounds') : '')) : 'Turn') 
			+ '</td>'
			+ '<td width="32px" height="32px">'
			+ '<a style="width: 20px; height: 18px; background: none; border: none;" href="!rounds --disptokenconfig '+curToken.get('_id')+'"><img src="'+design.settings_icon+'"></img></a>'
			+ '</td>'
			+ '</tr>';
		
		if (_.find(controllers,function(e){return (e === 'all');})) {
			content += '<tr>'
				+ '<td colspan="3"><div style="margin-left: -2px; font-style: normal; font-weight: bold; font-size: 125%; text-shadow: -1px -1px 1px #FFF, 1px -1px 1px #FFF, -1px 1px 1px #FFF, 1px 1px 1px #FFF; color #FFF; border: 2px solid #000; width: 100%; background-color: #FFF;">All Players</div></td>'
				+ '</tr>';
		} else {
			_.each(controllers,function(e) {
				player = getObj('player',e);
				if (player) {
					content += '<tr>'
						+ '<td colspan="3"><div style="margin-left: -2px; font-style: normal; font-weight: bold; font-size: 125%; text-shadow: -1px -1px 1px #000, 1px -1px 1px #000, -1px 1px 1px #000, 1px 1px 1px #000; color: #FFF; border:2px solid #000; width: 100%; background-color: ' + player.get('color') + ';">' + player.get('displayname') + '</div></td>'
						+ '</tr>';
				}
			});
		}
		content += '</table>'
			+ "</div>";
		
		return content;
	};

	/**
	 * RED: v1.203 Build Initiative roll display
	 */ 
	var makeInitiativeDisplay = function(curToken,initiative,msg) {
		if (!curToken) 
			{return;}

		var content = '', 
			journal, 
			name, 
			player,
			controllers = getTokenControllers(curToken);  

		if ((journal = getObj('character',curToken.get('represents')))) {

			name = characterObjExists('name','attribute',journal.get('_id')); 
			if (name) {
    			name = name.get('current');
    		} else {
				name = curToken.get('name');
    		}
	    } else {
			name = curToken.get('name');
	    }

		content += '<div style="background-color: '+design.turncolor+'; font-weight: bold; font-style: italic; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center; min-height: 50px;">'
				+ '<table width="100%">'
				+ '<tr>'
				+ '<td width="50px" height="50px"><div style="margin-right 2px; padding-top: 2px; padding-bottom: 2px; padding-left: 2px; padding-right: 2px; text-align: center; width: 50px">' 
					+ '<img width="50px" height="50px" src="' + curToken.get('imgsrc') + '"></img></div></td>'
				+ '<td width="100%">' 
					+ name + '\'s initiative is ' + parseInt(initiative) + ' ' + msg
				+ '</td>'
				+ '<td width="32px" height="32px">'
					+ '<a style="width: 20px; height: 18px; background: none; border: none;" href="!rounds --disptokenconfig '+curToken.get('_id')+'"><img src="'+design.settings_icon+'"></img></a>'
				+ '</td>'
				+ '</tr>';
		
		content += '</table>'
				+ "</div>";
		
		return content;
	};

	/**
	 * Build a listing of favorites with buttons that allow them
	 * to be applied to a selection.
	 */
	var makeFavoriteConfig = function() {
		var midcontent = '',
			content = '',
			markerdef; 

		_.each(state.roundMaster.favs,function(e) {
			markerdef = libTokenMarkers.getStatuses(e.marker);
			midcontent += 
				'<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ (markerdef.length ? ('<td width="21px" height="21px">'
						+ '<div style="width: 21px; height: 21px;"><img src="'+markerdef[0].url+'"></img></div>'
					+ '</td>'):'<td width="0px" height="0px"></td>')
					+ '<td>'
						+ e.name
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px;  border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Apply '+e.name+' status" href="!rounds --applyfav '
							+ e.name
							+ '"><img src="'+design.apply_icon+'"></img></a>' 
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit '+e.name+' status" href="!rounds --dispstatusconfig '
							+ ' %% changefav %% '+e.name
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px;  border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Remove '+e.name+' status" href="!rounds --dispstatusconfig '
							+ ' %% removefav %% '+e.name
							+ '"><img src="'+design.delete_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'; 
		});

		if ('' === midcontent)
			{midcontent = 'No Favorites Available';}

		content = '<div style="background-color: '+design.statuscolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center;">'
			+ '<div style="font-weight: bold; font-size: 125%; border-bottom: 2px solid black;">'
				+ 'Favorites'
			+ '</div>'
			+ '<table width="100%">'; 
		content += midcontent; 
		content += '</table></div>'; 

		return content; 
	};

	/**
	 * Build a settings dialog given a token that has effects upon it.
	 */ 
	var makeStatusConfig = function(curToken, statusName, favored) {
		if (!statusName || (!curToken && !favored)) {
		    sendDebug('makeStatusConfig: Invalid syntax - statusName or both curToken and favored undefined');
			return '<span style="color: red; font-weight: bold;">Invalid syntax</span>'; 
		}
		var globalStatus = statusExists(statusName),
			effects = getStatusEffects(curToken),
			status = _.findWhere(effects,{name:statusName}),
			mImg,
			content = ''; 

		if (!favored && (!status || !globalStatus)) {
		    sendDebug('makeStatusConfig: Invalid syntax - favored or both status and globalStatus undefined');
			return '<span style="color: red; font-weight: bold;">Invalid syntax</span>'; 
		}

		if (favored) {
			status=favored;
			globalStatus=favored;
		}
		
		if (!globalStatus || !status) {
		    sendDebug('makeStatusConfig: Status does not exist internally - globalStatus or status not found');
			return '<span style="color: red; font-weight: bold;">Status does not exist internally</span>'; 
		}

		mImg = libTokenMarkers.getStatuses(globalStatus.marker); 
		if (!!mImg.length) 
			{mImg = '<img src="'+mImg[0].url+'"></img>';}
		else
			{mImg = 'none';}

		content += '<div style="background-color: '+design.statuscolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center;">'
			+ '<div style="border-bottom: 2px solid black;">'
				+ '<table width="100%"><tr><td width="100%"><span style="font-weight: bold; font-size: 125%">'+ (favored ? 'Edit Favorite' :('Edit "'+statusName+'" for'))+'</span></td>'+(favored ? ('<td width="100%">'+statusName+'</td>') : ('<td width="32px" height="32px"><div style="width: 32px; height: 32px"><img src="'+curToken.get('imgsrc')+'"></img></div></td>')) + '</tr></table>'
			+ '</div>'
			+ '<table width="100%">' 
				+ '<tr style="background-color: #FFF; border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Name</span><br>'+'<span style="font-style: italic;">'+statusName+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Name" href="!rounds --edit_status '
							+ (favored ? 'changefav':'change')+' %% ' + (favored ? (''):(curToken.get('_id'))) +' %% '+statusName+' %% name %% ?{name|'+statusName+'}' 
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>' 
				+ '<tr style="background-color: #FFF; border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Marker</span><br>'+'<span style="font-style: italic;">'+mImg+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Marker" href="!rounds --edit_status '
							+ (favored ? 'changefav':'change')+' %% ' + (favored ? (''):(curToken.get('_id'))) +' %% '+statusName+' %% marker %% mark' 
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>' 
				+ '<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Duration</span><br>'+'<span style="font-style: italic;">'+status.duration+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Duration" href="!rounds --edit_status '
							+ (favored ? 'changefav':'change')+' %% ' + (favored ? (''):(curToken.get('_id'))) +' %% '+statusName+' %% duration %% ?{duration|'+status.duration+'}' 
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>' 
				+ '<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Direction</span><br>'+'<span style="font-style: italic;">'+status.direction+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Direction" href="!rounds --edit_status '
							+ (favored ? 'changefav':'change')+' %% ' + (favored ? (''):(curToken.get('_id'))) +' %% '+statusName+' %% direction %% ?{direction|'+status.direction+'}' 
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'
				+ '<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ '<td>'
						+ '<div><span style="font-weight: bold;">Message</span><br>'+'<span style="font-style: italic;">'+status.msg+'</span></div>' 
					+ '</td>' 
					+ '<td width="32px" height="32px">' 
						+ '<a style= "width: 16px; height: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit Message" href="!rounds --edit_status '
							+ (favored ? 'changefav':'change')+' %% ' + (favored ? (''):(curToken.get('_id'))) +' %% '+statusName+' %% message %% ?{message|'+status.msg+'}' 
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'
				+ (favored ? '':('<tr>'
					+ '<td colspan="2">'
						//+ '<a href="!CreatureGen -help">cookies</a>' 
						//+ '<a style="font-weight: bold" href="!rounds --addfav '+statusName+' %% '+status.duration+' %% '+status.direction+' %% '+status.msg+' %% '+globalStatus.marker+'"> Add to Favorites</a>'
						+ RoundMaster_tmp.getTemplate({command: '!rounds --addfav '+statusName+' %% '+status.duration+' %% '+status.direction+' %% '+status.msg+' %% '+globalStatus.marker, text: 'Add to Favorites'},'button')

					+ '</td>' 
				+ '</tr>'))
			+ '</table>' 
			+ '</div>'; 

		return content; 
		
	}; 

	/**
	 * Build the token dialog to display statuses effecting it
	 */
	var makeTokenConfig = function(curToken) {
		if (!curToken) 
			{return;}

		var content = '',
			midcontent = '',
			gstatus,
			markerdef,
			effects = getStatusEffects(curToken); 

		_.each(effects, function(e) {
			gstatus = statusExists(e.name);
			if (!gstatus) 
				{return;}
			markerdef = libTokenMarkers.getStatuses(gstatus.marker);
			midcontent += 
				'<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ (!!markerdef.length ? ('<td width="21px" height="21px">'
						+ '<div style="width: 21px; height: 21px;"><img src="'+markerdef[0].url+'"></img></div>'
					+ '</td>'):'<td width="0px" height="0px"></td>')
					+ '<td>'
						+ e.name
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px; border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Edit '+e.name+' status" href="!rounds --dispstatusconfig '
							+ curToken.get('_id')+' %% change %% '+e.name
							+ '"><img src="'+design.edit_icon+'"></img></a>' 
					+ '</td>'
					+ '<td width="32px" height="32px">' 
						+ '<a style="height: 16px; width: 16px;  border: 1px solid '+design.statusbordercolor+'; border-radius: 0.2em; background: none" title="Remove '+e.name+' status" href="!rounds --dispstatusconfig '
							+ curToken.get('_id')+' %% remove %% '+e.name
							+ '"><img src="'+design.delete_icon+'"></img></a>' 
					+ '</td>'
				+ '</tr>'; 
		});

		if ('' === midcontent) {
			midcontent += '<tr><td><div style="text-align: center; font-style: italic;">No Status Effects Present</div></td></tr>'; 
		}
		
		content += '<div style="background-color: '+design.statuscolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center;">'
			+ '<div style="border-bottom: 2px solid black;">'
				+ '<table width="100%"><tr><td width="100%"><span style="font-weight: bold; font-size: 125%">Statuses for</span></td><td width="32px" height="32px"><div style="width: 32px; height: 32px"><img src="'+curToken.get('imgsrc')+'"></img></div></td></tr></table>'
			+ '</div>'
			+ '<table width="100%">';
		content += midcontent; 
		content += '</table>'; 
		
		// RED: changed the parameter seperator in the -addstatus call below from ':' to '|'
		// RED: to allow use of !rounds calls in API Buttons
		content += '</div>'; 
		return content;
	}; 

	/**
	 * Show a listing of markers
	 */
	var doShowMarkers = function() {
		var disp = makeMarkerDisplay();
		sendFeedback(disp);
	}; 

	/**
	 * Is a tracker
	 */
	var isTracker = function(turn) {
		if (parseInt(turn.id) === -1 
		&& parseInt(turn.pr) === -100
		&& turn.custom.match(/Round\s*\d+/))
			{return true;}
		return false;
	};
	
	/**
	 * Get the graphic object for the tracker (if any) for the current page.
	 * If it does not exist, create it. Avoid creating a duplicate where possible
	 */
	var findTrackerGraphic = function(pageid) { 
		var graphic = getObj('graphic',fields.trackerId),
			curToken = findCurrentTurnToken(); 
		
		pageid = (pageid ? pageid : (curToken ? curToken.get('_pageid') : Campaign().get('playerpageid'))); 
		
		if (graphic && graphic.get('_pageid') === pageid) {
			return graphic;
		} else {
			// we find the graphic
			var cannidates = findObjs({
				_pageid: pageid,
				_type: 'graphic',
				name: fields.trackerName,
			});
			if (cannidates && cannidates[0]) {
				graphic = cannidates[0];
				fields.trackerId = graphic.get('_id');
				return graphic;
			} else {
				// we make the graphic
				graphic = createObj('graphic', {
					_type: 'graphic',
					_subtype: 'token',
					_pageid: pageid,
					name: fields.trackerName,
					imgsrc: fields.trackerImg,
					layer: 'gmlayer',
					width: 70,
					height: 70,
				});
				fields.trackerId = graphic.get('_id');
				return graphic;
			}
		}
		
	};
	
	/**
	 * Find the current token at the top of the tracker if any
	 */ 
	var findCurrentTurnToken = function(turnorder) {
		if (!turnorder) 
			{turnorder = Campaign().get('turnorder');}
		if (!turnorder) 
			{return undefined;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		if (turnorder && turnorder.length > 0 && turnorder[0].id !== -1)
			{return getObj('graphic',turnorder[0].id);}
		return;
	};
	
	/**
	 * Announce the round
	 */
	var announceRound = function(round) {
		if (!round) 
			{return;} 
		var disp = makeRoundDisplay(round);
		sendPublic(disp);
	};
	
	/**
	 * Announce the turn with an optional rider display
	 */
	var announceTurn = function(curToken,statusRiders,msg) {
		if (!curToken) 
			{return;}
		var disp = makeTurnDisplay(curToken,msg);
		disp += statusRiders.public;
		sendPublic(disp);
		if (!isPlayerControlled( curToken )) {
			disp = makeTurnDisplay(curToken,msg,true);
			disp += statusRiders.public;
			disp += statusRiders.hidden; 
			sendFeedback(disp);
		}
	}; 

	/**
	* RED: function to get an alpha comparison of two turnorder entries
	**/
	var compareTokenNames = function(a,b) {
		if (!a || !b) {return 0};
		var name1, name2, curToken;
		if (parseInt(a.id) === -1) {
			name1 = a.custom;
		} else {
			curToken = getObj('graphic',a.id);
			name1 = curToken.get('name');
		}
		if (parseInt(b.id) === -1) {
			name2 = b.custom;
		} else {
			curToken = getObj('graphic',b.id);
			name2 = curToken.get('name');
		}
		if (name1 === name2) {
			return 0;
		} else {
			return (name1 > name2 ? 1 : -1);
		}
	};
	
	/**
	 * Add or remove a playerid to control a character associated with a token
	 */
	 
	var addRemovePID = function(curToken,viewerID,addPlayer,addNPC) {
        if (!curToken) {return;}

		var charCS,
			controllers, curCtrl, allCtrl, viewerCtrl = false,
			tokenSight, curSight,
			player = getObj('player',viewerID),
			viewerName = player.get('_displayname'),
    		charID = curToken.get('represents');

		charCS = (charID) ? getObj('character',charID) : false;
		controllers = (charCS) ? (charCS.get('controlledby') || '') : '';
		if (!controllers && !addNPC) {return;}
		curSight = curToken.get('has_bright_light_vision');
        if (!_.isUndefined(state.roundMaster.viewer[curToken.id])) {
            tokenSight = state.roundMaster.viewer[curToken.id] = curSight;
        } else {
			tokenSight = false;
		}

		curCtrl = controllers.includes(viewerID);
		allCtrl = controllers.includes('all');
		controllers = controllers.split(',').filter(id => (!!id && id != viewerID));
		addNPC = addNPC || controllers.length;
		if (addPlayer && addNPC && !allCtrl) {
		    state.roundMaster.viewer[curToken.id] = curSight;
			controllers.push(viewerID);
			viewerCtrl = tokenSight = true;
		}
		
		if (viewerCtrl != curCtrl) {
			charCS.set('controlledby',controllers.join());
		}
		if (tokenSight != curSight) {
			curToken.set('has_bright_light_vision',tokenSight);
		}
		if ((viewerCtrl != curCtrl) || (tokenSight != curSight)) {
			setTimeout(function() {
				curToken.set('left',(curToken.get('left')+(state.roundMaster.round%2 ? 1 : -1)));     // moving the token forces a screen update for ray tracing
			},400);
		}
		return;
	}
				
	/**
	 * Handle the turn order advancement given the current and prior ordering
	 */
	var handleAdvanceTurn = function(turnorder,priororder) {
		if (flags.rw_state === RW_StateEnum.STOPPED || flags.rw_state === RW_StateEnum.PAUSED || !turnorder || !priororder) 
			{return;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		if (typeof(priororder) === 'string') 
			{priororder = JSON.parse(priororder);}
		var currentTurn = turnorder[0],
		    newRound = false,
			curPageID = Campaign().get('playerpageid'),
			playerPages = Campaign().get('playerspecificpages'),
			viewerPageID = playerPages[state.roundMaster.viewer.pid] || curPageID,
			newRoundSort = function(turnorder,sortorder) {
				switch (sortorder) {
				case TO_SortEnum.NUMASCEND:
					turnorder.sort(function(a,b) {  return parseInt(a.pr) - parseInt(b.pr); }); break;
				case TO_SortEnum.NUMDESCEND:
					turnorder.sort(function(a,b) { return parseInt(b.pr) - parseInt(a.pr); }); break;
				case TO_SortEnum.ALPHAASCEND:
					turnorder.sort(function(a,b) { return compareTokenNames(a,b); }); break;
				case TO_SortEnum.ALPHADESCEND:
					turnorder.sort(function(a,b) { return compareTokenNames(b,a); }); break;
				}
				return turnorder;
			};
		
		if (currentTurn) {
			if (turnorder.length > 1
			&& isTracker(currentTurn)) {
				// ensure that last turn we weren't also atop the order
				if (!priororder || isTracker(priororder[0])) 
					{return;}
				var rounds = parseInt(currentTurn.custom.match(/\d+/)[0]),
				    roundCtrCmd;
				// RED: this is a newRound
				newRound = flags.clearonnewround;
				rounds++;
				currentTurn.custom = currentTurn.custom.substring(0,currentTurn.custom.indexOf('Round')) 
					+ 'Round ' + rounds;
				announceRound(rounds);
				turnorder.shift();
				// RED: Remove Graphic if clearing the turnorder on a newRound
				// RED: v3.011 If there is a "Viewer" player, add it back into control 
				//      list for character sheets
				if (flags.clearonnewround) {
					var trackergraphics = findObjs({
						_type: 'graphic',
						name: fields.trackerName,
					});
					_.each(trackergraphics, function(elem) {
						if (elem)
							{elem.remove();} 
					});
					if (state.roundMaster.viewer.is_set) {
						filterObjs( obj => {
							if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') {return false;}
							addRemovePID(obj,state.roundMaster.viewer.pid,true,false);
						});
						state.roundMaster.viewer.tokenID = '';
					}
				} else {
					turnorder = newRoundSort(turnorder,flags.newRoundSort);
				};
				// RED: v1.204 visit every token with statuses and update them if not already done
				// TODO
        		_.each(_.keys(state.roundMaster.effects), function(e) {
        			var token = getObj('graphic',e);
        			if (!token) {
        				return; 
        			}
        			updateStatusDisplay(token,true);
        		});
				turnorder.push(currentTurn);
				currentTurn = turnorder[0];
				updateTurnorderMarker(turnorder);
                
				// RED: v1.204 set the global round state variable to the current round number
				state.roundMaster.round = rounds;

                // RED: v2.007 introduced the new initMaster API script.  Send it the round counter
				// RED: v3.019 added an InitMaster initiative management menu to support AD&D2e
				// Standard, Group & Individual initiative types, take initiative dice rolls, and
				// manage the player characters for which initiative is done
                if (flags.canUseInitMaster) {
                    roundCtrCmd = '!init --isRound ' + rounds + ' --init ||rounds';
                    sendRmAPI(roundCtrCmd);
                }
			
			// RED: v1.202 If just advanced into the start of a new round, sort the turnorder
			} else if (turnorder.length > 1 && !!priororder) {
			    if (isTracker(priororder[0])) {

    				//RED: sort the turnorder according to the configuration
    				var priorturn = turnorder.pop();
					turnorder = newRoundSort(turnorder,flags.newRoundSort);
					if (state.roundMaster.viewer.is_set) {
						filterObjs( obj => {
							if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token' || obj.get('_pageid') !== viewerPageID) {return false;}
							addRemovePID(obj,state.roundMaster.viewer.pid,(obj.id === turnorder[0].id),false);
						});
						state.roundMaster.viewer.tokenID = '';
						
					}
    				turnorder.push(priorturn);
    				updateTurnorderMarker(turnorder);
    				currentTurn = turnorder[0];
			    }
			}
			// RED: v1.190 vary the behavior based on a config re clear on newRound
			if (!newRound) {
			    if (currentTurn.id !== -1 && priororder) {
		    	    var curToken = getObj('graphic',currentTurn.id);
                    if (priororder[0].id !== currentTurn.id) {
			    		var graphic,
					        priorToken = getObj('graphic',priororder[0].id),
				    	    maxsize = 0;
					    if (!curToken) {
							sendDebug( 'handleAdvanceTurn: invalid token in turnorder' );
						} else {
							if (state.roundMaster.viewer.is_set) {
							    var showPC = !isPlayerControlled(curToken);
        						filterObjs( obj => {
        							if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token' || obj.get('_pageid') !== viewerPageID) {return false;}
        							addRemovePID(obj,state.roundMaster.viewer.pid,(showPC || obj.id == curToken.id),false);
        						});
								state.roundMaster.viewer.tokenID = curToken.id;
							}
								
							if (priorToken && priorToken.get('_pageid') !== curToken.get('_pageid')) {	
								graphic = findTrackerGraphic(priorToken.get('_pageid')); 
								graphic.set('layer','gmlayer');
							}
							graphic = findTrackerGraphic(); 

							if (flags.rw_state === RW_StateEnum.ACTIVE)
								{flags.rw_state = RW_StateEnum.FROZEN;}
							maxsize = Math.max(parseInt(curToken.get('width')),parseInt(curToken.get('height')));
							graphic.set('layer','gmlayer');
							graphic.set('left',curToken.get('left'));
							graphic.set('top',curToken.get('top'));
							graphic.set('width',parseFloat(maxsize*fields.trackerImgRatio));
							graphic.set('height',parseFloat(maxsize*fields.trackerImgRatio));
							toFront(curToken); 
							setTimeout(function() {
								if (graphic) {
									if (curToken.get('layer') === 'gmlayer') {
										graphic.set('layer','gmlayer');
										toBack(graphic);
									} else {
										graphic.set('layer','map');
										toFront(graphic);
									}
									if (flags.rw_state === RW_StateEnum.FROZEN)
										{flags.rw_state = RW_StateEnum.ACTIVE;}
								}
							},500);
							// Manage status
							// Announce Turn
						}
				    }
					if (curToken) {
						announceTurn(curToken,updateStatusDisplay(curToken,true),currentTurn.custom);
					}
				}
			}
		}
		
		storeTurnorder(turnorder);
		if (newRound) {
		    doClearTurnorder();
		}
	};

	/**
	 * Check if a favorite status exists
	 */
	var favoriteExists = function(statusName) {
		statusName = statusName.toLowerCase(); 
		var found = _.find(_.keys(state.roundMaster.favs), function(e) {
			return e === statusName; 
		});
		if (found)
			{found = state.roundMaster.favs[found]; }
		return found; 
	}; 

	/**
	 * Produce a listing of favorites
	 */
	var doApplyFavorite = function(statusName,selection) {
		if (!statusName) 
			{return;}
		statusName = statusName.toLowerCase(); 

		var fav = favoriteExists(statusName),
			markerdef, 
			curToken,
			effectId,
			effectList,
			status,
			content = '',
			midcontent = ''; 

		if (!fav) {
		    sendDebug('doApplyFavorite: ' + statusName + ' is not a known status');
			sendError('<b>"'+statusName+'"</b> is not a known favorite status');
			return; 
		}

		var markerUsed = _.find(state.roundMaster.statuses, function(e) {
			if (typeof(e.marker) !== 'undefined' 
			&& e.marker === fav.marker
			&& e.name !== fav.name)
				{return true;}
		});

		if (markerUsed) {
			markerdef = libTokenMarkers.getStatus(markerUsed.marker);
			sendError('Status <i>"'+markerUsed.name+'"</i> already uses marker '+markerdef.getHTML()+'. You can either change the marker for favorite <i>"'+statusName+'"</i> or the marker for <i>"'+markerUsed.name+'"</i>');
			return; 
		}

		markerdef = libTokenMarkers.getStatuses(fav.marker);

		_.each(selection,function(e) {
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
			effectId = e._id;
			effectList = state.roundMaster.effects[effectId];
			
			if ((status = _.find(effectList,function(elem) {return elem.name.toLowerCase() === fav.name.toLowerCase();}))) {
				return;
			} else if (effectList && Array.isArray(effectList)) {

                // RED: v1.204 set the round of creation to the current round
				effectList.push({
					name: fav.name,
					duration: fav.duration,
					direction: fav.direction,
					round: state.roundMaster.round,
					msg: fav.msg,
				});
				updateGlobalStatus(fav.name,undefined,1);
			} else {
                // RED: v1.204 set the round of creation to the current round
				state.roundMaster.effects[effectId] = effectList = new Array({
					name: fav.name,
					duration: fav.duration,
					direction: fav.direction,
					round: state.roundMaster.round,
					msg: fav.msg,
				});
				updateGlobalStatus(fav.name,undefined,1);
			}
			midcontent += '<div style="width: 40px; height 40px; display: inline-block;"><img src="'+curToken.get('imgsrc')+'"></div>';
		});

		if ('' === midcontent)
			{midcontent = '<div style="font-style: italic; text-align: center; font-size: 125%; ">None</div>';}

		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Apply Favorite</span>'
				+ '</div>'
			+ 'Name: ' + '<span style="color:'+design.statuscolor+';">'+fav.name+'</span>'
			+ '<br>Marker: ' + (!!markerdef.length ? ('<img src="'+markerdef[0].url+'"></img>'):'none')
			+ '<br>Duration: ' + fav.duration
			+ '<br>Direction: ' + fav.direction + (fav.msg ? ('<br>Message: ' + fav.msg):'')
			+ '<br><br><span style="font-style: normal;">Status placed on the following:</span><br>' ;

		content += midcontent; 
		
		status = statusExists(fav.name.toLowerCase()); 
		if (status && !status.marker && fav.marker)
			{doDirectMarkerApply(fav.marker+' %% '+fav.name); }
		else if (status && !status.marker)
			{content += '<br><div style="text-align: center;">'+RoundMaster_tmp.getTemplate({command: '!rounds --dispmarker '+fav.name, text: 'Choose Marker'},'button')+'</div>';}

		updateAllTokenMarkers(); 
		content += '</div>'; 
		sendFeedback(content);
	}; 

	/**
	 * Add a favorite status to the list of statuses
	 */
	var doAddFavorite = function(args) {
		if (!args) 
			{return;}

		args = args.split(/:| %% /);

		if (args.length < 3 || args.length > 5) {
		    sendDebug('doAddFavorite: Invalid syntax - wrong number of args');
			sendError('Invalid favorite status syntax');
			return;
		}

		var name = args[0],
			duration = parseInt(args[1]),
			direction = parseInt(args[2]),
			msg = args[3],
			marker = args[4],
			markerdef;  

		if (typeof(name) === 'string')
			{name = name.toLowerCase();}

		if (isNaN(duration) || isNaN(direction)) {
		    sendDebug('doAddFavorite: Invalid syntax - duration or direction not a number');
			sendError('Invalid favorite status syntax');
			return;
		}

		if (marker && !libTokenMarkers.getStatuses(marker).length) {
			marker = undefined; 
		} else {
			markerdef = libTokenMarkers.getStatus(marker);
		}

		if (favoriteExists(name)) {
		    sendDebug('doAddFavorite: Favorite with the name "'+name+'" already exists');
			sendError('Favorite with the name "'+name+'" already exists');
			return; 
		}

		var newFav = {
			name: name,
			duration: duration,
			direction: direction,
			msg: msg,
			marker: marker
		};

		state.roundMaster.favs[name] = newFav; 

		var content = '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Add Favorite</span>'
			+ '</div>'
			+ 'Name: ' + '<span style="color:'+design.statuscolor+';">'+name+'</span>'
			+ '<br>Marker: ' + (markerdef ? ('<img src="'+markerdef[0].url+'"></img>'):'none')
			+ '<br>Duration: ' + duration
			+ '<br>Direction: ' + direction 
			+ (msg ? ('<br>Message: ' + msg):'')
			+ (marker ? '':('<br><div style="text-align: center;">'+RoundMaster_tmp.getTemplate({command: '!rounds --dispmarker '+name+ ' %% fav', text: 'Choose Marker'},'button')+'</div>')); 
		content += '</div>'; 

		sendFeedback(content); 

	};

	/**
	 * Remove a favorite from the tracker
	 */
	var doRemoveFavorite = function(statusName) {
		if (!statusName) 
			{return;}
		statusName = statusName.toLowerCase(); 

		if (!favoriteExists(statusName)) {
		    sendDebug('doRemoveFavorite: Status "' + statusName + '" is not on the favorite list');
			sendFeedback('Status "' + statusName + '" is not on the favorite list');
			return; 
		}

		var content = '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Remove Favorite</span>'
			+ '</div>'
			+ 'Favorite ' + '<span style="color:'+design.statuscolor+';">'+statusName+'</span> removed.'
			+ '</div>'; 

		delete state.roundMaster.favs[statusName]; 
		sendFeedback(content); 
	}; 

    /**
     * RED: v1.204 Additional version of doAddStatus that takes a token_id as
     * the first argument
     */
     var doAddTargetStatus = function(args) {
        if (!args)
            {return;}
            
		if (args.length <4 || args.length > 6) {
		    sendDebug('doAddTargetStatus: Invalid number of args');
			sendError('Invalid status item syntax');
			return;
		}
		
		if (!args[4] || !args[4].length) {
		    args[4]=' ';
		}
		if (!args[5]) {
		    args[5]='';
		}

		var target = getObj('graphic', args.shift().trim());
		
		if (!target) {
		    // RED v3.002 If dealing with an effect triggered by anyone
		    // deleting a token with effects on it, the token may
		    // legitimately no longer exist
		    return;
		}
//		args = args.join('|');
		sendDebug('doAddTargetStatus: Target is ' + target.get('name'));
		doAddStatus(args,target);
		return;
	}

	/**
	 * Add turn item
	 */
	var doAddStatus = function(args,selection) {
    	if (!args) 
			{return;}
		if (!selection) {
		    sendDebug('doAddStatus: selection undefined');
			sendError('Invalid selection');
			return;
		}

		if (args.length <3 || args.length > 5) {
		    sendDebug('doAddStatus: wrong number of args');
			sendError('Invalid status item syntax');
			return;
		}
		var mod;
		if ('+-<>='.includes(args[1][0])) {
			mod = args[1][0];
			if (mod !=='-' && mod !=='+') {args[1] = args[1].slice(1)};
		}
		var effect = args[0].trim(),
			duration = parseInt(args[1]),
			direction = parseInt(args[2]),
			msg = (args[3] || '').trim(),
			marker = (args[4] || '').trim().toLowerCase(),
			newMarkerReason = '';

		if (typeof(effect) === 'string')
			{effect = effect.toLowerCase();}

		if (isNaN(duration) || isNaN(direction) || !effect) {
		    sendDebug('doAddStatus: duration or direction not numbers, or name undefined');
			sendError('Invalid status item syntax');
			return;
		}

		if (marker === 'undefined' || !marker.length) {
			newMarkerReason = 'Unspecified marker. ';
			marker = false;
		} else if (!libTokenMarkers.getStatuses(marker).length) {
		    // RED: v1.206 If the marker is not valid (misspelt or some such) just ask for one to
		    // be specified by the user...
		    newMarkerReason = 'Invalid marker. ';
		    marker = false;
		}
		
		// RED: v1.207 fixed error where a marker called the same name as a status caused an error
		// RED: v1.301 added a flag to allow non-unique markers - i.e. two different effects can have
		// the same marker, allowing effects of the same type to be less confusing
		if (flags.uniqueMarkers && !!_.find(state.roundMaster.statuses, function(e) {return e.marker === marker;})) {
    		// RED: v1.207 and also failed softly by asking the user to specify a different marker instead
            newMarkerReason = 'Marker already used. ';
            marker = false;
		}
		
		var curToken,
			effectId,
			effectList,
			status,
			content = '',
			midcontent = '';

		_.each(selection,function(e) {
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
			effectId = e._id;
			effectList = state.roundMaster.effects[effectId];
			
			if (_.find(effectList,function(elem,k) {
					if (elem.name.toLowerCase() === effect.toLowerCase()) {
						switch (mod || ' ') {
						case '+':
						case '-':
							effectList[k].duration += duration;
							break;
						case '<':
							effectList[k].duration = Math.min(effectList[k].duration,duration);
							break;
						case '>':
							effectList[k].duration = Math.max(effectList[k].duration,duration);
							break;
						default:
							effectList[k].duration = duration;
							break;
						}
						duration = effectList[k].duration;
						effectList[k].direction = direction;
						effectList[k].msg = msg;
						return true;
					}
				})
			) {
				return;
			} else if (effectList && Array.isArray(effectList)) {
			    // RED: v1.204 added the round of last update
				effectList.push({
					name: effect,
					duration: duration,
					direction: direction,
					round: state.roundMaster.round,
					msg: msg
				});
			} else {
			    // RED: v1.204 added the round of last update
				state.roundMaster.effects[effectId] = effectList = new Array({
					name: effect,
					duration: duration,
					direction: direction,
					round: state.roundMaster.round,
					msg: msg
				});
			}
			updateGlobalStatus(effect,undefined,1);

			// RED: v1.301 when adding a new effect marker
			// run the relevant effect-start macro if it exists
			// NOTE: if multiple tokens for same character sheet,
			// This will apply the macro multiple times
			// TODO Add list of cid to status and stop duplication
   			sendAPImacro( curToken, msg, effect, 0, '-start' );

			midcontent += '<div style="width: 40px; height 40px; display: inline-block;"><img src="'+curToken.get('imgsrc')+'"></div>'; 
			
		});

		if ('' === midcontent)
			{midcontent = '<div style="font-style: italic; text-align: center; font-size: 125%; ">None</div>';}


		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Add Status</span>'
				+ '</div>'
			+ 'Name: ' + '<span style="color:'+design.statuscolor+';">'+effect+'</span>'
			+ '<br>Duration: ' + duration
			+ '<br>Direction: ' + direction + (msg ? ('<br>Message: ' + msg):'')
			+ '<br><br><span style="font-style: normal;">Status placed on the following:</span><br>' ;
		content += midcontent; 

		status = statusExists(effect.toLowerCase()); 
		if (status && !status.marker) {
			if (marker) {
				status.marker = marker;
				status.tag = libTokenMarkers.getStatus(marker).getTag();
			} else {
			    if (newMarkerReason)
			        {content += '<br><br><span style="font-style: normal;">'+newMarkerReason+'</span><br>';}
				content += '<br><div style="text-align: center;">'+RoundMaster_tmp.getTemplate({command: '!rounds --dispmarker '+effect, text: 'Choose Marker'},'button')+'</div>';
			}
		}

		content += '</div>'; 
		updateAllTokenMarkers(); 
		sendFeedback(content);
	};
	
	/*
	 * RED: v3.010 added capability to target a token to delete one or more
	 * statuses, or all statuses, mainly so the command can be called from 
	 * an effect macro (which means the selected token will not be passed 
	 * with the command API call)
	 */

	var doDelTargetStatus = function(args,endMacro) {
        if (!args)
            {return;}
            
        args = args.split('|');
		if (args.length < 2) {
		    sendDebug('doDelTargetStatus: Invalid number of args');
			sendError('Invalid status item syntax');
			return;
		}
		
		var target = getObj('graphic', args.shift().trim());
		
		if (!target) {
		    // RED v3.002 If dealing with an effect triggered by anyone
		    // deleting a token with effects on it, the token may
		    // legitimately no longer exist
		    return;
		}
		args = args.join('|');
		sendDebug('doDelTargetStatus: Target is ' + target.get('name'));
		doRemoveStatus(args,target,endMacro);
		return;
	}
	/**
	 * Remove a status from the selected tokens
	 */
	var doRemoveStatus = function(args,selection,endMacro) {
		if (!args || !selection) {
			sendError('Invalid selection');
			return;
		}
		var effects,
			found = false,
			toRemove = [],
			curToken,
			effectId,
			removedStatus,
			content = '',
			midcontent = ''; 

		args = args.toLowerCase().replace(/\s/g,'-');
		
		_.each(selection, function(e) {
			effectId = e._id;
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
			effects = state.roundMaster.effects[effectId];
			effects = _.reject(effects,function(elem) {
				if (args.includes(elem.name.toLowerCase().replace(/\s/g,'-')) || args.includes('all')) {
				    // RED: v2.003 changed '==='' comparison of strings to 'includes()' comparison
				    // so that multiple effects can be removed at the same time
					found = true;
					midcontent += '<div style="width: 40px; height 40px; display: inline-block;"><img src="'+curToken.get('imgsrc')+'"></div>'; 
					if (endMacro) {
						// RED: v1.301 when removing the status marker
						// run the relevant effect-end macro if it exists
						// RED: v3.010 if using the new --deletestatus command,
						// so endMacro is false, don't trigger the -end effect
						sendAPImacro( curToken, elem.msg, elem.name, 0, '-end' );
					}
					removedStatus = updateGlobalStatus(elem.name,undefined,-1);
					toRemove.push(removedStatus); 
					return true;
				}
				return false;
			});
			setStatusEffects(curToken,effects);
			// Remove markers
		});

		if ('' === midcontent)
			{midcontent = '<div style="font-style: italic; text-align: center; font-size: 125%; ">None</div>';}


		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
				+ '<span style="font-weight: bold; font-size: 120%">Remove Status</span>'
			+ '</div>'
			+ '<span style="font-style: normal;">Status "<span style="color: '+design.statuscolor+';">' +args+'</span>" removed from the following:</span><br>';
		content += midcontent; 
		content += '</div>'; 
		if (!found && endMacro && !args.includes('all'))
			{content = '<span style="color: red; font-weight:bold;">No status "' + args + '" exists on any in the selection</span>'; }
		updateAllTokenMarkers(toRemove); 
		sendFeedback(content);
	};

	/**
	 * Display marker list (internally used)
	 */
	var doDisplayMarkers = function(args) {
		if (!args) 
			{return;}
		args = args.toLowerCase(); 
		args = args.split(' %% '); 
		var statusName = args[0],
			isfav = args[1],
			content = ''; 

		if (!isfav && !statusExists(statusName)) 
			{return;}

		content = makeMarkerDisplay(statusName,(isfav === 'fav'));
		sendFeedback(content); 	
	}; 

	/**
	 * Display token configuration (internally used)
	 */
	var doDisplayTokenConfig = function(args) {
		if (!args) 
			{return;} 

		var curToken = getObj('graphic',args);
		if (!curToken || curToken.get('_subtype') !== 'token') {
            sendDebug('doDisplayTokenConfig: Invalid token selected')
			sendError('Invalid target'); 
		}

		var content = makeTokenConfig(curToken); 
		sendFeedback(content); 
	}; 
	
	/**
	 * Display the status configuration of a token, in the 
	 * same way as a turn announcement.  If run by the GM 
	 * show both public and hidden statuses
	 **/
	 
	var doDisplayTokenStatus = function(args,selected,senderId,isGM) {
		if (!args) args = [];
		
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		} else if (!args[0]) {
            sendDebug('doDisplayTokenStatus: Invalid token selected');
			sendError('Invalid target'); 
		}
		var curToken = getObj('graphic',args[0]);
		
		if (!curToken) {
            sendDebug('doDisplayTokenStatus: Invalid token selected');
			sendError('Invalid target'); 
		}
		
		var	msg = updateStatusDisplay(curToken,false);
		if (!isGM) {
			sendResponse(senderId,msg.public);
		} else {
			sendFeedback( msg.public+msg.hidden );
		}
		return;
	}

	/**
	 * Display status configuration (internally used)
	 */
	var doDisplayStatusConfig = function(args) {
		if (!args) 
			{return;} 

		args = args.split(/ %% /); 
		var tokenId = args[0],
			action = args[1],
			statusName = args[2];

		// dirty fix for lack of trim()
		if (tokenId)
			{tokenId = tokenId.trim();}

		var curToken = getObj('graphic',tokenId);
		if ((tokenId && (!curToken || curToken.get('_subtype') !== 'token')) 
			|| !action 
			|| !statusName) {
            sendDebug('doDisplayStatusConfig: invalid argument syntax.  Action "' + action + '" statusName "' + statusName)
			sendError('Invalid syntax'); 
			return; 
		}

		var content; 
		switch (action) {
			case 'remove':
				doRemoveStatus(statusName,[{_id: tokenId}],true); 
				break;
			case 'change':
				content = makeStatusConfig(curToken,statusName); 
				sendFeedback(content); 
				break;
			case 'removefav':
				doRemoveFavorite(statusName); 
				break; 
			case 'changefav':
				content = makeStatusConfig('',statusName,favoriteExists(statusName)); 
				sendFeedback(content);
				break; 
			default:
				sendError('Invalid syntax'); 
				return; 
		}
	}; 

	/**
	 * Display favorite configuration
	 */ 
	var doDisplayFavConfig = function() {
		var content = makeFavoriteConfig(); 
		sendFeedback(content); 
	}; 

	/**
	 * Perform a single edit operation
	 */
	var doEditTokenStatus = function(selection) {
		var graphic; 
		if (!selection 
		|| selection.length !== 1 
		|| !(graphic = getObj('graphic',selection[0]._id)
		|| graphic.get('_subtype') !== 'token' )
		|| graphic.get('isdrawing')) {
            sendDebug('doEdit TokenStatus: Invalid selection of tokens')
			sendError('Invalid selection'); 
			return; 
		}
		var curToken = getObj('graphic',selection[0]._id);
		var content = makeTokenConfig(curToken); 
		sendFeedback(content); 
	};

	/**
	 * Display the status edit dialog for a multi edit
	 */ 
	var doDisplayMultiStatusConfig = function(args) {
		if (!args) 
			{return;} 

		args = args.split(' @ '); 

		var action = args[0],
			statusName = args[1],
			idString = args[2],
			content = ''; 

		if (action === 'remove') {
			idString = idString.split(' %% '); 
			var selection = [];
			_.each(idString, function(e) {
				selection.push({_id: e, _type: 'graphic'}); 	
			}); 
			doRemoveStatus(statusName,selection,true); 
			return; 
		} else if (action !== 'change') {
			return; 
		}

		content = makeMultiStatusConfig(action,statusName,idString); 

		sendFeedback(content); 

	}; 

	/**
	 * Display the multi edit token dialog
	 */ 
	var doMultiEditTokenStatus = function(selection) {
		if (!selection) 
			{sendError('No token selected');return;}
		if (selection.length === 1) 
			{return doEditTokenStatus(selection);}

		var tuple = [],
			subTuple,
			curToken,
			effects,
			content;

		_.each(selection,function(e) {
			curToken = getObj('graphic',e._id);
			if(curToken && curToken.get('_subtype') === 'token' && !curToken.get('isdrawing')) {
				effects = getStatusEffects(curToken); 
				if (effects) {
					_.each(effects,function(f) {
						if (!(subTuple=_.find(tuple,function(g){return g.statusName === f.name;})))
							{tuple.push({id: e._id, statusName: f.name});}
						else
							{subTuple.id = subTuple.id + ' %% ' + e._id;} 
					}); 
				}
			}	
		});
		content = makeMultiTokenConfig(tuple); 
		sendFeedback(content); 
	};

	/**
	 * Perform the edit operation on multiple tokens whose ids
	 * are supplied. 
	 */ 
	var doEditMultiStatus = function(args) {
		if (!args) 
			{return;}

		args = args.split(' @ ');

		var statusName = args[0],
			attrName = args[1],
			newValue = args[2],
			idString = args[3],
			gstatus = statusExists(statusName),
			effectList,
			content = '',
			midcontent,
			errMsg;

		// input sanitation
		if (!newValue)
			{newValue = '';} 
		if (!statusName || !attrName) {
            sendDebug('doEditMultiStatus: Invalid arguments. statusName "' + statusName + '", attrName "' + attrName + '"');
			sendError('Error on multi-selection'); 
			return; 
		}

		// dirty fix for lack of trim()
		statusName = statusName.toLowerCase().trim(); 
		idString = idString.trim(); 
		idString = idString.split(' %% '); 


		if (attrName === 'name') {
			if (statusExists(newValue)) {
				sendError('Status name already exists');
                sendDebug('doEditMultiStatus: status name "' + newValue + '" already exists');
				return; 
			}
			gstatus = statusExists(statusName); 
			newValue = newValue.toLowerCase(); 
			effectList = state.roundMaster.effects; 
			_.each(effectList,function(effects) {
				_.each(effects,function(e) {
					if (e.name === statusName)
						{e.name = newValue;}
				}); 
			});
			gstatus.name = newValue; 
			midcontent = 'New status name is "' + newValue + '"'; 
		} else if (attrName === 'marker') {
			content = makeMarkerDisplay(statusName); 
			sendFeedback(content); 
			return; 
		} else {
			idString = _.chain(_.keys(state.roundMaster.effects))
				.reject(function(n) {
					return !_.contains(idString,n); 
				})
				.value(); 
			_.each(idString, function(e) {
				effectList = getStatusEffects(getObj('graphic',e)); 
				_.find(effectList,function(f) {
					if (f.name === statusName) {
						switch (attrName) {
							case 'duration':
								if (!isNaN(newValue)) {
									f.duration = parseInt(newValue); 
									if (!midcontent)
										{midcontent = 'New duration is ' + newValue;}
								} else if (!errMsg) {
									errMsg = 'Invalid Value'; 
								}
								// change duration for selected statuses
								break; 
							case 'direction': 
								if (!isNaN(newValue)) {
									f.direction = parseInt(newValue); 
									if (!midcontent)
										{midcontent = 'New direction is ' + newValue;}
								} else if (!errMsg) {
									errMsg = 'Invalid Value'; 
								}
								// change direction for selected statuses
								break; 
							case 'message': 
								f.msg = newValue;
								if (!midcontent)
									{midcontent = 'New message is ' + newValue;}
								// change message for selected statuses
								break; 
							default:
                                sendDebug('doEditMultiStatus: Bad syntax or selection. statusName "' + statusName + '", attrName "' + attrName + '"');
								sendError('Bad syntax/selection');
								return; 
						}
					}
				}); 
			});
			if (errMsg)
				{sendError(errMsg);}
			else
				{updateAllTokenMarkers();}
		}

		content += '<div style="background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center; font-weight: bold;">'
			+ '<div style="color: ' + design.statuscolor + '; font-weight: bold; border-bottom: 2px solid black;">'
				+ '<table width="100%"><tr><td width="100%"><span style="font-weight: bold; font-size: 125%">Edit Group Status "'+statusName+'"</span></td></tr></table>'
			+ '</div>';
		content += midcontent; 
		content += '</div>';
		
		if (midcontent)
			{sendFeedback(content);}
	}; 

    /**
     * RED: v1.204 Additional version of doPlayerAddStatus that takes a token_id as
     * the first argument
     */
     var doPlayerTargetStatus = function(args,senderId) {
        if (!args)
            {return;}

		if (args.length <4 || args.length > 6) {
            sendDebug('doPlayerTargetStatus: Invalid number of arguments');
			sendError('Invalid status item syntax');
			return;
		}

		var target = getObj('graphic', args[0]);			
		args.shift();
		    
		if (!target) {
            sendDebug('doPlayerTargetStatus: Target token object not found');
		    sendFeedback('Could not find target');
		    return;
		}
		
		doPlayerAddStatus(args,target,senderId);
		return;
	}

	/**
	 * Add player statuses
	 */
	var doPlayerAddStatus = function(args, selection, senderId) {

		if (!args) 
			{return;}
		if (!selection) {
            sendDebug('doPlayerAddStatus: Selection undefined');
			sendResponseError('Invalid selection');
			return;
		}
		
		// RED: v1.204 extended arguments to optionally include the marker
		if (args.length <3 || args.length > 5) {
            sendDebug('doPlayerAddStatus: Invalid number of arguments');
			sendResponseError('Invalid status item syntax');
			return;
		}
		var name = args[0],
			duration = parseInt(args[1]),
			direction = parseInt(args[2]),
			msg = args[3],
			marker = args[4],
			statusArgs = {},
			statusArgsString = '',
			status,
			markerdef,
			hashes = [],
			curToken,
			pr_choosemarker,
			pr_nomarker,
			choosemarker_args = {},
			nomarker_args = {},
			content = '',
			midcontent = '',
			d = new Date();
			
		if (typeof(name) === 'string')
			{name = name.toLowerCase();}

		if (isNaN(duration) || isNaN(direction)) {
            sendDebug('doPlayerAddStatus: duration or direction not a number.  Duration "' + duration + '", direction "' + direction + '"');
			sendResponseError('Invalid status item syntax');
			return;
		}

		if (!!(status=statusExists(name))) {
			markerdef = libTokenMarkers.getStatuses(status.marker);
		} else {
            // RED: v1.206 fixed issue of player macros not able to set marker in command line
		    markerdef = libTokenMarkers.getStatuses(marker);
		}
		markerdef = !!markerdef.length ? markerdef[0] : undefined;

	    // RED: v1.204 added the round of last update
		statusArgs.name = name;
		statusArgs.duration = duration;
		statusArgs.direction = direction;
		statusArgs.round = state.roundMaster.round;
		statusArgs.msg = msg;
		// RED: v1.204 If markerdef is not defined, then use the marker parameter passed in
		// RED: If the marker parameter is also undefined, works as previously coded

        if (!!markerdef) {
		    statusArgs.marker = markerdef.getName(); 
		} else {
		    statusArgs.marker = marker;
		}

		statusArgsString = name + ' @ ' + duration + ' @ ' + direction + ' @ ' + msg + ' @ ' + statusArgs.marker; 

		hashes.push(genHash(d.getTime()*Math.random(),pending));
		hashes.push(genHash(d.getTime()*Math.random(),pending));
		choosemarker_args.hlist = hashes; 
		choosemarker_args.statusArgs = statusArgs;
		choosemarker_args.statusArgsString = statusArgsString; 
		choosemarker_args.senderId = senderId;
		choosemarker_args.selection = selection; 
		nomarker_args.hlist = hashes; 
		nomarker_args.statusArgs = statusArgs; 
		nomarker_args.senderId = senderId; 
		nomarker_args.selection = selection; 

		pr_choosemarker = new PendingResponse(PR_Enum.CUSTOM,function(args) {
			var hashes = [],
				pr_marker,
				content; 

			hashes.push(genHash(d.getTime()*Math.random(),pending));

			pr_marker = new PendingResponse(PR_Enum.CUSTOM,function(args, carry) {
				args.statusArgs.marker = carry;
				doDispPlayerStatusAllow(args.statusArgs,args.selection,args.senderId); 

			},args); 
			addPending(pr_marker,hashes[0]); 

			content = makeMarkerDisplay(undefined,false,'!rounds --relay hc% ' 
				+ hashes[0] 
				+ ' %% ');

			sendResponse(args.senderId,content); 
			_.each(args.hlist,function(e) {
				clearPending(e) ;
			});
		},choosemarker_args);

		pr_nomarker = new PendingResponse(PR_Enum.CUSTOM,function(args) {
			sendResponse('<span style="color: orange; font-weight: bold;">Request sent for \''+(/_(.+)_?/.exec(statusArgs.name) || ['',statusArgs.name])[1]+'\'</span>'); 
			doDispPlayerStatusAllow(args.statusArgs,args.selection,args.senderId); 	
			_.each(args.hlist,function(e) {
				clearPending(e) ;
			});
		},nomarker_args); 

		addPending(pr_choosemarker,hashes[0]);
		addPending(pr_nomarker,hashes[1]); 


		_.each(selection,function(e) {
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
			midcontent += '<div style="width: 40px; height 40px; display: inline-block;"><img src="'+curToken.get('imgsrc')+'"></div>'; 
		});

		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Request Add Status</span>'
				+ '</div>'
			+ 'Name: ' + '<span style="color:'+design.statuscolor+';">'+name+'</span>'
			+ '<br>Marker: ' + (markerdef ? markerdef.getHTML():'none')
			+ '<br>Duration: ' + duration
			+ '<br>Direction: ' + direction + (msg ? ('<br>Message: ' + msg):'')
			+ '<br><br><span style="font-style: normal;">Status requested to be placed on the following:</span><br>'; 
		content += midcontent; 
		content += (markerdef ? '': (
				'<div style="text-align: center;">'
				+ RoundMaster_tmp.getTemplate({command: '!rounds --relay hc% ' + hashes[0], text: 'Choose Marker'},'button')
				+ RoundMaster_tmp.getTemplate({command: '!rounds --relay hc% ' + hashes[1], text: 'Request Without Marker'},'button')
				+ '</div>'
			));
		content += '</div>'; 
		sendResponse(senderId,content); 

		if (markerdef)
			{doDispPlayerStatusAllow(statusArgs,selection,senderId);}
	};

	/**
	 * make dialog to allow/disallow a player status add
	 */ 
	var doDispPlayerStatusAllow = function(statusArgs,selection,senderId) {

		var hashes = [],
			confirmArgs = {},
			rejectArgs = {},
			pr_confirm,
			pr_reject,
			content = '',
			midcontent = '',
			player,
			markerdef,
			curToken,
			d = new Date();

		player = getObj('player',senderId);
		if (!player) {
            sendDebug('doDispPlayerStatusAllow: Non-existant player requested to add a status?');
			sendError('Non-existant player requested to add a status?');
			return; 
		}

		_.each(selection,function(e) {
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
			midcontent += '<div style="width: 40px; height 40px; display: inline-block;"><img src="'+curToken.get('imgsrc')+'"></div>'; 
		});

		hashes.push(genHash(d.getTime()*Math.random(),pending));
		hashes.push(genHash(d.getTime()*Math.random(),pending));
		confirmArgs.hlist = hashes;
		confirmArgs.statusArgs = statusArgs; 
		confirmArgs.selection = selection; 
		confirmArgs.senderId = senderId; 
		rejectArgs.hlist = hashes;
		rejectArgs.statusArgs = statusArgs; 
		rejectArgs.selection = selection; 
		rejectArgs.senderId = senderId;

		pr_confirm = new PendingResponse(PR_Enum.YESNO,function(args) {
    		// RED: changed the parameter seperator from ':' to '|'
    		// RED: to allow use of !rounds calls in API Buttons
			var addArgs = [],
				markerdef = libTokenMarkers.getStatus(statusArgs.marker);
			addArgs[0] = args.statusArgs.name;
			addArgs[1] = args.statusArgs.duration;
			addArgs[2] = args.statusArgs.direction;
			addArgs[3] = args.statusArgs.msg;
			addArgs[4] = args.statusArgs.marker;

            // RED: v2.002 The system should now be able to deal with a marker used for multiple different effects as per v1.302
            doAddStatus(addArgs,selection);
            
            /*
			if (statusExists(args.statusArgs.name)) {
				doAddStatus(argStr,selection); 
			} else if(!!!_.find(state.roundMaster.statuses,function(e){if (e.marker === args.statusArgs.marker){return true;}})) {
				doAddStatus(argStr,selection); 
			} else {
                sendDebug('doDispPlayerStatusAllow: Marker "' + statusArgs.marker + '" is already in use');
				sendError('Marker <img src="'+markerdef.img+'"></img> is already in use, cannot use it for \'' + args.statusArgs.name + '\' '); 
				sendResponseError(args.senderId,'Status application \''+statusArgs.name+'\' rejected, marker <img src="'+markerdef.img+'"></img> already in use'); 
				return; 
			}
			*/
			sendResponse(args.senderId,'<span style="color: green; font-weight: bold;">Status application for \''+(/_(.+)_?/.exec(statusArgs.name) || ['',statusArgs.name])[1]+'\' accepted</span>'); 

			_.each(args.hlist,function(e) {
				clearPending(e) ;
			});
		},confirmArgs);

		pr_reject = new PendingResponse(PR_Enum.YESNO,function(args) {
			var player = getObj('player',args.senderId); 
			if (!player) {
                sendDebug('doDispPlayerStatusAllow: Non-existant player requested to add a status?');
				sendError('Non-existant player requested to add a status?');
			}
			sendResponseError(args.senderId,'Status application for \''+(/_(.+)_?/.exec(statusArgs.name) || ['',statusArgs.name])[1]+'\' rejected'); 
			sendError('Rejected status application for \''+statusArgs.name+'\' from ' + player.get('_displayname')); 

			_.each(args.hlist,function(e) {
				clearPending(e) ;
			});
		},rejectArgs);

		addPending(pr_confirm,hashes[0]);
		addPending(pr_reject,hashes[1]); 


		markerdef = libTokenMarkers.getStatuses(statusArgs.marker);
		markerdef = !!markerdef.length ? markerdef[0] : undefined;

		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Request Add Status</span>'
				+ '</div>'
			+ '<span style="color:'+design.statuscolor+';">'+ player.get('_displayname') + '</span> requested to add the following status...<br>'
			+ '<br>Name: ' + '<span style="color:'+design.statuscolor+';">'+statusArgs.name+'</span>'
			+ '<br>Marker: ' + (markerdef ? ('<img src="'+markerdef.url+'"></img>'):'none')
			+ '<br>Duration: ' + statusArgs.duration
			+ '<br>Direction: ' + statusArgs.direction + (statusArgs.msg ? ('<br>Message: ' + statusArgs.msg):'')
			+ '<br><br><span style="font-style: normal;">Status requested to be placed on the following:</span><br>'; 
		content += midcontent; 

		content += '<table style="text-align: center; width: 100%">'
			+ '<tr>'
				+ '<td>'
					+ RoundMaster_tmp.getTemplate({command: '!rounds --relay hc% ' + hashes[0], text: 'Confirm'},'button')
				+ '</td>'
				+ '<td>'
					+ RoundMaster_tmp.getTemplate({command: '!rounds --relay hc% ' + hashes[1], text: 'Reject'},'button')
				+ '</td>'
			+ '</tr>'
		+ '</table>'; 
		// GM feedback
		sendFeedback(content); 
		// Player feedback
		sendResponse(senderId,'<span style="color: orange; font-weight: bold;">Request sent for \''+(/_(.+)_?/.exec(statusArgs.name) || ['',statusArgs.name])[1]+'\'</span>'); 
	}; 

	/**
	 * Performs a direct marker application to a status name.
	 * An internal command that is still sanitized to prevent
	 * awful things.
	 */
	var doDirectMarkerApply = function(args) {
		// directly apply a marker to a token id
		if (!args) 
			{return;}
		args = args.split(' %% ');
		if (!args) 
			{return;}
		
		var markerName = args[0],
			statusName = args[1],
			isFav = args[2]; 

		isFav = isFav === 'fav'; 

		if (typeof(markerName) === 'string') 
			{markerName = markerName.toLowerCase();}
		if (typeof(statusName) === 'string') 
			{statusName = statusName.toLowerCase();}
		
		var status,
			found,
			markerdef,
			oldMarker,
			oldTag;

		// if we're a favorite we don't bother with the status and active effects.
		if (isFav) {
			var fav = favoriteExists(statusName); 
			if (fav) {
				fav.marker = markerName; 
				markerdef = libTokenMarkers.getStatus(markerName);
				sendFeedback('<div style="color: green; font-weight: bold;">Marker for <i><b>Favorite</i> "'+statusName+'"</b> set as <div style="width: 21px; height 21px; display: inline-block;"><img src="'+markerdef.url+'"></img></div></div>' );
			} else {
                sendDebug('doDirectMarkerApply: Favorite <u>"'+statusName+'"</u> does not exist.');
				sendError('Favorite <u>"'+statusName+'"</u> does not exist.');
			}
			return; 
		}

		_.each(state.roundMaster.statuses, function(e) {
			if (e.marker === markerName)
				{found = e;}
			if (e.name === statusName)
				{status = e;}
		});
		if (status) {
			if (found) {
				markerdef = libTokenMarkers.getStatuses(markerName);
				if (!markerdef.length) 
					{return;}
                sendDebug('doDirectMarkerApply: Marker <u>"'+markerName+'"</u> already used by "' + found.name + '"');
				sendError('Marker <div style="width: 21px; height 21px; display: inline-block;"><img src="'+markerdef[0].url+'"></img></div> already taken by "' + found.name + '"');
				// marker taken
			} else {
				if (status.marker) {
					oldMarker = status.marker; 
					oldTag = status.tag;
				}
				markerdef = libTokenMarkers.getStatuses(markerName);
				status.marker = markerName;
				if (!markerdef.length) {
					status.tag = markerName;
					return;
				}
				status.tag = markerdef[0].getTag();
				sendFeedback('<div style="color: green; font-weight: bold;">Marker for <b>"'+statusName+'"</b> set as <div style="width: 21px; height 21px; display: inline-block;"><img src="'+markerdef[0].url+'"></img></div></div>' );
				updateAllTokenMarkers([{name: '', marker: oldMarker, tag: oldTag}]);
			}
		}
	}; 
	
	/**
	 * Perform a status edit on a single token, internal command, but
	 * still performs sanitation of input to prevent awful things.
	 */ 
	var doEditStatus = function(args) {
		if (!args) {
			sendError('Bad syntax/selection');
            sendDebug('doEditStatus: No arguments');
			return; 
		}

		args = args.split(' %% '); 
		var action = args[0],
			tokenId = args[1],
			statusName = args[2],
			attrName = args[3], 
			newValue = args[4],
			effects,
			effectList,
			curToken,
			localEffect,
			fav,
			content = '',
			midcontent = ''; 

		if (!newValue) {
			newValue = '';
			attrName = attrName.replace('%%','').trim(); 
		}
		if (!action
		|| !statusName
		|| !attrName) {
            sendDebug('doEditStatus: Invalid args. action "'+action+'", statusName "'+statusName+'", attrName "'+attrName+'"');
			sendError('Bad syntax/selection values');
			return; 
		}

		// if no token is available
		curToken = getObj('graphic',tokenId);
		if (tokenId 
			&& curToken 
			&& (curToken.get('_subtype') !== 'token' ||  curToken.get('isdrawing'))) {
            sendDebug('doEditStatus: selection is not a valid token');
			sendError('Bad syntax/selection');
			return; 
		}
		if (action === 'change') {
			switch(attrName) {
				case 'name':
					var gstatus = statusExists(statusName); 
					if (!gstatus) {
                        sendDebug('doEditStatus: Status "'+statusName+'" does not exist');
						sendError('Status "'+statusName+'" does not exist');
						return; 
					}
					if (statusExists(newValue)) {
                        sendDebug('doEditStatus: Status "'+newValue+'" already exists');
						sendError('Status name already exists');
						return; 
					}
					gstatus = statusExists(statusName); 
					newValue = newValue.toLowerCase(); 
					effectList = state.roundMaster.effects; 
					_.each(effectList,function(effects) {
						_.each(effects,function(e) {
							if (e.name === statusName) {
								e.name = newValue; 
							}
						}); 
					});

					gstatus.name = newValue; 
					midcontent += 'Status name now: ' + newValue; 
					break; 
				case 'marker': 
					content = makeMarkerDisplay(statusName); 
					sendFeedback(content);
					return; 
				case 'duration': 
					effects = getStatusEffects(curToken);
					localEffect = _.findWhere(effects,{name: statusName});
					if (!localEffect || isNaN(newValue)) {
                        sendDebug('doEditStatus: Can\'t set duration for statusName "'+statusName+'" to "'+newValue+'"');
						sendError('Bad syntax/selection');
						return; 
					}
					localEffect.duration = parseInt(newValue); 
					midcontent += 'New "'+statusName+'" duration ' + newValue; 
					updateAllTokenMarkers(); 
					break; 
				case 'direction': 
					effects = getStatusEffects(curToken);
					localEffect = _.findWhere(effects,{name: statusName});
					if (!localEffect || isNaN(newValue)) {
                        sendDebug('doEditStatus: Can\'t set direction for statusName "'+statusName+'" to "'+newValue+'"');
						sendError('Bad syntax/selection');
						return; 
					}
					localEffect.direction = parseInt(newValue); 
					midcontent += 'New "'+statusName+'" direction ' + newValue; 
					updateAllTokenMarkers(); 
					break; 
				case 'message': 
					effects = getStatusEffects(curToken);
					localEffect = _.findWhere(effects,{name: statusName});
					if (!localEffect) {
                        sendDebug('doEditStatus: Can\'t set message for statusName "'+statusName+'" to "'+newValue+'"');
						sendError('Bad syntax/selection');
						return; 
					}
					localEffect.msg = newValue; 
					midcontent += 'New "'+statusName+'" message ' + newValue; 
					break; 
				default:
                    sendDebug('doEditStatus: Invalid attrName "'+attrName+'"');
					sendError('Bad syntax/selection');
					return; 
			}
		} else if (action === 'changefav') {
			switch(attrName) {
				case 'name':
					fav = favoriteExists(statusName); 
					if (favoriteExists(newValue)) {
                        sendDebug('doEditStatus: Favorite name newValue "'+newValue+'" already exists');
						sendError('Favorite name already exists');
						return; 
					}
					fav.name = newValue.toLowerCase();
					//manually remove from state
					delete state.roundMaster.favs[statusName]; 
					state.roundMaster.favs[newValue] = fav; 
					midcontent += 'Status name now: ' + newValue; 
					break; 
				case 'marker': 
					fav = favoriteExists(statusName); 
					content = makeMarkerDisplay(statusName,fav); 
					sendFeedback(content);
					return; 
				case 'duration': 
					fav = favoriteExists(statusName); 
					if (!fav || isNaN(newValue)) {
                        sendDebug('doEditStatus: Can\'t set duration for favorite statusName "'+statusName+'" to "'+newValue+'"');
						sendError('Bad syntax/selection');
					}
					fav.duration = parseInt(newValue); 
					midcontent += 'New "'+statusName+'" duration ' + newValue; 
					break; 
				case 'direction': 
					fav = favoriteExists(statusName); 
					if (!fav || isNaN(newValue)) {
                        sendDebug('doEditStatus: Can\'t set direction for favorite statusName "'+statusName+'" to "'+newValue+'"');
						sendError('Bad syntax/selection');
					}
					fav.direction = parseInt(newValue); 
					midcontent += 'New "'+statusName+'" direction ' + newValue; 
					break; 
				case 'message': 
					fav = favoriteExists(statusName); 
					if (!fav) {
                        sendDebug('doEditStatus: Can\'t set message for favorite statusName "'+statusName+'" to "'+newValue+'"');
						sendError('Bad syntax/selection');
					}
					fav.msg = newValue; 
					midcontent += 'New "'+statusName+'" message ' + newValue; 
					break; 
				default:
					sendError('Bad syntax/selection');
					return; 
			}
		}

		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; text-align: center;">'
			+ '<div style="color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
				+ '<table width="100%"><tr><td width="100%"><span style="font-weight: bold; font-size: 125%">'+(curToken ? ('Editing "'+statusName+'" for'):('Editing Favorite ' + statusName))+'</span></td>'+ (tokenId ? ('<td width="32px" height="32px"><div style="width: 32px; height: 32px"><img src="'+curToken.get('imgsrc')+'"></img></div></td>'):'') +'</tr></table>'
			+ '</div>'; 
		content += midcontent; 
		content += '</div>'; 
		sendFeedback(content); 
		return;
	};
	
	/**
	 * RED: v1.208 Strange circumstances can leave an orphaned marker that !rounds does
	 * not know about (perhaps set by the DM). doCleanToken() gets rid of these.
	 **/
	 
	 var doCleanTokens = function(selection) {
	    if (!selection) {
		    sendDebug('doCleanToken: selection undefined');
			sendError('Invalid selection');
			return;
		}
		
		var curToken,
		    name,
			tokenStatusMarkers;

		_.each(selection,function(e) {
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
		    name = curToken.get('name');
		    tokenStatusMarkers = curToken.get('statusmarkers');
		    sendDebug('doCleanTokens: Statusmarkers string for "' + name + '" was "' + tokenStatusMarkers + '"');
            curToken.set('statusmarkers','');
		});
        updateAllTokenMarkers();
 
	 }
	
	/**
	* RED: v1.202 Added configuration function -clearonround [on/off], default is on
	**/
	var doSetClearOnRound = function(args) {
		flags.clearonnewround = (args[0] || '').toLowerCase() != 'off';
		sendFeedback('Turn Order will '+(flags.clearonnewround ? '' : '<b>not</b> ')+'be cleared at the end of the round'); 
    	return;
	}

	/**
	* RED: v1.202 Added configuration function -clearonclose [on/off], default is off
	**/
	var doSetClearOnClose = function(args) {
		flags.clearonclose = (args[0] || '').toLowerCase() == 'on';
		sendFeedback('Turn Order will '+(flags.clearonclose ? '' : '<b>not</b> ')+'be cleared and stopped when it is closed'); 
	    return;
	}

	/**
	* RED: v1.202 Added configuration function -sort [ascending/descending/atoz/ztoa/nosort], default is ascending
	**/
	var doSetSort = function(args) {
        var sortorder;
		switch (args[0].toLowerCase()) {
		case 'nosort':
			flags.newRoundSort=TO_SortEnum.NOSORT;
			sortorder = 'not be sorted';
			break;
		case 'descending':
			flags.newRoundSort=TO_SortEnum.NUMDESCEND; 
			sortorder = 'be sorted in descending order'
			break;
		case 'atoz':
			flags.newRoundSort=TO_SortEnum.ALPHAASCEND; 
			sortorder = 'be sorted a to z'
			break;
		case 'ztoa':
			flags.newRoundSort=TO_SortEnum.ALPHADESCEND; 
			sortorder = 'be sorted z to a'
			break;
		default:
			flags.newRoundSort=TO_SortEnum.NUMASCEND;
			sortorder = 'be sorted in ascending order'
		}
		sendFeedback('Turn Order will ' + sortorder + ' at the start of each round'); 
		return;
	}

	/**
	 * Resets the turn order to the provided round number
	 * or in its absence, configures it to 1. Does no other
	 * operation other than change the round counter.
	 */ 
	var doResetTurnorder = function(args,isTurn=true) {
		var initial = (typeof(args) === 'string' ? args.match(/\s*\d+/) : 1);
		if (!initial) 
				{initial = 1;}
		var turnorder = Campaign().get('turnorder');
		if (turnorder && typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		
		if (!turnorder) {
			prepareTurnorder();
		} else {
			if(!_.find(turnorder, function(e) {
				if (parseInt(e.id) === -1 && parseInt(e.pr) === -100 && e.custom.match(/Round\s*\d+/)) {
					e.custom = 'Round ' + initial;
					return true;
				}
			})) {
                // RED: v1.204 prepareTurnorder() sets the state round number to 1
				prepareTurnorder();
			} else {
				updateTurnorderMarker(turnorder);
				// RED: v1.204 update the global state round number
				state.roundMaster.round = initial;
				// RED: v1.190 update the round counter stored in the Initiative macro library
				// RED: if it exists - requires the ChatSetAttr API Script to be loaded
                var roundCtrCmd;
				if (flags.canSetAttr && flags.canSetRoundCounter) {
				    //RED v1.207 only do this if the falgs are set for ChatSetAttr and Initiative being present
    			    roundCtrCmd = '!setattr --mute --name Initiative --round-counter|' + initial;
        			sendRmAPI(roundCtrCmd);
				}
				// RED: v2.007 introduced the new initMaster API Script.  Set it's round counter
				if (flags.canUseInitMaster) {
				    roundCtrCmd = '!init --isRound ' + initial + '|true';
				    sendRmAPI(roundCtrCmd);
				}
        		_.each(_.keys(state.roundMaster.effects), function(e) {
        			var token = getObj('graphic',e);
        			if (!token) {
        				return; 
        			}
        			updateStatusDisplay(token,isTurn);
        		});
			}
		}
		
	};
	
	/**
	 * Find an ability macro with the specified name in any 
	 * macro database with the specified root name, returning
	 * the database name.  If can't find a matching ability macro
	 * then return undefined objects
	 * RED: v3.025 added a preference for user-defined macros
	 * RED: v4.035 hold std Effects in data, & copy to char sheet 
	 *      when used to be found if not found elsewhere
	 **/
	 
	var abilityLookup = function( rootDB, abilityName ) {
		
        abilityName = abilityName.toLowerCase().replace(reIgnore,'').trim();
        rootDB = rootDB.toLowerCase();
        if (!abilityName || abilityName.length==0) {
			return {dB: rootDB, action: undefined};
        }
	    
        var dBname,
			magicDB, magicName,
			action, abilityObj,
			csDB = false,
			found = false;
			
		filterObjs(function(obj) {
			if (found) return false;
			if (obj.get('type') != 'ability') return false;
			if (obj.get('name').toLowerCase().replace(reIgnore,'') != abilityName) return false;
			if (!(magicDB = getObj('character',obj.get('characterid')))) return false;
			magicName = magicDB.get('name');
			if (!magicName.toLowerCase().startsWith(rootDB) || (/\s*v\d*\.\d*/i.test(magicName))) return false;
			if (!dbNames[magicName.replace(/-/g,'_')]) {
				dBname = magicName;
				found = true;
			} else if (!dBname) dBname = magicName;
			action = obj.get('action');
			return true;
		});
		if (!action) {
			if (_.some(dbNames,dB => !!(abilityObj = _.find(dB.db,obj => obj.name.toLowerCase().replace(reIgnore,'') == abilityName)))) {
				action = parseStr(abilityObj.body);
			}
			dBname = rootDB;
		}
		return {dB: dBname.toLowerCase(), action:action};
	}
	
	/*
	 * Create or update an ability on a character sheet
	 */
	
	var setAbility = function( charCS, abilityName, abilityMacro, actionBar=false ) {
		
		var abilityObj = findObjs({type: 'ability',
								   characterid: charCS.id,
								   name: abilityName}, 
								   {caseInsensitive:true});
		if (!abilityObj || abilityObj.length == 0) {
			abilityObj = createObj( 'ability', {characterid: charCS.id,
												name: abilityName,
												action: abilityMacro,
												istokenaction: actionBar});
		} else {
			abilityObj = abilityObj[0];
			abilityObj.set( 'action', abilityMacro );
			abilityObj.set( 'istokenaction', actionBar );
		}
		return abilityObj;
	}

	/**
	 * Get an array of controllers for the current token either
	 * from the direct token control, or linked journal control
	 */ 
	var getTokenControllers = function(token) {
		if (!token) 
			{return;}
		var controllers;
		if (token.get('represents')) {
			var journal = getObj('character',token.get('represents'));
			if (journal)
				{controllers = journal.get('controlledby').split(',');}
		} else {
			controllers = token.get('controlledby').split(',');
		}
		return controllers;
	}; 
	
	/**
	 * determine if the sender controls the token either by
	 * linked journal, or by direct token control.
	 */ 
	var isTokenController = function(token,senderId) {
		if (!token) {
			return false; 
		} else if (playerIsGM(senderId)) {
			return true; 	
		} else if (_.find(token.get('controlledby').split(','),function(e){return e===senderId;})) {
			return true;
		} else if (token.get('represents')) {
			var journal = getObj('character',token.get('represents'));
			if (journal && _.find(journal.get('controlledby').split(','),function(e){return e===senderId;})) {
				return true;
			}
		}
		return false;
	}; 
	
	/**
	 * Animate the tracker
	 *
	 * TODO make the rotation rate a field variable
	 */
	var animateTracker = function() {
		if (!flags.animating) 
			{return;}
		
		if (flags.rw_state === RW_StateEnum.ACTIVE) {
			if (flags.rotation) {
				var graphic = findTrackerGraphic();
				graphic.set('rotation',parseInt(graphic.get('rotation'))+fields.rotation_degree);
			}
			setTimeout(function() {animateTracker();},500);
		} else if (flags.rw_state === RW_StateEnum.PAUSED 
		|| flags.rw_state === RW_StateEnum.FROZEN) {
			setTimeout(function() {animateTracker();},500);
		} else {
			flags.animating = false;
		}
	}; 
	
	/*
	 * Check the version of a Character Sheet database against 
	 * the current version in the API.  Return true if needs updating
	 */
	 
	var checkDBver = function( dbFullName, dbObj, silent ) {
		
		dbFullName = dbFullName.replace(/_/g,'-');
		
		var dbName = dbFullName.toLowerCase(),
			dbCS = findObjs({ type:'character', name:dbFullName },{caseInsensitive:true}),
			dbVersion = 0.0,
			msg, versionObj;
		
		if (dbCS && dbCS.length) {
			dbCS = dbCS[0];
			versionObj = findAttrObj( dbCS, fields.dbVersion[0] );
			dbVersion = parseFloat(versionObj.get('current') || dbVersion);
			
			if (dbVersion >= (parseFloat(dbObj.version) || 0)) {
				msg = dbFullName+' v'+dbVersion+' not updated as is already latest version';
				if (!silent) sendFeedback(msg); 
				return false;
			}
		}
		return true;
	}

	/*
	 * Check the version of a Character Sheet database and, if 
	 * it is earlier than the static data held in this API, update 
	 * it to the latest version.
	 */
	 
	var buildCSdb = function( dbFullName, dbObj, silent ) {
		
		dbFullName = dbFullName.replace(/_/g,'-');
		
		var dbName = dbFullName.toLowerCase(),
			dbCS = findObjs({ type:'character', name:dbFullName },{caseInsensitive:true}),
			dbVersion = 0.0,
			errFlag = false,
			lists = {},
			rootDB = dbObj.root.toLowerCase(),
			msg, versionObj, curDB;
		
		if (!checkDBver( dbFullName, dbObj, silent )) return false; 

		if (dbCS && dbCS.length) {
			let abilities = findObjs({ _type:'ability', _characterid:dbCS[0].id });
			_.each( abilities, a => a.remove() );
			dbCS = dbCS[0];
		} else {
			dbCS = createObj( 'character', {name:dbFullName} );
		}
					
		
		_.each(_.sortBy(dbObj.db,'name'),function( item ) {
			item.body = parseStr(item.body);

			// If the effect to be written already exists but not
			// in the database to be updated, don't write it.
			// Allows the user to create new versions, but only in
			// their own databases
			curDB = abilityLookup( dbObj.root, item.name ).dB.toLowerCase();
			if (curDB != rootDB) {
				if (curDB != dbName) return;
			}
			errFlag = errFlag || !setAbility( dbCS, item.name, item.body );
		});
		if (errFlag) {
			sendError( 'Unable to completely update database '+dbName );
		} else {
			versionObj = findAttrObj( dbCS, fields.dbVersion[0] );
			versionObj.set( 'current', dbObj.version );
			dbCS.set('avatar',dbObj.avatar);
			dbCS.set('bio',dbObj.bio);
			dbCS.set('controlledby',dbObj.controlledby);
			dbCS.set('gmnotes',dbObj.gmnotes);
			msg = 'Updated database '+dbName+' to version '+String(dbObj.version);
			if (!silent) {
				sendFeedback( msg );
			} else {
				log(msg);
			}
		}
		return !errFlag;
	};

	/**
	 * Ask the player/GM to place a cross-hair on the centre of an area-of-effect
	 * and then display a token aura around the cross-hair representative of the
	 * aoe parameter.
	 *
	 * !rounds --aoe crosshairID|shape|units|length|width|confirmed|image
	 */
	var doSetAOE = function( args, selected, senderID, movable=false ) {
		
		const colors = {
					RED:	'#FF0000',
					YELLOW:	'#FFFF00',
					BLUE:	'#0000FF',
					GREEN:	'#00FF00',
					MAGENTA:'#FF00FF',
					CYAN:	'#00FFFF',
					WHITE:	'#FFFFFF',
					BLACK:	'#000000',
		};
		
		const convertFt = {
					ft:		1,
					m:		3,
					km:		3280,
					mi:		5280,
					in:		(1/12),
					cm:		(1/30),
					un:		1,
					hex:	1,
					sq:		1,
		};
		
		if (!args) args = [];
		if (!args[0] && selected && selected.length) {
			args[0] = selected[0]._id;
		};
		
		var crossHairID = args[0],
			shape = (args[1] || '').toUpperCase(),
			units = (args[2] || '').toUpperCase(),
			range = (parseInt(args[3] || -1) || -1),
			length = (parseInt(args[4] || 0) || 0),
			relLength = (args[4] || ' ').startsWith('+'),
			width = (parseInt(args[5] || 0) || 0),
			relWidth = (args[5] || ' ').startsWith('+'),
			aoeImage = (args[6] || '').toUpperCase(),
			confirmedDrop = args[7] && (args[7] == '1' || !!args[7] == true),
			casterID = args[8],
			crossHair = getObj('graphic',crossHairID),
			question  = false,
			content = '',
			charID = '',
			degToRad = function(degrees) {return degrees * (Math.PI / 180);},
			pageid = crossHair ? crossHair.get('_pageid') : Campaign().get('playerpageid'),
			pageObj = getObj('page',pageid),
			chLeft = crossHair ? crossHair.get('left') : 70,
			chTop = crossHair ? crossHair.get('top') : 70,
			chWidth = crossHair ? crossHair.get('width') : 70,
			chHeight = crossHair ? crossHair.get('height') : 70,
			chRotation = crossHair ? crossHair.get('rotation') : 0,
			scale = pageObj.get('scale_number'),
			ftSize = convertFt[pageObj.get('scale_units')] || 1,
			cellSize = pageObj.get('snapping_increment');
			
		if (!crossHair || !crossHair.get('name').toLowerCase().replace(reIgnore,'').includes('crosshair')) {
			if (!confirmedDrop || ['ARC180','ARC90','BOLT','CONE'].includes(shape)) {
				chLeft += Math.sin(degToRad(chRotation))*35;
				chTop -= Math.cos(degToRad(chRotation))*35;
			}
			range = ((units == 'YARDS') ? (range * 3 / ftSize) : ((units == 'FEET') ? (range / ftSize) : range ));
			let chName = crossHair ? crossHair.get('name') : fields.crossHairName,
				chOwnerID = crossHair ? crossHair.get('represents') : '',
				chImg = ((shape == 'CIRCLE')?fields.chCircleImage:((shape=='SQUARE')?fields.chSquareImage:fields.chConeImage)),
				crossHairObj = createObj('graphic', {
						_type: 'graphic',
						_subtype: 'token',
						_pageid: pageid,
						isdrawing: 1,
						name: fields.crossHairName,
						imgsrc: chImg,
						layer: 'objects',
						width: 70,
						height: 70,
						left: chLeft,
						top: chTop,
						rotation: chRotation,
						represents: chOwnerID,
				});
			if (crossHair && !confirmedDrop) {
				crossHair.set({aura2_color:colors.GREEN,aura2_radius:range});
			}
			toFront(crossHairObj);
			crossHairObj.set('left',chLeft+1);
			args[8] = crossHairID;
			args[0] = crossHairID = crossHairObj.id;
			crossHair = crossHairObj;
			question = !!!confirmedDrop;
			
//			log('doSetAOE: created crosshair object, l = '+chLeft+', t = '+chTop);
		}
		if (!shape || !['ARC180','ARC90','BOLT','CIRCLE','CONE','ELIPSE','RECTANGLE','SQUARE','WALL'].includes(shape)) {
			// ask for shape of aoe
			args[1] = '?{Specify area of effect shape|Arc180|Arc90|Bolt|Circle|Cone|Elipse|Rectangle|Square|Wall}';
			question = true;
			shape = 'ELIPSE';
		} 
		if (!units || !['SQUARES','FEET','YARDS','UNITS'].includes(units)) {
			// ask for units of dimensions
			args[2] = '?{Specify units of measurement|Grid squares,squares|Feet,feet|Yards,yards}';
			question = true;
		}
		if (!args[3]) {
			// ask for range
			args[3] = '?{Specify the range'+(units ? (' in '+units) : '')+'}';
			question = true;
		}
		if (!length || length <= 0) {
			// ask for length
			args[4] = '?{Specify area of effect diameter/length'+(units ? (' in '+units) : '')+'}';
			question = true;
		}
		if ((!width || width <= 0) && ['CONE','RECTANGLE','ELIPSE','BOLT','WALL'].includes(shape)) { 
			// ask for width
			args[5] = '?{Specify area of effect width'+(units ? (' in '+units) : '')+'}';
			question = true;
		}
		if (!aoeImage || !aoeImage.length) {
			// If there is no defined image, ask for a colour
			args[6] = '?{Choose an effect/colour to show|Acid|Cold|Dark|Fire|Light|Lightning|Magic|Red|Yellow|Blue|Green|Magenta|Cyan|White|Black}';
			question = true;
		}
		if (!state.roundMaster.dropOnce && !confirmedDrop) {
			// display a chat window button asking to confirm position of cross-hair
			// Button will call --aoe with a confirmedDrop
			args[7] = true;
			question = true;
		}
		if (question) {
			content = '&{template:'+fields.defaultTemplate+'}{{name=Confirm AOE placement}}'
					+ '{{AOE='+(range==0 ? ('Range is 0.') : ('Move the crosshair '+(range > 0 ? 'within the range depicted by the green area, then' : 'within the range, then')))
					+ '<br>[Confirm](!rounds '+(movable ? '--movable-aoe' : '--aoe')+' '+args.join('|')+') Area of Effect placement}}'
					+ (['ARC180','ARC90','BOLT','CONE'].includes(shape)?'{{Direction=Turn the cross hair so the arrow points in the direction of the effect}}':'')
					+ (['RECTANGLE','SQUARE'].includes(shape)?'{{Orientation=Turn the cross hair so the arrow aligns with the orientation of the effect}}':'')
					+ (['WALL'].includes(shape)?'{{Orientation=Turn the cross hair so the arrow points the way the wall is facing}}':'')
					+ '{{Location='+(['ARC180','ARC90','BOLT','CONE'].includes(shape)?'Effect will extend from the cross hair in the direction selected':'Effect will be centred on the cross hair')+'}}';
			sendResponse( senderID, content );
		
		} else {
			switch (shape) {
			case 'CIRCLE':
			case 'SQUARE':
				width = length;
				break;
			case 'ARC180':
				width = 2*length;
				break;
			case 'ARC90':
				width = Math.sqrt(2*length*length);
				break;
			case 'WALL':
				chWidth = width; 
				width = length; 
				length = chWidth;
				shape = 'RECTANGLE';
				break;
			}
			if (casterID) {
				let casterToken = getObj('graphic',casterID);
				if (casterToken) {
				    casterToken.set('aura2_radius','');
				    charID = movable ? casterToken.get('represents') : '';
				}
			}
			// Get the page the cross hair is on and
			// discover it's units and scale.  Set the
			// aoe radius as required based on these
			let pageObj = getObj('page',crossHair.get('_pageid')),
				chLeft = crossHair.get('left'),
				chTop = crossHair.get('top'),
				scale = pageObj.get('scale_number') || 5,
				ftSize = convertFt[pageObj.get('scale_units')] || 1,
				cellSize = pageObj.get('snapping_increment') || 1,
				radius = ((units == 'YARDS') ? (length * 3 / ftSize) : ((units == 'FEET') ? (length / ftSize) : length ))/((units == 'SQUARES') ? 1 : scale),
				endWidth = (((units == 'YARDS') ? (width * 3 / ftSize) : ((units == 'FEET') ? (width / ftSize) : width ))/((units == 'SQUARES') ? 1 : scale)),
				chImage = aoeImages[aoeImage.toUpperCase()];

			if (!_.isUndefined(chImage)) {
				chImage = chImage[shape] || '';
			} else {
				chImage = aoeImages.COLOR[shape] || '';
			}
			chHeight = (70*cellSize*radius) + (relLength ? chHeight : 0);
			radius = chHeight;
			endWidth = (70*cellSize*endWidth) + (relWidth ? chWidth : 0);
			if (['ARC180','ARC90','CONE','BOLT'].includes(shape)) {
				chLeft += Math.sin(degToRad(chRotation))*radius/2;
				chTop -= Math.cos(degToRad(chRotation))*radius/2;
			}
			crossHair.set({tint_color:(colors[aoeImage.toUpperCase()] || 'transparent'),
						   left:chLeft,
						   top:chTop,
						   height:chHeight,
						   width:endWidth,
						   imgsrc:chImage,
						   represents:charID});
			toBack(crossHair);
			
//			log('doSetAOE: final position, l = '+chLeft+', t = '+chTop);
//			log('doSetAOE: final: args = '+args);
			
			casterID = args[8];
			args = args.slice(9);
			let cmd = args.shift();
			if (args.length) {
//				log('doSetAOE: targeted: args = '+args);
				content = '&{template:'+fields.defaultTemplate+'}{{name=Target Area-Effect Spell}}'
						+ '{{[Select a target](!rounds --target '+cmd+'|'+casterID+'|&#64;{target|Select A Target|token_id}|'+args.join('|')+') or just do something else}}';
				sendResponse( senderID, content );
			}
		}
		return;
	};
	
	/**
	 * Start/Pause the tracker, does not annouce the starting turn
	 * as if you're moving around while paused, to reposition, you
	 * don't want it to tick down on status effects.
	 */ 
	var doStartTracker = function() {
		if (flags.rw_state === RW_StateEnum.ACTIVE) {
			doPauseTracker();
			return;
		}
		flags.rw_state = RW_StateEnum.ACTIVE;
		prepareTurnorder();
		var curToken = findCurrentTurnToken();
		if (curToken) {
			var graphic = findTrackerGraphic();
			var maxsize = Math.max(parseInt(curToken.get('width')),parseInt(curToken.get('height')));
			graphic.set('layer','gmlayer');
			graphic.set('left',curToken.get('left'));
			graphic.set('top',curToken.get('top'));
			graphic.set('width',maxsize*fields.trackerImgRatio);
			graphic.set('height',maxsize*fields.trackerImgRatio);
			setTimeout(function() {
				if (!!(curToken = getObj('graphic',curToken.get('_id')))) {
					if (curToken.get('layer') === 'gmlayer') {
						graphic.set('layer','gmlayer');
						toBack(graphic);
					} else {
						graphic.set('layer','map');
						toFront(graphic);
					}
				}
			},500);
		}
		
		updateTurnorderMarker();
		if (!flags.animating) {
			flags.animating = true;
			animateTracker();
		}
	}; 
	
	/**
	 * Stops the tracker, removing all RoundMaster controlled
	 * statuses. 
	 */ 
	var doStopTracker = function() {
		flags.rw_state = RW_StateEnum.STOPPED;
		// Remove Graphic
		var trackergraphics = findObjs({
				_type: 'graphic',
				name: fields.trackerName,
			});
		_.each(trackergraphics, function(elem) {
			if (elem)
				{elem.remove();} 
		}); 
		// Update turnorder
		updateTurnorderMarker();
		// Clean markers
		var toRemove = [];
		_.each(state.roundMaster.statuses,function(e) {
			toRemove.push({name: '', marker: e.marker, tag: e.tag}); 
		});
		updateAllTokenMarkers(toRemove); 
		// Clean state
		state.roundMaster.effects = {};
		state.roundMaster.statuses = []; 
	}; 
	
	/**
	 * Pause the tracker 
	 *
	 * DEPRECATED due to toggle of !rounds --start
	 */ 
	var doPauseTracker = function() {

		// Turn off the tracker graphic if we are pausing
		var trackergraphics = findObjs({
			_type: 'graphic',
			name: fields.trackerName,
		});
		_.each(trackergraphics, function(elem) {
			if (elem)
				{elem.remove();} 
		});
		flags.rw_state = RW_StateEnum.PAUSED;	
		updateTurnorderMarker();
	}; 
	
	/**
	 * Perform player controled turn advancement (!eot)
	 */ 
	var doPlayerAdvanceTurn = function(senderId) {
		if (!senderId || flags.rw_state !== RW_StateEnum.ACTIVE) 
			{return;}
		var turnorder = Campaign().get('turnorder');
		if (!turnorder) 
			{return;} 
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);} 
		
		var token = getObj('graphic',turnorder[0].id);
		if ((token && isTokenController(token,senderId)) || !!state.roundMaster.debug) {
			var priorOrder = JSON.stringify(turnorder);
			turnorder.push(turnorder.shift());
			turnorder = JSON.stringify(turnorder);
			handleAdvanceTurn(turnorder,priorOrder);
		}
	};
	
	/**
	 * Clear the turn order
	 */ 
	var doClearTurnorder = function() {
	/**
	 * RED: v1.190 Inserted code copied from elsewhere to save the current round
	 */
        var turnorder = Campaign().get('turnorder');
		if (!turnorder) 
			{return;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		var tracker,
			trackerpos; 
		
		if (!!(tracker = _.find(turnorder, function(e,i) {if (parseInt(e.id) === -1 && parseInt(e.pr) === -100 && e.custom.match(/Round\s*\d+/)){trackerpos = i;return true;}}))) {
			
			var indicator,
				graphic = findTrackerGraphic(),
				rounds = tracker.custom.substring(tracker.custom.indexOf('Round')).match(/\d+/); 

			if (rounds) 
				{rounds = parseInt(rounds[0]);}

            rounds = 'Round ' + rounds;
			var trackergraphics = findObjs({
				_type: 'graphic',
				name: fields.trackerName,
			});
			_.each(trackergraphics, function(elem) {
				if (elem)
					{elem.remove();} 
				});
				
			// RED: v4.034 If InitMaster is present reset all tokens in the 
			// turnorder to allow them to do Initiative again.
			
			let cmd = fields.initMaster;
			let redo = false;
			_.each(turnorder, e => {
				if (parseInt(e.id) === -1) return;
				cmd += ' --redo '+e.id+'|silent';
				redo = true;
			});
			if (redo) sendRmAPI(cmd);
			
	/**
	 * RED: v1.190 Blank the turnorder before pushing the round counter back in
	 */
        	Campaign().set('turnorder', '');
    /**
     * RED: v1.190 Push the round counter back into the turn order
     * set at the preserved round number
     */
            prepareTurnorder();
            doResetTurnorder(rounds,false);
		}

	    
	/**
	 * RED: v1.190 Removed call to stop tracker, so Clear just empties the tracker
	 * while preserving the round counter
	 * 
	 *	doStopTracker();
	 * 
	**/
	
	}; 

    /**
     * RED: v1.190 New callable function to add an entry into the turnorder.
     * RED: v1.203 Added optional ignore flag argument, and optional message argument
	 * RED: v3.012 Changed turn increments to be absolute rolled values
     * 
     * Arguments are: name, id, priority, qualifier (optional) | message (optional) | detail (optional)
     * 
     * - If qualifier exists and not one of first,last,smallest,largest,all or 0, then 
	 *   the rest of the command is ignored, otherwise if qualifier is:
	 *      first: the earliest entry is kept
	 *      last: the latest entry is kept
	 *      smallest: the lowest priority entry is kept
	 *      largest: the highest priority entry is kept
	 *      all or 0: all entries are kept and another is added with priority
	 * 
	 * - If priority starts with + or - then it is an increment on the existing selected entry
	 *   if there is one.  If not it is applied as the priority of a new entry.  - can be forced
	 *   as a new priority using =-
     *
     * - If id is a token_id or name a custom entry that already exists in the turnorder, this
	 *   is updated in line with qualifier
     * 
     * - If neither the id or the name can be found in the current turnorder,
     *   a new custom entry is created, custom if id=-1, or for tokenID = id
     * 
     * - If message exists, an initiative message is displayed in the chat window with
     *   the form '[name]'s initiative is [final number] [message] [detail]' and the turn
	 *   announcement will include the message '[name]'s turn doing [message]'
    **/	
	var doAddToTracker = function(args,senderId) {

		if (!args) 
			{return;}
			
		if (args.length < 3 || args.length > 6) {
            sendDebug('doAddToTracker: Invalid number of arguments');
			sendError('Invalid tracker item syntax');
			return;
		}

        var turnorder = Campaign().get('turnorder');
		if (!turnorder) 
			{return;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}

		var name = args[0],
		    tokenId = args[1],
			increment = ('+-'.includes(args[2][0])),
			priority = parseInt((args[2][0] == '=') ? (args[2].slice(1)) : args[2]),
			qualifier = (args[3] || '0').toLowerCase(),
			msg = (args[4] || ''),
			detail = (args[5] || ''),
			searchTerm = new RegExp(name,''),
			keepAll = ['all','0'].includes(qualifier),
			newEntry = {id: tokenId, pr: priority, custom: (tokenId != -1 ? msg : name)},
			tracker = [],
			trackerpos;
			
		if (isNaN(priority) || !['first','last','smallest','largest','all','0'].includes(qualifier))
            {return;}

		if (keepAll && !increment) {
			turnorder.push(newEntry);
		        			
		} else {
			turnorder = _.filter(turnorder,(e,i)=>{if (parseInt(e.id) == -1 && e.custom.match(searchTerm)) {
														tracker.push({id: '-1', ix: i, pr: e.pr, custom: name});
														return keepAll;
													} else  if (parseInt(tokenId) != -1 && e.id == tokenId) {
														tracker.push({id: e.id, ix: i, pr: e.pr, custom: msg});
														return keepAll;
													} else {
														return true;
													}
			});
			
			if (tracker.length) {
			
				tracker = _.sortBy(tracker,'ix');
				switch (qualifier) {
				
				case 'smallest':
				case 'largest':
					if (!increment) tracker.push(newEntry);
					newEntry = (qualifier == 'smallest') ? (_.sortBy(tracker,'pr')[0]) : (_.chain(tracker).sortBy('pr').last().value());
					if (increment) newEntry.pr += priority;
					break;
				case 'first':
				case 'last':
				default:
					newEntry = (qualifier != 'first') ? (!increment ? newEntry : _.last(tracker)) : _.first(tracker);
					if (increment) { 
						newEntry.pr += priority;
					}
					break;
				}
			}
			turnorder.push({
			    id: newEntry.id,
			    pr: newEntry.pr,
			    custom: newEntry.custom,
			});
		}
		
		if (tokenId != -1 && msg && msg.length > 0) {
		    var controllers,
		        player,
		        curToken = getObj('graphic',tokenId);
            msg = makeInitiativeDisplay(curToken,priority,msg+detail);
	        controllers=getTokenControllers(curToken);
    		if (_.find(controllers,function(e){return (e === 'all');})) {
                sendPublic(msg);
    		} else {
    		    sendFeedback(msg);
	        	_.each(controllers,function(e) {
			        player = getObj('player',e);
    				if (player && !playerIsGM(player.id) && (!state.roundMaster.viewer.is_set || (state.roundMaster.viewer.pid != player.id))) {
    				    sendResponse(player.id,msg);
    				}
    			});
	        }
		}
		
		prepareTurnorder(turnorder);
		updateTurnorderMarker(turnorder);
		turnorder.reduce((m,t)=>{
			let o = getObj('graphic',t.id);
			if(o){
			  t._pageid = o.get('pageid');
			}
			return [...m,t];
		},[]);
		storeTurnorder(turnorder);
		
	};

	/**
	* RED: v1.202 resort the tracker at the GMs request, e.g. if someone does initiative
	* after the GM has already started the round.  Automatically moves Round
	* back to the top, ready to restart the round
	**/

	var doSort = function() {

		// Pause the tracker
		// if (flags.rw_state === RW_StateEnum.ACTIVE) {
		//  doPauseTracker();
		// }
		
		// Find the round tracker in the turnorder
		var turnorder = Campaign().get('turnorder');
		if (!turnorder) 
			{return;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		var tracker,
			trackerpos; 
		
		if (!!(tracker = _.find(turnorder, function(e,i) {if (parseInt(e.id) === -1 && parseInt(e.pr) === -100 && e.custom.match(/Round\s*\d+/)){trackerpos = i;return true;}}))) {

            // Clear the tracker graphic as will effectively be starting round again
			var trackergraphics = findObjs({
				_type: 'graphic',
				name: fields.trackerName,
			});
			_.each(trackergraphics, function(elem) {
				if (elem)
					{elem.remove();} 
			});
			
			//Remove the round tracker from the turnorder
			turnorder.splice(trackerpos,1);

			//Sort the turnorder
			switch (flags.newRoundSort) {
			case TO_SortEnum.NUMASCEND:
    				turnorder.sort(function(a,b) {  return parseInt(a.pr) - parseInt(b.pr); }); break;
    		case TO_SortEnum.NUMDESCEND:
    				turnorder.sort(function(a,b) { return parseInt(b.pr) - parseInt(a.pr); }); break;
    		case TO_SortEnum.ALPHAASCEND:
    				turnorder.sort(function(a,b) { return compareTokenNames(a,b); }); break;
    		case TO_SortEnum.ALPHADESCEND:
    				turnorder.sort(function(a,b) { return compareTokenNames(b,a); }); break;
    		}
    		
			//Push the round tracker back on to the turnorder at the top
			turnorder.unshift(tracker);
			
			//Update the turnorder
    		prepareTurnorder(turnorder);
    		updateTurnorderMarker(turnorder);
			storeTurnorder(turnorder);

		}
		//Restart the tracker
		//doStartTracker();
		return;
	}
	
	/**
	 * RED: v1.202 Created
	 * RED: v1.203 Extended with optional no_to_retain argument
	 * 
	 * Remove all entries in the tracker for a specific Id or Name
	 * Arguments token_name, token_id, no_to_retain (optional, default 0)
	 * 
	 **/
	 var doRemoveFromTracker = function(args,selection) {

		if (!args && !selection) 
			{return;}

		args = args.length ? args.split('|') : [];
		
		if (args.length > 3) {
            sendDebug('doRemoveFromTracker: Invalid number of arguments');
			sendError('Invalid tracker item syntax');
			return;
		}
		
		if (!args.length) {
			let cmd = '!rounds'
			_.each(selection,token => {
				let tokenID = token._id,
				    curToken = getObj('graphic',tokenID),
					name = curToken ? curToken.get('name') : '';
				if (curToken) cmd += (' --removefromtracker '+name+'|'+tokenID);
			});
			sendRmAPI(cmd);
			return;
		};

        var turnorder = Campaign().get('turnorder');
		if (!turnorder) 
			{return;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}

		var name = args[0],
		    tokenId = args[1],
		    retain = args[2],
		    tracker,
			trackerpos = 0;
			
		if (!retain) {
		    retain = 0;
		} else {
		    retain = parseInt(retain);
		}

		// Pause the tracker
		if (flags.rw_state === RW_StateEnum.ACTIVE) {
		    doPauseTracker();
		}
		
        // Single pass find and remove the requisite number of entries
		while (trackerpos < turnorder.length) {
		    tracker = turnorder[trackerpos];
		    if (parseInt(tracker.id) === -1 && tracker.custom.match(name)) {
    			//Remove the found item from the turnorder if not to be retained
		        if (retain === 0) {
		            turnorder.splice(trackerpos,1);
		        } else {
		            retain--;
		            trackerpos++;
		        }
		    } else if (parseInt(tracker.id) !== -1 && tracker.id === tokenId) {
    			//Remove the found item from the turnorder if not to be retained
		        if (retain === 0) {
		            turnorder.splice(trackerpos,1);
		        } else {
		            retain--;
		            trackerpos++;
		        }
		    } else {
    		    trackerpos++;
		    }
		}

		//Update the turnorder
		prepareTurnorder(turnorder);
		updateTurnorderMarker(turnorder);
		storeTurnorder(turnorder);

		//Restart the tracker
		//RED: v1.207 Only restert if in a PAUSED state, not FROZEN or STOPPED
		if (flags.rw_state === RW_StateEnum.PAUSED) {
		    doStartTracker();
		}
	 }

	 /**
	 * RED:v3.002  Adding a function to push live effects away from the selected
	 * token to one other token with the same name and representing the same character,
	 * preferably on the same page, but if not then elsewhere.
	 */

	var doPushStatus = function( oldID, oldName, oldRepresents ) {

		var tokens = [],
			oldToken,
			effectList;
			
		oldToken = getObj('graphic',oldID);
		if (!oldToken)
			{return};

	    effectList = getStatusEffects(oldToken);
        if (!effectList || !Array.isArray(effectList))
			{return;}
		
		tokens[0] = _.find( findObjs({ 
							_pageid: Campaign().get('playerpageid'),
							_type: 'graphic', 
							name: oldName,
							represents: oldRepresents
					}), function(t) {return t.id != oldID});
		if (!tokens[0]) {
			tokens[0] = _.find( findObjs({ 
								_type: 'graphic', 
								name: oldName,
								represents: oldRepresents
						}), function(t) {return t.id != oldID});
		}
		if (tokens[0]) {
			doMoveStatus( tokens );
		}
		return;
	};

	 /**
	  * RED:v2.001 Adding a function to move live effects to the selected token from
	  * all other tokens with the same token_name and represents character_ID to
	  * support a move of live effects from one map to another
	 **/
	var doMoveStatus = function(selection) {
	    if (!selection)
	        {sendError('No tokens selected');return;}
        var newToken, oldToken,
            newToken_id,
		    name, char_id, page_id, charObj,
			oldName, oldChar_id, oldPage_id, oldChar,
		    effectList, oldEffects,
			tokenStatusMarkers, oldStatusMarkers;
			
		_.each(selection,function(e) {
			newToken_id = e.id;  // RED: v3.027 Note: had to remove underscore from ._id to fix Player Page Change - just in case this causes issue elsewhere
			newToken = getObj('graphic', newToken_id);
			if (!newToken || newToken.get('_subtype') !== 'token' || newToken.get('isdrawing')) {
				return;
			}
				
			// RED: v3.004 get the page_id of the token to move stuff to
			// as don't want to move stuff from the same page
			page_id = newToken.get('_pageid');
		    char_id = newToken.get('represents');
		    name = newToken.get('name').toLowerCase();
			if (char_id && (!name || name.length == 0)) {
				charObj = getObj('character', char_id );
				if (charObj) {
					name = charObj.get('name').toLowerCase();
				}
			}
		    effectList = getStatusEffects(newToken);
		    tokenStatusMarkers = newToken.get('statusmarkers');
			
		    _.each(_.keys(state.roundMaster.effects), function(elem) {
				if (newToken_id === elem) {
					return;
                }
    			oldToken = getObj('graphic',elem);
    			if (!oldToken) {
    				return; 
    			}
				
				// RED: v3.004 don't move effects or status markers from any token
				// on the same page, regardless of if it shares name & character
				oldPage_id = oldToken.get('_pageid');
				if (oldPage_id == page_id) {
					return;
				}
				oldName = oldToken.get('name');
				oldChar_id = oldToken.get('represents');
				if (!oldName || oldName.length == 0) {
					oldChar = getObj('character',oldChar_id);
					if (!!oldChar) {
						oldName = oldChar.get('name');
					}
				}
    			if (name === oldName.toLowerCase() && char_id === oldChar_id) {
                    oldEffects = getStatusEffects(oldToken);
                    oldStatusMarkers = oldToken.get('statusmarkers');
                    
                    if (oldEffects && Array.isArray(oldEffects)) {

                        if (effectList && Array.isArray(effectList)) {
                            effectList = effectList.concat(oldEffects);
                        } else {
                            effectList = oldEffects;
                        }
                        oldEffects = [];
                        setStatusEffects(oldToken,oldEffects);
                    }
                    if (tokenStatusMarkers && tokenStatusMarkers.length > 0) {
                        tokenStatusMarkers += ',' + oldStatusMarkers;
                    } else {
                        tokenStatusMarkers = oldStatusMarkers;
                    }
                    oldToken.set('statusmarkers','');
    			}
		    });
            if (effectList) {
                setStatusEffects(newToken,effectList);
            }
            if (tokenStatusMarkers) {
                newToken.set('statusmarkers',tokenStatusMarkers);
            }
		});
        updateAllTokenMarkers();
	}
	
	/*
	 * Target a spell at a token
	 */
	 
	var doTarget = function( args, senderId ) {
	    
	    if (!args) {return;}
	    if (args.length < 5) {
			sendDebug('doTarget: invalid number of arguments');
			sendError('Too few targeting arguments');
			return;
	    }
		
		var command = args[0].toUpperCase(),
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			tokenName,
			argString,
			content;
		
		if (!curToken) {
			sendDebug('doTarget: invalid tokenID parameter');
			sendError('Invalid roundMaster parameters');
			return;
		}
		if (!['CASTER','TARGET','SINGLE','AREA','ATTACK'].includes(command.toUpperCase())) {
			sendError('Invalid targeting command: must be CASTER, SINGLE, ATTACK or AREA');
			return;
		}
		args.shift();
		if (args[1]==tokenID && command == 'CASTER') {
			args.shift();
		}
		if (command != 'CASTER') {
		    args.shift();
		}

		argString = args.join('|');
		if (playerIsGM(senderId)) {
			doAddTargetStatus(args);
		} else {
			doPlayerTargetStatus(args,senderId);
		}

		args = argString.split('|');
		if (command == 'AREA') {
			tokenID = args.shift();
			content = '&{template:'+fields.defaultTemplate+'}{{name=Target Area-Effect Spell}}'
					+ '{{[Select another target](!rounds --target '+command+'|'+tokenID+'|&#64;{target|Select Next Target|token_id}|'+args.join('|')+') or just do something else}}';
			sendResponse( senderId, content );
			args.unshift(tokenID);
		}

		return;
	}
	
	/**
	 * Set or clear a playerid as a "viewer" that sees what each token 
	 * in the turn order can see at it gets to the top of the turn order.
	 */
	 
	var doSetViewer = function(args,senderId) {
		var player = getObj('player',state.roundMaster.viewer.pid),
			playerName = 'not set';

		if (player) playerName = player.get('_displayname');
			
		if (!args) {
			if (senderId == state.roundMaster.viewer.pid) {
				state.roundMaster.viewer.is_set = !state.roundMaster.viewer.is_set;
			} else {
				state.roundMaster.viewer.is_set = true;
				state.roundMaster.viewer.pid = senderId;
			}
			sendResponse(senderId,'Viewer '+playerName+' turned '+(state.roundMaster.viewer.is_set ? 'on' : 'off'));
		} else {
			args = args.split('|');
			let cmd = args[0].toLowerCase();
			switch (cmd) {
			case 'on':
			case 'off':
				state.roundMaster.viewer.is_set = (cmd == 'on');
				if (cmd == 'off') {
					filterObjs( obj => {
						if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') {return false;}
						addRemovePID(obj,state.roundMaster.viewer.pid,true,false);
						return true;
					});
					state.roundMaster.viewer.tokenID = '';
				} else {
    				state.roundMaster.viewer.pid = senderId;
				}
    			sendResponse(senderId,'Viewer '+playerName+' turned '+(state.roundMaster.viewer.is_set ? 'on' : 'off'));
				break;
			case 'echo':
				args[1] = args[1].toLowerCase();
				if (['on','off','all'].includes(args[1])) {
					state.roundMaster.viewer.echo = args[1];
					sendResponse(senderID,'Viewer '+playerName+' echo option set to '+args[1]);
				} else {
					sendResponseError(senderId,'Invalid Viewer echo option');
				}
				break;
			case 'all':
			default:
				let tokenID = args[0],
			        allView = cmd == 'all',
				    curToken = getObj('graphic',tokenID);
				if ((curToken || allView) && state.roundMaster.viewer.is_set) {
					filterObjs( obj => {
						if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') {return false;}
						addRemovePID(obj,state.roundMaster.viewer.pid,allView,false);
					});
					state.roundMaster.viewer.tokenID = '';
					if (!allView) {
    					addRemovePID(curToken,state.roundMaster.viewer.pid,true,true);
    					state.roundMaster.viewer.priorID = state.roundMaster.viewer.tokenID;
    					state.roundMaster.viewer.tokenID = tokenID;
					}
					sendResponse(senderId,'View set to '+(allView ? 'all' : curToken.get('name')));
				} else {
					sendDebug('doSetViewer: invalid argument '+args[0]);
					sendResponseError(senderId,'Invalid Viewer command');
				}
				break;
			}
		}
		return;
	}
		
				
	/*
	 * Update effect databases to latest versions held in API
	 */
 
	var doUpdateEffectsDB = function(args) {
		
		var silent = (args[0] || '').toLowerCase() == 'silent',
			dbName = args[1];
			
		if (dbName && dbName.length) {
			let dbLabel = dbName.replace(/-/g,'_');
			if (!dbNames[dbLabel]) {
				sendError('Not found database '+dbName);
			} else {
				log('Updating database '+dbName);
				sendFeedback('Updating database '+dbName);
				buildCSdb( dbName, dbNames[dbLabel], silent );
			}
		} else if (_.some( dbNames, (db,dbName) => checkDBver( dbName, db, silent ))) {
			if (!silent) sendFeedback('Updating all Effect databases');
			_.each( dbNames, (db,dbName) => {
				let dbCS = findObjs({ type:'character', name:dbName.replace(/_/g,'-') },{caseInsensitive:true});
				if (dbCS && dbCS.length) {
					let versionObj = findAttrObj( dbCS[0], fields.dbVersion[0] );
					versionObj.set(fields.dbVersion[1], 0);
				}
			});
			// Have to remove all pre-defined databases before updating them
			// so that moves can happen without causing duplicates
			_.each( dbNames, (db,dbName) => buildCSdb( dbName, db, silent ));
		}
		
		return;
	}
	
	/**
	 * Update or create the help handouts
	 **/
	 
	var updateHandouts = function(silent,senderId) {
		
		_.each(handouts,(obj,k) => {
			let dbCS = findObjs({ type:'handout', name:obj.name },{caseInsensitive:true});
			if (!dbCS || !dbCS[0]) {
			    log(obj.name+' not found.  Creating version '+obj.version);
				if (!silent) sendFeedback(obj.name+' not found.  Creating version '+obj.version);
				dbCS = createObj('handout',{name:obj.name,inplayerjournals:senderId});
				dbCS.set('notes',obj.bio);
				dbCS.set('avatar',obj.avatar);
			} else {
				dbCS = dbCS[0];
				dbCS.get('notes',function(note) {
					let reVersion = new RegExp(obj.name+'\\s*?v(\\d+?.\\d*?)</span>', 'im');
					let version = note.match(reVersion);
					version = (version && version.length) ? (parseFloat(version[1]) || 0) : 0;
					if (version >= obj.version) {
						if (!silent) sendFeedback('Not updating handout '+obj.name+' as is already version '+obj.version);
					    return;
					}
					dbCS.set('notes',obj.bio);
					dbCS.set('avatar',obj.avatar);
					if (!silent) sendFeedback(obj.name+' handout updated to version '+obj.version);
					log(obj.name+' handout updated to version '+obj.version);
				});
			}
		});
		return;
	}

	/*
	 * Run the effect macro specified in an external command call
	 * Used by AttackMaster for weapon effects
	 */
	 
	var runEffect = function(args) {
		
		var tokenID = args[0],
			msg = args[1],
			effect = args[2],
			macro = args[3],
			curToken = getObj('graphic',tokenID);
			
		if (!curToken || !effect || !macro) return;
		sendAPImacro( curToken, msg, effect, 0, macro );
		return;
	}
	
	/**
	 * Just echo the parameter string.  Mostly for Effect
	 * macros to be able to whisper messages from API buttons
	 **/
	
	var doEcho = function(argStr) {
		
		sendChat('',argStr,null,{noarchive:!flags.archive, use3d:false});
		return;
	}


	/**
	 * Handle Pending Requests
	 */
	var doRelay = function(args,senderId) {
		if (!args) 
			{return;}
		var carry,
			hash; 
		args = args.split(' %% '); 
		if (!args) { log(args); return; }
		hash = args[0];
		if (hash) {
			hash = hash.match(/hc% .+/);
			if (!hash) { log(hash); return; }
			hash = hash[0].replace('hc% ','');
			carry = args[1];
			if (carry)
				{carry = carry.trim();}
			var pr = findPending(hash);
			if (pr) {
				pr.doOps(carry);
				clearPending(hash);    
			} else {
                sendDebug('doRelay: Selection Invalidated');
				sendResponseError(senderId,'Selection Invalidated');
			}
		}
	}; 
	
	/**
	 * Handle handshake request
	 **/
	 
	var doHsQueryResponse = function(args) {
		if (!args) return;
		var from = args[0] || '',
			func = args[1] || '',
			funcTrue = ['start','stop','pause','reset','addtotracker','removefromtracker','sort','sortorder','clearonround','clearonclose','clear,','viewer','addstatus',
						'addtargetstatus','aoe','edit','target','clean','removestatus','deletestatus','deltargetstatus','movestatus','s_marker','disptokenconfig','listfav']
						.includes(func.toLowerCase()),
			cmd = '!'+from+' --hsr rounds'+((func && func.length) ? ('|'+func+'|'+funcTrue) : '');
			
		sendRmAPI(cmd);
		return;
	};

	/**
	 * Show help message
	 */ 
	var showHelp = function() {
		var content = 
			'<div style="background-color: #FFF; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; margin-left: 2px; margin-right: 2px; padding-top: 5px; padding-bottom: 5px;">'
				+ '<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 125%">RoundMaster v'+version+'</span>'
				+ '</div>'
				+ '<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
					+ '<div style="font-weight: bold;">See RoundMaster Help handout in the Journal for full information</div><br>'
					+ '<div style="font-weight: bold;">!rounds --help</div>'
					+ '<li style="padding-left: 10px;">Display this message</li><br>'
					+ '<div style="font-weight: bold;">!rounds --start</div>'
					+ '<li style="padding-left: 10px;">Toggle Start/Pause Tracker functionality</li><br>'
					+ '<div style="font-weight: bold;">!rounds --stop</div>'
					+ '<li style="padding-left: 10px;">Stop Tracker & dump all Statuses</li><br>'
					+ '<div style="font-weight: bold;">!rounds --pause</div>'
					+ '<li style="padding-left: 10px;">Pause Tracker functionality</li><br>'
					+ '<div style="font-weight: bold;">!rounds --reset [number]</div>'
					+ '<li style="padding-left: 10px;">Set current Tracker round number (default is 1)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --sort</div>'
					+ '<li style="padding-left: 10px;">Sort Tracker in previously defined order (dafault ascending numeric)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --clear</div>'
					+ '<li style="padding-left: 10px;">Clear all Tracker entries</li><br>'
					+ '<div style="font-weight: bold;">!rounds --clearonround [OFF/ON]</div>'
					+ '<li style="padding-left: 10px;">Alter behaviour at end of round (default on)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --clearonclose [OFF/ON]</div>'
					+ '<li style="padding-left: 10px;">Alter behaviour on closing the Tracker (default off)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --sortorder [order]</div>'
					+ '<li style="padding-left: 10px;">Set the Tracker sort order to one of NOSORT, ATOZ, ZTOA, DESCENDING, ASCENDING (default ASCENDING)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --addtotracker name|tokenID/-1|priority|[qualifier]|[msg]|[detail]</div>'
					+ '<li style="padding-left: 10px;">Add entry to Turn Order for <i>tokenID</i> or if tokenID=-1 custom entry <i>name</i>. Qualifier defines which entry is kept: FIRST, LAST, SMALLEST, LARGEST, ALL (default ALL)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --removefromtracker name|tokenID/-1|[retain]</div>'
					+ '<li style="padding-left: 10px;">Remove Turn Order entries for <i>tokenID</i> or if tokenID=-1 custom entry <i>name</i>. Optionally retain first <i>retain</i> entries</li><br>'
					+ '<div style="font-weight: bold;">!rounds --addstatus status|duration|[-]direction|[msg]|[marker]</div>'
					+ '<li style="padding-left: 10px;">Add a status and status marker to currently selected token(s) for <i>duration</i> incremented by <i>direction</i> each round.  Display optional <i>msg</i> each time is token\'s turn</li><br>'
					+ '<div style="font-weight: bold;">!rounds --addtargetstatus tokenID|status|duration|[-]direction|[msg]|[marker]</div>'
					+ '<li style="padding-left: 10px;">Same as addstatus, but for a single specified token</li><br>'
					+ '<div style="font-weight: bold;">!rounds --edit</div>'
					+ '<li style="padding-left: 10px;">Edit the statuses on the selected token(s)</li><br>'
					+ '<div style="font-weight: bold;">!rounds --target CASTER|casterID|status|duration|[-]direction|[msg]|[marker]</div>'
					+ '<li style="padding-left: 10px;">Same as addtargetstatus for token <i>casterID</i></li><br>'
					+ '<div style="font-weight: bold;">!rounds --target SINGLE|casterID|targetID|status|duration|[-]direction|[msg]|[marker]</div>'
					+ '<li style="padding-left: 10px;">Same as addtargetstatus for token <i>tokenID</i></li><br>'
					+ '<div style="font-weight: bold;">!rounds --target AREA|casterID|targetID|status|duration|[-]direction|[msg]|[marker]</div>'
					+ '<li style="padding-left: 10px;">Performs addtargetstatus for token <i>tokenID</i> then asks Player whether to target another token</li><br>'
					+ '<div style="font-weight: bold;">!rounds --aoe tokenID|[shape]|[units]|[range]|[length]|[width]|[image]|[confirmed]</div>'
					+ '<li style="padding-left: 10px;">Displays an Area of Effect, prompting for any needed parameters that are not supplied in the command</li><br>'
					+ '<div style="font-weight: bold;">!rounds --clean</div>'
					+ '<li style="padding-left: 10px;">Remove token markers on selected token(s) without dropping statuses - status markers recreated at start of next round</li><br>'
					+ '<div style="font-weight: bold;">!rounds --removestatus status(es)/ALL</div>'
					+ '<li style="padding-left: 10px;">Removes the named status(es) from the selected token(s), running any assossiated effects</li><br>'
					+ '<div style="font-weight: bold;">!rounds --deletestatus status(es)/ALL</div>'
					+ '<li style="padding-left: 10px;">Removes the named status(es) from the selected token(s), but does not run any assossiated effects</li><br>'
					+ '<div style="font-weight: bold;">!rounds --deltargetstatus tokenID|status(es) / ALL</div>'
					+ '<li style="padding-left: 10px;">Runs deletestatus for the identified token</li><br>'
					+ '<div style="font-weight: bold;">!rounds --movestatus</div>'
					+ '<li style="padding-left: 10px;">Move all statuses from identical tokens in the rest of the campaign to the selected token</li><br>'
					+ '<div style="font-weight: bold;">!rounds --listmarkers</div>'
					+ '<li style="padding-left: 10px;">Display markers and which are in use</li><br>'
					+ '<div style="font-weight: bold;">!rounds --disptokenstatus [tokenID]</div>'
					+ '<li style="padding-left: 10px;">Display statuses for selected token(s) in Turn Announcement format</li><br>'
					+ '<div style="font-weight: bold;">!rounds --listfav</div>'
					+ '<li style="padding-left: 10px;">Display statuses defined as favourites, and allow changes and applying to tokens</li><br>'
					+ '<div style="font-weight: bold;">See RoundMaster Help handout for full information</div>'
				+ '</div>'
   			+ '</div>'; 

		sendFeedback(content); 
	}; 
	
	/**
	 * Send public message
	 */
	var sendPublic = function(msg) {
		if (!msg) 
			{return undefined;}
		var content = '/desc ' + msg;
		sendChat('',content,null,{noarchive:!flags.archive, use3d:false});
	};
	
	/**
	 * RED: v1.301 Function to send an API command to chat
	 * that has '^^parameter^^' replaced by relevant names & ids
	**/
	var sendAPImacro = function(curToken,msg,effect,rounds,macro) {
		
		if (!curToken || !macro || !effect) {
			sendDebug('sendAPImacro: a parameter is null');
			return;
		}
		var journal,
		    tid = curToken.id,
		    tname = curToken.get('name'),
		    cid = curToken.get('represents'),
		    words;
			
		sendDebug( 'msg is ' + msg );
			
		if (msg.length && msg.length > 0) {
		    words = msg.split(' ');
            if (words.length && words.length > 1 && words[0].toLowerCase() === 'effect')
                    {effect = words[1];}
		}
		if (cid) {
			journal = getObj( 'character', cid );
		}
		effect = /^[^_]+/.exec(effect) || effect;
		var cname = journal ? journal.get('name') : curToken.get('name'),
			bar1 = curToken.get('bar1_value'),
			bar2 = curToken.get('bar2_value'),
			bar3 = curToken.get('bar3_value'),
			ac, acField, thac0, thac0Field, hp, hpField,
			effectAbility = abilityLookup( fields.effectlib, effect+macro ),
			macroBody = effectAbility.action;
			[ac,acField] = getTokenValues(curToken,fields.Token_AC,fields.AC,fields.MonsterAC);
			[thac0,thac0Field] = getTokenValues(curToken,fields.Token_Thac0,fields.Thac0_base,fields.MonsterThac0);
			[hp,hpField] = getTokenValues(curToken,fields.Token_HP,fields.HP);

		if (!macroBody) {
			sendDebug('Not found effectMacro ' + effect + macro);
			return;
		} else {
			macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname )
								 .replace( /\^\^tname\^\^/gi , tname )
								 .replace( /\^\^cid\^\^/gi , cid )
								 .replace( /\^\^tid\^\^/gi , tid )
								 .replace( /\^\^bar1_current\^\^/gi , bar1 )
								 .replace( /\^\^bar2_current\^\^/gi , bar2 )
								 .replace( /\^\^bar3_current\^\^/gi , bar3 )
								 .replace( /\^\^ac\^\^/gi , ac.current )
								 .replace( /\^\^thac0\^\^/gi , thac0.current )
								 .replace( /\^\^hp\^\^/gi , hp.current )
								 .replace( /\^\^ac_max\^\^/gi , ac.max )
								 .replace( /\^\^thac0_max\^\^/gi , thac0.max )
								 .replace( /\^\^hp_max\^\^/gi , hp.max )
								 .replace( /\^\^token_ac\^\^/gi , acField.current )
								 .replace( /\^\^token_thac0\^\^/gi , thac0Field.current )
								 .replace( /\^\^token_hp\^\^/gi , hpField.current )
								 .replace( /\^\^token_ac_max\^\^/gi , acField.max )
								 .replace( /\^\^token_thac0_max\^\^/gi , thac0Field.max )
								 .replace( /\^\^token_hp_max\^\^/gi , hpField.max )
								 .replace( /\^\^duration\^\^/gi , rounds );
			sendDebug('sendAPImacro: macroBody is ' + macroBody );
			sendChat('',macroBody,null,{noarchive:!flags.archive, use3d:false});
			
		}
	}

    /**
     * Send API command to chat
     */
    var sendRmAPI = function(msg) {
		if (!msg) {
		    sendDebug('sendRmAPI: no msg');
		    return undefined;
		}
		sendDebug('sendRmAPI: msg is ' + msg );
		sendChat('',msg,null,{noarchive:!flags.archive, use3d:false});
    };

	/**
	* Fake message is fake!
	*/
	var sendFeedback = function(msg) {

 		var content = '/w GM '
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + fields.feedbackImg + '">' 
				+ '</div>'
				+ msg;
			
		sendChat(fields.feedbackName,content,null,{noarchive:!flags.archive, use3d:false});
	};

	/**
	 * Sends a response to the player, or to the GM if the playerid
	 * is invalid.
	 */
	var sendResponse = function(pid,msg,as,img) {
		if (!pid || !msg) 
			{return null;}
		var player = getObj('player',pid),
			to; 
		if (player) {
			to = '/w "' + player.get('_displayname') + '" ';
		} else {
			// RED: v3.003 softened the treatment of invalid playerIDs
			// RED: as a bug in the Transmogrifier seems to create these
			// throw('could not find player: ' + to);
			sendDebug('sendResponse: invalid pid passed');
			sendError('Could not find player: ' + pid);
			to = '/w gm ';
		}
		var content = to
				+ '<div style="position: absolute; top: 4px; left: 5px; width: 26px;">'
					+ '<img src="' + (img ? img:fields.feedbackImg) + '">' 
				+ '</div>'
				+ msg;
        // RED: v1.203 corrected, as the call to sendChat() seemed to have wrong number
        // RED: of parameters and not to work
		sendChat((as ? as:fields.feedbackName),content,null,{noarchive:!flags.archive, use3d:false});
	}; 

	var sendResponseError = function(pid,msg,as,img) {
		sendResponse(pid,'<span style="color: red; font-weight: bold;">'+msg+'</span>',as,img); 
	}; 

	/**
	 * Send an error
	 */ 
	var sendError = function(msg) {
		sendFeedback('<span style="color: red; font-weight: bold;">'+msg+'</span>'); 
	}; 
 
	/**
	 * RED: v1.207 Send a debugging message if the debugging flag is set
	 */ 
	var sendDebug = function(msg) {
	    if (!!state.roundMaster.debug) {
	        var player = getObj('player',state.roundMaster.debug),
	            to;
    		if (player) {
	    		to = '/w "' + player.get('_displayname') + '" ';
		    } else 
		    	{throw ('sendDebug could not find player');}
		    if (!msg)
		        {msg = 'No debug msg';}
    		sendChat('RM Debug',to + '<span style="color: red; font-weight: bold;">'+msg+'</span>',null,{noarchive:!flags.archive, use3d:false}); 
	    };
	}; 
	
	var doSetDebug = function(args,senderId) {
		var player = getObj('player',senderId),
		    playerName;
		if (player) {
		    playerName = player.get('_displayname');
		}
		else 
			{throw ('doSetDebug could not find player: ' + args);}
	    if (!!args && args.toLowerCase() != 'off') {
    	    state.roundMaster.debug = senderId;
    	    sendResponse(senderId,'Debug set to ' + playerName);
	        sendDebug('Debugging turned on');
	    } else {
    	    sendResponse(senderId,'Debugging turned off');
	        state.roundMaster.debug = false;
	    }
	};
 
	/**
	 * Handle chat message event
	 * RED: v1.213 Updated to allow multiple actions per call
	 * This allows procedural/linear processing of activity and overcomes
	 * some of the limitations of Roll20 asynchronous processing
	 */ 
	var handleChatMessage = function(msg) { 
		var args = processInlinerolls(msg),
			senderId = msg.playerid,
			selected = msg.selected,
			isGM = (playerIsGM(senderId) || state.roundMaster.debug === senderId);
			
		// Make sure libTokenMarkers exists, and has the functions that are expected
		if('undefined' === typeof libTokenMarkers
			|| (['getStatus','getStatuses','getOrderedList'].find(k=>
				!libTokenMarkers.hasOwnProperty(k) || 'function' !== typeof libTokenMarkers[k]
			))
		) { 
			if (flags.notifyLibErr) {
				flags.notifyLibErr = !flags.notifyLibErr;
				setTimeout( () => flags.notifyLibErr = !flags.notifyLibErr, 10000 );
				// notify of the missing library
				sendChat('',`/w gm <div style="color:red;font-weight:bold;border:2px solid red;background-color:black;border-radius:1em;padding:1em;">Missing dependency: libTokenMarkers</div>`);
			}
			return;
		};
		if (msg.type === 'api' && args.indexOf('!eot') === 0) {
    		doPlayerAdvanceTurn(senderId);
    		return;
		}

		if (msg.type !=='api' || (args.indexOf('!rounds') !== 0 && args.indexOf('!tj') !== 0))
			{return;}

        sendDebug('roundMaster called');

		args = args.split(' --');
		args.shift();

		senderId = msg.playerid;
		if (_.isUndefined(senderId) || _.isUndefined(getObj('player',senderId))) {
			sendDebug('senderId undefined, looking for GM');
			if (_.isUndefined(senderId = findTheGM())) {
				sendDebug('Unable to findTheGM');
				return;
			} else {
				sendDebug('found the GM');
				isGM = true;
			}
		} else {
			sendDebug('senderId is defined as ' + getObj('player',senderId).get('_displayname'));
		};
		
		_.each(args, function(e) {
			var arg = e, i=arg.indexOf(' '), cmd, argString;
			sendDebug('Processing arg: '+arg);
			
			cmd = (i<0 ? arg : arg.substring(0,i)).trim().toLowerCase();
			argString = (i<0 ? '' : arg.substring(i+1).trim());
			arg = argString.split('|');
			
			try {
				switch (cmd) {
				case 'addfav':
						if (isGM) doAddFavorite(argString);
						break;
				case 'addstatus':
						if (isGM) doAddStatus(arg,selected)
						else doPlayerAddStatus(arg,selected,senderId);
						break;
				case 'addtargetstatus':
						// RED: v1.204 Added --addtargetstatus so that spells can be 
						// cast by players on other player's tokens and on monsters
						if (isGM) doAddTargetStatus(arg);
							// RED: v1.204 Added --addtargetstatus so that spells can be 
							// cast by players on other player's tokens and on monsters
							// If player calls, DM is given option to refuse.
						else doPlayerTargetStatus(arg, senderId);
						break;
				case 'addtotracker':
						// RED: v1.190 allow players access to addToTracker to allow adding 
						// RED: multiple entries for 3/2, 2, ... attacks per round etc
						// RED: v1.201 Added the ability to add additional lines
						// into the turn tracker
						doAddToTracker(arg,senderId);
						break;
				case 'aoe':
						// RED: v3.018 add function to display the area of effect of 
						// a spell or other action by dropping a cross-hair or arrow
						// token on the map at the origin/centre
						doSetAOE(arg,selected,senderId);
						break;
				case 'applyfav':
						if (isGM) doApplyFavorite(argString,selected);
						break;
				case 'clean':
						// RED: v1.208 unknown conditions may be corrupting the token 'statusmarkers'
						// string, leaving stranded markers. This should clean them.
						if (isGM) doCleanTokens(selected);
						break;
				case 'clear':
						// RED: v1.202 moved -clear to down the bottom so parameter set
						// commands would be found first
						if (isGM) doClearTurnorder();
						break;
				case 'clearonclose':
						// RED: v1.201 added ability to set flags via commands
						if (isGM) doSetClearOnClose(arg);
						break;
				case 'clearonround':
						// RED: v1.201 added ability to set flags via commands
						if (isGM) doSetClearOnRound(arg);
						break;
				case 'debug':
						// RED: v1.207 allow anyone to set debug and who to send debug messages to
						doSetDebug(argString,senderId);
						break;
				case 'deletestatus':
						doRemoveStatus(argString,selected,false);
						break;
				case 'deltargetstatus':
						doDelTargetStatus(argString,false);
						break;
				case 'dispmarker':
						if (isGM) doDisplayMarkers(argString);
						break;
				case 'dispmultistatusconfig':
						if (isGM) doDisplayMultiStatusConfig(argString);
						break;
				case 'dispstatusconfig':
						if (isGM) doDisplayStatusConfig(argString);
						break;
				case 'disptokenconfig':
						if (isGM) doDisplayTokenConfig(argString);
						break;
				case 'disptokenstatus':
						doDisplayTokenStatus(arg,selected,senderId,isGM);
						break;
				case 'echo':
						doEcho(argString);
						break;
				case 'edit':
						if (isGM) doMultiEditTokenStatus(selected);
						break;
				case 'edit_multi_status':
						if (isGM) doEditMultiStatus(argString);
						break;
				case 'edit_status':
						if (isGM) doEditStatus(argString);
						break;
				case 'effect':
						runEffect(arg);
						break;
				case 'help':
						if (isGM) showHelp();
						break;
				case 'hsq':
				case 'handshake':
						doHsQueryResponse(arg);
						break;
				case 'listfav':
						if (isGM) doDisplayFavConfig(); 	
						break;
				case 'marker':
						if (isGM) doDirectMarkerApply(argString);
						break;
				case 'movable-aoe':
						// RED: v3.026 add function to display a movable area of effect of 
						// a spell or other action by dropping a cross-hair or arrow
						// token on the map at the origin/centre
						doSetAOE(arg,selected,senderId,true);
						break;
				case 'movestatus':
						if (isGM) doMoveStatus(selected);
						break;
				case 'pause':
						if (isGM) doPauseTracker();
						break;
				case 'relay':
						doRelay(argString,senderId);
						break;
				case 'removefromtracker':
						// RED: v1.202 Added the removeFromTracker function to allow the DM
						// RED: to clean up the turn order if needed
						// RED: v1.203 allow players access to removeFromTracker to 
						// assist clean initiative selection
						doRemoveFromTracker(argString,selected);
						break;
				case 'removestatus':
						// RED: v1.210 allow players to remove statuses e.g. when
						// spell durations end (mostly via macros)
						doRemoveStatus(argString,selected,true);
						break;
				case 'removetargetstatus':
						doDelTargetStatus(argString,true);
						break;
				case 'reset':
						if (isGM) doResetTurnorder(argString);
						break;
				case 'listmarkers':
				case 's_marker':
						if (isGM) doShowMarkers();
						break;
				case 'sort':
						// RED: v1.202 Added the ability to re-sort the turnorder after
						// the start of the round, & reset the round to start
						if (isGM) doSort();
						break;
				case 'sortorder':
						// RED: v1.201 added ability to set flags via commands
						if (isGM) doSetSort(arg);
						break;
				case 'start':
						if (isGM) doStartTracker();
						break;
				case 'stop':
						if (isGM) doStopTracker();
						break;
				case 'target':
						doTarget(arg,senderId);
						break;
				case 'update-db':
				case 'extract-db':
						if (isGM) doUpdateEffectsDB(arg);
						break;
				case 'handout':
				case 'handouts':
						if (isGM) updateHandouts(false,senderId);
						break;
				case 'viewer':
						// RED: v3.011 allow a player to be set as a "viewer" that will see what the 
						// token at the top of the turn order sees
						doSetViewer(argString,senderId);
						break;
				default:
						sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
						showHelp();
						break;
				}
			} catch (e) {
				sendError( 'roundMaster JavaScript '+e.name+': '+e.message );
				sendDebug( 'roundMaster trapped JavaScript '+e.name+': '+e.message);
			}
		});
	};
	
	/**
	 * Handle a token being added to the tabletop: run an token_name'-add' effect macro
	 */
	
	var handleAddGraphic = function(obj) {
		
		if (obj.get('type') != 'graphic' || obj.get('subtype') != 'token') {return;}
		
		sendAPImacro( obj, '', obj.get('name'), 0, '-add' );
	};

	/**
	 * Handle turn order change event
	 */ 	
	var handleChangeCampaignTurnorder = function(obj,prev) {
		handleAdvanceTurn(obj.get('turnorder'),prev.turnorder);
	};
	
	var handleChangeCampaignInitativepage = function(obj,prev) {
		if (obj.get('initiativepage')) {
			prepareTurnorder(obj.get('turnorder'));
		} else {
			if (flags.clearonclose) {
				doClearTurnorder();
				doPauseTracker();
			}
		}
	};
	
	/**
	 * Handle Graphic movement events
	 */ 
	var handleChangeGraphicMovement = function(obj,prev) {
		if (!flags.image || flags.rw_state === RW_StateEnum.STOPPED) 
			{return;}
		var graphic = findTrackerGraphic(),
			curToken = findCurrentTurnToken(),
			maxsize = 0; 

		if (!curToken || curToken.get('_id') !== obj.get('_id'))
			{return;}
		
		maxsize = Math.max(parseInt(curToken.get('width')),parseInt(curToken.get('height')));
		graphic.set('layer','gmlayer');
		graphic.set('left',curToken.get('left'));
		graphic.set('top',curToken.get('top'));
		graphic.set('width',maxsize*fields.trackerImgRatio);
		graphic.set('height',maxsize*fields.trackerImgRatio);
		if (flags.rw_state === RW_StateEnum.ACTIVE)
			{flags.rw_state = RW_StateEnum.FROZEN;}
		setTimeout(function() {
			if (graphic) {
				if (curToken.get('layer') === 'gmlayer') {
					graphic.set('layer','gmlayer');
					toBack(graphic);
				} else {
					graphic.set('layer','map');
					toFront(graphic);
				}
				if (flags.rw_state === RW_StateEnum.FROZEN)
					{flags.rw_state = RW_StateEnum.ACTIVE;}
			}
		},500);
	};
	
	/**
	 * Handle a change to the page the Player ribbon is on
	 **/
	 
	var handleChangePlayerPage = function(obj,prev) {
	    
	    var page = getObj('page',Campaign().get('playerpageid')),
			tokens = findObjs({ _pageid: page.id, _type: 'graphic' });
		if (!!tokens) {
		    tokens = _.toArray(tokens);
			doMoveStatus( tokens );
		}
		return;
	}
	
	/**
	 * Handle a token being added to a page.  Check if this is the
	 * current Player page and, if so, check if any effect markers
	 * should be applied to it.
	 */
	 
	var handleChangeToken = function(obj,prev) {

		if (!obj)
			{return;}
			
		if (obj.get('name') == prev['name'])
		    {return;}
		
		if (obj.get('name').toLowerCase().replace(reIgnore,'').includes('dmcrosshair')) {
			doSetAOE([obj.id], findTheGM());
		} else {
			if (prev['name'].length > 0 && obj.get('_subtype') == 'token' && !obj.get('isdrawing')) {
				doPushStatus( obj.id, prev['name'], ((prev['represents'] && prev['represents'].length>0) ? prev['represents'] : obj.get('represents')) );
			}
			if (obj.get('_pageid') == Campaign().get('playerpageid')) {
				var tokens = [];
				tokens[0] = obj;
				doMoveStatus( tokens );
			}
		}
		return;
	}
	
	/**
	 * Handle the event when a token is removed from a page.
	 * Move any live effects on it to any other similar token.
	 * If no similar tokens exist, end the effects, calling the
	 * relevant effect macros.
	 */
	 
	var handleDestroyToken = function(obj,prev) {
		
		var oldID = obj.id,
		    oldName = obj.get('name'),
		    oldRepresents = obj.get('represents'),
			oldStatusMarkers = obj.get('statusmarkers'),
			oldEffects = state.roundMaster.effects[oldID],
			effectAbility,
		    newToken,
			newEffects,
			newStatusMarkers,
			charCS,
			removedStatus,
			toRemove = [];

		if (!oldEffects || oldEffects.length == 0) {
			return;
		};

		newToken = _.find( findObjs({ 
							_pageid: Campaign().get('playerpageid'),
							_type: 'graphic', 
							name: oldName,
							represents: oldRepresents
					}), function(t) {return t.id != oldID});
		if (!newToken) {
			newToken = _.find( findObjs({ 
								_type: 'graphic', 
								name: oldName,
								represents: oldRepresents
						}), function(t) {return t.id != oldID});
		};

		if (newToken) {
            // If found a match, just add the effect markers and effects
			newEffects = getStatusEffects(newToken);
			newStatusMarkers = newToken.get('statusmarkers');
			
			if (oldEffects && Array.isArray(oldEffects)) {
				if (newEffects && Array.isArray(newEffects)) {
					newEffects = newEffects.concat(oldEffects);
				} else {
					newEffects = oldEffects;
				}
			}
            if (newEffects) {
                setStatusEffects(newToken,newEffects);
            }
 
			if (newStatusMarkers && newStatusMarkers.length > 0) {
				newStatusMarkers += ',' + oldStatusMarkers;
			} else {
				newStatusMarkers = oldStatusMarkers;
			}
			if (newStatusMarkers) {
                newToken.set('statusmarkers',newStatusMarkers);
            }
		    
		} else {
			// Can't use calls to the normal functions, as obj no longer exists
		    _.each(oldEffects, function(e) {
				// If the Effects library exists, run any effect-end macro on this character
				// Can't call sendAPImacro as obj no longer exists in Campaign
				charCS = getObj( 'character', oldRepresents );
				if (charCS) {
					var cname = charCS.get('name'),
						bar1 = obj.get('bar1_value'),
						bar2 = obj.get('bar2_value'),
						bar3 = obj.get('bar3_value'),
						ac, acField, thac0,thac0Field, hp, hpField,
						effectAbility = abilityLookup( fields.effectlib, e.name+'-end' ),
						macroBody = effectAbility.action;
						
					[ac,acField] = getTokenValues(obj,fields.Token_AC,fields.AC,fields.MonsterAC);
					[thac0,thac0Field] = getTokenValues(obj,fields.Token_Thac0,fields.Thac0,fields.MonsterThac0);
					[hp,hpField] = getTokenValues(obj,fields.Token_HP,fields.HP);

					if (!macroBody) {
						sendDebug('handleDestroyToken: Not found effectMacro ' + e.name + '-end');
					} else {
						if (!cname) {
							cname = oldName;
						}
						if (macroBody) {
							macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname )
												 .replace( /\^\^tname\^\^/gi , oldName )
												 .replace( /\^\^cid\^\^/gi , oldRepresents )
												 .replace( /\^\^tid\^\^/gi , oldID )
												 .replace( /\^\^bar1_current\^\^/gi , bar1 )
												 .replace( /\^\^bar2_current\^\^/gi , bar2 )
												 .replace( /\^\^bar3_current\^\^/gi , bar3 )
												 .replace( /\^\^ac\^\^/gi , ac.current )
												 .replace( /\^\^thac0\^\^/gi , thac0.current )
												 .replace( /\^\^hp\^\^/gi , hp.current )
												 .replace( /\^\^ac_max\^\^/gi , ac.max )
												 .replace( /\^\^thac0_max\^\^/gi , thac0.max )
												 .replace( /\^\^hp_max\^\^/gi , hp.max )
												 .replace( /\^\^token_ac\^\^/gi , acField.current )
												 .replace( /\^\^token_thac0\^\^/gi , thac0Field.current )
												 .replace( /\^\^token_hp\^\^/gi , hpField.current )
												 .replace( /\^\^token_ac_max\^\^/gi , acField.max )
												 .replace( /\^\^token_thac0_max\^\^/gi , thac0Field.max )
												 .replace( /\^\^token_hp_max\^\^/gi , hpField.max );
							sendDebug('handleDestroyToken: macroBody is ' + macroBody );
							sendChat('',macroBody,null,{noarchive:!flags.archive, use3d:false});
							
						}
					}
				}
				// Reduce by 1 the number of tokens that have this effect status
				// If the effect status is no longer on any token, remove it
				removedStatus = updateGlobalStatus(e.name,undefined,-1);
				toRemove.push(removedStatus);
			});
		}
		updateAllTokenMarkers(toRemove); 
		return;

	};
	
	var handleTokenDeath = function(obj,prev) {
		
		if (obj.get("status_dead")) {
			// If the token dies and is marked as "dead" by the GM
			// remove all active effects from the token
			doRemoveStatus( 'all', obj, false );
		}
		return;		
	};
		
	/**
	 * Register and bind event handlers
	 */ 
	var registerAPI = function() {
		on('chat:message',handleChatMessage);
		on('change:campaign:turnorder',handleChangeCampaignTurnorder);
		on('change:campaign:initiativepage',handleChangeCampaignInitativepage);
		on('change:campaign:playerpageid',handleChangePlayerPage);
		on('change:graphic:top',handleChangeGraphicMovement);
		on('change:graphic:left',handleChangeGraphicMovement);
		on('change:graphic:layer',handleChangeGraphicMovement);
		on('change:graphic:name',handleChangeToken);
		on('change:graphic:statusmarkers',handleTokenDeath);
		on('destroy:graphic',handleDestroyToken);
	};
 
	return {
		init: init,
		registerAPI: registerAPI
	};
 
}());

on("ready", function() {
	'use strict'; 
	RoundMaster.init(); 
	RoundMaster.registerAPI();
});