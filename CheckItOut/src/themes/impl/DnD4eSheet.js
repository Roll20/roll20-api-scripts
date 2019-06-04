(() => {
  'use strict';

  const DnD4e = CheckItOut.themes.impl.DnD4e;

  /**
   * Theme for the D&D 4E sheet by Alex L. et al.
   */
  class DnD4eSheet extends DnD4e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 4E';
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

  CheckItOut.themes.register(DnD4eSheet);
})();
