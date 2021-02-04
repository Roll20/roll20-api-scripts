/*
=========================================================
Name			:	SelectManager
GitHub			:   https://github.com/TimRohr22/Cauldron/tree/master/SelectManager
Roll20 Contact	:	timmaugh && TheAaron
Version			:	0.0.4
Last Update		:	2/4/2020
=========================================================
*/
var API_Meta = API_Meta || {};
API_Meta.SelectManager = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.SelectManager.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (13)); }
}

/*
ABSTRACT: Preserve the selected, who, and playerid properties of the message object from any user generated api call
          so it is available to any other script called *from* the API
          (api-generated message objects have no selected property, and they alter the "who")

IMPLEMENTION IN OTHER SCRIPTS:
NOTE: this is just demonstrating one interface; implement the others similarly as necessary
OPTION I:
    1) Place these lines anywhere in the top scope of your script:
        let getSelected = () => {};
        on('ready', () => { if(undefined !== typeof SelectManager) getSelected = () => SelectManager.GetSelected(); });

    2) Place this line within the on('chat:message') handler, immediately after testing the api handle:
        if('API' === msg.playerid) msg.selected = getSelected();

OPTION II: Just make your script dependent on this one from the one-click, and then use the functions right off the library object:
    msg.selected = SelectManager.GetSelected();
*/

const SelectManager = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const apiproject = 'SelectManager';
    API_Meta[apiproject].version = '0.0.4';
    const vd = new Date(1612462652882);
    const versionInfo = () => {
        log(`\u0166\u0166 ${apiproject} v${API_Meta[apiproject].version}, ${vd.getFullYear()}/${vd.getMonth() + 1}/${vd.getDate()} \u0166\u0166 -- offset ${API_Meta[apiproject].offset}`);
        return;
    };
    const logsig = () => {
        // initialize shared namespace for all signed projects, if needed
        state.torii = state.torii || {};
        // initialize siglogged check, if needed
        state.torii.siglogged = state.torii.siglogged || false;
        state.torii.sigtime = state.torii.sigtime || Date.now() - 3001;
        if (!state.torii.siglogged || Date.now() - state.torii.sigtime > 3000) {
            const logsig = '\n' +
                '   ‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗‗    ' + '\n' +
                '    ∖_______________________________________∕     ' + '\n' +
                '      ∖___________________________________∕       ' + '\n' +
                '           ___┃ ┃_______________┃ ┃___            ' + '\n' +
                '          ┃___   _______________   ___┃           ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '              ┃ ┃               ┃ ┃               ' + '\n' +
                '______________┃ ┃_______________┃ ┃_______________' + '\n' +
                '             ⎞⎞⎛⎛            ⎞⎞⎛⎛      ' + '\n';
            log(`${logsig}`);
            state.torii.siglogged = true;
            state.torii.sigtime = Date.now();
        }
        return;
    };

    const handleInput = (msg_orig) => {
        if ('api' === msg_orig.type && 'API' !== msg_orig.playerid) [state[apiproject].who, state[apiproject].selected, state[apiproject].playerid] = [msg_orig.who, msg_orig.selected, msg_orig.playerid];

    };
    const getProp = (prop) => {
        return state[apiproject][prop] || undefined;
    };
    const getSelected = () => getProp('selected');
    const getWho = () => getProp('who');
    const getPlayerID = () => getProp('playerid');

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerEventHandlers();
        if (!state[apiproject]) Object.assign(state, { [apiproject]: { selected: [], who: '', playerid: '' } });
        if (!state[apiproject].hasOwnProperty('selected')) state[apiproject].selected = [];
        if (!state[apiproject].hasOwnProperty('who')) state[apiproject].who = '';
        if (!state[apiproject].hasOwnProperty('playerid')) state[apiproject].playerid = '';

    });

    return {
        // public interface
        GetSelected: getSelected,
        GetWho: getWho,
        GetPlayerID: getPlayerID
    };

})();