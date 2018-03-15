/* Colored Chat Dividers
** This script makes colored dividers in chat, to differentiate between players. The diviers are colored the same as the color chosen by the player whose message precedes the divider.
** There are no options in the script, only include / don't include
** Version 1.0, last updated 5/27/2017
*/
on("chat:message", function(msg) {
    var pid = msg.playerid;
    var player = getObj("player", pid);
    try{
        sendChat(msg.who, '<div style="color: ' + player.get('color') + '; background-color:' + player.get('color') + ';">Divider</div>');
    }catch(e){}
});