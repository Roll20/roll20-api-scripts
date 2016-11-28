(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-5E_OGL';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    'str': 'strength_save_bonus',
    'dex': 'dexterity_save_bonus',
    'con': 'constitution_save_bonus',
    'int': 'intelligence_save_bonus',
    'wis': 'wisdom_save_bonus',
    'cha': 'charisma_save_bonus'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the 5th Edition OGL character sheet.
     */
    class TrapTheme5EOGL extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return '5E-OGL';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        return TrapTheme.getSheetAttr(character, 'ac');
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        // Due to some weirdness with how computed attributes are calculated
        // in the API, perception_type needs to be set or else
        // passive_wisdom will be undefined, even though it works fine
        // in macros.
        var percType = findObjs({
          _type: 'attribute',
          _characterid: character.get('_id'),
          name: 'perception_type'
        })[0];
        if(!percType)
          createObj('attribute', {
            _characterid: character.get('_id'),
            name: 'perception_type',
            current: 1
          });

        var passPerc = findObjs({
          _type: 'attribute',
          _characterid: character.get('_id'),
          name: 'passive_perception'
        })[0];
        if(!passPerc)
          createObj('attribute', {
            _characterid: character.get('_id'),
            name: 'passive_perception',
            current: 0
          });

        return TrapTheme.getSheetAttr(character, 'passive_wisdom');
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName]);
      }
    }

    ItsATrap.registerTheme(new TrapTheme5EOGL());
  });
})();
