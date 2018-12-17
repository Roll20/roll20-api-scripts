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

  /**
   * A theme for the DnD 3.5 character sheet by Diana P..
   * @implements ItsATrap#TrapTheme
   */
  class TrapTheme {
    get name() {
      return 'DnD-3.5';
    }

    get css() {
      return TrapThemeHelper.THEME_CSS;
    }

    /**
     * Display the raw message and play the effect's sound.
     * @inheritdoc
     */
    activateEffect(effect) {
      let charToken = getObj('graphic', effect.victimId);
      let character = getObj('character', charToken.get('represents'));

      // Automate trap attack/save mechanics.
      Promise.resolve()
      .then(() => {
        effect.character = character;

        if(character) {
          if(effect.attack)
            return this._doTrapAttack(character, effect);
          else if(effect.save && effect.saveDC)
            return this._doTrapSave(character, effect);
        }
        return effect;
      })
      .then(effect => {
        let html = TrapThemeHelper.htmlActivateTrapD20(effect);
        ItsATrap.announceTrap(effect, html.toString(this.css));
      })
      .catch(err => {
        sendChat(CHAT_NAME, '/w gm ' + err.message);
        log(err.stack);
      });
    }

    /**
     * Does a trap's attack roll.
     * @private
     */
    _doTrapAttack(character, effect) {
      this._initAC(character);

      return Promise.all([
        TrapThemeHelper.getSheetAttr(character, 'armorclass'),
        TrapThemeHelper.rollAsync('1d20 + ' + effect.attack)
      ])
      .then(tuple => {
        let ac = tuple[0];
        let atkRoll = tuple[1];

        effect.ac = ac || '??';
        effect.roll = atkRoll;
        if(ac)
          effect.trapHit = atkRoll.total >= ac;
        else
          effect.trapHit = 'AC unknown';

        return effect;
      });
    }

    /**
     * Does a trap's save.
     * @private
     */
    _doTrapSave(character, effect) {
      return TrapThemeHelper.getSheetAttr(character, SAVE_NAMES[effect.save])
      .then(saveBonus => {
        saveBonus = saveBonus || 0;
        effect.saveBonus = saveBonus;
        return TrapThemeHelper.rollAsync('1d20 + ' + saveBonus);
      })
      .then(saveRoll => {
        effect.roll = saveRoll;
        effect.trapHit = saveRoll.total < effect.saveDC;
        return effect;
      });
    }

    _initAC(character) {
      // Due to some weirdness with how computed attributes are calculated
      // in the API, perception_type needs to be set or else
      // passive_wisdom will be undefined, even though it works fine
      // in macros.
      var ac = findObjs({
        _type: 'attribute',
        _characterid: character.get('_id'),
        name: 'armorclass'
      })[0];
      if(!ac)
        createObj('attribute', {
          _characterid: character.get('_id'),
          name: 'armorclass',
          current: 0
        });
    }

    /**
     * Display a message if the character is within 5 units of the trap.
     * @inheritdoc
     */
    passiveSearch(trap, charToken) {
      let effect = ItsATrap.getTrapEffect(charToken, trap);
      let character = getObj('character', charToken.get('represents'));

      // Only do passive search for traps that have a spotDC.
      if(effect.spotDC && character) {

        // If the character's passive wisdom beats the spot DC, then
        // display a message and mark the trap's trigger area.
        TrapThemeHelper.getSheetAttr(character, 'spot')
        .then((spot) => {
          if(spot + 10 >= effect.spotDC) {
            let html = TrapThemeHelper.htmlNoticeTrap(character, trap);
            ItsATrap.noticeTrap(trap, html.toString(this.css));
          }
        })
        .catch(err => {
          sendChat(CHAT_NAME, '/w gm ' + err.message);
          log(err.stack);
        });
      }
    }
  }

  // Register the theme with ItsATrap.
  on('ready', () => {
    ItsATrap.registerTheme(new TrapTheme());
  });
})();
