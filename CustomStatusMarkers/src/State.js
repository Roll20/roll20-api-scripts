(() => {
  'use strict';

  /**
   * This module provides an interface to the script's state.
   */
  CustomStatusMarkers.State = class {
    /**
     * Clears the Custom Status Markers state for a particular token.
     * @param  {Graphic} token
     */
    static clearTokenState(token) {
      CustomStatusMarkers.removeStatusMarkers(token);

      let csmState = CustomStatusMarkers.State.getState();
      let tokenId = token.get('_id');
      delete csmState.tokens[tokenId];
    }

    /**
     * Displays the JSONified state for this script to the chat.
     * @param {Player} player
     * @return {string}
     */
    static exportState(player) {
      let json = CustomStatusMarkers.State.jsonifyState();
      let content = `<div>Below is the JSON for this script's state. Copy-paste it to import it to another campaign.</div>` +
        `<pre>${json}</pre>`;

      let menu = new CustomStatusMarkers.utils.Menu('Export Custom Status Markers', content);
      menu.show(player);
      return json;
    }

    /**
     * Gets the script's configured options.
     * @return {Object}
     */
    static getOptions() {
      let scriptState = CustomStatusMarkers.State.getState();
      if(!scriptState.options)
        scriptState.options = {};
      return scriptState.options;
    }

    /**
     * Returns this module's object for the Roll20 API state.
     * @return {Object}
     */
    static getState() {
      if(!state.CustomStatusMarkers)
        state.CustomStatusMarkers = {
          tokens: {},
          templates: {},
          options: {}
        };

      return state.CustomStatusMarkers;
    }

    /**
     * Returns the Custom Status Markers state for a token.
     * @param  {Graphic} token
     * @param {boolean} [createBlank: true] If the token state doesn't exist, create it.
     * @return {Object}
     */
    static getTokenState(token, createBlank) {
      if(createBlank === undefined)
        createBlank = true;

      let csmState = CustomStatusMarkers.State.getState();
      let tokenId = token.get('_id');
      let tokenState = csmState.tokens[tokenId];

      if(!tokenState && createBlank) {
        tokenState = csmState.tokens[tokenId] = {
          customStatuses: {}
        };
      }
      return tokenState;
    }

    /**
     * Imports the state for this script from JSON.
     * @param {Player} player
     * @param {string} json
     */
    static importState(player, json) {
      let scriptState = CustomStatusMarkers.State.getState();
      _.extend(scriptState, JSON.parse(json));

      CustomStatusMarkers.Wizard.show(player);
    }

    /**
     * Gets the JSON string for this script's state.
     * @return {string}
     */
    static jsonifyState() {
      let scriptState = CustomStatusMarkers.State.getState();
      return JSON.stringify(scriptState);
    }
  };
})();
