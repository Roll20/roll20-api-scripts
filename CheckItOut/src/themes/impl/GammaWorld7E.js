(() => {
  'use strict';

  const DnD4e = CheckItOut.themes.impl.DnD4e;

  /**
   * Base class for themes for the Gamma World 7th edition system (the one
   * based on D&D 4E).
   * @abstract
   */
  CheckItOut.themes.impl.GammaWorld7E = class extends DnD4e {
    /**
     * @inheritdoc
     */
    get skillNames() {
      return [
        'Perception',
        'Conspiracy',
        'Insight',
        'Mechanics',
        'Nature',
        'Science'
      ];
    }

    constructor() {
      super();
    }
  };
})();
