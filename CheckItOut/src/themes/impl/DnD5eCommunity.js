(() => {
  'use strict';

  const DnD5e = CheckItOut.themes.impl.Dnd5e;

  /**
   * Theme for the D&D 5 "community" sheet.
   */
  class DnD5eCommunity extends DnD5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 5E Community';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'investigation');
    }
  }

  CheckItOut.themes.register(DnD5eCommunity);
})();
