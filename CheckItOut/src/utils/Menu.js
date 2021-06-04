(() => {
  'use strict';

  const MENU_CSS = {
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #000',
      'border-radius': '5px',
      'font-weight': 'bold',
      'margin-bottom': '1em',
      'overflow': 'hidden'
    },
    'menuBody': {
      'padding': '5px',
      'text-align': 'center'
    },
    'menuHeader': {
      'background': '#000',
      'color': '#fff',
      'text-align': 'center'
    },
    'optionsTable': {
      'width': '100%'
    },
    'propsTable': {
      'margin-bottom': '1em'
    }
  };

  /**
   * A stylized menu that can be whispered in the chat to a player.
   */
  CheckItOut.utils.Menu = class {
    /**
     * @param {string} header The header text for the menu.
     * @param {string|HtmlBuilder} content The contents of the menu.
     */
    constructor(header, content) {
      this._header = header;
      this._content = content;
    }

    /**
     * Show the menu to a player.
     * @param {Player} player
     */
    show(player) {
      let who = player.get('_displayname');

      // Construct the HTML content for the menu.
      let menu = new HtmlBuilder('.menu');
      menu.append('.menuHeader', this._header);
      menu.append('.menuBody', this._content);
      let html = menu.toString(MENU_CSS);

      // Whisper the menu to the player.
      CheckItOut.utils.Chat.whisper(who, html);
    }
  };
})();
