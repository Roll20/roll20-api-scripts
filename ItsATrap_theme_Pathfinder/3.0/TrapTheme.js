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
        return TrapTheme.getSheetAttr(character, 'AC');
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return TrapTheme.getSheetAttr(character, 'Perception')
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
    ItsATrap.registerTheme(new TrapThemePF());
  });
})();
