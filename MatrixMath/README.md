# Matrix Math

This script provides a library of matrix mathematical operations for
linear algebra and 2D affine transformations. It has no behavior on its own
and is meant to be used by other scripts to do neat things, particularly
for transforming geometric systems.

All of this scripts operations are exposed through the ```MatrixMath``` object.

## Other scripts

MatrixMath has no dependencies, but it does play nice with the ```Vector Math```
script's library, particularly for ```MatrixMath.multiply()``` when used to
transform a vector.

## Unit tests
Unit tests are implemented for all its operations, and they run automatically
when the script is loaded.

## API Documentation

This script's documentation makes use of the follow typedefs:

```
/**
 * An NxN square matrix, represented as a 2D array of numbers in column-major
 * order. For example, mat[3][2] would get the value in column 3 and row 2.
 * order.
 * @typedef {number[][]} Matrix
 */
```

```
/**
 * An N-degree vector.
 * @typedef {number[]} Vector
 */
```

The following functions are exposed by the ```MatrixMath``` object:

```
/**
 * Gets the adjugate of a matrix, the tranpose of its cofactor matrix.
 * @param  {Matrix} mat
 * @return {Matrix}
 */
function adjoint(mat)
```

```
/**
 * Produces a clone of an NxN square matrix.
 * @param  {Matrix} mat
 * @return {Matrix}
 */
function clone(mat)
```

```
/**
 * Gets the cofactor of a matrix at a specified column and row.
 * @param  {Matrix} mat
 * @param  {uint} col
 * @param  {uint} row
 * @return {number}
 */
function cofactor(mat, col, row)
```

```
/**
 * Gets the cofactor matrix of a matrix.
 * @param  {Matrix} mat
 * @return {Matrix}
 */
function cofactorMatrix(mat)
```

```
/**
 * Gets the determinant of an NxN matrix.
 * @param  {Matrix} mat
 * @return {number}
 */
function determinant(mat)
```

```
/**
 * Tests if two matrices are equal.
 * @param  {Matrix} a
 * @param  {Matrix} b
 * @param {number} [tolerance=0]
 *        If specified, this specifies the amount of tolerance to use for
 *        each value of the matrices when testing for equality.
 * @return {boolean}
 */
function equal(a, b, tolerance)
```

```
/**
 * Produces an identity matrix of some size.
 * @param  {uint} size
 * @return {Matrix}
 */
function identity(size)
```

```
/**
 * Gets the inverse of a matrix.
 * @param  {Matrix} mat
 * @return {Matrix}
 */
function inverse(mat)
```

```
/**
 * Gets the determinant of a matrix omitting some column and row.
 * @param  {Matrix} mat
 * @param  {uint} col
 * @param  {uint} row
 * @return {number}
 */
function minor(mat, col, row)
```

```
/**
 * Returns the matrix multiplication of a*b.
 * This function works for non-square matrices (and also for transforming
 * vectors by a matrix).
 * For matrix multiplication to work, the # of columns in A must be equal
 * to the # of rows in B.
 * The resulting matrix will have the same number of rows as A and the
 * same number of columns as B.
 * If b was given as a vector, then the result will also be a vector.
 * @param  {Matrix} a
 * @param  {Matrix|Vector} b
 * @return {Matrix|Vector}
 */
function multiply(a, b)
```

```
/**
 * Returns a matrix with a column and row omitted.
 * @param  {Matrix} mat
 * @param  {uint} col
 * @param  {uint} row
 * @return {Matrix}
 */
function omit(mat, col, row)
```

```
/**
 * Produces a 2D rotation affine transformation. The direction of the
 * rotation depends upon the coordinate system.
 * @param  {number} angle
 *         The angle, in radians.
 * @return {Matrix}
 */
function rotate(angle)
```

```
/**
 * Produces a 2D scale affine transformation matrix.
 * The matrix is used to transform homogenous coordinates, so it is
 * actually size 3 instead of size 2, despite being used for 2D geometry.
 * @param  {(number|Vector)} amount
 *         If specified as a number, then it is a uniform scale. Otherwise,
 *         it defines a scale by parts.
 * @return {Matrix}
 */
function scale(amount)
```

```
/**
 * Gets the size N of a NxN square matrix.
 * @param  {Matrix} mat
 * @return {uint}
 */
function size(mat)
```

```
/**
 * Produces a 2D translation affine transformation matrix.
 * The matrix is used to transform homogenous coordinates, so it is
 * actually size 3 instead of size 2, despite being used for 2D geometry.
 * @param  {Vector} vec
 * @return {Matrix}
 */
function translate(vec)
```

```
/**
 * Returns the transpose of a matrix.
 * @param  {Matrix} mat
 * @return {Matrix}
 */
function transpose(mat)
```
