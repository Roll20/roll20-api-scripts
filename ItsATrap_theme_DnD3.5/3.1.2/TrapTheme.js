(function() {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-DnD-3.5';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    'fort': 'fortitude',
    'ref': 'reflex',
    'will': 'will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the DnD 3.5 character sheet by Diana P..
     */
    class TrapThemeDnD3_5 extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return 'DnD-3.5';
      }

      /**
       * @inheritdoc
       */
      activateEffect(effect) {
        let character = getObj('character', effect.victim.get('represents'));
        let effectResults = effect.json;

        // Automate trap attack/save mechanics.
        Promise.resolve()
        .then(() => {
          effectResults.character = character;
          if(character) {
            if(effectResults.attack)
              if(effectResults.attackVs === 'touch AC')
                return this._doTrapTouchAttack(character, effectResults);
              else
                return this._doTrapAttack(character, effectResults);
            else if(effectResults.save && effectResults.saveDC)
              return this._doTrapSave(character, effectResults);
          }
          return effectResults;
        })
        .then(effectResults => {
          let html = TrapThemeDnD3_5.htmlTrapActivation(effectResults);
          effect.announce(html.toString(TrapTheme.css));
        })
        .catch(err => {
          sendChat('TrapTheme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }

      /**
       * Does a trap's attack roll.
       * @private
       */
      _doTrapAttack(character, effectResults) {
        return Promise.all([
          this.getAC(character),
          CharSheetUtils.rollAsync('1d20 + ' + effectResults.attack)
        ])
        .then(tuple => {
          let ac = tuple[0];
          let atkRoll = tuple[1];

          log(ac);

          ac = ac || 10;
          effectResults.ac = ac;
          effectResults.roll = atkRoll;
          effectResults.trapHit = atkRoll.total >= ac;
          return effectResults;
        });
      }

      /**
       * Does a trap's touch attack roll.
       * @private
       */
      _doTrapTouchAttack(character, effectResults) {
        return Promise.all([
          this.getTouchAC(character),
          CharSheetUtils.rollAsync('1d20 + ' + effectResults.attack)
        ])
        .then(tuple => {
          let ac = tuple[0] || 10;
          let roll = tuple[1];

          effectResults.ac = ac;
          effectResults.roll = roll;
          effectResults.trapHit = roll.total >= ac;
          return effectResults;
        });
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        return CharSheetUtils.getSheetAttr(character, 'armorclass');
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        if(!getAttrByName(character.get('_id'), 'spot'))
          createObj('attribute', {
            name: 'spot',
            current: 0,
            characterid: character.get('_id')
          });
        return CharSheetUtils.getSheetAttr(character, 'spot')
        .then(spot => {
          return spot + 10;
        });
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return CharSheetUtils.getSheetAttr(character, SAVE_NAMES[saveName]);
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let result = super.getThemeProperties(trapToken);
        let trapEffect = (new TrapEffect(trapToken)).json;

        // Modify the saving throw types.
        let save = _.find(result, item => {
          if (item.id === 'save') {
            item.properties[0].options = ['none', 'fort', 'ref', 'will'];
            return true;
          }
          return false;
        });

        // Rename the default passive detection property to "Spot".
        _.find(result, item => {
          if (item.id === 'spotDC') {
            item.name = 'Passive Spot DC';
            return true;
          }
          else
            return false;
        });

        // Modify "attack" to include both the attack bonus and the attack VS.
        _.find(result, item => {
          if (item.id === 'attack') {
            _.extend(item, {
              name: 'Attack Roll',
              value: (() => {
                let atkBonus = trapEffect.attack;
                let atkVs = trapEffect.attackVs;

                if (atkBonus && atkVs) {
                  return `+${atkBonus} vs ${atkVs}`;
                }
                else
                  return 'none';
              })(),
              properties: [
                {
                  id: 'bonus',
                  name: 'Attack Bonus',
                  desc: 'What is the trap attack bonus?'
                },
                {
                  id: 'vs',
                  name: 'AC type',
                  desc: 'Which AC is the attack against?',
                  options: ['AC', 'touch AC']
                }
              ]
            });
            return true;
          }
          else
            return false;
        });

        return result;
      }

      /**
       * @inheritdoc
       */
      getTouchAC(character) {
        return CharSheetUtils.getSheetAttr(character, 'touchac');
      }

      /**
       * Produces the HTML for a trap activation message for most d20 systems.
       * @param {object} effectResults
       * @return {HtmlBuilder}
       */
      static htmlTrapActivation(effectResults) {
        let content = new HtmlBuilder('div');

        // Add the flavor message.
        content.append('.paddedRow trapMessage', effectResults.message);

        if(effectResults.character) {

          var row = content.append('.paddedRow');
          row.append('span.bold', 'Target:');
          row.append('span', effectResults.character.get('name'));

          // Add the attack roll message.
          if(effectResults.attack) {
            let rollResult = D20TrapTheme.htmlRollResult(effectResults.roll, '1d20 + ' + effectResults.attack);
            let row = content.append('.paddedRow')

            if(effectResults.attackVs === 'touch AC') {
              row.append('span.bold', 'Attack roll:');
              row.append('span', rollResult);
              row.append('span', ' vs Touch AC ' + effectResults.ac);
            }
            else {
              row.append('span.bold', 'Attack roll:');
              row.append('span', rollResult);
              row.append('span', ' vs AC ' + effectResults.ac);
            }
          }

          // Add the saving throw message.
          if(effectResults.save) {
            let rollResult = D20TrapTheme.htmlRollResult(effectResults.roll, '1d20 + ' + effectResults.saveBonus);
            let saveMsg = new HtmlBuilder('.paddedRow');
            saveMsg.append('span.bold', effectResults.save.toUpperCase() + ' save:');
            saveMsg.append('span', rollResult);
            saveMsg.append('span', ' vs DC ' + effectResults.saveDC);

            // If the save result is a secret, whisper it to the GM.
            if(effectResults.hideSave)
              sendChat('Admiral Ackbar', '/w gm ' + saveMsg.toString(TrapTheme.css));
            else
              content.append(saveMsg);
          }

          // Add the hit/miss message.
          if(effectResults.trapHit) {
            let row = content.append('.paddedRow');
            row.append('span.hit', 'HIT! ');
            if(effectResults.damage)
              row.append('span', 'Damage: [[' + effectResults.damage + ']]');
            else
              row.append('span', 'You fall prey to the ' + (effectResults.type || 'trap') + '\'s effects!');
          }
          else {
            let row = content.append('.paddedRow');
            row.append('span.miss', 'MISS! ');
            if(effectResults.damage && effectResults.missHalf)
              row.append('span', 'Half damage: [[floor((' + effectResults.damage + ')/2)]].');
          }
        }

        return TrapTheme.htmlTable(content, '#a22', effectResults);
      }

      /**
       * @inheritdoc
       */
      modifyTrapProperty(trapToken, argv) {
        super.modifyTrapProperty(trapToken, argv);
        let trapEffect = (new TrapEffect(trapToken)).json;

        let prop = argv[0];
        let params = argv.slice(1);

        // Parse both the attack bonus and the attack type from the 'attack' property.
        if (prop === 'attack') {
          let atkBonus = parseInt(params[0]);
          let atkVs = params [1];

          if (!atkBonus && atkBonus !== 0) {
            trapEffect.attack = undefined;
            trapEffect.attackVs = undefined;
          }
          else {
            trapEffect.attack = atkBonus;
            trapEffect.attackVs = atkVs;
          }
        }

        trapToken.set('gmnotes', JSON.stringify(trapEffect));
      }
    }
    ItsATrap.registerTheme(new TrapThemeDnD3_5());
  });
})();
