// Github:   TBD
// By:       nesuprachy
// Contact:  https://app.roll20.net/users/11071738/nesuprachy
//
// This script sets token markers based on relevant attributes and vice versa
// Works with the DrD2 token marker set, icons must be named `RED`, `BLU`, `GRN`, `VIO`, `BLK`
// Uses TokenMod to set token markers from chat https://wiki.roll20.net/Script:Token_Mod
// Uses ChatSetAttr mod to change attributes from chat https://github.com/Roll20/roll20-api-scripts/tree/master/ChatSetAttr#readme

var DrD2StatusMarkers = DrD2StatusMarkers || (function() {
    'use strict';
    
    const version = '0.1.0';
    const lastUpdate = '1725090121507';
    const relevantAttributes = ['body_scarred', 'spirit_scarred', 'influence_scarred', 'danger', 'advantages'];
        
    checkInstall = function () {
        log(`-=> DrD2StatusMarkers v${version} <=-  [${new Date(lastUpdate*1000)}]`);
    },

    handleMarkerAttributes = function (obj, prev) {
        if(relevantAttributes.includes(obj.get('name'))) {
            var prevVal = parseInt(prev.current)||0;
            var newVal = parseInt(obj.get('current'))||0;
            var charId = obj.get('_characterid');
            //log(`${obj.get('name')} ${prevVal} -> ${newVal}`);
            switch (obj.get('name')) {
                case 'body_scarred':
                    if(newVal <= 0) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-RED1|-RED2|-RED3|-RED4|-RED5|-RED6|-RED7|-RED8|-RED9`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-RED1|-RED2|-RED3|-RED4|-RED5|-RED6|-RED7|-RED8|-RED9`);
                    } else if(newVal < 10) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-RED1|-RED2|-RED3|-RED4|-RED5|-RED6|-RED7|-RED8|-RED9|-RED9plus|RED${newVal}`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-RED1|-RED2|-RED3|-RED4|-RED5|-RED6|-RED7|-RED8|-RED9|RED${newVal}`);
                    } else {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-RED1|-RED2|-RED3|-RED4|-RED5|-RED6|-RED7|-RED8|-RED9|RED9plus`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-RED1|-RED2|-RED3|-RED4|-RED5|-RED6|-RED7|-RED8|-RED9|RED9plus`);
                    }
                    break;
                case 'spirit_scarred':
                    if(newVal <= 0) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-BLU1|-BLU2|-BLU3|-BLU4|-BLU5|-BLU6|-BLU7|-BLU8|-BLU9`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-BLU1|-BLU2|-BLU3|-BLU4|-BLU5|-BLU6|-BLU7|-BLU8|-BLU9`);
                    } else if(newVal < 10) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-BLU1|-BLU2|-BLU3|-BLU4|-BLU5|-BLU6|-BLU7|-BLU8|-BLU9|-BLU9plus|BLU${newVal}`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-BLU1|-BLU2|-BLU3|-BLU4|-BLU5|-BLU6|-BLU7|-BLU8|-BLU9|BLU${newVal}`);
                    } else {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-BLU1|-BLU2|-BLU3|-BLU4|-BLU5|-BLU6|-BLU7|-BLU8|-BLU9|BLU9plus`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-BLU1|-BLU2|-BLU3|-BLU4|-BLU5|-BLU6|-BLU7|-BLU8|-BLU9|BLU9plus`);
                    }
                    break;
                case 'influence_scarred':
                    if(newVal <= 0) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-GRN1|-GRN2|-GRN3|-GRN4|-GRN5|-GRN6|-GRN7|-GRN8|-GRN9`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-GRN1|-GRN2|-GRN3|-GRN4|-GRN5|-GRN6|-GRN7|-GRN8|-GRN9`);
                    } else if(newVal < 10) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-GRN1|-GRN2|-GRN3|-GRN4|-GRN5|-GRN6|-GRN7|-GRN8|-GRN9|-GRN9plus|GRN${newVal}`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-GRN1|-GRN2|-GRN3|-GRN4|-GRN5|-GRN6|-GRN7|-GRN8|-GRN9|GRN${newVal}`);
                    } else {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-GRN1|-GRN2|-GRN3|-GRN4|-GRN5|-GRN6|-GRN7|-GRN8|-GRN9|GRN9plus`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-GRN1|-GRN2|-GRN3|-GRN4|-GRN5|-GRN6|-GRN7|-GRN8|-GRN9|GRN9plus`);
                    }
                    break;
                case 'danger':
                    if(newVal <= 0) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-VIO1|-VIO2|-VIO3|-VIO4|-VIO5|-VIO6|-VIO7|-VIO8|-VIO9`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-VIO1|-VIO2|-VIO3|-VIO4|-VIO5|-VIO6|-VIO7|-VIO8|-VIO9`);
                    } else if(newVal < 10) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-VIO1|-VIO2|-VIO3|-VIO4|-VIO5|-VIO6|-VIO7|-VIO8|-VIO9|-VIO9plus|VIO${newVal}`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-VIO1|-VIO2|-VIO3|-VIO4|-VIO5|-VIO6|-VIO7|-VIO8|-VIO9|VIO${newVal}`);
                    } else {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-VIO1|-VIO2|-VIO3|-VIO4|-VIO5|-VIO6|-VIO7|-VIO8|-VIO9|VIO9plus`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-VIO1|-VIO2|-VIO3|-VIO4|-VIO5|-VIO6|-VIO7|-VIO8|-VIO9|VIO9plus`);
                    }
                    break;
                case 'advantages':
                    if(newVal <= 0) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-BLK1|-BLK2|-BLK3|-BLK4|-BLK5|-BLK6|-BLK7|-BLK8|-BLK9`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-BLK1|-BLK2|-BLK3|-BLK4|-BLK5|-BLK6|-BLK7|-BLK8|-BLK9`);
                    } else if(newVal < 10) {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-BLK1|-BLK2|-BLK3|-BLK4|-BLK5|-BLK6|-BLK7|-BLK8|-BLK9|-BLK9plus|BLK${newVal}`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-BLK1|-BLK2|-BLK3|-BLK4|-BLK5|-BLK6|-BLK7|-BLK8|-BLK9|BLK${newVal}`);
                    } else {
                        sendChat('API', `!token-mod --ids ${charId} --set statusmarkers|-BLK1|-BLK2|-BLK3|-BLK4|-BLK5|-BLK6|-BLK7|-BLK8|-BLK9|BLK9plus`, null, {noarchive:true} );
                        //log(`!token-mod --ids ${charId} --set statusmarkers|-BLK1|-BLK2|-BLK3|-BLK4|-BLK5|-BLK6|-BLK7|-BLK8|-BLK9|BLK9plus`);
                    }
                    break;
                default:
                    break;
            }
        }
    },

    handleStatusMarkers = function(obj, prev) {
        var newVals, prevVals = [];
        newVals = obj.get('statusmarkers').split(',');
        prevVals = prev['statusmarkers'].split(',');
        var color, marker = '';
        var level = 0;
        var charId = obj.get('represents');
        //log(`newVals = ${newVals}`);
        //log(`prevVals = ${prevVals}`);
        for(let i = 0; i < newVals.length; i++) {
            //log(newVals[i]);
            marker = newVals[i].substring(0, newVals[i].search(/::/));
            color = marker.substring(0, marker.search(/\d/));
            level = parseInt(marker.match(/(\d+)/))||0;
            //log(`${marker}, ${color}, ${level}`);
            switch (color) {
                case 'RED':
                    sendChat('API', `!setattr --charid ${charId} --body_scarred|${level} --mute --nocreate`, null, {noarchive:true} );
                    break;
                case 'BLU':
                    sendChat('API', `!setattr --charid ${charId} --spirit_scarred|${level} --mute --nocreate`, null, {noarchive:true} );
                    break;
                case 'GRN':
                    sendChat('API', `!setattr --charid ${charId} --influence_scarred|${level} --mute --nocreate`, null, {noarchive:true} );
                    break;
                case 'VIO':
                    sendChat('API', `!setattr --charid ${charId} --danger|${level} --mute --nocreate`, null, {noarchive:true} );
                    break;
                case 'BLK':
                    sendChat('API', `!setattr --charid ${charId} --advantages|${level} --mute --nocreate`, null, {noarchive:true} );
                    break;
                default:
                    break;
            }
            if(!(newVals.length)) {
                sendChat('API', `!setattr --charid ${charId} --body_scarred|0 --spirit_scarred|0 --influence_scarred|0 --danger|0 --advantages|0 --mute --nocreate`, null, {noarchive:true} );
            }else {
                if(!(newVals.some(str => str.includes('RED')))) {sendChat('API', `!setattr --charid ${charId} --body_scarred|0 --mute --nocreate`, null, {noarchive:true} );}
                if(!(newVals.some(str => str.includes('BLU')))) {sendChat('API', `!setattr --charid ${charId} --spirit_scarred|0 --mute --nocreate`, null, {noarchive:true} );}
                if(!(newVals.some(str => str.includes('GRN')))) {sendChat('API', `!setattr --charid ${charId} --influence_scarred|0 --mute --nocreate`, null, {noarchive:true} );}
                if(!(newVals.some(str => str.includes('VIO')))) {sendChat('API', `!setattr --charid ${charId} --danger|0 --mute --nocreate`, null, {noarchive:true} );}
                if(!(newVals.some(str => str.includes('BLK')))) {sendChat('API', `!setattr --charid ${charId} --advantages|0 --mute --nocreate`, null, {noarchive:true} );}
            }
        }
    },

    registerEventHandlers = function () {
        on('change:attribute:current', function(obj, prev){handleMarkerAttributes(obj, prev)});
        on('change:graphic:statusmarkers', function(obj, prev){handleStatusMarkers(obj, prev)});
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on('ready', () => {
    'use strict';

    DrD2StatusMarkers.CheckInstall();
    DrD2StatusMarkers.RegisterEventHandlers();
});