// Github:   https://github.com/shdwjk/Roll20API/blob/master/RecursiveTable/RecursiveTable.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var RecursiveTable = RecursiveTable || (function() {
	'use strict';

	var version = '0.2.5',
	lastUpdate = 1571360894,
	schemaVersion = 0.1,
	clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659',
	defaults = {
		maxdepth: 10,
		delimiter: ', ',
        echo: false,
        prefix: '',
        suffix: '',
		dropempty: true,
		sort: false,
		prefaceuniquespace: false,
		showicons: false,
		iconlabel: true,
		emptydefault: '',
        iconscale: '5em',
		who: ''
	},
	regex = {
		rtCmd: /^(!rt)(?:\[([^\]]*)\])?(?:\s+|$)/,
		inlineRoll: /\[\[.*\]\]/,
        cssSize: /^(auto|0)$|^[+-]?[0-9]+.?([0-9]+)?(px|em|ex|%|in|cm|mm|pt|pc)$/

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
			sendChat('',msg.replace(/\[\[\s+/g,'[['),(res)=>{
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
			'\\' : '#92',
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

	makePrefixer = function(prefix){
        let c = {};
		return (val)=>{
            val = val.trim();
            c[val]=c[val]||0;
            return prefix.repeat(c[val]++)+val;
        };
	},

//	makeSuffixer = function(suffix){
//        let c = {};
//		return (val)=>{
//            val = val.trim();
//            c[val]=c[val]||0;
//            return val+suffix.repeat(c[val]++);
//        };
//	},

    _h = {
        outer: (...o) => `<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">${o.join(' ')}</div>`,
        title: (t,v) => `<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">${t} v${v}</div>`,
        subhead: (...o) => `<b>${o.join(' ')}</b>`,
        minorhead: (...o) => `<u>${o.join(' ')}</u>`,
        optional: (...o) => `${ch('[')}${o.join(` ${ch('|')} `)}${ch(']')}`,
        required: (...o) => `${ch('<')}${o.join(` ${ch('|')} `)}${ch('>')}`,
        header: (...o) => `<div style="padding-left:10px;margin-bottom:3px;">${o.join(' ')}</div>`,
        section: (s,...o) => `${_h.subhead(s)}${_h.inset(...o)}`,
        paragraph: (...o) => `<p>${o.join(' ')}</p>`,
        items: (o) => `<li>${o.join('</li><li>')}</li>`,
        ol: (...o) => `<ol>${_h.items(o)}</ol>`,
        ul: (...o) => `<ul>${_h.items(o)}</ul>`,
        grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`,
        cell: (o) =>  `<div style="width: 130px; padding: 0 3px; float: left;">${o}</div>`,
        inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
        pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
        preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
        code: (...o) => `<code>${o.join(' ')}</code>`,
        attr: {
            bare: (o)=>`${ch('@')}${ch('{')}${o}${ch('}')}`,
            selected: (o)=>`${ch('@')}${ch('{')}selected${ch('|')}${o}${ch('}')}`,
            target: (o)=>`${ch('@')}${ch('{')}target${ch('|')}${o}${ch('}')}`,
            char: (o,c)=>`${ch('@')}${ch('{')}${c||'CHARACTER NAME'}${ch('|')}${o}${ch('}')}`
        },
        bold: (...o) => `<b>${o.join(' ')}</b>`,
        italic: (...o) => `<i>${o.join(' ')}</i>`,
        font: {
            command: (...o)=>`<b><span style="font-family:serif;">${o.join(' ')}</span></b>`
        }
    },

	showHelp = function(playerid) {
        let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');

		sendChat('','/w "'+who+'" '+
            _h.outer(
                _h.title('RecursiveTable',version),
                _h.header(
                    _h.paragraph('RecursiveTable provides a way to expand the results of Rollable Tables which have inline rolls within them. Now with options and support for whispering Roll Templates.'),
                    _h.paragraph(`When using Rolltemplates, your message must have at least one ${_h.code(ch('{')+ch('{'))} that in not coming from a Rollable Table.  When using the ${_h.code('PrefaceUniqueSpace')} option, be sure your ${_h.code(`${ch('{')}${ch('{')}name=something${ch('}')}${ch('}')}`)} is first.`)
                ),
                _h.subhead('Commands'),
                _h.inset(
                    _h.font.command( `!rt${_h.optional('options')} ${_h.optional('--help', '...')}`),
                    _h.paragraph('Performs all inline rolls, then continues to expand inline rolls (to a maximum depth of around 10).'),
                    _h.ul(
                        `${_h.bold('--help')} -- Shows the Help screen`,
                        `${_h.bold('...')} -- Anything following ${_h.code('!rt')} will be expanded, then sent to to the chat.`
                    ),

                    _h.section('Options'),
                    _h.paragraph(`These are inline settings to adjust how the rolls are put together.  Options are specified in ${_h.code(ch('['))} ${_h.code(ch(']'))} right after the ${_h.code('!rt')}:`),
                    _h.inset(
                        _h.pre(`!rt[delimiter:-|maxdepth:20] something`)
                    ),
                    _h.paragraph( `Options are separated with the verticle pipe symbol (${_h.code(ch('|'))}) and have an optional argument separated by a ${_h.code(':')} or by ${_h.code('%%')} (Useful for API Command buttons where : causes problems). Omitting the argument causes ${_h.bold('true')} to be used for switch options, or the default value.  All Options are case insenstive.  Options are one of 3 types: Number (any integer), Boolean (true values: ${_h.code('on')}, ${_h.code('yes')}, ${_h.code('y')}, ${_h.code('true')}.  false values: ${_h.code('off')}, ${_h.code('no')}, ${_h.code('n')}, ${_h.code('false')}), or text (any value except ${_h.code(']')}, use ${_h.code(ch('\\')+ch('|'))} for ${_h.code(ch('|'))})`),

                    _h.ul(
                        `${_h.bold('MaxDepth')} -- Specifies the number of recursions to perform.  ${_h.bold('Default: 10 (Number)')}`,
                        `${_h.bold('Delimiter')} -- A string of text to put between table items. The special value ${_h.code('BR')} will cause html line breaks to be used. ${_h.bold(`Default: ${_h.code(', ')} (String)`)}`,
                        `${_h.bold('DropEmpty')} -- Causes empty table items to be dropped before joining with the delimiter. ${_h.bold('Default: on (Boolean)')}`,
                        `${_h.bold('Sort')} -- Causes table items to be sorted before being joined by the delimiter.  Note that this happens at a single layer of recursion, so if you have table items made of of lists of table items, the sorting will only be at each level. ${_h.bold('Default: off (Boolean)')}`,
                        `${_h.bold('PrefaceUniqueSpace')} -- Causes the final message to have a unique number of spaces inserted after each ${_h.code(ch('{')+ch('{'))}. This is useful if you${ch("'")}re building Roll Templates and might have multiple lines with the same label. ${_h.bold('Default: off (Boolean)')}`,
                        `${_h.bold('ShowIcons')} -- Adds table avatars as inline icons, if they exist. ${_h.bold('Default: off (Boolean)')}`,
                        `${_h.bold('IconLabel')} -- When table icons are shown, the text for the row is shown as a label below it. ${_h.bold('Default: on (Boolean)')}`,
                        `${_h.bold('IconScale')} -- When table icons are shown, they are restricted to the provided scale. Any valid CSS size setting will work. ${_h.bold('Default: 5em')}`
                    ),

                    _h.section('Examples'),
                    
                    _h.paragraph('Basic usage, whispering treasure to the gm:'),
                    _h.inset(
                        _h.pre( `!rt /w gm ${ch('[')+ch('[')}1t${ch('[')}treasure-table${ch(']')+ch(']')+ch(']')}`)
                    ),

                    _h.paragraph('Whispering a roll template:'),
                    _h.inset(
                        _h.pre( `!rt /w gm ${ch('&')+ch('{')}template:default${ch('}')+ch('{')+ch('{')}treasure=${ch('[')+ch('[')}1t${ch('[')}treasure-table${ch(']')+ch(']')+ch(']')+ch('}')+ch('}')}`)
                    ),

                    _h.paragraph('Whispering a roll template, with each item on a separate line:'),
                    _h.inset(
                        _h.pre( `!rt${ch('[')}Delimiter:BR${ch(']')} /w gm ${ch('&')+ch('{')}template:default${ch('}')+ch('{')+ch('{')}treasure=${ch('[')+ch('[')}1t${ch('[')}treasure-table${ch(']')+ch(']')+ch(']')+ch('}')+ch('}')}`)
                    ),

                    _h.paragraph( `Whispering a roll template, with each item on a separate line, with empty results replaced by ${_h.code('Nothing')}:`),
                    _h.inset(
                        _h.pre(`!rt${ch('[')}Delimiter:BR|EmptyDefault:Nothing${ch(']')} /w gm ${ch('&')+ch('{')}template:default${ch('}')+ch('{')+ch('{')}treasure=${ch('[')+ch('[')}1t${ch('[')}treasure-table${ch(']')+ch(']')+ch(']')+ch('}')+ch('}')}`)
                    ),
                    
                    _h.paragraph(`Whispering a roll template, with each item on a separate line, with a table that is returning ${_h.code(`${ch('{')+ch('{')}label=values${ch('}')+ch('}')}`)}:`),
                    _h.inset(
                        _h.pre(`!rt${ch('[')}Delimiter:BR|PrefaceUniqueSpace${ch(']')} ${ch('&')+ch('{')}template:default${ch('}')+ch('{')+ch('{')}name=Treasure Bundles${ch('}')+ch('}')+ch('[')+ch('[')}5t${ch('[')}treasure-bundle${ch(']')+ch(']')+ch(']')}`)
                    )
                )
            )
		);
	},

	getAsBoolean = function(val,defVal){
		let isTrue = _.isBoolean(val) ? val : _.contains(['on','yes','y','true'],(`${val}`||'true').toLowerCase()),
		isFalse =  _.isBoolean(val) ? !val : _.contains(['off','no','n','false'],(`${val}`||'true').toLowerCase());
		if(isTrue || isFalse){
			return !isFalse;
		}
		return !_.isUndefined(defVal) ? defVal : val;
	},

	parseOptions = function(cmdOpts){
		return _.chain((cmdOpts||'').replace(/((?:\\.|[^|])*)\|/g,'$1\n').replace(/\\/,'').split(/\n/))
		.filter((a)=>a.length)
		.reduce((m,o)=>{
			let tok=o.split(/(?:%%|:)/),
			c=tok.shift().toLowerCase(),
			a=tok.join(':')||true;
			switch(c){
				case 'maxdepth':
					a=parseInt(a,10)||defaults[c];
					break;
                case 'iconscale':{
                        if(! regex.cssSize.test(a)){
                            a=defaults[c];
                        }
                    }
                    break;
				case 'showicons':
				case 'iconlabel':
				case 'dropempty':
				case 'sort':
				case 'prefaceuniquespace':
                case 'echo':
					a=getAsBoolean(a,defaults[c]);
					break;
				case 'emptydefault':
                    break;
                case 'prefix':
                case 'suffix':
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

    avatarCache = {},

    lookupAvatar = (tableitemid) => {
        let avatar = (getObj('tableitem',tableitemid)||{get:()=>null}).get('avatar');
        avatarCache[tableitemid] = avatar;
        return avatar;
    },
    getAvatar = (tableitemid) => avatarCache[tableitemid] || lookupAvatar(tableitemid),

	parseInlines = function(inlines,opts){
		const styles = {
			o: {
				'display':       'inline-block',
				'max-width':     '20em',
				'text-align':    'center',
				'border':        '1px solid #aaa',
				'border-radius': '3px',
				'background-color': 'white',
				'margin': '.1em'
			},
			i: {
				'max-width':  opts.iconscale,
				'max-height': opts.iconscale
			},
			t: {
				'border-top': '1px solid #aaa',
				'background-color': '#eee',
                'padding': '.1em'
			}
		};

		const s = (o) => _.map(o,(v,k)=>`${k}:${v};`).join('');
		const formatPart = (part) => (opts.showicons && part.avatar)
			? `<div style="${s(styles.o)}">`+
				`<img style="${s(styles.i)}" src="${part.avatar||clearURL}">`+
				(opts.iconlabel ? `<div style="${s(styles.t)}">${part.text||ch(' ')}</div>` : '')+
				`</div>`
			: part.text
			;

		const composeParts = (parts) => _.compose(
				((x)=>_.map(x,formatPart)),
				(opts.sort ? (x)=>_.sortBy(x,'text') : _.identity),
				(opts.dropempty ?  (x)=>_.filter(x,(v)=>`${v.text}${opts.showicons?v.avatar:''}`.trim().length) : _.identity)
			)(parts).map((o)=>`${opts.prefix}${o}${opts.suffix}`).join(opts.delimiter);
		
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
								if( regex.inlineRoll.test(die.tableItem.name) && subOpts.maxdepth) {
										++context[key].sentinal;

										promises.push(new Promise((done)=>{
											rollAndParseInlines(die.tableItem.name,subOpts)
											.then((text)=>{
												context[key].parts[dieIdx]={
													text: text,
													avatar: die.tableItem.avatar || getAvatar(die.tableItem.id)
												};

												--context[key].sentinal;
												if(!context[key].sentinal){
													subs[key]=composeParts(context[key].parts);
												}
												done(true);
											})
											.catch((e)=>{
												let eRoll=HE(die.tableItem.name);
												sendChat(`RecursiveTables`,`/w "${opts.who}" <div>An Error occured with this TableItem: <code>${eRoll}</code></div><div>Error: <code>${e.message}</code></div>`);
											});
										}));
								} else {
									context[key].parts[dieIdx]={
										text: `${die.tableItem.name}`.trim()||opts.emptydefault,
										avatar: die.tableItem.avatar || getAvatar(die.tableItem.id)
									};
								}
								context[key].hasText=true;
							} else {
								context[key].parts[dieIdx]=die.v;
							}
						});


						if(context[key].hasText && !context[key].sentinal){
							subs[key]=composeParts(context[key].parts);
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

            let prefixer=(opts.prefaceuniquespace ? makePrefixer(' ') : _.identity);
			msg.content=(msg.content||'[EMPTY]').replace(/(?:\{\{)([^=]*)(?:=)/g,(full,match)=>`{{${prefixer(match)}=`);
            
			if(_.has(msg,'rolltemplate') && _.isString(msg.rolltemplate) && msg.rolltemplate.length){
				msg.content = msg.content.replace(/\{\{/,'&{template:'+msg.rolltemplate+'} {{');
			}
            if(opts.echo && !(/^\/w\s+gm\s+/.test(msg.content) && playerIsGM(msg.playerid))){
               sendChat(`${msg.who} [echo]`,`/w "${opts.who}" ${msg.content.replace(/^\/w\s+(?:"[^"]*"|'[^']'|\S+)\s*/,'')}`);
            }
			sendChat(msg.who||'[BLANK]',msg.content);
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

			cmd = (msg.content.match(regex.rtCmd)||[]).splice(1);
			args = msg.content.replace(regex.rtCmd,'').trim().split(/\s+/);
			switch(cmd[0]) {
				case '!rt':
					if('--help' === args[0]){
						showHelp(msg.playerid);
					} else {
						opts = parseOptions(cmd[1]);
						opts.who = who;
						msg.content = msg.content.replace(regex.rtCmd,'');
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

