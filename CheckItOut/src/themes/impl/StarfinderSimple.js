(() => {
  'use strict';

  const Starfinder = CheckItOut.themes.impl.Starfinder;

  /**
   * Theme for Starfinder "Simple" sheet.
   */
  class StarfinderSimple extends Starfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Starfinder Simple';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'Perception');
    }
  }

  CheckItOut.themes.register(StarfinderSimple);
})();
