/* 
 * Version 0.1.0
 * Original By Unknown (if you know please let me know)
 * Updated by Werner Dohse
 * Discord: Naudran#2980
 * Roll20: https://app.roll20.net/users/1062502/werner-d
 * Github: https://github.com/Werner-Dohse
*/
var ShortRest = ShortRest || (function() {
    'use strict';

    const version = '0.1.0',
        whoResourceReset = [
            { class: 'cleric', resource: 'channel divinity'},
            { class: 'druid', resource: 'wild shape'},
            { class: 'fighter', resource: 'action surge|second wind'},
            { class: 'monk', resource: 'ki' },
        ],
        whoSpellSlotsReset = 'warlock',
        messageTemplate = '<div class=\'sheet-rolltemplate-simple\' style=\'margin-top: -7px;\'><div class=\'sheet-container\'><div class=\'sheet-label\' style=\'margin-top: 5px;padding: 15px\'><span>{{message}}</span></div></div></div>',

    checkInstall = function () {
        log(`-=> ShortRest v${version} <=-`);
    },

    handleInput = function (msg) {
        // rolled from the character sheet
        if (msg && msg.playerid.toLowerCase() != "api" && msg.rolltemplate) {
            var cnamebase = msg.content.split("charname=")[1];
            var cname = cnamebase ? cnamebase.replace(/ {{.*}} /, '').trim() : (msg.content.split("{{name=")[1] || '').split("{{")[0].trim();
            var character = cname ? findObjs({
                name: cname,
                type: 'character'
            })[0] : undefined;
    
            if (["simple"].indexOf(msg.rolltemplate) > -1) {
                if (_.has(msg, 'inlinerolls') && msg.content.indexOf("^{hit-dice-u}") > -1 && character) {
                    handleHD(msg.who, msg.inlinerolls[2], character);
                    handleResources(msg.who, character);
                    handleSpellSlots(msg.who, character);
                }
            }
        }
        else if (msg && msg.type === 'api') {
            // short rest command without spending hit dice
            if (msg.content.search(/^!shortrest-nohd\b/) !== -1) {
                if (!msg.selected) {
                    showFeedback('Short Rest', 'A token has to be selected first.');
                    return;
                }

                _.each(msg.selected, function(sel) {
                    const token = getObj('graphic', sel._id);
                    const character = getObj('character', token.get('represents'));
    
                    if (character) {
                        handleResources(msg.who, character);
                        handleSpellSlots(msg.who, character);
                    }
                });
            }            
        } 
    },

    // CHECK CURRENT HD, DECREMENT HD, THEN APPLY HP
    handleHD = function (who, inlinerolls, character) {
        let hd = findObjs({
            type: 'attribute',
            characterid: character.id,
            name: "hit_dice"
        }, {
            caseInsensitive: true
        })[0];

        let hp = findObjs({
            type: 'attribute',
            characterid: character.id,
            name: "hp"
        }, {
            caseInsensitive: true
        })[0];

        if (!hd || hd.get("current") === "" || hd.get("max") === "") {
            log("CHARACTER HAS NO HIT_DICE ATTRIBUTE OR HD CURRENT/MAX IS NULL");
            showFeedback(who, `Hit Dice attribute on ${character.get("name")} is missing or current/max values are not filled out, Hit Points were not applied.`);
            return;
        } else if (!hp || hp.get("current") === "" || hp.get("max") === "") {
            log("CHARACTER HAS NO HP ATTRIBUTE OR HP CURRENT/MAX IS NULL");
            showFeedback(who, `HP attribute on ${character.get("name")} is missing or current/max values are not filled out, Hit Points were not applied.`);
            return;
        } else {
            var curhd = parseInt(hd.get("current"));
            var newhd = curhd - 1;
        }
        
        var maxhp = parseInt(hp.get("max"));
        var curhp = parseInt(hp.get("current"));
    
        if (curhd === 0) {
            showFeedback(who, `${character.get("name")}  has no Hit Dice remaining, HP were not applied.`);
        } else if (curhp === maxhp) {
            showFeedback(who, `${character.get("name")} already at full HP, no Hit Dice used.`);
        } else {
            hd.set({
                current: newhd
            });
    
            var result = inlinerolls.results.total ? inlinerolls.results.total : false;
            var newhp = curhp + result;
            if (result === false) {
                log("FAILED TO GET HD RESULT");
            } else if (newhp > maxhp) {
                hp.set({
                    current: maxhp
                });
            } else {
                hp.set({
                    current: newhp
                });
            }
        }
    },

    handleResources = function (who, character) {
        const characterClass = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: 'class',
        })[0];

        log('character class: ' + characterClass);
        if (!characterClass) {
            return null;
        }
        
        const className = characterClass.get('current').toLowerCase();
        if (!whoResourceReset.filter((item) => item.class === className)) {
            return null;
        }

        // check primary resource
        resourceCheck('class_resource', character, className);

        // check other resources
        resourceCheck('other_resource', character, className);

        // we assume there'll never be more than 20 repeating resources in total (10 left & 10 right)
        const repeating = findRepeatingResources(character);
        _.each(repeating, function(resource) {
            resourceCheck(resource.get('name'), character, className);
        });
    },

    resourceCheck = function (res, character, className) {
        const resourceName = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: `${res}_name`,
        })[0];
        
        const resource = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: res,
        })[0];

        if (resource && resourceName) {
            // is the resource name in the list that resets on short rest
            if (whoResourceReset.filter((item) => item.class === className && item.resource.indexOf(resourceName.get('current').toLowerCase()) >= 0)) {
                const resourceMax = resource.get('max');            
                resource.set('current', resourceMax);

                return true;
            }            
        }

        return false;
    },

    findRepeatingResources = function (character) {
        return filterObjs(function(obj) {
            if (
                obj.get('type') === 'attribute' &&
                obj.get('characterid') === character.get('_id') &&
                obj.get('name').indexOf('repeating_resource') !== -1 &&
                obj.get('name').indexOf('_name') === -1
            ) {
                return obj;
            }
        });
    },

    handleSpellSlots = function (who, character) {
        const characterClass = findObjs({
            _type: 'attribute',
            _characterid: character.get('_id'),
            name: 'class',
        })[0];

        if (characterClass && whoSpellSlotsReset.indexOf(characterClass.get('current').toLowerCase()) >= 0) {
            for (let i = 1; i < 10; i++) {
                const slotsTotal = findObjs({
                    _type: 'attribute',
                    _characterid: character.get('_id'),
                    name: `lvl${i}_slots_total`,
                })[0];

                const slotsUsed = findObjs({
                    _type: 'attribute',
                    _characterid: character.get('_id'),
                    name: `lvl${i}_slots_expended`,
                })[0];

                if (slotsTotal && slotsUsed && slotsTotal.get('current') > 0 && slotsUsed.get('current') < slotsTotal.get('current')) {
                    slotsUsed.set('current', slotsTotal.get('current'));

                    showFeedback(who, 'Spell slots have been restored.')
                }                
            }            
        }
    },

    showFeedback = function (who, message) {
        message = messageTemplate.replace('{{message}}', message);
        sendChat(who, message);
    },

    registerEventHandlers = function () {
        on('chat:message', handleInput);
    };
    
    return {
        checkInstall,
        registerEventHandlers,
    };
})();

on('ready', () => {
    'use strict';
    ShortRest.checkInstall();
    ShortRest.registerEventHandlers();
});