/*
Easy Experience Script:
This script will create a character called ExperienceThresholds that it uses for most of its functionality. If there is already an
ExperienceThresholds character present, it will not make one; please make sure that you do not have a self-made ExperienceThresholds character 
(highly unlikely I would think ;) )
----------------------------------------------------------------------------------------
Use the following chat commands to utilize this script:
!xp challenge @{token_id/character_id}: Adds a character's npc-xp attribute value to the Session XP tally in the ExperienceThresholds character.
!xp miscXP ###: Adds a manually entered XP value to the Session XP tally in ExperienceThresholds.
!xp session: Divides the Session XP by the number of PCs (defined as characters that have a player-name entry), adds that xp to each PC's
             current experience, and then sets the Session XP max field to the current field before resetting the current field to 0. Will also send
             a chat message congratulating the character on leveling up if this brings that character's current 
             experience above or equal to the experience|max value.
----------------------------------------------------------------------------------------
The script will also automatically set the experience|max value of all PCs based on their current level, and will update this whenever their level
changes. Experience Thresholds can be updated by changing the threshold values (2-20) in ExperienceThresholds.
*/

var EASYEXPERIENCE = EASYEXPERIENCE || (function() {
    'use strict';

    var version = '0.1.04',
        lastUpdate = 1475521172,
        schemaVersion = 1.01,
        ExperienceThresholds,
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
        PCs,

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
    
    checkInstall = function() {
        log('-=> EasyExperience v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if(!_.has(state,'EASYEXPERIENCE') || state.EASYEXPERIENCE.version !== schemaVersion){
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.EASYEXPERIENCE = {
    			version: schemaVersion,
				config: {}
			};
		};
        if(!state.EASYEXPERIENCE.config.PCs){
            setDefaults();
        };
        log(state.EASYEXPERIENCE.config.PCs);
        loadSettings();
        buildTemplates();
        if(!state.EASYEXPERIENCE.configButton){
            state.EASYEXPERIENCE.configButton = makeButton(
                '!xp config', 
                'Options', '#191970', '#fff8dc'
            );
        };
        _.every(state.EASYEXPERIENCE.config.PCs,function(obj){
            if(!obj){
                state.EASYEXPERIENCE = {
                    version: schemaVersion,
				    config: {}
			    };
                setDefaults();
                outputConfig();
                sendChat('EASYEXPERIENCE','/w gm There was a corruption of PC data in the script memory. The script has reinitialized to defaults '
                +'as shown above in the configuration output. Please submit a bug report to the script author, '
                +'<b><u>[Scott C.](https://app.roll20.net/users/459831/scott-c)</u></b>.');
                return false;
            }else{return true};
        });
	},
    
//UTILITY FUNCTIONS: makeButton, buildTemplates, createThresholds
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
    
    createThresholds = function(choice){
        ExperienceThresholds = findObjs({
            type: "character",
            name: "ExperienceThresholds"
        })[0];
        
        if (!ExperienceThresholds) {
            ExperienceThresholds = createObj("character", {
                name: "ExperienceThresholds"
            });
            
            let levels = state.EASYEXPERIENCE.prog[choice];
            _.each(levels, (xp,lvl) => {
                createObj('attribute',{
                    name: lvl,
                    current: xp,
                    characterid: ExperienceThresholds.id
                });
            });
        }else{
            sendChat('Easy Experience', '/w gm There is already a character called ExperienceThresholds in the game. Please delete this old instance '
            +'of the thresholds and reselect your desired experience progression in the'+state.EASYEXPERIENCE.configButton+'menu.');
        };
    },
    
//FUNCTIONS FOR WORKING WITH THE STATE: loadSettings, setDefaults, configPlayers, configProgression, update,
    
    //Set PCs to eligible/ineligible for XP awards
    configPlayers = function(cid, status){
        state.EASYEXPERIENCE.config.PCs[cid].playing = status;
        update();
    },
    
    //Configure the progression system used. Options are - Pathfinder:Slow, Medium, Fast; PFS Standard; D&D 5e
    configProgression = function(choice){
        state.EASYEXPERIENCE.prog.selected = choice;
        createThresholds(choice);
        outputConfig();
    },
    
    configXPAttr = function(choice){
        state.EASYEXPERIENCE.xpattr = choice;
        update();
    },
    
    //Update all the list of character ids for all PCs, active PCs, and MIA PCs
    update = function(){
        var characters = playerCharacters(),
        tempPCs = {},
        current = state.EASYEXPERIENCE.config.PCs;
        _.each(current, function(obj){
        });
        _.each(characters, function(obj){
            if(!state.EASYEXPERIENCE.config.PCs[obj.cid]){
                tempPCs[obj.cid] = {
                    id: obj.cid,
                    playing: 'active'
                };
            }else{
                tempPCs[obj.cid] = {
                    id: obj.cid,
                    playing: state.EASYEXPERIENCE.config.PCs[obj.cid].playing
                };
            }
        });
        state.EASYEXPERIENCE.config.PCs = tempPCs;
        loadSettings();
        outputConfig();
    },
    
    //Load the character ids stored in the state to an array of full roll20 character objects
    loadSettings = function(){
        PCs = _.map(state.EASYEXPERIENCE.config.PCs, function(obj){
            return getObj('character', obj.id);
        });
    },
    
    //If config.PCs or config.prog in the state is not defined, create them using predefined values
    setDefaults = function(){
        var tempAttr,
        count=0,
        cid;
        tempAttr = playerCharacters();
        if(!state.EASYEXPERIENCE.config.PCs){
            state.EASYEXPERIENCE.config.PCs = {};
            _.each(tempAttr, function(n){
                state.EASYEXPERIENCE.config.PCs[n.cid] = {
                    id: n.cid,
                    playing: 'active'
                };
            });
        };
        if(!state.EASYEXPERIENCE.xpattr){
            state.EASYEXPERIENCE.xpattr = 'experience';
        }
        if(!state.EASYEXPERIENCE.prog){
            state.EASYEXPERIENCE.prog = {};
            state.EASYEXPERIENCE.prog.selected = 'pfmedium';
            state.EASYEXPERIENCE.prog.pfmedium ={
                "Session XP": 0,
                "2": 2000,
                "3": 5000,
                "4": 9000,
                "5": 15000,
                "6": 23000,
                "7": 35000,
                "8": 51000,
                "9": 75000,
                "10": 105000,
                "11": 155000,
                "12": 220000,
                "13": 315000,
                "14": 445000,
                "15": 635000,
                "16": 890000,
                "17": 1300000,
                "18": 1800000,
                "19": 2550000,
                "20": 3600000
            };
            state.EASYEXPERIENCE.prog.pfslow ={
                "Session XP": 0,
                "2": 3000,
                "3": 7500,
                "4": 14000,
                "5": 23000,
                "6": 35000,
                "7": 53000,
                "8": 77000,
                "9": 115000,
                "10": 160000,
                "11": 235000,
                "12": 330000,
                "13": 475000,
                "14": 665000,
                "15": 955000,
                "16": 1350000,
                "17": 1900000,
                "18": 2700000,
                "19": 3850000,
                "20": 5350000
            };
            state.EASYEXPERIENCE.prog.pffast ={
                "Session XP": 0,
                "2": 1300,
                "3": 3300,
                "4": 6000,
                "5": 10000,
                "6": 15000,
                "7": 23000,
                "8": 34000,
                "9": 50000,
                "10": 71000,
                "11": 105000,
                "12": 145000,
                "13": 210000,
                "14": 295000,
                "15": 425000,
                "16": 600000,
                "17": 850000,
                "18": 1200000,
                "19": 1700000,
                "20": 2400000
            };
            state.EASYEXPERIENCE.prog.fifth ={
                "Session XP": 0,
                "2": 300,
                "3": 900,
                "4": 2700,
                "5": 6500,
                "6": 14000,
                "7": 23000,
                "8": 34000,
                "9": 48000,
                "10": 64000,
                "11": 85000,
                "12": 100000,
                "13": 120000,
                "14": 140000,
                "15": 165000,
                "16": 195000,
                "17": 225000,
                "18": 265000,
                "19": 305000,
                "20": 355000
            };
            state.EASYEXPERIENCE.prog.pfs ={
                "Session XP": 0,
                "2": 3,
                "3": 6,
                "4": 9,
                "5": 12,
                "6": 15,
                "7": 18,
                "8": 21,
                "9": 24,
                "10": 27,
                "11": 30,
                "12": 33,
                "13": 36,
                "14": 39,
                "15": 42,
                "16": 45,
                "17": 48,
                "18": 51,
                "19": 54,
                "20": 57
            };
        };
    },
    
//FUNCTIONS FOR DETERMINING PLAYERS AND THRESHOLDS: playerCharacters, getThresholds, createThresholds
    
    playerCharacters = function() {
        /* start the chain with all the attribute objects named 'player-name' */
        return _.chain(filterObjs((o) => {
            return (o.get('type')==='attribute' && o.get('name')==='player-name' && o.get('current').length>0);
        }))
        //.tap((o)=>{log('chain started '+o.length);})
        /* IN: Array of Attribute Objects */
        /* extract the characterid from each */
        .reduce((m,o)=>{
            let obj={};
            obj.cid=o.get('characterid');
            obj['player-name']=o;
            m.push(obj);
            return m;
        },[])
        //.tap((o)=>{log('after .reduce '+ o.length);})
        /* IN: Array of Objects with 
         * Character ID in property cid 
         * attribute in [attributeName]
        */
        /* add characters to the objects */
        .map((o)=>{
            o.char=getObj('character',o.cid);
            return o;
        })
        //.tap((o)=>{log('after character added '+o.length);})

        /* IN: Array of Objects with 
        * Character ID in property cid 
        * attribute in [attributeName]
        * character in property char
        */
        /* remove any entries that didn't have Characters */
        .reject( (o)=> {return _.isUndefined(o.char);} )
        //.tap((o)=>{log('after .reject '+o.length);})
        
        /*IN: Array of Objects cleaned of undefined characters
        * with character ID's, 'player-name' attribute in ['player-name]
        * and character in property char
        ****
        * add the experience attribute to a property called xp for all characters*/
        
        .map( (o)=>{
            o.xp = findObjs({
            type: 'attribute',
            name: state.EASYEXPERIENCE.xpattr,
            characterid: o.cid
            })[0];
            return o;
        })
        
        /* IN: Array of Character Objects */
        /* Unwrap Chain and return the array */
        .value();
    },
    
    getThresholds = function(){
        return _.chain(filterObjs((o) => {
            return (o.get('type')==='attribute' && o.get('name')==='Session XP');
        }))
        
        .reduce((m,o)=>{
            let obj={};
            obj.cid=o.get('characterid');
            obj['Session XP']=o;
            m.push(obj);
            return m;
        },[])
        
        .map((o)=>{
            let attrs=filterObjs( (a)=>{
                return a.get('type')==='attribute' && a.get('characterid')===o.cid &&
                _.contains(['2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20'],a.get('name'));
            });
            o.attrs=o.attrs||{};
                _.each(attrs, (a)=>{
                o.attrs[a.get('name')]=a;
            });
            return o;
        })
        
        .value();
    },
    
//RECORDING OR APPLYING XP: applyXP, recordXP, characterXP, levelUP
    
    applyXP = function(){
        var activePCs = _.map(PCs, function(obj){
                if(state.EASYEXPERIENCE.config.PCs[obj.id].playing === 'active'){return obj}
            }),
            thresholds = getThresholds(),
            numPCs,
            sessionXP,
            errors,
            xp,
            eachTrack = 0,
            nullXPMsg = '';
            activePCs = _.reject(activePCs, function(obj){
                return _.isUndefined(obj)
            });
        sessionXP = parseInt(thresholds[0]['Session XP'].get('current'));
        if(sessionXP>0){
            numPCs = parseInt(activePCs.length);
            errors = 0;
            _.each(activePCs, function(obj){
                xp = findObjs({
                    type: 'attribute',
                    name: state.EASYEXPERIENCE.xpattr,
                    characterid: obj.id
                });
                if(!xp || xp.length === 0){
                    nullXPMsg += obj.get('name') +', '
                    errors++;
                }
            });
            if(errors>0){
                sendChat('EasyExperience Script', "/w gm Error MSG: Character(s) <b>" + nullXPMsg + "</b> does not have an "
                    +"experience attribute, please set that character(s)'s current and max experience fields to some value (even if it is 0). "
                    +"No experience was awarded to any character.");
                return
            }
            _.each(activePCs, function(obj){
                var level = findObjs({
                    type: 'attribute',
                    name: 'level',
                    characterid: obj.id
                })[0];
                xp = findObjs({
                    type: 'attribute',
                    name: state.EASYEXPERIENCE.xpattr,
                    characterid: obj.id
                });
                if(parseInt(xp[0].get('max'))===0 || !xp[0].get('max')){
                    levelUP(level);
                }
                xp[0].set('current', Math.floor(parseInt(xp[0].get('current')) + (sessionXP/numPCs)));
                if(parseInt(xp[0].get('current'))>=parseInt(xp[0].get('max'))){
                    sendChat('Congratulations! ' + obj.get('name'), 'You have leveled up!');
                }
            });
            sendChat('EasyExperience Script', 'The GM has ended the session. All players have been awarded ' + (sessionXP/numPCs) + ' XP.')
            thresholds[0]['Session XP'].set('max', thresholds[0]['Session XP'].get('current'));
            thresholds[0]['Session XP'].set('current', 0);
        }else{
            sendChat('Experience Tracker', '/w gm There is currently no experience in the Session XP attribute of the tracker. No XP was applied '
            +'and your previous Session XP was not overwritten.');
            return;
        }
    },
    
    recordXP = function(xpAward){
        var thresholds=getThresholds(),
            currXP;
        currXP=parseInt(thresholds[0]['Session XP'].get('current'));
        thresholds[0]['Session XP'].set('current', currXP + xpAward);
        sendChat('EasyExperience Script', '/w gm Status Update: ' + xpAward + ' XP was added to the Session XP tally. There is now ' 
            + (currXP + xpAward) + ' XP recorded in the tally.'
        );
    },
    
    characterXP = function(chr, award){
        var numChr = chr.length,
        currXP;
        _.each(chr, function(obj){
            currXP = findObjs({
                type: 'attribute',
                name: state.EASYEXPERIENCE.xpattr,
                characterid: obj.id
            })[0];
            log(currXP);
            if(currXP){
                currXP.set('current', Math.floor(parseInt(currXP.get('current')) + (award/numChr)));
                if(parseInt(currXP.get('current'))>=parseInt(currXP.get('max'))){
                    sendChat('Congratulations! ' + obj.get('name'), ' You have leveled up!');
                }
            }
        });
    },
    
    levelUP = function(level){
        var thresholds = getThresholds(),
        currXP = findObjs({
            type: 'attribute',
            name: state.EASYEXPERIENCE.xpattr,
            characterid: level.get('characterid')
        }),
        character = getObj('character', level.get('characterid')),
        nextLevel;
        if(level.get('current')<20){
            if(level.get('current')>0){
                if(currXP[0]){
                    nextLevel = parseInt(level.get('current')) + 1;
                    currXP[0].set('max', thresholds[0].attrs[nextLevel].get('current'));
                    return
                }
                sendChat('EasyExperience', "/w gm The character sheet for <b>" + character.get('name') + "</b> has not generated an experience attribute yet, please ensure the current xp on all characters is set to something (even if it is 0)");
                return
            }
            sendChat('EasyExperience', "/w gm <b>" + character.get('name') + "'s</b> level has been set to 0, please raise that character's level to a valid level (at least 1)");
            return
        }
        sendChat('EasyExperience', "/w gm <b>" + character.get('name') + "'s</b> level has been set to 20, there are no experience thresholds defined for epic level play and the EasyExperience script can no longer handle keeping track of your experience thresholds. The script can still track experience gains without a problem. If you would like to have thresholds added, please contact the author: Scott C. via Roll20");
        return
    },
    
//DIALOG GENERATION: outputConfig and showHelp
    
    outputConfig = function(){//allows the gm to set experience thresholds to the slow, medium, or fast pathfinder progression; set players to active or inactive
        var playerButton,
        progressButton = makeButton(
            '!xp-config progression ?{What experience progression would you like to use?|Pathfinder Slow, pfslow|Pathfinder Medium, '
            +'pfmedium|Pathfinder Fast, pffast|Pathfinder Society, pfs|D&D 5e, fifth}', 
            state.EASYEXPERIENCE.prog.selected, '#CDAE88', 'black'
        ),
        playerMsg = '',
        playerButton,
        updateButton = makeButton(
                    '!xp-config addplayer', 
                    'Update Players', '#CDAE88', 'black'
        ),
        xpButton = makeButton(
                    '!xp-config attribute ?{Sheet XP attribute|'+state.EASYEXPERIENCE.xpattr+'}', state.EASYEXPERIENCE.xpattr, '#CDAE88', 'black'
        );
        _.each(PCs,function(obj){
            if(state.EASYEXPERIENCE.config.PCs[obj.id].playing === 'active'){
                playerButton = makeButton(
                    '!xp-config player '+obj.id+' MIA', 
                    'Active', '#228b22'
                );
            }else{
                playerButton = makeButton(
                    '!xp-config player '+obj.id+' active', 
                    'MIA', '#d3d3d3'
                );
            }
            playerMsg+= obj.get('name') +'<div style="float:right;">'+playerButton+'</div><br><br>'
        });
        sendChat('','/w gm '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'EasyExperience v'+version+'<b> Options</b>'
                    +'</div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'XP Progression:'
                    +'<div style="float:right;">'
                    +progressButton+'</div><br><br><br></div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'Sheet XP attribute:'
                    +'<div style="float:right;">'
                    +xpButton+'</div><br><br><br></div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'<p>Set PCs to active or MIA:</p>'
                    +playerMsg+'</div>'
                    +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
                    +'Update players in game'
                    +'<div style="float:right;">'
                    +updateButton+'</div><br><br><br>'
                    +'</div>'
                    +'</div>'
                    +'</div>'
        );
    },
    
    showHelp = function(){//displays the help menu
        sendChat('','/w gm '
            +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
            +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
            +'EasyExperience v'+version
            +'</div>'
            +'<div style="padding-left:10px;margin-bottom:3px;">'
            +'<p>Make awarding XP simple.</p>'
            +'<div style="padding-left: 10px;padding-right:20px">'
            +'<p><b>PC vs. NPC:</b> The script determines if a character is a PC or an NPC based on the value of the character'+ch("'")+'s <b>player-name</b> '
            +'attribute. If the attribute is empty, it is an NPC. If it has any value, it is a PC.'
            +'<p>Use <b>!xp</b> followed by one of these commands to call the script:</p></div>'
            +'<ul>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">help</span></b> '+ch('-')+' Shows the Help screen'
            +'</li>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">challenge</span></b> '+ch('-')+' Add an XP amount to the session tally. This can be a typed in '
            +'number or passed via '+ch('@')+ch('{')+'target/selected|npc-xp}. You can also follow this amount with the number of times you would like it added.'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'e.g. !xp challenge '+ch('@')+ch('{')+'target|npc-xp} 5'
            +'</li></ul>'
            +'If you would like this xp to only be awarded to a specific character(s); simply add the character(s)'+ch("'")+'s ids to the end. In '
            +'this case you must specify a multiplication value.'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'e.g. !xp challenge '+ch('@')+ch('{')+'target|npc-xp'+ch('}')+' 1 '+ch('@')+ch('{')+'character1|character_id'+ch('}')+ch('}') 
            +ch('@')+ch('{')+'character1|character_id'+ch('}')+' ...'
            +'</li></ul>'
            +'</li>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">session</span></b> '+ch('-')+' Divides the Session xp total by the number of PCs and applies that xp to all PCs.'
            +'</li>'
            +'</li>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">config</span></b> '+ch('-')+' Select your Pathfinder experience progression (fast, medium, slow). '
            +'If you use a different progression, enter the level threshold values into the ExperienceThresholds character sheet.'
            +'<p>You can also set PCs to active or inactive for xp awards</p>'
            +'</li>'
            +'</ul>'
            +'</div>'
            +'</div>'
        );
    },
    
    //respond to chat input
    
    HandleInput = function(msg_orig) {
		var msg = _.clone(msg_orig),
			args,
            attr,
            amount,
            chr,
            token,
            text='',
            totamount;

        if (msg.type !== 'api' || !playerIsGM(msg.playerid)){
                return;
        }

		if(_.has(msg,'inlinerolls')){//calculates inline rolls
			msg.content = _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']=v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
		}
        
		args = msg.content.split(/\s+/);//splits the message contents into discrete arguments
		switch(args[0]) {
            case '!xp':
					switch(args[1]) {
                        case 'reset':
                            state.EASYEXPERIENCE=null;
                            state.EASYEXPERIENCE = {
                                version: schemaVersion,
                                config: {}
                            };
                            setDefaults();
                            outputConfig();
                            break;
                        case 'config':
                            outputConfig();
                            break;
                        case 'help':
                            showHelp();
                            break;
						case 'session': 
                            applyXP();
                            break;
						case 'challenge':
                            amount = parseInt(args[2]);
                            if(amount){
                                if(args[3]){
                                    totamount = parseInt(amount)*parseInt(args[3]);
                                    if(args[4]){
                                        chr = _.map(_.rest(args, 4),function(c){
                                            return getObj('character', c) || getObj('character', getObj('graphic',c).get('represents'));
                                        });
                                        characterXP(chr, totamount);
                                    }else{
                                        recordXP(totamount);
                                    }
                                }else{
                                    recordXP(amount);
                                }
                            }
                            break;
                        default:
                            showHelp();
					}
                break;
            case '!xp-config':
                switch(args[1]){
                    case 'attribute':
                        configXPAttr(args[2]);
                        break;
                    case 'addplayer':
                        update();
                        break;
                    case 'player':
                        configPlayers(args[2], args[3]);
                        break;
                    case 'progression':
                        if(args[2]!=='custom'){
                            configProgression(args[2]);
                        }else{
                            customProgression();
                        }
                        break;
                    case 'custom':
                        customProgression(_.rest(args,3));
                        break;
                }
                break;
		}
	},
    
    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
        on('change:attribute:current',(a,p)=>{
            if(a.get('name') === 'level'){
                levelUP(a);
            }
        });
	};
    
    return {
        CheckInstall: checkInstall,
    	RegisterEventHandlers: RegisterEventHandlers
	};
}());


on("ready",function(){
    'use strict';
    
    EASYEXPERIENCE.CheckInstall();
    EASYEXPERIENCE.RegisterEventHandlers();
});
