(() => {
  'use strict';

  // A cache mapping character names to the row number of their Perception skill.
  // Ideally, the row IDs would be cached instead, since that is impervious to
  // changing the order of the rows.
  // In order to use row IDs, the 5E Shaped character sheet would need hidden
  // attributes in each row to store their IDs.
  let perceptionRowNumCache = {};

  let CHAT_NAME = 'ItsATrap-RiM4';

  /**
   * Gets the passive perception for a character. It is assumed that
   * Perception is the 12th skill in the character's skill list.
   * @param  {Character}   character
   */
  function getPassivePerception(character) {
    let charName = character.get('name');

    let mind = parseInt(findObjs({
      _type: 'attribute',
      _characterid: character.get('_id'),
      name: 'mind'
    })[0].get('current'));

    let skill = RiM4Dice.getSkill(character, 'perception');
    let result = 4 + mind;
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
    let style = 'background-color: #FEF68E; cursor: help; font-size: 1.1em; font-weight: bold; padding: 0 3px;';
    return '<span style="' + style + '" title="' + tooltip + '">' + result.total + '</span>';
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
   * Displays the message to notice a trap.
   * @param  {Graphic} trap
   */
  function noticeTrap(character, trap) {
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
   * A Promise wrapper for RiM4Dice.rollSkillCheck.
   * @param {Character} character
   * @param {string} skillName
   * @return {Promise<int, str>}
   */
  function rollSkillCheck(character, skillName) {
    return new Promise((resolve, reject) => {
      RiM4Dice.rollSkillCheck(character, skillName, (skillRoll, expr) => {
        resolve([skillRoll, expr]);
      });
    });
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

    // Add message for who triggered it.
    if(effect.character) {
      let targetMsg = '<span style="font-weight: bold;">Target: </span>' + effect.character.get('name');
      msg += htmlPaddedRow(targetMsg);
    }

    // Add the skill check message.
    if(effect.character && effect.skill) {
      let rollHtml = htmlRollResult(effect.skill.roll, effect.skill.rollExpr);
      let skillMsg = '<span style="font-weight: bold;">' + effect.skill.name.toUpperCase() + ' check:</span> ' + rollHtml
         + ' vs Dif ' + effect.skill.dif;
      msg += htmlPaddedRow(skillMsg);

      let skill = RiM4Dice.getSkill(effect.character, effect.skill.name);
      if(skill && skill.notes) {
        let skillNotesMsg = '<span style="font-size: 0.8em; font-style: italic;">' + skill.notes + '</span>';
        msg += htmlPaddedRow(skillNotesMsg);
      }

      // Add the hit/miss message.
      if(effect.trapHit) {
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
   * A theme for the Roleplaying is Magic 4 character sheet.
   * @implements ItsATrap#TrapTheme
   */
  class TrapTheme {
    get name() {
      return 'MLP-RIM-4';
    }

    /**
     * Display the raw message and play the effect's sound.
     * @inheritdoc
     */
    activateEffect(effect) {
      let charToken = getObj('graphic', effect.victimId);
      let character = getObj('character', charToken.get('represents'));
      effect.character = character;

      // Automate trap attack/save mechanics.
      Promise.resolve()
      .then(() => {
        if(character && effect.skill) {
          let attr = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: effect.skill.attr
          })[0].get('current');

          return rollSkillCheck(character, effect.skill.name)
          .then(tuple => {
            let skillRoll = tuple[0];
            let expr = tuple[1];

            if(skillRoll) {
              effect.skill.roll = skillRoll;
              effect.skill.rollExpr = expr;
              effect.trapHit = skillRoll.total < effect.skill.dif;
              return effect;
            }
            else {
              // default to primary attribute.
              return rollAsync('2d6 + ' + attr + ' [' + effect.skill.attr + ']')
              .then((attrRoll, expr) => {
                effect.skill.roll = attrRoll;
                effect.skill.rollExpr = expr;
                effect.trapHit = attrRoll.total < effect.skill.dif;
                return effect;
              });
            }
          });
        }
        else
          return effect;
      })
      .then(sendHtmlTrapMessage)
      .catch(err => {
        sendChat(CHAT_NAME, '/w gm ' + err.message);
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
      if(effect.spotDif && character) {
        Promise.resolve()
        .then(() => {
          let passPerception = getPassivePerception(character);
          if(passPerception === undefined) {
            let mind = findObjs({
              _type: 'attribute',
              _characterid: character.get('_id'),
              name: 'mind'
            })[0].get('current');

            return (mind && mind + 4 >= effect.spotDif);
          }
          else
            return (passPerception >= effect.spotDif);
        })
        .then(passed => {
          if(passed)
            noticeTrap(character, trap);
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
