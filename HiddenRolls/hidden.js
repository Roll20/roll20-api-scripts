var HiddenRolls = HiddenRolls || {
    COMMANDS: ["!hideroll", "!hiderolls", "!hidetotal", "!hidetotals", "!hideall", "!help"],

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who){
	var helpMsg = "";
	helpMsg += "Usage: !hideroll(s) [options] command\n";
	helpMsg += "  or:  !hidetotal(s) [options] command\n";
	helpMsg += "  or:  !hideall [options] command\n";
	helpMsg += "!hideroll and !hiderolls hide roll results, only displaying the total.\n";
	helpMsg += "!hidetotal and !hidetotals hide result totals, only displaying the roll values.\n";
	helpMsg += "!hideall hides rolls and totals, only displaying the roll formula.\n";
	HiddenRolls.write(helpMsg, who, "", "HR");
	helpMsg = "Options:\n";
	helpMsg += "  -h, --help:       display this help message\n";
	helpMsg += "  -v, --verbose:    generate additional output as follows:\n";
	helpMsg += "                        !hideroll(s):  whisper full results to GM\n";
	helpMsg += "                        !hidetotal(s): whisper full results to sender\n";
	helpMsg += "                        !hideall:      send expression to global chat\n";
	HiddenRolls.write(helpMsg, who, "font-size: small; font-family: monospace", "HR");
    },

    generateExpression: function(who, rolls, diceOnly){
	if (!rolls){ return null; }

	var retval = "";
	for (var i = 0; i < rolls.length; i++){
	    var r = rolls[i];
/////
//
	    //handle r.mods; for now, just acknowledge that we can't
	    if (r.mods){ return null; }
//
/////
	    switch(r.type){
	    case "C":
		// comment; just append it onto the expression
		retval += r.text;
		break;
	    case "M":
		// math; just append it onto the expression
		if ((diceOnly) && (r.expr.length > 1)){
		    retval += "+0[hidden] ";
		}
		else{
		    retval += r.expr;
		}
		break;
	    case "L":
		// label; add it to the expression as a label
		if (diceOnly){ break; }
		retval += "[" + r.text + "] ";
		break;
	    case "R":
		// roll; add result of each die to 1d0 so we can label the results like dice
		retval += "{1d0";
		for (var j = 0; j < r.results.length; j++){
		    retval += "+" + r.results[j].v;
		    if (r.results[j].d){
			// dropped die; display as "Vd0", where V was the value
			retval += "d0";
		    }
		}
		retval += "}";
		retval += "[" + r.dice + "d" + r.sides + "] ";
		break;
	    case "G":
		var subExp = HiddenRolls.generateExpression(who, r.rolls[0], diceOnly);
		if (!subExp){ return null; }
		retval += "{" + subExp;
		for (var j = 1; j < r.rolls.length; j++){
		    subExp = HiddenRolls.generateExpression(who, r.rolls[j], diceOnly);
		    if (!subExp){ return null; }
		    retval += "," + subExp;
		}
		retval += "}";
		break;
	    default:
		// unrecognized type; just return the expression unmodified
		HiddenRolls.write("Unrecognized roll result type: " + r.type, who, "", "HiddenRolls");
		return null;
	    }
	}
	return retval;
    },

    handleHideMessage: function(tokens, msg){
	if (tokens.length < 2){
	    return HiddenRolls.showHelp(msg.who);
	}

	var verbose = false;
	var cmd = msg.content.replace(/^\S+\s+/, "");
	var inlineRolls = msg.inlinerolls || [];

	if ((tokens[1] == "-h") || (tokens[1] == "--help")){
	    return HiddenRolls.showHelp(msg.who);
	}

	if ((tokens[1] == "-v") || (tokens[1] == "--verbose")){
	    verbose = true;
	    cmd = cmd.replace(/^\S+\s+/, "");
	}

	if (msg.rolltemplate){
	    cmd = "&{template:" + msg.rolltemplate + "} " + cmd;
	}

	switch(tokens[0]){
	case "!hideroll":
	case "!hiderolls":
	    // hide rolls; display only totals (e.g. "ogre attacks: [[1d20+7]] to hit" => "ogre attacks: [[18]] to hit")
	    var replaceInlines = function(s){
		if (!inlineRolls){ return s; }
		var i = parseInt(s.substring(3, s.length - 2));
		if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i].results)){ return s; }
		return "[[" + inlineRolls[i].results.total + "]]";
	    };
	    sendChat(msg.who, cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines));
	    if (verbose){
		// verbose mode: whisper original formula to gm with roll results substituted in
		replaceInlines = function(s){
		    if (!inlineRolls){ return s; }
		    var i = parseInt(s.substring(3, s.length - 2));
		    if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i].results)){ return s; }
		    var expr = HiddenRolls.generateExpression(msg.who, inlineRolls[i].results.rolls);
		    return (expr ? "[[" + expr + "]]" : inlineRolls[i].expression);
		};
		sendChat(msg.who, "/w gm " + cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines));
	    }
	    break;
	case "!hidetotal":
	case "!hidetotals":
	    // hide totals; display only dice rolls
	    var replaceInlines = function(s){
		if (!inlineRolls){ return s; }
		var i = parseInt(s.substring(3, s.length - 2));
		if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i].results)){ return s; }
		var expr = HiddenRolls.generateExpression(msg.who, inlineRolls[i].results.rolls, true);
		return (expr ? "[[" + expr + "]]" : inlineRolls[i].expression);
	    };
	    sendChat(msg.who, cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines));
	    // whisper totals to gm
	    replaceInlines = function(s){
		if (!inlineRolls){ return s; }
		var i = parseInt(s.substring(3, s.length - 2));
		if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i].results)){ return s; }
		var expr = HiddenRolls.generateExpression(msg.who, inlineRolls[i].results.rolls);
		return (expr ? "[[" + expr + "]]" : inlineRolls[i].expression);
	    };
	    var hiddenCmd = cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines);
	    sendChat(msg.who, "/w gm " + hiddenCmd);
	    if ((verbose) && (!playerIsGM(msg.playerid))){
		// verbose mode: whisper totals to original sender too
		sendChat(msg.who, "/w " + msg.who.split(" ", 1)[0] + " " + hiddenCmd);
	    }
	    break;
	case "!hideall":
	    // whisper results to gm
	    var replaceInlines = function(s){
		if (!inlineRolls){ return s; }
		var i = parseInt(s.substring(3, s.length - 2));
		if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i].expression)){ return s; }
		return "[[" + inlineRolls[i].expression + "]]";
	    };
	    sendChat(msg.who, "/w gm " + cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines));
	    replaceInlines = function(s){
		if (!inlineRolls){ return s; }
		var i = parseInt(s.substring(3, s.length - 2));
		if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i].expression)){ return s; }
		return "[" + inlineRolls[i].expression + "]";
	    };
	    var cmdExpr = cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines);
	    if (verbose){
		// verbose mode: send expression to global chat
		sendChat(msg.who, cmdExpr);
	    }
	    else if (!playerIsGM(msg.playerid)){
		// normal mode: whisper expression to sender
		sendChat(msg.who, "/w " + msg.who.split(" ", 1)[0] + " " + cmdExpr);
	    }
	    break;
	default:
	    return HiddenRolls.showHelp(msg.who);
	}
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (HiddenRolls.COMMANDS.indexOf(msg.content.split(" ", 1)[0]) < 0)){ return; }

	return HiddenRolls.handleHideMessage(msg.content.split(" "), msg);
    },

    registerHiddenRolls: function(){
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!hideroll", "!hideroll [--verbose] command", "Display only roll totals in command", HiddenRolls.handleHideMessage);
	    Shell.registerCommand("!hiderolls", "!hiderolls [--verbose] command", "Display only roll totals in command", HiddenRolls.handleHideMessage);
	    Shell.registerCommand("!hidetotal", "!hidetotal [--verbose] command", "Display only raw rolls in command", HiddenRolls.handleHideMessage);
	    Shell.registerCommand("!hidetotals", "!hidetotals [--verbose] command", "Display only raw rolls in command", HiddenRolls.handleHideMessage);
	    Shell.registerCommand("!hideall", "!hideall [--verbose] command", "Only show results of command to GM", HiddenRolls.handleHideMessage);
	    Shell.permissionCommand(["!shell-permission", "add", "!hideall"], {'who': "gm"});
	    if (Shell.write){
		HiddenRolls.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", HiddenRolls.handleChatMessage);
	}
    }
};

on("ready", function(){ HiddenRolls.registerHiddenRolls(); });
