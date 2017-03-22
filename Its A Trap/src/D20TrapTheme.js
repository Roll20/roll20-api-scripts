/**
 * A base class for trap themes using the D20 system (D&D 3.5, 4E, 5E, Pathfinder, etc.)
 * @abstract
 */
var D20TrapTheme = (() => {
  'use strict';

  return class D20TrapTheme extends TrapTheme {

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
            return this._doTrapAttack(character, effectResults);
          else if(effectResults.save && effectResults.saveDC)
            return this._doTrapSave(character, effectResults);
        }
        return effectResults;
      })
      .then(effectResults => {
        let html = D20TrapTheme.htmlTrapActivation(effectResults);
        effect.announce(html.toString(TrapTheme.css));
      })
      .catch(err => {
        sendChat('TrapTheme: ' + this.name, '/w gm ' + err.message);
        log(err.stack);
      });
    }

    /**
     * Does a trap's attack roll.
     * @private
     */
    _doTrapAttack(character, effectResults) {
      return Promise.all([
        this.getAC(character),
        TrapTheme.rollAsync('1d20 + ' + effectResults.attack)
      ])
      .then(tuple => {
        let ac = tuple[0];
        let atkRoll = tuple[1];

        ac = ac || 10;
        effectResults.ac = ac;
        effectResults.roll = atkRoll;
        effectResults.trapHit = atkRoll.total >= ac;
        return effectResults;
      });
    }

    /**
     * Does a trap's save.
     * @private
     */
    _doTrapSave(character, effectResults) {
      return this.getSaveBonus(character, effectResults.save)
      .then(saveBonus => {
        saveBonus = saveBonus || 0;
        effectResults.saveBonus = saveBonus;
        return TrapTheme.rollAsync('1d20 + ' + saveBonus);
      })
      .then((saveRoll) => {
        effectResults.roll = saveRoll;
        effectResults.trapHit = saveRoll.total < effectResults.saveDC;
        return effectResults;
      });
    }

    /**
     * Gets a character's AC.
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getAC(character) {
      throw new Error('Not implemented.');
    }

    /**
     * Gets a character's passive wisdom (Perception).
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getPassivePerception(character) {
      throw new Error('Not implemented.');
    }

    /**
     * Gets a character's saving throw bonus.
     * @abstract
     * @param {Character} character
     * @return {Promise<int>}
     */
    getSaveBonus(character, saveName) {
      throw new Error('Not implemented.');
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
          name: 'Attack Bonus',
          desc: `The trap's attack roll bonus vs AC.`,
          value: trapEffect.attack
        },
        {
          id: 'damage',
          name: 'Damage',
          desc: `The dice roll expression for the trap's damage.`,
          value: trapEffect.damage
        },
        {
          id: 'hideSave',
          name: 'Hide Save Result',
          desc: 'Show the Saving Throw result only to the GM?',
          value: trapEffect.hideSave ? 'yes' : 'no',
          options: ['yes', 'no']
        },
        {
          id: 'missHalf',
          name: 'Miss - Half Damage',
          desc: 'Does the trap deal half damage on a miss?',
          value: trapEffect.missHalf ? 'yes' : 'no',
          options: ['yes', 'no']
        },
        {
          id: 'save',
          name: 'Saving Throw',
          desc: 'The type of saving throw used by the trap.',
          value: trapEffect.save,
          options: [ 'none', 'str', 'dex', 'con', 'int', 'wis', 'cha' ]
        },
        {
          id: 'saveDC',
          name: 'Saving Throw DC',
          desc: `The DC for the trap's saving throw.`,
          value: trapEffect.saveDC
        },
        {
          id: 'spotDC',
          name: 'Spot DC',
          desc: 'The skill check DC to spot the trap.',
          value: trapEffect.spotDC
        }
      ];
    }

    /**
     * Produces HTML for a faked inline roll result for d20 systems.
     * @param  {int} result
     * @param  {string} tooltip
     * @return {HtmlBuilder}
     */
    static htmlRollResult(result, tooltip) {
      let d20 = result.rolls[0].results[0].v;

      let clazzes = ['rollResult'];
      if(d20 === 20)
        clazzes.push('critSuccess');
      if(d20 === 1)
        clazzes.push('critFail');
      return new HtmlBuilder('span.' + clazzes.join(' '), result.total, {
        title: tooltip
      });
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
          content.append('.paddedRow')
            .append('span.bold', 'Attack roll:')
            .append('span', rollResult)
            .append('span', ' vs AC ' + effectResults.ac);
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
      let trapEffect = (new TrapEffect(trapToken)).json;

      let prop = argv[0];
      let params = argv.slice(1);

      log(prop);
      log(params);

      if(prop === 'attack')
        trapEffect.attack = parseInt(params[0]);
      if(prop === 'damage')
        trapEffect.damage = params[0];
      if(prop === 'hideSave')
        trapEffect.hideSave = params[0] === 'yes';
      if(prop === 'missHalf')
        trapEffect.missHalf = params[0] === 'yes';
      if(prop === 'save')
        trapEffect.save = params[0] === 'none' ? undefined : params[0];
      if(prop === 'saveDC')
        trapEffect.saveDC = parseInt(params[0]);
      if(prop === 'spotDC')
        trapEffect.spotDC = parseInt(params[0]);

      trapToken.set('gmnotes', JSON.stringify(trapEffect));
    }

    /**
     * @inheritdoc
     */
    passiveSearch(trap, charToken) {
      let effect = (new TrapEffect(trap, charToken)).json;
      let character = getObj('character', charToken.get('represents'));

      // Only do passive search for traps that have a spotDC.
      if(effect.spotDC && character) {

        // If the character's passive perception beats the spot DC, then
        // display a message and mark the trap's trigger area.
        return this.getPassivePerception(character)
        .then(passWis => {
          if(passWis >= effect.spotDC) {
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
  };
})();
