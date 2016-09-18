(() => {
  'use strict';

  // A mapping of saving throw short names to their attribute names.
  const DEFENSE_NAMES = {
    'ac': 'AC',
    'fort': 'fortitude',
    'ref': 'reflex',
    'will': 'will'
  };


  /**
   * Sends an HTML-stylized message about an activated trap.
   * @param  {object} effect
   */
  function htmlActivateTrap(effect) {
    let content = new HtmlBuilder('div');

    // Add the flavor message.
    content.append('.paddedRow trapMessage', effect.message);

    if(effect.character) {

      // Add the attack roll message.
      if(effect.attack) {
        let rollHtml = TrapThemeHelper.htmlRollResultD20(effect.roll, '1d20 + ' + effect.attack);
        let row = content.append('.paddedRow');
        row.append('span.bold', 'Attack roll: ');
        row.append('span', rollHtml + ' vs ' + DEFENSE_NAMES[effect.defense] + ' ' + effect.defenseValue)
      }

      // Add the hit/miss message.
      if(effect.trapHit) {
        let row = content.append('.paddedRow');
        row.append('span.hit', 'HIT! ');
        if(effect.damage)
          row.append('span', 'Damage: [[' + effect.damage + ']]');
        else
          row.append('span', effect.character.get('name') + ' falls prey to the trap\'s effects!');
      }
      else {
        let row = content.append('.paddedRow');
        row.append('span.miss', 'MISS! ');
        if(effect.damage && effect.missHalf)
          row.append('span', 'Half damage: [[floor((' + effect.damage + ')/2)]].');
      }
    }

    return TrapThemeHelper.htmlTable(content, '#a22');
  }


  /**
   * A theme for the Gamma World 7E character sheet.
   * @implements ItsATrap#TrapTheme
   */
  class TrapTheme {
    get name() {
      return 'GammaWorld7';
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

      Promise.resolve()
      .then(() => {
        effect.character = character;

        // Automate trap attack mechanics.
        if(character && effect.defense && effect.attack) {
          return Promise.all([
            TrapThemeHelper.getSheetAttr(character, DEFENSE_NAMES[effect.defense]),
            TrapThemeHelper.rollAsync('1d20 + ' + effect.attack)
          ])
          .then(tuple => {
            let defenseValue = tuple[0];
            let attackRoll = tuple[1];

            defenseValue = defenseValue || 0;
            effect.defenseValue = defenseValue;
            effect.roll = attackRoll;
            effect.trapHit = attackRoll.total >= defenseValue;
            return effect;
          });
        }
        return effect;
      })
      .then(effect => {
        let html = htmlActivateTrap(effect);
        ItsATrap.announceTrap(effect, html.toString(this.css));
      })
      .catch(err => {
        sendChat(CHAT_NAME, '/w gm ' + err.message);
        log(err.stack);
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

        // If the character's passive perception beats the spot DC, then
        // display a message and mark the trap's trigger area.
        return TrapThemeHelper.getSheetAttr(character, 'perception')
        .then(passPerc => {
          if(passPerc + 10 >= effect.spotDC) {
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
