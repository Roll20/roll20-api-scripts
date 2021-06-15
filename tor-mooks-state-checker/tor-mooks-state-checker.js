/*
    The One Ring Mook State Checker for Roll20.
    By Michael Heilemann (michael.heilemann@me.com)
    updated by Michael "Aragent" I,
    
    If you set up your tokens following the guidelines on the Roll20 Wiki
    (https://wiki.roll20.net/Linking_Tokens_to_Journals), with the following
    attributes set up in the right bars:
    
        bar1: endurance (integer)
        bar2: hate (integer)
        bar3: weary (normal/weary)
    
    This script will change the weary state automatically when hate hits 0,
    and if you then also set up your mook's macros to roll against
    [@{selected|bar3}] and you've set up your Rollable Tables in accordance
    with this page: https://wiki.roll20.net/The_One_Ring, you can have your
    macros automatically roll on the right table, etc.
    
    Here's an example:
   
        /r 1t[lm-feat] + @{selected|primary_weapon}t[@{selected|bar3}] > [[@{target|stance} + @{target|parry}]]
    
    It sounds more complicated than it is, here's a checklist:
    
    1. Set up your creature as a mook token (A character linked to a token, but
       where the bars are set to values as above, but not linked to attributes).
    2. Set up The One Ring rollable tables.
    3. Set up macros on the character to which the token is linked, revealing
       them preferably as token macros.
   
   Voila.
 */
on('ready', function() {
    var characters = findObjs({
        _type: 'graphic'
    });

    characters.forEach(checkMook, this);
});

on('change:graphic:bar2_value', function(token) {
    checkMook(token);
});

var checkMook = function (token) {
    if (token.get('bar1_link')) {
        // mook's shouldn't have bar1 linked, so this isn't a mook, abort!
        return;
    }

    var hate = token.get('bar2_value');

    if (hate === '0') {
        token.set('bar3_value', 'weary');
    } else {
        token.set('bar3_value', 'normal');
    }
};