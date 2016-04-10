var ExperienceTracker;  //if you know the _id of the ExperienceTracker sheet you 
                        //can put it here for a boost in startup performance ex.
                        //var ExperienceTracker = getObj("character", "-Jixfi5HgiFi0C4RNih9");
    
    var announcerName = "Kasper";
    var tooltip = 0;

on("ready", function(){
    if (ExperienceTracker == null) {
        ExperienceTracker = findObjs({
            _type: "character",
            name: "ExperienceTracker"
        })[0];
        
        //if no ExperienceTracker exist, create a brand spanking new one!  
        if (ExperienceTracker == null) {
            ExperienceTracker = createObj("character", {
                name: "ExperienceTracker"
            });
            
            createObj("attribute", {
                name: "currentXP/toNextLVL",
                current: 0, max: 300,
                characterid: ExperienceTracker.id
            });
            
            createObj("attribute", {
                name: "CurrentPartySize",
                current: 4,
                characterid: ExperienceTracker.id
            });
            
            sendChat(announcerName, "Hey, I created a sheet called ExperienceTracker. You can set party size and the amount of xp to the next level there.");
            sendChat(announcerName, "You assign xp by using the !xp command followed by the amount of xp, the value will be divided by the number of party members");
            sendChat(announcerName, "If you use the OGL sheet, I will suggest making a macro like this: !xp @{selected|npc_xp}, then you can assign xp from monsters easily!");
    
        } 
    }
});

//checks is value is a real number.
function isNumber (o) {
  return ! isNaN (o-0) && o !== null && o !== "" && o !== false;
}

function updateCurrentXP(xp){
    var currXP = findObjs({_type: "attribute", name: "currentXP/toNextLVL", _characterid: ExperienceTracker.id})[0];
    var partySize = parseInt(findObjs({_type: "attribute", name: "CurrentPartySize", _characterid: ExperienceTracker.id})[0].get("current"));
    
    currXP.set("current", parseFloat(currXP.get("current")) + (xp/partySize));
    
    sendChat(announcerName, "Party gained " + xp + "xp");
    
    //check for level up
    if (currXP.get("current") >= currXP.get("max")){
        sendChat(announcerName,"LEVEL UP!");
        tooltip++;
        if (tooltip >= 3){
            sendChat(announcerName, "Remember to set the treshold for the next level, in the ExperienceTracker.");
            tooltip = 0;
        }
    } else {
        tooltip = 0;
    }
} 

on("chat:message", function(msg) {
  if(msg.type == "api" && msg.content.indexOf("!xp ") !== -1) {
    var xp = parseInt(msg.content.replace("!xp ", ""));
    
    if (isNumber(xp)){
        updateCurrentXP(xp);
    } else {
        sendChat(announcerName, "Value not assigned, no xp for this one!");
        tooltip++;
        if (tooltip >= 3){
            sendChat(announcerName, "You can assign the xp manually by using the !xp command. Ex. !xp 25");
            tooltip = 0;
        }
    }
  }
  if(msg.type == "api" && msg.content.indexOf("!kill ") !== -1) {
    var xp = parseInt(msg.content.replace("!xp ", ""));
    sendChat(announcerName, "Party gained " + xp + "xp");
    
    updateCurrentXP(xp);
  }
});
