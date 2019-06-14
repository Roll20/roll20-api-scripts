(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for D&D 4E themes.
   * @abstract
   */
  CheckItOut.themes.impl.DnD4e = class extends D20System {
    /**
     * @inheritdoc
     */
<<<<<<< HEAD
    get skillNames() {
      return [
        'Perception',
        'Arcana',
        'Dungeoneering',
        'History',
        'Insight',
        'Nature',
        'Religion',
        'Streetwise'
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
