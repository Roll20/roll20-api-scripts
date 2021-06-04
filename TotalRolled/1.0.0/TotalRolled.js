on('chat:message', function (msg) 
{
    if(msg.inlinerolls)
    {
        var characterName = msg.who;
        var hasTest = (msg.content.search("Test") > -1);
        var hasAbility = (msg.content.search("Ability") > -1);
	    var hasFocus = (msg.content.search("Focus") > -1);
	    var hasAttack = (msg.content.search("Attack") > -1);
	    var hasAbilityMod = (msg.content.search("Ability mod") > -1);
	    var hasAim = (msg.content.search("Aim") > -1);
	    var hasIntelligence = (msg.content.search("Intelligence") > -1);
	    var hasArcaneFocus = (msg.content.search("Arcana Focus") > -1);
		var isSkillRoll = (hasTest && hasAbility && hasFocus);
		var isAttackRoll = (hasAttack && hasAbilityMod && hasAim);
		var isMagicRoll = (hasIntelligence && hasArcaneFocus);

        if(isSkillRoll || isAttackRoll || isMagicRoll){
			var totalRolled = getTotalRolled(msg.inlinerolls);
			var stuntPoints = getStuntPoint(msg.inlinerolls);
            
            var rollSummary = getContentProperty ("character_name", msg) + " : " + getContentProperty ("name", msg)  + " Summary";
            
            var summaryTable = [rollSummary];
            summaryTable.push("Total", createRollHtml(totalRolled));
            
            if (stuntPoints > 0) {
                summaryTable.push("Stunt Points", createRollHtml(stuntPoints));
            }
            
            // add success/failure if a target number is defined
            var tnStr = getContentProperty("tn", msg);
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
            
            var chatOutput = htmlString;
            sendChat(characterName, chatOutput);            
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
    
    html += "<div class='sheet-rolltemplate-fantasyage_generic'><table><tbody>";
    html += "<tr><td colspan='2' class='sheet-header'>" + header + "</td></tr>";
    
    for (var i = 1; i < arguments.length; i += 2) {
        var name = arguments[i];
        var value = arguments[i + 1] || "";
        
        html += "<tr>";
        html += "<td>" + name + "</td>";
        html += "<td>"+ value + "</td>";
        html += "</tr>";
    }
    
    html += "</tbody></table></div>";
    
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