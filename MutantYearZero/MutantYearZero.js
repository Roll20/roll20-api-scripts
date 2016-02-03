// Github:   https://github.com/shdwjk/Roll20API/blob/master/MutantYearZero/MutantYearZero.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var MutantYearZero = MutantYearZero || (function() {
    'use strict';

    var version = '0.1.1',
        lastUpdate = 1454463052,
        schemaVersion = 0.1,
        defaults = {
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

    getDieSize = function(msg,idx){
        if( msg.inlinerolls
            && msg.inlinerolls[idx]
            && msg.inlinerolls[idx].results
            && msg.inlinerolls[idx].results.rolls[0]
        ) {
            return msg.inlinerolls[idx].results.rolls[0].sides;
        }
        return 0;
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



    handleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args,
            optional,
            diceCounts,
            successes=0,
            failures=0,
            push=false,
            pushedSuccesses=0,
            notSuccesses=0,
            pushButton,
            dieSize=0,
            diceArray,
            w=false,
            rollIndex;

        if (msg.type !== "api") {
            return;
        }

		if(_.has(msg,'inlinerolls')){
            rollIndex=msg.content.match(/\$\[\[(\d+)\]\]/)[1];
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
        args = _.first(optional).split(/\s+/);
        optional = _.map(_.rest(optional),function(o){
           return o.split(/\|/);
        });

        switch(args.shift()) {
            case '!wmyz':
                w=true;
                /* break; */ // Intentional drop through
            case '!myz':
				if(args.length>1){
                    pushedSuccesses=parseInt(args[1],10);
                    push=true;
				}

                diceCounts=getDiceCounts(msg,rollIndex);
                dieSize=getDieSize(msg,rollIndex);
                if(!diceCounts){
                    return;
                }
                diceArray=getDiceArray(diceCounts);
                notSuccesses=_.reject(diceArray,function(r){return dieSize===parseInt(r,10);}).length;

                successes = (diceCounts[dieSize] || 0)+pushedSuccesses;
                failures = (push ? diceCounts[1] : 0);

                pushButton = (!push ? makeButton('!'+(w?'w':'')+'myz '+ch('[')+ch('[')+notSuccesses+'d'+dieSize+ch(']')+ch(']')+' '+successes, 'Push Yourself!') : '');
                sendChat(msg.who, (w ? '/w gm ' : '/direct ') +
                    '<div style="margin-left: -45px;border: 1px solid #ccc;background-color:#eee;border-radius:.5em;padding:.5em;">'+
                        '<div><b>Successes: </b>'+successes+' '+pushButton+'</div>'+
                        (push && failures ? '<div style="color: red;"><b>Failures: </b>'+failures+'</div>' : '')+
                        '<div>'+_.map(diceArray,function(r){
                            var color=( (push && '1'===r) ? 'red' : 'black');
                            return '<div style="display:inline-block;background:white;color:'+color+';border:1px solid black;border-radius:.5em;padding:0;text-align:center;width:1.1em;height:1.1em;float:left;font-weight:bold;">'+r+'</div>';
                        }).reverse().join('')+
                            '<div style="clear:both;"></div>'+
                        '</div>'+
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

