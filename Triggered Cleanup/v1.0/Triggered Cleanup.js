/*  This script wildelete all tokens that are linked to a character when entering [!cleanup] in the chat (not case-sensitive).
    The script will also delete tokens for character sheets that are deleted.
    The script will not delete any tokens on a map with the phrase "Bullpen" (not case sensitive) in the name.
*/
on('destroy:character',function(obj){
    log(obj.get('_id'))
	var tokens = findObjs({ type: 'graphic', represents: obj.get('_id') });
    const inMap = new Array()
    var maps = findObjs({type: 'page'})
    for (var i = 0; i < maps.length; i++) {
        if (maps[i].get('name').toLowerCase().includes('bullpen')){
            inMap.push(maps[i])
        }
    }
    for(var i = 0; i < tokens.length; i++){
        var flag = 1
        for(var j = 0; j < inMap.length; j++){
            if(tokens[i].get('_pageid')===inMap[j].get('_id')){
                log("inMap Name: " + inMap[j].get('name'))
                flag = 0
            }
        }
        if (flag){
            tokens[i].remove();
        }
    }
})

on("chat:message", function(msg) {
	var tokens = findObjs({ type: 'graphic' });
    const inMap = new Array()
    var maps = findObjs({type: 'page'})
    if(msg.content.toLowerCase() === "!cleanup"){
        for (var i = 0; i < maps.length; i++) {
            if (maps[i].get('name').toLowerCase().includes('bullpen')){
                inMap.push(maps[i])
            }
        }
        for(var i = 0; i < tokens.length; i++){
            log("Token: " + tokens[i].get('_id') + " & " + tokens[i].get('represents'))
            var flag = 1
            for(var j = 0; j < inMap.length; j++){
                if(tokens[i].get('represents') === ''){
                    flag = 0
                }
                if(tokens[i].get('_pageid')===inMap[j].get('_id')){
                    log("inMap Name: " + inMap[j].get('name'))
                    flag = 0
                }
            }
            if (flag){
                tokens[i].remove();
                log('Delete')
            }
        }
    }
})