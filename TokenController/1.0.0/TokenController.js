/*
Token Control - A Roll20 Script to move tokens along scripted paths at a variable interval
* Commands:
*   !token-control - Displays the help text
*   !token-control Setup - Sets up the GM Macros for the script

*   !token-control List Paths [pathName] - Lists all paths [and Tokens on them]
*   !token-control List Tokens [tokenId] - Lists all tokens [on a Path]

*   !token-control Add <path_name> <path_code> - Adds a new path to the list of paths
*   !token-control Set <path_name> <path_code> - Sets the path code for a path
*   !token-control Remove <path_name> - Removes a path from the list of paths

*   !token-control Start <path_name> - Starts a path with a selected token, moving every second
*   !token-control Stop [path_name] - Stops all paths with a selected token [or all tokens on a path]

*   !token-control Tick <interval> - Sets the interval for the script to run at in milliseconds
        If interval is less than 100, the script will assume seconds and convert to milliseconds

* Upcomging Features:
*   Path Builder - Allows the GM to create paths with tokens and menu buttons
*   Path Auto-Facing - Automatically faces the token along the path, toggled on/off per path
*   Path Layer Swapping - "Hide" and "Show" tokens at various points of the path
*   Cleaner Pathing - Break long segments into smaller steps
*   Token Start Position Memory - Current design removes initial position from memory when path is stopped
*/

var API_Meta = API_Meta || {};
API_Meta.TokenController = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{ try { throw new Error(''); } catch (e) { API_Meta.TokenController.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6); } }

const TokenController = (() => {
    const NAME = 'TokenController';
    const VERSION = '1.0.0';
    // Version 2 will include the ability to build Paths from the menu
    const AUTHOR = 'Scott E. Schwarz';

    const __RESET__ = false;

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
        }

        if (state[NAME].storedVariables == undefined || __RESET__) {
            state[NAME].storedVariables = {
                paths: [
                    {
                        name: "Square",
                        path: "U2R2D2L2"
                    }, {
                        name: "Rectangle",
                        path: "U1R2D1L2"
                    }, {
                        name: "T",
                        path: "U3U0WWR2R0WWL4WWR2D3WW"
                    }],
                activeTokenPaths: [
                    /*{
                        tokenId: "Test",
                        pathName: "Square",
                        step: 0,

                        initialLeft: 0,
                        initialTop: 0,
                    },*/
                ],
                interval: 2000,
                hideCommands: true
            };
        }

        let menuMacro = getObj('macro', 'TokenController_Menu');
        if (!menuMacro) {
            const players = findObjs({ _type: 'player' });
            _.each(players, function (player) {
                const playerId = player.get('_id');
                if (playerIsGM(playerId)) {
                    createObj('macro', {
                        name: 'TokenController_Menu',
                        action: '!token-control',
                        playerid: playerId,
                        visibleto: playerId,
                    });
                }
            });
        }

        setInterval(pathTokens, state[NAME].storedVariables.interval);

        log(`${NAME} ${VERSION} by ${AUTHOR} Ready  Meta Offset : ${API_Meta.TokenController.offset}`);
        sendChat(`${NAME}`, "/w GM Version: " + state[NAME].schemaVersion + " ready.");
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
            if (!playerIsGM(msg.playerid)) {
                sendChat(`${NAME}`, "/w " + msg.who + " You do not have permission to use this command.");
                return;
            }
            if (msg.type === "api" && msg.content.toLowerCase().startsWith("!token-control") || msg.content.toLowerCase().startsWith("!tc")) {

                const args = msg.content.split(/\s+/);

                if (args.length == 1) {
                    createMenu();
                    return;
                }

                const command = args[1];

                switch (command.toLowerCase()) {
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
                        }
                        break;
                    case "add":
                        addPath(args[2], args[3]);
                        break;
                    case "set":
                        setPath(args[2], args[3]);
                        break;
                    case "remove":
                        removePath(args[2]);
                        break;
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
                    case "tick":
                        updateTick(args.length >= 3 ? args[2] : undefined);
                        break;
                    case "hide":
                        hideCommands();
                        break;
                    case "reset":
                        resetTokens();
                        break;
                }
            }
        } catch (err) {
            log(` ${NAME}  Error: ${err}`);
        }
    });

    function pathTokens() {
        for (let i = 0; i < state[NAME].storedVariables.activeTokenPaths.length; i++) {

            let tokenPath = state[NAME].storedVariables.activeTokenPaths[i];
            if (!tokenPath) {
                log(`${NAME}: Error: Token path not found.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            let path = state[NAME].storedVariables.paths.find(p => p.name == tokenPath.pathName);
            if (!path) {
                log(`${NAME}: Error: Path ${tokenPath.pathName} not found.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            let pathCode = path.path;
            let step = tokenPath.step;

            let token = getObj("graphic", tokenPath.tokenId);
            if (!token) {
                log(`${NAME}: Error: Token ${tokenPath.tokenId} not found.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            // RegEx Match Groups of the form (U|D|L|R)(1-9) or each (W)
            const pathArray = pathCode.match(/([UDLR])([0-9])|W/g);
            if (!pathArray || pathArray.length < 1) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - No Vector Matches.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            let pathVector = pathArray[step];
            if (!pathVector) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - No Vectors present.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            let direction = pathVector.substring(0, 1);
            let angle = 0;
            switch (direction.toUpperCase()) {
                case "U":
                    angle = 0;
                    break;
                case "D":
                    angle = 180;
                    break;
                case "L":
                    angle = 270;
                    break;
                case "R":
                    angle = 90;
                    break;
                case "W":
                    state[NAME].storedVariables.activeTokenPaths[i].step == pathArray.length - 1
                        ? state[NAME].storedVariables.activeTokenPaths[i].step = 0
                        : state[NAME].storedVariables.activeTokenPaths[i].step++;
                    continue;
                default:
                    log(`${NAME}: Error: Path code ${pathCode} is invalid - Invalid direction.`);
                    state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                    i--;
                    continue;
            }

            let distance = parseInt(pathVector.substring(1));
            if (isNaN(distance)) {
                log(`${NAME}: Error: Path code ${pathCode} is invalid - distance not a number.`);
                state[NAME].storedVariables.activeTokenPaths.splice(i, 1);
                i--;
                continue;
            }

            if (distance == 0) {
                token.set("rotation", angle);
                state[NAME].storedVariables.activeTokenPaths[i].step == pathArray.length - 1
                    ? state[NAME].storedVariables.activeTokenPaths[i].step = 0
                    : state[NAME].storedVariables.activeTokenPaths[i].step++;
                continue;
            }

            token.set(angle === 0 || angle === 180
                ? { "top": token.get("top") + (distance * 70 * (angle === 0 ? -1 : 1)) }
                : { "left": token.get("left") + (distance * 70 * (angle === 90 ? 1 : -1)) }
            );

            state[NAME].storedVariables.activeTokenPaths[i].step == pathArray.length - 1
                ? state[NAME].storedVariables.activeTokenPaths[i].step = 0
                : state[NAME].storedVariables.activeTokenPaths[i].step++;
        }
    }

    function setupMacros() { }

    function addPath(name, pathString) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        if (!validatePathString(pathString)) {
            return;
        }

        state[NAME].storedVariables.paths.push({ name: name, path: pathString });
        sendChat(`${NAME}`, `/w GM Path "${name}" added.`);
    }

    function setPath(name, pathString) {
        if (!validatePathString(pathString)) {
            return;
        }

        const index = getPathIndexByName(name);
        if (index == -1) {
            return;
        }

        state[NAME].storedVariables.paths[index].path = { name: name, path: pathString };
    }

    function removePath(name) {
        const index = getPathIndexByName(name);
        if (index == -1) {
            return;
        }

        state[NAME].storedVariables.paths.splice(index, 1);
        sendChat(`${NAME}`, `/w GM Path "${name}" removed.`);
    }

    function getPathIndexByName(name) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        const index = state[NAME].storedVariables.paths.findIndex(path => path.name == name);
        if (index == -1) {
            sendChat(`${NAME}`, `/w GM Path "${name}" not found.`);
            return;
        }

        return index;
    }

    function validatePathString(pathString) {
        if (!pathString) {
            sendChat(`${NAME}`, "/w GM Please specify a path code for the path.");
            return;
        }

        if (pathString.length < 4) {
            sendChat(`${NAME}`, "/w GM Path must be at least 2 Vectors (ie. U1D1) long.");
            return;
        }

        try {
            const pathArray = pathString.match(/([UDLR])(\d+)/g);
        } catch (err) {
            sendChat(`${NAME}`, "/w GM Path must be a valid path code (ie. U1R1L1D1).");
            return;
        }

        for (let i = 0; i < pathArray.length; i++) {
            const vector = pathArray[i];
            const direction = vector.charAt(0);
            const distance = parseInt(vector.substring(1), 10);

            if (distance < 1) {
                sendChat(`${NAME}`, "/w GM Path must have at least 1 unit of distance.");
                return;
            }

            if (direction != "U" && direction != "D" && direction != "L" && direction != "R") {
                sendChat(`${NAME}`, "w/ GM Path must use U, D, L, or R for directions.");
                return;
            }
        }
    }

    function listPaths(name) {
        const paths = state[NAME].storedVariables.paths;
        if (name) {
            const index = getPathIndexByName(name);
            if (index == -1) {
                return;
            }

            sendChat(`${NAME}`, `/w GM Path "${name}" is defined as "${paths[index].path}". Current Tokens on Path:<br/> ${getTokensOnPath(name)}`);
        } else {
            sendChat(`${NAME}`, `/w GM Paths:<br/><table>${paths.map(path => `<tr><td style="margin-left: 5px">${path.name}</td><td>${path.path}</td></tr>`).join("")}</table>`);
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

    function getTokensOnPath(name) {
        if (!name) {
            sendChat(`${NAME}`, "/w GM Please specify a name for the path.");
            return;
        }

        log(state[NAME]);

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

        selected.forEach(function (selected) {
            const token = getObj('graphic', selected._id);
            state[NAME].storedVariables.activeTokenPaths.push({
                tokenId: selected._id,
                pathName: pathName,
                step: 0,
                initialLeft: token.get('left'),
                initialTop: token.get('top'),
            });
        });

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
                }
            } else {
                state[NAME].storedVariables.activeTokenPaths = [];
                stoppedReportText = "All Tokens have stopped moving.";
            }

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

    function updateTick(interval) {
        const intervalNumber = parseInt(interval, 10);
        if (isNaN(intervalNumber)) {
            sendChat(`${NAME}`, "/w GM Please specify a valid interval.");
            return;
        }

        state[NAME].storedVariables.tickInterval = Math.round(intervalNumber < 100 ? intervalNumber * 1000 : intervalNumber);
        sendChat(`${NAME}`, `/w GM Tick interval set to ${state[NAME].storedVariables.tickInterval} milliseconds.`);
    }

    function resetTokens() {
        if (state[NAME].storedVariables.activeTokenPaths.length == 0) {
            sendChat(`${NAME}`, "/w GM No Tokens are currently on a Path.");
            return;
        }

        state[NAME].storedVariables.activeTokenPaths.forEach(function (token) {
            const tokenObj = getObj('graphic', token.tokenId);
            tokenObj.set('left', token.initialLeft);
            tokenObj.set('top', token.initialTop);
        });

        sendChat(`${NAME}`, "/w GM All Tokens have been reset.");
    }

    function createMenu() {
        const controls = state[NAME].storedVariables.hideCommands ? [] : [
            "!token-control Setup",
            "- Sets up the GM Macros for the script",
            "!token-control List Paths ", "- Lists all paths",
            "!token-control List Paths [pathName]", "- Lists all tokens on a path",
            "!token-control List Tokens ", "- Lists all tokens on a path",
            "!token-control Add <path_name> <path_code>", "- Adds a new path to the list of paths",
            "!token-control Set <path_name> <path_code>", "- Sets the path code for a path",
            "!token-control Remove <path_name>", "- Removes a path from the list of paths",
            "!token-control Start <path_name>", "- Starts a path with a selected token, moving every second",
            "!token-control Stop <path_name>",
            "- Stops a path with a selected token",
            "!token-control Stop All",
            "- Stops all paths with a selected token",
            "!token-control Tick <interval>",
            "- Sets the interval between ticks in milliseconds",
            "- Default is 2000 milliseconds (2 second)",
            "- Intervals less than 100 are assumed to be in seconds and will be converted to milliseconds"
        ];

        let menu = new HtmlBuilder('.menu');
        menu.append('.menuHeader', 'Token Controls');

        let content = menu.append('div');
        content.append('.menuLabel', '[Commands](!tc hide)');
        content.append('.subLabel', '!tc may be used in place of !token-control');
        content.append('p', controls.join('<br/>'));

        content.append('.menuLabel', 'Paths');
        content.append('.subLabel', 'Select one or more tokens to start a path');
        let table = content.append('table');

        for (let i = 0; i < state[NAME].storedVariables.paths.length; i++) {
            const path = state[NAME].storedVariables.paths[i];

            let row = table.append('tr', undefined, { title: path.name });

            row.append('td', `[${path.name}](!tc List Paths ${path.name})`);
            row.append('td', `[\`\`Start\`\`](!tc Start ${path.name})`);
            row.append('td', `[\`\`Stop\`\`](!tc Stop ${path.name})`);
        }

        content.append('.menuLabel', 'Token');
        content.append('.subLabel', 'Select one or more tokens to stop a path');
        table = content.append('table');
        let row = table.append('tr');
        row.append('td', `[\`\`Stop\`\`](!tc Stop)`);
        row.append('td', `[\`\`Reset\`\`](!tc Reset)`);

        content.append('.menuLabel', 'Interval');
        table = content.append('table');
        row = table.append('tr');
        row.append('td', `[Tick](!tc List Tick)`);
        row.append('td', `[\`\`UP\`\`](!tc Tick ${state[NAME].storedVariables.tickInterval + 100})`);
        row.append('td', `[\`\`DOWN\`\`](!tc Tick ${state[NAME].storedVariables.tickInterval - 100})`);

        menu.append('.patreon', '[``Become a Patron``](https://www.patreon.com/bePatron?u=23167000)');

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
            },
            'menuHeader': {
                'background': '#000',
                'color': '#fff',
                'text-align': 'center'
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

    function hideCommands() {
        state[NAME].storedVariables.hideCommands = !state[NAME].storedVariables.hideCommands;
        createMenu();
    }

    return {};
})();

{ try { throw new Error(''); } catch (e) { API_Meta.TokenController.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.TokenController.offset); } }
