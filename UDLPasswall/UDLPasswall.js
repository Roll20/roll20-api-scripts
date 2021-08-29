// Github:   https://github.com/shdwjk/Roll20API/blob/master/UDLPasswall/UDLPasswall.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{};
API_Meta.UDLPasswall={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.UDLPasswall.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const UDLPasswall = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'UDLPasswall';
  const version = '0.1.0';
  API_Meta.UDLPasswall.version = version;
  const lastUpdate = 1616879940;
  const schemaVersion = 0.1;

  const ENDS   = Symbol('ENDS');
  const LOWER  = Symbol('LOWER');
  const MIDDLE = Symbol('MIDDLE');
  const UPPER  = Symbol('UPPER');

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
        _h.paragraph(`${scriptName} converts path objects to paths that block vision but don't block movement.  This requires twice the space of the opening to make the full distance open.  The excess space is spread to either side by default, but can be grouped on one side or the other, or can only require part of the space if you don't mind having some movement blocking in the middle.`)
        ),
        _h.subhead('Commands'),
        _h.inset(
          _h.font.command(
            `!to-passwall`,
            _h.optional(
              '--help',
              '--ends',
              '--lower',
              '--top-left',
              '--upper',
              '--bottom-right',
              `--middle`
            )
          ),
          _h.ul(
            `${_h.bold('--help')} -- Displays this help`,
            `${_h.bold('--ends')} -- Places the excess wall on either side of the opening evenly. ${_h.bold('Default')}`,
            `${_h.bold('--lower')} -- Places the excess wall toward the top-left (lower coordinate numbers)`,
            `${_h.bold('--top-left')} -- the same as ${_h.code('--lower')} but possibly easier to remember`,
            `${_h.bold('--upper')} -- Places the excess wall toward the bottom-right (higher coordinate numbers)`,
            `${_h.bold('--bottom-right')} -- the same as ${_h.code('--upper')} but possibly easier to remember`,
            `${_h.bold(`--middle`)} -- Place the vision blocking space in the middle of the replaced line.  However, there will be a section in the middle that blocks movement.`
          )
        ),
        _h.section('Usage',
          _h.paragraph(`Select path objects on the Dynamic Lighting Layer and run the ${_h.code('!to-passwall')} command.  Each of the path objects will get moved to the GM Layer and a version will be created that only blocks vision and light, but will not block movement.  You can adjust the way the DL version is created by rerunning commands on the GM Layer line.  If you delete the GM Layer line, it will remove the DL lines.`),
          _h.paragraph(`This works with single segment poly lines, but not boxes or circles.`),
          _h.paragraph(`${_h.bold('Note:')} the ${_h.code('--lower')}/${_h.code('--top-left')} and ${_h.code('--upper')}/${_h.code('--bottom-right')} arguments check the vertical axis first, so a line drawn from bottom-left to top-right will get the excess applied to the bottom left when using the ${_h.code('--upper')} argument.`)
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

  const isSingleSegmentPoly = (p) => {
    if('path' === p.get('type')){
      return 'ML' === JSON.parse(p.get('path')||'[]').map(s=>s[0]).join('');
    }
    return false;
  };



  const bounds = (p) => p.reduce(function(m,p){
    m.minX=Math.min(p[1],m.minX);
    m.minY=Math.min(p[2],m.minY);
    m.maxX=Math.max(p[1],m.maxX);
    m.maxY=Math.max(p[2],m.maxY);
    return m;
  },{minX:Infinity,maxX:0,minY:Infinity,maxY:0});

  const center = (bounds) => ({
    x: bounds.minX + ((bounds.maxX-bounds.minX)/2),
    y: bounds.minY + ((bounds.maxY-bounds.minY)/2)
  });

  const rotate = (p,theta) => {
    let b=bounds(p);
    let c=center(b);
    let sinT=Math.sin( theta*Math.PI/180.0);
    let cosT=Math.cos( theta*Math.PI/180.0);
    let newBounds={
      minX:Infinity,
      minY:Infinity,
      maxX:0,
      maxY:0
    };

    let points = p.map((point) => {
        let pointPrime=_.clone(point);
        pointPrime[1]=cosT*(point[1]-c.x) - sinT*(point[2]-c.y) + c.x;
        pointPrime[2]=sinT*(point[1]-c.x) + cosT*(point[2]-c.y) + c.y;
        newBounds.minX=Math.min(pointPrime[1],newBounds.minX);
        newBounds.minY=Math.min(pointPrime[2],newBounds.minY);
        newBounds.maxX=Math.max(pointPrime[1],newBounds.maxX);
        newBounds.maxY=Math.max(pointPrime[2],newBounds.maxY);
        return pointPrime;
      })
      .map(function(p){
        p[1]-=newBounds.minX;
        p[2]-=newBounds.minY;
        return p;
      });

    let newCenter=center(newBounds);
    return {
      path: points,
      bounds: newBounds,
      center: newCenter,
      offset: {
        x: newCenter.x-c.x,
        y: newCenter.y-c.y
      }
    };
  };

  const applyPathRotation = (path) => {
    if( parseFloat(path.get('rotation')) !== 0) {
      let details=rotate(JSON.parse(path.get('path')),path.get('rotation'));
      let newpath = createObj('path', {
        pageid: path.get('pageid'),
        fill: path.get('fill'),
        stroke: path.get('stroke'),
        rotation: 0,
        layer: path.get('layer'),
        stroke_width: path.get('stroke_width'),
        width: details.bounds.maxX-details.bounds.minX,
        height: details.bounds.maxY-details.bounds.minY,
        path: JSON.stringify(details.path),
        top: path.get('top')+details.offset.y,
        left: path.get('left')+details.offset.x,
        scaleX: 1,
        scaleY: 1
      });
      if(newpath){
        path.remove();
        return newpath;
      }
    }
    return path;
  };



  const simpleObject = (o)=>JSON.parse(JSON.stringify(o));

  const getLineData = (p) => {
      let data = JSON.parse(p.get('path'));
      let pt1 = {x:data[0][1], y:data[0][2]};
      let pt2 = {x:data[1][1], y:data[1][2]};
      let width = p.get('stroke_width');
      let xlen = Math.abs(pt1.x-pt2.x);
      let ylen = Math.abs(pt1.y-pt2.y);
      let len = Math.sqrt( xlen*xlen + ylen*ylen);

      let angle = ((Math.PI/2)+Math.atan2(pt1.y-pt2.y,pt1.x-pt2.x))*(180/Math.PI);

      pt1.x-=xlen/2;
      pt2.x-=xlen/2;
      pt1.y-=ylen/2;
      pt2.y-=ylen/2;
      return { data, pt1, pt2, width, len, angle }
    }


  const LineBuilders = {
    [ENDS]: (p) => {
      let d = getLineData(p);
      let lines = [];
      
      lines.push(createObj('path',{
        fill: "transparent",
        stroke: `${p.get('stroke')}99`,
        rotation: d.angle,
        stroke_width: d.len,
        width: d.width,
        height: 0,
        top: d.pt1.y+p.get('top'),
        left: d.pt1.x+p.get('left'),
        scaleX: 1,
        scaleY: 1,
        controlledby: `DLPasswall_${p.id}`,
        layer: "walls",
        path: `[["M",0,0],["L",${d.width},0]]`,
        pageid: p.get('pageid')
      }));
      lines.push(createObj('path',{
        fill: "transparent",
        stroke: `${p.get('stroke')}99`,
        rotation: d.angle,
        stroke_width: d.len,
        width: d.width,
        height: 0,
        top: d.pt2.y+p.get('top'),
        left: d.pt2.x+p.get('left'),
        scaleX: 1,
        scaleY: 1,
        controlledby: `DLPasswall_${p.id}`,
        layer: "walls",
        path: `[["M",0,0],["L",${d.width},0]]`,
        pageid: p.get('pageid')
      }));
      return lines;
    },
    [LOWER]: (p) => {
      let d = getLineData(p);
      let x;
      let y;
      if(d.pt1.y<d.pt2.y){
        x = d.pt1.x;
        y = d.pt1.y;
      } else if( d.pt1.y > d.pt2.y) {
        x = d.pt2.x;
        y = d.pt2.y;
      } else {
        if(d.pt1.x<d.pt2.x){
          x = d.pt1.x;
          y = d.pt1.y;
        } else if( d.pt1.x > d.pt2.x) {
          x = d.pt2.x;
          y = d.pt2.y;
        } else {
          x = d.pt1.x;
          y = d.pt1.y;
        }
      }

      let lines = [];
      lines.push(createObj('path',{
        fill: "transparent",
        stroke: `${p.get('stroke')}99`,
        rotation: d.angle,
        stroke_width: d.len*2,
        width: d.width,
        height: 0,
        top: y+p.get('top'),
        left: x+p.get('left'),
        scaleX: 1,
        scaleY: 1,
        controlledby: `DLPasswall_${p.id}`,
        layer: "walls",
        path: `[["M",0,0],["L",${d.width},0]]`,
        pageid: p.get('pageid')
      }));
      return lines;
    },
    [UPPER]: (p) => {
      let d = getLineData(p);
      let x;
      let y;
      if(d.pt1.y>d.pt2.y){
        x = d.pt1.x;
        y = d.pt1.y;
      } else if( d.pt1.y < d.pt2.y) {
        x = d.pt2.x;
        y = d.pt2.y;
      } else {
        if(d.pt1.x>d.pt2.x){
          x = d.pt1.x;
          y = d.pt1.y;
        } else if( d.pt1.x < d.pt2.x) {
          x = d.pt2.x;
          y = d.pt2.y;
        } else {
          x = d.pt2.x;
          y = d.pt2.y;
        }
      }

      let lines = [];
      lines.push(createObj('path',{
        fill: "transparent",
        stroke: `${p.get('stroke')}99`,
        rotation: d.angle,
        stroke_width: d.len*2,
        width: d.width,
        height: 0,
        top: y+p.get('top'),
        left: x+p.get('left'),
        scaleX: 1,
        scaleY: 1,
        controlledby: `DLPasswall_${p.id}`,
        layer: "walls",
        path: `[["M",0,0],["L",${d.width},0]]`,
        pageid: p.get('pageid')
      }));
      return lines;
    },
    [MIDDLE]: (p) => {
      let d = getLineData(p);

      let lines = [];
      
      lines.push(createObj('path',{
        fill: "transparent",
        stroke: `${p.get('stroke')}99`,
        rotation: d.angle,
        stroke_width: d.len,
        width: d.width,
        height: 0,
        top: p.get('top'),
        left: p.get('left'),
        scaleX: 1,
        scaleY: 1,
        controlledby: `DLPasswall_${p.id}`,
        layer: "walls",
        path: `[["M",0,0],["L",${d.width},0]]`,
        pageid: p.get('pageid')
      }));

      return lines;
    }
  };
    

  const convertToPasswallPath = (p, options)=>{
    options = options || {};

    if(!isSingleSegmentPoly(p)){
      return {
        error: true,
        msg: `Path is not a single segment poly line.  Please redraw as single segments and run command on each one.`
      };
    }

    clearUDLPasswallForLine(p);
    let pPrime = applyPathRotation(p);
    let lines = LineBuilders[options.dir](pPrime);
    pPrime.set('layer','gmlayer');

    return {
      error: false
    };
  };

  const clearUDLPasswallForLine = (obj) => {
    findObjs({controlledby: `DLPasswall_${obj.id}`}).forEach(o=>o.remove());
  };

  const handleInput = (msg) => {
    if('api'===msg.type && /^!to-passwall(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)){
      let args = msg.content.split(/\s+--/).slice(1).map(s=>s.toLowerCase());

      let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

      if(args.includes('help')){
        showHelp(msg.playerid);
        return;
      }

      let options = {
        dir: ENDS
      };

      if( args.includes('lower') || args.includes('top-left') ){
        options.dir=LOWER;
      }

      if( args.includes('upper') || args.includes('bottom-right') ){
        options.dir=UPPER;
      }

      if( args.includes('middle') ){
        options.dir=MIDDLE;
      }

      let paths = (msg.selected || [])
        .map(o=>getObj('path',o._id))
        .filter(g=>undefined !== g)
        .filter(o=>['walls','gmlayer'].includes(o.get('layer')))
        ;

      if(paths.length){
        let page = getObj('page',paths[0].get('pageid'));
        if(page) {
          if(true === page.get('dynamic_lighting_enabled')){

            let res = paths.reduce((m,p)=>[...m,convertToPasswallPath(p,options)],[]);
            let msgs = res.filter(r=>r.error).map(r=>r.msg);
            let count = res.length - msgs.length;
            if(msgs.length){
              
              sendChat('UDLPasswall',`/w "${who}" Error: ${msgs.join(', ')}`);
            }

            sendChat('UDLPasswall',`/w "${who}" Converted ${count} path${1===count?'':'s'}.`);
          } else {
            sendChat('UDLPasswall',`/w "${who}" UDLPasswall only works with Updated Dynamic Lighting.  Please enable Updated Dynamic Lighting on the current page to use it.`);
          }
        }
      } else {
        sendChat('UDLPasswall',`/w "${who}" Select 1 or more paths on the Dynamic Lighting Layer to convert.`);
      }
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('destroy:path', clearUDLPasswallForLine);
  };

  on('ready', () => {
    checkInstall();
    registerEventHandlers();
  });

  return {
    // Public interface here
  };

})();

{try{throw new Error('');}catch(e){API_Meta.UDLPasswall.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.UDLPasswall.offset);}}
