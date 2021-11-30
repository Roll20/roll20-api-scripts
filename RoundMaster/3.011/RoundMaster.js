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
 * The goal of this script is to be an iniative tracker, that manages statuses,
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
 * v1.201  24/07/2020 Updated to allow use of parameterised calls in API Buttons
 * v1.202  26/07/2020 Updated with auto Turn Tracker sorting on new round and
 *                    the ability to set the various configuration flags
 * v1.203  29/07/2020 Improved the robustness of player initiative selection
 *                    and the associated messaging
 * v1.204  31/07/2020 Added enhancements to the status management system to support
 *                    2e spell casting macro libraries
 * v1.205  02/08/2020 Added a better error trap in updateAllTokenMarkers() to trap the 
 *                    crash that recently happened.  Added code to send diagnostics
 * v1.206  06/08/2020 Fixed bug that prevented players from setting the default token
 *                    markers for spell effects, and being asked every time.  Also changed
 *                    action on misspelt default marker to allow player to choose instead
 * v1.207  08/08/2020 Added debugging messages, flag for directing them to a player
 *                    and the -debug command (0 or 1 arg which is name of player. No arg
 *                    turns off debug messages)
 * v1.208  11/08/2020 Added doCleanTokens() allowing selected tokens to be cleaned
 *                    of spurious corrupted token markers
 * v1.209  12/08/2020 Changed Debug to set debug to the player who sends the -debug
 *                    command
 * v1.210  14/08/2020 Added -removestatus to the commands usable by players
 * v1.211  21/08/2020 Version merge errors mean that this version is skipped
 * v1.212  21/08/2020 Changed state.trackerjacker to state.redtrackerjacker to reflect
 *                    current authorship & contribution.  Also logged round reset on init, and 
 *                    defined initial turnorder in init as undefined, so as to force getting it from
 *                    the Campaign state.
 * v1.213  23/08/2020 Changed the !tj command parsing to allow multiple command actions per line
 *                    with split on the new command separator '--'
 * v1.300  25/08/2020 Addec extended debugging capability to allow debugging player to
 *                    execute 'GM Only' !tj commands and get copied in on all messages 
 *                    whispered to the GM using sendFeedback().  This allows full remote
 *                    debugging.
 * v1.301  28/08/2020 Added Effect macros that are called when effects are set, end, and 
 *                    exist on a token's turn.  They are held in the Effects Mecro Library
 *                    and are called Effect-name-set, Effect-name-turn, and Effect-name-end
 * v1.301  28/08/2020 Developed the ability to run macros when Effects start & end, and every turn for
 *                    any token that has an Effect ststus set for it.  The macros are from the Effects Library, are
 *                    named effect-name-start, effect-name-turn, effect-name-end, and use ^^cname^^ as a
 *                    place holder to insert the Character Name of the token/charater to affect
 * v1.302  31/08/2020 Allowed the system to have multiple effects with the same marker, and display
 *                    the duration of the shortest effect.  Longer effects then replace the marker
 *                    when the shorter effect ends
 * v1.303  11/09/2020 Added support for multi-round actions in the tracker, with turn messages
 *                    giving the countdown on duration
 * v2.000  31/10/2020 Has been stable for more than 1 month, so announcing a major version to reflect this
 * v2.001  31/10/2020 Adding function to move effects from one token to another with the same token_name and
 *                    Represents Character_ID, to allow moving live statuses from one map to another
 * v2.002  07/11/2020 Found that after a player/GM interation to place a marker already in use for a different
 *                    effect, the system gave a "hard" error message, with no soft fix route for the player
 *                    or GM.  Attempted fix in line with v1.302 to allow multiple effects with same marker
 * v2.003  08/11/2020 Changed the status name comparison in doRemoveStatus() to .includes() so that
 *                    multiple statuses can be removed at the same time
 * v2.004  22/11/2020 Changed the command introducer to ' --' (was just '--') as did not realise that
 *                    token-ids could have '--' embedded in them.
 * v2.005  27/11/2020 Found that the Aid effect macro was expecting ^^bar3_current^^ as a replaced field name,
 *                    but that the code had not been written.  Added for bar1, 2 & 3 (current only for now)
 * v2.006  28/11/2020 Corrected the action of flags.archive, as true should archive & false not archive chat messages
 * v2.007  01/12/2020 Introduced the ability of working with initMaster API Script.
 * v2.008  08/12/2020 Reworked initiative message to go to the GM and all controllers of a character
 *                    so that when called by an API Script (such as initMaster) it doesn't just send to GM only
 * v2.009  17/12/2020 Reworked updateStatusDisplay so that only increments status & runs '-turn' macro on turn display
 * v2.010  02/01/2021 To support two-weapon attacks, changed announceTurn() to be called even if current token turn
 *                    is the same as the previous token turn (previously only showed if token changed)
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
 */
 
var RoundMaster = (function() {
	'use strict'; 
	var version = 3.011,
		author = 'Ken L. & RED',
		pending = null;
	
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
		trackerImgRatio: 2.25,
		rotation_degree: 10,
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
		uniqueMarkers: false
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
		{name:"archery-target",img:'https://s3.amazonaws.com/files.d20.io/images/8074237/ei4JHB51P6az3slwgZmTEw/thumb.png?1425598739'}
	]);

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
		if (state.roundMaster.debug = undefined)
		    {state.roundMaster.debug = false;}
		if (!state.roundMaster.round)
			{state.roundMaster.round = 1;
			log(`-=> roundMaster round reset <=-`);}
			
		// RED: v1.301 update the global ID of the Effects Library
		var effectsLib = findObjs({ _type: 'character' , name: 'Effects' });
        state.roundMaster.effectsLib = false;
		if (effectsLib) {
    		if (effectsLib.length > 0) {
    			state.roundMaster.effectsLib = effectsLib[0];
    		}
    	}
		
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

		log(`-=> roundMaster v${version} <=-`);

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
			while (start > 0) {
				if (line[start].match(re))
					{start--;}
				else
					{start++;break;}
			}
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
			isPlayer,
			gstatus,
			statusArgs,
			toRemove = [],
			content = '',
			hcontent = ''; 
			
		isPlayer = isPlayerControlled( curToken );
			
		_.each(effects, function(e) {
			if (!e) {return;}
			statusArgs = e;
			gstatus = statusExists(e.name); 
			// RED: v1.204 only need to increment if the first or only turn in the round
			if (isTurn && parseInt(e.round) !== parseInt(state.roundMaster.round)) {
				statusArgs.round = state.roundMaster.round;
				statusArgs.duration = parseInt(statusArgs.duration) + 
					parseInt(statusArgs.direction);
				if (state.roundMaster.effectsLib && statusArgs.duration > 0) {
					// RED: v1.301 run the relevant effect-turn macro if it exists
					sendAPImacro( curToken, statusArgs.msg, statusArgs.name, '-turn' );
				}
			}
			if (gstatus.marker && isPlayer)
				{content += makeStatusDisplay(e);}
			else
				{hcontent += makeStatusDisplay(e)}
		});
		effects = _.reject(effects,function(e) {
			if (e.duration <= 0) {
				if (state.roundMaster.effectsLib) {
					// RED: v1.301 when removing the status marker
					// run the relevant effect-end macro if it exists
					sendAPImacro( curToken, e.msg, e.name, '-end' );
				}
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
			effects = getStatusEffects(token);
			tokenStatusString = token.get('statusmarkers');
			if (_.isUndefined(tokenStatusString) || tokenStatusString === 'undefined') {
				return;
			}
			if (!_.isString(tokenStatusString)) {
			    return;
			}
			
			isPlayer = isPlayerControlled(token);
			tokenStatusString = tokenStatusString.split(',');

/**			_.each(effects, function(elem) {
				statusName = elem.name.toLowerCase(); 
				status = _.findWhere(state.roundMaster.statuses,{name: statusName});
				if (status) {
					tokenStatusString = _.reject(tokenStatusString, function(j) {
						return j.match(new RegExp(status.marker+'@?[1-9]?$')); 
					}); 
					tokenStatusString.push(status.marker + ((elem.duration > 0 && elem.duration <= 9 && elem.direction !== 0) ? ('@'+elem.duration):'')); 
				}
			});
**/
			if (!!toRemove) {
				_.each(toRemove,function(e) {
					if (!e) {return;}
					hasRemovedEffect = _.findWhere(effects,{name:e.name}); 
					if (!hasRemovedEffect) {
						tokenStatusString = _.reject(tokenStatusString, function(rre) {
							if (rre.match(new RegExp(e.marker+'@?[1-9]?$')) || 
							rre === 'undefined') {
								return true;
							}
						});
					}
				}); 
			}

			_.each(effects, function(elem) {
				statusName = elem.name.toLowerCase(); 
				status = _.findWhere(state.roundMaster.statuses,{name: statusName});
				if (status) {
			        foundMarkerVal = 10;
			        replaceMarker = true;
					tokenStatusString = _.reject(tokenStatusString, function(j) {
						if (foundMarker = j.match(new RegExp(status.marker+'@?[1-9]?$'))) {
						    if (markerVals = foundMarker[0].match(/[1-9]/)) {
						        foundMarkerVal = parseInt(markerVals[0]);
						    }
    						return replaceMarker = foundMarkerVal >= (elem.duration - elem.direction);
						}
						return false;
					}); 
                    if (replaceMarker) {
    					tokenStatusString.push(status.marker + ((isPlayer && elem.duration > 0 && elem.duration <= 9 && elem.direction !== 0) ? ('@'+elem.duration):'')); 
                    }
				}
			});
			
			if (tokenStatusString.length > 0) {
				tokenStatusString = _.reduce(tokenStatusString,function(memo,str) {
					if (memo === 'undefined')
						{return str;}
					if (str === 'undefined')
						{return memo;}
					return ((memo ? (memo+','):'')+str);
				});
			}

			token.set('statusmarkers',(tokenStatusString||''));
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
					indicator = '▶ ';
					break;
				case RW_StateEnum.PAUSED:
					graphic = findTrackerGraphic();
					graphic.set('tint_color','#FFFFFF'); 
					indicator ='▍▍';
					break;
				case RW_StateEnum.STOPPED:
					graphic.set('tint_color','transparent'); 
					indicator = '◼ ';
					break;
				default:
					indicator = tracker.custom.substring(0,tracker.custom.indexOf('Round')).trim();
					break;
			}
			tracker.custom = indicator + 'Round ' + rounds;
			
		}
		
		turnorder = JSON.stringify(turnorder);
		Campaign().set('turnorder',turnorder);
		
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
			{return;}
		
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

		mImg = _.findWhere(statusMarkers,{name: globalStatus.marker}); 
		if (mImg) 
			{mImg = '<img src="' + mImg.img + '"></img>'; }
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
			markerdef = _.findWhere(statusMarkers,{name: gstatus.marker});
			midcontent += 
				'<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ (markerdef ? ('<td width="21px" height="21px">'
						+ '<div style="width: 21px; height: 21px;"><img src="'+markerdef.img+'"></img></div>'
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
			content;   

		_.each(statusMarkers,function(e) {
			if (!favored)
				{command = (!custcommand ? ('!rounds --marker ' + e.name + ' %% ' + statusName) : (custcommand+e.name));}
			else
				{command = (!custcommand ? ('!rounds --marker ' + e.name + ' %% ' + statusName + ' %% ' + 'fav') : (custcommand+e.name));}
			//n*m is evil
			if (!favored && (taken = _.findWhere(state.roundMaster.statuses,{marker: e.name}))) {
				takenList += '<div style="float: left; padding: 1px 1px 1px 1px; width: 25px; height: 25px;">' 
					+ '<span class="showtip tipsy" title="'+taken.name+'" style="width: 21px; height: 21px"><img style="text-align: center;" src="'+e.img+'"></img></span>'
					+'</div>';
			} else {
				markerList += '<div style="float: left; padding: 1px 1px 1px 1px; width: 25px; height: 25px;">' 
					+ '<a style="font-size: 0px; background: url('+e.img+') center center no-repeat; width: 21px; height: 21px" href="'+command+'"><img style="text-align: center;" src="'+e.img+'"></img></a>'
					+'</div>';	  
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
			{markerdef = _.findWhere(statusMarkers,{name: gstatus.marker});}
		
		content += '<div style="font-weight: bold; font-style: italic; color: '+design.statuscolor+'; background-color: '+design.statusbgcolor+'; border: 2px solid '+design.statusbordercolor
			+'; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 1em; text-align: center;">'
			+ '<table width="100%">' 
			+ '<tr>'
			+ (markerdef ? ('<td><div style="width: 21px; height: 21px;"><img src="'+markerdef.img+'"></img></div></td>'):'')
			+ '<td width="100%">'+statusArgs.name + ' ' + (parseInt(statusArgs.direction) === 0 ? '': (parseInt(statusArgs.duration) <= 0 ? '<span style="color: red;">Expiring</span>':statusArgs.duration))
			+ (parseInt(statusArgs.direction)===0 ? '<span style="color: blue;">∞</span>' : (parseInt(statusArgs.direction) > 0 ? '<span style="color: green;">▲(+'+statusArgs.direction+')</span>':'<span style="color: red;">▼('+statusArgs.direction+')</span>'))
			+ ((statusArgs.msg) ? ('<br><span style="color: #000">' + getFormattedRoll(statusArgs.msg) + '</span>'):'')+'</td>'
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
	var makeTurnDisplay = function(curToken,msg,isGM) {
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
			markerdef = _.findWhere(statusMarkers,{name: e.marker});
			midcontent += 
				'<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ (markerdef ? ('<td width="21px" height="21px">'
						+ '<div style="width: 21px; height: 21px;"><img src="'+markerdef.img+'"></img></div>'
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

		mImg = _.findWhere(statusMarkers,{name: globalStatus.marker}); 
		if (mImg) 
			{mImg = '<img src="' + mImg.img + '"></img>';}
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
			markerdef = _.findWhere(statusMarkers,{name: gstatus.marker});
			midcontent += 
				'<tr style="border-bottom: 1px solid '+design.statusbordercolor+';" >'
					+ (markerdef ? ('<td width="21px" height="21px">'
						+ '<div style="width: 21px; height: 21px;"><img src="'+markerdef.img+'"></img></div>'
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
		content += /*'<div style="border-top: 1px solid black;">'
					+ '<a style="font-weight: bold" href="!rounds --addstatus ?{name}|?{duration}|?{direction}|?{message}"> Add Status</a>'
					+ '<br><a style="font-weight: bold" href="!rounds --listfavs"> Apply Favorite</a>'
				+ '</div>'+*/'</div>'; 
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
			controllers, curCtrl, viewerCtrl = false,
			tokenSight, curSight,
    		charID = curToken.get('represents');

		charCS = (charID) ? getObj('character',charID) : false;
		controllers = (charCS) ? (charCS.get('controlledby') || '') : '';
		if (!controllers && !addNPC) {return;}
		
		curSight = curToken.get('has_bright_light_vision');
        if (!_.isUndefined(state.roundMaster.viewer[curToken.id])) {
            state.roundMaster.viewer[curToken.id] = curSight;
        }
        tokenSight = state.roundMaster.viewer[curToken.id] || false;

//        log('addRemovePID: token '+curToken.get('name')+' on entry addPlayer='+addPlayer+', addNPC='+addNPC+', controllers='+controllers+' tokenSight='+tokenSight);

		curCtrl = controllers.includes(viewerID);
		controllers = controllers.split(',').filter(id => (!!id && id != viewerID));
		addNPC = addNPC || controllers.length;
//		log('addRemovePID: token '+curToken.get('name')+' controllers.length='+controllers.length+', addNPC='+addNPC);
		if (addPlayer && addNPC) {
		    state.roundMaster.viewer[curToken.id] = curToken.get('has_bright_light_vision');
			controllers.push(viewerID);
			viewerCtrl = tokenSight = true;
//			log('addRemovePID: token '+curToken.get('name')+' adding token vision saved as '+state.roundMaster.viewer[curToken.id]);
		}
		
		if (viewerCtrl != curCtrl) {
			charCS.set('controlledby',controllers.join());
		}
		if (tokenSight != curSight) {
			curToken.set('has_bright_light_vision',tokenSight);
		}
		if ((viewerCtrl != curCtrl) || (tokenSight != curSight)) {
			setTimeout(function() {
				curToken.set('left',(curToken.get('left')+1));     // moving the token forces a screen update for ray tracing
			},500);
		}
//		log('addRemovePID: token '+curToken.get('name')+' final outcome controllers='+controllers+', tokenSight='+tokenSight);
		
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
		    newRound = false;
		
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
				};
				turnorder.push(currentTurn);
				currentTurn = turnorder[0];
				updateTurnorderMarker(turnorder);
				// RED: v1.204 visit every token with statuses and update them if not already done
				// TODO
        		_.each(_.keys(state.roundMaster.effects), function(e) {
        			var token = getObj('graphic',e);
        			if (!token) {
        				return; 
        			}
        			updateStatusDisplay(token,true);
        		});
                
				// RED: v1.204 set the global round state variable to the current round number
				state.roundMaster.round = rounds;
				// RED: v 1.190 Set an attribute in the character sheet Initiative to the value of round
				// RED: Requires that the API ChatSetAttr is loaded and Initiative exists
                // RED: v1.207 check to see that ChatSetAttr and Initiative are defined via flags
                if (flags.canSetAttr && flags.canSetRoundCounter) {
    				roundCtrCmd = '!setattr --silent --name Initiative --round-counter|' + rounds;
    				sendDebug('Sending command ' + roundCtrCmd );
	    			sendRmAPI(roundCtrCmd);
                } else {
                    sendDebug('Not setting round_counter');
                }
                // RED: v2.007 introduced the new initMaster API script.  Send it the round counter
                if (flags.canUseInitMaster) {
                    roundCtrCmd = '!init --isRound ' + rounds;
                    sendRmAPI(roundCtrCmd);
                }
			
			// RED: v1.202 If just advanced into the start of a new round, sort the turnorder
			} else if (turnorder.length > 1 && !!priororder) {
			    if (isTracker(priororder[0])) {

    				//RED: sort the turnorder according to the configuration
    				var priorturn = turnorder.pop();
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
					if (state.roundMaster.viewer.is_set) {
						filterObjs( obj => {
							if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') {return false;}
							addRemovePID(obj,state.roundMaster.viewer.pid,false,false);
						});
						state.roundMaster.viewer.tokenID = '';
						
					}
    				turnorder.push(priorturn);
    				updateTurnorderMarker(turnorder);
    				currentTurn = turnorder[0];
			    }
			}
			// RED: v1.190 vary the behaviour based on a config re clear on newRound
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
        							if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') {return false;}
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
		
		turnorder = JSON.stringify(turnorder);
		Campaign().set('turnorder',turnorder);
        // TODO Have a status flag to signal whether to clear on newRound
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
			markerdef = _.findWhere(statusMarkers,{name: markerUsed.marker});
			sendError('Status <i>"'+markerUsed.name+'"</i> already uses marker <img src="'+markerdef.img+'"></img>. You can either change the marker for favorite <i>"'+statusName+'"</i> or the marker for <i>"'+markerUsed.name+'"</i>');
			return; 
		}

		markerdef = _.findWhere(statusMarkers,{name: fav.marker});

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
			+ '<br>Marker: ' + (markerdef ? ('<img src="'+markerdef.img+'"></img>'):'none')
			+ '<br>Duration: ' + fav.duration
			+ '<br>Direction: ' + fav.direction + (fav.msg ? ('<br>Message: ' + fav.msg):'')
			+ '<br><br><span style="font-style: normal;">Status placed on the following:</span><br>' ;

		content += midcontent; 
		
		status = statusExists(fav.name.toLowerCase()); 
		if (status && !status.marker && fav.marker)
			{doDirectMarkerApply(markerdef.name+' %% '+fav.name); }
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

		if (marker && !_.findWhere(statusMarkers,{name: marker})) {
			marker = undefined; 
		} else {
			markerdef = _.findWhere(statusMarkers,{name: marker});
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
			+ '<br>Marker: ' + (markerdef ? ('<img src="'+markerdef.img+'"></img>'):'none')
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
            
        args = args.split('|');
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
		    // RED v3.002 If desling with an effect triggered by anyone
		    // deleting a token with effects on it, the token may
		    // legitimately no longer exist
		    return;
		}
		args = args.join('|');
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

		// RED: changed the parameter seperator from ':' to '|'
		// RED: to allow use of !rounds calls in API Buttons
		args = args.split('|');
		
		if (args.length <3 || args.length > 5) {
		    sendDebug('doAddStatus: wrong number of args');
			sendError('Invalid status item syntax');
			return;
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
		} else if (!_.find(statusMarkers, function(e) { return e.name === marker; })) {
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
			
			if ((status = _.find(effectList,function(elem) {return elem.name.toLowerCase() === effect.toLowerCase();}))) {
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
				updateGlobalStatus(effect,undefined,1);
			} else {
			    // RED: v1.204 added the round of last update
				state.roundMaster.effects[effectId] = effectList = new Array({
					name: effect,
					duration: duration,
					direction: direction,
					round: state.roundMaster.round,
					msg: msg
				});
				updateGlobalStatus(effect,undefined,1);
			}

			// RED: v1.301 when adding a new effect marker
			// run the relevant effect-start macro if it exists
			// NOTE: if multiple tokens for same character sheet,
			// This will apply the macro multiple times
			// TODO Add list of cid to status and stop duplication
			if (state.roundMaster.effectsLib) {
    				sendAPImacro( curToken, msg, effect, '-start' );
			}

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
			if (marker)
				{status.marker = marker;}
			else {
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

		args = args.toLowerCase();
		
		_.each(selection, function(e) {
			effectId = e._id;
			curToken = getObj('graphic', e._id);
			if (!curToken || curToken.get('_subtype') !== 'token' || curToken.get('isdrawing'))
				{return;}
			effects = state.roundMaster.effects[effectId];
			effects = _.reject(effects,function(elem) {
				if (args.includes(elem.name.toLowerCase()) || args.includes('all')) {
				    // RED: v2.003 changed '==='' comparison of strings to 'includes()' comparison
				    // so that multiple effects can be removed at the same time
					found = true;
					midcontent += '<div style="width: 40px; height 40px; display: inline-block;"><img src="'+curToken.get('imgsrc')+'"></div>'; 
					if (endMacro && state.roundMaster.effectsLib) {
						// RED: v1.301 when removing the status marker
						// run the relevant effect-end macro if it exists
						// RED: v3.010 if using the new --deletestatus command,
						// so endMacro is false, don't trigger the -end effect
						sendAPImacro( curToken, elem.msg, elem.name, '-end' );
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
			{return;}
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

        args = args.split('|');
		if (args.length <4 || args.length > 6) {
            sendDebug('doPlayerTargetStatus: Invalid number of arguments');
			sendError('Invalid status item syntax');
			return;
		}
		var target = getObj('graphic', args[0]),
		    args = args[1] + '|' + args[2] + '|' + args[3]
		    + '|' + ((args[4] && args[4].length > 0) ? args[4] : ' ')
		    + ((args[5] && args[5].length > 0) ? ('|' + args[5]) : '');
		    
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
		
		// RED: v1.190 changed the parameter seperator from ':' to '|'
		// RED: to allow use of !rounds calls in API Buttons
		args = args.split('|');
		
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
			markerdef = _.findWhere(statusMarkers,{name: status.marker});
		} else {
            // RED: v1.206 fixed issue of player macros not able to set marker in command line
		    markerdef = _.findWhere(statusMarkers,{name: marker});
		}

	    // RED: v1.204 added the round of last update
		statusArgs.name = name;
		statusArgs.duration = duration;
		statusArgs.direction = direction;
		statusArgs.round = state.roundMaster.round;
		statusArgs.msg = msg;
		// RED: v1.204 If markerdef is not defined, then use the marker parameter passed in
		// RED: If the marker parameter is also undefined, works as previously coded

        if (!!markerdef) {
		    statusArgs.marker = markerdef.name; 
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
			sendResponse('<span style="color: orange; font-weight: bold;">Request sent for \''+statusArgs.name+'\'</span>'); 
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
			+ '<br>Marker: ' + (markerdef ? ('<img src="'+markerdef.img+'"></img>'):'none')
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
			var argStr = args.statusArgs.name
					+ '|' + args.statusArgs.duration
					+ '|' + args.statusArgs.direction
					+ '|' + args.statusArgs.msg
					+ '|' + args.statusArgs.marker,
				markerdef; 
			markerdef = _.findWhere(statusMarkers,{name: statusArgs.marker});

            // RED: v2.002 The system should now be able to deal with a marker used for multiple different effects as per v1.302
            doAddStatus(argStr,selection);
            
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
			sendResponse(args.senderId,'<span style="color: green; font-weight: bold;">Status application for \''+statusArgs.name+'\' accepted</span>'); 

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
			sendResponseError(args.senderId,'Status application for \''+statusArgs.name+'\' rejected'); 
			sendError('Rejected status application for \''+statusArgs.name+'\' from ' + player.get('_displayname')); 

			_.each(args.hlist,function(e) {
				clearPending(e) ;
			});
		},rejectArgs);

		addPending(pr_confirm,hashes[0]);
		addPending(pr_reject,hashes[1]); 


		markerdef = _.findWhere(statusMarkers,{name: statusArgs.marker});

		content += '<div style="font-weight: bold; background-color: '+design.statusbgcolor+'; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em;">'
			+ '<div style="text-align: center; color: '+design.statuscolor+'; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 120%">Request Add Status</span>'
				+ '</div>'
			+ '<span style="color:'+design.statuscolor+';">'+ player.get('_displayname') + '</span> requested to add the following status...<br>'
			+ '<br>Name: ' + '<span style="color:'+design.statuscolor+';">'+statusArgs.name+'</span>'
			+ '<br>Marker: ' + (markerdef ? ('<img src="'+markerdef.img+'"></img>'):'none')
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
		sendResponse(senderId,'<span style="color: orange; font-weight: bold;">Request sent for \''+statusArgs.name+'\'</span>'); 
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
			oldMarker;

		// if we're a favorite we don't bother with the status and active effects.
		if (isFav) {
			var fav = favoriteExists(statusName); 
			if (fav) {
				fav.marker = markerName; 
				markerdef = _.findWhere(statusMarkers,{name: markerName});
				sendFeedback('<div style="color: green; font-weight: bold;">Marker for <i><b>Favorite</i> "'+statusName+'"</b> set as <div style="width: 21px; height 21px; display: inline-block;"><img src="'+markerdef.img+'"></img></div></div>' );
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
				markerdef = _.findWhere(statusMarkers,{name: markerName});
				if (!markerdef) 
					{return;}
                sendDebug('doDirectMarkerApply: Marker <u>"'+markerName+'"</u> already used by "' + found.name + '"');
				sendError('Marker <div style="width: 21px; height 21px; display: inline-block;"><img src="'+markerdef.img+'"></img></div> already taken by "' + found.name + '"');
				// marker taken
			} else {
				if (status.marker) {
					oldMarker = status.marker; 
				}
				markerdef = _.findWhere(statusMarkers,{name: markerName});
				status.marker = markerName;
				if (!markerdef) 
					{return;}
				sendFeedback('<div style="color: green; font-weight: bold;">Marker for <b>"'+statusName+'"</b> set as <div style="width: 21px; height 21px; display: inline-block;"><img src="'+markerdef.img+'"></img></div></div>' );
				updateAllTokenMarkers([{name: '', marker: oldMarker}]);
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
		flags.clearonnewround = (typeof(args) === 'string' ? args.toLowerCase() !== 'off' : true );
		sendFeedback('Turn Order will '+(flags.clearonnewround ? '' : '<b>not</b> ')+'be cleared at the end of the round'); 
    	return;
	}

	/**
	* RED: v1.202 Added configuration function -clearonclose [on/off], default is off
	**/
	var doSetClearOnClose = function(args) {
		flags.clearonclose = (typeof(args) === 'string' ? args.toLowerCase() === 'on' : false );
		sendFeedback('Turn Order will '+(flags.clearonclose ? '' : '<b>not</b> ')+'be cleared and stopped when it is closed'); 
	    return;
	}

	/**
	* RED: v1.202 Added configuration function -sort [ascending/descending/atoz/ztoa/nosort], default is ascending
	**/
	var doSetSort = function(args) {
        var sortorder;
		switch (args.toLowerCase()) {
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
	 * Resets the turn order the the provided round number
	 * or in its absense, configures it to 1. Does no other
	 * operation other than change the round counter.
	 */ 
	var doResetTurnorder = function(args) {
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
			}
		}
		
	};
	
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
			toRemove.push({name: '', marker: e.marker}); 
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

		if(flags.rw_state === RW_StateEnum.PAUSED) {
			doStartTracker();
		} else {
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
		}
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
            
			
	/**
	 * RED: v1.190 Blank the turnorder before pushing the round counter back in
	 */
        	Campaign().set('turnorder', '');
    /**
     * RED: v1.190 Push the round counter back into the turn order
     * set at the preserved round number
     */
            prepareTurnorder();
            doResetTurnorder(rounds);
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
     * 
     * Arguments are: name, id, increment, ignore (optional) | message (optional)
     * 
     * - If ignore exists and !== 0, then the rest of the command is ignored
     *
     * - If id is a token_id that already exists in the turnorder and increment !== 0,
     *    a new turnorder entry is made with the same id and priority increased by increment.
     * 
     * - If id is -1, name exists (a custom entry) and increment is !== 0, a new
     *   custom entry is created with the same name and priority increased by increment.
     * 
     * - If neither the id or the name can be found in the current turnorder,
     *   a new custom entry is created with name, id=-1, and priority=increment (even if 0)
     * 
     * - If message exists, an initiative message is displayed in the chat window with
     *   the form '[name]'s initiative is [final number] [message]'
    **/	
	var doAddToTracker = function(args,senderId) {

		if (!args) 
			{return;}

		args = args.split('|');
		
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
			increment = parseInt(args[2]),
			ignore = parseInt(args[3]),
			msg = (args[4] || ''),
			detail = (args[5] || ''),
			searchTerm = name,
			tracker,
			trackerpos;
			
        if (ignore && ignore !== 0)
            {return;}

		if (tracker = _.find(turnorder, function(e,i) {if (parseInt(e.id) === -1 && e.custom.match(searchTerm)){return true;}})) {

    		if (increment === 0)
    		    {return;}
		
            increment += parseInt(tracker.pr);
			turnorder.push({
				id: '-1',
				pr: increment,
				custom: name,
			});
			
		} else if (tracker = _.find(turnorder, function(e,i) {if (parseInt(tokenId) !== -1 && e.id === tokenId){return true;}})) {

/* RED: v2.010 if a fighter is using two weapons, they might have the same speed
    		if (increment === 0)
    		    {return;}
*/		
            increment += parseInt(tracker.pr);
			turnorder.push({
				id: tracker.id,
				pr: increment,
				custom: msg,
			});
			
		} else {

			turnorder.push({
				id: tokenId,
				pr: increment,
				custom: msg,
			});
		        
		}
		
		if (tokenId !== -1 && msg && msg.length > 0) {
		    var controllers,
		        player,
		        curToken = getObj('graphic',tokenId);
            msg = makeInitiativeDisplay(curToken,increment,msg+detail);
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
		turnorder = JSON.stringify(turnorder);
		Campaign().set('turnorder',turnorder);
		
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
			turnorder = JSON.stringify(turnorder);
			Campaign().set('turnorder',turnorder);

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
	 var doRemoveFromTracker = function(args) {

		if (!args) 
			{return;}

		args = args.split('|');
		
		if (args.length < 2 || args.length > 3) {
            sendDebug('doRemoveFromTracker: Invalid number of arguments');
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
		turnorder = JSON.stringify(turnorder);
		Campaign().set('turnorder',turnorder);

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
	        {return;}
        var newToken, oldToken,
            newToken_id,
		    name, char_id, page_id, charObj,
			oldName, oldChar_id, oldPage_id, oldChar,
		    effectList, oldEffects,
			tokenStatusMarkers, oldStatusMarkers;
			
		_.each(selection,function(e) {
			newToken_id = e.id;
			newToken = getObj('graphic', newToken_id);
			if (!newToken || newToken.get('_subtype') !== 'token' || newToken.get('isdrawing'))
				{return;}
				
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
				if (oldPage_id == page_id)
					{return;}
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
	    args = args.split('|');
	    if (args.length < 5) {
			sendDebug('doTarget: invalid number of arguments');
			sendError('Too few targeting arguments');
			return;
	    }
		
		var command = args[0].toUpperCase(),
			tokenID = args[1],
			curToken = getObj('graphic',tokenID),
			tokenName,
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

		if (playerIsGM(senderId)) {
			doAddTargetStatus(args.join('|'));
		} else {
			doPlayerTargetStatus(args.join('|'),senderId);
		}

		if (command == 'AREA') {
			args.shift();
			content = '&{template:default}{{name=Target Area-Effect Spell}}'
					+ '{{[Select another target](!rounds --target '+command+'|'+tokenID+'|&#64;{target|Select Next Target|token_id}|'+args.join('|')+') or just do something else}}';
			sendResponse( senderId, content );
		}
		return;
	}
	
	/**
	 * Set or clear a playerid as a "viewer" that sees what each token 
	 * in the turn order can see at it gets to the top of the turn order.
	 */
	 
	var doSetViewer = function(args,senderId) {
		if (!args) {
			if (senderId == viewer.pid) {
				state.roundMaster.viewer.is_set = !state.roundMaster.viewer.is_set;
			} else {
				state.roundMaster.viewer.is_set = true;
				state.roundMaster.viewer.pid = senderId;
			}
			sendResponse(senderId,'Viewer turned '+(state.roundMaster.viewer.is_set ? 'on' : 'off'));
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
    			sendResponse(senderId,'Viewer turned '+(state.roundMaster.viewer.is_set ? 'on' : 'off'));
				break;
			case 'echo':
				args[1] = args[1].toLowerCase();
				if (['on','off','all'].includes(args[1])) {
					state.roundMaster.viewer.echo = args[1];
				} else {
					sendResponseError(senderId,'Invalid Viewer echo option');
				}
				break;
			case 'all':
			    state.roundMaster.viewer.priorID = '';
			default:
				let tokenID = args[0],
				    resetView = (state.roundMaster.viewer.tokenID == tokenID || cmd == 'all'),
				    curToken = getObj('graphic',tokenID);
				if ((curToken || cmd == 'all') && state.roundMaster.viewer.is_set) {
					filterObjs( obj => {
						if (obj.get('type') !== 'graphic' || obj.get('subtype') !== 'token') {return false;}
						addRemovePID(obj,state.roundMaster.viewer.pid,(resetView && state.roundMaster.viewer.priorID == ''),false);
					});
					if (!resetView) {
    					addRemovePID(curToken,state.roundMaster.viewer.pid,true,true);
    					state.roundMaster.viewer.priorID = state.roundMaster.viewer.tokenID;
    					state.roundMaster.viewer.tokenID = tokenID;
					} else if (state.roundMaster.viewer.priorID != '') {
    					addRemovePID(getObj('graphic',state.roundMaster.viewer.priorID),state.roundMaster.viewer.pid,true,false);
                        state.roundMaster.viewer.tokenID = state.roundMaster.viewer.priorID;
                        state.roundMaster.viewer.priorID = tokenID;
					}
				} else {
					sendDebug('doSetViewer: invalid argument '+args[0]);
					sendResponseError(senderId,'Invalid Viewer command');
				}
				break;
			}
		}
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
	 * Show help message
	 */ 
	var showHelp = function() {
		var content = 
			'<div style="background-color: #FFF; border: 2px solid #000; box-shadow: rgba(0,0,0,0.4) 3px 3px; border-radius: 0.5em; margin-left: 2px; margin-right: 2px; padding-top: 5px; padding-bottom: 5px;">'
				+ '<div style="font-weight: bold; text-align: center; border-bottom: 2px solid black;">'
					+ '<span style="font-weight: bold; font-size: 125%">RoundMaster v'+version+'</span>'
				+ '</div>'
				+ '<div style="padding-left: 5px; padding-right: 5px; overflow: hidden;">'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --help'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Display this message'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --clearonround [on|off]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Alter behaviour of clearing the turn order at the end of a round.  Default is on.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --clearonclose [on|off]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Alter behaviour on closing the Turn Tracker.  Default is off.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --sortorder [ascending|descending|atoz|ztoa|nosort]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Set the automatic Turn Tracker sort order on starting a new round.  Default is numeric ascending'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --start'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Start/Pause the tracker. If not started starts; if active pauses; if paused, resumes. Behaves as a toggle.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --stop'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Stops the tracker and clears all status effects.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --clear'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Clears the turnorder of token turns, but leaves the Round counter. Does not stop the tracker.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --pause'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Pauses the tracker.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --sort'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Sorts the tracker, using the current sort order.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --reset [round#]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Reset the tracker\'s round counter to the given round, if none is supplied, it is set to round 1.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --addtotracker [name]|[id]|[increment]|[ignore]|[message]|[detail]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Add a new turn to the turn order.  Allows multiple entries for single token or custom item.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>name</b> of the entry. Can be existing or not, and a token or a custom item.'
					+ '</li>'
		        	+ '<li style="padding-left: 20px;">'
						+ '<b>id</b> for a token object (obtained using \'token_id\') or -1 for a custom item.'
					+ '</li>'
		        	+ '<li style="padding-left: 20px;">'
						+ '<b>increment</b> to add to priority if a token or custom tracker entry exists for id or name. Otherwise is set as the new priority.'
					+ '</li>'
			    	+ '<li style="padding-left: 20px;">'
						+ '<b>ignore</b> (optional) the command if this value is not 0.  Allows for conditional processing.'
					+ '</li>'
			    	+ '<li style="padding-left: 20px;">'
						+ '<b>message</b> (optional) to post in the chat window. Results in \'[name]\'s initiative is [final number] [message]\'. Also displayed in turn announcement.'
					+ '</li>'
			    	+ '<li style="padding-left: 20px;">'
						+ '<b>detail</b> (optional) to post after message in chat window. Not displayed in turn announcement.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --removefromtracker [name]|[id]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Removes turns from the turn order.  Removes all entries for single token or custom item.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>name</b> of the entry. Can be a token or a custom item.'
					+ '</li>'
		        	+ '<li style="padding-left: 20px;">'
						+ '<b>id</b> for a token object (obtained using \'token_id\') or -1 for a custom item.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --addstatus [name]|[duration]|[direction]|[message]|[marker]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Add a status to the group of selected tokens, if it does not have the named status.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>name</b> name of the status.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>duration</b> duration of the status (numeric).'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>direction</b> + or - direction (+# or -#) indicating the increase or decrease of the the status\' duration when the token\'s turn comes up.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>message</b> optional description of the status. If dice text, ie: 1d4 exist, it\'ll roll this result when the token\'s turn comes up.'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>marker</b> optional name of marker to be used, as given in the table statusMarkers'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --addtargetstatus [id]|[name]|[duration]|[direction]|[message]|[marker]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Add a status to the token with the given id, if it does not have the named status.  All other parameters are as for -addstatus'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>id</b> the token_id of the token to add the status to.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --target [CASTER]|[id]|[name]|[duration]|[direction]|[message]|[marker]<br>'
						+ '!rounds --target [SINGLE|AREA]|[id]|[targetid]|[name]|[duration]|[direction]|[message]|[marker]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Add a status to the token with the given id, if it does not have the named status.  All other parameters are as for -addstatus'
					+ '</li>'
					+ '<li style="padding-left: 20px;">'
						+ '<b>id</b> the token_id of the token to add the status to.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --removestatus [name],[name],[name],...'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Remove a status or statuses from a group of selected tokens given the name(s).'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!rounds --edit'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Edit statuses on the selected tokens'
					+ '</li>'
					+ '<br>' 
					+ '<div style="font-weight: bold;">'
						+ '!rounds --moveStatus'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Move statuses from other tokens with same name representing the same character to the selected tokens.  Supports tokens with live status effects moving between different maps'
					+ '</li>'
					+ '<br>' 
					+ '<div style="font-weight: bold;">'
						+ '!rounds --addfav [name]|[duration]|[direction]|[message]'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Add a favorite status for quick application to selected tokens later.'
					+ '</li>'
					+ '<br>' 
					+ '<div style="font-weight: bold;">'
						+ '!rounds --listfavs'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Displays favorite statuses with options to apply or edit.'
					+ '</li>'
					+ '<br>'
					+ '<div style="font-weight: bold;">'
						+ '!eot'
					+ '</div>'
					+ '<li style="padding-left: 10px;">'
						+ 'Ends a player\'s turn and advances the tracker if the player has control of the current turn\'s token. Player usable command.'
					+ '</li>'
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
	var sendAPImacro = function(curToken,msg,effect,macro) {

		if (!curToken || !macro || !effect) {
			sendDebug('sendAPImacro: a parameter is null');
			return;
		}
		var journal,
		    tid = curToken.id,
		    tname = curToken.get('name'),
		    cid = curToken.get('represents'),
		    words,
			effectsLib = state.roundMaster.effectsLib;
			
		sendDebug( 'msg is ' + msg );
			
		if (msg.length && msg.length > 0) {
		    words = msg.split(' ');
            if (words.length && words.length > 1 && words[0].toLowerCase() === 'effect')
                    {effect = words[1];}
		}
        journal = getObj( 'character', cid );
		if (effectsLib && journal) {
			var cname = journal.get('name'),
			    ac = curToken.get('bar1_value'),
			    thac0 = curToken.get('bar2_value'),
			    hp = curToken.get('bar3_value'),
				effectMacro = findObjs({ _type : 'ability' , characterid : effectsLib.id, name :  effect + macro }, {caseInsensitive: true});
			if (!effectMacro || effectMacro.length === 0) {
			    sendDebug('Not found effectMacro ' + effectsLib.get('name') + '|' + effect + macro);
			}
			if (!cname) {
				cname = curToken.get('name');
			}
			if (effectMacro.length > 0) {
				var macroBody = effectMacro[0].get('action');

				macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname );
				macroBody = macroBody.replace( /\^\^tname\^\^/gi , tname );
				macroBody = macroBody.replace( /\^\^cid\^\^/gi , cid );
				macroBody = macroBody.replace( /\^\^tid\^\^/gi , tid );
				macroBody = macroBody.replace( /\^\^bar1_current\^\^/gi , ac );
				macroBody = macroBody.replace( /\^\^bar2_current\^\^/gi , thac0 );
				macroBody = macroBody.replace( /\^\^bar3_current\^\^/gi , hp );
        		sendDebug('sendAPImacro: macroBody is ' + macroBody );
		        sendChat("character|"+cid,macroBody,null,{noarchive:!flags.archive, use3d:false});
				
			}
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
	    if (!!args) {
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
			selected = msg.selected;
			
    	if (msg.type === 'api' && args.indexOf('!eot') === 0) {
/**
		    if (_.isUndefined(senderId)) {
                if (_.isUndefined(senderId = findTheGM())) {
                    return;
                }
		    }
**/
    		doPlayerAdvanceTurn(senderId);
    		return;

		// RED: v3.000 allow roundNaster to still be called by the legacy !tj RoundMaster API call
    	} else if (args.indexOf('!rounds') !== 0 && args.indexOf('!tj') !== 0)
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
			}
		} else {
			sendDebug('senderId is defined as ' + getObj('player',senderId).get('_displayname'));
		}
		
		_.each(args, function(e) {
			var arg = e;
			sendDebug('Processing arg: '+arg);


			// RED: v1.213 If in debugging mode, allow debugger to execute GM
			// type commands
    		if (msg.type === 'api'
    		&& (playerIsGM(senderId) || state.roundMaster.debug === senderId)) {
    			if (arg.indexOf('start') === 0) {
    				doStartTracker();
    			} else if (arg.indexOf('stop') === 0) {
    				doStopTracker();
    			} else if (arg.indexOf('pause') === 0) {
    				doPauseTracker();
    			} else if (arg.indexOf('reset') === 0) {
    				arg = arg.replace('reset','').trim();
    				doResetTurnorder(arg);
    			} else if (arg.indexOf('addstatus') === 0) {
    				arg = arg.replace('addstatus','').trim();
    				doAddStatus(arg,selected);
    			} else if (arg.indexOf('addtargetstatus') === 0) {
    				// RED: v1.204 Added --addtargetstatus so that spells can be 
    				// cast by players on other player's tokens and on monsters
    				arg = arg.replace('addtargetstatus','').trim();
    				doAddTargetStatus(arg);
    			} else if (arg.indexOf('target') === 0) {
    				arg = arg.replace('target','').trim();
    				doTarget(arg,senderId);
    			} else if (arg.indexOf('removestatus') === 0) {
    				arg = arg.replace('removestatus','').trim();
    				doRemoveStatus(arg,selected,true);
    			} else if (arg.indexOf('deletestatus') === 0) {
    				arg = arg.replace('deletestatus','').trim();
    				doRemoveStatus(arg,selected,false);
    			} else if (arg.indexOf('deltargetstatus') === 0) {
    				arg = arg.replace('deltargetstatus','').trim();
    				doDelTargetStatus(arg,false);
    			} else if (arg.indexOf('s_marker') === 0) {
    				doShowMarkers();   
    			} else if (arg.indexOf('dispmarker') === 0) {
    				arg = arg.replace('dispmarker','').trim();
    				doDisplayMarkers(arg);	 
    			} else if (arg.indexOf('marker') === 0) {
    				arg = arg.replace('marker','').trim();
    				doDirectMarkerApply(arg);	 
    			} else if (arg.indexOf('disptokenconfig') === 0) {
    				arg = arg.replace('disptokenconfig','').trim();
    				doDisplayTokenConfig(arg); 	
    			} else if (arg.indexOf('dispstatusconfig') === 0) {
    				// dirty fix
    				arg = arg.replace('dispstatusconfig','');
    				doDisplayStatusConfig(arg); 	
    			} else if (arg.indexOf('listfav') === 0) {
    				doDisplayFavConfig(); 	
    			} else if (arg.indexOf('dispmultistatusconfig') === 0) {
    				arg = arg.replace('dispmultistatusconfig','').trim();
    				doDisplayMultiStatusConfig(arg); 	
    			} else if (arg.indexOf('edit_status') === 0) {
    				arg = arg.replace('edit_status','').trim();
    				doEditStatus(arg); 	
    			} else if (arg.indexOf('edit_multi_status') === 0) {
    				arg = arg.replace('edit_multi_status','').trim();
    				doEditMultiStatus(arg); 	
    			} else if (arg.indexOf('edit') === 0) {
    				arg = arg.replace('edit','').trim();
    				doMultiEditTokenStatus(selected);
    			} else if (arg.indexOf('moveStatus') === 0) {
    			    arg = arg.replace('moveStatus','').trim();
    			    doMoveStatus(selected);
    			} else if (arg.indexOf('addfav') === 0) {
    				arg = arg.replace('addfav','').trim();
    				doAddFavorite(arg); 
    			} else if (arg.indexOf('applyfav') === 0) {
    				arg = arg.replace('applyfav','').trim();
    				doApplyFavorite(arg,selected); 
    			}  else if (arg.indexOf('relay') === 0) {
    				arg = arg.replace('relay','').trim(); 
    				doRelay(arg,senderId); 
    			} else if (arg.indexOf('clearonround')===0) {
    				// RED: v1.201 added ability to set flags via commands
    				arg = arg.replace('clearonround','').trim();
    				doSetClearOnRound(arg); 
    			} else if (arg.indexOf('clearonclose') === 0) {
    				// RED: v1.201 added ability to set flags via commands
    				arg = arg.replace('clearonclose','').trim();
    				doSetClearOnClose(arg); 
    			} else if (arg.indexOf('sortorder') === 0) {
    				// RED: v1.201 added ability to set flags via commands
    				arg = arg.replace('sortorder','').trim();
    				doSetSort(arg); 
    			} else if (arg.indexOf('addtotracker') === 0) {
    				// RED: v1.201 Added the ability to add additional lines
    				// into the turn tracker
    				arg = arg.replace('addtotracker','').trim();
    				doAddToTracker(arg,senderId);
    			} else if (arg.indexOf('removefromtracker') === 0) {
    				// RED: v1.202 Added the removeFromTracker function to allow the DM
    				// RED: to clean up the turn order if needed
    				arg = arg.replace('removefromtracker','').trim();
    				doRemoveFromTracker(arg);
    			} else if (arg.indexOf('sort') === 0) {
    				// RED: v1.202 Added the ability to re-sort the turnorder after
    				// the start of the round, & reset the round to start
    				doSort();
    			} else if (arg.indexOf('help') === 0) {
    				showHelp(); 
    			} else if (arg.indexOf('clear') === 0) {
    				// RED: v1.202 moved -clear to down the bottom so parameter set
    				// commands would be found first
    				doClearTurnorder();
    			} else if (arg.indexOf('clean') === 0) {
    				// RED: v1.208 unknown conditions may be corrupting the token 'statusmarkers'
    				// string, leaving stranded markers. This should clean them.
    				doCleanTokens(selected);
    			} else if (arg.indexOf('viewer') === 0) {
					// RED: v3.011 allow a player to be set as a "viewer" that will see what the 
					// token at the top of the turn order sees
    				arg = arg.replace('viewer','').trim();
    				doSetViewer(arg,senderId);
    			} else if (arg.indexOf('debug') === 0) {
    				// RED: v1.207 allow anyone to set debug and who to send debug messages to
    				arg = arg.replace('debug','').trim();
    				doSetDebug(arg,senderId);
    			} else {
    			    sendFeedback('<span style="color: red;">Invalid command " <b>'+msg.content+'</b> "</span>');
    				showHelp(); 
    			}
    		} else if (msg.type === 'api') {
                if (arg.indexOf('addstatus') === 0) {
    				arg = arg.replace('addstatus','').trim();
    				doPlayerAddStatus(arg,selected,senderId); 	
    			} else if (arg.indexOf('addtargetstatus') === 0) {
    				// RED: v1.204 Added --addtargetstatus so that spells can be 
    				// cast by players on other player's tokens and on monsters
    				// If player calls, DM is given option to refuse.
    				arg = arg.replace('addtargetstatus','').trim();
    				doPlayerTargetStatus(arg, senderId);
    			} else if (arg.indexOf('target') === 0) {
    				arg = arg.replace('target','').trim();
    				doTarget(arg,senderId);
    			} else if (arg.indexOf('removestatus') === 0) {
    				// RED: v1.210 allow players to remove statuses e.g. when
    				// spell durations end (mostly via macros)
    				arg = arg.replace('removestatus','').trim();
    				doRemoveStatus(arg,selected,true);
    			} else if (arg.indexOf('deletestatus') === 0) {
    				arg = arg.replace('deletestatus','').trim();
    				doRemoveStatus(arg,selected,false);
    			} else if (arg.indexOf('deltargetstatus') === 0) {
    				arg = arg.replace('deltargetstatus','').trim();
    				doDelTargetStatus(arg,false);
    			}  else if (arg.indexOf('relay') === 0) {
    				arg = arg.replace('relay','').trim(); 
    				doRelay(arg,senderId); 
    			} else if (arg.indexOf('addtotracker') === 0) {
    				// RED: v1.190 allow players access to addToTracker to allow adding 
    				// RED: multiple entries for 3/2, 2, ... attacks per round etc
    				arg = arg.replace('addtotracker','').trim();
    				doAddToTracker(arg,senderId);
    			} else if (arg.indexOf('removefromtracker') === 0) {
    				// RED: v1.203 allow players access to removeFromTracker to 
    				// assist clean initiative selection
    				arg = arg.replace('removefromtracker','').trim();
    				doRemoveFromTracker(arg);
    			} else if (arg.indexOf('viewer') === 0) {
					// RED: v3.011 allow a player to be set as a "viewer" that will see what the 
					// token at the top of the turn order sees
    				arg = arg.replace('viewer','').trim();
    				doSetViewer(arg,senderId);
    			} else if (arg.indexOf('debug') === 0) {
                    // RED: v1.207 allow anyone to set debug and who to send debug messages to
    				arg = arg.replace('debug','').trim();
    				doSetDebug(arg,senderId);
    			}
    		}
    	});
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
				doStopTracker();
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
		
		if (prev['name'].length > 0 && obj.get('_subtype') == 'token' && !obj.get('isdrawing')) {
		    doPushStatus( obj.id, prev['name'], ((prev['represents'] && prev['represents'].length>0) ? prev['represents'] : obj.get('represents')) );
		}
			
		if (obj.get('_pageid') == Campaign().get('playerpageid')) {
			var tokens = [];
			tokens[0] = obj;
			doMoveStatus( tokens );
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
			effectsLib = state.roundMaster.effectsLib,
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
				if (effectsLib) {
					// If the Effects library exists, run any effect-end macro on this character
					// Can't call sendAPImacro as obj no longer exists in Campaign
					charCS = getObj( 'character', oldRepresents );
					if (charCS) {
						var cname = charCS.get('name'),
							ac = obj.get('bar1_value'),
							thac0 = obj.get('bar2_value'),
							hp = obj.get('bar3_value'),
							effectMacro = findObjs({ _type : 'ability' , characterid : effectsLib.id, name :  e.name + '-end' }, {caseInsensitive: true});
						if (!effectMacro || effectMacro.length === 0) {
							log('handleDestroyToken: Not found effectMacro ' + effectsLib.get('name') + '|' + e.name + '-end');
							sendDebug('handleDestroyToken: Not found effectMacro ' + effectsLib.get('name') + '|' + e.name + '-end');
							return;
						}
						if (!cname) {
							cname = oldName;
						}
						if (effectMacro.length > 0) {
							var macroBody = effectMacro[0].get('action');

							macroBody = macroBody.replace( /\^\^cname\^\^/gi , cname );
							macroBody = macroBody.replace( /\^\^tname\^\^/gi , oldName );
							macroBody = macroBody.replace( /\^\^cid\^\^/gi , oldRepresents );
							macroBody = macroBody.replace( /\^\^tid\^\^/gi , oldID );
							macroBody = macroBody.replace( /\^\^bar1_current\^\^/gi , ac );
							macroBody = macroBody.replace( /\^\^bar2_current\^\^/gi , thac0 );
							macroBody = macroBody.replace( /\^\^bar3_current\^\^/gi , hp );
							sendDebug('handleDestroyToken: macroBody is ' + macroBody );
							sendChat("character|"+oldRepresents,macroBody,null,{noarchive:!flags.archive, use3d:false});
							
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
		
		log('handleTokenDeath: checking statusmarker change for death');
		if (obj.get("status_dead")) {
			log('handleTokenDeath: '+obj.get('name')+' has died');
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