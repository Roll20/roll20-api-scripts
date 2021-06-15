/*
    The One Ring State Checker for Roll20.
    By Michael Heilemann (michael.heilemann@me.com)
    Updated by uhu79, and Michael "Aragent" I,
    # Weary
   
    Checks to see if a character's endurance drops below her fatigue, and
    automatically sets the `weary` attribute to `weary` or `normal`, depending.
    This is very useful particularly if you're using the TOR roll tables, as you
    can then read the weary attribute of the selected token in a macro and roll
    on the appropriate success die table automatically:
        /r 1t[feat] + @{travel}t[@{weary}]
    
    It requires that the characters have `endurance`, `travel_fatigue`, 
    'weapon_encubrance_x' (x for 1-4) and 'gear_encumbrance_x (x for 1-8) and 
    `weary` attributes. Make also sure that all NPCs have the radio button
    in the character sheet set to adversary and all player characters are 
    set to Player Character accordingly (also via the radio button on top).
    
    If you want to manually set a character weary, you can do that via the gear
    list. Just add a gear that says "temporarily weary" with a very high
    encumbrance value that will in any case exceed the current limit.
    
    # Wounded / Treated Wound
    Sets a half-heart marker on the tokens of wounded/treated wound characters, 
    mostly to serve as a reminder.
    It requires that the characters have 'wounded' and "wound_treated' 
    attributes.
    
    # Miserable
    Sets a marker on the tokens of miserable characters.
    Also automatically detects if a character is turning miserable if hope is less 
	or equal total_shadow.
	However it does not reset miserable. This is on purpose not to override any
	temporary miserable state.
    Needs 'total_shadow', 'temporary_shadow' and 'permanent_shadow' as well as 
    'miserable' and 'hope' attributes.
    
    # More Information
    Works great with the The One Ring character sheet for Roll20.
    For more of my The One Ring shenanigans:
    https://ringen.squarespace.com/loremasters-journal/
 */
on('ready', function() {
    var characters = findObjs({
        _type: 'character'
    });
    characters.forEach(checkWeary, this);
});
on('change:attribute', function(obj, prev) {
    var characterid = obj.get('_characterid');
    var character = getObj("character", characterid);
    checkWeary(character);
});
var checkWeary = function (character) {
    var characterid = character.get('_id');
    var charactername = character.get('name');
    var tokens = findObjs({
        _type: 'graphic',
        represents: characterid
    });
    
    // that's the value from the radio button mentioned in the comments above
    var isplayer = getAttrByName(characterid, 'pc', 'current');
    
    // WEARY
    // characters only
    if (isplayer === '1') {
        // do some calculations on fatigue
        // weapon encumbrance
        var weapon_encumbrance_1 = getAttrByName(characterid, 'weapon_encumbrance_1', 'current');
        var weapon_encumbrance_2 = getAttrByName(characterid, 'weapon_encumbrance_2', 'current');
        var weapon_encumbrance_3 = getAttrByName(characterid, 'weapon_encumbrance_3', 'current');
        var weapon_encumbrance_4 = getAttrByName(characterid, 'weapon_encumbrance_4', 'current');
        var weapon_encumbrance_5 = getAttrByName(characterid, 'weapon_encumbrance_5', 'current');
        var weapon_encumbrance_6 = getAttrByName(characterid, 'weapon_encumbrance_6', 'current');
        var weapon_encumbrance = parseInt(weapon_encumbrance_1, 10) + parseInt(weapon_encumbrance_2, 10)  + parseInt(weapon_encumbrance_3, 10)  + parseInt(weapon_encumbrance_4, 10)  + parseInt(weapon_encumbrance_5, 10)  + parseInt(weapon_encumbrance_6, 10);
        
        // gear encumbrance
        var gear_encumbrance_1 = getAttrByName(characterid, 'gear_encumbrance_1', 'current');
        var gear_encumbrance_2 = getAttrByName(characterid, 'gear_encumbrance_2', 'current');
        var gear_encumbrance_3 = getAttrByName(characterid, 'gear_encumbrance_3', 'current');
        var gear_encumbrance_4 = getAttrByName(characterid, 'gear_encumbrance_4', 'current');
        var gear_encumbrance_5 = getAttrByName(characterid, 'gear_encumbrance_5', 'current');
        var gear_encumbrance_6 = getAttrByName(characterid, 'gear_encumbrance_6', 'current');
        var gear_encumbrance_7 = getAttrByName(characterid, 'gear_encumbrance_7', 'current');
        var gear_encumbrance_8 = getAttrByName(characterid, 'gear_encumbrance_8', 'current');
        var gear_encumbrance_9 = getAttrByName(characterid, 'gear_encumbrance_9', 'current');
        var gear_encumbrance_10 = getAttrByName(characterid, 'gear_encumbrance_10', 'current');
        var gear_encumbrance = parseInt(gear_encumbrance_1, 10) + parseInt(gear_encumbrance_2, 10) + parseInt(gear_encumbrance_3, 10) + parseInt(gear_encumbrance_4, 10) + parseInt(gear_encumbrance_5, 10) + parseInt(gear_encumbrance_6, 10) + parseInt(gear_encumbrance_7, 10) + parseInt(gear_encumbrance_8, 10) + parseInt(gear_encumbrance_9, 10) + parseInt(gear_encumbrance_10, 10);
        
        // travel fatigue
        var travel_fatigue = getAttrByName(characterid, 'travel_fatigue', 'current');
        
        // sum it all up
        var total_fatigue = parseInt(travel_fatigue, 10) + parseInt(weapon_encumbrance, 10) + parseInt(gear_encumbrance, 10);
        
        // do some calculation on miserable
        var permanent_shadow = getAttrByName(characterid, 'permanent_shadow', 'current');
        var temporary_shadow = getAttrByName(characterid, 'temporary_shadow', 'current');
        var total_shadow = parseInt(permanent_shadow, 10) + parseInt(temporary_shadow, 10);
        
        // setting the other variables, make sure they are created in the sheet
        var endurance = getAttrByName(characterid, 'endurance', 'current');
        var weary = getAttrByName(characterid, 'weary', 'current');
        var wounded = getAttrByName(characterid, 'wounded', 'current');
        var wound_treated = getAttrByName(characterid, 'wound_treated', 'current');
        var miserable = getAttrByName(characterid, 'miserable', 'current');
        var hope = getAttrByName(characterid, 'hope', 'current');
            
        // this initiates the attribute 'weary' not only the value of it
        var weary_attribute = findObjs({
            _characterid: characterid,
            _type: 'attribute',
            name: 'weary'
        })[0] || createObj('attribute',{characterid: characterid, name: 'weary'});
            
        // compare endurance to total_fatigue, lesser or equal triggers the "weary" state
        if (endurance <= total_fatigue) {
            // optional: send a message to everyone
            // but send the message only on state changes
            if (weary === 'normal') {
                sendChat('character|'+characterid, '/me is weary!');
            }
            // this sets weary to the new value
            weary_attribute.set('current', 'weary');
            // this now tints the token yellowish
            tokens.forEach(function(token) {
                // #ff9900
                token.set('tint_color', '#ff9900');
            }, this);
        } else if (endurance > total_fatigue) {
            // optional: send a message to everyone
            // but send the message only on state changes
            if (weary === 'weary') {
                sendChat('character|'+characterid, '/me is well again!');
            }
            // this sets weary to the new value
            weary_attribute.set('current', 'normal');
            tokens.forEach(function(token) {
                // transparent
                token.set('tint_color', 'transparent');
            }, this);
        } else {
            return;
        }
    
    // WOUNDED
    if (
        (wounded && parseInt(wounded, 10) !== 0) ||
        (wound_treated && parseInt(wound_treated, 10) !== 0)
    ) {
        tokens.forEach(function(token) {
            // #98000
            token.set('status_half-heart', '0');
        }, this);
    } else {
        tokens.forEach(function(token) {
            // transparent
            token.set('status_half-heart', false);
        }, this);
    }
    
    // MISERABLE
    // this initiates the attribute 'miserable' not only the value of it
    var miserable_attribute = findObjs({
        _characterid: characterid,
        _type: 'attribute',
        name: 'miserable'
    })[0] || createObj('attribute',{characterid: characterid, name: 'miserable'});

    if (
        // hope is below or equal shadow, but not if shadow is 0
        (parseInt(hope, 10) <= parseInt(total_shadow, 10) && parseInt(total_shadow, 10) != 0) ||
        // in case it has been set manually by the player, e.g. as result of a hazard
        (miserable === '1')
    ) {
        // optional: send a message to everyone
        // but send the message only on state changes
        if (miserable === '0') {
            sendChat('character|'+characterid, '/me is miserable!');
            
            miserable_attribute.set('current', '1');
        }
        tokens.forEach(function(token) {
            // #98000
            token.set('status_bleeding-eye', '0');
        }, this);
        }
    else if (
            (miserable === '0') ||
            (parseInt(hope, 10) > parseInt(total_shadow, 10))
        ) {
           
            miserable_attribute.set('current', '0');
            
            tokens.forEach(function(token) {
                // transparent
                token.set('status_bleeding-eye', false);
            }, this);
        } 
    else {
        return;
    }
    }
};
