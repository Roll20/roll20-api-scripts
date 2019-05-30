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

  /**
   * Make a character check out an object. The results will be displayed in
   * the chat in a stylized panel.
   * @param {Player} player The player who requested to check the object.
   * @param {Character} character The player's character.
   * @param {Graphic} checkedObj The object being checked.
   * @return {Promise}
   */
  function checkObject(player, character, checkedObj) {
    let theme = getTheme();
    let userOpts = CheckItOut.State.getUserOpts();
    let objProps = getObjProps(checkedObj);

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
   * Get a read-only copy of the persisted properties for an object.
   * @param {Graphic} checkedObj
   * @return {ObjProps}
   */
  function getObjProps(checkedObj) {
    let checkedID = checkedObj.get('_id');
    let props = CheckItOut.State.getState().graphics[checkedID] || {};
    _.defaults(props, {
      core: {},
      theme: {}
    });
    return props;
  }

  /**
   * Gets the persisted properties for an object, creating them if
   * they don't exist.
   * @param {Graphic} checkedObj
   * @return {ObjProps}
   */
  function getOrCreateObjProps(checkedObj) {
    let existingProps = getObjProps(checkedObj);
    if (existingProps)
      return existingProps;
    else {
      let checkedID = checkedObj.get('_id');
      let newProps = {
        id: checkedID,
        core: {},
        theme: {}
      };
      CheckItOut.State.getState().graphics[checkedID] = newProps;
      return newProps;
    }
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
    log(`ಠಠ--> Initialized Check It Out v${version} using theme ` +
      `'${theme.name}' <--ಠಠ`);
  });

  return {
    checkObject,
    getObjProps,
    getOrCreateObjProps,
    getTheme,
    setTheme
  };
})();
