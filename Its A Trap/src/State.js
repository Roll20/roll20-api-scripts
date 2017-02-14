/**
 * Initialize the state for the It's A Trap script.
 */
(() => {
  'use strict';

  /**
   * The ItsATrap state data.
   * @typedef {object} ItsATrapState
   * @property {object} noticedTraps
   *           The set of IDs for traps that have been noticed by passive perception.
   * @property {string} theme
   *           The name of the TrapTheme currently being used.
   */
  state.ItsATrap = state.ItsATrap || {};
  _.defaults(state.ItsATrap, {
    noticedTraps: {},
    userOptions: {}
  });
  _.defaults(state.ItsATrap.userOptions, {
    revealTrapsToMap: false,
    announcer: 'Admiral Ackbar'
  });

  // Set the theme from the useroptions.
  let useroptions = globalconfig && globalconfig.itsatrap;
  if(useroptions) {
    state.ItsATrap.userOptions = {
      revealTrapsToMap: useroptions.revealTrapsToMap === 'true' || false,
      announcer: useroptions.announcer || 'Admiral Ackbar'
    };
  }
})();
