/* read Help.txt */
var NathaNumenera = NathaNumenera || (function () {
    'use strict';
    var version = 4.8,
    releasedate= "2015-10-10",
    schemaversion = 1.0,
    author="Natha (roll20userid:75857)",
    warning = "Sheet must be in version 4.8+ : chat outputs and error messages are managed through the sheet's templates.",
    //-----------------------------------------------------------------------------
    checkInstall = function() {
        log(""+author+"'s Numenera API script version "+version+" ("+releasedate+") installed.");
        log(warning);
        log("This script works with both the French and English sheet:");
        log("English sheet : https://github.com/Roll20/roll20-character-sheets/tree/master/Numenera_NathasNumenera_English");
        log("French sheet: https://github.com/Roll20/roll20-character-sheets/tree/master/Numenera_NathasNumenera_French");
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

	    // SPEED, taking account of the armor speed reduction
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
	    sendChat("character|" + characterObj.id, "&{template:nathaNumRecovery} {{fullRest=1}}");
	},
	//-----------------------------------------------------------------------------
    modStat = function (characterObj,statName,statCost,showMsg) {
        // checking the stat
	    showMsg = showMsg || 0;
	    var stat1 = "";
	    if(statName == "might" || statName == "speed" || statName == "intellect") {
	        stat1 = statName;
	    } else {
	        sendChat("character|"+charId, "&{template:nathaNumMsg} {{modStat=1}} {{noAttribute=" + statName + "}}");
	        return;
	    };
        //getting the stat values
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
		    		if(showMsg == 1){
		    			sendChat("character|"+characterObj.id, "He's dead, Jim! Might, Speed and Intellect down to 0.");
		    		};
		    	}else{
		    		finalPool = pool3 - statCost;
		    		obj3.set("current",finalPool);
		    		if(showMsg == 1){
		    			sendChat("character|"+characterObj.id, "" + stat1 + " and " + stat2 + " down to 0. " + stat3 + ": " + pool3 + "-" + statCost + "=" + finalPool);
		    		};
		    	};
		    }else{
		    	finalPool = pool2 - statCost;
		    	obj2.set("current",finalPool);
		    	if(showMsg == 1){
		    		sendChat("character|"+characterObj.id, "" + stat1 + " down to 0. " + stat2 + ": " + pool2 + "-" + statCost + "=" + finalPool);
				};
		    };
	    }else{
	    	//just the current stat is diminished
	        finalPool = pool1 - statCost;
    	    obj1.set("current",finalPool);
    	    if(showMsg == 1){
    	    	sendChat("character|"+characterObj.id, "" + stat1 + ": " + pool1 + "-" + statCost + "=" + finalPool);
    	    };
	    };
        checkCharStates(characterObj);
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

	    // rollVarSkill - Skill level
	    attrName = "rollVarSkill";
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
	initRoll = function (characterObj) {
	  	/*
		  	BEWARE : Not the standard Numenera initiative roll !
		  	The initiative roll is meant to be sorted/compared to (Level*3) of the NPCs/Creatures

		  	The function :
		  	    - Rolls 1d20, + the optional efforts (*3) + rollbonus + skill level (*3)
		  	    - Expends the optional speed points from effort(s) and initial cost.
		  	    - Then add the character, or its token (if on the map), to the tracker,
		  	          or replace the initiative value if it's already in the tracker

		  	Every necessary parameters for this function are attributes of the character sheet.
		*/
	    var charId = characterObj.get("id");
	    //getting the stats values
	    var speedPool = parseInt(getAttrByName(characterObj.id, "speed", "current")) || 10;
	    var speedEdge = parseInt(getAttrByName(characterObj.id, "speededge", "current")) || 0;
	    var attrEffort = parseInt(getAttrByName(characterObj.id, "effort", "current")) || 0;
	    var damagetrack = parseInt(getAttrByName(characterObj.id, "damage-track", "current")) || 0;
	    var bonusToRoll = parseInt(getAttrByName(characterObj.id, "InitVarBonus", "current")) || 0;
	    var statExpense = parseInt(getAttrByName(characterObj.id, "InitVarCost", "current")) || 0;
	    var effortsUsed = parseInt(getAttrByName(characterObj.id, "InitVarEffort", "current")) || 0;
	    var assetsUsed = parseInt(getAttrByName(characterObj.id, "InitVarAsset", "current")) || 0;
	    var skillLevel = parseInt(getAttrByName(characterObj.id, "InitVarSkill", "current")) || 0;
	    // Rolling the dice
	    var diceRoll = randomInteger(20);
	    // checking for appliable effort and calculating statpool cost
	    var effortCost = 0;
	    var totalCost = 0;
	    var speedPoolInit=speedPool;
	    if ((effortsUsed > 0) || (statExpense > 0)) {
            if (effortsUsed > attrEffort) {
				sendChat("character|"+charId, "&{template:nathaNumMsg} {{nathaNumInitRoll=1}} {{tooManyEfforts=" + effortsUsed + "}}");
                return;
            } else {
                effortCost = 1 + (effortsUsed * (2+damagetrack) );
            };
	        // effort cost is spent if the roll is less than 20
	        if (diceRoll != 20) {
	            totalCost = effortCost + statExpense - speedEdge;
	            speedPool = Math.max(speedPoolInit - totalCost,0);
                modStat(characterObj,"speed",totalCost,0);
	        };
	    };

	    // Calculating initiative
	    var finalRoll = diceRoll + (effortsUsed*3) + (skillLevel*3) + (assetsUsed*3) + bonusToRoll;

	    //Retrieving token, to add it to the turn tracker
	    var tokenObj;
	    var turnId;
	    var turnCustom;
	    var tokens = findObjs({
	        _pageid: Campaign().get("playerpageid"),
	        _type: "graphic",
	        layer:"objects",
	        represents: charId
	    });
	    if (tokens.length > 0) {
	        tokenObj = tokens[0];
	        turnId=""+tokenObj.id;
	        turnCustom="";
	    } else {
	        //No token, use the character's name as custom option
	        turnId="-1";
	        turnCustom=characterObj.get("name");
	    };

	    //Handling the turn tracker
	    var turnorder;
	    if(Campaign().get("turnorder") == "") {
	        turnorder = [];
	    } else turnorder = JSON.parse(Campaign().get("turnorder"));
	    //Searching if the token/character is already in the turn tracker
	    var turnFound=0;
	    for(var x in turnorder){
	        if( (turnorder[x].id == "-1") && (turnorder[x].custom=="turnCustom")){
	          //it's a character without token on the map, already in the tracker
	          //replace the value
	          turnorder[x].pr = finalRoll;
	          turnFound=1;
	          break;
	        };
	        if(turnorder[x].id == turnId){
	          //it's the token of a character, already in the tracker
	          //replace the value
	          turnorder[x].pr = finalRoll;
	          turnFound=1;
	          break;
	        };
	    }
	    if (!turnFound) {
	        //add the character or its token to the tracker
	        turnorder.push({
	            id: turnId,
	            "pr": finalRoll,
	            "custom":turnCustom
	        });
	    };
	    //Sorting the turn tracker
        var first, second;
	    turnorder.sort(function(a,b) {
	        first = a.pr;
	        second = b.pr;
	        return second - first;
	    });
	    //Updating the turn tracker
	    Campaign().set("turnorder", JSON.stringify(turnorder));

	    //output
	    var tmplt="&{template:nathaNumInit} {{finalRoll=[["+finalRoll+"]]}} {{diceRoll=[["+diceRoll+"]]}} {{speedEdge=[["+speedEdge+"]]}}";
	    if(bonusToRoll>0) tmplt+=" {{bonusToRoll=[["+bonusToRoll+"]]}}";
	    if(effortsUsed>0) tmplt+=" {{effortsUsed=[["+effortsUsed+"]]}} {{effortCost=[["+effortCost+"]]}}";
	    if(statExpense>0) tmplt+=" {{statExpense=[["+statExpense+"]]}}";
	    if(assetsUsed>0) tmplt+=" {{assets=[["+assetsUsed+"]]}}";
        if (skillLevel == -1) tmplt += " {{skilled=[[-3]]}}";
        if (skillLevel == 1) tmplt += " {{skilled=[[3]]}}";
        if (skillLevel == 2) tmplt += " {{skilled=[[6]]}}";
	    if(totalCost>0)  tmplt+=" {{totalCost=[["+totalCost+"]]}} {{attrPool=[["+speedPool+"]]}} {{attrPoolInit=[["+speedPoolInit+"]]}}";
		//log(tmplt);
	    sendChat("character|"+charId, ""+tmplt);
	},
    //-----------------------------------------------------------------------------
	statRollFromSheet= function (characterObj, statName,whoRolled) {
	    var difficulty=parseInt(getAttrByName(characterObj.id, "rollVarDiff", "current")) || 0;
	    var assets=parseInt(getAttrByName(characterObj.id, "rollVarAsset", "current")) || 0;
	    var statexp=parseInt(getAttrByName(characterObj.id, "rollVarCost", "current")) || 0;
	    var effortsOnRoll=parseInt(getAttrByName(characterObj.id, "rollVarRollEff", "current")) || 0;
	    var effortsOnDmg=parseInt(getAttrByName(characterObj.id, "rollVarRollDmg", "current")) || 0;
	    var rollBonus=parseInt(getAttrByName(characterObj.id, "rollVarBonus", "current")) || 0;
	    var skillLevel=parseInt(getAttrByName(characterObj.id, "rollVarSkill", "current")) || 0;
	    statRoll(characterObj,statName,whoRolled,difficulty,statexp,assets,effortsOnRoll,effortsOnDmg,rollBonus,skillLevel);
	},
	//-----------------------------------------------------------------------------
	statRoll = function (characterObj,statName,whoRolled,difficulty,statexp,assets,effortsOnRoll,effortsOnDmg,rollBonus,skillLevel) {
	    /*
	    	Might/speed/intellect roll with eventual roll effort(s), additionnal cost,
	    	damage effort(s), bonus to the roll (<3), skill level, against a difficulty (optional).

			Every necessary parameters for this function are attributes of the character sheet
			(except the stat name).

	    	Difficulty is the level of difficulty, not the target number.
	    	The target number is calculated by the function.

		    If difficulty is 0, the roll still happens, but is not confronted to any difficulty.
		    Instead of calculating success, it calculates the highest difficulty beaten.

	    	Unless d20 rolls a natural 20, pool points cost is calculted (taking the stat edge)
	    	and expended, if necessary and if possible.

	    	Damage track and token state are checked/updated by calling nathaNumCheckCharStates()
		*/
	    var charId = characterObj.get("id");

	    //checking the character damage track
	    var damagetrack=parseInt(getAttrByName(characterObj.id, "damage-track", "current")) || 0;
	    if (damagetrack > 1) {
	        sendChat("character|"+charId, "&{template:nathaNumMsg} {{nathaNumeneRoll=1}} {{pcDying=1}}");
	        return;
	    };

	    // checking the stat
	    var attributeName = "";
	    var edgename = "";
	    if(statName == "might" || statName == "speed" || statName == "intellect") {
	        attributeName = statName;
	        edgename = statName + "edge";
	    } else {
	        sendChat("character|"+charId, "&{template:nathaNumMsg} {{nathaNumeneRoll=1}} {{noAttribute=" + statName + "}}");
	        return;
	    };

	    //getting the stat values
	    var attrPool = parseInt(getAttrByName(characterObj.id, attributeName, "current")) || 0;;
	    var attrEdge = parseInt(getAttrByName(characterObj.id, edgename, "current")) || 0;
	    var attrEffort = parseInt(getAttrByName(characterObj.id, "effort", "current")) || 0;

	    //Checking the bonus to roll
	    var bonusToRoll = parseInt(rollBonus) || 0;
	    if( Math.abs(bonusToRoll) > 2 ) {
	        sendChat("character|"+charId, "&{template:nathaNumMsg} {{nathaNumeneRoll=1}} {{badBonus=" + bonusToRoll + "}}");
	        return;
	    };

	    // Rolling the dice
	    var diceRoll = randomInteger(20);
	    var finalRoll = diceRoll + bonusToRoll;

	    // checking for appliable effort and calculating statpool cost
	    var effortsUsed = 0;
	    var effortRoll = parseInt(0 || effortsOnRoll);
	    var effortDmg = parseInt(0 || effortsOnDmg),
	    effortsUsed = effortRoll + effortDmg;
	    var statExpense = parseInt(statexp) || 0;
	    var effortCost = 0;
	    var totalCost = 0;
	    var attrPoolInit= attrPool;
	    if ((effortsUsed > 0) || (statExpense > 0)) {
	        if (effortsUsed > 0) {
	            if (effortsUsed > attrEffort) {
			        sendChat("character|"+charId, "&{template:nathaNumMsg} {{nathaNumeneRoll=1}} {{tooManyEfforts=" + effortsUsed + "}}");
	                return;
	            } else {
	                effortCost = 1 + (effortsUsed * (2+damagetrack) );
	            };
	        };
	        // effort cost is spent if the roll is not 20
	        if (diceRoll != 20) {
	            totalCost = Math.max(0,(effortCost + statExpense - attrEdge));
	            attrPoolInit = attrPool;
	            attrPool = Math.max(attrPoolInit - totalCost,0);
	            modStat(characterObj,attributeName,totalCost,0);
	        };
	    };

	    // beginning output calculation
	skillLevel = parseInt(0 || skillLevel);	
	    var tmplt="&{template:nathaNumRoll} {{"+attributeName+"="+attributeName+"}} {{attrEdge="+attrEdge+"}} {{finalRoll="+finalRoll+"}} {{diceRoll="+diceRoll+"}} {{skilled="+ skillLevel +"}}";
	    if (bonusToRoll>0) tmplt += " {{bonusToRoll="+bonusToRoll+"}}";
	    var assetsUsed = parseInt(0 || assets);
        if (assetsUsed>0) tmplt += " {{assets="+assetsUsed+"}}";
        if (skillLevel == 0) tmplt += " {{Untrained=1}}";
        if (skillLevel == 1) tmplt += " {{Trained=1}}";
        if (skillLevel == 2) tmplt += " {{Specialized=1}}";
        if (skillLevel == -1) tmplt += " {{Inability=1}}";

		//computing final difficulty / target task
        var initDiff=parseInt(0 || difficulty);
	    if (initDiff > 0) {
	        var target = initDiff*3;
	        var finalDiff= Math.max(0, initDiff-effortRoll-assetsUsed-skillLevel);
            var targetRoll = finalDiff*3;
	        tmplt += "{{difficulty=" + initDiff + "}} {{target="+target+"}} {{finalDiff="+finalDiff+"}} {{targetRoll="+targetRoll+"}}";
	    } else {
            var rollBeats=Math.max(0, Math.floor(finalRoll/3)+effortRoll+assetsUsed+skillLevel);
            tmplt += " {{rollBeats="+rollBeats+" ("+(rollBeats*3)+")"+"}}";
	    };

	    // Checking result
	    var bonusDmg=0;
	    if ((effortsUsed > 0) || (statExpense > 0)) {
	        tmplt= tmplt + " {{totalCost=" + totalCost + "}}";
	        if (effortRoll > 0) {
	            tmplt += " {{effortCost=" + effortCost + "}} {{effortRoll=" + effortRoll + "}}";
	        };
	        if (effortDmg > 0) {
	            bonusDmg=bonusDmg + (effortDmg*3);
	            tmplt += " {{effortDmg=" + effortDmg + "}}";
	        };
	        if (statExpense > 0) {
	            tmplt += " {{statExpense=" + statExpense + "}}";
	        };
	    };
	    if (bonusToRoll != 0) {
	        tmplt += " {{bonusToRoll=" + bonusToRoll + "}}";
	    };
	    // If not an automatic success or a known difficulty
	    if (initDiff > 0) {
	        if( finalRoll >= targetRoll) {
	            tmplt += " {{boolOK=1}}";
	        }
	        else{
	            tmplt += " {{boolKO=1}}";
	        };
	    };
	    //special dice roll results treatment
	    if (diceRoll == 1) {
	        tmplt += " {{freeGMI=1}}";
	    } else {
	        if (damagetrack == 0) {
	            // if character is haled, special success is possible
	            switch (diceRoll) {
	                case 17:
	                    bonusDmg += 1;
	                    break;
	                case 18:
	                    bonusDmg += 2;
	                    break;
	                case 19:
	                    bonusDmg += 3;
	                    tmplt += " {{minorEffect=1}}";
	                    break;
	                case 20:
	                    bonusDmg += 4;
	                    tmplt += " {{majorEffect=1}} {{noExpense=1}}";
	                    break;
	            }
	        } else if (diceRoll == 20) {
	            // if character is impaired
	            tmplt += " {{noExpense=1}}";
	        };
	    };

	    //ending output
	    if(bonusDmg>0) tmplt += " {{bonusDmg="+bonusDmg+"}}";
	    if(totalCost==0) {
	        tmplt += " {{noExpense=1}}";
	    }
	    else {
	        tmplt += " {{attrPool="+attrPool+"}} {{attrPoolInit="+attrPoolInit+"}}"
	    };
	    sendChat("character|"+charId, ""+tmplt);
	},
	//-----------------------------------------------------------------------------
	recoveryRoll = function (characterObj) {
	    // Rolls a recovery rolls and advances the recovery track

	    var charId = characterObj.get("id");
	    var recrolls=parseInt(getAttrByName(charId, "recovery-rolls", "current")) || 0;
	    var recovObjArray = findObjs({
	                    _type: 'attribute',
	                    name: "recovery-rolls",
	                    _characterid: charId
	                });
	    var obj;
	    if (!recovObjArray.length) {
            obj = createObj("attribute", {
                name: "recovery-rolls",
                current: recrolls,
                max: recrolls,
                characterid: charId
            });
	    }else{
	    	obj= recovObjArray[0];
	    };
	    var recovbonus = parseInt(getAttrByName(charId, "recoverybonus", "current")) || 0;
	    var curRecLib = "";
	    var nextRecLib = "";
	    switch (recrolls) {
	        case 0 :
	            curRecLib = "1 ACTION";
	            nextRecLib = "10 MINS";
	            recrolls=1;
	            break;
	        case 1 :
	            curRecLib = "10 MINS";
	            nextRecLib = "1 HOUR";
	            recrolls=2;
	            break;
	        case 2 :
	            curRecLib = "1 HOUR";
	            nextRecLib = "10 HOURS";
	            recrolls=3;
	            break;
	        case 3 :
	            curRecLib = "10 HOURS";
	            nextRecLib = "1 ACTION";
	            recrolls=0;
	            break;
	    }
	    obj.set("current",recrolls);
	    var recovery = randomInteger(6)+recovbonus;
	    sendChat("character|" + charId, "&{template:nathaNumRecovery} {{recoverPoints=1d6+"+recovbonus+" ("+recovery+")}} {{currentAction="+curRecLib+"}} {{nextAction="+nextRecLib+"}}");
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
        if (msg.content.indexOf("!nathanum-") !== 0) {
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
            case '!nathanum-numeneroll':
                if (!obj) {
                    sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-numeneroll}} {{notaCharacter="+paramArray[0]+"}}");
                    return false;
                };
                if (paramArray.length != 2) {
                	//this function requires 2 parameters : character_id|attribute_name
                    sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-numeneroll}} {{wtfAttribute="+msg.content+"}}");
                    return false;
            	};
	            statRollFromSheet(obj,paramArray[1],msg.who);
                break;
            case '!nathanum-macroroll':
        		// macroroll can be called with a token_id or character_id
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
	                sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-macroroll}} {{noTokNoChar= "+msg.content+"}}");
	                return false;
		        } else {
                    if(obj.get("type")=="graphic") {
                        // it's a token but does it represents a character ?
	            	    obj = getObj("character", obj.get("represents"));
                        if (!obj) {
                        	//not a token either
        	                sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-macroroll}} {{noTokNoChar= "+msg.content+"}}");
        	                return false;
        		        };
                    };
	            };
                if (paramArray.length != 9) {
                	//this function requires more parameters
                    sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-macroroll}} {{genericMsg=Requires 9 paramaters : token|stat name|difficulty|assets|Cost|Effort on Roll|Effort on Damage|Roll Bonus|Skill level (-1 to 2)}}");
                    return false;
            	};
	            statRoll(obj,paramArray[1],msg.who,paramArray[2],paramArray[3],paramArray[4],paramArray[5],paramArray[6],paramArray[7],paramArray[8])
                break;
            case '!nathanum-recoveryroll':
	            if (!obj) {
	            	sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-recoveryroll}} {{noCharacter="+msg.content+"}}");
	                return false;
	            };
	            recoveryRoll(obj);
	            break;
	        case '!nathanum-initroll':
	            if (!obj) {
	               	sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-initroll}} {{noCharacter="+msg.content+"}}");
	                return false;
	            };
	    		initRoll(obj);
	    		break;
        	case '!nathanum-checkchar':
	            if (!obj) {
	               	sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-checkpcstate}} {{noCharacter="+msg.content+"}}");
	                return false;
	            };
	    		checkCharStates(obj);
        		break;
        	case '!nathanum-restchar':
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
	                sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-restchar}} {{noTokNoChar= "+msg.content+"}}");
	                return false;
		        } else {
                    if(obj.get("type")=="graphic") {
                        // it's a token but does it represents a character ?
	            	    obj = getObj("character", obj.get("represents"));
                        if (!obj) {
                        	//not a token either
        	                sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-restchar}} {{noTokNoChar= "+msg.content+"}}");
        	                return false;
        		        };
                    };
	            };
                restChar(obj);
        		break;
    		case '!nathanum-npcdmg':
    			//this function requires 3 parameters : token_id|damage|apply armor y/n
            	if(paramArray.length != 3) {
    				sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-npcdmg}} {{genericMsg=Wrong parameters (expected: token_id|damage|apply armor y/n): '"+Parameters+"''}}");
    				return false;
    			};
    			//
                obj=getObj("graphic", paramArray[0]);
                if(!obj){
                    sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-npcdmg}} {{noToken="+paramArray[0]+"}}");
                    return false;
                };
	            if(!obj.get("represents")) {
	               	sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-npcdmg}} {{notCharToken="+paramArray[0]+"}}");
	                return false;
	            };
	            npcDamage(obj,getObj("character",obj.get("represents")),paramArray[1],paramArray[2]);
    			break;
            case '!nathanum-modstat':
                //this function requires 3 parameters : character_id|stat|cost
                if(paramArray.length != 3) {
    				sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-modstat}} {{genericMsg=Wrong parameters (expected: character_id|stat|cost): '"+Parameters+"''}}");
    				return false;
    			};
    			//
                if (!obj) {
                    sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-modstat}} {{notaCharacter="+paramArray[0]+"}}");
                    return false;
                };
                modStat(obj,paramArray[1],paramArray[2],1);
                break;
            case '!nathanum-resetaction':
                //this function requires no other parameter
                if (!obj) {
                    sendChat("GM", "&{template:nathaNumMsg} {{chatmessage=nathanum-resetaction}} {{notaCharacter="+paramArray[0]+"}}");
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
    NathaNumenera.CheckInstall();
    NathaNumenera.RegisterEventHandlers();
});
