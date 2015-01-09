var Combat_Begins = Combat_Begins || {};

Combat_Begins.statName = new Array ("Dex"); //Stats to be added to roll, commas between values
Combat_Begins.rollValue = 20; //rolling 1d20, change if you roll 1dXX
Combat_Begins.sendChat = true; //True if you want the chat log to show their results
Combat_Begins.includeChars = true; //set false if you want to roll for players

//If you want players to roll, make this a global macro (add other stats as needed):
//    @{selected|token_name} rolls a [[ 1d20 + @{selected|Dex} &{tracker} ]] for initiative!

on("chat:message", function(msg) {   
    if (msg.type == "api" && msg.content.indexOf("!CombatBegins") !== -1 && msg.who.indexOf("(GM)") !== -1) {
        
        Campaign().set("initiativepage", false );
        
        if (Combat_Begins.sendChat == true) {
            sendChat("", "/desc Combat Begins!");
        }
        
        try{
            _.each(msg.selected, function(selected) {
                var obj = getObj("graphic", selected._id);
                
                //Test for players, exit if players roll themself
                
                var currChar = getObj("character", obj.get("represents")) || "";
                var initString = "";
                var TokenName = "";
                var CharName = "";
                
                if (currChar.length != 0) {
                    CharName = currChar.get("name");
                    if (currChar.get("controlledby") != "" && Combat_Begins.includeChars == false ) return;
                    
                    if (CharName != "") {
                        _.each(Combat_Begins.statName, function(stat) {
                            //cycle through each stat and add it to mod
                            var mod = findObjs({
                                name: stat,
                                _characterid: obj.get("represents"),
                            }, {caseInsensitive: true});
                           
                           if ( mod.length != 0 ) { initString = initString + " + " + mod[0].get("current"); }
                        });
                    }
                    
                    var pre = "";
                    
                    if (Combat_Begins.sendChat == false || currChar.get("controlledby") == "") {
                        pre = "/w GM ";
                    };
                    
                    var string = "I rolled a [[1d" + Combat_Begins.rollValue + initString + "]] for initiative!";
                    var result = 0;
                    
                    sendChat("character|" + obj.get("represents"), string, function(ops) {
                        var rollresult = ops[0];
                        result = rollresult.inlinerolls[1].results.total;
                        var turnorder;
                    
                        if(Campaign().get("turnorder") == "") {
                            turnorder = [];
                        } else turnorder = JSON.parse(Campaign().get("turnorder"));
                        
                        turnorder.push({
                            id: selected._id,
                            pr: result,
                        });
                        
                        turnorder.sort(function(a,b) {
                            first = a.pr;
                            second = b.pr;
                            
                            return second - first;
                        });
                        
                        Campaign().set("turnorder", JSON.stringify(turnorder));
                        sendChat("character|" + obj.get("represents"), pre + "I rolled a " + result + " for initiative!");
                    });
                } else {
                    //handles non-linked tokens. Rolls the die value and uses it.
                    sendChat(obj.get("name"), "I rolled a [[1d" + Combat_Begins.rollValue + "]] for initiative!", function(ops) {
                        var rollresult = ops[0];
                        result = rollresult.inlinerolls[1].results.total;
                        var turnorder;
                    
                        if(Campaign().get("turnorder") == "") {
                            turnorder = [];
                        } else turnorder = JSON.parse(Campaign().get("turnorder"));
                        
                        turnorder.push({
                            id: selected._id,
                            pr: result,
                        });
                        
                        turnorder.sort(function(a,b) {
                            first = a.pr;
                            second = b.pr;
                            
                            return second - first;
                        });
                        
                        Campaign().set("turnorder", JSON.stringify(turnorder));
                        sendChat(obj.get("name"), "/w GM I rolled a " + result + " for initiative!");
                    });
                }
            });
        } catch(err){return;}
        Campaign().set("initiativepage", true );
    }
    
    if (msg.type == "api" && msg.content.indexOf("!CombatEnds") !== -1) {
            Campaign().set("turnorder", "");
            Campaign().set("initiativepage", false );
            if (MovementTracker.MovementTracker == true) { ResetAllPins() };
    };
});