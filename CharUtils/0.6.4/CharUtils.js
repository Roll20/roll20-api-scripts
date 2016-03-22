// Github:   https://github.com/shdwjk/Roll20API/blob/master/CharUtils/CharUtils.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var CharUtils = CharUtils || (function() {
    'use strict';

    var version = '0.6.4',
        lastUpdate = 1453471300,

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

	checkInstall = function() {
        log('-=> CharUtils v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	showHelp = function() {
        sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'CharUtils v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>CharUtils is a collection of utility functions for manipulating characters.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!chardup --'+ch('<')+'Source'+ch('>')+'  --'+ch('<')+'Destination'+ch('>')+' [--'+ch('<')+'Destination'+ch('>')+' ... ]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This command requires a minimum of 2 parameters.  For all character names, case is ignored and you may use partical names so long as they are unique.  For example, '+ch('"')+'King Maximillian'+ch('"')+' could be called '+ch('"')+'max'+ch('"')+' as long as '+ch('"')+'max'+ch('"')+' does not appear in any other names.  Exception:  An exact match will trump a partial match.  In the previous example, if a character named '+ch('"')+'Max'+ch('"')+' existed, it would be the only character matched for <b>--max</b>.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Source'+ch('>')+'</span></b> '+ch('-')+' This is the name of the character to copy from.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Destination'+ch('>')+'</span></b> '+ch('-')+' This is the name of a character to recieve copies of the abilities from the source.  You may specify as many unique names as you like.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!chardup-some --'+ch('<')+'Ability[|Ability|...]'+ch('>')+'  --'+ch('<')+'Source'+ch('>')+'  --'+ch('<')+'Destination'+ch('>')+' [--'+ch('<')+'Destination'+ch('>')+' ... ]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This command requires a minimum of 3 parameters.  For the ability name, all matching abilities will be copied.  Case and whitespace are ignored in the match.  For all character names, case is ignored and you may use partical names so long as they are unique.  For example, '+ch('"')+'King Maximillian'+ch('"')+' could be called '+ch('"')+'max'+ch('"')+' as long as '+ch('"')+'max'+ch('"')+' does not appear in any other names.  Exception:  An exact match will trump a partial match.  In the previous example, if a character named '+ch('"')+'Max'+ch('"')+' existed, it would be the only character matched for <b>--max</b>.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Ability[|Ability|...]'+ch('>')+'</span></b> '+ch('-')+' This is the name (or part of it) of one or more abilities separarted by |.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Source'+ch('>')+'</span></b> '+ch('-')+' This is the name of the character to copy from.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Destination'+ch('>')+'</span></b> '+ch('-')+' This is the name of a character to recieve copies of the abilities from the source.  You may specify as many unique names as you like.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!rename-attr --'+ch('<')+'Name'+ch('>')+'  --'+ch('<')+'Rename'+ch('>')+' [--'+ch('<')+'Name'+ch('>')+'  --'+ch('<')+'Rename'+ch('>')+' ... ]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This command requires an even number of parameters, a minimum of 2 parameters.  Each pair of parameters forms a renaming operation.  Any attribute with the first name in a pair will be renamed to the second name in the pair.</p>'
			+'<p><b>Note:</b> This operation is case sensitive.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Name'+ch('>')+'</span></b> '+ch('-')+' This is the current name of an attribute.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Rename'+ch('>')+'</span></b> '+ch('-')+' This is the new name for the attribute.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!replace-attr --'+ch('<')+'Name'+ch('>')+'  --'+ch('<')+'Replace'+ch('>')+' [--'+ch('<')+'Name'+ch('>')+'  --'+ch('<')+'Replace'+ch('>')+' ... ]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This command requires an even number of parameters, a minimum of 2 parameters.  Each pair of parameters forms a substituion operation.  Any attribute reference with the first name in a pair will be replaced by the second name in the pair for all abilities.</p>'
			+'<p><b>Note:</b> This operation is case sensitive.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Name'+ch('>')+'</span></b> '+ch('-')+' This is the current name of an attribute.'
				+'</li> '
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Replace'+ch('>')+'</span></b> '+ch('-')+' This is the new name for the attribute.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
            );
    },

	attributeReplace = function(renameMap) {
		var AttrByName = {},
			AttrByChar = {},
			CharByID = {},
			AbilityByCharID = {},
			Subs = [];

		_.map(findObjs({
			type: 'attribute'
		}),function(a){
			if(!_.has(AttrByName,a.get('name'))){
				AttrByName[a.get('name')]=[a];
			} else {
				AttrByName[a.get('name')].push(a);
			}
			if(!_.has(AttrByChar,a.get('characterid'))){
				AttrByChar[a.get('characterid')]=[a];
			} else {
				AttrByChar[a.get('characterid')].push(a);
			}
		});

		_.map(findObjs({
			type: 'ability'
		}),function(a){
			if(!_.has(AbilityByCharID,a.get('characterid'))){
				AbilityByCharID[a.get('characterid')]=[a];
			} else {
				AbilityByCharID[a.get('characterid')].push(a);
			}
		});

		_.map(findObjs({
			type: 'character'
		}),function(c){
			if(!_.has(CharByID,c.get('id'))){
				CharByID[c.get('id')]=c;
			}
		});

		_.each(renameMap, function(to,from){
			_.each(AttrByName[to], function(a) {
				if(_.has(CharByID,a.get('characterid'))) {
					Subs=_.reduce([
						CharByID[a.get('characterid')].get('id')+"\\|",
						CharByID[a.get('characterid')].get('name')+"\\|",
						"selected\\|",
						"target\\|",
						''
					], function(memo,name){
                        var r1=new RegExp('@{' + name + from + '}','gi'),
                            r2=new RegExp('@{' + name + from + "\\|max}",'gi');
						memo.push([r1,'@{' + name + to + '}']);
						memo.push([r2,'@{' + name + to + "\\|max}"]);
						return memo;
					},[]);
                    
					_.each(AbilityByCharID[a.get('characterid')], function (ab) {
						var text=ab.get('action'),
							orig=text;
						text=_.reduce(Subs,function(text,sp){
							return text.replace(sp[0],sp[1]);
						},text);
						if(text!==orig) {
							ab.set({action: text});
						}
					});
				}
			});
		});
	},

	attributeRename = function(renameMap) {
		var AttrByName = [],
			AttrByChar = [];
		_.map(findObjs({
			type: 'attribute'
		}),function(a){
			if(!_.has(AttrByName,a.get('name'))){
				AttrByName[a.get('name')]=[a];
			} else {
				AttrByName[a.get('name')].push(a);
			}
			if(!_.has(AttrByChar,a.get('characterid'))){
				AttrByChar[a.get('characterid')]=[a];
			} else {
				AttrByChar[a.get('characterid')].push(a);
			}
		});

		_.each(renameMap, function(to,from){
			_.each(AttrByName[from], function(a) {
                var match=_.find(AttrByChar[a.get('characterid')],function(attr) {
                   return attr.get('name') === to; 
                });

				if(match) {
					match.set({
						current: a.get('current'),
						max: a.get('max')
					});
                    a.remove();
				} else {
					a.set({
						name: to
					});
				}
			});
		});
	},

    keyFormat = function(text) {
        return text.toLowerCase().replace(/\s+/,'');
    },

	handleInput = function(msg) {
		var args,
			chars,
			matches,
			abilities,
            ability,
			errors=[];

		if (msg.type !== "api" || !playerIsGM(msg.playerid) ) {
			return;
		}
		
		args = msg.content.split(/\s+--/);
		switch(args.shift()) {

			case '!replace-attr': 
				if( 0 === args.length || 1 === args.length % 2 ) {
					showHelp();
					break;
				}
                
				attributeReplace(_.chain(args)
					.reduce(function(m,v,k){
						var nkey=Math.floor(k/2);
						if ( _.has(m,nkey) ) {
							m[nkey].push(v);
						} else {
							m[nkey]=[v];
						}
						return m;
					},[])
    				.reduce(function(m,e){
						m[e[0]] = e[1];
                        return m;
					},{})
					.value());

				break;

			case '!rename-attr': 
				if( 0 === args.length || 1 === args.length % 2 ) {
					showHelp();
					break;
				}
                
				attributeRename(_.chain(args)
					.reduce(function(m,v,k){
						var nkey=Math.floor(k/2);
						if ( _.has(m,nkey) ) {
							m[nkey].push(v);
						} else {
							m[nkey]=[v];
						}
						return m;
					},[])
    				.reduce(function(m,e){
						m[e[0]] = e[1];
                        return m;
					},{})
					.value());

				break;

            case '!chardup-some':
				if(args.length < 3) {
					if(args.length !== 0) {
						sendChat('','/w gm '
							+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
								+'<span style="font-weight:bold;color:#990000;">Error:</span> '
								+'Please specify at least 2 characters.'
							+'</div>'
						);
					}
					showHelp();
					break;
				}
                ability = args.shift().split(/\|/);
                
                /* intentinal fallthrough */

            case '!chardup':
				if(args.length < 2) {
					if(args.length !== 0) {
						sendChat('','/w gm '
							+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
								+'<span style="font-weight:bold;color:#990000;">Error:</span> '
								+'Please specify at least 2 characters.'
							+'</div>'
						);
					}
					showHelp();
					break;
				}
				chars=findObjs({type: 'character',archived: false});
				matches=_.chain(args)
					.map(function(n){
						var l=_.filter(chars,function(c){
							return c.get('name').toLowerCase() === n.toLowerCase();
						});
						return ( 1 === l.length ? l : _.filter(chars,function(c){
							return -1 !== c.get('name').toLowerCase().indexOf(n.toLowerCase());
						}));
					})
					.value();

				_.each(matches,function(o,idx){
					if(1 !== o.length) {
						if(o.length) {
							errors.push('Character [<b>'+args[idx]+'</b>] is ambiguous and matches '+o.length+' names: <b><i> '+_.map(o,function(e){
								return e.get('name');
								}).join(', ')+'</i></b>');
						} else {
							errors.push('Character [<b>'+args[idx]+'</b>] does not match any names.');
						}
					}
				},errors);

				if(errors.length) {
					sendChat('','/w gm '
						+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+'<div><span style="font-weight:bold;color:#990000;">Error:</span> '
							+errors.join('</div><div><span style="font-weight:bold;color:#990000;">Error:</span> ')
							+'</div>'
						+'</div>'
					);
					break;
				}


				if( ! errors.length) {
					matches=_.flatten(matches,true);
					abilities=filterObjs(function(a){
                        return 'ability' === a.get('type')
                            && a.get('characterid') === matches[0].id 
                            && ( ability ? _.find(ability,function(aname){ return -1 !== keyFormat(a.get('name')).indexOf(keyFormat(aname));}) : true);
                    });

					if(!abilities.length) {
						sendChat('','/w gm Character [<b>'+matches[0].get('name')+'</b>] does not have any abilities'+(ability ? ' matching <b>'+ability.join(',')+'</b>.' : '.') );
						break;
					}
					_.each(abilities,function(a){
						_.chain(matches)
							.rest()
							.each(function(c){
								createObj('ability',{
										characterid: c.id,
										name: a.get('name'),
										description: a.get('description'),
										action: a.get('action'),
										istokenaction: a.get('istokenaction')
									});
							});
					});

					sendChat('','/w gm '
						+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+'<div>Source Character: <b>'+matches[0].get('name')+'</b></div>'
							+'<div>Abilities:'
								+'<ul><li><i>'+_.map(abilities,function(a){
										return a.get('name');
									}).join('</i></li><li><i>')
								+'</i></li></ul>'
							+'</div>'
							+'<div>Destination Character'+( 2 === matches.length ?'':'s')+':'
								+'<ul><li><b>'+_.map(_.rest(matches),function(c){
										return c.get('name');
									}).join('</b></li><li><b>')
								+'</b></li></ul>'
							+'</div>'
						+'</div>'
					);

				}

				break;
		}

	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	CharUtils.CheckInstall();
	CharUtils.RegisterEventHandlers();
});

