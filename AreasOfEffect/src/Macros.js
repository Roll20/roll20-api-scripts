(() => {
  'use strict';

  const cmds = AreasOfEffect.Commands;

  const MACRO_SHORTCUTS = {
    'AoeShortcut_Path': `${cmds.APPLY_EFFECT_AT_PATH_CMD} EFFECT_NAME`,
    'AoeShortcut_Tokens': `${cmds.APPLY_EFFECT_BETWEEN_TOKENS_CMD} @{selected|token_id} @{target|token_id} EFFECT_NAME`,
    'AoeShortcut_Burst': `${cmds.APPLY_EFFECT_AT_TOKEN_CMD} @{target|token_id} ?{Specify radius:} EFFECT_NAME`,
    'AoeShortcut_Cone': `${cmds.APPLY_EFFECT_AT_CONE_CMD} @{selected|token_id} ?{Specify radius:} EFFECT_NAME`,
    'AoeShortcut_Blast': `${cmds.APPLY_EFFECT_AT_BLAST_CMD} @{selected|token_id} ?{Specify radius:} EFFECT_NAME`
  };

  /**
   * Module for installing/updating the script's macros.
   */
  AreasOfEffect.Macros = class {
    /**
     * Gets a macro prompt for the user to choose from the list of saved effect
     * names.
     * @return {string}
     */
    static getEffectNamePrompt() {
      let myState = AreasOfEffect.State.getState();
      let names = _.keys(myState.saved);
      names.sort();
      return `?{Which effect?|${names.join('|')}}`;
    }

    /**
     * Check that the menu macros for this script are installed, and install
     * them if necessary.
     */
    static installMacros() {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      // Create the menu macro.
      let menuMacro = findObjs({
        _type: 'macro',
        name: 'AreasOfEffectMenu'
      })[0];
      if(!menuMacro) {
        _.each(gms, gm => {
          createObj('macro', {
            _playerid: gm.get('_id'),
            name: 'AreasOfEffectMenu',
            action: cmds.MENU_CMD,
            visibleto: 'all'
          });
        });
      }

      // Create/update the shortcut macros.
      AreasOfEffect.Macros.updateShortcutMacros();
    }

    /**
     * Updates the shortcut macros, creating them if they don't already exist.
     * @private
     */
    static updateShortcutMacros() {
      let players = findObjs({
        _type: 'player'
      });
      let gms = _.filter(players, player => {
        return playerIsGM(player.get('_id'));
      });

      let macrosNames = _.keys(MACRO_SHORTCUTS);
      _.each(macrosNames, name => {
        let macro = findObjs({
          _type: 'macro',
          name
        })[0];

        let action = MACRO_SHORTCUTS[name].replace('EFFECT_NAME',
          AreasOfEffect.Macros.getEffectNamePrompt());

        if(macro)
          macro.set('action', action);
        else {
          createObj('macro', {
            _playerid: gms[0].get('_id'),
            name,
            action,
            visibleto: 'all'
          });
        }
      });
    }
  };
})();
