(() => {
  'use strict';

  CheckItOut.themes.impl = {};

  /**
   * The base class for system-specific themes used by the Check It Out script.
   * @abstract
   */
  CheckItOut.themes.CheckItOutTheme = class {

    /**
     * The name of the theme.
     * @type {string}
     */
    get name() {
      throw new Error('Not implemented.');
    }

    constructor() {}

    /**
     * Have a character check out some object, using any applicable system-
     * specific rules.
     * @param {Character} character The character who is checking the object.
     * @param {Graphic} checkedObj The graphic for the object being checked.
     * @return {Promise<string[]>}
     */
    checkObject(character, checkedObj) {
      _.noop(character, checkedObj);
      throw new Error('Not implemented');
    }

    /**
     * Get a list of the system-specific properties of an object to display
     * in the GM wizard.
     * @abstract
     * @param {Graphic} checkedObj
     * @return {WizardProperty[]}
     */
    getWizardProperties(checkedObj) {
      _.noop(checkedObj);
      throw new Error('Not implemented');
    }

    /**
     * Modifies a theme-specific property for an object.
     * @abstract
     * @param {Graphic} checkedObj
     * @param {string} prop The ID of the property being modified.
     * @param {string[]} params The parameters given for the new property value.
     */
    modifyWizardProperty(checkedObj, prop, params) {
      _.noop(checkedObj, prop, params);
      throw new Error('Not implemented.');
    }
  };
})();
