(() => {
  'use strict';

  const DnD3p5e = CheckItOut.themes.impl.DnD3p5e;
  if (!DnD3p5e)
    throw new Error('Base class DnD3p5e is not defined.');

  /**
   * Theme for the D&D 3.5E sheet by Diana P.
   */
  class DnD3p5eSheet extends DnD3p5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 3.5E';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'search');
    }
  }

  CheckItOut.themes.register(DnD3p5eSheet);
})();
