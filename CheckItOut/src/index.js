/**
 * @typedef {object} ObjProps
 * @property {string} id The ID of the Graphic these properties are for.
 * @property {string} description Descriptive text about the object. This will
 * be displayed any time that the object is checked.
 */

var CheckItOut = (() => {
  'use strict';

  // A cache for lazy instantiation.
  const CACHE = {
    theme: undefined
  };

  const PIX_PER_UNIT = 70;

  /**
   * Make a character check out an object. The results will be displayed in
   * the chat in a stylized panel.
   * @param {Player} player The player who requested to check the object.
   * @param {Character} character The player's character.
   * @param {Graphic} checkedObj The object being checked.
   */
  function checkObject(player, character, checkedObj) {
    if (closeEnoughToCheck(character, checkedObj))
      _checkObject(player, character, checkedObj);
    else {
      let charName = character.get('name');
      let who = player.get('_displayname');
      CheckItOut.utils.Chat.whisper(who, `${charName} is not close enough ` +
        `to examine that.`);
    }
  }

  /**
   * Helper for checkObject.
   * @param {Player} player The player who requested to check the object.
   * @param {Character} character The player's character.
   * @param {Graphic} checkedObj The object being checked.
   * @return {Promise}
   */
  function _checkObject(player, character, checkedObj) {
    let theme = getTheme();
    let userOpts = CheckItOut.State.getUserOpts();
    let objProps = CheckItOut.ObjProps.getReadOnly(checkedObj);

    let charName = character.get('name');
    let objName = checkedObj.get('name');

    // Let the GM know that the character is checking out the object.
    CheckItOut.utils.Chat.whisperGM(
      `${charName} is checking out ${objName}`);

    let coreParagraphs = [objProps.core.description || userOpts.defaultDescription];

    // Check the object with the script's character sheet theme.
    return theme.checkObject(character, checkedObj)
    .then(themeParagraphs => {
      return [
        ...coreParagraphs,
        ...themeParagraphs
      ];
    })

    // Present the panel that contains the object's description.
    .then(paragraphs => {
      let content = new HtmlBuilder('div');
      _.each(paragraphs, para => {
        content.append('p', para);
      });
      let menu = new CheckItOut.utils.Menu(`Checking out ${objName}:`, content);
      menu.show(player);
    })

    // Play the object's sound if it has one.
    .then(() => {
      let soundName = objProps.core.sound;
      if (soundName) {
        let sound = findObjs({
          _type: 'jukeboxtrack',
          title: soundName
        })[0];

        if (sound) {
          sound.set('playing', true);
          sound.set('softstop', false);
        }
        else
          throw new Error(`Jukebox track with title ${soundName} does not exist.`);
      }
    });
  }

  /**
   * Determines if a character is close enough to examine some object.
   * @param {Character} character
   * @param {Graphic} checkedObj
   * @return {boolean}
   */
  function closeEnoughToCheck(character, checkedObj) {
    let objProps = CheckItOut.ObjProps.getReadOnly(checkedObj);
    let pageID = checkedObj.get('_pageid');
    let page = getObj('page', pageID);

    // If the maxDist property is defined, check if the character's token
    // is within that range of the object.
    if (objProps.core.maxDist) {
      // Get the character's token.
      let charToken = findObjs({
        _type: 'graphic',
        _pageid: pageID,
        represents: character.get('_id')
      })[0];

      if (!charToken) {
        throw new Error(`No token representing ${character.get('name')} is ` +
          `on the same page as ${checkedObj.get('name')}.`);
      }

      // Get the pixel distance between the character and the object.
      let pt1 = [
        charToken.get('left'),
        charToken.get('top')
      ];
      let pt2 = [
        checkedObj.get('left'),
        checkedObj.get('top')
      ];
      let r1 = charToken.get('width')/2;
      let r2 = checkedObj.get('width')/2;
      let pixDist = Math.max(VecMath.dist(pt1, pt2) - (r1 + r2), 0);

      // Get the unit distance between the character and the object.
      let scaleNumber = page.get('scale_number');
      let snapInc = page.get('snapping_increment');
      let unitDist = (pixDist/PIX_PER_UNIT)*(scaleNumber/snapInc);

      return unitDist <= objProps.core.maxDist;
    }
    else
      return true;
  }

  /**
   * Gets the configured CheckItOutTheme used for system-specific
   * behavior for investigating things.
   * @return {CheckItOutTheme}
   */
  function getTheme() {
    if (!CACHE.theme) {
      let themeName = CheckItOut.State.getState().themeName;
      setTheme(themeName);
    }

    return CACHE.theme;
  }

  /**
   * Sets the theme used for system-specific behavior for investigating things.
   * @param {string} themeName The name of a registered theme.
   */
  function setTheme(themeName) {
    let state = CheckItOut.State.getState();
    state.themeName = themeName;

    let themeClz = CheckItOut.themes.getRegisteredTheme(themeName) ||
      CheckItOut.themes.impl.DefaultTheme;
    CACHE.theme = new themeClz();
  }

  on('ready', () => {
    CheckItOut.State.initializeState();

    // Show initialization log.
    let theme = getTheme();
    let version = 'SCRIPT_VERSION'; // This will be filled in by Grunt.
    log(`*** Initialized Check It Out v${version} using theme ` +
      `'${theme.name}' ***`);
  });

  return {
    checkObject,
    closeEnoughToCheck,
    getTheme,
    setTheme
  };
})();
