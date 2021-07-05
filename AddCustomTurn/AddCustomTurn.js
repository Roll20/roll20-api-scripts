// Github:   https://github.com/shdwjk/Roll20API/blob/master/AddCustomTurn/AddCustomTurn.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.AddCustomTurn={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.AddCustomTurn.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const AddCustomTurn = (() => { // eslint-disable-line no-unused-vars
  const scriptName = "AddCustomTurn";
  const version = '0.1.1';
  API_Meta.AddCustomTurn.version = version;
  const lastUpdate = 1625442265; // eslint-disable-line no-unused-vars
  const schemaVersion = 0.1;

  const DEFAULT_NAME = '[Custom Turn]';

  const checkInstall = () =>  {
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
      log(`  > Updating Schema to v${schemaVersion} <`);
      switch(state[scriptName] && state[scriptName].version) {

        case 0.0:
          /* break; // intentional dropthrough */ /* falls through */

        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion
          };
          break;
      }
    }
  };

  /* eslint-disable no-unused-vars */
  const getTurnArray = () => ( '' === Campaign().get('turnorder') ? [] : JSON.parse(Campaign().get('turnorder')));
  const getTurnArrayFromPrev = (prev) => ( '' === prev.turnorder ? [] : JSON.parse(prev.turnorder));
  const setTurnArray = (ta) => Campaign().set({turnorder: JSON.stringify(ta)});
  const addTokenTurn = (id, pr) => setTurnArray([...getTurnArray(), {id,pr}]);
  const addCustomTurn = (custom, pr) => setTurnArray([...getTurnArray(), {id:"-1",custom,pr}]);
  const removeTokenTurn = (tid) => setTurnArray(getTurnArray().filter( (to) => to.id !== tid));
  const removeCustomTurn = (custom) => setTurnArray(getTurnArray().filter( (to) => to.custom !== custom));
  const clearTurnOrder = () => Campaign().set({turnorder:'[]'});
  const sorter_asc = (a, b) => a.pr - b.pr;
  const sorter_desc = (a, b) => b.pr - a.pr;
  const sortTurnOrder = (sortBy = sorter_desc) => Campaign().set({turnorder: JSON.stringify(getTurnArray().sort(sortBy))});
  /* eslint-enable no-unused-vars */

  const checkFormulaOnTurn = (prevTo) => {
    let to=getTurnArray();
    if(to.length && to[0].id==='-1' && prevTo[0].custom !== to.custom){
      sendChat('',`[[${to[0].pr}+(${to[0].formula||0})]]`,(r)=>{
        to[0].pr=r[0].inlinerolls[0].results.total;
        setTurnArray(to);
        handleTurnorderChange(to,prevTo);
      });
    }
  };

  const opToText = (op) => {
    switch(op){
      case 'LT': return 'less than';
      case 'LE': return 'less than or equal to';
      case 'EQ': return 'equal to';
      case 'GE': return 'greater than or equal to';
      case 'GT': return 'greater than';
      default: return '';
    }
  };

  const describeAutoDelete = (entry) =>{
    if(entry.autoDelete){
      let dc =(entry.deleteCondition||{});
      return `Delete when ${opToText(dc.op)} ${dc.val||0}.`;
    }
    return '';
  };

  const outputEvent = (event, entry, who) =>{
    switch(event){
      case 'expire': {
          if(!playerIsGM(entry.player)){
            sendChat('ACT',`/w gm <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;"><b>${entry.custom}</b> expired and was removed.</div></div>`);
          }
          sendChat('ACT',`/w "${who||entry.who}" <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;"><b>${entry.custom}</b> expired and was removed.</div></div>`);
        }
        break;

      case 'remove': {
          if(!playerIsGM(entry.player)){
            sendChat('ACT',`/w gm <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;"><b>${entry.custom}</b> was removed.</div></div>`);
          }
          sendChat('ACT',`/w "${who||entry.who}" <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;"><b>${entry.custom}</b> was removed.</div></div>`);
        }
        break;

      case 'add': {
          sendChat('ACT',`/w gm <div style="padding:1px 3px;border: 1px solid #8B4513;background: #eeffee; color: #8B4513; font-size: 80%;"><div style="background-color: #ffeeee;"><b>${who||entry.who}</b> added custom turn: <b>${entry.custom}</b> at <b>${entry.pr}</b> (<b>${entry.formula}</b>). ${describeAutoDelete(entry)}</div></div>`);
        }
        break;

    }
  };

  const isDeleteCondition = (entry) => {
    if(entry.autoDelete){
      let dc =(entry.deleteCondition||{});
      switch(dc.op){
        case 'LT': return (parseInt(entry.pr)<dc.val);
        case 'LE': return (parseInt(entry.pr)<=dc.val);
        case 'EQ': return (parseInt(entry.pr)==dc.val);
        case 'GE': return (parseInt(entry.pr)>=dc.val);
        case 'GT': return (parseInt(entry.pr)>dc.val);
      }
    }
  };

  const handleTurnorderChange = (to,p)=>{
    if(!Array.isArray(p)) {
      to=getTurnArray();
      p = getTurnArrayFromPrev(p);
    }
    if(to.length && to[0].id==='-1' && to[0].custom !== p[0].custom && isDeleteCondition(to[0])){
      setTurnArray(to.slice(1));
      outputEvent('delete',to[0]);
    }
  };

  const processInlinerolls = (msg) => {
    if(msg.hasOwnProperty('inlinerolls')){
      return msg.inlinerolls
      .reduce((m,v,k) => {
        let ti=v.results.rolls.reduce((m2,v2) => {
          if(v2.hasOwnProperty('table')){
            m2.push(v2.results.reduce((m3,v3) => [...m3,v3.tableItem.name],[]).join(", "));
          }
          return m2;
        },[]).join(', ');
        return [...m,{k:`$[[${k}]]`, v:(ti.length && ti) || v.results.total || 0}];
      },[])
      .reduce((m,o) => m.replace(o.k,o.v), msg.content);
    } else {
      return msg.content;
    }
  };


  const ch = (c) => {
    const entities = {
      '<' : 'lt',
      '>' : 'gt',
      '&' : 'amp',
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
    join: (...o) => o.join(' '),
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
    sendChat('',`/w "${who}" ${
      _h.outer(
        _h.title(scriptName,version),
        _h.header(
          _h.paragraph(`${scriptName} provides an easy way to add (and remove) custom turns which increment or decrement, and have auto delete features.`)
        ),
        _h.subhead('Commands'),
        _h.inset(
          _h.font.command(
            `!act`,
            _h.optional(
              _h.required('formula'),
              _h.optional(
                _h.required('initial')
              )
            ),
            _h.required(`--${_h.required('custom turn name')}`),
            _h.optional(
              `--delete-on-zero`,
              `--delete-lt ${_h.required('number')}`,
              `--delete-le ${_h.required('number')}`,
              `--delete-eq ${_h.required('number')}`,
              `--delete-ge ${_h.required('number')}`,
              `--delete-gt ${_h.required('number')}`,
              `--after`,
              `--index ${_h.required('number')}`,
              `--help`
            )
          ),
          _h.paragraph('Add a custom turn to the Turn Order, with options for adjusting it each turn, and removing it when it has a specified value.'),
          _h.minorhead('Positional Arguments'),
          _h.ul(
            `${_h.bold(_h.required('formula'))} -- The formula for changing the turn. ${_h.code('+')} or ${_h.code('-')} prepended to the number specify the direction. (${_h.bold('Default')}: ${_h.code('+1')} )`,
            `${_h.bold(_h.required('initial'))} -- The initial value for the custom turn. (${_h.bold('Default')}: ${_h.code('0')} )`
          ),
          _h.minorhead('Dash Arguments'),
          _h.ul(
            `${_h.bold(`--${_h.required('custom turn name')}`)} -- The name of the custom turn to add.`,
            `${_h.bold('--delete-on-zero')} -- deletes the custom turn when its value is less than or equal to 0.  Shorthand for ${_h.code('--delete-le 0')}.`,
            `${_h.bold(`--delete-lt ${_h.required('number')}`)} -- deletes the custom turn when its value is less than ${_h.code(_h.required('number'))}.`,
            `${_h.bold(`--delete-le ${_h.required('number')}`)} -- deletes the custom turn when its value is less than or equal to ${_h.code(_h.required('number'))}.`,
            `${_h.bold(`--delete-eq ${_h.required('number')}`)} -- deletes the custom turn when its value is equal to ${_h.code(_h.required('number'))}.`,
            `${_h.bold(`--delete-ge ${_h.required('number')}`)} -- deletes the custom turn when its value is greater than or equal to ${_h.code(_h.required('number'))}.`,
            `${_h.bold(`--delete-gt ${_h.required('number')}`)} -- deletes the custom turn when its value is greater than ${_h.code(_h.required('number'))}.`,
            `${_h.bold(`--after`)} -- adds the custom turn after the current turn.  Shorthand for ${_h.code('--index 1')}.`,
            `${_h.bold(`--index ${_h.required('number')}`)} -- adds the custom turn after the entry at index ${_h.code(_h.required('number'))}.`,
            `${_h.bold('--help')} -- Shows the Help screen.`
          ),
          _h.paragraph(''),
          _h.font.command(
            `!dct`,
            _h.optional(
              `${_h.required('custom turn name')}`,
              `--help`
            )
          ),
          _h.paragraph('Remove a custom turn from the turn order by name.  When used by the GM, removes the first custom turn with the given name.  When used by a player, removes the first custom turn they created with the given name.'),
          _h.minorhead('Positional Arguments'),
          _h.ul(
            `${_h.bold(_h.required('custom turn name'))} -- The name of the custom turn to remove.`
          ),
          _h.minorhead('Dash Arguments'),
          _h.ul(
            `${_h.bold('--help')} -- Shows the Help screen.`
          ),
          _h.paragraph('')
        ),
        _h.subhead('Examples'),
        _h.inset(
          _h.paragraph(`Add a turn that just counts up.  Custom turn names can contain spaces:`),
          _h.inset(
            _h.pre('!act --Counter for Rounds')
          ),
          _h.paragraph(`Add a turn that counts down from 10:`),
          _h.inset(
            _h.pre('!act -1 10 --Bless')
          ),

          _h.paragraph(`Add a turn that counts down from 10 and is after the first item in the turn order (All examples are the same):`),
          _h.inset(
            _h.pre('!act -1 10 --Bless --after'),
            _h.pre('!act -1 10 --Bless --index 1'),
            _h.pre('!act -1 10 --after --Bless'),
            _h.pre('!act -1 10 --index 1 --Bless')
          ),

          _h.paragraph(`Add a turn that counts down from 10 and removes itself when it reaches 0 (All examples are the same):`),
          _h.inset(
            _h.pre('!act -1 10 --Bless [Bob the Slayer] --delete-on-zero'),
            _h.pre('!act -1 10 --Bless [Bob the Slayer] --delete-le 0'),
            _h.pre('!act -1 10 --delete-on-zero --Bless [Bob the Slayer]'),
            _h.pre('!act -1 10 --delete-le 0 --Bless [Bob the Slayer]')
          ),

          _h.paragraph(`Supports multi-line syntax by wrapping with ${_h.code('{{')} and ${_h.code('}}')}:`),
          _h.inset(
            _h.preformatted(
              '!act -1 10 {{',
              '  --Bless [Bob the Slayer]',
              '  --delete-on-zero',
              '  --after',
              '}}'
            )
          ),

          _h.paragraph(`Removing a turn named ${_h.code("Bless")}:`),
          _h.inset(
            _h.pre('!dct Bless')
          ),

          _h.paragraph(`Removing a turn named ${_h.code("Bless [Bob the Slayer]")}:`),
          _h.inset(
            _h.pre('!dct Bless [Bob the Slayer]')
          )
        )
      )
    }`);
  };

  const handleInput = (msg) => {

    if('api' === msg.type) {
      if(msg.content.match(/^!act(\b\s|$)/) ){
        let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

        let args = processInlinerolls(msg)
          .replace(/<br\/>\n/g, ' ')
          .replace(/(\{\{(.*?)\}\})/g," $2 ")
          .split(/\s+--/);

        let cmds=args.shift().split(/\s+/);
        let change=parseFloat(cmds[1]);
        change = Number.isNaN(change) ? '+1' : change;
        change = `${/^[+-]\d/.test(change)?'':'+'}${change}`;
        let initial = parseFloat(cmds[2])||0;
        let entry = {
          id: "-1",
          pr: initial,
          formula: change,
          custom: DEFAULT_NAME,
          autoDelete: false,
          player: msg.playerid,
          who: who,
          source: 'AddCustomTurn'
        };
        let idx = 0;

        args.forEach(a=>{
          let parts = a.split(/\s+/);
          switch(parts[0].toLowerCase()){
            case 'help':
              return showHelp(who);

            case 'after':
              idx = 1;
              break;

            case 'index':
              idx = parseInt(parts[1])||0;
              break;

            case 'delete-on-zero': 
              entry.autoDelete = true;
              entry.deleteCondition = { op: 'LE', val: 0};
              break;

            case 'delete-lt':
              entry.autoDelete = true;
              entry.deleteCondition = { op: 'LT', val: parseInt(parts[1])};
              break;

            case 'delete-le':
              entry.autoDelete = true;
              entry.deleteCondition = { op: 'LE', val: parseInt(parts[1])};
              break;

            case 'delete-eq':
              entry.autoDelete = true;
              entry.deleteCondition = { op: 'EQ', val: parseInt(parts[1])};
              break;

            case 'delete-ge':
              entry.autoDelete = true;
              entry.deleteCondition = { op: 'GE', val: parseInt(parts[1])};
              break;

            case 'delete-gt':

              entry.autoDelete = true;
              entry.deleteCondition = { op: 'GT', val: parseInt(parts[1])};
              break;

            default: {
                let custom = parts.join(' ');
                if(DEFAULT_NAME === entry.custom){
                  entry.custom = custom;
                }
              }
              break;
          }
        });

        if(DEFAULT_NAME !== entry.custom){
          let to=getTurnArray();
          setTurnArray([...to.slice(0,idx),entry,...to.slice(idx)]);

          if(!playerIsGM(msg.playerid)){
            outputEvent('add',entry);
          }
        } else {
          showHelp(who);
        }
      } else if(msg.content.match(/^!eot/i)){
        let to=getTurnArray();
        setTimeout(()=>checkFormulaOnTurn(to),100);
      } else if(msg.content.match(/^!dct(\b\s|$)/i)){
        let who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
        let args = processInlinerolls(msg)
          .replace(/<br\/>\n/g, ' ')
          .replace(/(\{\{(.*?)\}\})/g," $2 ")
          .split(/\s+--/);

        let cmds=args.shift().split(/\s+/);
        let ctname=cmds.slice(1).join(' ');
        if(ctname.length){
          let to = getTurnArray();
          let pigm = playerIsGM(msg.playerid);
          let idx = to.findIndex(e=>e.custom === ctname && (pigm || e.player === msg.playerid));
          if(-1 !== idx) {
            let e = to[idx];
            to = [...to.slice(0,idx),...to.slice(idx+1)];
            setTurnArray(to);
            outputEvent('remove',e);
          }
        } else {
          showHelp(who);
        }
      }
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:campaign:turnorder',handleTurnorderChange);
  };

  on('ready', () => {
    checkInstall();
    registerEventHandlers();
  });

  return {
    // Public interface here
  };

})();


{try{throw new Error('');}catch(e){API_Meta.AddCustomTurn.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.AddCustomTurn.offset);}}
