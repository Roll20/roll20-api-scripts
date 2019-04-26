var HeroLabImporter = HeroLabImporter || (function() {
    'use strict';
/*******
 * Hero Lab Importer v1.0
 * The purpose of this is to allow people to import their characters directly into Roll20.
 * 
 * This system utilizes a DLL to export characters, but the system can operate manually.
 * 
 * WARNING: This system only supports Pathfinder by Roll20 Character Sheet. Utilizing any other Character sheet will not import the character properly!
 * Source Code for the Custom Hero Lab Exporter can be located at https://github.com/Imper1um/Roll20HLCE
 * 
 * DEFAULT OPTIONS
 * Changing values here will change the default values when it comes down to loading this script. */
  var blockAll = false;     //If true, all options, except --allowall will be disabled.
  var allowPlayer = false;  //If true, players may use the commands in this importer. WARNING: They may create any characters, and can replace Journal entries!
  var outputDebug = false;   //If true, this script will output debug logs.
  var outputVerbose = false; //If true, this script will output verbose logs.
/**
 * !!!!!!!!!!!!!!!!!!!!! All commands begin with !HeroLabImporter !!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 * 
 * Simply copy the lines that were output into the chat window.
 * 
 * NOTE: Due to limitations imposed on Roll20, it is impossible to add API entries in the Journal to any other place other than
 *   the Top-Level of the Journal. If you want this to change, tell the Programmers of Roll20 to allow Journals to be added
 *   into Sub-Folders.
 * 
 * --name <Name>            *REQUIRED IF MODE IS CLEAR OR ADD* This specifies which journal entry to edit.
 * --mode <clear/add>       If clear, it will overwrite all of the options on the journal entry. If add, it will append a new item to the 
 *                              Journal entry. If add, addtype is required
 * --addtype <Type>         This is the prefix name of the repeatable item in the journal entry, for example, skills.
 *                              Note that this is required if mode is add.
 * --set <Key> <Value>      Sets <Key> to <Value> 

 * GLOBAL OPTIONS (GM ONLY):
 * --blockall
 *   Disables all functionality of the TokenTeleporter, except --allowall and --help.
 *
 * --allowall
 *   Enables all functionality of the TokenTeleporter.
 *
 * --toggledebug
 *   Toggles debug output to the log.
 *
 * --toggleverbose
 *   Toggles verbose output to the log.
 * 
 * --allowplayer
 *   Allows players to import characters.
 * 
 * --blockplayer
 *   Blocks players from importing characters.

 * GLOBAL OPTIONS:
 * --help
 *   Shows the help screen.
 */
 	var version = "1.0.4";
	var module = "HeroLabImporter";
	
	//Blame the system that saves these values.
	//Roll20 likes to replace characters when saving to the database.
	var specialCharacterBegin = "\&\#";
	var specialCharacterEnd = ";";
	var openSquirlyNumber = "123";
	var closeSquirlyNumber = "125";
	var openBracketNumber = "91";
	var closeBracketNumber = "93";
	var regExpOpenSquirly = new RegExp(specialCharacterBegin + openSquirlyNumber + specialCharacterEnd, "g");
	var regExpCloseSquirly = new RegExp(specialCharacterBegin + closeSquirlyNumber + specialCharacterEnd, "g");
	var regExpOpenBracket = new RegExp(specialCharacterBegin + openBracketNumber + specialCharacterEnd, "g");
	var regExpCloseBracket = new RegExp(specialCharacterBegin + closeBracketNumber + specialCharacterEnd, "g");
	var openSquirly = specialCharacterBegin + openSquirlyNumber + specialCharacterEnd;
	var closeSquirly = specialCharacterBegin + closeSquirlyNumber + specialCharacterEnd;
	var openBracket = specialCharacterBegin + openBracketNumber + specialCharacterEnd;
	var closeBracket = specialCharacterBegin + closeBracketNumber + specialCharacterEnd;
	
	//Helper Functions
	var toRollable = function(str) {
	    var repl = str.replace(regExpOpenSquirly,"{").replace(regExpCloseSquirly,"}").replace(regExpOpenBracket,"[").replace(regExpCloseBracket,"]");
	    logVerboseOutput("toRollable: " + str + " = " + repl);
	    return repl;
	};
	
	var toReadable = function(str) {
	    var repl = str.replace(/{/g,openSquirly).replace(/}/g,closeSquirly).replace(/\[/g,openBracket).replace(/\]/g,closeBracket);
	    logVerboseOutput("toReadable: " + str + " = " + repl);
	    return repl;
	};
	
	var currentDateOutput = function() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        if (month < 10) { month = "0" + month; }
        if (day < 10) { day = "0" + day; }
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return date.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    };
    
    var setGmNotes = function(token, gmNotesObject) {
        token.set({"gmnotes": JSON.stringify(gmNotesObject)});
    };
    
    var getCharacterImportNotes = function(character) {
        logVerboseOutput("getCharacterGmNotes");
        var gmNotes = null;
        var attr = findObjs({ 
            _type: "attribute",
            name: "HeroLabImportNotes",
            _characterid: character.get("_id")
        });
        if (attr && attr.length) {
            var gmNotes = attr[0].get("current");
            if (!gmNotes) { gmNotes = "{}"; }
            try {
                gmNotes = decodeURIComponent(gmNotes);
            } catch (ex) {
                //Ignore. This may fail when the token is empty.
            }
            if (gmNotes && gmNotes.length) {
                gmNotes = gmNotes.trim();
            }
            try {
                return JSON.parse(gmNotes);
            } catch (ex) {
                //Ignore. this may fail if someone screwed with the property.
                return {};
            }
        } else {
            return {};
        }
    };
    
    var setCharacterImportNotes = function(character, notes) {
        logVerboseOutput("getCharacterGmNotes");
        var attr = findObjs({ 
            _type: "attribute",
            name: "HeroLabImportNotes",
            _characterid: character.get("_id")
        });
        var theAttribute = null;
        if (attr && attr.length) {
            theAttribute = attr[0];
        } else {
            theAttribute = createObj("attribute", {
                name: "HeroLabImportNotes",
                _characterid: character.get("_id")
            });
        }
        theAttribute.set("current", JSON.stringify(notes));
    };
    
    var getGmNotes = function(token) {
        var gmNotes = token.get("gmnotes") || "{}";
        try {
            gmNotes = decodeURIComponent(gmNotes);
        } catch (ex) {
            //Ignore. This may fail when the token is empty.
        }
        if (gmNotes && gmNotes.length) {
            gmNotes = gmNotes.trim();
        }
        return JSON.parse(gmNotes);
    };
	
	var getWhisperTarget = function(options) {
		var nameProperty, targets, type;

		options = options || {};

		if (options.player) {
			nameProperty = 'displayname';
			type = 'player';
		} else if (options.character) {
			nameProperty = 'name';
			type = 'character';
		} else {
			return '';
		}

		if (options.id) {
			targets = [getObj(type, options.id)];

			if (targets[0]) {
				return '/w ' + targets[0].get(nameProperty).split(' ')[0] + ' ';
			}
		}
		if (options.name) {
			targets = _.sortBy(filterObjs(function(obj) {
				if (obj.get('type') !== type) {
					return false;
				}
				return obj.get(nameProperty).indexOf(options.name) >= 0;
			}), function(obj) {
				return Math.abs(levenshteinDistance(obj.get(nameProperty), options.name));
			});

			if (targets[0]) {
				return '/w ' + targets[0].get(nameProperty).split(' ')[0] + ' ';
			}
		}

		return '';
	};
	
	var whisperTalker = function(msg, contents) {
        logVerboseOutput('whisperTalker');
        sendChat(module, getWhisperTarget({"player":true, "id":msg.playerid}) + contents);
    };
    
    var logDebugOutput = function(item) {
        if (!outputDebug) { return; }
        log('['+module+':DEBUG:' + currentDateOutput() + '] ' + item);
    };
	
	var logVerboseOutput = function(item) {
        if (!outputVerbose) { return; }
        log('['+module+':VERBOSE:' + currentDateOutput() + '] ' + item);
    };
    
    var logOutput = function(item) {
        log('['+module+':' + currentDateOutput() + '] ' + item);
    };

	var onChatMessage = function(msg) {
		logVerboseOutput("onChatMessage");
		if (msg.type !== "api") { return; }
		msg.isGM = playerIsGM(msg.playerid);
		logDebugOutput("Message from '" +msg.who + "' Content: " + msg.content);
		var args = msg.content
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+--/);
		var initialCommand = args.shift();
		logOutput("initialCommand: '" + initialCommand + "'");
		if (initialCommand != "!HeroLabImporter") { return; }
		
		var mode = null;
		var name = null;
		var addtype = null;
		var setOptions = [];
		var showOptions = [];

		var setBlockAll = null;
		var setBlockPlayer = null;
		var activateToggleDebug = false;
		var activateToggleVerbose = false;
		
		while (args.length) {
			var commands = args.shift().match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);
            switch (commands.shift()) {
				case 'help':
				    logVerboseOutput("arg: help");
					onHelp(msg);
					return;
				case 'status':
				    logVerboseOutput("arg: status");
					if (msg.isGM) { onStatus(msg); return; }
					onHelp(msg); 
					return;
				case 'toggledebug':
				    logVerboseOutput("arg: toggledebug");
					activateToggleDebug = true;
					break;
				case 'toggleverbose':
				    logVerboseOutput("arg: toggleverbose");
					activateToggleVerbose = true;
					break;
				case 'name':
				    logVerboseOutput("arg: name");
					name = "";
					while (commands.length) {
						name += commands.shift() + " ";
					}
					name = name.trim();
					break;
				case 'set':
				    logVerboseOutput("arg: set");
				    var setKey = commands.shift();
				    var setValue = "";
				    while (commands.length) {
				        setValue += commands.shift() + " ";
				    }
				    logVerboseOutput("key = " + setKey + ", value = " + setValue.trim());
				    setOptions.push({'key':setKey, 'value':setValue.trim()});
				    break;
				case 'mode':
				    logVerboseOutput("arg: mode");
				    mode = commands.shift();
				    break;
				case 'addtype':
				    logVerboseOutput("arg: addtype");
				    addtype = commands.shift();
				    break;
				case 'toggledebug':
				    logVerboseOutput("arg: toggledebug");
					activateToggleDebug = true;
					break;
				case 'toggleverbose':
				    logVerboseOutput("arg: toggleverbose");
					activateToggleVerbose = true;
					break;
				case 'blockall':
				    logVerboseOutput("arg: blockall");
					setBlockAll = true;
					break;
				case 'allowall':
				    logVerboseOutput("arg: allowall");
					setBlockAll = false;
					break;
				case 'blockplayer':
				    logVerboseOutput("arg: blockplayer");
					setBlockPlayer = true;
					break;
				case 'allowplayer':
				    logVerboseOutput("arg: allowplayer");
					setBlockPlayer = false;
					break;
				case 'showoption':
				    logVerboseOutput("arg: showoption");
				    showOptions.push(commands.shift());
				    break;
                case 'finish':
                    whisperTalker(msg, name + " has been imported.");
                    break;
            }
		}
		
		//Start with the Global Commands.
		if (msg.isGM) {
		    logVerboseOutput("isGM");
			if (setBlockAll != null) {
				logVerboseOutput("setBlockAll: " + setBlockAll);
				blockAll = setBlockAll;
				if (blockAll) {
					whisperTalker(msg, "All blocking enabled.");
					return;
				} else {
					whisperTalker(msg, "All blocking disabled.");
				}
			}
			if (setBlockPlayer != null) {
				logVerboseOutput("setBlockPlayer: " + setBlockPlayer);
				blockPlayer = setBlockPlayer;
				if (blockPlayer) {
					whisperTalker(msg, "Player blocking enabled.");
					return;
				} else {
					whisperTalker(msg, "Player blocking disabled.");
				}
			}
			if (activateToggleDebug) {
				toggleDebug();
				if (outputDebug) {
					whisperTalker(msg, "Debug output enabled.");
				} else {
					whisperTalker(msg, "Debug output disabled.");
				}
			}
			if (activateToggleVerbose) {
				toggleVerbose();
				if (outputVerbose) {
					whisperTalker(msg, "Verbose output enabled.");
				} else {
					whisperTalker(msg, "Verbose output disabled.");
				}
			}
		}
		
		if (!msg.isGM && !allowPlayer) {
		    return;
		}
		
		var journalEntry = null;
		var curId = null;
		if (mode == "clear") {
		    var possibleEntries = findObjs({
		        _type: "character",
		        name: name
		    });
		    if (possibleEntries && possibleEntries.length) {
		        journalEntry = possibleEntries[0];
		        
		    } else {
		        journalEntry = createObj("character", {
		            _type: "character",
		            name: name
		        });
		    }
		} else if (mode == "setallinactive") {
		    var possibleEntries = findObjs({
		        _type: "character",
		        controlledby: "",
		        inplayerjournals: ""
		    });
		    var entriesChanged = [];
		    _.each(possibleEntries, function(entry) {
		        logVerboseOutput("setallinactive: " + entry.get("name"));
		        var id = entry.get("_id");
		        _.each(setOptions, function(setOption){ 
		            var optionValue = toRollable(setOption.value);
        		    logVerboseOutput("setAttr: " + setOption.key + " = " + optionValue);
        		    var attrName = getAttrName(setOption.key, addtype, curId);
        		    var attr = findObjs({
        		        _type: "attribute",
        		        name: attrName,
        		        _characterid: id
        		    });
        		    var theAttribute = null;
        		    if (attr && attr.length) {
        		        logVerboseOutput("attrExists");
        		        theAttribute = attr[0];
        		    } else {
        		        logVerboseOutput("attrDoesNotExist");
        		        theAttribute = createObj("attribute", {
        		            name: attrName,
        		            _characterid: id
        		        });
        		    }
        		    if (getAttrSet(setOption.key) == "max") {
        		        if (theAttribute.get("max") != optionValue) {
        		            theAttribute.setWithWorker({max: optionValue});
        		            entriesChanged.push(entry.get("name") + "| " + attrName + ":max set");
        		        }
        		    } else {
        		        if (theAttribute.get("current") != optionValue) {
        		            theAttribute.setWithWorker({current: optionValue});
        		            entriesChanged.push(entry.get("name") + "| " + attrName + ":current set");
        		        }
        		    }
    		    });
		    });
		    var entryInformation = "Entries modified:<ul>";
		    _.each(entriesChanged, function(ent) {
		       entryInformation += "<li>" + ent + "</li>";
		    });
		    entryInformation += "</ul>";
		    whisperTalker(msg, entryInformation);
		    return;
		} else {
		    var possibleEntries = findObjs({
		        _type: "character",
		        name: name
		    });
		    if (possibleEntries && possibleEntries.length) {
		        journalEntry = possibleEntries[0];
		        
		    } else {
		        whisperTalker("Not found!");
		        return;
		    }
		}
		var gmNotes = getCharacterImportNotes(journalEntry);
		
	    if (mode == "clear") {
	        gmNotes = {};
	    }
		if (gmNotes.HeroLabImporter === undefined) {
		    gmNotes.HeroLabImporter = {};
		}
		if (addtype) {
		    if (gmNotes.HeroLabImporter[addtype]) {
		        curId = gmNotes.HeroLabImporter[addtype];
		    } else {
		        curId = 0;
		    }
		    gmNotes.HeroLabImporter[addtype] = curId + 1;
		}
	
		//Now, we iterate through each of the items.
		_.each(setOptions, function(setOption){
		    var optionValue = toRollable(setOption.value);
		    logVerboseOutput("setAttr: " + setOption.key + " = " + optionValue);
		    var attr = findObjs({
		        _type: "attribute",
		        name: getAttrName(setOption.key, addtype, curId),
		        _characterid: journalEntry.get("_id")
		    });
		    var theAttribute = null;
		    if (attr && attr.length) {
		        logVerboseOutput("attrExists");
		        theAttribute = attr[0];
		    } else {
		        logVerboseOutput("attrDoesNotExist");
		        theAttribute = createObj("attribute", {
		            name: getAttrName(setOption.key, addtype, curId),
		            _characterid: journalEntry.get("_id")
		        });
		    }
		    if (getAttrSet(setOption.key) == "max") {
		        theAttribute.setWithWorker({max: optionValue});
		    } else {
		        theAttribute.setWithWorker({current: optionValue});
		    }
		});

		_.each(showOptions, function(option) {
		   var attr = findObjs({
		       _type: "attribute",
		       name: option,
		       _characterid: journalEntry.get("_id")
		   });

		   if (attr && attr.length) {
		       logVerboseOutput("attrExistsToFind");
		       var current = toReadable(attr[0].get("current"));
		       var max = toReadable(attr[0].get("max"));
		       whisperTalker(msg, option + " = '" + current + "'/'" + max + "'");
		   } else {
		       whisperTalker(msg, option + " does not exist");
		   }
		});
		
	    setCharacterImportNotes(journalEntry, gmNotes);
	};	
	
	var getAttrSet = function(key) {
	    if (key.includes('!')) {
	        return key.split('!')[1];
	    }
	    return "current";
	}
	
	var getAttrName = function(key, addtype, curId) {
	    var actualKey = key;
	    if (key.includes('!')) {
	        actualKey = key.split('!')[0];
	    }
	    if (addtype) {
	        return 'repeating_' + addtype + '_' + curId + '_' + actualKey;
	    } else {
	        return actualKey;
	    }
	}

	var onStatus = function(msg) {
		logVerboseOutput("onStatus");
		var message = "Roll20 Hero Lab Importer System Status -- RUNNING<ul>";
		var enabled = '<li style="color: #060;">';
		var blocked = '<li style="color: #600;">';
		if (blockAll) {
			message += blocked + "BlockAll enabled. Use --allowall to unblock.";
		} else {
			message += enabled + "BlockAll Disabled.</li>";
			message += statusMessage(blockPlayer, "Player usage");
			message += statusMessage(!outputDebug, "Debug output");
			message += statusMessage(!outputVerbose, "Verbose output");
		}
		message += "</ul>";
		whisperTalker(msg, message);
	};
	
	var onHelp = function(msg) {
		logVerboseOutput("onHelp");
		
		var hangingLi = '<li style="padding-left: 1.5em; text-indent:-1.5em; margin-bottom: 14px;">';
		var ul = '<ul style="list-style-type: none;">';
		var returnMessage = '<div style="border: solid 1px #000; background-color: #FFF; padding: 3px; width: 100%">'
            + '<div style="padding: 5px; background-color: #FFC; font-weight: bold; text-align: center; margin: 5px; width: 100%; font-size: 14px;">'+module+' v' + version + '<br />by Zachare Sylvestre</div>' +
            + 'This API addon allows players to import Pathfinder characters made in HeroLab into Roll20 without much fuss.<br />'
			+ '<br />'
			+ '<span style="color: #F00;">NOTE:</span> All commands begin with !HeroLabImporter</span><br />';
		if (msg.isGM && !blockAll) {
			returnMessage += '<h5>Global Options (GM Only)</h5>' + ul;
			returnMessage += hangingLi + '<strong>--blockall</strong><br />Disables all functionality of the HeroLabImporter, except --allowall and --help.</li>';
			if (!allowPlayer) {
				returnMessage += hangingLi + '<strong>--allowplayer</strong><br />Enables players to import characters.</li>';
			} else {
				returnMessage += hangingLi + '<strong>--blockplayer</strong><br />Disables players from importing characters.</li>';
			}
			returnMessage += hangingLi + '<strong>--toggledebug</strong><br />Toggles debug output to the log.</li>';
			returnMessage += hangingLi + '<strong>--toggleverbose</strong><br />Toggles verbose output to the log.</li>';
			returnMessage += hangingLi + '<strong>--status</strong><br />Shows the system status to the user.</li>';
			returnMessage += "</ul>";
		}
		else if (msg.isGM && blockAll) {
			returnMessage += "<h5>Global Options (GM Only)</h5>"
				+ ul
				+ hangingLi + '<strong>--allowall</strong><br/>Enables all functionality of the TokenTeleporter.</li>'
				+ "</ul>";
		}
		else if (!msg.isGM && (blockAll || !allowPlayer)) {
			returnMessage += "All commands are currently off for non-GMs.";
		}
		if (!blockAll && (allowPlayer || msg.isGM)) {
			returnMessage += "<h5>Submission Options (All Users)</h5>"
				+ ul
				+ hangingLi + 'Simply copy the text from the importer into the chat to import your character!</li>'
				+ '</ul>';
		}
		returnMessage += "</div>";
		whisperTalker(msg, returnMessage);
	};
	
	//Activator Functions
	var registerEventHandlers = function() {
		on('chat:message', onChatMessage);
		logOutput("Event Handlers Registered.");
	};
	//Public Functions 
	var setGlobalBlocking = function(val) {
		blockAll = val;
	};
	
	var toggleDebug = function() {
		outputDebug = !outputDebug;
		if (outputDebug) {
			logOutput("Debug output enabled.");
		} else {
			logOutput("Debug output disabled.");
		}
	};
	
	var toggleVerbose = function() {
		outputVerbose = !outputVerbose;
		if (outputVerbose) {
			logOutput("Verbose output enabled.");
		} else {
			logOutput("Verbose output disabled.");
		}
	};
	
	var isDebugOn = function() {
		return outputDebug;
	};
	
	var isVerboseOn = function() {
		return outputVerbose;
	};
	
	var onReady = function() {
		logOutput('v' + version + ' starting up...');
		registerEventHandlers();
		logOutput('Successfully loaded.');
		logOutput("Verbose: " + isVerboseOn());
		logOutput("Debug: " + isDebugOn());
	};
	
	return {
		SetGlobalBlocking: setGlobalBlocking,
		OnReady: onReady,
		IsDebugOn: isDebugOn,
		IsVerboseOn: isVerboseOn,
		ToggleDebug: toggleDebug,
		ToggleVerbose: toggleVerbose
	}
})();

on("ready", function() {
    'use strict';
    HeroLabImporter.OnReady();
});