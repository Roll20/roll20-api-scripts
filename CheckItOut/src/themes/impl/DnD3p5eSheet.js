(() => {
  'use strict';

  const DnD3p5e = CheckItOut.themes.impl.DnD3p5e;
  if (!DnD3p5e)
    throw new Error('Base class DnD3p5e is not defined.');

  /**
   * Theme for the D&D 3.5E sheet by Diana P.
   */
  class DnD3p5eSheet extends DnD3p5e {
    /**
     * @inheritdoc
     */
    get name() {
      return 'D&D 3.5E';
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
      if (skillName === 'Decipher Script')
        return CharSheetUtils.getSheetAttr(character, 'decipherscript');
      if (skillName === 'Knowledge(Arcana)')
        return CharSheetUtils.getSheetAttr(character, 'knowarcana');
      if (skillName === 'Knowledge(Architecture & Engineering)')
        return CharSheetUtils.getSheetAttr(character, 'knowengineer');
      if (skillName === 'Knowledge(Dungeoneering)')
        return CharSheetUtils.getSheetAttr(character, 'knowdungeon');
      if (skillName === 'Knowledge(Geography)')
        return CharSheetUtils.getSheetAttr(character, 'knowgeography');
      if (skillName === 'Knowledge(History)')
        return CharSheetUtils.getSheetAttr(character, 'knowhistory');
      if (skillName === 'Knowledge(Local)')
        return CharSheetUtils.getSheetAttr(character, 'knowlocal');
      if (skillName === 'Knowledge(Nature)')
        return CharSheetUtils.getSheetAttr(character, 'knownature');
      if (skillName === 'Knowledge(Nobility & Royalty)')
        return CharSheetUtils.getSheetAttr(character, 'knownobility');
      if (skillName === 'Knowledge(Religion)')
        return CharSheetUtils.getSheetAttr(character, 'knowreligion');
      if (skillName === 'Knowledge(The Planes)')
        return CharSheetUtils.getSheetAttr(character, 'knowplanes');
      if (skillName === 'Listen')
        return CharSheetUtils.getSheetAttr(character, 'listen');
      if (skillName === 'Sense Motive')
        return CharSheetUtils.getSheetAttr(character, 'sensemotive');
      if (skillName === 'Spellcraft')
        return CharSheetUtils.getSheetAttr(character, 'spellcraft');
      if (skillName === 'Spot')
        return CharSheetUtils.getSheetAttr(character, 'spot');
      if (skillName === 'Survival')
        return CharSheetUtils.getSheetAttr(character, 'survival');
      if (skillName === 'Search')
        return CharSheetUtils.getSheetAttr(character, 'search');
    }
  }

  CheckItOut.themes.register(DnD3p5eSheet);
})();
