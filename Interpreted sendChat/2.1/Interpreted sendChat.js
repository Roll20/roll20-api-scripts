/**
 * Sends a message to the chat as the same person who triggered a chat:message
 * event. In other words, if you're speaking out of character, the message will
 * be sent as you, and if you're speaking in-character, the message will be sent
 * as the character you have selected.
 * 
 * Useful for sending messages on behalf of the player/character in response to
 * an API command.
 * 
 * Example:
 
on('chat:message', function(msg) {
    if (msg.type === 'api') {
        bshields.sendChat(msg, 'Hello World');
    }
});

 */
var bshields = bshields || {};
bshields.sendChat = (function() {
    'use strict';
    
    var version = 2.1;
    
    function interpretedSendChat(chatMsg, message) {
        var who = chatMsg.who,
            speaking = _.sortBy(filterObjs(function(obj) { return obj.get('type') === 'character' && obj.get('name').indexOf(who) >= 0; }),
                                function(chr) { return chr.get('name').toLowerCase().levenshteinDistance(who.toLowerCase()); })[0];
        
        sendChat(speaking ? 'character|' + speaking.id : 'player|' + chatMsg.playerid, message);
    }
    
    return interpretedSendChat;
}());
