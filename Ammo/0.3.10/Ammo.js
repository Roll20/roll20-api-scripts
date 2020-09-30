// Github:   https://github.com/shdwjk/Roll20API/blob/master/Ammo/Ammo.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var Ammo = Ammo || (function() {
    'use strict';

    var version = '0.3.10',
        lastUpdate = 1584729310,
		schemaVersion = 0.1,

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
	sendMessage = function(message, who, whisper) {
		sendChat(
            'Ammo',
            `${(whisper||'gm'===who)?`/w ${who} `:''}<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">${message}</div>`
		);
	},

	adjustAmmo = function (ec) {
        let who = ec.output.who;
        let attr = ec.operation.attr;
        let amount = ec.operation.amount;
        let label = ec.operation.label || 'ammo';
        let playerid = ec.output.playerid;

		const chr = getObj('character',attr.get('characterid'));
		const val = parseInt(attr.get('current'),10)||0;
		const max = parseInt(attr.get('max'),10)||Number.MAX_SAFE_INTEGER;

		let adjustedValue = (val+amount);
        let overage = 0;
		let valid = true;

        if(ec.options.allowPartial) {
            if (adjustedValue < 0) {
                overage = Math.abs(adjustedValue);
                adjustedValue = 0;
            } else if( adjustedValue > max ) {
                overage = adjustedValue - max;
                adjustedValue = max;
            }
        }

		if(adjustedValue < 0 ) {
			sendMessage(
				'<b>'+chr.get('name') + '</b> does not have enough '+label+'.  Needs '+Math.abs(amount)+', but only has '+
				'<span style="color: #ff0000;">'+val+'</span>.'+
				'<span style="font-weight:normal;color:#708090;>'+ch('[')+'Attribute: '+attr.get('name')+ch(']')+'</span>',
                who,
                ec.output.whisper
			);
			valid = false;
		} else if( adjustedValue > max) {
			sendMessage(
				'<b>'+chr.get('name') + '</b> does not have enough storage space for '+label+'.  Needs '+adjustedValue+', but only has '+
				'<span style="color: #ff0000;">'+max+'</span>.'+
				'<span style="font-weight:normal;color:#708090;>'+ch('[')+'Attribute: '+attr.get('name')+ch(']')+'</span>',
                who,
                ec.output.whisper
			);
			valid = false;
		}

		if( playerIsGM(playerid) || valid ) {
			attr.setWithWorker({current: adjustedValue});
            let verb = (adjustedValue < val) ? 'use' : 'gain';
			sendMessage(
				`<b>${chr.get('name')}</b> ${verb}s ${Math.abs(amount)} ${label} and has ${adjustedValue} remaining.  ${overage ? `Unable to ${verb} ${overage} ${label}.`:''}`,
                who,
                ec.output.whisper
			);
			if(!valid) {
				sendMessage(
					'Ignoring warnings and applying adjustment anyway.  Was: '+val+'/'+max+' Now: '+adjustedValue+'/'+max,
                    who,
                    ec.output.whisper
				);
			}
		}
	},

	showHelp = function(who,playerid) {

        sendChat('',
            '/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'Ammo v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>Ammo provides inventory management for ammunition stored in a character '+
		'attribute.  If the adjustment would change the attribute to be below 0 or above '+
		'it'+ch("'")+'s maximum value, a warning will be issued and the attribute will not be'+
		'changed.</p>'+

		( (playerIsGM(playerid)) ? '<p><b>Note:</b> As the GM, bounds will not be '+
		'enforced for you.  You will be whispered the warnings, but the operation '+
		'will succeed.  You will also be told the previous and current state in case '+
		'you want to revert the change.' : '')+

	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!ammo '+ch('<')+'id'+ch('>')+' '+ch('<')+'attribute'+ch('>')+' '+ch('<')+'amount'+ch('>')+' '+ch('[')+'resource name'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'This command requires 3 parameters:'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">id</span></b> -- The id of the character which has the attribute.  You can pass this as '+ch('@')+ch('{')+'selected|token_id'+ch('}')+' and the character id will be pulled from represents field of the token.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">attribute</span></b> -- The name of the attribute representing ammunition.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">amount</span></b> -- The change to apply to the current quantity of ammo.  Use negative numbers to decrease the amount, and positive numbers to increase it.  You can use inline rolls to determine the number.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">resource name</span></b> -- Anything you put after the amount to adjust by will be used as the resource name (default: "ammo").'+
				'</li> '+
			'</ul>'+
		'</div>'+
		'<b><span style="font-family: serif;">!wammo '+ch('<')+'id'+ch('>')+' '+ch('<')+'attribute'+ch('>')+' '+ch('<')+'amount'+ch('>')+' '+ch('[')+'resource name'+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'This command is identical to !ammo but will whisper all output.'+
		'</div>'+
	'</div>'+
'</div>'
            );
    },

    attrLookup = function(character,name,caseSensitive){
        let match=name.match(/^(repeating_.*)_\$(\d+)_.*$/);
        if(match){
            let index=match[2],
                attrMatcher=new RegExp(`^${name.replace(/_\$\d+_/,'_([-\\da-zA-Z]+)_')}$`,(caseSensitive?'i':'')),
                createOrderKeys=[],
                attrs=_.chain(findObjs({type:'attribute', characterid:character.id}))
                    .map((a)=>{
                        return {attr:a,match:a.get('name').match(attrMatcher)};
                    })
                    .filter((o)=>o.match)
                    .each((o)=>createOrderKeys.push(o.match[1]))
                    .reduce((m,o)=>{ m[o.match[1]]=o.attr; return m;},{})
                    .value(),
                sortOrderKeys = _.chain( ((findObjs({
                        type:'attribute',
                        characterid:character.id,
                        name: `_reporder_${match[1]}`
                    })[0]||{get:_.noop}).get('current') || '' ).split(/\s*,\s*/))
                    .intersection(createOrderKeys)
                    .union(createOrderKeys)
                    .value();
            if(index<sortOrderKeys.length && _.has(attrs,sortOrderKeys[index])){
                return attrs[sortOrderKeys[index]];
            }
            return;
        } 
        return findObjs({ type:'attribute', characterid:character.id, name: name}, {caseInsensitive: !caseSensitive})[0];
    },

	HandleInput = function(msg_orig) {
		if (msg_orig.type !== "api") {
			return;
		}
        
		let msg = _.clone(msg_orig);

		if(_.has(msg,'inlinerolls')){
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']=v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}

        let whisper = false;
        let ignoreMissing = false;
        let allowPartial = false;

        let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
		let attr, amount, chr, token, label;

		let args = msg.content.split(/\s+/);
        let switches = args.filter((a)=>/^--/.test(a));
        args = args.filter((a)=>!/^--/.test(a));
		switch(args.shift()) {
            case '!wammo':
                whisper = true;
                /* break; // intentional dropthrough */ /* falls through */

            case '!ammo':
				if((args.length + switches.length) > 1) {

                    switches.forEach((s)=>{
                        switch(s) {
                            case '--help':
                                return showHelp(who,msg.playerid);

                            case '--ignore-missing':
                                ignoreMissing = true;
                                break;

                            case '--allow-partial':
                                allowPartial = true;
                                break;
                        }
                    });


					chr = getObj('character', args[0]);
					if( ! chr ) {
						token = getObj('graphic', args[0]);
						if(token) {
							chr = getObj('character', token.get('represents'));
						}
					}
					if(chr) {
						if(! playerIsGM(msg.playerid) &&
							! _.contains(chr.get('controlledby').split(','),msg.playerid) &&
							! _.contains(chr.get('controlledby').split(','),'all') 
							)
						{
							sendMessage(
                                'You do not control the specified character: '+chr.id ,
                                (playerIsGM(msg.playerid) ? 'gm' : who),
                                whisper
                            );
							sendMessage(
								'<b>'+getObj('player',msg.playerid).get('_displayname')+'</b> attempted to adjust attribute <b>'+args[1]+'</b> on character <b>'+chr.get('name')+'</b>.',
								'gm',
                                whisper
							);
							return;
						}

						attr = attrLookup(chr,args[1],false);
					}
					amount=parseInt(args[2],10);
                    label=_.rest(args,3).join(' ');
					if(attr) {
						adjustAmmo({
                            output: {
                                who,
                                playerid: msg.playerid,
                                whisper
                            },
                            operation: {
                                attr,
                                amount,
                                label
                            },
                            options: {
                                ignoreMissing,
                                allowPartial
                            }
                        });

					} else if(!ignoreMissing) {
                        if(chr) {
                            sendMessage(
                                `Attribute [${args[1]}] was not found.  Please verify that you have the right name.`,
                                (playerIsGM(msg.playerid) ? 'gm' : who),
                                whisper
                            );
                        } else {
                            sendMessage(
                                ( token ?  'Token id ['+args[0]+'] does not represent a character. ' : 'Character/Token id ['+args[0]+'] is not valid. ' ) +
                                'Please be sure you are specifying it correctly, either with '+ch('@')+ch('{')+'selected|token_id'+ch('}')+
                                ' or '+ch('@')+ch('{')+'selected|character_id'+ch('}')+'.',
                                (playerIsGM(msg.playerid) ? 'gm' : who),
                                whisper
                            );
						}
					}
				} else {
					showHelp(who,msg.playerid);
				}
                break;
		}

	},
    checkInstall = function() {    
        log('-=> Ammo v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'Ammo') || state.Ammo.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.Ammo = {
				version: schemaVersion,
				config: {
				},
				policies: {
					global: {
						recoveryUpdatesMaximum: false
					},
					byAttribute: {
					},
					byCharacter: {
					}
				}
			};
		}
	},

	RegisterEventHandlers = function() {
		on('chat:message', HandleInput);
	};

	return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: RegisterEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	Ammo.CheckInstall();
	Ammo.RegisterEventHandlers();
});
