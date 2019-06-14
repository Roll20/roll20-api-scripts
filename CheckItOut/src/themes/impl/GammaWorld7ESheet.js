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
<<<<<<< HEAD
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
=======
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'perception');
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }
  }

  CheckItOut.themes.register(GammaWorld7ESheet);
})();
