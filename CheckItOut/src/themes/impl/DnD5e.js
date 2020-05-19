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
    }

    constructor() {
      super();
    }
  };
})();
