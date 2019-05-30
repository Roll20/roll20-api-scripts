(() => {
  'use strict';

  const GammaWorld7E = CheckItOut.themes.impl.GammaWorld7E;

  /**
   * Theme for the Gamma World 7th Edition sheet by Stephen L.
   */
  class GammaWorld7ESheet extends GammaWorld7E {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Gamma World 7th Edition';
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

  CheckItOut.themes.register(GammaWorld7ESheet);
})();
