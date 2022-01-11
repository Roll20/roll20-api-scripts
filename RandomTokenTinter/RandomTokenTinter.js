/***************************************************************************************************

    RandomTokenTinter.js:
    
    API Script to randomly assign tints to tokens from either a command-line list or from a
    rollable table
    
    Usage: !randtint <--help> <--pc> <--ids ID1..IDn> <--ignore-selected> <--tintlist -TINT1..-TINTn> | <--tinttable -TABLENAME>
    
    '--help' will display a summary of the usage information.
    '--pc' will cause selected (or ID-listed) PC tokens to be affected as well (by default they are ignored).
    '--ids ID1..IDn' will add the listed token IDs to the list of tokens to be affected.
    '<--ignore-selected>' will cause any selected tokens appearing in the ID list to be deleted from said list
                          so that they will _not_ be processed.
    '--tintlist -TINT1..-TINTn' indicates that the list of tints TINT1..TINTn are the list of tints to be
                                chosen randomly from, each TINT in the form of a 6-digit hex value #RRGGBB
                                for a color, or the word 'transparent' to indicate the removal of tinting.
                                Note that --tintlist and --tinttable are mutually exclusive and that
                                a valid --tintlist will be implemented in preference to --tinttable if both
                                are present.  It is perfectly acceptable to have only one entry in --tintlist
                                if you want all the targeted tokens to be that one color.  This is particularly
                                useful for removing tinting from tokens.  It is also worth noting that neither
                                the hex values nor the word 'transparent' are case-sensitive.  A default
                                "rainbow" tint palette will be used if no tints are provided.
    '--tinttable -TABLENAME' indicates that the list of tints is contained in the rollable table TABLENAME,
                             which contains Name entries in the form of 6-digit hex values #RRGGBB for a color,
                             or the word 'transparent' to indicate the removal of tinting.  --tinttable will
                             be ignored if a valid --tintlist is present on the command line.
    
    Revision History:
    Version 0.0.0 2-December-2021: Original Release by Bill (Do Not Kill).
    
***************************************************************************************************/
var RandomTokenTinter = RandomTokenTinter || (function() {
    'use strict';

    var version = '0.0.0',
/*
   This function accepts a list of object IDs amd returns a list of
   guaranteed unique token objects
*/
    getTokenObjects = function(selected) {
        return _.chain(selected)
            .map(function(s) { // Create the list of objects from the list of IDs.
                return getObj('graphic', s);
            })
            .reject(_.isUndefined) // Throw out any 'undefined' objects
            .filter(function(t) { // Keep only 'token' objects
                return (t.get('subtype') === 'token');
            })
            .uniq() // Throw out any duplicate objects
            .value();
    }, // end getSelectedTokens
    
    checkInstall = function() {
        log('RandomTokenTinter v' + version + ' is ready!');
    },
/*
   This rather confusing function returns a boolean FALSE if the object ID
   does not refer to an NPC-type character sheet, but returns some form
   of the number 1 if it does.
*/
    isNpc = function(id) {
        var checkNpc = findObjs({
            _type: 'attribute',
            _characterid: id,
            name: 'npc'
        });
        if (_.isUndefined(checkNpc[0])) {
            return false;
        } else {
            return checkNpc[0].get('current');
        }
    }, // end isNpc

    main = function(msg) {
        var header;
        var footer;
        var idIndex; // Index into arglist for where the IDs start
        var tokenList; // List of IDs of tokens to tint.
        var selectedList; // List of IDs of selected tokens.
        var tokenObjectList; // Filtered list of token objects for processing
        var tintIndex; // Index into arglist fopr where the tint list (or table) starts
        var tintList; // List of command-line tint values
        var tempTint; // Holds command-line tint value for validation
        var tintVal; // Holds converted tint hex value for validation
        var tintTable; // Boolean TRUE if an external table is to be used for the tints
        var tintTableName; // Parsed name of rollable tint table
        var includePCs; // Boolean set TRUE id PC tokens are to be included
        var workChID; // ID if the object the token represents so that PCs can be selectively excluded
        var rollString; // initiative roll string to pass to the chat window for rolling
        
/*
    Check to see if: 1) the chat event is an API message, and
                     2) that this message is in fact meant for this function.
*/            
        if (!(msg.type === 'api' && !msg.content.search(/^!randtint\b/))) return;

        var args = msg.content.split(' '); // Parse the message

        if (args.includes('--help')) { // Check for help request.
            header = "<div style='width: 100%; color: #000; border: 1px solid #000; background-color: #fff;" +
                         " box-shadow: 0 0 3px #000; width: 90%; display: block; text-align: left; font-size: 13px;" +
                         " padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
            var helpText = '<b>Random Token Tinter</b> <i>v.' + version + '</i><br><i>Created by Bill (Do Not Kill)</i><br>' +
                       'Usage: !randtint <--help> <--pc> <--ids ID1..IDn> <--ignore-selected> [--tintlist -TINT1..-TINTn | --tinttable -TABLENAME]<br><br>' + 
                       '--help will display a summary of the usage information.<br>' +
                       '--pc will cause selected (or ID-listed) PC tokens to be affected as well (by default they are ignored).<br>' +
                       '--ids ID1..IDn will add the listed token IDs to the list of tokens to be affected.<br>' +
                       '<--ignore-selected> will cause any selected tokens also appearing in the ID list to be deleted from ' +
                       'said list so that they will _not_ be tinted.<br>' +
                       '--tintlist -TINT1..-TINTn indicates that the list of tints TINT1..TINTn are the list of tints to be ' +
                       'chosen randomly from, each TINT in the form of a 6-digit hex value #RRGGBB for a color, or the word ' +
                       '"transparent" to indicate the removal of tinting.  Note that --tintlist and --tinttable are mutually ' +
                       'exclusive and that a valid --tintlist will be implemented in preference to --tinttable if both are present. ' +
                       'It is acceptable to have a single entry in --tintlist to tint all targeted tokens the same color.' +
                       'A default "rainbow" tint palette will be used if no other palette is provided.<br>' +
                       '--tinttable -TABLENAME indicates that the list of tints is contained in the rollable table TABLENAME, ' +
                       'which contains "Name" entries in the form of 6-digit hex values #RRGGBB for a color, or the word ' +
                       '"transparent" to indicate the removal of tinting.  --tinttable will be ignored if a valid --tintlist ' +
                       'is present on the command line.<br><br>';
            footer = '</div>';
            sendChat('randtint', '/w ' + msg.who + header + helpText + footer);
            return;
        } // endif help
/*
    Now check to see if there is at least one object selected or listed
    to act upon to allow help to be displayed even if no targets are
    available.
*/            
        if (!msg.selected && !args.includes('--ids')) return;
/*
   Declare the default tint list in one place for maintenance purposes
                                    RED      ORANGE     YELLOW      GREEN      BLUE      PURPLE */
        var defaultTintList = [ '#cc0000', '#ee6600', '#ffff00', '#339020', '#0000cc', '#6600cc' ];
/*
   Begin by parsing the command line for targets and adding or subtracting the selection as required
*/                     
        tokenList = []; // Initialize to an empty list
        if (args.includes('--ids')) { //There is a list of IDs on the command line
            idIndex = args.indexOf('--ids') + 1; // IDs start right after the --ids tag
            while ((idIndex < args.length) && (args[idIndex].search(/^-[^-]/) >= 0)) { // IDs start with a '-' followed by a non-'-'
                tokenList.push(args[idIndex]); // append to tokenList
                ++idIndex; // process the next argument
            } // wend args[idIndex]
        } // endif args includes --ids
/*
   Now pull up the list of selected objects (if present)
*/
        if (msg.selected) {
            selectedList = _.pluck(msg.selected,'_id'); // Extract a list of IDs from the selected objects
            selectedList = _.uniq(selectedList); // Eliminate any possible duplicates
        } else { // Nothing selected, make empty list
            selectedList = [];
        }
/*
   Process the selected tokens in accordance with --ignore-selected, assuming that there are amy
*/
        if (selectedList[0] && args.includes('--ignore-selected')) {
            tokenList = _.reject(tokenList, function(i) { // Exclude selected tokens from command-line list
                                     return selectedList.includes(i);
                                } );
        } else { // Don't exclude selected tokens,
            Array.prototype.push.apply(tokenList, selectedList); // append them
        } // endif --ignore-selected
/*
   Make a list of actual token objects, eliminating any possible duplicates and any possible non-tokens
*/
        tokenObjectList = getTokenObjects(tokenList);
/*
   Now figure out if there is a tintList to process 
*/        
        if (args.includes('--tintlist')) {
            tintIndex = args.indexOf('--tintlist') + 1;
            tintList = [];
            while ((tintIndex < args.length) && (args[tintIndex].search(/^-[^-]/) >= 0)) { // Tints start with a '-' followed by a non-'-'
                tempTint = args[tintIndex].slice(1); // Capture the tint value for validation.
                tempTint = tempTint.toLowerCase(); // Conventionalize on lower case
                if (tempTint === 'transparent') { // 'transparent' won't convert to hex, so test for that separately
                    tintList.push(tempTint);
                } else {
                    if (tempTint[0] === '#') { // First test: does it start with '#'?
                        tintVal = Number('0x' + tempTint.slice(1)); // Convert subsequent characters to hex.
                        if (!isNaN(tintVal)) tintList.push(tempTint);
                    } // endif tempTint[0] === '#'
                }   
                ++tintIndex; // process the next argument
            } // wend args[idIndex]
        } // endif tintlist
/*
   There needs to be a separate 'if' here to cover the remote case where the provided tintlist is invalid
   but a tinttable has been provided.
*/
        if (!args.includes('--tintlist') || (tintList.length === 0)) { // Check for a tint table name
            tintIndex = args.indexOf('--tinttable') + 1; // indexOf is -1 if there is no tinttable
            if (tintIndex > 0) {
                tintTableName = args[tintIndex].slice(1); // Extract the name of the alleged tint table
                let workTable = findObjs({_type: 'rollabletable', name: tintTableName})[0]; // Try to find a rollable table by that name
                if (!workTable) {
                    sendChat('randtint', '/w ' + msg.who + ' No tints provided, using default rainbow.<br>');
                    tintTable = false;
                    tintList = defaultTintList;
                } else { // tintTable is valid
                    tintTable = true;
                } // endif invalid tint table
            } else { // no tints provided
                sendChat('randtint', '/w ' + msg.who + ' No tints provided, using default rainbow.<br>');
                tintTable = false;
                tintList = defaultTintList;
            } // endif tintIndex
        } else { // valid command-line tintList
            tintTable = false;
        }// endif --tintlist
/*
   Check to see if PC tokens are to be tinted if in the list
*/
        includePCs = args.includes('--pc');
/*
   Set the roll string here since it is constant within the loop
*/        
        if (tintTable) {
            rollString = '/r 1t[' + tintTableName + ']'; // Roll into the tint table
        } else {
            rollString = '/r 1d' + String(tintList.length) + '-1'; // Roll an index into tintList (hence the '-1')
        } // endif tintTable
        
        tokenObjectList.forEach(function (t) { // Iterate over the list of surviving token objects
/*
  I need the character sheet behind the token that I might know whether or not it is
  a PC, and whether or not to exclude it from tinting.
*/
            workChID = t.get('represents');
/*
   Next determine if this token is represented by an NPC/monster character sheet or by a PC
   character sheet, or if I care.  PC tokens will by default be excluded from tinting to protect
   against accidentally tinting characters which might happen to be in the selection area.
*/
            if (includePCs || (parseInt(isNpc(workChID)) === 1)) {
/*
   There are two separate roll processes depending on whether I'm pulling a number out
   of a table or rolling an index into the tintList.  I do not trust the callback function
   to properly access tintTable (even though it is a constant for each iteration)
   because it is possible for tintTable to go out of scope before all of the callback
   processes complete.
*/
                if (tintTable) {
/*
   Now actually roll the tint and capture the result.  The table outputs will
   all be strings, so I can just capture the result and assign it to the
   appropriate token property in the callback function.
   
   The real pain in the neck here is that sendChat() is actually an asynchronous
   background task.  What this means is that for each tint roll it is necessary
   to update the token property inside the callback function since the roll results
   and anything derived therefrom are volatile and not guaranteed to persist
   once the sendChat() callback function exits scope.  Worse yet, _ANY_ variables
   outside the scope of the callback function are volatile, so it is necessary to
   pass in the target token ID (t.id), so that it can appear in the callback argument
   object 'r'.  It is then necessary to regenerate the token object internal to the
   callback function, since I rather suspect that I will not be able to successfully
   pass an entire token object as the 'speakingAs' argument.
   
   It is also worth pointing at that (quelle surprise) that there is an error in the
   documentation for sendChat() with respect to identifiers in the 'speakingAs'
   argument.  Apparently, the 'speakingAs' argument is simply passed into the 'who'
   property of the callback object as a string literal.
*/                                        
                    sendChat(t.get('id'), rollString, function (r) {
                        let roll = JSON.parse(r[0].content); // Objectify the important parts of the roll object
                        tintVal = roll.rolls[0].results[0].tableItem.name; // The table entry name I need is really deeply buried
                        let tokenID = r[0].who; // Recover the ID of the token to be tinted
                        let token = getObj('graphic', tokenID); // Retrieve the actual token object
                        token.set('tint_color', tintVal); // Assign the new tint color
                    } ); // end sendChat with callback
                } else { // !tintTable, use tintList
/*
   In this case, I'm rolling a die to index into tintList.  roll.total is
   a number, so I can just use the result directly as an index since I
   preset the roll to be 0-(length-1).
*/                                        
                    sendChat(t.get('id'), rollString, function (r) {
                        let roll = JSON.parse(r[0].content); // Objectify the important parts of the roll object
                        tintVal = tintList[roll.total]; // Use the roll value to point into the tint list
                        let tokenID = r[0].who; // Recover the ID of the token to be tinted
                        let token = getObj('graphic', tokenID); // Retrieve the actual token object
                        token.set('tint_color', tintVal); // Assign the new tint color
                    } ); // end sendChat with callback
                } // endif tintTable
            } /* else {} */ // Here is where to add processing for "PC" character sheets, if desired
                            // otherwise, endif isNpc
         } ); // end tokenList.forEach
    }, // end main

    registerEventHandlers = function() { // Attach main() to the chat window
        on('chat:message', main);
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
}());

on('ready', function() { // Attach this to the game
    'use strict';

    RandomTokenTinter.CheckInstall();
    RandomTokenTinter.RegisterEventHandlers();
});