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

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the 5th Edition OGL character sheet.
     * @implements ItsATrap#TrapTheme
     */
    class TrapTheme5EShaped extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return '5E-Shaped';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
        return TrapTheme.getSheetAttr(character, 'AC');
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
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

          return TrapTheme.getSheetAttr(character, 'repeating_skill_' + rowId + '_passive');
        }
        else {
          return TrapTheme.resolve();
        }
      }

      /**
       * @inheritdoc
       */
      getSaveBonus(character, saveName) {
        return TrapTheme.getSheetAttr(character, SAVE_NAMES[saveName]);
      }
    }
    ItsATrap.registerTheme(new TrapTheme5EShaped());
  });
})();
