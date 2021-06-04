/* Wild-Shape Token Resizer
 *
 * A script to automatically resize a Rollable Table Token when a different
 * side is chosen. It does this by repurposing the “weight” attribute of the
 * Items in the Rollable Table. It was written with D&D Druid Wild Shape
 * tokens in mind, but would work for any square rollable table tokens from
 * which players will choose different sides.
 *
 * The script listens to token:change events, looks for a table with the
 * same name as the token, and updates the token size when the side changes,
 * so no other configuration should be required.
 *
 * By: Erik Ogan
 * Version: 0.0.1
 */

var WildShapeResizer =
  WildShapeResizer ||
  (() => {
    "use strict";

    var version = "0.0.1";

    var checkTokenSize = (token) => {
      var name = token.get("name");
      if (!name) return;

      var tableItems = itemsForToken(token);
      if (!tableItems || tableItems.length < 1) return;

      var page = getObj("page", token.get("_pageid"));
      var gridSize = 70;

      if (page) {
        gridSize = page.get("snapping_increment") * gridSize;
      }

      var side = tableItems[token.get("currentSide")];
      if (side.get("avatar") !== token.get("imgsrc")) {
        // Rollable Table sides are copied into the token when it is created. If you change the table
        log("WildShapeResizer ERROR: token image does not match table image");
        sendChat(
          "WildShapeResizer",
          "/direct <strong>ERROR:</strong> token image does not match table image." +
            " This token likely needs to be recreated."
        );
        return;
      }

      var weight = side.get("weight");
      var dimension = gridSize * weight;
      doResize(token, dimension);
    };

    var doResize = (token, dimension) => {
      var name = token.get("name");

      var currentW = token.get("width");
      var currentH = token.get("height");

      // TODO: get the locations of the other tokens on the board and try to keep from overlapping them
      var currentL = token.get("left");
      var currentT = token.get("top");

      if (
        currentW &&
        currentH &&
        (currentW !== dimension || currentH !== dimension)
      ) {
        log(`WildShapeResizer: resizing ${name} to ${dimension}`);
        token.set("width", dimension);
        token.set("height", dimension);
        // TODO: Figure out why this is not working
        // Reset top & left so it does not center on the old size
        token.set("top", currentT);
        token.set("left", currentL);
        // Maybe with a timeout after we’ve finished our changes?
        setTimeout(() => {
          token.set("top", currentT);
          token.set("left", currentL);
        }, 10);
      } else {
        log(`WildShapeResizer: ${name} is already correctly sized.`);
      }
    };

    var itemsForToken = (token) => {
      var name = token.get("name");
      if (!name) return undefined;

      var table = findObjs({ _type: "rollabletable", name: name })[0];
      if (!table) return undefined;

      return findObjs({
        _type: "tableitem",
        _rollabletableid: table.id,
      });
    };

    var registerHandlers = () => {
      on("change:token", checkTokenSize);
    };

    var notifyStart = () => {
      log(`.oO WildShapeResizer ${version} Oo.`);
    };

    return {
      notifyStart: notifyStart,
      registerHandlers: registerHandlers,
    };
  })();

on("ready", () => {
  "use strict";
  WildShapeResizer.notifyStart();
  WildShapeResizer.registerHandlers();
});
