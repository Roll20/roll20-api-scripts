(() => {
  'use strict';

  /**
   * Module for accessing the script's state.
   */
  AreasOfEffect.State = class {
    /**
     * Displays the JSONified state for this script to the chat (and returns it).
     * @param {Player} player
     * @return {string}
     */
    static exportState(player) {
      let content = new HtmlBuilder('div');
      content.append('div', 'Below is the JSON for this script\'s state. ' +
        'Copy-paste it to import it to another campaign.');

      let json = AreasOfEffect.State._jsonifyState();
      content.append('pre', json);

      let menu = new AreasOfEffect.utils.Menu('Export Areas of Effect', content);
      menu.show(player);

      return json;
    }

    /**
     * Gets this script's state.
     * @return {AoEState}
     */
    static getState() {
      return state.AreasOfEffect;
    }

    /**
     * Imports the state for this script from JSON.
     * @param {Player} player
     * @param {string} json
     */
    static importState(player, json) {
      AreasOfEffect.State.initState();
      let myState = AreasOfEffect.State.getState();
      _.extend(myState, JSON.parse(json));

      AreasOfEffect.Wizard.show(player);
    }

    /**
     * Initializes the state of this script.
     */
    static initState() {
      _.defaults(state, {
        AreasOfEffect: {}
      });
      _.defaults(state.AreasOfEffect, {
        saved: {}
      });
    }

    /**
     * Converts the script's state to JSON.
     * @return {string}
     */
    static _jsonifyState() {
      let myState = state.AreasOfEffect;
      return JSON.stringify(myState);
    }
  };
})();
