//HazInspiration v. 0.22 created  on the 9-27-2017 by Giger, my first script with massive help from TheAaron and code shamelessly stolen from Sky's Initiative System (it's pretty)
/*
    This script reports to the chat window, and updates the players token with an icon, to indicate whether the player has Inspiration or not.
    Designed for the 5th Edition (OGL) Character Sheet.
    
    With updates from Thorsten B. 
*/




on('ready',()=>{
const getCharacterTokens = (cid) => findObjs({type:'graphic'}).filter((t)=>t.get('represents')===cid);
//Brightness 
    var getBrightness = getBrightness || {};
    var getHex2Dec = getHex2Dec || {};


    function getBrightness(hex) {
        hex = hex.replace('#', '');
        var c_r = getHex2Dec(hex.substr(0, 2));
        var c_g = getHex2Dec(hex.substr(2, 2));
        var c_b = getHex2Dec(hex.substr(4, 2));
        return ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    };


    function getHex2Dec(hex_string) {
        hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
        return parseInt(hex_string, 16);
    };


  const announceInspiration = function (id) {
    //Handles Chat Annoucement
    if ( _.isEmpty(id)) return;
    var character = getObj("character", id);
    AlertTokenName = character.get("name");
    var AlertColor = (character.get("controlledby").split(",")[0] === "all") ? "#FFF" : getObj("player", character.get("controlledby").split(",")[0]).get("color");
    var AlertTextColor = (getBrightness(AlertColor) < (255 / 2)) ? "#FFF" : "#000";
    var AlertShadowColor = (AlertTextColor == "#000") ? "#FFF" : "#000";
    var AlertOuterStyle = "max-height: 60px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;";
    var AlertInnerStyle = "max-height: 40px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: visible; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: " + AlertTextColor + "; background-color: " + AlertColor + "; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px; text-shadow: -1px -1px 0 " + AlertShadowColor + ", 1px -1px 0 " + AlertShadowColor + ", -1px 1px 0 " + AlertShadowColor + ", 1px 1px 0 " + AlertShadowColor + ";";
    var AlertImageStyle = "height: 40px; width: 40px; float: right; margin: -32px 5px 0px 0px;";
    sendChat("", "/desc <div style='" + AlertOuterStyle + "'><div style='" + AlertInnerStyle + "'>" + AlertTokenName + " is Inspired! </div><img src='https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png' style='" + AlertImageStyle + "'></img></div>");
        
        //Set Status Icon on Token
        getCharacterTokens(character.id).forEach((t)=>t.set('status_black-flag',true));

  };


  const dropInspiration = function (id) {
    //Remove Status Icon from Token & Notify of Usage
    if ( _.isEmpty(id)) return;
    var character = getObj("character", id);
        AlertTokenName = character.get("name");
    var AlertColor = (character.get("controlledby").split(",")[0] === "all") ? "#FFF" : getObj("player", character.get("controlledby").split(",")[0]).get("color");
    var AlertTextColor = (getBrightness(AlertColor) < (255 / 2)) ? "#FFF" : "#000";
    var AlertShadowColor = (AlertTextColor == "#000") ? "#FFF" : "#000";
    var AlertOuterStyle = "max-height: 60px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;";
    var AlertInnerStyle = "max-height: 40px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: visible; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: " + AlertTextColor + "; background-color: " + AlertColor + "; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px; text-shadow: -1px -1px 0 " + AlertShadowColor + ", 1px -1px 0 " + AlertShadowColor + ", -1px 1px 0 " + AlertShadowColor + ", 1px 1px 0 " + AlertShadowColor + ";";
    var AlertImageStyle = "height: 40px; width: 40px; float: right; margin: -32px 5px 0px 0px;";
    sendChat("", "/desc <div style='" + AlertOuterStyle + "'><div style='" + AlertInnerStyle + "'>" + AlertTokenName + " used Inspiration! </div><img src='https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png' style='" + AlertImageStyle + "'></img></div>");
        
        //Unset Status Icon on Token
    getCharacterTokens(character.id).forEach((t)=>t.set('status_black-flag',false));
  };


  on("chat:message", function(msg) {
      //Is script running?
    if(msg.type == "api" && msg.content.indexOf("!inspiration") !== -1) { 
      sendChat("", "/desc <div style='max-height: 40px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;'><div style='max-height: 20px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: hidden; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: fff; background-color: 20b2aa; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px'>Inspiration Tracking Online!</div></div>");
    }
  });


  // Has a character sheet been updated?
  on("change:attribute", function(obj) {
      var isupdated = obj.get("name");
    

    //Was it the Inspiration attribute?
    if (isupdated =="inspiration"){
      var val = obj.get("current");
      var id = obj.get("_characterid");  
      //Gained Inspiration?
      if (isupdated =="inspiration" && val == "on"){
          // Announce Character Inspired
          announceInspiration(id);
      }else if (isupdated =="inspiration" && val == "0"){
        //Remove Inspiration Icon from Token
        dropInspiration(id);
      } 
  
    }

  });

  log('-=> HazInspiration <=- V0.22');  

  sendChat("", "/desc <div style='max-height: 40px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;'><div style='max-height: 20px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: hidden; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: fff; background-color: 20b2aa; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px'>Inspiration Tracking Online!</div></div>");

});
