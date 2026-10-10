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
      _showMenu(msg.playerid);
    }
  }

  /**
   * Carry relationships live here, next to One-Click useroptions, so they
   * survive a sandbox restart without being written onto a Graphic.
   * @private
   * @return {{carryLists: Object.<string, string[]>, carriedBy: Object.<string, string>}}
   */
  function _data() {
    if(!state.carrytokens || typeof state.carrytokens !== 'object')
      state.carrytokens = {};

    if(!state.carrytokens.carryLists || typeof state.carrytokens.carryLists !== 'object' || Array.isArray(state.carrytokens.carryLists))
      state.carrytokens.carryLists = {};

    if(!state.carrytokens.carriedBy || typeof state.carrytokens.carriedBy !== 'object' || Array.isArray(state.carrytokens.carriedBy))
      state.carrytokens.carriedBy = {};

    return state.carrytokens;
  }

  /**
   * @private
   * @param {Error} err
   */
  function _logError(err) {
    log('Carry Tokens ERROR: ' + err.message);
    log(err.stack);
  }

  /**
   * True when linking carrierId -> tokenId would close a cycle.
   * A carries B carries C is allowed. C carries A is not.
   * @private
   * @param {string} carrierId
   * @param {string} tokenId
   * @return {boolean}
   */
  function _wouldCycle(carrierId, tokenId) {
    if(carrierId === tokenId)
      return true;

    let lists = _data().carryLists;
    let seen = new Set();
    let stack = [tokenId];

    while(stack.length) {
      let id = stack.pop();
      if(seen.has(id))
        continue;
      seen.add(id);

      let children = lists[id];
      if(!Array.isArray(children))
        continue;

      for(let i = 0; i < children.length; ++i) {
        if(children[i] === carrierId)
          return true;
        stack.push(children[i]);
      }
    }

    return false;
  }

  /**
   * Record that carrierId carries tokenId.
   * @private
   * @param {string} carrierId
   * @param {string} tokenId
   */
  function _acceptLink(carrierId, tokenId) {
    if(!carrierId || !tokenId || carrierId === tokenId)
      return;
    if(!getObj('graphic', carrierId) || !getObj('graphic', tokenId))
      return;
    if(_wouldCycle(carrierId, tokenId))
      return;

    let data = _data();
    let list = data.carryLists[carrierId];
    if(!Array.isArray(list)) {
      list = [];
      data.carryLists[carrierId] = list;
    }
    if(!list.includes(tokenId))
      list.push(tokenId);
    data.carriedBy[tokenId] = carrierId;
  }

  /**
   * Drop every carry link that names this graphic.
   * Tokens it was carrying stay where they are, and are no longer carried.
   * @private
   * @param {string} id
   */
  function _forget(id) {
    if(!id)
      return;

    let data = _data();
    let carried = data.carryLists[id];
    if(Array.isArray(carried)) {
      carried.forEach(tokenId => {
        if(data.carriedBy[tokenId] === id)
          delete data.carriedBy[tokenId];
      });
    }
    delete data.carryLists[id];

    Object.keys(data.carryLists).forEach(carrierId => {
      let list = data.carryLists[carrierId];
      if(!Array.isArray(list)) {
        delete data.carryLists[carrierId];
        return;
      }

      let index = list.indexOf(id);
      if(index !== -1)
        list.splice(index, 1);
      if(!list.length)
        delete data.carryLists[carrierId];
    });

    delete data.carriedBy[id];
    Object.keys(data.carriedBy).forEach(tokenId => {
      if(data.carriedBy[tokenId] === id)
        delete data.carriedBy[tokenId];
    });
  }

  /**
   * Makes a token carry another token, without regard to their positions
   * on the Z axis.
   * @private
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function _carry(carrier, token) {
    if(!carrier || !token)
      return;

    // A token can't carry itself.
    if(carrier.id === token.id)
      return;

    // Already carrying this token.
    let list = _data().carryLists[carrier.id];
    if(Array.isArray(list) && list.includes(token.id))
      return;

    // A carries B carries C is allowed. C carries A is not.
    if(_wouldCycle(carrier.id, token.id))
      return;

    _acceptLink(carrier.id, token.id);
  }

  /**
   * Move a carried token onto its carrier. A matching position is not a drop.
   * @private
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function _syncCarriedPosition(carrier, token) {
    if(!carrier || !token)
      return;
    if(_data().carriedBy[token.id] !== carrier.id)
      return;

    token.set('left', carrier.get('left'));
    token.set('top', carrier.get('top'));
    token.set('rotation', carrier.get('rotation'));
  }

  /**
   * True when a carried token is no longer standing on its carrier.
   * @private
   * @param {Graphic} token
   * @param {Graphic} carrier
   * @return {boolean}
   */
  function _movedAway(token, carrier) {
    return token.get('left') !== carrier.get('left') ||
      token.get('top') !== carrier.get('top') ||
      token.get('rotation') !== carrier.get('rotation');
  }

  /**
   * Makes a token carry another token such that the carried token is
   * above the carrier token on the Z axis.
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function carryAbove(carrier, token) {
    _carry(carrier, token);
    _syncCarriedPosition(carrier, token);
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
    _syncCarriedPosition(carrier, token);
    toBack(token);
  }

  /**
   * Makes a token drop a token it's carrying.
   * @param {Graphic} carrier
   * @param {Graphic} token
   */
  function drop(carrier, token) {
    if(!carrier || !token)
      return;

    let data = _data();
    let list = data.carryLists[carrier.id];
    if(!Array.isArray(list))
      return;

    let index = list.indexOf(token.id);
    if(index !== -1) {
      list.splice(index, 1);
      if(!list.length)
        delete data.carryLists[carrier.id];
      if(data.carriedBy[token.id] === carrier.id)
        delete data.carriedBy[token.id];
    }
  }

  /**
   * Makes a token drop all tokens it is carrying.
   * @param {Graphic} carrier
   */
  function dropAll(carrier) {
    if(!carrier)
      return;

    let data = _data();
    let list = data.carryLists[carrier.id];
    if(!Array.isArray(list))
      return;

    list.forEach(tokenId => {
      if(data.carriedBy[tokenId] === carrier.id)
        delete data.carriedBy[tokenId];
    });
    delete data.carryLists[carrier.id];
  }

  /**
   * Fixes msg.who.
   * @param {string} who
   * @return {string}
   */
  function _fixWho(who) {
    return who.replace(/\(GM\)/g, '').trim();
  }

  /**
   * Returns a copy of a token's list of carried tokens.
   * Ids that no longer resolve are removed from state.
   * @param {Graphic} carrier
   * @return {Graphic[]}
   */
  function getCarriedTokens(carrier) {
    if(!carrier)
      return [];

    let data = _data();
    let list = data.carryLists[carrier.id];
    if(!Array.isArray(list))
      return [];

    let kept = [];
    let tokens = [];
    list.forEach(id => {
      let token = getObj('graphic', id);
      if(!token) {
        if(data.carriedBy[id] === carrier.id)
          delete data.carriedBy[id];
        return;
      }
      kept.push(id);
      tokens.push(token);
    });

    if(kept.length)
      data.carryLists[carrier.id] = kept;
    else
      delete data.carryLists[carrier.id];

    return tokens;
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
   * @param {Set<string>} [seen]
   */
  function moveCarriedTokens(carrier, seen) {
    if(!carrier)
      return;
    if(!seen)
      seen = new Set();
    if(seen.has(carrier.id))
      return;
    seen.add(carrier.id);

    getCarriedTokens(carrier).forEach(carried => {
      carried.set('left', carrier.get('left'));
      carried.set('top', carrier.get('top'));
      carried.set('rotation', carrier.get('rotation'));
      moveCarriedTokens(carried, seen);
    });
  }

  /**
   * Shows the list of effects which can be applied to a selected path.
   * @param {string} playerid
   */
  function _showMenu(playerid) {
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
    let player = getObj('player', playerid);
    _whisper(player, menu.toString(MENU_CSS));
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
  function _whisper(player, msg) {
    let who = player.get('_displayname');
    sendChat('Carry Tokens', '/w "' + _fixWho(who) + '" ' + msg);
  }

  /**
   * Handle one queued item per turn so a long scan does not miss the heartbeat.
   * @private
   * @param {Array} items
   * @param {function(*): void} each
   * @param {function(): void} [done]
   */
  function _burndown(items, each, done) {
    let queue = items.slice();
    let step = () => {
      if(!queue.length) {
        if(done)
          done();
        return;
      }

      let item = queue.shift();
      try {
        each(item);
      }
      catch(err) {
        _logError(err);
      }
      setTimeout(step, 0);
    };

    setTimeout(step, 0);
  }

  /**
   * @private
   * @return {string[]}
   */
  function _storedIds() {
    let data = _data();
    let ids = new Set();

    Object.keys(data.carryLists).forEach(carrierId => {
      ids.add(carrierId);
      let list = data.carryLists[carrierId];
      if(Array.isArray(list))
        list.forEach(tokenId => ids.add(tokenId));
    });
    Object.keys(data.carriedBy).forEach(tokenId => {
      ids.add(tokenId);
      if(data.carriedBy[tokenId])
        ids.add(data.carriedBy[tokenId]);
    });

    return Array.from(ids);
  }

  /**
   * @private
   * @param {string} id
   */
  function _validateId(id) {
    if(!id || getObj('graphic', id))
      return;
    _forget(id);
  }

  /**
   * Remove the edge that returns to an id already on the path.
   * @private
   * @param {string} carrierId
   * @param {Set<string>} path
   */
  function _breakCyclesFrom(carrierId, path) {
    if(path.has(carrierId))
      return;

    let data = _data();
    let list = data.carryLists[carrierId];
    if(!Array.isArray(list)) {
      if(list !== undefined)
        delete data.carryLists[carrierId];
      return;
    }

    path.add(carrierId);
    for(let i = list.length - 1; i >= 0; --i) {
      let tokenId = list[i];
      if(path.has(tokenId)) {
        list.splice(i, 1);
        if(data.carriedBy[tokenId] === carrierId)
          delete data.carriedBy[tokenId];
        continue;
      }
      _breakCyclesFrom(tokenId, path);
    }
    path.delete(carrierId);

    if(!list.length)
      delete data.carryLists[carrierId];
  }

  /**
   * Create or update the CarryTokensMenu macro, one player per turn.
   * @private
   */
  function _createMacros() {
    let players = findObjs({
      _type: 'player'
    });

    _burndown(players, player => {
      let macro = findObjs({
        _type: 'macro',
        _playerid: player.id,
        name: 'CarryTokensMenu'
      })[0];

      if(macro)
        macro.set('action', CARRY_MENU_CMD);
      else
        createObj('macro', {
          _playerid: player.id,
          name: 'CarryTokensMenu',
          action: CARRY_MENU_CMD
        });
    }, () => {
      log('--- Initialized Carry Tokens ---');
    });
  }

  /**
   * Drop stored ids that are no longer graphics, then break leftover cycles.
   * @private
   */
  function _validateState() {
    _burndown(_storedIds(), _validateId, () => {
      _burndown(Object.keys(_data().carryLists), carrierId => {
        _breakCyclesFrom(carrierId, new Set());
      }, _createMacros);
    });
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
      _logError(err);
      sendChat('Carry Tokens ERROR:', '/w gm ' + err.message);
    }
  });

  // Do the carrying logic when the carrier tokens move.
  on('change:graphic', obj => {
    try {
      // If a player moved this token off its carrier, stop carrying it.
      // A position that still matches the carrier is this script placing it.
      let carrierId = _data().carriedBy[obj.id];
      if(carrierId) {
        let carrier = getObj('graphic', carrierId);
        if(!carrier)
          delete _data().carriedBy[obj.id];
        else if(_movedAway(obj, carrier))
          drop(carrier, obj);
      }

      moveCarriedTokens(obj);
    }
    catch(err) {
      _logError(err);
    }
  });

  on('destroy:graphic', obj => {
    try {
      _forget(obj && obj.id);
    }
    catch(err) {
      _logError(err);
    }
  });

  // Validate stored links, then create macros.
  on('ready', () => {
    try {
      _data();
      _validateState();
    }
    catch(err) {
      _logError(err);
    }
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
