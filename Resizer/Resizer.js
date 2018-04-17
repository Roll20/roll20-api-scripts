/*
 * Version 0.0.9
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1014
 * Roll20: https://app.roll20.net/users/1226016/robin-k
 * Roll20 Thread: https://app.roll20.net/forum/post/6285519/script-resizer/
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
*/

var Resizer = Resizer || (function() {
    'use strict';

    let unit_type, type, width, height, old_width, old_height, token_id, obj, chat_text;

    // Styling for the chat responses.
    const styles = {
        reset: 'padding: 0; margin: 0;',
        menu:  'background-color: #fff; border: 1px solid #000; padding: 5px; border-radius: 5px;',
        button: 'background-color: #000; border: 1px solid #292929; border-radius: 3px; padding: 5px; color: #fff; text-align: center;',
        textButton: "text-decoration: underline; background-color: #fff; color: #000; padding: 0",
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
    script_name = 'Resizer',
    state_name = 'RESIZER',

    // TODO
    // Make tokens larger/smaller by size (tiny, small, medium ...)
    // Make map same size as page

    handleInput = (msg) => {
        if (msg.type != 'api' || !playerIsGM(msg.playerid)) return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'help':
                    sendHelpMenu();
                break;

                case 'menu':
                    sendMenu();
                break;

                case 'reset':
                    state[state_name] = {};
                    setDefaults(true);
                    sendConfigMenu();
                break;

                case 'config':
                    if(args.length > 0){
                        let setting = args.shift().split('|');
                        let key = setting.shift();
                        let value = (setting[0] === 'true') ? true : (setting[0] === 'false') ? false : setting[0];

                        state[state_name].config[key] = value;
                    }

                    sendConfigMenu();
                break;

                // !resizer page
                // !resizer page 50 50
                case 'page':
                    width = args.shift();
                    height = args.shift();
                    unit_type = args.shift();

                    if(obj = getObj('page', getObj('player', msg.playerid).get('lastpage'))){
                        if(width && height){
                            let undoButton = makeButton('Undo', '!'+state[state_name].config.command + ' undo', styles.button);

                            old_width = obj.get('width')*1;
                            old_height = obj.get('height')*1;

                            if(unit_type === 'pixels'){
                                width = width/70;
                                height = height/70;
                            }

                            obj.set({ width, height })

                            chat_text = 'The page is resized to <b>' + width + 'un.</b> by <b>' + height + 'un.</b>.<br><br>'+undoButton;
                        }else{
                            chat_text = 'The size of this page is <b>' + obj.get('width') + 'un.</b> by <b>' + obj.get('height') + 'un.</b>';
                        }
                    }else{
                        chat_text = 'Something went wrong, try again, or contact the developer.';
                    }
                    
                    sendMenu(chat_text);
                break;

                // !resizer undo
                case 'undo':
                    if(obj.length > 1){
                        obj.forEach((o, i) => {
                            o.set({ width: old_width[i], height: old_height[i] })
                        });
                    }else{
                        obj.set({ width: old_width, height: old_height })
                    }

                    sendMenu('I have undone your wrongings!');
                break;

                case 'scale':
                    let amount = args.shift()*1 || 2;

                    if(amount === 1){ return; }

                    let up = (!args.shift() || args.shift() === 'up') ? true : false;
                    
                    let page = getObj('page', getObj('player', msg.playerid).get('lastpage'));
                    let objectsOnPage = findObjs({ _pageid: page.get('id') });

                    let upOrDown = (up) ? 'down' : 'up';
                    let undoButton = makeButton('Undo', '!'+state[state_name].config.command + ' scale ' + amount + ' ' + upOrDown, styles.button);

                    // Do scaling
                    page.set({
                        width: (up) ? page.get('width')*amount : page.get('width')/amount,
                        height: (up) ? page.get('height')*amount : page.get('height')/amount,
                        scale_number: (up) ? page.get('scale_number')*amount : page.get('scale_number')/amount,
                        snapping_increment: (up) ? page.get('snapping_increment')*amount : page.get('snapping_increment')/amount //Check this
                    });

                    objectsOnPage.forEach((o, i) => {
                        if(o.get('type') === 'graphic' || o.get('type') === 'path' || o.get('type') === 'text'){
                            let attributes = {
                                width: (up) ? o.get('width')*amount : o.get('width')/amount,
                                height: (up) ? o.get('height')*amount : o.get('height')/amount,
                                top: (up) ? o.get('top')*amount : o.get('top')/amount,
                                left: (up) ? o.get('left')*amount : o.get('left')/amount,
                            }

                            if(o.get('type') === 'text'){
                                attributes['font_size'] = (up) ? o.get('font_size')*amount : o.get('font_size')/amount;
                            }

                            if(o.get('type') === 'path'){
                                attributes = {
                                    scaleY: (up) ? o.get('scaleY')*amount : o.get('scaleY')/amount,
                                    scaleX: (up) ? o.get('scaleX')*amount : o.get('scaleX')/amount,
                                    top: (up) ? o.get('top')*amount : o.get('top')/amount,
                                    left: (up) ? o.get('left')*amount : o.get('left')/amount,
                                };
                            }

                            o.set(attributes);                            
                        }
                    });  
                    
                    upOrDown = (up) ? 'up' : 'down';
                    sendMenu('The entire page is scaled <b>'+upOrDown+'</b> by <b>'+amount+'</b>.<br><br>'+undoButton);
                break;

                case 'fit':
                    let keepRatio = args.shift() || false;
                    keepRatio = (keepRatio === 'keep_ratio') ? true : false;
                    let ratio, options;

                    if(msg.selected){
                        let page = getObj('page', getObj('player', msg.playerid).get('lastpage'));
                        
                        msg.selected.forEach(graphic => {
                            obj = getObj(graphic._type, graphic._id);

                            ratio = Math.min(page.get('width')*70 / obj.get('width'), page.get('height')*70 / obj.get('height'));

                            options = {
                                width: (keepRatio) ? obj.get('width')*ratio : page.get('width')*70,
                                height: (keepRatio) ? obj.get('height')*ratio : page.get('height')*70,
                                top: (keepRatio) ? obj.get('height')*ratio/2 : page.get('height')*70/2,
                                left: (keepRatio) ? obj.get('width')*ratio/2 : page.get('width')*70/2
                            }
                            
                            obj.set(options);
                        });

                        chat_text = (msg.selected.length > 1) ? 'Selected graphics where fitted to the page.' : 'Selected graphic is fitted to the page.';
                    }else{
                        chat_text = 'No graphics where selected.';
                    }

                    sendMenu(chat_text);
                break;

                case 'center':
                    let horizontal = (args.includes('horizontal') || args.includes('h') || args.includes('hor'));
                    let vertical = (args.includes('vertical') || args.includes('v') || args.includes('ver'));

                    if((!horizontal && !vertical) || !msg.selected) return;

                    msg.selected.forEach(token => {
                        if(obj = getObj(token._type, token._id)){
                            let page;
                            if(page = getObj('page', obj.get('pageid'))){
                                let attributes = {};
                                if(horizontal){ attributes.left = page.get('width')*70/2; }
                                if(vertical){ attributes.top = page.get('height')*70/2; }
                                obj.set(attributes);

                                chat_text = 'The graphic(s) are centered';
                                sendMenu(chat_text);
                            }
                        }
                    });
                break;

                // !resizer
                // !resizer (with selected graphics)
                // !resizer 50 50
                default:
                    width = extracommand;
                    height = args.shift();

                    if(msg.selected && width && height){
                        let undoButton = makeButton('Undo', '!'+state[state_name].config.command + ' undo', styles.button);
                        if(msg.selected.length > 1){
                            old_width = []; old_height = []; obj = []

                            msg.selected.forEach((token, i) => {
                                obj.push(getObj(token._type, token._id));

                                old_width.push(obj[i].get('width'));
                                old_height.push(obj[i].get('height'));

                                obj[i].set({ width, height })
                            })

                            chat_text = 'The graphics are resized to <b>' + width + 'px</b> by <b>' + height + 'px</b>.<br><br>'+undoButton;
                        }else{
                            obj = getObj(msg.selected[0]._type, msg.selected[0]._id)

                            old_width = obj.get('width');
                            old_height = obj.get('height');

                            obj.set({ width, height })

                            chat_text = 'The graphic is resized to <b>' + width + 'px</b> by <b>' + height + 'px</b>.<br><br>'+undoButton;
                        }                        
                    }else if(msg.selected){
                        chat_text = '<b>Sizes</b><br>';
                        msg.selected.forEach(token => {
                            token = getObj(token._type, token._id);
                            chat_text += '<b>'+token.get('name') + ':</b> ' + token.get('width') + 'px by ' + token.get('height') + 'px.<br>';
                        });
                    }

                    sendMenu(chat_text);
                break;
            }
        }
    },

    sendConfigMenu = (first) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right)

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        let contents = makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendHelpMenu = (first) => {
        let configButton = makeButton('Config', '!' + state[state_name].config.command + ' config', styles.button + styles.fullWidth)

        let contents = 'You can find the help '+makeButton('here', 'https://github.com/RobinKuiper/Roll20APIScripts/tree/master/Resizer#resizer', styles.textButton)+'!'+'<hr>'+configButton;
        makeAndSendMenu(contents, script_name + ' Help', 'gm')
    },

    sendMenu = (message) => {
        let getGraphicSizeButton = makeButton('Get Selected Graphics Size', '!' + state[state_name].config.command, styles.button + styles.fullWidth);
        let getPageSizeButton = makeButton('Get Page Size', '!' + state[state_name].config.command + ' page', styles.button + styles.fullWidth);
        let resizeGraphicButton = makeButton('Resize Selected Graphics', '!' + state[state_name].config.command + ' ?{Width} ?{Height}', styles.button + styles.fullWidth);
        let resizePageButton = makeButton('Resize Page', '!' + state[state_name].config.command + ' page ?{Width} ?{Height} ?{Units or Pixels?|Pixels,pixels|Units,units}', styles.button + styles.fullWidth);
        let scaleButton = makeButton('Scale Entire Page', '!' + state[state_name].config.command + ' scale ?{Amount} ?{Choose|Up, up|Down, down}', styles.button + styles.fullWidth);
        let fitButton = makeButton('Make selected fit to page', '!' + state[state_name].config.command + ' fit ?{Ratio|Keep,keep_ratio|Deny, deny}', styles.button + styles.fullWidth);
        let centerButton = makeButton('Center selected Graphics', '!' + state[state_name].config.command + ' center ?{How?|Horizontal,h|Vertical,v|Horizontal&Vertical,h v}', styles.button + styles.fullWidth);

        message = (message) ? '<hr><p>'+message+'</p>' : '';

        let buttons = getGraphicSizeButton+resizeGraphicButton+centerButton+fitButton+'<hr>'+getPageSizeButton+resizePageButton+'<hr>'+scaleButton;

        makeAndSendMenu(buttons+message, script_name + ' Menu', 'gm');
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') && makeTitle(title)
        whisper = (whisper && whisper !== '') && '/w ' + whisper + ' ';
        sendChat(script_name, whisper + '<div style="'+styles.menu+styles.overflow+'">'+title+contents+'</div>');
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

    registerEventHandlers = () => {
        on('chat:message', handleInput);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'resizer'
            }
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };
})();

on('ready',function() {
    'use strict';

    Resizer.CheckInstall();
    Resizer.RegisterEventHandlers();
});