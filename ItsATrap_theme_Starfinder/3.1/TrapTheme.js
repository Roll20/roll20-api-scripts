(() => {
  'use strict';

  // A mapping of known attribute names for supported character sheets.
  const SHEET_ATTRS = {
    'Roll20': {
      kac: 'kac',
      eac: 'eac',
      fortSaveModifier: 'fort',
      refSaveModifier: 'ref',
      willSaveModifier: 'will',
      acm: 'cmd',
      starshipAC: 'ac',
      starshipTL: 'tl',
      perceptionModifier: 'perception'
    },
    'Simple': {
      kac: 'KAC',
      eac: 'EAC',
      fortSaveModifier: 'Fort',
      refSaveModifier: 'Ref',
      willSaveModifier: 'Will',
      acm: 'ACM',
      starshipAC: 'starship-ac-total',
      starshipTL: 'starship-tl-total',
      perceptionModifier: 'Perception'
    },
    custom: {}
  };

  /**
   * Get the state for this script, creating it for the first time if
   * necessary.
   * @return The state.
   */
  function getState() {
    if (!state.itsatrapthemestarfinder)
      state.itsatrapthemestarfinder = {
        sheet: undefined,
        trapSpotterAttempts: {}
      };
    return state.itsatrapthemestarfinder;
  }

  // Register the theme with ItsATrap.
  on('ready', () => {

    /**
     * The concrete TrapTheme class.
     */
    class TrapThemeStarfinder extends D20TrapTheme {

      /**
       * @inheritdoc
       */
      get name() {
        return 'Starfinder Generic';
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
              if(effectResults.attackVs === 'ACM')
                return this._doTrapCombatManeuver(character, effectResults);
              else if(effectResults.attackVs === 'EAC')
                return this._doTrapEACAttack(character, effectResults);
              else if(effectResults.attackVs === 'starship AC')
                return this._doTrapStarshipACAttack(character, effectResults);
              else if(effectResults.attackVs === 'starship TL')
                return this._doTrapStarshipTLAttack(character, effectResults);
              else
                return this._doTrapKACAttack(character, effectResults);
            else if(effectResults.save && effectResults.saveDC)
              return this._doTrapSave(character, effectResults);
          }
          return effectResults;
        })
        .then(effectResults => {
          let html = TrapThemeStarfinder.htmlTrapActivation(effectResults);
          effect.announce(html.toString(TrapTheme.css));
        })
        .catch(err => {
          sendChat('TrapTheme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }

      /**
       * Does a trap's Combat Maneuver roll.
       * @private
       */
      _doTrapCombatManeuver(character, effectResults) {
        return Promise.all([
          this.getACM(character),
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
       * Does a trap's attack vs Energy AC.
       * @private
       */
      _doTrapEACAttack(character, effectResults) {
        return Promise.all([
          this.getEAC(character),
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
       * Does a trap's attack vs Kinetic AC.
       * @private
       */
      _doTrapKACAttack(character, effectResults) {
        return Promise.all([
          this.getKAC(character),
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
       * Does a trap's attack vs starship AC.
       * @private
       */
      _doTrapStarshipACAttack(character, effectResults) {
        return Promise.all([
          this.getStarshipAC(character),
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
       * Does a trap's attack vs starship TL.
       * @private
       */
      _doTrapStarshipTLAttack(character, effectResults) {
        return Promise.all([
          this.getStarshipTL(character),
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
       * Gets the Combat Maneuver Defense for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getACM(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.acm;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getEAC(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.eac;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getKAC(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.kac;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getStarshipAC(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.starshipAC;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getStarshipTL(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.starshipTL;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return this.getPerceptionModifier(character)
        .then(value => {
          return value + 10;
        });
      }

      /**
       * Gets the Perception modifier for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getPerceptionModifier(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.perceptionModifier;
        return CharSheetUtils.getSheetAttr(character, attrName);
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let key = saveName + 'SaveModifier';
        let attrName = sheet[key];
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
            if (this._getSheetTryRoll20())
              this._cachedSheet = 'Roll20';
            else if (this._getSheetTrySimple())
              this._cachedSheet = 'Simple';
            else
              return undefined;

            log("Starfinder trap theme - auto-detected character sheet: " +
              this._cachedSheet);
          }
          return this._cachedSheet;
        }
      }

      /**
       * Try to auto-detect the Roll20 sheet.
       */
      _getSheetTryRoll20() {
        let result = findObjs({
          _type: 'attribute',
          name: 'sheet_type'
        })[0] &&
        findObjs({
          _type: 'attribute',
          name: 'tab_select'
        })[0];
        return !!result;
      }

      /**
       * Try to auto-detect the Roll20 sheet.
       */
      _getSheetTrySimple() {
        let result = findObjs({
          _type: 'attribute',
          name: 'STR_show_options'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'DEX_show_options'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'CON_show_options'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'INT_show_options'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'WIS_show_options'
        })[0] ||
        findObjs({
          _type: 'attribute',
          name: 'CHA_show_options'
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
                  ItsATrap.Chat.whisperGM('Could not auto-detect Starfinder character sheet ' +
                    'for your game. Please set it manually from the trap properties ' +
                    'menu under Theme-Specific Properties.');
                }, 100);
                return 'auto-detect';
              }
              return `${sheet}<br/>(auto-detected)`;
            }
          })(),
          options: ['Auto-detect', 'Roll20', 'Simple', 'custom']
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
                id: 'kac',
                name: 'Kinetic Armor Class',
                desc: 'Specify attribute name for Kinetic Armor Class.'
              },
              {
                id: 'eac',
                name: 'Energy Armor Class',
                desc: 'Specify attribute name for Energy Armor Class.'
              },
              {
                id: 'fortSaveModifier',
                name: 'Fort Save',
                desc: 'Specify attribute name for Fortitude saving throw modifier.'
              },
              {
                id: 'refSaveModifier',
                name: 'Reflex Save',
                desc: 'Specify attribute name for Reflex saving throw modifier.'
              },
              {
                id: 'willSaveModifier',
                name: 'Will Save',
                desc: 'Specify attribute name for Will saving throw modifier.'
              },
              {
                id: 'acm',
                name: 'AC vs Combat Maneuvers',
                desc: 'Specify attribute name for AC vs Combat Maneuvers.'
              },
              {
                id: 'starshipAC',
                name: 'Starship AC',
                desc: 'Specify attribute name for Starship AC.'
              },
              {
                id: 'starshipTL',
                name: 'Starship TL',
                desc: 'Specify attribute name for Starship TL.'
              },
              {
                id: 'perceptionModifier',
                name: 'Perception',
                desc: 'Specify attribute name for Perception skill modifier.'
              }
            ]
          });
        }

        // Insert a global property for enabling passive perception for
        // Starfinder (by default Starfinder doesn't have passive perception).
        result.splice(1, 0, {
          id: 'enablePassivePerception',
          name: 'Enable Passive Perception?',
          desc: 'Specify whether to globally enable passive perception for your Starfinder game.',
          value: (() => {
            if (getState().enablePassivePerception)
              return 'yes';
            else
              return 'no';
          })(),
          options: ['yes', 'no']
        });

        // Modify the saving throw types.
        _.find(result, item => {
          if (item.id === 'save') {
            item.properties[0].options = ['none', 'fort', 'ref', 'will'];
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
                  options: ['KAC', 'EAC', 'ACM', "starship AC", "starship TL"]
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

            if(effectResults.attackVs === 'ACM') {
              row.append('span.bold', 'Maneuver roll:');
              row.append('span', rollResult);
              row.append('span', ' vs ACM ' + effectResults.ac);
            }
            else if(effectResults.attackVs === 'EAC') {
              row.append('span.bold', 'Attack roll:');
              row.append('span', rollResult);
              row.append('span', ' vs EAC ' + effectResults.ac);
            }
            else if(effectResults.attackVs === 'starship AC') {
              row.append('span.bold', 'Attack roll:');
              row.append('span', rollResult);
              row.append('span', ' vs starship AC ' + effectResults.ac);
            }
            else if(effectResults.attackVs === 'starship TL') {
              row.append('span.bold', 'Attack roll:');
              row.append('span', rollResult);
              row.append('span', ' vs starship TL ' + effectResults.ac);
            }
            else {
              row.append('span.bold', 'Attack roll:');
              row.append('span', rollResult);
              row.append('span', ' vs KAC ' + effectResults.ac);
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
            kac: params[0],
            eac: params[1],
            fortSaveModifier: params[2],
            refSaveModifier: params[3],
            willSaveModifier: params[4],
            acm: params[5],
            starshipAC: params[6],
            starshipTL: params[7],
            perceptionModifier: params[8]
          };
        }

        if (prop === 'enablePassivePerception') {
          getState().enablePassivePerception = params[0] === 'yes';
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

      /**
       * @inheritdoc
       */
      passiveSearch(trap, charToken) {
        let passiveEnabled = getState().enablePassivePerception;
        if(passiveEnabled)
          super.passiveSearch(trap, charToken);
      }
    }

    // Register the trap theme and try to auto-detect the sheet being used.
    let themeInst = new TrapThemeStarfinder();
    ItsATrap.registerTheme(themeInst);
    themeInst.getSheet();

    // Notify user about updates.
    if (!getState().version) {
      getState().version = '3.1';
      sendChat("It's A Trap!", "/w gm <h2>Notice:</h2><p>The Starfinder trap theme has been updated to version 3.1. It now automatically detects which character sheet you're using so you don't have to set it yourself! Happy rolling!</p>");
    }
  });
})();
