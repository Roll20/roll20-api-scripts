/**
 * If a player or GM uses the `!flip' command, all graphics they have selected
 * will flip horizontally. Try creating a macro button for this and making it
 * visible to all players!
 */
on('chat:message', function(msg) {
    if(msg.type == 'api' && msg.selected && msg.content.indexOf('!flip') == 0)
    {
        var selectedObjs = msg.selected;
        _.each(selectedObjs, function(obj) {
            if(obj._type == 'graphic')
            {
                var token = getObj('graphic', obj._id);
                token.set('fliph', !token.get('fliph'));
            }
        });
    }
});