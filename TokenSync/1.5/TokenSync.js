var TokenSync = TokenSync || (function() {
    'use strict';
    var version = '1.5',
    lastUpdate = 1458277726,
	
	syncable = [ "imgsrc", "bar1_link", "bar2_link", "bar3_link", "width", "height", "rotation", "layer", "isdrawing", "flipv", "fliph", "name", "aura1_radius", "aura2_radius", "aura1_color", "aura2_color", "aura1_square", "aura2_square", "tint_color", "statusmarkers", "showname", "showplayers_name", "showplayers_bar1", "showplayers_bar2", "showplayers_bar3", "showplayers_aura1", "showplayers_aura2", "light_radius", "light_dimradius", "light_otherplayers", "light_hassight", "light_angle", "light_losangle", "light_multiplier" ],
		
	syncProperty = function(updatedToken, properties) 
	{
		var value;
		if (!updatedToken.get("represents"))
			return;
		var propList;
		if (_.isUndefined(properties) || properties === "")
			propList = state.TokenSync.syncList[updatedToken.get('represents')];
		else
			propList = _.intersection(properties.split("|"),(state.TokenSync.syncList[updatedToken.get('represents')]||[]));

		var tokens = findObjs({ _subtype: "token", represents: updatedToken.get("represents") });
		propList.forEach(function(prop) {
			value = updatedToken.get(prop);
			tokens.forEach(function(tok) { tok.set(prop,value); });
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

	add = function(charID,properties,silent)
	{
		var propsRequested = properties.split("|");
		var propsRejected = _.difference(propsRequested, syncable);
		var propList = _.intersection(propsRequested, syncable);
		var propsAlready = _.intersection(propList,(state.TokenSync.syncList[charID]||[]));
		propList = _.difference(propList,(state.TokenSync.syncList[charID]||[]));
		if (silent !== true)
		{
			if (propsRejected.length > 1)
				sendChat("TokenSync","Invalid sync properties: " + _.reduce(propsRejected, function(memo, prop) { return memo + ", " + prop; }));
			else if (propsRejected.length === 1)
				sendChat("TokenSync","Invalid sync property: " + propsRejected[0]);
				
			if (propsAlready.length > 0)
				sendChat("TokenSync","Already synchronizing: " + _.reduce(propsAlready, function(memo, prop) { return memo + ", " + prop; }));
			
			if (propList.length > 0)
				sendChat("TokenSync","Now synchronizing: " + _.reduce(propList, function(memo, prop) { return memo + ", " + prop; }));
		}
		state.TokenSync.syncList[charID] = _.union( (state.TokenSync.syncList[charID]||[]), propList);
		_.each(propList,registerListener);
	},

	remove = function(charID,properties,silent)
	{
		if (properties === "")
		{	
			delete state.TokenSync.syncList[charID];
			if (silent !== true)
				sendChat("TokenSync","Removed all sync properties!");
			return;
		}
		var propList = _.intersection(properties.split("|"),syncable);
		state.TokenSync.syncList[charID] = _.difference((state.TokenSync.syncList[charID]||[]),propList);
		if (state.TokenSync.syncList[charID].length === 0)
			delete state.TokenSync.syncList[charID];
		if (silent !== true)
			sendChat("TokenSync","No longer synchronizing: " + _.reduce(propList,function(memo,prop){ return memo + ", " + prop; }));
	},

	HandleInput = function(msg)
	{

		var selected,
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
							syncProperty(tok);
							break;
						default:
							break;
					}
				}
			});
		}
	},
	
	updateSchema = function()
	{
		var oldList = _.clone(state.TokenSync.syncList);
		state.TokenSync.syncList = {};
		state.TokenSync.schema = 2.0;
		// Old schema was property: character list, new schema is character: property list
		_.each(oldList,function(charList,prop) { _.each(charList,function(charID) { add(charID,prop,true); }); });
	},
	
    checkInstall = function() {    
		state.TokenSync.propsListened = [];
        if (!state.TokenSync)
            state.TokenSync = { module: "TokenSync", syncList: {}, propsListened: [], schema: 2.0 };
		else if (_.isUndefined(state.TokenSync.schema))
			updateSchema();
		else
			_.each(_.uniq(_.flatten(_.values(state.TokenSync.syncList))),registerListener);
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
			syncProperty(existingTok);
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