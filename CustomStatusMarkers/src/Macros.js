(() => {
  'use strict';

  /**
   * Gets a macro prompt for the user to choose from the list of saved
   * custom status markers.
   * @return {string}
   */
  function _getEffectNamePrompt() {
    let csmState = CustomStatusMarkers.State.getState();
    let names = _.keys(csmState.templates);
    names.sort();
    return `?{Which custom status marker?|${names.join('|')}}`;
  }

  /**
   * Installs/updates a macro for the script.
   * @param {string} name
   * @param {string} action
   */
  function _installMacro(player, name, action) {
    let macro = findObjs({
      _type: 'macro',
      _playerid: player.get('_id'),
      name
    })[0];

    if(macro)
      macro.set('action', action);
    else {
      createObj('macro', {
        _playerid: player.get('_id'),
        name,
        action
      });
    }
  }

  /**
   * This module is responsible for installing and updating the macros
   * used by this script.
   */
  CustomStatusMarkers.Macros = class {


    /**
     * Installs/updates the macros for this script.
     */
    static installMacros() {
      let players = findObjs({
        _type: 'player'
      });

      const Commands = CustomStatusMarkers.Commands;

      // Create the macro, or update the players' old macro if they already have it.
      _.each(players, player => {
        _installMacro(player, 'CustomStatusMarkersMenu', Commands.MENU_CMD);
        _installMacro(player, 'CustomStatusMarkersToggle', Commands.SET_MARKER_CMD + ' ' + _getEffectNamePrompt());
        _installMacro(player, 'CustomStatusMarkersToggleCount', Commands.SET_MARKER_COUNT_CMD + ' ' + _getEffectNamePrompt() + ' ?{count}');
        _installMacro(player, 'CustomStatusMarkersToggleTint', Commands.SET_MARKER_TINT_CMD + ' ' + _getEffectNamePrompt() + ' ?{color}');
      });
    }
  };
})();
