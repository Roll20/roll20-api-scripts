/*
    The One Ring State Checker for Roll20.
    By Michael Heilemann (michael.heilemann@me.com)
   
    # Weary
   
    Checks to see if a character's endurance drops below her fatigue, and
    automatically sets the `weary` attribute to `weary` or `normal`, depending.
    This is very useful particularly if you're using the TOR roll tables, as you
    can then read the weary attribute of the selected token in a macro and roll
    on the appropriate success die table automatically:
    
        /r 1t[feat] + @{travel}t[@{weary}]
    
    It requires that the character have `endurance`, `total_fatigue` and `weary`
    attributes.
    
    # Wounded / Treated Wound
    
    Sets a red marker on the tokens of wounded/treated wound characters, mostly
    to serve as a reminder.
    
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
    var tokens = findObjs({
        _type: 'graphic',
        represents: characterid
    });
    var fatigue = getAttrByName(characterid, 'total_fatigue', 'current');
    var endurance = getAttrByName(characterid, 'endurance', 'current');
    var weary = findObjs({type: 'attribute', characterid: characterid, name: 'weary'})[0];
    var wounded = getAttrByName(characterid, 'wounded', 'current');
    var wound_treated = getAttrByName(characterid, 'wound_treated', 'current');
    var hate = getAttrByName(characterid, 'hate', 'current');

    // WEARY

    // characters only
    if (fatigue && endurance && weary && !hate) {
        if (endurance <= fatigue) {
            weary.set('current', 'weary');
            tokens.forEach(function(token) {
                // #ff9900
                token.set('tint_color', '#ff9900');
            }, this);

        } else {
            weary.set('current', 'normal');
            tokens.forEach(function(token) {
                // transparent
                token.set('tint_color', 'transparent');
            }, this);
        }
    }

    // WOUNDED

    if (
        (wounded && parseInt(wounded, 10) !== 0) ||
        (wound_treated && parseInt(wound_treated, 10) !== 0)
    ) {
        tokens.forEach(function(token) {
            token.set('status_yellow', false);
            // #98000
            token.set('status_red', '');
        }, this);
    } else {
        tokens.forEach(function(token) {
            token.set('status_yellow', false);
            // transparent
            token.set('status_red', false);
        }, this);
    }
};
