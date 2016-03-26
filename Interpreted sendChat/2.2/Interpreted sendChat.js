var bshields = bshields || {};
bshields.sendChat = (function() {
    'use strict';
    
    var version = 2.2;
    
    function interpretedSendChat(chatMsg, message) {
        var who = chatMsg.who,
            speaking = _.sortBy(filterObjs(function(obj) { return obj.get('type') === 'character' && obj.get('name').indexOf(who) >= 0; }),
                                function(chr) { return chr.get('name').toLowerCase().levenshteinDistance(who.toLowerCase()); })[0];
        
        sendChat(speaking ? 'character|' + speaking.id : 'player|' + chatMsg.playerid, message);
    }
    
    return interpretedSendChat;
}());
