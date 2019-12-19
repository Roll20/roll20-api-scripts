// Github:   https://github.com/shdwjk/Roll20API/blob/master/TokenCondition/TokenCondition.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global GroupInitiative TokenMod */
const TokenCondition = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.0';
    const lastUpdate = 1576735908;
    const schemaVersion = 0.1;

    let lookup = {};

    const mirroredProps = [
            'left', 'top', 'width', 'height', 'rotation',
            'flipv', 'fliph', 'bar1_value', 'bar1_max',
            'bar2_value', 'bar2_max', 'bar3_value', 'bar3_max',
            'tint_color', 'lastmove', 'controlledby', 'light_hassight',
            'light_radius', 'light_dimradius', 'light_angle', 'light_losangle','lastmove',
            'represents','bar1_link','bar2_link','bar3_link','statusmarkers'
        ];


    const createLookup = () => {
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
                        .map(id=>getObj('graphic',id))
                        .filter(g=>undefined!==g)
                        .map(g=>g.id);
                        state.TokenCondition.registry[o.pid][o.tid].conditions = conds;
                    if(conds.length){
                        lookup[target.id]=state.TokenCondition.registry[o.pid][o.tid];
                        conds.forEach(c=>lookup[c]=state.TokenCondition.registry[o.pid][o.tid]);
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

                case 0.1:
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

        createLookup();
    };

    const isOverlapped = (obj1, obj2) => {
        let dx = Math.abs(obj1.get('left')-obj2.get('left'));
        let dy = Math.abs(obj1.get('top')-obj2.get('top'));
        let lx = ((0+obj1.get('width') + obj2.get('width'))/2);
        let ly = ((0+obj1.get('height') + obj2.get('height'))/2);
        
        return dx < lx && dy < ly;
    };

    const glomOn = (condition, target) => {
        let pid = target.get('pageid');
        if(!state.TokenCondition.registry.hasOwnProperty(pid)){
            state.TokenCondition.registry[pid] = {};
        }
        if(!state.TokenCondition.registry[pid].hasOwnProperty(target.id)){
            // fresh
            state.TokenCondition.registry[pid][target.id] = {
                target: target.id,
                conditions: [condition.id]
            };
            lookup[target.id] = state.TokenCondition.registry[pid][target.id];
        } else {
            state.TokenCondition.registry[pid][target.id].conditions.push(condition.id);
        }
        lookup[condition.id] = state.TokenCondition.registry[pid][target.id];

        doSyncOn(state.TokenCondition.registry[pid][target.id]);
    };

    const syncGraphic = (obj,id) => {
        if(obj.id !== id){
            let dst = getObj('graphic',id);
            if(dst){
               dst.set(mirroredProps.reduce((m,p)=>{
                   m[p]=obj.get(p);
                   return m;
                },{}));
            }
        }
    };

    const doSyncOn = (data, changed) => {
        let source = changed;
        if(!source){
            source = getObj('graphic', data.target);
        }

        syncGraphic(source, data.target);
        data.conditions.forEach(c=>syncGraphic(source,c));
    };

    // on add graphic, lookup represented character, if it's name begins with /^Condition:/i then do things.
    const handleAddGraphic = (obj) => {
        let character = getObj('character',obj.get('represents'));
        if(character && /^condition:/i.test(character.get('name'))){
            // find the token it needs to glom to, assume the top token on duplicate.
            let toks = findObjs({
                type: 'graphic',
                layer: obj.get('layer'),
                pageid: obj.get('pageid')
            })
            .filter((o) => o.id !== obj.id)
            .filter((o) => isOverlapped(obj,o));
            if(toks.length){
                glomOn(obj,toks[0]);
            }
        }
    };

    // on modify graphic
    const handleChangeGraphic = (obj) => {
        if(lookup.hasOwnProperty(obj.id)){
            doSyncOn(lookup[obj.id],obj);
        } else {
            handleAddGraphic(obj);
        }
    };

    const handleDestroyGraphic = (obj) => {
        if(lookup.hasOwnProperty(obj.id)){
            let data = lookup[obj.id];
            if(data.target === obj.id){
                data.conditions.map(id=>getObj('graphic',id)).filter(g=>g!==undefined).forEach(g=>g.remove());
                data.conditions.forEach(id=> delete lookup[id]);
                delete lookup[data.target];
                delete state.TokenCondition.registry[obj.get('pageid')][data.target];
            } else if( data.conditions.includes(obj.id)){
                data.conditions = data.conditions.filter(id => id !== obj.id);
                delete lookup[obj.id];
                if(!data.conditions.length){
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
					return turn;
				}
			}).filter(t => t !== undefined)
		)});
	};

    const registerEventHandlers = () => {
        on('add:graphic', handleAddGraphic);
        on('change:graphic', handleChangeGraphic);
        on('destroy:graphic', handleDestroyGraphic);
        on('chat:message', handleInput);

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

