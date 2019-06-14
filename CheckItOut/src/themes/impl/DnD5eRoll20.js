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
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character, 'arcana_bonus');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character, 'history_bonus');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight_bonus');
      if (skillName === 'Investigation')
        return CharSheetUtils.getSheetAttr(character, 'investigation_bonus');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character, 'medicine_bonus');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature_bonus');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception_bonus');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character, 'religion_bonus');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival_bonus');
    }
  }

  CheckItOut.themes.register(DnD5eRoll20);
})();
