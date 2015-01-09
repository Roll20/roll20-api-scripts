/* ************ TELEPORTING SCRIPT  **************************
*   The intention of this script is to allow the DM to teleport
*   one or all characters to a location based on a token placed 
*   on the DM layer of the map. 
*     To activate the script, type "!Teleport " and add the name
*   of the teleport location (must not contrain spaces) and then 
*   the name of the party member to teleport there. They must be 
*   seperated by commas. If you want all to teleport, type all. 
*   ie. !Teleport teleport01, all - teleports all players to teleport01
*
*   AUTOTELEPORTING: This feature allows you to place a token on 
*   One square (for example stairs) and it will auto move a token 
*   to the linked location and back again should you choose.
*   Linked locations need to be tokens placed on the GMLayer.
*   Naming conventions:
*   Two way doors:   XXXXXXXX2A, XXXXXXXXX2B
*   Three way dooes: XXXXXXXX3A, XXXXXXXXX3B, XXXXXXXXX3C
*       (in the case of one way doors, dont create a 3C)
*   This system can handle up to 9 way doors (9I max).
****************************************************************/
var Teleporter = Teleporter || {};

Teleporter.AUTOTELEPORTER = true; //Set to true if you want teleports to be linked

Teleporter.GMName = "DM (GM)"; //The display name of the GM
Teleporter.Teleport = function (CharName, TargetName) {
    
    var LocX = 0;
    var LocY = 0;
    var OldLocX = obj.get("left");
    var OldLocY = obj.get("top");

    //find the target location
    var location = findObjs({
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        layer: "gmlayer", //target location MUST be on GM layer
        name: TargetName,
    });
    
    if (location.length == 0) return; //exit if invalid target location

    LocX = location[0].get("left");
    LocY = location[0].get("top");
    
    //if all are indicated, it lists all
    //finds all tokens with the name
    var targets = findObjs({
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
    });
    //Move characters to target location
    _.each(targets, function(obj) {
        //Only player tokens
        if (CharName == "all") {
            if (obj.get("represents") != "") {
                log("Setting all");
                obj.set("left", LocX + 1);
                obj.set("top", LocY);
            }
        }
        else {
            if (obj.get("name").indexOf(CharName) !== -1) {
                if (obj.get("represents") != "") {
                    obj.set("left", LocX + 1);
                    obj.set("top", LocY);
                }
            }
        }
    });
    
    /*   *************************  HANDLES MOVETRACKER  **********************/
    //Handler for when Movement Tracker is present and running
    if (InitiativeCheck() == false) return; //Exit if initiative os empty;
    if (MovementTracker.length == 0 ) return;
    if (MovementTracker.ENABLE_MOVEMENT == false) return; //Do nothing if disabled
    
    
    //Old amount of move distance
    var OldMoved = CalcUnitsMoved();
    
    //Set a new pin to calc the new distance traveled
    SetPin(MovementTracker.MoveNumber, LocX, LocY, obj.get("width"), obj.get("height"), 0);
    MovementTracker.MoveNumber = MovementTracker.MoveNumber + 1;
    
    //Calculate new distance
    var NewMoved = CalcUnitsMoved();
    
    //Gets scale of board
    var currentPage = getObj("page", Campaign().get("playerpageid"));
    var scale = currentPage.get("scale_number");
    
    //Difference is counted as DMs Movement
    MovementTracker.GM_MOVES_COUNT = (NewMoved - OldMoved) / scale + MovementTracker.GM_MOVES_COUNT ;
    
    // Gets the characters speed
    var Speed =  GetCharMaxSpeed(obj.get("represents"));
    
    //Subtract movement from speed
    SetCharSpeed(obj.get("represents"), Speed - OldMoved);
    
    //Reset Aura
    SetPin(MovementTracker.MoveNumber - 1, NewX, NewY, obj.get("width"), obj.get("height"), (Speed - OldMoved), (Speed * 2) - OldMoved);
    //****************************************************************
};

on("chat:message", function(msg) {   
    var cmdName = "!Teleport ";

    if (msg.type == "api" && msg.content.indexOf(cmdName) !== -1 && Teleporter.GMName == msg.who) {
        var cleanedMsg = msg.content.replace(cmdName, "");
        var commands = cleanedMsg.split(", ");
        var targetName = commands[0];

        i = 1
        while ( i < commands.length ) {
            Teleporter.Teleport(commands[i], targetName)
            i = i + 1;
        }
    }
});

on("change:graphic", function(obj) {
    if (obj.get("name").indexOf("Teleport") !== -1) return; //Do not teleport teleport pads!!
    if (Teleporter.AUTOTELEPORTER == false) return; //Exit if auto Teleport is disabled
    /*  To use this system, you need to name two Teleportation locations the same
    *   with only an A and B distinction. For instance Teleport01A and Teleport01B 
    *   will be linked together. When a token gets on one location, it will be
    *   Teleported to the other automatically */
    
    //Remove or comment out if not using Movement Tracker
    if (MyTurn(obj) == false ) return;  //If not my turn exit without moving
    
    //Finds the current teleportation location
    var CurrName = "";
    
    var location = findObjs({
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        layer: "gmlayer", //location MUST be on GM layer
        left: obj.get("left"),
        top: obj.get("top"),
    });
    
    if (location.length == 0) return;
    
    CurrName = location[0].get("name");
    
    var Letters = new Array("A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L");
    
    //Number of doors in the cycle (second to last character)
    var doorCount = CurrName.substr(CurrName.length - 2, 1);
    
    //Current Letter of the Door
    var currDoor = CurrName.substr(CurrName.length - 1, 1);
    //Finds the pair location and moves target to that location
    
    var i = Letters.indexOf(currDoor);
    
    if (i == doorCount - 1) {
        i = 0;
    }
    else {
        i = i + 1;
    }
    
    NewName = CurrName.substr(0,CurrName.length - 2) + doorCount + Letters[i];
    log(NewName);
    
    var NewX = 0;
    var NewY = 0;
    
    var newLocation = findObjs({
        _pageid: Campaign().get("playerpageid"),                              
        _type: "graphic",
        layer: "gmlayer", //target location MUST be on GM layer
        name: NewName,
    });
    _.each(newLocation, function(Loc){
            //Get the new Location
        NewX = Loc.get("left");
        NewY = Loc.get("top");
    });
    
    if (NewX == 0 ) return;
    
    obj.set("left", NewX);
    obj.set("top", NewY);
    
    /*   *************************  HANDLES MOVETRACKER  **********************/
    //Handler for when Movement Tracker is present and running
    if (MovementTracker.length == 0 ) return;
    if (MovementTracker.ENABLE_MOVEMENT == false) return; //Do nothing if disabled
    if (InitiativeCheck() == false) return; //Exit if initiative os empty;
    
    //Old amount of move distance
    var OldMoved = CalcUnitsMoved();
    
    //Set a new pin to calc the new distance traveled
    SetPin(MovementTracker.MoveNumber, NewX, NewY, obj.get("width"), obj.get("height"), 0);
    MovementTracker.MoveNumber = MovementTracker.MoveNumber + 1;
    
    //Calculate new distance
    var NewMoved = CalcUnitsMoved();
    
    //Gets scale of board
    var currentPage = getObj("page", Campaign().get("playerpageid"));
    var scale = currentPage.get("scale_number");
    
    //Difference is counted as DMs Movement
    MovementTracker.GM_MOVES_COUNT = (NewMoved - OldMoved) / scale + MovementTracker.GM_MOVES_COUNT ;
    
    // Gets the characters speed
    var Speed =  GetCharMaxSpeed(obj.get("represents"));
    
    //Subtract movement from speed
    SetCharSpeed(obj.get("represents"), Speed - OldMoved);
    
    //Reset Aura
    SetPin(MovementTracker.MoveNumber - 1, NewX, NewY, obj.get("width"), obj.get("height"), (Speed - OldMoved), (Speed * 2) - OldMoved);
    //****************************************************************
});

on("chat:message", function(msg) {   
    
    if (msg.content.indexOf("!AUTOTELEPORTER") !== -1 && Teleporter.GMName == msg.who) {

        if ( Teleporter.AUTOTELEPORTER == true) {
            sendChat("System", "Autoteleporting Disabled.");
            Teleporter.AUTOTELEPORTER = false;
        }
        else {
            sendChat("System", "Autoteleporting Enabled.");
            Teleporter.AUTOTELEPORTER = true;
        }
    }
}); 