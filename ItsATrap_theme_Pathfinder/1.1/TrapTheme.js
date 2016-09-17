(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-Pathfinder';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    fort: 'Fort',
    ref: 'Ref',
    will: 'Will'
  };

  const THEME_CSS = {
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

  /**
   * Asynchronously gets the value of a character sheet attribute.
   * @param  {Character}   character
   * @param  {string}   attr
   * @return {Promise<any>}
   *         Contains the value of the attribute.
   */
  function getSheetAttr(character, attr) {
    let rollExpr = '@{' + character.get('name') + '|' + attr + '}';
    return rollAsync(rollExpr)
    .then((roll) => {
      if(roll)
        return roll.total;
      else
        throw new Error('Could not resolve roll expression: ' + rollExpr);
    });
  }

  /**
   * Produces HTML for a faked inline roll result.
   * @param  {int} result
   * @param  {string} expr
   * @return {string}
   */
  function htmlRollResult(result, expr) {
    let d20 = result.rolls[0].results[0].v;

    let clazzes = ['rollResult'];
    if(d20 === 20)
      clazzes.push('critSuccess');
    if(d20 === 1)
      clazzes.push('critFail');
    return new HtmlBuilder('span.' + clazzes.join(' '), result.total, {
      title: expr
    });
  }

  /**
   * Asynchronously rolls a dice roll expression and returns the result's total in
   * a callback. The result is undefined if an invalid expression is given.
   * @param  {string} expr
   * @return {Promise<int>}
   */
  function rollAsync(expr) {
    return new Promise((resolve, reject) => {
      sendChat(CHAT_NAME, '/w gm [[' + expr + ']]', (msg) => {
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

  /**
   * Sends an HTML-stylized message about a noticed trap.
   * @param {(HtmlBuilder|string)} content
   * @param {string} borderColor
   */
  function htmlTable(content, borderColor) {
    let table = new HtmlBuilder('table.trapTable', '', {
      style: { 'border-color': borderColor }
    });
    table.append('thead.trapTableHead', '', {
      style: { 'background-color': borderColor }
    }).append('th', 'IT\'S A TRAP!!!');
    table.append('tbody').append('tr').append('td', content, {
      style: { 'padding': '0' }
    });
    return table;
  }

  /**
   * Sends an HTML-stylized message about an activated trap.
   * @param  {object} effect
   */
  function sendHtmlTrapMessage(effect) {
    let content = new HtmlBuilder('div');

    // Add the flavor message.
    content.append('.paddedRow trapMessage', effect.message);

    if(effect.character) {

      // Add the attack roll message.
      if(effect.attack) {
        let rollResult = htmlRollResult(effect.roll, '1d20 + ' + effect.attack);
        content.append('.paddedRow')
          .append('span.bold', 'Attack roll:')
          .append('span', rollResult)
          .append('span', ' vs AC ' + effect.ac);
      }

      // Add the saving throw message.
      if(effect.save) {
        let rollResult = htmlRollResult(effect.roll, '1d20 + ' + effect.saveBonus);
        let saveMsg = new HtmlBuilder('.paddedRow')
        saveMsg.append('span.bold', effect.save.toUpperCase() + ' save:')
        saveMsg.append('span', rollResult)
        saveMsg.append('span', ' vs DC ' + effect.saveDC);

        // If the save result is a secret, whisper it to the GM.
        if(effect.hideSave)
          sendChat('Admiral Ackbar', '/w gm ' + saveMsg.toString(THEME_CSS));
        else
          content.append(saveMsg);
      }

      // Add the hit/miss message.
      if(effect.trapHit === 'AC unknown') {
        content.append('.paddedRow', 'AC could not be determined with the current version of your character sheet. For the time being, please resolve the attack against AC manually.');
        if(effect.damage)
          content.append('.paddedRow', 'Damage: [[' + effect.damage + ']]');
      }
      else if(effect.trapHit) {
        let row = content.append('.paddedRow')
        row.append('span.hit', 'HIT! ');
        if(effect.damage)
          row.append('span', 'Damage: [[' + effect.damage + ']]');
        else
          row.append('span', effect.character.get('name') + ' falls prey to the trap\'s effects!');
      }
      else {
        let row = content.append('.paddedRow');
        row.append('span.miss', 'MISS! ');
        if(effect.damage && effect.missHalf)
          row.append('span', 'Half damage: [[floor((' + effect.damage + ')/2)]].');
      }
    }

    // Send the HTML message to the chat.
    ItsATrap.announceTrap(effect, htmlTable(content, '#a22').toString(THEME_CSS));
  }


  /**
   * A theme for the Pathfinder character sheet by Samuel Marino, Nibrodooh,
   * Vince, Samuel Terrazas, chris-b, Magik, and James W..
   * @implements ItsATrap#TrapTheme
   */
  class TrapTheme {
    get name() {
      return 'Pathfinder';
    }

    /**
     * Display the raw message and play the effect's sound.
     * @inheritdoc
     */
    activateEffect(effect) {
      let charToken = getObj('graphic', effect.victimId);
      let character = getObj('character', charToken.get('represents'));

      // Automate trap attack/save mechanics.
      Promise.resolve()
      .then(() => {

        effect.character = character;
        if(character)
          if(effect.attack)
            return this._doTrapAttack(character, effect);
          else if(effect.save && effect.saveDC)
            return this._doTrapSave(character, effect);
          else
            return effect;
        else
          return effect;
      })
      .then(sendHtmlTrapMessage)
      .catch(err => {
        sendChat(CHAT_NAME, '/w gm ' + err.message);
        log(err.stack);
      });
    }

    _doTrapAttack(character, effect) {
      return Promise.all([
        getSheetAttr(character, 'AC'),
        rollAsync('1d20 + ' + effect.attack)
      ])
      .then((tuple) => {
        let ac = tuple[0];
        let atkRoll = tuple[1];

        effect.ac = ac || '??';
        effect.roll = atkRoll;
        if(ac)
          effect.trapHit = atkRoll.total >= ac;
        else
          effect.trapHit = 'AC unknown';

        return effect;
      });
    }

    _doTrapSave(character, effect) {
      return getSheetAttr(character, SAVE_NAMES[effect.save])
      .then(saveBonus => {
        saveBonus = saveBonus || 0;
        effect.saveBonus = saveBonus;
        return rollAsync('1d20 + ' + saveBonus);
      })
      .then(saveRoll => {
        effect.roll = saveRoll;
        effect.trapHit = saveRoll.total < effect.saveDC;
        return effect;
      });
    }

    /**
     * Display a message if the character is within 5 units of the trap.
     * @inheritdoc
     */
    passiveSearch(trap, charToken) {
      let effect = ItsATrap.getTrapEffect(charToken, trap);
      let character = getObj('character', charToken.get('represents'));

      // Only do passive search for traps that have a spotDC.
      if(effect.spotDC && character) {

        // If the character's passive wisdom beats the spot DC, then
        // display a message and mark the trap's trigger area.
        getSheetAttr(character, 'Perception')
        .then(spot => {
          if(spot + 10 >= effect.spotDC) {
            let content = new HtmlBuilder();
            content.append('.paddedRow trapMessage', character.get('name') + ' notices a trap:');
            content.append('.paddedRow', trap.get('name'));

            ItsATrap.noticeTrap(trap, htmlTable(content, '#000').toString(THEME_CSS));
          }
        })
        .catch(err => {
          sendChat(CHAT_NAME, '/w gm ' + err.message);
          log(err.stack);
        });
      }
    }
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    ItsATrap.registerTheme(new TrapTheme());
  });
})();
