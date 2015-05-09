on("chat:message", function(msg) {
    // Start with selected tokens
    if (msg.type == "api" && (msg.content.indexOf("!sfstart") !== -1 || msg.content.indexOf("!sfadd") !== -1) && playerIsGM(msg.playerid)) {
        
        // Display the initiative box
        Campaign().set("initiativepage", true );
        
        // If Start, clear the turn order, else append
        if (msg.content.indexOf("!sfstart") !== -1) {
            var turnorder = [];
            Campaign().set("turnorder", JSON.stringify(turnorder));
        }else{
            var turnorder = JSON.parse(Campaign().get("turnorder"));
        }
        
    
        // Iterate through selected tokens
        try{
            _.each(msg.selected, function(selected) {
                var obj = getObj("graphic", selected._id);
                
                // Set placeholder turn
                turnorder.push({
                    id: obj.get("_id"),
                    pr: "?"
                });
                
                // Does this have an attached sheet?
                if(obj.get("represents") !== ""){
                    var characterid = obj.get("represents");
                    
                    // Send action prompt to players
                    if(getObj("character", characterid).get('controlledby') == ""){
                        // Prompts the GM if there is no controller for the character
                        sendChat("character|"+characterid, "/w GM &{template:default} {{name="+getAttrByName(characterid, 'character_name')+"\'s next move}} {{Melee, Light or Finesse Weapon (+2)=[Roll](!sfattack 2 "+characterid+" "+obj.get("_id")+")}} {{Melee, Standard One-hand Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Standard Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Melee, Heavy or Two-handed Weapon (-2)=[Roll](!sfattack -2 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Loading Weapon (-5)=[Roll](!sfattack -5 "+characterid+" "+obj.get("_id")+")}} {{Spellcasting or Other=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}}");
                    }else{
                        // Sends a message to the character (and by extension, all controlling characters)
                        var charname = "/w "+getAttrByName(characterid, 'character_name')+" ";
                        sendChat("character|"+characterid, charname+"&{template:default} {{name="+getAttrByName(characterid, 'character_name')+"\'s next move}} {{Melee, Light or Finesse Weapon (+2)=[Roll](!sfattack 2 "+characterid+" "+obj.get("_id")+")}} {{Melee, Standard One-hand Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Standard Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Melee, Heavy or Two-handed Weapon (-2)=[Roll](!sfattack -2 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Loading Weapon (-5)=[Roll](!sfattack -5 "+characterid+" "+obj.get("_id")+")}} {{Spellcasting or Other=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}}");
                    }
                }else{
                    // This token represents no character. Prompt GM & warn.
                    sendChat("Error Maestro", "/w GM &{template:default} {{name=Unknown token\'s next move}} {{Melee, Light or Finesse Weapon (+2)=[Roll](!sfattack 2 0 "+obj.get("_id")+")}} {{Melee, Standard One-hand Weapon=[Roll](!sfattack 0 0 "+obj.get("_id")+")}} {{Ranged, Standard Weapon=[Roll](!sfattack 0 0 "+obj.get("_id")+")}} {{Melee, Heavy or Two-handed Weapon (-2)=[Roll](!sfattack -2 0 "+obj.get("_id")+")}} {{Ranged, Loading Weapon (-5)=[Roll](!sfattack -5 0 "+obj.get("_id")+")}} {{Spellcasting or Other=[Roll](!sfattack 0 0 "+obj.get("_id")+")}}");
                }
                
            });
            Campaign().set("turnorder", JSON.stringify(turnorder));
        } catch(err){log('error iterating through tokens: '+err);}
        Campaign().set("initiativepage", true );
    }
    
    // Start with tokens currently in initiative
    if (msg.type == "api" && msg.content.indexOf("!sfround") !== -1 && playerIsGM(msg.playerid)) {
        // Get the turn order
        var turnorder = JSON.parse(Campaign().get("turnorder"));
        // Get all the tokens in the turn order
        _.each(turnorder, function(turnorder_slot, index) {
            var obj = getObj("graphic", turnorder_slot.id);
            // If this is a token, get the attached character and send the turn prompt to their players
            if (obj) {
                
                turnorder[index].pr = "?";
                
                // Does this have an attached sheet?
                if(obj.get("represents") !== ""){
                    var characterid = obj.get("represents");
                    
                    // Send action prompt to players
                    if(getObj("character", characterid).get('controlledby') == ""){
                        // Prompts the GM if there is no controller for the character
                        sendChat("character|"+characterid, "/w GM &{template:default} {{name="+getAttrByName(characterid, 'character_name')+"\'s next move}} {{Melee, Light or Finesse Weapon (+2)=[Roll](!sfattack 2 "+characterid+" "+obj.get("_id")+")}} {{Melee, Standard One-hand Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Standard Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Melee, Heavy or Two-handed Weapon (-2)=[Roll](!sfattack -2 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Loading Weapon (-5)=[Roll](!sfattack -5 "+characterid+" "+obj.get("_id")+")}} {{Spellcasting or Other=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}}");
                    }else{
                        // Sends a message to the character (and by extension, all controlling characters)
                        var charname = "/w "+getAttrByName(characterid, 'character_name')+" ";
                        sendChat("character|"+characterid, charname+"&{template:default} {{name="+getAttrByName(characterid, 'character_name')+"\'s next move}} {{Melee, Light or Finesse Weapon (+2)=[Roll](!sfattack 2 "+characterid+" "+obj.get("_id")+")}} {{Melee, Standard One-hand Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Standard Weapon=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}} {{Melee, Heavy or Two-handed Weapon (-2)=[Roll](!sfattack -2 "+characterid+" "+obj.get("_id")+")}} {{Ranged, Loading Weapon (-5)=[Roll](!sfattack -5 "+characterid+" "+obj.get("_id")+")}} {{Spellcasting or Other=[Roll](!sfattack 0 "+characterid+" "+obj.get("_id")+")}}");
                    }
                }else{
                    // This token represents no character. Prompt GM & warn.
                    sendChat("Error Maestro", "/w GM &{template:default} {{name=Unknown token\'s next move}} {{Melee, Light or Finesse Weapon (+2)=[Roll](!sfattack 2 0 "+obj.get("_id")+")}} {{Melee, Standard One-hand Weapon=[Roll](!sfattack 0 0 "+obj.get("_id")+")}} {{Ranged, Standard Weapon=[Roll](!sfattack 0 0 "+obj.get("_id")+")}} {{Melee, Heavy or Two-handed Weapon (-2)=[Roll](!sfattack -2 0 "+obj.get("_id")+")}} {{Ranged, Loading Weapon (-5)=[Roll](!sfattack -5 0 "+obj.get("_id")+")}} {{Spellcasting or Other=[Roll](!sfattack 0 0 "+obj.get("_id")+")}}");
                }
            }
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
        Campaign().set("initiativepage", true );
    }
    if (msg.type == "api" && msg.content.indexOf("!sfattack") !== -1){
        
        // Split out variables passed to the API
        var vals = msg.content.split(" ");
        var speedfactor = parseInt(vals[1]);
        var characterid = vals[2];
        var tokenid = vals[3];
        
        // Initialize mutable attribute variables
        var size;
        var sizefactor;
        var initiativebonus;
        var dexteritymod;
        var sfinitiative;
        
        if (characterid == "0") {
            dexteritymod = 0;
            initiativebonus = 0;
            sizefactor = 0;
        }else{
            // Determine if this is a character or an NPC sheet
            if (getAttrByName(characterid, 'is_npc') === '1') {
                // PC character sheet handling
                // Get size component of speed factor
                size = getAttrByName(characterid, 'npc_size');
                initiativebonus = getAttrByName(characterid, 'npc_initiative');
                dexteritymod =  Math.floor((getAttrByName(characterid, 'npc_dexterity')-10)/2);
            }else{
                // NPC character sheet handling
                // Get size component of speed factor
                size = getAttrByName(characterid, 'size');
                initiativebonus = getAttrByName(characterid, 'initiative');
                dexteritymod =  Math.floor((getAttrByName(characterid, 'dexterity')-10)/2);
            }
            
            switch(size.toLowerCase()){
                case "tiny":
                    sizefactor = 5;
                break;
                case "small":
                    sizefactor = 2;
                break;
                case "medium":
                    sizefactor = 0;
                break;
                case "large":
                    sizefactor = -2;
                break;
                case "huge":
                    sizefactor = -5;
                break;
                case "gargantuan":
                    sizefactor = -8;
                break;
                default:
                    sizefactor = 0;
            }   
        }
        
        sfinitiative = +dexteritymod + +initiativebonus + +sizefactor + +speedfactor;
         
        // Update the turn order
        var turnorder = JSON.parse(Campaign().get("turnorder"));
        
        // Turn the character into the linked token
        // TODO: Catch when character names are missing
        // TODO: This should be solved by passing the tokenID to the API button in !sfstart
        var initiativeindex = -1;
        _.each(turnorder, function(turnorder_slot, index) {
            if(turnorder_slot.id == tokenid) {
                initiativeindex = index;
            }
        });
        
        // Update the initiative bar
        turnorder[initiativeindex].pr = sfinitiative;
        Campaign().set("turnorder", JSON.stringify(turnorder));
    }
    if (msg.type == "api" && msg.content.indexOf("!sfroll") !== -1 && playerIsGM(msg.playerid)) {
        // Get the turn order
        var turnorder = JSON.parse(Campaign().get("turnorder"));
        // Roll for each slot, add the outcome to the turn order
        _.each(turnorder, function(turnorder_slot, index) {
            var checktoken = getObj("graphic", turnorder_slot.id);
            // Tell the GM if there was something wrong.
            if(turnorder_slot.pr == "?"){
                sendChat(msg.who, "/w GM one of your players didn't select an action. Wait until all of the question marks are cleared from the turnorder before calling !sfroll");
            }
            turnorder[index].pr = Math.floor((Math.random() * 20) + 1)+ +turnorder_slot.pr;
        });
        // Reorder the turn order
        turnorder.sort(function(a,b){
            if (a.pr < b.pr) {
                return 1;
            }
            if (a.pr > b.pr) {
                return -1;
            }
            return 0;
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
    }
});