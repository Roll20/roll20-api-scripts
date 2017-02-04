


var psUtils = function plexsoupUtils() {


	var whisper = function chatMessageSender(playerName, message) {
		// sends a chat message to a specific player. Can use gm as playerName
		//sendChat(playerName, '/w ' + playerName + " " + message);
		sendChat("psIsoTravellers", '/w ' + playerName + " " + message);
	};

	var ch = function (c) {
		// This function will take a single character and change it to it's equivalent html encoded value.
		// psNote: I tried alternate methods of regexps to encode the entire string, but I always ran into problems with | and [] characters.
		var entities = {
			'<' : 'lt',
			'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	};

	var inString = function stringFinder(stringToSearch, textToLookFor) {
		if (!stringToSearch || !textToLookFor) {
			log("==> Error: inString() missing params" + stringToSearch + ", " + textToLookFor);
			return undefined;
		}
		if ( stringToSearch.indexOf(textToLookFor) == -1 ) {
			return false;
		} else {
			return true;
		}
	};
	
	var makeButton = function buttonMakerForChat(title, command) { // expects two strings. Returns encoded html for the chat stream
		var output="";

			output += '['+title+']('+command+')';

		return output;
	};	

	// Another module. This one for fun math. Adding and subtracting vectors, Distance, etc.
	var debugDEFCON = 5; // 5 = AOK: log nothing. 1 = FUBAR: log everything

	var getLongestVectorLength = function longestVectorGetter(vectorList) {
		// **** why is this returning a length of 3 for two dimensional vectors?

		if (debugDEFCON < 2) { log("entering getLongestVectorLength with: " + vectorList); }

		if (vectorList.length == 2) {
			if ( _.isNumber(vectorList[0]) ) {
				log("aborting getLongestVectorLength(" + vectorList + "). I think we got one vector (a single x,y location) instead of a list of vectors.");
				return(2);
			}
		} else {
			if (debugDEFCON<2) {log("vectorList.length = " + vectorList);}
		}

		var longestVectorLength = 0;


		_.each(vectorList, function loopToFindLongest(vector) {
			if (vector.length > longestVectorLength) {
				longestVectorLength = vector.length;
			}
		});

		if (debugDEFCON < 3) {
			log("getLongestVectorLength returning with: " + longestVectorLength);
		}

		return longestVectorLength;

	};

	var initializeVector = function vectorInitialiser(lengthRequired) {
		if (debugDEFCON < 2) { log("initializeVector called with " + lengthRequired); }
		var newVector = [];
		var elementID;
		for(elementID = 0; elementID < lengthRequired; elementID++) {
			newVector.push(0);
		}
		if (debugDEFCON < 2) { log("initializeVector returning with " + newVector); }
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

		if ( debugDEFCON < 2 ) { log("addVectors called with: " + listOfVectors); }

		var longestVectorLength = getLongestVectorLength(listOfVectors);
		var sumVector = initializeVector(longestVectorLength);




		var elementID = 0;
		var vectorNumber = 0;
		for(elementID=0; elementID<longestVectorLength; elementID++) {
			for(vectorNumber=0; vectorNumber<listOfVectors.length; vectorNumber++ ) {
				sumVector[elementID] += Number(listOfVectors[vectorNumber][elementID]);

			}
		}

		if (debugDEFCON < 3) {
			log("addVectors returning with: " + sumVector);
		}

		if ( debugDEFCON < 2 ) { log("addVectors returning " + sumVector); }
		return sumVector;

	};

	var scaleVector = function vectorExpander(vector, scalar) {
		if (debugDEFCON < 2) {
			log("scaleVector called with " + vector + ", " + scalar );
		}
		var newVector = _.map(vector, function scaleElement(elementValue) {
			return elementValue * scalar;
		});
		if (debugDEFCON < 2) {
			log("scaleVector returning with " + newVector );
		}
		return newVector;
	};

	var normalizeVector = function vectorNormalizer(point1, point2) { // expecting a list of 2 points [x1,y2], [x2,y2]
		if (debugDEFCON < 2) { log("entering normalizeVector with: " + point1 + ", " + point2); }

		var unitVector;
		var translatedVector = addVectors( [point2, scaleVector(point1, -1)] );

		var distance = getDistance(point1, point2);
		if (distance > 0) {
			unitVector = scaleVector(translatedVector, 1/distance );
		} else { // abort. can't divide by 0. Make something up instead.
			unitVector = translatedVector;
			if ( debugDEFCON<2) {log("trying to normalize a vector where the distance is zero. Can't divide by zero.");}
		}



		if (debugDEFCON < 2) { log("unitVector is: " + unitVector); }

		if (debugDEFCON < 2) { log("leaving normalizeVector with: " + unitVector); }
		return unitVector;

	};

	var getDistance = function distanceGetter(point1, point2) {
		// distance is squareroot of the squared sum of each side
		//if (debugDEFCON < 2) { log("entering getDistance with " + point1 + ", " + point2); }
		var xDist = Math.abs(point2[0] - point1[0]);
		var xDistSquared = Math.pow(xDist, 2);
		var yDist = Math.abs(point2[1] - point1[1]);
		var yDistSquared = Math.pow(yDist, 2);
		var distance = Math.sqrt(xDistSquared + yDistSquared);
		//if (debugDEFCON < 2) { log("returning from getDistance with " + distance); }
		return distance;
	};

	var getCurrentPage = function currentPageGetter(tokenObjOrPlayerID) { // expects token, playerID, or string=="gm"
	// **** TODO **** This isn't working as expected. Go through it and check assertions.
	
		if ( debugDEFCON < 5) { log( "entering getCurrentPage with " + tokenObjOrPlayerID ); }
		var currentPage;
		var playerID;
		var playerObj;
		var gmID = getGameMasterID();
		if ( debugDEFCON < 5) {
			log("   gmID = " + gmID);
		}

		if (tokenObjOrPlayerID === undefined ) { // getCurrentPage received bad parameters, but we'll take care of it.
			log("==> Error in getCurrentPage. tokenObjOrPlayerID == undefined"); 
			return Campaign().get("playerpageid");
			
		} else if ( tokenObjOrPlayerID == "gm") {
			tokenObjOrPlayerID = gmID;
			if (gmID) {
				// currentPage = getObj("player", gmID).get("lastpage");			
				return Campaign().get("playerpageid");
			} else {
				return Campaign().get("playerpageid");				
			}			
		
			
			
		} else if ( _.isString(tokenObjOrPlayerID) ) { // it's a player ID
			if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was a string. Assume player_id: " + tokenObjOrPlayerID); }
			playerID = tokenObjOrPlayerID;
			playerObj = getObj("player", playerID);
			
			if (playerIsGM(playerID)) { // it's the GM, use the lastpage property to find their page
				if (debugDEFCON < 4) { 
					log("    player_id is a GM");
					log("    playerObj.get('lastpage') returns " + playerObj.get("lastpage") );
					//log("    Campaign().get('playerpageid') returns " + Campaign().get("playerpageid") );
				}
				
				currentPage = playerObj.get("lastpage"); // NOTE: there's no lastpage unless the GM has been on another page
				
			} else if ( Campaign().get("playerspecificpages")[playerID] ) {
				if ( debugDEFCON < 4 ) { 
					log("    player_id is not a GM, and the players are seperated onto different pages"); 
					log("    playerspecificpages = " + Campaign().get("playerspecificpages") );
				}
				
				
				// Note: there's no playerspecificpages unless a single player name is dragged onto another map
				currentPage = Campaign().get("playerspecificpages")[playerID];

			} else { // it's a player and the players are all on one page.
				if (debugDEFCON < 4) { log("    player_id is not a GM, but there's only one page"); }
				currentPage = Campaign().get("playerpageid");				
			}
		} else if ( _.isObject(tokenObjOrPlayerID) ) { // it's a token
			if (debugDEFCON < 4) { log("    tokenObjOrPlayerID was an object. Assume token: " + JSON.stringify(tokenObjOrPlayerID) ); }
			var token = tokenObjOrPlayerID;
			currentPage = token.get("page_id");
		}
		
		if (debugDEFCON < 4) { log("exiting getCurrentPage. Returning " + currentPage ); } 
		
		return currentPage;
	};

	
	
	return {
		AddVectors: addVectors,
		ScaleVector: scaleVector,
		GetDistance: getDistance,
		NormalizeVector: normalizeVector,
		GetCurrentPage: getCurrentPage

	};
	


}()); // end module


