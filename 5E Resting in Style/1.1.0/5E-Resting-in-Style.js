/* global log, getObj, on, getAttrByName, sendChat, findObjs, createObj, randomInteger, _, TokenMod */

/* 5E Resting in Style
 *
 * Version 1.1.0
 * Last updated: 2020-07-02
 *
 * This script for the 5E OGL character sheet solves the error prone task of
 * updating your character sheet when resting. Using !long-rest and !short-rest
 * commands will update your sheet, and report to you everything it is doing.
 *
 */

(function () {
  const getClassLevel = function (charId, className) {
    var s = getAttrByName(charId, 'class_display');
    if (s) {
      var m = s.match(new RegExp(className + " (\\d+)"));
      if (m && m.length > 0 && m[1]) {
        return Number(m[1]);
      }
    }
    return 0;
  };

  const afterClassLevel = function (className, minLevel, result) {
    return function (charId) {
      if (minLevel <= getClassLevel(charId, className)) {
        return result;
      }
    };
  };

  const if_zero_then_inc = function (charId, attr) {
    var current = attr.get("current");
    if (current == "" || current == "0") {
      return 1;
    }
  };

  const reset_to_1 = function () { return "reset:1"; };

  const regained = function (_) { return "regained"; };
  const consider = function (_) { return "consider"; };

  const only_long_rest = {longRest: regained};
  const long_and_short_rests = {longRest: regained, shortRest: regained};

  const normalize = function (s) {
    return s.toLowerCase().replace(/[^a-z ]+/g, "");
  };

  const normalizeMapKeys = function (m) {
    Object.keys(m).forEach(function(k) {
      var v = m[k];
      delete m[k];
      m[normalize(k)] = v;
    });
  };

  const resources = {
    // Artificer
    "Flash of Genius": only_long_rest,

    // Barbarian
    "Rage": only_long_rest,
    "Consult the Spirits": only_long_rest,

    // Bard
    "Bardic Inspiration": {longRest: regained, shortRest: afterClassLevel("Bard", 5, "regained") },
    "Enthralling Performance": long_and_short_rests,
    "Words of Terror": long_and_short_rests,
    "Unbreakable Majesty": long_and_short_rests,
    "Infectious Inspiration": only_long_rest,
    "Mantle of Majesty": only_long_rest,
    "Shadow Lore": only_long_rest,
    "Universal Speech": only_long_rest,

    // Cleric
    "Channel Divinity": long_and_short_rests,
    "Divine Intervention": only_long_rest,
    "Warding Flare": only_long_rest,
    "Wrath of the Storm": only_long_rest,
    "War Priest": only_long_rest,
    "War Priest Attack": only_long_rest,
    "Visions of the Past": long_and_short_rests,
    "Embodiment of the Law": only_long_rest,
    "Eyes of the Grave": only_long_rest,
    "Sentinel at Death's Door": only_long_rest,

    // Druid
    "Wild Shape": long_and_short_rests,
    "Natural Recovery": only_long_rest,
    "Spirit Totem": long_and_short_rests,
    "Balm of the Summer Court": only_long_rest,
    "Faithful Summons": only_long_rest,
    "Fungal Infestation": only_long_rest,
    "Hidden Paths": only_long_rest,
    "Walker in Dreams": only_long_rest,

    // Fighter
    "Second Wind": long_and_short_rests,
    "Action Surge": long_and_short_rests,
    "Superiority Dice": long_and_short_rests,
    "Indomitable": only_long_rest,
    "Arcane Shot": long_and_short_rests,
    "Fighting Spirit": only_long_rest,
    "Strength Before Death": only_long_rest,
    "Unwavering Mark": only_long_rest,
    "Warding Maneuver": only_long_rest,

    // Monk
    "Ki": long_and_short_rests,
    "Ki Points": long_and_short_rests,
    "Wholeness of Body": only_long_rest,

    // Paladin
    "Divine Sense": only_long_rest,
    "Lay on Hands": only_long_rest,
    "Cleansing Touch": only_long_rest,
    "Holy Nimbus": only_long_rest,
    "Undying Sentinel": only_long_rest,
    "Elder Champion": only_long_rest,
    "Avenging Angel": only_long_rest,
    "Dread Lord": only_long_rest,
    "Emissary of Redemption": only_long_rest,
    "Glorious Defense": only_long_rest,
    "Invincible Conqueror": only_long_rest,
    "Living Legend": only_long_rest,

    // Ranger
    "Detect Portal": long_and_short_rests,
    "Ethereal Step": long_and_short_rests,
    "Magic-User's Nemesis": long_and_short_rests,
    "Hunter's Sense": only_long_rest,

    // Rogue
    "Stroke of Luck": long_and_short_rests,
    "Spell Thief": only_long_rest,
    "Unerring Eye": only_long_rest,

    // Sorcerer
    "Sorcery Points": {longRest: regained, shortRest: afterClassLevel("Sorcerer", 20, 4)},
    "Tides of Chaos": only_long_rest,
    "Favored by the Gods": long_and_short_rests,
    "Wind Soul": long_and_short_rests,
    "Strength of the Grave": only_long_rest,
    "Unearthly Recovery": only_long_rest,

    // Warlock
    "Hexblade’s Curse": long_and_short_rests,
    "Accursed Specter": only_long_rest,
    "Eldritch Master": only_long_rest,
    "Fey Presence": long_and_short_rests,
    "Misty Escape": long_and_short_rests,
    "Dark Delirium": long_and_short_rests,
    "Dark One's Own Luck": long_and_short_rests,
    "Hurl Through Hell": only_long_rest,
    "Entropic Ward": long_and_short_rests,

    // Wizard
    "Arcane Recovery": {longRest: regained, shortRest: consider},
    "Arcane Ward": only_long_rest,
    "Benign Transposition": only_long_rest,
    "The Third Eye": long_and_short_rests,
    "Illusory Self": long_and_short_rests,
    "Shapechanger": long_and_short_rests,
    "Bladesong": long_and_short_rests,
    "Arcane Abeyance": long_and_short_rests,
    "Chronal Shift": only_long_rest,
    "Event Horizon": only_long_rest,
    "Momentary Stasis": only_long_rest,
    "Power Surge": {longRest: reset_to_1, shortRest: if_zero_then_inc},
    "Violent Attraction": only_long_rest,

    // Race abilities
    "Breath Weapon": only_long_rest, // Dragonborn
    "Relentless Endurance": only_long_rest, // Half-orc
    "Grovel, Cower, and Beg": long_and_short_rests, // Kobold
    "Healing Hands": only_long_rest, // Aasimar
    "Fury Of The Small": long_and_short_rests, // Goblin
    "Stone’s Endurance": long_and_short_rests, // Goliath
    "Saving Face": long_and_short_rests, // Hobgoblin
    "Hungry Jaws": long_and_short_rests, // Lizardfolk
    "Hidden Step": long_and_short_rests, // Firbolg

    // Feats
    "Lucky": only_long_rest
  };

  normalizeMapKeys(resources);

  const fades = function (_) { return "fades"; };
  const fades_after_long_rest = {longRest: fades};
  const fades_after_short_rest = {longRest: fades, shortRest: fades};

  const modifiers = {
    // spells
    "Aid": fades_after_long_rest,
    "Armor of Agathys": fades_after_short_rest,
    "Aura of Purity": fades_after_short_rest,
    "Barkskin": fades_after_short_rest,
    "Beacon of Hope": fades_after_short_rest,
    "Beast Bond": fades_after_short_rest,
    "Bladesong": fades_after_short_rest,
    "Bless": fades_after_short_rest,
    "Catnap": fades_after_short_rest,
    "Ceremony": fades_after_short_rest,
    "Circle of Power": fades_after_short_rest,
    "Crusader’s Mantle": fades_after_short_rest,
    "Darkvision": fades_after_long_rest,
    "Death Ward": fades_after_long_rest,
    "Divine Favor": fades_after_short_rest,
    "Dragon's Breath": fades_after_short_rest,
    "Elemental Weapon": fades_after_short_rest,
    "Enhance Ability": fades_after_short_rest,
    "Enlarge/Reduce": fades_after_short_rest,
    "Enlarge Reduce": fades_after_short_rest,
    "Etherealness": fades_after_long_rest,
    "Feign Death": fades_after_short_rest,
    "Fire Shield": fades_after_short_rest,
    "Flame Arrows": fades_after_short_rest,
    "Foresight": fades_after_long_rest,
    "Fortune's Favor": fades_after_short_rest,
    "Freedom of Movement": fades_after_short_rest,
    "Friends": fades_after_short_rest,
    "Gaseous Form": fades_after_short_rest,
    "Gift of Alacrity": fades_after_long_rest,
    "Greater Invisibility": fades_after_short_rest,
    "Guardian of Nature": fades_after_short_rest,
    "Guidance": fades_after_short_rest,
    "Haste": fades_after_short_rest,
    "Heroes' Feast": fades_after_short_rest,
    "Heroism": fades_after_short_rest,
    "Holy Aura": fades_after_short_rest,
    "Invisibility": fades_after_short_rest,
    "Longstrider": fades_after_short_rest,
    "Mage Armor": fades_after_long_rest,
    "Magic Weapon": fades_after_short_rest,
    "Motivational Speech": fades_after_short_rest,
    "Pass Without Trace": fades_after_short_rest,
    "Protection from Energy": fades_after_short_rest,
    "Protection from Evil and Good": fades_after_short_rest,
    "Protection from Poison": fades_after_short_rest,
    "Resistance": fades_after_short_rest,
    "Sanctuary": fades_after_short_rest,
    "Shadow of Moil": fades_after_short_rest,
    "Shield of Faith": fades_after_short_rest,
    "Shillelagh": fades_after_short_rest,
    "Skill Empowerment": fades_after_short_rest,
    "Soul Cage": fades_after_long_rest,
    "Spider Climb": fades_after_short_rest,
    "Stoneskin": fades_after_short_rest,
    "Swift Quiver": fades_after_short_rest,
    "Tenser’s Transformation": fades_after_short_rest,
    "True Polymorph": fades_after_short_rest,
    "Warding Bond": fades_after_short_rest,
    "Wind Walk": fades_after_long_rest,

    // class abilities
    "Sacred Weapon": fades_after_short_rest,
    "Rage": fades_after_short_rest
  };

  normalizeMapKeys(modifiers);

  const warlockPactMagic = [
    null,                   // Warlock 0
    {slots: 1, level: 1},   // Warlock 1
    {slots: 2, level: 1},   // Warlock 2
    {slots: 2, level: 2},   // Warlock 3
    {slots: 2, level: 2},   // Warlock 4
    {slots: 2, level: 3},   // Warlock 5
    {slots: 2, level: 3},   // Warlock 6
    {slots: 2, level: 4},   // Warlock 7
    {slots: 2, level: 4},   // Warlock 8
    {slots: 2, level: 5},   // Warlock 9
    {slots: 2, level: 5},   // Warlock 10
    {slots: 3, level: 5},   // Warlock 11
    {slots: 3, level: 5},   // Warlock 12
    {slots: 3, level: 5},   // Warlock 13
    {slots: 3, level: 5},   // Warlock 14
    {slots: 3, level: 5},   // Warlock 15
    {slots: 3, level: 5},   // Warlock 16
    {slots: 4, level: 5},   // Warlock 17
    {slots: 4, level: 5},   // Warlock 18
    {slots: 4, level: 5},   // Warlock 19
    {slots: 4, level: 5},   // Warlock 20
  ];

  const showWarning = function (msg) {
    sendChat("Warning", msg, null, {noarchive:true});
  };

  let observers = { tokenChange: [] };

  const observeTokenChange = function (handler) {
    if (handler && _.isFunction(handler)) {
      observers.tokenChange.push(handler);
    }
  };

  const notifyObservers = function (event, obj, prev) {
    _.each(observers[event], function (handler) {
      handler(obj,prev);
    });
  };

  const resolveDice = function (txt) {
    const tokenize = /(\d+d\d+|\d+|\+|-)/ig;
    const dieparts = /^(\d+)?d(\d+)$/i;
    const ops = {
      '+': (m, n) => m + n,
      '-': (m, n) => m - n
    };
    let op = '+';

    return (txt.replace(/\s+/g, '').match(tokenize) || []).reduce((m, t) => {
      let matches = t.match(dieparts);
      if (matches) {
        return ops[op](m, [...Array(parseInt(matches[1]) || 1)].reduce(m => m + randomInteger(parseInt(matches[2])), 0));
      } else if (/^\d+$/.test(t)) {
        return ops[op](m, parseInt(t));
      } else {
        op = t;
        return m;
      }
    }, 0);
  }

  const checkModifier = function (charId, attr, faded, restType) {
    if (!attr || attr.get("current") === "") { return; }
    var name = getAttrByName(charId, attr.get('name').replace("_active_flag", "_name"));
    if (!name) { return; }
    var lcname = normalize(name);

    var result = modifiers[lcname] && modifiers[lcname][restType] && modifiers[lcname][restType](charId);

    if (result === 'fades' && attr.get("current") == "1") {
      faded.push(name);
      attr.setWithWorker({ current: "0" });
    }
  };

  const checkResource = function (charId, attr, actions, suggestions, restType) {
    if (!attr || attr.get("current") === "" || attr.get("max") === "") { return; }

    var name = getAttrByName(charId, attr.get('name') + '_name');
    if (!name) { return; }
    var lcname = normalize(name);

    var verb = "regained";
    var result;
    if (resources[lcname] && resources[lcname][restType]) {
      result = resources[lcname][restType](charId, attr);
    } else if (name.endsWith('[s]') || (restType == "longRest" && name.endsWith('[l]'))) {
      name = name.substring(0, name.length-3);
      result = "regained";
    } else if (name.match(/(.+)\[([sl])([0-9+-d]+)\]/)) {
      var ss = name.match(/(.+)\[([sl])([0-9+-d]+)\]/);
      if (restType == "shortRest" && ss[2] == "l") { return; }
      name = ss[1];
      result = resolveDice(ss[3]);
      verb = ss[3] + " rolled " + result + " ";
    }
    if (!result) { return; }

    var value = Number(attr.get('current'));
    var max = Number(attr.get('max'));

    if (result == "regained") {
      if (value < max) {
        attr.setWithWorker({ current: max });
        if (max == 1) {
          actions.push(`${name} ${verb}.`);
        } else {
          actions.push(`${name} ${verb} (${value}→${max}).`);
        }
      }
      return;
    }

    if (result == "consider") {
      if (value > 0) {
        suggestions.push("Consider using " + name + ".");
      }
      return;
    }

    var newVal;
    if (`${result}`.startsWith("reset:")) {
      newVal = Number(result.substring(6));
      if (value != newVal) {
        attr.setWithWorker({ current: newVal });
        actions.push(`${name} reset to ${newVal}.`);
      }
      return;
    }

    if (result > 0) {
      if (value < max) {
        newVal = Math.min(max, value + result);
        attr.setWithWorker({ current: newVal });
        if (max == 1) {
          actions.push(`${name} ${verb}.`);
        } else {
          actions.push(`${name} ${verb} (${value}→${newVal}).`);
        }
      }
      return;
    }
  };

  const findResourceAttrs = function (charId) {
    return findObjs({
      type: 'attribute',
      characterid: charId
    }).filter(function (o) {
      var name = o.get('name') || '';
      return name === 'class_resource' ||
        name === 'other_resource' ||
        name.startsWith('repeating_resource_') && !name.endsWith('_name');
    });
  };

  const findModifierAttrs = function (charId) {
    return findObjs({
      type: 'attribute',
      characterid: charId
    }).filter(function (o) {
      var name = o.get('name') || '';
      return (name.startsWith('repeating_acmod_') && name.endsWith('_global_ac_active_flag')) ||
        (name.startsWith('repeating_savemod_') && name.endsWith('_global_save_active_flag')) ||
        (name.startsWith('repeating_tohitmod_') && name.endsWith('_global_attack_active_flag')) ||
        (name.startsWith('repeating_skillmod_') && name.endsWith('_global_skill_active_flag')) ||
        (name.startsWith('repeating_damagemod_') && name.endsWith('_global_damage_active_flag'));
    });
  };

  const fadeBuffs = function (charId, actions, restType) {
    var faded = [];
    findModifierAttrs(charId).forEach(function (attr) {
      checkModifier(charId, attr, faded, restType);
    });
    [...new Set(faded)].forEach(function (name) {
      actions.push(name + " fades.");
    });
  };

  const findCharacterTokens = function (charId) {
    return findObjs({
      type: 'graphic',
      represents: charId
    });
  };

  const clone = function (o) {
    return JSON.parse(JSON.stringify(o));
  };

  const getAttr = function (charId, name) {
    return findObjs({
      type: 'attribute',
      characterid: charId,
      name: name
    }, {
      caseInsensitive: true
    })[0];
  };

  const verifiedCurAndMax = function (charName, attr, name) {
    if (!attr || attr.get("current") === "" || attr.get("max") === "") {
      showWarning(name + " attribute on " + charName + " is missing or current/max values are not filled out, skipped.");
      return false;
    }
    return true;
  };

  const regainSpellSlots = function (charId, spellLevel, toRegain, actions) {
    var charslotmax = getAttr(charId, "lvl" + spellLevel + "_slots_total");
    var charslot = getAttr(charId, "lvl" + spellLevel + "_slots_expended");

    if (!charslotmax || !charslot) { return; }
    if (charslotmax.get("current") === "" || charslot.get("current") === "") { return; }

    var cur_slots = Number(charslot.get("current"));
    var max_slots = Number(charslotmax.get("current"));

    var new_slots = toRegain == "regained" ? max_slots : Math.min(max_slots, cur_slots + toRegain);

    if (cur_slots < new_slots) {
      actions.push(`Level ${spellLevel} spell slots regained (${cur_slots}→${new_slots}).`);
      charslot.setWithWorker({current: new_slots});
    }
  };

  const reduceExhaustionLevel = function (charId, exhaustionAttr, actions) {
    var exhaustionLevel = exhaustionAttr.get("current")
    if (exhaustionLevel != "" && exhaustionLevel > 0) {
      var lostDescriptionAttr = getAttr(charId, "exhaustion_" + exhaustionLevel);
      var lostDescription = lostDescriptionAttr && lostDescriptionAttr.get("current");
      lostDescription = lostDescription && lostDescription.substr(2) + " no longer.";

      var newLevel = Number(exhaustionLevel) - 1;
      actions.push(`Exhaustion level reduced to ${newLevel}. ${lostDescription}`);
      exhaustionAttr.set({current: newLevel});

      if (lostDescriptionAttr) {
        if (newLevel == 0) {
          lostDescriptionAttr.set({current: getAttrByName(charId, 'exhaustion_0')});
        } else {
          lostDescriptionAttr.set({current: ''});
        }
      }
    }
  };

  const shortRest = function (charId) {
    var charName = getAttrByName(charId, 'character_name');
    var hd = getAttr(charId, "hit_dice");
    var hp = getAttr(charId, "hp");

    if (!verifiedCurAndMax(charName, hd, 'Hit dice')) { return; }
    if (!verifiedCurAndMax(charName, hp, 'Hit points')) { return; }

    var max_hp = Number(hp.get("max"));
    var cur_hp = Number(hp.get("current"));
    var cur_hd = Number(hd.get("current"));

    if (cur_hp < 1) {
      sendChat("Short rest for " + charName, "A character must have at least 1 hit point at the start of the rest to gain its benefits.<ul><li>Remember that a stable creature regains 1 hit point after 1d4 hours.</li></ul>");
      return;
    }

    var actions = [];
    var suggestions = [];

    // Check hit points and hit dice
    var msg = cur_hp == max_hp ? "You are at full hit points." : `You are down ${max_hp - cur_hp} hit points`;
    if (cur_hp < max_hp) {
      if (cur_hd < 1) {
        msg += " with no hit dice left.";
      } else {
        suggestions.push(`Consider using hit dice (${cur_hd} left).`);
      }
    }

    // Warlock Pact Magic
    var warlockLevel = getClassLevel(charId, "Warlock");
    if (warlockLevel > 0) {
      var magic = warlockPactMagic[warlockLevel];
      regainSpellSlots(charId, magic.level, magic.slots, actions);
    }

    // Bard Song of Rest
    var bardLevel = getClassLevel(charId, "Bard");
    if (bardLevel > 1) {
      suggestions.push("Consider using Song of Rest.");
    }

    // Regain resources
    findResourceAttrs(charId).forEach(function (attr) {
      checkResource(charId, attr, actions, suggestions, 'shortRest');
    });

    // Fade buffs
    fadeBuffs(charId, actions, 'shortRest');

    // Notify player
    var points = actions.concat(suggestions);
    if (points.length) {
      msg += "<ul><li>" + points.join("</li><li>") + "</li></ul>";
    }
    sendChat("Short rest for " + charName, msg);
  };

  const longRest = function (charId) {
    var charName = getAttrByName(charId, 'character_name');
    var hd = getAttr(charId, "hit_dice");
    var hp = getAttr(charId, "hp");

    if (!verifiedCurAndMax(charName, hd, 'Hit dice')) { return; }
    if (!verifiedCurAndMax(charName, hp, 'Hit points')) { return; }

    var max_hp = Number(hp.get("max"));
    var cur_hp = Number(hp.get("current"));
    var max_hd = Number(hd.get("max"));
    var cur_hd = Number(hd.get("current"));

    if (cur_hp < 1) {
      sendChat("Long rest for " + charName, "A character must have at least 1 hit point at the start of the rest to gain its benefits.<ul><li>Remember that a stable creature regains 1 hit point after 1d4 hours.</li></ul>");
      return;
    }

    var actions = [];
    var suggestions = [];

    // Regain hit points
    var msg = cur_hp == max_hp ? "You are already at full hit points." : `You regain ${max_hp - cur_hp} hit points, back at full (${max_hp}).`;
    if (cur_hp < max_hp) {
      hp.setWithWorker({ current: max_hp });
    }

    // Regain hit dice
    if(cur_hd < max_hd) {
      var new_hd = Math.min(max_hd, cur_hd + Math.max(1, Math.floor(max_hd/2)));
      actions.push(`${new_hd - cur_hd} hit dice regained (now ${new_hd}/${max_hd}).`);
      hd.setWithWorker({current: new_hd});
    }

    // Remove temporary hit points
    var temp_hp = getAttr(charId, "hp_temp");
    if (temp_hp) {
      var cur_temp_hp = temp_hp.get("current")
      if (cur_temp_hp != "" && cur_temp_hp > 0) {
        actions.push(`${temp_hp.get("current")} temporary hit points removed.`);
        temp_hp.setWithWorker({current: ""});
      }
    }

    // Regain spell slots
    for (var spellLevel = 1; spellLevel < 10; spellLevel++) {
      regainSpellSlots(charId, spellLevel, "regained", actions);
    };

    // Regain resources
    findResourceAttrs(charId).forEach(function (attr) {
      checkResource(charId, attr, actions, suggestions, 'longRest');
    });

    // Reduce exhaustion level
    var exhaustionAttr = getAttr(charId, "exhaustion_level");
    if (exhaustionAttr) {
      reduceExhaustionLevel(charId, exhaustionAttr, actions);
    }

    // Fade buffs
    fadeBuffs(charId, actions, 'longRest');

    // Notify player
    var points = actions.concat(suggestions);
    if (points.length) {
      msg += "<ul><li>" + points.join("</li><li>") + "</li></ul>";
    }
    sendChat("Long rest for " + charName, msg);
  };

  const selectSome = "Select the tokens that need rest, then run this command again.";

  const withSelectedChars = function (selected, f) {
    if (!selected || !selected.length) {
      return showWarning(selectSome);
    }

    var graphics = _.filter(selected, (sel) => sel._type == "graphic");
    var tokens = _.map(graphics, (sel) => getObj(sel._type, sel._id));

    if (!tokens || !tokens.length) {
      return showWarning(selectSome);
    }

    var charTokens = _.filter(tokens, (token) => token && token.get("represents"));

    if (!charTokens.length) {
      return showWarning((selected.length == 1 ?
                          "The selected token doesn't represent a character. " :
                          "None of the selected tokens represent characters. ") +
                         selectSome);
    }

    var ignored = (tokens.length - charTokens.length);
    if (ignored > 0) {
      log(ignored == 1 ?
          "[Resting in Style] Ignoring one token that doesn't represent a character." :
          "[Resting in Style] Ignoring " + ignored + " tokens that don't represent characters.");
    }

    var uniqueCharIds = [...new Set(charTokens.map((token) => token.get("represents")))];
    uniqueCharIds.forEach(f);
  };

  const notifyAfter = function (f) {
    return function (charId) {
      var tokens = findCharacterTokens(charId);
      var prevTokens = tokens.map(clone);

      f(charId);

      for (var i = 0, l = tokens.length; i < l; i++) {
        notifyObservers('tokenChange', tokens[i], prevTokens[i]);
      }
    };
  };

  setTimeout(function () {
    if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange) {
      var original = TokenMod.ObserveTokenChange;
      TokenMod.ObserveTokenChange = function (handler) {
        original(handler);
        observeTokenChange(handler);
      };
      log('[Resting in Style] Piggiebacking on TokenMod for token change observations.');
    };
  }, 1);

  on("ready", () => {
    on("chat:message", msg => {
      if (msg.type !== 'api') { return; }

      var command = msg.content.split(" ")[0].toLowerCase();

      if (command === '!short-rest') { withSelectedChars(msg.selected, notifyAfter(shortRest)); }
      if (command === '!long-rest') { withSelectedChars(msg.selected, notifyAfter(longRest)); }
    });

    log("5E OGL Resting in Style is ready! Select chars, then: !short-rest and !long-rest");
  });

}());
