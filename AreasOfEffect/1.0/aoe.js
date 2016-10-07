var AreasOfEffect = (() => {
  'use strict';

  let MENU_CMD = '!areasOfEffectShowMenu';
  let ADD_EFFECT_CMD = '!areasOfEffectAddEffect';
  let APPLY_EFFECT_CMD = '!areasOfEffectApplyEffet';
  let DEL_EFFECT_CMD = '!areasOfEffectDeleteEffect';
  let SHOW_EFFECTS_CMD = '!areasOfEffectShowEffects';
  let VERSION = '1.0';

  let MENU_CSS = {
    'effectsTable': {
      'width': '100%'
    },
    'effectThumbnail': {
      'height': '50px',
      'width': '50px'
    },
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #000',
      'border-radius': '5px',
      'font-weight': 'bold',
      'margin-bottom': '1em',
      'overflow': 'hidden'
    },
    'menuBody': {
      'padding': '5px',
      'text-align': 'center'
    },
    'menuHeader': {
      'background': '#000',
      'color': '#fff',
      'text-align': 'center'
    }
  };

  /**
   * A saved area of effect graphic.
   * @typedef {object} AreaOfEffect
   * @property {string} name
   * @property {number} rotateOffset
   *           The offset of the rotation facing for the effect's graphic
   *           from 0, going clockwise in radians.
   * @property {Mat3} ptTransform
   *           The offset of the effect's graphic from its origin.
   * @property {number} scale
   *           The scale of the image's width compared to the length of the segments drawn for it.
   * @property {string} imgsrc
   *           The URL of the effect's image.
   */

   /**
    * Applies an effect to a path.
    * @param {string} who
    * @param {string} playerid
    * @param {string} name
    * @param {Path} path
    */
   function applyEffect(who, playerid, name, path) {
     let effect = state.AreasOfEffect.saved[name];

     let segment = PathMath.toSegments(path)[0];
     let u = VecMath.sub(segment[1], segment[0]);
     let radians = Math.atan2(u[1], u[0]);
     let rotation = (radians + effect.rotateOffset)/Math.PI*180;
     let width = VecMath.length(u)*effect.scale;

     let m = MatrixMath.rotate(radians);
     m = MatrixMath.multiply(m, MatrixMath.scale(VecMath.length(u)));
     m = MatrixMath.multiply(m, effect.ptTransform);
     let v = MatrixMath.multiply(m, [0, 0, 1]);
     let pt = VecMath.add(segment[0], v);

     let graphic = createObj('graphic', {
       name: effect.name,
       _pageid: path.get('_pageid'),
       layer: 'objects',
       left: pt[0],
       top: pt[1],
       rotation: rotation,
       width: width,
       height: width/effect.aspectRatio,
       imgsrc: _getCleanImgsrc(effect.imgsrc),
       controlledby: playerid
     });
     toBack(graphic);

      path.remove();
   }

   /**
    * Deletes a saved area of effect.
    * @param {string} who
    * @param {string} playerid
    * @param {string} name
    */
   function deleteEffect(who, playerid, name) {
     delete state.AreasOfEffect.saved[name];
     _showEffectsListMenu(who, playerid);
   }

   /**
    * Fixes msg.who.
    * @param {string} who
    * @return {string}
    */
   function _fixWho(who) {
     return who.replace(/\(GM\)/, '').trim();
   }

   /**
    * Cookbook.getCleanImgsrc
    * https://wiki.roll20.net/API:Cookbook#getCleanImgsrc
    */
   function _getCleanImgsrc(imgsrc) {
     var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
     if(parts)
       return parts[1]+'thumb'+parts[3];
     throw new Error('Only images that you have uploaded to your library ' +
       'can be used as custom status markers. ' +
       'See https://wiki.roll20.net/API:Objects#imgsrc_and_avatar_property_restrictions for more information.');
   }

  /**
   * Initializes the state of this script.
   */
  function _initState() {
    _.defaults(state, {
      AreasOfEffect: {}
    });
    _.defaults(state.AreasOfEffect, {
      saved: {}
    });
  }

  /**
   * Checks if the chat message starts with some API command.
   * @private
   * @param {Msg} msg   The chat message for the API command.
   * @param {String} cmdName
   * @return {Boolean}
   */
  function _msgStartsWith(msg, cmdName) {
      var msgTxt = msg.content;
      return (msg.type == 'api' && msgTxt.indexOf(cmdName) !== -1);
  }

  /**
   * Saves an area of effect.
   * @param {string} who
   * @param {string} playerid
   * @param {string} name
   * @param {Graphic} effect
   * @param {Path} path
   */
  function saveEffect(who, playerid, name, effect, path) {
    let segment = PathMath.toSegments(path)[0];
    let u = VecMath.sub(segment[1], segment[0]);

    let pt = [
      effect.get('left'),
      effect.get('top')
    ];
    let scale = effect.get('width')/VecMath.length(u);
    let radians = -Math.atan2(u[1], u[0]);
    let v = VecMath.sub(pt, segment[0]);
    let vHat = VecMath.normalize(v);

    let m = MatrixMath.identity(3);
    m = MatrixMath.multiply(m, MatrixMath.scale(VecMath.length(v)/ VecMath.length(u)));
    m = MatrixMath.multiply(m, MatrixMath.rotate(radians));
    m = MatrixMath.multiply(m, MatrixMath.translate(vHat));

    // Save the effect.
    state.AreasOfEffect.saved[name] = {
      name: name,
      ptTransform: m,
      rotateOffset: effect.get('rotation')/180*Math.PI + radians,
      scale: scale,
      aspectRatio: effect.get('width')/effect.get('height'),
      imgsrc: _getCleanImgsrc(effect.get('imgsrc'))
    };

    // Delete the effect graphic and path.
    effect.remove();
    path.remove();

    _whisper(who, 'Created Area of Effect: ' + name);
    _showMainMenu(who, playerid);
  }

  /**
   * Shows the list of effects which can be applied to a selected path.
   * @param {string} who
   * @param {string} playerid
   */
  function _showEffectsListMenu(who, playerid) {
    let content = new HtmlBuilder('div');
    let effects = _.values(state.AreasOfEffect.saved).sort(function(a,b) {
      if(a.name < b.name)
        return -1;
      else if(a.name > b.name)
        return 1;
      else
        return 0;
    });

    let table = content.append('table.effectsTable');
    _.each(effects, effect => {
      let row = table.append('tr');
      row.append('td.effectThumbnail', new HtmlBuilder('img', '', {
        src: effect.imgsrc
      }));
      row.append('td', '[' + effect.name + '](' + APPLY_EFFECT_CMD + ' ' + effect.name + ')');

      // The GM is allowed to delete effects.
      if(playerIsGM(playerid))
        row.append('td', '[❌](' + DEL_EFFECT_CMD + ' ' + effect.name + ' ?{Delete effect: Are you sure?|yes|no})');
    });
    content.append('div', '[Back](' + MENU_CMD + ')');

    let menu = _showMenuPanel('Choose effect', content);
    _whisper(who, menu.toString(MENU_CSS));
  }

  /**
   * Shows the main menu for script.
   * @param {string} who
   * @param {string} playerid
   */
  function _showMainMenu(who, playerId) {
    let content = new HtmlBuilder('div');
    content.append('div', '[Apply an effect](' + SHOW_EFFECTS_CMD + ')');
    if(playerIsGM(playerId))
      content.append('div', '[Save effect](' + ADD_EFFECT_CMD + ' ?{Save Area of Effect: name})');

    let menu = _showMenuPanel('Main Menu', content);
    _whisper(who, menu.toString(MENU_CSS));
  }

  /**
   * Displays one of the script's menus.
   * @param {string} header
   * @param {(string|HtmlBuilder)} content
   * @return {HtmlBuilder}
   */
  function _showMenuPanel(header, content) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', header);
    menu.append('.menuBody', content)
    return menu;
  }

  /**
   * @private
   * Whispers a Marching Order message to someone.
   */
  function _whisper(who, msg) {
    sendChat('Areas Of Effect', '/w "' + _fixWho(who) + '" ' + msg);
  }


  /**
   * Check that the menu macro for this script is installed.
   */
  on('ready', () => {
    let menuMacro = findObjs({
      _type: 'macro',
      name: 'AreasOfEffectMenu'
    })[0];

    if(!menuMacro) {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'AreasOfEffectMenu',
          action: MENU_CMD,
          visibleto: 'all'
        });
      })
    }

    _initState();
    log('--- Initialized Areas Of Effect v' + VERSION + ' ---');
  });

  /**
   * Set up our chat command handler.
   */
  on("chat:message", function(msg) {
    try {
      if(_msgStartsWith(msg, ADD_EFFECT_CMD)) {
        let argv = msg.content.split(' ');
        let name = argv.slice(1).join('_');

        let graphic, path;
        _.each(msg.selected, item => {
          if(item._type === 'graphic')
            graphic = getObj('graphic', item._id);
          if(item._type === 'path')
            path = getObj('path', item._id);
        });

        if(graphic && path) {
          saveEffect(msg.who, msg.playerid, name, graphic, path);
        }
        else {
          _whisper(msg.who, 'ERROR: You must select a graphic and a path to save an effect.');
        }
      }
      else if(_msgStartsWith(msg, APPLY_EFFECT_CMD)) {
        let argv = msg.content.split(' ');
        let name = argv.slice(1).join('_');

        let path;
        _.each(msg.selected, item => {
          if(item._type === 'path')
            path = getObj('path', item._id);
        });

        if(path)
          applyEffect(msg.who, msg.playerid, name, path);
        else
          _whisper(msg.who, 'ERROR: You must select a path to apply the effect to.');
      }
      else if(_msgStartsWith(msg, DEL_EFFECT_CMD)) {
        let argv = msg.content.split(' ');
        let name = argv[1];
        let confirm = argv[2];

        if(confirm === 'yes')
          deleteEffect(msg.who, msg.playerid, name);
      }
      else if(_msgStartsWith(msg, SHOW_EFFECTS_CMD)) {
        _showEffectsListMenu(msg.who, msg.playerid)
      }
      else if(_msgStartsWith(msg, MENU_CMD)) {
        _showMainMenu(msg.who, msg.playerid);
      }
    }
    catch(err) {
      log('Areas Of Effect ERROR: ' + err.message);
      sendChat('Areas Of Effect ERROR:', '/w ' + _fixWho(msg.who) + ' ' + err.message);
      log(err.stack);
    }
  });
})();
