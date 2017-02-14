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
		
		Push all userCommand objects into a userCommands list.
			userCommands.push(myCommand);
			
		Then: supply that list of commands to psGUI like this:  
			psGUI.RegisterUserCommands(userCommands);
			
		And Finally: build your help files with:
			psGUI.BuildHelpFiles(userCommands);
		
        
        userCommand parameters: [listener, commandName, functionToCall, parameters, shortDesc, longDesc, inputOverrides]


*/


/*

	TODO: Configure installer to update state when version changes.

*/

var psGUI = psGUI || (function plexsoupAwesomeGUI() { // Module
    "use strict";
	var debug = false;
    
    var info = {
		name: "psGUI.js",
        version: 0.3,
        author: "plexsoup"
    };
    
    var config = {};

    var defaultConfig = {
		buttonStyle: "fantasy"
	};

	var buttonStyles = {
		"neon": {name: "neon"},
		"aqua": {name: "aqua"},
		"material": {name: "material"},
		"default": {name: "default"},
		"fantasy": {name: "fantasy"}
	};
	
    var userCommands = []; // list of userCommand objects

	var ch = ch; // for encoding html characters (one at a time)

	
/*
        _/_/_/    _/_/    _/      _/  _/      _/    _/_/    _/      _/  _/_/_/      _/_/_/   
     _/        _/    _/  _/_/  _/_/  _/_/  _/_/  _/    _/  _/_/    _/  _/    _/  _/          
    _/        _/    _/  _/  _/  _/  _/  _/  _/  _/_/_/_/  _/  _/  _/  _/    _/    _/_/       
   _/        _/    _/  _/      _/  _/      _/  _/    _/  _/    _/_/  _/    _/        _/      
    _/_/_/    _/_/    _/      _/  _/      _/  _/    _/  _/      _/  _/_/_/    _/_/_/        

*/

    //make a general purpose object container for user commands.
        // then, from that object, build out the help file, the gui, and listeners automatically.
        
    
	var registerUserCommands = function userCommandRegistrar(newCommandsList, style, listener, group) {
		if (debug) log(info.name + ": entering registerUserCommands with " + newCommandsList);
		var oldUserCommands = _.clone(userCommands);
		
		_.each(newCommandsList, function(userCommand) {
			if (style !== undefined && style !== "") {
				userCommand.style = style;
			} else {
				if(_.has(config, "buttonStyle")) {
					userCommand.style = config.buttonStyle;
				} else if (_.has(state, 'psGUI')) {
					userCommand.style = state.psGUI.buttonStyle;
				} else {
					userCommand.style = "default";
				}

			}
			
			if (listener !== undefined && listener !== "") {
				userCommand.listener = listener;
			}
			if (group !== undefined && group !== "") {
				userCommand.group = group;
			}
		});

		userCommands = oldUserCommands.concat(newCommandsList);

		
		
	};
	
    var userCommand = function(listener, commandName, functionToCall, parameters, shortDesc, longDesc, inputOverrides, group, restrictedToGM, style) { // inputOverrides is optional
        this.listener = listener; // string (eg: "!psIsoFacing")
        this.commandName = commandName; // string (eg: "--reset")
        this.functionToCall = functionToCall; // function (eg: scaleVector)
        this.parameters = parameters;   // array/list of predefined variable types (eg: ["page_id", "string", "token_id", "number"])
        this.shortDesc = shortDesc;     // string (eg: "Reset the map")
        this.longDesc = longDesc;       // string (eg: "<div>Enter !psIsoFacing --reset in chat to reset the map and remove all flashlights</div>")
        this.inputOverrides = inputOverrides; // what to put in the GUI buttons.. eg: @{selected|token_id}, ?{Parameter Value?} // note: pass these through ch()
		this.group = group;				// organize these buttons together on the menu
		this.restrictedToGM = restrictedToGM;
		this.style = style;
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
		},
		"current_player_id": function(playerID) {
			if ( getObj("player", playerID) !== undefined ) {
				return true;
			} else {
				return false;
			}
		},
		"current_player_name": function(string) {
			return (_.isString(string));
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
			case "current_page_id": return getPlayerPage(playerID);
			case "number": return '?' + ch('{') + "Number?" + ch('}');
			case "num": return '?' + ch('{') + "Number?" + ch('}');
			case "current_player_id": return playerID;
			case "current_player_name": return getObj("player", playerID).get("displayname");
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
	


    
    var isParameterValid = function parameterTester(paramName, paramValue) {
        if (debug) log("isParameterValid testing: " + paramName + ", " + paramValue); 
        var passed = false;
        var color;
        
		if (_.has(parameterTypes, paramName)) {
			passed = parameterTypes[paramName](paramValue);
			if (!passed) { 
				color = "red";
				psLog("==> Error: " + paramValue + " doesn't match expected type "+ paramName, color ); 

			} else {
				color = "green";                
			}
		
			if (debug) log("paramValue: " + paramValue + " is " + paramName + " === " + passed);
			return passed;			
		} else {
			psLog("==> Error: " + paramName + " is not a registered parameterType. Use: " + _.keys(parameterTypes) + " instead.");
		}

    };

    
    var psLog = function psLogger(string, color) {
        log("psGUI: " + string);
        sendChat("psGui", "/w gm " + "<div style = 'background-color: "+color+"'>"+string+"</div>");
    };

    var ch = function (character) {
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

        if(_.has(entities,character) ){
            return ('&'+entities[character]+';');
        }
        return '';
    };   
	
	var getPlayerPage = function playerPageGetter(playerID) {
		if (debug) log("entering " + info.name + ".getPlayerPage received " + playerID);
		var ribbonPageID = Campaign().get("playerpageid");
		var playerSpecificPages = Campaign().get("playerspecificpages");
		
		// also accepts "gm"
		if (playerID === "gm") {
			playerID = getGameMasterID();
		}
		
		var resultPage; 
		if ( playerIsGM(playerID) ) {			
			var gmObj = getObj("player", playerID );			
			var gmLastPage = gmObj.get("_lastpage");
			if (gmLastPage !== undefined && gmLastPage !== "") {
				resultPage = gmLastPage;
			} else {
				resultPage = ribbonPageID;
			}			
		} else { // it's a regular player: check the ribbon and playerspecificpages
			
			var playerPages = playerSpecificPages; // OBJECT, not JSON string
			if (playerPages !== false && _.has(playerPages, playerID) )  {
				resultPage = playerPages[playerID];
			} else { // all players are on same page
				resultPage = ribbonPageID;
			}
		}
		
		if (debug) log("Leaving getPlayerPage. Returning " + resultPage);
		return resultPage;
	};

	
/*
        _/_/_/  _/    _/  _/_/_/   
      _/        _/    _/    _/      
     _/  _/_/  _/    _/    _/       
    _/    _/  _/    _/    _/        
     _/_/_/    _/_/    _/_/_/     

*/  


        
    var whisper = function whisperer(playerID, chatString) {
        if (debug) log("whisper received: '" + chatString + "', " + playerID);
        var playerName;
        if (playerID === undefined || playerID == "gm") {
            playerName = "gm";
        } else {
            playerName = getObj("player", playerID).get("displayname");
        }
        sendChat("psGui", "/w " + playerName + " " + chatString);
    };

    var makeButton = function buttonMakerForChat(commandStr, userCommandObj) {		
        var output="";

		var label;
		if (userCommandObj !== undefined && _.has(userCommandObj, 'shortDesc') && userCommandObj.shortDesc !== undefined) {
			label = userCommandObj.shortDesc;
		} else {
			label = commandStr;
		}	
		
		//Styling
		if ( userCommandObj !== undefined && _.has(userCommandObj, 'style')) {
			var buttonStyle =  ""; 
			var colour1, colour2, colour3, colour4;
			var gradientStr;
			
			switch (userCommandObj.style) {
				case "aqua":
					colour1 = "aqua";
					colour2 = "cadetblue";
					colour3 = "aquamarine";
					colour4 = "darkblue";
					gradientStr = "bottom, "+colour1+" 18%, "+colour2+" 45%, "+colour3+" 85%";
					buttonStyle +=  "border-radius: 1em; border: 0px;"; 					
					buttonStyle += "padding-left: 8px; padding-right: 8px; padding-top: 3px; padding-bottom: 3px; margin: 2px; ";
					//buttonStyle += "background-image: -webkit-gradient( linear, left top, left bottom, color-stop(0.25, #4BCFD6), color-stop(0.55, #1C21C4), color-stop(0.82, #48CDD4) ); ";
						
					buttonStyle += "background-image: -o-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -moz-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -webkit-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -ms-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: linear-gradient("+gradientStr+"); ";
					
					buttonStyle += "-webkit-box-shadow: "+colour2+" 0px 10px 16px; ";
					buttonStyle += "-moz-box-shadow: "+colour2+" 0px 10px 16px; ";
					
					output += "<a href = '"+commandStr+"' style='"+buttonStyle+"'>";
					output += label;			
					output += "</a>";  
						
				break;
				
				case "material":
					buttonStyle += " margin: 2px; border-radius: 3px; border: 0px; box-shadow: 0 2px 5px 0 rgba(0, 0, 0, 0.26);";
					
					output += "<a href = '"+commandStr+"' style='"+buttonStyle+"'>";
					output += label;			
					output += "</a>";  
					
				break;
				
				case "neon":
					colour1 = "mediumseagreen";
					colour2 = "greenyellow";
					colour3 = "black";
					colour4 = "palegreen";
					gradientStr = "bottom, "+colour1+" 5%, "+colour3+" 10%, "+colour3+" 90%, "+colour1+" 95%";
					
					buttonStyle +=  "border-radius: 0px; border: 1px solid " + colour4 +";"; 					
					buttonStyle += "padding-left: 8px; padding-right: 8px; padding-top: 3px; padding-bottom: 3px; margin: 2px; ";
					//buttonStyle += "background-image: -webkit-gradient( linear, left top, left bottom, color-stop(0.25, #4BCFD6), color-stop(0.55, #1C21C4), color-stop(0.82, #48CDD4) ); ";
					
										
					buttonStyle += "background-image: -o-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -moz-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -webkit-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -ms-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: linear-gradient("+gradientStr+"); ";
					
					
					buttonStyle += "-webkit-box-shadow: inset 0 0 1em "+colour4+", 0 0 1em "+colour2+";";
					buttonStyle += "-moz-box-shadow: inset 0 0 1em "+colour4+", 0 0 1em "+colour2+";";
					
					buttonStyle += "color: " + colour2 + ";";
					
					output += "<a href = '"+commandStr+"' style='"+buttonStyle+"'>";
					output += label;			
					output += "</a>";  
				
				break;
				
				case "fantasy":
					colour1 = "white";
					colour2 = "black";
					colour3 = "darkred";
					colour4 = "gold";
					gradientStr = "bottom, "+colour2+" 10%, "+colour3+" 30%, "+colour3+" 70%, "+colour2+" 90%";
					
					buttonStyle +=  "border-radius: 5px; border: 1px solid "+colour1+";"; 					
					buttonStyle += "padding-left: 8px; padding-right: 8px; padding-top: 3px; padding-bottom: 3px; margin: 2px; ";
					//buttonStyle += "background-image: -webkit-gradient( linear, left top, left bottom, color-stop(0.25, #4BCFD6), color-stop(0.55, #1C21C4), color-stop(0.82, #48CDD4) ); ";
										
					buttonStyle += "background-image: -o-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -moz-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -webkit-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: -ms-linear-gradient("+gradientStr+"); ";
					buttonStyle += "background-image: linear-gradient("+gradientStr+"); ";
					
					
					buttonStyle += "-webkit-box-shadow: inset 0 0 0.5em "+colour1+", 0 0 1em "+colour4+"; ";
					buttonStyle += "-moz-box-shadow: inset 0 0 0.5em "+colour1+", 0 0 1em "+colour4+"; ";

					buttonStyle += "color: "+ colour4 + "; text-shadow: -1px -1px 1px "+colour2+ "; ";
					
					output += "<a href = '"+commandStr+"' style='"+buttonStyle+"'>";
					output += label;			
					output += "</a>";  				
				
				
				break;
				
				default:
					output += '['+label+']('+commandStr+')';				
				break;
			}
		} else {
			output += '['+label+']('+commandStr+')';
		}
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

				var buttonStr = makeButton(inputText, userCommand );
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

			//chatMessage += makeButton(helpFileName);
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
							//log( userCommand.commandName + ": calling: " + String(userCommand.functionToCall)+ ".apply(" + paramsProvided + ")");
							
							if ( userCommand === undefined ) {
								psLog("==>Error: Can't find function for " + userCommand.commandName + ", make sure it's 'exposed' to other modules in the return statement for your module." );
								
							} else {
								if (_.has(userCommand, 'functionToCall') && userCommand.functionToCall !== undefined && _.isFunction(userCommand.functionToCall) ) {
									userCommand.functionToCall.apply(undefined, paramsProvided);
								} else {
									psLog("==>Error: can't find functionToCall for command: " + userCommand.commandName); 									
								}
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
		_/_/_/_/  _/      _/    _/_/    _/      _/  _/_/_/    _/        _/_/_/_/   
	   _/          _/  _/    _/    _/  _/_/  _/_/  _/    _/  _/        _/          
	  _/_/_/        _/      _/_/_/_/  _/  _/  _/  _/_/_/    _/        _/_/_/       
	 _/          _/  _/    _/    _/  _/      _/  _/        _/        _/            
	_/_/_/_/  _/      _/  _/    _/  _/      _/  _/        _/_/_/_/  _/_/_/_/          

*/  
    
    
    
    var initializeUserCommands = function() {
		// example of how to create a user command.
		
		var newUserCommands = [];
        
		var buttonStyleChooserCMD = new psGUI.userCommand();
		var bscCMD = buttonStyleChooserCMD;
		
		bscCMD.listener = "!psGUI";
		bscCMD.commandName = "--chooseButtonStyle";
		bscCMD.functionToCall = function(style, playerName) {
			updateButtonsToStyle(style);
			sendChat(info.name, "/w " + playerName + " Buttons updated to style: " + style );
		};
		bscCMD.parameters = ["string", "current_player_name"];
		bscCMD.shortDesc = "Button Style";
		bscCMD.longDesc = "Choose default style for GUI buttons.";

		var styleSelectorInputString = "?"+ch("{")+"Button Style";
		_.each(buttonStyles, function(buttonStyle) {
			styleSelectorInputString += ch("|")+buttonStyle.name;			
		});
		styleSelectorInputString += ch("}");

		bscCMD.inputOverrides = [styleSelectorInputString, ""];
		bscCMD.group = "Misc";
		newUserCommands.push(bscCMD);
		
		var statusCMD = new psGUI.userCommand();
		statusCMD.listener = "!psGUI";
		statusCMD.commandName = "--status";
		statusCMD.functionToCall = function(playerName) {
			var outputMessage = "";
			outputMessage += "<div>config: " + JSON.stringify(config) + "</div>";
			outputMessage += "state.psGUI: " + JSON.stringify(state.psGUI) + "</div>";
			sendChat(info.name, "/w " + playerName + " " + outputMessage);
		};
		statusCMD.parameters = ["current_player_name"];
		statusCMD.shortDesc = "Status";
		statusCMD.longDesc = "Get information about state.psGUI and psGUI.config";
		statusCMD.group = "Misc"
		newUserCommands.push(statusCMD);
		
		return newUserCommands;
    };

    var updateButtonsToStyle = function buttonStyleChooser(buttonStyle) {        
		config.buttonStyle = buttonStyle;
		state.psGUI.buttonStyle = buttonStyle;

		// **** This might be too heavy handed. Maybe button collections should decide their own styles.
        _.each(userCommands, function(userCommand) {
			userCommand.style = buttonStyle;
		});

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
        if (!_.has(state, 'psGUI')) { // first time running the script
            config = _.clone(defaultConfig);
            state.psGUI = _.clone(config);
			state.psGUI.version = info.version;
  
		} else if (state.psGUI.version !== info.version) { // old version in "memory" (ie: in the roll20 persistent "state" object)
            state.psGUI = _.clone(config);
			state.psGUI.version = info.version;
			log("===---- Updated psGUI State settings ----===");
        } else { // everything looks good. Use the info from state.
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




