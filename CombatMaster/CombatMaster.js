/* 
 * Version 2.22
 * Original By Robin Kuiper
 * Changes in Version 0.3.0 and greater by Victor B
 * Changes in this version and prior versions by The Aaron
 * Discord: Vic#5196H
 * Roll20: https://app.roll20.net/users/3135709/victor-b
 * Github: https://github.com/vicberg/CombatMaster
*/
var CombatMaster = CombatMaster || (function() {
    'use strict';

    let round = 1,
	    version = '2.22',
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
        sortConditionsImage = '0',
        holdImage = 'L',
        helpImage = 'i',
        conditionsImage = ':',
        spellsImage = 'C';
        
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
        background: 'background-color:lightgrey',
        buttonRight: 'display:inline-block;float:right;vertical-aligh:middle',
        announcePlayer: 'display:inline-block;vertical-aligh:middle',
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

        log(msg_orig)
        let status = state[combatState].config.status
        if (status.autoAddSpells) {
            if (status.sheet == 'OGL') {
                if (msg_orig && (msg_orig.rolltemplate && msg_orig.rolltemplate === 'spell') ) {
                    handleSpellCast(msg_orig)
                }
            } else if (status.sheet == 'Shaped')  {
                if (msg_orig && msg_orig.content.includes("{{spell=1}}")) {
                    handleSpellCast(msg_orig)
                }              
            } 
        }

        if (msg_orig.content.indexOf('!cmaster')!==0) {
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
	    cmdSep.action = String(tokens).match(/turn|show|config|back|reset|main|remove|add|new|delete|import|export|help|spell|ignore|clear/);
        //the ./ is an escape within the URL so the hyperlink works.  Remove it
        cmd.replace('./', '');

        //split additional command actions
	    _.each(String(tokens).replace(cmdSep.action+',','').split(','),(d) => {
            vars=d.match(/(who|next|main|previous|delay|start|stop|hold|timer|pause|show|all|favorites|setup|conditions|condition|sort|combat|turnorder|accouncements|timer|macro|status|list|export|import|type|key|value|setup|tracker|confirm|direction|duration|message|initiative|config|assigned|type|action|description|target|id|started|stopped|held|addAPI|remAPI|concentration|view|)(?:\:|=)([^,]+)/) || null;
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
	        log (cmdDetails.action)
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
        
        if (cmdDetails.action == 'main' || !cmdDetails.action){
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
                startCombat(msg.selected, who);
            }        
            if (cmdDetails.details.stop) {
                stopCombat(who);
            }  
            if (cmdDetails.details.hold) {
                holdCombat(who);
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
            if (cmdDetails.details.view) {
                editShowState(cmdDetails.details.value);
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
            if (cmdDetails.details.concentration) {
                sendConcentrationMenu()
            }             
            if (cmdDetails.details.conditions) {
                sendConditionsMenu()
            }   
            if (cmdDetails.details.export) {
                exportConditions()
            }      
            if (cmdDetails.details.condition) {
                if (cmdDetails.details.addAPI) {
                    sendConditionAddAPIMenu(cmdDetails.details.condition)
                } else if (cmdDetails.details.remAPI) {
                    sendConditionRemAPIMenu(cmdDetails.details.condition)
                } else {
                    sendConditionMenu(cmdDetails.details.condition)
                }    
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
        
        if (cmdDetails.action == 'spell') {
            if (cmdDetails.details.confirm) {
                addSpell(cmdDetails.details.key)    
            } else {
                ignoreSpell(cmdDetails.details.key)   
            }
        }
        
        if (cmdDetails.action == 'reset') {
			state[combatState] = {};
			setDefaults(true);
			sendMainMenu(who)
        }
        if (cmdDetails.action == 'ignore') {
			state[combatState].ignores = [];
			sendMainMenu(who)
        }  
        if (cmdDetails.action == 'clear') {
			clearTokenStatuses(msg.selected)
			sendMainMenu(who)
        }          
        if (cmdDetails.action == 'help') {
    		showHelp(cmdDetails)
        }        
	},

    clearTokenStatuses = function(selectedTokens) {
        let tokenObj
        selectedTokens.forEach(token => {    
            if (token._type == 'graphic') {
                tokenObj        = getObj('graphic', token._id)    
                if (tokenObj) {
                    tokenObj.set('statusmarkers', "")
                    log(tokenObj)
                }
            }
        })    
    },
    
//*************************************************************************************************************
//MENUS
//*************************************************************************************************************
    sendMainMenu = function(who) {
        if (debug) {
            log('Send Main Menu')
        }
        
        let nextButton          = makeImageButton('!cmaster --turn,next',nextImage,'Next Turn','transparent',18)
        let prevButton          = makeImageButton('!cmaster --turn,previous',prevImage,'Previous Turn','transparent',18)
        let stopButton          = makeImageButton('!cmaster --turn,stop --main',stopImage,'Stop Combat','transparent',18)
        let holdButton          = makeImageButton('!cmaster --turn,hold',holdImage,'Hold Combat','transparent',18)
        let startButton         = makeImageButton('!cmaster --turn,start --main',startImage,'Start Combat','transparent',18)
        let pauseTimerButton    = makeImageButton('!cmaster --turn,timer=pause',pauseImage,'Pause Timer','transparent',18)
        let stopTimerButton     = makeImageButton('!cmaster --turn,timer=stop',timerImage,'Stop Timer','transparent',18)
        let configButton        = makeImageButton('!cmaster --show,setup',backImage,'Show Setup','transparent',18)
        let showButton          = makeImageButton('!cmaster --show,assigned',showImage,'Show Conditions','transparent',18)
        let sortButton          = makeImageButton('!cmaster --turn,sort',sortImage,'Sort Turnorder','transparent',18)
        let helpButton
        
        if (state[combatState].config.hold.held) {
            helpButton          = makeImageButton('!cmaster --help,held',helpImage,'Help','transparent',18,'white')
        } else if (inFight() ) { 
            helpButton          = makeImageButton('!cmaster --help,started',helpImage,'Help','transparent',18,'white')
        } else {
            helpButton          = makeImageButton('!cmaster --help,stopped',helpImage,'Help','transparent',18,'white')
        }    
        let listItems           = []
        let titleText           = 'CombatMaster Menu<span style="'+styles.version+'"> ('+version+')</span>'+'<span style='+styles.buttonRight+'>'+helpButton+'</span>'
        let contents, key, condition, conditions, conditionButton, addButton, removeButton, favoriteButton, listContents, rowCount=1;

        if (state[combatState].config.hold.held) {
            contents = '<div style="background-color:yellow">'+startButton
        } else if (inFight() ) {
            contents = '<div style="background-color:green;width:100%;padding:2px;vertical-align:middle">'+stopButton + holdButton + prevButton + nextButton + pauseTimerButton + stopTimerButton + showButton + sortButton 
        } else {
            contents = '<div style="background-color:red">'+startButton
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
            } 
            if (state[combatState].config.status.showConditions == 'conditions') {
                if (condition.type == 'Condition') {
                    listItems.push(listContents);
                }
            } 
            if (state[combatState].config.status.showConditions == 'spells') {
                if (condition.type == 'Spell') {
                    listItems.push(listContents);
                }
            } 
            if (state[combatState].config.status.showConditions == 'all') {
                listItems.push(listContents);
            }
        }
        
        let viewButton = makeBigButton('Change View', '!cmaster --show,view,value=?{View|All,all|Conditions,conditions|Spells,spells|Favorites,favorites|} --main')

        state[combatState].config.previousPage = 'main'
        
        if (state[combatState].config.status.access && who != 'None') {
            let playerIDs = state[combatState].config.status.access.split(',');
            playerIDs.forEach((player) => {
                makeAndSendMenu(contents+makeList(listItems)+viewButton,titleText,player);    
            })
        }
        
        if (who == 'gm' || who == 'None') {
            makeAndSendMenu(contents+makeList(listItems)+viewButton,titleText,who);
        } else {
            makeAndSendMenu(makeList(listItems)+viewButton,titleText,who);
        }    
    },
    
    sortObject = function (obj) {
        return Object.keys(obj).sort().reduce(function (result, key) {
            result[key] = obj[key];
            return result;
        }, {});
    },    

    sendConfigMenu = function() {
		let configIntiativeButton       = makeBigButton('Initiative', '!cmaster --show,initiative')
	    let configTurnorderButton       = makeBigButton('Turnorder', '!cmaster --show,turnorder')
		let	configTimerButton           = makeBigButton('Timer', '!cmaster --show,timer')
		let	configAnnouncementsButton   = makeBigButton('Announce', '!cmaster --show,announce')
		let	configMacroButton           = makeBigButton('Macro & API', '!cmaster --show,macro')
		let	configConcentrationButton   = makeBigButton('Concentration', '!cmaster --show,concentration')
		let	configStatusButton          = makeBigButton('Status', '!cmaster --show,status')
		let	configConditionButton       = makeBigButton('Conditions', '!cmaster --show,conditions')
		let	exportButton                = makeBigButton('Export', '!cmaster --show,export')
		let	importButton                = makeBigButton('Import', '!cmaster --import,config=?{Config}')	
		let	resetButton                 = makeBigButton('Reset', '!cmaster --reset')
		let	ignoreButton                = makeBigButton('Remove Ignores', '!cmaster --ignore')
		let	clearButton                 = makeBigButton('Clear Token Statuses', '!cmaster --clear')
		let helpButton                  = makeImageButton('!cmaster --help,setup',helpImage,'Help','transparent',18,'white')
		let	backToTrackerButton         = makeBigButton('Back', '!cmaster --back,tracker')
		let	titleText                   = 'Setup'+'<span style='+styles.buttonRight+'>'+helpButton+'</span>'
		let	combatHeaderText            = '<div style="'+styles.header+'">Combat Setup</div>'
		let	statusHeadersText           = '<div style="'+styles.header+'">Status Setup</div>'
		let	resetHeaderText             = '<div style="'+styles.header+'">Reset CombatMaster</div>'	
		let	backToTrackerText           = '<div style="'+styles.header+'">Return</div>'	
		let contents	
		
	 	contents  = combatHeaderText
		contents += configIntiativeButton
		contents += configTurnorderButton			
		contents += configTimerButton
		contents += configAnnouncementsButton
		contents += configMacroButton
		contents += statusHeadersText 
		contents += configStatusButton
		contents += configConditionButton
		contents += configConcentrationButton
		contents += exportButton
		contents += importButton
		contents += resetHeaderText
		contents += resetButton
		contents += ignoreButton
		contents += clearButton
	    contents += backToTrackerText
	    contents += backToTrackerButton

        makeAndSendMenu(contents, titleText, 'gm');
    },

    sendInitiativeMenu = function() {
        const banner = makeBanner('initiative','Initiative','setup')
        let listItems  = []
        let initiative = state[combatState].config.initiative;
		
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

        makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');
    },

	sendTurnorderMenu = function() {
        const banner = makeBanner('turnorder','Turnorder','setup')
        let listItems = []
        let turnorder = state[combatState].config.turnorder

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

        makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');
    },
	
    sendTimerMenu = function() {
        const banner = makeBanner('timer','Timer','setup')
        let listItems = []
        let timer = state[combatState].config.timer

        listItems.push(makeTextButton('Turn Timer', timer.useTimer, '!cmaster --config,timer,key=useTimer,value='+!timer.useTimer + ' --show,timer'))
        
        if (timer.useTimer) {
            listItems.push(makeTextButton('Time', timer.time, '!cmaster --config,timer,key=time,value=?{Time|'+timer.time+'} --show,timer'))
            listItems.push(makeTextButton('Skip Turn', timer.skipTurn, '!cmaster --config,timer,key=skipTurn,value='+!timer.skipTurn + ' --show,timer'))
            listItems.push(makeTextButton('Send to Chat', timer.sendTimerToChat, '!cmaster --config,timer,key=sendTimerToChat,value='+!timer.sendTimerToChat + ' --show,timer'))
            listItems.push(makeTextButton('Show on Token', timer.showTokenTimer, '!cmaster --config,timer,key=showTokenTimer,value='+!timer.showTokenTimer + ' --show,timer'))
            listItems.push(makeTextButton('Token Font', timer.timerFont, '!cmaster --config,timer,key=timerFont,value=?{Font|Arial|Patrick Hand|Contrail|Light|Candal} --show,timer'))
            listItems.push(makeTextButton('Token Font Size',timer.timerFontSize, '!cmaster --config,timer,key=timerFontSize,value=?{Font Size|'+timer.timerFontSize+'} --show,timer'))
        }
            
        makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');
    },	
	
    sendAnnounceMenu = function() {
        const banner = makeBanner('announcements','Announcements','setup')      
		let	announcements = state[combatState].config.announcements
		
		let	listItems = [
				makeTextButton('Announce Rounds', announcements.announceRound, '!cmaster --config,announcements,key=announceRound,value='+!announcements.announceRound + ' --show,announce'),
				makeTextButton('Announce Turns', announcements.announceTurn, '!cmaster --config,announcements,key=announceTurn,value='+!announcements.announceTurn + ' --show,announce'),
				makeTextButton('Whisper GM Only', announcements.whisperToGM, '!cmaster --config,announcements,key=whisperToGM,value='+!announcements.whisperToGM + ' --show,announce'),
				makeTextButton('Shorten Long Names', announcements.handleLongName, '!cmaster --config,announcements,key=handleLongName,value='+!announcements.handleLongName + ' --show,announce'),
                makeTextButton('Show NPC Conditions', announcements.showNPCTurns, '!cmaster --config,announcements,key=showNPCTurns,value='+!announcements.showNPCTurns + ' --show,announce'),				
			]
		
		makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');
    },
	
	sendMacroMenu = function() {
	    const banner = makeBanner('macro','Macro & API','setup') 
        let addButton = makeBigButton('Add Substiution', '!cmaster --new,macro,type=?{Type|CharID,CharID|CharName,CharName|TokenID,TokenID|PlayerID,PlayerID},action=?{Action|}')
        let substitutions = state[combatState].config.macro.substitutions
        let listItems=[],contents,deleteButton,listContents
  
        substitutions.forEach((substitution) => {
            deleteButton = makeImageButton('!cmaster --delete,macro,action='+substitution.action,deleteImage,'Delete Substitution','transparent',12)
            
            listContents ='<div>'
            listContents +='<span style="vertical-align:middle">'+substitution.type+ '-'+substitution.action+'</span>'
            listContents +='<span style="float:right;vertical-align:middle">'+deleteButton+'</span>'
            listContents +='</div>'
            
            listItems.push(listContents)
        }) 

        makeAndSendMenu(addButton+makeList(listItems,banner.backButton),banner.titleText,'gm');
	},
	
	sendStatusMenu = function() {
	    const banner = makeBanner('status','Status','setup') 
        let	status = state[combatState].config.status
        
        let listItems = [
				makeTextButton('Whisper GM Only', status.sendOnlyToGM, '!cmaster --config,status,key=sendOnlyToGM,value='+!status.sendOnlyToGM+' --show,status'),
				makeTextButton('Player Allowed Changes', status.userChanges, '!cmaster --config,status,key=userChanges,value='+!status.userChanges+' --show,status'),
				makeTextButton('Send Changes to Chat', status.sendConditions, '!cmaster --config,status,key=sendConditions,value='+!status.sendConditions+' --show,status'),	
				makeTextButton('Clear Conditions on Close', status.clearConditions, '!cmaster --config,status,key=clearConditions,value='+!status.clearConditions + ' --show,status'),
				makeTextButton('Use Messages', status.useMessage, '!cmaster --config,status,key=useMessage,value='+!status.useMessage + ' --show,status'),
				makeTextButton('Auto Add Spells', status.autoAddSpells, '!cmaster --config,status,key=autoAddSpells,value='+!status.autoAddSpells+' --show,status'),
		]	

        if (status.autoAddSpells) {
            listItems.push(makeTextButton('Sheet', status.sheet, '!cmaster --config,status,key=sheet,value=?{Sheet|D&D5E OGL,OGL|D&D5E Shaped,Shaped} --show,status'))
        }
        
		makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');	
	},

	sendConcentrationMenu = function() {
	    const banner = makeBanner('concentration','Concentration','setup') 
        let	concentration = state[combatState].config.concentration
        let listItems = []
        log(concentration)

		listItems.push(makeTextButton('Use Concentration (5E)', concentration.useConcentration, '!cmaster --config,concentration,key=useConcentration,value='+!concentration.useConcentration + ' --show,concentration'))
		
		if (concentration.useConcentration) {
		    listItems.push(makeTextButton('Add Marker', concentration.autoAdd, '!cmaster --config,concentration,key=autoAdd,value='+!concentration.autoAdd+' --show,concentration'))	            
		    listItems.push(makeTextButton('Check for Save', concentration.autoRoll, '!cmaster --config,concentration,key=autoRoll,value='+!concentration.autoRoll+' --show,concentration'))  
		    listItems.push(makeTextButton('Notify', concentration.notify, '!cmaster --config,concentration,key=notify,value=?{Notify|Everyone,Everyone|Character,Character|GM,GM} --show,concentration'))
		 }
		
		if (concentration.autoRoll) {
		    listItems.push(makeTextButton('Wound Bar', concentration.woundBar, '!cmaster --config,concentration,key=woundBar,value=?{Wound Bar|Bar1,bar1|Bar2,bar2|Bar3,bar3} --show,concentration'))  
		    listItems.push(makeTextButton('Attribute', concentration.attribute, '!cmaster --config,concentration,key=attribute,value=?{Attribute|} --show,concentration'))  
		    
		}

		makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');	
	},
	
    sendConditionsMenu = function(message) {
        let key, condition, conditionButton, favorite, icon, output, rowCount=1
        let backButton = makeBigButton('Back', '!cmaster --back,setup')
		let	addButton = makeBigButton('Add Condition', '!cmaster --new,condition=?{Name}')
        let helpButton = makeImageButton('!cmaster --help,conditions',helpImage,'Help','transparent',18,'white')
        let	titleText  = 'Conditions Setup'+'<span style='+styles.buttonRight+'>'+helpButton+'</span>'      
		let	listItems = []
		let	listContents
        let icons = []
        let check = true
			
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
        let contents = message + makeList(listItems, backButton, addButton);
        
        state[combatState].config.previousPage = 'conditions'
        makeAndSendMenu(contents,titleText,'gm');	
    },

    sendConditionMenu = function(key) {
        let condition  = state[combatState].config.conditions[key]
        let listItems = []
        let markerDropdown = ''
        let helpButton = makeImageButton('!cmaster --help,condition',helpImage,'Help','transparent',18,'white')
        let	titleText  = 'Condition Setup'+'<span style='+styles.buttonRight+'>'+helpButton+'</span>'  

        if (typeof condition.description == 'undefined') {
            condition.description = ' '
        }
        
	    let removeButton        = makeBigButton('Delete Condition', '!cmaster --delete,condition='+key+',confirm=?{Are you sure?|Yes,yes|No,no}')
		let descriptionButton   = makeBigButton('Edit Description', '!cmaster --config,condition='+key+',key=description,value=?{Description|'+condition.description+'} --show,condition='+key)
		let backButton          = makeBigButton('Back', '!cmaster --back')	 

		listItems.push(makeTextButton('Name', condition.name, '!cmaster --config,condition='+key+',key=name,value=?{Name}'))
		listItems.push(makeTextButton('Type', condition.type, '!cmaster --config,condition='+key+',key=type,value=?{Type|Condition,Condition|Spell,Spell} --show,condition='+key))
		listItems.push(makeTextButton('Icon Type', condition.iconType, '!cmaster --config,condition='+key+',key=iconType,value=?{Icon Type|Combat Master,Combat Master|Token Marker,Token Marker|Token Condition,Token Condition} --show,condition='+key))
        
        let installed = verifyInstalls(condition.iconType)
        if (!installed) {
            return
        }   

        if (condition.iconType == 'Token Condition') {
            listItems.push(makeTextButton('Icon', condition.icon, '!cmaster --config,condition='+key+',key=icon,value=?{Token Condition|} --show,condition='+key))				
        } else {     
	        listItems.push(makeTextButton('Icon', getDefaultIcon(condition.iconType,condition.icon), '!cmaster --config,condition='+key+',key=icon,value='+buildMarkerDropdown(condition.iconType)+' --show,condition='+key))				
        }
        
		listItems.push(makeTextButton('Duration', condition.duration, '!cmaster --config,condition='+key+',key=duration,value=?{Duration|1} --show,condition='+key))
		listItems.push(makeTextButton('Direction', condition.direction, '!cmaster --config,condition='+key+',key=direction,value=?{Direction|0} --show,condition='+key))
		listItems.push(makeTextButton('Override', condition.override, '!cmaster --config,condition='+key+',key=override,value='+!condition.override+' --show,condition='+key))
		listItems.push(makeTextButton('Favorites', condition.favorite, '!cmaster --config,condition='+key+',key=favorite,value='+!condition.favorite+' --show,condition='+key))
		listItems.push(makeTextButton('Message', condition.message, '!cmaster --config,condition='+key+',key=message,value=?{Message} --show,condition='+key))
        listItems.push(makeTextButton('Targeted', condition.targeted, '!cmaster --config,condition='+key+',key=targeted,value='+!condition.targeted+' --show,condition='+key))
        listItems.push(makeTextButton('Concentration', condition.concentration, '!cmaster --config,condition='+key+',key=concentration,value='+!condition.concentration+' --show,condition='+key))
        listItems.push('<div style="margin-top:3px"><i><b>Adding Condition</b></i></div>' )
		listItems.push(makeBigButton('Add APIs', '!cmaster --show,condition='+key+',addAPI'))
        listItems.push('<div style="margin-top:3px"><i><b>Removing Condition</b></i></div>' )
		listItems.push(makeBigButton('Remove APIs', '!cmaster --show,condition='+key+',remAPI'))

		let contents = makeList(listItems)+'<hr>'+descriptionButton+'<b>Description:</b>'+condition.description+removeButton+'<hr>'+backButton 	
        makeAndSendMenu(contents,titleText,'gm');
    },
    
    sendConditionAddAPIMenu = function (key) {
        const banner = makeBanner('addAPI','Add API','condition='+key)
        let listItems = []
        let condition  = state[combatState].config.conditions[key]

        listItems = [
		    makeTextButton('API', condition.addAPI, '!cmaster --config,condition='+key+',key=addAPI,value=?{API Command|} --show,condition='+key),
    		makeTextButton('Roll20AM', condition.addRoll20AM, '!cmaster --config,condition='+key+',key=addRoll20AM,value=?{Roll20AM Command|} --show,condition='+key),
		    makeTextButton('FX', condition.addFX, '!cmaster --config,condition='+key+',key=addFX,value=?{FX|} --show,condition='+key),
		    makeTextButton('Macro', condition.addMacro, '!cmaster --config,condition='+key+',key=addMacro,value=?{Macro|} --show,condition='+key),
		    makeTextButton('Persistent Macro', condition.addPersistentMacro, '!cmaster --config,condition='+key+',key=addPersistentMacro,value='+!condition.addPersistentMacro+' --show,condition='+key)
		]
		
		makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');
    },

    sendConditionRemAPIMenu = function (key) {
        const banner = makeBanner('remAPI','Remove API','condition='+key)
        let listItems = []
        let condition  = state[combatState].config.conditions[key]
        
        listItems = [
		    makeTextButton('API', condition.remAPI, '!cmaster --config,condition='+key+',key=remAPI,value=?{API Command|} --show,condition='+key),
		    makeTextButton('Roll20AM', condition.remRoll20AM, '!cmaster --config,condition='+key+',key=remRoll20AM,value=?{Roll20AM Command|} --show,condition='+key),
		    makeTextButton('FX', condition.remFX, '!cmaster --config,condition='+key+',key=remFX,value=?{FX|} --show,condition='+key),
		    makeTextButton('Macro', condition.remMacro, '!cmaster --config,condition='+key+',key=remMacro,value=?{Macro|} --show,condition='+key)
		]
		
		makeAndSendMenu(makeList(listItems,banner.backButton),banner.titleText,'gm');        
    },
    
    buildMarkerDropdown = function (iconType) {
        let markerDropdown = '?{Marker';
        
        if (iconType == 'Combat Master') {
            ctMarkers.forEach((marker) => {
                markerDropdown += '|'+ucFirst(marker).replace(/-/g, ' ')+','+marker
            })
        } else if (iconType == 'Token Marker') {
            if (markers.length == 0) {
    	        markers = getTokenMarkers();
            }
            markers.forEach((marker) => {
                markerDropdown += '|'+marker.name+','+marker.name
            })
        } 
        markerDropdown += '}';   
        
        return markerDropdown
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
        const banner = makeBanner('export','Export CM','setup')
        makeAndSendMenu('<p>Copy the entire content above and save it on your pc.</p><pre>'+HE(JSON.stringify(state[combatState].config))+'</pre><div>'+banner.backButton+'</div>', banner.titleText);
    },
    
    targetedCondition = function (id, key) {
        if (debug) {
            log('Targeted Condition')
        }

        let title        = 'Select Targets'
        let addButton    = makeImageButton('!cmaster --add,target,id='+id+',condition='+key,tagImage,'Targeted Icons','transparent',18,'white')
        title           += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+addButton+'</div>'     
        let contents     = 'Select target tokens to assign this condition and hit the button above when ready'
        makeAndSendMenu(contents,title,'gm');
    },

    targetedSpell = function (key) {
        if (debug) {
            log('Targeted Spell')
        }

        let title        = 'Select Targets'
        let condition    = getConditionByKey(key)
        let addButton    = makeImageButton(`!cmaster --add,condition=${key},duration=${condition.duration},direction=${condition.direction},message=${condition.message}`,tagImage,'Spell Targets','transparent',18,'white')
        title           += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+addButton+'</div>'     
        let contents     = 'Select target tokens to assign this spell and hit the button above when ready'
        makeAndSendMenu(contents,title,'gm');
    },
    
    targetedCaster = function (key,duration,direction,message) {
        if (debug) {
            log('Targeted Caster')
        }

        let title        = 'Select Caster'
        let condition    = getConditionByKey(key)
        let addButton    = makeImageButton(`!cmaster --add,condition=${key},duration=${duration},direction=${direction},message=${message}`,tagImage,'Spell Caster','transparent',18,'white')
        title           += '<div style="display:inline-block;float:right;vertical-aligh:middle">'+addButton+'</div>'     
        let contents     = 'Select the caster to assign concentration and hit the button above when ready'
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
		else if (cmdDetails.details.concentration){
			state[combatState].config.concentration[cmdDetails.details.key] = cmdDetails.details.value;
		} 		
		else {
    		if (cmdDetails.details.key === 'name' && cmdDetails.details.value.replace(/\s/g, '').toLowerCase() !== state[combatState].config.conditions[cmdDetails.details.condition]) { 
      			state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()] = state[combatState].config.conditions[cmdDetails.details.condition];
      			state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()].key = cmdDetails.details.value.toLowerCase()
      			state[combatState].config.conditions[cmdDetails.details.value.toLowerCase()].name = cmdDetails.details.value
      			delete state[combatState].config.conditions[cmdDetails.details.condition];
      			sendConditionMenu(cmdDetails.details.value.toLowerCase())
    	    } else {
    	        if (cmdDetails.details.key == 'description') {
    	            cmdDetails.details.value = cmdDetails.details.value
    	        }
		        state[combatState].config.conditions[cmdDetails.details.condition][cmdDetails.details.key] = cmdDetails.details.value;
    	    }      
		}
	},
    
	editShowState = function (value) {
		state[combatState].config.status.showConditions = value;
	},
	
//*************************************************************************************************************
//CONDITIONS 
//*************************************************************************************************************		
	newCondition = function (name, type='Condition', concentration=false, description='None') {
        if (debug) {
            log ('Create Condition')
        }	
        
		if(!name){
			sendConditionsMenu('You didn\'t give a condition name, eg. <i>!condition add Prone</i>.');
		} else if (state[combatState].config.conditions[name.toLowerCase()]) {
			sendConditionsMenu('The condition `'+name+'` already exists.');
		} else {
			state[combatState].config.conditions[name.toLowerCase()] = {
				name: name,
				key: name.toLowerCase(),
				type: type,
				icon: 'red',
				iconType: 'Combat Master',
				description: ' ',
				duration: 1,
				direction: 0,
				message: 'None',
				concentration: concentration,
				description: description,
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

        if (!tokenObj) {
            return
        }
        
        if (debug) {
            log('Add Condition To Token')
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
                newCondition.concentration      = defaultCondition.concentration
                newCondition.type               = defaultCondition.type
            } else {
                newCondition.name               = key
                newCondition.icon               = null
                newCondition.iconType           = null
                newCondition.addMacro           = null
                newCondition.addPersistentMacro = null
                newCondition.type               = 'Condition'
                newCondition.concentration      = false
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
            if (defaultCondition && defaultCondition.concentration == true && defaultCondition.override == true) {
                targetedCaster('concentration',newCondition.duration,newCondition.direction,'Concentrating on ' + defaultCondition.name)
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
        } 
          
        if (!tokenObj) {
            return;
        }  
        
        let removed = false
        let icon

        [...state[combatState].conditions].forEach((condition, i) => {
            if (condition.id == tokenObj.get('_id') && condition.key == key) {
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
                if (condition.concentration == true) {
                    let concentration = getConditionByKey('concentration')
                    icon = getIconTag(concentration.iconType, concentration.icon)
                    if (icon) {            
                        removeMarker(tokenObj,icon)                    
                    }
                }    
                state[combatState].conditions.splice(i,1)
                removed = true
            }      
        });  
 
        return removed
    },

    removeTokenCondition = function (id) {
        if (debug) {
            log('Remove Token Condition')
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
        }
        
        if ((!selectedTokens || selectedTokens.length == 0) && !state[combatState].config.hold.held) {
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

        if (initiative.rollInitiative == 'CombatMaster' && !state[combatState].config.hold.held) {
            selectedTokens.forEach(token => {
                if (token._type == 'graphic') {
                    tokenObj        = getObj('graphic', token._id)
                    if (tokenObj) {
                        whisper         = (tokenObj.layer == 'gmlayer') ? 'gm ' : ''
                        characterObj    = getObj('character', tokenObj.get('represents'))
        				if (!characterObj) {
                             makeAndSendMenu('A token was found not assigned to a character sheet',' ', whisper);   
                        } 
                    }    
                }    
			})    
        }  
        
        return verified
    },

    startCombat = function (selectedTokens, who) {
        if (debug) {
            log('Start Combat')
        }
        
        let initiative  = state[combatState].config.initiative
        let turnorder   = state[combatState].config.turnorder
        let verified    = verifySetup(selectedTokens, initiative)
        let hold        = state[combatState].config.hold
        
        if (!verified && !hold.held) {
            return
        }
        
        Campaign().set('initiativepage', Campaign().get('playerpageid'));
        paused = false;

        if (hold.held) {
            restartCombat(hold, who)
        } else {
            if(initiative.rollInitiative == 'CombatMaster'){
                rollInitiative(selectedTokens, initiative);
            } else if (initiative.rollInitiative == 'Group-Init') {
                rollGroupInit(selectedTokens)
            } else if (!getTurnorder()) {
                makeAndSendMenu('You must have a populated turnorder before starting Combat Master','');    
                return
            }
        }  
        
        setTimeout(function() {
            doRoundCalls()
            doTurnorderChange()
        },2000) 
        
        log(hold)
    },
    
    restartCombat = function (hold,who) {
        if (debug) {
            log('Restart Combat')
        }

        round = hold.round;
        setTurnorder(hold.turnorder);

        let tokenObj
        let icon

        [...hold.conditions].forEach((condition, i) => {
            tokenObj = getObj('graphic', condition.id)
            if (tokenObj) {
                addConditionToToken(tokenObj,condition.key,condition.duration,condition.direction,condition.message);
                icon = getIconTag(condition.iconType, condition.icon)
                condition.target.forEach((target) => {
                    addMarker(getObj('graphic', target),icon)
                }) 
            } 
        }) 
 
        setTimeout(function() {
            clearHold(hold)
            sendMainMenu(who)
        },2000) 
    },
    
    stopCombat = function (who) {
        if (debug) {
            log('Stop Combat')
        }

        clearHold(state[combatState].config.hold)
        
        if (state[combatState].config.status.clearConditions) {
            [...state[combatState].conditions].forEach((condition) => {
                if (condition.id != getOrCreateMarker(true).get('id') && condition.id != getOrCreateMarker(false).get('id')) {
                    removeConditionFromToken(getObj('graphic',condition.id), condition.key)
                }  
            }) 
        }           
        
        removeMarkers();
        stopTimer();
        Campaign().set({initiativepage:false,turnorder:''});     
        round = 1;
        
        setTimeout(function() {
            sendMainMenu(who)
            state[combatState].conditions = [];
        },2000)         
        
    },
    
    holdCombat = function (who) {
        if (debug) {
            log('Hold Combat')
        }
        
        let hold        = state[combatState].config.hold
        hold.held       = true;
        hold.turnorder  = getTurnorder();
        hold.round      = round;
        hold.conditions = [...state[combatState].conditions]
        
        if (state[combatState].config.status.clearConditions) {
            [...state[combatState].conditions].forEach((condition) => {
                if (condition.id != getOrCreateMarker(true).get('id') && condition.id != getOrCreateMarker(false).get('id')) {
                    removeConditionFromToken(getObj('graphic',condition.id), condition.key)
                }  
            }) 
        }   
        
        
        Campaign().set({initiativepage:false,turnorder:''});     
        pauseTimer()
            
        setTimeout(function() {
            state[combatState].conditions = [];
            sendMainMenu(who)
        },2000)   
        
        log(hold)
    },

    clearHold = function (hold) {
        if (debug) {
            log('Clear Hold')
        }
        
        hold.held = false
        hold.round = 1
        hold.turnorder = []
        hold.conditions = []
    },
    
    rollInitiative = function (selectedTokens, initiative) {
        let tokenObj, whisper, initiativeTemp, initiativeRoll, characterObj, initAttributes, initiativeMod, i, advantageAttrib, initiativeAdv1, initiativeAdv2
        
        //loop through selected tokens
        selectedTokens.forEach(token => {
            if (token._type == 'graphic') {
                tokenObj        = getObj('graphic', token._id)
                if (tokenObj) {
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
            }    
        });

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
            log(marker)
        }
        
        let exists
        let statusmarker
        let statusmarkers
        
        if (tokenObj.get('statusmarkers')) {
            statusmarkers = tokenObj.get('statusmarkers').split(',')
        } else {
            statusmarkers = []
        } 

        if (duration) {
            statusmarker = marker+'@'+duration
        } else {
            statusmarker = marker
        }

        [...statusmarkers].forEach((a, i) => {
            if (a.indexOf(marker) > -1) {
                statusmarkers.splice(i,0)
                exists = true
            }        
        });        
        
        if (!exists) {
            statusmarkers.push(statusmarker)
        }
        
        tokenObj.set('statusmarkers', statusmarkers.join())
        log(tokenObj)
    },

    removeMarker = function(tokenObj, marker) {
        if (debug) {
            log('Remove Marker')
        }
        
        let statusmarkers = tokenObj.get('statusmarkers').split(',');

        [...statusmarkers].forEach((a, i) => {
            if (a.indexOf(marker) > -1) {
                statusmarkers.splice(i,1)
            }  
        });       

        tokenObj.set('statusmarkers', statusmarkers.join())
        log(tokenObj)
        
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

    verifyTurnorder = function () {
        if(debug) {
            log('Verify Turnorder')
        }        
        let turnorder = getTurnorder()

        if (turnorder.length == 0) {
            makeAndSendMenu('The Turnorder is empty.  Combat not started',null,'gm');
            stopCombat()
            return false
        }
        
        return true
    },
    
    doTurnorderChange = function (prev=false, delay=false) {
        if(debug) {
            log('Do TurnOrder Change')
        }
        
        let verified    = verifyTurnorder()
        if (!verified) {
            return
        }
        let turn        = getCurrentTurn()
        let marker      = getOrCreateMarker()
        let tokenObj    = getObj('graphic', turn.id)

        
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

    setTurnorder = function (turnorder) {
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
        
        let title         = 'Conditions'
        let doneButton    = makeImageButton('!cmaster --turn,next',doneImage,'Done with Round','transparent',18,'white')
        let delayButton   = makeImageButton('!cmaster --turn,delay',delayImage,'Delay your Turn','transparent',18, 'white');
        
        if (!show) {
            title   += '<div style="'+styles.buttonRight+'">'+doneButton+'</div>'
            title   += '<div style="'+styles.buttonRight+'">'+delayButton+'</div>'
        }

        let contents    = '<div style="'+styles.announcePlayer+'">'+image+'</div>'
        
        if (!show) {
            contents   += '<div style="'+styles.announcePlayer+'">'+name+'\'s Turn</div>'
        } else {
            contents   += '<div style="'+styles.announcePlayer+'">'+name+'</div>'
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

    makeBanner = function (command,title,previous) {
        let backButton = makeBigButton('Back', '!cmaster --back,'+previous)
        let helpButton = makeImageButton('!cmaster --help,'+command,helpImage,'Help','transparent',18,'white')
        let titleText  = title+' Setup'+'<span style='+styles.buttonRight+'>'+helpButton+'</span>'         
        
        return {
            backButton,
            titleText
        };
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
            log("Do Round Calls")
        }

        let verified    = verifyTurnorder()
        if (!verified) {
            return
        }
        
        let config     = state[combatState].config.turnorder 
        let turnorder  = getTurnorder()
        let tokenObj, characterObj, macro

        turnorder.forEach((turn) => {
            if (turn.id !== getOrCreateMarker().get('id')) {
                tokenObj     = getObj('graphic',turn.id)
                if (tokenObj) {
                    characterObj = getObj('character',tokenObj.get('represents'))
    
                    if (characterObj) {
                        if (!['None',''].includes(config.allRoundMacro)) {
                            macro = getMacro(tokenObj, config.allRoundMacro)
                            sendCalltoChat(tokenObj,characterObj,macro.get('action'))
                        }
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
        }

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
//*************************************************************************************************************
//SPELLS 
//*************************************************************************************************************	  
    handleSpellCast = function(msg) {
        if (debug) {
            log('Handle Spell Cast')
            log(msg)
        }
        
        let status          = state[combatState].config.status;
        let concentration   = state[combatState].config.concentration;
        let spellName
        let description
        let concentrate     = false
        let spellLevel 

        
        if (status.sheet == 'OGL') {
            spellName   = msg.content.match(/name=([^\n{}]*[^"\n{}])/);  
            spellName   = RegExp.$1;     
            description = msg.content.match(/description=([^\n{}]*[^"\n{}])/)  
            description = RegExp.$1;  
            spellLevel = msg.content.match(/spelllevel=([^\n{}]*[^"\n{}])/)  
            spellLevel = RegExp.$1;  
            log(spellLevel)

            
            if (msg.content.includes("{{concentration=1}}")) {
                concentrate = true
            } 
            log(concentrate)
            if (!spellLevel && !concentrate) {
                return;
            }            
        } else if (status.sheet == 'Shaped') {
            spellName    = msg.content.match(/title=([^\n{}]*[^"\n{}])/);  
            spellName    = RegExp.$1;         
            description  = msg.content.match(/content=([^\n{}]*[^"\n{}])/)  
            description  = RegExp.$1;       
            if (msg.content.includes("CONCENTRATION")) {
                concentrate = true
            }             
        }   

        if (!spellName) {
            return
        }
        
        if (debug) {
            log('Spell Name:'+spellName)
            log('Description:'+description)
            log('Concentrate:'+concentrate)
        }
        if (!description) {
            description = 'None'
        }
        
        if (status.autoAddSpells) {     
            let key = spellName.toLowerCase()
            let condition = getConditionByKey(key)
            if (typeof condition == 'undefined' && !getIgnoresByKey(key)) {
                
                state[combatState].spells[key] = {
                				name: spellName,
                				key: key,
                				type: 'Spell',
                				icon: 'red',
                				iconType: 'Combat Master',
                				description: description,
                				duration: 1,
                				direction: 0,
                				message: 'None',
                				targeted: false,
                				favorite: false,
                				concentration: concentrate,
                				description: description,
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
			
                let addSpellButton = makeBigButton(`Add Spell to Combat Master`, `!cmaster --spell,confirm=true,key=${key}`)
                let ignoreSpellButton = makeBigButton(`Ignore this Spell`, `!cmaster --spell,confirm=false,key=${key}`)
                makeAndSendMenu(`A new spell - ${spellName} - was detected<br>`+addSpellButton+ignoreSpellButton ,`New Spell Found`,`gm`)
                
            }  else if (condition) {
                targetedSpell(key)
                if (concentration.useConcentration && concentrate == true && condition.override == false) {     
                    let characterName   = msg.content.match(/charname=([^\n{}]*[^"\n{}])/);            
                    characterName       = RegExp.$1;
                    let characterID     = findObjs({ name: characterName, _type: 'character' }).shift().get('id')    
                    let tokenObj        = findObjs({ represents: characterID, _pageid:Campaign().get("playerpageid"), _type: 'graphic' })[0]
                    addConditionToToken(tokenObj,'concentration',condition.duration,condition.direction,'Concentrating on ' + spellName)
                }                   
            }
        }
    },
    
    addSpell = function(key) {
        if (debug) {
            log('Add Spell')
            log(key)
        }        
        state[combatState].config.conditions[key] = state[combatState].spells[key] 
        let index = state[combatState].spells.indexOf(key);
        if (index > -1) {
            state[combatState].spells.splice(index, 1);
        }
        sendConditionMenu(key);
    },
 
    ignoreSpell = function(key) {
        if (debug) {
            log('Ignore Spell')
            log(key)
        }  
        
       state[combatState].ignores.push(key)
       log(state[combatState].ignores)
       makeAndSendMenu('Spell has been added to Ignore List','Spell Ignored','gm');
    },
    
    getIgnoresByKey = function(key) {
        if (debug) {
            log('Get Ignores By Key')
            log('Key:'+key)
            log('Exists:'+state[combatState].ignores.includes(key))
        }  
        
        if (state[combatState].ignores.includes(key)) {
            return true
        } else {
            return false
        }  
    },
//*************************************************************************************************************
//SPELLS 
//*************************************************************************************************************	  
    handleConstitutionSave = function(obj, prev) {
        if (debug) {
            log('Handle Constitution Save')
        }
        
        let tokenID = obj.get('id')
        let found = false
        state[combatState].conditions.forEach((condition) => {
            if (condition.id == tokenID && condition.key == 'concentration') {
                found = true
            }
        })
        
        if (!found) {
            return;
        }

        let conditions = obj.get('statusmarkers').split(',')
        let condition = state[combatState].conditions.map(id => obj.get('statusmarkers'))
        let concentration = state[combatState].config.concentration
        let bar = concentration.woundBar+'_value'
        let target = concentration.notify

        if(obj.get(bar) < prev[bar]) {
            let calcDC = Math.floor((prev[bar] - obj.get(bar))/2)
            let DC = (calcDC > 10) ? calcDC : 10
            let conSave = parseInt(getAttrByName(obj.get('represents'), concentration.attribute, 'current')) || 0
            let contents;

            if(target === 'Character'){
                contents = "Make a Concentration Check - <b>DC " + DC + "</b>.";
                target = obj.get('name').split(' ').shift()
            } else if(target === 'Everyone'){
                contents = '<b>'+obj.get('name')+'</b> must make a Concentration Check - <b>DC ' + DC + '</b>.';
                target = '';
            }else{
                contents = '<b>'+obj.get('name')+'</b> must make a Concentration Check - <b>DC ' + DC + '</b>.';
                target = 'gm';
            }
            makeAndSendMenu(contents, '', target);
            // if(concentration.autoRoll){
            //     roll(obj.get('represents'), DC, conSave, obj.get('name'), target);
            // }else{
                // makeAndSendMenu(contents, '', target);
            // }

            // let length = checked.push(obj.get('represents'));
            // setTimeout(() => {
            //     checked.splice(length-1, 1);
            // }, 1000);
        }
    },

    // roll = (represents, DC, conSave, name, target) => {
    //     sendChat(script_name, '[[1d20cf<'+(DC-con_save_mod-1)+'cs>'+(DC-con_save_mod-1)+'+'+con_save_mod+']]', results => {
    //         let title = 'Concentration Save <br> <b style="font-size: 10pt; color: gray;">'+name+'</b>',
    //             advantageRollResult;

    //         let rollresult = results[0].inlinerolls[0].results.rolls[0].results[0].v;
    //         let result = rollresult;

    //         if(advantage){
    //             advantageRollResult = randomInteger(20);
    //             result = (rollresult <= advantageRollResult) ? advantageRollResult : rollresult;
    //         }

    //         let total = result + con_save_mod;

    //         let success = total >= DC;

    //         let result_text = (success) ? 'Success' : 'Failed',
    //             result_color = (success) ? 'green' : 'red';

    //         let rollResultString = (advantage) ? rollresult + ' / ' + advantageRollResult : rollresult;

    //         let contents = ' \
    //         <table style="width: 100%; text-align: left;"> \
    //             <tr> \
    //                 <th>DC</th> \
    //                 <td>'+DC+'</td> \
    //             </tr> \
    //             <tr> \
    //                 <th>Modifier</th> \
    //                 <td>'+con_save_mod+'</td> \
    //             </tr> \
    //             <tr> \
    //                 <th>Roll Result</th> \
    //                 <td>'+rollResultString+'</td> \
    //             </tr> \
    //         </table> \
    //         <div style="text-align: center"> \
    //             <b style="font-size: 16pt;"> \
    //                 <span style="border: 1px solid '+result_color+'; padding-bottom: 2px; padding-top: 4px;">[['+result+'+'+con_save_mod+']]</span><br><br> \
    //                 '+result_text+' \
    //             </b> \
    //         </div>'
    //         makeAndSendMenu(contents, title, target);

    //         if(target !== '' && target !== 'gm'){
    //             makeAndSendMenu(contents, title, 'gm');
    //         }

    //         if(!success){
    //             removeMarker(represents);
    //         }
    //     });
    // },    
    
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
            //stopCombat();
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
            ignores: [],
            spells: [],
			config: {
                command: 'cmaster',		
				duration: false,
				favorite: false,
				previousPage: null,			
				gmPlayerID: null,
				hold: {
				    held: false,
				    turnorder: [],
				    conditions: [],
				    round: 1
				},	
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
					access: 'None',
					autoAddSpells: false,
					sheet: 'OGL',
				},	
				concentration: {
					useConcentration: false,
					notify: 'GM',
					autoAdd: false,
					autoRoll: false,
					woundBar: 'Bar1',
					attribute: 'None'
				},					
			    conditions: {
					blinded: {
						name: 'Blinded',
						key: 'blinded',
						type: 'Condition',
						description: '<p>A blinded creature cannot see and automatically fails any ability check that requires sight.</p> <p>Attack rolls against the creature have advantage, and the creature making Attack rolls have disadvantage.</p>',
						icon: 'bleeding-eye',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Spell',
						description: "<p>A charmed creature can't Attack the charmer or target the charmer with harmful Abilities or magical effects.</p> <p>The charmer has advantage on any ability check to interact socially with the creature.</p>",
						icon: 'broken-heart',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
					concentration: {
						name: 'Concentration',
						key: 'concentration',
						type: 'Spell',
						description: "<p>In order to keep their magic active. If you lose concentration, such a spell ends. If a spell must be maintained with concentralion, that fact appears in its Duration entry, and the spell specifics how long you can concentrate on it. You can end concentration at any time (no action required)..</p>",
						icon: 'trophy',
						iconType: 'Combat Master',
						duration: 1,
						direction: 0,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A deafened creature can't hear and automatically fails any ability check that requires hearing.</p>",
						icon: 'edge-crack',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A frightened creature has disadvantage on Ability Checks and Attack rolls while the source of its fear is within line of sight.</p> <p>The creature can't willingly move closer to the source of its fear.</p>",
						icon: 'screaming',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A grappled creature's speed becomes 0, and it can't benefit from any bonus to its speed.</p> <p>The condition ends if the Grappler is <i>incapacitated</i>.</p> <p>The condition also ends if an effect removes the grappled creature from the reach of the Grappler or Grappling effect, such as when a creature is hurled away by the Thunderwave spell.</p>",
						icon: 'grab',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>An incapacitated creature can't take actions or reactions.</p>",
						icon: 'interdiction',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Spell',
						description: "<p>If you have inspiration, you can expend it when you make an Attack roll, saving throw, or ability check. Spending your inspiration gives you advantage on that roll.</p> <p>Additionally, if you have inspiration, you can reward another player for good roleplaying, clever thinking, or simply doing something exciting in the game. When another player character does something that really contributes to the story in a fun and interesting way, you can give up your inspiration to give that character inspiration.</p>",
						icon: 'black-flag',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Spell',
						description: "<p>An invisible creature is impossible to see without the aid of magic or a Special sense. For the purpose of Hiding, the creature is heavily obscured. The creature's location can be detected by any noise it makes or any tracks it leaves.</p> <p>Attack rolls against the creature have disadvantage, and the creature's Attack rolls have advantage.</p>",
						icon: 'ninja-mask',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A paralyzed creature is <i>incapacitated</i> and can't move or speak.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>",
						icon: 'pummeled',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A petrified creature is transformed, along with any nonmagical object it is wearing or carrying, into a solid inanimate substance (usually stone). Its weight increases by a factor of ten, and it ceases aging.</p> <p>The creature is <i>incapacitated</i>, can't move or speak, and is unaware of its surroundings.</p> <p>Attack rolls against the creature have advantage.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>The creature has Resistance to all damage.</p> <p>The creature is immune to poison and disease, although a poison or disease already in its system is suspended, not neutralized.</p>",
						icon: 'frozen-orb',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: '<p>A poisoned creature has disadvantage on Attack rolls and Ability Checks.</p>',
						icon: 'chemical-bolt',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A prone creature's only Movement option is to crawl, unless it stands up and thereby ends the condition.</p> <p>The creature has disadvantage on Attack rolls.</p> <p>An Attack roll against the creature has advantage if the attacker is within 5 feet of the creature. Otherwise, the Attack roll has disadvantage.</p>",
						icon: 'back-pain',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A restrained creature's speed becomes 0, and it can't benefit from any bonus to its speed.</p> <p>Attack rolls against the creature have advantage, and the creature's Attack rolls have disadvantage.</p> <p>The creature has disadvantage on Dexterity saving throws.</p>",
						icon: 'fishing-net',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>A stunned creature is <i>incapacitated</i>, can't move, and can speak only falteringly.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p>",
						icon: 'fist',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
						type: 'Condition',
						description: "<p>An unconscious creature is <i>incapacitated</i>, can't move or speak, and is unaware of its surroundings.</p> <p>The creature drops whatever it's holding and falls prone.</p> <p>The creature automatically fails Strength and Dexterity saving throws.</p> <p>Attack rolls against the creature have advantage.</p> <p>Any Attack that hits the creature is a critical hit if the attacker is within 5 feet of the creature.</p>",
						icon: 'sleepy',
						iconType: 'Combat Master',
						duration: 1,
						direction: -1,
						override: true,
						favorite: false,
						message: 'None',
						targeted: false,
						concentration: false,
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
            if(!state[combatState].config.hasOwnProperty('hold')){
                state[combatState].config.hold = combatDefaults.config.hold;
            } else {
                if(!state[combatState].config.hold.hasOwnProperty('held')){
                    state[combatState].config.hold.held = combatDefaults.config.hold.held;    
                }                 
                if(!state[combatState].config.hold.hasOwnProperty('turnorder')){
                    state[combatState].config.hold.turnorder = combatDefaults.config.hold.turnorder;    
                }  
                if(!state[combatState].config.hold.hasOwnProperty('conditions')){
                    state[combatState].config.hold.conditions = combatDefaults.config.hold.conditions;    
                }    
                if(!state[combatState].config.hold.hasOwnProperty('round')){
                    state[combatState].config.hold.round = combatDefaults.config.hold.round;    
                }                    
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
                if(!state[combatState].config.turnorder.hasOwnProperty('allRoundMacrFhando')){
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
					state[combatState].config.status.useMessage = combatDefaults.config.status.useMessage;
				}
				if(!state[combatState].config.status.hasOwnProperty('showConditions')){
					state[combatState].config.status.showConditions = combatDefaults.config.status.showConditions;
				}	
				if(!state[combatState].config.status.hasOwnProperty('access')){
					state[combatState].config.status.access = combatDefaults.config.status.access;
				}	
				if(!state[combatState].config.status.hasOwnProperty('autoAddSpells')){
					state[combatState].config.status.autoAddSpells = combatDefaults.config.status.autoAddSpells;
				}	
				if(!state[combatState].config.status.hasOwnProperty('sheet')){
					state[combatState].config.status.sheet = combatDefaults.config.status.sheet;
				}				
            }
            
			if(!state[combatState].config.hasOwnProperty('concentration')) {
				state[combatState].config.concentration = combatDefaults.config.concentration;
			} else {
				if(!state[combatState].config.concentration.hasOwnProperty('useConcentration')){
					state[combatState].config.concentration.useConcentration = combatDefaults.config.concentration.useConcentration;
				}
				if(!state[combatState].config.concentration.hasOwnProperty('notify')){
					state[combatState].config.concentration.notify = combatDefaults.config.concentration.notify;
				}      
				if(!state[combatState].config.concentration.hasOwnProperty('autoAdd')){
					state[combatState].config.concentration.autoAdd = combatDefaults.config.concentration.autoAdd;
				}
				if(!state[combatState].config.concentration.hasOwnProperty('autoRoll')){
					state[combatState].config.concentration.autoRoll = combatDefaults.config.concentration.autoRoll;
				}
				if(!state[combatState].config.concentration.hasOwnProperty('woundBar')){
					state[combatState].config.concentration.woundBar = combatDefaults.config.concentration.woundBar;
				}	
				if(!state[combatState].config.concentration.hasOwnProperty('attribute')){
					state[combatState].config.concentration.attribute = combatDefaults.config.concentration.attribute;
				}					
            }            
        }
        
        if(!state[combatState].hasOwnProperty('conditions')){
            state[combatState].conditions = [];
        } 

        if(!state[combatState].hasOwnProperty('ignores')){
            state[combatState].ignores = [];
        } 

        if(!state[combatState].hasOwnProperty('spells')){
            state[combatState].spells = [];
        } 
        
        if(state[combatState].config.hasOwnProperty('conditions') && !reset){        
            for (key in state[combatState].config.conditions) {
                condition = getConditionByKey(key)
                if (!condition.hasOwnProperty('key')) {
                    condition.key = key
                }  
                if (!condition.hasOwnProperty('type')) {
                    condition.type = 'Condition'
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
                if (!condition.hasOwnProperty('concentration')) {
                    condition.concentration = false
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
        
        if (!state[combatState].config.conditions.hasOwnProperty('concentration')) {
            state[combatState].config.conditions.concentration = combatDefaults.config.conditions.concentration;
        }
    },

    showHelp = function(cmdDetails) {
        let handout
        let title
        if (cmdDetails.details.held) {
            title = 'Main Menu Held'
        } else if (cmdDetails.details.started) {
            title = 'Main Menu Started'
        } else if (cmdDetails.details.stopped) {
            title = 'Main Menu Stopped'
        } else if (cmdDetails.details.setup) {
            title = 'Setup Menu'
        } else if (cmdDetails.details.initiative) {
            title = 'Initiative Menu'
        } else if (cmdDetails.details.turnorder) {
            title = 'Turnorder Menu'
        } else if (cmdDetails.details.timer) {
            title = 'Timer Menu'
        } else if (cmdDetails.details.announcements) {
            title = 'Announcements Menu'
        } else if (cmdDetails.details.macro) {
            title = 'Macro & API Menu'
        } else if (cmdDetails.details.status) {
            title = 'Status Menu'
        } else if (cmdDetails.details.concentration) {
            title = 'Concentration Menu'            
        } else if (cmdDetails.details.conditions) {
            title = 'Conditions Menu'
        } else if (cmdDetails.details.condition) {
            title = 'Condition Menu'
        } else if (cmdDetails.details.addAPI) {
            title = 'Add API Menu'
        } else if (cmdDetails.details.remAPI) {
            title = 'Remove API Menu'            
        } else if (cmdDetails.details.export) {
            title = 'Export Menu'
        } 
        handout = findHandout(title) 
        makeAndSendMenu(`<a href="http://journal.roll20.net/handout/${handout[0].id}">View Help</a>`,title,'gm')         
    },
    
    buildHelp = function() {
        log('Building Help')
        
        let mainStarted         = createHandout('Main Menu Started')
        let mainStopped         = createHandout('Main Menu Stopped')
        let mainHeld            = createHandout('Main Menu Held')
        let menuSetup           = createHandout('Setup Menu')
        let menuInitiative      = createHandout('Initiative Menu')
        let menuTurnorder       = createHandout('Turnorder Menu')
        let menuTimer           = createHandout('Timer Menu')
        let menuAnnouncements   = createHandout('Announcements Menu')
        let menuMacro           = createHandout('Macro & API Menu')
        let menuStatus          = createHandout('Status Menu')
        let menuConcentration   = createHandout('Concentration Menu')
        let menuConditions      = createHandout('Conditions Menu')
        let menuCondition       = createHandout('Condition Menu')
        let menuAddAPI          = createHandout('Add API Menu')
        let menuRemoveAPI       = createHandout('Remove API Menu')
        let menuExport          = createHandout('Export Menu')
        
        setTimeout(function() {
            buildMainMenuStarted(mainStarted,menuSetup.id,menuCondition.id)
            buildMainMenuStopped(mainStopped,menuSetup.id,menuCondition.id)
            buildMainMenuHeld(mainHeld,menuSetup.id,menuCondition.id)
            buildSetupMenu(menuSetup,menuInitiative.id,menuTurnorder.id,menuTimer.id,menuAnnouncements.id,menuMacro.id,menuStatus.id,menuConcentration.id,menuConditions.id,menuExport.id)
            buildInitiativeMenu(menuInitiative,menuSetup.id)
            buildTurnorderMenu(menuTurnorder,menuSetup.id)
            buildTimerMenu(menuTimer,menuSetup.id)
            buildAnnouncementsMenu(menuAnnouncements,menuSetup.id)
            buildMacroMenu(menuMacro,menuSetup.id)
            buildStatusMenu(menuStatus,menuSetup.id)
            buildConcentrationMenu(menuConcentration,menuSetup.id)
            buildConditionsMenu(menuConditions,menuSetup.id)
            buildConditionMenu(menuCondition,menuSetup.id)
            buildAddAPIMenu(menuAddAPI)
            buildRemoveAPIMenu(menuRemoveAPI)
            buildExportMenu(menuExport)
        },1000)    
        
    },
    
    findHandout = function (title) {
        let handout = findObjs({_type:'handout', name:title})
        
        return handout
    },
    
    createHandout = function (title) {
        let handout = findHandout(title)

        if (handout[0]) {
            handout[0].remove()
        }
        
        handout   = createObj('handout', {
                        name:title,
                        archived:true
                    })
        
        return handout  
    },

    buildMainMenuStarted = function(handout,setupID,conditionID) {
        let notes
        
        notes = `<div class="content note-editor notes">
                    <p>
                        <img src="https://s3.amazonaws.com/files.d20.io/images/152155102/i5BnjEmv8VSsfpoK44jaKw/original.png?15953856105">
                    </p>
                    <h4><i>Started Combat (Green Bar)</i> - Icons in order from Left to Right </h4>
                    <ul>
                        <li><b>Stop Combat </b>— Ends Combat and clears Turnorder.</li>
                        <li><b>Hold Combat </b>— Sets Combat to Hold and saves off everything for a restart</li>
                        <li><b>Previous Player </b>— Sets Active Player to previous player in Turnorder</li>
                        <li><b>Next Player </b>— Sets Active Player to Next Player in Turnorder</li>
                        <li><b>Pause Timer </b>— Pauses Timer. Click again to restart Timer</li>
                        <li><b>Stop Timer </b>— Stops Timer. Clears Timer.  Can't be restarted until next Combat</li>
                        <li><b>Show Conditions </b>— Shows all Conditions assigned to all Players & NPCs</li>
                        <li><b>Sort Turnorder </b>— Sorts Turnorder in ascending sequence</li>
                        <li><b>Setup  </b>— Shows the <a href="http://journal.roll20.net/handout/${setupID}">Setup Menu</a></li>
                    </ul>`
        notes += buildMainConditions('https://s3.amazonaws.com/files.d20.io/images/133804430/JJ--U559pOgsd9UBpUb06g/original.png?15892970605',conditionID)
        notes += `</div>`

        handout.set({notes:notes});    
    },
 
    buildMainMenuStopped = function(handout,setupID,conditionID) {
        let notes
        
        notes = `<div class="content note-editor notes">
                    <p>
                        <img src="https://s3.amazonaws.com/files.d20.io/images/152155096/Yb0jQ-AqPsjXPAN4F0OHVA/original.png?15953856105">
                    </p>
                    <h4><i>Start Combat (Red Bar)</i> - Icons in order from Left to Right </h4>
                    <ul>
                        <li><b>Start Combat </b>— Starts up combat. Must have tokens selected if using CM to roll initiative.</li>
                        <li><b>Setup </b>— Shows the <a href="http://journal.roll20.net/handout/${setupID}">Setup Menu</a>.</li>
                    </ul>`
        notes += buildMainConditions('https://s3.amazonaws.com/files.d20.io/images/133804645/pmJuadcB01opW3Lg8lyOYA/original.png?15892970725',conditionID)
        notes += `</div>`
                
        handout.set({notes:notes});         
    },

    buildMainMenuHeld = function(handout,setupID,conditionID) {
        let notes
        
        notes = `<div class="content note-editor notes">
                    <p>
                        <img src="https://s3.amazonaws.com/files.d20.io/images/152155100/DcEfpVBdzKz9t-SS23KZhA/original.png?15953856105">
                    </p>
                    <h4><i>Held Combat (Yellow Bar)</i> - Icons in order from Left to Right </h4>
                    <ul>
                        <li><b>Start Combat </b>— Restarts Combat from where it was previous held</li>
                        <li><b>Setup </b>— Shows the <a href="http://journal.roll20.net/handout/${setupID}">Setup Menu</a>.</li>
                    </ul>`
        notes += buildMainConditions('https://s3.amazonaws.com/files.d20.io/images/133804415/0Te1DEzFMolSiIj7DfZfTw/original.png?15892970575', conditionID)
        notes += `</div>`
        
        handout.set({notes:notes});         
    },    
       
    buildMainConditions = function(image,conditionID) {
        let notes = `<h4><i>Conditions</i> - From Left to Right </h4>
                    <ul>
                        <li><b>Icon </b>— The default or custom token marker assigned to the condition is displayed here. If the condition uses the Token Condition script, it will simply show "TC" here.</li>
                        <li><b>Name </b>— The name of the condition.</li>
                        <li><b>Add </b>— Add the condition to the selected token(s). Will use the conditions settings for Duration, Default, Override, and Messages. Will invoke any API commands and/or Macros assigned to the condition.</li>
                        <li><b>Remove </b>— Removes the condition from the selected token(s).</li>
                        <li><b>Favorite </b>— If a star is displayed, the condition will show in the favorites menu. If a globe is displayed, the condition will only show in the all conditions menu. Clicking on either the star or globe icon for each condition will toggle if it's a favorite or not.</li><li><b>Edit </b>— Shows the <a href="http://journal.roll20.net/handout/${conditionID}">Condition Menu</a> for that condition.</li>
                    </ul>
                    <h4><i>Change View</i></h4>
                    <ul>
                        <li><b>All </b>— Shows all Spells and Conditions</li>
                        <li><b>Conditions </b>— Shows all Conditions (Condition Type = Condition)</li>
                        <li><b>Spells </b>— Shows all Spells (Condition Type = Spell)</li>
                        <li><b>Favorites </b>— Shows all Favorites</li>
                    </ul>`
                    
        return notes            
    },
        
    buildSetupMenu = function(handout,initiativeID,turnorderID,timerID,announceID,macroID,statusID,concentrationID,conditionsID,exportID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155095/jC-VGZKJY2kweDvEfeIKRA/original.png?15953856105">
                        </p>
                        <h4><i>Combat Setup</i></h4>
                        <ul>
                            <ul>
                                <li><b><a href="http://journal.roll20.net/handout/${initiativeID}">Initiative</a></b> — Configure how CombatMaster will roll Initiative.<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${turnorderID}">Turnorder</a></b> — Configure how the turnorder is managed.<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${timerID}">Timer</a></b> — Configure a timer, its length, and how it is displayed.<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${announceID}">Announce</a></b> — Configure how turns are announced in chat.<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${macroID}">Macro &amp; API</a></b> — Configure substitution strings for use in macros and API commands.<br></li>
                            </ul>
                        </ul>
                        <h4><i>Status Setup</i></h4>
                        <ul>
                            <ul>
                                <li><b><a href="http://journal.roll20.net/handout/${statusID}">Status</a></b> — Configure how conditions are managed and displayed.<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${concentrationID}">Concentration</a></b> — Configure how Concentration is managed and displayed<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${conditionsID}">Conditions</a></b> — A list of all conditions in CombatMaster; here, you can edit existing conditions or add new ones.<br></li>
                                <li><b><a href="http://journal.roll20.net/handout/${exportID}">Export</a></b> — Puts a configuration code in chat to copy so you can import your conditions and settings into another game with CombatMaster. Simply triple-click the code to select it entirely (this also avoids selecting anything outside the code block). Save it in a handout to easily transmogrify to other games, or save it as a file on your computer.<br></li>
                                <li><b>Import </b>— Import your configuration from another game.<br><b>NOTE:</b> <i>If migrating from CombatMaster to another CombatMaster, it will copy the entire CombatMaster configuration.  If coming from CombatTracker, it will only copy the conditions and you’ll have to reconfigure everything else. Importing from StatusInfo is not supported.<br></i></li>
                            </ul>
                        </ul>
                        <h4><i>Resets</i></h4>                      
                        <ul>
                            <li><b>Reset </b>— This resets the entire session state. It defaults the conditions to D&amp;D 5e.<br></li>
                            <li><b>Remove Ignores </b>— This Removes all Spells from the ignore list<br></li>
                            <li><b>Clear Token Statuses</b>— This Removes all Conditions/Spells assigned to selected tokens<br></li>
                        </ul>
                    </div>`
                    
        handout.set({notes:notes}); 
    },   

    buildInitiativeMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155099/rjAlxljzxTzHNp94R3FQaQ/original.png?15953856105">
                        </p>
                        <h4><i>Initiative Setup</i></h4>
                        <ul>
                            <ul>
                                <li><b>None </b>— CombatMaster may be configured to not roll initiative.  You can have each character roll initiative on their own.<br><b>NOTE: </b><i>If you choose to not roll initiative from CombatMaster, the turn order will need to be set before starting combat.</i></li>
                                <li><b>CombatMaster </b>— CombatMaster has its own initiative roller. To use it, select the tokens involved in the encounter, then click the Start button in the Main Menu.<br></li>
                                <ul>
                                    <li><b>Roll Each Round </b>— Rerolls initiative at the end of each round.<br></li>
                                    <li><b>Initiative Attr </b>— Accepts a comma delimited list of attributes that make up initiative. The attribute name must match the attribute names in the character sheet.</li>
                                    <li><b>Initiative Die </b>— Set the type of dice that CombatMaster will roll for each character.<br></li>
                                    <li><b>Show Initiative in Chat </b>— Displays the initiative rolls in chat.<br></li>
                                </ul>
                                <li><b>Group-Init </b>— Calls on GroupInitiative to build the turnorder when you click the Start button in the Main Menu.<br><b>NOTE: </b><i>If you choose Group-Init, the GroupInitiative script must be installed in your game and configured outside of CombatMaster.</i></li><ul><li><b>Roll Each Round </b>— Rerolls initiative at the end of each round.</li>
                                <li><b>Target Tokens </b>— Not functional yet></li>
                            </ul>
                        </ul>
                    </div>`

        handout.set({notes:notes});     
    },     

    buildTurnorderMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155089/ITDSxgaL_xtJ7w_jiNg0gA/original.png?15953856105">
                        </p>    
                        <h4><i>Turnorder Setup</i></h4>
                        <ul>
                            <ul>
                                <li><b>Sort Turnorder </b>— Sorts the turnorder in descending sequence (only) once created.<br></li>
                                <li><b>Center Map on Token </b>— Will center the map for all players on the token currently active in the turnorder using the Ping function. This will not center the map if the token is on the GM Layer.<br></li>
                                <li><b>Use Marker </b>— Determines if the marker is visible to players or always stays on the GM Layer. If visible, the marker will only move to the GM Layer if a token in the turnorder is on the GM Layer. It will do switch layers before moving to that token, and after moving to the next token, so as not to give away the position of any tokens hidden from players.<br></li><li><b>Marker Type </b>— Set to External URL (default) or can be set to Token Marker.  If Token Marker is selected a suitable token must be uploaded to your game.</li><li><b>Marker </b>— A thumbnail of what will be used to highlight the current active character.</li><li><b>Use Next Marker </b>— If set to true will display another marker around the player that is next in the turnorder.  If set to false, then the next player up is not highlighted.</li>
                                <li><b>Use Next Marker </b>— A thumbnail of what will be used to highlight the next active character. Set to None if you don't need it</li>
                            </ul>
                        </ul>`
            notes +=    buildExternalCallMenu('<b>Beginning of Each Round</b>')
            notes +=    buildExternalCallMenu("<b>Beginning of Each Turn</b>")
            notes +=    `</div>`
        
        handout.set({notes:notes}); 
    },      
    
    buildExternalCallMenu = function(title,round,condition) {
        let notes = `<h4><i>${title}</i></h4>
                     <h5><i> Set various external calls which will be invoked</i></h5>
                    <ul>
                        <li><b>API </b>— Must be a full API command. You must use brackets {{ and }} around the command and around each parameter when entering the command. Any inline rolls must be written like [#[1d6]#] instead of [[1d6]].</li>
                        <li><b>Roll20AM </b>— Must be a full Roll20AM command. You must use brackets {{ and }} around the command and around each parameter when entering the command.</li>
                        <li><b>FX </b>— Must be a valid FX command.</li>`
        if (round) {
            notes +=    `<li><b>Characters Macro </b>— This uses a global macro substituting in all player characters on the map. Follows other macro rules (see below)</li>
                         <li><b>All Tokens Macro </b>— This uses a global macro substituting in all tokens on the map. Follows other macro rules (see below)</li>`
        } else {
            notes +=    `<li><b>Macro </b>— Must be the full macro name (without the #). Any inline rolls within the macro must be written like [#[1d6]#] instead of [[1d6]].</li>`
        }
        if (condition) {
            notes +=    `<li><b>Persistent Macro</b> — Determines if the assigned macro is repeated at the start of an affected token's turn.`    
        }
        notes +=    `</ul>`

        return notes  
    },    
    
    buildTimerMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155088/xni0bvuiAktNfbrTbUAPog/original.png?15953856105">
                        </p>
                        <h4><i>Timer Setup</i></h4>
                        <ul>
                            <li><b>Turn Timer </b>— Setting to true turns on the timer. The timer displays a red second by second countdown under the current active token in turnorder.<br>&lt;Image of a token with the timer below it&gt;<br></li>
                            <li><b>Time </b>— Determine the total time in seconds that the active token has to complete the turn.<br></li><li><b>Skip Turn </b>— Automatically advances to the next turn when the timer reaches 0.<br></li>
                            <li><b>Send to Chat </b>— Sends intermittent alerts to chat when the timer starts, when it reaches the halfway point, when it reaches 10 seconds, and when it reaches 5 seconds.<br></li>
                            <li><b>Show on Token </b>— Choose whether to display the timer underneath the active token.<br></li>
                            <li><b>Token Font </b>— Set the font for the displayed timer.<br></li>
                            <li><b>Token Font Size </b>—  Set the font size for the displayed timer.</li>
                        </ul>
                    </div>`
                    
        handout.set({notes:notes}); 
    },      
 
     buildAnnouncementsMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155098/7i1LPHIZ87fVB56cUMcvhw/original.png?15953856105">
                        </p>
                        <h4><i>Announcements Setup</i></h4>
                        <ul>
                            <li><b>Announce Rounds </b>— Sends a message to chat when a new round has started.</li>
                            <li><b>Announce Turns </b>— Sends a message to chat with the current active token if it is not on the GM Layer, plus any assigned conditions or messages.<br>
                                <ul>
                                    <li><img src="https://s3.amazonaws.com/files.d20.io/images/152224865/IupB8psepZNaKPSkDB1UhA/original.png?15954302265"></li>
                                    <li><b>Down Arrow Icon </b>— Delays Player Turn.</li>
                                    <li><b>CheckBox Icon </b>— Ends Player Turn.</li>
                                    <li><b>Condition Name </b>— Click on it to view Condition Description.</li>
                                    <li><b>Trashcan Icon </b>— Click on it to remove Condition from Token.</li>
                                </ul>    
                            </li>
                            <li><b>Whisper GM Only </b>— Choose whether all announcements are only sent to the GM.<br></li>
                            <li><b>Shorten Long Names </b>— Shortens the token name as displayed in the turn announcement.<br></li>
                            <li><b>Show NPC Conditions </b>— Choose whether NPC turn announcements are only sent to the GM.<br></li>
                        </ul>
                    </div>`
        handout.set({notes:notes}); 
    },      

     buildMacroMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes"><p>This menu is for setting up strings to substitute for various types of calls in Macros and APIs. For example, if you want CombatMaster to run a macro that would normally use @{selected|character_id}, you would need to set up a substitution string for CharID, then use that string in place of @{selected|character_id} in the macro itself.</p><p>Substitution strings work best as unique terms that won't be used elsewhere in a command or macro, otherwise CombatMaster may insert a substituted call somewhere it doesn't belong. So you'd want the TokenID substitute to be something like 'tokenidentifier' since that isn't likely to be used anywhere else, whereas 'name' is not a good substitute, because it is a word that is likely to be used in other contexts.</p><p>The PlayerID substitution string is specifically for use in TokenMod commands. If you set the PlayerID substitution to something like 'playeridentifier', then a TokenMod command in CombatMaster would look like this:</p><pre>!token-mod --api-as playeridentifier --ids tokenidentifier --on showname<br></pre>
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155094/0ZAC_3VwnVxEL_ZLfgo-iA/original.png?15953856105">
                        </p>
                        <h4><i>Macro & API Setup</i></h4>
                        <ul>
                            <li><b>Type </b>— The type of call being substituted.<br></li>
                            <li><b>String </b>— The substitution string you have set up, for use in API commands and macros.<br></li>
                            <li><b>Delete </b>— Delete the substitution on this line.<br></li>
                            <li><b>Add Substitution </b>— Create a new substitution string.<br></li>
                        </ul>
                    </div>`
        handout.set({notes:notes}); 
    },      

     buildStatusMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155103/WF7QJJUMbfTjTjPWyd8SYQ/original.png?15953856105">
                        </p>
                        <h4><i>Status Setup</i></h4>
                        <ul>
                            <li><b>Whisper GM Only </b>— Choose whether condition descriptions are only sent to the GM.<br></li>
                            <li><b>Player Allowed Changes </b>— When this is turned on, the player active in the turnorder receives a Menu where they can add or remove conditions from their token.<br></li>
                            <li><b>Send Changes to Chat </b>— Choose whether condition descriptions are sent to chat when a condition is added to a token.<br></li>
                            <li><b>Clear Conditions on Close </b>— Choose whether stopping combat removes conditions from all tokens.<br></li>
                            <li><b>Use Messages </b>— Enables messages to be included with conditions; will query for a message whenever a condition is added to a token.<br></li>
                            <li><b>Auto Add Spells </b>— Enables Combat Master to detect spells and add them to Combat Master.  Note: Not all spells can be detected due to programming of that sheet<br></li>
                            <li><b>Sheet </b>— Current Supported Sheets (OGL, Shaped, PF2, PF1)<br></li>
                        </ul>
                    </div>`
        handout.set({notes:notes});    
    },   
    
    buildConcentrationMenu = function(handout,setupID) {
         let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155091/gy3wl9H_uHBHWeQXcRk5cw/original.png?15953856105">
                        </p>
                        <h4><i>Concentration Setup</i></h4>
                        <ul>
                            <li><b>Use Concentration </b>— Enables Concentration process<br></li>
                            <li><b>Player Allowed Changes </b>— When this is turned on, the player active in the turnorder receives a Menu where they can add or remove conditions from their token.<br></li>
                            <li><b>Send Changes to Chat </b>— Choose whether condition descriptions are sent to chat when a condition is added to a token.<br></li>
                            <li><b>Clear Conditions on Close </b>— Choose whether stopping combat removes conditions from all tokens.<br></li>
                            <li><b>Use Messages </b>— Enables messages to be included with conditions; will query for a message whenever a condition is added to a token.<br></li>
                            <li><b>Auto Add Spells </b>— Enables Combat Master to detect spells and add them to Combat Master.  Note: Not all spells can be detected due to programming of that sheet<br></li>
                            <li><b>Sheet </b>— Current Supported Sheets (OGL, Shaped, PF2, PF1)<br></li>
                        </ul>
                    </div>`   
        handout.set({notes:notes});             
    },    
    
    buildConditionsMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155101/zyFZLPVbsoAT7a1CI9bVEg/original.png?15953856105">
                        </p>
                        <h4><i>Conditions Menu</i></h4>
                        <ul>
                            <li><b>Icon </b>— The default or custom token marker assigned to the condition is displayed here. If the condition uses the TokenCondition script, it will simply show "TC" here.</li><li><b>Name </b>— The name of the condition.</li>
                            <li><b>Edit </b>— Shows the <a href="http://journal.roll20.net/handout/-M5yiGl9bj-bn0V-72pd">Condition Editing Menu</a> for that condition.</li>
                            <li><b>Add Condition </b>— Create a new condition. You will first be prompted for a condition name, then it will show you the new condition's Editing Menu.<br></li>
                        </ul>
                    </div>`
        handout.set({notes:notes});             
        
    },      
    
    buildConditionMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155092/bngB_blWo6C8bSBvU6ytGw/original.png?15953856105">
                        </p>
                        <h4><i>Condition Menu</i></h4>
                        <ul>
                            <li><b>Name </b>— The name of the condition<br></li>
                            <li><b>Type </b>— Determines if a Spell or Condition.  Set to spell if using concentration<br></li>
                            <li><b>Icon Type </b>— Determines what options are presented when clicking <b>Icon</b>.<br></li>
                            <ul>
                                <li>CombatMaster — Lets you pick from Roll20 default markers only.</li>
                                <li>TokenMarker — Requires the libTokenMarker script; lets you pick from any marker sets in your game, including Roll20 default.<br><b>NOTE:</b> <i>Token marker names with spaces may cause issues, it is recommended to avoid spaces in token marker names.</i></li>
                                <li>TokenCondition — Requires the TokenCondition script; lets you pick from any characters used by this script.<br></li>
                            </ul>
                            <li><b>Icon </b>— Thumbnail of the marker that will be used by the current condition; click to change (options based on your selection for <b>Icon Type</b>). If using TokenCondition for the condition, thumbnail will be replaced by "TC".<br></li>
                            <li><b>Duration </b>— Defines the length of the condition before it is removed.<br></li>
                            <li><b>Direction </b>— Defines how quickly the duration is reduced each round.  Set to a negative number to reduce the duration, positive number if it increases over time, or 0.  If 0, it remains permanently on the token until manually removed.</li>
                            <li><b>Override </b>— Determines if the direction/duration can be overridden when assigning the condition to the token.  For conditions that do not change, set override to  false and the direction/duration roll queries do not display when assigning the condition.</li>
                            <li><b>Favorites </b>— Determines if the condition shows in the Favorites menu.  This can also be set on the Main Menu.  The Favorites menu shows only conditions marked as Favorite.<br></li>
                            <li><b>Message </b>— Set a default message that will show along with the condition. It can be overridden when assigning the condition. If you have commas in the description, use brackets {{ and }} around it when entering it.<br></li>
                            <li><b>Targeted </b>— Determines if the condition applies to another token; useful for effects that affect one or more targets but have a duration based on the caster's turn. Applies the condition's marker to the target token(s). Rather than using the @{target} feature, the GM will see the following message in chat:<br>&lt;Image of the Select Targets message&gt;<br></li>
                            <li><b>Concentration </b>— Set to true if a Spell and Spell causes concentration on the caster<br></li>
                            <li><b>Add API </b>— Displays the Add API Menu.  Click on this if you want an external API call when adding a condition to a token(s)<br></li>
                            <li><b>Remove API </b>— Displays the Remove API Menu.  Click on this if you want an external API call when removing a condition from a token(s)<br></li>
                            <li><b>Edit Description </b>— Add a description to condition.  Use {{ }} if there's periods or commas in descrription<br></li>
                            <li><b>Delete Condition </b>— Delete the condition from CombatMaster.<br></li>
                        </ul>
                     </div>`
                
        handout.set({notes:notes});  
    },      
    
    buildAddAPIMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes"><p>Use the Macro & API menu to setup Substitution Strings if needed. For example, if you want CombatMaster to run a macro that would normally use @{selected|character_id}, you would need to set up a substitution string for CharID, then use that string in place of @{selected|character_id} in the macro itself.</p><p>Substitution strings work best as unique terms that won't be used elsewhere in a command or macro, otherwise CombatMaster may insert a substituted call somewhere it doesn't belong. So you'd want the TokenID substitute to be something like 'tokenidentifier' since that isn't likely to be used anywhere else, whereas 'name' is not a good substitute, because it is a word that is likely to be used in other contexts.</p><p>The PlayerID substitution string is specifically for use in TokenMod commands. If you set the PlayerID substitution to something like 'playeridentifier', then a TokenMod command in CombatMaster would look like this:</p><pre>!token-mod --api-as playeridentifier --ids tokenidentifier --on showname<br></pre>
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155097/fpdZk-v1a2C7miDJmJ1NIA/original.png?15953856105">
                        </p>`
            notes +=    buildExternalCallMenu('<b>Add API</b>')              

        handout.set({notes:notes});  
    },      

    buildRemoveAPIMenu = function(handout,setupID) {
        let notes = `<div class="content note-editor notes"><p>Use the Macro & API menu to setup Substitution Strings if needed. For example, if you want CombatMaster to run a macro that would normally use @{selected|character_id}, you would need to set up a substitution string for CharID, then use that string in place of @{selected|character_id} in the macro itself.</p><p>Substitution strings work best as unique terms that won't be used elsewhere in a command or macro, otherwise CombatMaster may insert a substituted call somewhere it doesn't belong. So you'd want the TokenID substitute to be something like 'tokenidentifier' since that isn't likely to be used anywhere else, whereas 'name' is not a good substitute, because it is a word that is likely to be used in other contexts.</p><p>The PlayerID substitution string is specifically for use in TokenMod commands. If you set the PlayerID substitution to something like 'playeridentifier', then a TokenMod command in CombatMaster would look like this:</p><pre>!token-mod --api-as playeridentifier --ids tokenidentifier --on showname<br></pre>
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155093/xt61MIhDuu93ZCOu7Tt8xA/original.png?15953856105">
                        </p>`
            notes +=    buildExternalCallMenu('<b>Remove API</b>')              

        handout.set({notes:notes});  
    },     
    
    buildExportMenu = function(handout) {
        let notes = `<div class="content note-editor notes">
                        <p>
                            <img src="https://s3.amazonaws.com/files.d20.io/images/152155090/ilEH0Pon0ovgR1LMmKEAag/original.png?15953856105">
                        </p>
                        <h4><i>Export Menu</i></h4>
                        <p>This configuration code can be copied so you can import your conditions and settings into another game with CombatMaster. Simply triple-click the code to select it entirely (this also avoids selecting anything outside the code block). Save it in a handout to easily transmogrify to other games, or save it as a file on your computer.</p>
                        <p><b>NOTE:</b> <i>If migrating from CombatMaster to another CombatMaster, it will copy the entire CombatMaster configuration.  If coming from CombatTracker, it will only copy the conditions and you’ll have to reconfigure everything else. Importing from StatusInfo is not supported.</i></p>
                    </div>`
                    
        handout.set({notes:notes});            
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
        on('change:graphic:'+state[combatState].config.concentration.woundBar+'_value', handleConstitutionSave);

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
