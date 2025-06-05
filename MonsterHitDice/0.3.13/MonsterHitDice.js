// Github:   https://github.com/shdwjk/Roll20API/blob/master/MonsterHitDice/MonsterHitDice.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.MonsterHitDice={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.MonsterHitDice.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

var globalconfig = globalconfig || undefined;  //eslint-disable-line no-var
const MonsterHitDice = (() => { // eslint-disable-line no-unused-vars

    const version = '0.3.13';
    API_Meta.MonsterHitDice.version = version;
    const lastUpdate = 1748794696;
    const schemaVersion = 0.3;

    let tokenIds = [];

    const checkGlobalConfig = () => {
        const s=state.MonsterHitDice;
        const g = (globalconfig && globalconfig.monsterhitdice);
        if(g && g.lastsaved && g.lastsaved > s.globalconfigCache.lastsaved){
           log('  > Updating from Global Config <  ['+(new Date(g.lastsaved*1000))+']');
           s.config.bar = parseInt(g.Bar.match(/\d+/)[0]);
            switch(g.Sheet){
                case "DnD 5e - Community Contributed":
                    s.config.hitDiceAttribute = 'npc_HP_hit_dice';
                    s.config.findSRDFormula = false;
                    s.config.HDis1eD8s = false;
                    s.config.useConBonus = true;
                    s.config.conBonusAttribute = 'npc_constitution';
                    s.config.conBonusIsStat = true;
                    break;

                case "DnD 5e - Shaped v2":
                    s.config.hitDiceAttribute = 'npc_hpformula';
                    s.config.findSRDFormula = true;
                    s.config.HDis1eD8s = false;
                    s.config.useConBonus = false;
                    s.config.conBonusAttribute = '';
                    s.config.conBonusIsStat = false;
                    break;

                case "DnD 5e - OGL by roll20":
                    s.config.hitDiceAttribute = 'npc_hpformula';
                    s.config.findSRDFormula = false;
                    s.config.HDis1eD8s = false;
                    s.config.useConBonus = false;
                    s.config.conBonusAttribute = '';
                    s.config.conBonusIsStat = false;
                    break;

                case "Advanced 1st Edition":
                    s.config.hitDiceAttribute = 'hitdice';
                    s.config.findSRDFormula = false;
                    s.config.HDis1eD8s = true;
                    s.config.useConBonus = false;
                    s.config.conBonusAttribute = '';
                    s.config.conBonusIsStat = false;
                    break;


                case "Custom - (Use settings below)":
                    s.config.hitDiceAttribute = g['HitDice Attribute'];
                    s.config.findSRDFormula = 'findSRDFormula' === g['SRD Embedded Formula'];
                    s.config.HDis1eD8s = 'HDis1eD8s' === g['1st Edition HD in Attribute (d8)'];
                    s.config.useConBonus = 'useSeparateCon' === g['Separate Constitution Modifier'];
                    s.config.conBonusAttribute = g['Constitution Attribute'];
                    s.config.conBonusIsStat = 'conIsStat' === g['Constitution is Stat'];
                    break;
            }
            state.MonsterHitDice.globalconfigCache=globalconfig.monsterhitdice;
        }
    };

    const checkInstall = () => {
        log('-=> MonsterHitDice v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! _.has(state,'MonsterHitDice') || state.MonsterHitDice.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state.MonsterHitDice && state.MonsterHitDice.version) {

                case 0.1:
                  delete state.MonsterHitDice.globalConfigCache;
                  state.MonsterHitDice.globalconfigCache = {lastsaved:0};

                /* falls through */
                case 0.2:
                  state.MonsterHitDice.config.findSRDFormula = state.MonsterHitDice.findSRDFormula;
                  delete state.MonsterHitDice.findSRDFormula;

                /* falls through */
                case 'UpdateSchemaVersion':
                    state.MonsterHitDice.version = schemaVersion;
                    break;

                default:
                    state.MonsterHitDice = {
                        version: schemaVersion,
                        globalconfigCache: {lastsaved:0},
                        config: {
                            bar: 3,
                            hitDiceAttribute: 'npc_hpformula',
                            findSRDFormula: false,
                            HDis1eD8s: false,
                            useConBonus: false,
                            conBonusAttribute: '',
                            conBonusIsStat: false
                        }
                    };
            }
        }
        checkGlobalConfig();
    };

    const handleInput = (msg) => {

        if (msg.type === "api" && /^!mhd(\b|$)/i.test(msg.content) && playerIsGM(msg.playerid) ) {
            let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
            let count = 0;
            (msg.selected || [])
                .map(o=>getObj('graphic',o._id))
                .filter(g=>undefined !== g)
                .forEach( o => {
                    ++count;
                    tokenIds.push(o.id);
                    rollHitDice(o);
                })
                ;
            sendChat('',`/w "${who}" Rolling hit dice for ${count} token(s).`);
        }
    };

    const findSRDRoll = (txt) => {
        return txt.match(/\d+d\d+(\+\d+)?/)[0]||0;
    };

    const buildHD1eExpression = (exp) => {
      let m = `${exp}`.match(/(\d+)([+-]\d+)?/);
      if(m){
        return `${m[1]}d8${ m[2] ? m[2] : ''}`;
      }
      return 0;
    };

    const rollHitDice = (obj) => {
        let sets = {};
        const bar = 'bar'+state.MonsterHitDice.config.bar;
        let hdAttrib;
        let conAttrib;
        let hdExpression = 0;
        let conExpression = 0;
        let bonus = 0;

        if(_.contains(tokenIds,obj.id)){
            tokenIds=_.without(tokenIds,obj.id);

            if( 'graphic' === obj.get('type') &&
            'token'   === obj.get('subtype') &&
            ''        !== obj.get('represents')
            ) {
                if( obj && '' === obj.get(bar+'_link') ) {
                    hdAttrib = findObjs({
                        type: 'attribute', 
                        characterid: obj.get('represents'),
                        name: state.MonsterHitDice.config.hitDiceAttribute
                    })[0];
                    conAttrib = findObjs({
                        _type: 'attribute', 
                        _characterid:obj.get('represents'),
                        name: state.MonsterHitDice.config.conBonusAttribute
                    })[0];

                    if( hdAttrib ) {
                        hdExpression = state.MonsterHitDice.config.findSRDFormula
                          ? findSRDRoll(hdAttrib.get('current'))
                          : hdAttrib.get('current')
                          ;

                        hdExpression = state.MonsterHitDice.config.HDis1eD8s
                          ? buildHD1eExpression(hdExpression)
                          : hdExpression
                          ;
                        if( state.MonsterHitDice.config.useConBonus && conAttrib ) {
                            conExpression = state.MonsterHitDice.config.conBonusIsStat
                              ? Math.round((conAttrib.get('current')-10)/2)
                              : conAttrib.get('current')
                              ;

                            bonus = conExpression * _.reduce(hdExpression.match(/(\d+)d\d+/g),(m,die) => {
                                m+=parseInt(die.match(/(\d+)d\d+/)[1],10);
                                return m;
                            },0);
                        }

                        sendChat('','/r '+hdExpression+'+'+bonus,(r) => {
                            let hp=0;
                            _.each(r,(subr) => {
                                let val=JSON.parse(subr.content);
                                if(_.has(val,'total'))
                                {
                                    hp+=val.total;
                                }
                            });
                            sets[bar+"_value"] = Math.max(hp,1);
                            sets[bar+"_max"] = Math.max(hp,1);
                            obj.set(sets);
                        });
                    }
                }
            }
        }
    };

    const saveTokenId = (obj) => {
        tokenIds.push(obj.id);

        setTimeout(((id) => {
            return () => {
                let token=getObj('graphic',id);
                if(token){
                    rollHitDice(token);
                }
            };
        })(obj.id),100);
    };


    const registerEventHandlers = () =>  {
        on('chat:message', handleInput);
        on('add:graphic', saveTokenId);
        on('change:graphic', rollHitDice);
    };


    on('ready',() => {
        checkInstall();
        registerEventHandlers();
    });



    return {
      /* public interface */
    };
    
})();

{try{throw new Error('');}catch(e){API_Meta.MonsterHitDice.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.MonsterHitDice.offset);}}
