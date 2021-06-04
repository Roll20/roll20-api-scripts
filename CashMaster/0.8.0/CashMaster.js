'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* global on log playerIsGM findObjs getObj getAttrByName sendChat globalconfig state */

/*
CASHMASTER 0.8.0

A currency management script for the D&D 5e OGL sheets on roll20.net.
Please use `!cm` for inline help and examples.

arthurbauer@me.com
*/

var initCM = function initCM() {
  // Initialize State object
  if (!state.CashMaster) {
    log('Initializing CashMaster');
    state.CashMaster = {
      Party: [],
      DefaultCharacterNames: {},
      TransactionHistory: [],
      MaxTransactionId: 0
    };
  }
  if (!state.CashMaster.Party) {
    log('Initializing CashMaster.Party');
    state.CashMaster.Party = [];
  }
  if (!state.CashMaster.DefaultCharacterNames) {
    log('Initializing CashMaster.DefaultCharacterNames');
    state.CashMaster.DefaultCharacterNames = {};
  }
  if (!state.CashMaster.TransactionHistory) {
    log('Initializing CashMaster.TransactionHistory');
    state.CashMaster.TransactionHistory = [];
  }
  if (!state.CashMaster.MaxTransactionId) {
    state.CashMaster.MaxTransactionId = 0;
    state.CashMaster.TransactionHistory.forEach(function (tx) {
      tx.Id = state.CashMaster.MaxTransactionId++; // eslint-disable-line no-param-reassign, no-plusplus
    });
  }
};

var transactionHistoryLength = 20;

var recordTransaction = function recordTransaction(type, initiator, playerEffects) {
  var id = state.CashMaster.MaxTransactionId++; // eslint-disable-line no-param-reassign, no-plusplus
  var timestamp = new Date().toUTCString();

  log('Add Transaction');
  log('  Id: ' + id);
  log('  Type: ' + type);
  log('  Initiator: ' + initiator);
  log('  Player Effects: ' + playerEffects);
  log('  Timestamp: ' + timestamp);

  state.CashMaster.TransactionHistory.push({
    Id: id,
    Type: type,
    Initiator: initiator,
    PlayerEffects: playerEffects,
    Time: timestamp,
    Reverted: false
  });

  // Only track a finite number of transactions so we don't clog up state
  if (state.CashMaster.TransactionHistory.length > transactionHistoryLength) {
    state.CashMaster.TransactionHistory.shift();
  }
};

var getDelta = function getDelta(finalState, initialState) {
  return [finalState[0] - initialState[0], finalState[1] - initialState[1], finalState[2] - initialState[2], finalState[3] - initialState[3], finalState[4] - initialState[4]];
};

var getPlayerEffect = function getPlayerEffect(playerName, delta) {
  return {
    PlayerName: playerName,
    Delta: delta
  };
};

var getInverseOperation = function getInverseOperation(delta) {
  return [-delta[0], -delta[1], -delta[2], -delta[3], -delta[4]];
};

// How much each coing is worth of those below it.
// In order: pp, gp, ep, sp
var conversionRatio = [10, 2, 5, 10];

var cashsplit = function cashsplit(c, m, x) {
  //! cashsplit
  var ct = 0;
  var cr = 0;
  if (c !== null) {
    ct = Math.floor(c / m);
    cr = c % m;
    if (cr >= x || c < 0 && cr < 0 && -cr < x) {
      ct += 1;
    }
  }
  return ct;
};

var getattr = function getattr(cid, att) {
  //! getattr
  var attr = findObjs({
    type: 'attribute',
    characterid: cid,
    name: att
  })[0];
  if (attr) {
    return attr.get('current');
  }
  return '';
};
var setattr = function setattr(cid, att, val) {
  //! setattr
  var attr = findObjs({
    type: 'attribute',
    characterid: cid,
    name: att
  })[0];
  if (typeof attr === 'undefined' || attr == null) {
    var _attr = createObj('attribute', { name: att, characterid: cid, current: parseFloat(val) }); // eslint-disable-line no-unused-vars, no-undef, no-shadow
  } else {
    attr.setWithWorker({
      current: parseFloat(val)
    }); // .set()
  }
};

var changeMoney = function changeMoney(startamount, addamount) {
  //! changeMoney
  if (addamount !== null) {
    var total = startamount;

    var currency = addamount.slice(-2);
    var amount2 = -parseFloat(addamount.substr(0, addamount.length - 2));
    var origamount = total;
    var amount3 = 0;
    if (currency === 'cp') {
      amount3 = amount2 / 100;
    }
    if (currency === 'sp') {
      amount3 = amount2 / 10;
    }
    if (currency === 'ep') {
      amount3 = amount2 / 2;
    }
    if (currency === 'gp') {
      amount3 = amount2;
    }
    if (currency === 'pp') {
      amount3 = amount2 * 10;
    }
    if (total[0] * 10 + total[1] + total[2] / 2 + total[3] / 10 + total[4] / 100 >= -amount3) {
      total[4] += amount3 * 100;
      while (total[4] < 0) {
        total[4] += 10;
        total[3] -= 1;
      } // cp
      while (total[3] < 0) {
        if (total[4] >= 10) {
          total[4] -= 10;
          total[3] += 1;
        } else {
          total[3] += 5;
          total[2] -= 1;
        }
      } // sp
      while (total[2] < 0) {
        if (total[3] >= 5) {
          total[3] -= 5;
          total[2] += 1;
        } else {
          total[2] += 2;
          total[1] -= 1;
        }
      } // ep
      while (total[1] < 0) {
        if (total[2] >= 2) {
          total[2] -= 2;
          total[1] += 1;
        } else {
          total[1] += 10;
          total[0] -= 1;
        }
      } // gp
      while (total[0] < 0) {
        if (total[1] >= 10) {
          total[1] -= 10;
          total[0] += 1;
        } else {
          total = origamount;
          return 'ERROR: Not enough cash.';
        }
      } // pp
      return total;
    }
    return 'ERROR: Not enough cash.';
  }
  return 0;
};

// Merge funds into the densest denomination possible.
// Account expects {pp, gp, ep, sp, cp}
var mergeMoney = function mergeMoney(account) {
  if (account == null) {
    return 'ERROR: Acount does not exist.';
  }
  if (account.length !== 5) {
    return 'ERROR: Account must be an array in the order of {pp, gp, ep, sp, cp}.';
  }

  for (var i = account.length - 1; i > 0; i -= 1) {
    var coinCount = account[i];
    var carry = Math.floor(coinCount / conversionRatio[i - 1]);
    var remainder = coinCount % conversionRatio[i - 1];
    account[i] = remainder; // eslint-disable-line no-param-reassign
    account[i - 1] += carry; // eslint-disable-line no-param-reassign
  }

  return account;
};

var toUsd = function toUsd(total) {
  var usd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 110;

  //! toUsd
  var output = '';
  if (usd > 0) {
    output = total + ' gp <small><br>(~ ' + Math.round(total * usd / 5) * 5 + ' USD)</small>';
  } else {
    output = total + ' gp';
  }
  return output;
};

var formatCurrency = function formatCurrency(pp, gp, ep, sp, cp) {
  var currencyStringArray = [];
  if (pp && pp !== 0) currencyStringArray.push('<em style=\'color:blue;\'>' + pp + 'pp</em>');
  if (gp && gp !== 0) currencyStringArray.push('<em style=\'color:orange;\'>' + gp + 'gp</em>');
  if (ep && ep !== 0) currencyStringArray.push('<em style=\'color:silver;\'>' + ep + 'ep</em>');
  if (sp && sp !== 0) currencyStringArray.push('<em style=\'color:grey;\'>' + sp + 'sp</em>');
  if (cp && cp !== 0) currencyStringArray.push('<em style=\'color:brown;\'>' + cp + 'cp</em>');
  return currencyStringArray.join(', ');
};

var playerCoinStatus = function playerCoinStatus(character) {
  var usd = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 110;

  //! playerCoinStatus

  var name = getAttrByName(character.id, 'character_name');
  var pp = parseFloat(getattr(character.id, 'pp')) || 0;
  var gp = parseFloat(getattr(character.id, 'gp')) || 0;
  var ep = parseFloat(getattr(character.id, 'ep')) || 0;
  var sp = parseFloat(getattr(character.id, 'sp')) || 0;
  var cp = parseFloat(getattr(character.id, 'cp')) || 0;
  var total = Math.round((pp * 10 + ep * 0.5 + gp + sp / 10 + cp / 100) * 10000) / 10000;
  var weight = (pp + gp + ep + sp + cp) / 50;

  var output = name + ': <b>$' + toUsd(total, usd) + '</b><br><small>';
  output += formatCurrency(pp, gp, ep, sp, cp);

  output += '<br>(' + weight + ' lbs)</small><br><br>';
  return [output, total];
};

var getNonZeroCurrency = function getNonZeroCurrency(accountArray) {
  var currencyStringArray = [];
  if (accountArray[0] && accountArray[0] !== 0) currencyStringArray.push(accountArray[0] + 'pp');
  if (accountArray[1] && accountArray[1] !== 0) currencyStringArray.push(accountArray[1] + 'gp');
  if (accountArray[2] && accountArray[2] !== 0) currencyStringArray.push(accountArray[2] + 'ep');
  if (accountArray[3] && accountArray[3] !== 0) currencyStringArray.push(accountArray[3] + 'sp');
  if (accountArray[4] && accountArray[4] !== 0) currencyStringArray.push(accountArray[4] + 'cp');
  return currencyStringArray.join(' ');
};

var getRecipientOptions = function getRecipientOptions() {
  if (state.CashMaster) {
    var existingOptions = state.CashMaster.Party.join('|');

    // If ones already exist, append "|Other, ?{Type Full Name}"
    if (existingOptions.length > 0) {
      return '|' + existingOptions + '|Other,?{Type Full Name&amp;#125;';
    }
    return '';
  }
  return null;
};

var getCharByAny = function getCharByAny(nameOrId) {
  var character = null;

  // Try to directly load the character ID
  character = getObj('character', nameOrId);
  if (character) {
    return character;
  }

  // Try to load indirectly from the token ID
  var token = getObj('graphic', nameOrId);
  if (token) {
    character = getObj('character', token.get('represents'));
    if (character) {
      return character;
    }
  }

  // Try loading through char name
  var list = findObjs({
    _type: 'character',
    name: nameOrId
  });
  if (list.length === 1) {
    return list[0];
  }

  // Default to null
  return null;
};

var getStringInQuotes = function getStringInQuotes(string) {
  var quietMode = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var scname = 'CashMaster';
  var startQuote = string.indexOf('"');
  var endQuote = string.lastIndexOf('"');
  if (startQuote >= endQuote) {
    if (!quietMode) {
      sendChat(scname, '**ERROR:** You must specify a target by name within double quotes in the phrase ' + string);
    }
    return null;
  }
  return string.substring(startQuote + 1, endQuote);
};

var getDefaultCharNameFromPlayer = function getDefaultCharNameFromPlayer(playerid) {
  var defaultName = state.CashMaster.DefaultCharacterNames[playerid];
  if (!defaultName) {
    return null;
  }
  return defaultName;
};

var ParseException = function ParseException(message) {
  var _this = this;

  _classCallCheck(this, ParseException);

  this.message = message;
  this.name = 'Parse Exception';
  this.toString = function () {
    return _this.name + ': ' + _this.message;
  };
};

on('ready', function () {
  var v = '0.8.0'; // version number
  var usd = 110;
  /*
  Change this if you want to have a rough estimation of a character’s wealth in USD.
  After some research I believe a reasonable exchange ratio is roughly 1 gp = 110 USD
  Set it to 0 to disable it completely.
  */

  var scname = 'CashMaster'; // script name
  var selectedsheet = 'OGL'; // You can set this to "5E-Shaped" if you're using the Shaped sheet

  // detecting useroptions from one-click
  if (globalconfig && globalconfig.cashmaster && globalconfig.cashmaster.useroptions) {
    selectedsheet = globalconfig.cashmaster.useroptions.selectedsheet; // eslint-disable-line prefer-destructuring
  }
  var rt = '';
  if (selectedsheet === 'OGL') {
    rt = ['desc', 'desc'];
  } else if (selectedsheet === '5E-Shaped') {
    rt = ['5e-shaped', 'text'];
  } else {
    rt = ['default', 'name=' + scname + ' }}{{note'];
  }

  log(scname + ' v' + v + ' online. For assistance, use `!cm -help`');

  var pp = void 0;
  var gp = void 0;
  var ep = void 0;
  var sp = void 0;
  var cp = void 0;
  var total = void 0;
  var output = void 0;
  var ppa = void 0;
  var gpa = void 0;
  var epa = void 0;
  var spa = void 0;
  var cpa = void 0;
  var ppg = void 0;
  var gpg = void 0;
  var epg = void 0;
  var spg = void 0;
  var cpg = void 0;
  var name = void 0;
  var usd2 = void 0;
  var pcName = void 0;

  var populateCoinContents = function populateCoinContents(input) {
    ppg = /([\s|,|^|"|'])((-?\d{1,16} ?)(pp|PP|Pp|pP))(\s|,|$|"|')/;
    ppa = ppg.exec(input);

    gpg = /([\s|,|^|"|'])((-?\d{1,16} ?)(gp|GP|Gp|gP))(\s|,|$|"|')/;
    gpa = gpg.exec(input);

    epg = /([\s|,|^|"|'])((-?\d{1,16} ?)(ep|EP|Ep|eP))(\s|,|$|"|')/;
    epa = epg.exec(input);

    spg = /([\s|,|^|"|'])((-?\d{1,16} ?)(sp|SP|Sp|sP))(\s|,|$|"|')/;
    spa = spg.exec(input);

    cpg = /([\s|,|^|"|'])((-?\d{1,16} ?)(cp|CP|Cp|cP))(\s|,|$|"|')/;
    cpa = cpg.exec(input);
  };

  var parseSubcommand = function parseSubcommand(msg, subcommand, argTokens) {
    var subjectList = [];
    var targetList = [];
    var currencySpecified = false;
    var allowStringTarget = argTokens.includes('-dropWithReason') || argTokens.includes('-giveNPC');

    // Wrapping in try/catch because of the forEach.  This allows us to easily escape to report errors to the user immediately.
    try {
      // Advanced Mode
      var tagList = subcommand.split(' -');
      tagList.forEach(function (param) {
        if (param.startsWith('S ')) {
          var subjectNameList = getStringInQuotes(param);
          var subjectNames = subjectNameList.split(',');
          subjectNames.forEach(function (subjectName) {
            if (subjectName.length === 0) {
              throw new ParseException('Empty string subject provided!');
            }
            var subject = getCharByAny(subjectName);
            if (subject == null) {
              throw new ParseException('Provided Subject name does not exist!');
            }
            subjectList.push(subject);
          });
        } else if (param.startsWith('T ')) {
          var targetNameList = getStringInQuotes(param);
          var targetNames = targetNameList.split(',');
          targetNames.forEach(function (targetName) {
            if (allowStringTarget) {
              targetList.push(targetName);
            } else {
              if (targetName.length === 0) {
                throw new ParseException('Empty string target provided!');
              }
              var target = getCharByAny(targetName);
              if (target == null) {
                throw new ParseException('Provided Target name does not exist!');
              }
              targetList.push(target);
            }
          });
        } else if (param.startsWith('C ')) {
          var currencyString = getStringInQuotes(param);
          if (currencyString === null) {
            return;
          }
          populateCoinContents(currencyString);
          currencySpecified = true;
        }
      });

      // Simple Mode
      if (subjectList.length === 0) {
        // Prevent double-parsing
        targetList = [];

        var ambiguousNameList = getStringInQuotes(subcommand, true);
        var ambiguousNames = [];
        if (ambiguousNameList !== null) {
          ambiguousNames = ambiguousNameList.split(',');
        }

        var defaultName = getDefaultCharNameFromPlayer(msg.playerid);

        // In the event the user has no default and token selected (or have specified -noToken), assume subject
        if (defaultName === null && (msg.selected === null || argTokens.includes('-noToken') || argTokens.includes('-nt'))) {
          ambiguousNames.forEach(function (subjectName) {
            var subject = getCharByAny(subjectName);
            if (subject == null) {
              throw new ParseException('Provided Subject name does not exist!');
            }
            subjectList.push(subject);
          });
        } else {
          // Otherwise, assume selected are subject and quoted are targets
          ambiguousNames.forEach(function (targetName) {
            if (allowStringTarget) {
              targetList.push(targetName);
            } else {
              var target = getCharByAny(targetName);
              if (target == null) {
                throw new ParseException('Provided Target name does not exist!');
              }
              targetList.push(target);
            }
          });

          // Load from selection
          if (msg.selected != null) {
            msg.selected.forEach(function (selection) {
              log('Selection: ' + selection);
              var token = getObj('graphic', selection._id); // eslint-disable-line no-underscore-dangle
              var subject = null;
              if (token) {
                subject = getObj('character', token.get('represents'));
              }
              if (subject === null) {
                sendChat(scname, '**ERROR:** sender does not exist.');
                return null;
              }
              subjectList.push(subject);
              return null;
            });
          }

          // Load from default
          if (subjectList.length === 0) {
            if (defaultName === null) {
              return null;
            }
            var subject = getCharByAny(defaultName);
            if (subject === null) {
              return null;
            }
            subjectList.push(subject);
          }
        }
      }

      // If given no particular subset to parse, parse the whole subcommand
      // WARNING: This could cause unexpected behavior when using object id mode
      if (!currencySpecified) {
        populateCoinContents(subcommand);
      }
    } catch (e) {
      sendChat(scname, '/w ' + msg.who + ' **ERROR:** ' + e);
      sendChat(scname, '/w gm **ERROR:** ' + msg.who + ' received: ' + e);
      return null;
    }

    log('Subjects: ' + subjectList);
    log('Targets: ' + targetList);
    return {
      Subjects: subjectList,
      Targets: targetList
    };
  };

  var printTransactionHistory = function printTransactionHistory(sender) {
    var historyContent = '/w ' + sender + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<h3>Cash Master</h3><hr>';
    state.CashMaster.TransactionHistory.forEach(function (transaction) {
      var playerEffects = '<ul>';
      var operationList = [];
      transaction.PlayerEffects.forEach(function (effect) {
        var formattedCurrency = formatCurrency(effect.Delta[0], effect.Delta[1], effect.Delta[2], effect.Delta[3], effect.Delta[4] // eslint-disable-line comma-dangle
        );
        if (transaction.Reverted) {
          playerEffects += '<li><strike>' + effect.PlayerName + ':' + formattedCurrency + '</strike></li>';
        } else {
          playerEffects += '<li>' + effect.PlayerName + ':' + formattedCurrency + '</li>';
        }
        operationList.push('-add -noToken &#34;' + effect.PlayerName + '&#34; ' + getNonZeroCurrency(getInverseOperation(effect.Delta)));
      });
      playerEffects += '</ul>';

      historyContent += '<br><h4>' + transaction.Type + '</h4><br>' + transaction.Time + '<br>Initiated by ' + transaction.Initiator + '<br><b>Player Effects</b>' + playerEffects + '<br>';

      // If it hasn't been reverted yet, display revert button.  Otherwise, strikethrough.
      if (!transaction.Reverted) {
        operationList.push('-revert ' + transaction.Id);
        var revertOperation = '!cm ' + operationList.join(';');
        historyContent += '[Revert Transaction](' + revertOperation + ')<br>';
      }
    });
    historyContent += '}}';
    sendChat(scname, historyContent);
  };

  on('chat:message', function (msg) {
    var subcommands = msg.content.split(';');
    if (msg.type !== 'api') return;
    if (msg.content.startsWith('!cm') !== true) return;

    // Initialize State object
    initCM();

    // Log the received command
    log('CM Command: ' + msg.content);
    // Execute each operation
    subcommands.forEach(function (subcommand) {
      log('CM Subcommand: ' + subcommand);
      var argTokens = subcommand.split(/\s+/);

      // Operations that do not require a selection
      if (subcommand === '!cm' || argTokens.includes('-help') || argTokens.includes('-h')) {
        //! help
        sendChat(scname, '/w gm <h1 id=\'cashmaster\'>CashMaster</h1><p>A currency management script for the D&amp;D 5e OGL and 5e Shaped sheets on Roll20.net.</p><p>Please use <code>!cm</code> for inline help and examples.</p><h2 id=\'setup\'>Setup</h2><h3 id=\'player-setup\'>Player Setup</h3><ol><li>Create a macro bar button for the command <code>!cm -menu</code></li><li>Press the CashMaster button you just created.  It will display a menu in the chat log.</li><li>Click on your character token</li><li>Press the chat UI button titled Set Default Character.</li></ol><h3 id=\'gm-setup\'>GM Setup</h3><ol><li>Set the character sheet setting (<code>OGL</code>, <code>5E-Shaped</code>, or <code>other</code>).</li><li>Create a macro bar button for the command <code>!cm -menu</code></li><li>Press the CashMaster button you just created.  It will display a menu in the chat log.</li><li>Select the character tokens of ALL party members and companion NPCs.  Do not select pets or mounts unless the party considers them an equal member of the party (and thus should be a valid recipient for <code>-loot</code> and similar commands).  Such creatures must have full character sheets with currency fields.</li><li>Press the chat UI button titled Set Party to Selected.</li></ol><h2 id=\'player-commands\'>Player Commands</h2><h3 id=\'help-commands\'>Help Commands</h3><ul><li><code>!cm</code> or <code>!cm -help</code> or <code>!cm -h</code> will show this help overview</li><li><code>!cm -menu</code> or <code>!cm -tool</code> to bring up the user menu</li><li><code>!cm -status</code> or <code>!cm -ss</code> to display your current coin purse contents</li></ul><h3 id=\'accounting-commands\'>Accounting commands</h3><p>A character has a tracked account if it has discrete values for its saved coins.  PCs necessarily have tracked accounts while NPCs usually do not, instead having as much gold as the DM feels is necessary at that moment.</p><ul><li><code>!cm -transfer &quot;[recipient character name]&quot; [amount][currency]</code> or <code>!cm -t &quot;[recipient character name]&quot; [amount][currency]</code> to transfer coins to the recipient&#39;s tracked account.</li><li><code>!cm -invoice &quot;[recipient character name]&quot; [amount][currency]</code> or <code>!cm -i &quot;[recipient character name]&quot; [amount][currency]</code> to request coins to the recipient&#39;s tracked account.</li><li><code>!cm -giveNPC &quot;[NPC Name, service rendered]&quot; [amount][currency]</code> or <code>!cm -dropWithReason &quot;[reason for dropping coins]&quot; [amount][currency]</code> to move coins from the player&#39;s tracked account to an untracked account.</li></ul><h2 id=\'gm-commands\'>GM Commands</h2><p>In addition to the above commands, the GM has access to the following commands.</p><h3 id=\'help-commands\'>Help commands</h3><ul><li><code>!cm</code> or <code>!cm -help</code> or <code>!cm -h</code> will show this help overview</li><li><code>!cm -overview</code> or <code>!cm -o</code> to get an <strong>overview</strong> over the party&#39;s cash</li><li><code>!cm -overview --usd</code> will also give you an overview and a rough conversion to USD (default value: 1 gp equals roughly 110 USD).</li></ul><h3 id=\'accounting-commands\'>Accounting Commands</h3><p>These operations directly add and remove gold from party inventories.</p><ul><li><code>!cm -add [amount][currency]</code> or <code>!cm -a [amount][currency]</code> to <strong>add</strong> an equal amount of money to each selected party member,</li><li><code>!cm -loot [amount][currency]</code> or <code>!cm -l [amount][currency]</code> to <strong>split up</strong> a certain amount of coins between the party members, like a found treasure. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won&#39;t get anything.</li><li><code>!cm -sub [amount][currency]</code> or <code>!cm -pay [amount][currency]</code> or <code>!cm -p [amount][currency]</code> to let each selected party member <strong>pay</strong> a certain amount. The script will even try to take higher and lower coin types to get the full amount. E.g. to pay 1gp when the character has no gold, the script will use 1pp (and return 9gp), or it will take 2ep, 10sp or 100cp - or any other valid combination of coins - to pay the desired amount.</li></ul><h3 id=\'admin-commands\'>Admin Commands</h3><p>Use caution when using the below commands.</p><ul><li><code>!cm -merge</code> or <code>!cm -m</code> to <strong>merge</strong> coins to the densest denomination possible.</li><li><code>!cm -share</code> or <code>!cm -s</code> to <strong>reallocate and share</strong> the money equally between selected party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),</li><li><code>!cm -best-share</code> or <code>!cm -bs</code> to <strong>reallocate and share</strong> the money equally between selected party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),</li><li><code>!cm -setParty</code> or <code>!cm -sp</code> to set the default party list.  These will be the default targets for party actions if you have nothing selected.</li><li><code>!cm -revert</code> or <code>!cm -r</code> reverts a given transaction id.  This is an internal command used to revert transactions.</li></ul><h2 id=\'tips\'>Tips</h2><ol><li><code>-noToken</code> and <code>-nt</code> will cause CashMaster to disregard what character is selected.</li><li>You can use several coin values at once, e.g. <code>!cm -loot 50gp 150sp 2000cp</code> or <code>!cm -pay 2sp 5cp</code>.</li><li>You can combine multiple subcommands into a single chat command with a semicolon <code>;</code> between them.  For example, <code>!cm -add 5gp; -merge</code></li><li>You can select multiple subjects and targets using <strong>Advanced Mode</strong>.  For example, <code>!cm -transfer -S &quot;Billy Bob,Joe Bob&quot; -T &quot;Sarah Bob,Sonya Bob&quot; -C &quot;10gp&quot;</code>.  When using multiple subjects and targets, it will perform an operation for each subject-target pair.  In that case, it will perform four transactions of 10gp each.</li><li>In <strong>Advanced Mode</strong>, you don&#39;t need to specify <code>-C &quot;[amoung][currency]&quot;</code> and can instead just use the standard <code>[amount][currency]</code>.  The <code>-C</code> currency tag allows you to specify the gp value at a particular point in the command in case you have strangley-named or inconveniently ID&#39;d characters.</li><li>CashMaster will parse <strong>both character IDs and character names</strong>.  You can even mix and match!  If Billy Bob&#39;s ID was <code>-L4ncF3ych3ZLtWaY3uY</code>, Instead of the example in <strong>Tip 4</strong>, you could use <code>!cm -transfer -S &quot;-L4ncF3ych3ZLtWaY3uY,Joe Bob&quot; -T &quot;Sarah Bob,Sonya Bob&quot; -C &quot;10gp&quot;</code>.</li><li>CashMaster is compatible with <code>@{selected|character_id}</code> and <code>@{target|character_id}</code> as they will simply be parsed down to IDs.  As an example, your players could use <code>!cm -t -T &quot;@{target|character_id}&quot; 1gp</code> to transfer a gold amongst themselves.</li></ol><h2 id=\'examples\'>Examples</h2><ol><li><code>!cm -overview</code> will show a cash overview.</li><li><code>!cm -add 50gp</code> will add 50 gp to every selected character.</li><li><code>!cm -loot 50gp</code> will (more or less evenly) distribute 50 gp among the party members.</li><li><code>!cm -pay 10gp</code> will subtract 10gp from each selected character. It will try to exchange the other coin types (e.g. it will use 1pp if the player doesn&#39;t have 10gp).</li><li><code>!cm -share</code> will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to &#39;exchange&#39; money.</li><li><code>!cm -transfer &quot;Tazeka Liranov&quot; 40gp</code> will transfer 40 gp from the selected token to the character sheet named Tazeka Liranov.</li><li><code>!cm -convert</code> - same as <code>!cm -share</code>, but will also use platinum and electrum.</li></ol><h2 id=\'credits\'>Credits</h2><p>With thanks to <a href=\'https://app.roll20.net/users/277007/kryx\'>Kryx</a>/<a href=\'https://github.com/mlenser\'>mlenser</a> and <a href=\'https://app.roll20.net/users/1583758/michael-g\'>Michael G.</a>/<a href=\'https://github.com/VoltCruelerz\'>VoltCruelerz</a> for their contributions.</p>'); // eslint-disable-line quotes
      }

      // Display the CashMaster Menu
      if (argTokens.includes('-menu') || argTokens.includes('-toolbar') || argTokens.includes('-tool')) {
        var menuContent = '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<h3>Cash Master</h3><hr>' + '<h4>Universal Commands</h4>[Toolbar](!cm -tool)' + '<br>[Status](!cm -status)' + ('<br>[Transfer to PC](!cm -transfer &#34;?{Recipient' + getRecipientOptions() + '}&#34; ?{Currency to Transfer})') + '<br>[Transfer to NPC](!cm -giveNPC &#34;?{List recipient name and reason}&#34; ?{Currency to Transfer})' + ('<br>[Invoice Player](!cm -invoice &#34;?{Invoicee' + getRecipientOptions() + '}&#34; ?{Currency to Request})') + '<br>[Set Default Character](!cm -sc ?{Will you set a new default character|Yes})';
        if (playerIsGM(msg.playerid)) {
          menuContent = menuContent + '<h4>GM-Only Commands</h4>' + '<b>Base Commands</b>' + '<br>[Readme](!cm -help)<br>[Party Overview](!cm -overview)' + '<br>[Selected USD](!cm -overview --usd)' + '<br><b>Accounting Commands</b>' + '<br>[Credit Each Selected](!cm -add ?{Currency to Add})' + '<br>[Bill Each Selected](!cm -sub ?{Currency to Bill})' + '<br>[Split Among Selected](!cm -loot ?{Amount to Split})' + '<br>[Transaction History](!cm -th)' + '<br><b>Admin Commands</b>' + '<br>[Compress Coins of Selected](!cm -merge)' + '<br>[Reallocate Coins](!cm -s ?{Will you REALLOCATE party funds evenly|Yes})' + '<br>[Set Party to Selected](!cm -sp ?{Will you SET the party to selected|Yes})';
        }
        menuContent += '}}';
        sendChat(scname, menuContent);
        return;
      }

      // Selectionless GM commands
      if (playerIsGM(msg.playerid)) {
        if (argTokens.includes('-transactionHistory') || argTokens.includes('-th')) {
          var sender = msg.who;
          printTransactionHistory(sender);
          return;
        }

        if (argTokens.includes('-revert') || argTokens.includes('-r')) {
          var id = parseFloat(argTokens[1]);
          var tx = state.CashMaster.TransactionHistory.find(function (element) {
            return element.Id === id;
          });
          tx.Reverted = true;
          var _sender = msg.who;
          printTransactionHistory(_sender);
          return;
        }
      }

      // From this point forward, there must at minimum be a Subject (possibly targets as well).
      var parsedSubcommand = parseSubcommand(msg, subcommand, argTokens);
      if (parsedSubcommand === null) {
        return;
      }
      var subjects = parsedSubcommand.Subjects;
      var targets = parsedSubcommand.Targets;
      if (subjects === null) {
        log('Invalid Input (null subjects).  Aborting.');
      }
      if (subjects.length === 0) {
        log('Invalid Input (no subjects).  Aborting.');
      }

      // Coin Transfer between players
      if (argTokens.includes('-transfer') || argTokens.includes('-t')) {
        subjects.forEach(function (subject) {
          targets.forEach(function (target) {
            output = '';
            var transactionOutput = '';
            var subjectOutput = '';
            var targetOutput = '';

            var subjectName = getAttrByName(subject.id, 'character_name');
            var targetName = getAttrByName(target.id, 'character_name');

            // Check that the sender is not attempting to send money to themselves
            if (subject.id === target.id) {
              sendChat(scname, '**ERROR:** target character must not be selected character.');
              return;
            }

            // Verify subject has enough to perform transfer
            // Check if the player attempted to steal from another and populate the transaction data
            transactionOutput += '<br><b>Transaction Data</b>';
            if (ppa !== null) {
              var val = parseFloat(ppa[3]);
              transactionOutput += '<br> <em style=\'color:blue;\'>' + ppa[2] + '</em>';
              if (val < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
                return;
              }
            }
            if (gpa !== null) {
              var _val = parseFloat(gpa[3]);
              transactionOutput += '<br> <em style=\'color:orange;\'>' + gpa[2] + '</em>';
              if (_val < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
                return;
              }
            }
            if (epa !== null) {
              var _val2 = parseFloat(epa[3]);
              transactionOutput += '<br> <em style=\'color:silver;\'>' + epa[2] + '</em>';
              if (_val2 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
                return;
              }
            }
            if (spa !== null) {
              var _val3 = parseFloat(spa[3]);
              transactionOutput += '<br> <em style=\'color:grey;\'>' + spa[2] + '</em>';
              if (_val3 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
                return;
              }
            }
            if (cpa !== null) {
              var _val4 = parseFloat(cpa[3]);
              transactionOutput += '<br> <em style=\'color:brown;\'>' + cpa[2] + '</em>';
              if (_val4 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '/w gm **ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
                return;
              }
            }

            // Load subject's existing account
            var dpp = parseFloat(getattr(subject.id, 'pp')) || 0;
            var dgp = parseFloat(getattr(subject.id, 'gp')) || 0;
            var dep = parseFloat(getattr(subject.id, 'ep')) || 0;
            var dsp = parseFloat(getattr(subject.id, 'sp')) || 0;
            var dcp = parseFloat(getattr(subject.id, 'cp')) || 0;
            var subjectAccount = [dpp, dgp, dep, dsp, dcp];
            var subjectInitial = [dpp, dgp, dep, dsp, dcp];

            if (ppa !== null) subjectAccount = changeMoney(subjectAccount, ppa[2]);
            if (gpa !== null) subjectAccount = changeMoney(subjectAccount, gpa[2]);
            if (epa !== null) subjectAccount = changeMoney(subjectAccount, epa[2]);
            if (spa !== null) subjectAccount = changeMoney(subjectAccount, spa[2]);
            if (cpa !== null) subjectAccount = changeMoney(subjectAccount, cpa[2]);

            // Verify subject has enough to perform transfer
            subjectOutput += '<br><b>' + subjectName + '</b> has ';
            if (subjectAccount === 'ERROR: Not enough cash.') {
              subjectOutput += 'not enough cash!';
            } else {
              var subjectEffect = getPlayerEffect(subjectName, getDelta(subjectAccount, subjectInitial));

              // Update subject account and update output
              setattr(subject.id, 'pp', parseFloat(subjectAccount[0]));
              setattr(subject.id, 'gp', parseFloat(subjectAccount[1]));
              setattr(subject.id, 'ep', parseFloat(subjectAccount[2]));
              setattr(subject.id, 'sp', parseFloat(subjectAccount[3]));
              setattr(subject.id, 'cp', parseFloat(subjectAccount[4]));
              subjectOutput += '<br> <em style=\'color:blue;\'>' + subjectAccount[0] + 'pp</em>';
              subjectOutput += '<br> <em style=\'color:orange;\'>' + subjectAccount[1] + 'gp</em>';
              subjectOutput += '<br> <em style=\'color:silver;\'>' + subjectAccount[2] + 'ep</em>';
              subjectOutput += '<br> <em style=\'color:grey;\'>' + subjectAccount[3] + 'sp</em>';
              subjectOutput += '<br> <em style=\'color:brown;\'>' + subjectAccount[4] + 'cp</em>';

              // targetFunds
              var tpp = parseFloat(getattr(target.id, 'pp')) || 0;
              var tgp = parseFloat(getattr(target.id, 'gp')) || 0;
              var tep = parseFloat(getattr(target.id, 'ep')) || 0;
              var tsp = parseFloat(getattr(target.id, 'sp')) || 0;
              var tcp = parseFloat(getattr(target.id, 'cp')) || 0;
              var targetInitial = [tpp, tgp, tep, tsp, tcp];
              if (ppa !== null) tpp += parseFloat(ppa[3]);
              if (gpa !== null) tgp += parseFloat(gpa[3]);
              if (epa !== null) tep += parseFloat(epa[3]);
              if (spa !== null) tsp += parseFloat(spa[3]);
              if (cpa !== null) tcp += parseFloat(cpa[3]);
              var targetFinal = [tpp, tgp, tep, tsp, tcp];
              var targetEffect = getPlayerEffect(targetName, getDelta(targetFinal, targetInitial));

              setattr(target.id, 'pp', tpp);
              setattr(target.id, 'gp', tgp);
              setattr(target.id, 'ep', tep);
              setattr(target.id, 'sp', tsp);
              setattr(target.id, 'cp', tcp);
              targetOutput += '<br><b>' + targetName + '</b> has ';
              targetOutput += '<br> <em style=\'color:blue;\'>' + tpp + 'pp</em>';
              targetOutput += '<br> <em style=\'color:orange;\'>' + tgp + 'gp</em>';
              targetOutput += '<br> <em style=\'color:silver;\'>' + tep + 'ep</em>';
              targetOutput += '<br> <em style=\'color:grey;\'>' + tsp + 'sp</em>';
              targetOutput += '<br> <em style=\'color:brown;\'>' + tcp + 'cp</em>';

              recordTransaction('Transfer to PC', msg.who, [subjectEffect, targetEffect]);
            }
            sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM Transfer Report</b><br>' + subjectName + '>' + targetName + '</b><hr>' + transactionOutput + subjectOutput + targetOutput + '}}');
            sendChat(scname, '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Sender Transfer Report</b><br>' + subjectName + ' > ' + targetName + '</b><hr>' + output + transactionOutput + subjectOutput + '}}');
            sendChat(scname, '/w ' + targetName + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Recipient Transfer Report</b><br>' + subjectName + ' > ' + targetName + '</b><hr>' + output + transactionOutput + targetOutput + '}}');
          });
        });
        return;
      }

      // Invoice between players
      if (argTokens.includes('-invoice') || argTokens.includes('-i')) {
        subjects.forEach(function (subject) {
          targets.forEach(function (target) {
            output = '';
            var transactionOutput = '';
            var targetOutput = '';
            var invoiceAmount = '';
            var subjectName = getAttrByName(subject.id, 'character_name');
            var targetName = getAttrByName(target.id, 'character_name');

            // Check that the sender is not attempting to send money to themselves
            if (subject.id === target.id) {
              sendChat(scname, '**ERROR:** target character must not be selected character.');
              return;
            }

            // Verify subject has enough to perform transfer
            // Check if the player attempted to reverse-invoice themselves
            transactionOutput += '<br><b>Requested Funds:</b>';
            if (ppa !== null) {
              var val = parseFloat(ppa[3]);
              transactionOutput += '<br> ' + ppa[2];
              invoiceAmount += ' ' + ppa[2];
              if (val < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not reverse-invoice themselves.');
                return;
              }
            }
            if (gpa !== null) {
              var _val5 = parseFloat(gpa[3]);
              transactionOutput += '<br> ' + gpa[2];
              invoiceAmount += ' ' + gpa[2];
              if (_val5 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not reverse-invoice themselves.');
                return;
              }
            }
            if (epa !== null) {
              var _val6 = parseFloat(epa[3]);
              transactionOutput += '<br> ' + epa[2];
              invoiceAmount += ' ' + epa[2];
              if (_val6 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not reverse-invoice themselves.');
                return;
              }
            }
            if (spa !== null) {
              var _val7 = parseFloat(spa[3]);
              transactionOutput += '<br> ' + spa[2];
              invoiceAmount += ' ' + spa[2];
              if (_val7 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '**ERROR:** ' + msg.who + ' may not reverse-invoice themselves.');
                return;
              }
            }
            if (cpa !== null) {
              var _val8 = parseFloat(cpa[3]);
              transactionOutput += '<br> ' + cpa[2];
              invoiceAmount += ' ' + cpa[2];
              if (_val8 < 0 && !playerIsGM(msg.playerid)) {
                sendChat(scname, '/w gm **ERROR:** ' + msg.who + ' may not reverse-invoice themselves.');
                return;
              }
            }

            // Load target's existing account
            var tpp = parseFloat(getattr(target.id, 'pp')) || 0;
            var tgp = parseFloat(getattr(target.id, 'gp')) || 0;
            var tep = parseFloat(getattr(target.id, 'ep')) || 0;
            var tsp = parseFloat(getattr(target.id, 'sp')) || 0;
            var tcp = parseFloat(getattr(target.id, 'cp')) || 0;

            targetOutput += '<hr><b>Current Funds of ' + targetName + '</b>';
            targetOutput += '<br> ' + tpp + 'pp';
            targetOutput += '<br> ' + tgp + 'gp';
            targetOutput += '<br> ' + tep + 'ep';
            targetOutput += '<br> ' + tsp + 'sp';
            targetOutput += '<br> ' + tcp + 'cp';
            sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM Invoice Report</b><br>' + subjectName + '>' + targetName + '</b><hr>' + transactionOutput + targetOutput + '}}');
            sendChat(scname, '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Invoice Sent to ' + targetName + '</b><hr>' + transactionOutput + '}}');
            sendChat(scname, '/w ' + targetName + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Invoice Received from ' + subjectName + '</b><hr>' + transactionOutput + targetOutput + '<hr>[Pay](!cm -transfer -S &#34;' + targetName + '&#34; -T &#34;' + subjectName + '&#34; -C &#34;' + invoiceAmount + '&#34;)}}');
          });
        });
        return;
      }

      // Display coin count to player
      if (argTokens.includes('-status') || argTokens.includes('-ss')) {
        subjects.forEach(function (subject) {
          var coinStatus = playerCoinStatus(subject);
          sendChat(scname, '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Coin Purse Status</b></b><hr>' + coinStatus[0] + '}}');
        });
        return;
      }

      // Drop Currency or Give it to an NPC
      if (argTokens.includes('-dropWithReason') || argTokens.includes('-giveNPC')) {
        subjects.forEach(function (subject) {
          output = '';
          var transactionOutput = '';
          var subjectOutput = '';
          var subjectName = getAttrByName(subject.id, 'character_name');
          var reason = targets[0];
          // Verify subject has enough to perform transfer
          // Check if the player attempted to steal from another and populate the transaction data
          transactionOutput += '<br><b>Transaction Data</b>';
          if (ppa !== null) {
            var val = parseFloat(ppa[3]);
            transactionOutput += '<br> ' + ppa[2];
            if (val < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' tried to steal.');
              return;
            }
          }
          if (gpa !== null) {
            var _val9 = parseFloat(gpa[3]);
            transactionOutput += '<br> ' + gpa[2];
            if (_val9 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' tried to steal.');
              return;
            }
          }
          if (epa !== null) {
            var _val10 = parseFloat(epa[3]);
            transactionOutput += '<br> ' + epa[2];
            if (_val10 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' tried to steal.');
              return;
            }
          }
          if (spa !== null) {
            var _val11 = parseFloat(spa[3]);
            transactionOutput += '<br> ' + spa[2];
            if (_val11 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' tried to steal.');
              return;
            }
          }
          if (cpa !== null) {
            var _val12 = parseFloat(cpa[3]);
            transactionOutput += '<br> ' + cpa[2];
            if (_val12 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' tried to steal.');
              return;
            }
          }

          // Load subject's existing account
          var dpp = parseFloat(getattr(subject.id, 'pp')) || 0;
          var dgp = parseFloat(getattr(subject.id, 'gp')) || 0;
          var dep = parseFloat(getattr(subject.id, 'ep')) || 0;
          var dsp = parseFloat(getattr(subject.id, 'sp')) || 0;
          var dcp = parseFloat(getattr(subject.id, 'cp')) || 0;
          var subjectInitial = [dpp, dgp, dep, dsp, dcp];
          var subjectAccount = [dpp, dgp, dep, dsp, dcp];

          if (ppa !== null) subjectAccount = changeMoney(subjectAccount, ppa[2]);
          if (gpa !== null) subjectAccount = changeMoney(subjectAccount, gpa[2]);
          if (epa !== null) subjectAccount = changeMoney(subjectAccount, epa[2]);
          if (spa !== null) subjectAccount = changeMoney(subjectAccount, spa[2]);
          if (cpa !== null) subjectAccount = changeMoney(subjectAccount, cpa[2]);

          // Verify subject has enough to perform transfer
          subjectOutput += '<br><b>' + subjectName + '</b> has ';
          if (subjectAccount === 'ERROR: Not enough cash.') {
            subjectOutput += 'not enough cash!';
          } else {
            var subjectEffect = getPlayerEffect(subjectName, getDelta(subjectAccount, subjectInitial));

            // Update subject account and update output
            setattr(subject.id, 'pp', parseFloat(subjectAccount[0]));
            setattr(subject.id, 'gp', parseFloat(subjectAccount[1]));
            setattr(subject.id, 'ep', parseFloat(subjectAccount[2]));
            setattr(subject.id, 'sp', parseFloat(subjectAccount[3]));
            setattr(subject.id, 'cp', parseFloat(subjectAccount[4]));
            subjectOutput += '<br> ' + subjectAccount[0] + 'pp';
            subjectOutput += '<br> ' + subjectAccount[1] + 'gp';
            subjectOutput += '<br> ' + subjectAccount[2] + 'ep';
            subjectOutput += '<br> ' + subjectAccount[3] + 'sp';
            subjectOutput += '<br> ' + subjectAccount[4] + 'cp';

            recordTransaction('Transfer to NPC', msg.who, [subjectEffect]);
          }

          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM Transfer Report</b><br>' + subjectName + '</b><hr>' + reason + '<hr>' + transactionOutput + subjectOutput + '}}');
          sendChat(scname, '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Sender Transfer Report</b><br>' + subjectName + '</b><hr>' + reason + '<hr>' + output + transactionOutput + subjectOutput + '}}');
          sendChat(scname, '/w ' + subjectName + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Sender Transfer Report</b><br>' + subjectName + '</b><hr>' + reason + '<hr>' + output + transactionOutput + subjectOutput + '}}');
        });
        return;
      }

      // Set the default character for a given player
      if (argTokens.includes('-setdefaultCharacterName') || argTokens.includes('-sc')) {
        var setNewCharacter = false;
        var pcToken = msg.selected[0];
        var token = getObj('graphic', pcToken._id); // eslint-disable-line no-underscore-dangle
        if (token) {
          var pc = getObj('character', token.get('represents'));
          if (pc) {
            pcName = getAttrByName(pc.id, 'character_name');
            if (pcName) {
              var mapLog = 'Mapping Speaker ' + msg.playerid + ' to PC ' + pcName;
              log(mapLog);
              state.CashMaster.DefaultCharacterNames[msg.playerid] = pcName;
              sendChat(scname, '/w gm ' + mapLog);
              sendChat(scname, '/w ' + msg.who + ' Updated Default Character to ' + pcName);
              setNewCharacter = true;
            }
          }
        }
        if (!setNewCharacter) {
          sendChat(scname, '/w ' + msg.who + ' **ERROR:** You did not have a named character token selected.');
        }
      }

      // GM-Only Commands
      if (playerIsGM(msg.playerid)) {
        // Calculate pre-existing party total
        var partytotal = 0;
        var partycounter = 0;
        var partymember = null;
        var partyGoldOperation = false;

        // Create party gold output string
        if (subjects) {
          partymember = subjects.length;
          subjects.forEach(function (subject) {
            partycounter += 1;
            name = getAttrByName(subject.id, 'character_name');
            pp = parseFloat(getattr(subject.id, 'pp')) || 0;
            gp = parseFloat(getattr(subject.id, 'gp')) || 0;
            ep = parseFloat(getattr(subject.id, 'ep')) || 0;
            sp = parseFloat(getattr(subject.id, 'sp')) || 0;
            cp = parseFloat(getattr(subject.id, 'cp')) || 0;
            total = Math.round((pp * 10 + ep * 0.5 + gp + sp / 10 + cp / 100) * 10000) / 10000;
            partytotal = total + partytotal;
          });
          partytotal = Math.round(partytotal * 100, 0) / 100;
        }

        // Merge a player's coin into the densest possible
        if (argTokens.includes('-merge') || argTokens.includes('-m')) {
          output = '';
          var transactionEffects = [];
          subjects.forEach(function (subject) {
            // Load player's existing account
            var subjectName = getAttrByName(subject.id, 'character_name');
            var playerAccount = [parseFloat(getattr(subject.id, 'pp')) || 0, parseFloat(getattr(subject.id, 'gp')) || 0, parseFloat(getattr(subject.id, 'ep')) || 0, parseFloat(getattr(subject.id, 'sp')) || 0, parseFloat(getattr(subject.id, 'cp')) || 0];
            var playerInitial = [playerAccount[0], playerAccount[1], playerAccount[2], playerAccount[3], playerAccount[4]];

            var mergeResult = mergeMoney(playerAccount);
            if (mergeResult.length == null) {
              output += '<br><b>' + subjectName + '</b> has ';
              output += mergeResult;
              output += '<br> ' + playerAccount[0] + 'pp';
              output += '<br> ' + playerAccount[1] + 'gp';
              output += '<br> ' + playerAccount[2] + 'ep';
              output += '<br> ' + playerAccount[3] + 'sp';
              output += '<br> ' + playerAccount[4] + 'cp';
              return;
            }

            // Update subject account and update output
            setattr(subject.id, 'pp', parseFloat(mergeResult[0]));
            setattr(subject.id, 'gp', parseFloat(mergeResult[1]));
            setattr(subject.id, 'ep', parseFloat(mergeResult[2]));
            setattr(subject.id, 'sp', parseFloat(mergeResult[3]));
            setattr(subject.id, 'cp', parseFloat(mergeResult[4]));

            output += '<br><b>' + subjectName + '</b> has ';
            output += '<br> ' + mergeResult[0] + 'pp';
            output += '<br> ' + mergeResult[1] + 'gp';
            output += '<br> ' + mergeResult[2] + 'ep';
            output += '<br> ' + mergeResult[3] + 'sp';
            output += '<br> ' + mergeResult[4] + 'cp';

            transactionEffects.push(getPlayerEffect(subjectName, getDelta(mergeResult, playerInitial)));
            recordTransaction('Merge', msg.who, transactionEffects);
          });
          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Coin Merge Report</b></b><hr>' + output + '}}');
          partyGoldOperation = true;
        }

        // Reallocate existing resources of party as if all coin purses were thrown together and split evenly
        if (argTokens.includes('-share') || argTokens.includes('-best-share') || argTokens.includes('-s') || argTokens.includes('-bs')) {
          output = '';
          var cashshare = partytotal / partycounter;
          var newcounter = 0;
          var pps = Math.floor(cashshare / 10);
          if (argTokens.includes('-share') || argTokens.includes('-s')) {
            pps = 0;
          }
          var rest = cashshare - pps * 10;
          var gps = Math.floor(rest);
          rest = (rest - gps) * 2;
          var eps = Math.floor(rest);
          if (argTokens.includes('-share') || argTokens.includes('-s')) {
            eps = 0;
          }
          rest = (rest - eps) * 5;
          var sps = Math.floor(rest);
          rest = (rest - sps) * 10;
          var cps = Math.round(rest);
          rest = (rest - cps) * partycounter;

          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Let\u2019s share this!</b><hr>Everyone receives the equivalent of ' + toUsd(cashshare) + ' gp: ' + pps + ' platinum, ' + gps + ' gold, ' + eps + ' electrum, ' + sps + ' silver, and ' + cps + ' copper.}}');

          var _transactionEffects = [];
          subjects.forEach(function (subject) {
            var subjectName = getAttrByName(subject.id, 'character_name');
            var ipp = parseFloat(getattr(subject.id, 'pp')) || 0;
            var igp = parseFloat(getattr(subject.id, 'gp')) || 0;
            var iep = parseFloat(getattr(subject.id, 'ep')) || 0;
            var isp = parseFloat(getattr(subject.id, 'sp')) || 0;
            var icp = parseFloat(getattr(subject.id, 'cp')) || 0;
            var playerInitial = [ipp, igp, iep, isp, icp];

            setattr(subject.id, 'pp', pps);
            setattr(subject.id, 'gp', gps);
            setattr(subject.id, 'ep', eps);
            setattr(subject.id, 'sp', sps);
            // enough copper coins? If not, the last one in the group has to take the diff
            if ((rest > 0.999 || rest < -0.999) && newcounter === partycounter) {
              cps += Math.round(rest);
            }
            setattr(subject.id, 'cp', cps);
            _transactionEffects.push(getPlayerEffect(subjectName, getDelta([pps, gps, eps, sps, cps], playerInitial)));
            partyGoldOperation = true;
          });
          recordTransaction('Reallocate Currency', msg.who, _transactionEffects);
        }

        // Add coin to target
        if (argTokens.includes('-add') || argTokens.includes('-a') || argTokens.includes('-credit')) {
          output = '';

          // Perform operations on each target
          var _transactionEffects2 = [];

          subjects.forEach(function (subject) {
            var subjectName = getAttrByName(subject.id, 'character_name');

            pp = parseFloat(getattr(subject.id, 'pp')) || 0;
            gp = parseFloat(getattr(subject.id, 'gp')) || 0;
            ep = parseFloat(getattr(subject.id, 'ep')) || 0;
            sp = parseFloat(getattr(subject.id, 'sp')) || 0;
            cp = parseFloat(getattr(subject.id, 'cp')) || 0;
            var subjectInitial = [pp, gp, ep, sp, cp];
            var subjectFinal = [pp, gp, ep, sp, cp];

            total = Math.round((pp * 10 + ep * 0.5 + gp + sp / 10 + cp / 100) * 10000) / 10000;
            partytotal = total + partytotal;

            output += '<br><b>' + subjectName + '</b>';
            if (ppa) {
              setattr(subject.id, 'pp', parseFloat(pp) + parseFloat(ppa[3]));
              output += '<br> ' + ppa[2];
              subjectFinal[0] += parseFloat(ppa[3]);
            }
            if (gpa) {
              setattr(subject.id, 'gp', parseFloat(gp) + parseFloat(gpa[3]));
              output += '<br> ' + gpa[2];
              subjectFinal[1] += parseFloat(gpa[3]);
            }
            if (epa) {
              setattr(subject.id, 'ep', parseFloat(ep) + parseFloat(epa[3]));
              output += '<br> ' + epa[2];
              subjectFinal[2] += parseFloat(epa[3]);
            }
            if (spa) {
              setattr(subject.id, 'sp', parseFloat(sp) + parseFloat(spa[3]));
              output += '<br> ' + spa[2];
              subjectFinal[3] += parseFloat(spa[3]);
            }
            if (cpa) {
              setattr(subject.id, 'cp', parseFloat(cp) + parseFloat(cpa[3]));
              output += '<br> ' + cpa[2];
              subjectFinal[4] += parseFloat(cpa[3]);
            }
            _transactionEffects2.push(getPlayerEffect(subjectName, getDelta(subjectFinal, subjectInitial)));
            sendChat(scname, '/w ' + subjectName + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM has Disbursed Coin</b><hr>' + output + '}}');
          });

          var type = msg.content.includes('-revert ') ? 'Revert Transaction' : 'Add';
          recordTransaction(type, msg.who, _transactionEffects2);
          var s = subjects.length > 1 ? 's' : '';
          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Disbursement to Player' + s + '</b><hr>' + output + '}}');
        }

        // Subtract coin from target
        if (argTokens.includes('-pay') || argTokens.includes('-p') || argTokens.includes('-subtract') || argTokens.includes('-sub') || argTokens.includes('-bill')) {
          output = '';
          var _transactionEffects3 = [];

          subjects.forEach(function (subject) {
            partycounter += 1;
            var subjectName = getAttrByName(subject.id, 'character_name');
            pp = parseFloat(getattr(subject.id, 'pp')) || 0;
            gp = parseFloat(getattr(subject.id, 'gp')) || 0;
            ep = parseFloat(getattr(subject.id, 'ep')) || 0;
            sp = parseFloat(getattr(subject.id, 'sp')) || 0;
            cp = parseFloat(getattr(subject.id, 'cp')) || 0;
            var targetInitial = [pp, gp, ep, sp, cp];
            var targetFinal = [pp, gp, ep, sp, cp];
            if (ppa !== null) targetFinal = changeMoney(targetFinal, ppa[2]);
            if (gpa !== null) targetFinal = changeMoney(targetFinal, gpa[2]);
            if (epa !== null) targetFinal = changeMoney(targetFinal, epa[2]);
            if (spa !== null) targetFinal = changeMoney(targetFinal, spa[2]);
            if (cpa !== null) targetFinal = changeMoney(targetFinal, cpa[2]);

            output += '<br><b>' + subjectName + '</b> has ';
            if (targetFinal === 'ERROR: Not enough cash.') output += 'not enough cash!';else {
              setattr(subject.id, 'pp', parseFloat(targetFinal[0]));
              output += '<br> ' + targetFinal[0] + 'pp';
              setattr(subject.id, 'gp', parseFloat(targetFinal[1]));
              output += '<br> ' + targetFinal[1] + 'gp';
              setattr(subject.id, 'ep', parseFloat(targetFinal[2]));
              output += '<br> ' + targetFinal[2] + 'ep';
              setattr(subject.id, 'sp', parseFloat(targetFinal[3]));
              output += '<br> ' + targetFinal[3] + 'sp';
              setattr(subject.id, 'cp', parseFloat(targetFinal[4]));
              output += '<br> ' + targetFinal[4] + 'cp';

              _transactionEffects3.push(getPlayerEffect(subjectName, getDelta(targetFinal, targetInitial)));
            }
            sendChat(scname, '/w ' + subjectName + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM has Removed Coin</b><hr>' + output + '}}');
          });
          recordTransaction('Subtract', msg.who, _transactionEffects3);
          var _s = msg.selected.length > 1 ? 's' : '';
          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Bill Collection from Player' + _s + '</b><hr>' + output + '}}');
          partyGoldOperation = true;
        }

        // Evenly distribute sum of coin to group of players
        if (argTokens.includes('-loot') || argTokens.includes('-l')) {
          populateCoinContents(subcommand);

          output = '';
          partycounter = 0;
          var _transactionEffects4 = [];
          msg.selected.forEach(function (obj) {
            var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
            var character = void 0;
            if (token) {
              character = getObj('character', token.get('represents'));
            }
            if (character) {
              partycounter += 1;
              name = getAttrByName(character.id, 'character_name');
              pp = parseFloat(getattr(character.id, 'pp')) || 0;
              gp = parseFloat(getattr(character.id, 'gp')) || 0;
              ep = parseFloat(getattr(character.id, 'ep')) || 0;
              sp = parseFloat(getattr(character.id, 'sp')) || 0;
              cp = parseFloat(getattr(character.id, 'cp')) || 0;
              var targetInitial = [pp, gp, ep, sp, cp];
              var targetFinal = [pp, gp, ep, sp, cp];

              var ppt = void 0;
              var gpt = void 0;
              var ept = void 0;
              var spt = void 0;
              var cpt = void 0;

              if (ppa !== null) {
                ppt = cashsplit(ppa[3], partymember, partycounter);
              }
              if (gpa !== null) {
                gpt = cashsplit(gpa[3], partymember, partycounter);
              }
              if (epa !== null) {
                ept = cashsplit(epa[3], partymember, partycounter);
              }
              if (spa !== null) {
                spt = cashsplit(spa[3], partymember, partycounter);
              }
              if (cpa !== null) {
                cpt = cashsplit(cpa[3], partymember, partycounter);
              }

              output += '<br><b>' + name + '</b>';
              if (ppa) {
                targetFinal[0] = parseFloat(pp) + parseFloat(ppt);
                setattr(character.id, 'pp', targetFinal[0]);
                output += '<br> ' + ppt + 'pp';
              }
              if (gpa) {
                targetFinal[1] = parseFloat(gp) + parseFloat(gpt);
                setattr(character.id, 'gp', targetFinal[1]);
                output += '<br> ' + gpt + 'gp';
              }
              if (epa) {
                targetFinal[2] = parseFloat(ep) + parseFloat(ept);
                setattr(character.id, 'ep', targetFinal[2]);
                output += '<br> ' + ept + 'ep';
              }
              if (spa) {
                targetFinal[3] = parseFloat(sp) + parseFloat(spt);
                setattr(character.id, 'sp', targetFinal[3]);
                output += '<br> ' + spt + 'sp';
              }
              if (cpa) {
                targetFinal[4] = parseFloat(cp) + parseFloat(cpt);
                setattr(character.id, 'cp', targetFinal[4]);
                output += '<br> ' + cpt + 'cp';
              }
              sendChat(scname, '/w ' + name + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Distributing Loot</b><hr>' + output + '}}');
              _transactionEffects4.push(getPlayerEffect(name, getDelta(targetFinal, targetInitial)));
            }
          });
          recordTransaction('Distribute Loot', msg.who, _transactionEffects4);
          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Distributing Loot</b><hr>' + output + '}}');
          partyGoldOperation = true;
        }

        // Set Party to selected
        if (argTokens.includes('-setParty') || argTokens.includes('-sp')) {
          var partyList = [];
          if (!argTokens.includes('-clear')) {
            msg.selected.forEach(function (obj) {
              var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
              var pc = void 0;
              if (token) {
                pc = getObj('character', token.get('represents'));
                if (pc) {
                  pcName = getAttrByName(pc.id, 'character_name');
                  if (pcName) {
                    partyList.push(pcName);
                  }
                }
              }
            });
          }

          log('Party List: ' + partyList);
          state.CashMaster.Party = partyList;
          sendChat(scname, '/w gm **Party:' + partyList.length + '**<br>' + partyList);
        }

        // Calculate party gold value
        if (partyGoldOperation || argTokens.includes('-overview') || argTokens.includes('-o')) {
          //! overview
          partytotal = 0;
          partycounter = 0;
          if (!argTokens.includes('--usd')) usd2 = 0;else usd2 = usd;
          output = '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Party\u2019s cash overview</b><br><br>';
          subjects.forEach(function (subject) {
            output += playerCoinStatus(subject, usd2)[0];
            partytotal += playerCoinStatus(subject, usd2)[1];
          });
          partytotal = Math.round(partytotal * 100, 0) / 100;

          output += '<b><u>Party total: ' + toUsd(partytotal, usd2) + '</u></b>}}';
          sendChat(scname, output);
        }
      }
    });
  });
});