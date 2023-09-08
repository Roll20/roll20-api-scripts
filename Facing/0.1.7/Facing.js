// Github:   https://github.com/shdwjk/Roll20API/blob/master/Facing/Facing.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.Facing={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.Facing.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

const Facing = (() => { // eslint-disable-line no-unused-vars

  const scriptName = 'Facing';
  const version = '0.1.7';
  API_Meta.Facing.version = version;
  const lastUpdate = 1692240810;
  const schemaVersion = 0.3;
  const defaults = {
    image: 'https://s3.amazonaws.com/files.d20.io/images/9183999/XcViJVf7-cGOXcZq1KWp-A/thumb.png?1430541914',
    attributeName: 'facing',
    scale: 2.5
  };
  const indicatorLayers = ['map', 'objects' ];


  const checkInstall = () => {
    log('-=> Facing v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

    if( ! state.hasOwnProperty(scriptName) || state[scriptName].version !== schemaVersion) {
      log('  > Updating Schema to v'+schemaVersion+' <');
      switch(state[scriptName] && state[scriptName].version) {

        case 0.2:
          state[scriptName].config.indicatorLayer = 'map';
          /* break; // intentional dropthrough */ /* falls through */

        case 0.1:
          state[scriptName].config.centering = false;
          /* break; // intentional dropthrough */ /* falls through */


        case 'UpdateSchemaVersion':
          state[scriptName].version = schemaVersion;
          break;

        default:
          state[scriptName] = {
            version: schemaVersion,
            config: {
              image: defaults.image,
              attributeName: defaults.attributeName,
              relative: true,
              scale: defaults.scale,
              centering: false,
              indicatorLayer: 'map'
            },
            ringed: {}
          };
          break;
      }
    }

    validatePairs();
  };

  const validatePairs = () => {
    let masters = Object.keys(state[scriptName].ringed);
    let cnt = 0;
    const burndown = () => {
      let id = masters.shift();
      if(id){
        let m = getObj('graphic', id);
        let s = getObj('graphic', state[scriptName].ringed[id]);
        if(!m){
          if(s){
            s.remove();
          }
          delete state[scriptName].ringed[id];
          ++cnt;
        } else if(!s) {
          delete state[scriptName].ringed[id];
          ++cnt;
        }
        setTimeout(burndown,0);
      } else {
        if(cnt){
          sendChat('Facing',`/w gm <div>Cleaned up broken facing pairs: <code>${cnt}</code></div>`);
        }
      }
    };
    burndown();
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

  const getCleanImgsrc = (imgsrc) => {
    let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
    if(parts) {
      return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
    }
    return;
  };

  const getRingedPair = (id) => {
    let ringed;
    Object.keys(state[scriptName].ringed).find(masterid=>{
      let slaveid = state[scriptName].ringed[masterid];
      if(id === masterid || id === slaveid) {
        ringed = {
          master: getObj('graphic',masterid),
          slave: getObj('graphic',slaveid)
        };
        if(!ringed.master){
          ringed.slave.remove();
          delete state[scriptName].ringed[masterid];
          ringed = undefined;
        } else if(!ringed.slave) {
          delete state[scriptName].ringed[masterid];
          ringed = undefined;
        } else {
          ringed.attribute = findObjs({
            type: 'attribute',
            name: state[scriptName].config.attributeName,
            characterid: ringed.master && ringed.master.get('represents')
          })[0] || {set:()=>{}};
        }

        return true;
      }
      return false;
    });
    return ringed;
  };

  const getRinged = (id) => {
    let ringed;
    Object.keys(state[scriptName].ringed).find(masterid=>{
      let slaveid = state[scriptName].ringed[masterid];
      if(id === masterid){
        ringed = getObj('graphic',slaveid);
        return true;
      } 
      if(id === slaveid) {
        ringed = getObj('graphic',masterid);
        return true;
      } 
      return false;
    });
    return ringed;
  };


  const createRinged = (id) => {
    // get root obj
    const master = getObj('graphic',id);
    let slave = getRinged(id);

    if(!slave && master) {
      let layer=( 'gmlayer' === master.get('layer') ? 'gmlayer' : state[scriptName].config.indicatorLayer);
      let dim=(Math.max(master.get('height'),master.get('width'))*state[scriptName].config.scale);
      slave = createObj('graphic',{
        imgsrc: state[scriptName].config.image,
        layer: layer,
        pageid: master.get('pageid'),
        top: master.get('top'),
        left: master.get('left'),
        height: dim,
        width: dim,
        rotation: master.get('rotation')
      });
      master.set({
        rotation: 0
      });

      ( findObjs({
        type: 'attribute',
        name: state[scriptName].config.attributeName,
        characterid: master.get('represents')
      })[0] || (master.get('represents') && createObj('attribute',{
        name: state[scriptName].config.attributeName,
        characterid: master.get('represents')
      })) || { set: ()=>{} }).set({
        current: slave.get('rotation')
      });


      if('gmlayer' === layer || 'objects' == state[scriptName].config.indicatorLayer) {
        toBack(slave);
      } else {
        toFront(slave);
      }
      state[scriptName].ringed[master.id]=slave.id;
    }
  };

  const fixIndicatorLayer = () => {
    let masters = Object.keys(state[scriptName].ringed);

    const burndown = () => {
      let id = masters.shift();
      let defer = 0;
      if(id){
        let m = getObj('graphic',id);
        let s = getObj('graphic',state[scriptName].ringed[id]);
        if(s){
          let layer = m.get('layer');
          let sLayer = s.get('layer');
          switch(layer){
            case 'gmlayer':
              if(sLayer !== 'gmlayer'){
                s.set({ layer: 'gmlayer'});
                toBack(s);
                defer = 50;
              }
              break;

            default:
              if(sLayer !== state[scriptName].config.indicatorLayer) {
                s.set({ layer: state[scriptName].config.indicatorLayer });
                if( 'objects' == state[scriptName].config.indicatorLayer) {
                  toBack(s);
                  defer = 50;
                } else {
                  toFront(s);
                  defer = 1000;
                }
              }
              break;
          }
        }
        setTimeout(burndown,defer);
      }
    };
    setTimeout(burndown,0);
  };

  const removeRinged = (id) => {
    let pair=getRingedPair(id);
    if(pair) {
      if(id === pair.master.id ) {
        pair.slave.remove();
      }
      delete state[scriptName].ringed[pair.master.id];
    }
  };

  const zeroToken = (id) => {
    let pair=getRingedPair(id);
    if(pair) {
      pair.slave.set({
        rotation: 0
      });
    }
  };

  const facingToken = (id) => {
    let pair=getRingedPair(id);
    if(pair) {
      removeRinged(id);
    } else {
      createRinged(id);
    }
  };

  const handleRemoveToken = (obj) => {
    // special handling for deleting slaves?
    removeRinged(obj.id);
  };

  const handleTokenChange = (obj,prev) => {
    let pair = getRingedPair(obj.id);
    if(pair) {
      if(pair.master.id === obj.id) {

        let loc = {
          top: obj.get('top'),
          left: obj.get('left'),
          width: obj.get('width'),
          height: obj.get('height')
        };

        if(state[scriptName].config.centering &&
          ( loc.left !== prev.left || loc.top !== prev.top) &&
          ( loc.width < 70 || loc.height < 70)
        ){
          loc.left = loc.left+35-(loc.width/2);
          loc.top = loc.top+35-(loc.height/2);
        }

        let layer=( 'gmlayer' === pair.master.get('layer') ? 'gmlayer' : state[scriptName].config.indicatorLayer );
        let dim=(Math.max(pair.master.get('height'),pair.master.get('width'))*state[scriptName].config.scale);

        let rot=pair.master.get('rotation');

        if(rot !== prev.rotation ) {
          if(state[scriptName].config.relative) {
            rot = (pair.slave.get('rotation') + rot + 360) % 360;
          } 
        } else {
          rot = pair.slave.get('rotation');
        }

        pair.attribute.set({
          current: rot
        });

        pair.slave.set({
          layer: layer,
          top: loc.top,
          left: loc.left,
          height: dim,
          width: dim,
          rotation: rot
        });

        pair.master.set({
          rotation: 0,
          top: loc.top,
          left: loc.left
        });

        if('gmlayer' === layer || 'objects' == state[scriptName].config.indicatorLayer) {
          toBack(pair.slave);
        } else {
          toFront(pair.slave);
        }
      } else {
        pair.slave.set({
          width: prev.width,
          height: prev.height,
          top: prev.top,
          left: prev.left,
          layer: prev.layer,
          flipv: prev.flipv,
          fliph: prev.fliph
        });

        pair.attribute.set({
          current: pair.slave.get('rotation')
        });
      }
    }
  };

  const getConfigOption_RingImage = () => {
    let text = state[scriptName].config.image;
    return '<div>'+
      'Direction Indicator:'+
      '<img src="'+text+'" style="width: 70px; height: 70px;">'+
      '<a href="!facing-config --set-image|&#64;{target|token_id}">'+
      'Pick'+
      '</a>'+
      '<a href="!facing-config --set-image|">'+
      'Default'+
      '</a>'+
      '</div>';
  };

  const getConfigOption_AttributeName = () => {
    let text = state[scriptName].config.attributeName;
    return '<div>'+
      'Attribute Name to set facing value: <b>'+
      text+
      '</b><a href="!facing-config --set-attribute-name|?{What attribute should the facing be stored in (empty for default):|'+state[scriptName].config.attributeName+'}">'+
      'Set Name'+
      '</a>'+
      '</div>';
  };

  const getConfigOption_Relative = () => {
    let text = (state[scriptName].config.relative ? 'On' : 'Off' );
    return '<div>'+
      'Relative Rotation is currently <b>'+
      text+
      '</b> '+
      '<a href="!facing-config --toggle-relative">'+
      'Toggle'+
      '</a>'+
      '</div>';

  };

  const getConfigOption_Scale = () => {
    let text = state[scriptName].config.scale;
    return '<div>'+
      'Scale is currently <b>'+
      text+
      '</b> '+
      '<a href="!facing-config --set-scale|?{Scale to adjust Facing Token to (empty for default):|'+state[scriptName].config.scale+'}">'+
      'Set'+
      '</a>'+
      '</div>';

  };

  const getConfigOption_Centering = () => {
    let text = (state[scriptName].config.centering ? 'On' : 'Off' );
    return '<div>'+
      'Centering of small tokens is currently <b>'+
      text+
      '</b> '+
      '<a href="!facing-config --toggle-centering">'+
      'Toggle'+
      '</a>'+
      '</div>';
  };

  const getConfigOption_IndicatorLayer = () => {
    return '<div>'+
      'Layer to display the visible facing indicator <b>'+
      state[scriptName].config.indicatorLayer +
      '</b> '+
      `<a href="!facing-config --set-indicator-layer|?{Layer|${
        state[scriptName].config.indicatorLayer
      }|${indicatorLayers.filter(l=>l != state[scriptName].config.indicatorLayer).join('|')}}">`+
      'Select'+
      '</a>'+
      '</div>';

  };

  const getAllConfigOptions = () => {
    return getConfigOption_RingImage()+
      getConfigOption_AttributeName()+
      getConfigOption_Relative()+
      getConfigOption_Scale()+
      getConfigOption_Centering()+
      getConfigOption_IndicatorLayer();
  };

  const showHelp = (who) => {

    sendChat('','/w "'+who+'" '
      +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
      +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
      +'Facing v'+version
      +'</div>'
      +'<div style="padding-left:10px;margin-bottom:3px;">'
      +'<p>Facing adds a ring below the selected token with a pointer for the direction the token is facing.  Rotating the token will rotate the ring and then the token will reset to no rotation.  If the token is associated with a character, Facing will maintain an attribute on the character with the current facing stored in it.</p>'
      +'</div>'
      +'<b>Commands</b>'
      +'<div style="padding-left:10px;">'
      +'<b><span style="font-family: serif;">!facing [--help]</span></b>'
      +'<div style="padding-left: 10px;padding-right:20px">'
      +'<p>Adds or removes the Facing ring below a token.</p>'
      +'<ul>'
      +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
      +'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
      +'</li> '
      +'</ul>'
      +'</div>'
      +'</div>'
      +'<div style="padding-left:10px;">'
      +'<b><span style="font-family: serif;">!zero [--help]</span></b>'
      +'<div style="padding-left: 10px;padding-right:20px">'
      +'<p>Aligns the indicator to north.</p>'
      +'<ul>'
      +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
      +'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
      +'</li> '
      +'</ul>'
      +'</div>'
      +'</div>'
      +getAllConfigOptions()
      +'</div>'
    );
  };

  const handleInput = (msg) => {
    let args, who;

    if (msg.type !== "api" ) {
      return;
    }
    who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');

    args = msg.content.split(/\s+/);
    switch(args.shift()) {
      case '!facing':
        if(!msg.selected || args.includes('--help')) {
          showHelp(who);
          return;
        }
        msg.selected.forEach((s) => {
          facingToken(s._id,who);
        });
        break;
      case '!zero':
        if(!msg.selected || args.includes('--help')) {
          showHelp(who);
          return;
        }
        msg.selected.forEach((s) => {
          zeroToken(s._id,who);
        });
        break;


      case '!facing-config':
        if(!playerIsGM(msg.playerid)) {
          sendChat('','/w "'+who+'" '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div><b>Error:</b> Only the GM may configure Facing.</div>'
            +'</div>'
          );
          return;
        }
        if(args.includes('--help')) {
          showHelp(who);
          return;
        }
        if(!args.length) {
          sendChat('','/w "'+who+'" '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
            +'Facing v'+version
            +'</div>'
            +getAllConfigOptions()
            +'</div>'
          );
          return;
        }
        args.forEach((a) => {
          let opt=a.split(/\|/),
            tmp,omsg='';
          switch(opt.shift()) {

            case '--set-image':
              if(opt.length && opt[0].length) {
                tmp=getObj('graphic',opt[0]);
                if(tmp && getCleanImgsrc(tmp.get('imgsrc')) ) {
                  state[scriptName].config.image = getCleanImgsrc(tmp.get('imgsrc'));
                } else {
                  omsg='<div><b>Error:</b> '+
                    ( tmp  ? 'Cannot use Marketplace Images.' : 'Not a valid ID: '+opt[0]) +'</div>';
                }
              } else {
                state[scriptName].config.image = defaults.image;
              }
              sendChat('','/w "'+who+'" '
                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +omsg
                +getConfigOption_RingImage()
                +'</div>'
              );
              break;
            case '--set-attribute-name':
              if(opt.length && opt[0].length) {
                state[scriptName].config.attributeName = opt[0];
              } else {
                state[scriptName].config.attributeName = defaults.attributeName;
              }
              sendChat('','/w "'+who+'" '
                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +getConfigOption_AttributeName()
                +'</div>'
              );
              break;

            case '--toggle-relative':
              state[scriptName].config.relative=!state[scriptName].config.relative;
              sendChat('','/w "'+who+'" '
                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +getConfigOption_Relative()
                +'</div>'
              );
              break;

            case '--toggle-centering':
              state[scriptName].config.centering=!state[scriptName].config.centering;
              sendChat('','/w "'+who+'" '
                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +getConfigOption_Centering()
                +'</div>'
              );
              break;

            case '--set-indicator-layer':
              if(opt.length && opt[0].length &&  indicatorLayers.includes(opt[0].toLowerCase()) ) {
                if(state[scriptName].config.indicatorLayer !== opt[0].toLowerCase()){
                  state[scriptName].config.indicatorLayer = opt[0].toLowerCase();
                  fixIndicatorLayer();
                }

                sendChat('','/w "'+who+'" '
                  +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                  +getConfigOption_IndicatorLayer()
                  +'</div>'
                );
              }
              break;

            case '--set-scale':
              if(opt.length && opt[0].length) {
                tmp = parseFloat(opt[0]);
                if(tmp) {
                  state[scriptName].config.scale = tmp;
                } else {
                  omsg='<div><b>Error:</b> Not a valid number: '+opt[0]+'</div>';
                }
              } else {
                state[scriptName].config.scale = defaults.scale;
              }
              sendChat('','/w "'+who+'" '
                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                +omsg
                +getConfigOption_Scale()
                +'</div>'
              );
              break;

            default:
              sendChat('','/w "'+who+'" '
                +'<div><b>Unsupported Option:</div> '+a+'</div>'
              );
          }

        });

        break;
    }
  };

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
    on('change:graphic', handleTokenChange);
    on('destroy:graphic', handleRemoveToken);
  };

  on('ready', () => {
    checkInstall();
    registerEventHandlers();
  });

})();

{try{throw new Error('');}catch(e){API_Meta.Facing.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.Facing.offset);}}
