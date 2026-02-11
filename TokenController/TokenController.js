/*
Token Control - A Roll20 Script to move tokens along scripted paths at a variable interval
* Commands: Square Brackets are Optional, Angle Brackets are Required, Vertical Bars mean OR

# General Commands
*   !token-control
    - Displays the help text
    - Honestly, just use the menu, it got crazy

# Versioning
*   2.2.0 - Tokens now automatically reverse paths when reaching the end (thought that already existed)
*   2.2.1 - Fixed path reversal bug
*   2.2.2 - Fixed Draft Path Token Movement
*   3.0.0 - Fixed Pixel Unit Size
*         - Added Rotate Tokens Option
          - Menu Enhancements
          - Added Combat Detection
          - Added Combat Patrol Pausing
          - Added Combat Patrol Toggle
          - Fixed Path and Follow Stopping Logic
          - Rebuilt Follow System
          - Added Stealth Toggle
          - Added Path Layer Swapping as Stealth
          - Fixed Token Reset
*   4.0.0 - Bug fixes and safety improvements
*         - setPath no longer corrupts path (was storing object instead of string)
*         - resetTokens fixed (path.forEach and clear logic)
*         - turnorder: parse JSON and guard before accessing current[0]
*         - moveToken: fixed pathCode undefined, pageMeta from page object when missing from cache
*         - Path regex supports multi-digit distances ([0-9]+)
*         - Path step logic uses pathArray.length instead of entry.length
*         - draftPath: removed duplicate step increment
*         - listDrafts: fixed wrong variable in message
*         - processFollowMovement: cleanup by tokenId not list index
*         - Chat handler requires msg.type === "api"
*         - Null checks for tokens in pathTokens, lockTokens, listTokens, getTokensOnPath
*         - validatePathString typo: "w/ GM" -> "/w GM"
*         - stopPaths: createMenu() when stopping by path name
*   4.1.0 - Fixed start location per path
*         - Paths can have a "fixed start": tokens move there when the path is started (e.g. vehicles, chef in kitchen)
*         - Commands: !tc setstart <pathName> (one token selected), !tc clearstart <pathName>
*         - Menu: "Set start" / "Clear start" per path; list path shows fixed start status
*   4.2.0 - Feature pack: live tick, cleanup, sub-steps, path options, export/import, bounds, handout refresh
*         - Live tick: changing interval takes effect immediately (!tc tick)
*         - Stale token cleanup each tick (removes deleted tokens from state)
*         - Smooth movement: !tc substeps toggles sub-step movement (long segments move 1 unit per tick)
*         - Path interval: !tc pathinterval <pathName> <ms|0> for per-path speed
*         - Run once: !tc runonce <pathName> — path runs once then token stops
*         - Duplicate: !tc duplicate <src> <newName>
*         - Export/import: !tc exportpaths, !tc importpaths <json>
*         - Max tokens: !tc maxtokens <pathName> <n|0>
*         - Bounds check when starting path (warns if path would leave map)
*         - Cycle toggle: !tc cycle <pathName> (cycle vs one-way)
*         - Random start step: !tc randomstart <pathName>
*         - Usage Guide handout content refreshed on API load when it exists

# Upcomging Features:
*   Cleaner Pathing -- Version(N.M.+)
    - Break long segments into smaller steps
*   Area Patrol -- Version (+.0.0)

# Known Defects:
*
*/

var API_Meta = API_Meta || {};
API_Meta.TokenController = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.TokenController.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

const TokenController = (() => {
    const NAME = 'TokenController';
    const VERSION = '4.2.0';
    const AUTHOR = 'Scott E. Schwarz';
    let errorMessage = "";
    let listingVars = false;
    let combatStarted = false;
    let currentCombatant = "";
    let menuShowCount = 0;
    let pathTokensIntervalId = null;

    // Ready & Initialize Vars
    on('ready', function () {
        if (!state[NAME]) {
            state[NAME] = {
                module: NAME,
                schemaVersion: VERSION,
                resets: 0,
            };
        }

        if (state[NAME].resets == undefined) {
            state[NAME].resets = 0;
        }

        if (state[NAME].schemaVersion != VERSION) {
            state[NAME].schemaVersion = VERSION;

            if (state[NAME].storedVariables != undefined) {
                if (state[NAME].storedVariables.paths == undefined) {
                    state[NAME].storedVariables.paths = [];
                }
                if (state[NAME].storedVariables.activeTokenPaths == undefined) {
                    state[NAME].storedVariables.activeTokenPaths = [];
                }
                if (state[NAME].storedVariables.tokenMemory == undefined) {
                    state[NAME].storedVariables.tokenMemory = [];
                }
                if (state[NAME].storedVariables.pathDrafts == undefined) {
                    state[NAME].storedVariables.pathDrafts = [];
                }
                if (state[NAME].storedVariables.patrolArea == undefined) {
                    state[NAME].storedVariables.patrolArea = [];
                }
                if (state[NAME].storedVariables.interval == undefined) {
                    state[NAME].storedVariables.interval = 5000;
                }
                if (state[NAME].storedVariables.unitPerClick == undefined) {
                    state[NAME].storedVariables.unitPerClick = 2;
                }
                if (state[NAME].storedVariables.pageMetas == undefined) {
                    state[NAME].storedVariables.pageMetas = [];
                }
                if (state[NAME].storedVariables.unitPx == undefined) {
                    state[NAME].storedVariables.unitPx = 70;
                }
                if (state[NAME].storedVariables.rotateTokens == undefined) {
                    state[NAME].storedVariables.rotateTokens = false;
                }
                if (state[NAME].storedVariables.combatPatrol == undefined) {
                    state[NAME].storedVariables.combatPatrol = false;
                }
                if (state[NAME].storedVariables.subStepMovement == undefined) {
                    state[NAME].storedVariables.subStepMovement = false;
                }
            }
        }

        if (state[NAME].storedVariables == undefined) {
            state[NAME].storedVariables = {
                paths: [
                    {
                        name: "Square",
                        path: "U2R2D2L2",
                        isCycle: true,
                    }, {
                        name: "Rectangle",
                        path: "U1R2D1L2",
                        isCycle: true,
                    }, {
                        name: "T",
                        path: "U3U0WWR2R0WWL4WWR2D3WW",
                        isCycle: true,
                    },
                    {
                        name: "Blinker",
                        path: "S",
                        isCycle: true,
                    }
                ],
                activeTokenPaths: [
                    /*{
                        tokenId: "Test",
                        pathName: "Square",
                        step: 0,
                        isReversing: false,

                        initialLeft: 0,
                        initialTop: 0,
                        initialRotation: 0,
                    },*/
                ],
                tokenMemory: [
                    /*{
                        tokenId: "Test",
                        pageId: "Test",
                        rotation: 0,
                        left: 0,
                        top: 0,
                        followingTokenId: "",
                        isFollowing: false,
                        isLocked: false,
                    },*/
                ],
                pathDrafts: [
                    /*{
                        name: "Test",
                        path: "U2R2D2L2",
                        tokenId: "",
                        step: 0,
                        currentStep: { // Since the last vector is L, if U,D,R is pressed next, progress steps and concat this to setPath, else distance++
                            direction: "",
                            distance: 0,
                        },
                        previousStep: {
                            direction: "",
                            distance: 0,
                        },
                    },*/
                ],
                patrolArea: [
                    /*{
                        name: "Test",
                        pageId: "",
                        radius: 0, // Grid Units
                    },*/
                ],
                pageMetas: [
                    /*{
                        pageId: "",
                        pageName: "",
                        pageWidth: 0, // Grid Units * 70
                        pageHeight: 0, // Grid Units * 70
                        pageScaleNumber: 0 // in {scale_units}
                    }*/
                ],
                interval: 5000,
                unitPerClick: 1,
                unitPx: 70,
                rotateTokens: false,
                combatPatrol: false,
                subStepMovement: false,
            };
        }

        setupMacros();

        if (pathTokensIntervalId) clearInterval(pathTokensIntervalId);
        pathTokensIntervalId = setInterval(pathTokens, state[NAME].storedVariables.interval);

        log(`${NAME} ${VERSION} by ${AUTHOR} Ready  Meta Offset : ${API_Meta.TokenController.offset}`);
        createMenu();
    });

    // Token Destruction
    on("change:graphic", function (obj, prev) {
        if (obj.get("_subtype") !== "token") {
            return;
        }

        let tokenId = obj.get("_id");
        let tokenPath = state[NAME].storedVariables.activeTokenPaths.find(p => p.tokenId == tokenId);
        if (tokenPath) {
            state[NAME].storedVariables.activeTokenPaths.splice(state[NAME].storedVariables.activeTokenPaths.indexOf(tokenPath), 1);
        }

        const moved = obj.get('left') !== prev.left || obj.get('top') !== prev.top;
        if (!moved) {
            return;
        }

        const followers = state[NAME].storedVariables.tokenMemory.filter(t =>
            t.isFollowing && t.followingTokenId === tokenId
        );

        followers.forEach(follower => {
            const followerToken = getObj('graphic', follower.tokenId);
            if (!followerToken) return;

            const offsetX = follower.offsetX || 0;
            const offsetY = follower.offsetY || 0;

            followerToken.set({
                left: prev.left + offsetX,
                top: prev.top + offsetY,
                rotation: obj.get('rotation')
            });
        });
    });

    // Commands
    on("chat:message", function (msg) {
        try {
            if (msg.type === "api" && (msg.content.toLowerCase().startsWith("!token-control") || msg.content.toLowerCase().startsWith("!tc"))) {

                if (!playerIsGM(msg.playerid)) {
                    sendChat(`${NAME}`, "/w " + msg.who + " You do not have permission to use this command.");
                    return;
                }

                const args = msg.content.split(/\s+/);

                if (args.length == 1) {
                    createMenu();
                    return;
                }

                const command = args[1];

                switch (command.toLowerCase()) {
                    // General Commands
                    case "setup":
                        setupMacros();
                        break;
                    case "list":
                        if (args.length < 3) {
                            listPaths();
                        }
                        switch (args[2].toLowerCase()) {
                            case "paths":
                                listPaths(args.length > 3 ? args.slice(3).join(' ').trim() : undefined);
                                break;
                            case "tokens":
                                listTokens(args.length > 3 ? args.slice(3).join(' ').trim() : undefined);
                                break;
                            case "tick":
                                listTick();
                                break;
                            case "vars":
                                listVars();
                                break;
                            case "draft":
                                listDrafts(args.length > 3 ? args.slice(3).join(' ').trim() : undefined);
                                break;
                        }
                        break;

                    // Path Commands
                    case "add":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc add <pathName> <pathCode>");
                            return;
                        }
                        addPath(args.slice(2, -1).join(' ').trim(), args[args.length - 1]);
                        break;
                    case "set":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc set <pathName> <pathCode>");
                            return;
                        }
                        setPath(args.slice(2, -1).join(' ').trim(), args[args.length - 1]);
                        break;
                    case "remove":
                        removePath(args.slice(2).join(' ').trim());
                        break;
                    case "setstart":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc setstart <pathName> (with one token selected)");
                            return;
                        }
                        if (!msg.selected || msg.selected.length !== 1) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Select exactly one token to use as the fixed start location.");
                            return;
                        }
                        setPathStart(args.slice(2).join(' ').trim(), msg.selected[0]._id);
                        break;
                    case "clearstart":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc clearstart <pathName>");
                            return;
                        }
                        clearPathStart(args.slice(2).join(' ').trim());
                        break;
                    case "build":
                        if (args.length !== 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Invalid number of arguments.  Usage: !tc build <pathName> <tokenId>");
                            return;
                        }
                        buildPath(args[2], args[3]);
                        break;
                    case "draft":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Invalid number of arguments.  Usage: !tc draft <pathName> <tokenId>");
                            return;
                        }
                        draftPath(args[2], args[3], args.length > 4 ? args[4] : undefined);
                        break;
                    case "unit":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Invalid number of arguments.  Usage: !tc unit <unitPerClick>");
                            return;
                        }
                        state[NAME].storedVariables.unitPerClick = parseInt(args[2]);
                        createMenu();
                        break;
                    case "unitpx":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Invalid number of arguments.  Usage: !tc unitpx <unitPx>");
                            return;
                        }
                        const unitPx = parseFloat(args[2]);
                        if (isNaN(unitPx) || unitPx < 1) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Invalid unitPx.  Must be a positive number.");
                            return;
                        }
                        state[NAME].storedVariables.unitPx = unitPx;
                        createMenu();
                        break;

                    // Token Commands
                    case "start":
                        if (!msg.selected || msg.selected.length == 0) {
                            sendChat(`${NAME}`, "/w GM No tokens selected.");
                            return;
                        }
                        startPath(msg.selected, args.slice(2).join(' ').trim());
                        break;
                    case "stop":
                        stopPaths(msg.selected, args.length >= 3 ? args.slice(2).join(' ').trim() : undefined);
                        break;
                    case "lock":
                        lockTokens(msg.selected);
                        break;
                    case "unlock":
                        unlockTokens(msg.selected);
                        break;
                    case "follow":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Invalid number of arguments.  Usage: !tc follow <tokenId> <tokenId>");
                            return;
                        }
                        followTokens(args[2], args[3]);
                        break;

                    // Config Commands
                    case "tick":
                        updateTick(args.length >= 3 ? args[2] : undefined);
                        break;
                    case "hide":
                        hideCommands();
                        break;
                    case "reset":
                        resetTokens();
                        break;
                    case "usage":
                        showUsage();
                        break;
                    case "examples":
                        addExamplePaths();
                        break;
                    case "rotate":
                        state[NAME].storedVariables.rotateTokens = !state[NAME].storedVariables.rotateTokens;
                        createMenu();
                        break;
                    case "combat":
                        state[NAME].storedVariables.combatPatrol = !state[NAME].storedVariables.combatPatrol;
                        createMenu();
                        break;
                    case "substeps":
                        state[NAME].storedVariables.subStepMovement = !state[NAME].storedVariables.subStepMovement;
                        createMenu();
                        break;
                    case "pathinterval":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc pathinterval <pathName> <ms|0> (0 = use global)");
                            return;
                        }
                        setPathInterval(args.slice(2, -1).join(' ').trim(), args[args.length - 1]);
                        break;
                    case "runonce":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc runonce <pathName>");
                            return;
                        }
                        togglePathRunOnce(args.slice(2).join(' ').trim());
                        break;
                    case "duplicate":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc duplicate <sourcePathName> <newPathName>");
                            return;
                        }
                        duplicatePath(args.slice(2, -1).join(' ').trim(), args[args.length - 1]);
                        break;
                    case "exportpaths":
                        exportPaths();
                        break;
                    case "importpaths":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc importpaths <json string> (path definitions array)");
                            return;
                        }
                        importPaths(args.slice(2).join(' '));
                        break;
                    case "maxtokens":
                        if (args.length < 4) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc maxtokens <pathName> <n|0> (0 = no limit)");
                            return;
                        }
                        setPathMaxTokens(args.slice(2, -1).join(' ').trim(), args[args.length - 1]);
                        break;
                    case "cycle":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc cycle <pathName> (toggles cycle / one-way)");
                            return;
                        }
                        togglePathCycle(args.slice(2).join(' ').trim());
                        break;
                    case "randomstart":
                        if (args.length < 3) {
                            sendChat(`${NAME}`, "/w " + msg.who + " Usage: !tc randomstart <pathName> (toggles random start step)");
                            return;
                        }
                        togglePathRandomStart(args.slice(2).join(' ').trim());
                        break;
                }
            }
        } catch (err) {
            log(` ${NAME}  Error: ${err}<br/>${errorMessage}`);
            errorMessage = "";
        }
    });

    // When Roll20 combat starts
    on('change:campaign:turnorder', function (campaign, prev) {
        const rawCurrent = campaign.get('turnorder');
        const rawPrev = (prev && typeof prev.get === 'function') ? prev.get('turnorder') : prev;
        let current = [];
        let prevOrder = [];
        try {
            current = typeof rawCurrent === 'string' ? (JSON.parse(rawCurrent || '[]') || []) : (Array.isArray(rawCurrent) ? rawCurrent : []);
        } catch (e) { current = []; }
        try {
            prevOrder = typeof rawPrev === 'string' ? (JSON.parse(rawPrev || '[]') || []) : (Array.isArray(rawPrev) ? rawPrev : []);
        } catch (e) { prevOrder = []; }
        const wasEmpty = !prevOrder || prevOrder.length === 0;
        const isNowActive = current && current.length > 0;

        if (isNowActive && current[0] && typeof current[0] === 'object' && current[0].id) {
            currentCombatant = current[0].id;
        }

        if (combatStarted && !isNowActive) {
            combatStarted = false;
            //sendChat('System', '🏆 Combat has ended!');
            return;
        }

        if (combatStarted && state[NAME].storedVariables.combatPatrol) {
            pathTokens(true);
        }

        // When Roll20 combat starts
        if (!combatStarted && !wasEmpty && isNowActive) {
            combatStarted = true;
            //sendChat('System', '⚔️ Combat has started!');
            sendChat(`${NAME}`, `/w GM ⚔️ Patrols have been stopped! Combat Patrolling is ${state[NAME].storedVariables.combatPatrol ? "enabled" : "disabled"}`);
        }
    });

    function cleanupStaleTokens() {
        const beforePaths = state[NAME].storedVariables.activeTokenPaths.length;
        const beforeMemory = state[NAME].storedVariables.tokenMemory.length;
        state[NAME].storedVariables.activeTokenPaths = state[NAME].storedVariables.activeTokenPaths.filter(
            tp => getObj('graphic', tp.tokenId)
        );
        state[NAME].storedVariables.tokenMemory = state[NAME].storedVariables.tokenMemory.filter(
            tm => getObj('graphic', tm.tokenId)
        );
        const removedPaths = beforePaths - state[NAME].storedVariables.activeTokenPaths.length;
        const removedMemory = beforeMemory - state[NAME].storedVariables.tokenMemory.length;
        if (removedPaths > 0 || removedMemory > 0) {
            log(`${NAME}: Cleaned ${removedPaths} stale path(s) and ${removedMemory} stale memory entry(ies).`);
        }
    }

    function pathTokens(overrideCombat = false) {
        if (combatStarted && !overrideCombat) {
            return;
        }

        cleanupStaleTokens();

        let blockIds = [];

        if (state[NAME].storedVariables.tokenMemory.length > 0) {
            state[NAME].storedVariables.tokenMemory.forEach(token => {
                if (token.isLocked) {
                    blockIds.push(token.tokenId);
                    let obj = getObj("graphic", token.tokenId);
                    if (obj) {
                        obj.set({
                            "left": token.left,
                            "top": token.top,
                            "rotation": token.rotation
                        });
                    }
                }
            });
        }

        // Move Tokens
        for (let i = 0; i < state[NAME].storedVariables.activeTokenPaths.length; i++) {
            if (blockIds.includes(state[NAME].storedVariables.activeTokenPaths[i].tokenId)) {
                continue;
            }

            const tokenPath = state[NAME].storedVariables.activeTokenPaths[i];
            if (!tokenPath) {
                log(`${NAME}: Error: Token path not found.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name == tokenPath.pathName);
            if (pathIndex == -1) {
                log(`${NAME}: Error: Path ${tokenPath.pathName} not found.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            const pathDef = state[NAME].storedVariables.paths[pathIndex];
            if (pathDef.intervalOverride != null && pathDef.intervalOverride > 0) {
                tokenPath.tickCounter = (tokenPath.tickCounter || 0) + 1;
                const globalInterval = state[NAME].storedVariables.interval;
                if (tokenPath.tickCounter * globalInterval < pathDef.intervalOverride) {
                    continue;
                }
                tokenPath.tickCounter = 0;
            }

            let pathCode = pathDef.path;
            if (typeof pathCode !== 'string') {
                pathCode = (pathCode && pathCode.path) ? pathCode.path : '';
            }

            const pathArray = pathCode.match(/([UDLR])([0-9]+)|W|S/g);
            if (!pathArray || pathArray.length < 1) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - No Vector Matches.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            const pathVector = pathArray[tokenPath.step];
            if (!pathVector) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - No Vectors present at step ${tokenPath.step}.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            let direction = pathVector.substring(0, 1);
            if (tokenPath.isReversing) {
                switch (direction) {
                    case "U":
                        direction = "D";
                        break;
                    case "D":
                        direction = "U";
                        break;
                    case "L":
                        direction = "R";
                        break;
                    case "R":
                        direction = "L";
                        break;
                }
            }

            const distance = (direction === 'W' || direction === 'S') ? 0 : parseInt(pathVector.substring(1), 10);
            if (isNaN(distance) && direction !== "W" && direction !== "S") {
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                sendChat("GM", `Error: Path code ${pathCode} is invalid - Distance is not a number.`);
                continue;
            }

            const token = getObj("graphic", tokenPath.tokenId);
            if (!token) {
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }
            const left = token.get("left");
            const top = token.get("top");
            const rotation = token.get("rotation");

            const useSubSteps = state[NAME].storedVariables.subStepMovement && (direction === 'U' || direction === 'D' || direction === 'L' || direction === 'R') && distance > 1;
            const entry = state[NAME].storedVariables.activeTokenPaths[i];
            if (useSubSteps) {
                if (entry.subStepTotal == null || entry.subStepTotal === 0) {
                    entry.subStepTotal = distance;
                    entry.subStep = 0;
                }
                const moveDist = 1;
                if (!moveToken(tokenPath.tokenId, direction, moveDist, tokenPath.pageId, pathCode)) {
                    state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                    i--;
                    sendChat("GM", `Error: Failed to move token ${tokenPath.tokenId}.`);
                    continue;
                }
                processFollowMovement(tokenPath.tokenId, left, top, rotation);
                entry.subStep = (entry.subStep || 0) + 1;
                if (entry.subStep < entry.subStepTotal) {
                    continue;
                }
                entry.subStepTotal = 0;
                entry.subStep = 0;
            } else {
                if (!moveToken(tokenPath.tokenId, direction, distance, tokenPath.pageId, pathCode)) {
                    state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                    i--;
                    sendChat("GM", `Error: Failed to move token ${tokenPath.tokenId}.`);
                    continue;
                }
                processFollowMovement(tokenPath.tokenId, left, top, rotation);
            }

            if (pathDef.runOnce && tokenPath.step === pathArray.length - 1) {
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            if (tokenPath.isReversing) {
                if (tokenPath.step === 0) {
                    state[NAME].storedVariables.activeTokenPaths[i].isReversing = false;

                    if (pathArray.length > 1) {
                        state[NAME].storedVariables.activeTokenPaths[i].step++;
                    }
                } else {
                    state[NAME].storedVariables.activeTokenPaths[i].step--;
                }
            } else {
                if (tokenPath.step === pathArray.length - 1) {
                    if (pathDef.isCycle) {
                        state[NAME].storedVariables.activeTokenPaths[i].step = 0;
                    } else {
                        state[NAME].storedVariables.activeTokenPaths[i].isReversing = true;
                        if (pathArray.length > 1) {
                            state[NAME].storedVariables.activeTokenPaths[i].step--;
                        }
                    }
                } else {
                    state[NAME].storedVariables.activeTokenPaths[i].step++;
                }
            }
        }
    }

    function moveToken(tokenId, direction, distance, pageId, pathCodeForError) {
        let angle = 0;
        switch (direction.toUpperCase()) {
            case "U":
                angle = 180;
                break;
            case "D":
                angle = 0;
                break;
            case "L":
                angle = 90;
                break;
            case "R":
                angle = 270;
                break;
            case "W":
                return true;
            case "S":
                toggleStealth(tokenId);
                return true;
            default:
                sendChat(`${NAME}`, `/w GM Error: Invalid direction "${direction}"${pathCodeForError ? ` in path "${pathCodeForError}"` : ''}.`);
                return false;
        }

        const token = getObj("graphic", tokenId);
        if (!token) {
            sendChat(`${NAME}`, `/w GM Error: Token ${tokenId} not found.`);
            return false;
        }

        if (distance == 0 && state[NAME].storedVariables.rotateTokens) {
            token.set("rotation", angle);
            return true;
        }

        let pageMeta = state[NAME].storedVariables.pageMetas.find(p => p.pageId === pageId);
        if (!pageMeta) {
            const pageIdFromToken = token.get('_pageid');
            const page = getObj('page', pageIdFromToken);
            if (!page) {
                sendChat(`${NAME}`, `/w GM Error: Page not found for token. Please restart the path.`);
                return false;
            }
            pageMeta = {
                pageWidth: page.get('width') * state[NAME].storedVariables.unitPx,
                pageHeight: page.get('height') * state[NAME].storedVariables.unitPx
            };
        }

        if (angle === 0 || angle === 180) {
            const top = token.get("top") + (distance * state[NAME].storedVariables.unitPx * (angle === 0 ? 1 : -1));
            if ((top + state[NAME].storedVariables.unitPx) > pageMeta.pageHeight || top < 0) {
                sendChat(`${NAME}`, `/w GM Error: Token ${tokenId} is out of bounds. Top: ${top + state[NAME].storedVariables.unitPx} (+${state[NAME].storedVariables.unitPx}) > ${pageMeta.pageHeight}`);
                return true;
            }
            token.set({ "top": top });

        } else {
            const left = token.get("left") + (distance * state[NAME].storedVariables.unitPx * (angle === 90 ? -1 : 1));
            if ((left + state[NAME].storedVariables.unitPx) > pageMeta.pageWidth || left < 0) {
                sendChat(`${NAME}`, `/w GM Error: Token ${tokenId} is out of bounds. Left: ${left + state[NAME].storedVariables.unitPx} (+${state[NAME].storedVariables.unitPx}) > ${pageMeta.pageWidth}`);
                return true;
            }
            token.set({ "left": left });
        }

        if (state[NAME].storedVariables.rotateTokens) {
            token.set({ "rotation": angle });
        }

        return true;
    }

    function setupMacros() {
        let oldMenuMacro = findObjs({ type: 'macro', name: 'TokenController_Menu' });
        if (oldMenuMacro.length > 0) {
            oldMenuMacro[0].remove();
        }

        let menuMacro = findObjs({ type: 'macro', name: 'T-Cntrl_Menu' });

        const gmPlayers = findObjs({ _type: 'player' }).filter(player => playerIsGM(player.get("_id")));

        if (!menuMacro || menuMacro.length < 1) {
            _.each(gmPlayers, function (player) {
                createObj('macro', {
                    name: 'T-Cntrl_Menu',
                    action: '!token-control',
                    playerid: player.get("_id"),
                });
            });
        } else if (menuMacro.length > 1) {
            for (let i = 1; i < menuMacro.length; i++) {
                menuMacro[i].remove();
            }
        }

        let buildPathMacro = findObjs({ type: 'macro', name: 'T-Cntrl_Builder' });
        if (!buildPathMacro || buildPathMacro.length < 1) {
            _.each(gmPlayers, function (player) {
                createObj('macro', {
                    name: 'T-Cntrl_Builder',
                    action: '!tc Build @{selected|token_id} ?{Name of Path?}',
                    playerid: player.get("_id"),
                    visibleto: player.get("_id"),
                    istokenaction: true
                });
            });
        } else if (buildPathMacro.length > 1) {
            for (let i = 1; i < buildPathMacro.length; i++) {
                buildPathMacro[i].remove();
            }
        }

        let followMacro = findObjs({ type: 'macro', name: 'T-Cntrl_Follow' });
        if (!followMacro || followMacro.length < 1) {
            _.each(gmPlayers, function (player) {
                createObj('macro', {
                    name: 'T-Cntrl_Follow',
                    action: '!tc Follow @{selected|token_id} @{target|token_id}',
                    playerid: player.get("_id"),
                    visibleto: player.get("_id"),
                    istokenaction: true
                });
            });
        } else if (followMacro.length > 1) {
            for (let i = 1; i < followMacro.length; i++) {
                followMacro[i].remove();
            }
        }

        let usageHandout = findObjs({ type: 'handout', name: 'TokenController Usage Guide' });
        if (!usageHandout || usageHandout.length < 1) {
            if (gmPlayers.length > 0) setupHandouts(gmPlayers[0]);
        } else {
            if (usageHandout.length > 1) {
                for (let i = 1; i < usageHandout.length; i++) {
                    usageHandout[i].remove();
                }
            }
            usageHandout = findObjs({ type: 'handout', name: 'TokenController Usage Guide' });
            if (usageHandout.length === 1) {
                usageHandout[0].set({ notes: getUsageGuideContent() });
            }
        }
    }

    function getUsageGuideContent() {
        let content = new HtmlBuilder('div');
        content.append('.heading', 'Overview');
        content.append('.info', [
            'TokenController moves tokens along scripted paths (U/D/L/R directions plus W=wait, S=stealth toggle).',
            'Open the menu with !tc or !token-control. Most actions are done from the menu or the T-Cntrl_ macros.',
        ].join('<br>'));

        content.append('.heading', 'Macros');
        content.append('.info', [
            'T-Cntrl_Menu: Opens the TokenController menu (!tc).',
            'T-Cntrl_Builder: With a token selected, starts a path draft (prompts for path name).',
            'T-Cntrl_Follow: With a token selected and a target, makes the selected token follow the target.',
            'Macros are recreated on API restart if missing. Delete any "T-Cntrl_" macro to force rebuild.',
        ].join('<br>'));

        content.append('.heading', 'Path Building');
        content.append('.info', [
            'Select a token and click T-Cntrl_Builder (or use the menu), then enter a path name to create a Draft.',
            'In the menu under Draft Paths: use U, D, L, R to add movement (with units per click); W = wait, S = stealth toggle. Set saves the draft as a path; Rmv removes the draft.',
            'Keep the draft token on the map until you click Set. Paths are grid-based and work on any map; page size is stored so tokens stay in bounds.',
        ].join('<br>'));

        content.append('.heading', 'Fixed Start Location');
        content.append('.info', [
            'Some paths can always start from the same spot (e.g. a chef in a kitchen, vehicles in a bay).',
            'Set start: Select one token at the desired start position, then use that path\'s "Set start" button (or !tc setstart &lt;pathName&gt;). From then on, any token started on that path is moved there first, then runs the path.',
            'Clear start: Use "Clear start" for that path (or !tc clearstart &lt;pathName&gt;) to go back to "start from wherever the token is."',
            'List Paths for a path shows whether it has a fixed start and the coordinates.',
        ].join('<br>'));

        content.append('.heading', 'Token Controls');
        content.append('.info', [
            'Start: Select token(s), then click Start next to a path name. Tokens begin patrolling that path.',
            'Stop: Path Stop (with or without selection) stops that path for selected tokens or all on that path. Token Stop stops all paths for selected tokens or every token.',
            'Reset: Puts all patrolling tokens back to their starting positions and clears path/follow state.',
            'Lock / Unlock: Locked tokens stay in place (e.g. to pause one patrol). Control order: Locked &gt; Follow &gt; Path.',
            'Follow: Use T-Cntrl_Follow (select follower, target leader) or !tc follow &lt;followerId&gt; &lt;leaderId&gt;. Unlocking stops following.',
        ].join('<br>'));

        content.append('.heading', 'Settings (Menu)');
        content.append('.info', [
            'Interval (Tick): Time in ms between each path step. Default 5000 (5 s). Change takes effect immediately.',
            'Pixels Per Unit: Grid movement scale (default 70). Match your map\'s grid pixel size so one path unit = one grid cell.',
            'Rotate Tokens: When on, tokens turn to face their movement direction.',
            'Combat Patrol: When on, patrols still advance once per turn order change during combat; when off, patrols pause when combat starts.',
        ].join('<br>'));

        content.append('.heading', 'Commands (GM only)');
        content.append('.info', [
            '!tc or !token-control — menu. !tc list paths [name], !tc list tokens, !tc list draft [name], !tc list tick, !tc list vars.',
            '!tc add &lt;name&gt; &lt;pathCode&gt; — add path (e.g. U2R2D2L2). !tc set &lt;name&gt; &lt;pathCode&gt; — update path. !tc remove &lt;name&gt;.',
            '!tc setstart &lt;pathName&gt; — set fixed start from selected token. !tc clearstart &lt;pathName&gt; — clear fixed start.',
            '!tc start &lt;pathName&gt;, !tc stop [pathName], !tc reset. !tc lock, !tc unlock. !tc follow &lt;followerId&gt; &lt;leaderId&gt;.',
            '!tc tick &lt;ms&gt;, !tc unit &lt;n&gt;, !tc unitpx &lt;n&gt;, !tc rotate, !tc combat, !tc substeps, !tc usage.',
            '!tc pathinterval &lt;pathName&gt; &lt;ms|0&gt;, !tc runonce &lt;pathName&gt;, !tc duplicate &lt;src&gt; &lt;newName&gt;, !tc exportpaths, !tc importpaths &lt;json&gt;.',
            '!tc maxtokens &lt;pathName&gt; &lt;n|0&gt;, !tc cycle &lt;pathName&gt;, !tc randomstart &lt;pathName&gt;, !tc examples.',
        ].join('<br>'));

        return content.toString({
            "heading": {
                "font-size": "1.5em",
                "color": "#00f",
                "text-align": "center",
            },
            "info": {
                "font-size": "1em",
                "color": "#000",
                "margin-bottom": "10px",
            }
        });
    }

    function setupHandouts() {
        const handout = createObj('handout', {
            name: 'TokenController Usage Guide',
            inplayerjournals: 'all',
            archived: false
        });
        handout.set({ notes: getUsageGuideContent() });
    }

    function showUsage() {
        createMenu();
        sendChat('TokenController', '/w gm ' + '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' + "See the Handout: <b>TokenController Usage Guide</b> for more information.<br/<br/>https://youtu.be/MlNW_kN7sp8?si=DTWQ_Z90KKSVdfGF" + '</div>');
    }

    function addPath(name, pathString) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        // If name is already in path list, tell GM and return
        if (state[NAME].storedVariables.paths.find(p => p.name == name)) {
            sendChat(`${NAME}`, "/w GM Path name already exists.");
            return;
        }

        if (!validatePathString(pathString)) {
            return;
        }

        state[NAME].storedVariables.paths.push({
            name: name,
            path: pathString,
            isCycle: testCycle(pathString)
        });
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${name}" added.`);
    }

    function setPath(name, pathString) {
        if (!validatePathString(pathString)) {
            return;
        }

        const index = getPathIndexByName(name);
        if (index == -1) {
            sendChat(`${NAME}`, `/w GM Path ${name} not found.`);
            return;
        }

        state[NAME].storedVariables.paths[index].path = pathString;
        state[NAME].storedVariables.paths[index].isCycle = testCycle(pathString);
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${name}" updated to ${pathString}.`);
    }

    function testCycle(pathString, silent) {
        const workingString = (typeof pathString === 'string' ? pathString : '').replace(/W/g, "");
        const pathArray = workingString.match(/([UDLR])(\d+)/g);
        if (!pathArray || pathArray.length === 0) return false;

        let vert = 0;
        let horz = 0;

        for (let i = 0; i < pathArray.length; i++) {
            const direction = pathArray[i][0];
            const distance = parseInt(pathArray[i].substr(1), 10);

            if (direction === "U") vert += distance;
            else if (direction === "D") vert -= distance;
            else if (direction === "L") horz -= distance;
            else if (direction === "R") horz += distance;
        }

        const isCycle = vert === 0 && horz === 0;
        if (isCycle && !silent) {
            sendChat('GM', `Path is a cycle: ${pathString}`);
        }
        return isCycle;
    }

    function removePath(name) {
        let index = getPathIndexByName(name);
        if (index == -1) {
            // Try to find and remove from pathDrafts
            index = state[NAME].storedVariables.pathDrafts.findIndex(p => p.name == name);
            if (index > -1) {
                state[NAME].storedVariables.pathDrafts.splice(index, 1);
                sendChat(`${NAME}`, `/w GM Path "${name}" removed from Drafts.`);
            } else {
                sendChat(`${NAME}`, `/w GM Path "${name}" not found in Drafts.`);
            }

            return;
        }

        state[NAME].storedVariables.paths.splice(index, 1);
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${name}" removed.`);
    }

    function setPathStart(pathName, tokenId) {
        if (!pathName) {
            sendChat(`${NAME}`, "/w GM Please specify a path name.");
            return;
        }
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const token = getObj('graphic', tokenId);
        if (!token) {
            sendChat(`${NAME}`, "/w GM Token not found.");
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        path.fixedStart = true;
        path.startLeft = token.get('left');
        path.startTop = token.get('top');
        path.startPageId = token.get('_pageid');
        path.startRotation = token.get('rotation');
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" now has a fixed start at this token's position. Tokens will move here when the path is started.`);
    }

    function clearPathStart(pathName) {
        if (!pathName) {
            sendChat(`${NAME}`, "/w GM Please specify a path name.");
            return;
        }
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        path.fixedStart = false;
        delete path.startLeft;
        delete path.startTop;
        delete path.startPageId;
        delete path.startRotation;
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" now starts from wherever the token is (no fixed start).`);
    }

    function setPathInterval(pathName, msStr) {
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        const ms = parseInt(msStr, 10);
        if (msStr === '0' || msStr.toLowerCase() === 'off') {
            delete path.intervalOverride;
            createMenu();
            sendChat(`${NAME}`, `/w GM Path "${pathName}" now uses the global tick interval.`);
            return;
        }
        if (isNaN(ms) || ms < 1) {
            sendChat(`${NAME}`, "/w GM Please specify a positive interval in ms, or 0 to use global.");
            return;
        }
        path.intervalOverride = ms;
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" interval set to ${ms} ms.`);
    }

    function togglePathRunOnce(pathName) {
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        path.runOnce = !path.runOnce;
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" run-once is now ${path.runOnce ? 'on' : 'off'}.`);
    }

    function togglePathCycle(pathName) {
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        path.isCycle = !path.isCycle;
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" is now ${path.isCycle ? 'cycling' : 'one-way (reverse at end)'}.`);
    }

    function togglePathRandomStart(pathName) {
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        path.randomStart = !path.randomStart;
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" random start step is now ${path.randomStart ? 'on' : 'off'}.`);
    }

    function setPathMaxTokens(pathName, nStr) {
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === pathName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${pathName}" not found.`);
            return;
        }
        const path = state[NAME].storedVariables.paths[pathIndex];
        const n = parseInt(nStr, 10);
        if (nStr === '0' || nStr.toLowerCase() === 'off' || isNaN(n) || n < 0) {
            delete path.maxTokens;
            createMenu();
            sendChat(`${NAME}`, `/w GM Path "${pathName}" has no token limit.`);
            return;
        }
        path.maxTokens = n;
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${pathName}" max tokens set to ${n}.`);
    }

    function pathWouldLeaveBounds(pathStr, startLeft, startTop, unitPx, pageWidth, pageHeight) {
        const pathArray = (typeof pathStr === 'string' ? pathStr : '').match(/([UDLR])([0-9]+)|W|S/g);
        if (!pathArray || pathArray.length === 0) return false;
        let left = startLeft;
        let top = startTop;
        const tokenSize = unitPx;
        for (let i = 0; i < pathArray.length; i++) {
            const dir = pathArray[i].charAt(0);
            const dist = (dir === 'W' || dir === 'S') ? 0 : parseInt(pathArray[i].substring(1), 10) || 0;
            if (dir === 'U') top -= dist * unitPx;
            else if (dir === 'D') top += dist * unitPx;
            else if (dir === 'L') left -= dist * unitPx;
            else if (dir === 'R') left += dist * unitPx;
            if (left < 0 || top < 0 || (left + tokenSize) > pageWidth || (top + tokenSize) > pageHeight) return true;
        }
        return false;
    }

    function exportPaths() {
        const out = state[NAME].storedVariables.paths.map(p => {
            const o = { name: p.name, path: typeof p.path === 'string' ? p.path : (p.path && p.path.path) || '', isCycle: !!p.isCycle };
            if (p.fixedStart && p.startLeft != null) {
                o.fixedStart = true;
                o.startLeft = p.startLeft;
                o.startTop = p.startTop;
                o.startPageId = p.startPageId;
                o.startRotation = p.startRotation;
            }
            if (p.intervalOverride != null) o.intervalOverride = p.intervalOverride;
            if (p.runOnce != null) o.runOnce = p.runOnce;
            if (p.maxTokens != null) o.maxTokens = p.maxTokens;
            if (p.randomStart != null) o.randomStart = p.randomStart;
            return o;
        });
        const json = JSON.stringify(out);
        sendChat(`${NAME}`, '/w GM Paths export (copy for !tc importpaths):');
        if (json.length > 1800) {
            const chunkSize = 1800;
            for (let i = 0; i < json.length; i += chunkSize) {
                sendChat(`${NAME}`, '/w GM ' + json.substring(i, i + chunkSize));
            }
        } else {
            sendChat(`${NAME}`, '/w GM ' + json);
        }
    }

    function importPaths(jsonStr) {
        let data;
        try {
            data = JSON.parse(jsonStr);
        } catch (e) {
            sendChat(`${NAME}`, '/w GM Invalid JSON for import.');
            return;
        }
        if (!Array.isArray(data)) {
            sendChat(`${NAME}`, '/w GM Import data must be an array of path objects.');
            return;
        }
        let added = 0;
        let skipped = 0;
        data.forEach(p => {
            if (!p.name || !p.path) return;
            if (state[NAME].storedVariables.paths.find(ex => ex.name === p.name)) {
                skipped++;
                return;
            }
            const pathStr = typeof p.path === 'string' ? p.path : (p.path && p.path.path) || '';
            const entry = { name: p.name, path: pathStr, isCycle: !!p.isCycle };
            if (p.fixedStart && p.startLeft != null) {
                entry.fixedStart = true;
                entry.startLeft = p.startLeft;
                entry.startTop = p.startTop;
                entry.startPageId = p.startPageId;
                entry.startRotation = p.startRotation;
            }
            if (p.intervalOverride != null) entry.intervalOverride = p.intervalOverride;
            if (p.runOnce != null) entry.runOnce = p.runOnce;
            if (p.maxTokens != null) entry.maxTokens = p.maxTokens;
            if (p.randomStart != null) entry.randomStart = p.randomStart;
            state[NAME].storedVariables.paths.push(entry);
            added++;
        });
        createMenu();
        sendChat(`${NAME}`, `/w GM Imported ${added} path(s), skipped ${skipped} (name already exists).`);
    }

    function duplicatePath(sourceName, newName) {
        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name === sourceName);
        if (pathIndex === -1) {
            sendChat(`${NAME}`, `/w GM Path "${sourceName}" not found.`);
            return;
        }
        if (state[NAME].storedVariables.paths.find(p => p.name === newName)) {
            sendChat(`${NAME}`, `/w GM A path named "${newName}" already exists.`);
            return;
        }
        const src = state[NAME].storedVariables.paths[pathIndex];
        const pathStr = typeof src.path === 'string' ? src.path : (src.path && src.path.path) || '';
        const copy = {
            name: newName,
            path: pathStr,
            isCycle: !!src.isCycle,
        };
        if (src.fixedStart && src.startLeft != null) {
            copy.fixedStart = true;
            copy.startLeft = src.startLeft;
            copy.startTop = src.startTop;
            copy.startPageId = src.startPageId;
            copy.startRotation = src.startRotation;
        }
        if (src.intervalOverride != null) copy.intervalOverride = src.intervalOverride;
        if (src.runOnce != null) copy.runOnce = src.runOnce;
        if (src.maxTokens != null) copy.maxTokens = src.maxTokens;
        if (src.randomStart != null) copy.randomStart = src.randomStart;
        state[NAME].storedVariables.paths.push(copy);
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${sourceName}" duplicated as "${newName}".`);
    }

    function addExamplePaths() {
        const examples = [
            { name: 'Square', path: 'U2R2D2L2' },
            { name: 'Big Square', path: 'U3R3D3L3' },
            { name: 'Horizontal', path: 'R4L4' },
            { name: 'Vertical', path: 'U4D4' },
            { name: 'Rectangle', path: 'U1R2D1L2' },
            { name: 'Pause Square', path: 'U2WR2WD2WL2W' },
            { name: 'Zigzag', path: 'U1R1U1R1D1L1D1L1' },
            { name: 'Blinker', path: 'S' },
            { name: 'T-Patrol', path: 'U3U0WWR2R0WWL4WWR2D3WW' },
            { name: 'Figure-8', path: 'R2U2L2D2L2U2R2D2' },
        ];
        const existing = state[NAME].storedVariables.paths;
        let added = 0;
        examples.forEach(ex => {
            if (!existing.find(p => p.name === ex.name)) {
                existing.push({
                    name: ex.name,
                    path: ex.path,
                    isCycle: testCycle(ex.path, true)
                });
                added++;
            }
        });
        createMenu();
        sendChat(`${NAME}`, `/w GM Added ${added} example path(s). ${added === 0 ? 'All example paths already exist.' : 'Paths already present were skipped.'}`);
    }

    function buildPath(tokenId, name) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        if (!tokenId) {
            sendChat(`${NAME}`, "/w GM Please specify a tokenId for the path.");
            return;
        }

        // Check for name in pathDraft list and path list
        if (state[NAME].storedVariables.pathDrafts.find(p => p.name == name) || state[NAME].storedVariables.paths.find(p => p.name == name)) {
            sendChat(`${NAME}`, "/w GM Path name already exists.");
            return;
        }

        // Create pathDraft
        const pathDraft = {
            name: name,
            path: "",
            tokenId: tokenId,
            step: 0,
            currentStep: {
                direction: "",
                distance: undefined,
            },
            previousStep: {
                direction: "",
                distance: undefined,
            },
        };

        state[NAME].storedVariables.pathDrafts.push(pathDraft);
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${name}" added to Drafts.`);
    }

    function draftPath(name, direction, distance) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        if (!direction) {
            sendChat(`${NAME}`, "/w GM Please specify a direction for the path.");
            return;
        }

        // Short Circuits for Set and Remove
        if (direction == "Set") {
            setDraftToPath(name);
            createMenu();
            return;
        } else if (direction == "Rmv") {
            state[NAME].storedVariables.pathDrafts.splice(state[NAME].storedVariables.pathDrafts.findIndex(p => p.name == name), 1);
            createMenu();
            return;
        }

        // Check for valid direction
        if (!/[UDLRWS]/.test(direction)) {
            sendChat(`${NAME}`, `/w GM Invalid direction {${direction}}.`);
            return;
        }

        // Validate distance
        if (!!distance) {
            if (direction == "W" || direction == "S") {
                sendChat(`${NAME}`, `/w GM "W" means "Wait", "S" means "Stealth Toggle". These should not have distance input.`);

            } else if (!/\d+/.test(distance)) {
                sendChat(`${NAME}`, "/w GM Please specify a valid distance.");
                return;
            }
        }

        // Get draft by name in pathDrafts
        const draftIndex = state[NAME].storedVariables.pathDrafts.findIndex(p => p.name == name);
        if (draftIndex < 0) {
            sendChat(`${NAME}`, "/w GM Path draft not found.");
            return;
        }

        // Validate Draft
        if (state[NAME].storedVariables.pathDrafts[draftIndex].path == undefined || state[NAME].storedVariables.pathDrafts[draftIndex].tokenId == undefined) {
            sendChat(`${NAME}`, "/w GM Path draft improperly started, removing draft. Please try again.");
            state[NAME].storedVariables.pathDrafts.splice(draftIndex, 1);
            return;
        }

        state[NAME].storedVariables.pathDrafts[draftIndex].path +=
            (direction === "W") ? "W"
                : (direction === "S") ? "S"
                    : `${direction}${distance}`;

        state[NAME].storedVariables.pathDrafts[draftIndex].step++;

        // Move Token for Visual Verification
        if (!moveToken(state[NAME].storedVariables.pathDrafts[draftIndex].tokenId, direction, distance || 0)) {
            sendChat(`${NAME}`, "/w GM Failed to move token.");
        }

        createMenu();
    }

    function setDraftToPath(name) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        // Get draft by name in pathDrafts
        const draftIndex = state[NAME].storedVariables.pathDrafts.findIndex(p => p.name == name);
        if (draftIndex < 0) {
            sendChat(`${NAME}`, "/w GM Path draft not found.");
            return;
        }

        // Validate Draft
        // TODO: Round up all of these into one function
        if (state[NAME].storedVariables.pathDrafts[draftIndex].path == undefined || state[NAME].storedVariables.pathDrafts[draftIndex].tokenId == undefined) {
            sendChat(`${NAME}`, "/w GM Path draft improperly started, removing draft. Please try again.");
            state[NAME].storedVariables.pathDrafts.splice(draftIndex, 1);
            return;
        }

        // Add path to path list
        state[NAME].storedVariables.paths.push({
            name: name,
            path: state[NAME].storedVariables.pathDrafts[draftIndex].path,
            isCycle: testCycle(state[NAME].storedVariables.pathDrafts[draftIndex].path),
        });

        // Remove draft
        state[NAME].storedVariables.pathDrafts.splice(draftIndex, 1);

        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${name}" added to Paths and removed from Drafts.`);
    }

    function getPathIndexByName(name) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return -1;
        }

        const index = state[NAME].storedVariables.paths.findIndex(path => path.name == name);
        if (index == -1) {
            sendChat(`${NAME}`, `/w GM Path "${name}" not found in Paths.`);
            return -1;
        }

        return index;
    }

    function validatePathString(pathString) {
        if (!pathString) {
            sendChat(`${NAME}`, "/w GM Please specify a path code for the path.");
            return false;
        }

        if (pathString.length < 4) {
            sendChat(`${NAME}`, "/w GM Path must be at least 2 Vectors (ie. U1D1) long.");
            return false;
        }

        let pathArray = [];
        try {
            pathArray = pathString.match(/([UDLR])(\d+)/g);
        } catch (err) {
            sendChat(`${NAME}`, "/w GM Path must be a valid path code (ie. U1R1L1D1).");
            return false;
        }

        if (!pathArray || pathArray.length == 0) {
            sendChat(`${NAME}`, "/w GM Path must be a valid path code (ie. U1R1L1D1).");
            return false;
        }

        for (let i = 0; i < pathArray.length; i++) {
            const vector = pathArray[i];
            const direction = vector.charAt(0);
            const distance = parseInt(vector.substring(1), 10);

            if (distance < 0 && direction != "W") {
                sendChat(`${NAME}`, "/w GM Path must have at least 1 unit of distance.");
                return false;
            }

            if (direction !== "U" && direction !== "D" && direction !== "L" && direction !== "R") {
                sendChat(`${NAME}`, "/w GM Path must use U, D, L, or R for directions.");
                return false;
            }
        }

        return true;
    }

    function listPaths(name) {
        const paths = state[NAME].storedVariables.paths;
        if (name) {
            const index = getPathIndexByName(name);
            if (index == -1) {
                return;
            }

            const p = paths[index];
            const pathStr = typeof p.path === 'string' ? p.path : (p.path && p.path.path) || '';
            const fixedStartInfo = p.fixedStart ? ` Fixed start: yes (${p.startLeft}, ${p.startTop})` : ' Fixed start: no (start from anywhere)';
            const intervalInfo = p.intervalOverride ? ` Interval: ${p.intervalOverride}ms` : '';
            const runOnceInfo = p.runOnce ? ' Run once: yes' : '';
            const maxInfo = p.maxTokens != null ? ` Max tokens: ${p.maxTokens}` : '';
            const randomStartInfo = p.randomStart ? ' Random start: yes' : '';
            sendChat(`${NAME}`, `/w GM Path "${name}" is defined as "${pathStr}" (Cycle: ${p.isCycle}).${fixedStartInfo}${intervalInfo}${runOnceInfo}${maxInfo}${randomStartInfo} Current Tokens on Path:<br/> ${getTokensOnPath(name)}`);
        } else {
            sendChat(`${NAME}`, `/w GM Paths:<br/><table>${paths.map(path => `<tr><td style="margin-left: 5px">${path.name}</td><td>${path.path}</td><td>${path.isCycle}</td></tr>`).join("")}</table>`);
        }
    }

    function listTokens(name) {
        const tokens = state[NAME].storedVariables.activeTokenPaths;
        if (tokens.length === 0) {
            sendChat(`${NAME}`, "/w GM No Tokens are currently on a Path.");
            return;
        }

        const tokenRow = (token) => {
            const obj = getObj('graphic', token.tokenId);
            return `<tr><td style="margin-left: 5px">-- ${obj ? obj.get('name') : token.tokenId}</td><td>${token.pathName}</td></tr>`;
        };
        if (name) {
            sendChat(`${NAME}`, `/w GM Tokens on Path "${name}":<br/> ${tokens.filter(t => t.pathName === name).map(tokenRow).join("")}`);
        } else {
            sendChat(`${NAME}`, `/w GM Tokens:<br/><table>${tokens.map(tokenRow).join("")}</table>`);
        }
    }

    function listTick() {
        sendChat(`${NAME}`, `/w GM <br/>Tick: ${state[NAME].storedVariables.interval} ms`);
    }

    function listVars() {
        listingVars = true;
        createMenu();
    }

    function listDrafts(name) {
        if (name != undefined && name != "") {
            const draftIndex = state[NAME].storedVariables.pathDrafts.findIndex(draft => draft.name == name);

            if (draftIndex > -1) {
                const draft = state[NAME].storedVariables.pathDrafts[draftIndex];
                if (draft.tokenId === undefined || draft.tokenId === "") {
                    sendChat(`${NAME}`, `/w GM Draft "${draft.name}" does not have a tokenId assigned and will now be deleted.`);
                    state[NAME].storedVariables.pathDrafts.splice(draftIndex, 1);
                    return;
                }

                if (state[NAME].storedVariables.pathDrafts[draftIndex].path == undefined || state[NAME].storedVariables.pathDrafts[draftIndex].path == "") {
                    sendChat(`${NAME}`, `/w GM Draft "${state[NAME].storedVariables.pathDrafts[draftIndex].name}" with Token "${getObj('graphic', state[NAME].storedVariables.pathDrafts[draftIndex].tokenId).get('name')}" has yet to be started.`);
                    return;
                } else {
                    sendChat(`${NAME}`, `/w GM Draft "${state[NAME].storedVariables.pathDrafts[draftIndex].name}" with Token "${getObj('graphic', state[NAME].storedVariables.pathDrafts[draftIndex].tokenId).get('name')}" is on Path "${state[NAME].storedVariables.pathDrafts[draftIndex].path}".`);
                }
            } else {
                sendChat(`${NAME}`, `/w GM Draft "${name}" not found.`);
                return;
            }
        }

        sendChat(`${NAME}`, `/w GM Path Drafts:<br/>${state[NAME].storedVariables.pathDrafts.map(draft => `<br/>${draft.name}<br/>${draft.path}<br/>${draft.step}<br/>${draft.tokenId}`).join("<br/>")}`);
    }

    function getTokensOnPath(name) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        if (!!state[NAME].storedVariables.activeTokenPaths && (state[NAME].storedVariables.activeTokenPaths.length === 0 || state[NAME].storedVariables.activeTokenPaths.filter(token => token.pathName === name).length === 0)) {
            return "None";
        }

        return state[NAME].storedVariables.activeTokenPaths.filter(token => token.pathName === name).map(token => {
            const obj = getObj('graphic', token.tokenId);
            return `-- ${obj ? obj.get('name') : token.tokenId}`;
        }).join("<br/>");
    }

    function startPath(selected, pathName) {
        if (!selected) {
            sendChat(`${NAME}`, "/w GM Please select a token to start a path.");
            return;
        }

        if (!pathName) {
            sendChat(`${NAME}`, "/w GM Please specify a path name.");
            return;
        }

        const pathIndex = state[NAME].storedVariables.paths.findIndex(p => p.name == pathName);
        if (pathIndex == -1) {
            sendChat(`${NAME}`, "/w GM Path not found.");
            return;
        }

        const pathDef = state[NAME].storedVariables.paths[pathIndex];
        if (pathDef.isCycle == undefined) {
            pathDef.isCycle = testCycle(pathDef.path, true);
        }

        const useFixedStart = pathDef.fixedStart === true && pathDef.startLeft != null && pathDef.startTop != null && pathDef.startPageId;
        const pathStrForStart = typeof pathDef.path === 'string' ? pathDef.path : (pathDef.path && pathDef.path.path) || '';
        const pathArrayForStart = pathStrForStart.match(/([UDLR])([0-9]+)|W|S/g);
        const randomStep = (pathDef.randomStart && pathArrayForStart && pathArrayForStart.length > 1)
            ? Math.floor(Math.random() * pathArrayForStart.length) : 0;

        selected.forEach(function (sel) {
            const countOnPath = state[NAME].storedVariables.activeTokenPaths.filter(t => t.pathName === pathName).length;
            if (pathDef.maxTokens != null && pathDef.maxTokens > 0 && countOnPath >= pathDef.maxTokens) {
                sendChat(`${NAME}`, `/w GM Path "${pathName}" is at max tokens (${pathDef.maxTokens}). Skipping.`);
                return;
            }

            const token = getObj('graphic', sel._id);
            if (!token) {
                sendChat(`${NAME}`, "/w GM Please select a token to start a path.");
                return;
            }

            let tokenLeft, tokenTop, pageId, tokenRotation;

            if (useFixedStart) {
                // Move token to the path's fixed start position (and page if needed)
                if (token.get('_pageid') !== pathDef.startPageId) {
                    token.set('_pageid', pathDef.startPageId);
                }
                token.set({
                    left: pathDef.startLeft,
                    top: pathDef.startTop,
                    rotation: pathDef.startRotation != null ? pathDef.startRotation : token.get('rotation')
                });
                tokenLeft = pathDef.startLeft;
                tokenTop = pathDef.startTop;
                pageId = pathDef.startPageId;
                tokenRotation = pathDef.startRotation != null ? pathDef.startRotation : token.get('rotation');
            } else {
                tokenLeft = token.get('left');
                tokenTop = token.get('top');
                pageId = token.get('_pageid');
                tokenRotation = token.get('rotation');
            }

            if (tokenLeft == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Token Left.");
                return;
            }
            if (tokenTop == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Token Top.");
                return;
            }
            if (pageId == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Page ID from Token.");
                return;
            }

            const page = getObj('page', pageId);
            if (!page) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Page.");
                return;
            }

            const pageName = page.get('name');
            if (pageName == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Page Name.");
                return;
            }

            const pageWidth = page.get('width');
            if (pageWidth == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Page Width.");
                return;
            }

            const pageHeight = page.get('height');
            if (pageHeight == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Page Height.");
                return;
            }

            const pageScale = page.get('scale_number');
            if (pageScale == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Page Scale.");
                return;
            }

            if (state[NAME].storedVariables.pageMetas === undefined) {
                state[NAME].storedVariables.pageMetas = [];
            }

            if (state[NAME].storedVariables.activeTokenPaths === undefined) {
                state[NAME].storedVariables.activeTokenPaths = [];
            }

            const pageMetaIndex = state[NAME].storedVariables.pageMetas.findIndex(pageMeta => pageMeta.pageId === pageId);
            if (pageMetaIndex === -1) {
                state[NAME].storedVariables.pageMetas.push({
                    pageId: pageId,
                    pageName: pageName,
                    pageWidth: pageWidth * state[NAME].storedVariables.unitPx,
                    pageHeight: pageHeight * state[NAME].storedVariables.unitPx,
                    pageScaleNumber: pageScale
                });
            } else if (state[NAME].storedVariables.pageMetas[pageMetaIndex].pageScaleNumber === undefined) {
                state[NAME].storedVariables.pageMetas[pageMetaIndex].pageWidth = pageWidth * state[NAME].storedVariables.unitPx;
                state[NAME].storedVariables.pageMetas[pageMetaIndex].pageHeight = pageHeight * state[NAME].storedVariables.unitPx;
                state[NAME].storedVariables.pageMetas[pageMetaIndex].pageScaleNumber = pageScale;
            }

            const pathStr = typeof pathDef.path === 'string' ? pathDef.path : (pathDef.path && pathDef.path.path) || '';
            const pageWpx = pageWidth * state[NAME].storedVariables.unitPx;
            const pageHpx = pageHeight * state[NAME].storedVariables.unitPx;
            if (pathStr && pathWouldLeaveBounds(pathStr, tokenLeft, tokenTop, state[NAME].storedVariables.unitPx, pageWpx, pageHpx)) {
                sendChat(`${NAME}`, `/w GM Warning: Path "${pathName}" may leave the map from this start position. Token still added.`);
            }

            state[NAME].storedVariables.activeTokenPaths.push({
                tokenId: sel._id,
                pathName: pathName,
                step: randomStep,
                subStep: 0,
                subStepTotal: 0,
                tickCounter: 0,
                initialLeft: tokenLeft,
                initialTop: tokenTop,
                initialRotation: tokenRotation,
                isReversing: false,
                pageId: pageId,
            });
        });

        createMenu();
        sendChat(`${NAME}`, `/w GM Tokens on Path "${pathName}" have started moving.`);
    }

    function stopPaths(selected, name) {
        if (!!selected && selected.length > 0) {
            let stoppedReportText = "Stopped: { Token Name | Path Name }<br/>";

            if (!!selected && selected.length > 0) {
                for (let i = 0; i < selected.length; i++) {

                    // Stop Token's Path
                    const tokenId = selected[i]['_id'];
                    const index = state[NAME].storedVariables.activeTokenPaths.findIndex(token => token.tokenId == tokenId);
                    if (index > -1) {
                        stoppedReportText += `-- ${getObj('graphic', tokenId).get('name')} | ${state[NAME].storedVariables.activeTokenPaths[index].pathName}<br/>`;
                        state[NAME].storedVariables.activeTokenPaths.splice(index, 1);
                    }

                    // Stop Token's Follow
                    const memoryIndex = state[NAME].storedVariables.tokenMemory.findIndex(memory => memory.tokenId == tokenId);
                    if (memoryIndex > -1) {
                        stoppedReportText += `-- ${getObj('graphic', tokenId).get('name')} | Following<br/>`;
                        state[NAME].storedVariables.tokenMemory.splice(memoryIndex, 1);
                    }
                }
            } else {
                state[NAME].storedVariables.activeTokenPaths = [];
                stoppedReportText = "All Tokens have stopped moving.";
            }

            createMenu();
            sendChat(`${NAME}`, `/w GM ${stoppedReportText}`);

            return;
        }

        if (name !== undefined && name !== "") {
            state[NAME].storedVariables.activeTokenPaths = state[NAME].storedVariables.activeTokenPaths.filter(token => token.pathName !== name);
            createMenu();
            sendChat(`${NAME}`, `/w GM Tokens on Path "${name}" have stopped moving.`);
        }
    }

    function lockTokens(selected) {
        if (!selected) {
            sendChat(`${NAME}`, "/w GM Please select a token to lock.");
            return;
        }

        let lockReadout = "Locked the following tokens:<br/>";
        selected.forEach(function (sel) {
            const token = getObj('graphic', sel._id);
            if (!token) return;

            token.set('status_red', true);

            const index = state[NAME].storedVariables.tokenMemory.findIndex(t => t.tokenId === sel._id);
            if (index === -1) {
                state[NAME].storedVariables.tokenMemory.push({
                    tokenId: sel._id,
                    pageId: token.get('_pageid'),
                    rotation: token.get('rotation'),
                    left: token.get('left'),
                    top: token.get('top'),
                    followingTokenId: "",
                    isFollowing: false,
                    isLocked: true
                });
            } else {
                state[NAME].storedVariables.tokenMemory[index].isLocked = true;
                state[NAME].storedVariables.tokenMemory[index].isFollowing = false;
                state[NAME].storedVariables.tokenMemory[index].followingTokenId = "";
                state[NAME].storedVariables.tokenMemory[index].left = token.get('left');
                state[NAME].storedVariables.tokenMemory[index].top = token.get('top');
                state[NAME].storedVariables.tokenMemory[index].rotation = token.get('rotation');
            }

            lockReadout += `-- ${token.get('name')}<br/>`;
        });

        createMenu();
        sendChat(`${NAME}`, `/w GM ${lockReadout}`);
    }

    function unlockTokens(selected) {
        if (!selected) {
            sendChat(`${NAME}`, "/w GM Please select a token to unlock.");
            return;
        }

        selected.forEach(function (selected) {
            const token = getObj('graphic', selected._id);
            token.set('status_red', false);

            const index = state[NAME].storedVariables.tokenMemory.findIndex(token => token.tokenId == selected._id);
            if (index == -1) {
                sendChat(`${NAME}`, `/w GM Token "${selected._id}" is not currently locked.`);
                return;
            }

            state[NAME].storedVariables.tokenMemory.splice(index, 1);
        });

        createMenu();
        sendChat(`${NAME}`, `/w GM Tokens have been unlocked.`);
    }

    function followTokens(followerId, leaderId) {
        const followerToken = getObj('graphic', followerId);
        const leaderToken = getObj('graphic', leaderId);
        if (!followerToken || !leaderToken) {
            sendChat(`${NAME}`, `/w GM Invalid token(s) selected.`);
            return;
        }

        let memory = state[NAME].storedVariables.tokenMemory;
        if (memory.find(t => t.tokenId === followerId && t.isFollowing && t.followingTokenId === leaderId)) {
            sendChat(`${NAME}`, `/w GM ${followerToken.get('name')} is already following ${leaderToken.get('name')}.`);
            return;
        }

        const followerIndex = state[NAME].storedVariables.tokenMemory.findIndex(token => token.tokenId == followerId);

        if (followerIndex == -1) {
            state[NAME].storedVariables.tokenMemory.push({
                tokenId: followerId,
                pageId: followerToken.get('_pageid'),
                followingTokenId: leaderId,
                rotation: followerToken.get('rotation'),
                left: followerToken.get('left'),
                top: followerToken.get('top'),
                isFollowing: true,
                isLocked: false
            });
        } else {
            state[NAME].storedVariables.tokenMemory[followerIndex].followingTokenId = leaderId;
            state[NAME].storedVariables.tokenMemory[followerIndex].isFollowing = true;
            state[NAME].storedVariables.tokenMemory[followerIndex].rotation = followerToken.get('rotation');
            state[NAME].storedVariables.tokenMemory[followerIndex].left = followerToken.get('left');
            state[NAME].storedVariables.tokenMemory[followerIndex].top = followerToken.get('top');

            if (state[NAME].storedVariables.tokenMemory[followerIndex].isLocked) {
                followerToken.set('status_red', false);
                state[NAME].storedVariables.tokenMemory[followerIndex].isLocked = false;
            }
        }

        createMenu();
        sendChat(`${NAME}`, `/w GM Token "${followerId}" is now following Token "${leaderId}".`);
    }

    function processFollowMovement(leaderId, left, top, rotation) {
        const listOfFollowers = state[NAME].storedVariables.tokenMemory.filter(token => token.followingTokenId === leaderId);
        const tokenIdsToRemove = [];

        for (let i = 0; i < listOfFollowers.length; i++) {
            if (listOfFollowers[i].isLocked) {
                continue;
            }

            const follower = getObj('graphic', listOfFollowers[i].tokenId);
            if (!follower) {
                tokenIdsToRemove.push(listOfFollowers[i].tokenId);
                continue;
            }

            follower.set({
                'left': left,
                'top': top,
                'rotation': rotation
            });
        }

        if (tokenIdsToRemove.length > 0) {
            state[NAME].storedVariables.tokenMemory = state[NAME].storedVariables.tokenMemory.filter(t => !tokenIdsToRemove.includes(t.tokenId));
        }
    }

    function updateTick(interval) {
        const intervalNumber = parseInt(interval, 10);
        if (isNaN(intervalNumber)) {
            sendChat(`${NAME}`, "/w GM Please specify a valid interval.");
            return;
        }

        if (intervalNumber < 1) {
            sendChat(`${NAME}`, "/w GM Please specify an interval greater than 0.");
            return;
        }

        state[NAME].storedVariables.interval = intervalNumber < 10 ? intervalNumber * 1000 : intervalNumber;
        if (pathTokensIntervalId) clearInterval(pathTokensIntervalId);
        pathTokensIntervalId = setInterval(pathTokens, state[NAME].storedVariables.interval);
        createMenu();
        if (intervalNumber < 2000 && intervalNumber > 10) {
            let dangerBody = new HtmlBuilder('.danger');
            dangerBody.append('.dangerText', "It is recommended to use an interval greater than 2000ms (lag danger zone).");


            sendChat(`${NAME}`, '/w GM ' + dangerBody.toString({
                'danger': {
                    // red background
                    'background-color': '#ff0000',
                    // white text
                    'color': '#ffffff'
                }
            }));
        }
        sendChat(`${NAME}`, `/w GM Tick interval set to ${state[NAME].storedVariables.interval} milliseconds.`);
    }

    function hideCommands() {
        state[NAME].storedVariables.hideCommands = !state[NAME].storedVariables.hideCommands;
        createMenu();
    }

    function resetTokens() {
        state[NAME].storedVariables.activeTokenPaths.forEach(function (pathEntry) {
            const tokenObj = getObj('graphic', pathEntry.tokenId);
            if (tokenObj) {
                tokenObj.set('left', pathEntry.initialLeft);
                tokenObj.set('top', pathEntry.initialTop);
                tokenObj.set('rotation', pathEntry.initialRotation);
                tokenObj.set('layer', 'objects');
            }
        });
        state[NAME].storedVariables.activeTokenPaths = [];

        if (state[NAME].storedVariables.tokenMemory.length > 0) {
            state[NAME].storedVariables.tokenMemory.filter(tm => tm.isFollowing).forEach(function (token) {
                const tokenObj = getObj('graphic', token.tokenId);
                if (tokenObj) {
                    tokenObj.set('left', token.left);
                    tokenObj.set('top', token.top);
                    tokenObj.set('rotation', token.rotation);
                    tokenObj.set('status_red', false);
                    tokenObj.set('layer', 'objects');
                }
            });
        }

        createMenu();
        sendChat(`${NAME}`, "/w GM All Tokens have been reset.");
    }

    function createMenu() {
        menuShowCount++;

        let menu = new HtmlBuilder('.menu');
        menu.append('.menuHeader', 'Token Controls');

        let content = menu.append('div');
        let topRow = content.append('table');
        let tr = topRow.append('tr');
        tr.append('td', '[Usage](!tc usage)');
        tr.append('td', `[\`\`Add examples\`\`](!tc examples)`);
        content.append('.subLabel', '!tc may be used in place of !token-control');

        content.append('.menuLabel', 'Paths');
        content.append('.subLabel', 'Select one or more tokens to start a path');
        let table = content.append('table');

        for (let i = 0; i < state[NAME].storedVariables.paths.length; i++) {
            const path = state[NAME].storedVariables.paths[i];

            let row = table.append('tr', undefined, { title: path.name });

            row.append('td', `[${path.name}](!tc List Paths ${path.name})`);
            row.append('td', `[\`\`Start\`\`](!tc Start ${path.name})`);
            row.append('td', `[\`\`Stop\`\`](!tc Stop ${path.name})`);
            row.append('td', `[\`\`Reset\`\`](!tc Reset ${path.name})`);
            row.append('td', path.fixedStart
                ? `[\`\`Clear start\`\`](!tc clearstart ${path.name})`
                : `[\`\`Set start\`\`](!tc setstart ${path.name})`);
            row.append('td', `[\`\`Remove\`\`](!tc Remove ${path.name})`);
        }

        if (!!state[NAME].storedVariables.pathDrafts && state[NAME].storedVariables.pathDrafts.length > 0) {
            content.append('.menuLabel', 'Draft Paths');
            content.append('.subLabel', 'Select one or more tokens to start a draft path');
            table = content.append('table');

            for (let i = 0; i < state[NAME].storedVariables.pathDrafts.length; i++) {
                const path = state[NAME].storedVariables.pathDrafts[i];

                let row = table.append('tr', undefined, { title: path.name });
                row.append('td', `[${path.name}](!tc List Draft ${path.name})`);
                row.append('td', `[\`\`L\`\`](!tc draft ${path.name} L ${state[NAME].storedVariables.unitPerClick})`);
                row.append('td', `[\`\`U\`\`](!tc draft ${path.name} U ${state[NAME].storedVariables.unitPerClick})`);
                row.append('td', `[\`\`D\`\`](!tc draft ${path.name} D ${state[NAME].storedVariables.unitPerClick})`);
                row.append('td', `[\`\`R\`\`](!tc draft ${path.name} R ${state[NAME].storedVariables.unitPerClick})`);
                row.append('td', `[\`\`W\`\`](!tc draft ${path.name} W)`);
                row.append('td', `[\`\`S\`\`](!tc draft ${path.name} S)`);
                row.append('td', `[\`\`Set\`\`](!tc draft ${path.name} Set)`);
                row.append('td', `[\`\`Rmv\`\`](!tc draft ${path.name} Rmv)`);
            }

            content.append('.menuLabel', `[Units: ${state[NAME].storedVariables.unitPerClick}](!tc unit ?{Units per click |0|1|2|3|4|5|6|7|8|9|10})`);
        }

        content.append('.menuLabel', 'Token');
        content.append('.subLabel', 'Select one or more tokens to stop a path');
        table = content.append('table');
        let row = table.append('tr');
        row.append('td', `[\`\`Stop\`\`](!tc Stop)`);
        row.append('td', `[\`\`Reset\`\`](!tc Reset)`);
        row.append('td', `[\`\`Lock\`\`](!tc Lock)`);
        row.append('td', `[\`\`Unlock\`\`](!tc Unlock)`);

        content.append('.menuLabel', 'Interval');
        table = content.append('table');
        row = table.append('tr');
        row.append('td', `[Tick](!tc List Tick)`);
        row.append('td', `[\`\`DOWN(s)\`\`](!tc Tick ${state[NAME].storedVariables.interval - 1000})`);
        row.append('td', `[\`\`DOWN(ms)\`\`](!tc Tick ${state[NAME].storedVariables.interval - 100})`);
        row.append('td', `[\`\`UP(ms)\`\`](!tc Tick ${state[NAME].storedVariables.interval + 100})`);
        row.append('td', `[\`\`UP(s)\`\`](!tc Tick ${state[NAME].storedVariables.interval + 1000})`);

        content.append('.menuLabel', 'Pixels Per Unit');
        table = content.append('table');
        row = table.append('tr');
        row.append('td', `[\`\`${state[NAME].storedVariables.unitPx}\`\`](!tc unitpx ?{Pixels per Grid Unit?})`);
        row.append('td', `[\`\`Default\`\`](!tc unitpx 70)`);

        content.append('.menuLabel', 'Rotate Tokens');
        table = content.append('table');
        row = table.append('tr');
        row.append('td', `[\`\`Toggle ${state[NAME].storedVariables.rotateTokens ? 'Off' : 'On'}\`\`](!tc rotate)`);

        // Combat Patroling
        content.append('.menuLabel', 'Combat Patrol');
        content.append('.subLabel', 'Patrols pause during combat - this setting moves tokens on turn order change when enabled.');
        table = content.append('table');
        row = table.append('tr');
        row.append('td', `[\`\`Toggle ${state[NAME].storedVariables.combatPatrol ? 'Off' : 'On'}\`\`](!tc combat)`);

        content.append('.menuLabel', 'Smooth movement (sub-steps)');
        content.append('.subLabel', 'When on, long moves (e.g. U3) are done 1 unit per tick for smoother motion.');
        table = content.append('table');
        row = table.append('tr');
        row.append('td', `[\`\`Toggle ${state[NAME].storedVariables.subStepMovement ? 'Off' : 'On'}\`\`](!tc substeps)`);

        if (listingVars) {
            content.append('.menuLabel', 'Variables');
            content.append('.subLabel', 'Current variables live in script state.');
            // Create a table for Token Memory Variables
            table = content.append('table', 'Token Memory');
            row = table.append('tr'); // Headers
            row.append('td', 'Token');
            row.append('td', 'ID');
            row.append('td', 'Page');
            row.append('td', 'Rotation');
            row.append('td', 'Left');
            row.append('td', 'Top');
            row.append('td', 'Following Token');
            row.append('td', 'Is Following');
            row.append('td', 'Is Locked');

            for (let i = 0; i < state[NAME].storedVariables.tokenMemory.length; i++) {
                const token = state[NAME].storedVariables.tokenMemory[i];
                const obj = getObj('graphic', token.tokenId);
                if (!obj) continue;

                row = table.append('tr');
                row.append('td', `${obj.get('name')}`);
                row.append('td', `${token.tokenId}`);
                row.append('td', `${token.pageId}`);
                row.append('td', `${token.rotation}`);
                row.append('td', `${token.left}`);
                row.append('td', `${token.top}`);
                row.append('td', `${token.followingTokenId}`);
                row.append('td', `${token.isFollowing}`);
                row.append('td', `${token.isLocked}`);
            }

            // Create a table for Active Token Paths
            table = content.append('table', 'Active Token Paths');
            row = table.append('tr'); // Headers
            row.append('td', 'Token');
            row.append('td', 'ID');
            row.append('td', 'Path');
            row.append('td', 'Step');

            for (let i = 0; i < state[NAME].storedVariables.activeTokenPaths.length; i++) {
                const tokenPath = state[NAME].storedVariables.activeTokenPaths[i];
                row = table.append('tr');
                row.append('td', `${getObj('graphic', tokenPath.tokenId).get('name')}`);
                row.append('td', `${tokenPath.tokenId}`);
                row.append('td', `${tokenPath.pathName}`);
                row.append('td', `${tokenPath.step}`);
            }

            // Create a table for Path Drafts
            table = content.append('table', 'Path Drafts');
            row = table.append('tr'); // Headers
            row.append('td', 'Name');
            row.append('td', 'TokenId');
            row.append('td', 'Path');
            row.append('td', 'Step');
            row.append('td', 'Prev');
            row.append('td', 'Curr');

            for (let i = 0; i < state[NAME].storedVariables.pathDrafts.length; i++) {
                const pathDraft = state[NAME].storedVariables.pathDrafts[i];
                row = table.append('tr');
                row.append('td', `${pathDraft.name}`);
                row.append('td', `${pathDraft.tokenId}`);
                row.append('td', `${pathDraft.path}`);
                row.append('td', `${pathDraft.step}`);
                if (pathDraft.prevStep) {
                    row.append('td', `${pathDraft.previousStep.direction + pathDraft.previousStep.distance}`);
                }
                if (pathDraft.currentStep) {
                    row.append('td', `${pathDraft.currentStep.direction + pathDraft.currentStep.distance}`);
                }
            }

            listingVars = false;
        }

        menu.append('.patreon', '[``Become a Patron``](https://www.patreon.com/bePatron?u=23167000)');

        // Version & Menu Show Count
        menu.append('.subLabel', `V.${VERSION} - ${menuShowCount}`)

        sendChat(`${NAME}`, '/w GM ' + menu.toString({
            'optionsTable': {
                'width': '100%'
            },
            'menu': {
                'background': '#33658A',
                'border': 'solid 1px #000',
                'border-radius': '5px',
                'font-weight': 'bold',
                'margin-bottom': '1em',
                'overflow': 'hidden',
                'color': '#fff',
                'justify-content': 'space-evenly',
            },
            'menuBody': {
                'padding': '5px',
                'text-align': 'center'
            },
            'menuLabel': {
                'color': '#F6AE2D',
                'margin-top': '5px',
            },
            'menuHeader': {
                'background': '#000',
                'color': '#fff',
                'text-align': 'center',
            },
            'usageHeader': {
                'background': '#000',
                'color': '#fff',
                'text-align': 'center',
            },
            'usage': {
                'background': '#000',
                'color': '#fff',
                'text-align': 'center',
            },
            'subLabel': {
                'color': '#F26419',
                'font-size': '0.8em',
            },
            'patreon': {
                'color': '#F6AE2D',
                'font-size': '1.1em',
                'text-align': 'center',
                'margin-top': '10px',
                'margin-bottom': '10px'
            }
        }));
    }

    function toggleStealth(tokenId) {
        try {
            const token = getObj('graphic', tokenId);
            const currentLayer = token.get('layer');
            const newLayer = currentLayer === 'objects' ? 'gmlayer' : 'objects';
            token.set('layer', newLayer);
        }
        catch (e) {
            sendChat(`${NAME}`, `/w GM Toggle Stealth - Token not found.`);
        }
    }

    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.TokenController.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TokenController.offset); } }
