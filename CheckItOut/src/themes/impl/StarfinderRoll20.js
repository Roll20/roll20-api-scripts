(() => {
  'use strict';

  const Starfinder = CheckItOut.themes.impl.Starfinder;

  /**
   * Theme for the official Roll20 Starfinder sheet.
   */
  class StarfinderRoll20 extends Starfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Starfinder Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'perception');
    }
  }

  CheckItOut.themes.register(StarfinderRoll20);
})();
