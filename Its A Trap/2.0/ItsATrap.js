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
   * Returns the first trap a token collided with during its last movement.
   * If it didn't collide with any traps, return false.
   * @param {Graphic} token
   * @return {Graphic || false}
   */
  var getTrapCollision = function(token) {
      var pageId = token.get('_pageid');
      var traps = getTrapTokens(pageId);
      traps = filterList(traps, function(trap) {
          return !isTokenFlying(token) || isTokenFlying(trap);
      });

      return TokenCollisions.getFirstCollision(token, traps);
  };


  /**
   * Determines whether a token is currently flying.
   * @param {Graphic} token
   * @return {Boolean}
   */
  var isTokenFlying = function(token) {
      return (token.get("status_fluffy-wing") ||
              token.get("status_angel-outfit"));
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
   * Returns all trap tokens on the players' page.
   * @param {string} pageId
   */
  var getTrapTokens = function(pageId) {
      return findObjs({_pageid: pageId,
                              _type: "graphic",
                              status_cobweb: true,
                              layer: "gmlayer"});
  };



  /**
   * Filters items out from a list using some filtering function.
   * Only items for which the filtering function returns true are kept in the
   * filtered list.
   * @param {Object[]} list
   * @param {Function} filterFunc   Accepts an Object from list as a parameter.
   *                                Returns true to keep the item, or false to
   *                                discard.
   * @return {Object[]}
   */
  var filterList = function(list, filterFunc) {
      var results = [];
      for(var i=0; i<list.length; i++) {
          var item = list[i];
          if(filterFunc(item)) {
              results.push(item);
          }
      }
      return results;
  }


  /**
   * When a graphic on the objects layer moves, run the script to see if it
   * passed through any traps.
   */
  on("change:graphic", function(obj, prev) {
      // Objects on the GM layer don't set off traps.
      if(obj.get("layer") === "objects") {
          var trap = getTrapCollision(obj);

          if(trap) {
              var trapName = trap.get("name");
              if(trapName) {
                sendChat("Admiral Ackbar", "IT'S A TRAP!!! " + obj.get("name") + " set off a trap: " + trapName + "!");
              }
              else {
                sendChat("Admiral Ackbar", "IT'S A TRAP!!! " + obj.get("name") + " set off a trap!");
              }

              moveTokenToTrap(obj, trap);

              if(trap.get("status_bleeding-eye")) {
                  trap.set("layer","objects");
                  toBack(trap);
              }
          }
      }
  });
})();
