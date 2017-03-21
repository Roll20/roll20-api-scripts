(() => {
  'use strict';

  // A mapping of known attribute names for supported character sheets.
  const SHEET_ATTRS = {
    'Pathfinder': {
      ac: 'AC',
      fortSaveModifier: 'Fort',
      refSaveModifier: 'Ref',
      willSaveModifier: 'Will',
      cmd: 'CMD',
      perceptionModifier: 'Perception',
      fnHasTrapSpotter: character => {
        TrapTheme.getSheetRepeatingRow(character, 'class-ability', rowAttrs => {
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
    'Pathfinder Simple': {
      ac: 'ac',
      fortSaveModifier: 'fort',
      refSaveModifier: 'ref',
      willSaveModifier: 'will',
      cmd: 'cmd',
      perceptionModifier: 'perception',
      fnHasTrapSpotter: character => {
        TrapTheme.getSheetRepeatingRow(character, 'classabilities', rowAttrs => {
          if(!rowAttrs.name)
            return false;

          let abilityName = rowAttrs.name.get('current');
          return abilityName.toLowerCase().includes('trap spotter');
        })
        .then(trapSpotter => {
          return !!trapSpotter;
        });
      }
    }
  };

  /**
   * Gets the value of a One-Click user option for this script.
   * @param {string} option
   * @return {any}
   */
  function getOption(option) {
    let options = globalconfig && globalconfig.itsatrapthemepathfinder;
    if(!options)
      options = (state.itsatrapthemepathfinder && state.itsatrapthemepathfinder.useroptions) || {};

    return options[option];
  }

  // Register the theme with ItsATrap.
  on('ready', () => {

    // Initialize state
    if(!state.itsatrapthemepathfinder)
      state.itsatrapthemepathfinder = {
        trapSpotterAttempts: {}
      };

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
       * Does a trap's Combat Maneuver roll.
       * @private
       */
      _doTrapCombatManeuver(character, effectResults) {
        return Promise.all([
          this.getCMD(character),
          TrapTheme.rollAsync('1d20 + ' + effectResults.cmb)
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
       * @inheritdoc
       */
      getAC(character) {
        let sheet = getOption('sheet');
        let attrName = getOption('ac');
        if(sheet)
          attrName = SHEET_ATTRS[sheet].ac

        if(attrName)
          return TrapTheme.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for AC in the One-Click options.'));
      }

      /**
       * Gets the Combat Maneuver Defense for a character.
       * @param {Character} character
       * @return {Promise<number>}
       */
      getCMD(character) {
        let sheet = getOption('sheet');
        let attrName = getOption('cmd');
        if(sheet)
          attrName = SHEET_ATTRS[sheet].cmd

        if(attrName)
          return TrapTheme.getSheetAttr(character, attrName);
        else
          return Promise.reject(new Error('Please provide name of the attribute for CMD in the One-Click options.'));
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
        if(sheet)
          attrName = SHEET_ATTRS[sheet].perceptionModifier;

        if(attrName)
          return TrapTheme.getSheetAttr(character, attrName);
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
        if(sheet)
          attrName = SHEET_ATTRS[sheet][key];

        if(attrName)
          return TrapTheme.getSheetAttr(character, attrName);
        else
          return Promise.reject('Please provide name of the attribute for ' +
            saveName + ' save modifier in the One-Click options.');
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let result = super.getThemeProperties(trapToken);
        let save = _.find(result, item => {
          return item.id === 'save';
        });
        save.options = [ 'none', 'fort', 'ref', 'will' ];
        return result;
      }

      /**
       * @inheritdoc
       * Also supports the Trap Spotter ability.
       */
      passiveSearch(trap, charToken) {
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
        let sheet = getOption('sheet');
        if(!sheet)
          return;

        // Use an implementation appropriate for the current character sheet.
        let hasTrapSpotter = getOption('fnHasTrapSpotter');

        // Check if the character has the Trap Spotter ability.
        if(hasTrapSpotter) {
          hasTrapSpotter(character)
          .then(hasIt => {

            // If they have it, make a secret Perception check.
            // Quit early if this character has already attempted to trap-spot
            // this trap.
            if(hasIt) {
              let trapId = trap.get('_id');
              let charId = trap.get('_id');

              // Check for a previous attempt.
              let attempts = state.itsatrapthemepathfinder.trapSpotterAttempts;
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
                  return TrapTheme.rollAsync(`1d20 + ${perception}`);
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
    ItsATrap.registerTheme(new TrapThemePFGeneric());
  });

  // When a trap is deleted, remove it from the Trap Theme's persisted state.
  on('destroy:graphic', token => {
    let id = token.get('_id');
    if(state.itsatrapthemepathfinder.trapSpotterAttempts[id])
      delete state.itsatrapthemepathfinder.trapSpotterAttempts[id];
  });
})();
