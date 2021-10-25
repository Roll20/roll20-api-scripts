    var Teleport = Teleport || (function(){
        "use strict";
        /*
            Teleport is a script designed to make a few things easier: 
                - multi-storey buildings
                - building interiors
                - magical teleportation
                - falling traps and hazards
                - pings to drag player attention without ping-rings
                - spawning special effects at locations with pings
                - causing GM layer creatures to appear with pings and effects
                - anything else you can think of for the tools this provides. 
        */
        var version = "1.2.1",
            author = "616652/Patrick K.",
            lastModified = 1605432403;
        // State variables are carried over between sessions, 
        // so a user does not have to re-set configuration items every time a game starts
        state.teleport = state.teleport || {};
        state.teleport.config = state.teleport.config || {};
        // This is a continuously incrementing variable to always provide a unique portal name
        state.teleport.increment = state.teleport.increment || 0;
        
        var getStateParam = function(param,deflt){
            if(state.teleport.config.hasOwnProperty(param)){
                return state.teleport.config[param];
            }else{
                return setStateParam(param,deflt);
            }
        },
        setStateParam = function(param, setting){
            state.teleport.config[param] = setting;
            return setting;
        };
        state.teleport.limbo = state.teleport.limbo || {};
        // DEFAULTPLAYER is used for pings where a controlled by lists "all"
        // and for other situations where a GM might want to ping all. 
        var DEFAULTPLAYER,
        AUTOTELEPORT = getStateParam("AUTOTELEPORT",true),
        AUTOPING = getStateParam("AUTOPING",true),
        HIDEPING = getStateParam("HIDEPING",true),
        SHOWSFX = getStateParam("SHOWSFX",true),
        PLAYERINDEX = {},
        TOKENMARKERS,
        // The emojiObj is used to store the graphics used for config buttons and activation buttons
        emojiObj = { 
            "on": [0x2714,0xFE0F],
            "off": 0x274C,
            "active":0x1F4A5,
            "inactive":0x2B55,
            "edit":[0x270F,0xFE0F],
            "config":[0x2699,0xFE0F],// 0x1F529,
            "linked":0x1F517,
            "teleport":0x2728,
            "teleportall":0x1F52E,
            "portal":0x1F300,
            "restrictedportal":0x1F365,
            "help":0x1F9ED,
            "error":[0x26A0,0xFE0F],
            "locked":0x2B55,
            "unlocked":0x1F7E2,
            "ping":0x1F50E,
            "menu":0x1F4AC,
            "pad":0x1F4AB,
            "editname":[0x1F3F7,0xFE0F],
            "message":0x1F4AD,
            "random":0x1F500,
            "select":0x1F520,
            "nav":[0x1F441,0xFE0F,0x200D,0x1F5E8,0xFE0F],
            "key":[0x1F5DD,0xFE0F],
            "global":[0x1F310],
            "addlink":[0x26D3,0xFE0F]
        },
        // emojibuilder concatenates rendered emojis that use modifiers
        emojibuilder = (numref) => {
            let results = "",emoji=emojiObj[numref];
            if(Array.isArray(emoji)){
                _.each(emoji, function(ref){
                    results += String.fromCodePoint(ref);
                });
            }else{
                results +=String.fromCodePoint(emoji);
            }
            return results;
        },
        // Style blocks - used for various chat construct appearances
        defaultButtonStyles = "border:1px solid black;border-radius:.5em;padding:2px;margin:2px;font-weight:bold;text-align:right;",
        configButtonStyles = "width:150px;background-color:white;color:black;font-size:1em;font-family:Arial",
        emojiButtonStyles = "width:1.4em;height:1.4em;background-color:#efefef;color:black;font-size:1em;line-height:1.4em;padding:none;font-family:Arial;",
        headingAreaStyles = "background-color:black;color:white;font-size:1.1em;font-weight:normal;font-family:Candal;padding:.1em .1em .2em .2em;border-radius:.2em;line-height:2em;",
        boundingBoxStyles = "border: 1px solid black; background-color: white; padding: .2em .2em;margin-top:20px;border-radius:.1em;",
        tokenButtonStyles = "border: 1px solid #ccc;",
        tableCellStyles = "",
        // Start of utility functions - Button Builders
        emojiButtonBuilder = function( title, apicall, icon){
            let results = "<a title=\"" + title + "\" href=\"!teleport --",
            subconstruct = txt => results += txt;
            subconstruct( apicall );
            subconstruct("\" style=\"" );
            subconstruct( defaultButtonStyles + emojiButtonStyles + "\">");
            if(icon){
                subconstruct( emojibuilder(icon) );
            }else{
                subconstruct( ( ( Teleport.configparams[title])?emojibuilder("on"):emojibuilder("off") ) );
            }
            subconstruct("</a>");
            return results;
        },
        configButtonBuilder = function(title, apicall, icon){
            let results = "<a href=\"!teleport --",
            subconstruct = txt => results += txt;
            subconstruct( apicall );
            subconstruct("\" style=\"background-color:white" );
            subconstruct(";color:black;" + defaultButtonStyles + configButtonStyles + "\">");
            if(icon){
                subconstruct( title + ": " + emojibuilder(icon));
            }else{
                subconstruct( title + ": " + ((Teleport.configparams[title])?emojibuilder("on"):emojibuilder("off")));
            }
            subconstruct("</a>");
            return results;
        },
        standardButtonBuilder = function(title, apicall, icon){
            let results = "<a href=\"!teleport --",
            subconstruct = txt => results += txt;
            subconstruct( apicall );
            subconstruct("\" style=\"background-color:white" );
            subconstruct(";color:black;" + defaultButtonStyles + "\">");
            if(icon){
                subconstruct( title + " " + emojibuilder(icon));
            }else{
                subconstruct( title + " " + ((Teleport.configparams[title])?emojibuilder("on"):emojibuilder("off")));
            }
            subconstruct("</a>");
            return results;
        },
        tokenButtonBuilder = function(pad, token, status){
            // this will get a token reference
            let results = "<a " + ((status)?"aria-checked=\"true\"":"aria-checked=\"false\"") + " style=\"" + tokenButtonStyles + ((status)?"background-color:#999;":"background-color:white;") + "\" href=\"!teleport --editpdkey|",
            subconstruct = txt => results += txt;
            subconstruct(pad.get("_id"));
            subconstruct("|" + token.name + "\">");
            subconstruct(renderTokens(token));
            subconstruct("</a>");
            return results;
        },
        rawButtonBuilder = function(title, link, icon){
            let results = "<a style=\"" + defaultButtonStyles + configButtonStyles + ";padding:.2em;\" href=\"" + link + "\">",
            subconstruct = txt => results += txt;
            if(icon){
                subconstruct( title + " " + emojibuilder(icon));
            }else{
                subconstruct( title );
            }
            subconstruct("</a>");
            return results;
        },
        // Start of menu display functions
        // Help Display - this may be concatenated into a handout so it doesn"t clutter up the interface at astartup. 
        helpDisplay = function(){
            let output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"font-weight: bold; border-bottom: 1px solid black;font-size: 100%;border-bottom:1px solid black;\">";
            output +="<span style=\"display:block;" + headingAreaStyles + "\">";
            output +="Teleport Help";
            output +="</span>";
            output +="</div>";
            output += "<h3>Teleport</h3><br />";
            output += "<p>This script provides a way for GMs or players to teleport tokens within a page or between pages.</p>";
            output += "<hr /><h4>Installation</h4><br />";
            output += "<p>On installation, a note (<i>Teleport API</i>) is created, and help text appears in chat, both of which have buttons which activate the main menu. The note persists, and will not be re-created unless you remove the note, so you can always find and activate the menu button. You can also type <code>!teleport --menu</code> into chat. </p>";
            output += "<hr /><h4>Beginning Setup</h4><br />";
            output += "<p>To set up a teleport pad token, drag a token to the objects layer and then click on the chat button to \"Create Teleport Pad\" on the main menu. </p>";
            output += "<ul><li>You will be prompted with a naming box, name your teleport pad whatever you like. You can rename it later from the interface. This is for you to read, and is not used by the API to find portal pads, so don\"t worry about renaming it at any time.</li>";
            output += "<li>The token will be automatically moved to the GM layer and set up with its initializing properties.</li></ul>";
            output += "<p>Once you do this, the chat menu will pop up a list of teleport pads it detects on the page the <b>GM</b> is on currently. You can now use the teleport button on the chat (the emoji button that looks like sparkles, and gives you a tooltip of \"teleport token\" on mouseover) for that teleport pad to teleport a selected token to this teleport pad.</p>";
            output += "<p>To set up auto-teleporting (players able to interact with one teleport pad that automatically moves them to another teleport pad), you need to <b>link</b> the first teleport pad you created to a second teleport pad.</p>";
            output += "<ul><li>Create a second teleport pad as you did the first one.</li>";
            output += "<li>Now, go to the gmlayer and select both teleport pads.</li>";
            output += "<li>On the teleport pad list, click the \"link\" button on either pad. Teleport is smart enough not to link a portal to itself, so it will add the <b>other</b> portal to the portal linking button you pressed, and it should list it this way (show the name of the linked portal in its \"linked to\" label).</li>";
            output += "<li>If you want the portals to link to each-other and be a two-way teleport, repeat this for the second portal, so each shows \"linked\" to the other teleport pad.</li></ul>";
            output += "<p>Now, on the objects layer, test this by dragging any token over one of the teleport pads. These pads are invisible to your players, so if you want them to find them it is good practice to put a visible marker of the teleport pad on the map layer. You should see the token move to the gm layer, move to the other teleport pad location, and re-appear on the token layer.</p>";
            output += "<hr /><h4>Cross-Page Teleport</h4><br />";
            output += "<p>To set up cross-page teleport, you must create teleport tokens on each page you want to link by way of teleport, and then use the Global Teleport Pad List to link them, similar to how you did in the <b>Beginning Setup</b>. You also must make sure that player tokens for each player you want to teleport exist in the target pages. Preferably, they should be on the GM layer. If you don\'t have player tokens on the target page, the teleport or auto-teleport will fail. Currently, the API has trouble with creating tokens on target pages (specifically to do with images from the Roll20 Marketplace), so <b>Teleport</b> doesn\'t try and make a player token on the target page at this point.</p>";
            output += "<p><b>Some warnings:</b></p>";
            output += "<ul><li>Linking two pads, then copying one to another page will not work: teleport pads are linked by their unique IDs, and pasting a teleport pad to another page creates a new token with a new ID. It will keep links it has to <b>other teleport pads</b> but any links <b><i>to</i></b> it will be broken and will have to be re-set.</li>";
            output += "<li>Cross-page teleport tries to spawn a specific page ribbon, and this will happen even if a player is not online - so teleporting player tokens to other pages when they are not online may have unforseen consequences. This is still being tested, and if out of synch can be \"fixed\" when all players are back online.</li></ul>";
            output += "<hr /><h4>Creating API buttons from Teleport buttons</h4><br />";
            output += "<p>Any activation of a button in chat will leave a record of what the command was - so you can press the up-arrow in chat to see the command that was passed to activate teleport.js. All commands are prefixed by !teleport and contain an attribute prefixed by two dashes to direct the command.</p>";
            output +="<p>"+ standardButtonBuilder("Main Menu","menu","help") +"</p>";
            output +="</div>";
            // The first time you ever use this, you get an output to chat. You don"t get another unless you delete the handout. 
            return output;
        },
        menuDisplay = function(){
            let output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"font-weight: bold; border-bottom: 1px solid black;font-size: 100%;\">";
            output +="<span style=\"display:block;" + headingAreaStyles + "\">";
            output +="Main Menu";
            output +="</span>";
            output +="</div>";
            output +="<p>Commands in Teleport are always preceded by !teleport.</p>";
            output +="<p>" + standardButtonBuilder("Create Teleport Pad","createpad|?{Pad Name|Telepad " + state.teleport.increment + "}","teleportall") + "</p>";
            output +="<p>" + standardButtonBuilder("Configuration Menu","config","config") + "</p>";
            output +="<p>" + standardButtonBuilder("Teleporter Pad List","padlist","portal") + "</p>";
            output +="<p>" + standardButtonBuilder("Global Pad List","globalpdlist","global") + "</p>";
            output +="<p>" + standardButtonBuilder("Limbo Menu","globaltknlist","pad") + "</p>";
            output +="</div>";
            outputToChat(output); 
        },
        configDisplay = function(){
            let output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"" + headingAreaStyles + "\">";
            output +="<table style=\"padding: none;\"><tr><td width=\"90%\">Configuration Menu</td><td>" + emojiButtonBuilder("Main Menu","menu","help") + "</td></tr></table>";
            output +="</div><table style=\"border:1px solid black;width:100%\">";
            _.each(Object.keys(state.teleport.config), function(title){
                output += "<tr><td style=\"text-align:right;\">" + configButtonBuilder(title,title.toLowerCase()) + "</td></tr>";
            });
            output += "<tr><td style=\"text-align:right;font-weight:bold;\">" + configButtonBuilder("PURGE","purge","error") + "</td></tr>";
            output +="</table></div>";
            outputToChat(output); 
        },
        padDisplay = function(){
            let output = "",
            padlist=teleportPadList(DEFAULTPLAYER.get("_lastpage"));
            output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"" + headingAreaStyles + "\">";
            output +="<table style=\"padding: none;\"><tr><td width=\"90%\">Teleport Pad List</td><td>" + emojiButtonBuilder( "Main Menu","menu","help" ) + "</td></tr></table>";
            output +="</div><table style=\"border:1px solid black;width:100%\">";
            _.each(padlist, function(pad){
                let targettext = "";
                if(pad.get("bar1_max") !==""){
                    let targetlist = pad.get("bar1_max");
                    if(Array.isArray(targetlist)){
                        let count = 0;
                        _.each(targetlist, function(targ){
                            
                            if(count>0){
                                targettext += ",";
                            }
                            if(!getObj("graphic",targ)){
                                targettext += "Invalid value"
                            }else{
                                targettext += getObj("graphic",targ).get("name");
                            }
                            
                            count++;
                        });
                    }else{
                        if(!getObj("graphic",pad.get("bar1_max"))){
                            targettext += "Invalid value";
                        }else{
                            targettext += getObj("graphic",pad.get("bar1_max")).get("name");
                        }
                        
                    }
                }else{
                    targettext += "not linked";
                }
                output += "<tr><td style=\"text-align:left;font-weight:bold;\" colspan=\"5\">" + pad.get("name") + "</td></tr>";
                output += "<tr>";
                output += "<td>" + emojiButtonBuilder( "Ping Pad","pingpad|" + pad.get("_id"),"ping" ) + "</td>";
                output += "<td>" + emojiButtonBuilder( "Edit Pad","editpad|" + pad.get("_id"),"edit" ) + "</td>";
                output += "<td>" + emojiButtonBuilder( "Teleport Token","teleporttoken|" + pad.get("_id"),"teleport" ) + "</td>";
                if(pad.get("status_dead")){
                    output += "<td>" + emojiButtonBuilder( "Unlock Pad","lockportal|" + pad.get("_id"),"locked" ) + "</td>";
                }else{
                    output += "<td>" + emojiButtonBuilder( "Lock Pad","lockportal|" + pad.get("_id"),"unlocked" ) + "</td>";
                }
                output += "<td>" + emojiButtonBuilder( "Link Pad","linkpad|" + pad.get("_id") + "|list","linked" ) + "</td>";
                output += "</tr>";
               
                output += "<tr><td style=\"text-align:left;border-bottom:1px solid black;\" colspan=\"5\"> linked to: ";
                   output += targettext;
                output += "</td></tr>";
            });
            output +="</table></div>";
            outputToChat(output); 
        },
        padGlobalDisplay = function(){
            let completeList = globalTeleportPadList(),
            output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"" + headingAreaStyles + "\">";
            output +="<table style=\"padding: none;\"><tr><td width=\"90%\">Global Pad List</td><td>" + emojiButtonBuilder( "Main Menu","menu","help" ) + "</td></tr></table>";
            output +="</div>";
            _.each(completeList, function(pageTokenArray,key){
                if(Array.isArray(pageTokenArray) && pageTokenArray.length > 0){
                    output+="<div style=\"font-weight:bold\">" + getObj("page",key).get("name") + "</div><table style=\"border:1px solid black;width:100%\">";
                    _.each(pageTokenArray, function(token){
                        let targettext = "";
                
                        if(token.get("bar1_max") !== ""){
                            let targetlist = token.get("bar1_max");
                            if(Array.isArray(targetlist)){
                                let count = 0;
                                _.each(targetlist, function(targ){
                                    
                                    if(count>0){
                                        targettext += ",";
                                    }
                                    if(!getObj("graphic",targ)){
                                        targettext += "Invalid value";
                                    }else{
                                        targettext += getObj("graphic",targ).get("name");
                                    }
                                    count++;
                                });
                            }else{
                                if(!getObj("graphic",token.get("bar1_max"))){
                                    targettext += "Invalid value";
                                }else{
                                    targettext += getObj("graphic",token.get("bar1_max")).get("name");
                                }
                            }
                        }else{
                            targettext += "not linked";
                        }
                        output+="<tr><td style=\"width:90%\">" + token.get("name") + "</td>";
                        output+="<td>" + emojiButtonBuilder( "Teleport Token","teleporttoken|" + token.get("_id"),"teleport" ) + "</td>";
                        output+="<td>" + emojiButtonBuilder( "Link Pad","linkpad|" + token.get("_id") + "|global","linked" ) + "</td>";
                        output+="<td>" + emojiButtonBuilder( "Add Link","addlink|" + token.get("_id") + "|global","addlink" ) + "</td></tr>";
                        output += "<tr><td style=\"text-align:left;border-bottom:1px solid black;\" colspan=\"4\"> linked to: ";
                        output += targettext;
                        output += "</td></tr>";
                    });
                    output+="</table>";
                } else {
                }
                
            });
            outputToChat(output); 
        },
        limboDisplay = function(){
            let completeList = globalLimboList(),
            output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"" + headingAreaStyles + "\">";
            output +="<table style=\"padding: none;\"><tr><td width=\"90%\">Limbo Resident List</td><td>" + emojiButtonBuilder( "Main Menu","menu","help" ) + "</td></tr></table>";
            output +="</div>";
            _.each(completeList, function(tokenArray,key){
                if(Array.isArray(tokenArray)){
                    output+="<div style=\"font-weight:bold\">" + getObj("page",key).get("name") + "</div><table style=\"border:1px solid black;width:100%\">";
                    _.each(tokenArray, function(token){
                        output+="<tr><td style=\"width:90%\">" + token.get("name") + "</td>";
                        output += "</td></tr>";
                    });
                    output+="</table>";
                }
            });
            outputToChat(output); 
        },
        editPadDisplay = function(padid){
            let pad = getObj( "graphic" , padid ),
            targettext = "",
            output = "";
            if(pad.get("bar1_max") !==""){
                let targetlist = pad.get("bar1_max");
                if(Array.isArray(targetlist)){
                    let count = 0;
                    _.each(targetlist, function(targ){
                        if(count>0){
                            targettext += ",";
                        }
                        if(!getObj("graphic",targ)){
                            targettext += "Invalid value";
                        }else{
                            targettext += getObj("graphic",targ).get("name");
                        }
                        count++;
                    });
                }else{
                    if(!getObj("graphic",pad.get("bar1_max"))){
                        targettext += "Invalid value";
                    }else{
                        targettext += getObj("graphic",pad.get("bar1_max")).get("name");
                    }
                    
                }
            }else{
                targettext += "not linked";
            }
            output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"" + headingAreaStyles + "\">";
            output +="<table style=\"padding: none;\"><tr><td width=\"90%\">Pad Edit</td><td>" + emojiButtonBuilder( "Teleport Pad List","padlist","portal" ) + "</td></tr></table>";
            output +="</div><table style=\"border:1px solid black;width:100%\">";
            output += "<tr><td style=\"text-align:left;font-weight:bold;\">" + pad.get("name") + "</td><td>" + emojiButtonBuilder( "Rename Token","renamepad ?{Pad Name|"+ pad.get("name") +"}|" + pad.get("_id"), "editname" ) + "</td></tr>";
            output += "<tr><td>Ping</td><td>" + emojiButtonBuilder( "Ping Pad","pingpad|" + pad.get("_id"),"ping" ) + "</td></tr>";
            
            output += "<tr><td>SFX:" + ((pad.get("bar2_value") !== "")?pad.get("bar2_value"):"none");
            output += "</td><td>" + emojiButtonBuilder( "Show SFX","showpdsfx|" + pad.get("_id"),"active" ) + "</td></tr>";
            output += "<tr><td>";
            let sfxapicall = "editpdsfx ?{Special Effects Shape|bomb|bubbling|burn|burst|explode|glow|missile|nova|none}-" + 
            "?{Special Effects Color|acid|blood|charm|death|fire|frost|holy|magic|slime|smoke|water}" + "|" + pad.get("_id");
            output += standardButtonBuilder("Set Pad SFX",sfxapicall,"teleportall") + "</td><td></td></tr>";
            
            output += "<tr><td>Message:</td><td>" + emojiButtonBuilder( "Show Message","showpdmsg|" + pad.get("_id"),"message" ) + "</td></tr>";
            output += "<tr><td colspan=\"2\">" + ((pad.get("bar2_max") !== "")?pad.get("bar2_max"):"none") + "</td></tr><tr><td colspan=\"2\">";
            let msgapicall = "editpdmsg ?{Activation Message|" + ((pad.get("bar2_max") !== "")?pad.get("bar2_max"):"none") + "}" + "|" + pad.get("_id");
            output += standardButtonBuilder("Set Pad Message",msgapicall,"message");
            output += "</td></tr>";
            
            output += "<tr><td><div style=\"float:left;\">Keys:</div>" + renderTokenList(getTokens(pad)) + "</td><td>" + emojiButtonBuilder( "Show Keys","showpdkeys|" + pad.get("_id"),"key" ) + "</td></tr>";
            //
            output += "<tr><td>Teleport Token To</td><td>" + emojiButtonBuilder( "Teleport Token","teleporttoken|" + pad.get("_id"),"teleport" ) + "</td></tr>";
            if(pad.get("status_dead")){
                output += "<tr><td>Status: Locked</td><td>" + emojiButtonBuilder( "Unlock Pad","lockpad|" + pad.get("_id"),"locked" ) + "</td></tr>";
            }else{
                output += "<tr><td>Status: Unlocked</td><td>" + emojiButtonBuilder( "Lock Pad","lockpad|" + pad.get("_id"),"unlocked" ) + "</td></tr>";
            }
            if(pad.get("fliph")){
                output += "<tr><td>Multi-Link: Select</td><td>" + emojiButtonBuilder( "Set Random Pad","selectpadset|" + pad.get("_id"),"select" ) + "</td></tr>";
            }else{
                output += "<tr><td>Multi-Link: Random</td><td>" + emojiButtonBuilder( "Set Select Pad","selectpadset|" + pad.get("_id"),"random" ) + "</td></tr>";
            }
            output += "<tr><td>Link Pad</td><td>" + emojiButtonBuilder( "Link Pad","linkpad|" + pad.get("_id") + "|edit","linked" ) + "</td></tr>";
            output += "<tr><td style=\"text-align:left;border-bottom:1px solid black;\" colspan=\"2\"> linked to: ";
            output += targettext;
            output += "</td></tr>";
            output +="</table></div>";
            outputToChat(output); 
        },
        editPadTokenDisplay = function(padid){
            let pad = getObj( "graphic" , padid ),
            output = "";
            output = " <div style=\"" + boundingBoxStyles + "\">" + "<div style=\"" + headingAreaStyles + "\">";
            output +="<table style=\"padding: none;\"><tr><td width=\"90%\">Pad Keys Edit</td><td>" + emojiButtonBuilder( "Edit Pad","editpad|" + pad.get("_id"),"edit" ) + "</td></tr></table>";
            output +="</div><table style=\"border:1px solid black;width:100%\">";
            output +="<tr>";
            output += "<td>";
            output += getAllTokensSelect(getTokens(pad,true),pad); 
            output += "</td>";
            output += "</tr></table></div>";
            outputToChat(output);
        },
        // Menu support functions (used to construct repeating sections of )
        getTokens = function(obj, mode){
            let stringtokenlist = obj.get("statusmarkers").split(","), results=[];
            _.each(TOKENMARKERS, tokenmarker =>{
               _.each(stringtokenlist, marker => {
                    if(tokenmarker.name.toLowerCase() === marker) results.push(tokenmarker);
                });
           });
           return results;
        },
        renderTokenList = function(results, mode){
            let msg="";
            _.each(results, marker => {
                msg += renderTokens(marker, mode);
            });
            return msg;
        },
        getAllTokensSelect = function(tokenset, pad){
            let outputtext = "";
            _.each(TOKENMARKERS, tokenmarker =>{
                let isactive = false;
               _.each(tokenset, marker => {
                    if(tokenmarker.name.toLowerCase() === marker.name) {
                        isactive = true;
                    }
                });
                
                outputtext += tokenButtonBuilder(pad, tokenmarker, isactive);//"render Token Button (active is true or false)";
           });
           return outputtext;
        },
        renderTokens = function(token,mode){
            let returnText =  "<div style=\"width:20px;height:20px;float:left;margin:.3em;\"><img src=\"" + token.url + "\" alt=\"" + token.name + "\" style=\"width:100%;height:100%;object-fit:contain;"; 
                // returnText += ((mode)?"border-radius:50%;background-color:#ccc;":");
                returnText += "\"></div>";
            return returnText;
        },
        teleportSelectList = function(obj,pad){
            let returntext = "?{Select a Destination";
            if(pad.get("bar1_max") !==""){
                let targetlist = pad.get("bar1_max");
                if(Array.isArray(targetlist)){
                    _.each(targetlist, function(targ){
                        if(!checkTokenMarkerMatch(obj,getObj("graphic",targ))){
                            return;
                        }
                        returntext += "|" + getObj("graphic",targ).get("name") + "," + getObj("graphic",targ).get("_id");
                    });
                    returntext += "}";
                }
            }
            let player = findTokenPlayer(obj,pad);
            if(player === null){player=DEFAULTPLAYER;}
            outputToChat(configButtonBuilder( "Select Destination","teleporttoken|" + returntext + "|" + obj.get("id") ,"teleport" ), player.get("_displayname"));

        },
        // This check is exclusively for auto-teleport, and never occurs
        // for chat-based teleport or teleport buttons. 
        // This can be useful for temporarily one-way portals for example
        // Otherwise one-way portals can have no linked portal, meaning they
        // are only destination portals for auto-teleport. 
        teleportPadCheck = function(obj){
            // Checking overlap - any overlap on drop triggers teleport. 
            // Changing to circle overlap - 
            //   - Add width and height, divide by 2, divide by 2 again to get average radius
            //   - Do this for pad and token
            //   - Check for hypotenuse between two points on right triangle
            //   - If hypotenuse is greater than radius 1 + radius 2, they are not overlapping.
            // Disadvantage: not as accurate as square-overlap
            // Advantage: feels more realistic given that most tokens are not square with transparency.
            let objrad = (obj.get("width") + obj.get("height"))/4; 
            
            var padList = teleportPadList(obj.get("_pageid"));
            _.each(padList, function(pad){
                if(pad.get("status_dead") === true){
                    return;
                }
                let padrad = (pad.get("width") + pad.get("height"))/4,
                hypot = Math.ceil(Math.sqrt(Math.pow((pad.get("left") - obj.get("left")),2) + Math.pow((pad.get("top") - obj.get("top")),2)));
                if(hypot < (objrad+padrad)){
                    if(!checkTokenMarkerMatch(obj,pad)){
                        return;
                    }
                    teleportMsg(pad,obj);
                    let targetlist = pad.get("bar1_max");
                    if(Array.isArray(targetlist) && pad.get("fliph") === true && targetlist.length > 1){
                        teleportSelectList(obj,pad);
                        return;
                    }
                    let nextpad = teleportAutoNextTarget(pad);
                    if(nextpad){
                        teleportToken(obj,nextpad);
                    }
                }else{
                    return;
                }
            });
        },
        checkTokenMarkerMatch = function(obj,pad){
            if(pad.get("statusmarkers") === ""){ 
                return true; 
            }
            let foundInBoth = _.intersection(obj.get("statusmarkers").split(","), pad.get("statusmarkers").split(","));
            let conclusion = _.difference(pad.get("statusmarkers").split(","), foundInBoth);
            if((conclusion[0] === "" && conclusion.length === 1) || conclusion.length === 0){
                return true;
            }else{
                return false;
            }
        },
        teleportAutoNextTarget = function(pad){
            // in case of accidental self-reference, just don"t teleport 
            // this will include the randomizer - thining of whether to include inactivated portals... 
            if(pad.get("bar1_max") === ""){ 
                return null; 
            }
            let targetlist = pad.get("bar1_max"),pickedpad,count=0;
            if(Array.isArray(targetlist)){
                let randnum = Math.floor(Math.random()*targetlist.length);
                _.each(targetlist, function(targ){
                    
                    if(randnum === count){
                        pickedpad = getObj("graphic",targ);
                    }
                    count++;
                });
            }else{
                 pickedpad = getObj("graphic",targetlist);
            }
            return pickedpad;
        },
        teleportPadList = function(pageid){
            var currentPageId = pageid || Campaign().get("playerpageid");
            var rawList = findObjs({_subtype:"token",layer:"gmlayer"}),
            padList = [];
            _.each(rawList, function(padCheck){
              if(typeof padCheck.get("bar1_value") !== "string"){
                  return;
              }
              if( padCheck.get("bar1_value").indexOf("teleportpad") === 0 && padCheck.get("_pageid") === currentPageId){
                  padList.push(padCheck);
              }
            });
            return padList;
        },
        globalTeleportPadList = function(){
            var currentPageId = Campaign().get("playerpageid");
            var rawList = findObjs({_subtype:"token",layer:"gmlayer"}),
            padList = {[currentPageId]:[]};
            _.each(rawList, function(padCheck){
              if(typeof padCheck.get("bar1_value") !== "string"){
                  return;
              }
              if( padCheck.get("bar1_value").indexOf("teleportpad") === 0){
                  if(!padList[padCheck.get("_pageid")]){
                      padList[padCheck.get("_pageid")] = [];
                  }
                  padList[padCheck.get("_pageid")].push(padCheck);
              }
            });
            return padList;
        },
        globalLimboList = function(){
            var currentPageId = Campaign().get("playerpageid");
            var rawList = findObjs({_subtype:"token",layer:"gmlayer"}),
            tokenList = {[currentPageId]:[]};
            _.each(rawList, function(token){
              let foundPlayer = findTokenPlayer(token,null);
              if(foundPlayer){
                  if(!tokenList[token.get("_pageid")]){
                      tokenList[token.get("_pageid")] = [];
                  }
                  tokenList[token.get("pageid")].push(token);
              }
            });
            return tokenList;
        },
        sendToLimbo = function(obj){
            //state.teleport.limbo[obj.get("_pageid")] = state.teleport.limbo[obj.get("_pageid")]||[];
            //if( _.indexOf(state.teleport.limbo[obj.get("_pageid")], obj.get("_id")) === -1 ){
            //    state.teleport.limbo[obj.get("_pageid")].push(obj.get("_id"));
            //}
            obj.set({
                layer:"gmlayer",
                left: 35,
                top: 35
            });
        },
        getFromLimbo = function(obj){
            //state.teleport.limbo[obj.get("_pageid")] = state.teleport.limbo[obj.get("_pageid")]||[];
            //if( _.indexOf(state.teleport.limbo[obj.get("_pageid")], obj.get("_id")) !== -1 ){
            //    state.teleport.limbo[obj.get("_pageid")] = _.without(state.teleport.limbo[obj.get("_pageid")],obj.get("_id"));
            //}
            // obj.set("layer","objects");
        },
        indexLimbo = function(pageid){
            return state.teleport.limbo[pageid];
        },
        indexAllLimbo = function(){
            return state.teleport.limbo;
        },
        limboSwap = function(obj, pageid){
            let foundPlayerObj;
            /*let destPageLimbo = indexLimbo(pageid);
            try{
                if(destPageLimbo){
                    _.each( destPageLimbo , function(objid){
                        let limbobj = getObj("graphic",objid);
                        let limbrep;
                        if(limbobj){
                            limbrep = limbobj.get("represents");
                        }
                        if(limbrep && limbrep === obj.get("represents")){
                            sendToLimbo(obj);
                            getFromLimbo(limbobj);
                            foundPlayerObj = limbobj;
                        }
                            if(typeof foundPlayerObj !== "null"){ return false }
                    });
                }
                if(foundPlayerObj !== null){
                    reconcileTargetPageId(playerControllers(foundPlayerObj), pageid);
                    return foundPlayerObj;
                }
                
            }catch(err){
               
            }
            */
            // No limbo or object not found in limbo... so we try and get the object from the page in general
            let destPageTokenSet = findObjs({ type:"graphic", _pageid:pageid });
            _.each( destPageTokenSet, function(pageobj){
               if(obj.get("represents") === pageobj.get("represents")){
                   foundPlayerObj = pageobj;
                   sendToLimbo(obj);
                   return false;
               } 
            });
            if(foundPlayerObj){
                reconcileTargetPageId(playerControllers(foundPlayerObj), pageid);
                return foundPlayerObj;
            }
            // last ditch effort try and create the object on the local page
            log("Object was not found on the destination page. Create attempt in next version."); 
            return false;
        },
        reconcileTargetPageId = function(players,targetpageid){
            let props = Campaign().get('playerspecificpages')||{};
            if(targetpageid === Campaign().get('playerpageid')){
                players.forEach(p=>{
                    if(getObj("player",p).get("_online")){
                        props[p] = targetpageid;
                    }
                });
            } else {
                players.forEach(p=>{
                    if(getObj("player",p).get("_online")){
                        props[p] = targetpageid;
                    }
                });
            }
            Campaign().set('playerspecificpages',props);
            setTimeout(()=>{
                //players.forEach(p=>{
                //        delete props[p]
                //});
                Campaign().set('playerspecificpages',false);
                Campaign().set('playerspecificpages',props);
            },100);
        },
        teleportToken = function(obj,pad){
            if(obj.get("_pageid") !== pad.get("_pageid")){
                // do page to page teleport instead
                // So, for instance, we replace obj
                // with a new reference from the correct page context,
                // function limboswap, getlimboref, etc.
                // So put the referenced object in cold storage
                // and return the reference from the proper page. 
                // and move the individual player ribbon... 
                // for now we notice it"s a different page and stop. 
                obj = limboSwap(obj, pad.get("_pageid"));
                if(obj === false){
                    outputToChat("Nobody found in Limbo that matches on that page. Teleport cancelled.");
                    return false;
                }
            }
            obj.set("layer","gmlayer");
            setTimeout(function(){
                obj.set("left",pad.get("left"));
                obj.set("top",pad.get("top"));
                
                setTimeout(function(){
                    obj.set("layer","objects");
                    if(Teleport.configparams.AUTOPING){
                        teleportPing(obj,pad);
                    }
                    if(Teleport.configparams.SHOWSFX){
                        teleportSFX(obj,pad);
                    }
                    obj.set("lastmove","");
                },500);
            },100);
        },
        teleportPing = function(obj,pad){
            let player, oldcolor;
            // figure out if there is a player attached
            if(Teleport.configparams.HIDEPING){
                player = findTokenPlayer(obj,pad);
                if(!player){
                    player=DEFAULTPLAYER;
                }
                oldcolor = player.get("color");
                player.set("color","transparent");
                setTimeout(function(){
                    sendPing(pad.get("left"), pad.get("top"), pad.get("_pageid"), player.id, true, player.id);
                    setTimeout(function(){
                        player.set("color",oldcolor);
                    },1000);
                },10);
            }
        },
        teleportSFX = function(obj,pad){
            if(pad.get("bar2_value") !== ""){
                setTimeout(function(){
                    spawnFx(pad.get("left"), pad.get("top"), pad.get("bar2_value"), pad.get("_pageid"));
                },10);
            }
        },
        teleportMsg = function(pad,tgt){
            let msg="";
            if(pad.get("bar2_max") !== ""){
                msg = pad.get("bar2_max").replace("[target]",tgt.get("name"));
                outputOpenMessage(msg);
            }
        },
        playerControllers = (obj) => {
            if('' !== obj.get('represents') ) {
                return (getObj('character',obj.get('represents')) || {get: function(){return '';} } )
                .get('controlledby').split(/,/)
                .filter(s=>s.length);
            }
            return obj.get('controlledby')
            .split(/,/)
            .filter(s=>s.length);
        },
        findTokenPlayer=function(obj,pad){
            if(typeof obj === "undefined"){
                return null;
            }
            let character, controller,player;
            character=(obj.get("represents"))?getObj("character", obj.get("represents")):null;
            controller = (character)?character.get("controlledby"):"";
                if(controller !== "" && controller !== "all" && controller.split(",").length === 1 ){
                    player=getObj("player", controller);
                }else{
                    player=null;
                }
            return player;
        },
        cleanUpLinkCheck = function(obj){
            if(obj.get("bar1_value") === "teleportpad"){
                // first we get the global teleport pad list
                // then we roll through each one to check for this token's id
                let output = "";
                output+= "<p>The teleport pad called " + obj.get("name") + " has been deleted.</p><p>Do you want to remove all references to it from all teleport pads?</p>";
                output+= "<p>" + standardButtonBuilder( "Remove Pad References ","purgetokenid|" + obj.get("_id"),"error") + "</p>";
                outputToChat(output);
            }
        },
        purgeTokenId = function(deletedpadid){
            log(deletedpadid);
            let outputtext = "";
            let completeList = globalTeleportPadList();
            let removedcount = 0;
            _.each(completeList, function(pageTokenArray,key){
                if(Array.isArray(pageTokenArray) && pageTokenArray.length > 0){
                    _.each(pageTokenArray, function(token){
                        if(token.get("bar1_max") !== ""){
                            let targetlist = token.get("bar1_max");
                            if(Array.isArray(targetlist)){
                                if(_.indexOf(targetlist,deletedpadid) !== -1){
                                    token.set("bar1_max",_.without(targetlist,deletedpadid));
                                    removedcount++;
                                }
                            }else{
                                if(targetlist === deletedpadid){
                                    token.set("bar1_max","");
                                    removedcount++;
                                }
                            }
                        }
                    });
                }
            });
            outputtext += "<p>" + removedcount + " token references removed.</p>"
            outputtext += "<p>" + standardButtonBuilder("Main Menu","menu","help") + "</p>";
            outputToChat(outputtext);
        },
        addPortalPadLink = function(pad, linktargetids, type){
            let completelinklist=[];
            if(type==="add"){
                completelinklist = pad.get("bar1_max")||[];
            }
            if(!Array.isArray(completelinklist)){
                completelinklist = [pad.get("bar1_max")];
            };
            _.each(linktargetids, function(linktarg){
                if(pad.get("_id") === linktarg._id){
                    if(linktargetids.length === 1){outputToChat("A portal pad cannot target itself.");}
                    return;
                }
                let obj = getObj("graphic",linktarg._id);
                    if(obj.get("bar1_value") === "teleportpad"){
                        if(_.indexOf(pad.get("bar1_max"),linktarg._id) === -1){
                           completelinklist.push(obj.get("_id"));
                        }
                    }else{
                    outputToChat("A Link target for autoteleport needs to also be a teleport pad.");
                }
            });
            pad.set("bar1_max",completelinklist);
        },
        editPadSFX = function(padid, sfx){
            let pad = getObj("graphic",padid);
            if(sfx && sfx.indexOf("none") !== -1){
               sfx=""; 
            }
            pad.set("bar2_value",sfx);
            editPadDisplay(padid);
        },
        showPadSFX = function(padid){
            let pad = getObj("graphic",padid);
            if(pad.get("bar2_value") !== ""){
                spawnFx(pad.get("left"), pad.get("top"), pad.get("bar2_value"), pad.get("pageid"));
            }
        },
        editPadMsg = function(padid, msg){
            let pad = getObj("graphic",padid);
            if(msg && msg.indexOf("none") !== -1){
               msg=""; 
            }
            pad.set("bar2_max",msg);
            editPadDisplay(padid);
        },
        showPadMsg = function(tgt, pad){
            let msg;
            if(pad.get("bar2_max") !== ""){
                msg = pad.get("bar2_max").replace("[target]",tgt.get("name"));
                outputToChat(msg);
            }
        },
        msgHandler = function(msg){
            
            if(msg.type === "api" && msg.content.indexOf("!teleport") === 0 ){
                
                if(msg.content.indexOf("--help") !== -1){
                    helpDisplay();
                }
                if(msg.content.indexOf("--menu") !== -1){
                    menuDisplay();
                }
                if(msg.content.indexOf("--config") !== -1){
                    configDisplay();
                }
                if(msg.content.indexOf("--padlist") !== -1){
                    padDisplay();
                }
                if(msg.content.indexOf("--globalpdlist") !== -1){
                    padGlobalDisplay();
                }
                if(msg.content.indexOf("--globaltknlist") !== -1){
                    limboDisplay();
                }
                if(msg.content.indexOf("--purgetokenid") !== -1){
                    purgeTokenId(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--teleporttoken") !== -1){ 
                    if(typeof msg.selected !== "undefined"){
                        let pad = getObj("graphic",msg.content.split("|")[1]);
                        _.each(msg.selected, function(objid){
                            let obj = getObj("graphic",objid._id);
                            teleportToken(obj,pad);
                        });
                    }else{
                        let pad = getObj("graphic",msg.content.split("|")[1]);
                        let obj = (msg.content.split("|")[2])?getObj("graphic",msg.content.split("|")[2]):null;
                        if(obj !== null){
                            teleportToken(obj,pad);
                        }else{
                            outputToChat("Select a target token to teleport before clicking teleport.");
                        }
                    }
                }
                if(msg.content.indexOf("--linkpad") !== -1){ 
                    let pad = getObj("graphic",msg.content.split("|")[1]), returnmenu = msg.content.split("|")[2];
                    if(typeof msg.selected !== "undefined"){
                        addPortalPadLink(pad,msg.selected,"replace");
                    }else{
                        outputToChat("Clicking Link without selecting a token clears the teleport pad link.");
                        pad.set("bar1_max","");
                    }
                    if(returnmenu.indexOf("global") !== -1){
                        padGlobalDisplay();
                    }
                    else if(returnmenu.indexOf("edit") !== -1){
                        editPadDisplay(msg.content.split("|")[1]);
                    }else{
                        padDisplay();
                    }
                }
                if(msg.content.indexOf("--addlink") !== -1){ 
                    let pad = getObj("graphic",msg.content.split("|")[1]), returnmenu = msg.content.split("|")[2];
                    if(typeof msg.selected !== "undefined"){
                        addPortalPadLink(pad,msg.selected,"add");
                    }else{
                        outputToChat("There was no pad selected to be added.");
                    }
                    if(returnmenu.indexOf("global") !== -1){
                        padGlobalDisplay();
                    }
                    else if(returnmenu.indexOf("edit") !== -1){
                        editPadDisplay(msg.content.split("|")[1]);
                    }else{
                        padDisplay();
                    }
                }
                
                if(msg.content.indexOf("--createpad") !== -1){
                    state.teleport.increment++;
                    if(typeof msg.selected ==="undefined"){
                        return outputToChat("Select a token to be the teleport pad.");
                    }
                    let pad = getObj("graphic",msg.selected[0]._id);
                    if(typeof pad ==="undefined"){
                        return outputToChat("Only graphic tokens can be set to be a teleport pad.");
                    }
                    if(pad.get("_subtype") === "card"){ 
                        return outputToChat("Select a target token that is not a card.");
                    }
                    if(pad.get("bar1_value") === "teleportpad"){
                        return outputToChat("Select a target token that is not already a teleport pad.");
                    }
                    if(pad.get("_pageid") !== Campaign().get("playerpageid")){
                        //
                    }
                    pad.set({
                        layer:"gmlayer",
                        bar1_value:"teleportpad",
                        name: ((pad.get("name") === "")?msg.content.split("|")[1]:pad.get("name")),
                        showname: true
                    })
                    padDisplay();
                }
                if(msg.content.indexOf("--renamepad") !== -1){
                    let pad = getObj("graphic",msg.content.split("|")[1]);
                    pad.set({
                        name: msg.content.split("|")[0].split("--renamepad ")[1]
                    })
                    editPadDisplay(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--editpad") !== -1){
                    editPadDisplay(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--editpdsfx") !== -1){
                    editPadSFX( msg.content.split("|")[1],msg.content.split("|")[0].split(" ")[2] );
                }
                if(msg.content.indexOf("--showpdsfx") !== -1){
                    showPadSFX(msg.content.split("|")[1]);
                }
                
                if( msg.content.indexOf("--editpdmsg") !== -1){
                    editPadMsg( msg.content.split("|")[1], msg.content.split("|")[0].split("--editpdmsg ")[1] );
                }
                
                if(msg.content.indexOf("--showpdmsg") !== -1){
                     if(typeof msg.selected !== "undefined"){
                        let pad = getObj("graphic",msg.content.split("|")[1]);
                        let obj = getObj("graphic",msg.selected[0]._id);
                        showPadMsg(obj,pad);
                    }else{
                       return outputToChat("Select a target token to test the teleport pad message.");
                    }
                }
                
                if(msg.content.indexOf("--lockportal") !== -1){
                        let pad = getObj("graphic",msg.content.split("|")[1]);
                        let currentstatus = pad.get("status_dead");
                        pad.set("status_dead", (currentstatus)?false:true);
                        padDisplay();
                }
                if(msg.content.indexOf("--lockpad") !== -1){
                        let pad = getObj("graphic",msg.content.split("|")[1]);
                        let currentstatus = pad.get("status_dead");
                        pad.set("status_dead", (currentstatus)?false:true);
                        editPadDisplay(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--selectpadset") !== -1){
                    let pad = getObj("graphic",msg.content.split("|")[1]);
                        let currentstatus = pad.get("fliph");
                        pad.set("fliph", (currentstatus)?false:true);
                        editPadDisplay(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--pingpad") !== -1){
                        let pad = getObj("graphic",msg.content.split("|")[1]);
                        setTimeout(function() {
                            sendPing(pad.get("left"), pad.get("top"), pad.get("pageid"), null, true, DEFAULTPLAYER.get("_id"));
                        }, 10);
                }
                if(msg.content.indexOf("--showpdkeys") !== -1){
                        editPadTokenDisplay(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--editpdkey") !== -1){
                    let markerName = msg.content.split("|")[2].toLowerCase(),
                    padID = msg.content.split("|")[1],
                    currentMarkers,
                    obj = getObj("graphic", padID );
                    currentMarkers = obj.get("statusmarkers").split(",");
                    if(_.indexOf(currentMarkers, markerName) !== -1){
                        currentMarkers = _.without(currentMarkers, markerName);
                    }else{
                        currentMarkers.push(markerName);
                    }
                    obj.set("statusmarkers", currentMarkers.join(","));
                    editPadTokenDisplay(msg.content.split("|")[1]);
                }
                if(msg.content.indexOf("--autoteleport") !== -1){
                    Teleport.configparams.AUTOTELEPORT = (Teleport.configparams.AUTOTELEPORT)?false:true;
                    setStateParam("AUTOTELEPORT",Teleport.configparams.AUTOTELEPORT);
                    configDisplay();
                }else if(msg.content.indexOf("--autoping") !== -1){
                    Teleport.configparams.AUTOPING = (Teleport.configparams.AUTOPING)?false:true;
                    setStateParam("AUTOPING",Teleport.configparams.AUTOPING);
                    configDisplay();
                }else if(msg.content.indexOf("--hideping") !== -1){
                    Teleport.configparams.HIDEPING = (Teleport.configparams.HIDEPING)?false:true;
                    setStateParam("HIDEPING",Teleport.configparams.HIDEPING);
                    configDisplay();
                }else if(msg.content.indexOf("--showsfx") !== -1){
                    Teleport.configparams.SHOWSFX = (Teleport.configparams.SHOWSFX)?false:true;
                    setStateParam("SHOWSFX",Teleport.configparams.SHOWSFX);
                    configDisplay();
                }
                if(msg.content.indexOf("--purge") !== -1 && msg.content.indexOf("--purgetokenid") === -1){
                    Campaign().set("playerspecificpages",{});
                    outputToChat("PlayerSpecificPages Data Purged");
                }
                
            }
        
        },
        outputToChat = function(msg,tgt){
            tgt = (tgt !== undefined && tgt !== null)?tgt:"gm";
            sendChat("Teleport","/w \"" + tgt + "\" " + msg,null,{noarchive:true});
        },
        outputOpenMessage = function(msg,tgt){
            let formattedmessage = "<div><div>" + msg + "</div></div>";
            sendChat("Environment", formattedmessage);
        },/**/
        autoTeleportCheck = function(obj){
            if(Teleport.configparams.AUTOTELEPORT===false){
                return;
            }
            if(obj.get("_subtype") === "token" && obj.get("lastmove") !== "" && obj.get("layer") === "objects" ){
                if(checkLastMoveAgainstCurrentPosition(obj)){
                    teleportPadCheck(obj);
                }
            }
        },
        checkLastMoveAgainstCurrentPosition = function(obj){
            if(obj.get("lastmove") === ""){
                return false;
            }
            return true;
        },
        RegisterEventHandlers = function() {
            on("chat:message", msgHandler);
            on("change:graphic", autoTeleportCheck);
            on("destroy:graphic", cleanUpLinkCheck);
            DEFAULTPLAYER = (function(){
                                let player;
                                let playerlist = findObjs({                              
                                      _type: "player",                          
                                });
                                _.each(playerlist, function(obj) {    
                                  if(playerIsGM(obj.get("_id"))){
                                      player = obj;
                                  }
                                });
                                return player;
                            })();
            TOKENMARKERS = JSON.parse(Campaign().get("token_markers"));
            var helpoutput = "";
            if(!state.teleport.help || !getObj("handout",state.teleport.help)){
                if(findObjs({type:"handout",name:"Teleport API"})[0]){
                    state.teleport.help = findObjs({type:"handout",name:"Teleport API"})[0].get("_id");
                }else{
                    let content = helpDisplay(),
                    handout = createObj("handout",{
                        name: "Teleport API",
                        inplayerjournals: "gm",
                        controlledby: DEFAULTPLAYER.get("_id")
                    });
                    state.teleport.help = handout.get("_id");
                    setTimeout(function(){
                        handout.set("notes",content);
                    },0);
                    helpoutput += "<p>" + rawButtonBuilder("Teleport API Handout", "http://journal.roll20.net/handout/" + handout.get("_id"),"menu") + "</p>";
                    // have to add chat call here to point to API handout instead of giant blob help. 
                }
            }
            helpoutput += "<p>"+ standardButtonBuilder("Teleport Main Menu","menu","help") +"</p>";
            outputToChat(helpoutput); 
            
        };
        
        return {
            startup: RegisterEventHandlers,
            configparams: {
                "AUTOTELEPORT": AUTOTELEPORT,
                "AUTOPING": AUTOPING,
                "HIDEPING": HIDEPING,
                "SHOWSFX": SHOWSFX
            }
        };
        
    }());


on("ready",() => {    
    Teleport.startup();
});