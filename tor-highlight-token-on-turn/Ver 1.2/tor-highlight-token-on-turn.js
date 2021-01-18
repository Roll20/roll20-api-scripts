/* Highlights the token of the current turn order character/mook.
updated by Michael "Aragent" I,
 Modified from https://gist.github.com/rlittlefield/5538171
*/
on('ready', function() {
    jrl_initiative_timer = setInterval(function() {

        var c = Campaign();
        var pre_turnorder = c.get('turnorder');
        var turn_order;

        if (!pre_turnorder) {
            return;
        }

        try {
            turn_order = JSON.parse(c.get('turnorder'));
        } catch (e) {
            log(e);
            return;
        }

        if (!turn_order.length) {
            return;
        }

        var turn = turn_order.shift();
        var current_token = getObj('graphic', turn.id);

        if (current_token) {
            var radius = current_token.get('aura2_radius');

            toFront(current_token);

            if (!radius) {
                current_token.set({
                    'aura2_radius': 1,
                    'aura2_color': '#0000DD',
                    'aura2_square': false
                });
            } else {
                current_token.set({
                    'aura2_radius': 0
                });
            }
        }

        if (turn.id != state.jrl_initiative_last_token && state.jrl_initiative_last_token) {
            var last_token = getObj('graphic', state.jrl_initiative_last_token);
            if (last_token) {
                last_token.set({
                    'aura2_radius': 0
                });
            }
        }

        state.jrl_initiative_last_token = turn.id;

    }, 1000);
});