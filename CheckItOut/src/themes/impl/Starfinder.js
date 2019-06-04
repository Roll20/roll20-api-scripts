(() => {
  'use strict';

  const Pathfinder = CheckItOut.themes.impl.Pathfinder;

  /**
   * Base class for Starfinder themes.
   * @abstract
   */
  CheckItOut.themes.impl.Starfinder = class extends Pathfinder {
    constructor() {
      super();
    }
  };
})();
