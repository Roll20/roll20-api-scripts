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
    get skillName() {
      return 'Search';
    }

    constructor() {
      super();
    }
  };
})();
