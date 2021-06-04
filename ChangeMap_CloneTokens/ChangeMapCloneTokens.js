/* 
------------------------------------------
Change Map Clone Tokens by Dystopian Djinni
Previous workflow for changing the page is drag player ribbon to new page, copy paste for all the tokens. What a shamozzle!
This script listens to change of page event (drag the ribbon) and will clone player tokens onto the new page. Ignoring duplicate tokens

Considerations:
- 'Player tokens' are tokens that 
    a.) have a charater sheet
    b.) character sheet is controlled by a player.
    
- 'Player tokens' are assumed to have unique names.

- The spawn coords of the new tokens reflect the original postion of the token on previous map.
------------------------------------------
*/


//variable to hold the player page
var playerPage;
var previousPage;

on("ready",function(){
    playerPage = Campaign().get("playerpageid");
    previousPage = Campaign().get("playerpageid");
});


//----listen for change of the player ribbon----
on("change:campaign:playerpageid", function(){
    
    previousPage = playerPage;
    playerPage = Campaign().get("playerpageid");
    movePlayersToPage(playerPage);
    
});


function movePlayersToPage(pageid){
    log("in move players");
    
    var tokens = getPlayerTokens();
    var tokensOnNewPage = tokenArrayToNames(getCharTokensOnPage(pageid));
    
    //do a name check of player tokens vs tokens on page.
    tokens = tokens.filter(function(token){
        return !tokensOnNewPage.includes(token.get("name"));
    })
    
    //move split partymembers. 
    Campaign().set({playerspecificpages:false,playerpageid:pageid});
    
    //create tokens again on new page
    createTokens(tokens,pageid);
}

function getPlayerTokens(){

    var PCs = findObjs({_type: "character"});
    var PCIds = [];
    PCs = PCs.filter(character=>character.get("controlledby") != "");
    PCs.forEach(function(character){
        PCIds.push(character.id);
    })

    var tokensOnPrevPage = getCharTokensOnPage(previousPage)
        .filter(token=>PCIds.includes(token.get("represents")) && token.get("name").length !== 0);
    
    var AllTokens = findObjs({type: "graphic", layer: "objects", subtype: "token"})
        .filter(token=>PCIds.includes(token.get("represents")) && token.get("name").length !== 0);

    var tokens = [];
    var tokensAdded = [];
    
    //adding the tokens found on previous page first because wewant to keep consistent status icons where possible
    tokensOnPrevPage.forEach(function(token){
        var name = token.get("name");
        if (!tokensAdded.includes(name)){
            tokens.push(token);
            tokensAdded.push(name);
        }
    });
    
    AllTokens.forEach(function(token){
        var name = token.get("name");
        if (!tokensAdded.includes(name)){
            tokens.push(token);
            tokensAdded.push(name);
        }
    });
    return tokens;
}

function getCharTokensOnPage(pageid){

    var tokens = findObjs({_type: "graphic", layer: "objects", subtype: "token", pageid: pageid })
        .filter(token=>token.get("represents") != "" );
    return tokens;
}

function tokenArrayToNames(tokens){
    
    var names = [];
    tokens.forEach(function(token){
        if(!names.includes(token.get("name"))){
            names.push(token.get("name"));
        }
    })
    return names
}

function createTokens(tokens,pageid){
    tokens.forEach(function(token){
        createToken(token,pageid);
    });
}


function createToken(token,pageid,offsetx,represents){
        
        if(offsetx == undefined){ offsetx = 0;}
        if(represents == undefined){represents = token.get("represents");}
    
        //src must be thumbnail for some reason
        var imgsrc = token.get("imgsrc").replace("max","thumb");
        
        var newToken = {
            
            name: token.get("name"),
            controlledby: token.get("controlledby"),
            represents: represents,
            
            left: token.get("left")+offsetx,
			top: token.get("top"),
			width: token.get("width"),
			height: token.get("height"),
			rotation: token.get("rotation"),
			
			pageid: pageid,
            imgsrc: imgsrc,
            statusmarkers: token.get("statusmarkers"),
			
            layer: token.get("layer"),
            gmnotes: token.get("gmnotes"),
            
            bar1_value: token.get("bar1_value"),
            bar1_max: token.get("bar1_max"),
            bar1_link: token.get("bar1_link"),
            bar2_value: token.get("bar2_value"),
            bar2_max: token.get("bar2_max"),
            bar2_link: token.get("bar2_link"),
            bar3_value: token.get("bar3_value"),
            bar3_max: token.get("bar3_max"),
            bar3_link: token.get("bar3_link"),
            
            aura1_radius: token.get("aura1_radius"),
            aura1_color: token.get("aura1_color"),
            aura1_square: token.get("aura1_square"),
            aura2_radius: token.get("aura2_radius"),
            aura2_color: token.get("aura2_color"),
            aura2_square: token.get("aura2_square"),
            tint_color: token.get("tint_color"),
            
            showname: token.get("showname"),
            showplayers_name: token.get("showplayers_name"),
            showplayers_bar1: token.get("showplayers_bar1"),
            showplayers_bar2: token.get("showplayers_bar2"),
            showplayers_bar3: token.get("showplayers_bar3"),
            showplayers_aura1: token.get("showplayers_aura1"),
            showplayers_aura2: token.get("showplayers_aura2"),
            playersedit_name: token.get("playersedit_name"),
            playersedit_bar1: token.get("playersedit_bar1"),
            playersedit_bar2: token.get("playersedit_bar2"),
            playersedit_bar3: token.get("playersedit_bar3"),
            playersedit_aura1: token.get("playersedit_aura1"),
            playersedit_aura2: token.get("playersedit_aura2"),
            light_radius: token.get("light_radius"),
            light_dimradius: token.get("light_dimradius"),
            light_otherplayers: token.get("light_otherplayers"),
            light_hassight: token.get("light_hassight"),
            light_angle: token.get("light_angle"),
            light_losangle: token.get("light_losangle"),
            light_multiplier: token.get("light_multiplier"),
            has_bright_light_vision: token.get("has_bright_light_vision"),
            has_night_vision: token.get("has_night_vision"),
            night_vision_distance: token.get("night_vision_distance"),
            emits_bright_light: token.get("emits_bright_light"),
            bright_light_distance: token.get("bright_light_distance"),
            emits_low_light: token.get("emits_low_light"),
            low_light_distance: token.get("low_light_distance"),
        };
        createObj("graphic",newToken);
}





