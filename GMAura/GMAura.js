// Github:   https://github.com/shdwjk/Roll20API/blob/master/GMAura/GMAura.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

on('ready',()=>{
	
    const version = '0.1.0';
    const lastUpdate = 1567481378;
    const schemaVersion = 0.1;
	const clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';
	const regex = {
			color : {
				ops: '([*=+\\-!])?',
				transparent: '(transparent)',
				html: '#?((?:[0-9a-f]{6})|(?:[0-9a-f]{3}))',
				rgb: '(rgb\\(\\s*(?:(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)|(?:\\d+)\\s*,\\s*(?:\\d+)\\s*,\\s*(?:\\d+))\\s*\\))',
				hsv: '(hsv\\(\\s*(?:(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)|(?:\\d+)\\s*,\\s*(?:\\d+)\\s*,\\s*(?:\\d+))\\s*\\))'
			}
		};
	const colorReg = new RegExp(`^(?:${regex.color.transparent}|${regex.color.html}|${regex.color.rgb}|${regex.color.hsv})$`,'i');
	const colorParams = /\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\)/;

	let auraLookup = {};


    const checkInstall = () => {
        log('-=> GMAura v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'GMAura') || state.GMAura.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.GMAura && state.GMAura.version) {
                case 0.0:
                case 'UpdateSchemaVersion':
                    state.GMAura.version = schemaVersion;
                    break;
                default:
                    state.GMAura = {
                        version: schemaVersion,
						lookup: { }
                    };
                    break;
            }
        }

		let cleanup = [];
		let keys = Object.keys(state.GMAura.lookup);
		const burndown = () => {
			if(keys.length){
				let key = keys.shift();
				let g = getObj('graphic',key);
				if(g){
					state.GMAura.lookup[key].forEach( id => auraLookup[id]=key);
					handleTokenChange(g,{left:false,top:false,width:false,height:false});
				} else {
					cleanup.push(key);
				}
				setTimeout(burndown,0);
			} else {
				cleanup.forEach(id => delete state.GMAura.lookup[id]);
			}
		};
		burndown();
    };

    const processInlinerolls = (msg) => {
        if(_.has(msg,'inlinerolls')){
            return _.chain(msg.inlinerolls)
                .reduce(function(m,v,k){
                    let ti=_.reduce(v.results.rolls,function(m2,v2){
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
        } else {
            return msg.content;
        }
    };

	class Color {
		static hsv2rgb(h, s, v) {
			let r, g, b;

			let i = Math.floor(h * 6);
			let f = h * 6 - i;
			let p = v * (1 - s);
			let q = v * (1 - f * s);
			let t = v * (1 - (1 - f) * s);

			switch (i % 6) {
				case 0: r = v, g = t, b = p; break;
				case 1: r = q, g = v, b = p; break;
				case 2: r = p, g = v, b = t; break;
				case 3: r = p, g = q, b = v; break;
				case 4: r = t, g = p, b = v; break;
				case 5: r = v, g = p, b = q; break;
			}

			return { r , g , b };
		}

		static rgb2hsv(r,g,b) {
			let max = Math.max(r, g, b),
				min = Math.min(r, g, b);
			let h, s, v = max;

			let d = max - min;
			s = max == 0 ? 0 : d / max;

			if (max == min) {
				h = 0; // achromatic
			} else {
				switch (max) {
					case r: h = (g - b) / d + (g < b ? 6 : 0); break;
					case g: h = (b - r) / d + 2; break;
					case b: h = (r - g) / d + 4; break;
				}

				h /= 6;
			}

			return { h, s, v };
		}

		static dec2hex (n){
			n = (Math.max(Math.min(Math.round(n*255),255), 0)||0);
			return `${n<16?'0':''}${n.toString(16)}`;
		}

		static hex2dec (n){
			return Math.max(Math.min(parseInt(n,16),255), 0)/255;
		}

		static html2rgb(htmlstring){
			let s=htmlstring.toLowerCase().replace(/[^0-9a-f]/,'');
			if(3===s.length){
				s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}`;
			}
			return {
				r: this.hex2dec(s.substr(0,2)),
				g: this.hex2dec(s.substr(2,2)),
				b: this.hex2dec(s.substr(4,2))
			};
		}

		static parseRGBParam(p){
			if(/\./.test(p)){
				return parseFloat(p);
			}
			return parseInt(p,10)/255;
		}
		static parseHSVParam(p,f){
			if(/\./.test(p)){
				return parseFloat(p);
			}
			switch(f){
				case 'h':
					return parseInt(p,10)/360;
				case 's':
				case 'v':
					return parseInt(p,10)/100;
			}
		}

		static parseColor(input){
			return Color.buildColor(input.toLowerCase().match(colorReg));
		}
		static buildColor(parsed){
			const idx = {
				transparent: 1,
				html: 2,
				rgb: 3,
				hsv: 4
			};

			if(parsed){
				let c = new Color();
				if(parsed[idx.transparent]){
					c.type = 'transparent';
				} else if(parsed[idx.html]){
					c.type = 'rgb';
					_.each(Color.html2rgb(parsed[idx.html]),(v,k)=>{
						c[k]=v;
					});
				} else if(parsed[idx.rgb]){
					c.type = 'rgb';
					let params = parsed[idx.rgb].match(colorParams);
					c.r= Color.parseRGBParam(params[1]);
					c.g= Color.parseRGBParam(params[2]);
					c.b= Color.parseRGBParam(params[3]);
				} else if(parsed[idx.hsv]){
					c.type = 'hsv';
					let params = parsed[idx.hsv].match(colorParams);
					c.h= Color.parseHSVParam(params[1],'h');
					c.s= Color.parseHSVParam(params[2],'s');
					c.v= Color.parseHSVParam(params[3],'v');
				} 
				return c;
			}
			return new Color();
		}

		constructor(){
			this.type='transparent';
		}

		clone(){
			return Object.assign(new Color(), this);
		}

		toRGB(){
			if('hsv'===this.type){
				_.each(Color.hsv2rgb(this.h,this.s,this.v),(v,k)=>{
					this[k]=v;
				});
				this.type='rgb';
			} else if ('transparent' === this.type){
				this.type='rgb';
				this.r=0.0;
				this.g=0.0;
				this.b=0.0;
			}
			delete this.h;
			delete this.s;
			delete this.v;
			return this;
		}

		toHSV(){
			if('rgb'===this.type){
				_.each(Color.rgb2hsv(this.r,this.g,this.b),(v,k)=>{
					this[k]=v;
				});
				this.type='hsv';
			} else if('transparent' === this.type){
				this.type='hsv';
				this.h=0.0;
				this.s=0.0;
				this.v=0.0;
			}

			delete this.r;
			delete this.g;
			delete this.b;

			return this;
		}

		toHTML(){
			switch(this.type){
				case 'transparent':
					return 'transparent';
				case 'hsv': {
					return this.clone().toRGB().toHTML();
				}
				case 'rgb':
					return `#${Color.dec2hex(this.r)}${Color.dec2hex(this.g)}${Color.dec2hex(this.b)}`;
			}
		}
	}

	const parseColor = (color) => {
		let c = Color.parseColor(color).toHTML();
		return 'transparent' === c ? '#ff00ff' : c;
	};

	const AddAura = (token, options) => {
		let a = createObj('graphic',
			Object.assign({
				imgsrc: clearURL,
				layer: 'gmlayer',
				pageid: token.get('pageid'),
				name: '',
				showname: false,
				width: token.get('width'),
				height: token.get('height'),
				top: token.get('top'),
				left: token.get('left'),
				showplayers_name: false,
				showplayers_bar1: false,
				showplayers_bar2: false,
				showplayers_bar3: false,
				showplayers_aura1: false,
				showplayers_aura2: false,
				playersedit_name: true,
				playersedit_bar1: true,
				playersedit_bar2: true,
				playersedit_bar3: true,
				playersedit_aura1: true,
				playersedit_aura2: true
			},options)
		);
		state.GMAura.lookup[token.id] = state.GMAura.lookup[token.id] || [];
		state.GMAura.lookup[token.id].push(a.id); 
		auraLookup[a.id] = token.id;
	};

	const handleTokenChange = (obj, prev) => {
		if(state.GMAura.lookup.hasOwnProperty(obj.id)){
			let changes = {};
			let width = obj.get('width');
			let height = obj.get('height');
			let top = obj.get('top');
			let left = obj.get('left');

			if(width != prev.width) { changes.width = width; }
			if(height != prev.height) { changes.height = height; }
			if(top != prev.top) { changes.top = top; }
			if(left != prev.left) { changes.left = left; }

			if(Object.keys(changes).length){
				state.GMAura.lookup[obj.id]
					.map( id => getObj('graphic',id))
					.filter( g => undefined !== g)
					.forEach( g => g.set(changes))
					;
			}
		} else if(auraLookup.hasOwnProperty(obj.id)){
			let changes = {};
			let width = obj.get('width');
			let height = obj.get('height');
			let top = obj.get('top');
			let left = obj.get('left');

			if(width != prev.width) { changes.width = prev.width; }
			if(height != prev.height) { changes.height = prev.height; }
			if(top != prev.top) { changes.top = prev.top; }
			if(left != prev.left) { changes.left = prev.left; }

			if(Object.keys(changes).length){
				obj.set(changes);
			}
		}
	};

	const handleTokenRemove = (obj) => {
		if(state.GMAura.lookup.hasOwnProperty(obj.id)){
			state.GMAura.lookup[obj.id]
				.map( id => getObj('graphic',id))
				.filter( g => undefined !== g)
				.forEach( g => {
					delete auraLookup[g.id];
					g.remove();
				});
			delete state.GMAura.lookup[obj.id];
		} else if(auraLookup.hasOwnProperty(obj.id)){
			let tid = auraLookup[obj.id];
			state.GMAura.lookup[tid] = state.GMAura.lookup[tid].filter(id=>id !== obj.id);
			if(0 === state.GMAura.lookup[tid].length){
				delete state.GMAura.lookup[tid];
			}
		}
	};

	const ch = (c) => {
		const entities = {
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
					'*' : 'ast',
					'/' : 'sol',
					' ' : 'nbsp'
		};

		if( entities.hasOwnProperty(c) ){
			return `&${entities[c]};`;
		}
		return '';
	};

	const _h = {
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
	};

    const showHelp = (who) =>{
        let msg = _h.outer(
            _h.title('GMAura',version),
            _h.header(
                _h.paragraph('GMAura creates gm-only auras on selected or specified tokens.'),
				_h.paragraph(`Auras are created as invisible tokens on the GM layer with their aura 1 set up with the specified options.  Changes to the location and size of the original token will be mimicked by the aura tokens.  Changes to the location and size of the aura tokens will be reverted to keep them synchronized to the object layer token.  To remove an aura, simply delete its gm layer token.  Removal of the object layer token will cause the aura tokens to be cleaned up.`)
            ),
            _h.subhead('Commands'),
            _h.inset(
                _h.font.command(
                    `!gm-aura`,
                    `--help`
                ),
                _h.paragraph('Show this help.')
            ),
            _h.inset(
                _h.font.command(
                    `!gm-aura`,
					_h.optional(
						`--color ${_h.required('color')}`,
						`--c ${_h.required('color')}`
					),
					_h.optional(
						`--radius ${_h.required('radius')}`,
						`--r ${_h.required('radius')}`
					),
					_h.optional(
						`--square`,
						`--s`
					),
					_h.optional(
						`--ids ${_h.required(`token id`)} ${_h.optional(`token id ...`)}`
					)
                ),
                _h.paragraph('This command creates an invisible ura token on the GM layer for each selected or specified token.'),
                _h.ul(
                    `${_h.bold(`--color ${_h.required('color')}`)} -- Sets the color of the created aura. (Default: ${_h.code('#ff00ff')})  Any color format that works for TokenMod works (except ${_h.code('transparent')}).`,
                    `${_h.bold(`--c ${_h.required('color')}`)} -- Shorthand for ${_h.bold('--color')}.`,
                    `${_h.bold(`--radius ${_h.required('radius')}`)} -- Sets the radius of the created aura. The number is relative to the page just like regular auras, usually 5 for one square. (Default: ${_h.code('0')}, or just on the token.)`,
                    `${_h.bold(`--r ${_h.required('radius')}`)} -- Shorthand for ${_h.bold('--radius')}.`,
                    `${_h.bold(`--square`)} -- Sets the created aura to be square. (Default: ${_h.code('round')})`,
                    `${_h.bold(`--s`)} -- Shorthand for ${_h.bold('--square')}.`,
                    `${_h.bold(`--ids ${_h.required(`token id`)} ${_h.optional(`token id ...`)}`)}  -- a list of token ids to create auras for.`
                ),
                _h.inset(
                    _h.preformatted(
                        `!gm-aura --color #ff0000 --radius 10 --square`
                    )
                ),
                _h.paragraph(`${_h.bold('Note:')} You can create multi-line commands by enclosing the arguments after ${_h.code('!gm-aura')} in ${_h.code('{{')} and ${_h.code('}}')}.`),
                _h.inset(
                    _h.preformatted(
                        `!gm-aura {{`,
                        `  --c rgb(.7,.7,.3)`,
                        `  --r 15`,
                        `}}`
                    )
                ),
                _h.paragraph(`${_h.bold('Note:')} You can use inline rolls as part of your command`),
                _h.inset(
                    _h.preformatted(
                        `!gm-aura --radius ${ch('[')}${ch('[')}1d3*5${ch(']')}${ch(']')}`
                    )
                )
			),
			_h.subhead('Colors'),
			_h.inset(
				_h.paragraph(`Colors can be specified in multiple formats:`),
				_h.inset(
					_h.ul(
						`${_h.bold('HTML Color')} -- This is 6 or 3 hexadecimal digits, optionally prefaced by ${_h.code('#')}.  Digits in a 3 digit hexadecimal color are doubled.  All of the following are the same: ${_h.code('#ff00aa')}, ${_h.code('#f0a')}, ${_h.code('ff00aa')}, ${_h.code('f0a')}`,
						`${_h.bold('RGB Color')} -- This is an RGB color in the format ${_h.code('rgb(1.0,1.0,1.0)')} or ${_h.code('rgb(256,256,256)')}.  Decimal numbers are in the scale of 0.0 to 1.0, integer numbers are scaled 0 to 256.  Note that numbers can be outside this range for the purpose of doing math.`,
						`${_h.bold('HSV Color')} -- This is an HSV color in the format ${_h.code('hsv(1.0,1.0,1.0)')} or ${_h.code('hsv(360,100,100)')}.  Decimal numbers are in the scale of 0.0 to 1.0, integer numbers are scaled 0 to 360 for the hue and 0 to 100 for saturation and value.  Note that numbers can be outside this range for the purpose of doing math.`
					)
				)
			)

        );
        sendChat('',`/w "${who}" ${msg}`);
    };

	/*
	 * !gm-aura
	 * !gm-aura --color #ff0000
	 * !gm-aura --color #ff0000 -- radius 5
	 * !gm-aura --color #ff0000 -- radius 5 --square
	 * !gm-aura --color #ff0000 -- radius 5 --square --ids foo bar baz
	 */
	on('chat:message', msg => {
		if('api' === msg.type && /^!gm-aura(\b|$)/i.test(msg.content) && playerIsGM(msg.playerid) ){
			let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

            let args = processInlinerolls(msg)
                .replace(/<br\/>\n/g, ' ')
                .replace(/(\{\{(.*?)\}\})/g," $2 ")
                .split(/\s+--/);

			if(args.filter(a => /^help/i.test(a)).length){
				showHelp(who);
				return;
			}

            let ids = (msg.selected||[]).map(o=>o._id);

			let opts = {
				aura1_color: '#ff00ff',
				aura1_radius: 0.0001,
				aura1_square: false
			};

			args.forEach( arg => {
				let cmds = arg.split(/\s+/);
				switch(cmds.shift()){
					case 'c':
					case 'color':
						opts.aura1_color = parseColor(cmds[0]);
						break;

					case 'r':
					case 'radius':
						opts.aura1_radius = parseInt(cmds[0]) || 0.00001;
						break;

					case 's':
					case 'square':
						opts.aura1_square = true;
						break;

					case 'ids':
						ids = [...ids,...cmds];
						break;
				}
			});

            [...new Set(ids)]
				.map(id=>getObj('graphic',id))
				.filter(g=>undefined !== g)
				.forEach( t => AddAura(t,opts))
				;
		}
	});



	checkInstall();
	on('change:graphic', handleTokenChange);
	on('destroy:graphic', handleTokenRemove);
	
});
