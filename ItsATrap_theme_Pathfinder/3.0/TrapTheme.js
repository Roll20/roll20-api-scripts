(() => {
  'use strict';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    fort: 'Fort',
    ref: 'Ref',
    will: 'Will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the Pathfinder character sheet by Samuel Marino, Nibrodooh,
     * Vince, Samuel Terrazas, chris-b, Magik, and James W..
     */
    class TrapThemePF extends D20TrapTheme {

      /**
       * @inheritdoc
       */
      get name() {
        return 'Pathfinder';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        return parseInt(TrapTheme.getSheetAttr(character.get('_id'), 'AC'));
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return TrapThemeHelper.getSheetAttr(character, 'Perception');
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName]);
      }
    }
    ItsATrap.registerTheme(new TrapThemePF());
  });
})();
