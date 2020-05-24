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
 * Version: 0.0.2
 */

var WildShapeResizer =
  WildShapeResizer ||
  (() => {
    "use strict";

    const version = "0.0.2";
    const defaultGridSize = 70;

    const checkTokenSize = (token) => {
      const name = token.get("name");
      if (!name) return;

      const tableItems = itemsForToken(token);
      if (!tableItems || tableItems.length < 1) return;

      const page = getObj("page", token.get("_pageid"));
      let gridSize = defaultGridSize;

      if (page) {
        gridSize = page.get("snapping_increment") * gridSize;
      }

      if (gridSize <= 0) {
        gridSize = defaultGridSize;
      }

      const side = tableItems[token.get("currentSide")];
      if (!imageCompare(side.get("avatar"), token.get("imgsrc"))) {
        // Rollable Table sides are copied into the token when it is created. If you change the table
        log("WildShapeResizer ERROR: token image does not match table image");
        sendChat(
          "WildShapeResizer",
          "/direct <strong>ERROR:</strong> token image does not match table image." +
            " This token likely needs to be recreated."
        );
        return;
      }

      const weight = side.get("weight");
      const dimension = gridSize * weight;
      doResize(token, dimension);
    };

    const doResize = (token, dimension) => {
      const name = token.get("name");

      const currentW = token.get("width");
      const currentH = token.get("height");

      // TODO: get the locations of the other tokens on the board and try to keep from overlapping them
      const currentL = token.get("left");
      const currentT = token.get("top");

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

    const itemsForToken = (token) => {
      const name = token.get("name");
      if (!name) return undefined;

      const table = findObjs({ _type: "rollabletable", name: name })[0];
      if (!table) return undefined;

      return findObjs({
        _type: "tableitem",
        _rollabletableid: table.id,
      });
    };

    const imageCompare = (img1, img2) => {
      return imageNormalize(img1) === imageNormalize(img2);
    }

    const imageNormalize = (img) => {
      img = img.replace(/\?.*$/, '');
      img = img.replace(/(.*)\/[^.]+/, '$1/max');
      return img;
    }

    const registerHandlers = () => {
      on("change:token", checkTokenSize);
    };

    const notifyStart = () => {
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
