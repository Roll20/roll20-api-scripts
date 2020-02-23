var KnightStyleMarker = KnightStyleMarker || (function() {
	'use strict';
	
	var version = "1.0";
	var allPage;
	var currentPageTokens;
	var name;
	
	var prepareKSM = function() {
        if(!state.KSM)
        {
            state.KSM = {
                allPage: true
            };
        }
        
        log(state.KSM);
	};
	
	var registerOptionsChange = function() {
    	on('chat:message',function(msg)
        {
            
            if(msg.type != 'api') return;
            
            var ID = msg.playerid;
            
            if(playerIsGM(ID))
            {
                if(msg.content == '!KSM AP')
                {
                    state.KSM.allPage = true;
                    
                    sendChat("Knight Style Marker", "/w gm R&#233;gl&#233; pour s'afficher sur toutes les pages.");
                }
                
                if(msg.content == "!KSM NAP")
                {
                    state.KSM.allPage = false;
                    
                    sendChat("Knight Style Marker", "/w gm R&#233;gl&#233; pour s'afficher uniquement sur la page o&#249; se trouve les joueurs.");
                }
            }
        });
	};
	
	var registerEventHandlers = function() {
		on("change:attribute", function (atr)
		{
			var attribut = atr.get("name");

			if(attribut == "styleCombat")
			{
				var value = atr.get("current");
				var id = atr.get("_characterid");
				
				if(getAttrByName(id, "name") == "@{character_name}")
				{
					name = getAttrByName(id, "character_name");
				}
				else
				{
					name = getAttrByName(id, "surnom");
				}

				if(state.KSM.allPage == true)
				{
					currentPageTokens= findObjs({                             
						represents: id,                         
					});				
				}
				else
				{
					currentPageTokens= findObjs({                             
						_pageid: Campaign().get("playerpageid"),                             
						represents: id,                         
					});
				}
				
				_.each(currentPageTokens, function(obj) {   
					obj.set("status_bolt-shield", false);
					obj.set("status_all-for-one", false);
					obj.set("status_strong", false);
					obj.set("status_fist", false);
					obj.set("status_aura", false);
				});

				if(value == "standard")
				{
					sendChat(name, "/me revient en posture standard.");
				}

				if(value == "agressif")
				{
					sendChat(name, "/me se met en aggressif.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_fist", true);
					});
				}

				if(value == "akimbo")
				{
					sendChat(name, "/me se met en akimbo.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_strong", true);
					});
				}

				if(value == "ambidextre")
				{
					sendChat(name, "/me se met en ambidextre.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_all-for-one", true);
					});
				}

				if(value == "couvert")
				{
					sendChat(name, "/me se met &#224; couvert.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_aura", true);
					});
				}

				if(value == "defensif")
				{
					sendChat(name, "/me se met en d&#233;fensif.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_bolt-shield", true);
					});
				}
			}
		});
	};
	
	return {
	    PrepareKSM: prepareKSM,
        EventHandlers: registerEventHandlers,
        OptionsChange: registerOptionsChange
    };
}());

on("ready", function() {
    'use strict';
	
    log("Knight Style Marker Started");
    KnightStyleMarker.PrepareKSM();
	KnightStyleMarker.OptionsChange();
    KnightStyleMarker.EventHandlers();
	
    log("Knight Style Marker Ready");
    // If it is then send a message to the GM to tell them the script is ready.
    sendChat("Knight Style Marker", "/w gm Knight Style Marker Ready");
});