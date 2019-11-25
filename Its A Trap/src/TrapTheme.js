/**
 * Base class for trap themes: System-specific strategies for handling
 * automation of trap activation results and passive searching.
 * @abstract
 */
var TrapTheme = (() => {
  'use strict';

  /**
   * The name of the theme used to register it.
   * @type {string}
   */
  return class TrapTheme {

    /**
     * A sample CSS object for trap HTML messages created with HTML Builder.
     */
    static get css() {
      return {
        'bold': {
          'font-weight': 'bold'
        },
        'critFail': {
          'border': '2px solid #B31515'
        },
        'critSuccess': {
          'border': '2px solid #3FB315'
        },
        'hit': {
          'color': '#f00',
          'font-weight': 'bold'
        },
        'miss': {
          'color': '#620',
          'font-weight': 'bold'
        },
        'paddedRow': {
          'padding': '1px 1em'
        },
        'rollResult': {
          'background-color': '#FEF68E',
          'cursor': 'help',
          'font-size': '1.1em',
          'font-weight': 'bold',
          'padding': '0 3px'
        },
        'trapMessage': {
          'background-color': '#ccc',
          'font-style': 'italic'
        },
        'trapTable': {
          'background-color': '#fff',
          'border': 'solid 1px #000',
          'border-collapse': 'separate',
          'border-radius': '10px',
          'overflow': 'hidden',
          'width': '100%'
        },
        'trapTableHead': {
          'background-color': '#000',
          'color': '#fff',
          'font-weight': 'bold'
        }
      };
    }

    get name() {
      throw new Error('Not implemented.');
    }

    /**
     * Activates a TrapEffect by displaying the trap's message and
     * automating any system specific trap mechanics for it.
     * @abstract
     * @param {TrapEffect} effect
     */
    activateEffect(effect) {
      throw new Error('Not implemented.');
    }

    /**
     * Gets a list of a trap's theme-specific configured properties.
     * @param {Graphic} trap
     * @return {TrapProperty[]}
     */
    getThemeProperties(trap) {
      return [];
    }

    /**
     * Displays the message to notice a trap.
     * @param {Character} character
     * @param {Graphic} trap
     */
    static htmlNoticeTrap(character, trap) {
      let content = new HtmlBuilder();
      let effect = new TrapEffect(trap, character);

      content.append('.paddedRow trapMessage', character.get('name') + ' notices a ' + (effect.type || 'trap') + ':');
      content.append('.paddedRow', trap.get('name'));

      return TrapTheme.htmlTable(content, '#000', effect);
    }

    /**
     * Sends an HTML-stylized message about a noticed trap.
     * @param {(HtmlBuilder|string)} content
     * @param {string} borderColor
     * @param {TrapEffect} [effect]
     * @return {HtmlBuilder}
     */
    static htmlTable(content, borderColor, effect) {
      let type = (effect && effect.type) || 'trap';

      let table = new HtmlBuilder('table.trapTable', '', {
        style: { 'border-color': borderColor }
      });
      table.append('thead.trapTableHead', '', {
        style: { 'background-color': borderColor }
      }).append('th', 'IT\'S A ' + type.toUpperCase() + '!!!');

      table.append('tbody').append('tr').append('td', content, {
        style: { 'padding': '0' }
      });
      return table;
    }

    /**
     * Changes a theme-specific property for a trap.
     * @param {Graphic} trapToken
     * @param {Array} params
     */
    modifyTrapProperty(trapToken, argv) {
      // Default implementation: Do nothing.
    }

    /**
     * The system-specific behavior for a character passively noticing a trap.
     * @abstract
     * @param {Graphic} trap
     *        The trap's token.
     * @param {Graphic} charToken
     *        The character's token.
     */
    passiveSearch(trap, charToken) {
      throw new Error('Not implemented.');
    }
  };
})();
