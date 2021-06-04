(() => {
  'use strict';

  /**
   * An in-chat menu.
   */
  CustomStatusMarkers.utils.Menu = class {
    /**
     * The HTML for this menu.
     */
    get html() {
      let html = '<div style="background: #fff; border: solid 1px #000; border-radius: 5px; font-weight: bold; margin-bottom: 1em; overflow: hidden;">';
      html += '<div style="background: #000; color: #fff; text-align: center;">' + this._header + '</div>';
      html += '<div style="padding: 5px;">' + this._content + '</div>';
      html += '</div>';
      return html;
    }

    constructor(header, content) {
      this._header = header;
      this._content = content;
    }

    /**
     * Show the menu to a player.
     */
    show(player) {
      CustomStatusMarkers.utils.Chat.whisper(player, this.html);
    }
  };
})();
