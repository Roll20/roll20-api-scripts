(() => {
  'use strict';

  /**
   * functions dealing with the chat menu interface.
   */
  CustomStatusMarkers.Wizard = class {
    /**
     * Produces a menu panel for GM-only actions.
     */
    static getGMActionsMenu() {
      const Commands = CustomStatusMarkers.Commands;
      const Menu = CustomStatusMarkers.utils.Menu;

      var actionsHtml = '<div style="text-align: center;">[New status marker](' + Commands.SAVE_MARKER_CMD + ' ?{Save marker: Name})</div>';
      actionsHtml += '<div style="text-align: center;">[Remove token markers](' + Commands.CLEAR_TOKEN_CMD + ')</div>';
      actionsHtml += '<div style="text-align: center;">[⏏ Export State](' + Commands.EXPORT_STATE_CMD + ')</div>';
      actionsHtml += '<div style="text-align: center;">[⚠ Import State](' + Commands.IMPORT_STATE_CMD + ' ?{Paste exported state JSON here:})</div>';
      actionsHtml += '<div style="text-align: center;">[Clear State](' + Commands.CLEAR_STATE_CMD + ' ?{Are you sure? This will erase all your custom status markers.|yes|no})</div>';
      return new Menu('Menu Actions', actionsHtml);
    }

    /**
     * Produces a menu panel for GM-only script configurations.
     */
    static getGMOptionsMenu() {
      const Commands = CustomStatusMarkers.Commands;
      const Config = CustomStatusMarkers.Config;
      const Menu = CustomStatusMarkers.utils.Menu;

      var optionsHtml = '<table style="width: 100%;">' +
          '<tr style="vertical-align: middle;">' +
            '<td>[Icon Size](' + Commands.CHANGE_SIZE_CMD + ' ?{Size in pixels})</td>' +
            '<td>' + Config.getIconSize() + '</td>' +
          '</tr>' +
          '<tr>' +
            '<td>[Icon Alignment](' + Commands.CHANGE_ALIGNMENT_CMD + ' ?{Icon Alignment:|above|inline})</td>' +
            '<td>' + Config.getAlignment() + '</td>' +
          '</tr>' +
        '</table>';
      return new Menu('Options', optionsHtml);
    }

    /**
     * Produces a menu panel showing a list of the available custom status markers
     * and their action buttons.
     */
    static getListingMenu(player) {
      let playerId = player.get('_id');
      let csmState = CustomStatusMarkers.State.getState();
      const Commands = CustomStatusMarkers.Commands;
      const Menu = CustomStatusMarkers.utils.Menu;

      let markerNames = _.keys(csmState.templates);
      markerNames.sort();

      // List of saved markers
      let listHtml = '';
      if(markerNames.length > 0) {
        listHtml = '<table style="width: 100%;">';
        _.each(markerNames, name => {
          listHtml += '<tr style="vertical-align: middle;">';

          listHtml += '<td>';
          let tpl = csmState.templates[name];
          let src = CustomStatusMarkers.utils.getCleanImgsrc(tpl.src);

          listHtml += '<img src="' + src + '" style="height: 3em;"> ';
          listHtml += '<small style="display: block; max-width: 70px;">' + name + '</small>';
          listHtml += '</td>';
          listHtml += '<td title="Toggle marker on selected tokens">[Toggle](' + Commands.SET_MARKER_CMD + ' ' + name + ')</td>';
          listHtml += '<td title="Set count on selected tokens">[#](' + Commands.SET_MARKER_COUNT_CMD + ' ' + name + ' ?{Count})</td>';
          listHtml += '<td title="Set marker tint">[🌈](' + Commands.SET_MARKER_TINT_CMD + ' ' + name + ' ?{Color})</td>';

          // Only GMs get a Delete button.
          if(playerIsGM(playerId))
            listHtml += '<td style="text-align: right;" title="Delete marker">[❌](' + Commands.DEL_MARKER_CMD + ' ' + name + ' ?{Delete marker: Are you sure?|yes|no})</td>';
          listHtml += '</tr>';
        });
        listHtml += '</table>';
      }
      else
        listHtml = 'No custom status markers have been created yet.';
      return new Menu('Custom Status Markers', listHtml);
    }

    /**
     * Shows the menu for Custom Status Markers in the chat. This includes
     * a listing of the saved status markers
     */
    static show(player) {
      let playerId = player.get('_id');

      // Status markers listing (for everyone)
      let listingMenu = CustomStatusMarkers.Wizard.getListingMenu(player);
      let html = listingMenu.html;

      // Script settings menu (GMs only!)
      if(playerIsGM(playerId)) {
        let optionsMenu = CustomStatusMarkers.Wizard.getGMOptionsMenu();
        let actionsMenu = CustomStatusMarkers.Wizard.getGMActionsMenu();
        html += optionsMenu.html + actionsMenu.html;
      }

      // Render the wizard in the chat.
      CustomStatusMarkers.utils.Chat.whisper(player, html);
    }
  };
})();
