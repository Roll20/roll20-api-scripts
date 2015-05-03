// Github:   https://github.com/shdwjk/Roll20API/blob/master/GroupInitiative/GroupInitiative.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

var GroupInitiative = GroupInitiative || (function() {
    'use strict';

    var version = '0.8.1',
        lastUpdate = 1430682355,
        schemaVersion = 0.6,
        bonusCache = {},
        statAdjustments = {
            'Stat-DnD': {
                func: function(v) {
                    return Math.floor((v-10)/2);
                },
                desc: 'Calculates the bonus as if the value were a DnD Stat.'
            },
            'Bare': {
                func: function(v) {
                    return v;
                },
                desc: 'No Adjustment.'
            },
            'Floor': {
                func: function(v) {
                    return Math.floor(v);
                },
                desc: 'Rounds down to the nearest integer.'
            },
            'Ceiling': {
                func: function(v) {
                    return Math.ceil(v);
                },
                desc: 'Rounds up to the nearest integer.'
            },
            'Bounded': {
                func: function(v,l,h) {
                    l=parseFloat(l,10) || v;
                    h=parseFloat(h) || v;
                    return Math.min(h,Math.max(l,v));
                },
                desc: 'Restricts to a range.  Use Bounded:<lower bound>:<upper bound> for specifying bounds.  Leave a bound empty to be unrestricted in that direction.  Example: <b>Bounded::5</b> would specify a maximum of 5 with no minimum.'
            }
        },

        rollers = {
            'Least-All-Roll':{
                func: function(s,k,l){
                    if(!_.has(this,'init')) {
                        this.init=_.chain(l)
                        .pluck('bonus')
                        .map(function(d){
                            return randomInteger(20)+d;
                        },{})
                        .min()
                        .value();
                    }
                    s.init=this.init;
                    return s;
                },
                desc: 'Sets the initiative to the lowest of all initiatives rolled for the group.'
            },
            'Mean-All-Roll':{
                func: function(s,k,l){
                    if(!_.has(this,'init')) {
                        this.init=_.chain(l)
                        .pluck('bonus')
                        .map(function(d){
                            return randomInteger(20)+d;
                        },{})
                        .reduce(function(memo,r){
                            return memo+r;
                        },[0])
                        .map(function(v){
                            return Math.floor(v/l.length);
                        })
                        .value();
                    }
                    s.init=this.init;
                    return s;
                },
                desc: 'Sets the initiative to the mean (average) of all initiatives rolled for the group.'
            },
            'Individual-Roll': {
                func: function(s,k,l){
                    s.init=randomInteger(20)+s.bonus;
                    return s;
                },
                desc: 'Sets the initiative individually for each member of the group.'
            },
            'Constant-By-Stat': {
                func: function(s,k,l){
                    s.init=s.bonus;
                    return s;
                },
                desc: 'Sets the initiative individually for each member of the group to their bonus with no roll.'
            }
        },

    checkInstall = function() {    
        log('-=> GroupInitiative v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'GroupInitiative') || state.GroupInitiative.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.GroupInitiative && state.GroupInitiative.version) {
                case 0.5:
                    state.GroupInitiative.version = schemaVersion;
                    state.GroupInitiative.replaceRoll = false;
                    break;
                default:
                    state.GroupInitiative = {
                        version: schemaVersion,
                        bonusStatGroups: [
                            [
                                {
                                    attribute: 'dexterity'
                                }
                            ]
                        ],
                        rollType: 'Individual-Roll',
                        replaceRoll: false
                    };
            }
        }
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


    buildBonusStatGroupRows = function() {
        return _.reduce(state.GroupInitiative.bonusStatGroups, function(memo,bsg){
            return memo + '<li><span style="border: 1px solid #999;background-color:#eee;padding: 0px 3px;">'+_.chain(bsg)
            .map(function(s){
                var attr=s.attribute+'|'+( _.has(s,'type') ? s.type : 'current' );
                if(_.has(s,'adjustments')) {
                    attr=_.reduce(s.adjustments, function(memo2,a) {
                        return a+'( '+memo2+' )';
                    }, attr);
                }
                return attr;
            })
            .value()
            .join('</span> + <span style="border: 1px solid #999;background-color:#eee;padding: 0px 3px;">')
            +'</span></li>';
        },"");
    },

    buildStatAdjustmentRows = function() {
        return _.reduce(statAdjustments,function(memo,r,n){
            return memo+"<li><b>"+n+"</b> — "+r.desc+"</li>";
        },"");
    },

    showHelp = function() {
        var rollerRows=_.reduce(rollers,function(memo,r,n){
            var selected=((state.GroupInitiative.rollType === n) ? 
            '<div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;"><span style="color: red; font-weight:bold; padding: 0px 4px;">Selected</span></div>'
            : '' ),
            selectedStyleExtra=((state.GroupInitiative.rollType === n) ? ' style="border: 1px solid #aeaeae;background-color:#8bd87a;"' : '');

            return memo+selected+"<li "+selectedStyleExtra+"><b>"+n+"</b> - "+r.desc+"</li>";
        },""),
        statAdjustmentRows = buildStatAdjustmentRows(),
        bonusStatGroupRows = buildBonusStatGroupRows();			

        sendChat('',
            '/w gm '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
            +'GroupInitiative v'+version
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<p>Rolls initiative for the selected tokens and adds them '
            +'to the turn order if they don'+ch("'")+'t have a turn yet.</p>'

            +'<p>The calculation of initiative is handled by the '
            +'combination of Roller (See <b>Roller Options</b> below) and '
            +'a Bonus.  The Bonus is determined based on an ordered list '
            +'of Stat Groups (See <b>Bonus Stat Groups</b> below).  Stat '
            +'Groups are evaluated in order.  The bonus computed by the first '
            +'Stat Group for which all attributes exist and have a '
            +'numeric value is used.  This allows you to have several '
            +'Stat Groups that apply to different types of characters. '
            +'In practice you will probably only have one, but more are '
            +'there if you need them.</p>'
            +'</div>'
            +'<b>Commands</b>'
            +'<div style="padding-left:10px;">'
            +'<b><span style="font-family: serif;">!group-init</span></b>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p>This command uses the configured Roller to '
            +'determine the initiative order for all selected '
            +'tokens.</p>'
            +'</div>'
            +'</div>'

            +'<div style="padding-left:10px;">'
            +'<b><span style="font-family: serif;">!group-init <i>--help</i></span></b>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p>This command displays the help.</p>'
            +'</div>'
            +'</div>'

            +'<div style="padding-left:10px;">'
            +'<b><span style="font-family: serif;">!group-init <i>--set-roller</i> '+ch('<')+'roller name'+ch('>')+'</span></b>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p>Sets Roller to use for calculating initiative.</p>'
            +'This command requires 1 parameter:'
            +'<ul>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">roller name</span></b> -- The name of the Roller to use.  See <b>Roller Options</b> below.'
            +'</li> '
            +'</ul>'
            +'</div>'
            +'</div>'

            +'<div style="padding-left:10px;">'
            +'<b><span style="font-family: serif;">!group-init <i>--promote</i> '+ch('<')+'index'+ch('>')+'</span></b>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p>Increases the importance the specified Bonus Stat Group.</p>'
            +'This command requires 1 parameter:'
            +'<ul>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">index</span></b> -- The numeric index of the Bonus Stat Group to promote.  See <b>Bonus Stat Groups</b> below.'
            +'</li> '
            +'</ul>'
            +'</div>'
            +'</div>'

            +'<div style="padding-left:10px;">'
            +'<b><span style="font-family: serif;">!group-init <i>--del-group</i> '+ch('<')+'index'+ch('>')+'</span></b>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p>Deletes the specified Bonus Stat Group.</p>'
            +'This command requires 1 parameter:'
            +'<ul>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">index</span></b> -- The numeric index of the Bonus Stat Group to delete.  See <b>Bonus Stat Groups</b> below.'
            +'</li> '
            +'</ul>'
            +'</div>'
            +'</div>'
            +'<div style="padding-left:10px;">'
            +'<b><span style="font-family: serif;">!group-init <i>--add-group</i> --'+ch('<')+'adjustment'+ch('>')+' [--'+ch('<')+'adjustment'+ch('>')+'] '+ch('<')+'attribute name[|'+ch('<')+'max|current'+ch('>')+']'+ch('>')+' [--'+ch('<')+'adjustment'+ch('>')+' [--'+ch('<')+'adjustment'+ch('>')+'] '+ch('<')+'attribute name[|'+ch('<')+'max|current'+ch('>')+']'+ch('>')+' ...]  </span></b>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p>Adds a new Bonus Stat Group to the end of the list.  Each adjustment operation can be followed by another adjustment operation, but eventually must end in an attriute name.  Adjustment operations are applied to the result of the adjustment operations that follow them.</p>'
            +'<p>For example: <span style="border:1px solid #ccc; background-color: #eec; padding: 0px 3px;">--Bounded:-2:2 --Stat-DnD wisdom|max</span> would first computer the DnD Stat bonus for the max field of the wisdom attribute, then bound it between -2 and +2.</p>'
            +'This command takes multiple parameters:'
            +'<ul>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">adjustment</span></b> -- One of the Stat Adjustment Options. See <b>Stat Adjustment Options</b> below.'
            +'</li> '
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">attribute name</span></b> -- The name of an attribute.  You can specify |max or |current on the end to target those specific fields (defaults to |current).'
            +'</li> '
            +'</ul>'
            +'</div>'
            +'</div>'

            +'<div style="padding-left:10px;">'
                +'<b><span style="font-family: serif;">!group-init <i>--toggle-replace</i></span></b>'
                +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<div style="float:right;width:40px;border:1px solid black;background-color:#ffc;text-align:center;">'+( state.GroupInitiative.replaceRoll ? '<span style="color: red; font-weight:bold; padding: 0px 4px;">ON</span>' : '<span style="color: #999999; font-weight:bold; padding: 0px 4px;">OFF</span>' )+'</div>'
                    +'<p>Sets whether initative scores for selected tokens replace their current scores.</p>'
                +'</div>'
            +'</div>'

            +'<b>Roller Options</b>'
            +'<div style="padding-left:10px;">'
            +'<ul>'
            +rollerRows
            +'</ul>'
            +'</div>'

            +'<b>Stat Adjustment Options</b>'
            +'<div style="padding-left:10px;">'
            +'<ul>'
            +statAdjustmentRows
            +'</ul>'
            +'</div>'

            +'<b>Bonus Stat Groups</b>'
            +'<div style="padding-left:10px;">'
            +'<ol>'
            +bonusStatGroupRows
            +'</ol>'
            +'</div>'

            +'</div>'
        );
    },

    findInitiativeBonus = function(id) {
        var bonus = 0;
        if(_.has(bonusCache,id)) {
            return bonusCache[id];
        }
        _.chain(state.GroupInitiative.bonusStatGroups)
        .find(function(group){
            bonus = _.chain(group)
            .map(function(details){
                var stat=parseFloat(getAttrByName(id,details.attribute, details.type||'current'),10);

                stat = _.reduce(details.adjustments || [],function(memo,a){
                    var args,adjustment,func;
                    if(memo) {
                        args=a.split(':');
                        adjustment=args.shift();
                        args.unshift(memo);
                        func=statAdjustments[adjustment].func;
                        if(_.isFunction(func)) {
                            memo =func.apply({},args);
                        }
                    }
                    return memo;
                },stat);
                return stat;
            })
            .reduce(function(memo,v){
                return memo+v;
            },0)
            .value();
            return !(_.isUndefined(bonus) || _.isNaN(bonus) || _.isNull(bonus));
        });
        bonusCache[id]=bonus;
        return bonus;
    },

    HandleInput = function(msg_orig) {
        var msg = _.clone(msg_orig),
            args,
        cmds,
        workgroup,
        workvar,
        turnorder,
        rolls,
        error=false,
            initFunc,
            cont=false,
            manualBonus=0;

        if (msg.type !== "api" || !playerIsGM(msg.playerid) ) {
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

        args = msg.content.split(/\s+--/);
        switch(args.shift()) {
            case '!group-init':
                if(args.length > 0) {
                    cmds=args.shift().split(/\s+/);

                    switch(cmds[0]) {
                        case 'help':
                            showHelp();
                            break;

                        case 'add-group':
                            workgroup=[];
                            workvar={};

                            _.each(args,function(arg){
                                var a=arg.split(/\s+(.+)/),
                                b,
                                c=a[0].split(/:/);

                                if(_.has(statAdjustments,c[0])) {
                                    if('Bare' !== c[0]) {
                                        if(!_.has(workvar,'adjustments')) {
                                            workvar.adjustments=[];
                                        }
                                        workvar.adjustments.unshift(a[0]);
                                    }
                                    if(a.length > 1){
                                        b=a[1].split(/\|/);
                                        workvar.attribute=b[0];
                                        if('max'===b[1]) {
                                            workvar.type = 'max';
                                        }
                                        workgroup.push(workvar);
                                        workvar={};
                                    }
                                } else {
                                    sendChat('!group-init --add-group', '/w gm ' 
                                        +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                        +'Unknown Stat Adustment: '+c[0]+'<br>'
                                        +'Use one of the following:'
                                        +'<ul>'
                                        +buildStatAdjustmentRows()
                                        +'</ul>'
                                        +'</div>'
                                    );
                                    error=true;
                                }
                            });
                            if(!error) {
                                if(!_.has(workvar,'adjustments')){
                                    state.GroupInitiative.bonusStatGroups.push(workgroup);
                                    sendChat('GroupInitiative', '/w gm ' 
                                        +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                        +'Updated Bonus Stat Group Ordering:'
                                        +'<ol>'
                                        +buildBonusStatGroupRows()
                                        +'</ol>'
                                        +'</div>'
                                    );
                                } else {
                                    sendChat('!group-init --add-group', '/w gm ' 
                                        +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                        +'All Stat Adjustments must have a final attribute name as an argument.  Please add an attribute name after --'+args.pop()
                                        +'</div>'
                                    );
                                }
                            }
                            break;


                        case 'promote':
                            cmds[1]=Math.max(parseInt(cmds[1],10),1);
                            if(state.GroupInitiative.bonusStatGroups.length >= cmds[1]) {
                                if(1 !== cmds[1]) {
                                    workvar=state.GroupInitiative.bonusStatGroups[cmds[1]-1];
                                    state.GroupInitiative.bonusStatGroups[cmds[1]-1] = state.GroupInitiative.bonusStatGroups[cmds[1]-2];
                                    state.GroupInitiative.bonusStatGroups[cmds[1]-2] = workvar;
                                }

                                sendChat('GroupInitiative', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Updated Bonus Stat Group Ordering:'
                                    +'<ol>'
                                    +buildBonusStatGroupRows()
                                    +'</ol>'
                                    +'</div>'
                                );
                            } else {
                                sendChat('!group-init --promote', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Please specify one of the following by number:'
                                    +'<ol>'
                                    +buildBonusStatGroupRows()
                                    +'</ol>'
                                    +'</div>'
                                );
                            }
                            break;

                        case 'del-group':
                            cmds[1]=Math.max(parseInt(cmds[1],10),1);
                            if(state.GroupInitiative.bonusStatGroups.length >= cmds[1]) {
                                state.GroupInitiative.bonusStatGroups=_.filter(state.GroupInitiative.bonusStatGroups, function(v,k){
                                    return (k !== (cmds[1]-1));
                                });

                                sendChat('GroupInitiative', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Updated Bonus Stat Group Ordering:'
                                    +'<ol>'
                                    +buildBonusStatGroupRows()
                                    +'</ol>'
                                    +'</div>'
                                );
                            } else {
                                sendChat('!group-init --del-group', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Please specify one of the following by number:'
                                    +'<ol>'
                                    +buildBonusStatGroupRows()
                                    +'</ol>'
                                    +'</div>'
                                );
                            }
                            break;

                        case 'set-roller':
                            if(_.has(rollers,cmds[1])) {
                                state.GroupInitiative.rollType=cmds[1];
                                sendChat('GroupInitiative', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Roller is now set to: <b>'+cmds[1]+'<br>'
                                    +'</div>'
                                );
                            } else {
                                sendChat('GroupInitiative', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Not a valid Roller Name: <b>'+cmds[1]+'</b><br>'
                                    +'Please use one of the following:'
                                    +'<ul>'
                                    +_.reduce(rollers,function(memo,r,n){
                                        return memo+'<li>'+n+'</li>';
                                    },'')
                                    +'</ul>'
                                    +'</div>'
                                );
                            }
                            break;

                        case 'toggle-replace':
                            state.GroupInitiative.replaceRoll = !state.GroupInitiative.replaceRoll;
                            sendChat('GroupInitiative', '/w gm '
                                +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                +'Replace Initiative on Roll is now: <b>'+ (state.GroupInitiative.replaceRoll ? 'ON' : 'OFF') +'</b>'
                                +'</div>'
                            );
                            break;

                        case 'bonus':
                            if(cmds[1].match(/^[\-\+]?\d+$/)){
                                manualBonus=parseInt(cmds[1],10);
                                cont=true;
                            } else {
                                sendChat('GroupInitiative', '/w gm ' 
                                    +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                    +'Not a valid bonus: <b>'+cmds[1]+'</b>'
                                    +'</div>'
                                );
                            }
                            break;

                        default:
                            sendChat('GroupInitiative', '/w gm ' 
                                +'<div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;">'
                                +'Not a valid command: <b>'+cmds[0]+'</b>'
                                +'</div>'
                            );
                            break;
                    }
                } else {
                    cont=true;
                }

                if(cont) {
                    if(_.has(msg,'selected')) {
                        bonusCache = {};
                        turnorder = Campaign().get('turnorder');
                        turnorder = ('' === turnorder) ? [] : JSON.parse(turnorder);
                        if(state.GroupInitiative.replaceRoll) {
                            turnorder=_.reject(turnorder,function(i){
                                return _.contains(_.pluck(msg.selected, '_id'),i.id);
                            });
                        }

                        initFunc=rollers[state.GroupInitiative.rollType].func;

                        Campaign().set({
                            turnorder: JSON.stringify(
                                turnorder.concat(
                                    _.chain(msg.selected)
                                        .map(function(s){
                                            return getObj(s._type,s._id);
                                        })
                                        .reject(_.isUndefined)
                                        .reject(function(s){
                                            return _.contains(_.pluck(turnorder,'id'),s.id);
                                        })
                                        .map(function(s){
                                            return {
                                                token: s,
                                                character: getObj('character',s.get('represents'))
                                            };
                                        })
                                        .map(function(s){
                                            s.bonus=(s.character ? findInitiativeBonus(s.character.id) || 0 : 0)+manualBonus;
                                            return s;
                                        })
                                        .map(initFunc)
                                        .map(function(s){
                                            return {
                                                id: s.token.id,
                                                pr: s.init,
                                                custom: ''
                                            };
                                        })
                                        .value()
                                )
                            )
                        }
                        );
                    } else {
                        showHelp();
                    }
                }
                break;
        }

    },


    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
    };

    return {
        RegisterEventHandlers: RegisterEventHandlers,
        CheckInstall: checkInstall
    };
}());

on("ready",function(){
    'use strict';

        GroupInitiative.CheckInstall();
        GroupInitiative.RegisterEventHandlers();
});
