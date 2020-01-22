(() => {
  'use strict';

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
  MarchingOrder.Macros = class {

    /**
     * Installs/updates the macros for this script.
     */
    static installMacros() {
      let players = findObjs({
        _type: 'player'
      });

      const Commands = MarchingOrder.Commands;

      // Create the macro, or update the players' old macro if they already have it.
      _.each(players, player => {
        _installMacro(player, 'MarchingOrderMenu', Commands.MENU_CMD);
      });
    }
  };
})();
