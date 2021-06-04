// Author: Phillip Tran

/*
  Description: 
      Inspired by Disco Elysium, this script will roll a check for the player in
      the background then whisper the player if they pass that check. 
  
  Purpose: 
      One of the things I found immersion breaking was that other players would
      know the results of certain checks like Knowledge or Lore checks. Now 
      normally DMs would take time to whisper to the person the results of the 
      check if they wanted to keep this secret, but this takes time and can be 
      impractical to do in certain situations like if the DM wants the user to 
      do a Lore check in the middle of their narration. This script seeks to add 
      an easy way for DMs to do hidden rolls and let the player know information
      without distracting from the flow of the campaign
      
*/

'use strict';

var hidden_roll_messages = hidden_roll_messages || {} 

hidden_roll_messages.roll_controller = class {
    
    constructor() {
        /*--- User Config if no global config --- */
        let dice_sides = 20;
        let HRM_identifier = "!!!";
        /*-----------------------------------------*/

        if(globalconfig){
            dice_sides = globalconfig.dice_sides;
            HRM_identifier = globalconfig.HRM_identifier;
        }
        
        this.dice_sides = dice_sides;
        this.HRM_identifier = HRM_identifier; // the symbols used at the begining of a handout name
                                     // signify it should be a hidden roll message

        log(globalconfig)

        // edit down here if you know what you're doing
        this.name_json_map = {}; // key: name of the handout, value: the json info 
        this.GM = undefined;
        this.iden_length = this.HRM_identifier.length;                           
        
        this.GM = this.getGM();
        this.setup_listeners();
        this.process_all_current_HRMS();
        sendChat("hidden_roll_messages", "Script successfully loaded", null, {noarchive:true} );
    }
    
    getGM() {
        /*
        params: 
           - None 
        
        Desc: 
           Iterates through the players and return who is the GM
           
        Returns: 
           - (Player Obj) -> Player who is the GM
           
        Called from: 
            constructor()
        
        */
        
        let players = findObjs({                              
            _type: "player",                          
        });
        
        let i = 0;
        for (i = 0; i < players.length; i++){
            if(playerIsGM(players[i].get("id"))){
                return(players[i]);
            }
        }
    }

    setup_listeners() {
        /*
        params: 
           - None 
        
        Desc: 
           Sets up any event listeners when object is created. 
           
        Returns: 
           - None
           
        Called from: 
            constructor()
        
        */
        
        // Set up custom handlers below!
        on("change:handout", this.edit_hidden_roll_message.bind(this));
        on("destroy:handout", this.process_handout.bind(this));
        on("chat:message", this.parse_command.bind(this));
    }
    
    edit_hidden_roll_message(handout, prev){
        /*
        param: 
           @handout (handout_event) -> The handout that was just created
           @prev (list) -> list of previous values
        
        Desc:
           Parses the handout for `!!!` at the begining of the handout name.
           If found, obtain the JSON data and store it within the class.
           
        Returns: 
           - None
           
        Called from:
           constructor()
        */

        let handout_name = handout.get("name");
        let tag_check = ((handout_name.slice(0,this.iden_length) === this.HRM_identifier) ? true : false);
        let potential_HRM_tag = handout_name.slice(0, 5);
        
        if(tag_check) { // creating a new [HRM]
            let new_name = "[HRM] " + handout_name.slice(this.iden_length); // replace the identifier with [HRM]
            handout.set("name", new_name);
            handout.get("notes", this.extract_note_data.bind(this, handout));
        }
        else if(potential_HRM_tag === "[HRM]") { // Editing an existing [HRM]
            this.edit_HRM(handout, prev)
        }
        
    }
    
    extract_note_data(handout, note){
        /*
        param: 
           @note (note object) -> The notes corresponding to our HRM handout
           @handout (handout object) -> the handout object containing the note
        
        Desc:
           Parses the note and formats it, then converts it to json and stores it 
           within the name_json_map
           
        Returns: 
           - None
           
        Called from:
           add_hidden_roll_message()
        */
        
        let name = handout.get("name");
        let json_string = note.replace(/(<([^>]+)>)/gi, "");
        json_string = json_string.replace(/&nbsp;/gi, '');

        try{
            
            if(json_string.length == 0)
                throw "not valid Json";
            
            let json = JSON.parse(json_string);
            this.name_json_map[name] = json;
            sendChat(name, "/w " + this.GM.get("displayname") + " Status: <b>SUCCESS</b>", null, {noarchive:true} );
        
        }
        catch(err){
            sendChat(name, "/w " + this.GM.get("displayname") + " Status: <b>FAILED</b> \n Json Formatter: https://jsonformatter.curiousconcept.com/", null, {noarchive:true} );
            handout.set("name", "Invalid JSON Handout");
        }

    }
    
    process_handout(handout, delete_handout=true) {
        /*
        param: 
           @handout (handout Object) -> The handout that was just deleted
           @delete_handout (boolean) -> boolean to determine whether or not to delete the handout after the handout has finished rolling
        
        Desc:
           Parses the recently deleted handout and checks to see if it's an [HRM] handout.
           if it is, handle the roll and process the json data. 
           
        Returns: 
           - None
           
        Called from:
           constructor()
        */
        
        let handout_name = handout.get("name");
        let tag_check = ((handout_name.slice(0,5) === "[HRM]") ? true : false);
        
        if(tag_check) {
            
            let characters = findObjs({                              
                _type: "character",                          
            }).filter((obj) => obj.get("controlledby") != "" && obj.get("controlledby") != this.GM.get("displayname"));
            try{
                this.roll(characters, handout_name);    
                if(delete_handout)
                    delete this.name_json_map[handout_name]
            }
            catch(error) {
                log(error);
                sendChat("[HRM]", "Something went horribly wrong with the Json parsing! Are you sure that your format is the same in the documentation and that the attribute actually exists?", null, {noarchive:true} );
            }

        }
        
    }
    
    edit_HRM(handout, prev) { 
        /*
        params: 
           @handout (handout Object) -> The handout that was just deleted
           @prev {handout Object} -> Reference to the previous handout

        Desc: 
            This callback function will be called when the user is editing an existing [HRM] handout
            It will remove the previous reference in our dictionary and update it with the new information.

            ## make sure the name still contains the [HRM] tag in the front or things will not work.

        Returns: 
            - None, but updates the information in our name_json_map

        called from:
            process_handout()
        */

        delete this.name_json_map[prev["name"]] 
        handout.get("notes", this.extract_note_data.bind(this, handout))

    }

    roll(characters, handout_name) {
        /*
        params: 
            @characters -> an array of all the characters not controlled by the DM 
            @handout_name -> the name of the recently deleted handout
        
        Desc: 
            Iterates through the array of characters and simulates a roll. Then checks the json 
            and messages the player with the on_pass message if passed
        
        Returns: 
            - None
            
        Called From:
            process_handout()
        */
        
        let handout_json_dat = this.name_json_map[handout_name];
        let attr_to_check = handout_json_dat["attr"];
        let pass_value = handout_json_dat["pass"];
        let msg = handout_json_dat["on_pass"];
        let on_failed = handout_json_dat["on_failed"]; // optional json parameter
        
        let i = 0;
        for(i = 0; i < characters.length; i++) {
            let character = characters[i];
            let dice_roll = ((this.dice_sides != 0) ? randomInteger(this.dice_sides) : 0)
            let result = parseInt(getAttrByName(character.id, attr_to_check)) + dice_roll;
 
            if(result >= pass_value){
                let recipient = character.get("name").split(" ")[0]; // get first name only
                let command = "/w " + recipient + " [<b>SUCCESS: " + result + "</b>] " + msg;
                sendChat(attr_to_check, command, null, {noarchive:true} );
            }
            else if(on_failed != undefined) { 
                let recipient = character.get("name").split(" ")[0]; // get first name only
                let command = "/w " + recipient + " [<b>FAILED: " + result + "</b>] " + on_failed;
                sendChat(attr_to_check, command, null, {noarchive:true} );
            }
            
            // either way, whisper the result to the GM
            let command = "/w " + this.GM.get("displayname") + " <b> RESULT: " + character.get("name") + " | " + (result >= pass_value) + "</b>";
            sendChat("[HRM]", command, null, {noarchive:true} );
        }
        
    }
    
    process_all_current_HRMS(){
        /*
        params: 
            - None
        
        Desc: 
            Iterates through all current handouts and addes all the [HRM] and their corrponding
            JSON data to the name_json_map
        
        Returns: 
            - None
            
        Called From:
            constructor()
        */
        
        let handouts = findObjs({                              
            _type: "handout",                          
        });
        
        let i = 0;
        for( i = 0; i < handouts.length; i++ ) {
            
            let handout_name = handouts[i].get("name");
            let tag_check = ((handout_name.slice(0,5) === "[HRM]") ? true : false);
            
            if(tag_check){
                handouts[i].get("notes", this.extract_note_data.bind(this, handouts[i]));
            }
            
        }

    }

    parse_command(command){
        /*
            params: 
                @command {Chat Object} -> The text recieved by the api
            
            Desc: 
                Parses the command to see if it's a hrm command then execute a function
            
            Returns: 
                - None
                
            Called From:
                setup_listeners()

        */
        if(command.type == "api" && command.content.indexOf("!hrm ") !== -1) {
            command = command.content.split( " " );

            if(command[1] === "play"){
                let handout_name = command.slice(2).join(" ");
                this.play_HRM(handout_name);
            }

        }
    }

    play_HRM(handout_name){
        /*
            params: 
                @handout_name {string} -> name of the HRM handout you want to play w/o [HRM] tag
            
            Desc: 
                Finds the handout name in our name_json_map and executes the hidden roll without deleting the hangout.
            
            Returns: 
                - None
                
            Called From:
                parse_command()
        */
       let handout = findObjs({                              
            _type: "handout",                          
        }).filter((obj) => {
            let name = obj.get("name")
            name = name.slice(5).trim() // remove [HRM] tag and any weird spaces
            if(name === handout_name)
                return true 
            return false

        });;

        if(handout.length == 0){
            let command = "/w " + this.GM.get("displayname") + " <b> No handout exists with that name </b>";
            sendChat("[HRM]", command, null, {noarchive:true} );
            return
        }
        else {
            this.process_handout(handout[0], false)
        }
    }

}

on("ready", function() {
    var controller = new hidden_roll_messages.roll_controller();
})