(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-5E-Shaped';

  // A mapping of saving throw short names to their attribute names.
  const SAVE_NAMES = {
    'str': 'strength_saving_throw_mod_with_sign',
    'dex': 'dexterity_saving_throw_mod_with_sign',
    'con': 'constitution_saving_throw_mod_with_sign',
    'int': 'intelligence_saving_throw_mod_with_sign',
    'wis': 'wisdom_saving_throw_mod_with_sign',
    'cha': 'charisma_saving_throw_mod_with_sign'
  };

  /**
   * Gets the total Armor Class for a character.
   * @param  {Character}   character
   * @return {number}
   */
  function getAC(character) {
   return parseInt(getAttrByName(character.get('_id'), 'AC'));
  }

  /**
   * Gets the passive perception for a character. It is assumed that
   * Perception is the 12th skill in the character's skill list.
   * @param  {Character}   character
   * @return {number}
   */
  function getPassivePerception(character) {
    let skills = filterObjs(function(o) {
      return o.get('type') === 'attribute' &&
        o.get('characterid') === character.get('_id') &&
        /repeating_skill_(-([0-9a-zA-Z\-_](?!_storage))+?|\$\d+?)_name/.test(o.get('name'));
    });
    let skill = _.find(skills, function(skill) {
      return skill.get('current').toLowerCase().trim() === 'perception';
    });
    if(skill) {
      let attrName = skill.get('name');
      let idStart = attrName.indexOf('_', attrName.indexOf('_') + 1) + 1;
      let idEnd = attrName.lastIndexOf('_');
      let rowId = attrName.substring(idStart, idEnd);

      let perception = getAttrByName(character.get('_id'), 'repeating_skill_' + rowId + '_passive');
      return parseInt(perception);
    }
    else {
      return undefined;
    }
  }

  /**
   * A theme for the 5th Edition OGL character sheet.
   * @implements ItsATrap#TrapTheme
   */
  class TrapTheme {
    get name() {
      return '5E-Shaped';
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
        if(character) {
          effect.character = character;

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
      let ac = getAC(character);
      effect.ac = ac;

      return TrapThemeHelper.rollAsync('1d20 + ' + effect.attack)
      .then((atkRoll) => {
        effect.roll = atkRoll;
        effect.trapHit = atkRoll.total >= ac;
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
        effect.saveBonus = saveBonus;
        return TrapThemeHelper.rollAsync('1d20 + ' + saveBonus);
      })
      .then(saveRoll => {
        effect.roll = saveRoll;
        effect.trapHit = saveRoll.total < effect.saveDC;
        return effect;
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
        Promise.resolve(getPassivePerception(character))
        .then((passPerc) => {
          if(passPerc >= effect.spotDC) {
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
