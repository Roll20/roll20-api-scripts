(() => {
  'use strict';

  // A mapping of known attribute names for supported character sheets.
  const SHEET_ATTRS = {
    'Starfinder Simple': {
      kac: 'KAC',
      eac: 'EAC',
      fortSaveModifier: 'Fort',
      refSaveModifier: 'Ref',
      willSaveModifier: 'Will',
      acm: 'ACM',
      starshipAC: 'starship-ac-total',
      starshipTL: 'starship-tl-total',
      perceptionModifier: 'Perception'
    }
  };

  /**
   * Gets the value of a One-Click user option for this script.
   * @param {string} option
   * @return {any}
   */
  function getOption(option) {
    let options = globalconfig && globalconfig.itsatrapthemestarfinder;
    if(!options)
      options = (state.itsatrapthemestarfinder && state.itsatrapthemestarfinder.useroptions) || {};

    return options[option];
  }

  // Register the theme with ItsATrap.
  on('ready', () => {

    // Initialize state
    if(!state.itsatrapthemestarfinder)
      state.itsatrapthemestarfinder = {
        trapSpotterAttempts: {}
      };

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
        let sheet = getOption('sheet');
        let attrName = getOption('acm');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].acm

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for ACM in the One-Click options.'));
      }

      /**
       * @inheritdoc
       */
      getEAC(character) {
        let sheet = getOption('sheet');
        let attrName = getOption('eac');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].eac;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for EAC in the One-Click options.'));
      }

      /**
       * @inheritdoc
       */
      getKAC(character) {
        let sheet = getOption('sheet');
        let attrName = getOption('kac');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].kac;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for KAC in the One-Click options.'));
      }

      /**
       * @inheritdoc
       */
      getStarshipAC(character) {
        let sheet = getOption('sheet');
        let attrName = getOption('starshipAC');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].starshipAC;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for starship AC in the One-Click options.'));
      }

      /**
       * @inheritdoc
       */
      getStarshipTL(character) {
        let sheet = getOption('sheet');
        let attrName = getOption('starshipTL');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].starshipTL;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for starship TL in the One-Click options.'));
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
        let sheet = getOption('sheet');

        let attrName = getOption('perceptionModifier');
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet].perceptionModifier;

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute ' +
            'for the perception modifier in the One-Click options.'));
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        let sheet = getOption('sheet');
        let key = saveName + 'SaveModifier';
        let attrName = getOption(key);
        if(sheet && SHEET_ATTRS[sheet])
          attrName = SHEET_ATTRS[sheet][key];

        if(attrName)
          return CharSheetUtils.getSheetAttr(character, attrName);
        else
          return Promise.reject('Please provide name of the attribute for ' +
            saveName + ' save modifier in the One-Click options.');
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let result = super.getThemeProperties(trapToken);
        let trapEffect = (new TrapEffect(trapToken)).json;

        let save = _.find(result, item => {
          return item.id === 'save';
        });
        save.options = [ 'none', 'fort', 'ref', 'will' ];

        result.splice(1, 0, {
          id: 'attackVs',
          name: 'Attack vs',
          desc: 'If the trap makes an attack roll, what AC does it target?',
          value: trapEffect.attackVs || 'KAC',
          options: ['KAC', 'EAC', 'ACM', "starship AC", "starship TL"]
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

        if(prop === 'attackVs')
          trapEffect.attackVs = params[0];

        trapToken.set('gmnotes', JSON.stringify(trapEffect));
      }

      /**
       * @inheritdoc
       */
      passiveSearch(trap, charToken) {
        let passiveEnabled = getOption('enablePassivePerception') === '1';
        if(passiveEnabled)
          super.passiveSearch(trap, charToken);
      }
    }
    ItsATrap.registerTheme(new TrapThemeStarfinder());
  });
})();
