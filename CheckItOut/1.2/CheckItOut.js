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
    let version = '1.2'; // This will be filled in by Grunt.
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

(() => {
  'use strict';

  const CHECK_OBJECT_CMD = '!CheckItOut_CheckObject';
  const COPY_PROPS_CMD = '!CheckItOut_CopyPropertiesToTargetObject';
  const DISPLAY_WIZARD_CMD = '!CheckItOut_GMWizard_showMenu';
  const MODIFY_CORE_PROPERTY_CMD = '!CheckItOut_GMWizard_setPropertyCore';
  const MODIFY_THEME_PROPERTY_CMD = '!CheckItOut_GMWizard_setPropertyTheme';

  _.extend(CheckItOut, {
    commands: {
      CHECK_OBJECT_CMD,
      COPY_PROPS_CMD,
      DISPLAY_WIZARD_CMD,
      MODIFY_CORE_PROPERTY_CMD,
      MODIFY_THEME_PROPERTY_CMD
    }
  });

  /**
   * Executes a command to have a character check an object.
   * @param {Message} msg
   */
  function doCheckObjectCmd(msg) {
    let player = getObj('player', msg.playerid);
    if (!player)
      throw new Error(`Could not find player ID ${msg.playerid}.`);

    // Validate arguments.
    let argv = bshields.splitArgs(msg.content);
    if (argv.length !== 3) {
      log(argv);
      throw new Error(`Incorrect # arguments.`);
    }

    // Get the character's token.
    let charTokenID = argv[1];
    let charToken = getObj('graphic', charTokenID);
    if (charToken) {
      // Get the character who is checking the object.
      let charID = charToken.get('represents');
      let character = getObj('character', charID);

      if (!character)
        throw new Error('The selected token must represent a character.');

      // Get the object being checked.
      let targetID = argv[2];
      if (!targetID)
        throw new Error('targetID argument not specified.');

      let checkedObj = getObj('graphic', targetID);

      // Have the character check the object.
      if (checkedObj)
        CheckItOut.checkObject(player, character, checkedObj);
      else
        throw new Error('The checked object does not exist.');
    }
    else {
      throw new Error('A character token must be selected.');
    }
  }

  /**
   * Exectures a command to copy the properties of one object to another.
   * @param {Message} msg
   */
  function doCopyPropsCmd(msg) {
    // Validate arguments.
    let argv = bshields.splitArgs(msg.content);
    if (argv.length !== 3) {
      log(argv);
      throw new Error(`Incorrect # arguments.`);
    }

    // Get the object to copy properties from.
    let fromID = argv[1];
    let fromObj = getObj('graphic', fromID);
    if (!fromObj)
      throw new Error('fromObj does not exist.');

    // Get the object to copy properties to.
    let toID = argv[2];
    let toObj = getObj('graphic', toID);
    if (!toObj)
      throw new Error('toObj does not exist.');

    CheckItOut.ObjProps.copy(fromObj, toObj);
  }

  /**
   * Executes a command to modify a core property of an object.
   * @param {Message} msg
   */
  function doModifyCoreProperty(msg) {
    let {targetObj, propID, propParams, player} = _getModifyPropertyArgs(msg);

    // Modify the specified property and then show the updated wizard.
    let wizard = new CheckItOut.GMWizard(targetObj);
    wizard.modifyProperty(propID, propParams);
    wizard.show(player);
  }

  /**
   * Executes a command to modify a theme-specific property of an object.
   * @param {Message} msg
   */
  function doModifyThemeProperty(msg) {
    let {targetObj, propID, propParams, player} = _getModifyPropertyArgs(msg);
    let theme = CheckItOut.getTheme();

    // Modify the specified property and then show the updated wizard.
    theme.modifyWizardProperty(targetObj, propID, propParams);
    let wizard = new CheckItOut.GMWizard(targetObj);
    wizard.show(player);
  }

  /**
   * Executes a command to show the GM wizard.
   * @param {Message} msg
   */
  function doShowGMWizard(msg) {
    let graphic = getSelectedOne(msg);
    if (!graphic)
      throw new Error('An object must be selected.');

    let player = getObj('player', msg.playerid);
    if (!player)
      throw new Error(`Player for ID ${msg.playerid} does not exist.`);

    let wizard = new CheckItOut.GMWizard(graphic);
    wizard.show(player);
  }

  /**
   * Parses and validates the arguments for MODIFY_CORE_PROPERTY_CMD and
   * MODIFY_THEME_PROPERTY_CMD.
   * @param {Message} msg
   */
  function _getModifyPropertyArgs(msg) {
    let argv = bshields.splitArgs(msg.content);
    if (argv.length < 4) {
      log(argv);
      throw new Error(`Incorrect # arguments.`);
    }

    // Resolve the object being modified.
    let targetID = argv[1];
    let targetObj = getObj('graphic', targetID);
    if (!targetObj)
      throw new Error(`Target object must be specified as first parameter.`);

    // Resolve the property being modified and its parameters.
    let propID = argv[2];
    let propParams = argv.slice(3).join(' ').split('&&');

    // Resolve the player object for the GM.
    let playerID = msg.playerid;
    let player = getObj('player', playerID);
    if (!player)
      throw new Error(`Player for ID ${msg.playerid} does not exist.`);
    if (!playerIsGM(playerID))
      throw new Error(`Player "${player._displayname}" is not a GM.`);

    return {
      targetObj,
      propID,
      propParams,
      player
    };
  }

  /**
   * Gets a singular selected object from a Message.
   * @param {Message} msg
   * @return {Graphic|Path}
   */
  function getSelectedOne(msg) {
    if (msg.selected && msg.selected.length > 0) {
      let first = msg.selected[0];
      return getObj(first._type, first._id);
    }
    else
      return undefined;
  }

  on('chat:message', msg => {
    try {
      if (msg.content.startsWith(CHECK_OBJECT_CMD))
        doCheckObjectCmd(msg);
      if (msg.content.startsWith(COPY_PROPS_CMD))
        doCopyPropsCmd(msg);
      if (msg.content.startsWith(DISPLAY_WIZARD_CMD))
        doShowGMWizard(msg);
      if (msg.content.startsWith(MODIFY_CORE_PROPERTY_CMD))
        doModifyCoreProperty(msg);
      if (msg.content.startsWith(MODIFY_THEME_PROPERTY_CMD))
        doModifyThemeProperty(msg);
    }
    catch (err) {
      CheckItOut.utils.Chat.error(err);
    }
  });
})();

(() => {
  'use strict';

  /**
   * Delete the persisted properties for an object if it is destroyed.
   */
  on('destroy:graphic', obj => {
    CheckItOut.ObjProps.delete(obj);

    //log(CheckItOut.State.getState());
  });
})();

/**
 * This module installs the player and GM macros for using the script.
 */
(() => {
  'use strict';

  /**
   * Installs the Check It Out macro for a player, allowing them to
   * investigate a nearby object.
   * @param {Player} player
   */
  function _installMacroCheckObject(player) {
    let playerID = player.get('_id');
    let macroName = 'CheckItOut';

    let macro = findObjs({
      _type: 'macro',
      _playerid: playerID,
      name: macroName
    })[0];

    // Install the macro if it doesn't already exist.
    if (!macro) {
      createObj('macro', {
        _playerid: playerID,
        name: macroName,
        action: `${CheckItOut.commands.CHECK_OBJECT_CMD} @{selected|token_id} @{target|token_id}`
      });
    }
  }

  /**
   * Installs the Check It Out menu macro for a GM.
   * @private
   * @param {Player} player A player who is a GM.
   */
  function _installMacroGmMenu(player) {
    let playerID = player.get('_id');
    let macroName = 'CheckItOut_GM_Wizard';

    let macro = findObjs({
      _type: 'macro',
      _playerid: playerID,
      name: macroName
    })[0];

    // If this doesn't have the macro, install it for them.
    if (!macro) {
      createObj('macro', {
        _playerid: playerID,
        name: macroName,
        action: CheckItOut.commands.DISPLAY_WIZARD_CMD,
        istokenaction: true
      });
    }
  }

  on('ready', () => {
    try {
      // Get the lists of players and GMs.
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      // Install the Check Object macro for all players.
      _.each(players, player => {
        _installMacroCheckObject(player);
      });

      // Install the GM Wizard macro for all GMs.
      _.each(gms, gm => {
        _installMacroGmMenu(gm);
      });
    }
    catch(err) {
      log('CheckItOutGMWizard - Error while installing macros: ' + err.message);
      log(err.stack);
    }
  });
})();

(() => {
  'use strict';

  /**
   * A module for managing the persisted properties of
   * objects for this script.
   */
  CheckItOut.ObjProps = class {
    /**
     * Copies the persisted properties from one object to another. This
     * overwrites any existing properties on the receiving object.
     * @param {Graphic} fromObj
     * @param {Graphic} toObj
     */
    static copy(fromObj, toObj) {
      let fromProps = CheckItOut.ObjProps.create(fromObj);
      let toProps = CheckItOut.ObjProps.create(toObj);

      let clone = CheckItOut.utils.deepCopy(fromProps);
      _.extend(toProps, clone);
    }


    /**
     * Creates new persisted properties for an object. If the object already
     * has persisted properties, the existing properties are returned.
     * @param {Graphic} obj
     * @return {ObjProps}
     */
    static create(obj) {
      let objID = obj.get('_id');

      // If properties for the object exist, return those. Otherwise
      // create blank persisted properties for it.
      let existingProps = CheckItOut.State.getState().graphics[objID];
      if (existingProps)
        return existingProps;
      else {
        let newProps = {
          id: objID
        };
        let defaults = CheckItOut.ObjProps.getDefaults();
        _.defaults(newProps, defaults
        );
        CheckItOut.State.getState().graphics[objID] = newProps;
        return newProps;
      }
    }

    /**
     * Deletes the persisted properties for an object.
     * @param {Graphic} obj
     */
    static delete(obj) {
      let objID = obj.get('_id');
      let state = CheckItOut.State.getState();

      let props = state.graphics[objID];
      if (props)
        delete state.graphics[objID];
    }

    /**
     * Gets the persisted properties for an object. Returns undefined if
     * they don't exist.
     * @param {Graphic} obj
     * @return {ObjProps}
     */
    static get(obj) {
      let objID = obj.get('_id');
      return CheckItOut.State.getState().graphics[objID];
    }

    /**
     * Produces an empty object properties structure.
     * @return {ObjProps}
     */
    static getDefaults() {
      return {
        core: {},
        theme: {}
      };
    }

    /**
     * Gets an immutable copy an object's persisted properties. If the object
     * has no persisted properties, a default properties structure is provided.
     * @param {Graphic} obj
     * @return {ObjProps}
     */
    static getReadOnly(obj) {
      let existingProps = CheckItOut.ObjProps.get(obj);

      // If the properties exist, return a deep copy of them.
      if (existingProps)
        return CheckItOut.utils.deepCopy(existingProps);
      else
        return CheckItOut.ObjProps.getDefaults();
    }
  };
})();

(() => {
  'use strict';

  /**
   * The ItsATrap state data.
   * @typedef {object} CheckItOutState
   * @property {map<string, CheckedInfo>} graphics
   *           A mapping of Graphic object IDs to information about the object's
   *           persisted properties.
   */

  const DEFAULT_DESCRIPTION = 'No problem here.';



  /**
   * An interface for initializing and accessing the script's persisted
   * state data.
   */
  CheckItOut.State = class {
    /**
     * Updates the state when migrating from one version of this script to a
     * newer one.
     */
    static _doUpdates() {
      let curVersion = state.CheckItOut.version;

      if (curVersion === '1.0') {
        CheckItOut.State._updateTo_1_1();
        curVersion = '1.1';
      }

      // Set the state's version to the latest.
      state.CheckItOut.version = 'SCRIPT_VERSION';
    }

    /**
     * Get the script's persisted state.
     * @return {CheckItOutState}
     */
    static getState() {
      return state.CheckItOut;
    }

    /**
     * Get the script's user options.
     * @return {object}
     */
    static getUserOpts() {
      return CheckItOut.State.getState().userOptions;
    }

    /**
     * Initializes the script's state.
     */
    static initializeState() {
      // Set the default values for the script's state.
      _.defaults(state, {
        CheckItOut: {}
      });
      _.defaults(state.CheckItOut, {
        graphics: {},
        themeName: 'default',
        userOptions: {},
        version: '1.0'
      });

      // Do any work necessary to migrate the state's data to the
      // latest version.
      CheckItOut.State._doUpdates();

      // Add useroptions to the state.
      let userOptions = globalconfig && globalconfig.checkitout;
      if (userOptions)
        _.extend(state.CheckItOut.userOptions, userOptions);

      // Set default values for the unspecificed useroptions.
      _.defaults(state.CheckItOut.userOptions, {
        defaultDescription: DEFAULT_DESCRIPTION
      });
    }

    /**
     * Update from version 1.0 to 1.1.
     */
    static _updateTo_1_1() {
      let theme = CheckItOut.getTheme();

      if (theme instanceof CheckItOut.themes.impl.D20System) {
        let defaultSkill= theme.skillNames[0];

        // Migrate "investigation" theme properties to their appropriate
        // default skill property.
        _.each(state.CheckItOut.graphics, objProps => {
          let themeProps = objProps.theme;
          themeProps['skillCheck_' + defaultSkill] = themeProps.investigation;
          delete themeProps.investigation;
        });
      }
    }
  };
})();

/**
 * This module provides the GM wizard for setting properties on objects via
 * a chat menu.
 */
(() => {
  'use strict';

  /**
   * The GM wizard menu.
   */
  CheckItOut.GMWizard = class {
    /**
     * @param {Graphic} target The object that the wizard displays and
     * modifies properties for.
     */
    constructor(target) {
      this._target = target;
    }

    /**
     * Gets the global script properties.
     * @return {WizardProperty[]}
     */
    getGlobalProperties() {
      let state = CheckItOut.State.getState();

      return [
        {
          id: 'globalTheme',
          name: 'Theme',
          desc: 'The theme used to handle system-specific rules for examining objects, specific to the character sheet used in your campaign.',
          value: state.themeName,
          options: (() => {
            return [
              'default',
              ...CheckItOut.themes.getRegisteredThemeNames()
            ];
          })()
        }
      ];
    }

    /**
     * Gets the basic wizard properties for the selected object.
     * @return {WizardProperty[]}
     */
    getProperties() {
      let objInfo = CheckItOut.ObjProps.getReadOnly(this._target);

      return [
        {
          id: 'name',
          name: 'Name',
          desc: 'The name of the object.',
          value: this._target.get('name')
        },
        {
          id: 'description',
          name: 'Description',
          desc: 'The description shown for the object when it is checked.',
          value: objInfo.core.description
        },
        {
          id: 'maxDist',
          name: 'Max Distance',
          desc: 'Characters must be within this distance of the object ' +
            'in order to examine it. This is measured in whatever units ' +
            'are used for the object\'s page.',
          value: objInfo.core.maxDist || 'infinity'
        },
        {
          id: 'sound',
          name: 'Sound effect',
          desc: 'A sound effect that is played when the object is checked.',
          value: objInfo.core.sound
        }
      ];
    }

    /**
     * Modifies a core property of the wizard's object.
     * @param {string} propID The ID of the property being modified.
     * @param {string[]} params The new parameters for the modified property.
     */
    modifyProperty(propID, params) {
      let objProps = CheckItOut.ObjProps.create(this._target);

      //log(`Modifying ${propID}.`);

      // global properties
      if (propID === 'globalTheme')
        CheckItOut.setTheme(params[0]);

      // object properties
      if (propID === 'name')
        this._target.set('name', params[0]);
      if (propID === 'description')
        objProps.core.description = params[0];
      if (propID === 'maxDist')
        objProps.core.maxDist = parseFloat(params[0]);
      if (propID === 'sound')
        objProps.core.sound = params[0];
    }

    /**
     * Produces the HTML content for a group of WizardProperties.
     * @param {string} modCmd The command invoked when the properties' buttons
     * are pressed
     */
    _renderProps(modCmd, properties) {
      let objID = this._target.get('_id');

      let table = new HtmlBuilder('table.propsTable');
      _.each(properties, prop => {
        let row = table.append('tr', undefined, {
          title: prop.desc
        });

        if (prop.isButton) {
          let prompt = '';
          if (prop.prompt) {
            prompt = '?{Are you sure?|yes|no}';
          }

          row.append('td', `[${prop.name}](${modCmd} ${objID} ${prop.id} ${prompt})`, {
            colspan: 2,
            style: { 'font-size': '0.8em' }
          });
        }
        else {
          // Construct the list of parameter prompts.
          let params = [];
          let paramProperties = prop.properties || [prop];
          _.each(paramProperties, item => {
            let options = '';
            if(item.options)
              options = '|' + item.options.join('|');
            params.push(`?{${item.name} ${item.desc} ${options}}`);
          });

          row.append('td', `[${prop.name}](${modCmd} ${objID} ${prop.id} ${params.join('&&')})`, {
            style: {
              'font-size': '0.8em',
              'vertical-align': 'top'
            }
          });

          row.append('td', `${prop.value || ''}`, {
            style: { 'font-size': '0.8em' }
          });
        }
      });

      return table;
    }

    /**
     * Shows the wizard menu to a GM.
     * @param {string} player The player the wizard is being shown for.
     */
    show(player) {
      let content = new HtmlBuilder('div');

      // Add core properties.
      content.append('h3', 'Core properties');
      let coreProperties = this.getProperties();
      let coreContent = this._renderProps(
        CheckItOut.commands.MODIFY_CORE_PROPERTY_CMD, coreProperties);
      content.append(coreContent);

      // Add theme properties.
      let theme = CheckItOut.getTheme();
      let themeProperties = theme.getWizardProperties(this._target);
      if (themeProperties.length > 0) {
        content.append('h3', 'Theme-specific properties');
        let themeContent = this._renderProps(
          CheckItOut.commands.MODIFY_THEME_PROPERTY_CMD, themeProperties);
        content.append(themeContent);
      }

      // Add global properties
      content.append('h3', 'Global properties');
      let globalProperties = this.getGlobalProperties();
      let globalContent = this._renderProps(
        CheckItOut.commands.MODIFY_CORE_PROPERTY_CMD, globalProperties);
      content.append(globalContent);

      // Add copy button
      let objID = this._target.get('_id');
      content.append('div', `[Copy properties to...]` +
        `(${CheckItOut.commands.COPY_PROPS_CMD} ${objID} ` +
        `&#64;{target|token_id})`, {
          title: 'Copy the properties from this object to another one.'
        });

      // Show the menu to the GM who requested it.
      let menu = new CheckItOut.utils.Menu('Object Properties', content);
      menu.show(player);
    }
  };
})();

/**
 * Initialize the CheckItOut.themes package.
 */
(() => {
  'use strict';

  /**
   * Gets the class for a registered concrete theme implementation.
   * @param {string} name The name of the theme.
   */
  function getRegisteredTheme(name) {
    return CheckItOut.themes.registeredImplementations[name];
  }

  /**
   * Gets the names of the registered concrete theme implementations.
   */
  function getRegisteredThemeNames() {
    let names = _.keys(CheckItOut.themes.registeredImplementations);
    names.sort();
    return names;
  }

  /**
   * Registers a concrete theme implementation with the script's
   * runtime environement.
   * @param {class} clz The class for the theme implementation.
   */
  function register(clz) {
    let instance = new clz();
    let name = instance.name;

    CheckItOut.themes.registeredImplementations[name] = clz;
    log('Registered CheckItOut theme: ' + name);
  }

  CheckItOut.themes = {
    getRegisteredTheme,
    getRegisteredThemeNames,
    register,
    registeredImplementations: {}
  };
})();

(() => {
  'use strict';

  CheckItOut.themes.impl = {};

  /**
   * The base class for system-specific themes used by the Check It Out script.
   * @abstract
   */
  CheckItOut.themes.CheckItOutTheme = class {

    /**
     * The name of the theme.
     * @type {string}
     */
    get name() {
      throw new Error('Not implemented.');
    }

    constructor() {}

    /**
     * Have a character check out some object, using any applicable system-
     * specific rules.
     * @param {Character} character The character who is checking the object.
     * @param {Graphic} checkedObj The graphic for the object being checked.
     * @return {Promise<string[]>}
     */
    checkObject(character, checkedObj) {
      _.noop(character, checkedObj);
      throw new Error('Not implemented');
    }

    /**
     * Get a list of the system-specific properties of an object to display
     * in the GM wizard.
     * @abstract
     * @param {Graphic} checkedObj
     * @return {WizardProperty[]}
     */
    getWizardProperties(checkedObj) {
      _.noop(checkedObj);
      throw new Error('Not implemented');
    }

    /**
     * Modifies a theme-specific property for an object.
     * @abstract
     * @param {Graphic} checkedObj
     * @param {string} prop The ID of the property being modified.
     * @param {string[]} params The parameters given for the new property value.
     */
    modifyWizardProperty(checkedObj, prop, params) {
      _.noop(checkedObj, prop, params);
      throw new Error('Not implemented.');
    }
  };
})();

/**
 * Initialize the CheckItOut.themes.impl package.
 */
(() => {
  'use strict';

  CheckItOut.themes.impl = {};
})();

(() => {
  'use strict';

  const CheckItOutTheme = CheckItOut.themes.CheckItOutTheme;

  /**
   * Base class for themes for an sheet using a typical D20 system
   * (e.g. D&D 3.5, D&D 4, D&D 5, Pathfinder, etc.)
   * @abstract
   */
  CheckItOut.themes.impl.D20System = class extends CheckItOutTheme {
    /**
     * A list of the names of skills that can be used to investigate things.
     * The first string should be the primary skill used. The rest should be
     * provided in increasing alphabetical order.
     * @abstract
     * @type {string[]}
     */
    get skillNames() {
      throw new Error('Not implemented');
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    checkObject(character, obj) {
      return Promise.all(_.map(this.skillNames, skillName => {
        return this._getInvestigationResults(character, obj, skillName);
      }))
      .then(allParagraphs => {
        return _.chain(allParagraphs)
        .flatten()
        .compact()
        .uniq()
        .value();
      });
    }

    /**
     * Gets the total "Investigation" skill modifier for a character.
     * This skill is not necessarily Investigation; It's just whatever skill
     * is used to investigate or examine things closely in whatever system
     * the theme is for.
     * @abstract
     * @param {Character} character
     * @param {string} skillName
     * @return {Promise<int>}
     */
    getSkillMod(character, skillName) {
      _.noop(character, skillName);
      throw new Error('Not implemented.');
    }

    /**
     * Get additional paragraphs about an object by having the character
     * roll an "investigation" skill check.
     * This skill is not necessarily Investigation; It's just whatever skill
     * is used to investigate or examine things closely in whatever system
     * the theme is for.
     * @param {Character} character
     * @param {Graphic} checkedObj
     * @param {string} skillName
     * @return {Promise<string[]>}
     */
    _getInvestigationResults(character, checkedObj, skillName) {
      let charID = character.get('_id');

      return Promise.resolve()
      .then(() => {
        let objProps = CheckItOut.ObjProps.get(checkedObj);

        // No problem here.
        if (!objProps || !objProps.theme['skillCheck_' + skillName])
          return [];

        // If we have cached investigation results, just return those.
        _.defaults(objProps.theme['skillCheck_' + skillName], {
          cachedResults: {}
        });

        let cachedResults = objProps.theme['skillCheck_' + skillName].cachedResults[charID];
        if (cachedResults)
          return cachedResults;

        // Try rolling investigation to see if we can learn more details.
        return this.getSkillMod(character, skillName)
        .then(skillMod => {
          skillMod = parseInt(skillMod);

          return Promise.all([
            CharSheetUtils.rollAsync(`1d20 + ${skillMod}`),
            10 + skillMod
          ]);
        })

        // Get the paragraphs for checks whose DCs we beat.
        .then(result => {
          let [rolledResult, passiveResult] = result;

          // Skip if this skill has no checks for the object.
          let checks = objProps.theme['skillCheck_' + skillName].checks;
          if (_.size(checks) === 0)
            return [];

          // Whisper the result to the GM.
          let charName = character.get('name');
          let objName = checkedObj.get('name');
          let rollMsg = `${charName} rolled ${rolledResult.total} ` +
            `on their ${skillName} check for ${objName}. `;
          if (objProps.theme.allowPassives)
            rollMsg += `Passive: ${passiveResult}`;
          CheckItOut.utils.Chat.whisperGM(rollMsg);
          //log(result);

          // Get the paragraphs for DCs that were passed.
          return _.chain(checks)
          .map((paragraph, dcStr) => {
            let dc = parseInt(dcStr);
            if (rolledResult.total >= dc || (objProps.theme.allowPassives && passiveResult >= dc))
              return paragraph;
          })
          .compact()
          .value();
        })
        .then(paragraphs => {
          objProps.theme['skillCheck_' + skillName].cachedResults[charID] = paragraphs;
          return paragraphs;
        });
      });
    }

    /**
     * @inheritdoc
     */
    getWizardProperties(checkedObj) {
      let objProps = CheckItOut.ObjProps.getReadOnly(checkedObj);

      return [
        {
          id: 'skillCheck',
          name: `Skill Checks`,
          desc: `Additional details revealed from successful skill checks.`,
          value: (() => {
            let checks = [];

            // Iterate through each skill supported by this theme.
            _.each(this.skillNames.sort(), skillName => {
              if (objProps.theme['skillCheck_' + skillName]) {
                // sort the DCs.
                let dcStrs = _.keys(objProps.theme['skillCheck_' + skillName].checks);
                let dcs = _.map(dcStrs, dc => {
                  return parseInt(dc);
                }).sort();

                // Skip if there are no DCs for this skill.
                if (dcs.length === 0)
                  return;

                // Render a line for each DC, paragraph pair.
                checks.push(`<p>${skillName}:</p>`);
                _.each(dcs, dc => {
                  let paragraph = objProps.theme['skillCheck_' + skillName].checks[dc];
                  checks.push(`<p style="font-weight: lighter;">DC ${dc}: ${paragraph}</p>`);
                }).join('');
              }
            });

            // Create the concatenated string of skill checks <p> blocks.
            if (checks.length > 0)
              return checks.join('');
            else
              return 'None';
          })(),
          properties: [
            {
              id: 'skillName',
              name: 'Skill',
              desc: 'The skill used for the check.',
              options: _.map(this.skillNames, skillName => {
                return CheckItOut.utils.sanitizeStr(skillName);
              }).sort()
            },
            {
              id: 'dc',
              name: 'DC',
              desc: `The DC for the skill check.`
            },
            {
              id: 'paragraph',
              name: 'Details',
              desc: `Additional details revealed if the character ` +
                `succeeds at the skill check.`
            }
          ]
        },
        {
          id: 'allowPassives',
          name: 'Allow Passive Skills',
          desc: 'Whether to allow passive skills to be used when checking ' +
            'out the object. When determining the results of a check the ' +
            'higher of the character\'s passive score and their rolled ' +
            'score will be used.',
          value: (() => {
            if (objProps.theme.allowPassives)
              return 'yes';
            else
              return 'no';
          })(),
          options: ['yes', 'no']
        },
        {
          id: 'resetCache',
          name: 'Reset Cache',
          desc: `Resets the cached skill check results for this object.`,
          isButton: true,
          prompt: true
        }
      ];
    }

    /**
     * @inheritdoc
     */
    modifyWizardProperty(checkedObj, prop, params) {
      let objProps = CheckItOut.ObjProps.create(checkedObj);

      // Create the property if it doesn't exist.
      _.each(this.skillNames, skillName => {
        let skillProp = 'skillCheck_' + skillName;
        _.defaults(objProps.theme, {
          [skillProp]: {}
        });
        _.defaults(objProps.theme[skillProp], {
          checks: {},
          cachedResults: {}
        });
      });

      if (prop === 'skillCheck') {
        let skillName = CheckItOut.utils.unsanitizeStr(params[0]);
        let dc = parseInt(params[1]);
        let paragraph = params[2];

        // Persist the check, or delete it if the paragraph is blank.
        if (paragraph)
          objProps.theme['skillCheck_' + skillName].checks[dc] = paragraph;
        else
          delete objProps.theme['skillCheck_' + skillName].checks[dc];
      }

      if (prop === 'allowPassives') {
        let allowed = params[0] === 'yes';
        objProps.theme.allowPassives = allowed;
      }

      if (prop === 'resetCache' && params[0] === 'yes') {
        _.each(this.skillNames, skillName => {
          objProps.theme['skillCheck_' + skillName].cachedResults = {};
        });
      }
    }
  };
})();

(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;
  if (!D20System)
    throw new Error('Base class D20System is not defined.');

  /**
   * Base class for D&D 3.5 themes.
   * @abstract
   */
  CheckItOut.themes.impl.DnD3p5e = class extends D20System {
    /**
     * @inheritdoc
     */
     get skillNames() {
       return [
         'Search',
         'Appraise',
         'Decipher Script',
         'Knowledge(Arcana)',
         'Knowledge(Architecture & Engineering)',
         'Knowledge(Dungeoneering)',
         'Knowledge(Geography)',
         'Knowledge(History)',
         'Knowledge(Local)',
         'Knowledge(Nature)',
         'Knowledge(Nobility & Royalty)',
         'Knowledge(Religion)',
         'Knowledge(The Planes)',
         'Listen',
         'Sense Motive',
         'Spellcraft',
         'Spot',
         'Survival'
       ];
    }

    constructor() {
      super();
    }
  };
})();

(() => {
  'use strict';

  const DnD3p5e = CheckItOut.themes.impl.DnD3p5e;
  if (!DnD3p5e)
    throw new Error('Base class DnD3p5e is not defined.');

  /**
   * Theme for the D&D 3.5E sheet by Diana P.
   */
  class DnD3p5eSheet extends DnD3p5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 3.5E';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Appraise')
        return CharSheetUtils.getSheetAttr(character, 'appraise');
      if (skillName === 'Decipher Script')
        return CharSheetUtils.getSheetAttr(character, 'decipherscript');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'knowarcana');
      if (skillName === 'Knowledge(Architecture & Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'knowengineer');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'knowdungeon');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'knowgeography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'knowhistory');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'knowlocal');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'knownature');
      if (skillName === 'Knowledge(Nobility & Royalty)')
        return CharSheetUtils.getSheetAttr(character, 'knownobility');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'knowreligion');
      if (skillName === 'Knowledge(The Planes)')
        return CharSheetUtils.getSheetAttr(character, 'knowplanes');
      if (skillName === 'Listen')
        return CharSheetUtils.getSheetAttr(character, 'listen');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'sensemotive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'spellcraft');
      if (skillName === 'Spot')
        return CharSheetUtils.getSheetAttr(character, 'spot');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
      if (skillName === 'Search')
        return CharSheetUtils.getSheetAttr(character, 'search');
    }
  }

  CheckItOut.themes.register(DnD3p5eSheet);
})();

(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for D&D 4E themes.
   * @abstract
   */
  CheckItOut.themes.impl.DnD4e = class extends D20System {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Perception',
        'Arcana',
        'Dungeoneering',
        'History',
        'Insight',
        'Nature',
        'Religion',
        'Streetwise'
      ];
    }

    constructor() {
      super();
    }
  };
})();

(() => {
  'use strict';

  const DnD4e = CheckItOut.themes.impl.DnD4e;

  /**
   * Theme for the D&D 4E sheet by Alex L. et al.
   */
  class DnD4eSheet extends DnD4e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 4E';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character, 'arcana');
      if (skillName === 'Dungeoneering')
        return CharSheetUtils.getSheetAttr(character, 'dungeoneering');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character, 'history');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character, 'religion');
      if (skillName === 'Streetwise')
        return CharSheetUtils.getSheetAttr(character, 'streetwise');
    }
  }

  CheckItOut.themes.register(DnD4eSheet);
})();

(() => {
  'use strict';

  const DnD4e = CheckItOut.themes.impl.DnD4e;

  /**
   * Base class for themes for the Gamma World 7th edition system (the one
   * based on D&D 4E).
   * @abstract
   */
  CheckItOut.themes.impl.GammaWorld7E = class extends DnD4e {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Perception',
        'Conspiracy',
        'Insight',
        'Mechanics',
        'Nature',
        'Science'
      ];
    }

    constructor() {
      super();
    }
  };
})();

(() => {
  'use strict';

  const GammaWorld7E = CheckItOut.themes.impl.GammaWorld7E;

  /**
   * Theme for the Gamma World 7th Edition sheet by Stephen L.
   */
  class GammaWorld7ESheet extends GammaWorld7E {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Gamma World 7th Edition';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Conspiracy')
        return CharSheetUtils.getSheetAttr(character, 'conspiracy');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight');
      if (skillName === 'Mechanics')
        return CharSheetUtils.getSheetAttr(character, 'mechanics');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Science')
        return CharSheetUtils.getSheetAttr(character, 'science');
    }
  }

  CheckItOut.themes.register(GammaWorld7ESheet);
})();

(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for D&D 5E themes.
   * @abstract
   */
  CheckItOut.themes.impl.Dnd5e = class extends D20System {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Investigation',
        'Arcana',
        'History',
        'Insight',
        'Medicine',
        'Nature',
        'Perception',
        'Religion',
        'Survival'
      ];
    }

    constructor() {
      super();
    }
  };
})();

(() => {
  'use strict';

  const DnD5e = CheckItOut.themes.impl.Dnd5e;

  /**
   * Theme for the D&D 5 "community" sheet.
   */
  class DnD5eCommunity extends DnD5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 5E Community';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character, 'arcana');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character, 'history');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight');
      if (skillName === 'Investigation')
        return CharSheetUtils.getSheetAttr(character, 'investigation');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character, 'medicine');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character, 'religion');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
    }
  }

  CheckItOut.themes.register(DnD5eCommunity);
})();

(() => {
  'use strict';

  const DnD5e = CheckItOut.themes.impl.Dnd5e;

  /**
   * Theme for the Roll20 official D&D 5 sheet.
   */
  class DnD5eRoll20 extends DnD5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 5E Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character, 'arcana_bonus');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character, 'history_bonus');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight_bonus');
      if (skillName === 'Investigation')
        return CharSheetUtils.getSheetAttr(character, 'investigation_bonus');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character, 'medicine_bonus');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature_bonus');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception_bonus');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character, 'religion_bonus');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival_bonus');
    }
  }

  CheckItOut.themes.register(DnD5eRoll20);
})();

(() => {
  'use strict';

  const DnD5e = CheckItOut.themes.impl.Dnd5e;

  /**
   * Theme for the D&D 5 "Shaped" sheet.
   */
  class DnD5eShaped extends DnD5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 5E Shaped';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/arcana/total_with_sign');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/history/total_with_sign');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/insight/total_with_sign');
      if (skillName === 'Investigation')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/investigation/total_with_sign');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/medicine/total_with_sign');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/nature/total_with_sign');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/perception/total_with_sign');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/religion/total_with_sign');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/survival/total_with_sign');
    }
  }

  CheckItOut.themes.register(DnD5eShaped);
})();

(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for Pathfinder themes.
   * @abstract
   */
  CheckItOut.themes.impl.Pathfinder = class extends D20System {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Perception',
        'Appraise',
        'Heal',
        'Knowledge(Arcana)',
        'Knowledge(Dungeoneering)',
        'Knowledge(Engineering)',
        'Knowledge(Geography)',
        'Knowledge(History)',
        'Knowledge(Local)',
        'Knowledge(Nature)',
        'Knowledge(Nobility)',
        'Knowledge(Planes)',
        'Knowledge(Religion)',
        'Linguistics',
        'Sense Motive',
        'Spellcraft',
        'Survival'
      ];
    }

    constructor() {
      super();
    }
  };
})();

(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Roll20 official Pathfinder sheet.
   */
  class PathfinderRoll20 extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Appraise')
        return CharSheetUtils.getSheetAttr(character, 'appraise');
      if (skillName === 'Heal')
        return CharSheetUtils.getSheetAttr(character, 'heal');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_arcana');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_dungeoneering');
      if (skillName === 'Knowledge(Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_engineering');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_geography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_history');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_local');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_nature');
      if (skillName === 'Knowledge(Nobility)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_nobility');
      if (skillName === 'Knowledge(Planes)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_planes');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_religion');
      if (skillName === 'Linguistics')
        return CharSheetUtils.getSheetAttr(character, 'linguistics');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'sense_motive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'spellcraft');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
    }
  }

  CheckItOut.themes.register(PathfinderRoll20);
})();

(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Pathfinder "Community" sheet.
   */
  class PathfinderCommunity extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Community';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Appraise')
        return CharSheetUtils.getSheetAttr(character, 'Appraise');
      if (skillName === 'Heal')
        return CharSheetUtils.getSheetAttr(character, 'Heal');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Arcana');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Dungeoneering');
      if (skillName === 'Knowledge(Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Engineering');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Geography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-History');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Local');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Nature');
      if (skillName === 'Knowledge(Nobility)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Nobility');
      if (skillName === 'Knowledge(Planes)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Planes');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Religion');
      if (skillName === 'Linguistics')
        return CharSheetUtils.getSheetAttr(character, 'Linguistics');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'Perception');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'Sense-Motive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'Spellcraft');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'Survival');
    }
  }

  CheckItOut.themes.register(PathfinderCommunity);
})();

(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Pathfinder "Simple" sheet.
   */
  class PathfinderSimple extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Simple';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Appraise')
        return CharSheetUtils.getSheetAttr(character, 'appraise');
      if (skillName === 'Heal')
        return CharSheetUtils.getSheetAttr(character, 'heal');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_arcana');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_dungeoneering');
      if (skillName === 'Knowledge(Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_engineering');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_geography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_history');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_local');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_nature');
      if (skillName === 'Knowledge(Nobility)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_nobility');
      if (skillName === 'Knowledge(Planes)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_planes');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_religion');
      if (skillName === 'Linguistics')
        return CharSheetUtils.getSheetAttr(character, 'linguistics');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'sense_motive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'spellcraft');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
    }
  }

  CheckItOut.themes.register(PathfinderSimple);
})();

(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for Starfinder themes.
   * @abstract
   */
  CheckItOut.themes.impl.Starfinder = class extends D20System {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Perception',
        'Computers',
        'Culture',
        'Engineering',
        'Life Science',
        'Medicine',
        'Mysticism',
        'Physical Science',
        'Survival'
      ];
    }

    constructor() {
      super();
    }
  };
})();

(() => {
  'use strict';

  const Starfinder = CheckItOut.themes.impl.Starfinder;

  /**
   * Theme for the official Roll20 Starfinder sheet.
   */
  class StarfinderRoll20 extends Starfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Starfinder Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Computers')
        return CharSheetUtils.getSheetAttr(character, 'computers');
      if (skillName === 'Culture')
        return CharSheetUtils.getSheetAttr(character, 'culture');
      if (skillName === 'Engineering')
        return CharSheetUtils.getSheetAttr(character, 'engineering');
      if (skillName === 'Life Science')
        return CharSheetUtils.getSheetAttr(character, 'life_science');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character, 'medicine');
      if (skillName === 'Mysticism')
        return CharSheetUtils.getSheetAttr(character, 'mysticism');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Physical Science')
        return CharSheetUtils.getSheetAttr(character, 'physical_science');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
    }
  }

  CheckItOut.themes.register(StarfinderRoll20);
})();

(() => {
  'use strict';

  const Starfinder = CheckItOut.themes.impl.Starfinder;

  /**
   * Theme for Starfinder "Simple" sheet.
   */
  class StarfinderSimple extends Starfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Starfinder Simple';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
     getSkillMod(character, skillName) {
       if (skillName === 'Computers')
         return CharSheetUtils.getSheetAttr(character, 'Computers');
       if (skillName === 'Culture')
         return CharSheetUtils.getSheetAttr(character, 'Culture');
       if (skillName === 'Engineering')
         return CharSheetUtils.getSheetAttr(character, 'Engineering');
       if (skillName === 'Life Science')
         return CharSheetUtils.getSheetAttr(character, 'Life-Science');
       if (skillName === 'Medicine')
         return CharSheetUtils.getSheetAttr(character, 'Medicine');
       if (skillName === 'Mysticism')
         return CharSheetUtils.getSheetAttr(character, 'Mysticism');
       if (skillName === 'Perception')
         return CharSheetUtils.getSheetAttr(character, 'Perception');
       if (skillName === 'Physical Science')
         return CharSheetUtils.getSheetAttr(character, 'Physical-Science');
       if (skillName === 'Survival')
         return CharSheetUtils.getSheetAttr(character, 'Survival');
     }
  }

  CheckItOut.themes.register(StarfinderSimple);
})();

(() => {
  'use strict';

  const BASE_THEME = CheckItOut.themes.CheckItOutTheme;

  /**
   * The default theme for the Check It Out script. It has no system-specific
   * behavior.
   */
  CheckItOut.themes.impl.DefaultTheme = class extends BASE_THEME {
    /**
     * @inheritdoc
     */
    get name() {
      return 'default';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    checkObject(character, checkedObject) {
      _.noop(character, checkedObject);
      return Promise.resolve([]);
    }

    /**
     * @inheritdoc
     */
    getWizardProperties(checkedObj) {
      _.noop(checkedObj);
      return [];
    }

    /**
     * @inheritdoc
     */
    modifyWizardProperty(checkedObj, prop, params) {
      _.noop(checkedObj, prop, params);
    }
  };
})();

/**
 * Initialize the CheckItOut.utils package.
 */
(() => {
  'use strict';

  /**
   * Creates a deep copy of an object. This object must be a POJO
   * (Plain Old Javascript Object).
   * @param {object} obj
   */
  function deepCopy(obj) {
    let json = JSON.stringify(obj);
    return JSON.parse(json);
  }

  /**
   * Gets the HTML-sanitized version of a string.
   * E.g., all '&'s will be changed to '&#38;'.
   * @param {string} str
   * @return {string}
   */
  function sanitizeStr(str) {
    return str.replace(/[^0-9a-zA-Z ]/g, match => {
      return `&#${match[0].charCodeAt(0)};`;
    });
  }

  /**
   * Gets the unsanitized version of an HTML-sanitized string.
   * E.g., all '&#38;'s will be changed to '&'.
   * @param {string} str
   * @return {string}
   */
  function unsanitizeStr(str) {
    return str.replace(/&#(\d+);/g, match => {
      return String.fromCharCode(match[1]);
    });
  }

  CheckItOut.utils = {
    deepCopy,
    sanitizeStr,
    unsanitizeStr
  };
})();

(() => {
  'use strict';

  const FROM_NAME = 'Check It Out script';

  CheckItOut.utils.Chat = class {

    /**
     * Displays a message in the chat visible to all players.
     * @param {string} message
     */
    static broadcast(message) {
      sendChat(FROM_NAME, message);
    }

    /**
     * Notify GMs about an error and logs its stack trace.
     * @param {Error} err
     */
    static error(err) {
      log(`CheckItOut ERROR: ${err.message}`);
      log(err.stack);
      CheckItOut.utils.Chat.whisperGM(
        `ERROR: ${err.message} --- See API console log for details.`);
    }

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
     * Whispers a message to a player.
     * @param {string} who The name of recipient player.
     * @param {string} message The whispered message.
     */
    static whisper(who, message) {
      let whoFixed = CheckItOut.utils.Chat.fixWho(who);
      sendChat(FROM_NAME, '/w "' + whoFixed + '" ' + message);
    }

    /**
     * Whispers a message to the GM.
     * @param {string} message
     */
    static whisperGM(message) {
      sendChat(FROM_NAME, '/w gm ' + message);
    }
  };
})();

(() => {
  'use strict';

  const MENU_CSS = {
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
    },
    'optionsTable': {
      'width': '100%'
    },
    'propsTable': {
      'margin-bottom': '1em'
    }
  };

  /**
   * A stylized menu that can be whispered in the chat to a player.
   */
  CheckItOut.utils.Menu = class {
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
      let who = player.get('_displayname');

      // Construct the HTML content for the menu.
      let menu = new HtmlBuilder('.menu');
      menu.append('.menuHeader', this._header);
      menu.append('.menuBody', this._content);
      let html = menu.toString(MENU_CSS);

      // Whisper the menu to the player.
      CheckItOut.utils.Chat.whisper(who, html);
    }
  };
})();
