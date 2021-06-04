// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenMod/TokenMod.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TokenMod = TokenMod || (function() {
    'use strict';

    var version = '0.8.22',
        lastUpdate = 1478725753,
        schemaVersion = 0.3,

        observers = {
                tokenChange: []
    		},

        fields = {
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

			// bounded by screen size
			left: {type: 'number', transform: 'screen'},
			top: {type: 'number', transform: 'screen'},
			width: {type: 'number', transform: 'screen'},
			height: {type: 'number', transform: 'screen'},

			// 360 degrees
			rotation: {type: 'degrees'},
			light_angle: {type: 'circleSegment'},
			light_losangle: {type: 'circleSegment'},

			// distance
			light_radius: {type: 'numberBlank'},
			light_dimradius: {type: 'numberBlank'},
			light_multiplier: {type: 'numberBlank'},
			aura1_radius: {type: 'numberBlank'},
			aura2_radius: {type: 'numberBlank'},

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
            imgsrc: {type: 'image'},
			controlledby: {type: 'player'}
		},

		regex = {
			numberString: /^[+\-]?(0|[1-9][0-9]*)([.]+[0-9]*)?([eE][+\-]?[0-9]+)?$/,
			stripSingleQuotes: /'([^']+(?='))'/g,
			stripDoubleQuotes: /"([^"]+(?="))"/g,
			layers: /^(?:gmlayer|objects|map|walls)$/,
			statuses: /^(?:red|blue|green|brown|purple|pink|yellow|dead|skull|sleepy|half-heart|half-haze|interdiction|snail|lightning-helix|spanner|chained-heart|chemical-bolt|death-zone|drink-me|edge-crack|ninja-mask|stopwatch|fishing-net|overdrive|strong|fist|padlock|three-leaves|fluffy-wing|pummeled|tread|arrowed|aura|back-pain|black-flag|bleeding-eye|bolt-shield|broken-heart|cobweb|broken-shield|flying-flag|radioactive|trophy|broken-skull|frozen-orb|rolling-bomb|white-tower|grab|screaming|grenade|sentry-gun|all-for-one|angel-outfit|archery-target)$/,
			colors: /^(transparent|(?:#?[0-9a-fA-F]{6}))$/,
            imgsrc: /(.*\/images\/.*)(thumb|med|original|max)(.*)$/
		},
		filters = {
			hasArgument: function(a) {
				return a.match(/.+[\|#]/);
			},
			isBoolean: function(a) {
				return _.has(fields,a) && 'boolean' === fields[a].type;
			},
			isTruthyArgument: function(a) {
					return _.contains([1,'1','on','yes','true','sure','yup'],a);
			}
		},
		transforms = {
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
		},

    checkGlobalConfig = function(){
        var s=state.TokenMod,
            g=globalconfig && globalconfig.tokenmod,
            parsedDots;
        if(g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved
        ){
          log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');

          s.playersCanUse_ids = 'playersCanIDs' === g['Players can use --ids'];
          state.TokenMod.globalconfigCache=globalconfig.tokenmod;
        }
    },

	checkInstall = function() {
		log('-=> TokenMod v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

		if( ! _.has(state,'TokenMod') || state.TokenMod.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.TokenMod && state.TokenMod.version) {

                /* falls through */
                case 0.1: 
                case 0.2: 
				  delete state.TokenMod.globalConfigCache;
                  state.TokenMod.globalconfigCache = {lastsaved:0};

                /* falls through */
                case 'UpdateSchemaVersion':
                    state.TokenMod.version = schemaVersion;
                    break;

                default:
                    state.TokenMod = {
                        version: schemaVersion,
                        globalconfigCache: {lastsaved:0},
                        playersCanUse_ids: false
                    };
                    break;
            }
		}
        checkGlobalConfig();
	},

    observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    },
    notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
            handler(obj,prev);
        });
    },

    getPlayerIDs = (function(){
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
            return _.reduce(cache,(m,p)=>{
                if(p.id===data || p.userid===data || (-1 !== p.keyHash.indexOf(transforms.keyHash(data)))){
                    m.push(p.id);
                }
                return m;
            },[]);
        };

        return function(datum){
            return 'all'===datum ? ['all'] : findPlayer(datum);
        };
    }()),

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

    getConfigOption_PlayersCanIDs = function() {
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
        
    },


	showHelp = function(id) {
		var who=getObj('player',id).get('_displayname');
		sendChat('', '/w "'+who+'" '+
'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
	'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'+
		'TokenMod v'+version+
	'</div>'+
	'<div style="padding-left:10px;margin-bottom:3px;">'+
		'<p>TokenMod provides an interface to setting almost all settable properties of a token.</p>'+
	'</div>'+
	'<b>Commands</b>'+
	'<div style="padding-left:10px;">'+
		'<b><span style="font-family: serif;">!token-mod '+ch('<')+'<i>--help</i>|<i>--ignore-selected</i>|<i>--config</i>|<i>--on</i>|<i>--off</i>|<i>--flip</i>|<i>--set</i>'+ch('>')+' '+ch('<')+'parameter'+ch('>')+' '+ch('[')+ch('<')+'parameter'+ch('>')+' ...'+ch(']')+' ... '+ch('[')+'<i>--ids</i> '+ch('<')+'token_id'+ch('>')+' '+ch('[')+ch('<')+'token_id'+ch('>')+' ...'+ch(']')+ch(']')+'</span></b>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p>This command takes a list of modifications and applies them to the selected tokens (or tokens specified with --ids by a GM or Player depending on configuration).  Note that each --option can be specified multiple times and in any order.</p>'+
			'<p><b>Note:</b> If you are using multiple '+ch('@')+ch('{')+'target'+ch('|')+'token_id'+ch('}')+' calls in a macro, and need to adjust fewer than the supplied number of token ids, simply select the same token several times.  The duplicates will be removed.</p>'+
			'<p><b>Note:</b> Anywhere you use |, you can use # instead.  Sometimes this make macros easier.</p>'+
			'<p><b>Note:</b> You can use the {{ and }} to span multiple lines with your command for easier clarity and editing:'+
			'<div style="padding-left: 10px;padding-right:20px">'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod {{<br>'+
				ch(' ')+ch(' ')+'--on<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'flipv<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'fliph<br>'+
				ch(' ')+ch(' ')+'--set<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'rotation|180<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'bar1|'+ch('[')+ch('[')+'8d8+8'+ch(']')+ch(']')+'<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'light_radius|60<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'light_dimradius|30<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'name|"My bright token"<br>'+
				'}}<br>'+
			'</pre></div></p>'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--help'+ch('>')+'</span></b> '+ch('-')+' Displays this help.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--ignore-selected'+ch('>')+'</span></b> '+ch('-')+' Prevents modifications to the selected tokens (only modifies tokens passed with --ids).'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--config'+ch('>')+'</span></b> '+ch('-')+' Sets Config options. '+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--on'+ch('>')+'</span></b> '+ch('-')+' Turns on any of the specified parameters (See <b>Booleans</b> below).'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--off'+ch('>')+'</span></b> '+ch('-')+' Turns off any of the specified parameters (See <b>Booleans</b> below).'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--flip'+ch('>')+'</span></b> '+ch('-')+' Flips the value of any of the specified parameters (See <b>Booleans</b> below).'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--set'+ch('>')+'</span></b> '+ch('-')+' Each parameter is treated as a key and value, divided by a | character.  Sets the key to the value.  If the value has spaces, you must enclose it '+ch("'")+' or '+ch('quot')+'.  See below for specific value handling logic.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--order'+ch('>')+'</span></b> '+ch('-')+' changes the ordering of tokens.  Specify one of '+ch("'")+'tofront'+ch("'")+', '+ch("'")+'front'+ch("'")+', '+ch("'")+'f'+ch("'")+', '+ch("'")+'top'+ch("'")+' to bring something to the front or '+ch("'")+'toback'+ch("'")+', '+ch("'")+'back'+ch("'")+', '+ch("'")+'b'+ch("'")+', '+ch("'")+'bottom'+ch("'")+' to push it to the back.'+
				'</li> '+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<b><span style="font-family: serif;">'+ch('<')+'--ids'+ch('>')+'</span></b> '+ch('-')+' Each parameter is a Token ID, usually supplied with something like '+ch('@')+ch('{')+'target'+ch('|')+'Target 1'+ch('|')+'token_id'+ch('}')+'. '+
					'By default, only a GM can use this argument.  You can enable players to use it as well with <b>--config players-can-ids|on</b>.'+
				'</li> '+
			'</ul>'+
		'</div>'+
	'</div>'+

	'<b>Specification</b>'+
	'<div style="padding-left:10px;">'+
		'<p><i>--ids</i> takes token ids to operate on, separated by spaces.</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --ids -Jbz-mlHr1UXlfWnGaLh -JbjeTZycgyo0JqtFj-r -JbjYq5lqfXyPE89CJVs --on showname showplayers_name'+
			'</pre>'+
		'<p>Usually, you will want to specify these with the '+ch('@')+ch('{')+'target'+ch('}')+' syntax:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --ids '+ch('@')+ch('{')+'target|1|token_id'+ch('}')+' '+ch('@')+ch('{')+'target|2|token_id'+ch('}')+' '+ch('@')+ch('{')+'target|3|token_id'+ch('}')+' --on showname showplayers_name'+
			'</pre>'+
	'</div>'+

	'<b>Booleans</b>'+
	'<div style="padding-left:10px;">'+
		'<p>The <i>--on</i>, <i>--off</i> and <i>--flip</i> options only work on properties of a token that are either true or false, checkboxes.  Specified properties will only be changed once, priority is given to arguments to <i>--on</i> first, then <i>--off</i> and finally to <i>--flip</i>.</p>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --on showname light_hassight --off isdrawing --flip flipv fliph'+
			'</pre>'+
		'</div>'+
		'<div style="padding-left: 10px;padding-right:20px">'+
			'<p><u>Available Boolean Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showname</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showplayers_name</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showplayers_bar1</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showplayers_bar2</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showplayers_bar3</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showplayers_aura1</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">showplayers_aura2</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">playersedit_name</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">playersedit_bar1</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">playersedit_bar2</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">playersedit_bar3</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">playersedit_aura1</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">playersedit_aura2</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_otherplayers</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_hassight</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">isdrawing</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">flipv</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fliph</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura1_square</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura2_square</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Any of the booleans can be set with the <i>--set</i> command by passing a true or false as the value</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set showname|yes isdrawing|no'+
				'</pre>'+
			'</div>'+
		'</div>'+
	'</div>'+

	'<b>Set Syntax Guide</b>'+
	'<div style="padding-left:10px;">'+
		'<p><i>--set</i> takes key value pairs, separated by | characters.</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --set key|value key|value key|value'+
			'</pre>'+

		'<p><b>Note:</b> You can now use inline rolls wherever you like, including rollable tables:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --set bar'+ch('[')+ch('[')+'1d3'+ch(']')+ch(']')+'_value|X statusmarkers|blue:'+ch('[')+ch('[')+'1d9'+ch(']')+ch(']')+'|green:'+ch('[')+ch('[')+'1d9'+ch(']')+ch(']')+' name:'+ch('"')+ch('[')+ch('[')+'1'+ch('[')+'randomName'+ch(']')+ch(']')+ch(']')+

			'</pre>'+

		'<p><b>Note:</b> You can now use + or - before any number to make an adjustment to the current value:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --set bar1_value|-3 statusmarkers|blue:+1|green:-1'+
			'</pre>'+

		'<p><b>Note:</b> You can now preface a + or - with a = to explicitly set the number to a negative or positive value:</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --set bar1_value|=+3 light_radius|=-10'+
			'</pre>'+

		'<p>There are several types of keys with special value formats:</p>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Numbers</b>'+
			'<p>Number values can be any floating point number (though most fields will drop the fractional part).</p>'+
			'<p><u>Available Numbers Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">left</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">top</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">width</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">height</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>It'+ch("'")+'s probably a good idea not to set the location of a token off screen or the width or height to 0.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set top|0 left|0 width|50 height|50'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Numbers or Blank</b>'+
			'<p>Just like the Numbers fields, except you can set them to blank as well.</p>'+
			'<p><u>Available Numbers or Blank Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_radius</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_dimradius</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_multiplier</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura1_radius</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura2_radius</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Here is setting a standard DnD 5e torch, turning off aura1 and setting aura2 to 30. Note that the | is still required for setting a blank value, such as aura1_radius below.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set light_radius|40 light_dimradius|20 aura1_radius| aura2_radius|30'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Degrees</b>'+
			'<p>Any positive or negative number.</p>'+
			'<p><u>Available Degrees Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">rotation</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Rotating a token by 180 degrees.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set rotation|180'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Circle Segment</b>'+
			'<p>Any positive or negative number between 0 and 360.</p>'+
			'<p><u>Available Circle Segment Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_angle</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">light_losangle</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Setting line of sight angle to 90 degrees.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set light_losangle|90'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Color</b>'+
			'<p>Colors can be any hex number color (with or without preceding #), or the word transparent.</p>'+
			'<p><u>Available Color Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">tint_color</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura1_color</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura2_color</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Turning off the tint and setting aura1 to a reddish color.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set tint_color|transparent aura1_color|ff3366'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Text</b>'+
			'<p>These can be pretty much anything.  If your value has spaces in it, you need to enclose it in '+ch("'")+' or '+ch('"')+'.</p>'+
			'<p><u>Available Text Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">name</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar1_value</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar2_value</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar3_value</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar1_max</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar2_max</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar3_max</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar1</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar2</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar3</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar1_reset</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar2_reset</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar3_reset</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Setting the name to Sir Thomas and bar1 to 23.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set name|'+ch('"')+'Sir Thomas'+ch('"')+' bar1_value|23'+
				'</pre>'+
			'</div>'+
			'<p><i>bar1</i>, <i>bar2</i> and <i>bar3</i> are special.  Any value set on them will be set in both the <i>_value</i> and <i>_max</i> fields for that bar.  This is most useful for setting hit points.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set bar1|'+ch('[')+ch('[')+'3d6+8'+ch(']')+ch(']')+
				'</pre>'+
			'</div>'+
			'<p><i>bar1_reset</i>, <i>bar2_reset</i> and <i>bar3_reset</i> are special.  Any value set on them will be ignored, instead they well set the <i>_value</i> field for that bar to whatever the matching <i>_max</i> field is set to.  This is most useful for resetting hit points or resource counts like spells. (The | is currently still required.)</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set bar1_reset| bar3_reset|'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Layer</b>'+
			'<p>There is only one Layer property.  It can be one of 4 values, listed below.</p>'+
			'<p><u>Available Layer Property:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">layer</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p><u>Available Layer Values:</u></p>'+

			'<div style="width: 130px; padding: 0px 3px;float: left;">gmlayer</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">objects</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">map</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">walls</div>'+

			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Moving something to the gmlayer.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set layer|gmlayer'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Status</b>'+
			'<p>There is only one Status property.  Status has a somewhat complicated syntax to support the most possible flexibility.</p>'+
			'<p><u>Available Status Property:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">statusmarkers</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+

			'<p>Status is the only property that supports multiple values, all separated by | as seen below. </p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|blue|red|green|padlock|broken-shield'+
				'</pre>'+
			'</div>'+

			'<p>You can optionally preface each status with a + to remind you it is being added.  This command is identical:</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|+blue|+red|+green|+padlock|+broken-shield'+
				'</pre>'+
			'</div>'+

			'<p>Each value can be followed by a colon and a number between 0 and 9.  (The number following the dead status is ignored because it is special.)</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|blue:0|red:3|green|padlock:2|broken-shield:7'+
				'</pre>'+
			'</div>'+

			'<p>The numbers following a status can be prefaced with a + or -, which causes their value to be applied to the current value. Here'+ch("'")+'s an example showing blue getting incremented by 2, and padlock getting decremented by 1.  Values will be bounded between 0 and 9.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|blue:+2|padlock:-1'+
				'</pre>'+
			'</div>'+

			'<p>You can optionally preface each status with a ? to modify the way + and - on status numbers work.  With ? on the front of the status, only selected tokens that have that status will be modified.  Additionally, if the status reaches 0, it will be removed.  Here'+ch("'")+'s an example showing blue getting decremented by 1.  If it reaches 0, it will be removed and no status will be added if it is missing.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|?blue:-1'+
				'</pre>'+
			'</div>'+

			'<p>By default, status markers will be added, retaining whichever status markers are already present.  You can override this behavior by prefacing a value with a - to cause the status to be removed.  Below will remove the blue and padlock status.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|-blue|-padlock'+
				'</pre>'+
			'</div>'+

			'<p>Sometimes it is convenient to have a way to add a status if it is not there, but remove it if it is.  This allows marking tokens with markers and clearing them with the same command.  You can preface a status with ! to toggle it'+ch("'")+'s state on and off.  Here is an example that will add or remove the Rook piece from a token.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|!white-tower'+
				'</pre>'+
			'</div>'+

			'<p>Sometimes, you might want to clear all status marker as part of setting a new status marker.  You can do this by prefacing a status marker with a =.  Note that this affects all status markers before as well, so you will want to do this only on the first status marker.  Below all status markers are removed and the dead marker is set.  (If you want to remove all status markers, just specify the same marker twice with a = and then a -.)</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|=dead'+
				'</pre>'+
			'</div>'+

			'<p>You can set multiple of the same status marker with a bracket syntax. Copies of a status are indexed starting at 1 from left to right. Leaving brackets off will be the same as specifying index 1. Using empty brackets is the same as specifying an index 1 greater than the highest index in use. When setting a status at an index that doesn'+ch("'")+'t exist (say, 8 when you only have 2 of that status) it will be appended to the right as the next index. When removing a status that doesn'+ch("'")+'t exist, it will be ignored. Removing the empty bracket status will remove all statues of that type.</p>'+
			'<p>Adding the blue status marker with the numbers 7 and 5 in a few different ways:</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|blue:7|blue[]:5<br>'+
					'!token-mod --set statusmarkers|blue[]:7|blue[]:5<br>'+
					'!token-mod --set statusmarkers|blue[1]:7|blue[2]:5<br>'+
				'</pre>'+
			'</div>'+

			'<p>Removing the second blue status marker:</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|-blue[2]'+
				'</pre>'+
			'</div>'+


			'<p>Removing all blue status markers:</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|-blue[]'+
				'</pre>'+
			'</div>'+

			'<p><u>Available Status Markers:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">red</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">blue</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">green</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">brown</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">purple</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">pink</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">yellow</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">dead</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">skull</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">sleepy</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">half-heart</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">half-haze</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">interdiction</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">snail</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">lightning-helix</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">spanner</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">chained-heart</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">chemical-bolt</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">death-zone</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">drink-me</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">edge-crack</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">ninja-mask</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">stopwatch</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fishing-net</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">overdrive</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">strong</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fist</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">padlock</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">three-leaves</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">fluffy-wing</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">pummeled</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">tread</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">arrowed</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">aura</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">back-pain</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">black-flag</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bleeding-eye</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bolt-shield</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">broken-heart</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">cobweb</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">broken-shield</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">flying-flag</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">radioactive</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">trophy</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">broken-skull</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">frozen-orb</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">rolling-bomb</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">white-tower</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">grab</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">screaming</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">grenade</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">sentry-gun</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">all-for-one</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">angel-outfit</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">archery-target</div>'+

			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>All of these operations can be combine in a single statusmarkers command.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set statusmarkers|blue:3|-dead|red:3'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Image</b>'+
			'<p>You can provide an image to use for the token source image. Images must be in a user library or will be ignored. The full path must be provided.</p>'+

			'<p><u>Available Image Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">imagesrc</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Setting the image source to a library image (in this case, the orange ring I use for <i>TurnMarker</i>):</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set imgsrc|https://s3.amazonaws.com/files.d20.io/images/4095816/086YSl3v0Kz3SlDAu245Vg/max.png?1400535580'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Character ID</b>'+
			'<p>You can use the '+ch('@')+ch('{')+ch('<')+'character name'+ch('>')+ch('|')+'character_id'+ch('}')+' syntax to specify a character_id directly or use the name of a character (quoted if it contains spaces) or just the shortest part of the name that is unique ('+ch("'")+'Sir Maximus Strongbow'+ch("'")+' could just be '+ch("'")+'max'+ch("'")+'.).  Not case sensitive: Max = max = MaX = MAX</p>'+
			'<p><u>Available Character ID Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">represents</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Here is setting the represents to the character Bob.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set represents|'+ch('@')+ch('{')+'Bob'+ch('|')+'character_id'+ch('}')+
				'</pre>'+
			'</div>'+
			'<p>Note that setting the represents will clear the links for the bars, so you will probably want to set those again.</p>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Player</b>'+
			'<p>You can specify Players using one of three methods: Player ID, Roll20 ID Number, Player Name Matching</p>'+
			'<ul>'+
				'<li>Player ID is a unique identifier assigned that player in a specific game.  You can only find this id from the API, so this is likely the least useful method.</li>'+
				'<li>Roll20 ID Number is a unique identifier assigned to a specific player.  You can find it in the URL of their profile page as the number preceeding their name.  This is really useful if you play with the same people all the time, or are cloning the same game with the same players, etc.</li>'+
				'<li>Player Name Matching is a string that will be matched to the current name of the player in game.  Just like with Characters above, it can be quoted if it has spaces and is case insensitive.  All players that match a given string will be used.</li>'+
			'</ul>'+
			'<p>Note that you can use the special string all to denote the All Players special player.</p>'+

			'<p><u>Available Player Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">controlledby</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+

			'<p>Controlled by supports multiple values, all separated by | as seen below.</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|aaron|+stephen|+russ'+
				'</pre>'+
			'</div>'+

			'<p>There are 3 operations that can be specified with leading characters: +,-, = (default)</p>'+
			'<ul>'+
				'<li>+ will add the player(s) to the controlledby list.</li>'+
				'<li>- will remove the player(s) from the controlledby list.</li>'+
				'<li>= will set the controlledby list to only the player(s).  (Default)</li>'+
			'</ul>'+

			'<p>Adding control for roll20 player number 123456:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|+123456'+
				'</pre>'+
			'</div>'+

			'<p>Setting control for all players:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|all'+
				'</pre>'+
			'</div>'+

			'<p>Adding all the players with k in their name but removing karen:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|+k|-karen'+
				'</pre>'+
			'</div>'+

			'<p>Adding the player with player id -JsABCabc123-12:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|+-JsABCabc123-12'+
				'</pre>'+
			'</div>'+

			'<p>In the case of a leading character on the name that would be interpreted as an operation, you can use quotes:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|"-JsABCabc123-12"'+
				'</pre>'+
			'</div>'+

			'<p>Quotes will also help with names that have spaces, or with nested other quotes:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|+'+ch("'")+'Bob "tiny" Slayer'+ch("'")+
				'</pre>'+
			'</div>'+

			'<p>You can remove all controlling players by using a blank list or explicitly setting equal to nothing:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|<br>'+
					'!token-mod --set controlledby|='+
				'</pre>'+
			'</div>'+

			'<p>A specified action that doesn'+ch("'")+'t match any player(s) will be ignored.  If there are no players named Tim, this won'+ch("'")+'t change the list:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby|tim'+
				'</pre>'+
			'</div>'+

			'<p>If you wanted to force an empty list and set tim if tim is available, you can chain this with blanking the list:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set controlledby||tim'+
				'</pre>'+
			'</div>'+

			'<p><u>Using controlledby with represents</u></p>'+

			'<p>When a token represents a character, the controlledby property that is adjusted is the one on the character. This works as you would want it to,so if you are changing the represents as part of the same command, it will adjust the location that will be correct after all commands are run.</p>'+

			'<p>Set the token to represent the character with rook in the name and assign control to players matching bob:</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set represents|rook controlledby|bob'+
				'</pre>'+
			'</div>'+

			'<p>Remove the represent setting for the token and then give bob controll of that token (useful for one-offs from npcs or monsters):</p>'+

			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set represents| controlledby|bob'+
				'</pre>'+
			'</div>'+
		'</div>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<b>Attribute Name</b>'+
			'<p>These are resolved from the represented character id.  If the token doesn'+ch("'")+'t represent a character, these will be ignored.  If the Attribute Name specified doesn'+ch("'")+'t exist for the represented character, the link is unchanged. You can clear a link by passing a blank Attribute Name.</p>'+
			'<p><u>Available Attribute Name Properties:</u></p>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar1_link</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar2_link</div>'+
			'<div style="width: 130px; padding: 0px 3px;float: left;">bar3_link</div>'+
			'<div style="clear:both;">'+ch(' ')+'</div>'+
			'<p>Here is setting the represents to the character Bob and setting bar1 to be the npc hit points attribute.</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set represents|'+ch('@')+ch('{')+'Bob'+ch('|')+'character_id'+ch('}')+' bar1_link|npc_HP'+
				'</pre>'+
			'</div>'+
			'<p>Here is clearing the link for bar3:</p>'+
			'<div style="padding-left: 10px;padding-right:20px">'+
				'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
					'!token-mod --set bar3_link|'+
				'</pre>'+
			'</div>'+
		'</div>'+

	'<b>Configuration</b>'+
	'<div style="padding-left:10px;">'+
		'<p><i>--config</i> takes option value pairs, separated by | characters.</p>'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'!token-mod --config option|value option|value'+
			'</pre>'+
		'<p>There is currently one configuration option:</p>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<ul>'+
				'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'+
					'<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+
						( state.TokenMod.playersCanUse_ids ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+
					'</div>' +'<b><span style="font-family: serif;">players-can-ids</span></b> '+ch('-')+' Determines if players can use <i>--ids</i>.  Specifying a value which is true allows players to use --ids.  Omitting a value flips the current setting.' +'</li> '+
			'</ul>'+
		'</div>'+
        getConfigOption_PlayersCanIDs()+
	'</div>'+

	'<b>API Notifications</b>'+
	'<div style="padding-left:10px;">'+
		'<p>API Scripts can register for the following notifications:</p>'+
		'<p><b>Token Changes</b> -- Register your function by passing it to <span style="font:monospace">TokenMod.ObserveTokenChange()</span>.  When TokenMod changes a token, it will call your function with the Token as the first argument and the previous properties as the second argument.</p>'+

		'<p>Example script that notifies when a token'+ch("'")+'s status markers are changed by TokenMod:</p>'+

		'<div style="padding-left: 10px;padding-right:20px">'+
			'<pre style="white-space:normal;word-break:normal;word-wrap:normal;">'+
				'on('+ch("'")+'ready'+ch("'")+',function(){<br>'+
				ch(' ')+ch(' ')+'if('+ch("'")+'undefined'+ch("'")+' !== typeof TokenMod && TokenMod.ObserveTokenChange){<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'TokenMod.ObserveTokenChange(function(obj,prev){<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+'if(obj.get('+ch("'")+'statusmarkers'+ch("'")+') !== prev.statusmarkers){<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+'sendChat('+ch("'")+'Observer Token Change'+ch("'")+','+ch("'")+'Token: '+ch("'")+'+obj.get('+ch("'")+'name'+ch("'")+')+'+ch("'")+' has changed status markers!'+ch("'")+');<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+ch(' ')+'}<br>'+
				ch(' ')+ch(' ')+ch(' ')+ch(' ')+'});<br>'+
				ch(' ')+ch(' ')+'}<br>'+
				'});'+
			'</pre>'+
		'</div>'+
	'</div>'+

'</div>'
			);
	},


	getRelativeChange = function(current,update) {
		var cnum,unum;

        if( update && _.has(update,0) && ('=' === update[0]) ){
            return parseFloat(_.rest(update).join(''));
        }
        
        cnum = current && (_.isNumber(current) ?
            current :
            ( _.isString(current) ?
                (current.match(regex.numberString) ? parseFloat(current,10) : NaN) :
                NaN)
            );
        unum = update && (_.isNumber(update) ?
            update :
            ( _.isString(update) ?
                (update.match(regex.numberString) ? parseFloat(update,10) : NaN) :
                NaN)
            );

		if(!_.isNaN(unum) && !_.isUndefined(unum) ) {
			if(!_.isNaN(cnum) && !_.isUndefined(cnum) ) {
				switch(update[0]) {
					case '+':
					case '-':
						return cnum+unum;

					default:
						return unum;
				}
			} else {
				return unum;
			}
		}
		return update;
	},
	parseArguments = function(a) {
		var args=a.split(/[\|#]/),
			cmd=args.shift(),
			retr={},
			t,t2;

		if(_.has(fields,cmd)) {
			retr[cmd]=[];
			switch(fields[cmd].type) {
				case 'boolean':
					retr[cmd].push(filters.isTruthyArgument(args.shift()));
					break;

				case 'text':
					retr[cmd].push(args.shift().replace(regex.stripSingleQuotes,'$1').replace(regex.stripDoubleQuotes,'$1'));
					break;

				case 'numberBlank':
                    if( '=' === args[0][0] ) {
                        t='=';
                        args[0]=_.rest(args[0]).join('');
                    } else {
                        t='';
                    }
                    t2=args[0].match(regex.numberString) ? args[0] : '' ;
					if( ''===t2 || !_.isNaN(parseFloat(t2)) ) {
						retr[cmd].push(t+t2);
					}
					break;

				case 'number':
                    if( '=' === args[0][0] ) {
                        t='=';
                        args[0]=_.rest(args[0]).join('');
                    } else {
                        t='';
                    }
					t2=args[0].match(regex.numberString) ? args[0] : undefined ;
					if(!_.isNaN(parseFloat(t2)) ) {
						retr[cmd].push(t+t2);
					}
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

				case 'image':
                    t=args.shift().match(regex.imgsrc);
                    if(t){
                        retr[cmd].push(t[1]+'thumb'+t[3]);
                    } else {
                        retr = undefined;
                    }
					break;

				case 'color':
					retr[cmd].push((args.shift().match(regex.colors)||[]).shift());
					if(0 === (retr[cmd][0]||'').length) {
						retr = undefined;
					} else if('transparent' !== retr[cmd][0] && '#' !== retr[cmd][0].substr(0,1) ) {
						retr[cmd][0]='#'+retr[cmd][0];
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
                        let parts = p.match(/^([\+-=]?)(.*)$/),
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
						var s = a.split(/:/),
							statparts = s.shift().match(/^(\S+?)(\[(\d*)\]|)$/)||[],
                            index = ( '[]' === statparts[2] ? statparts[2] : ( undefined !== statparts[3] ? Math.max(parseInt(statparts[3],10)-1,0) : 0 ) ),
                            stat=statparts[1]||'',
							op = (_.contains(['-','+','=','!','?'],stat[0]) ? stat[0] : false),
							numraw = s.shift() || '',
							numop = (_.contains(['-','+'],numraw[0]) ? numraw[0] : false),
							num = Math.max(0,Math.min(9,Math.abs(parseInt(numraw,10)))) || 0;

						stat = ( op ? stat.substring(1) : stat);

						if(stat.match(regex.statuses)) {
							retr[cmd].push({
								status: stat,
								number: num,
                                index: index,
								sign: numop,
								operation: op || '+'
							});
						}
					});
					break;

				default:
					retr=undefined;
					break;
			}
		}

		return retr;
	},
	expandMetaArguments = function(memo,a) {
		var args=a.split(/[\|#]/),
			cmd=args.shift();
		switch(cmd) {
			case 'bar1':
			case 'bar2':
			case 'bar3':
				args=args.join('|');
				memo.push(cmd+'_value|'+args);
				memo.push(cmd+'_max|'+args);
				break;
			default:
				memo.push(a);
				break;
		}
		return memo;
	},

    parseOrderArguments = function(list,base) {
        return _.chain(list)
            .map(transforms.orderType)
            .reject(_.isUndefined)
            .union(base)
            .value();
    },

	parseSetArguments = function(list,base) {
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
	},
    
    decomposeStatuses = function(statuses){
        return _.reduce(statuses.split(/,/).reverse(),function(memo,st,idx){
            var parts=st.split(/@/),
            entry = {
                mark: parts[0],
                num: parseInt(parts[1],10) || 0,
                idx: idx
            };
            if(parts[0].length) {
                memo[parts[0]] = ( memo[parts[0]] && memo[parts[0]].push(entry) && memo[parts[0]]) || [entry] ;
            }
            return memo;
        },{});
    },

    composeStatuses = function(statuses){
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
            .map(function(s){
                return ('dead'===s.mark ? 'dead' : ( s.mark+(s.num>0 ? '@'+s.num : '')));
            })
            .value()
            .reverse()
            .join(',');
    },    
    
	applyModListToToken = function(modlist, token) {
		var mods={},
			delta, cid,prev,
            repChar, 
            controlList = (modlist.set && modlist.set.controlledby) ? (function(){
                let list;
                repChar = getObj('character', modlist.set.represents || token.get('represents'));
                
                list = (repChar ? repChar.get('controlledby') : token.get('controlledby'));
                return (list ? list.split(/,/) : []);
            }()) : [],
			current=decomposeStatuses(token.get('statusmarkers')||''),
            statusCount=(token.get('statusmarkers')||'').split(/,/).length;

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
				case 'statusmarkers':
					_.each(f, function (sm){
						switch(sm.operation){
							case '!':
								if('[]' !== sm.index && _.has(current,sm.status) ){
                                    if( _.has(current[sm.status],sm.index) ) {
                                        current[sm.status]= _.filter(current[sm.status],function(e,idx){
                                            return idx !== sm.index;
                                        });
                                    }
								} else {
                                    current[sm.status] = current[sm.status] || [];
									current[sm.status].push({
                                        mark: sm.status,
                                        num: Math.max(0,Math.min(9,getRelativeChange(0, sm.sign+sm.number))),
                                        index: statusCount++
                                    });
								}
								break;
							case '?':
								if('[]' !== sm.index && _.has(current,sm.status) && _.has(current[sm.status],sm.index)){
                                    current[sm.status][sm.index].num = (Math.max(0,Math.min(9,getRelativeChange(current[sm.status][sm.index].num, sm.sign+sm.number))));
                                    if(0 === current[sm.status][sm.index].num) {
                                        current[sm.status]= _.filter(current[sm.status],function(e,idx){
                                            return idx !== sm.index;
                                        });
                                    }
                                } 
                                break;
							case '+':
								if('[]' !== sm.index && _.has(current,sm.status) && _.has(current[sm.status],sm.index)){
                                    current[sm.status][sm.index].num = (Math.max(0,Math.min(9,getRelativeChange(current[sm.status][sm.index].num, sm.sign+sm.number))));
                                } else {
                                    current[sm.status] = current[sm.status] || [];
									current[sm.status].push({
                                        mark: sm.status,
                                        num: Math.max(0,Math.min(9,getRelativeChange(0, sm.sign+sm.number))),
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
									current[sm.status]= _.first(current[sm.status],-1);
                                }
								break;
							case '=':
								current = {};
                                current[sm.status] = [];
                                current[sm.status].push({
                                    mark: sm.status,
                                    num: Math.max(0,Math.min(9,getRelativeChange(0, sm.sign+sm.number))),
                                    index: statusCount++
                                });
								break;
						}
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
                            delta=findObjs({type: 'attribute', characterid: cid, name: f[0]})[0];
                            if(delta) {
                                mods[k]=delta.id;
                                mods[k.split(/_/)[0]+'_value']=delta.get('current');
                                mods[k.split(/_/)[0]+'_max']=delta.get('max');
                            }
                        }
                    }
					break;

				case 'left':
				case 'top':
				case 'width':
				case 'height':
					delta=getRelativeChange(token.get(k),f[0]);
					if(_.isNumber(delta)) {
						mods[k]=delta;
					}
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
					delta=getRelativeChange(token.get(k),f[0]);
					if(_.isNumber(delta) || '' === delta) {
						mods[k]=delta;
					}
					break;

				case 'bar1_reset':
				case 'bar2_reset':
				case 'bar3_reset':
                    delta = token.get(k.replace(/_reset$/,'_max'));
                    if(!_.isUndefined(delta)) {
                        mods[k.replace(/_reset$/,'_value')]=delta;
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
				default:
					mods[k]=f[0];
					break;
			}
		});
		mods.statusmarkers=composeStatuses(current);
        prev=JSON.parse(JSON.stringify(token));
		token.set(mods);
        notifyObservers('tokenChange',token,prev);
	},


	handleConfig = function(config, id) {
		var args, cmd, who=getObj('player',id).get('_displayname');

        if(config.length) {
            while(config.length) {
                args=config.shift().split(/[\|#]/);
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
	},

	 handleInput = function(msg_orig) {
		var msg = _.clone(msg_orig),
			args, cmds, ids=[],
            ignoreSelected = false,
			modlist={
				flip: [],
				on: [],
				off: [],
				set: {},
                order: []
			};

		if (msg.type !== "api") {
			return;
		}

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
			case '!token-mod':

				while(args.length) {
					cmds=args.shift().match(/([^\s]+[\|#]'[^']+'|[^\s]+[\|#]"[^"]+"|[^\s]+)/g);
					switch(cmds.shift()) {
						case 'help':
							showHelp(msg.playerid);
							return;

						case 'config':
							if(playerIsGM(msg.playerid)) {
								handleConfig(cmds,msg.playerid);
							}
							return;

						case 'flip':
							modlist.flip=_.union(_.filter(cmds,filters.isBoolean),modlist.flip);
							break;

						case 'on':
							modlist.on=_.union(_.filter(cmds,filters.isBoolean),modlist.on);
							break;

						case 'off':
							modlist.off=_.union(_.filter(cmds,filters.isBoolean),modlist.off);
							break;

						case 'set':
							modlist.set=parseSetArguments(cmds,modlist.set);
							break;

                        case 'order':
                            modlist.order=parseOrderArguments(cmds,modlist.order);
                            break;

                        case 'ignore-selected':
                            ignoreSelected=true;
                            break;

						case 'ids':
							ids=_.union(cmds,ids);
							break;
					}
				}
				modlist.off=_.difference(modlist.off,modlist.on);
				modlist.flip=_.difference(modlist.flip,modlist.on,modlist.off);
                if( !playerIsGM(msg.playerid) && !state.TokenMod.playersCanUse_ids ) {
                    ids=[];
                }

                if(!ignoreSelected) {
                    ids=_.union(ids,_.pluck(msg.selected,'_id'));
                }

                if(ids.length){
					_.chain(ids)
						.uniq()
						.map(function(t){
							return getObj('graphic',t);
						})
						.reject(_.isUndefined)
						.each(function(t) {
							applyModListToToken(modlist,t);
						});
				}
				break;

		}

	},

	registerEventHandlers = function() {
		on('chat:message', handleInput);
	};

	return {
		CheckInstall: checkInstall,
        ObserveTokenChange: observeTokenChange,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	TokenMod.CheckInstall();
	TokenMod.RegisterEventHandlers();
});



