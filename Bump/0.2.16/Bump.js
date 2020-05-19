// Github:   https://github.com/shdwjk/Roll20API/blob/master/Bump/Bump.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global GroupInitiative TokenMod */
const Bump = (() => { // eslint-disable-line no-unused-vars

    const version = '0.2.16';
    const lastUpdate = 1559166147;
    const schemaVersion = 0.4;
    const clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';
    const checkerURL = 'https://s3.amazonaws.com/files.d20.io/images/16204335/MGS1pylFSsnd5Xb9jAzMqg/med.png?1455260461';

    const regex = {
			colors: /(transparent|(?:#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?))/
        };

    const mirroredProps = [
            'name', 'left', 'top', 'width', 'height', 'rotation',
            'flipv', 'fliph', 'bar1_value', 'bar1_max',
            'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max',
            'tint_color', 'lastmove', 'controlledby', 'light_hassight',
            'light_radius', 'light_dimradius', 'light_angle', 'light_losangle','lastmove',
            'represents','bar1_link','bar2_link','bar3_link'
        ];

    const defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em 1em',
                    'color': 'white'
                }
            }
        };

    const filterObj = (o) => Object.keys(o).reduce( (m,k) => (undefined === o[k] ? m : Object.assign({},m,{[k]:o[k]})), {});
    const mergeObj = (...a) => Object.keys(a).reduce((m,k)=>Object.assign(m,filterObj(a[k])),{});
    const css = (rules) => `style="${Object.keys(rules).map(k=>`${k}:${rules[k]};`).join('')}"`;


    const makeButton = (command, label, backgroundColor, color) => `<a ${css(mergeObj(defaults.css.button,{color,'background-color':backgroundColor}))} href="${command}">${label}</a>`;


    const isPlayerToken = (obj) => {
        let players = obj.get('controlledby')
            .split(/,/)
            .filter(s=>s.length);

        if( players.includes('all') || players.filter((p)=>!playerIsGM(p)).length ) {
           return true;
        } 

        if('' !== obj.get('represents') ) {
            players = (getObj('character',obj.get('represents')) || {get: ()=>''} )
                .get('controlledby').split(/,/)
                .filter(s=>s.length);
            return  players.includes('all') || players.filter((p)=>!playerIsGM(p)).length ;
        }
        return false;
    };
    
    
    const keyForValue = (obj,v) => Object.keys(obj).find( key => obj[key] === v);
	const cleanupObjectReferences = () => {
        const allIds = findObjs({type:'graphic'}).map( o => o.id);
        const ids = [
                ...Object.keys(state.Bump.mirrored),
                ...Object.values(state.Bump.mirrored)
            ]
            .filter( id => !allIds.includes(id) );

            ids.forEach( id => {
                if(state.Bump.mirrored.hasOwnProperty(id)){
                    if(!ids.includes(state.Bump.mirrored[id])){
                        let obj = getObj('graphic',state.Bump.mirrored[id]);
                        if(obj){
                            obj.remove();
                        }
                    }
                } else {
                    let iid = keyForValue(state.Bump.mirrored,id);
                    delete state.Bump.mirrored[iid];
                    if(!ids.includes(iid)){
                        createMirrored(iid, false, 'gm');
                    }
                }
            });
    };

	const checkGlobalConfig = () => {
		var s=state.Bump,
		g=globalconfig && globalconfig.bump;

		if(g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved
		){
			log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');

			if(g['Visible Color'].match(regex.colors)) {
                s.config.layerColors.gmlayer =g['Visible Color'].match(regex.colors)[1];
			}
			if(g['Invisible Color'].match(regex.colors)) {
                s.config.layerColors.objects=g['Invisible Color'].match(regex.colors)[1];
			}

			s.config.autoPush = 'autoPush' === g['Auto Push'];
			s.config.autoSlave = 'autoSlave' === g['Auto Slave'];

			state.Bump.globalconfigCache=globalconfig.bump;
		}
	};

    const checkInstall = () => {
        log('-=> Bump v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('Bump') || state.Bump.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.Bump && state.Bump.version) {
                case 0.1:
                    state.Bump.config.autoSlave = false;

                /* falls through */
				case 0.2:
				case 0.3:
                  delete state.Bump.globalConfigCache;
                  state.Bump.globalconfigCache = {lastsaved:0};

                /* falls through */
                case 'UpdateSchemaVersion':
                    state.Bump.version = schemaVersion;
                    break;

                default:
                    state.Bump = {
                        version: schemaVersion,
                        globalconfigCache: {lastsaved:0},
                        config: {
                            layerColors: {
                                'gmlayer' : '#008000',
                                'objects' : '#800080'
                            },
                            autoPush: false,
                            autoSlave: false
                        },
                        mirrored: {}
                    };
                    break;
            }
        }
        checkGlobalConfig();
        cleanupObjectReferences();
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

    const statusImg = (name) => {
        const statusSheet = 'https://app.roll20.net/images/statussheet.png',
        ratio = 2.173913,
        scale = 1.4,
        statuses = [
            'red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow', // 0-6
            'dead',
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
        ],
        statusColormap = [
            '#C91010', // red
            '#1076c9', // blue
            '#2fc910', // green
            '#c97310', // brown
            '#9510c9', // purple
            '#eb75e1', // pink
            '#e5eb75', // yellow
            '#cc1010'  // dead
        ];

        let i=statuses.indexOf(name);
        if(i<7) {
            return `<div style="width: ${scale*.9}em; height: ${scale*.9}em; border-radius:${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; background-color: ${statusColormap[i]}"></div>`;
        } 
        if(7===i) {
            return `<div style="width: 1em; height: ${scale}em; font-size: ${scale}em; display:inline-block; margin: 0; border:0; font-weight: bold; color: ${statusColormap[i]}">X</div>`;
        }
        return `<div style="width: ${scale}em; height: ${scale}em; display:inline-block; margin: 0 3px 0 0; border:0; padding:0;background-image: url('${statusSheet}');background-repeat:no-repeat;background-position: ${(ratio*(i-8))}% 0; background-size: auto ${scale}em;"></div>`;
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
        group: (...o) => `${o.join(' ')}`,
        items: (o) => `<li>${o.join('</li><li>')}</li>`,
        ol: (...o) => `<ol>${_h.items(o)}</ol>`,
        ul: (...o) => `<ul>${_h.items(o)}</ul>`,
        grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`,
        cell: (o) =>  `<div style="width: 130px; padding: 0 3px; float: left;">${o}</div>`,
        statusCell: (o) =>  `<div style="width: 130px; padding: 0 3px; height: 1.5em; float: left;">${statusImg(o)}${o}</div>`,
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


    const getMirroredPair = (id) => {
        if(state.Bump.mirrored.hasOwnProperty(id)){
            return {
                master: getObj('graphic',id),
                slave: getObj('graphic',state.Bump.mirrored[id])
            };
        }
        let iid = keyForValue(state.Bump.mirrored,id);
        if(iid){
            return {
                master: getObj('graphic',iid),
                slave: getObj('graphic',id)
            };
        }
    };

    const getMirrored = (id) => {
        if(state.Bump.mirrored.hasOwnProperty(id)){
            return getObj('graphic',state.Bump.mirrored[id]);
        }
        let iid = keyForValue(state.Bump.mirrored,id);
        if(iid){
            return getObj('graphic',iid);
        }
    };

    const createMirrored = (id, push, who) => {
        // get root obj
        var master = getObj('graphic',id),
            slave = getMirrored(id),
            baseObj,
            layer;

        if(!slave && master) {
            layer=((state.Bump.config.autoPush || push || 'gmlayer' === master.get('layer')) ? 'objects' : 'gmlayer');
            if(state.Bump.config.autoPush || push) {
                master.set({layer: 'gmlayer'});
            }
            baseObj = {
                imgsrc: clearURL,
                layer: layer,
                pageid: master.get('pageid'),
                aura1_color: state.Bump.config.layerColors[layer],
                aura1_square: true,
                aura1_radius: 0.000001,
                light_otherplayers: (isPlayerToken(master) ? master.get('light_otherplayers') : false),
                showname: (isPlayerToken(master) ? master.get('showname') : false),
                showplayers_name: false,
                showplayers_bar1: false,
                showplayers_bar2: false,
                showplayers_bar3: false,
                showplayers_aura1: false,
                showplayers_aura2: false
            };
            mirroredProps.forEach( p => baseObj[p]=master.get(p) );
            slave = createObj('graphic',baseObj);
            state.Bump.mirrored[master.id]=slave.id;
        } else {
            if(!slave) {
                sendChat('',`/w "${who}" `+
                    '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                        `<b>Error:</b> Couldn${ch("'")}t find a token for id: ${id}`+
                    '</div>'
                );
            }
        }
    };

    const setMasterLayer = (obj,layer) => {
        obj.set({
            layer: layer
        });
    };

    const setSlaveLayer = (obj,layer) => {
        obj.set({
            layer: layer,
            aura1_color: state.Bump.config.layerColors[layer]
        });
    };

    const bumpToken = (id,who) => {
        var pair=getMirroredPair(id);
        if(pair && pair.master && pair.slave) {
            switch(pair.master.get('layer')){
                case 'gmlayer':
                    setMasterLayer(pair.master,'objects');
                    setSlaveLayer(pair.slave,'gmlayer');
                    break;

                default:
                    setMasterLayer(pair.master,'gmlayer');
                    setSlaveLayer(pair.slave,'objects');
                    break;
            }
        } else if(state.Bump.config.autoSlave) {
            createMirrored(id, false, who);
        }
    };

    const removeMirrored = (id) => {
        var pair=getMirroredPair(id);
        if(pair) {
            if(id === pair.master.id ) {
                pair.slave.remove();
            }
            delete state.Bump.mirrored[pair.master.id];
        }
    };


    const handleRemoveToken = (obj) => {
        // special handling for deleting slaves?
        removeMirrored(obj.id);
    };


    const unpackSM = (stats) => stats.split(/,/).reduce((m,v) => {
        let p = v.split(/@/);
        let n = parseInt(p[1] || '0', 10);
        if(p[0].length) {
          m[p[0]] = Math.max(n, m[p[0]] || 0);
        }
        return m;
      },{});

    const packSM = (o) =>  Object.keys(o)
      .map(k => ('dead' === k || o[k]<1 || o[k]>9) ? k : `${k}@${parseInt(o[k])}` ).join(',');

    
    const handleTokenChange = (obj,prev) => {
        var pair = getMirroredPair(obj.id);
        if(pair && obj) {
            // status markers
            if(obj.id === pair.slave.id && obj.get('statusmarkers') !== prev.statusmarkers){
                let sSM = unpackSM(obj.get('statusmarkers'));
                let mSM = unpackSM(pair.master.get('statusmarkers'));
                Object.keys(sSM).forEach( s => {
                    if(sSM[s]) {
                        mSM[s] = Math.min(Math.max((mSM[s]||0) + sSM[s],0),9);
                    } else if(mSM.hasOwnProperty(s)) {
                        delete mSM[s];
                    } else {
                        mSM[s]=0;
                    }
                });
                pair.slave.set('statusmarkers','');
                pair.master.set('statusmarkers',packSM(mSM));
            }

            (pair.master.id === obj.id ? pair.slave : pair.master).set(mirroredProps.reduce((m,p) => {
                m[p]=obj.get(p);
                return m;
            },{}));

            if(pair.slave.id === obj.id) {
                pair.slave.set(Object.assign({
                    showplayers_name: false,
                    showplayers_bar1: false,
                    showplayers_bar2: false,
                    showplayers_bar3: false,
                    showplayers_aura1: false,
                    showplayers_aura2: false
                },(mirroredProps.reduce((m,p) => {
                    m[p]=pair.slave.get(p);
                    return m;
                },{}))));
            } else {
                pair.master.set(mirroredProps.reduce((m,p) => {
                    m[p]=pair.master.get(p);
                    return m;
                },{}));
                pair.slave.set({
                    showplayers_name: false,
                    showplayers_bar1: false,
                    showplayers_bar2: false,
                    showplayers_bar3: false,
                    showplayers_aura1: false,
                    showplayers_aura2: false
                });
            }

            if(obj.get('layer') !== prev.layer) {
                if(pair.master.id === obj.id) {
                    setSlaveLayer(pair.slave,prev.layer);
                } else {
                    setMasterLayer(pair.master,prev.layer);
                    setSlaveLayer(pair.slave,obj.get('layer'));
                }
            }
        }
    };

    const makeConfigOption = (config,command,text) => {
        var onOff = (config ? 'On' : 'Off' ),
            color = (config ? '#5bb75b' : '#faa732' );
        return '<div style="'+
                'border: 1px solid #ccc;'+
                'border-radius: .2em;'+
                'background-color: white;'+
                'margin: 0 1em;'+
                'padding: .1em .3em;'+
            '">'+
                '<div style="float:right;">'+
                    makeButton(command,onOff,color)+
                '</div>'+
                text+
                '<div style="clear:both;"></div>'+
            '</div>';
        
    };

    const makeConfigOptionColor = (config,command,text) => {
        var color = ('transparent' === config ? "background-image: url('"+checkerURL+"');" : "background-color: "+config+";"),
            buttonText ='<div style="border:1px solid #1d1d1d;width:40px;height:40px;display:inline-block;'+color+'">&nbsp;</div>';
        return '<div style="'+
                'border: 1px solid #ccc;'+
                'border-radius: .2em;'+
                'background-color: white;'+
                'margin: 0 1em;'+
                'padding: .1em .3em;'+
            '">'+
                '<div style="float:right;">'+
                    makeButton(command,buttonText)+
                '</div>'+
                text+
                '<div style="clear:both;"></div>'+
            '</div>';
    };

    const getConfigOption_GMLayerColor = () => {
        return makeConfigOptionColor(
            state.Bump.config.layerColors.gmlayer,
            '!bump-config --gm-layer-color|?{What aura color for when the master token is visible? (transparent for none, #RRGGBB for a color)|'+state.Bump.config.layerColors.gmlayer+'}',
            '<b>GM Layer (Visible) Color</b> is the color the overlay turns when it is on the GM Layer, thus indicating that the Bumped token is visible to the players on the Object Layer.'
        );

    };

    const getConfigOption_ObjectsLayerColor = () => {
        return makeConfigOptionColor(
            state.Bump.config.layerColors.objects,
            '!bump-config --objects-layer-color|?{What aura color for when the master token is invisible? (transparent for none, #RRGGBB for a color)|'+state.Bump.config.layerColors.objects+'}',
            '<b>Objects Layer (Invisible) Color</b> is the color the overlay turns when it is on the Objects Layer, thus indicating that the Bumped token is invisible to the players on the GM Layer.'
        );
    };

    const getConfigOption_AutoPush = () => {
        return makeConfigOption(
            state.Bump.config.autoPush,
            '!bump-config --toggle-auto-push',
            '<b>Auto Push</b> automatically moves a bumped token to the GM Layer when it gets added to Bump.'
        );
    };

    const getConfigOption_AutoSlave = () => {
        return makeConfigOption(
            state.Bump.config.autoSlave,
            '!bump-config --toggle-auto-slave',
            '<b>Auto Slave</b> causes tokens that are not in Bump to be put into Bump when ever !bump is run with them selected.'
        );
    };

    const getAllConfigOptions = () => {
        return getConfigOption_GMLayerColor() +
            getConfigOption_ObjectsLayerColor() +
            getConfigOption_AutoPush() +
            getConfigOption_AutoSlave();
    };

    const showHelp = (playerid) => {
        const who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
        sendChat('',`/w "${who}" `+
            _h.outer(
                _h.title('Bump', version),
                _h.header(
                    _h.paragraph('Bump provides a way to invisibly manipulate tokens on the GM Layer from the Objects Layer, and vice versa.')
                ),
                _h.subhead('Commands'),
                _h.inset(
                    _h.font.command(
                        `!bump-slave`,
                        _h.optional(
                            `--push`,
                            `--help`
                        )
                    ),
                    _h.paragraph( 'Adds the selected tokens to Bump, creating their slave tokens.'),
                    _h.ul(
                        `${_h.bold('--push')} -- If the selected token is on the Objects Layer, it will be pushed to the GM Layer.`,
                        `${_h.bold('--help')} -- Shows the Help screen.`
                    ),
                    _h.font.command(
                        `!bump`,
                        _h.optional(
                            `--help`
                        )
                    ),
                    _h.paragraph( `Using !bump on a token in Bump causes it to swap with it${ch("'")}s counterpart on the other layer.`),
                    _h.ul(
                        `${_h.bold('--help')} -- Shows the Help screen.`
                    )
                ),
                _h.subhead('Description'),
                _h.inset(
                    _h.paragraph('When a token is added to Bump a slave token is created that mimics everything about the master token.  The slave token is only visible to the GM and has a color on it to show if the master token is on the GM Layer or the Objects layer.  Moving the slave token will move the master token and vice versa.  The slave token represents the same character as the master token and changes on the slave token will be reflected on the master token.'),
                    _h.paragraph('Non-GM players can also use bump on characters they control.  They will be able to see their bumped token as a transparent aura, but other players will not.  This is useful for invisible characters.'),
                    _h.paragraph(`While changes on the slave token will be reflected on the master token, Status Markers have a special behavior.  Status Markers are always cleared from the slave token to prevent it from being visible, with the following changes being made to the master token. Adding a Status Marker on a slave token that is not on the master token will cause that Status Marker to be added to the master token. Adding a Status Marker to the slave token that is on the master token causes it to be removed from the master token.  Adding a Status Marker with a number on the slave token will cause that number to be added to the master token${ch("'")}s Status Marker. Note that non-GM players will not be able to see Status Markers.`)
                ),
                ( playerIsGM(playerid)
                    ?  _h.group(
                            _h.subhead('Configuration'),
                            getAllConfigOptions()
                        )
                    : ''
                )
            )
        );
    };

    const handleInput = (msg) => {
        var args, who;

        if (msg.type !== "api") {
            return;
        }
		who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        args = msg.content.split(/\s+/);
        switch(args.shift()) {
            case '!bump':
                if(!msg.selected || args.includes('--help')) {
                    showHelp(msg.playerid);
                    return;
                }
                msg.selected.forEach( (s) => bumpToken(s._id,who) );
                break;

            case '!bump-slave':
                if(!msg.selected || args.includes('--help')) {
                    showHelp(msg.playerid);
                    return;
                }
                msg.selected.forEach( (s) => createMirrored(s._id, args.includes('--push'), who) );
                break;


            case '!bump-config':
                if(args.includes('--help')) {
                    showHelp(msg.playerid);
                    return;
                }
                if(!playerIsGM(msg.playerid)){
                    break;
                }
                if(!args.length) {
                    sendChat('','/w "'+who+'" '+
                        '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                            '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                                'Bump v'+version+
                            '</div>'+
                            getAllConfigOptions()+
                        '</div>'
                    );
                    return;
                }
                args.forEach((a) => {
                    var opt=a.split(/\|/),
                        omsg='';
                    switch(opt.shift()) {
                        case '--gm-layer-color':
                            if(opt[0].match(regex.colors)) {
                               state.Bump.config.layerColors.gmlayer=opt[0];
                            } else {
                                omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
                            }
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    omsg+
                                    getConfigOption_GMLayerColor()+
                                '</div>'
                            );
                            break;

                        case '--objects-layer-color':
                            if(opt[0].match(regex.colors)) {
                               state.Bump.config.layerColors.objects=opt[0];
                            } else {
                                omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
                            }
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    omsg+
                                    getConfigOption_ObjectsLayerColor()+
                                '</div>'
                            );
                            break;

                        case '--toggle-auto-push':
                            state.Bump.config.autoPush=!state.Bump.config.autoPush;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_AutoPush()+
                                '</div>'
                            );
                            break;
                        
                        case '--toggle-auto-slave':
                            state.Bump.config.autoSlave=!state.Bump.config.autoSlave;
                            sendChat('','/w "'+who+'" '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_AutoSlave()+
                                '</div>'
                            );
                            break;

                        default:
                            sendChat('','/w "'+who+'" '+
                            '<div><b>Unsupported Option:</div> '+a+'</div>');
                    }
                            
                });

                break;
        }
    };
    
    const handleTurnOrderChange = () => {
         Campaign().set({
            turnorder: JSON.stringify(
                JSON.parse( Campaign().get('turnorder') || '[]').map( (turn) => {
                    let iid = keyForValue(state.Bump.mirrored,turn.id);
                    if(iid) {
                        turn.id = iid;
                    }
                    return turn;
                })
            )
        });
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:graphic', handleTokenChange);
        on('destroy:graphic', handleRemoveToken);
        on('change:campaign:turnorder', handleTurnOrderChange);

        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(handleTurnOrderChange);
        }
        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(handleTokenChange);
        }
    };

    return {
        CheckInstall: checkInstall,
        Notify_TurnOrderChange: handleTurnOrderChange,
        RegisterEventHandlers: registerEventHandlers
    };
    
})();

on('ready', () => {
    Bump.CheckInstall();
    Bump.RegisterEventHandlers();
});

