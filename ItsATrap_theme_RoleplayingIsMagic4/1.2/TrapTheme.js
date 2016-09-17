(() => {
  'use strict';

  // A cache mapping character names to the row number of their Perception skill.
  // Ideally, the row IDs would be cached instead, since that is impervious to
  // changing the order of the rows.
  // In order to use row IDs, the 5E Shaped character sheet would need hidden
  // attributes in each row to store their IDs.
  let perceptionRowNumCache = {};

  const CHAT_NAME = 'ItsATrap-RiM4';

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
    'skillNotes': {
      'font-size': '0.8em',
      'font-style': 'italic'
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
   * Produces HTML for a faked inline roll result.
   * @param  {int} result
   * @param  {string} tooltip
   * @return {HtmlBuilder}
   */
  function htmlRollResult(result, tooltip) {
    return new HtmlBuilder('span.rollResult', result.total, {
      title: tooltip
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
   * Displays the message to notice a trap.
   * @param {Character} character
   * @param {Graphic} trap
   */
  function noticeTrap(character, trap) {
    let content = new HtmlBuilder();
    content.append('.paddedRow trapMessage', character.get('name') + ' notices a trap:');
    content.append('.paddedRow', trap.get('name'));

    ItsATrap.noticeTrap(trap, htmlTable(content, '#000').toString(THEME_CSS));
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
    let content = new HtmlBuilder('div');

    // Add the flavor message.
    content.append('.paddedRow trapMessage', effect.message);

    // Add message for who triggered it.
    if(effect.character) {
      let row = content.append('.paddedRow');
      row.append('span.bold', 'Target: ');
      row.append('span', effect.character.get('name'));
    }

    // Add the skill check message.
    if(effect.character && effect.skill) {
      let rollHtml = htmlRollResult(effect.skill.roll, effect.skill.rollExpr);
      let row = content.append('.paddedRow');
      row.append('span.bold', effect.skill.name.toUpperCase() + ' check: ');
      row.append('span', rollHtml);
      row.append('span', ' vs Dif ' + effect.skill.dif);

      // Add skill notes.
      let skill = RiM4Dice.getSkill(effect.character, effect.skill.name);
      if(skill && skill.notes)
        content.append('.paddedRow').append('span.skillNotes', skill.notes);

      // Add the hit/miss message.
      if(effect.trapHit) {
        let row = content.append('.paddedRow');
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
              let rollExpr = '2d6 + ' + attr + ' [' + effect.skill.attr + ']';
              return rollAsync('2d6 + ' + attr + ' [' + effect.skill.attr + ']')
              .then(attrRoll => {
                effect.skill.roll = attrRoll;
                effect.skill.rollExpr = rollExpr;
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
