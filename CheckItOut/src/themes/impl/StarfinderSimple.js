(() => {
  'use strict';

  const Starfinder = CheckItOut.themes.impl.Starfinder;

  /**
   * Theme for Starfinder "Simple" sheet.
   */
  class StarfinderSimple extends Starfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Starfinder Simple';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
     getSkillMod(character, skillName) {
       if (skillName === 'Computers')
         return CharSheetUtils.getSheetAttr(character, 'Computers');
       if (skillName === 'Culture')
         return CharSheetUtils.getSheetAttr(character, 'Culture');
       if (skillName === 'Engineering')
         return CharSheetUtils.getSheetAttr(character, 'Engineering');
       if (skillName === 'Life Science')
         return CharSheetUtils.getSheetAttr(character, 'Life-Science');
       if (skillName === 'Medicine')
         return CharSheetUtils.getSheetAttr(character, 'Medicine');
       if (skillName === 'Mysticism')
         return CharSheetUtils.getSheetAttr(character, 'Mysticism');
       if (skillName === 'Perception')
         return CharSheetUtils.getSheetAttr(character, 'Perception');
       if (skillName === 'Physical Science')
         return CharSheetUtils.getSheetAttr(character, 'Physical-Science');
       if (skillName === 'Survival')
         return CharSheetUtils.getSheetAttr(character, 'Survival');
     }
  }

  CheckItOut.themes.register(StarfinderSimple);
})();
