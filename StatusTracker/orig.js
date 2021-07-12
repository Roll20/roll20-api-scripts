/* ***********  STATUS TRACKER  *********************************************
*   The purpose of this script is to track character and token status
*   as well as durations of the status, with a reminder given on each turn.
*   It allows the GM to manimpulate the controls, while players can only test
*   their characters current status, if the GM allows it. It will use basic 
*   API commands.
*   Please Note: This script will lock up one of the indicators on a token
*   to show a character is under a specific effect. You can change which 
*   indicator to your preference.
*   
*   Commands:
*   !StatusAdd <status name> <duration, -1 for perm> <description> <GM Only Flag> // <marker name>
*   !StatusDel <status name>
*   !StatusAll
*   !StatusClearAll 
*   
*   For ease of use, add the following to a macro and assign it to your macro bar:
 
*   !StatusAdd ?{Status name} ?{Status Duration, -1 for perm} ?{Status description} ?{Type GM for GM only} // ?{Status Indicator [default is purple]}
 
*   NOTE: If you end the command with GM, only the GM will be able to see the 
*   reminder.
*   
*   NOTE: Names cannot contain spaces, but it searches for containing so for
*   'Hank the Dwarf' you can put !Status Hank Bless 10
*   
*****************************************************************************/
//Storage location
state.activeStatus = state.activeStatus || new Array();
 
var StatusTracker = StatusTracker || {};
 
//Personal Settings
StatusTracker.statusIndicator = "purple"; //default marker if DM does not designate one
StatusTracker.Chat = true;  //Uses chat window to give indicators
StatusTracker.ChatDescriptions = true; //displays descriptions
StatusTracker.ChatOnlyGM = false; //All chat only goes to the gm
StatusTracker.currentTurn = ""; //The current tokens turn
StatusTracker.bloodiedTintColor = "#FF0000"; //If you want a creature's token to be tinted when below 1/2 hp (bar1_value), 'transparent' for none.
StatusTracker.bloodiedMarker = "none"; //If you want a creature's token to get marked when below 1/2 hp (bar1_value), 'none' for none.
StatusTracker.deadMarker = "dead"; //Marker to show if the token is dead (0 bar1_value)
StatusTracker.statusIncidatorBG = 'blue';
StatusTracker.statusIndicatorFontColor = '#ffffff'; 

//Adding a status to the tracker
StatusTracker.AddStatus = function(CharID, statusName, statusDescript, Duration, GMOnly, Marker) {
    if (CharID == "") return; //Don't add empty statuses
    
    state.activeStatus.push({
        'CharID': CharID, 
        'statusName': statusName, 
        'statusDescript': statusDescript, 
        'Duration': Duration,
        'GMOnly': GMOnly,
        'Marker': Marker,
    });
    
    StatusTracker.addMarker(CharID, Marker);
}
 
StatusTracker.addMarker = function(CharID, Marker) {
    //Find the token with the ID: non-linked tokens
    var currChar = findObjs({
        _type: "graphic",
        _id: CharID,
        _pageid: Campaign().get("playerpageid"),
    });    
    _.each(currChar, function(obj) {
        obj.set("statusmarkers", StatusTracker.addMarkerToString(obj.get("statusmarkers"), Marker));
    });
}
 
//Removes a marker of the listed type if it is present
StatusTracker.delMarker = function(CharID, Marker) {
    //Find the token with the ID: non-linked tokens
    var currChar = findObjs({
        _type: "graphic",
        _id: CharID,
        _pageid: Campaign().get("playerpageid"),
    });    
    _.each(currChar, function(obj){
        var returnString = StatusTracker.delMarkerFromString(obj.get("statusmarkers"), Marker);
        obj.set("statusmarkers", returnString);
    });
}
 
StatusTracker.addMarkerToString = function(Original, AddMarker){
    var splitOriginal = Original.split(",");
    var newString = new Array();
    var maxLoops = splitOriginal.length;
    var loop = 0;
    var Added = false;
    
    while (loop < maxLoops && Added == false) {
        if (splitOriginal[loop].indexOf(AddMarker) !== -1){
            //already has more than one
            if(splitOriginal[loop].indexOf("@") !== -1) {
                var num = Number(splitOriginal[loop].substr(splitOriginal[loop].length - 1));
                num += 1;
                splitOriginal[loop] = splitOriginal[loop].substr(0,splitOriginal[loop].length - 1) + num;
                Added = true;
            }
            
            //already has it but not at multiple, first check to make sure not added 
            //above, then add 1 more. Forced addition of @
            if(Added == false) {
                splitOriginal[loop] = splitOriginal[loop] + "@2";
                Added = true;
            }
        }
        loop += 1;
    }
    
    if (Added == false ) {
        return Original + "," + AddMarker;
    } else {
        return splitOriginal.join();
    }
}
 
StatusTracker.delMarkerFromString = function(Original, delMarker) {
    var splitOriginal = Original.split(",");
    var maxLoops = splitOriginal.length;
    var loop = 0;
    var Deleted = false;
    
    while (loop < maxLoops && Deleted == false) {
        if (splitOriginal[loop].indexOf(delMarker) !== -1) {
 
            //already has more than one
            if(splitOriginal[loop].indexOf("@") !== -1) {
                var num = Number(splitOriginal[loop].substr(splitOriginal[loop].length - 1));
                //Lowers the count down
                num -= 1;
                
                //tests for solitary remaining
                if (num == 1 ) {
                    splitOriginal[loop] = splitOriginal[loop].substr(0,splitOriginal[loop].length - 2);
                } else {
                    splitOriginal[loop] = splitOriginal[loop].substr(0,splitOriginal[loop].length - 1) + num;
                }
                Deleted = true;
            }
            
            //Matches but there are not multiple, removes instance
            if (Deleted == false) {
                splitOriginal.splice(loop,1);
                Deleted = true;
            }
        }
        loop += 1;
    }
    return splitOriginal.join();
}
 
StatusTracker.getTokenName = function(CharID) {
    if (CharID == "") return "";
        
    //if CharID is a token, turn on the status indicator for the token
    var Chars = findObjs({
       _type: "graphic",
       _id: CharID,
    });
    if (Chars.length > 0 ) {
        var name = Chars[0].get("name");
    }
    
    return name;
}
 
StatusTracker.DelStatus = function(CharID, statusName){
    var loop = 0;
    var maxLoops = state.activeStatus.length;
    
    while (loop < maxLoops) {
        if (state.activeStatus[loop].statusName == statusName && state.activeStatus[loop].CharID == CharID) {
            //Message
            message = state.activeStatus[loop].statusName + " ends.";
            StatusTracker.sendMessage(message, state.activeStatus.GMOnly, state.activeStatus[loop].statusDescript);
            
            //Remove the relevant marker
            StatusTracker.delMarker(state.activeStatus[loop].CharID, state.activeStatus[loop].Marker);
            
            state.activeStatus.splice(loop,1);
            loop = loop - 1;
            maxLoops = maxLoops - 1;
        }
        loop = loop + 1;
    }
}
 
StatusTracker.sendMessage = function(message, GMOnly, description) {
    if (StatusTracker.Chat == false) return;
    
    //if not a direct message, assign chat limiters
    if (message.indexOf("/direct") > 0 ) {
        if (GMOnly == true || StatusTracker.ChatOnlyGM == true) {
            message = "/w gm " + message;
        }
        else
        {
            message = "/desc " + message;
        }
    }
    
    if (StatusTracker.ChatDescriptions == true && description != "") {
        message = message + " (" + description + ")";
    }
    sendChat("", message);
    
}
 
StatusTracker.newTurn = function(CharID) {    
    //loops through all durations and effects ones on the current character/token
    var loop = 0;
    var maxLoops = state.activeStatus.length;
    var count = 0;
 
    if (maxLoops == 0) return;
    
    //If the current token does not have any statues, exit
     while (loop < maxLoops) {
        if (state.activeStatus[loop].CharID == CharID) {count += 1}
        loop = loop + 1
     }
    if (count == 0) return;
    
    //reset loop
    loop = 0;
    
    //Extract the current tokens name
    var charName = StatusTracker.getTokenName(CharID)
    
    if (StatusTracker.Chat) {
        StatusTracker.sendMessage("/direct <div align='center'> <p style='color:" +
          StatusTracker.statusIndicatorFontColor + "; background-color:" + 
          StatusTracker.statusIncidatorBG + "'>   ****   " + charName + 
          " Status Effects   ****</p></div>", StatusTracker.ChatOnlyGM, "")
    }

    while (loop < maxLoops) {
        
        //Decrement Duration
        var Duration = Number(state.activeStatus[loop].Duration || 1);
 
        // A -1 Duration is permanent, the current token/character's statuses are 
        // increments for the next round.
        if (Duration > 0 && state.activeStatus[loop].CharID == CharID) {
            state.activeStatus[loop].Duration = Duration - 1;
        }
        
        //Still active, announced
        if (Duration > 1 && state.activeStatus[loop].CharID == CharID) {
            StatusTracker.sendMessage(StatusTracker.getTokenName(state.activeStatus[loop].CharID) + " " + state.activeStatus[loop].statusName + " for " + (Duration - 1) +
                " more rounds.", state.activeStatus[loop].GMOnly, state.activeStatus[loop].statusDescript);
        }
        
        //Permanent announced
        if (Duration == -1 && state.activeStatus[loop].CharID == CharID) {
            StatusTracker.sendMessage(StatusTracker.getTokenName(state.activeStatus[loop].CharID) + " " + state.activeStatus[loop].statusName + " still.", state.activeStatus[loop].GMOnly, state.activeStatus[loop].statusDescript);
        }
        
        //Ending effects
        if (Duration <= 1 && Duration !== -1 && state.activeStatus[loop].CharID == CharID) {
            
            StatusTracker.sendMessage( StatusTracker.getTokenName(state.activeStatus[loop].CharID) + " " + state.activeStatus[loop].statusName + " ends.", state.activeStatus[loop].GMOnly,  state.activeStatus[loop].statusDescript);
            StatusTracker.DelStatus(state.activeStatus[loop].CharID, state.activeStatus[loop].statusName);
            
            //drop loop by 1 now that there is 1 less object in the array.
            loop = 0;
            maxLoops = state.activeStatus.length;
        }
        
        loop = loop + 1;
    }
    if (StatusTracker.Chat) {
        StatusTracker.sendMessage("/direct <div align='center'> <p style='color:" +
          StatusTracker.statusIndicatorFontColor + "; background-color:" + 
          StatusTracker.statusIncidatorBG + "'>   ****  End " + charName + 
          " Status Effects   ****</p></div>", StatusTracker.ChatOnlyGM, "")
    }
    return;
}
 
StatusTracker.getCurrentToken = function() {
    var turn_order = JSON.parse(Campaign().get('turnorder'));
    
    if (!turn_order.length) {
        return "";
    }
    
    var turn = turn_order.shift();
    return getObj('graphic', turn.id) || "";
};
 
on("change:campaign:turnorder", function() {
    var status_current_token = StatusTracker.getCurrentToken();
    
    //Handler for non-token items in initiative
    if (status_current_token == "") return;
    
    //If turn order was changed but it is still the same persons turn, exit
    if (status_current_token.id == StatusTracker.currentTurn) return;
    
    StatusTracker.currentTurn = status_current_token.id; 
    StatusTracker.newTurn(status_current_token.id);
});
 
on("chat:message", function(msg) {   
    var cmd = "!StatusAll";
    
    if (msg.type == "api" && msg.content.indexOf(cmd) !== -1 && msg.who.indexOf("(GM)") !== -1) {
        var loop = 0;
        var maxLoops = state.activeStatus.length;
        StatusTracker.sendMessage("/direct <div align='center'> <p style='color:" +
          StatusTracker.statusIndicatorFontColor + "; background-color:" + 
          StatusTracker.statusIncidatorBG + "'>   ****  All Status Effects   ****</p></div>", StatusTracker.ChatOnlyGM, "")
        
        while (loop < maxLoops) {
            sendChat("", "/w gm " + StatusTracker.getTokenName(state.activeStatus[loop].CharID) + " " + state.activeStatus[loop].statusName + " for " + state.activeStatus[loop].Duration + " rounds. [" + state.activeStatus[loop].Marker + " marker].")
            loop = loop + 1;
        }
        
        StatusTracker.sendMessage("/direct <div align='center'> <p style='color:" +
          StatusTracker.statusIndicatorFontColor + "; background-color:" + 
          StatusTracker.statusIncidatorBG + "'>   ****  End All Status Effects   ****</p></div>", StatusTracker.ChatOnlyGM, "")
    }
});
 
on("chat:message", function(msg) {   
    var cmd = "!StatusClearAll";
    
    if (msg.type == "api" && msg.content.indexOf(cmd) !== -1 && msg.who.indexOf("(GM)") !== -1) {
        state.activeStatus = new Array();
    }
});
 
on("chat:message", function(msg) {   
    var cmd = "!StatusAdd ";
    
    if (msg.type == "api" && msg.content.indexOf(cmd) !== -1 && msg.who.indexOf("(GM)") !== -1) {
        var cleanedMsg = msg.content.replace(cmd, "");
 
        //Pulls any marker first
        var marker = cleanedMsg.split("// ")[1] || StatusTracker.statusIndicator;
        cleanedMsg = cleanedMsg.split("//")[0];
        
        //Pulls the effect name
        var statusName = cleanedMsg.split(" ")[0];
        cleanedMsg = cleanedMsg.substr(statusName.length + 1) //Removes the target from the array
 
        //Pulls the duration
        var Duration = cleanedMsg.split(" ")[0];
        cleanedMsg = cleanedMsg.substr(Duration.length + 1) //Removes the target from the array
 
        var GMOnly = false;
        if (cleanedMsg.substr(cleanedMsg.length - 2) == "GM") {
            GMOnly = true;
            cleanedMsg = cleanedMsg.substr(0, cleanedMsg.length - 2);
        }
 
        //The remainder is the description
        var statusDescription = cleanedMsg;
        
        //Adds the status to each of the selected tokens
        _.each(msg.selected, function (obj){
            //Runs through each selected token and adds the status
            if (obj._type == "graphic") { //only if the selected is a token
                StatusTracker.AddStatus(obj._id, statusName, statusDescription, Duration, GMOnly, marker);
                sendChat("","/desc " + statusName + " added.")
            }
        })
    }
});   
 
on("chat:message", function(msg) {   
    var cmd = "!StatusDel ";
    
    if (msg.type == "api" && msg.content.indexOf(cmd) !== -1 && msg.who.indexOf("(GM)" !== -1)) {
        
        var CharID = "";
        
        var cleanedMsg = msg.content.replace(cmd, "");
        
        //Pulls the effect name
        var statusName = cleanedMsg.split(" ")[0];
        cleanedMsg = cleanedMsg.substr(statusName.length + 1) //Removes the target from the array
        
        _.each(msg.selected, function (obj){
            //Deletes the statud from each selected ID            
            if (obj._type == "graphic") { //only if the selected is a token
                StatusTracker.DelStatus(obj._id, statusName);
            }
        })
    }
});

 on("change:graphic:bar1_value", function(obj, prev) {
    if(obj.get("bar1_max") === "") return;
      
    if(obj.get("bar1_value") <= 0) {
        obj.set({
            status_dead: true,
            tint_color: "transparent"
        });
    }
    else if(obj.get("bar1_value") <= obj.get("bar1_max") / 2) {
        obj.set({
            tint_color: "#FF0000",
            status_dead: false
        });
    }
    else{
        obj.set({
            tint_color: "transparent",
            status_dead: false
        });
    }
});