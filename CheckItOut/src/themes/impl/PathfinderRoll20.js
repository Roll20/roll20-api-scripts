(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Roll20 official Pathfinder sheet.
   */
  class PathfinderRoll20 extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Roll20';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Appraise')
        return CharSheetUtils.getSheetAttr(character, 'appraise');
      if (skillName === 'Heal')
        return CharSheetUtils.getSheetAttr(character, 'heal');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_arcana');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_dungeoneering');
      if (skillName === 'Knowledge(Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_engineering');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_geography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_history');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_local');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_nature');
      if (skillName === 'Knowledge(Nobility)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_nobility');
      if (skillName === 'Knowledge(Planes)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_planes');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'knowledge_religion');
      if (skillName === 'Linguistics')
        return CharSheetUtils.getSheetAttr(character, 'linguistics');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'perception');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'sense_motive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'spellcraft');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
    }
  }

  CheckItOut.themes.register(PathfinderRoll20);
})();
