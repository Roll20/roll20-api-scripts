/*
 * ListAttrs v1.0.0
 * Updated: 2024-01-31
 *
 * Usage:
 *
 * !listattrs <attrName> [--no-gm]
 *
 * attrName: An attribute on the character sheets.
 *           Examples: hp, hp_max, str, languages, luck
 * --no-gm: If specified, the script will ignore character tokens controlled
 *          only by GMs (ie. it will skip NPCs)
 *
 * This can be used to help answer questions without asking your players.
 * Examples:
 *
 *  - Who is the strongest character?
 *  - Which languages does each character speak?
 *  - Who are the two characters with the lowest luck?
 *  - What are all the characters' speeds?
 */

var ListAttrs = (function listAttrsInit() {

  var chat = _.partial(sendChat, "!listattrs")

  var cmdUsage = function cmdUsage() {
    chat(`/w gm Usage: !listattrs <attr> [--no-gm]`);
    chat(`/w gm Use --no-gm to ignore tokens controlled *only* by GMs`);
  };

  var getCharsOnPage = function getCharsOnPage(noGm) {
    var tokens = _.compact(findObjs({ _type: "graphic", _subtype: "token", _pageid: Campaign().get("playerpageid") }));
    var tokensThatRepresentCharacters = _.select(tokens, function(token) {
      if (token.get('represents')) {
        return true
      };
    });
    var allCharacterIds = _.map(tokensThatRepresentCharacters, function(token) {
      return token.get('represents');
    });
    var allPlayerIds = _.map(findObjs({ _type: "player" }), function(player) {
      return player.id;
    });
    var gmIds = _.select(allPlayerIds, function(id) {
      return playerIsGM(id);
    });
    var pcTokens;
    if (noGm) {
      pcTokens = _.select(tokensThatRepresentCharacters, function(token) {
        var controlledBy = (getObj('character', token.get('represents')) || token).get('controlledby');
        var controllers = _.select(controlledBy.split(','), function(controller) {
          return !gmIds.includes(controller);
        });
        if (controllers.length >= 1) {
          return true;
        }
      });
    } else {
      pcTokens = tokensThatRepresentCharacters;
    }
    var characterIds = _.uniq(_.compact(_.map(pcTokens, function(token) {
      return token.get('represents');
    })));
    if (characterIds.length === 0) {
      return [];
    }
    var characters = _.map(characterIds, function(id) {
      return getObj("character", id);
    });
    return characters;
  };

  return {
    listAttrs: function listAttrs(attrName, noGm) {
      if (!attrName) {
        cmdUsage();
        return;
      }

      var characters = getCharsOnPage(noGm);
      if (characters.length === 0) {
        chat("/w gm No characters found!");
      }
      var output = _.reduce(characters, function(memo, character) {
        var attrValue = _.first(findObjs({ _type: "attribute", _characterid: character.get('_id'), name: attrName}, { caseInsensitive: true }))?.get("current");
        var name = character.get('name');
        if (attrValue) {
          return memo + `{{${name}=${attrValue}}} `;
        }
        return memo;
      }, "");
      sendChat("", `/w gm &{template:default} {{name=${attrName}}} ${output}`);
    }
  };

})();

on('ready', function() {

  "use strict";

  on('chat:message', function(msg) {
    if ('api' !== msg.type) {
      return;
    };

    var commands = {
      "!listattrs": ListAttrs.listAttrs
    };

    var cmd = _.find(_.keys(commands), (cmd) => msg.content.match(new RegExp(`^${cmd}`)));
    if (cmd) {
      var args = msg.content.split(/\s+/);
      var noGm = false;
      args = _.reject(args, function(arg) {
        if (arg === '--no-gm') {
          noGm = true;
          return true;
        }
        return false;
      });
      commands[cmd](args[1], noGm);
    }
  });

});

