var KnightStyleMarker = KnightStyleMarker || (function() {
	'use strict';
	
	var version = "1.0";
	var allPage = true;
	var currentPageTokens;
	var name;
	
	var checkInstall = function() {
        var gc = global['Knight Style Marker'];
		 
	    	allPage = gc['Toute Page'];
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

				if(allPage == true)
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
					sendChat(name, "/me se met à couvert.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_aura", true);
					});
				}

				if(value == "defensif")
				{
					sendChat(name, "/me se met en défensif.");

					_.each(currentPageTokens, function(obj) {   
						obj.set("status_bolt-shield", true);
					});
				}
			}
		});
	};
	
	return {
        EventHandlers: registerEventHandlers,
        CheckInstall: checkInstall
    };
}());

var global = globalconfig || undefined;

on("ready", function() {
    'use strict';
	KnightStyleMarker.CheckInstall();
	
    log("Knight Style Marker Started");
	
    KnightStyleMarker.EventHandlers();
	
    log("Knight Style Marker Ready");
    // If it is then send a message to the GM to tell them the script is ready.
    sendChat("Knight Style Marker", "/w gm Knight Style Marker Ready");
});
