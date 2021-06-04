/**
 * Initialize the CheckItOut.themes package.
 */
(() => {
  'use strict';

  /**
   * Gets the class for a registered concrete theme implementation.
   * @param {string} name The name of the theme.
   */
  function getRegisteredTheme(name) {
    return CheckItOut.themes.registeredImplementations[name];
  }

  /**
   * Gets the names of the registered concrete theme implementations.
   */
  function getRegisteredThemeNames() {
    let names = _.keys(CheckItOut.themes.registeredImplementations);
    names.sort();
    return names;
  }

  /**
   * Registers a concrete theme implementation with the script's
   * runtime environement.
   * @param {class} clz The class for the theme implementation.
   */
  function register(clz) {
    let instance = new clz();
    let name = instance.name;

    CheckItOut.themes.registeredImplementations[name] = clz;
    log('Registered CheckItOut theme: ' + name);
  }

  CheckItOut.themes = {
    getRegisteredTheme,
    getRegisteredThemeNames,
    register,
    registeredImplementations: {}
  };
})();
