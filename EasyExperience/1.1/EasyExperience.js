/*
New Easy Experience Build:
Determine PCs via:
    Controlled by a player
    Settings Config menu: - done (except for pet)
        Active
        MIA
        Pet - Maybe
            Link to Master Char via level formula (e.g. level, level-1, or level/2) - Maybe/maybe not

Continue using Thresholds character for storing of session xp and thresholds
    Add custom XP track capability - done
        probably simply dynamic handling of number of levels on thresholds character, character created with custom number of levels.
    Add handling for modifying thresholds character instead of requring manual deletion - done

Discontinue use of State for storing progressions, simply load at creation. - done

Add handling for undefined, null defined, or empty experience/level attributes
*/

var EASYEXPERIENCE = EASYEXPERIENCE || (function() {
    'use strict';

    var version = '1.1',
        lastUpdate = 1475876497,
        schemaVersion = 1.1,
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
        PCs = [],

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
    
    checkInstall = function() {
        var sFail;
        log('-=> EasyExperience v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if(!_.has(state,'EASYEXPERIENCE') || state.EASYEXPERIENCE.version !== schemaVersion){
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.EASYEXPERIENCE = {
        		version: schemaVersion,
				config: {}
			};
		};
        setDefaults();
        sFail = stateCheck();
        loadSettings();
        buildTemplates();
        if(sFail){
            outputConfig();
        };
        if(!state.EASYEXPERIENCE.configButton){
            state.EASYEXPERIENCE.configButton = makeButton(
                '!xp config', 
                'Options', '#191970', '#fff8dc'
            );
        };
	},
    
//UTILITY FUNCTIONS: makeButton, buildTemplates, createThresholds, stateCheck
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
    //creates the ExperienceThresholds character that holds the xp thresholds for each level as well as the session xp 
    createThresholds = function(choice, customNum, customStart){
        ExperienceThresholds = findObjs({
            type: "character",
            name: "ExperienceThresholds"
        })[0];
        
        if (!ExperienceThresholds) {
            ExperienceThresholds = createObj("character", {
                name: "ExperienceThresholds"
            });
            createObj('attribute',{
                name: 'Session XP',
                current: 0,
                characterid: ExperienceThresholds.id
            });
            
            let levels = progressions(choice, customNum, customStart);
            _.each(levels, (xp,lvl) => {
                createObj('attribute',{
                    name: lvl,
                    current: xp,
                    characterid: ExperienceThresholds.id
                });
            });
        }else{
            let currLevels = findObjs({
                type: 'attribute',
                characterid: ExperienceThresholds.id
            });
            _.each(currLevels,(attr)=>{
                if(attr.get('name')!=='Session XP'){
                    attr.remove();
                };
            });
            let levels = progressions(choice, customNum, customStart);
            log(levels);
            _.each(levels, (xp,lvl) => {
                createObj('attribute',{
                    name: lvl,
                    current: xp,
                    characterid: ExperienceThresholds.id
                });
            });
        };
    },
    
    stateCheck = function(){
        var fail = false;
        _.every(state.EASYEXPERIENCE.config.PCs,function(obj){
            if(!obj){
                state.EASYEXPERIENCE = {
                    version: schemaVersion,
                    config: {}   
                };
                setDefaults();
                loadSettings();
                outputConfig();
                sendChat('EASYEXPERIENCE','/w gm There was a corruption of PC data in the script memory. The script has reinitialized to defaults '
                    +'as shown below in the configuration output. Please submit a bug report to the script author, '
                    +'<b><u>[Scott C.](https://app.roll20.net/users/459831/scott-c)</u></b>.'//,null,{noarchive:true}
                );
                fail = true;
                return false;
            }else{return true};
        });
        return fail;
    },

//Setting The XP tracks and PCs
    setDefaults = function(){
        var tempAttr,
        count=0,
        cid;
        if(!state.EASYEXPERIENCE.config.PCs){
            tempAttr = playerCharacters();
            state.EASYEXPERIENCE.config.PCs = {};
            _.each(tempAttr, function(n){
                state.EASYEXPERIENCE.config.PCs[n] = {
                    id: n,
                    playing: 'active'
                };
            });
        };
        if(!state.EASYEXPERIENCE.maxLvl){
            state.EASYEXPERIENCE.maxLvl = 20;
        };
        if(!state.EASYEXPERIENCE.xpattr){
            state.EASYEXPERIENCE.xpattr = 'experience';
        };
        if(!state.EASYEXPERIENCE.lvlattr){
            state.EASYEXPERIENCE.lvlattr = 'level';
        };
        if(!state.EASYEXPERIENCE.prog){
            state.EASYEXPERIENCE.prog={};
            state.EASYEXPERIENCE.prog.selected = 'Not setup yet';
        };
    },
    
    //Determines what characters are controlled by players (including the GM, but not those only controlled by all) and returns their IDs
    playerCharacters = function(){
        var control,
        charIDs = [];
        filterObjs((o)=> {
            if(o.get('controlledby') && o.get('type')==='character'){
                _.each(o.get('controlledby').split(','),(id) => {
                    if(id !== 'all'){
                        charIDs.push(o.id);
                    };
                });
            };
        });
        return charIDs;
    },
        
    progressions = function(choice, customNum, customStart){
        switch(choice){
            case 'pfslow':
                return {
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
                break;
            case 'pfmedium':
                return {
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
                break;
            case 'pffast':
                return {
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
                break;
            case 'pfs':
                return {
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
                break;
            case 'fifth':
                return {
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
                break;
            case 'custom':
                var customThresh = {};
                customStart = parseInt(customStart)+ 1;
                for(customStart; customStart<=customNum;customStart++){
                    customThresh[parseInt(customStart)]='XP';
                };
                return customThresh;
                break;
            default:
                sendChat('EasyExperience ERROR:','/w gm An attempt was made to define a new XP progression, however incorrect arguments were passed.'
                    +'If you received this error after trying to manually enter commands to set the script up, please see the help menu via the <b>!xp '
                    +'help</b> command and use the configuration screen via <b>!xp config<b> to configure the script. If you have received this error '
                    +'after clicking on a script menu button, and completely filling out any popup text entry fields, please submit an error report to '
                    +'the script author, <b><u>[Scott C.](https://app.roll20.net/users/459831/scott-c)</u></b>.'//,null,{noarchive:true}
                );
                return null;
                break;
        }
    },
    
//FUNCTIONS FOR WORKING WITH THE STATE: loadSettings, setDefaults, configPlayers, configProgression, update,
    
    //Set PCs to eligible/ineligible for XP awards
    configPlayers = function(cid, status){
        state.EASYEXPERIENCE.config.PCs[cid].playing = status;
        update();
    },
    
    //Configure the progression system used. Options are - Pathfinder:Slow, Medium, Fast; PFS Standard; D&D 5e
    configProgression = function(choice, customNum, customStart){
        state.EASYEXPERIENCE.prog.selected = choice;
        state.EASYEXPERIENCE.maxLvl = customNum;
        createThresholds(choice, customNum, customStart);
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
        _.each(characters, function(id){
            if(!state.EASYEXPERIENCE.config.PCs[id]){
                tempPCs[id] = {
                    id: id,
                    playing: 'active'
                };
            }else{
                tempPCs[id] = {
                    id: id,
                    playing: state.EASYEXPERIENCE.config.PCs[id].playing
                };
            }
        });
        state.EASYEXPERIENCE.config.PCs = tempPCs;
        loadSettings();
        outputConfig();
    },
    
    //load settings from the state into fully realized roll20 objects.
    loadSettings = function(){
        var character,
        error = false;
        PCs = [];
        _.each(state.EASYEXPERIENCE.config.PCs, function(obj){
            character = getObj('character', obj.id);
            if (character){
                PCs.push(character);
            }else{error = true};
        });
        if(error === true){
            sendChat('EasyExperience Notice:',"/w gm At least one of the stored characters for this campaign has been deleted since the script's list of PCs was "
                +"last updated. The script has passed over this legacy character, but you should update the script's list of PCs via the config "
                +"menu using the <b>!xp config</b> command to avoid potential errors."//,null,{noarchive:true}
            );
        }
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
        if(sessionXP!==0){
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
                    name: state.EASYEXPERIENCE.lvlattr,
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
                if(!xp[0].get('current')){
                    xp[0].set('current',(sessionXP/numPCs));
                }else{
                    xp[0].set('current', Math.floor(parseInt(xp[0].get('current')) + (sessionXP/numPCs)));
                }
                if(parseInt(xp[0].get('current'))>=parseInt(xp[0].get('max'))){
                    sendChat('Congratulations! ' + obj.get('name'), 'You have leveled up!');
                }
            });
            sendChat('EasyExperience Script', 'The GM has ended the session. All players have been awarded ' + (sessionXP/numPCs) + ' XP.');
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
        if(level.get('current')<state.EASYEXPERIENCE.maxLvl){
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

//Config, Help, and Input handling:

    outputConfig = function(){//allows the gm to set experience thresholds to the slow, medium, or fast pathfinder progression; set players to active or inactive
        var playerButton,
        progressButton = makeButton(
            '!xp-config progression ?{What experience progression would you like to use?|Pathfinder Slow, pfslow|Pathfinder Medium, '
            +'pfmedium|Pathfinder Fast, pffast|Pathfinder Society, pfs|D&D 5e, fifth|Custom, custom ?{Please enter the number of levels your system '
            +'uses'+HE(HE('|'))+HE(HE('}'))+' ?{What level do characters in your system start at'+HE(HE('|'))+'1'+HE(HE('}'))+'} ', 
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
        ),
        levelButton = makeButton(
            '!xp-config level ?{Sheet level attribute|'+state.EASYEXPERIENCE.lvlattr+'}', state.EASYEXPERIENCE.lvlattr, '#CDAE88', 'black'
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
            +'Sheet level attribute:'
            +'<div style="float:right;">'
            +levelButton+'</div><br><br><br></div>'
            +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
            +'<p>Set PCs to active or MIA:</p>'
            +playerMsg+'</div>'
            +'<div style="border: 1px solid #ccc; border-radius: .2em; background-color: white; margin: 0 1em; padding: .1em .3em;">'
            +'Update players in game'
            +'<div style="float:right;">'
            +updateButton+'</div><br><br><br>'
            +'</div>'
            +'</div>'
            +'</div>'//,null,{noarchive:true}
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
            +'<p><b>PC vs. NPC:</b> The script determines if a character is a PC or an NPC based on whether or not it is controlled by a specific player. '
            +'Characters with no control, or only controlled by All are ignored.'
            +'<p>Use <b>!xp</b> followed by one of these commands to call the script:</p></div>'
            +'<ul>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">help</span></b> '+ch('-')+' Shows the Help screen'
            +'</li>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">challenge</span></b> '+ch('-')+' Add an XP amount to the session tally. This can be a typed in '
            +'number (positive or negative) or passed via '+ch('@')+ch('{')+'target/selected|npc-xp}. You can also follow this amount with the number of times '
            +'you would like it added.'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'e.g. !xp challenge '+ch('@')+ch('{')+'target|npc-xp} 5'
            +'</li></ul>'
            +'If you would like this xp to only be awarded to a specific character(s); simply add the character(s)'+ch("'")+'s ids to the end. In '
            +'this case you must specify a multiplication value.'
            +'<ul><li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'e.g. !xp challenge '+ch('@')+ch('{')+'target|npc-xp'+ch('}')+' 1 '+ch('@')+ch('{')+'character1|character_id'+ch('}')+' ' 
            +ch('@')+ch('{')+'character2|character_id'+ch('}')+' ...'
            +'</li></ul>'
            +'</li>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">session</span></b> '+ch('-')+' Divides the Session xp total by the number of PCs and applies that xp to all PCs.'
            +'</li>'
            +'</li>'
            +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
            +'<b><span style="font-family: serif;">config</span></b> '+ch('-')+' Select your experience progression system. Pathfinder slow, medium, fast, and '
            +'society play, and D&D 5e progressions are built-in options. You may also create a custom progression system by selecting the number of levels, '
            +'starting level, and manually entering the xp thresholds in the ExperienceThresholds character generated by the script. '
            +'<p>You can also set PCs to active or inactive for xp awards</p>'
            +'</li>'
            +'</ul>'
            +'</div>'
            +'</div>'//,null,{noarchive:true}
        );
    },
    
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
        };
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
                    case 'level':
                        state.EASYEXPERIENCE.lvlattr = args[2];
                        break;
                    case 'progression':
                        if(args[2]){
                            configProgression(args[2], args[3], args[4]);
                        };
                        break;
                }
                break;
		}
	},
    
    RegisterEventHandlers = function() {
        on('chat:message', HandleInput);
        on('change:attribute:current',(a,p)=>{
            if(a.get('name') === state.EASYEXPERIENCE.lvlattr){
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