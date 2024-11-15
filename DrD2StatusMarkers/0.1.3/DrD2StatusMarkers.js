// Github:   TBD
// By:       nesuprachy
// Contact:  https://app.roll20.net/users/11071738/nesuprachy
//
// This script sets token markers based on relevant sheet attributes.
// Works with the DrD2 token marker set, icons must be named `RED`, `BLU`, `GRN`, `VIO`, `BLK`, `GRY`, `load` followed by corresponding values
// Uses TokenMod to set token markers from chat https://wiki.roll20.net/Script:Token_Mod

var DrD2StatusMarkers = DrD2StatusMarkers || (function() {
    'use strict';
    
    const version = '0.1.3';
    const lastUpdate = 1731662174989;
    const markerAttributes = ['body_scarred', 'spirit_scarred', 'influence_scarred', 'danger', 'advantages', 'companion_bond_scarred', 'load'];
        
    checkInstall = function () {
        log(`-=> DrD2StatusMarkers v${version} <=- [${new Date(lastUpdate)}]`);
    },

    handleMarkerAttributes = function (obj, prev) {
        var attr = obj.get('name');
        if(markerAttributes.includes(attr)) {
            var prevVal, newVal;
            if(attr === 'load') {
                prevVal = prev.current;
                newVal = obj.get('current');
            }else {
                prevVal = parseInt(prev.current)||0;
                newVal = parseInt(obj.get('current'))||0;
            }
            var charId = obj.get('_characterid');
            var marker = '';
            //log(`${obj.get('name')} changed`);
            //log(`prevVal ${prevVal} -> newVal ${newVal}`);
            switch (attr) {
                case markerAttributes[0]:
                    marker = 'RED';
                    break;
                case markerAttributes[1]:
                    marker = 'BLU';
                    break;
                case markerAttributes[2]:
                    marker = 'GRN';
                    break;
                case markerAttributes[3]:
                    marker = 'VIO';
                    break;
                case markerAttributes[4]:
                    marker = 'BLK';
                    break;
                case markerAttributes[5]:
                    marker = 'GRY';
                    break;
                case markerAttributes[6]:
                    marker= 'load';
                    break;
                default:
                    break;
            }
            if(marker){
                if(attr === 'load'){
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-loadL|-loadS|-loadT|load${newVal}`, null, {noarchive:true});
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-loadL|-loadS|-loadT|load${newVal}`);
                } else if(newVal > 0 && newVal < 10) {
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|-${marker}9plus|${marker}${newVal}`, null, {noarchive:true} );
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|-${marker}9plus|${marker}${newVal}`);
                } else if(newVal >= 10) {
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|${marker}9plus`, null, {noarchive:true} );
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|${marker}9plus`);
                } else {
                    sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|-${marker}9plus`, null, {noarchive:true} );
                    //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|-${marker}9plus`);
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