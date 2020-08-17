(() => {
  'use strict';

  // A mapping of known attribute names for supported character sheets.
  const SHEET_ATTRS = {
    'Roll20': {
      perception: 'perception'
    },
    custom: {}
  };

  /**
   * Get the state for this script, creating it for the first time if
   * necessary.
   * @return The state.
   */
  function getState() {
    if (!state.itsatrapthemeburnbryte)
      state.itsatrapthemeburnbryte = {
        sheet: undefined,
        trapSpotterAttempts: {}
      };
    return state.itsatrapthemeburnbryte;
  }

  // Register the theme with ItsATrap.
  on('ready', () => {

    /**
     * The concrete TrapTheme class.
     */
    class TrapThemeBurnBryte extends TrapTheme {

      /**
       * @inheritdoc
       */
      get name() {
        return 'BurnBryte';
      }

      /**
       * @inheritdoc
       */
      activateEffect(effect) {
        let character = getObj('character', effect.victim.get('represents'));
        let effectResults = effect.json;

        // Automate trap attack/damage mechanics.
        Promise.resolve()
        .then(() => {
          effectResults.character = character;
        })
        .then(() => {
          return TrapThemeBurnBryte.htmlTrapActivation(effectResults);
        })
        .then(html => {
          effect.announce(html.toString(TrapTheme.css));
        })
        .catch(err => {
          sendChat('TrapTheme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }

      /**
       * Gets Perception for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getPerceptionDice(character) {
        let sheet = this.getSheet();
        sheet = SHEET_ATTRS[sheet];

        let attrName = sheet.perception;
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
            else
              return undefined;

            log("Burn Bryte trap theme - auto-detected character sheet: " +
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
          name: 'skill_edit_mental'
        })[0];
        return !!result;
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let trapEffect = (new TrapEffect(trapToken)).json;

        let LPAREN = '&#40;';
        let RPAREN = '&#41;';

        let LBRACE = '&#91;';
        let RBRACE = '&#93;';

        return [
          {
            id: 'complexity',
            name: 'Attack Complexity',
            desc: `The complexity for skill rolls to avoid the trap's attack.`,
            value: trapEffect.complexity
          },
          {
            id: 'onHit',
            name: 'On Hit',
            desc: 'What happens to the target if they fail their skill roll?',
            value: trapEffect.onHit
          },
          {
            id: 'perception',
            name: 'Perception Complexity',
            desc: 'Set to 2 or higher to enable passive perception.',
            value: trapEffect.perception
          }
        ];
      }

      /**
       * Produces the HTML for a trap activation message.
       * @param {object} effectResults
       * @return {Promise<HtmlBuilder>}
       */
      static htmlTrapActivation(effectResults) {
        return TrapThemeBurnBryte.rollFailurePrompt()
        .then(failPrompt => {
          let content = new HtmlBuilder('div');

          // Add the flavor message.
          content.append('.paddedRow trapMessage', effectResults.message);

          if(effectResults.character) {
            let row = content.append('.paddedRow');
            row.append('span.bold', 'Target:', {
              style: {
                'padding-right': '1em'
              }
            });
            row.append('span', effectResults.character.get('name'));

            // Add the complexity message.
            if(effectResults.complexity) {
              let row = content.append('.paddedRow')
              row.append('span.bold', 'Complexity:', {
                style: {
                  'padding-right': '1em'
                }
              });
              row.append('span', effectResults.complexity);

              if (effectResults.onHit) {
                // If we're using the prompt, replace the onHit message with
                // whatever we rolled from the table.
                let onHit = effectResults.onHit;
                if (onHit.toLowerCase() === 'prompt')
                  onHit = failPrompt;

                let row = content.append('.paddedRow')
                row.append('span.bold', 'Oh Hit:', {
                  style: {
                    'padding-right': '1em'
                  }
                });
                row.append('span', onHit);
              }
            }
          }

          return TrapTheme.htmlTable(content, '#a22', effectResults);
        });
      }

      /**
       * @inheritdoc
       */
      modifyTrapProperty(trapToken, argv) {
        let trapEffect = (new TrapEffect(trapToken)).json;

        let prop = argv[0];
        let params = argv.slice(1);

        if(prop === 'complexity')
          trapEffect.complexity = params[0];
        if(prop === 'onHit')
          trapEffect.onHit = params[0];
        if(prop === 'perception')
          trapEffect.perception = params[0];

        trapToken.set('gmnotes', JSON.stringify(trapEffect));
      }

      /**
       * @inheritdoc
       */
      passiveSearch(trap, charToken) {
        let effect = (new TrapEffect(trap, charToken)).json;
        let character = getObj('character', charToken.get('represents'));
        let charId = character.get('_id');
        let trapId = trap.get('_id');

        if(!effect.perception || effect.perception < 2)
          return;

        // Check for a previous attempt.
        let attempts = state.itsatrapthemeburnbryte.passPercAttempts;
        if(!attempts[trapId])
          attempts[trapId] = {};
        if(attempts[trapId][charId])
          return;
        else
          attempts[trapId][charId] = true;

        // Make the secret Perception + Alertness check.
        return this.getPerceptionDice(character)
        .then(perception => {
          if(!_.isNumber(perception))
            throw new Error('Passive Perception: Could not get Perception for Character ' + charToken.get('_id') + '.');

          return TrapThemeBurnBryte.rollBurnBryteDice(perception, effect.perception);
        })
        .then(result => {
          // Inform the GM about the Perception attempt.
          sendChat('Trap theme: ' + this.name, `/w gm ${character.get('name')} attempted to notice trap "${trap.get('name')}" with passive perception. Perception ${result.dice} vs complexity ${effect.perception}`);

          // Resolve whether the trap was spotted or not.
          if(result.pass) {
            let html = TrapTheme.htmlNoticeTrap(character, trap);
            ItsATrap.noticeTrap(trap, html.toString(TrapTheme.css));
          }
        })
        .catch(err => {
          sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }

      /**
       * Roll a skill check for the Burn Bryte system.
       * @param {int} diceSize The size of the dice to roll.
       * @param {int} complexity The complexity for the skill roll.
       * @return {BurnBryteDiceResult} The result object containing the dice
       * rolls and whether it's a pass or fail.
       */
      static rollBurnBryteDice(diceSize, complexity=2) {
        if (diceSize && complexity) {
          return CharSheetUtils.rollAsync(`${complexity}d${diceSize}mt`)
          .then(roll => {
            if (roll) {
              let dice = _.map(roll.rolls[0].results, result => {
                return result.v;
              });
              let pass = _.size(roll.rolls[0].mods.match.matches) === 0;
              return {dice, pass};
            }
            else
              throw new Error('Could not resolve dice.');
          });
        }
        else
          return Promise.resolve(undefined);
      }

      /**
       * Roll some result from the Burn Bryte Failure-Prompts table.
       * @return {Promise<string>}
       */
      static rollFailurePrompt() {
        // Make sure the Failure-Prompts table exists!
        let table = findObjs({
          _type: 'rollabletable',
          name: 'Failure-Prompts'
        })[0];
        if (!table)
          throw new Error(`Failure-Prompts table doesn't exist.`);

        return CharSheetUtils.rollAsync(`1t[Failure-Prompts]`)
        .then(roll => {
          return roll.rolls[0].results[0].tableItem.name;
        });
      }
    }

    // Register the trap theme and try to auto-detect the sheet being used.
    let themeInst = new TrapThemeBurnBryte();
    ItsATrap.registerTheme(themeInst);
    themeInst.getSheet();

    // Notify user about updates.
    if (!getState().version) {
      getState().version = '3.0';
    }
  });

  // When a trap is deleted, remove it from the Trap Theme's persisted state.
  on('destroy:graphic', token => {
    let id = token.get('_id');
    if(state.itsatrapthemeburnbryte.passPercAttempts[id])
      delete state.itsatrapthemeburnbryte.passPercAttempts[id];
  });
})();
