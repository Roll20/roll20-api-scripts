var Animation = Animation || {
    MIN_FRAME_DURATION: 30,

    ARG_MAP: {'-x': "x",	'-y': "y",
	    '-w': "width",	'--width':	"width",
	    '-h': "height",	'--height':	"height",
	    '-r': "rotation",	'--rotation':	"rotation",
	    '-a': "auraRadius",	'--aura':	"auraRadius",
	    			'--auracolor':	"auraColor",
	    '-t': "tint",	'--tintcolor':	"tint",
	    '-l': "lightRadius",'--light':	"lightRadius",
	    '-d': "lightDim",	'--dim':	"lightDim",
	    			'--lightangle':	"lightAngle",
	    '-I': "image",	'--image':	"image",
	    '-D': "duration",	'--duration':	"duration",
	    '-i': "insertIdx",	'--insert':	"insertIdx",
	    '-C': "copyIdx",	'--copy':	"copyIdx",
	    '-T': "target",	'--target':	"target",
	    '-f': "timeScale",	'--timefactor':	"timeScale",
				'--xscale':	"xScale",
				'--yscale':	"yScale",
				'--cycles':	"cycles",
	    '-p': "pageId",	'--page':	"pageId"},
    REVERSE_ARG_MAP: {},

    FRAME_DEFAULTS: {'x': 0, 'y': 0, 'width': 70, 'height': 70, 'rotation': 0,
		    'auraRadius': "", 'auraColor': "#ffff99", 'auraSquare': false,
		    'tint': "transparent", 'lightRadius': "", 'lightDim': "", 'lightAngle': 360},

    jobTimers: {},

    init: function(){
	if (!state.hasOwnProperty('Animation')){ state.Animation = {}; }
	if (!state.Animation.hasOwnProperty('images')){ state.Animation.images = {}; }
	if (!state.Animation.hasOwnProperty('animations')){ state.Animation.animations = {}; }
	if (!state.Animation.hasOwnProperty('running')){ state.Animation.running = {}; }

	for (var jobId in state.Animation.running){
	    Animation.updateJob(jobId);
	}
    },

    removeRunningAnimation: function(jobId){
	if (!state.Animation.running[jobId]){ return; }
	if (state.Animation.running[jobId].deleting){ return; }
	state.Animation.running[jobId].deleting = true;
	if (Animation.jobTimers[jobId]){
	    clearTimeout(Animation.jobTimers[jobId]);
	    delete Animation.jobTimers[jobId];
	}
	var tok = getObj("graphic", jobId);
	if (tok){ tok.remove(); }
	delete state.Animation.running[jobId];
    },

    handleDelete: function(tok){
	if (!state.Animation.running[tok.id]){ return; }
	if (state.Animation.running[tok.id].deleting){ return; }
	if (!Animation.jobTimers[tok.id]){
	    // not deleting job, but no timer; job must be initializing or changing frames
	    state.Animation.running[tok.id].cancel = true;
	    return;
	}
	Animation.removeRunningAnimation(tok.id);
    },

    updateJob: function(jobId){
	if (Animation.jobTimers[jobId]){
	    delete Animation.jobTimers[jobId];
	}
	var job = state.Animation.running[jobId];
	if ((!job) || (job.deleting)){ return; }
	if (job.cancel){
	    // job was canceled; remove it
	    Animation.removeRunningAnimation(jobId);
	    return;
	}
	var tok = getObj("graphic", jobId);
	if (!tok){
	    // token no longer exists; remove job
	    Animation.removeRunningAnimation(jobId);
	    return;
	}

	// update to next frame
	job.curFrame = (job.curFrame + 1) % job.frames.length;
	if (job.curFrame == 0){
	    // job finished a cycle; move on to the next one
	    job.cycles = job.cycles - 1;
	}
	if (job.cycles <= 0){
	    // job has run out of cycles and is finished; remove it
	    Animation.removeRunningAnimation(jobId);
	    return;
	}

	var handlerFunc = function(){ Animation.updateJob(jobId); }
	tok.set(job.frames[job.curFrame].properties);
	Animation.jobTimers[jobId] = setTimeout(handlerFunc, job.frames[job.curFrame].duration);
    },

    addJob: function(animName, pageId, x, y, rotation, timeScale, xScale, yScale, cycles){
	var anim = state.Animation.animations[animName];
	if (!anim){ return "Error: No animation defined with name " + animName; }
	if (anim.frames.length <= 0){ return "Error: Animation '" + animName + "' does not have any frames"; }
	if ((cycles || anim.cycles) == 0){ return "Error: Cannot run animation '" + animName + "' without specifying nonzero cycle count"; }

	var job = {'frames': [], 'curFrame': 0, 'cycles': cycles || anim.cycles};
	for (var i = 0; i < anim.frames.length; i++){
	    if (anim.frames[i].duration * timeScale < Animation.MIN_FRAME_DURATION){
		return "Error: Time factor reduces duration below MIN_FRAME_DURATION (" + Animation.MIN_FRAME_DURATION + ")";
	    }
	    var props = {'imgsrc':		anim.frames[i].url,
			'left':			x + (anim.frames[i].x * xScale),
			'top':			y + (anim.frames[i].y * yScale),
			'width':		anim.frames[i].width * xScale,
			'height':		anim.frames[i].height * yScale,
			'rotation':		anim.frames[i].rotation + rotation,
			'aura1_radius':		anim.frames[i].auraRadius * (xScale + yScale) / 2,
			'aura1_color':		anim.frames[i].auraColor,
			'aura1_square':		anim.frames[i].auraSquare,
			'tint_color':		anim.frames[i].tint,
			'light_radius':		anim.frames[i].lightRadius * (xScale + yScale) / 2,
			'light_dimradius':	anim.frames[i].lightDim * (xScale + yScale) / 2,
			'light_angle':		anim.frames[i].lightAngle};
	    job.frames.push({'properties': props, 'duration': anim.frames[i].duration * timeScale});
	}

	var tok = createObj("graphic", {'_subtype':		"token",
					'_pageid':		pageId,
					'imgsrc':		job.frames[0].properties.imgsrc,
					'left':			job.frames[0].properties.left,
					'top':			job.frames[0].properties.top,
					'width':		job.frames[0].properties.width,
					'height':		job.frames[0].properties.height,
					'rotation':		job.frames[0].properties.rotation,
					'layer':		"objects",
					'isdrawing':		true,
					'aura1_radius':		job.frames[0].properties.aura1_radius,
					'aura1_color':		job.frames[0].properties.aura1_color,
					'aura1_square':		job.frames[0].properties.aura1_square,
					'tint_color':		job.frames[0].properties.tint_color,
					'light_radius':		job.frames[0].properties.light_radius,
					'light_dimradius':	job.frames[0].properties.light_dimradius,
					'light_otherplayers':	true,
					'light_angle':		job.frames[0].properties.light_angle});
	state.Animation.running[tok.id] = job;
	toFront(tok);

	var handlerFunc = function(){ Animation.updateJob(tok.id); }
	if (!state.Animation.running[tok.id].cancel){
	    Animation.jobTimers[tok.id] = setTimeout(handlerFunc, job.frames[0].duration);
	}
    },

    write: function(s, who, style, from){
	if (who){
	    who = "/w " + who.split(" ", 1)[0] + " ";
	}
	sendChat(from, who + s.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>"));
    },

    showHelp: function(who, cmd, subCmd){
	var usage  = "", helpMsg = "";
	switch (subCmd){
	case "add":
	    usage += "Usage: " + cmd + " add image NAME [URL]\n";
	    usage += "  or:  " + cmd + " add animation NAME [CYCLES]\n";
	    usage += "  or:  " + cmd + " add frame ANIMATION IMAGE DURATION [options]\n";
	    usage += "In the first form, an image will be named for later reference.\n";
	    usage += "In the second form, an empty animation will be created.\n";
	    usage += "In the third form, a frame will be added to the specified animation.";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name under which the new item will be added\n";
	    helpMsg += "  URL:          Image URL (default is selected token's image)\n";
	    helpMsg += "  CYCLES:       Number of times to run through animation frames (default: 1)\n";
	    helpMsg += "  ANIMATION:    Name of animation to which to add frame\n";
	    helpMsg += "  IMAGE:        Name or URL of image for new frame\n";
	    helpMsg += "  DURATION:     Number of milliseconds to show the frame\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -x X, -y Y            Frame offset, in pixels, from animation origin (default: 0)\n";
	    helpMsg += "  -w W, --width W       Frame width in pixels (default: 70)\n";
	    helpMsg += "  -h H, --height H      Frame height in pixels (default: 70)\n";
	    helpMsg += "  -r A, --rotation A    Frame rotation in degrees (default: 0)\n";
	    helpMsg += "  -a R, --aura R        Radius, in page units, of frame's aura (default: none)\n";
	    helpMsg += "  --auracolor C         Color of frame's aura (default: #FFFF99)\n";
	    helpMsg += "  --aurasquare          Frame's aura will be a square (default: circle)\n";
	    helpMsg += "  -t C, --tint C        Color tint to be applied to frame (default: none)\n";
	    helpMsg += "  -l R, --light R       Radius, in page units, of frame's light (default: none)\n";
	    helpMsg += "  -d R, --dim R         Radius at which light begins to dim (default: none)\n";
	    helpMsg += "  --lightangle A        Angle, in degrees, of emitted light (default: 360)\n";
	    helpMsg += "  -i I, --insert I      Index (0-based) at which to insert new frame (default: end)\n";
	    helpMsg += "  -C I, --copy I        Index of frame to copy (IMAGE and DURATION are optional).\n";
	    helpMsg += "                        If I is negative, it is relative to insertion index\n";
	    helpMsg += "  -I IMG, --image IMG   As IMAGE parameter, for use with --copy\n";
	    helpMsg += "  -D T, --duration T    As DURATION parameter, for use with --copy\n";
	    break;
	case "edit":
	    usage += "Usage: " + cmd + " edit image NAME [URL]\n";
	    usage += "  or:  " + cmd + " edit animation NAME CYCLES\n";
	    usage += "  or:  " + cmd + " edit frame ANIMATION FRAME_INDEX [options]\n";
	    usage += "In the first form, a named image will be replaced with a new image.\n";
	    usage += "In the second form, a named animation will be modified.\n";
	    usage += "In the third form, the specified frame will be modified.";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of item to modify\n";
	    helpMsg += "  URL:          Image URL (default is selected token's image)\n";
	    helpMsg += "  CYCLES:       Number of times to run through animation frames (default: 1)\n";
	    helpMsg += "  ANIMATION:    Name of animation in which to modify frame\n";
	    helpMsg += "  FRAME_INDEX:  Index (0-based) of frame to modify\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -x X, -y Y            Frame offset, in pixels, from animation origin\n";
	    helpMsg += "  -w W, --width W       Frame width in pixels\n";
	    helpMsg += "  -h H, --height H      Frame height in pixels\n";
	    helpMsg += "  -r A, --rotation A    Frame rotation in degrees, relative to animation\n";
	    helpMsg += "  -a R, --aura R        Radius, in page units, of frame's aura\n";
	    helpMsg += "  --auracolor C         Color of frame's aura\n";
	    helpMsg += "  --aurasquare          Frame's aura will be a square\n";
	    helpMsg += "  -t C, --tint C        Color tint to be applied to frame\n";
	    helpMsg += "  -l R, --light R       Radius, in page units, of frame's light\n";
	    helpMsg += "  -d R, --dim R         Radius at which light begins to dim\n";
	    helpMsg += "  --lightangle A        Angle, in degrees, of emitted light\n";
	    helpMsg += "  -I IMG, --image IMG   Name or URL of frame image\n";
	    helpMsg += "  -D T, --duration T    Number of milliseconds to show the frame\n";
	    break;
	case "rename":
	    usage += "Usage: " + cmd + " rename image NAME NEWNAME\n";
	    usage += "  or:  " + cmd + " rename animation NAME NEWNAME";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Current name of item to rename\n";
	    helpMsg += "  NEWNAME:      New name to give to item\n";
	    break;
	case "copy":
	    usage += "Usage: " + cmd + " copy animation NAME NEWNAME\n";
	    usage += "  or:  " + cmd + " copy frame SRC_ANIM SRC_IDX DEST_ANIM [DEST_IDX]\n";
	    usage += "In the first form, a named animation will be copied.\n";
	    usage += "In the third form, the specified frame will be copied.";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of animation to copy\n";
	    helpMsg += "  NEWNAME:      Name of new copy of animation\n";
	    helpMsg += "  SRC_ANIM:     Name of animation from which to copy frame\n";
	    helpMsg += "  SRC_IDX:      Index (0-based) of frame to copy\n";
	    helpMsg += "  DEST_ANIM:    Name of animation into which to copy frame\n";
	    helpMsg += "  DEST_IDX:     Index (0-based) at which to insert copied frame\n";
	    break;
	case "remove":
	    usage += "Usage: " + cmd + " remove image NAME\n";
	    usage += "  or:  " + cmd + " remove animation NAME\n";
	    usage += "  or:  " + cmd + " remove frame ANIMATION FRAME_INDEX\n";
	    usage += "In the first form, a named image will be removed.\n";
	    usage += "In the second form, a named animation will be removed.\n";
	    usage += "In the third form, the specified frame will be removed.";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of item to remove\n";
	    helpMsg += "  ANIMATION:    Name of animation from which to remove frame\n";
	    helpMsg += "  FRAME_INDEX:  Index (0-based) of frame to remove\n";
	    break;
	case "list":
	    usage += "Usage: " + cmd + " list image [NAME]\n";
	    usage += "  or:  " + cmd + " list animation [NAME]\n";
	    usage += "  or:  " + cmd + " list frame ANIMATION [FRAME_INDEX]\n";
	    usage += "The first form will list the names of all images or the URL of a specified image.\n";
	    usage += "The second form will list the names of all animations or summary info about a specified animation.\n";
	    usage += "The third form will list the frames of an animation or all properties of a specified frame.";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of image/animation to describe\n";
	    helpMsg += "  ANIMATION:    Name of animation whose frames will be described\n";
	    helpMsg += "  FRAME_INDEX:  Index (0-based) of frame to describe\n";
	    break;
	case "run":
	    usage += "Usage: " + cmd + " run NAME [options]\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of animation to run\n";
	    helpMsg += "Options:\n";
	    helpMsg += "  -T T, --target T      Token on which to center animation\n";
	    helpMsg += "  -x X, -y Y            Coordinates, in pixels, at which to display animation\n";
	    helpMsg += "                        (default: target token's center, or page center)\n";
	    helpMsg += "  -r A, --rotation A    Animation rotation in degrees (default: 0)\n";
	    helpMsg += "  -f F, --timefactor F  Scale factor for frame durations (default: 1)\n";
	    helpMsg += "  --xscale F            Size scale factor in the X direction (default: 1)\n";
	    helpMsg += "  --yscale F            Size scale factor in the Y direction (default: 1)\n";
	    helpMsg += "                        (light and auras are scaled by the average of X and Y scale)\n";
	    helpMsg += "  --cycles N            Number of times to run through animation frames\n";
	    helpMsg += "                        (default: retain cycles defined in animation)\n";
	    helpMsg += "  -p ID, --page ID      ID of page on which to display animation\n";
	    helpMsg += "  -P, --playerpage      Display animation on page with player ribbon\n";
	    helpMsg += "                        If no page is specified, page with target token will be used.\n";
	    helpMsg += "                        If no target is specified, page with player ribbon will be used\n";
	    break;
	case "export":
	    usage += "Usage: " + cmd + " export NAME [HANDOUT]\n";
	    helpMsg += "Parameters:\n";
	    helpMsg += "  NAME:         Name of animation to export\n";
	    helpMsg += "  HANDOUT:      Name of handout to which to write commands\n";
	    helpMsg += "                If no handout is specified, commands will be whispered to player.\n";
	    break;
	default:
	    usage += "Usage: " + cmd + " COMMAND [options]";
	    helpMsg += "help [COMMAND]:     display generic or command-specific help\n";
	    helpMsg += "add TYPE [...]:     add/name an image, animation, or frame\n";
	    helpMsg += "edit TYPE [...]:    edit a previously-added item\n";
	    helpMsg += "rename TYPE [...]:  rename an image or animation\n";
	    helpMsg += "copy TYPE [...]:    copy an animation or frame\n";
	    helpMsg += "remove TYPE NAME:   remove a previously-added item\n";
	    helpMsg += "list TYPE [...]:    display information about items\n";
	    helpMsg += "run NAME [...]:     display a specified animation\n";
	    helpMsg += "export NAME [...]:  display commands to generate a specified animation\n";
	}
	Animation.write(usage, who, "", "Anim");
	Animation.write(helpMsg, who, "font-size: small; font-family: monospace", "Anim");
    },

    fixupCommand: function(cmd, inlineRolls){
	function replaceInlines(s){
	    if (!inlineRolls){ return s; }
	    var i = parseInt(s.substring(3, s.length - 2));
	    if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i]['expression'])){ return s; }
	    return "[[" + inlineRolls[i]['expression'] + "]]";
	}
	return cmd.replace(/\$\[\[\d+\]\]/g, replaceInlines);
    },

    addImage: function(imgName, url){
	if (state.Animation.images[imgName]){
	    return "Error: Image '" + imgName + "' already defined; please use edit or remove command";
	}
	state.Animation.images[imgName] = url;
    },

    editImage: function(imgName, url){
	if (!state.Animation.images[imgName]){
	    return "Error: Image '" + imgName + "' not defined; please use add command";
	}
	state.Animation.images[imgName] = url;
    },

    renameImage: function(imgName, newName){
	if (!state.Animation.images[imgName]){
	    return "Error: Image '" + imgName + "' not defined; please use add command";
	}
	if (state.Animation.images[newName]){
	    return "Error: Image '" + newName + "' already defined; please use edit or remove command";
	}
	state.Animation.images[newName] = state.Animation.images[imgName];
	delete state.Animation.images[imgName];
    },

    removeImage: function(imgName){
	if (!state.Animation.images[imgName]){
	    return "Warning: Image '" + imgName + "' not defined";
	}
	delete state.Animation.images[imgName];
    },

    listImage: function(who, imgName){
	var output = "";
	if (!imgName){
	    var imgNames = [];
	    for (var k in state.Animation.images){
		if (state.Animation.images.hasOwnProperty(k)){ imgNames.push(k); }
	    }
	    if (imgNames.length <= 0){
		Animation.write("No images defined", who, "", "Anim");
		return;
	    }
	    imgNames.sort();
	    output = imgNames.join("\n");
	}
	else if (!state.Animation.images[imgName]){
	    return "Error: Image '" + imgName + "' not defined";
	}
	else{
	    output = imgName + ": " + state.Animation.images[imgName] + "\n[" + imgName + "](";
	    output += state.Animation.images[imgName].replace(/([/][^/]+[.])(jpg|png).*$/, "$1$2") + ")";
	}
	Animation.write(output, who, "font-size: small; font-family: monospace", "Anim");
    },

    addAnimation: function(animName, cycles){
	if (state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' already defined; please use edit or remove command";
	}
	state.Animation.animations[animName] = {'frames': [], 'cycles': cycles};
    },

    editAnimation: function(animName, cycles){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	state.Animation.animations[animName].cycles = cycles;
    },

    renameAnimation: function(animName, newName){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	if (state.Animation.animations[newName]){
	    return "Error: Animation '" + newName + "' already defined; please use edit or remove command";
	}
	state.Animation.animations[newName] = state.Animation.animations[animName];
	delete state.Animation.animations[animName];
    },

    copyAnimation: function(animName, newName){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	if (state.Animation.animations[newName]){
	    return "Error: Animation '" + newName + "' already defined; please use edit or remove command";
	}
	var src = state.Animation.animations[animName];
	var dest = {'frames': [], 'cycles': src.cycles};
	for (var i = 0; i < src.frames.length; i++){
	    var newFrame = {};
	    for (var k in src.frames[i]){
		if (!src.frames[i].hasOwnProperty(k)){ continue; }
		newFrame[k] = src.frames[i][k];
	    }
	    dest.frames.push(newFrame);
	}
	state.Animation.animations[newName] = dest;
    },

    removeAnimation: function(animName){
	if (!state.Animation.animations[animName]){
	    return "Warning: Animation '" + animName + "' not defined";
	}
	delete state.Animation.animations[animName];
    },

    listAnimation: function(who, animName){
	var output = "";
	if (!animName){
	    var animNames = [], animStats = {};
	    for (var k in state.Animation.animations){
		if (!state.Animation.animations.hasOwnProperty(k)){ continue; }
		animNames.push(k);
		var anim = state.Animation.animations[k];
		animStats[k] = {'duration': 0, 'frames': anim.frames.length * anim.cycles};
		for (var i = 0; i < anim.frames.length; i++){
		    animStats[k].duration += anim.frames[i].duration;
		}
		animStats[k].duration *= anim.cycles;
	    }
	    if (animNames.length <= 0){
		Animation.write("No animations defined", who, "", "Anim");
		return;
	    }
	    animNames.sort();
	    for (var i = 0; i < animNames.length; i++){
		if (i > 0){ output += "\n"; }
		output += animNames[i] + ": ";
		output += (animStats[animNames[i]].duration / 1000) + "s (";
		output += animStats[animNames[i]].frames + " frames)";
	    }
	}
	else if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined";
	}
	else{
	    var anim = state.Animation.animations[animName];
	    var duration = 0;
	    for (var i = 0; i < anim.frames.length; i++){
		duration += anim.frames[i].duration;
	    }
	    output = animName;
	    if (anim.cycles > 1){
		output += " (" + anim.cycles + " cycles)";
	    }
	    output += ":\n  Frames: " + anim.frames.length;
	    if (anim.cycles > 1){
		output += " (x" + anim.cycles + " = " + (anim.frames.length * anim.cycles) + ")";
	    }
	    output += "\n  Duration: " + (duration / 1000) + "s";
	    if (anim.cycles > 1){
		output += " (x" + anim.cycles + " = " + (duration * anim.cycles / 1000) + "s)";
	    }
	}
	Animation.write(output, who, "font-size: small; font-family: monospace", "Anim");
    },

    numify: function(x){
	var xNum = x;
	if (typeof(x) == typeof("")){
	    xNum = parseFloat(x);
	}
	if ("" + xNum == "" + x){ return xNum; }
	return x;
    },

    addFrame: function(animName, idx, props, copyIdx){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	var frames = state.Animation.animations[animName].frames;
	var newFrame = {};
	if ((typeof(idx) != typeof(0)) || (idx < 0) || (idx >= frames.length)){
	    idx = frames.length;
	}
	if (typeof(copyIdx) == typeof(0)){
	    if (copyIdx < 0){ copyIdx += idx; }
	    if ((copyIdx < 0) || (copyIdx >= frames.length)){
		return "Error: Cannot copy from nonexistent frame " + copyIdx;
	    }
	    for (var k in frames[copyIdx]){
		if (!frames[copyIdx].hasOwnProperty(k)){ continue; }
		newFrame[k] = frames[copyIdx][k];
	    }
	}

	if (!newFrame.hasOwnProperty('url')){
	    if (!props['image']){
		return "Error: Must specify frame image";
	    }
	    newFrame['url'] = state.Animation.images[props['image']] || props['image'];
	}
	if (!newFrame.hasOwnProperty('duration')){
	    if (!props['duration']){
		return "Error: Must specify frame duration";
	    }
	    newFrame['duration'] = parseInt(props['duration']);
	    if (newFrame['duration'] < Animation.MIN_FRAME_DURATION){
		return "Error: Duration must be greater than MIN_FRAME_DURATION (" + Animation.MIN_FRAME_DURATION + ")";
	    }
	}

	for (var k in Animation.FRAME_DEFAULTS){
	    if (!Animation.FRAME_DEFAULTS.hasOwnProperty(k)){ continue; }
	    newFrame[k] = (props.hasOwnProperty(k) ? Animation.numify(props[k]) : Animation.FRAME_DEFAULTS[k]);
	}

	frames.splice(idx, 0, newFrame);
    },

    editFrame: function(animName, idx, props){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	var frames = state.Animation.animations[animName].frames;
	if ((idx < 0) || (idx >= frames.length)){
	    return "Error: Animation '" + animName + "' frame " + idx + " does not exist; please use add command";
	}
	if (props['image']){
	    frames[idx]['url'] = state.Animation.images[props['image']] || props['image'];
	}
	if (props.hasOwnKey('duration')){
	    frames[idx]['duration'] = parseInt(props['duration']);
	    if (frames[idx]['duration'] < Animation.MIN_FRAME_DURATION){
		return "Error: Duration must be greater than MIN_FRAME_DURATION (" + Animation.MIN_FRAME_DURATION + ")";
	    }
	}
	for (var k in Animation.FRAME_DEFAULTS){
	    if ((!Animation.FRAME_DEFAULTS.hasOwnProperty(k)) || (!props.hasOwnProperty(k))){ continue; }
	    frames[idx][k] = Animation.numify(props[k]);
	}
    },

    copyFrame: function(srcName, srcIdx, destName, destIdx){
	if (!state.Animation.animations[srcName]){
	    return "Error: Animation '" + srcName + "' not defined; please use add command";
	}
	if (!state.Animation.animations[destName]){
	    return "Error: Animation '" + destName + "' not defined; please use add command";
	}
	var src = state.Animation.animations[srcName], dest = state.Animation.animations[destName];
	if ((srcIdx < 0) || (srcIdx >= src.frames.length)){
	    return "Error: Animation '" + srcName + "' frame " + srcIdx + " does not exist; please use add command";
	}
	if ((typeof(destIdx) != typeof(0)) || (destIdx < 0) || (destIdx >= dest.frames.length)){
	    destIdx = dest.frames.length;
	}
	var newFrame = {};
	for (var k in src.frames[srcIdx]){
	    if (!src.frames[srcIdx].hasOwnProperty(k)){ continue; }
	    newFrame[k] = src.frames[srcIdx][k];
	}
	dest.frames.splice(destIdx, 0, newFrame);
    },

    removeFrame: function(animName, idx){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined";
	}
	var frames = state.Animation.animations[animName].frames;
	if ((idx < 0) || (idx >= frames.length)){
	    return "Warning: Animation '" + animName + "' frame " + idx + " does not exist";
	}
	frames.splice(idx, 1);
    },

    listFrame: function(who, animName, idx){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	var frames = state.Animation.animations[animName].frames;
	var output = "";
	if (typeof(idx) != typeof(0)){
	    if (frames.length <= 0){
		Animation.write("Animation '" + animName + "' has no frames", who, "", "Anim");
		return;
	    }
	    for (var i = 0; i < frames.length; i++){
		if (i > 0){ output += "\n"; }
		output += i + ": ";
		for (var k in state.Animation.images){
		    if (state.Animation.images[k] == frames[i].url){
			output += k + ", ";
			break;
		    }
		}
		output += frames[i].width + "x" + frames[i].height + " (" + (frames[i].duration / 1000) + "s)";
	    }
	}
	else if ((idx < 0) || (idx >= frames.length)){
	    return "Error: Animation '" + animName + "' frame " + idx + " does not exist; please use add command";
	}
	else{
	    output = animName + "." + idx + " (" + (frames[idx].duration / 1000) + "s)\n";
	    output += "[" + animName + "](" + frames[idx].url.replace(/([/][^/]+[.])(jpg|png).*$/, "$1$2") + ")";
	    var propNames = [];
	    for (var k in frames[idx]){
		if (frames[idx].hasOwnProperty(k)){ propNames.push(k); }
	    }
	    propNames.sort();
	    for (var i = 0; i < propNames.length; i++){
		output += "\n  " + propNames[i] + ": " + frames[idx][propNames[i]];
	    }
	}
	Animation.write(output, who, "font-size: small; font-family: monospace", "Anim");
    },

    exportAnimation: function(who, animName, handoutName){
	if (!state.Animation.animations[animName]){
	    return "Error: Animation '" + animName + "' not defined; please use add command";
	}
	// if not already done, generate map from property name to argument
	if (!Animation.REVERSE_ARG_MAP['duration']){
	    for (var arg in Animation.ARG_MAP){
		var prop = Animation.ARG_MAP[arg];
		if (!Animation.FRAME_DEFAULTS.hasOwnProperty(prop)){ continue; }
		if ((!Animation.REVERSE_ARG_MAP[prop]) || (arg.length < Animation.REVERSE_ARG_MAP[prop].length)){
		    Animation.REVERSE_ARG_MAP[prop] = arg;
		}
	    }
	}
	var quotedName = animName;
	if (quotedName.indexOf(' ') >= 0){
	    quotedName = '"' + quotedName.replace('"', "\"\'\"\'\"") + '"';
	}
	function generateCommand(frameIdx, baseIdx){
	    var frame = state.Animation.animations[animName].frames[frameIdx];
	    var retval = "!anim add frame " + quotedName;
	    if (baseIdx >= 0){
		var baseFrame = state.Animation.animations[animName].frames[baseIdx];
		retval += " -C " + baseIdx;
		if (frame['url'] != baseFrame['url']){
		    retval += " -I " + frame['url'];
		}
		if (frame['duration'] != baseFrame['duration']){
		    retval += " " + Animation.REVERSE_ARG_MAP['duration'] + " " + frame['duration'];
		}
		for (var prop in Animation.FRAME_DEFAULTS){
		    if (!Animation.FRAME_DEFAULTS.hasOwnProperty(prop)){ continue; }
		    if (frame[prop] != baseFrame[prop]){
			retval += " " + Animation.REVERSE_ARG_MAP[prop] + " " + frame[prop];
		    }
		}
	    }
	    else{
		retval += " " + frame['url'] + " " + frame['duration'];
		for (var prop in Animation.FRAME_DEFAULTS){
		    if (!Animation.FRAME_DEFAULTS.hasOwnProperty(prop)){ continue; }
		    if (frame[prop] != Animation.FRAME_DEFAULTS[prop]){
			retval += " " + Animation.REVERSE_ARG_MAP[prop] + " " + frame[prop];
		    }
		}
	    }
	    return retval;
	}
	// generate command to create animation, plus a command for each frame
	var commands = "!anim add animation " + quotedName + " " + state.Animation.animations[animName].cycles;
	var frames = state.Animation.animations[animName].frames;
	var sep = (handoutName ? "<br>\n" : "\n");
	for (var i = 0; i < frames.length; i++){
	    // make use of copy ability to generate shortest command possible
	    var cmd = generateCommand(i, -1);
	    for (var j = 0; j < i; j++){
		var copyCmd = generateCommand(i, j);
		if (copyCmd.length < cmd.length){
		    cmd = copyCmd;
		}
	    }
	    commands += sep + cmd;
	}
	if (handoutName){
	    // export to handout
	    var handout = createObj("handout", {'name': handoutName, 'avatar': (frames[0] ? frames[0]['url'] || "" : "")});
	    handout.set('notes', commands);
	    Animation.write("Exported animation " + animName + " to handout " + handoutName, who, "", "Anim");
	}
	else{
	    // export to whisper
	    Animation.write(commands, who, "font-size: small; font-family: monospace", "Anim");
	}
    },

    handleAnimationMessage: function(tokens, msg){
	if (tokens.length <= 2){
	    return Animation.showHelp(msg.who, tokens[0], null);
	}
	var inlineRolls = msg.inlinerolls || [];
	var args = {}, posArgs = [];
	var getArg = null;
	for (var i = 2; i < tokens.length; i++){
	    if (getArg){
		if (getArg == "help"){
		    return Animation.showHelp(msg.who, tokens[0], tokens[i]);
		}
		args[getArg] = Animation.fixupCommand(tokens[i], inlineRolls);
		getArg = null;
		continue;
	    }
	    getArg = Animation.ARG_MAP[tokens[i]];
	    if (getArg){ continue; }
	    switch (tokens[i]){
	    case "--aurasquare":
		args['auraSquare'] = true;
		break;
	    case "-P":
	    case "--playerpage":
		args['pageId'] = Campaign().get('playerpageid');
		break;
	    default:
		posArgs.push(Animation.fixupCommand(tokens[i], inlineRolls));
	    }
	}
	if (tokens[1] == "help"){
	    return Animation.showHelp(msg.who, tokens[0], tokens[2]);
	}
	if (getArg){
	    Animation.write("Error: Expected argument for " + getArg, msg.who, "", "Anim");
	    return Animation.showHelp(msg.who, tokens[0], null);
	}

	var err;
	switch (tokens[1]){
	case "add":
	    switch (posArgs[0]){
	    case "image":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify image name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		var url = posArgs[2];
		if ((!url) && (msg.selected)){
		    for (var i = 0; i < msg.selected.length; i++){
			var tok = getObj(msg.selected[i]._type, msg.selected[i]._id);
			if (tok){
			    url = tok.get('imgsrc');
			    if (url){ break; }
			}
		    }
		}
		if (!url){
		    Animation.write("Error: Must specify image URL or select token", msg.who, "", "Anim");
		    return;
		}
		url = url.replace(/[/][^/]+[.](jpg|png)/, "/thumb.$1");
		err = Animation.addImage(posArgs[1], url);
		if (!err){
		    Animation.write("Added image " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    case "animation":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		var cycles = parseInt(posArgs[2] || "1");
		if ((!cycles) || (cycles < 0)){
		    Animation.write("Error: Invalid cycle count specification: " + posArgs[2], msg.who, "", "Anim");
		    return;
		}
		err = Animation.addAnimation(posArgs[1], cycles);
		if (!err){
		    Animation.write("Added animation " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    case "frame":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!args['copyIdx']){
		    if (!posArgs[2]){
			Animation.write("Error: Must specify frame image", msg.who, "", "Anim");
			return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		    }
		    args['image'] = posArgs[2];
		    if (!posArgs[3]){
			Animation.write("Error: Must specify frame duration", msg.who, "", "Anim");
			return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		    }
		    args['duration'] = posArgs[3];
		}
		var idx, copyIdx;
		if (args['insertIdx']){ idx = parseInt(args['insertIdx']); }
		if (args['copyIdx']){ copyIdx = parseInt(args['copyIdx']); }
		err = Animation.addFrame(posArgs[1], idx, args, copyIdx);
		if (!err){
		    Animation.write("Added frame to " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    default:
		Animation.write("Error: Unrecognized " + tokens[1] + " subcommand: " + posArgs[0], msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    break;
	case "edit":
	    switch (posArgs[0]){
	    case "image":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify image name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		var url = posArgs[2];
		if ((!url) && (msg.selected)){
		    for (var i = 0; i < msg.selected.length; i++){
			var tok = getObj(msg.selected[i]._type, msg.selected[i]._id);
			if (tok){
			    url = tok.get('imgsrc');
			    if (url){ break; }
			}
		    }
		}
		if (!url){
		    Animation.write("Error: Must specify image URL or select token", msg.who, "", "Anim");
		    return;
		}
		url = url.replace(/[/][^/]+[.](jpg|png)/, "/thumb.$1");
		err = Animation.editImage(posArgs[1], url);
		if (!err){
		    Animation.write("Edited image " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    case "animation":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify cycle count", msg.who, "", "Anim");
		}
		var cycles = parseInt(posArgs[2]);
		if ((!cycles) || (cycles < 0)){
		    Animation.write("Error: Invalid cycle count specification: " + posArgs[2], msg.who, "", "Anim");
		    return;
		}
		err = Animation.addAnimation(posArgs[1], cycles);
		if (!err){
		    Animation.write("Edited animation " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    case "frame":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify frame index", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.editFrame(posArgs[1], parseInt(posArgs[2]), args);
		if (!err){
		    Animation.write("Edited frame of animation " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    default:
		Animation.write("Error: Unrecognized " + tokens[1] + " subcommand: " + posArgs[0], msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    break;
	case "rename":
	    switch (posArgs[0]){
	    case "image":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify image to rename", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify new image name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.renameImage(posArgs[1], posArgs[2]);
		if (!err){
		    Animation.write("Renamed image " + posArgs[1] + " to " + posArgs[2], msg.who, "", "Anim");
		}
		break;
	    case "animation":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation to rename", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify new animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.renameAnimation(posArgs[1], posArgs[2]);
		if (!err){
		    Animation.write("Renamed animation " + posArgs[1] + " to " + posArgs[2], msg.who, "", "Anim");
		}
		break;
	    case "frame":
		Animation.write("Error: Cannot rename frame", msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    default:
		Animation.write("Error: Unrecognized " + tokens[1] + " subcommand: " + posArgs[0], msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    break;
	case "copy":
	    switch (posArgs[0]){
	    case "image":
		Animation.write("Error: Cannot copy image", msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    case "animation":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation to copy", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify new animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.copyAnimation(posArgs[1], posArgs[2]);
		if (!err){
		    Animation.write("Copied animation " + posArgs[1] + " to " + posArgs[2], msg.who, "", "Anim");
		}
		break;
	    case "frame":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation from which to copy frame", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify index of frame to copy", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[3]){
		    Animation.write("Error: Must specify animation into which to copy frame", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (posArgs[4]){
		    posArgs[4] = parseInt(posArgs[4]);
		}
		err = Animation.copyFrame(posArgs[1], parseInt(posArgs[2]), posArgs[3], posArgs[4]);
		if (!err){
		    Animation.write("Copied frame from " + posArgs[1] + " to " + posArgs[3], msg.who, "", "Anim");
		}
		break;
	    default:
		Animation.write("Error: Unrecognized " + tokens[1] + " subcommand: " + posArgs[0], msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    break;
	case "remove":
	    switch (posArgs[0]){
	    case "image":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify image name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.removeImage(posArgs[1]);
		if (!err){
		    Animation.write("Removed image " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    case "animation":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.removeAnimation(posArgs[1]);
		if (!err){
		    Animation.write("Removed animation " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    case "frame":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (!posArgs[2]){
		    Animation.write("Error: Must specify frame index", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		err = Animation.removeFrame(posArgs[1], parseInt(posArgs[2]));
		if (!err){
		    Animation.write("Removed frame from animation " + posArgs[1], msg.who, "", "Anim");
		}
		break;
	    default:
		Animation.write("Error: Unrecognized " + tokens[1] + " subcommand: " + posArgs[0], msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    break;
	case "list":
	    switch (posArgs[0]){
	    case "image":
		err = Animation.listImage(msg.who, posArgs[1]);
		break;
	    case "animation":
		err = Animation.listAnimation(msg.who, posArgs[1]);
		break;
	    case "frame":
		if (!posArgs[1]){
		    Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		    return Animation.showHelp(msg.who, tokens[0], tokens[1]);
		}
		if (posArgs.length > 2){ posArgs[2] = parseInt(posArgs[2]); }
		err = Animation.listFrame(msg.who, posArgs[1], posArgs[2]);
		break;
	    default:
		Animation.write("Error: Unrecognized " + tokens[1] + " subcommand: " + posArgs[0], msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    break;
	case "run":
	    if (!posArgs[0]){
		Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    var target;
	    if (args['target']){
		target = getObj("graphic", args['target']);
	    }
	    else if (msg.selected){
		for (var i = 0; i < msg.selected.length; i++){
		    var tok = getObj(msg.selected[i]._type, msg.selected[i]._id);
		    if (tok){
			target = tok;
			break;
		    }
		}
	    }
	    var pageId = args['pageId'];
	    if (!pageId){
		if (target){
		    pageId = target._pageid;
		}
		if (!pageId){ pageId = Campaign().get('playerpageid'); }
	    }
	    var page = getObj("page", pageId);
	    if (!page){
		Animation.write("Error: Unable to get page " + pageId, msg.who, "", "Anim");
		return;
	    }
	    var x = args['x'], y = args['y'];
	    if ((typeof(x) != typeof("")) || (typeof(y) != typeof(""))){
		if (target){
		    if (typeof(x) != typeof("")){ x = target.get('left'); }
		    if (typeof(y) != typeof("")){ y = target.get('top'); }
		}
	    }
	    if (typeof(x) == typeof("")){ x = parseInt(x); }
	    else if (typeof(x) != typeof(0)){ x = page.get('width') * 35; }
	    if (typeof(y) == typeof("")){ y = parseInt(y); }
	    else if (typeof(y) != typeof(0)){ y = page.get('height') * 35; }
	    var rotation = parseInt(args['rotation'] || "0");
	    var timeScale = parseFloat(args['timeScale'] || "1");
	    var xScale = parseFloat(args['xScale'] || "1");
	    var yScale = parseFloat(args['xScale'] || "1");
	    var cycles = parseInt(args['cycles'] || "0");
	    err = Animation.addJob(posArgs[0], pageId, x, y, rotation, timeScale, xScale, yScale, cycles);
	    break;
	case "export":
	    if (!posArgs[0]){
		Animation.write("Error: Must specify animation name", msg.who, "", "Anim");
		return Animation.showHelp(msg.who, tokens[0], tokens[1]);
	    }
	    err = Animation.exportAnimation(msg.who, posArgs[0], posArgs[1]);
	    break;
	default:
	    Animation.write("Error: Unrecognized command: " + tokens[1], msg.who, "", "Anim");
	    return Animation.showHelp(msg.who, tokens[0], null);
	}
	if (typeof(err) == typeof("")){
	    Animation.write(err, msg.who, "", "Anim");
	}
    },

    handleChatMessage: function(msg){
	if ((msg.type != "api") || (msg.content.indexOf("!anim") != 0)){ return; }

	return Animation.handleAnimationMessage(msg.content.split(" "), msg);
    },

    registerAnimation: function(){
	Animation.init();
	on("destroy:graphic", Animation.handleDelete);
	if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	    Shell.registerCommand("!anim", "!anim <subcommand> [args]", "Define or run animations", Animation.handleAnimationMessage);
	    if (Shell.write){
		Animation.write = Shell.write;
	    }
	}
	else{
	    on("chat:message", Animation.handleChatMessage);
	}
    }
};

on("ready", function(){ Animation.registerAnimation(); });
