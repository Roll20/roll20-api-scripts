// Github:   https://github.com/shdwjk/Roll20API/blob/master/UDLWindows/UDLWindows.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{};
API_Meta.UDLWindows={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.UDLWindows.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const UDLWindows = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'UDLWindows';
  const version = '0.1.1';
  API_Meta.UDLWindows.version = version;
  const lastUpdate = 1609292809;
  const schemaVersion = 0.1;

  const assureHelpHandout = (create = false) => {
    if(state.TheAaron && state.TheAaron.config && (false === state.TheAaron.config.makeHelpHandouts) ){
      return;
    }
    const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385";

    // find handout
    let props = {type:'handout', name:`Help: ${scriptName}`};
    let hh = findObjs(props)[0];
    if(!hh) {
      hh = createObj('handout',Object.assign(props, {avatar: helpIcon}));
      create = true;
    }
    if(create || version !== state[scriptName].lastHelpVersion){
      hh.set({
        notes: helpParts.helpDoc({who:'handout',playerid:'handout'})
      });
      state[scriptName].lastHelpVersion = version;
      log('  > Updating Help Handout to v'+version+' <');
    }
  };

  const checkInstall = () =>  {
    log(`-=> ${scriptName} v${version} <=-  [${new Date(lastUpdate*1000)}]`);

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
      log(`  > Updating Schema to v${schemaVersion} <`);
      switch(state[scriptName] && state[scriptName].version) {

        case 0.1:
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
    assureHelpHandout();
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
      experimental: () => `<div style="display:inline-block;padding: .1em 1em; border: 1px solid #993333; border-radius:.5em;background-color:#cccccc;color:#ff0000;">Experimental</div>`,
      items: (o) => `<li>${o.join('</li><li>')}</li>`,
      ol: (...o) => `<ol>${_h.items(o)}</ol>`,
      ul: (...o) => `<ul>${_h.items(o)}</ul>`,
      grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}<div style="clear:both;"></div></div>`, 
      cell: (o) =>  `<div style="width: 200px; padding: 0 3px; float: left;">${o}</div>`,
      statusCell: (o) =>  {
          let text = `${o.getName()}${o.getName()!==o.getTag()?` [${o.getTag()}]`:''}`;
          return `<div style="width: auto; padding: .2em; margin: .1em .25em; border: 1px solid #ccc; border-radius: .25em; background-color: #eee; line-height:1.5em; height: 1.5em;float:left;">${o.getHTML()}${text}</div>`;
      },
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


  const helpParts = {
    helpBody: (/*context*/) => _h.join(
      _h.header(
        _h.paragraph(`${scriptName} converts path objects to paths that don't block vision but do block movement.`)
        ),
        _h.subhead('Commands'),
        _h.inset(
          _h.font.command(
            `!to-window`,
            _h.optional(
              '--help'
            )
          ),
          _h.ul(
            `${_h.bold('--help')} -- Displays this help`,
            )
        ),
        _h.section('Usage',
          _h.paragraph(`Select path objects on the Dynamic Lighting Layer and run the ${_h.code('!to-window')} command.  Each of the path objects will get replaced with a version that won't block vision or light, but will block movement.  The original objects are removed in the process.`),
          _h.paragraph(`This works with poly lines, boxes, and circles.`)
        )
    ),
    helpDoc: (context) => _h.join(
      _h.title(scriptName, version),
      helpParts.helpBody(context)
    ),

    helpChat: (context) => _h.outer(
      _h.title(scriptName, version),
      helpParts.helpBody(context)
    )
  };

  const showHelp = function(playerid) {
    let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
    let context = {
      who,
      playerid
    };
    sendChat('', '/w "'+who+'" '+ helpParts.helpChat(context));
  };






  const isCirclePath = (p) => {
    if('path' === p.get('type')){
      return 'MCCCC' === JSON.parse(p.get('path')||'[]').map(s=>s[0]).join('');
    }
    return false;
  };

  const approximateCircle = (w,h) => {
    const w2=w/2;
    const h2=h/2;
    // const at = (dx) => Math.sqrt( (1 - ((dx*dx)/(w2)*(w2)))*((h2)*(h2)));
    const at = (theta) => ({x: Math.cos(theta)*w2, y: Math.sin(theta)*h2}); 
    const steps = Math.min(Math.max(Math.round( (Math.PI*2*Math.sqrt((w2*w2+h2*h2)/2))/35),4),50);
    const stepSize = Math.PI/(2*steps);
    let acc=[[],[],[],[]];
    let th=0;
    _.times(steps+1,()=>{
      let pt=at(th);
      acc[0].push([pt.x,pt.y]);
      acc[1].push([-pt.x,pt.y]);
      acc[2].push([-pt.x,-pt.y]);
      acc[3].push([pt.x,-pt.y]);
      th+=stepSize;
    });
    acc = acc[0].concat(
      acc[1].reverse().slice(1),
      acc[2].slice(1),
      acc[3].reverse().slice(1)
    );
    return acc.map((v,i)=>([(i?'L':'M'),w2+v[0],h2+v[1]]));
  };

  const isClosedPath = (p) => {
    let x1 = p[0][1];
    let y1 = p[0][2];
    let x2 = p.slice(-1)[0][1];
    let y2 = p.slice(-1)[0][2];
    return ((x1 === x2) && (y1 === y2));
  };

  const retracePath = (data) => {
    let newData = [...data, ...data.slice().reverse().slice(1)];
    let lIdx = newData.length-1;
    newData[lIdx] = ['L', newData[lIdx][1],newData[lIdx][2]];
    return newData;
  };

  const toFreehandPath = (data) => {
    let newData = [data.shift()];
    data.forEach(p=>{
      newData.push(['Q',p[1],p[2],p[1],p[2]]);
    });

    return newData;
  };

  const simpleObject = (o)=>JSON.parse(JSON.stringify(o));

  const convertToFreehandWindow = (p)=>{
    let data;
    if(isCirclePath(p)){
      data = approximateCircle(p.get('width'),p.get('height'));
    } else {
      data = JSON.parse(p.get('path'));
    }
    if(!isClosedPath(data)){
      data = retracePath(data);
    }
    data = toFreehandPath(data);
    let objData ={
      ...simpleObject(p),
      path: JSON.stringify(data)
    };
    objData.page = objData._page;
    delete objData._path;
    delete objData._id;
    delete objData._type;
    delete objData._page;

    let newPath = createObj('path', objData);
    if(newPath) {
      p.remove();
    }
  };

  const handleInput = (msg) => {
    if('api'===msg.type && /^!to-window(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)){
      let args = msg.content.split(/\s+--/);

      let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

      if(args.includes('help')){
        showHelp(msg.playerid);
        return;
      }

      let paths = (msg.selected || [])
        .map(o=>getObj('path',o._id))
        .filter(g=>undefined !== g)
        .filter(o=>'walls'===o.get('layer'))
        ;

      if(paths.length){
        let page = getObj('page',paths[0].get('pageid'));
        if(page) {
          if(true === page.get('dynamic_lighting_enabled')){
            paths.map(convertToFreehandWindow);
            sendChat('UDLWindows',`/w "${who}" Converted ${paths.length} path${1===paths.length?'':'s'}.`);
          } else {
            sendChat('UDLWindows',`/w "${who}" UDLWindows only works with Updated Dynamic Lighting.  Please enable Updated Dynamic Lighting on the current page to use it.`);
          }
        }
      } else {
        sendChat('UDLWindows',`/w "${who}" Select 1 or more paths on the Dynamic Lighting Layer to convert.`);
      }
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
  };

  on('ready', () => {
    checkInstall();
    registerEventHandlers();
  });

  return {
    // Public interface here
  };

})();

{try{throw new Error('');}catch(e){API_Meta.UDLWindows.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.UDLWindows.offset);}}
