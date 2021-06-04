(() => {
  'use strict';


  /**
   * Module for constructing Paths from which areas of effect are generated.
   */
  AreasOfEffect.Paths = class {
    /**
     * Creates a line segment path between two tokens.
     * @private
     * @param {Graphic} token1
     * @param {Graphic} token2
     * @return {Path}
     */
    static createPathBetweenTokens(token1, token2) {
      let p1 = [ token1.get('left'), token1.get('top') ];
      let p2 = [ token2.get('left'), token2.get('top') ];
      let segment = [ p1, p2 ];
      let pathJson = PathMath.segmentsToPath([segment]);
      return createObj('path', _.extend(pathJson, {
        _pageid: token1.get('_pageid'),
        layer: 'objects',
        stroke: '#ff0000'
      }));
    }

    /**
     * Creates a line segment path for a D&D 4th edition style blast from
     * a token in the direction it is currently facing.
     * @private
     * @param {Graphic} token
     * @param {number} radiusUnits
     * @return {Path}
     */
    static createRadiusPathAtBlast(token, radiusUnits) {
      let page = getObj('page', token.get('_pageid'));
      let radiusPixels = radiusUnits / page.get('scale_number') * 70;
      let tokenRadius = token.get('width')/2;

      let p1 = [
        token.get('left'),
        token.get('top'),
        1
      ];

      // Produce a list of segments representing the square of furthest origin points
      // for the blast's center.
      let gridDist = tokenRadius + radiusPixels/2;
      var square = new PathMath.Polygon([
        [p1[0] - gridDist, p1[1] - gridDist, 1],
        [p1[0] + gridDist, p1[1] - gridDist, 1],
        [p1[0] + gridDist, p1[1] + gridDist, 1],
        [p1[0] - gridDist, p1[1] + gridDist, 1]
      ]);
      let squareSegs = square.toSegments();

      // Create a segment from the token to somewhere past the blast origin
      // square in the direction that the token is facing.
      let angle = token.get('rotation')/180*Math.PI - Math.PI/2;
      let v = [radiusPixels*2, 0, 0];
      v = MatrixMath.multiply(MatrixMath.rotate(angle), v);
      let p2 = VecMath.add(p1, v);
      let seg1 = [p1, p2];

      // Find the point at which our directional segment intersects the square.
      // This is where we will put the origin for the blast's center.
      let intersection;
      _.find(squareSegs, seg2 => {
        intersection = PathMath.segmentIntersection(seg1, seg2);
        return intersection;
      });
      let origin = intersection[0];

      // Produce the path for the blast.
      let blastSeg = [origin, VecMath.add(origin, [radiusPixels/2, 0, 0])];
      let pathJson = PathMath.segmentsToPath([blastSeg]);
      return createObj('path', _.extend(pathJson, {
        _pageid: token.get('_pageid'),
        layer: 'objects',
        stroke: '#ff0000'
      }));
    }

    /**
     * Creates a line segment path from some token out to some radius in the
     * direction it is currently facing.
     * @private
     * @param {Graphic} token
     * @param {number} radiusUnits
     * @return {Path}
     */
    static createRadiusPathAtCone(token, radiusUnits) {
      let page = getObj('page', token.get('_pageid'));
      let radiusPixels = radiusUnits / page.get('scale_number') * 70;
      let tokenRadius = token.get('width')/2;

      let angle = token.get('rotation')/180*Math.PI - Math.PI/2;
      let mRotate = MatrixMath.rotate(angle);

      // The first point is at the edge of the token.
      let p1 = [
        token.get('left'),
        token.get('top'),
        1
      ];
      let u = [tokenRadius, 0, 0];
      u = MatrixMath.multiply(mRotate, u);
      p1 = VecMath.add(p1, u);

      // The second point continues forward from that point to the required distance.
      let v = [radiusPixels, 0, 0];
      v = MatrixMath.multiply(mRotate, v);
      let p2 = VecMath.add(p1, v);

      // Produce the path for the line/cone.
      let segment = [p1, p2];
      let pathJson = PathMath.segmentsToPath([segment]);
      return createObj('path', _.extend(pathJson, {
        _pageid: token.get('_pageid'),
        layer: 'objects',
        stroke: '#ff0000'
      }));
    }

    /**
     * Creates a line segment path from some token out to some radius from
     * the token's edge.
     * @private
     * @param {Graphic} token1
     * @param {Graphic} token2
     * @return {Path}
     */
    static createRadiusPathAtToken(token, radiusUnits) {
      let page = getObj('page', token.get('_pageid'));
      let radiusPixels = radiusUnits / page.get('scale_number') * 70;

      let p1 = [
        token.get('left'),
        token.get('top')
      ];
      let p2 = VecMath.add(p1, [radiusPixels, 0]);

      let segment = [ p1, p2 ];
      let pathJson = PathMath.segmentsToPath([segment]);
      return createObj('path', _.extend(pathJson, {
        _pageid: token.get('_pageid'),
        layer: 'objects',
        stroke: '#ff0000'
      }));
    }
  };
})();
