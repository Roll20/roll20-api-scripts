// Github:   https://github.com/shdwjk/Roll20API/blob/master/MutantYearZero/MutantYearZero.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MutantYearZero = MutantYearZero || (function() {
    'use strict';

    var version = '0.1.2',
        lastUpdate = 1454873934,
        schemaVersion = 0.1,
        symbols = {
            biohazard: '&#'+'9763;',
            radioactive: '&#'+'9762;',
            explosion:  '&#'+'128165;',
            push: '&#'+'10150;'
        },
        colors = {
            green: '#3ea62a',
            lightGreen: '#89D878',
            yellow: '#ddcf43',
            lightYellow: '#FFF699',
            black: '#1d1d1d',
            lightBlack: '#8F8E8E'
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
        log('-=> MutantYearZero v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MutantYearZero') || state.MutantYearZero.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.MutantYearZero = {
                version: schemaVersion
            };
        }
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

    getDiceCounts = function(msg,idx) {
        var rolls = {};
        if( msg.inlinerolls
            && msg.inlinerolls[idx]
            && msg.inlinerolls[idx].results
            && msg.inlinerolls[idx].results.rolls[0]
        ) {
            _.each(msg.inlinerolls[idx].results.rolls,function(res){
                rolls=_.reduce(_.map(res.results,function(r){
                    return r.v;
                }).sort()  || [], function(m,r){
                    m[r]=(m[r]||0)+1;
                    return m;
                },rolls);
            });
        }
        return rolls;
    },

    getDiceArray = function(c) {
        return _.reduce(c,function(m,v,k){
            _.times(v,function(){m.push(k);});
            return m;
        },[]);
    },

    makeDiceImages = function(dice,bgcolor,color){
        bgcolor=bgcolor||'black';
        color=color||'white';
        return _.map(dice,function(r){
            return '<div style="display:inline-block;background:'+bgcolor+'; color:'+color+'; border:1px solid black;border-radius:.5em;padding:.1em 0 0 0;text-align:center;width:1.1em;height:1.1em;float:left;margin-right:.1em;">'+r+'</div>';
        }).reverse().join('');
    },
    makeRerollExpression = function(dice){
        var cnt = _.filter(dice,function(v){return v.match(/^\d+$/);}).length;
        return ' '+ch('[')+ch('[')+cnt+'d6'+ch(']')+ch(']')+' ';
    },



    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args,
            optional,

            rollIndices=[],
            skillDice, // skill: green
            baseDice, // base(stat): yellow, trama on 1s
            gearDice, // gear: black, degradation on 1s

            skillDiceArray,
            baseDiceArray,
            gearDiceArray,

            successes=0,
            trama=0,
            gearDamage=0,
            pushedValues,

            push=false,
            pushButton,
            w=false;

        if (msg.type !== "api") {
            return;
        }

		if(_.has(msg,'inlinerolls')){
            rollIndices=_.map(msg.content.match(/\$\[\[(\d+)\]\]/g),function(i){
                return i.match(/\d+/)[0];
            });
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

        optional = msg.content.split(/\s+--/);
        pushedValues = _.first(optional).split(/\|\|/);
        args = pushedValues.shift().split(/\s+/);
        pushedValues = (pushedValues.shift()||'').trim().split(/\s+/);
        pushedValues = (pushedValues[0] === '' ? [] : pushedValues);
        optional = _.map(_.rest(optional),function(o){
           return o.split(/\|/);
        });

        switch(args.shift()) {
            case '!wmyz':
                w=true;
                /* break; */ // Intentional drop through
            case '!myz':
                push=!!pushedValues.length;

                skillDice=getDiceCounts(msg,rollIndices[0]);
                baseDice=getDiceCounts(msg,rollIndices[1]);
                gearDice=getDiceCounts(msg,rollIndices[2]);

                successes=(parseInt(pushedValues[0],10)||0) + (skillDice['6']||0) + (baseDice['6']||0) + (gearDice['6']||0) ;
                trama=(parseInt(pushedValues[1],10)||0) + (baseDice['1']||0);
                gearDamage=(parseInt(pushedValues[2],10)||0)+ (gearDice['1']||0);


                skillDiceArray=_.map(getDiceArray(skillDice),function(v){
                    switch(v){
                        case '6':
                            return symbols.radioactive;
                        default:
                            return v;
                    }
                });

                baseDiceArray=_.map(getDiceArray(baseDice),function(v){
                    switch(v){
                        case '1':
                            return symbols.biohazard;
                        case '6':
                            return symbols.radioactive;
                        default:
                            return v;
                    }
                });
                gearDiceArray=_.map(getDiceArray(gearDice),function(v){
                    switch(v){
                        case '1':
                            return symbols.explosion;
                        case '6':
                            return symbols.radioactive;
                        default:
                            return v;
                    }
                });

                pushButton = (!push
                    ? makeButton(
                        '!'+(w?'w':'')+'myz '+
                        makeRerollExpression(skillDiceArray)+
                        makeRerollExpression(baseDiceArray)+
                        makeRerollExpression(gearDiceArray)+
                        '|| '+successes+' '+trama+' '+gearDamage,
                        symbols.push
                    ) 
                    : ''
                );

                sendChat(msg.who, (w ? '/w gm ' : '/direct ') +
                    '<div style="margin-left: -45px;border: 1px solid #ccc;background-color:#eee;border-radius:.5em;padding:.5em;font-size: 1.25em">'+
                        '<div style="max-width:10em;float:left;font-size: 1.25em; margin-right: .2em;">'+
                            '<div style="'+
                                    'border:1px solid '+colors.green+';'+
                                    'padding: .05em .2em;'+
                                    'background-color:'+colors.lightGreen+';'+
                                    'color:#1d1d1d;'+
                                '">'+
                                    successes+' '+symbols.radioactive+
                            '</div>'+
                            '<div style="'+
                                    'border:1px solid '+colors.yellow+';'+
                                    'padding: .05em .2em;'+
                                    'background-color:'+colors.lightYellow+';'+
                                    'color:'+(push?'#1d1d1d':'#5a5a5a')+';'+
                                '">'+
                                    trama+' '+symbols.biohazard+
                            '</div>'+
                            '<div style="'+
                                    'border:1px solid '+colors.black+';'+
                                    'padding: .05em .2em;'+
                                    'background-color:'+colors.lightBlack+';'+
                                    'color:'+(push?'#1d1d1d':'#5a5a5a')+';'+
                                '">'+
                                    gearDamage+' '+symbols.explosion+
                            '</div>'+
                            '<div>'+pushButton+'</div>'+
                        '</div>'+
                            makeDiceImages(skillDiceArray,colors.green)+
                            makeDiceImages(baseDiceArray,colors.yellow, colors.black)+
                            makeDiceImages(gearDiceArray,colors.black)+
                        '<div style="clear:both;"></div>'+
                    '</div>');



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

    MutantYearZero.CheckInstall();
    MutantYearZero.RegisterEventHandlers();
});

