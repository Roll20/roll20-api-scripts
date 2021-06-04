/**
 * This module installs the player and GM macros for using the script.
 */
(() => {
  'use strict';

  /**
   * Installs the Check It Out macro for a player, allowing them to
   * investigate a nearby object.
   * @param {Player} player
   */
  function _installMacroCheckObject(player) {
    let playerID = player.get('_id');
    let macroName = 'CheckItOut';

    let macro = findObjs({
      _type: 'macro',
      _playerid: playerID,
      name: macroName
    })[0];

    // Install the macro if it doesn't already exist.
    if (!macro) {
      createObj('macro', {
        _playerid: playerID,
        name: macroName,
        action: `${CheckItOut.commands.CHECK_OBJECT_CMD} @{selected|token_id} @{target|token_id}`
      });
    }
  }

  /**
   * Installs the Check It Out menu macro for a GM.
   * @private
   * @param {Player} player A player who is a GM.
   */
  function _installMacroGmMenu(player) {
    let playerID = player.get('_id');
    let macroName = 'CheckItOut_GM_Wizard';

    let macro = findObjs({
      _type: 'macro',
      _playerid: playerID,
      name: macroName
    })[0];

    // If this doesn't have the macro, install it for them.
    if (!macro) {
      createObj('macro', {
        _playerid: playerID,
        name: macroName,
        action: CheckItOut.commands.DISPLAY_WIZARD_CMD,
        istokenaction: true
      });
    }
  }

  on('ready', () => {
    try {
      // Get the lists of players and GMs.
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      // Install the Check Object macro for all players.
      _.each(players, player => {
        _installMacroCheckObject(player);
      });

      // Install the GM Wizard macro for all GMs.
      _.each(gms, gm => {
        _installMacroGmMenu(gm);
      });
    }
    catch(err) {
      log('CheckItOutGMWizard - Error while installing macros: ' + err.message);
      log(err.stack);
    }
  });
})();
