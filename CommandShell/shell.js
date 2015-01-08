var Shell = Shell || {
    commands: {},

    // I/O functions

    rawWrite: function(s, to, style, from){
	s = s.replace(/\n/g, "<br>");
	s = "<div style=\"white-space: pre-wrap; padding: 0px; margin: 0px" + (style ? "; " + style : "") + "\">" + s + "</div>";
	if (to){
	    s = "/w " + to.split(" ", 1)[0] + " " + s;
	}
	sendChat((typeof(from) == typeof("") ? from : "Shell"), s);
    },

    write: function(s, to, style, from){
	Shell.rawWrite(s.replace(/</g, "&lt;").replace(/>/g, "&gt;"), to, style, from);
    },

    writeAndLog: function(s, to){
	Shell.write(s, to);
	_.each(s.split("\n"), log);
    },

    writeErr: function(s){
	Shell.writeAndLog(s, "gm");
    },


    // command registration

    registerCommand: function(cmd, sig, desc, fn){
	// error checking
	if (!cmd){
	    var errMsg = "Error: Cannot register empty command";
	    if (sig){
		errMsg += " (signature: " + sig + ")";
	    }
	    Shell.writeErr(errMsg);
	    return;
	}
	if (!fn){
	    Shell.writeErr("Error: Cannot register command \"" + cmd + "\" without a callback");
	    return;
	}

	// fix up the arguments if necessary
	if (cmd.charAt(0) != '!'){
	    cmd = "!" + cmd;
	}
	if (!sig){
	    sig = cmd;
	}

	// check for already-registered command of the same name
	if (Shell.commands[cmd]){
	    if ((Shell.commands[cmd].signature != sig) || (Shell.commands[cmd].description != desc) || (Shell.commands[cmd].callback != fn)){
		Shell.writeErr("Error: Command with name \"" + cmd + "\" already registered");
	    }
	    return;
	}

	// register command
	Shell.commands[cmd] = {
	    signature:		sig,
	    description:	desc,
	    callback:		fn
	};
    },

    unregisterCommand: function(cmd){
	// error checking
	if (!cmd){
	    Shell.writeErr("Error: Cannot unregister empty command");
	    return;
	}

	// fix up argument if necessary
	if (cmd.charAt(0) != '!'){
	    cmd = "!" + cmd;
	}

	// verify command exists
	if (!Shell.commands[cmd]){
	    Shell.writeErr("Error: Command \"" + cmd + "\" not registered");
	    return;
	}

	// unregister command
	delete Shell.commands[cmd];
	if (state.Shell.userPermissions[cmd]){
	    delete state.Shell.userPermissions[cmd];
	}
    },


    // utility functions

    tokenize: function(s){
	var retval = [];
	var curTok = "";
	var quote = false;
	while (s.length > 0){
	    if (quote){
		// in quoted string; look for terminating quote
		var idx = s.indexOf(quote);
		if (idx < 0){
		    return "Error: Unmatched " + quote;
		}
		curTok += s.substr(0, idx);
		s = s.substr(idx + 1);
		quote = "";
		continue;
	    }
	    var idx = s.search(/[\s'"]/);
	    if (idx < 0){
		// no more quotes or whitespace, just add the rest of the string to the current token and terminate
		curTok += s;
		if (curTok){
		    retval.push(curTok);
		}
		break;
	    }
	    curTok += s.substr(0, idx);
	    var c = s.charAt(idx);
	    s = s.substr(idx + 1);
	    if ((c == "'") || (c == '"')){
		// got a quote; start quoted string
		quote = c;
	    }
	    else{
		// got whitespace; push current token and start looking for a new token
		if (curTok){
		    retval.push(curTok);
		}
		curTok = "";
	    }
	}
	return retval;
    },


    // built-in commands

    helpCommand: function(args, msg){
	var commandKeys = [];
	for (var cmd in Shell.commands){
	    if (Shell.hasPermission(msg, cmd)){
		commandKeys.push(cmd);
	    }
	}
	commandKeys.sort();
	var helpMsg = "";
	for (var i = 0; i < commandKeys.length; i++){
	    helpMsg += (i > 0 ? "\n" : "") + Shell.commands[commandKeys[i]].signature;
	    if (Shell.commands[commandKeys[i]].description){
		helpMsg += "\n\t" + Shell.commands[commandKeys[i]].description;
	    }
	}
	if (helpMsg){
	    Shell.write("Shell Commands:", msg.who);
	    Shell.write(helpMsg, msg.who, "font-size: small");
	}
    },

    permissionCommand: function(args, msg){
	function showHelp(){
	    Shell.write(args[0] + " add <command> [player]", msg.who);
	    Shell.write("\tAdd permission for specified player to execute specified command.", msg.who);
	    Shell.write("\tIf no player is specified, adds world-execute permission.", msg.who);
	    Shell.write(args[0] + " remove <command> [player]", msg.who);
	    Shell.write("\tRemove permission for specified player to execute specified command.", msg.who);
	    Shell.write("\tIf no player is specified, removes world-execute permission.", msg.who);
	}

	if ((args.length > 1) && ((args[1] == "-h") || (args[1] == "--help") || (args[1] == "help"))){
	    showHelp();
	    return;
	}
	if (args.length < 3){
	    Shell.write(args[0] + " requires at least two arguments: add|remove and a command", msg.who);
	    showHelp();
	    return;
	}
	if (!args[2]){
	    Shell.write("Unrecognized command: \"\"", msg.who);
	    showHelp();
	    return;
	}
	var cmd = args[2];
	if (cmd.charAt(0) != '!'){
	    cmd = "!" + cmd;
	}
	if (!Shell.commands[cmd]){
	    Shell.write("Unrecognized command: " + cmd, msg.who);
	    return;
	}

	var playerId = (args.length > 3 ? args[3] : "");
	if (playerId){
	    var players = _.union(findObjs({_type: "player", _displayname: playerId}), findObjs({_type: "player", _d20userid: playerId}));
	    if (players.length > 1){
		Shell.write("Found more than one user matching " + playerId, msg.who);
	    }
	    if (players.length < 1){
		Shell.write("Unable to find user matching " + playerId, msg.who);
		players = findObjs({_type: "player"});
	    }
	    if (players.length != 1){
		Shell.write("Please try again using one of: " + (_.map(players, function(p){ return p.get('_d20userid'); })).join(", "), msg.who);
		return;
	    }
	    playerId = players[0].id;
	}

	switch (args[1]){
	case "add":
	    // add userId to state.Shell.userPermissions[cmd] (if not already present), making sure to keep the list sorted
	    if (!state.Shell.userPermissions[cmd]){
		state.Shell.userPermissions[cmd] = [];
	    }
	    if (_.contains(state.Shell.userPermissions[cmd], playerId)){ return; }
	    state.Shell.userPermissions[cmd].splice(_.sortedIndex(state.Shell.userPermissions[cmd], playerId), 0, playerId);
	    break;
	case "remove":
	    // remove playerId from state.Shell.userPermissions[cmd] (if present)
	    if (!state.Shell.userPermissions[cmd]){ return; }
	    var idx = state.Shell.userPermissions[cmd].indexOf(playerId);
	    if (idx < 0){ return; }
	    state.Shell.userPermissions[cmd].splice(idx, 1);
	    break;
	default:
	    Shell.write("Unrecognized operation: " + args[1], msg.who);
	    showHelp();
	    return;
	}
    },


    // internal functions

    isFromGM: function(msg){
	// try to determine if message sender is GM from msg
	var player = getObj("player", msg.playerid);
	if ((player.get('speakingas') == "") || (player.get('speakingas') == "player|" + msg.playerid)){
	    return msg.who != player.get('_displayname');
	}

	// couldn't figure it out from msg; try to use isGM if it exists
	// we'd try this first if there were a way to tell the difference between "player not GM" and "player GM status unknown"
	if ((typeof(isGM) != "undefined") && (isGM) && (_.isFunction(isGM))){
	    return isGM(msg.playerid);
	}
    },

    hasPermission: function(msg, cmd){
	if (Shell.isFromGM(msg)){ return true; }
	if (state.Shell.userPermissions[cmd]){
	    if (_.contains(state.Shell.userPermissions[cmd], msg.playerid, true)){ return true; }
	    if (_.contains(state.Shell.userPermissions[cmd], "", true)){ return true; }
	}
/////
//
	//maybe add handling for groups
//
/////
	return false;
    },

    handleChatMessage: function(msg){
	if (msg.type != "api"){ return; }

	// tokenize command string
	var tokens = Shell.tokenize(msg.content);
	if (typeof(tokens) == typeof("")){
	    Shell.writeAndLog(tokens, msg.who);
	    return;
	}
	if (tokens.length <= 0){ return; }

	if (!Shell.commands[tokens[0]]){
	    // ignore unregistered command
	    return;
	}

	if (!Shell.hasPermission(msg, tokens[0])){
	    Shell.write("Error: You do not have permission to execute command " + tokens[0]);
	    return;
	}

	// execute command callback
	Shell.commands[tokens[0]].callback(tokens, _.clone(msg));
    },

    init: function(){
	// initialize stored state
	state.Shell = state.Shell || {};
	state.Shell.userPermissions = state.Shell.userPermissions || {};

	// register built-in commands
	Shell.registerCommand("!help", "!help", "Show this help message", Shell.helpCommand);
	state.Shell.userPermissions["!help"] = [""];
	Shell.registerCommand("!shell-permission", "!shell-permission add|remove <command> [player]",
			    "Add or remove permission for specified command", Shell.permissionCommand);

	// register chat event handler
	on("chat:message", Shell.handleChatMessage);
    }
};

on("ready", Shell.init);
