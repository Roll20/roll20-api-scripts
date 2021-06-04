(function() {
  var ACTIVATE_TERMINAL_CMD = '!_activate_terminal';
  var PASSWORD_CMD = '!_guess_terminal_password';
  var PREV_SCREEN_CMD = '!_prev_terminal_screen';
  var SHOW_SCREEN_CMD = '!_show_terminal_screen';
  var VERSION = '1.1';

  var ASCII_TABLE = '!"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[]^_`{|}~';
  var DEFAULT_BG_COLOR = '#000';
  var DEFAULT_BUTTON_COLOR = '#114422';
  var DEFAULT_TEXT_COLOR = '#22ff88';

  var curTerminal;
  var nextItemId;
  var history = [];
  var curScreenId;

  /**
   * The FalloutTerminal state data.
   * @typedef {object} FalloutTerminalState
   */
  state.FalloutTerminal = {}; //state.FalloutTerminal || {};
  _.defaults(state.FalloutTerminal, {
    userOptions: {}
  });
  var useroptions = globalconfig && globalconfig.falloutterminal;
  if(useroptions) {
    state.FalloutTerminal.userOptions = {
      bgColor: useroptions['bgColor'],
      buttonColor: useroptions['buttonColor'],
      textColor: useroptions['textColor']
    };
  }

  /**
   * Activates a terminal by initializing its JSON and displaying the
   * first screen of the terminal.
   * @private
   * @param  {string} id
   */
  function _activateTerminal(id) {
    var json = _getTerminalJson(id);
    if(json) {
      _initTerminal(json);
      _displayScreen(curTerminal._startId);
    }
  }

  /**
   * Displays a terminal screen in the chat.
   * @private
   * @param  {(string|int)} id
   */
  function _displayScreen(id) {
    var screen = curTerminal[id];
    curScreenId = id;

    var html = '<table style="background-color: ' + getBgColor() + '; border: solid 1px ' + getBgColor() + '; border-collapse: separate; border-radius: 10px; font-family: monospace; overflow: hidden; width: 100%;">';
    html += '<thead><tr><th style="' +
      'background: ' + getTextColor() + ';' +
      'color: ' + getBgColor() + ';' +
      'padding: 0.5em 1em;' +
    '">' + curTerminal._terminalName + '</th></tr>';
    html += '</thead>';
    html += '<tbody>';
    html += '<tr><td style ="color: ' + getTextColor() + '; padding: 0.5em;">';
    if(screen)
      html += _displayScreenContent(screen);
    else
      html += _displayScreenContent('ERROR 0xFFFFF710\n"Data Corru:xsfkleg,, g364[735}3__' + id + '."');
    if(!curTerminal._locked)
      html += _displayScreenButtons(screen);
    html += '</td></tr></tbody></table>';
    sendChat('Fallout Terminal', html);
  }

  /**
   * Displays a command button for the terminal screen.
   * @param  {string} cmd
   * @param  {string} label
   * @return {string}
   */
  function _displayScreenButton(cmd, label) {
    return '<a href="' + cmd + '" style="background: ' + getButtonColor() + '; border: none; color: ' + getTextColor() + '; margin: 0.2em 0; width: 95%;">' + label + '</a>';
  }

  /**
   * Displays the navigation buttons for the screen.
   * @param  {TerminalScreen} screen
   */
  function _displayScreenButtons(screen) {
    var prevScreenId = history[history.length-1];

    var html = '<div style="padding-top: 1em;">';
    if(screen) {
      _.each(screen.screenIds, function(id) {
        var screen = curTerminal[id];
        if(screen)
          html += _displayScreenButton(SHOW_SCREEN_CMD + ' ' + id, screen.name);
      });
    }
    if(prevScreenId !== undefined)
      html += _displayScreenButton(PREV_SCREEN_CMD, '<div style="text-align:center;">BACK</div>');
    html += '</div>';
    return html;
  }

  /**
   * Produce the HTML content for a terminal screen.
   * @private
   * @param  {TerminalScreen} screen
   * @return {string}
   */
  function _displayScreenContent(screen) {
    var html = '<div>';
    if(_.isString(screen))
      html += _htmlNewlines(screen);
    else if(curTerminal._locked) {
      if(!screen.attempts)
        html += _htmlNewlines('TERMINAL LOCKED\n\nPLEASE CONTACT AN ADMINISTRATOR');
      else
        html += _htmlNewlines(_displayScreenHacking());
    }
    else {
      html += _htmlNewlines(screen.name + '\n\n' + (screen.content || ''));
    }
    html += '</div>';
    return html;
  }

  /**
   * Displays the terminal lockout screen.
   * @private
   * @return {string}
   */
  function _displayScreenHacking() {
    var attempts = curTerminal._attempts;
    if(!attempts)
      return 'TERMINAL LOCKED\n\nPLEASE CONTACT AN ADMINISTRATOR';
    else {
      var html = attempts + ' ATTEMPT(S) LEFT: \n';
      _.each(_.range(attempts), function() {
        html += '&#9608; ';
      });
      html += '\n\n';

      // Display a fake RAM dump.
      var startAddr = 0xf000 + Math.floor(Math.random()*0xf0f);
      var inc = 20;
      _.each(_.range(16), function(i) {
        var addr = startAddr + inc*i;
        html += '0x' + addr.toString(16).toUpperCase() + ' ';
        _.each(_.range(inc), function() {
          html += ASCII_TABLE[Math.floor(Math.random()*ASCII_TABLE.length)].replace('<','&lt;').replace('>', '&gt;');
        });
        html += '\n';
      });

      // Display a button to guess the password.
      if(curTerminal._password) {
        html += '<div style="padding-top: 1em;">';
        html += _displayScreenButton(PASSWORD_CMD + ' ?{Password:}', 'GUESS PASSWORD');
        html += '</div>';
      }

      return html;
    }
  }

  /**
   * Gets the configured color for the terminal background.
   * @return {string}
   */
  function getBgColor() {
    return state.FalloutTerminal.userOptions.bgColor || DEFAULT_BG_COLOR;
  }

  /**
   * Gets the configured color for the terminal buttons.
   * @return {string}
   */
  function getButtonColor() {
    return state.FalloutTerminal.userOptions.buttonColor || DEFAULT_BUTTON_COLOR;
  }

  /**
   * Parses a terminal's raw JSON from its gmnotes.
   * @private
   * @param  {string} id
   */
  function _getTerminalJson(id) {
    var terminal = getObj('graphic', id);
    if(terminal && terminal.get('name').toLowerCase().indexOf('terminal') === 0) {
      var notes = unescape(terminal.get('gmnotes'));
      notes = notes.split(/<[/]?.+?>/g).join('');

      return JSON.parse(notes);
    }
  }

  /**
   * Gets the configured color for terminal text.
   * @return {string}
   */
  function getTextColor() {
    return state.FalloutTerminal.userOptions.textColor || DEFAULT_TEXT_COLOR;
  }

  /**
   * Guesses the password for the terminal.
   * @param  {string} password
   */
  function _guessPassword(password) {
    if(password === curTerminal._password)
      curTerminal._locked = false;
    else
      curTerminal._attempts--;
    _displayScreen(curTerminal._startId);
  }

  /**
   * Replaces \n's with <br/>'s.
   * @param  {string} str
   * @return {string}
   */
  function _htmlNewlines(str) {
    return str.replace(/\n/g, '<br/>');
  }

  /**
   * Initializes the internal JSON for the terminal. Optimized for use
   * by the Roll20 macro system.
   * @private
   * @param  {Terminal} json
   */
  function _initTerminal(json) {
    // Recursively create a map of each item in the terminal.
    curTerminal = {};
    nextItemId = 0;
    history = [];

    _initTerminalScreens(json);
    _.extend(curTerminal, {
      _locked: json.locked,
      _password: json.password,
      _attempts: json.attempts,
      _startId: json.id,
      _terminalName: json.name
    });
  }

  /**
   * Initializes the IDs for the terminal screens.
   * @private
   * @param  {TerminalScreen} screen
   */
  function _initTerminalScreens(screen) {
    // Assign the item an ID if it doesn't already have one.
    if(!screen.id) {
      screen.id = nextItemId;
      nextItemId++;
    }
    curTerminal[screen.id] = screen;

    // Recursively create the child items' IDs.
    screen.screenIds = [];
    _.each(screen.screens, function(child) {
      if(_.isObject(child)) {
        _initTerminalScreens(child);
        screen.screenIds.push(child.id);
      }
      else
        screen.screenIds.push(child);
    });
    delete screen.screens;
  }

 /**
  * Initialize the token macro for the terminals.
  */
  on('ready', function() {
    var macro = findObjs({
      _type: 'macro',
      name: 'displayTerminal'
    })[0];

    if(!macro) {
      var players = findObjs({
        _type: 'player'
      });
      var gms = _.filter(players, function(player) {
        return playerIsGM(player.get('_id'));
      });

      _.each(gms, function(gm) {
        createObj('macro', {
          _playerid: gm.get('_id'),
          name: 'displayTerminal',
          action: ACTIVATE_TERMINAL_CMD,
          istokenaction: true
        });
      });
    }

    log('=== Initialized Fallout Terminal v' + VERSION + ' ===');
  });

  /**
   * Process the terminal chat commands.
   */
  on('chat:message', function(msg) {
    try {
      if(msg.content === ACTIVATE_TERMINAL_CMD && msg.selected) {
        _activateTerminal(msg.selected[0]._id);
      }
      if(msg.content.indexOf(SHOW_SCREEN_CMD) === 0) {
        var args = msg.content.split(' ');
        var id = args[1];
        history.push(curScreenId);
        _displayScreen(args[1]);
      }
      if(msg.content.indexOf(PREV_SCREEN_CMD) === 0) {
        var id = history.pop();
        _displayScreen(id);
      }
      if(msg.content.indexOf(PASSWORD_CMD) === 0) {
        var args = msg.content.split(' ');
        var password = args.slice(1).join(' ');
        _guessPassword(password);
      }
    }
    catch(err) {
      log('FALLOT TERMINAL ERROR: ' + err.message);
    }
  });
})();
