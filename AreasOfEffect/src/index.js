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

    log('--- Initialized Areas Of Effect vSCRIPT_VERSION ---');
  });

  return {
    applyEffect,
    applyEffectBetweenTokens,
    deleteEffect,
    getEffects,
    saveEffect
  };
})();
