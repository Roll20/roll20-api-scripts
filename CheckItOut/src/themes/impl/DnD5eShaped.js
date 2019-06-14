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
    getSkillMod(character, skillName) {
      if (skillName === 'Arcana')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/arcana/total_with_sign');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/history/total_with_sign');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/insight/total_with_sign');
      if (skillName === 'Investigation')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/investigation/total_with_sign');
      if (skillName === 'Medicine')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/medicine/total_with_sign');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/nature/total_with_sign');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/perception/total_with_sign');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/religion/total_with_sign');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character,
          'skill/name/survival/total_with_sign');
    }
  }

  CheckItOut.themes.register(DnD5eShaped);
})();
