(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Theme for the Pathfinder "Community" sheet.
   */
  class PathfinderCommunity extends Pathfinder {
    /**
     * @inheritdoc
     */
    get name() {
      return 'Pathfinder Community';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    getSkillMod(character, skillName) {
      if (skillName === 'Appraise')
        return CharSheetUtils.getSheetAttr(character, 'Appraise');
      if (skillName === 'Heal')
        return CharSheetUtils.getSheetAttr(character, 'Heal');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Arcana');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Dungeoneering');
      if (skillName === 'Knowledge(Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Engineering');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Geography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-History');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Local');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Nature');
      if (skillName === 'Knowledge(Nobility)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Nobility');
      if (skillName === 'Knowledge(Planes)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Planes');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'Knowledge-Religion');
      if (skillName === 'Linguistics')
        return CharSheetUtils.getSheetAttr(character, 'Linguistics');
      if (skillName === 'Perception')
        return CharSheetUtils.getSheetAttr(character, 'Perception');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'Sense-Motive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'Spellcraft');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'Survival');
    }
  }

  CheckItOut.themes.register(PathfinderCommunity);
})();
