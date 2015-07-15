var RollStats = RollStats || {
    sessionStats: {},
    doChatCommands: true,

    STREAK_KEYS: ['streakLen', 'streakVal', 'curStreakLen', 'curStreakVal'],

    init: function(){
	if (!state.hasOwnProperty('RollStats')){ state.RollStats = {}; }
	if (!state.RollStats.hasOwnProperty('playerStats')){ state.RollStats.playerStats = {}; }
    },

    processRoll: function(player, dieSize, value){
	function updateStats(stats, dieSize, value){
	    if (dieSize <= 0){ return; }

	    if (!stats[dieSize]){ stats[dieSize] = {}; }

	    stats[dieSize][value] = (stats[dieSize][value] || 0) + 1;

	    if (value != stats[dieSize]['curStreakVal']){
		stats[dieSize]['curStreakVal'] = value;
		stats[dieSize]['curStreakLen'] = 0;
	    }
	    stats[dieSize]['curStreakLen'] = (stats[dieSize]['curStreakLen'] || 0) + 1;

	    if (stats[dieSize]['curStreakLen'] > (stats[dieSize]['streakLen'] || 0)){
		stats[dieSize]['streakLen'] = stats[dieSize]['curStreakLen'];
		stats[dieSize]['streakVal'] = stats[dieSize]['curStreakVal'];
	    }
	}

	if (!state.RollStats.playerStats[player]){ state.RollStats.playerStats[player] = {}; }
	if (!RollStats.sessionStats[player]){ RollStats.sessionStats[player] = {}; }

	updateStats(state.RollStats.playerStats[player], dieSize, value);
	updateStats(RollStats.sessionStats[player], dieSize, value);
    },

    processRolls: function(player, rolls){
	if (!rolls){ return; }

	for (var i = 0; i < rolls.length; i++){
	    if (rolls[i].type == "R"){
		// roll; process results
		if (rolls[i].table){ continue; }
		for (var j = 0; j < rolls[i].results.length; j++){
		    RollStats.processRoll(player, rolls[i].sides, rolls[i].results[j].v);
		}
	    }
	    else if (rolls[i].type == "G"){
		// group; process group elements
		for (var j = 0; j < rolls[i].rolls.length; j++){
		    RollStats.processRolls(player, rolls[i].rolls[j]);
		}
	    }
	}
    },

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd){
	RollStats.write(cmd + " [options]", who, "", "RS");
	var helpMsg = "Options:\n";
	helpMsg += "  -h, --help:           display this help message\n";
	helpMsg += "  -g, --global:         show stats for all players (default: show your stats)\n";
	helpMsg += "  -p P, --player P:     show stats for player P (default: show your stats)\n";
	helpMsg += "  -l, --leaderboard:    show player leaderboard\n";
	helpMsg += "  -d N, --die N:        show stats for specified die size (default: all sizes)\n";
	helpMsg += "  -s, --session:        show stats for current session (default: all time)\n";
	helpMsg += "  -c, --chat:           show stats in chat (default: whisper to you)\n";
	helpMsg += "  --clear:              clear collected stats (GM only)\n";
	RollStats.write(helpMsg, who, "font-size: small; font-family: monospace", "RS");
    },

    showLeaderboard: function(who, stats, dieSize){
	var playerStats = {}, playerIds = [];
	var fullCount = 0, fullTotal = 0, fullExpect = 0;

	// generate per-player stats
	for (var playerId in stats){
	    var count = 0, total = 0, expectTotal = 0;
	    if (dieSize > 0){
		for (var value in stats[playerId][dieSize]){
		    if (RollStats.STREAK_KEYS.indexOf(value) >= 0){ continue; }
		    count += stats[playerId][dieSize][value];
		    total += stats[playerId][dieSize][value] * value;
		}
		expectTotal = count * (dieSize + 1) / 2;
	    }
	    else{
		for (var d in stats[playerId]){
		    var dieCount = 0;
		    for (var value in stats[playerId][d]){
			if (RollStats.STREAK_KEYS.indexOf(value) >= 0){ continue; }
			dieCount += stats[playerId][d][value];
			total += stats[playerId][d][value] * value;
		    }
		    count += dieCount;
		    expectTotal += dieCount * (d + 1) / 2;
		}
	    }
	    fullCount += count;
	    fullTotal += total;
	    fullExpect += expectTotal;
	    playerStats[playerId] = {'count': count,
				    'mean': Math.round((count ? total / count : 0) * 10) / 10,
				    'expected': Math.round((count ? expectTotal / count : 0) * 10) / 10,
				    'luck': (expectTotal ? total / expectTotal : 0)};
	    playerIds.push(playerId);
	}
	// sort by "luck" (total roll results / expected roll results), descending
	playerIds.sort(function(x, y){ return playerStats[y]['luck'] - playerStats[x]['luck']; });

	// display leaderboard
	var tblMsg = "&{template:default} {{name=Leaderboard}}";
	for (var i = 0; i < playerIds.length; i++){
	    var s = playerStats[playerIds[i]];
	    var player = getObj("player", playerIds[i]);
	    tblMsg += " {{" + player.get('_displayname') + "=" + s['count'] + " rolls, mean ";
	    tblMsg += s['mean'] + ", expected " + s['expected'] + "}}";
	}
	if (fullCount > 0){
	    var fullMean = Math.round((fullTotal / fullCount) * 10) / 10;
	    tblMsg += " {{Everyone=" + fullCount + " rolls, mean " + fullMean + ", expected ";
	    tblMsg += (Math.round((fullExpect / fullCount) * 10) / 10) + "}}";
	}
	RollStats.write(tblMsg, who, "", "RS");
    },

    showDieStats: function(who, stats, dieSize, playerId){
	var header = "d" + dieSize + " Stats";
	var counts = [], total = 0, count = 0;
	var curStreakStr = "";
	var maxStreakStr = "";
	if (playerId){
	    // grab stats for selected player
	    var s = stats[playerId][dieSize] || {};
	    for (var i = 1; i <= dieSize; i++){
		var c = s[i] || 0;
		counts.push(c);
		total += c * i;
		count += c;
	    }
	    var player = getObj("player", playerId);
	    header += " for " + player.get('_displayname');
	    if (s['curStreakLen'] > 0){
		curStreakStr = "" + s['curStreakLen'] + " " + s['curStreakVal'];
		if (s['curStreakLen'] > 1){ curStreakStr += "'s"; }
	    }
	    if (s['streakLen'] > 0){
		maxStreakStr = "" + s['streakLen'] + " " + s['streakVal'];
		if (s['streakLen'] > 1){ maxStreakStr += "'s"; }
	    }
	    else{
		maxStreakStr = curStreakStr;
	    }
	}
	else{
	    // merge stats for all players
	    var curP, maxP;
	    for (var i = 0; i < dieSize; i++){ counts.push(0); }
	    for (var p in stats){
		if (!stats[p][dieSize]){ continue; }
		for (var i = 1; i <= dieSize; i++){
		    var c = stats[p][dieSize][i] || 0;
		    counts[i - 1] += c;
		    total += c * i;
		    count += c;
		}
		if ((!curP) || (stats[p][dieSize]['curStreakLen'] > stats[curP][dieSize]['curStreakLen'])){
		    curP = p;
		}
		if ((!maxP) || (stats[p][dieSize]['streakLen'] > stats[maxP][dieSize]['streakLen'])){
		    maxP = p;
		}
	    }
	    if ((curP) && (stats[curP][dieSize]['curStreakLen'] > 0)){
		var player = getObj("player", curP);
		curStreakStr = player.get('_displayname') + ": " + stats[curP][dieSize]['curStreakLen'];
		curStreakStr += " " + stats[curP][dieSize]['curStreakVal'];
		if (stats[curP][dieSize]['curStreakLen'] > 1){ curStreakStr += "'s"; }
	    }
	    if ((maxP) && (stats[maxP][dieSize]['streakLen'] > 0)){
		var player = getObj("player", maxP);
		maxStreakStr = player.get('_displayname') + ": " + stats[maxP][dieSize]['streakLen'];
		maxStreakStr += " " + stats[maxP][dieSize]['streakVal'];
		if (stats[maxP][dieSize]['streakLen'] > 1){ maxStreakStr += "'s"; }
	    }
	    else{
		maxStreakStr = curStreakStr;
	    }
	}

	// display stats
	var tblMsg = "&{template:default} {{name=" + header + "}}";
	var expected = count / dieSize;
	var expectedPct = Math.round(1000 / dieSize) / 10;
	for (var i = 1; i <= dieSize; i++){
	    var pct = Math.round((count ? counts[i - 1] * 100 / count : 0) * 10) / 10;
	    tblMsg += " {{" + i + "=" + counts[i - 1] + " (" + pct + "%), expected ";
	    tblMsg += Math.round(expected) + " (" + expectedPct + "%)}}";
	}
	tblMsg += " {{Count=" + count + "}} {{mean=" + (Math.round((count ? total / count : 0) * 10) / 10);
	tblMsg += ", expected " + ((dieSize + 1) / 2) + "}}";
	if (curStreakStr){
	    tblMsg += " {{Current Streak=" + curStreakStr + "}}";
	}
	if (maxStreakStr){
	    tblMsg += " {{Longest Streak=" + maxStreakStr + "}}";
	}
	RollStats.write(tblMsg, who, "", "RS");
    },

    showSummary: function(who, stats, playerId){
	var header = "Summary Stats";
	var s;
	if (playerId){
	    // grab stats for selected player
	    s = stats[playerId] || {};
	    var player = getObj("player", playerId);
	    header += " for " + player.get('_displayname');
	}
	else{
	    // merge stats for all players
	    s = {};
	    for (var p in stats){
		for (var d in stats[p]){
		    if (!s[d]){ s[d] = {}; }
		    for (var k in stats[p][d]){
			if (RollStats.STREAK_KEYS.indexOf(k) >= 0){ continue; }
			s[d][k] = (s[d][k] || 0) + stats[p][d][k];
		    }
		}
	    }
	}

	// generate summary data
	var dieSizes = [];
	var summary = {};
	for (var dieSize in s){
	    var count = 0, total = 0;
	    for (var value in s[dieSize]){
		if (RollStats.STREAK_KEYS.indexOf(value) >= 0){ continue; }
		count += s[dieSize][value];
		total += s[dieSize][value] * value;
	    }
	    summary[dieSize] = {'count': count,
				'mean': Math.round((count ? total / count : 0) * 10) / 10};
	    if (typeof(dieSize) == typeof("")){
		dieSize = parseInt(dieSize);
	    }
	    dieSizes.push(dieSize);
	}
	dieSizes.sort(function(x, y){ return x - y; }); // numeric compare rather than default lexical compare

	// display summary
	var tblMsg = "&{template:default} {{name=" + header + "}}";
	for (var i = 0; i < dieSizes.length; i++){
	    var dieSize = dieSizes[i];
	    tblMsg += " {{ d" + dieSize + "=" + summary[dieSize]['count'] + " roll";
	    if (summary[dieSize]['count'] > 1){ tblMsg += "s"; }
	    tblMsg += ", mean " + summary[dieSize]['mean'] + ", expected " + ((dieSize + 1) / 2) + "}}";
	}
	RollStats.write(tblMsg, who, "", "RS");
    },

    handleStatsMessage: function(tokens, msg){
	var playerId = msg.playerid,
	    doLeaderboard = false,
	    dieSize = 0,
	    stats = state.RollStats.playerStats,
	    who = msg.who,
	    doClear = false;

	var getPlayer = false, getDie = false;
	for (var i = 1; i < tokens.length; i++){
	    if (getPlayer){
		var player = getObj("player", tokens[i]);
		if (!player){
		    player = findObjs({'_type': "player", '_displayname': tokens[i]})[0];
		}
		if (!player){
		    player = findObjs({'_type': "player", '_d20userid': tokens[i]})[0];
		}
		if (!player){
		    RollStats.write("Error: Unable to find player " + tokens[i], msg.who, "", "RS");
		    return;
		}
		playerId = player.id;
		getPlayer = false;
		continue;
	    }
	    if (getDie){
		dieSize = parseInt(tokens[i].replace(/^.*d/, ""));
		getDie = false;
		continue;
	    }
	    switch(tokens[i]){
	    case "-h":
	    case "--help":
		return RollStats.showHelp(msg.who, tokens[0]);
	    case "-g":
	    case "--global":
		playerId = null;
		break;
	    case "-p":
	    case "--player":
		getPlayer = true;
		break;
	    case "-l":
	    case "--leaderboard":
		doLeaderboard = true;
		break;
	    case "-d":
	    case "--die":
		getDie = true;
		break;
	    case "-s":
	    case "--session":
		stats = RollStats.sessionStats;
		break;
	    case "-c":
	    case "--chat":
		who = null;
		break;
	    case "--clear":
		doClear = true;
		break;
	    default:
		RollStats.write("Error: Unrecognized argument: " + tokens[i], msg.who, "", "RS");
		return RollStats.showHelp(msg.who, tokens[0]);
	    }
	}
	if (getPlayer){
	    RollStats.write("Error: --player requires player name or ID", msg.who, "", "RS");
	    return RollStats.showHelp(msg.who, tokens[0]);
	}
	if (getDie){
	    RollStats.write("Error: --die requires die size", msg.who, "", "RS");
	    return RollStats.showHelp(msg.who, tokens[0]);
	}

	if (doClear){
	    if (!playerIsGM(msg.playerid)){
		RollStats.write("Error: Must be GM to clear stats", msg.who, "", "RS");
	    }
	    else{
		for (var k in stats){ delete stats[k]; }
	    }
	    return;
	}

	if (doLeaderboard){
	    RollStats.showLeaderboard(who, stats, dieSize);
	}
	else if (dieSize > 0){
	    RollStats.showDieStats(who, stats, dieSize, playerId);
	}
	else{
	    RollStats.showSummary(who, stats, playerId);
	}
    },

    handleChatMessage: function(msg){
	if (msg.type == "rollresult"){
	    var result = JSON.parse(msg.content) || {'rolls': []};
	    RollStats.processRolls(msg.playerid, result.rolls || []);
	}

	if (msg.inlinerolls){
	    for (var i = 0; i < msg.inlinerolls.length; i++){
		RollStats.processRolls(msg.playerid, msg.inlinerolls[i].results.rolls);
	    }
	}

	if ((RollStats.doChatCommands) && (msg.type == "api") && (msg.indexOf("!rollstats") == 0)){
	    return RollStats.handleStatsMessage(msg.content.split(" "), msg);
	}
    },

    registerRollStats: function(){
	RollStats.init();
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!rollstats", "!rollstats [options]", "Display roll statistics", RollStats.handleStatsMessage);
	    Shell.permissionCommand(["!shell-permission", "add", "!rollstats"], {'who': "gm"});
	    RollStats.doChatCommands = false;
	    if (Shell.write){
		RollStats.write = Shell.write;
	    }
	}
	on("chat:message", RollStats.handleChatMessage);
    }
};

on("ready", function(){ RollStats.registerRollStats(); });
