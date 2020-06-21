(() => {
  'use strict';

  const D20System = CheckItOut.themes.impl.D20System;

  /**
   * Base class for Starfinder themes.
   * @abstract
   */
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

    constructor() {
      super();
    }
  };
})();
