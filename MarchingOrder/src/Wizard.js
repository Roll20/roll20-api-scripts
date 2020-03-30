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
      const Commands = MarchingOrder.Commands;
      const Menu = MarchingOrder.utils.Menu;

      // Menu options
      // Follow (define a new marching formation)
      let actionsHtml = '<div style="text-align: center;">[New Formation](' +
        Commands.NEW_FORMATION_CMD + ' ' +
        '?{Initial Marching Direction|north|south|east|west} ' +
        '?{Give the formation a name.})' +
        '</div>';

      if(playerIsGM(playerId)) {
        // Stop all following
        actionsHtml += '<div style="padding-top: 1em; text-align: center;">' +
          '[Stop All Following](' + Commands.STOP_ALL_CMD + ')</div>';

        actionsHtml += '<hr/>';

        // Show saved formations
        actionsHtml += MarchingOrder.Wizard._getFormationsHtml();

        actionsHtml += '<hr/>';

        // Clear state
        actionsHtml += '<div style="padding-top: 1em; text-align: center;">' +
          '[Clear Script State](' + Commands.CLEAR_STATE_CMD +
          ' ?{Are you sure?|yes|no})</div>';
      }

      return new Menu('Marching Order', actionsHtml);
    }

    /**
     * Show the main chat menu for the script to the given player.
     * @param {Player} player
     */
    static showMainMenu(player) {
      let menu = MarchingOrder.Wizard.getMainMenu(player);
      menu.show(player);
    }

    /**
     * Show the formations menu to the given player.
     */
    static _getFormationsHtml() {
      let moState = MarchingOrder.State.getState();
      const Commands = MarchingOrder.Commands;

      if (_.size(moState.savedFormations) === 0) {
        return '<div style="font-size: 0.8em; text-align: center;">' +
          'No marching formations have been saved yet.</div>';
      }

      let actionsHtml = '<h2>Saved Formations:</h2>';
      actionsHtml += '<div style="font-style: italic; font-size: small; ' +
        'color: #aaa;">Previews of formations are shown marching westward.' +
        '</div>';

      // Get the sorted list of formation names.
      let formationNames = _.map(moState.savedFormations, formation => {
        return formation.name;
      });
      formationNames.sort();

      let borderColor = '#c4a';

      // Render each formation and its menu controls.
      _.each(formationNames, name => {
        let formation = moState.savedFormations[name];
        actionsHtml += `<div style="border: solid 1px ${borderColor}; margin-bottom: 0.5em; border-radius: 10px; overflow: hidden;">`;
        actionsHtml += `<h3 style="background: ${borderColor}; color: white; padding-left: 0.5em;">${formation.name}</h3>`;
        actionsHtml += MarchingOrder.Wizard._renderFormationPreview(formation);


        // Render controls for the formation.
        actionsHtml += '<div style="text-align: center;">';
        actionsHtml += '<div style="display: inline-block; padding-top: 1em; text-align: center;">' +
          '[Use](' + Commands.USE_FORMATION_CMD + ' ' + name + ')</div>';
        actionsHtml += '<div style="display: inline-block; padding-top: 1em; text-align: center;">' +
          '[Delete](' + Commands.DELETE_FORMATION_CMD + ' ' + name +
          ' ?{Are you sure you want to delete formation ' + name +
          '?|yes|no})</div>';
        actionsHtml += "</div>";

        actionsHtml += '</div>';
      });

      return actionsHtml;
    }

    /**
     * Renders a preview of a formation to be displayed in the chat menu.
     * @param {Formation} formation
     */
    static _renderFormationPreview(formation) {
      let tokens = [{
        imgsrc: formation.leaderImgSrc,
        data: {
          du: 0,
          dv: 0
        }
      }];
      _.each(formation.followers, follower => {
        tokens.push(follower);
      });

      // Get the bounds of the formation.
      let left = _.min(tokens, token => {
        return token.data.du;
      }).data.du;
      let right = _.max(tokens, token => {
        return token.data.du;
      }).data.du;
      let top = _.min(tokens, token => {
        return token.data.dv;
      }).data.dv;
      let bottom = _.max(tokens, token => {
        return token.data.dv;
      }).data.dv;
      let width = right - left + 70;
      let height = bottom - top + 70;

      // Determine the correct scale for the preview container.
      let scale, previewWidth, previewHeight;
      if (width > height) {
        scale = 200/width || 1;
        previewWidth = 200;
        previewHeight = height*scale;
      }
      else {
        scale = 200/height || 1;
        previewWidth = width*scale;
        previewHeight = 200;
      }
      let dia = 70*scale;

      // Render the formation preview.
      let previewHTML = `<div style="text-align: center;"><div style="display: inline-block; position: relative; width: ${previewWidth}px; height: ${previewHeight}px;">`;

      // Render the tokens.
      _.each(tokens, follower => {
        let unitSegment = [[0, 0, 1], [1, 0, 1]];
        let xy = MarchingOrder.getFollowerOffset(unitSegment, follower.data.du, follower.data.dv);
        xy = VecMath.add(xy, [-left, -top, 0]);
        xy = VecMath.scale(xy, scale);

        previewHTML += `<img src="${follower.imgsrc}" title="${follower.id}" style="position: absolute; width: ${dia}px; height: ${dia}px; left: ${xy[0]}px; top: ${xy[1]}px"/>`;
      });
      previewHTML += '</div></div>';

      return previewHTML;
    }
  };
})();
