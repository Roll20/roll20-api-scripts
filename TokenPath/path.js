var TokenPath = TokenPath || {
    PIP_IMAGE: "https://s3.amazonaws.com/files.d20.io/images/9817292/f_tAiMi01sv2nba2Uuakig/thumb.png?1432944100",
    PIP_SIZE: 30,
    START_TINT: "#80ffff",
    WAYPOINT_TINT: "#8080ff",
    GRID_SIZE: 70,

    ignoreRemoval: {},

    init: function(){
	if (!state.hasOwnProperty('TokenPath')){ state.TokenPath = {}; }
	if (!state.TokenPath.hasOwnProperty('pips')){ state.TokenPath.pips = []; }
	if (!state.TokenPath.hasOwnProperty('waypoints')){ state.TokenPath.waypoints = []; }
    },

    removeToken: function(tok){
	TokenPath.ignoreRemoval[tok.id] = true;
	tok.remove();
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
		if (tok){ TokenPath.removeToken(tok); }
	    }
	}

	// start new path if current turn is for a valid token
	var tok = getObj("graphic", newTurns[0].id);
	if (!tok){ return; }
	state.TokenPath.pips.push({'x': tok.get('left'), 'y': tok.get('top'), 'distance': 0, 'round': 0});
    },

    drawPath: function(src, dest, diag, scale, pageId, layer, controlledBy){
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
						    '_pageid':		pageId,
						    'imgsrc':		TokenPath.PIP_IMAGE,
						    'left':		pip.x,
						    'top':		pip.y,
						    'width':		TokenPath.PIP_SIZE,
						    'height':		TokenPath.PIP_SIZE,
						    'layer':		layer,
						    'name':		"" + (Math.round(pip.distance * 10) / 10),
						    'controlledby':	controlledBy,
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
    },

    updatePath: function(pathStart, pathEnd, wp, diag, scale, pageId, layer, controlledBy){
	// remove old pips between pathStart and pathEnd (leaving endpoints in place)
	for (var i = pathStart + 1; i < pathEnd; i++){
	    if (!state.TokenPath.pips[i].token){ continue; }
	    var pipTok = getObj("graphic", state.TokenPath.pips[i].token);
	    if (pipTok){ TokenPath.removeToken(pipTok); }
	}
	// draw a new path from pathStart to pathEnd
	var newPath = TokenPath.drawPath(state.TokenPath.pips[pathStart], state.TokenPath.pips[pathEnd],
					    diag, scale, pageId, layer, controlledBy);
	// update pathEnd
	newPath[newPath.length - 1].token = state.TokenPath.pips[pathEnd].token;
	var pipTok = getObj("graphic", newPath[newPath.length - 1].token);
	pipTok.set({'name': "" + (Math.round(newPath[newPath.length - 1].distance * 10) / 10)})
	// splice in new path
	var oldLen = pathEnd - pathStart, newLen = newPath.length, dLen = newLen - oldLen;
	newPath.unshift(oldLen);
	newPath.unshift(pathStart + 1);
	state.TokenPath.pips.splice.apply(state.TokenPath.pips, newPath);
	// update waypoints based on the length difference between the old and new paths
	for (var i = wp; i < state.TokenPath.waypoints.length; i++){
	    state.TokenPath.waypoints[i] += dLen;
	}
	return pathEnd + dLen;
    },

    handleTokenMove: function(tok, prev){
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
	    var wpIdx, isWp = false;
	    for (wpIdx = 0; wpIdx < state.TokenPath.waypoints.length; wpIdx++){
		if (state.TokenPath.waypoints[wpIdx] == pipIdx){ isWp = true; }
		if (state.TokenPath.waypoints[wpIdx] >= pipIdx){ break; }
	    }
	    if (pipIdx == 0){
		// tok was start point; create a new start point
		var pipTok = createObj("graphic", {'_subtype':		"token",
						    '_pageid':		tok.get('pageid'),
						    'imgsrc':		TokenPath.PIP_IMAGE,
						    'left':		state.TokenPath.pips[0].x,
						    'top':		state.TokenPath.pips[0].y,
						    'width':		TokenPath.PIP_SIZE,
						    'height':		TokenPath.PIP_SIZE,
						    'layer':		tok.get('layer'),
						    'name':		"0",
						    'controlledby':	tok.get('controlledby'),
						    'tint_color':	TokenPath.START_TINT,
						    'showname':		true,
						    'showplayers_name':	true});
		toFront(pipTok);
		var startPip = {'x':		state.TokenPath.pips[0].x,
				'y':		state.TokenPath.pips[0].y,
				'distance':	0,
				'round':	0,
				'token':	pipTok.id};
		state.TokenPath.pips.unshift(startPip);
		for (var i = 0; i < state.TokenPath.waypoints.length; i++){
		    state.TokenPath.waypoints[i] += 1;
		}
		pipIdx = 1;
	    }
	    if (pipIdx == state.TokenPath.pips.length - 1){
		// tok was end point; create a new end point
		var pipTok = createObj("graphic", {'_subtype':		"token",
						    '_pageid':		tok.get('pageid'),
						    'imgsrc':		TokenPath.PIP_IMAGE,
						    'left':		state.TokenPath.pips[pipIdx].x,
						    'top':		state.TokenPath.pips[pipIdx].y,
						    'width':		TokenPath.PIP_SIZE,
						    'height':		TokenPath.PIP_SIZE,
						    'layer':		tok.get('layer'),
						    'name':		"" + (Math.round(state.TokenPath.pips[pipIdx].distance * 10) / 10),
						    'controlledby':	tok.get('controlledby'),
						    'tint_color':	TokenPath.START_TINT,
						    'showname':		true,
						    'showplayers_name':	true});
		toFront(pipTok);
		var endPip = {'x':		state.TokenPath.pips[pipIdx].x,
				'y':		state.TokenPath.pips[pipIdx].y,
				'distance':	state.TokenPath.pips[pipIdx].distance,
				'round':	state.TokenPath.pips[pipIdx].round,
				'token':	pipTok.id};
		state.TokenPath.pips.push(endPip);
	    }
	    state.TokenPath.pips[pipIdx].x = tok.get('left');
	    state.TokenPath.pips[pipIdx].y = tok.get('top');
	    var pathStart, pathEnd, newEnd;
	    if (isWp){
		// tok is already a waypoint; update paths leading into and out of it
		pathStart = (wpIdx > 0 ? state.TokenPath.waypoints[wpIdx - 1] : 0);
		pathEnd = pipIdx;
		newEnd = TokenPath.updatePath(pathStart, pathEnd, wpIdx, diag, scale, tok.get('pageid'), tok.get('layer'), tok.get('controlledby'));
		pathStart = newEnd;
		pathEnd = (wpIdx + 1 < state.TokenPath.waypoints.length ? state.TokenPath.waypoints[wpIdx + 1] : state.TokenPath.pips.length - 1);
		newEnd = TokenPath.updatePath(pathStart, pathEnd, wpIdx + 1, diag, scale, tok.get('pageid'), tok.get('layer'), tok.get('controlledby'));
	    }
	    else{
		// tok was not a waypoint; upgrade it to one and split path it was on into one in and one out of it
		pathStart = (wpIdx > 0 ? state.TokenPath.waypoints[wpIdx - 1] : 0);
		pathEnd = pipIdx;
		newEnd = TokenPath.updatePath(pathStart, pathEnd, wpIdx, diag, scale, tok.get('pageid'), tok.get('layer'), tok.get('controlledby'));
		state.TokenPath.waypoints.splice(wpIdx, 0, newEnd);
		tok.set({'tint_color': TokenPath.WAYPOINT_TINT});
		pathStart = newEnd;
		pathEnd = (wpIdx + 1 < state.TokenPath.waypoints.length ? state.TokenPath.waypoints[wpIdx + 1] : state.TokenPath.pips.length - 1);
		newEnd = TokenPath.updatePath(pathStart, pathEnd, wpIdx + 1, diag, scale, tok.get('pageid'), tok.get('layer'), tok.get('controlledby'));
	    }
	    var allPips = state.TokenPath.pips;
	    var distance = allPips[newEnd].distance, round = allPips[newEnd].round;
	    for (var i = newEnd + 1; i < allPips.length; i++){
		if ((allPips[i].x == allPips[i - 1].x) || (allPips[i].y == allPips[i - 1].y) || diag == "foure"){ distance += scale; }
		else if (diag == "manhattan"){ distance += 2 * scale; }
		else if (diag == "threefive"){
		    distance += scale * (1 + round);
		    round = 1 - round;
		}
		else{ distance += Math.sqrt(2) * scale; }
		allPips[i].distance = distance;
		allPips[i].round = round;
		if (allPips[i].token){
		    var pipTok = getObj("graphic", allPips[i].token);
		    if (pipTok){
			pipTok.set({'distance': distance, 'round': round});
		    }
		}
	    }
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
						'tint_color':		TokenPath.START_TINT,
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
		if (pipTok){ TokenPath.removeToken(pipTok); }
	    }
	}

	// generate new path from last good pip to tok's current position
	var newPips = TokenPath.drawPath(state.TokenPath.pips[lastGoodPip], {'x': tok.get('left'), 'y': tok.get('top')},
					    diag, scale, tok.get('pageid'), tok.get('layer'), tok.get('controlledby'));
	if (newPips.length > 0){
	    var lastPip = newPips[newPips.length - 1];
	    var pipTok = createObj("graphic", {'_subtype':		"token",
						'_pageid':		tok.get('pageid'),
						'imgsrc':		TokenPath.PIP_IMAGE,
						'left':			lastPip.x,
						'top':			lastPip.y,
						'width':		TokenPath.PIP_SIZE,
						'height':		TokenPath.PIP_SIZE,
						'layer':		tok.get('layer'),
						'name':			"" + (Math.round(lastPip.distance * 10) / 10),
						'controlledby':		tok.get('controlledby'),
						'showname':		true,
						'showplayers_name':	true});
	    lastPip.token = pipTok.id;
	    toFront(pipTok);
	    for (var i = 0; i < newPips.length; i++){ state.TokenPath.pips.push(newPips[i]); }
	}
    },

    handleTokenDelete: function(tok){
	if (TokenPath.ignoreRemoval[tok.id]){
	    delete TokenPath.ignoreRemoval[tok.id];
	    return;
	}

	var idx;

	for (idx = 0; idx < state.TokenPath.waypoints.length; idx++){
	    if (state.TokenPath.pips[state.TokenPath.waypoints[idx]].token == tok.id){ break; }
	}
	if (idx < state.TokenPath.waypoints.length){
	    // tok was a waypoint; delete waypoint
	    state.TokenPath.waypoints.splice(idx, 1);
	    var page = getObj("page", tok.get('pageid'));
	    var diag = page.get('diagonaltype'), scale = page.get('scale_number');
	    var pathStart = (idx > 0 ? state.TokenPath.waypoints[idx - 1] : 0);
	    var pathEnd = (idx < state.TokenPath.waypoints.length ? state.TokenPath.waypoints[idx] : state.TokenPath.pips.length - 1);
	    var newEnd = TokenPath.updatePath(pathStart, pathEnd, idx, diag, scale, tok.get('pageid'), tok.get('layer'), tok.get('controlledby'));
	    var allPips = state.TokenPath.pips;
	    var distance = allPips[newEnd].distance, round = allPips[newEnd].round;
	    for (var i = newEnd + 1; i < allPips.length; i++){
		if ((allPips[i].x == allPips[i - 1].x) || (allPips[i].y == allPips[i - 1].y) || diag == "foure"){ distance += scale; }
		else if (diag == "manhattan"){ distance += 2 * scale; }
		else if (diag == "threefive"){
		    distance += scale * (1 + round);
		    round = 1 - round;
		}
		else{ distance += Math.sqrt(2) * scale; }
		allPips[i].distance = distance;
		allPips[i].round = round;
		if (allPips[i].token){
		    var pipTok = getObj("graphic", allPips[i].token);
		    if (pipTok){
			pipTok.set({'distance': distance, 'round': round});
		    }
		}
	    }
	    return;
	}

	for (idx = 0; idx < state.TokenPath.pips.length; idx++){
	    if (state.TokenPath.pips[idx].token == tok.id){ break; }
	}
	if (idx < state.TokenPath.pips.length){
	    // tok was a non-waypoint pip; replace pip
	    var pip = state.TokenPath.pips[idx];
	    var pipTok = createObj("graphic", {'_subtype':		"token",
						'_pageid':		tok.get('pageid'),
						'imgsrc':		TokenPath.PIP_IMAGE,
						'left':			pip.x,
						'top':			pip.y,
						'width':		TokenPath.PIP_SIZE,
						'height':		TokenPath.PIP_SIZE,
						'layer':		tok.get('layer'),
						'name':			"" + (Math.round(pip.distance * 10) / 10),
						'controlledby':		tok.get('controlledby'),
						'showname':		true,
						'showplayers_name':	true});
	    pip.token = pipTok.id;
	    toFront(pipTok);
	    return;
	}
    },

    registerTokenPath: function(){
	TokenPath.init();
	on("change:campaign:turnorder", TokenPath.handleTurnChange);
	on("change:graphic", TokenPath.handleTokenMove); //maybe change:graphic:left and change:graphic:top
	on("destroy:graphic", TokenPath.handleTokenDelete);
    }
};

on("ready", function(){ TokenPath.registerTokenPath(); });
