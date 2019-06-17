(() => {
  'use strict';

  const DnD5e = CheckItOut.themes.impl.Dnd5e;

  /**
   * Theme for the Roll20 official D&D 5 sheet.
   */
  class DnD5eRoll20 extends DnD5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 5E Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'investigation_bonus');
    }
  }

  CheckItOut.themes.register(DnD5eRoll20);
})();
