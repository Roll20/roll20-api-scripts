var TokenPath = TokenPath || {
    PIP_IMAGE: "https://s3.amazonaws.com/files.d20.io/images/9817292/f_tAiMi01sv2nba2Uuakig/thumb.png?1432944100",
    PIP_SIZE: 30,
    WAYPOINT_TINT: "#8080ff",
    GRID_SIZE: 70,

    init: function(){
	if (!state.hasOwnProperty('TokenPath')){ state.TokenPath = {}; }
	if (!state.TokenPath.hasOwnProperty('pips')){ state.TokenPath.pips = []; }
	if (!state.TokenPath.hasOwnProperty('waypoints')){ state.TokenPath.waypoints = []; }
    },

    handleTurnChange: function(newTurnOrder, oldTurnOrder){
	var newTurns = JSON.parse((typeof(newTurnOrder) == typeof("") ? newTurnOrder : newTurnOrder.get('turnorder') || "[]"));
	var oldTurns = JSON.parse((typeof(oldTurnOrder) == typeof("") ? oldTurnOrder : oldTurnOrder.turnorder || "[]"));

	if ((!newTurns) || (!newTurns.length)){ return; } // nothing in tracker
	if ((oldTurns) && (oldTurns.length) && (newTurns[0].id == oldTurns[0].id)){ return; } // turn didn't change

	// remove existing path
	state.TokenPath.waypoints = [];
	while (state.TokenPath.pips.length > 0){
	    var pip = state.TokenPath.pips.pop();
	    if (pip.token){
		var tok = getObj("graphic", pip.token);
		if (tok){ tok.remove(); }
	    }
	}

	// start new path if current turn is for a valid token
	var tok = getObj("graphic", newTurns[0].id);
	if (!tok){ return; }
	state.TokenPath.pips.push({'x': tok.get('left'), 'y': tok.get('top'), 'distance': 0, 'round': 0});
    },

    handleTokenMove: function(tok, prev){
	function drawPath(src, dest, diag, scale){
	    // draw a path from pip src to d, excluding src; return array of pips, adding pip token for all but dest
	    var retval = [];

	    var xOff = dest.x - src.x, yOff = dest.y - src.y;
	    if (xOff % TokenPath.GRID_SIZE){ xOff = Math.round(xOff / TokenPath.GRID_SIZE) * TokenPath.GRID_SIZE; }
	    if (yOff % TokenPath.GRID_SIZE){ yOff = Math.round(yOff / TokenPath.GRID_SIZE) * TokenPath.GRID_SIZE; }

	    var pip = src;
	    while ((xOff != 0) || (yOff != 0)){
		var xDir = (xOff ? xOff / Math.abs(xOff) : 0), yDir = (yOff ? yOff / Math.abs(yOff) : 0);
		var xStep = xDir * TokenPath.GRID_SIZE, yStep = yDir * TokenPath.GRID_SIZE;
		if (retval.length > 0){
		    //draw token for pip
		    var pipTok = createObj("graphic", {'_subtype':		"token",
							'_pageid':		tok.get('pageid'),
							'imgsrc':		TokenPath.PIP_IMAGE,
							'left':			pip.x,
							'top':			pip.y,
							'width':		TokenPath.PIP_SIZE,
							'height':		TokenPath.PIP_SIZE,
							'layer':		tok.get('layer'),
							'name':			"" + (Math.round(pip.distance * 100) / 100),
							'controlledby':		tok.get('controlledby'),
							'showname':		true,
							'showplayers_name':	true});
		    pip.token = pipTok.id;
		    toFront(pipTok);
		}
		var distance = pip.distance, round = pip.round;
		if ((xStep == 0) || (yStep == 0) || (diag == "foure")){ distance += scale; }
		else if (diag == "manhattan"){ distance += 2 * scale; }
		else if (diag == "threefive"){
		    distance += scale * (1 + round);
		    round = 1 - round;
		}
		else{ distance += Math.sqrt(2) * scale; }
		pip = {'x':		pip.x + xStep,
			'y':		pip.y + yStep,
			'distance':	distance,
			'round':	round}
		retval.push(pip);
		xOff -= xStep;
		yOff -= yStep;
	    }
	    if (retval.length > 0){
		retval[retval.length - 1].x = dest.x;
		retval[retval.length - 1].y = dest.y;
	    }
	    return retval;
	}

	var page = getObj("page", tok.get('pageid'));
	var diag = page.get('diagonaltype'), scale = page.get('scale_number');

	var pipIdx;
	for (pipIdx = 0; pipIdx < state.TokenPath.pips.length; pipIdx++){
	    if (state.TokenPath.pips[pipIdx].token == tok.id){ break; }
	}
	if (pipIdx < state.TokenPath.pips.length){
	    // tok is a pip token
	    var xOff = tok.get('left') % TokenPath.GRID_SIZE, yOff = tok.get('top') % TokenPath.GRID_SIZE, expOff = TokenPath.GRID_SIZE / 2;
	    if ((xOff != expOff) || (yOff != expOff)){
		// move pip to center of square
		tok.set({'left': tok.get('left') + expOff - xOff, 'top': tok.get('top') + expOff - yOff});
	    }
/////
//
	    //if pipIdx==0: create a new waypoint at start of state.TokenPath.waypoints
	    //elif tok is a waypoint: move that waypoint
	    //else: create a new waypoint between waypoints to either side of pip
	    //recalculate affected subpaths; delete affected pip tokens and create new ones (new pip tokens on same layer as existing ones)
	    //be sure to update distances in later path segments (both in pips and in tokens)
//
/////
	    return;
	}

	var turnOrder = JSON.parse(Campaign().get('turnorder') || "[]");
	if ((!turnOrder) || (!turnOrder.length) || (tok.id != turnOrder[0].id)){ return; } // it isn't tok's turn; ignore its movement

	// if we get here, tok is at the top of the turn order; track its movement
	if (!state.TokenPath.pips[0].token){
	    // initial pip not created yet; do so
	    var pipTok = createObj("graphic", {'_subtype':		"token",
						'_pageid':		tok.get('pageid'),
						'imgsrc':		TokenPath.PIP_IMAGE,
						'left':			state.TokenPath.pips[0].x,
						'top':			state.TokenPath.pips[0].y,
						'width':		TokenPath.PIP_SIZE,
						'height':		TokenPath.PIP_SIZE,
						'layer':		tok.get('layer'),
						'name':			"0",
						'controlledby':		tok.get('controlledby'),
						'tint_color':		TokenPath.WAYPOINT_TINT,
						'showname':		true,
						'showplayers_name':	true});
	    state.TokenPath.pips[0].token = pipTok.id;
	    toFront(pipTok);
	}

	// delete last segment of path
	var lastGoodPip = (state.TokenPath.waypoints.length > 0 ? state.TokenPath.waypoints[state.TokenPath.waypoints.length - 1] : 0);
	while (state.TokenPath.pips.length > lastGoodPip + 1){
	    var pip = state.TokenPath.pips.pop();
	    if (pip.token){
		var pipTok = getObj("graphic", pip.token);
		if (pipTok){ pipTok.remove(); }
	    }
	}

	// generate new path from last good pip to tok's current position
	var newPips = drawPath(state.TokenPath.pips[lastGoodPip], {'x': tok.get('left'), 'y': tok.get('top')}, diag, scale);
	var lastPip = newPips[newPips.length - 1];
	var pipTok = createObj("graphic", {'_subtype':		"token",
					    '_pageid':		tok.get('pageid'),
					    'imgsrc':		TokenPath.PIP_IMAGE,
					    'left':		lastPip.x,
					    'top':		lastPip.y,
					    'width':		TokenPath.PIP_SIZE,
					    'height':		TokenPath.PIP_SIZE,
					    'layer':		tok.get('layer'),
					    'name':		"" + (Math.round(lastPip.distance * 100) / 100),
					    'controlledby':	tok.get('controlledby'),
					    'showname':		true,
					    'showplayers_name':	true});
	lastPip.token = pipTok.id;
	toFront(pipTok);
	for (var i = 0; i < newPips.length; i++){ state.TokenPath.pips.push(newPips[i]); }
    },

    registerTokenPath: function(){
	TokenPath.init();
	on("change:campaign:turnorder", TokenPath.handleTurnChange);
	on("change:graphic", TokenPath.handleTokenMove); //maybe change:graphic:left and change:graphic:top
    }
};

on("ready", function(){ TokenPath.registerTokenPath(); });
