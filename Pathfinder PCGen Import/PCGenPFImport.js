var RegExpEscapeSpecial =/([\/\\\/\[\]\(\)\{\}\?\+\*\|\.\^\$])/g;
      
      var AddAttribute = AddAttribute || {};
      function AddAttribute(attr, value, charID) {
          if (value === undefined )
          {
              log(attr + " has returned an undefined value.");
              sendChat("Error on " + attr + " attribute", "This attribute has been ignored.");
          }
          else
          {
          createObj("attribute", {
          	name: attr,
      		current: value,
      		characterid: charID
      
      	});
          //use the line below for diagnostics!
          //log(attr + ", " + value);
      	return;
          }
      }
      function AddAttributeMax(attr, value, max, charID) {
          if (value === undefined )
          {
              log(attr + " has returned an undefined value.");
              sendChat("Error on " + attr + " attribute", "This attribute has been ignored.");
          }
          else
          {
          createObj("attribute", {
      		name: attr,
      		current: value,
            max: max,
      		characterid: charID
              
      	});
          //use the line below for diagnostics!
          //log(attr + ", " + value);
      	return;
          }
      }
      // function that adds the various abilities
      var AddAbility = AddAbility || {};
      function addAbility(ability, text, charID) {
      createObj("ability", {
                      name: ability,
                      description: "",
                      action: text,
                      istokenaction: true,
                      characterid: charID
                  });
      }
      
      function stripString(str, removeStr, replaceWith) {
          var r= new RegExp(removeStr.replace(RegExpEscapeSpecial,"\\$1"),'g');
          return str.replace(r,replaceWith);
      }
      
      function getValueFromText(lines, key) {
          for (var i = 0; i < lines.length; i++) {
              pair = lines[i].split(':')
              if (pair[0] == 'character_name'){
                  return pair[1]
              }
          }
      }
      
      on('chat:message', function (msg) {
      
          // Only run when message is an api type and contains "!PCGenPFImport"
          if (msg.type == 'api' && msg.content.indexOf('!PCGenPFImport') !== -1) {
      
      
          if (!(msg.selected && msg.selected.length > 0)) return; // Make sure there's a selected object
      
          var token = getObj('graphic', msg.selected[0]._id);
          if (token.get('subtype') != 'token') return; // Don't try to set the light radius of a drawing or card
      
          //*************  START CREATING CHARACTER****************
          // get notes from token
          var originalGmNotes = token.get('gmnotes');
          var gmNotes = token.get('gmnotes');
      
      
          //break the string down by line returns
          var data = gmNotes.split("%3Cp%3E");
      
          // gmNotes = stripString(gmNotes, "%3E", "");
          for (var i = 0; i < data.length; i++) {
                  data[i] = data[i].replace(/%3E/g,"");
                  data[i] = data[i].replace(/%3A/g,":");
                  data[i] = data[i].replace(/%3C/g,"<");
                  data[i] = data[i].replace(/%3E/g,">");
                  data[i] = data[i].replace(/%23/g,"#");
                  data[i] = data[i].replace(/%3A/g,":");
                  data[i] = data[i].replace(/%3B/g,",");
                  data[i] = data[i].replace(/%3D/g,"=");
                  data[i] = data[i].replace(/%20/g," ");
                  data[i] = data[i].replace(/%22/g,"\"");
                  data[i] = data[i].replace(/%29/g,")");
                  data[i] = data[i].replace(/%28/g,"(");
                  data[i] = data[i].replace(/%2C/g,",");
                  data[i] = data[i].replace(/%7C/g,"|");
                  data[i] = data[i].replace(/%27/g,"'");
                  data[i] = data[i].replace(/%40/g,"@");
                  data[i] = data[i].replace(/%7B/g,"{");
                  data[i] = data[i].replace(/%7D/g,"}");
                  data[i] = data[i].replace(/%5B/g,"[");
                  data[i] = data[i].replace(/%5D/g,"]");
                  data[i] = data[i].replace('</p',"");
          }
      
          var charName = getValueFromText(data,'character_name');
      
      
          // check if the character entry already exists, if so error and exit.
          var CheckSheet = findObjs({
              _type: "character",
              name: charName
          });
      
          if (CheckSheet.length > 0) {
              sendChat("ERROR", "This character already exists.");
              return;
          };
      
          //Create character entry in journal, assign token
          var character = createObj("character", {
              avatar: token.get("imgsrc"),
              name: charName,
              bio: token.get('gmnotes'),
              gmnotes: token.get('gmnotes'),
              archived: false
          });
      
          var charID = character.get('_id');
          token.set("represents", charID);
      
          var HP = 0
          var ac = 0
      
          for (var i = 0; i < data.length; i++) {
              pair = data[i].split(':')
              if (pair.length == 2){
                 AddAttribute(pair[0],pair[1],charID);
              }
              if (pair.length == 3){
                 AddAttributeMax(pair[0],pair[1],pair[2],charID);
              }
              if (pair[0] === "NPC-HD-misc"){
                 HP = pair[1];
              }
          }
      
          token.set("name", charName||'');
          //token.set("showname", true);
          token.set("bar1_value", HP||0);
          token.set("bar1_max", HP||0);
          //token.set("bar2_value", ac||0);
          //token.set("showplayers_bar3", true);
          token.set("status_blue",true);
      
      
          }
      });
      
