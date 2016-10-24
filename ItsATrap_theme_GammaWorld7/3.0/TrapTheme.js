(() => {
  'use strict';

  // A mapping of saving throw short names to their attribute names.
  const DEFENSE_NAMES = {
    'ac': 'AC',
    'fort': 'fortitude',
    'ref': 'reflex',
    'will': 'will'
  };

  // Register the theme with ItsATrap.
  on('ready', () => {
    /**
     * A theme for the Gamma World 7E character sheet.
     */
    class TrapThemeGW extends D20TrapTheme4E {
      /**
       * @inheritdoc
       */
      get name() {
        return 'GammaWorld7';
      }

      /**
       * @inheritdoc
       */
      getDefense(character, defenseName) {
        log(defenseName);
        return TrapTheme.getSheetAttr(character, DEFENSE_NAMES[defenseName]);
      }

      /**
       * @inheritdoc
       */
      getPassivePerception(character) {
        return TrapTheme.getSheetAttr(character, 'perception');
      }

      /**
       * @inheritdoc
       */
      getThemeProperties(trapToken) {
        let trapEffect = (new TrapEffect(trapToken)).json;
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
            id: 'defense',
            name: 'Defense',
            desc: `The defense targeted by the trap's attack.`,
            value: trapEffect.defense,
            options: [ 'none', 'ac', 'fort', 'ref', 'will' ]
          },
          {
            id: 'missHalf',
            name: 'Miss - Half Damage',
            desc: 'Does the trap deal half damage on a miss?',
            value: trapEffect.missHalf ? 'yes' : 'no',
            options: ['yes', 'no']
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
        if(prop === 'defense')
          trapEffect.defense = params[0] === 'none' ? undefined : params[0];
        if(prop === 'missHalf')
          trapEffect.missHalf = params[0] === 'yes';
        if(prop === 'spotDC')
          trapEffect.spotDC = parseInt(params[0]);

        trapToken.set('gmnotes', JSON.stringify(trapEffect));
      }
    }
    ItsATrap.registerTheme(new TrapThemeGW());
  });
})();
