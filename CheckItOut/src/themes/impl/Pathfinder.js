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
    get skillName() {
      return 'Perception';
    }

    constructor() {
      super();
    }
  };
})();
