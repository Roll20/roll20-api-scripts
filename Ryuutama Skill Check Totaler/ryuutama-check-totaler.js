on("chat:message", function(msg) {
    if (msg.type == "general" && msg.rolltemplate == 'skillCheck' || msg.rolltemplate == 'accuracyCheck') {
        var total = 0;
        _.each(msg.inlinerolls, function(roll) {
            total += roll.results.total;
        });
        sendChat(msg.who, "<span style='font-weight:bold;font-size:1.1em;'>Total: <span style='background-color:#FEF68E;border:2px solid #FEF68E;padding:0 3px 0 3px;'>" + total + "</span></span>");
    }
});
