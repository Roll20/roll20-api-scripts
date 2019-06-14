(() => {
  'use strict';

  const Starfinder = CheckItOut.themes.impl.Starfinder;

  /**
   * Theme for the official Roll20 Starfinder sheet.
   */
  class StarfinderRoll20 extends Starfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Starfinder Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
<<<<<<< HEAD
    getSkillMod(character, skillName) {
      if (skillName === 'Computers')
        return CharSheetUtils.getSheetAttr(character, 'computers');
      if (skillName === 'Culture')
        return CharSheetUtils.getSheetAttr(character, 'culture');
      if (skillName === 'Engineering')
        return CharSheetUtils.getSheetAttr(character, 'engineering');
      if (skillName === 'Life Science')
        return CharSheetUtils.getSheetAttr(character, 'life_science');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character, 'medicine');
      if (skillName === 'Mysticism')
        return CharSheetUtils.getSheetAttr(character, 'mysticism');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Physical Science')
        return CharSheetUtils.getSheetAttr(character, 'physical_science');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
=======
    getInvestigationMod(character) {
      return CharSheetUtils.getSheetAttr(character, 'perception');
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }
  }

  CheckItOut.themes.register(StarfinderRoll20);
})();
