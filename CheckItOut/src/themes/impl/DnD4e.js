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
    }

    constructor() {
      super();
    }
  };
})();
