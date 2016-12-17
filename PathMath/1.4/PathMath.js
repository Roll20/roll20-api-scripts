/**
 * PathMath script
 *
 * This is a library that provides mathematical operations involving Paths.
 * It intended to be used by other scripts and has no stand-alone
 * functionality of its own. All the library's operations are exposed by the
 * PathMath object created by this script.
 */
var PathMath = (() => {
    'use strict';

    /**
     * A vector used to define a homogeneous point or a direction.
     * @typedef {number[]} Vector
     */

    /**
     * A line segment defined by two homogeneous 2D points.
     * @typedef {Vector[]} Segment
     */

    /**
     * Information about a path's 2D transform.
     * @typedef {Object} PathTransformInfo
     * @property {number} angle
     *           The path's rotation angle in radians.
     * @property {number} cx
     *           The x coordinate of the center of the path's bounding box.
     * @property {number} cy
     *           The y coordinate of the center of the path's bounding box.
     * @property {number} height
     *           The unscaled height of the path's bounding box.
     * @property {number} scaleX
     *           The path's X-scale.
     * @property {number} scaleY
     *           The path's Y-scale.
     * @property {number} width
     *           The unscaled width of the path's bounding box.
     */

    /**
     * A polygon defined by a path or a list of vertices.
     */
    class Polygon {

      /**
       * @param {(Path|vec3[])} path
       */
      constructor(path) {
        if(_.isArray(path))
          this.vertices = path;
        else
          this.vertices = _.map(toSegments(path), segment => {
            return segment[0];
          });

        this.numVerts = this.vertices.length;
        if(this.numVerts < 3)
          throw new Error('A polygon must have at least 3 vertices.');
      }

      /**
       * Determines whether each vertex along the polygon is convex (1)
       * or concave (-1). A vertex lying on a straight line is assined 0.
       * @return {int[]}
       */
      getConvexness() {
        return Polygon.getConvexness(this.vertices);
      }

      /**
       * Gets the convexness information about each vertex.
       * @param {vec3[]}
       * @return {int[]}
       */
      static getConvexness(vertices) {
        let totalAngle = 0;
        let numVerts = vertices.length;
        let vertexCurves = _.map(vertices, (v, i) => {
          let vPrev = vertices[(i-1 + numVerts) % numVerts];
          let vNext = vertices[(i+1 + numVerts) % numVerts];

          let u = VecMath.sub(v, vPrev);
          let w = VecMath.sub(vNext, v);
          let uHat = VecMath.normalize(u);
          let wHat = VecMath.normalize(w);

          let cross = VecMath.cross(uHat, wHat);
          let sign = cross[2];
          if(sign)
            sign = sign/Math.abs(sign);

          let dot = VecMath.dot(uHat, wHat);
          let angle = Math.acos(dot)*sign;
          totalAngle += angle;

          return sign;
        });

        if(totalAngle < 0)
          return _.map(vertexCurves, curve => {
            return -curve;
          });
        else
          return vertexCurves;
      }

      /**
       * Tessellates a closed path representing a simple polygon
       * into a bunch of triangles.
       * @return {Triangle[]}
       */
      tessellate() {
        let triangles = [];
        let vertices = _.clone(this.vertices);

        // Tessellate using ear-clipping algorithm.
        while(vertices.length > 0) {
          if(vertices.length === 3) {
            triangles.push(new Triangle(vertices[0], vertices[1], vertices[2]));
            vertices = [];
          }
          else {
            // Determine whether each vertex is convex, concave, or linear.
            let convexness = Polygon.getConvexness(vertices);
            let numVerts = vertices.length;

            // Find the next ear to clip from the polygon.
            let earIndex = _.find(_.range(numVerts), i => {
              let v = vertices[i];
              let vPrev = vertices[(numVerts + i -1) % numVerts];
              let vNext = vertices[(numVerts + i + 1) % numVerts];

              let vConvexness = convexness[i];
              if(vConvexness === 0) // The vertex lies on a straight line. Clip it.
                return true;
              else if(vConvexness < 0) // The vertex is concave.
                return false;
              else { // The vertex is convex and might be an ear.
                let triangle = new Triangle(vPrev, v, vNext);

                // The vertex is not an ear if there is at least one other
                // vertex inside its triangle.
                return !_.find(vertices, (v2, j) => {
                  if(v2 === v || v2 === vPrev || v2 === vNext)
                    return false;
                  else {
                    let flag = triangle.containsPt(v2);
                    log('containsPt: ' + flag);
                    return flag;
                  }
                });
              }
            });

            let v = vertices[earIndex];
            let vPrev = vertices[(numVerts + earIndex -1) % numVerts];
            let vNext = vertices[(numVerts + earIndex + 1) % numVerts];
            triangles.push(new Triangle(vPrev, v, vNext));
            vertices.splice(earIndex, 1);
          }
        }
        return triangles;
      }

      /**
       * Produces a list of segments defining this polygon.
       * @return {Segment[]}
       */
      toSegments() {
        return _.map(this.vertices, (v, i) => {
          let vNext = this.vertices[(i + 1) % this.numVerts];
          return [v, vNext];
        });
      }

      toString() {
        return this.vertices.toString();
      }
    }

    /**
     * A 3-sided polygon that is great for tessellation!
     */
    class Triangle extends Polygon {
      /**
       * @param {vec3} p1
       * @param {vec3} p2
       * @param {vec3} p3
       */
      constructor(p1, p2, p3) {
        super([p1, p2, p3]);
        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
      }

      /**
       * Checks if this triangle contains a point.
       * @param {vec3} pt
       * @return {boolean}
       */
      containsPt(pt) {
        // Check the point using barycentric coordinates.
        let u = VecMath.sub(this.p3, this.p1);
        let v = VecMath.sub(this.p2, this.p1);
        let p = VecMath.sub(pt, this.p1);

        let dotUU = VecMath.dot(u, u);
        let dotUV = VecMath.dot(u, v);
        let dotUP = VecMath.dot(u, p);
        let dotVV = VecMath.dot(v, v);
        let dotVP = VecMath.dot(v, p);

        let invDenom = 1/(dotUU*dotVV - dotUV*dotUV);
        let s = (dotVV * dotUP - dotUV * dotVP) * invDenom;
        let t = (dotUU * dotVP - dotUV * dotUP) * invDenom;

        return s >= 0 && t >= 0 && s + t <= 1;
      }

      toString() {
        return 'Triangle(' + this.vertices.toString() + ')';
      }
    }

    /**
     * The bounding box for a path/polygon.
     */
    class BoundingBox {
      /**
       * @param {Number} left
       * @param {Number} top
       * @param {Number} width
       * @param {Number} height
       */
      constructor(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
      }

      /**
       * Adds two bounding boxes.
       * @param  {BoundingBox} a
       * @param  {BoundingBox} b
       * @return {BoundingBox}
       */
      static add(a, b) {
        var left = Math.min(a.left, b.left);
        var top = Math.min(a.top, b.top);
        var right = Math.max(a.left + a.width, b.left + b.width);
        var bottom = Math.max(a.top + a.height, b.top + b.height);

        return new BoundingBox(left, top, right - left, bottom - top);
      }
    }

    /**
     * Returns the partial path data for creating a circular path.
     * @param  {number} radius
     * @param {int} [sides]
     *        If specified, then a polygonal path with the specified number of
     *        sides approximating the circle will be created instead of a true
     *        circle.
     * @return {PathData}
     */
    function createCircleData(radius, sides) {
      var _path = [];
      if(sides) {
        var cx = radius;
        var cy = radius;
        var angleInc = Math.PI*2/sides;
        path.push(['M', cx + radius, cy]);
        _.each(_.range(1, sides+1), function(i) {
          var angle = angleInc*i;
          var x = cx + radius*Math.cos(angle);
          var y = cy + radius*Math.sin(angle);
          path.push(['L', x, y]);
        });
      }
      else {
        var r = radius;
        _path = [
          ['M', 0,      r],
          ['C', 0,      r*0.5,  r*0.5,  0,      r,      0],
          ['C', r*1.5,  0,      r*2,    r*0.5,  r*2.0,  r],
          ['C', r*2.0,  r*1.5,  r*1.5,  r*2.0,  r,      r*2.0],
          ['C', r*0.5,  r*2,    0,      r*1.5,  0,      r]
        ];
      }
      return {
        height: radius*2,
        _path: JSON.stringify(_path),
        width: radius*2
      };
    }


    /**
     * Calculates the bounding box for a list of paths.
     * @param {Path | Path[]} paths
     * @return {BoundingBox}
     */
    function getBoundingBox(paths) {
      if(!_.isArray(paths))
        paths = [paths];

      var result;
      _.each(paths, function(p) {
        var pBox = _getSingleBoundingBox(p);
        if(result)
          result = BoundingBox.add(result, pBox);
        else
          result = pBox;
      });
      return result;
    }

    /**
     * Returns the center of the bounding box countaining a path or list
     * of paths. The center is returned as a 2D homongeneous point
     * (It has a third component which is always 1 which is helpful for
     * affine transformations).
     * @param {(Path|Path[])} paths
     * @return {Vector}
     */
    function getCenter(paths) {
        if(!_.isArray(pathjs))
            paths = [paths];

        var bbox = getBoundingBox(paths);
        var cx = bbox.left + bbox.width/2;
        var cy = bbox.top + bbox.height/2;

        return [cx, cy, 1];
    }

    /**
     * @private
     * Calculates the bounding box for a single path.
     * @param  {Path} path
     * @return {BoundingBox}
     */
    function _getSingleBoundingBox(path) {
        var pathData = normalizePath(path);

        var width = pathData.width;
        var height = pathData.height;
        var left = pathData.left - width/2;
        var top = pathData.top - height/2;

        return new BoundingBox(left, top, width, height);
    }

    /**
     * Gets the 2D transform information about a path.
     * @param  {Path} path
     * @return {PathTransformInfo}
     */
    function getTransformInfo(path) {
        var scaleX = path.get('scaleX');
        var scaleY = path.get('scaleY');
        var angle = path.get('rotation')/180*Math.PI;

        // The transformed center of the path.
        var cx = path.get('left');
        var cy = path.get('top');

        // The untransformed width and height.
        var width = path.get('width');
        var height = path.get('height');

        return {
            angle: angle,
            cx: cx,
            cy: cy,
            height: height,
            scaleX: scaleX,
            scaleY: scaleY,
            width: width
        };
    }

    /**
     * Checks if a path is closed, and is therefore a polygon.
     * @param {(Path|Segment[])}
     * @return {boolean}
     */
    function isClosed(path) {
      // Convert to segments.
      if(!_.isArray(path))
        path = toSegments(path);
      return (_.isEqual(path[0][0], path[path.length-1][1]));
    }


    /**
     * Produces a merged path string from a list of path objects.
     * @param {Path[]} paths
     * @return {String}
     */
    function mergePathStr(paths) {
        var merged = [];
        var bbox = getBoundingBox(paths);

        _.each(paths, function(p) {
            var pbox = getBoundingBox(p);

            // Convert the path to a normalized polygonal path.
            p = normalizePath(p);
            var parsed = JSON.parse(p._path);
            _.each(parsed, function(pathTuple, index) {
                var dx = pbox.left - bbox.left;
                var dy = pbox.top - bbox.top;

                // Move and Line tuples
                var x = pathTuple[1] + dx;
                var y = pathTuple[2] + dy;
                merged.push([pathTuple[0], x, y]);
            });
        });

        return JSON.stringify(merged);
    }

    /**
     * Reproduces the data for a polygonal path such that the scales are 1 and
     * its rotate is 0.
     * This can also normalize freehand paths, but they will be converted to
     * polygonal paths. The quatric Bezier curves used in freehand paths are
     * so short though, that it doesn't make much difference though.
     * @param {Path}
     * @return {PathData}
     */
    function normalizePath(path) {
        var segments = toSegments(path);
        return segmentsToPath(segments);
    }

    /**
     * Computes the intersection between two homogenous 2D line segments,
     * if it exists.
     *
     * Explanation of the fancy mathemagics:
     * Let A be the first point in seg1 and B be the second point in seg1.
     * Let C be the first point in seg2 and D be the second point in seg2.
     * Let U be the vector from A to B.
     * Let V be the vector from C to D.
     * Let UHat be the unit vector of U.
     * Let VHat be the unit vector of V.
     *
     * Observe that if the dot product of UHat and VHat is 1 or -1, then
     * seg1 and seg2 are parallel, so they will either never intersect or they
     * will overlap. We will ignore the case where seg1 and seg2 are parallel.
     *
     * We can represent any point P along the line projected by seg1 as
     * P = A + SU, where S is some scalar value such that S = 0 yeilds A,
     * S = 1 yields B, and P is on seg1 if and only if 0 <= S <= 1.
     *
     * We can also represent any point Q along the line projected by seg2 as
     * Q = C + TV, where T is some scalar value such that T = 0 yeilds C,
     * T = 1 yields D, and Q is on seg2 if and only if 0 <= T <= 1.
     *
     * Assume that seg1 and seg2 are not parallel and that their
     * projected lines intersect at some point P.
     * Therefore, we have A + SU = C + TV.
     *
     * We can rearrange this such that we have C - A = SU - TV.
     * Let vector W = C - A, thus W = SU - TV.
     * Also, let coeffs = [S, T, 1].
     *
     * We can now represent this system of equations as the matrix
     * multiplication problem W = M * coeffs, where in column-major
     * form, M = [U, -V, [0,0,1]].
     *
     * By matrix-multiplying both sides by M^-1, we get
     * M^-1 * W = M^-1 * M * coeffs = coeffs, from which we can extract the
     * values for S and T.
     *
     * We can now get the point of intersection on the projected lines of seg1
     * and seg2 by substituting S in P = A + SU or T in Q = C + TV.
     * Seg1 and seg2 also intersect at that point if and only if 0 <= S, T <= 1.
     *
     * @param {Segment} seg1
     * @param {Segment} seg2
     * @return {Intersection}
     *      The point of intersection in homogenous 2D coordiantes and its
     *      parametric coefficients along seg1 and seg2,
     *      or undefined if the segments are parallel.
     */
    function segmentIntersection(seg1, seg2) {
        var u = VecMath.sub(seg1[1], seg1[0]);
        var v = VecMath.sub(seg2[1], seg2[0]);
        var w = VecMath.sub(seg2[0], seg1[0]);

        // Can't use 0-length vectors.
        if(VecMath.length(u) === 0 || VecMath.length(v) === 0)
            return undefined;

        // If the two segments are parallel, then either they never intersect
        // or they overlap. Either way, return undefined in this case.
        var uHat = VecMath.normalize(u);
        var vHat = VecMath.normalize(v);
        var uvDot = VecMath.dot(uHat,vHat);
        if(Math.abs(uvDot) > 0.9999)
            return undefined;

        // Build the inverse matrix for getting the intersection point's
        // parametric coefficients along the projected segments.
        var m = [[u[0], u[1], 0], [-v[0], -v[1], 0], [0, 0, 1]];
        var mInv = MatrixMath.inverse(m);

        // Get the parametric coefficients for getting the point of intersection
        // on the projected semgents.
        var coeffs = MatrixMath.multiply(mInv, w);
        var s = coeffs[0];
        var t = coeffs[1];

        // Return the intersection only if it lies on both the segments.
        if(s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            var uPrime = VecMath.scale(u, s);
            return [VecMath.add(seg1[0], uPrime), s, t];
        }
        else
            return undefined;
    }


    /**
     * Produces the data for creating a path from a list of segments forming a
     * continuous path.
     * @param {Segment[]}
     * @return {PathData}
     */
    function segmentsToPath(segments) {
        var left = segments[0][0][0];
        var right = segments[0][0][0];
        var top = segments[0][0][1];
        var bottom = segments[0][0][1];

        // Get the bounds of the segment.
        var pts = [];
        var isFirst = true;
        _.each(segments, function(segment) {
            var p1 = segment[0];
            if(isFirst) {
                isFirst = false;
                pts.push(p1);
            }

            var p2 = segment[1];

            left = Math.min(left, p1[0], p2[0]);
            right = Math.max(right, p1[0], p2[0]);
            top = Math.min(top, p1[1], p2[1]);
            bottom = Math.max(bottom, p1[1], p2[1]);

            pts.push(p2);
        });

        // Get the path's left and top coordinates.
        var width = right-left;
        var height = bottom-top;
        var cx = left + width/2;
        var cy = top + height/2;

        // Convert the points to a _path.
        var _path = [];
        var firstPt = true;
        _.each(pts, function(pt) {
            var type = 'L';
            if(firstPt) {
                type = 'M';
                firstPt = false;
            }
            _path.push([type, pt[0]-left, pt[1]-top]);
        });

        return {
            _path: JSON.stringify(_path),
            left: cx,
            top: cy,
            width: width,
            height: height
        };
    }

    /**
     * Tessellates a closed path representing a simple polygon
     * into a bunch of triangles.
     * @param {Path} path
     */
    function tessellate(path) {
      let segments = toSegments(path);
      if(isClosed(segments)) {
        let triangles = [];
        let vertices = _.map(segments, s => {
          return s[0];
        });

        // Tessellate using ear-clipping algorithm.
        while(vertices.length > 0) {
          if(vertices.length === 3) {
            triangles.push(new Triangle(vertices[0], vertices[1], vertices[2]));
            vertices = [];
          }
          else {
            // Determine whether each vertex is convex, concave, or linear.
            let convexness = _getConvexnessVertices(vertices);
            let numVerts = vertices.length;

            // Find the next ear to clip from the polygon.
            let earIndex = _.find(_.range(numVerts), i => {
              let v = vertices[i];
              let vPrev = vertices[(numVerts + i -1) % numVerts];
              let vNext = vertices[(numVerts + i + 1) % numVerts];

              let vConvexness = convexness[i];
              if(vConvexness === 0) // The vertex lies on a straight line. Clip it.
                return true;
              else if(vConvexness < 0) // The vertex is concave.
                return false;
              else { // The vertex is convex and might be an ear.
                let triangle = new Triangle(vPrev, v, vNext);

                // The vertex is not an ear if there is at least one other
                // vertex inside its triangle.
                return !_.find(vertices, (v2, j) => {
                  if(v2 === v || v2 === vPrev || v2 === vNext)
                    return false;
                  else
                    return triangle.containsPt(v2);
                });
              }
            });

            let v = vertices[earIndex];
            let vPrev = vertices[(numVerts + earIndex -1) % numVerts];
            let vNext = vertices[(numVerts + earIndex + 1) % numVerts];
            triangles.push(new Triangle(vPrev, v, vNext));
            vertices.splice(earIndex, 1);
          }
        }

        return triangles;
      }
      else
        return [];
    }

    /**
     * Converts a path into a list of line segments.
     * This supports freehand paths, but not elliptical paths.
     * @param {(Path|Path[])} path
     * @return {Segment[]}
     */
    function toSegments(path) {
        if(_.isArray(path))
            return _toSegmentsMany(path);

        var _path = JSON.parse(path.get('_path'));
        var transformInfo = getTransformInfo(path);

        var segments = [];
        var prevPt;

        _.each(_path, function(tuple) {
            var type = tuple[0];

            // In freehand paths, approximate the quadratic curve by just
            // using the endpoint of the curve. The curves are so short that
            // they may as well be tiny segments anyways.
            if(type === 'Q') {
              tuple[1] = tuple[3];
              tuple[2] = tuple[4];
              type = 'L';
            }

            // Transform the point to 2D homogeneous map coordinates.
            let pt = tupleToPoint(tuple, transformInfo);

            // If we have an 'L' type point, then add the segment.
            // Either way, keep track of the point we've moved to.
            if(type === 'L' && !(prevPt[0] == pt[0] && prevPt[1] == pt[1]))
                segments.push([prevPt, pt]);

            prevPt = pt;
        });

        return segments;
    }

    /**
     * Converts several paths into a single list of segments.
     * @private
     * @param  {Path[]} paths
     * @return {Segment[]}
     */
    function _toSegmentsMany(paths) {
        return _.chain(paths)
          .reduce(function(allSegments, path) {
              return allSegments.concat(toSegments(path));
          }, [])
          .value();
    }

    /**
     * Transforms a tuple for a point in a path into a point in
     * homogeneous 2D map coordinates.
     * @param  {PathTuple} tuple
     * @param  {PathTransformInfo} transformInfo
     * @return {Vector}
     */
    function tupleToPoint(tuple, transformInfo) {
        var width = transformInfo.width;
        var height = transformInfo.height;
        var scaleX = transformInfo.scaleX;
        var scaleY = transformInfo.scaleY;
        var angle = transformInfo.angle;
        var cx = transformInfo.cx;
        var cy = transformInfo.cy;

        // The point in path coordinates, relative to the path center.
        var x = tuple[1] - width/2;
        var y = tuple[2] - height/2;
        var pt = [x,y,1];

        // The transform of the point from path coordinates to map
        // coordinates.
        var scale = MatrixMath.scale([scaleX, scaleY]);
        var rotate = MatrixMath.rotate(angle);
        var transform = MatrixMath.translate([cx, cy]);
        transform = MatrixMath.multiply(transform, rotate);
        transform = MatrixMath.multiply(transform, scale);

        return MatrixMath.multiply(transform, pt);
    }

    on('chat:message', function(msg) {
        if(msg.type === 'api' && msg.content.indexOf('!pathInfo')  === 0) {
            log('!pathInfo');

            try {
                var path = findObjs({
                    _type: 'path',
                    _id: msg.selected[0]._id
                })[0];
                log(path);
                log(path.get('_path'));

                var segments = toSegments(path);
                log('Segments: ');
                log(segments);

                var pathData = segmentsToPath(segments);
                log('New path data: ');
                log(pathData);

                var curPage = path.get('_pageid');
                _.extend(pathData, {
                    stroke: '#ff0000',
                    _pageid: curPage,
                    layer: path.get('layer')
                });

                var newPath = createObj('path', pathData);
                log(newPath);
            }
            catch(err) {
                log('!pathInfo ERROR: ');
                log(err.message);
            }

        }
    });

    return {
        BoundingBox,
        Polygon,
        Triangle,

        createCircleData,
        getBoundingBox,
        getCenter,
        getTransformInfo,
        mergePathStr,
        normalizePath,
        segmentIntersection,
        segmentsToPath,
        toSegments,
        tupleToPoint
    };
})();
