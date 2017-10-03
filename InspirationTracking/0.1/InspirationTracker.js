//HazInspiration v. 0.1 created  on the 9-27-2017 by Giger, my first script with massive help from TheAaron and code shamelessly stolen from Sky's Initiative System (it's pretty)
/*
    This script reports to the chat window, and updates the players token with an icon to indicate whether the player has Inspiration or not.
*/

AnnounceInspiration = function (id) {
          //character_ID is passed from on change
          //sendChat("",id);
          if ( _.isEmpty(id)) return;
           var character = getObj("character", id);
          // log (character);
                        
            const getCharacterTokens = (cid) => findObjs({type:'graphic'}).filter((t)=>t.get('represents')===cid);
      
            getCharacterTokens(character.id).forEach((t)=>t.set('status_black-flag',true));
            var AlertTokenName = character.get("name");
         
            var AlertColor = getObj("player", character.get("controlledby").split(",")[0]).get("color");
            var AlertTextColor = (getBrightness(AlertColor) < (255 / 2)) ? "#FFF" : "#000";
            var AlertShadowColor = (AlertTextColor == "#000") ? "#FFF" : "#000";
            var AlertOuterStyle = "max-height: 40px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;";
            var AlertInnerStyle = "max-height: 20px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: hidden; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: " + AlertTextColor + "; background-color: " + AlertColor + "; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px; text-shadow: -1px -1px 0 " + AlertShadowColor + ", 1px -1px 0 " + AlertShadowColor + ", -1px 1px 0 " + AlertShadowColor + ", 1px 1px 0 " + AlertShadowColor + ";";
            var AlertImageStyle = "height: 40px; width: 40px; float: right; margin: -32px 5px 0px 0px;";
            sendChat("", "/desc <div style='" + AlertOuterStyle + "'><div style='" + AlertInnerStyle + "'>" + AlertTokenName + " is Inspired! </div><img src='https://s3.amazonaws.com/files.d20.io/images/39783029/-w45_4ICV9QnFzijBimwKA/max.png' style='" + AlertImageStyle + "'></img></div>");

      };
      
 DropInspiration = function (id) {
          //character_ID is passed from on change
          //sendChat("",id);
          if ( _.isEmpty(id)) return;
           var character = getObj("character", id);
            //  log ('dropped');
                        
            const getCharacterTokens = (cid) => findObjs({type:'graphic'}).filter((t)=>t.get('represents')===cid);
            getCharacterTokens(character.id).forEach((t)=>t.set('status_black-flag',false));
                
      };
      
  on("ready", function(){log('-=> HazInspiration <=- V0.0.1');  
    
      sendChat("", "/desc <div style='max-height: 40px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;'><div style='max-height: 20px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: hidden; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: fff; background-color: 20b2aa; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px; text-shadow: -1px -1px 0 000, 1px -1px 0 000, -1px 1px 0 000, 1px 1px 0 000'>Inspiration Tracking Online!</div></div>");
  
  });
      
      
  on("chat:message", function(msg) {
     if(msg.type == "api" && msg.content.indexOf("!inspiration") !== -1) { 
        sendChat("", "/desc <div style='max-height: 40px; width: 100%; margin: 10px 0px 5px -7px; line-height: 40px;'><div style='max-height: 20px; width: 100%; margin: 0px; padding: 0px 0px 2px 0px; clear: both; overflow: hidden; font-family: Candal; font-weight: lighter; font-size: 13px; line-height: 20px; color: fff; background-color: 20b2aa; background-image: linear-gradient(rgba(255, 255, 255, .4), rgba(255, 255, 255, 0)); border: 1px solid #000; border-radius: 4px; text-shadow: -1px -1px 0 000, 1px -1px 0 000, -1px 1px 0 000, 1px 1px 0 000'>Inspiration Tracking Online!</div></div>");
  
     }
   
  });
      
      // Has a character sheet been updated?
 on("change:attribute", function(obj, prev) {
   var isupdated = obj.get("name");
      if (isupdated =="inspiration"){
          // Only work if 'inspiration' was changed
          var val = obj.get("current");
          var id = obj.get("_characterid");  
          //Inspired-  Now, decide, is it turned on or off?
              if (isupdated =="inspiration" && val == "on"){
               //  It's On'
                 var charname = getAttrByName(id, "character_name");
                 //Get the Character Name for Annoucing
                      if(charname != ""){
                        //A Name was found, let's move on.
                        AnnounceInspiration(id);
                      } else {sendChat("", "Failed getting Character Name") ;
                                //Couldn't find a name
                             }
                  
                } else if (isupdated =="inspiration" && val != "on"){
                    //It's Off
                    DropInspiration(id);
              
                } 
                // Silent if not inspired
                
      }
      
      });
      
      
      
