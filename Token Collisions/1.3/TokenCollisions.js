/**
 * A small library for testing collisions between moving tokens in Roll20.
 */
var TokenCollisions = (function() {

    /**
     * A movement waypoint defined by two points: The starting point and the
     * movement's endpoint.
     * @typedef {vec2[]} waypoint
     */

    /**
     * Returns the list of other tokens that some token collided with during
     * its last movement.
     * The tokens are sorted in the order they are collided with.
     * @param {Graphic} token
     * @param {Graphic[]} others
     * @return {Graphic[]}
     */
    function getCollisions(token, others) {
        return _.chain( _getLastMoveWaypoints(token))
          .map(function(waypoint) {
            return _getCollisionsInWaypoint(token, others, waypoint);
          })
          .flatten()
          .value();
     }

     /**
      * For some token, this gets the list of tokens it collided with during its
      * movement between two points, from some list of other tokens.
      * The tokens are sorted in the order that they are collided with.
      * @private
      * @param {Graphic} token
      * @param {Graphic[]} others
      * @param {waypoint} waypoint
      * @return {Graphic[]}
      */
     function _getCollisionsInWaypoint(token, others, waypoint) {
       var startPt = waypoint[0];
       var endPt = waypoint[1];

       var numCollisions = 0;

       return _.chain(others)

         // Get the list of tokens that actually collide, sorted by the distance
         // from the starting point at which they occur.
         .sortBy(function(other) {
           var dist;
           if(other.get('aura1_square'))
              dist = _testCircleRectCollision(token, other, waypoint);
           else
              dist = _testCirclesCollision(token, other, waypoint);

           if(dist !== undefined)
             numCollisions++;
           return dist;
         })

         // Other tokens with undefined collision distance will be sorted to the high
         // end of the list. So, we'll just drop them.
         .first(numCollisions)
         .value();
     }

    /**
     * Returns the first token, from some list of tokens, that a token has
     * collided with during its last movement, or undfined if there was
     * no collision.
     * @param {Graphic} token
     * @param {Graphic[]} others
     * @return {Graphic}
     */
    function getFirstCollision(token, others) {
      return getCollisions(token, others)[0];
    }

    /**
     * Gets the list of all points traversed during a token's movement, including
     * its current position at the end of the movement.
     * @private
     * @param {Graphic} token
     * @return {vec2[]}
     */
    function _getLastMovePts(token) {
        // Get all the coordinates from the last movement, including the final point.
        var lastMove = token.get('lastmove');
        var moveCoords = _.map(lastMove.split(","), function(coord) {
          return parseInt(coord);
        });
        moveCoords.push(parseInt(token.get("left")));
        moveCoords.push(parseInt(token.get("top")));

        // Convert the coordinate pairs into points.
        var pts = [];
        for(var i=0; i < moveCoords.length - 1; i+=2) {
            var x = moveCoords[i];
            var y = moveCoords[i+1];
            pts.push([x, y]);
        }
        return pts;
    }

    /**
     * Gets the list of all points traversed during a token's movement, including
     * its current position at the end of the movement.
     * @private
     * @param {Graphic} token
     * @return {waypoint[]}
     */
    function _getLastMoveWaypoints(token) {
        var pts = _getLastMovePts(token);

        var waypoints = [];
        var prev;
        _.each(pts, function(pt) {
          if(prev)
            waypoints.push([prev, pt]);
          prev = pt;
        });
        return waypoints;
    }

    /**
     * Gets the points of a rectangular token's corners. This allows for
     * rotated tokens.
     * @param  {Graphic} rectToken
     * @return {vec3[]}
     */
    function _getRectTokenCorners(rectToken) {
      var width = rectToken.get('width');
      var height = rectToken.get('height');
      var rectX = rectToken.get('left');
      var rectY = rectToken.get('top');
      var angle = rectToken.get('rotation')*Math.PI/180;

      var m = MatrixMath.multiply(
        MatrixMath.translate([rectX, rectY]),
        MatrixMath.rotate(angle)
      );

      var a = MatrixMath.multiply(m, [-width/2, -height/2, 1]);
      var b = MatrixMath.multiply(m, [width/2, -height/2, 1]);
      var c = MatrixMath.multiply(m, [-width/2, height/2, 1]);
      var d = MatrixMath.multiply(m, [width/2, height/2, 1]);
      return [a, b, c, d];
    }

    /**
     * Gets the position of a token.
     * @private
     * @param {Graphic} token
     * @return {vec2}
     */
    function _getTokenPt(token) {
        var x = token.get("left");
        var y = token.get("top");
        return [x, y];
    }

    /**
     * Checks if a point is inside a rectangular token's area.
     * The rectangular token might be rotated.
     * @param  {vec3}  pt
     * @param  {Graphic}  rectToken
     * @return {Boolean}
     */
    function _isPointInRectToken(pt, rectToken) {
      var width = rectToken.get('width');
      var height = rectToken.get('height');
      var rectX = rectToken.get('left');
      var rectY = rectToken.get('top');
      var angle = rectToken.get('rotation')*Math.PI/180;

      var m = MatrixMath.multiply(
        MatrixMath.translate([rectX, rectY]),
        MatrixMath.rotate(angle)
      );
      var mInv = MatrixMath.inverse(m);

      var pt2 = MatrixMath.multiply(mInv, pt);
      return (Math.abs(pt2[0]) <= width/2 && Math.abs(pt2[1]) <= height/2);
    }

    /**
     * Tests if a circular token collides with another circular token during
     * its last movement.
     * @param  {Graphic} token
     * @param  {Graphic} other
     * @param {waypoint} waypoint
     * @return {number}
     *         The distance from the start point at which the collision happens,
     *         or undefined if there is no collision.
     */
    function _testCirclesCollision(token, other, waypoint) {
      var startPt = waypoint[0];
      var endPt = waypoint[1];
      var otherPt = _getTokenPt(other);

      // We assume that all tokens are circular, therefore width = diameter.
      var r1 = token.get('width')/2;
      var r2 = other.get('width')/2;
      var thresholdDist = r1 + r2;

      // Figure out the closest distance we came to the other token during
      // the movement. It doesn't count if the move started in the
      // distance threshold.
      var startDist = VecMath.dist(startPt, otherPt) + 1;
      var dist = VecMath.ptSegDist(otherPt, startPt, endPt) + 1; // +1 to make up for rounding error.

      // If there is a collision, find the parametric value for where it happened.
      if(startDist > thresholdDist && dist < thresholdDist) {

        // Get the projection offset where the tokens should first collide.
        // At this point their distance would equal the sum of their radii.
        var h = dist - 1;
        var r = (other.get('width') + token.get('width'))/2.0;
        var offset = Math.sqrt(r*r - h*h);

        // Return the length of the projection of v onto u, minus the offset.
        var u = VecMath.vec(startPt, endPt);
        var v = VecMath.vec(startPt, otherPt);
        return VecMath.scalarProjection(u, v) - offset;
      }
      else
        return undefined;
    }

    /**
     * Tests if a circular token collides with a rectangular token during its last movement.
     * @param  {Graphic} token
     * @param  {Graphic} other
     * @param {waypoint} waypoint
     * @return {number}
     *         The distance from the start point at which the collision happens,
     *         or undefined if there is no collision.
     */
    function _testCircleRectCollision(token, other, waypoint) {
      var startPt = _.clone(waypoint[0]);
      startPt[2] = 1;
      var endPt = _.clone(waypoint[1]);
      endPt[2] = 1;
      var u = VecMath.vec(startPt, endPt);

      var otherPt = _getTokenPt(other);

      // No collision if token is already inside other's area.
      if(_isPointInRectToken(startPt, other))
        return undefined;

      // Token's radius.
      var r = token.get('width')/2;

      // Get the segments for the rectangle's sides.
      var corners = _getRectTokenCorners(other);
      var rectSegs = [
        [corners[0], corners[1]],
        [corners[1], corners[3]],
        [corners[3], corners[2]],
        [corners[2], corners[0]]
      ];

      // Find shortest distance to one of the segments.
      var shortest = _.chain(rectSegs)
        .map(function(seg) {
          var segVec = VecMath.vec(seg[0], seg[1]);
          var segAngle = Math.atan2(segVec[1], segVec[0]);

          // The closest points where token will collide is where the segment
          // is tangent to it.
          var orthogonalAngles = [segAngle + 90, segAngle - 90];
          return _.chain(orthogonalAngles)
            .map(function(angle) {

              // Project a segment from the orthogonal point on token in the
              // direction and with the length of u.
              var p = [
                startPt[0] + r*Math.cos(angle),
                startPt[1] + r*Math.sin(angle),
                1
              ];
              var q = VecMath.add(p, u);

              // Find the distance to where the projected line intersects.
              var intersection = PathMath.segmentIntersection([p, q], seg);
              if(intersection)
                return VecMath.dist(intersection[0], p);
              else
                return undefined;
            })
            .min()
            .value();
        })
        .min()
        .value();

      // _.min will return Infinity if all distances are undefined. So guard against that.
      if(shortest === Infinity)
        return undefined;
      else
        return shortest;
    }


    // The exposed API.
    return {
        getFirstCollision: getFirstCollision,
        getCollisions: getCollisions
    };
})();
