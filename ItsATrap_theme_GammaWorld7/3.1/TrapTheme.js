(() => {
  'use strict';

  // A mapping of saving throw short names to their attribute names.
  const DEFENSE_NAMES = {
    'ac': 'AC',
    'fort': 'fortitude',
    'ref': 'reflex',
    'will': 'will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the Gamma World 7E character sheet.
     */
    class TrapThemeGW extends D20TrapTheme4E {
      /**
       * @inheritdoc
       */
      get name() {
        return 'GammaWorld7';
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
        return CharSheetUtils.getSheetAttr(character, 'perception')
        .then(result => {
          if(_.isNumber(result))
            return result + 10;
          return result;
        });
      }
    }
    ItsATrap.registerTheme(new TrapThemeGW());
  });
})();
