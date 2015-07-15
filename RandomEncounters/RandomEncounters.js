// Github:   
// By:       Olav Müller & chipbuddy
// Contact:  olav.mueller@gmx.de

// A shorthand to create new events in the encountertable.
var event = function(freq, msg) {
    return {message: msg, frequency: freq};
};
            
 
// A shorthand to whisper stuff to the GM>
var say = function(msg) {
    sendChat("RE", "/w gm " + msg);
}
 
// Pick a random event from a RollableTable, respecting the weights
// of the events.
var resolve = function(table) {
    
    var tableItems = findObjs({
        _type: "tableitem",
        _rollabletableid: table.id
    });
    
    var encountertable = [];
    
    _.each( tableItems, function( ti ) {
        encountertable.push( event( ti.get("weight"), ti.get("name") ) ); 
    });
    var total = 0;
    for (i in encountertable) {
        total += encountertable[i].frequency;
    };
    var roll = randomInteger(total);
    log("total is " + total + " roll " + roll);
    for (i in encountertable) {
        roll -= encountertable[i].frequency;
        if (roll <= 0) {
            return encountertable[i].message;
        }
    }
    return "something bad (has) happened";
};

// Select the correct random Table
var findTable = function( lok ) {
    var encounterTables = findObjs({
        _type: "rollabletable"
    });
    
    var correctTable = null; 
    
    _.each( encounterTables, function( obj ) {
        tablename = obj.get( "name" );
        tableid = obj.id;

        if( tablename.lastIndexOf( "RE-", 0 ) === 0 ) {
            var locForTable = tablename.replace("RE-", "");
            say( "-------------------------------------------" );
            if( locForTable == lok ) {
                correctTable = obj;
                return correctTable;
            }
        }
    });

    return null;
};
      
on("chat:message", function(msg) {
    if (msg.type != "api" || msg.content.indexOf("!enc ") !== 0) {
        return;
    }
    
    var args = msg.content.replace("!enc ", "").split( " " );

    var loc = args[0];
    var enctable = findTable( loc );
    
    if( enctable != null ) {
        sendChat("Table", "/roll " + args[1], function(ops) {
            var result = JSON.parse( ops[0].content ).total;

            if( result >= args[2] ) {
                say( result + " >= " + args[2] + " Here comes the random encounter:" );
                say( resolve( enctable ) );
            } else {
                say( result + " No random encounter occures." );
            }
        });    
    }
});