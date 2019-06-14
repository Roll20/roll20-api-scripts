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
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character, 'arcana');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character, 'history');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight');
      if (skillName === 'Investigation')
        return CharSheetUtils.getSheetAttr(character, 'investigation');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character, 'medicine');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character, 'religion');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
    }
  }

  CheckItOut.themes.register(DnD5eCommunity);
})();
