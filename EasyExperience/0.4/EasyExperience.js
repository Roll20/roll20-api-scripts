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

    var version = '0.0.5',
        lastUpdate = 1464190441,
        schemaVersion = 0.5,
        ExperienceThresholds,

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
        log('-=> Character Experience v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');
        if( ! _.has(state,'EASYEXPERIENCE') || state.EASYEXPERIENCE.version !== schemaVersion) {
            log('  > Updating Schema to v'+schemaVersion+' <');
            state.EASYEXPERIENCE = {
    			version: schemaVersion,
				config: {
				},
				policies: {
					global: {
						recoveryUpdatesMaximum: false
					},
					byAttribute: {
					},
					byCharacter: {
					}
				}
			};
		}
        createThresholds();
	},
    
    playerCharacters = function() {
        /* start the chain with all the attribute objects named 'player-name' */
        return _.chain(filterObjs((o) => {
            return (o.get('type')==='attribute' && o.get('name')==='player-name');
        }))
        //.tap((o)=>{log(o);})
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
            name: 'experience',
            characterid: o.cid
            })[0];
            return o;
        })
        //.tap((o)=>{log('after last .map '+o.length);})
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
    
    applyXP = function(){
        var pcs = playerCharacters(),
            thresholds = getThresholds(),
            numPCs,
            sessionXP,
            errors,
            eachTrack = 0;
        sessionXP = thresholds[0]['Session XP'].get('current');
        log(sessionXP);
        if(sessionXP>0){
            numPCs = pcs.length;
            errors = 0;
            _.each(pcs, function(){
                if(!pcs[eachTrack].xp){
                    sendChat('EasyExperience Script', "/w gm Error MSG: " + pcs[eachTrack]['player-name'].get('current') + "'s character does not have an experience attribute, please set that character's experience to some value (even if it is 0). No experience was rewarded to any character.");
                    errors++;
                }
                eachTrack++
            });
            if(errors>0){
                return
            }
            eachTrack = 0;
            _.each(pcs, function(){
                /*if(pcs[eachTrack].xp.get('max')===0){
                    pcs[eachTrack].set('current', pcs[eachTrack].get())
                }*/
                var level = findObjs({
                    type: 'attribute',
                    name: 'level',
                    characterid: pcs[eachTrack].cid
                })[0];
                if(pcs[eachTrack].xp){
                    if(pcs[eachTrack].xp.get('max')<=pcs[eachTrack].xp.get('current') || !pcs[eachTrack].xp.get('max')){
                        //log(level);
                        levelUP(level);
                    }else{
                        pcs[eachTrack].xp.set('current', pcs[eachTrack].xp.get('current') + (sessionXP/numPCs));
                        if(pcs[eachTrack].xp.get('current')>=pcs[eachTrack].xp.get('max')){
                            sendChat('Congratulations! ' + pcs[eachTrack].char.get('name'), pcs[eachTrack].char.get('name') + ' has leveled up!');
                        }
                    }
                }
                eachTrack++;
            });
            sendChat('EasyExperience Script', 'The GM has ended the session. All players have been awarded ' + (sessionXP/numPCs) + ' XP.')
            thresholds[0]['Session XP'].set('max', thresholds[0]['Session XP'].get('current'));
            thresholds[0]['Session XP'].set('current', 0);
        }else{
            sendChat('Experience Tracker', '/w gm There is currently no experience in the Session XP attribute of the tracker. No XP was applied and your previous Session XP was not overwritten.');
            return;
        }
    },
    
    recordXP = function(xpAward){
        var thresholds=getThresholds(),
            currXP;
        currXP=parseInt(thresholds[0]['Session XP'].get('current'));
        thresholds[0]['Session XP'].set('current', currXP + xpAward);
        sendChat('EasyExperience Script', '/w gm Status Update: ' + xpAward + ' XP was added to the Session XP tally. There is now ' + (currXP + xpAward) + ' XP recorded in the tally.');
    },
    
    HandleInput = function(msg_orig) {
		var msg = _.clone(msg_orig),
			args,attr,amount,chr,token,text='';

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
				if(args.length > 1) {

					switch(args[1]) {
						case 'session': 
                            applyXP();
                            break;
						case 'challenge':
                            chr = getObj('character', args[2]);
            				if( ! chr ) {
		    		    		token = getObj('graphic', args[2]);
			        			if(token) {
						        	chr = getObj('character', token.get('represents'));
						        }
				        	}
					        if(chr) {
                                attr = findObjs({_type: 'attribute', _characterid: chr.id, name: 'npc-xp'})[0];
                                if(args[3]){
                                    amount=parseInt(attr.get('current'))*parseInt(args[3]);
                                }else{
                                    amount=parseInt(attr.get('current'));
                                }
		        			}
				        	
        					if(attr && amount) {
		        				recordXP(amount);
				        	}
                            break;

						case 'miscXP':
                            amount = parseInt(args[2]);
                            if(amount){
                                if(args[3]){
                                    var totamount = parseInt(amount)*parseInt(args[3]);
                                    recordXP(totamount);
                                }
                            }
                            break;
					}
				} else {
					sendChat('Experience', '/w gm Something went wrong');
				}
                break;
		}
	},
    
    levelUP = function(level){
        log(level);
        var thresholds = getThresholds(),
        currXP = findObjs({
            type: 'attribute',
            name: 'experience',
            characterid: level.get('characterid')
        }),
        char = findObjs({
            type:'attribute',
            name: 'player-name',
            characterid: level.get('characterid')
        }),
        nextLevel;
        if(level.get('current')<20){
            if(level.get('current')>0){
                if(currXP[0]){
                    nextLevel = level.get('current') + 1;
                    currXP[0].set('max', thresholds[0].attrs[nextLevel].get('current'));
                    return
                }
                sendChat('EasyExperience', "/w gm The character sheet for " + char[0].get('current') + "'s character has not generated an experience attribute yet, please ensure the current xp on all characters is set to something (even if it is 0)");
                return
            }
            sendChat('EasyExperience', "/w gm " + char[0].get('current') + "'s character level has been set to 0, please raise that character's level to a valid level (at least 1)");
            return
        }
        sendChat('EasyExperience', "/w gm " + char[0].get('current') + "'s character level has been set to 20, there are no experience thresholds defined for epic level play and the EasyExperience script can no longer handle keeping track of your experience thresholds. The script can still track experience gains without a problem. If you would like to have thresholds added, please contact the author: Scott C. via Roll20");
        return
    },
    
    createThresholds = function(){
        ExperienceThresholds = findObjs({
            _type: "character",
            name: "ExperienceThresholds"
        })[0];

        if (!ExperienceThresholds) {
            ExperienceThresholds = createObj("character", {
                name: "ExperienceThresholds"
            });

            let levels = {
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
            _.each(levels, (xp,lvl) => {
                createObj('attribute',{
                    name: lvl,
                    current: xp,
                    characterid: ExperienceThresholds.id
                });
            });
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