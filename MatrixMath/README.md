# Matrix Math

This script provides a library of matrix mathematical operations for
linear algebra and 2D affine transformations. It has no behavior on its own
and is meant to be used by other scripts to do neat things, particularly
for transforming geometric systems.

All of this scripts operations are exposed through the ```MatrixMath``` object.

## Other scripts

MatrixMath has no dependencies, but it does play nice with the ```VectorMath```
script's library, particularly for ```MatrixMath.multiply()``` when used to
transform a vector.

## Unit tests
Unit tests are implemented for all its operations, and they run automatically
when the script is loaded.
