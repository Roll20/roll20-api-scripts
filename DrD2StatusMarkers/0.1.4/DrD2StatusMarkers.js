// Github:   TBD
// By:       nesuprachy
// Contact:  https://app.roll20.net/users/11071738/nesuprachy
//
// This script sets token markers based on relevant sheet attributes.
// Works with the DrD2 token marker set, icons must be named `RED`, `BLU`, `GRN`, `VIO`, `BLK`, `GRY`, `load` followed by corresponding values
// Uses TokenMod to set token markers from chat https://wiki.roll20.net/Script:Token_Mod

var DrD2StatusMarkers = DrD2StatusMarkers || (function() {
    'use strict';
    
    const version = '0.1.4';
    const lastUpdate = 1739435813976;
    const markerAttributes = ['body_scarred', 'spirit_scarred', 'influence_scarred', 'danger', 'advantages', 'companion_bond_scarred', 'load'];
    const markerMap = {
        body_scarred: 'RED',
        spirit_scarred: 'BLU',
        influence_scarred: 'GRN',
        danger: 'VIO',
        advantages: 'BLK',
        companion_bond_scarred: 'GRY',
        load: 'load'
    };
    
    checkInstall = function () {
        log(`-=> DrD2StatusMarkers v${version} <=- [${new Date(lastUpdate)}]`);
    },

    handleMarkerAttributes = function (obj, prev) {
        //const startTime = Date.now();
        
        const attr = obj.get('name');
        let marker = markerMap[attr];
        const charId = obj.get('_characterid');

        // Parse old and new values
        const prevVal = (attr === 'load') ? prev.current : parseInt(prev.current) || 0;
        const newVal = (attr === 'load') ? obj.get('current') : parseInt(obj.get('current')) || 0;
        if(newVal === prevVal) return;

        //log(`\'${obj.get('name')}\' of character \'${(getObj('character', charId)).get('name')}\' changed from ${prevVal} -> ${newVal}`);
        
        // If attribute is 'load' set marker to 'S', 'L' or 'T'
        // If newVal is between 0 and 10 set marker to new value
        // If newVal is >= 10 set marker to 9+
        // if newVal is <= 0 remove all markers except 'load'
        if(marker){
            const clearAllMarkers = `|-${marker}1|-${marker}2|-${marker}3|-${marker}4|-${marker}5|-${marker}6|-${marker}7|-${marker}8|-${marker}9|-${marker}9plus`;
            if(attr === 'load'){
                sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-loadL|-loadS|-loadT|load${newVal}`, null, {noarchive:true});
                //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers|-loadL|-loadS|-loadT|load${newVal}`);
            } else if(newVal > 0 && newVal < 10) {
                sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers${clearAllMarkers}|${marker}${newVal}`, null, {noarchive:true} );
                //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers${clearAllMarkers}|${marker}${newVal}`);
            } else if(newVal >= 10) {
                sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers${clearAllMarkers}|${marker}9plus`, null, {noarchive:true} );
                //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers${clearAllMarkers}|${marker}9plus`);
            } else {
                sendChat('API', `!token-mod --ignore-selected --ids ${charId} --set statusmarkers${clearAllMarkers}`, null, {noarchive:true} );
                //log(`!token-mod --ignore-selected --ids ${charId} --set statusmarkers${clearAllMarkers}`);
            }
        }
        
        //const endTime = Date.now();
        //log(`handleMarkerAttributes() took ${endTime - startTime} ms to execute`);
    },
    
    registerEventHandlers = function () {
        on('change:attribute:current', function(obj, prev){
            if(markerAttributes.includes(obj.get('name'))) handleMarkerAttributes(obj, prev);
        });
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