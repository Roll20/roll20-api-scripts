/**
 * This script provides a way for players and GMs to split paths by their
 * intersections with another splitting path.
 * This could especially be useful for when corrections need to be made to
 * paths used for dynamic lighting.
 *
 * Simply draw a polygonal path intersecting the path you want to split up.
 * Select the main path and then the splitting path.
 * Then with the main and splitting paths selected,
 * enter the command '!pathSplit'.
 * The original path will be divided into new paths separated at the points
 * where the splitting path intersected the original path.
 *
 * This script also works with paths that have been scaled and rotated.'
 *
 * Requires:
 *   VectorMath
 *   MatrixMath
 *   PathMath
 */

 (function() {
    /**
     * A 3-tuple representing a point of intersection between two line segments.
     * The first element is a Vector representing the point of intersection in
     * 2D homogenous coordinates.
     * The second element is the parametric coefficient for the intersection
     * along the first segment.
     * The third element is the parametric coefficient for the intersection
     * along the second segment.
     * @typedef {Array} Intersection
     */

     /**
     * A vector used to define a homogeneous point or a direction.
     * @typedef {number[]} Vector
     */

    /**
     * A line segment defined by two homogenous 2D points.
     * @typdef {Vector[]} Segment
     */


    // Initialize the script's state if it hasn't already been initialized.
    state.PathSplitter = state.PathSplitter || {
        splitPathColor: '#ff00ff' // pink
    };


    function _getSplitSegmentPaths(mainSegments, splitSegments) {
        var resultSegPaths = [];
        var curPathSegs = [];

        _.each(mainSegments, function(seg1) {

            // Find the points of intersection and their parametric coefficients.
            var intersections = [];
            _.each(splitSegments, function(seg2) {
                var i = _segmentIntersection(seg1, seg2);
                if(i)
                    intersections.push(i);
            });

            if(intersections.length > 0) {
                // Sort the intersections in the order that they appear along seg1.
                intersections.sort(function(a, b) {
                    return a[1] - b[1];
                });

                var lastPt = seg1[0];
                _.each(intersections, function(i) {
                    // Complete the current segment path.
                    curPathSegs.push([lastPt, i[0]]);
                    resultSegPaths.push(curPathSegs);

                    // Start a new segment path.
                    curPathSegs = [];
                    lastPt = i[0];
                });
                curPathSegs.push([lastPt, seg1[1]]);
            }
            else {
                curPathSegs.push(seg1);
            }
        });
        resultSegPaths.push(curPathSegs);

        return resultSegPaths;
    };

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
    function _segmentIntersection(seg1, seg2) {
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
    };

    /**
     * Splits mainPath at its intersections with splitPath. The original path
     * is removed, being replaced by the new split up paths.
     * @param {Path} mainPath
     * @param {Path} splitPath
     * @return {Path[]}
     */
    function splitPathAtIntersections(mainPath, splitPath) {
        var mainSegments = PathMath.toSegments(mainPath);
        var splitSegments = PathMath.toSegments(splitPath);
        var segmentPaths = _getSplitSegmentPaths(mainSegments, splitSegments);

        // Convert the list of segment paths into paths.
        var _pageid = mainPath.get('_pageid');
        var controlledby = mainPath.get('controlledby');
        var fill = mainPath.get('fill');
        var layer = mainPath.get('layer');
        var stroke = mainPath.get('stroke');
        var stroke_width = mainPath.get('stroke_width');

        var results = [];
        _.each(segmentPaths, function(segments) {
            var pathData = PathMath.segmentsToPath(segments);
            _.extend(pathData, {
                _pageid: _pageid,
                controlledby: controlledby,
                fill: fill,
                layer: layer,
                stroke: stroke,
                stroke_width: stroke_width
            });
            var path = createObj('path', pathData);
            results.push(path);
        });

        // Remove the original path and the splitPath.
        mainPath.remove();
        splitPath.remove();

        return results;
    }

    on('chat:message', function(msg) {
        if(msg.type === 'api' && msg.content.indexOf('!pathSplitColor') === 0) {
            try {
                var selected = msg.selected;
                var path = findObjs({
                    _type: 'path',
                    _id: selected[0]._id
                })[0];

                var stroke = path.get('stroke');
                state.PathSplitter.splitPathColor = stroke;
            }
            catch(err) {
                log('!pathSplitColor ERROR: ', err.message)
            }
        }
        else if(msg.type === 'api' && msg.content.indexOf('!pathSplit')  === 0) {
            try {
                var selected = msg.selected;
                var path1 = findObjs({
                    _type: 'path',
                    _id: selected[0]._id
                })[0];
                var path2 = findObjs({
                    _type: 'path',
                    _id: selected[1]._id
                })[0];

                // Determine which path is the main path and which is the
                // splitting path.
                var mainPath, splitPath;
                if(path1.get('stroke') === state.PathSplitter.splitPathColor) {
                    mainPath = path2;
                    splitPath = path1;
                }
                else if(path2.get('stroke') === state.PathSplitter.splitPathColor) {
                    mainPath = path1;
                    splitPath = path2;
                }
                else {
                    throw new Error('No splitting path selected.');
                }
                var newPaths = splitPathAtIntersections(mainPath, splitPath);
            }
            catch(err) {
                log('!pathSplit ERROR: ', err.message)
            }
        }
    });
 })();
