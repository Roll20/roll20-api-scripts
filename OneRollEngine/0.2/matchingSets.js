//this script listens for dice rolls and checks them for matching sets

var MatchSets = MatchSets || (function(){
    'use strict';

    var version = 0.2;

    var useroptions = (globalconfig && 
      (globalconfig.MatchSets || globalconfig.matchsets)) ||
      {'Die Size': 10};

    on('chat:message', function(msg) {
    //This allows players to append !sets to a roll and find matches
      if (msg.type == 'api' && msg.content.indexOf ('!sets ') !== -1) {
          var dice = msg.content.replace('!sets ', '');
          sendChat(msg.who, '/roll ' + dice +'sa !sets');
      }
    });

    // gets the comments out of all the groups in a set of die rolls
    function getComment(content) {
        'use strict';
        var comment = '';

        content.rolls.forEach(function(roll){
            if (roll.type == 'C'){
                comment += roll.text;
            }
        });
        return comment;
    }
    
    //checks for '!sets' argument in msg.content
    function needsSets(content){
        var requestedSets = ( getComment(content).indexOf('!sets') != -1 || content.rolls[0].sides == useroptions['Die Size'] );
        return requestedSets;
    }
    
    //checks for 'sh' argument in msg.content
    function needSort(content){
        var requestedSort = ( getComment(content).indexOf('sh') != -1 );
        return requestedSort;
    }

    function handleInput(msg) {
        var isRoll = (msg.type == 'rollresult' || msg.type == 'gmrollresult');

        if (isRoll) {
            var content = JSON.parse(msg.content);
            var doGetSets = needsSets(content);

            if ( doGetSets ) {

                //create an array to match sides
                var matches = [null];

                //make an index in the array for each side of the die
                for (var i = 0; i < content.rolls[0].sides; i++) {
                    matches.push(0);
                }

                //get dice results of first roll
                var results = content.rolls[0].results;

                //record number of dice for each result
                for ( var i = 0; i < results.length; i++ ) {
                    var current_result = results[i].v;
                    matches[current_result] += 1;
                }

                //output results
                var chat_output = ''
                var separator = ''
                //appending 'sh' to a roll sorts set results by height
                var doSort = needSort(content);
                if (doSort) {
                    //height desc sorted output
                    for ( var i = matches.length; i > 0; i--){
                        if (matches[i] > 1) {
                            chat_output += separator + ' ``' + i + 'x' + matches[i] + '``' ;
                            separator = ', '
                        }
                    }
                } else {
                    //height asc default output
                    for ( var i = 0; i < matches.length; i++){
                        if (matches[i] > 1) {
                            chat_output += separator + ' ``' + matches[i] + 'x' + i + '``' ;
                            separator = ', '
                        }
                    }
                }
                if (chat_output.length == 0) { chat_output = 'no sets' }

                if (msg.type == 'gmrollresult') {
                    sendChat(msg.who,'/w gm got '+chat_output);
                } else {
                    sendChat(msg.who,'/em got '+chat_output);
                }
            }
            else return;
        }
        else return;
    }       

    function registerEventHandlers() {
        on('chat:message', handleInput);
    }

    return { 
        registerEventHandlers: registerEventHandlers,
    }
}());


on('ready',function(){
    'use strict';

    MatchSets.registerEventHandlers();
});
