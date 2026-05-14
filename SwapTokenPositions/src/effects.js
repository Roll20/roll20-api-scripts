/**
 * Spawns a point FX on a page when enabled.
 *
 * @param {number} x X coordinate.
 * @param {number} y Y coordinate.
 * @param {string} fxType Roll20 FX type.
 * @param {string} pageId Roll20 page id.
 * @returns {void}
 */
export function spawnPointFx(x, y, fxType, pageId) {
  if (fxType === "none") {
    return;
  }
  try {
    spawnFx(x, y, fxType, pageId);
  } catch (error) {
    log(`SwapTokenPositions: Point FX failed, but swap will continue: ${error.message}`);
  }
}

/**
 * Spawns travel FX between two positions when enabled.
 *
 * @param {{left:number, top:number, page:string}} pos1 Source position.
 * @param {{left:number, top:number, page:string}} pos2 Destination position.
 * @param {string} fxType Roll20 FX type.
 * @returns {void}
 */
export function spawnTravelFx(pos1, pos2, fxType) {
  if (fxType === "none") {
    return;
  }
  try {
    spawnFxBetweenPoints(
      { x: pos1.left, y: pos1.top, pageid: pos1.page },
      { x: pos2.left, y: pos2.top, pageid: pos2.page },
      fxType,
    );
  } catch (error) {
    log(`SwapTokenPositions: Travel FX failed, but swap will continue: ${error.message}`);
  }
}
