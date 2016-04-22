/**
 * A script that checks the interpolation of a token's movement to detect
 * whether they have passed through a square containing a trap.
 *
 * A trap can be any token on the GM layer for which the cobweb status is
 * active. Flying tokens (ones with the fluffy-wing status or angel-outfit
 * status active) will not set off traps unless the traps are also flying.
 *
 * This script works best for square traps equal or less than 2x2 squares or
 * circular traps of any size.
 */
var ItsATrap = (function() {

  /**
   * A message describing the chat message and other special effects for a trap
   * being set off.
   * @typedef {object} TrapEffect
   * @property {string} message
   *           The message template that will be sent in the chat by Admiral Ackbar.
   *           This can include inline rolls and API chat commands.
   * @property {string} trapId
   *           The ID of the trap.
   * @property {string} victimId
   *           The ID of the token that activated the trap.
   */

  /**
   * Returns the first trap a token collided with during its last movement.
   * If it didn't collide with any traps, return false.
   * @param {Graphic} token
   * @return {Graphic || false}
   */
  var getTrapCollision = function(token) {
    var pageId = token.get('_pageid');
    var traps = findObjs({
      _pageid: pageId,
      _type: "graphic",
      status_cobweb: true,
      layer: "gmlayer"
    });

    // Some traps don't affect flying tokens.
    traps = _.filter(traps, function(trap) {
      return !isTokenFlying(token) || isTokenFlying(trap);
    });
    return TokenCollisions.getFirstCollision(token, traps);
  };

  /**
   * Gets the effect for a trap set off by a character's token defined in the
   * trap's GM notes.
   * If the GM notes property is not set, then it will generate a default
   * message using the trap and victim's names.
   * @param  {Graphic} victim
   *         The token that set off the trap.
   * @param  {Graphic} trap
   * @return {TrapEffect}
   */
  function getTrapEffect(victim, trap) {
    var effect;

    // URI-escape the notes and remove the HTML elements.
    var notes = decodeURIComponent(trap.get('gmnotes')).trim();
    notes = notes.split(/<[/]?.+?>/g).join('');

    // If GM notes are set, interpret those.
    if(notes) {

      // Should the message be interpretted as a JSON object?
      if(notes.indexOf('{') === 0)
        try {
          effect = JSON.parse(notes);
        }
        catch(err) {
          effect = {
            message: 'ERROR: invalid TrapEffect JSON.'
          };
        }
      else
        effect = {
          message: notes
        };
    }

    // Use a default message.
    else {
      var trapName = trap.get("name");
      if(trapName)
        effect = {
          message: victim.get("name") + " set off a trap: " + trapName + "!"
        };
      else
        effect = {
          message: victim.get("name") + " set off a trap!"
        };
    }

    // Capture the token and victim's IDs in the effect.
    _.extend(effect, {
      trapId: trap.get('_id'),
      victimId: victim.get('_id')
    });
    return effect;
  }

  /**
   * Gets the message template sent to the chat by a trap.
   * @param  {Graphic} victim
   *         The token that set off the trap.
   * @param  {Graphic} trap
   * @return {string}
   */
  function getTrapMessage(victim, trap) {
    var notes = unescape(trap.get('gmnotes')).trim();
    if(notes) {

      // Should the message be interpretted as a JSON object?
      if(notes.indexOf('{') === 0)
        return JSON.parse(notes).message;
      else
        return notes;
    }

    // Use a default message.
    else {
      var trapName = trap.get("name");
      if(trapName)
        return victim.get("name") + " set off a trap: " + trapName + "!";
      else
        return victim.get("name") + " set off a trap!";
    }
  }


  /**
   * Determines whether a token is currently flying.
   * @param {Graphic} token
   * @return {Boolean}
   */
  var isTokenFlying = function(token) {
    return token.get("status_fluffy-wing") || token.get("status_angel-outfit");
  };


  /**
   * Moves the specified token to the same position as the trap.
   * @param {Graphic} token
   * @param {Graphic} trap
   */
  var moveTokenToTrap = function(token, trap) {
    var x = trap.get("left");
    var y = trap.get("top");

    token.set("lastmove","");
    token.set("left", x);
    token.set("top", y);
  };


  /**
   * When a graphic on the objects layer moves, run the script to see if it
   * passed through any traps.
   */
  on("change:graphic", function(victim) {
    // Objects on the GM layer don't set off traps.
    if(victim.get("layer") === "objects") {
      var trap = getTrapCollision(victim);
      if(trap) {
        var effect = getTrapEffect(victim, trap);
        var msg = effect.message;

        if(msg.indexOf('!') !== 0)
          msg = "IT'S A TRAP!!! " + msg;
        sendChat("Admiral Ackbar", msg);
        moveTokenToTrap(victim, trap);

        // Reveal the trap if it's set to become visible.
        if(trap.get("status_bleeding-eye")) {
          trap.set("layer","objects");
          toBack(trap);
        }
      }
    }
  });

  return {
    getTrapCollision: getTrapCollision,
    getTrapEffect: getTrapEffect,
    getTrapMessage: getTrapMessage,
    isTokenFlying: isTokenFlying,
    moveTokenToTrap: moveTokenToTrap
  }
})();
