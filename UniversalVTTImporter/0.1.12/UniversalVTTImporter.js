// Github:   https://github.com/shdwjk/Roll20API/blob/master/UniversalVTTImporter/UniversalVTTImporter.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.UniversalVTTImporter={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.UniversalVTTImporter.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const UniversalVTTImporter = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'UniversalVTTImporter';
  const version = '0.1.12';
  API_Meta.UniversalVTTImporter.version = version;
  const lastUpdate = 1696093453;
  const schemaVersion = 0.3;
  const clearURL = 'https://s3.amazonaws.com/files.d20.io/images/4277467/iQYjFOsYC5JsuOPUCI9RGA/thumb.png?1401938659';

  const OpenPortalOptions = {
    WINDOW: "Movement Blocking Window",
    GLASS_WINDOW: "Movement Blocking Window with Glass",
    GM_LINE: "GM Layer Line",
    NONE: "None"
  };

  const regex = {
    colors: /^(transparent|(?:#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?))$/,
    colorsRGBA: /^(transparent|(?:#?[0-9a-fA-F]{3}(?:[0-9a-fA-F]{3})?)|(?:#?[0-9a-fA-F]{4}(?:[0-9a-fA-F]{4})?))$/
  };

  const argb2rgba = (c) => {
    let m = c.match(/^#?(?:([0-9a-fA-F]{2})([0-9a-fA-F]{6})|([0-9a-fA-F]{1})([0-9a-fA-F]{3}))$/);
    if(m) {
      if(m[1]) {
        return `#${m[2]}${m[1]}`;
      } else if(m[3]) {
        return `#${m[4]}${m[2]}`;
      }
    }
    return c;
  };

  const getNonAlphaColor = (c) => {
    let m = c.match(/^#?(?:([0-9a-fA-F]{6})(?:[0-9a-fA-F]{2})|([0-9a-fA-F]{3})(?:[0-9a-fA-F]{1}))$/);
    return m ? `#${m[1]||m[2]}` : c;
  };

  const getNonAlphaColorScaled = (c) => {
    let m = c.match(/^#?(?:([0-9a-fA-F]{6})([0-9a-fA-F]{2})|([0-9a-fA-F]{3})([0-9a-fA-F]{1}))$/);
    const sh = (n,s) => `00${Math.round(parseInt(n,16)*s).toString(16)}`.slice(-2);
    if(m) {
      if(m[1]) {
        let s = parseInt(m[2],16)/255;
        return `#${sh(m[1].substring(0,2),s)}${sh(m[1].substring(2,4),s)}${sh(m[1].substring(4,6),s)}`;
      } else if(m[3]) {
        let s = parseInt(m[4],16)/15;
        return `#${sh(m[3].substring(0,1),s)}${sh(m[3].substring(1,2),s)}${sh(m[3].substring(2,3),s)}`;
      }
    }
    return c;
  };

  const assureHelpHandout = (create = false) => {
    if(state.TheAaron && state.TheAaron.config && (false === state.TheAaron.config.makeHelpHandouts) ){
      return;
    }
    const helpIcon = "https://s3.amazonaws.com/files.d20.io/images/295769190/Abc99DVcre9JA2tKrVDCvA/thumb.png?1658515304";

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
          state[scriptName].config.windowColor='#cfe2f399';
          state[scriptName].config.windowWidth=3;
          state[scriptName].config.objectColor='#00ff00';
          state[scriptName].config.objectWidth=1;
          state[scriptName].config.objectTransparent=true;
          state[scriptName].config.openPortalsMode=( state[scriptName].config.openPortalsMode ? 'GM_LINE' : 'NONE' );
          state[scriptName].config.dlLightMarkerColor = state[scriptName].config.lightColor;
          state[scriptName].config.useLightColor = true;
          /* break; // intentional dropthrough */ /* falls through */

        case 0.2:
          state[scriptName].config.useWindowObjects=true;
          state[scriptName].config.useDoorObjects=true;
          /* break; // intentional dropthrough */ /* falls through */

        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion,
            config: {
              useWindowObjects: true,
              windowColor: '#cfe2f399',
              windowWidth: 3,
              wallColor: '#0000ff',
              wallWidth: 15,
              useDoorObjects: true,
              doorColor: '#ff9900',
              doorWidth: 5,
              objectColor: '#00ff00',
              objectWidth: 1,
              objectTransparent: true,
              dlLightMarkerColor: '#9900ff',
              useLightColor: true,
              openPortalsMode: 'WINDOW'
            }

          };
          break;
      }
    }
    assureHelpHandout();
  };

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



  const defaults = {
      css: {
          button: {
              'border': '1px solid #cccccc',
              'border-radius': '1em',
              'background-color': '#006dcc',
              'margin': '0 .1em',
              'font-weight': 'bold',
              'padding': '.1em 1em',
              'color': 'white'
          },
          configRow: {
              'border': '1px solid #ccc;',
              'border-radius': '.2em;',
              'background-color': 'white;',
              'margin': '0 1em;',
              'padding': '.1em .3em;'
          }
      }
  };

  const css = (rules) => `style="${Object.keys(rules).map(k=>`${k}:${rules[k]};`).join('')}"`;

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
    clearBoth: () => `<div style="clear:both;"></div>`,
    grid: (...o) => `<div style="padding: 12px 0;">${o.join('')}${_h.clearBoth()}</div>`,
    cell: (o) =>  `<div style="width: 130px; padding: 0 3px; float: left;">${o}</div>`,
    inset: (...o) => `<div style="padding-left: 10px;padding-right:20px">${o.join(' ')}</div>`,
    join: (...o) => o.join(' '),
    configRow: (...o) => `<div ${css(defaults.css.configRow)}>${o.join(' ')}</div>`,
    makeButton: (c, l, bc, color) => `<a ${css({...defaults.css.button,...{color,'background-color':bc}})} href="${c}">${l}</a>`,
    floatRight: (...o) => `<div style="float:right;">${o.join(' ')}</div>`,
    pre: (...o) =>`<div style="border:1px solid #e1e1e8;border-radius:4px;padding:8.5px;margin-bottom:9px;font-size:12px;white-space:normal;word-break:normal;word-wrap:normal;background-color:#f7f7f9;font-family:monospace;overflow:auto;">${o.join(' ')}</div>`,
    preformatted: (...o) =>_h.pre(o.join('<br>').replace(/\s/g,ch(' '))),
    code: (...o) => `<code>${o.join(' ')}</code>`,
    attr: {
      bare: (o)=>`${ch('@')}${ch('{')}${o}${ch('}')}`,
      selected: (o)=>`${ch('@')}${ch('{')}selected${ch('|')}${o}${ch('}')}`,
      target: (o)=>`${ch('@')}${ch('{')}target${ch('|')}${o}${ch('}')}`,
      char: (o,c)=>`${ch('@')}${ch('{')}${c||'Character Name'}${ch('|')}${o}${ch('}')}`
    },
    bold: (...o) => `<b>${o.join(' ')}</b>`,
    italic: (...o) => `<i>${o.join(' ')}</i>`,
    font: {
      command: (...o)=>`<b><span style="font-family:serif;">${o.join(' ')}</span></b>`
    }
  };

  const checkerURL = 'https://s3.amazonaws.com/files.d20.io/images/16204335/MGS1pylFSsnd5Xb9jAzMqg/med.png?1455260461';

    const makeConfigOption = (config,command,text) => {
        const onOff = (config ? 'On' : 'Off' );
        const color = (config ? '#5bb75b' : '#faa732' );

        return _h.configRow(
            _h.floatRight( _h.makeButton(command,onOff,color)),
            text,
            _h.clearBoth()
          );
    };

    const makeConfigOptionNum = (config,command,text) => {

        return _h.configRow(
            _h.floatRight( _h.makeButton(command,"Set")),
            text,
            _h.clearBoth()
          );
    };

    const makeConfigOptionColor = (config,command,text) => {
        const color = ('transparent' === config ? `background-image: url('${checkerURL}');` : `background-color: ${getNonAlphaColor(config)};`);
        const buttonText =`<div style="border:1px solid #1d1d1d;width:40px;height:40px;display:inline-block;${color}">&nbsp;</div>`;

        return _h.configRow(
            _h.floatRight( _h.makeButton(command,buttonText)),
            text,
            _h.clearBoth()
          );
    };


    const getOptionsWithDefault = (opts, def) => {
      let keys = Object.keys(opts).filter(k=>def !== k);
      return [def,...keys].map(k=>`${opts[k]},${k}`).join('|');
    };

    const getConfigOption_OpenPortalsMode = () => makeConfigOptionNum(
      state[scriptName].config.openPortalsMode,
      `!uvtt-config --open-portals-mode|?{Open Portal Draw Style|${getOptionsWithDefault(OpenPortalOptions,state[scriptName].config.openPortalsMode)}}`,
      `${_h.bold('Open Portals Mode')} controls how open portals are drawn.  These are usually windows, so with UDL, you can draw them to block movement, not sight.  Or you can draw them as a line on the GM layer which you can move the the DL layer to "close" them.  Or just leave them off entirely. Current setting: ${_h.bold(OpenPortalOptions[state[scriptName].config.openPortalsMode])}`
    );


    // Windows
    const getConfigOption_UseWindowObjects = () => makeConfigOption(
      state[scriptName].config.useWindowObjects,
      `!uvtt-config --toggle-use-window-objects`,
      `${_h.bold('Use Window Objects')} controls whether the new Window Objects will be used, rather than lines. (UDL Only). Current value: ${_h.bold(state[scriptName].config.useWindowObjects ? 'On' : 'Off')}`
    );

    const getConfigOption_WindowColor = () => makeConfigOptionColor(
      state[scriptName].config.windowColor,
      `!uvtt-config --window-color|?{What color for window lines? (transparent for none, #RRGGBBAA for a color)|${state[scriptName].config.windowColor}}`,
      `${_h.bold('Window Color')} is the color that windows are drawn in on the Dynamic Lighting Layer.`
    );
    const getConfigOption_WindowWidth = () => makeConfigOptionNum(
      state[scriptName].config.windowWidth,
      `!uvtt-config --window-width|?{How many pixels wide for window lines?|${state[scriptName].config.windowWidth}}`,
      `${_h.bold('Window Width')} is the width that windows are drawn in on the Dynamic Lighting Layer in pixels. Current value: ${_h.bold(state[scriptName].config.windowWidth)}`
    );

    // Walls
    const getConfigOption_WallColor = () => makeConfigOptionColor(
      state[scriptName].config.wallColor,
      `!uvtt-config --wall-color|?{What color for wall lines? (transparent for none, #RRGGBB for a color)|${state[scriptName].config.wallColor}}`,
      `${_h.bold('Wall Color')} is the color that walls are drawn in on the Dynamic Lighting Layer.`
    );
    const getConfigOption_WallWidth = () => makeConfigOptionNum(
      state[scriptName].config.wallWidth,
      `!uvtt-config --wall-width|?{How many pixels wide for wall lines?|${state[scriptName].config.wallWidth}}`,
      `${_h.bold('Wall Width')} is the width that walls are drawn in on the Dynamic Lighting Layer in pixels. Current value: ${_h.bold(state[scriptName].config.wallWidth)}`
    );


    // Doors
    const getConfigOption_UseDoorObjects = () => makeConfigOption(
      state[scriptName].config.useDoorObjects,
      `!uvtt-config --toggle-use-door-objects`,
      `${_h.bold('Use Door Objects')} controls whether the new Door Objects will be used, rather than lines. (UDL Only). Current value: ${_h.bold(state[scriptName].config.useDoorObjects ? 'On' : 'Off')}`
    );

    const getConfigOption_DoorColor = () => makeConfigOptionColor(
      state[scriptName].config.doorColor,
      `!uvtt-config --door-color|?{What color for door lines? (transparent for none, #RRGGBB for a color)|${state[scriptName].config.doorColor}}`,
      `${_h.bold('Door Color')} is the color that doors are drawn in on the Dynamic Lighting Layer.`
    );

    const getConfigOption_DoorWidth = () => makeConfigOptionNum(
      state[scriptName].config.doorWidth,
      `!uvtt-config --door-width|?{How many pixels wide for door lines?|${state[scriptName].config.doorWidth}}`,
      `${_h.bold('Door Width')} is the width that doors are drawn in on the Dynamic Lighting Layer in pixels. Current value: ${_h.bold(state[scriptName].config.doorWidth)}`
    );

    // Objects
    const getConfigOption_ObjectColor = () => makeConfigOptionColor(
      state[scriptName].config.objectColor,
      `!uvtt-config --object-color|?{What color for object lines? (transparent for none, #RRGGBB for a color)|${state[scriptName].config.objectColor}}`,
      `${_h.bold('Object Color')} is the color that objects are drawn in on the Dynamic Lighting Layer.`
    );

    const getConfigOption_ObjectTransparent = () => makeConfigOption(
      state[scriptName].config.objectTransparent,
      `!uvtt-config --toggle-object-transparent`,
      `${_h.bold('Object Transparent')} controls if the Objects should be see through, but block movement (UDL Only). Current value: ${_h.bold(state[scriptName].config.objectTransparent ? 'On' : 'Off')}`
    );

    const getConfigOption_ObjectWidth = () => makeConfigOptionNum(
      state[scriptName].config.objectWidth,
      `!uvtt-config --object-width|?{How many pixels wide for object lines?|${state[scriptName].config.objectWidth}}`,
      `${_h.bold('Object Width')} is the width that objects are drawn in on the Dynamic Lighting Layer in pixels. Current value: ${_h.bold(state[scriptName].config.objectWidth)}`
    );


    // Lights
    const getConfigOption_DLLightMarkerColor = () => makeConfigOptionColor(
      state[scriptName].config.dlLightMarkerColor,
      `!uvtt-config --dl-light-marker-color|?{What aura color lights? (transparent for none, #RRGGBB for a color)|${state[scriptName].config.dlLightMarkerColor}}`,
      `${_h.bold('DL Layer Light Marker Color')} is the color of the aura around lights on the Dynamic Lighting Layer.`
    );

    const getConfigOption_UseLightColor = () => makeConfigOption(
      state[scriptName].config.useLightColor,
      `!uvtt-config --toggle-use-light-color`,
      `${_h.bold('Use Light Color')} controls if imported light color is applied to lights (UDL Only). Current value: ${_h.bold(state[scriptName].config.useLightColor ? 'On' : 'Off')}`
    );

    const getAllConfigOptions = () => getConfigOption_OpenPortalsMode() +
      getConfigOption_UseWindowObjects() +
      getConfigOption_WindowColor() +
      getConfigOption_WindowWidth() +
      getConfigOption_WallColor() +
      getConfigOption_WallWidth() +
      getConfigOption_UseDoorObjects() +
      getConfigOption_DoorColor() +
      getConfigOption_DoorWidth() +
      getConfigOption_ObjectColor() +
      getConfigOption_ObjectWidth() +
      getConfigOption_ObjectTransparent() +
      getConfigOption_DLLightMarkerColor() +
      getConfigOption_UseLightColor() ;


  const helpParts = {
    helpBody: (context) => _h.join(
      _h.header(
        _h.paragraph(`${scriptName} provides a way to setup Dynamic Lighting lines and Lights stored in Universal VTT format, ala Dungeondraft.`)
        ),
        _h.subhead('Commands'),
        _h.inset(
          _h.font.command(
            `!uvtt`,
            _h.optional(
              '--help',
              `--clear`,
              `--no-objects`
            )
          ),
          _h.ul(
            `${_h.bold('--help')} -- Displays this help and configuration options.`,
            `${_h.bold('--clear')} -- Removes all imported content for the selected graphics.`,
            `${_h.bold('--no-objects')} -- Skips creating lines for Opaque Objects.`
            )
        ),
        _h.section('Import Process',
          _h.paragraph(`The process for importing is pretty straight forward, but there are several steps, as follows:`),
          _h.ol(
            `From your Universal VTT supporting mapping program, such as Dungeondraft, export your map as a ${_h.code('.png')} or ${_h.code('.jpg')} file.  The API cannot create images from the Universal VTT, so you will need to upload it manually.`,
            `Next export the Universal VTT version into a ${_h.code('.dd2vtt')} file.`,
            `Drop your map image file onto a page and scale it as desired.`,
            `Open the properties by double clicking the image.`,
            `Load the Universal VTT file in a text editor and copy the contents.  You can use the <a href="http://roll20api.net/uvtti.html">Universal VTT Import Sanitizer</a> do this efficiently.`,
            `Paste the contents into the GM Notes section of the map graphic and save changes.`,
            `With the graphic selected, run ${_h.code('!uvtt')}`
          ),
          _h.paragraph(`Your map should now have dynamic lighting lines, lines for doors and windows, and light sources from the original.`)
        ),
        ( playerIsGM(context.playerid)
          ?  _h.group(
              _h.subhead('Configuration'),
              getAllConfigOptions()
            )
          : ''
        )


    ),
    helpConfig: (context) => _h.outer(
      _h.title(scriptName, version),
      ( playerIsGM(context.playerid)
        ?  _h.group(
          _h.subhead('Configuration'),
          getAllConfigOptions()
          )
        : ''
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

  const showConfigHelp = function(playerid) {
    let who=(getObj('player',playerid)||{get:()=>'API'}).get('_displayname');
    let context = {
      who,
      playerid
    };
    sendChat('', '/w "'+who+'" '+ helpParts.helpConfig(context));
  };

  const sread = (o,p) => {
    let v = o;
    while(undefined !== v && p.length) {
      v = v[p.shift()];
    }
    return v;
  };

  const validateData = (d)=>d.hasOwnProperty('resolution') && d.hasOwnProperty('format') && d.format>=0.2;

  const GetLineCreator = (IDC, newPt,PageID,TokenID) => {
    const WallColor = state[scriptName].config.wallColor;
    const WallWidth = state[scriptName].config.wallWidth;

    return (l) => {
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
      const ld = {
        base: {x:minX, y:minY},
        size: {x:maxX-minX, y:maxY-minY},
        pts: pts
      };
      let p = createObj('path',{
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
        controlledby: TokenID,
        layer: "walls",
        path: JSON.stringify(ld.pts),
        pageid: PageID
      });
      IDC.recordObj(p);
      return 1;
    };
  };

  const GetObjectCreator = (IDC, newPt,PageID,TokenID) => {
    const ObjectColor = state[scriptName].config.objectColor;
    const ObjectWidth = state[scriptName].config.objectWidth;
    const ObjectBarrier = (state[scriptName].config.objectTransparent ? 'transparent' : 'wall');

    return (l) => {
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

      const ld = {
        base: {x:minX, y:minY},
        size: {x:maxX-minX, y:maxY-minY},
        pts: pts
      };

      let p = createObj('path',{
        fill: `${ObjectColor}66`,
        stroke: ObjectColor,
        stroke_width: ObjectWidth,
        rotation: 0,
        width: ld.size.x,
        height: ld.size.y,
        top: ld.base.y+(ld.size.y/2),
        left: ld.base.x+(ld.size.x/2),
        scaleX: 1,
        scaleY: 1,
        controlledby: TokenID,
        layer: "walls",
        barrierType: ObjectBarrier,
        path: JSON.stringify(ld.pts),
        pageid: PageID
      });
      IDC.recordObj(p);
      return 1;
    };
  };

  const GetPortalCreator = (IDC, newPt,PageID,TokenID,ptSub) => {
    const DoorColor = state[scriptName].config.doorColor;
    const DoorWidth = state[scriptName].config.doorWidth;
    const WindowWidth = state[scriptName].config.doorWidth;
    const WindowColor = state[scriptName].config.windowColor;
    const DoorOpenMode = state[scriptName].config.openPortalsMode;
    const AsDoorObject = state[scriptName].config.useDoorObjects;
    const AsWindowObject = state[scriptName].config.useWindowObjects;

    return (d) => {
      let center = newPt(d.position||{x:0,y:0});
      let pt0 = newPt(d.bounds[0]);
      let pt1 = newPt(d.bounds[1]);
      let hPt0 = ptSub(pt0,center);
      let hPt1 = ptSub(pt1,center);
      let size = { x: Math.abs(pt0.x-pt1.x), y: Math.abs(pt0.y-pt1.y) };
      let line = [
        ['M',pt0.x-(center.x-(size.x/2)), pt0.y-(center.y-(size.y/2))],
        ['L',pt1.x-(center.x-(size.x/2)), pt1.y-(center.y-(size.y/2))]
      ];
      const dd = {
        center,
        size,
        pts: line,
        closed: d.closed
      };

      const basePath = {
        fill: "transparent",
        rotation: 0,
        width: dd.size.x,
        height: dd.size.y,
        top: dd.center.y,
        left: dd.center.x,
        scaleX: 1,
        scaleY: 1,
        controlledby: TokenID,
        path: JSON.stringify(dd.pts),
        pageid: PageID
      };

      const baseObject = {
        x: center.x,
        y: -center.y,
        isOpen: false,
        isLocked: false,
        isSecret: false,
        controlledby: TokenID,
        path: {
          handle0: {
            x: hPt0.x,
            y: -hPt0.y
          },
          handle1: {
            x: hPt1.x,
            y: -hPt1.y
          }
        },
        _pageid: PageID
      };

      // Closed doors, or doors on GM Layer are doors.  Everything else is a window.
      let isDoor = dd.closed || 'GM_LINE' === DoorOpenMode;

      if(isDoor){
        // either draw a line or make a door object.
        if(AsDoorObject) {
          let d = createObj('door',{...baseObject,color:DoorColor});
          IDC.recordObj(d);
        } else {
          let layer = ('GM_LINE' === DoorOpenMode ? 'gmlayer' : 'walls');
          let p = createObj('path',{
            ...basePath,
            stroke: DoorColor,
            stroke_width: DoorWidth,
            layer: layer
          });
          IDC.recordObj(p);
        }
        return 1;

      } else if('NONE' !== DoorOpenMode) {
        if('GLASS_WINDOW' === DoorOpenMode) {
          let glass = createObj('path',{
            ...basePath,
            stroke: WindowColor,
            stroke_width: WindowWidth,
            layer: 'map'
          });
          toFrontFixed(glass);
          IDC.recordObj(glass);
        }
        // make a line or a window object
        if(AsWindowObject){
          let w = createObj('window',{...baseObject,color:WindowColor.substr(0,7)});
          IDC.recordObj(w);
        } else {
          let p = createObj('path',{
            ...basePath,
            stroke: WindowColor,
            stroke_width: DoorWidth,
            layer: 'walls',
            barrierType: 'transparent'
          });
          IDC.recordObj(p);
        }
        return 1;
      }
      return 0;
    };
  };

  const GetLightCreator = (IDC, newPt,PageID,TokenID,PageScale) => {
    const LightColor = state[scriptName].config.dlLightMarkerColor;

    return (l) => {
      let pt = newPt(l.position);
      let r = l.range*PageScale;
      let dr = ((r/2)*(Math.pow(l.intensity,2)));
      let color = state[scriptName].config.useLightColor ? getNonAlphaColorScaled(argb2rgba(l.color)) : 'transparent';
      const ld = {pt,r,dr,color};
      let g = createObj('graphic',{
        imgsrc: clearURL,
        subtype: 'token',
        name: '',
        aura1_radius: -0.5,
        aura1_color: LightColor,

        // LDL
        light_otherplayers: true,
        light_dimradius: ld.dr,
        light_radius: ld.r,

        // UDL
        emits_bright_light: true,
        emits_low_light: true,
        bright_light_distance: ld.r-ld.dr,
        low_light_distance: ld.r,
        lightColor: ld.color,

        width:70,
        height:70,
        top: ld.pt.y,
        left: ld.pt.x,
        controlledby: TokenID,
        layer: "walls",
        pageid: PageID
      });
      IDC.recordObj(g);
      return 1;
    };
  };

  class IDCollector {
    #objRefs=[];

    constructor(objRefs=[]) {
      this.#objRefs=[...objRefs];
    }

    recordObj(obj) {
      this.#objRefs.push([obj.get('type'),obj.id]);
    }

    toJSON() {
      return [...this.#objRefs];
    }

  }

  const importUVTTonGraphic = (token, forceSkipObjects=false) => {
    let rawNotes = token.get('gmnotes');
    let notes = unescape(rawNotes).replace(/(?:<[^>]*>|\\t|&nbsp;)/g,'');
    let data;
    try {
      data = JSON.parse(notes);
    } catch( e ){
      return {error: "Universal VTT Data is missing or corrupt.", token};
    }

    if(!validateData(data)){
      return {error: "Universal VTT Data is invalid.", token};
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
    //const dppg = sread(data,['resolution','pixels_per_grid'])||70;
    const scaleFactorX = (tokenWidth/dataSizeX);
    const scaleFactorY = (tokenHeight/dataSizeY);
    const newX = (x) => tokenOriginX + ((x-dataOriginX)*scaleFactorX);
    const newY = (y) => tokenOriginY + ((y-dataOriginY)*scaleFactorY);
    const newPt = (pt) => ({x:newX(pt.x),y:newY(pt.y)});
    const ptSub = (pt0,pt1) => ({x:pt0.x-pt1.x,y:pt0.y-pt1.y});


    let page = getObj('page',token.get('pageid'));
    let stats = {token,lines:0,doors:0,objects:0,lights:0};

    const PageID = page.id;
    const PageScale = parseFloat(page.get('scale_number'));
    const TokenID = token.id;

    const idc = new IDCollector();

    // Walls
    const LineCreator = GetLineCreator(idc, newPt,PageID,TokenID);
    if(data.hasOwnProperty('line_of_sight')){
      let lines = sread(data,['line_of_sight'])||[];
      stats.lines+=lines.reduce((m,l)=>m+LineCreator(l),0);
    }


    // Objects
    const ObjectCreator = GetObjectCreator(idc, newPt,PageID,TokenID);
    if( ! forceSkipObjects && data.hasOwnProperty('objects_line_of_sight')){
      let lines = sread(data,['objects_line_of_sight'])||[];
      stats.objects+=lines.reduce((m,l)=>m+ObjectCreator(l),0);
    }


    // Doors and Windows
    const PortalCreator = GetPortalCreator(idc,newPt,PageID,TokenID, ptSub);
    if(data.hasOwnProperty('portals')) {
      let doors = sread(data,['portals'])||[];
      stats.doors+=doors.reduce((m,l)=>m+PortalCreator(l),0);
    }


    // Lights
    const LightCreator = GetLightCreator(idc, newPt,PageID,TokenID,PageScale);
    if(data.hasOwnProperty('lights')) {
      let lights = sread(data,['lights']);
      stats.lights+=lights.reduce((m,l)=>m+LightCreator(l),0);
          
    }
    token.set('tooltip',JSON.stringify(idc));

    // Possibly not needed anymore?
    if(true === page.get('dynamic_lighting_enabled')){
      page.set('force_lighting_refresh',true);
    }

    return stats;

  };

  const clearImportsFor = (g) => {
    try {
      (JSON.parse(g.get('tooltip'))||[])
        .map(o=>getObj(...o))
        .filter(o=>undefined !== o)
        .forEach(o=>o.remove())
        ;
    } catch(e){
      // fail means tooltip isn't set or is corrupt
    }
    // legacy remove lines
    findObjs({controlledby: g.id}).forEach(o=>o.remove());
  };

  class DoubleDashArgs {
    #cmd;
    #args;

    constructor(line){
      let p=line.split(/\s+--/);
      this.#cmd = p.shift();
      this.#args = [...p.map(a=>a.split(/\s+/))];
    }

    get cmd() {
      return this.#cmd;
    }

    get args() {
      return this.#args.map(a=>a[0]);
    }

    has(arg) {
      return !!this.#args.find(a=>arg===a[0]);
    }

    params(arg) {
      return [...(this.#args.find(a=>arg===a[0])||[])];
    }

    toObject() {
      return {cmd:this.#cmd,args:this.#args};
    }
  }

  // !uvtt 
  // !uvtt --help
  // !uvtt --clear
  // !uvtt --no-objects
  // !uvtt --ids foo bar baz
  const handleInput = (msg) => {
    if ( "api" === msg.type && /^!uvtt(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)) {
      let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
      let DDArgs= new DoubleDashArgs(msg.content);

      if(DDArgs.has('help')){
        showHelp(msg.playerid);
        return;
      }

      let graphics = (msg.selected || [])
        .map(o=>getObj('graphic',o._id))
        .filter(g=>undefined !== g)
				;

      if(DDArgs.has('ids')){
        graphics = [
          ...graphics,
          ...DDArgs.params('ids')
            .map(id=>getObj('graphic',id))
            .filter(g=>undefined !== g)
          ];
      }

      let skipObjects = DDArgs.has('no-objects');

      if(graphics.length) {
        if(DDArgs.has('clear')){
          graphics.forEach(clearImportsFor);
        } else {
          graphics
            .map(g=>(clearImportsFor(g),g))
            .map(g=>importUVTTonGraphic(g,skipObjects))
            .forEach(r=>{
              if(r.hasOwnProperty('error')){
                sendChat('',`/w "${who}" <div>Error: ${r.error}</div>`);
              } else {
                sendChat('',`/w "${who}" <div>Import complete. Lines: ${r.lines}, Object Lines: ${r.objects}, Doors: ${r.doors}, Lights: ${r.lights}</div>`);
              }
            });
        }
      } else {
        showHelp(msg.playerid);
      }

    } else if ( "api" === msg.type && /^!uvtt-config(\b\s|$)/i.test(msg.content) && playerIsGM(msg.playerid)) {
      let DDArgs= new DoubleDashArgs(msg.content);
      let who = (getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
      if(DDArgs.has('help')) {
        showHelp(msg.playerid);
        return;
      }
      if(!DDArgs.args.length) {
        showConfigHelp(msg.playerid);
        return;
      }

      DDArgs.args.forEach((a) => {
        let opt=a.split(/\|/);
        let omsg='';
        switch(opt.shift()) {
          case 'wall-color':
            if(opt[0].match(regex.colors)) {
              state[scriptName].config.wallColor=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_WallColor()+
              '</div>'
            );
            break;

          case 'wall-width':
            if(parseInt(opt[0])) {
              state[scriptName].config.wallWidth=parseInt(opt[0]);
            } else {
              omsg='<div><b>Error:</b> Not a valid width: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_WallWidth()+
              '</div>'
            );
            break;

          case 'toggle-use-window-objects':
            state[scriptName].config.useWindowObjects=!state[scriptName].config.useWindowObjects;
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              getConfigOption_UseWindowObjects()+
              '</div>'
            );
            break;


          case 'window-color':
            if(opt[0].match(regex.colorsRGBA)) {
              state[scriptName].config.windowColor=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_WindowColor()+
              '</div>'
            );
            break;

          case 'window-width':
            if(parseInt(opt[0])) {
              state[scriptName].config.windowWidth=parseInt(opt[0]);
            } else {
              omsg='<div><b>Error:</b> Not a valid width: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_WindowWidth()+
              '</div>'
            );
            break;

          case 'object-color':
            if(opt[0].match(regex.colors)) {
              state[scriptName].config.objectColor=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_ObjectColor()+
              '</div>'
            );
            break;

          case 'object-width':
            if(parseInt(opt[0])) {
              state[scriptName].config.objectWidth=parseInt(opt[0]);
            } else {
              omsg='<div><b>Error:</b> Not a valid width: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_ObjectWidth()+
              '</div>'
            );
            break;

          case 'toggle-use-door-objects':
            state[scriptName].config.useDoorObjects=!state[scriptName].config.useDoorObjects;
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              getConfigOption_UseDoorObjects()+
              '</div>'
            );
            break;

          case 'door-color':
            if(opt[0].match(regex.colors)) {
              state[scriptName].config.doorColor=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_DoorColor()+
              '</div>'
            );
            break;

          case 'door-width':
            if(parseInt(opt[0])) {
              state[scriptName].config.doorWidth=parseInt(opt[0]);
            } else {
              omsg='<div><b>Error:</b> Not a valid width: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_DoorWidth()+
              '</div>'
            );
            break;


          case 'light-color':
          case 'dl-light-marker-color':
            if(opt[0].match(regex.colors)) {
              state[scriptName].config.dlLightMarkerColor=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
                omsg+
                getConfigOption_DLLightMarkerColor()+
              '</div>'
            );
            break;

          case 'toggle-object-transparent':
            state[scriptName].config.objectTransparent=!state[scriptName].config.objectTransparent;
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              getConfigOption_ObjectTransparent()+
              '</div>'
            );
            break;

          case 'toggle-use-light-color':
            state[scriptName].config.useLightColor=!state[scriptName].config.useLightColor;
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              getConfigOption_UseLightColor()+
              '</div>'
            );
            break;

          case 'toggle-create-open-portals':
            switch(state[scriptName].config.openPortalsMode) {
              case 'NONE':
                state[scriptName].config.openPortalsMode='GM_LINE';
                break;

              default:
                state[scriptName].config.openPortalsMode='NONE';
                break;
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              getConfigOption_OpenPortalsMode()+
              '</div>'
            );
            break;

          case 'open-portals-mode':
            if(OpenPortalOptions.hasOwnProperty(opt[0])){
              state[scriptName].config.openPortalsMode=opt[0];
            } else {
              omsg='<div><b>Error:</b> Not a valid color: '+opt[0]+'</div>';
            }
            sendChat('','/w "'+who+'" '+
              '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'+
              omsg+
              getConfigOption_OpenPortalsMode()+
              '</div>'
            );
            break;


          default:
            sendChat('','/w "'+who+'" '+
            '<div><b>Unsupported Option:</div> '+a+'</div>');
        }

      });
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

{try{throw new Error('');}catch(e){API_Meta.UniversalVTTImporter.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.UniversalVTTImporter.offset);}}
