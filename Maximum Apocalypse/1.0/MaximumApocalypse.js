var MaxApoc = (function() {
	'use strict';
	
	var END_OF_PHASE = '<end of phase>';
	
	var init = function() 
	{
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
                
        // add marker so end of phase can be detected
        addEndOfPhaseTurn(turnorder);
        
        // sort in descending order
        turnorder.sort((a, b) => parseInt(b.pr) - parseInt(a.pr));
        
        // update turn order
        Campaign().set('turnorder', JSON.stringify(turnorder));
        
        // update players
        sendChat('GM', styleMessage('Initiative', ['New Combat Round', 'Combat Phase: '+state.MaxApoc.initPhase+' (of 4)']));
	};
	
	var addEndOfPhaseTurn = function(tracker)
	{
        tracker.push({
            id: '-1',
            pr: '0',
            custom: END_OF_PHASE
        });
	}

	var handleTrackerEvent = function(tracker) 
	{
	    if(tracker[0].custom === END_OF_PHASE)
	    {
	        nextActionPhase();
	    }
	};
	
	var nextActionPhase = function() 
	{    
        if(state.MaxApoc.initPhase < 4)
        {
            var oldTurnorder;
            if(Campaign().get("turnorder") == "") oldTurnorder = [];
            else oldTurnorder = JSON.parse(Campaign().get("turnorder"));
            var newTurnOrder = [];
            
            _.each(oldTurnorder, function(turn) 
            {
                // don't re-add the end of phase marker
                if(turn.custom != END_OF_PHASE)
                {
                    turn.pr = turn.pr-5;
                    newTurnOrder.push(turn);
                }
            });
            
            // add marker so end of phase can be detected
            addEndOfPhaseTurn(newTurnOrder);
            
            // update turn order
            Campaign().set('turnorder', JSON.stringify(newTurnOrder));
            
            // increment phase
            state.MaxApoc.initPhase++;
            
            // notify players
            sendChat('GM', styleMessage('Initiative', 'Combat Phase: '+state.MaxApoc.initPhase+' (of 4)'));
        }
        else
        { 
            // increment Enemy Attraction
            updateEnemyAttraction(5, true);
            
            // start new combat round
            init();
        }
	};
	
	var enemyTokenName = "Enemy Attraction";
	
	var getEnemyToken = function() 
	{
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

	var showEnemyAttractionToken = function() 
	{
	    getEnemyToken();
	};

	var updateEnemyAttraction = function(attractionValue, isIncrement) 
	{
	    var et = getEnemyToken();
	    var currentAttraction = parseInt(et.get('bar1_value')) || 0;
	    var newAttraction = isIncrement ? currentAttraction+attractionValue : attractionValue;
	    et.set('bar1_value', newAttraction);
	};
	
	var styleMessage = function(title, body)
	{
	    if (!Array.isArray(body)) body = [body];
	    
	    const s = (o) => _.map(o, (v, k) => `${k}:${v};`).join('');
            const styles = {
          	  outer: {
                	'border': '8px double black',
                	'margin-left': '-7px'
	            },
        	    title: {
                	'font-size': '18px',
	                'font-family': 'Blinker',
        	        'font-weight': 'bold',
                	'color': '#FFFFFF',
	                'background-color': '#a90d04',
        	        'padding': '5px'
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
        
        	var styledMsg = `<div style="${s(styles.outer)}"><div style="${s(styles.title)}">${title}</div>`;
	        for (let i = 0; i < body.length; i++) 
        	{
	            let style = i%2===0 ? s(styles.bodyOdd) : s(styles.bodyEven);
        	    styledMsg += `<div style="${style}">${body[i]}</div>`;
	        }
	        styledMsg += `</div>`;
        
        	return styledMsg;
	};

	return {
		init: init,
		handleTrackerEvent: handleTrackerEvent,
		nextActionPhase: nextActionPhase,
		showEnemyAttraction: showEnemyAttractionToken,
		updateEnemyAttraction: updateEnemyAttraction
	};
}());

/*
 * HANDLE API CALLS
 */
on("chat:message", function(msg) {

  log(JSON.stringify(msg.rolltemplate));
  log(JSON.stringify(msg.content));
    
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
      MaxApoc.nextActionPhase();
  }
  
});

/*
 * HANDLE INITIATIVE TRACKER CHANGES
 */
on('change:campaign:turnorder',function(obj) {
    "use strict";

    MaxApoc.handleTrackerEvent(JSON.parse(obj.get('turnorder')));
    
});


/*
 * SET-UP STATE
 */
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