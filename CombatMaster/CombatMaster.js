/* 
 * Version 2.09
 * Original By Robin Kuiper
 * Changes in Version 0.3.0 and greater by Victor B
 * Changes in this version and prior versions by The Aaron
 * Discord: Vic#5196
 * Roll20: https://app.roll20.net/users/3135709/victor-b
 * Github: https://github.com/vicberg/CombatMaster
*/
var CombatMaster = CombatMaster || (function() {
    'use strict';

    let round = 1,
	    version = '2.09',
        timerObj,
        intervalHandle,
        debug = true,
        rotationInterval,
        paused = false,
        who = 'gm',
        playerID = null,
        markers = [],
        observers = {
            tokenChange: []
        },
		whisper, handled = [],	
        extensions = {
            StatusInfo: true // This will be set to true automatically if you have StatusInfo
        },
        startImage = '4',
		pauseImage = '5',
        stopImage = '6',
        tagImage = '3',
        noTagImage = 'd',
        deleteImage = '#',
        shuffleImage = ';',
        randomSingleImage = '`',
        randomLoopImage = '?',
        togetherImage = 'J',
        loopImage = 'r',
        sortImage = '1',
        lockImage = ')',
        unlockImage = '(',
        backImage = 'y',
        nextImage = ']',
        prevImage = '[',
        decreaseImage = '<',
        increaseImage = '>',
        timerImage = 't',
        favoriteImage = 'S',
        allConditionsImage = 'G',
        addImage = '&',		
        doneImage = '3',
        showImage = 'v',
        delayImage = '}',
        sortConditionsImage = '0';
        
    //Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
 		title: 'font-size:14px;font-weight:bold;background-color:black;padding:3px;border-top-left-radius:3px;border-top-right-radius:3px',
 		titleText: 'color:white',
 		titleSpacer: 'font-weight: bold; border-bottom: 1px solid black;font-size: 100%;style="float:left;',
 		version:'font-size:10px;',
 		header: 'margin-top:10px;margin-bottom:5px;font-weight:bold;font-style:italic;display:inline-block;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;width:100%',
        textButton: 'background-color:#fff; color: #000; text-align: center; float: right;',
        conditionButton: 'background-color:#fff; color: #000;margin-left:1px;',
 		linkButton: 'background-color:#fff; color: #000; text-align: center;vertical-align:middle',
 		textLabel: 'background-color:#fff;float:left;text-align:center;margin-top:8px',
 		bigButton: 'width:80%;border-radius:5px;text-align:center;margin-left:15px',
        bigButtonLink: 'background-color:#000000; border-radius: 5px; padding: 5px; color: #fff; text-align: center;width:100%',
        wrapBox: ' border: 1px solid #292929; border-radius: 3px;margin-top:3px;margin-bottom:3px',
 		body: 'background-color:#fff',
        list: 'list-style: none;padding:2px',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough',
        background: 'background-color:lightgrey'
    },
    // Styling for the chat responses.
    style = "overflow: hidden; background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    buttonStyle = "background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center; float: right;",
    conditionStyle = "background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;",
    conditionButtonStyle = "text-decoration: underline; background-color: #fff; color: #000; padding: 0",
    listStyle = 'list-style: none; padding: 0; margin: 0;',

    icon_image_positions = {red:"#C91010",blue:"#1076C9",green:"#2FC910",brown:"#C97310",purple:"#9510C9",pink:"#EB75E1",yellow:"#E5EB75",dead:"X",skull:0,sleepy:34,"half-heart":68,"half-haze":102,interdiction:136,snail:170,"lightning-helix":204,spanner:238,"chained-heart":272,"chemical-bolt":306,"death-zone":340,"drink-me":374,"edge-crack":408,"ninja-mask":442,stopwatch:476,"fishing-net":510,overdrive:544,strong:578,fist:612,padlock:646,"three-leaves":680,"fluffy-wing":714,pummeled:748,tread:782,arrowed:816,aura:850,"back-pain":884,"black-flag":918,"bleeding-eye":952,"bolt-shield":986,"broken-heart":1020,cobweb:1054,"broken-shield":1088,"flying-flag":1122,radioactive:1156,trophy:1190,"broken-skull":1224,"frozen-orb":1258,"rolling-bomb":1292,"white-tower":1326,grab:1360,screaming:1394,grenade:1428,"sentry-gun":1462,"all-for-one":1496,"angel-outfit":1530,"archery-target":1564},
    ctMarkers = ['blue', 'brown', 'green', 'pink', 'purple', 'red', 'yellow', '-', 'all-for-one', 'angel-outfit', 'archery-target', 'arrowed', 'aura', 'back-pain', 'black-flag', 'bleeding-eye', 'bolt-shield', 'broken-heart', 'broken-shield', 'broken-skull', 'chained-heart', 'chemical-bolt', 'cobweb', 'dead', 'death-zone', 'drink-me', 'edge-crack', 'fishing-net', 'fist', 'fluffy-wing', 'flying-flag', 'frozen-orb', 'grab', 'grenade', 'half-haze', 'half-heart', 'interdiction', 'lightning-helix', 'ninja-mask', 'overdrive', 'padlock', 'pummeled', 'radioactive', 'rolling-bomb', 'screaming', 'sentry-gun', 'skull', 'sleepy', 'snail', 'spanner',   'stopwatch','strong', 'three-leaves', 'tread', 'trophy', 'white-tower'],
    shaped_conditions = ['blinded', 'charmed', 'deafened', 'frightened', 'grappled', 'incapacitated', 'invisible', 'paralyzed', 'petrified', 'poisoned', 'prone', 'restrained', 'stunned', 'unconscious'],
	
    script_name = 'CombatMaster',
    combatState = 'COMBATMASTER',

    inputHandler = function(msg_orig) {

        if (msg_orig.content.indexOf('!cmaster')!==0){
            return;
        }
        
        log(msg_orig)
        
        var msg = _.clone(msg_orig),args,restrict,player
        
        playerID = msg.playerid
        if (playerIsGM(msg.playerid)) {
              state[combatState].config.gmPlayerID = msg.playerid
              who = 'gm'
        } else {
            who = getObj('player', msg.playerid).get('displayname');
        }

		if(_.has(msg,'inlinerolls')) {//calculates inline rolls
			msg.content = inlineExtract(msg);
		}
		
		//splits the message contents into discrete arguments, special handling for import
	    let cmdDetails = {
	        details: {}
	    }
        
        if (msg.content.indexOf('import') >= 0) {
            cmdDetails.action = 'import'
            msg.content = msg.content.replace('!cmaster ','')
            cmdDetails.details['config'] = msg.content.replace('--import,','')
            commandHandler(cmdDetails,msg,restrict,who,playerID)
        } else {
    		args = msg.content.split(/\s+--/);
    	    if(args[0] === '!cmaster'){
                if(args[1]){
                    _.each(_.rest(args,1),(cmd) =>{
                        cmdDetails = cmdExtract(cmd);
                        if (debug){
                            log(cmdDetails)
                        }
                        commandHandler(cmdDetails,msg,restrict,who,playerID)
                    })    
                }
        	}
        }	
	},  
	
	//Extracts inline rolls
	inlineExtract = function(msg){
	    return _.chain(msg.inlinerolls)
				.reduce(function(m,v,k){
					m['$[['+k+']]']=v.results.total || 0;
					return m;
				},{})
				.reduce(function(m,v,k){
					return m.replace(k,v);
				},msg.content)
				.value();
	},
	
    //Extracts the command details from a command string passed from handleInput	
	cmdExtract = function(cmd){
	    var cmdSep = {
	        details: {}
	    },
	    vars,
	    temp,
	    details;
        log(cmd)
        //special handling of import is required
        
        let values = parseLine(cmd)
        let lookup = values.lookup
        let tokens = values.tokens
        if (debug) {
            log('Lookup:' + lookup)
            log('Tokens:' + tokens)
        }

        //find the action and set the cmdSep Action
	    cmdSep.action = String(tokens).match(/turn|show|config|back|reset|main|remove|add|new|delete|import|export|help/);
        //the ./ is an escape within the URL so the hyperlink works.  Remove it
        cmd.replace('./', '');

        //split additional command actions
	    _.each(String(tokens).replace(cmdSep.action+',','').split(','),(d) => {
            vars=d.match(/(who|next|previous|delay|start|timer|stop|pause|show|all|favorites|setup|conditions|condition|sort|combat|turnorder|accouncements|timer|macro|status|list|export|import|type|key|value|setup|tracker|confirm|direction|duration|message|initiative|config|assigned|type|action|description|target|id|)(?:\:|=)([^,]+)/) || null;
            if(vars) {
                if (vars[2].includes('INDEX')) {
                    let key, result, temp
                    for (key in lookup) {
                        result = lookup[key].replace(/{/g, '')  
                        result = result.replace(/}/g, '') 
                        vars[2] = vars[2].replace('{INDEX:' + key + '}',result)
                    }
                }                        
                temp = (vars[2] === 'true') ? true : (vars[2] === 'false') ? false : vars[2]
                cmdSep.details[vars[1]]=temp;
            } else {
                cmdSep.details[d]=d;
            }
        });

        return cmdSep;
	},	   

    parseLine = function(cmd) {
        let lookup = [];
        let depth = 0;
        let lastc = '';
        let capture = '';
        let line = '';
    
        [...cmd].forEach((c,i,o)=>{
    
            if('{' === lastc && '{' === c) {
                ++depth;
            } 
            if('}' === lastc && '}' === c) {
                --depth;
                if(!depth && capture.length){
                    line+=`INDEX:${lookup.length}`;
                    lookup.push(capture);
                    capture='';
                }
            }
    
            if(depth){
                capture+=c;
            } else {
                line+=c;
            }
    
            lastc = c;
        });
        
        let tokens = line.split(/\s+--/);
        return {
            lookup,
            tokens
        };
    },

	//Processes the commands based on Delay Time (if any)
	commandHandler = function(cmdDetails,msg,restrict,who,playerID){
	    if (debug){
	        log ('Command Handler')
	    }
	    
        if (cmdDetails.action == 'back'){
            if (cmdDetails.details.setup) {
                cmdDetails.action = 'show'
                cmdDetails.details['setup'] = true
            } else if (cmdDetails.details.tracker) {
                cmdDetails.action = 'main'
            } else {
                if (state[combatState].config.previousPage == 'main') {
                    cmdDetails.action = 'main'
                 } else {
	                cmdDetails.action = 'show'
	                cmdDetails.details['conditions'] = true  

                 }
            }           
        }    	        
        if (cmdDetails.action == 'main'){
            sendMainMenu(who)
        }     
        if (cmdDetails.action == 'turn'){
            if (cmdDetails.details.next) {
                nextTurn();
            }
            if (cmdDetails.details.delay) {
                delayTurn();
            }                
            if (cmdDetails.details.previous) {
                previousTurn()
            }      
            if (cmdDetails.details.start) {
                startCombat(msg.selected);
            }        
            if (cmdDetails.details.stop) {
                stopCombat();
            }   
            if (cmdDetails.details.timer == 'pause') {
                pauseTimer();
            }   
            if (cmdDetails.details.timer == 'stop') {
                stopTimer();
            }  
            if (cmdDetails.details.sort) {
                sortTurnorder();
            }    
        }
        if (cmdDetails.action == 'show'){
            if (cmdDetails.details.all) {
                editFavoriteState('all');
            }    
            if (cmdDetails.details.favorites) {
                editFavoriteState('favorites');
            } 
    
            if (cmdDetails.details.setup) {
                sendConfigMenu();
            }    
            if (cmdDetails.details.initiative) {
                sendInitiativeMenu();
            }   
            if (cmdDetails.details.turnorder) {
                sendTurnorderMenu();
            }  
            if (cmdDetails.details.timer) {
                sendTimerMenu();
            }    
            if (cmdDetails.details.announce) {
                sendAnnounceMenu();
            }   
            if (cmdDetails.details.macro) {
                sendMacroMenu();
            }  
            if (cmdDetails.details.status) {
                sendStatusMenu()
            }                   
            if (cmdDetails.details.conditions) {
                sendConditionsMenu()
            }   
            if (cmdDetails.details.export) {
                exportConditions()
            }      
            if (cmdDetails.details.condition) {
                sendConditionMenu(cmdDetails.details.condition)
            }    
            if (cmdDetails.details.assigned) {
                showConditions(msg.selected)
            }      
            if (cmdDetails.details.description) {
                sendConditionToChat(cmdDetails.details.key)
            }              
        }   
        if (cmdDetails.action == 'add') {
            if (cmdDetails.details.target) {
                addTargetsToCondition(msg.selected,cmdDetails.details.id,cmdDetails.details.condition)
            } else if (cmdDetails.details.condition) {
                addCondition(cmdDetails,msg.selected,playerID)
            }
        }
        if (cmdDetails.action == 'remove') {
            if (cmdDetails.details.condition) {
                removeCondition(cmdDetails, msg.selected)
            }            
        }            
        if (cmdDetails.action == 'config'){
            editCombatState(cmdDetails)   
        }    
        if (cmdDetails.action == 'new'){
            if (cmdDetails.details.condition) {
                newCondition(cmdDetails.details.condition)  
            } else if (cmdDetails.details.macro) {
                newSubstitution(cmdDetails)
            }                
        }  
        if (cmdDetails.action == 'delete'){
            if (cmdDetails.details.condition) {
                deleteCondition(cmdDetails.details.condition,cmdDetails.details.confirm)   
            } else if (cmdDetails.details.macro) {
                removeSubstitution(cmdDetails)
            }    
        }      
        if (cmdDetails.action == 'import') {
            importCombatMaster(cmdDetails.details.config)
        }
        if (cmdDetails.action == 'reset') {
			state[combatState] = {};
			setDefaults(true);
			sendMainMenu(who)
        }
        if (cmdDetails.action == 'help') {
			 makeAndSendMenu(buildHelp(),'Combat Master Help','gm');
        }        
	},

//*************************************************************************************************************
//MENUS
//*************************************************************************************************************
    sendMainMenu = function(who) {
        let nextButton          = makeImageButton('!cmaster --turn,next',nextImage,'Next Turn','transparent',18),
            prevButton          = makeImageButton('!cmaster --turn,previous',prevImage,'Previous Turn','transparent',18),
            stopButton          = makeImageButton('!cmaster --turn,stop --main',stopImage,'Stop Combat','transparent',18),
            startButton         = makeImageButton('!cmaster --turn,start --main',startImage,'Start Combat','transparent',18),
            pauseTimerButton    = makeImageButton('!cmaster --turn,timer=pause',pauseImage,'Pause Timer','transparent',18),
            stopTimerButton     = makeImageButton('!cmaster --turn,timer=stop',timerImage,'Stop Timer','transparent',18),
            allConditionsButton = makeImageButton('!cmaster --show,all --main',allConditionsImage,'Show All Conditions','transparent',18),
            favoritesButton     = makeImageButton('!cmaster --show,favorites --main',favoriteImage,'Show Favorites','transparent',18),
            configButton        = makeImageButton('!cmaster --show,setup',backImage,'Show Setup','transparent',18),
            showButton          = makeImageButton('!cmaster --show,assigned',showImage,'Show Conditions','transparent',18),
            sortButton          = makeImageButton('!cmaster --turn,sort',sortImage,'Sort Turnorder','transparent',18),
            listItems           = [],
            titleText           = 'CombatMaster Menu<span style="' + styles.version + '"> (' + version + ')</span>',
            contents, key, condition, conditions, conditionButton, addButton, removeButton, favoriteButton, listContents, rowCount=1;

        if (debug) {
            log('Send Main Menu')
        }

        if (inFight() ) {
            contents = '<div style="background-color:green;width:100%;padding:2px;vertical-align:middle">'+stopButton + prevButton + nextButton + pauseTimerButton + stopTimerButton + showButton + sortButton 
        } else {
            contents = '<div style="background-color:red">'+startButton
        }
        
        if (['favorites',null].includes(state[combatState].config.status.showConditions)){
            contents += allConditionsButton
        } else {
            contents += favoritesButton
        } 

        contents += configButton
        contents += '</div>'
        
        conditions = sortObject(state[combatState].config.conditions)
        
        for (key in conditions) {
            condition       = getConditionByKey(key)
            
            let installed = verifyInstalls(condition.iconType)
            if (!installed) {
                return
            }
            
            conditionButton = makeImageButton('!cmaster --show,condition='+key,backImage,'Edit Condition','transparent',12)
            removeButton    = makeImageButton('!cmaster --remove,condition='+key,deleteImage,'Remove Condition','transparent',12)

            if (condition.override) {
                if (state[combatState].config.status.useMessage) {
                    addButton = makeImageButton('!cmaster --add,condition='+key +',duration=?{Duration|'+condition.duration+'},direction=?{Direction|'+condition.direction + '},message=?{Message}',addImage,'Add Condition','transparent',12)
                } else {  
                    addButton = makeImageButton('!cmaster --add,condition='+key +',duration=?{Duration|'+condition.duration+'},direction=?{Direction|'+condition.direction + '}',addImage,'Add Condition','transparent',12)
                }    
            } else {
                if (state[combatState].config.status.useMessage) {
                    addButton = makeImageButton('!cmaster --add,condition='+key+',duration='+condition.duration+',direction='+condition.direction+',message='+condition.message,addImage,'Add Condition','transparent',12)
                 } else {
                    addButton = makeImageButton('!cmaster --add,condition='+key+',duration='+condition.duration+',direction='+condition.direction,addImage,'Add Condition','transparent',12)
                 }    
            }

            if (condition.favorite) {
                favoriteButton = makeImageButton('!cmaster --config,condition='+key+',key=favorite,value='+!condition.favorite+' --tracker',favoriteImage,'Remove from Favorites','transparent',12)
            } else {
                favoriteButton = makeImageButton('!cmaster --config,condition='+key+',key=favorite,value='+!condition.favorite+' --tracker',allConditionsImage,'Add to Favorites','transparent',12)
            }
            
			if (rowCount == 1) {
                listContents = '<div>'
                rowCount = 2
			} else {
			   listContents = '<div style='+styles.background+'>'
			   rowCount = 1
			}   
            listContents += getDefaultIcon(condition.iconType,condition.icon,'display:inline-block;margin-right:3px')
            listContents += '<span style="vertical-align:middle">'+condition.name+'</span>'
            if (state[combatState].config.status.userChanges && who != 'gm') {
                listContents += '<span style="float:right;vertical-align:middle">'+addButton+removeButton+'</span>'
            } else {
                listContents += '<span style="float:right;vertical-align:middle">'+addButton+removeButton+favoriteButton+conditionButton+'</span>'
            }
            listContents += '</div>'
            
            if (state[combatState].config.status.showConditions == 'favorites') {
                if (condition.favorite) {
                    listItems.push(listContents);
                }    
            } else {
                listItems.push(listContents);
            }
        }

        //send menu 
        state[combatState].config.previousPage = 'main'
        if (who == 'gm') {
            makeAndSendMenu(contents+makeList(listItems),titleText,who);
        } else {
            makeAndSendMenu(makeList(listItems),titleText,who);
        }    
    },
    
    sortObject = function (obj) {
        return Object.keys(obj).sort().reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    },    

    sendConfigMenu = function() {
		let configIntiativeButton       = makeBigButton('Initiative', '!cmaster --show,initiative'),
	     	configTurnorderButton       = makeBigButton('Turnorder', '!cmaster --show,turnorder'),
			configTimerButton           = makeBigButton('Timer', '!cmaster --show,timer'),
			configAnnouncementsButton   = makeBigButton('Announce', '!cmaster --show,announce'),
			configMacroButton           = makeBigButton('Macro & API', '!cmaster --show,macro'),
			configStatusButton          = makeBigButton('Status', '!cmaster --show,status'),
			configConditionButton       = makeBigButton('Conditions', '!cmaster --show,conditions'),
			exportButton                = makeBigButton('Export', '!cmaster --show,export'),
			importButton                = makeBigButton('Import', '!cmaster --import,config=?{Config}'),	
			resetButton                 = makeBigButton('Reset', '!cmaster --reset'),
			backToTrackerButton         = makeBigButton('Back', '!cmaster --back,tracker'),
			titleText                   = 'CombatMaster Setup<span style="' + styles.version + '"> (' + version + ')</span>',
			combatHeaderText            = '<div style="'+styles.header+'">Combat Setup</div>',
			statusHeadersText           = '<div style="'+styles.header+'">Status Setup</div>',
			resetHeaderText             = '<div style="'+styles.header+'">Reset CombatTracker</div>',	
			backToTrackerText           = '<div style="'+styles.header+'">Return</div>',	
			
		 	contents  = combatHeaderText
			contents += configIntiativeButton
			contents += configTurnorderButton			
			contents += configTimerButton
			contents += configAnnouncementsButton
			contents += configMacroButton
			contents += statusHeadersText 
			contents += configStatusButton
			contents += configConditionButton
			contents += exportButton
			contents += importButton
			contents += resetHeaderText
			contents += resetButton
		    contents += backToTrackerText
		    contents += backToTrackerButton

        makeAndSendMenu(contents, titleText, 'gm');
    },

    sendInitiativeMenu = function() {
        let backButton = makeBigButton('Back', '!cmaster --back,setup'),
            listItems = [], 
            initiative=state[combatState].config.initiative;
		
		listItems.push(makeTextButton('Roll Initiative', initiative.rollInitiative, '!cmaster --config,initiative,key=rollInitiative,value=?{Initiative|None,None|CombatMaster,CombatMaster|Group-Init,Group-Init} --show,initiative'))
        listItems.push(makeTextButton('Roll Each Round', initiative.rollEachRound, '!cmaster --config,initiative,key=rollEachRound,value='+!initiative.rollEachRound + ' --show,initiative')) 
        
        if (initiative.rollInitiative == 'CombatMaster') {
            listItems.push(makeTextButton('Initiative Attr', initiative.initiativeAttributes, '!cmaster --config,initiative,key=initiativeAttributes,value=?{Attribute|'+initiative.initiativeAttributes+'} --show,initiative'))
            listItems.push(makeTextButton('Initiative Die', 'd' + initiative.initiativeDie, '!cmaster --config,initiative,key=initiativeDie,value=?{Die (without the d)'+initiative.initiativeDie+'} --show,initiative'))
            listItems.push(makeTextButton('Show Initiative in Chat', initiative.showInitiative, '!cmaster --config,initiative,key=showInitiative,value='+!initiative.showInitiative + ' --show,initiative'))
        }
        
		if (initiative.rollInitiative == 'Group-Init') {	
			listItems.push(makeTextButton('Target Tokens', initiative.apiTargetTokens, '!cmaster --config,initiative,key=apiTargetTokens,value=?{Target Tokens|} --show,initiative'))
            if (!initiative.apiTargetTokens > '') {
                listItems.push('<div>'+initiative.apiTargetTokens+'</div>')
            }
		}

        makeAndSendMenu(makeList(listItems, backButton), 'Initiative Setup', 'gm');
    },

	sendTurnorderMenu = function() {
        let backButton = makeBigButton('Back', '!cmaster --back,setup'),
            listItems = [],
            turnorder = state[combatState].config.turnorder;

        let installed 
        installed = verifyInstalls(turnorder.nextMarkerType)
        if (!installed) {
            return
        }	
        installed = verifyInstalls(turnorder.markerType)
        if (!installed) {
            return
        }        
        
		listItems.push(makeTextButton('Sort Turnorder',turnorder.sortTurnOrder, '!cmaster --config,turnorder,key=sortTurnOrder,value='+!turnorder.sortTurnOrder + ' --show,turnorder'))
        listItems.push(makeTextButton('Center Map on Token', turnorder.centerToken, '!cmaster --config,turnorder,key=centerToken,value='+!turnorder.centerToken + ' --show,turnorder'))
        listItems.push(makeTextButton('Use Marker',turnorder.useMarker, '!cmaster --config,turnorder,key=useMarker,value='+!turnorder.useMarker + ' --show,turnorder'))
    	listItems.push(makeTextButton('Marker Type',turnorder.markerType, '!cmaster --config,turnorder,key=markerType,value=?{Marker Type|External URL,External URL|Token Marker,Token Marker|Token Condition,Token Condition} --show,turnorder'))
        
        if (turnorder.markerType == 'External URL') {
            listItems.push(makeTextButton('Marker', '<img src="'+turnorder.externalMarkerURL+'" width="20px" height="20px" />', '!cmaster --config,turnorder,key=externalMarkerURL,value=?{Image Url} --show,turnorder'))
        }  else if (turnorder.markerType == 'Token Marker')	{
		    listItems.push(makeTextButton('Marker Name',turnorder.tokenMarkerName, '!cmaster --config,turnorder,key=tokenMarkerName,value=?{Marker Name|} --show,turnorder'))
            listItems.push(getDefaultIcon('Token Marker',turnorder.tokenMarkerName))
		}			
		
		listItems.push(makeTextButton('Use Next Marker',turnorder.nextMarkerType, '!cmaster --config,turnorder,key=nextMarkerType,value=?{Next Marker Type|None,None|External URL,External URL|Token Marker,Token Marker|Token Condition,Token Condition} --show,turnorder'))
		
		if (turnorder.nextMarkerType == 'External URL') {	
			 listItems.push(makeTextButton('Next Marker', '<img src="'+turnorder.nextExternalMarkerURL+'" width="20px" height="20px" />', '!cmaster --config,turnorder,key=nextExternalMarkerURL,value=?{Image Url} --show,turnorder'))
		} else if (turnorder.nextMarkerType == 'Token Marker')	{
		    listItems.push(makeTextButton('Next Marker Name',turnorder.nextTokenMarkerName, '!cmaster --config,turnorder,key=nextTokenMarkerName,value=?{Next Marker Name|} --show,turnorder'))
            listItems.push(getDefaultIcon('Token Marker', turnorder.nextTokenMarkerName))
		}	
        
		listItems.push('<div style="margin-top:3px"><i><b>Beginning of Each Round</b></i></div>' )
        listItems.push(makeTextButton('API',turnorder.roundAPI, '!cmaster --config,turnorder,key=roundAPI,value=?{API Command|} --show,turnorder'))
        listItems.push(makeTextButton('Roll20AM',turnorder.roundRoll20AM, '!cmaster --config,turnorder,key=roundRoll20AM,value=?{Roll20AM Command|} --show,turnorder'))
        listItems.push(makeTextButton('FX',turnorder.roundFX, '!cmaster --config,turnorder,key=roundFX,value=?{FX Command|} --show,turnorder'))
        listItems.push(makeTextButton('Characters Macro',turnorder.characterRoundMacro, '!cmaster --config,turnorder,key=characterRoundMacro,value=?{Macro Name|} --show,turnorder'))
        listItems.push(makeTextButton('All Tokens Macro',turnorder.allRoundMacro, '!cmaster --config,turnorder,key=allRoundMacro,value=?{Macro Name|} --show,turnorder'))
        
		listItems.push('<div style="margin-top:3px"><i><b>Beginning of Each Turn</b></i></div>' )
        listItems.push(makeTextButton('API',turnorder.turnAPI, '!cmaster --config,turnorder,key=turnAPI,value=?{API Command|} --show,turnorder'))
        listItems.push(makeTextButton('Roll20AM',turnorder.turnRoll20AM, '!cmaster --config,turnorder,key=turnRoll20AM,value=?{Roll20AM Command|} --show,turnorder'))
        listItems.push(makeTextButton('FX',turnorder.turnFX, '!cmaster --config,turnorder,key=turnFX,value=?{FX Command|} --show,turnorder'))
        listItems.push(makeTextButton('Macro',turnorder.turnMacro, '!cmaster --config,turnorder,key=turnMacro,value=?{Macro Name|} --show,turnorder'))

        makeAndSendMenu(makeList(listItems, backButton), 'Turnorder Setup', 'gm');
    },
	
    sendTimerMenu = function() {
        let backButton = makeBigButton('Back', '!cmaster --back,setup'),
            listItems = [],
            timer = state[combatState].config.timer,
            contents;
            
        listItems.push(makeTextButton('Turn Timer', timer.useTimer, '!cmaster --config,timer,key=useTimer,value='+!timer.useTimer + ' --show,timer'))
        
        if (timer.useTimer) {
            listItems.push(makeTextButton('Time', timer.time, '!cmaster --config,timer,key=time,value=?{Time|'+timer.time+'} --show,timer'))
            listItems.push(makeTextButton('Skip Turn', timer.skipTurn, '!cmaster --config,timer,key=skipTurn,value='+!timer.skipTurn + ' --show,timer'))
            listItems.push(makeTextButton('Send to Chat', timer.sendTimerToChat, '!cmaster --config,timer,key=sendTimerToChat,value='+!timer.sendTimerToChat + ' --show,timer'))
            listItems.push(makeTextButton('Show on Token', timer.showTokenTimer, '!cmaster --config,timer,key=showTokenTimer,value='+!timer.showTokenTimer + ' --show,timer'))
            listItems.push(makeTextButton('Token Font', timer.timerFont, '!cmaster --config,timer,key=timerFont,value=?{Font|Arial|Patrick Hand|Contrail|Light|Candal} --show,timer'))
            listItems.push(makeTextButton('Token Font Size',timer.timerFontSize, '!cmaster --config,timer,key=timerFontSize,value=?{Font Size|'+timer.timerFontSize+'} --show,timer'))
        }
            
        contents = makeList(listItems, backButton);	

		makeAndSendMenu(contents, 'Timer Setup', 'gm');
    },	
	
    sendAnnounceMenu = function() {
        let backButton = makeBigButton('Back', '!cmaster --back,setup'),
			announcements = state[combatState].config.announcements,
			listItems = [
				makeTextButton('Announce Rounds', announcements.announceRound, '!cmaster --config,announcements,key=announceRound,value='+!announcements.announceRound + ' --show,announce'),
				makeTextButton('Announce Turns', announcements.announceTurn, '!cmaster --config,announcements,key=announceTurn,value='+!announcements.announceTurn + ' --show,announce'),
				makeTextButton('Whisper GM Only', announcements.whisperToGM, '!cmaster --config,announcements,key=whisperToGM,value='+!announcements.whisperToGM + ' --show,announce'),
				makeTextButton('Shorten Long Names', announcements.handleLongName, '!cmaster --config,announcements,key=handleLongName,value='+!announcements.handleLongName + ' --show,announce'),
                makeTextButton('Show NPC Conditions', announcements.showNPCTurns, '!cmaster --config,announcements,key=showNPCTurns,value='+!announcements.showNPCTurns + ' --show,announce'),				
			],
			contents = makeList(listItems, backButton);	

        makeAndSendMenu(contents, 'Announcements Setup', 'gm');
    },
	
	sendMacroMenu = function() {
        let backButton = makeBigButton('Back', '!cmaster --back,setup'),
            addButton = makeBigButton('Add Substiution', '!cmaster --new,macro,type=?{Type|CharID,CharID|CharName,CharName|TokenID,TokenID|PlayerID,PlayerID},action=?{Action|}'),
            substitutions = state[combatState].config.macro.substitutions,
            listItems=[], contents,deleteButton,listContents
  
        substitutions.forEach((substitution) => {
            deleteButton = makeImageButton('!cmaster --delete,macro,action='+substitution.action,deleteImage,'Delete Substitution','transparent',12)
            
            listContents ='<div>'
            listContents +='<span style="vertical-align:middle">'+substitution.type+ '-'+substitution.action+'</span>'
            listContents +='<span style="float:right;vertical-align:middle">'+deleteButton+'</span>'
            listContents +='</div>'
            
            listItems.push(listContents)
        }) 
       
        contents = makeList(listItems, backButton, addButton);	
        makeAndSendMenu(contents, 'Macro & API Setup', 'gm');
	},
	
	sendStatusMenu = function() {
        let backButton = makeBigButton('Back', '!cmaster --back,setup'),
            listItems = [
				makeTextButton('Whisper GM Only', state[combatState].config.status.sendOnlyToGM, '!cmaster --config,status,key=sendOnlyToGM,value='+!state[combatState].config.status.sendOnlyToGM+' --show,status'),
				makeTextButton('Player Allowed Changes', state[combatState].config.status.userChanges, '!cmaster --config,status,key=userChanges,value='+!state[combatState].config.status.userChanges+' --show,status'),
				makeTextButton('Send Changes to Chat', state[combatState].config.status.sendConditions, '!cmaster --config,status,key=sendConditions,value='+!state[combatState].config.status.sendConditions+' --show,status'),	
				makeTextButton('Clear Conditions on Close', state[combatState].config.status.clearConditions, '!cmaster --config,status,key=clearConditions,value='+!state[combatState].config.status.clearConditions + ' --show,status'),
				makeTextButton('Use Messages', state[combatState].config.status.useMessage, '!cmaster --config,status,key=useMessage,value='+!state[combatState].config.status.useMessage + ' --show,status'),
			],			
			contents = makeList(listItems, backButton);	

        makeAndSendMenu(contents, 'Status Setup', 'gm')		
	},
	
    sendConditionsMenu = function(message) {
        let key, duration, direction, override,	condition, conditionButton, favorite, icon,	output, rowCount=1,
            backButton = makeBigButton('Back', '!cmaster --back,setup'),
			addButton = makeBigButton('Add Condition', '!cmaster --new,condition=?{Name}'),
			listItems = [],
			listContents = '[',
            icons = [],
            check = true,
			contents = ''
			
        for (key in state[combatState].config.conditions) {
            condition       = getConditionByKey(key)
            let installed = verifyInstalls(condition.iconType)
            if (!installed) {
                return
            }            
			conditionButton = makeImageButton('!cmaster --show,condition=' + key,backImage,'Edit Condition','transparent',12)
			
			if (rowCount == 1) {
                listContents = '<div>'
                rowCount = 2
			} else {
			   listContents = '<div style='+styles.background+'>'
			   rowCount = 1
			}    
			
            listContents += getDefaultIcon(condition.iconType,condition.icon,'display:inline-block;margin-right:3px')
            listContents += '<span style="vertical-align:middle">'+condition.name+'</span>'
            listContents += '<span style="float:right;vertical-align:middle">'+conditionButton+'</span>'
            listContents += '</div>'              

            listItems.push(listContents);

            if(check && icons.includes(condition.icon)){
                message = message || '' + '<br>Multiple conditions use the same icon';
                check = false;
            }
        }

        message = (message) ? '<p style="color: red">'+message+'</p>' : '';
        contents += message + makeList(listItems, backButton, addButton);
        
        state[combatState].config.previousPage = 'conditions'
        makeAndSendMenu(contents, 'Conditions Setup', 'gm');
    },

    sendConditionMenu = function(key) {
        // const matchConditionChar = (character) => (character||{get:()=>''}).get('name').match(/^\s*(condition|decoration|mount)\s*:/i);
        let condition  = state[combatState].config.conditions[key], listItems = [], markerDropdown = ''

        if (debug) {
            log('Send Condition Menu')
            log('Key:'+key)
        }
        
        if (typeof condition.description == 'undefined') {
            condition.description = ' '
        }
        
	    let removeButton        = makeBigButton('Delete Condition', '!cmaster --delete,condition='+key+',confirm=?{Are you sure?|Yes,yes|No,no}'),
		    descriptionButton   = makeBigButton('Edit Description', '!cmaster --config,condition='+key+',key=description,value=?{Description|'+condition.description+'} --show,condition='+key),
		    backButton          = makeBigButton('Back', '!cmaster --back')	 

		listItems.push(makeTextButton('Name', condition.name, '!cmaster --config,condition='+key+',key=name,value=?{Name}'))
		listItems.push(makeTextButton('Icon Type', condition.iconType, '!cmaster --config,condition='+key+',key=iconType,value=?{Icon Type|Combat Master,Combat Master|Token Marker,Token Marker|Token Condition,Token Condition} --show,condition='+key))
        
        let installed = verifyInstalls(condition.iconType)
        if (!installed) {
            return
        }   

        markerDropdown = '?{Marker';
        if (condition.iconType == 'Combat Master') {
            ctMarkers.forEach((marker) => {
                markerDropdown += '|'+ucFirst(marker).replace(/-/g, ' ')+','+marker
            })
        } else if (condition.iconType == 'Token Marker') {
            if (markers.length == 0) {
    	        markers = getTokenMarkers();
            }
            markers.forEach((marker) => {
                markerDropdown += '|'+marker.name+','+marker.name
            })
        } 
        // else if (condition.iconType == 'Token Condition') {
            
        //     let conditionChars = findObjs({type:"character"}).filter(matchConditionChar);
        //     log(conditionChars)
        // }    
        markerDropdown += '}';
        
        if (condition.iconType == 'Token Condition') {
            listItems.push(makeTextButton('Icon', condition.icon, '!cmaster --config,condition='+key+',key=icon,value=?{Token Condition|} --show,condition='+key))				
        } else {     
	        listItems.push(makeTextButton('Icon', getDefaultIcon(condition.iconType,condition.icon), '!cmaster --config,condition='+key+',key=icon,value='+markerDropdown+' --show,condition='+key))				
        }
        
		listItems.push(makeTextButton('Duration', condition.duration, '!cmaster --config,condition='+key+',key=duration,value=?{Duration|1} --show,condition='+key))
		listItems.push(makeTextButton('Direction', condition.direction, '!cmaster --config,condition='+key+',key=direction,value=?{Direction|0} --show,condition='+key))
		listItems.push(makeTextButton('Override', condition.override, '!cmaster --config,condition='+key+',key=override,value='+!condition.override+' --show,condition='+key))
		listItems.push(makeTextButton('Favorites', condition.favorite, '!cmaster --config,condition='+key+',key=favorite,value='+!condition.favorite+' --show,condition='+key))
		listItems.push(makeTextButton('Message', condition.message, '!cmaster --config,condition='+key+',key=message,value=?{Message} --show,condition='+key))
        listItems.push(makeTextButton('Targeted', condition.targeted, '!cmaster --config,condition='+key+',key=targeted,value='+!condition.targeted+' --show,condition='+key))
        listItems.push('<div style="margin-top:3px"><i><b>Adding Condition</b></i></div>' )
		listItems.push(makeTextButton('API', condition.addAPI, '!cmaster --config,condition='+key+',key=addAPI,value=?{API Command|} --show,condition='+key))
		listItems.push(makeTextButton('Roll20AM', condition.addRoll20AM, '!cmaster --config,condition='+key+',key=addRoll20AM,value=?{Roll20AM Command|} --show,condition='+key))
		listItems.push(makeTextButton('FX', condition.addFX, '!cmaster --config,condition='+key+',key=addFX,value=?{FX|} --show,condition='+key))
		listItems.push(makeTextButton('Macro', condition.addMacro, '!cmaster --config,condition='+key+',key=addMacro,value=?{Macro|} --show,condition='+key))
		listItems.push(makeTextButton('Persistent Macro', condition.addPersistentMacro, '!cmaster --config,condition='+key+',key=addPersistentMacro,value='+!condition.addPersistentMacro+' --show,condition='+key))
        listItems.push('<div style="margin-top:3px"><i><b>Removing Condition</b></i></div>' )
		listItems.push(makeTextButton('API', condition.remAPI, '!cmaster --config,condition='+key+',key=remAPI,value=?{API Command|} --show,condition='+key))
		listItems.push(makeTextButton('Roll20AM', condition.remRoll20AM, '!cmaster --config,condition='+key+',key=remRoll20AM,value=?{Roll20AM Command|} --show,condition='+key))
		listItems.push(makeTextButton('FX', condition.remFX, '!cmaster --config,condition='+key+',key=remFX,value=?{FX|} --show,condition='+key))
		listItems.push(makeTextButton('Macro', condition.remMacro, '!cmaster --config,condition='+key+',key=remMacro,value=?{Macro|} --show,condition='+key))

		let contents = makeList(listItems)+'<hr>'+descriptionButton+'<b>Description:</b>'+condition.description+removeButton+'<hr>'+backButton 	
        makeAndSendMenu(contents, 'Condition Setup', 'gm');
    },
    
    showConditions = function (selectedTokens) {
        let tokenObj, characterObj, target
        
        if (selectedTokens) {
            selectedTokens.forEach(token => {
                if (token._type == 'graphic') {
                    if (token._id != getOrCreateMarker(false).get('id') && token._id != getOrCreateMarker(true).get('id')) {
                        announcePlayer(getObj('graphic', token._id), false, false, true);
                    }    
                }
            })    
        }    
    },
    
    importCombatMaster = function (config) {
        let json 
        let backButton = makeBigButton('Back', '!cmaster --back,setup');
        
        json = JSON.parse(config.replace('config=',''));
        if (['cmaster','cm'].includes(json.command)) {
            state[combatState].config = json
            state[combatState].conditions = [];
            setDefaults()
            makeAndSendMenu('Current Combat Master detected and imported.' + backButton, 'Import Setup');
        } else if (json.config.command == 'condition') {
            state[combatState].config.conditions = json.conditions
            setDefaults()
            makeAndSendMenu('Prior Combat Tracker detected and conditions were imported.' + backButton, 'Import Setup');
        }
    },
    
    exportConditions = function () {
        let backButton = makeBigButton('Back', '!cmaster --back,setup')
        makeAndSendMenu('<p>Copy the entire content above and save it on your pc.</p><pre>'+HE(JSON.stringify(state[combatState].config))+'</pre><div>'+backButton+'</div>', 'Export Configs');
    },
    
    targetedCondition = function (id, key) {
        if (debug) {
            log('Targeted Condition')
        }

        let title        = 'Select Targets'
        let condition    = state[combatState].conditions[key]
        let addButton    = makeImageButton('!cmaster --add,target,id='+id+',condition='+key,tagImage,'Targeted Icons','transparent',18,'white')
        title           += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+addButton+'</div>'     
        let contents     = 'Select target tokens to assign this condition and hit the button above when ready'
        makeAndSendMenu(contents,title,'gm');
    },

//*************************************************************************************************************
//SESSION STATE MAINTENANCE
//*************************************************************************************************************	
	editCombatState = function (cmdDetails) {
		if(cmdDetails.details.initiative){
			state[combatState].config.initiative[cmdDetails.details.key] = cmdDetails.details.value;
		}
		else if(cmdDetails.details.timer){
			state[combatState].config.timer[cmdDetails.details.key] = cmdDetails.details.value;
		}
		else if (cmdDetails.details.turnorder){
			if (cmdDetails.details.key === 'initiativeDie') {
				cmdDetails.details.value = parseInt(value);
			}
			state[combatState].config.turnorder[cmdDetails.details.key] = cmdDetails.details.value;
		}	
		else if (cmdDetails.details.announcements){
			state[combatState].config.announcements[cmdDetails.details.key] = cmdDetails.details.value;
		}
		else if (cmdDetails.details.status){
			state[combatState].config.status[cmdDetails.details.key] = cmdDetails.details.value;
		}    
		else {
    		if (cmdDetails.details.key === 'name' && cmdDetails.details.value.replace(/\s/g, '').toLowerCase() !== state[combatState].config.conditions[cmdDetails.details.condition]) { 
      			state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()] = state[combatState].config.conditions[cmdDetails.details.condition];
      			state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()].key = cmdDetails.details.value.toLowerCase()
      			state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()].name = cmdDetails.details.value
      			delete state[combatState].config.conditions[cmdDetails.details.condition];
      			if (debug) {
      			    log('New Key:' + cmdDetails.details.value.toLowerCase())
      			    log('Old Key:' + cmdDetails.details.condition)
      			    log ('New Condition:' + state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()])
      			}    
      			sendConditionMenu(cmdDetails.details.value.toLowerCase())
    	    } else {
    	        if (cmdDetails.details.key == 'description') {
    	            cmdDetails.details.value = cmdDetails.details.value
    	        }
		        state[combatState].config.conditions[cmdDetails.details.condition][cmdDetails.details.key] = cmdDetails.details.value;
    	    }      
		}
	},
    
	editFavoriteState = function (value) {
		state[combatState].config.status.showConditions = value;
	},
	
//*************************************************************************************************************
//CONDITIONS 
//*************************************************************************************************************		
	newCondition = function (name) {
        if (debug) {
            log ('Create Condition')
            log('Name:'+name)
        }	
        
		if(!name){
			sendConditionsMenu('You didn\'t give a condition name, eg. <i>!condition add Prone</i>.');
		} else if (state[combatState].config.conditions[name.toLowerCase()]) {
			sendConditionsMenu('The condition `'+name+'` already exists.');
		} else {
			state[combatState].config.conditions[name.toLowerCase()] = {
				name: name,
				key: name.toLowerCase(),
				icon: 'red',
				iconType: 'Combat Master',
				description: ' ',
				duration: 1,
				direction: 0,
				message: 'None',
				tageted: false,
				addAPI: 'None',
				addRoll20AM: 'None',
				addFX: 'None',
				addMacro: 'None',
				addPersistentMacro: false,
				remAPI: 'None',
				remRoll20AM: 'None',
				remFX: 'None',
				remMacro: 'None'				
			}	
			sendConditionMenu(name.toLowerCase());		
		}		
	},
	
	deleteCondition = function (key, confirm) {	
        if (debug) {
            log ('Delete Condition')
            log('Condition:'+key)
            log('Confirm:'+confirm)
        }	

		if (confirm === 'yes') {
			if(!key){
				sendConditionsMenu('You didn\'t give a condition name, eg. <i>!cmaster --delete,condition=Prone</i>.');
			} else if( !state[combatState].config.conditions[key]){
				sendConditionsMenu('The condition `'+key+'` does\'t exist.');
			} else {
				delete state[combatState].config.conditions[key];
				sendConditionsMenu('The condition `'+key+'` is removed.');
			}
		}	
		sendConditionsMenu('Condition was deleted')
	},

    getConditionByMarker = function (marker) {
        if (debug) {
            log('Get Condition By Marker')
            log("Marker:" + marker)
        }
        
        let key
        for (key in state[combatState].config.conditions) {
            if (marker.includes(state[combatState].config.conditions[key].icon)) {
                return state[combatState].config.conditions[key]
            }
        }
        return false;  
    },

    getConditionByKey = function(key) {
        return state[combatState].config.conditions[key];
    },
    
    getConditions = function () {
        return state[combatState].config.conditions;
    }, 	

    verifyCondition = function(token,key) {
        let condition  = getConditionByKey(key)
        
        if (debug) {
            log('Verify Condition')
        }
        
        if (!condition) {
            return true
        }
        if (typeof condition.direction == 'undefined' || typeof condition.duration == 'undefined') {
			makeAndSendMenu('The condition you are trying to use has not be setup yet', '', 'gm');
			return false;            
        }
		if (!key) {
			makeAndSendMenu('No condition name was given.', '', 'gm');
			return false;
		}
		if (!token || !token.length) {		
			makeAndSendMenu('No tokens were selected.', '', 'gm');
			return false;
        }
        if (token == getOrCreateMarker().get('id')) {
            return false;
        }
        if (token == getOrCreateMarker(true).get('id')) {
            return false;
        }      
        return true;
    },
    
    addCondition = function(cmdDetails,selectedTokens,playerID) {
        if (debug) {
            log('Add Condition')
        }
        
        if (selectedTokens) {
        	selectedTokens.forEach(token => {
        	    if (token._type == 'graphic') {
    			    addConditionToToken(getObj(token._type, token._id),cmdDetails.details.condition,cmdDetails.details.duration,cmdDetails.details.direction,cmdDetails.details.message)    
    			    doAddConditionCalls(getObj(token._type, token._id),cmdDetails.details.condition,playerID)
        	    }
        	});	 	
        } else {
            makeAndSendMenu('No tokens were selected.', '', 'gm');
        }   
    },

     removeCondition = function (cmdDetails,selectedTokens) {
        if (debug) {
            log('Remove Condition')
        }

        if (cmdDetails.details.id) {
            let token = getObj('graphic', cmdDetails.details.id)
            removeConditionFromToken(token, cmdDetails.details.condition)  
            doRemoveConditionCalls(token,cmdDetails.details.condition)
        } else if (selectedTokens) {
        	selectedTokens.forEach(token => {
        	    if (token._type == 'graphic') {
    			    removeConditionFromToken(getObj(token._type, token._id), cmdDetails.details.condition)   
    			    doRemoveConditionCalls(getObj(token._type, token._id),cmdDetails.details.condition)
        	    }    
        	});	 	
        }	
    },
    
    addConditionToToken = function(tokenObj,key,duration,direction,message) {
	    let	defaultCondition = getConditionByKey(key)
	    let newCondition = {}

        if (debug) {
            log('Add Condition To Token')
            log('Key:' + key)
            log('Duration:' + duration)
            log('Direction:' + direction)
            log('Message:'+message)
        } 

        if (verifyCondition(tokenObj.get("_id"), key)) {
            
            let removed = removeConditionFromToken(tokenObj, key);   
           
            newCondition.id                 = tokenObj.get("_id")
            newCondition.key                = key
            newCondition.target             = []
            newCondition.tokenConditionID   = null
            
            if (defaultCondition) {
                newCondition.name               = defaultCondition.name
                newCondition.icon               = defaultCondition.icon
                newCondition.iconType           = defaultCondition.iconType
                newCondition.addMacro           = defaultCondition.addMacro
                newCondition.addPersistentMacro = defaultCondition.addPersistentMacro
            } else {
                newCondition.name               = key
                newCondition.icon               = null
                newCondition.iconType           = null
                newCondition.addMacro           = null
                newCondition.addPersistentMacro = null
            }
            
            let icon
            if (newCondition.iconType) {
                icon = getIconTag(newCondition.iconType, newCondition.icon)
            }

            if (newCondition.iconType == 'Token Condition') {
                let characterObj = findObjs({name: newCondition.icon, _type: 'character'})[0];
                characterObj.get("defaulttoken", function(defaulttoken) {

                    let newToken = JSON.parse(defaulttoken)
                    let condition = createObj('graphic', {
                                        subtype:'token',
                                        name: newToken.name,
                                        imgsrc: getCleanImgsrc(newToken.imgsrc),
                                        pageid: tokenObj.get('pageid'),
                                        represents: characterObj.id,
                                        layer: tokenObj.get('layer'),
                                        left: tokenObj.get('left'), 
                                        top: tokenObj.get('top'),
                                        width: tokenObj.get('width'), 
                                        height: tokenObj.get('height')
                                    });   
                    let result = TokenCondition.AttachConditionToToken(condition.id,tokenObj.id);
                    log(result)             
        			if(result.success) {
        				newCondition.tokenConditionID = condition.id
        			} else {
        				log(`Attach failed. Message: ${result.reason}`);
        			}                                        
                });
            }
            
            if (!duration && defaultCondition) {
                newCondition.duration = parseInt(defaultCondition.duration)
            } else {
                newCondition.duration = parseInt(duration)
            }   
            
            if (!direction && defaultCondition) {
                newCondition.direction = parseInt(defaultCondition.direction)
            } else {    
                newCondition.direction = parseInt(direction)
            }    
   
            if (!message) {
                newCondition.message = 'None'
            } else {   
                newCondition.message = message
            }   
            
            setTimeout(function() {
                 log(newCondition)
                 state[combatState].conditions.push(newCondition)
            },500) 

            if (icon) {
                if (newCondition.key == 'dead' || newCondition.duration <= 1) {
                    addMarker(tokenObj,icon)
                } else {   
                    if (newCondition.duration >= 10) {
                        addMarker(tokenObj,icon)
                    } else {
                        addMarker(tokenObj,icon,newCondition.duration)
                    }
                }  
            } 
            
            if (state[combatState].config.status.sendConditions && !removed && defaultCondition) {
                sendConditionToChat(newCondition.key)
            }  
            if (defaultCondition && defaultCondition.targeted) {
                targetedCondition(newCondition.id, key)
            }    
        }    
    },  

    getCleanImgsrc =  function (imgsrc) {
        let parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return;
    },
    
    removeConditionFromToken = function(tokenObj,key) {
        if (debug) {
            log('Remove Condition From Token')
            log('Condition:'+key)
        } 
          
        let removed = false
        let icon
        
        if (verifyCondition(tokenObj.get("_id"), key)) {  
            [...state[combatState].conditions].forEach((condition, i) => {
                if (condition.id == tokenObj.get('_id')) {
                    if (condition.key == key) {
                        if (condition.iconType) {
                            icon = getIconTag(condition.iconType, condition.icon)
                        }           
                        if (condition.hasOwnProperty('target')) {
                            if (condition.target.length > 0) {
                                condition.target.forEach((target, j) => {
                                    if (icon) {
                                        removeMarker(getObj('graphic', target),icon)
                                    } else if (condition.iconType == 'Token Condition') {
                                        removeTokenCondition(condition.tokenConditionID)
                                    }    
                                })    
                            }
                        }    
                        if (icon) {            
                            removeMarker(tokenObj,icon)
                        } else if (condition.iconType == 'Token Condition') {
                            removeTokenCondition(condition.tokenConditionID)
                        }                            
                        state[combatState].conditions.splice(i,1)
                        removed = true
                    }
                }      
            });  
        }    
        return removed
    },

    removeTokenCondition = function (id) {
        if (debug) {
            log('Remove Token Condition')
            log('Token Condition ID:' + id)
        }
        let conditionToken = findObjs({_id:id,_pageid:Campaign().get("playerpageid"), _type: 'graphic'})[0];
        conditionToken.remove()
    },
    
    sendConditionToChat = function (key) {
        if (debug) {
            log("Send Condition To Chat")
        }
        
        let condition = getConditionByKey(key)
        let icon
        if (['Combat Master','Token Marker'].includes(condition.iconType)) {
            icon  = getDefaultIcon(condition.iconType,condition.icon, 'margin-right: 5px; margin-top: 5px; display: inline-block;');
        }    
        makeAndSendMenu(condition.description,icon+condition.name,(state[combatState].config.status.sendOnlyToGM) ? 'gm' : '');
    },
  
    addTargetsToCondition = function(selectedTokens,id,key) {
        if (debug) {
            log("Add Targets to Condition")
            log('Id:' + id)
            log('Key:' + key)
        }
        
        let icon
        [...state[combatState].conditions].forEach((condition,i) => {
            if (condition.id == id && condition.key == key) {
                selectedTokens.forEach(token => {
                    let installed = verifyInstalls(condition.iconType)
                    if (installed) {
                        icon = getIconTag(condition.iconType,condition.icon)
                        state[combatState].conditions[i].target.push(token._id)
                        addMarker(getObj('graphic', token._id),icon)
                    }    
                })    
            }   
            log (state[combatState].conditions[i])
        });   
        
        makeAndSendMenu('Selected Tokens Added',"Selected Tokens",'gm'); 
    },
    
//*************************************************************************************************************
//START/STOP COMBAT
//*************************************************************************************************************	
    verifySetup = function(selectedTokens, initiative) {
        let initAttributes, turnorder, attribute, whisper, characterObj, verified=true, i, tokenObj
 
        if (debug) {
            log('Verify Setup')
            log(initiative.rollInitiative)
        }
        
        if (!selectedTokens || selectedTokens.length == 0) {
            makeAndSendMenu('No tokens selected.  Combat not started',' ', whisper);   
            return false
        }
        
        if (initiative.rollInitiative == 'None') {
            turnorder = getTurnorder()
            if (turnorder.length == 0) {
                makeAndSendMenu('Auto Roll Initiative has been set to None and your turn order is currently empty',' ', whisper);
                verified=false
                return
            }
        }

        if (initiative.rollInitiative == 'CombatMaster') {
            selectedTokens.forEach(token => {
                if (token._type == 'graphic') {
                    tokenObj        = getObj('graphic', token._id)
                    whisper         = (tokenObj.layer == 'gmlayer') ? 'gm ' : ''
                    characterObj    = getObj('character', tokenObj.get('represents'))
        
    				if (!characterObj) {
                         makeAndSendMenu('A token was found not assigned to a character sheet',' ', whisper);   
                    } 
                    // else {  
                    //     initAttributes  = initiative.initiativeAttributes.split(';')
                    //     log(initAttributes)
                    //     initAttributes.forEach((attributes) => {
                    //         attribute  = getAttrByName(characterObj.id,attributes,'current') 
                    //         if (!attribute) {
                    //             makeAndSendMenu('Initiative Attribute ' + attributes + ' not found on character sheet',' ', whisper);  
                    //         }                       
                    //     })
                    // }    
                }    
			})    
        }  
        
        return verified
    },

    startCombat = function (selectedTokens) {
        let verified, initiative = state[combatState].config.initiative, turnorder=state[combatState].config.turnorder
        
        if (debug) {
            log('Start Combat')
        }

        verified = verifySetup(selectedTokens, initiative)
        if (!verified) {
            return
        }

        paused = false;
        Campaign().set('initiativepage', Campaign().get('playerpageid'));
        
        
        if(initiative.rollInitiative == 'CombatMaster'){
            rollInitiative(selectedTokens, initiative);
        } else if (initiative.rollInitiative == 'Group-Init') {
            rollGroupInit(selectedTokens)
        } else if (!getTurnorder()) {
            makeAndSendMenu('You must have a populated turnorder before starting Combat Master','');    
        }

        setTimeout(function() {
            doRoundCalls()
            doTurnorderChange()
        },500) 
    },
    
    stopCombat = function () {
        if (debug) {
            log('Stop Combat')
        }
        
        if(timerObj) timerObj.remove();

        if (state[combatState].config.status.clearConditions) {
            state[combatState].conditions.forEach((condition) => {
                if (condition.id != getOrCreateMarker(true).get('id') && condition.id != getOrCreateMarker(false).get('id')) {
                    removeConditionFromToken(getObj('graphic',condition.id), condition.key)
                }  
            }) 
        }   
        
        state[combatState].conditions = [];
        removeMarkers();
        stopTimer();
        paused = false;
        Campaign().set({
            initiativepage: false,
            turnorder: ''
        });
        state[combatState].turnorder = {};
        round = 1;
    },

    rollInitiative = function (selectedTokens, initiative) {
        let tokenObj, whisper, initiativeTemp, initiativeRoll, characterObj, initAttributes, initiativeMod, i, advantageAttrib, initiativeAdv1, initiativeAdv2
        
        //loop through selected tokens
        selectedTokens.forEach(token => {
            if (token._type == 'graphic') {
                tokenObj        = getObj('graphic', token._id)
                characterObj    = getObj('character', tokenObj.get('represents'))

                if (characterObj) {
                    whisper         = (tokenObj.get('layer') === 'gmlayer') ? 'gm ' : ''
                    initiativeRoll  = (initiative.initiativeDie) ? randomInteger(initiative.initiativeDie) : 0;
                    initAttributes  = initiative.initiativeAttributes.split(',')
                    initiativeMod   = 0

                    initAttributes.forEach((attributes) => {
                        initiativeTemp  = getAttrByName(characterObj.id,attributes,'current') 
                        initiativeMod  += parseFloat(initiativeTemp)                        
                    })

                    //check for advantage initiative rolling (OGL)
                    advantageAttrib   = getAttrByName(characterObj.id, 'initiative_style', 'current');  
                    if (typeof advantageAttrib != 'undefined') {
                        // roll advantage for initiative
                        initiativeAdv1 = (initiative.initiativeDie) ? randomInteger(initiative.initiativeDie) : 0; 
                        initiativeAdv2 = (initiative.initiativeDie) ? randomInteger(initiative.initiativeDie) : 0;
                        // this is the value if in OGL if rolling advantage
                        if (advantageAttrib == '{@{d20},@{d20}}kh1') {
                            //determine which value is higher
                            if (initiativeAdv1 >= initiativeAdv2) {
                                initiativeRoll = initiativeAdv1
                            } else {
                                initiativeRoll = initiativeAdv2
                            }
                            //pass in both values and modifier for display
                            if (initiative.showInitiative) {
                                sendInitiativeChat(tokenObj.get('name'),initiativeAdv1,initiativeMod,initiativeAdv2,whisper)                            
                            }
                        } else if (initiative.showInitiative) { 
                            // if not rolling advantage, use first roll
                            initiativeRoll = initiativeAdv1
                            sendInitiativeChat(tokenObj.get('name'),initiativeRoll,initiativeMod,null,whisper)                              
                        }    
                    }  else if (initiative.showInitiative) { 
                        // if everything else then pass in for display
                         sendInitiativeChat(tokenObj.get('name'),initiativeRoll,initiativeMod,null,whisper)   
                    }  
                    //add to turnorder 
                    if (Number.isInteger(initiativeMod+initiativeRoll)) {
                        addToTurnorder({id:tokenObj.id,pr:(initiativeMod+initiativeRoll),custom:'',pageid:tokenObj.get("pageid")});
                    } else {
                        addToTurnorder({id:tokenObj.id,pr:(initiativeMod+initiativeRoll).toFixed(2),custom:'',pageid:tokenObj.get("pageid")});
                    }    
                }   
            }    
        });
        // sort turnorder if set
        if(state[combatState].config.turnorder.sortTurnOrder){
            sortTurnorder();
        }
    },

    rollGroupInit = function (selectedTokens) {
        let giRoll = () => sendChat('',`/w gm <code>GroupInitiative.RollForTokenIDs()</code> is not supported.`);    	
        

    	if('undefined' !== typeof GroupInitiative && GroupInitiative.RollForTokenIDs){
			GroupInitiative.RollForTokenIDs(
				(selectedTokens||[]).map(s=>s._id),{manualBonus: 0}
			);   
    	} 	
    },
    
    sendInitiativeChat = function (name,rollInit,bonus,rollInit1,whisper) { 
        let contents = ''
        
        if (rollInit1) {
            contents = '<table style="width: 50%; text-align: left; float: left;"> \
                            <tr> \
                                <th>Modifier</th> \
                                <td>'+bonus+'</td> \
                            </tr> \
                        </table> \
                        <div style="text-align: center"> \
                            <b style="font-size: 14pt;"> \
                                <span style="border: 1px solid green; padding-bottom: 2px; padding-top: 4px;">[['+rollInit+'+'+bonus+']]</span><br><br> \
                            </b> \
                        </div> \
                        <div style="text-align: center"> \
                            <b style="font-size: 10pt;"> \
                                <span style="border: 1px solid red; padding-bottom: 2px; padding-top: 4px;">[['+rollInit1+'+'+bonus+']]</span><br><br> \
                            </b> \
                        </div>'   
        } else {
             contents = '<table style="width: 50%; text-align: left; float: left;"> \
                            <tr> \
                                <th>Modifier</th> \
                                <td>'+bonus+'</td> \
                            </tr> \
                        </table> \
                        <div style="text-align: center"> \
                            <b style="font-size: 14pt;"> \
                                <span style="border: 1px solid green; padding-bottom: 2px; padding-top: 4px;">[['+rollInit+'+'+bonus+']]</span><br><br> \
                            </b> \
                        </div>'
           
        }  
        
        makeAndSendMenu(contents, name + ' Initiative', whisper);    
    },
//*************************************************************************************************************
//MARKERS
//*************************************************************************************************************	    
    addMarker = function(tokenObj, marker, duration) {
        if (debug) {
            log('Add Marker')
            log('Id:' + tokenObj.get("_id"))
            log('Marker:' + marker)
            log('Duration:' + duration)
        }
        
        let exists
        let statusmarker
        let statusmarkers
        
        if (tokenObj.get('statusmarkers')) {
            statusmarkers = tokenObj.get('statusmarkers').split(',')
        } else {
            statusmarkers = []
        } 
        log(statusmarkers)
        if (duration) {
            statusmarker = marker+'@'+duration
        } else {
            statusmarker = marker
        }

        [...statusmarkers].forEach((a, i) => {
            log(a.indexOf(marker))
            
            if (a.indexOf(marker) > -1) {
                statusmarkers.splice(i,0)
                exists = true
            }        
        });        
        
        if (!exists) {
            statusmarkers.push(statusmarker)
        }
        
        tokenObj.set('statusmarkers', statusmarkers.join())
        log('Status:'+tokenObj.get('statusmarkers'))
        log('Id:' + tokenObj.get("_id"))
    },

    removeMarker = function(tokenObj, marker) {
        if (debug) {
            log('Remove Marker')
            log('Marker:' + marker)
        }
        
        let statusmarkers = tokenObj.get('statusmarkers').split(',');

        [...statusmarkers].forEach((a, i) => {
            if (a.indexOf(marker) > -1) {
                statusmarkers.splice(i,1)
            }  
        });       

        tokenObj.set('statusmarkers', statusmarkers.join())
    },
    
    resetMarker = function (next=false) {
        let marker = getOrCreateMarker(next),
            turnorder = state[combatState].config.turnorder;
        
        if (debug) {
            log('Reset Marker')
        }
        
        marker.set({
            name: (next) ? 'NextMarker' : 'Round ' + round,
            imgsrc: (next) ? turnorder.nextExternalMarkerURL : turnorder.externalMarkerURL,
            pageid: Campaign().get('playerpageid'),
            layer: 'gmlayer',
            left: 35, top: 35,
            width: 70, height: 70
        });

        return marker;
    },

    getOrCreateMarker = function (next=false) {
        let pageid    = Campaign().get('playerpageid')
		let	turnorder = state[combatState].config.turnorder
		
        if (debug) {
            log('Get or Create Marker')
        }	
		
		let imgsrc
		if (turnorder.markerType == 'External URL') {	
            imgsrc = (next) ? turnorder.nextExternalMarkerURL : turnorder.externalMarkerURL
		} else {
			imgsrc = (next) ? turnorder.nextTokenMarkerURL : turnorder.tokenMarkerURL		
		}
        
 		let markers = (next) ? findObjs({pageid,imgsrc,name: 'NextMarker'}) : findObjs({pageid,imgsrc});
        
        markers.forEach((marker, i) => {
            if(i > 0 && !next) marker.remove();
        });

        let marker = markers.shift();
        if(!marker) {
            marker = createObj('graphic', {
                name: (next) ? 'NextMarker' : 'Round 1',
                imgsrc,
                pageid,
                layer: 'gmlayer',
                showplayers_name: true,
                left: 35, top: 35,
                width: 70, height: 70
            });
        }
        
        if(!next) checkMarkerturn(marker);
        
        toBack(marker);

        return marker;
    },

    checkMarkerturn = function (marker) {
        let turnorder = getTurnorder(),
            hasTurn = false;
        
        if (debug) {
            log ('Check Marker Turn')
        }    
        
        turnorder.forEach(turn => {
            if(turn.id === marker.get('id')) hasTurn = true;
        });

        if(!hasTurn){
            turnorder.push({ id: marker.get('id'), pr: -1, custom: '', pageid: marker.get('pageid') });
            Campaign().set('turnorder', JSON.stringify(turnorder));
        }
    },
    
    removeMarkers = function () {
        stopRotate();
        getOrCreateMarker().remove();
        getOrCreateMarker(true).remove();
    },
    
   changeMarker = function (token, next=false)  {
        let marker = getOrCreateMarker(next);

        if (debug) {
            log('Change Marker')
        }
        
        if(!token){
            resetMarker(next);
            return;
        }

        let position = {
            top: token.get('top'),
            left: token.get('left'),
            width: token.get('width')+(token.get('width')*0.35),
            height: token.get('height')+(token.get('height')*0.35),
        };

        if(token.get('layer') !== marker.get('layer')) {
            if(marker.get('layer') === 'gmlayer') { 
                marker.set(position);
                setTimeout(() => {
                    if (state[combatState].config.turnorder.useMarker) {
                        marker.set({ layer: 'objects' });
                    }    
                }, 500);
            } else { 
                marker.set({ layer: 'gmlayer' });
                setTimeout(() => {
                    marker.set(position);
                }, 500);
            }
        } else {
            marker.set(position);
        }

        toBack(marker);
    },

    centerToken = function (token) {
        if(state[combatState].config.turnorder.centerToken) {
            if (token.get('layer') != 'gmlayer') {
                sendPing(token.get('left'), token.get('top'), token.get('pageid'), null, true);
            }    
        }    
    },
    
    handleStatusMarkerChange = function (obj, prev) {
        if (debug) {
            log ('Handle Status Marker Change')
        } 

        prev.statusmarkers = (typeof prev.get === 'function') ? prev.get('statusmarkers') : prev.statusmarkers;

        if(typeof prev.statusmarkers === 'string'){
            if(obj.get('statusmarkers') !== prev.statusmarkers){

                var prevstatusmarkers = prev.statusmarkers.split(",");
                var newstatusmarkers = obj.get('statusmarkers').split(",");
                
                if (debug) {
                    log('New Statuses:'+newstatusmarkers)
                    log('Old Statuses:'+prevstatusmarkers)
                }

                if (prevstatusmarkers.length > 0) {
                    prevstatusmarkers.forEach((marker) => {
                        let condition = getConditionByMarker(marker);
                        if(!condition) return;
                        if(marker !== '' && !newstatusmarkers.includes(marker)){
                            removeConditionFromToken(obj, condition.key);
                            doRemoveConditionCalls(obj,condition.key)
                        }
                    })
                }    
                
                if (newstatusmarkers.length > 0 ) {
                    newstatusmarkers.forEach(function(marker){
                        let condition = getConditionByMarker(marker)
                        if(!condition) return;
                        if(marker !== "" && !prevstatusmarkers.includes(marker)){
                            addConditionToToken(obj,condition.key,condition.duration,condition.direction,condition.message);
                            doAddConditionCalls(obj,condition.key)
                        }
                    });
                }    
            }
        }
    },    
//*************************************************************************************************************
//TURNORDER
//*************************************************************************************************************	      
    clearTurnorder = function () {
        Campaign().set({ turnorder: '' });
        state[combatState].turnorder = {};
    },

    doTurnorderChange = function (prev=false, delay=false) {
        let turn        = getCurrentTurn(),
            marker      = getOrCreateMarker(),
            tokenObj    = getObj('graphic', turn.id);

        if(debug) {
            log('Turn Order Change')
        }
        
        if (turn.id === '-1') { 
            doRoundCalls()
            nextTurn();
            return;
        }

        if (turn.id === marker.id) {
            if (prev) {
                prevRound();
            } else { 
                nextRound();
            }    
            return;
        }

		if (tokenObj) {
            toFront(tokenObj);

            if (state[combatState].config.timer.useTimer) {
                startTimer(tokenObj);
            }

            changeMarker(tokenObj);
            announcePlayer(tokenObj, prev, delay);
            centerToken(tokenObj);
            doTurnCalls(tokenObj)            
        } else {
            resetMarker();
        }

        if (state[combatState].config.turnorder.nextMarkerType != 'None') {
            let nextTurn = getNextTurn();
            if (nextTurn) {
                let nextToken = getObj('graphic', nextTurn.id);
    
                if (nextToken) {
                    toFront(nextToken);
                    changeMarker(nextToken || false, true);
                } else {
                    resetMarker(true);
                }
            }    
        }
    },
    
    handleTurnorderChange = function (obj, prev) {
        if (debug) {
            log("Handle Turnorder Change")
        }
        
        if(obj.get('turnorder') === prev.turnorder) return;

        let turnorder = (obj.get('turnorder') === "") ? [] : JSON.parse(obj.get('turnorder'));
        let prevTurnorder = (prev.turnorder === "") ? [] : JSON.parse(prev.turnorder);

        if(obj.get('turnorder') === "[]"){
            stopCombat();
            return;
        }

        if(turnorder.length && prevTurnorder.length && turnorder[0].id !== prevTurnorder[0].id){
            doTurnorderChange();
        }
    },

    sortTurnorder = function (order='DESC') {
        let turnorder = getTurnorder();

        turnorder.sort((a,b) => { 
            return (order === 'ASC') ? a.pr - b.pr : b.pr - a.pr;
        });

        setTurnorder(turnorder);
        doTurnorderChange();
    },

    getTurnorder = function () {
        return (Campaign().get('turnorder') === '') ? [] : Array.from(JSON.parse(Campaign().get('turnorder')));
    },

    addToTurnorder = function (turn) {
        let turnorder = getTurnorder(),
            justDoIt = true;

        if (debug) {
            log('Add to Turnorder')
        }
        
        turnorder.push(turn);
        setTurnorder(turnorder);
    },

    setTurnorder = (turnorder) => {
        Campaign().set('turnorder', JSON.stringify(turnorder));
    },

//*************************************************************************************************************
//TURNS
//*************************************************************************************************************	          
    delayTurn = function () {
        let turnorder, currentTurn, nextTurn, dummy

        turnorder   = getTurnorder()
        currentTurn = turnorder.shift();
        
        if (getVeryNextTurn().id === getOrCreateMarker().get('id')) { 
            setTurnorder(turnorder)
            nextRound()
            turnorder   = getTurnorder()
            nextTurn = currentTurn
            currentTurn = turnorder.shift();
            turnorder.unshift(nextTurn)  
            turnorder.unshift(currentTurn)
            setTurnorder(turnorder);
            
            return;
        }
        
        nextTurn    = turnorder.shift();
        
        if (debug) {
            log('Delay Turn')
            log('Current:' + currentTurn)
            log('Next:'+nextTurn)
        }
        
        turnorder.unshift(currentTurn)
        turnorder.unshift(nextTurn)
        
        setTurnorder(turnorder);
        doTurnorderChange(false,true);
    },
    
    nextTurn = function() {
        let turnorder, currentTurn
      
        if (debug) {
            log('Next Turn')
        }
        
        turnorder   = getTurnorder(),
        currentTurn = turnorder.shift()
        turnorder.push(currentTurn);
        setTurnorder(turnorder);
        doTurnorderChange();
    },

    previousTurn = function() {
        let turnorder = getTurnorder(),
            last_turn = turnorder.pop();        
        turnorder.unshift(last_turn);

        setTurnorder(turnorder);
        doTurnorderChange(true);
    },

    nextRound = function () {
        let marker     = getOrCreateMarker(),
            initiative = state[combatState].config.initiative
         
        if (debug) {
            log('Next Round')
        }
        
        round++;
        marker.set({ name: 'Round ' + round});


        if(state[combatState].config.announcements.announceRound){
            let text = '<span style="font-size: 12pt; font-weight: bold;">'+marker.get('name')+'</span>';
            makeAndSendMenu(text, ' ');
        }

        if(initiative.rollEachRound){
            log('Rolling Each Round')
            let turnorder = getTurnorder();
            clearTurnorder();
            checkMarkerturn(marker)
            rollInitiative(turnorder.map(t => { return (t.id) ? { _type: 'graphic', _id: t.id } : false }), initiative);
            doTurnorderChange()
        }else{
            nextTurn();
            if(state[combatState].config.turnorder.sortTurnOrder){
                sortTurnorder();
            }
        }
    },

    getCurrentTurn = function () {
        return getTurnorder().shift();
    },

    getNextTurn = function () {
        let returnturn;
        getTurnorder().every((turn, i) => {
            if(i > 0 && turn.id !== '-1' && turn.id !== getOrCreateMarker().get('id')){
                returnturn = turn;
                return false;
            }else return true
        });
        return returnturn;
    },
    
    getVeryNextTurn = function () {
        let turnorder, turn;
        turnorder = getTurnorder();
        turn = turnorder.shift()
        turn = turnorder.shift()
        return turn;
    },  
    
    prevRound = function () {
        let marker = getOrCreateMarker();
        round--;
        marker.set({ name: 'Round ' + round});

        if(state[combatState].config.announcements.announceRound){
            let text = '<span style="font-size: 16pt; font-weight: bold;">'+marker.get('name')+'</span>';
            makeAndSendMenu(text);
        }

        previousTurn();
    },
//*************************************************************************************************************
//TIMER 
//*************************************************************************************************************	
    startTimer = function (token) {
        let timer = state[combatState].config.timer,
            config_time = parseInt(timer.time),
            time = config_time;

        paused = false;
        
        clearInterval(intervalHandle);
        
        if(timerObj) timerObj.remove();


        if(token && timer.showTokenTimer){
            timerObj = createObj('text', {
                text: 'Timer: ' + time,
                font_size: timer.timerFontSize,
                font_family: timer.timerFont,
                color: timer.timerFontColor,
                pageid: token.get('pageid'),
                layer: 'gmlayer'
            });
        }

        intervalHandle = setInterval(() => {
            if(paused) return;

            if(timerObj && timer.showTokenTimer) timerObj.set({
                top: token.get('top')+token.get('width')/2+40,
                left: token.get('left'),
                text: 'Timer: ' + time,
                layer: token.get('layer')
            });

            if(state[combatState].config.timer.sendTimerToChat && (time === config_time || config_time/2 === time || config_time/4 === time || time === 10 || time === 5)){
                makeAndSendMenu('', 'Time Remaining: ' + time);
            }

            if(time <= 0){
                if(timerObj) timerObj.remove();
                clearInterval(intervalHandle);
                if(timer.skipTurn) nextTurn();
                else if(token.get('layer') !== 'gmlayer') makeAndSendMenu(token.get('name') + "'s time ran out!", '');
            }

            time--;
        }, 1000);
    },

    stopTimer = function () {
        clearInterval(intervalHandle);
        if(timerObj) timerObj.remove();
    },

    pauseTimer = function () {
        paused = !paused;
    },
//*************************************************************************************************************
//ANNOUNCE 
//*************************************************************************************************************	  
    announcePlayer = function (tokenObj, prev, delay=false, show) {
        if (debug) {
            log('Announce Player')
        }

        let name        = tokenObj.get('name');
        let imgurl      = tokenObj.get('imgsrc');
        let conditions  = getAnnounceConditions(tokenObj, prev, delay, show);
        let image       = (imgurl) ? '<img src="'+imgurl+'" width="50px" height="50px"  />' : ''
        name            = (state[combatState].config.announcements.handleLongName) ? handleLongString(name) : name
        
        let title         = 'Next Player Up'
        let doneButton    = makeImageButton('!cmaster --turn,next',doneImage,'Done with Round','transparent',18,'white')
        let delayButton   = makeImageButton('!cmaster --turn,delay',delayImage,'Delay your Turn','transparent',18, 'white');
        
        if (!show) {
            title   += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+doneButton+'</div>'
            title   += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+delayButton+'</div>'
        }

        let contents    = '<div style="display:inline-block;vertical-aligh:middle">'+image+'</div>'
        
        if (!show) {
            contents   += '<div style="display:inline-block;vertical-aligh:middle">'+name+'\'s Turn</div>'
        } else {
            contents   += '<div style="display:inline-block;vertical-aligh:middle">'+name+'</div>'
        }
        
        contents += conditions
        
        let characterObj = getObj('character', tokenObj.get('represents')) 

        if (characterObj) {
            let controlledBy = characterObj.get('controlledby')
            let players      = controlledBy.split(",")        
        
            if (state[combatState].config.status.userChanges) {
                if (players.length > 1) {
                    let playerObj, displayName
                    players.forEach((playerID) => {
                        playerObj = getObj('player', playerID)
                        if (playerObj) {
                            displayName = playerObj.get('displayname')
                            sendMainMenu(displayName)
                        }    
                    })
                }            
            }   
            
            if (state[combatState].config.announcements.announceTurn) {
                let target
                if (players[0] != "") {
                    target = (state[combatState].config.announcements.whisperToGM) ? 'gm' : ''
                } else {
                    target = (!state[combatState].config.announcements.showNPCTurns) ? 'gm' : ''
                }    
                makeAndSendMenu(contents,title,target);
            }   
        }
    },

    getAnnounceConditions = function (tokenObj, prev, delay, show) {
        if (debug) {
            log('Announce Condition') 
        }
        
        let removeButton
        let descriptionButton
        let removed = false
        let output = '<div>'
        
        if (state[combatState].conditions) {
            [... state[combatState].conditions].forEach(condition => {
                if (condition.id ==  tokenObj.get("_id")) {
                    if (debug) {
                        log('Condition:' + condition.key)
                        log('Duration:'  + condition.duration)
                        log('Direction:' + condition.direction)
                        log('Delay:'     + delay)
                        log('Prev:'      + prev)
                        log('Show:'      + show)
                    }            
                    log(condition)
                    descriptionButton = makeButton(condition.name, '!cmaster --show,description,key='+condition.key) 
                    
                    if (!delay && !show) {
                        if (!prev) {
                            condition.duration = condition.duration + condition.direction
                        } else {
                            condition.duration = condition.duration - condition.direction
                        }
                    }    
                    
                    if (condition.duration <= 0 && condition.direction != 0) {
                        output += '<div style="display:inline-block;"><strong>'+descriptionButton+'</strong> removed</div>';
                        if (!delay && !show) {
                            removeConditionFromToken(tokenObj, condition.key);  
                            doRemoveConditionCalls(tokenObj,condition.key)
                            removed = true
                        }    
                    } else if (condition.duration > 0 && condition.direction != 0) {
                        output += '<div style="display:inline-block;"><strong>'+descriptionButton+'</strong> '+condition.duration+' Rounds Left</div>';

                        if (!delay && !show) {
                            addConditionToToken(tokenObj,condition.key,condition.duration,condition.direction,condition.message)
                        }   
                        if (condition.message != 'None' && condition.message.length > 0) {
                            output += '<div style="display:inline-block;"><strong>Message: </strong>'+condition.message + '</div>';
                        }    
                    } else if (condition.direction == 0) {
                        output += '<div style="display:inline-block;"><strong>'+descriptionButton+'</strong> '+condition.duration+' Permanent</div>';
                        if (condition.message != 'None' && condition.message.length > 0) {
                            output += '<div style="display:inline-block;"<strong>Message: </strong> '+condition.message+ '</div>';
                        }    
                    }
                    
                    if (!removed) {
                        removeButton  = makeImageButton('!cmaster --remove,condition='+condition.key+',id='+tokenObj.get("_id"),deleteImage,'Remove Condition','transparent',18)
                        output += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+removeButton+'</div>'
                    }
                }    
            })
        }  
        output += '</div>'
 
        return output;
    },    
//*************************************************************************************************************
//MAKES 
//*************************************************************************************************************	
    makeAndSendMenu = function (contents, title, whisper) {
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
		title = makeTitle(title)
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>', null, {noarchive:true});
    },

	makeTitle = function (title) {
		return '<div style="'+styles.title+'"><span style='+styles.titleText+'>'+title+'</span></div>'
	},
	
    makeBigButton = function (title, href) {
        return '<div style="'+styles.bigButton+'"><a style="'+styles.bigButtonLink+'" href="'+href+'">'+title+'</a></div>';
    },

	makeButton = function (title, href) {
        return '<a style="'+styles.conditionButton+'" href="'+href+'">'+title+'</a>';
    },

	makeTextButton = function (label, value, href) {
        return '<span style="'+styles.textLabel+'">'+label+'</span><a style="'+styles.textButton+'" href="'+href+'">'+value+'</a>';
    },

    makeImageButton = function(command, image, toolTip, backgroundColor,size,color){
        if (!color) {
            color = 'black'
        }
        return '<div style="display:inline-block;margin-right:3px;padding:1px;vertical-align:middle;"><a href="'+command+'" title= "'+toolTip+'" style="margin:0px;padding:0px;border:0px solid;background-color:'+backgroundColor+'"><span style="color:'+color+';padding:0px;font-size:'+size+'px;font-family: \'Pictos\'">'+image+'</span></a></div>'
    },
	
    makeList = function (items, backButton, extraButton) {
        let list;
        
        list  = '<ul style="'+styles.reset + styles.list + styles.overflow+'">'
		items.forEach((item) => {
            list += '<li style="'+styles.overflow+'">'+item+'</li>';
        });
		list += '</ul>'
		
		if (extraButton) {
			list += extraButton
		}
		if(backButton) {
			list += '<hr>'+backButton;
		}
        return list;
    },    
//*************************************************************************************************************
//ICONS 
//*************************************************************************************************************	        
    getDefaultIcon = function (iconType, icon, style='', height, width) {
        if (iconType == 'None') {
            return 'None'
        }
        
        let installed = verifyInstalls(iconType)
        
        if (iconType == 'Token Marker' && installed) {
            return libTokenMarkers.getStatus(icon).getHTML(1.7);
        } else if (iconType == 'Combat Master') {   
            let X = '';
            let iconStyle = ''
            let iconSize = ''
    
            if(typeof icon_image_positions[icon] === 'undefined') return false;
    
            if (width) {
                iconStyle += 'width: '+width+'px;height: '+height+'px;';
            } else {
                iconStyle += 'width: 24px; height: 24px;';
            }      
            
            if(Number.isInteger(icon_image_positions[icon])){
                iconStyle += 'background-image: url(https://roll20.net/images/statussheet.png);'
                iconStyle += 'background-repeat: no-repeat;'
                iconStyle += 'background-position: -'+icon_image_positions[icon]+'px 0;'
            }else if(icon_image_positions[icon] === 'X'){
                iconStyle += 'color: red; margin-right: 0px;';
                X = 'X';
            }else{
                iconStyle += 'background-color: ' + icon_image_positions[icon] + ';';
                iconStyle += 'border: 1px solid white; border-radius: 50%;'
            }
    
            iconStyle += style;
    
            return '<div style="vertical-align:middle;'+iconStyle+'">'+X+'</div>';
        } else if (iconType == 'Token Condition') {
            return '<b>TC </b> '
        }    
    },
    
    getTokenMarkers = function () {
        return libTokenMarkers.getOrderedList();
    },    
 
    findIcon = function (icon) {
        markers.forEach((marker) => {
            if (marker.name == icon) {
                return marker.url
            }
        })
    },

    getIconTag = function (iconType,iconName) {
        if (debug) {
            log('Get Icon Tag')
            log('Icon Type:' + iconType)
            log('Icon Name:' + iconName)
        }
        
        let installed = verifyInstalls(iconType)
        if (!installed) {
            return
        }
        
        
        let iconTag = null
        if (iconType == 'Token Marker') {
            iconTag = libTokenMarkers.getStatus(iconName).getTag()
        } else if (iconType == 'Combat Master') {
            iconTag = iconName
        }    
        
        if (debug) {
            log('Icon Tag:' + iconTag)
        }  
        
        return iconTag
    },
    
    verifyInstalls = function(iconType) {
        if (iconType == 'Token Marker' && 'undefined' == typeof libTokenMarkers) {
            makeAndSendMenu('libTokenMarker API must be installed if using Custom Icons.', '', 'gm');
            return false
        } else if (iconType == 'Token Condition' && 'undefined' == typeof TokenCondition) {
            makeAndSendMenu('Token Condition API must be installed if using Token Condition.', '', 'gm');
            return false
        }       
        return true
    },
    
//*************************************************************************************************************
//EXTERNAL CALLS 
//*************************************************************************************************************
    doRoundCalls = function () {
        if (debug) {
            log("Do Turnorder External Calls")
        }
        
        let config     = state[combatState].config.turnorder 
        let turnorder  = getTurnorder()
        let tokenObj, characterObj, macro
        
        turnorder.forEach((turn) => {
            if (turn.id !== getOrCreateMarker().get('id')) {
                tokenObj     = getObj('graphic',turn.id)
                characterObj = getObj('character',tokenObj.get('represents'))

                if (characterObj) {
                    if (!['None',''].includes(config.allRoundMacro)) {
                        macro = getMacro(tokenObj, config.allRoundMacro)
                        sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                    }
                    log(characterObj.get('controlledby').length)
                    if ( !['None',''].includes(config.characterRoundMacro) && characterObj.get('controlledby') != '') {
                        macro = getMacro(tokenObj, config.characterRoundMacro)
                        sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                    }
                    if (!['None',''].includes(config.roundAPI)) {
                        sendCalltoChat(tokenObj,characterObj,config.roundAPI)
                    }
                    if (!['None',''].includes(config.roundRoll20AM)) {
                        sendCalltoChat(tokenObj,characterObj,config.roundRoll20AM)
                    }          
                    if (!['None',''].includes(config.roundFX)) {
                        doFX(tokenObj,config.roundFX)
                    }                     
                }
            }
        });
    },
 
    doTurnCalls = function (tokenObj) {
        if (debug) {
            log("Do Turn External Calls")
        }
        
        let config = state[combatState].config.turnorder
        let characterObj = getObj('character',tokenObj.get('represents'));
        let key, condition, ability, macro
        
        if (characterObj) {
            if (!['None',''].includes(config.turnMacro)) {
                ability = findObjs({_characterid:tokenObj.get('represents'), _type:'ability', name:config.turnMacro})[0]
                if (ability) {
                    sendCalltoChat(tokenObj,characterObj,ability.get('action'))
                } else {
                    macro = findObjs({_type:'macro', name:config.turnMacro})[0]
                    if (macro) {
                        sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                    }                    
                }
            }
            for (key in state[combatState].conditions) {
                condition = state[combatState].conditions[key]
                if (tokenObj.get('_id') == condition.id && condition.addPersistentMacro) {
                    ability = findObjs({_characterid:tokenObj.get('represents'), _type:'ability', name:condition.addPersistentMacro})[0]
                    if (ability) {
                        sendCalltoChat(tokenObj,characterObj,ability.get('action'))
                    } else {
                        macro = findObjs({_type:'macro', name:condition.addPersistentMacro})[0]
                        if (macro) {
                            sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                        }                    
                    }
                }
            }
            if (!['None',''].includes(config.turnAPI)) {
                sendCalltoChat(tokenObj,characterObj,config.turnAPI)
            }
            if (!['None',''].includes(config.turnRoll20AM)) {
                sendCalltoChat(tokenObj,characterObj,config.roundRoll20AM)
            }          
            if (!['None',''].includes(config.turnFX)) {
                doFX(tokenObj,config.turnFX)
            }                     
        }
    },
 
    doAddConditionCalls = function (tokenObj,key,playerID) {
        if (debug) {
            log("Do Add Condition Calls")
        }

        let condition = getConditionByKey(key)
        if (!condition) {
            return
        }
        
        let characterObj = getObj('character',tokenObj.get('represents'));
        let macro
        
        if (characterObj) {
            if (!['None',''].includes(condition.addMacro)) {
                macro = findObjs({_type:'macro', name:condition.addMacro})[0]
                if (macro) {
                    sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                }   
            }
            if (!['None',''].includes(condition.addPersistentMacro)) {
                macro = findObjs({_type:'macro', name:condition.addPersistentMacro})[0]
                if (macro) {
                    sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                }    
            }            
            if (!['None',''].includes(condition.addAPI)) {
                sendCalltoChat(tokenObj,characterObj,condition.addAPI)
            }
            if (!['None',''].includes(condition.addRoll20AM)) {
                sendCalltoChat(tokenObj,characterObj,condition.addRoll20AM)
            }    
            if (!['None',''].includes(condition.addFX)) {
                doFX(tokenObj,condition.addFX)
            }  
        }
    },
  
    doRemoveConditionCalls = function (tokenObj,key) {
        if (debug) {
            log("Do Remove Condition Calls")
        }
        
        let condition = getConditionByKey(key)
        if (!condition) {
            return
        }
        
        let characterObj = getObj('character',tokenObj.get('represents'));
        let macro
        
        if (characterObj) {
            if (!['None',''].includes(condition.remMacro)) {
                macro = findObjs({_type:'macro', name:condition.remMacro})[0]
                if (macro) {
                    sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                }   
            }
            if (!['None',''].includes(condition.remAPI)) {
                sendCalltoChat(tokenObj,characterObj,condition.remAPI)
            }
            if (!['None',''].includes(condition.remRoll20AM)) {
                sendCalltoChat(tokenObj,characterObj,condition.remRoll20AM)
            }    
            if (!['None',''].includes(condition.remFX)) {
                doFX(tokenObj,condition.remFX)
            }                       
        }
    },    

    sendCalltoChat = function(tokenObj,characterObj,action) {
        if (debug) {
            log("sendCalltoChat")
            log('Token:'+tokenObj.get('_id'))
            log('Character:'+characterObj.get('name'))
        }
        log(action)
        let substitutions = state[combatState].config.macro.substitutions
        let replaceString
        
        if (substitutions) {
            substitutions.forEach((substitution) => {
                replaceString = new RegExp(substitution.action, "g");                
                if (substitution.type == 'CharName') {
                    action = action.replace(replaceString, characterObj.get('name'), 'g');  
                } else if (substitution.type == 'CharID') {
                    action = action.replace(replaceString, characterObj.get('_id'), 'g')
                } else if (substitution.type == 'TokenID') {
                    action = action.replace(replaceString, tokenObj.get('_id'), 'g')
                } else if (substitution.type == 'PlayerID') {
                    action = action.replace(replaceString, state[combatState].config.gmPlayerID, 'g')
                }                  
            })
        } 
        log(action)
        sendChat(tokenObj.get('name'), action, null, {noarchive:true});
    },
    
    doFX = function (tokenObj, fx) {
        if(tokenObj.get('layer') === 'gmlayer') return;

        let pos = {x: tokenObj.get('left'), y: tokenObj.get('top')};
        spawnFxBetweenPoints(pos, pos, fx, tokenObj.get('pageid'));
    },
    
    getMacro = function(tokenObj, name) {
        let macro = findObjs({_characterid:tokenObj.get('represents'), _type:'ability', name:name})[0]
        if (!action) {
            macro = findObjs({_type:'macro', name:config.turnMacro})[0]
        }    
        return macro
    },    
    
//*************************************************************************************************************
//SUBSTITUTIONS 
//*************************************************************************************************************	   
    newSubstitution = function(cmdDetails) {
        if (debug) {
            log('Add Substitution')
        }
        
        let substitution = {
            type: cmdDetails.details.type,
            action: cmdDetails.details.action
        }
        
        state[combatState].config.macro.substitutions.push(substitution)
        log(state[combatState].config.macro.substitutions)
		sendMacroMenu();		
    },  
    
    removeSubstitution = function(cmdDetails) {
        if (debug) {
            log('Remove Substitution')
        }
        
        state[combatState].config.macro.substitutions.forEach((substitution, i) => {
            if (substitution.action == cmdDetails.details.action) {
                state[combatState].config.macro.substitutions.splice(i,1)
            }
        })
		sendMacroMenu();
    },      
     
    inFight = function () {
        return (Campaign().get('initiativepage') !== false);
    },
    
    updatePR = function (turn, modifier) {
        let turnorder = getTurnorder();

        turnorder.forEach((t, i) => {
            if(turn.id === t.id && turn.custom === t.custom){
                turnorder[i].pr = parseInt(t.pr) + modifier;
            }
        });

        setTurnorder(turnorder);
    },

    
    handleLongString = function (str, max=8) {
        str = str.split(' ')[0];
        return (str.length > max) ? str.slice(0, max) + '...' : str;
    },


    stopRotate = function () {
        clearInterval(rotationInterval);
    },

    randomBetween = function (min, max) {
        return Math.floor(Math.random()*(max-min+1)+min);
    },

    handeIniativePageChange = function (obj,prev) {
        if((obj.get('initiativepage') !== prev.initiativepage && !obj.get('initiativepage'))){
            stopCombat();
        }
    },

    observeTokenChange = function(handler){
        if(handler && _.isFunction(handler)){
            observers.tokenChange.push(handler);
        }
    },

    notifyObservers = function(event,obj,prev){
        _.each(observers[event],function(handler){
            handler(obj,prev);
        });
    },

    handleGraphicMovement = function (obj /*, prev */) {
        if (debug) {
            log ('Handle Graphic Movement')
        } 
 
        if(!inFight()) return;
        
        let turnorder =  getTurnorder()

        if (obj.hasOwnProperty("id") && turnorder.length > 0) {
            if(getCurrentTurn().id === obj.get('id')){
                changeMarker(obj);
            }
        }    
    },

    handleShapedSheet = function (characterid, condition, add) {
        if (debug) {
            log ('Handle Shaped Sheet Change')
        } 
        let character = getObj('character', characterid);
        if(character){
            let sheet = getAttrByName(character.get('id'), 'character_sheet', 'current');
            if(!sheet || !sheet.toLowerCase().includes('shaped')) return;
            if(!shaped_conditions.includes(condition)) return;

            let attributes = {};
            attributes[condition] = (add) ? '1': '0';
            setAttrs(character.get('id'), attributes);
        }
    },

    //return an array of objects according to key, value, or key and value matching
    getObjects = function (obj, key, val) {
        var objects = [];
        for (var i in obj) {
            if (!obj.hasOwnProperty(i)) continue;
            if (typeof obj[i] == 'object') {
                objects = objects.concat(getObjects(obj[i], key, val));    
            } else 
            //if key matches and value matches or if key matches and value is not passed (eliminating the case where key matches but passed value does not)
            if (i == key && obj[i] == val || i == key && val == '') { //
                objects.push(obj);
            } else if (obj[i] == val && key == ''){
                //only add if the object is not already in the array
                if (objects.lastIndexOf(obj) == -1){
                    objects.push(obj);
                }
            }
        }
        return objects;
    },

    
    esRE = function (s) {
        var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
        return s.replace(escapeForRegexp,"\\$1");
    },

    HE = (function(){
        var entities={
                //' ' : '&'+'nbsp'+';',
                '<' : '&'+'lt'+';',
                '>' : '&'+'gt'+';',
                "'" : '&'+'#39'+';',
                '@' : '&'+'#64'+';',
                '{' : '&'+'#123'+';',
                '|' : '&'+'#124'+';',
                '}' : '&'+'#125'+';',
                '[' : '&'+'#91'+';',
                ']' : '&'+'#93'+';',
                '"' : '&'+'quot'+';'
            },
            re=new RegExp('('+_.map(_.keys(entities),esRE).join('|')+')','g');
        return function(s){
            return s.replace(re, function(c){ return entities[c] || c; });
        };
    }()),
    
    ucFirst = function (string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    },
    
    buildParty = function(){
		var partyList = '|All,all';
        _.each(findObjs({type:'player'}),player=>{
            let who = getObj('player', player.id).get('displayname');
            if (playerIsGM(player.id)){
              who = 'gm'
            }            
            partyList += '|'+who+','+who
        });
        return partyList;
    },

    setDefaults = function (reset) {
        let key, condition   
        
        if (debug) {
            log ('Set Defaults')
        }
        
        const combatDefaults = {
            conditions: [],
			config: {
                command: 'cmaster',		
				duration: false,
				favorite: false,
				previousPage: null,			
				gmPlayerID: null,
				initiative: {
                    rollInitiative: 'CombatMaster',
                    initiativeDie: 20,
					initiativeAttributes: 'initiative_bonus',					
                    showInitiative: false,
                    rollEachRound: false,
                    apiTargetTokens: 'None'				
				},
                turnorder: {
                    useMarker: true,
					markerType: 'External URL',
					externalMarkerURL: 'https://s3.amazonaws.com/files.d20.io/images/52550079/U-3U950B3wk_KRtspSPyuw/thumb.png?1524507826',
					nextMarkerType: 'External URL',
					nextExternalMarkerURL: 'https://s3.amazonaws.com/files.d20.io/images/66352183/90UOrT-_Odg2WvvLbKOthw/thumb.png?1541422636',
					tokenMarkerName: 'None',
					tokenMarkerURL: null,
					nextTokenMarkerName: 'None',
					nextTokenMarkerURL: null,
	                sortTurnOrder: true,
					centerToken: true,	
					turnAPI: 'None',
					turnRoll20AM: 'None',
					turnFX: 'None',
                    turnMacro: 'None',
					roundAPI: 'None',
					roundRoll20AM: 'None',
					roundFX: 'None',
					roundMacro: 'None',	
					characterRoundMacro: 'None',
					allRoundMacro: 'None',					
                },
                timer: {
                    useTimer: true,
                    time: 120,
                    skipTurn: true,
                    sendTimerToChat: true,
                    showTokenTimer: true,
                    timerFont: 'Candal',
                    timerFontSize: 16,
                    timerFontColor: 'rgb(255, 0, 0)'
                },
                announcements: {
                    announceTurn: true,
                    whisperToGM: false,
                    announceRound: true,
                    handleLongName: true,
					showNPCTurns: false,                    
                },
                macro: {
                    substitutions: [],
                },				
				status: {
					userAllowed: false,
					userChanges: false,
					sendOnlyToGM: false,
					sendConditions: true,
					clearConditions: false,
					showConditions: 'all',
					useMessage: false,
				},	
			    conditions: {
					blinded: {
						name: 'Blinded',
						key: 'blinded',
						description: '<p>A blinded creature cannot see and automatically fails any ability check that requires sight.</p> <p>Attack rolls against the creature have advantage, and the creature making Attack rolls have disadvantage.</p>',
						icon: 'bleeding-eye',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',
					},
					charmed: {
						name: 'Charmed',
						key: 'charmed',
						description: "<p>A charmed creature can't Attack the charmer or target the charmer with harmful Abilities or magical effects.</p> <p>The charmer has advantage on any ability check to interact socially with the creature.</p>",
						icon: 'broken-heart',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',
					},
					deafened: {
						name: 'Deafened',
						key: 'deafened',
						description: "<p>A deafened creature can't hear and automatically fails any ability check that requires hearing.</p>",
						icon: 'edge-crack',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',
					},
					frightened: {
						name: 'Frightened',
						key: 'frightened',
						description: "<p>A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.</p> <p>The creature can't willingly move closer to the source of its fear.</p>",
						icon: 'screaming',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',
					},
					grappled: {
						name: 'Grappled',
						key: 'grappled',
						description: "<p>A grappled creature's speed becomes 0, and it canÃ¢â‚¬â„¢t benefit from any bonus to its speed.</p> <p>The condition ends if the Grappler is <i>incapacitated</i>.</p> <p>The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.</p>",
						icon: 'grab',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',					
					},
					incapacitated: {
						name: 'Incapacitated',
						key: 'incapacitated',
						description: "<p>An incapacitated creature can't take actions or reactions.</p>",
						icon: 'interdiction',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',						
					},
					inspiration: {
						name: 'Inspiration',
						key: 'inspiration',
						description: "<p>If you have inspiration, you can expend it when you make an Attack roll, saving throw, or ability check. Spending your inspiration gives you advantage on that roll.</p> <p>Additionally, if you have inspiration, you can reward another player for good roleplaying, clever thinking, or simply doing something exciting in the game. When another player character does something that really contributes to the story in a fun and interesting way, you can give up your inspiration to give that character inspiration.</p>",
						icon: 'black-flag',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					invisibility: {
						name: 'Invisibility',
						key: 'invisibility',
						description: "<p>An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves.</p> <p>Attack rolls against the creature have disadvantage, and the creature's Attack rolls have advantage.</p>",
						icon: 'ninja-mask',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					paralyzed: {
						name: 'Paralyzed',
						key: 'paralyzed',
						description: "<p>A paralyzed creature is <i>incapacitated</i> and can't move or speak.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>",
						icon: 'pummeled',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					petrified: {
						name: 'Petrified',
						key: 'petrified',
						description: "<p>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</p> <p>The creature is <i>incapacitated</i>, can't move or speak, and is unaware of its surroundings.</p> <p>Attack rolls against the creature have advantage.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>The creature has Resistance to all damage.</p> <p>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</p>",
						icon: 'frozen-orb',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					poisoned: {
						name: 'Poisoned',
						key: 'poisoned',
						description: '<p>A poisoned creature has disadvantage on Attack rolls and Ability Checks.</p>',
						icon: 'chemical-bolt',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					prone: {
						name: 'Prone',
						key: 'prone',
						description: "<p>A prone creature's only Movement option is to crawl, unless it stands up and thereby ends the condition.</p> <p>The creature has disadvantage on Attack rolls.</p> <p>An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.</p>",
						icon: 'back-pain',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					restrained: {
						name: 'Restrained',
						key: 'restrained',
						description: "<p>A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.</p> <p>Attack rolls against the creature have advantage, and the creature's Attack rolls have disadvantage.</p> <p>The creature has disadvantage on Dexterity saving throws.</p>",
						icon: 'fishing-net',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					stunned: {
						name: 'Stunned',
						key: 'stunned',
						description: "<p>A stunned creature is <i>incapacitated</i>, can't move, and can speak only falteringly.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p>",
						icon: 'fist',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},
					unconscious: {
						name: 'Unconscious',
						key: 'unconscious',
						description: "<p>An unconscious creature is <i>incapacitated</i>, can't move or speak, and is unaware of its surroundings.</p> <p>The creature drops whatever it's holding and falls prone.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>",
						icon: 'sleepy',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						addAPI: 'None',
						addRoll20AM: 'None',
						addFX: 'None',
						addMacro: 'None',
						addPersistentMacro: false,
						remAPI: 'None',
						remRoll20AM: 'None',
						remFX: 'None',
						remMacro: 'None',	
					},				
				},	
            },
        };

        
        if(!state[combatState].config || typeof state[combatState].config == 'undefined' || reset) {
            state[combatState].config = combatDefaults.config;
        } else {
		
            if(!state[combatState].config.hasOwnProperty('command')){
                state[combatState].config.command = combatDefaults.config.command;
            }
			if(!state[combatState].config.hasOwnProperty('favorite')){
				state[combatState].config.favorite = combatDefaults.config.favorite;
			}  			
			if(!state[combatState].config.hasOwnProperty('previousPage')){
				state[combatState].config.previousPage = combatDefaults.config.previousPage;
			}  
				
            if(!state[combatState].config.hasOwnProperty('initiative')){
                state[combatState].config.initiative = combatDefaults.config.initiative;
            } else {		
				if(!state[combatState].config.initiative.hasOwnProperty('initiativeAttributes')){
					state[combatState].config.initiative.initiativeAttributes = combatDefaults.config.initiative.initiativeAttributes;
				}			
                if(!state[combatState].config.initiative.hasOwnProperty('rollInitiative')){
                    state[combatState].config.initiative.rollInitiative = combatDefaults.config.initiative.rollInitiative;
                }
                if(!state[combatState].config.initiative.hasOwnProperty('initiativeDie')){
                    state[combatState].config.initiative.initiativeDie = combatDefaults.config.initiative.initiativeDie;
                }

                if(!state[combatState].config.initiative.hasOwnProperty('rollEachRound')){
                    state[combatState].config.initiative.rollEachRound = combatDefaults.config.initiative.rollEachRound;
                }
                if(!state[combatState].config.initiative.hasOwnProperty('apiTargetTokens')){
                    state[combatState].config.initiative.apiTargetTokens = combatDefaults.config.initiative.apiTargetTokens;
                }  
			}			
						
            if(!state[combatState].config.hasOwnProperty('turnorder')){
                state[combatState].config.turnorder = combatDefaults.config.turnorder;
            } else {
				if(!state[combatState].config.turnorder.hasOwnProperty('useMarker')){
					state[combatState].config.turnorder.useMarker = combatDefaults.config.turnorder.useMarker;
				}     
				if(!state[combatState].config.turnorder.hasOwnProperty('markerType')){
					state[combatState].config.turnorder.markerType = combatDefaults.config.turnorder.markerType;
				}  				
				if(!state[combatState].config.turnorder.hasOwnProperty('externalMarkerURL')){
					state[combatState].config.turnorder.externalMarkerURL = combatDefaults.config.turnorder.externalMarkerURL;
				}
				if(!state[combatState].config.turnorder.hasOwnProperty('nextMarkerType')){
					state[combatState].config.turnorder.nextMarkerType = combatDefaults.config.turnorder.nextMarkerType;
				}
				if(!state[combatState].config.turnorder.hasOwnProperty('nextExternalMarkerURL')){
					state[combatState].config.turnorder.nextExternalMarkerURL = combatDefaults.config.turnorder.nextExternalMarkerURL;
				}
				if(!state[combatState].config.turnorder.hasOwnProperty('tokenMarkerName')){
					state[combatState].config.turnorder.tokenMarkerName = combatDefaults.config.turnorder.tokenMarkerName;
				} 
				if(!state[combatState].config.turnorder.hasOwnProperty('tokenMarkerURL')){
					state[combatState].config.turnorder.tokenMarkerURL = combatDefaults.config.turnorder.tokenMarkerURL;
				} 				
				if(!state[combatState].config.turnorder.hasOwnProperty('nextTokenMarkerName')){
					state[combatState].config.turnorder.nextTokenMarkerName = combatDefaults.config.turnorder.nextTokenMarkerName;
				}	
				if(!state[combatState].config.turnorder.hasOwnProperty('nextTokenMarkerURL')){
					state[combatState].config.turnorder.nextTokenMarkerURL = combatDefaults.config.turnorder.nextTokenMarkerURL;
				}				
				if(!state[combatState].config.turnorder.hasOwnProperty('centerToken')){
					state[combatState].config.turnorder.centerToken = combatDefaults.config.turnorder.centerToken;
				}	
                if(!state[combatState].config.turnorder.hasOwnProperty('sortTurnOrder')){
                    state[combatState].config.turnorder.sortTurnOrder = combatDefaults.config.turnorder.sortTurnOrder;
                }	
                if(!state[combatState].config.turnorder.hasOwnProperty('turnAPI')){
                    state[combatState].config.turnorder.turnAPI = combatDefaults.config.turnorder.turnAPI;
                }		
                if(!state[combatState].config.turnorder.hasOwnProperty('turnRoll20AM')){
                    state[combatState].config.turnorder.turnRoll20AM = combatDefaults.config.turnorder.turnRoll20AM;
                }				
                if(!state[combatState].config.turnorder.hasOwnProperty('turnFX')){
                    state[combatState].config.turnorder.turnFX = combatDefaults.config.turnorder.turnFX;
                }
                if(!state[combatState].config.turnorder.hasOwnProperty('turnMacro')){
                    state[combatState].config.turnorder.turnMacro = combatDefaults.config.turnorder.turnMacro;
                }    
                 
                if(!state[combatState].config.turnorder.hasOwnProperty('roundAPI')){
                    state[combatState].config.turnorder.roundAPI = combatDefaults.config.turnorder.roundAPI;
                }		
                if(!state[combatState].config.turnorder.hasOwnProperty('roundRoll20AM')){
                    state[combatState].config.turnorder.roundRoll20AM = combatDefaults.config.turnorder.roundRoll20AM;
                }				
                if(!state[combatState].config.turnorder.hasOwnProperty('roundFX')){
                    state[combatState].config.turnorder.roundFX = combatDefaults.config.turnorder.roundFX;
                }
                if(!state[combatState].config.turnorder.hasOwnProperty('characterRoundMacro')){
                    state[combatState].config.turnorder.characterRoundMacro = combatDefaults.config.turnorder.characterRoundMacro;
                }     
                if(!state[combatState].config.turnorder.hasOwnProperty('allRoundMacro')){
                    state[combatState].config.turnorder.allRoundMacro = combatDefaults.config.turnorder.allRoundMacro;
                }          
            }
			
            if(!state[combatState].config.hasOwnProperty('timer')){
                state[combatState].config.timer = combatDefaults.config.timer;
            } else {
                if(!state[combatState].config.timer.hasOwnProperty('useTimer')){
                    state[combatState].config.timer.useTimer = combatDefaults.config.timer.useTimer;
                }
                if(!state[combatState].config.timer.hasOwnProperty('time')){
                    state[combatState].config.timer.time = combatDefaults.config.timer.time;
                }
                if(!state[combatState].config.timer.hasOwnProperty('skipTurn')){
                    state[combatState].config.timer.skipTurn = combatDefaults.config.timer.skipTurn;
                }
                if(!state[combatState].config.timer.hasOwnProperty('sendTimerToChat')){
                    state[combatState].config.timer.sendTimerToChat = combatDefaults.config.timer.sendTimerToChat;
                }
                if(!state[combatState].config.timer.hasOwnProperty('showTokenTimer')){
                    state[combatState].config.timer.showTokenTimer = combatDefaults.config.timer.showTokenTimer;
                }
                if(!state[combatState].config.timer.hasOwnProperty('timerFont')){
                    state[combatState].config.timer.timerFont = combatDefaults.config.timer.timerFont;
                }
                if(!state[combatState].config.timer.hasOwnProperty('timerFontSize')){
                    state[combatState].config.timer.timerFontSize = combatDefaults.config.timer.timerFontSize;
                }
                if(!state[combatState].config.timer.hasOwnProperty('timerFontColor')){
                    state[combatState].config.timer.timerFontColor = combatDefaults.config.timer.timerFontColor;
                }
            }
			
            if(!state[combatState].config.hasOwnProperty('announcements')){
                state[combatState].config.announcements = combatDefaults.config.announcements;
            } else {
                if(!state[combatState].config.announcements.hasOwnProperty('announceTurn')){
                    state[combatState].config.announcements.announceTurn = combatDefaults.config.announcements.announceTurn;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('whisperToGM')){
                    state[combatState].config.announcements.whisperToGM = combatDefaults.config.announcements.whisperToGM;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('announceRound')){
                    state[combatState].config.announcements.announceRound = combatDefaults.config.announcements.announceRound;
                }
                if(!state[combatState].config.announcements.hasOwnProperty('handleLongName')){
                    state[combatState].config.announcements.handleLongName = combatDefaults.config.announcements.handleLongName;
                }
				if(!state[combatState].config.announcements.hasOwnProperty('showNPCTurns')){
					state[combatState].config.announcements.showNPCTurns = combatDefaults.config.announcements.showNPCTurns;
				}                
			}

            if(!state[combatState].config.hasOwnProperty('macro')){
                state[combatState].config.macro = combatDefaults.config.macro;
            }
            
			if(!state[combatState].config.hasOwnProperty('status')) {
				state[combatState].config.status = combatDefaults.config.status;
			} else {
				if(!state[combatState].config.status.hasOwnProperty('userChanges')){
					state[combatState].config.status.userChanges = combatDefaults.config.status.userChanges;
				}
				if(!state[combatState].config.status.hasOwnProperty('sendOnlyToGM')){
					state[combatState].config.status.sendOnlyToGM = combatDefaults.config.status.sendOnlyToGM;
				}
				if(!state[combatState].config.status.hasOwnProperty('sendConditions')){
					state[combatState].config.status.sendConditions = combatDefaults.config.status.sendConditions;
				}           
				if(!state[combatState].config.status.hasOwnProperty('clearConditions')){
					state[combatState].config.status.clearConditions = combatDefaults.config.status.clearConditions;
				}      
				if(!state[combatState].config.status.hasOwnProperty('useMessage')){
				    log('use message')
					state[combatState].config.status.useMessage = combatDefaults.config.status.useMessage;
				}
				if(!state[combatState].config.status.hasOwnProperty('showConditions')){
					state[combatState].config.status.showConditions = combatDefaults.config.status.showConditions;
				}	
            }
        }
        
        if(!state[combatState].hasOwnProperty('conditions')){
            state[combatState].conditions = [];
        } 

        if(state[combatState].config.hasOwnProperty('conditions') && !reset){        
            for (key in state[combatState].config.conditions) {
                condition = getConditionByKey(key)
                if (!condition.hasOwnProperty('key')) {
                    condition.key = key
                }                
                if (!condition.hasOwnProperty('duration')) {
                    condition.duration = 1
                }
                if (!condition.hasOwnProperty('direction')) {
                    condition.direction = 0
                }
                if (!condition.hasOwnProperty('override')) {
                    condition.override = true
                }
                if (!condition.hasOwnProperty('favorite')) {
                    condition.favorite = false
                }
                if (!condition.hasOwnProperty('message')) {
                    condition.message = 'None'
                }
                if (!condition.hasOwnProperty('targeted')) {
                    condition.targeted = false
                }                
                if (!condition.hasOwnProperty('iconType')) {
                    condition.iconType = 'Combat Master'
                }   
                if (!condition.hasOwnProperty('addAPI')) {
                    condition.addAPI = 'None'
                }                  
                if (!condition.hasOwnProperty('addRoll20AM')) {
                    condition.addRoll20AM = 'None'
                }  
                if (!condition.hasOwnProperty('addFX')) {
                    condition.addFX = 'None'
                }      
                if (!condition.hasOwnProperty('addMacro')) {
                    condition.addMacro = 'None'
                }  
                if (!condition.hasOwnProperty('addPersistentMacro')) {
                    condition.addPersistentMacro = false
                }                  
                if (!condition.hasOwnProperty('remAPI')) {
                    condition.remAPI = 'None'
                }    
                if (!condition.hasOwnProperty('remRoll20AM')) {
                    condition.remRoll20AM = 'None'
                }  
                if (!condition.hasOwnProperty('remFX')) {
                    condition.remFX = 'None'
                }      
                if (!condition.hasOwnProperty('remMacro')) {
                    condition.remMacro = 'None'
                }  
            };
        } else if (!state[combatState].config.hasOwnProperty('conditions') || reset) {    
            state[combatState].config.conditions = combatDefaults.config.conditions;
        }
    },
    
    buildHelp = function () {
        let notes

        notes = '<h2>Combat Master (Version 1.0)</h2><br>'  
        notes += 'Combat Master is an API that helps manage a combat.  It can automatically roll initiative, marks the player currently active in the turn using a circular icon around the players token, centers the map on the active player, provides a timer for timed turns and enables quickly adding status conditions to the token.  It tracks the duration in rounds of that condition and automatically removes the condition when the condition is over.<br>'  
        notes += '<br>'
        notes += 'Combat Master has come from my prior work to combine Combat Tracker and Status Info by Robin Kuiper into a single script.  The changes in Combat Master include:<br>'
        notes +=' -	A new command syntax<br>'
        notes +=' -	A new and combined session state<br>'
        notes +=' -	Addition of Messages that remain with the condition so GMs can add special information to the condition that’s displayed<br>' 
        notes +=' -	Addition of call outs to various APIs to integrate and enhance the game experience<br>'
        notes += '<br>'
        notes += 'The largest change is integration with Macros and other APIs to provide flexibility:<br>' 
        notes +=' -	Group Init (The Aaron)<br>'
        notes +=' -	Token Mod (The Aaron)<br>'
        notes +=' -	Token Marker (The Aaron)<br>'
        notes +=' -	Token Conditions (surprise, The Aaron)<br>'
        notes +=' -	Roll20 Audio Master (Not The Aaron…this one is mine)<br>'
        notes += '<br>'
        notes +='To start configuring Combat Master, type !cmaster –main in chat and click the cog icon at the top.'
        notes += '<br>'

        notes += '<h2>Setup</h2><br>'  
        notes += '<b><i>There are too many configuration commands to list individually.  For those who want to edit Combat Master via macro, use the menus to the issue the command you want.  Go to the chat window and use the up-arrow key.  This will show the command that Combat Master last executed and you can copy it into a macro.</i></b><br>'  
        notes += '<br>'
        notes += '<b>Initiative</b> – Configure how Combat Master will roll Initiative<br>'
        notes += '<b>Turnorder</b> – Cconfigure how the turnorder is managed<br>'
        notes += '<b>Timer</b> – Configure a timer, length of turn time, and the display of the timer <br>'
        notes += '<b>Announce</b> – Configure how the player turn is announced in chat or if players can assigned their own conditions<br>' 
        notes += '<b>Status</b> – Configure how conditions are managed and displayed<br>'
        notes += '<b>Conditions</b> – a list of conditions where you can add a new condition or edit an existing<br>'
        notes += '<b>Export</b> – Export your conditions from one game so you can import into another.<br><i>NOTE: If migrating from Combat Master to another Combat Master it will copy the entire Combat Master configuration.  If coming from Combat Tracker,  it will only copy the conditions and you’ll have to reconfigure everything else.</i><br>' 
        notes += '<b>Import</b> – Import from another game<br>'
        notes += '<b>Reset</b> – This resets the entire session state.  It defaults the conditions to D&D 5e.<br>'
        notes += '<b>Back</b> – Return to Tracker Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Initiative</h2><br>'  
        notes += '<h3>No Initiative</h3><br>'  
        notes += 'Combat Master may be configured to not roll initiative.  Choose ‘None’ for Roll Initiative.  You can have each character roll initiative on his/her own.<br><br><i>NOTE: If you choose to not roll intiative from combat tracker, the turn order will need to be set before starting Combat Master.</i><br>'  
        notes += '<br>'
        notes += '<h3>Combat Master Initiative</h3><br>'  
        notes += 'Combat Master has its own initiative roller.  Choose ‘CombatMaster’, then configure the remaining information<br>'
        notes += '<br>'
        notes += '<b>Roll Each Round</b> will reroll initiative at the end of each round.  <br>'
        notes += '<b>Initiative Attribute</b> accepts a comma delimited list of attributes that make up initiative.  The attribute name must match the attribute names in the char sheet<br>'
        notes += '<b>Show Initiative in Chat</b> will display the initiative rolls in chat<br>' 
        notes += '<br>'
        notes += '<h3>Group Init Initiative</h3><br>'  
        notes += 'Choose Group-Init.  When choosing this, Group Initiative is called and builds the turnorder<br><i>NOTE: If you choose group-init, the API must be installed in your game and configured outside of Combat Master.</i>'
        notes += '<br>'
        notes += '<b>Roll Each Round</b> will reroll initiative at the end of each round. <br>'
        notes += '<b>Target Tokens</b> is a list of Token IDs that will be passed into Group Init. <br>' 
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Turnorder</h2><br>'  
        notes += 'Once Initiative is rolled, the turnorder object is created.  You configure what happens when stepping through the turnorder <br>'
        notes += '<br>'
        notes += '<b>Sort Turnorder</b> will sort the turnorder in descending sequence (only) once created  <br>'
        notes += '<b>Center Map on Token</b> will center the map on the token currently active in the turnorder.<Kbr><i>Note: there was an issue where centering the map on a token on the GMLAYER was exposing tokens that the GM wanted to hide.  This has been fixed.</i><br>'
        notes += '<b>Use Marker</b> determines if the marker is visible to players or always stays at the GM Layer<br>' 
        notes += '<b>Marker Type</b> is set to External URL (default) or can be set to Token Marker.  If Token Marker is selected a suitable token must be uploaded to your game<br>' 
        notes += '<b>Marker</b> is a thumbnail of what will be used to highlight the current active player<br>' 
        notes += '<b>Use Next Marker</b> if set to true will display another marker around the player that is next in the turnorder.  If set to false, then the next player up is not highlighted<br>' 
        notes += '<b>Next Marker</b> is a thumbnail of what will be used to highlight the next active player<br>' 
        notes += '<br>'
        notes += '<h3>Beginning of Each Round</h3><br>'  
        notes += 'Token Mod, Roll20 AM a Macro or an FX can be invoked at the beginning of each Round<br>'
        notes += '<b>API</b> will get invoked.  It must be a full TokeMmod command.  If you have any inline rolls the normal [[1d6]] must be replaced with [#[1d6]#].<br>'
        notes += '<b>Roll20AM</b> will get invoked.  It must be a full Roll20AM command.  All Commands will need to be bracketed using {{ and }} For Example:<br>' 
        notes += '{{!token-mod {{--ids tokenid}} {{--flip light_hassight}}}}<br>'
        notes += '<b>FX</b> will get invoked. It must be a valid FX <br>' 
        notes += '<b>Characters Macro</b> will get invoked. This requires OnMyTurn and uses a global macro substituting in all players characters on the map<br>' 
        notes += '<b>All Tokens Macro</b> will get invoked. This requires OnMyTurn and uses a global macro substituting in tokens on the map<br>' 
        notes += '<br>'
        notes += '<h3>Beginning of Each Turn</h3><br>'  
        notes += 'Token Mod, Roll20 AM a Macro or an FX can be invoked at the beginning of each Turn<br>'
        notes += '<b>API</b> will get invoked.  It must be a full TokeMmod command.  If you have any inline rolls the normal [[1d6]] must be replaced with [#[1d6]#].<br>'
        notes += '<b>Roll20AM</b> will get invoked.  It must be a full Roll20AM command. <br>' 
        notes += '<b>FX</b> will get invoked. It must be a valid FX <br>' 
        notes += '<b>Macro</b> will get invoked. This requires OnMyTurn and uses a global macro substituting in the current character in the turnorder<br>' 
        notes += '<br>'
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Timer</h2><br>'  
        notes += '<b>Turn Timer</b> setting to true turns on the timer.  The timer displays a second by second countdown under the current active token in turnorder <br>'
        notes += '<b>Time</b> determines the total time in seconds that the active token has to complete the turn<br>'
        notes += '<b>Skip Turn</b> will automatically advance to the next active token when the timer runs to 0<br>' 
        notes += '<b>Send To Chat</b> sends the timer coundown to chat<br>' 
        notes += '<b>Show On Token</b> displays the timer underneath the current active token<br>' 
        notes += '<b>Token Font</b> determines the font of the timer displayed underneath the current active token<br>' 
        notes += '<b>Token Font Size</b> determines the size of the font of the timer displayed underneath the current active token<br>' 
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Announce</h2><br>'  
        notes += '<b>Announce Rounds</b> sends a message to chat when a new round has started.<br>'
        notes += '<b>Announce Turns</b> sends the current active player in turnorder to chat, plus any conditions or messages assigned<br>'
        notes += '<b>Whisper To GM</b> sends Rounds and Turns only to GM<br>' 
        notes += '<b>Shorten Long Names</b> shortens the character name when sending the Turn to chat<br>' 
        notes += '<b>Show NPC Turns</b> determines if NPC turns are displayed to all players or GM only<br>' 
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Status</h2><br>'  
        notes += '<b>Whisper To GM</b> sends Condition Descriptions only to GM<br>' 
        notes += '<b>Player Allowed Changes</b> allows each player to assign their own conditions.  When this is turned on, the player active in the turnorder receives the Tracker Menu where they can add or remove conditions (only)<br>'
        notes += '<b>Send Changes to Chat</b> sends the Condition Description to Chat when a Condition is added to a token<br>'
        notes += '<b>Clear Conditions on Close</b> removes all Condition Icons from the token when the combat is stopped.  If this is turned off, the icons must be manually removed from the tokens<br>' 
        notes += '<b>Use Messages</b> enables messages to be included with conditions assigned to the token<br>' 
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Conditions</h2><br>'  
        notes += '<b>Cog Icon</b> enables editing an existing condition<br>' 
        notes += '<b>Add Condition</b> creates a new condition<br>'
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'

        notes +=  '<h2>Condition</h2><br>'  
        notes += '<b>Name</b> is the name of the Condition<br>' 
        notes += '<b>Icon Type</b> is set to Combat Master (default) or can be set to Token Marker.  If Token Marker is selected a suitable token must be uploaded to your game<br>' 
        notes += '<b>Icon</b> is a thumbnail of what will be used for the current condition<br>' 
        notes += '<b>Duration</b> defines the length of the Condition before being removed<br>' 
        notes += '<b>Direction</b> defines how quickly the duration is reduced each Round.  Set to a negative number to reduce the duration, positive number if it increases over time or 0.  If 0, it remains permanently on the token until removed<br>' 
        notes += '<b>Override</b> determines if the direction/durastion can be overriden when assigning the Condition to the token.  For spells that do not change, set override to false and the direction/duration roll queries do not display when assigning the Condition<br>' 
        notes += '<b>Favorites</b> determines if the Condition shows in the Favorites menu.  This can also be set on the Tracker Menu.  The Favorites menu shows a smaller number of Conditions<br>' 
        notes += '<b>Message</b> this is a default message that will show along with the condition.  It can be overidden when assigning the condition.  If you have commas in the description us brackets {{ and }} around it when entering it<br>' 
        notes += '<b>Descrip[tion</b> shows when the condition is assigned or when the player is announced. If you have commas within the description places brackets {{ and }} around it when entering it<br>' 
        notes += '<br>'
        notes += '<b>Adding Condition External Calls</b> which are invoked when a Condition is assigned to a Token<br>'
        notes += '<b>- API</b> will get invoked.  It must be a full TokeMmod command.  If you have any inline rolls the normal [[1d6]] must be replaced with [#[1d6]#].<br>'
        notes += '<b>- Roll20AM</b> will get invoked.  It must be a full Roll20AM command. <br>' 
        notes += '<b>- FX</b> will get invoked. It must be a valid FX <br>' 
        notes += '<b>- Macro</b> will get invoked. This requires OnMyTurn and uses a global macro substituting in the current character in the turnorder<br>' 
        notes += '<br>'     
        notes += '<b>Removing Condition External Calls</b> which are invoked when a Condition is removed from a Token<br>'
        notes += '<b>- API</b> will get invoked.  It must be a full TokeMmod command.  If you have any inline rolls the normal [[1d6]] must be replaced with [#[1d6]#].<br>'
        notes += '<b>- Roll20AM</b> will get invoked.  It must be a full Roll20AM command. <br>' 
        notes += '<b>- FX</b> will get invoked. It must be a valid FX <br>' 
        notes += '<b>- Macro</b> will get invoked. This requires OnMyTurn and uses a global macro substituting in the current character in the turnorder<br>' 
        notes += '<br>'                
        notes += '<b>Back</b> – Return to Setup Menu<br>'
        notes += '<br>'
            
        return notes
    },
    
    checkInstall = function () {
        if(!_.has(state, combatState)){
            state[combatState] = state[combatState] || {};
        }
        setDefaults();
        buildHelp();
        log(script_name + ' Ready! Command: !cmaster --main');
    },    
    
    registerEventHandlers = function() {
        on('chat:message', inputHandler);
        on('change:campaign:turnorder', handleTurnorderChange);
        on('change:graphic:statusmarkers', handleStatusMarkerChange);
        on('change:campaign:initiativepage', handeIniativePageChange);
        on('change:graphic:top', handleGraphicMovement);
        on('change:graphic:left', handleGraphicMovement);
        on('change:graphic:layer', handleGraphicMovement);

        if('undefined' !== typeof DeathTracker && DeathTracker.ObserveTokenChange){
            DeathTracker.ObserveTokenChange(function(obj,prev) {
                handleStatusMarkerChange(obj,prev);
            });
        }

        if('undefined' !== typeof InspirationTracker && InspirationTracker.ObserveTokenChange){
            InspirationTracker.ObserveTokenChange(function(obj,prev)  {
                handleStatusMarkerChange(obj,prev);
            });
        }
        
        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange) {             
            TokenMod.ObserveTokenChange(function(obj,prev) {
                handleStatusMarkerChange(obj,prev);
            });    
        }       
    };
    
    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        ObserveTokenChange: observeTokenChange,
        getConditions,
        getConditionByKey,
        sendConditionToChat,
        getDefaultIcon	
    };
})();

on('ready',function() {
    'use strict';

    CombatMaster.CheckInstall();
    CombatMaster.RegisterEventHandlers();
 	        
});
