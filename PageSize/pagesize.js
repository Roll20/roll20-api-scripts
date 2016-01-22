var PageSize = PageSize || {
    GRID_SIZE: 70,

    ANCHORS: {'top-left': "tl", 'tl': "tl", 'left-top': "tl", 'lt': "tl", 'upper-left': "tl", 'ul': "tl", 'left-upper': "tl", 'lu': "tl",
		'top': "t", 't': "t", 'center-top': "t", 'ct': "t", 'top-center': "t", 'tc': "t",
		'top-right': "tr", 'tr': "tr", 'right-top': "tr", 'rt': "tr", 'upper-right': "tr", 'ur': "tr", 'right-upper': "tr", 'ru': "tr",
		'left': "l", 'l': "l", 'center-left': "l", 'cl': "l", 'left-center': "l", 'lc': "l",
		'center': "c", 'c': "c", 'center-center': "c", 'cc': "c",
		'right': "r", 'r': "r", 'center-right': "r", 'cr': "r", 'right-center': "r", 'rc': "r",
		'bottom-left': "bl", 'bl': "bl", 'left-bottom': "bl", 'lb': "bl", 'lower-left': "bl", 'll': "bl", 'left-lower': "bl",
		'bottom': "b", 'b': "b", 'center-bottom': "b", 'cb': "b", 'bottom-center': "b", 'bc': "b",
		'bottom-right': "br", 'br': "br", 'right-bottom': "br", 'rb': "br", 'lower-right': "br", 'lr': "br", 'right-lower': "br", 'rl': "br"},

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd){
	var helpMsg = "";
	helpMsg += "Usage: " + cmd + " [options] X Y\n";
	helpMsg += "  or:  " + cmd + " [options] x X\n";
	helpMsg += "  or:  " + cmd + " [options] y Y\n";
	helpMsg += "In the first form, resizes page to X,Y.\n";
	helpMsg += "In the second and third forms, resizes only the width or height.\n";
	helpMsg += "X and/or Y can use +N or -N to adjust relative to current size.";
	PageSize.write(helpMsg, who, "", "PageSize");
	helpMsg = "Options:\n";
	helpMsg += "  -h, --help:               display this help message\n";
	helpMsg += "  -p ID, --page ID:         resize specified page\n";
	helpMsg += "  -P, --playerpage:         resize page with player ribbon\n";
	helpMsg += "  -a POS, --anchor POS:     where to anchor existing contents\n";
	helpMsg += "                            default is top-left, adjusting bottom and right edges\n";
	helpMsg += "                            must be one of: top-left, top, top-right,\n";
	helpMsg += "                                            left, center, right,\n";
	helpMsg += "                                            bottom-left, bottom, bottom-right\n";
	helpMsg += "  -e MODE, --edge MODE:     mode for adjusting existing contents when page edge moves:\n"
	helpMsg += "                                push:    move all contents inside new edges (default)\n";
	helpMsg += "                                crop:    remove contents outside new edges\n";
	helpMsg += "                                scale:   move contents based on ratio of new size to old\n";
	helpMsg += "                                stretch: as scale, but resize contents as well\n";
	PageSize.write(helpMsg, who, "font-size: small; font-family: monospace", "PageSize");
    },

    handlePageSizeMessage: function(tokens, msg){
	if (tokens.length < 3){
	    return PageSize.showHelp(msg.who, tokens[0]);
	}
	var args = {'anchor': "tl", 'edge': "push"};
	var getArg = null;
	for (var i = 1; i < tokens.length; i++){
	    if (getArg){
		args[getArg] = tokens[i];
		getArg = null;
		continue;
	    }
	    switch (tokens[i]){
	    case "-p":
	    case "--page":
		getArg = 'page';
		break;
	    case "-P":
	    case "--playerpage":
		args['page'] = Campaign().get('playerpageid');
		break;
	    case "-a":
	    case "--anchor":
		getArg = 'anchor';
		break;
	    case "-e":
	    case "--edge":
		getArg = 'edge';
		break;
	    case "x":
	    case "y":
		getArg = tokens[i];
		break;
	    case "-h":
	    case "--help":
		return PageSize.showHelp(msg.who, tokens[0]);
	    default:
		if (!args.hasOwnProperty('x')){ args['x'] = tokens[i]; }
		else if (!args.hasOwnProperty('y')){ args['y'] = tokens[i]; }
		else{
		    PageSize.write("Unrecognized argument: " + tokens[i], msg.who, "", "PageSize");
		    return PageSize.showHelp(msg.who, tokens[0]);
		}
	    }
	}
	if (getArg){
	    PageSize.write("Expected argument for " + getArg, msg.who, "", "PageSize");
	    return PageSize.showHelp(msg.who, tokens[0]);
	}

	// verify anchor is valid
	var anchor = PageSize.ANCHORS[args['anchor']];
	if (!anchor){
	    PageSize.write("Invalid anchor: " + args['anchor'], msg.who, "", "PageSize");
	    return PageSize.showHelp(msg.who, tokens[0]);
	}

	// if no page specified, choose a default page
	if (!args['page']){
	    // if player has a token selected, use its page
	    if (msg.selected){
		for (var i = 0; i < msg.selected.length; i++){
		    var tok = getObj(msg.selected[i]._type, msg.selected[i]._id);
		    if (tok){
			args['page'] = tok._pageid;
			break;
		    }
		}
	    }
	    // otherwise, if player is on their own page, use that
	    if (!args['page']){
		var playerPages = Campaign().get('playerspecificpages');
		if (playerPages){ args['page'] = playerPages[msg.playerid]; }
	    }
	    // otherwise, use the page with the players ribbon
	    if (!args['page']){ args['page'] = Campaign().get('playerpageid'); }
	}

	// grab page object, and verify specified page ID is valid
	var page = getObj("page", args['page']);
	if (!page){
	    PageSize.write("Unable to locate page " + args['page'], msg.who, "", "PageSize");
	    return;
	}

	// get new X and Y size, verifying specified X and Y are valid
	var oldX = page.get('width'), oldY = page.get('height'), x = 0, y = 0;
	if ((!args.x) || (args.x.charAt(0) == '+') || (args.x.charAt(0) == '-')){
	    x += oldX;
	    if (args.x){ args.x = args.x.substring(1); }
	}
	if (args.x){ x += parseInt(args.x); }
	if ((!x) || (x <= 0)){
	    PageSize.write("Invalid new X size: " + (args.x || x), msg.who, "", "PageSize");
	    return PageSize.showHelp(msg.who, tokens[0]);
	}
	if ((!args.y) || (args.y.charAt(0) == '+') || (args.y.charAt(0) == '-')){
	    y += oldY;
	    if (args.y){ args.y = args.y.substring(1); }
	}
	if (args.y){ y += parseInt(args.y); }
	if ((!y) || (y <= 0)){
	    PageSize.write("Invalid new Y size: " + (args.y || y), msg.who, "", "PageSize");
	    return PageSize.showHelp(msg.who, tokens[0]);
	}

	// move page contents as necessary based on new size, anchor, and edge
	var tokens = findObjs({_type: "graphic", _pageid: args['page']});
	switch (args['edge']){
	case "push":
	case "crop":
	    var xMax = x * PageSize.GRID_SIZE, yMax = y * PageSize.GRID_SIZE;
	    var dX, dY;
	    if ((anchor == "tl") || (anchor == "l") || (anchor == "bl")){ dX = 0; }
	    else if ((anchor == "t") || (anchor == "c") || (anchor == "b")){ dX = (x - oldX) * PageSize.GRID_SIZE / 2; }
	    else { dX = (x - oldX) * PageSize.GRID_SIZE; }
	    if ((anchor == "tl") || (anchor == "t") || (anchor == "tr")){ dY = 0; }
	    else if ((anchor == "l") || (anchor == "c") || (anchor == "r")){ dY = (y - oldY) * PageSize.GRID_SIZE / 2; }
	    else{ dY = (y - oldY) * PageSize.GRID_SIZE; }
	    for (var i = 0; i < tokens.length; i++){
		var tokX = tokens[i].get('left') + dX, tokY = tokens[i].get('top') + dY;
		if ((tokX < 0) || (tokX >= xMax)){
		    // token outside new viewable area; push inside or crop based on args['edge']
		    var tokRad = tokens[i].get('width') / 2;
		    if (args['edge'] == "push"){
			if ((tokX < 0) ^ (tokens[i].get('width') >= xMax)){
			    // either token is left of page and fits in page, or is right of page and doesn't fit in page:
			    // align token's left edge with page's left edge
			    tokX = tokRad;
			}
			else{
			    // either token is right of page and fits in page, or is left of page and doesn't fit in page:
			    // align token's right edge with page's right edge
			    tokX = xMax - tokRad;
			}
		    }
		    else{
			// crop token if it's far enough outside of new bounds to no longer be visible
			if ((tokX + tokRad < 0) || (tokX - tokRad >= xMax)){
			    tokens[i].remove();
			    continue;
			}
		    }
		}
		if ((tokY < 0) || (tokY >= yMax)){
		    // token outside new viewable area; push inside or crop based on args['edge']
		    var tokRad = tokens[i].get('height') / 2;
		    if (args['edge'] == "push"){
			if ((tokY < 0) ^ (tokens[i].get('height') >= yMax)){
			    // either token is left of page and fits in page, or is right of page and doesn't fit in page:
			    // align token's left edge with page's left edge
			    tokY = tokRad;
			}
			else{
			    // either token is right of page and fits in page, or is left of page and doesn't fit in page:
			    // align token's right edge with page's right edge
			    tokY = yMax - tokRad;
			}
		    }
		    else{
			// crop token if it's far enough outside of new bounds to no longer be visible
			if ((tokY + tokRad < 0) || (tokY - tokRad >= yMax)){
			    tokens[i].remove();
			    continue;
			}
		    }
		}
		tokens[i].set({'left': tokX, 'top': tokY});
	    }
	    break;
	case "scale":
	case "stretch":
	    var xRatio = (oldX ? x / oldX : 1), yRatio = (oldY ? y / oldY : 1);
	    for (var i = 0; i < tokens.length; i++){
		var newProps = {'left': tokens[i].get('left') * xRatio, 'top': tokens[i].get('top') * yRatio};
		if (args['edge'] == "stretch"){
		    newProps['width'] = tokens[i].get('width') * xRatio;
		    newProps['height'] = tokens[i].get('height') * yRatio;
		}
		tokens[i].set(newProps);
	    }
	    break;
	default:
	    PageSize.write("Invalid edge mode: " + args['edge'], msg.who, "", "PageSize");
	    return PageSize.showHelp(msg.who, tokens[0]);
	}

	// resize page
	page.set({'width': x, 'height': y});
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (msg.content.indexOf("!pagesize") != 0)){ return; }

	return PageSize.handlePageSizeMessage(msg.content.split(" "), msg);
    },

    registerPageSize: function(){
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!pagesize", "!pagesize [options] X Y",
				    "Resize a page, optionally moving or scaling its contents", PageSize.handlePageSizeMessage);
	    if (Shell.write){
		PageSize.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", PageSize.handleChatMessage);
	}
    }
};

on("ready", function(){ PageSize.registerPageSize(); });
