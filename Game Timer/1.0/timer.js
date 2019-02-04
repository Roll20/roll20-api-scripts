
on("ready", function () {
    //Wait until the ready event fires so we know the game is completely loaded.
    //Get a reference to our patrolling token.
    // Begins
    start();
});

function start() {
    setTimeout(function () {
        for (i = 0; i < findObjs({ _type: "graphic", name: "game.clock" }, { caseInsensitive: true }).length; i++) {
            var obj = findObjs({ _type: "graphic", name: "game.clock" }, { caseInsensitive: true })[i];
            //We know there is a token in the Game called "Guard A".
            if (obj != undefined) {
                //log(obj);
                //{"_id":"-","_pageid":"-","left":735.1025728734535,"top":385.10257287345354,"width":70,"height":70,"rotation":66,"layer":"objects","isdrawing":false,"flipv":false,"fliph":false,"imgsrc":"/images/character.png","name":"Game.clocK","gmnotes":"","controlledby":"","bar1_value":"1","bar1_max":"","bar1_link":"","bar2_value":"","bar2_max":"","bar2_link":"","bar3_value":"3","bar3_max":"","bar3_link":"","represents":"-","aura1_radius":"","aura1_color":"#FFFF99","aura1_square":false,"aura2_radius":"","aura2_color":"#59E594","aura2_square":false,"tint_color":"transparent","statusmarkers":"","showname":false,"showplayers_name":false,"showplayers_bar1":false,"showplayers_bar2":false,"showplayers_bar3":false,"showplayers_aura1":false,"showplayers_aura2":false,"playersedit_name":true,"playersedit_bar1":true,"playersedit_bar2":true,"playersedit_bar3":true,"playersedit_aura1":true,"playersedit_aura2":true,"light_radius":"","light_dimradius":"","light_otherplayers":false,"light_hassight":false,"light_angle":"","light_losangle":"","light_multiplier":1,"adv_fow_view_distance":"","sides":"","currentSide":0,"lastmove":"735,245","_type":"graphic","_subtype":"token","_cardid":""}
                //log(obj.get("rotation"));
                if (obj.get("rotation") >= 360) {
                    obj.set("rotation", obj.get("rotation") - 360);
                }
                obj.set("rotation", obj.get("rotation") + 360 / 60);
                if (obj.get("bar3_value") == "") obj.set("bar3_value", "0");
                if (obj.get("bar1_value") == "") obj.set("bar1_value", "0");
                if (obj.get("bar2_value") == "") obj.set("bar2_value", "0");
                if (obj.get("gmnotes") == "") obj.set("gmnotes", "1");
                //statusmarkers "red", "blue", "green", "brown", "purple",
                switch (obj.get("gmnotes")) {
                    case "1":
                        obj.set("statusmarkers", "red");
                        obj.set("gmnotes", "2");
                        break;
                    case "2":
                        obj.set("statusmarkers", "red,blue");
                        obj.set("gmnotes", "3");
                        break;
                    case "3":
                        obj.set("statusmarkers", "red,blue,green");
                        obj.set("gmnotes", "4");
                        break;
                    case "4":
                        obj.set("statusmarkers", "red,blue,green,brown");
                        obj.set("gmnotes", "5");
                        break;
                    case "5":
                        obj.set("statusmarkers", "red,blue,green,brown,purple");
                        obj.set("gmnotes", "6");
                        break;
                    case "6":
                        obj.set("statusmarkers", "red,blue,green,brown,purple,yellow");
                        obj.set("gmnotes", "7");
                        break;
                    case "7":
                        obj.set("statusmarkers", "red,blue,green,brown,purple");
                        obj.set("gmnotes", "8");
                        break;
                    case "8":
                        obj.set("statusmarkers", "red,blue,green,brown");
                        obj.set("gmnotes", "9");
                        break;
                    case "9":
                        obj.set("statusmarkers", "red,blue,green");
                        obj.set("gmnotes", "10");
                        break;
                    case "10":
                        obj.set("statusmarkers", "red,blue");
                        obj.set("gmnotes", "1");
                        break;
                    default:
                        break;
                }
                if (obj.get("bar2_value") == "59") {
                    obj.set("bar2_value", "0")
                    if (obj.get("bar1_value") == "59") {
                        obj.set("bar1_value", "0")
                        obj.set("bar3_value", parseInt(obj.get("bar3_value"), 10) + 1)
                    }
                    else {
                        obj.set("bar1_value", parseInt(obj.get("bar1_value"), 10) + 1);
                    }
                }
                else {
                    obj.set("bar2_value", parseInt(obj.get("bar2_value"), 10) + 1);
                }
            }
            else {
                //log("Not Find")
            }
        }
        // Again
        start();
    }, 1000);        // Every 1 sec
}
