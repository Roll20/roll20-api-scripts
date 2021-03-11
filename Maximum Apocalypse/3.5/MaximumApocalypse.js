var MaxApoc = (function() {
	'use strict';
	
	var END_OF_PHASE = '<end of phase>';
	
	var DEBUG_OFF = 6;
	var DEBUG_ERROR = 5;
	var DEBUG_WARN = 4;
	var DEBUG_INFO = 3;
	var DEBUG_FINE = 2;
	var DEBUG_FINEST = 1;
	
	var DEBUG_LEVEL = DEBUG_INFO;
	
	var CONFIG = {
	    combatPhasesEnabled: {name: 'Combat Phases', desc:'Automatically manage combat phases via turn order tracker.', value: true},
    	combatTriggersEAG: {name: 'Combat triggered EAG', desc:'A combat round will make the Enemy Attraction Gauge appear.', value: true},
    	eagHiddenDefault: {name: 'EAG hidden default', desc:'Is the EAG hidden by default.', value: false}
	};
	
	var maLog = function(msg, lvl)
	{
	    if(DEBUG_LEVEL < DEBUG_OFF)
	    {
	        if(!lvl || lvl >= DEBUG_LEVEL)
	        {
	            log(msg);
	        }
	    }
	};
	
	/*
	config: {
	    playerId: '<the id of the player who chatted the message>',
	    target: '<the name of the character to send message to>',
	    title: '<the chat message title>',
	    body: '<the chat message content>'
	}
	*/
	var showConfig = function(playerName)
	{
    	var msg = {
    	    title: 'Maximum Apocalypse API Config',
    	    body: []
    	};
    	
    	_.each(state.MaxApoc.config, function(configObj, configCode) {
    	    msg.body.push('<u>'+configObj.name+'</u>');
    	    msg.body.push('<b>Enabled?:</b> <span style="font-weight: normal;">'+configObj.value + '</span>');
    	    msg.body.push('<b>Description:</b> <span style="font-weight: normal;">'+configObj.desc + '</span>');
    	    msg.body.push('<a href="!ma config ' + configCode + ' ' + (configObj.value?'false':'true') + '">' + (configObj.value?'Disable':'Enable') + '</a>');
    	});
	    
	    whisperMessage(msg, playerName);
	};
	
	var updateConfig = function(cmdOptions, playerName)
	{
	    if(cmdOptions && cmdOptions.length >= 2)
	    {
	        var configCode = cmdOptions[0];
	        var configValue = cmdOptions[1] === 'true';
	        var configObj = state.MaxApoc.config[configCode];
	        
	        if(configObj)
	        {
	            configObj.value = configValue;
            
	        maLog(`Setting ${configCode} value to ${configValue}`, DEBUG_INFO);
	    
	            showConfig(playerName);
	        }
	        else
	        {
	            whisperMessage({title: 'Error', body: configCode + ' config object not found.'}, playerName);
	        }
	    }
	    else
	    {
	        var errMsg = 'Insufficient arguments.'
	        whisperMessage({title: 'Error', body: errMsg}, playerName);
	        maLog(errMsg + JSON.stringify(cmdOptions));
	    }
	};
	
	var configIsEnabled = function(configCode)
	{
	    return state.MaxApoc.config[configCode].value;
	};
	
	var init = function(continueCombat, selectedTokens) 
    {
        // show turn order
        Campaign().set('initiativepage', Campaign().get('playerpageid'));
        
        // reset phase
        state.MaxApoc.initPhase = 1;
        
        // create empty turn order
        let turnorder = [];
        
        // get All Character Tokens On Player Page
        let characterTokens = getSelectedOrAllCharacterTokens(selectedTokens);
        
        // if not first round of combat, adjust by init stolen by previous round
        if(continueCombat)
        {
            // index characters
            let characterTokensIndex = {};
            let previousTurnOrder = getTurnOrder();
            _.each(characterTokens, function(obj) { 
                let characterId = obj.get('represents');
                if(characterId)
                {
                    characterTokensIndex[obj.id] = getAttrByName(characterId, 'init');
                }
            });
            maLog('Initiative character index:' + JSON.stringify(characterTokensIndex), DEBUG_FINE);
            
            // add character init to reduce next turn's value by any stolen init value
            _.each(previousTurnOrder, function(turn) { 
                let charInit = characterTokensIndex[turn.id];
                if(charInit)
                {
                    let stolenInit = Math.min(turn.pr, 0);
                    maLog('Adjusting "' + turn.custom + '" init (' + charInit + ') for next round by ' + stolenInit, DEBUG_INFO);
                    turn.pr = charInit + stolenInit;
                    turnorder.push(turn);
                }
                else
                {
                    maLog('Cannot find token/initiative for ' + turn.custom + ' (' + turn.id + ')', DEBUG_ERROR);
                }
            });
        }
        else
        {
            // add turn order entries per character token on player page
            _.each(characterTokens, function(obj) {    
                
                let characterId = obj.get('represents');
                if(characterId)
                {
                    let initiative = getAttrByName(characterId, 'init');
                    let name = obj.get('name');
                    
                    // populate turn order
                    turnorder.push({
                        id: obj.id,
                        pr: initiative,
                        custom: name
                    });
                }
            });
        }
                
        // add marker so end of phase can be detected
        addEndOfPhaseTurn(turnorder);
        
        // sort in descending order
        turnorder = sortTurnOrder(turnorder);
        
        // update turn order
        setTurnOrder(turnorder);
        
        // update players
        sendMessage({speakAs: 'Combat Tracker', title: 'Initiative', body: ['New Combat Round', 'Combat Phase: '+state.MaxApoc.initPhase+' (of 4)']});
	};

	var handleTrackerEvent = function(turnOrder) 
	{   
	    if(configIsEnabled('combatPhasesEnabled') && turnOrder && turnOrder.length > 0 && containsToken(turnOrder, END_OF_PHASE))
    	{
    	    if(turnOrder[0].custom === END_OF_PHASE || countGreaterThanZero(turnOrder) == 0)
    	    {
    	        nextActionPhase();
    	    }
        }
	};
	
	var nextActionPhase = function() 
	{  
        // apply -5 to all tokens
        var newTurnOrder = updateTurnOrderArray(-5, 0);
        setTurnOrder(newTurnOrder);
        
        // check if any token has actions left
        var numWithActions = countGreaterThanZero(newTurnOrder);
            
        // if there are phases left in round & characters to take them
        if(state.MaxApoc.initPhase < 4 && numWithActions > 0)
        {
            
            // increment phase
            state.MaxApoc.initPhase++;
            
            // notify players
            sendMessage({speakAs: 'Combat Tracker', title: 'Initiative', body: 'Combat Phase: '+state.MaxApoc.initPhase+' (of 4)'});
        }
        else
        { 
            maLog('Triggering EAG? - ' + configIsEnabled('combatTriggersEAG'), DEBUG_FINE);
            
            if(configIsEnabled('combatTriggersEAG'))
            {
                // increment Enemy Attraction
                updateEnemyAttraction(5, true);
            }
            
            // move to next combat round
            init(true);
        }
	};
	
	var addEndOfPhaseTurn = function(tracker)
	{
        tracker.push({
            id: '-1',
            pr: '0',
            custom: END_OF_PHASE
        });
	};
	
	var sortTurnOrder = function(turnOrder)
	{
        return turnOrder.sort((a, b) => parseInt(b.pr) - parseInt(a.pr));
	};
	
	var containsToken = function(turnOrder, tokenName)
	{
        var containsToken = false;
        _.each(turnOrder, function(turn) 
        {
            if(turn.custom == tokenName)
            {
                containsToken=true;
            }
        });  
        
        return containsToken;
	};
	
	var countGreaterThanZero = function(turnOrder)
	{
        var numGreaterThanZero = 0;
        _.each(turnOrder, function(turn) 
        {
            if(turn.pr > 0)
            {
                numGreaterThanZero++;
            }
        });  
        
        return numGreaterThanZero;
	};
	
	var getTurnOrder = function()
	{
	  
        var turnOrder;
        if(Campaign().get("turnorder") == "") turnOrder = [];
        else turnOrder = JSON.parse(Campaign().get("turnorder"));
        
        return turnOrder;
	};
	
	var setTurnOrder = function(turnOrderArray)
	{
        // update turn order
        Campaign().set('turnorder', JSON.stringify(turnOrderArray));
	}
	
	var updateTurnOrderArray = function(increment, min, characterName)
	{
	    var turnOrder = getTurnOrder();
        var newTurnOrder = [];
        
	    maLog('Updating turn order:' + JSON.stringify(turnOrder), DEBUG_FINE);
        
        _.each(turnOrder, function(turn) 
        {
            // don't re-add the end of phase marker
            // only update the character if named
            if(turn.custom != END_OF_PHASE && (!characterName || turn.custom === characterName))
            {
                // only update if higher than min
                if(turn.pr > min)
                {
                    turn.pr = Math.max(turn.pr+increment, min);
                }
                
                newTurnOrder.push(turn);
            }
        });  
            
        // add marker so end of phase can be detected
        addEndOfPhaseTurn(newTurnOrder);   
        
        // sort in descending order
        newTurnOrder = sortTurnOrder(newTurnOrder);
        
	    maLog('Updated turn order:' + JSON.stringify(newTurnOrder), DEBUG_FINE);
        
        return newTurnOrder;
	};
	
	var getAllTokensOnPlayerPage = function() 
	{
        // add turn order entries per character token on player page
        let currentPageGraphics = findObjs({                              
          _pageid: Campaign().get("playerpageid"),                              
          _type: "graphic", 
          _subtype: "token"
        });
        
        return currentPageGraphics;
	};
	
	var enemyTokenName = "Enemy Attraction";
	
	var getEnemyToken = function() 
	{
	    var enemyToken;
	    
        let currentEnemyTokens = findObjs({                                
          _type: "graphic", 
          _subtype: "token",
          name: enemyTokenName
        });
        
        // create token if it doesn't exist or is on a different page
        if(currentEnemyTokens.length === 0 || currentEnemyTokens[0].get('_pageid') != Campaign().get('playerpageid'))
        {
            enemyToken = createObj("graphic", {
                                    _pageid: Campaign().get('playerpageid'),
                                    _subtype: 'token',
                                    name: enemyTokenName,
                                    left: 80,
                                    top: 80,
                                    width: 70,
                                    height: 70,
                                    layer: currentEnemyTokens[0] ? currentEnemyTokens[0].get('layer') : configIsEnabled('eagHiddenDefault') ? 'gmlayer' : 'objects',
                                    bar1_value: currentEnemyTokens[0] ? currentEnemyTokens[0].get('bar1_value') : 0,
                                    bar1_max: 100,
                                    showname: true,
                                    showplayers_name: true,
                                    showplayers_bar1: true,
                                    imgsrc: 'https://s3.amazonaws.com/files.d20.io/images/185025167/GDDIzxQbIzyCviZAfWsQYw/thumb.png?1607873443'
            });
        }
        else
        {
            enemyToken = currentEnemyTokens[0];
            
            // remove this to avoid duplicae removal
            currentEnemyTokens.shift();
        }
        
            
        // remove duplicate tokens
        for(var i=0; i < currentEnemyTokens.length; i++)
        {
             currentEnemyTokens[i].remove();
        }
        
        return enemyToken;
	};

	var showEnemyAttractionToken = function() 
	{
	    var enemyToken = getEnemyToken();
	    enemyToken.set('layer', 'objects');
	};

	var hideEnemyAttractionToken = function() 
	{
	    getEnemyToken().set('layer', 'gmlayer');
	};

	var deleteEnemyAttractionToken = function() 
	{
	    getEnemyToken().remove();
	};

	var updateEnemyAttraction = function(attractionValue, isIncrement) 
	{
	    var et = getEnemyToken();
	    var currentAttraction = parseInt(et.get('bar1_value')) || 0;
	    var newAttraction = isIncrement ? currentAttraction+attractionValue : attractionValue;
	    et.set('bar1_value', newAttraction);
	};
	
	var getObjects = function(selected)
	{
	    var objects = [];
	    
        _.each(selected, function(obj) 
        {  
            objects.push(getObj(obj._type, obj._id));
        });
	    
	    return objects
	};
	
	var filterToPlayerTokens = function(characterTokenArray)
	{
	    var players = [];
        
        _.each(characterTokenArray, function(obj) 
        {    
            let characterId = obj.get('represents');
            
            // look for tokens representing a character
            if(characterId)
            {
                // look for characters controlled by a player
                var character = getObj("character", characterId);
                var controllingPlayers = character.get('controlledby');
                
                maLog('Character "' + obj.get('name') + '" controlledby:' + controllingPlayers + ' (length=' + controllingPlayers.length + ')', DEBUG_FINE);
                
                if(controllingPlayers && controllingPlayers.length > 0)
                {
                    players.push(obj);
                }
            }
        });
        
        return players;
	};
	
	var filterToCharacterTokens = function(tokenArray)
	{
	    var characters = [];
        
        _.each(tokenArray, function(obj) 
        {    
            let characterId = obj.get('represents');
            
            // look for tokens representing a character
            if(characterId)
            {
                characters.push(obj);
            }
        });
        
        return characters;
	};
	
	var getSelectedOrAllCharacterTokens = function(selectedTokens)
	{
	    var characterTokens = [];
	    if(selectedTokens && selectedTokens.length != 0 )
	    {
	        characterTokens = getObjects(selectedTokens);
	    }
	    else
	    {
	        characterTokens = getAllTokensOnPlayerPage();
	    }
	    
	    // filter to characters
	    characterTokens = filterToCharacterTokens(characterTokens);
        
	    return characterTokens;
	};
	
	var getPlayerCharacterAttributes = function(selectedTokens, attrNames) 
	{
	    // get selected/all player character tokens
	    var characterTokens = filterToPlayerTokens(getSelectedOrAllCharacterTokens(selectedTokens));
	    
	    // remove duplicates
	    characterTokens = _.uniq(characterTokens, function(item) 
	    { 
            return item.get('represents');
        });
        
        // iterate over character tokens
	    var characterAttributes = [];
        _.each(characterTokens, function(obj) 
        {   
            // character object
            let charObj = {};
            charObj['character_id'] = obj.get('represents');
            
            _.each(attrNames, function(attrName)
            {
                let filter = {};
                
                if(attrName === 'name')
                {
                    //filter._type = 'character';
                    filter._id = obj.get('represents');
                }
                else
                {
                    filter._type = 'attribute';                             
                    filter._characterid = obj.get('represents');
                    filter.name = attrName;
                }
                
                maLog('Searching for objects: ' + JSON.stringify(filter), DEBUG_FINE);
                
                // find attribute for character token
                let attrObjs = findObjs(filter);
                
                // collect attributes
                _.each(attrObjs, function(attr)
                {
                    maLog('Found object for [' + attrName + ']: ' + JSON.stringify(attr), DEBUG_FINEST);
                    
                    if(attrName === 'name')
                    {
                        charObj[attrName] = attr.get('name');
                    }
                    else
                    {
                        charObj[attrName] = attr;
                    }
                });
                
            });
            
            // add character to array
            characterAttributes.push(charObj);
        });
	    
	    return characterAttributes;
	};
	
	var applyConsumedFood= function(gmPlayerName, selectedTokens, consumedFood)
	{
	    adjustHunger(gmPlayerName, selectedTokens, consumedFood, true);
	};
	
	var updateHunger = function(gmPlayerName, selectedTokens, increment)
	{
	    adjustHunger(gmPlayerName, selectedTokens, increment, false);
	};
	
	var adjustHunger = function(gmPlayerName, selectedTokens, increment, incrementIsFood)
	{
	    let characterAttributes = getPlayerCharacterAttributes(selectedTokens, ['name', 'hunger', 'starving', 'emaciated', 'dead', 'starving_threshold', 'emaciated_threshold', 'for', 'food_req']);
	    maLog('Applying ' + increment + ' hunger/food increment to ' + characterAttributes.length + ' character(s).');
        let gmMsg = {title: 'Hunger Summary', body:[]};
        
        _.each(characterAttributes, function(charObj) 
        {
            try
            {
                // get current hunger
                let characterName = charObj['name'];
                let hunger = parseInt(charObj['hunger'].get('current')) || 0;
                let starvingThreshold = parseInt(charObj['starving_threshold'].get('current')) || 0;
                let emaciatedThreshold = parseInt(charObj['emaciated_threshold'].get('current')) || 0;
                let fortitude = parseInt(charObj['for'].get('current')) || 0;
                let foodRequirement = parseInt(charObj['food_req'].get('current')) || 0;
                
                let msg = {title: 'Hunger', body:[]};
                
                if(incrementIsFood)
                {
                    let consumedFood = Math.min(increment, foodRequirement+4);
                    msg.body.push('You had ' + increment + ' food units yesterday');
                    if(consumedFood < increment)
                    {
                        msg.body.push('You consumed ' + consumedFood + ' food units but were too full for the remaining ' + (increment - consumedFood));
                    }
                    increment = foodRequirement - consumedFood;
                }
                else
                {
                    maLog('Incrementing hunger (' + hunger + ') for ' + characterName +  ' by ' + increment);
                }
                
                if(increment != 0)
                {
                    // report hunger change
                    msg.body.push('You have ' + (increment < 0 ? 'recovered ' : 'taken ') + Math.abs(increment) + ' hunger damage');
                }
                
                // update hunger damage (to min. zero)
                hunger = Math.max(hunger+increment, 0);
                charObj['hunger'].set('current', hunger);
                
                // report hunger value
                msg.body.push('Your current hunger damage is ' + hunger);
                let gmSummary = characterName +  ' now has ' + hunger + ' hunger damage.';
                
                // check if starving, emaciated or dead
                if(hunger >= fortitude)
                {
                    // whisper to player that they're dead
                    msg.body.push('You have starved to death !!');
                    gmSummary += ' They are dead.';
                    
                    charObj['starving'].set('current', 'on');
                    charObj['emaciated'].set('current', 'on');
                    charObj['dead'].set('current', 'on');
                    
                }
                else if(hunger >= emaciatedThreshold)
                {
                    // whisper to player that they're emaciated
                    msg.body.push('You are emaciated !!');
                    gmSummary += ' They are emaciated.';
                    
                    charObj['starving'].set('current', 'on');
                    charObj['emaciated'].set('current', 'on');
                    charObj['dead'].set('current', '0');
                    
                }
                else if(hunger >= starvingThreshold)
                {
                    // whisper to player that they're starving
                    msg.body.push('You are starving !');
                    gmSummary += ' They are starving.';
                    
                    charObj['starving'].set('current', 'on');
                    charObj['emaciated'].set('current', '0');
                    charObj['dead'].set('current', '0');
                }
                else
                {
                    charObj['starving'].set('current', '0');
                    charObj['emaciated'].set('current', '0');
                    charObj['dead'].set('current', '0');
                }
                
                // whisper to player/character
                whisperMessage(msg, characterName);
                
                // add GM summary line
                gmMsg.body.push(gmSummary);
            }
            catch(e)
            {
                maLog('Error adjusting hunger for character (' + charObj['character_id'] + '):' + JSON.stringify(e));
                gmMsg.body.push('Error adjusting hunger for character: ' + charObj['name']);
            }
            
        });
            
        // whisper summary to GM
        whisperMessage(gmMsg, gmPlayerName);
	    
	};
	
	var getMaxApocRollArray = function(msg)
	{
	    var maxApocRollFields = [];
	    var fields = msg.content.split(/(?={{)/);
	    
        _.each(fields, function(field)
	    {
	        if(field.trim().length > 0)
	        {
    	        maLog('MaxApocRoll field:'+field, DEBUG_FINEST);
    	        
    	        if(field.indexOf('{{') !== -1)
    	        {
    	            try
    	            {
            	        let nvp = field.match(/{{(.*)}}/)[1];
            	        let nvpArr = nvp.split('=');
            	        let nameVal = nvpArr[0];
            	        let valueVal = nvpArr[1];
            	        maLog('MaxApocRoll '+nameVal+':'+valueVal, DEBUG_FINEST);
            	        
            	        // add field
            	        var fieldObj = {};
            	        fieldObj.name = nameVal;
            	        fieldObj.value = valueVal;
            	        /* subtitles with translation values (e.g. ^{strength}) were causing errors*/
            	        //if(fieldObj.name !== 'subtitle')
            	        //{
            	            maxApocRollFields[maxApocRollFields.length] = fieldObj;
            	        //}
            	        
            	        // add inline roll info
            	        if(fieldObj.value.indexOf('$[[') !== -1)
            	        {
            	            try
            	            {
                	            let inlineRollIndex = fieldObj.value.match(/\$\[\[(.*)\]\]/)[1];
                	            fieldObj.inlineRollIndex = inlineRollIndex;
                	            if(msg.inlinerolls[inlineRollIndex].results)
                	            {
                	                fieldObj.value = msg.inlinerolls[inlineRollIndex].results.total;
            	                    maLog('MaxApocRoll inline value '+fieldObj.name+':'+fieldObj.value, DEBUG_FINEST);
                	            }
                	            if(msg.inlinerolls[inlineRollIndex].expression)
                	            {
                	                fieldObj.expression = msg.inlinerolls[inlineRollIndex].expression;
            	                    maLog('MaxApocRoll inline expression '+fieldObj.name+':'+fieldObj.expression, DEBUG_FINEST);
                	            }
            	            } catch(e)
            	            {
            	                log('Error on value "' + valueVal + '":'+e);
            	            }
            	        }
            	   
    	            } catch(e)
    	            {
    	                log('Error on field "' + field + '":'+e);
    	            }
    	        }
	        }
	    });

        return maxApocRollFields;
	};
	
	var rollEffect = function(rollMacro, inlinerolls, rollTemplate, playerid)
	{
	    var speakAs = 'player|' + state.MaxApoc.gmPlayerId;
	    var maxApocRollFields = getMaxApocRollArray({content: rollMacro, inlinerolls: inlinerolls});
	    var subtitle, characterName;
	    
	    maLog("Checking for roll effects: " + rollMacro);
	    
	    _.each(maxApocRollFields, function(field)
	    {
	        maLog(field.name + "=" + field.value, DEBUG_FINEST);
	            
	        if(field.name === "title")
	        {
	            characterName = field.value;
	        }
	            
	        if(field.name === "subtitle")
	        {
	            subtitle = field.value;
	        }
	    });
	                
	    /* EXAMPLE EFFECT 
        if(subtitle === "^{full_dodge}")
        {
            maLog("Full Dodge detected"); 
            maLog('Auto Init Reduction Enabled? - ' + CONFIG['autoInitReductionEnabled'].value, DEBUG_FINE);
            
            if(configIsEnabled('autoInitReductionEnabled'))
            {
                // increment Enemy Attraction
                var newTurnOrder = updateTurnOrderArray(-5, -5, characterName);
                setTurnOrder(newTurnOrder);
                
                // update players
                sendMessage({target: characterName, title: 'Initiative', body: '-5 for Full Dodge'});
            }
        }
        */
	};
	
	var rollCheck = function(rollMacro, inlinerolls, rollTemplate, playerid)
	{
	    var speakAs = 'player|' + state.MaxApoc.gmPlayerId;
	    var maxApocRollFields = getMaxApocRollArray({content: rollMacro, inlinerolls: inlinerolls});
	    
	    maLog('inlinerolls before:' + JSON.stringify(inlinerolls), DEBUG_FINE);
	    maLog('rollMacro before:' + JSON.stringify(maxApocRollFields), DEBUG_FINE);
	    
	    // find mod & profroll values
	    // based on mod create profroll value
        var msg = mergeValuesIntoMacro(maxApocRollFields, rollMacro);
            
	    maLog('rollMacro after:'+JSON.stringify(msg), DEBUG_FINE);
	    
	    // remember roll for luck re-roll
	    state.MaxApoc.characterRolls[playerid] = mergeValuesIntoMacro(maxApocRollFields, rollMacro) + " {{luckreroll=1}}";
	    
	    // perform roll check
	    sendChat(speakAs, '&{template:' + rollTemplate + '} ' + msg);
	};
	
	var reRoll = function(playerid, reRollType)
	{
	    var reRolled = false;
	    
	    if(reRollType) 
	    {
	        reRollType = reRollType.trim() + ' ';
	    }
	    else
	    {
	        reRollType = '';
	    }
	    
	    maLog('Performing ' + reRollType + 're-roll for playerid: ' + playerid, DEBUG_FINE)
	    
	    var reroll = state.MaxApoc.characterRolls[playerid];
	    
        if(reroll)
        {
    	    // perform re-roll
    	    sendChat('player|' + playerid, '&{template:maxapoc} ' + reroll);
    	    state.MaxApoc.characterRolls[playerid] = false;
    	    reRolled = true;
        }
        else
        {
            sendMessage({title: reRollType + 'Re-Roll', body: 'No check to re-roll'}); 
        }
        
        return reRolled;
	};
	
	var luckReRoll = function(characterid, playerid)
	{
	    var attribute = 'luck_uses';
	    
	    var filter = {                              
          _type: "attribute",
          _characterid: characterid,
          name: attribute
        };
	    
	    // get luck usage attribute
	    var objects = findObjs(filter);
        
        if(objects.length === 1)
        {
            var luckUsageAttr = objects[0];
            
            // get curent luck uses value
            var luckUsage = luckUsageAttr.get('current');
    
            // check they have luck uses left        
            if(luckUsage > 0)
            {
                // do re-roll
                var checkReRolled = reRoll(playerid, "Luck");
                
                // update attributes if check re-rolled
                if(checkReRolled)
                {
            	    //decrement luck usage
                    luckUsageAttr.set('current', luckUsage-1);
                }
            }
            else
            {
                sendMessage({title: 'Luck Re-Roll', body: 'No luck uses left'}); 
            }
        }
        else
        {
            maLog('Unable to find ' + attribute + ' object. Found ' + objects.length + ' with filter: ' + JSON.stringify(filter));
            if(objects.length)
            {
                maLog('Found objects: ' + JSON.stringify(objects));
            }
        }
	};
	
	var resetAllPlayerCharactersLuck = function()
	{
	    // find all characters
	    var characters = findObjs({                           
          _type: 'character',
          archived:	false
        });
	    
	    maLog('Resetting luck for all player characters luck uses. Found ' + characters.length + ' characters', DEBUG_FINE);
	    
	    // filter to players
	    var playerCharactersIds = [];
        _.each(characters, function(char) 
        {    
            if(char.get('controlledby').length > 0)
            {
                playerCharactersIds.push(char.get('_id'));
            }
        });
	    
	    maLog('Found ' + playerCharactersIds.length + ' player characters', DEBUG_FINE);
	    
	    // reset each character's luck use attribute to max
        _.each(playerCharactersIds, function(charactersId) 
        {    
            var luckUses = findObjs({                           
              _type: 'attribute',
              _characterid:	charactersId,
              name: 'luck_uses'
            });
            
            _.each(luckUses, function(attr) 
            {
	            maLog('Resetting luck_uses for ' + charactersId, DEBUG_FINEST);
                let max = attr.get('max');
                attr.set('current', max)
            });
        });
	};
	
	var mergeValuesIntoMacro = function(maxApocRollFields, rollMacro)
	{
	    return _.chain(maxApocRollFields)
            .reduce(function(m,v,k){
                maLog(v.name + ': m[$[['+v.inlineRollIndex+']]]='+v.value, DEBUG_FINEST);
                m['$[['+v.inlineRollIndex+']]']=(v.name==='profroll' ? v.expression : v.value);
                return m;
            },{})
            .reduce(function(m,v,k){
                maLog('Replace ' + k + ' with [['+v+']]', DEBUG_FINEST);
                return m.replace(k,'[['+v+']]');
            },rollMacro)
            .value();
	};
	
	var getPlayerName = function(chatMsg)
	{
	    maLog("Getting player name:"+chatMsg.who, DEBUG_FINE);
	    
	    var playerName = chatMsg.who;
	    
	    if(playerIsGM(chatMsg.playerid))
	    {
	        maLog("Player is GM", DEBUG_FINE);
	        playerName = playerName.substring(0, playerName.length - " (GM)".length);
	    }
	    
	    maLog("Player name:"+playerName, DEBUG_FINE);
	    
	    return playerName;
	    
	};
	
	var whisperMessage = function(config, playerName)
	{
	    config['target'] = playerName;
	    config['whisper'] = true;
	    maLog('Whispering to ' + playerName, DEBUG_FINE);
	    sendMessage(config);
	};
	
	/*
	config: {
	    speakAs: text for  the message should show as coming from (pass playerId for player name)
	    playerId: '<the id of the player who chatted the message>',
	    target: '<the name of the character the message is about>',
	    whisper: '<boolean; whether to send message just to target>','
	    title: '<the chat message title>',
	    body: '<the chat message content>'
	}
	*/
	var sendMessage = function(config)
	{
	    var speakAs = config.speakAs ? config.speakAs : 'player|' + (config.playerId ? config.playerId : state.MaxApoc.gmPlayerId);
	    maLog('Sending message (as ' + speakAs + '): ' + JSON.stringify(config), DEBUG_FINE);
        sendChat(speakAs, (config.whisper ? '/w "' + config.target + '" ' : '') + styleMessage(config));
	};
	
	/*
	config: {
	    target: '<the name of the character to send message to>',
	    title: '<the chat message title>',
	    body: '<the chat message content or an Array of messages>'
	}
	*/
	var styleMessage = function(config)
	{
	    if (!Array.isArray(config.body)) config.body = [config.body];
	    
	    const s = (o) => _.map(o, (v, k) => `${k}:${v};`).join('');
            const styles = {
          	  outer: {
                	'border': '8px double black',
                	'margin-left': '-7px'
	            },
        	    target: {
                	'font-size': '20px',
	                'font-family': 'Bangers',
                	'color': '#FFFFFF',
	                'background-color': '#a90d04',
        	        'padding': '5px 5px 0px 5px'
            	},
        	    title: {
                	'font-size': '18px',
	                'font-family': 'Blinker',
        	        'font-weight': 'bold',
                	'color': '#FFFFFF',
	                'background-color': '#a90d04',
        	        'padding': '0px 5px 5px 5px'
            	},
	            bodyOdd: {
        	        'font-size': '14px',
                	'font-weight': 'bold',
	                'background-color': '#FFFFFF',
        	        'padding': '5px'
	            },
        	    bodyEven: {
                	'font-size': '14px',
	                'font-weight': 'bold',
        	        'background-color': '#EEEEEE',
	                'padding': '5px'
        	    },
	        };  
        
        	var styledMsg = `<div style="${s(styles.outer)}">`;
        	if(config.target)
        	{
        	    styledMsg += `<div style="${s(styles.target)}">${config.target}</div>`;
        	}
        	styledMsg += `<div style="${s(styles.title)}">${config.title}</div>`;
	        for (let i = 0; i < config.body.length; i++) 
        	{
	            let style = i%2===0 ? s(styles.bodyOdd) : s(styles.bodyEven);
        	    styledMsg += `<div style="${style}">${config.body[i]}</div>`;
	        }
	        styledMsg += `</div>`;
        
        	return styledMsg;
	};

	return {
	    CONFIG: CONFIG,
		DEBUG_ERROR: DEBUG_ERROR,
        DEBUG_WARN:  DEBUG_WARN,
        DEBUG_INFO:  DEBUG_INFO, 
        DEBUG_FINE:  DEBUG_FINE, 
        DEBUG_FINEST: DEBUG_FINEST,
	    maLog: maLog,
	    getPlayerName: getPlayerName,
	    showConfig:showConfig,
	    updateConfig:updateConfig,
		init: init,
		handleTrackerEvent: handleTrackerEvent,
		nextActionPhase: nextActionPhase,
		showEnemyAttraction: showEnemyAttractionToken,
		updateEnemyAttraction: updateEnemyAttraction,
		hideEnemyAttractionToken: hideEnemyAttractionToken,
		deleteEnemyAttractionToken: deleteEnemyAttractionToken,
		updateHunger: updateHunger,
		applyConsumedFood: applyConsumedFood,
		rollCheck: rollCheck,
		rollEffect: rollEffect,
		reRoll: reRoll,
		luckReRoll: luckReRoll,
		resetAllPlayerCharactersLuck: resetAllPlayerCharactersLuck
    };
}());

/*
 * HANDLE API CALLS
 */
on("chat:message", function(msg) 
{
  MaxApoc.maLog('Chatted msg:' + JSON.stringify(msg), MaxApoc.DEBUG_FINE);
  
  state.MaxApoc.gmPlayerId = msg.playerid;
  state.MaxApoc.gmChatSpeaksAs = msg.who;

  // ROLL A CHECK
  if(msg.type == "api" && msg.content.indexOf("!ma roll") !== -1 && msg.rolltemplate == "maxapoc") 
  {
      var rollText = msg.content.substring(9, msg.content.length);
      MaxApoc.rollCheck(rollText, msg.inlinerolls, msg.rolltemplate, msg.playerid);
      return;
  }
  
  if(msg.type == "api" && msg.content.indexOf("!ma reroll") !== -1)
  {
      MaxApoc.reRoll(msg.playerid);
      return;
  }
  
  if(msg.type == "api" && msg.content.indexOf("!ma lrr") !== -1)
  {
      var characterid = msg.content.substring(8, msg.content.length);
      MaxApoc.luckReRoll(characterid, msg.playerid);
      return;
  }
  
  /*
   * IMPLEMENTED FULL DODGE AND RIPOSTE VIA TRACKER MACRO
   * DISABLE UNTIL AOTHER USE
  if(msg.type == "general" && msg.rolltemplate == "maxapoc")
  {
      // handle player action effects
      MaxApoc.rollEffect(msg.content, msg.inlinerolls, msg.rolltemplate, msg.playerid);
      return;
  }
  */
  
  // Rest of the API only usable by GM
  if(msg.type == "api" && playerIsGM(msg.playerid)) 
  {
        
      // SHOW CONFIG
      var cmd = "!ma config";
      if(msg.content === cmd) 
      {
            MaxApoc.showConfig(MaxApoc.getPlayerName(msg));
            return;
      }
        
      // UPDATE CONFIG
      if(msg.content.indexOf(cmd) !== -1) 
      {
            var cmdOptions = msg.content.substring(cmd.length+1, msg.content.length).split(" ");
            MaxApoc.updateConfig(cmdOptions, MaxApoc.getPlayerName(msg));
            return;
      }
        
      // SHOW ENEMY ATTRACTION TOKEN
      if(msg.content.indexOf("!ma sea") !== -1 || msg.content.indexOf("!ma seag") !== -1) 
      {
            MaxApoc.showEnemyAttraction();
            return;
      }
        
      // UPDATE ENEMY ATTRACTION TOKEN
      var ueaCmdIndex = msg.content.indexOf("!ma uea ");
      if(ueaCmdIndex === -1) 
      {
          ueaCmdIndex = msg.content.indexOf("!ma ueag ");
      }
      if(ueaCmdIndex !== -1) 
      {
          var cmdSuffix = msg.content.substring(8, msg.content.length);
          var eaChange = parseInt(cmdSuffix) || 0;
          MaxApoc.updateEnemyAttraction(eaChange, true);
          return;
      }
        
      // RESET ENEMY ATTRACTION TOKEN
      if(msg.content.indexOf("!ma rea") !== -1 || msg.content.indexOf("!ma reag") !== -1) 
      {
          MaxApoc.updateEnemyAttraction(0, false);
          return;
      }
        
      // HIDE ENEMY ATTRACTION TOKEN
      if(msg.content.indexOf("!ma hea") !== -1 || msg.content.indexOf("!ma heag") !== -1) 
      {
            MaxApoc.hideEnemyAttractionToken();
            return;
      }
        
      // DELETE ENEMY ATTRACTION TOKEN
      if(msg.content.indexOf("!ma dea") !== -1 || msg.content.indexOf("!ma deag") !== -1) 
      {
            MaxApoc.deleteEnemyAttractionToken();
            return;
      }
      
      // START ROUND OF INIATIVE
      if(msg.content.indexOf("!ma init") !== -1) 
      {
          MaxApoc.init(false, msg.selected);
          return;
      }
        
      // NEXT PHASE OF INIATIVE
      if(msg.content.indexOf("!ma np") !== -1) 
      {
          MaxApoc.nextActionPhase();
          return;
      }
      
      // UPDATE HUNGER
      if(msg.content.indexOf("!ma uh") !== -1) {
          var cmdSuffix = msg.content.substring(7, msg.content.length);
          var hungerChange = parseInt(cmdSuffix) || 0;
          MaxApoc.updateHunger(MaxApoc.getPlayerName(msg), msg.selected, hungerChange);
          return;
      }
      
      // APPLY CONSUMED FOOD
      cmd = "!ma acf";
      if(msg.content.indexOf(cmd) !== -1) {
            var cmdSuffix = msg.content.substring(cmd.length+1, msg.content.length)
            var consumedFood = parseInt(cmdSuffix) || 0;
            MaxApoc.applyConsumedFood(MaxApoc.getPlayerName(msg), msg.selected, consumedFood);
            return;
      }
        
      // RESET ALL PLAYERS LUCK USES
      if(msg.content.indexOf("!ma rl") !== -1) 
      {
          MaxApoc.resetAllPlayerCharactersLuck();
          return;
      }
  }
  else if(msg.type == "api" && playerIsGM(msg.playerid) == false) 
  {
      MaxApoc.maLog("Only GM can call this API.", MaxApoc.DEBUG_FINER);
  }
  
});

/*
 * HANDLE INITIATIVE TRACKER CHANGES
 */
on('change:campaign:turnorder',function(obj) 
{
    MaxApoc.handleTrackerEvent(JSON.parse(obj.get('turnorder')));
});

/*
 * SET-UP STATE
 */
on('ready',function() 
{
    "use strict";
    
    var initialState = {
            version: 2.0,
            initPhase: 0,
            gmPlayerId: '',
            gmChatSpeaksAs: '',
            characterRolls: {},
            config: MaxApoc.CONFIG
        };

    // Check if the namespaced property exists, creating/updating it if it doesn't
    if( ! state.MaxApoc ) {
        state.MaxApoc = initialState;
    } else {
        // ensure all properties are present
        _.each(initialState, function(propValue, propName)
        {
           if( ! state.MaxApoc[propName] ) 
           {
               state.MaxApoc[propName] = propValue;
           }
        });
        
        // ensure all config items are present
        _.each(initialState.config, function(configValue, configName)
        {
           if( ! state.MaxApoc.config[configName] ) 
           {
               state.MaxApoc.config[configName] = configValue;
           }
        });
    }
    
});