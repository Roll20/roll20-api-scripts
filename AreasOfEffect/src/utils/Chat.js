(() => {
  'use strict';

  const FROM_NAME = 'Areas of Effect';

  /**
   * Module for chat functions.
   */
  AreasOfEffect.utils.Chat = class {

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
      let cleanName = AreasOfEffect.utils.Chat.fixWho(name);
      sendChat(FROM_NAME, '/w "' + cleanName + '" ' + msg);
    }
  };
})();
