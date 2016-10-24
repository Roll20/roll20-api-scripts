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
    class TrapThemePFSimple {
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
        return parseInt(TrapTheme.getSheetAttr(character.get('_id'), 'ac'));
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return TrapThemeHelper.getSheetAttr(character, 'perception');
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName]);
      }
    }

    ItsATrap.registerTheme(new TrapThemePFSimple());
  });
})();
