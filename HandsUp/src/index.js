var HandsUp = (() => {
  'use strict';

  /**
   * The hand-raising state for a player.
   * @typedef {object} HandState
   * @property {number} intervalId
   * @property {string} origColor
   */

  /**
   * A mapping of player IDs to their hand-raising state. The presence of a
   * key-value mapping for a player ID indicates that the player's hand
   * is raised.
   * @type {map<string, HandState>}
   */
  let raisedHands = {};

  /**
   * Gets the current speaking name for a player.
   * @param {Player} player
   * @return {string}
   */
  function _getSpeakingAsName(player) {
    // If speaking as a character, get the character's name.
    let speakingAs = player.get('speakingas');
    if (speakingAs) {
      let [type, id] = speakingAs.split('|');
      if (type === 'character') {
        let character = getObj('character', id);
        return character.get('name');
      }
    }

    // Otherwise, get the player's name.
    return player.get('_displayname');
  }

  /**
   * Lowers a player's hand.
   * @param {Player} player
   */
  function lowerHand(player) {
    let playerId = player.get('_id');
    let handState = raisedHands[playerId];

    // Restore the player's original state and remove them from the
    // raisedHands map.
    clearInterval(handState.intervalId);
    player.set('color', handState.origColor);
    delete raisedHands[playerId];

    let playerName = _getSpeakingAsName(player);
    HandsUp.utils.Chat.broadcast(`${playerName} lowered their hand.`);
  }

  /**
   * Raises a player's hand.
   * @param {Player} player
   */
  function raiseHand(player) {
    let playerId = player.get('_id');
    let origColor = player.get('color');

    // Start an interval that makes the player's icon color cycle through a
    // sequence of colors to get the GM's attention.
    let intervalId = setInterval(() => {
      let millis = Date.now();
      let frequency = 1000;
      let alpha = (millis / frequency) % 1;
      let [r, g, b] = HandsUp.utils.Colors.hsl2rgb(alpha, 1, 0.7);
      let color = `rgb(${r}, ${g}, ${b})`;
      player.set('color', color);
    }, 100);

    // Track the raised hand in our map.
    raisedHands[playerId] = {
      intervalId,
      origColor
    };

    let playerName = _getSpeakingAsName(player);
    HandsUp.utils.Chat.broadcast(`${playerName} raised their hand.`);
  }

  /**
   * Toggles a player's state for whether their hand is raised or not.
   */
  function toggleRaisedHand(player) {
    let playerId = player.get('_id');
    let handState = raisedHands[playerId];

    if (handState)
      lowerHand(player);
    else
      raiseHand(player);
  }

  on('ready', () => {
    HandsUp.Macros.installMacros();
    log('--- Initialized Hands Up vSCRIPT_VERSION ---');
  });

  return {
    lowerHand,
    raiseHand,
    toggleRaisedHand
  };
})();
