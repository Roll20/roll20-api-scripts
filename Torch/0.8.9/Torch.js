// Github:   https://github.com/shdwjk/Roll20API/blob/master/Torch/Torch.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Torch = Torch || (function() {
    'use strict';

    var version = '0.8.9',
        lastUpdate = 1478016891,
        schemaVersion = 0.1,
		flickerURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
		flickerPeriod = 400,
		flickerDeltaLocation = 2,
		flickerDeltaRadius = 0.1,
		flickerDeltaAngle = 5,
		flickerInterval = false,

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

	showHelp = function(who) {
        sendChat('',
            '/w "'+who+'" '+
    '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
        '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
            'Torch v'+version+
        '</div>'+
        '<div style="padding-left:10px;margin-bottom:3px;">'+
            '<p>Torch provides commands for managing dynamic lighting.  Supplying a first argument of <b>help</b> to any of the commands displays this help message, as will calling !torch or !snuff with nothing supplied or selected.</p>'+
            '<p>Torch now supports <b><i>Jack Taylor</i></b> inspired flickering lights.  Flicker lights are only active on pages where a player is (GMs, drag yourself to other pages if you don'+ch("'")+'t want to move the party.) and are persisted in the state.  Flicker lights can be used in addition to regular lights as they are implemented on a separate invisible token that follows the nomal token.</p>'+
        '</div>'+
        '<b>Commands</b>'+
        '<div style="padding-left:10px;">'+
            '<b><span style="font-family: serif;">!torch '+ch('[')+ch('<')+'Radius'+ch('>')+' '+ch('[')+ch('<')+'Dim Start'+ch('>')+' '+ch('[')+ch('<')+'All Players'+ch('>')+'  '+ch('[')+ch('<')+'Token ID'+ch('>')+ch('|')+ch('<')+'--Angle'+ch('>')+' ... '+ch(']')+ch(']')+ch(']')+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Sets the light for the selected/supplied tokens.  Only GMs can supply token ids to adjust.</p>'+
                '<p><b>Note:</b> If you are using multiple '+ch('@')+ch('{')+'target'+ch('|')+'token_id'+ch('}')+' calls in a macro, and need to adjust light on fewer than the supplied number of arguments, simply select the same token several times.  The duplicates will be removed.</p>'+
                '<ul>'+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Radius'+ch('>')+'</span></b> '+ch('-')+' The radius that the light extends to. (Default: 40)'+
                    '</li> '+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Dim Start'+ch('>')+'</span></b> '+ch('-')+' The radius at which the light begins to dim. (Default: Half of Radius )'+
                    '</li> '+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'All Players'+ch('>')+'</span></b> '+ch('-')+' Should all players see the light, or only the controlling players (Darkvision, etc). Specify one of <i>1, on, yes, true, sure, yup, or -</i> for yes, anything else for no.  (Default: yes)'+
                    '</li> '+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' A Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'.'+
                    '</li> '+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'--Angle'+ch('>')+'</span></b> '+ch('-')+' The angle of the light arc of the light. (Default: 360)'+
                    '</li> '+
                '</ul>'+
            '</div>'+
            '<b><span style="font-family: serif;">!snuff '+ch('[')+ch('<')+'Token ID'+ch('>')+' ... '+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Turns off light for the selected/supplied tokens. Only GMs can supply token ids to adjust.</p>'+
                '<p><b>Note:</b> If you are using multiple '+ch('@')+ch('{')+'target'+ch('|')+'token_id'+ch('}')+' calls in a macro, and need to adjust light on fewer than the supplied number of arguments, simply select the same token several times.  The duplicates will be removed.</p>'+
                '<ul>'+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' A Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'.'+
                    '</li> '+
                '</ul>'+
            '</div>'+
            '<b><span style="font-family: serif;">!flicker-on '+ch('[')+ch('<')+'Radius'+ch('>')+' '+ch('[')+ch('<')+'Dim Start'+ch('>')+' '+ch('[')+ch('<')+'All Players'+ch('>')+'  '+ch('[')+ch('<')+'Token ID'+ch('>')+ch('|')+ch('<')+'--Angle'+ch('>')+' ... '+ch(']')+ch(']')+ch(']')+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Behaves identically to !torch, save that it creates a flickering light.</p>'+
            '</div>'+
            '<b><span style="font-family: serif;">!flicker-off '+ch('[')+ch('<')+'Token ID'+ch('>')+' ... '+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Behaves identically to !snuff, save that it affects the flickering light.</p>'+
            '</div>'+
            '<b><span style="font-family: serif;">!daytime '+ch('[')+ch('<')+'Token ID'+ch('>')+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Turns off dynamic lighting for the current player page, or the page of the selected/supplied token.</p>'+
                '<ul>'+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' A Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'.'+
                    '</li> '+
                '</ul>'+
            '</div>'+
            '<b><span style="font-family: serif;">!nighttime '+ch('[')+ch('<')+'Token ID'+ch('>')+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Turns on dynamic lighting for the current player page, or the page of the selected/supplied token.</p>'+
                '<ul>'+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' A Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'.'+
                    '</li> '+
                '</ul>'+
            '</div>'+
            '<b><span style="font-family: serif;">!global-light '+ch('[')+ch('<')+'Token ID'+ch('>')+ch(']')+'</span></b>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<p>Toggles Global Illumination for the current player page, or the page of the selected/supplied token.</p>'+
                '<ul>'+
                    '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                        '<b><span style="font-family: serif;">'+ch('<')+'Token ID'+ch('>')+'</span></b> '+ch('-')+' A Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'.'+
                    '</li> '+
                '</ul>'+
            '</div>'+
        '</div>'+
    '</div>'
            );
    },
	setFlicker = function(o,r,d,p,a) {
		var found = _.findWhere(state.Torch.flickers, {parent: o.id}),
			fobj;

		if( found ) {
			fobj = getObj('graphic',found.id);
			if(fobj) {
				fobj.set({
                    layer: 'walls',
					showname: false,
					aura1_radius: '',
					showplayers_aura1: false,
					light_radius: r,
					light_dimradius: d,
					light_otherplayers: p,
                    light_angle: a
				});
			} else {
				delete state.Torch.flickers[found.id];
			}
		} 
		
		if(!fobj) {
			// new flicker
			fobj =createObj('graphic',{
				imgsrc: flickerURL,
				subtype: 'token',
				name: 'Flicker',
				pageid: o.get('pageid'),
				width: 70,
				height: 70,
				top: o.get('top'),
				left: o.get('left'),
				layer: 'walls',
				light_radius: r,
				light_dimradius: d,
				light_otherplayers: p,
                light_angle: a

			});
		}
		toBack(fobj);
		state.Torch.flickers[fobj.id]={
			id: fobj.id,
			parent: o.id,
			active: true,
			page: o.get('pageid'),
			light_radius: r,
			light_dimradius: d,
            light_angle: a

		};
	},

	clearFlicker = function(fid) {
		var f = getObj('graphic',fid);
        if(f) {
            f.remove();
        }
		delete state.Torch.flickers[fid];
	},
	
	handleInput = function(msg) {
		var args, radius, dim_radius, arc_angle=360, other_players, page, obj, objs=[],who;

		if (msg.type !== "api") {
			return;
		}
		who=getObj('player',msg.playerid).get('_displayname');

		args = msg.content.split(" ");
		switch(args[0]) {
			case '!torch':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 5)) {
					showHelp(who);
					return;
				}
                radius = parseInt(args[1],10) || 40;
                dim_radius = parseInt(args[2],10) || (radius/2);
				other_players = _.contains([1,'1','on','yes','true','sure','yup','-'], args[3] || 1 );

                objs = _.chain(args)
                    .rest(4)
                    .uniq()
                    .filter(function(a){
                        var angle=a.match(/^--(\d+)$/);
                        if(angle){
                            arc_angle=(Math.min(360,Math.max(0,angle[1])));
                            return false;
                        }
                        return true;
                    })
                    .map(function(t){
                        return getObj('graphic',t);
                    })
                    .filter(()=>playerIsGM(msg.playerid))
                    .reject(_.isUndefined)
                    .value();

                _.each(_.union(objs,_.map(msg.selected,function (o) {
                    return getObj(o._type,o._id);
                })), function(o){
                    o.set({
                        light_radius: radius,
                        light_dimradius: dim_radius,
                        light_otherplayers: other_players,
                        light_angle: arc_angle
                    });
				});
				break;

            case '!snuff':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 2)) {
					showHelp(who);
					return;
				}

				if(playerIsGM(msg.playerid)) {
					_.chain(args)
						.rest(1)
						.uniq()
						.map(function(t){
							return getObj('graphic',t);
						})
						.reject(_.isUndefined)
						.each(function(t) {
							t.set({
								light_radius: '',
								light_dimradius: '',
								light_otherplayers: false,
                                light_angle: 360
							});
						});
				}
				_.each(msg.selected,function (o) {
                    getObj(o._type,o._id).set({
                        light_radius: '',
                        light_dimradius: '',
                        light_otherplayers: false,
                        light_angle: 360
                    });
                });
                break;

			case '!daytime':
				if((args[1]||'').match(/^(--)?help$/) ) {
					showHelp(who);
					return;
				}
				if(playerIsGM(msg.playerid)) {
					if(msg.selected) {
						obj=getObj('graphic', msg.selected[0]._id);
					} else if(args[1]) {
						obj=getObj('graphic', args[1]);
					}
					page = getObj('page', (obj && obj.get('pageid')) || Campaign().get('playerpageid'));

					if(page) {
						page.set({
							showlighting: false
						});
						sendChat('','/w gm It is now <b>Daytime</b> on '+page.get('name')+'!');
					}
				}
				break;

			case '!nighttime':
				if((args[1]||'').match(/^(--)?help$/) ) {
					showHelp(who);
					return;
				}
				if(playerIsGM(msg.playerid)) {
					if(msg.selected) {
						obj=getObj('graphic',msg.selected[0]._id);
					} else if(args[1]) {
						obj=getObj('graphic', args[1]);
					}
					page = getObj('page', (obj && obj.get('pageid')) || Campaign().get('playerpageid'));

					if(page) {
						page.set({
							showlighting: true
						});
						sendChat('','/w gm It is now <b>Nighttime</b> on '+page.get('name')+'!');
					}
				}
				break;

			case '!global-light':
				if((args[1]||'').match(/^(--)?help$/) ) {
					showHelp(who);
					return;
				}
				if(playerIsGM(msg.playerid)) {
					if(msg.selected) {
						obj=getObj('graphic', msg.selected[0]._id);
					} else if(args[1]) {
						obj=getObj('graphic', args[1]);
					}
					page = getObj('page', (obj && obj.get('pageid')) || Campaign().get('playerpageid'));

					if(page) {
						page.set({
							lightglobalillum: !(page.get('lightglobalillum'))
						});
						sendChat('','/w gm Global Illumination is now '+(page.get('lightglobalillum')?'<span style="font-weight:bold;color:#090;">ON</span>':'<span style="font-weight:bold;color:#900;">OFF</span>' )+' on page <b>'+page.get('name')+'</b>!');
					}
				}
				break;

			case '!flicker-on':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 5)) {
					showHelp(who);
					return;
				}
                radius = parseInt(args[1],10) || 40;
                dim_radius = parseInt(args[2],10) || (radius/2);
				other_players = _.contains([1,'1','on','yes','true','sure','yup','-'], args[3] || 1 );

                objs=_.chain(args)
                    .rest(4)
                    .uniq()
                    .filter(function(a){
                        var angle=a.match(/^--(\d+)$/);
                        if(angle){
                            arc_angle=(Math.min(360,Math.max(0,angle[1])));
                            return false;
                        }
                        return true;
                    })
                    .filter(()=>playerIsGM(msg.playerid))
                    .map(function(t){
                        return getObj('graphic',t);
                    })
                    .reject(_.isUndefined)
                    .value();

                _.each(_.union(objs,_.map(msg.selected,function (o) {
                    return getObj(o._type,o._id);
                })), function(o){
					setFlicker(o, radius, dim_radius, other_players,arc_angle);
				});

				break;

			case '!flicker-off':
				if((args[1]||'').match(/^(--)?help$/) || ( !_.has(msg,'selected') && args.length < 2)) {
					showHelp(who);
					return;
				}
                
				if(playerIsGM(msg.playerid)) {
					objs=_.chain(args)
						.rest(1)
						.uniq()
						.value();
				}
                objs=_.union(objs,_.pluck(msg.selected,'_id'));
				_.each(state.Torch.flickers, function(f) {
					if( _.contains(objs, f.parent)) {
						clearFlicker(f.id);
					}
				});
				break;

		}
	},
	animateFlicker = function() {
		var pages = _.union([Campaign().get('playerpageid')], _.values(Campaign().get('playerspecificpages')));

		_.chain(state.Torch.flickers)
			.where({active:true})
			.filter(function(o){
				return _.contains(pages,o.page);
			})
			.each(function(fdata){
				var o = getObj('graphic',fdata.parent),
					f = getObj('graphic',fdata.id),
					dx, dy, dr, da;

				if(!o) {
					clearFlicker(fdata.id);
				} else {
					if(!f) {
						delete state.Torch.flickers[fdata.id];
					} else {
						dx = randomInteger(2 * flickerDeltaLocation)-flickerDeltaLocation;
						dy = randomInteger(2 * flickerDeltaLocation)-flickerDeltaLocation;
						dr = randomInteger(2 * (fdata.light_radius*flickerDeltaRadius)) - (fdata.light_radius*flickerDeltaRadius);
						da = randomInteger(2 * flickerDeltaAngle)-flickerDeltaAngle;
						f.set({
							top: o.get('top')+dy,
							left: o.get('left')+dx,
							light_radius: fdata.light_radius+dr,
							light_angle: ((360 === fdata.light_angle) ? (360) : (Math.min(360,Math.max(fdata.light_angle+da,0)))) || 360
						});
					}
				}
			});
	},

	handleTokenDelete = function(obj) {
		var found = _.findWhere(state.Torch.flickers, {parent: obj.id});

		if(found) {
			clearFlicker(found.id);
		} else {
			found = _.findWhere(state.Torch.flickers, {id: obj.id});
			if(found) {
				delete state.Torch.flickers[obj.id];
			}
		}
	},

	checkInstall = function() {
        log('-=> Torch v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'Torch') || state.Torch.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            /* Default Settings stored in the state. */
            state.Torch = {
				version: schemaVersion,
				flickers: {}
			};
		}

		flickerInterval = setInterval(animateFlicker,flickerPeriod);
	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
		on('destroy:graphic', handleTokenDelete);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	Torch.CheckInstall();
	Torch.RegisterEventHandlers();
});
