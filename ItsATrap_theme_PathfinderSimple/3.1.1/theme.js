(() => {
  'use strict';

  // The name used by this script to send alerts to the GM in the chat.
  const CHAT_NAME = 'ItsATrap-PF-Simple';

  // Register the theme with ItsATrap.
  on('ready', () => {
    sendChat(CHAT_NAME, '/w This trap theme script is deprecated. Please use the generic Pathfinder trap theme script instead.');
  });
})();
