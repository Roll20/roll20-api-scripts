var DitV = DitV || {
    GRID_SIZE: 70,
    BOX_WIDTH: 6,
    BOX_HEIGHT: 4,
    CHIP_HEIGHT: 4,
    CHIP_START: 2,

    MAX_VALUE: 10,

    DEFAULT_URLS = {
	//1:	"https://s3.amazonaws.com/files.d20.io/images/USER_ID/SOME_RANDOM_CHARACTERS/thumb.png"
    },
    GENERIC_URL = "";


    init: function(){
	if (!state.hasOwnProperty('DitV')){ state.DitV = {}; }
	if (!state.DitV.hasOwnProperty('characters')){ state.DitV.characters = {}; }
	if (!state.DitV.hasOwnProperty('chipImages')){ state.DitV.chipImages = {}; }
	if (!state.DitV.CHIP_URLS){ state.DitV.CHIP_URLS = {}; }
	for (var i = 1; i <= MAX_VALUE; i++){
	    if ((!state.DitV.CHIP_URLS[i]) && (DitV.DEFAULT_URLS[i])){
		state.DitV.CHIP_URLS[i] = DitV.DEFAULT_URLS[i];
	    }
	}
	DitV.MAX_STACK = Math.floor(DitV.GRID_SIZE / DitV.CHIP_HEIGHT);
    },

    addCharacter: function(name, x, y, color){
	var pageId = Campaign().get('playerpageid');
	if (!pageId){ return "Unable to determine player page."; }
	if (state.DitV.characters[name]){ return "Character '" + name + "' already registered."; }
	if (!x){ x = 0; }
	if (!y){ y = 0; }
	if (!color){ color = "#ffff00"; }
	var path = [["M", 0, 0], ["L", DitV.BOX_WIDTH * DitV.GRID_SIZE, 0], ["L", DitV.BOX_WIDTH * DitV.GRID_SIZE, DitV.BOX_HEIGHT * DitV.GRID_SIZE],
		    ["L", 0, DitV.BOX_HEIGHT * DitV.GRID_SIZE], ["L", 0, 0]];
	var box = createObj("path", {
				    _pageid:		pageId,
				    _path:		JSON.stringify(path),
				    stroke:		color,
				    left:		x * DitV.GRID_SIZE,
				    top:		y * DitV.GRID_SIZE,
				    width:		DitV.BOX_WIDTH * DitV.GRID_SIZE,
				    width:		DitV.BOX_HEIGHT * DitV.GRID_SIZE,
				    layer:		"map"});
	state.DitV.characters[name] = {
	    'x':	x,
	    'y':	y,
	    'box':	box,
	    'chips':	{}
	};
    },

    removeCharacter: function(name){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	var error = DitV.clearChips(name);
	if (state.DitV.characters[name]['box']){
	    state.DitV.characters[name]['box'].remove();
	    delete state.DitV.characters[name]['box'];
	}
	delete state.DitV.characters[name];
	return error;
    },

    clearChips: function(name){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	for (var value in state.DitV.characters[name]['chips']){
	    while (state.DitV.characters[name]['chips'][value]){
		var token = getObj("graphic", state.DitV.characters[name]['chips'][value].pop());
		if (token){ token.remove(); }
	    }
	}
	state.DitV.characters[name]['chips'] = {};
    },

    addChip: function(name, value){
	var pageId = Campaign().get('playerpageid');
	if (!pageId){ return "Unable to determine player page."; }
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	var character = state.DitV.characters[name];
	var pos = value - 1 + DitV.CHIP_START; // position in wrapped list of 1x2 stacks (CHIP_START is the offset past the reserved top-left area)
	var x = (pos % DitV.BOX_WIDTH) + character['x'];
	var y = floor(pos / DitV.BOX_WIDTH) + character['y'];
	// translate from squares to pixels, and adjust for the fact that Roll20 uses center instead of top-left for position
	x = (x * DitV.GRID_SIZE) + (DitV.GRID_SIZE / 2);
	y = (y * DitV.GRID_SIZE) + (DitV.GRID_SIZE / 2);
	// offset chip image upwards to place on top of stack
	y -= Math.min((character['chips'][value] ? character['chips'][value].length : 0), DitV.MAX_STACK) * DitV.CHIP_HEIGHT;
	var token = createObj("graphic", {
					    _subtype:		"token",
					    _pageid:		pageId,
					    imgsrc:		(state.DitV.CHIP_URLS[value] || DitV.GENERIC_URL),
					    left:		x,
					    top:		y,
					    width:		DitV.GRID_SIZE,
					    height:		DitV.GRID_SIZE,
					    layer:		"objects",
					    isdrawing:		true,
/////
//
					    controlledby:	"all"
//
/////
					});
	if (!token){ return "Failed to create token for chip with value " + value"; }
/////
//
	if(!state.DitV.CHIP_URLS[value]){ token.set("status_blue", (value < 10 ? value : true)); }
//
/////
	if (!character['chips'][value]){ character['chips'][value] = []; }
	character['chips'][value].push(token._id);
    },

    addChips: function(name, counts){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	for (var i = 0; i < counts.length; i++){
	    for (var j = 0; j < counts[i]; j++){
		var error = DitV.addChip(name, i + 1);
		if (error){ return error; }
	    }
	}
    },

    rollChips: function(name, rollSpec){
	var specArray = rollSpec.split(/[+\s]/);
	var rollCounts = new Array(DitV.MAX_VALUE);
	for (var i = 0; i < specArray.length; i++){
	    var spec = specArray[i].split("d");
	    if (spec.length != 2){
		return "Malformed roll specification: " + specArray[i];
	    }
	    var diceCount = parseInt(spec[0]);
	    var dieSize = parseInt(spec[1]);
	    for (j = 0; j < diceCount; j++){
		var roll = randomInteger(dieSize);
		rollCounts[roll - 1] = (rollCounts[roll - 1] || 0) + 1;
	    }
	}
	return DitV.addChips(name, rollCounts);
    },

    countChips: function(name){
	if (!state.DitV.characters[name]){ return "Character '" + name + "' not registered."; }
	var chips = state.DitV.characters[name]['chips'];
	var counts = {};
	for (var value in chips){
	    // prune references to chips whose tokens have been deleted before counting remaining chips
	    chips[value] = chips[value].filter(function(tokenId){ return getObj("graphic", tokenId); });
	    counts[value] = chips[value].length;
	}
	return counts;
    },

/////
//
    //chip maintenance (reclaim and restack chips)?
//
/////


    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd){
	DitV.write(cmd + " commands:", who, "", "DitV");
	var helpMsg = "";
	helpMsg += "help:               	display this help message\n";
	helpMsg += "add NAME X Y [COLOR]	add character with specified name, coordinates, and color\n";
	helpMsg += "remove NAME			remove specified character\n";
	helpMsg += "clear NAME			clear specified character's chips\n";
	helpMsg += "roll NAME DICE		roll DICE (e.g. \"3d4+1d6\") and add to specified character's chips\n";
	helpMsg += "count NAME			count specified character's chips and display for all to see\n";
/////
//
	//chip maintenance?
//
/////
	helpMsg += "setimage VALUE [URL]	set the image URL for the specified chip value (uses selected token's image if no URL specified)\n";
	helpMsg += "images			display a table of chip images\n";
	DitV.write(helpMsg, who, "font-size: small; font-family: monospace", "DitV");
    },

    handleDitVMessage: function(tokens, msg){
	if (tokens.length < 2){
	    return DitV.showHelp(who, tokens[0]);
	}
	var error = "";
	switch (tokens[1]){
	case "add":
	    if (tokens.length <= 4){
		error = "The 'add' command requires at least three arguments: character name, x coordinate, and y coordinate";
		break;
	    }
	    error = DitV.addCharacter(tokens[2], parseInt(tokens[3]), parseInt(tokens[4]), tokens[5]);
	    break;
	case "remove":
	    if (tokens.length <= 2){
		error = "The 'remove' command requires one argument: character name";
		break;
	    }
	    error = DitV.removeCharacter(tokens[2]);
	    break;
	case "clear":
	    if (tokens.length <= 2){
		error = "The 'clear' command requires one argument: character name";
		break;
	    }
	    error = DitV.clearChips(tokens[2]);
	    break;
	case "roll":
	    if (tokens.length <= 3){
		error = "The 'roll' command requires two argumenst: character name and dice specification";
		break;
	    }
	    error = DitV.rollChips(tokens[2], tokens.slice(3).join(" "));
	    break;
	case "count":
	    if (tokens.length <= 2){
		error = "The 'count' command requires one argument: character name";
		break;
	    }
	    var counts = DitV.countChips(tokens[2]);
	    if (typeof(counts) == typeof("")){
		error = counts;
		break;
	    }
	    var countMsg = "&{template:default} {{name=" + tokens[2] + " Chip Count}}";
	    for (var i = 1; i <= DitV.MAX_VALUE; i++){
		if (counts[i]){
		    countMsg += " {{" + i + "=" + counts[i] + "}}";
		}
	    }
	    DitV.write(countMsg, "", "", who);
	    break;
	case "setimage":
	    if (tokens.length <= 2){
		error = "The 'setimage' command requires at least one argument: chip value";
		break;
	    }
	    var value = parseInt(tokens[2]);
	    if ((value <= 0) || (value > DitV.MAX_VALUE)){
		error = "Chip value must be between 1 and " + DitV.MAX_VALUE;
		break;
	    }
	    var imgUrl = "";
	    if (tokens.length > 3){
		imgUrl = tokens[3];
	    }
	    else{
		if ((!msg.selected) || (msg.selected.length != 1) || (msg.selected[0]._type != "graphic")){
		    error = "Must either pass a URL or call setimage with exactly one token selected";
		    break;
		}
		var imgToken = getObj(msg.selected[0]._type, msg.selected[0]._id);
		if (!imgToken){
		    error = "Unable to get selected token";
		    break;
		}
		imgUrl = imgToken.get('imgsrc').replace(/[/][^/.]*[.](jpg|png)/, "/thumb.$1");
	    }
	    state.DitV.CHIP_URLS[value] = imgUrl;
	    break;
	case "images":
	    var imgMsg = "&{template:default} {{name=Chip Images}} {{Default=" + (DitV.GENERIC_URL || "undefined") + "}}";
	    for (var i = 1; i <= DitV.MAX_VALUE; i++){
		imgMsg += "{{" + i + "=";
		if (state.DitV.CHIP_URLS[i]){
		    var imgUrl = state.DitV.CHIP_URLS[i].replace(/[?]\d+$/, "");
		    imgMsg += "[" + state.DitV.CHIP_URLS[i] + "](" + state.DitV.CHIP_URLS[i] + ")";
		}
		else{
		    imgMsg += "undefined";
		}
		imgMsg += "}}";
	    }
	    DitV.write(imgMsg, who, "", "DitV");
	    break;
	case "help":
	    DitV.showHelp(who, tokens[0]);
	    break;
	default:
	    DitV.write("Error: Unrecognized command: " + tokens[0], who, "", "DitV");
	    DitV.showTrackerHelp(who, tokens[0]);
	}
	if (error){
	    DitV.write("Error: " + error, who, "", "DitV");
	}
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (msg.content.indexOf("!ditv") !=0)){ return; }

	return DitV.handleDitVMessage(msg.content.split(" "), msg);
    },

    registerDitV: function(){
	DitV.init();
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!ditv", "!ditv <subcommand> [args]", "Dogs in the Vineyard dice tracker", DitV.handleDitVMessage);
	    if (Shell.write){
		DitV.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", DitV.handleChatMessage);
	}
    }
};

on("ready", function(){ DitV.registerDitV(); })
