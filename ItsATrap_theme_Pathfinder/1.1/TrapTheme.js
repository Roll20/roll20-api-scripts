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
   * Produces HTML for a padded table row.
   * @param  {string} innerHTML
   * @param  {string} style
   * @return {string}
   */
  function htmlPaddedRow(innerHTML, style) {
    return '<div style="padding: 1px 1em; ' + style + '">' + innerHTML + '</div>';
  }

  /**
   * Produces HTML for a faked inline roll result.
   * @param  {int} result
   * @param  {string} expr
   * @return {string}
   */
  function htmlRollResult(result, expr) {
    let d20 = result.rolls[0].results[0].v;

    let style = 'background-color: #FEF68E; cursor: help; font-size: 1.1em; font-weight: bold; padding: 0 3px;';
    if(d20 === 20)
      style += 'border: 2px solid #3FB315;';
    if(d20 === 1)
      style += 'border: 2px solid #B31515';

    return '<span title="' + expr + '" style="' + style + '">' + result.total + '</span>';
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
   * @param {string} message
   * @param {string} borderColor
   */
  function htmlTable(message, borderColor) {
    let tableStyle = [
      'background-color: #fff;',
      'border: solid 1px ' + borderColor + ';',
      'border-collapse: separate;',
      'border-radius: 10px;',
      'overflow: hidden;',
      'width: 100%;'
    ].join(' ');
    let headerStyle = [
      'background-color: ' + borderColor + ';',
      'color: #fff;',
      'font-weight: bold;'
    ].join(' ');

    let msg = '<table style="' + tableStyle + '">';
    msg += "<thead><tr style='" + headerStyle + "'><th>IT'S A TRAP!!!</th></tr></thead>";
    msg += '<tbody><tr><td style="padding: 0;">' + message + '</td></tr></tbody></table>';
    return msg;
  }

  /**
   * Sends an HTML-stylized message about an activated trap.
   * @param  {object} effect
   */
  function sendHtmlTrapMessage(effect) {
    let messageStyle = [
      'background-color: #ccc;',
      'font-style: italic;'
    ].join(' ');

    // Add the flavor message.
    let msg = htmlPaddedRow(effect.message, messageStyle);

    if(effect.character) {

      // Add the attack roll message.
      if(effect.attack) {
        let rollHtml = htmlRollResult(effect.roll,
          '1d20 + ' + effect.attack);
        msg += htmlPaddedRow('<span style="font-weight: bold;">Attack roll:</span> ' + rollHtml + ' vs AC ' + effect.ac);
      }

      // Add the saving throw message.
      if(effect.save) {
        let rollHtml = htmlRollResult(effect.roll, '1d20 + ' + effect.saveBonus);
        let saveMsg = '<span style="font-weight: bold;">' + effect.save.toUpperCase() + ' save:</span> ' + rollHtml
           + ' vs DC ' + effect.saveDC;

        // If the save result is a secret, whisper it to the GM.
        if(effect.hideSave)
          sendChat('Admiral Ackbar', '/w gm ' + saveMsg);
        else
          msg += htmlPaddedRow(saveMsg);
      }

      // Add the hit/miss message.
      if(effect.trapHit === 'AC unknown') {
        let resultHtml = '<div>AC could not be determined with the current version of your character sheet. For the time being, please resolve the attack against AC manually.</div>';
        if(effect.damage)
          resultHtml += '<div>Damage: [[' + effect.damage + ']]</div>';
        msg += htmlPaddedRow(resultHtml);
      }
      else if(effect.trapHit) {
        let resultHtml = '<span style="color: #f00; font-weight: bold;">HIT! </span>';
        if(effect.damage)
          resultHtml += 'Damage: [[' + effect.damage + ']]';
        else
          resultHtml += effect.character.get('name') + ' falls prey to the trap\'s effects!';
        msg += htmlPaddedRow(resultHtml);
      }
      else {
        let resultHtml = '<span style="color: #620; font-weight: bold;">MISS! </span>';
        if(effect.damage && effect.missHalf)
          resultHtml += 'Half damage: [[floor((' + effect.damage + ')/2)]].';
        msg += htmlPaddedRow(resultHtml);
      }
    }

    // Send the HTML message to the chat.
    msg = htmlTable(msg, '#a22');
    ItsATrap.announceTrap(effect, msg);
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
            let messageStyle = [
              'background-color: #ccc;',
              'font-style: italic;'
            ].join(' ');

            // Add the flavor message.
            let msg = htmlPaddedRow(character.get('name') + ' notices a trap:', messageStyle);
            msg += htmlPaddedRow(trap.get('name'));
            msg = htmlTable(msg, '#000');
            ItsATrap.noticeTrap(trap, msg);
          }
        });
      }
    }
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    ItsATrap.registerTheme(new TrapTheme());
  });
})();
