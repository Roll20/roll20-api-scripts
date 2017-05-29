var psGUI = psGUI || (function psGUI() { // Module
	"use strict";

	// make a general purpose object container for user commands.
		// then, from that object, build out the help file, the gui, and listeners automatically.
	
	var info = {
		version: 0.1,
		author: "plexsoup"
	};
	
	var config = {};
	var defaultConfig = {
		debug: true
	};
		
		
	var userCommands = []; // list of userCommand objects
	
	var userCommand = function(listener, commandName, functionToCall, parameters, shortDesc, longDesc, defaultParams) { // defaultParams is optional
		this.listener = listener; // string (eg: "!psIsoFacing")
		this.commandName = commandName;	// string (eg: "--reset")
		this.functionToCall = functionToCall; // function (eg: scaleVector)
		this.parameters = parameters; 	// array/list of predefined variable types (eg: ["page_id", "string", "token_id", "number"])
		this.defaultParams = defaultParams; // what to put in the GUI buttons.. eg: @{selected|token_id}, ?{Parameter Value?} // note: pass these through ch()
		this.shortDesc = shortDesc;		// string (eg: "Reset the map")
		this.longDesc = longDesc;		// string (eg: "<div>Enter !psIsoFacing --reset in chat to reset the map and remove all flashlights</div>")
	};

	
	
	var parameterTypes = { // intended for parameter checking and soft error handling
		"string": function(string) { 
			return _.isString(string);
		},
		"token_id": function(token_id) { if (token_id !== undefined && token_id !== "" && getObj("graphic", token_id) !== undefined) {
				return true;
			} else {
				return false;
			}
		},
		"character_id": function(character_id) { 
			return Boolean(character_id !== undefined && getObj("character", character_id) !== undefined); 
		},
		"page_id": function(page_id) { 
			return Boolean(page_id !== undefined && getObj("page", page_id) !== undefined); 
		},
		"num": function(num) { // r20 chat messages come in as strings.. we need to convert to numbers, then test somehow.
			//psLog("isNumber: " + num + " == " + Boolean(!isNaN(num))); // attempting some type coercion
			return Boolean( !isNaN(num) ); 
		}
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
	
	var defaultParamInputPrompts = { // for building GUI
		"string": '?' + ch('{') + "String?" + ch('}'),
		"token_id": ch('@') + ch('{') + "target" +ch('|') + "token_id" + ch('}'),
		"character_id": function characterLocator() {
			var characters = findObjs({
				_type: "character"
			});
			
			var outputStr = '?' + ch('{') + "Character ID?";
			var indexNum = 1;
			_.each(characters, function(character) {
				var characterName = String(indexNum) + ": " + character.get("name");
				outputStr += ch('|')+ "'" + characterName + "',"+ character.get("_id");
				indexNum++;
			});
			outputStr += ch('}');
			return outputStr;
		},
		
		"page_id": function pageLocator() {
			var pages = findObjs({
				_type: "page"
			});
			
			var outputStr = '?' + ch('{') + "Page ID?";
			var indexNum = 1;
			_.each(pages, function(page) {
				var pageName = String(indexNum) + ": " + page.get("name");
				outputStr += ch('|')+ "'" + pageName + "',"+ page.get("_id");
				indexNum++;
			});
			outputStr += ch('}');
			return outputStr;
		},
		"num": '?' + ch('{') + "Number?" + ch('}')
		
	};
	
	var isParameterValid = function parameterTester(paramName, paramValue) {
		// psLog("isParameterValid testing: " + paramName + ", " + paramValue, "orange"); 
		var passed = false;
		var color;
		if ( _.has(parameterTypes, paramName) ) {
			passed = parameterTypes[paramName](paramValue);
			if (!passed) { 
				color = "red";
				psLog("==> Error: " + paramValue + " doesn't match expected type "+ paramName, color ); 

			} else {
				color = "green";				
			}
		}
		
		// psLog("paramValue: " + paramValue + " is " + paramName + " === " + passed, color);
		return passed;
	};

	
	var psLog = function psLogger(string, color) {
		log("psGUI: " + string);
		sendChat("psGui", "/w gm " + "<div style = 'background-color: "+color+"'>"+string+"</div>");
	};

	
/*
		_/_/_/  _/    _/  _/_/_/   
	  _/        _/    _/    _/      
	 _/  _/_/  _/    _/    _/       
	_/    _/  _/    _/    _/        
	 _/_/_/    _/_/    _/_/_/     

*/	


		
	var whisper = function whisperer(chatString, playerID) {
		log("whisper received: '" + chatString + "', " + playerID);
		var playerName;
		if (playerID === undefined) {
			playerName = "gm";
		} else {
			playerName = getObj("player", playerID).get("displayname");
		}
		sendChat("psGui", "/w " + playerName + " " + chatString);
	};

	var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
		var output="";

			output += '['+title+']('+command+')';

		return output;
	};

	var displayGUI = function guiBuilder(playerID) {
		_.each(userCommands, function(userCommand) {
			var inputText = userCommand.listener + " " + userCommand.commandName;
			
			_.each(userCommand.parameters, function(paramName) {
				inputText += " " + _.result(defaultParamInputPrompts, paramName);
			});

			var button = makeButton(userCommand.shortDesc, inputText );
			whisper(button, playerID);
		});
	};
	


/*

	_/_/_/_/_/  _/_/_/_/    _/_/_/  _/_/_/_/_/   
	   _/      _/        _/            _/        
	  _/      _/_/_/      _/_/        _/         
	 _/      _/              _/      _/          
	_/      _/_/_/_/  _/_/_/        _/           

*/	
	
	
	
	var initializeUserCommands = function() {
		userCommands.push(new userCommand("!psGUI","--test", psGUITest, ["string", "num", "token_id", "character_id"], "test message", "this is a test message"));
	};

	var psGUITest = function guiTester(string1, num, token_id, character_id) {		
		var tokenName = getObj("graphic", token_id).get("name");
		var pageName = getObj("character", character_id).get("name");
		psLog("psGUITest received " + string1 + ", " + tokenName + ", " + pageName, "lightgreen");
	};


/*
                                                         
		_/_/_/  _/      _/  _/_/_/    _/    _/  _/_/_/_/_/   
		 _/    _/_/    _/  _/    _/  _/    _/      _/        
		_/    _/  _/  _/  _/_/_/    _/    _/      _/         
	   _/    _/    _/_/  _/        _/    _/      _/          
	_/_/_/  _/      _/  _/          _/_/        _/           
                                                         

*/	

	
	// **** NOTE **** this should be in the module requesting stuff from psUtils.
	var registerEventHandlers = function eventHandlerRegistrar() {
		on('chat:message', function(msg) {
			handleInput(this, msg);
		} ); // **** Not sure if this will work.
	};


	var handleInput = function inputHandler(thisArg, msg) {
		_.each(userCommands, function (userCommand) {
			//var args = msg.content.split(/ +/); // split on spaces alone
			var args = msg.content.split(/[ ,]+/); // split on commas or spaces
			var anyTestFailed = false;
			if (args[0] == userCommand.listener) {
				if (args.length == 1) {
					displayGUI(msg.playerid);
				}
				if (args[1] == userCommand.commandName) { // test the parameters and execute the user request
					var params = _.rest(args, 2);
					var paramTypes = userCommand.parameters;
					var keyPairs = _.zip(paramTypes, params);
					if (params.length == paramTypes.length) {
						// make sure the parameters match the expected types before you run the function
						_.each(keyPairs, function(keyPair) {
							var thisTestPassed = isParameterValid(keyPair[0], keyPair[1]); 
							if (thisTestPassed === false) {
								anyTestFailed = true;
							}
						});						
					} else { // number of inputs doesn't match expected parameters.
						anyTestFailed = true;
					}
					
					if (!anyTestFailed) { // therefore all tests passed
						userCommand.functionToCall.apply(thisArg, params); // **** TODO Figure out how to get "thisarg" for apply to work from other modules
					} else {
						psLog("==> Error: "+ userCommand.listener + " " + userCommand.commandName+ " expects these ("+paramTypes.length+") parameters : [" + paramTypes + "]. You provided ("+params.length+"): [" + params + "]", "orange");
					}
				} 
			}
		});
	};


	



/*
                                                                         
		_/_/_/  _/      _/    _/_/_/  _/_/_/_/_/    _/_/    _/        _/     
		 _/    _/_/    _/  _/            _/      _/    _/  _/        _/      
		_/    _/  _/  _/    _/_/        _/      _/_/_/_/  _/        _/       
	   _/    _/    _/_/        _/      _/      _/    _/  _/        _/        
	_/_/_/  _/      _/  _/_/_/        _/      _/    _/  _/_/_/_/  _/_/_/_/  

*/


	
	var checkInstall = function installChecker() {
		// construct help file, gui, event handlers
		
		initializeUserCommands();
		
		// grab config options from Roll20 persistent state object so they persist across instances and sessions
		if (!_.has(state, psGUI) && _.size(state.psGUI) > 0 ) {
			if (_.size(config) === 0) {
				config = _.clone(defaultConfig);
			}
			state.psGUI = _.clone(config);
		} else {
			config = _.clone(state.psGUI);
		}
	};

	var reset = function resetter() {
		log("entering reset");
	};

	
	return { // expose functions for outside calls
		RegisterEventHandlers: registerEventHandlers,
		CheckInstall: checkInstall,
		Reset: reset,
	};
	
}()); // end module


on("ready", function() {
	psGUI.CheckInstall();
	psGUI.RegisterEventHandlers();
	
});
