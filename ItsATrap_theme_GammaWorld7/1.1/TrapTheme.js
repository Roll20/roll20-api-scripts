(function() {

  // A mapping of saving throw short names to their attribute names.
  var defenseNames = {
    'ac': 'AC',
    'fort': 'fortitude',
    'ref': 'reflex',
    'will': 'will'
  };

  /**
   * Asynchronously gets the value of a character sheet attribute.
   * @param  {Character}   character
   * @param  {string}   attr
   * @param  {Function} callback
   *         The callback takes one parameter: the value of the attribute.
   */
  function getSheetAttr(character, attr, callback) {
    try {
      rollAsync('@{' + character.get('name') + '|' + attr + '}', function(roll) {
        if(roll)
          callback(roll.total);
        else
          callback(undefined);
      });
    }
    catch(err) {
      callback(undefined);
    }
  }

  /**
   * Produces HTML for a padded table row.
   * @param  {string} innerHTML
   * @param  {string} style
   * @return {string}
   */
  function htmlPaddedRow(innerHTML, style) {
    return '<tr><td style="padding: 1px 1em; ' + style + '">' + innerHTML + '</td></tr>';
  }


  /**
   * Produces HTML for a faked inline roll result.
   * @param  {int} result
   * @param  {string} expr
   * @return {string}
   */
  function htmlRollResult(result, expr) {
    var d20 = result.rolls[0].results[0].v;

    var style = 'background-color: #FEF68E; cursor: help; font-size: 1.1em; font-weight: bold; padding: 0 3px;';
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
   * @return {int}
   */
  function rollAsync(expr, callback) {
    sendChat('TrapTheme', '/w gm [[' + expr + ']]', function(msg) {
      try {
        var results = msg[0].inlinerolls[0].results;
        callback(results);
      }
      catch(err) {
        callback(undefined);
      }
    });
  }


  /**
   * Sends an HTML-stylized message about an activated trap.
   * @param  {object} effect
   */
  function sendHtmlTrapMessage(effect) {
    var tableStyle = [
      'background-color: #fff;',
      'border: solid 1px #000;',
      'border-collapse: separate;',
      'border-radius: 10px;',
      'overflow: hidden;',
      'width: 100%;'
    ].join(' ');
    var headerStyle = [
      'background-color: #000;',
      'color: #fff;',
      'font-weight: bold;'
    ].join(' ');
    var messageStyle = [
      'background-color: #ccc;',
      'font-style: italic;'
    ].join(' ');

    // Start message
    var msg = '<table style="' + tableStyle + '">';
    msg += "<thead><tr style='" + headerStyle + "'><th>IT'S A TRAP!!!</th></tr></thead>";
    msg += '<tbody>';

    // Add the flavor message.
    msg += htmlPaddedRow(effect.message, messageStyle);

    if(effect.character) {

      // Add the attack roll message.
      if(effect.attack) {
        var rollHtml = htmlRollResult(effect.roll,
          '1d20 + ' + effect.attack);
        msg += htmlPaddedRow('<span style="font-weight: bold;">Attack roll:</span> ' +
          rollHtml + ' vs ' + defenseNames[effect.defense] + ' ' + effect.defenseValue);
      }

      // Add the hit/miss message.
      if(effect.trapHit) {
        var resultHtml = '<span style="color: #f00; font-weight: bold;">HIT! </span>';
        if(effect.damage)
          resultHtml += 'Damage: [[' + effect.damage + ']]';
        else
          resultHtml += effect.character.get('name') + ' falls prey to the trap\'s effects!';
        msg += htmlPaddedRow(resultHtml);
      }
      else {
        var resultHtml = '<span style="color: #620; font-weight: bold;">MISS! </span>';
        if(effect.damage && effect.missHalf)
          resultHtml += 'Half damage: [[floor((' + effect.damage + ')/2)]].';
        msg += htmlPaddedRow(resultHtml);
      }
    }

    // End message.
    msg += '</tbody></table>';

    // Send the HTML message to the chat.
    ItsATrap.announceTrap(effect, msg);
  }


  /**
   * A theme for the Gamma World 7E character sheet.
   * @implements ItsATrap#TrapTheme
   */
  var theme = {
    name: 'GammaWorld7',

    /**
     * Display the raw message and play the effect's sound.
     * @inheritdoc
     */
    activateEffect: function(effect) {
      var charToken = getObj('graphic', effect.victimId);
      var character = getObj('character', charToken.get('represents'));

      effect.character = character;

      // Automate trap attack mechanics.
      if(character && effect.defense && effect.attack) {
          getSheetAttr(character, defenseNames[effect.defense], function(defenseValue) {
            defenseValue = defenseValue || 0;
            rollAsync('1d20 + ' + effect.attack, function(attackRoll) {
              effect.defenseValue = defenseValue;
              effect.roll = attackRoll;
              effect.trapHit = attackRoll.total >= defenseValue;
              sendHtmlTrapMessage(effect);
            });
          });
      }
      else
        sendHtmlTrapMessage(effect);
    },

    /**
     * Display a message if the character is within 5 units of the trap.
     * @inheritdoc
     */
    passiveSearch: function(trap, charToken) {
      var effect = ItsATrap.getTrapEffect(charToken, trap);
      var character = getObj('character', charToken.get('represents'));

      // Only do passive search for traps that have a spotDC.
      if(effect.spotDC && character) {

        // If the character's passive perception beats the spot DC, then
        // display a message and mark the trap's trigger area.
        getSheetAttr(character, 'perception', function(passPerc) {
          if(passPerc + 10 >= effect.spotDC) {
            var noticeHtml = "<span style='font-weight: bold;'>IT'S A TRAP!!!</span><br/>" +
              character.get('name') + ' notices a trap: <br/>' + trap.get('name')
            ItsATrap.noticeTrap(trap, noticeHtml);
          }
        });
      }
    }
  };

  // Register the theme with ItsATrap.
  var register = setInterval(function() {
    if(ItsATrap) {
      clearInterval(register);
      ItsATrap.registerTheme(theme);
    }
  }, 1000);
})();
