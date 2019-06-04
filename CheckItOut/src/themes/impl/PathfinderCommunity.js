(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Pathfinder "Community" sheet.
   */
  class PathfinderCommunity extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Community';
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

  CheckItOut.themes.register(PathfinderCommunity);
})();
