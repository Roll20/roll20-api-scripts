(function() {

  /**
   * A theme for the 5th Edition OGL character sheet.
   * @implements ItsATrap#TrapTheme
   */
  var theme = {
    name: '5E-OGL',

    /**
     * Display the raw message and play the effect's sound.
     * @inheritdoc
     */
    activateEffect: function(effect) {
      var me = this;
      var charToken = getObj('graphic', effect.victimId);
      var character = getObj('character', charToken.get('represents'));

      var msg = '<table style="background-color: #fff; border: solid 1px #000; border-collapse: separate; border-radius: 10px; overflow: hidden; width: 100%;">';
      msg += "<thead><tr style='background-color: #000; color: #fff; font-weight: bold;'><th>IT'S A TRAP!!!</th></tr></thead>";
      msg += '<tbody>';
      msg += me.paddedRow(effect.message, 'background-color: #ccc; font-style: italic;');

      // Remind the GM about the trap's effects.
      if(effect.notes)
        sendChat('Admiral Ackbar', '/w gm Trap Effects:<br/> ' + effect.notes);

      // Automate trap attack/save mechanics.
      if(character) {

        // Does the trap make an attack vs AC?
        if(effect.attack) {
          me.getSheetAttrs(character, 'ac', function(values) {
            var ac = values.ac;
            me.rollAsync('1d20 + ' + effect.attack, function(atkRoll) {
              msg += me.paddedRow('<span style="font-weight: bold;">Attack roll:</span> ' +
                me.htmlRollResult(atkRoll, '1d20 + ' + effect.attack) + ' vs AC ' + ac);
              msg += me.paddedRow(me.resolveTrapHit(atkRoll.total >= ac, effect, character));

              msg += '</tbody></table>';
              sendChat('Admiral Ackbar', msg);
            });
          });
        }

        // Does the trap require a saving throw?
        else if(effect.save && effect.saveDC) {
          var saveAttr = me.getSaveAttrLongname(effect.save);
          me.getSheetAttrs(character, saveAttr, function(saves) {
            var saveBonus = saves[saveAttr];
            me.rollAsync('1d20 + ' + saveBonus, function(saveRoll) {
              var saveMsg = '<span style="font-weight: bold;">' + effect.save.toUpperCase() + ' save:</span> ' +
                me.htmlRollResult(saveRoll, '1d20 + ' + saveBonus) + ' vs DC ' + effect.saveDC;

              if(effect.hideSave)
                sendChat('Admiral Ackbar', '/w gm ' + saveMsg);
              else
                msg += me.paddedRow(saveMsg);
              msg += me.paddedRow(me.resolveTrapHit(saveRoll.total < effect.saveDC, effect, character));

              msg += '</tbody></table>';
              sendChat('Admiral Ackbar', msg);
            });
          });
        }

        // If neither, just send the basic message.
        else {
          msg += '</tbody></table>';
          sendChat('Admiral Ackbar', msg);
        }
      }

      // If the effect has a sound, try to play it.
      ItsATrap.playEffectSound(effect);

      // If the effect has an api command, execute it.
      ItsATrap.executeTrapCommand(effect);
    },

    /**
     * Gets the long name of a save bonus attribute.
     * @param  {string} shortname
     * @return {string}
     */
    getSaveAttrLongname: function(shortname) {
      if(shortname === 'str')
        return 'strength_save_bonus';
      else if(shortname === 'dex')
        return 'dexterity_save_bonus';
      else if(shortname === 'con')
        return 'constitution_save_bonus';
      else if(shortname === 'int')
        return 'intelligence_save_bonus';
      else if(shortname === 'wis')
        return 'wisdom_save_bonus';
      else
        return 'charisma_save_bonus';
    },


    /**
     * Asynchronously gets the values of one or more character sheet attributes.
     * @param  {Character}   character
     * @param  {(string|string[])}   attrNames
     * @param  {Function} callback
     *         The callback takes one parameter: a map of attribute names to their
     *         values.
     */
    getSheetAttrs: function(character, attrNames, callback) {
      var me = this;

      if(!_.isArray(attrNames))
        attrNames = [attrNames];

      var count = 0;
      var values = {};
      _.each(attrNames, function(attrName) {
        try {
          me.rollAsync('@{' + character.get('name') + '|' + attrName + '}', function(roll) {
            var attrValue = roll.total;
            values[attrName] = attrValue;
            count++;

            if(count === attrNames.length)
              callback(values);
          });
        }
        catch(err) {
          values[attrName] = undefined;
          count++;

          if(count === attrNames.length)
            callback(values);
        }
      });
    },

    /**
     * Produces HTML for a faked inline roll result.
     * @param  {int} result
     * @param  {string} expr
     * @return {string}
     */
    htmlRollResult: function(result, expr) {
      var d20 = result.rolls[0].results[0].v;

      var style = 'background-color: #FEF68E; cursor: help; font-size: 1.1em; font-weight: bold; padding: 0 3px;';
      if(d20 === 20)
        style += 'border: 2px solid #3FB315;';
      if(d20 === 1)
        style += 'border: 2px solid #B31515';

      return '<span title="' + expr + '" style="' + style + '">' + result.total + '</span>';
    },

    /**
     * Produces HTML for a padded table row.
     * @param  {string} innerHTML
     * @param  {string} style
     * @return {string}
     */
    paddedRow: function(innerHTML, style) {
      return '<tr><td style="padding: 1px 1em; ' + style + '">' + innerHTML + '</td></tr>';
    },

    /**
     * Display a message if the character is within 5 units of the trap.
     * @inheritdoc
     */
    passiveSearch: function(trap, charToken) {
      var effect = ItsATrap.getTrapEffect(charToken, trap);
      var character = getObj('character', charToken.get('represents'));

      // Only do passive search for traps that have a spotDC.
      if(effect.spotDC && character) {

        // Get the character's passive wisdom (perception).
        this.getSheetAttrs(character, 'passive_wisdom', function(values) {

          // If the character's passive wisdom beats the spot DC, then
          // display a message and mark the trap's trigger area.
          if(values['passive_wisdom'] >= effect.spotDC) {
            ItsATrap.noticeTrap(trap, "<span style='font-weight: bold;'>IT'S A TRAP!!!</span><br/>" +
              character.get('name') + ' notices a trap: <br/>' + trap.get('name'));
          }
        });
      }
    },

    /**
     * Resolves the hit/miss effect of a trap.
     * @param  {boolean} trapHit
     *         Whether the trap hit.
     * @param  {TrapEffect} effect
     * @param  {Character} character
     * @return {string}
     */
    resolveTrapHit: function(trapHit, effect, character) {
      var msg = '<div>';
      if(trapHit) {
        var msg = '<span style="color: #f00; font-weight: bold;">HIT! </span>';
        if(effect.damage)
          msg += 'Damage: [[' + effect.damage + ']]';
        else
          msg += character.get('name') + ' falls prey to the trap\'s effects!';
      }
      else {
        msg += '<span style="color: #620; font-weight: bold;">MISS! </span>';
        if(effect.damage && effect.missHalf)
          msg += 'Half damage: [[floor((' + effect.damage + ')/2)]].';
      }
      msg += '</div>';
      return msg;
    },

    /**
     * Asynchronously rolls a dice roll expression and returns the result's total in
     * a callback. The result is undefined if an invalid expression is given.
     * @param  {string} expr
     * @return {int}
     */
    rollAsync: function(expr, callback) {
      sendChat('ItsATrap-DnD5', '/w gm [[' + expr + ']]', function(msg) {
        try {
          var results = msg[0].inlinerolls[0].results;
          callback(results);
        }
        catch(err) {
          callback(undefined);
        }
      });
    }
  };

  // Register the theme with ItsATrap.
  var register = setInterval(function() {
    if(ItsATrap) {
      clearInterval(register);
      ItsATrap.registerTheme(theme);
    }
  }, 1000);
})();
