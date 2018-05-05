/* 
 * Version 0.1.10
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Roll20 Thread: https://app.roll20.net/forum/post/6349145/script-combattracker
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

/* TODO
 *
 * Styling
 * More chat message options
 * Show menu with B shows always
 * Add icon if not StatusInfo (?)    (IF YES, remove conditions on statusmarker remove)
 * Edit Conditions
*/

var CombatTracker = CombatTracker || (function() {
    'use strict';

    let round = 1,
        timerObj,
        intervalHandle,
        observers = {
            tokenChange: []
        };

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        list: 'list-style: none;',
        float: {
            right: 'float: right;',
            left: 'float: left;'
        },
        overflow: 'overflow: hidden;',
        fullWidth: 'width: 100%;',
        underline: 'text-decoration: underline;',
        strikethrough: 'text-decoration: strikethrough'
    },
    script_name = 'CombatTracker',
    state_name = 'COMBATTRACKER',

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if(command !== state[state_name].config.command) return;

        if(extracommand === 'next'){
            if(playerIsGM(msg.playerid) || msg.playerid === 'api'){
                NextTurn();
                return;
            }

            let turn = getCurrentTurn(),
                token;
            if(token = getObj('graphic', turn.id)){
                let character = getObj('character', token.get('represents'));
                if((token.get('controlledby').split(',').includes(msg.playerid) || token.get('controlledby').split(',').includes('all')) ||
                    (character && (character.get('controlledby').split(',').includes(msg.playerid) || character.get('controlledby').split(',').includes(msg.playerid)))){
                        NextTurn();
                        // SHOW MENU
                    }
            }
        }

        // Below commands are only for GM's
        if(!playerIsGM(msg.playerid)) return;

        switch(extracommand){
            case 'help':
                sendHelpMenu();
            break;

            case 'reset':
                switch(args.shift()){
                    case 'conditions':
                        state[state_name].conditions = {}
                    break;

                    default:
                        state[state_name] = {};
                        setDefaults(true);
                        sendConfigMenu();
                    break;
                }
            break;

            case 'config':
                if(args[0] === 'timer'){
                    if(args[1]){
                        let setting = args[1].split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config.timer[key] = value;
                    }

                    sendConfigTimerMenu();
                }else if (args[0] === 'announcements'){
                    if(args[1]){
                        let setting = args[1].split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config.announcements[key] = value;
                    }

                    sendConfigAnnounceMenu();
                }else{
                    if(args[0]){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                }                 
            break;

            case 'start':
                startCombat(msg.selected);

                if(args.shift() === 'b') sendMenu();
            break;

            case 'stop':
                stopCombat();

                if(args.shift() === 'b') sendMenu();
            break;

            case 'st':
                stopTimer();

                if(args.shift() === 'b') sendMenu();
            break;

            case 'add':
                let name = args.shift(),
                    duration = args.shift(),
                    condition = { name, duration };

                if(!msg.selected || !msg.selected.length || !name) return;

                msg.selected.forEach(s => {
                    let token = getObj(s._type, s._id);
                    if(!token) return;

                    addCondition(token, condition, true);
                });
            break;

            case 'remove':
                let cname = args.shift();

                if(!msg.selected || !msg.selected.length || !cname) return;

                msg.selected.forEach(s => {
                    let token = getObj(s._type, s._id);
                    if(!token) return;

                    removeCondition(token, cname);
                });
            break;

            default:
                sendMenu();
            break;
        }
    },

    addCondition = (token, condition, announce=false) => {
        if('undefined' !== typeof StatusInfo && StatusInfo.getConditionByName){
            const duration = condition.duration;
            condition = StatusInfo.getConditionByName(condition.name) || condition;
            condition.duration = duration;
        }

        if(condition.duration === 0 || condition.duration === '') condition.duration = undefined;

        if(state[state_name].conditions[strip(token.get('name'))]){
            let hasCondition = false;
            state[state_name].conditions[strip(token.get('name'))].forEach(c => {
                if(c.name.toLowerCase() === condition.name.toLowerCase()) hasCondition = true;
            })
            if(hasCondition) return;

            state[state_name].conditions[strip(token.get('name'))].push(condition);
        }else{
            state[state_name].conditions[strip(token.get('name'))] = [condition];
        }

        if(condition.icon){
            let prevSM = token.get('statusmarkers');
            token.set('status_'+condition.icon, true);
            if(announce && 'undefined' !== typeof StatusInfo && StatusInfo.sendConditionToChat){
                StatusInfo.sendConditionToChat(condition);
            }
        }else makeAndSendMenu('Condition ' + condition.name + ' added to ' + token.get('name'));
    },

    removeCondition = (token, condition_name, auto=false) => {
        if(!state[state_name].conditions[strip(token.get('name'))]) return;

        let si_condition = false;
        if('undefined' !== typeof StatusInfo && StatusInfo.getConditionByName){
            si_condition = StatusInfo.getConditionByName(condition_name) || false;
        }

        state[state_name].conditions[strip(token.get('name'))].forEach((condition, i) => {
            if(condition.name.toLowerCase() !== condition_name.toLowerCase()) return;

            state[state_name].conditions[strip(token.get('name'))].splice(i, 1);

            if(si_condition){
                //StatusInfo.Conditions([condition_name], [token], 'remove', false);
                token.set('status_'+condition.icon, false);
            }else if(!auto){
                makeAndSendMenu('Condition ' + condition.name + ' removed from ' + token.get('name'));
            }
        });
    },

    strip = (str) => {
        return str.replace(/[^a-zA-Z0-9]+/g, '_');
    },

    handleTurnorderChange = (obj, prev) => {
        if(obj.get('turnorder') === prev.turnorder) return;

        let turnorder = (obj.get('turnorder') === "") ? [] : JSON.parse(obj.get('turnorder'));
        let prevTurnorder = (prev.turnorder === "") ? [] : JSON.parse(prev.turnorder);

        if(obj.get('turnorder') === "[]"){
            resetMarker();
            stopTimer();
            return;
        }

        if(turnorder.length && prevTurnorder.length && turnorder[0].id !== prevTurnorder[0].id){
            doTurnorderChange();
        }
    },

    handleGraphicChange = (obj, prev) => {
        if(!inFight()) return;

        if(getCurrentTurn().id === obj.get('id')){
            changeMarker(obj);
        }

        if('undefined' !== typeof StatusInfo && StatusInfo.getConditions){

            prev.statusmarkers = (typeof prev.get === 'function') ? prev.get('statusmarkers') : prev.statusmarkers;

            if(obj.get('statusmarkers') !== prev.statusmarkers){
                let nS = obj.get('statusmarkers').split(','),
                    oS = prev.statusmarkers.split(',');

                // Marker added?
                array_diff(oS, nS).forEach(icon => {
                    getObjects(StatusInfo.getConditions(), 'icon', icon).forEach(condition => {
                        addCondition(obj, { name: condition.name });
                    });
                })

                // Marker Removed?
                array_diff(nS, oS).forEach(icon => {
                    getObjects(StatusInfo.getConditions(), 'icon', icon).forEach(condition => {
                        removeCondition(obj, condition.name);
                    });
                })
            }
        }
    },

    array_diff = (a, b) => {
        return b.filter(function(i) {return a.indexOf(i) < 0;});
    },

    //return an array of objects according to key, value, or key and value matching
    getObjects = (obj, key, val) => {
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

    startCombat = (selected) => {
        resetMarker();
        Campaign().set('initiativepage', Campaign().get('playerpageid'));

        if(selected && state[state_name].config.throw_initiative){
            rollInitiative(selected, true);
        }
    },

    inFight = () => {
        return (Campaign().get('initiativepage') !== false);
    },

    rollInitiative = (selected, sort) => {
        let character;
        selected.forEach(s => {
            if(s._type !== 'graphic') return;

            let token = getObj('graphic', s._id),
                //whisper = (token.get('layer') === 'gmlayer') ? '/w gm ' : '',
                bonus = parseFloat(getAttrByName(token.get('represents'), state[state_name].config.initiative_attribute_name, 'current')) || 0;
                let pr = randomBetween(1,20)+bonus
                pr = (Math.round(pr) !== pr) ? pr.toFixed(2) : pr;
                
                addToTurnorder({ id: token.get('id'), pr, custom: '', pageid: token.get('pageid') });
        });

        if(sort){
            sortTurnorder();
        }
    },

    stopCombat = () => {
        if(timerObj) timerObj.remove();
        clearInterval(intervalHandle);
        removeMarker();
        Campaign().set({
            initiativepage: false,
            turnorder: ''
        });
        state[state_name].turnorder = {};
        round = 1;
    },

    removeMarker = () => {
        getOrCreateMarker().remove();
    },

    resetMarker = () => {
        let marker = getOrCreateMarker();
        marker.set({
            name: 'Round ' + round,
            imgsrc: state[state_name].config.marker_img,
            pageid: Campaign().get('playerpageid'),
            layer: 'gmlayer',
            left: 35, top: 35,
            width: 70, height: 70
        });
    },

    doTurnorderChange = () => {
        if(!Campaign().get('initiativepage')) return;

        let turn = getCurrentTurn();

        if(turn.id === '-1') return;
        if(turn.id === getOrCreateMarker().get('id')){
            NextRound();
            return;
        }

        let token = getObj('graphic', turn.id);
        toFront(token);

        if(state[state_name].config.timer.use_timer){
            startTimer(token);
        }

        changeMarker(token || false);

        if(state[state_name].config.announcements.announce_turn){
            announceTurn(token || turn.custom, (token.get('layer') === 'objects') ? '' : 'gm')
        }else if(state[state_name].config.announcements.announce_conditions){
            let name = token.get('name') || turn.custom;
            let conditions = getConditionString(token);
            if(conditions && conditions !== '') makeAndSendMenu(conditions, 'Conditions - ' + name, (token.get('layer') === 'objects') ? '' : 'gm');
        }
    },

    startTimer = (token) => {
        clearInterval(intervalHandle);
        if(timerObj) timerObj.remove();

        let config_time = parseInt(state[state_name].config.timer.time); 
        let time = config_time;

        if(token && state[state_name].config.timer.token_timer){
            timerObj = createObj('text', {
                text: 'Timer: ' + time,
                font_size: state[state_name].config.timer.token_font_size,
                font_family: state[state_name].config.timer.token_font,
                color: state[state_name].config.timer.token_font_color,
                pageid: token.get('pageid'),
                layer: 'gmlayer'
            });
        }

        intervalHandle = setInterval(() => {
            if(timerObj) timerObj.set({
                top: token.get('top')+token.get('width')/2+40,
                left: token.get('left'),
                text: 'Timer: ' + time,
                layer: token.get('layer')
            });

            if(state[state_name].config.timer.chat_timer && (time === config_time || config_time/2 === time || config_time/4 === time || time === 10 || time === 5)){
                makeAndSendMenu('', 'Time Remaining: ' + time);
            }

            if(time <= 0){
                if(timerObj) timerObj.remove();
                clearInterval(intervalHandle);
                NextTurn();
            }

            time--;
        }, 1000);
    },

    stopTimer = () => {
        clearInterval(intervalHandle);
        if(timerObj) timerObj.remove();
    },

    announceTurn = (token, target) => {
        let name, imgurl;
        if(typeof token === 'object'){
            name = token.get('name');
            imgurl = token.get('imgsrc');
        }else{
            name = token;
        }

        let conditions = getConditionString(token);

        let image = (imgurl) ? '<img src="'+imgurl+'" width="50px" height="50px" style="'+styles.float.left+'" />' : '';

        let contents = '\
        <div style="line-height: 50px; overflow: hidden; padding-bottom: 10px; margin-bottom: 10px; border-bottom: 1px solid #fcfcfc;"> \
          '+image+' \
          <span style="font-size: 16pt ; margin-left: 10px ; float: left">'+handleLongString(name)+'\'s Turn</span> \
        </div> \
        <div style="overflow: hidden"> \
          <div style="float: left">'+conditions+'</div> \
          ' + makeButton('Done', '!'+state[state_name].config.command+' next', styles.button + styles.float.right) +' \
        </div>'
        makeAndSendMenu(contents, '', target);
    },

    getConditionString = (token) => {
        let name = strip(token.get('name'));
        let conditionsSTR = '';

        if(state[state_name].conditions[name] && state[state_name].conditions[name].length){
            state[state_name].conditions[name].forEach((condition, i) => {
                if(typeof condition.duration === 'undefined' || condition.duration === false){
                    conditionsSTR += '<b>'+condition.name+'</b><br>';
                }else if(condition.duration <= 0){
                    conditionsSTR += '<b>'+condition.name+'</b> removed.<br>';
                    removeCondition(token, condition.name, true);
                }else{
                    conditionsSTR += '<b>'+condition.name+'</b>: ' + condition.duration + '<br>';
                    state[state_name].conditions[name][i].duration--;
                }
            });
        }
        return conditionsSTR;
    },

    handleLongString = (str, max=8) => {
        str = str.split(' ')[0];
        return (str.length > max) ? str.slice(0, 8) + '...' : str;
    },

    NextTurn = () => {
        let turnorder = getTurnorder(),
            current_turn = turnorder.shift();
        turnorder.push(current_turn);

        setTurnorder(turnorder);
        doTurnorderChange();
    },

    NextRound = () => {
        let marker = getOrCreateMarker();
        round++;
        marker.set({ name: 'Round ' + round});

        if(state[state_name].config.announcements.announce_round){
            let text = '<span style="font-size: 16pt; font-weight: bold;">'+marker.get('name')+'</span>';
            makeAndSendMenu(text);
        }

        NextTurn();
    },

    changeMarker = (token) => {
        let marker = getOrCreateMarker();

        if(!token){
            resetMarker();
            return;
        }

        let settings = {
            layer: token.get('layer'),
            top: token.get('top'),
            left: token.get('left'),
            width: token.get('width')+(token.get('width')*0.35),
            height: token.get('height')+(token.get('height')*0.35),
        };

        marker.set(settings);
        toBack(marker);
    },

    getOrCreateMarker = () => {
        let marker,
            img = state[state_name].config.marker_img,
            playerpageid = Campaign().get('playerpageid'),
            markers = findObjs({
            pageid: playerpageid,
            imgsrc: img
        });

        markers.forEach((marker, i) => {
            if(i > 0) marker.remove();
        });

        if(marker = markers.shift()){
        }else{
            marker = createObj('graphic', {
                name: 'Round 0',
                imgsrc: img,
                pageid: playerpageid,
                layer: 'gmlayer',
                left: 35, top: 35,
                width: 70, height: 70
            })
        }
        checkMarkerturn(marker);
        toBack(marker);
        return marker;
    },

    checkMarkerturn = (marker) => {
        let turnorder = getTurnorder(),
            hasTurn = false;
        turnorder.forEach(turn => {
            if(turn.id === marker.get('id')) hasTurn = true;
        });

        if(!hasTurn){
            turnorder.push({ id: marker.get('id'), pr: -1, custom: '', pageid: marker.get('pageid') });
            Campaign().set('turnorder', JSON.stringify(turnorder));
        }
    },

    sortTurnorder = (order='DESC') => {
        let turnorder = getTurnorder();

        turnorder.sort((a,b) => { 
            return (order === 'ASC') ? a.pr - b.pr : b.pr - a.pr;
        });

        setTurnorder(turnorder);
        doTurnorderChange();
    },

    getTurnorder = () => {
        return (Campaign().get('turnorder') === '') ? [] : Array.from(JSON.parse(Campaign().get('turnorder')));
    },

    getCurrentTurn = () => {
        return getTurnorder().shift();
    },

    addToTurnorder = (turn) => {
        if(typeof turn !== 'object') return;

        let turnorder = getTurnorder(),
            justDoIt = true;
        turnorder.forEach(t => {
            if(t.id === turn.id) justDoIt = false;
        });

        if(justDoIt){
            turnorder.push(turn)
            setTurnorder(turnorder);
        }
    },

    setTurnorder = (turnorder) => {
        Campaign().set('turnorder', JSON.stringify(turnorder));
    },

    randomBetween = (min, max) => {
        return Math.floor(Math.random()*(max-min+1)+min);
    },

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right);
        let markerImgButton = makeButton('<img src="'+state[state_name].config.marker_img+'" width="30px" height="30px" />', '!' + state[state_name].config.command + ' config marker_img|?{Image Url}', styles.button + styles.float.right);
        let throwIniButton = makeButton(state[state_name].config.throw_initiative, '!' + state[state_name].config.command + ' config throw_initiative|'+!state[state_name].config.throw_initiative, styles.button + styles.float.right);
        let iniAttrButton = makeButton(state[state_name].config.initiative_attribute_name, '!' + state[state_name].config.command + ' config initiative_attribute_name|'+state[state_name].config.initiative_attribute_name, styles.button + styles.float.right);
        let closeStopButton = makeButton(state[state_name].config.close_stop, '!' + state[state_name].config.command + ' config close_stop|'+!state[state_name].config.close_stop, styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Ini. Attribute:</span> ' + iniAttrButton,
            '<span style="'+styles.float.left+'">Marker Img:</span> ' + markerImgButton,
            '<span style="'+styles.float.left+'">Stop on close:</span> ' + closeStopButton,
            '<span style="'+styles.float.left+'">Auto Roll Ini.:</span> ' + throwIniButton,
        ];

        let configTimerButton = makeButton('Timer Config', '!'+state[state_name].config.command + ' config timer', styles.button);
        let configAnnouncementsButton = makeButton('Announcement Config', '!'+state[state_name].config.command + ' config announcements', styles.button);
        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+configTimerButton+configAnnouncementsButton+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendConfigAnnounceMenu = () =>{
        let announceTurnButton = makeButton(state[state_name].config.announcements.announce_turn, '!' + state[state_name].config.command + ' config announcements announce_turn|'+!state[state_name].config.announcements.announce_turn, styles.button + styles.float.right);
        let announceRoundButton = makeButton(state[state_name].config.announcements.announce_round, '!' + state[state_name].config.command + ' config announcements announce_round|'+!state[state_name].config.announcements.announce_round, styles.button + styles.float.right);
        let announceConditionsButton = makeButton(state[state_name].config.announcements.announce_conditions, '!' + state[state_name].config.command + ' config announcements announce_conditions|'+!state[state_name].config.announcements.announce_conditions, styles.button + styles.float.right);
    
        let listItems = [
            '<span style="'+styles.float.left+'">Announce Turn:</span> ' + announceTurnButton,
            '<span style="'+styles.float.left+'">Announce Round:</span> ' + announceRoundButton,
        ];
    
        if(!state[state_name].config.announcements.announce_turn){
            listItems.push('<span style="'+styles.float.left+'">Announce Conditions:</span> ' + announceConditionsButton)
        }

        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
        makeAndSendMenu(contents, script_name + ' Announcements Config', 'gm');
    },

    sendConfigTimerMenu = () => {
        let turnTimerButton = makeButton(state[state_name].config.timer.use_timer, '!' + state[state_name].config.command + ' config timer use_timer|'+!state[state_name].config.timer.use_timer, styles.button + styles.float.right);
        let timeButton = makeButton(state[state_name].config.timer.time, '!' + state[state_name].config.command + ' config timer time|?{Time|'+state[state_name].config.timer.time+'}', styles.button + styles.float.right);
        let chatTimerButton = makeButton(state[state_name].config.timer.chat_timer, '!' + state[state_name].config.command + ' config timer chat_timer|'+!state[state_name].config.timer.chat_timer, styles.button + styles.float.right);
        let tokenTimerButton = makeButton(state[state_name].config.timer.token_timer, '!' + state[state_name].config.command + ' config timer token_timer|'+!state[state_name].config.timer.token_timer, styles.button + styles.float.right);
        let tokenFontButton = makeButton(state[state_name].config.timer.token_font, '!' + state[state_name].config.command + ' config timer token_font|?{Font|Arial|Patrick Hand|Contrail|Light|Candal}', styles.button + styles.float.right);
        let tokenFontSizeButton = makeButton(state[state_name].config.timer.token_font_size, '!' + state[state_name].config.command + ' config timer token_font_size|?{Font Size|'+state[state_name].config.timer.token_font_size+'}', styles.button + styles.float.right);

        let listItems = [
            '<span style="'+styles.float.left+'">Turn Timer:</span> ' + turnTimerButton,
            '<span style="'+styles.float.left+'">Time:</span> ' + timeButton,
            '<span style="'+styles.float.left+'">Show in Chat:</span> ' + chatTimerButton,
            '<span style="'+styles.float.left+'">Show on Token:</span> ' + tokenTimerButton,
            '<span style="'+styles.float.left+'">Token Font:</span> ' + tokenFontButton,
            '<span style="'+styles.float.left+'">Token Font Size:</span> ' + tokenFontSizeButton,
        ];

        let backButton = makeButton('< Back', '!'+state[state_name].config.command + ' config', styles.button + styles.fullWidth);
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr>'+backButton;
        makeAndSendMenu(contents, script_name + ' Timer Config', 'gm');
    },

    sendMenu = () => {
        let nextButton = makeButton('Next Turn', '!' + state[state_name].config.command + ' next b', styles.button);
        let startCombatButton = makeButton('Start Combat', '!' + state[state_name].config.command + ' start b', styles.button);
        let stopCombatButton = makeButton('Stop Combat', '!' + state[state_name].config.command + ' stop', styles.button);
        let stopTimerButton = makeButton('Stop Timer', '!' + state[state_name].config.command + ' st', styles.button);
        let addConditionButton = makeButton('Add Condition', '!' + state[state_name].config.command + ' add ?{Condition} ?{Duration}', styles.button);
        let removeConditionButton = makeButton('Remove Condition', '!' + state[state_name].config.command + ' remove ?{Condition}', styles.button);

        let contents = (inFight()) ? nextButton+'<br>'+stopTimerButton+'<hr> <b>With Selected:</b> <br>'+addConditionButton+'<br>'+removeConditionButton+'<hr>'+stopCombatButton : startCombatButton;
        makeAndSendMenu(contents, script_name + ' Menu', 'gm');
    },

    sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', styles.button + styles.fullWidth)

        let listItems = [
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' help</span> - Shows this menu.',
            '<span style="'+styles.underline+'">!'+state[state_name].config.command+' config</span> - Shows the configuration menu.',
        ]

        let contents = '<b>Commands:</b>'+makeList(listItems, styles.reset + styles.list)+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name + ' Help', 'gm')
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>', null, {noarchive:true});
    },

    makeTitle = (title) => {
        return '<h3 style="margin-bottom: 10px;">'+title+'</h3>';
    },

    makeButton = (title, href, style) => {
        return '<a style="'+style+'" href="'+href+'">'+title+'</a>';
    },

    makeList = (items, listStyle, itemStyle) => {
        let list = '<ul style="'+listStyle+'">';
        items.forEach((item) => {
            list += '<li style="'+itemStyle+'">'+item+'</li>';
        });
        list += '</ul>';
        return list;
    },

    pre_log = (message) => {
        log('---------------------------------------------------------------------------------------------');
        if(message === 'line'){ return; }
        log(message);
        log('---------------------------------------------------------------------------------------------');
    },

    checkInstall = () => {
        if(!_.has(state, state_name)){
            state[state_name] = state[state_name] || {};
        }
        setDefaults();

        log(script_name + ' Ready! Command: !'+state[state_name].config.command);
        if(state[state_name].config.debug){ makeAndSendMenu(script_name + ' Ready! Debug On.', '', 'gm') }
    },

    handeIniativePageChange = (obj,prev) => {
        if(state[state_name].config.close_stop && (obj.get('initiativepage') !== prev.initiativepage && !obj.get('initiativepage'))){
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

    registerEventHandlers = () => {
        on('chat:message', handleInput);
        on('change:campaign:turnorder', handleTurnorderChange);
        on('change:graphic', handleGraphicChange);
        on('change:campaign:initiativepage', handeIniativePageChange);

        if('undefined' !== typeof StatusInfo && StatusInfo.ObserveTokenChange){
            StatusInfo.ObserveTokenChange(function(obj,prev){
                handleGraphicChange(obj,prev);
            });
        }

        if('undefined' !== typeof TokenMod && TokenMod.ObserveTokenChange){
            TokenMod.ObserveTokenChange(function(obj,prev){
                handleGraphicChange(obj,prev);
            });
        }
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'ct',
                marker_img: 'https://s3.amazonaws.com/files.d20.io/images/52550079/U-3U950B3wk_KRtspSPyuw/thumb.png?1524507826',
                throw_initiative: true,
                initiative_attribute_name: 'initiative_bonus',
                close_stop: true,
                timer: {
                    use_timer: true,
                    time: 120,
                    chat_timer: true,
                    token_timer: true,
                    token_font: 'Candal',
                    token_font_size: 16,
                    token_font_color: 'rgb(255, 0, 0)'
                },
                announcements: {
                    announce_conditions: false,
                    announce_turn: true,
                    announce_round: true,
                }
            },
            conditions: {}
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('marker_img')){
                state[state_name].config.marker_img = defaults.config.marker_img;
            }
            if(!state[state_name].config.hasOwnProperty('throw_initiative')){
                state[state_name].config.throw_initiative = defaults.config.throw_initiative;
            }
            if(!state[state_name].config.hasOwnProperty('initiative_attribute_name')){
                state[state_name].config.initiative_attribute_name = defaults.config.initiative_attribute_name;
            }
            if(!state[state_name].config.hasOwnProperty('close_stop')){
                state[state_name].config.close_stop = defaults.config.close_stop;
            }
            if(!state[state_name].config.hasOwnProperty('timer')){
                state[state_name].config.timer = defaults.config.timer;
            }else{
                if(!state[state_name].config.timer.hasOwnProperty('use_timer')){
                    state[state_name].config.timer.use_timer = defaults.config.timer.use_timer;
                }
                if(!state[state_name].config.timer.hasOwnProperty('time')){
                    state[state_name].config.timer.time = defaults.config.timer.time;
                }
                if(!state[state_name].config.timer.hasOwnProperty('chat_timer')){
                    state[state_name].config.timer.chat_timer = defaults.config.timer.chat_timer;
                }
                if(!state[state_name].config.timer.hasOwnProperty('token_timer')){
                    state[state_name].config.timer.token_timer = defaults.config.timer.token_timer;
                }
                if(!state[state_name].config.timer.hasOwnProperty('token_font')){
                    state[state_name].config.timer.token_font = defaults.config.timer.token_font;
                }
                if(!state[state_name].config.timer.hasOwnProperty('token_font_size')){
                    state[state_name].config.timer.token_font_size = defaults.config.timer.token_font_size;
                }
                if(!state[state_name].config.timer.hasOwnProperty('token_font_color')){
                    state[state_name].config.timer.token_font_color = defaults.config.timer.token_font_color;
                }
            }
            if(!state[state_name].config.hasOwnProperty('announcements')){
                state[state_name].config.announcements = defaults.config.announcements;
            }else{
                if(!state[state_name].config.announcements.hasOwnProperty('announce_turn')){
                    state[state_name].config.announcements.announce_turn = defaults.config.announcements.announce_turn;
                }
                if(!state[state_name].config.announcements.hasOwnProperty('announce_round')){
                    state[state_name].config.announcements.announce_round = defaults.config.announcements.announce_round;
                }
                if(!state[state_name].config.announcements.hasOwnProperty('announce_conditions')){
                    state[state_name].config.announcements.announce_conditions = defaults.config.announcements.announce_conditions;
                }
            }
        }

        if(!state[state_name].hasOwnProperty('conditions')){
            state[state_name].conditions = defaults.conditions;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        ObserveTokenChange: observeTokenChange,
    }
})();

on('ready',function() {
    'use strict';

    CombatTracker.CheckInstall();
    CombatTracker.RegisterEventHandlers();
});

/*
conditions = {
    xandir: [
        { name: 'prone', duration: '1' }
    ]
}
*/