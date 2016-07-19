/**
 * A small library for testing collisions between moving tokens in Roll20.
 */
var TokenCollisions = (function() {
    'use strict';

    /**
     * An object encapsulating a collision between two tokens and the point
     * of collision.
     * @typedef {object} Collision
     * @property {Graphic} token
     *           The token that moved.
     * @property {Graphic} other
     *           The token it collided with.
     * @property {vec2} pt
     *           The point of collision.
     * @property {number} dist
     *           The distance of the collision from the its waypoint start.
     */

    /**
     * An object with optional parameters for collision functions.
     * @typedef {object} CollisionOptions
     * @property {boolean} detailed
     *           If true, the collision function will return Collision objects
     *           instead instead of Tokens that were collided with.
     */

    /**
     * A circle, defined by its center point and radius.
     * @typedef {object} circle
     * @property {vec3} pt
     *           The center point.
     * @property {number} r
     *           The radius.
     */

    /**
     * A rectangle defined by its corner points, going either clockwise or
     * counter-clockwise around its center.
     * @typedef {vec3[]}
     */

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
     * @param {CollisionOptions} [options]
     * @return {(Graphic[]|Collisions[])}
     */
    function getCollisions(token, others, options) {
        return _.chain( _getLastMoveWaypoints(token))
          .map(function(waypoint) {
            return _getCollisionsInWaypoint(token, others, waypoint, options);
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
      * @param {object} [options]
      * @return {(Graphic[]|Collisions[])}
      */
     function _getCollisionsInWaypoint(token, others, waypoint, options) {
       options = options || {};
       var startPt = waypoint[0];
       var endPt = waypoint[1];

       var numCollisions = 0;

       return _.chain(others)

         // Get the list of tokens that actually collide, sorted by the distance
         // from the starting point at which they occur.
         .map(function(other) {
           var dist;
           if(token.get('aura1_square'))
              if(other.get('aura1_square'))
                dist = _testRectsCollision(token, other, waypoint);
              else
                dist = _testRectCircleCollision(token, other, waypoint);
           else
              if(other.get('aura1_square'))
                dist = _testCircleRectCollision(token, other, waypoint);
              else
                dist = _testCirclesCollision(token, other, waypoint);

           if(dist !== undefined) {
             numCollisions++;

             var alpha = dist/VecMath.dist(startPt, endPt);
             var vec = VecMath.sub(endPt, startPt);
             vec = VecMath.scale(vec, alpha);
             var pt = VecMath.add(startPt, vec);

             return {
               token: token,
               other: other,
               dist: dist,
               pt: pt
             };
           }
           else
             return undefined;
         })

         .sortBy(function(collision) {
           if(collision !== undefined)
             return collision.dist;
           else
             return undefined;
         })

         // Other tokens with undefined collision distance will be sorted to the high
         // end of the list. So, we'll just drop them.
         .first(numCollisions)
         .map(function(collision) {
           if(options.detailed)
             return collision;
           else
             return collision.other;
         })
         .value();
     }

    /**
     * Returns the first token, from some list of tokens, that a token has
     * collided with during its last movement, or undfined if there was
     * no collision.
     * @param {Graphic} token
     * @param {Graphic[]} others
     * @param {CollisionOptions} [options]
     * @return {(Graphic|Collision)}
     */
    function getFirstCollision(token, others, options) {
      return getCollisions(token, others, options)[0];
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
     * Gets the circle bounding a token.
     * @param  {Graphic} token
     * @param  {number} inset
     * @return {circle}
     */
    function _getTokenCircle(token, inset) {
      inset = inset || 0;
      var x = token.get('left');
      var y = token.get('top');
      var r = token.get('width')/2 - inset;

      return {
        pt: [x, y, 1],
        r: r
      };
    }

    /**
     * Gets the rectangule bounding a token.
     * @private
     * @param  {Graphic} token
     * @param {number} inset
     * @return {rectangle}
     */
    function _getTokenRectangle(token, inset) {
      inset = inset || 0;

      var width = token.get('width') - inset;
      var height = token.get('height') - inset;
      var x = token.get('left');
      var y = token.get('top');
      var angle = token.get('rotation')*Math.PI/180;

      var m = MatrixMath.multiply(
        MatrixMath.translate([x, y]),
        MatrixMath.rotate(angle)
      );
      return [
        MatrixMath.multiply(m, [-width/2, -height/2, 1]),
        MatrixMath.multiply(m, [width/2, -height/2, 1]),
        MatrixMath.multiply(m, [width/2, height/2, 1]),
        MatrixMath.multiply(m, [-width/2, height/2, 1])
      ];
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
     * Checks if a non-moving token is currently overlapping another token.
     * This supports circular and rectangular tokens.
     * Tokens are considered to be rectangular if their aura1 is a square.
     * @param  {Graphic}  token
     * @param  {Graphic}  other
     * @param {boolean} [collideOnEdge=false]
     *        Whether tokens should count as overlapping even if they are only
     *        touching on the very edge.
     * @return {Boolean}
     */
    function isOverlapping(token, other, collideOnEdge) {
      // A token cannot overlap itself.
      if(token.get('_id') === other.get('_id'))
        return false;

      // Inset by 1 pixel if we don't want to collide on edges.
      var inset = 1;
      if(collideOnEdge)
        inset = 0;

      // All the overlap tests inset the shapes by 1, so that we don't collide
      // if we're just on the very edge (which is most often the case on grid maps).
      if(token.get('aura1_square')) {
        var tokenRect = _getTokenRectangle(token, inset);
        if(other.get('aura1_square')) {
          var otherRect = _getTokenRectangle(other, inset);
          return _isOverlappingRectRect(tokenRect, otherRect);
        }
        else {
          var otherCircle = _getTokenCircle(other, inset);
          return _isOverlappingCircleRect(otherCircle, tokenRect);
        }
      }
      else {
        var tokenCircle = _getTokenCircle(token, inset);
        if(other.get('aura1_square')) {
          var otherRect = _getTokenRectangle(other, inset);
          return _isOverlappingCircleRect(tokenCircle, otherRect);
        }
        else {
          var otherCircle = _getTokenCircle(other, inset);
          return _isOverlappingCircleCircle(tokenCircle, otherCircle);
        }
      }
    }

    /**
     * Checks if a circle is overlapping a circle.
     * @private
     * @param  {circle}  circle1
     * @param  {circle}  circle2
     * @return {Boolean}
     */
    function _isOverlappingCircleCircle(circle1, circle2) {
      var threshold = circle1.r + circle2.r;
      var dist = VecMath.dist(circle1.pt, circle2.pt);
      return dist <= threshold;
    }

    /**
     * Checks if a circle is overlapping a rectangle.
     * @private
     * @param  {circle}  circle
     * @param  {rectangle}  rect
     * @return {Boolean}
     */
    function _isOverlappingCircleRect(circle, rect) {
      var rectSegs = [
        [rect[0], rect[1]],
        [rect[1], rect[2]],
        [rect[2], rect[3]],
        [rect[3], rect[0]]
      ];

      // True if the circle's center is inside the rectangle or if the circle's
      // radius intersects one of the rectangle's segments.
      return _isPointInRect(circle.pt, rect) ||
        !!_.find(rectSegs, function(seg1) {
          var u = VecMath.vec(seg1[0], seg1[1]);
          var uAngle = Math.atan2(u[1], u[0]);

          var orthogonalAngles = [uAngle + Math.PI/2, uAngle - Math.PI/2];
          return !!_.find(orthogonalAngles, function(angle) {
            var endPt = [
              circle.pt[0] + circle.r*Math.cos(angle),
              circle.pt[1] + circle.r*Math.sin(angle)
            ];
            var seg2 = [
              circle.pt,
              endPt
            ];
            return PathMath.segmentIntersection(seg1, seg2);
          });
        });
    }

    /**
     * Checks if a rectangle is overlapping a rectangle.
     * @param  {rectangle}  rect1
     *         The segments of the first rectangle, going around either
     *         clockwise or counter-clockwise.
     * @param  {rectangle}  rect2
     *         The segments of the first rectangle, going around either
     *         clockwise or counter-clockwise.
     * @return {Boolean}
     */
    function _isOverlappingRectRect(rect1, rect2) {
      var rect1Segs = [
        [rect1[0], rect1[1]],
        [rect1[1], rect1[2]],
        [rect1[2], rect1[3]],
        [rect1[3], rect1[0]]
      ];
      var rect2Segs = [
        [rect2[0], rect2[1]],
        [rect2[1], rect2[2]],
        [rect2[2], rect2[3]],
        [rect2[3], rect2[0]]
      ];

      // True iff the rectangles intersect or if one entirely contains the other.
      return !!_.find(rect1Segs, function(seg1) {
          return !!_.find(rect2Segs, function(seg2) {
            return PathMath.segmentIntersection(seg1, seg2);
          });
        }) ||
        _isPointInRect(rect1Segs[0][0], rect2) ||
        _isPointInRect(rect2Segs[0][0], rect1);
    }

    /**
     * Checks if a point is inside a rectangle.
     * @param  {vec3}  pt
     * @param  {rectangle}  rect
     * @return {Boolean}
     */
    function _isPointInRect(pt, rect) {
      var rectSegs = [
        [rect[0], rect[1]],
        [rect[1], rect[2]],
        [rect[2], rect[3]],
        [rect[3], rect[0]]
      ];

      var underCount = 0;
      _.each(rectSegs, function(seg) {
        var u = VecMath.vec(seg[0], seg[1]);
        var v = VecMath.vec(seg[0], pt);
        var crossUV = VecMath.cross(u, v);
        if(crossUV[2] > 0)
          underCount++;
        else
          underCount--;
      });
      return Math.abs(underCount) === 4;
    }

    /**
     * Tests if a circular token collides with another circular token during
     * its last movement.
     * @param  {Graphic} token
     * @param  {Graphic} other
     * @param {waypoint} waypoint
     * @return {number}
     *         The distance along the waypoint at which the collision happens,
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
        var h = VecMath.ptLineDist(otherPt, startPt, endPt);
        var r = (other.get('width') + token.get('width'))/2.0;
        var offset = Math.sqrt(r*r - h*h);

        // Return the length of the projection of v onto u, minus the offset.
        var u = VecMath.vec(startPt, endPt);
        var v = VecMath.vec(startPt, otherPt);
        var projection = VecMath.scalarProjection(u, v);

        return projection - offset;
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
     *         The distance along the waypoint at which the collision happens,
     *         or undefined if there is no collision.
     */
    function _testCircleRectCollision(token, other, waypoint) {
      var startPt = _.clone(waypoint[0]);
      startPt[2] = 1;
      var endPt = _.clone(waypoint[1]);
      endPt[2] = 1;
      var u = VecMath.vec(startPt, endPt);

      // Convert the tokens to shapes.
      var circle = {
        pt: startPt,
        r: token.get('width')/2 - 1
      };
      var rect = _getTokenRectangle(other);

      // No collision if token is already inside other's area.
      if(_isOverlappingCircleRect(circle, rect))
        return undefined;

      // Find shortest distance to one of the segments.
      var shortest = _testCircleRectCollisionProjection(circle, rect, u);

      // _.min will return Infinity if all distances are undefined. So guard against that.
      if(shortest === Infinity)
        return undefined;
      else
        return shortest;
    }

    /**
     * Helper for _testCircleRectCollisionProjection.
     * Gets the shortest distance from a circle to its tangent point on a rectangle.
     * @private
     * @param  {circle} circle
     * @param  {rectangle} rect
     * @param  {vec3} u
     * @return {number}
     */
    function _testCircleRectCollisionProjection(circle, rect, u) {
      var rectSegs = [
        [rect[0], rect[1]],
        [rect[1], rect[2]],
        [rect[2], rect[3]],
        [rect[3], rect[0]]
      ];

      var moveSegs = [];
      var uAngle = Math.atan2(u[1], u[0]);
      _.each([uAngle + Math.PI/2, uAngle, uAngle - Math.PI/2], function(angle) {
        var p = [
          circle.pt[0] + circle.r*Math.cos(angle),
          circle.pt[1] + circle.r*Math.sin(angle),
          1
        ];
        var q = VecMath.add(p, u);
        moveSegs.push([p, q]);
      });
      moveSegs.push([moveSegs[0][0], moveSegs[1][1]]);
      moveSegs.push([moveSegs[2][0], moveSegs[1][1]]);

      return _.chain(rectSegs)
        .map(function(seg1) {
          return _.chain(moveSegs)
            .map(function(seg2) {
              var intersection = PathMath.segmentIntersection(seg1, seg2);
              if(intersection) {
                var v = VecMath.sub(intersection[0], seg2[0]);
                //log(v);
                return VecMath.length(v);
              }
              else
                return undefined;
            })
            .min()
            .value();
        })
        .min()
        .value();
    }

    /**
     * Tests for an in-movement collisions between a rectangular token and a circular token.
     * @param  {Graphic} token
     * @param  {Graphic} other
     * @param {waypoint} waypoint
     * @return {number}
     *         The distance along the waypoint at which the collision happens,
     *         or undefined if there is no collision.
     */
    function _testRectCircleCollision(token, other, waypoint) {
      var startPt = _.clone(waypoint[0]);
      startPt[2] = 1;
      var endPt = _.clone(waypoint[1]);
      endPt[2] = 1;

      var otherPt = _getTokenPt(other);
      otherPt[2] = 1;

      var u = VecMath.vec(startPt, endPt);
      var negateU = VecMath.vec(endPt, startPt);

      // A circle for the token at its start point.
      var circle = {
        pt: otherPt,
        r: other.get('width')/2
      };

      // Get token's corner points (from where it started).
      var tokenRect = _.map(_getTokenRectangle(token), function(corner) {
        var offset = VecMath.sub(corner, [token.get('left'), token.get('top'), 1]);
        return VecMath.add(startPt, offset);
      });

      // No collision if token is already inside other's area.
      if(_isOverlappingCircleRect(circle, tokenRect))
        return undefined;

      // Find shortest distance to one of the segments.
      var shortest = _testCircleRectCollisionProjection(circle, tokenRect, negateU);

      // _.min will return Infinity if all distances are undefined. So guard against that.
      if(shortest === Infinity)
        return undefined;
      else
        return shortest;
    }

    /**
     * Tests for a collision between two rectangular tokens and returns
     * the shortest distance to the collision.
     * @param  {Graphic} token
     * @param  {Graphic} other
     * @param {waypoint} waypoint
     * @return {number}
     *         The distance along the waypoint at which the collision happens,
     *         or undefined if there is no collision.
     */
    function _testRectsCollision(token, other, waypoint) {
      var startPt = _.clone(waypoint[0]);
      startPt[2] = 1;
      var endPt = _.clone(waypoint[1]);
      endPt[2] = 1;
      var u = VecMath.vec(startPt, endPt);
      var negateU = VecMath.scale(u, -1);

      // Get token's corner points (from where it started).
      var tokenRect = _.map(_getTokenRectangle(token, 1), function(corner) {
        var offset = VecMath.sub(corner, [token.get('left'), token.get('top'), 1]);
        return VecMath.add(startPt, offset);
      });
      var otherRect = _getTokenRectangle(other);

      // Skip if they were already overlapping at the start.
      if(_isOverlappingRectRect(tokenRect, otherRect))
        return undefined;

      var shortest = _.min([
        _testRectsCollisionProjection(tokenRect, otherRect, u),
        _testRectsCollisionProjection(otherRect, tokenRect, negateU)
      ]);

      // _.min will return Infinity if all distances are undefined. So guard against that.
      if(shortest === Infinity)
        return undefined;
      else
        return shortest;
    }

    /**
     * Helper for _testRectsCollision. It projects a rectangle's corners along
     * the movement vector to find the closest intersection to the other
     * rectangle's segemnts.
     * @private
     * @param  {rectangle} rect1
     * @param  {rectangle} rect2
     * @param  {vec3} u
     * @return {number}
     */
    function _testRectsCollisionProjection(rect1, rect2, u) {
      var rect2Segs = [
        [rect2[0], rect2[1]],
        [rect2[1], rect2[2]],
        [rect2[2], rect2[3]],
        [rect2[3], rect2[0]]
      ];

      // Project each corner along u and find the shortest distance to an intersection.
      return _.chain(rect1)
        .map(function(corner) {
          var projectedSeg = [corner, VecMath.add(corner, u)];

          // Get the shortest distance from the current corner to its projected intersection.
          return _.chain(rect2Segs)
            .map(function(seg) {
              var intersection = PathMath.segmentIntersection(projectedSeg, seg);
              if(intersection)
                return VecMath.dist(corner, intersection[0]);
              else
                return undefined;
            })
            .min()
            .value()
        })
        .min()
        .value();
    }


    // The exposed API.
    return {
        getFirstCollision: getFirstCollision,
        getCollisions: getCollisions,
        isOverlapping: isOverlapping
    };
})();
