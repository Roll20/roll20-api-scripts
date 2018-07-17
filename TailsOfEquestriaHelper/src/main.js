(() => {
  'use strict';

  const CMD_EXPLODING_HOOF = '!tailsOfEquestriaHelper_explodingHoof';

  /**
   * Makes an exploding hoof roll.
   * @param {string} charName
   *        The name of the character making the roll.
   * @param {uint} startDie
   *        The type of die being rolled.
   */
  function rollExplodingHoof(charName, startDie) {
    return _rollExplodingHoof(startDie)
    .then(result => {
      let tpl = '&{template:toe} {{charName="' + charName + '"}} ' +
        '{{attr=Exploding Hoof: D' + startDie + '}} ' +
        '{{result=[[' + result + ']]}}';
      TailsOfEquestriaHelper._chat.broadcast(tpl, charName);
    })
    .catch(err => {
      TailsOfEquestriaHelper._chat.error(err);
    });
  }

  /**
   * Recursively rolls the Exploding Hoof dice.
   * @private
   */
  function _rollExplodingHoof(die, rolls) {
    rolls = rolls || [];

    let dice = [4, 6, 8, 10, 12, 20];
    let index =  dice.indexOf(die);
    if(index === -1)
      return Promise.reject(new Error('Die type not supported by exploding hooves: ' + die));

    return TailsOfEquestriaHelper._chat.rollAsync('1d' + die)
    .then(roll => {
      let result = roll.total;
      rolls.push(result);

      if(result === die && die < 20)
        return _rollExplodingHoof(dice[index + 1], rolls);
      else
        return `{${rolls.join(', ')}}k1`;
    });
  }

  // Interpret chat commands.
  on('chat:message', msg => {
    try {
      if(msg.type !== 'api')
        return;

      let argv = msg.content.split(' ');
      if(argv[0] === CMD_EXPLODING_HOOF) {
        let charName = argv.slice(1, -1).join(' ');
        let startDie = parseInt(argv.slice(-1));

        rollExplodingHoof(charName, startDie);
      }
    }
    catch(err) {
      TailsOfEquestriaHelper._chat.error(err);
    }
  });

  // When the API is loaded, install the Custom Status Marker menu macro
  // if it isn't already installed.
  on('ready', () => {
    log('ƱƱƱ Initialized Tails of Equestria Helper vSCRIPT_VERSION ƱƱƱ');
  });

  _.extend(TailsOfEquestriaHelper, {
    CMD_EXPLODING_HOOF,
    rollExplodingHoof
  });
})();
