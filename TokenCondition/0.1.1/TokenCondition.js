// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenCondition/TokenCondition.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global GroupInitiative TokenMod */
const TokenCondition = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.1';
    const lastUpdate = 1577904348;
    const schemaVersion = 0.2;

    let lookup = {};

    const defaults = {
        _base: {
            mirror: [
                'left', 'top',
                'width', 'height',
                'lastmove', 'controlledby'
            ],
            forward: [
            ],
            adjustments:[
            ]
        },
        condition: {
            mirror: [
                'bar1_value', 'bar1_max','bar1_link',
                'bar2_value', 'bar2_max','bar2_link',
                'bar3_value', 'bar3_max','bar3_link',
                'represents', 'statusmarkers',
                'tint_color'
            ],
            forward: [
            ],
            adjustments:[
            ]
        },
        decoration: {
            mirror: [
            ],
            forward: [
            ],
            adjustments:[
                'below'
            ]
        },
        mount: {
            mirror: [
                'rotation'
            ],
            forward: [
            ],
            adjustments:[
                'below'
            ]
        }
    };


    const initializeRuntimeData = () => {
        let pageids = Object.keys(state.TokenCondition.registry);
        let data = [];

        pageids.forEach( (pid) => {
            let page = getObj('page',pid);
            if(page){
                let tids = Object.keys(state.TokenCondition.registry[pid]);
                tids.forEach( (tid) => {
                    data.push({pid,tid});
                });
            } else {
                delete state.TokenCondition.registry[pid];
            }
        });

        const burndown = () => {
            let o = data.shift();
            if(o) {
                let target = getObj('graphic',o.tid);
                if(target) {
                    let conds = state.TokenCondition.registry[o.pid][o.tid].conditions
                        .map(c=>getObj('graphic',c.id))
                        .filter(g=>undefined!==g)
                        .map(g=>g.id);

                    state.TokenCondition.registry[o.pid][o.tid].conditions =  
                        state.TokenCondition.registry[o.pid][o.tid].conditions.reduce( (m,c) => {
                            if(conds.includes(c.id)){
                                m.push(c);
                                Modify.create(c.id,c);
                            }
                            return m;
                        }, []);

                    if(conds.length){
                        lookup[target.id]=state.TokenCondition.registry[o.pid][o.tid];
                        conds.forEach(c => {
                            lookup[c]=state.TokenCondition.registry[o.pid][o.tid];
                        });
                    } else {
                        delete state.TokenCondition.registry[o.pid][o.tid];
                    }
                } else {
                    delete state.TokenCondition.registry[o.pid][o.tid];
                }
                setTimeout(burndown,0);
            }
        };
        burndown();
    };

    const checkInstall = () =>  {
        log('-=> TokenCondition v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('TokenCondition') || state.TokenCondition.version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            switch(state.TokenCondition && state.TokenCondition.version) {
                case 0.2:
                    /* break; // intentional dropthrough */ /* falls through */

                case 0.1:
                    Object.keys(state.TokenCondition.registry).forEach( pid => {
                        Object.keys(state.TokenCondition.registry[pid]).forEach( tid => {

                            state.TokenCondition.registry[pid][tid].below = [];
                            state.TokenCondition.registry[pid][tid].conditions =
                                state.TokenCondition.registry[pid][tid].conditions.map( gid => ({
                                    id: gid,
                                    mirror: [...new Set([...defaults.base.mirror,...defaults.condition.mirror])],
                                    forward: [...new Set([...defaults.base.forward,...defaults.condition.forward])],
                                    adjustments: [...new Set([...defaults.base.adjustments,...defaults.condition.adjustments])]
                                }));
                        });
                    });
                    /* break; // intentional dropthrough */ /* falls through */

                case 'UpdateSchemaVersion':
                    state.TokenCondition.version = schemaVersion;
                    break;

                default:
                    state.TokenCondition = {
                        version: schemaVersion,
                        registry: {}
                    };
                    break;
            }
        }

        initializeRuntimeData();
    };

    const isOverlappedDist = (obj1, obj2) => {
        let dx = Math.abs(obj1.get('left')-obj2.get('left'));
        let dy = Math.abs(obj1.get('top')-obj2.get('top'));
        let lx = ((0+obj1.get('width') + obj2.get('width'))/2);
        let ly = ((0+obj1.get('height') + obj2.get('height'))/2);
        
        if(dx < lx && dy < ly){
            return (dy*dy+dx*dx);
        }
        return false;
    };

    const glomOn = (conditionData, target, newObj) => {
        let pid = target.get('pageid');
        if(!state.TokenCondition.registry.hasOwnProperty(pid)){
            state.TokenCondition.registry[pid] = {};
        }
        if(!state.TokenCondition.registry[pid].hasOwnProperty(target.id)){
            state.TokenCondition.registry[pid][target.id] = {
                target: target.id,
                conditions: [conditionData]
            };
            lookup[target.id] = state.TokenCondition.registry[pid][target.id];
        } else {
            state.TokenCondition.registry[pid][target.id].conditions.push(conditionData);
        }
        lookup[conditionData.id] = state.TokenCondition.registry[pid][target.id];

        //syncGraphic(target, conditionData.id);
        let m = Modify.getInstanceFor(target.id);
        m.applyTo(target,{},newObj);
    };

    const simpleObj = (o) => JSON.parse(JSON.stringify(o));

    ////////////////////////////////////////////////////////////
    // Number Operations
    ////////////////////////////////////////////////////////////

    class numberOp {
        static parse(page, field, str, permitBlank=true) {
            const regexp = /^([=+\-/*!])?(-?\d+\.?|\d*\.\d+)(u|g|s|ft|m|km|mi|in|cm|un|hex|sq)?$/i;

            if(!str.length && permitBlank){
                return new numberOp(field, '','','' );
            }

            let m = `${str}`.match(regexp);

            if(m){
                let oper = m[1]||'';
                let num = parseFloat(m[2]);
                let scale = m[3]||'';

                return new numberOp(page, field, oper, num, scale.toLowerCase());
            }
            return {getMods:()=>({})};
        }

        constructor(page,field,op,num,rel){
            this.page = page;
            this.field = field;
            this.operation = op;
            this.num = num;
            this.relative = rel;
            this.page = page;
        }

        getMods(mods,inverse=false){
            if(mods.hasOwnProperty(this.field)) {
                let num = this.num;
                let page = this.page;
                const unitSize = 70;
                switch(this.field){

                    case 'light_radius':
                    case 'light_dimradius':
                    case 'aura2_radius':
                    case 'aura1_radius':
                    case 'adv_fow_view_distance':
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

                    case 'rotation':
                    case 'light_multiplier':
                        break;

                }


                let current = parseFloat(mods[this.field]);
                let operation = this.operation;
                const operationInverseMap = {
                    '=': '=',
                    '!': '!',
                    '+': '-',
                    '-': '+',
                    '*': '/',
                    '/': '*'
                };
                if(inverse){
                    operation = operationInverseMap[operation];
                }
                switch(operation){
                    default:
                    case '=': return {[this.field]:num};
                    case '!': return {[this.field]:(current===0 ? num : '')};
                    case '+': return {[this.field]:(current+num)};
                    case '-': return {[this.field]:(current-num)};
                    case '/': return {[this.field]:(current/(num||1))};
                    case '*': return {[this.field]:(current*num)};
                }
            }
            return {};
        }
    }

    const supportedModifyProperties = ['rotation','width','height','left','top'];

    class Modify {

        static init() {
            Modify.registry={};
            Modify.nullSetter = new NullModify();
        }

        static create(id, mods){
            let token = getObj('graphic',id);
            if(token) {
                let page = getObj('page', token.get('pageid'));
                if(page) {
                    let mirror = [...mods.mirror];
                    let forward = [...mods.forward];
                    let adjustments = [];
                    mods.adjustments.forEach( a => {
                        let args = a.split(/:/);
                        let cmd = args.shift().toLowerCase();
                        if(supportedModifyProperties.includes(cmd)){
                            adjustments.push(numberOp.parse(page,cmd,args,false));
                        }
                    });

                    let mod = new Modify(page, mirror, forward, adjustments);

                    Modify.registry[id] = mod; 
                }
            }
        }

        static getInstanceFor(id){
            return Modify.registry[id] || Modify.nullSetter;
        }

        static removeInstanceFor(id){
            return delete Modify.registry[id];
        }

        constructor(page,mirror,forward,adjustments) {
            this.page = page;
            this.mirror = (mirror||[]);
            this.forward = (forward||[]);
            this.adjustments = (adjustments||[]);
        }
            
        // apply my changes to dest
        applyTo(obj, prev, dest) {
            let selfChanges = {};
            let sObj = simpleObj(obj);

            let forwards = [];

            // forward changes
            let changes = this.forward.reduce( (m,p) => {
                if(sObj[p] !== prev[p]){
                    m[p]=sObj[p];
                    selfChanges[p]=prev[p];
                    forwards.push(p);
                }
                return m;
            },{});
            // revert forwarded changes
            obj.set(selfChanges);

            // mirror changes
            changes = this.mirror.reduce( (m,p) => {
                if(sObj[p] !== prev[p] && !forwards.includes(p)){
                    m[p] = sObj[p];
                }
                return m;
            },changes);


            this.adjustments.forEach(a => Object.assign(changes,a.getMods(changes,true)));

            let dMod = Modify.getInstanceFor(dest.id);
            dMod.applyFrom(obj,changes,dest,forwards);
        }

        // apply changes from obj to me
        applyFrom(src, changes, dest, forwards) {
            // extract mirrored changes
            let mods = (this.mirror||[]).reduce( (m,p) => {
                if(changes.hasOwnProperty(p)){
                    if(forwards.includes(p)){
                        // apply relative ?
                        m[p]=changes[p];
                    } else {
                        m[p]=changes[p];
                    }
                }
                return m;
            },{});

            // apply adjustments
            this.adjustments.forEach(a => Object.assign(mods,a.getMods(mods)));

            dest.set(mods);
        }

    }

    class NullModify extends Modify {
        applyTo(obj, prev, dest){
            let sObj = simpleObj(obj);
            let changes = Object.keys(sObj).reduce( (m,p) => {
                if(sObj[p] !== prev[p]){
                    m[p]=sObj[p];
                }
                return m;
            },{});

            let dMod = Modify.getInstanceFor(dest.id);
            dMod.applyFrom(obj,changes,dest,[]);
        }

        applyFrom(src, changes, dest){
            dest.set(changes);
        }
    }

    Modify.init();

    const doSyncOn = (obj, prev) => {

        // 1. sync from what was changed to the 
        let data = lookup[obj.id];

        let target = getObj('graphic',data.target);
        let targetPrev = prev;
        if(target !== obj){
            let m = Modify.getInstanceFor(obj.id);
            m.applyTo(obj,prev,target);
            targetPrev = {};
        } 

        // apply to all conditions
        let m = Modify.getInstanceFor(target.id);
        data.conditions.forEach( c=> {
            let t = getObj('graphic',c.id);
            if(t){
                m.applyTo(target,targetPrev,t);
            }
        });
    };

    const getTopTokenForPage = (tokens, pid) => {
        let page = getObj('page',pid);
        if(page){
            let ids = tokens.map(t=>t.id);
            let id = page.get('zorder').split(/,/).filter( id => ids.includes(id)).pop();
            if(id){
                let token = tokens.find(t => t.id===id);
                if(token){
                    return token;
                }
            }
        }
        return tokens[0]; // in an error, return the first token in the list
    };

    // on add graphic, lookup represented character, if it's name begins with /^Condition:/i then do things.
    // also support decoration and mount
    const handleAddGraphic = (obj) => {
        let character = getObj('character',obj.get('represents'));
        if(character) {
            let match = character.get('name').match(/^\s*(condition|decoration|mount)\s*:/i);
            if(match) {
                // find the token it needs to glom to, assume the top token on duplicate.
                let toks = findObjs({
                    type: 'graphic',
                    layer: obj.get('layer'),
                    pageid: obj.get('pageid')
                })
                .filter((o) => o.id !== obj.id)
                .map(o=> ({overlap: isOverlappedDist(obj,o), token: o}))
                .filter((o) => false !== o.overlap)
                .sort((a,b)=>a.overlap-b.overlap);

                if(toks.length){
                    let token = toks[0].token;
                    if(toks.length>1){
                        let tList = toks.filter(o => o.overlap === toks[0].overlap).map(o=>o.token);
                        token = getTopTokenForPage(tList,obj.get('pageid'));
                    }

                    let type = match[1].toLowerCase();

                    // build conditionData
                    let conditionData = {
                        id: obj.id,
                        mirror: [...new Set([...defaults._base.mirror,...defaults[type].mirror])],
                        forward: [...new Set([...defaults._base.forward,...defaults[type].forward])],
                        adjustments: [...new Set([...defaults._base.adjustments,...defaults[type].adjustments])]
                    };
                    let match2 = character.get('name').match(/\[([^\]]*)\]/);
                    if(match2){ 
                        match2[1].split(/\s*\|\s*/).forEach(entry => {
                            let match3 = entry.match(/^\s*(mirror|forward)\s*:/i);
                            if(match3){
                                let field = match3[1].toLowerCase();

                                entry.split(/\s*[:,]\s*/).slice(1).forEach(m=>{
                                    let parts = m.match(/^([+-])?\s*(.*)\s*$/);
                                    let op = parts ? parts[1] : '';
                                    let prop = (parts ? parts[2] : '').toLowerCase();
                                    switch(op){
                                        case '-':
                                            conditionData[field] = conditionData[field].filter(p =>p!==prop);
                                            break;
                                        default:
                                            conditionData[field] = [...new Set([...conditionData[field],prop])];
                                            break;
                                    }
                                });
                            } else {
                                conditionData.adjustments.push(entry);
                            }
                        });
                        
                    }
                    if(conditionData.adjustments.includes('below')){
                        toBack(obj);
                    }
                    Modify.create(obj.id,conditionData);
                    setTimeout(()=>glomOn(conditionData,token,obj), 500);
                }
            }
        }
    };

    // on modify graphic
    const handleChangeGraphic = (obj,prev) => {
        if(lookup.hasOwnProperty(obj.id)){
            doSyncOn(obj,prev);
        } else {
            handleAddGraphic(obj);
        }
    };

    const handleDestroyGraphic = (obj) => {
        if(lookup.hasOwnProperty(obj.id)){
            let data = lookup[obj.id];
            if(data.target === obj.id){
                Modify.removeInstanceFor(obj.id);
                data.conditions.map(c=>getObj('graphic',c.id)).filter(g=>g!==undefined).forEach(g=>g.remove());
                data.conditions.forEach(c => {
                    delete lookup[c.id];
                    Modify.removeInstanceFor(c.id);
                });
                delete lookup[data.target];
                delete state.TokenCondition.registry[obj.get('pageid')][data.target];
            } else {
                data.conditions = data.conditions.filter(c => c.id !== obj.id);
                Modify.removeInstanceFor(obj.id);
                delete lookup[obj.id];
                if(!data.conditions.length){
                    Modify.removeInstanceFor(data.target);
                    delete lookup[data.target];
                    delete state.TokenCondition.registry[obj.get('pageid')][data.target];
                }
            }
        }
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

    const showHelp = (playerid) => {
        const who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
        sendChat('',`/w "${who}" `+
            _h.outer(
                _h.title('TokenCondition', version),
                _h.header(
                    _h.paragraph(`TokenCondition makes it easy to drop condition tokens onto your player and monster tokens.  Simply create a Character with a name that starts with ${_h.code('Condition:')}, such as ${_h.code('Condition: Charmed')}.  Create a Token that represents that Character and assign it to the Character as the Default Token.  When you want ot assign that condition to a Token, drag the condition Character's default token on top of it.  From then on, it will stick to the Token and any changes made to either one will be mirrored correctly.  When you're done with the condtion, just delete the Token.  You can even drag multiple condtions onto a single token. `)
                ),
                _h.subhead('Commands'),
                _h.inset(
                    _h.font.command(
                        `!token-condition`
                    ),
                    _h.paragraph( 'Display this help.')
                ),
                _h.section('Controlling Mirroring',
                    _h.paragraph(`For more fine-grained control, you can add a bracketed block to the character name and specify various ${_h.code('|')} delimited tags.`),
                    _h.paragraph(`Use the ${_h.code('mirror')} tag to specify properties to mirror.`),
                    _h.inset(
                        _h.pre(`Condition: Confused [mirror:aura1_radius]`)
                    ),
                    _h.paragraph(`The ${_h.code('mirror')} tag takes as argument a comma delimited list of properties and can include spaces around the punctuation:`),
                    _h.inset(
                        _h.pre(`Condition: Confused [mirror : aura1_radius, aura2_radius , aura1_color ,aura2_color]`)
                    ),
                    _h.paragraph(`Properties can be preceded by an operation: ${_h.code('+')}, ${_h.code('-')}`),
                    _h.ul(
                        `${_h.code('+')} -- Add the property to the list that are mirrored. (default)`,
                        `${_h.code('-')} -- Remove the property to the list that are mirrored.`
                    ),
                    _h.inset(
                        _h.pre(`Condition: Confused [mirror: -width, -height]`)
                    ),
                    _h.paragraph(`In addition to the ${_h.code('mirror')} tag, you can list several adjustments tags that are applied when mirroring properties.  Adjustment tags are separated from their adjustment by a ${_h.code(':')}.`),
                    _h.ul(
                        `${_h.code('rotation')}`,
                        `${_h.code('width')}`,
                        `${_h.code('height')}`,
                        `${_h.code('left')}`,
                        `${_h.code('top')}`
                    ),
                    _h.paragraph(`Adjustment values are prefixed with one of several operations:`),
                    _h.ul(
                        `${_h.code('=')} -- Always set the propery to this value if it would change.`,
                        `${_h.code('+')} -- Add this value to the property when it is changed.`,
                        `${_h.code('-')} -- Subtract this value from the property when it is changed.`,
                        `${_h.code(ch('*'))} -- Multipy by this value when the property is changed.`,
                        `${_h.code('/')} -- Divide by this value when the property is changed.`
                    ),
                    _h.paragraph(`For example, to have the width always 3 times larger than the target token, you could use:`),
                    _h.inset(
                        _h.pre(`Condition: Confused [width:${ch('*')}3]`)
                    ),
                    _h.paragraph(`Additionally, you could adjust the rotation to be 90 degrees further than the target token:`),
                    _h.inset(
                        _h.pre(`Condition: Confused [rotation:+90|width:${ch('*')}3]`)
                    ),
                    _h.paragraph(`Numbers can be suffixed with ${_h.code('u')}, ${_h.code('g')}, etc just like with TokenMod.`),
                    _h.paragraph(`The ${_h.code('below')} tag can be specified to cause a token to be pushed below when it is created. ${_h.bold('Note:')} This is a one time adjustment currently.`),
                    _h.paragraph(`Here is an example where the token is placed below and remains slightly larger than the target token:`),
                    _h.inset(
                        _h.pre(`Condition: Confused [below|width:${ch('*')}1.2|height:${ch('*')}1.2]`)
                    ),
                    _h.paragraph(`${_h.bold('[EXPERIMENTAL]')} The ${_h.code('forward')} tag works just like the ${_h.code('mirror')} tag, save that any changes to the listed properties are reverted after they are mirrored forward.  This is an incomplete feature which will probably get changed later, but is provided for experimentation.`)
                ),
                _h.section('Name Prefixes',
                    _h.paragraph(`In addition to the ${_h.code('Condition')} name prefix, there are several more. Prefixing with any of the following will make the character active for TokenCondition, with varying default behavior:`),
                    _h.ul(
                        `${_h.code('Condition')} -- Mirrors: left, top, width, height, lastmove, controlledby, bar1_value, bar1_max, bar1_link, bar2_value, bar2_max, bar2_link, bar3_value, bar3_max, bar3_link, represents, statusmarkers, and tint_color.`,
                        `${_h.code('Decoration')} -- Is below and mirrors: left, top, width, height, lastmove, and controlledby.`,
                        `${_h.code('Mount')} -- Is below and mirrors: left, top, width, height, lastmove, controlledby, and rotation.`
                    ),
                    _h.minorhead('Character Name Examples'),
                    _h.paragraph(`A speaking condtion that floats to the top right of a token and does not change size:`),
                    _h.inset(
                        _h.pre(`Condition: Speaking [left:+.75|top:-.75|mirror:-width,-height]`)
                    ),
                    _h.paragraph(`A spirit guardians decoration that is sized correctly and follows the token:`),
                    _h.inset(
                        _h.pre(`Decoration: Spirit Guardians [width:7g|height:7g]`)
                    ),
                    _h.paragraph(`A horse mount that is 3 times longer than it is tall, and scaled for the token that rides it.  Additionally, it's rotation is corrected to account for the direction the horse image faces:`),
                    _h.inset(
                        _h.pre(`Mount: Horse [rotation:+90|width:${ch('*')}3]`)
                    )
                )
            )
        );
    };

    const handleInput = (msg) => {
        if (msg.type === "api" && /^!token-condition($|\b)/i.test(msg.content) && playerIsGM(msg.playerid)) {
            showHelp(msg.playerid);
        }
    };

	const handleTurnOrderChange = () => {
		let handled = [];
		Campaign().set({
			turnorder: JSON.stringify(JSON.parse( Campaign().get('turnorder') || '[]').map( (turn,idx,arr) => {
				if(lookup.hasOwnProperty(turn.id)){
					let data = lookup[turn.id];
					if(data.target !== turn.id){
						if(handled.includes(data.target)){
							return;
						}
						let turns = arr.filter( e => e.id === data.target);
						if(turns.length !== 0){
							return;
						}
						handled.push(data.target);
						return {
							id: data.target,
							pr: turn.pr,
							custom: turn.custom
						};
					}
				}
                return turn;
			}).filter(t => t !== undefined)
		)});
	};

    const registerEventHandlers = () => {
        on('add:graphic', handleAddGraphic);
        on('change:graphic', handleChangeGraphic);
        on('destroy:graphic', handleDestroyGraphic);
        on('chat:message', handleInput);

        on('change:campaign:turnorder',handleTurnOrderChange);

        if('undefined' !== typeof GroupInitiative && GroupInitiative.ObserveTurnOrderChange){
            GroupInitiative.ObserveTurnOrderChange(handleTurnOrderChange);
        }
        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(handleChangeGraphic);
        }
    };

    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });

    return {
        // Public interface here
    };

})();

