on('chat:message', function (msg) 
{
    if(msg.inlinerolls)
    {
        var senderName = msg.who;
        var hasRoll = (msg.content.search("Roll") > -1);

        if(hasRoll){
			var totalRolled = getTotalRolled(msg.inlinerolls);
			var stuntPoints = getStuntPoint(msg.inlinerolls);
            
            var rollSummary = getContentProperty ("name", msg)  + "<br>Summary";
            
            var summaryTable = [rollSummary];
            summaryTable.push("Total", createRollHtml(totalRolled));
            
            if (stuntPoints > 0) {
                summaryTable.push("Stunt Points", createRollHtml(stuntPoints));
            }
            
            // add success/failure if a target number is defined
            var tnStr = getContentProperty("TN", msg);
            var hasTn = tnStr !== null;
            if (hasTn) {
                var tn = parseInt(tnStr);
                var isSuccess = totalRolled >= tn;
                if (isSuccess) {
                    summaryTable.push("<span style='color:green'>Success!</span>", "");
                } 
                else if((stuntPoints > 0) && !isSuccess){
                    var temp = summaryTable.pop();
                    var temp2 = summaryTable.pop();
                    summaryTable.push("<span style='color:red'>Failure!</span>", "");
                }
                else {
                    summaryTable.push("<span style='color:red'>Failure!</span>", "");
                }
            }
            
            var htmlString = createHtmlTable.apply(this, summaryTable);
            
			if(msg.type == "whisper") {
				var whisperPrefix = "/w " + msg.target + " ";
				if(senderName.indexOf("(GM)") === -1) {
					var whisperPrefixToSender = "/w " + senderName + " ";
					var chatOutputToSender = whisperPrefixToSender + htmlString;
					sendChat("Summary", chatOutputToSender);
				}
			}
			else {
				var whisperPrefix = "";
			}
			
			var chatOutput = whisperPrefix + htmlString;
			sendChat(senderName, chatOutput);           
		}
    }
});

function getTotalRolled(inlineRolls){
    var total = 0;
    for (var i = 0; inlineRolls.length > i; i ++) {
        total += inlineRolls[i].results.total;
    }
	return total;
}

function getStuntPoint(inlineRolls){
	var firstSet = (inlineRolls[0].results.total == inlineRolls[1].results.total);
	var secondSet = (inlineRolls[0].results.total == inlineRolls[2].results.total);
	var thirdSet = (inlineRolls[1].results.total == inlineRolls[2].results.total);
	
	if( firstSet || secondSet || thirdSet)
		return inlineRolls[2].results.total;
	else
		return 0
}

var createRollHtml = function(value) {
    return "[[" + value + "]]";
};

var createHtmlTable = function(header) {
    var html = "";
    
    html += "<div class='sheet-rolltemplate-default'><table>";
    html += "<caption>" + header + "</caption>";
    
    for (var i = 1; i < arguments.length; i += 2) {
        var name = arguments[i];
        var value = arguments[i + 1] || "";
        
        html += "<tr>";
        html += "<td>" + name + "</td>";
        html += "<td>" + value + "</td>";
        html += "</tr>";
    }
    
    html += "</table></div>";
    
    return html;
};

var getContentProperty = function(property, msg) {
    var regex = new RegExp("\\{\\{" + property + "=([^\\}]+)\\}\\}");
    var results = msg.content.match(regex);
    if (results == null) {
        return null;
    }
    return results[1];
};

var getRollName = function(msg) {
    var regex = new RegExp("\\{\\{name=([^\\}]+)\\}\\}");
    var results = msg.content.match(regex);
    if (results == null) {
        return "";
    }
    return results[1];
};