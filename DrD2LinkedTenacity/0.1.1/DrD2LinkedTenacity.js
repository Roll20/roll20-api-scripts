// Github:   TBD
// By:       nesuprachy
// Contact:  https://app.roll20.net/users/11071738/nesuprachy
//
// This script tracks changes made to the `tenacity_current` attribute and propagates them to other sheets linked via the `npc_owner` attribute.
// Uses ChatSetAttr mod to change attributes from chat https://github.com/Roll20/roll20-api-scripts/tree/master/ChatSetAttr#readme

var DrD2LinkedTenacity = DrD2LinkedTenacity || (function() {
    'use strict';
    
    const version = '0.1.0';
    const lastUpdate = 1725266705016;
        
    checkInstall = function () {
        log(`-=> DrD2LinkedTenacity v${version} <=-  [${new Date(lastUpdate)}]`);
    },

    handleTenacityAttribute = function (obj, prev, isMax) {
        if(obj.get('name') === 'tenacity_current') {
            var prevVal, newVal = 0;
            if(isMax){
                prevVal = parseInt(prev.max)||0;
                newVal = parseInt(obj.get('max'))||0;
            }else {
                prevVal = parseInt(prev.current)||0;
                newVal = parseInt(obj.get('current'))||0;
            }
            if(newVal !== prevVal) {
                var targetChars = [];
                var allCharacters = findObjs({
                    _type: 'character',
                    archived: false
                }, {caseInsensitive: true});
                var originChar = getObj('character', obj.get('_characterid'));
                var originCharName = originChar.get('name');
                var sheetType = getAttrByName(originChar.id, 'sheet_type');
                var npcOwner = getAttrByName(originChar.id, 'npc_owner');
                
                if((sheetType === 'pc') && originCharName) {
                    // If PC, add ID of every character owned by this PC to target characters array
                    _.each(allCharacters, function(obj){
                        if(getAttrByName(obj.id, 'npc_owner') === originCharName) {targetChars.push(obj.id)}
                    });
                }else if ((sheetType === 'npc') && npcOwner) {
                    // If NPC, add ID of every character with same 'npc_owner' to target characters array
                    _.each(allCharacters, function(obj) {
                        if(getAttrByName(obj.id, 'npc_owner') === npcOwner) {targetChars.push(obj.id)}
                    });
                    // Add sheets where 'character_name' equals 'npc_owner' to target characters array
                    _.each(allCharacters, function(obj) {
                        if(obj.get('name') === npcOwner) {targetChars.push(obj.id)}
                    });
                }

                /*log(`sheet_type = \'${sheetType}\', npc_owner = \'${npcOwner}\'`);
                if(isMax) {
                    log(`\'${obj.get('name')}\' (max) of character \'${originCharName}\' changed from ${prevVal} to ${newVal}`);
                }else {
                    log(`\'${obj.get('name')}\' of character \'${originCharName}\' changed from ${prevVal} to ${newVal}`);
                }*/

                if(Array.isArray(targetChars) && targetChars.length){
                    if(isMax){
                        //log(`!setattr --charid ${targetChars} --tenacity_current||${newVal} --silent --nocreate`);
                        sendChat('API', `!setattr --charid ${targetChars} --tenacity_current||${newVal} --silent --nocreate`, null, {noarchive:true} );
                    }else {
                        //log(`!setattr --charid ${targetChars} --tenacity_current|${newVal} --silent --nocreate`);
                        sendChat('API', `!setattr --charid ${targetChars} --tenacity_current|${newVal} --silent --nocreate`, null, {noarchive:true} );
                    }
                }
            }
        }
    },

    registerEventHandlers = function () {
        on('change:attribute:current', function(obj, prev){handleTenacityAttribute(obj, prev, false)});
        on('change:attribute:max', function(obj, prev){handleTenacityAttribute(obj, prev, true)});
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on('ready', () => {
    'use strict';

    DrD2LinkedTenacity.CheckInstall();
    DrD2LinkedTenacity.RegisterEventHandlers();
});