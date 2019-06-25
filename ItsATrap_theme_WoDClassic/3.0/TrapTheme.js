(() => {
  'use strict';

  // A mapping of known attribute names for supported character sheets.
  const SHEET_ATTRS = {
    'Changeling: The Dreaming': {
      perception: 'Perception',
      alertness: 'Alertness'
    },
    'Demon: The Fallen': {
      perception: 'Perception',
      alertness: 'Alertness'
    },
    'Mage: The Ascension': {
      perception: 'Perception',
      alertness: 'Alertness'
    },
    'Vampire: The Masquerade': {
      perception: 'Perception',
      alertness: 'Alertness'
    },
    'Werewolf: The Apocalypse': {
      perception: 'Perception',
      alertness: 'Alertness'
    }
  };

  /**
   * Gets the value of a One-Click user option for this script.
   * @param {string} option
   * @return {any}
   */
  function getOption(option) {
    let options = globalconfig && globalconfig.itsatrapthemewodc;
    if(!options)
      options = (state.itsatrapthemewodc && state.itsatrapthemewodc.useroptions) || {};

    return options[option];
  }

  // Register the theme with ItsATrap.
  on('ready', () => {

    // Initialize state
    if(!state.itsatrapthemewodc)
      state.itsatrapthemewodc = {
        passPercAttempts: {}
      };

    /**
     * The concrete TrapTheme class.
     */
    class TrapThemeWoDC extends TrapTheme {

      /**
       * @inheritdoc
       */
      get name() {
        return 'WorldOfDarkness-Classic';
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

          return Promise.all([
            this.rollWodcDice(effectResults.attack),
            this.rollWodcDice(effectResults.damage)
          ])
          .then(values => {
            let [attack, damage] = values;
            _.extend(effectResults, { attack, damage });
            return effectResults;
          });
        })
        .then(effectResults => {
          let html = TrapThemeWoDC.htmlTrapActivation(effectResults);
          effect.announce(html.toString(TrapTheme.css));
        })
        .catch(err => {
          sendChat('TrapTheme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }

      /**
       * Gets Alertness for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getAlertnessDice(character) {
        let sheet = getOption('sheet');

        let attrName = getOption('alertness');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].alertness;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute ' +
            'for Alertness in the One-Click options.'));
      }

      /**
       * Gets Perception for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getPerceptionDice(character) {
        let sheet = getOption('sheet');

        let attrName = getOption('perception');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].perception;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute ' +
            'for Perception in the One-Click options.'));
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
            id: 'attack',
            name: 'Attack Dice',
            desc: `The number of dice rolled for the trap's attack.`,
            value: trapEffect.attack
          },
          {
            id: 'damage',
            name: 'Damage Dice',
            desc: `The number of dice rolled for the trap's pre-SOAK damage.`,
            value: trapEffect.damage
          },
          {
            id: 'perception',
            name: 'Passive Perception',
            desc: 'The number of successes a character must get in a Perception + Alertness roll to passively notice a trap. This is rolled automatically the first time a character comes within search range for the trap.',
            value: trapEffect.perception
          }
        ];
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
            let row = content.append('.paddedRow')
            row.append('span.bold', 'Attack Sucesses:');
            row.append('span', effectResults.attack);
            row = content.append('.paddedRow');
            row.append('span', 'Character must roll to dodge.');
          }

          // Add the pre-SOAK damage message.
          if(effectResults.damage) {
            let row = content.append('.paddedRow');
            row.append('span.bold', 'Pre-SOAK Damage:');
            row.append('span', effectResults.damage);
          }
        }

        return TrapTheme.htmlTable(content, '#a22', effectResults);
      }

      /**
       * @inheritdoc
       */
      modifyTrapProperty(trapToken, argv) {
        let trapEffect = (new TrapEffect(trapToken)).json;

        let prop = argv[0];
        let params = argv.slice(1);

        if(prop === 'attack')
          trapEffect.attack = params[0];
        if(prop === 'damage')
          trapEffect.damage = params[0];
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

        if(!effect.perception)
          return;

        // Check for a previous attempt.
        let attempts = state.itsatrapthemewodc.passPercAttempts;
        if(!attempts[trapId])
          attempts[trapId] = {};
        if(attempts[trapId][charId])
          return;
        else
          attempts[trapId][charId] = true;

        // Make the secret Perception + Alertness check.
        return Promise.all([
          this.getPerceptionDice(character),
          this.getAlertnessDice(character)
        ])
        .then(values => {
          let [perception, alertness] = values;
          if(!_.isNumber(perception))
            throw new Error('Passive Perception: Could not get Perception for Character ' + charToken.get('_id') + '.');
          if(!_.isNumber(alertness))
            throw new Error('Passive Perception: Could not get Alertness for Character ' + charToken.get('_id') + '.');

          return this.rollWodcDice(perception + alertness);
        })
        .then(searchResult => {
          return searchResult;
        })
        .then(total => {
          // Inform the GM about the Trap Spotter attempt.
          sendChat('Trap theme: ' + this.name, `/w gm ${character.get('name')} attempted to notice trap "${trap.get('name')}" with passive perception. Perception + Alertness ${total} vs ${effect.perception} successes.`);

          // Resolve whether the trap was spotted or not.
          if(total >= effect.perception) {
            log('Noticed a trap!');
            let html = TrapTheme.htmlNoticeTrap(character, trap);
            log(html);

            ItsATrap.noticeTrap(trap, html.toString(TrapTheme.css));
          }
          else
            log('Not noticed');
        })
        .catch(err => {
          sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }

      /**
       * Rolls a dice check for the World of Darkness (classic) system.
       * @param {int} dice The number of dice to roll.
       * @param {int} difficulty The minimum for each die to be a success.
       * @return {Promise<int>} The number of successes.
       */
      rollWodcDice(dice, difficulty=6) {
        if(dice && difficulty)
          return CharSheetUtils.rollAsync(`${dice}d10>${difficulty}`)
          .then(roll => {
            if(roll)
              return roll.total;
            else
              throw new Error('Could not resolve roll expression: ' + rollExpr);
          });
        else
          return Promise.resolve(undefined);
      }
    }
    ItsATrap.registerTheme(new TrapThemeWoDC());
  });

  // When a trap is deleted, remove it from the Trap Theme's persisted state.
  on('destroy:graphic', token => {
    let id = token.get('_id');
    if(state.itsatrapthemewodc.passPercAttempts[id])
      delete state.itsatrapthemewodc.passPercAttempts[id];
  });
})();
