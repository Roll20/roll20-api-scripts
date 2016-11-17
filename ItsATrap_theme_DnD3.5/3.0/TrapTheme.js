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

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the DnD 3.5 character sheet by Diana P..
     */
    class TrapThemeDnD3_5 extends D20TrapTheme {
      /**
       * @inheritdoc
       */
      get name() {
        return 'DnD-3.5';
      }

      /**
       * @inheritdoc
       */
      getAC(character) {
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

        return TrapTheme.getSheetAttr(character, 'armorclass');
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        if(!getAttrByName(character.get('_id'), 'spot'))
          createObj('attribute', {
            name: 'spot',
            current: 0,
            characterid: character.get('_id')
          });
        return TrapTheme.getSheetAttr(character, 'spot')
        .then(spot => {
          return spot + 10;
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
    }
    ItsATrap.registerTheme(new TrapThemeDnD3_5());
  });
})();
