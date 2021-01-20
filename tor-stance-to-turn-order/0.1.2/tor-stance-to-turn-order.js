/*
	The One Ring Stance to turn orderfor Roll20.
	By Michael Heilemann (michael.heilemann@me.com)
	Updated by Michael "Aragent" I,
    
	This is an API script for Roll20.net, which takes the Stance Regions
	and puts it into the Turn Order.
 */

on('chat:message', function (obj) {
    var contentSplit = obj.content.split(' ');
    var command = contentSplit[0];
    var pars = contentSplit.splice(1, contentSplit.length-1);

    if (command === '!sortturnorder') {
        sortTurnorder();
    }
});

var sortTurnorder = function() {
    var campaign = Campaign();
    var turnorder;
    if (campaign.get('turnorder') == '') turnorder = [];
    else turnorder = JSON.parse(campaign.get('turnorder'));
    var sortedTurnorder = [];

    if (!turnorder.length) {
        return;
    }

    // run through all turns in the turnorder
    // set the turn's value to the stance value (if any)
    _.each(turnorder, function(turn, idx) {
        var characterid = getCharacteridFromTurn(turn);

        // stray token? ignore it
        if (characterid.length > 0) {
            var stance = getAttrByName(characterid, 'stance');
            var wits = parseInt(getAttrByName(characterid, 'wits'), 10);
            wits = (wits ? wits : getAttrByName(characterid, 'attribute_level'));
            turn.pr = (stance ? '' + stance + '' : '');
            turnorder[idx] = turn;
        }
    });

    var groupedTurnorder = _.groupBy(turnorder, function(turn) {
        return turn.pr;
    });

    // run through grouped stances
    for (var stance in groupedTurnorder) {
        if (groupedTurnorder.hasOwnProperty(stance)) {
            // sort each stance group by wits/attr lvl in place
            groupedTurnorder[stance] = _.sortBy(groupedTurnorder[stance], getWitsFromTurn);
        }

        _.each(groupedTurnorder[stance], function(turn) {
            sortedTurnorder.push(turn);
        });
    }

    // resort based on stance
    sortedTurnorder = _.sortBy(sortedTurnorder, function(turn) {
        return parseInt(turn.pr === '' || turn.pr === '0' ? 13 : turn.pr, 10);
    });

    sortedTurnorder = JSON.stringify(sortedTurnorder);

    Campaign().set('turnorder', sortedTurnorder);

};

var getCharacteridFromTurn = function (turn) {
    var token = getObj('graphic', turn.id);

    if (token !== undefined) {
        var characterid = token.get('represents');
        return characterid;
    }

    return false;
};

var getWitsFromTurn = function (turn) {
    var characterid = getCharacteridFromTurn(turn);

    // // stray token? ignore it
    if (characterid.length > 0) {
        var wits = getAttrByName(characterid, 'wits');
        wits = (wits ? wits : getAttrByName(characterid, 'attribute_level'));
        return parseInt(wits, 10) * -1;
    }

    return 0;
};
