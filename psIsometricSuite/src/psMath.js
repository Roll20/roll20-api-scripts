/*

		_/_/_/      _/_/_/      _/      _/    _/_/    _/_/_/_/_/  _/    _/   
	   _/    _/  _/            _/_/  _/_/  _/    _/      _/      _/    _/    
	  _/_/_/      _/_/        _/  _/  _/  _/_/_/_/      _/      _/_/_/_/     
	 _/              _/      _/      _/  _/    _/      _/      _/    _/      
	_/        _/_/_/        _/      _/  _/    _/      _/      _/    _/      

*/

var psMath = psMath || (function plexsoupAwesomeMaths() {
    // Another module. This one for fun math. Adding and subtracting vectors, Distance, etc.
    var debug = false; // set to true to enable verbose logging.

	var info = {
		name: "psMath.js",
		version: 0.1,
		author: "plexsoup"
	};
	
	var config = {};
	
    var getLongestVectorLength = function longestVectorGetter(vectorList) {
        // **** why is this returning a length of 3 for two dimensional vectors?

        if (debug) { log("entering getLongestVectorLength with: " + vectorList); }

        if (vectorList.length == 2) {
            if ( _.isNumber(vectorList[0]) ) {
                log("aborting getLongestVectorLength(" + vectorList + "). I think we got one vector (a single x,y location) instead of a list of vectors.");
                return(2);
            }
        } else {
            if (debug) {log("vectorList.length = " + vectorList);}
        }

        var longestVectorLength = 0;


        _.each(vectorList, function loopToFindLongest(vector) {
            if (vector.length > longestVectorLength) {
                longestVectorLength = vector.length;
            }
        });

        if (debug) {
            log("getLongestVectorLength returning with: " + longestVectorLength);
        }

        return longestVectorLength;

    };

    var initializeVector = function vectorInitialiser(lengthRequired) {
        if (debug) { log("initializeVector called with " + lengthRequired); }
        var newVector = [];
        var elementID;
        for(elementID = 0; elementID < lengthRequired; elementID++) {
            newVector.push(0);
        }
        if (debug) { log("initializeVector returning with " + newVector); }
        return newVector;
    };

    var addVectors = function vectorAdder(listOfVectors) { // expects a 2d array.. [[point1, point2, ... pointN], ..., [pn1, pn2, ... pnN]]
        // assumes the input vectors are the same length: eg 2 coordinates each: X and Y

        if (listOfVectors.length == 2 ) { // make sure you're adding 2 vectors and not 2 points
            if (_.isNumber(listOfVectors[0])) {
                log("Aborting addVectors(" + listOfVectors + "). I think it contains one vector instead of two or more.");
                return listOfVectors; // bail out.. something went wrong. You got a point instead of 2 vectors
            }
        }

        if ( debug ) { log("addVectors called with: " + listOfVectors); }

        var longestVectorLength = getLongestVectorLength(listOfVectors);
        var sumVector = initializeVector(longestVectorLength);




        var elementID = 0;
        var vectorNumber = 0;
        for(elementID=0; elementID<longestVectorLength; elementID++) {
            for(vectorNumber=0; vectorNumber<listOfVectors.length; vectorNumber++ ) {
                sumVector[elementID] += Number(listOfVectors[vectorNumber][elementID]);

            }
        }

        if (debug) {
            log("addVectors returning with: " + sumVector);
        }

        if ( debug ) { log("addVectors returning " + sumVector); }
        return sumVector;

    };

    var scaleVector = function vectorExpander(vector, scalar) {
        if (debug) {
            log("scaleVector called with " + vector + ", " + scalar );
        }
        var newVector = _.map(vector, function scaleElement(elementValue) {
            return elementValue * scalar;
        });
        if (debug) {
            log("scaleVector returning with " + newVector );
        }
        return newVector;
    };

    var normalizeVector = function vectorNormalizer(point1, point2) { // expecting a list of 2 points [x1,y2], [x2,y2]
        if (debug) { log("entering normalizeVector with: " + point1 + ", " + point2); }

        var unitVector;
        var translatedVector = addVectors( [point2, scaleVector(point1, -1)] );

        var distance = getDistance(point1, point2);
        if (distance > 0) {
            unitVector = scaleVector(translatedVector, 1/distance );
        } else { // abort. can't divide by 0. Make something up instead.
            unitVector = translatedVector;
            if ( debug) {log("trying to normalize a vector where the distance is zero. Can't divide by zero.");}
        }



        if (debug) { log("unitVector is: " + unitVector); }

        if (debug) { log("leaving normalizeVector with: " + unitVector); }
        return unitVector;

    };

    var getDistance = function distanceGetter(point1, point2) {
        // distance is squareroot of the squared sum of each side
        //if (debug) { log("entering getDistance with " + point1 + ", " + point2); }
        var xDist = Math.abs(point2[0] - point1[0]);
        var xDistSquared = Math.pow(xDist, 2);
        var yDist = Math.abs(point2[1] - point1[1]);
        var yDistSquared = Math.pow(yDist, 2);
        var distance = Math.sqrt(xDistSquared + yDistSquared);
        //if (debug) { log("returning from getDistance with " + distance); }
        return distance;
    };

	var checkInstall = function() {
		log(info.name + " v" + info.version + " installed.");
	};
	
	var registerEventHandlers = function() {
		log(info.name + " listening."); 
	};
	
    return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers,
        AddVectors: addVectors,
        ScaleVector: scaleVector,
        GetDistance: getDistance,
        NormalizeVector: normalizeVector

    };


}()); // End of Module: psMath
