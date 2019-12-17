// Github:   https://github.com/shdwjk/Roll20API/blob/master/TableExport/TableExport.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TableExport = TableExport || (function() {
	'use strict';

	var version  = '0.2.4',
        lastUpdate = 1576529132,
        tableCache = {},
        escapes = {
            '['   : '<%%91%%>',
            ']'   : '<%%93%%>',
            '--' : '<%%-%%>',
            ' --' : '[TABLEEXPORT:ESCAPE]'
        },
    
    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

	ch = function (c) {
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
            '*' : 'ast',
            '`' : '#96',
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
        log('-=> TableExport v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
	},

	showHelp = function() {
		sendChat('',
            '/w gm '
+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
	+'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
		+'TableExport v'+version
	+'</div>'
	+'<div style="padding-left:10px;margin-bottom:3px;">'
		+'<p>This script dumps commands to the chat for reconstructing a rollable table on another campaign.  While this can be done on your own campaigns via the transmogrifier, this script allows you to pass those commands to a friend and thus share your own creative works with others.<p>'
		+'<p><b>Caveat:</b> Avatar images that are not in your own library will be ignored by the API on import, but will not prevent creation of the table and table items.</p>'
	+'</div>'
	+'<b>Commands</b>'
	+'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!export-table --'+ch('<')+'Table Name'+ch('>')+' [ --'+ch('<')+'Table Name'+ch('>')+' ...]</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>For all table names, case is ignored and you may use partial names so long as they are unique.  For example, '+ch('"')+'King Maximillian'+ch('"')+' could be called '+ch('"')+'max'+ch('"')+' as long as '+ch('"')+'max'+ch('"')+' does not appear in any other table names.  Exception:  An exact match will trump a partial match.  In the previous example, if a table named '+ch('"')+'Max'+ch('"')+' existed, it would be the only table matched for <b>--max</b>.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Table Name'+ch('>')+'</span></b> '+ch('-')+' This is the name of a table to export.  You can specify as many tables as you like in a single command.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
    +'<div style="padding-left:10px;">'
		+'<b><span style="font-family: serif;">!import-table --'+ch('<')+'Table Name'+ch('>')+' --'+ch('<')+'[ show | hide ]'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This is the command output by <b>!export-table</b> to create the new table.  You likely will not need issue these commands directly.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Table Name'+ch('>')+'</span></b> '+ch('-')+' This is the name of the table to be create.'
				+'</li> '
    			+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'[ show | hide ]'+ch('>')+'</span></b> '+ch('-')+' This whether to show the table to players or hide it.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
    +'<div style="padding-left:10px;">'
    	+'<b><span style="font-family: serif;">!import-table-item --'+ch('<')+'Table Name'+ch('>')+' --'+ch('<')+'Table Item Name'+ch('>')+' --'+ch('<')+'Weight'+ch('>')+' --'+ch('<')+'Avatar URL'+ch('>')+'</span></b>'
		+'<div style="padding-left: 10px;padding-right:20px">'
			+'<p>This is the command output by <b>!export-table</b> to create the new table.  You likely will not need issue these commands directly.</p>'
			+'<ul>'
				+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Table Name'+ch('>')+'</span></b> '+ch('-')+' This is the name of the table to add items to.  <b>Note:</b> unlike for <b>!export-table</b>, this must be an exact name match to the created table.'
				+'</li> '
    			+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Table Item Name'+ch('>')+'</span></b> '+ch('-')+' This is the name of the table item to create.  <b>Note:</b> Because the string '+ch('"')+' --'+ch('"')+' may occur in a table item name, you may see '+ch('"')+'[TABLEEXPORT:ESCAPE]'+ch('"')+' show up as a replacement in these commands.  This value is corrected internally to the correct '+ch('"')+' --'+ch('"')+' sequence on import.'
				+'</li> '
    			+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Weight'+ch('>')+'</span></b> '+ch('-')+' This is the weight for this table item and should be an integer value.'
				+'</li> '
    			+'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
					+'<b><span style="font-family: serif;">--'+ch('<')+'Avatar URL'+ch('>')+'</span></b> '+ch('-')+' This is the URL for the avatar image of the table item.'
				+'</li> '
			+'</ul>'
		+'</div>'
	+'</div>'
+'</div>'
		);
	},
    nameEscape = (function(){
        var re=new RegExp('('+_.map(_.keys(escapes),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return escapes[c] || c; });
        };
    }()),
    nameUnescape = (function(){
        var sepacse = _.invert(escapes),
        re=new RegExp('('+_.map(_.keys(sepacse),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return sepacse[c] || c; });
        };
    }()),

	handleInput = function(msg) {
		var args, matches, tables, tableIDs=[], errors=[], items, itemMatches, accum='';

		if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
			return;
		}

		args = msg.content.split(/\s+/);
		switch(args[0]) {
			case '!import-table':
				args = msg.content.split(/\s+--/);
				if(args.length === 1) {
					showHelp();
					break;
				}
				if(_.has(tableCache,args[1])) {
					sendChat('','/w gm '
						+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
							+'<span style="font-weight:bold;color:#990000;">Warning:</span> '
							+'Table ['+args[1]+'] already exists, skipping create.'
						+'</div>'
					);
				} else {
					tableIDs=findObjs({type: 'rollabletable', name: args[1]});
					if(tableIDs.length) {
						sendChat('','/w gm '
        					+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
    							+'<span style="font-weight:bold;color:#990000;">Warning:</span> '
    							+'Table ['+args[1]+'] already exists, skipping create.'
    						+'</div>'
						);
					} else {
						tableIDs=createObj('rollabletable',{ 
							name: args[1], 
							showplayers: ('show'===args[2])
						});
						tableCache[args[1]]=tableIDs.id;
					}
				}
				break;

			case '!import-table-item':
				args = msg.content.split(/\s+--/);
				if(args.length === 1) {
					showHelp();
					break;
				}
				args[2] = nameUnescape(args[2]);
				if(!_.has(tableCache,args[1])) {
					tableIDs=findObjs({type: 'rollabletable', name: args[1]});
					if(!tableIDs.length) {
						sendChat('','/w gm '
        					+'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
    							+'<span style="font-weight:bold;color:#990000;">Error:</span> '
    							+'Table ['+args[1]+'] doesn not exist.  Cannot create table item.'
    						+'</div>'
    					);
                        break;
                    } else {
                        tableCache[args[1]]=tableIDs[0].id;
                    }
                }
                createObj('tableitem',{
                    name: args[2],
                    rollabletableid: tableCache[args[1]],
                    weight: parseInt(args[3],10)||1,
                    avatar: args[4]||''
                });
                break;
                
			case '!export-table':
                args = msg.content.split(/\s+--/);
                if(args.length === 1) {
                    showHelp();
                    break;
                }
				tables=findObjs({type: 'rollabletable'});
				matches=_.chain(args)
					.rest()
					.map(function(n){
						var l=_.filter(tables,function(t){
							return t.get('name').toLowerCase() === n.toLowerCase();
						});
						return ( 1 === l.length ? l : _.filter(tables,function(t){
							return -1 !== t.get('name').toLowerCase().indexOf(n.toLowerCase());
						}));
					})
					.value();

				_.each(matches,function(o,idx){
					if(1 !== o.length) {
						if(o.length) {
							errors.push('Rollable Table [<b>'+args[idx+1]+'</b>] is ambiguous and matches '+o.length+' names: <b><i> '+_.map(o,function(e){
								return e.get('name');
								}).join(', ')+'</i></b>');
						} else {
							errors.push('Rollable Table [<b>'+args[idx+1]+'</b>] does not match any names.');
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
					matches=_.chain(matches)
						.flatten(true)
						.map(function(t){
							tableIDs.push(t.id);
                            return t;
						})
						.value();

					items=findObjs({type: 'tableitem'});
					itemMatches=_.chain(items)
						.filter(function(i){
							return _.contains(tableIDs,i.get('rollabletableid'));
						})
                        .reduce(function(memo,e){
                            if(!_.has(memo,e.get('rollabletableid'))) {
                                memo[e.get('rollabletableid')]=[e];
                            } else {
                                memo[e.get('rollabletableid')].push(e);
                            }
                            return memo;
                        },{})
						.value();
                    _.each(matches, function(t){
                        accum+='!import-table --'+nameEscape(t.get('name'))+' --'+(t.get('showplayers') ? 'show' : 'hide')+'<br>';
                        _.each(itemMatches[t.id], function(i){
                            accum+='!import-table-item --'+nameEscape(t.get('name'))+' --'+nameEscape(i.get('name'))+' --'+i.get('weight')+' --'+i.get('avatar')+'<br>';
                        });
                    });
                    sendChat('', '/w gm '+accum);

				}
				break;
				
				
		}

	},
    handleRemoveTable = function(obj){
        tableCache = _.without(tableCache,obj.id);
    },

	registerEventHandlers = function() {
		on('chat:message', handleInput);
        on('destroy:rollabletable', handleRemoveTable);
	};

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());


on("ready",function(){
	'use strict';

	TableExport.CheckInstall();
	TableExport.RegisterEventHandlers();
});
