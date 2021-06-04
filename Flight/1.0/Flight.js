on('chat:message', function(msg) {
    if(msg.type != 'api') return;
    var parts = msg.content.toLowerCase().split(' ');
    var command = parts.shift().substring(1);
    var selected = msg.selected;
    if(command != 'fly' || !selected) return; // use the !fly command, and have one or more things selected
    var height = +parts[0];
    if(!height) height = 0; // if no height is returned, treat as 0
    _.each(selected, function(obj) {
        if(obj._type != 'graphic') return; // only fly graphics
        var tok = getObj('graphic', obj._id);
        if(tok.get('subtype') != 'token') return; // don't try to fly cards
        tok.set('status_fluffy-wing', false);
        if(height > 0) tok.set('status_fluffy-wing', ''+height);
    });
});