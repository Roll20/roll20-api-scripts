(() => {
  'use strict';

  MarchingOrder.Wizard = class {

    /**
     * Create an instance of the main menu.
     * @param {Player} player
     * @return {MarchingOrder.utils.Menu}
     */
    static getMainMenu(player) {
      let playerId = player.get('_id');
      let moState = MarchingOrder.State.getState();
      const Commands = MarchingOrder.Commands;
      const Menu = MarchingOrder.utils.Menu;

      // Menu options
      let actionsHtml = '<div style="text-align: center;">[Follow](' + Commands.FOLLOW_CMD + ' &#64;{selected|token_id} &#64;{target|token_id})</div>';

      if(playerIsGM(playerId)) {
        // Cardinal directions (GM only)
        actionsHtml += '<div style="text-align: center;">March in order:</div>';
        actionsHtml += '<div><table style="width: 100%;">';
        actionsHtml += '<tr><td></td><td>[North](' + Commands.FOLLOW_CMD + ' north)</td><td></td></tr>';
        actionsHtml += '<tr><td>[West](' + Commands.FOLLOW_CMD + ' west)</td><td></td><td>[East](' + Commands.FOLLOW_CMD + ' east)</td></tr>';
        actionsHtml += '<tr><td></td><td>[South](' + Commands.FOLLOW_CMD + ' south)</td><td></td></tr>';
        actionsHtml += '</table></div>';

        // Stop all following
        actionsHtml += '<div style="padding-top: 1em; text-align: center;">[Stop All Following](' + Commands.STOP_ALL_CMD + ')</div>';

        // Default marching order
        actionsHtml += '<div style="padding-top: 1em; text-align: center;">Default Marching Order:</div>';
        if(moState.defaultOrder.length > 0) {
          actionsHtml += '<div style="text-align: center; vertical-allign: middle;">';
          _.each(moState.defaultOrder, (item, index) => {
            actionsHtml += '<span style="display: inline-block;">';
            if(index !== 0)
              actionsHtml += ' ◀ ';
            actionsHtml += `<img src="${item.imgsrc}" title="${item.name}" style="height: 35px; vertical-align: middle; width: 35px;"></span>`;
          });
          actionsHtml += '</div>';
          actionsHtml += '<div style="text-align: center;">[Use Default](' + Commands.DEFAULT_USE_CMD + ') [Set Default](' + Commands.DEFAULT_SET_CMD + ' &#64;{selected|token_id})</div>';
        }
        else {
          actionsHtml += '<div style="font-size: 0.8em; text-align: center;">No default order has been set.</div>';
          actionsHtml += '<div style="text-align: center;">[Set Default](' + Commands.DEFAULT_SET_CMD + ' &#64;{selected|token_id})';
        }
      }

      return new Menu('Marching Order', actionsHtml);
    }

    static show(player) {
      let menu = MarchingOrder.Wizard.getMainMenu(player);
      menu.show(player);
    }
  };
})();
