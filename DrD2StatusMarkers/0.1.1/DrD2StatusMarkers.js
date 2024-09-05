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
    
    const version = '0.1.1';
    const lastUpdate = 1725386405067;
    const markerAttributes = ['body_scarred', 'spirit_scarred', 'influence_scarred', 'danger', 'advantages'];
        
    checkInstall = function () {
        log(`-=> DrD2StatusMarkers v${version} <=- [${new Date(lastUpdate)}]`);
    },

    handleMarkerAttributes = function (obj, prev) {
        var attr = obj.get('name');
        if(markerAttributes.includes(attr)) {
            var prevVal = parseInt(prev.current)||0;
            var newVal = parseInt(obj.get('current'))||0;
            var charId = obj.get('_characterid');
            var color = '';
            //log(`${obj.get('name')} changed`);
            //log(`prevVal ${prevVal} -> newVal ${newVal}`);
            switch (attr) {
                case markerAttributes[0]:
                    color = 'RED';
                    break;
                case markerAttributes[1]:
                    color = 'BLU';
                    break;
                case markerAttributes[2]:
                    color = 'GRN';
                    break;
                case markerAttributes[3]:
                    color = 'VIO';
                    break;
                case markerAttributes[4]:
                    color = 'BLK';
                    break;
                default:
                    break;
            }
            if(color){
                if(newVal > 0 && newVal < 10) {
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${color}1|-${color}2|-${color}3|-${color}4|-${color}5|-${color}6|-${color}7|-${color}8|-${color}9|-${color}9plus|${color}${newVal}`, null, {noarchive:true} );
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${color}1|-${color}2|-${color}3|-${color}4|-${color}5|-${color}6|-${color}7|-${color}8|-${color}9|-${color}9plus|${color}${newVal}`);
                } else if(newVal >= 10) {
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${color}1|-${color}2|-${color}3|-${color}4|-${color}5|-${color}6|-${color}7|-${color}8|-${color}9|${color}9plus`, null, {noarchive:true} );
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${color}1|-${color}2|-${color}3|-${color}4|-${color}5|-${color}6|-${color}7|-${color}8|-${color}9|${color}9plus`);
                } else {
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${color}1|-${color}2|-${color}3|-${color}4|-${color}5|-${color}6|-${color}7|-${color}8|-${color}9|-${color}9plus`, null, {noarchive:true} );
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${color}1|-${color}2|-${color}3|-${color}4|-${color}5|-${color}6|-${color}7|-${color}8|-${color}9|-${color}9plus`);
                }
            }
        }
    },

    registerEventHandlers = function () {
        on('change:attribute:current', function(obj, prev){handleMarkerAttributes(obj, prev)});
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