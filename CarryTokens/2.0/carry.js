var CarryTokens = (() => {
  'use strict';

  const CARRY_MENU_CMD = '!CARRY_TOKENS_MENU';
  const CARRY_ABOVE_CMD = '!CARRY_TOKENS_CARRY_ABOVE';
  const CARRY_BELOW_CMD = '!CARRY_TOKENS_CARRY_BELOW';
  const DROP_ONE_CMD = '!CARRY_TOKENS_DROP_ONE';
  const DROP_ALL_CMD = '!CARRY_TOKENS_DROP_ALL';

  let MENU_CSS = {
    'centeredBtn': {
      'text-align': 'center'
    },
    'menu': {
      'background': '#fff',
      'border': 'solid 1px #000',
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
      'background': '#000',
      'color': '#fff',
      'text-align': 'center'
    }
  };

  /**
   * Handlers for chat commands
   */
  class Commands {
    /**
     * Command for carryAbove()
     */
    static carryAbove(msg) {
      Commands._enforcePermission(msg.playerid);

      let argv = msg.content.split(' ');
      let carrierId = argv[1];
      let targetId = argv[2];

      let carrier = getObj('graphic', carrierId);
      let target = getObj('graphic', targetId);

      carryAbove(carrier, target);
    }

    /**
     * Command for carryBelow()
     */
    static carryBelow(msg) {
      Commands._enforcePermission(msg.playerid);

      let argv = msg.content.split(' ');
      let carrierId = argv[1];
      let targetId = argv[2];

      let carrier = getObj('graphic', carrierId);
      let target = getObj('graphic', targetId);

      carryBelow(carrier, target);
    }

    /**
     * Command for drop()
     */
    static dropOne(msg) {
      Commands._enforcePermission(msg.playerid);

      let argv = msg.content.split(' ');
      let carrierId = argv[1];
      let name = argv.slice(2).join(' ');

      let carrier = getObj('graphic', carrierId);
      let target = findObjs({
        _type: 'graphic',
        _pageid: carrier.get('_pageid'),
        name
      })[0];
      if(!target)
        throw new Error(`Token ${name} not found.`);

      drop(carrier, target);
    }

    /**
     * Command for dropAll()
     */
    static dropAll(msg) {
      Commands._enforcePermission(msg.playerid);

      let argv = msg.content.split(' ');
      let carrierId = argv[1];
      let carrier = getObj('graphic', carrierId);

      dropAll(carrier);
    }

    /**
     * If a player does not have permission to use this script's functions,
     * throw an Error for the incident.
     * @param {string} playerId
     */
    static _enforcePermission(playerId) {
      let allowPlayerUse = getOption('allowPlayerUse');
      let hasPermission = allowPlayerUse || _.isUndefined(allowPlayerUse) || playerIsGM(playerId);

      if(!hasPermission)
        throw new Error(`Player ${playerId} tried to use a restricted part of this script without permission.`);
    }

    /**
     * Shows the menu.
     */
    static showMenu(msg) {
      Commands._enforcePermission(msg.playerid);
      _showMenu(msg.who, msg.playerid);
    }
  }

  /**
   * Makes a token carry another token, without regard to their positions
   * on the Z axis.
   * @private
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function _carry(carrier, token) {
    // A token can't carry itself.
    if(carrier === token)
      return;

    // Initialize the carry list if it doesn't exist.
    if(!carrier.carryList)
      carrier.carryList = [];

    // Add the carried token.
    if(!carrier.carryList.includes(token)) {
      carrier.carryList.push(token);
      token.carriedBy = carrier;
    }
  }

  /**
   * Makes a token carry another token such that the carried token is
   * above the carrier token on the Z axis.
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function carryAbove(carrier, token) {
    _carry(carrier, token);
    toFront(token);
  }

  /**
   * Makes a token carry another token such that the carried token is
   * below the carrier token on the Z axis.
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function carryBelow(carrier, token) {
    _carry(carrier, token);
    toBack(token);
  }

  /**
   * Makes a token drop a token it's carrying.
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function drop(carrier, token) {
    if(!carrier.carryList)
      return;

    let index = carrier.carryList.indexOf(token);
    if(index !== -1) {
      carrier.carryList.splice(index, 1);
      delete token.carriedBy;
    }
  }

  /**
   * Makes a token drop all tokens it is carrying.
   * @param {Graphic} carrier
   */
  function dropAll(carrier) {
    if(carrier.carryList)
      delete carrier.carryList;
  }

  /**
   * Fixes msg.who.
   * @param {string} who
   * @return {string}
   */
  function _fixWho(who) {
    return who.replace(/\(GM\)/, '').trim();
  }

  /**
   * Returns a copy of a token's list of carried tokens.
   * @param {Graphic} carrier
   * @return {Graphic[]}
   */
  function getCarriedTokens(carrier) {
    return _.clone(carrier.carryList || []);
  }

  /**
   * Gets the value of a One-Click user option for this script.
   * @param {string} name
   * @return {any}
   */
  function getOption(name) {
    let options = globalconfig && globalconfig.carrytokens;
    if(!options)
      options = (state.carrytokens && state.carrytokens.useroptions) || {};

    return options[name];
  }

  /**
   * If a token is carrying other tokens, move the carried tokens to the
   * carrier token.
   * @param {Graphic} carrier
   */
  function moveCarriedTokens(carrier) {
    // Move each of the tokens carried by the token.
    if(carrier.carryList)
      _.each(carrier.carryList, carried => {
        carried.set('left', carrier.get('left'));
        carried.set('top', carrier.get('top'));
        carried.set('rotation', carrier.get('rotation'));

        // If the carried token is carrying anything, move its carried
        // tokens too.
        moveCarriedTokens(carried);
      });
  }

  /**
   * Shows the list of effects which can be applied to a selected path.
   * @param {string} who
   * @param {string} playerid
   */
  function _showMenu(who, playerid) {
    let content = new HtmlBuilder('div');
    content.append('.centeredBtn').append('a', 'Carry Above', {
      href: `${CARRY_ABOVE_CMD} &#64;{selected|token_id} &#64;{target|token_id}`,
      title: 'Make selected token carry target token on top.'
    });
    content.append('.centeredBtn').append('a', 'Carry Below', {
      href: `${CARRY_BELOW_CMD} &#64;{selected|token_id} &#64;{target|token_id}`,
      title: 'Make selected token carry target token underneath.'
    });
    content.append('.centeredBtn').append('a', 'Drop by Name', {
      href: `${DROP_ONE_CMD} &#64;{selected|token_id} ?{Drop token name:}`,
      title: 'Make selected token drop a carried token.'
    });
    content.append('.centeredBtn').append('a', 'Drop All', {
      href: `${DROP_ALL_CMD} &#64;{selected|token_id}`,
      title: 'Make selected token drop all carried tokens.'
    });

    let menu = _showMenuPanel('Carry Tokens', content);
    _whisper(who, menu.toString(MENU_CSS));
  }

  /**
   * Displays one of the script's menus.
   * @param {string} header
   * @param {(string|HtmlBuilder)} content
   * @return {HtmlBuilder}
   */
  function _showMenuPanel(header, content) {
    let menu = new HtmlBuilder('.menu');
    menu.append('.menuHeader', header);
    menu.append('.menuBody', content)
    return menu;
  }

  /**
   * Whispers a Marching Order message to someone.
   * @private
   */
  function _whisper(who, msg) {
    sendChat('Carry Tokens', '/w "' + _fixWho(who) + '" ' + msg);
  }

  on('chat:message', msg => {
    try {
      if(msg.content.startsWith(CARRY_MENU_CMD))
        Commands.showMenu(msg);
      if(msg.content.startsWith(CARRY_ABOVE_CMD))
        Commands.carryAbove(msg);
      if(msg.content.startsWith(CARRY_BELOW_CMD))
        Commands.carryBelow(msg);
      if(msg.content.startsWith(DROP_ONE_CMD))
        Commands.dropOne(msg);
      if(msg.content.startsWith(DROP_ALL_CMD))
        Commands.dropAll(msg);
    }
    catch(err) {
      log('Carry Tokens ERROR: ' + err.message);
      sendChat('Carry Tokens ERROR:', '/w ' + _fixWho(msg.who) + ' ' + err.message);
      log(err.stack);
    }
  });

  // Do the carrying logic when the carrier tokens move.
  on("change:graphic", obj => {
    try {
      // If the token was moved by a player while it was being carried,
      // stop carrying it.
      if(obj.carriedBy)
        drop(obj.carriedBy, obj);

      moveCarriedTokens(obj);
    }
    catch(err) {
      log('Carry Tokens ERROR: ' + err.message);
      log(err.stack);
    }
  });

  // Create macros
  on('ready', () => {
    let players = findObjs({
      _type: 'player'
    });

    // Create the macro, or update the players' old macro if they already have it.
    _.each(players, player => {
      let macro = findObjs({
        _type: 'macro',
        _playerid: player.get('_id'),
        name: 'CarryTokensMenu'
      })[0];

      if(macro)
        macro.set('action', CARRY_MENU_CMD);
      else
        createObj('macro', {
          _playerid: player.get('_id'),
          name: 'CarryTokensMenu',
          action: CARRY_MENU_CMD
        });
    });

    log('--- Initialized Carry Tokens ---');
  });

  // Exposed API
  return {
    carryAbove,
    carryBelow,
    drop,
    dropAll,
    getCarriedTokens,
    getOption
  };
})();
