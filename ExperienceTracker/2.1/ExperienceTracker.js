//ExperienceTracker v. 2.1 updated on the 26-04-2016 by Kasper Kristensen
/*
    This script allows for automatic tracking of a Dungeons and Dragons 5e like
    experience system, aswell as level up announcement in chat.
*/
//creating namespace
var EXPERIENCETRACKER = EXPERIENCETRACKER || {};

EXPERIENCETRACKER.PrivateAttributes = function() {
    var ExperienceTracker;
    var tooltip = 0;
};

on("ready", function(){
    if (EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker == null) {
        EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker = findObjs({
            _type: "character",
            name: "ExperienceTracker"
        })[0];
        
        //if no ExperienceTracker exist, create a brand spanking new one!  
        if (EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker == null) {
            EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker = createObj("character", {
                name: "ExperienceTracker"
            });
            
            createObj("attribute", {
                name: "currentXP/toNextLVL",
                current: 0, max: 300,
                characterid: EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker.id
            });
            
            createObj("attribute", {
                name: "CurrentPartySize",
                current: 4,
                characterid: EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker.id
            });
            
            sendChat("Kasper", "Hey, I created a sheet called ExperienceTracker. You can set party size and the amount of xp to the next level there.");
            sendChat("Kasper", "You assign xp by using the !xp command followed by the amount of xp, the value will be divided by the number of party members");
            sendChat("Kasper", "If you use the OGL sheet, I will suggest making a macro like this: !xp &#64;{selected|npc_xp}, then you can assign xp from monsters easily!");
    
        } 
    }
});

//checks is value is a real number.
EXPERIENCETRACKER.isNumber = function (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

EXPERIENCETRACKER.updateCurrentXP = function(xp){
    var currXP = findObjs({_type: "attribute", name: "currentXP/toNextLVL", _characterid: EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker.id})[0];
    var partySize = parseInt(findObjs({_type: "attribute", name: "CurrentPartySize", _characterid: EXPERIENCETRACKER.PrivateAttributes.ExperienceTracker.id})[0].get("current"));
    
    //type-safety
    if (!EXPERIENCETRACKER.isNumber(currXP.get("current"))){
        sendChat("Kasper", "The field currentXP needs to be a real number! fix in ExperienceTracker");
        return 1;
    }   
    else if (!EXPERIENCETRACKER.isNumber(currXP.get("max"))){
        sendChat("Kasper", "The field toNextLVL needs to be a real number! fix in ExperienceTracker");
        return 1;
    }
    else if (!EXPERIENCETRACKER.isNumber(partySize)){
        sendChat("Kasper", "The field CurrentPartySize needs to be a real number! fix in ExperienceTracker");
        return 1;
    }
    
    currXP.set("current", parseFloat(currXP.get("current")) + (xp/partySize));
    
    sendChat("", "/desc Party gained " + xp + "xp, resulting in " + currXP.get("current") + "xp total.");
    
    //check for level up
    if (currXP.get("current") >= currXP.get("max")){
        sendChat("","/em LEVEL UP!");
        EXPERIENCETRACKER.PrivateAttributes.tooltip++;
        if (EXPERIENCETRACKER.PrivateAttributes.tooltip >= 3){
            sendChat("Kasper", "Remember to set the treshold for the next level, in the ExperienceTracker.");
            EXPERIENCETRACKER.PrivateAttributes.tooltip = 0;
        }
    } else {
        EXPERIENCETRACKER.PrivateAttributes.tooltip = 0;
    }
} 

on("chat:message", function(msg) {
  if(msg.type == "api" && msg.content.indexOf("!xp ") !== -1) {
    var xp = parseInt(msg.content.replace("!xp ", ""));
    
    if (EXPERIENCETRACKER.isNumber(xp)){
        EXPERIENCETRACKER.updateCurrentXP(xp);
    } else {
        sendChat("Kasper", "Value not assigned, no xp for this one!");
        EXPERIENCETRACKER.PrivateAttributes.tooltip++;
        if (EXPERIENCETRACKER.PrivateAttributes.tooltip >= 3){
            sendChat("Kasper", "You can assign the xp manually by using the !xp command. Ex. !xp 25");
            EXPERIENCETRACKER.PrivateAttributes.tooltip = 0;
        }
    }
  }
});
