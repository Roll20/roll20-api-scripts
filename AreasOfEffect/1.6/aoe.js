var AreasOfEffect = (() => {
  'use strict';

  let MENU_CMD = '!areasOfEffectShowMenu';
  let ADD_EFFECT_CMD = '!areasOfEffectAddEffect';
  let APPLY_EFFECT_AT_PATH_CMD = '!areasOfEffectApplyEffectAtPath';
  let APPLY_EFFECT_AT_TOKEN_CMD = '!areasOfEffectApplyEffectAtToken';
  let APPLY_EFFECT_BETWEEN_TOKENS_CMD = '!areasOfEffectApplyEffectBetweenTokens';
  let APPLY_EFFECT_AT_CONE_CMD = '!areasOfEffectApplyEffectAtCone';
  let APPLY_EFFECT_AT_BLAST_CMD = '!areasOfEffectApplyEffectAtBlast';
  let DEL_EFFECT_CMD = '!areasOfEffectDeleteEffect';
  let SHOW_EFFECTS_CMD = '!areasOfEffectShowEffects';
  let EXPORT_STATE_CMD = '!areasOfEffectExportState';
  let IMPORT_STATE_CMD = '!areasOfEffectImportState';

  let MACRO_SHORTCUTS = {
    'AoeShortcut_✎': `${APPLY_EFFECT_AT_PATH_CMD} EFFECT_NAME`,
    'AoeShortcut_➙': `${APPLY_EFFECT_BETWEEN_TOKENS_CMD} @{selected|token_id} @{target|token_id} EFFECT_NAME`,
    'AoeShortcut_✸': `${APPLY_EFFECT_AT_TOKEN_CMD} @{target|token_id} ?{Specify radius:} EFFECT_NAME`,
    'AoeShortcut_⩤': `${APPLY_EFFECT_AT_CONE_CMD} @{selected|token_id} ?{Specify radius:} EFFECT_NAME`,
    'AoeShortcut_⬕': `${APPLY_EFFECT_AT_BLAST_CMD} @{selected|token_id} ?{Specify radius:} EFFECT_NAME`
  };

  let MENU_CSS = {
    'effectsTable': {
      'width': '100%'
    },
    'effectThumbnail': {
      'max-height': '50px',
      'max-width': '50px'
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
    * @param {string} playerid
    * @param {string} name
    * @param {Path} path
    * @return {Graphic}
    */
   function applyEffect(playerid, name, path) {
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
     return graphic;
   }

   /**
    * Applies an effect between two tokens.
    * @param {string} playerid
    * @param {string} name
    * @param {Graphic} token1
    * @param {Graphic} token2
    * @return {Graphic}
    */
   function applyEffectBetweenTokens(playerid, name, token1, token2) {
     let path = _createPathBetweenTokens(token1, token2);
     return applyEffect(playerid, name, path);
   }

   /**
    * Creates a line segment path between two tokens.
    * @private
    * @param {Graphic} token1
    * @param {Graphic} token2
    * @return {Path}
    */
   function _createPathBetweenTokens(token1, token2) {
     let p1 = [ token1.get('left'), token1.get('top') ];
     let p2 = [ token2.get('left'), token2.get('top') ];
     let segment = [ p1, p2 ];
     let pathJson = PathMath.segmentsToPath([segment]);
     return createObj('path', _.extend(pathJson, {
       _pageid: token1.get('_pageid'),
       layer: 'objects',
       stroke: '#ff0000'
     }));
   }

   /**
    * Creates a line segment path for a D&D 4th edition style blast from
    * a token in the direction it is currently facing.
    * @private
    * @param {Graphic} token
    * @param {number} radiusUnits
    * @return {Path}
    */
   function _createRadiusPathAtBlast(token, radiusUnits) {
     let page = getObj('page', token.get('_pageid'));
     let radiusPixels = radiusUnits / page.get('scale_number') * 70;
     let tokenRadius = token.get('width')/2;

     let p1 = [
       token.get('left'),
       token.get('top'),
       1
     ];

     // Produce a list of segments representing the square of furthest origin points
     // for the blast's center.
     let gridDist = tokenRadius + radiusPixels/2;
     var square = new PathMath.Polygon([
       [p1[0] - gridDist, p1[1] - gridDist, 1],
       [p1[0] + gridDist, p1[1] - gridDist, 1],
       [p1[0] + gridDist, p1[1] + gridDist, 1],
       [p1[0] - gridDist, p1[1] + gridDist, 1]
     ]);
     let squareSegs = square.toSegments();

     // Create a segment from the token to somewhere past the blast origin
     // square in the direction that the token is facing.
     let angle = token.get('rotation')/180*Math.PI - Math.PI/2;
     let v = [radiusPixels*2, 0, 0];
     v = MatrixMath.multiply(MatrixMath.rotate(angle), v);
     let p2 = VecMath.add(p1, v);
     let seg1 = [p1, p2];

     // Find the point at which our directional segment intersects the square.
     // This is where we will put the origin for the blast's center.
     let intersection;
     _.find(squareSegs, seg2 => {
       intersection = PathMath.segmentIntersection(seg1, seg2);
       return intersection;
     });
     let origin = intersection[0];

     // Produce the path for the blast.
     let blastSeg = [origin, VecMath.add(origin, [radiusPixels/2, 0, 0])];
     let pathJson = PathMath.segmentsToPath([blastSeg]);
     return createObj('path', _.extend(pathJson, {
       _pageid: token.get('_pageid'),
       layer: 'objects',
       stroke: '#ff0000'
     }));
   }

   /**
    * Creates a line segment path from some token out to some radius in the
    * direction it is currently facing.
    * @private
    * @param {Graphic} token
    * @param {number} radiusUnits
    * @return {Path}
    */
   function _createRadiusPathAtCone(token, radiusUnits) {
     let page = getObj('page', token.get('_pageid'));
     let radiusPixels = radiusUnits / page.get('scale_number') * 70;
     let tokenRadius = token.get('width')/2;

     let angle = token.get('rotation')/180*Math.PI - Math.PI/2;
     let mRotate = MatrixMath.rotate(angle);

     // The first point is at the edge of the token.
     let p1 = [
       token.get('left'),
       token.get('top'),
       1
     ];
     let u = [tokenRadius, 0, 0];
     u = MatrixMath.multiply(mRotate, u);
     p1 = VecMath.add(p1, u);

     // The second point continues forward from that point to the required distance.
     let v = [radiusPixels, 0, 0];
     v = MatrixMath.multiply(mRotate, v);
     let p2 = VecMath.add(p1, v);

     // Produce the path for the line/cone.
     let segment = [p1, p2];
     let pathJson = PathMath.segmentsToPath([segment]);
     return createObj('path', _.extend(pathJson, {
       _pageid: token.get('_pageid'),
       layer: 'objects',
       stroke: '#ff0000'
     }));
   }

   /**
    * Creates a line segment path from some token out to some radius from
    * the token's edge.
    * @private
    * @param {Graphic} token1
    * @param {Graphic} token2
    * @return {Path}
    */
   function _createRadiusPathAtToken(token, radiusUnits) {
     let page = getObj('page', token.get('_pageid'));
     let radiusPixels = radiusUnits / page.get('scale_number') * 70;

     let p1 = [
       token.get('left'),
       token.get('top')
     ];
     let p2 = VecMath.add(p1, [radiusPixels, 0]);

     let segment = [ p1, p2 ];
     let pathJson = PathMath.segmentsToPath([segment]);
     return createObj('path', _.extend(pathJson, {
       _pageid: token.get('_pageid'),
       layer: 'objects',
       stroke: '#ff0000'
     }));
   }

   /**
    * Deletes a saved area of effect.
    * @param {string} who
    * @param {string} playerid
    * @param {string} name
    */
   function deleteEffect(who, playerid, name) {
     delete state.AreasOfEffect.saved[name];
     _updateShortcutMacros();
     _showMenu(who, playerid);
   }

   /**
    * Displays the JSONified state for this script to the chat (and returns it).
    * @param {string} playerid
    * @return {string}
    */
   function exportState(playerid) {
     let content = new HtmlBuilder('div');
     content.append('div', 'Below is the JSON for this script\'s state. Copy-paste it to import it to another campaign.');

     let json = _jsonifyState();
     content.append('pre', json);

     let menu = _showMenuPanel('Export Areas of Effect', content);
     _whisper(playerid, menu.toString(MENU_CSS));

     return json;
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
    * Gets a macro prompt for the user to choose from the list of saved effect
    * names.
    * @return {string}
    */
   function getEffectNamePrompt() {
     let names = _.keys(state.AreasOfEffect.saved);
     names.sort();
     return `?{Which effect?|${names.join('|')}}`;
   }

   /**
    * Gets a list of the saved effects, sorted by name.
    * @return {AreaOfEffect[]}
    */
   function getEffects() {
     return _.chain(state.AreasOfEffect.saved)
     .values()
     .sortBy(effect => {
       return effect.name;
     })
     .map(effect => {
       return _.clone(effect);
     })
     .value();
   }

   /**
    * Imports the state for this script from JSON.
    * @param {string} json
    */
   function importState(who, playerid, json) {
     _initState();
     _.extend(state.AreasOfEffect, JSON.parse(json));

     _showMenu(who, playerid);
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
   * Converts the script's state to JSON.
   * @return {string}
   */
  function _jsonifyState() {
    return JSON.stringify(state.AreasOfEffect);
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
    if(VecMath.length(u) === 0)
      throw new Error(`The effect's line cannot have zero length!`);

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
    if(VecMath.length(v) > 0)
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

    _updateShortcutMacros();
    _whisper(playerid, 'Created Area of Effect: ' + name);
    _showMenu(who, playerid);
  }

  /**
   * Shows the list of effects which can be applied to a selected path.
   * @param {string} who
   * @param {string} playerid
   */
  function _showMenu(who, playerid) {
    let content = new HtmlBuilder('div');
    let effects = getEffects();

    let table = content.append('table.effectsTable');
    _.each(effects, effect => {
      let row = table.append('tr');
      var thumbnail = row.append('td');
      thumbnail.append('img.effectThumbnail', '', {
        src: effect.imgsrc
      });
      thumbnail.append('div', effect.name);

      row.append('td',
        new HtmlBuilder('a', '✎', {
          href: `${APPLY_EFFECT_AT_PATH_CMD} ${effect.name}`,
          title: 'Path: Apply effect to selected path.'
        })
      );

      row.append('td',
        new HtmlBuilder('a', '➙', {
          href: `${APPLY_EFFECT_BETWEEN_TOKENS_CMD} &#64;{selected|token_id} &#64;{target|token_id} ${effect.name}`,
          title: 'Ray: Create the effect from selected token to target token.'
        })
      );

      row.append('td',
        new HtmlBuilder('a', '✸', {
          href: `${APPLY_EFFECT_AT_TOKEN_CMD} &#64;{target|token_id} ?{Specify radius:} ${effect.name}`,
          title: 'Burst: Create effect centered on target token.'
        })
      );

      row.append('td',
        new HtmlBuilder('a', '⩤', {
          href: `${APPLY_EFFECT_AT_CONE_CMD} &#64;{selected|token_id} ?{Specify radius:} ${effect.name}`,
          title: 'Line/Cone: Create line/cone effect originating on selected token in the direction they are currently facing.'
        })
      );

      row.append('td',
        new HtmlBuilder('a', '⬕', {
          href: `${APPLY_EFFECT_AT_BLAST_CMD} &#64;{selected|token_id} ?{Specify radius:} ${effect.name}`,
          title: 'Blast: Create D&D 4E blast effect originating on selected token in the direction they are currently facing, using grid distance.'
        })
      );

      // The GM is allowed to delete effects.
      if(playerIsGM(playerid))
        row.append('td',
          new HtmlBuilder('a', '❌', {
            href: `${DEL_EFFECT_CMD} ${effect.name} ?{Delete effect: Are you sure?|yes|no}`,
            title: 'Delete effect.'
          })
        );
    });
    if(playerIsGM(playerid)) {
      content.append('div', '[Save New Effect](' + ADD_EFFECT_CMD + ' ?{Save Area of Effect: name})');
      content.append('div', '[⏏ Export State](' + EXPORT_STATE_CMD + ')', {
        title: 'Displays the JSON for this script\'s state, including all its saved effects, so that it can be imported into another campaign.'
      });
      content.append('div', '[⚠ Import State](' + IMPORT_STATE_CMD + ' ?{Paste exported state JSON here:})', {
        title: 'Imports the script state from another campaign from its exported JSON.'
      });
    }

    let menu = _showMenuPanel('Choose effect', content);
    _whisper(playerid, menu.toString(MENU_CSS));
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
   * Updates the shortcut macros, creating them if they don't already exist.
   * @private
   */
  function _updateShortcutMacros() {
    let players = findObjs({
      _type: 'player'
    });
    let gms = _.filter(players, player => {
      return playerIsGM(player.get('_id'));
    });

    let macrosNames = _.keys(MACRO_SHORTCUTS);
    _.each(macrosNames, name => {
      let macro = findObjs({
        _type: 'macro',
        name
      })[0];

      let action = MACRO_SHORTCUTS[name].replace('EFFECT_NAME', getEffectNamePrompt());

      if(macro)
        macro.set('action', action);
      else
        createObj('macro', {
          _playerid: gms[0].get('_id'),
          name,
          action,
          visibleto: 'all'
        });
    });
  }

  /**
   * @private
   * Whispers a Marching Order message to someone.
   */
  function _whisper(playerId, msg) {
    // var name = who.replace(/\(GM\)/, '').trim();
    const name = (getObj('player', playerId)||{get:()=>'API'}).get('_displayname');
    sendChat('Areas of Effect', '/w "' + name + '" ' + msg);
  }


  /**
   * Check that the menu macro for this script is installed.
   */
  on('ready', () => {
    let players = findObjs({
      _type: 'player'
    });
    let gms = _.filter(players, player => {
      return playerIsGM(player.get('_id'));
    });

    // Create the menu macro.
    let menuMacro = findObjs({
      _type: 'macro',
      name: 'AreasOfEffectMenu'
    })[0];
    if(!menuMacro) {
      _.each(gms, gm => {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'AreasOfEffectMenu',
          action: MENU_CMD,
          visibleto: 'all'
        });
      });
    }

    // Create/update the shortcut macros.
    _updateShortcutMacros();
    log('--- Initialized Areas Of Effect ---');
  });

  /**
   * Set up our chat command handler.
   */
  on("chat:message", function(msg) {
    try {
      if(msg.type !== 'api')
        return;

      let argv = msg.content.split(' ');
      if(argv[0] === ADD_EFFECT_CMD) {
        let name = argv.slice(1).join('_');

        let graphic, path;
        _.each(msg.selected, item => {
          if(item._type === 'graphic')
            graphic = getObj('graphic', item._id);
          if(item._type === 'path')
            path = getObj('path', item._id);
        });

        if(graphic && path)
          saveEffect(msg.who, msg.playerid, name, graphic, path);
        else
          _whisper(msg.playerid, 'ERROR: You must select a graphic and a path to save an effect.');
      }
      else if(argv[0] === APPLY_EFFECT_AT_PATH_CMD) {
        let name = argv.slice(1).join('_');

        let path;
        _.each(msg.selected, item => {
          if(item._type === 'path')
            path = getObj('path', item._id);
        });

        if(path)
          applyEffect(msg.playerid, name, path);
        else
          _whisper(msg.playerid, 'ERROR: You must select a path to apply the effect to.');
      }
      else if(argv[0] === APPLY_EFFECT_AT_TOKEN_CMD) {
        let target = getObj('graphic', argv[1]);
        let radiusUnits = argv[2];
        let name = argv.slice(3).join('_');

        let path = _createRadiusPathAtToken(target, radiusUnits);
        applyEffect(msg.playerid, name, path);
      }
      else if(argv[0] === APPLY_EFFECT_BETWEEN_TOKENS_CMD) {
        let selected = getObj('graphic', argv[1]);
        let target = getObj('graphic', argv[2]);
        let name = argv.slice(3).join('_');

        applyEffectBetweenTokens(msg.playerid, name, selected, target);
      }
      else if(argv[0] === APPLY_EFFECT_AT_CONE_CMD) {
        let selected = getObj('graphic', argv[1]);
        let radiusUnits = argv[2];
        let name = argv.slice(3).join('_');

        let path = _createRadiusPathAtCone(selected, radiusUnits);
        applyEffect(msg.playerid, name, path);
      }
      else if(argv[0] === APPLY_EFFECT_AT_BLAST_CMD) {
        let selected = getObj('graphic', argv[1]);
        let radiusUnits = argv[2];
        let name = argv.slice(3).join('_');

        let path = _createRadiusPathAtBlast(selected, radiusUnits);
        applyEffect(msg.playerid, name, path);
      }
      else if(argv[0] === DEL_EFFECT_CMD) {
        let name = argv[1];
        let confirm = argv[2];

        if(confirm === 'yes')
          deleteEffect(msg.who, msg.playerid, name);
      }
      else if(argv[0] === EXPORT_STATE_CMD) {
        exportState(msg.playerid);
      }
      else if(argv[0] == IMPORT_STATE_CMD) {
        let json = argv.slice(1).join(' ');
        importState(msg.who, msg.playerid, json);
      }
      else if(argv[0] === MENU_CMD) {
        _showMenu(msg.who, msg.playerid);
      }
    }
    catch(err) {
      log('Areas Of Effect ERROR: ' + err.message);
      _whisper(msg.playerid, 'ERROR: ' + err.message);
      log(err.stack);
    }
  });

  _initState();

  return {
    applyEffect,
    applyEffectBetweenTokens,
    deleteEffect,
    exportState,
    getEffects,
    importState,
    saveEffect
  };
})();
