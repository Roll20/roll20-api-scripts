/*
    The One Ring Stance Regions for Roll20.
    By Michael Heilemann (michael.heilemann@me.com)
    updated by Michael "Aragent" I,
    
        In running battles with The One Ring in Roll20, it's a very useful way to
    have players (and GM characters) set their Stance, simply by dropping their
    token on the right area of a Battle Mat.
    
    
    # How to Install It
    
    1) Insert the Voidstate's Battle Mat (Google it) and make it 750px wide (and
    appropriately tall), with its top left corner at the top left.
    
    2) Name the page it's on 'Battle'.


    # How To Use

    1) Make sure your characters have a `stance` (lowercase) attribute. If
    you're using the characters sheet I made for Roll20 (it's in the dropdown),
    it should already be available on the characters.

    2) Drop a character's tokens onto the battlemat, and their stance should
    update automatically.
    
    3) Fight the shadow.
    
    
    # Further Use
    
    - Now that characters have the stance attribute in place, and it's
    automatically set by dragging the token, you can use it in macros like this
    (as an example):
    
    /r 1t[feat] + @{weapon_rating_1}t[@{weary}] + ?{Circumstantial Modifier|0} > [[@{stance} + @{target|parry}]]

    - If you also use tor-dice-checker.js, with that Target Number in there,
    it'll tell you whether it was a success or not, and if so how much.
    
    Now that's Elven Magic.
    
    
    # More Information

    For more of my The One Ring shenanigans:
    https://ringen.squarespace.com/loremasters-journal/
    */
on("change:graphic:top", function(obj) {
    updateStanceOnDrop(obj);
});

var updateStanceOnDrop = function (obj) {
   var page = findObjs({
        _type: 'page',
        _id: obj.get('_pageid'),
    })[0];

    if (!obj.get('represents').length || page.get('name') !== 'Battle') {
        return;
    }

    var left = parseInt(obj.get('left'), 10);
    var top = parseInt(obj.get('top'), 10);
    var forwardTop = 0;
    var openTop = 290;
    var defensiveTop = 520;
    var rearwardTop = 760;

    // outside the mat.
    if (left > 730 || top > 1010) {
        return;
    }

    // forward
    if (top < openTop) {
        setStanceOnTokensCharacter(obj, 6);

    // open
    } else if (top >= openTop && top < defensiveTop) {
        setStanceOnTokensCharacter(obj, 9);

    // defensive
    } else if (top >= defensiveTop && top < rearwardTop) {
        setStanceOnTokensCharacter(obj, 12);

    // rearward
    } else if (top >= rearwardTop) {
        setStanceOnTokensCharacter(obj, 12);

   }
};

var setStanceOnTokensCharacter = function (token, newStance) {
    var characterid = token.get('represents');
    var stance = findObjs({
        _characterid: characterid,
        _type: 'attribute',
        name: 'stance'
    })[0];
    
    if(stance){
        stance.set('current', newStance.toString());
    } else {
        createObj('attribute',{
            characterid: characterid,
            name: 'stance',
            current: newStance.toString()
        });
    }

    stance.set('current', newStance.toString());
    sortTurnorder();
    // sendChat('character|'+characterid, '/w gm !sortturnorder');
};