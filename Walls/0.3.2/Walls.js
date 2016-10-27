// Github:   https://github.com/shdwjk/Roll20API/blob/master/Walls/Walls.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Walls = Walls || (function() {
    'use strict';

	var version = '0.3.2',
        lastUpdate = 1477523761,
        schemaVersion = 0.4,
		regex = {
			colors: /^(?:#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?|transparent)$/
		},

	resetWork = function() {
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
			color: {
				stroke: '#ff0000',
				fill: 'transparent'
			},
			strokeWidth: 5,
			completedPaths: [],
			workPath: []
		};
	},

	checkInstall = function() {
        log('-=> Walls v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

		if( ! _.has(state,'Walls') || state.Walls.schemaVersion !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');

			state.Walls = {
				version: schemaVersion,
				work: {}
			};
		}
		resetWork();
	},

	handleInput = function(tokens,msg) {
        var map,left,top,width,height;

		switch(tokens[0]) {

			case 'begin':
				resetWork();
				if(_.has(msg,'selected') && 1===msg.selected.length && 'graphic'=== msg.selected[0]._type) {
					map=getObj('graphic',msg.selected[0]._id);
					if(undefined !== map)
						{
							left=map.get('left');
							top =map.get('top');
							width=map.get('width');
							height=map.get('height');

							state.Walls.work.mapGraphic.id=map.id;
							state.Walls.work.mapGraphic.x=Math.round((left-(width/2))*100)/100;
							state.Walls.work.mapGraphic.y=Math.round((top-(height/2))*100)/100;
							state.Walls.work.mapGraphic.height=height;
							state.Walls.work.mapGraphic.width=width;
						}
				} else {
					log('Walls: Warning - select exactly one graphic on the map layer.');
				}
				break;

			case 'end':
				if(state.Walls.work.workPath.length) {
					state.Walls.work.completedPaths.push(state.Walls.work.workPath);
					state.Walls.work.workPath=[];
				}
				if(undefined !== state.Walls.work.mapGraphic.id) {
					map=getObj('graphic',state.Walls.work.mapGraphic.id);
					if(undefined !== map) {
						_.each(state.Walls.work.completedPaths,function(p){
							// find bounding box
							var lowX    = 1000000.0,
								centerX = 0,
								highX   = 0,
								width   = 0,
								lowY    = 1000000.0,
								centerY = 0,
								highY   = 0,
								height  = 0,
                                newP, pathstring;

							_.each(p,function(elem){
								switch(elem[0]) {
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

							newP = [];
							// re-bias points
							_.each(p,function(elem){
								switch(elem[0]) {
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

							pathstring=JSON.stringify(newP);

							createObj('path',{
								pageid: map.get('pageid'),
								stroke: state.Walls.work.color.stroke,
								fill: state.Walls.work.color.fill,
								left: centerX,
								top: centerY,
								width: width,
								height: height,
								stroke_width: state.Walls.work.strokeWidth,
								layer: 'walls',
								path: pathstring
							});

						});
					}
					sendChat('','/w gm Walls finished.');
				}
				break;

			case 'viewbox':
				state.Walls.work.scale.x=state.Walls.work.mapGraphic.width/tokens[1];
				state.Walls.work.scale.y=state.Walls.work.mapGraphic.height/tokens[2];
				break;

			case 'strokewidth': {
					let w = parseFloat(tokens[1]);
					if(_.isNumber(w) && ( 0<w && w<100)){
						state.Walls.work.strokeWidth = w;
					}
				}
				break;

			case 'strokecolor':
				if(tokens[1].match(regex.colors)){
					state.Walls.work.color.stroke = tokens[1];
				}
				break;

			case 'fillcolor':
				if(tokens[1].match(regex.colors)){
					state.Walls.work.color.fill = tokens[1];
				}
				break;

			case 'moveto':
				if(state.Walls.work.workPath.length) {
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

	registerEventHandlers = function(){        
		on("chat:message", function (msg) {
            var tokenized, command;
			if (msg.type !== "api") {
                return;
            }

			tokenized = msg.content.split(" ");
			command = tokenized[0];

			switch(command) {
				case "!walls":
					if(playerIsGM(msg.playerid)) {
						handleInput(_.rest(tokenized),msg);
					}
					break;
			}
		});
	};

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());


on("ready",function(){
    'use strict';

	Walls.CheckInstall(); 
	Walls.RegisterEventHandlers();
});

