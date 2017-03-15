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
     * Attempts to force a calculated attribute to be corrected by
     * setting it.
     * @param {Character} character
     * @param {string} attr
     */
    static forceAttrCalculation(character, attr) {
      // Attempt to force the calculation of the save modifier by setting it.
      createObj('attribute', {
        _characterid: character.get('_id'),
        name: attr,
        current: -9999
      });

      // Then try again.
      return TrapTheme.getSheetAttr(character, attr)
      .then(result => {
        if(_.isNumber(result))
          return result;
        else
          log('Could not calculate attribute: ' + attr + ' - ' + result);
      });
    }

    /**
     * Asynchronously gets the value of a character sheet attribute.
     * @param  {Character} character
     * @param  {string} attr
     * @return {Promise<number>}
     *         Contains the value of the attribute.
     */
    static getSheetAttr(character, attr) {
      if(attr.includes('/'))
        return TrapTheme.getSheetRepeatingAttr(character, attr);
      else {
        let rollExpr = '@{' + character.get('name') + '|' + attr + '}';
        return TrapTheme.rollAsync(rollExpr)
        .then((roll) => {
          if(roll)
            return roll.total;
          else
            throw new Error('Could not resolve roll expression: ' + rollExpr);
        })
        .then(value => {
          if(_.isNumber(value))
            return value;

          // If the attribute is autocalculated, but could its current value
          // could not be resolved, try to force it to calculate its value as a
          // last-ditch effort.
          else
            return TrapTheme.forceAttrCalculation(character, attr);
        });
      }
    }

    /**
     * Asynchronously gets the value of a character sheet attribute from a
     * repeating row.
     * @param {Character} character
     * @param {string} attr
     *        Here, attr has the format "sectionName/nameFieldName/nameFieldValue/valueFieldName".
     *        For example: "skills/name/perception/total"
     * @return {Promise<number>}
     *         Contains the value of the attribute.
     */
    static getSheetRepeatingAttr(character, attr) {
      let parts = attr.split('/');
      let sectionName = parts[0];
      let nameFieldName = parts[1];
      let nameFieldValue = parts[2].toLowerCase();
      let valueFieldName = parts[3];

      // Find the row with the given name.
      return TrapTheme.getSheetRepeatingRow(character, sectionName, rowAttrs => {
        let nameField = rowAttrs[nameFieldName];
        return nameField.get('current').toLowerCase().trim() === nameFieldValue;
      })

      // Get the current value of that row.
      .then(rowAttrs => {
        let valueField = rowAttrs[valueFieldName];
        return valueField.get('current');
      });
    }

    /**
     * Gets the map of attributes inside of a repeating section row.
     * @param {Character} character
     * @param {string} section
     *        The name of the repeating section.
     * @param {func} rowFilter
     *        A filter function to find the correct row. The argument passed to it is a
     *        map of attribute names (without the repeating section ID part - e.g. "name"
     *        instead of "repeating_skills_-123abc_name") to their actual attributes in
     *        the current row being filtered. The function should return true iff it is
     *        the correct row we're looking for.
     * @return {Promise<any>}
     *         Contains the map of attributes.
     */
    static getSheetRepeatingRow(character, section, rowFilter) {
      // Get all attributes in this section and group them by row.
      let attrs = findObjs({
        _type: 'attribute',
        _characterid: character.get('_id')
      });

      // Group the attributes by row.
      let rows = {};
      _.each(attrs, attr => {
        let regex = new RegExp(`repeating_${section}_(-([0-9a-zA-Z\-_](?!_storage))+?|\$\d+?)_([0-9a-zA-Z\-_]+)`);
        let match = attr.get('name').match(regex);
        if(match) {
          let rowId = match[1];
          let attrName = match[3];
          if(!rows[rowId])
            rows[rowId] = {};

          rows[rowId][attrName] = attr;
        }
      });

      // Find the row that matches our filter.
      return Promise.resolve(_.find(rows, rowAttrs => {
        return rowFilter(rowAttrs);
      }));
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

    /**
     * Asynchronously rolls a dice roll expression and returns the result's total in
     * a callback. The result is undefined if an invalid expression is given.
     * @param  {string} expr
     * @return {Promise<int>}
     */
    static rollAsync(expr) {
      return new Promise((resolve, reject) => {
        sendChat('TrapTheme', '/w gm [[' + expr + ']]', (msg) => {
          try {
            let results = msg[0].inlinerolls[0].results;
            resolve(results);
          }
          catch(err) {
            reject(err);
          }
        });
      });
    }
  };
})();
