// Github:   TBD
// By:       nesuprachy
// Contact:  https://app.roll20.net/users/11071738/nesuprachy
//
// This script tracks changes made to the `tenacity_current` attribute and propagates them to other sheets linked via the `npc_owner` attribute.
// Uses ChatSetAttr mod to change attributes from chat https://github.com/Roll20/roll20-api-scripts/tree/master/ChatSetAttr#readme

var DrD2LinkedTenacity = DrD2LinkedTenacity || (function() {
    'use strict';
    
    const version = '0.1.2';
    const lastUpdate = 1739435813976;
    // Global list of unarchived characters
    // Collect or refresh unarchived character list to avoid calling findObjs on every attribute change
    let allCharacters = [];
    const collectCharacters = () => {
        allCharacters = findObjs({
            _type: 'character',
            archived: false
        }, {caseInsensitive: true});
    };
    
    // Gather all character IDs linked via 'npc_owner'
    // If change came from PC sheet, add NPCs whose 'npc_owner' attribute is same as originCharName
    // If change came from NPC sheet, add other NPCs with the same 'npc_owner' plus any PC whose name matches 'npc_owner'
    const gatherLinkedCharacters = (sheetType, originCharName, npcOwner) => {
        const targets = [];
        allCharacters.forEach( char => {
            const charName = char.get('name');
            const charNpcOwner = getAttrByName(char.id, 'npc_owner');

            if(sheetType === 'pc' && originCharName) {
                if(charNpcOwner === originCharName) targets.push(char.id);
            }else if(sheetType === 'npc' && npcOwner) {
                if(charNpcOwner === npcOwner || charName === npcOwner) targets.push(char.id);
            }
        });
        return targets;
    },

    checkInstall = function () {
        log(`-=> DrD2LinkedTenacity v${version} <=- [${new Date(lastUpdate)}]`);
    },

    handleTenacityAttribute = function (obj, prev, isMax) {
        //const startTime = Date.now();

        // Parse old and new values
        const prevVal = parseInt(isMax ? prev.max : prev.current) || 0;
        const newVal = parseInt(isMax ? obj.get('max') : obj.get('current')) || 0;
        if(newVal === prevVal) return;

        // Retrieve origin character data
        const originCharId = obj.get('_characterid');
        const originChar = getObj('character', originCharId);
        const sheetType = getAttrByName(originCharId, 'sheet_type');
        const originCharName = originChar.get('name');
        const npcOwner = getAttrByName(originCharId, 'npc_owner');
        const targetChars = gatherLinkedCharacters(sheetType, originCharName, npcOwner);

        /*log(`targetChars = ${targetChars}`);
        log(`sheet_type = \'${sheetType}\', npc_owner = \'${npcOwner}\'`);
        if(isMax) {
            log(`\'${obj.get('name')}\' (max) of character \'${originCharName}\' changed from ${prevVal} to ${newVal}`);
        }else {
            log(`\'${obj.get('name')}\' of character \'${originCharName}\' changed from ${prevVal} to ${newVal}`);
        }*/

        if(Array.isArray(targetChars) && targetChars.length){
            const str = (isMax) ? `--tenacity_current||${newVal}` : `--tenacity_current|${newVal}`;
            sendChat('API', `!setattr --charid ${targetChars.join(",")} ${str} --silent --nocreate`, null, {noarchive:true});
            //log(`!setattr --charid ${targetChars.join(",")} ${str} --silent --nocreate`);
        }
        
        //const endTime = Date.now();
        //log(`handleAttribute() took ${endTime - startTime} ms to execute`);
    },

    registerEventHandlers = function () {
        on('add:character', function (){collectCharacters()});
        on('change:character:archived', function (){collectCharacters()});
        
        on('change:attribute:current', function(obj, prev){
            if(obj.get('name') === 'tenacity_current') handleTenacityAttribute(obj, prev, false);
        });
        on('change:attribute:max', function(obj, prev){
            if(obj.get('name') === 'tenacity_current') handleTenacityAttribute(obj, prev, true);
        });
    };
    
    return {
        CheckInstall: checkInstall,
        CollectCharacters: collectCharacters,
        RegisterEventHandlers: registerEventHandlers
    };

}());

on('ready', () => {
    'use strict';

    DrD2LinkedTenacity.CheckInstall();
    DrD2LinkedTenacity.CollectCharacters();
    DrD2LinkedTenacity.RegisterEventHandlers();
});