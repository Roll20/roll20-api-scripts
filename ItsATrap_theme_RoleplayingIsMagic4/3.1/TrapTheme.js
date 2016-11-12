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
   * @param {TrapEffect} effect
   * @param {object} effectResult
   */
  function sendHtmlTrapMessage(effect, effectResult) {
    let content = new HtmlBuilder('div');

    // Add the flavor message.
    content.append('.paddedRow trapMessage', effect.message);

    // Add message for who triggered it.
    if(effectResult.character) {
      let row = content.append('.paddedRow');
      row.append('span.bold', 'Target: ');
      row.append('span', effectResult.character.get('name'));
    }

    // Add the skill check message.
    if(effectResult.character && effectResult.skill) {
      let rollHtml = htmlRollResult(effectResult.skill.roll, effectResult.skill.rollExpr);
      let row = content.append('.paddedRow');
      row.append('span.bold', effectResult.skill.name.toUpperCase() + ' check: ');
      row.append('span', rollHtml);
      row.append('span', ' vs Dif ' + effectResult.skill.dif);

      // Add skill notes.
      let skill = RiM4Dice.getSkill(effectResult.character, effectResult.skill.name);
      if(skill && skill.notes)
        content.append('.paddedRow').append('span.skillNotes', skill.notes);

      // Add the hit/miss message.
      if(effectResult.trapHit) {
        let row = content.append('.paddedRow');
        row.append('span.hit', 'HIT! ');
        if(effectResult.damage)
          row.append('span', 'Damage: [[' + effectResult.damage + ']]');
        else
          row.append('span', effectResult.character.get('name') + ' falls prey to the trap\'s effects!');
      }
      else {
        let row = content.append('.paddedRow');
        row.append('span.miss', 'MISS! ');
        if(effectResult.damage && effectResult.missHalf)
          row.append('span', 'Half damage: [[floor((' + effectResult.damage + ')/2)]].');
      }
    }

    // Send the HTML message to the chat.
    effect.announce(htmlTable(content, '#a22').toString(THEME_CSS));
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the Roleplaying is Magic 4 character sheet.
     */
    class TrapThemeMLPRIM4 extends TrapTheme {
      get name() {
        return 'MLP-RIM-4';
      }

      /**
       * Display the raw message and play the effect's sound.
       * @inheritdoc
       */
      activateEffect(effect) {
        let character = getObj('character', effect.victim.get('represents'));
        let effectResult = effect.json;

        effectResult.character = character;

        // Automate trap attack/save mechanics.
        Promise.resolve()
        .then(() => {
          if(character && effectResult.skill) {
            let attr = findObjs({
              _type: 'attribute',
              _characterid: character.get('_id'),
              name: effectResult.skill.attr
            })[0].get('current');

            return rollSkillCheck(character, effectResult.skill.name)
            .then(tuple => {
              let skillRoll = tuple[0];
              let expr = tuple[1];

              if(skillRoll) {
                effectResult.skill.roll = skillRoll;
                effectResult.skill.rollExpr = expr;
                effectResult.trapHit = skillRoll.total < effectResult.skill.dif;
                return effectResult;
              }
              else {
                // default to primary attribute.
                let rollExpr = '2d6 + ' + attr + ' [' + effectResult.skill.attr + ']';
                return TrapTheme.rollAsync('2d6 + ' + attr + ' [' + effectResult.skill.attr + ']')
                .then(attrRoll => {
                  effectResult.skill.roll = attrRoll;
                  effectResult.skill.rollExpr = rollExpr;
                  effectResult.trapHit = attrRoll.total < effectResult.skill.dif;
                  return effectResult;
                });
              }
            });
          }
          else
            return effectResult;
        })
        .then(effectResult => {
          sendHtmlTrapMessage(effect, effectResult);
        })
        .catch(err => {
          sendChat(CHAT_NAME, '/w gm ' + err.message);
        });
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let trapEffect = (new TrapEffect(trapToken)).json;
        return [
          {
            id: 'damage',
            name: 'Damage',
            desc: `The dice roll expression for the trap's damage.`,
            value: trapEffect.damage
          },
          {
            id: 'missHalf',
            name: 'Miss - Half Damage',
            desc: 'Does the trap deal half damage on a miss?',
            value: trapEffect.missHalf ? 'yes' : 'no',
            options: ['yes', 'no']
          },
          {
            id: 'skill',
            name: 'Skill Check',
            desc: `The skill check for avoiding the trap's effects.`,
            value: (() => {
              let skill = trapEffect.skill;
              if(skill) {
                return `${skill.name}(${skill.attr}, Dif: ${skill.dif})`;
              }
              else
                return '';
            })(),
            properties: [
              {
                id: 'name',
                name: 'Skill Name',
                desc: 'The name of the skill for the skill check.'
              },
              {
                id: 'attr',
                name: 'Primary Attribute',
                desc: 'The primary attribute the skill is based on.'
              },
              {
                id: 'dif',
                name: 'Difficulty',
                desc: 'The difficulty of the skill check.'
              }
            ]
          },
          {
            id: 'spotDif',
            name: 'Spot Difficulty',
            desc: 'The Perception check difficulty to spot the trap.',
            value: trapEffect.spotDif
          }
        ];
      }

      /**
       * @inheritdoc
       */
      modifyTrapProperty(trapToken, argv) {
        let trapEffect = (new TrapEffect(trapToken)).json;

        let prop = argv[0];
        let params = argv.slice(1);

        if(prop === 'damage')
          trapEffect.damage = params[0];
        if(prop === 'missHalf')
          trapEffect.missHalf = params[0] === 'yes';
        if(prop === 'skill') {
          trapEffect.skill = {};
          trapEffect.skill.name = params[0];
          trapEffect.skill.attr = params[1];
          trapEffect.skill.dif = params[2];
        }
        if(prop === 'spotDif')
          trapEffect.spotDif = parseInt(params[0]);

        trapToken.set('gmnotes', JSON.stringify(trapEffect));
      }

      /**
       * @inheritdoc
       */
      passiveSearch(trap, charToken) {
        let effect = new TrapEffect(trap, charToken);
        let character = getObj('character', charToken.get('represents'));

        // Only do passive search for traps that have a spotDC.
        if(effect.json.spotDif && character) {
          Promise.resolve()
          .then(() => {
            let passPerception = getPassivePerception(character);
            return (passPerception >= effect.json.spotDif);
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

    ItsATrap.registerTheme(new TrapThemeMLPRIM4());
  });
})();
