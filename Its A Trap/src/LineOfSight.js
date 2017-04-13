/**
 * A small library for checking if a token has line of sight to other tokens.
 */
var LineOfSight = (() => {
  'use strict';

  /**
   * Gets the point for a token.
   * @private
   * @param {Graphic} token
   * @return {vec3}
   */
  function _getPt(token) {
    return [token.get('left'), token.get('top'), 1];
  }

  return class LineOfSight {

    /**
     * Gets the tokens that a token has line of sight to.
     * @private
     * @param  {Graphic} token
     * @param  {Graphic[]} otherTokens
     * @param  {number} [range=Infinity]
     *         The line-of-sight range in pixels.
     * @param {boolean} [isSquareRange=false]
     * @return {Graphic[]}
     */
    static filterTokens(token, otherTokens, range, isSquareRange) {
      if(_.isUndefined(range))
        range = Infinity;

      let pageId = token.get('_pageid');
      let tokenPt = _getPt(token);
      let tokenRW = token.get('width')/2-1;
      let tokenRH = token.get('height')/2-1;

      let wallPaths = findObjs({
        _type: 'path',
        _pageid: pageId,
        layer: 'walls'
      });
      let wallSegments = PathMath.toSegments(wallPaths);

      return _.filter(otherTokens, other => {
        let otherPt = _getPt(other);
        let otherRW = other.get('width')/2;
        let otherRH = other.get('height')/2;

        // Skip tokens that are out of range.
        if(isSquareRange && (
          Math.abs(tokenPt[0]-otherPt[0]) >= range + otherRW + tokenRW ||
          Math.abs(tokenPt[1]-otherPt[1]) >= range + otherRH + tokenRH))
          return false;
        else if(!isSquareRange && VecMath.dist(tokenPt, otherPt) >= range + tokenRW + otherRW)
          return false;

        let segToOther = [tokenPt, otherPt];
        return !_.find(wallSegments, wallSeg => {
          return PathMath.segmentIntersection(segToOther, wallSeg);
        });
      });
    }
  };
})();
