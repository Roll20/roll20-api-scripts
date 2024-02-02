/*  This script wildelete all tokens for a character when one token representing that character is deleted (across all maps, including archived maps).
    The script will also delete tokens for character sheets that are deleted.
    The script will not delete any tokens on a map with the phrase "Bullpen" (not case sensitive) in the name.
*/

on('destroy:graphic',function(obj){
	var tokens = findObjs({ type: 'graphic', represents: obj.get('represents') });
    if(obj.get('represents')!==""){
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
                    flag = 0
                }
            }
            if (flag){
                tokens[i].remove();
            }
        }
    }
})

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