(() => {
  'use strict';

  /**
   * The ItsATrap state data.
   * @typedef {object} CheckItOutState
   * @property {map<string, CheckedInfo>} graphics
   *           A mapping of Graphic object IDs to information about the object's
   *           persisted properties.
   */

  const DEFAULT_DESCRIPTION = 'No problem here.';

  /**
   * An interface for initializing and accessing the script's persisted
   * state data.
   */
  CheckItOut.State = class {
    /**
     * Get the script's persisted state.
     * @return {CheckItOutState}
     */
    static getState() {
      return state.CheckItOut;
    }

    /**
     * Get the script's user options.
     * @return {object}
     */
    static getUserOpts() {
      return CheckItOut.State.getState().userOptions;
    }

    /**
     * Initializes the script's state.
     */
    static initializeState() {
      // Set the default values for the script's state.
      _.defaults(state, {
        CheckItOut: {}
      });
      _.defaults(state.CheckItOut, {
        graphics: {},
        themeName: 'default',
        userOptions: {}
      });

      // Add useroptions to the state.
      let userOptions = globalconfig && globalconfig.checkitout;
      if (userOptions)
        _.extend(state.CheckItOut.userOptions, userOptions);

      // Set default values for the unspecificed useroptions.
      _.defaults(state.CheckItOut.userOptions, {
        defaultDescription: DEFAULT_DESCRIPTION
      });
    }
  };
})();
