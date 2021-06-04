var AreasOfEffect = (() => {
  'use strict';

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
    * @param {Player} player
    * @param {string} name
    * @param {Path} path
    * @return {Graphic}
    */
   function applyEffect(player, name, path) {
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
       controlledby: player.get('_id')
     });
     toBack(graphic);

     path.remove();
     return graphic;
   }

   /**
    * Applies an effect between two tokens.
    * @param {Player} player
    * @param {string} name
    * @param {Graphic} token1
    * @param {Graphic} token2
    * @return {Graphic}
    */
   function applyEffectBetweenTokens(player, name, token1, token2) {
     let path = AreasOfEffect.Paths.createPathBetweenTokens(token1, token2);
     return applyEffect(player, name, path);
   }

   /**
    * Deletes a saved area of effect.
    * @param {string} name
    */
   function deleteEffect(name) {
     let myState = AreasOfEffect.State.getState();
     delete myState.saved[name];

     AreasOfEffect.Macros.updateShortcutMacros();
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
    * Gets a list of the saved effects, sorted by name.
    * @return {AreaOfEffect[]}
    */
   function getEffects() {
     let myState = AreasOfEffect.State.getState();
     return _.chain(myState.saved)
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
   * Saves an area of effect.
   * @param {Player} player
   * @param {string} name
   * @param {Graphic} effect
   * @param {Path} path
   */
  function saveEffect(player, name, effect, path) {
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
    let myState = AreasOfEffect.State.getState();
    myState.saved[name] = {
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

    AreasOfEffect.Macros.updateShortcutMacros();
    AreasOfEffect.utils.Chat.whisper(player, 'Created Area of Effect: ' + name);
    AreasOfEffect.Wizard.show(player);
  }

  /**
   * Check that the menu macro for this script is installed.
   */
  on('ready', () => {
    AreasOfEffect.State.initState();
    AreasOfEffect.Macros.installMacros();

    log('--- Initialized Areas Of Effect v1.6.1 ---');
  });

  return {
    applyEffect,
    applyEffectBetweenTokens,
    deleteEffect,
    getEffects,
    saveEffect
  };
})();

(() => {
  'use strict';

  const MENU_CMD = '!areasOfEffectShowMenu';
  const ADD_EFFECT_CMD = '!areasOfEffectAddEffect';
  const APPLY_EFFECT_AT_PATH_CMD = '!areasOfEffectApplyEffectAtPath';
  const APPLY_EFFECT_AT_TOKEN_CMD = '!areasOfEffectApplyEffectAtToken';
  const APPLY_EFFECT_BETWEEN_TOKENS_CMD = '!areasOfEffectApplyEffectBetweenTokens';
  const APPLY_EFFECT_AT_CONE_CMD = '!areasOfEffectApplyEffectAtCone';
  const APPLY_EFFECT_AT_BLAST_CMD = '!areasOfEffectApplyEffectAtBlast';
  const DEL_EFFECT_CMD = '!areasOfEffectDeleteEffect';
  const SHOW_EFFECTS_CMD = '!areasOfEffectShowEffects';
  const EXPORT_STATE_CMD = '!areasOfEffectExportState';
  const IMPORT_STATE_CMD = '!areasOfEffectImportState';

  function _AddEffectCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let name = argv.slice(1).join('_');
    let graphic, path;
    _.each(msg.selected, item => {
      if(item._type === 'graphic')
        graphic = getObj('graphic', item._id);
      if(item._type === 'path')
        path = getObj('path', item._id);
    });

    if(graphic && path)
      AreasOfEffect.saveEffect(player, name, graphic, path);
    else {
      AreasOfEffect.utils.Chat.whisper(player,
        'ERROR: You must select a graphic and a path to save an effect.');
    }
  }

  function _ApplyEffectAtPathCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let name = argv.slice(1).join('_');
    let path;
    _.each(msg.selected, item => {
      if(item._type === 'path')
        path = getObj('path', item._id);
    });

    if(path)
      AreasOfEffect.applyEffect(player, name, path);
    else {
      AreasOfEffect.utils.Chat.whisper(player,
        'ERROR: You must select a path to apply the effect to.');
    }
  }

  function _ApplyEffectAtTokenCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let target = getObj('graphic', argv[1]);
    let radiusUnits = argv[2];
    let name = argv.slice(3).join('_');

    let path = AreasOfEffect.Paths.createRadiusPathAtToken(target, radiusUnits);
    AreasOfEffect.applyEffect(player, name, path);
  }

  function _ApplyEffectBetweenTokensCmd(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let selected = getObj('graphic', argv[1]);
    let target = getObj('graphic', argv[2]);
    let name = argv.slice(3).join('_');

    AreasOfEffect.applyEffectBetweenTokens(player, name, selected, target);
  }

  function _ApplyEffectAtCone(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let selected = getObj('graphic', argv[1]);
    let radiusUnits = argv[2];
    let name = argv.slice(3).join('_');

    let path = AreasOfEffect.Paths.createRadiusPathAtCone(selected, radiusUnits);
    AreasOfEffect.applyEffect(player, name, path);
  }

  function _ApplyEffectAtBlast(msg) {
    let argv = bshields.splitArgs(msg.content);
    let player = getObj('player', msg.playerid);

    let selected = getObj('graphic', argv[1]);
    let radiusUnits = argv[2];
    let name = argv.slice(3).join('_');

    let path = AreasOfEffect.Paths.createRadiusPathAtBlast(selected, radiusUnits);
    AreasOfEffect.applyEffect(player, name, path);
  }

  function _DelEffectCmd(msg) {
    let argv = bshields.splitArgs(msg.content);

    let name = argv[1];
    let confirm = argv[2];

    if(confirm === 'yes') {
      let player = getObj('player', msg.playerid);
      AreasOfEffect.deleteEffect(name);
      AreasOfEffect.Wizard.show(player);
    }
  }

  function _ExportStateCmd(msg) {
    let player = getObj('player', msg.playerid);
    AreasOfEffect.State.exportState(player);
  }

  function _ImportStateCmd(msg) {
    // Can't use splitArgs here since it strips out double-quotes.
    let argv = msg.content.split(' ');
    let player = getObj('player', msg.playerid);

    let json = argv.slice(1).join(' ');
    AreasOfEffect.State.importState(player, json);
  }

  function _MenuCmd(msg) {
    let player = getObj('player', msg.playerid);
    AreasOfEffect.Wizard.show(player);
  }

  /**
   * Set up our chat command handler.
   */
  on("chat:message", function(msg) {
    try {
      if(msg.type !== 'api')
        return;

      let argv = bshields.splitArgs(msg.content);
      if(argv[0] === ADD_EFFECT_CMD)
        _AddEffectCmd(msg);
      else if(argv[0] === APPLY_EFFECT_AT_PATH_CMD)
        _ApplyEffectAtPathCmd(msg);
      else if(argv[0] === APPLY_EFFECT_AT_TOKEN_CMD)
        _ApplyEffectAtTokenCmd(msg);
      else if(argv[0] === APPLY_EFFECT_BETWEEN_TOKENS_CMD)
        _ApplyEffectBetweenTokensCmd(msg);
      else if(argv[0] === APPLY_EFFECT_AT_CONE_CMD)
        _ApplyEffectAtCone(msg);
      else if(argv[0] === APPLY_EFFECT_AT_BLAST_CMD)
        _ApplyEffectAtBlast(msg);
      else if(argv[0] === DEL_EFFECT_CMD)
        _DelEffectCmd(msg);
      else if(argv[0] === EXPORT_STATE_CMD)
        _ExportStateCmd(msg);
      else if(argv[0] === IMPORT_STATE_CMD)
        _ImportStateCmd(msg);
      else if(argv[0] === MENU_CMD)
        _MenuCmd(msg);
    }
    catch(err) {
      let player = getObj('player', msg.playerid);

      log('Areas Of Effect ERROR: ' + err.message);
      AreasOfEffect.utils.Chat.whisper(player, 'ERROR: ' + err.message);
      log(err.stack);
    }
  });

  AreasOfEffect.Commands = {
    MENU_CMD,
    ADD_EFFECT_CMD,
    APPLY_EFFECT_AT_PATH_CMD,
    APPLY_EFFECT_AT_TOKEN_CMD,
    APPLY_EFFECT_BETWEEN_TOKENS_CMD,
    APPLY_EFFECT_AT_CONE_CMD,
    APPLY_EFFECT_AT_BLAST_CMD,
    DEL_EFFECT_CMD,
    SHOW_EFFECTS_CMD,
    EXPORT_STATE_CMD,
    IMPORT_STATE_CMD
  };
})();

(() => {
  'use strict';

  const cmds = AreasOfEffect.Commands;

  const MACRO_SHORTCUTS = {
    'AoeShortcut_Path': `${cmds.APPLY_EFFECT_AT_PATH_CMD} EFFECT_NAME`,
    'AoeShortcut_Tokens': `${cmds.APPLY_EFFECT_BETWEEN_TOKENS_CMD} @{selected|token_id} @{target|token_id} EFFECT_NAME`,
    'AoeShortcut_Burst': `${cmds.APPLY_EFFECT_AT_TOKEN_CMD} @{target|token_id} ?{Specify radius:} EFFECT_NAME`,
    'AoeShortcut_Cone': `${cmds.APPLY_EFFECT_AT_CONE_CMD} @{selected|token_id} ?{Specify radius:} EFFECT_NAME`,
    'AoeShortcut_Blast': `${cmds.APPLY_EFFECT_AT_BLAST_CMD} @{selected|token_id} ?{Specify radius:} EFFECT_NAME`
  };

  /**
   * Module for installing/updating the script's macros.
   */
  AreasOfEffect.Macros = class {
    /**
     * Gets a macro prompt for the user to choose from the list of saved effect
     * names.
     * @return {string}
     */
    static getEffectNamePrompt() {
      let myState = AreasOfEffect.State.getState();
      let names = _.keys(myState.saved);
      names.sort();
      return `?{Which effect?|${names.join('|')}}`;
    }

    /**
     * Check that the menu macros for this script are installed, and install
     * them if necessary.
     */
    static installMacros() {
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
            action: cmds.MENU_CMD,
            visibleto: 'all'
          });
        });
      }

      // Create/update the shortcut macros.
      AreasOfEffect.Macros.updateShortcutMacros();
    }

    /**
     * Updates the shortcut macros, creating them if they don't already exist.
     * @private
     */
    static updateShortcutMacros() {
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

        let action = MACRO_SHORTCUTS[name].replace('EFFECT_NAME',
          AreasOfEffect.Macros.getEffectNamePrompt());

        if(macro)
          macro.set('action', action);
        else {
          createObj('macro', {
            _playerid: gms[0].get('_id'),
            name,
            action,
            visibleto: 'all'
          });
        }
      });
    }
  };
})();

(() => {
  'use strict';

  const cmds = AreasOfEffect.Commands;

  AreasOfEffect.Wizard = class {
    /**
     * Shows the list of effects which can be applied to a selected path.
     * @param {Player} player
     */
    static show(player) {
      let playerId = player.get('_id');
      let content = new HtmlBuilder('div');
      let effects = AreasOfEffect.getEffects();

      let table = content.append('table.effectsTable');
      _.each(effects, effect => {
        let row = table.append('tr');
        var thumbnail = row.append('td');
        thumbnail.append('img.effectThumbnail', '', {
          src: effect.imgsrc
        });
        thumbnail.append('div', effect.name);

        row.append('td',
          new HtmlBuilder('a', '&#9998;', {
            href: `${cmds.APPLY_EFFECT_AT_PATH_CMD} ${effect.name}`,
            title: 'Path: Apply effect to selected path.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '&#10137;', {
            href: `${cmds.APPLY_EFFECT_BETWEEN_TOKENS_CMD} &#64;{selected|token_id} &#64;{target|token_id} ${effect.name}`,
            title: 'Ray: Create the effect from selected token to target token.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '&#10040;', {
            href: `${cmds.APPLY_EFFECT_AT_TOKEN_CMD} &#64;{target|token_id} ?{Specify radius:} ${effect.name}`,
            title: 'Burst: Create effect centered on target token.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '&#10852;', {
            href: `${cmds.APPLY_EFFECT_AT_CONE_CMD} &#64;{selected|token_id} ?{Specify radius:} ${effect.name}`,
            title: 'Line/Cone: Create line/cone effect originating on selected token in the direction they are currently facing.'
          })
        );

        row.append('td',
          new HtmlBuilder('a', '&#11029;', {
            href: `${cmds.APPLY_EFFECT_AT_BLAST_CMD} &#64;{selected|token_id} ?{Specify radius:} ${effect.name}`,
            title: 'Blast: Create D&D 4E blast effect originating on selected token in the direction they are currently facing, using grid distance.'
          })
        );

        // The GM is allowed to delete effects.
        if(playerIsGM(playerId))
          row.append('td',
            new HtmlBuilder('a', '&#10060;', {
              href: `${cmds.DEL_EFFECT_CMD} ${effect.name} ?{Delete effect: Are you sure?|yes|no}`,
              title: 'Delete effect.'
            })
          );
      });
      if(playerIsGM(playerId)) {
        content.append('div', '[Save New Effect](' + cmds.ADD_EFFECT_CMD + ' ?{Save Area of Effect: name})');
        content.append('div', '[&#9167; Export State](' + cmds.EXPORT_STATE_CMD + ')', {
          title: 'Displays the JSON for this script\'s state, including all its saved effects, so that it can be imported into another campaign.'
        });
        content.append('div', '[&#9888; Import State](' + cmds.IMPORT_STATE_CMD + ' ?{Paste exported state JSON here:})', {
          title: 'Imports the script state from another campaign from its exported JSON.'
        });
      }

      let menu = new AreasOfEffect.utils.Menu('Choose effect', content);
      menu.show(player);
    }
  };
})();

(() => {
  'use strict';


  /**
   * Module for constructing Paths from which areas of effect are generated.
   */
  AreasOfEffect.Paths = class {
    /**
     * Creates a line segment path between two tokens.
     * @private
     * @param {Graphic} token1
     * @param {Graphic} token2
     * @return {Path}
     */
    static createPathBetweenTokens(token1, token2) {
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
    static createRadiusPathAtBlast(token, radiusUnits) {
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
    static createRadiusPathAtCone(token, radiusUnits) {
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
    static createRadiusPathAtToken(token, radiusUnits) {
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
  };
})();

(() => {
  'use strict';

  /**
   * Module for accessing the script's state.
   */
  AreasOfEffect.State = class {
    /**
     * Displays the JSONified state for this script to the chat (and returns it).
     * @param {Player} player
     * @return {string}
     */
    static exportState(player) {
      let content = new HtmlBuilder('div');
      content.append('div', 'Below is the JSON for this script\'s state. ' +
        'Copy-paste it to import it to another campaign.');

      let json = AreasOfEffect.State._jsonifyState();
      content.append('pre', json);

      let menu = new AreasOfEffect.utils.Menu('Export Areas of Effect', content);
      menu.show(player);

      return json;
    }

    /**
     * Gets this script's state.
     * @return {AoEState}
     */
    static getState() {
      return state.AreasOfEffect;
    }

    /**
     * Imports the state for this script from JSON.
     * @param {Player} player
     * @param {string} json
     */
    static importState(player, json) {
      AreasOfEffect.State.initState();
      let myState = AreasOfEffect.State.getState();
      _.extend(myState, JSON.parse(json));

      AreasOfEffect.Wizard.show(player);
    }

    /**
     * Initializes the state of this script.
     */
    static initState() {
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
    static _jsonifyState() {
      let myState = state.AreasOfEffect;
      return JSON.stringify(myState);
    }
  };
})();

(() => {
  'use strict';

  /**
   * Define the utils package.
   */
  AreasOfEffect.utils = {};
})();

(() => {
  'use strict';

  const FROM_NAME = 'Areas of Effect';

  /**
   * Module for chat functions.
   */
  AreasOfEffect.utils.Chat = class {

    /**
     * Fixes the 'who' string from a Message so that it can be reused as a
     * whisper target using Roll20's sendChat function.
     * @param {string} who The player name taken from the 'who' property of a
     * chat:message event.
     * @return {string}
     */
    static fixWho(srcWho) {
      return srcWho.replace(/\(GM\)/, '').trim();
    }

    /**
     * Whispers a message to someoen.
     * @param {Player} player The player who will receive the whisper.
     * @param {string} msg The whispered message.
     */
    static whisper(player, msg) {
      let name = player.get('_displayname');
      let cleanName = AreasOfEffect.utils.Chat.fixWho(name);
      sendChat(FROM_NAME, '/w "' + cleanName + '" ' + msg);
    }
  };
})();

(() => {
  'use strict';

  const MENU_CSS = {
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
   * A stylized menu that can be whispered in the chat to a player.
   */
  AreasOfEffect.utils.Menu = class {
    /**
     * @param {string} header The header text for the menu.
     * @param {string|HtmlBuilder} content The contents of the menu.
     */
    constructor(header, content) {
      this._header = header;
      this._content = content;
    }

    /**
     * Show the menu to a player.
     * @param {Player} player
     */
    show(player) {
      // Construct the HTML content for the menu.
      let menu = new HtmlBuilder('.menu');
      menu.append('.menuHeader', this._header);
      menu.append('.menuBody', this._content);
      let html = menu.toString(MENU_CSS);

      // Whisper the menu to the player.
      AreasOfEffect.utils.Chat.whisper(player, html);
    }
  };
})();
