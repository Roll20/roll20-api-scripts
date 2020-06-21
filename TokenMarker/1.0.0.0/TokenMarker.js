var TokenMarker = TokenMarker || (function() {
    'use strict';
    var version = "1.0.0.0";
    var lastUpdate = new Date(2020, 6, 10, 15, 49, 0, 0);
    var tokenMarkers = "{}", obj, currentMarkers,

	checkInstall = function() {
            log('-=> TokenMarker v'+version+' <=-  [' + lastUpdate + ']');
	    tokenMarkers = JSON.parse(Campaign().get("token_markers"));
	},
	registerEventHandlers = function() {
            on('chat:message', handleInput);
	},
	getChatMessageFromTokenMarkers = function(markers) {
            let chatMessage = '';
            _.each(markers, marker => {
		chatMessage += `<p><img src='${marker.url}'> ${marker.id}: ${marker.name}</p>`;
            });
            return chatMessage;
	},
	getMarkerData = function(markerName) {
            var markerData = null;
            if ((markerName == "") || (markerName == null)) {
		return null;
            }
            _.each(tokenMarkers, marker => {
		if (marker.name.toLowerCase() == markerName.toLowerCase()) {
		    markerData = marker;
		}
            });
            return markerData;
	},
	getMarkerString = function(markerName) {
            var markerData = getMarkerData(markerName);
            if (markerData == null) {
		return "";
            }
            var markerString =  markerData.name + "::" + markerData.id;
            return markerString;
	},
	infoLog = function(msg) {
	    sendChat("TokenMarker", msg);
	},
	errorLog = function(msg) {
	    var badmsg = "<div style='color:#600;'>" + msg + "</div>";
	    sendChat("TokenMarker", badmsg);
	},
	handleInput = function(msg_orig) {
            var msg = (msg_orig);
            var cmd = msg.content.split(" ")[0].toLowerCase();
            var contentParts = msg.content.split(" ");
            var selectedObj = ((msg.selected != null) && (msg.selected.length > 0) && (msg.selected[0]._type == "graphic")) ? msg.selected[0] : null;
            if(cmd === '!markernames') {
		let chatMessage = getChatMessageFromTokenMarkers(tokenMarkers);
		infoLog( chatMessage);
            } else if (cmd == "!markerhelp") {
		var msg = "<p>The following commands related to setting markers on tokens are available...</p>";
		msg += "<ul>";
		msg += "<li><b>Usage:</b> markernames</li>";
		msg += "<li><b>Usage:</b> markerids markername</li>";
		msg += "<li><b>Usage:</b> marktoken tokenid markername</li>";
		msg += "<li><b>Usage:</b> markselected markername</li>";
		msg += "<li><b>Usage:</b> unmarkselected [markername]</li>";
		msg += "<li><b>Usage:</b> unmarktoken tokenid [markername]</li>";
		msg += "<li><b>Usage:</b> gettokenmarkers</li>";
		msg += "</ul>";
		infoLog( msg);
		
            } else if(cmd === '!markerids') {
		if (contentParts.length < 2) {
		    errorLog("<b>Usage:</b> markerids markername");
		    return;
		}
		const markerName = msg.content.split(" ")[1].toLowerCase();
		let results = [];
		_.each(tokenMarkers, marker => {
                    if(marker.name.toLowerCase() === markerName) results.push(marker);
		});
		log(results);
		let chatMessage = getChatMessageFromTokenMarkers(results);
		chatMessage = chatMessage || 'Unable to find any matching token markers'
		infoLog( chatMessage);
            } else if(cmd === '!marktoken') {
		
		if (contentParts.length < 3) {
                    errorLog( "<b>Usage:</b>marktoken tokenid markername");
                    return;
		}
		var tokenid = contentParts[1];
		var markerName = contentParts[2].toLowerCase();
		obj = getObj('graphic', tokenid);
		if (obj == null) {
                    errorLog( "No token with id (" + tokenid + ") could be found");
                    errorLog( "<b>Usage:</b>marktoken tokenid markername");
                    return;
		}
		var markerObj = getMarkerData(markerName);
		if (markerObj == null) {
                    errorLog( "Invalid marker name (" + markerName + ")");
                    errorLog( "<b>Usage:</b>marktoken tokenid markername");
                    return;
		}
		var markerString = getMarkerString(markerName);
		var totalMarkers = obj.get("statusmarkers");
		if (totalMarkers.indexOf(markerString) >= 0) {
                    return;
		}
		var separateMarkers = totalMarkers.split(',');
		separateMarkers.push(markerString);
		obj.set("statusmarkers", separateMarkers.join(','));
		
            } else if(cmd === '!markselected') {
		
		if (contentParts.length < 2) {
                    errorLog( "Too few arguments");
                    errorLog( "<b>Usage:</b>markselected markername");
                    return;
		}
		var markerName = (contentParts.length > 1) ? contentParts[1].toLowerCase() : "";
		if (selectedObj == null ) {
                    errorLog( "No tokens selected");
                    errorLog( "<b>Usage:</b>markselected markername");
                    return;
		}
		var markerObj = getMarkerData(markerName);
		if (markerObj == null) {
                    errorLog( "Invalid marker name");
                    errorLog( "<b>Usage:</b>markselected markername");
                    return;
		}
		var markerString = getMarkerString(markerName);
		_.each(msg.selected, tok => {
                    obj = getObj(tok._type, tok._id);
                    var totalMarkers = obj.get("statusmarkers");
                    if (totalMarkers.indexOf(markerString) < 0) {
			var separateMarkers = totalMarkers.split(',');
			separateMarkers.push(markerString);
			obj.set("statusmarkers", separateMarkers.join(','));
                    }
		});
		
            } else if (cmd === '!unmarkselected') {
		
		var markerName = (contentParts.length > 1) ? contentParts[1].toLowerCase() : "";

		if (selectedObj == null) {
                    errorLog( "Tokens need to be selected");
                    errorLog( "<b>Usage:</b>unmarkselected [markername]");
                    return;
		}
		var markerString = getMarkerString(markerName);
		_.each(msg.selected, tok => {
                    obj = getObj(tok._type, tok._id);
                    if (markerString == "") {
			obj.set("statusmarkers","");
                    } else {
			var statusMarkerString = obj.get("statusmarkers");
			var newMarkerString = statusMarkerString.replace(markerString,"");
			obj.set("statusmarkers", newMarkerString);
                    }
		});
            } else if (cmd === '!unmarktoken') {
		
		if (contentParts.length < 2) {
                    errorLog( "Too few arguments");
                    errorLog( "<b>Usage:</b>unmarktoken tokenid [markername]");
                    return;
		}
		var tokenid = contentParts[1];
		var markerName = (contentParts.length > 2) ? contentParts[2].toLowerCase() : "";

		obj = getObj('graphic', tokenid);
		if (obj == null) {
                    errorLog( "Invalid token id");
                    errorLog( "<b>Usage:</b>unmarktoken tokenid [markername]");
                    return;
		}
		var markerString = getMarkerString(markerName);
		if (markerString == "") {
                    obj.set("statusmarkers","");
		} else {
                    var statusMarkerString = obj.get("statusmarkers");
                    var newMarkerString = statusMarkerString.replace(markerString,"");
                    obj.set("statusmarkers", newMarkerString);
		}
            } else if(cmd === '!gettokenmarkers') {
		if (selectedObj == null) {
                    errorLog( "gettokenmarkers requires a token to be selected");
                    errorLog( "<b>Usage:</b>gettokenmarkers");
                    return;
		}
		obj = getObj(selectedObj._type, selectedObj._id);
		currentMarkers = obj.get("statusmarkers");
		if ((currentMarkers == "") || (currentMarkers == null)) {
                    infoLog( "No markers for selected token");
                    return;
		}
		infoLog( currentMarkers);
            }
	};
    return {
	CheckInstall: checkInstall,
	RegisterEventHandlers: registerEventHandlers
    };
})();
on("ready",function(){
    'use strict';
    TokenMarker.CheckInstall();
    TokenMarker.RegisterEventHandlers();
});
