ItsATrap.Chat = (() => {
  'use strict';

  /**
   * Broadcasts a message spoken by the script's configured announcer.
   * This message is visible to everyone.
   */
  function broadcast(msg) {
    let announcer = getAnnouncer();
    sendChat(announcer, msg);
  }

  /**
   * Log an error and its stack trace and alert the GM about it.
   * @param {Error} err The error.
   */
  function error(err) {
    whisperGM(err.message + "<br/>Check API console logs for details.");
    log(err.stack);
  }

  /**
   * Get the name of the script's announcer (for users who don't like
   * Admiral Ackbar).
   * @return {string}
   */
  function getAnnouncer() {
    return state.ItsATrap.userOptions.announcer || 'Admiral Ackbar';
  }

  /**
   * Whisper a message from the API to the GM.
   * @param {string} msg The message to be whispered to the GM.
   */
  function whisperGM(msg) {
    sendChat('Its A Trap! script', '/w gm ' + msg);
  }

  return {
    broadcast,
    error,
    getAnnouncer,
    whisperGM
  };
})();
