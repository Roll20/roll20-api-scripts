// Rollable Table Macros
// API Commands:
// !rtm table-name(required) myself/from-name(optional)

var RollableTableMacros = RollableTableMacros || ( function() {
    'use strict';
    
    var commandListener = function() {
        // Listens for API command
        on( 'chat:message', function( msg ) {
            if( msg.type === 'api' && !msg.rolltemplate ) {
                var params = msg.content.substring( 1 ).split( ' ' ),
                    command = params[0].toLowerCase(),
                    tableName = params[1] ? params[1].toLowerCase() : '',
                    msgFrom = getFrom( params, msg.playerid );
                
                if( command === 'rtm' ) {
                    findTable( msgFrom, tableName );
                }
            }
        });
    },
    
    getFrom = function( params, playerId ) {
        // Determine the sender of the messages. Defaults to table name (formatted to title case).
        var msgFrom = titleCase( params[1].replace( /-/g, ' ' ) );
        
        if( params.length > 2 ) {
            // If the optional third paramater was passed, assign sender to that string or original sender ('myself')
            msgFrom = params.splice( 2 ).join( ' ' );
            msgFrom = msgFrom.toLowerCase() == 'myself' ? ( 'player|' + playerId ) : msgFrom;
        }
        
        return msgFrom;
    },
    
    findTable = function( msgFrom, tableName ) {
        // Finds the corresponding table, outputs error message to chat if not found
        var tables = findObjs({ type: 'rollabletable', name: tableName }, { caseInsensitive: true });
        
        if( tables.length < 1 ) {
            sendChat( msgFrom, 'No such table exists.' );
        } else {
            rollTable( tables[0].id, msgFrom );
        }
    },
    
    rollTable = function( tableId, msgFrom ) {
        // Picks an item from the table
        var items = findObjs({ type: 'tableitem', rollabletableid: tableId }),
            weightedList = [];
        
        if( items.length > 0 ) {
            _.each( items, function( item ){
                // Build a weighted list to draw from
                let weight = item.get( 'weight' );
                _( weight ).times(function( x ){
                    weightedList.push( item.id );
                });
            });
        
            var chosenItem = getObj( 'tableitem', weightedList[ randomInteger( weightedList.length ) - 1 ] );
        
            sendChat( msgFrom, handleMacro( chosenItem.get( 'name' ) ) );
        } else {
            sendChat( msgFrom, 'No items on this table.' );
        }
    },
    
    handleMacro = function( resultText ) {
        // Recursively handles any macro calls
        var resultLines = resultText.split( "\n" );
        
        _.each( resultLines, function( line, index, resultArray ){
            var lineArray = line.split( ' ' );
            
            _.each( lineArray, function( word, index, parentArray ){
                if( word[0] === '#' ) {
                    var macro = findObjs({ type: 'macro', name: word.substring( 1 ) });
                
                    parentArray[ index ] = macro.length > 0 ? handleMacro( macro[0].get( 'action' ) ) : word;
                }
            });
            
            resultArray[ index ] = lineArray.join( ' ' );
        });
        
        return resultLines.join( "\n" );
    },
    
    titleCase = function(str) {
        // returns the string in title case (each word capitalized)
        return str.toLowerCase().replace(/(^| )(\w)/g, function(x) {
            return x.toUpperCase();
        });
    };
    
    return {
        CommandListener: commandListener
    };
    
}());

on( 'ready', function(){
   'use strict';
   
   RollableTableMacros.CommandListener();
});
