/**
 * This is a small library for (mostly 2D) vector mathematics.
 * Internally, the vectors used by this library are simple arrays of numbers.
 * The functions provided by this library do not alter the input vectors, 
 * treating each vector as an immutable object.
 */
var VecMath = (function() {
    
    /**
     * Adds two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var add = function(a, b) {
        var result = [];
        for(var i=0; i<a.length; i++) {
            result[i] = a[i] + b[i];
        }
        return result;
    };
    
    
    /**
     * Creates a cloned copy of a vector.
     * @param {vec} v
     * @return {vec}
     */
    var clone = function(v) {
        var result = [];
        for(var i=0; i < v.length; i++) {
            result.push(v[i]);
        }
        return result;
    };
    
    
    /** 
     * Returns an array representing the cross product of two 3D vectors. 
     * @param {vec3} a
     * @param {vec3} b
     * @return {vec3}
     */
    var cross = function(a, b) {
        var x = a[1]*b[2] - a[2]*b[1];
        var y = a[2]*b[0] - a[0]*b[2];
        var z = a[0]*b[1] - a[1]*b[0];
        return [x, y, z];
    };
    
    
    /** 
     * Returns the degree of a vector - the number of dimensions it has.
     * @param {vec} vector
     * @return {int}
     */
    var degree = function(vector) {
        return vector.length;
    };
    
    
    /**
     * Computes the distance between two points.
     * @param {vec} pt1
     * @param {vec} pt2
     * @return {number}
     */
    var dist = function(pt1, pt2) {
        var v = vec(pt1, pt2);
        return length(v);
    };
    
    
    /** 
     * Returns the dot product of two vectors. 
     * @param {vec} a
     * @param {vec} b
     * @return {number}
     */
    var dot = function(a, b) {
        var result = 0;
        for(var i = 0; i < a.length; i++) {
            result += a[i]*b[i];
        }
        return result;
    };
    
    
    /**
     * Tests if two vectors are equal.
     * @param {vec} a
     * @param {vec} b
     * @param {float} [tolerance] A tolerance threshold for comparing vector 
     *                            components.  
     * @return {boolean} true iff the each of the vectors' corresponding 
     *                  components are equal.
     */
    var equal = function(a, b, tolerance) {
        if(a.length != b.length)
            return false;
        
        for(var i=0; i<a.length; i++) {
            if(tolerance !== undefined) {
                if(Math.abs(a[i] - b[i]) > tolerance) {
                    return false;
                }
            }
            else if(a[i] != b[i])
                return false;
        }
        return true;
    };
    
    
    
    /** 
     * Returns the length of a vector. 
     * @param {vec} vector
     * @return {number}
     */
    var length = function(vector) {
        var length = 0;
        for(var i=0; i < vector.length; i++) {
            length += vector[i]*vector[i];
        }
        return Math.sqrt(length);
    };
    
    
    
    /**
     * Computes the normalization of a vector - its unit vector.
     * @param {vec} v
     * @return {vec}
     */
    var normalize = function(v) {
        var vHat = [];
        
        var vLength = length(v);
        for(var i=0; i < v.length; i++) {
            vHat[i] = v[i]/vLength;
        }
        
        return vHat;
    };
    
    
    /**
     * Computes the projection of vector b onto vector a.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var projection = function(a, b) {
        var scalar = scalarProjection(a, b);
        var aHat = normalize(a);
        
        return scale(aHat, scalar);
    };
    
    
    /** 
     * Computes the distance from a point to an infinitely stretching line. 
     * Works for either 2D or 3D points.
     * @param {vec2 || vec3} pt
     * @param {vec2 || vec3} linePt1   A point on the line.
     * @param {vec2 || vec3} linePt2   Another point on the line.
     * @return {number}
     */
    var ptLineDist = function(pt, linePt1, linePt2) {
        var a = vec(linePt1, linePt2);
        var b = vec(linePt1, pt);
        
        // Make 2D vectors 3D to compute the cross product.
        if(!a[2])
            a[2] = 0;
        if(!b[2])
            b[2] = 0;
        
        var aHat = normalize(a);
        var aHatCrossB = cross(aHat, b);
        return length(aHatCrossB);
    };
    
    
    /** 
     * Computes the distance from a point to a line segment. 
     * Works for either 2D or 3D points.
     * @param {vec2 || vec3} pt
     * @param {vec2 || vec3} linePt1   The start point of the segment.
     * @param {vec2 || vec3} linePt2   The end point of the segment.
     * @return {number}
     */
    var ptSegDist = function(pt, linePt1, linePt2) {
        var a = vec(linePt1, linePt2);
        var b = vec(linePt1, pt);
        var aDotb = dot(a,b);
        
        // Is pt behind linePt1?
        if(aDotb < 0) {
            return length(vec(pt, linePt1));
        }
        
        // Is pt after linePt2?
        else if(aDotb > dot(a,a)) {
            return length(vec(pt, linePt2));
        }
        
        // Pt must be between linePt1 and linePt2.
        else {
            return ptLineDist(pt, linePt1, linePt2);
        }
    };
    
    
    /**
     * Computes the scalar projection of b onto a.
     * @param {vec2} a
     * @param {vec2} b
     * @return {vec2}
     */
    var scalarProjection = function(a, b) {
        var aDotB = dot(a, b);
        var aLength = length(a);
        
        return aDotB/aLength;
    };
    
    
    
    /**
     * Computes a scaled vector.
     * @param {vec2} v
     * @param {number} scalar
     * @return {vec2}
     */
    var scale = function(v, scalar) {
        var result = [];
        
        for(var i=0; i<v.length; i++) {
            result[i] = v[i]*scalar;
        }
        return result;
    };
    
    
    /** 
     * Computes the difference of two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var sub = function(a, b) {
        var result = [];
        for(var i=0; i<a.length; i++) {
            result.push(a[i] - b[i]);
        }
        return result;
    };
    
    
    /** 
     * Returns the vector from pt1 to pt2. 
     * @param {vec} pt1
     * @param {vec} pt2
     * @return {vec}
     */
    var vec = function(pt1, pt2) {
        var result = [];
        for(var i=0; i<pt1.length; i++) {
            result.push( pt2[i] - pt1[i] );
        }
        
        return result;
    };
    
    
    // The exposed API.
    return {
        add: add,
        clone: clone,
        cross: cross,
        degree: degree,
        dist: dist,
        dot: dot,
        equal: equal,
        length: length,
        normalize: normalize,
        projection: projection,
        ptLineDist: ptLineDist,
        ptSegDist: ptSegDist,
        scalarProjection: scalarProjection,
        scale: scale,
        sub: sub,
        vec: vec
    };
})();


// Perform unit tests. Inform us in the log if any test fails. Otherwise,
// succeed silently.
(function() {
    /**
     * Does a unit test. If the test evaluates to false, then it displays with
     * a message that the unit test failed. Otherwise it passes silently.
     * @param {boolean} test    Some expression to test.
     * @param {string} failMsg  A message displayed if the test fails.
     */
    var assert = function(test, failMsg) {
        if(!test) {
            log("UNIT TEST FAILED: " + failMsg);
        }
    };
    
    
    var a = [1, 5];
    var b = [17, -8];
    
    
    // VecMath.equal
    assert(
        VecMath.equal([2, -3, 4, 8], [2, -3, 4, 8]),
        "VecMath.equal([2, -3, 4, 8], [2, -3, 4, 8])"
    );
    assert(
        !VecMath.equal([1, 3, 5], [-2, 4, -6]),
        "!VecMath.equal([1, 3, 5], [-2, 4, -6])"
    );
    assert(
        !VecMath.equal([1, 3, 5], [1, 3, 4]),
        "!VecMath.equal([1, 3, 5], [1, 3, 4])"
    );
    assert(
        !VecMath.equal([1,2,3], [1,2]),
        "!VecMath.equal([1,2,3], [1,2])"
    );
    assert(
        !VecMath.equal([1,2], [1,2,3]),
        "!VecMath.equal([1,2], [1,2,3])"
    );
    
    // VecMath.add
    assert(
        VecMath.equal(
            VecMath.add([1, 2, 3], [3, -5, 10]),
            [4, -3, 13]
        ),
        "VecMath.add([1, 2, 3], [3, -5, 10]) equals [4, -3, 13]"
    );
    assert(
        VecMath.equal(
            VecMath.add([0, 0, 0], [1, 2, 3]),
            [1, 2, 3]
        ),
        "VecMath.add([0, 0, 0], [1, 2, 3]) equals [1, 2, 3]"
    );
    
    // VecMath.clone
    assert(
        VecMath.equal( VecMath.clone(a), a),
        "VecMath.equal( VecMath.clone(a), a)"
    );
    assert(
        VecMath.clone(a) != a,
        "VecMath.clone(a) != a"
    );
    
    // VecMath.cross
    assert(
        VecMath.equal(
            VecMath.cross([1, 0, 0], [0, 1, 0]),
            [0, 0, 1]
        ),
        "VecMath.cross([1, 0, 0], [0, 1, 0]) equals [0, 0, 1]"
    );
    assert(
        VecMath.equal(
            VecMath.cross([1,2,3], [-10, 3, 5]),
            [1, -35, 23]
        ),
        "VecMath.cross([1,2,3], [-10, 3, 5]) equals [1, -35, 23]"
    );
    
    // VecMath.degree
    assert(
        VecMath.degree([1,2,3]) == 3,
        "VecMath.degree([1,2,3]) == 3"
    );
    assert(
        VecMath.degree([1]) == 1,
        "VecMath.degree([1]) == 1"
    );
    assert(
        VecMath.degree([1,1,1,1,1]) == 5,
        "VecMath.degree([1,1,1,1,1]) == 5"
    );
    
    // VecMath.dist
    assert(
        VecMath.dist([1,2], [4,6]) == 5,
        "VecMath.dist([1,2], [4,6]) == 5"
    );
    assert(
        VecMath.dist([3,4], [-3, -4]) == 10,
        "VecMath.dist([3,4], [-3, -4]) == 10"
    );
    
    // VecMath.dot
    assert(
        VecMath.dot([1, 2, 3], [-1, -2, -3]) == -14,
        "VecMath.dot([1, 2, 3], [-1, -2, -3]) == -14"
    );
    assert(
        VecMath.dot([1,0], [0,1]) == 0,
        "VecMath.dot([1,0], [0,1]) == 0"
    );
    assert(
        VecMath.dot([1,0], [0,-1]) == 0,
        "VecMath.dot([1,0], [0,-1]) == 0"
    );
    assert(
        VecMath.dot([1,0], [-1, 0]) == -1,
        "VecMath.dot([1,0], [-1, 0]) == -1"
    );
    assert(
        VecMath.dot([1,0], [1, 0]) == 1,
        "VecMath.dot([1,0], [1, 0]) == 1"
    );
    
    // VecMath.length
    assert(
        VecMath.length([1,0,0]) == 1,
        "VecMath.length([1,0,0]) == 1"
    );
    assert(
        VecMath.length([3,4]) == 5,
        "VecMath.length([3,4]) == 5"
    );
    assert(
        VecMath.length([-3, 0, 4, 0]) == 5,
        "VecMath.length([-3, 0, 4, 0]) == 5"
    );
    
    // VecMath.normalize
    assert(
        VecMath.equal(
            VecMath.normalize([3,0]),
            [1, 0]
        ),
        "VecMath.normalize([3,0]) equals [1,0]"
    );
    assert(
        VecMath.equal(
            VecMath.normalize([0,-3]),
            [0, -1]
        ),
        "VecMath.normalize([0,-3]) equals [0,-1]"
    );
    
    // VecMath.projection
    assert(
        VecMath.equal(
            VecMath.projection([5,0], [3, 4]),
            [3, 0]
        ),
        "VecMath.projection([5,0], [3, 4]) equals [3, 0]"
    );
    assert(
        VecMath.equal(
            VecMath.projection([5,5], [0, 6]),
            [3, 3],
            0.001
        ),
        "VecMath.projection([5,5], [0, 6]) equals [3, 3]"
    );
    
    // VecMath.ptLineDist
    assert(
        VecMath.ptLineDist([0,3], [-100,5], [100,5]) == 2,
        "VecMath.ptLineDist([0,3], [-100,5], [100,5]) == 2"
    );
    assert(
        VecMath.ptLineDist([3,0], [5,5], [5,10]) == 2,
        "VecMath.ptLineDist([3,0], [5,5], [5,10]) == 2"
    );
    
    // VecMath.ptSegDist
    assert(
        VecMath.ptSegDist([0,3], [-5,5], [5,5]) == 2,
        "VecMath.ptSegDist([0,3], [-5,5], [5,5]) == 2"
    );
    assert(
        VecMath.ptSegDist([3,0], [5,-5], [5,5]) == 2,
        "VecMath.ptSegDist([3,0], [5,-5], [5,5]) == 2"
    );
    assert(
        VecMath.ptSegDist([3,4], [-5,0], [0,0]) == 5,
        "VecMath.ptSegDist([3,4], [-5,0], [0,0]) == 5"
    );
    assert(
        VecMath.ptSegDist([-2,-4], [1,0], [5,0]) == 5,
        "VecMath.ptSegDist([-2,-4], [1,0], [5,0]) == 5"
    );
    
    // VecMath.scalarProjection
    assert(
        VecMath.scalarProjection([5,0], [3, 4]) == 3,
        "VecMath.scalarProjection([5,0], [3, 4]) == 3"
    );
    
    // VecMath.scale
    assert(
        VecMath.equal(
            VecMath.scale([1,-2,3], 6),
            [6, -12, 18]
        ),
        "VecMath.scale([1,-2,3], 6) equals [6, -12, 18]"
    );
    
    // VecMath.sub
    assert(
        VecMath.equal(
            VecMath.sub([10, 8, 6], [-4, 6, 1]),
            [14, 2, 5]
        ),
        "VecMath.sub([10, 8, 6], [-4, 6, 1]) equals [14, 2, 5]"
    );
    
    // VecMath.vec
    assert(
        VecMath.equal(
            VecMath.vec([1,1], [3,4]),
            [2,3]
        ),
        "VecMath.vec([1,1], [3,4]) equals [2,3]"
    );
})();
