(() => {
  'use strict';

  const DnD4e = CheckItOut.themes.impl.DnD4e;

  /**
   * Theme for the D&D 4E sheet by Alex L. et al.
   */
  class DnD4eSheet extends DnD4e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 4E';
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
      if (skillName === 'Dungeoneering')
        return CharSheetUtils.getSheetAttr(character, 'dungeoneering');
      if (skillName === 'History')
        return CharSheetUtils.getSheetAttr(character, 'history');
      if (skillName === 'Insight')
        return CharSheetUtils.getSheetAttr(character, 'insight');
      if (skillName === 'Nature')
        return CharSheetUtils.getSheetAttr(character, 'nature');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Religion')
        return CharSheetUtils.getSheetAttr(character, 'religion');
      if (skillName === 'Streetwise')
        return CharSheetUtils.getSheetAttr(character, 'streetwise');
    }
  }

  CheckItOut.themes.register(DnD4eSheet);
})();
