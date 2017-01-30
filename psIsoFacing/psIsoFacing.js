// psIsoFacingAndView

// Currently: flips tokens horizontally based on their movement. 
	// great for side-view tokens on isometric or 8bit maps.
	
// Planned: add a hidden Navi attached to the token which provides a rotating light without rotating the parent token.

// **** TODO
	// Something's really wrong with the way state holds travellers and travellerObj's.
	// I may need to remove the methods from the travellerObjs. Or figure out how to JSON stringify everything.
	


var psIsoFacing = psIsoFacing || (function plexsoupIsoFacing() {
	"use strict";
	var debug = true;


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
		version: 0.13,
        authorName: "plexsoup"
    };

	var travellers = {}; // dictionary of objects for side-view tokens actively moving and changing directions. key: tokenID, value: travellerObj
	var flashlights = {}; // dictionary of objects for flashlights (or navi from Legend of Zelda) which follow the characters around and rotate based on vector from tokens lastmove

	var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
		torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
		transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
		scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
	};	
	
	var travellerObj = function travellerClass(tokenID) { // note: roll20 state variable can only store simple properties. No functions
		this.direction = 1; // right is 1, left is -1
		this.tokenID = tokenID;
	};

	
	
	
	
/*

     _/_/_/    _/_/    _/      _/    _/_/_/  _/_/_/_/_/  _/_/_/    _/    _/    _/_/_/  _/_/_/_/_/   
  _/        _/    _/  _/_/    _/  _/            _/      _/    _/  _/    _/  _/            _/        
 _/        _/    _/  _/  _/  _/    _/_/        _/      _/_/_/    _/    _/  _/            _/         
_/        _/    _/  _/    _/_/        _/      _/      _/    _/  _/    _/  _/            _/          
 _/_/_/    _/_/    _/      _/  _/_/_/        _/      _/    _/    _/_/      _/_/_/      _/           

*/	
	
	
	
	
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
		
	};

	// **** IN Construction ****
	var instantiateFlashlightMethods = function(flashlight) { // note: only operates on a single instance at a time. Call with _.each if you need more.
	
		flashlight.changeOrientation = function() {
			
		}; 
		
		flashlight.turnOn = function() {
			psLog("someone called flashlight.turnOn() ");
			
			if (flashlight.lightID === "" ) { // token still needs a light
				var myLightID = createFlashlightToken(flashlight.parentID);
				psLog("myLightID = " + myLightID, "red");
				flashlight.lightID = myLightID;
				psLog("flashlight.lightID = " + flashlight.lightID, "red");
			}
			
			flashlight.turnedOn = true;
			psLog("flashlight = " + JSON.stringify(flashlight) );
		};

		flashlight.turnOff = function() {
			
			var lightObj = getObj("graphic", flashlight.parentID);
			if (lightObj) {
				lightObj.remove();
				//delete flashlights[flashlight.parentID];				
			}
		};

		flashlight.remove = function() {
			flashlight.turnoff();
		};

		flashlight.follow = function() {
			var lightObj = getObj("graphic", flashlight.lightID);
			var parentObj = getObj("graphic", flashlight.parentID);
			
			if (lightObj && parentObj) { // error checking in case someone deleted either of those tokens
				lightObj.set("layer", "gmlayer"); // hide the movement from players
				lightObj.set("light_radius", 0);
				lightObj.set("left", parentObj.get("left") );
				lightObj.set("top", parentObj.get("top") );				
				lightObj.set("layer", "objects");
				lightObj.set("light_radius", config.light_radius);
			} else {
				psLog("==> Error: flashlight.follow cannot execute because one of the tokens no longer exists.");
				psLog("light token: " + lightObj);
				psLog("parent token: " + parentObj);
			}

		};
	};



	
	
	var createFlashlightToken = function flashlightTokenCreator(parentTokenID) { // returns tokenID of new flashlight graphic object
		var parentToken = getObj("graphic", parentTokenID);
		var parentTokenName = parentToken.get("name");
		psLog("entered createFlashlightToken for "+ parentTokenName + " - " + parentTokenID);

		var token = createObj("graphic", {
			imgsrc: ICONS.torch,
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
			showname: true,
			aura1_radius: 5,
			showplayers_aura1: true,
			width: parentToken.get("width")/2,
			height: parentToken.get("height")/2
			
		});	

		if (token) {
			psLog("createFlashlightToken Just created a token: " + token.get("_id") + " for " + parentTokenName);	
			psLog("Flashlight Token: " + token.get("_id") );
		}
		
		if (parentToken === undefined) {
			psLog("==> Error in createFlashlightToken. parentTokenID = " + parentTokenID);
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
			log("==> Error: inString() missing params" + stringToSearch + ", " + textToLookFor);
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

	


	var flipTokenIfPermitted = function tokenFlipper(tokenID, playerID) {
		var tokenObj = getObj("graphic", tokenID);
		log("fliph: tokenObj = " + tokenObj);
		var represents = tokenObj.get("represents");
		log("\t represents = " + represents);
		var character = getObj("character", represents);
		log("\t character = " + character);
		var controlledBy = character.get("controlledby");
		log("\t controlledBy = " + controlledBy);
		
		log("--fliph token is controlleBy: " + controlledBy);
		log("--fliph playerid is " + playerID);
		
		if (inString( controlledBy,  playerID)) { // make sure players can't flip someone else's token						
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
					reset();
				break;
				
				case undefined:
					getHelp();
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

	var registerTokenForFlashlight = function flashlightRegistrar(tokenID) {
		if (debug) psLog("in registerTokenForFlashlight with " + tokenID);
		
		if (tokenID === undefined || getObj("graphic", tokenID) === undefined ) {
			log("Error: registerTokenForFlashlight called without a tokenID parameter.");
			return false;
		} else if ( _.has(flashlights, tokenID) === false ) { // this token is not yet registered
			flashlights[tokenID] = new flashlightObj(tokenID);
			whisper("gm", "registered flashlight: " + tokenID);
			whisper("gm", "flashlights = " + _.keys(flashlights) );
			return flashlights[tokenID]; // travellerObj
		} else { // this token is already registered.
			whisper("gm", "token: " + tokenID + " is already registered");
			return flashlights[tokenID]; // returning a travellerObj			
		}
	};
	
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
			thisTraveller.remove();
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
		if (tokenObj.get("controlledby") === "" && tokenObj.get("represents") === undefined ) {
			return false;
		} else {
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
			if (config.useYellowStatusForLight && inString(tokenObj.get("statusmarkers"), "yellow") ) { // user wants it on
				result = true;
			} else if ( _.has(flashlights, tokenObj.get("_id")) ) { // user wants it on but they don't like the yellow status indicators
				result = true;
			}
		}
		
		psLog("shouldTokenBeLit: " + tokenObj.get("name") + " = " + result, "yellow");
		return result;
	};

	var isTokenLit = function tokenLightChecker(tokenObj) {
		var result = false;
		var tokenID = tokenObj.get("_id");
		
		if ( _.has(flashlights, tokenID) && flashlights[tokenID].lightID !== "" ) { // token is lit
			result = true;
		} else {
			result = false;
		}
		if (debug) psLog("isTokenLit: " + tokenObj.get("name") + " = " + result, "yellow");
	};
	
/*
                                                                                   
		 _/_/_/    _/_/    _/      _/    _/_/_/  _/_/_/  _/_/_/    _/_/_/_/  _/_/_/    
	  _/        _/    _/  _/_/    _/  _/          _/    _/    _/  _/        _/    _/   
	 _/        _/    _/  _/  _/  _/    _/_/      _/    _/    _/  _/_/_/    _/_/_/      
	_/        _/    _/  _/    _/_/        _/    _/    _/    _/  _/        _/    _/     
	 _/_/_/    _/_/    _/      _/  _/_/_/    _/_/_/  _/_/_/    _/_/_/_/  _/    _/      

*/	
	
	var considerChangingDirection = function directionChangeDeterminator(tokenMoved) {
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
	};
	
	var considerLightingLight = function lightLighter(tokenMoved) {
		var tokenID = tokenMoved.get("_id");
		if (debug) psLog("considerLightingLight: " + tokenMoved.get("name") , "LightGrey");
		if (shouldTokenBeLit(tokenMoved) === true && isTokenLit(tokenMoved) === false ) { // light this token
			flashlights[tokenID] = new flashlightObj(tokenID);
			instantiateFlashlightMethods(flashlights[tokenID]);
			flashlights[tokenID].lightID = createFlashlightToken(tokenID); // NOTE: This should be the only place this happens
			psLog("turn it on", "LightGrey");
		} else if ( shouldTokenBeLit(tokenMoved) === false && isTokenLit(tokenMoved) === true) { // turn it off
			flashlights[tokenID].turnOff();
			psLog("turn it off", "LightGrey");
		} else { // it's fine the way it is.
			
		}
		
	};
	var considerMovingLight = function lightMover(tokenMoved) {
		var tokenID = tokenMoved.get("_id");
		if ( shouldTokenBeLit(tokenMoved) ) { // that character doesn't have a flashlightObj yet
			
			flashlights[tokenID].follow();
			psLog("Trying to follow: " + JSON.stringify(flashlights[tokenID]));
			
		} else { // the token shouldn't be lit.
			//flashlights[tokenID].follow();
			psLog("considerMovingLight says this token shouldn't be lit");
		}
		
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
		
		
		// see if it's controlledby someone
			// see if it's active
				// compare current direction with traveller object direction
					// change facing if you need to
		
		
		if ( isTokenMarching(tokenMoved) === true ) { // this token wants to change facing when moved
			if (debug) psLog("In handleTokenMove: a controlled token is active: " + tokenMoved.get("name"));			
			considerChangingDirection(tokenMoved);
		}
		
		if (shouldTokenBeLit(tokenMoved) === true) {
			considerLightingLight(tokenMoved);
			if (debug) psLog("In handleTokenMove: a lit token is active: " + tokenMoved.get("name"));
			considerMovingLight(tokenMoved);

		}
	};



/*


												 
		_/_/_/  _/      _/  _/_/_/  _/_/_/_/_/   
		 _/    _/_/    _/    _/        _/        
		_/    _/  _/  _/    _/        _/         
	   _/    _/    _/_/    _/        _/          
	_/_/_/  _/      _/  _/_/_/      _/           
												 

*/

	var reset = function resetter() {
		config = _.clone(defaultConfig);
		travellers = {};
		flashlights = {};
		psLog("reset to defaults");
	};
	
    var checkInstall = function installChecker() {
        if ( !_.has(state, "psIsoFacing") || state.psIsoFacing.info.version !== info.version ) { // populate state from default values
            state.psIsoFacing = { 
				info: info,
				config: config,
				travellers: travellers,
				flashlights: flashlights
			};
        } else { // use values from roll20 persistent state object for the campaign.
			travellers = state.psIsoFacing.travellers; // state simplifies objects and strips out methods. Hopefully they're still instances of travellerObj
			flashlights = state.psIsoFacing.flashlights;
			config = state.psIsoFacing.config;
			info = state.psIsoFacing.info;			
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
	};

	return {
		RegisterEventHandlers: registerEventHandlers,
		CheckInstall: checkInstall,
		Reset: reset,
		ShowDetailedHelp: showDetailedHelp
	};



}());


on("ready",function(){
	psIsoFacing.CheckInstall(); // instantiate all the function expressions
	psIsoFacing.RegisterEventHandlers(); // instantiate all the listeners

});