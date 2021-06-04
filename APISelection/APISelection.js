// Github:   https://github.com/shdwjk/Roll20API/blob/master/APISelection/APISelection.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron

const APISelection = (() => { // eslint-disable-line no-unused-vars

    const version = '0.1.0';
    const lastUpdate = 1531793735;
    const schemaVersion = 0.1;

    const checkInstall = () =>  {
        log('-=> APISelection v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

        if( ! state.hasOwnProperty('APISelection') || state.APISelection.version !== schemaVersion) {
            log(`  > Updating Schema to v${schemaVersion} <`);
            state.APISelection = {
                version: schemaVersion,
                lists: {}
            };
        }
    };

    const isString = (s)=>'string'===typeof s || s instanceof String;
    const assureArray = (a) => Array.isArray(a) ? a : [a];

    const getList = (id) => [...(state.APISelection.lists[id] || [])];
    const setList = (id, list) => [ ...(state.APISelection.lists[id] = [...new Set(assureArray(list).filter(isString))])];
    const deleteList = (id) => delete state.APISelection.lists[id] && [];
    const removeFromList = (id, list) => [...(state.APISelection.lists[id] = (state.APISelection.lists[id]||[]).filter((s)=>!assureArray(list).includes(s)))];
    const addToList = (id, list) => [...(state.APISelection.lists[id] = [...new Set([...state.APISelection.lists[id]||[],...assureArray(list).filter(isString)||[]])])];

    const handleInput = (msg) => {
        if (msg.type !== "api" || !playerIsGM(msg.playerid)) {
            return;
        }

        let args = msg.content.split(/\s+/);
        switch(args[0]) {
            case '!api-selection': {
                    const who=(getObj('player',msg.playerid)||{get:()=>'API'}).get('_displayname');
                    sendChat('API Selection', `/w "${who}" <div><ul>${Object.keys(state.APISelection.lists).map((id)=>`<li><code>${id}</code><ul>${state.APISelection.lists[id].map((v)=>`<li>${v}</li>`).join('')}</ul></li>`).join('')}</ul></div>`);
                }
                break;
        }
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        checkInstall();
        registerEventHandlers();
    });

    return { getList, setList, deleteList, removeFromList, addToList };

})();

