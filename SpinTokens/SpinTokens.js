// Github:   https://github.com/shdwjk/Roll20API/blob/master/SpinTokens/SpinTokens.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const SpinTokens = (()=>{ // eslint-disable-line no-unused-vars

  const scriptName = "SpinTokens";
  const version = '0.4.3';
  const lastUpdate = 1599507725;
  const schemaVersion = 0.2;
  const stepRate = 200;
  const defaultSecondsPerCycle = 20;
  const millisecondsPerSecond = 1000;

//  let spinInterval = false;

  const checkInstall = () => {
        log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

        if( ! _.has(state,scriptName) || state[scriptName].version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            switch(state[scriptName] && state[scriptName].version) {
              case 0.1:
                Object.keys(state[scriptName].spinners)
                  .forEach(id => state[scriptName].spinners[id] = {
                    ...state[scriptName].spinners[id],
                    angle: false,
                    base: false,
                    direction: 1
                  });

                /* break; // intentional dropthrough */ /* falls through */

              case 'UpdateSchemaVersion':
                state[scriptName].version = schemaVersion;
                break;

              default:
                state[scriptName] = {
                  version: schemaVersion,
                  spinners: {}
                };
                break;
            }
        }

       /* spinInterval = */ setInterval(animateRotation,stepRate);
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

  const showHelp = (who) => {
        sendChat('', `/w "${who}" ` +
          _h.outer(
            _h.title('SpinTokens', version),
            _h.header(
              _h.paragraph('SpinTokens provides a way to toggle tokens to be spinning at various rates.  GMs can spin any tokens, while players are limited to the tokens they can control.')
            ),
            _h.subhead('Commands'),
            _h.inset(
              _h.font.command(
                `!spin-start`,
                _h.optional(`Seconds Per Cycle`),
                _h.optional(`Angle Restriction`),
                _h.optional(`--help`, 
                  _h.optional(
                    `--ids`,
                    _h.required(`token_id`),
                    _h.optional(`${_h.required(`token_id`)} ...`)
                  )
                )
              ),
              _h.paragraph('Starts all specified tokens spinning.  Tokens are specified by selecting them, and optionally by specifying their token_ids using the --ids argument.'),
              _h.ul(
                `${_h.bold('Seconds Per Cycle')} -- specifies how fast the tokens should spin.  This is the number of seconds before the token spins around in one complete circle.  A second hand would use the number ${_h.code('60')}, for example.  For a restricted angle, this is how long it takes to make one forward and backward sweep.`,
                `${_h.bold('Angle Restriction')} -- restricts the rotation to the specified angle.  ${_h.code('180')} will restrict the sweep to only half a circle.`,
                `${_h.bold('--ids')} -- specifies additional tokens to apply the spin to.`,
                `${_h.bold('--help')} -- shows this help message.`
              ),
              _h.font.command(
                `!spin-stop`,
                _h.optional(`--help`, 
                  _h.optional(
                    `--ids`,
                    _h.required(`token_id`),
                    _h.optional(`${_h.required(`token_id`)} ...`)
                  )
                )
              ),
              _h.paragraph('Stops all specified tokens from spinning.  Tokens are specified by selecting them, and optionally by specifying their token_ids using the --ids argument.'),
              _h.ul(
                `${_h.bold('--ids')} -- specifies additional tokens to apply the spin to.`,
                `${_h.bold('--help')} -- shows this help message.`
              )
            )
          )
        );
    };

    const processInlinerolls = (msg) => {
        if(_.has(msg,'inlinerolls')){
            return _.chain(msg.inlinerolls)
                .reduce(function(m,v,k){
                    let ti=_.reduce(v.results.rolls,function(m2,v2){
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
        } else {
            return msg.content;
        }
    };

    const startSpinning = (rate,token,angle) => {
      state[scriptName].spinners[token.id]={
        id: token.id,
        angle: (angle ? angle : false),
        base: parseInt(token.get('rotation')),
        page: token.get('pageid'),
        rate: rate*millisecondsPerSecond
      };
    };

    const stopSpinning = (token) => {
      delete state[scriptName].spinners[token.id];
    };


    const playerCanControl = (obj, playerid='any') => {
        const playerInControlledByList = (list, playerid) => list.includes('all') || list.includes(playerid) || ('any'===playerid && list.length);
        let players = obj.get('controlledby')
            .split(/,/)
            .filter(s=>s.length);

        if(playerInControlledByList(players,playerid)){
            return true;
        }

        if('' !== obj.get('represents') ) {
            players = (getObj('character',obj.get('represents')) || {get: function(){return '';} } )
                .get('controlledby').split(/,/)
                .filter(s=>s.length);
            return  playerInControlledByList(players,playerid);
        }
        return false;
    };

    const bound = (n,m,M)=>Math.min(M,Math.max(m,n));

    const handleInput = (msg) => {
      let match = msg.content.match(/^!spin-start|stop(?:\b\s|$)/);
      if ( "api" === msg.type && match) {

        let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        let args = processInlinerolls(msg).split(/\s+--/);

        let ids = (msg.selected || []).map(o=>o._id);

        let secondsPerCycle = defaultSecondsPerCycle;
        let restrictedAngle = false;
        let operation = ()=>{};
        let GMAuthority = playerIsGM(msg.playerid) || 'API' === msg.playerid;
        let exitWithHelp = false;

        args.forEach((a)=>{
          let cmds = a.split(/\s+/);
          switch(cmds[0]){
              case 'ids':
                ids = [...new Set([
                  ...ids,
                  ...cmds.slice(1)
                ])];
                break;

              case 'help':
                exitWithHelp = true;
                break;

              case '!spin-start':
                secondsPerCycle = parseFloat(cmds[1]) || secondsPerCycle;
                restrictedAngle = parseFloat(cmds[2]);
                if(restrictedAngle){
                  restrictedAngle = bound(restrictedAngle,0,360);
                }
                operation = (o)=>startSpinning(secondsPerCycle,o,restrictedAngle);
                break;

              case '!spin-stop':
                operation = stopSpinning;
                break;
          }
        });

        if(exitWithHelp || !ids.length){
          showHelp(who);
          return;
        }

        let tokens = (ids)
          .map(id=>getObj('graphic',id))
          .filter(g=>undefined !== g)
          .filter((o)=> GMAuthority || playerCanControl(o,msg.playerid))
          ;


        tokens.forEach(operation);
      }
    };


  const getActivePages = () => [...new Set([
      Campaign().get('playerpageid'),
      ...Object.values(Campaign().get('playerspecificpages')),
      ...findObjs({
        type: 'player',
        online: true
      })
      .filter((p)=>playerIsGM(p.id))
      .map((p)=>p.get('lastpage'))
    ])
  ];

	const animateRotation = () => {
		var pages = getActivePages();

		_.chain(state.SpinTokens.spinners)
			.filter(o=>pages.includes(o.page))
			.each(function(sdata){
				var s = getObj('graphic',sdata.id);

				if(!s) {
					delete state.SpinTokens.spinners[sdata.id];
				} else {
                    if(sdata.angle){
                      let p = (4*((Date.now()%sdata.rate)/sdata.rate ));
                      if(p>2) {
                        p=3-p;
                      } else {
                        p-=1;
                      }
                        s.set({
                            rotation: (sdata.base + ((sdata.angle/2)*p))
                        });
                    } else {
                        s.set({
                            rotation: (( (Date.now()%sdata.rate)/sdata.rate )*360)
                        });
                    }
				}
			});

	};

	const handleTokenDelete = (obj) => {
		var found = _.findWhere(state.SpinTokens.spinners, {id: obj.id});
		if(found) {
			delete state.SpinTokens.spinners[obj.id];
		}
	};


	const registerEventHandlers = () => {
		on('chat:message', handleInput);
		on('destroy:graphic', handleTokenDelete);
	};

    on("ready",() => {
        checkInstall();
        registerEventHandlers();
    });

	return {
	};

})();

