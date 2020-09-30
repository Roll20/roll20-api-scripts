(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = '5E-Generic';

  const SHEET_ATTRS = {
    roll20: { // Used to be called 'ogl'
      ac: 'ac',
      strSaveModifier: 'strength_save_bonus',
      dexSaveModifier: 'dexterity_save_bonus',
      conSaveModifier: 'constitution_save_bonus',
      intSaveModifier: 'intelligence_save_bonus',
      wisSaveModifier: 'wisdom_save_bonus',
      chaSaveModifier: 'charisma_save_bonus',
      perceptionModifier: 'perception_bonus',
      passivePerception: 'passive_wisdom'
    },
    ogl: { // ogl is kept only for backwards compatibility.
      ac: 'ac',
      strSaveModifier: 'strength_save_bonus',
      dexSaveModifier: 'dexterity_save_bonus',
      conSaveModifier: 'constitution_save_bonus',
      intSaveModifier: 'intelligence_save_bonus',
      wisSaveModifier: 'wisdom_save_bonus',
      chaSaveModifier: 'charisma_save_bonus',
      perceptionModifier: 'perception_bonus',
      passivePerception: 'passive_wisdom'
    },
    community: {
      ac: 'AC_calc',
      strSaveModifier: 'strength_save_mod',
      dexSaveModifier: 'dexterity_save_mod',
      conSaveModifier: 'constitution_save_mod',
      intSaveModifier: 'intelligence_save_mod',
      wisSaveModifier: 'wisdom_save_mod',
      chaSaveModifier: 'charisma_save_mod',
      perceptionModifier: 'perception',
      passivePerception: 'passive_perception'
    },
    shaped: {
      ac: 'AC',
      strSaveModifier: 'strength_saving_throw_mod_with_sign',
      dexSaveModifier: 'dexterity_saving_throw_mod_with_sign',
      conSaveModifier: 'constitution_saving_throw_mod_with_sign',
      intSaveModifier: 'intelligence_saving_throw_mod_with_sign',
      wisSaveModifier: 'wisdom_saving_throw_mod_with_sign',
      chaSaveModifier: 'charisma_saving_throw_mod_with_sign',
      perceptionModifier: 'skill/name/perception/total_with_sign',
      passivePerception: 'skill/name/perception/passive'
    }
  };

  /**
   * Gets the value of a One-Click user option for this script.
   * @param {string} option
   * @return {any}
   */
  function getOption(option) {
    let options = globalconfig && globalconfig.itsatrapdnd5e;
    if(!options)
      options = (state.itsatrapdnd5e && state.itsatrapdnd5e.useroptions) || {};

    return options[option];
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A generic D&D 5E trap theme
     * @implements ItsATrap#D20TrapTheme
     */
    class TrapTheme5EGeneric extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return '5E-Generic';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        let sheet = getOption('sheet');
        sheet = SHEET_ATTRS[sheet];

        let attrName = getOption('ac');
        if(sheet)
          attrName = sheet.ac

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for AC in the One-Click options.'));
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        let sheet = getOption('sheet');
        sheet = SHEET_ATTRS[sheet];

        let attrName = getOption('passivePerception');
        if(sheet)
          attrName = sheet.passivePerception;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else {
          attrName = getOption('perceptionModifier');
          if(sheet)
            attrName = sheet.perceptionModifier;

          if(attrName)
            return CharSheetUtils.getSheetAttr(character, attrName)
            .then(value => {
              return value + 10;
            });
          else
            return Promise.reject(new Error('Please provide name of the attribute ' +
              'for either passive perception or the perception modifier in the One-Click options.'));
        }

      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        let sheet = getOption('sheet');
        sheet = SHEET_ATTRS[sheet];

        let key = saveName + 'SaveModifier';
        let attrName = getOption(key);
        if(sheet)
          attrName = sheet[key];

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject('Please provide name of the attribute for ' +
            saveName + ' save modifier in the One-Click options.');
      }
    }
    ItsATrap.registerTheme(new TrapTheme5EGeneric());
  });
})();
