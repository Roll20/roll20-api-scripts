/* read Help.txt */
var NathaCypherSystem = NathaCypherSystem || (function () {
    'use strict';
    var version = 1.2,
    releasedate= "2015-10-07",
    schemaversion = 1.0,
    author="Natha (roll20userid:75857)",
    warning = "This script is meant to be used with the Cypher System Sheet, as chat outputs and error messages are mostly done through the sheet's templates:",
    //-----------------------------------------------------------------------------
    checkInstall = function() {
        log(""+author+"'s Cypher System API script version "+version+" ("+releasedate+") installed.");
        log(warning);
        log("https://github.com/Roll20/roll20-character-sheets/tree/master/CypherSystem");
        log("Enjoy!");
    },
    //-----------------------------------------------------------------------------
    checkCharStates = function (characterObj) {
        // Check the character and token states (damage track) based on her current stat pools attributes

        // Find the character's token object
        var might = 0;
        var speed = 0;
        var intellect = 0;
        var specdmg = 0;
	    var damage = 0;
	    var CurrentDamage = 0;
	    // reading all relevant stats and attributes from the character
	    might = parseInt(getAttrByName(characterObj.id, "might", "current")) || 0;
	    speed = parseInt(getAttrByName(characterObj.id, "speed", "current")) || 0;
	    intellect = parseInt(getAttrByName(characterObj.id, "intellect", "current")) || 0;
        specdmg = parseInt(getAttrByName(characterObj.id, "SpecialDamage", "current")) || 0;
	    // calculating the damage track depending on the stats
	    // and setting the right markers depending on the damage track
        damage += specdmg;
	    if (might <= 0) {damage += 1};
	    if (speed <= 0) {damage += 1};
	    if (intellect <= 0) {damage += 1};
        damage = Math.min(damage,3);
	    CurrentDamage = parseInt(getAttrByName(characterObj.id, "damage-track", "current")) || 0;
	    //sendChat("character|"+characterObj.get("id"), "Debug : Might = " + might + ", Damage Track = " + CurrentDamage + ", Damage = " + damage);
	    if (CurrentDamage != damage) {
            //sendChat("GM","Damage track : "+CurrentDamage+" Calculated: "+damage); //DEBUG
            var attDmgArray = findObjs({
                _type: 'attribute',
	            name: "damage-track",
	            _characterid: characterObj.id
	        });
            if(attDmgArray.length){
                attDmgArray[0].set("current",damage);
            }else{
                createObj("attribute", {
                    name: "damage-track",
                    current: damage,
                    characterid: characterObj.id
                });
            };
            var tokens = findObjs({
    	        _pageid: Campaign().get("playerpageid"),
    	        _type: "graphic",
    	        layer:"objects",
    	        represents: characterObj.id
    	    });
    	    if (tokens.length > 0) {
	            switch (damage) {
	                case 0 : //normal state
	                    tokens[0].set("status_yellow",false);
	                    tokens[0].set("status_red",false);
	                    tokens[0].set("status_dead",false);
	                    break;
	                case 1 : // impaired
	                    tokens[0].set("status_yellow",true);
	                    tokens[0].set("status_red",false);
	                    tokens[0].set("status_dead",false);
	                    break;
	                case 2 : // disabled
	                    tokens[0].set("status_yellow",true);
	                    tokens[0].set("status_red",true);
	                    tokens[0].set("status_dead",false);
	                    break;
	                case 3 : // dead
	                    tokens[0].set("status_yellow",false);
	                    tokens[0].set("status_red",false);
	                    tokens[0].set("status_dead",true);
	                    break;
	            }
	        };
	    };
	    return;
	},
	//-----------------------------------------------------------------------------
	restChar = function (characterObj) {
	    //Complete rest/reset of the character

	    // MIGHT
	    var attObjArray = findObjs({
	                    _type: 'attribute',
	                    name: "might",
	                    _characterid: characterObj.id
	                });
        if(attObjArray.length>0){
            attObjArray[0].set("current", attObjArray[0].get("max"));
        } else {
		    var might = parseInt(getAttrByName(characterObj.id, "might", "max")) || 11;
            createObj("attribute", {
                name: "might",
                current: might,
                max: might,
                characterid: characterObj.id
            });
        };

	    // SPEED
	    attObjArray = findObjs({
	                    _type: 'attribute',
	                    name: "speed",
	                    _characterid: characterObj.id
	                });
        if(attObjArray.length>0){
            var maxspeed = parseInt(attObjArray[0].get("max")) || 0;
    	    attObjArray[0].set("current", maxspeed);
        } else {
		    var speed = parseInt(getAttrByName(characterObj.id, "speed", "max")) || 10;
            createObj("attribute", {
                name: "speed",
                current: speed,
                max: speed,
                characterid: characterObj.id
            });
        };

	    // INTELLECT
	    attObjArray = findObjs({
	                    _type: 'attribute',
	                    name: "intellect",
	                    _characterid: characterObj.id
	                });
        if(attObjArray.length>0){
            attObjArray[0].set("current",  attObjArray[0].get("max"));
        } else {
	    	var intellect = parseInt(getAttrByName(characterObj.id, "intellect", "max")) || 7;
            createObj("attribute", {
                name: "intellect",
                current: intellect,
                max: intellect,
                characterid: characterObj.id
            });
        };

	    //Recovery rolls
	    attObjArray = findObjs({
	                    _type: 'attribute',
	                    name: "recovery-rolls",
	                    _characterid: characterObj.id
	                });
        if(attObjArray.length>0){
            attObjArray[0].set("current", "0");
        } else {
            createObj("attribute", {
                name: "recovery-rolls",
                current: 0,
                characterid: characterObj.id
            });
        };

        // Special Damage
	    var attObjArray = findObjs({
	                    _type: 'attribute',
	                    name: "SpecialDamage",
	                    _characterid: characterObj.id
	                });
        if(attObjArray.length>0){
            attObjArray[0].set("current", "0");
        } else {
            createObj("attribute", {
                name: "SpecialDamage",
                current: 0,
                characterid: characterObj.id
            });
        };

        //Markers & States & Damage track
	    checkCharStates(characterObj);

	    //output
	    sendChat("character|" + characterObj.id, "&{template:cyphRecovery} {{fullRest=1}}");
	},
	//-----------------------------------------------------------------------------
    modStat = function (characterObj,statName,statCost) {
        // checking the stat
	    var stat1 = "";
	    if(statName == "might" || statName == "speed" || statName == "intellect" || statName=="recovery-rolls") {
	        stat1 = statName;
	    } else {
	        sendChat("character|"+charId, "&{template:cyphMsg} {{modStat=1}} {{noAttribute=" + statName + "}}");
	        return;
	    };
        if(stat1 == "recovery-rolls"){
            var objArray = findObjs({
    	                    _type: 'attribute',
    	                    name: stat1,
    	                    _characterid: characterObj.id
    	                });
            if (!objArray.length) {
                obj1 = createObj("attribute", {
                    name: stat1,
                    current: statCost,
                    characterid: characterObj.id
                });
    	    } else {
    	        objArray[0].set("current",statCost);
    	    };
            sendChat("character|"+characterObj.id, "Next recovery action updated.");
        } else {
            //stat pool modification
    	    var pool1 = 0;
    	    var max1 = 0;
    	    var finalPool = 0;
    	    var objArray = findObjs({
    	                    _type: 'attribute',
    	                    name: stat1,
    	                    _characterid: characterObj.id
    	                });
    	    var obj1;
    	    if (!objArray.length) {
    		    pool1 = parseInt(getAttrByName(characterObj.id, stat1, "current")) || 0;
    		    max1 = parseInt(getAttrByName(characterObj.id, stat1, "max")) || 0;
                obj1 = createObj("attribute", {
                    name: stat1,
                    current: pool1,
                    max: max1,
                    characterid: characterObj.id
                });
    	    } else {
    	        obj1 = objArray[0];
    	        pool1=parseInt(obj1.get("current")) || 0;
    	    };
    	    if(statCost > pool1){
    	    	//several stats will be diminished
    	    	var pool2, pool3, max2, max3 = 0;
    	    	var stat2, stat3 = '';
    	    	var obj2, obj3;
    	    	switch(statName){
    	    		case "might":
    	    			stat2 = 'speed';
    	    			stat3 = 'intellect';
    	    			break;
    	    		case "speed":
    	    			stat2 = 'might';
    	    			stat3 = 'intellect';
    	    			break;
    	    		case "intellect":
    	    			stat2 = 'might';
    	    			stat3 = 'speed';
    	    			break;
    	    	}
    		    objArray = findObjs({
    		                    _type: 'attribute',
    		                    name: stat2,
    		                    _characterid: characterObj.id
    		                });
    		    if (!objArray.length) {
    			    pool2 = parseInt(getAttrByName(characterObj.id, stat2, "current")) || 0;
    			    max2 = parseInt(getAttrByName(characterObj.id, stat2, "max")) || 0;
    	            obj2 = createObj("attribute", {
    	                name: stat2,
    	                current: pool2,
    	                max: max2,
    	                characterid: characterObj.id
    	            });
    		    } else {
    		    	obj2= objArray[0];
    		        pool2=parseInt(obj2.get("current")) || 0;
    		    };
    		    objArray = findObjs({
    		                    _type: 'attribute',
    		                    name: stat3,
    		                    _characterid: characterObj.id
    		                });
    		    if (!objArray.length) {
    			    pool3 = parseInt(getAttrByName(characterObj.id, stat3, "current")) || 0;
    			    max3 = parseInt(getAttrByName(characterObj.id, stat3, "max")) || 0;
    	            obj3 = createObj("attribute", {
    	                name: stat3,
    	                current: pool3,
    	                max: max3,
    	                characterid: characterObj.id
    	            });
    		    } else {
    		    	obj3 = objArray[0];
    		        pool3=parseInt(obj3.get("current")) || 0;
    		    };
    		    // calculus
       	    	statCost = statCost - pool1;
    	    	obj1.set("current",0);
    		    if(statCost > pool2){
    		    	statCost = statCost - pool2;
    		    	obj2.set("current",0);
    		    	if(statCost > pool3){
    		    		obj3.set("current",0);
    		    		sendChat("character|"+characterObj.id, "He's dead, Jim! Might, Speed and Intellect down to 0.");
    		    	}else{
    		    		finalPool = pool3 - statCost;
    		    		obj3.set("current",finalPool);
    		    		sendChat("character|"+characterObj.id, "" + stat1 + " and " + stat2 + " down to 0. " + stat3 + ": " + pool3 + "-" + statCost + "=" + finalPool);
    		    	};
    		    }else{
    		    	finalPool = pool2 - statCost;
    		    	obj2.set("current",finalPool);
    		    	sendChat("character|"+characterObj.id, "" + stat1 + " down to 0. " + stat2 + ": " + pool2 + "-" + statCost + "=" + finalPool);
    		    };
    	    }else{
    	    	//just the current stat is diminished
    	        finalPool = pool1 - statCost;
        	    obj1.set("current",finalPool);
        	    sendChat("character|"+characterObj.id, "" + stat1 + ": " + pool1 + "-" + statCost + "=" + finalPool);
    	    };
            checkCharStates(characterObj);
        };
    },
    //-----------------------------------------------------------------------------
    resetAction = function (characterObj) {
        //Resets (sets to 0) the action parameters

	    // rollVarDiff - Difficulty
	    var attrName = "rollVarDiff";
	    var objArray = findObjs({
	                    _type: 'attribute',
	                    name: attrName,
	                    _characterid: characterObj.id
	                });
        if(objArray.length>0){
            objArray[0].set("current", 0);
        } else {
            createObj("attribute", {
                name: attrName,
                current: 0,
                characterid: characterObj.id
            });
        };

	    // rollVarCost - Cost
	    attrName = "rollVarCost";
	    objArray = findObjs({
	                    _type: 'attribute',
	                    name: attrName,
	                    _characterid: characterObj.id
	                });
        if(objArray.length>0){
            objArray[0].set("current", 0);
        } else {
            createObj("attribute", {
                name: attrName,
                current: 0,
                characterid: characterObj.id
            });
        };

	    // rollVarBonus - Bonus
	    attrName = "rollVarBonus";
	    objArray = findObjs({
	                    _type: 'attribute',
	                    name: attrName,
	                    _characterid: characterObj.id
	                });
        if(objArray.length>0){
            objArray[0].set("current", 0);
        } else {
            createObj("attribute", {
                name: attrName,
                current: 0,
                characterid: characterObj.id
            });
        };

	    // rollVarRollEff - Roll effort
	    attrName = "rollVarRollEff";
	    objArray = findObjs({
	                    _type: 'attribute',
	                    name: attrName,
	                    _characterid: characterObj.id
	                });
        if(objArray.length>0){
            objArray[0].set("current", 0);
        } else {
            createObj("attribute", {
                name: attrName,
                current: 0,
                characterid: characterObj.id
            });
        };

	    // rollVarRollDmg - Damage effort
	    attrName = "rollVarRollDmg";
	    objArray = findObjs({
	                    _type: 'attribute',
	                    name: attrName,
	                    _characterid: characterObj.id
	                });
        if(objArray.length>0){
            objArray[0].set("current", 0);
        } else {
            createObj("attribute", {
                name: attrName,
                current: 0,
                characterid: characterObj.id
            });
        };

	    // rollVarAsset - Asset
	    attrName = "rollVarAsset";
	    objArray = findObjs({
	                    _type: 'attribute',
	                    name: attrName,
	                    _characterid: characterObj.id
	                });
        if(objArray.length>0){
            objArray[0].set("current", 0);
        } else {
            createObj("attribute", {
                name: attrName,
                current: 0,
                characterid: characterObj.id
            });
        };

        //End
        sendChat("character|"+characterObj.id,"Action parameters reset done.");
    },
	//-----------------------------------------------------------------------------
	npcDamage = function (tokenObj,characterObj,dmgDealt, applyArmor) {
	    // Apply damage (or healing if dmdDeal is negative ...) to Numenera NPC/Creature
	    // And set "death" marker if health is 0 or less.
	    // The Mook or Non Player full Character must have the following attributes :
	    //  - Level (token bar1)
	    //  - Health (token bar2)
	    //  - Armor (token bar3)
	    // Armor will diminish damage unless "applyArmor"='n'

	    var dmg = parseInt(dmgDealt) || 0;
	    var npcName = characterObj.get("name");
	    var npcHealth = 0;
	    var npcMaxHealth = 0;
	    var npcArmor=0;
	    if (applyArmor!="n"){
	        npcArmor = parseInt(getAttrByName(characterObj.id, "Armor", "current")) || 0;
            //DEBUG
            //sendChat("GM", "/w gm npcDamage() Debug : Armor of ('"+npcName+"', char id:"+characterObj.id+", token id:"+tokenObj.id+") = "+npcArmor);
	    };
	    // Is the token linked to the character ("full NPC") or a Mook ?
	    var isChar = tokenObj.get("bar1_link");
	    if (isChar == "") {
	        // It's a Mook : get the bars value
	        npcHealth = parseInt(tokenObj.get("bar2_value"));
	        npcMaxHealth = parseInt(tokenObj.get("bar2_max"));
	    } else {
	        // It's a "full" character NPC : get the attributes values
	        var attObjArray = findObjs({
	                        _type: "attribute",
	                        name: "Health",
	                        _characterid: characterObj.id
	                    });
	        if (attObjArray == false) {
	            sendChat("GM", "/w gm npcDamage() Error : this character ('"+npcName+"') has no Health attribute!");
	            return false;
	        } else {
	            npcHealth=parseInt(attObjArray[0].get("current")) || 0;
	            npcMaxHealth=parseInt(attObjArray[0].get("max")) || 0;
	        };
	    };
	    // In case the Health attribute / bar has no maximum value
	    npcMaxHealth = Math.max(npcHealth, npcMaxHealth);
	    if (dmg > 0) {
	        dmg = Math.max((dmg - npcArmor),0);
	    };
	    var npcHealthFinal = Math.min(Math.max((npcHealth - dmg),0),npcMaxHealth);
	    if (isChar == "") {
	        // Mook : update bars onbly
	        tokenObj.set("bar2_max", npcMaxHealth);
	        tokenObj.set("bar2_value",npcHealthFinal);
	    } else {
	        // Update character attributes
	        attObjArray[0].set("max",npcMaxHealth);
	        attObjArray[0].set("current",npcHealthFinal);
	    };
	    tokenObj.set("status_dead", (npcHealthFinal == 0));
        if (dmgDealt>0) {
	        sendChat("GM", "/w gm " + npcName + " takes " + dmg + " damage (" + dmgDealt + " - " + npcArmor + " Armor). Health: " + npcHealth + "->" + npcHealthFinal + ".");
        } else {
            sendChat("GM", "/w gm " + npcName + " is healed for " + dmg + " points. Health: " + npcHealth + "->" + npcHealthFinal + ".");
        };
        return;
	},
	//-----------------------------------------------------------------------------
    handleAttributeEvent = function(obj, prev) {
        /*
        	Check and set character states according to stats pools attributes
                and special damage, when their current values are manually
                changed on the sheet or directly in the character window.
	    	Note that this event isn't fired when attributes are modified by API functions,
	    		that's why some functions here call checkCharStates() too.
	    */
	    var attrName = obj.get("name");
        if ( attrName=="might" || attrName=="speed" || attrName=="intellect" || attrName=="SpecialDamage") {
            checkCharStates(getObj("character", obj.get("_characterid")));
	    };
	  	return;
	},
	//-----------------------------------------------------------------------------
    handleInput = function(msg) {
        if (msg.type !== "api") {
            return;
        };
        if (msg.content.indexOf("!cypher-") !== 0) {
        	return;
        } else {
            if (parseInt(msg.content.indexOf(" ")) ==-1) {
                //every function requires at least one parameter
                return;
            } else {
            	var functionCalled, obj;
            	var paramArray= new Array(1);
                functionCalled = msg.content.split(" ")[0];
                paramArray[0] = msg.content.split(" ")[1];
                //log("Function called:"+functionCalled+" Parameters:"+paramArray[0]); //DEBUG
                if (parseInt(paramArray[0].indexOf("|")) !=-1) {
                	//more than 1 parameter (supposedly character_id as first paramater)
                	paramArray = paramArray[0].split("|");
                };
                obj = getObj("character", paramArray[0]);
            };
        };
        switch(functionCalled) {
        	case '!cypher-checkchar':
	            if (!obj) {
	               	sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-checkpcstate}} {{noCharacter="+msg.content+"}}");
	                return false;
	            };
	    		checkCharStates(obj);
        		break;
        	case '!cypher-restchar':
        		// restchar can be called with a token_id or character_id
                if(!obj) {
	            	//not a character_id
		            obj = findObjs({
                        _pageid: Campaign().get("playerpageid"),
            	        _type: "graphic",
            	        layer:"objects",
            	        _id: paramArray[0]
            	    })[0];
	            };
	            if (!obj) {
	            	//not a token either
	                sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-restchar}} {{noTokNoChar= "+msg.content+"}}");
	                return false;
		        } else {
                    if(obj.get("type")=="graphic") {
                        // it's a token but does it represents a character ?
	            	    obj = getObj("character", obj.get("represents"));
                        if (!obj) {
                        	//not a token either
        	                sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-restchar}} {{noTokNoChar= "+msg.content+"}}");
        	                return false;
        		        };
                    };
	            };
                restChar(obj);
        		break;
    		case '!cypher-npcdmg':
    			//this function requires 3 parameters : token_id|damage|apply armor y/n
            	if(paramArray.length != 3) {
    				sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-npcdmg}} {{genericMsg=Wrong parameters (expected: token_id|damage|apply armor y/n): '"+Parameters+"''}}");
    				return false;
    			};
    			//
                obj=getObj("graphic", paramArray[0]);
                if(!obj){
                    sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-npcdmg}} {{noToken="+paramArray[0]+"}}");
                    return false;
                };
	            if(!obj.get("represents")) {
	               	sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-npcdmg}} {{notCharToken="+paramArray[0]+"}}");
	                return false;
	            };
	            npcDamage(obj,getObj("character",obj.get("represents")),paramArray[1],paramArray[2]);
    			break;
            case '!cypher-modstat':
                //this function requires 3 parameters : character_id|stat|cost
                if(paramArray.length != 3) {
    				sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-modstat}} {{genericMsg=Wrong parameters (expected: character_id|stat|cost): '"+Parameters+"''}}");
    				return false;
    			};
    			//
                if (!obj) {
                    sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-modstat}} {{notaCharacter="+paramArray[0]+"}}");
                    return false;
                };
                modStat(obj,paramArray[1],paramArray[2],paramArray[3]);
                break;
            case '!cypher-resetaction':
                //this function requires no other parameter
                if (!obj) {
                    sendChat("GM", "&{template:cyphMsg} {{chatmessage=cypher-resetaction}} {{notaCharacter="+paramArray[0]+"}}");
                    return false;
                };
                resetAction(obj);
                break;
    	}
        return;
    },
    //-----------------------------------------------------------------------------
    registerEventHandlers = function() {
        on('chat:message', handleInput);
		on('change:attribute:current', handleAttributeEvent);
    };
	//-----------------------------------------------------------------------------
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());
//-----------------------------------------------------------------------------
on('ready',function() {
    'use strict';
    NathaCypherSystem.CheckInstall();
    NathaCypherSystem.RegisterEventHandlers();
});
