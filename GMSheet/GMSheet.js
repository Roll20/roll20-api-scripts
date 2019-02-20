'use strict';

/* global on log playerIsGM findObjs getObj getAttrByName sendChat globalconfig */ // eslint-disable-line no-unused-vars

/*
GMSheet 0.2.0

A quick GM Cheatsheet for the D&D 5e OGL sheets on roll20.net.
Please use `!gmsheet` for inline help and examples.

arthurbauer@me.com
*/

on('ready', function () {
  var v = '0.2.0'; // version number
  var scname = 'GMSheet'; // script name
  log(scname + ' v' + v + ' online. Select one or more party members, then use `!gmsheet -h`');
  var output = '';
  var collectedAttributes = '';
  var wantedAttributes = void 0;
  var columnjumper = 0;
  var myoutput = '';
  var resourceName = '';
  var otherresourceName = '';

  var resolveAttr = function resolveAttr(cid, attname) {
    var attobj = findObjs({
      type: 'attribute',
      characterid: cid,
      name: attname
    }, { caseInsensitive: true })[0];
    if (!attobj) {
      return { name: '', current: '', max: '' };
    }
    var att2 = { name: attobj.get('name'), current: attobj.get('current'), max: attobj.get('max') };
    return att2;
  };

  var getCharMainAtt = function getCharMainAtt(cid2) {
    //! Main attributes
    output = '<table border=0><tr>';
    var cid = cid2.id;
    wantedAttributes = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
    wantedAttributes.forEach(function (myAtt) {
      collectedAttributes = resolveAttr(cid, myAtt);
      output += '<td><strong>' + collectedAttributes.name.slice(0, 3).toUpperCase() + ':</strong></td><td>&nbsp;' + (resolveAttr(cid, myAtt + '_mod').current > 0 ? '+' + resolveAttr(cid, myAtt + '_mod').current : resolveAttr(cid, myAtt + '_mod').current) + '</td><td>&nbsp;<small>(' + collectedAttributes.current + ')</small></td><td>&nbsp;&nbsp;</td>';
      if (columnjumper === 1) {
        output += '</tr><tr>';
        columnjumper = 0;
      } else {
        columnjumper = 1;
      }
    });
    output += '</tr></table>';
    return output;
  };

  var getCharOtherAtt = function getCharOtherAtt(cid2) {
    //! Other Attributes
    output = '';
    var cid = cid2.id;
    var hp = parseInt(resolveAttr(cid, 'hp').current, 10);
    var maxhp = parseInt(resolveAttr(cid, 'hp').max, 10);
    var hpdown = maxhp - hp;
    var hppercentage = Math.floor(100 * hp / maxhp / 5) * 5;
    output = '<br><small><i>' + resolveAttr(cid, 'race').current + ' Lvl ' + resolveAttr(cid, 'level').current + ' ' + resolveAttr(cid, 'class').current + '</i></small>';
    output += resolveAttr(cid, 'inspiration').current === 'on' ? " <strong style='color:white;text-shadow: 2px 2px 4px #009000;' title='Character has inspiration!'>&#127775;</strong>" : '';
    output += '<br><br><strong>HP:</strong> ' + hp + '/' + maxhp + ' ';
    output += hp < maxhp ? ' <small style=\'color:#9d0a0e\' title=\'down by ' + hpdown + ' points, (' + hppercentage + '%) \'>&#129301; ' + hppercentage + '% (-' + hpdown + ' HP)</small> ' : '';
    output += parseInt(resolveAttr(cid, 'hp_temp').current, 10) > 0 ? ' <span style=\'color:green\'>+ ' + resolveAttr(cid, 'hp_temp').current + ' TMP</span>' : '';
    output += '<br><strong>AC:</strong> ' + resolveAttr(cid, 'ac').current;
    output += '<br><br>Speed: ' + resolveAttr(cid, 'speed').current + ' ft, Passive Perception: ' + resolveAttr(cid, 'passive_wisdom').current + '<br>Initiative bonus: ' + (resolveAttr(cid, 'initiative_bonus').current > 0 ? '+' + resolveAttr(cid, 'initiative_bonus').current : resolveAttr(cid, 'initiative_bonus').current) + ', Proficiency ' + (resolveAttr(cid, 'pb').current > 0 ? '+' + resolveAttr(cid, 'pb').current : resolveAttr(cid, 'pb').current);
    output += '<br><br>';
    return output;
  };

  var getSpellSlots = function getSpellSlots(cid2) {
    //! Spell slots
    output = '';
    var cid = cid2.id;

    output = '<br><b>Spell slots</b><br>';
    var i = 1;
    var spellLevelTotal = 0;
    var spellLevelEx = 0;
    var spellcount = 0;
    while (i < 10) {
      spellLevelTotal = resolveAttr(cid, 'lvl' + parseInt(i, 10) + '_slots_total').current;
      if (spellLevelTotal === 0 || spellLevelTotal === '') break;
      spellLevelEx = resolveAttr(cid, 'lvl' + parseInt(i, 10) + '_slots_expended').current;
      if (spellLevelTotal > 0) {
        spellcount += 1;
        if (spellLevelEx / spellLevelTotal <= 0.25) spellLevelEx = '<span style=\'color:red\'>' + spellLevelEx + '</span>';else if (spellLevelEx / spellLevelTotal <= 0.5) spellLevelEx = '<span style=\'color:orange\'>' + spellLevelEx + '</span>';else if (spellLevelEx / spellLevelTotal <= 0.75) spellLevelEx = '<span style=\'color:green\'>' + spellLevelEx + '</span>';else spellLevelEx = '<span style=\'color:blue\'>' + spellLevelEx + '</span>';
        output += '<b>Level ' + i + ':</b> ' + spellLevelEx + ' / ' + spellLevelTotal + '<br>';
      }
      i += 1;
    }
    if (spellcount < 1) output = '';

    //! class resources

    resourceName = resolveAttr(cid, 'class_resource_name').current;
    otherresourceName = resolveAttr(cid, 'other_resource_name').current;

    var classResourceTotal = resolveAttr(cid, 'class_resource').max;
    var classResourceCurrent = resolveAttr(cid, 'class_resource').current;
    var otherResourceTotal = resolveAttr(cid, 'other_resource').max;
    var otherResourceCurrent = resolveAttr(cid, 'other_resource').current;

    if (resourceName && classResourceTotal > 0) output += '<br>' + resourceName + ': ' + classResourceCurrent + '/' + classResourceTotal;
    if (otherresourceName && otherResourceTotal > 0) output += '<br>' + otherresourceName + ': ' + otherResourceCurrent + '/' + otherResourceTotal;
    resourceName = '';

    return output;
  };

  on('chat:message', function (msg) {
    if (msg.type !== 'api' && !playerIsGM(msg.playerid)) return;
    if (msg.content.startsWith('!gmsheet') !== true) return;
    if (msg.content.includes('-help') || msg.content.includes('-h')) {
      //! Help
      sendChat(scname, '/w gm <h3 id=\'roll20-gmsheet\'>Roll20-GMSheet</h3><p><em>Version 0.2.0</em></p><p>A quick GM Cheatsheet for the D&amp;D 5e OGL sheets on <a href=\'http://roll20.net\'>Roll20</a>.Please use <code>!gmsheet -h</code> for inline help and examples.</p><h4 id=\'displayed-information\'>Displayed information</h4><p>The script currently shows</p><ul><li>name, race, level and (main) class, including the character&#39;s avatar</li><li>inspiration!</li><li>HP, also indicating temporary hitpoints and injuries</li><li>speed, passive perception, initiative bonus</li><li>main abilities + modifiers</li><li>available spell slots</li><li>class resources (as stored in the attributes <code>class_resource</code> and <code>other_resource</code>)</li></ul><h4 id=\'usage\'>Usage</h4><ol><li>Select one or several tokens</li><li>Type <code>!gmsheet</code> in chat</li></ol>'); // eslint-disable-line quotes
    } else if (msg.selected == null) {
      sendChat(scname, '/w gm **ERROR:** You need to select at least one character.');

      /* will add a routine to save/load characters later */
    } else {
      msg.selected.forEach(function (obj) {
        //! Output
        var token = getObj('graphic', obj._id); // eslint-disable-line no-underscore-dangle
        var character = void 0;
        if (token) {
          character = getObj('character', token.get('represents'));
        }
        if (character) {
          /* get the attributes and assemble the output */
          var charname = character.get('name');
          var charicon = character.get('avatar');
          if (myoutput.length > 0) myoutput += '<br>';
          myoutput += '<div style=\'display:inline-block; font-variant: small-caps; color:##9d0a0e; font-size:1.8em;margin-top:5px;\'><img src=\'' + charicon + '\' style=\'height:48px;width:auto;margin-right:5px;margin-bottom:0px;margin-top:5px; vertical-align:middle\'>' + charname + '</div>' + getCharOtherAtt(character) + getCharMainAtt(character) + getSpellSlots(character);
        }
      });
      sendChat(scname, '/w gm <div style=\'border:1px solid black; background-color: #f9f7ec; padding:8px; border-radius: 6px; font-size:0.85em;line-height:0.95em;\'>' + myoutput + '</div>'); // eslint-disable-line quotes
      myoutput = '';
    }
  });
});