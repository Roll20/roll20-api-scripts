(() => {
  'use strict';

  const DnD5e = CheckItOut.themes.impl.Dnd5e;

  /**
   * Theme for the D&D 5 "Shaped" sheet.
   */
  class DnD5eShaped extends DnD5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 5E Shaped';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character,
        'skill/name/investigation/total_with_sign');
    }
  }

  CheckItOut.themes.register(DnD5eShaped);
})();
