/*                                                         
        _/_/_/      _/_/_/        _/_/_/  _/    _/  _/_/_/   
       _/    _/  _/            _/        _/    _/    _/      
      _/_/_/      _/_/        _/  _/_/  _/    _/    _/       
     _/              _/      _/    _/  _/    _/    _/        
    _/        _/_/_/          _/_/_/    _/_/    _/_/_/       

*/

/*
    Purpose: 
        Provide standardized, reusable functions for creating GUIs in Roll20 API scripts.
    
    Module Usage: 
		
		First, make some functions you want to be callable.
		Make sure you expose those functions in the returned object for your module, so they're available to the psGUI module.
			eg:
				return {
					myFunction: myFunction,
					myOtherFunction: myOtherFunction
				}

		Then... Create a list of new (psGUI.userCommand)'s as follows:
		
			var userCommands = [];
			
			var myCommand = new psGUI.userCommand;
				myCommand.listener = "!moduleName";
				myCommand.commandName = "--commandName";
				myCommand.functionToCall = referenceToFunction;
				myCommand.parameters = ["paramType1", "paramType2", ..."paramTypeN"]; // "string", "num", "token_id", "page_id", "character_id", "imgsrc", "current_page_id"
				myCommand.shortDesc = "Button Name";
				myCommand.longDesc = "This is the Helpfile blurb for the command.";
				myCommand.inputOverrides = ["foo", "bar"] // eg: normally a parameter of type "string" will present the player with an input window. If you don't want that dialog, put values in inputOverrides.
			userCommands.push(myCommand);
		
		Then: supply that list of commands to psGUI like this:  
			psGUI.RegisterUserCommands(userCommands);
		
        Push all userCommand objects into a userCommands list.
        
        userCommand parameters: [listener, commandName, functionToCall, parameters, shortDesc, longDesc, inputOverrides]


*/

var psGUI = psGUI || (function plexsoupAwesomeGUI() { // Module
    "use strict";
	var debug = true;
    
    var info = {
		name: "psGUI.js",
        version: 0.1,
        author: "plexsoup"
    };
    
    var config = {};
    var defaultConfig = {};

    var userCommands = []; // list of userCommand objects

	var ch = psUtils.ch; // for encoding html characters (one at a time)

	
/*
        _/_/_/    _/_/    _/      _/  _/      _/    _/_/    _/      _/  _/_/_/      _/_/_/   
     _/        _/    _/  _/_/  _/_/  _/_/  _/_/  _/    _/  _/_/    _/  _/    _/  _/          
    _/        _/    _/  _/  _/  _/  _/  _/  _/  _/_/_/_/  _/  _/  _/  _/    _/    _/_/       
   _/        _/    _/  _/      _/  _/      _/  _/    _/  _/    _/_/  _/    _/        _/      
    _/_/_/    _/_/    _/      _/  _/      _/  _/    _/  _/      _/  _/_/_/    _/_/_/        

*/

    //make a general purpose object container for user commands.
        // then, from that object, build out the help file, the gui, and listeners automatically.
        
    
	var registerUserCommands = function(newCommandsList) {
		if (debug) log(info.name + ": entering registerUserCommands with " + newCommandsList);
		var oldUserCommands = _.clone(userCommands);
		userCommands = oldUserCommands.concat(newCommandsList);
		
		
	};
	
    var userCommand = function(listener, commandName, functionToCall, parameters, shortDesc, longDesc, inputOverrides, group, restrictedToGM) { // inputOverrides is optional
        this.listener = listener; // string (eg: "!psIsoFacing")
        this.commandName = commandName; // string (eg: "--reset")
        this.functionToCall = functionToCall; // function (eg: scaleVector)
        this.parameters = parameters;   // array/list of predefined variable types (eg: ["page_id", "string", "token_id", "number"])
        this.shortDesc = shortDesc;     // string (eg: "Reset the map")
        this.longDesc = longDesc;       // string (eg: "<div>Enter !psIsoFacing --reset in chat to reset the map and remove all flashlights</div>")
        this.inputOverrides = inputOverrides; // what to put in the GUI buttons.. eg: @{selected|token_id}, ?{Parameter Value?} // note: pass these through ch()
		this.group = group;				// organize these buttons together on the menu
		this.restrictedToGM = restrictedToGM;
    };

    

    
    var parameterTypes = { // intended for parameter checking: validate inputs and handle errors gracefully
        "string": function(string) { 
            return _.isString(string);
        },
        "token_id": function(token_id) { 
		    if (token_id !== undefined && token_id !== "" && getObj("graphic", token_id) !== undefined) {
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
        },
		"current_page_id": function(page_id) {
			return Boolean( page_id !== undefined && getObj("page", page_id) !== undefined);
		},
		"imgsrc": function(imgsrc) {
			if (_.isString(imgsrc) && indexOf(imgsrc, "https://s3.amazonaws.com/files.d20.io/images") !== 1 && indexOf(imgsrc, "thumb") !== -1) {
				return true;
			} else {
				log("imgsrc must come from https://s3.amazonaws.com/files.d20.io/images and use the 'thumb' version of the graphic");
				return false;
			}
		}
    };


/*

        _/_/_/      _/_/    _/_/_/      _/_/    _/      _/    _/_/_/   
       _/    _/  _/    _/  _/    _/  _/    _/  _/_/  _/_/  _/          
      _/_/_/    _/_/_/_/  _/_/_/    _/_/_/_/  _/  _/  _/    _/_/       
     _/        _/    _/  _/    _/  _/    _/  _/      _/        _/      
    _/        _/    _/  _/    _/  _/    _/  _/      _/  _/_/_/         

*/
    
	
	
	var getParameterInputPrompt = function(paramType, playerID) {
		
		switch(paramType) {			
			case "string": return '?' + ch('{') + "String?" + ch('}');
			case "token_id": return ch('@') + ch('{') + "target" +ch('|') + "token_id" + ch('}');
			case "character_id": return getCharacterChooser(playerID);
			case "page_id": return getPageChooser(playerID);
			case "current_page_id": return psUtils.GetPlayerPage(playerID);
			case "number": return '?' + ch('{') + "Number?" + ch('}');
			case "num": return '?' + ch('{') + "Number?" + ch('}');
		}
	};

	var getCharacterChooser = function charChooser(playerID) {
		var characters = findObjs({
			_type: "character"
		});
		
		var characterSelectorStr;
		var indexNum = 1;
		
		if (characters.length > 1) {
			characterSelectorStr += '?' + ch('{') + "Character ID?";
			_.each(characters, function(character) {
				var characterName = String(indexNum) + ": " + character.get("name");
				characterSelectorStr += ch('|')+ "'" + characterName + "',"+ character.get("_id");
				indexNum++;
			});
		} else if (characters.length == 1) {
			characterSelectorStr += characters[0].get("_id");
		} else { // characters.length == 0
			psLog("==> Error: there are no characters in the campaign to select from.", "orange");
		}
		characterSelectorStr += ch('}');
		return characterSelectorStr;		
	};

	var getPageChooser = function pageChooser(playerID) {
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
	};
	
/*	
    var defaultParamInputPrompts = { // for building GUI
        "string": '?' + ch('{') + "String?" + ch('}'),
        "token_id": ch('@') + ch('{') + "target" +ch('|') + "token_id" + ch('}'),
		"playername": function playerNameGetter() {
			return '?' + ch('{') + "Player?" + ch('}');
		},
        "character_id": function characterLocator() {
            var characters = findObjs({
                _type: "character"
            });
            
            var characterSelectorStr;
            var indexNum = 1;
			
			if (characters.length > 1) {
				characterSelectorStr += '?' + ch('{') + "Character ID?";
				_.each(characters, function(character) {
					var characterName = String(indexNum) + ": " + character.get("name");
					characterSelectorStr += ch('|')+ "'" + characterName + "',"+ character.get("_id");
					indexNum++;
				});
			} else if (characters.length == 1) {
				characterSelectorStr += characters[0].get("_id");
			} else { // characters.length == 0
				psLog("==> Error: there are no characters in the campaign to select from.", "orange");
			}
            characterSelectorStr += ch('}');
            return characterSelectorStr;
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
		"current_page_id": function currentPageGetter() {
			return Campaign().get("playerpageid"); // **** this needs work. right now, it only provides the roll20 page bookmark ribbon.
		},
        "num": '?' + ch('{') + "Number?" + ch('}')
        
    };
*/

    
    var isParameterValid = function parameterTester(paramName, paramValue) {
        if (debug) log("isParameterValid testing: " + paramName + ", " + paramValue); 
        var passed = false;
        var color;
        
		passed = parameterTypes[paramName](paramValue);
		if (!passed) { 
			color = "red";
			psLog("==> Error: " + paramValue + " doesn't match expected type "+ paramName, color ); 

		} else {
			color = "green";                
		}
	
        if (debug) log("paramValue: " + paramValue + " is " + paramName + " === " + passed);
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


        
    var whisper = function whisperer(playerID, chatString) {
        log("whisper received: '" + chatString + "', " + playerID);
        var playerName;
        if (playerID === undefined || playerID == "gm") {
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

    var displayGUI = function guiBuilder(playerID, requestedCommand) {
		// Make a bunch of buttons on the roll20 chat pane.
		// Those buttons let users call registered userCommands from other modules.
				
		var GUIText = "";
		var style = "'font-size: smaller;'";
		GUIText += "<div style="+style+"><h3>" + requestedCommand + "</h3>";
		var relevantCommands = _.filter(userCommands, {listener: requestedCommand});
		var sortedCommands = _.groupBy(relevantCommands, "group");
		

		_.each( sortedCommands, function(commandGroup, groupName) { 
			GUIText += "<h4>" + groupName + ": </h4>"; 
			_.each( commandGroup, function(userCommand) {
				//psLog("userCommand: " + userCommand, "green");
				var inputText = userCommand.listener + " " + userCommand.commandName;
				
				
				// typeCorrection: string to array 
				if (_.isString(userCommand.parameters) ) {
					userCommand.parameters = [userCommand.parameters];
				}
				if (_.isString(userCommand.inputOverrides)) {
					userCommand.inputOverrides = [ userCommand.inputOverrides ];
				}
				
				// NOTE: This assumes that userCommands follow the correct typedefs: 
					// parameters = array, inputOverrides = array.
					// This will break if either are strings, because javascript treats a string as an array of letters.
				var keyPairs = _.zip(userCommand.parameters, userCommand.inputOverrides);
				
				_.each(keyPairs, function(keyPair) {
					
					var paramName = keyPair[0];
					var inputOverride = keyPair[1];
					if (inputOverride !== undefined && inputOverride !== "") {
						// **** TODO: Make sure the inputOverride matches the typedef?
						inputText += " " + inputOverride;
					} else {
						// produce an API button which allows the user to select or enter needed values.
						//OLD: inputText += " " + _.result(defaultParamInputPrompts, paramName);
						var promptStr = getParameterInputPrompt(paramName, playerID);
						inputText += " " + promptStr;
						
					}
				});
				
				/*
				_.each(userCommand.parameters, function(paramName) {
					// **** TODO **** check for overrides from userCommand.inputOverrides
					inputText += " " + _.result(defaultParamInputPrompts, paramName);
				});
				*/

				var buttonStr = makeButton(userCommand.shortDesc, inputText );
				GUIText += buttonStr;
			});
		});
		GUIText += "</div>";
		
		whisper(playerID, GUIText);
    };
    

    
/*

        _/    _/  _/_/_/_/  _/        _/_/_/    
       _/    _/  _/        _/        _/    _/   
      _/_/_/_/  _/_/_/    _/        _/_/_/      
     _/    _/  _/        _/        _/           
    _/    _/  _/_/_/_/  _/_/_/_/  _/            

*/
    var buildHelpFiles = function(userCommands, scriptName) {
        
		if (debug) log("building help file for " + scriptName);
		
        var helpFileData = _.groupBy(userCommands, function(commandObj) { return commandObj.listener; }); // one object per listener, containing lists of usercommands
        var helpFileNames = _.keys(helpFileData);
        
        _.each(helpFileNames, function buildEachHelpFile(helpFileName) {

            var helpHandouts;
            helpHandouts = findObjs({
                _type: "handout",
                name: helpFileName + " Help"
            });

            var helpHandout = helpHandouts[0];

            var helpText = "<h3><a href='" + helpFileName + "'>" + helpFileName + "</h3>";
            _.each(helpFileData[helpFileName], function(commandObj) {
                helpText += "<div style='font-weight: bold;'>" + commandObj.shortDesc + "</div>";
                helpText += "<div style='margin-left:20px;'>" + helpFileName + " " + commandObj.commandName + " ";
				if (commandObj.parameters.length > 0 ) {
					helpText += ch("[")+ commandObj.parameters +ch("]");
				}  
				helpText += "</div>";
                helpText += "<div style='margin-left:30px; font-style: italic;'>" + commandObj.longDesc + "</div>";
                
            });
            
            if (!helpHandout) { // create it
                helpHandout = createObj('handout', {
                    name: helpFileName + ' Help',
                    inplayerjournals: ''
                });
                helpHandout.set("notes", helpText);

            } else { // it exists, set it's contents to match the latest version of the script
                helpHandout.set("notes", helpText);
            }

            log("helpHandout = " + helpHandout);
            
            var handoutID = helpHandout.get("_id");

            var chatMessage = "";
            var buttonStyle = "'background-color: beige;'";

			chatMessage += makeButton(helpFileName, helpFileName);
            chatMessage += "<div style="+buttonStyle+"><a href='http://journal.roll20.net/handout/" + handoutID + "'>"+ helpFileName +" Information</a></div>";
            psLog(chatMessage, "beige");
        });
		
		if (debug) log("leaving" + info.name + " buildHelpFiles. Nothing to return.");
    };
    
    




/*
                                                         
        _/_/_/  _/      _/  _/_/_/    _/    _/  _/_/_/_/_/   
         _/    _/_/    _/  _/    _/  _/    _/      _/        
        _/    _/  _/  _/  _/_/_/    _/    _/      _/         
       _/    _/    _/_/  _/        _/    _/      _/          
    _/_/_/  _/      _/  _/          _/_/        _/           
                                                         

*/  


    var handleInput = function inputHandler(msg) {

		var args = msg.content.split(/[ ,]+/); // split on commas or spaces
		if (args[0].indexOf("!ps") !== -1) {
			if (debug) log("psGUI heard command: " + JSON.stringify(msg), "orange");
		}
		
		if (args.length == 1 && args[0].indexOf("!ps") !== -1 && _.findWhere(userCommands, {listener: args[0]}) !== undefined ) {
			displayGUI(msg.playerid, args[0]);
        } else {

			_.each(userCommands, function (userCommand) {
				//var args = msg.content.split(/ +/); // split on spaces alone
				
				var anyTestFailed = false;
				if (args[0] == userCommand.listener) {
					if (args[1] == userCommand.commandName) { // test the parameters and execute the user request
						var paramsProvided = _.rest(args, 2);
						var paramTypesRequired = userCommand.parameters;
						var keyPairs = _.zip(paramTypesRequired, paramsProvided);
						if (debug) log("paramTypesRequired: " + paramTypesRequired + ", paramsProvided: " + paramsProvided);
						if (paramsProvided.length == paramTypesRequired.length) {
							// make sure the parameters match the expected types before you run the function
							_.each(keyPairs, function(keyPair) {
								if(debug) log("testing inputs: ");
								if(debug) log("keyPair[0]: " + keyPair[0] + ", keyPair[1]: " + keyPair[1] );
								var thisTestPassed = isParameterValid(keyPair[0], keyPair[1]); 
								if (thisTestPassed === false) {
									
									anyTestFailed = true;
								}
							});                     
						} else { // number of inputs doesn't match expected parameters.
							anyTestFailed = true;
						}
						
						if (!anyTestFailed) { // therefore all tests passed
							log( userCommand.commandName + ": calling: " + String(userCommand.functionToCall)+ ".apply(" + paramsProvided + ")");
							
							if ( userCommand === undefined ) {
								log("==>Error: Can't find function for " + userCommand.commandName + ", make sure it's 'exposed' to other modules in the return statement for your module." );
								return false;
							} else {
								userCommand.functionToCall.apply(undefined, paramsProvided);
							}
							
						} else {
							var errorText = "==> Error: ";
							errorText += userCommand.listener + " " + userCommand.commandName + " expects these ("+paramTypesRequired.length+") parameters : [" + paramTypesRequired + "].";
							errorText += "We received ("+paramsProvided.length+"): [" + paramsProvided + "]";
							psLog(errorText, "orange");
						}
					} 
				}
			});
        }
    };


/*

    _/_/_/_/_/  _/_/_/_/    _/_/_/  _/_/_/_/_/   
       _/      _/        _/            _/        
      _/      _/_/_/      _/_/        _/         
     _/      _/              _/      _/          
    _/      _/_/_/_/  _/_/_/        _/           

*/  
    
    
    
    var initializeUserCommands = function() {
		var newUserCommands = [];
        newUserCommands.push(new userCommand("!psGUI","--name", psGUITest, ["token_id", "character_id"], "Get Token Name", "Returns the name of the graphic object or token"));
		return newUserCommands;
    };

    var psGUITest = function guiTester(token_id, character_id) {        
        var tokenName = getObj("graphic", token_id).get("name");
        var characterName = getObj("character", character_id).get("name");
        psLog("Token: " + tokenName + ", Character: " + characterName, "lightgreen");
    };



/*
                                                                         
        _/_/_/  _/      _/    _/_/_/  _/_/_/_/_/    _/_/    _/        _/     
         _/    _/_/    _/  _/            _/      _/    _/  _/        _/      
        _/    _/  _/  _/    _/_/        _/      _/_/_/_/  _/        _/       
       _/    _/    _/_/        _/      _/      _/    _/  _/        _/        
    _/_/_/  _/      _/  _/_/_/        _/      _/    _/  _/_/_/_/  _/_/_/_/  

*/

    var registerEventHandlers = function eventHandlerRegistrar() {
        on('chat:message', function(msg) {
            handleInput(msg);
        } );
    };
    
    var checkInstall = function installChecker() {
        // construct help file, gui, event handlers
        
        var newCommands = initializeUserCommands();
		registerUserCommands(newCommands);
        buildHelpFiles(newCommands, info.name);
        
        // grab config options from Roll20 persistent state object so they persist across instances and sessions
        if (!_.has(state, psGUI) && _.size(state.psGUI) > 0 ) {
            if (_.size(config) === 0) {
                config = _.clone(defaultConfig);
            }
            state.psGUI = _.clone(config);
        } else {
            config = _.clone(state.psGUI);
        }
		
		log(info.name + " v" + info.version + " installed.");
    };

    return { // expose functions for outside calls
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall,
		BuildHelpFiles: buildHelpFiles,
		RegisterUserCommands: registerUserCommands,
		userCommand: userCommand,
		ch: ch,
		psLog: psLog,
		whisper: whisper,
    };
    
}()); // end module




