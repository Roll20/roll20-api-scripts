// By:       Kastion
// Contact:  https://app.roll20.net/users/3173313/kastion

var moveLighting = moveLighting || (function(){
    'use strict';

	var showHelp = function() {
        sendChat('Move Lighting Script',
            '/w gm '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'moveLighting'+
		'<div style="clear: both"></div>'+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Allows the GM to move what layer a lighting path is on.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;"><b><span style="font-family: serif;">!movelight [layer] [ID]</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px; font-size:12px;">'+
			'Valid Layer Options Are: map, objects, gmlayer, walls'+
		'</div>'+
	'</div>'
     );
    },
    
	handleInput = function(msg) {
    
		if ( "api" !== msg.type || !playerIsGM(msg.playerid) ) {
			return;
		}

        let parts = msg.content.split(/\s+--\s+/);
		let args = parts[0].split(/\s+/);
		
		switch(args[0]) {
			case '!movelight': {
                var valid_layer = 0, new_layer = args[1];
                
                switch (new_layer)
                {
                    case "gmlayer":
                    case "walls":
                    case "objects":
                    case "map":
                    valid_layer = 1;
                    break;                    
                }
                
                if (valid_layer == 1)
                {
                      var path_obj = findObjs({_type: "path", _id: args[2]})[0];
    				  if (path_obj) 
    				  {
        			      path_obj.set("layer", new_layer);
    				  } else {
                        sendChat('Move Lighting Script', '/w gm No path object found with that ID.');
    				  }
			    } else {
                    sendChat('Move Lighting Script', '/w gm Invalid Layer Specified.');
                    showHelp();
			    }
				break;
		}
	  }
	},
	
	checkInstall = function()
	{
	    var script_version = "0.1.4";
        if( ! state.moveLighting ) {
                state.moveLighting = {
                    version: script_version,
                };
            }    
        
        if (state.moveLighting.version != script_version)
            state.moveLighting.version = script_version;
            
            log("-=> Move Lighting Script v"+state.moveLighting.version+" Initialized <=-")
	},

    	
	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};

}());

on("ready", function() {
    'use strict';
    
	moveLighting.CheckInstall();
	moveLighting.RegisterEventHandlers();        
});
