var TokenSync = TokenSync || (function() {
    'use strict';
    var version = '1.6',
    lastUpdate = 1458321490,
    
	syncable = [ "imgsrc", "bar1_link", "bar2_link", "bar3_link", "width", "height", "rotation", "layer", "isdrawing", "flipv", "fliph", "name", "aura1_radius", "aura2_radius", "aura1_color", "aura2_color", "aura1_square", "aura2_square", "tint_color", "statusmarkers", "showname", "showplayers_name", "showplayers_bar1", "showplayers_bar2", "showplayers_bar3", "showplayers_aura1", "showplayers_aura2", "light_radius", "light_dimradius", "light_otherplayers", "light_hassight", "light_angle", "light_losangle", "light_multiplier" ],
	propsListened,
		
	syncProperty = function(updatedToken, properties) {
		var propList = _.intersection(
				(properties && properties.split && properties.split("|")) || syncable,
				state.TokenSync.syncList[updatedToken.get("represents")] || []
			),
			update = _.reduce(propList,function(m,p){
				m[p] = updatedToken.get(p);
				return m;
			},{});
		if (!Object.keys(update).length)
			return;
		_.each(findObjs({ _subtype: "token", represents: updatedToken.get("represents")}),function(t){
			t.set(update);
		});
	},	

	registerListener = function(prop)
	{
		// Keep track of what event handlers we've registered; since we can't unregister (AFAIK), we don't want to acidentally register the same event multiple times
		if (!_.contains(propsListened,prop))
		{
			propsListened[propsListened.length] = prop;
			on("change:token:"+prop, function(obj) { syncProperty(obj,prop); });
		}
	},
	
	usage = function(who) { sendChat("TokenSync", "Usage: !tokensync [--add property(|properties)] [--remove property(|properties)] [--removeall] [--forcesync (property(|properties))]"); },
	
    add = function(charID,properties,silent) {
		var propsRequested = properties.split("|");
		var propsRejected = _.difference(propsRequested, syncable);
		var propList = _.intersection(propsRequested, syncable);
		var propsAlready = _.intersection(propList,(state.TokenSync.syncList[charID]||[]));
		propList = _.difference(propList,(state.TokenSync.syncList[charID]||[]));
		if (!silent) {
			if (propsRejected.length) sendChat("TokenSync","**Invalid sync propert"+(1===propsRejected.length ?'y':'ies')+":** " +propsRejected.join());
			if (propsAlready.length) sendChat("TokenSync","**Already synchronizing:** " + propsAlready.join());
			if (propList.length) sendChat("TokenSync","**Now synchronizing:** " +propList.join());
		}
		state.TokenSync.syncList[charID] = _.union( (state.TokenSync.syncList[charID]||[]), propList);
		_.each(propList,registerListener);
    },
	
	remove = function(charID,properties,silent)
	{
		if (properties === "")
		{	
			delete state.TokenSync.syncList[charID];
			if (!silent) sendChat("TokenSync","**Removed all sync properties!**");
			return;
		}
		var propList = _.intersection(properties.split("|"),syncable);
		state.TokenSync.syncList[charID] = _.difference((state.TokenSync.syncList[charID]||[]),propList);
		if (state.TokenSync.syncList[charID].length === 0)
			delete state.TokenSync.syncList[charID];
		if (!silent) sendChat("TokenSync","**No longer synchronizing:** " + propList.join());
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
		propsListened = [];
        if (!state.TokenSync)
            state.TokenSync = { module: "TokenSync", syncList: {}, schema: 2.0 };
		else if (_.isUndefined(state.TokenSync.schema))
			updateSchema();
		else
			_.each(_.uniq(_.flatten(_.values(state.TokenSync.syncList))),registerListener);
		if (state.TokenSync.propsListened)
			delete state.TokenSync.propsListened;
		log('-=> TokenSync v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},
	
	syncNewToken = function(newTok) {
		var done = false,
			charID = newTok.get('represents');
		
		if (!_.contains(Object.keys(state.TokenSync.syncList,charID))) return;
		filterObjs(function(o){
			if( !done &&
				'graphic'===o.get('type') &&
				'token'===o.get('subtype') && 
				o.get('represents') === charID &&
				o.id !== newTok.id )
			{
				syncProperty(o);
				done = true;
			}
			return false;
		});
	},
	
	removeDeletedCharacter = function(oldChar) { remove(oldChar.get("_id"),"",true); },

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