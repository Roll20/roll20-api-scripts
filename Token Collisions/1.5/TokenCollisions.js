/**
 * A small library for testing collisions between moving tokens in Roll20.
 */
var TokenCollisions = (() => {
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
   * A movement waypoint defined by two points: The starting point and the
   * movement's endpoint.
   * @typedef {vec2[]} waypoint
   */

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
    let start = waypoint[0];
    let end = waypoint[1];

    let numCollisions = 0;

    return _.chain(others)

    // Get the list of tokens that actually collide, sorted by the distance
    // from the starting point at which they occur.
    .map(other => {
      let dist = _testCollision(token, other, waypoint);
      if(dist !== undefined) {
        numCollisions++;

        let alpha = dist/VecMath.dist(start, end);
        let vec = VecMath.sub(end, start);
        vec = VecMath.scale(vec, alpha);
        let pt = VecMath.add(start, vec);

        return { token, other, dist, pt };
      }
      return undefined;
    })
    .sortBy(collision => {
      if(collision === undefined)
        return undefined;
      return collision.dist;
    })

    // Other tokens with undefined collision distance will be sorted to the
    // high end of the list. So, we'll just drop them.
    .first(numCollisions)
    .map(collision => {
      if(options.detailed)
        return collision;
      return collision.other
    })
    .value();
  }

  /**
   * Gets the list of all points traversed during a token's movement, including
   * its current position at the end of the movement.
   * @private
   * @param {Graphic} token
   * @return {vec2[]}
   */
  function _getLastMovePts(token) {
    let move = token.get('lastmove').split(',');
    let coords = _.map(move, x => {
      return parseInt(x);
    });

    let pts = _.map(_.range(coords.length/2), i => {
      let x = coords[i*2];
      let y = coords[i*2 + 1];
      return [x, y];
    });
    pts.push([token.get('left'), token.get('top')]);
    return pts;
  }

  /**
   * Gets the position of a token.
   * @private
   * @param {Graphic} token
   * @return {vec2}
   */
  function _getPt(token) {
    return [token.get('left'), token.get('top')];
  }

  /**
   * Gets the list of all points traversed during a token's movement, including
   * its current position at the end of the movement.
   * @private
   * @param {Graphic} token
   * @return {waypoint[]}
   */
  function _getWaypoints(token) {
    let prev;
    let waypoints = [];
    _.each(_getLastMovePts(token), pt => {
      if(prev)
        waypoints.push([prev, pt]);
      prev = pt;
    });
    return waypoints;
  }

  /**
   * Checks if a circle is overlapping a circle.
   * @private
   * @param  {graphic} token
   * @param  {graphic} other
   * @param {int} inset
   * @return {Boolean}
   */
  function _isOverlappingCircleCircle(token, other, inset) {
    let circle1 = _tokenToCircle(token, inset);
    let circle2 = _tokenToCircle(other, inset);
    return circle1.intersects(circle2);
  }

  /**
   * Checks if a circle is overlapping a path/polygon.
   * The path is treated as a polygon if its fill is not transparent.
   * @private
   * @param {graphic} token
   * @param {path} path
   * @param {int} inset
   * @return {boolean}
   */
  function _isOverlappingCirclePath(token, path, inset) {
    let circle = _tokenToCircle(token, inset);

    if(path.get('fill') === 'transparent') {
      let segments = PathMath.toSegments(path);
      return !!_.find(segments, seg => {
        return circle.segmentIntersection(seg);
      });
    }
    else {
      let poly = new PathMath.Polygon(path);
      return circle.intersectsPolygon(poly);
    }
  }

  /**
   * Checks if a circle is overlapping a rectangle.
   * @private
   * @param  {graphic} token
   * @param  {graphic} other
   * @param {int} inset
   * @return {Boolean}
   */
  function _isOverlappingCircleRect(token, other, inset) {
    let circle = _tokenToCircle(token, inset);
    let rect = _tokenToRect(other, inset);
    return circle.intersectsPolygon(rect);
  }

  /**
   * Checks if a rectangle is overlapping a path/polygon.
   * The path is treated as a polygon if its fill is not transparent.
   * @private
   * @param {graphic} token
   * @param {path} path
   * @param {int} inset
   * @return {boolean}
   */
  function _isOverlappingRectPath(token, path, inset) {
    let rect = _tokenToRect(token, inset);

    if(path.get('fill') === 'transparent')
      return rect.intersectsPath(path);
    else {
      let poly = new PathMath.Polygon(path);
      return rect.intersects(poly);
    }
  }

  /**
   * Checks if a rectangle is overlapping a rectangle.
   * @param  {graphic} token
   * @param  {graphic} other
   * @param {int} inset
   * @return {Boolean}
   */
  function _isOverlappingRectRect(token, other, inset) {
    let rect1 = _tokenToRect(token, inset);
    let rect2 = _tokenToRect(other, inset);
    return rect1.intersects(rect2);
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
    let start = waypoint[0];
    start[2] = 1;
    let end = waypoint[1];
    end[2] = 1;
    let pt = _getPt(other);
    pt[2] = 1;
    let segment = [start, end];

    let tokenR = token.get('width')/2;
    let otherR = other.get('width')/2;
    let totalR = tokenR + otherR;

    // Reduce the problem to an intersection between a combined circle and
    // the segment representing the waypoint.
    let circle = new PathMath.Circle(pt, totalR-1); // inset by 1 to avoid edges.
    let intersection = circle.segmentIntersection(segment);
    if(intersection) {
      let intPt = intersection[0];
      let scalar = intersection[1];

      // If our movement started in other's circle, then it doesn't count.
      if(scalar <= 0)
        return undefined;

      // Return the distance from the start to the point of intersection.
      return VecMath.dist(start, intPt);
    }
  }

  /**
   * Tests for a collision between a circle and a Path.
   * If the path's fill is not transparent, then the Path is treated as a
   * Polygon.
   * @private
   * @param {graphic} token
   * @param {Path} path
   * @param {Waypoint} waypoint
   */
  function _testCirclePathCollision(token, path, waypoint) {
    let shape;
    if(path.get('fill') === 'transparent')
      shape = new PathMath.Path(path);
    else
      shape = new PathMath.Polygon(path);

    return _testCirclePolyCollision(token, shape, waypoint);
  }

  /**
   * Tests for a collision between a circle and a Polygon.
   * @private
   * @param {graphic} token
   * @param {(PathMath.Polygon|PathMath.Path)} poly
   * @param {Waypoint} waypoint
   * @return {number} The minimum distance.
   */
  function _testCirclePolyCollision(token, poly, waypoint) {
    let start = _.clone(waypoint[0]);
    start[2] = 1;
    let end = _.clone(waypoint[1]);
    end[2] = 1;
    let u = VecMath.sub(end, start);
    let uLen = VecMath.length(u);
    let uAngle = Math.atan2(u[1], u[0]);
    let radius = token.get('width')/2 - 1; // Inset 1 to avoid edges.

    // Quit early if the polygon's bounding box does not intersect the
    // union of the start and end circles' bounding boxes.
    let startCircle = new PathMath.Circle(start, radius);
    let startBox = startCircle.getBoundingBox();
    let endCircle = new PathMath.Circle(end, radius);
    let endBox = endCircle.getBoundingBox();

    let moveBox = PathMath.BoundingBox.add(startBox, endBox);
    let polyBox = poly.getBoundingBox();

    if(!moveBox.intersects(polyBox))
      return undefined;

    // Quit early if the polygon contains the start circle's center.
    if(poly instanceof PathMath.Polygon && poly.containsPt(startCircle.center))
      return undefined;

    // Produce a system transformation such that our circle is centered at
    // the origin and u points up. Then transform the polygon to this system.
    let rotation = Math.PI/2 - uAngle;
    let m = MatrixMath.multiply(
      MatrixMath.rotate(rotation),
      MatrixMath.translate(VecMath.sub([0,0,1] ,start))
    );
    let mPoly = poly.transform(m);
    let mCircle = new PathMath.Circle([0,0,1], radius);

    // Return the minimum collision distance to a transformed segment.
    let segments = mPoly.toSegments();
    let keptSegs = _testCirclePolyCollision_clipSegments(segments, mCircle);

    let minDist = _testCirclePolyCollision_minDistance(keptSegs, radius);
    if(minDist === Infinity || minDist > uLen)
      return undefined;
    return minDist;
  }

  // Clip out segments that extend beyond +/-radius. Also, get their line
  // equation data.
  function _testCirclePolyCollision_clipSegments(segments, circle) {
    let radius = circle.radius;
    return _.chain(segments)
    .map(seg => {
      let p = seg[0];
      let q = seg[1];

      // Keep vertical segments that lie within the radius.
      if(p[0] === q[0]) {
        if(p[0] > -radius && p[0] < radius) {
          seg.m = undefined;
          seg.b = undefined;
          return seg;
        }
      }

      // Let p be the leftmost point.
      if(p[0] > q[0]) {
        let swap = q;
        q = p;
        p = swap;
      }

      // Get the line equation info.
      let dx = q[0] - p[0];
      let dy = q[1] - p[1];
      let m = dy/dx;
      let b = p[1] - m*p[0];

      // Clip the segment if it intersects the starting circle.
      if(circle.segmentIntersection(seg))
        return;

      // Clip the segment if both points are under the circle.
      if(p[1] < 0 && q[1] < 0)
        return;

      // Clip the segment if both points are on the same side beyond the radius.
      if(p[0] < -radius && q[0] < -radius)
        return;
      else if(p[0] > radius && q[0] > radius)
        return;

      // Clip at intersections with the left and right radius pillars.
      else {
        if(p[0] < -radius)
          p = [-radius, -m*radius + b, 1];
        if(q[0] > radius)
          q = [radius, m*radius + b, 1];
      }

      let clippedSeg = [p, q];
      clippedSeg.m = m;
      clippedSeg.b = b;
      return clippedSeg;
    })
    .compact()
    .value();
  }

  // Using the power of calculus, find the closest segment that
  // wasn't clipped.
  function _testCirclePolyCollision_minDistance(segments, radius) {
    return _.chain(segments)
    .map(seg => {
      let p = seg[0];
      let q = seg[1];

      let fofX = x => { // The line equation for the segment in y=mx + b form.
        return seg.m*x + seg.b;
      };
      let gofX = x => { // The line equation for the upper half of the circle.
        return Math.sqrt(radius*radius - x*x);
      };
      let hofX = x => { // Collision distance equation.
        return fofX(x) - gofX(x);
      };
      let hofXdx = x => { // first derivative.
        return seg.m + x/gofX(x);
      };
      let hofXddx = x => { // second derivative.
        return radius*radius/Math.pow(gofX(x), 3);
      };

      if(seg.m === undefined)
        return Math.min(seg[0][1], seg[1][1]) - gofX(seg[0][0]);
      else {
        let root1 = seg.m*radius/Math.sqrt(1 + seg.m*seg.m);
        let root2 = -root1;

        // Clip roots outside of the segment, on the edge of the
        // circle's movement, or whose slopes aren't valleys.
        // Then get the collision distance to the closest root.
        let minDist = _.chain([root1, root2, p[0], q[0]])
        .filter(root => {
          let isInRadius = (root >= -radius && root <= radius);
          let isInSegment = (root >= p[0] && root <= q[0]);
          let isValley = (hofXddx(root) > 0);

          return isInRadius && isInSegment && isValley;
        })
        .map(root => {
          let result = hofX(root);
          return hofX(root);
        })
        .min() // Infinity if no valid roots.
        .value();

        if(minDist > 0)
          return minDist;
        return undefined;
      }
    })
    .min() // Get the shortest distance among the segments.
    .value();
  }

  /**
   * Tests if a circular token collides with a rectangular token during its
   * last movement.
   * @param  {Graphic} token
   * @param  {Graphic} other
   * @param {waypoint} waypoint
   * @return {number}
   *         The distance along the waypoint at which the collision happens,
   *         or undefined if there is no collision.
   */
  function _testCircleRectCollision(token, other, waypoint) {
    let rect = _tokenToRect(other);
    return _testCirclePolyCollision(token, rect, waypoint);
  }

  /**
   * Tests for a collision between a token and another object using a strategy
   * appropriate for the shapes of the colliding objects.
   * @private
   * @param {Graphic} token
   * @param {(Graphic|Path|PathMath.Polygon)} other
   * @param {Waypoint} waypoint
   */
  function _testCollision(token, other, waypoint) {
    let isSquare = token.get('aura1_square');
    let otherIsPath = (other.get('_type') === 'path');

    let strategy;
    if(isSquare)
      if(other instanceof PathMath.Polygon)
        strategy = _testRectPolyCollision;
      else if(other.get('_type') === 'path')
        strategy = _testRectPathCollision;
      else if(other.get('aura1_square'))
        strategy = _testRectsCollision;
      else
        strategy = _testRectCircleCollision;
    else
      if(other instanceof PathMath.Polygon)
        strategy = _testCirclePolyCollision;
      else if(other.get('_type') === 'path')
        strategy = _testCirclePathCollision;
      else if(other.get('aura1_square'))
        strategy = _testCircleRectCollision;
      else
        strategy = _testCirclesCollision;
    return strategy(token, other, waypoint);
  }

  /**
   * Tests if a token overlaps another token or path, using a strategy
   * appropriate for the shapes of the objects.
   * @private
   * @param {graphic} token
   * @param {(graphic|path)} other
   * @param {int} inset
   * @return {boolean}
   */
  function _testOverlap(token, other, inset) {
    let strategy;
    if(token.get('aura1_square'))
      if(other.get('_type') === 'path')
        strategy = _isOverlappingRectPath;
      else if(other.get('aura1_square'))
        strategy = _isOverlappingRectRect;
      else
        strategy = _isOverlappingCircleRect;
    else
      if(other.get('_type') === 'path')
        strategy = _isOverlappingCirclePath;
      else if(other.get('aura1_square'))
        strategy = _isOverlappingCircleRect;
      else
        strategy = _isOverlappingCircleCircle;
    return strategy(token, other, inset);
  }

  /**
   * Tests for an in-movement collisions between a rectangular token
   * and a circular token.
   * @param  {Graphic} token
   * @param  {Graphic} other
   * @param {waypoint} waypoint
   * @return {number}
   *         The distance along the waypoint at which the collision happens,
   *         or undefined if there is no collision.
   */
  function _testRectCircleCollision(token, other, waypoint) {
    // Reduce the problem to a circle-rect test in the opposite direction.
    let start = waypoint[0];
    start[2] = 1;
    let end = waypoint[1];
    end[2] = 1;

    let tokenPt = _getPt(token);
    tokenPt[2] = 1;
    let otherPt = _getPt(other);
    otherPt[2] = 1;

    let u = VecMath.sub(end, start);
    let uReverse = VecMath.scale(u, -1);

    let poly = _tokenToRect(token);
    let offset = VecMath.sub(start, tokenPt);
    poly = poly.transform(MatrixMath.translate(offset));

    let reverseWaypoint = [otherPt, VecMath.add(otherPt, uReverse)];
    return _testCirclePolyCollision(other, poly, reverseWaypoint);
  }

  /**
   * Tests for an in-movement collision between a rectangular token and a
   * path. The path is treated as a polygon if its fill is not transparent.
   * @param {Graphic} token
   * @param {Path} path
   * @param {waypoint} waypoint
   * @return {number} The minimum collision distance.
   */
  function _testRectPathCollision(token, path, waypoint) {
    let shape;
    if(path.get('fill') === 'transparent')
      shape = new PathMath.Path(path);
    else
      shape = new PathMath.Polygon(path);
    return _testRectPolyCollision(token, shape, waypoint);
  }

  /**
   * Tests for an in-movement collision between two polygons.
   * @private
   * @param {graphic} token
   * @param {(PathMath.Polygon|PathMath.Path)} poly
   * @param {waypoint} waypoint
   * @return {number}
   */
  function _testRectPolyCollision(token, poly, waypoint) {
    let start = waypoint[0];
    start[2] = 1;
    let end = waypoint[1];
    end[2] = 1;

    let u = VecMath.sub(end, start);
    let uLen = VecMath.length(u);
    let uAngle = Math.atan2(u[1], u[0]);

    // Get the rectangle for the token's final position.
    let rect = _tokenToRect(token, 1); // Inset by 1 to avoid edges.
    let rectPt = _getPt(token);
    rectPt[2] = 1;
    let rectOffset = VecMath.sub(start, rectPt);

    // Get the rectangle for the waypoint's start.
    let startRect = rect.transform(MatrixMath.translate(rectOffset));
    let startBox = startRect.getBoundingBox();

    // Get the rectangle for the waypoint's end.
    let endRect = startRect.transform(MatrixMath.translate(u));
    let endBox = endRect.getBoundingBox();

    // Quit early if the polygon's bounding box does not intersect the
    // union of the start and end rects' bounding boxes.
    let moveBox = PathMath.BoundingBox.add(startBox, endBox);
    if(!moveBox.intersects(poly.getBoundingBox()))
      return undefined;

    // Quit early if the polygons intersect.
    if(startRect.intersects(poly))
      return undefined;

    // Transform the system so that the token's start rect is at the origin and
    // u points up.
    let rotation = Math.PI/2 - uAngle;
    let m = MatrixMath.multiply(
      MatrixMath.rotate(rotation),
      MatrixMath.translate(VecMath.sub([0,0,1], start))
    );
    let mPoly = poly.transform(m);
    let mRect = startRect.transform(m);

    // Get the sets of clipped segments to test collisions between.
    let mRectSegs = _testRectPolyCollision_clipRectSegs(mRect, moveBox);
    let mPolySegs = _testRectPolyCollision_clipPolySegs(mPoly, mRect);
    let minDist = _testRectPolyCollision_getMinDist(mPolySegs, mRectSegs);
    if(minDist === Infinity || minDist > uLen)
      return undefined;
    return minDist;
  }

  // Clip the lower segments from the rect.
  function _testRectPolyCollision_clipRectSegs(mRect, moveBox) {
    return _.chain(mRect.toSegments())
    .filter(seg => {
      let u = VecMath.sub(seg[1], seg[0]);
      let testPt = [seg[0][0], moveBox.height*2, 1];
      let v = VecMath.sub(testPt, seg[0]);
      let cross = VecMath.cross(u, v);

      // Keep the segment if the test point is on its "left" side.
      return cross[2] < 0;
    })
    .map(seg => {
      let p = seg[0];
      let q = seg[1];

      // let p be the leftmost point.
      if(p[0] > q[0]) {
        let swap = q;
        q = p;
        p = swap;
      }

      // Get the segment's line equation data.
      let dx = q[0] - p[0];
      let dy = q[1] - p[1];
      let m = dy/dx;
      let b = p[1] - m*p[0];
      let newSeg = [p, q];
      newSeg.m = m;
      newSeg.b = b;
      return newSeg;
    })
    .value();
  }

  // Clip segments from the polygon that are outside the collision space.
  function _testRectPolyCollision_clipPolySegs(mPoly, mRect) {
    let mRectBox = mRect.getBoundingBox();
    let left = mRectBox.left;
    let right = left + mRectBox.width;

    return _.chain(mPoly.toSegments())
    .map(seg => {
      let p = seg[0];
      let q = seg[1];

      // Keep vertical segments that are within the collision space.
      if(p[0] === q[0] && p[0] >= left && p[0] <= right) {
        seg.m = undefined;
        seg.b = undefined;
        return seg;
      }

      // let p be the leftmost point.
      if(p[0] > q[0]) {
        let swap = q;
        q = p;
        p = swap;
      }

      // Clip segments that are entirely outside the collision space.
      if(p[0] < left && q[0] < left)
        return undefined;
      if(p[0] > right && q[0] > right)
        return undefined;
      if(p[1] < 0 && q[1] < 0)
        return undefined;

      // Clip intersections with the left and right borders
      // of the collision space.
      let dx = q[0] - p[0];
      let dy = q[1] - p[1];
      let m = dy/dx;
      let b = p[1] - m*p[0];
      if(p[0] < left)
        p = [left, m*left + b, 1];
      if(q[0] > right)
        q = [right, m*right + b, 1];

      let clippedSeg = [p, q];
      clippedSeg.m = m;
      clippedSeg.b = b;
      return clippedSeg;
    })
    .compact()
    .value();
  }

  // Using the power of linear algebra, find the minimum distance to any of the
  // polygon's segments.
  function _testRectPolyCollision_getMinDist(mPolySegs, mRectSegs) {
    return _.chain(mPolySegs)
    .map(polySeg => {
      return _.chain(mRectSegs)
      .map(rectSeg => {
        let fofX = x => {
          return polySeg.m * x + polySeg.b;
        };
        let gofX = x => {
          return rectSeg.m * x + rectSeg.b;
        };
        let hofX = x => {
          return fofX(x) - gofX(x);
        };
        let left = rectSeg[0][0];
        let right = rectSeg[1][0];

        let p = polySeg[0];
        let q = polySeg[1];

        // Skip if this polySeg is not directly above rectSeg.
        if(p[0] < left && q[0] < left)
          return undefined;
        if(p[0] > right && q[0] > right)
          return undefined;

        // Clip the intersections on the left and right sides of rectSeg.
        if(p[0] < left)
          p = [left, fofX(left), 1];
        if(q[0] > right)
          q = [right, fofX(right), 1];

        // Return the minimum distance among the clipped polySeg's endpoints.
        let dist = Math.min(hofX(p[0]), hofX(q[0]));
        if(dist > 0)
          return dist;
        return undefined;
      })
      .compact()
      .min()
      .value();
    })
    .compact()
    .min()
    .value();
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
    let poly = _tokenToRect(other);
    return _testRectPolyCollision(token, poly, waypoint);
  }

  /**
   * Gets the circle bounding a token.
   * @param  {Graphic} token
   * @param  {number} inset
   * @return {PathMath.Circle}
   */
  function _tokenToCircle(token, inset) {
    inset = inset || 0;
    let x = token.get('left');
    let y = token.get('top');
    let r = token.get('width')/2 - inset;
    return new PathMath.Circle([x, y, 1], r);
  }

  /**
   * Gets the rectangule bounding a token.
   * @private
   * @param  {Graphic} token
   * @param {number} inset
   * @return {PathMath.Polygon}
   */
  function _tokenToRect(token, inset) {
    inset = inset || 0;

    let width = token.get('width') - inset;
    let height = token.get('height') - inset;
    let pt = _getPt(token);
    let angle = token.get('rotation')*Math.PI/180;

    let m = MatrixMath.multiply(
      MatrixMath.translate(pt),
      MatrixMath.rotate(angle)
    );
    return new PathMath.Polygon([
      MatrixMath.multiply(m, [-width/2, -height/2, 1]),
      MatrixMath.multiply(m, [width/2, -height/2, 1]),
      MatrixMath.multiply(m, [width/2, height/2, 1]),
      MatrixMath.multiply(m, [-width/2, height/2, 1])
    ]);
  }


  // The exposed API.
  return class TokenCollisions {

    /**
     * Returns the list of other tokens that some token collided with during
     * its last movement.
     * The tokens are sorted in the order they are collided with.
     * @param {Graphic} token
     * @param {(Graphic|Path|PathMath.Polygon)[]} others
     * @param {CollisionOptions} [options]
     * @return {(Graphic[]|Collisions[])}
     */
    static getCollisions(token, others, options) {
      return _.chain(_getWaypoints(token))
      .map(waypoint => {
        return _getCollisionsInWaypoint(token, others, waypoint, options);
      })
      .flatten()
      .value();
    }

    /**
     * Returns the first token, from some list of tokens, that a token has
     * collided with during its last movement, or undfined if there was
     * no collision.
     * @param {Graphic} token
     * @param {(Graphic|Path|PathMath.Polygon)[]} others
     * @param {CollisionOptions} [options]
     * @return {(Graphic|Collision)}
     */
    static getFirstCollision(token, others, options) {
      return getCollisions(token, others, options)[0];
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
    static isOverlapping(token, other, collideOnEdge) {
      if(token.get('_id') === other.get('_id'))
        return false;

      // Inset by 1 pixel if we don't want to collide on edges.
      let inset = 1;
      if(collideOnEdge)
        inset = 0;

      return _testOverlap(token, other, inset);
    }
  };
})();
