/*
PAGENAVIGATOR script:
Author: Scott C.
Contact: https://app.roll20.net/users/459831/scott-c
Thanks to: The Aaron, Arcane Scriptomancer and Stephen for their help with the bulk of this script.

Script goal: to simplify moving between maps in Roll20.
IDEAS FOR IMPLEMENTING AUTO-TOKEN GENERATION:
Chat menu selection of default player character's/pets
    Chat button to bring up drop-down selection of all characters controlled by that player + an option for has pets
        has pets would bring up following dropdowns: 
            Primary Character: select primary character
            # of followers: enter number of followers
                Would bring up a drop-down to select what follower to use for each number (e.g. follower 1: Character options)
    Chat Prompt to GM on move for any additional characters?
*/
var PAGENAVIGATOR= PAGENAVIGATOR|| (function(){
    'use strict';
    
    var version = '0.1.43',
        lastUpdate = 1474374817,
        schemaVersion = 1.42,
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
        statusColormap = ['#C91010', '#1076c9', '#2fc910', '#c97310', '#9510c9', '#eb75e1', '#e5eb75'],
        templates = {},
        allPages,
        playerPages,
        destTokens,
        players,
        tokenNotes = {},
        
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
    
    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
            //' ' : '&'+'nbsp'+';',
            '&' : '&'+'amp'+';',
            '<' : '&'+'lt'+';',
            '>' : '&'+'gt'+';',
            "'" : '&'+'#39'+';',
            '@' : '&'+'#64'+';',
            //'{' : '&'+'#123'+';',
            '|' : '&'+'#124'+';',
            '}' : '&'+'#125'+';',
            ',' : '&'+'#44'+';',
            '[' : '&'+'#91'+';',
            ']' : '&'+'#93'+';',
            '"' : '&'+'quot'+';',
            //'-' : '&'+'mdash'+';'
        },
        re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),
    
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
		};
        if(!state.PAGENAVIGATOR.players){
            state.PAGENAVIGATOR.players={};
        };
        loadObjects();
        _.each(players,function(p){
            if(!state.PAGENAVIGATOR.players[p.id]){
                state.PAGENAVIGATOR.players[p.id]=[];
            };
        })
        log('Page Navigator Memory: Stored Page & Destination-Token Ids converted to Roll20 objects. Ready to be accessed');
        defaultOptions();
        buildTemplates();
        if(!state.PAGENAVIGATOR.configButton){
            state.PAGENAVIGATOR.configButton = makeButton(
                '!nav config', 
                '<b>Configuration Options</b>', '#191970', '#fff8dc'
            );
        }
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
    
    //Makes the config option status buttons as they have a slightly different formatting than the rest of the buttons.
    makeStatusButton = function(status, button) {
        var i=_.indexOf(state.PAGENAVIGATOR.statusquery,status),
        backColor = 'transparent',
        command;
        if(!button){
            if(status===state.PAGENAVIGATOR.dmarker && !button){
                backColor = '#228b22';
            }
            command = '<a style="background-color: '+backColor+'; padding: 0;" href="!nav setDmarker '+status+'">';
        }
        if(button){
            command = command = '<a style="background-color: '+backColor+'">';
        }
        
        if(i===0){
            return command + '<div style ="color:black">Name Only<div style="width: 5px; height: 24px; '
            +'border-radius:20px; display:inline-block; margin: 0; border:0; cursor: pointer; text:Name Only "></div></a>'
        }
        if(i>0 && i<8) {
            return command + '<div style="width: 24px; height: 24px; '
            +'border-radius:20px; display:inline-block; margin: 0; border:0; cursor: pointer;background-color: '+statusColormap[i-1]+'"></div></a>';
        }
        if(i===8) {
            return command + '<div style="'
            +'font-family:Helvetica Neue,Helvetica, Arial, sans-serif;font-size:31px;font-weight:bold;color: red;width: 24px; height: 24px;'
            +'display:inline-block; margin: 0; border:0; cursor: pointer;background-color:">X</div></a>';
        }
        if(i>8){
            return command + '<div style="width: 24px; height: 24px; '
            +'display:inline-block; margin: 0; border:0; cursor: pointer;padding:0;background-image: url(\'https://app.roll20.net/images/statussheet.png\');'
            +'background-repeat:no-repeat;background-position: '+((-34)*(i-9))+'px 0px;"></div></a>';
        }
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
    
    /*stores all tokens designated as a destination token in the state*/
    getDestinations = function(){
        //state.PAGENAVIGATOR.destinations = false;
        var graphics = findObjs({
            type: 'graphic',
        }),
        dests;
        switch(state.PAGENAVIGATOR.dmarker) {
            case 'name':
                dests = _.filter(graphics, function(d){
                    return (_.contains(state.PAGENAVIGATOR.pagenames, d.get('name'))===true && (d.get('layer')==='gmlayer'||d.get('layer')==='gmlayer'));
                });
                state.PAGENAVIGATOR.destinationids = _.map(dests,function(d){
                    return d.get('id');
                });
                break;
            default:
                dests = _.filter(graphics, function(d){
                    return (_.contains(state.PAGENAVIGATOR.pagenames, d.get('name'))===true && (d.get('layer')==='map'||d.get('layer')==='gmlayer') && d.get('statusmarkers').indexOf(state.PAGENAVIGATOR.dmarker)>=0);
                });
                state.PAGENAVIGATOR.destinationids = _.map(dests,function(d){
                    log(d);
                    return d.get('id');
                });
                break;
        }
        loadObjects();
        //sendChat('Page Navigation','/w gm The array of destination tokens has been updated');
    },
    
    /*Finds all the nonarchived pages in the campaign and returns pages based on the access
    */
    getPages = function() {
        state.PAGENAVIGATOR.pageids = false;
        state.PAGENAVIGATOR.playerpageids = false;//wipe the page related states clean
        var pages = findObjs({
            type: 'page',
            archived: false
        }),
        pPages;
        switch(state.PAGENAVIGATOR.access){
            case 'restricted':
                pPages = _.filter(pages, function(p){
                    return (p.get('name').indexOf(state.PAGENAVIGATOR.pageMarker)>=0);
                })
                break;
            case 'open':
                pPages = pages;
        };
        state.PAGENAVIGATOR.pageids = _.map(pages, function(p) {
            return p.get('id');
        });
        state.PAGENAVIGATOR.playerpageids = _.map(pPages, function(p) {
            return p.get('id');
        });
        state.PAGENAVIGATOR.pagenames = _.map(pages, function(p) {
            return p.get('name');
        });
        getDestinations();
    },
    
    loadObjects = function(){
        allPages = findObjs({
            type: 'page',
        });
        allPages = _.filter(allPages, function(p){
            return _.contains(state.PAGENAVIGATOR.pageids, p.get('id'));
        });
        playerPages = findObjs({
            type: 'page',
        });
        playerPages = _.filter(allPages, function(p){
            return _.contains(state.PAGENAVIGATOR.playerpageids, p.get('id'));
        });
        destTokens = findObjs({
            type: 'graphic',
        });
        destTokens = _.filter(destTokens, function(t){
            return _.contains(state.PAGENAVIGATOR.destinationids, t.get('id'));
        });
        _.each(destTokens,function(t){
            t.get('gmnotes',function(gm){
                tokenNotes[t.id]=gm;
            });
        });
        players = findObjs({
            type: 'player'
        });
    },
    
    //sets the default states if they do not currently have a value or do not currently exist
    defaultOptions = function(){
        if(!state.PAGENAVIGATOR.control){
            state.PAGENAVIGATOR.control = 'whole';//can be 'whole', 'current', or 'self'
        }
        if(!state.PAGENAVIGATOR.access){
            state.PAGENAVIGATOR.access = 'restricted';//can be 'restricted' or 'open'
        }
        if(!state.PAGENAVIGATOR.dmarker){
            state.PAGENAVIGATOR.dmarker = 'statusmarker';//can be any 'statusmarker' or 'name' for 'name only'
        }
        if(!state.PAGENAVIGATOR.marker){
            state.PAGENAVIGATOR.marker = 'flying-flag';//can be the name of any statusmarker
        }
        if(!state.PAGENAVIGATOR.statusquery) {
            var markers = 'name,red,blue,green,brown,purple,pink'+
            ',yellow,dead,skull,sleepy,half-heart,half-haze,interdiction,snail,lightning-helix,'+
            'spanner,chained-heart,chemical-bolt,deathzone,drink-me,edge-crack,ninja-mask,stopwatch,'+
            'fishing-net,overdrive,strong,fist,padlock,three-leaves,fluffy-wing,pummeled,tread,arrowed'+
            ',aura,back-pain,black-flag,bleeding-eye,bolt-shield,broken-heart,cobweb,broken-shield,flying-flag'+
            ',radioactive,trophy,broken-skull,frozen-orb,rolling-bomb,white-tower,grab,screaming,'+
            'grenade,sentry-gun,all-for-one,angel-outfit,archery-target';
            state.PAGENAVIGATOR.statusquery = markers.split(',');
        }
        if(!state.PAGENAVIGATOR.pageMarker){
            state.PAGENAVIGATOR.pageMarker = '.players';
        }
    },
    
    //the following three functions set the various states to new options when they are updated in the config screen.
    setControl = function(option) {//Sets the control state to one of 'whole' (default), 'current', or 'self'
        state.PAGENAVIGATOR.control = option;
        getPages();
        outputConfig();
    },
    
    setAccess = function(option) {//sets the access state to either 'restricted' (default) or 'open'
        state.PAGENAVIGATOR.access = option;
        getPages();
        outputConfig();
    },
    
    setDmarker = function(option) {//sets the dmarker state to either a specific status marker (default) or 'name'
        state.PAGENAVIGATOR.dmarker = option;
        getPages();
        outputConfig();
    },
    
    setPageMarker = function(tag){//sets the player page tag. Defaults to "players"
        state.PAGENAVIGATOR.pageMarker = tag
        getPages();
        outputConfig();
    },
    
    cleanImgSrc = function(img){
        var parts = img.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3];
        }
        return;
    },
    
    setDefaultTokens = function(playerId,characters){
        var charNum = 0;
        _.each(characters,function(obj){
            obj.get('defaulttoken',function(t){
                if(charNum === 0){
                    state.PAGENAVIGATOR.players[playerId]=[];
                };
                t=JSON.parse(t);
                var img = cleanImgSrc(t.imgsrc);
                state.PAGENAVIGATOR.players[playerId].push({
                    //character ID
                    //'cid' : character.id,
                    //Represents
                    'represents' :t.represents || '',
                    'name' :t.name || '',
                    'controlledby' :t.controlledby || '',
                    //Image/Token appearance
                    'imgsrc' :img,
                    'width' :t.width || 70,
                    'height' :t.height || 70,
                    'isdrawing' :t.isdrawing || false,
                    'tint_color' :t.tint_color || 'transparent',
                    'statusmarkers' :t.statusmarkers || '',
                    //Token Fields
                    'gmnotes' :t.gmnotes || '',
                    //Bars
                    'bar1_link' :t.bar1_link || '',
                    'bar2_link' :t.bar2_link || '',
                    'bar3_link' :t.bar3_link || '',
                    'bar1_value' :t.bar1_value || '',
                    'bar2_value' :t.bar2_value || '',
                    'bar3_value' :t.bar3_value || '',
                    'bar1_max' :t.bar1_max || '',
                    'bar2_max' :t.bar2_max || '',
                    'bar3_max' :t.bar3_max || '',
                    //Auras 
                    'aura1_radius' :t.aura1_radius || '',
                    'aura2_radius' :t.aura2_radius || '',
                    'aura1_color' :t.aura1_color || '#FFFF99',
                    'aura2_color' :t.aura2_color || '#59E594',
                    'aura1_square' :t.aura1_square || false,
                    'aura2_square' :t.aura2_square || false,
                    //show attributes
                    'showname' :t.showname || false,
                    'showplayers_name' :t.showplayers_name || false,
                    'showplayers_bar1' :t.showplayers_bar1 || false,
                    'showplayers_bar2' :t.showplayers_bar2 || false,
                    'showplayers_bar3' :t.showplayers_bar3 || false,
                    'showplayers_aura1' :t.showplayers_aura1 || false,
                    'showplayers_aura2' :t.showplayers_aura2 || false,
                    //Edit attributes
                    'playersedit_name' :t.playersedit_name || false,
                    'playersedit_bar1' :t.playersedit_bar1 || false,
                    'playersedit_bar2' :t.playersedit_bar2 || false,
                    'playersedit_bar3' :t.playersedit_bar3 || false,
                    'playersedit_aura1' :t.playersedit_aura1 || false,
                    'playersedit_aura2' :t.playersedit_aura2 || false,
                    //Dynamic Lighting
                    'light_radius' :t.light_radius || '',
                    'light_dimradius' :t.light_dimradius || '',
                    'light_otherplayers' :t.light_otherplayers || false,
                    'light_hassight' :t.light_hassight || false,
                    'light_angle' :t.light_angle || '360',
                    'light_losangle' :t.light_losangle || '360',
                    'light_multiplier' :t.light_multiplier || '1'
                });
                charNum++;
            });
            
        });
    },
    
    //gets the current states, and outputs everything in a nicely formatted config screen
    outputConfig = function() {
        /*Outline of Config options:
            Players control:Whole Party/Current Party/Self Only     }-Sets whether players can move everyone, the current party only, or 
                                                                        themselves/other controllers of a token they control only
            Access: Restricted/Open                                 }-Sets whether players only have access to pages designated as "players" or can
                                                                        access all pages
            Identification Mode: Specific StatusMarker/By Name Only }-The state is selected from a list of status markers or name only and affects 
                                                                        how destination tokens are identified by the script. Selecting a marker will
                                                                        set it to look for destination tokens named after a page and marked with the
                                                                        appropriate statusmarker
            Update: Updates the destination pages                   }-Causes getPages and getDestinations to be called to update the state.*/
        var controlButton,
        accessButton,
        dmarkerButton = '',
        updateButton = makeButton(
                    '!nav update', '<b>Update Destinations & Pages</b>', '#fff8dc', '#191970'
        ),
        pageButton,
        pageMsg,
        teleportButton,
        removeButton,
        teleportMsg = '',
        playerButton;
        if(state.PAGENAVIGATOR.teleport === 'on'){
            teleportButton = makeButton(
                '!nav-config teleport off',
                'Teleport On', 'green','black'
            );
            teleportMsg+=teleportButton+'<br><br>';
            _.each(players,function(p){
                var characters = _.filter(findObjs({
                        type: 'character',
                        }), function(c){
                            return _.contains(c.get('controlledby').split(','),p.id);
                }),
                charQuery = '',
                petQuery = '';
                _.each(characters, function(c){
                    charQuery += '|' + c.get('name') + ',' + c.id;
                });
                petQuery += HE('?{Primary Character'+charQuery+'|none}'
                +' ?{Number of followers'
                +'|1,'+HE('?{Follower 1'+charQuery+'|none}')
                +'|2,'+HE('?{Follower 1'+charQuery+'|none}'+' ?{Follower 2'+charQuery+'}')
                +'|3,'+HE('?{Follower 1'+charQuery+'|none}'+' ?{Follower 2'+charQuery+'|none}'+' ?{Follower 3'+charQuery+'|none}')
                +'|4,'+HE('?{Follower 1'+charQuery+'|none}'+' ?{Follower 2'+charQuery+'|none}'+' ?{Follower 3'+charQuery+'|none}'+' ?{Follower 4'+charQuery+'|none}')
                +'|5,'+HE('?{Follower 1'+charQuery+'|none}'+' ?{Follower 2'+charQuery+'|none}'+' ?{Follower 3'+charQuery+'|none}'+' ?{Follower 4'+charQuery+'|none}'
                +' ?{Follower 5'+charQuery+'|none}')
                +'}'
                );
                charQuery+='|Has pets/followers,';
                playerButton = makeButton(
                    '!nav-config tokens ' + p.id + ' ?{'+p.get('displayname')+"'s default character"+charQuery+HE(petQuery)+'}',
                    'Set Default Token', 'white', 'black'
                );
                teleportMsg+=p.get('displayname')
                    +'<div style="float:right;">'
                    +playerButton+'</div><br><br><br>';
            });
        }else if(state.PAGENAVIGATOR.teleport === 'off' || !state.PAGENAVIGATOR.teleport){
            teleportButton = makeButton(
                '!nav-config teleport on',
                'Teleport Off', 'gray','white'
            );
            teleportMsg+=teleportButton;
        };
        if(state.PAGENAVIGATOR.access === 'restricted'){
            pageButton = makeButton(
                '!nav-config setpmarker ?{Player accessible page tag|'+state.PAGENAVIGATOR.pageMarker+'}',
                state.PAGENAVIGATOR.pageMarker, 'white', 'black'
            );
            pageMsg = 'Player page tag:'
                    +'<div style="float:right;">'
                    +pageButton+'</div><br><br><br>';
        }else{
            pageMsg = '';
        }
        switch(state.PAGENAVIGATOR.control) {
            case 'whole':
                controlButton = makeButton(
                        '!nav setControl current', 
                        '<b>The Whole Party</b>', '#228b22'
                );
                break;
            case 'current':
                controlButton = makeButton(
                        '!nav setControl self', 
                        '<b>The Current Party</b>', '#ffff00', '#000000'
                );
                break;
            case 'self':
                controlButton = makeButton(
                        '!nav setControl whole', 
                        '<b>Themselves Only</b>', '#ff4500'
                );
                break;
        }
        
        switch(state.PAGENAVIGATOR.access) {
            case 'restricted':
                accessButton = makeButton(
                        '!nav setAccess open', 
                        '<b> Off </b>', '#ff4500'
                );
                break;
            case 'open':
                accessButton = makeButton(
                        '!nav setAccess restricted', 
                        '<b> On </b>', '#228b22'
                );
                break;
        }
        
        
        _.each(state.PAGENAVIGATOR.statusquery, function(s){
            dmarkerButton += makeStatusButton(s);
        });
        
        sendChat('','/w gm '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version+'<b> Options</b>'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;border-bottom: 1px solid black">'
                    +'<p>Page Navigator now has several options that you can set that will stay selected across play sessions.</p>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'Players can move:'
                    +'<div style="float:right;">'
                    +controlButton+'</div><br><br><br></div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'<p>Players can access all pages:</p>'
                    +'<div style="float:right;">'
                    +accessButton+'</div><br><br>'
                    +pageMsg+'</div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'<p>Destination tokens marked by:</p>'
                    +dmarkerButton+'</div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +teleportMsg+'</div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'<div style="float:right;">'
                    +updateButton+'</div><br><br><br>'
                    +'</div>'
                    +'</div>'
                    +'</div>'
        );
    },
    
    //loc attributes: left, top, width,height,pageid
    mapSurrounding = function(loc,newToken,start){//landing token will be filled, finds nearest center of a square that does not ahve a token in it. Pushes the coords to an
    //                                      array, returns the array
        var map = [],
        surround = {
            left : loc.left - (loc.width/2 - 35) + (newToken.width - 70)/2,
            top : loc.top - (loc.height/2 - 35) + (newToken.height - 70)/2,
            width : 0,
            height : 0
        },
        squareNum = 0,
        created = false,
        error,
        flip = false,
        wallPaths = findObjs({
            _type: 'path',
            _pageid: loc.pageid,
            layer: 'walls'
        }),
        wallSegments,
        squareTest = findObjs({
            type: 'graphic',
            pageid: loc.pageid,
            layer: 'objects'
        }),
        squareSeg,
        page = getObj('page',loc.pageid),
        squarePt,
        squareObj,
        landingPt = [loc.left,loc.top,1];
        wallSegments = PathMath.toSegments(wallPaths);
        while(!created && ((_.now() - start)/1000)<25){
            error = null;
            var squareFilter = _.find(squareTest,function(obj){
                var x = false,
                    y = false;
                if((~~(obj.get('left')/70 - 0.5) + 1) === (~~(surround.left/70 - 0.5) + 1)){
                    x = true;
                }else if(obj.get('left') < surround.left){
                    if((obj.get('left') + obj.get('width')/2) > (surround.left - newToken.width/2)){
                        x = true;
                    };
                }else if(obj.get('left') > surround.left){
                    if((obj.get('left') - obj.get('width')/2) < (surround.left + newToken.width/2)){
                        x = true;
                    };
                };
                if((~~(obj.get('top')/70 - 0.5) + 1) === (~~(surround.top/70 - 0.5) + 1)){
                    y = true;
                }else if(obj.get('top') < surround.top){
                    if((obj.get('top') + obj.get('height')/2) > (surround.top - newToken.height/2)){
                        y = true;
                    };
                }else if(obj.get('top') > surround.top){
                    if((obj.get('top') - obj.get('height')/2) < (surround.top + newToken.height/2)){
                        y = true;
                    };
                };
                if(x && y){
                    return true
                }
            });
            //need to add DL path detection
            landingPt = [loc.left,loc.top,1];
            wallSegments = PathMath.toSegments(wallPaths);
            squarePt = [surround.left,surround.top,1];
            squareSeg = [landingPt,squarePt];
            _.each(wallSegments,function(wallSeg){
                if(PathMath.segmentIntersection(squareSeg,wallSeg)){
                    error=1;
                };
            });
            if(surround.left<=0 || surround.top <=0 || (~~(surround.top/70 - 0.5) + 1)>page.get('height') 
            || (~~(surround.left/70 - 0.5) + 1)>page.get('weight')){
                error=1;
            };
            if(!squareFilter && !error){
                return {
                    left : surround.left,
                    top : surround.top,
                    layer: 'objects',
                    pageid:loc.pageid
                };
                created = true;
            };
            if(surround.width<(loc.width- 70)){
                surround.width += 70;
                if(flip === false){
                    surround.left += 70;
                }else{
                    surround.left -= 70;
                };
            }else if(surround.height<(loc.height- 70)){
                surround.height += 70;
                if(flip === false){
                    surround.top += 70;
                }else{
                    surround.top -= 70;
                };
            }else if(surround.height >= (loc.height - 70) && surround.width >= (loc.width - 70)){
                if(flip===false){
                    surround.height = 70;
                    surround.width = 70;
                    surround.left -=70;
                    flip=true;
                }else{
                    surround.height = 0;
                    surround.width = 0;
                    loc.width += 140;
                    loc.height += 140;
                    surround.left -=70;
                    surround.top -=140;
                    flip=false;
                };
            };
        };
    },
    
    createTokenLanding = function(landingToken, playerId){
        if(typeof landingToken ==='string'){
            landingToken = getObj('graphic',landingToken);
        };
        var landingLocation = {
            top : landingToken.get('top'),
            left : landingToken.get('left'),
            pageid : landingToken.get('pageid'),
            height : landingToken.get('height'),
            width : landingToken.get('width'),
            layer : 'objects'
        },
        landingSize = {
            height : landingToken.get('height'),
            width : landingToken.get('width'),
        },
        landingWork,
        landingMod={
            top : 0,
            left: 0
        },
        objWork,
        firstChar,
        charNum = 0,
        characters = [],
        newToken,
        landingWork = _.clone(landingLocation);
        _.each(playerId,function(id){
            var stored = _.clone(state.PAGENAVIGATOR.players[id]);
            _.each(stored,function(c){
                characters.push(c);
            });
        });
        var start = _.now(),
        surr = 'initialized',
        i=0;
        log(characters);
        log(`landingLocation leftXtop: ${landingLocation.left - landingLocation.width/2 + 35} X ${landingLocation.top - landingLocation.height/2 + 35}`);
        while(i<characters.length && surr){
            surr = null;
            surr = mapSurrounding(landingLocation,{width:characters[i].width,height:characters[i].height},start);
            log(surr);
            log(characters[i].name);
            if(surr){
                createObj('graphic',_.defaults(surr,characters[i]));
            }else{
                sendChat('Page Navigator','/w gm A space for all characters could not be found before risking an infinite loop. Please manually copy any missing '
                +'tokens. To avoid this error message in the future, please ensure that your landing locations have enough empty squares in and around them that '
                +'are not blocked by DL paths for all of your party'+ch("'")+'s tokens.');
            };
            i++;
        };
        log(`Tokens created in ${(_.now()-start)/1000} seconds`);
        
    },
    
    //finds the token that represents the link to the previous map
    findEntrance = function(originName, originGM, destination, playerId){
        var landings = _.filter(destTokens, function(d){
            return (d.get('_pageid')===destination);
        });
        _.each(landings, function(obj){
            if(obj.get('gmnotes').indexOf('{')===0 && obj.get('gmnotes').indexOf('}')===(obj.get('gmnotes').length-1)){
                log(decodeURIComponent(obj.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
                var destGM = JSON.parse(decodeURIComponent(obj.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
                if(destGM['location']===originGM['linkLocation'] && obj.get('name')===originName){
                    createTokenLanding(obj,playerId);
                };
            };
        });
    },
    
    /*Moves a specific player or group to a page
    {
        location: any descriptive text
        linkLocation: what descriptive text to look for in the link
    }
    */
    movePlayer = function(destToken, destination, playerid){
        let pp = Campaign().get('playerspecificpages');
        var dToken = getObj('graphic',destToken),
        gm = JSON.parse(decodeURIComponent(dToken.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
        pp = (_.isObject(pp) ? pp : {} );
        sendChat('Page Navigator', 'Some players are being split from the party.');
        _.each(playerid, function(id){
            pp[id] = destination;
        });
        if(state.PAGENAVIGATOR.teleport = 'on'){    
            findEntrance(getObj('page',dToken.get('pageid')), gm, destination, playerid);
        };
        Campaign().set({playerspecificpages: false});
        Campaign().set({playerspecificpages: pp});
    },
    
    movePlayerFromDialog = function(destination, playerid){
        let pp = Campaign().get('playerspecificpages');
        pp = (_.isObject(pp) ? pp : {} );
        sendChat('Page Navigator', 'Some players are being split from the party.');
        _.each(playerid, function(id){
            pp[id] = destination;
        });
        Campaign().set({playerspecificpages: false});
        Campaign().set({playerspecificpages: pp});
    },
    
    movePartyFromDialog = function(whoToMove,destination){
        Campaign().set({playerpageid: destination});
        if(whoToMove === 'whole'){
            sendChat('Page Navigator', 'All players are being moved to a new map');
            Campaign().set({playerspecificpages: false});
        }else{
            sendChat('Page Navigator', 'The current party is being moved to a new map.');
        };
    },
    
    /*Moves the current party (maintains split party) to a specific page*/
    moveCurrentParty = function(destToken, destination){
        var players,
        party = [],
        oop,
        gm,
        dToken = getObj('graphic',destToken);
        sendChat('Page Navigator', 'The current party is being moved to a new map.');
        Campaign().set({playerpageid: destination});
        if(state.PAGENAVIGATOR.teleport = 'on'){
            log(destToken);
            gm = JSON.parse(decodeURIComponent(dToken.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
            players = findObjs({
                type: 'player'
            });
            oop = Campaign().get('playerspecificpages');
            _.each(players, function(p){
                if(!oop[p.id] || oop[p.id]===false){
                    party.push(p.id);
                };
            });
            findEntrance(getObj('page',dToken.get('pageid')), gm, destination, party);
        };
    },
    
    /*Moves all players to a specific page and moves everyone back to the party ribbon*/
    moveAllPlayers = function(destToken, destination){
        var players,
        party = [],
        oop,
        gm,
        party,
        dToken = getObj('graphic',destToken);
        sendChat('Page Navigator', 'All players are being moved to a new map');
        Campaign().set({playerpageid: destination, playerspecificpages: false});
        if(state.PAGENAVIGATOR.teleport = 'on'){
            gm = JSON.parse(decodeURIComponent(dToken.get('gmnotes')).split(/<[/]?.+?>/g).join(''));
            players = findObjs({
                type: 'player'
            });
            _.each(players, function(p){
                party.push(p.id);
            });
            oop = Campaign().get('playerspecificpages');
            findEntrance(getObj('page',dToken.get('pageid')), gm, destination, party);
        };
    },
    
    /*Determines if there was a collision between a character-token and a destination-token and calls for API permission buttons be made and outputs them to chat*/
    getDestinationCollisions = function(token) {
        if(!state.PAGENAVIGATOR.destinationids || !destTokens){
            sendChat('Page Navigation', '/w gm ERROR CODE: NULLDEST - You have not yet defined destination tokens in the state. Please update the list of'
            +' destination pages and tokens through the '+state.PAGENAVIGATOR.configButton+' dialog');
            return
        };
        var pageId,
        destinations = _.filter(destTokens, function(d){
            return (d.get('_pageid')===token.get('_pageid'));
        }),
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
                        '!nav whole ' + lastCollision.id +' '+ destination[0].id, 
                        'Whole Party', '#fff8dc', '#191970'
                    );
                    msg += makeButton(
                        '!nav current ' + lastCollision.id +' '+ destination[0].id, 
                        'Current Party', '#fff8dc', '#191970'
                    );
                } else if(lastCollision && !_.contains(tokenControl, 'all') && destination[0]){
                    _.each(tokenControl, function(){
                        controlList += tokenControl[iteration] + ' ';
                        iteration++;
                    });
                    iteration = 0;
                    msg += makeButton(
                        '!nav whole ' + lastCollision.id +' '+ destination[0].id, 
                        'Whole Party', '#fff8dc', '#191970'
                    );
                    msg += makeButton(
                        '!nav current ' + lastCollision.id +' '+ destination[0].id, 
                        'Current Party', '#fff8dc', '#191970'
                    );
                    msg += makeButton(
                        '!nav player ' + lastCollision.id + ' ' + destination[0].id +' ' + controlList, 
                        'Controlling Player(s)', '#fff8dc', '#191970'
                    );
                }
                if(destination[0]){
                    if((tokenControl && destination[0].get('name').indexOf(state.PAGENAVIGATOR.pageMarker)>=0) || state.PAGENAVIGATOR.access === 'open'){
                        sendChat('Page Navigation', '/w "' + token.get('name') +'"<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                            + 'Your character, '+token.get('name') + ', would like to move to ' + destination[0].get('name').split(state.PAGENAVIGATOR.pageMarker)[0] + '. Who is traveling with you? </div>'
                            +'<p>' + msg + '<p>' +
                            '</div>'
                        );
                    }else{
                        sendChat('Page Navigation', '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                            + token.get('name') + ' would like to move to ' + destination[0].get('name').split(state.PAGENAVIGATOR.pageMarker)[0] + '. Who is traveling with them? </div>'
                            +'<p>' + msg + '<p>' +
                            '</div>'
                        );
                    }
                }
            }
        }
    },
    
    pagesTeleport = function(speakerid, destinationid, playerid){
        var landingTokens = _.filter(destTokens, function(d){
            return (d.get('_pageid')===destinationid);
        }),
        landingDetails,
        landingButton,
        landingMsg,
        speaker,
        playerList = '';
        if(speakerid === 'gm'){
            speaker = 'gm';
        }else{
            speaker = getObj('player',speakerid).get('displayname');
        };
        landingMsg = '/w "' + speaker + '" <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
            + "Token teleportation is enabled. Players have been moved to "+getObj('page',destinationid).get('name')+"; select the location to create tokens at or ignore if "
            +'tokens should not be created:</div><p>',
        _.each(playerid,function(id){
            playerList += id + ' ';
        });
        _.each(landingTokens,function(obj){
            var notes = decodeURIComponent(obj.get('gmnotes')).trim();
            if(notes.indexOf('{')===0){
                landingDetails = JSON.parse(notes.split(/<[/]?.+?>/g).join(''));
                landingButton = makeButton(
                    '!nav-teleport ' + obj.id + ' ' + playerList, 
                    landingDetails.location, '#fff8dc', '#191970'
                );
                landingMsg += landingButton;
            };
        });
        sendChat('Page Navigation', landingMsg + '<p> </div>');
    },
    
    /*PAGES FUNCTIONS: The following functions are related to the !nav pages syntax for manually sending players to specific pages*/
    //Allows players to be returned to the player ribbon (rejoin the party)
    pagesReturn = function(whoToMove, access, speaker, speakerid){
        let pp = Campaign().get('playerspecificpages');
        pp = (_.isObject(pp) ? pp : {} );
        var control,
        nameList = '',
        who,
        msg = '',
        ribbon = findObjs({
                    type: 'page',
                    id: Campaign().get('playerpageid')
        })[0],
        character;
        if(access==='player' || whoToMove === 'allow'){
                if(ribbon.get('name').indexOf(state.PAGENAVIGATOR.pageMarker)>=0 || state.PAGENAVIGATOR.access === 'open' || whoToMove === 'allow'){
                        pp[speakerid] = false;
                        sendChat('Page Navigation', '/w "' + speaker + '" You are rejoining the party.');
                        Campaign().set({playerspecificpages: false});
                        Campaign().set({playerspecificpages: pp});
                }else{
                    msg += makeButton(
                        '!nav return ' + speakerid,
                        '<b>Allow</b>', '#fff8dc', '#191970'
                    );
                    sendChat('Page Navigation', '/w "' + speaker + '" The party is currently not on a player accessible page. The GM has been asked to move you back.')
                    sendChat('Page Navigation', '/w gm' + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                    + 'The following players would like to return to the party:<br>'+ nameList + '</div>'
                    +'<p>' + msg + '<p>' +
                    '</div>'
                    );
                };
        }else if(access === 'gm'){
            if(whoToMove){
                control = _.map(whoToMove, function(obj){
                    if(obj[0].get('represents')){
                        character = findObjs({
                            type: 'character',
                            id: obj[0].get('represents')
                        });
                        if(!character[0].get('controlledby')){
                            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                +'ERROR CODE:RETURN NULLCHAR - '+character[0].get('name')+' is not controlled by anyone.</div>'
                            );
                        }else{
                            return character[0].get('controlledby').split(',');
                        }
                    }else{
                        if(!obj[0].get('controlledby')){
                            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                +'ERROR CODE:RETURN NULLTOKEN - '+obj[0].get('name')+' is not controlled by anyone.</div>'
                            );
                        }else{
                            return obj[0].get('controlledby').split(',');
                        }
                        
                    }
                });
                if(!control[0]){return;};
                _.each(control, function(p){
                    pp[p] = false;
                });
                Campaign().set({playerspecificpages: false});
                Campaign().set({playerspecificpages: pp});
            }else{
                Campaign().set({playerspecificpages: false});
            };
        }
    },
    
    /*Takes an array of tokens and gets who they are controlled by. Creates API buttons to send the indicated player(s) to specific maps and outputs those
    buttons to Chat based on the access of the messaging user.
    */
    pagesPlayerDialog = function(whoToMove, access, speaker) {
        if(!allPages || (access === 'player' && (!playerPages || playerPages.length===0))){
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                        +'ERROR CODE: NULLPAGE - There are no valid destinations. This is either because there are no pages in the campaign, or because the GM has not '
                        +'specified any as player accessible via adding <b>"players"</b> to the page name.</div>'
            );
            return;
        }
        var msg = '',
        tokensControl,
        allCount = 0,
        iteration = 0,
        wtm = _.map(whoToMove, function(objid){
            return findObjs({
                type: 'graphic' || 'character',
                id: objid
            })
        }),
        control,
        players,
        character,
        idList = '',
        names,
        nameList = '';
        if(access === 'gm' || state.PAGENAVIGATOR.control !== 'self'){
            control = _.map(wtm, function(obj){
                if(obj[0].get('represents')){
                    character = findObjs({
                        type: 'character',
                        id: obj[0].get('represents')
                    })
                    if(!character[0].get('controlledby')){
                            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                +'ERROR CODE: PLAYER NULLCHAR - '+character[0].get('name')+' is not controlled by anyone.</div>'
                            );
                        }else{
                            return character[0].get('controlledby').split(',');
                        }
                }else if(!obj[0].get('represents')){
                    if(!obj[0].get('controlledby')){
                            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                +'ERROR CODE: PLAYER NULLTOK - '+obj[0].get('name')+' is not controlled by anyone.</div>'
                            );
                        }else{
                            return obj[0].get('controlledby').split(',');
                        }
                }
            });
        }else{
            control = whoToMove;
        }
        if(!control[0]){return;};
        _.each(control, function(objid){
            if(_.contains(objid, 'all') && allCount === 0){
                pagesPartyDialog('all', access, speaker);
                allCount++;
            }
        });
        if(allCount===0){
            if(control.indexOf('-')===-1){
                players = _.map(control, function(id){
                    return findObjs({
                        type: 'player',
                        id: id[0]
                    });
                });
                names = _.map(players, function(obj){
                    return obj[0].get('_displayname');
                });
                _.each(control, function(objid){
                    idList += objid + ' ';
                });
            }else if(control.indexOf('-')>-1){
                players = findObjs({
                    type: 'player',
                    id: control
                });
                names = _.map(players, function(obj){
                    return obj.get('_displayname');
                });
                idList = control;
            }
            _.each(names, function(n){
                nameList += n + ', ';
            });
            if(access === 'gm'){
                _.each(allPages, function(aP){
                    msg += makeButton(
                        '!nav-pages player ' + speaker.id + ' ' + aP.id + ' ' + idList,
                        aP.get('name').split(state.PAGENAVIGATOR.pageMarker)[0], '#fff8dc', '#191970'
                    );
                    
                });
            }else if(access === 'player'){
                _.each(playerPages, function(pP){
                    msg += makeButton(
                            '!nav-pages player ' + speaker.id + ' ' + pP.id + ' ' + idList,
                            pP.get('name').split(state.PAGENAVIGATOR.pageMarker)[0], '#fff8dc', '#191970'
                    );
                });
            }
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
            + 'As a ' + access + ' you can move ' + nameList + ' to:' + '</div>'
            +'<p>' + msg + '<p>' +
            '</div>'
            );
        };
    },
    
    /* Makes and outputs buttons to send the whole party, or just the current party to any page (based on the user's access).*/
    pagesPartyDialog = function(whoToMove, access, speaker) {
        if(!allPages || (access === 'player' && (!playerPages || playerPages.length===0))){
            sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                        +'ERROR CODE: NULLPAGE There are no valid destinations. This is either because there are no pages in the campaign, or because the GM has not '
                        +'specified any as player accessible via adding <b>"players"</b> to the page name.</div>'
            );
            return;
        };
        var msg = '',
        iteration = 0;
        
        if(whoToMove === 'whole' || whoToMove === 'current') {
            if(access==='player'){
                _.each(playerPages, function(){
                     msg += makeButton(
                            '!nav-pages ' + whoToMove + ' ' + playerPages[iteration].id, 
                            playerPages[iteration].get('name').split(state.PAGENAVIGATOR.pageMarker)[0], '#fff8dc', '#191970'
                    );
                    iteration++;
                });
                sendChat('Page Navigation', '/w "' + speaker + '" <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                        + 'As a player you can set the ' + whoToMove + ' party' + ch("'") + 's page to:</div>'
                        +'<p>' + msg + '<p>' +
                        '</div>'
                );
            }else if(access==='gm'){
                iteration=0;
                _.each(allPages, function(){
                     msg += makeButton(
                            '!nav-pages ' + whoToMove + ' ' + speaker.id + ' ' + allPages[iteration].id, 
                            allPages[iteration].get('name').split(state.PAGENAVIGATOR.pageMarker)[0], '#fff8dc', '#191970'
                    );
                    iteration++;
                });
                sendChat('Page Navigation', '/w "' + speaker + '" <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 110%;">'
                        + 'As GM, you can set the ' + whoToMove + ' party' + ch("'") + 's page to:</div>'
                        +'<p>' + msg + '<p>' +
                        '</div>'
                );
            }
            return;
        }else if(pages.length === 0){
            sendChat('Page Navigation', '/w "' + speaker + '" <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                        +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                        +' There are no valid destinations. This is either because there are no pages in the campaign, or because the GM has not specified any as player accessible via adding <b>"players"</b> to the page name.'
            );
        }
    },
    
    /*Shows the help dialog*/
    showHelp = function(who, details, gm) {
        //state.PAGENAVIGATOR.statusquery = false;
        var commands,
        buttons,
        access,
        definitions,
        gmMsg = '';
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
                if(gm==='gm'){
                    gmMsg = '<br>'+definitions
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on how to define destination tokens.</p></div>'
                    +'<br>'+access
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on setting different access levels for specific pages and what exactly player vs. gm access means</p></div>'
                    +'<br>'+state.PAGENAVIGATOR.configButton
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Access the options screen to adjust Page Navigator'+ch("'")+'s behavior.</p></div>';
                };
                sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'<p>Page Navigator allows you to more easily move your players from page to page. You can utilize the script through API commands or by relying on token collisions to provide a more interactive map for your players.</p>'
                    +'<br>'+commands
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on chat commands for the script using <b>!nav</b></p></div>'
                    +'<br>'+buttons
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Click here for details on all the various API butons which are generated by the script.</p></div>'
                    +gmMsg
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
                    +'</li>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">pages</span></b> '+ch('-')+' Brings up a dialog of all non-archived pages in the Campaign for specifying a page to send players to.'
                    +'<br>The exact behavior is dependent on the next argument, which can be:'
                    +'<ul>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">whole</span></b> '+ch('-')+' To move all players to the selected page.'
                    +'</li>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">current</span></b> '+ch('-')+' To move only those players currently in the player ribbon to the selected page.'
                    +'</li>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">player</span></b> '+ch('-')+' To move a specific player(s) to the selected page. This must be followed by at least one token or character id and will move the owners of that token/character to the selected page or will only move the messaging player if the gm has set player control to only themselves.'
                    +'</li>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">return</span></b> '+ch('-')+' If sent by the gm; returns all designated players (via token/character id) or everyone if "whole" is sent as the third argument to the player ribbon. If sent by a player, returns that player to the player ribbon or asks for GM permission to return if the ribbon is on a non-player page.'
                    +'</li></ul><br></li>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">config</span></b> '+ch('-')+' If sent by the gm; brings up the configuration options. Has no effect if sent by a player.'
                    +'</li>'
                    +'</ul>'
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
                    +'<b><span style="font-family: serif;">Whole Party</span></b> '+ch('-')+' Will move all players in the game to the player '
                    +'ribbon, and will move the player ribbon to the page described in the dialog.'
                    +'</li> '
                    +'<li>'
                    +'<b><span style="font-family: serif;">Current Party</span></b> '+ch('-')+' Will move the player ribbon to the designated page,'
                    +' but will not affect any players split from the party.'
                    +'</li>'
                    +'<li>'
                    +'<b><span style="font-family: serif;">Controlling Player(s)</span></b> '+ch('-')+' Will move any players set to control the '
                    +'token or its associated character (if it represents a character) to the designated page.'
                    +'</li></ul><br>'
                    +'<b>Dialog for the pages command:</b>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">The dialogs that are produced by using <b>!nav pages</b> produce a button '
                    +'for each page that the sender of the message has access to. These buttons will send players to the indicated map based on how pages was called.</div>'
                );
                break;
            case 'access':
                if(gm==='gm'){
                    sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version + ' Access:'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'Page Navigator functions differently based on the access allowed by the triggering player.'
                    +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Setting Access</span></b> '+ch('-')+' Pages are GM access only by default. To set a page'
                    +' to Player access, simply add the tag that you have selected to the end of the page name. By default the tag is set to <b>.players</b>. Any text after the tag will not be shown in any button labels or dialogs.'
                    +'<ul>'
                    +'Example: <b>Test Page</b> - GM only page<br>vs.<br><b>Test Page.players</b> - player visible page'
                    +'</ul>'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">GM Access</span></b> '+ch('-')+' If the !nav pages ... command is sent from a GM, all '
                    +'pages are populated as API buttons. The GM receives a whispered movement prompt for all token collision prompted navigation requests.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Player Access</span></b> '+ch('-')+' If the !nav pages ... command is sent from a player'
                    +', only those pages flagged as player pages are populated as API buttons. Players only receive a whispered movement prompt when their token collides with a player accessible destination.'
                    +'</li> '
                    +'</ul>'
                    );
                }
                break;
            case 'definitions':
                var status;
                if(gm==='gm'){
                    _.each(state.PAGENAVIGATOR.statusquery, function(s){
                        if(s===state.PAGENAVIGATOR.dmarker){
                            status = 'the '+makeStatusButton(s, 'no');
                        }
                    });
                    sendChat('','/w "'+who+'" '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'Page Navigator v'+version + ' Defining Destinations:'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +"In order for Page Navigator's token collision functionality to work, you must properly set up the destination tokens. The "
                    +'script looks for the following token properties when determining if a token is a destination or not:'
                    +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Layer</span></b> '+ch('-')+' The token must be on the GM layer.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Marked as destination</span></b> '+ch('-')+' The token must be marked with the correct '
                    +'statusmarker. The script is currently set to look for tokens marked with ' +status + '<br>'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">Token Name</span></b> '+ch('-')+' The name must exactly match the name of whatever page '
                    +'you want it to link to. This includes the player accessible tag you have designated above for player pages.'
                    +'</li> '
                    +'</ul>'
                    );
                }
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
                    case 'update':
                        if(access==='gm'){
                            getPages();
                            sendChat('Page Navigation', '/w gm The stored pages and destination-tokens have been updated');
                        };
                        break;
                    case 'setControl':
                        if(access==='gm'){
                            setControl(args[2]);
                        };
                        break;
                    case 'setAccess':
                        if(access==='gm'){
                            setAccess(args[2]);
                        };
                        break;
                    case 'setDmarker':
                        if(access==='gm'){
                            setDmarker(args[2]);
                        };
                        break;
                    case 'config':
                        if(access==='gm'){
                            outputConfig();
                        }else{
                            sendChat('Page Navigation', '/w "' + who + '"Apologies, but only the GM has access to the script Configuration dialog'
                            +'; you are currently logged in as a player.')
                        };
                        break;
                    case 'help':
                        showHelp(who, args[2], access);
                        break;
                    case 'whole':
                        if(access==='gm'){
                            if(args[2] && args[3]){
                                moveAllPlayers(args[2],args[3]);
                            }else{
                                sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                    +'ERROR CODE: BADID - There is no page associated with that ID. Please use the '+state.PAGENAVIGATOR.configButton+' to check your settings and update stored values.</div>'
                                );
                            }
                        }
                        break;
                    case 'current':
                        if(access==='gm'){
                            if(args[2] && args[3]){
                                moveCurrentParty(args[2], args[3]);
                            } else{
                                sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                    +'ERROR CODE: BADID - There is no page associated with that ID. Please use the '+state.PAGENAVIGATOR.configButton+' to check your settings and update stored values.</div>'
                                );
                            }
                        }
                        break;
                    case 'player':
                        /*Handle teleport for pages commands by additional command syntax in API command button if teleport enabled.*/
                        if(access==='gm'){
                            if(args[2] && _.rest(args, 3)){
                                movePlayer(args[2], args[3], _.rest(args, 4));
                            }else{
                                sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                    +'ERROR CODE: BADID - There is either no page associated with that ID or an invalid player ID was passed to the function. '
                                    +'Please use the '+state.PAGENAVIGATOR.configButton+' to check your settings and update stored values.</div>'
                                );
                            }
                        }
                        break;
                    case 'return':
                        if(access==='gm'){
                            pagesReturn('allow', access, speaker, args[2]);
                        }
                    case 'pages':
                        //Add handling for names(character, token, player?) and character id's. Handle names based on config options (token, 
                        //character, or player chosen in config).
                        //Need to figure out how to handle multi-word names
                        switch(args[2]){
                            case 'whole':
                                if(access==='gm' || state.PAGENAVIGATOR.control==='whole'){
                                    pagesPartyDialog(args[2], access, speaker);
                                }
                                break;
                            case 'current':
                                if(access==='gm' || state.PAGENAVIGATOR.control!=='self'){
                                    pagesPartyDialog(args[2], access, speaker);
                                }
                                break;
                            case 'return':
                                if(access==='gm'){
                                    if(args[3]){
                                        if(args[3]==='whole'){
                                            pagesReturn(undefined, access, speaker, msg.playerid);
                                        }else{
                                            tokens = _.map(_.rest(args,3), function(id){
                                                return findObjs({
                                                    type: 'graphic',
                                                    id: id
                                                });
                                            });
                                            pagesReturn(tokens, access, speaker, msg.playerid);
                                        };
                                    }else if(msg.selected){
                                        tokens = _.map(msg.selected, function(obj){
                                            return findObjs({
                                                type: 'graphic',
                                                id: obj._id
                                            });
                                        });
                                        pagesReturn(tokens, access, speaker, msg.playerid);
                                    };
                                }else if(access === 'player'){
                                    pagesReturn('dna', access, speaker, msg.playerid);
                                };
                                break;
                            case 'player':
                                if(args[3] && (access==='gm' || state.PAGENAVIGATOR.control!=='self')){
                                    pagesPlayerDialog(_.rest(args,3), access, speaker);
                                }else if(!args[3] && (access==='gm' || state.PAGENAVIGATOR.control!=='self') && msg.selected){
                                    tokens = _.map(msg.selected, function(s){
                                        return s._id;
                                    });
                                    pagesPlayerDialog(tokens, access, speaker);
                                }else if(state.PAGENAVIGATOR.control==='self'){
                                    pagesPlayerDialog(msg_orig.playerid, access, speaker);
                                }else{
                                    sendChat('Page Navigation', '/w ' + speaker + ' <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 100%;">'
                                    +'ERROR CODE: SHORTARG - No token or character id detected. You must pass a '
                                    +'targeted/selected token'+ch("'")+'s or a specified character'+ch("'")+'s id in order to utilize <b>!nav '
                                    +'pages player</b>. Please see the help using <b>!nav help</b> if you have further questions.</div>'
                                    );
                                }
                                break;
                        }
                    default:
                        showHelp(who, args[2], access);
                        break;
                }
                break;
            case '!nav-pages':
                var players,
                playerList =[];
                switch(args[1]){
                    case 'whole'://Expected Syntax: !nav-pages whole [speakerid] [destinationid]
                        players = findObjs({type:'player'});
                        _.each(players,function(p){
                            playerList.push(p.id);
                        });
                        movePartyFromDialog(args[1], args[3]);
                        break;
                    case 'current'://Expected Syntax: !nav-pages whole [speakerid] [destinationid]
                        var oop = Campaign().get('playerspecificpages');
                        players = findObjs({type:'player'});
                        _.each(players, function(p){
                            if(!oop[p.id] || oop[p.id]===false){
                                playerList.push(p.id);
                            };
                        });
                        playerList = _.filter
                        movePartyFromDialog(args[1], args[3]);
                        break;
                    case 'player'://Expected Syntax: !nav-pages whole [speakerid] [destinationid] [list of playerid's]
                        playerList = _.rest(args,4);
                        movePlayerFromDialog(args[3],playerList);
                        break;
                }
                if(state.PAGENAVIGATOR.teleport === 'on'){
                    if(args[2]==='undefined'){
                        args[2] = 'gm';
                    };
                    pagesTeleport(args[2],args[3],playerList);
                }
                break;
            case '!nav-teleport':
                createTokenLanding(args[1],_.rest(args,2));
                break;
            case '!nav-config': 
                switch (args[1]){
                    case 'setpmarker':
                        setPageMarker(args[2]);
                        break;
                    case 'teleport':
                        state.PAGENAVIGATOR.teleport = args[2];
                        outputConfig();
                        break;
                    case 'tokens':
                        var rest = _.rest(args, 3);
                        if(args[2] && args[3]){
                            var charObj = _.map(rest,function(id){
                                return getObj('character',id);
                            });
                            setDefaultTokens(args[2],charObj);
                        };
                        break;
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