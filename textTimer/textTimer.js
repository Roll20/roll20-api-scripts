mer = textTimer || {
    jobTimer: {},

    init: function(){
        if (!state.hasOwnProperty('textTimer')){ state.textTimer = {}; }
        if (!state.textTimer.hasOwnProperty('active')){ state.textTimer.active = false; }
        if (!state.textTimer.hasOwnProperty('paused')){ state.textTimer.paused = false; }
        if (!state.textTimer.hasOwnProperty('start')){ state.textTimer.start = 0; }
        if (!state.textTimer.hasOwnProperty('end')){ state.textTimer.end = 0; }
        if (!state.textTimer.hasOwnProperty('remaining')){ state.textTimer.remaining = 0; }
        if (!state.textTimer.hasOwnProperty('timerObj')){ state.textTimer.timerObj = 0; }
        
        // Restart unpaused timer
        if (!state.textTimer.paused && state.textTimer.active) {
            if (textTimer.jobTimer['intervalId']) {
                clearInterval(textTimer.jobTimer['intervalId']);
            }
            textTimer.jobTimer['intervalId'] = setInterval(textTimer.handlerFunc, 100);
        }
    },
    
    handlerFunc: function() {
        //textTimer.write("time --> " + textTimer.formatInterval(state.textTimer.job), "gm", "", "TimerD");
        //textTimer.write("time (unformated) --> " + state.textTimer.job, "gm", "", "TimerD");
        var temp = new Date;
        var remaining = state.textTimer.end - temp.getTime();
        
        // Check if object still exists and is unique
        var timers = findObjs({ _type: "text", controlledby: "__timer__" });
        if (timers.len > 1) {
            textTimer.write("Error: multiple timers exist. Stopping all timers.", "gm", "TimerD");
            for (i in timers) {
                timers[i].remove();
            }
            state.textTimer.timerObj = 0;
            textTimer.stopTimedJob();
        } else if (timers.len == 0) {
            textTimer.write("Error: timer object no longer exists. Stopping timer.", "gm", "TimerD");
            state.textTimer.timerObj = 0;
            textTimer.stopTimedJob();
            return;
        } else if (timers[0] != state.textTimer.timerObj) {
            textTimer.write("Warning: wrong timer object is set. Trying to fix.", "gm", "TimerD");
            state.textTimer.timerObj = timers[0];
        }

        if (remaining < 100) {
            textTimer.pauseTimedJob();
            state.textTimer.timerObj.set("text", textTimer.formatInterval(0));
            textTimer.write ("Timer done!", "gm", "", "TimerD");
        } else {
            state.textTimer.timerObj.set("text", textTimer.formatInterval(remaining));
        }
    },

    sendChat: function(speakingAs, input){
        return sendChat(speakingAs, input);
    },

    write: function(s, who, style, from){
	    if (who){
	        who = "/w " + who.split(" ", 1)[0] + " ";
	    }
	    sendChat(from, who + s.replace(/</g, "<").replace(/>/g, ">").replace(/\n/g, "<br>"));
    },

    parseInterval: function(s){
        var parts = s.split(":");
    	var retval = 0;
        for (i = 0; i < 3; i++) {
        	retval *= 60;
            if (parts.length > 0){
        	    retval += parseInt(parts.shift());
        	}
        }
    	return retval * 1000;
    },

    formatInterval: function(num){
        var parts = [];
        var deciseconds = 0;
        var i = num;
        
        deciseconds = Math.floor((i % 1000) / 100);
        i = Math.floor(i / 1000);
        
        for (var j = 0;  j < 3; j++){
    	    parts.unshift((i % 60).toString());
    	    i = Math.floor(i / 60);
    	}
    	//parts.unshift(i.toString());
        for (i in parts) {
            if (parts[i].length < 2) {
                parts[i] = "0" + parts[i];
            }
        }
    	var ret = parts.join(":") + "." + deciseconds.toString();
        return ret;
    },
    
    resumeTimedJob: function(){
        if (!state.textTimer.active) {
            textTimer.write("Cannot resume timer", "gm", "", "TimerD");
        } else {
            var date = new Date();
            state.textTimer.start = date.getTime();
            state.textTimer.end = state.textTimer.start + state.textTimer.remaining;
            textTimer.jobTimer['intervalId'] = setInterval(textTimer.handlerFunc, 100);
            
    	    textTimer.write("Resumed timer", "gm", "", "TimerD");
        }
        state.textTimer.paused = false;
    },
    
    pauseTimedJob: function(){
        if (textTimer.jobTimer['intervalId']) {
            var date = new Date();
            state.textTimer.remaining = state.textTimer.end - date.getTime();
            clearInterval(textTimer.jobTimer['intervalId']);
            textTimer.jobTimer['intervalId'] = 0;
            textTimer.write("Paused timer", "gm", "", "TimerD");
        } else {
            textTimer.write("No timer running", "gm", "", "TimerD");
        }
        state.textTimer.paused = true;
    },
    
    stopTimedJob: function(){
        if (state.textTimer.active) {
            clearInterval(textTimer.jobTimer['intervalId']);
            textTimer.jobTimer['intervalId'] = 0;
            state.textTimer.job = 0;
            
            if (state.textTimer.timerObj) {
                // If object still exists, remove it
                try {
                    state.textTimer.timerObj.remove();
                } catch (err) {
                    //Shell.write(err.toString(), "gm");
                    //Shell.write(err.toString().indexOf("TypeError").toString(), "gm");
                    if (err.toString().indexOf("TypeError") > -1) {
                        state.textTimer.timerObj = 0;
                    } else {
                        throw err;
                    }
                }
            }
            textTimer.write("Stopped timer", "gm", "", "TimerD");
        } else {
            textTimer.write("No timer running", "gm", "", "TimerD");
        }
        state.textTimer.active = false;
    },
    
    addTimedJob: function(time){
        if (state.textTimer.active == true) {
            textTimer.stopTimedJob();
        }
        var date = new Date();
        state.textTimer.start = date.getTime();
	    state.textTimer.end = state.textTimer.start + time;
        var page = Campaign().get("playerpageid");

        state.textTimer.timerObj = createObj("text", {
            text: textTimer.formatInterval(state.textTimer.end - state.textTimer.start),
            font_size: 200,
            pageid: page,
            layer: "map",
            top: 200,
            left: 500,
            controlledby: "__timer__",
            font_family: "contrail"
        });
    
	    textTimer.jobTimer['intervalId'] = setInterval(textTimer.handlerFunc, 100);
        state.textTimer.active = true;
        state.textTimer.paused = false;
	    textTimer.write("Added timer", "gm", "", "TimerD");
    },

    showHelp: function(who, cmd){
	    var helpMsg = "";
	    helpMsg += "Usage: " + cmd + " [-start HH:MM:SS.CS | -stop | -pause]\n";
	    textTimer.write(helpMsg, who, "", "TimerD");
    },

    handleTimerMessage: function(tokens, msg){
	    if (tokens.length < 2){
	        return textTimer.showHelp(msg.who, tokens[0]);
	    }

	    var inlineRolls = msg.inlinerolls || [];
        
	    function replaceArgInlines(s){
    	    if (!inlineRolls){ return s; }
	        var i = parseInt(s.substring(3, s.length - 2));
	        if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i]['results'])){ return s; }
	        return inlineRolls[i]['results'].total;
	    }
        
	    function replaceCommandInlines(s){
    	    if (!inlineRolls){ return s; }
	        var i = parseInt(s.substring(3, s.length - 2));
	        if ((i < 0) || (i >= inlineRolls.length) || (!inlineRolls[i]) || (!inlineRolls[i]['expression'])){ return s; }
	        return "[[" + inlineRolls[i]['expression'] + "]]";
	    }
        
	    function fixupInlines(s, replaceFun){
    	    return s.replace(/\$\[\[\d+\]\]/g, replaceFun);
	    }

	    var args = {};
	    if ((msg.playerid) && (msg.playerid != "API")){
    	    args['from'] = "player|" + msg.playerid;
    	}
	    var getArg = null;
        var start = false
	    var stop = false;
    	var pause = false;
        var resume = false;
    	var cmdArray = [];
    	for (var i = 1; i < tokens.length; i++){
    	    if (getArg){
        		args[getArg] = fixupInlines(tokens[i], replaceArgInlines);
         		getArg = null;
    	    	continue;
	        }
	        switch(tokens[i]){
	        case "-start":
                getArg = "time";
                start = true;
                break;
            case "-stop":
                stop = true;
                break;
            case "-pause":
                pause = true;
                break;
            case "-resume":
                resume = true;
                break;
	        default:
		        cmdArray.push(tokens[i]);
	        }
	    }
        
        if (start + stop + pause + resume != 1) {
            textTimer.write("Error: you gave me wrong parameters", "gm", "", "TimerD");
            return;
        }
        if (start) {
	        textTimer.addTimedJob(textTimer.parseInterval(args['time']));
        } else if (stop) {
            textTimer.stopTimedJob();
        } else if (pause) {
            textTimer.pauseTimedJob();
        } else if (resume) {
            textTimer.resumeTimedJob();
        }
    },

    handleChatMessage: function(msg){
	    if ((msg.type != "api") || (msg.content.indexOf("!timer") != 0)){ return; }

	    return textTimer.handleTimerMessage(msg.content.split(" "), msg);
    },

    registerTimerCommand: function() {
	    textTimer.init();
	    if ((typeof(Shell) != "undefined") && (Shell) && (Shell.registerCommand)){
	        Shell.registerCommand("!timer", "!timer [-start HH:MM:SS.MS | -stop | -pause]", "Schedule a timer to show up in the current page", textTimer.handleTimerMessage);
	        if (Shell.write){
		        textTimer.write = Shell.write;
	        }
	        if (Shell.sendChat){
		        textTimer.sendChat = Shell.sendChat;
	        }
	    } else {
	        on("chat:message", textTimer.handleChatMessage);
	    }
    }
};

on("ready", function(){ textTimer.registerTimerCommand(); });