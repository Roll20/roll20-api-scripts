var BattleMaster = BattleMaster || (function() {
    'use strict';
    
    var bInCombat, bHasTakenAction, bHasTakenBonusAction, bIsWaitingOnRoll, bIsWaitingOnResponse, responseCallbackFunction, selectedTokenCallbackFunction,
    iMoveSpeedTotal, iMoveSpeedRemaining, iXStart, iYStart, iXCurrent, iYCurrent,
    currentPlayerDisplayName, currentTurnPlayer, currentTurnCharacter, currentTurnToken,
    currentlyCastingSpellRoll,
    target,
    reticleTokenId,
    direction,
    range,
    listTokensInEncounter = [],
    listTokensWaitingOnSavingThrowsFrom = [],
    sPreviousAction, sPreviousBonusAction,
    listRollCallbackFunctions = [],
    listPlayerIDsWaitingOnRollFrom = [],
    listSelectableGraphics = [],
    defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em 1em',
                    'color': 'white'
                }
            }
        },
    templates = {};
    function rollData(rollMsg){
        var inlineData = rollMsg.inlinerolls;
        this.bRequiresSavingThrow = (universalizeString(rollMsg.content).indexOf("saveattr") != -1);
        this.playerid = rollMsg.playerid;
        this.d20Rolls = [];
        this.dmgRolls = [];
        this.dmgTypes = [];
        this.critRolls = [];
        this.critTypes = [];
        this.rangeString = "";
        this.saveType = "";
        this.saveEffects = "";
        var r1Index = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{r1=$[[") + 8, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{r1=$[[") + 8,"]]")),10),
        r2Index = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{r2=$[[") + 8, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{r2=$[[") + 8,"]]")),10),
        saveDCIndex = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{savedc=$[[") + 12, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{savedc=$[[") + 12,"]]")),10),
        dmg1Index = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{dmg1=$[[") + 10, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{dmg1=$[[") + 10,"]]")),10),
        //dmg2Index = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{savedc=$[[") + 12, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{savedc=$[[") + 12,"]]")),10),
        crit1Index = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{crit1=$[[") + 11, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{crit1=$[[") + 11,"]]")),10),
        //crit2Index = parseInt(rollMsg.content.substring(rollMsg.content.indexOf("{{savedc=$[[") + 12, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("{{savedc=$[[") + 12,"]]")),10),
        dmgType1 = rollMsg.content.substring(rollMsg.content.indexOf("dmg1type=") + 9, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("dmg1type=") + 9,"}}"));
        //dmgType2 = rollMsg.content.substring(rollMsg.content.indexOf("dmg2type=") + 9, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("dmg2type=") + 9,"}}")),
        this.d20Rolls.push(inlineData[r1Index]);
        this.d20Rolls.push(inlineData[r2Index]);
        this.dc = inlineData[saveDCIndex];
        this.dmgRolls.push(inlineData[dmg1Index]);//this.dmgRolls.push(inlineData[dmg2Index]);
        this.dmgTypes.push(dmgType1.trim());
        this.rangeString = rollMsg.content.substring(rollMsg.content.indexOf("{{range=") + 8, firstIndexAfter(rollMsg.content, rollMsg.content.indexOf("{{range=") + 8, "}}"));
        this.saveType = rollMsg.content.substring(rollMsg.content.indexOf("{{saveattr=") + 11, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("saveattr=") + 11,"}}"));
        this.saveEffects = rollMsg.content.substring(rollMsg.content.indexOf("savedesc=") + 9, firstIndexAfter(rollMsg.content,rollMsg.content.indexOf("savedesc=") + 9,"}}"));
    }
    //**UTILITY SCRIPTS**
    var buildTemplates = function() {
        templates.cssProperty =_.template(
            '<%=name %>: <%=value %>;'
        );

        templates.style = _.template(
            'style="<%='+
                '_.map(css,function(v,k) {'+
                    'return templates.cssProperty({'+
                        'defaults: defaults,'+
                        'templates: templates,'+
                        'name:k,'+
                        'value:v'+
                    '});'+
                '}).join("")'+
            ' %>"'
        );
        
        templates.button = _.template(
            '<a <%= templates.style({'+
                'defaults: defaults,'+
                'templates: templates,'+
                'css: _.defaults(css,defaults.css.button)'+
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
        );
    },

    firstIndexAfter = function(string, preIndex, search){
        return (preIndex + string.substring(preIndex).indexOf(search));
    },
    
    /*Makes the API buttons used throughout the script*/
    makeButton = function(command, label, backgroundColor, color){
        return templates.button({
            command: command,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {
                color: color,
                'background-color': backgroundColor
            }
        });
    },
    
    promptButtonArray = function(promptName, listPromptableItems,listCommandNames){
        var stringToSend, 
            buttonArray = [];
            /*
        for(var i = 0; i < listPromptableItems.length; i++){
            var tempString = listPromptableItems[i];
            while(tempString.indexOf(' ') != -1){
                tempString = tempString.slice(0,tempString.indexOf(' ')) + tempString.slice(tempString.indexOf(' ') + 1);
            }
            tempString = tempString.toLowerCase();
            listCommandNames[i] = tempString;
            log(tempString);
        }
        */
        
        for(var i = 0; i < listPromptableItems.length; i++){
            buttonArray[i] = makeButton('!combat ' + listCommandNames[i], listPromptableItems[i], '#CDAE88', 'black');
        }
        stringToSend = '/w "' + currentPlayerDisplayName + '" '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
            +promptName
            +'</div>';
        for(var i = 0; i < buttonArray.length; i++){
            stringToSend += buttonArray[i];
        }
        stringToSend += '</div>';
        sendChat('BattleMaster', stringToSend);
    },

    promptTarget = function(){
        reticleTokenId = createObj("graphic", {
            controlledby: (currentTurnPlayer.id),
            _pageid: Campaign().get('playerpageid'),
            left: (currentTurnToken.get('left')),
            top: (currentTurnToken.get('top') - distanceToPixels(5)),
            layer: "objects",
            imgsrc: "https://s3.amazonaws.com/files.d20.io/images/35946928/hC9eLBaOaso0aa9kldO9Jg/thumb.png?1500001934",
            width: distanceToPixels(5),
            height: distanceToPixels(5),
        }).id;
        sendPing(currentTurnToken.get('left'), currentTurnToken.get('top')- distanceToPixels(5), null, true);
        log("Reticle token ID: " + reticleTokenId);
        promptButtonArray("Move the target to where you would like to attack", ["Target selected"], ["selectedTarget"])
    },
    
    findCurrentTurnToken = function(turnorder) {
		if (!turnorder) 
			{turnorder = Campaign().get('turnorder');}
		if (!turnorder) 
			{return undefined;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
		if (turnorder && turnorder.length > 0 && turnorder[0].id !== -1)
			{return getObj('graphic',turnorder[0].id);}
		return;
	},
	
	findWhoIsControlling = function(character){
	  var whoIsControlling;
	  var listPlayerIDs;
	  _.each(character.get('controlledby').split(','), function(player){
	      
	      if(!playerIsGM(player)){
	          log('Player ID ' + player + ' is controlling this character!');
	          whoIsControlling = player;
	      }
	      else if(whoIsControlling === undefined){
	          log('Player ID ' + player + ' is a GM, setting them to controlling anyways!');
	          whoIsControlling = player;
	      }
	      else{
	          log('Player ID ' + player + ' is a GM, not controlling!');
	      }
	  });
	  return whoIsControlling;
	},
    
    findTokenAtTarget = function(){
        var reticleToken = getObj("graphic",reticleTokenId);
        if(reticleToken){
            log("Reticle token isn't null!");
            _.each(JSON.parse(Campaign().get('turnorder')), function(token){
                token = getObj('graphic', token.id);
                log("Testing token " + token.id);
                log("Token coords: (" + token.get('left') + ", " + token.get('top'));
                log("Reticle coords: (" + reticleToken.get('left') + ", " + reticleToken.get('top'));
                if(token.get('left') + (token.get('width')/2) >= reticleToken.get('left') && 
                    token.get('left') - (token.get('width')/2) <= reticleToken.get('left') && 
                    token.get('top') + (token.get('height')/2) >= reticleToken.get('top') &&
                    token.get('top') - (token.get('height')/2) <= reticleToken.get('top'))
                    {
                        listSelectableGraphics.push(getObj('graphic', token.id))
                    }
            });
            log('List of selectable graphics: ' + listSelectableGraphics);
            reticleToken.remove();
            if(listSelectableGraphics.length > 1){
                var listTokenNames = [], listCommandNames = [];
                for(var i = 0; i<listSelectableGraphics.length; i++){
                    listTokenNames.push(listSelectableGraphics[i].get("name"));
                    listCommandNames.push("tokenfromlist " + i);
                }
                log("List of potential targets is more than one long!");
                promptButtonArray("Which token are you targeting?",listTokenNames,listCommandNames);
            }
            else if(listSelectableGraphics.length === 1){
                target = listSelectableGraphics[0];
                log("Target:" + target);
            }
            else{
                log("List of potential targets is null!");
            }
        }
        else{

        }
    };

    var HandleInput = function(msg_orig){
        var msg = _.clone(msg_orig),
			args,
            attr,
            amount,
            chr,
            token,
            text='',
            totamount;
        if (msg.type !== 'api' && !bIsWaitingOnRoll && !bIsWaitingOnResponse){
            return;
        }
        if(bIsWaitingOnRoll && msg.inlinerolls != undefined){
            //Call roll result here
            log("We have recieved a roll result!")
            var playerIDLocation = listPlayerIDsWaitingOnRollFrom.indexOf(msg.playerid);
            var recievedRoll = new rollData(msg);
            if(playerIDLocation != -1){
                listRollCallbackFunctions[playerIDLocation](recievedRoll);
            }
            listPlayerIDsWaitingOnRollFrom.splice(playerIDLocation,1);
            listRollCallbackFunctions.splice(playerIDLocation,1);
            return;
        }
        args = msg.content.split(/\s+/);//splits the message contents into discrete arguments
		switch(args[0]) {
		    case '!combat':
		        switch(args[1]){
		            case 'start': StartCombat(); 
                    break;
		            case 'stop' : StopCombat(); 
                    break;
		            case 'test' : promptButtonArray('gm', ['Option 1','Option 2', 'Option 3']); 
                    break;
                    case 'weaponattack': 
                                promptTarget();
                                selectedTokenCallbackFunction = WeaponAttack;
                    break;
                    case 'directspell': 
                                promptTarget();
                                selectedTokenCallbackFunction = DirectSpellAttack; 
                    break;
		            case 'move': 
                    break;
		            case 'aoespell': AOESpellAttack(); 
                    break;
                    case 'up': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'down': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'left': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'right': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'upright': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'downleft': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'upleft': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'downright': direction = args[1]; bIsWaitingOnResponse = false; responseCallbackFunction();
                    break;
                    case 'selectedTarget': 
                        findTokenAtTarget();
                        selectedTokenCallbackFunction();
                    break;
                    case 'tokenfromlist':
                        target = listSelectableGraphics[args[2]];
                    break;
		            //default: break;
		        }break;
		}
    },
    
    StartCombat = function(){
        bInCombat = true;
        bIsWaitingOnResponse = false;
        log('Combat Started!');
        sendChat("BattleMaster", "/w GM Combat Started!")
        /*
        Things this needs to do: 
        Set a combat bool to true
        Do all of our fun combat setup things
        */
    },
    
    StopCombat = function(){
        bInCombat = false;
        bIsWaitingOnResponse = false;
        log('Combat stopped!');
        sendChat("BattleMaster", "/w GM Combat Stopped!")
    },
    
    TurnChange = function(){
        log('The turn has changed!');
        var turnorder;
        //Find all the information on whose turn it is
        currentTurnToken = findCurrentTurnToken(Campaign().get('turnorder'));
        currentTurnCharacter = getObj('character',currentTurnToken.get('represents'));
        currentTurnPlayer = getObj('player',findWhoIsControlling(currentTurnCharacter));
        currentPlayerDisplayName = currentTurnPlayer.get('displayname');
        if (!turnorder) 
			{turnorder = Campaign().get('turnorder');}
		if (!turnorder) 
			{return undefined;}
		if (typeof(turnorder) === 'string') 
			{turnorder = JSON.parse(turnorder);}
        //Reset all the variables for the new turn
        ResetTokenTurnValues(currentTurnToken);
        ResetCharacterTurnValues(currentTurnCharacter);
        ResetUnspecificTurnValues();
        _.each(turnorder, function(current){
            listTokensInEncounter.push(getObj("graphic",current.id));
        });
        log('It\'s now ' + currentTurnCharacter.get('name') + '\'s turn!' );
        log('This character is controlled by player ' + currentTurnPlayer.get('displayname'))
        sendChat('BattleMaster','/w "'+ currentTurnPlayer.get('displayname') + '" It\'s your turn as ' + currentTurnCharacter.get('name'));
        promptButtonArray("Select an action", generateTurnOptions(),generateTurnOptionCommands());
    },
    
    ResetTokenTurnValues = function(currentTurnToken){
        iMoveSpeedTotal = currentTurnToken.get('bar1_max');
        iMoveSpeedRemaining = iMoveSpeedTotal;
        currentTurnToken.set('bar1_val', iMoveSpeedRemaining);
        iXStart = currentTurnToken.get('left');
        iYStart = currentTurnToken.get('top');
    },
    
    ResetCharacterTurnValues = function(currentTurnCharacter){
        
    },
    
    ResetUnspecificTurnValues = function(){
        listSelectableGraphics = [];
        bHasTakenAction = false;
        bHasTakenBonusAction = false;
        sPreviousAction = "";
        sPreviousBonusAction = "";
        listTokensInEncounter = [];
    },
    
    BuildMovementWalls = function(){
        
    },

    universalizeString = function(string){
        var tempString = string.toLowerCase();
        tempString.trim();
        while(tempString.indexOf(' ') != -1){
            tempString = tempString.slice(0,tempString.indexOf(' ')) + tempString.slice(tempString.indexOf(' ') + 1);
        }
        return tempString
    },
    
    Move = function(){
        BuildMovementWalls();
        
    },
    
    WeaponAttack = function(){
        if(target != undefined){
            log('Weapon attacking at ' + target.get('name'));
            sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" ' + "Now attempting to attack " + target.get('name') + ". Please roll your weapon attack from your character sheet.");
            listRollCallbackFunctions.push(WeaponAttackRollCallback);
            listPlayerIDsWaitingOnRollFrom.push(currentTurnPlayer.id);
            bIsWaitingOnRoll = true;
        }
        else{
            log('Tried to attack with weapon, but no target was selected!');
            sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" No target is selected! Please select a target!');
            promptTarget();
            selectedTokenCallbackFunction = WeaponAttack;
        }
    },
    
    WeaponAttackRollCallback = function(rollData){
        bIsWaitingOnRoll = (listPlayerIDsWaitingOnRollFrom.length != 0); //Check if we're still waiting on another roll
        var ac = getAttrByName(target.get('represents'),'npcd_ac');
        if(ac === "" || ac === undefined){
            log('Couldn\'t find npcd_ac, looking for just ac')
            ac = getAttrByName(target.get('represents'),'ac');
        }
        if(ac <= rollData.d20Rolls[0].results.total){
            log("Hit! Enemy AC is " + ac + " and roll result was " + rollData.d20Rolls[0].results.total);
            sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" Hit! Applying damage to ' + target.get('name'));
            applyDamage(rollData.dmgRolls[0].results.total, rollData.dmgTypes[0], target, getObj('character', target.get('represents')));
            if(rollData.dmgRolls.length > 1 && rollData.dmgRolls[1].results.total != 0){
                applyDamage(rollData.dmgRolls[1].results.total, rollData.dmgTypes[1], target, getObj('character', target.get('represents')));
            }
            spawnFx(target.get('left'), target.get('top'), 'glow-blood',getObj('page', Campaign().get('playerpageid')));
        }
        else{
            log("Miss! Enemy AC is " + ac + " and roll result was " + rollData.d20Rolls[0].results.total);
            sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" Miss!');
        }
    },
    
    DirectSpellAttack = function(){
        if(target != undefined){
            log('Direct spell attacking at ' + target.get('name'));
            sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" ' + "Now attempting to attack " + target.get('name') + ". Please roll your spell attack from your character sheet.");
            listRollCallbackFunctions.push(DirectSpellRollCallback);
            log("Current turn player: " + currentTurnPlayer);
            listPlayerIDsWaitingOnRollFrom.push(currentTurnPlayer.id);
            bIsWaitingOnRoll = true;
        }
        else{
            log('Tried to attack with direct spell, but no target was selected!');
            sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" No target is selected! Please select a target!');
            promptTarget();
            selectedTokenCallbackFunction = DirectSpellAttack;
        }
    },
    
    DirectSpellRollCallback = function(rollData){
        bIsWaitingOnRoll = (listPlayerIDsWaitingOnRollFrom.length != 0); //Check if we're still waiting on another roll
        if(rollData.bRequiresSavingThrow){
            currentlyCastingSpellRoll = rollData;
            log("Saving throw spell!");
            var playerID = findWhoIsControlling(getObj('character',target.get('represents')));
            sendChat("BattleMaster", '/w "' + getObj('player',playerID).get("displayname") + '" Please roll a ' + rollData.saveType + ' saving throw for ' + target.get("name"));
            listPlayerIDsWaitingOnRollFrom.push(playerID);
            listRollCallbackFunctions.push(SavingThrowAgainstDamageRollCallback);
            listTokensWaitingOnSavingThrowsFrom.push(target);
        }
        else{
            log("Spell attack!");
            var ac = getAttrByName(target.get('represents'),'npcd_ac');
            if(ac === "" || ac === undefined){
                log('Couldn\'t find npcd_ac, looking for just ac')
                ac = getAttrByName(target.get('represents'),'ac');
            }
            if(ac <= rollData.d20Rolls[0].results.total){
                log("Hit! Enemy AC is " + ac + " and roll result was " + rollData.d20Rolls[0].results.total);
                sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" Hit! Applying damage to ' + target.get('name'));
                applyDamage(rollData.dmgRolls[0].results.total, rollData.dmgTypes[0], target, getObj('character', target.get('represents')));
                if(rollData.dmgRolls.length > 1 && rollData.dmgRolls[1].results.total != 0){
                    applyDamage(rollData.dmgRolls[1].results.total, rollData.dmgTypes[1], target, getObj('character', target.get('represents')));
                }
            }
            else{
                log("Miss! Enemy AC is " + ac + " and roll result was " + rollData.d20Rolls[0].results.total);
                sendChat("BattleMaster", '/w "' + currentPlayerDisplayName + '" Miss!');
            }
        }
    },
    
    AOESpellAttack = function(){
        sendChat('BattleMaster', '/w "' + currentPlayerDisplayName + '" Roll your AOE spell from your character sheet!');
        listPlayerIDsWaitingOnRollFrom.push(currentTurnPlayer.id);
        listRollCallbackFunctions.push(AOESpellRollCallback);
        bIsWaitingOnRoll = true;
    },
    
    AOESpellRollCallback = function(rollData){
        currentlyCastingSpellRoll = rollData;
        var rangeString = rollData.rangeString,
        x = currentTurnToken.get('left'), y = currentTurnToken.get('top'),
        args = rangeString.toLowerCase().split(/\s+/);
        if(args[0]!= "self"){
            log("Not self targeted!");
        }
        else{
            switch(args[1]){
                case "cone": 
                    promptButtonArray("Select a direction", ["North","South","East","West","Northeast","Northwest","Southeast","Southwest"], 
                    ["up","down","right","left","upright","upleft","downright","downleft"]);
                    bIsWaitingOnResponse = true;
                    responseCallbackFunction = coneDirectionPromptCallback;
                    range = args[2];
                    log("Spell is a cone!");
                break;
                case "line": 
                    promptButtonArray("Select a direction", ["North","South","East","West","Northeast","Northwest","Southeast","Southwest"], 
                    ["up","down","right","left","upright","upleft","downright","downleft"]);
                    bIsWaitingOnResponse = true;
                    responseCallbackFunction = lineDirectionPromptCallback;
                    range = args[2];
                 break;
                case "sphere": 
                    var effectType = "burst-"+dmgTypeToFXName(rollData.dmgTypes[0]);
                    log("Spawning fx: " + effectType);
                    spawnFx(x,y,effectType,getObj('page', Campaign().get('playerpageid')));
                    _.each(findAllTokensInSphere(x,y,args[2]), spellEffects)
                break;
                case "cube": break;
                case "cylinder": break;
            }
        }
    },

    distanceBetween = function(originX, originY, finalX, finalY){
        var deltaX = originX - finalX,
        deltaY = originY - finalY
        return Math.sqrt(Math.pow(deltaX,2) + Math.pow(deltaY,2));
    },

    coneDirectionPromptCallback = function(){
        log("Casting " + direction);
        var xMod = 0, yMod = 0,
        x = currentTurnToken.get("left"), y = currentTurnToken.get("top");
        if(direction.toLowerCase().indexOf('up') != -1){
            yMod = -35;
        }
        else if(direction.toLowerCase().indexOf('down') != -1){
            yMod = 35;
        }
        if(direction.toLowerCase().indexOf('left') != -1){
            xMod = -35;
        }
        else if (direction.toLowerCase().indexOf('right') != -1){
            xMod = 35;
        }
        //spawnFxBetweenPoints({x:(x+xMod),y:(y+yMod)},{})        
        var effectType = "breath-"+dmgTypeToFXName(currentlyCastingSpellRoll.dmgTypes[0]);
        log("Spawning fx: " + effectType);
        spawnFxBetweenPoints({x:(x+xMod), y:(y+yMod)},{x:(x+xMod+xMod), y:(y+yMod+yMod)},effectType,getObj('page', Campaign().get('playerpageid')));
        _.each(findAllTokensInCone(x + xMod, y + yMod, direction, range), spellEffects);
    },

    lineDirectionPromptCallback = function(){
        var xMod = 0, yMod = 0,
        x = currentTurnToken.get("left"), y = currentTurnToken.get("top");
        if(direction.toLowerCase().indexOf('up') != -1){
            yMod = -35;
        }
        else if(direction.toLowerCase().indexOf('down') != -1){
            yMod = 35;
        }
        if(direction.toLowerCase().indexOf('left') != -1){
            xMod = -35;
        }
        else if (direction.toLowerCase().indexOf('right') != -1){
            xMod = 35;
        }       
        var effectType = "beam-"+dmgTypeToFXName(currentlyCastingSpellRoll.dmgTypes[0]);
        log("Spawning fx: " + effectType);
        spawnFxBetweenPoints({x:(x+xMod), y:(y+yMod)},{x:(x+xMod+xMod), y:(y+yMod+yMod)},effectType,getObj('page', Campaign().get('playerpageid')));
        _.each(findAllTokensInLine(x+xMod,y+yMod,direction,range), spellEffects);
    },

    spellEffects = function(token){
        var playerID = findWhoIsControlling(getObj('character',token.get('represents')));
        sendChat("BattleMaster", '/w "' + getObj('player',playerID).get("displayname") + '" Please roll a ' + currentlyCastingSpellRoll.saveType + ' saving throw for ' + token.get("name"));
        listPlayerIDsWaitingOnRollFrom.push(playerID);
        listRollCallbackFunctions.push(SavingThrowAgainstDamageRollCallback);
        listTokensWaitingOnSavingThrowsFrom.push(token);
    },

    distanceToPixels = function(dist) {
	    var PIX_PER_UNIT = 70;
	    var page = getObj('page', Campaign().get('playerpageid'));
	    return PIX_PER_UNIT * (dist/page.get('scale_number'));
    },  
    
    findAllTokensInCone = function(originX, originY, direction, range){
        var listTokensToReturn = [],
        line1YofX, line2YofX,
        line1XofY, line2XofY,
        bLine1XNeg, bLine2XNeg,
        bLine1YNeg, bLine2YNeg;
        var tokenIsConstrainedByLines = function(token, line1XofY, line1YofX, line2XofY, line2YofX, bLine1XNeg, bLine1YNeg, bLine2XNeg, bLine2YNeg, range){
            var bValueToReturn, tokenX = token.get('left'), tokenY = token.get('top');
            bValueToReturn = (bLine1XNeg && tokenX <= line1XofY(tokenY) || (!bLine1XNeg) && tokenX >= line1XofY(tokenY));
            bValueToReturn = bValueToReturn && (bLine1YNeg && tokenY <= line1YofX(tokenX) || (!bLine1YNeg) && tokenY >= line1YofX(tokenX));
            bValueToReturn = bValueToReturn && (bLine2XNeg && tokenX <= line2XofY(tokenY) || (!bLine2XNeg) && tokenX >= line2XofY(tokenY));
            bValueToReturn = bValueToReturn && (bLine2YNeg && tokenY <= line2YofX(tokenX) || (!bLine2YNeg) && tokenY >= line2YofX(tokenX));
            bValueToReturn = bValueToReturn && (distanceBetween(originX, originY, tokenX, tokenY) <= distanceToPixels(range));
            return bValueToReturn;
        }
        switch (direction){
            case "up": 
                bLine1XNeg = false; bLine1YNeg = true;
                bLine2XNeg = true; bLine2YNeg = true;
                line1YofX = function(x){
                    return ((x - originX)*2) + originY;
                }
                line2YofX = function(x){
                    return -((x - originX)*2) + originY;
                }
                line1XofY = function(y){
                    return ((y - originY)/2) + originX;
                }
                line2XofY= function(y){
                    return -((y - originY)/2) + originX;
                }
            break;

            case "down": 
                bLine1XNeg = false; bLine1YNeg = false;
                bLine2XNeg = true; bLine2YNeg = false;
                line1YofX = function(x){
                    return -((x - originX)*2) + originY;
                }
                line2YofX = function(x){
                    return ((x - originX)*2) + originY;
                }
                line1XofY = function(y){
                    return -((y - originY)/2) + originX;
                }
                line2XofY= function(y){
                    return ((y - originY)/2) + originX;
                }
            break;

            case "left": 
                bLine1XNeg = true; bLine1YNeg = true;
                bLine2XNeg = true; bLine2YNeg = false;
                line1YofX = function(x){
                    return -((x - originX)/2) + originY;
                }
                line2YofX = function(x){
                    return ((x - originX)/2) + originY;
                }
                line1XofY = function(y){
                    return -((y - originY)*2) + originX;
                }
                line2XofY= function(y){
                    return ((y - originY)*2) + originX;
                }
            break;

            case "right": 
                bLine1XNeg = false; bLine1YNeg = false;
                bLine2XNeg = false; bLine2YNeg = true;
                line1YofX = function(x){
                    return -((x - originX)/2) + originY;
                }
                line2YofX = function(x){
                    return ((x - originX)/2) + originY;
                }
                line1XofY = function(y){
                    return -((y - originY)*2) + originX;
                }
                line2XofY= function(y){
                    return ((y - originY)*2) + originX;
                }
            break;

            case "upleft": 
                bLine1XNeg = false; bLine1YNeg = true;
                bLine2XNeg = true; bLine2YNeg = false;
                line1YofX = function(x){
                    return ((x - originX)/3) + originY;
                }
                line2YofX = function(x){
                    return ((x - originX)*3) + originY;
                }
                line1XofY = function(y){
                    return ((y - originY)*3) + originX;
                }
                line2XofY= function(y){
                    return ((y - originY)/3) + originX;
                }
            break;

            case "upright": 
                bLine1XNeg = false; bLine1YNeg = false;
                bLine2XNeg = true; bLine2YNeg = true;
                line1YofX = function(x){
                    return -((x - originX)*3) + originY;
                }
                line2YofX = function(x){
                    return -((x - originX)/3) + originY;
                }
                line1XofY = function(y){
                    return -((y - originY)/3) + originX;
                }
                line2XofY= function(y){
                    return -((y - originY)*3) + originX;
                }
            break;

            case "downleft": 
                bLine1XNeg = true; bLine1YNeg = true;
                bLine2XNeg = true; bLine2YNeg = false;
                line1YofX = function(x){
                    return -((x - originX)*3) + originY;
                }
                line2YofX = function(x){
                    return -((x - originX)/3) + originY;
                }
                line1XofY = function(y){
                    return -((y - originY)/3) + originX;
                }
                line2XofY= function(y){
                    return -((y - originY)*3) + originX;
                }
            break;

            case "downright": 
                bLine1XNeg = true; bLine1YNeg = false;
                bLine2XNeg = false; bLine2YNeg = true;
                line1YofX = function(x){
                    return ((x - originX)/3) + originY;
                }
                line2YofX = function(x){
                    return ((x - originX)*3) + originY;
                }
                line1XofY = function(y){
                    return ((y - originY)*3) + originX;
                }
                line2XofY= function(y){
                    return ((y - originY)/3) + originX;
                }
            break;
        }

        _.each(listTokensInEncounter, function(token){
            log("Looking for token" + token.get("name"));
            if(tokenIsConstrainedByLines(token, line1XofY, line1YofX, line2XofY, line2YofX, bLine1XNeg, bLine1YNeg, bLine2XNeg, bLine2YNeg, range)){
                listTokensToReturn.push(token);
                log(token.get("name") + " is within the cone!");
            }
            else{
                log(token.get('name') + " is outside the cone.");
            }
        });
        return listTokensToReturn;
    },

    findAllTokensInSphere = function(x,y,range){
        var listTokensToReturn = [];
        _.each(listTokensInEncounter, function(token){
            log("Looking for token" + token.get("name"));
            if(distanceBetween(x,y,token.get('left'), token.get('top')) <= distanceToPixels(range)){
                listTokensToReturn.push(token);
                log(token.get("name") + " is inside the sphere");
            }
            else{
                log(token.get('name') + " is outside the sphere");
            }
        });
        return listTokensToReturn;

    },

    findAllTokensInLine = function(x,y,direction,range){
        var listTokensToReturn = [];
        _.each(listTokensInEncounter, function(token){
            var tokenX = token.get('left'), tokenY = token.get('top');
            switch (direction){
                case "up":
                    if(tokenX + 20 >= x && tokenX - 20 <= x && tokenY < y && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'right':
                    if(tokenY + 20 >= y && tokenY - 20 <= y && tokenX >= x && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'down':
                    if(tokenX + 20 >= x && tokenX - 20 <= x && tokenY > y && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'left':
                    if(tokenY + 20 >= y && tokenY - 20 <= y && tokenX <= x && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'upright':
                    if(tokenX-x + 20 >= -(tokenY-y) && tokenX-x - 20 <= -(tokenY-y) && tokenX >= x && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'downright':
                    if(tokenX-x + 20 >= tokenY-y && tokenX-x - 20 <= tokenY-y && tokenX >= x && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'downleft':
                    if(tokenX-x + 20 >= tokenY-y && tokenX-x - 20 <= tokenY-y && tokenX <= x && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
                case 'upleft':
                    if(tokenX-x + 20 >= -(tokenY-y) && tokenX-x - 20 <= -(tokenY-y) && tokenX <= x && distanceBetween(x,y,tokenX,tokenY) <= distanceToPixels(range)){
                        listTokensToReturn.push(token);
                    }
                break;
            }
        });
        return listTokensToReturn;
    },

    findAllTokensInCube = function(x,y,range){

    },

    findAllTokensInCylinder = function(x,y,range,height){
        var listTokensToReturn = [];
        _.each(listTokensInEncounter, function(token){
            log("Looking for token" + token.get("name"));
            if(distanceBetween(x,y,token.get('left'), token.get('top')) <= distanceToPixels(range)){
                listTokensToReturn.push(token);
                log(token.get("name") + " is inside the sphere");
            }
            else{
                log(token.get('name') + " is outside the sphere");
            }
        });
        return listTokensToReturn;
    },
    
    SavingThrowAgainstDamageRollCallback = function(rollData){
        log("Waiting on rolls for the following tokens: ");
        _.each(listTokensWaitingOnSavingThrowsFrom, function(token){
            log(token.get('name'));
        });
        for(var i = 0; i < listTokensWaitingOnSavingThrowsFrom.length; i++){
            if(findWhoIsControlling(getObj('character', listTokensWaitingOnSavingThrowsFrom[i].get('represents'))) === rollData.playerid){
                var token = listTokensWaitingOnSavingThrowsFrom[i];
                listTokensWaitingOnSavingThrowsFrom.splice(i,1);
                log("Found correct token, breaking out of the loop!");
                break;
            }
        }
        log("Waiting on rolls for the following tokens: ");
        _.each(listTokensWaitingOnSavingThrowsFrom, function(token){
            log(token.get('name'));
        });
        sendChat("BattleMaster",'/w "' + currentPlayerDisplayName +'" Recieved roll for ' + token.get("name"));
        var rollAttribute = currentlyCastingSpellRoll.saveType,
        rollEffectsDesc = currentlyCastingSpellRoll.saveEffects,
        rollDC = currentlyCastingSpellRoll.dc.results.total,
        rollDmg = currentlyCastingSpellRoll.dmgRolls[0].results.total,
        rollDmgType = currentlyCastingSpellRoll.dmgTypes[0];
        log("Potential damage: " + rollDmg);
        log("Damage type: "+ rollDmgType);
        var savingThrowRoll = rollData.d20Rolls[0].results.total;
        log("Saving throw roll: " + savingThrowRoll);
        log("rollDC: " + rollDC);
        if(savingThrowRoll >= rollDC){
            log("Succeeded on saving throw roll! Effects: " + universalizeString(rollEffectsDesc));
            //SAVING THROW EFFECTS GO HERE
            switch(universalizeString(rollEffectsDesc)){
                case "halfdamage":
                    applyDamage(rollDmg/2, rollDmgType, token, getObj('character', token.get("represents")));
                break;

                default: break;
            }
        }
        else{
            applyDamage(rollDmg, rollDmgType, token, getObj('character', token.get("represents")));
        }
    },
    
    applyDamage = function(dmgAmt, dmgType, targetToken, targetCharacter){
        log("Applying " + dmgAmt +" " +  dmgType + " damage to " + targetToken.get('name'));
        var immunitiesRaw = targetCharacter.get("npc_immunities"),
        resistancesRaw = targetCharacter.get("npc_resistances"),
        vulnerabilitiesRaw = targetCharacter.get("npc_vulnerabilities");
        if(immunitiesRaw != undefined && universalizeString(immunitiesRaw).indexOf(universalizeString(dmgType)) != -1){
            //UpdateDeathMarkers(targetToken);
            return;
        }
        else if(vulnerabilitiesRaw != undefined && universalizeString(vulnerabilitiesRaw).indexOf(universalizeString(dmgType)) != -1){
            targetToken.set('bar3_value', targetToken.get('bar3_value') - Math.round(2*dmgAmt));
            //UpdateDeathMarkers(targetToken);
            return;
        }
        else if(resistancesRaw != undefined && universalizeString(resistancesRaw).indexOf(universalizeString(dmgType)) != -1){
            targetToken.set('bar3_value', targetToken.get('bar3_value') - Math.round(dmgAmt/2));
            //UpdateDeathMarkers(targetToken);
            return;
        }
        else{
            targetToken.set('bar3_value', targetToken.get('bar3_value') - Math.round(dmgAmt));
            //UpdateDeathMarkers(targetToken);
            return;
        }
    },

    dmgTypeToFXName = function(dmgType){
        switch(universalizeString(dmgType)){
            case "fire": return "fire";
            case "necrotic": return "death";
            case "radiant": return "holy";
            case "force": return "magic";
            case "cold": return "frost";
            case "acid": return "slime";
            case "psychic": return "magic";
            case "lightning": return "smoke";
            case "poison": return "slime";
            case "thunder": return "smoke";
        }
    },
    
    generateTurnOptions = function(){
        
        //Add class specific options as well!
        var optionsToReturn = [
            'Weapon Attack',
            'Direct Spell',
            'AOE Spell',
            'Move'
        ];
        return optionsToReturn;
    },

    generateTurnOptionCommands = function(){
        var optionsToReturn = [
            'weaponattack',
            'directspell',
            'aoespell',
            'move'
        ];
        return optionsToReturn;
    },
    
    RegisterEventHandlers = function(){
        buildTemplates();
        on('chat:message', HandleInput);
        on('change:campaign:turnorder', function(){
            if(bInCombat){
                TurnChange();
            }
        });
    };
    return {
        RegisterEventHandlers: RegisterEventHandlers,
    };
}());
on('ready',function(){
    'use strict';
    
    BattleMaster.RegisterEventHandlers();
})