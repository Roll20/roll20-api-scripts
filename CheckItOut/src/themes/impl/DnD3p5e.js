(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;
  if (!D20System)
    throw new Error('Base class D20System is not defined.');

  /**
   * Base class for D&D 3.5 themes.
   * @abstract
   */
  CheckItOut.themes.impl.DnD3p5e = class extends D20System {
    /**
     * @inheritdoc
     */
<<<<<<< HEAD
    get skillNames() {
      return [
        'Search',
        'Appraise',
        'Decipher Script',
        'Knowledge(Arcana)',
        'Knowledge(Architecture & Engineering)',
        'Knowledge(Dungeoneering)',
        'Knowledge(Geography)',
        'Knowledge(History)',
        'Knowledge(Local)',
        'Knowledge(Nature)',
        'Knowledge(Nobility & Royalty)',
        'Knowledge(Religion)',
        'Knowledge(The Planes)',
        'Listen',
        'Sense Motive',
        'Spellcraft',
        'Spot',
        'Survival'
      ];
=======
    get skillName() {
      return 'Search';
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }

    constructor() {
      super();
    }
  };
})();
