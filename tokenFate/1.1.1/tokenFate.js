// Github:   https://github.com/dedurrett/
// By:       David E. Durrett Jr. (Bugfixes by The Aaron)kkjj
// Contact:  https://app.roll20.net/users/76/davemania
// API Commands:
// !token-fate   - Execute while you have a group of tokens selected for best results
// !token-fate-w - Execute while you have a group of tokens selected for best results whispered to the GM!
// Both of the above commands will now accept a single integer or inline roll argument! Tokens equal to the number passed can now suffer the same fate!

var TokenFate = TokenFate || (function() {
    'use strict';

    var version = '1.1.1',
    lastUpdate = 1588184063,
    multiFate = 1,
    msgStart = "",
    selectedToken = "",

    checkInstall = function() {
        log('TokenFate v'+version+'  ['+(new Date(lastUpdate*1000))+']');
    },
    // Line Feed character is sometimes replaced at end of line 19: &#10;
    outputSelectedToken = function (tokenName) {
        if (msgStart=="") { sendChat("", "/desc "); }
        sendChat("", msgStart + "<div style='width: 100%; color: #D1B280; border: 1px solid #594D46; background-color: #080706; box-shadow: 0 0 15px #594D46; display: block; text-align: center; font-size: 20px; font-weight: bold; padding: 5px 0; margin-bottom: 0.25em; font-family: Garamond; white-space: pre-wrap;'>Fate has chosen:&#10;" + tokenName + "</div>");
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
            if (multiFate>1) {
                multiFate--;
                randomSelection(_.without(tokens,tokens[i]));
            }
        }
        else {
            outputSelectedToken("No Token");
            multiFate=1;
        }
    },

    handleMessages = function(msg_orig)
    {
        if('api' !== msg_orig.type ) {
            return;
        }
        let msg = _.clone(msg_orig);

        //This sorcery shamelessly taken from The Aaron's Ammo script
        if(_.has(msg,'inlinerolls')){
            msg.content = _.chain(msg.inlinerolls)
            .reduce(function(m,v,k){
                m['$[['+k+']]']=v.results.total || 0;
                return m;
            },{})
            .reduce(function(m,v,k){
                return m.replace(k,v);
            },msg.content)
            .value();
        }

        var args = msg.content.split(/\s+/),
        objs;

        switch(args[0])
        {
            case '!token-fate':
                msgStart= "";
                break;
            case '!token-fate-w':
                msgStart= "/w gm ";
                break;
        }

        if (args.length > 1) {
            if (Number.isInteger(Number(args[1]))) { 
                multiFate=Number(args[1]);
            }
        }

        if (args.shift().includes("!token-fate")) {
            objs = _.chain(msg.selected)
            .map(function(o){
                return getObj(o._type,o._id);
            })
            .reject(_.isUndefined)
            .value();
            randomSelection(objs);
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
