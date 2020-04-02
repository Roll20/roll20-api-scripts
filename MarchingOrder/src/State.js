(() => {
  'use strict';

  /**
   * This module provides an interface to the script's state.
   */
  MarchingOrder.State = class {

    /**
     * Clears the script's state and resets it to its factory defaults.
     */
    static clearState() {
      delete state.marchingOrder;
      MarchingOrder.State.getState();
    }

    /**
     * Displays the JSONified state for this script to the chat.
     * @param {Player} player
     * @return {string}
     */
    static exportState(player) {
      let json = MarchingOrder.State.jsonifyState();
      let content = `<div>Below is the JSON for this script's state. Copy-paste it to import it to another campaign.</div>` +
        `<pre>${json}</pre>`;

      let menu = new MarchingOrder.utils.Menu('Export Marching Order', content);
      menu.show(player);
      return json;
    }

    /**
     * Gets the script's configured options.
     * @return {Object}
     */
    static getOptions() {
      let scriptState = MarchingOrder.State.getState();
      if(!scriptState.options)
        scriptState.options = {};
      return scriptState.options;
    }

    /**
     * Returns this module's object for the Roll20 API state.
     * @return {Object}
     */
    static getState() {
      if(!state.marchingOrder)
        state.marchingOrder = {};

      _.defaults(state.marchingOrder, {
        savedFormations: {}
      });

      return state.marchingOrder;
    }

    /**
     * Imports the state for this script from JSON.
     * @param {Player} player
     * @param {string} json
     */
    static importState(player, json) {
      let scriptState = MarchingOrder.State.getState();
      _.extend(scriptState, JSON.parse(json));

      MarchingOrder.Wizard.show(player);
    }

    /**
     * Gets the JSON string for this script's state.
     * @return {string}
     */
    static jsonifyState() {
      let scriptState = MarchingOrder.State.getState();
      return JSON.stringify(scriptState);
    }
  };
})();
