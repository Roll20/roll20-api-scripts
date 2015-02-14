// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenNameNumber/TokenNameNumber.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var TokenNameNumber = TokenNameNumber || (function() {
    'use strict';

    var version = 0.3,
    	schemaVersion = 0.1,
        maxWaitTime = 1000,
        randomSpace = 0,

    checkInstall = function() {    
        if( ! _.has(state,'TokenNameNumber') || state.TokenNameNumber.version !== schemaVersion) {
            state.TokenNameNumber = {
                version: schemaVersion,
				registry: {
				}
            };
        }
    },

	getMatchers = function(pageid,represents) {
		var matchers = [];
		if(_.has(state.TokenNameNumber.registry, pageid)
			&& _.has(state.TokenNameNumber.registry[pageid],represents) ) {
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

	setNumberFunction = function(id,lastTimeout) {
		var obj = getObj('graphic',id),
			matchers = (obj && getMatchers(obj.get('pageid'), obj.get('represents'))) || [],
			tokenName = (obj && obj.get('name')),
			matcher,
			renamer,
			parts,
			num;


	   if(obj && (tokenName.match( /%%NUMBERED%%/ ) || _.some(matchers,function(m) { return m.test(tokenName);}) ) ) {
			if( 0 === matchers.length || !_.some(matchers,function(m) { return m.test(tokenName);}) ) {
				matcher='^('+tokenName.replace(/%%NUMBERED%%/,')(\\d+)(')+')$';
				addMatcher(obj.get('pageid'), obj.get('represents'), matcher );
			}
			if( !_.some(matchers,function(m) {
					if(m.test(tokenName)) {
						matcher=m;
						return true;
					}
					return false;
				}) ) {
				matcher=new RegExp('^('+tokenName.replace(/%%NUMBERED%%/,')(\\d+)(')+')$');
				renamer=new RegExp('^('+tokenName.replace(/%%NUMBERED%%/,')(%%NUMBERED%%)(')+')$');
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

                num += ( randomSpace ? (randomInteger(randomSpace)-1) : 0);
				
			parts=renamer.exec(tokenName);
			obj.set({
				name: parts[1]+(++num)+parts[3]
			});
		} else if ( lastTimeout < maxWaitTime ) {
            setTimeout(_.bind(setNumberFunction,this,id,lastTimeout*2), lastTimeout*2);
        }
	},

	setNumberOnToken = function(obj) {
        if( 'graphic' === obj.get('type') 
            && 'token'   === obj.get('subtype') ) {
 
            setTimeout(_.bind(setNumberFunction,this,obj.id,200), 200);
        }
    },

	registerEventHandlers = function() {
		on('add:graphic', setNumberOnToken);
	};

	return {
        CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
}());

on("ready",function(){
	'use strict';

	TokenNameNumber.CheckInstall(); 
	TokenNameNumber.RegisterEventHandlers();
});

