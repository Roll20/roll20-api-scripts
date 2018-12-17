/**
 * A small library for testing collisions between moving tokens in Roll20.
 */
var TokenCollisions = (function() {
    /**
     * Returns the first token, from some list of tokens, that a token has
     * collided with during its last movement.
     * @param {Graphic} token           The token that moved
     * @param {Graphic[]} otherTokens   The list of tokens we are testing collisions with. 
     * @return {Graphic || false} If the token collided with another token, the first token that
     *          it would collide with during its movement is returned. Otherwise it returns false.
     */
    var getFirstCollision = function(token, otherTokens) {
        // Get all the points for the movement.
        var movePts = _getAllPointsDuringMovement(token);
        
        // Check each segment of movement to see if we triggered a trap.
        for(var i = 0; i < movePts.length-1; i++) {
            var p1 = movePts[i];
            var p2 = movePts[i+1];
            
            // If we encountered a trap, we're done.
            var collidedToken = _getFirstCollisionInWaypoint(token, otherTokens, p1, p2);
            if(collidedToken) {
                return collidedToken;
            }
        }
        return false
    };
    
    
    /**
     * Returns the list of tokens, from some list of tokens, that a token has 
     * collided with during its last movement.
     * @param {Graphic} token           The token that moved
     * @param {Graphic[]} otherTokens   The tokens we're checking collisions with.
     * @return {Graphic[]}
     */
    var getCollisions = function(token, otherTokens) {
        var movePts = _getAllPointsDuringMovement(token);
        var collisions = [];
        
        // Check each segment of movement to see if we triggered a trap.
        for(var i = 0; i < movePts.length-1; i++) {
            var p1 = movePts[i];
            var p2 = movePts[i+1];
            
            // Append any collisions in this segment to the list.
            var newCollisions = _getCollisionsInWaypoint(token, otherTokens, p1, p2);
            collisions = collisions.concat(newCollisions);
        }
        return collisions
    };
    
    
    /**
     * @private
     * Gets the list of all points traversed during a token's movement, including 
     * its current position at the end of the movement.
     * @param {Graphic} token
     * @return {vec2[]}
     */
    var _getAllPointsDuringMovement = function(token) {
        var results = [];
        
        var moveCoords = token.get("lastmove").split(",");
        for(var i=0; i < moveCoords.length; i++) {
            moveCoords[i] = parseInt(moveCoords[i]);
        }
        moveCoords.push(parseInt(token.get("left")));
        moveCoords.push(parseInt(token.get("top")));
        
        for(var i=0; i <= moveCoords.length - 2; i+=2) {
            var x = moveCoords[i];
            var y = moveCoords[i+1];
            results.push([x, y]);
        }
        
        return results;
    };
    
    
    /**
     * @private
     * Checks if a token collided with another token during its movement between two points.
     * @param {Graphic} token
     * @param {Graphic[]} otherTokens   The list of tokens we are testing collisions with.
     * @param {vec2} startPt
     * @param {vec2} endPt
     * @return {Graphic || false} The first other token that token collided with in its movement. If there was no collision, return false.
     */
    var _getFirstCollisionInWaypoint = function(token, otherTokens, startPt, endPt) {
        var collisions = _getCollisionsInWaypoint(token, otherTokens, startPt, endPt);
        if(collisions.length > 0) {
            var bestToken;
            var bestDist;
            _.each(collisions, function(other) {
                var otherPt = _getTokenPt(other);
                var h = VecMath.ptSegDist(otherPt, startPt, endPt);
                var r = (other.get('width') + token.get('width'))/2.0;
                var ww = r*r - h*h;
                
                var projection = VecMath.projection(VecMath.vec(startPt, endPt), VecMath.vec(startPt, otherPt));
                var dist = VecMath.length(projection);
                dist *= dist;
                dist -= ww;
                dist = dist;
                
                if(bestDist === undefined || dist < bestDist) {
                    bestDist = dist;
                    bestToken = other;
                }
            });
            return bestToken;
        }
        else {
            return false;
        }
    };
    
    
    /**
     * @private
     * For some token, this gets the list of tokens it collided with during its
     * movement between two points, from some list of other tokens.
     * @param {Graphic} token
     * @param {Graphic[]} otherTokens
     * @param {vec2} startPt
     * @param {vec2} endPt
     * @return {Graphic[]}
     */
    var _getCollisionsInWaypoint = function(token, otherTokens, startPt, endPt) {
        var result = [];

        for(var i in otherTokens) {
            var other = otherTokens[i];  
            if(_checkCollisionInWaypoint(token, other, startPt, endPt)) {
                result.push(other);
            }
        }
        
        return result;
    };
    
    /**
     * @private
     * Checks if a token collides with the other token during its movement between
     * two points.
     * @param {Graphic} token   The moving token
     * @param {Graphic} other
     * @param {vec2} startPt
     * @param {vec2} endPt
     * @return {Boolean} true iff there was a collision.
     */
    var _checkCollisionInWaypoint = function(token, other, startPt, endPt) {
        var otherPt = _getTokenPt(other);
        
        // We assume that all tokens are circular, therefore width = diameter.
        var thresholdDist = (parseInt(other.get("width")) + parseInt(token.get("width")))/2;
        
        var distFromStart = Math.ceil(VecMath.dist(startPt, otherPt)) + 1; // +1 to make up for rounding error.
        
        // Don't count the other token if our movement already started in it.
        if(distFromStart >= thresholdDist) {
            // Figure out the closest distance we came to the other token during 
            // the movement.
            var dist = Math.ceil(VecMath.ptSegDist(otherPt, startPt, endPt)) + 1; // +1 to make up for rounding error.
            if(dist < thresholdDist) {
                return true;
            }
        }
        
        return false;
    };
    
    
    /** 
     * @private
     * Returns the token nearest to the specified point 
     * out of some list of tokens.
     * @param {vec2} pt
     * @param {Graphic[]} tokens
     * @return {Graphic}
     */
    var _getNearestTokenToPoint = function(pt, tokens) {
      var result = null;
      var bestDist = -1;
      for(var i in tokens) {
          var token = tokens[i];
          
          var tokenPt = _getTokenPt(token);
          var dist = VecMath.dist(pt, tokenPt);
          
          if(bestDist === -1 || dist < bestDist) {
              result = token;
              bestDist = dist;
          }
      }
      
      return result;
    };
    
    
    /**
     * @private
     * Gets the position of a token.
     * @param {Graphic} token
     * @return {vec2}
     */
    var _getTokenPt = function(token) {
        var x = token.get("left");
        var y = token.get("top");
        return [x, y];
    };
    
    
    // The exposed API.
    return {
        getFirstCollision: getFirstCollision,
        getCollisions: getCollisions
    };
})();