/**
 * Base class for TrapThemes using D&D 4E-ish rules.
 * @abstract
 */
var D20TrapTheme4E = (() => {
  'use strict';

  return class D20TrapTheme4E extends D20TrapTheme {

    /**
     * @inheritdoc
     */
    activateEffect(effect) {
      let character = getObj('character', effect.victim.get('represents'));
      let effectResult = effect.json;

      Promise.resolve()
      .then(() => {
        effectResult.character = character;

        // Automate trap attack mechanics.
        if(character && effectResult.defense && effectResult.attack) {
          return Promise.all([
            this.getDefense(character, effectResult.defense),
            TrapTheme.rollAsync('1d20 + ' + effectResult.attack)
          ])
          .then(tuple => {
            let defenseValue = tuple[0];
            let attackRoll = tuple[1];

            defenseValue = defenseValue || 0;
            effectResult.defenseValue = defenseValue;
            effectResult.roll = attackRoll;
            effectResult.trapHit = attackRoll.total >= defenseValue;
            return effectResult;
          });
        }
        return effectResult;
      })
      .then(effectResult => {
        let html = D20TrapTheme4E.htmlTrapActivation(effectResult);
        effect.announce(html.toString(TrapTheme.css));
      })
      .catch(err => {
        sendChat('Trap theme: ' + this.name, '/w gm ' + err.message);
        log(err.stack);
      });
    }

    /**
     * Gets the value for one of a character's defenses.
     * @param {Character} character
     * @param {string} defenseName
     * @return {Promise<int>}
     */
    getDefense(character, defenseName) {
      throw new Error('Not implemented.');
    }

    /**
     * Creates the HTML for an activated trap's result.
     * @param  {object} effectResult
     * @return {HtmlBuilder}
     */
    static htmlTrapActivation(effectResult) {
      let content = new HtmlBuilder('div');

      // Add the flavor message.
      content.append('.paddedRow trapMessage', effectResult.message);

      if(effectResult.character) {

        // Add the attack roll message.
        if(_.isNumber(effectResult.attack)) {
          let rollHtml = D20TrapTheme.htmlRollResult(effectResult.roll, '1d20 + ' + effectResult.attack);
          let row = content.append('.paddedRow');
          row.append('span.bold', 'Attack roll: ');
          row.append('span', rollHtml + ' vs ' + effectResult.defense + ' ' + effectResult.defenseValue);
        }

        // Add the hit/miss message.
        if(effectResult.trapHit) {
          let row = content.append('.paddedRow');
          row.append('span.hit', 'HIT! ');
          if(effectResult.damage)
            row.append('span', 'Damage: [[' + effectResult.damage + ']]');
          else
            row.append('span', effectResult.character.get('name') + ' falls prey to the trap\'s effects!');
        }
        else {
          let row = content.append('.paddedRow');
          row.append('span.miss', 'MISS! ');
          if(effectResult.damage && effectResult.missHalf)
            row.append('span', 'Half damage: [[floor((' + effectResult.damage + ')/2)]].');
        }
      }

      return TrapTheme.htmlTable(content, '#a22', effectResult);
    }
  };
})();
