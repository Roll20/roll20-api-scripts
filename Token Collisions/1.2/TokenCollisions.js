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

         return _.chain(others)

          // Get the list of tokens that actually collide.
           .filter(function(other) {
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
             return (startDist > thresholdDist && dist < thresholdDist);
           })

           // Sort the tokens in the order they are collided with.
           .sortBy(function(other) {
             // Get the projection offset where the tokens should first collide.
             // At this point their distance would equal the sum of their radii.
             var otherPt = _getTokenPt(other);
             var h = VecMath.ptSegDist(otherPt, startPt, endPt);
             var r = (other.get('width') + token.get('width'))/2.0;
             var offset = Math.sqrt(r*r - h*h);

             // Return the length of the projection of v onto u, minus the offset.
             var u = VecMath.vec(startPt, endPt);
             var v = VecMath.vec(startPt, otherPt);
             return VecMath.scalarProjection(u, v) - offset;
           })
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


    // The exposed API.
    return {
        getFirstCollision: getFirstCollision,
        getCollisions: getCollisions
    };
})();
