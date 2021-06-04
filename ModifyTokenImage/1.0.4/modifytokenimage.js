// ModifyTokenImage v1.0.4
// By: Zachare Sylvestre
// Concept was based on ChangeTokenImage but utilizes the Handout Repository, which allows for a little more robust look for tokens.
//
// Version History:
//   1.0.4: Refactoring the GMNotes so that it works a little better with different JSON Objects that might want to use the same item.

var ModifyTokenImage = ModifyTokenImage || (function() {
    'use strict';
    var version = '1.0.4';
    var isGmRestricted = true;
    var outputDebug = false;
    
    var setIsGmRestricted = function() {
        isGmRestricted = !isGmRestricted;
    };
    
    var showHelp = function(msg) {
        logDebugOutput('showHelp');
        whisperTalker(msg, '<div style="border: solid 1px #000; background-color: #FFF; padding: 3px; width: 100%">'
            + '<div style="padding: 5px; background-color: #FFC; font-weight: bold; text-align: center; margin: 5px; width: 100%; font-size: 14px;">ModifyTokenImage v' + version + '</div>' +
            + 'This API addon allows you to change the current token image to a specific one.'
            + '<br />'
            + '<span style="font-weight: bold;">Setup:</span>'
            + '<p style="margin-left: 4px;">There must be a folder named "Token Images" located in the Journal. For each token you want to enable this functionality, it must have its own folder named under the same name as the token.</p>'
            + '<span style="font-weight: bold;">Commands</span>'
            + '<p style="margin-left: 4px;"><strong>!ModifyTokenImage --next</strong><br />Sets the next Token Image for the selected token.</p>'
            + '</div>');
    };
    
    var getTokenImageFolder = function() {
        logDebugOutput("getTokenImageFolder");
        var journalFolder = JSON.parse(Campaign().get("_journalfolder"));
        var tokenImageFolder = null;
        _.each(journalFolder, function(folder) {
           if (folder.n == "Token Images") {
               tokenImageFolder = folder;
           }
        });
        return tokenImageFolder;
    }
    
    var getTokenFolder = function(name) {
        logDebugOutput("getTokenFolder");
        var tokenImageFolder = getTokenImageFolder();
        if (tokenImageFolder == null) {
            return null;
        }
        var tokenFolder = null;
        _.each(tokenImageFolder.i, function (folder) {
            if (folder.n == name) {
                tokenFolder = folder;
            }
        });
        return tokenFolder;
    };
    
    var showCampaignFolder = function(msg) {
        logDebugOutput('showCampaignFolder');
        
        _.each(getTokenImageFolder, function(folder) {
           var folderName = folder.n;
           var folderItems = folder.i.length;
           whisperTalker(msg, folderName + " Contains " + folderItems + " objects");
        });
    };
    
    var currentDateOutput = function() {
        var date = new Date();
        var month = date.getMonth() + 1;
        var day = date.getDate();
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var seconds = date.getSeconds();
        if (month < 10) { month = "0" + month; }
        if (day < 10) { day = "0" + day; }
        if (hours < 10) { hours = "0" + hours; }
        if (minutes < 10) { minutes = "0" + minutes; }
        if (seconds < 10) { seconds = "0" + seconds; }
        return date.getFullYear() + '-' + month + '-' + day + ' ' + hours + ':' + minutes + ':' + seconds;
    };
    
    var setGmNotes = function(token, gmNotesObject) {
        token.set({"gmnotes": JSON.stringify(gmNotesObject)});
    };
    
    var getGmNotes = function(token) {
        var gmNotes = token.get("gmnotes") || "{}";
        try {
            gmNotes = decodeURIComponent(gmNotes);
        } catch (ex) {
            //Ignore. This may fail when the token is empty.
        }
        if (gmNotes && gmNotes.length) {
            gmNotes = gmNotes.trim();
        }
        return JSON.parse(gmNotes);
    };
    
    var whisperTalker = function(msg, contents) {
        logDebugOutput('whisperTalker');
        sendChat('ModifyTokenImage', '/w ' + msg.who + ' ' + contents);
    };
    
    var logDebugOutput = function(item) {
        if (!outputDebug) { return; }
        log('[ModifyTokenImage:DEBUG:' + currentDateOutput() + '] ' + item);
    };
    
    var logOutput = function(item) {
        log('[ModifyTokenImage:' + currentDateOutput() + '] ' + item);
    };
    
    var getCleanImagesrc = function (imgsrc) {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    };
    
    var handleInput = function(msg) {
        if (msg.type !== "api") { return; }
        if (isGmRestricted && !playerIsGM(msg.playerid)) { return; }
      
        if (_.has(msg,'inlinerolls')) {
          msg.content = _.chain(msg.inlinerolls)
            .reduce(function(m,v,k){
                var ti=_.reduce(v.results.rolls,function(m2,v2){
                    if(_.has(v2,'table')){
                        m2.push(_.reduce(v2.results,function(m3,v3){
                            m3.push(v3.tableItem.name);
                            return m3;
                        },[]).join(', '));
                    }
                    return m2;
                },[]).join(', ');
                m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
                return m;
            },{})
            .reduce(function(m,v,k){
                return m.replace(k,v);
            },msg.content)
            .value();
        }
        logDebugOutput(msg.content);
      
        var args = msg.content
            .replace(/<br\/>\n/g, ' ')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+--/);
            
        var isModifyTokenImage = false;

        var first = args.shift();
        var command = null;
        var setCommand = null;
        
        logDebugOutput('first:' + first);
        switch (first) {
            case '!ModifyTokenImage':
                while (args.length) {
                    var cmds = args.shift().match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);
                    
                    switch (cmds.shift()) {
                        case 'help':
                            showHelp(msg);
                            return;
                        case 'campaignfolder':
                            showCampaignFolder(msg);
                            return;
                        case 'next':
                            isModifyTokenImage = true;
                            command = 'next';
                            break;
                        case 'previous':
                            command = 'previous';
                            isModifyTokenImage = true;
                            break;
                        case 'set':
                            if (cmds.length) {
                                command = 'set';
                                setCommand = cmds.shift();
                                isModifyTokenImage = true;
                            } else {
                                showHelp(msg);
                                return;
                            }
                            break;
                        case 'gm':
                            if (!playerIsGM(msg.playerid)) { return; }
                            setIsGmRestricted();
                            var allowed = "allow players to use ModifyTokenImage.";
                            if (!isGmRestricted) {
                                allowed = "restrict ModifyTokenImage commands to GMs only."
                            }
                            whisperTalker(msg, "Now set to " + allowed);
                            return;
                        case 'debug':
                            if (!playerIsGM(msg.playerid)) { return; }
                            outputDebug = !outputDebug;
                            var debug = "Debug output enabled.";
                            if (!outputDebug) {
                                debug = "Debug output disabled.";
                            }
                            whisperTalker(msg, debug);
                            return;
                    }
                }
                break;
        }
        if (!isModifyTokenImage) { return; }
        _.chain(msg.selected)
         .uniq()
         .map(function(o) { return getObj('graphic', o._id); })
         .reject(_.isUndefined)
         .each(function(token) {
             if (!playerIsGM(msg.playerid)) { 
                 var controlledBy = token.get("controlledby").split(",");
                 if (!controlledBy.includes("All") && !controlledBy.includes(msg.playerid)) {
                    return; 
                 }
             }
            var name = token.get("name");
            var tokenFolder = getTokenFolder(name);
            if (tokenFolder == null) {
                whisperTalker(msg, name + " does not have a Token Folder.");
                return;
            }
            var gmNotes = getGmNotes(token);
            var current = gmNotes.ModifyTokenImage || {current:0};
            logDebugOutput("currentToken = " + current.current); 
            var handoutItemId = null;
            switch (command) {
                case 'next':
                    var nextHandout = null;
                    var loops = 0;
                    while (!nextHandout) {
                        current.current = current.current + 1;
                        if (current.current >= tokenFolder.i.length) {
                            current.current = 0;
                            loops = loops + 1;
                        }
                        if (loops > 2) {
                            whisperTalker(msg, name + " does not have any valid icons in its folder!");
                            return;
                        }
                        handoutItemId = tokenFolder.i[current.current];
                        nextHandout = getObj("handout", handoutItemId);
                    }
                    break;
                case 'previous':
                    var previousHandout = null;
                    var loops = 0;
                    while (!previousHandout) {
                        current.current = current.current - 1;
                        if (current.current < 0) { 
                            current.current = tokenFolder.i.length - 1; 
                            loops = loops + 1;
                        }
                        if (loops > 2) {
                            whisperTalker(msg, name + " does not have any valid icons in its folder!");
                            return;
                        }
                        handoutItemId = tokenFolder.i[current.current];
                        previousHandout = getObj("handout", handoutItemId);
                    }
                    break;
                case 'set':
                    var active = 0;
                    _.each(tokenFolder.i, function(itemId) {
                        logDebugOutput("handout: " + itemId);
                        var item = getObj("handout", itemId);
                        if (item == null) {
                            //Ignore this. If its not a handout, it doesn't count!
                            return;
                        }
                        logDebugOutput(" == " + item.get("name"));
                        if (item.get("name") == setCommand) {
                            handoutItemId = itemId;
                            current.current = active;
                        } else {
                            active++;
                        }
                    });
                    break;
            }
            if (!handoutItemId) {
                whisperTalker(msg, name + " did not find a valid item id to switch to!");
                return;
            }
            var handout = getObj("handout", handoutItemId);
            if (!handout) {
                whisperTalker(msg, name + " had some invalid handout error. It failed.");
                return;
            }
            var avatar = handout.get("avatar");
            logDebugOutput("avatar = " + avatar);
            if (!avatar) {
                whisperTalker(msg, handout.get("name") + " handout didn't have an image set.");
                return;
            }
            var cleanImage = getCleanImagesrc(avatar);
            logDebugOutput("cleanImage = " + cleanImage);
            
            gmNotes.ModifyTokenImage = current;
            setGmNotes(token, gmNotes);
            token.set({"imgsrc": cleanImage});
         });
    };
    
    var checkInstall = function() {
        logOutput('v' + version + ' Starting Up...');
    };
    
    var finishInstall = function() {
        if (getTokenImageFolder() == null) {
            sendChat("ModifyTokenImage", "WARNING: Startup Failed! You need a 'Token Images' Folder for this addon to work properly.");
            logOutput("No 'Token Images' folder detected. Addon functions will fail until this folder is created.");
        } else {
            logOutput('Started up and running properly.');    
        }
        
    }
    
    var registerEventHandlers = function() {
        on('chat:message', handleInput);
        logOutput('Event Handlers registered.');
    };
    
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        FinishInstall: finishInstall
    };
}());

on("ready", function() {
    'use strict';
    ModifyTokenImage.CheckInstall();
    ModifyTokenImage.RegisterEventHandlers();
    ModifyTokenImage.FinishInstall();
});