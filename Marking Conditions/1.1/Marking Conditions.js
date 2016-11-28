/**
 * Provides commands for marking enemies.
 */
var conditions = conditions || {};
conditions.markingCharacters = [];
on("chat:message", function(msg) {
    if(msg.type != 'api' || msg.content.toLowerCase().indexOf('!mark') != 0) return;
    
    var args = msg.content.toLowerCase().split(' ');
    args.shift();
    
    var mark = 'purple'; // default to defender's "mark" condition
    if(args[1]) switch(args[1])
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
            if(args[2]) switch(args[2])
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
    
    var so = msg.selected || {};
    var tgtList = conditions.targetList(args[0], so, msg.who);
    if(mark == 'none') conditions.unmarkTokens(tgtList, msg.who);
    else conditions.markTokens(tgtList, msg.who, mark);
});

/**
 * Parses the input to search for tokens which need to be marked (or unmarked).
 * The tokens are returned as an array. The descriptor begins with an
 * exclamation point to differentiate it from polling a single token, and is a
 * comma-separated set of key=value pairs. All pairs will be true for each
 * token selected. For example, !distance=<1,controlledby=none,bar1=<.5 would
 * find only those tokens which are within 1 square of the currently selected
 * token, are controlled by nobody (ie, NPCs), and have 50% or less remaining
 * on bar1.
 * 
 * all                  All tokens on the current page
 * distance=N           A token exactly N squares from the currently selected token
 * distance=<N          A token N squares or less from the currently selected token
 * distance=>N          A token N squares or more from the currently selected token
 * distance=nearest     The nearest token to the currently selected token
 * distance=furthest    The furthest token from the currently selected token
 * controlledby=none    A token not controlled by any player -- generally, the option to use for finding NPCs
 * controlledby=player  A token controlled by the player named `player'
 * bar1=N               A token whose current bar1 value is N
 * bar1=<N              A token whose current bar1 value is N% or less
 * bar1=>N              A token whose current bar1 value is N% or more
 * bar2=N               A token whose current bar2 value is N
 * bar2=<N              A token whose current bar2 value is N% or less
 * bar2=>N              A token whose current bar2 value is N% or more
 * bar3=N               A token whose current bar3 value is N
 * bar3=<N              A token whose current bar3 value is N% or less
 * bar3=>N              A token whose current bar3 value is N% or more
 * 
 * The `distance' options will never return the currently selected token, only
 * other tokens based on their distance from the currently selected token.
 * 
 * The `all' option does not take any value, is ignored if it isn't the first
 * option, and ignores all other options if it's first. It's a loner, used
 * mostly for cleaning things up (eg, !mark !all none to clear all marks on the
 * page).
 * 
 * @param descriptor    arg0 of the user input. This should be either a
 *                      formatted search for tokens, or the name of a single
 *                      token.
 * @param selectedObjs  an array of selected objects
 * @param who           the player to send whispers about errors
 * @return  an array of token objects which will have their statusmarkers modified
 */
conditions.targetList = function(descriptor, selectedObjs, who)
{
    var selected;
    var targets = [];
    
    for(var i = 0; i < selectedObjs.length; i++)
    {
        if(selectedObjs[i]._type == 'graphic')
        {
            var tmp = getObj(selectedObjs[i]._type, selectedObjs[i]._id);
            if(tmp && tmp.get('_subtype') == 'token')
            {
                selected = tmp; // use the first token we find as reference for 'nearest'/'furthest'
                break;
            }
        }
    }
    
    if(descriptor.indexOf('!') == 0) // descriptor describes a group of tokens
    {
        var parts = descriptor.substring(1).split(',');
        var filters = [];
        var error = false;
        
        if(parts[0] == 'all') filters.push(function(tgt) { return true; });
        else parts.forEach(function(kvp) {
            var key = kvp.substring(0, kvp.indexOf('='));
            var value = kvp.substring(kvp.indexOf('=')+1);
            var func;
            
            switch(key)
            {
                case 'distance':
                    if(!selected)
                    {
                        sendChat('ERROR', '/w ' + who + ' There is no token selected.');
                        error = true;
                        return;
                    }
                    var sL = selected.get('left');
                    var sT = selected.get('top');
                    
                    if(value == 'nearest' || value == 'furthest') func = function(tgt) {
                        // near/far can't be decided until after all other filters have run;
                        // using dumy function until then
                        return tgt != selected;
                    };
                    else if(value.indexOf('<') == 0) func = function(tgt) {
                        // find tokens <= value spaces away
                        var squares = (+value.substring(1)) * 70;
                        var distL = Math.abs(sL - tgt.get('left'));
                        var distT = Math.abs(sT - tgt.get('top'));
                        
                        return tgt != selected && distL <= squares && distT <= squares;
                    }
                    else if(value.indexOf('>') == 0) func = function(tgt) {
                        // find tokens >= value spaces away
                        var squares = (+value.substring(1)) * 70;
                        var distL = Math.abs(sL - tgt.get('left'));
                        var distT = Math.abs(sT - tgt.get('top'));
                        
                        return tgt != selected && (distL >= squares || distT >= squares);
                    }
                    else func = function(tgt) {
                        // find tokens exactly value spaces away
                        var squares = (+value) * 70;
                        var distL = Math.abs(sL - tgt.get('left'));
                        var distT = Math.abs(sT - tgt.get('top'));
                        
                        return tgt != selected && ((distL == squares && distT == squares)
                                                || (distL == squares && distT < squares)
                                                || (distL < squares && distT == squares));
                    }
                    break;
                case 'controlledby':
                    if(value == 'none') func = function(tgt) {
                        // find NPC tokens
                        if(tgt.get('_represents') == '')
                            return tgt.get('controlledby') == '';
                        else
                        {
                            var character = getObj('character', tgt.get('_represents'));
                            return character.get('controlledby') == '';
                        }
                    }
                    else func = function(tgt) {
                        // find tokens controlled by value
                        var players = findObjs({_type: 'player', _displayname: value},
                                                {caseInsensitive: true});
                        if(players[0]) return tgt.get('controlledby').indexOf(players[0].id) != -1;
                        players = findObjs({_type: 'player', _displayname: value.replace('-', ' ')},
                                            {caseInsensitive: true});
                        if(players[0]) return tgt.get('controlledby').indexOf(players[0].id) != -1;
                        
                        var characters = findObjs({_type: 'character', name: value},
                                                    {caseInsensitive: true});
                        if(characters[0]) return tgt.get('_represents') == characters[0].id;
                        characters = findObjs({_type: 'character', name: value.replace('-', ' ')},
                                                {caseInsensitive: true});
                        if(characters[0]) return tgt.get('_represents') == characters[0].id;
                        
                        return false;
                    }
                    break;
                case 'bar1':
                case 'bar2':
                case 'bar3':
                    if(value.indexOf('<') == 0) func = function(tgt) {
                        // find tokens with bar# at or below value%
                        var barCur = tgt.get(key+'_value');
                        var barMax = tgt.get(key+'_max');
                        var percent = barCur / barMax;
                        if(barMax == NaN || barCur == NaN) return false;
                        
                        return percent <= (+value.substring(1));
                    }
                    else if(value.indexOf('>') == 0) func = function(tgt) {
                        // find tokens with bar# at or above value%
                        var barCur = tgt.get(key+'_value');
                        var barMax = tgt.get(key+'_max');
                        var percent = barCur / barMax;
                        if(barMax == NaN || barCur == NaN) return false;
                        
                        return percent >= (+value.substring(1));
                    }
                    else func = function(tgt) {
                        // find tokens with bar# at value
                        var barCur = tgt.get(key+'_value');
                        if(barCur == NaN) return false;
                        
                        return barCur == (+value);
                    }
                    break;
                default:
                    sendChat('ERROR', '/w ' + who + ' ' + key + ' is not a valid token filter key.');
                    return;
            }
            
            filters.push(func);
        });
        
        if(error) return [];
        
        targets = filterObjs(function(obj) {
            if(obj.get('_pageid') != Campaign().get('playerpageid')) return false;
            if(obj.get('_type') != 'graphic') return false;
            if(obj.get('_subtype') != 'token') return false;
            
            var matchAll = filters.length > 0;
            filters.forEach(function(f) {
                if(!matchAll) return;
                if(!f(obj)) matchAll = false;
            });
            
            return matchAll;
        });
        
        // if we have distance=nearest or distance=furthest, trim `targets' as appropriate
        // do nothing if $selected is null
        if(selected)
        parts.forEach(function(kvp) {
            var key = kvp.substring(0, kvp.indexOf('='));
            var value = kvp.substring(kvp.indexOf('=')+1);
            
            if(key == 'distance')
            {
                var sL = selected.get('left');
                var sT = selected.get('top');
                    
                if(value == 'nearest')
                {
                    var minDist = -1;
                    var toKeep = [];
                    targets.forEach(function(tgt) {
                        var distL = Math.abs(tgt.get('left') - sL);
                        var distT = Math.abs(tgt.get('top') - sT);
                        
                        var distance = Math.max(distL, distT);
                        if(minDist == -1 || minDist > distance)
                        {
                            toKeep = [tgt];
                            minDist = distance;
                        }
                        else if(minDist == distance)
                        {
                            toKeep.push(tgt);
                        }
                    });
                    
                    targets = toKeep;
                }
                else if(value == 'furthest')
                {
                    var maxDist = -1;
                    var toKeep = [];
                    targets.forEach(function(tgt) {
                        var distL = Math.abs(sL - tgt.get('left'));
                        var distT = Math.abs(sT - tgt.get('top'));
                        
                        var distance = Math.max(distL, distT);
                        if(maxDist == -1 || maxDist < distance)
                        {
                            toKeep = [tgt];
                            maxDist = distance;
                        }
                        else if(maxDist == distance)
                        {
                            toKeep.push(tgt);
                        }
                    });
                    
                    targets = toKeep;
                }
            }
        });
    }
    else // descriptor is a token name
    {
        var target = findObjs({
            _type: 'graphic',
            name: descriptor,
            _pageid: Campaign().get('playerpageid')
        }, {caseInsensitive: true})[0];
        if(!target)
        {
            sendChat('ERROR', '/w ' + who + ' Cannot find a token named ' + args[0] + '.');
            return;
        }
        
        targets.push(target);
    }
    
    return targets;
}

/**
 * Marks all given targets and keeps track of who marked it.
 * 
 * @param targets   an array of target token objects to mark
 * @param character the character performing the mark
 * @param mark      optional. The type of statusmarker to use for the mark.
 */
conditions.markTokens = function(targets, character, mark)
{
    targets.forEach(function(tgt) { // tgt is a token object
        tgt.set('status_'+mark, true);
    });
}

/**
 * Removes all marks on the target tokens that were placed there by the calling
 * player.
 * 
 * @param targets   an array of target token objects to clean up
 * @param character the player who's removing marks -- only marks placed by the player will be removed
 */
conditions.unmarkTokens = function(targets, character)
{
    targets.forEach(function(tgt) {
        tgt.set('statusmarkers', '');
    });
}