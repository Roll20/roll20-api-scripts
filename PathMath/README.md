# Path Math

A library that provides some mathematical operations involving Paths.
It has no stand-alone functionality of its own.

## API Documentation:

This script's documentation uses the following typedefs:

```
/**
 * A rectangle defining a path's bounding box.
 * @typedef {Object} BoundingBox
 * @property {number} left
 * @property {number} top
 * @property {number} width
 * @property {number} height
 */

/**
 * JSON used to create a Path object with createObj().
 * @typedef {Object} PathData
 *          This is documented by the Roll20 API wiki.
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
 * A line segment defined by two homogeneous 2D points.
 * @typedef {Vector[]} Segment
 */

/**
 * A vector used to define a homogeneous point or a direction.
 * @typedef {number[]} Vector
 */
```

The following functions are exposed by the ```PathMath``` object:

```
/**
 * Returns the partial path data for creating a circular path.
 * @param  {number} radius
 * @param {int} [sides]
 *        If specified, then a polygonal path with the specified number of
 *        sides approximating the circle will be created instead of a true
 *        circle.
 * @return {PathData}
 */
function createCircleData(radius, sides)
```

```
/**
 * Calculates the bounding box for a list of paths.
 * @param {(Path | Path[])} paths
 * @return {BoundingBox}
 */
function getBoundingBox(paths)
```

```
/**
 * Returns the center of the bounding box containing a path or list
 * of paths. The center is returned as a homogenous 2D point
 * (It has a third component which is always 1 which is helpful for
 * affine transformations).
 * @param {(Path|Path[])} paths
 * @return {Vector}
 */
function getCenter(paths)
```

```
/**
 * Gets the 2D transform information about a path.
 * @param  {Path} path
 * @return {PathTransformInfo}
 */
function getTransformInfo(path)
```

```
/**
 * Produces a merged path string from a list of path objects.
 * @param {Path[]} paths
 * @return {String}
 */
function mergePathStr(paths)
```

```
/**
 * Reproduces the data for a polygonal path such that the scales are 1 and
 * its rotate is 0.
 * This can also normalize freehand paths, but they will be converted to
 * polygonal paths. The quatric Bezier curves used in freehand paths are
 * so short though, that it doesn't make much difference though.
 * @param {Path}
 * @return {PathData}
 */
function normalizePath(path)
```

```
/**
 * Computes the intersection between two homogenous 2D line segments,
 * if it exists.
 * @param {Segment} seg1
 * @param {Segment} seg2
 * @return {Array<Vector, number, number>}
 *      The point of intersection in homogenous 2D coordinates and its
 *      parametric coefficients along seg1 and seg2,
 *      or undefined if the segments are parallel.
 */
function segmentIntersection(seg1, seg2)
```

```
/**
 * Produces the data for creating a path from a list of segments forming a
 * continuous path.
 * @param {Segment[]}
 * @return {PathData}
 */
function segmentsToPath(segments)
```

```
/**
 * Converts a path into a list of line segments.
 * This supports freehand paths, but not elliptical paths.
 * @param {(Path|Path[])} path
 * @return {Segment[]}
 */
function toSegments(path)
```

```
/**
 * Transforms a tuple for a point in a path's _path property into a point in
 * homogeneous 2D map coordinates.
 * @param  {PathTuple} tuple
 * @param  {PathTransformInfo} transformInfo
 * @return {Vector}
 */
function tupleToPoint(tuple, transformInfo)
```
