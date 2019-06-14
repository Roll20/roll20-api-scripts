(() => {
  'use strict';

<<<<<<< HEAD
  const D20System = CheckItOut.themes.impl.D20System;
=======
  const Pathfinder = CheckItOut.themes.impl.Pathfinder;
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3

  /**
   * Base class for Starfinder themes.
   * @abstract
   */
<<<<<<< HEAD
  CheckItOut.themes.impl.Starfinder = class extends D20System {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Perception',
        'Computers',
        'Culture',
        'Engineering',
        'Life Science',
        'Medicine',
        'Mysticism',
        'Physical Science',
        'Survival'
      ];
    }

=======
  CheckItOut.themes.impl.Starfinder = class extends Pathfinder {
>>>>>>> 74cc68c309981ff00eaf89ddaf560008889649f3
    constructor() {
      super();
    }
  };
})();
