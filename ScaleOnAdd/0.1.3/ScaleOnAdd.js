// Github:   https://github.com/shdwjk/Roll20API/blob/master/ScaleOnAdd/ScaleOnAdd.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var ScaleOnAdd = ScaleOnAdd || (function() {
    'use strict';

    var version = '0.1.3',
        lastUpdate = 1515684866,
        schemaVersion = 0.1,
        lastAddId = null,

    checkInstall = function() {
        log('-=> ScaleOnAdd v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'ScaleOnAdd') || state.ScaleOnAdd.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.ScaleOnAdd = {
                version: schemaVersion,
                active: false,
                width: 420,
                height: 420
            };
        }
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
    getConfigOption_Active = function() {
        var text = (state.ScaleOnAdd.active ? 'On' : 'Off' );
        return '<div>'
            +'ScaleOnAdd is currently <b>'
                +text
            +'</b> '
            +'<a href="!scale-on-add --toggle">'
                +'Toggle'
            +'</a>'
        +'</div>';
    },
    getConfigOption_Scale = function() {
        return '<div>'
            +'Scale size is <b>'
                +state.ScaleOnAdd.width + 'x' + state.ScaleOnAdd.height
            +'</b> '
            +'<a href="!scale-on-add --set ?{Scale size: number '+ch('[')+'number'+ch(']')+'|'+state.ScaleOnAdd.width+( (state.ScaleOnAdd.width!==state.ScaleOnAdd.height)? (' '+state.ScaleOnAdd.height):'')+'}">'
                +'Set Scale'
            +'</a>'
        +'</div>';
    },
    
    showHelp = function(who){
        sendChat('',
            '/w "'+who+'" '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'ScaleOnAdd v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>ScaleOnAdd automatically adjusts the dimentions of new graphics when it is active.  This is handy for dragging in tiles of a known size.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!scale-on-add '+ch('[')+'--help'+ch('|')+'--toggle'+ch('|')+'--on'+ch('|')+'--off'+ch('|')+'--set '+ch('<')+'number'+ch('>')+' '+ch('[')+'number'+ch(']')+ch(']')+'</span></b>'
        +'<div style="padding-left: 10px;">'
            +'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+'--help'+'</span></b> - Shows this help.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+'--toggle'+'</span></b> - Turns ScaleOnAdd off it it is on, or on if it is off.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+'--on'+'</span></b> - Turns ScaleOnAdd on.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+'--off'+'</span></b> - Turns ScaleOnAdd off.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">'+'--set '+ch('<')+'number'+ch('>')+' '+ch('[')+'number'+ch(']')+'</span></b> - Sets the dimensions for scaling added graphics.  If one number is specified, it will be used for width and height, if two are specified, the first is width and the second is height.'
				+'</li> '
            +'</ul>'
        +'</div>'
        + getConfigOption_Active()
        + getConfigOption_Scale()
    +'</div>'
+'</div>');
    },
    
    sendNotice = function(note, title){
        title = (title ? '<h4>'+title+'</h4>' : '');
        sendChat(
            'ScaleOnAdd',
            '/w gm '+
            '<div>'+
                title +
                note +
            '</div>'
        );
    },

    handleInput = function(msg_orig) {
        var args,
            msg=_.clone(msg_orig),
            who;

        if (msg.type !== "api") {
            return;
        }

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
                    var ti=_.reduce(v.results.rolls,function(m2,v2){
                        if(_.has(v2,'table')){
                            m2.push(_.reduce(v2.results,function(m3,v3){
                                m3.push(v3.tableItem.name);
                                return m3;
                            },[]).join(', '));
                        }
                        return m2;
                    },[]).join(', ');
					m['$[['+k+']]']= (ti.length && ti) || v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}

        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!scale-on-add':
				if( !args[0] || args[0].match(/^(--)?help$/) ) {
					showHelp(who);
					return;
				}
                _.each(args,function(a){
                    var h=0,
                        w=0,
                        a2=a.split(/\s+/);
                    a=a2[0];

                    switch(a){
                        case 'toggle': 
                            state.ScaleOnAdd.active=!state.ScaleOnAdd.active;
                            sendChat('','/w gm '+getConfigOption_Active());
                            break;
                        case 'on': 
                            state.ScaleOnAdd.active=true;
                            sendChat('','/w gm '+getConfigOption_Active());
                            break;
                        case 'off': 
                            state.ScaleOnAdd.active=false;
                            sendChat('','/w gm '+getConfigOption_Active());
                            break;
                        case 'set': 
                            if(a2.length>1){
                                w=parseFloat(a2[1]);
                                if(w) {
                                    state.ScaleOnAdd.width = w;
                                    if(a2[2]){
                                        h=parseFloat(a2[2]);
                                    }
                                    state.ScaleOnAdd.height = h || w;
                                    sendChat('','/w gm '+getConfigOption_Scale());
                                } else {
                                    sendNotice('Please specify a number for the argument to <em>set</em>.<br>!scale-on-add --set &lt;number&gt;', 'Invalid input: '+a2[1]);
                                }
                                
                            } else {
                                sendNotice('Please specify at least one number with the <em>set</em> argument.<br>!scale-on-add --set &lt;number&gt;','Bad Command');
                            }
                            break;
                        default: return;
                    }
                });

                
                break;
        }
    },
    handleAddGraphic = function(obj){
        if(state.ScaleOnAdd.active) {
            obj.set({
                height: state.ScaleOnAdd.height,
                width: state.ScaleOnAdd.width
            });
            sendNotice('Scaling Graphic.');            
            lastAddId = obj.id;
        }
    },
    handleChangeGraphic = function(obj){
        if(state.ScaleOnAdd.active && lastAddId === obj.id) {
            obj.set({
                height: state.ScaleOnAdd.height,
                width: state.ScaleOnAdd.width
            });
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('add:graphic', handleAddGraphic);
        on('change:graphic', handleChangeGraphic);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
    
}());

on('ready',function() {
    'use strict';

    ScaleOnAdd.CheckInstall();
    ScaleOnAdd.RegisterEventHandlers();
});


