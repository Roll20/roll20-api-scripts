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
     * Updates the state when migrating from one version of this script to a
     * newer one.
     */
    static _doUpdates() {
      let curVersion = state.CheckItOut.version;

      if (curVersion === '1.0') {
        CheckItOut.State._updateTo_1_1();
        curVersion = '1.1';
      }

      // Set the state's version to the latest.
      state.CheckItOut.version = 'SCRIPT_VERSION';
    }

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
        userOptions: {},
        version: '1.0'
      });

      // Do any work necessary to migrate the state's data to the
      // latest version.
      CheckItOut.State._doUpdates();

      // Add useroptions to the state.
      let userOptions = globalconfig && globalconfig.checkitout;
      if (userOptions)
        _.extend(state.CheckItOut.userOptions, userOptions);

      // Set default values for the unspecificed useroptions.
      _.defaults(state.CheckItOut.userOptions, {
        defaultDescription: DEFAULT_DESCRIPTION
      });
    }

    /**
     * Update from version 1.0 to 1.1.
     */
    static _updateTo_1_1() {
      let theme = CheckItOut.getTheme();

      if (theme instanceof CheckItOut.themes.impl.D20System) {
        let defaultSkill= theme.skillNames[0];

        // Migrate "investigation" theme properties to their appropriate
        // default skill property.
        _.each(state.CheckItOut.graphics, objProps => {
          let themeProps = objProps.theme;
          themeProps['skillCheck_' + defaultSkill] = themeProps.investigation;
          delete themeProps.investigation;
        });
      }
    }
  };
})();
