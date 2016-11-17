(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-PF-Simple';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    'fort': 'fort',
    'ref': 'ref',
    'will': 'will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the Pathfinder (Simple) OGL character sheet by Stephen L..
     */
    class TrapThemePFSimple extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return 'PF-Simple';
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
        return TrapTheme.getSheetAttr(character, 'perception')
        .then(perception => {
          return perception + 10;
        });
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName]);
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let result = super.getThemeProperties(trapToken);
        let save = _.find(result, item => {
          return item.id === 'save';
        });
        save.options = [ 'none', 'fort', 'ref', 'will' ];
        return result;
      }
    }

    ItsATrap.registerTheme(new TrapThemePFSimple());
  });
})();
