(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for D&D 5E themes.
   * @abstract
   */
  CheckItOut.themes.impl.Dnd5e = class extends D20System {
    /**
     * @inheritdoc
     */
<<<<<<< HEAD
    get skillNames() {
      return [
        'Investigation',
        'Arcana',
        'History',
        'Insight',
        'Medicine',
        'Nature',
        'Perception',
        'Religion',
        'Survival'
      ];
=======
    get skillName() {
      return 'Investigation';
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    }

    constructor() {
      super();
    }
  };
})();
