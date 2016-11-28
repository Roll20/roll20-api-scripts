/**
 * Provides a dice rolling command specialized for MLP: RiM season 4 edition.
 * The syntax for the command is
 * !r {skill name} [+/- ad hoc Advantages/Drawbacks] ["Any ad hoc notes about the skill roll"]
 *
 * e.g.
 * !r Mathematics +1 "+2 if used as part of a spell"
 *
 * The skill name is case-insensitive and supports shortened names. For example
 * instead of rolling "!r spellcasting", you can roll "!r spell".
 *
 * In order to roll a skill check for a character, you must be currently
 * speaking as that character.
 */
RiM4Dice = (function() {

    var cmd = "!r ";

    /**
     * Gets all the skill attributes for a character.
     * @param {Character} character
     * @return {Map<string, Skill>}
     *         The map of skill names to their skill data.
     */
    function getAllSkills(character) {
        var skillsJSONAttr = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: 'skillsJSON'
        })[0];
        return JSON.parse(skillsJSONAttr.get('current'));
    }

    /**
     * Gets the character the player is currently speaking as.
     * @param {String} playerId     The player's ID.
     * @return {Character}
     */
    function getCharacter(playerId) {
        var player = findObjs({
          _type: 'player',
          _id: playerId
        })[0];

        var speakingAs = player.get('speakingas') || player.get('_displayname');
        if(speakingAs.indexOf('player') === 0)
            throw new Error('You are not currently speaking as a character.');
        else if(speakingAs.indexOf('character') === 0) {
            var characterId = speakingAs.replace('character|', '');
            return findObjs({
              _type: 'character',
              _id: characterId
            })[0];
        }
        else {
            var character = findObjs({
                _type: 'character',
                name: speakingAs
            })[0];
            if(character)
                return character;
            else
                throw new Error('Bad speakingas value: ' + speakingAs);
        }
    }

    /**
     * Gets information about a skill.
     * @param {Character} character
     * @param {String} name
     *        The name of the skill.
     * @return {Skill}
     */
    function getSkill(character, name) {
        var skills = getAllSkills(character);
        return _.find(skills, function(value, key) {
            name = name.toLowerCase().trim();
            key = key.toLowerCase().trim();
            return key.indexOf(name) === 0;
        });
    }


    /**
     * Parses the Advantage/Disadvantage total from an expression of
     * of +N advantages and -N disadvantages. E.g. "+2 -1 + 4"
     * @return {int}
     */
    function parseAdvDis(expr) {
      if(!expr)
        return 0;

      expr = expr.replace(' ', '');
      var total = 0;
      var regex = /([+]|-)(\d+)/g

      // Get the first match.
      var match = regex.exec(expr);
      while(match) {
        if(match[1] === '+')
          total += parseInt(match[2]);
        else
          total -= parseInt(match[2]);

        // Get the next match.
        match = regex.exec(expr);
      }

      return total;
    }

    /**
     * An object representing a skillcheck.
     * @typedef {object} SkillCheck
     * @property {string} skillName   The name of the skill, or what its name starts with.
     * @property {int} advDis   The total Advantage/Disadvantage modifier.
     * @property {string} notes  A string appended to the roll's notes.
     */

   /**
    * An object representing a skill and its attributes.
    * @typedef {object} Skill
    * @property {string} name
    *           The skill's name.
    * @property {string} attr
    *           The skill's primary attribute.
    * @property {boolean} trained
    *           Whether the character has Skill Training for the skill.
    * @property {boolean} improved
    *           Whether the character has Improved Skill Training for the skill.
    * @property {boolean} greater
    *           Whether the character has Greater Skill Training for the skill.
    * @property {int} advDis
    *           The character's current Advantage/Disadvantage total for the skill.
    * @property {int} misc
    *           The total modifier from miscelaneous bonuses and penalties.
    * @property {string} notes
    *           Notes about conditional modifiers for the skill.
    */


    /**
     * Rolls a skill check for a character using the skillcheck template.
     * @param {Character} character
     * @param  {(string|SkillCheck)} skillCheck
     * @param {Function} [callback]
     *        A callback with the roll result and the dice roll expression.
     */
    function rollSkillCheck(character, skillCheck, callback) {
      var charName = character.get('name');
      if(_.isString(skillCheck))
        skillCheck = {
          skillName: skillCheck,
          advDis: 0
        };

      var skill = getSkill(character, skillCheck.skillName);
      if(!skill) {
        if(callback)
          callback(undefined);
        return;
      }

      // Get the primary attribute value.
      var attrValue = findObjs({
        _type: 'attribute',
        _characterid: character.get('_id'),
        name: skill.attr
      })[0].get('current');

      // Combine the skill notes with ad hoc notes.
      var notes = skill.notes;
      if(skillCheck.notes) {
        if(skill.notes)
          notes += '<br>'
        notes += skillCheck.notes;
      }

      // Get the total Adv/Dis string.
      var advDis = (skill.advDis || 0) + (skillCheck.advDis || 0);
      if(advDis >= 0)
        advDis = '+' + advDis;

      // Determine training dice to roll.
      var training = 'untrained';
      var dice = '2d6';
      if(skill.greater) {
        training = 'greater';
        dice = '4d6d2';
      }
      else if(skill.improved) {
        training = 'improved';
        dice = '4d6d2';
      }
      else if(skill.trained) {
        training = 'trained';
        dice = '3d6d1';
      }

      // Build the inline roll string.
      var roll = '{{ ' + dice + ' ' + advDis + ', 12 + 1d0}kl1, 2 + 1d0}kh1 ';
      if(skill.greater) {
        roll += '+1 [G] ';
      }
      roll += ' +' + attrValue + '[' + skill.attr + '] + ' + skill.misc;

      // Build the roll template string.
      var templateStr = '&{template:skillcheck} {{charName=' + charName + '}} ';
      templateStr += '{{skillName=' + skill.name + '}} {{result=[[' + roll + ']]}} ';
      templateStr += '{{' + training + '=true}} ';
      if(notes) {
        templateStr += '{{notes=' + notes + '}}';
      }

      // Roll it!
      if(callback)
        sendChat(character.get('name'), templateStr, function(msg) {
          try {
            var results = msg[0].inlinerolls[0].results;
            callback(results, roll);
          }
          catch(err) {
            callback(undefined, roll);
          }
        });
      else
        sendChat(character.get('name'), templateStr);
    }

    on("chat:message", function(msg) {
        try {
            if(msg.type == "api" && msg.content.indexOf(cmd) !== -1) {
                var playerId = msg.playerid;
                var character = getCharacter(playerId);
                var str = msg.content.replace(cmd, "");

                var skillsJSONAttr = findObjs({
                  _type: 'attribute',
                  _characterid: character.get('_id'),
                  name: 'skillsJSON'
                })[0];

                // Process the roll command as a regular expression.
                //
                // group 1 is the skill name.
                // group 2 is the advantage/disadvantage modifier.
                // group 6 is a string appended to the notes for the roll.
                var regex = /([^+\-\\"]+)(( *([+]|-) *\d+)*)? *("(.*?)")?/;
                var match = regex.exec(str);

                var skillName = match[1].trim().toLowerCase();
                var advDis = parseAdvDis(match[2]);
                var notes = match[6];

                if(match) {
                    var skillCheck = {
                        skillName: skillName,
                        advDis: advDis,
                        notes: notes
                    };
                    rollSkillCheck(character, skillCheck);
                }
                else
                    throw new Error('Bad roll format. Expected format: {skill name} [+/- Advantage/Disadvantage modifier] ["any notes about the roll"]');
            }
        }
        catch(err) {
            sendChat("ERROR", "/w " + msg.who + " Error processing roll: " + msg.content);
            log('MLP Dice ERROR: ' + err.message);
        }

    });

    return {
      getAllSkills: getAllSkills,
      getSkill: getSkill,
      rollSkillCheck: rollSkillCheck
    };
})();
