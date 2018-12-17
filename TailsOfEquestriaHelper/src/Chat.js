/**
 * This module provides the script's interface for broadcasting/whispering
 * messages in the chat.
 */
(() => {
  'use strict';

  const CHAT_NAME = 'TailsOfEquestriaHelper';

  /**
   * Displays a message in the chat that is visible to everyone.
   * @param {string} msg
   * @param {string} [speakAs]
   */
  function broadcast(msg, speakAs) {
    sendChat(speakAs || CHAT_NAME, msg);
  }

  /**
   * Reports an error.
   * @param {Error} err
   */
  function error(err) {
    whisper('Error: ' + err.message);
    log('TailsOfEquestriaHelper ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * Internally rolls a dice expression using the quantum roller.
   */
   function rollAsync(expr) {
     return new Promise((resolve, reject) => {
       sendChat(CHAT_NAME, '/w gm [[' + expr + ']]', (msg) => {
         try {
           let results = msg[0].inlinerolls[0].results;
           resolve(results);
         }
         catch(err) {
           reject(err);
         }
       });
     });
   }

  /**
   * Whispers a message to the GM.
   * @param {string} msg
   */
  function whisper(msg) {
    sendChat(CHAT_NAME, `/w gm ${msg}`);
  }

  _.extend(TailsOfEquestriaHelper, {
    _chat: {
      broadcast,
      error,
      rollAsync,
      whisper
    }
  });
})();
