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
