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
        var wings = '';
        while(height > 0)
        {
            // get current digit, starting from ones
            var digit = height / 10;
            digit -= Math.floor(digit);
            digit = Math.round(digit * 10);
            // shift height
            height = Math.floor(height / 10);
            wings += 'fluffy-wing@'+digit+',';
        }
        if(wings.length > 0) wings = wings.substring(0, wings.length - 1); // trim trailing comma
        var markers = tok.get('statusmarkers');
        if(markers != '') markers += ',';
        markers += wings;
        tok.set('statusmarkers', markers);
    });
});