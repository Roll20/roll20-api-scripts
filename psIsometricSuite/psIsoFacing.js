// psIsoFacingAndView

// Purpose: provide a directional flashlight which rotates independently of the parent token.
// Also: flip the parent token on the horizontal axis because players can't fliph themselves.
// Designed for side-view tokens on isometric or 8bit maps, but should work for top-down as well.
// Once installed, turn on the yellow status marker for your token to turn on the flashlight.
// turn on the boot (tread) status marker to turn on auto-facing.
// For menu: type !psIsoFacing in chat.


// **** TODO

// BUGS
	// something's weird about the install routine.. sometime's a character doesn't switch direction until the second move.

	

	


var psIsoFacing = psIsoFacing || (function plexsoupIsoFacing() {
	"use strict";
	var debug = false;


	var defaultConfig = {
		scriptIsActive: true,
		whisperErrors: true,
		useTreadStatusForFacing: true, // true: tokens are active when they have a yellow status; false: tokens have to be registered through the gui.
		useYellowStatusForLight: true,
		light_radius: 40,
		light_dimradius: 20,
		light_angle: 90		
	};

	var config = _.clone(defaultConfig);
	
    var info = {
		scriptName: "psIsoFacing",
		version: 0.15,
        authorName: "plexsoup"
    };

	var travellers = {}; // dictionary of objects for side-view tokens actively moving and changing directions. key: tokenID, value: travellerObj
	var flashlights = {}; // dictionary of objects for flashlights (or navi from Legend of Zelda) which follow the characters around and rotate based on vector from tokens lastmove

	var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
		torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
		transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
		scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
	};	
	

	
	
/*

     _/_/_/    _/_/    _/      _/    _/_/_/  _/_/_/_/_/  _/_/_/    _/    _/    _/_/_/  _/_/_/_/_/   
  _/        _/    _/  _/_/    _/  _/            _/      _/    _/  _/    _/  _/            _/        
 _/        _/    _/  _/  _/  _/    _/_/        _/      _/_/_/    _/    _/  _/            _/         
_/        _/    _/  _/    _/_/        _/      _/      _/    _/  _/    _/  _/            _/          
 _/_/_/    _/_/    _/      _/  _/_/_/        _/      _/    _/    _/_/      _/_/_/      _/           

*/	
	


	
	var travellerObj = function travellerClass(tokenID) { // note: roll20 state variable can only store simple properties. No functions
		this.direction = 1; // right is 1, left is -1
		this.tokenID = tokenID;
	};	
	
	var instantiateTravellerMethods = function(traveller) { // note: only operates on a single instance at a time. Call with _.each(travellers) if you need them all.
		
		traveller.changeDirection = function() { 
			traveller.direction *= -1;
			var token = getObj("graphic", traveller.tokenID);
			if (token !== undefined ) {
				token.set("fliph", !token.get("fliph") );
			}
		};
	
		traveller.remove = function() {
		// Note: there's no js mechanism to destroy myself, so we'll assume that chrome will manage memory when the reference is gone.										
			// delete traveller; // take myself out of the dictionary
		};			
	
		
		// note: we store travellerObj's in state, but state can only handle simple objects with simple datatypes: ie: no methods.
		// let's use the prototype property to add methods back to all travellerObj's once we rebuild travellers from state.
		
	};	


	

	var flashlightObj = function flashlightClass(tokenID) { // note: roll20 state variable can only store simple properties. No functions
		this.unitVector = [0,1];
		this.parentID = tokenID;
		this.turnedOn = false;
		this.lightID = "";
		this.deleteMe = false;
		
	};

	var instantiateFlashlightMethods = function(flashlight) { // note: only operates on a single instance at a time. Call with _.each if you need more.
	
		flashlight.changeOrientation = function() {
			
		}; 
		
		/*
		flashlight.turnOff = function() {
			
			var lightGraphic = getObj("graphic", flashlight.lightID);
			if (lightGraphic) {
				
				flashlight.deleteMe = true; // **** TODO **** Needs work.. when are you actually going to do this cleanup?				
				
				lightGraphic.remove();
				
				//mark for deletion and then do cleanup / garbage collection from outside the object.
				//delete flashlights[flashlight.parentID]; // doesn't work from inside the object
				
			}
		};
		*/
		
		// flashlight.remove = flashlight.turnOff;

		flashlight.follow = function() {
			var lightGraphic = getObj("graphic", flashlight.lightID);
			var parentGraphic = getObj("graphic", flashlight.parentID);
			
			if (lightGraphic && parentGraphic) { // error checking in case someone deleted either of those tokens


				// lights don't follow tokens in realtime, they kind of float after them like ghosts.
				// instead of moving them, we're going to destroy the old one and create a new one.
				
				lightGraphic.remove(); // remove the old graphic object
				
				flashlight.lightID = createFlashlightToken(flashlight.parentID);
				var desiredRotation = flashlight.getRotation();
				if (debug) psLog("desiredRotation = " + desiredRotation);

				var newLightGraphic = getObj("graphic" , flashlight.lightID);
				if (newLightGraphic) {
					newLightGraphic.set("rotation", desiredRotation );					
				}

			
			} else {
				psLog("==> Error: flashlight.follow cannot execute because one of the tokens no longer exists.");
				psLog("light token: " + lightGraphic);
				psLog("parent token: " + parentGraphic);
				// reset(); // **** TODO **** This is a little heavy handed, don't you think?
			}

		};
		
		flashlight.getRotation = function() {
			var lightObj = getObj("graphic", flashlight.lightID);
			var parentObj = getObj("graphic", flashlight.parentID);
			var lastMoveStr = parentObj.get("lastmove");
			var rotation = 0; // straight up
			
			if (lastMoveStr !== "") {
				var lastLocationArr = lastMoveStr.split(","); // Note: these are strings.
				if (debug) psLog("lastLocationArr = " + lastLocationArr);
				if (debug) psLog("currentLocation = " + [parentObj.get("left"), parentObj.get("top")]);
				
				var lastLocation = new psPoint( Number(lastLocationArr[0]), Number(lastLocationArr[1]) );
				var point1 = new psPoint(lastLocation.x, lastLocation.y);
				var point2 = new psPoint(parentObj.get("left"), parentObj.get("top"));

				if (debug) psLog("point1 = " + JSON.stringify(point1) + ", point2 = " + JSON.stringify(point2));
				var directionVector = makeVector(point1, point2);
				if (debug) psLog("directionVector == " + JSON.stringify(directionVector), "turquoise");				
				var degrees = vectorToRoll20Rotation(directionVector);
				if (debug) psLog("flashlight.getRotation("+ JSON.stringify(point1) + ", "  + JSON.stringify(point2) + ") says degrees = " + degrees, "LightBlue");
				
				rotation = degrees;
			}
			
			return rotation;
			
		};
	};


	var lightFlashlight = function(tokenID) {
		flashlights[tokenID] = new flashlightObj(tokenID);
		instantiateFlashlightMethods(flashlights[tokenID]);
		flashlights[tokenID].lightID = createFlashlightToken(tokenID);	
		flashlights[tokenID].turnedOn = true;
		return flashlights[tokenID].lightID;
		
		
	};
	
	var extinguishFlashlight = function(tokenID) {
		// this removes the token and removes the flashlightObj from the list of "flashlights"
		
		if (flashlights[tokenID]) {
			var flashlightGraphic = getObj("graphic", flashlights[tokenID].lightID);
			if (flashlightGraphic !== undefined && flashlightGraphic.get("gmnotes").indexOf(tokenID) !== -1 ) {
				flashlightGraphic.remove();
				delete flashlights[tokenID];
			}
		}
	};
	
	var createFlashlightToken = function flashlightTokenCreator(parentTokenID) { // returns tokenID of new flashlight graphic object
		var parentToken = getObj("graphic", parentTokenID);
		var parentTokenName = parentToken.get("name");
		if (debug) psLog("entered createFlashlightToken for "+ parentTokenName + " - " + parentTokenID);

		var token = createObj("graphic", {
			imgsrc: ICONS.transparent,
			light_radius: config.light_radius,
			light_dimradius: config.light_dimradius,
			light_otherplayers: true,
			light_hassight: false,
			light_angle: config.light_angle,
			pageid: parentToken.get("pageid"),
			layer: parentToken.get("layer"),
			left: parentToken.get("left"),
			top: parentToken.get("top"),
			name: "flashlight",
			showname: false,
			aura1_radius: "",
			showplayers_aura1: false,
			width: parentToken.get("width")/4,
			height: parentToken.get("height")/4
			
		});	

		if (token) {
			token.set("gmnotes", parentTokenID);
			if (debug) psLog("createFlashlightToken Just created a token: " + token.get("_id") + " for " + parentTokenName);	
			if (debug) psLog("Flashlight Token: " + token.get("_id") );
		}
		
		if (parentToken === undefined) {
			if (debug) psLog("==> Error in createFlashlightToken. parentTokenID = " + parentTokenID);
		}
		//toBack(token);
		
		var tokenID = token.get("_id");
		if (debug) psLog("leaving createFlashlightToken. Returning " + tokenID);
		return tokenID;
	};
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	
	var whisper = function chatMessageSender(playerName, message) {
		// sends a chat message to a specific player. Can use gm as playerName
		//sendChat(playerName, '/w ' + playerName + " " + message);
		sendChat("psIsoFacing", '/w ' + playerName + " " + message);
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

	var inString = function stringFinder(stringToSearch, textToLookFor) {
		// I use this instead of indexof because I hate type converting indexOf, which produces -1 instead of false.
		
		if (!stringToSearch || !textToLookFor) {
			// log("==> Error: inString() missing params" + stringToSearch + ", " + textToLookFor);
			return undefined;
		}
		if ( stringToSearch.indexOf(textToLookFor) == -1 ) {
			return false;
		} else {
			return true;
		}
	};
	
	var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
		var output="";

			output += '['+title+']('+command+')';

		return output;
	};	

	var psLog = function ErrorLogger(message, backgroundColor) {
		if (!backgroundColor) { 
			backgroundColor = "Gainsboro"; 
		}
		var simpleOutputStr = info.scriptName + ": " + message;
		log(simpleOutputStr);
		var styledOutputStr = "<div style='font-size: smaller; background-color: " + backgroundColor + ";'>" + info.scriptName + ": " + message + "</div>";
		if (config.whisperErrors) 
			whisper("gm", styledOutputStr );
	};

/*


                                            
		_/    _/  _/_/_/_/  _/        _/_/_/    
	   _/    _/  _/        _/        _/    _/   
	  _/_/_/_/  _/_/_/    _/        _/_/_/      
	 _/    _/  _/        _/        _/           
	_/    _/  _/_/_/_/  _/_/_/_/  _/            
												

*/	

	
	var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
		
		if (!playerName) { playerName = "gm";}

		var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px; margin-bottom: 3px; "';
		var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
		var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

		var helpText = '';

		helpText += '<div style="font-size: smaller;">';
		helpText += 'psIsoFacing is a script to automatically change facing (flip horizontal) for tokens on isometric maps.';
		helpText += "This makes movement look more realistic. Otherwise, players wouldn't have access to flipH.";
		helpText += "</div>";

		helpText += '<div style="font-size: smaller;">';		
		helpText += "To start, enter !psIsoFacing in the chat window.";
		helpText += "</div>";
		
		helpText += '<div style="font-size: smaller;">';		
		helpText += "Configuration options to be aware of: ";
		helpText += "<ul>";
		helpText += 	"<li>Tokens only change facing if they represent a character and they're controlled by someone.</li>";
		helpText += 	"<li>By default, they won't change facing unless their 'tread' status indicator is on (it looks like a boot).</li>";
		helpText +=		"<li>If you prefer not to use the tread status indicator, you can 'Toggle Use Tread Status Indicator'. Then, you'll have to 'Register token for Travelling'</li>";
		helpText += "</ul>";
		helpText += "</div>";
		

		
		helpText += "<div style='font-size: smaller'>";
		helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing</div>';
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing --register ' + exampleTokenSelect + '</div>';		
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing --deregister ' + exampleTokenSelect + '</div>';
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing --fliph ' + exampleTokenSelect + '</div>';
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing --reset</div>';

		
		//whisper(playerName, helpText );
		var helpHandouts;
		helpHandouts = findObjs({
			_type: "handout",
			name: "psIsoFacing Help"
		});

		var helpHandout = helpHandouts[0];
		//log("helpHandout = " + helpHandout);
		
		if (!helpHandout) { // create it
			helpHandout = createObj('handout', {
				name: 'psIsoFacing Help',
				inplayerjournals: 'all'
			});
			helpHandout.set("notes", helpText);

		} else { // it exists, set it's contents to match the latest version of the script
			helpHandout.set("notes", helpText);
		}
		var handoutID = helpHandout.get("_id");

		var chatMessage = "";
		var buttonStyle = "'background-color: AntiqueWhite; text-align: center'";
		
		chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>Additional Information</a></div>";
		
		return(chatMessage);
	};

	
	var getHelp = function helpGetter() {
		
		var helpText = "";
		
		helpText += "<div style='text-align: center;'>";
		

		helpText += makeButton("Status", "!psIsoFacing --status");
		helpText += makeButton("Toggle On/Off for all", "!psIsoFacing --toggle all");		
		
		var tokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');
		var tokenTarget = ch('@') + ch('{') + 'target' + ch('|') + 'token_id' + ch('}');
		helpText += makeButton("Register token for Travelling", "!psIsoFacing --register " + tokenTarget );
		helpText += makeButton("De-Register token for Travelling", "!psIsoFacing --deregister " + tokenTarget );
		helpText += makeButton("Toggle Use Tread Status Indicator", "!psIsoFacing --toggle tread");
		helpText += makeButton("Flip Horizontal", "!psIsoFacing --fliph " + tokenTarget);
		helpText += makeButton("Reset", "!psIsoFacing --reset ");

		helpText += "</div>";
		helpText += showDetailedHelp("gm");
		whisper("gm", helpText);
		
	};

	var hasPermissions = function permissionIdentifier(tokenID, playerID) {
		var tokenObj = getObj("graphic", tokenID);
		var characterID = tokenObj.get("represents");
		var playerHasPermission = false;
		
		if (playerIsGM(playerID)) {
			playerHasPermission = true;
		} else if (tokenObj.get("controlledby").indexOf(playerID) !== -1) {
			playerHasPermission = true;
		} else if ( characterID !== undefined ) {
			var character = getObjs("character", characterID);
			if (character.get("controlledby").indexOf(playerID) !== -1 ) {
				playerHasPermission = true;
			}
		} else {
			playerHasPermission = false;
		}

		if (debug) log("hasPermissions("+tokenID+", "+ playerID + ") is returning: " + playerHasPermission);
		return playerHasPermission;
		
	};


	var flipTokenIfPermitted = function tokenFlipper(tokenID, playerID) {
		if (hasPermissions( tokenID,  playerID)) { // make sure players can't flip someone else's token						
			var tokenObj = getObj("graphic", tokenID);
			tokenObj.set("fliph",!tokenObj.get("fliph"));
		}	
	};
	
/*
															 
		_/_/_/  _/      _/  _/_/_/    _/    _/  _/_/_/_/_/   
		 _/    _/_/    _/  _/    _/  _/    _/      _/        
		_/    _/  _/  _/  _/_/_/    _/    _/      _/         
	   _/    _/    _/_/  _/        _/    _/      _/          
	_/_/_/  _/      _/  _/          _/_/        _/           
															
              
*/	   
	
	var handleInput = function inputHandler(msg) {
			
		if (msg.type == "api" && msg.content.indexOf("!psIsoFacing") !== -1 ) {

			var argsFromUser,
				who,
				errors=[],
				playerID,
				playerName,
				pageID,
				tokenID,
				requestedToggle,
				userCommand;


			playerName = msg.who;
			playerID = msg.playerid;

            argsFromUser = msg.content.split(/ +/);
			userCommand = argsFromUser[1];
			tokenID = argsFromUser[2];			
			requestedToggle = argsFromUser[2];

			//whisper("gm", "heard: " + userCommand);
			//whisper("gm", "heard: " + tokenID);
			
			
			switch(userCommand) {				
				case "--on":
					config.resizeOnAdd = true;
				break;
				
				case "--off":
					config.resizeOnAdd = false;
				break;
				
				case "--status":
					getStatus();
					
				break;
				case "--toggle":
					if ( requestedToggle == "all") { 
						config.scriptIsActive = !config.scriptIsActive;
						whisper("gm", "config.scriptIsActive = " + config.scriptIsActive);

					} else if (requestedToggle == "tread") {
						config.useTreadStatusForFacing = !config.useTreadStatusForFacing;
						whisper("gm", "config.useTreadStatusForFacing = " + config.useTreadStatusForFacing);
					
					
					} else { // assume requested toggle is tokenID
						if (_.has(travellers, tokenID) ) {
							travellers[tokenID].remove();
						} else {
							registerTokenForFacing(tokenID);
						}
					}
				
				break;
				
				case '--fliph':
					flipTokenIfPermitted(tokenID, playerID);
				

				break;
				
				case '--register':
					registerTokenForFacing(tokenID);
				break;
				
				case '--deregister':
					deregisterTokenForFacing(tokenID);
				break;
					
				
				case '--help':
					getHelp();
				break;
				
				case '--reset':
					reset(getCurrentPage(playerID));
				break;

				case '--resetall':
					_.each(allActivePages(), function(pageID) {
						reset(pageID);	
					});
				break;
				
				case undefined:
					getHelp();
				break;
				
				case '--inspect':
					if (getObj("graphic", tokenID) !== undefined) {
						if (debug) psLog("properties of " + JSON.stringify(getObj("graphic", tokenID)), "DarkKhaki");						
					}

				break;
			}
			
			
		}
	};	


/*

		_/_/_/    _/_/_/_/    _/_/_/  _/_/_/    _/_/_/  _/_/_/_/_/  _/_/_/_/  _/_/_/    
	   _/    _/  _/        _/          _/    _/            _/      _/        _/    _/   
	  _/_/_/    _/_/_/    _/  _/_/    _/      _/_/        _/      _/_/_/    _/_/_/      
	 _/    _/  _/        _/    _/    _/          _/      _/      _/        _/    _/     
	_/    _/  _/_/_/_/    _/_/_/  _/_/_/  _/_/_/        _/      _/_/_/_/  _/    _/     

*/	
	
	// **** What are you trying to achieve here? Is this supposed to be an on/off toggle, or what?
		// If you rely on the tread or yellow status indicator, then you don't need a register routine.
		// But, too many status indicators makes the token look ugly.
	var registerTokenForFacing = function tokenFacingRegistrar(tokenID) {
		if (debug) psLog("in registerTokenForFacing with " + tokenID);
		
		if (tokenID === undefined || getObj("graphic", tokenID) === undefined ) {
			log("Error: registerTokenForFacing called without a tokenID parameter.");
			return false;
		} else if ( _.has(travellers, tokenID) === false ) { // this token is not yet registered
			travellers[tokenID] = new travellerObj(tokenID);
			instantiateTravellerMethods(travellers[tokenID]);
			whisper("gm", "registered " + tokenID);
			whisper("gm", "travellers = " + _.keys(travellers) );
			return travellers[tokenID]; // travellerObj
		} else { // this token is already registered.
			whisper("gm", "token: " + tokenID + " is already registered");
			return travellers[tokenID]; // returning a travellerObj			
		}
		
	};

	/* This never gets called?
	var registerTokenForFlashlight = function flashlightRegistrar(tokenID) {
		if (debug) psLog("in registerTokenForFlashlight with " + tokenID);
		
		if (tokenID === undefined || getObj("graphic", tokenID) === undefined ) {
			log("Error: registerTokenForFlashlight called without a tokenID parameter.");
			return false;
		} else if ( _.has(flashlights, tokenID) === false ) { // this token is not yet registered
			//flashlights[tokenID] = new flashlightObj(tokenID);
			lightFlashlight(tokenID);
			
			return flashlights[tokenID]; // travellerObj
		} else { // this token is already registered.
			whisper("gm", "token: " + tokenID + " is already registered");
			return flashlights[tokenID]; // returning a travellerObj			
		}
	};
	*/
	
	var deregisterTokenForFacing = function tokenDeRegistrar(tokenID){
		log("in deregisterTokenForFacing with " + tokenID);
		
		if (_.has(travellers, tokenID) ) {
			var thisTraveller = travellers[tokenID];			
			thisTraveller.remove();
		}
	};

	var deregisterTokenForFlashlight = function flashlightDeRegistrar(tokenID){
		if (debug) psLog("in deregisterTokenForFlashlight with " + tokenID);
		
		if (_.has(flashlights, tokenID) ) {
			var thisFlashlight = flashlights[tokenID];			
			//thisFlashlight.remove();
			extinguishFlashlight(tokenID);
		}
	};
	

	
	
	var getLastLocation = function lastLocationGetter(token) {
		
		//if (debug) psLog("lastmove for " + token.get("name") + ", " + token.get("_id") + " = " + token.get("lastmove") );
		var movementPath = token.get("lastmove").split(",");
		
		var lastLocation = [];
		
		lastLocation[0] = Number(movementPath[0]); // important to type convert them into numbers
		lastLocation[1] = Number(movementPath[1]);
		
		return lastLocation;
		
	};
	

	var isTokenOwned = function ownerChecker(tokenObj) {
		var controlledby = tokenObj.get("controlledby");
		var represents = tokenObj.get("represents");
		// log("name: " + tokenObj.get("name") + ", controlledby: " + controlledby + ", represents: " + represents);
		if ( !controlledby && !represents ) {
			// log("tokenIsOwned === false"); 
			return false;
		} else {
			// log("tokenIsOwned === true");
			return true;
		}	
	};

/*

		_/_/_/  _/      _/    _/_/_/  _/_/_/    _/_/_/_/    _/_/_/  _/_/_/_/_/   
		 _/    _/_/    _/  _/        _/    _/  _/        _/            _/        
		_/    _/  _/  _/    _/_/    _/_/_/    _/_/_/    _/            _/         
	   _/    _/    _/_/        _/  _/        _/        _/            _/          
	_/_/_/  _/      _/  _/_/_/    _/        _/_/_/_/    _/_/_/      _/           
																				

*/

	var getStatus = function statusGetter() {
		whisper("gm", "Info: " + JSON.stringify(info) );
		whisper("gm", "Config: " + JSON.stringify(config) );		
		whisper("gm", "Active Travellers: " + _.keys(travellers) );
		whisper("gm", "Active Flashlights: " + _.keys(flashlights) );
	};

	
	var isTokenMarching = function activeChecker(tokenObj) {
		//log("entered function isTokenMarching with " + JSON.stringify(tokenObj));
		var result = false;
		
		if (!config.scriptIsActive) { // don't do anything. The user turned psIsoTraveller off for everyone.
			//log("config.scriptIsActive == " + config.scriptIsActive);
			result = false;
		} else if (isTokenOwned(tokenObj) === false ) { 	
			result = false;

		} else if (config.useTreadStatusForFacing === true) { // see if the token has a tread (boot) status marker
			var currentTreadStatus = inString(tokenObj.get("statusmarkers"), "tread");
			
			result = currentTreadStatus;			
			//log("status: " + tokenObj.get("statusmarkers") + ". currentTreadStatus == " + currentTreadStatus);
		} else { // see if the token is "registered" from the gui.
			var isRegisteredInTravellersList = _.has(travellers, tokenObj.get("_id") );
			//log("isRegisteredInTravellersList: " + isRegisteredInTravellersList);
			result = isRegisteredInTravellersList;
		}
		
		//log("leaving isTokenMarching. Returning " + result);
		return result;
	};
	
	var shouldTokenBeLit = function flashlightChecker(tokenObj) {
		var result = false;
		var tokenID = tokenObj.get("_id");
		
		if (config.scriptIsActive && isTokenOwned(tokenObj) ) { // has owner
			if (config.useYellowStatusForLight === true && inString(tokenObj.get("statusmarkers"), "yellow") === true ) { // user wants it on
				result = true;
			} else if ( _.has(flashlights, tokenObj.get("_id")) === true && config.useYellowStatusForLight === false ) { // user wants it on but they don't like the yellow status indicators
				result = true;
			}
		}
		
		if (debug) psLog("shouldTokenBeLit: " + tokenObj.get("name") + " = " + result, "yellow");
		return result;
	};

	var isTokenLit = function tokenLightChecker(tokenObj) {
		var result = false;
		var tokenID = tokenObj.get("_id");
		
		if ( _.has(flashlights, tokenID) === true && flashlights[tokenID].lightID !== "" ) { // token is lit
			result = true;
		} else {
			result = false;
		}
		if (debug) psLog("isTokenLit: " + tokenObj.get("name") + " = " + result, "yellow");
		
		return result;
	};
	
/*
                                                                                   
		 _/_/_/    _/_/    _/      _/    _/_/_/  _/_/_/  _/_/_/    _/_/_/_/  _/_/_/    
	  _/        _/    _/  _/_/    _/  _/          _/    _/    _/  _/        _/    _/   
	 _/        _/    _/  _/  _/  _/    _/_/      _/    _/    _/  _/_/_/    _/_/_/      
	_/        _/    _/  _/    _/_/        _/    _/    _/    _/  _/        _/    _/     
	 _/_/_/    _/_/    _/      _/  _/_/_/    _/_/_/  _/_/_/    _/_/_/_/  _/    _/      

*/	
	
	var considerChangingDirection = function directionChangeDeterminator(tokenMoved) {
		if (isTokenMarching(tokenMoved) === true) {
		
			//log("entered considerChangingDirection with " + JSON.stringify(tokenMoved) );
			var lastLocation = getLastLocation(tokenMoved);		
			var currentLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
			var tokenID = tokenMoved.get("_id");
			var thisTraveller = travellers[tokenID];
			if (thisTraveller === undefined) {
				log("==> Error: currentTraveller is undefined: " + tokenID);
				if (isTokenMarching(tokenMoved) ) {
					thisTraveller = registerTokenForFacing(tokenID);
				}
				return false;
			}
			
			if (!lastLocation) { // this token hasn't ever moved.. just use the current location.
				lastLocation = [tokenMoved.get("left"), tokenMoved.get("top")];
			} else { // Hey, we're moving! Check the direction and change facing.

				var previousDirection;
				var currentDirection;
				
				previousDirection = thisTraveller.direction;
				
				if ( lastLocation[0] > currentLocation[0] ) { // face right?
					currentDirection = 1;
				} else if ( lastLocation[0] < currentLocation[0] ) { //face left?
					currentDirection = -1;				
				} else { // token graphic changed, but it hasn't moved on the x axis. Maybe someone updated the status markers or something. 
					return;
				}				
				
				if ( currentDirection !== previousDirection ) {
					// log("thisTraveller = " + JSON.stringify(thisTraveller)); 
					if (_.has(thisTraveller, "changeDirection") ) {
						thisTraveller.changeDirection();
					} else {
						log("thisTraveller has no changeDirection. " + JSON.stringify(thisTraveller) );
					}
				}
			}				
		}
	};
	
	var considerLightingLight = function lightLighter(tokenMoved) {
		var tokenID = tokenMoved.get("_id");
		var shouldBeLit = shouldTokenBeLit(tokenMoved);
		var isLit = isTokenLit(tokenMoved);
		
		if (debug) psLog("considerLightingLight: " + tokenMoved.get("name") , "LightGrey");
		if (shouldTokenBeLit(tokenMoved) === true && isTokenLit(tokenMoved) === false ) { // light this token
			if (debug) psLog("tokenID needs flashlight: " + tokenID, "DarkGoldenRod");
			if (debug) psLog("flashlights: " + JSON.stringify(_.keys(flashlights)), "DarkGoldenRod");
			if (debug) psLog("considerLightingLight says: turn it on", "LightGrey");
			
			lightFlashlight(tokenID);				
			
		} else if ( shouldTokenBeLit(tokenMoved) === false && isTokenLit(tokenMoved) === true) { // turn it off
			//flashlights[tokenID].turnOff(); // can't delete the object from inside the object.
			extinguishFlashlight(tokenID);
			if (debug) psLog("turn it off", "LightGrey");
		}		
	};
	
	var considerMovingLight = function lightMover(tokenMoved) {
		var tokenID = tokenMoved.get("_id");
		if ( shouldTokenBeLit(tokenMoved) === true && isTokenLit(tokenMoved) === true ) { // that character doesn't have a flashlightObj yet
			
			
			flashlights[tokenID].follow();
			
		} 
		
		/* else { // the token shouldn't be lit.
			if (debug) psLog("considerMovingLight says this token either isn't lit, or shouldn't be lit");
			considerLightingLight(tokenMoved);
		} */
		
	};
	
/*
													 
		_/      _/    _/_/    _/      _/  _/_/_/_/   
	   _/_/  _/_/  _/    _/  _/      _/  _/          
	  _/  _/  _/  _/    _/  _/      _/  _/_/_/       
	 _/      _/  _/    _/    _/  _/    _/            
	_/      _/    _/_/        _/      _/_/_/_/       
													 

*/	
	
	
	var handleTokenMove = function tokenMoveHandler(tokenMoved) {
		if (debug) psLog("entering handleTokenMoved with: tokenObj for " + tokenMoved.get("name")); 
		
		considerLightingLight(tokenMoved);
		considerMovingLight(tokenMoved);
		considerChangingDirection(tokenMoved);		
	};

	var handleTokenStatusMarkersChange = function tokenStatusMarkerChangeHandler(tokenChanged) {
		considerLightingLight(tokenChanged);		
	};
	
	
/*
                                                     
	   _/    _/  _/_/_/_/_/  _/_/_/  _/          _/_/_/   
	  _/    _/      _/        _/    _/        _/          
	 _/    _/      _/        _/    _/          _/_/       
	_/    _/      _/        _/    _/              _/      
	 _/_/        _/      _/_/_/  _/_/_/_/  _/_/_/         
 
*/	


	var psPoint = function(x, y) {
		this.x = x;
		this.y = y;		
	};

	var makeVector = function(point1, point2) {
		if (debug) psLog("makeVector received: " + JSON.stringify(point1) + ", " + JSON.stringify(point2) , "pink");
		var resultVector = new psPoint( (point2.x - point1.x) , (point2.y - point1.y) );		
		if (debug) psLog("makeVector returning: " + JSON.stringify(resultVector) , "pink");
		return resultVector;
	};
	
	var vectorLength = function(point) {		
		var distance = Math.sqrt( Math.pow(point.x, 2) + Math.pow(point.y, 2) );		
		return distance;
	};
	
	var makeUnitVector = function(point) {
		if (debug) psLog("makeUnitVector received " + JSON.stringify(point) );
		var distance = vectorLength(point);
		if (distance !== 0) {
			return new psPoint( (point.x/distance), (point.y/distance) );
		} else {
			return NaN;
		}
	};
	
	var vectorToRoll20Rotation = function(point) {
		if (debug) psLog("vectorToRoll20Rotation received " + JSON.stringify(point), "yellow");
		var theta = Math.atan2(point.y, point.x);
		
		var roll20rotation = (theta * 180/3.1415) + 90;
		if (debug) psLog("vectorToRoll20Rotation returning: " + roll20rotation);
		return roll20rotation;
	
	};
	
	var radiansToRoll20Degrees = function(rads) {
		return 360 - (rads * 180/3.1415);
		
	};
	
	var getCurrentPage = function currentPageGetter(playerID) {
		var currentPage;
		var playerSpecificPages = Campaign().get("playerspecificpages");
		var playerRibbon = Campaign().get("playerpageid");
		
		if (playerID === undefined || getObj("player", playerID) === undefined) {
			currentPage = false;
		} else {
			if (playerIsGM(playerID)) {
				var lastPage = getObj("player", playerID).get("_lastpage");
				if ( lastPage !== "" ) {
					currentPage = lastPage;
				} else {
					currentPage = playerRibbon;
				}
					 
			} else { // non-gm player
				if (playerSpecificPages !== false && playerSpecificPages[playerID] !== undefined ) {
					currentPage = playerSpecificPages[playerID];
				} else {
					currentPage = playerRibbon;
				}
			}
		}
		if (debug) log("getCurrentPage is returning "+ currentPage);
		return currentPage;		
	};
	
	var allActivePages = function activePagesGetter() {
		var allPages = [];
		
		var playerRibbon = Campaign().get("playerpageid"); // pageid
		allPages.push(playerRibbon);

		var playerSpecificPages = _.values(Campaign().get("playerspecificpages")); // pageids
		_.each(_.uniq(playerSpecificPages), function(pageID) {
			allPages.push(pageID);
		});
		
		var players = findObjs({type: "player"});		
		_.each(players, function(player) {
			if (playerIsGM(player.get("_id"))) {
				var gmPlayer = player;
				var gmPage = gmPlayer.get("_lastpage"); // pageid
				if (gmPage !== "") {
					allPages.push(gmPage);
				}
			}			
		});
		
		return allPages;
	};
/*


												 
		_/_/_/  _/      _/  _/_/_/  _/_/_/_/_/   
		 _/    _/_/    _/    _/        _/        
		_/    _/  _/  _/    _/        _/         
	   _/    _/    _/_/    _/        _/          
	_/_/_/  _/      _/  _/_/_/      _/           
												 

*/

	var reconnectOldFlashlights = function flashlightReconnector(pageID) {
		if (pageID === undefined) {
			pageID = Campaign().get("playerpageid");
		}

		var activeFlashlights = findObjs({ 
			_pageid: pageID,
			name: "flashlight",
		});

		_.each( activeFlashlights, function(flashlightGraphic) {
			var parentTokenID = flashlightGraphic.get("gmnotes");
			if (getObj("graphic", parentTokenID) !== undefined ) {
				var reconnectedFlashlight = new flashlightObj(parentTokenID);
				reconnectedFlashlight.lightID = flashlightGraphic.get("_id");
				flashlights[parentTokenID] = reconnectedFlashlight;
			}
		});
	};

	var reset = function resetter(pageID) { // remove all flashlights
		if (pageID === undefined) { // screw it, we'll reset every page that has a player on it.
			log("==> Error: reset function received no pageID");
		}
		
		config = _.clone(defaultConfig);
		travellers = {};
		flashlights = {};
		
		var activeFlashlights = findObjs({ 
			_pageid: pageID,
			name: "flashlight",
		});

		_.each( activeFlashlights, function(flashlightGraphic) {
			flashlightGraphic.remove();
		});
		
		if (debug) psLog("reset to defaults");
		
	};
	
    var checkInstall = function installChecker() {
        if ( !_.has(state, "psIsoFacing") || state.psIsoFacing.info.version !== info.version ) { // populate state from default values
            state.psIsoFacing = { 
				info: info,
				config: config,				
				travellers: _.keys(travellers), // state will hold a simple list of traveller IDs. It can't hold complex objects
				flashlights: _.keys(flashlights)
			};			
			
        } else { // use values from roll20 persistent state object for the campaign.

			travellers = {};
			_.each(state.psIsoFacing.travellers, function(travellerID) {
				travellers[travellerID] = new travellerObj();
				instantiateTravellerMethods(travellers[travellerID]);
			} );
			
			//travellers = state.psIsoFacing.travellers; // state simplifies objects and strips out methods. Hopefully they're still instances of travellerObj

			flashlights = {};
			_.each(state.psIsoFacing.flashlights, function(flashlightID) {
				flashlights[flashlightID] = new flashlightObj();
				instantiateFlashlightMethods(flashlights[flashlightID]);				
			});
			
			
			reconnectOldFlashlights();
			//flashlights = state.psIsoFacing.flashlights;


			config = _.clone(state.psIsoFacing.config);
			info = _.clone(state.psIsoFacing.info);			
		}
		
		_.each(travellers, function(traveller) {
			instantiateTravellerMethods(traveller);
		});

		_.each(flashlights, function(flashlight) {
			instantiateFlashlightMethods(flashlight);
		});
		
		log("psIsoFacing is ready.");
    };


	var registerEventHandlers = function eventHandlerRegistrar() {
		if (debug) psLog("psIsoFacing registered event handlers");
		
		on('chat:message', handleInput );
		on('change:graphic', handleTokenMove );
		on("change:graphic:statusmarkers", handleTokenStatusMarkersChange);
	};

	return { // expose functions for outside calls
		RegisterEventHandlers: registerEventHandlers,
		CheckInstall: checkInstall,
		Reset: reset,
		ShowDetailedHelp: showDetailedHelp,
		psLog: psLog
	};



}());


on("ready",function(){
	psIsoFacing.psLog("on('ready') just fired.", "burlywood");
	psIsoFacing.CheckInstall(); // instantiate all the function expressions
	
	psIsoFacing.RegisterEventHandlers(); // instantiate all the listeners

});