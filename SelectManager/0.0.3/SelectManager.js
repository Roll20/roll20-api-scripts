/*
=========================================================
Name			:	SelectManager
GitHub			:   https://github.com/TimRohr22/Cauldron/tree/master/SelectManager
Roll20 Contact	:	timmaugh && TheAaron
Version			:	0.0.3
Last Update		:	11/17/2020
=========================================================

ABSTRACT: Preserve the selected property of the message object from any user generated api call
          so it is available to any other script called *from* the API
          (api-generated message objects have no selected property)

IMPLEMENTION IN OTHER SCRIPTS:
1) Place these lines anywhere in the top scope of your script:
    let getSelected = () => [];
    on('ready', () => { if(undefined !== typeof SelectManager) getSelected = () => SelectManager.GetSelected(); });

2) Place this line within the on('chat:message') handler, immediately after testing the api handle:
    if('API' === msg.playerid) msg.selected = getSelected();

*/

const SelectManager = (() => {
    // ==================================================
    //		VERSION
    // ==================================================
    const vrs = '0.0.3';
    const vd = new Date(1605619625605);
    const versionInfo = () => {
        log('\u0166\u0166 SelectManager v' + vrs + ', ' + vd.getFullYear() + '/' + (vd.getMonth() + 1) + '/' + vd.getDate() + ' \u0166\u0166');
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
    const apiproject = 'selectmanager';

    const handleInput = (msg_orig) => {
        if ('api' === msg_orig.type && 'API' !== msg_orig.playerid) state[apiproject].selected = msg_orig.selected;

    };
    const getSelected = () => {
        return state[apiproject].selected;
    };
    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    on('ready', () => {
        versionInfo();
        logsig();
        registerEventHandlers();
        if (!state[apiproject]) Object.assign(state, { [apiproject]: { selected: [] } });
        if (!state[apiproject].selected) Object.assign(state[apiproject], { selected: [] });

    });

    return {
        // public interface
        GetSelected: getSelected
    };

})();