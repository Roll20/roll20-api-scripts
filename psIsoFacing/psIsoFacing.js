// psIsoFacingAndView

// Currently: flips tokens horizontally based on their movement. 
	// great for side-view tokens on isometric or 8bit maps.
	
// Planned: add a hidden Navi attached to the token which provides a rotating light without rotating the parent token.

// **** TODO
	// Something's really wrong with the way state holds travellers and travellerObj's.
	// I may need to remove the methods from the travellerObjs. Or figure out how to JSON stringify everything.
	


var psIsoFacing = psIsoFacing || (function plexsoupIsoFacing() {
	"use strict";
	var debug = false;
	
	var config = {
		scriptIsActive: true,
		useTreadStatus: true, // true: tokens are active when they have a yellow status; false: tokens have to be registered through the gui.
		light_radius: 40,
		light_dimradius: 20,
		light_angle: 90
		
	};

    var info = {
        version: 0.10,
        authorName: "plexsoup"
    };

	var travellers = {}; // dictionary of objects for side-view tokens actively moving and changing directions. key: tokenID, value: travellerObj
	var flashlights = {}; // dictionary of objects for flashlights (or navi from Legend of Zelda) which follow the characters around and rotate based on vector from tokens lastmove

	var ICONS = { // note: Roll20 has particular rules about imgsrc. See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions
		torch: "https://s3.amazonaws.com/files.d20.io/images/17247606/Wbr841_bq9ka1FmamWo38w/thumb.png?1458169656",
		transparent: "https://s3.amazonaws.com/files.d20.io/images/27023509/jDIhDrjr_RyUxq5ldQj1uw/thumb.png?1483683924",
		scifi: "https://s3.amazonaws.com/files.d20.io/images/27025190/VrSyw_oHrsM8cfdBPcfLHw/thumb.png?1483690176"
	};	
	
	var travellerObj = function travellerClass(tokenID) {
		this.direction = 1; // right is 1, left is -1
		this.tokenID = tokenID;
		
		//this.changeDirection = function() {
		this.changeDirection = ()=>{ // new JS-ES6 arrow functions retain scope of parent. "this" refers to the parent object.		
			this.direction *= -1;
			var token = getObj("graphic", this.tokenID);
			if (token !== undefined ) {
				token.set("fliph", !token.get("fliph") );
			}
		};	

		this.remove = function() {
			delete travellers[tokenID]; // take myself out of the dictionary
			// Note: there's no js mechanism to destroy myself, so we'll assume that chrome will manage memory when the reference is gone.						
		};
	};

	var flashlightObj = function flashlightClass(tokenID) {
		this.unitVector = [0,1];
		this.parentID = tokenID;
				
		this.initialize = ()=>{ // new JS-ES6 arrow functions retain scope of parent. "this" refers to the parent object.	
			this.tokenID = createObj("graphic", {
				imgsrc: ICONS.transparent,
				light_radius: config.light_radius,
				light_dimradius: config.light_dimradius,
				light_otherplayers: true,
				light_hassight: false,
				light_angle: config.light_angle			
			});
		};
		
		this.changeOrientation = function() {
			//log("changeOrientation");
		};
		
		this.remove = function() {
			//log("remove");
		};
		
		this.follow = function(parentTokenObj) {
			//log("follow");
		};
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



/*


                                            
		_/    _/  _/_/_/_/  _/        _/_/_/    
	   _/    _/  _/        _/        _/    _/   
	  _/_/_/_/  _/_/_/    _/        _/_/_/      
	 _/    _/  _/        _/        _/           
	_/    _/  _/_/_/_/  _/_/_/_/  _/            
												

*/	

	
	var showDetailedHelp = function showDetailedHelpTextInChat(playerName) {
		
		if (!playerName) { playerName = "gm";}

		var exampleStyle = '"background-color: #eee; font-size: smaller; margin-left: 40px;"';
		var warningStyle = '"background-color: AntiqueWhite; font-size: smaller;"';
		var exampleTokenSelect = ch('@') + ch('{') + 'selected' + ch('|') + 'token_id' + ch('}');

		var helpText = '';

		helpText += '<div style="font-size: smaller;">';
		helpText += 'psIsoFacing is a script to automatically change facing (flip horizontal) for tokens on isometric maps.';
		helpText += "This makes movement look more realistic. Otherwise, players don't have access to flipH.";
		helpText += "</div>";

		helpText += '<div style="font-size: smaller;">';		
		helpText += "To start, enter !psIsoFacing in the chat window.";
		helpText += "</div>";
		
		helpText += '<div style="font-size: smaller;">';		
		helpText += "Configuration options to be aware of: ";
		helpText += "<ul>";
		helpText += 		"<li>Tokens only change facing if they represent a character and they're controlled by someone AND their yellow status indicator is on.</li>";
		helpText += "</ul>";
		helpText += "</div>";
		

		
		helpText += "<div style='font-size: smaller'>";
		helpText += "In addition to the gui buttons, you can make macros to activate the features. Here are some commands to play with.";
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing</div>';
		helpText += 		'<div style='+ exampleStyle +'> !psIsoFacing ' + exampleTokenSelect + '</div>';		
		

		
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
		helpText += makeButton("Flip Horizontal", "!psIsoFacing --fliph" + tokenTarget);
		//helpText += makeButton("!psResize --getMarketplaceID", "!psResize --getMarketplaceID " + tokenSelect );

		helpText += "</div>";
		helpText += showDetailedHelp("gm");
		whisper("gm", helpText);
		
	};

	
	var getStatus = function statusGetter() {
		whisper("gm", "Info: " + JSON.stringify(info) );
		whisper("gm", "Config: " + JSON.stringify(config) );		
		whisper("gm", "Active Travellers: " + _.keys(travellers) );
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
						config.useTreadStatus = !config.useTreadStatus;
						whisper("gm", "config.useTreadStatus = " + config.useTreadStatus);
					
					
					} else { // assume requested toggle is tokenID
						if (_.has(travellers, tokenID) ) {
							travellers[tokenID].remove();
						} else {
							registerToken(tokenID);
						}
					}
				
				break;
				
				case '--fliph':
					var tokenObj = getObj("graphic", tokenID);
					var represents = tokenObj.get("represents");
					var controlledBy = represents.get("controlledby");
					log("--fliph token is controlleBy: " + controlledBy);
					log("--fliph playerid is " + msg.get("playerid"));
					if (inString( controlledBy,  msg.get("playerid"))) { // make sure players can't flip someone else's token
						getObj("graphic", tokenID).set("fliph");
					}
				break;
				
				case '--register':
					registerToken(tokenID);
				break;
				
				case '--deregister':
					deregisterToken(tokenID);
				break;
					
				
				case '--help':
					getHelp();
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
	var registerToken = function tokenRegistrar(tokenID) {
		if (debug) log("in registerToken with " + tokenID);
		
		if (tokenID === undefined || getObj("graphic", tokenID) === undefined ) {
			log("Error: registerToken called without a tokenID parameter.");
			return false;
		} else if ( _.has(travellers, tokenID) === false ) { // this token is not yet registered
			travellers[tokenID] = new travellerObj(tokenID);
			whisper("gm", "registered " + tokenID);
			whisper("gm", "travellers = " + _.keys(travellers) );
			return travellers[tokenID]; // travellerObj
		} else { // this token is already registered.
			whisper("gm", "token: " + tokenID + " is already registered");
			return travellers[tokenID]; // returning a travellerObj			
		}
		
	};
	
	var deregisterToken = function tokenDeRegistrar(tokenID){
		log("in deregisterToken with " + tokenID);
		
		if (_.has(travellers, tokenID) ) {
			var thisTraveller = travellers[tokenID];
			
			thisTraveller.remove();
		}
			
		
	};
	
	
	var getLastLocation = function lastLocationGetter(token) {
		
		if (debug) log("lastmove for " + token.get("name") + ", " + token.get("_id") + " = " + token.get("lastmove") );
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
	
	var isTokenMarching = function activeChecker(tokenObj) {
		//log("entered function isTokenMarching with " + JSON.stringify(tokenObj));
		var result = false;
		
		if (!config.scriptIsActive) { // don't do anything. The user turned psIsoTraveller off for everyone.
			//log("config.scriptIsActive == " + config.scriptIsActive);
			result = false;
		} else if (isTokenOwned(tokenObj) === false ) { 	
			result = false;

		} else if (config.useTreadStatus === true) { // see if the token has a tread (boot) status marker
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
	
	var isTokenLit = function flashlightChecker(tokenObj) {
		var result = false;
		
		if (config.scriptIsActive && isTokenOwned(tokenObj) ) {
			if (config.useYellowStatus && inString(tokenObj.get("statusmarkers"), "yellow") ) { 
				result = true;			
			} else if ( _.has(flashlights, tokenObj.get("_id")) ) {
				result = true;
			}
		}
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
				thisTraveller = registerToken(tokenID);
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
				log("thisTraveller = " + JSON.stringify(thisTraveller)); 
				thisTraveller.changeDirection();
			}		
		}
	};
	
	var considerMovingLight = function lightMover(tokenMoved) {
		log("considerMovingLight");
		
	};
	
/*
													 
		_/      _/    _/_/    _/      _/  _/_/_/_/   
	   _/_/  _/_/  _/    _/  _/      _/  _/          
	  _/  _/  _/  _/    _/  _/      _/  _/_/_/       
	 _/      _/  _/    _/    _/  _/    _/            
	_/      _/    _/_/        _/      _/_/_/_/       
													 

*/	
	
	
	var handleTokenMove = function tokenMoveHandler(tokenMoved) {
		if (debug) log("entering handleTokenMoved with: " + tokenMoved); 
		
		
		// see if it's controlledby someone
			// see if it's active
				// compare current direction with traveller object direction
					// change facing if you need to
		
		
		if ( isTokenMarching(tokenMoved) === true ) { // this token wants to change facing when moved
			if (debug) log("in handleTokenMove: a controlled token is active");			
			considerChangingDirection(tokenMoved);
		}
		
		if (isTokenLit(tokenMoved) === true) {
			considerMovingLight(tokenMoved);
		}
	};

	var reset = function resetter() {
		travellers = {};
	};



/*


												 
		_/_/_/  _/      _/  _/_/_/  _/_/_/_/_/   
		 _/    _/_/    _/    _/        _/        
		_/    _/  _/  _/    _/        _/         
	   _/    _/    _/_/    _/        _/          
	_/_/_/  _/      _/  _/_/_/      _/           
												 

*/

	
    var checkInstall = function installChecker() {
        if ( !_.has(state, "psIsoFacing") || state.psIsoFacing.info.version !== info.version ) { // populate state from default values
            state.psIsoFacing = { 
				info: info,
				config: config,
				travellers: travellers,
				flashlights: flashlights
			};
        } else { // use values from roll20 persistent state object for the campaign.
			travellers = state.psIsoFacing.travellers;
			flashlights = state.psIsoFacing.flashlights;
			config = state.psIsoFacing.config;
			info = state.psIsoFacing.info;			
		}
    };


	var registerEventHandlers = function eventHandlerRegistrar() {
		if (debug) log("psIsoFacing registered event handlers");
		
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