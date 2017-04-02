(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-5E-Community';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    'str': 'strength_save_mod',
    'dex': 'dexterity_save_mod',
    'con': 'constitution_save_mod',
    'int': 'intelligence_save_mod',
    'wis': 'wisdom_save_mod',
    'cha': 'charisma_save_mod'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the 5th Edition Community character sheet.
     * @implements ItsATrap#TrapTheme
     */
    class TrapTheme5ECommunity extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return '5E-Community';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        return Promise.all([
          TrapTheme.getSheetAttr(character, 'AC_calc')
          .then(result => {
            if(_.isNumber(result))
              return result;
            else
              return TrapTheme.forceAttrCalculation(character, 'AC_calc');
          }),
          TrapTheme.getSheetAttr(character, 'AC_no_armour_calc')
          .then(result => {
            if(_.isNumber(result))
              return result;
            else
              return TrapTheme.forceAttrCalculation(character, 'AC_no_armour_calc');
          })
        ])
        .then(results => {
          // Just take the higher of the two ACs.
          return Math.max(results[0] || 0, results[1] || 0);
        });
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return TrapTheme.getSheetAttr(character, 'passive_perception');
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName])
        .then(result => {
          if(_.isNumber(result))
            return result;
          else
            return TrapTheme.forceAttrCalculation(character, SAVE_NAMES[saveName]);
        });
      }
    }
    ItsATrap.registerTheme(new TrapTheme5ECommunity());
  });
})();
