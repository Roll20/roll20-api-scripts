/* globals VecMath MatrixMath */
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.PathMath={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PathMath.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-4);}}
API_Meta.PathMath.version = '1.7';


/**
 * PathMath script
 *
 * This is a library that provides mathematical operations involving Paths.
 * It intended to be used by other scripts and has no stand-alone
 * functionality of its own. All the library's operations are exposed by the
 * PathMath object created by this script.
 */
const PathMath = (() => {

    /** The size of a single square on a page, in pixels. */
    const UNIT_SIZE_PX = 70;

    let isJumpgate = ()=>{
      if(['jumpgate'].includes(Campaign().get('_release'))) {
        isJumpgate = () => true;
      } else {
        isJumpgate = () => false;
      }
      return isJumpgate();
    };

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
     * Rendering information for shapes.
     * @typedef {Object} RenderInfo
     * @property {string} [controlledby]
     * @property {string} [fill]
     * @property {string} [stroke]
     * @property {string} [strokeWidth]
     */

    /**
     * Some shape defined by a path.
     * @abstract
     */
    class PathShape {
      constructor(vertices) {
        this.vertices = vertices || [];
      }

      /**
       * Gets the distance from this shape to some point.
       * @abstract
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(/* pt */) {
        throw new Error('Must be defined by subclass.');
      }

      /**
       * Gets the bounding box of this shape.
       * @return {BoundingBox}
       */
      getBoundingBox() {
        if(!this._bbox) {
          let left, right, top, bottom;
          _.each(this.vertices, (v, i) => {
            if(i === 0) {
              left = v[0];
              right = v[0];
              top = v[1];
              bottom = v[1];
            }
            else {
              left = Math.min(left, v[0]);
              right = Math.max(right, v[0]);
              top = Math.min(top, v[1]);
              bottom = Math.max(bottom, v[1]);
            }
          });
          let width = right - left;
          let height = bottom - top;
          this._bbox = new BoundingBox(left, top, width, height);
        }
        return this._bbox;
      }

      /**
       * Checks if this shape intersects another shape.
       * @abstract
       * @param {PathShape} other
       * @return {boolean}
       */
      intersects(/* other */) {
        throw new Error('Must be defined by subclass.');
      }

      /**
       * Renders this path.
       * @param {string} pageId
       * @param {string} layer
       * @param {RenderInfo} renderInfo
       * @return {Roll20.Path}
       */
      render(pageId, layer, renderInfo) {
        let segments = this.toSegments();
        let pathData = segmentsToPath(segments);
        _.extend(pathData, renderInfo, {
          _pageid: pageId,
          layer
        });
        return createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
      }

      /**
       * Returns the segments that make up this shape.
       * @abstract
       * @return {Segment[]}
       */
      toSegments() {
        throw new Error('Must be defined by subclass.');
      }

      /**
       * Produces a copy of this shape, transformed by an affine
       * transformation matrix.
       * @param {MatrixMath.Matrix} matrix
       * @return {PathShape}
       */
      transform(matrix) {
        let vertices = _.map(this.vertices, v => {
          return MatrixMath.multiply(matrix, v);
        });
        let Clazz = this.constructor;
        return new Clazz(vertices);
      }
    }

    /**
     * An open shape defined by a path or list of vertices.
     */
    class Path extends PathShape {

      /**
       * @param {(Roll20Path|vec3[])} path
       */
      constructor(path) {
        super();
        if(_.isArray(path))
          this.vertices = path;
        else {
          this._segments = toSegments(path);
          _.each(this._segments, (seg, i) => {
            if(i === 0)
              this.vertices.push(seg[0]);
            this.vertices.push(seg[1]);
          });
        }

        this.numVerts = this.vertices.length;
      }

      /**
       * Gets the distance from this path to some point.
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(pt) {
        let dist = _.chain(this.toSegments())
        .map(seg => {
          let [ p, q ] = seg;
          return VecMath.ptSegDist(pt, p, q);
        })
        .min()
        .value();
        return dist;
      }

      /**
       * Checks if this path intersects with another path.
       * @param {Polygon} other
       * @return {boolean}
       */
      intersects(other) {
        let thisBox = this.getBoundingBox();
        let otherBox = other.getBoundingBox();

        // If the bounding boxes don't intersect, then the paths won't
        // intersect.
        if(!thisBox.intersects(otherBox))
          return false;

        // Naive approach: Since our shortcuts didn't return, check each
        // path's segments for intersections with each of the other
        // path's segments. This takes O(n^2) time.
        return !!_.find(this.toSegments(), seg1 => {
          return !!_.find(other.toSegments(), seg2 => {
            return !!segmentIntersection(seg1, seg2);
          });
        });
      }

      /**
       * Produces a list of segments defining this path.
       * @return {Segment[]}
       */
      toSegments() {
        if(!this._segments) {
          if (this.numVerts <= 1)
            return [];

          this._segments = _.map(_.range(this.numVerts - 1), i => {
            let v = this.vertices[i];
            let vNext = this.vertices[i + 1];
            return [v, vNext];
          });
        }
        return this._segments;
      }
    }

    /**
     * A closed shape defined by a path or a list of vertices.
     */
    class Polygon extends PathShape {

      /**
       * @param {(Roll20Path|vec3[])} path
       */
      constructor(path) {
        super();
        if(_.isArray(path))
          this.vertices = path;
        else {
          this._segments = toSegments(path);
          this.vertices = _.map(this._segments, seg => {
            return seg[0];
          });
        }

        this.numVerts = this.vertices.length;
        if(this.numVerts < 3)
          throw new Error('A polygon must have at least 3 vertices.');
      }

      /**
       * Determines whether a point lies inside the polygon using the
       * winding algorithm.
       * See: http://geomalgorithms.com/a03-_inclusion.html
       * @param {vec3} p
       * @return {boolean}
       */
      containsPt(p) {
        // A helper function that tests if a point is "left" of a line segment.
        let _isLeft = (p0, p1, p2) => {
          return (p1[0] - p0[0])*(p2[1] - p0[1]) - (p2[0]-p0[0])*(p1[1]-p0[1]);
        };

        let total = 0;
        _.each(this.vertices, (v1, i) => {
          let v2 = this.vertices[(i+1) % this.numVerts];

          // Check for valid up intersect.
          if(v1[1] <= p[1] && v2[1] > p[1]) {
            if(_isLeft(v1, v2, p) > 0)
              total++;
          }

          // Check for valid down intersect.
          else if(v1[1] > p[1] && v2[1] <= p[1]) {
            if(_isLeft(v1, v2, p) < 0)
              total--;
          }
        });
        return !!total; // We are inside if our total windings are non-zero.
      }

      /**
       * Gets the distance from this polygon to some point.
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(pt) {
        if(this.containsPt(pt))
          return 0;
        else
          return _.chain(this.toSegments())
          .map(seg => {
            let [ p, q ] = seg;
            return VecMath.ptSegDist(pt, p, q);
          })
          .min()
          .value();
      }

      /**
       * Gets the area of this polygon.
       * @return {number}
       */
      getArea() {
        let triangles = this.tessellate();
        return _.reduce(triangles, (area, tri) => {
          return area + tri.getArea();
        }, 0);
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
       * Checks if this polygon intersects with another polygon.
       * @param {(Polygon|Path)} other
       * @return {boolean}
       */
      intersects(other) {
        let thisBox = this.getBoundingBox();
        let otherBox = other.getBoundingBox();

        // If the bounding boxes don't intersect, then the polygons won't
        // intersect.
        if(!thisBox.intersects(otherBox))
          return false;

        // If either polygon contains the first point of the other, then
        // they intersect.
        if(this.containsPt(other.vertices[0]) ||
          (other instanceof Polygon && other.containsPt(this.vertices[0])))
          return true;

        // Naive approach: Since our shortcuts didn't return, check each
        // polygon's segments for intersections with each of the other
        // polygon's segments. This takes O(n^2) time.
        return !!_.find(this.toSegments(), seg1 => {
          return !!_.find(other.toSegments(), seg2 => {
            return !!segmentIntersection(seg1, seg2);
          });
        });
      }

      /**
       * Checks if this polygon intersects a Path.
       * @param {Path} path
       * @return {boolean}
       */
      intersectsPath(path) {
        let segments1 = this.toSegments();
        let segments2 = PathMath.toSegments(path);

        // The path intersects if any point is inside this polygon.
        if(this.containsPt(segments2[0][0]))
          return true;

        // Check if any of the segments intersect.
        return !!_.find(segments1, seg1 => {
          return _.find(segments2, seg2 => {
            return PathMath.segmentIntersection(seg1, seg2);
          });
        });
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
                return !_.find(vertices, (v2) => {
                  if(v2 === v || v2 === vPrev || v2 === vNext)
                    return false;
                  else {
                    return triangle.containsPt(v2);
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
        if(!this._segments) {
          this._segments = _.map(this.vertices, (v, i) => {
            let vNext = this.vertices[(i + 1) % this.numVerts];
            return [v, vNext];
          });
        }
        return this._segments;
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
        if(_.isArray(p1))
          [p1, p2, p3] = p1;
        super([p1, p2, p3]);

        this.p1 = p1;
        this.p2 = p2;
        this.p3 = p3;
      }

      /**
       * @inheritdoc
       */
      getArea() {
        let base = VecMath.sub(this.p2, this.p1);
        let width = VecMath.length(base);
        let height = VecMath.ptLineDist(this.p3, this.p1, this.p2);

        return width*height/2;
      }
    }

    /**
     * A circle defined by its center point and radius.
     */
    class Circle extends PathShape {

      /**
       * @param {vec3} pt
       * @param {number} r
       */
      constructor(pt, r) {
        super();
        this.center = pt;
        this.radius = r;
        this.diameter = 2*r;
      }

      /**
       * Checks if a point is contained within this circle.
       * @param {vec3} pt
       * @return {boolean}
       */
      containsPt(pt) {
        let dist = VecMath.dist(this.center, pt);
        return dist <= this.radius;
      }

      /**
       * Gets the distance from this circle to some point.
       * @param {vec3} pt
       * @return {number}
       */
      distanceToPoint(pt) {
        if(this.containsPt(pt))
          return 0;
        else {
          return VecMath.dist(this.center, pt) - this.radius;
        }
      }

      /**
       * Gets this circle's area.
       * @return {number}
       */
      getArea() {
        return Math.PI*this.radius*this.radius;
      }

      /**
       * Gets the circle's bounding box.
       * @return {BoundingBox}
       */
      getBoundingBox() {
        let left = this.center[0] - this.radius;
        let top = this.center[1] - this.radius;
        let dia = this.radius*2;
        return new BoundingBox(left, top, dia, dia);
      }

      /**
       * Gets this circle's circumference.
       * @return {number}
       */
      getCircumference() {
        return Math.PI*this.diameter;
      }

      /**
       * Checks if this circle intersects another circle.
       * @param {Circle} other
       * @return {boolean}
       */
      intersects(other) {
        let dist = VecMath.dist(this.center, other.center);
        return dist <= this.radius + other.radius;
      }

      /**
       * Checks if this circle intersects a polygon.
       * @param {Polygon} poly
       * @return {boolean}
       */
      intersectsPolygon(poly) {

        // Quit early if the bounding boxes don't overlap.
        let thisBox = this.getBoundingBox();
        let polyBox = poly.getBoundingBox();
        if(!thisBox.intersects(polyBox))
          return false;

        if(poly.containsPt(this.center))
          return true;
        return !!_.find(poly.toSegments(), seg => {
          return this.segmentIntersection(seg);
        });
      }

      /**
       * Renders this circle.
       * @param {string} pageId
       * @param {string} layer
       * @param {RenderInfo} renderInfo
       */
      render(pageId, layer, renderInfo) {
        let data;
        if(isJumpgate()){
          data = {
            shape: 'eli',
            x: this.center[0],
            y: this.center[1],
            points: `[[0,0],[${this.diameter*(renderInfo.scaleX??1)},${this.diameter*(renderInfo.scaleY??1)}]]`
          };
        } else {
          data = createCircleData(this.radius);
          data.left = this.center[0];
          data.top = this.center[1];
        }
        _.extend(data, renderInfo, {
          _pageid: pageId,
          layer,
          left: this.center[0],
          top: this.center[1]
        });
        return createObj(isJumpgate() ? 'pathv2' : 'path', data);
      }

      /**
       * Gets the intersection coefficient between this circle and a Segment,
       * if such an intersection exists. Otherwise, undefined is returned.
       * @param {Segment} segment
       * @return {Intersection}
       */
      segmentIntersection(segment) {
        if(this.containsPt(segment[0])) {
          let pt = segment[0];
          let s = 0;
          let t = VecMath.dist(this.center, segment[0])/this.radius;
          return [pt, s, t];
        }
        else {
          let u = VecMath.sub(segment[1], segment[0]);
          let uHat = VecMath.normalize(u);
          let uLen = VecMath.length(u);
          let v = VecMath.sub(this.center, segment[0]);

          let height = VecMath.ptLineDist(this.center, segment[0], segment[1]);
          let base = Math.sqrt(this.radius*this.radius - height*height);

          if(isNaN(base))
            return undefined;

          let scalar = VecMath.scalarProjection(u, v)-base;
          let s = scalar/uLen;

          if(s >= 0 && s <= 1) {
            let t = 1;
            let pt = VecMath.add(segment[0], VecMath.scale(uHat, scalar));
            return [pt, s, t];
          }
          else
            return undefined;
        }
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
        this.right = left + width;
        this.bottom = top + height;
      }

      /**
       * Adds two bounding boxes.
       * @param  {BoundingBox} a
       * @param  {BoundingBox} b
       * @return {BoundingBox}
       */
      static add(a, b) {
        let left = Math.min(a.left, b.left);
        let top = Math.min(a.top, b.top);
        let right = Math.max(a.left + a.width, b.left + b.width);
        let bottom = Math.max(a.top + a.height, b.top + b.height);

        return new BoundingBox(left, top, right - left, bottom - top);
      }

      /**
       * Gets the area of this bounding box.
       * @return {number}
       */
      getArea() {
        return this.width * this.height;
      }

      /**
       * Checks if this bounding box intersects another bounding box.
       * @param {BoundingBox} other
       * @return {boolean}
       */
      intersects(other) {
        return !( this.left > other.right ||
                  this.right < other.left ||
                  this.top > other.bottom ||
                  this.bottom < other.top);
      }

      /**
       * Renders the bounding box.
       * @param {string} pageId
       * @param {string} layer
       * @param {RenderInfo} renderInfo
       */
      render(pageId, layer, renderInfo) {
        let verts = [
          [this.left, this.top, 1],
          [this.right, this.top, 1],
          [this.right, this.bottom, 1],
          [this.left, this.bottom, 1]
        ];
        let poly = new Polygon(verts);
        poly.render(pageId, layer, renderInfo);
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
      let _path = [];
      if(sides) {
        let cx = radius;
        let cy = radius;
        let angleInc = Math.PI*2/sides;
        _path.push(['M', cx + radius, cy]);
        _.each(_.range(1, sides+1), function(i) {
          let angle = angleInc*i;
          let x = cx + radius*Math.cos(angle);
          let y = cy + radius*Math.sin(angle);
          _path.push(['L', x, y]);
        });
      }
      else {
        let r = radius;
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
     * Computes the distance from a point to some path.
     * @param {vec3} pt
     * @param {(Roll20Path|PathShape)} path
     */
    function distanceToPoint(pt, path) {
      if(!(path instanceof PathShape))
        path = new Path(path);
      return path.distanceToPoint(pt);
    }

    /**
     * Gets a point along some Bezier curve of arbitrary degree.
     * @param {vec3[]} points
     *        The points of the Bezier curve. The points between the first and
     *        last point are the control points.
     * @param {number} scalar
     *        The parametric value for the point we want along the curve.
     *        This value is expected to be in the range [0, 1].
     * @return {vec3}
     */
    function getBezierPoint(points, scalar) {
      if(points.length < 2)
        throw new Error('Bezier curve cannot have less than 2 points.');
      else if(points.length === 2) {
        let u = VecMath.sub(points[1], points[0]);
        u = VecMath.scale(u, scalar);
        return VecMath.add(points[0], u);
      }
      else {
        let newPts = _.chain(points)
        .map((cur, i) => {
          if(i === 0)
            return undefined;

          let prev = points[i-1];
          return getBezierPoint([prev, cur], scalar);
        })
        .compact()
        .value();

        return getBezierPoint(newPts, scalar);
      }
    }


    /**
     * Calculates the bounding box for a list of paths.
     * @param {Roll20Path | Roll20Path[]} paths
     * @return {BoundingBox}
     */
    function getBoundingBox(paths) {
      if(!_.isArray(paths))
        paths = [paths];

      let result;
      _.each(paths, function(p) {
        let pBox = _getSingleBoundingBox(p);
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
     * @param {(Roll20Path|Roll20Path[])} paths
     * @return {Vector}
     */
    function getCenter(paths) {
        if(!_.isArray(paths))
            paths = [paths];

        let bbox = getBoundingBox(paths);
        let cx = bbox.left + bbox.width/2;
        let cy = bbox.top + bbox.height/2;

        return [cx, cy, 1];
    }

    /**
     * @private
     * Calculates the bounding box for a single path.
     * @param  {Roll20Path} path
     * @return {BoundingBox}
     */
    function _getSingleBoundingBox(path) {
        let pathData = normalizePath(path);

        let width = pathData.width;
        let height = pathData.height;
        let left = pathData.left - width/2;
        let top = pathData.top - height/2;

        return new BoundingBox(left, top, width, height);
    }

    function _pathV2Bounds(path) {
      let p = JSON.parse(path.get('points'))??[];
      let {Mx,mx,My,my} = p.reduce((m,[x,y])=>({
        Mx:Math.max(m.Mx,x),
        mx:Math.min(m.mx,x),
        My:Math.max(m.My,y),
        my:Math.min(m.my,y)
      }),{Mx:-Infinity,mx:Infinity,My:-Infinity,my:Infinity});

      return [Mx-mx,My-my];
    }

    /**
     * Gets the 2D transform information about a path.
     * @param  {Roll20Path} path
     * @return {PathTransformInfo}
     */
    function getTransformInfo(path) {
      let angle = path.get('rotation')/180*Math.PI;


      if('path' === path.get('type')){
          let scaleX = path.get('scaleX');
          let scaleY = path.get('scaleY');

          // The untransformed width and height.
          let width = path.get('width');
          let height = path.get('height');
          // The transformed center of the path.
          let cx = path.get('left');
          let cy = path.get('top');

          return {
              angle: angle,
              cx: cx,
              cy: cy,
              height: height,
              scaleX: scaleX,
              scaleY: scaleY,
              width: width
          };
      } else {
        // pathv2
        let [width,height] = _pathV2Bounds(path);

        return {
          angle: angle,
          cx: path.get('x'),
          cy: path.get('y'),
          scaleX: 1,
          scaleY: 1,
          height: height, 
          width: width
        };
      }
    }

    /**
     * Checks if a path is closed, and is therefore a polygon.
     * @param {(Roll20Path|Segment[])}
     * @return {boolean}
     */
    function isClosed(path) { // eslint-disable-line no-unused-vars
      // Convert to segments.
      if(!_.isArray(path))
        path = toSegments(path);
      return (_.isEqual(path[0][0], path[path.length-1][1]));
    }


    /**
     * Produces a merged path string from a list of path objects.
     * @param {Roll20Path[]} paths
     * @return {String}
     */
    function mergePathStr(paths) {
        let merged = [];
        let bbox = getBoundingBox(paths);

        _.each(paths, function(p) {
            let pbox = getBoundingBox(p);

            // Convert the path to a normalized polygonal path.
            p = normalizePath(p);
            let parsed = JSON.parse(p._path);
            _.each(parsed, function(pathTuple) {
                let dx = pbox.left - bbox.left;
                let dy = pbox.top - bbox.top;

                // Move and Line tuples
                let x = pathTuple[1] + dx;
                let y = pathTuple[2] + dy;
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
     * @param {Roll20Path}
     * @return {PathData}
     */
    function normalizePath(path) {
        let segments = toSegments(path);
        return segmentsToPath(segments);
    }

    /**
     * Produces a UDL window from a Path.
     * This UDL window path will be created on the walls layer
     * and will have a type of transparent.
     * 
     * @param {Roll20Path} path
     * @return {Roll20Path} The Path object for the new UDL window.
     */
    function pathToUDLWindow(path) {
      let pathData = normalizePath(path);

      let curPage = path.get('_pageid');
      _.extend(pathData, {
        stroke: '#ff0000',
        barrierType: "transparent",
        _pageid: curPage,
        layer: 'walls'
      });

      return createObj(isJumpgate() ? 'pathv2' : 'path', pathData);
    }

    /**
     * Computes the intersection between the projected lines of
     * two homogenous 2D line segments.
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
     *
     * @param {Segment} seg1
     * @param {Segment} seg2
     * @return {Intersection}
     *      The point of intersection in homogenous 2D coordiantes and its
     *      scalar coefficients along seg1 and seg2,
     *      or undefined if the segments are parallel.
     */
    function raycast(seg1, seg2) {
      let u = VecMath.sub(seg1[1], seg1[0]);
      let v = VecMath.sub(seg2[1], seg2[0]);
      let w = VecMath.sub(seg2[0], seg1[0]);

      // Can't use 0-length vectors.
      if(VecMath.length(u) === 0 || VecMath.length(v) === 0)
          return undefined;

      // If the two segments are parallel, then either they never intersect
      // or they overlap. Either way, return undefined in this case.
      let uHat = VecMath.normalize(u);
      let vHat = VecMath.normalize(v);
      let uvDot = VecMath.dot(uHat,vHat);
      if(Math.abs(uvDot) > 0.9999)
          return undefined;

      // Build the inverse matrix for getting the intersection point's
      // parametric coefficients along the projected segments.
      let m = [[u[0], u[1], 0], [-v[0], -v[1], 0], [0, 0, 1]];
      let mInv = MatrixMath.inverse(m);

      // Get the parametric coefficients for getting the point of intersection
      // on the projected semgents.
      let coeffs = MatrixMath.multiply(mInv, w);
      let s = coeffs[0];
      let t = coeffs[1];

      let uPrime = VecMath.scale(u, s);
      return [VecMath.add(seg1[0], uPrime), s, t];
    }

    /**
     * Computes the intersection between two homogenous 2D line segments,
     * if it exists. To figure out the intersection, a raycast is performed
     * between the two segments.
     * Seg1 and seg2 also intersect at that point if and only if 0 <= S, T <= 1.
     * @param {Segment} seg1
     * @param {Segment} seg2
     * @return {Intersection}
     *      The point of intersection in homogenous 2D coordiantes and its
     *      parametric coefficients along seg1 and seg2,
     *      or undefined if the segments don't intersect.
     */
    function segmentIntersection(seg1, seg2) {
      let intersection = raycast(seg1, seg2);
      if(!intersection)
        return undefined;

      // Return the intersection only if it lies on both the segments.
      let s = intersection[1];
      let t = intersection[2];
      if(s >= 0 && s <= 1 && t >= 0 && t <= 1)
        return intersection;
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
        let left = segments[0][0][0];
        let right = segments[0][0][0];
        let top = segments[0][0][1];
        let bottom = segments[0][0][1];

        // Get the bounds of the segment.
        let pts = [];
        let isFirst = true;
        _.each(segments, function(segment) {
            let p1 = [segment[0][0],segment[0][1]];
            if(isFirst) {
                isFirst = false;
                pts.push(p1);
            }

            let p2 = [segment[1][0],segment[1][1]];

            left = Math.min(left, p1[0], p2[0]);
            right = Math.max(right, p1[0], p2[0]);
            top = Math.min(top, p1[1], p2[1]);
            bottom = Math.max(bottom, p1[1], p2[1]);

            pts.push(p2);
        });

        // Get the path's left and top coordinates.
        let width = right-left;
        let height = bottom-top;
        let cx = left + width/2;
        let cy = top + height/2;

      if(isJumpgate()){
        return {
          shape: 'pol',
          x: cx,
          y: cy,
          points: JSON.stringify(pts)
        };
      } else {
        // Convert the points to a _path.
        let _path = [];
        let firstPt = true;
        _.each(pts, function(pt) {
            let type = 'L';
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
    }

    function _circlePointsFromCorners(p1,p2) {
      const SPACING=20;

      // reorder points to get top left to bottom right.
      if(p1[0]>p2[0]){
        let x = p1[0];
        p1[0]=p2[0];
        p2[0]=x;
      }
      if(p1[1]>p2[1]){
        let y = p1[1];
        p1[1]=p2[1];
        p2[1]=y;
      }

      const cx = (p1[0]+p2[0])/2;
      const cy = (p1[1]+p2[1])/2;
      const rx = (p2[0]-p1[0])/2;
      const ry = (p2[1]-p1[1])/2;

      const cir = Math.PI * ( 3* (rx+ry) - Math.sqrt((3*rx+ry)*(3*ry+rx)))/4;
      // number of half subdivisions = circumference / (Spacing *2) or 1
      // 
//      const pn = (Math.max(Math.ceil(cir/SPACING),1)*4)-1; // guarentee odd

      let pn = Math.max(Math.ceil(cir/SPACING),1);
      pn = (1===pn%2 ? pn : pn+1); // guarentee odd

      const th = Math.PI/4/pn;

      let octs = [[],[],[],[],[],[],[],[]];

      for( let i = 1; i <= pn; ++i){
        const a = i * th;
        const ct = Math.cos(a);
        const st = Math.sin(a);

        const x1 = parseFloat((rx*ct).toFixed(1));
        const y1 = parseFloat((ry*st).toFixed(1));
        const x2 = parseFloat((rx*st).toFixed(1));
        const y2 = parseFloat((ry*ct).toFixed(1));


        // postive quad
        octs[0].push([cx+x1,cy+y1]);
        if(x1!==x2) {
          octs[1].unshift([cx+x2,cy+y2]);
        }

        octs[2].push([cx-x2,cy+y2]);
        if(x1!==x2) {
          octs[3].unshift([cx-x1,cy+y1]);
        }

        octs[4].push([cx-x1,cy-y1]);
        if(x1!==x2) {
          octs[5].unshift([cx-x2,cy-y2]);
        }

        octs[6].push([cx+x2,cy-y2]);
        if(x1!==x2) {
          octs[7].unshift([cx+x1,cy-y1]);
        }
      }
      let points = [
        [cx+rx,cy],
        ...octs[0],
        ...octs[1],
        [cx,cy+ry],
        ...octs[2],
        ...octs[3],
        [cx-rx,cy],
        ...octs[4],
        ...octs[5],
        [cx,cy-ry],
        ...octs[6],
        ...octs[7]
      ];

      return points;
    }

    function _normalizePathV2Points(points) {
      let {mX,mY} = points.reduce((m,pt)=>({
        mX: Math.min(pt[0],m.mX),
        mY: Math.min(pt[1],m.mY)
      }),{mX:Infinity,mY:Infinity});
      return points.map(pt=>[ pt[0]-mX, pt[1]-mY]);
    }

    /**
     * Converts a path into a list of line segments.
     * This supports freehand paths, but not elliptical paths.
     * @param {(Roll20Path|Roll20Path[])} path
     * @return {Segment[]}
     */
    function toSegments(path) {
        if(_.isArray(path))
            return _toSegmentsMany(path);

        let _path;
        try {
          let page = getObj('page', path.get('_pageid'));
          let pageWidth = page.get('width') * UNIT_SIZE_PX;
          let pageHeight = page.get('height') * UNIT_SIZE_PX;

          if("path" === path.get('type')){
            let rawPath = path.get('_path')
              .replace(/mapWidth/g, pageWidth)
              .replace(/mapHeight/g, pageHeight);
            _path = JSON.parse(rawPath);
          } else {
            // pathv2
            _path = JSON.parse(path.get('points'));
          }
        }
        catch (err) {
          log(`Error parsing Roll20 path JSON: ${path.get('_path')}`);
          sendChat('Path Math', '/w gm An error was encountered while trying to parse the JSON for a path. See the API Console Log for details.');
          return [];
        }

        let transformInfo = getTransformInfo(path);

        let segments = [];

        if("path" === path.get('type')){

          let prevPt;
          let prevType;

          _.each(_path, tuple => {
              let type = tuple[0];

              // Convert the previous point and tuple into segments.
              let newSegs = [];

              // Cubic Bezier
              if(type === 'C') {
                newSegs = _toSegmentsC(prevPt, tuple, transformInfo);
                if(newSegs.length > 0)
                  prevPt = newSegs[newSegs.length - 1][1];
              }

              // Line or two successive Moves. A curious quirk of the latter
              // case is that UDL treats them as segments for windows.
              // Thanks to Scott C and Aaron for letting me know about this,
              // whether it's an intended feature or not.
              if(type === 'L' || (type === 'M' && prevType === 'M')) {
                newSegs = _toSegmentsL(prevPt, tuple, transformInfo);
                if(newSegs.length > 0)
                  prevPt = newSegs[0][1];
              }

              // Move, not preceded by another move (not a UDL window)
              if(type === 'M' && prevType !== 'M') {
                prevPt = tupleToPoint(tuple, transformInfo);
              }

              // Freehand (tiny Quadratic Bezier)
              if(type === 'Q') {
                newSegs = _toSegmentsQ(prevPt, tuple, transformInfo);
                if(newSegs.length > 0)
                  prevPt = newSegs[0][1];
              }

              _.each(newSegs, s => {
                segments.push(s);
              });
              prevType = type;
          });
        } else {
          _path = _normalizePathV2Points(_path);
          // pathv2
          switch(path.get('shape')){
            case 'rec': {
                let p1 = tupleToPoint(['L',_path[0][0],_path[0][1]],transformInfo);
                let p2 = tupleToPoint(['L',_path[1][0],_path[1][1]],transformInfo);
                let x1 = Math.min(p1[0],p2[0]);
                let x2 = Math.max(p1[0],p2[0]);
                let y1 = Math.min(p1[1],p2[1]);
                let y2 = Math.max(p1[1],p2[1]);
                // for rec, there are only two points and you construct the other two.
                segments = [
                  [[x1,y1,1],[x1,y2,1]],
                  [[x1,y2,1],[x2,y2,1]],
                  [[x2,y2,1],[x2,y1,1]],
                  [[x2,y1,1],[x1,y1,1]]
                ];
              }
              break;
            case 'eli': {
                // approximate the segments of a circle
                let p1 = tupleToPoint(['L',_path[0][0],_path[0][1]],transformInfo);
                let p2 = tupleToPoint(['L',_path[1][0],_path[1][1]],transformInfo);
                let x1 = Math.min(p1[0],p2[0]);
                let x2 = Math.max(p1[0],p2[0]);
                let y1 = Math.min(p1[1],p2[1]);
                let y2 = Math.max(p1[1],p2[1]);

                let points = _circlePointsFromCorners([x1,y1],[x2,y2]);

                segments = points.reduce((m,p,i,a)=>
                  i
                  ? [...m,[ [...a[i-1],1],[...p,1]]]
                  : [...m,[ [...a[a.length-1],1],[...p,1]]]
                ,[]);
              }
              break;
            case 'pol': 
              segments = _path.reduce((m,p,i,a)=>
                i
                ? [...m,[ tupleToPoint(['L',...a[i-1]],transformInfo),tupleToPoint(['L',...p],transformInfo)]]
                : m
              ,[]);

              break;
            case 'free': 
              // fake it as a poly line for now...
              segments = _path.reduce((m,p,i,a)=>
                i
                ? [...m,[ tupleToPoint(['L',...a[i-1]],transformInfo),tupleToPoint(['L',...p],transformInfo)]]
                : m
              ,[]);

              break;
          }

        }

        return _.compact(segments);
    }

    /**
     * Converts a 'C' type path point to a list of segments approximating the
     * curve.
     * @private
     * @param {vec3} prevPt
     * @param {PathTuple} tuple
     * @param {PathTransformInfo} transformInfo
     * @return {Segment[]}
     */
    function _toSegmentsC(prevPt, tuple, transformInfo) {
      let cPt1 = tupleToPoint(['L', tuple[1], tuple[2]], transformInfo);
      let cPt2 = tupleToPoint(['L', tuple[3], tuple[4]], transformInfo);
      let pt = tupleToPoint(['L', tuple[5], tuple[6]], transformInfo);
      let points = [prevPt, cPt1, cPt2, pt];

      // Choose the number of segments based on the rough approximate arc length.
      // Each segment should be <= 10 pixels.
      let approxArcLength = VecMath.dist(prevPt, cPt1) + VecMath.dist(cPt1, cPt2) + VecMath.dist(cPt2, pt);
      let numSegs = Math.max(Math.ceil(approxArcLength/10), 1);

      let bezierPts = [prevPt];
      _.each(_.range(1, numSegs), i => {
        let scalar = i/numSegs;
        let bPt = getBezierPoint(points, scalar);
        bezierPts.push(bPt);
      });
      bezierPts.push(pt);

      return _.chain(bezierPts)
      .map((cur, i) => {
        if(i === 0)
          return undefined;

        let prev = bezierPts[i-1];
        return [prev, cur];
      })
      .compact()
      .value();
    }

    /**
     * Converts an 'L' type path point to a segment.
     * @private
     * @param {vec3} prevPt
     * @param {PathTuple} tuple
     * @param {PathTransformInfo} transformInfo
     * @return {Segment[]}
     */
    function _toSegmentsL(prevPt, tuple, transformInfo) {
      // Transform the point to 2D homogeneous map coordinates.
      let pt = tupleToPoint(tuple, transformInfo);
      let segments = [];
      if(!(prevPt[0] == pt[0] && prevPt[1] == pt[1]))
        segments.push([prevPt, pt]);
      return segments;
    }

    /**
     * Converts a 'Q' type path point to a segment approximating
     * the freehand curve.
     * @private
     * @param {vec3} prevPt
     * @param {PathTuple} tuple
     * @param {PathTransformInfo} transformInfo
     * @return {Segment[]}
     */
    function _toSegmentsQ(prevPt, tuple, transformInfo) {
      // Freehand Bezier paths are very small, so let's just
      // ignore the control point for it entirely.
      tuple[1] = tuple[3];
      tuple[2] = tuple[4];

      // Transform the point to 2D homogeneous map coordinates.
      let pt = tupleToPoint(tuple, transformInfo);

      let segments = [];
      if(!(prevPt[0] == pt[0] && prevPt[1] == pt[1]))
        segments.push([prevPt, pt]);
      return segments;
    }

    /**
     * Converts several paths into a single list of segments.
     * @private
     * @param  {Roll20Path[]} paths
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
      let width = transformInfo.width;
      let height = transformInfo.height;
      let scaleX = transformInfo.scaleX;
      let scaleY = transformInfo.scaleY;
      let angle = transformInfo.angle;
      let cx = transformInfo.cx;
      let cy = transformInfo.cy;

      // The point in path coordinates, relative to the path center.
      let x = tuple[1] - width/2;
      let y = tuple[2] - height/2;
      let pt = [x,y,1];

      // The transform of the point from path coordinates to map
      // coordinates.
      let scale = MatrixMath.scale([scaleX, scaleY]);
      let rotate = MatrixMath.rotate(angle);
      let transform = MatrixMath.translate([cx, cy]);
      transform = MatrixMath.multiply(transform, rotate);
      transform = MatrixMath.multiply(transform, scale);

      return MatrixMath.multiply(transform, pt);
    }

    on('chat:message', function(msg) {
      if(msg.type === 'api' && msg.content.indexOf('!pathInfo') === 0) {
        log('!pathInfo');

        try {
          let path = findObjs({
            _type: 'path',
            _id: msg.selected[0]._id
          })[0];
          log(path);
          log(path.get('_path'));

          let segments = toSegments(path);
          log('Segments: ');
          log(segments);

          let pathData = segmentsToPath(segments);
          log('New path data: ');
          log(pathData);

          let curPage = path.get('_pageid');
          _.extend(pathData, {
            stroke: '#ff0000',
            _pageid: curPage,
            layer: path.get('layer')
          });

          let newPath = createObj('path', pathData);
          log(newPath);
        }
        catch(err) {
          log('!pathInfo ERROR: ');
          log(err.message);
        }
      }
      if (msg.type === 'api' && msg.content.startsWith('!pathToUDLWindow')) {
        try {
          let path = findObjs({
            _type: 'path',
            _id: msg.selected[0]._id
          })[0];
          pathToUDLWindow(path);
        }
        catch(err) {
          log('!pathInfo ERROR: ');
          log(err.message);
        }
      }
    });

    return {
        BoundingBox,
        Circle,
        Path,
        Polygon,
        Triangle,

        createCircleData,
        distanceToPoint,
        getBezierPoint,
        getBoundingBox,
        getCenter,
        getTransformInfo,
        mergePathStr,
        normalizePath,
        pathToUDLWindow,
        raycast,
        segmentIntersection,
        segmentsToPath,
        toSegments,
        tupleToPoint
    };
})();

{try{throw new Error('');}catch(e){API_Meta.PathMath.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.PathMath.offset);}}
