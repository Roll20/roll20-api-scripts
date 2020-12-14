var MaxApoc = (function() {
	'use strict';
	
	var init = function() {
          
        // show turn order
        Campaign().set('initiativepage', Campaign().get('playerpageid'));
        
        // reset phase
        state.MaxApoc.initPhase = 1;
        
        // create empty turn order
        let turnorder = [];
        
        // add turn order entries per character token on player page
        let currentPageGraphics = findObjs({                              
          _pageid: Campaign().get("playerpageid"),                              
          _type: "graphic", 
          _subtype: "token"
        });
        _.each(currentPageGraphics, function(obj) {    
            //log('Found graphic:'+JSON.stringify(obj));  
            
            let characterId = obj.get('represents');
            if(characterId)
            {
                let initiative = getAttrByName(characterId, 'init');
                
                turnorder.push({
                    id: obj.id,
                    pr: getAttrByName(characterId, 'init'),
                    custom: obj.get('name')
                });
            }
        });
        
        // update turn order
        //log('turnorder:'+JSON.stringify(turnorder))
        Campaign().set('turnorder', JSON.stringify(turnorder));
        
        // update players
        sendChat(
        'Initiative',
        '<span>New Combat Round</span>');
        
        sendChat(
        'Initiative',
        '<span>Combat Phase: '+state.MaxApoc.initPhase+'</span>');
	};
	
	var enemyTokenName = "Enemy Attraction";
	
	var getEnemyToken = function() {
	    
	    var enemyToken;
	    
        let currentEnemyTokens = findObjs({                              
          _pageid: Campaign().get("playerpageid"),                              
          _type: "graphic", 
          _subtype: "token",
          name: enemyTokenName
        });
        
        if(currentEnemyTokens.length === 0)
        {
            enemyToken = createObj("graphic", {
                                    _pageid: Campaign().get('playerpageid'),
                                    _subtype: 'token',
                                    name: enemyTokenName,
                                    left: 1015,
                                    top: 455,
                                    width: 70,
                                    height: 70,
                                    layer: 'objects',
                                    bar1_value: 0,
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
        }
        
        return enemyToken;
	};

	var showEnemyAttractionToken = function() {
	    getEnemyToken();
	};

	var updateEnemyAttraction = function(attractionValue, isIncrement) {
	    var et = getEnemyToken();
	    var currentAttraction = parseInt(et.get('bar1_value')) || 0;
	    var newAttraction = isIncrement ? currentAttraction+attractionValue : attractionValue;
	    et.set('bar1_value', newAttraction);
	};

	return {
		init: init,
		showEnemyAttraction: showEnemyAttractionToken,
		updateEnemyAttraction: updateEnemyAttraction
	};
}());

on("chat:message", function(msg) {
    
  // SHOW ENEMY ATTRACTION TOKEN
  if(msg.type == "api" && msg.content.indexOf("!sea") !== -1) {
      MaxApoc.showEnemyAttraction();
  }
    
  // UPDATE ENEMY ATTRACTION TOKEN
  var ueaCmdIndex = msg.content.indexOf("!uea ");
  if(msg.type == "api" && ueaCmdIndex !== -1) {
      var cmdSuffix = msg.content.substring(5, msg.content.length);
      var eaChange = parseInt(cmdSuffix) || 0;
      MaxApoc.updateEnemyAttraction(eaChange, true);
  }
    
  // RESET ENEMY ATTRACTION TOKEN
  if(msg.type == "api" && msg.content.indexOf("!rea") !== -1) {
      MaxApoc.updateEnemyAttraction(0, false);
  }
  
  // START ROUND OF INIATIVE
  if(msg.type == "api" && msg.content.indexOf("!init") !== -1) {
      MaxApoc.init();
  }
    
  // NEXT PHASE OF INIATIVE
  if(msg.type == "api" && msg.content.indexOf("!np") !== -1) {
    
    if(state.MaxApoc.initPhase < 4)
    {
        var turnorder;
        if(Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
        else turnorder = JSON.parse(Campaign().get("turnorder"));
        
        _.each(turnorder, function(turn) {
            turn.pr = turn.pr-5;
        });
        
        // update turn order
        log('turnorder:'+JSON.stringify(turnorder))
        Campaign().set('turnorder', JSON.stringify(turnorder));
        
        // increment phase
        state.MaxApoc.initPhase++;
        
        // notify players
        sendChat(
        'Initiative',
        '<span>Combat Phase: '+state.MaxApoc.initPhase+'</span>');
    }
    else
    {         
        // increment Enemy Attraction
        updateEnemyAttraction(5, true);

	// Start new combat round
        MaxApoc.init();
    }
  }
});

on('ready',function() {
    "use strict";

    // Check if the namespaced property exists, creating it if it doesn't
    if( ! state.MaxApoc ) {
        state.MaxApoc = {
            version: 1.0,
            initPhase: 0
        };
    }
});