// Github:   https://github.com/shdwjk/Roll20API/blob/master/WeightedDice/WeightedDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var WeightedDice = WeightedDice || {
    version: 0.3,
    schemaVersion: 0.1,

    CheckInstall: function() {
        log('-=> WeightedDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

		if( ! _.has(state,'WeightedDice') || state.WeightedDice.schemaVersion != WeightedDice.schemaVersion)
            log('  > Updating Schema to v'+schemaVersion+' <');
		{
			/* Default Settings stored in the state. */
			state.WeightedDice = {
				version: WeightedDice.schemaVersion
			}
		}
	},
    
    HandleInput: function(tokens,msg) {
        
        var sides = parseInt(tokens[0]);
        var minroll = parseInt(tokens[1]);

        if(
            tokens.length <2 
            || 2 != tokens.length 
            || _.isNull(sides) 
            || !_.isNumber(sides) 
            || _.isNull(minroll) 
            || !_.isNumber(minroll) 
            || sides < minroll
        )
        {
            sendChat('','/w gm Usage: !weighted-die [number of sides] [minimum roll number]');
            return;
        }
        
        var tableName='d'+sides+'min'+minroll;
        // see if it's already defined
        var tables=findObjs({type: 'rollabletable', name: tableName});
        if(tables.length)
        {
            sendChat('','/w gm Table '+tableName+' already exists.');
        }
        else
        {
            var newTable=createObj('rollabletable',{name: tableName});
            _.each(_.range(minroll,(sides+1)), function(r){
                var weight = ( (r == minroll) ? minroll : 1);
                var newTableItem=createObj('tableitem',{
                    _rollabletableid: newTable.id,
                    name: r,
                    weight: weight
                });
            });
            sendChat('','/w gm Table '+tableName+' created.');
        }
    },
    
    RegisterEventHandlers: function(){        
		on("chat:message", function (msg) {
			/* Exit if not an api command */
			if (msg.type != "api") return;


			var tokenized = msg.content.split(" ");
			var command = tokenized[0];

			switch(command)
			{
				case "!weighted-die":
					if(playerIsGM(msg.playerid))
					{
						WeightedDice.HandleInput(_.rest(tokenized),msg);
					}
					break;
			}
		});
	}
};

on("ready",function(){
	WeightedDice.CheckInstall(); 
	WeightedDice.RegisterEventHandlers();
});
