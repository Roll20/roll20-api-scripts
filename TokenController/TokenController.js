/*
Token Control - A Roll20 Script to move tokens along scripted paths at a variable interval
* Commands: Square Brackets are Optional, Angle Brackets are Required, Vertical Bars mean OR

# General Commands
*   !token-control
    - Displays the help text
    - Honestly, just use the menu, it got crazy

# Upcomging Features:
*   Path Layer Swapping -- Version(N.+.0)
    - "Hide" and "Show" tokens at various points of the path
*   Cleaner Pathing -- Version(N.M.+)
    - Break long segments into smaller steps
*   Area Patrol -- Version (+.0.0)
*   Detect Walls (only doing with grid matrix math, no linear)
*   Allow user to define unit pixel size
*   Draft Token Handling

# Known Defects:
*
*/

var API_Meta = API_Meta || {};
API_Meta.TokenController = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.TokenController.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

const TokenController = (() => {
    const NAME = 'TokenController';
    const VERSION = '2.1.3';
    const AUTHOR = 'Scott E. Schwarz';
    let errorMessage = "";
    let listingVars = false;

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
                    }],
                activeTokenPaths: [
                    /*{
                        tokenId: "Test",
                        pathName: "Square",
                        step: 0,
                        isReversing: false,

                        initialLeft: 0,
                        initialTop: 0,
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
            };
        }

        setupMacros();

        setInterval(pathTokens, state[NAME].storedVariables.interval);

        log(`${NAME} ${VERSION} by ${AUTHOR} Ready  Meta Offset : ${API_Meta.TokenController.offset}`);
        createMenu();
    });

    on("change:graphic", function (obj, prev) {
        if (obj.get("_subtype") == "token") {
            let tokenId = obj.get("_id");
            let tokenPath = state[NAME].storedVariables.activeTokenPaths.find(p => p.tokenId == tokenId);
            if (tokenPath) {
                state[NAME].storedVariables.activeTokenPaths.splice(state[NAME].storedVariables.activeTokenPaths.indexOf(tokenPath), 1);
            }
        }
    });

    on("chat:message", function (msg) {
        try {
            if (msg.type === "api" && msg.content.toLowerCase().startsWith("!token-control") || msg.content.toLowerCase().startsWith("!tc")) {

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
                                listPaths(args.length > 3 ? args[3] : undefined);
                                break;
                            case "tokens":
                                listTokens(args.length > 3 ? args[3] : undefined);
                                break;
                            case "tick":
                                listTick();
                                break;
                            case "vars":
                                listVars();
                                break;
                            case "draft":
                                listDrafts(args.length > 3 ? args[3] : undefined);
                                break;
                        }
                        break;

                    // Path Commands
                    case "add":
                        addPath(args[2], args[3]);
                        break;
                    case "set":
                        setPath(args[2], args[3]);
                        break;
                    case "remove":
                        removePath(args[2]);
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
                        startPath(msg.selected, args[2]);
                        break;
                    case "stop":
                        stopPaths(msg.selected, args.length >= 3 ? args[2] : undefined);
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

                }
            }
        } catch (err) {
            log(` ${NAME}  Error: ${err}<br/>${errorMessage}`);
            errorMessage = "";
        }
    });

    function pathTokens() {
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

                } else if (token.isFollowing) {
                    blockIds.push(token.tokenId);
                    let follower = getObj("graphic", token.tokenId);
                    let leader = getObj("graphic", token.followingTokenId);
                    if (follower && leader) {
                        follower.set({
                            "left": leader.get("left") + token.left,
                            "top": leader.get("top") + token.top,
                            "rotation": leader.get("rotation")
                        });
                    }
                }
            });
        }

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

            const pathCode = state[NAME].storedVariables.paths[pathIndex].path;

            const pathArray = pathCode.match(/([UDLR])([0-9])|W/g);
            if (!pathArray || pathArray.length < 1) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - No Vector Matches.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            const pathVector = pathArray[tokenPath.step];
            if (!pathVector) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - No Vectors present.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            const direction = pathVector.substring(0, 1);

            const distance = parseInt(pathVector.substring(1));
            if (isNaN(distance) && direction != "W") {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - distance not a number.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            if (!moveToken(tokenPath.tokenId, direction, distance, tokenPath.pageId)) {
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            if (tokenPath.isReversing) {
                if (tokenPath.step == 0) {
                    state[NAME].storedVariables.activeTokenPaths[i].isReversing = false;
                    state[NAME].storedVariables.activeTokenPaths[i].step++;
                } else {
                    state[NAME].storedVariables.activeTokenPaths[i].step--;
                }
            } else {
                if (tokenPath.step == pathArray.length - 1) {
                    if (state[NAME].storedVariables.paths[pathIndex].isCycle) {
                        state[NAME].storedVariables.activeTokenPaths[i].step = 0;
                    } else {
                        state[NAME].storedVariables.activeTokenPaths[i].isReversing = true;
                        state[NAME].storedVariables.activeTokenPaths[i].step--;
                    }
                } else {
                    state[NAME].storedVariables.activeTokenPaths[i].step++;
                }
            }
        }
    }

    function moveToken(tokenId, direction, distance, pageId) {
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
            default:
                sendChat(`${NAME}`, `/w GM Error: Path code ${pathCode} is invalid - Invalid direction.`);
                return false;
        }

        let token = getObj("graphic", tokenId);
        if (!token) {
            sendChat(`${NAME}`, `/w GM Error: Token ${tokenId} not found.`);
            return false;
        }

        if (distance == 0) {
            token.set("rotation", angle);
            return true;
        }

        const pageMeta = state[NAME].storedVariables.pageMetas.find(p => p.pageId == pageId);
        if (!pageMeta) {
            sendChat(`${NAME}`, `/w GM Error: Page ${pageId} not found. Please restart the path.`);
            return false;
        }

        if (angle === 0 || angle === 180) {
            const top = token.get("top") + (distance * 70 * (angle === 0 ? 1 : -1));
            if ((top + 70) > pageMeta.pageHeight || top < 0) {
                sendChat(`${NAME}`, `/w GM Error: Token ${tokenId} is out of bounds. Top: ${top + 70} (+70) > ${pageMeta.pageHeight}`);
                return true;
            }
            token.set({ "top": top, "rotation": angle });

        } else {
            const left = token.get("left") + (distance * 70 * (angle === 90 ? -1 : 1));
            if ((left + 70) > pageMeta.pageWidth || left < 0) {
                sendChat(`${NAME}`, `/w GM Error: Token ${tokenId} is out of bounds. Left: ${left + 70} (+70) > ${pageMeta.pageWidth}`);
                return true;
            }
            token.set({ "left": left, "rotation": angle });
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
        if (!usageHandout || usageHandout.length < 1 && gmPlayers.length > 0) {
            setupHandouts(gmPlayers[0]);
        } else if (usageHandout.length > 1) {
            for (let i = 1; i < usageHandout.length; i++) {
                usageHandout[i].remove();
            }
        }
    }

    function setupHandouts() {
        // Create Handout
        // Add usage to Handout
        // Tell user about Handout

        var handout = createObj('handout', {
            name: 'TokenController Usage Guide',
            inplayerjournals: 'all',
            archived: false
        });

        let content = new HtmlBuilder('div');
        content.append('.heading', 'Macros');
        content.append('.info', [
            'TokenController mostly functions via the Menu (!tc) and a few macros found on the Tokens and the DM Macro Bar.',
            'If not present, head over to Macros Tab and add them to your bars.',
            'Macros are always verified as existing on API restart, but not verified correct.',
            'You can delete any Macros with the "T-Cntrl_" prefix for rebuilding.',
        ].join('<br>'));

        content.append('.heading', 'Path Building');
        content.append('.info', [
            'Select a Token on any map and click the "T-Cntrl_Builder" Macro, filling in the Path Name Popup.',
            'The TokenController Menu now has Draft Paths with directional Buttons and "Units per Movement - Tick", as well as Set and Remove.',
            'You can unselect the Token used to start the Draft, but you must leave it on the map until your draft is Set as a Path.',
            'Clicking the U|D|L|R buttons, the Token will move in that direction the set amount of units in confirmation.',
            '* Paths are not map or start-position specific, but TokenController will take some Page measurements to try not to lose your token as it paths.',
        ].join('<br>'));

        content.append('.heading', 'Token Controls');
        content.append('.info', [
            'Once a Token is selected, you can set it on one or more Paths simultaneously, stacking the path shapes together for intricate patrolling.',
            '* Click Start, Stop or Reset on the Menu under Paths',
            '* To Stop a single path, use the Path Stop button. To stop all paths the Token is on, use the Token Stop button.',
            '* Clicking Path Stop without a Token selected will stop all Tokens on that Path.',
            '* Clicking Token Stop without a Token selected will stop all Tokens on all Paths.',

            'Tokens can be locked in place via the Menu, or set to follow another Token by clicking the Token\'s "T-Cntrl_Follow" Macro.',
            '* Tokens follow the Control Priority of: Locked > Follow > Path.',
            '* Unlocking a Token will stop it from following another Token.',
            '* Locking a Token will not remove its Paths, just prevent it from Pathing until unlocked.',
        ].join('<br>'));

        content.append('.heading', 'Settings');
        content.append('.info', [
            'Interval: Time (in milliseconds) between each movement tick.',
            '* Default is 5000ms (5 seconds)',
            '* Requires API restart to take effect (for now).',

            'Pixels Per Unit: How many pixels a Token moves per unit of movement, based on your maps current Grid Pixel Size (standard is 70).',
        ].join('<br>'));

        handout.set({
            notes: content.toString({
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
            }),
        })
    }

    function showUsage() {
        createMenu();
        sendChat(NAME, '/w gm ' + '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' + "See the Handout: <b>TokenController Usage Guide</b> for more information." + '</div>');
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

        state[NAME].storedVariables.paths[index].path = {
            name: name,
            path: pathString,
            isCycle: testCycle(pathString)
        };
        createMenu();
        sendChat(`${NAME}`, `/w GM Path "${name}" updated to ${pathString}.`);
    }

    function testCycle(pathString) {
        let workingString = pathString.replace("W", "");
        let pathArray = workingString.match(/([UDLR])(\d+)/g);

        let vert = 0;
        let horz = 0;

        for (let i = 0; i < pathArray.length; i++) {
            let direction = pathArray[i][0];
            let distance = parseInt(pathArray[i].substr(1));

            if (direction === "U") {
                vert += distance;
            } else if (direction === "D") {
                vert -= distance;
            } else if (direction === "L") {
                horz -= distance;
            } else if (direction === "R") {
                horz += distance;
            }
        }

        return vert === 0 && horz === 0;
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
        } else if (direction == "Remove") {
            state[NAME].storedVariables.pathDrafts.splice(state[NAME].storedVariables.pathDrafts.findIndex(p => p.name == name), 1);
            createMenu();
            return;
        }

        // Check for valid direction
        if (!/[UDLRW]/.test(direction)) {
            sendChat(`${NAME}`, `/w GM Invalid direction {${direction}}.`);
            return;
        }

        // Validate distance
        if (!!distance) {
            if (direction == "W") {
                sendChat(`${NAME}`, `/w GM "W" means "Wait", and should not have distance input.`);

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

        state[NAME].storedVariables.pathDrafts[draftIndex].path += direction == "W" ? "W" : `${direction}${distance}`;
        state[NAME].storedVariables.pathDrafts[draftIndex].step++;

        // Move Token for Visual Verification
        moveToken(state[NAME].storedVariables.pathDrafts[draftIndex].tokenId, direction, distance);

        // Update Step
        state[NAME].storedVariables.pathDrafts[draftIndex].step++;

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

            if (direction != "U" && direction != "D" && direction != "L" && direction != "R") {
                sendChat(`${NAME}`, "w/ GM Path must use U, D, L, or R for directions.");
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

            sendChat(`${NAME}`, `/w GM Path "${name}" is defined as "${paths[index].path}" (Cycle: ${paths[index].isCycle}). Current Tokens on Path:<br/> ${getTokensOnPath(name)}`);
        } else {
            sendChat(`${NAME}`, `/w GM Paths:<br/><table>${paths.map(path => `<tr><td style="margin-left: 5px">${path.name}</td><td>${path.path}</td><td>${path.isCycle}</td></tr>`).join("")}</table>`);
        }
    }

    function listTokens(name) {
        const tokens = state[NAME].storedVariables.activeTokenPaths;
        if (tokens.length == 0) {
            sendChat(`${NAME}`, "/w GM No Tokens are currently on a Path.");
            return;
        }

        if (name) {
            sendChat(`${NAME}`, `/w GM Tokens on Path "${name}":<br/> ${tokens.map(token => `<tr><td style="margin-left: 5px">-- ${getObj('graphic', token.tokenId).get('name')}</td><td>${token.pathName}</td></tr>`).join("")}`);
        } else {
            sendChat(`${NAME}`, `/w GM Tokens:<br/><table>${tokens.map(token => `<tr><td style="margin-left: 5px">-- ${getObj('graphic', token.tokenId).get('name')}</td><td>${token.pathName}</td></tr>`).join("")}</table>`);
        }
    }

    function listTick() {
        sendChat(`${NAME}`, `/w GM <br/>Tick: ${state[NAME].storedVariables.interval} ms`);
    }

    function listVars() {
        // find handout "TokenController Dashboard"
        let handout = findObjs({
            _type: "handout",
            name: "TokenController Dashboard",
        })[0];

        if (!handout) {
            handout = createObj("handout", {
                name: "TokenController Dashboard",
                inplayerjournals: "all",
                archived: false,
            });
        }

        let content = new HtmlBuilder('div');

        content.append('.menuLabel', 'Variables');
        content.append('.subLabel', 'Current variables live in script state.');

        // Create a table for Token Memory Variables
        let table = content.append('table', 'Token Memory');
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

        // Create a table for Paths
        table = content.append('table', 'Paths');
        row = table.append('tr'); // Headers
        row.append('td', 'Name');
        row.append('td', 'Path');
        row.append('td', 'Cycle');

        for (let i = 0; i < state[NAME].storedVariables.paths.length; i++) {
            const path = state[NAME].storedVariables.paths[i];
            row = table.append('tr');
            row.append('td', `${path.name}`);
            row.append('td', `${path.path}`);
            row.append('td', `${path.isCycle}`);
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

        // Create Config Table with Header { Interval, Units/Click, Pixel/Unit }
        table = content.append('table', 'Config');
        row = table.append('tr'); // Headers
        row.append('td', 'Interval');
        row.append('td', 'Units/Click');
        row.append('td', 'Pixel/Unit');

        row = table.append('tr');
        row.append('td', `${state[NAME].storedVariables.interval}`);
        row.append('td', `${state[NAME].storedVariables.unitPerClick}`);
        row.append('td', `${state[NAME].storedVariables.unitPx}`);

        handout.set('notes', content.toString(css));

        createMenu();
        sendChat(NAME, '/w gm ' + '<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">' + "Handout: <b>TokenController Dashboard</b> Updated!" + '</div>');
    }

    function listDrafts(name) {
        if (name != undefined && name != "") {
            const draftIndex = state[NAME].storedVariables.pathDrafts.findIndex(draft => draft.name == name);

            if (draftIndex > -1) {
                if (state[NAME].storedVariables.pathDrafts[draftIndex].tokenId == undefined || state[NAME].storedVariables.pathDrafts[draftIndex].tokenId == "") {
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

        if (!!state[NAME].storedVariables.activeTokenPaths && (state[NAME].storedVariables.activeTokenPaths.length == 0 || state[NAME].storedVariables.activeTokenPaths.filter(token => token.pathName == name).length == 0)) {
            return "None";
        }

        return state[NAME].storedVariables.activeTokenPaths.filter(token => token.pathName == name).map(token => `-- ${(getObj('graphic', token.tokenId)).get('name')}`).join("<br/>");
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

        const pathIndex = state[NAME].storedVariables.paths.findIndex(path => path.name == pathName);
        if (pathIndex == -1) {
            sendChat(`${NAME}`, "/w GM Path not found.");
            return;
        }

        if (state[NAME].storedVariables.paths[pathIndex].isCycle == undefined) {
            state[NAME].storedVariables.paths[pathIndex].isCycle = testCycle(state[NAME].storedVariables.paths[pathIndex].path);
        }

        selected.forEach(function (selected) {
            const token = getObj('graphic', selected._id);
            if (!token) {
                sendChat(`${NAME}`, "/w GM Please select a token to start a path.");
                return;
            }

            const tokenLeft = token.get('left');
            if (tokenLeft == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Token Left.");
                return;
            }

            const tokenTop = token.get('top');
            if (tokenTop == undefined) {
                sendChat(`${NAME}`, "/w GM Unable to retrieve Token Top.");
                return;
            }

            const pageId = token.get('_pageid');
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
                    pageWidth: pageWidth * 70,
                    pageHeight: pageHeight * 70,
                    pageScaleNumber: pageScale
                });
            } else if (state[NAME].storedVariables.pageMetas[pageMetaIndex].pageScaleNumber === undefined) {
                state[NAME].storedVariables.pageMetas[pageMetaIndex].pageWidth = pageWidth * 70;
                state[NAME].storedVariables.pageMetas[pageMetaIndex].pageHeight = pageHeight * 70;
                state[NAME].storedVariables.pageMetas[pageMetaIndex].pageScaleNumber = pageScale;
            }

            state[NAME].storedVariables.activeTokenPaths.push({
                tokenId: selected._id,
                pathName: pathName,
                step: 0,
                initialLeft: tokenLeft,
                initialTop: tokenTop,
                isReversing: false,
                pageId: pageId,
            });
        });

        createMenu();
        sendChat(`${NAME}`, `/w GM Tokens on Path "${pathName}" have started moving.`);
    }

    function stopPaths(selected, name) {
        if (state[NAME].storedVariables.activeTokenPaths.length == 0) {
            sendChat(`${NAME}`, "/w GM No Tokens are currently on a Path.");
            return;
        }

        if (name === undefined) {

            let stoppedReportText = "Stopped: { Token Name | Path Name }<br/>";
            if (!!selected && selected.length > 0) {
                for (let i = 0; i < selected.length; i++) {
                    const tokenId = selected[i]['_id'];
                    const index = state[NAME].storedVariables.activeTokenPaths.findIndex(token => token.tokenId == tokenId);
                    if (index == -1) {
                        sendChat(`${NAME}`, `/w GM Token "${tokenId}" is not currently on a Path.`);
                        return;
                    }

                    stoppedReportText += `-- ${getObj('graphic', tokenId).get('name')} | ${state[NAME].storedVariables.activeTokenPaths[index].pathName}<br/>`;
                    state[NAME].storedVariables.activeTokenPaths.splice(index, 1);

                    const memoryIndex = state[NAME].storedVariables.tokenMemory.findIndex(memory => memory.tokenId == tokenId);
                    if (memoryIndex > -1) {
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

        if (!!selected && selected.length > 0) {
            for (let i = 0; i < selected.length; i++) {
                const tokenId = selected[i]._id;
                const index = state[NAME].storedVariables.activeTokenPaths.findIndex(token => token.tokenId == tokenId && token.pathName == name);
                if (index == -1) {
                    sendChat(`${NAME}`, `/w GM Token "${tokenId}" is not currently on a Path.`);
                    return;
                }

                state[NAME].storedVariables.activeTokenPaths.splice(index, 1);
            }

            sendChat(`${NAME}`, `/w GM Tokens on Path "${name}" have stopped moving.`);
        } else {
            state[NAME].storedVariables.activeTokenPaths = state[NAME].storedVariables.activeTokenPaths.filter(token => token.pathName != name);
            sendChat(`${NAME}`, `/w GM Tokens on Path "${name}" have stopped moving.`);
        }
    }

    function lockTokens(selected) {
        if (!selected) {
            sendChat(`${NAME}`, "/w GM Please select a token to lock.");
            return;
        }

        selected.forEach(function (selected) {
            const token = getObj('graphic', selected._id);
            token.set('status_red', true);

            const index = state[NAME].storedVariables.tokenMemory.findIndex(token => token.tokenId == selected._id);
            if (index == -1) {
                state[NAME].storedVariables.tokenMemory.push({
                    tokenId: selected._id,
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
        });

        createMenu();
        sendChat(`${NAME}`, `/w GM Tokens have been locked.`);
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
        if (!followerId) {
            sendChat(`${NAME}`, "/w GM Please select a follower token.");
            return;
        }

        if (!leaderId) {
            sendChat(`${NAME}`, "/w GM Please select a leader token the target mechanism.");
            return;
        }

        // Add to Token Memory
        const followerToken = getObj('graphic', followerId);
        const leaderToken = getObj('graphic', leaderId);
        const followerIndex = state[NAME].storedVariables.tokenMemory.findIndex(token => token.tokenId == followerId);

        if (followerIndex == -1) {
            state[NAME].storedVariables.tokenMemory.push({
                tokenId: followerId,
                pageId: followerToken.get('_pageid'),
                rotation: followerToken.get('rotation'),
                left: /* Initial Left Difference of Follower and Leader */ followerToken.get('left') - leaderToken.get('left'),
                top: /* Initial Top Difference of Follower and Leader */ followerToken.get('top') - leaderToken.get('top'),
                followingTokenId: leaderId,
                isFollowing: true,
                isLocked: false
            });
        } else {
            state[NAME].storedVariables.tokenMemory[followerIndex].followingTokenId = leaderId;
            state[NAME].storedVariables.tokenMemory[followerIndex].isFollowing = true;

            if (state[NAME].storedVariables.tokenMemory[followerIndex].isLocked) {
                followerToken.set('status_red', false);
                state[NAME].storedVariables.tokenMemory[followerIndex].isLocked = false;
            }
        }

        createMenu();
        sendChat(`${NAME}`, `/w GM Token "${followerId}" is now following Token "${leaderId}".`);
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

    function resetTokens(name) {
        if (state[NAME].storedVariables.activeTokenPaths.length == 0) {
            sendChat(`${NAME}`, "/w GM No Tokens are currently on a Path.");
            return;
        }

        state[NAME].storedVariables.activeTokenPaths.filter(atp => atp.pathName == name).forEach(function (token) {
            const tokenObj = getObj('graphic', token.tokenId);
            tokenObj.set('left', token.initialLeft);
            tokenObj.set('top', token.initialTop);
        });

        createMenu();
        sendChat(`${NAME}`, "/w GM All Tokens have been reset.");
    }

    function createMenu() {
        let menu = new HtmlBuilder('.menu');
        menu.append('.menuHeader', 'Token Controls');

        let content = menu.append('div');
        content.append('.menuLabel', '[Usage](!tc usage)');
        content.append('.subLabel', '!tc may be used in place of !token-control');

        content.append('.menuLabel', '[List Vars](!tc list vars)');

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

        menu.append('.patreon', '[``Become a Patron``](https://www.patreon.com/bePatron?u=23167000)');

        sendChat(`${NAME}`, '/w GM ' + menu.toString(css));
    }

    const css = {
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
    };

    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.TokenController.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TokenController.offset); } }
