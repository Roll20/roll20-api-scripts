// Github:   https://github.com/shdwjk/Roll20API/blob/master/ColorEmote/ColorEmote.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var ColorEmote = ColorEmote || (function() {
    'use strict';

    var version = '0.1.5',
        lastUpdate = 1491142093,
        schemaVersion = 0.4,
        symbols = {
            whitePawn: '&#'+'9817;',
            blackPawn: '&#'+'9823;',
            dropDown: '&#'+'9660;'
        },
        parseOrders = {
            'character first': ['character','token','player'],
            'token first': ['token','character','player']
        },
        imageScales = {
            'small': '1em',
            'medium': '2.5em',
            'large': '4em',
            'huge': '6em',
            'gargantuan': '8em',
            'colossal': '12em'
        },
        vignetteModes = {
            'none': {
                'border':'0',
                'border-radius':'0',
                'background-color':'none'
            },
            'thin-square':{
                'border':'.1em solid #1d1d1d',
                'border-radius':'.25em',
                'background-color':'#cccccc'
            },
            'thick-square':{
                'border':'.2em solid #1d1d1d',
                'border-radius':'.25em',
                'background-color':'#cccccc'
            },
            'thin-round':{
                'border':'.1em solid #1d1d1d',
                'border-radius':'100%',
                'background-color':'#cccccc'
            },
            'thick-round':{
                'border':'.2em solid #1d1d1d',
                'border-radius':'100%',
                'background-color':'#cccccc'
            }
        },
        defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em .4em',
                    'color': 'white'
                },

                emoteImageContainer: {
                    'padding': 'auto',
                    'float': 'left',
                    'overflow':'hidden'
                },
                emoteImage: {
                    'height': 'auto',
                    'width': 'auto',
                    'margin-right':'.5em'
                },
                emoteHeader: {
                    'border-bottom': '.2em solid #1d1d1d',
                    'padding': '.5em',
                    'font-size': '1.25em',
                    'text-align': 'center',
                    'position': 'relative'
                },
                emoteBody: {
                    'padding': '1em',
                    'font-size': '1em'
                },
                turnMarker: {
                    'background-color': '#ffffff',
                    'color': '#1d1d1d',
                    'font-style': 'normal',
                    'padding': '.1em .15em .25em .15em',
                    'font-size': '1.25em',
                    'float': 'right',
                    'border': '.1em solid #1d1d1d',
                    'border-radius': '100%',
                    'box-shadow': '#000000 0 0 .1em'
                },

                emoteMsg: {
                    'border': '.2em solid #1d1d1d',
                    'font-style': 'italic',
                    'font-weight':'bold',
                    'border-radius': '.5em',
                    'margin': '0 0',
                    'padding': '0',
                    'overflow': 'hidden'
                }
            }
        },
        templates = {},

    buildTemplates = function() {
        templates.cssProperty =_.template(
            '<%=name %>: <%=value %>;'
        );

        templates.style = _.template(
            'style="<%='+
                '_.map(css,function(v,k) {'+
                    'return templates.cssProperty({'+
                        'defaults: defaults,'+
                        'templates: templates,'+
                        'name:k,'+
                        'value:v'+
                    '});'+
                '}).join("")'+
            ' %>"'
        );

        templates.button = _.template(
            '<a <%= templates.style({'+
                'defaults: defaults,'+
                'templates: templates,'+
                'css: _.defaults(css,defaults.css.button)'+
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
        );

        templates.emoteImage = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(ccss||{},defaults.css.emoteImageContainer)}) %> >'+
                '<img <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.emoteImage}) %> src="<%=img %>"/>'+
            '</div>'
        );

        templates.turnMarker = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults(css,defaults.css.turnMarker)}) %> >'+
                symbols.blackPawn+
            '</div>'
            
        );

        templates.output = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.emoteMsg}) %> >'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults({},css,defaults.css.emoteHeader)}) %>>'+
                    '<%= templates.emoteImage({img: img, defaults: defaults, templates:templates, ccss: {}, css: defaults.css.emoteImage}) %>'+
                    '<% if(isTurn) { %>'+
                        '<%= templates.turnMarker({defaults: defaults,templates:templates,css:css.turnMarker}) %>'+
                    '<% } %>'+
                    '<%= name %>'+
                    '<div style="clear:both;"></div>'+
                '</div>'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css:_.defaults(css,defaults.css.emoteBody)}) %>>'+
                    '<%= message %>'+
                '</div>'+
            '</div>'
        );

        templates.outputShortForm = _.template(
            '<div <%= templates.style({defaults: defaults,templates: templates,css: defaults.css.emoteMsg}) %> >'+
                '<div <%= templates.style({defaults: defaults,templates: templates,css: _.defaults({},css,defaults.css.emoteBody)}) %>>'+
                    '<%= templates.emoteImage({img: img, defaults: defaults, templates:templates, ccss: {"font-size":"1.25em"}, css: defaults.css.emoteImage}) %>'+
                    '<% if(isTurn) { %>'+
                        '<%= templates.turnMarker({defaults: defaults,templates:templates,css:_.defaults({"font-size":"1.5625em"},css.turnMarker)}) %>'+
                    '<% } %>'+
                    '<%= message %>'+
                    '<div style="clear:both;"></div>'+
                '</div>'+
            '</div>'
        );
    },

    setDynamicCSS = function(){
        defaults.css.emoteImageContainer = _.defaults(vignetteModes[state.ColorEmote.config.vignetteMode],defaults.css.emoteImageContainer);
        defaults.css.emoteImageContainer.width = imageScales[state.ColorEmote.config.imageScale];
        defaults.css.emoteImageContainer.height = imageScales[state.ColorEmote.config.imageScale];
        defaults.css.emoteImage['max-width'] = imageScales[state.ColorEmote.config.imageScale];
        defaults.css.emoteImage['max-height'] = imageScales[state.ColorEmote.config.imageScale];
    },

	getBrightness = function (hex) {
		var r,g,b;
		hex = hex.replace('#', '');
		r = parseInt(hex.substr(0, 2),16);
		g = parseInt(hex.substr(2, 2),16);
		b = parseInt(hex.substr(4, 2),16);
		return ((r * 299) + (g * 587) + (b * 114)) / 1000;
	},

    counterColor = function(color){
        return (getBrightness(color) < (255 / 2)) ? "#FFFFFF" : "#000000";
    },

    makeOutput = function (name,img,isTurn,message,color){

        return templates[(state.ColorEmote.config.shortForm ? 'outputShortForm': 'output')]({
            name: name,
            img: img,
            isTurn: isTurn,
            message: message,
            templates: templates,
            defaults: defaults,
            css: {
                'color': counterColor(color),
                'background-color': color
            }
        });
    },

    makeButton = function(command, label, backgroundColor, color){
        return templates.button({
            command: command,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {
                color: color,
                'background-color': backgroundColor
            }
        });
    },

    checkInstall = function() {
    	log('-=> ColorEmote v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'ColorEmote') || state.ColorEmote.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
			switch(state.ColorEmote && state.ColorEmote.version) {
				case 0.3:
					state.ColorEmote.config.parseOrder = 'character first';
					state.ColorEmote.config.shortForm = false;
                    /* break; // intentional dropthrough */
					
                case 'UpdateSchemaVersion':
                    state.ColorEmote.version = schemaVersion;
                    break;

                default:
                    state.ColorEmote = {
                        version: schemaVersion,
                        config: {
                            shortForm: false,
                            parseOrder: 'character first',
                            imageScale: 'medium',
                            vignetteMode: 'none'
                        }
                    };
                    break;
            }
        }
        setDynamicCSS();
        buildTemplates();
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

    makeConfigOption = function(config,command,text) {
        var buttonText = (_.isString(config) ? config : (config ? 'On' : 'Off' )),
            color = (config ? '#5bb75b' : '#faa732' );
        return '<div style="'+
                'border: 1px solid #ccc;'+
                'border-radius: .2em;'+
                'background-color: white;'+
                'margin: 0 1em;'+
                'padding: .1em .3em;'+
            '">'+
                '<div style="float:right;">'+
                    makeButton(command,buttonText,color)+
                '</div>'+
                text+
                '<div style="clear:both;"></div>'+
            '</div>';
        
    },

    getConfigOption_ShortForm = function() {
        return makeConfigOption(
            state.ColorEmote.config.shortForm,
            '!cem-config --toggle-short-form',
            '<b>Short Form</b> determines if the emote should be condensed into just the header space.'
        );
    },

    getConfigOption_ParseOrder = function() {
        return makeConfigOption(
            state.ColorEmote.config.parseOrder+symbols.dropDown,
            '!cem-config --set-parse-order ?{Parse Order|'+
            state.ColorEmote.config.parseOrder+' (current),'+ state.ColorEmote.config.parseOrder+'|'+
            _.keys(parseOrders).join('|')+'}',
            '<b>Parse Order</b> determines the order which images are searched for between Characters, Tokens, and Players.'
        );
    },

    getConfigOption_ImageScale = function() {
        return makeConfigOption(
            state.ColorEmote.config.imageScale+symbols.dropDown,
            '!cem-config --set-image-scale ?{Image Scale|'+
            state.ColorEmote.config.imageScale+' (current),'+ state.ColorEmote.config.imageScale+'|'+
            _.keys(imageScales).join('|')+'}',
            '<b>Image Scale</b> determines the size of the representative image in the header of an emote.'
        );
    },

    getConfigOption_VignetteMode = function() {
        return makeConfigOption(
            state.ColorEmote.config.vignetteMode+symbols.dropDown,
            '!cem-config --set-vignette-mode ?{Vignette Mode|'+
            state.ColorEmote.config.vignetteMode+' (current),'+ state.ColorEmote.config.vignetteMode+'|'+
            _.keys(vignetteModes).join('|')+'}',
            '<b>Vignette Mode</b> determines how the representative image is framed and clipped.'
        );
    },

    getAllConfigOptions = function() {
        return getConfigOption_ShortForm() +
             getConfigOption_ParseOrder() +
             getConfigOption_ImageScale() +
             getConfigOption_VignetteMode();
    },


    showHelp = function(playerid) {
		let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');

        sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'ColorEmote v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>ColorEmote provides a long form emote block with a colored background and header based on the Character, Token, or Player speaking.  The header contains a representative image for the speaker (Character Avatar, Token Image, or Player Image) as well as the name of the speaker.</p>'+
        '<p>The speaker is the first one of the following to be found:</p>'+
        '<ol>'+
            '<li>An explicit Token or Character ID specified with the bracketed command syntax:'+
                '<div style="padding-left: 10px;padding-right:20px">'+
                    '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                        '!cem'+ch('[')+ch('@')+ch('{')+'target'+ch('|')+'token_id'+ch('}')+ch(']')+' Does the things!'+
                    '</pre>'+
                '</div>'+
            '</li>'+
            '<li>The selected token'+ch("'")+'s character.</li>'+
            '<li>The selected token.</li>'+
            '<li>The character the player is speaking as.</li>'+
            '<li>The player.</li>'+
        '</ol>'+
        '<p>Background color is determined based on what is speaking.  The foreground color will be either black or white depending on the brightness of the background color.  The background color is chosen using the following methods:</p>'+
        '<ul>'+
            '<li><b>Characters</b> will have the color stored in an attribute named <b>color</b> or the player color.  The <b>color</b> attribute must be specified in standard html form with the # sign.  ex: #ff3322 or #f32 </li>'+
            '<li><b>Tokens</b> will have their aura2 color.</li>'+
            '<li><b>Players</b> will have their player color.</li>'+
        '</ul>'+
        '<p>If it is currently the speaker'+ch("'")+'s turn, a black pawn ('+symbols.blackPawn+') on a white circle will be displayed on the right side. (Does not apply to Players speaking.)</p>'+
        '<p>Multi-line emote messages may be specified by surrounding them in '+ch('{')+ch('{')+' and '+ch('}')+ch('}')+'.  You can insert new lines by pressing shift-enter.  Example:</p>'+
            '<div style="padding-left: 10px;padding-right:20px">'+
                '<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
                    '!cem {{ Does the things!<br><br>But it fails in the usual way... }}'+
                '</pre>'+
            '</div>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!cem'+ch('[')+' token_id '+ch('|')+' character_id '+ch(']')+' '+ch('[')+' '+ch('<')+'Message'+ch('>')+' '+ch('|')+' '+ch('{')+ch('{')+' '+ch('<')+'Multi-line Message'+ch('>')+' '+ch('}')+ch('}')+' '+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Outputs an Emote. Note that the optional bracketed syntax has no space between the !cem and leading '+ch('[')+'.</p>'+
		'</div>'+
    '</div>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!wcem'+ch('[')+' token_id '+ch('|')+' character_id '+ch(']')+' '+ch('[')+' '+ch('<')+'Message'+ch('>')+' '+ch('|')+' '+ch('{')+ch('{')+' '+ch('<')+'Multi-line Message'+ch('>')+' '+ch('}')+ch('}')+' '+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>Identical to !cem except that the output is whispered to the player emoting and the GM.</p>'+
		'</div>'+
    '</div>'+
    ( playerIsGM(playerid)
        ?  '<b>Configuration</b>' + getAllConfigOptions() 
        : ''
    )+
'</div>'
        );
    },




    

    getCharacterAndTokenTurn = function(){
        var token = getObj('graphic',(JSON.parse(Campaign().get('turnorder')||'[]')[0]||{id:null}).id);
        if(token){
            return {
                cid: token.get('represents'),
                tid: token.id
            };
        }
        return {
            cid:null,
            tid:null
        };
    },

    performOutput = function(details){
        var output=makeOutput(details.name,details.img,details.isTurn,details.message,details.color);
        if(details.whisper){
            sendChat('','/w gm '+output);
            if(!playerIsGM(details.playerid)){
                sendChat('','/w "'+details.who+'" '+output);
            }
        } else {
            sendChat('','/direct '+output);
        }
    },

    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args, cmd, matches, ctid, turnData,
            parsers={},
            player,character,token,data,
            img, name, text, color,who,
            isTurn = false, whisper=false
            ;

        if (msg.type !== "api") {
            return;
        }
        
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

		args = msg.content
            .replace(/<br\/>\n/g, '<br/>')
            .replace(/(\{\{(.*?)\}\})/g," $2 ")
            .split(/\s+/);

        cmd=args.shift();
        matches=cmd.match(/^(!\S+)\[([^\]]+)\]/);
        if(matches){
            cmd=matches[1];
            ctid=matches[2];
        }
        switch(cmd) {
            case '!wcem':
                whisper=true;
                /* break; // intentional drop thru */

            case '!cem':

                if( 0 === args.length || _.contains(args,'--help')) {
                    showHelp(msg.playerid);
                    return;
                }

                player=(getObj('player',msg.playerid)||{get:function(prop){
					let propmap={
						speakingas: 'gm|0',
						displayname: 'API',
						_displayname: 'API',
						d20userid: 0,
						color: '#000000'
					};
					return propmap[prop];
				}});
                turnData=getCharacterAndTokenTurn();
                text=args.join(' ');

                
                // explicit token
                if(ctid){
                    character=getObj('character',ctid);
                    token=getObj('graphic',ctid);
                }
                // selected token's character or token
                if( !(character || token) && msg.selected && msg.selected.length){
                    token=getObj('graphic',(_.find(msg.selected,function(o){
                            return 'graphic'===o._type;
                        })||{_id:null})._id);
                    character=getObj('character',(token && token.get('represents'))||'');
                }
                // speaking as character
                if( !(character || token) ){
                    character=filterObjs(function(o){
                        return 'character'===o.get('type')
                            && o.id === player.get('speakingas').split(/\|/)[1];
                    })[0];
                }

                parsers={
                    character: function(){
                        name=character.get('name');
                        isTurn = character.id === turnData.cid;
                        color=getAttrByName(character.id,'color');
                        color=(color && color.match(/#[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?/) ? color : player.get('color') );
                        character.get('defaulttoken',function(dt){
                            img=character.get('avatar')
                                || (JSON.parse(dt||'')||{imgsrc:''}).imgsrc
                                || 'https://app.roll20.net/users/avatar/'+player.get('d20userid')+'/150#.png';

                                performOutput({
                                    playerid: msg.playerid,
                                    who: player.get('displayname'),
                                    name: name,
                                    img: img,
                                    isTurn: isTurn,
                                    color: color,
                                    whisper: whisper,
                                    message: text
                                });

                        });
                    },
                    token: function(){
                        name=token.get('name');
                        img=token.get('imgsrc');
                        isTurn = token.id === turnData.tid;
                        color=token.get('aura2_color')||player.get('color');
                        performOutput({
                            playerid: msg.playerid,
                            who: player.get('displayname'),
                            name: name,
                            img: img,
                            isTurn: isTurn,
                            color: color,
                            whisper: whisper,
                            message: text
                        });
                    },
                    player: function(){
                        name=player.get('displayname');
                        img='https://app.roll20.net/users/avatar/'+player.get('d20userid')+'/150#.png';
                        color=player.get('color');
                        performOutput({
                            playerid: msg.playerid,
                            who: player.get('displayname'),
                            name: name,
                            img: img,
                            isTurn: isTurn,
                            color: color,
                            whisper: whisper,
                            message: text
                        });
                    }
                };
                data={
                    character:character,
                    token:token,
                    player:player
                };
                _.find(parseOrders[state.ColorEmote.config.parseOrder],function(k){
                    if(data[k]){
                        parsers[k]();
                        return true;
                    }
                });


                break;
            case '!cem-config':
                if(!playerIsGM(msg.playerid)){
                    return;
                }
                args = _.rest(msg.content.split(/\s+--/));
                if(_.contains(args,'help')) {
                    showHelp(msg.playerid);
                    return;
                }
				who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

                if(!args.length) {
                    sendChat('','/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'ColorEmote v'+version+
	'</div>'+
    '<b>Configuration</b>'+
    getAllConfigOptions()+
'</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\s+/);
                    switch(opt.shift()) {

                        case 'toggle-short-form':
                            state.ColorEmote.config.shortForm=!state.ColorEmote.config.shortForm;
                            sendChat('','/w "'+who+'" '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +getConfigOption_ShortForm()
                                +'</div>'
                            );
                            break;

                        case 'set-parse-order':
                            opt=opt.join(' ');
                            if(_.has(parseOrders,opt)){
                                state.ColorEmote.config.parseOrder=opt;
                                sendChat('','/w "'+who+'" '
                                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                        +getConfigOption_ParseOrder()
                                    +'</div>'
                                );
                            } else {
                                sendChat('','/w "'+who+'" '
                                    +'<div><b>Unsupported Parse Order:</div> '+opt+'</div>'
                                );
                            }
                            break;

                        case 'set-image-scale':
                            if(_.has(imageScales,opt[0])){
                                state.ColorEmote.config.imageScale=opt[0];
                                sendChat('','/w "'+who+'" '
                                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                        +getConfigOption_ImageScale()
                                    +'</div>'
                                );
                                setDynamicCSS();
                            } else {
                                sendChat('','/w "'+who+'" '
                                    +'<div><b>Unsupported Image Scale:</div> '+opt[0]+'</div>'
                                );
                            }
                            break;

                        case 'set-vignette-mode':
                            if(_.has(vignetteModes,opt[0])){
                                state.ColorEmote.config.vignetteMode=opt[0];
                                sendChat('','/w "'+who+'" '
                                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                        +getConfigOption_VignetteMode()
                                    +'</div>'
                                );
                                setDynamicCSS();
                            } else {
                                sendChat('','/w "'+who+'" '
                                    +'<div><b>Unsupported Vignette Mode:</div> '+opt[0]+'</div>'
                                );
                            }
                            break;

                        default:
                            sendChat('','/w "'+who+'" '
                                +'<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });

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

on('ready',function() {
    'use strict';

    ColorEmote.CheckInstall();
    ColorEmote.RegisterEventHandlers();
});

