const HEALTH_DESC = [ 'Unconcious', 'Near Death', 'Badly Injured', 'Injured', 'Barely Injured', 'Uninjured', 'Dead' ];
var health_status = (function(){
    return {
        config: {
            'health_attrib': 'bar1_value',
            'health_max_attrib': 'bar1_max'
        },

        /**
        * find and return the token object for a given token ID.
        */
        getTokenTarget: function(token_id) {
            // this should only return one object, buttttttttttttt...
            var tokens = findObjs({type: 'graphic', subtype: 'token', id: token_id}, true);
            if(tokens.length === 0) return null; // invalid ID/target doesn't exist/clicked on the map.
            return tokens[0]; // return the first token found (it's probably the one we want)
        },

        /**
        * checks if the submitted token has number/non-empty values for supplied attributes.
        */
        checkTokenHealth: function(token) {
            var current = token.get(this.config.health_attrib);
            var max = token.get(this.config.health_max_attrib);

            if (current === '' || max === '' || isNaN(current) || isNaN(max)) {
                return null;
            }
            return current / max;
        },

        respond: function(content) {
            // build the output message to send:
            var output = '/direct \
            <div style="background-color: #ffffee; border-style: solid; border-right-style: none; border-width: 1px; border-left-width: 12px; border-radius: 5px 0px 0px 5px; border-color: #b3b300; border-left-color: #aa80ff; padding: 10px;">' +
            content +
            '</div>';

            sendChat('Health Info', output, null, {noarchive: true});
        }


    };


})();

on('chat:message', function(msg) {
    if (msg.type == 'api') {
        if (msg.content.indexOf('!hp ') !== -1) {
            // trim command off:
            var target = msg.content.replace('!hp ', '');
            // subcommands:
            /* Make this whisper the person that sent it.
            if (target.indexOf('config') !== -1) {
                // show the current config if the user is gm
                if(!playerIsGM(msg.playerid)) {
                    return;
                }
                health_status.respond('<b><big>Current Config:</big></b><br />\
                    Attribute: <code>'+health_status.config.health_attrib+'</code><br />\
                    Max Attribute: <code>'+health_status.config.health_max_attrib+'</code><br />\
                    <br /><b>Setting is currently not supported!</b>');
                    return;
            }*/

            // handle the output!
            var tokenObj = health_status.getTokenTarget(target);
            if (tokenObj === null) health_status.respond('No target found<br /><br />ID: </b>'+target+'</b>');

            var health_val = health_status.checkTokenHealth(tokenObj);
            if (health_val === null) health_status.respond('Who the what now? Your token doesn\'t have the right stats.');

            // check if the token is marked as dead or not and get proper value
            var health_str;
            if (tokenObj.get('status_dead')) {
                health_str = HEALTH_DESC[6];
            }
            else {
                health_str = HEALTH_DESC[(Math.max(Math.min(Math.ceil(health_val * 5), 5), 0))];
            }
            health_status.respond('<b>'+tokenObj.get('name')+'</b> is <b>'+health_str+'</b>');

            //ping the token in question so people know which one is being referred to.
            var pageid = Campaign().get('playerspecificpages');
            if (pageid === false) {
                pageid = Campaign().get('playerpageid');
            } else {
                pageid = pageid[msg.playerid];
            }
            sendPing(tokenObj.get('left'), tokenObj.get('top'), pageid, null, false);
        }
    }
});
