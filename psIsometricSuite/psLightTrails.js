// Gist:  https://gist.github.com/plexsoup/64852540504101b520b25f7c3fa84e5f
// By:       Plexsoup - copied from Mark by The Aaron. With help from Scott C, Stephen L and Tritlo
// Thanks: Testers and Feedback: al e., DM Robzer, Vince, Pat S, Gold, Anthony,  Kryx, Sudain
// Contact:  https://app.roll20.net/users/258125/plexsoup

// Roll20 API Script to leave a breadcrumb trail of torches. Based on "Mark" from The Aaron //


/*


               ooooo         o8o             oooo            .   
               `888'         `"'             `888          .o8   
                888         oooo   .oooooooo  888 .oo.   .o888oo 
                888         `888  888' `88b   888P"Y88b    888   
                888          888  888   888   888   888    888   
                888       o  888  `88bod8P'   888   888    888 . 
               o888ooooood8 o888o `8oooooo.  o888o o888o   "888" 
                                  d"     YD                      
                                  "Y88888P'                      
                                                                 
          .oooooo.                                           .o8       
         d8P'  `Y8b                                         "888       
        888          oooo d8b oooo  oooo  ooo. .oo.  .oo.    888oooo.  
        888          `888""8P `888  `888  `888P"Y88bP"Y88b   d88' `88b 
        888           888      888   888   888   888   888   888   888 
        `88b    ooo   888      888   888   888   888   888   888   888 
         `Y8bood8P'  d888b     `V88V"V8P' o888o o888o o888o  `Y8bod8P' 
                                                                       
                                                                       
                                                                       
             ooooooooooooo                     o8o  oooo           
             8'   888   `8                     `"'  `888           
                  888      oooo d8b  .oooo.   oooo   888   .oooo.o 
                  888      `888""8P `P  )88b  `888   888  d88(  "8 
                  888       888      .oP"888   888   888  `"Y88b.  
                  888       888     d8(  888   888   888  o.  )88b 
                 o888o     d888b    `Y888""8o o888o o888o 8""888P' 


*/

/* 

Leaves a trail of lit, shared-vision torches behind characters.
Intended to help players see where they've been on maps with dynamic lighting enabled.
Great for dungeon crawls and hex crawls.

*/


/* Major TODO List:

	Working On:
	- testing

	Broken:
	- colors aren't permanent.. if the list of active mappers changes, the aura colors change.
	
	Need:
	- set light_otherplayers for shared-vision mode and unique-vision mode
	- change what's stored in gmnotes. right now it's the parent token_id, but it could be a JSON string with more options.
	- test with a group of 3 or 4
	- implement 1-click installation
	- add more gui buttons: for when a token is selected already. Toggles seem to work well too.
	- reorganize gui
	- test inherited DROP_DISTANCE on maps with different grid settings. It's currently assuming 70 pixels per unit.
	- write a test plan, for bugchecking
	
	Nice To Have:
	- add an option to limit the number of lightcrumbs and reuse the oldest ones
	- offload math to Stephen L's VectorMath and PathMath libraries
	- implement occlusion testing - can you see the last lightcrumb, or is it blocked by a dynamic lighting wall?
		- see Stephen L's "It's a Trap" script
	- consider making the torches burn out over time.
		- see The Aaron's "Torch" script

	Consider:
	- Maybe players shouldn't have access to config options. Check for GM.


	DONE:
	- add option to change the radius of the displayed aura.
	- add option to change the graphic: invisible token would be nice.
	- update register case to drop a lightcrumb right away
	- add dynamic configuration options for the radius and dimness of the light
	- offset the lightcrumbs so they fall 1 unit behind the targetToken, along the vector of [lastMove, currentLocation]
	- set the default offset to 0 and change behaviour such that lightcrumbs drop at lastlocation instead of current.
	- something's wrong with dropping tokens. they're invisible until you change the icon. Fixed: lastmove.split was producing strings, not numbers
	- make an option to use offsets instead of lastlocation (offsets look better, but might penetrate walls)
	- consider an option so each light crumb is only controlled by the player that dropped it.	
	- add a deregister command, to remove a token from the list of activeMappers
	- option to use token's original visual properties to set the lightCrumb's properties.
	- Some tokens don't have owners, but we rely on that for controlleby and getAuraColor... come up with a workaround
	- change aura color for each specific player.
	- modify the reset function, so it only clears the current page and torches from the current token
	- modify handleTokenMove, such that crumbs are dropped based on light settings rather than drop distance
	- modify handleTokenMove or getLightCrumbsFromLayer such that only those owned by the token are considered for purposes of calculating shortest distances.
	- remove one trail should work if you click on a torch instead of a character.
	- set defaults to inherit lighting, unique vision mode with drop distance based on light_radius
	- In Unique vision mode, findNearest Lightcrumb should check the parentToken
	- In Inherited Light Settings mode, drop distance should depend on light radius // this doesn't work for very large radii, unless you also implment occlusion testing
	- add a superClear function to remove the tokens from the GM Layer
	- change Help to handout instead of chat.
	- rewrite the help text -- see if you can make a popout handout
	- when shared-vision is true, all the auras should be the same color
	
	
	NOTES:
	- we use the gmnotes field to store the tokenID of the parent mapper. If you modify the gmnotes, things might break
	- we don't do rigorous error checking, so if you pass values to !LightCrumb through macros or the chat interface, things might break
	
*/


var LightCrumb = LightCrumb || (function LightCrumbTrailMaker() {
	"use strict";

	var debugDEFCON = 5; // 	DEFCON 1 = FUBAR: LOG EVERYTHING. DEFCON 5 = AOK: LOG NOTHING

	var version = "0.76";
	var lastUpdate = 1486466920154;
	var schemaVersion = "0.76";

	var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
		torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
		transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
		scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
	};

	var LOCATIONS = {
		LAST: 1, // drop lightcrumbs at the token's last known location
		CURRENT: 2 // drop lightcrumbs near the token's current location but offset by some distance along movement path
	};

	var COLORS = ["#ff0000", "#ff9900", "#ffcc66", "#ff3300", "#ff6600", "#cc9900", "#ffff99"];
	
	var defaultConfig = {
		LIGHT_RADIUS: 20,
		DIM_RADIUS: 0,
		DROP_DISTANCE: 25, // in page units. It'll get multiplied by 70pixels later.
		ICON_RELATIVE_SIZE: 0.5, // as compared to a standard token
		IMAGE: ICONS.torch,
		//DROP_BEHAVIOUR: LOCATIONS.LAST,
		DROP_AT_PREVIOUS_LOCATION: true,
		OFFSET: 35,
		SHOW_HELP_ON_READY: 0,
		SHARED_VISION: false,
		SHOW_AURA: true,
		AURA_RADIUS: 1,
		SHOW_NAMES: true,
		INHERIT_CHARACTER_LIGHTING: true,
		SHARED_AURA_COLOR: "#FAF0E6"
	};

	var config = _.clone(defaultConfig); // this'll get updated from state.LightCrumb.config
	
	
		
	var LightCrumbImageURL = ICONS.torch;

	var	activeLightCrumbMappers = []; // so we can register token._id for characters who are set as mappers.

	
	

	
	var whisperSmall = function chatMessageSender(playerName, message) {
		// sends a chat message to a specific player. Can use gm as playerName
		//sendChat(playerName, '/w ' + playerName + " " + message);
		var msgStr = "<div style='font-size: smaller;'>";
		msgStr += message;
		msgStr += "</div>";
		
		sendChat("LightCrumb Script", '/w ' + playerName + " " + msgStr);
	};
	
	
	var whisper = function chatMessageSender(playerName, message) {
		// sends a chat message to a specific player. Can use gm as playerName
		//sendChat(playerName, '/w ' + playerName + " " + message);
		sendChat("LightCrumb Script", '/w ' + playerName + " " + message);
	};

	var ch = function (c) {
	// This function will take a single character and change it to it's equivalent html encoded value.
		// psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	};



/*


	  ooooooo8   ooooo  oooo  ooooo
	o888    88    888    88    888
	888    oooo   888    88    888
	888o    88    888    88    888
	 888ooo888     888oo88    o888o

*/


	var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
		var output="";

			output += '['+title+']('+command+')';

		return output;
	};

	var beautifyButtons = function buttonBeautifier (buttonArray) {
		// take a 2D array, consisting of [[title1, command1], [title2, command2], ... [titleN, commandN]]
			// return pretty html for the buttons to go on the chat window.

		// **** TODO ****

		outputMessage = "";
		return outputMessage;

	};

	var getImgSrcChooserButtons = function ImcSrcChooserForChat (playerName) {
		if (!playerName) { playerName = "gm";}
		var chatMessage = "";
		
		chatMessage += '<div style="text-align: center">';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton('<img width="28px" height="28px" src="'+ICONS.torch+'">', '!LightCrumb-image torch');
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton('<img width="28px" height="28px" src="'+ICONS.transparent+'">', "!LightCrumb-image transparent");
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton('<img width="28px" height="28px" src="'+ICONS.scifi+'">', "!LightCrumb-image scifi");
		chatMessage += 		'</span>';
		chatMessage += '</div>';		
		
		
		return chatMessage;
	};



	var getClickyButtons = function guiMakerForChat (playerName) {
		if (!playerName) { playerName = "gm";}
		var chatMessage = "";
		chatMessage += '<div style="border: 2px solid red; text-align: center; margin: 5px;">';
		chatMessage += '<div style="background-color: OrangeRed"><span><img style="float: left;" width="28px" height="28px" src="'+ICONS.torch+'"></span><span>!LightCrumb</span><span><img style="float:right;" width="28px" height="28px" src="'+ICONS.scifi+'"></span></div>';
		chatMessage += '<div style="text-align: center; background-color: black; color: OldLace;">';
		chatMessage += 		'<span>';
		chatMessage += 			"Mapper: ";
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Add", '!LightCrumb-register '+ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Remove", '!LightCrumb-deregister '+ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
		chatMessage += 		'</span>';

		chatMessage += '</div><div style="text-align: center; background-color: black; color: OldLace;">';		
		
		chatMessage += 			'<span>';
		chatMessage += 				"Remove Trail: ";
		chatMessage += 			'</span>';

		chatMessage += 			'<span>';
		chatMessage += 				makeButton("One", "!LightCrumb-clear " +ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
		chatMessage += 			'</span>';

		chatMessage += 			'<span>';
		chatMessage += 				makeButton("All", "!LightCrumb-clear all");
		chatMessage += 			'</span>';

		chatMessage += '</div><div style="text-align: center; background-color: black;">';		
		
		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Clear Mappers", "!LightCrumb-deregister all");
		chatMessage += 		'</span>';
		
/*		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Drop", "!LightCrumb-drop " +ch('@') +ch('{') + 'target' + ch('|') + 'token_id' + ch('}') );
		chatMessage += 		'</span>';
*/


		chatMessage += 			'<span>';
		chatMessage += 				makeButton("Destroy Crumbs", "!LightCrumb-destroy all");
		chatMessage += 			'</span>';
		
		chatMessage += '</div><div style="text-align: center; background-color: black;">';		

		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Status", "!LightCrumb-status");
		chatMessage += 		'</span>';
		
		chatMessage += 		'<span>';
		chatMessage += 		makeButton("Config", "!LightCrumb-gui getLightConfig");
		chatMessage += 		'</span>';

		
		chatMessage += '</div>';

		chatMessage += showDetailedHelp(playerName);
		
		chatMessage += "</div>";
		
		whisper(playerName, chatMessage);
		
	};

	
	var getLightConfigButtons = function lightConfigForChat (playerName) {
		if (!playerName) { playerName = "gm";}

		var gridUnits = getObj("page", getCurrentPage("gm")).get("scale_units"); // **** What if the gm is on a different page than the players, but a player invoked lightcrumb?
		var chatMessage = "";
		
		chatMessage += '<div style="border: 2px solid red; text-align: center; margin: 5px;">';
		chatMessage += '<div style="background-color: OrangeRed"><span><img style="float: left;" width="28px" height="28px" src="'+ICONS.torch+'"></span><span>!LightCrumb-config</span><span><img style="float:right;" width="28px" height="28px" src="'+ICONS.scifi+'"></span></div>';
		chatMessage += '<div style="text-align: center; background-color: black;">';

		chatMessage += 		getImgSrcChooserButtons(playerName);
		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Toggle Inherit Light Settings", '!LightCrumb-config INHERIT_CHARACTER_LIGHTING 1');
		chatMessage += 		'</span>';
		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Light Radius", '!LightCrumb-config LIGHT_RADIUS ?'+ch('{')+ 'LIGHT_RADIUS?' +ch('|')+ config.LIGHT_RADIUS +ch('}'));
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Dim Start", '!LightCrumb-config DIM_RADIUS ?'+ch('{')+ 'DIM_RADIUS?' +ch('|')+ config.DIM_RADIUS +ch('}'));
		chatMessage += 		'</span>';
	
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Crumb Seperation", '!LightCrumb-config DROP_DISTANCE ?'+ch('{')+ 'DROP_DISTANCE In ' + gridUnits +ch('|')+ config.DROP_DISTANCE +ch('}'));
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Toggle Drop Location", '!LightCrumb-config DROP_AT_PREVIOUS_LOCATION 1');
		chatMessage += 		'</span>';		

		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Offset Distance", '!LightCrumb-config OFFSET_DISTANCE ?'+ch('{')+ 'OFFSET_DISTANCE In pixels' +ch('|')+ config.OFFSET +ch('}'));
		chatMessage += 		'</span>';

		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Aura Radius", '!LightCrumb-config AURA_RADIUS ?'+ch('{')+ 'AURA_RADIUS in ' + gridUnits + ch('|')+ config.AURA_RADIUS +ch('}'));
		chatMessage += 		'</span>';		
		
		
		/*
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Show Help on Load", '!LightCrumb-config SHOW_HELP_ON_READY ?'+ch('{')+ 'SHOW_HELP_ON_READY: 0 or 1' +ch('|')+ config.SHOW_HELP_ON_READY +ch('}'));
		chatMessage += 		'</span>';
		*/
		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Toggle Shared Vision", '!LightCrumb-config SHARED_VISION 1');
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Toggle Aura", '!LightCrumb-config SHOW_AURA 1');
		chatMessage += 		'</span>';		
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Toggle Names", '!LightCrumb-config SHOW_NAMES 1');
		chatMessage += 		'</span>';
		chatMessage += 		'<span>';
		chatMessage += 			makeButton("Reload Default Config", '!LightCrumb-config LOAD_DEFAULT 1');
		chatMessage += 		'</span>';		
		
		chatMessage += '</div>';

		// log("===> LightConfigButtons are whispering to playerName: " + playerName);
		whisper(playerName, chatMessage);
	};
	
	
/*


ooooo ooooo            o888
 888   888  ooooooooo8  888 ooooooooo
 888ooo888 888oooooo8   888  888    888
 888   888 888          888  888    888
o888o o888o  88oooo888 o888o 888ooo88
                            o888

*/



	var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
		if (debugDEFCON < 2) { log("entering showDetailedHelp("+playerName+")"); }

		if (!playerName) { playerName = "gm";}



		var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px;"';
		var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
		var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

		var helpText = '';

		helpText += '<div style="font-size: smaller;">';
		helpText += 'LightCrumb is a script to leave lit torches in a trail behind characters.';
		helpText += "This lets them see where they've been on maps with dynamic lighting enabled.";
		helpText += "Useful for hex-crawls and dungeon-crawls.";
		helpText += "</div>";

		helpText += '<div style="font-size: smaller;">';		
		helpText += "To start, enter !LightCrumb in the chat window.";
		helpText += "</div>";
		
		helpText += '<div style="font-size: smaller;">';		
		helpText += "A few configuration options to be aware of: ";
		helpText += "<ul>";
		helpText += 		"<li>Toggle Shared Vision - determines whether players 'see through' only their own trails, or, everyone's trails. Useful if the party splits up and you want everyone to have a different view.</li>";
		helpText += 		"<li>Toggle Inherit Light Settings - determines whether torches emit the same light as their parent token, or if they all use the same values. Useful if someone has poor vision and you want their trails to reflect that.</li>";
		helpText += 		"<li>Min Seperation - sets the distance between automatic torch placement. Measured in whatever units you've set for the page. Usually feet.</li>";
		helpText += 		"<li>Light Radius and Dim Start - same as for characters. Only used when 'inherit light settings' is off. Set Dim Start to 0 if you want the trails to be dimly lit.</li>";
		helpText += 		"<li>Drop Behaviour - Drop crumbs either at each token's current location or previous location. Dropping torches at your current location looks cooler, but it can make it hard to grab your own token afterward. Also, when you use an offset value, torches might appear on the other side of walls, ruining the effect.</li>";
		helpText += 		"<li>Offset Distance - Only used when Drop Behaviour is set to 'current location'. Determines how far behind your token to place the torch. If you use this, set it to a value of 35 or 40 to start.</li>";
		helpText += "</ul>";
		helpText += "</div>";
		

		
		helpText += "<div style='font-size: smaller'>";
		helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
		helpText += 		'<div style='+ exampleStyle +'> !LightCrumb-drop ' + exampleTokenSelect + '</div>';
		helpText += 		'<div style='+ exampleStyle +'> !LightCrumb-register ' + exampleTokenSelect + '</div>';
		helpText += 		'<div style='+ exampleStyle +'> !LightCrumb-deregister ' + exampleTokenSelect + '</div>';		
		helpText += 		'<div style='+ exampleStyle +'> !LightCrumb-clear parentTokenID' + '</div>';
		helpText += 		'<div style=' +exampleStyle+ '> !LightCrumb-gui</div>';

		
		//whisper(playerName, helpText );
		var helpHandouts;
		helpHandouts = findObjs({
			_type: "handout",
			name: "LightCrumb Help"
		});

		var helpHandout = helpHandouts[0];
		//log("helpHandout = " + helpHandout);
		
		if (!helpHandout) { // create it
			helpHandout = createObj('handout', {
				name: 'LightCrumb Help',
				inplayerjournals: 'all'
			});
			helpHandout.set("notes", helpText);

		} else { // it exists, set it's contents to match the latest version of the script
			helpHandout.set("notes", helpText);
		}
		var handoutID = helpHandout.get("_id");

		var chatMessage = "";
		var buttonStyle = "'background-color: OrangeRed;'";
		
		chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
		

		
		// getClickyButtons(playerName);

		if (debugDEFCON < 2) { log("exiting showDetailedHelp. Whispered message to chat. No return value."); }

		
		return(chatMessage);
	};


/*


ooooo                                    o8
 888  oo oooooo  ooooooooo  oooo  oooo o888oo
 888   888   888  888    888 888   888  888
 888   888   888  888    888 888   888  888
o888o o888o o888o 888ooo88    888o88 8o  888o
                 o888

*/


	var handleInput = function inputHandler(msg) {
		// FYI: Expected msg looks like this:
			// content, playerid, selected, type, who
			// where content is: !LightCrumb token_id
			// {"content":"!LightCrumb -K_D89bE8mmN0VEBmdjt","playerid":"-K_D5Ng6YOcQ3VnAEsNh","selected":[{"_id":"-K_D89bE8mmN0VEBmdjt","_type":"graphic"}],"type":"api","who":"plexsoup (GM)"}
			
		if (msg.type == "api" && msg.content.indexOf("!LightCrumb") !== -1 ) {

			var argsFromUser,
				who,
				errors=[],
				// playerPage, // useful for status message where no token is selected
				tokenPage, // used for dropping new lightCrumbs
				LightCrumbMakerSupply,
				token,
				tokenCoords,
				tokenID,
				playerID,
				playerName,
				pageID,
				statusMessage,
				parentTokenID,
				lastPage;


			playerName = msg.who;
			playerID = msg.playerid;
			
			pageID = getCurrentPage(playerID);
			
			if (debugDEFCON < 5) {
				log("PlayerName = " + playerName);
				// log("PlayerID = " + playerID);
				log("msg.content = " + msg.content);
			}

			argsFromUser = msg.content.split(/ +/);
			if (debugDEFCON < 2) {log("handleInput got a message: " + argsFromUser);}

			switch(argsFromUser[0]) {
				case '!LightCrumb-clear':
					// remove all the light-crumbs

					parentTokenID = argsFromUser[1];
					if (parentTokenID == "all") {
							reset(pageID, "all", "soft");
					} else {
						reset(pageID, parentTokenID, "soft");
					}
					
					break;

				case '!LightCrumb-destroy':
					// destroy the LightCrumbs permanently. Nothing left on GM Layer.
					
					parentTokenID = argsFromUser[1];
					if (parentTokenID == "all") {
						reset(pageID, "all", "hard");
					} else {
						reset(pageID, parentTokenID, "hard");
					}
					
					break;
					
				case '!LightCrumb-register':
					if (debugDEFCON < 2) { log("Trying to register a new token"); }
					// Add tokenIDs to the list of tokens registered to produce light-trails automatically
					tokenID = argsFromUser[1];
					registerMapper(tokenID, playerName);
					break;
					
				case '!LightCrumb-deregister':
					if (debugDEFCON < 5 ) { log("==> !LightCrumb-deregister " + argsFromUser[1]); }
					tokenID = argsFromUser[1];
					deregisterMapper(tokenID, playerName);
				
					break;

				case '!LightCrumb-status':
					// print out some variables to get more info and help with debugging

					statusMessage += getLightCrumbStatus(pageID);

					whisper(playerName, statusMessage);

					break;

				case '!LightCrumb-drop': // drop a single LightCrumb torch
						token = getTokenObjectFromID(argsFromUser[1]);
						if (token === undefined) {
							whisper(playerName, "Error: undefined token");
						} else {
							if(debugDEFCON < 5) {
								log("Token ID: " + token.get("_id"));
								log("Page ID: " + token.get("_pageid"));
								log("Coords: [" + token.get("left") + "," + token.get("top") + "]");
							}

							tokenPage = token.get("_pageid");
							tokenCoords = [token.get("left"), token.get("top")];

							var controllingPlayerID = playerID;
							if ( config.SHARED_VISION === true ) {
								controllingPlayerID += ",all";
							}

							var displayName = getDisplayName(token.get("name"));
							
							var customLightCrumbSettings = {
								left: tokenCoords[0],
								top: tokenCoords[1],
								pageid: tokenPage,
								controlledby: controllingPlayerID,
								name: displayName
							};
							
							if (config.INHERIT_CHARACTER_LIGHTING) {
								customLightCrumbSettings[light_radius] = token.get("light_radius");
								customLightCrumbSettings[light_dimradius] = token.get("light_dimradius");
							}
				
							var currentLightCrumb = dropLightCrumb(customLightCrumbSettings, token.get("_id")); //manual drop
							if (debugDEFCON < 4) {log("dropped LightCrumb from !LightCrumb-drop: [" + tokenCoords + "], " + tokenPage);}
						}
					break;
				case '!LightCrumb-gui': // show some clicky buttons in the chat window
						if (debugDEFCON <3) {log("received !LightCrumb-gui: "+argsFromUser);}
						var requestedCommand = argsFromUser[1];
						if (requestedCommand !== undefined) {
							if (requestedCommand == "chooseImage") {
								getImgSrcChooserButtons(playerName);
							} else if (requestedCommand == "getLightConfig" || requestedCommand == "config") {
								getLightConfigButtons(playerName);
							}

						} else {
							getClickyButtons(playerName);
						}

					break;

				case '!LightCrumb-image': // change the appearance of the token that drops
						var requestedIcon = argsFromUser[1];
						if (requestedIcon !== undefined) {
							if (requestedIcon == "torch") {
								config.IMAGE = ICONS.torch;
							} else if (requestedIcon == "transparent") {
								config.IMAGE = ICONS.transparent;
							} else if (requestedIcon == "scifi") {
								config.IMAGE = ICONS.scifi;
							}

							state.LightCrumb.config = _.clone(config);

							var requestedSettings = {imgsrc: config.IMAGE};
							convertCrumbsToNewSettings(pageID, requestedSettings);
						}

					break;

				case '!LightCrumb-config': // set any the configurable values.
						if (debugDEFCON < 4) { log('!LightCrumb-config received: ' + argsFromUser); }
						var requestedParameter = argsFromUser[1];
						var requestedValue = argsFromUser[2];
						var requestedLightCrumbSettings = { layer:"objects" } ;
						var needBatchConversion = false;
						
						if (requestedParameter === undefined || requestedValue === undefined) {
							// abort.. something went wrong
							whisper(playerName, "Error: didn't receive proper values for !LightCrumb-config.");
						} else {
							if (requestedParameter == "LIGHT_RADIUS" ) {
								config.LIGHT_RADIUS = requestedValue;
								requestedLightCrumbSettings.light_radius = requestedValue;
								needBatchConversion = true;
								whisperSmall(playerName, "LIGHT_RADIUS set to: " + config.LIGHT_RADIUS);
							} else if (requestedParameter == "DIM_RADIUS") {
								config.DIM_RADIUS = requestedValue;
								whisperSmall(playerName, "DIM_RADIUS set to: " + config.DIM_RADIUS);
								needBatchConversion = true;
								requestedLightCrumbSettings.light_dimradius = requestedValue;
							} else if (requestedParameter == "DROP_DISTANCE") {
								config.DROP_DISTANCE = requestedValue;
								whisperSmall(playerName, "DROP_DISTANCE set to: " + config.DROP_DISTANCE);
							} else if (requestedParameter == "OFFSET_DISTANCE") {
								config.OFFSET = requestedValue;
								whisperSmall(playerName, "OFFSET set to: " + config.OFFSET);
							} else if (requestedParameter == "SHOW_HELP_ON_READY") {
								config.SHOW_HELP_ON_READY = requestedValue;
								whisperSmall(playerName, "SHOW_HELP_ON_READY set to: " + config.SHOW_HELP_ON_READY);
							} else if (requestedParameter == "DROP_AT_PREVIOUS_LOCATION") {
								config.DROP_AT_PREVIOUS_LOCATION = !config.DROP_AT_PREVIOUS_LOCATION;
								whisperSmall(playerName, "DROP_AT_PREVIOUS_LOCATION set to: " + config.DROP_AT_PREVIOUS_LOCATION);
							} else if (requestedParameter == "SHARED_VISION") {
								config.SHARED_VISION = !config.SHARED_VISION; // toggle
								whisperSmall(playerName, "Shared Vision set to " + config.SHARED_VISION);
								needBatchConversion = true;
							} else if (requestedParameter == "SHOW_AURA") {
								config.SHOW_AURA = !config.SHOW_AURA; // toggle true false
								// whisper(playerName, "SHOW_AURA set to " + config.SHOW_AURA);
								requestedLightCrumbSettings.showplayers_aura1 = config.SHOW_AURA;
								if (config.SHOW_AURA === false) {
									requestedLightCrumbSettings.aura1_radius = "";
								} else {
									requestedLightCrumbSettings.aura1_radius = config.AURA_RADIUS;
								}
								needBatchConversion = true;
								
							} else if (requestedParameter == "AURA_RADIUS") {
								config.AURA_RADIUS = requestedValue;
								needBatchConversion = true;
								whisperSmall(playerName, "AURA_RADIUS set to " + config.AURA_RADIUS);							
							} else if (requestedParameter == "SHOW_NAMES") {
								config.SHOW_NAMES = !config.SHOW_NAMES; // toggle true false
								requestedLightCrumbSettings.showname = config.SHOW_NAMES;
								requestedLightCrumbSettings.showplayers_name = config.SHOW_NAMES;
								needBatchConversion = true;
								// whisper(playerName, "SHOW_NAMES set to " + config.SHOW_NAMES);
							} else if (requestedParameter == "INHERIT_CHARACTER_LIGHTING") {
								config.INHERIT_CHARACTER_LIGHTING = !config.INHERIT_CHARACTER_LIGHTING;
								needBatchConversion = true;
								whisperSmall(playerName, "INHERIT_CHARACTER_LIGHTING set to " + config.INHERIT_CHARACTER_LIGHTING);
							} else if (requestedParameter == "LOAD_DEFAULT") {
								config = _.clone(defaultConfig);
								state.LightCrumb.config = _.clone(defaultConfig);
								requestedLightCrumbSettings = {
									imgsrc: config.IMAGE,
									showname: config.SHOW_NAMES,
									showplayers_name: config.SHOW_NAMES
								};
								
								whisperSmall(playerName, getLightCrumbStatus(pageID) );
								
								if (config.SHOW_AURA === false) {
									requestedLightCrumbSettings.aura1_radius = "";
								} else {
									requestedLightCrumbSettings.aura1_radius = config.AURA_RADIUS;
								}
								
								needBatchConversion = true;
							}
						}

						if( debugDEFCON < 2 ) { log("trying to clone config into state.LightCrumb.config.. here's what I have in config" + config ); }
						
						// **** TODO **** Fix this.. it converts a lot of settings which the user didn't ask for.

						state.LightCrumb.config = _.clone(config);

						if (needBatchConversion) {
							convertCrumbsToNewSettings(pageID, requestedLightCrumbSettings);							
						}

						// still need to go through all the old lightCrumbs and set their token values.

					break;

				case '!LightCrumb-help': // explain script and pop up a few buttons in the chat for player to click on.
					showDetailedHelp(playerName);
					break;
				case '!LightCrumb': // explain script and pop up a few buttons in the chat for player to click on.
					getClickyButtons(playerName);
					break;
			}
		}
	};	
	
	
	
var getLightCrumbStatus = function (pageID) {

	var statusMessage = "";
	statusMessage = "<h4>"+activeLightCrumbMappers.length + " Active Mappers</h4>";

	
	statusMessage += "<ul>";
	var currentMapperName;
	_.each(activeLightCrumbMappers, function loopToListMappers(currentMapperID) {
		statusMessage += "<li>";
		currentMapperName = getObj('graphic', currentMapperID).get("name");
		if (currentMapperName !== "" ) {
			statusMessage += currentMapperName;
		} else {
			statusMessage += currentMapperID;
		}
		statusMessage += "</li>";
	});
	statusMessage += "</ul>";

	statusMessage += "<h4>"+getLightCrumbsFromLayer("objects", pageID).length + " Active LightCrumbs</h4>";
	
	statusMessage += "<h4>Config Options</h4>";

	var configMessage = JSON.stringify(config);
	var prettyConfigMessage = "";

	_.each(configMessage.split(","), function loopToBuildMessage(currentOption) {
		prettyConfigMessage += "<div style='font-size: smaller'>" + currentOption + "</div>";
	});

	statusMessage += prettyConfigMessage;	

	return statusMessage;
};
	
/*

                                          .   
                                        .o8   
oooo d8b  .ooooo.   .oooo.o  .ooooo.  .o888oo 
`888""8P d88' `88b d88(  "8 d88' `88b   888   
 888     888ooo888 `"Y88b.  888ooo888   888   
 888     888    .o o.  )88b 888    .o   888 . 
d888b    `Y8bod8P' 8""888P' `Y8bod8P'   "888" 

*/
	
	

	
	var reset = function resetter(pageID, parentTokenID, resetMode) {
		
		if (resetMode === undefined ) {
			resetMode = "soft";
		}
		
		if (debugDEFCON < 4) { log("entering reset with " + pageID); }
		//state.LightCrumb.count=0;
		
		// test pageID.
		if (!getObj("page", pageID)  ) { // this pageID is not valid.
			log("==> Error: This pageID is not valid: " + pageID);
			return -1;
		} else {
			if (debugDEFCON < 2 ) { log("    in reset: pageID is valid: " + pageID); }
		}
		
		
		if (pageID === undefined) {
			log("==> Error: reset(pageID, parentTokenID, resetMode) didn't receive a pageID");
			pageID = getCurrentPage("gm");	
		}
		
		if (parentTokenID !== "all") {
			// Check to see if you grabbed a torch or a character
			var gmNotesOnToken = getObj("graphic", parentTokenID).get("gmnotes");
			if (getObj("graphic", gmNotesOnToken) ) { // for some reason the gmnotes contains the _id of a token... maybe it's a torch
				var foundInActiveList = activeLightCrumbMappers.indexOf(gmNotesOnToken);
				parentTokenID = gmNotesOnToken;
			}		
			whisperSmall("gm", "Removing trail belonging to " + getObj("graphic", parentTokenID).get("name"));
		}


		
		_.each(ICONS, function loopToGrabAllTheTorchIcons(imageUrl) {

			_.each(findObjs({
					_pageid: pageID,
					_type: 'graphic',
					_subtype: 'token',
					imgsrc: imageUrl,
					
					
				}), function loopToHideLightCrumbs(currentLightCrumbToken){
					
					if ( parentTokenID == currentLightCrumbToken.get("gmnotes") || parentTokenID == "all") {
						if (resetMode == "soft") {
							currentLightCrumbToken.set({ // hide the lightcrumb token, but keep it available for later reuse - saves html lookups
								layer: 'gmlayer',
								width: 70,
								height: 70,
								top: 35,
								left: 35,
								imgsrc: config.IMAGE,
								gmnotes: "",
								aura1_color: "#ffffff",
								name: "LightCrumb"
							});							
						} else { // resetMode == "hard"
							currentLightCrumbToken.remove(); // destroy it!
						}

					}
				}
			);

		});

	};

	var getAuraColor = function auraColorGetter(parentTokenID) {
		if (parentTokenID === undefined || parentTokenID === "" ) {
			// log("==> Error in getAuraColor. No token provided")
			return "#ffffff";
		}
		
		if (config.SHARED_VISION === true) {
			return config.SHARED_AURA_COLOR;
		}
	
		// log("entering getAuraColor with " + parentTokenID);
		var colors = ["#ff0000", "#ff9900", "#ffcc66", "#ff3300", "#ff6600", "#cc9900", "#ffff99"];
		var mappers = activeLightCrumbMappers;
		// log("activeLightCrumbMappers = " + JSON.stringify(activeLightCrumbMappers) );
		
		var mapperNum;	
		var counter = 0;
		var color;
		
		mapperNum = mappers.indexOf(parentTokenID);
		// log("mapperNum: " + mapperNum);
		
		if (mapperNum !== -1) {
			var colorNum = mapperNum % colors.length;
			// log("colorNum = " + colorNum);
			color = colors[ colorNum ]; // cycle through colors in array with modulo operator		
		} else {
			color = "#ffffff";
		}

		// log("exiting getAuraColor with " + color);
		// log("token: " + parentTokenID + ", called: " + getObj("graphic", parentTokenID).get("name") + " has color: " + color);
		return color;
	};
	
	
/*

                                                                   .   
                                                                 .o8   
 .ooooo.   .ooooo.  ooo. .oo.   oooo    ooo  .ooooo.  oooo d8b .o888oo 
d88' `"Y8 d88' `88b `888P"Y88b   `88.  .8'  d88' `88b `888""8P   888   
888       888   888  888   888    `88..8'   888ooo888  888       888   
888   .o8 888   888  888   888     `888'    888    .o  888       888 . 
`Y8bod8P' `Y8bod8P' o888o o888o     `8'     `Y8bod8P' d888b      "888" 
*/
	
	var convertCrumbsToNewSettings = function crumbsResetter(pageID, requestedOptions) {
		
		if (requestedOptions === undefined) {
			requestedOptions = {light_otherplayers: config.SHARED_VISION};			
		}
		
		if (debugDEFCON < 5) {log("entering convertCrumbsToNewSettings with " + JSON.stringify(requestedOptions) ); }

		if (pageID === undefined ) {
			log("==> Error: convertCrumbsToNewSettings didn't receive a pageID");
			pageID = getCurrentPage("gm");
		}
		
		if (!requestedOptions || requestedOptions.size === 0 ) { // figure out what needs resetting, exactly.
			log("==> didn't see any options for the conversion.. what's up?");			
		}
		
		
		_.each(ICONS, function(imageUrl) { // note: this won't find anything where the user passed their own url to !LightCrumb-image
			if (debugDEFCON < 4) {log("checking for: " + imageUrl);}
			_.each(findObjs({
					_pageid: pageID,
					_type: 'graphic',
					_subtype: 'token',
					imgsrc: imageUrl
				}), function convertCrumbToNewSettings(currentCrumb){ // do this stuff once for every torch icon
					if (debugDEFCON < 2 ) { log("converting lightcrumb token: " + currentCrumb.get("_id")); }
					
					// figure out who owns it.
					
					var currentCrumbID = currentCrumb.get("_id");
					if (debugDEFCON < 4) { log("currentCrumbID = " + currentCrumbID); }
					var parentTokenID = getParentTokenID(currentCrumbID);
					if (debugDEFCON < 4) { log("in convertCrumbsToNewSettings: parentTokenID = " + parentTokenID); }
					
					// remove "all" from the list of controlling tokens					
					var controlledByArray = currentCrumb.get("controlledby").split(",");
					controlledByArray = _.without(controlledByArray, "all");
					var controlledByString = controlledByArray.join(",");
					if (debugDEFCON < 4) { log("in convertCrumbToNewSettings: controlledByString = " + controlledByString); }
					// then add it back if it's needed.
					if (config.SHARED_VISION === true) { // add "all" to controlledby 
						controlledByString += ",all";
						requestedOptions.light_otherplayers = true;
					} else {
						requestedOptions.light_otherplayers = false;
						if (controlledByString == "") { // looks like a character is set to all players instead of a specific character
							controlledByString = "all";
						}
					}
					
					requestedOptions.controlledby = controlledByString;						
					
					if (config.SHARED_VISION === false) { // modify the aura so it's obvious who can see the torch
						if (controlledByString !== "all") {
							requestedOptions.aura1_color = getAuraColor(currentCrumb.get("gmnotes"));							
						} else { // this character is set to be controlled by all players. 
							requestedOptions.aura1_color = config.SHARED_AURA_COLOR;
							
						}
					} else {
						requestedOptions.aura1_color = config.SHARED_AURA_COLOR;
					}

					
					if (!_.has(requestedOptions, "showplayers_aura1") ) {
						requestedOptions.showplayers_aura1 = config.SHOW_AURA;
					}
					
					
					if (!_.has(requestedOptions, "aura1_radius") ) {
						if (config.SHOW_AURA === true) {
							requestedOptions.aura1_radius = config.AURA_RADIUS;
						} else {
							requestedOptions.aura1_radius = "";
						}
					}

					
					if(config.INHERIT_CHARACTER_LIGHTING === false ) {
						requestedOptions.light_radius = config.LIGHT_RADIUS;
						requestedOptions.light_dimradius = config.DIM_RADIUS;
												
					} else { // get the correct light radius from the parent token for each lightcrumb
					
						var parentToken = getObj("graphic", parentTokenID);
						if (!parentToken) { 
							log("==> Error. no parent token matching: " + parentTokenID);
							log("here's the list of mappers" + JSON.stringify(activeLightCrumbMappers));
						} else {
							
							requestedOptions.light_radius = parentToken.get("light_radius");
							requestedOptions.light_dimradius = parentToken.get("light_dimradius");							
						}
					}




					
					// **** TODO **** fix this: if a player requests a new image, it shouldn't change all the light_radii.
					if (_.size(requestedOptions) > 0 ) {
						for (var propertyName in requestedOptions) {
							// log("setting property: " + propertyName + ", value: " + requestedOptions[propertyName]);
							currentCrumb.set(propertyName, requestedOptions[propertyName]);
						}
					}
					
			});
		});

		if (debugDEFCON < 5) {log("leaving convertCrumbToNewImage. Nothing to return."); }
	};

	
	


	
	
	
	var getTokenObjectFromID = function tokenConverter(requestedTokenID) {
		var errors = [];
		var targetToken;

		// **** TODO **** What happens if you get/need more than one token id?
		if (debugDEFCON < 5) {
			log("function getTokenObjectsFromIDList(" + requestedTokenID + ")");
		}

		targetToken = getObj('graphic',requestedTokenID);
		if(! targetToken) {
			return undefined;
		} else {
			return targetToken;
		}
	};

	var getParentTokenID = function parentIDGetter(lightCrumbID) {	
		if (debugDEFCON < 4 ) { log("entering getParentTokenID with " + lightCrumbID); }
		
		var lightCrumbObj = getObj("graphic", lightCrumbID );
		if (!lightCrumbObj) {
			log("==> Error: couldn't find object matching id: " + lightCrumbID);
			return -1;
		} else {
			var parentTokenID = lightCrumbObj.get("gmnotes");

			if (debugDEFCON < 4) { log("exiting getParentTokenID: returning " + parentTokenID); }
			
			return parentTokenID;			
		}

	};
	


	
	
	var getLightCrumbsFromLayer = function lightCrumbFinder(layer, pageID) {
		// expects "objects" or "gmlayer" and a valid page_id

		if (!pageID) {
			log("==> Error: getLightCrumbsFromLayer expected a pageID but didn't receive one");
			pageID = getCurrentPage("gm");
		}

		if (debugDEFCON < 5) {
			log("entered getLightCrumbsFromLayer(" + layer + ", " + pageID + ")");
		}
		var LightCrumbMakerSupply;


		LightCrumbMakerSupply = findObjs({
			type: 'graphic',
			subtype: 'token',
			imgsrc: config.IMAGE,
			layer: layer,
			pageid: pageID
		});

		if (debugDEFCON < 5) {
			log("leaving getLightCrumbsFromLayer: returning LightCrumbMakerSupply = " + LightCrumbMakerSupply);
		}
		return(LightCrumbMakerSupply);
	};


	var deregisterMapper = function mapperDeregistrar(tokenID, playerName) {
		if (debugDEFCON < 5) { log("entering deregisterMapper with " + tokenID + "," + playerName );}
		
		if (playerName === undefined || tokenID == "all") { // clear all mappers
			activeLightCrumbMappers = [];
			state.LightCrumb.activeMappers = [];

		} else { // We got a tokenID. Remove it from the list of active mappers
		
			// rearrange the colors list so other mappers can keep their existing color			
			var mapperNum = activeLightCrumbMappers.indexOf(tokenID);
			var mapperColor = COLORS[mapperNum];
			// log("COLORS before: " + COLORS);
			COLORS = _.without(COLORS, mapperColor);
			COLORS.push(mapperColor);
			// log("COLORS after: " + COLORS);
			state.LightCrumb.colors = _.clone(COLORS);
			
			// remove the mapper from the list
			// log("activeLightCrumbMappers before: " + activeLightCrumbMappers);
			activeLightCrumbMappers = _.without(activeLightCrumbMappers, tokenID);
			state.LightCrumb.activeMappers = _.clone(activeLightCrumbMappers);
			// log("activeLightCrumbMappers after: " + activeLightCrumbMappers);
		}
		
		
	};
	
	var registerMapper = function mapperRegistrar(tokenID, playerName) {
		if (debugDEFCON < 2) { log("entered registerMapper with: " + tokenID + ", " + playerName); }
		if (playerName === undefined) { playerName = "gm"; }

		var statusMessage = "";
		var targetToken = getTokenObjectFromID(tokenID);
		var tokenOwner = targetToken.get("controlledby");
		var tokenCoords = [targetToken.get("left"), targetToken.get("top")];
		var tokenName = targetToken.get("name");
		var currentPage = targetToken.get("_pageid");
		if (!tokenName) { tokenName = ""; }

		if ( activeLightCrumbMappers.indexOf(tokenID) == -1 ) { // you're not yet registered
			activeLightCrumbMappers.push(tokenID);
			state.LightCrumb.activeMappers.push(tokenID); // save this in the Roll20 state object so it's persistent between sessions.
			statusMessage = 'Added ' + tokenName + ' to the list of active mappers.';
			statusMessage += '<div style="font-size: smaller; text-align: center;">(ID: '+ tokenID + ')</div>';
			whisper(playerName, statusMessage);
			
			
			/* Removed: not needed because we don't drop a crumb on register anymore
			var controllingPlayerID = tokenOwner;
			if ( config.SHARED_VISION === true ) {
				controllingPlayerID += ",all";
				
			}
			*/
			
			var displayName = getDisplayName(tokenName);

			if (debugDEFCON < 4) {
				log("In registerMapper: added " + tokenID + " to list of Active mappers" + activeLightCrumbMappers);
				log("in registerMapper: dropped LightCrumb: [" + tokenCoords + "], " + currentPage);
			}
		}


	};



	var getOffsetLocation = function offsetLocationGetter(currentLocation, lastLocation) { // expect two points [x,y], [x1,y1]


		var offsetUnitVector = plexUtils.NormalizeVector(currentLocation, lastLocation);
		if (debugDEFCON < 2) {log("offsetUnitVector = " + offsetUnitVector);}
		var offsetScaledVector = plexUtils.ScaleVector(offsetUnitVector, config.OFFSET);
		if (debugDEFCON < 2) {log("offsetScaledVector = " + offsetScaledVector);}
		var offsetLocation = plexUtils.AddVectors([currentLocation, offsetScaledVector]);
		if (debugDEFCON < 2) {log("offsetLocation = " + offsetLocation);}

		if (offsetLocation == []) {
			log("Couldn't find an offset location. Setting it to currentLocation");
			offsetLocation = currentLocation;
		}

		if (debugDEFCON < 2 ) { log("offsetVector = " + offsetUnitVector); }
		if (debugDEFCON < 2 ) { log("offsetLocation = " + offsetLocation); }
		// normalizeVector is expecting two points

		return offsetLocation;


	};


/*


ooooooooo
 888    88o oo oooooo     ooooooo  ooooooooo
 888    888  888    888 888     888 888    888
 888    888  888        888     888 888    888
o888ooo88   o888o         88ooo88   888ooo88
                                   o888

*/


	var dropLightCrumb = function lightCrumbDropper(customLightCrumbSettings, parentToken) { // expects an object with properties matching roll20 graphic objects

		if (debugDEFCON < 5) { log("entered dropLightCrumb with " + JSON.stringify(customLightCrumbSettings)); }

		// **** TODO: go through this list of variables and clear unused ones out

		var LightCrumbMakerSupply,
			currentLightCrumb,
			size,
			auraRadius,
			auraColor,
			showName,
			showPlayersName,
			showPlayersAura1,
			targetLocation,
			offsetLocation,
			lastLocation = [],
			currentPageID;

			
			
		var defaultLightCrumbSettings = {
			imgsrc: config.IMAGE,
			subtype: 'token',
			pageid: getCurrentPage("gm"),
			width: 70 * config.ICON_RELATIVE_SIZE,
			height: 70 * config.ICON_RELATIVE_SIZE,
			left: 70,
			top: 70,
			layer: 'objects',
			light_radius: config.LIGHT_RADIUS,
			light_dimradius: config.DIM_RADIUS,
			light_hassight: true,
			light_otherplayers: true,
			controlledby: "all",
			isdrawing: true,
			name: "Default LightCrumb",
			gmnotes: parentToken
		};

		
		
		for (var propertyName in defaultLightCrumbSettings) { // compare custom settings with default and fill them out where needed.
			if ( customLightCrumbSettings.hasOwnProperty(propertyName) === false ) {
				customLightCrumbSettings[propertyName] = defaultLightCrumbSettings[propertyName];
			}
		}		

		currentPageID = customLightCrumbSettings.pageid;

		LightCrumbMakerSupply = getLightCrumbsFromLayer("gmlayer", currentPageID);
		currentLightCrumb = LightCrumbMakerSupply.pop();

		if(currentLightCrumb) {
			
			if (debugDEFCON < 2) { log("Found existing lightCrumb on GM Layer" + currentLightCrumb); }
			
			currentLightCrumb.set(customLightCrumbSettings);
			// log( "dropped old, salvaged currentLightCrumb: " + JSON.stringify(currentLightCrumb) );			
			
		} else { // no existing lightcrumb found. Make a new one.
			if (debugDEFCON < 5) { log("No existing lightcrumb. About to make one."); }
			currentLightCrumb = createObj('graphic',customLightCrumbSettings);
			
			if (debugDEFCON < 4) {log( "dropped brand new currentLightCrumb: " + JSON.stringify(currentLightCrumb) );}
		}

		if (currentLightCrumb) {
			// **** ! Clean this section up. It's a mess. 
				// Move it into or before the customLightCrumbSettings object gets built.
			if (customLightCrumbSettings.controlledby.indexOf('all')) {
				
				if (config.SHOW_AURA ) {

					if (config.SHARED_VISION === false) {
						auraColor = getAuraColor(currentLightCrumb.get("gmnotes"));
					} else {
						auraColor = config.SHARED_AURA_COLOR;
					}
					currentLightCrumb.set({
						aura1_radius: config.AURA_RADIUS,
						aura1_color: auraColor,
						showplayers_aura1: true
					});
				} else {
					currentLightCrumb.set("showplayers_aura1", false);
				}
				
				if (config.SHOW_NAMES) {
					currentLightCrumb.set({
						// name: "all",
						showname: true,
						showplayers_name: true
					});					
				} else { // hide the name
					currentLightCrumb.set({
						// name: "all",
						showname: false,
						showplayers_name: false
					});					
				}
			} else { // "all" does not appear in the list: controlledby for the token.
				
				if (config.SHOW_NAMES ) {
					currentLightCrumb.set({
						showname: true,
						showplayers_name: true					
					});
				} else { // hide the name
					currentLightCrumb.set({				
						showname: false,
						showplayers_name: false					
					});
				}

				if (config.SHOW_AURA) {
					
					currentLightCrumb.set({
						aura1_radius: config.AURA_RADIUS,
						aura1_color: getAuraColor(currentLightCrumb.get("gmnotes")),
						showplayers_aura1: true
					});					
				} else { // hide the aura
					currentLightCrumb.set({
						showplayers_aura1: false
					});					
				}
				
			}			
			
			
			toBack(currentLightCrumb);
		} else {
			log("==> Something seems wrong. dropLightCrumb Tried to set the Z-order to back, but there was no LightCrumb object to move.");
		}

		if (debugDEFCON < 2) {
			log( "Dropped a LightCrumb with the following properties: " + JSON.stringify(currentLightCrumb) );
			var allLightCrumbsOnPlayerLayer = getLightCrumbsFromLayer("objects", currentPageID);
			log("There are " + allLightCrumbsOnPlayerLayer.length + " known torch tokens on object layer: ");
		}

		if ( debugDEFCON < 5 ) { log("leaving dropLightCrumb. Returning currentLightCrumb." + JSON.stringify(currentLightCrumb)); }
		
		return currentLightCrumb;
		
	};


	var getGameMasterID = function gmIDGetter() {
		if (debugDEFCON < 4) { log("entering getGameMasterID with no parameters"); }
		
		var players = findObjs({
			_type: "player",
		});
		
		var gmID;
		var gmObj;
		var currentPlayerID;
		
		_.each(players, function loopToFindGM(player) { 
			if (debugDEFCON < 4) { log("evaluating player: " + JSON.stringify(player) ); }
			currentPlayerID = player.get("_id");
			if ( playerIsGM(currentPlayerID) ) {
				gmID = currentPlayerID;
				// ??? what happens if there's 2 GMs? We're only delivering up the last one found.
				if (debugDEFCON < 2) {log("found a GM: " + gmID);}
			}
		
		});

		if (debugDEFCON < 4) { log("exiting getGameMasterID. Returning " + gmID); }
		return gmID;
	};
	
	
/*

                                               
ooooooooo     ooooooo     oooooooo8 ooooooooo8 
 888    888   ooooo888  888    88o 888oooooo8  
 888    888 888    888   888oo888o 888         
 888ooo88    88ooo88 8o 888     888  88oooo888 
o888                     888ooo888             

*/	
	
	var getCurrentPage = function currentPageGetter(tokenObjOrPlayerID) { // expects token, playerID, or string=="gm"
	// **** TODO **** This isn't working as expected. Go through it and check assertions.
	
		if ( debugDEFCON < 5) { log( "entering getCurrentPage with " + tokenObjOrPlayerID ); }
		var currentPage;
		var playerID;
		var playerObj;
		var gmID = getGameMasterID();
		if ( debugDEFCON < 5) {
			log("   gmID = " + gmID);
		}

		if (tokenObjOrPlayerID === undefined ) { // getCurrentPage received bad parameters, but we'll take care of it.
			log("==> Error in getCurrentPage. tokenObjOrPlayerID == undefined"); 
			return Campaign().get("playerpageid");
			
		} else if ( tokenObjOrPlayerID == "gm") {
			tokenObjOrPlayerID = gmID;
			if (gmID) {
				// currentPage = getObj("player", gmID).get("lastpage");			
				return Campaign().get("playerpageid");
			} else {
				return Campaign().get("playerpageid");				
			}			
		
			
			
		} else if ( _.isString(tokenObjOrPlayerID) ) { // it's a player ID
			if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was a string. Assume player_id: " + tokenObjOrPlayerID); }
			playerID = tokenObjOrPlayerID;
			playerObj = getObj("player", playerID);
			
			if (playerIsGM(playerID)) { // it's the GM, use the lastpage property to find their page
				if (debugDEFCON < 4) { 
					log("    player_id is a GM");
					log("    playerObj.get('lastpage') returns " + playerObj.get("lastpage") );
					//log("    Campaign().get('playerpageid') returns " + Campaign().get("playerpageid") );
				}
				
				currentPage = playerObj.get("lastpage"); // NOTE: there's no lastpage unless the GM has been on another page
				if (!currentPage) {
					currentPage = Campaign().get("playerpageid");
				}
			} else if ( Campaign().get("playerspecificpages")[playerID] ) {
				if ( debugDEFCON < 4 ) { 
					log("    player_id is not a GM, and the players are seperated onto different pages"); 
					log("    playerspecificpages = " + Campaign().get("playerspecificpages") );
				}
				
				
				// Note: there's no playerspecificpages unless a single player name is dragged onto another map
				currentPage = Campaign().get("playerspecificpages")[playerID];

			} else { // it's a player and the players are all on one page.
				if (debugDEFCON < 4) { log("    player_id is not a GM, but there's only one page"); }
				currentPage = Campaign().get("playerpageid");				
			}
		} else if ( _.isObject(tokenObjOrPlayerID) ) { // it's a token
			if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was an object. Assume token: " + JSON.stringify(tokenObjOrPlayerID) ); }
			var token = tokenObjOrPlayerID;
			currentPage = token.get("page_id");
		}
		
		if (debugDEFCON < 4) { log("exiting getCurrentPage. Returning " + currentPage ); } 
		
		return currentPage;
	};

	var handlePlayerPageChange = function pageChangeHandler() {
		// Nothing to be done. I'm not exactly sure why I have this yet.

		return;
	};

	var getDisplayName = function displayNameGetter(tokenName) {
		var words = tokenName.split(" ");
		var initials= "";
		
		_.each(words, function loopToBuildName(word) {
			initials += word.charAt(0);
		});

		return initials;
	};

	var findShortestDistance = function shortestDistancetoTokenFinder(listOfGraphicObjectsToCompare, referenceLocation, tokenMoved ) {
		
		if (debugDEFCON < 5) { log("entering findShortestDistance with: " + listOfGraphicObjectsToCompare + ", " + referenceLocation + ", " + tokenMoved); }

		var shortestDistance = -1;

		/* 		
		var referenceLocation = [];
		if ( _.isArray(referenceObject) ) { // check isArray first. Arrays pass as objects for underscore.js
			referenceLocation = referenceObject;
		} else if ( _.isObject(referenceObject) ) {
			referenceLocation = [referenceObject.get("left"), referenceObject.get("top")];
		} else { // something's wrong. didn't get object or array for reference object
			log("==> Error in findShortestDistance: received " + referenceObject + " but expected token object or location array");
			return -1;
		} */

		_.each(listOfGraphicObjectsToCompare, function loopToFindClosest(specificObjectToConsider) {
			var targetLocation = [specificObjectToConsider.get("left"), specificObjectToConsider.get("top")];
			var currentDistance = plexUtils.GetDistance(targetLocation, referenceLocation);
			if ( shortestDistance == -1 || currentDistance < shortestDistance ) {
				shortestDistance = currentDistance;
			}

		});

		if (debugDEFCON < 5) { log("leaving findShortestDistance: returning shortestDistance = " + shortestDistance); }
		return shortestDistance;
	};


/*


oooo     oooo
 8888o   888   ooooooo  oooo   oooo ooooooooo8
 88 888o8 88 888     888 888   888 888oooooo8
 88  888  88 888     888  888 888  888
o88o  8  o88o  88ooo88      888      88oooo888


*/

	var getLastLocation = function lastLocationGetter(token) {
		
		if (debugDEFCON < 3) { log("lastmove for " + token.get("name") + ", " + token.get("_id") + " = " + token.get("lastmove") ); }
		var movementPath = token.get("lastmove").split(",");
		
		var lastLocation = [];

		/*
		if (_.isString(movementPath[0]) ) {
			log("might have found your bug. token.get('lastmove').split(',') produces an array of strings. You need to convert them to numbers.");
		} else if (_.isNumber(movementPath[0]) ) {
			log("token.get('lastmove').split(',') seems to produce an array of numbers");
		}
		*/
		
		lastLocation[0] = Number(movementPath[0]); // important to type convert them into numbers
		lastLocation[1] = Number(movementPath[1]);
		
		return lastLocation;
		
	};


	var handleTokenMove = function tokenMoveHandler(tokenMoved) {
		if (debugDEFCON < 4 ) { log("entering handleTokenMoved with: " + tokenMoved); }
		var tokenLocation = [],
			tokenID = tokenMoved.get("_id"),
			tokenPageID = tokenMoved.get("_pageid"),
			tokenPageObj = getObj("page", tokenPageID),
			parentTokenID = tokenMoved.get("_id"),
			tokenName = tokenMoved.get("name"),
			shortestDistanceToExistingCrumb = -1,
			currentLocation,
			lastLocation,
			referenceLocation;

		lastLocation = getLastLocation(tokenMoved);		
		currentLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
		
		
		if (!lastLocation) { // this token hasn't ever moved.. just use the current location.
			lastLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
		}


		if ( config.DROP_AT_PREVIOUS_LOCATION === true ) {
			referenceLocation = lastLocation;
		} else {
			referenceLocation = getOffsetLocation(currentLocation, lastLocation);
		}		
		

		if (activeLightCrumbMappers.indexOf(tokenID) !== -1) { // you're authorized to leave a trail of light.. continue
			if(debugDEFCON < 4) {log("in handleTokenMove. About to get tokenLocation");}
			// tokenLocation = [tokenMoved.get("left"), tokenMoved.get("top")];

			
			// figure out which lightcrumbs you own.
			var crumbsToConsider = getLightCrumbsFromLayer("objects", tokenPageID);
			if (debugDEFCON < 4 ) { log("crumbsToConsider before SHARED_VISION test: " + _.size(crumbsToConsider) ); }
			if ( config.SHARED_VISION === false || config.INHERIT_CHARACTER_LIGHTING === true ) { // filter the list of crumbsToConsider for crumbs owned by the token
				var allCrumbsInConsideration = crumbsToConsider;
				crumbsToConsider = _.filter( allCrumbsInConsideration, function removeOtherPlayersCrumbs(crumbInQuestion) {					
					
					if (crumbInQuestion.get("gmnotes") == tokenID ) { // ownership is designated by the parentToken's ID in the gmnotes field on lightcrumb objects
						return true;
					} else {
						return false;
					}
					
				});
			}
			if (debugDEFCON < 4 ) { log("crumbsToConsider after SHARED_VISION test: " + _.size(crumbsToConsider + ", " + JSON.stringify(crumbsToConsider)) ); }
						
			shortestDistanceToExistingCrumb = findShortestDistance(crumbsToConsider, referenceLocation, tokenMoved);			

			if (debugDEFCON < 4) { log("config.DROP_DISTANCE: " + config.DROP_DISTANCE + ", Current Distance: " + shortestDistanceToExistingCrumb); }

			// figure out how far between crumbs is ok, so you can drop another one.
			var minSeperation = config.DROP_DISTANCE;
			var pixelsPerFoot = 70 / tokenPageObj.get("scale_number");
			
			if (config.INHERIT_CHARACTER_LIGHTING === true) { // use light_radius from parentToken				
				// minSeperation = tokenMoved.get("light_radius") * pixelsPerFoot * 0.75; // **** TODO **** change this to use dynamic grid-size data from page object.
				minSeperation = config.DROP_DISTANCE * pixelsPerFoot;
			} else {
				minSeperation = config.DROP_DISTANCE * pixelsPerFoot;
			}
			
			if ( shortestDistanceToExistingCrumb == -1 || shortestDistanceToExistingCrumb > minSeperation ) {
				if (debugDEFCON < 4) { log("LightCrumb.handleTokenMove: registered token, "+ tokenID +", moved. dropping light token"); }
				
				// var controllingPlayerID = tokenMoved.get("controlledby"); // fails
				
				var activeCharacter = getObj("character", tokenMoved.get("represents"));
				var controllingPlayerID;

				if (activeCharacter !== undefined) {

					var controllingPlayersList = activeCharacter.get("controlledby");					
					var controllingPlayersArray = controllingPlayersList.split(",");
					var actualPlayersArray = _.without(controllingPlayersArray, "all");
					var firstPlayerListed = actualPlayersArray[0];
					controllingPlayerID = firstPlayerListed;
					
					if (controllingPlayerID === undefined) {
						controllingPlayerID = "all";
					}
					// figure out the first one that's not "all players"
					
					
					
				} else { // there's no one assigned to the token
					controllingPlayerID = "all";
					whisper("gm", "Be aware: There's no player assigned to that token. Things might get weird.");
				}
				// **** NOTE: you might have problems if characters have multiple owners
				
				if (debugDEFCON < 4) { log("    in handleTokenMove: controllingPlayerID = " + controllingPlayerID ); }
				if ( config.SHARED_VISION === true ) {
					controllingPlayerID += ",all";
				}
				
				var displayName = getDisplayName(tokenName);

				
				var customLightCrumbSettings = {
					left: referenceLocation[0],
					top: referenceLocation[1],
					pageid: tokenPageID,
					controlledby: controllingPlayerID,
					name: displayName,
					aura1_color: getAuraColor(parentTokenID)
				};
				
				if (config.SHARED_VISION) {
					customLightCrumbSettings.light_otherplayers = true;
				} else {
					customLightCrumbSettings.light_otherplayers = false;
				}
				
				
				if (config.INHERIT_CHARACTER_LIGHTING) {
					customLightCrumbSettings.light_radius = tokenMoved.get("light_radius");
					customLightCrumbSettings.light_dimradius = tokenMoved.get("light_dimradius");
					
				}

				var currentLightCrumb = dropLightCrumb(customLightCrumbSettings, tokenMoved.get("_id")); //movementDrop

				if (debugDEFCON < 4) { log("    in handleTokenMove: dropped LightCrumb [" + lastLocation + "], "+ tokenPageID); }

			}

		}
		if (debugDEFCON < 4) { log("leaving handleTokenMove. Nothing to return."); }
		return;
	};

	
/*

ooooo                          .             oooo  oooo  
`888'                        .o8             `888  `888  
 888  ooo. .oo.    .oooo.o .o888oo  .oooo.    888   888  
 888  `888P"Y88b  d88(  "8   888   `P  )88b   888   888  
 888   888   888  `"Y88b.    888    .oP"888   888   888  
 888   888   888  o.  )88b   888 . d8(  888   888   888  
o888o o888o o888o 8""888P'   "888" `Y888""8o o888o o888o 

*/	
	
	
	
	
    var checkInstall = function () {
		log("/===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-===/");
		log("           Starting LightCrumb Script              ");
		log("         current time is: " + Date.now() + "            ");		
		log("                                                   ");
		log("       To use, enter !LightCrumb in chat.          ");
		log("/===-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-===/");


		// Roll20 allows scripters to store persistent data in their "state" object.
		// We'll use the LightCrumb property in state to store persistent info about this script for each campaign.
		// Notably: who's registered to leave automatic LightCrumb trails.

        if( ! _.has(state,'LightCrumb') ) { // first time running the LightCrumb script for this Roll20 campaign. It needs a state.
			log('-=> LightCrumb v'+version+' <=-  ['+(new Date(lastUpdate))+']');
			state.LightCrumb = {
				version: schemaVersion,
				activeMappers: [],
				colors: COLORS,
				config: config

			};
		} else { // a LightCrumb object already exists in the Roll20 persistent "state" object.

			var lengthOfStateConfig = _.size(state.LightCrumb.config);
			var lengthOfLightCrumbConfig = _.size(config);
			
			if (debugDEFCON < 2) { log("state.LightCrumb.config = " + JSON.stringify(state.LightCrumb.config) ); }
			if (debugDEFCON < 2) { log("config = " + JSON.stringify(config) ); }
			
			if ( state.LightCrumb.version !== schemaVersion || lengthOfLightCrumbConfig !== lengthOfStateConfig ) {
				log("Seems like the script got updated: " + state.LightCrumb.version);
				log("Updating state.LightCrumb.version to reflect current script: "+schemaVersion);

				state.LightCrumb.version = schemaVersion;
				
				/*
				for (var propertyName in config) {
					if (state.LightCrumb.config.hasOwnProperty(propertyName)) {
						log("found property: " + propertyName + ": " + state.LightCrumb.config[propertyName]);
					} else {
						log("missing property: " + propertyName + ": " + config[propertyName]);
						state.LightCrumb.config[propertyName] = config[propertyName];
					}
				}
				*/

				/* Reset to Default Settings for this campaign? */
				state.LightCrumb.config = _.clone(config);
				
			}

			
			if (_.has(state.LightCrumb, 'activeMappers')) {
				activeLightCrumbMappers = _.clone(state.LightCrumb.activeMappers);
			} else {
				state.LightCrumb.activeMappers = _.clone(activeLightCrumbMappers);
			}

			if (_.has(state.LightCrumb, 'config')) {
				config = _.clone(state.LightCrumb.config);
			} else {
				state.LightCrumb.config = _.clone(config);
			}

			if (_.has(state.LightCrumb, 'colors')) {
				COLORS = _.clone(state.LightCrumb.colors);
			} else {
				state.LightCrumb.colors = _.clone(COLORS);
			}


		}
		
		if (_.has(state.LightCrumb.config) && state.LightCrumb.config.SHOW_HELP_ON_READY == 1) {
			LightCrumb.ShowDetailedHelp('gm');
		}
	};

	
/* ---------------------------------------------------------------------------- */
	
						/* --------------------- */
						//	  IN CONSTRUCTION    //
						/* --------------------- */	
	var checkGlobalConfig = function globalConfigChecker() {

		// Set the theme from the useroptions.
		var useroptions = globalconfig && globalconfig.LightCrumb;
		if(useroptions) {
			state.LightCrumb.config.SHOW_HELP_ON_READY = useroptions.SHOW_HELP_ON_READY;
			state.LightCrumb.userOptions = {
				SHOW_HELP_ON_READY: useroptions.SHOW_HELP_ON_READY
			};
		}
	
		
	};
	
/* ---------------------------------------------------------------------------- */

	
	
	
	var registerEventHandlers = function() {
		if (debugDEFCON < 5) {
			log("LightCrumb registered event handlers");
		}
		on('chat:message', handleInput );
		on('change:graphic', handleTokenMove );
	};

	return {
		RegisterEventHandlers: registerEventHandlers,
		CheckInstall: checkInstall,
		Reset: reset,
		ShowDetailedHelp: showDetailedHelp
	};



}());


/*

	ooo        ooooo               .   oooo        .o.
	`88.       .888'             .o8   `888        888
	 888b     d'888   .oooo.   .o888oo  888 .oo.   888
	 8 Y88. .P  888  `P  )88b    888    888P"Y88b  Y8P
	 8  `888'   888   .oP"888    888    888   888  `8'
	 8    Y     888  d8(  888    888 .  888   888  .o.
	o8o        o888o `Y888""8o   "888" o888o o888o Y8P


*/



var plexUtils = plexUtils || (function plexsoupAwesomeMaths() {
	// Another module. This one for fun math. Adding and subtracting vectors, Distance, etc.
	var debugDEFCON = 5; // 5 = AOK: log nothing. 1 = FUBAR: log everything

	var getLongestVectorLength = function longestVectorGetter(vectorList) {
		// **** why is this returning a length of 3 for two dimensional vectors?

		if (debugDEFCON < 2) { log("entering getLongestVectorLength with: " + vectorList); }

		if (vectorList.length == 2) {
			if ( _.isNumber(vectorList[0]) ) {
				log("aborting getLongestVectorLength(" + vectorList + "). I think we got one vector (a single x,y location) instead of a list of vectors.");
				return(2);
			}
		} else {
			if (debugDEFCON<2) {log("vectorList.length = " + vectorList);}
		}

		var longestVectorLength = 0;


		_.each(vectorList, function loopToFindLongest(vector) {
			if (vector.length > longestVectorLength) {
				longestVectorLength = vector.length;
			}
		});

		if (debugDEFCON < 3) {
			log("getLongestVectorLength returning with: " + longestVectorLength);
		}

		return longestVectorLength;

	};

	var initializeVector = function vectorInitialiser(lengthRequired) {
		if (debugDEFCON < 2) { log("initializeVector called with " + lengthRequired); }
		var newVector = [];
		var elementID;
		for(elementID = 0; elementID < lengthRequired; elementID++) {
			newVector.push(0);
		}
		if (debugDEFCON < 2) { log("initializeVector returning with " + newVector); }
		return newVector;
	};

	var addVectors = function vectorAdder(listOfVectors) { // expects a 2d array.. [[point1, point2, ... pointN], ..., [pn1, pn2, ... pnN]]
		// assumes the input vectors are the same length: eg 2 coordinates each: X and Y

		if (listOfVectors.length == 2 ) { // make sure you're adding 2 vectors and not 2 points
			if (_.isNumber(listOfVectors[0])) {
				log("Aborting addVectors(" + listOfVectors + "). I think it contains one vector instead of two or more.");
				return listOfVectors; // bail out.. something went wrong. You got a point instead of 2 vectors
			}
		}

		if ( debugDEFCON < 2 ) { log("addVectors called with: " + listOfVectors); }

		var longestVectorLength = getLongestVectorLength(listOfVectors);
		var sumVector = initializeVector(longestVectorLength);




		var elementID = 0;
		var vectorNumber = 0;
		for(elementID=0; elementID<longestVectorLength; elementID++) {
			for(vectorNumber=0; vectorNumber<listOfVectors.length; vectorNumber++ ) {
				sumVector[elementID] += Number(listOfVectors[vectorNumber][elementID]);

			}
		}

		if (debugDEFCON < 3) {
			log("addVectors returning with: " + sumVector);
		}

		if ( debugDEFCON < 2 ) { log("addVectors returning " + sumVector); }
		return sumVector;

	};

	var scaleVector = function vectorExpander(vector, scalar) {
		if (debugDEFCON < 2) {
			log("scaleVector called with " + vector + ", " + scalar );
		}
		var newVector = _.map(vector, function scaleElement(elementValue) {
			return elementValue * scalar;
		});
		if (debugDEFCON < 2) {
			log("scaleVector returning with " + newVector );
		}
		return newVector;
	};

	var normalizeVector = function vectorNormalizer(point1, point2) { // expecting a list of 2 points [x1,y2], [x2,y2]
		if (debugDEFCON < 2) { log("entering normalizeVector with: " + point1 + ", " + point2); }

		var unitVector;
		var translatedVector = addVectors( [point2, scaleVector(point1, -1)] );

		var distance = getDistance(point1, point2);
		if (distance > 0) {
			unitVector = scaleVector(translatedVector, 1/distance );
		} else { // abort. can't divide by 0. Make something up instead.
			unitVector = translatedVector;
			if ( debugDEFCON<2) {log("trying to normalize a vector where the distance is zero. Can't divide by zero.");}
		}



		if (debugDEFCON < 2) { log("unitVector is: " + unitVector); }

		if (debugDEFCON < 2) { log("leaving normalizeVector with: " + unitVector); }
		return unitVector;

	};

	var getDistance = function distanceGetter(point1, point2) {
		// distance is squareroot of the squared sum of each side
		//if (debugDEFCON < 2) { log("entering getDistance with " + point1 + ", " + point2); }
		var xDist = Math.abs(point2[0] - point1[0]);
		var xDistSquared = Math.pow(xDist, 2);
		var yDist = Math.abs(point2[1] - point1[1]);
		var yDistSquared = Math.pow(yDist, 2);
		var distance = Math.sqrt(xDistSquared + yDistSquared);
		//if (debugDEFCON < 2) { log("returning from getDistance with " + distance); }
		return distance;
	};


	return {
		AddVectors: addVectors,
		ScaleVector: scaleVector,
		GetDistance: getDistance,
		NormalizeVector: normalizeVector

	};


}()); // End of Module: plexUtils



/*

	ooo        ooooo            o8o
	`88.       .888'            `"'
	 888b     d'888   .oooo.   oooo  ooo. .oo.
	 8 Y88. .P  888  `P  )88b  `888  `888P"Y88b
	 8  `888'   888   .oP"888   888   888   888
	 8    Y     888  d8(  888   888   888   888
	o8o        o888o `Y888""8o o888o o888o o888o


*/






on("ready",function(){
	// this stuff happens when the script loads.
	// Note: you have to use Caps to refer to the left side of the function declarations in "return"
	LightCrumb.CheckInstall(); // instantiate all the function expressions
	LightCrumb.RegisterEventHandlers(); // instantiate all the listeners
	
	


});


