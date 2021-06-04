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
    //    log('bbox');
    //    log(bbox);

        _.each(paths, function(p) {
            var pbox = getBoundingBox(p);

            var parsed = JSON.parse(p.get('_path'));
            _.each(parsed, function(pathTuple, index) {
                var dx = pbox.left - bbox.left;
                var dy = pbox.top - bbox.top;
                var sx = p.get('scaleX');
                var sy = p.get('scaleY');

            //    log(pbox.left);
            //    log(p.get('left'));

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

    return {
        BoundingBox: BoundingBox,

        getBoundingBox: getBoundingBox,
        mergePathStr: mergePathStr
    };
})();
