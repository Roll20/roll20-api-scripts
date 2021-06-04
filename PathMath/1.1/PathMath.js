/**
 * PathMath script
 *
 * This is a library that provides mathematical operations involving Paths.
 * It intended to be used by other scripts and has no stand-alone
 * functionality of its own. All the library's operations are exposed by the
 * PathMath object created by this script.
 */
var PathMath = (function() {

    /**
     * A vector used to define a homogeneous point or a direction.
     * @typedef {number[]} Vector
     */

    /**
     * A line segment defined by two homogeneous 2D points.
     * @typdef {Vector[]} Segment
     */

    /**
     * A simple class for BoundingBoxes.
     * @param {Number} left
     * @param {Number} top
     * @param {Number} width
     * @param {Number} height
     */
    function BoundingBox(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    };

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
                result = _addBoundingBoxes(result, pBox);
            else
                result = pBox;
        });
        return result;
    };

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
    };

    /**
     * @private
     * Calculates the bounding box for a single path.
     * @param  {Path} path
     * @return {BoundingBox}
     */
    function _getSingleBoundingBox(path) {
        var width = path.get('width')*path.get('scaleX');
        var height = path.get('height')*path.get('scaleY');
        var left = path.get('left') - width/2;
        var top = path.get('top') - height/2;

        return new BoundingBox(left, top, width, height);
    };

    /**
     * @private
     * Adds two bounding boxes.
     * @param  {BoundingBox} a
     * @param  {BoundingBox} b
     * @return {BoundingBox}
     */
    function _addBoundingBoxes(a, b) {
        var left = Math.min(a.left, b.left);
        var top = Math.min(a.top, b.top);
        var right = Math.max(a.left + a.width, b.left + b.width);
        var bottom = Math.max(a.top + a.height, b.top + b.height);

        return new BoundingBox(left, top, right - left, bottom - top);
    };

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

            var parsed = JSON.parse(p.get('_path'));
            _.each(parsed, function(pathTuple, index) {
                var dx = pbox.left - bbox.left;
                var dy = pbox.top - bbox.top;
                var sx = p.get('scaleX');
                var sy = p.get('scaleY');

                // Bezier curve tuple
                if(pathTuple[0] == 'Q') {
                    var cx = pathTuple[1]*sx + dx;
                    var cy = pathTuple[2]*sy + dy;
                    var x = pathTuple[3]*sx + dx;
                    var y = pathTuple[4]*sy + dy;
                    merged.push([pathTuple[0], cx, cy, x, y]);
                }

                // Move and Line tuples
                else {
                    var x = pathTuple[1]*sx + dx;
                    var y = pathTuple[2]*sy + dy;
                    merged.push([pathTuple[0], x, y]);
                }
            });
        });

        return JSON.stringify(merged);
    };

    /**
     * Reproduces the data for a polygonal path such that the scales are 1 and
     * its rotate is 0.
     * @param {Path}
     * @return {PathData}
     */
    function normalizePath(path) {
        var segments = toSegments(path);
        return segmentsToPath(segments);
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
     * Converts a path into a list of line segments. As the nature of this
     * method suggests, this does not work to convert quadratic paths
     * (for freehand paths) or cubic paths (for oval paths).
     */
    function toSegments(path) {
        var _path = JSON.parse(path.get('_path'));
        var scaleX = path.get('scaleX');
        var scaleY = path.get('scaleY');
        var angle = path.get('rotation')/180*Math.PI;

        // The transformed center of the path.
        var cx = path.get('left');
        var cy = path.get('top');

        // The untransformed width and height.
        var width = path.get('width');
        var height = path.get('height');

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

            pt = MatrixMath.multiply(transform, pt);

            // If we have an 'L' type point, then add the segment.
            // Either way, keep track of the point we've moved to.
            if(type === 'L' && !(prevPt[0] == pt[0] && prevPt[1] == pt[1]))
                segments.push([prevPt, pt]);

            prevPt = pt;
        });

        return segments;
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
                log('Lines ERROR: ', err.message)
            }

        }
    });

    return {
        BoundingBox: BoundingBox,

        getBoundingBox: getBoundingBox,
        getCenter: getCenter,
        mergePathStr: mergePathStr,
        normalizePath: normalizePath,
        segmentsToPath: segmentsToPath,
        toSegments: toSegments
    };
})();
