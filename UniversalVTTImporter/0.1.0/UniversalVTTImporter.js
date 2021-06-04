// Github:   https://github.com/shdwjk/Roll20API/blob/master/UniversalVTTImporter/UniversalVTTImporter.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const UniversalVTTImporter = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'UniversalVTTImporter';
  const version = '0.1.0';
  const lastUpdate = 1592104132;
  const schemaVersion = 0.1;
  const clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';


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
            config: {
              wallColor: '#e4a21e',
              wallWidth: 15,
              doorColor: '#ff0000',
              doorWidth: 5,
              lightColor: '#9900ff',
              createOpenPortals: true
            }

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
        _h.paragraph(`${scriptName} provides a way to setup Dynamic Lighting lines and Lights stored in Universal VTT format, ala Dungeondraft.`)
        ),
        _h.subhead('Commands'),
        _h.inset(
          _h.font.command(
            `!uvtt`,
            _h.optional(
              '--help' /*,
              `--set-wall-color ${_h.required('color')}`,
              `--set-wall-width ${_h.required('width')}`,
              `--set-door-color ${_h.required('color')}`,
              `--set-door-width ${_h.required('number')}`,
              `--set-light-color ${_h.required('color')}`,
              '--toggle-create-open-portals' */
            )
          ),
          _h.ul(
            `${_h.bold('--help')} -- Displays this help`/*,
            `${_h.bold(`--set-wall-color ${_h.required('color')}`)} -- Sets the color for walls on the dynamic lighting layer.`,
            `${_h.bold(`--set-wall-width ${_h.required('number')}`)} -- Sets the width for walls on the dynamic lighting layer.`,
            `${_h.bold(`--set-door-color ${_h.required('color')}`)} -- Sets the color for doors on the dynamic lighting layer.`,
            `${_h.bold(`--set-door-width ${_h.required('number')}`)} -- Sets the width for doors on the dynamic lighting layer.`,
            `${_h.bold('--toggle-create-open-portals')} -- Toggles the creation of lines for open portals (doors and windows) on the GM layer.`*/
          )
        ),
        _h.section('Import Process',
          _h.paragraph(`The process for importing is pretty straight forward, but there are several steps, as follows:`),
          _h.ol(
            `From your Universal VTT supporting mapping program, such as Dungeondraft, export your map as a ${_h.code('.png')} or ${_h.code('.jpg')} file.  The API cannot create images from the Universal VTT, so you will need to upload it manually.`,
            `Next export the Universal VTT version into a ${_h.code('.dd2vtt')} file.`,
            `Drop your map image file onto a page and scale it as desired.`,
            `Open the properties by double clicking the image.`,
            `Load the Universal VTT file in a text editor and copy the contents.`,
            `Paste the contents into the GM Notes section of the map graphic and save changes.`,
            `With the graphic selected, run ${_h.code('!uvtt')}`
          ),
          _h.paragraph(`Your map should now have dynamic lighting lines, lines for doors and windows, and light sources from the original.`)
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

  const sread = (o,p) => {
    let v = o;
    while(undefined !== v && p.length) {
      v = v[p.shift()];
    }
    return v;
  };

  const validateData = (d)=>d.hasOwnProperty('resolution') && d.hasOwnProperty('format') && d.format>=0.2;

  const importUVTTonGraphic = (token) => {
    let rawNotes = token.get('gmnotes');
    let notes = unescape(rawNotes).replace(/<[^>]*>/g,'').replace(/\\t/g,'');
    let data;
    try {
      data = JSON.parse(notes);
    } catch( e ){
      return {error: "Universal VTT Data is missing or corrupt.", token};
    }

    if(!validateData(data)){
      return false;
    }

    // cleanup image for efficiency
    if(data.hasOwnProperty('image') || notes.length !== rawNotes.length){
      delete data.image;
      token.set('gmnotes',JSON.stringify(data));
    }

    // calculate constants
    const tokenWidth = parseInt(token.get('width'));
    const tokenHeight = parseInt(token.get('height'));
    const tokenOriginY = parseInt(token.get('top')) - (tokenHeight/2);
    const tokenOriginX = parseInt(token.get('left')) - (tokenWidth/2);
    const dataSizeX = sread(data,['resolution','map_size','x'])||1;
    const dataSizeY = sread(data,['resolution','map_size','y'])||1;
    const dataOriginX = sread(data,['resolution','map_origin','x'])||0;
    const dataOriginY = sread(data,['resolution','map_origin','y'])||0;
    const dppg = sread(data,['resolution','pixels_per_grid'])||70;
    const scaleFactorX = (tokenWidth/(dataSizeX*dppg))*70;
    const scaleFactorY = (tokenHeight/(dataSizeY*dppg))*70;
    const newX = (x) => tokenOriginX + ((x-dataOriginX)*scaleFactorX);
    const newY = (y) => tokenOriginY + ((y-dataOriginY)*scaleFactorY);
    const newPt = (pt) => ({x:newX(pt.x),y:newY(pt.y)});


    let page = getObj('page',token.get('pageid'));
    let stats = {token,lines:0,doors:0,lights:0};

    const WallColor = state[scriptName].config.wallColor;
    const WallWidth = state[scriptName].config.wallWidth;
    const DoorColor = state[scriptName].config.doorColor;
    const DoorWidth = state[scriptName].config.doorWidth;
    const LightColor = state[scriptName].config.lightColor;

    if(data.hasOwnProperty('line_of_sight')){
      let lines = sread(data,['line_of_sight'])||[];
      lines
        .map((l)=>{
          let minX = Number.MAX_SAFE_INTEGER;
          let minY = Number.MAX_SAFE_INTEGER;
          let maxX = 0;
          let maxY = 0;
          let pts = l
            .reduce((m,pt)=>{
              let t = m.length ? 'L' : 'M';
              let npt = newPt(pt);
              minX = Math.min(minX,npt.x);
              minY = Math.min(minY,npt.y);
              maxX = Math.max(maxX,npt.x);
              maxY = Math.max(maxY,npt.y);
              m.push([t,npt.x,npt.y]);
              return m;
            },[])
            .map(pt=>[pt[0],pt[1]-minX,pt[2]-minY]);
          return {
            base: {x:minX, y:minY},
            size: {x:maxX-minX, y:maxY-minY},
            pts: pts
          };
        })
        .forEach(ld=>{
          stats.lines++;
          createObj('path',{
            fill: "transparent",
            stroke: WallColor,
            stroke_width: WallWidth,
            rotation: 0,
            width: ld.size.x,
            height: ld.size.y,
            top: ld.base.y+(ld.size.y/2),
            left: ld.base.x+(ld.size.x/2),
            scaleX: 1,
            scaleY: 1,
            controlledby: token.id,
            layer: "walls",
            path: JSON.stringify(ld.pts),
            pageid: page.id
          });
        });
    }

    if(data.hasOwnProperty('portals')) {
      let doors = sread(data,['portals'])||[];
      doors
        .map((d)=>{
          let center = newPt(d.position||{x:0,y:0});
          let pt0 = newPt(d.bounds[0]);
          let pt1 = newPt(d.bounds[1]);
          let size = { x: Math.abs(pt0.x-pt1.x), y: Math.abs(pt0.y-pt1.y) };
          let line = [
            ['M',pt0.x-(center.x-(size.x/2)), pt0.y-(center.y-(size.y/2))],
            ['L',pt1.x-(center.x-(size.x/2)), pt1.y-(center.y-(size.y/2))]
          ];
          return {
            center,
            size,
            pts: line,
            closed: d.closed
          };
        })
        .forEach(dd=>{
          if(!dd.closed || state[scriptName].config.createOpenPortals) {
            stats.doors++;
            createObj('path',{
              fill: "transparent",
              stroke: DoorColor,
              stroke_width: DoorWidth,
              rotation: 0,
              width: dd.size.x,
              height: dd.size.y,
              top: dd.center.y,
              left: dd.center.x,
              scaleX: 1,
              scaleY: 1,
              controlledby: token.id,
              layer: dd.closed ? "walls" : 'gmlayer',
              path: JSON.stringify(dd.pts),
              pageid: page.id
            });
          }
        });
    }

    if(data.hasOwnProperty('lights')) {
      let pScale = parseFloat(page.get('scale_number'));
      let lights = sread(data,['lights']);
      lights
        .map(l=>{
          
            let pt = newPt(l.position);
            let r = l.range*pScale;
            let dr = ((r/2)*(Math.pow(l.intensity,2)));

          return {pt,r,dr};
        })
        .forEach(ld => {
          stats.lights++;
          createObj('graphic',{
            imgsrc: clearURL,
            subtype: 'token',
            name: '',
            aura1_radius: -0.5,
            aura1_color: LightColor,
            light_otherplayers: true,
            light_dimradius: ld.dr,
            light_radius: ld.r,
            width:70,
            height:70,
            top: ld.pt.y,
            left: ld.pt.x,
            controlledby: token.id,
            layer: "walls",
            pageid: page.id
          });
          
        });
    }

    return stats;

  };
  
  // !uvtt 
  // !uvtt --help
  // !uvtt --set-wall-color #color
  // !uvtt --set-wall-width number
  // !uvtt --set-door-color #color
  // !uvtt --set-door-width number
  // !uvtt --set-light-color #color
  // !uvtt --toggle-create-open-portals
  const handleInput = (msg) => {
    if ( "api" === msg.type && /^!uvtt(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)) {
      let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
      let args = msg.content.split(/\s+--/);
      if(args.includes('help')){
        showHelp(msg.playerid);
        return;
      }
      let graphics = (msg.selected || [])
        .map(o=>getObj('graphic',o._id))
        .filter(g=>undefined !== g)
				;

      if(graphics.length) {
        graphics
          .map(importUVTTonGraphic)
          .forEach(r=>{
            if(r.hasOwnProperty('error')){
              sendChat('',`/w "${who}" <div>Error: ${r.error}</div>`);
            } else {
              sendChat('',`/w "${who}" <div>Import complete. Lines: ${r.lines}, Doors: ${r.doors}, Lights: ${r.lights}</div>`);
            }
          });
      } else {
        showHelp(msg.playerid);
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

