// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenMod/TokenMod.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const TokenMod = (() => { // eslint-disable-line no-unused-vars

    const version = '0.8.56';
    const lastUpdate = 1589026818;
    const schemaVersion = 0.4;

    const fields = {
            // booleans
            showname: {type: 'boolean'},
            showplayers_name: {type: 'boolean'},
            showplayers_bar1: {type: 'boolean'},
            showplayers_bar2: {type: 'boolean'},
            showplayers_bar3: {type: 'boolean'},
            showplayers_aura1: {type: 'boolean'},
            showplayers_aura2: {type: 'boolean'},
            playersedit_name: {type: 'boolean'},
            playersedit_bar1: {type: 'boolean'},
            playersedit_bar2: {type: 'boolean'},
            playersedit_bar3: {type: 'boolean'},
            playersedit_aura1: {type: 'boolean'},
            playersedit_aura2: {type: 'boolean'},
            light_otherplayers: {type: 'boolean'},
            light_hassight: {type: 'boolean'},
            isdrawing: {type: 'boolean'},
            flipv: {type: 'boolean'},
            fliph: {type: 'boolean'},
            aura1_square: {type: 'boolean'},
            aura2_square: {type: 'boolean'},
            
                // UDL settings
            has_bright_light_vision: {type: 'boolean'},
            has_night_vision: {type: 'boolean'},
            emits_bright_light: {type: 'boolean'},
            emits_low_light: {type: 'boolean'},

            // bounded by screen size
            left: {type: 'number', transform: 'screen'},
            top: {type: 'number', transform: 'screen'},
            width: {type: 'number', transform: 'screen'},
            height: {type: 'number', transform: 'screen'},
            scale: {type: 'number', transform: 'screen'},

            // 360 degrees
            rotation: {type: 'degrees'},
            light_angle: {type: 'circleSegment'},
            light_losangle: {type: 'circleSegment'},

            // distance
            light_radius: {type: 'numberBlank'},
            light_dimradius: {type: 'numberBlank'},
            light_multiplier: {type: 'numberBlank'},
            adv_fow_view_distance: {type: 'numberBlank'},
            aura1_radius: {type: 'numberBlank'},
            aura2_radius: {type: 'numberBlank'},

                //UDL settings
            night_vision_distance: {type: 'numberBlank'},
            bright_light_distance: {type: 'numberBlank'},
            low_light_distance: {type: 'numberBlank'},

            // text or numbers
            bar1_value: {type: 'text'},
            bar2_value: {type: 'text'},
            bar3_value: {type: 'text'},
            bar1_max: {type: 'text'},
            bar2_max: {type: 'text'},
            bar3_max: {type: 'text'},
            bar1: {type: 'text'},
            bar2: {type: 'text'},
            bar3: {type: 'text'},
            bar1_reset: {type: 'text'},
            bar2_reset: {type: 'text'},
            bar3_reset: {type: 'text'},


            // colors
            aura1_color: {type: 'color'},
            aura2_color: {type: 'color'},
            tint_color: {type: 'color'},

            // Text : special
            name: {type: 'text'},
            statusmarkers: {type: 'status'},
            layer: {type: 'layer'},
            represents: {type: 'character_id'},
            bar1_link: {type: 'attribute'},
            bar2_link: {type: 'attribute'},
            bar3_link: {type: 'attribute'},
			currentSide: {type: 'sideNumber'},
            imgsrc: {type: 'image'},
			sides: {type: 'image' },

            controlledby: {type: 'player'},

            // <Blank> : special
            defaulttoken: {type: 'defaulttoken'}
        };

    const fieldAliases = {
            bar1_current: "bar1_value",
            bar2_current: "bar2_value",
            bar3_current: "bar3_value",
            bright_vision: "has_bright_light_vision",
            night_vision: "has_night_vision",
            emits_bright: "emits_bright_light",
            emits_low: "emits_low_light",
            night_distance: "night_vision_distance",   
            bright_distance: "bright_light_distance",    
            low_distance: "low_light_distance",
            currentside: "currentSide"   // fix for case issue
        };

    const reportTypes = [
            'gm', 'player', 'all', 'control', 'token', 'character'
        ];

    const propBool = {
      couldbe:   ()=>(randomInteger(8)<=1),
      sometimes: ()=>(randomInteger(8)<=2),
      maybe:     ()=>(randomInteger(8)<=4),
      probably:  ()=>(randomInteger(8)<=6),
      likely:    ()=>(randomInteger(8)<=7)
    };

    const unalias = (name) => fieldAliases.hasOwnProperty(name) ? fieldAliases[name] : name;

    const filters = {
            hasArgument: (a) => a.match(/.+[|#]/) || 'defaulttoken'===a,
            isBoolean: (a) => 'boolean' === (fields[a]||{type:'UNKNOWN'}).type,
            isTruthyArgument: (a) => [1,'1','on','yes','true','sure','yup'].includes(a)
        };

	const getCleanImgsrc = (imgsrc) => {
			var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
			if(parts) {
				return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
			}
			return;
		};

    const regex = {
            numberString: /^[-+*/]?(0|[1-9][0-9]*)([.]+[0-9]*)?([eE][+-]?[0-9]+)?$/,
            stripSingleQuotes: /'([^']+(?='))'/g,
            stripDoubleQuotes: /"([^"]+(?="))"/g,
            layers: /^(?:gmlayer|objects|map|walls)$/,

            imgsrc: /(.*\/images\/.*)(thumb|med|original|max)(.*)$/,
            imageOp: /^(?:(-(?:\d*(?:\s*,\s*\d+)*|\*)$)|(\/(?:\d+@\d+(?:\s*,\s*\d+@\d+)*|\*)$)|([+^]))?(=?)(?:(https?:\/\/.*$)|([-\d\w]*))(?::(.*))?$/,
			sideNumber: /^(\?)?([-+=*])?(\d*)$/,
			color : {
				ops: '([*=+\\-!])?',
				transparent: '(transparent)',
				html: '#?((?:[0-9a-f]{6})|(?:[0-9a-f]{3}))',
				rgb: '(rgb\\(\\s*(?:(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)|(?:\\d+)\\s*,\\s*(?:\\d+)\\s*,\\s*(?:\\d+))\\s*\\))',
				hsv: '(hsv\\(\\s*(?:(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)\\s*,\\s*(?:\\d*\\.\\d+)|(?:\\d+)\\s*,\\s*(?:\\d+)\\s*,\\s*(?:\\d+))\\s*\\))'
			}
        };

	const colorOpReg = new RegExp(`^${regex.color.ops}(?:${regex.color.transparent}|${regex.color.html}|${regex.color.rgb}|${regex.color.hsv})$`,'i');
	const colorReg = new RegExp(`^(?:${regex.color.transparent}|${regex.color.html}|${regex.color.rgb}|${regex.color.hsv})$`,'i');
	const colorParams = /\(\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\)/;



        ////////////////////////////////////////////////////////////
        // Number Operations
        ////////////////////////////////////////////////////////////

        class numberOp {
            static parse(field, str, permitBlank=true) {
                const regexp = /^([=+\-/*!])?(-?\d+\.?|\d*\.\d+)(u|g|s|ft|m|km|mi|in|cm|un|hex|sq)?$/i;

                if(!str.length && permitBlank){
                    return new numberOp(field, '','','' );
                }

                let m = `${str}`.match(regexp);

                if(m){
                    let oper = m[1]||'';
                    let num = parseFloat(m[2]);
                    let scale = m[3]||'';

                    return new numberOp(field, oper, num, scale.toLowerCase());
                }
                return {getMods:()=>({})};
            }

            constructor(field,op,num,rel){
                this.field=field;
                this.operation = op;
                this.num = num;
                this.relative = rel;
            }

            getMods(token,mods){
                let num = this.num;
                let page = getObj('page',token.get('pageid'));
                const unitSize = 70;
                switch(this.field){

                    case 'light_radius':
                    case 'light_dimradius':
                    case 'aura2_radius':
                    case 'aura1_radius':
                    case 'adv_fow_view_distance':
                    case 'night_vision_distance':
                    case 'bright_light_distance':
                    case 'low_light_distance':
                    case 'night_distance':
                    case 'bright_distance':
                    case 'low_distance':
                        // convert to scale_number relative
                        switch(this.relative){
                            case 'u':
                                num*=(parseFloat(page.get('scale_number'))*(1/parseFloat(page.get('snapping_increment'))||1));
                                break;
                                
                            case 'g':
                                num*=parseFloat(page.get('scale_number'));
                                break;

                            default:
                            case 'ft':
                            case 'm':
                            case 'km':
                            case 'mi':
                            case 'in':
                            case 'cm':
                            case 'un':
                            case 'hex':
                            case 'sq':
                            case 's':
                                break;
                        }
                        break;

                    default:
                    case 'left':
                    case 'top':
                    case 'width':
                    case 'height':
                        // convert to pixel relative
                        switch(this.relative){
                            case 'u':
                                num*=unitSize;
                                break;
                            case 'g':
                                num*=(parseFloat(page.get('snapping_increment'))*unitSize);
                                break;

                            case 'ft':
                            case 'm':
                            case 'km':
                            case 'mi':
                            case 'in':
                            case 'cm':
                            case 'un':
                            case 'hex':
                            case 'sq':
                            case 's':
                                num = (num/(parseFloat(page.get('scale_number'))||1))*unitSize;
                                break;
                            default:
                        }

                        break;

                    case 'light_multiplier':
                        break;

                }

                let current = parseFloat(token.get(this.field))||0;
                const getValue = (k,m,t) => m.hasOwnProperty(k) ? m[k] : t.get(k);
                switch(this.operation){
                    default:
                    case '=': {
                        switch(this.field){
                            case 'bright_light_distance':
                                return {
                                    bright_light_distance: num,
                                    low_light_distance: (parseFloat(getValue('low_light_distance',mods,token))-parseFloat(getValue('bright_light_distance',mods,token))+num)
                                };
                            case 'low_light_distance':
                                return {
                                    low_light_distance: (parseFloat(getValue('bright_light_distance',mods,token))+num)
                                };
                            default:
                                return {[this.field]:num};
                        }
                    }
                    case '!': return {[this.field]:(current===0 ? num : '')};
                    case '+': return {[this.field]:(current+num)};
                    case '-': return {[this.field]:(current-num)};
                    case '/': return {[this.field]:(current/(num||1))};
                    case '*': return {[this.field]:(current*num)};
                }
            }

        }

        ////////////////////////////////////////////////////////////
        // Image Operations
        ////////////////////////////////////////////////////////////


        class imageOp {
          static parseImage(input){
            const OP_REMOVE_BY_INDEX = 1;
            const OP_REORDER = 2;
            const OP_OPERATION = 3;
            const OP_EXPLICIT_SET = 4;
            const OP_IMAGE_URL = 5;
            const OP_TOKEN_ID = 6;
            const OP_TOKEN_SIDE_INDEX = 7;

            let parsed = input.match(regex.imageOp);

            if(parsed && parsed.length){
              if(parsed[ OP_REMOVE_BY_INDEX ]){
                let idxs=parsed[ OP_REMOVE_BY_INDEX ].slice(1);
                return new imageOp('-',false,
                  '*'===idxs
                  ? ['*']
                  : idxs.split(/\s*,\s*/).filter(s=>s.length).map((idx)=>parseInt(idx,10)-1)
                );
              } else if(parsed[ OP_REORDER ]){
                let idxs=parsed[ OP_REORDER ].slice(1);

                return new imageOp('/',false,
                  idxs.split(/\s*,\s*/)
                    .filter(s=>s.length)
                    .map((idx)=>{
                      let parts = idx.split(/@/);
                      return {
                        idx: (parseInt(parts[0])-1),
                        pos: (parseInt(parts[1]))
                      };
                    })
                );
              } else {
                let op = parsed[ OP_OPERATION ]||'_';
                let set = '='===parsed[ OP_EXPLICIT_SET ];
                if(parsed[ OP_IMAGE_URL ]){

                  let parts = parsed[ OP_IMAGE_URL ].split(/:@/);
                  let url=getCleanImgsrc(parts[0]);
                  if(url){
                    return new imageOp(op,set,[],[{url,index:parseInt(parts[1])||undefined}]);
                  }
                } else {
                  let id = parsed[ OP_TOKEN_ID ];
                  let t = getObj('graphic',id);

                  if(t){
                    if(parsed[ OP_TOKEN_SIDE_INDEX ]){
                      let sides = t.get('sides');
                      if(sides.length){
                        sides = sides.split(/\|/).map(decodeURIComponent).map(getCleanImgsrc);
                      } else {
                        sides = [getCleanImgsrc(t.get('imgsrc'))];
                      }
                      let urls=[];
                      let idxs;
                      if('*'===parsed[ OP_TOKEN_SIDE_INDEX ]){
                        idxs=sides.reduce((m,v)=> ({ c:m.c+1, i:(v?[...m.i,m.c]:m.i) }), {c:0,i:[]}).i.map(id=>({idx:id}));
                      } else {
                        idxs=parsed[ OP_TOKEN_SIDE_INDEX ]
                          .split(/\s*,\s*/)
                          .filter(s=>s.length)
                          .map((idx)=>({
                            idx: (parseInt(idx,10)||1)-1,
                            insert: parseInt(idx.split(/@/)[1])||undefined
                          }));
                      }
                      idxs.forEach((i)=>{
                        if(sides[i.idx]){
                          urls.push({url:sides[i.idx], index: i.insert });
                        }
                      });

                      if(urls.length){
                        return new imageOp(op,set,[],urls);
                      }
                    } else {
                      let url=getCleanImgsrc(t.get('imgsrc'));
                      if(url){
                        return new imageOp(op,set,[],[{url}]);
                      }
                    }
                  }
                }
              }
            }
            return new imageOp();
          }

          constructor(op,set,indicies,urls){
            //$d({op,set,indicies,urls});
            this.op = op||'/';
            this.set = set || false;
            this.indicies=indicies||[];
            this.urls=urls||[];
          }

          getMods(token,mods){
            let sideText = token.get('sides');
            let sides;


            if( sideText.length ){
              sides = sideText.split(/\|/).map(decodeURIComponent).map(getCleanImgsrc);
            } else {
              sides = [getCleanImgsrc(token.get('imgsrc'))];
              if('^' === this.op){
                this.op = '_';
              }
            }

            switch(this.op) {
              case '-': {
                if('*'===this.indicies[0]){
                  return {
                    currentSide: 0,
                    sides: ''
                  };
                }
                let currentSide=token.get('currentSide');
                if(this.indicies.length){
                  this.indicies.forEach((i)=>{
                    if(currentSide===i){
                      currentSide=0;
                    }
                    delete sides[i];
                  });
                } else {
                  delete sides[currentSide];
                  currentSide=0;
                }
                let idxs=sides.reduce((m,v)=> ({ c:m.c+1, i:(v?[...m.i,m.c]:m.i) }), {c:0,i:[]}).i;
                sides=sides.reduce((m,s)=>m.concat( s ? [s] : []),[]);
                currentSide=Math.max(_.indexOf(idxs,currentSide),0);
                if(sides.length){
                  return {
                    imgsrc: sides[currentSide],
                    currentSide: currentSide,
                    sides: sides.reduce((m,s)=>m.concat(s),[]).map(encodeURIComponent).join('|')
                  };
                }
                return {
                  currentSide: 0,
                  sides: ''
                };
              }

              case '/': {
                let currentSide=token.get('currentSide');
                let imgsrc=token.get('imgsrc');
                let sidesOld=token.get('sides');

                sides = this.indicies.reduce( (s,o) => {
                  let url = s[o.idx];
                  s.splice(o.idx,1);
                  return [...s.slice(0,(o.pos||Number.MAX_SAFE_INTEGER)-1), url, ...s.slice((o.pos||Number.MAX_SAFE_INTEGER)-1)];
                },sides);


                let retr = {
                  sides: sides.map(encodeURIComponent).join('|')
                };
                if(retr.sides===sidesOld){
                  delete retr.sides;
                }

                if(imgsrc !== sides[currentSide]){
                  retr.imgsrc=sides[currentSide];
                }
                return retr;
              }

              case '_': 
                return {
                  imgsrc: this.urls[0].url
                };

              case '^': {
                // replacing
                let currentSide=token.get('currentSide');
                let imgsrc=token.get('imgsrc');

                sides = this.urls.reduce((s,u) => {
                  let replaceIdx =(u.index||Number.MAX_SAFE_INTEGER)-1;
                  if(sides.hasOwnProperty(replaceIdx)){
                    sides[replaceIdx] = u.url;
                  } else {
                    sides.push(u.url);
                  }
                  return sides;
                },sides);

                let retr = {
                  sides: sides.map(encodeURIComponent).join('|')
                };
                if(this.set){
                  retr.imgsrc=sides.slice(-1)[0];
                  retr.currentSide=sides.length-1;
                }
                if(imgsrc !== sides[currentSide]){
                  retr.imgsrc=sides[currentSide];
                }
                return retr;
              }

              case '+': {

                // appending
                let currentSide=token.get('currentSide');
                let imgsrc=token.get('imgsrc');
                sides = this.urls.reduce((s,u) =>
                [...s.slice(0,(u.index||Number.MAX_SAFE_INTEGER)-1), u.url, ...s.slice((u.index||Number.MAX_SAFE_INTEGER)-1)]
                ,sides);
                let retr = {
                  sides: sides.map(encodeURIComponent).join('|')
                };
                if(this.set){
                  retr.imgsrc=sides.slice(-1)[0];
                  retr.currentSide=sides.length-1;
                }
                if(imgsrc !== sides[currentSide]){
                  retr.imgsrc=sides[currentSide];
                }
                return retr;
              }
            }
            return {};
          }
        }

        ////////////////////////////////////////////////////////////
        // Side Numbers
        ////////////////////////////////////////////////////////////

		class sideNumberOp {

			static parseSideNumber(input){
                const OP_FLAG = 1;
                const OP_OPERATION = 2;
                const OP_COUNT = 3;
				let parsed = input.toLowerCase().match(regex.sideNumber);
				if(parsed && parsed.length){
					return new sideNumberOp( parsed[ OP_FLAG ], parsed[ OP_OPERATION ], parsed[ OP_COUNT ] );
				}
				return new sideNumberOp(false,'/');
			}

			constructor(flag,op,count){
				this.flag=flag||false;
				this.operation=op||'=';
				this.count=(parseInt(`${count}`)||1);
			}


			getMods(token,mods){
				// get sides
				let sides = token.get('sides').split(/\|/).map(decodeURIComponent).map(getCleanImgsrc);
				switch(this.operation){
					case '/':
						return {};
					case '=':
						if(sides[this.count-1]){
							return {
								currentSide: this.count-1,
								imgsrc: sides[this.count-1]
							};
						}
						return {};
					case '*': {
						// get indexes that are valid
						let idxs=sides.reduce((m,v)=> ({ c:m.c+1, i:(v?[...m.i,m.c]:m.i) }), {c:0,i:[]}).i;
						if(idxs.length){
							let idx=_.sample(idxs);
							return {
								currentSide: idx,
								imgsrc: sides[idx]
							};
						}
						return {};
					}
					case '+':
					case '-': {
						let idx = token.get('currentSide')||0;
						idx += ('-'===this.operation ? -1 : 1)*this.count;
						if(this.flag){
							idx=Math.max(Math.min(idx,sides.length-1),0);
						} else {
							idx=(idx%sides.length)+(idx<0 ? sides.length : 0);
						}
						if(sides[idx]){
							return {
								currentSide: idx,
								imgsrc: sides[idx]
							};
						}
						return {};
					}
							
				}
				
			}
		}


        ////////////////////////////////////////////////////////////
        // Colors
        ////////////////////////////////////////////////////////////

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

		class ColorOp extends Color {

			constructor( op ) {
				super();
				this.operation = op;
			}

			static parseColor(input){
				const idx = {
					ops: 1,
					transparent: 2,
					html: 3,
					rgb: 4,
					hsv: 5
				};

				let parsed = input.toLowerCase().match(colorOpReg)||[];

				if(parsed.length) {
					return Object.assign(new ColorOp(parsed[idx.ops]||'='), Color.buildColor(parsed.slice(1)));
				} else {
					return Object.assign(new ColorOp(parsed[idx.ops]||(input.length ? '*':'=')), Color.parseColor('transparent'));
				}
			}

			applyTo(c){
				if( !(c instanceof Color) ){
					c = Color.parseColor(c);
				}
				switch(this.operation){
					case '=':
						return this;
					case '!':
						return ('transparent'===c.type ? this : Color.parseColor('transparent'));
				}
				switch(this.type){
					case 'transparent':
						return c;
					case 'hsv':
						c.toHSV();
						switch(this.operation){
							case '*':
								c.h*=this.h;
								c.s*=this.s;
								c.v*=this.v;
								c.toRGB();
								return c;
							case '+':
								c.h+=this.h;
								c.s+=this.s;
								c.v+=this.v;
								c.toRGB();
								return c;
							case '-':
								c.h-=this.h;
								c.s-=this.s;
								c.v-=this.v;
								c.toRGB();
								return c;
						}
						break;
					case 'rgb':
						c.toRGB();
						switch(this.operation){
							case '*':
								c.r*=this.r;
								c.g*=this.g;
								c.b*=this.b;
								return c;
							case '+':
								c.r+=this.r;
								c.g+=this.g;
								c.b+=this.b;
								return c;
							case '-':
								c.r-=this.r;
								c.g-=this.g;
								c.b-=this.b;
								return c;
						}
				}

				return c;
			}


			toString(){
				let extra ='';
				switch (this.type){
					case 'transparent':
						extra='(0.0, 0.0, 0.0, 1.0)';
						break;
					case 'rgb':
						extra=`(${this.r},${this.g},${this.b})`;
						break;
					case 'hsv':
						extra=`(${this.h},${this.s},${this.v})`;
						break;
				}
				return `${this.operation} ${this.type}${extra} ${this.toHTML()}`;
			}

		}

        ////////////////////////////////////////////////////////////
        // StatusMarkers
        ////////////////////////////////////////////////////////////

        class TokenMarker {
            constructor( name, tag, url ) {
                this.name = name;
                this.tag = tag;
                this.url = url;
            }

            getName() {
                return this.name;
            }
            getTag() {
                return this.tag;
            }

            getHTML(scale = 1.4){
                return `<div style="width: ${scale}em; vertical-align: middle; height: ${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; padding:0;background-image: url('${this.url}');background-repeat:no-repeat; background-size: auto ${scale}em;"></div>`;
            }
        }

        class ColorDotTokenMarker extends TokenMarker {
            constructor( name, color ) {
                super(name,name);
                this.color = color;
            }

            getHTML(scale = 1.4){
                return `<div style="width: ${scale*.9}em; height: ${scale*.9}em; border-radius:${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; background-color: ${this.color}"></div>`;
            }
        }

        class ColorTextTokenMarker extends TokenMarker {
            constructor( name, letter, color ) {
                super(name,name);
                this.color = color;
                this.letter = letter;
            }

            getHTML(scale = 1.4){
                return `<div style="width: 1em; height: ${scale}em; font-size: ${scale}em; display:inline-block; margin: 0; border:0; font-weight: bold; color: ${this.color}">${this.letter}</div>`;
            }
        }

        // legacy
        class ImageStripTokenMarker extends TokenMarker {
            constructor( name, offset){
                super(name, name);
                this.offset = offset;
            }

            getHTML(scale = 1.4){
                const ratio = 2.173913;
                const statusSheet = 'https://app.roll20.net/images/statussheet.png';

                return `<div style="width: ${scale}em; height: ${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; padding:0;background-image: url('${statusSheet}');background-repeat:no-repeat;background-position: ${(ratio*(this.offset))}% 0; background-size: auto ${scale}em;"></div>`;
            }
        }

        class StatusMarkers {

            static init(){
                let tokenMarkers = {};
                let orderedLookup = new Set();
                let reverseLookup = {};

                const insertTokenMarker = (tm) => {
                    tokenMarkers[tm.getTag()] = tm;
                    orderedLookup.add(tm.getTag());

                    reverseLookup[tm.getName()] = reverseLookup[tm.getName()]||[];
                    reverseLookup[tm.getName()].push(tm.getTag()); 
                };

                const buildStaticMarkers = () => {
                    insertTokenMarker(new ColorDotTokenMarker('red', '#C91010'));
                    insertTokenMarker(new ColorDotTokenMarker(`blue`, '#1076c9'));
                    insertTokenMarker(new ColorDotTokenMarker(`green`, '#2fc910'));
                    insertTokenMarker(new ColorDotTokenMarker(`brown`, '#c97310'));
                    insertTokenMarker(new ColorDotTokenMarker(`purple`, '#9510c9'));
                    insertTokenMarker(new ColorDotTokenMarker(`pink`, '#eb75e1'));
                    insertTokenMarker(new ColorDotTokenMarker(`yellow`, '#e5eb75'));

                    insertTokenMarker(new ColorTextTokenMarker('dead', 'X', '#cc1010'));
                };

                const buildLegacyMarkers = () => {
                    const legacyNames = [
                        'skull', 'sleepy', 'half-heart', 'half-haze', 'interdiction',
                        'snail', 'lightning-helix', 'spanner', 'chained-heart',
                        'chemical-bolt', 'death-zone', 'drink-me', 'edge-crack',
                        'ninja-mask', 'stopwatch', 'fishing-net', 'overdrive', 'strong',
                        'fist', 'padlock', 'three-leaves', 'fluffy-wing', 'pummeled',
                        'tread', 'arrowed', 'aura', 'back-pain', 'black-flag',
                        'bleeding-eye', 'bolt-shield', 'broken-heart', 'cobweb',
                        'broken-shield', 'flying-flag', 'radioactive', 'trophy',
                        'broken-skull', 'frozen-orb', 'rolling-bomb', 'white-tower',
                        'grab', 'screaming', 'grenade', 'sentry-gun', 'all-for-one',
                        'angel-outfit', 'archery-target'
                    ];
                    legacyNames.forEach( (n,i)=>insertTokenMarker(new ImageStripTokenMarker(n,i)));
                };

                const readTokenMarkers = () => {
                    JSON.parse(Campaign().get('_token_markers')||'[]').forEach( tm => insertTokenMarker(new TokenMarker(tm.name, tm.tag, tm.url)));
                };

                StatusMarkers.getStatus = (keyOrName) => {
                    if(tokenMarkers.hasOwnProperty(keyOrName)){
                        return tokenMarkers[keyOrName];
                    }
                    if(reverseLookup.hasOwnProperty(keyOrName)){
                        return tokenMarkers[reverseLookup[keyOrName][0]]; // returning first one...
                    }
                    // maybe return a null status marker object?
                };

                StatusMarkers.getOrderedList = () => {
                    return [...orderedLookup].map( key => tokenMarkers[key]);
                };

                const simpleObj = o => JSON.parse(JSON.stringify(o||'{}'));


                buildStaticMarkers();
                if(simpleObj(Campaign()).hasOwnProperty('_token_markers')){
                    readTokenMarkers();
                } else {
                    buildLegacyMarkers();
                }
            }
        }

        class statusOp {

            static decomposeStatuses(statuses){
                return _.reduce(statuses.split(/,/),function(memo,st,idx){
                    var parts=st.split(/@/),
                    entry = {
                        mark: parts[0],
                        num: parseInt(parts[1],10),
                        idx: idx
                    };
                    if(isNaN(entry.num)){
                        entry.num='';
                    }
                    if(parts[0].length) {
                        memo[parts[0]] = ( memo[parts[0]] && memo[parts[0]].push(entry) && memo[parts[0]]) || [entry] ;
                    }
                    return memo;
                },{});
            }

            static composeStatuses(statuses){
                return _.chain(statuses)
                .reduce(function(m,s){
                    _.each(s,function(sd){
                        m.push(sd);
                    });
                    return m;
                },[])
                .sortBy(function(s){
                    return s.idx;
                })
                .map( (s) => ('dead'===s.mark ? 'dead' : ( s.mark+(s.num!=='' ? '@'+s.num : ''))) )
                .value()
                .join(',');
            }

            static parse(status) {
                let s = status.split(/:/);
                if(s.hasOwnProperty(1) && 0 === s[1].length){
                    s = [`${s[0]}::${s[2]}`,...s.slice(3)];
                }
                let statparts = s.shift().match(/^(\S+?)(\[(\d*)\]|)$/)||[];
                let index = ( '[]' === statparts[2] ? statparts[2] : ( undefined !== statparts[3] ? Math.max(parseInt(statparts[3],10)-1,0) : 0 ) );

                let stat=statparts[1]||'';
                let op = (_.contains(['*','/','-','+','=','!','?'], stat[0]) ? stat[0] : false);
                let numraw = s.shift() || '';
                let min = Math.min(Math.max(parseInt(s.shift(),10)||0, 0),9);
                let max = Math.max(Math.min(parseInt(s.shift(),10)||9,9),0);
                let numop = (_.contains(['*','/','-','+'],numraw[0]) ? numraw[0] : false);
                let num = Math.max(0,Math.min(9,Math.abs(parseInt(numraw,10))));

                if(isNaN(num)){
                    num = '';
                }

                stat = ( op ? stat.substring(1) : stat);

                let tokenMarker = StatusMarkers.getStatus(stat);

                if(tokenMarker) {
                    return new statusOp(
                        tokenMarker,
                        {
                            status: tokenMarker.getTag(),
                            number: num,
                            index: index,
                            sign: numop,
                            min: (min<max?min:max),
                            max: (max>min?max:min),
                            operation: op || '+'
                        });
                }

                return {getMods:(c)=>({statusmarkers:c})};
            }

            constructor(tm, ops) {
                this.tokenMarker = tm;
                this.ops = ops;
            }

            getMods(statuses='') {
                let current = statusOp.decomposeStatuses(statuses);
                let statusCount=(statuses).split(/,/).length;
                let sm = this.ops;

                switch(sm.operation){
                    case '!':
                        if('[]' !== sm.index && _.has(current,sm.status) ){
                            if( _.has(current[sm.status],sm.index) ) {
                                current[sm.status]= _.filter(current[sm.status],function(e,idx){
                                    return idx !== sm.index;
                                });
                            } else {
                                current[sm.status] = current[sm.status] || [];
                                current[sm.status].push({
                                    mark: sm.status,
                                    num: (sm.number !=='' ? Math.max(sm.min,Math.min(sm.max,getRelativeChange(0, sm.sign+sm.number))):''),
                                    index: statusCount++
                                });
                            }
                        } else {
                            current[sm.status] = current[sm.status] || [];
                            current[sm.status].push({
                                mark: sm.status,
                                num: (sm.number!=='' ? Math.max(sm.min,Math.min(sm.max,getRelativeChange(0, sm.sign+sm.number))):''),
                                index: statusCount++
                            });
                        }
                        break;
                    case '?':
                        if('[]' !== sm.index && _.has(current,sm.status) && _.has(current[sm.status],sm.index)){
                            current[sm.status][sm.index].num = (sm.number !== '') ? (Math.max(sm.min,Math.min(sm.max,getRelativeChange(current[sm.status][sm.index].num, sm.sign+sm.number)))) : '';

                            if([0,''].includes(current[sm.status][sm.index].num)) {
                                current[sm.status]= _.filter(current[sm.status],function(e,idx){
                                    return idx !== sm.index;
                                });
                            }
                        }
                        break;
                    case '+':
                        if('[]' !== sm.index && _.has(current,sm.status) && _.has(current[sm.status],sm.index)){
                            current[sm.status][sm.index].num = (sm.number !== '') ? (Math.max(sm.min,Math.min(sm.max,getRelativeChange(current[sm.status][sm.index].num, sm.sign+sm.number)))) : '';
                        } else {
                            current[sm.status] = current[sm.status] || [];
                            current[sm.status].push({
                                mark: sm.status,
                                num: (sm.number!=='' ? Math.max(sm.min,Math.min(sm.max,getRelativeChange(0, sm.sign+sm.number))):''),
                                index: statusCount++
                            });
                        }
                        break;
                    case '-':
                        if('[]' !== sm.index && _.has(current,sm.status)){
                            if( _.has(current[sm.status],sm.index )) {
                                current[sm.status]= _.filter(current[sm.status],function(e,idx){
                                    return idx !== sm.index;
                                });
                            }
                        } else {
                            current[sm.status] = current[sm.status] || [];
                            current[sm.status].pop();
                        }
                        break;
                    case '=':
                        current = {};
                        current[sm.status] = [];
                        current[sm.status].push({
                            mark: sm.status,
                            num: (sm.number!=='' ? Math.max(sm.min,Math.min(sm.max,getRelativeChange(0, sm.sign+sm.number))):''),
                            index: statusCount++
                        });
                    break;
                }
                return {
                    statusmarkers: statusOp.composeStatuses(current)
                };
            }
        }

        ////////////////////////////////////////////////////////////






        let observers = {
                tokenChange: []
        };

        const getPageForPlayer =( pid ) => {
            if(playerIsGM(pid)){
                return  getObj('player',pid).get('lastpage');
            }
            let ppages = Campaign().get('playerspecificpages');
            if(ppages[pid]){
                return ppages[pid];
            }
            return Campaign().get('playerpageid');
        };

        const getActivePages = () => _.union([
            Campaign().get('playerpageid')],
            _.values(Campaign().get('playerspecificpages')),
            _.chain(findObjs({
                type: 'player',
                online: true
            }))
            .filter((p)=>playerIsGM(p.id))
            .map((p)=>p.get('lastpage'))
            .value()
        );


        const transforms = {
            degrees: function(t){
                    var n = parseFloat(t,10);
                    if(!_.isNaN(n)) {
                        n %= 360;
                    }
                    return n;
                },
            circleSegment: function(t){
                    var n = Math.abs(parseFloat(t,10));
                    if(!_.isNaN(n)) {
                        n = Math.min(360,Math.max(0,n));
                    }
                    return n;
                },
            orderType: function(t){
                    switch(t){
                        case 'tofront':
                        case 'front':
                        case 'f':
                        case 'top':
                            return 'tofront';

                        case 'toback':
                        case 'back':
                        case 'b':
                        case 'bottom':
                            return 'toback';
                        default:
                            return;
                    }
                },
            keyHash: function(t){
                    return (t && t.toLowerCase().replace(/\s+/,'_')) || undefined;
                }
        };

    const checkGlobalConfig = function(){
        var s=state.TokenMod,
            g=globalconfig && globalconfig.tokenmod;

        if(g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved){
          log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');

          s.playersCanUse_ids = 'playersCanIDs' === g['Players can use --ids'];
          state.TokenMod.globalconfigCache=globalconfig.tokenmod;
        }
    };

    const assureHelpHandout = (create = false) => {
        const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385";

        // find handout
        let props = {type:'handout', name:'Help: TokenMod'};
        let hh = findObjs(props)[0];
        if(!hh) {
            hh = createObj('handout',Object.assign(props, {inplayerjournals: "all", avatar: helpIcon}));
            create = true;
        }
        if(create || version !== state.TokenMod.lastHelpVersion){
            hh.set({
                notes: helpParts.helpDoc({who:'handout',playerid:'handout'})
            });
            state.TokenMod.lastHelpVersion = version;
            log('  > Updating Help Handout to v'+version+' <');
        }
    };

    const checkInstall = function() {
        log('-=> TokenMod v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'TokenMod') || state.TokenMod.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.TokenMod && state.TokenMod.version) {

                case 0.1:
                case 0.2:
                  delete state.TokenMod.globalConfigCache;
                  state.TokenMod.globalconfigCache = {lastsaved:0};
                  /* falls through */

                case 0.3:
                  state.TokenMod.lastHelpVersion = version;
                  /* falls through */

                case 'UpdateSchemaVersion':
                    state.TokenMod.version = schemaVersion;
                    break;

                default:
                    state.TokenMod = {
                        version: schemaVersion,
                        globalconfigCache: {lastsaved:0},
                        playersCanUse_ids: false,
                        lastHelpVersion: version
                    };
                    break;
            }
        }
        checkGlobalConfig();
        StatusMarkers.init();
        assureHelpHandout();
    };

    const observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    };

    const notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
            handler(obj,prev);
        });
    };

    const getPlayerIDs = (function(){
        let age=0,
            cache=[],
        checkCache=function(){
            if(_.now()-60000>age){
                cache=_.chain(findObjs({type:'player'}))
                    .map((p)=>({
                        id: p.id,
                        userid: p.get('d20userid'),
                        keyHash: transforms.keyHash(p.get('displayname'))
                    }))
                    .value();
            }
        },
        findPlayer = function(data){
            checkCache();
            let pids=_.reduce(cache,(m,p)=>{
                if(p.id===data || p.userid===data || (-1 !== p.keyHash.indexOf(transforms.keyHash(data)))){
                    m.push(p.id);
                }
                return m;
            },[]);
            if(!pids.length){
                let obj=filterObjs((o)=>(o.id===data && _.contains(['character','graphic'],o.get('type'))))[0];
                if(obj){
                    let charObj = ('graphic'===obj.get('type') && getObj('character',obj.get('represents'))),
                        cb = (charObj ? charObj : obj).get('controlledby');
                    pids = (cb.length ? cb.split(/,/) : []);
                }
            }
            return pids;
        };

        return function(datum){
            return 'all'===datum ? ['all'] : findPlayer(datum);
        };
    }());

    const ch = function (c) {
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
			'*' : 'ast',
			'/' : 'sol',
            ' ' : 'nbsp'
        };

        if(_.has(entities,c) ){
            return ('&'+entities[c]+';');
        }
        return '';
    };

    const getConfigOption_PlayersCanIDs = function() {
        var text = ( state.TokenMod.playersCanUse_ids ?
                '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' :
                '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>'
            );
        return '<div>'+
            'Players can IDs is currently '+
                text+
            '<a href="!token-mod --config players-can-ids">'+
                'Toggle'+
            '</a>'+
        '</div>';

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
        experimental: () => `<div style="display:inline-block;padding: .1em 1em; border: 1px solid #993333; border-radius:.5em;background-color:#cccccc;color:#ff0000;">Experimental</div>`,
        items: (o) => `<li>${o.join('</li><li>')}</li>`,
        ol: (...o) => `<ol>${_h.items(o)}</ol>`,
        ul: (...o) => `<ul>${_h.items(o)}</ul>`,
        grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`, 
        cell: (o) =>  `<div style="width: 160px; padding: 0 3px; float: left;">${o}</div>`,
        statusCell: (o) =>  {
            let text = `${o.getName()}${o.getName()!==o.getTag()?` [${o.getTag()}]`:''}`;
            return `<div style="width: auto; padding: .2em; margin: .1em .25em; border: 1px solid #ccc; border-radius: .25em; background-color: #eee; line-height:1.5em; height: 1.5em;float:left;">${o.getHTML()}${text}</div>`;
        },
        inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
        join: (...o) => o.join(' '),
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


    const helpParts = {
        commands: (/* context */) => _h.join(
                    _h.subhead('Commands'),
                    _h.inset(
                        _h.font.command(
                            `!token-mod `,
                            _h.required(
                                `--help`,
                                `--ignore-selected`,
                                `--current-page`,
                                `--active-pages`,
                                `--config`,
                                `--on`,
                                `--off`,
                                `--flip`,
                                `--set`,
                                `--report`,
                                `--order`
                            ),
                            _h.required(`parameter`),
                            _h.optional(`${_h.required(`parameter`)} ...`),
                            `...`,
                            _h.optional(
                                `--ids`,
                                _h.required(`token_id`),
                                _h.optional(`${_h.required(`token_id`)} ...`)
                            )
                        ),
                        _h.paragraph('This command takes a list of modifications and applies them to the selected tokens (or tokens specified with --ids by a GM or Player depending on configuration).'),
                        _h.paragraph(`${_h.bold('Note:')} Each --option can be specified multiple times and in any order.`),
                        _h.paragraph(`${_h.bold('Note:')} If you are using multiple ${_h.attr.target('token_id')} calls in a macro, and need to adjust fewer than the supplied number of token ids, simply select the same token several times.  The duplicates will be removed.`),
                        _h.paragraph(`${_h.bold('Note:')} Anywhere you use ${_h.code('|')}, you can use ${_h.code('#')} instead.  Sometimes this makes macros easier.`),
                        _h.paragraph(`${_h.bold('Note:')} You can use the ${_h.code('{{')} and ${_h.code('}}')} to span multiple lines with your command for easier clarity and editing:`),
                        _h.inset(
                            _h.preformatted(
                                '!token-mod {{',
                                '  --on',
                                '    flipv',
                                '    fliph',
                                '  --set',
                                '    rotation|180',
                                `    bar1|${ch('[')+ch('[')}8d8+8${ch(']')+ch(']')}`,
                                '    light_radius|60',
                                '    light_dimradius|30',
                                '    name|"My bright token"',
                                '}}'
                            )
                        ),
                        _h.ul(
                            `${_h.bold('--help')} -- Displays this help`,
                            `${_h.bold('--ignore-selected')} -- Prevents modifications to the selected tokens (only modifies tokens passed with --ids).`,
                            `${_h.bold('--current-page')} -- Only modifies tokens on the calling player${ch("'")}s current page.  This is particularly useful when passing character_ids to ${_h.italic('--ids')}.`,
                            `${_h.bold('--active-pages')} -- Only modifies tokens on pages where there is a player or the GM.  This is particularly useful when passing character_ids to ${_h.italic('--ids')}.`,
                            `${_h.bold('--config')} -- Sets Config options. `,
                            `${_h.bold('--on')} -- Turns on any of the specified parameters (See ${_h.bold('Boolean Arguments')} below).`,
                            `${_h.bold('--off')} -- Turns off any of the specified parameters (See ${_h.bold('Boolean Arguments')} below).`,
                            `${_h.bold('--flip')} -- Flips the value of any of the specified parameters (See ${_h.bold('Boolean Arguments')} below).`,
                            `${_h.bold('--set')} -- Each parameter is treated as a key and value, divided by a ${_h.code('|')} character.  Sets the key to the value.  If the value has spaces, you must enclose it ${_h.code(ch("'"))} or ${_h.code(ch('"'))}. See below for specific value handling logic.`,
                            `${_h.bold('--order')} -- Changes the ordering of tokens.  Specify one of ${_h.code('tofront')}, ${_h.code('front')}, ${_h.code('f')}, ${_h.code('top')} to bring something to the front or ${_h.code('toback')}, ${_h.code('back')}, ${_h.code('b')}, ${_h.code('bottom')} to push it to the back.`,
                            `${_h.bold('--report')} -- Displays a report of what changed for each token. ${_h.experimental()}`,
                            `${_h.bold('--ids')} -- Each parameter is a Token ID, usually supplied with something like ${_h.attr.target(`Target 1${ch('|')}token_id`)}. By default, only a GM can use this argument.  You can enable players to use it as well with ${_h.bold('--config players-can-ids|on')}.`
                        )
                    ),
                    // SECTION: --ids, --ignore-selected, etc...
                    _h.section('Token Specification',
                        _h.paragraph(`By default, any selected token is adjusted when the command is executed.  Note that there is a bug where using ${_h.attr.target('')} commands, they may cause them to get skipped.`),
                        _h.paragraph(`${_h.italic('--ids')} takes token ids to operate on, separated by spaces.`),
                        _h.inset(_h.pre( `!token-mod --ids -Jbz-mlHr1UXlfWnGaLh -JbjeTZycgyo0JqtFj-r -JbjYq5lqfXyPE89CJVs --on showname showplayers_name`)),
                        _h.paragraph(`Usually, you will want to specify these with the ${_h.attr.target('')} syntax:`),
                        _h.inset(_h.pre( `!token-mod --ids ${_h.attr.target('1|token_id')} ${_h.attr.target('2|token_id')} ${_h.attr.target('3|token_id')} --on showname showplayers_name`)),
                        _h.paragraph(`${_h.italic('--ignore-selected')} can be used when you want to be sure selected tokens are not affected.  This is particularly useful when specifying the id of a known token, such as moving a graphic from the gm layer to the objects layer, or coloring an object on the map.`)
                    )
                ),

        booleans: (/* context */) => _h.join(
                // SECTION: --on, --off, --flip, etc...
                _h.section('Boolean Arguments',
                    _h.paragraph(`${_h.italic('--on')}, ${_h.italic('--off')} and ${_h.italic('--flip')} options only work on properties of a token that are either ${_h.code('true')} or ${_h.code('false')}, usually represented as checkboxes in the User Interface.  Specified properties will only be changed once, priority is given to arguments to ${_h.italic('--on')} first, then ${_h.italic('--off')} and finally to ${_h.italic('--flip')}.`),
                    _h.inset(
                        _h.pre(`!token-mod --on showname light_hassight --off isdrawing --flip flipv fliph`)
                    ),
                    _h.minorhead('Available Boolean Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('showname'),
                            _h.cell('showplayers_name'),
                            _h.cell('showplayers_bar1'),
                            _h.cell('showplayers_bar2'),
                            _h.cell('showplayers_bar3'),
                            _h.cell('showplayers_aura1'),
                            _h.cell('showplayers_aura2'),
                            _h.cell('playersedit_name'),
                            _h.cell('playersedit_bar1'),
                            _h.cell('playersedit_bar2'),
                            _h.cell('playersedit_bar3'),
                            _h.cell('playersedit_aura1'),
                            _h.cell('playersedit_aura2'),
                            _h.cell('light_otherplayers'),
                            _h.cell('light_hassight'),
                            _h.cell('isdrawing'),
                            _h.cell('flipv'),
                            _h.cell('fliph'),
                            _h.cell('aura1_square'),
                            _h.cell('aura2_square'),
                            _h.cell(''),

                            _h.cell("has_bright_light_vision"),
                            _h.cell("bright_vision"),
                            _h.cell("has_night_vision"),
                            _h.cell("night_vision"),
                            _h.cell("emits_bright_light"),
                            _h.cell("emits_bright"),
                            _h.cell("emits_low_light"),
                            _h.cell("emits_low")
                        )
                    ),
                    _h.paragraph( `Any of the booleans can be set with the ${_h.italic('--set')} command by passing a true or false as the value`),
                    _h.inset(
                        _h.pre('!token-mod --set showname|yes isdrawing|no')
                    ),
                    _h.paragraph(`The following are considered true values: ${_h.code('1')}, ${_h.code('on')}, ${_h.code('yes')}, ${_h.code('true')}, ${_h.code('sure')}, ${_h.code('yup')}`),

                    _h.subhead("Probabilistic Booleans"),
                    _h.paragraph(`TokenMod accepts the following probabilistic values which are true some of the time and false otherwise: ${_h.code('couldbe')} (true 1 in 8 times) , ${_h.code('sometimes')} (true 1 in 4 times) , ${_h.code('maybe')} (true 1 in 2 times), ${_h.code('probably')} (true 3 in 4 times), ${_h.code('likely')} (true 7 in 8 times)`),

                    _h.paragraph(`Anything else is considered false.`),

                    _h.subhead("Updated Dynamic Lighting"),
                    _h.paragraph(`${_h.code("has_bright_light_vision")} is the UDL version of ${_h.bold("light_hassight")}. It controls if a token can see at all, and must be turned on for a token to use UDL.  You can also use the alias ${_h.code("bright_vision")}.`),
                    _h.paragraph(`${_h.code("has_night_vision")} controls if a token can see without emitted light around it.  This was handled with ${_h.bold("light_otherplayers")} in the old light system.  In the new light system, you don't need to be emitting light to see if you have night vision turned on.  You can also use the alias ${_h.code("night_vision")}.`),
                    _h.paragraph(`${_h.code("emits_bright_light")} determines if the configured ${_h.bold("bright_light_distance")} is active or not.  There wasn't a concept like this in the old system, it would be synonymous with setting the ${_h.bold("light_radius")} to 0, but now it's not necessary.  You can also use the alias ${_h.code("emits_bright")}.`),
                    _h.paragraph(`${_h.code("emits_low_light")} determines if the configured ${_h.bold("low_light_distance")} is active or not.  There wasn't a concept like this in the old system, it would be synonymous with setting the ${_h.bold("light_dimradius")} to 0 (kind of), but now it's not necessary.  You can also use the alias ${_h.code("emits_low")}.`)
                )
            ),

        setNumbers: (/* context*/) => _h.join(
                    _h.subhead('Numbers'),
                    _h.inset(
                        _h.paragraph('Number values can be any floating point number (though most fields will drop the fractional part). Numbers must be given a numeric value.  They cannot be blank or a non-numeric string.'),
                        _h.minorhead('Available Numbers Properties:'),
                        _h.inset(
                            _h.grid(
                                _h.cell('left'),
                                _h.cell('top'),
                                _h.cell('width'),
                                _h.cell('height'),
                                _h.cell('scale')
                            )
                        ),
                        _h.paragraph( `It${ch("'")}s probably a good idea not to set the location of a token off screen, or the width or height to 0.`),
                        _h.paragraph( `Placing a token in the top left corner of the map and making it take up a 2x2 grid section:`),
                        _h.inset(
                            _h.pre( '!token-mod --set top|0 left|0 width|140 height|140' )
                        ),
                        _h.paragraph(`You can also apply relative change using ${_h.code('+')}, ${_h.code('-')}, ${_h.code(ch('*'))}, and ${_h.code(ch('/'))}. This will move each token one unit down, 2 units left, then make it 5 times as wide and half as tall.`),
                        _h.inset(
                            _h.pre( `!token-mod --set top|+70 left|-140 width|${ch('*')}5 height|/2` )
                        ),
                        _h.paragraph(`You can use ${_h.code('=')} to explicity set a value.  This is the default behavior, but you might need to use it to move something to a location off the edge using a negative number but not a relative number:`),
                        _h.inset(
                            _h.pre( '!token-mod --set top|=-140' )
                        ),
                        _h.paragraph( `${_h.code('scale')} is a pseudo field which adjusts both ${_h.code('width')} and ${_h.code('height')} with the same operation.  This will scale a token to twice it's current size.`),
                        _h.inset(
                            _h.pre( '!token-mod --set scale|*2' )
                        ),
                        _h.paragraph(`You can follow a number by one of ${_h.code('u')}, ${_h.code('g')}, or ${_h.code('s')} to adjust the scale that the number is applied in.`),
                        _h.paragraph(`Use ${_h.code('u')} to use a number based on Roll20 Units, which are 70 pixels at 100% zoom.  This will set a graphic to 280x140.`),
                        _h.inset(
                            _h.pre( '!token-mod --set width|4u height|2u' )
                        ),
                        _h.paragraph(`Use ${_h.code('g')} to use a number based on the current grid size.  This will set a token to the middle of the 8th column, 4rd row grid. (.5 offset for half the center)`),
                        _h.inset(
                            _h.pre( '!token-mod --set left|7.5g top|3.5g' )
                        ),
                        _h.paragraph(`Use ${_h.code('s')} to use a number based on the current unit if measure. (ft, m, mi, etc)  This will set a token to be 25ft by 35ft (assuming ft are the unit of measure)`),
                        _h.inset(
                            _h.pre( '!token-mod --set width|25s height|35s' )
                        ),
                        _h.paragraph(`Currently, you can also use any of the default units of measure as alternatives to ${_h.code('s')}: ${_h.code('ft')}, ${_h.code('m')}, ${_h.code('km')}, ${_h.code('mi')}, ${_h.code('in')}, ${_h.code('cm')}, ${_h.code('un')}, ${_h.code('hex')}, ${_h.code('sq')}`),
                        _h.inset(
                            _h.pre( '!token-mod --set width|25ft height|35ft' )
                        )
                    )
                ),

        setNumbersOrBlank: ( /* context */) => _h.join(
                _h.subhead('Numbers or Blank'),
                _h.inset(
                    _h.paragraph('Just like the Numbers fields, except you can set them to blank as well.'),
                    _h.minorhead('Available Numbers or Blank Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('light_radius'),
                            _h.cell('light_dimradius'),
                            _h.cell('light_multiplier'),
                            _h.cell('aura1_radius'),
                            _h.cell('aura2_radius'),
                            _h.cell('adv_fow_view_distance'),
                            _h.cell("night_vision_distance"),
                            _h.cell("night_distance"),
                            _h.cell("bright_light_distance"),
                            _h.cell("bright_distance"),
                            _h.cell("low_light_distance"),
                            _h.cell("low_distance")
                        )
                    ),
                    _h.paragraph(`Here is setting a standard DnD 5e torch, turning off aura1 and setting aura2 to 30. Note that the ${_h.code('|')} is still required for setting a blank value, such as aura1_radius below.`),
                    _h.inset(
                        _h.pre('!token-mod --set light_radius|40 light_dimradius|20 aura1_radius| aura2_radius|30')
                    ),
                    _h.paragraph(`Just as above, you can use ${_h.code('=')}, ${_h.code('+')}, ${_h.code('-')}, ${_h.code(ch('*'))}, and ${_h.code(ch('/'))} when setting these values.`),
                    _h.paragraph(`Here is setting a standard DnD 5e torch, with advanced fog of war revealed for 30.`),
                    _h.inset(
                        _h.pre('!token-mod --set light_radius|40 light_dimradius|20 adv_fow_view_distance|30')
                    ),
                    _h.paragraph(`Sometimes it is convenient to have a way to set a radius if there is none, but remove it if it is set.  This allows toggling a known radius on and off, or setting a multiplier if there isn't one, but clearing it if there is.  You can preface a number with ${_h.code('!')} to toggle it${ch("'")}s value on and off.  Here is an example that will add or remove a 20${ch("'")} radius aura 1 from a token:`),
                    _h.inset(
                        _h.pre('!token-mod --set aura1_radius|!20')
                    ),
                    _h.paragraph(`These also support the relative scale operations that ${_h.bold('Numbers')} support: ${_h.code('u')}, ${_h.code('g')}, ${_h.code('s')}`),
                    _h.inset(
                        _h.pre('!token-mod --set aura1_radius|3g aura2_radius|10u light_radius|25s')
                    ),
                    _h.paragraph(`${_h.bold('Note:')} ${_h.code('light_multiplier')} ignores these modifiers.  Additionally, the rest are already in the scale of measuring distance (${_h.code('s')}) so there is no difference between ${_h.code('25s')}, ${_h.code('25ft')}, and ${_h.code('25')}.`),
                    _h.subhead(`Updated Dynamic Lighting`),
                    _h.paragraph(`${_h.code("night_vision_distance")} lets you set how far away a token can see with no light.  You need to have ${_h.bold("has_night_vision")} turned on for this to take effect.  You can also use the alias ${_h.code("night_distance")}.`),
                    _h.paragraph(`${_h.code("bright_light_distance")} lets you set how far bright light is emitted from the token.  You need to have ${_h.bold("has_bright_light_vision")} turned on for this to take effect.  You can also use the alias ${_h.code("bright_distance")}.`),
                    _h.paragraph(`${_h.code("low_light_distance")} lets you set how far low light is emitted from the token.  You need to have ${_h.bold("has_bright_light_vision")} turned on for this to take effect.  You can also use the alias ${_h.code("low_distance")}.`)
                )
            ),

        setDegrees: ( /* context */) => _h.join(
                _h.subhead('Degrees'),
                _h.inset(
                    _h.paragraph('Any positive or negative number.  Values will be automatically adjusted to be in the 0-360 range, so if you add 120 to 270, it will wrap around to 90.'),
                    _h.minorhead('Available Degrees Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('rotation')
                        )
                    ),
                    _h.paragraph('Rotating a token by 180 degrees.'),
                    _h.inset(
                        _h.pre('!token-mod --set rotation|+180')
                    )
                )
            ),

        setCircleSegment: ( /* context */) => _h.join(
                _h.subhead('Circle Segment (Arc)'),
                _h.inset(
                    _h.paragraph('Any Positive or negative number, with the final result being clamped to from 0-360.  This is different from a degrees setting, where 0 and 360 are the same thing and subtracting 1 from 0 takes you to 359.  Anything lower than 0 will become 0 and anything higher than 360 will become 360.'),
                    _h.minorhead('Available Circle Segment (Arc) Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('light_angle'),
                            _h.cell('light_losangle')
                        )
                    ),
                    _h.paragraph('Setting line of sight angle to 90 degrees.'),
                    _h.inset(
                        _h.pre('!token-mod --set light_losangle|90')
                    )
                )
            ),

        setColors: ( /* context */) => _h.join(
                _h.subhead('Colors'),
                _h.inset(
                    _h.paragraph(`Colors can be specified in multiple formats:`),
                    _h.inset(
                        _h.ul(
                            `${_h.bold('Transparent')} -- This is the special literal ${_h.code('transparent')} and represents no color at all.`,
                            `${_h.bold('HTML Color')} -- This is 6 or 3 hexidecimal digits, optionally prefaced by ${_h.code('#')}.  Digits in a 3 digit hexidecimal color are doubled.  All of the following are the same: ${_h.code('#ff00aa')}, ${_h.code('#f0a')}, ${_h.code('ff00aa')}, ${_h.code('f0a')}`,
                            `${_h.bold('RGB Color')} -- This is an RGB color in the format ${_h.code('rgb(1.0,1.0,1.0)')} or ${_h.code('rgb(256,256,256)')}.  Decimal numbers are in the scale of 0.0 to 1.0, integer numbers are scaled 0 to 256.  Note that numbers can be outside this range for the purpose of doing math.`,
                            `${_h.bold('HSV Color')} -- This is an HSV color in the format ${_h.code('hsv(1.0,1.0,1.0)')} or ${_h.code('hsv(360,100,100)')}.  Decimal numbers are in the scale of 0.0 to 1.0, integer numbers are scaled 0 to 360 for the hue and 0 to 100 for saturation and value.  Note that numbers can be outside this range for the purpose of doing math.`
                        )
                    ),
                    _h.minorhead('Available Colors Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('tint_color'),
                            _h.cell('aura1_color'),
                            _h.cell('aura2_color')
                        )
                    ),
                    _h.paragraph('Turning off the tint and setting aura1 to a reddish color.  All of the following are the same:'),
                    _h.inset(
                        _h.pre('!token-mod --set tint_color|transparent aura1_color|ff3366'),
                        _h.pre('!token-mod --set tint_color| aura1_color|f36'),
                        _h.pre('!token-mod --set tint_color|transparent aura1_color|#f36'),
                        _h.pre('!token-mod --set tint_color| aura1_color|#ff3366')
                    ),
                    _h.paragraph('Setting the tint_color using an RGB Color using Integer and Decimal notations:'),
                    _h.inset(
                        _h.pre('!token-mod --set tint_color|rgb(127,0,256)'),
                        _h.pre('!token-mod --set tint_color|rgb(.5,0.0,1.0)')
                    ),
                    _h.paragraph('Setting the tint_color using an HSV Color using Integer and Decimal notations:'),
                    _h.inset(
                        _h.pre('!token-mod --set tint_color|hsv(0,50,100)'),
                        _h.pre('!token-mod --set tint_color|hsv(0.0,.5,1.0)')
                    ),

                    _h.paragraph(`You can toggle a color on and off by prefacing it with ${_h.code('!')}.  If the color is currently transparent, it will be set to the specified color, otherwise it will be set to transparent:`),
                    _h.inset(
                        _h.pre('!token-mod --set tint_color|!rgb(1.0,.0,.2)')
                    ),

                    _h.minorhead('Color Math'),

                    _h.paragraph(`You can perform math on colors using ${_h.code('+')}, ${_h.code('-')}, and ${_h.code(ch('*'))}.`),
                    _h.paragraph(`Making the aura just a little more red:`),
                    _h.inset(
                        _h.pre('!token-mod --set aura1_color|+#330000')
                    ),
                    _h.paragraph(`Making the aura just a little less blue:`),
                    _h.inset(
                        _h.pre('!token-mod --set aura1_color|-rgb(0.0,0.0,0.1)')
                    ),
                    _h.paragraph(`HSV colors are especially good for color math.  Making the aura twice as bright:`),
                    _h.inset(
                        _h.pre(`!token-mod --set aura1_color|${ch('*')}hsv(1.0,1.0,2.0)`)
                    ),

                    _h.paragraph(`Performing math operations with a transparent color as the command argument does nothing:`),
                    _h.inset(
                        _h.pre(`!token-mod --set aura1_color|${ch('*')}transparent`)
                    ),

                    _h.paragraph(`Performing math operations on a transparent color on a token treats the color as black.  Assuming a token had a transparent aura1, this would set it to #330000.`),
                    _h.inset(
                        _h.pre('!token-mod --set aura1_color|+300')
                    )
                )
            ),

        setText: ( /* context */) => _h.join(
                _h.subhead('Text'),
                _h.inset(
                    _h.paragraph(`These can be pretty much anything.  If your value has spaces in it, you need to enclose it in ${ch("'")} or ${ch('"')}.`),
                    _h.minorhead('Available Text Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('name'),
                            _h.cell('bar1_value'),
                            _h.cell('bar2_value'),
                            _h.cell('bar3_value'),
                            _h.cell('bar1_current'),
                            _h.cell('bar2_current'),
                            _h.cell('bar3_current'),
                            _h.cell('bar1_max'),
                            _h.cell('bar2_max'),
                            _h.cell('bar3_max'),
                            _h.cell('bar1'),
                            _h.cell('bar2'),
                            _h.cell('bar3'),
                            _h.cell('bar1_reset'),
                            _h.cell('bar2_reset'),
                            _h.cell('bar3_reset')
                        )
                    ),
                    _h.paragraph(`Setting a token${ch("'")}s name to ${ch('"')}Sir Thomas${ch('"')} and bar1 value to 23.`),
                    _h.inset(
                        _h.pre(`!token-mod --set name|${ch('"')}Sir Thomas${ch('"')} bar1_value|23`)
                    ),
                    _h.paragraph(`${_h.italic('bar1')}, ${_h.italic('bar2')} and ${_h.italic('bar3')} are special.  Any value set on them will be set in both the ${_h.italic('_value')} and ${_h.italic('_max')} fields for that bar.  This is most useful for setting hit points, particularly if the value comes from an inline roll.`),
                    _h.inset(
                        _h.pre(`!token-mod --set bar1|${ch('[')}${ch('[')}3d6+8${ch(']')}${ch(']')}`)
                    ),
                    _h.paragraph(`${_h.italic('bar1_reset')}, ${_h.italic('bar2_reset')} and ${_h.italic('bar3_reset')} are special.  Any value set on them will be ignored, instead they will set the ${_h.italic('_value')} field for that bar to whatever the matching ${_h.italic('_max')} field is set to.  This is most useful for resetting hit points or resource counts like spells. (The ${_h.code('|')} is currently still required.)`),
                    _h.inset(
                        _h.pre(`!token-mod --set bar1_reset| bar3_reset|`)
                    )
                )
            ),

        setLayer: ( /* context */) => _h.join(
                _h.subhead('Layer'),
                _h.inset(
                    _h.paragraph(`There is only one Layer property.  It can be one of 4 values, listed below.`),
                    _h.minorhead('Available Layer Values:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('gmlayer'),
                            _h.cell('objects'),
                            _h.cell('map'),
                            _h.cell('walls')
                        )
                    ),
                    _h.paragraph('Moving something to the gmlayer.'),
                    _h.inset(
                        _h.pre('!token-mod --set layer|gmlayer')
                    )
                )
            ),
        setStatus: ( /* context */) => _h.join(
                _h.subhead('Status'),
                _h.inset(
                    _h.paragraph(`There is only one Status property.  Status has a somewhat complicated syntax to support the greatest possible flexibility.`),
                    _h.minorhead('Available Status Property:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('statusmarkers')
                        )
                    ),

                    _h.paragraph(`Status is the only property that supports multiple values, all separated by ${_h.code('|')} as seen below. This command adds the blue, red, green, padlock and broken-sheilds to a token, on top of any other status markers it already has:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue|red|green|padlock|broken-shield')
                    ),

                    _h.paragraph(`You can optionally preface each status with a ${_h.code('+')} to remind you it is being added.  This command is identical:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|+blue|+red|+green|+padlock|+broken-shield')
                    ),

                    _h.paragraph(`Each value can be followed by a ${_h.code(':')} and a number between 0 and 9.  (The number following the ${_h.italic('dead')} status is ignored as that status is special.)  This will set the blue status with no number overlay, red with a 3 overlay, green with no overlay, padlock with a 2 overlay, and broken-shield with a 7 overlay:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue:0|red:3|green|padlock:2|broken-shield:7')
                    ),
                    _h.paragraph(`${_h.bold('Note:')} TokenMod will now show 0 on status markers everywhere that makes sense to do.`),

                    _h.paragraph(`The numbers following a status can be prefaced with a ${_h.code('+')} or ${_h.code('-')}, which causes their value to be applied to the current value. Here${ch("'")}s an example showing blue getting incremented by 2, and padlock getting decremented by 1.  Values will be bounded between 0 and 9.`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue:+2|padlock:-1')
                    ),

                    _h.paragraph(`You can append two additional numbers separated by ${_h.code(':')}.  These numbers will be used as the minimum and maximum value when setting or adjusting the number on a status marker.  Specified minimum and maximum values will be kept between 0 and 9.`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue:+1:2:5')
                    ),

                    _h.paragraph(`Omitting either of the numbers will cause them to use their default value.  Here is an example limiting the max to 5:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue:+1::5')
                    ),

                    _h.paragraph(`You can optionally preface each status with a ${_h.code('?')} to modify the way ${_h.code('+')} and ${_h.code('-')} on status numbers work.  With ${_h.code('?')} on the front of the status, only selected tokens that have that status will be modified.  Additionally, if the status reaches 0, it will be removed.  Here${ch("'")}s an example showing blue getting decremented by 1.  If it reaches 0, it will be removed and no status will be added if it is missing.`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|?blue:-1')
                    ),

                    _h.paragraph(`By default, status markers will be added, retaining whichever status markers are already present.  You can override this behavior by prefacing a status with a ${_h.code('-')} to cause the status to be removed.  This will remove the blue and padlock status:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|-blue|-padlock')
                    ),

                    _h.paragraph(`Sometimes it is convenient to have a way to add a status if it is not there, but remove it if it is.  This allows marking tokens with markers and clearing them with the same command.  You can preface a status with ${_h.code('!')} to toggle it${ch("'")}s state on and off.  Here is an example that will add or remove the Rook piece from a token:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|!white-tower')
                    ),

                    _h.paragraph(`Sometimes, you might want to clear all status marker as part of setting a new status marker.  You can do this by prefacing a status marker with an ${_h.code('=')}.  Note that this affects all status markers before as well, so you will want to do this only on the first status marker.  This will remove all status markers and set only the dead marker:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|=dead')
                    ),

                    _h.paragraph(`If you want to remove all status markers, just specify the same marker twice with an ${_h.code('=')} and then a ${_h.code('-')}.  This will clear all the status markers:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|=blue|-blue')
                    ),

                    _h.paragraph(`You can set multiple of the same status marker with a bracket syntax. Copies of a status are indexed starting at 1 from left to right. Leaving brackets off will be the same as specifying index 1. Using empty brackets is the same as specifying an index 1 greater than the highest index in use. When setting a status at an index that doesn${ch("'")}t exist (say, 8 when you only have 2 of that status) it will be appended to the right as the next index. When removing a status that doesn${ch("'")}t exist, it will be ignored. Removing the empty bracket status will remove all statues of that type.`),
                    _h.paragraph(`Adding 2 blue status markers with the numbers 7 and 5 in a few different ways:`),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue:7|blue[]:5'),
                        _h.pre('!token-mod --set statusmarkers|blue[]:7|blue[]:5'),
                        _h.pre('!token-mod --set statusmarkers|blue[1]:7|blue[2]:5')
                    ),
                    _h.paragraph('Removing the second blue status marker:'),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|-blue[2]')
                    ),
                    _h.paragraph('Removing all blue status markers:'),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|-blue[]')
                    ),

                    _h.minorhead('Available Status Markers:'),
                    _h.inset(
                        _h.grid(
                            ...StatusMarkers.getOrderedList().map(tm=>_h.statusCell(tm))
                        )
                    ),

                    _h.paragraph('All of these operations can be combine in a single statusmarkers command.'),
                    _h.inset(
                        _h.pre('!token-mod --set statusmarkers|blue:3|-dead|red:3')
                    )
                )
            ),

        setImage: ( /* context */) => _h.join(
                _h.subhead('Image'),
                _h.inset(
                    _h.paragraph(`The Image type lets you manage the image a token uses, as well as the available images for Multi-Sided tokens.  Images must be in a user library or will be ignored. The full path must be provided.`),
                    _h.minorhead('Available Image Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('imgsrc')
                        )
                    ),
                    _h.paragraph(`Setting the token image to a library image using a url (in this case, the orange ring I use for ${_h.italic('TurnMarker1')}):`),
                    _h.inset(
                        _h.pre('!token-mod --set imgsrc|https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580')
                    ),
                    _h.paragraph(`Setting the token image from another token by specifying it${ch("'")}s token_id:`),
                    _h.inset(
                        _h.pre(`!token-mod --set imgsrc|${_h.attr.target('token_id')} --ids ${_h.attr.selected('token_id')}`)
                    ),
                    _h.paragraph(`${_h.bold('WARNING:')} Because of a Roll20 bug with ${_h.attr.target('')} and the API, you must specify the tokens you want to change using ${_h.code('--ids')} when using ${_h.attr.target('')}.`),

                    _h.minorhead('Multi-Sided Token Options'),
                    _h.inset(
                        _h.subhead('Appending (+)'),
                        _h.inset(
                            _h.paragraph(`You can append additional images to the list of sides by prefacing the source of an image with ${_h.code('+')}:`),
                            _h.inset(
                                _h.pre('!token-mod --set imgsrc|+https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580'),
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')} --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`If you follow the ${_h.code('+')} with a ${_h.code('=')}, it will update the current side to the freshly added image:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+=${_h.attr.target('token_id')} --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`When getting the image from a token, you can append a ${_h.code(':')} and follow it with an index to copy.  Indicies start at 1, if you specify an index that doesn${ch("'")}t exist, nothing will happen:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')}:3 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`You can specify the ${_h.code('=')} with this syntax:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+=${_h.attr.target('token_id')}:3 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`You can specify multiple indices to copy by using a ${_h.code(',')} separated list:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')}:3,4,5,9 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`Using ${_h.code('=')} with this syntax will set the current side to the last added image:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+=${_h.attr.target('token_id')}:3,4,5,9 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`Images are copied in the order specified.  You can even copy images from a token you${ch("'")}re setting.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')}:3,2,1 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`You can use an ${_h.code(ch('*'))} after the ${_h.code(':')} to copy all the images from a token.  The order will be from 1 to the maximum image.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')}:${ch('*')} --ids ${_h.attr.selected('token_id')}`)
                            ),

                            _h.paragraph(`When appending a url, you can use a ${_h.code(ch(':@'))} followed by a number to specify where to place the new image.  Indicies start at 1.`),
                            _h.inset(
                                _h.pre('!token-mod --set imgsrc|+https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580:@1')
                            ),

                            _h.paragraph(`When appending from a token, you can use an ${_h.code(ch('@'))} followed by a number to specify where each copied image is inserted.  Indicies start at 1.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')}:3@1,4@2,5@4,9@5 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`Note that inserts are performed in order, so continuously inserting at a position will insert in reverse order.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|+${_h.attr.target('token_id')}:3@1,4@1,5@1,9@1 --ids ${_h.attr.selected('token_id')}`)
                            )
                        ),

                        _h.subhead('Replacing (^)'),
                        _h.inset(
                            _h.paragraph(`You can replace images in the list of sides by prefacing the source of an image with ${_h.code('^')} and append ${_h.code(ch(':@'))} followed by a number to specify which images to replace.  Indicies start at 1.`),
                            _h.inset(
                                _h.pre('!token-mod --set imgsrc|^https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580:@2'),
                                _h.pre(`!token-mod --set imgsrc|^${_h.attr.target('token_id')}:@2 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`When replacing from a token, you can specify multiple replacements from a source token to the destination token:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|^${_h.attr.target('token_id')}:3@1,4@2,5@4,9@5 --ids ${_h.attr.selected('token_id')}`)
                            )
                        ),

                        _h.subhead('Reordering (/)'),
                        _h.inset(
                            _h.paragraph(`You can use a ${_h.code(ch('/'))} followed by a pair of numbers separated by ${_h.code('@')} to move an image on the token from one postion to another.  Indicies start at 1.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|/3@1 --ids ${_h.attr.selected('token_id')}`)
                            ),
                            _h.paragraph(`You can string these together with commas.  Note that operationes are performed in order and may displace prior moved images.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|/3@1,4@2,5@3,9@4 --ids ${_h.attr.selected('token_id')}`)
                            )
                        ),

                        _h.subhead('Removing (-)'),
                        _h.inset(
                            _h.paragraph(`You can remove images from the image list using ${_h.code('-')} followed by the index to remove.  If you remove the currently used image, the side will be set to 1.`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|-3`)
                            ),
                            _h.paragraph(`If you omit the number, it will remove the current side:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|-`)
                            ),

                            _h.paragraph(`You can follow the ${_h.code('-')} with a ${_h.code(',')} separated list of indicies to remove.  If any of the indicies don${ch("'")}t exist, they will be ignored:`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|-3,4,7`)
                            ),

                            _h.paragraph(`You can follow the ${_h.code('-')} with an ${_h.code(ch('*'))} to remove all the images, turning the Multi-Sided token back into a regular token. (This also happens if you remove the last image by index.):`),
                            _h.inset(
                                _h.pre(`!token-mod --set imgsrc|-${ch('*')}`)
                            )
                        ),

                        _h.paragraph(`${_h.bold('WARNING:')} If you attempt to change the image list for a token with images in the Marketplace Library, it will remove all of them from that token.`)
                    )
                )
            ),

        setSideNumber: ( /* context */) => _h.join(
                _h.subhead('SideNumber'),
                _h.inset(
                    _h.paragraph(`This is the index of the side to show for Multi-Sided tokens.  Indicies start at 1.  If you have a 6-sided token, it will have indicies 1, 2, 3, 4, 5 and 6.  An empty index is considered to be 1.  If a token doesn't have the index specified, it isn't changed.`),
                    _h.paragraph(`${_h.bold('NOTICE:')} This only works for images in the User Image library.  If your token has images that are stored in the Marketplace Library, they will not be selectable with this command.  You can download those images and upload them to your User Image Library to use them with this.`),
                    _h.minorhead('Available SideNumber Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('currentside')
                        )
                    ),
                    _h.paragraph(`Setting a token to index 2:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|2')
                    ),
                    _h.paragraph(`Not specifying an index will set the index to 1, the first image:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|')
                    ),

                    _h.paragraph(`You can shift the image by some amount by using ${_h.code('+')} or ${_h.code('-')} followed by an optional number.`),
                    _h.paragraph(`Moving all tokens to the next image:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|+')
                    ),
                    _h.paragraph(`Moving all tokens back 2 images:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|-2')
                    ),
                    _h.paragraph(`By default, if you go off either end of the list of images, you will wrap back around to the opposite side.  If this token is showing image 3 out of 4 and this command is run, it will be on image 2:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|+3')
                    ),
                    _h.paragraph(`If you preface the command with a ${_h.code('?')}, the index will be bounded to the number of images and not wrap.  In the same scenario, this would leave the above token at image 4:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|?+3')
                    ),
                    _h.paragraph(`In the same scenario, this would leave the above token at image 1:`),
                    _h.inset(
                        _h.pre('!token-mod --set currentside|?-30')
                    ),

                    _h.paragraph(`If you want to chose a random image, you can use ${_h.code(ch('*'))}.  This will choose one of the valid images at random (all equally weighted):`),
                    _h.inset(
                        _h.pre(`!token-mod --set currentside|${ch('*')}`)
                    )
                )
            ),

        setCharacterID: ( /*context*/ ) => _h.join(
                _h.subhead('Character ID'),
                _h.inset(
                    _h.paragraph(`You can use the ${_h.attr.char('character_id')} syntax to specify a character_id directly or use the name of a character (quoted if it contains spaces) or just the shortest part of the name that is unique (${ch("'")}Sir Maximus Strongbow${ch("'")} could just be ${ch("'")}max${ch("'")}.).  Not case sensitive: Max = max = MaX = MAX`),
                    _h.minorhead('Available Character ID Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('represents')
                        )
                    ),
                    _h.paragraph('Here is setting the represents to the character Bob.'),
                    _h.inset(
                        _h.pre(`!token-mod --set represents|${_h.attr.char('character_id','Bob')}`)
                    ),
                    _h.paragraph('Note that setting the represents will clear the links for the bars, so you will probably want to set those again.')
                )
            ),

        setAttributeName: ( /*context*/ ) => _h.join(
                _h.subhead('Attribute Name'),
                _h.inset(
                    _h.paragraph(`These are resolved from the represented character id.  If the token doesn${ch("'")}t represent a character, these will be ignored.  If the Attribute Name specified doesn${ch("'")}t exist for the represented character, the link is unchanged. You can clear a link by passing a blank Attribute Name.`),
                    _h.minorhead('Available Attribute Name Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('bar1_link'),
                            _h.cell('bar2_link'),
                            _h.cell('bar3_link')
                        )
                    ),
                    _h.paragraph('Here is setting the represents to the character Bob and setting bar1 to be the npc hit points attribute.'),
                    _h.inset(
                        _h.pre(`!token-mod --set represents|${_h.attr.char('character_id','Bob')} bar1_link|npc_HP`)
                    ),
                    _h.paragraph('Here is clearing the link for bar3:'),
                    _h.inset(
                        _h.pre('!token-mod --set bar3_link|')
                    )
                )
            ),


        setPlayer: ( /*context*/ ) => _h.join(
                _h.subhead('Player'),
                _h.inset(
                    _h.paragraph('You can specify Players using one of five methods: Player ID, Roll20 ID Number, Player Name Matching, Token ID, Character ID'),
                    _h.inset(
                        _h.ul(
                            'Player ID is a unique identifier assigned that player in a specific game.  You can only find this id from the API, so this is likely the least useful method.',
                            'Roll20 ID Number is a unique identifier assigned to a specific player.  You can find it in the URL of their profile page as the number preceeding their name.  This is really useful if you play with the same people all the time, or are cloning the same game with the same players, etc.',
                            'Player Name Matching is a string that will be matched to the current name of the player in game.  Just like with Characters above, it can be quoted if it has spaces and is case insensitive.  All players that match a given string will be used.',
                            'Token ID will be used to collect the controlledby entries for a token or the associated character if the token represetns one.',
                            'Character ID will be used to collect the controlledby entries for a character.'
                        )
                    ),
                    _h.paragraph(`Note that you can use the special string ${_h.italic('all')} to denote the All Players special player.`),
                    _h.minorhead('Available Player Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('controlledby')
                        )
                    ),

                    _h.paragraph(`Controlled by supports multiple values, all separated by ${_h.code('|')} as seen below.`),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|aaron|+stephen|+russ')
                    ),

                    _h.paragraph(`There are 3 operations that can be specified with leading characters: ${_h.code('+')}, ${_h.code('-')}, ${_h.code('=')} (default)`),
                    _h.inset(
                        _h.ul(
                            `${_h.code('+')} will add the player(s) to the controlledby list.`,
                            `${_h.code('-')} will remove the player(s) from the controlledby list.`,
                            `${_h.code('=')} will set the controlledby list to only the player(s).  (Default)`
                        )
                    ),

                    _h.paragraph('Adding control for roll20 player number 123456:'),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|+123456')
                    ),

                    _h.paragraph('Setting control for all players:'),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|all')
                    ),
                    
                    _h.paragraph('Adding all the players with k in their name but removing karen:'),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|+k|-karen')
                    ),

                    _h.paragraph( 'Adding the player with player id -JsABCabc123-12:' ),
                    _h.inset(
                        _h.pre( '!token-mod --set controlledby|+-JsABCabc123-12' )
                    ),

                    _h.paragraph( 'In the case of a leading character on the name that would be interpreted as an operation, you can use quotes:' ),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|"-JsABCabc123-12"')
                    ),

                    _h.paragraph( `When using Token ID or Character ID methods, it${ch("'")}s a good idea to use an explicit operation:` ),
                    _h.inset(
                        _h.pre( `!token-mod --set controlledby|=${_h.attr.target('token_id')}`)
                    ),

                    _h.paragraph( 'Quotes will also help with names that have spaces, or with nested other quotes:' ),
                    _h.inset(
                        _h.pre( `!token-mod --set controlledby|+${ch("'")}Bob "tiny" Slayer${ch("'")}`)
                    ),

                    _h.paragraph( 'You can remove all controlling players by using a blank list or explicitly setting equal to nothing:'),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|'),
                        _h.pre('!token-mod --set controlledby|=')
                    ),

                    _h.paragraph( `A specified action that doesn${ch("'")}t match any player(s) will be ignored.  If there are no players named Tim, this won${ch("'")}t change the list:`),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby|tim')
                    ),

                    _h.paragraph( 'If you wanted to force an empty list and set tim if tim is available, you can chain this with blanking the list:'),
                    _h.inset(
                        _h.pre('!token-mod --set controlledby||tim')
                    ),

                    _h.minorhead( 'Using controlledby with represents'),
                    _h.paragraph( 'When a token represents a character, the controlledby property that is adjusted is the one on the character. This works as you would want it to, so if you are changing the represents as part of the same command, it will adjust the location that will be correct after all commands are run.'),

                    _h.paragraph( 'Set the token to represent the character with rook in the name and assign control to players matching bob:'),
                    _h.inset(
                        _h.pre('!token-mod --set represents|rook controlledby|bob')
                    ),

                    _h.paragraph( 'Remove the represent setting for the token and then give bob control of that token (useful for one-offs from npcs or monsters):'),
                    _h.inset(
                        _h.pre('!token-mod --set represents| controlledby|bob')
                    )
                )
            ),

        setDefaultToken: ( /*context*/ ) => _h.join(
                _h.subhead('DefaultToken'),
                _h.inset(
                    _h.paragraph(`You can set the default token by specifying defaulttoken in your set list.`),
                    _h.minorhead('Available DefaultToken Properties:'),
                    _h.inset(
                        _h.grid(
                            _h.cell('defaulttoken')
                        )
                    ),
                    _h.paragraph('There is no argument for defaulttoken, and this relies on the token representing a character.'),
                    _h.inset(
                        _h.pre('!token-mod --set defaulttoken')
                    ),
                    _h.paragraph('Setting defaulttoken along with represents works as expected:'),
                    _h.inset(
                        _h.pre(`!token-mod --set represents|${_h.attr.char('character_id','Bob')} defaulttoken`)
                    ),
                    _h.paragraph(`Be sure that defaulttoken is after all changes to the token you want to store are made.  For example, if you set the defaulttoken, then set the bar links, the bars won${ch("'")}t be linked when you pull out the token.`)
                )
            ),

        sets: ( context ) => _h.join(
                // SECTION: --set, etc
                _h.section('Set Arguments',
                    _h.paragraph(`${_h.italic('--set')} takes key-value pairs, separated by ${_h.code('|')} characters (or ${_h.code('#')} characters).`),
                    _h.inset(
                        _h.pre('!token-mod --set key|value key|value key|value')
                    ),
                    _h.paragraph(`You can use inline rolls wherever you like, including rollable tables:`),
                    _h.inset(
                        _h.pre(`!token-mod --set bar${ch('[')}${ch('[')}1d3${ch(']')}${ch(']')}_value|X statusmarkers|blue:${ch('[')}${ch('[')}1d9${ch(']')}${ch(']')}|green:${ch('[')}${ch('[')}1d9${ch(']')}${ch(']')} name:${ch('"')}${ch('[')}${ch('[')}1t${ch('[')}randomName${ch(']')}${ch(']')}${ch(']')}"`)
                    ),

                    _h.paragraph(`You can use ${_h.code('+')} or ${_h.code('-')} before any number to make an adjustment to the current value:`),
                    _h.inset(
                        _h.pre('!token-mod --set bar1_value|-3 statusmarkers|blue:+1|green:-1')
                    ),

                    _h.paragraph(`You can preface a ${_h.code('+')} or ${_h.code('-')} with an ${_h.code('=')} to explicitly set the number to a negative or positive value:`),
                    _h.inset(
                        _h.pre('!token-mod --set bar1_value|=+3 light_radius|=-10')
                    ),

                    _h.paragraph('There are several types of keys with special value formats:'),
                    _h.inset(
                        helpParts.setNumbers(context),
                        helpParts.setNumbersOrBlank(context),
                        helpParts.setDegrees(context),
                        helpParts.setCircleSegment(context),
                        helpParts.setColors(context),
                        helpParts.setText(context),
                        helpParts.setLayer(context),
                        helpParts.setStatus(context),
                        helpParts.setImage(context),
                        helpParts.setSideNumber(context),
                        helpParts.setCharacterID(context),
                        helpParts.setAttributeName(context),
                        helpParts.setDefaultToken(context),
                        helpParts.setPlayer(context)
                    ) 
                )
            ),

        reports: (/* context */) => _h.join(
                // SECTION: --report
                    _h.section('Report',
                        _h.paragraph(`${_h.experimental()} ${_h.italic('--report')} provides feedback about the changes that were made to each token that a command affects.  Arguments to the ${_h.italic('--report')} command are ${_h.code('|')} separated pairs of Who to tell, and what to tell them, with the following format:`),
                        _h.inset(
                            _h.pre(`!token-mod --report Who[:Who ...]|Message`)
                        ),
                        _h.paragraph(`You can specify multiple different Who arguments by separating them with a ${_h.code(':')}.  Be sure you have no spaces.`),
                        _h.minorhead('Available options for Who'),
                        _h.inset(
                            _h.ul(
                                `${_h.code('player')} will whisper the report to the player who issued the command.`,
                                `${_h.code('gm')} will whisper the report to the gm.`,
                                `${_h.code('all')} will send the report publicly to chat for everyone to see.`,
                                `${_h.code('token')} will whisper to whomever controls the token.`,
                                `${_h.code('character')} will whisper to whomever controls the character the token represents.`,
                                `${_h.code('control')} will whisper to whomever can control the token from either the token or character controlledby list.  This is equivalent to specifying ${_h.code('token:character')}.`
                            )
                        ),
                        _h.paragraph(`The Message must be enclosed in quotes if it has spaces in it. The Message can contain any of the properties of the of the token, enclosed in ${_h.code('{ }')}, and they will be replaced with the final value of that property.  Additionally, each property may have a modifier to select slightly different information:`),
                        _h.minorhead('Available options for Property Modifiers'),
                        _h.inset(
                            _h.ul(
                                `${_h.code('before')} -- Show the value of the property before a change was applied.`,
                                `${_h.code('change')} -- Show the change that was applied to the property. (Only works on numeric fields, will result in 0 on things like name or imagsrc.)`,
                                `${_h.code('abschange')} -- Show the absolute value of the change that was applied to the property. (Only works on numeric fields, will result in 0 on things like name or imagsrc.)`
                            )
                        ),
                        _h.paragraph(`Showing the amount of damage done to a token.`),
                        _h.inset(
                            _h.preformatted(
                                '!token-mod {{',
                                '  --set',
                                `    bar1_value|-${ch('[')}${ch('[')}2d6+8${ch(']')}${ch(']')}`,
                                '  --report',
                                '    all|"{name} takes {bar1_value:abschange} points of damage."',
                                '}}'
                            )
                        ),
                        _h.paragraph(`Showing everyone the results of the hit, but only the gm and the controlling players the actual damage and original hit point value.`),
                        _h.inset(
                            _h.preformatted(
                                '!token-mod {{',
                                '  --set',
                                `    bar1_value|-${ch('[')}${ch('[')}2d6+8${ch(']')}${ch(']')}`,
                                '  --report',
                                '    all|"{name} takes a vicious wound leaving them at {bar1_value}hp out of {bar1_max}hp."',
                                '    gm:control|"{name} damage: {bar1_value:change}hp, was at {bar1_value:before}hp"',
                                '}}'
                            )
                        )
                    )
                ),
        config: (context) => _h.join(
                    // SECTION: --config, etc
                    _h.section('Configuration',
                        _h.paragraph(`${_h.italic('--config')} takes option value pairs, separated by | characters.`),
                        _h.inset(
                            _h.pre( '!token-mod --config option|value option|value')
                        ),
                        _h.minorhead('Available Configuration Properties:'),
                        _h.ul(
                            `${_h.bold('players-can-ids')} -- Determines if players can use <i>--ids</i>.  Specifying a value which is true allows players to use --ids.  Omitting a value flips the current setting. `
                        ),
                        ( playerIsGM(context.playerid)
                            ?  _h.paragraph(getConfigOption_PlayersCanIDs())
                            : ''
                        )
                    )
                ),

        apiInterface: (/* context */) => _h.join(
                // SECTION: .ObserveTokenChange(), etc
                _h.section('API Notifications',
                    _h.paragraph( 'API Scripts can register for the following notifications:'),
                    _h.inset(
                        _h.paragraph( `${_h.bold('Token Changes')} -- Register your function by passing it to ${_h.code('TokenMod.ObserveTokenChange(yourFuncObject);')}.  When TokenMod changes a token, it will call your function with the Token as the first argument and the previous properties as the second argument, identical to an ${_h.code("on('change:graphic',yourFuncObject);")} call.`),
                        _h.paragraph( `Example script that notifies when a token${ch("'")}s status markers are changed by TokenMod:`),
                        _h.inset(
                            _h.preformatted(
                                `on('ready',function(){`,
                                `  if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){`,
                                `    TokenMod.ObserveTokenChange(function(obj,prev){`,
                                `      if(obj.get('statusmarkers') !== prev.statusmarkers){`,
                                `        sendChat('Observer Token Change','Token: '+obj.get('name')+' has changed status markers!');`,
                                `      }`,
                                `    });`,
                                `  }`,
                                `});`
                            )
                        )
                    )
                )
            ),

        helpBody: (context) => _h.join(
                _h.header(
                    _h.paragraph( 'TokenMod provides an interface to setting almost all settable properties of a token.')
                ),
                helpParts.commands(context),
                helpParts.booleans(context),
                helpParts.sets(context),
                helpParts.reports(context),
                helpParts.config(context),
                helpParts.apiInterface(context)
            ),

        helpDoc: (context) => _h.join(
                _h.title('TokenMod',version),
                helpParts.helpBody(context)
            ),

        helpChat: (context) => _h.outer(
                _h.title('TokenMod',version),
                helpParts.helpBody(context)
            )
    };


    const showHelp = function(playerid) {
        let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
        let context = {
            who,
            playerid
        };
        sendChat('', '/w "'+who+'" '+ helpParts.helpChat(context));
    };


    const getRelativeChange = function(current,update) {
        var cnum,unum,op='=';
        if(_.isString(update)){
            if( _.has(update,0) && ('=' === update[0]) ){
                return parseFloat(_.rest(update).join(''));
            }
            if( _.has(update,0) && ('!' === update[0]) ){
                if(''===current || 0===parseInt(current) ){
                    return parseFloat(_.rest(update).join(''));
                } else {
                    return '';
                }
            }

            if(update.match(/^[+\-/*]/)){
                op=update[0];
                update=_.rest(update).join('');
            }
        }

        cnum = parseFloat(current);
        unum = parseFloat(update);

        if(!_.isNaN(unum) && !_.isUndefined(unum) ) {
            if(!_.isNaN(cnum) && !_.isUndefined(cnum) ) {
                switch(op) {
                    case '+':
                        return cnum+unum;
                    case '-':
                        return cnum-unum;
                    case '*':
                        return cnum*unum;
                    case '/':
                        return cnum/(unum||1);

                    default:
                        return unum;
                }
            } else {
                return unum;
            }
        }
        return update;
    };

    const parseArguments = function(a) {
        let args = a.replace(/(\|#|##)/g,'|%%HASHMARK%%').split(/[|#]/).map((v)=>v.replace('%%HASHMARK%%','#'));
        let cmd = unalias(args.shift().toLowerCase());
        let retr={};
        let t;
        let t2;

        if(_.has(fields,cmd)) {
            retr[cmd]=[];
            switch(fields[cmd].type) {
                case 'boolean': {
                      let v = args.shift().toLowerCase();
                      if(filters.isTruthyArgument(v)){
                        retr[cmd].push(true);
                      } else if (propBool.hasOwnProperty(v)){
                        retr[cmd].push(propBool[v]());
                      } else {
                        retr[cmd].push(false);
                      }
                    }
                    break;

                case 'text':
                    retr[cmd].push(args.shift().replace(regex.stripSingleQuotes,'$1').replace(regex.stripDoubleQuotes,'$1'));
                    break;

                case 'numberBlank':
                    retr[cmd].push(numberOp.parse(cmd,args.shift()));
                    break;

                case 'number':
                    retr[cmd].push(numberOp.parse(cmd,args.shift(),false));
                    break;

                case 'degrees':
                    if( '=' === args[0][0] ) {
                        t='=';
                        args[0]=_.rest(args[0]);
                    } else {
                        t='';
                    }
                    retr[cmd].push(t+(_.contains(['-','+'],args[0][0]) ? args[0][0] : '') + Math.abs(transforms.degrees(args.shift())));
                    break;

                case 'circleSegment':
                    if( '=' === args[0][0] ) {
                        t='=';
                        args[0]=_.rest(args[0]);
                    } else {
                        t='';
                    }
                    retr[cmd].push(t+(_.contains(['-','+'],args[0][0]) ? args[0][0] : '') + transforms.circleSegment(args.shift()));
                    break;

                case 'layer':
                    retr[cmd].push((args.shift().match(regex.layers)||[]).shift());
                    if(0 === (retr[cmd][0]||'').length) {
                        retr = undefined;
                    }
                    break;

                case 'defaulttoken': // blank
                    retr[cmd].push('');
                    break;

				case 'sideNumber':
					{
						let c = sideNumberOp.parseSideNumber(args.shift());
						if(c){
							retr[cmd].push(c);
						} else {
							retr = undefined;
						}
					}
					
					break;
                case 'image':
					{
						let c = imageOp.parseImage(args.shift());
						if(c){
							retr[cmd].push(c);
						} else {
							retr = undefined;
						}
					}
                    break;

                case 'color': {
						let c = ColorOp.parseColor(args.shift());
						if(c){
							retr[cmd].push(c);
						} else {
							retr = undefined;
						}
					}
                    break;

                case 'character_id':
                    if('' === args[0]){
                        retr[cmd].push('');
                    } else {
                        t=getObj('character', args[0]);
                        if(t) {
                            retr[cmd].push(args[0]);
                        } else {
                            // try to find a character with this name
                            t2=findObjs({type: 'character',archived: false});
                            t=_.chain([ args[0].replace(regex.stripSingleQuotes,'$1').replace(regex.stripDoubleQuotes,'$1') ])
                                .map(function(n){
                                    var l=_.filter(t2,function(c){
                                        return c.get('name').toLowerCase() === n.toLowerCase();
                                    });
                                    return ( 1 === l.length ? l : _.filter(t2,function(c){
                                        return -1 !== c.get('name').toLowerCase().indexOf(n.toLowerCase());
                                    }));
                                })
                                .flatten()
                                .value();
                            if(1 === t.length) {
                                retr[cmd].push(t[0].id);
                            } else {
                                retr=undefined;
                            }
                        }
                    }
                    break;

                case 'attribute':
                    retr[cmd].push(args.shift().replace(regex.stripSingleQuotes,'$1').replace(regex.stripDoubleQuotes,'$1'));
                    break;

                case 'player':
                    _.each(args, function(p){
                        let parts = p.match(/^([+-=]?)(.*)$/),
                            pids = (parts ? getPlayerIDs(parts[2].replace(regex.stripSingleQuotes,'$1').replace(regex.stripDoubleQuotes,'$1')):[]);
                        if(pids.length){
                            _.each(pids,(pid)=>{
                                retr[cmd].push({
                                    pid: pid,
                                    operation: parts[1] || '='
                                });
                                parts[1]='+';
                            });
                        } else if(_.contains(['','='],p)){
                            retr[cmd].push({
                                pid:'',
                                operation:'='
                            });
                        }
                    });
                    break;

                case 'status':
                    _.each(args, function(a) {
                        retr[cmd].push(statusOp.parse(a));
                    });
                    break;

                default:
                    retr=undefined;
                    break;
            }
        }

        return retr;
    };

    const expandMetaArguments = function(memo,a) {
        var args=a.split(/[|#]/),
            cmd=args.shift();
        switch(cmd) {
            case 'bar1':
            case 'bar2':
            case 'bar3':
                args=args.join('|');
                memo.push(cmd+'_value|'+args);
                memo.push(cmd+'_max|'+args);
                break;
            case 'scale':
                args.join('|');
                memo.push(`width|${args}`);
                memo.push(`height|${args}`);
                break;
            default:
                memo.push(a);
                break;
        }
        return memo;
    };

    const parseOrderArguments = function(list,base) {
        return _.chain(list)
            .map(transforms.orderType)
            .reject(_.isUndefined)
            .union(base)
            .value();
    };

    const parseSetArguments = function(list,base) {
        return _.chain(list)
            .filter(filters.hasArgument)
            .reduce(expandMetaArguments,[])
            .map(parseArguments)
            .reject(_.isUndefined)
            .reduce(function(memo,i){
                _.each(i,function(v,k){
                   switch(k){
                    case 'statusmarkers':
                        if(_.has(memo,k)) {
                            memo[k]=_.union(v,memo[k]);
                        } else {
                            memo[k]=v;
                        }
                        break;
                    default:
                        memo[k]=v;
                        break;
                   }
                });
                return memo;
            },base)
            .value();
    };

    const parseReportArguments = (list,base) =>
        list
            .filter(filters.hasArgument)
            .reduce((m,a)=>{
                let args=a.replace(/(\|#|##)/g,'|%%HASHMARK%%').split(/[|#]/).map((v)=>v.replace('%%HASHMARK%%','#'));
                let whose=args.shift().toLowerCase().split(/:/);
                let msg = args.shift();
                if(/^(".*")|('.*')$/.test(msg)){
                    msg=msg.slice(1,-1);
                }
                whose = whose.filter((w)=>reportTypes.includes(w));
                if(whose.length){
                    m.push({who:whose,msg});
                }
                return m;
            },base)
            ;


    const applyModListToToken = function(modlist, token) {
        let ctx={
              token: token,
              prev: JSON.parse(JSON.stringify(token))
            },
            mods={
              statusmarkers: token.get('statusmarkers')
            },
            delta,
            cid,
            repChar,
            controlList = (modlist.set && (modlist.set.controlledby || modlist.set.defaulttoken)) ? (function(){
                let list;
                repChar = getObj('character', modlist.set.represents || token.get('represents'));

                list = (repChar ? repChar.get('controlledby') : token.get('controlledby'));
                return (list ? list.split(/,/) : []);
            }()) : [];

        _.each(modlist.order,function(f){
            switch(f){
                case 'tofront':
                    toFront(token);
                    break;

                case 'toback':
                    toBack(token);
                    break;
            }
        });
        _.each(modlist.on,function(f){
            mods[f]=true;
        });
        _.each(modlist.off,function(f){
            mods[f]=false;
        });
        _.each(modlist.flip,function(f){
            mods[f]=!token.get(f);
        });
        _.each(modlist.set,function(f,k){
            switch(k) {
                case 'controlledby':
                    _.each(f, function(cb){
                        switch(cb.operation){
                            case '=': controlList=[cb.pid]; break;
                            case '+': controlList=_.union(controlList,[cb.pid]); break;
                            case '-': controlList=_.without(controlList,cb.pid); break;
                        }
                    });
                    if(repChar){
                        repChar.set('controlledby',controlList.join(','));
                    } else {
                        mods[k]=controlList.join(',');
                    }
                    break;

                case 'defaulttoken':
                    if(repChar){
                        token.set(mods);
                        setDefaultTokenForCharacter(repChar,token);
                    }
                    break;

                case 'statusmarkers':
                    _.each(f, function (sm){
                        mods.statusmarkers = sm.getMods(mods.statusmarkers).statusmarkers;
                    });
                    break;

                case 'represents':
                    mods[k]=f[0];
                    mods.bar1_link='';
                    mods.bar2_link='';
                    mods.bar3_link='';
                    break;

                case 'bar1_link':
                case 'bar2_link':
                case 'bar3_link':
                    if( '' === f[0] ) {
                        mods[k]='';
                    } else {
                        cid=mods.represents || token.get('represents') || '';
                        if('' !== cid) {
                            delta=findObjs({type: 'attribute', characterid: cid, name: f[0]}, {caseInsensitive: true})[0];
                            if(delta) {
                                mods[k]=delta.id;
                                mods[k.split(/_/)[0]+'_value']=delta.get('current');
                                mods[k.split(/_/)[0]+'_max']=delta.get('max');
                            } else {
                                mods[k]=`sheetattr_${f[0]}`;
                            }
                        }
                    }
                    break;


                case 'left':
                case 'top':
                case 'width':
                case 'height':
                    mods = Object.assign( mods, f[0].getMods(token,mods));
                    break;

                case 'rotation':
                    delta=getRelativeChange(token.get(k),f[0]);
                    if(_.isNumber(delta)) {
                        mods[k]=(delta%360);
                    }
                    break;

                case 'light_angle':
                case 'light_losangle':
                    delta=getRelativeChange(token.get(k),f[0]);
                    if(_.isNumber(delta)) {
                        mods[k] = Math.min(360,Math.max(0,delta));
                    }
                    break;

                case 'light_radius':
                case 'light_dimradius':
                case 'light_multiplier':
                case 'aura2_radius':
                case 'aura1_radius':
                case 'adv_fow_view_distance':
                case 'night_vision_distance':
                case 'bright_light_distance':
                case 'low_light_distance':
                case 'night_distance':
                case 'bright_distance':
                case 'low_distance':
                    mods = Object.assign( mods, f[0].getMods(token,mods));
                    break;

                case 'bar1_reset':
                case 'bar2_reset':
                case 'bar3_reset': {
						let field = k.replace(/_reset$/,'_max');
						delta = mods[field] || token.get(field);
						if(!_.isUndefined(delta)) {
							mods[k.replace(/_reset$/,'_value')]=delta;
						}
					}
                    break;

                case 'bar1_value':
                case 'bar2_value':
                case 'bar3_value':
                case 'bar1_max':
                case 'bar2_max':
                case 'bar3_max':
                case 'name':
                    delta=getRelativeChange(token.get(k),f[0]);
                    if(_.isNumber(delta) || _.isString(delta)) {
                        mods[k]=delta;
                    }
                    break;

				case 'currentSide':
				case 'currentside':
					mods = Object.assign( mods, f[0].getMods(token,mods));
					break;
				case 'imgsrc':
					mods = Object.assign( mods, f[0].getMods(token,mods));
					break;

				case 'aura1_color':
				case 'aura2_color':
				case 'tint_color':
                    mods[k]=f[0].applyTo(token.get(k)).toHTML();
					break;

                default:
                    mods[k]=f[0];
                    break;
            }
        });
        token.set(mods);
        notifyObservers('tokenChange',token,ctx.prev);
        return ctx;
    };

    const getWho = (()=> {
        let cache={};
        return (ids) => {
            let names = [];
            ids.forEach(id=>{
                if(cache.hasOwnProperty(id)){
                    names.push(cache[id]);
                } else {
                    if('all'===id){
                        cache.all = 'all';
                        names.push('all');
                    } else {
                        let p = findObjs({ type: 'player', id})[0];
                        if(p){
                            cache[id]=p.get('displayname');
                            names.push(cache[id]);
                        }
                    }
                }
            });
            if(names.includes('all')){
                return ['all'];
            }
            if(0===names.length){
                return ['gm'];
            }
            return names;
        };
    })();

    const doReports = (ctx,reports,callerWho) => {
        const transforms = {
            identity: a=>a,
            addOne: a=>a+1
        };

        const getTransform = (p) => {
            switch(p){
                case 'currentSide': return transforms.addOne;
                default: return transforms.identity;
            }
        };

        reports.forEach( r =>{
            let pmsg = r.msg.replace(/\{(.+?)\}/g, (m,n)=>{
                let parts=n.toLowerCase().split(/:/);
                let prop=unalias(parts[0]);
                let t = getTransform(prop);
    
                let mod=parts[1];

                switch(mod){
                    case 'before':
                        return t(ctx.prev[prop]);

                    case 'abschange':
                        return t(Math.abs((parseFloat(ctx.token.get(prop))||0) - (parseFloat(ctx.prev[prop]||0))));

                    case 'change':
                        return t((parseFloat(ctx.token.get(prop))||0) - (parseFloat(ctx.prev[prop]||0)));

                    default:
                        return t(ctx.token.get(prop));
                }
            });

            let whoList = r.who.reduce((m, w)=>{
                switch(w){
                    case 'gm':
                        return [...new Set([...m,'gm'])];

                    case 'player':
                        return [...new Set([...m,callerWho])];

                    case 'all':
                        return [...new Set([...m,'all'])];

                    case 'token':
                        return [...new Set([...m, ...getWho(ctx.token.get('controlledby').split(/,/))])];

                    case 'character': {
                            let c = getObj('character',ctx.token.get('represents')) || {get:()=>''};
                            return [...new Set([...m, ...getWho(c.get('controlledby').split(/,/))])];
                        }

                    case 'control': {
                            let c = getObj('character',ctx.token.get('represents')) || {get:()=>''};
                            return [...new Set([
                                ...m,
                                ...getWho(ctx.token.get('controlledby').split(/,/)),
                                ...getWho(c.get('controlledby').split(/,/))
                            ])];
                        }
                }
            }, []);

            if(whoList.includes('all')){
                sendChat('',`${pmsg}`);
            } else {
                whoList.forEach(w=>sendChat('',`/w "${w}" ${pmsg}`));
            }
        });
    };

    const handleConfig = function(config, id) {
        var args, cmd, who=(getObj('player',id)||{get:()=>'API'}).get('_displayname');

        if(config.length) {
            while(config.length) {
                args=config.shift().split(/[|#]/);
                cmd=args.shift();
                switch(cmd) {
                    case 'players-can-ids':
                        if(args.length) {
                            state.TokenMod.playersCanUse_ids = filters.isTruthyArgument(args.shift());
                        } else {
                            state.TokenMod.playersCanUse_ids = !state.TokenMod.playersCanUse_ids;
                        }
                        sendChat('','/w "'+who+'" '+
                            '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                getConfigOption_PlayersCanIDs()+
                            '</div>'
                        );
                        break;
                    default:
                        sendChat('', '/w "'+who+'" '+
                            '<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'+
                                '<span style="font-weight:bold;color:#990000;">Error:</span> '+
                                'No configuration setting for ['+cmd+']'+
                            '</div>'
                        );
                        break;
                }
            }
        } else {
            sendChat('','/w "'+who+'" '+
                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                    '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                        'TokenMod v'+version+
                    '</div>'+
                    getConfigOption_PlayersCanIDs()+
                '</div>'
            );
        }
    };

// */
     const handleInput = function(msg_orig) {
        try {
            if (msg_orig.type !== "api") {
                return;
            }

            let msg = _.clone(msg_orig);
            let who=(getObj('player',msg_orig.playerid)||{get:()=>'API'}).get('_displayname');
            let playerid = msg.playerid;
            let args;
            let cmds;
            let ids=[];
            let ignoreSelected = false;
            let pageRestriction=[];
            let modlist={
                    flip: [],
                    on: [],
                    off: [],
                    set: {},
                    order: []
                };
            let reports=[];


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

            args = msg.content
                .replace(/<br\/>\n/g, ' ')
                .replace(/(\{\{(.*?)\}\})/g," $2 ")
                .split(/\s+--/);


            switch(args.shift()) {
                case '!token-mod': {

                    while(args.length) {
                        cmds=args.shift().match(/([^\s]+[|#]'[^']+'|[^\s]+[|#]"[^"]+"|[^\s]+)/g);
                        switch(cmds.shift()) {
                            case 'help':

// !tokenmod --help [all]
    // just the top part and ToC

// !tokenmod --help
    // just the top part and ToC

// !tokenmod --help[-only] [set|on|off|flip|config]
    // top part, plus the command parts
    // -only leaves off top part

// !tokenmod --help[-only] <property> [<properties...]
    // top part, command part, property part
    // -only leaves off top and command 

// !tokenmod --help <full command>
    // explains the parts command


                                showHelp(playerid);
                                return;

                            case 'api-as':
                                if('API' === playerid){
                                    let player = getObj('player',cmds[0]);
                                    if(player){
                                        playerid = player.id;
                                        who = player.get('_displayname');
                                    }
                                }
                                break;

                            case 'config':
                                if(playerIsGM(playerid)) {
                                    handleConfig(cmds,playerid);
                                }
                                return;


                            case 'flip':
                                modlist.flip=_.union(_.filter(cmds.map(unalias),filters.isBoolean),modlist.flip);
                                break;

                            case 'on':
                                modlist.on=_.union(_.filter(cmds.map(unalias),filters.isBoolean),modlist.on);
                                break;

                            case 'off':
                                modlist.off=_.union(_.filter(cmds.map(unalias),filters.isBoolean),modlist.off);
                                break;

                            case 'set':
                                modlist.set=parseSetArguments(cmds,modlist.set);
                                break;

                            case 'order':
                                modlist.order=parseOrderArguments(cmds,modlist.order);
                                break;
                            case 'report':
                                reports= parseReportArguments(cmds,reports);
                                break;

                            case 'ignore-selected':
                                ignoreSelected=true;
                                break;

                            case 'active-pages':
                                pageRestriction=getActivePages();
                                break;

                            case 'current-page':
                                pageRestriction=[getPageForPlayer(playerid)];
                                break;

                            case 'ids':
                                ids=_.union(cmds,ids);
                                break;
                        }
                    }
                    modlist.off=_.difference(modlist.off,modlist.on);
                    modlist.flip=_.difference(modlist.flip,modlist.on,modlist.off);
                    if( !playerIsGM(playerid) && !state.TokenMod.playersCanUse_ids ) {
                        ids=[];
                    }

                    if(!ignoreSelected) {
                        ids=_.union(ids,_.pluck(msg.selected,'_id'));
                    }

                    let pageFilter = pageRestriction.length
                        ? (o) => pageRestriction.includes(o.get('pageid'))
                        : () => true;

                    if(ids.length){
                        _.chain(ids)
                        .uniq()
                        .map(function(t){
                            return {
                                id: t,
                                token: getObj('graphic',t),
                                character: getObj('character',t)
                            };
                        })
                        .reduce(function(m,o){
                            if(o.token){
                                m.push(o.token);
                            } else if(o.character){
                                m=_.union(m,findObjs({type:'graphic',represents:o.character.id}));
                            }
                            return m;
                        },[])
                        .uniq()
                        .reject(_.isUndefined)
                        .filter(pageFilter)
                        .each(function(t) {
                            let ctx = applyModListToToken(modlist,t);
                            doReports(ctx,reports,who);
                        });
                    }
                }
                break;

            }
        } catch (e) {
            let who=(getObj('player',msg_orig.playerid)||{get:()=>'API'}).get('_displayname');
            sendChat('TokenMod',`/w "${who}" `+
                `<div style="border:1px solid black; background-color: #ffeeee; padding: .2em; border-radius:.4em;" >`+
                    `<div>There was an error while trying to run your command:</div>`+
                    `<div style="margin: .1em 1em 1em 1em;"><code>${msg_orig.content}</code></div>`+
                    `<div>Please <a class="showtip tipsy" title="The Aaron's profile on Roll20." style="color:blue; text-decoration: underline;" href="https://app.roll20.net/users/104025/the-aaron">send me this information</a> so I can make sure this doesn't happen again (triple click for easy select in most browsers.):</div>`+
                    `<div style="font-size: .6em; line-height: 1em;margin:.1em .1em .1em 1em; padding: .1em .3em; color: #666666; border: 1px solid #999999; border-radius: .2em; background-color: white;">`+
                        JSON.stringify({msg: msg_orig, version:version, stack: e.stack})+
                    `</div>`+
                `</div>`
            );
        }

    };

    const registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('change:campaign:_token_markers',()=>StatusMarkers.init());
    };

    on("ready",() => {
        checkInstall();
        registerEventHandlers();
    });

    return {
        ObserveTokenChange: observeTokenChange
    };
})();




