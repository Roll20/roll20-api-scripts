const WelcomePackage = (() => {
  'use strict';

  const CREATE_CHARACTER_CMD = '!welcomePackageCreateCharacter';

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

  const observers = [];
  let isReady = false;

  /**
   * Report an error to the GM and log its stack trace.
   * @param err The error.
   */
  function _error(err) {
    log(`WelcomePackage ERROR: ${err.message}`);
    log(err.stack);
    sendChat('WelcomePackage API',
      `/w gm ERROR: ${err.message} --- See API console log for details.`);
  }

  /**
   * Event handler for when a player logs into the game.
   * @private
   * @param {Player} player
   */
  function _handlePlayerOnline(player) {
    if (player.get('_online') && !playerIsGM(player.get('_id')))
      createPlayerCharacter(player);
  }

  /**
   * Registers a function to be notified when a character is created
   * @param {function} func
   */
  function onAddCharacter(func){
    if('function' === typeof func){
      observers.push(func);
    }
  }

  /**
   * Notifies all registered functions when a character is created
   * @param {Character} character
   */
  function notifyAddCharacter(character){
    observers.forEach((f)=>f(character));
  }

  /**
   * Creates a character creation macro for a player if they don't already
   * have the macro.
   * @param {Player} player
   */
  function addCharacterCreateMacro() {
    const macroName = 'CreateACharacter';

    let allPlayers = findObjs({
      _type: 'player'
    });
    _.each(allPlayers, player => {
      let playerId = player.get('_id');

      let macro = findObjs({
        _type: 'macro',
        _playerid: playerId,
        name: macroName
      })[0];
      if(!macro) {
        log(`WelcomePackage: Creating "CreateACharacter" macro for player ` +
          `${player.get('_displayname')}`);
        createObj('macro', {
          _playerid: playerId,
          name: macroName,
          action: `${CREATE_CHARACTER_CMD} ?{Character Name:}`
        });
      }
    });
  }

  /**
   * Creates a character for a player if they don't already have any characters.
   * @param {Player} player
   * @param {string} [name] The name of the character. If this is provided,
   *                        the character will be created regardless of whether
   *                        the player has a character already.
   */
  function createPlayerCharacter(player, name) {
    let playerId = player.get('_id');
    let who = player.get('_displayname');

    // Check if there are any characters already controlled by the player.
    let characters = findObjs({
      _type: 'character'
    }).filter(character => {
      return character.get('controlledby').includes(playerId);
    });

    // Create the new character if there are none, or if a name has been
    // provided for a character being explicitly created through the macro.
    if(characters.length === 0 || name) {
      if(!name) {
        log(`WelcomePackage: Creating first-time character for player ` +
          `${player.get('_displayname')}`);
        name = `${who}'s character`;
      }

      let character = createObj('character', {
        controlledby: playerId,
        inplayerjournals: 'all',
        name
      });

      // Disable the Charactermancer for the new character by creating
      // the "version" attribute. This will be set to its correct value later
      // by the character sheet's worker.
      createObj('attribute', {
        name: 'mancer_confirm_flag',
        characterid: character.id,
        current: '1'
      });
      createObj('attribute', {
        name: 'l1mancer_status',
        characterid: character.id,
        current: 'completed'
      });

      setTimeout(() => {
        notifyAddCharacter(character);
        showCharacterLink(who, character);
      }, 1000);
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
    if(isReady)
      _handlePlayerOnline(player);
  });

  on('ready', () => {
    try {
      // Create the global macro for the script (visible to all players)
      // if it doesn't already exist.
      addCharacterCreateMacro();

      log('*** Initialized Welcome Package v1.3.2 ***');
      isReady = true;

      // Wait some amount of time to give other scripts a chance to finish
      // loading. Then process any pending logged in players.
      setTimeout(() => {
        try {
          // Once we're loaded, create a character for any player that doesn't
          // have one.
          let players = findObjs({
            _type: 'player'
          });
          _.each(players, player => {
            _handlePlayerOnline(player);
          });
        }
        catch (err) {
          _error(err);
        }
      }, 5000);
    }
    catch (err) {
      _error(err);
    }
  });

  /**
   * Process chat commands.
   */
  on('chat:message', msg => {
    let playerId = msg.playerid;

    if(msg.content.startsWith(CREATE_CHARACTER_CMD)) {
      let player = getObj('player', playerId);
      let argv = msg.content.split(' ');
      let name = argv.slice(1).join(' ');
      createPlayerCharacter(player, name);
    }
  });

  return {
    OnAddCharacter: onAddCharacter,
    onAddCharacter
  };
})();
_.noop(WelcomePackage);
