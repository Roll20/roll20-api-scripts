/* EXPERIMENTAL
 * Version 0.1.9
 * Made By Robin Kuiper
 * Skype: RobinKuiper.eu
 * Discord: Atheos#1095
 * Roll20: https://app.roll20.net/users/1226016/robin
 * Github: https://github.com/RobinKuiper/Roll20APIScripts
 * Reddit: https://www.reddit.com/user/robinkuiper/
 * Patreon: https://patreon.com/robinkuiper
 * Paypal.me: https://www.paypal.me/robinkuiper
*/

var SyncPage = SyncPage || (function() {
    'use strict';

    let syncing = false;

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
    script_name = 'SyncPage',
    state_name = 'SYNCPAGE',

    handleInput = (msg) => {
        if (msg.type != 'api') return;

        // Split the message into command and argument(s)
        let args = msg.content.split(' ');
        let command = args.shift().substring(1);
        let extracommand = args.shift();

        if (command == state[state_name].config.command) {
            switch(extracommand){
                case 'help':
                    sendHelpMenu();
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

                case 'show': case 'hide':
                    if(!msg.selected || !msg.selected.length){
                        makeAndSendMenu('Please select some token(s) before using this command.', '', 'gm');
                        return;
                    }

                    let where = args.shift() || 'here';

                    msg.selected.forEach(s => {
                        let token = getObj(s._type, s._id);
                        let gmnotes = token.get('gmnotes');
                        if(gmnotes.includes(extracommand+'_'+where)) return;

                        gmnotes = gmnotes.replace('%3Cbr%3Eshow_'+where, '').replace('%3Cbr%3Ehide_'+where).replace('hide_'+where, '').replace('show_'+where, '');
                        gmnotes += '%3Cbr%3E'+extracommand+'_'+where;

                        token.set('gmnotes', gmnotes);

                        getSyncedObjects(getPagenameById(token.get('pageid')), token.get('id')).forEach(objectid => {
                            if(objectid === token.get('id')) return;

                            let synced_token = getObj(token.get('type'), objectid);
                            if(!synced_token) return;                

                            duplicateToken(token, synced_token);
                        });
                    });
                break;

                default:
                    sendMenu();
                break;
            }
        }
    },

    handlePageChange = (page, prev_page) => {
        let synced_pages;
        // If name is changed to _synced do full sync.
        if(page.get('name') !== prev_page.name && page.get('name').toLowerCase().includes('_synced')){
            doSync(page);
        }else{ // Else sync only settings.
            findObjs({ _type: 'page', name: page.get('name')+'_synced' }).forEach(synced_page => {
                syncPageSettings(page, synced_page);
            });
        }
    },

    handlePageAdd = (page) => {
        if(state[state_name].config.true_copy){
            if(!page.get('name').includes('(Copy)')) return;

            let original_page = findObjs({ type: 'page' , name: page.get('name').split(' (Copy)').shift() }).shift();
            if(original_page){
                doCopy(original_page, page);
            }
        }
    },

    handleTokenCreate = (token) => {
        if(syncing) return;

        getConnectedPagesByName(getPagenameById(token.get('pageid'))).forEach(pageid => {
            if(pageid === token.get('pageid')) return;

            let synced_object = duplicateToken(token, false, pageid);

            addSyncedObjects(getPagenameById(token.get('pageid')), token.get('id'), synced_object.get('id'));
        })
    },

    handleTokenChange = (token, prev_token) => {
        if(syncing) return;

        if(state[state_name].synced_pages[getPagenameById(token.get('pageid'))]){
            getSyncedObjects(getPagenameById(token.get('pageid')), token.get('id')).forEach(objectid => {
                if(objectid === token.get('id')) return;

                let synced_token = getObj(token.get('type'), objectid);
                if(!synced_token) return;                

                duplicateToken(token, synced_token);
            })
        }
    },

    handleTokenDestroy = (token) => {
        if(syncing) return;

        getSyncedObjects(getPagenameById(token.get('pageid')), token.get('id')).forEach(tokenid => {
            removedSyncedObject(getPagenameById(token.get('pageid')), tokenid);

            if(tokenid === token.get('id')) return;

            getObj(token.get('type'), tokenid).remove();
        });
    },

    getPagenameById = (pageid) => {
        return getObj('page', pageid).get('name').toLowerCase().split('_synced')[0]
    },

    duplicateToken = (token, synced_token, pageid) => {
        let attributes = {}

        for(let key in token.attributes){
            if(key !== '_id' && key !== '_type' && key !== '_pageid' && key !== 'imgsrc' && key !== 'gmnotes'){
                attributes[key] = token.attributes[key];
            }
        }

        if(token.get('type') === 'graphic'){
            let original_layer = (synced_token) ? synced_token.get('layer') : token.get('layer');
            if(token.get('gmnotes').includes('show_here')){
                token.set('layer', 'objects');
                attributes.layer = original_layer;
            }

            if(token.get('gmnotes').includes('hide_here')){
                token.set('layer', 'gmlayer');
                attributes.layer = original_layer;
            }

            if(token.get('gmnotes').includes('show_others') && (!synced_token || !synced_token.get('gmnotes').includes('hide_here'))){
                attributes.layer = 'objects';
            }else if(synced_token && synced_token.get('gmnotes').includes('show_here')){
                attributes.layer = original_layer;
            }

            if(token.get('gmnotes').includes('hide_others') && (!synced_token || !synced_token.get('gmnotes').includes('show_here'))){
                attributes.layer = 'gmlayer';
            }else if(synced_token && synced_token.get('gmnotes').includes('show_here')){
                attributes.layer = original_layer;
            }
        }

        if(!synced_token){
            if(token.get('type') === 'graphic') attributes['imgsrc'] = createImgSrc(token.get('imgsrc'));
            attributes['pageid'] = pageid;
            return createObj(token.get('type'), attributes);
        }else{
            synced_token.set(attributes);
            return synced_token;
        }
    },

    // MAYBE NOT NEEDED
    isOnSyncedPage = (pageid) => {
        let isSynced = false;
        state[state_name].synced_pages.forEach(sp => {
            if(isSynced) return;
            if(sp.original_pageid === pageid) isSynced = true;
        });
        return isSynced;
    },

    checkSyncedPages = () => {
        if(!state[state_name].config.refresh_sync) return;

        state[state_name].synced_pages = {};

        let pages = findObjs({ _type: 'page' });
        pages.forEach(page => {
            if(page.get('name').includes('_synced')){
                doSync(page);
            }
        });
    },

    doCopy = (original_page, new_page) => {
        syncing = true;

        syncPageSettings(original_page, new_page);

        findObjs({ pageid: original_page.get('id') }).forEach(original_object => {
            duplicateToken(original_object, false, new_page.get('id'));
        });

        syncing = false;
    },

    doSync = (page) => {
        syncing = true;

        findObjs({ _pageid: page.get('id') }).forEach(obj => {
            obj.remove();
        });

        let original_page = findObjs({ _type: 'page', name: page.get('name').split('_')[0] })[0];

        if(!original_page){
            makeAndSendMenu(page.get('name') + ' original page does not exist anymore.', '', 'gm');
            return;
        }

        syncPageSettings(original_page, page);

        findObjs({ pageid: original_page.get('id') }).forEach(original_object => {
            let synced_object = duplicateToken(original_object, false, page.get('id'));

            addSyncedObjects(original_page.get('name'), original_object.get('id'), synced_object.get('id'));
        });

        syncing = false;
    },

    syncPageSettings = (original_page, synced_page) => {
        synced_page.set({
            showgrid: original_page.get('showgrid'),
            showdarkness: original_page.get('showdarkness'),
            showlighting: original_page.get('showlighting'),
            width: original_page.get('width'),
            height: original_page.get('height'),
            snapping_increment: original_page.get('snapping_increment'),
            grid_opacity: original_page.get('grid_opacity'),
            fog_opacity: original_page.get('fog_opacity'),
            background_color: original_page.get('background_color'),
            gridcolor: original_page.get('gridcolor'),
            grid_type: original_page.get('grid_type'),
            scale_number: original_page.get('scale_number'),
            scale_units: original_page.get('scale_units'),
            gridlabels: original_page.get('gridlabels'),
            diagonaltype: original_page.get('diagonaltype'),
            archived: original_page.get('archived'),
            lightupdatedrop: original_page.get('lightupdatedrop'),
            lightenforcelos: original_page.get('lightenforcelos'),
            lightrestrictmove: original_page.get('lightrestrictmove'),
            lightglobalillum: original_page.get('lightglobalillum'),
        });
    },

    addSyncedObjects = (page_name, original_objectid, synced_objectid) => {
        page_name = page_name.toLowerCase();
        if(!state[state_name].synced_pages[page_name]) state[state_name].synced_pages[page_name] = [];

        let added = false;
        state[state_name].synced_pages[page_name].forEach((objects, i) => {
            if(!objects.includes(original_objectid)) return;
            if(objects.includes(synced_objectid)) return;

            state[state_name].synced_pages[page_name][i].push(synced_objectid);
            added = true;
        });

        if(!added){
            state[state_name].synced_pages[page_name].push([original_objectid, synced_objectid]);
        }
    },

    removedSyncedObject = (page_name, tokenid) => {
        page_name = page_name.toLowerCase();

        state[state_name].synced_pages[page_name] = state[state_name].synced_pages[page_name].filter(objects => !objects.includes(tokenid))
    },
    
    getSyncedObjects = (page_name, objectid) => {
        return state[state_name].synced_pages[page_name.toLowerCase()].filter(objects => objects.includes(objectid))[0] || [];
    },

    getConnectedPagesByName = (page_name) => {
        return findObjs({ type: 'page' }).filter(page => page.get('name').toLowerCase().includes(page_name)).map(page => page.get('id'));
    },

    createImgSrc = (imgsrc) => {
        return (!imgsrc.includes('marketplace') && imgsrc !== '/images/character.png') ? getCleanImgsrc(imgsrc) : 'https://s3.amazonaws.com/files.d20.io/images/52606400/wT6_1s2nnOfWktmRd-1yOg/thumb.png?1524592552';
    },

    getCleanImgsrc = (imgsrc) => {
        var parts = imgsrc.match(/(.*\/images\/.*)(thumb|med|original|max)([^\?]*)(\?[^?]+)?$/);
        if(parts) {
            return parts[1]+'thumb'+parts[3]+(parts[4]?parts[4]:`?${Math.round(Math.random()*9999999)}`);
        }
        return '';
    },

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

    sendConfigMenu = (first, message) => {
        let commandButton = makeButton('!'+state[state_name].config.command, '!' + state[state_name].config.command + ' config command|?{Command (without !)}', styles.button + styles.float.right)
        let refreshSyncButton = makeButton(state[state_name].config.refresh_sync, '!' + state[state_name].config.command + ' config refresh_sync|'+!state[state_name].config.refresh_sync, styles.button + styles.float.right)
        let trueCopyButton = makeButton(state[state_name].config.true_copy, '!' + state[state_name].config.command + ' config true_copy|'+!state[state_name].config.true_copy, styles.button + styles.float.right)

        let listItems = [
            '<span style="'+styles.float.left+'">Command:</span> ' + commandButton,
            '<span style="'+styles.float.left+'">Reload Refresh:</span> ' + refreshSyncButton,
            '<span style="'+styles.float.left+'">True Copy:</span> ' + trueCopyButton,
        ];

        let resetButton = makeButton('Reset', '!' + state[state_name].config.command + ' reset', styles.button + styles.fullWidth);

        let title_text = (first) ? script_name + ' First Time Setup' : script_name + ' Config';
        message = (message) ? '<p>'+message+'</p>' : '';
        let contents = message+makeList(listItems, styles.reset + styles.list + styles.overflow, styles.overflow)+'<hr><p style="font-size: 80%">You can always come back to this config by typing `!'+state[state_name].config.command+' config`.</p><hr>'+resetButton;
        makeAndSendMenu(contents, title_text, 'gm');
    },

    sendHelpMenu = (first) => {
        makeAndSendMenu(makeButton('HELP!' , 'https://github.com/RobinKuiper/Roll20APIScripts/tree/master/SyncPage', styles.button + styles.fullWidth), script_name + ' Help', 'gm')
    },

    sendMenu = () => {
        let contents = '<b>With Selected:</b><br>';
        contents += makeButton('Show Here', '!' + state[state_name].config.command + ' show here', styles.button + styles.fullWidth);
        contents += makeButton('Hide Here', '!' + state[state_name].config.command + ' hide here', styles.button + styles.fullWidth);
        contents += makeButton('Show on Other pages', '!' + state[state_name].config.command + ' show others', styles.button + styles.fullWidth);
        contents += makeButton('Hide on Other pages', '!' + state[state_name].config.command + ' hide others', styles.button + styles.fullWidth);

        makeAndSendMenu(contents, script_name + ' Menu', 'gm');
    },

    makeAndSendMenu = (contents, title, whisper) => {
        title = (title && title != '') ? makeTitle(title) : '';
        whisper = (whisper && whisper !== '') ? '/w ' + whisper + ' ' : '';
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
        if(!message){ return; }
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

        on('change:page', handlePageChange);
        on('add:page', handlePageAdd);

        on('change:graphic', handleTokenChange);
        on('change:text', handleTokenChange);
        on('change:path', handleTokenChange);

        on('add:graphic', handleTokenCreate);
        on('add:text', handleTokenCreate);
        on('add:path', handleTokenCreate);

        on('destroy:graphic', handleTokenDestroy);
        on('destroy:text', handleTokenDestroy);
        on('destroy:path', handleTokenDestroy);
    },

    setDefaults = (reset) => {
        const defaults = {
            config: {
                command: 'sync',
                refresh_sync: true,
                true_copy: true
            },
            synced_pages: {}
        };

        if(!state[state_name].config){
            state[state_name].config = defaults.config;
        }else{
            if(!state[state_name].config.hasOwnProperty('command')){
                state[state_name].config.command = defaults.config.command;
            }
            if(!state[state_name].config.hasOwnProperty('refresh_sync')){
                state[state_name].config.refresh_sync = defaults.config.refresh_sync;
            }
            if(!state[state_name].config.hasOwnProperty('true_copy')){
                state[state_name].config.true_copy = defaults.config.true_copy;
            }
        }

        if(!state[state_name].config.hasOwnProperty('synced_pages')){
            state[state_name].synced_pages = defaults.synced_pages;
        }

        if(!state[state_name].config.hasOwnProperty('firsttime') && !reset){
            sendConfigMenu(true);
            state[state_name].config.firsttime = false;
        }
    };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers,
        CheckSyncedPages: checkSyncedPages,
    }
})();

on('ready',function() {
    'use strict';

    SyncPage.CheckInstall();
    SyncPage.RegisterEventHandlers();
    SyncPage.CheckSyncedPages();
});

/*let synced_pages = {
    page_name: [
            ['45646', '45645', '4764'],
            ['45646', '45645', '4764'],
        ]
    }
}*/