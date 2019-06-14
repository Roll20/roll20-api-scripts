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
    getSkillMod(character, skillName) {
      if (skillName === 'Conspiracy')
        return CharSheetUtils.getSheetAttr(character, 'conspiracy');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight');
      if (skillName === 'Mechanics')
        return CharSheetUtils.getSheetAttr(character, 'mechanics');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Science')
        return CharSheetUtils.getSheetAttr(character, 'science');
    }
  }

  CheckItOut.themes.register(GammaWorld7ESheet);
})();
