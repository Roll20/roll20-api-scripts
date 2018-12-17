(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-PF-Simple';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    'fort': 'fort',
    'ref': 'ref',
    'will': 'will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {

    // Initialize state
    if(!state.TrapThemePFSimple)
      state.TrapThemePFSimple = {
        trapSpotterAttempts: {}
      };

    /**
     * A theme for the Pathfinder (Simple) OGL character sheet by Stephen L..
     */
    class TrapThemePFSimple extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return 'PF-Simple';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        return TrapTheme.getSheetAttr(character, 'ac');
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return TrapTheme.getSheetAttr(character, 'perception')
        .then(perception => {
          return perception + 10;
        });
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName]);
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
        if((effect.type === 'trap' || _.isUndefined(effect.type)) && effect.spotDC && character) {
          TrapTheme.getSheetRepeatingRow(character, 'classabilities', rowAttrs => {
            if(!rowAttrs.name)
              return false;

            let abilityName = rowAttrs.name.get('current');
            return abilityName.toLowerCase().includes('trap spotter');
          })
          .then(trapSpotter => {
            let dist = ItsATrap.getSearchDistance(trap, charToken);
            if(trapSpotter && dist <= 10)
              this._trapSpotter(character, trap, effect);
          })
          .catch(err => {
            sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
            log(err.stack);
          });
        }
      }

      /**
       * Trap Spotter behavior.
       * @private
       */
      _trapSpotter(character, trap, effect) {
        // Quit early if this character has already attempted to trap-spot
        // this trap.
        let trapId = trap.get('_id');
        let charId = trap.get('_id');
        if(!state.TrapThemePFSimple.trapSpotterAttempts[trapId])
          state.TrapThemePFSimple.trapSpotterAttempts[trapId] = {};
        if(state.TrapThemePFSimple.trapSpotterAttempts[trapId][charId])
          return;
        else
          state.TrapThemePFSimple.trapSpotterAttempts[trapId][charId] = true;

        // Make a hidden Perception check to try to notice the trap.
        TrapTheme.getSheetAttr(character, 'perception')
        .then(perception => {
          if(_.isNumber(perception)) {
            return TrapTheme.rollAsync(`1d20 + ${perception}`);
          }
          else
            throw new Error('Trap Spotter: Could not get Perception value for Character ' + charToken.get('_id') + '.');
        })
        .then(searchResult => {
          // Inform the GM about the Trap Spotter attempt.
          sendChat('Trap theme: ' + this.name, `/w gm ${character.get('name')} attempted to notice trap "${trap.get('name')}" with Trap Spotter ability. Perception ${searchResult.total} vs DC ${effect.spotDC}`);

          // Resolve whether the trap was spotted or not.
          if(searchResult.total >= effect.spotDC) {
            let html = TrapTheme.htmlNoticeTrap(character, trap);
            ItsATrap.noticeTrap(trap, html.toString(TrapTheme.css));
          }
        })
        .catch(err => {
          sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
          log(err.stack);
        });
      }
    }

    ItsATrap.registerTheme(new TrapThemePFSimple());
  });
})();
