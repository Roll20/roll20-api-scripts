on('chat:message', function(msg) {
    if(msg.type != 'api') return;
    
    var args = msg.content.split(' ');
    var command = args.shift().toLowerCase().substring(1);
    
    if (!(command == 'mark' || command == 'clearmark' || command == 'unmark')) return;
    if (args.length == 0) {
        sendChat('ERROR', '/w ' + msg.who + ' Please supply a token target with @{target|token_id}');
        return;
    }
    
    var mark = 'purple'; // default to defender's "mark" condition
    if(args[1]) {
        args[1] = args[1].toLowerCase();
        switch(args[1])
        {
            case 'blinded':
            case 'blind':
                mark = 'bleeding-eye';
                break;
            case 'dazed':
            case 'daze':
                mark = 'pummeled';
                break;
            case 'deafened':
            case 'deaf':
                mark = 'screaming';
                break;
            case 'dominated':
            case 'dominate':
                mark = 'chained-heart';
                break;
            case 'immobilized':
            case 'immobile':
            case 'immob':
                mark = 'fishing-net';
                break;
            case 'marked':
            case 'mark':
                mark = 'purple';
                break;
            case 'petrified':
            case 'petrify':
            case 'stone':
                mark = 'white-tower';
                break;
            case 'prone':
                mark = 'back-pain';
                break;
            case 'restrained':
                mark = 'aura';
                break;
            case 'slowed':
            case 'slow':
                mark = 'snail';
                break;
            case 'stunned':
            case 'stun':
                mark = 'lightning-helix';
                break;
            case 'weakened':
            case 'weak':
                mark = 'broken-heart';
                break;
            case 'ongoing':
            case 'damage':
            case 'dam':
                if(args[2]) {
                    args[2] = args[2].toLowerCase();
                    switch(args[2])
                    {
                        case 'acid':
                            mark = 'chemical-bolt';
                            break;
                        case 'cold':
                            mark = 'frozen-orb';
                            break;
                        case 'fire':
                            mark = 'half-haze';
                            break;
                        case 'force':
                            mark = 'blue';
                            break;
                        case 'lightning':
                            mark = 'edge-crack';
                            break;
                        case 'necrotic':
                            mark = 'death-zone';
                            break;
                        case 'poison':
                            mark = 'skull';
                            break;
                        case 'psychic':
                            mark = 'pink';
                            break;
                        case 'radiant':
                            mark = 'angel-outfit';
                            break;
                        case 'thunder':
                            mark = 'yellow';
                            break;
                        default:
                            sendChat('ERROR', '/w ' + msg.who + ' No damage type called ' + args[2]
                                    + '. If the damage has no type, do not include a type!');
                            return;
                    }
                }
                else mark = 'all-for-one'; // untyped ongoing damage
                break;
            case 'dying':
            case 'helpless':
            case 'unconscious':
            case 'insubstantial':
            case 'surprised':
                sendChat('ERROR', '/w ' + msg.who + ' The ' + args[1]
                                + ' status is not implemented for the !mark command.');
                return;
                break;
            default:
                mark = args[1]; // allows for direct status setting
                break;
        }
    }
    
    var target = getObj('graphic', args[0]);
    if (!target) {
        sendChat('ERROR', '/w ' + msg.who + ' Please specify a token to mark with @{target|token_id}.');
        return;
    }
    
    switch (command)
    {
        default:
        case 'mark':
            target.set('status_'+mark, true);
            break;
        case 'unmark':
            target.set('status_'+mark, false);
            break;
        case 'clearmark':
            target.set('statusmarkers', '');
            break;
    }
});