/**
 * Mark a token with !mark @{target|token_id} status type
 * Unmark a token with  !unmark @{target|token_id} status type
 * Clear all statusmarkers on a token with  !clearmark @{target|token_id}
 * 
 * `status` can be a statusmarker name or a D&D 4e condition. `type` can be a
 * D&D 4e damage type. `type` is only necessary when `status` is "ongling",
 * "damage", or "dam". If `type` is omitted for these statuses, an "untyped
 * damage" icon will be used.    
 */
var bshields = bshields || {};
bshields.conditions = (function() {
    'use strict';
    
    var version = 3.3,
        commands = {
            mark: function(args, msg) {
                var tok = getTokenMark(args[0], args[1], args[2]);
                
                if (tok) {
                    tok.target.set('status_' + tok.marker, true);
                }
            },
            clearmark: function(args, msg) {
                var target = getObj('graphic', args[0]);
                
                if (!target) {
                    sendChat('ERROR', '/w ' + msg.who + ' Please specify a token to mark with @{target|token_id} or @{selected|token_id}.');
                    return;
                }
                
                target.set('statusmarkers', '');
            },
            unmark: function(args, msg) {
                var tok = getTokenMark(args[0], args[1], args[2]);
                
                if (tok) {
                    tok.target.set('status_' + tok.marker, false);
                }
            },
            help: function(command, args, msg) {
                if (_.isFunction(commands['help_' + command])) {
                    commands['help_' + command](args, msg);
                }
            }
        };
    
    function handleInput(msg) {
        var isApi = msg.type === 'api',
            args = msg.content.trim().splitArgs(),
            command, arg0, isHelp;
        
        if (isApi) {
            command = args.shift().substring(1).toLowerCase();
            arg0 = args.shift() || '';
            isHelp = arg0.toLowerCase() === 'help' || arg0.toLowerCase() === 'h';
            
            if (!isHelp) {
                if (arg0 && arg0.length > 0) {
                    args.unshift(arg0);
                }
                
                if (_.isFunction(commands[command])) {
                    commands[command](args, msg);
                }
            } else if (_.isFunction(commands.help)) {
                commands.help(command, args, msg);
            }
        } else if (_.isFunction(commands['msg_' + msg.type])) {
            commands['msg_' + msg.type](args, msg);
        }
    }
    
    function registerEventHandlers() {
        on('chat:message', handleInput);
    }
    
    function getTokenMark(tokenid, status, damageType) {
        var marker = 'purple',
            target = getObj('graphic', tokenid);
        
        if (!target) {
            sendChat('ERROR', '/w ' + msg.who + ' Please specify a token to mark with @{target|token_id} or @{selected|token_id}.');
            return;
        }
        
        if (status) {
            status = status.toLowerCase();
            switch (status) {
                case 'blinded':
                case 'blind':
                    marker = 'bleeding-eye';
                    break;
                case 'dazed':
                case 'daze':
                    marker = 'pummeled';
                    break;
                case 'deafened':
                case 'deaf':
                    marker = 'screaming';
                    break;
                case 'dominated':
                case 'dominate':
                    marker = 'chained-heart';
                    break;
                case 'immobilized':
                case 'immobile':
                case 'immob':
                    marker = 'fishing-net';
                    break;
                case 'marked':
                case 'mark':
                    marker = 'purple';
                    break;
                case 'petrified':
                case 'petrify':
                case 'stone':
                    marker = 'white-tower';
                    break;
                case 'prone':
                    marker = 'back-pain';
                    break;
                case 'restrained':
                    marker = 'aura';
                    break;
                case 'slowed':
                case 'slow':
                    marker = 'snail';
                    break;
                case 'stunned':
                case 'stun':
                    marker = 'lightning-helix';
                    break;
                case 'weakened':
                case 'weak':
                    marker = 'broken-heart';
                    break;
                case 'ongoing':
                case 'damage':
                case 'dam':
                    if (damageType) {
                        damageType = damageType.toLowerCase();
                        switch (damageType) {
                            case 'acid':
                                marker = 'chemical-bolt';
                                break;
                            case 'cold':
                                marker = 'frozen-orb';
                                break;
                            case 'fire':
                                marker = 'half-haze';
                                break;
                            case 'force':
                                marker = 'blue';
                                break;
                            case 'lightning':
                                marker = 'edge-crack';
                                break;
                            case 'necrotic':
                                marker = 'death-zone';
                                break;
                            case 'poison':
                                marker = 'skull';
                                break;
                            case 'psychic':
                                marker = 'pink';
                                break;
                            case 'radiant':
                                marker = 'angel-outfit';
                                break;
                            case 'thunder':
                                marker = 'yellow';
                                break;
                            default:
                                sendChat('System', '/w ' + msg.who + ' No damage type called ' + damageType +
                                    '. If the damage has no type, do not include a type.');
                                return;
                        }
                    } else {
                        marker = 'all-for-one';
                    }
                    break;
                case 'dying':
                case 'helpless':
                case 'unconscious':
                case 'insubstantial':
                case 'surprised':
                    sendChat('ERROR', '/w ' + msg.who + ' The ' + status +
                        ' status is not implemented for the !mark command.');
                    return;
                default:
                    marker = status;
                    break;
            }
        }
        
        return { marker: marker, target: target };
    }
    
    return {
        registerEventHandlers: registerEventHandlers
    };
}());

on('ready', function() {
    'use strict';
    
    bshields.conditions.registerEventHandlers();
});
