    var Teleport = Teleport || (function(){
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
        var version = '1.0',
            author = '616652/Patrick K.',
            lastModified = 1605432403;
        // State variables are carried over between sessions, 
        // so a user does not have to re-set configuration items every time a game starts
        state.teleport = state.teleport || {};
        state.teleport.config = state.teleport.config || {};
        // This is a continuously incrementing variable to always provide a unique portal name
        state.teleport.increment = state.teleport.increment || 0;
        var getStateParam = function(param,deflt){
            if(typeof state.teleport.config[param] !== 'null' && typeof state.teleport.config[param] !== 'undefined'){
                return state.teleport.config[param];
            }else{
                return setStateParam(param,deflt);
            }
        },
        setStateParam = function(param, setting){
            state.teleport.config[param] = setting;
            return setting;
        };
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
            'on': [0x2714,0xFE0F],
            'off': 0x274C,
            'active':0x1F4A5,
            'inactive':0x2B55,
            'edit':[0x270F,0xFE0F],
            'config':[0x2699,0xFE0F],// 0x1F529,
            'linked':0x1F517,
            'teleport':0x2728,
            'teleportall':0x1F52E,
            'portal':0x1F300,
            'restrictedportal':0x1F365,
            'help':0x1F9ED,
            'error':0x26A0,
            'locked':0x2B55,
            'unlocked':0x1F7E2,
            'ping':0x1F50E,
            'menu':0x1F53C,
            'pad':0x1F4AB,
            'editname':[0x1F3F7,0xFE0F],
            'message':0x1F4AD,
            'random':0x1F500,
            'select':0x1F520,
            'nav':[0x1F441,0xFE0F,0x200D,0x1F5E8,0xFE0F],
            'key':[0x1F5DD,0xFE0F]
        },
        // emojibuilder concatenates rendered emojis that use modifiers
        emojibuilder = (numref) => {
            let results = '',emoji=emojiObj[numref];
            if(Array.isArray(emoji)){
                _.each(emoji, function(ref){
                    results += String.fromCodePoint(ref)
                });
            }else{
                results +=String.fromCodePoint(emoji)
            }
            return results;
        },
        // Style blocks - used for various chat construct appearances
        defaultButtonStyles = 'border:1px solid black;border-radius:.5em;padding:2px;margin:2px;font-weight:bold;text-align:right;',
        configButtonStyles = 'width:150px;background-color:white;color:black;font-size:1em;font-family:Arial',
        emojiButtonStyles = 'width:1.4em;height:1.4em;background-color:#efefef;color:black;font-size:1em;line-height:1.4em;padding:none;font-family:Arial;',
        headingAreaStyles = 'background-color:black;color:white;font-size:1.1em;font-weight:normal;font-family:Candal;padding:.1em .1em .2em .2em;border-radius:.2em;line-height:2em;',
        boundingBoxStyles = 'border: 1px solid black; background-color: white; padding: .2em .2em;margin-top:20px;border-radius:.1em;',
        tokenButtonStyles = 'border: 1px solid #ccc;',
        tableCellStyles = '',
        // Start of utility functions - Button Builders
        emojiButtonBuilder = function(contentsObj){
            let results = '<a title="'+ contentsObj.param + '" href="!teleport --',
            subconstruct = txt => results += txt;
            subconstruct( contentsObj.apicall );
            subconstruct('" style="' );
            subconstruct( defaultButtonStyles + emojiButtonStyles + '">');
            if(contentsObj.icon){
                subconstruct( emojibuilder(contentsObj.icon) );
            }else{
                subconstruct( ( ( Teleport.configparams[contentsObj.param.toString()])?emojibuilder('on'):emojibuilder('off') ) );
            }
            subconstruct('</a>');
            return results
        },
        configButtonBuilder = function(contentsObj){
            let results = '<a href="!teleport --',
            subconstruct = txt => results += txt;
            subconstruct( contentsObj.apicall );
            subconstruct('" style="background-color:white' );
            subconstruct(';color:black;' + defaultButtonStyles + configButtonStyles + '">');
            if(contentsObj.icon){
                subconstruct( contentsObj.param + ': ' + emojibuilder(contentsObj.icon));
            }else{
                subconstruct( contentsObj.param + ': ' + ((Teleport.configparams[contentsObj.param.toString()])?emojibuilder('on'):emojibuilder('off')));
            }
            subconstruct('</a>');
            return results
        },
        standardButtonBuilder = function(contentsObj){
            let results = '<a href="!teleport --',
            subconstruct = txt => results += txt;
            subconstruct( contentsObj.apicall );
            subconstruct('" style="background-color:white' );
            subconstruct(';color:black;' + defaultButtonStyles + '">');
            if(contentsObj.icon){
                subconstruct( contentsObj.param + ' ' + emojibuilder(contentsObj.icon));
            }else{
                subconstruct( contentsObj.param + ' ' + ((Teleport.configparams[contentsObj.param.toString()])?emojibuilder('on'):emojibuilder('off')));
            }
            subconstruct('</a>');
            return results
        },
        tokenButtonBuilder = function(pad,token,status){
            // this will get a token reference
            let results = '<a ' + ((status)?'aria-checked="true"':'aria-checked="false"') + ' style="' + tokenButtonStyles + ((status)?'background-color:#999;':'background-color:white;') + '" href="!teleport --editpdkey|',
            subconstruct = txt => results += txt;
            subconstruct(pad.get('_id'));
            subconstruct('|' + token.name + '">');
            subconstruct(renderTokens(token));
            subconstruct('</a>');
            return results
        },
        // Start of menu display functions
        // Help Display - this may be concatenated into a handout so it doesn't clutter up the interface at astartup. 
        helpDisplay = function(){
            let output = ' <div style="' + boundingBoxStyles + '">' 
            + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;style="border-bottom:1px solid black;">';
            output +='<span style="display:block;' + headingAreaStyles + '">'
            output +='Teleport Help';
            output +='</span>'
            output +='</div>';
            output +='<p>Teleport is an API script that uses chat menus and chat buttons to manage teleport pads.</p>';
            output +='<p>This includes creating teleport pads, registering teleport pad destinations, managing general settings,' + 
                      ' locking pads individually from autoteleporting, setting keys as requirements to activate auto-teleport,' + 
                      ' and un-linking teleport pad destinations.</p>';
            output +='<p>Teleport pads are tokens that reside on the GM layer. If Autoteleport is set to true, and the teleport pad has a linked pad,' + 
                      ' a token moved into its area on the object layer is teleported automatically to the linked pad.</p>';
            output += '<p>Linked pads are set as destinations, and two-way teleport works by linking each pad to the other. You can make a one-way teleport' + 
                      ' by setting up two tokens and linking only one of them to the other. You can link many portals to one portal. If you link several' + 
                      ' teleport pads from a single pad, the destination is random, unless you set the "Multi-Link" property on the Pad Edit Panel to "Select."</p>';
            output +='<p>A selected token can also be teleported to a destination pad without autoteleport by using the teleport token button associated with that teleport pad.</p>';

            output +='<p>Each pad has an individual menu for invoking teleport for a selected token, and for pinging a pad if you cannot locate it on the page.</p>';
            output +='<p>Right now, the Teleport Pad display is <b>fixed to the player ribbon</b> meaning that the list of teleport pads only displays those' + 
            'on the active player ribbon page, which means if you are creating pads on other pages, they will not show up in the current player ribbon display.</p>';
            output +='<p>'+ standardButtonBuilder({param:'Main Menu',apicall:'menu',icon:'help'}) +'</p>';
            output +='</div>';
            // The first time you ever use this, you get an output to chat. You don't get another unless you delete the handout. 
            outputToChat(output); 
            return output;
        },
        menuDisplay = function(){
            let output = ' <div style="' + boundingBoxStyles + '">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;style="float:left;">';
            output +='<span style="display:block;' + headingAreaStyles + '">'
            output +='Main Menu';
            output +='</span>'
            output +='</div>';
            output +='<p>Commands in Teleport are always preceded by !teleport.</p>';
            output +='<p>' + standardButtonBuilder({param:'Create Teleport Pad',apicall:'createpad|?{Pad Name|Telepad ' + state.teleport.increment++ + '}',icon:'teleportall'}) + '</p>';
            output +='<p>' + standardButtonBuilder({param:'Configuration Menu',apicall:'config',icon:'config'}) + '</p>';
            output +='<p>' + standardButtonBuilder({param:'Teleporter Pad List',apicall:'padlist',icon:'portal'}) + '</p>';
            output +='</div>';
            outputToChat(output); 
        },
        configDisplay = function(){
            let output = ' <div style="' + boundingBoxStyles + '">'
            +'<div style="' + headingAreaStyles + '">';
            output +='<table style="padding: none;"><tr><td width="90%">Configuration Menu</td><td>' + emojiButtonBuilder( {param:'Main Menu',apicall:'menu',icon:'help'} ) + '</td></tr></table>';
            output +='</div><table style="border:1px solid black;width:100%">';
            _.each(Object.keys(state.teleport.config), function(param){
                output += '<tr><td style="text-align:right;">' + configButtonBuilder({param:param,apicall:param.toLowerCase()}) + '</td></tr>';
            });
            output +='</table></div>';
            outputToChat(output); 
        },
        padDisplay = function(){
            let output = '',
            padlist=teleportPadList();
            output = ' <div style="' + boundingBoxStyles + '">'
            +'<div style="' + headingAreaStyles + '">';
            output +='<table style="padding: none;"><tr><td width="90%">Teleport Pad List</td><td>' + emojiButtonBuilder( {param:'Main Menu',apicall:'menu',icon:'help'} ) + '</td></tr></table>';
            output +='</div><table style="border:1px solid black;width:100%">';
            _.each(padlist, function(pad){
                let targettext = '';
                
                if(pad.get('bar1_max') !==''){
                    let targetlist = pad.get('bar1_max');
                    if(Array.isArray(targetlist)){
                        let count = 0;
                        _.each(targetlist, function(targ){
                            if(count>0){
                                targettext += ',';
                            }
                            targettext += getObj('graphic',targ).get('name');
                            count++
                        });
                    }else{
                        targettext += getObj('graphic',pad.get('bar1_max')).get('name');
                    }
                }else{
                    targettext += 'not linked';
                }
                output += '<tr><td style="text-align:left;font-weight:bold;" colspan="5">' + pad.get('name') + '</td></tr>';
                output += '<tr>'
                output += '<td>' + emojiButtonBuilder( {param:'Ping Pad',apicall:'pingpad|' + pad.get('_id'),icon:'ping'} ) + '</td>';
                output += '<td>' + emojiButtonBuilder( {param:'Edit Pad',apicall:'editpad|' + pad.get('_id'),icon:'edit'} ) + '</td>';
                output += '<td>' + emojiButtonBuilder( {param:'Teleport Token',apicall:'teleporttoken|' + pad.get('_id'),icon:'teleport'} ) + '</td>';
                if(pad.get('status_dead')){
                    output += '<td>' + emojiButtonBuilder( {param:'Unlock Pad',apicall:'lockportal|' + pad.get('_id'),icon:'locked'} ) + '</td>';
                }else{
                    output += '<td>' + emojiButtonBuilder( {param:'Lock Pad',apicall:'lockportal|' + pad.get('_id'),icon:'unlocked'} ) + '</td>';
                }
                output += '<td>' + emojiButtonBuilder( {param:'Link Pad',apicall:'linkpad|' + pad.get('_id'),icon:'linked'} ) + '</td>';
                output += '</tr>';
               
                output += '<tr><td style="text-align:left;border-bottom:1px solid black;" colspan="5"> linked to: ';
                   output += targettext;
                output += '</td></tr>';
            });
            output +='</table></div>';
            outputToChat(output); 
        },
        editPadDisplay = function(padid){
            let pad = getObj( "graphic" , padid ),
            targettext = '',
            output = ''
            if(pad.get('bar1_max') !==''){
                let targetlist = pad.get('bar1_max');
                if(Array.isArray(targetlist)){
                    let count = 0;
                    _.each(targetlist, function(targ){
                        if(count>0){
                            targettext += ',';
                        }
                        targettext += getObj('graphic',targ).get('name');
                        count++
                    });
                }else{
                    targettext += getObj('graphic',pad.get('bar1_max')).get('name');
                }
            }else{
                targettext += 'not linked';
            }
            output = ' <div style="' + boundingBoxStyles + '">'
            + '<div style="' + headingAreaStyles + '">';
            output +='<table style="padding: none;"><tr><td width="90%">Pad Edit</td><td>' + emojiButtonBuilder( {param:'Teleport Pad List',apicall:'padlist',icon:'portal'} ) + '</td></tr></table>';
            output +='</div><table style="border:1px solid black;width:100%">';
            output += '<tr><td style="text-align:left;font-weight:bold;">' + pad.get('name') + '</td><td>' + emojiButtonBuilder( {param:'Rename Token',apicall:'renamepad ?{Pad Name|'+ pad.get('name') +'}|' + pad.get('_id'), icon:'editname'} ) + '</td></tr>';
            output += '<tr><td>Ping</td><td>' + emojiButtonBuilder( {param:'Ping Pad',apicall:'pingpad|' + pad.get('_id'),icon:'ping'} ) + '</td></tr>';
            
            output += '<tr><td>SFX:' + ((pad.get('bar2_value') !== '')?pad.get('bar2_value'):'none');
            output += '</td><td>' + emojiButtonBuilder( {param:'Show SFX',apicall:'showpdsfx|' + pad.get('_id'),icon:'active'} ) + '</td></tr>';
            output += '<tr><td>';
            let sfxapicall = 'editpdsfx ?{Special Effects Shape|bomb|bubbling|burn|burst|explode|glow|missile|nova|none}-' + 
            '?{Special Effects Color|acid|blood|charm|death|fire|frost|holy|magic|slime|smoke|water}' + '|' + pad.get('_id');
            //let apicall = 'editpadsfx ?{Options|Choose one:,&#63;{Choose an option&#124;Try again.&#124;A&#124;B&#124;C&#124;D&#124;E&#124;F&#124;G&#125;|A|B|C|D|E|F|G} |' + pad.get('_id');
            output += standardButtonBuilder({param:'Set Pad SFX',apicall:sfxapicall,icon:'teleportall'}) + '</td><td></td></tr>';
            
            output += '<tr><td>Message:</td><td>' + emojiButtonBuilder( {param:'Show Message',apicall:'showpdmsg|' + pad.get('_id'),icon:'message'} ) + '</td></tr>';
            output += '<tr><td colspan="2">' + ((pad.get('bar2_max') !== '')?pad.get('bar2_max'):'none') + '</td></tr><tr><td colspan="2">';
            let msgapicall = 'editpdmsg ?{Activation Message|' + ((pad.get('bar2_max') !== '')?pad.get('bar2_max'):'none') + '}' + '|' + pad.get('_id');
            //let apicall = 'editpadsfx ?{Options|Choose one:,&#63;{Choose an option&#124;Try again.&#124;A&#124;B&#124;C&#124;D&#124;E&#124;F&#124;G&#125;|A|B|C|D|E|F|G} |' + pad.get('_id');
            output += standardButtonBuilder({param:'Set Pad Message',apicall:msgapicall,icon:'message'}) 
            output += '</td></tr>';
            
            output += '<tr><td><div style="float:left;">Keys:</div>' + renderTokenList(getTokens(pad)) + '</td><td>' + emojiButtonBuilder( {param:'Show Keys',apicall:'showpdkeys|' + pad.get('_id'),icon:'key'} ) + '</td></tr>';
            //
            output += '<tr><td>Teleport Token To</td><td>' + emojiButtonBuilder( {param:'Teleport Token',apicall:'teleporttoken|' + pad.get('_id'),icon:'teleport'} ) + '</td></tr>';
            if(pad.get('status_dead')){
                output += '<tr><td>Status: Locked</td><td>' + emojiButtonBuilder( {param:'Unlock Pad',apicall:'lockpad|' + pad.get('_id'),icon:'locked'} ) + '</td></tr>';
            }else{
                output += '<tr><td>Status: Unlocked</td><td>' + emojiButtonBuilder( {param:'Lock Pad',apicall:'lockpad|' + pad.get('_id'),icon:'unlocked'} ) + '</td></tr>';
            }
            if(pad.get('fliph')){
                output += '<tr><td>Multi-Link: Select</td><td>' + emojiButtonBuilder( {param:'Set Random Pad',apicall:'selectpadset|' + pad.get('_id'),icon:'select'} ) + '</td></tr>';
            }else{
                output += '<tr><td>Multi-Link: Random</td><td>' + emojiButtonBuilder( {param:'Set Select Pad',apicall:'selectpadset|' + pad.get('_id'),icon:'random'} ) + '</td></tr>';
            }
            output += '<tr><td>Link Pad</td><td>' + emojiButtonBuilder( {param:'Link Pad',apicall:'linkpad|' + pad.get('_id'),icon:'linked'} ) + '</td></tr>';
            output += '<tr><td style="text-align:left;border-bottom:1px solid black;" colspan="2"> linked to: ';
            output += targettext;
            output += '</td></tr>';
            output +='</table></div>';
            outputToChat(output); 
        },
        editPadTokenDisplay = function(padid){
            let pad = getObj( "graphic" , padid ),
            tokenlist = [],
            output = '';
            output = ' <div style="' + boundingBoxStyles + '">'
            + '<div style="' + headingAreaStyles + '">';
            output +='<table style="padding: none;"><tr><td width="90%">Pad Keys Edit</td><td>' + emojiButtonBuilder( {param:'Edit Pad',apicall:'editpad|' + pad.get('_id'),icon:'edit'} ) + '</td></tr></table>';
            output +='</div><table style="border:1px solid black;width:100%">';
            output +='<tr>';
            output += '<td ">';
            output += getAllTokensSelect(getTokens(pad,true),pad); 
            output += '</td>';
            output += '</tr></table></div>';
            outputToChat(output);
        },
        // Menu support functions (used to construct repeating sections of )
        getTokens = function(obj, mode){
            let stringtokenlist = obj.get("statusmarkers").split(','), results=[],chatMessage='';
            _.each(TOKENMARKERS, tokenmarker =>{
               _.each(stringtokenlist, marker => {
                    if(tokenmarker.name.toLowerCase() === marker) results.push(tokenmarker);
                });
           });
           return results;
        },
        renderTokenList = function(results, mode){
            let msg='';
            _.each(results, marker => {
                msg += renderTokens(marker, mode);
            });
            return msg;
        }
        getAllTokensSelect = function(tokenset, pad){
            let outputtext = '';
            _.each(TOKENMARKERS, tokenmarker =>{
                let isactive = false;
               _.each(tokenset, marker => {
                    if(tokenmarker.name.toLowerCase() === marker.name) {
                        isactive = true;//results.push(tokenmarker);
                        // log("Found to be True for " + tokenmarker.name.toLowerCase() + ":" + marker);
                    }
                });
                
                outputtext += tokenButtonBuilder(pad, tokenmarker, isactive);//"render Token Button (active is true or false)";
           });
           return outputtext;
        },
        renderTokens = function(token,mode){
            let returnText =  '<div style="width:20px;height:20px;float:left;margin:.3em;"><img src="' + token.url + '" alt="' + token.name + '" style="width:100%;height:100%;object-fit:contain;'; 
                // returnText += ((mode)?'border-radius:50%;background-color:#ccc;':'');
                returnText += '"></div>';
            return returnText;
        },
        teleportSelectList = function(params){
            let pad=params.pad,obj=params.obj;
            let returntext = '?{Select a Destination';
            if(pad.get('bar1_max') !==''){
                let targetlist = pad.get('bar1_max');
                if(Array.isArray(targetlist)){
                    _.each(targetlist, function(targ){
                        if(!checkTokenMarkerMatch(obj,getObj('graphic',targ))){return};
                        returntext += '|' + getObj('graphic',targ).get('name') + ',' + getObj('graphic',targ).get('_id');
                    });
                    returntext += '}';
                }
            }
            let player = findTokenPlayer({pad:pad,obj:obj});
            outputToChat(configButtonBuilder( {param:'Select Destination',apicall:'teleporttoken|' + returntext,icon:'teleport'} ), player.get('_displayname'));

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
            let objrad = (obj.get('width') + obj.get('height'))/4; 
            
            var padList = teleportPadList();
            _.each(padList, function(pad){
                if(pad.get('status_dead') === true){
                    return;
                }
                let padrad = (pad.get('width') + pad.get('height'))/4,
                hypot = Math.ceil(Math.sqrt(Math.pow((pad.get('left') - obj.get('left')),2) + Math.pow((pad.get('top') - obj.get('top')),2)));
                // log("hypot:" + hypot + " | objrad:" + objrad + " | padrad:" + padrad + " | test:" + (hypot < (objrad+padrad)));
                if(hypot < (objrad+padrad)){
                    if(!checkTokenMarkerMatch(obj,pad)){
                        return;
                    }
                    teleportMsg({pad:pad,tgt:obj});
                    let targetlist = pad.get('bar1_max');
                    if(Array.isArray(targetlist) && pad.get('fliph') === true && targetlist.length > 1){
                        teleportSelectList({pad:pad,obj:obj});
                        return;
                    }
                    let nextpad = teleportAutoNextTarget(pad);
                    if(nextpad){
                        teleportToken({obj:obj,pad:nextpad});
                    }
                }else{
                    return;
                }
            });
        },
        checkTokenMarkerMatch = function(obj,pad){
            log('In checkTokenMarkerMatch');
            if(pad.get('statusmarkers') === ''){ return true }
            let foundInBoth = _.intersection(obj.get('statusmarkers').split(','), pad.get('statusmarkers').split(','));
            let conclusion = _.difference(pad.get('statusmarkers').split(','), foundInBoth);
            if((conclusion[0] === '' && conclusion.length === 1) || conclusion.length === 0){
                return true;
            }else{
                return false;
            }
        },
        teleportAutoNextTarget = function(pad){
            // in case of accidental self-reference, just don't teleport 
            // this will include the randomizer - thining of whether to include inactivated portals... 
            if(pad.get('bar1_max') === ''){ return null };
            let targetlist = pad.get('bar1_max'),pickedpad,count=0,randnum=0;
            if(Array.isArray(targetlist)){
                let randnum = Math.floor(Math.random()*targetlist.length);
                _.each(targetlist, function(targ){
                    
                    if(randnum === count){
                        pickedpad = getObj('graphic',targ);
                    }
                    count++;
                });
            }else{
                 pickedpad = getObj('graphic',targetlist);
            }
            return pickedpad;
        },
        teleportPadList = function(){
            var currentPageId = Campaign().get('playerpageid');
            var rawList = findObjs({_subtype:'token',layer:'gmlayer'}),
            padList = [];
            _.each(rawList, function(padCheck){
              if(typeof padCheck.get('bar1_value') !== 'string'){
                  return;
              }
              if( padCheck.get('bar1_value').indexOf('teleportpad') === 0 && padCheck.get('_pageid') === currentPageId){
                  padList.push(padCheck);
              }
            })
            return padList;
        },
        teleportToken = function(params){
            let obj = params.obj, pad = params.pad;
            obj.set("layer","gmlayer")
            setTimeout(function(){
                obj.set("left",pad.get('left'));
                obj.set("top",pad.get('top'));
                setTimeout(function(){
                    obj.set("layer","objects");
                    if(Teleport.configparams.AUTOPING){
                        teleportPing({obj:obj,pad:pad});
                    }
                    if(Teleport.configparams.SHOWSFX){
                        teleportSFX({obj:obj,pad:pad});
                    }
                },500);
            },100);
        },
        teleportPing = function(params){
            let obj=params.obj, pad=params.pad, player, oldcolor;
            // figure out if there is a player attached
            if(Teleport.configparams.HIDEPING){
                player = findTokenPlayer({obj:obj,pad:pad});
                oldcolor = player.get('color');
                player.set('color','transparent');
                setTimeout(function(){
                    sendPing(pad.get('left'), pad.get('top'), Campaign().get('playerpageid'), player.id, true, player.id);
                    setTimeout(function(){
                        player.set('color',oldcolor);
                    },1000);
                },10)
                
            }
        },
        teleportSFX = function(params){
            let pad = params.pad;
            if(pad.get('bar2_value') !== ''){
                setTimeout(function(){
                    spawnFx(pad.get('left'), pad.get('top'), pad.get('bar2_value'), Campaign().get('playerpageid'));
                },10);
            }
        },
        teleportMsg = function(params){
            let pad = params.pad, tgt=params.tgt, msg='';
            if(pad.get('bar2_max') !== ''){
                msg = pad.get('bar2_max').replace('[target]',tgt.get('name'));
                outputOpenMessage(msg);
            }
        },
        findTokenPlayer=function(params){
            let obj=params.obj,pad=params.pad, character, controller;
            character=(obj.get('represents'))?getObj("character", obj.get('represents')):null;
            controller = (character)?character.get('controlledby'):'';
                if(controller !== '' && controller !== 'all' ){
                    player=getObj("player", controller);
                }else{
                    player=DEFAULTPLAYER;
                }
            return player
        },
        addPortalPadLink = function(params){
            let pad=params.pad,linktargetids=params.linktargetids,completelinklist=[];
            _.each(linktargetids, function(linktarg){
                if(pad.get('_id') === linktarg._id){
                    outputToChat("A portal pad cannot target itself.");
                    return
                }
                let obj = getObj('graphic',linktarg._id);
                    if(obj.get('bar1_value') === 'teleportpad'){
                           completelinklist.push(obj.get('_id'));
                    }else{
                    outputToChat("A Link target for autoteleport needs to also be a teleport pad.");
                }
            });
            pad.set("bar1_max",completelinklist);
        },
        editPadSFX = function(params){
            let pad = getObj('graphic',params.pad), sfx=params.sfx;
            if(sfx && sfx.indexOf('none') !== -1){
               sfx=''; 
            }
            pad.set('bar2_value',sfx);
            editPadDisplay(pad.get('_id'));
        },
        showPadSFX = function(params){
            let pad = getObj('graphic',params.pad);
            if(pad.get('bar2_value') !== ''){
                // log(pad.get('bar2_value'));
                spawnFx(pad.get('left'), pad.get('top'), pad.get('bar2_value'), Campaign().get('playerpageid'));
            }
        },
        editPadMsg = function(params){
            let pad = getObj('graphic',params.pad), msg=params.msg;
            if(msg && msg.indexOf('none') !== -1){
               msg=''; 
            }
            pad.set('bar2_max',msg);
            editPadDisplay(pad.get('_id'));
        },
        showPadMsg = function(params){
            let pad = params.pad,tgt=params.obj;
            if(pad.get('bar2_max') !== ''){
                msg = pad.get('bar2_max').replace('[target]',tgt.get('name'));
                outputToChat(msg);
            }
        },
        msgHandler = function(msg){
            
            if(msg.type === 'api' && msg.content.indexOf('!teleport') === 0 ){
                if(msg.content.indexOf('--help') !== -1){
                    helpDisplay();
                }
                if(msg.content.indexOf('--menu') !== -1){
                    menuDisplay();
                }
                if(msg.content.indexOf('--config') !== -1){
                    configDisplay();
                }
                if(msg.content.indexOf('--padlist') !== -1){
                    padDisplay();
                }
                
                if(msg.content.indexOf('--teleporttoken') !== -1){ 
                    if(typeof msg.selected !== 'undefined'){
                        let pad = getObj('graphic',msg.content.split('|')[1]);
                        let obj = getObj('graphic',msg.selected[0]._id);
                        teleportToken({obj:obj,pad:pad});
                    }else{
                        outputToChat("Select a target token to teleport before clicking teleport.");
                    }
                }
                if(msg.content.indexOf('--linkpad') !== -1){ 
                    let pad = getObj('graphic',msg.content.split('|')[1]);
                    if(typeof msg.selected !== 'undefined'){
                        addPortalPadLink({pad:pad,linktargetids:msg.selected});
                    }else{
                        outputToChat("Clicking Link without selecting a token clears the teleport pad link.");
                        pad.set("bar1_max","");
                    }
                    padDisplay();
                }
                
                if(msg.content.indexOf('--createpad') !== -1){
                    if(typeof msg.selected ==='undefined'){
                        return outputToChat('Select a token to be the teleport pad.');
                    }
                    let pad = getObj('graphic',msg.selected[0]._id);
                    if(typeof pad ==='undefined'){
                        return outputToChat('Only graphic tokens can be set to be a teleport pad.');
                    }
                    if(pad.get('_subtype') === 'card'){ return outputToChat("Select a target token that is not a card.")}
                    if(pad.get('bar1_value') === 'teleportpad'){return outputToChat("Select a target token that is not already a teleport pad.")}
                    if(pad.get('_pageid') !== Campaign().get('playerpageid')){
                        let txt = 'You have created a teleport pad that is not on the Player Ribbon page.';
                        txt += '\r It will not show up in the teleport pad list, and to see this pad on the list,';
                        txt += ' you will have to move the player ribbon to this page, as right now teleport between pages is not enacted.'
                        outputToChat(txt);
                    }
                    pad.set({
                        layer:'gmlayer',
                        bar1_value:'teleportpad',
                        name: ((pad.get('name') === "")?msg.content.split('|')[1]:pad.get('name')),
                        showname: true
                    })
                    padDisplay();
                }
                if(msg.content.indexOf('--renamepad') !== -1){
                    let pad = getObj('graphic',msg.content.split('|')[1]);
                    pad.set({
                        name: msg.content.split('|')[0].split('--renamepad ')[1]
                    })
                    editPadDisplay(msg.content.split('|')[1]);
                }
                if(msg.content.indexOf('--editpad') !== -1){
                    editPadDisplay(msg.content.split('|')[1]);
                }
                if(msg.content.indexOf('--editpdsfx') !== -1){
                    editPadSFX( {pad:msg.content.split('|')[1],sfx:msg.content.split('|')[0].split(' ')[2]} );
                }
                if(msg.content.indexOf('--showpdsfx') !== -1){
                    showPadSFX({pad:msg.content.split('|')[1]});
                }
                
                if( msg.content.indexOf('--editpdmsg') !== -1){
                    editPadMsg( { pad:msg.content.split('|')[1], msg:msg.content.split('|')[0].split('--editpdmsg ')[1]} );
                }
                
                if(msg.content.indexOf('--showpdmsg') !== -1){
                     if(typeof msg.selected !== 'undefined'){
                        let pad = getObj('graphic',msg.content.split('|')[1]);
                        let obj = getObj('graphic',msg.selected[0]._id);
                        showPadMsg({pad:pad,obj:obj});
                    }else{
                       return outputToChat('Select a target token to test the teleport pad message.');
                    }
                }
                
                if(msg.content.indexOf('--lockportal') !== -1){
                        let pad = getObj('graphic',msg.content.split('|')[1]);
                        let currentstatus = pad.get('status_dead');
                        pad.set('status_dead', (currentstatus)?false:true);
                        padDisplay();
                }
                if(msg.content.indexOf('--lockpad') !== -1){
                        let pad = getObj('graphic',msg.content.split('|')[1]);
                        let currentstatus = pad.get('status_dead');
                        pad.set('status_dead', (currentstatus)?false:true);
                        editPadDisplay(msg.content.split('|')[1]);
                }
                if(msg.content.indexOf('--selectpadset') !== -1){
                    let pad = getObj('graphic',msg.content.split('|')[1]);
                        let currentstatus = pad.get('fliph');
                        pad.set('fliph', (currentstatus)?false:true);
                        editPadDisplay(msg.content.split('|')[1]);
                }
                if(msg.content.indexOf('--pingpad') !== -1){
                        let pad = getObj('graphic',msg.content.split('|')[1]);
                        setTimeout(function() {
                            sendPing(pad.get('left'), pad.get('top'), Campaign().get('playerpageid'), null, true, DEFAULTPLAYER.get('_id'));
                        }, 10);
                }
                if(msg.content.indexOf('--showpdkeys') !== -1){
                        editPadTokenDisplay(msg.content.split('|')[1]);
                }
                if(msg.content.indexOf('--editpdkey') !== -1){
                    let markerName = msg.content.split('|')[2].toLowerCase(),
                    padID = msg.content.split('|')[1],
                    currentmarkers;
                    obj = getObj("graphic", padID );
                    currentMarkers = obj.get("statusmarkers").split(',');
                    if(_.indexOf(currentMarkers, markerName) !== -1){
                        currentMarkers = _.without(currentMarkers, markerName)
                    }else{
                        currentMarkers.push(markerName);
                    }
                    obj.set("statusmarkers", currentMarkers.join(','));
                    editPadTokenDisplay(msg.content.split('|')[1]);
                }
                if(msg.content.indexOf('--autoteleport') !== -1){
                    Teleport.configparams.AUTOTELEPORT = (Teleport.configparams.AUTOTELEPORT)?false:true;
                    setStateParam('AUTOTELEPORT',Teleport.configparams.AUTOTELEPORT);
                    configDisplay();
                }else if(msg.content.indexOf('--autoping') !== -1){
                    Teleport.configparams.AUTOPING = (Teleport.configparams.AUTOPING)?false:true;
                    setStateParam('AUTOPING',Teleport.configparams.AUTOPING);
                    configDisplay();
                }else if(msg.content.indexOf('--hideping') !== -1){
                    Teleport.configparams.HIDEPING = (Teleport.configparams.HIDEPING)?false:true;
                    setStateParam('HIDEPING',Teleport.configparams.HIDEPING);
                    configDisplay();
                }else if(msg.content.indexOf('--showsfx') !== -1){
                    Teleport.configparams.SHOWSFX = (Teleport.configparams.SHOWSFX)?false:true;
                    setStateParam('SHOWSFX',Teleport.configparams.SHOWSFX);
                    configDisplay();
                }
            }
        
        },
        outputToChat = function(msg,tgt){
            tgt = (tgt !== undefined && tgt !== null)?tgt:'gm';
            sendChat('system','/w "' + tgt + '" ' + msg,null,{noarchive:true});
        },
        outputOpenMessage = function(msg,tgt){
            formattedmessage = '<div><div>' + msg + '</div></div>';
            sendChat('Environment', formattedmessage);
        },
        autoTeleportCheck = function(obj){
            if(Teleport.configparams.AUTOTELEPORT===false){
                return;
            }
            if(obj.get('_subtype') === "token" && obj.get('lastmove') !== '' && obj.get('layer') !== 'gmlayer' ){
                teleportPadCheck(obj);
            }
        },
        RegisterEventHandlers = function() {
            on('chat:message', msgHandler);
            on('change:graphic', autoTeleportCheck);
            DEFAULTPLAYER = (function(){
                                let player;
                                let playerlist = findObjs({                              
                                      _type: "player",                          
                                });
                                _.each(playerlist, function(obj) {    
                                  if(playerIsGM(obj.get("_id"))){
                                      player = obj;
                                  };
                                });
                                return player;
                            })();
            TOKENMARKERS = JSON.parse(Campaign().get("token_markers"));
            
            if(!state.teleport.help || !getObj('handout',state.teleport.help)){
    		    if(findObjs({type:'handout',name:'Teleport API'})[0]){
    		        state.teleport.help = findObjs({type:'handout',name:'Teleport API'})[0].get('_id');
    		    }else{
    		        let content = helpDisplay(),
    		        handout = createObj('handout',{
                        name: 'Teleport API',
                        inplayerjournals: "gm",
                        controlledby: DEFAULTPLAYER.get('_id')
                    });
                    state.teleport.help = handout.get('_id');
                    setTimeout(function(){
                        handout.set('notes',content);
                    },0);
    		    }
    		}
        };     
        return {
            startup: RegisterEventHandlers,
            configparams: {
                "AUTOTELEPORT": AUTOTELEPORT,
                "AUTOPING": AUTOPING,
                "HIDEPING": HIDEPING,
                "SHOWSFX": SHOWSFX
            }
        }
        
    }());


on('ready',() => {    
    Teleport.startup();
});