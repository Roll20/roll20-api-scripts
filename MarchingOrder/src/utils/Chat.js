(() => {
  'use strict';

  const FROM_NAME = 'MarchingOrder';

  /**
   * This module provides chat-related functions.
   */
  MarchingOrder.utils.Chat = class {
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
      log(`MarchingOrder ERROR: ${err.message}`);
      log(err.stack);
      MarchingOrder.utils.Chat.whisperGM(
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
     * Extracts the selected graphics from a chat message.
     * @param {ChatMessage} msg
     * @return {Graphic[]}
     */
    static getGraphicsFromMsg(msg) {
      var result = [];

      var selected = msg.selected;
      if(selected) {
        _.each(selected, s => {
          let graphic = getObj('graphic', s._id);
          if(graphic)
            result.push(graphic);
        });
      }
      return result;
    }

    /**
     * Publicly shame a player for trying to use a GMs-only part of this script.
     * @param {Player} player
     * @param {string} component A descriptor of the component the player tried
     * to access.
     */
    static tattle(player, component) {
      let name = player.get('_displayname');
      MarchingOrder.utils.Chat.broadcast(`Player ${name} has been caught ` +
        `accessing a GMs-only part of the Marching Order ` +
        `script: ${component}. Shame on them!`);
    }

    /**
     * Notify GMs about a warning.
     * @param {Error} err
     */
    static warn(err) {
      log(`MarchingOrder WARNING: ${err.message}`);
      MarchingOrder.utils.Chat.whisperGM(
        `WARNING: ${err.message}`);
    }

    /**
     * Whispers a message to someoen.
     * @param {Player} player The player who will receive the whisper.
     * @param {string} msg The whispered message.
     */
    static whisper(player, msg) {
      let name = player.get('_displayname');
      let cleanName = MarchingOrder.utils.Chat.fixWho(name);
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
