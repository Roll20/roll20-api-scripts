/*
PAGENAVIGATOR script:
Author: Scott C.
Contact: https://app.roll20.net/users/459831/scott-c
Thanks to: The Aaron, Arcane Scriptomancer and Stephen for their help with the bulk of this script.

Script goal: to simplify moving between maps in Roll20.

Possible new Features:
Find a way to recognize destination tokens without needing StatusMarker (possibly through use of State and an update command)
    Update State on some command (!nav config maybe)
    On update command activation do a search for GMlayer and Map tokens Campaign wide with names equal to a page's name (using .indexOf() probably)
    and load those into state.PAGENAVIGATION.destinations (protype name)
    Does not update this unless told to do so.
        !nav config could become an options menu with API buttons for determining overall script workings
Add the ability to manually move individual players back to the player ribbon (reverse of splitting the party)
    probably through an API button generation similar to the one for !nav pages that would create a button for each player and delete their 
    playerspecificpages entry if pressed
Potentially set limits on ability of players to move other players around pages.
    would use the state, and probably be part of !nav config
Reduce the clutter of the help screen:
    perhaps general descriptions in initial help screen with button activated details?
Find a way to eliminate the second word in two part names entering into the chat.
Add handling for Names (Player and Character and token if possible), Character IDs.
*/
var PAGENAVIGATOR= PAGENAVIGATOR|| (function(){
    'use strict';

    var version = '0.1.031',
        lastUpdate = 1463700815,
        schemaVersion = 1.031,
        defaults = {
            css: {
                button: {
                    'border': '1px solid #cccccc',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '.1em 1em',
                    'color': 'white'
                }
            }
        },
        templates = {},
        
    /*Provides handling of troublesome characters for sendChat*/
    ch = function (c) {
        var entities = {
            '<' : 'lt',
    		'>' : 'gt',
			"'" : '#39',
			'@' : '#64',
			'{' : '#123',
			'|' : '#124',
			'}' : '#125',
			'[' : '#91',
			']' : '#93',
			'"' : 'quot',
			'-' : 'mdash',
			' ' : 'nbsp'
		};

		if(_.has(entities,c) ){
			return ('&'+entities[c]+';');
		}
		return '';
	},
    
    /*Builds templates for use in all other functions*/
    buildTemplates = function() {
        templates.cssProperty =_.template(
            '<%=name %>: <%=value %>;'
        );

        templates.style = _.template(
            'style="<%='+
                '_.map(css,function(v,k) {'+
                    'return templates.cssProperty({'+
                        'defaults: defaults,'+
                        'templates: templates,'+
                        'name:k,'+
                        'value:v'+
                    '});'+
                '}).join("")'+
            ' %>"'
        );
        
        templates.button = _.template(
            '<a <%= templates.style({'+
                'defaults: defaults,'+
                'templates: templates,'+
                'css: _.defaults(css,defaults.css.button)'+
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
        );
    },
    
    /*Makes the API buttons used throughout the script*/
    makeButton = function(command, label, backgroundColor, color){
        return templates.button({
            command: command,
            label: label,
            templates: templates,
            defaults: defaults,
            css: {
                color: color,
                'background-color': backgroundColor
            }
        });
    },
    
    /*Checks the API environment to make sure everything is prepped for the script*/
    checkInstall = function() {    
        log('-=> Page Navigator v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'PAGENAVIGATOR') || state.PAGENAVIGATOR.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
                		switch(state.PAGENAVIGATOR&& state.PAGENAVIGATOR.version) {
                case 'UpdateSchemaVersion':
                    state.PAGENAVIGATOR.version = schemaVersion;
                    break;

                default:
					state.PAGENAVIGATOR= {
						version: schemaVersion,
					};
					break;
			}
		}
        buildTemplates();
	},
    
    /*mapConfig = function() {
        Proposed Configs:
            Accesses:
                Whole Party: player/GM          } 
                Current Party: player/GM        }-These settings affect who can be moved by who
                Specific Player: player/GM      } 
                    All/CurrentParty/Self Only  }-Affects whether a player can specifically move all players, the current party only, or only themselves with !nav pages ...
            Identifying Player accessible pages:
                Players Access all pages: On/Off
                Identification Mode: Statusmarker/By Name
                    Statusmarker: Cycle Through List of statusmarkers if ID mode is set to 'Statusmarker'
                    Update: Updates the destination pages if ID mode is set to 'By Name'
            
    }
    */
    
    /*Moves a specific player or group to a page*/
    movePlayer = function(destination, playerid){
        let pp = Campaign().get('playerspecificpages');
        pp = (_.isObject(pp) ? pp : {} );
        var iteration = 0;
        sendChat('Page Navigator', 'Some players are being split from the party.');
        _.each(playerid, function(){
            pp[playerid[iteration]] = destination;
            iteration++;
        });
        Campaign().set({playerspecificpages: false});
        Campaign().set({playerspecificpages: pp});
    },
    
    /*Moves the current party (maintains split party) to a specific page*/
    moveCurrentParty = function(destination){
        sendChat('Page Navigator', 'The current party is being moved to a new map.');
        Campaign().set({playerpageid: destination});
    },
    
    /*Moves all players to a specific page and moves everyone back to the party ribbon*/
    moveAllPlayers = function(destination){
        sendChat('Page Navigator', 'All players are being moved to a new map');
        Campaign().set({playerpageid: destination, playerspecificpages: false});
    },
    
    /*Determines if there was a collision between a character-token and a destination-token and calls for API permission buttons be made and outputs them to chat*/
    getDestinationCollisions = function(token) {
        var pageId,
        destinations,
        collisions,
        tokenControl,
        controlList = '',
        iteration = 0,
        character,
        msg = '',
        destination,
        overlapCollision,
        lastCollision;
        pageId = token.get('_pageid');
        destinations = getDestinations(pageId);
        collisions = TokenCollisions.getCollisions(token, destinations);
        lastCollision = _.last(collisions);
        if(token.get('represents')){
            character = getObj('character', token.get('represents'));
            tokenControl = character.get('controlledby').split(",");
        }else{
            tokenControl =  token.get('controlledby').split(",");
        }
        if(lastCollision && token.get('name') && tokenControl){
            overlapCollision = TokenCollisions.isOverlapping(token, lastCollision, false);
            if(overlapCollision){
                destination = findObjs({
                            type: 'page',
                            name: lastCollision.get('name')
                });
                if(lastCollision && _.contains(tokenControl, 'all') && destination[0]){
                    msg += makeButton(
                        '!nav whole ' + destination[0].id, 
                        'Whole Party', '#fff8dc', '#191970'
                    );
                    msg += makeButton(
                        '!nav current ' + destination[0].id, 
                        'Current Party', '#fff8dc', '#191970'
                    );
                } else if(lastCollision && !_.contains(tokenControl, 'all') && destination[0]){
                    _.each(tokenControl, function(){
                        controlList += tokenControl[iteration] + ' ';
                        iteration++;
                    })
                    iteration = 0;
                    msg += makeButton(
                        '!nav whole ' + destination[0].id, 
                        'Whole Party', '#fff8dc', '#191970'
                    );
                    msg += makeButton(
                        '!nav current ' + destination[0].id, 
                        'Current Party', '#fff8dc', '#191970'
                    );
                    msg += makeButton(
                        '!nav player ' + destination[0].id + ' ' + controlList, 
                        'Controlling Player(s)', '#fff8dc', '#191970'
                    );
                }
                if(destination[0]){
                    if(tokenControl && destination[0].get('name').indexOf('"players"')>=0){
                        sendChat('Page Navigation', '/w ' + token.get('name') +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                            + token.get('name') + ' would like to move to ' + destination[0].get('name').split(/"players"/)[0] + '. Who is traveling with them? </div>'
                            +'<p>' + msg + '<p>' +
                            '</div>'
                        );
                    }
                    sendChat('Page Navigation', '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                        + token.get('name') + ' would like to move to ' + destination[0].get('name').split(/"players"/)[0] + '. Who is traveling with them? </div>'
                        +'<p>' + msg + '<p>' +
                        '</div>'
                    );
                }
            }
        }
   },
    
    /*Returns all tokens designated as a destination token*/
    getDestinations = function(pageId){
        return findObjs({
            pageid: pageId,
            type: 'graphic',
            layer: /*'map' ||*/ 'gmlayer',
            statusmarkers: 'flying-flag'
        });
    },
    
    /*Finds all the nonarchived pages in the campaign and returns pages based on the access
    */
    getPages = function(access) {
        var pages = findObjs({
                type: 'page',
                archived: false
            }),
        fpages;
        if(access === 'player'){
            fpages = _.filter(pages, function(p){
                return (p.get('name').indexOf('"players"')>=0);
            })
            return fpages;
        }else{
            return pages;
        }
    },
    
    /*Takes an array of tokens and gets who they are controlled by. Creates API buttons to send the indicated player(s) to specific maps and outputs those
    buttons to Chat based on the access of the messaging user.
    */
    pagesPlayerDialog = function(whoToMove, access, speaker) {
        var pages = getPages(access),
        msg = '',
        tokensControl,
        allCount = 0,
        iteration = 0,
        tokensControl = _.map(whoToMove, function(obj){
            return obj[0].get('controlledby').split(',');
        }),
        players,
        character = _.map(whoToMove, function(obj){
                return findObjs({
                    type: 'character',
                    id: obj[0].get('represents')
                });
        }),
        idList = '',
        names,
        nameList = '';
        if(character){
            tokensControl = _.map(character, function(obj){
                return obj[0].get('controlledby').split(',');
            });
        }else{
            tokensControl = _.map(whoToMove, function(obj){
            return obj[0].get('controlledby').split(',');
            });
        }
        if(pages.length === 0 || !pages){
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                        +' There are no valid destinations. This is either because there are no pages in the campaign, or because the GM has not specified any as player accessible via adding <b>"players"</b> to the page name.'
            );
        }
        _.each(tokensControl, function(){
            if(_.contains(tokensControl[iteration], 'all') && allCount === 0){
                pagesPartyDialog('all');
                allCount++;
            }
            iteration++;
        });
        iteration = 0;
        if(allCount===0){
            players = _.map(tokensControl, function(id){
                return findObjs({
                    type: 'player',
                    id: id[0]
                });
            });
            names = _.map(players, function(obj){
                return obj[0].get('_displayname');
            });
            _.each(names, function(){
                nameList += names[iteration] + ' ';
                iteration++;
            })
            iteration = 0;
            _.each(tokensControl, function(){
                idList += tokensControl[iteration] + ' ';
                iteration++;
            })
            iteration = 0;
            _.each(pages, function(){
                msg += makeButton(
                        '!nav player ' + pages[iteration].id + ' ' + idList,
                        pages[iteration].get('name').split(/"players"/)[0], '#fff8dc', '#191970'
                );
                iteration++;
            });
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                    + 'As ' + speaker + ' you can move ' + nameList + ' to:' + '</div>'
                    +'<p>' + msg + '<p>' +
                    '</div>'
            );
        };
    },
    
    /* Makes and outputs buttons to send the whole party, or just the current party to any page (based on the user's access).*/
    pagesPartyDialog = function(whoToMove, access, speaker) {
        var pages = getPages(access),
        msg = '',
        iteration = 0,
        pageName;
        if(pages.length >= 1 && whoToMove === 'whole' || whoToMove === 'current') {
            _.each(pages, function(){
                 msg += makeButton(
                        '!nav ' + whoToMove + ' ' + pages[iteration].id, 
                        pages[iteration].get('name').split(/"players"/)[0], '#fff8dc', '#191970'
                );
                iteration++;
            });
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                        + 'As ' + speaker + ' you can set the ' + whoToMove + ' party' + ch("'") + 's page to:</div>'
                        +'<p>' + msg + '<p>' +
                        '</div>'
            );
            return;
        }else if(pages.length === 0){
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                        +' There are no valid destinations. This is either because there are no pages in the campaign, or because the GM has not specified any as player accessible via adding <b>"players"</b> to the page name.'
            );
        }
    },
    
    
    /*Shows the help dialog*/
    showHelp = function(who, details) {
        var commands,
        buttons,
        access,
        definitions;
        if(!details){details=''}
        switch (details){
            case '':
                commands =  makeButton(
                        '!nav help commands', '<b>Commands</b>', '#191970', '#fff8dc'
                );
                buttons =  makeButton(
                        '!nav help buttons', '<b>Buttons</b>', '#191970', '#fff8dc'
                );
                access =  makeButton(
                        '!nav help access', '<b>Access</b>', '#191970', '#fff8dc'
                );
                definitions =  makeButton(
                        '!nav help definitions', '<b>Defining Destinations</b>', '#191970', '#fff8dc'
                );
                sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'<p>Page Navigator allows you to more easily move your players from page to page. You can utilize the script through API commands or by relying on token collisions to provide a more interactive map for your players.</p>'
                    +'</div><br>'+definitions
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on how to define destination tokens.</p></div>'
                    +'<br>'+commands
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on chat commands for the script using <b>!nav</b></p></div>'
                    +'<br>'+buttons
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on all the various API butons which are generated by the script.</p></div>'
                    +'<br>'+access
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on setting different access levels for specific pages and what exactly player vs. gm access means</p></div>'
                    +'</div>'
                    +'</div>'
                );
                break;
            case 'commands':
                sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version + ' Commands:'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'The api command to trigger the script is <b>!nav</b>. The commands that can be passed with !nav are:<br>'
                    +'<ul>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">help</span></b> '+ch('-')+' Shows the Help screen'
                    +'</li> '
                    +'<li>'
                    +'<b><span style="font-family: serif;">pages</span></b> '+ch('-')+' Brings up a dialog of all non-archived pages in the Campaign for specifying a page to send players to.'
                    +'<br>The exact behavior is dependent on the next argument, which can be <b>"whole"</b>, <b>"current"</b>, or <b>"player"</b>. <br>If "player" is the next argument, it needs to be followed by a list of token_ids passed via '+ch('@')+'{target|target1|token_id} ... '+ch('@')+'{target|targetn|token_id} or  '+ch('@')+'{selected|token_id (only the id(s) of one token can be passed this way)}.'
                    +'</li>'
                );
                break;
            case 'buttons':
                sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version + ' Buttons:'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'There are several API button dialogs that may be generated while using this script. These are descriptions of what each button will do.<br>'
                    +'<b>Dialog for a token colliding with a destination-token:</b>'
                    +'<ul>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Whole Party</span></b> '+ch('-')+' Will move all players in the game to the player ribbon, and will move the player ribbon to the page described in the dialog.'
                    +'</li> '
                    +'<li>'
                    +'<b><span style="font-family: serif;">Current Party</span></b> '+ch('-')+' Will move the player ribbon to the designated page, but will not affect any players split from the party.'
                    +'</li>'
                    +'<li>'
                    +'<b><span style="font-family: serif;">Controlling Player(s)</span></b> '+ch('-')+' Will move any players set to control the token or its associated character (if it represents a character) to the designated page.'
                    +'</li></ul><br>'
                    +'<b>Dialog for the pages command:</b>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">The dialogs that are produced by using <b>!nav pages</b> produce a button for each page that the sender of the message has access to. These buttons will send players to the indicated map based on how pages was called.</div>'
                );
                break;
            case 'access':
                sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version + ' Access:'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'Page Navigator functions differently based on the access allowed by the triggering player.'
                    +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Setting Access</span></b> '+ch('-')+' Pages are GM access only by default. To set a page to Player access, simply add <b>"players"</b> to the end of the page name. Any text after the tag will not be shown in any button labels or dialogs.'
                    +'<ul>'
                    +'Example: <b>Test Page</b> - GM only page<br>vs.<br><b>Test Page "players"</b> - player visible page'
                    +'</ul>'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">GM Access</span></b> '+ch('-')+' If the !nav pages ... command is sent from a GM, all pages are populated as API buttons. The GM receives a whispered movement prompt for all token collision prompted navigation requests.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Player Access</span></b> '+ch('-')+' If the !nav pages ... command is sent from a player, only those pages flagged as player pages are populated as API buttons. Players only receive a whispered movement prompt when their token collides with a player accessible destination.'
                    +'</li> '
                    +'</ul>'
                    );
                break;
            case 'definitions':
                sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version + ' Defining Destinations:'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +"In order for Page Navigator's token collision functionality to work, you must properly set up the destination tokens. The script looks for the following token properties when determining if a token is a destination or not:"
                    +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Layer</span></b> '+ch('-')+' The token must be on the GM layer.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Statusmarker</span></b> '+ch('-')+' The token must be marked with the "flying-flag" statusmarker. It is a black flag on a transparent background.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Token Name</span></b> '+ch('-')+' The name must exactly match the name of whatever page you want it to link to. This includes the "player" tag for marking a page as player accessible.'
                    +'</li> '
                    +'</ul>'
                    );
                break;
        }
    },
    
    /*Self-explanatory, but handles chat input. Also passes the access of the user*/
    handleInput = function(msg_orig){
        var msg = _.clone(msg_orig),
            args,
            who,
            page,
            tokens,
            tokenIds,
            iteration = 0,
            player,
            speaker,
            access;
        
        if (msg.type !== "api") {
            return;
        }
        
        if(playerIsGM(msg.playerid)) {
            access = 'gm';
            speaker = 'gm';
        }else if(!playerIsGM(msg.playerid)){
            access = 'player';
            speaker = msg.who;
        }
        
        who=getObj('player',msg_orig.playerid).get('_displayname');
        
        args = msg.content.split(/\s/);
        switch(args[0]) {
            case '!nav':
                /*if(_.contains(args,'help')) {
                    showHelp(who);
                    return;
                }*/
                switch(args[1]){
                    case 'help':
                        showHelp(who, args[2]);
                        break;
                    case 'whole':
                        if(args[2]){
                            moveAllPlayers(args[2]);
                        }else{
                            sendChat('','/w "'+who+'" '+
                                '<div><b>No pageid associated with that destination:</div> </div>'
                            );
                        }
                        break;
                    case 'current':
                        if(args[2]){
                            moveCurrentParty(args[2]);
                        } else{
                            sendChat('','/w "'+who+'" '+
                                '<div><b>No pageid associated with that destination:</div> </div>'
                            );
                        }
                        break;
                    case 'player':
                        if(args[2] && _.rest(args, 3)){
                            movePlayer(args[2], _.rest(args, 3));
                        }else{
                            sendChat('','/w "'+who+'" '+
                                '<div><b>Player case Error: No pageid associated with that destination or no specific player named:</div> </div>'
                            );
                        }
                        break;
                    case 'pages':
                        if(args[2]){
                            if(args[2] === 'whole' || args[2] === 'current'){
                                pagesPartyDialog(args[2], access, speaker);
                            //Add handling for names(character, token, player?) and character id's. Handle names based on config options (token, 
                            //character, or player chosen in config).
                            //Need to figure out how to handle multi-word names
                            }else if(args[2] === 'player' && _.rest(args, 3)){
                                //Add handling for msg.selected, if args[3] is null maybe? or maybe if args[3] is the word selected
                                tokens = _.map(_.rest(args,3), function(id){
                                        return findObjs({
                                            type: 'graphic',
                                            id: id
                                        });
                                });
                                pagesPlayerDialog(tokens, access, speaker);
                            }
                        }else{
                            sendChat('Page Navigator', '/w ' + who + ' The previous !nav command did not have sufficient arguments.');
                            showHelp(who);
                        }
                }
                    
                break;
        }
    },
    
    RegisterEventHandlers = function() {
        on('change:graphic', getDestinationCollisions);
        on('chat:message', handleInput);
    };
    
    return {
        CheckInstall: checkInstall,
    	RegisterEventHandlers: RegisterEventHandlers
	};
}());

on("ready",function(){
    'use strict';
    
    PAGENAVIGATOR.CheckInstall();
    PAGENAVIGATOR.RegisterEventHandlers();
});
