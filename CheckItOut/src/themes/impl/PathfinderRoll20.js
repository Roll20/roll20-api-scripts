(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Roll20 official Pathfinder sheet.
   */
  class PathfinderRoll20 extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Roll20';
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

  CheckItOut.themes.register(PathfinderRoll20);
})();
