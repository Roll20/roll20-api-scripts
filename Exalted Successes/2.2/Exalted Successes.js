var bshields = bshields || {};
bshields.exalted = (function() {
    'use strict';
    
    var version = 2.2;
    
    function handleInput(msg) {
        var json = msg.type === 'rollresult' ? JSON.parse(msg.content) : null,
            inline = !!msg.inlinerolls,
            results = [],
            successes = 0,
            botches = 0;
        
        if (json) {
            _.each(json.rolls, function(roll) {
                if (roll.sides !== 10) { return; }
                results.push(roll.results);
            });
        } else if (inline) {
            _.each(msg.inlinerolls, function(rolldata) {
                _.each(rolldata.results.rolls, function(roll) {
                    if (roll.sides !== 10) { return; }
                    results.push(roll.results);
                });
            });
        }

        if (results.length === 0) {
            return;
        }
        
        _.each(results, function(roll) {
            _.each(roll, function(die) {
                var value = die['v'];
                successes += value >= 7 ? 1 : 0;
                successes += value === 10 ? 1 : 0;
                botches += value === 1 ? 1 : 0;
            });
        });
        
        if (successes === 0 && botches > 0) {
            bshields.sendChat(msg, botches + ' botch' + (botches > 1 ? 'es' : ''))
        } else if (successes === 0) {
            bshields.sendChat(msg, 'Failure');
        } else {
            bshields.sendChat(msg, successes + ' success' + (successes > 1 ? 'es' : ''));
        }
    }
    
    function registerEventHandlers() {
        on('chat:message', handleInput);
    }
    
    return {
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.exalted.registerEventHandlers();
});