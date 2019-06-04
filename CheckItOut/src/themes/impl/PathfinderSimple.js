(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Pathfinder "Simple" sheet.
   */
  class PathfinderSimple extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Simple';
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

  CheckItOut.themes.register(PathfinderSimple);
})();
