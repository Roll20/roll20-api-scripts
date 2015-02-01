// Github:   https://github.com/shdwjk/Roll20API/blob/master/Mark/Mark.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Mark = Mark || (function() {
    'use strict';

    var version = 0.23,
		schemaVersion = 0.2,
		markerURL = 'https://s3.amazonaws.com/files.d20.io/images/4994795/7MdfzjgXCkaESbRbxATFSw/thumb.png?1406949835',


	fixNewObj= function(obj) {
		var p = obj.changed._fbpath,
		    new_p = p.replace(/([^\/]*\/){4}/, "/");
		obj.fbpath = new_p;
		return obj;
	},
	
	ch = function (c) {
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},

	showHelp = function() {
        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'Mark v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>Mark places a numbered marker under each token whose id is supplied '
		+'to it.  Markers are cleared when the Turn Order changes, is closed, '
		+'or when the player page changes. This script is intended to allow players '
		+'to mark their targets for discussion with the GM, usually as part of an '
		+'attack.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!mark '+ch('<')+'Token ID'+ch('>')+' ['+ch('<')+'Token ID'+ch('>')+' ... ]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This command requires a minimum of 1 parameter.  For each supplied Token ID, a marker is placed beneath it with a numbered status.  The status number starts at 1, increases with each marker placed, and resets the when markers are cleared.</p>'
			+'<p><b>Note:</b> If you are using multiple '+ch('@')+ch('{')+'target'+ch('|')+'token_id'+ch('}')+' calls in a macro, and need to mark fewer than the suppled number of arguments, simply select the same token several times.  The duplicates will be removed.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' A Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'.'
				+'</li> '
			+'</ul>'
		+'</div>'
		+'<b><span style="font-family: serif;">!mark-clear</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>Clears all the markers. (GM Only)</p>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },

	reset = function() {
		state.Mark.count=0;
		_.each(findObjs({
				type: 'graphic',
				subtype: 'token',
				imgsrc: markerURL
			}), function (g){
				g.set({
						layer: 'gmlayer',
						width: 70,
						height: 70,
						top: 35,
						left: 35,
						statusmarkers: ''
					});
			});
	},

	getStatusForCount = function(count) {
		var colorOrder=["red", "blue", "green", "brown", "purple", "pink", "yellow"];
		    return _.chain(count.toString().split(''))
			.reduce(function(memo,d){
				if(colorOrder.length) {
					 memo.push(colorOrder.shift()+'@'+d);
				} 
				return memo;
			}, [])
			.value()
			.reverse()
			.join(',');
	},

	HandleInput = function(msg) {
		var args,
			who,
			errors=[],
			playerPage,
			markerSupply,
			tokens;

		if (msg.type !== "api" ) {
			return;
		}

		who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];
		
		args = msg.content.split(/ +/);
		switch(args[0]) {
			case '!mark-clear':
				if(isGM(msg.playerid)) {
					reset();
				}
				break;

            case '!mark':
				if(1 === args.length) {
					showHelp();
					break;
				}

				tokens=_.chain(args)
					.rest()
					.uniq()
					.map(function(a){
						var t=getObj('graphic',a);
						if(! t) {
							errors.push('Argument [<b>'+a+'</b>] is not a valid token id.');
						}
						return t;
					},errors)
					.filter(function(t){
						return undefined !== t;
					})
					.value();

				if(errors.length) {
					sendChat('','/w '+who
						+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+'<div><span style="font-weight:bold;color:#990000;">Error:</span> '
							+errors.join('</div><div><span style="font-weight:bold;color:#990000;">Error:</span> ')
							+'</div>'
						+'</div>'
					);
				}

				// find player's page
				if(_.has(Campaign().get('playerspecificpages'),msg.playerid)) {
                    playerPage = Campaign().get('playerspecificpages')[msg.playerid];
				} else {
                    playerPage = Campaign().get('playerpageid');
				}

				markerSupply = findObjs({
					type: 'graphic',
					subtype: 'token',
					imgsrc: markerURL,
					layer: 'gmlayer',
					pageid: playerPage
				});
				_.each(tokens, function (t) {
					var m=markerSupply.pop(),
						size=( Math.max(t.get('width'), t.get('height') ) * 1.7),
						count=++state.Mark.count,
						status=getStatusForCount(count);

					if(m) {
						m.set({
							width: size,
							height: size,
							top: t.get('top'),
							left: t.get('left'),
							layer: 'objects',
							statusmarkers: status
						});
					} else {
						m = fixNewObj(createObj('graphic',{
							imgsrc: markerURL,
							subtype: 'token',
							pageid: playerPage,
							width: size,
							height: size,
							top: t.get('top'),
							left: t.get('left'),
							layer: 'objects',
							statusmarkers: status
						}));
					}
					toBack(m);
				});

				break;
		}

	},

    CheckInstall = function() {    
        if( ! _.has(state,'Mark') || state.Mark.version !== schemaVersion)
        {
            /* Default Settings stored in the state. */
            state.Mark = {
                version: schemaVersion,
				count: 0,
				markedtokens: {}
			};
		}
	},

	HandlePlayerPageChange = function() {
		reset();
	},

	HandleTurnOrderChange = function(obj,prev) {
		var to = JSON.parse(obj.get("turnorder")),
			po = JSON.parse(prev.turnorder);

		if( (_.isArray(to) && _.isArray(po) && !_.isEqual(to[0],po[0]) ) || (_.isArray(to) && ! _.isArray(po)) ) {
			reset();
		}
	},

	HandleInitiativePageChange = function(obj) {
		if(false === obj.get('initiativepage')) {
			reset();
		}
	},

	RegisterEventHandlers = function() {
		on('chat:message', HandleInput);
		on('change:campaign:playerpageid', HandlePlayerPageChange);
		on('change:campaign:turnorder', HandleTurnOrderChange);
		on('change:campaign:initiativepage', HandleInitiativePageChange);
	};

	return {
		RegisterEventHandlers: RegisterEventHandlers,
		CheckInstall: CheckInstall

	};
}());

on("ready",function(){
	'use strict';

    if("undefined" !== typeof isGM && _.isFunction(isGM)) {
        Mark.CheckInstall();
        Mark.RegisterEventHandlers();
    } else {
        log('--------------------------------------------------------------');
        log('Mark requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }
});
