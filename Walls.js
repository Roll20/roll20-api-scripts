// Github:   https://github.com/shdwjk/Roll20API/blob/master/Walls/Walls.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Walls = Walls || {
	version: 0.1,
	schemaVersion: 0.2,

	CheckInstall: function() {
		if( ! _.has(state,'Walls') || state.Walls.schemaVersion != Walls.schemaVersion)
		{
			/* Default Settings stored in the state. */
			state.Walls = {
				version: Walls.schemaVersion,
				work: {}
			}
		}
		Walls._ResetWork();
	},
	_ResetWork: function() {
		state.Walls.work={
			accumulating: {},
			mapGraphic: {
				id: undefined,
				x: 0.0,
				y: 0.0,
				width: 1.0,
				height: 1.0
			},
			scale: {
				x: 1.0,
				y: 1.0
			},
			completedPaths: [],
			workPath: []
		};
	},
	HandleInput: function(tokens,msg) {
		switch(tokens[0])
		{
			case 'begin':
				Walls._ResetWork();
				if(_.has(msg,'selected') && 1==msg.selected.length && 'graphic'== msg.selected[0]._type)
				{
					var map=getObj('graphic',msg.selected[0]._id);
					if(undefined != map)
						{
							var left=map.get('left');
							var top =map.get('top');
							var width=map.get('width');
							var height=map.get('height');

							state.Walls.work.mapGraphic.id=map.id;
							state.Walls.work.mapGraphic.x=Math.round((left-(width/2))*100)/100;
							state.Walls.work.mapGraphic.y=Math.round((top-(height/2))*100)/100;
							state.Walls.work.mapGraphic.height=height;
							state.Walls.work.mapGraphic.width=width;
						}
				}
				else
				{
					log('Walls: Warning - select exactly one graphic on the map layer.');
				}
				break;

			case 'end':
				if(state.Walls.work.workPath.length)
				{
					state.Walls.work.completedPaths.push(state.Walls.work.workPath);
					state.Walls.work.workPath=[];
				}
				if(undefined != state.Walls.work.mapGraphic.id)
				{
					var map=getObj('graphic',state.Walls.work.mapGraphic.id);
					if(undefined != map)
					{
						_.each(state.Walls.work.completedPaths,function(p){
							// find bounding box
							var lowX    = 1000000.0,
								centerX = 0,
								highX   = 0,
								width   = 0,
								lowY    = 1000000.0,
								centerY = 0,
								highY   = 0,
								height  = 0;

							_.each(p,function(elem){
								switch(elem[0])
								{
									case 'M':
										lowX  = _.min([lowX,elem[1]]);
										highX = _.max([highX,elem[1]]);
										lowY  = _.min([lowY,elem[2]]);
										highY = _.max([highY,elem[2]]);
										break;

									case 'C':
										lowX  = _.min([lowX,elem[5]]);
										highX = _.max([highX,elem[5]]);
										lowY  = _.min([lowY,elem[6]]);
										highY = _.max([highY,elem[6]]);
										break;

									default:
										break;
								}
							});
							width   = ( highX - lowX );
							height  = ( highY - lowY );
							centerX = lowX + ( width  / 2 ) + state.Walls.work.mapGraphic.x;
							centerY = lowY + ( height / 2 ) + state.Walls.work.mapGraphic.y;

							var newP = []
							// re-bias points
							_.each(p,function(elem){
								switch(elem[0])
								{
									case 'M':
										newP.push(['M',elem[1]-lowX,elem[2]-lowY]);
									break;
									case 'C':
										newP.push(['C',elem[1]-lowX,elem[2]-lowY,elem[3]-lowX,elem[4]-lowY,elem[5]-lowX,elem[6]-lowY]);
									break;
									default:
										break;
								}
							});

							var pathstring=JSON.stringify(newP);

							var path=createObj('path',{
								pageid: map.get('pageid'),
								stroke: '#ff0000',
								left: centerX,
								top: centerY,
								width: width,
								height: height,
								stroke_width: 5,
								layer: 'walls',
								path: pathstring
							});

							path=fixNewObject(path);
						});
					}
					sendChat('','/w gm Walls finished.');
				}
				break;

			case 'viewbox':
				state.Walls.work.scale.x=state.Walls.work.mapGraphic.width/tokens[1];
				state.Walls.work.scale.y=state.Walls.work.mapGraphic.height/tokens[2];
				break;

			case 'moveto':
				if(state.Walls.work.workPath.length)
				{
					state.Walls.work.completedPaths.push(state.Walls.work.workPath);
					state.Walls.work.workPath=[];
				}
				state.Walls.work.workPath.push(['M',(tokens[1]*state.Walls.work.scale.x),(tokens[2]*state.Walls.work.scale.y)]);
				break;

			case 'curveto':
				state.Walls.work.workPath.push(['C',
				   (tokens[1]*state.Walls.work.scale.x), (tokens[2]*state.Walls.work.scale.y),
				   (tokens[3]*state.Walls.work.scale.x), (tokens[4]*state.Walls.work.scale.y),
				   (tokens[5]*state.Walls.work.scale.x), (tokens[6]*state.Walls.work.scale.y)
				]);
				break;
		}
	},
	RegisterEventHandlers: function(){        
		on("chat:message", function (msg) {
			/* Exit if not an api command */
			if (msg.type != "api") return;

			// get minimal player name (hopefully unique!)
			var who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

			var tokenized = msg.content.split(" ");
			var command = tokenized[0];

			switch(command)
			{
				case "!walls":
					if(isGM(msg.playerid))
					{
						Walls.HandleInput(_.rest(tokenized),msg);
					}
					break;
			}
		});
	}

};


on("ready",function(){
	var Has_IsGM=false;
	try {
		_.isFunction(isGM);
		Has_IsGM=true;
	}
	catch (err)
	{
		log('--------------------------------------------------------------');
		log('Walls requires the isGM module to work.');
		log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625')
		log('--------------------------------------------------------------');
	}

	if( Has_IsGM )
	{
		Walls.CheckInstall(); 
		Walls.RegisterEventHandlers();
	}
});

// Utility Function
var fixNewObject = fixNewObject || function(obj){
	var p = obj.changed._fbpath;
	var new_p = p.replace(/([^\/]*\/){4}/, "/");
	obj.fbpath = new_p;
	return obj;
};

