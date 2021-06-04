(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-5E-Shaped';

  // Register the theme with ItsATrap.
  on('ready', () => {
    sendChat(CHAT_NAME, '/w gm This script is deprecated. Please use the generic D&D 5E trap theme instead.');
  });
})();
