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
    log('--- Initialized Hands Up v1.0.0 ---');
  });

  return {
    lowerHand,
    raiseHand,
    toggleRaisedHand
  };
})();

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

(() => {
  'use strict';

  /**
   * Installs a macro for a player.
   * @param {Player} player
   * @param {string} macroName
   * @param {string} action
   */
  function _installMacro(player, macroName, action) {
    let playerId = player.get('_id');

    // Check for an existing macro.
    let macro = findObjs({
      _type: 'macro',
      name: macroName,
      _playerid: playerId
    })[0];

    // Update if it exists.
    if (macro)
      macro.set('action', action);

    // Otherwise, install it.
    else {
      createObj('macro', {
        _playerid: playerId,
        name: macroName,
        action: action
      });
    }
  }

  /**
   * Module for installing this script's macros.
   */
  HandsUp.Macros = class {
    /**
     * Installs or updates the 'RaiseHand' macro for all players.
     */
    static _installMacroRaiseHand() {
      let players = findObjs({
        _type: 'player'
      });

      // Install the macro for each player.
      _.each(players, player => {
        _installMacro(player, 'RaiseHand', HandsUp.Commands.RAISE_HAND_CMD);
      });
    }

    static installMacros() {
      HandsUp.Macros._installMacroRaiseHand();
    }
  };
})();

/**
 * utils package
 */
(() => {
  'use strict';

  HandsUp.utils = {};
})();

(() => {
  'use strict';

  const FROM_NAME = 'HandsUp';

  /**
   * This module provides chat-related functions.
   */
  HandsUp.utils.Chat = class {
    /**
     * Displays a message in the chat visible to all players.
     * @param {string} message
     */
    static broadcast(message) {
      sendChat(FROM_NAME, message);
    }

    /**
     * Notify GMs about an error and logs its stack trace.
     * @param {Error} err
     */
    static error(err) {
      log(`HandsUp ERROR: ${err.message}`);
      log(err.stack);
      HandsUp.utils.Chat.whisperGM(
        `ERROR: ${err.message} --- See API console log for details.`);
    }

    /**
     * Fixes the 'who' string from a Message so that it can be reused as a
     * whisper target using Roll20's sendChat function.
     * @param {string} who The player name taken from the 'who' property of a
     * chat:message event.
     * @return {string}
     */
    static fixWho(srcWho) {
      return srcWho.replace(/\(GM\)/, '').trim();
    }

    /**
     * Whispers a message to someoen.
     * @param {Player} player The player who will receive the whisper.
     * @param {string} msg The whispered message.
     */
    static whisper(player, msg) {
      let name = player.get('_displayname');
      let cleanName = HandsUp.utils.Chat.fixWho(name);
      sendChat(FROM_NAME, '/w "' + cleanName + '" ' + msg);
    }

    /**
     * Whispers a message to the GM.
     * @param {string} message
     */
    static whisperGM(message) {
      sendChat(FROM_NAME, '/w gm ' + message);
    }
  };
})();

(() => {
  'use strict';

  /**
   * A module for color computations.
   */
  HandsUp.utils.Colors = class {
    /**
     * Convert a color from the HSL in the range [0, 1] to
     * RGB in the range [0, 255].
     * @param {float} hue hue
     * @param {float} sat saturation
     * @param {float} lum luminescence
     * @return {vec3}
     */
    static hsl2rgb(hue, sat, lum) {
      let hue360 = hue * 360;
      // Algorithm stolen from
      // https://en.wikipedia.org/wiki/HSL_and_HSV#HSL_to_RGB_alternative.
      function f(n) {
        let k = (n + hue360/30) % 12;
        let a = sat * Math.min(lum, 1 - lum);
        let rgbNorm = lum - a * Math.max(Math.min(k - 3, 9-k, 1), -1);
        return Math.floor(255 * rgbNorm);
      }

      return [f(0), f(8), f(4)];
    }
  };
})();
