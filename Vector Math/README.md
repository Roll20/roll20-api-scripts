# Vector Math

This script provides a small library of vector mathematics operations used by
other scripts to assist in geometric computations. For example, this is
used prominently in the ```Token Collisions``` script.

## API Documentation

The following functions are exposed by the ```VecMath``` object:

```
**
 * Adds two vectors.
 * @param {vec} a
 * @param {vec} b
 * @return {vec}
 */
function add(a, b)
```

```
/**
 * Creates a cloned copy of a vector.
 * @param {vec} v
 * @return {vec}
 */
function clone(v)
```

```
/**
 * Returns the cross product of two 3D vectors.
 * @param {vec3} a
 * @param {vec3} b
 * @return {vec3}
 */
function cross(a, b)
```

```
/**
 * Returns the degree of a vector - the number of dimensions it has.
 * @param {vec} vector
 * @return {int}
 */
function degree(vector)
```

```
/**
 * Computes the distance between two points.
 * @param {vec} pt1
 * @param {vec} pt2
 * @return {number}
 */
function dist(pt1, pt2)
```

```
/**
 * Returns the dot product of two vectors.
 * @param {vec} a
 * @param {vec} b
 * @return {number}
 */
function dot(a, b)
```

```
/**
 * Tests if two vectors are equal.
 * @param {vec} a
 * @param {vec} b
 * @param {float} [tolerance=0] A tolerance threshold for comparing vector
 *                            components.  
 * @return {boolean} true iff the each of the vectors' corresponding
 *                  components are equal.
 */
function equal(a, b, tolerance)
```

```
/**
 * Returns the length of a vector.
 * @param {vec} vector
 * @return {number}
 */
function length(vector)
```

```
/**
 * Computes the normalization of a vector - its unit vector.
 * @param {vec} v
 * @return {vec}
 */
function normalize(v)
```

```
/**
 * Computes the projection of vector b onto vector a.
 * @param {vec} a
 * @param {vec} b
 * @return {vec}
 */
function projection(a, b)
```

```
/**
 * Computes the distance from a point to an infinitely stretching line.
 * Works for either 2D or 3D points.
 * @param {vec2 || vec3} pt
 * @param {vec2 || vec3} linePt1   A point on the line.
 * @param {vec2 || vec3} linePt2   Another point on the line.
 * @return {number}
 */
function ptLineDist(pt, linePt1, linePt2)
```

```
/**
 * Computes the distance from a point to a line segment.
 * Works for either 2D or 3D points.
 * @param {vec2 || vec3} pt
 * @param {vec2 || vec3} linePt1   The start point of the segment.
 * @param {vec2 || vec3} linePt2   The end point of the segment.
 * @return {number}
 */
function ptSegDist(pt, linePt1, linePt2)
```

```
/**
 * Computes the scalar projection of b onto a.
 * @param {vec2} a
 * @param {vec2} b
 * @return {vec2}
 */
function scalarProjection(a, b)
```

```
/**
 * Computes a scaled vector.
 * @param {vec2} v
 * @param {number} scalar
 * @return {vec2}
 */
function scale(v, scalar)
```

```
/**
 * Computes the difference of two vectors.
 * @param {vec} a
 * @param {vec} b
 * @return {vec}
 */
function sub(a, b)
```

```
/**
 * Returns the vector from pt1 to pt2.
 * @param {vec} pt1
 * @param {vec} pt2
 * @return {vec}
 */
function vec(pt1, pt2)
```
