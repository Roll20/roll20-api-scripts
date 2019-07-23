(() => {
  'use strict';

  // A mapping of saving throw short names to their attribute names.
  const DEFENSE_NAMES = {
    'ac': 'ac',
    'fort': 'fort',
    'ref': 'ref',
    'will': 'will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the D&D 4th Edition character sheet.
     */
    class TrapThemeDnD4 extends D20TrapTheme4E {
      /**
       * @inheritdoc
       */
      get name() {
        return 'DnD4';
      }

      /**
       * @inheritdoc
       */
      getDefense(character, defenseName) {
        return CharSheetUtils.getSheetAttr(character, DEFENSE_NAMES[defenseName]);
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return CharSheetUtils.getSheetAttr(character, 'passive-perception');
      }
    }
    ItsATrap.registerTheme(new TrapThemeDnD4());
  });
})();
