// =============================================================================
// Choreograph v0.1
// Last Updated: 2026-06-07
// Author: Kenan Millet
//
// Description:
//   Meta-sequencer for Roll20 tokens. Define scenes in handouts — filter
//   tokens, compute per-token timing, and fire commands at the right moments.
//
// Dependencies: SelectManager
//
// Commands:
//   !choreograph run <name> [flags]     Execute a scene
//   !choreograph new <name>             Create blank scene handout
//   !choreograph list                   List all scenes
//   !choreograph edit <name>            Open scene handout
//   !choreograph delete <name> [--force] Delete a scene
//   !choreograph stop [name]            Stop running scene(s)
//   !choreograph refresh <name>         Regenerate handout from cache
// =============================================================================

/* global state, on, sendChat, getObj, createObj, findObjs, Campaign,
          playerIsGM, log, _, setInterval, clearInterval, setTimeout, Date */

var Choreograph = Choreograph || (() => {
    'use strict';

    const SCRIPT_NAME    = 'Choreograph';
    const SCRIPT_VERSION = '0.1';
    const CMD_TOKEN      = '!choreograph';
    const HANDOUT_PREFIX = '[Choreograph] ';

    // =========================================================================
    // State helpers
    // =========================================================================

    const s = () => state[SCRIPT_NAME];

    // =========================================================================
    // TODO: Implementation
    // =========================================================================

    // =========================================================================
    // Initialisation
    // =========================================================================

    const checkInstall = () => {
        state[SCRIPT_NAME] = state[SCRIPT_NAME] || {};

        log(`-=> ${SCRIPT_NAME} v${SCRIPT_VERSION} Initialized <=-`);

        // Signal extensions that Choreograph is ready
        sendChat('', `!${SCRIPT_NAME.toLowerCase()}-ready`, null, { noarchive: true });
    };

    const registerEventHandlers = () => {
        on('chat:message', (msg) => {
            if (msg.type !== 'api') return;
            if (msg.content.split(' ')[0] !== CMD_TOKEN) return;
            // TODO: command routing
        });
    };

    return {
        checkInstall,
        registerEventHandlers,
    };
})();

on('ready', () => {
    'use strict';
    Choreograph.checkInstall();
    Choreograph.registerEventHandlers();
});
