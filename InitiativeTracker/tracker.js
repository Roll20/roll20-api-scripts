var Tracker = Tracker || {
    ALL_STATUSES:  ["red", "blue", "green", "brown", "purple", "pink", "yellow",
		    "dead", "skull", "sleepy", "half-heart", "half-haze", "interdiction", "snail", "lightning-helix", "spanner",
		    "chained-heart", "chemical-bolt", "death-zone", "drink-me", "edge-crack", "ninja-mask", "stopwatch",
		    "fishing-net", "overdrive", "strong", "fist", "padlock", "three-leaves", "fluffy-wing", "pummeled", "tread",
		    "arrowed", "aura", "back-pain", "black-flag", "bleeding-eye", "bolt-shield", "broken-heart", "cobweb",
		    "broken-shield", "flying-flag", "radioactive", "trophy", "broken-skull", "frozen-orb", "rolling-bomb",
		    "white-tower", "grab", "screaming", "grenade", "sentry-gun", "all-for-one", "angel-outfit", "archery-target"],

    STATUS_ALIASES: {'deflection': "bolt-shield", 'disabled': "pummeled", 'haste': "lightning-helix", 'invisible': "ninja-mask",
		    'potion': "drink-me", 'stun': "sleepy"},

    CONFIG_PARAMS: [['announceRounds',		"Announce Each Round"],
		    ['announceTurns',		"Announce Each Player's Turn"],
		    ['announceExpiration',	"Announce Status Expirations"],
		    ['highToLow',		"High-to-Low Initiative Order"]],


    initConfig: function(){
	if (!state.hasOwnProperty('InitiativeTracker')){
	    state.InitiativeTracker = {
					'highToLow':		true,
					'announceRounds':	true,
					'announceTurns':	true,
					'announceExpiration':	true
	    };
	}
	if (!state.InitiativeTracker.hasOwnProperty('round')){
	    state.InitiativeTracker.round = null;
	}
	if (!state.InitiativeTracker.hasOwnProperty('count')){
	    state.InitiativeTracker.count = null;
	}
	if (!state.InitiativeTracker.hasOwnProperty('status')){
	    state.InitiativeTracker.status = [];
	}
    },

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    reset: function(){
	state.InitiativeTracker.round = null;
	state.InitiativeTracker.count = null;
	state.InitiativeTracker.status = [];
    },

    announceRound: function(round){
	if (!state.InitiativeTracker.announceRounds){ return; }
	sendChat("", "/desc Start of Round " + round);
    },

    announceTurn: function(count, tokenName, tokenId){
	if (!state.InitiativeTracker.announceTurns){ return; }
	if (!tokenName){
	    var token = getObj("graphic", tokenId);
	    if (token){ tokenName = token.get('name'); }
	}
	sendChat("", "/desc Start of Turn " + state.InitiativeTracker.round + " for " + tokenName + " (" + count + ")");
    },

    announceStatusExpiration: function(status, tokenName){
	if (!state.InitiativeTracker.announceExpiration){ return; }
	sendChat("", "/desc Status " + status + " expired on " + tokenName);
    },

    handleTurnChange: function(newTurnOrder, oldTurnOrder){
	var newTurns = JSON.parse((typeof(newTurnOrder) == typeof("") ? newTurnOrder : newTurnOrder.get('turnorder') || "[]"));
	var oldTurns = JSON.parse((typeof(oldTurnOrder) == typeof("") ? oldTurnOrder : oldTurnOrder.turnorder || "[]"));

	if ((!newTurns) || (!oldTurns)){ return; }

	if ((newTurns.length == 0) && (oldTurns.length > 0)){ return Tracker.reset(); } // turn order was cleared; reset

	if ((!newTurns.length) || (newTurns.length != oldTurns.length)){ return; } // something was added or removed; ignore

	if ((state.InitiativeTracker.round == null) || (state.InitiativeTracker.count == null)){
	    // first change: see if it's time to start tracking
	    var startTracking = false;
	    for (var i = 0; i < newTurns.length; i++){
		if (newTurns[i].id != oldTurns[i].id){
		    // turn order was sorted; start tracking
		    startTracking = true;
		    break;
		}
		if (newTurns[i].pr != oldTurns[i].pr){ break; } // a token's initiative count was changed; don't start tracking yet
	    }
	    if (!startTracking){ return; }
	    state.InitiativeTracker.round = 1;
	    state.InitiativeTracker.count = newTurns[0].pr;
	    Tracker.announceRound(state.InitiativeTracker.round);
	    Tracker.announceTurn(newTurns[0].pr, newTurns[0].custom, newTurns[0].id);
	    return;
	}

	if (newTurns[0].id == oldTurns[0].id){ return; } // turn didn't change

	var newCount = newTurns[0].pr;
	var oldCount = state.InitiativeTracker.count;
	if (!state.InitiativeTracker.highToLow){
	    // use negatives for low-to-high initiative so inequalities work out the same as high-to-low
	    newCount = -newCount;
	    oldCount = -oldCount;
	}

	var roundChanged = newCount > oldCount;

	if (roundChanged){
	    // made it back to the top of the initiative order
	    state.InitiativeTracker.round += 1;
	    Tracker.announceRound(state.InitiativeTracker.round);
	}

	if (newTurns[0].pr != state.InitiativeTracker.count){
	    // update statuses that update between the last count and this count
	    for (var i = 0; i < state.InitiativeTracker.status.length; i++){
		var status = state.InitiativeTracker.status[i];
		var token = getObj("graphic", status.token);
		if (!token){
		    // token associated with this status doesn't exist anymore; remove it
		    state.InitiativeTracker.status.splice(i, 1);
		    i -= 1;
		    continue;
		}
		var statusCount = status.count;
		if (!state.InitiativeTracker.highToLow){ statusCount = -statusCount; }
		if ((roundChanged) && (statusCount > oldCount) && (statusCount < newCount)){ continue; } // status not between last count and this count
		if ((!roundChanged) && ((statusCount > oldCount) || (statusCount < newCount))){ continue; }
		if (status.expires <= state.InitiativeTracker.round){
		    // status expired; remove marker and announce expiration
		    token.set("status_" + status.status, false);
		    state.InitiativeTracker.status.splice(i, 1);
		    i -= 1;
		    Tracker.announceStatusExpiration(status.name, token.get('name'));
		}
		else if (status.expires - state.InitiativeTracker.round < 10){
		    // status has nine or fewer rounds left; update marker to reflect remaining rounds
		    token.set("status_" + status.status, status.expires - state.InitiativeTracker.round);
		}
	    }
	}

	state.InitiativeTracker.count = newTurns[0].pr;
	Tracker.announceTurn(newTurns[0].pr, newTurns[0].custom, newTurns[0].id);
    },

    getConfigParam: function(who, param){
	if (param == null){
	    for (var i = 0; i < Tracker.CONFIG_PARAMS.length; i++){
		var head = Tracker.CONFIG_PARAMS[i][1] + " (" + Tracker.CONFIG_PARAMS[i][0] + "): ";
		Tracker.write(head + state.InitiativeTracker[Tracker.CONFIG_PARAMS[i][0]], who, "", "Tracker");
	    }
	}
	else {
	    var err = true;
	    for (var i = 0; i < CONFIG_PARAMS.length; i++){
		if (Tracker.CONFIG_PARAMS[i][0] == param){
		    var head = Tracker.CONFIG_PARAMS[i][1] + " (" + Tracker.CONFIG_PARAMS[i][0] + "): ";
		    Tracker.write(head + state.InitiativeTracker[Tracker.CONFIG_PARAMS[i][0]], who, "", "Tracker");
		    err = false;
		    break;
		}
	    }
	    if (err){
		Tracker.write("Error: Config parameter '" + param + "' not found", who, "", "Tracker");
	    }
	}
    },

    setConfigParam: function(who, param, value){
	var err = true;
	for (var i = 0; i < Tracker.CONFIG_PARAMS.length; i++){
	    if (CONFIG_PARAMS[i][0] == param){
		state.InitiativeTracker[Tracker.CONFIG_PARAMS[i][0]] = (value == null ? !state.InitiativeTracker[Tracker.CONFIG_PARAMS[i][0]] : value);
		err = false;
		break;
	    }
	}
	if (err){
	    Tracker.write("Error: Config parameter '" + param + "' not found", who, "", "Tracker");
	}
    },

    showTrackerHelp: function(who, cmd){
	Tracker.write(cmd + " commands:", who, "", "Tracker");
	var helpMsg = "";
	helpMsg += "help:               display this help message\n";
	helpMsg += "round [NUM]:        display the current round number, or set round number to NUM\n";
	helpMsg += "forward:            advance the initiative counter to the next token\n";
	helpMsg += "fwd:                synonym for forward\n";
	helpMsg += "back:               rewind the initiative counter to the previous token\n";
	helpMsg += "start:              sort the tokens in the initiative counter and begin tracking\n";
	helpMsg += "get [PARAM]:        display the value of the specified config parameter, or all config parameters\n";
	helpMsg += "set PARAM [VALUE]:  set the specified config parameter to the specified value (defaults to true)\n";
	helpMsg += "enable PARAM:       set the specified config parameter to true\n";
	helpMsg += "disable PARAM:      set the specified config parameter to false\n";
	helpMsg += "toggle PARAM:       toggle the specified config parameter between true and false";
	Tracker.write(helpMsg, who, "font-size: small; font-family: monospace", "Tracker");
    },

    handleTrackerMessage: function(tokens, msg){
	var who = msg.who;
	msg = msg.content;
	if ((tokens.length > 1) && (tokens[1] == "public")){
	    who = "";
	    tokens.splice(1, 1);
	}
	if (tokens.length < 2){ return Tracker.showTrackerHelp(who, tokens[0]); }
	switch (tokens[1]){
	case "round":
	    if (tokens.length <= 2){ Tracker.write("Current Round: " + state.InitiativeTracker.round, who, "", "Tracker"); }
	    else{
		var round = parseInt(tokens[2]);
		if (round != state.InitiativeTracker.round){
		    state.InitiativeTracker.round = round;
		    if (state.InitiativeTracker.announceRounds){ sendChat("", "/desc Moved to Round " + round); }
		    // update all statuses
		    var curCount = state.InitiativeTracker.count;
		    if (!state.InitiativeTracker.highToLow){ curCount = -curCount; }
		    for (var i = 0; i < state.InitiativeTracker.status.length; i++){
			var status = state.InitiativeTracker.status[i];
			var token = getObj("graphic", status.token);
			if (!token){
			    // token associated with this status doesn't exist anymore; remove it
			    state.InitiativeTracker.status.splice(i, 1);
			    i -= 1;
			    continue;
			}
			var statusCount = status.count;
			if (!state.InitiativeTracker.highToLow){ statusCount = -statusCount; }
			var statusDuration = status.expires - round;
			if (statusCount > curCount){
			    // haven't yet come to this status' initiative count; increment remaining duration
			    statusDuration += 1;
			}
			if (statusDuration < 0){
			    // status expired; remove marker and announce expiration
			    token.set("status_" + status.status, false);
			    state.InitiativeTracker.status.splice(i, 1);
			    i -= 1;
			    Tracker.announceStatusExpiration(status.name, token.get('name'));
			}
			else if (statusDuration < 10){
			    // status has nine or fewer rounds left; update marker to reflect remaining rounds
			    token.set("status_" + status.status, statusDuration);
			}
		    }
		}
	    }
	    break;
	case "forward":
	case "fwd":
	    var oldTurnOrderStr = Campaign().get('turnorder') || "[]";
	    var turnOrder = JSON.parse(oldTurnOrderStr);
	    if (turnOrder.length > 0){
		turnOrder.push(turnOrder.shift());
		var newTurnOrderStr = JSON.stringify(turnOrder);
		Campaign().set('turnorder', newTurnOrderStr);
		Tracker.handleTurnChange(newTurnOrderStr, oldTurnOrderStr);
	    }
	    break;
	case "back":
	    var oldTurnOrderStr = Campaign().get('turnorder') || "[]";
	    var turnOrder = JSON.parse(oldTurnOrderStr);
	    if (turnOrder.length > 0){
		// as far as handleTurnChange is concerned, we're going forward until one count back in the next round;
		// decrement round counter so that handleTurnChange will do the right thing
		state.InitiativeTracker.round -= 1;
		turnOrder.unshift(turnOrder.pop());
		var newTurnOrderStr = JSON.stringify(turnOrder);
		Campaign().set('turnorder', newTurnOrderStr);
		Tracker.handleTurnChange(newTurnOrderStr, oldTurnOrderStr);
	    }
	    break;
	case "start":
	    var turnOrder = JSON.parse(Campaign().get('turnorder') || "[]");
	    if (turnOrder.length > 0){
		turnOrder.sort(function(x, y){
				    return (state.InitiativeTracker.highToLow ? y.pr - x.pr : x.pr - y.pr);
				});
		Campaign().set('turnorder', JSON.stringify(turnOrder));
		state.InitiativeTracker.round = 1;
		state.InitiativeTracker.count = turnOrder[0].pr;
		Tracker.announceRound(state.InitiativeTracker.round);
		Tracker.announceTurn(turnOrder[0].pr, turnOrder[0].custom, turnOrder[0].id);
	    }
	    break;
	case "get":
	    if (tokens.length <= 2){ Tracker.getConfigParam(who, null); }
	    else { Tracker.getConfigParam(who, tokens[2]); }
	    break;
	case "set":
	    if (tokens.length <= 2){
		Tracker.write("Error: The 'set' command requires at least one argument (the parameter to set)", who, "", "Tracker");
		break;
	    }
	    var value = true;
	    if (tokens.length > 3){
		if ((tokens[3] != "true") && (tokens[3] != "yes") && (tokens[3] != "1")){ value = false; }
	    }
	    Tracker.setConfigParam(who, tokens[2], value);
	    break;
	case "enable":
	    if (tokens.length != 3){
		Tracker.write("Error: The 'enable' command requires exactly one argument (the parameter to enable)", who, "", "Tracker");
		break;
	    }
	    Tracker.setConfigParam(who, tokens[2], true);
	    break;
	case "disable":
	    if (tokens.length != 3){
		Tracker.write("Error: The 'disable' command requires exactly one argument (the parameter to disble)", who, "", "Tracker");
		break;
	    }
	    Tracker.setConfigParam(who, tokens[2], false);
	    break;
	case "toggle":
	    if (tokens.length != 3){
		Tracker.write("Error: The 'toggle' command requires exactly one argument (the parameter to toggle)", who, "", "Tracker");
		break;
	    }
	    Tracker.setConfigParam(who, tokens[2], null);
	    break;
	case "help":
	    Tracker.showTrackerHelp(who, tokens[0]);
	    break;
	default:
	    Tracker.write("Error: Unrecognized command: " + tokens[0], who, "", "Tracker");
	    Tracker.showTrackerHelp(who, tokens[0]);
	}
    },

    addStatus: function(tokenId, duration, status, name){
	var token = getObj("graphic", tokenId);
	if (!token){ return; }
	if (Tracker.STATUS_ALIASES[status]){ status = Tracker.STATUS_ALIASES[status]; }
	state.InitiativeTracker.status.push({'token':	tokenId,
					    'expires':	state.InitiativeTracker.round + duration,
					    'count':	state.InitiativeTracker.count,
					    'status':	status,
					    'name':	name});
	if (duration > 10){ duration = true; }
	token.set("status_" + status, duration);
    },

    showStatusHelp: function(who, cmd){
	Tracker.write(cmd + " commands:", who, "", "Tracker");
	var helpMsg = "";
	helpMsg += "help:               display this help message\n";
	helpMsg += "add DUR ICON DESC:  add DUR rounds of status effect with specified icon and description to selected tokens\n";
	helpMsg += "list:               list all status effects for selected tokens\n";
	helpMsg += "show:               synonym for list\n";
	helpMsg += "remove [ID]:        remove specified status effect, or all status effects from selected tokens\n";
	helpMsg += "rem, delete, del:   synonyms for remove\n";
	helpMsg += "icons:              list available status icons and aliases";
	Tracker.write(helpMsg, who, "font-size: small; font-family: monospace", "Tracker");
    },

    handleStatusMessage: function(tokens, msg){
	var who = msg.who;
	var selected = msg.selected;
	msg = msg.content;
	if ((tokens.length > 1) && (tokens[1] == "public")){
	    who = "";
	    tokens.splice(1, 1);
	}
	if (tokens.length < 2){ return Tracker.showStatusHelp(who, tokens[0]); }
	switch (tokens[1]){
	case "add":
	    if ((!selected) || (selected.length <= 0)){
		Tracker.write("Error: The 'add' command requires at least one selected token", who, "", "Tracker");
		break;
	    }
	    if (tokens.length < 5){
		Tracker.write("Error: The 'add' command requires three arguments (duration, icon, description)", who, "", "Tracker");
		break;
	    }
	    if (state.InitiativeTracker.round <= 0){
		Tracker.write("Error: Initiative not being tracked", who, "", "Tracker");
		break;
	    }
	    for (var i = 0; i < selected.length; i++){
		if (selected[i]._type != "graphic"){ continue; }
		var token = getObj(selected[i]._type, selected[i]._id);
		if (!token){ continue; }
		Tracker.addStatus(selected[i]._id, parseInt(tokens[2]), tokens[3], tokens.slice(4).join(" "));
	    }
	    break;
	case "list":
	case "show":
	    if ((!selected) || (selected.length <= 0)){
		Tracker.write("Error: The '" + tokens[1] + "' command requires at least one selected token", who, "", "Tracker");
		break;
	    }
	    var tokenIds = [];
	    var byToken = {};
	    var tokenNames = {};
	    for (var i = 0; i < selected.length; i++){
		if (selected[i]._type != "graphic"){ continue; }
		var token = getObj(selected[i]._type, selected[i]._id);
		if (!token){ continue; }
		tokenIds.push(selected[i]._id);
		byToken[selected[i]._id] = [];
		tokenNames[selected[i]._id] = token.get('name');
	    }
	    tokenIds.sort(function(x, y){
				if (tokenNames[x] == tokenNames[y]){ return 0; }
				if (tokenNames[x] > tokenNames[y]){ return 1; }
				return -1;
			    });
	    for (var i = 0; i < state.InitiativeTracker.status.length; i++){
		var status = state.InitiativeTracker.status[i];
		if (!byToken[status.token]){ continue; }
		var duration = status.expires - state.InitiativeTracker.round;
		if ((state.InitiativeTracker.highToLow) && (status.count < state.InitiativeTracker.count)){
		    duration += 1;
		}
		if ((!state.InitiativeTracker.highToLow) && (status.count > state.InitiativeTracker.count)){
		    duration += 1;
		}
		byToken[status.token].push("" + i + ": " + status.name + " (" + duration + ")");
	    }
	    for (var i = 0; i < tokenIds.length; i++){
		var from = (who ? "Tracker" : "");
		if (byToken[tokenIds[i]].length <= 0){
		    var output = "No status effects for token " + tokenNames[tokenIds[i]];
		    if (who){
			Tracker.write(output, who, "", from);
		    }
		    else{
			sendChat(from, "/desc " + output);
		    }
		    continue;
		}
		var output = "Status effects for token " + tokenNames[tokenIds[i]] + ":";
		if (who){
		    Tracker.write(output, who, "", from);
		}
		else{
		    sendChat(from, "/desc " + output);
		}
		for (var j = 0; j < byToken[tokenIds[i]].length; j++){
		    Tracker.write(byToken[tokenIds[i]][j], who, "", "Tracker");
		}
	    }
	    break;
	case "remove":
	case "rem":
	case "delete":
	case "del":
	    if ((tokens.length == 2) && (selected) && (selected.length > 0)){
		// some tokens selected and no ID specified; remove all status effects from selected tokens
		for (var i = 0; i < state.InitiativeTracker.status.length; i++){
		    var status = state.InitiativeTracker.status[i];
		    for (var j = 0; j < selected.length; j++){
			if ((selected[j]._type != "graphic") || (selected[j]._id != status.token)){ continue; }
			var token = getObj(selected[j]._type, selected[j]._id);
			if (!token){ continue; }
			token.set("status_" + status.status, false);
			state.InitiativeTracker.status.splice(i, 1);
			i -= 1;
			break;
		    }
		}
		break;
	    }
	    // ID specified or nothing selected; require ID and remove specified status effect
	    if (tokens.length != 3){
		Tracker.write("Error: The '" + tokens[1] + "' command requires an argument (status effect ID)", who, "", "Tracker");
		break;
	    }
	    var idx = parseInt(tokens[2]);
	    if ((idx < 0) || (idx >= state.InitiativeTracker.status.length)){
		Tracker.write("Error: Invalid status effect ID: " + tokens[2], who, "", "Tracker");
		break;
	    }
	    var status = state.InitiativeTracker.status[idx];
	    var token = getObj("graphic", status.token);
	    token.set("status_" + status.status, false);
	    state.InitiativeTracker.status.splice(idx, 1);
	    break;
	case "icons":
	    Tracker.write("Status Icons: " + Tracker.ALL_STATUSES.join(", "), who, "", "Tracker");
	    Tracker.write("Status Aliases:", who, "", "Tracker");
	    var output = "";
	    for (var k in Tracker.STATUS_ALIASES){
		if (output){ output += "\n"; }
		output += k + ": " + Tracker.STATUS_ALIASES[k];
	    }
	    Tracker.write(output, who, "", "Tracker");
	    break;
	case "help":
	    Tracker.showStatusHelp(who, tokens[0]);
	    break;
	default:
	    Tracker.write("Error: Unrecognized command: " + tokens[0], who, "", "Tracker");
	    Tracker.showStatusHelp(who, tokens[0]);
	}
    },

    handleChatMessage: function(msg){
	if (msg.type != "api"){ return; }

	if ((msg.content == "!tracker") || (msg.content.indexOf("!tracker ") == 0)){ return Tracker.handleTrackerMessage(msg.content.split(" "), msg); }
	if ((msg.content == "!status") || (msg.content.indexOf("!status ") == 0)){ return Tracker.handleStatusMessage(msg.content.split(" "), msg); }
    },

    registerTracker: function(){
	Tracker.initConfig();
	on("change:campaign:turnorder", Tracker.handleTurnChange);
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!tracker", "!tracker <subcommand> [args]", "Configure the initiative tracker", Tracker.handleTrackerMessage);
	    Shell.registerCommand("!status", "!status <subcommand> [args]", "Track status effects on tokens", Tracker.handleStatusMessage);
	    if (Shell.write){
		Tracker.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", Tracker.handleChatMessage);
	}
    }
};

on("ready", function(){ Tracker.registerTracker(); })
