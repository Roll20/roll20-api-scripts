// Github:   https://github.com/dedurrett/
// By:       David E. Durrett Jr.
// Contact:  https://app.roll20.net/users/76/davemania
// API Commands:
// !token-fate - Execute while you have a group of tokens selected for best results
var TokenFate = TokenFate || (function() {
    'use strict';
    
    var version = '1.0.0',
        lastUpdate = 1557259184,
        selectedToken = "",

	checkInstall = function() {
        log('TokenFate v'+version+'  ['+(new Date(lastUpdate*1000))+']');
	},
// Line Feed character is sometimes replaced at end of line 19: &#10;
    outputSelectedToken = function (tokenName) {
        sendChat("", "/desc ");
        sendChat("", "/direct <div style='width: 100%; color: #D1B280; border: 1px solid #594D46; background-color: #080706; box-shadow: 0 0 15px #594D46; display: block; text-align: center; font-size: 20px; font-weight: bold; padding: 5px 0; margin-bottom: 0.25em; font-family: Garamond; white-space: pre-wrap;'>Fate has chosen:&#10;" + tokenName + "</div>");
    },
    
	randomSelection = function (tokens) {
		if( tokens.length ) {
			var i = randomInteger(tokens.length)-1;
            selectedToken = tokens[i].get("name");
            if (selectedToken == null) {
                randomSelection(_.without(tokens,tokens[i]));
			    return;
            }
			if (selectedToken == "") {
			    if (tokens[i].get("represents") != "" && tokens[i].get("represents") != null){
                    selectedToken = getObj("character", tokens[i].get("represents")).get("name");
			    }
			}
			if (selectedToken == "") {
                randomSelection(_.without(tokens,tokens[i]));
			    return;
            }
            outputSelectedToken(selectedToken);
		}
		else {
		    outputSelectedToken("No Token");
		}
	},
    
    handleMessages = function(msg)
    {
		if('api' !== msg.type ) {
			return;
		}
		var args = msg.content.split(/\s+/),
			objs;

		switch(args.shift())
		{
			case '!token-fate':
				objs = _.chain(msg.selected)
					.map(function(o){
						return getObj(o._type,o._id);
					})
					.reject(_.isUndefined)
					.value();
				randomSelection(objs);
				break;
		}
    },

    registerEventHandlers = function(){
        on('chat:message',handleMessages);
    };

	return {
		CheckInstall: checkInstall,
		RegisterEventHandlers: registerEventHandlers
	};
    
}());

on('ready',function(){
	'use strict';

    TokenFate.CheckInstall();
    TokenFate.RegisterEventHandlers();
});
