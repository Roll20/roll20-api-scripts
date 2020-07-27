(() => {
  'use strict';

  // A mapping of known attribute names for supported character sheets.
  const SHEET_ATTRS = {
    'Community': {
      ac: 'AC',
      touch: 'Touch',
      fortSaveModifier: 'Fort',
      refSaveModifier: 'Ref',
      willSaveModifier: 'Will',
      cmd: 'CMD',
      perceptionModifier: 'Perception',
      fnHasTrapSpotter: character => {
        return CharSheetUtils.getSheetRepeatingRow(character, 'class-ability', rowAttrs => {
          if(!rowAttrs.name)
            return false;

          let abilityName = rowAttrs.name.get('current');
          return abilityName.toLowerCase().includes('trap spotter');
        })
        .then(trapSpotter => {
          // If it wasn't in the 'class-ability' repeating section, try
          // getting it from the 'ability' repeating section.
          if(!trapSpotter) {
            return CharSheetUtils.getSheetRepeatingRow(character, 'ability', rowAttrs => {
              if(!rowAttrs.name)
                return false;

              let abilityName = rowAttrs.name.get('current');
              return abilityName.toLowerCase().includes('trap spotter');
            })
            .then(trapSpotter => {
              return !!trapSpotter;
            })
          }
          else
            return true;
        });
      }
    },
    'Roll20': {
      ac: 'ac',
      touch: 'ac_touch',
      fortSaveModifier: 'fortitude',
      refSaveModifier: 'reflex',
      willSaveModifier: 'will',
      cmd: 'cmd_mod',
      perceptionModifier: 'perception',
      fnHasTrapSpotter: character => {
        return CharSheetUtils.getSheetRepeatingRow(character, 'abilities', rowAttrs => {
          if(!rowAttrs.name)
            return false;

          let abilityName = rowAttrs.name.get('current');
          return abilityName.toLowerCase().includes('trap spotter');
        })
        .then(trapSpotter => {
          return !!trapSpotter;
        });
      }
    },
    'Simple': {
      ac: 'ac',
      touch: 'ac_touch',
      fortSaveModifier: 'fort',
      refSaveModifier: 'ref',
      willSaveModifier: 'will',
      cmd: 'cmd',
      perceptionModifier: 'perception',
      fnHasTrapSpotter: character => {
        return CharSheetUtils.getSheetRepeatingRow(character, 'classabilities', rowAttrs => {
          if(!rowAttrs.name)
            return false;

          let abilityName = rowAttrs.name.get('current');
          return abilityName.toLowerCase().includes('trap spotter');
        })
        .then(trapSpotter => {
          return !!trapSpotter;
        });
      }
    },
    custom: {}
  };

  /**
   * Get the state for this script, creating it for the first time if
   * necessary.
   * @return The state.
   */
  function getState() {
    if (!state.itsatrapthemepathfinder)
      state.itsatrapthemepathfinder = {
        sheet: undefined,
        trapSpotterAttempts: {}
      };
    return state.itsatrapthemepathfinder;
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * The concrete TrapTheme class.
     */
    class TrapThemePFGeneric extends D20TrapTheme {

      /**
       * @inheritdoc
       */
      get name() {
        return 'Pathfinder-Generic';
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
              if(effectResults.attackVs === 'CMD')
                return this._doTrapCombatManeuver(character, effectResults);
              else if(effectResults.attackVs === 'touch AC')
                return this._doTrapTouchAttack(character, effectResults);
              else
                return this._doTrapAttack(character, effectResults);
            else if(effectResults.save && effectResults.saveDC)
              return this._doTrapSave(character, effectResults);
          }
          return effectResults;
        })
        .then(effectResults => {
          let html = TrapThemePFGeneric.htmlTrapActivation(effectResults);
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
          this.getCMD(character),
          CharSheetUtils.rollAsync('1d20 + ' + effectResults.attack)
        ])
        .then(tuple => {
          let cmd = tuple[0] || 10;
          let roll = tuple[1];

          effectResults.cmd = cmd;
          effectResults.roll = roll;
          effectResults.trapHit = roll.total >= cmd;
          return effectResults;
        });
      }

      /**
       * Does a trap's Combat Maneuver roll.
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
       * Gets the Combat Maneuver Defense for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getCMD(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.cmd;
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
            else if (this._getSheetTryCommunity())
              this._cachedSheet = 'Community';
            else if (this._getSheetTrySimple())
              this._cachedSheet = 'Simple';
            else
              return undefined;

            log("Pathfinder trap theme - auto-detected character sheet: " +
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
          name: 'initialize_character_flag'
        })[0];
        return !!result;
      }

      /**
       * Try to auto-detect the Community sheet.
       */
      _getSheetTryCommunity() {
        let result = findObjs({
          _type: 'attribute',
          name: 'PFSheet_Version'
        })[0];
        return !!result;
      }

      /**
       * Try to auto-detect the "Simple" sheet.
       */
      _getSheetTrySimple() {
        let result = _.find(findObjs({
          _type: 'attribute',
          name: 'character_sheet'
        }), attr => {
          return attr.get('current').startsWith("Pathfinder_Simple");
        })
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
                  ItsATrap.Chat.whisperGM('Could not auto-detect Pathfinder character sheet ' +
                    'for your game. Please set it manually from the trap properties ' +
                    'menu under Theme-Specific Properties.');
                }, 100);
                return 'auto-detect';
              }
              return `${sheet}<br/>(auto-detected)`;
            }
          })(),
          options: ['Auto-detect', 'Roll20', 'Community', 'Simple', 'custom']
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
                id: 'fortSaveModifier',
                name: 'Fortitude',
                desc: 'Specify attribute name for Fortitude saving throw modifier.'
              },
              {
                id: 'refSaveModifier',
                name: 'Reflex',
                desc: 'Specify attribute name for Reflex saving throw modifier.'
              },
              {
                id: 'willSaveModifier',
                name: 'Will',
                desc: 'Specify attribute name for Will saving throw modifier.'
              },
              {
                id: 'cmd',
                name: 'Will',
                desc: 'Specify attribute name for CMD.'
              },
              {
                id: 'perceptionModifier',
                name: 'Spot',
                desc: 'Specify attribute name for Perception skill modifier.'
              }
            ]
          });
        }

        // Insert a global property for enabling passive perception for
        // Pathfinder (by default Pathfinder doesn't have passive perception).
        result.splice(1, 0, {
          id: 'enablePassivePerception',
          name: 'Enable Passive Perception?',
          desc: 'Specify whether to globally enable passive perception for your Pathfinder game.',
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
                  options: ['AC', 'CMD', 'touch AC']
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

        let attrName = sheet.touch;
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

            if(effectResults.attackVs === 'CMD') {
              row.append('span.bold', 'Maneuver roll:');
              row.append('span', rollResult);
              row.append('span', ' vs CMD ' + effectResults.cmd);
            }
            else if(effectResults.attackVs === 'touch AC') {
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
          if(effectResults.trapHit === 'AC unknown') {
            content.append('.paddedRow', 'AC could not be determined with the current version of your character sheet. For the time being, please resolve the attack against AC manually.');
            if(effectResults.damage)
              content.append('.paddedRow', 'Damage: [[' + effectResults.damage + ']]');
          }
          else if(effectResults.trapHit) {
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
            fortSaveModifier: params[2],
            refSaveModifier: params[3],
            willSaveModifier: params[4],
            cmd: params[5],
            perceptionModifier: params[6]
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
       * Also supports the Trap Spotter ability.
       */
      passiveSearch(trap, charToken) {
        let passiveEnabled = getState().enablePassivePerception;
        if(passiveEnabled)
          super.passiveSearch(trap, charToken);

        let character = getObj('character', charToken.get('represents'));
        let effect = (new TrapEffect(trap, charToken)).json;

        // Perform automated behavior for Trap Spotter.
        let isTrap = effect.type === 'trap' || _.isUndefined(effect.type);
        if(isTrap && effect.spotDC && character) {
          if(ItsATrap.getSearchDistance(trap, charToken) <= 10)
            this._trapSpotter(character, trap, effect);
        }
      }

      /**
       * Generic Trap Spotter behavior.
       * @private
       */
      _trapSpotter(character, trap, effect) {
        // Trap spotter only works with supported character sheets.
        let sheet = this.getSheet();
        if (sheet === 'custom')
          return;

        // Use an implementation appropriate for the current character sheet.
        let hasTrapSpotter = SHEET_ATTRS[sheet].fnHasTrapSpotter;

        // Check if the character has the Trap Spotter ability.
        if(hasTrapSpotter) {
          hasTrapSpotter(character)
          .then(hasIt => {

            // If they have it, make a secret Perception check.
            // Quit early if this character has already attempted to trap-spot
            // this trap.
            if(hasIt) {
              let trapId = trap.get('_id');
              let charId = character.get('_id');

              // Check for a previous attempt.
              let attempts = getState().trapSpotterAttempts;
              if(!attempts[trapId])
                attempts[trapId] = {};
              if(attempts[trapId][charId])
                return;
              else
                attempts[trapId][charId] = true;

              // Make the secret Perception check.
              return this.getPerceptionModifier(character)
              .then(perception => {
                if(_.isNumber(perception))
                  return CharSheetUtils.rollAsync(`1d20 + ${perception}`);
                else
                  throw new Error('Trap Spotter: Could not get Perception value for Character ' + charToken.get('_id') + '.');
              })
              .then(searchResult => {
                return searchResult.total;
              })
              .then(total => {
                // Inform the GM about the Trap Spotter attempt.
                sendChat('Trap theme: ' + this.name, `/w gm ${character.get('name')} attempted to notice trap "${trap.get('name')}" with Trap Spotter ability. Perception ${total} vs DC ${effect.spotDC}`);

                // Resolve whether the trap was spotted or not.
                if(total >= effect.spotDC) {
                  let html = TrapTheme.htmlNoticeTrap(character, trap);
                  ItsATrap.noticeTrap(trap, html.toString(TrapTheme.css));
                }
              });
            }
          })
          .catch(err => {
            sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
            log(err.stack);
          });
        }
      }
    }

    // Register the trap theme and try to auto-detect the sheet being used.
    let themeInst = new TrapThemePFGeneric();
    ItsATrap.registerTheme(themeInst);
    themeInst.getSheet();

    // Notify user about updates.
    if (!getState().version) {
      getState().version = '3.6';
      sendChat("It's A Trap!", "/w gm <h2>Notice:</h2><p>The Pathfinder trap theme has been updated to version 3.6. It now automatically detects which character sheet you're using so you don't have to set it yourself! Happy rolling!</p>");
    }
  });

  // When a trap is deleted, remove it from the Trap Theme's persisted state.
  on('destroy:graphic', token => {
    try {
      let id = token.get('_id');
      if(getState().trapSpotterAttempts[id])
        delete getState().trapSpotterAttempts[id];
    }
    catch(err) {
      log('ERROR - TrapTheme Pathfinder:');
      log(err.stack);
    }
  });
})();
