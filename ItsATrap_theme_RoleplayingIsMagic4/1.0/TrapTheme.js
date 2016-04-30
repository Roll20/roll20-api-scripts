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
   * @param  {Function} callback
   *         This callback takes one parameter - the character's passive perception.
   */
  function getPassivePerception(character, callback) {
    var charName = character.get('name');
    var rowNum = perceptionRowNumCache[charName];

    if(rowNum !== undefined) {
      var prefix = 'repeating_skillsMind_$' + rowNum + '_';
      getSheetAttrs(character, [prefix + 'skillMT', prefix + 'skillMI', prefix + 'skillMG', prefix + 'skillMMisc', 'mind'], function(values) {
        var trained = values[prefix + 'skillMT'];
        var improved = values[prefix + 'skillMI'];
        var greater = values[prefix + 'skillMG'];
        var mind = values['mind'] || 0;
        var modifier = values[prefix + 'skillMMisc'] || 0;

        var result = 4 + mind + modifier;
        if(trained)
          result += 3;
        if(improved)
          result += 2;
        if(greater)
          result += 1;
        callback(result);
      });
    }
    else {
      // There's no way at the time of this writing to get the exact number of
      // rows in a repeating section. So for now 30 is used as a reasonable upper limit.
      var maxSkills = 10;
      count = 0;
      _.each(_.range(maxSkills), function(row) {
        getSheetAttrText(character, 'repeating_skillsMind_$' + row + '_skillM', function(skillName) {
          count++;
          log(count);
          if(skillName) {
            skillName = skillName.trim().toLowerCase();
            if(skillName === 'perception') {
              count--;
              perceptionRowNumCache[charName] = row;

              // Now that we know the row number, try again.
              getPassivePerception(character, callback);
            }
          }
          if(count === maxSkills) {
            callback(undefined);
          }
        });
      });
    }
  }

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
   * Asynchronously gets the value of multiple character sheet attributes in
   * parallel.
   * @param  {Character}   character
   * @param  {string[]}   attrList
   * @param  {Function} callback
   *         The callback takes one parameter: the value of the attribute.
   */
  function getSheetAttrs(character, attrList, callback) {
    var count = 0;
    var values = {};
    _.each(attrList, function(attr) {
      getSheetAttr(character, attr, function(value) {
        values[attr] = value;
        count++;

        if(count === attrList.length)
          callback(values);
      });
    });
  }

  /**
   * Asynchronously gets the value of a text attribute on a character sheet.
   * @param  {Character}   character
   * @param  {string}   attr
   * @param  {Function} callback
   *         The callback takes one parameter: the value of the attribute.
   */
  function getSheetAttrText(character, attr, callback) {
    try {
      var rollExpr = '[[0 @{' + character.get('name') + '|' + attr + '}]]';
      sendChat('TrapTheme', rollExpr, function(msg) {
        try {
          var results = msg[0].inlinerolls[0].results;
          var text = _.find(results.rolls, function(roll) {
            if(roll.type === 'C')
              return roll.text;
          });
          callback(text);
        }
        catch(err) {
          callback(undefined);
        }
      });
    }
    catch(err) {
      var regex = /"text":"(.*)?"/;
      var match = regex.exec(err);
      if(match)
        callback(match[1]);
      else
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
  function htmlRollResult(result) {
    var style = 'background-color: #FEF68E; cursor: help; font-size: 1.1em; font-weight: bold; padding: 0 3px;';
    return '<span style="' + style + '">' + result.total + '</span>';
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
          callback(results);
        }
        catch(err) {
          callback(undefined);
        }
      });
    }
    catch(err) {
      callback(undefined);
    }
  }


  function resolveSkillRoll(msgData, skillRoll) {
    log('resolve skill roll');
    log(skillRoll);

    msgData.skill = {
      name: msgData.effect.skill.name,
      difficulty: msgData.effect.skillDif,
      roll: skillRoll
    };
    msgData.trapHit = skillRoll.total < msgData.effect.skillDif;
    sendHtmlTrapMessage(msgData);
  }


  /**
   * Sends an HTML-stylized message about an activated trap.
   * @param  {object} data
   */
  function sendHtmlTrapMessage(data) {
    log('html message');
    log(data);


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
    msg += htmlPaddedRow(data.message, messageStyle);

    // Add the saving throw message.
    if(data.skill) {
      var rollHtml = htmlRollResult(data.skill.roll);
      var saveMsg = '<span style="font-weight: bold;">' + data.skill.name.toUpperCase() + ' check:</span> ' + rollHtml
         + ' vs Dif ' + data.skill.difficulty;
      msg += htmlPaddedRow(saveMsg);
    }

    // Add the hit/miss message.
    if(data.trapHit) {
      var resultHtml = '<span style="color: #f00; font-weight: bold;">HIT! </span>';
      if(data.damage)
        resultHtml += 'Damage: [[' + data.damage + ']]';
      else
        resultHtml += data.character.get('name') + ' falls prey to the trap\'s effects!';
      msg += htmlPaddedRow(resultHtml);
    }
    else {
      var resultHtml = '<span style="color: #620; font-weight: bold;">MISS! </span>';
      if(data.damage && data.missHalf)
        resultHtml += 'Half damage: [[floor((' + data.damage + ')/2)]].';
      msg += htmlPaddedRow(resultHtml);
    }

    // End message.
    msg += '</tbody></table>';

    log('send');
    // Send the HTML message to the chat.
    sendChat('Admiral Ackbar', msg);
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

      var msgData = {
        character: character,
        damage: effect.damage,
        effect: effect,
        message: effect.message,
        missHalf: effect.missHalf
      };

      // Remind the GM about the trap's effects.
      if(effect.notes)
        sendChat('Admiral Ackbar', '/w gm Trap Effects:<br/> ' + effect.notes);

      // Automate trap attack/save mechanics.
      if(character && effect.skill)
        RiM4Dice.rollSkillCheck(character, effect.skill.name, function(skillRoll) {
          if(skillRoll)
            resolveSkillRoll(msgData, skillRoll);
          else
            RiM4Dice.rollSkillCheck(character, effect.skill.attr, function(attrRoll) {
              if(attrRoll)
                resolveSkillRoll(msgData, attrRoll);
            });
        });
      else
        sendHtmlTrapMessage(msgData);

      // If the effect has a sound, try to play it.
      ItsATrap.playEffectSound(effect);

      // If the effect has an api command, execute it.
      ItsATrap.executeTrapCommand(effect);
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
        getPassivePerception(character, function(passPerception) {
          if(passPerception === undefined)
            getSheetAttr(character, 'mind', function(mind) {
              if(mind && mind + 4 >= effect.spotDif)
                noticeTrap(character, trap);
            });
          else if(passPerception >= effect.spotDif)
            noticeTrap(character, trap);
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
