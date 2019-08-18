// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenNameNumber/TokenNameNumber.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var globalconfig = globalconfig || undefined;
var TokenNameNumber = TokenNameNumber || (function() {
    'use strict';

    var version = '0.5.12',
        lastUpdate = 1500994908,
        schemaVersion = 0.5,
        statuses = [
            'red', 'blue', 'green', 'brown', 'purple', 'pink', 'yellow', // 0-6
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
        statusColormap = ['#C91010', '#1076c9', '#2fc910', '#c97310', '#9510c9', '#eb75e1', '#e5eb75'],
        regex = {
            escape: /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g
        },
        tokenIds = [],

    checkGlobalConfig = function(){
        var s=state.TokenNameNumber,
            g=globalconfig && globalconfig.tokennamenumber,
            parsedDots;
        if(g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved
        ){
          log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');

          s.config.randomSpace = parseInt(g['Random Space'])||0;
          s.config.useDots = 'useDots' === g['Use Dots'];
          if(s.config.useDots){
            parsedDots=_.chain(g.Dots.match(/[a-zA-Z-]+/g))
              .map(function(s){ return s.toLowerCase();})
              .uniq()
              .filter(function(s){ return _.contains(statuses,s);})
              ;
            if(parsedDots.length){
              s.config.dots = parsedDots;
            }
          }
          state.TokenNameNumber.globalconfigCache=globalconfig.tokennamenumber;
        }
    },
    checkInstall = function() {    
        log('-=> TokenNameNumber v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'TokenNameNumber') || state.TokenNameNumber.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.TokenNameNumber && state.TokenNameNumber.version) {
                case 0.3: 
				case 0.4:
					delete state.TokenNameNumber.globalConfigCache;
					state.TokenNameNumber.globalconfigCache = {lastsaved:0};

                /* falls through */
                case 'UpdateSchemaVersion':
                    state.TokenNameNumber.version = schemaVersion;
                    break;

                default:
                    state.TokenNameNumber = {
                        version: schemaVersion,
                        globalconfigCache: {lastsaved:0},
                        config: {
                            randomSpace: 0,
                            useDots: false,
                            dots: ['red','brown','yellow','green','blue','purple']
                        },
                        registry: {
                        }
                    };
                    break;
            }
        }
        checkGlobalConfig();
    },
    esRE = function (s) {
        return s.replace(regex.escape,"\\$1");
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

    getConfigOption_RandomSpace = function() {
        var text = ( state.TokenNameNumber.config.randomSpace > 0 ?
            '<span style="color: green; font-weight:bold;">'+ state.TokenNameNumber.config.randomSpace+ '</span>' :
            '<span style="color: red; font-weight:bold;">Off</span>' );
        return '<div>'+
            'Random Space of numbers between each consecutively generated token number:'+
                text+'. '+
                '<a href="!tnn-config --random-space|?{size of the random gap between token numbers (0 for off, any number for a range from 1 to that number)?|'+state.TokenNameNumber.config.randomSpace+'}">'+
                    'Set Random Space'+
                '</a>'+
            '</div>';
    },

    getConfigOption_UseDots = function() {
        var text = (state.TokenNameNumber.config.useDots ?
            '<span style="color: green; font-weight:bold;">On</span>' :
            '<span style="color: red; font-weight:bold;">Off</span>');

        return '<div>'+
            'Use Dots is currently <b>'+
                text+
            '</b>.'+
            '<a href="!tnn-config --toggle-use-dots">Toggle</a>'+
        '</div>';
    },

    getStatusButton = function(status) {
        var i=_.indexOf(statuses,status);
        if(i<7) {
            return '<a style="background-color: transparent; padding: 0;" href="!tnn-config --toggle-dot|'+status+'"><div style="width: 22px; height: 22px; border-radius:20px; display:inline-block; margin: 0; border:0; cursor: pointer;background-color: '+statusColormap[i]+'"></div></a>';
        } 
        return '<a style="background-color: transparent; padding: 0;" href="!tnn-config --toggle-dot|'+status+'"><div style="width: 24px; height: 24px; display:inline-block; margin: 0; border:0; cursor: pointer;padding:0;background-image: url(\'https://app.roll20.net/images/statussheet.png\');background-repeat:no-repeat;background-position: '+((-34)*(i-7))+'px 0px;"></div></a>';
    },

// https://app.roll20.net/images/statussheet.png
    getConfigOption_Dots = function() {
        return '<div>'+
            '<div>'+
                '<div style="font-weight: bold;">Dots (Click to move between pools).</div>'+
                '<div style="border: 1px solid #999999;border-radius: 10px; background-color: #eeffee;">'+
                    _.map(state.TokenNameNumber.config.dots,function(s){
                        return getStatusButton(s);
                    }).join('')+
                '</div>'+
            '</div>'+
            '<div>'+
                '<div style="font-weight: bold;">Available Statuses</div>'+
                '<div style="border: 1px solid #999999;border-radius: 10px; background-color: #ffeeee;">'+
                    _.map(_.difference(statuses,state.TokenNameNumber.config.dots),function(s){
                        return getStatusButton(s);
                    }).join('')+
                '</div>'+
            '</div>'+
        '</div>';
    },

    getAllConfigOptions = function() {
        return '<ul>'+_.map([
                getConfigOption_RandomSpace(),
                getConfigOption_UseDots(),
                getConfigOption_Dots()
            ], function(c){
                return '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+c+'</li>';
        }).join('')+'</ul>';
    },

    showHelp = function(who) {
        sendChat('','/w '+who+' '+
            '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                    'TokenNameNumber v'+version+
                '</div>'+
                '<div style="padding-left:10px;margin-bottom:3px;">'+
                    '<p>Provides automatic numbering of tokens dragged into onto the tabletop.  Token names need to have the special word <b>%%NUMBERED%%</b> somewhere in them.</p>'+
                '</div>'+
                '<b>Commands</b>'+
                '<div style="padding-left:10px;">'+
                    '<b><span style="font-family: serif;">!tnn [--help]</span></b>'+
                    '<div style="padding-left: 10px;padding-right:20px">'+
                        '<p>Currently, this just displays the help, which is used for configuring.</p>'+
                        '<ul>'+
                            '<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
                                '<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Displays the help and configuration options.'+
                            '</li> '+
                        '</ul>'+
                    '</div>'+
                '</div>'+
                '<b>Config</b>'+
                '<div>'+
                    getAllConfigOptions()+
                '</div>'+
            '</div>'
        );
    },

    handleInput = function(msg) {
        var args, who;

        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }
        who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!tnn':
                    showHelp(who);
                break;

            case '!tnn-config':
                if(_.contains(args,'help')) {
                    showHelp(who);
                    return;
                }
                if(!args.length) {
                    sendChat('','/w '+who+' '+
                        '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                            '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
                                'TokenNameNumber v'+version+
                            '</div>'+
                            getAllConfigOptions()+
                        '</div>'
                    );
                    return;
                }
                _.each(args,function(a){
                    var opt=a.split(/\|/);
                    switch(opt.shift()) {
                        case 'toggle-use-dots':
                            state.TokenNameNumber.config.useDots=!state.TokenNameNumber.config.useDots;
                            sendChat('','/w '+who+' '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_UseDots()+
                                '</div>'
                            );
                            break;

                        case 'toggle-dot':
                            if(_.contains(state.TokenNameNumber.config.dots, opt[0])){
                                state.TokenNameNumber.config.dots = _.without(state.TokenNameNumber.config.dots, opt[0]);
                            } else {
                                state.TokenNameNumber.config.dots.push(opt[0]);
                            }
                            sendChat('','/w '+who+' '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_Dots()+
                                '</div>'
                            );
                            break;


                        case 'random-space':
                           state.TokenNameNumber.config.randomSpace=parseInt(opt[0],10);
                            sendChat('','/w '+who+' '+
                                '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                                    getConfigOption_RandomSpace()+
                                '</div>'
                            );
                            break;

                        default:
                            sendChat('','/w '+who+' '+
                                '<div><b>Unsupported Option:</div> '+a+'</div>'
                            );
                    }
                            
                });

                break;
        }
    },



    getMatchers = function(pageid,represents) {
        var matchers = [];
        if(_.has(state.TokenNameNumber.registry, pageid) &&
            _.has(state.TokenNameNumber.registry[pageid],represents) ) {
                _.each(state.TokenNameNumber.registry[pageid][represents], function(regstr) {
                    matchers.push(new RegExp(regstr));
                });
            }
            return matchers;
    },
    addMatcher = function(pageid,represents,matcherRegExpStr) {
        if( ! _.has(state.TokenNameNumber.registry, pageid) ) {
            state.TokenNameNumber.registry[pageid] = {};
        }
        if( ! _.has(state.TokenNameNumber.registry[pageid],represents) ) {
            state.TokenNameNumber.registry[pageid][represents]=[matcherRegExpStr];
        } else {
            state.TokenNameNumber.registry[pageid][represents].push(matcherRegExpStr);
        }
    },

    getDotNumber = function(num) {
        var base = (function (b){
            var radix = b;
            return (b && function base_dot(number,digits){
                digits = digits || [];
                digits.push(number % radix);
                if(number < radix) {
                    return digits;
                }
                return base_dot(Math.floor(number/radix),digits);
            }) || function(){return [];};
        }(state.TokenNameNumber.config.dots.length));

        return base(num); 
    },

    saveTokenId = function(obj){
        tokenIds.push(obj.id);
        let token_id = obj.id;
        
        _.delay(()=>{
                var token=getObj('graphic',token_id);
                if(token){
                    setNumberOnToken(token);
                }
        },100);
        _.delay(()=>{
            tokenIds=_.without(tokenIds,token_id);
        },1000);
    },

    setNumberOnToken = function(obj) {
        var matchers,
        tokenName,
        matcher,
        renamer,
        parts,
        num,
        statuspart='';

        if(_.contains(tokenIds,obj.id)){

            if( 'graphic' === obj.get('type') &&
                'token'   === obj.get('subtype') ) {

                    matchers = (getMatchers(obj.get('pageid'), obj.get('represents'))) || [];
                    tokenName = (obj.get('name'));



                    if(tokenName.match( /%%NUMBERED%%/ ) || _.some(matchers,function(m) { return m.test(tokenName);}) ) {
                        tokenIds=_.without(tokenIds,obj.id);
                        if( 0 === matchers.length || !_.some(matchers,function(m) { return m.test(tokenName);}) ) {
                            matcher='^('+esRE(tokenName).replace(/%%NUMBERED%%/,')(\\d+)(')+')$';
                            addMatcher(obj.get('pageid'), obj.get('represents'), matcher );
                        }
                        if( !_.some(matchers,function(m) {
                            if(m.test(tokenName)) {
                                matcher=m;
                                return true;
                            }
                            return false;
                        }) ) {
                            matcher=new RegExp('^('+esRE(tokenName).replace(/%%NUMBERED%%/,')(\\d+)(')+')$');
                            renamer=new RegExp('^('+esRE(tokenName).replace(/%%NUMBERED%%/,')(%%NUMBERED%%)(')+')$');
                        }
                        renamer = renamer || matcher;

                        num = (_.chain(findObjs({
                            type: 'graphic',
                            subtype: 'token',
                            represents: obj.get('represents'),
                            pageid: obj.get('pageid')
                        }))
                        .filter(function(t){
                            return matcher.test(t.get('name'));
                        })
                        .reduce(function(memo,t){
                            var c=parseInt(matcher.exec(t.get('name'))[2],10);
                            return Math.max(memo,c);
                        },0)
                        .value() );

                        num += ( state.TokenNameNumber.config.randomSpace ? (randomInteger(state.TokenNameNumber.config.randomSpace)-1) : 0);

                        if(state.TokenNameNumber.config.useDots) {
                            statuspart = _.map(getDotNumber(num), function(n){
                                return state.TokenNameNumber.config.dots[n];
                            }).join(',');
                            if(statuspart) {
                                obj.set({
                                    statusmarkers: statuspart
                                });
                            }
                        }

                        parts=renamer.exec(tokenName);
                        obj.set({
                            name: parts[1]+(++num)+parts[3]
                        });
                    }
                }
        }
    },

    registerEventHandlers = function() {
        on('chat:message', handleInput);
        on('add:graphic', saveTokenId);
        on('change:graphic', setNumberOnToken);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
		NotifyOfCreatedToken: saveTokenId
    };
}());

on("ready",function(){
    'use strict';

    TokenNameNumber.CheckInstall(); 
    TokenNameNumber.RegisterEventHandlers();
});

