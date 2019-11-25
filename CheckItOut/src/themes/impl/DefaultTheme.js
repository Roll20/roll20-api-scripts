(() => {
  'use strict';

  const BASE_THEME = CheckItOut.themes.CheckItOutTheme;

  /**
   * The default theme for the Check It Out script. It has no system-specific
   * behavior.
   */
  CheckItOut.themes.impl.DefaultTheme = class extends BASE_THEME {
    /**
     * @inheritdoc
     */
    get name() {
      return 'default';
    }

    constructor() {
      super();
    }

    /**
     * @inheritdoc
     */
    checkObject(character, checkedObject) {
      _.noop(character, checkedObject);
      return Promise.resolve([]);
    }

    /**
     * @inheritdoc
     */
    getWizardProperties(checkedObj) {
      _.noop(checkedObj);
      return [];
    }

    /**
     * @inheritdoc
     */
    modifyWizardProperty(checkedObj, prop, params) {
      _.noop(checkedObj, prop, params);
    }
  };
})();
