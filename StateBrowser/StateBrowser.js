var StateBrowser = StateBrowser || {
    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd){
	var helpMsg = "";
	helpMsg += "Usage: " + cmd + " [PATH]\n";
	helpMsg += "  or:  " + cmd + " -s PATH VALUE\n";
	helpMsg += "  or:  " + cmd + " -d PATH\n";
	helpMsg += "In the first form, the value of the specified object within state (or all of state) is displayed.\n";
	helpMsg += "In the second form, the specified object within state is set to the specified value.\n";
	helpMsg += "In the third form, the specified object within state is deleted.\n";
	StateBrowser.write(helpMsg, who, "", "State");
	helpMsg = "Arguments:\n";
	helpMsg += "  Paths are specified in dot-notation.  For example, to access state.foo.bar, use '" + cmd + " foo.bar'.\n";
	helpMsg += "  Values are specified in JSON.  Note that this means strings must be quoted twice: once for the shell and once for the JSON.\n";
	helpMsg = "Options:\n";
	helpMsg += "  -h, --help                display this help message\n";
	helpMsg += "  -s, --set                 set the value of an already-existing object within state\n";
	helpMsg += "  -S, --forceset            set the value of an object within state, creating it if necessary\n";
	helpMsg += "  -d, --delete              delete an object within state; will prompt for confirmation\n";
	helpMsg += "  -D, --forcedelete         delete an object within state without prompting for confirmation\n";
	StateBrowser.write(helpMsg, who, "font-size: small; font-family: monospace", "State");
    },

    handleStateBrowserMessage: function(tokens, msg){
	var doSet = false, doDelete = false, force = false, args = [];
	for (var i = 1; i < tokens.length; i++){
	    switch (tokens[i]){
	    case "-S":
	    case "--forceset":
		force = true;
		// fall through
	    case "-s":
	    case "--set":
		doSet = true;
		break;
	    case "-D":
	    case "--forcedelete":
		force = true;
		// fall through
	    case "-d":
	    case "--delete":
		doDelete = true;
		break;
	    case "-h":
	    case "--help":
		return StateBrowser.showHelp(msg.who, tokens[0]);
	    default:
		args.push(tokens[i]);
	    }
	}
	if ((doSet) && (doDelete)){
	    StateBrowser.write("Error: Cannot mix set and delete operations", msg.who, "", "State");
	    return StateBrowser.showHelp(msg.who, tokens[0]);
	}

	var path = [], pathStr = "state", parentObj = state, lastKey;
	if (args.length > 0){
	    path = args[0].split(".");
	    pathStr += "." + args[0];
	    for (var i = 0; i < path.length - 1; i++){
		parentObj = parentObj[path[i]];
		if (!parentObj){ break; }
	    }
	    lastKey = path[path.length - 1];
	}

	if (doSet){
	    if (args.length < 2){
		StateBrowser.write("Error: Must specify path and value", msg.who, "", "State");
		return StateBrowser.showHelp(msg.who, tokens[0]);
	    }
	    if (args.length > 2){
		args[1] = args.slice(1).join(" ");
	    }
	    var val;
	    try{
		val = JSON.parse(args[1]);
	    }
	    catch (e){
		StateBrowser.write("Error: Invalid value: " + args[1], msg.who, "", "State");
		return;
	    }
	    if ((force) && (!parentObj)){
		parentObj = state;
		for (var i = 0; i < path.length - 1; i++){
		    if (!parentObj.hasOwnProperty(path[i])){
			parentObj[path[i]] = {};
		    }
		    parentObj = parentObj[path[i]];
		}
	    }
	    if (!parentObj){
		StateBrowser.write("Error: Object " + pathStr + " does not exist", msg.who, "", "State");
		return;
	    }
	    if ((!parentObj.hasOwnProperty(lastKey)) && (!force)){
		StateBrowser.write("Error: Object " + pathStr + " does not exist", msg.who, "", "State");
		return;
	    }
	    parentObj[lastKey] = val;
	    StateBrowser.write("Set " + pathStr + ":", msg.who, "", "State");
	    StateBrowser.write(JSON.stringify(val, undefined, 2) || "undefined", msg.who, "", "State");
	}
	else if (doDelete){
	    if (args.length < 1){
		StateBrowser.write("Error: Must specify path to delete", msg.who, "", "State");
		return StateBrowser.showHelp(msg.who, tokens[0]);
	    }
	    if (args.length > 1){
		StateBrowser.write("Error: Unrecognized argument: " + args[1], msg.who, "", "State");
		return StateBrowser.showHelp(msg.who, tokens[0]);
	    }
	    if (!parentObj){
		StateBrowser.write("Error: Object " + pathStr + " does not exist", msg.who, "", "State");
		return;
	    }
	    if (!parentObj.hasOwnProperty(lastKey)){
		StateBrowser.write("Error: Object " + pathStr + " does not exist", msg.who, "", "State");
		return;
	    }
	    if (!force){
		var obj = parentObj[lastKey];
		StateBrowser.write(pathStr + ":", msg.who, "", "State");
		StateBrowser.write(JSON.stringify(obj, undefined, 2) || "undefined", msg.who, "", "State");
		StateBrowser.write("Confirm deletion? [Yes](" + tokens[0] + " -D " + args[0] + ")", msg.who, "", "State");
		return;
	    }
	    delete parentObj[lastKey];
	    StateBrowser.write("Deleted " + pathStr);
	}
	else{
	    if (args.length > 1){
		StateBrowser.write("Error: Unrecognized argument: " + args[1], msg.who, "", "State");
		return StateBrowser.showHelp(msg.who, tokens[0]);
	    }
	    if (!parentObj){
		StateBrowser.write("Error: Object " + pathStr + " does not exist", msg.who, "", "State");
		return;
	    }
	    var obj = state;
	    if (path.length > 0){
		if (!parentObj.hasOwnProperty(lastKey)){
		    StateBrowser.write("Error: Object " + pathStr + " does not exist", msg.who, "", "State");
		    return;
		}
		obj = parentObj[lastKey];
	    }
	    StateBrowser.write(pathStr + ":", msg.who, "", "State");
	    StateBrowser.write(JSON.stringify(obj, undefined, 2) || "undefined", msg.who, "", "State");
	}
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (msg.content.indexOf("!state") !=0 )){ return; }

	return StateBrowser.handleStateBrowserMessage(msg.content.split(" "), msg);
    },

    registerStateBrowser: function(){
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!state", "!state [options] [path] [value]", "View/modify the state object", StateBrowser.handleStateBrowserMessage);
	    if (Shell.write){
		StateBrowser.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", StateBrowser.handleChatMessage);
	}
    }
};

on("ready", function(){ StateBrowser.registerStateBrowser(); });
