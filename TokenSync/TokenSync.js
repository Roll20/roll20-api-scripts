var TokenSync = TokenSync || (function() {
    'use strict';
    var version = '1.1',
    lastUpdate = 1458259062,
	
	syncable = [ "imgsrc", "bar1_link", "bar2_link", "bar3_link", "width", "height", "rotation", "layer", "isdrawing", "flipv", "fliph", "name", "aura1_radius", "aura2_radius", "aura1_color", "aura2_color", "aura1_square", "aura2_square", "tint_color", "statusmarkers", "showname", "showplayers_name", "showplayers_bar1", "showplayers_bar2", "showplayers_bar3", "showplayers_aura1", "showplayers_aura2", "light_radius", "light_dimradius", "light_otherplayers", "light_hassight", "light_angle", "light_losangle", "light_multiplier" ],
	syncAll = "imgsrc|bar1_link|bar2_link|bar3_link|width|height|rotation|layer|isdrawing|flipv|fliph|name|aura1_radius|aura2_radius|aura1_color|aura2_color|aura1_square|aura2_square|tint_color|statusmarkers|showname|showplayers_name|showplayers_bar1|showplayers_bar2|showplayers_bar3|showplayers_aura1|showplayers_aura2|light_radius|light_dimradius|light_otherplayers|light_hassight|light_angle|light_losangle|light_multiplier",
	
	syncProperty = function(updatedToken, properties) 
	{
		var value;
		if (!updatedToken.get("represents"))
			return;
		if (properties === "")
			properties = syncAll;
		var propList = properties.split("|");

		propList.forEach(function(prop) {
			if (!_.isUndefined(state.TokenSync.syncList[prop]) && _.contains(state.TokenSync.syncList[prop],updatedToken.get("represents")))
			{
				var tokens = findObjs({ _subtype: "token", represents: updatedToken.get("represents") });
				value = updatedToken.get(prop);
				tokens.forEach(function(tok) { tok.set(prop,value); });
			}
		});
	},
	
	
	usage = function(who)
	{
		sendChat("TokenSync", "Usage: !tokensync [--add property(|properties)] [--remove property(|properties)] [--removeall] [--forcesync (property(|properties))]");
	},
	
	registerListener = function(prop)
	{
		// Keep track of what event handlers we've registered; since we can't unregister (AFAIK), we don't want to acidentally register the same event multiple times
		if (!_.contains(state.TokenSync.propsListened,prop))
		{
			state.TokenSync.propsListened[ state.TokenSync.propsListened.length ] = prop;
			on("change:token:"+prop, function(obj) { syncProperty(obj,prop); });
		}
	},

	add = function(charID,properties)
	{
		var i;
		var propList = properties.split("|");
		for (i = 0; i < propList.length; i++)
		{
			if (_.indexOf(syncable,propList[i]) === -1)
			{
				// Not on our list of properties that can be synchronized
				sendChat("TokenSync","Invalid token property: "+propList[i]);
				continue;
			}
			if (_.contains(Object.keys(state.TokenSync.syncList),propList[i]))
			{
				if (_.contains(state.TokenSync.syncList[propList[i]],charID))
				{
					sendChat("TokenSync","Property already added to sync list: "+propList[i]);
					continue;
				}
				else
				{
					state.TokenSync.syncList[propList[i]].push(charID);
					sendChat("TokenSync","Added "+propList[i]+" to the sync list.");
				}
			}
			else
			{
				log("Created new "+propList[i]);
				state.TokenSync.syncList[propList[i]] = [ charID ];
				registerListener(propList[i]);
				sendChat("TokenSync","Added "+propList[i]+" to the sync list.");
			}
		}
	},

	remove = function(charID,properties,silent)
	{
		var i, propList;
		if (properties === "")
			propList = syncAll.split("|");
		else
			propList = properties.split("|");
		for (i = 0; i < propList.length; i++)
		{
			if (!_.contains(Object.keys(state.TokenSync.syncList),propList[i]))
			{
				if (properties.indexOf(propList[i]) !== -1 && silent !== true)
					sendChat("TokenSync","Property "+propList[i]+" not in sync list");
				continue;
			}
			else if (_.contains(state.TokenSync.syncList[propList[i]],charID))
			{
				// If this is the only character in the list, gank the whole property from the list
				if (state.TokenSync.syncList[propList[i]].length === 1)
					delete state.TokenSync.syncList[propList[i]];
				else
				{
					state.TokenSync.syncList[propList[i]].splice(state.TokenSync.syncList[propList[i]].indexOf(charID),1);
				}
				if (silent !== true)
					sendChat("TokenSync","Removed "+propList[i]+" from the sync list.");
			}
		}
	},

	HandleInput = function(msg)
	{

		var msg,
			selected,
            characterObj,
            tokens,
			tok,
			params,
			i;
			
		var cmd = "!tokensync"
		if (msg.type === "api" && msg.content.indexOf(cmd) !== -1 )
		{
    		selected = msg.selected;
			params = msg.content.split(" ");
			if (params.length === 1)
			{
				usage(msg.playerid);
				return;
			}
			
            //loop through selected tokens
            _.each(selected, function(obj) {
                tok = getObj("graphic", obj._id);
				for (i = 1; i < params.length; i++)
				{
					switch(params[i].trim())
					{
						case "--add":
							// Make sure it isn't last in the params list, and that it isn't another option
							if ((i < (params.length - 1)) && params[i+1].indexOf("--") === -1)
							{
								add(tok.get("represents"),params[i+1]);
								i++; // Jump forward in the list, since we know the next param isn't an option
							}
							else
								sendChat("TokenSync", "**ERROR:** token property not specified");
							break;
						case "--remove":
							// Make sure it isn't last in the params list, and that it isn't another option
							if ((i < (params.length - 1)) && params[i+1].indexOf("--") === -1)
							{
								remove(tok.get("represents"),params[i+1]);
								i++; // Jump forward in the list, since we know the next param isn't an option
							}
							else
								sendChat("TokenSync", "**ERROR:** token property not specified");
							break;
						case "--removeall":
							remove(tok.get("represents"),"");
							break;
						case "--forcesync":
							syncProperty(tok,"");
							break;
						case "--register":
						registerListeners();
							break;
						default:
							break;
					}
				}
			});
		}
	},
	
	registerListeners = function() {
	},
    checkInstall = function() {    
        if (!state.TokenSync)
            state.TokenSync = { module: "TokenSync", syncList: {}, propsListened: [] };
        log('-=> TokenSync v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},
	
	syncNewToken = function(newTok)
	{
		var existingTok;
		var tokens = findObjs({ _subtype: "token", represents: newTok.get("represents") });
		for (var i = 0; i < tokens.length; i++)
		{
			if (tokens[i].get("_id") !== newTok.get("_id"))
			{
				existingTok = tokens[i];
				break;
			}
		}
		if (!_.isUndefined(existingTok))
			syncProperty(existingTok,"");
	},
	
	removeDeletedCharacter = function(oldChar)
	{
		remove(oldChar.get("_id"),"",true);
	},

	RegisterEventHandlers = function() {
		on('chat:message', HandleInput);
		on('add:token', syncNewToken);
		on('destroy:character', removeDeletedCharacter);
		on('change:token:represents', syncNewToken);

		var prop, i;
		state.TokenSync.propsListened = [];
		log (state.TokenSync.syncList);
		var keys = Object.keys(state.TokenSync.syncList);
		for(i = 0; i < keys.length; i++) registerListener(keys[i]);
	};

	return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: RegisterEventHandlers,
		syncProperty: syncProperty
	};
}());
on("ready",function(){
	'use strict';

	TokenSync.CheckInstall();
	TokenSync.RegisterEventHandlers();
});