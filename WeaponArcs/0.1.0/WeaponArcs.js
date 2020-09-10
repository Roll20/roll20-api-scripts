// Github:   https://github.com/shdwjk/Roll20API/blob/master/WeaponArcs/WeaponArcs.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

/* global TokenMod */
const WeaponArcs = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'WeaponArcs';
  const version = '0.1.0';
  const lastUpdate = 1595644370;
  const schemaVersion = 0.1;

  const defaults = {
    color1: '#990000',
    color1Opacity: '99',
    color2: '#330000',
    color2Opacity: 'ee',
    strokeWidth: 3
  };

  const lookupArcInfo = {};

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
            version: schemaVersion,
            tokens: {
            }
          };
          break;
      }
    }

    assureHelpHandout();
    CleanUp();
  };

  const assureHelpHandout = (create = false) => {
    if(state.TheAaron && state.TheAaron.config && (false === state.TheAaron.config.makeHelpHandouts) ){
      return;
    }
    const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/127392204/tAiDP73rpSKQobEYm5QZUw/thumb.png?15878425385";

    // find handout
    let props = {type:'handout', name:`Help: ${scriptName}`};
    let hh = findObjs(props)[0];
    if(!hh) {
      hh = createObj('handout',Object.assign(props, {inplayerjournals: "all", avatar: helpIcon}));
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
    join: (...o) => o.join(' '),
    pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
    preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
    code: (...o) => `<code>${o.join(' ')}</code>`,
    roll: (...o) => `${ch('[')}${ch('[')}${o.join(' ')}${ch(']')}${ch(']')}`,
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
        _h.paragraph(`${scriptName} provides a means to add weapon arcs to tokens for visualization of range and targetable tokens.`)
        ),
        _h.subhead('Commands'),
        _h.inset(
          _h.font.command(
            `!weapon-arc`,
            _h.optional(
              '--help',
              `--add ${_h.required(`${_h.optional('angle|')}width`)} ${_h.required("range")} ${_h.optional("fill color")} ${_h.optional("stroke color")} ${_h.optional("stroke thickness")}`,
              `--remove-at ${_h.required("angle")} ${_h.optional("angle ...")}`,
              '--clear'
            )
          ),
          _h.ul(
            `${_h.bold('--help')} -- Displays this help`,
            `${_h.bold('--add')} -- Creates an arc attached to each selected token.${
              _h.ul(
                `${_h.bold('angle|width')} -- A pair of numbers in degrees. ${_h.bold('angle')} is the direction off of the token that the arc will be centered on.  0 is up on the token (the direction of the Rotation handle), and numbers proceed clockwise.  ${_h.bold('width')} is the width of the arc, to be centered on the ${_h.bold('angle')} direction. If ${_h.bold('angle|')} is omitted, it is treated as 0.`,
                `${_h.bold('range')} -- The distance the arc should extend from the center of the token.  You can use ${_h.code('u')} for  Roll20 Units (70px), ${_h.code('g')} for grid scale units, or any of ${_h.code('s')}, ${_h.code('ft')}, ${_h.code('m')}, ${_h.code('km')}, ${_h.code('mi')}, ${_h.code('in')}, ${_h.code('cm')}, ${_h.code('un')}, ${_h.code('hex')}, or ${_h.code('sq')} for map scale units.`,
                `${_h.bold('fill color')} -- ${_h.bold('(Optional)')} This is the color the arc will be filled with.  It must be an HTML color code and can include an opacity.  It can be any of 3, 4, 6, or 8 letter formats: ${_h.code('#RGB')}, ${_h.code('#RGBA')}, ${_h.code('#RRGGBB')}, or ${_h.code('#RRGGBBAA')}  Omitting the opacity will default to ${_h.code(defaults.color1Opacity)}. The color defaults to ${_h.code(defaults.color1)}.`,
                `${_h.bold('stroke color')} -- ${_h.bold('(Optional)')} This is the color of the line around the arc.  It must be an HTML color code and can include an opacity.  It can be any of 3, 4, 6, or 8 letter formats: ${_h.code('#RGB')}, ${_h.code('#RGBA')}, ${_h.code('#RRGGBB')}, or ${_h.code('#RRGGBBAA')}  Omitting the opacity will default to ${_h.code(defaults.color2Opacity)}. The color defaults to ${_h.code(defaults.color2)}.`,
                `${_h.bold('stroke thickness')} -- ${_h.bold('(Optional)')} This is the thickness of the line around the arc.  It can be any positive number and will default to ${_h.code(defaults.strokeWidth)}.`
              )
            }`,
            `${_h.bold('--remove-at')} -- Removes arcs at the specified angles from all selected tokens.`,
            `${_h.bold('--clear')} -- Removes all arcs attached to the selected tokens.`
          )
        ),
        _h.section('Instructions',
          _h.paragraph(`Created arcs will maintain their position with regards to the token they are attached to.  Moving the token will cause them to move, rotating will rotate them, etc.  A token on the objects layer will have attached arcs on the map layer.  A token on the gm layer will have attached arcs on the gm layer.  If you move a token from the gm layer to the objects layer or vice versa, the arcs will be moved the the correct layer.`),
          _h.paragraph(`${_h.bold('Note:')} Because of a bug with the ${_h.code('toFront()')} Roll20 function, arcs on the map layer will take a second to appear.  Creating multiple arcs will take 1 second for each arc.`),
          _h.paragraph(`${_h.bold('Note:')} Changes made using TokenMod will also be respected.  Feel free to rotate, position, and move all you like.`),
          _h.paragraph(`You can specify multiple arguments on the command line:`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc --add 90 3u --add 15 7u'
            )
          ),
          _h.paragraph(`${_h.bold('Note:')} You can use the ${_h.code('{{')} and ${_h.code('}}')} to span multiple lines with your command for easier clarity and editing:`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc {{',
                '  --add 90 3u #660 #00ff00cc 7',
                '  --add -90|60 2u',
                '  --add 90|60 2u',
                '  --add 180|20 8u #600a',
                '}}'
            )
          ),
        ),

        _h.section('Examples',

          _h.paragraph(`Creating an arc in the forward direction which is 15 degrees wide and 7 units long with the default colors and strokes:`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc --add 15 7u'
            )
          ),

          _h.paragraph(`Inline rolls are supported, including rollable tables.`),
          _h.inset(
            _h.preformatted(
              `!weapon-arc --add ${_h.roll('(1d8*45)')}|${_h.roll('20+(1d6*5)')} ${_h.roll('5+1d3')}g ${_h.roll('1t[arcColorAndSize]')}`
            )
          ),

          _h.paragraph(`Removing the arc at 90 degrees.`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc --remove-at 90'
            )
          ),

          _h.paragraph(`Removing the arcs at 90, 45, 120, and 180 degrees.`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc --remove-at 90 45 120 180'
            )
          ),

          _h.paragraph(`Clearing all arcs.`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc --clear'
            )
          ),

          _h.paragraph(`Clearing all arcs, then adding four new ones`),
          _h.inset(
            _h.preformatted(
              '!weapon-arc {{',
                '  --clear',
                '  --add 90 3u #660 #00ff00cc 7',
                '  --add -90|60 2u',
                '  --add 90|60 2u',
                '  --add 180|20 8u #600a',
                '}}'
            )
          ),
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

  const degreeToRadian = (d) => d*(Math.PI/180);
  const RESOLUTION = 20; // distance before creating a new point in an arc
  const HALF_PI = Math.PI/2;

  const getPoint = (theta, hypotenuse) => {
    let opposite = Math.sin(theta)*hypotenuse;
    let adjacent = Math.sqrt( Math.pow(hypotenuse,2) - Math.pow(opposite,2));
    return [opposite,adjacent];
  };

  const CleanUp = ()=>{
    let tids = Object.keys(state[scriptName].tokens);
    const TokenCheck = ()=>{
      if(tids.length){
        let tid = tids.shift();
        let token = getObj('graphic',tid);
        let paths = findObjs({
          type: 'path',
          controlledby: tid
        });

        if(token){
          let fpids = paths.map(p=>p.id);
          let pids = Object.keys(state[scriptName].tokens[tid]);
          pids.filter(p => !fpids.includes(p)).forEach(p => delete state[scriptName].tokens[tid][p]);

          if(0 === Object.keys(state[scriptName].tokens[tid]).length){
            delete state[scriptName].tokens[tid];
          } else {
            fpids.forEach((pid) => lookupArcInfo[pid]=tid);
          }
        } else {
          paths.forEach(p=>p.remove());
          delete state[scriptName].tokens[tid];
        }
        setTimeout(TokenCheck,0);
      }
    };
    TokenCheck();
  };

  const onGraphicChange = (obj,prev) => {
    if(state[scriptName].tokens.hasOwnProperty(obj.id)){
      let layer = obj.get('layer');
      let props = {
        left: obj.get('left'),
        top: obj.get('top')
      };

      if(layer!== prev.layer) {
        switch(layer){
          case 'map':
          case 'objects':
            props.layer = 'map';
            break;

          case 'gmlayer':
          case 'walls':
            toFrontFixed(obj);
            props.layer = 'gmlayer';
            break;
        }
      }

      findObjs({
        type: 'path',
        controlledby: obj.id
      }).forEach(p=>p.set({
        ...props,
        rotation: obj.get('rotation')+((state[scriptName].tokens[obj.id]||{})[p.id]||0)
      }));
    }
  };

  const onGraphicRemove = (obj) => {
    if(state[scriptName].tokens.hasOwnProperty(obj.id)){
      findObjs({
        type: 'path',
        controlledby: obj.id
      }).forEach(p=>{
        delete lookupArcInfo[p.id];
        p.remove();
      });
      delete state[scriptName].tokens[obj.id];
    }
  };

  const simpleObj = o =>  JSON.parse(JSON.stringify(o));
  const diffAtoB = (a,b) => Object.keys(a).reduce( (m,k)=> a[k]!==b[k] ? {...m, [k]:b[k]} : m,{});

  const PathPropsPreserved = [ 'height','width','top','left','scaleX','scaleY','rotation','controlledby'];
  const onPathChange = (obj,prev) => {
    let pod = simpleObj(obj);
    let propsIn = PathPropsPreserved.reduce((m,k)=>({...m,[k]:pod[k]}),{});
    let props = diffAtoB(propsIn,prev);
    if(Object.keys(props)){
      obj.set(props);
    }
  };

  const onPathRemove = (obj) => {
    if(lookupArcInfo.hasOwnProperty(obj.id)){
      let tid = (lookupArcInfo[obj.id]||'');
      delete (state[scriptName].tokens[tid]||{})[obj.id];
      if(0 === Object.keys(state[scriptName].tokens[tid]||{}).length){
        delete state[scriptName].tokens[tid];
      }
      delete lookupArcInfo[obj.id];
    }
  };

  const registerArc = (tid,pid,rotation) => {
    state[scriptName].tokens[tid] = state[scriptName].tokens[tid]||{};
    state[scriptName].tokens[tid][pid]=rotation;

    lookupArcInfo[pid]=tid;
  };




  const arcCache = {};

  const buildArc = (angle, hypotenuse) => {
    let boundAngle = Math.min(360, Math.max(0,angle));

    let key = `${boundAngle}:${hypotenuse}`;
    if(arcCache.hasOwnProperty(key)){
      return arcCache[key];
    }

    let theta = degreeToRadian(boundAngle/2);
    let halfArcLength = hypotenuse * theta;
    let num = Math.ceil(halfArcLength/RESOLUTION);
    let subTheta = theta/num;

    let minX = 0;
    let minY = 0;
    let maxX = 0;
    let maxY = hypotenuse;

    let lpoints = [];
    let rpoints = [];

    for(let i = 0; i < (num-1); ++i){
      let tempTheta = theta - (i*subTheta);
      let pt = getPoint(tempTheta,hypotenuse);
      if(tempTheta > HALF_PI){
        pt[1] = -pt[1];
      }

      minX = Math.min(minX,-pt[0]);
      minY = Math.min(minY, pt[1]);
      maxX = Math.max(maxX, pt[0]);
      maxY = Math.max(maxY, pt[1]);

      rpoints.push([pt[0],hypotenuse-pt[1]]);
      lpoints.unshift([-pt[0],hypotenuse-pt[1]]);
    }

    let data = {
      minX,minY,maxX,maxY,
      points: [
        ...rpoints,
        [0,0],
        ...lpoints
      ]
    };

    if(360 !== boundAngle){
      data.points.unshift([0,hypotenuse]);
      data.points.push([0,hypotenuse]);
    }

    arcCache[key] = data;
    return data;
  };

  const pathDataFromPoints = (pts) => JSON.stringify(pts.map((p,i) => [ i ? 'L' : 'M', ...p]));

  const toFrontFixed = (()=>{
    let queue=[];
    let last=0;
    const DELAY = 1000;
    const burndownQueue = ()=>{
      let o = queue.shift();
      toFront(o);
      last = Date.now();
      if(queue.length){
        setTimeout(burndownQueue,DELAY);
      }
    };
    return (obj=>{
      if(queue.length){
        queue.push(obj);
      } else {
        let t = Date.now();
        if(last+DELAY > t){
          queue.push(obj);
          setTimeout(burndownQueue,(last+DELAY-t));
        } else {
          toFront(obj);
          last = t;
        }
      }
    });
  })();

  const addWeaponArc = (token,rotation,angle,length,c1,c2,stroke) => {
    let data = buildArc(angle,length);
    let visible = 'objects' === token.get('layer');
    let arc = createObj('path',{
      fill: c1,
      stroke: c2,
      stroke_width: stroke,
      rotation: token.get('rotation')+rotation,
      width: 2*data.maxX,
      height: 2*data.maxY,
      top: token.get('top'),
      left: token.get('left'),
      scaleX: 1,
      scaleY: 1,
      controlledby: token.id,
      layer: visible ? 'map' : 'gmlayer',
      path: pathDataFromPoints(data.points,rotation),
      pageid: token.get('pageid')
    });

    if(visible){
      toFrontFixed(arc);
    }

    registerArc(token.id,arc.id,rotation);
  };

  const ConvertUnitsPixel = (num,unit,page) => {
    const unitSize = 70;
    switch(unit){
      case 'u':
        return num*unitSize;

      case 'g':
        return num*(parseFloat(page.get('snapping_increment'))*unitSize);

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
        return (num/(parseFloat(page.get('scale_number'))||1))*unitSize;
      default:
        return num;
    }
  };

  const regex = {
    numberUnit: /^(-?\d+\.?|\d*\.\d+)(u|g|s|ft|m|km|mi|in|cm|un|hex|sq)?$/i,
    color: /^#?((?:[0-9a-f]{8})|(?:[0-9a-f]{6})|(?:[0-9a-f]{4})|(?:[0-9a-f]{3}))$/i
  };

  const toFullColor = (htmlstring, defaultAlpha = '99') => {
    let s=htmlstring.toLowerCase().replace(/[^0-9a-f]/,'');
    switch(s.length){
      case 3:
        s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${defaultAlpha}`;
        break;
      case 4:
        s=`${s[0]}${s[0]}${s[1]}${s[1]}${s[2]}${s[2]}${s[3]}${s[3]}`;
        break;
      case 6:
        s=`${s}${defaultAlpha}`;
        break;
    }
    return `#${s}`;
  };

  const removeArcAt = (token,angles) => Object.entries(state[scriptName].tokens[token.id]||{})
    .filter(e=>angles.includes(e[1]))
    .map(e=>getObj('path',e[0]))
    .filter(p=>undefined !== p)
    .forEach(p=>p.remove())
    ;

  const rangeAngle = (angle) => (((angle%360)+360)%360);
  const boundAngle = (angle) => Math.min(360, Math.max(0,angle));

  const processInlinerolls = (msg) => {
    if(_.has(msg,'inlinerolls')){
      return _.chain(msg.inlinerolls)
      .reduce(function(m,v,k){
        let ti=_.reduce(v.results.rolls,function(m2,v2){
          if(_.has(v2,'table')){
            m2.push(_.reduce(v2.results,function(m3,v3){
              m3.push(v3.tableItem.name);
              return m3;
            },[]).join(' '));
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

  const handleInput = (msg) => {
    if (msg.type !== "api") {
      return;
    }

    let args = processInlinerolls(msg)
      .replace(/<br\/>\n/g, ' ')
      .replace(/(\{\{(.*?)\}\})/g," $2 ")
      .split(/\s+--/);

    switch(args.shift().toLowerCase()) {
      case '!weapon-arc': {
        let tokens = (msg.selected || [])
          .map(o=>getObj('graphic',o._id))
          .filter(g=>undefined !== g)
          ;

        if(0 === tokens.length || args.includes('help')) {
          showHelp(msg.playerid);
          return;
        }

        args.forEach(arg=>{
          let cmds = arg.split(/\s+/);
          /*
          !weapon-arc --add 90|60 5u #ff0000 #0000ff
          !weapon-arc --clear
          !weapon-arc --list
          !weapon-arc --remove 3
          !weapon-arc --remove-at 90
          */
          switch(cmds.shift().toLowerCase()){
            case 'add': {
              if(tokens.length){
                let page = getObj('page', tokens[0].get('pageid'));

                let angle;
                let width;
                [angle,width] = cmds.shift().split(/\|/).map(parseFloat);

                if(undefined == width){
                  width = angle;
                  angle = 0;
                }
                angle = rangeAngle(angle);
                width = boundAngle(width);

                let distanceParts = cmds.shift().match(regex.numberUnit);
                let distance = Math.abs(ConvertUnitsPixel(distanceParts[1],distanceParts[2],page));

                let color1 = `${defaults.color1}${defaults.color1Opacity}`;
                let color2 = `${defaults.color2}${defaults.color2Opacity}`;
                if(regex.color.test(cmds[0])) {
                  color1 = toFullColor(cmds.shift(),defaults.color1Opacity);
                }
                if(regex.color.test(cmds[0])) {
                  color2 = toFullColor(cmds.shift(),defaults.color2Opacity);
                }
                let strokeWidth = parseFloat(cmds[0]) || defaults.strokeWidth;

                tokens.forEach( t => addWeaponArc(t,angle,width,distance,color1,color2,strokeWidth));
              }
            }
            break;

          case 'clear':
            tokens.forEach( t => onGraphicRemove(t));
            break;

          case 'remove-at': {
            let angles = cmds.map(parseFloat).map(rangeAngle);
            tokens.forEach(t=>removeArcAt(t,angles));
          }
          break;
          }
        });
      }
      break;
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:graphic', onGraphicChange);
    on('destroy:graphic', onGraphicRemove);
    on('change:path', onPathChange);
    on('destroy:path', onPathRemove);

    if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
      TokenMod.ObserveTokenChange(onGraphicChange);
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

