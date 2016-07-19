(function() {

  // A cache mapping character names to the row number of their Perception skill.
  // Ideally, the row IDs would be cached instead, since that is impervious to
  // changing the order of the rows.
  // In order to use row IDs, the 5E Shaped character sheet would need hidden
  // attributes in each row to store their IDs.
  var perceptionRowNumCache = {};

  /**
   * Gets the passive perception for a character. It is assumed that
   * Perception is the 12th skill in the character's skill list.
   * @param  {Character}   character
   */
  function getPassivePerception(character) {
    var charName = character.get('name');

    var mind = parseInt(findObjs({
      _type: 'attribute',
      _characterid: character.get('_id'),
      name: 'mind'
    })[0].get('current'));

    var skill = RiM4Dice.getSkill(character, 'perception');

    var result = 4 + mind;
    if(skill) {
      if(skill.trained)
        result += 3;
      if(skill.improved)
        result += 2;
      if(skill.greater)
        result += 1;

      result += (skill.misc || 0) + (skill.advDis || 0);
    }
    return result;
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
   * @param  {roll} result
   * @param  {string} tooltip
   * @return {string}
   */
  function htmlRollResult(result, tooltip) {
    var style = 'background-color: #FEF68E; cursor: help; font-size: 1.1em; font-weight: bold; padding: 0 3px;';
    return '<span style="' + style + '" title="' + tooltip + '">' + result.total + '</span>';
  }

  /**
   * Displays the message to notice a trap.
   * @param  {Graphic} trap
   */
  function noticeTrap(character, trap) {
    var noticeHtml = "<span style='font-weight: bold;'>IT'S A TRAP!!!</span><br/>" +
      character.get('name') + ' notices a trap: <br/>' + trap.get('name')
    ItsATrap.noticeTrap(trap, noticeHtml);
  }


  /**
   * Asynchronously rolls a dice roll expression and returns the result's total in
   * a callback. The result is undefined if an invalid expression is given.
   * @param  {string} expr
   * @return {int}
   */
  function rollAsync(expr, callback) {
    try {
      sendChat('ItsATrap-DnD5', '/w gm [[' + expr + ']]', function(msg) {
        try {
          var results = msg[0].inlinerolls[0].results;
          callback(results, expr);
        }
        catch(err) {
          callback(undefined, expr);
        }
      });
    }
    catch(err) {
      callback(undefined, expr);
    }
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

    // Add message for who triggered it.
    if(effect.character) {
      var targetMsg = '<span style="font-weight: bold;">Target: </span>' + effect.character.get('name');
      msg += htmlPaddedRow(targetMsg);
    }

    // Add the skill check message.
    if(effect.character && effect.skill) {
      var rollHtml = htmlRollResult(effect.skill.roll, effect.skill.rollExpr);
      var skillMsg = '<span style="font-weight: bold;">' + effect.skill.name.toUpperCase() + ' check:</span> ' + rollHtml
         + ' vs Dif ' + effect.skill.dif;
      msg += htmlPaddedRow(skillMsg);

      var skill = RiM4Dice.getSkill(effect.character, effect.skill.name);
      if(skill && skill.notes) {
        var skillNotesMsg = '<span style="font-size: 0.8em; font-style: italic;">' + skill.notes + '</span>';
        msg += htmlPaddedRow(skillNotesMsg);
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
   * A theme for the 5th Edition OGL character sheet.
   * @implements ItsATrap#TrapTheme
   */
  var theme = {
    name: 'MLP-RIM-4',

    /**
     * Display the raw message and play the effect's sound.
     * @inheritdoc
     */
    activateEffect: function(effect) {
      var charToken = getObj('graphic', effect.victimId);
      var character = getObj('character', charToken.get('represents'));

      effect.character = character;

      // Automate trap attack/save mechanics.
      if(character && effect.skill) {
        var attr = findObjs({
          _type: 'attribute',
          _characterid: character.get('_id'),
          name: effect.skill.attr
        })[0].get('current');

        RiM4Dice.rollSkillCheck(character, effect.skill.name, function(skillRoll, expr) {
          if(skillRoll) {
            effect.skill.roll = skillRoll;
            effect.skill.rollExpr = expr;
            effect.trapHit = skillRoll.total < effect.skill.dif;
            sendHtmlTrapMessage(effect);
          }
          else {
            // default to primary attribute.
            rollAsync('2d6 + ' + attr + ' [' + effect.skill.attr + ']', function(attrRoll, expr) {
              effect.skill.roll = attrRoll;
              effect.skill.rollExpr = expr;
              effect.trapHit = attrRoll.total < effect.skill.dif;
              sendHtmlTrapMessage(effect);
            });
          }
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
      if(effect.spotDif && character) {
        var passPerception = getPassivePerception(character);
        if(passPerception === undefined) {
          var mind = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: 'mind'
          })[0].get('current');

          if(mind && mind + 4 >= effect.spotDif)
            noticeTrap(character, trap);
        }
        else if(passPerception >= effect.spotDif)
          noticeTrap(character, trap);
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
