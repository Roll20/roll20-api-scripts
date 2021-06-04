(function() {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-DnD-3.5';

  const SHEET_ATTRS = {
    DianaP: {
      ac: 'armorclass',
      touch: 'touchac',
      fort: 'fortitude',
      ref: 'reflex',
      will: 'will',
      spot: 'spot'
    },
    AdventurePack: {
      ac: 'AC',
      touch: 'AC',
      fort: 'FORT',
      ref: 'REFL',
      will: 'WILL',
      spot: 'spot'
    },
    BlackCompany: {
      ac: 'armorclass',
      touch: 'touchac',
      fort: 'fortitude',
      ref: 'reflex',
      will: 'will',
      spot: 'spot'
    },
    custom: {}
  };

  /**
   * Get the state for this script, creating it for the first time if
   * necessary.
   * @return The state.
   */
  function getState() {
    if (!state.TrapThemeDnD3_5)
      state.TrapThemeDnD3_5 = {
        sheet: undefined
      };
    return state.TrapThemeDnD3_5;
  }

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
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.ac;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.spot;
        return CharSheetUtils.getSheetAttr(character, attrName)
        .then(spot => {
          return spot + 10;
        });
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet[saveName];
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * Get the name of the character sheet being used, either by
       * auto-detecting it, or having it set manually.
       * @return The character sheet name.
       */
      getSheet() {
        let name = getState().sheet;
        if (name) {
          // If we're using a custom sheet, update the cached attributes from
          // the state.
          if (name === 'custom') {
            if (!getState().customAttrs)
              getState().customAttrs = {};
            SHEET_ATTRS.custom = getState().customAttrs;
          }
          return name;
        }
        else {
          if (!this._cachedSheet) {
            if (this._getSheetTryDianaP())
              this._cachedSheet = 'DianaP';
            else if (this._getSheetTryAdventurePack())
              this._cachedSheet = 'AdventurePack';
            else if (this._getSheetTryBlackCompany())
              this._cachedSheet = 'BlackCompany';
            else
              return undefined;

            log("D&D 3.5 trap theme - auto-detected character sheet: " +
              this._cachedSheet);
          }
          return this._cachedSheet;
        }
      }

      /**
       * Try to auto-detect the Diana P sheet.
       */
      _getSheetTryDianaP() {
        let result = _.find(findObjs({
          _type: 'attribute',
          name: 'character_sheet'
        }), attr => {
          return attr.get('current').startsWith('D&D3.5');
        });
        return !!result;
      }

      /**
       * Try to auto-detect the Adventure Pack sheet.
       */
      _getSheetTryAdventurePack() {
        let result = findObjs({
          _type: 'attribute',
          name: 'STR'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'DEX'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'CON'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'INT'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'WIS'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'CHA'
        })[0];
        return !!result;
      }

      /**
       * Try to auto-detect the Black Company sheet.
       */
      _getSheetTryBlackCompany() {
        let result = findObjs({
          _type: 'attribute',
          name: 'str-base'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'dex-base'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'con-base'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'int-base'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'wis-base'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'cha-base'
        })[0];
        return !!result;
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let result = super.getThemeProperties(trapToken);
        let trapEffect = (new TrapEffect(trapToken)).json;

        // Prepend an option for specifying the character sheet.
        result.unshift({
          id: 'sheet',
          name: 'Character Sheet',
          desc: 'Specify the character sheet used in your game.',
          value: (() => {
            let sheet = getState().sheet;
            if (sheet)
              return sheet;
            else {
              sheet = this.getSheet();
              if (!sheet) {
                setTimeout(() => {
                  ItsATrap.Chat.whisperGM('Could not auto-detect D&D 3.5E character sheet ' +
                    'for your game. Please set it manually from the trap properties ' +
                    'menu under Theme-Specific Properties.');
                }, 100);
                return 'auto-detect';
              }
              return `${sheet}<br/>(auto-detected)`;
            }
          })(),
          options: ['Auto-detect', 'DianaP', 'AdventurePack', 'BlackCompany', 'custom']
        });

        // If the user is using a custom sheet or just bare-bones attributes,
        // display another property to specify the attribute names.
        if (this.getSheet() === 'custom') {
          result.splice(1, 0, {
            id: 'customAttrs',
            name: 'Custom Sheet Attrs',
            desc: (() => {
              let attrKeys = _.keys(SHEET_ATTRS.custom);
              if (_.size(attrKeys) === 0)
                return 'Custom attributes not specified!';
              else {
                attrKeys.sort();
                let result = '';
                _.each(attrKeys, key => {
                  let value = SHEET_ATTRS.custom[key];
                  result += `${key}: ${value}<br/>`;
                })
                return result;
              }
            })(),
            value: 'Mouse-over to view current settings.',
            properties: [
              {
                id: 'ac',
                name: 'Armor Class',
                desc: 'Specify attribute name for Armor Class.'
              },
              {
                id: 'touch',
                name: 'Touch AC',
                desc: 'Specify attribute name for Touch AC.'
              },
              {
                id: 'fort',
                name: 'Fortitude',
                desc: 'Specify attribute name for Fortitude saving throw modifier.'
              },
              {
                id: 'reflex',
                name: 'Reflex',
                desc: 'Specify attribute name for Reflex saving throw modifier.'
              },
              {
                id: 'will',
                name: 'Will',
                desc: 'Specify attribute name for Will saving throw modifier.'
              },
              {
                id: 'spot',
                name: 'Spot',
                desc: 'Specify attribute name for Spot skill modifier.'
              }
            ]
          });
        }

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
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet['touch'];
        return CharSheetUtils.getSheetAttr(character, attrName);
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

        if (prop === 'sheet') {
          if (params[0] === 'Auto-detect')
            getState().sheet = undefined;
          else
            getState().sheet = params[0];
        }

        if (prop === 'customAttrs') {
          SHEET_ATTRS.custom = getState().customAttrs = {
            ac: params[0],
            touch: params[1],
            fort: params[2],
            ref: params[3],
            will: params[4],
            spot: params[5]
          };
        }

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

    // Register the trap theme and try to auto-detect the sheet being used.
    let themeInst = new TrapThemeDnD3_5();
    ItsATrap.registerTheme(themeInst);
    try {
      themeInst.getSheet();
    }
    catch (err) {
      // This is fine. It could be a new game where APIs are set up but players
      // haven't made their characters yet.
      _.noop(err);
    }

    // Notify user about updates.
    if (!getState().version) {
      getState().version = '3.2';
      sendChat("It's A Trap!", "/w gm <h2>Notice:</h2><p>The D&D 3.5 trap theme has been updated to version 3.2. It now automatically detects which character sheet you're using so you don't have to set it yourself! Happy rolling!</p>");
    }
  });
})();
