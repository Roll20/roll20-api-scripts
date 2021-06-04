(() => {
  'use strict';

  const FROM_NAME = 'Check It Out script';

  CheckItOut.utils.Chat = class {

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
      log(`CheckItOut ERROR: ${err.message}`);
      log(err.stack);
      CheckItOut.utils.Chat.whisperGM(
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
     * Whispers a message to a player.
     * @param {string} who The name of recipient player.
     * @param {string} message The whispered message.
     */
    static whisper(who, message) {
      let whoFixed = CheckItOut.utils.Chat.fixWho(who);
      sendChat(FROM_NAME, '/w "' + whoFixed + '" ' + message);
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
