/**
 * This module provides the script's interface for broadcasting/whispering
 * messages in the chat.
 */
(() => {
  'use strict';

  const CHAT_NAME = 'Hexploration';

  /**
   * Displays a message in the chat that is visible to everyone.
   * @param {string} msg
   */
  function broadcast(msg) {
    sendChat(CHAT_NAME, msg);
  }

  /**
   * Reports an error.
   * @param {Error} err
   */
  function error(err) {
    whisper('Error: ' + err.message);
    log('Hexploration ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * Whispers a message to the GM.
   * @param {string} msg
   */
  function whisper(msg) {
    sendChat(CHAT_NAME, `/w gm ${msg}`);
  }

  _.extend(Hexploration, {
    _chat: {
      broadcast,
      error,
      whisper
    }
  });
})();
