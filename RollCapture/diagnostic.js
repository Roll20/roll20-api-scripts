// RollCapture Diagnostic — paste this into your Roll20 API sandbox
// Logs EVERYTHING about any roll template message to the console
// Remove when done testing

on('chat:message', function(msg) {
    if (!msg.rolltemplate) return;

    log('=== ROLL DIAGNOSTIC ===');
    log('  type: ' + msg.type);
    log('  who: ' + msg.who);
    log('  playerid: ' + msg.playerid);
    log('  rolltemplate: ' + msg.rolltemplate);
    log('  content: ' + msg.content);
    log('  selected: ' + JSON.stringify(msg.selected || null));

    if (msg.inlinerolls) {
        log('  inlinerolls (' + msg.inlinerolls.length + '):');
        msg.inlinerolls.forEach(function(roll, i) {
            log('    [' + i + ']:');
            log('      expression: ' + roll.expression);
            log('      total: ' + (roll.results ? roll.results.total : 'N/A'));
            log('      type: ' + (roll.results ? roll.results.type : 'N/A'));
            if (roll.results && roll.results.rolls) {
                roll.results.rolls.forEach(function(r, j) {
                    if (r.type === 'R' && r.results) {
                        log('        roll[' + j + ']: ' + r.dice + 'd' + r.sides + ' → [' +
                            r.results.map(function(d) {
                                return d.v + (d.d ? '(dropped)' : '');
                            }).join(', ') + ']');
                    } else if (r.type === 'M') {
                        log('        mod[' + j + ']: ' + r.expr);
                    } else {
                        log('        [' + j + ']: type=' + r.type + ' ' + JSON.stringify(r).slice(0, 100));
                    }
                });
            }
        });
    }

    log('  --- raw msg keys: ' + Object.keys(msg).join(', '));
    log('=== END DIAGNOSTIC ===');
});
