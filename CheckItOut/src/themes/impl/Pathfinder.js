(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for Pathfinder themes.
   * @abstract
   */
  CheckItOut.themes.impl.Pathfinder = class extends D20System {
    /**
     * @inheritdoc
     */
<<<<<<< HEAD
    get skillNames() {
      return [
        'Perception',
        'Appraise',
        'Heal',
        'Knowledge(Arcana)',
        'Knowledge(Dungeoneering)',
        'Knowledge(Engineering)',
        'Knowledge(Geography)',
        'Knowledge(History)',
        'Knowledge(Local)',
        'Knowledge(Nature)',
        'Knowledge(Nobility)',
        'Knowledge(Planes)',
        'Knowledge(Religion)',
        'Linguistics',
        'Sense Motive',
        'Spellcraft',
        'Survival'
      ];
=======
    get skillName() {
      return 'Perception';
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }

    constructor() {
      super();
    }
  };
})();
