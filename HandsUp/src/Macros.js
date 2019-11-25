(() => {
  'use strict';

  /**
   * Installs a macro for a player.
   * @param {Player} player
   * @param {string} macroName
   * @param {string} action
   */
  function _installMacro(player, macroName, action) {
    let playerId = player.get('_id');

    // Check for an existing macro.
    let macro = findObjs({
      _type: 'macro',
      name: macroName,
      _playerid: playerId
    })[0];

    // Update if it exists.
    if (macro)
      macro.set('action', action);

    // Otherwise, install it.
    else {
      createObj('macro', {
        _playerid: playerId,
        name: macroName,
        action: action
      });
    }
  }

  /**
   * Module for installing this script's macros.
   */
  HandsUp.Macros = class {
    /**
     * Installs or updates the 'RaiseHand' macro for all players.
     */
    static _installMacroRaiseHand() {
      let players = findObjs({
        _type: 'player'
      });

      // Install the macro for each player.
      _.each(players, player => {
        _installMacro(player, 'RaiseHand', HandsUp.Commands.RAISE_HAND_CMD);
      });
    }

    static installMacros() {
      HandsUp.Macros._installMacroRaiseHand();
    }
  };
})();
