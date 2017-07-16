(() => {
  'use strict';

  const CSS = {
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #a88cd5',
      'border-radius': '5px',
      'font-weight': 'bold',
      'margin-bottom': '1em',
      'overflow': 'hidden'
    },
    'menuBody': {
      'padding': '5px',
      'text-align': 'center'
    },
    'menuHeader': {
      'background': '#a88cd5',
      'color': '#fff',
      'text-align': 'center'
    }
  };

  /**
   * Creates a character creation macro for a player if they don't already
   * have the macro.
   */
  function addCharacterCreateMacro(player) {
    
  }

  /**
   * Creates a character for a player if they don't already have any characters.
   * @param {Player} player
   */
  function createPlayerCharacter(player) {
    let playerId = player.get('_id');
    let who = player.get('_displayname');

    let characters = findObjs({
      _type: 'character',
      controlledby: playerId
    });
    if(characters.length === 0) {
      let character = createObj('character', {
        controlledby: playerId,
        inplayerjournals: 'all',
        name: `${who}'s character`
      });

      setTimeout(() => {
        showCharacterLink(who, character);
      }, 3000);
    }
  }

  /**
   * Shows a player the link to their new character with a welcoming message.
   * @param {string} who The player's display name.
   * @param {Character} character
   */
  function showCharacterLink(who, character) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', 'Welcome!');
    let content = menu.append('.menuBody');
    content.append('div', 'A blank character has been created for you to start building: ');
    content.append('a', character.get('name'), {
      href: 'http://journal.roll20.net/character/' + character.get('_id'),
      style: {
        color: '#a08'
      }
    });
    let html = menu.toString(CSS);
    sendChat('Welcome Package', '/w ' + who + ' ' + html);
  }

  // When a player logs in, create a character for them if they don't have one.
  on('change:player:_online', player => {
    if(player.get('_online') && !playerIsGM(player.get('_id'))) {
      createPlayerCharacter(player);
      addCharacterCreateMacro(player);
    }
  });

  on('ready', () => {
    log('🎁🎁🎁 Initialized Welcome Package 🎁🎁🎁');
  });
})();
