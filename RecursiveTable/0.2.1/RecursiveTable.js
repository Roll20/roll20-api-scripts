// Github:   https://github.com/shdwjk/Roll20API/blob/master/RecursiveTable/RecursiveTable.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var RecursiveTable = RecursiveTable || (function() {
	'use strict';

	var version = '0.2.1',
	lastUpdate = 1500986989,
	schemaVersion = 0.1,
	defaults = {
		maxdepth: 10,
		delimiter: ', ',
		dropempty: true,
		sort: false,
		prefaceuniquespace: false,
	emptydefault: '',
		who: ''
	},
	regex = {
		rtCmd: /^(!rt)(?:\[([^\]]*)\])?\s*/,
		inlineRoll: /\[\[.*\]\]/

	},

	checkInstall = function() {
		log('-=> RecursiveTable v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

		if( ! _.has(state,'RecursiveTable') || state.RecursiveTable.version !== schemaVersion) {
			log('  > Updating Schema to v'+schemaVersion+' <');
			state.RecursiveTable = {
				version: schemaVersion
			};
		}
	},
	sendChatP = function(msg){
		return new Promise((resolve) =>{
			sendChat('',msg.replace(/\[\[\s+/,'[[').replace(/\[\[\s+\[\[/,'[[[['),(res)=>{
				resolve(res[0]);
			});
		});
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
			'&' : 'amp',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},
	esRE = function (s) {
		var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
		return s.replace(escapeForRegexp,"\\$1");
	},

	HE = (function(){
		var entities={
			//' ' : '&'+'nbsp'+';',
			'<' : '&'+'lt'+';',
			'>' : '&'+'gt'+';',
			"'" : '&'+'#39'+';',
			'@' : '&'+'#64'+';',
			'{' : '&'+'#123'+';',
			'|' : '&'+'#124'+';',
			'}' : '&'+'#125'+';',
			'[' : '&'+'#91'+';',
			']' : '&'+'#93'+';',
			'"' : '&'+'quot'+';'
		},
		re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
		return function(s){
			return s.replace(re, function(c){ return entities[c] || c; });
		};
	}()),

	makeSuffixer = function(suffix){
		let n = 0;
		return (val)=>val+suffix.repeat(n++);
	},

	showHelp = function(who) {

		sendChat('','/w "'+who+'" '+
			'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
			'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
			'RecursiveTable v'+version+
			'</div>'+
			'<div style="padding-left:10px;margin-bottom:3px;">'+
			'<p>RecursiveTable provides a way to expand the results of Rollable Tables which have inline rolls within them. Now with options and support for whispering Roll Templates.</p>'+
			'<p>When using Rolltemplates, your message must have at least one <code>{{</code> that in not coming from a Rollable Table.  When using the <code>PrefaceUniqueSpace</code> option, be sure your <code>{{name=something}}</code> is first.</p>'+
			'</div>'+
			'<b>Commands</b>'+
			'<div style="padding-left:10px;">'+
			'<b><span style="font-family: serif;">!rt[options] [--help| ... ]</span></b>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Performs all inline rolls, then continues to expand inline rolls (to a maximum depth of around 10).</p>'+
			'<ul>'+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'+
			'</li> '+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">...</span></b> '+ch('-')+' Anything following !rt will be expanded, then sent to to the chat.'+
			'</li> '+
			'</ul>'+
			'</div>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
			'<p><b>Options</b> - These are inline settings to adjust how the rolls are put together.  Options are specified in <code>'+ch('[')+'</code> <code>'+ch(']')+'</code> right after the <code>!rt</code>:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
			'!rt'+ch('[')+'delimiter:-|maxdepth:20'+ch(']')+' something'+
			'</pre>'+
			'<p>Options are separated with the verticle pipe symbol (<code>'+ch('|')+'</code>) and have an optional argument separated by a <b>:</b>. Omitting the argument causes <b>true</b> to be used for switch options, or the default value.  All Options are case insenstive.  Options are one of 3 types: Number (any integer), Boolean (true values: <code>on</code>, <code>yes</code>, <code>y</code>, <code>true</code>.  false values: <code>off</code>, <code>no</code>, <code>n</code>, <code>false</code>), or text (any value except <code>]</code>, use <code>\\'+ch('|')+'</code> for <code>'+ch('|')+'</code>) </p>'+
			'<ul>'+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">MaxDepth</span></b> '+ch('-')+' Specifies the number of recursions to perform.  <b>Default: 10 (Number)</b>'+
			'</li> '+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">Delimiter</span></b> '+ch('-')+' A string of text to put between table items. The special value <code>BR</code> will cause html line breaks to be used. <b>Default: <code>, </code>(String)</b>'+
			'</li> '+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">DropEmpty</span></b> '+ch('-')+' Causes empty table items to be dropped before joining with the delimiter. <b>Default: on (Boolean)</b>'+
			'</li> '+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">Sort</span></b> '+ch('-')+' Causes table items to be sorted before being joined by the delimiter.  Note that this happens at a single layer of recursion, so if you have table items made of of lists of table items, the sorting will only be at each level. <b>Default: off (Boolean)</b>'+
			'</li> '+
			'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
			'<b><span style="font-family: serif;">PrefaceUniqueSpaces</span></b> '+ch('-')+' Causes the final message to have a unique number of spaces inserted after each <code>'+ch('{')+ch('{')+'</code>. This is useful if you'+ch("'")+'re building Roll Templates and might have multiple lines with the same label. <b>Default: off (Boolean)</b>'+
				'</li> '+
			'</ul>'+
			'</div>'+
			'<b>Examples</b>'+
			'<div style="padding-left:10px;">'+
			'<p>Basic usage, whispering treasure to the gm.</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
			'!rt /w gm '+ch('[')+ch('[')+'1t'+ch('[')+'treasure-table'+ch(']')+ch(']')+ch(']')+
			'</pre>'+
			'<p>Whispering a roll template:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
			'!rt /w gm '+ch('&')+ch('{')+'template:default'+ch('}')+ch('{')+ch('{')+'treasure='+ch('[')+ch('[')+'1t'+ch('[')+'treasure-table'+ch(']')+ch(']')+ch(']')+''+ch('}')+ch('}')+''+
			'</pre>'+
			'<p>Whispering a roll template, with each item on a separate line:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
			'!rt'+ch('[')+'Delimiter:BR'+ch(']')+' /w gm '+ch('&')+ch('{')+'template:default'+ch('}')+ch('{')+ch('{')+'treasure='+ch('[')+ch('[')+'1t'+ch('[')+'treasure-table'+ch(']')+ch(']')+ch(']')+''+ch('}')+ch('}')+''+
			'</pre>'+
			'<p>Whispering a roll template, with each item on a separate line, with empty results replaced by <code>Nothing</code>:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
			'!rt'+ch('[')+'Delimiter:BR|EmptyDefault:Nothing'+ch(']')+' /w gm '+ch('&')+ch('{')+'template:default'+ch('}')+ch('{')+ch('{')+'treasure='+ch('[')+ch('[')+'1t'+ch('[')+'treasure-table'+ch(']')+ch(']')+ch(']')+''+ch('}')+ch('}')+''+
			'</pre>'+
			'<p>Whispering a roll template, with each item on a separate line, with a table that is returning <code>{{label=values'+ch('}')+ch('}')+'</code>:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
			'!rt'+ch('[')+'Delimiter:BR|PrefaceUniqueSpace'+ch(']')+' '+ch('&')+ch('{')+'template:default'+ch('}')+ch('{')+ch('{')+'name=Treasure Bundles'+ch('}')+ch('}')+''+ch('[')+ch('[')+'5t'+ch('[')+'treasure-bundle'+ch(']')+ch(']')+ch(']')+
			'</pre>'+
			'</div>'+
			'</div>'+
			'</div>'
		);
	},

	getAsBoolean = function(val,defVal){
		let isTrue = _.contains(['on','yes','y','true'],val.toLowerCase()),
		isFalse = _.contains(['off','no','n','false'],val.toLowerCase());
		log({isTrue,isFalse});
		if(isTrue || isFalse){
			return !isFalse;
		}
		return !_.isUndefined(defVal) ? defVal : val;
	},

	parseOptions = function(cmdOpts){
		return _.chain((cmdOpts||'').replace(/((?:\\.|[^|])*)\|/g,'$1\n').replace(/\\/,'').split(/\n/))
		.filter((a)=>a.length)
		.reduce((m,o)=>{
			let tok=o.split(/:/),
			c=tok.shift().toLowerCase(),
			a=tok.join(':')||true;
			switch(c){
				case 'maxdepth':
					a=parseInt(a,10)||defaults[c];
					break;
				case 'dropempty':
				case 'sort':
				case 'prefaceuniquespace':
					a=getAsBoolean(a,defaults[c]);
					break;
				case 'emptydefault':
					break;
				case 'delimiter':
					switch(a.toLowerCase()){
						case 'br':
							a = '<br>';
							break;
						default:
					}
					break;
			}

			m[c]=a;
			return m;
		},_.clone(defaults))
		.value();
	},

	rollAndParseInlines = function(roll,opts){
		return new Promise((returnText)=>{
			sendChatP(roll)
			.then((msg)=>{
				parseInlines(msg.inlinerolls,opts)
				.then((subs)=>{
					returnText(_.reduce(subs,(m,v,k)=>m.replace(k,v),msg.content));
				})
				.catch((e)=>{
					let eRoll=HE(roll);
					sendChat(`RecursiveTables`,`/w "${opts.who}" <div>An error occured while filling the results of this roll: <code>${eRoll}</code></div><div>Error: <code>${e.message}</code></div>`);
				});
			})
			.catch((e)=>{
				let eRoll=HE(roll);
				sendChat(`RecursiveTables`,`/w "${opts.who}" <div>An error occured parsing this roll: <code>${eRoll}</code></div><div>Error: <code>${e.message}</code></div>`);
			});
		});
	},

	parseInlines = function(inlines,opts){
		return new Promise((returnSubs)=>{
			let subOpts = _.clone(opts),
			subs = {},
			context = {},
			promises=[];

			--subOpts.maxdepth;

			_.each(inlines,(rollRecord,msgIdx)=>{
				const key=`$[[${msgIdx}]]`,
				result = rollRecord.results.total;

				context[key]={
					result: rollRecord.results.total
				};

				_.each(rollRecord.results.rolls,(roll)=>{
					if(_.has(roll,'table')){
						context[key].hasText=false;
						context[key].parts=[];
						context[key].sentinal=0;

						_.each(roll.results, (die,dieIdx)=>{
							if(_.has(die,'tableItem') && _.isString(die.tableItem.name) && !die.tableItem.name.match(/^\d+$/)){
								if( regex.inlineRoll.test(die.tableItem.name)){
									if(subOpts.maxdepth){
										++context[key].sentinal;
										promises.push(new Promise((done)=>{
											rollAndParseInlines(die.tableItem.name,subOpts)
											.then((text)=>{
												context[key].parts[dieIdx]=text;
												--context[key].sentinal;
												if(!context[key].sentinal){
													subs[key]=_.compose(
														(opts.sort ? (x)=>x.sort() : _.identity),
														(opts.dropempty ?  (x)=>_.filter(x,(v)=>`${v}`.trim().length) : _.identity)
													)(context[key].parts).join(opts.delimiter);
												}
												done(true);
											})
											.catch((e)=>{
												let eRoll=HE(die.tableItem.name);
												sendChat(`RecursiveTables`,`/w "${opts.who}" <div>An Error occured with this TableItem: <code>${eRoll}</code></div><div>Error: <code>${e.message}</code></div>`);
											});
										}));
									} else {
										context[key].parts[dieIdx]=`${die.tableItem.name}`.trim()||opts.emptydefault;
									}
								} else {
									context[key].parts[dieIdx]=`${die.tableItem.name}`.trim()||opts.emptydefault;
								}
								context[key].hasText=true;
							} else {
								context[key].parts[dieIdx]=die.v;
							}
						});


						if(context[key].hasText){
							subs[key]=_.compose(
								(opts.sort ? (x)=>x.sort() : _.identity),
								(opts.dropempty ?  (x)=>_.filter(x,(v)=>`${v}`.trim().length) : _.identity)
							)(context[key].parts).join(opts.delimiter);
						} else {
							subs[key]=result;
						}

					} else {
						subs[key]=result;
					}
				});
			});

			if(promises.length){
				Promise.all(promises)
				.then(()=>{
					returnSubs(subs);
				})
				.catch((e)=>{
					let eRoll=HE(_.pluck(inlines,'expression').join(', '));
					sendChat(`RecursiveTables`,`/w "${opts.who}" <div>An Error occurred: <code>${eRoll}</code></div><div>Error: <code>${e.message}</code></div>`);
				});
			} else {
				returnSubs(subs);
			}
		});
	},

	parseMessage = function(msg, opts){

		parseInlines(msg.inlinerolls, opts)
		.then((subs)=>{
			msg.content= _.reduce(subs,(m,v,k)=>m.replace(k,v),msg.content);

			sendChat(msg.who||'[BLANK]',(msg.content||'[EMPTY]').replace(/\{\{/g,(opts.prefixuniquespaces ? makeSuffixer(' ') : _.identity)));
		})
		.catch((e)=>{
			let eRoll=HE(msg.content);
			sendChat(`RecursiveTables`,`/w "${opts.who}" <div>An Error occured with this message: <code>${eRoll}</code></div><div>Error: <code>${e.message}</code></div>`);
		});
	},

	handleInput = function(msg_orig) {
		var msg = _.clone(msg_orig),
		args, who, cmd, opts;
		try {

			if (msg.type !== "api") {
				return;
			}
			who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

			args = msg.content.split(/\s+/);
			cmd = (args.shift().match(regex.rtCmd)||[]).splice(1);
			switch(cmd[0]) {
				case '!rt':
					if('--help' === args[0]){
						showHelp(who);
					} else {
						opts = parseOptions(cmd[1]);
						opts.who = who;
						msg.content = msg.content.replace(regex.rtCmd,'');
						if(_.has(msg,'rolltemplate') && _.isString(msg.rolltemplate) && msg.rolltemplate.length){
							msg.content = msg.content.replace(/\{\{/,'&{template:'+msg.rolltemplate+'} {{');
						}
						parseMessage(msg,opts);
					}
					break;
			}

		} catch (e) {
			let who=(getObj('player',msg_orig.playerid)||{get:()=>'API'}).get('_displayname');
			sendChat('RecursiveTables',`/w "${who}" `+
				`<div style="border:1px solid black; background-color: #ffeeee; padding: .2em; border-radius:.4em;" >`+
				`<div>There was an error while trying to run your command:</div>`+
				`<div style="margin: .1em 1em 1em 1em;"><code>${msg_orig.content}</code></div>`+
				`<div>Please <a class="showtip tipsy" title="The Aaron's profile on Roll20." style="color:blue; text-decoration: underline;" href="https://app.roll20.net/users/104025/the-aaron">send me this information</a> so I can make sure this doesn't happen again (triple click for easy select in most browsers.):</div>`+
				`<div style="font-size: .6em; line-height: 1em;margin:.1em .1em .1em 1em; padding: .1em .3em; color: #666666; border: 1px solid #999999; border-radius: .2em; background-color: white;">`+
				JSON.stringify({msg: msg_orig, stack: e.stack})+
				`</div>`+
				`</div>`
			);
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

on('ready',function() {
	'use strict';

	RecursiveTable.CheckInstall();
	RecursiveTable.RegisterEventHandlers();
});

