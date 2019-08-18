'use strict';

/* global on log playerIsGM findObjs getObj getAttrByName sendChat globalconfig */

/*
CASHMASTER 0.7.1

A currency management script for the D&D 5e OGL sheets on roll20.net.
Please use `!cm` for inline help and examples.

arthurbauer@me.com
*/

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
  if (pp) output += '<em style=\'color:blue;\'>' + pp + ' pp</em>, ';
  if (gp) output += '<em style=\'color:orange;\'>' + gp + ' gp</em>, ';
  if (ep) output += '<em style=\'color:silver;\'>' + ep + ' ep</em>, ';
  if (sp) output += '<em style=\'color:grey;\'>' + sp + ' sp</em>, ';
  if (cp) output += '<em style=\'color:brown;\'>' + cp + ' cp</em>';

  output += '<br>(' + weight + ' lbs)</small><br><br>';
  return [output, total];
};

on('ready', function () {
  var v = '0.7.1'; // version number
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

  log(scname + ' v' + v + ' online. Select one or more party members, then use `!cm -help`');

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

  on('chat:message', function (msg) {
    if (msg.type !== 'api') return;
    if (msg.content.startsWith('!cm') !== true) return;
    log('CM Command: ' + msg.content);
    if (msg.content.includes('-help') || msg.content === '!cm' || msg.content.includes('-h')) {
      //! help
      sendChat(scname, '/w gm <h1 id=\'cashmaster\'>CashMaster</h1><p>A currency management script for the D&amp;D 5e OGL and 5e Shaped sheets on Roll20.net.</p><p>Please use <code>!cm</code> for inline help and examples.</p><h2 id=\'setup\'>Setup</h2><p>Make sure you use the correct sheet setting (<code>OGL</code>, <code>5E-Shaped</code>, or <code>other</code>).</p><h2 id=\'usage\'>Usage</h2><p>First, create a macro bar button for the <code>!cm -menu</code> command for ease of use.  Then, to use it, select one or more party members if you are the DM or your own token if you are a player.</p><h2 id=\'player-commands\'>Player Commands</h2><ul><li><code>!cm</code> or <code>!cm -help</code> or <code>!cm -h</code> will show this help overview</li><li><code>!cm -menu</code> or <code>!cm -tool</code> to bring up the user menu</li><li><code>!cm -transfer &quot;[recipient character name]&quot; [amount][currency]</code> or <code>!cm -t &quot;[recipient character name]&quot; [amount][currency]</code> to transfer coins to the recipient.</li></ul><h2 id=\'gm-commands\'>GM Commands</h2><h3 id=\'base-commands\'>Base commands</h3><ul><li><code>!cm</code> or <code>!cm -help</code> or <code>!cm -h</code> will show this help overview</li><li><code>!cm -overview</code> or <code>!cm -o</code> to get an <strong>overview</strong> over the party&#39;s cash</li><li><code>!cm -overview --usd</code> will also give you an overview and a rough conversion to USD (default value: 1 gp equals roughly 110 USD).</li></ul><h3 id=\'payment-commands\'>Payment commands</h3><ul><li><code>!cm -add [amount][currency]</code> or <code>!cm -a [amount][currency]</code> to <strong>add</strong> an equal amount of money to each selected party member,</li><li><code>!cm -loot [amount][currency]</code> or <code>!cm -l [amount][currency]</code> to <strong>split up</strong> a certain amount of coins between the party members, like a found treasure. Note that in this case, no conversion between the different coin types is made - if a party of 5 shares 4 pp, then 4 party members receive one pp each, and the last member won&#39;t get anything.</li><li><code>!cm -pay [amount][currency]</code> or <code>!cm -p [amount][currency]</code> to let each selected party member <strong>pay</strong> a certain amount. The script will even try to take higher and lower coin types to get the full amount. E.g. to pay 1gp when the character has no gold, the script will use 1pp (and return 9gp), or it will take 2ep, 10sp or 100cp - or any other valid combination of coins - to pay the desired amount.</li></ul><h3 id=\'conversion-cleanup-commands\'>Conversion/Cleanup commands</h3><ul><li><code>!cm -merge</code> or <code>!cm -m</code> to merge coins to the densest denomination possible.</li><li><code>!cm -share</code> or <code>!cm -s</code> to <strong>convert and share</strong> the money equally between party members, converting the amount into the best combination of gold, silver and copper (this should be used in smaller stores),</li><li><code>!cm -best-share</code> or <code>!cm -bs</code> to <strong>convert and share</strong> the money equally between party members, converting the amount into the best combination of platinum, gold, electrum, silver and copper (this should only be used in larger stores that have a fair amount of cash),</li></ul><p><strong>Note:</strong> You can use several coin values at once, e.g. <code>!cm -loot 50gp 150sp 2000cp</code> or <code>!cm -pay 2sp 5cp</code>.</p><h3 id=\'examples\'>Examples</h3><ol><li><code>!cm -overview</code> will show a cash overview.</li><li><code>!cm -add 50gp</code> will add 50 gp to every selected character.</li><li><code>!cm -loot 50gp</code> will (more or less evenly) distribute 50 gp among the party members.</li><li><code>!cm -pay 10gp</code> will subtract 10gp from each selected character. It will try to exchange the other coin types (e.g. it will use 1pp if the player doesn&#39;t have 10gp).</li><li><code>!cm -share</code> will collect all the money and share it evenly on the members, using gp, sp and cp only (pp and ep will be converted). Can also be used for one character to &#39;exchange&#39; money.</li><li><code>!cm -transfer &quot;Tazeka Liranov&quot; 40gp</code> will transfer 40 gp from the selected token to the character sheet named Tazeka Liranov.</li><li><code>!cm -convert</code> - same as <code>!cm -share</code>, but will also use platinum and electrum.</li></ol><h2 id=\'credits\'>Credits</h2><p>With thanks to <a href=\'https://app.roll20.net/users/277007/kryx\'>Kryx</a>/<a href=\'https://github.com/mlenser\'>mlenser</a> and <a href=\'https://app.roll20.net/users/1583758/michael-g\'>Michael G.</a>/<a href=\'https://github.com/VoltCruelerz\'>VoltCruelerz</a> for their contributions.</p>'); // eslint-disable-line quotes
    }

    if (msg.content.includes('-menu') || msg.content.includes('-tool')) {
      var menuContent = '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<h3>Cash Master</h3><hr>' + '<h4>Universal Commands</h4>[Toolbar](!cm -tool)' + '<br>[Status](!cm -status)' + '<br>[Transfer](!cm -transfer &#34;?{Full Name of Recipient}&#34; ?{Currency to Transfer})';
      if (playerIsGM(msg.playerid)) {
        menuContent = menuContent + '<h4>GM-Only Commands</h4>' + '<b>Base Commands</b>' + '<br>[Readme](!cm -help)<br>[Party Overview](!cm -overview)' + '<br>[Party USD](!cm -overview --usd)' + '<br><b>Payment Commands</b>' + '<br>[Add to Each Selected](!cm -add ?{Currency to Add})' + '<br>[Bill Each Selected](!cm -pay ?{Currency to Bill})' + '<br>[Split Among Selected](!cm -loot ?{Amount to Split})' + '<br><b>Conversion Commands</b>' + '<br>[Compress Coins of Selected](!cm -merge)';
      }
      menuContent += '}}';
      sendChat(scname, menuContent);
      return;
    }

    if (msg.selected == null) {
      sendChat(scname, '/w gm **ERROR:** You need to select at least one character.');
      return;
    }

    // Coin Transfer between players
    if (msg.content.includes('-transfer') || msg.content.includes('-t')) {
      ppg = /([0-9 -]+)pp/;
      ppa = ppg.exec(msg.content);

      gpg = /([0-9 -]+)gp/;
      gpa = gpg.exec(msg.content);

      epg = /([0-9 -]+)ep/;
      epa = epg.exec(msg.content);

      spg = /([0-9 -]+)sp/;
      spa = spg.exec(msg.content);

      cpg = /([0-9 -]+)cp/;
      cpa = cpg.exec(msg.content);

      // Retrieve target name
      // Double quotes must be used because multiple players could have the same first name, last name, etc
      var startQuote = msg.content.indexOf('"');
      var endQuote = msg.content.lastIndexOf('"');
      if (startQuote >= endQuote) {
        sendChat(scname, '**ERROR:** You must specify a target by name within double quotes.');
        return;
      }
      var targetName = msg.content.substring(startQuote + 1, endQuote);

      // Retrieve target's id
      var list = findObjs({
        _type: 'character',
        name: targetName
      });
      if (list.length === 0) {
        sendChat(scname, '**ERROR:** No character exists by the name ' + targetName + '.  Did you forget to include the surname?');
        return;
      } else if (list.length > 1) {
        sendChat(scname, '**ERROR:** character name ' + targetName + ' must be unique.');
        return;
      }
      var targetId = list[0].id;

      output = '';
      var transactionOutput = '';
      var donorOutput = '';
      var targetOutput = '';

      if (msg.selected.length > 1) {
        sendChat(scname, '**ERROR:** Transfers can only have on sender.');
        return;
      }
      var donorName = '';
      msg.selected.forEach(function (obj) {
        var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
        var donor = void 0;
        if (token) {
          donor = getObj('character', token.get('represents'));
        }
        if (donor) {
          // Check that the sender is not attempting to send money to themselves
          if (donor.id === targetId) {
            sendChat(scname, '**ERROR:** target character must not be selected character.');
            return;
          }

          // Verify donor has enough to perform transfer
          // Check if the player attempted to steal from another and populate the transaction data
          transactionOutput += '<br><b>Transaction Data</b>';
          if (ppa !== null) {
            var val = parseFloat(ppa[1]);
            transactionOutput += '<br> ' + ppa[0];
            if (val < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
              return;
            }
          }
          if (gpa !== null) {
            var _val = parseFloat(gpa[1]);
            transactionOutput += '<br> ' + gpa[0];
            if (_val < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
              return;
            }
          }
          if (epa !== null) {
            var _val2 = parseFloat(epa[1]);
            transactionOutput += '<br> ' + epa[0];
            if (_val2 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
              return;
            }
          }
          if (spa !== null) {
            var _val3 = parseFloat(spa[1]);
            transactionOutput += '<br> ' + spa[0];
            if (_val3 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '**ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
              return;
            }
          }
          if (cpa !== null) {
            var _val4 = parseFloat(cpa[1]);
            transactionOutput += '<br> ' + cpa[0];
            if (_val4 < 0 && !playerIsGM(msg.playerid)) {
              sendChat(scname, '/w gm **ERROR:** ' + msg.who + ' may not demand payment from ' + targetName + '.');
              return;
            }
          }

          // Load donor's existing account
          donorName = getAttrByName(donor.id, 'character_name');
          var dpp = parseFloat(getattr(donor.id, 'pp')) || 0;
          var dgp = parseFloat(getattr(donor.id, 'gp')) || 0;
          var dep = parseFloat(getattr(donor.id, 'ep')) || 0;
          var dsp = parseFloat(getattr(donor.id, 'sp')) || 0;
          var dcp = parseFloat(getattr(donor.id, 'cp')) || 0;
          var donorAccount = [dpp, dgp, dep, dsp, dcp];

          if (ppa !== null) donorAccount = changeMoney(donorAccount, ppa[0]);
          if (gpa !== null) donorAccount = changeMoney(donorAccount, gpa[0]);
          if (epa !== null) donorAccount = changeMoney(donorAccount, epa[0]);
          if (spa !== null) donorAccount = changeMoney(donorAccount, spa[0]);
          if (cpa !== null) donorAccount = changeMoney(donorAccount, cpa[0]);

          // Verify donor has enough to perform transfer
          donorOutput += '<br><b>' + donorName + '</b> has ';
          if (donorAccount === 'ERROR: Not enough cash.') {
            donorOutput += 'not enough cash!';
          } else {
            // Update donor account and update output
            setattr(donor.id, 'pp', parseFloat(donorAccount[0]));
            setattr(donor.id, 'gp', parseFloat(donorAccount[1]));
            setattr(donor.id, 'ep', parseFloat(donorAccount[2]));
            setattr(donor.id, 'sp', parseFloat(donorAccount[3]));
            setattr(donor.id, 'cp', parseFloat(donorAccount[4]));
            donorOutput += '<br> ' + donorAccount[0] + 'pp';
            donorOutput += '<br> ' + donorAccount[1] + 'gp';
            donorOutput += '<br> ' + donorAccount[2] + 'ep';
            donorOutput += '<br> ' + donorAccount[3] + 'sp';
            donorOutput += '<br> ' + donorAccount[4] + 'cp';

            // targetFunds
            var tpp = parseFloat(getattr(targetId, 'pp')) || 0;
            var tgp = parseFloat(getattr(targetId, 'gp')) || 0;
            var tep = parseFloat(getattr(targetId, 'ep')) || 0;
            var tsp = parseFloat(getattr(targetId, 'sp')) || 0;
            var tcp = parseFloat(getattr(targetId, 'cp')) || 0;
            if (ppa !== null) tpp += parseFloat(ppa[1]);
            if (gpa !== null) tgp += parseFloat(gpa[1]);
            if (epa !== null) tep += parseFloat(epa[1]);
            if (spa !== null) tsp += parseFloat(spa[1]);
            if (cpa !== null) tcp += parseFloat(cpa[1]);

            setattr(targetId, 'pp', tpp);
            setattr(targetId, 'gp', tgp);
            setattr(targetId, 'ep', tep);
            setattr(targetId, 'sp', tsp);
            setattr(targetId, 'cp', tcp);
            targetOutput += '<br><b>' + targetName + '</b> has ';
            targetOutput += '<br> ' + tpp + 'pp';
            targetOutput += '<br> ' + tgp + 'gp';
            targetOutput += '<br> ' + tep + 'ep';
            targetOutput += '<br> ' + tsp + 'sp';
            targetOutput += '<br> ' + tcp + 'cp';
          }
        }
      });
      sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM Transfer Report</b><br>' + donorName + '>' + targetName + '</b><hr>' + transactionOutput + donorOutput + targetOutput + '}}');
      sendChat(scname, '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Sender Transfer Report</b><br>' + donorName + ' > ' + targetName + '</b><hr>' + output + transactionOutput + donorOutput + '}}');
      sendChat(scname, '/w ' + targetName + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Recipient Transfer Report</b><br>' + donorName + ' > ' + targetName + '</b><hr>' + output + transactionOutput + targetOutput + '}}');
      return;
    }

    if (msg.content.includes('-status') || msg.content.includes('-x')) {
      output = '';

      msg.selected.forEach(function (obj) {
        var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
        var character = void 0;
        if (token) {
          character = getObj('character', token.get('represents'));
        }
        if (character) {
          var coinStatus = playerCoinStatus(character);
          sendChat(scname, '/w ' + msg.who + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Coin Purse Status</b></b><hr>' + coinStatus[0] + '}}');
        }
      });
      return;
    }

    // GM-Only Commands
    if (playerIsGM(msg.playerid)) {
      // Calculate pre-existing party total
      var partytotal = 0;
      var partycounter = 0;
      var partymember = Object.entries(msg.selected).length;
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
          total = Math.round((pp * 10 + ep * 0.5 + gp + sp / 10 + cp / 100) * 10000) / 10000;
          partytotal = total + partytotal;
        }
      });
      partytotal = Math.round(partytotal * 100, 0) / 100;

      // Merge a player's coin into the densest possible
      if (msg.content.includes('-merge') || msg.content.includes('-m')) {
        output = '';

        msg.selected.forEach(function (obj) {
          var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
          var character = void 0;
          if (token) {
            character = getObj('character', token.get('represents'));
          }
          if (character) {
            // Load player's existing account
            var characterName = getAttrByName(character.id, 'character_name');
            var playerAccount = [parseFloat(getattr(character.id, 'pp')) || 0, parseFloat(getattr(character.id, 'gp')) || 0, parseFloat(getattr(character.id, 'ep')) || 0, parseFloat(getattr(character.id, 'sp')) || 0, parseFloat(getattr(character.id, 'cp')) || 0];

            var mergeResult = mergeMoney(playerAccount);
            if (mergeResult.length == null) {
              output += '<br><b>' + characterName + '</b> has ';
              output += mergeResult;
              output += '<br> ' + playerAccount[0] + 'pp';
              output += '<br> ' + playerAccount[1] + 'gp';
              output += '<br> ' + playerAccount[2] + 'ep';
              output += '<br> ' + playerAccount[3] + 'sp';
              output += '<br> ' + playerAccount[4] + 'cp';
              return;
            }

            // Udate donor account and update output
            setattr(character.id, 'pp', parseFloat(mergeResult[0]));
            setattr(character.id, 'gp', parseFloat(mergeResult[1]));
            setattr(character.id, 'ep', parseFloat(mergeResult[2]));
            setattr(character.id, 'sp', parseFloat(mergeResult[3]));
            setattr(character.id, 'cp', parseFloat(mergeResult[4]));

            output += '<br><b>' + characterName + '</b> has ';
            output += '<br> ' + mergeResult[0] + 'pp';
            output += '<br> ' + mergeResult[1] + 'gp';
            output += '<br> ' + mergeResult[2] + 'ep';
            output += '<br> ' + mergeResult[3] + 'sp';
            output += '<br> ' + mergeResult[4] + 'cp';
          }
          sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Coin Merge Report</b></b><hr>' + output + '}}');
        });
      }

      // Reallocate existing resources of party as if all coin purses were thrown together and split evenly
      if (msg.content.includes('-share') || msg.content.includes('-best-share') || msg.content.includes('-s') || msg.content.includes('-bs')) {
        //! share and convert
        output = '';
        var cashshare = partytotal / partycounter;
        var newcounter = 0;
        var pps = Math.floor(cashshare / 10);
        if (msg.content.includes('-share') || msg.content.includes('-s')) {
          pps = 0;
        }
        var rest = cashshare - pps * 10;
        var gps = Math.floor(rest);
        rest = (rest - gps) * 2;
        var eps = Math.floor(rest);
        if (msg.content.includes('-share') || msg.content.includes('-s')) {
          eps = 0;
        }
        rest = (rest - eps) * 5;
        var sps = Math.floor(rest);
        rest = (rest - sps) * 10;
        var cps = Math.round(rest);
        rest = (rest - cps) * partycounter;

        sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Let\u2019s share this!</b><hr>Everyone receives the equivalent of ' + toUsd(cashshare) + ' gp: ' + pps + ' platinum, ' + gps + ' gold, ' + eps + ' electrum, ' + sps + ' silver, and ' + cps + ' copper.}}');

        msg.selected.forEach(function (obj) {
          var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
          var character = void 0;
          newcounter += 1;
          if (token) {
            character = getObj('character', token.get('represents'));
          }
          if (character) {
            setattr(character.id, 'pp', pps);
            setattr(character.id, 'gp', gps);
            setattr(character.id, 'ep', eps);
            setattr(character.id, 'sp', sps);
            // enough copper coins? If not, the last one in the group has to take the diff
            if ((rest > 0.999 || rest < -0.999) && newcounter === partycounter) {
              cps += Math.round(rest);
            }
            setattr(character.id, 'cp', cps);
          }
        });
      }

      // Add coin to target
      if (msg.content.includes('-add') || msg.content.includes('-a')) {
        //! add
        ppg = /([0-9 -]+)pp/;
        ppa = ppg.exec(msg.content);

        gpg = /([0-9 -]+)gp/;
        gpa = gpg.exec(msg.content);

        epg = /([0-9 -]+)ep/;
        epa = epg.exec(msg.content);

        spg = /([0-9 -]+)sp/;
        spa = spg.exec(msg.content);

        cpg = /([0-9 -]+)cp/;
        cpa = cpg.exec(msg.content);

        output = '';

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
            total = Math.round((pp * 10 + ep * 0.5 + gp + sp / 10 + cp / 100) * 10000) / 10000;
            partytotal = total + partytotal;
            output += '<br><b>' + name + '</b>';
            if (ppa) {
              setattr(character.id, 'pp', parseFloat(pp) + parseFloat(ppa[1]));
              output += '<br> ' + ppa[0];
            }
            if (gpa) {
              setattr(character.id, 'gp', parseFloat(gp) + parseFloat(gpa[1]));
              output += '<br> ' + gpa[0];
            }
            if (epa) {
              setattr(character.id, 'ep', parseFloat(ep) + parseFloat(epa[1]));
              output += '<br> ' + epa[0];
            }
            if (spa) {
              setattr(character.id, 'sp', parseFloat(sp) + parseFloat(spa[1]));
              output += '<br> ' + spa[0];
            }
            if (cpa) {
              setattr(character.id, 'cp', parseFloat(cp) + parseFloat(cpa[1]));
              output += '<br> ' + cpa[0];
            }
          }
          sendChat(scname, '/w ' + name + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM has Disbursed Coin</b><hr>' + output + '}}');
        });
        var s = msg.selected.length > 1 ? 's' : '';
        sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Disbursement to Player' + s + '</b><hr>' + output + '}}');
      }

      // Subtract coin from target
      if (msg.content.includes('-pay') || msg.content.includes('-p')) {
        //! pay
        ppg = /([0-9 -]+)pp/;
        ppa = ppg.exec(msg.content);

        gpg = /([0-9 -]+)gp/;
        gpa = gpg.exec(msg.content);

        epg = /([0-9 -]+)ep/;
        epa = epg.exec(msg.content);

        spg = /([0-9 -]+)sp/;
        spa = spg.exec(msg.content);

        cpg = /([0-9 -]+)cp/;
        cpa = cpg.exec(msg.content);

        output = '';

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

            var startamount = [pp, gp, ep, sp, cp];
            if (ppa !== null) startamount = changeMoney(startamount, ppa[0]);
            if (gpa !== null) startamount = changeMoney(startamount, gpa[0]);
            if (epa !== null) startamount = changeMoney(startamount, epa[0]);
            if (spa !== null) startamount = changeMoney(startamount, spa[0]);
            if (cpa !== null) startamount = changeMoney(startamount, cpa[0]);

            output += '<br><b>' + name + '</b> has ';
            if (startamount === 'ERROR: Not enough cash.') output += 'not enough cash!';else {
              setattr(character.id, 'pp', parseFloat(startamount[0]));
              output += '<br> ' + startamount[0] + 'pp';
              setattr(character.id, 'gp', parseFloat(startamount[1]));
              output += '<br> ' + startamount[1] + 'gp';
              setattr(character.id, 'ep', parseFloat(startamount[2]));
              output += '<br> ' + startamount[2] + 'ep';
              setattr(character.id, 'sp', parseFloat(startamount[3]));
              output += '<br> ' + startamount[3] + 'sp';
              setattr(character.id, 'cp', parseFloat(startamount[4]));
              output += '<br> ' + startamount[4] + 'cp';
            }
          }
          sendChat(scname, '/w ' + name + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>GM has Removed Coin</b><hr>' + output + '}}');
        });
        var _s = msg.selected.length > 1 ? 's' : '';
        sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Bill Collection from Player' + _s + '</b><hr>' + output + '}}');
      }

      // Evenly distribute sum of coin to group of players
      if (msg.content.includes('-loot') || msg.content.includes('-l')) {
        //! loot
        ppg = /([0-9 -]+)pp/;
        ppa = ppg.exec(msg.content);

        gpg = /([0-9 -]+)gp/;
        gpa = gpg.exec(msg.content);

        epg = /([0-9 -]+)ep/;
        epa = epg.exec(msg.content);

        spg = /([0-9 -]+)sp/;
        spa = spg.exec(msg.content);

        cpg = /([0-9 -]+)cp/;
        cpa = cpg.exec(msg.content);

        output = '';
        partycounter = 0;

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

            var ppt = void 0;
            var gpt = void 0;
            var ept = void 0;
            var spt = void 0;
            var cpt = void 0;

            if (ppa !== null) {
              ppt = cashsplit(ppa[1], partymember, partycounter);
            }
            if (gpa !== null) {
              gpt = cashsplit(gpa[1], partymember, partycounter);
            }
            if (epa !== null) {
              ept = cashsplit(epa[1], partymember, partycounter);
            }
            if (spa !== null) {
              spt = cashsplit(spa[1], partymember, partycounter);
            }
            if (cpa !== null) {
              cpt = cashsplit(cpa[1], partymember, partycounter);
            }

            output += '<br><b>' + name + '</b>';
            if (ppa) {
              setattr(character.id, 'pp', parseFloat(pp) + parseFloat(ppt));
              output += '<br> ' + ppt + 'pp';
            }
            if (gpa) {
              setattr(character.id, 'gp', parseFloat(gp) + parseFloat(gpt));
              output += '<br> ' + gpt + 'gp';
            }
            if (epa) {
              setattr(character.id, 'ep', parseFloat(ep) + parseFloat(ept));
              output += '<br> ' + ept + 'ep';
            }
            if (spa) {
              setattr(character.id, 'sp', parseFloat(sp) + parseFloat(spt));
              output += '<br> ' + spt + 'sp';
            }
            if (cpa) {
              setattr(character.id, 'cp', parseFloat(cp) + parseFloat(cpt));
              output += '<br> ' + cpt + 'cp';
            }
            sendChat(scname, '/w ' + name + ' &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Distributing Loot</b><hr>' + output + '}}');
          }
        });
        sendChat(scname, '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Distributing Loot</b><hr>' + output + '}}');
      }

      // Calculate party gold value
      if (msg.content.includes('-add') || msg.content.includes('-pay') || msg.content.includes('-share') || msg.content.includes('-best-share') || msg.content.includes('-loot') || msg.content.includes('-overview') || msg.content.includes('-a') || msg.content.includes('-p') || msg.content.includes('-s') || msg.content.includes('-bs') || msg.content.includes('-l') || msg.content.includes('-o')) {
        //! overview
        partytotal = 0;
        partycounter = 0;
        if (!msg.content.includes('--usd')) usd2 = 0;else usd2 = usd;
        output = '/w gm &{template:' + rt[0] + '} {{' + rt[1] + '=<b>Party\u2019s cash overview</b><br><br>';
        msg.selected.forEach(function (obj) {
          var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
          var character = void 0;
          if (token) {
            character = getObj('character', token.get('represents'));
          }
          if (character) {
            output += playerCoinStatus(character, usd2)[0];
            partytotal += playerCoinStatus(character, usd2)[1];
          }
        });
        partytotal = Math.round(partytotal * 100, 0) / 100;

        output += '<b><u>Party total: ' + toUsd(partytotal, usd2) + '</u></b>}}';
        sendChat(scname, output);
      }
    } else if (msg.content.includes('-add') || msg.content.includes('-pay') || msg.content.includes('-share') || msg.content.includes('-best-share') || msg.content.includes('-loot') || msg.content.includes('-merge') || msg.content.includes('-overview') || msg.content.includes('-a') || msg.content.includes('-p') || msg.content.includes('-s') || msg.content.includes('-bs') || msg.content.includes('-l') || msg.content.includes('-o') || msg.content.includes('-m')) {
      sendChat(scname, '/w ' + msg.who + ' **ERROR:** You do not have permission to use that action.');
      sendChat(scname, '/w gm **WARNING:** ' + msg.who + ' attempted to use a GM-Only command.');
    }
  });
});