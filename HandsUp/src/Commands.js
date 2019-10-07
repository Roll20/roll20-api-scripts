(() => {
  'use strict';

  const RAISE_HAND_CMD = '!HandsUp_raiseHand';

  /**
   * Process a command from a player to raise or lower their hand.
   * @param {ChatMessage} msg
   */
  function cmdRaiseHand(msg) {
    let player = getObj('player', msg.playerid);
    HandsUp.toggleRaisedHand(player);
  }

  /**
   * Process commands for this script.
   */
  on('chat:message', msg => {
    try {
      if (msg.type === 'api') {
        let argv = msg.content.split(' ');
        if (argv[0] === RAISE_HAND_CMD)
          cmdRaiseHand(msg);
      }
    }
    catch (err) {
      HandsUp.utils.Chat.error(err);
    }
  });

  HandsUp.Commands = {
    RAISE_HAND_CMD
  };
})();
