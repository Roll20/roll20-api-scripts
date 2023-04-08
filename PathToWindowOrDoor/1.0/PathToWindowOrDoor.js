var PathToWindowOrDoor = PathToWindowOrDoor || (function () {
    let scriptStart = new Error;//Generates an error to localize the start of the script
    //converts the line number in the error to be line 1
    scriptStart = scriptStart.stack.match(/apiscript\.js:(\d+)/)[1] * 1;
    'use strict';
    //Script variables that are updated/changed at some point in the script.
    let helpCharacter,
        helpLink,
        markdown = false,//enables/disables logging of markdown version of the help text. Used for easy updating of the script.json file
        defaultTokenImage = 'https://s3.amazonaws.com/files.d20.io/images/318725118/1xTPO0_1SyEC6Qikbx4XaQ/max.png?1671160093';

    /*
    PathToWindowOrDoor script:
    Author: Sylvain "Groch" CLIQUOT
    Contact: https://app.roll20.net/users/3137159/groch
    Thanks to: Scott C.h which this file is based on his Door Knocker work
    Credits: https://app.roll20.net/users/459831/scott-c
    state.PathToWindowOrDoor format:
    state.PathToWindowOrDoor = {
        version:#.###,
        doorColor:#000000,
        unlockedColor:#000000,
        hiddenColor:#000000
        windowColor:#000000,
    }

    Script Scope:
    Primary goal(s)
    - Convert path to windows
    - Convert path to doors
    Secondary goal(s)
    - TBD
    Possible stretch goal(s)
    */

    //Script Constants
    const version = 1.0,
        lastUpdate = 1671161263,
        defaults = {
            css: {
                button: {
                    'border': '0px',
                    'border-radius': '1em',
                    'background-color': '#006dcc',
                    'margin': '0 .1em',
                    'font-weight': 'bold',
                    'padding': '0.1em .5em',
                    'color': 'white'
                }
            }
        },
        templates = {},
        debug = 0,

        //Functions called from other functions
        //Cleans the image link for use within Roll20 Objects
        cleanImgSrc = function (img) {
            var parts = img.match(/(.*\/images\/.*)(thumb|med|original|max)(.*)$/);
            if (parts) {
                return parts[1] + 'thumb' + parts[3];
            }
            return;
        },
        //Problem Character replacement
        esRE = function (s) {
            var escapeForRegexp = /(\\|\/|\[|\]|\(|\)|\{|\}|\?|\+|\*|\||\.|\^|\$)/g;
            return s.replace(escapeForRegexp, "\\$1");
        },

        HE = (function () {
            var entities = {
                //' ' : '&'+'nbsp'+';',
                '&': '&' + 'amp' + ';',
                '<': '&' + 'lt' + ';',
                '>': '&' + 'gt' + ';',
                "'": '&' + '#39' + ';',
                '@': '&' + '#64' + ';',
                //'{' : '&'+'#123'+';',
                '|': '&' + '#124' + ';',
                '}': '&' + '#125' + ';',
                ',': '&' + '#44' + ';',
                '[': '&' + '#91' + ';',
                ']': '&' + '#93' + ';',
                '"': '&' + 'quot' + ';',
                ':': '&' + '#58' + ';',
                //'-' : '&'+'mdash'+';'
            },
                re = new RegExp('(' + _.map(_.keys(entities), esRE).join('|') + ')', 'g');
            return function (s) {
                return s.replace(re, function (c) { return entities[c] || c; });
            };
        }()),
        //Error reporting function
        sendError = function (err) {
            var stackMatch = err.stack.match(/apiscript\.js:\d+/g);
            _.each(stackMatch, (s) => {
                let sMatch = s.match(/\d+/)[0] * 1;
                err.stack = err.stack.replace(new RegExp('apiscript\.js:' + sMatch), 'apiscript.js:' + (sMatch - scriptStart + 1));
            });
            var stackToSend = err.stack ? (err.stack.match(/([^\n]+\n[^\n]+)/) ? err.stack.match(/([^\n]+\n[^\n]+)/)[1].replace(/\n/g, '<br>') : 'Unable to parse error') : 'Unable to parse error';
            sendChat('PathToWindowOrDoor Error Handling', '/w gm <div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'//overall div for nice formatting of control panel
                + '<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'//Control Panel Header div
                + 'PathToWindowOrDoor v' + version + '<b> Error Handling</b></div>'
                + '<div style="border-top: 1px solid #000000; border-radius: .2em; background-color: white;">'
                + 'The following error occurred:<br><pre><div style="color:red"><b>' + err.message + '<br>' + stackToSend + '</b></div></pre>Please post this error report to the <b><u>[Script forum thread](https://app.roll20.net/forum/permalink/9919591/)</u></b>.'
                + '</div>'
                + '</div>');
        },

        checkInstall = function () {
            try {
                log(`-=> PathToWindowOrDoor v${version} <=-  [${(new Date(lastUpdate * 1000))}]`);
                if (!_.has(state, 'PathToWindowOrDoor')) {
                    initialInstall();
                } else if (state.PathToWindowOrDoor.version !== version) {
                    if (state.PathToWindowOrDoor.version !== version) {
                        log(`  > PathToWindowOrDoor: Updating to v${version} <`);
                        updateScript();
                        log(`  > PathToWindowOrDoor: Update Complete <`);
                        state.PathToWindowOrDoor.version = version;
                    }
                }
                buildTemplates();
                updateHelp();
                helpLink = `https://journal.roll20.net/character/${state.PathToWindowOrDoor.help}`;
            } catch (err) {
                sendError(err);
            }
        },

        //Begin update functions
        updateScript = function () {
        },

        initialInstall = function () {
            state.PathToWindowOrDoor = state.PathToWindowOrDoor || {
                hiddenColor: '#00ff00',
                doorColor: '#ff9900',
                unlockedColor: '#ffff00',
                windowColor: '#00ffff',
            };
            log(`  > PathToWindowOrDoor: v${version} initial install complete <`);
        },
        //End Update functions

        /*Builds templates for use in all other functions*/
        buildTemplates = function () {
            templates.cssProperty = _.template(
                '<%=name %>: <%=value %>;'
            );

            templates.style = _.template(
                'style="<%=' +
                '_.map(css,function(v,k) {' +
                'return templates.cssProperty({' +
                'defaults: defaults,' +
                'templates: templates,' +
                'name:k,' +
                'value:v' +
                '});' +
                '}).join("")' +
                ' %>"'
            );

            templates.button = _.template(
                '<a title="<%=title %>"<%= templates.style({' +
                'defaults: defaults,' +
                'templates: templates,' +
                'css: _.defaults(css,defaults.css.button)' +
                '}) %> href="<%= command %>"><%= label||"Button" %></a>'
            );
        },

        /*Makes the API buttons used throughout the script*/
        makeButton = function (command, label, backgroundColor, color, title, font) {
            let obj = {
                title: title,
                command: command,
                label: label,
                templates: templates,
                defaults: defaults,
                css: {
                    color: color,
                    'background-color': backgroundColor,
                    'font-family': font
                }
            };
            return templates.button(obj);
        },
        //convert hex color to rgb for calculations
        hexToRgb = hex => {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
            // turn hex val to RGB
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result
                ? {
                    r: parseInt(result[1], 16),
                    g: parseInt(result[2], 16),
                    b: parseInt(result[3], 16)
                }
                : { r: 1, g: 1, b: 1 }
        },
        hexToRgbString = hex => `rgb(${Object.values(hexToRgb(hex)).join(', ')})`,
        // calc to work out if it will match on black or white better
        setContrast = rgb => (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000 > 125 ? 'black' : 'white',

        updateHelpCharacterProperties = function () {
            helpCharacter = findObjs({ type: 'character', name: 'PathToWindowOrDoor UI' })[0];
            if (!state.PathToWindowOrDoor.help || !getObj('character', state.PathToWindowOrDoor.help)) {
                if (helpCharacter) {
                    state.PathToWindowOrDoor.help = helpCharacter.id;
                } else {
                    helpCharacter = createObj('character', {
                        name: 'PathToWindowOrDoor UI'
                    });
                    state.PathToWindowOrDoor.help = helpCharacter.id;
                }
                helpCharacter.set({ avatar: cleanImgSrc(defaultTokenImage) });
            } else {
                helpCharacter = getObj('character', state.PathToWindowOrDoor.help);
            }
            let abilities = findObjs({ type: 'ability', characterid: state.PathToWindowOrDoor.help });
            let expectedAbilities = {},
                abilityTemplates = {
                    convertWindows: {},
                    convertWindowsHere: { action: '!ptwod --convertWindows|page' },
                    convertDoors: {},
                    convertDoorsHere: { action: '!ptwod --convertDoors|page' }
                };
            Object.keys(abilityTemplates).forEach((key, index) => {
                expectedAbilities[key] = false;
                abilityTemplates[key]['name'] = key;
                abilityTemplates[key]['description'] = `PathToWindowOrDoor Ability:${key}`;
                if (!abilityTemplates[key]['action']) abilityTemplates[key]['action'] = `!ptwod --${key}`;
                abilityTemplates[key]['characterid'] = state.PathToWindowOrDoor.help;
                abilityTemplates[key]['istokenaction'] = true;
            });
            _.each(abilities, (abi) => {
                abi.get('description').replace(/^PathToWindowOrDoor Ability:(.+)/, (match, keyword) => {
                    expectedAbilities[keyword] = true;
                });
            });
            _.each(_.keys(expectedAbilities), (key) => {
                if (!expectedAbilities[key]) {
                    createObj('ability', abilityTemplates[key]);
                }
            });
            helpCharacter.get('defaulttoken', (token) => {
                if (!token || token === 'null') {
                    let newToken = createObj('graphic', {
                        _pageid: Campaign().get('playerpageid'),
                        imgsrc: cleanImgSrc(defaultTokenImage),
                        name: 'PathToWindowOrDoor',
                        represents: helpCharacter.id,
                        top: 0,
                        left: 0,
                        width: 70,
                        height: 70,
                        isdrawing: true,
                        layer: 'walls'
                    });
                    setDefaultTokenForCharacter(helpCharacter, newToken);
                    newToken.remove();
                }
            });
        },

        /*
         * build list of roll20 object that could be valid interactible base
         */
        getWindowList = function (pageId) {
            let paths, finalList = [];
            if (pageId) {
                paths = [
                    ...findObjs({ type: 'path', pageid: pageId, stroke: state.PathToWindowOrDoor[`windowColor`], layer: 'walls' }),
                    ...findObjs({ type: 'path', pageid: pageId, stroke: hexToRgbString(state.PathToWindowOrDoor[`windowColor`]), layer: 'walls' }),
                    ...findObjs({ type: 'path', pageid: pageId, stroke: `${state.PathToWindowOrDoor[`windowColor`]}00`, layer: 'map' })];
            } else {
                paths = [
                    ...findObjs({ type: 'path', stroke: state.PathToWindowOrDoor[`windowColor`], layer: 'walls' }),
                    ...findObjs({ type: 'path', stroke: hexToRgbString(state.PathToWindowOrDoor[`windowColor`]), layer: 'walls' }),
                    ...findObjs({ type: 'path', stroke: `${state.PathToWindowOrDoor[`windowColor`]}00`, layer: 'map' })];
            }
            forgeAndPushInteractibleToListByType(finalList, paths, 'window');
            return finalList;
        },

        getFinalDoorList = function (pageId) {
            let paths, finalList = [];
            ['door', 'unlocked', 'hidden'].forEach((type) => {
                if (pageId) {
                    paths = [
                        ...findObjs({ type: 'path', pageid: pageId, stroke: state.PathToWindowOrDoor[`${type}Color`], layer: 'walls' }),
                        ...findObjs({ type: 'path', pageid: pageId, stroke: hexToRgbString(state.PathToWindowOrDoor[`${type}Color`]), layer: 'walls' }),
                        ...findObjs({ type: 'path', pageid: pageId, stroke: `${state.PathToWindowOrDoor[`${type}Color`]}00`, layer: 'map' })];
                } else {
                    paths = [
                        ...findObjs({ type: 'path', stroke: state.PathToWindowOrDoor[`${type}Color`], layer: 'walls' }),
                        ...findObjs({ type: 'path', stroke: hexToRgbString(state.PathToWindowOrDoor[`${type}Color`]), layer: 'walls' }),
                        ...findObjs({ type: 'path', stroke: `${state.PathToWindowOrDoor[`${type}Color`]}00`, layer: 'map' })];
                }
                forgeAndPushInteractibleToListByType(finalList, paths, type);
            });
            return finalList;
        },

        forgeAndPushInteractibleToListByType = function (list, paths, type) {
            if (debug) log(`paths.length=${paths.length}`);
            for (const path of paths) {
                if (debug) log(`pageid=${path.get('_pageid')}, name=${getObj('page', path.get('_pageid')).get('name')}`);
                if (debug) log(`top=${path.get('top')}, left=${path.get('left')}, width=${path.get('width')}, height=${path.get('height')}`);
                if (JSON.parse(path.get('_path')).length === 2) {
                    const subPath = JSON.parse(path.get('_path'));
                    const xoffset = (Number(path.get('width')) / 2) * Number(path.get('scaleX'));
                    const yoffset = (Number(path.get('height')) / 2) * Number(path.get('scaleY'));
                    const pageid = path.get('_pageid');
                    const x = Number(path.get('left'));
                    const y = (-1 * Number(path.get('top')));
                    const x0 = Number(subPath[0][1]) * Number(path.get('scaleX')) - xoffset;
                    const y0 = (-1 * Number(subPath[0][2]) * Number(path.get('scaleY'))) + yoffset;
                    const x1 = Number(subPath[1][1]) * Number(path.get('scaleX')) - xoffset;
                    const y1 = (-1 * Number(subPath[1][2]) * Number(path.get('scaleY'))) + yoffset;
                    let found;
                    if ((found = list.find(i => i.pageid === pageid &&
                        i.x === x && i.y === y &&
                        i.handle0.x === x0 && i.handle0.y === y0 &&
                        i.handle1.x === x1 && i.handle1.y === y1))) {
                        found.pathLinked.push(path);
                    } else {
                        list.push({
                            type: type,
                            pageid: pageid,
                            x: x,
                            y: y,
                            handle0: { x: x0, y: y0 },
                            handle1: { x: x1, y: y1 },
                            pathLinked: [path],
                            pathRemoved: 0,
                            color: state.PathToWindowOrDoor[`${type}Color`]
                        })
                    }
                }
            }
        },

        /*
         * promises used to chain all the create actions
         */
        convertInteractiblePathProm = function (interactible, doorOrWindow) {
            return new Promise(resolve => {
                if (doorOrWindow === 'window')  convertWindowTemplateToWindow(interactible)
                else                            convertDoorTemplateToDoor(interactible);
                for (const path of interactible.pathLinked) {
                    path.remove();
                    interactible.pathRemoved++;
                }
                resolve();
            });
        },

        waitProm = function () { return new Promise(r => setTimeout(r, 100)); },

        callDeleteProm = function (finalDoorList) {
            return new Promise(resolve => {
                let deletedCount = 0;
                for (const door of finalDoorList) {
                    deletedCount += door.pathRemoved;
                }
                sendChat('PathToWindowOrDoor', `/w gm PathToWindowOrDoor removed ${deletedCount} paths`);
                resolve();
            });
        },

        /**
         * Core function called by convertAllDoors & convertAllWindows
         */
        convertChain = function (finalDoorList, doorOrWindow = 'door') {
            if (debug) log(`!! convertChain !! doorOrWindow=${doorOrWindow}`);
            let convertedCount = 0;
            let chain = Promise.resolve();
            for (const door of finalDoorList) {
                chain = chain.then(() => convertInteractiblePathProm(door, doorOrWindow))
                    .then(waitProm);
                convertedCount++;
            }
            sendChat('PathToWindowOrDoor', `/w gm PathToWindowOrDoor converted ${convertedCount} ${doorOrWindow}${convertedCount > 1 ? 's' : ''}`);
            return chain.then(() => callDeleteProm(finalDoorList));
        },

        /**
         * convert functions that take an interactibleTemplate generated by forgeAndPushInteractibleToListByType
         * and generate a roll20 object from it
         */
        convertWindowTemplateToWindow = function (windowTemplate) {
            if (debug) log(`pageid=${windowTemplate.pageid}, name=${getObj('page', windowTemplate.pageid).get('name')}, x=${windowTemplate.x}, y=${windowTemplate.y}`);
            const finalParams = {
                ...getInteractibleBase(windowTemplate),
                isLocked: true
            };
            if (debug === 2) log(`convertWindowTemplateToWindow finalParams=${JSON.stringify(finalParams)}`);
            createObj('window', finalParams);
        },

        convertDoorTemplateToDoor = function (doorTemplate) {
            if (debug) log(`pageid=${doorTemplate.pageid}, name=${getObj('page', doorTemplate.pageid).get('name')}, x=${doorTemplate.x}, y=${doorTemplate.y}`);
            const finalParams = {
                ...getInteractibleBase(doorTemplate),
                isOpen: false,
                isLocked: ['door', 'hidden'].includes(doorTemplate.type),
                isSecret: doorTemplate.type === 'hidden'
            };
            if (debug === 2) log(`convertDoorTemplateToDoor finalParams=${JSON.stringify(finalParams)}`);
            createObj('door', finalParams);
        },

        getInteractibleBase = function (interactible) {
            if (debug) log(`pageid=${interactible.pageid}, name=${getObj('page', interactible.pageid).get('name')}, x=${interactible.x}, y=${interactible.y}`);
            return {
                x: interactible.x,
                y: interactible.y,
                pageid: interactible.pageid,
                path: {
                    handle0: {
                        x: interactible.handle0.x,
                        y: interactible.handle0.y
                    },
                    handle1: {
                        x: interactible.handle1.x,
                        y: interactible.handle1.y
                    }
                },
                color: interactible.color
            };
        },

        /**
         * small helpers
         */
        getPlayerPage = function (playerId) {
            const pages = Campaign().get("playerspecificpages"),
                theGM = findObjs({ type: 'player' }).find(o => playerIsGM(o.id));
            if (playerId === theGM.get('_id'))
                return theGM.get('_lastpage');
            return (pages && (playerId in pages)) ? pages[playerId] : Campaign().get("playerpageid");
        },

        /**
         * functions called from HandleInput
         * Updates the help UI to reflect changes in settings and new menu templates
         */
        convertAllDoors = function (playerId, selected, ...other) {
            log(`!! convertAllDoors !! other=${JSON.stringify(other)}`);
            const finalList = getFinalDoorList(other.includes('page') ? getPlayerPage(playerId) : undefined);
            convertChain(finalList);
        },

        convertAllWindows = function (playerId, selected, ...other) {
            log(`!! convertAllWindows !! other=${JSON.stringify(other)}`);
            const finalList = getWindowList(other.includes('page') ? getPlayerPage(playerId) : undefined);
            convertChain(finalList, 'window');
        },

        updateHelp = function (playerid, selection, cmd) {
            if (debug) log(`ptwod updateHelp 1`);
            if (!cmd) {
                updateHelpCharacterProperties();
            }
            if (debug) log(`ptwod updateHelp 2`);
            const cmdSwitch = {},
                leftColumnCSS = `"display:inline-block;width:45%;padding-right:5px;border-right:1px solid black;"`,
                rightColumnCSS = `"display:inline-block;width:45%;padding-left:5px;border-left:1px solid black;"`,
                thCSS = `border:0px;text-align:center;padding:4px 0px;`,
                tableCSS = `border:0px;`,
                outertdCSS = `border:0px; width:50%;padding:0em 0em 0em 1em;`,
                selectedCSS = `background-color:#dee0e2;`,
                helpText = {
                    home: `
          <p>
              Welcome to PathToWindowOrDoor. This script helps quickly convert 2 point line paths to the new windows or doors
          </p>
          <h3>Using PathToWindowOrDoor</h3>
          <p>
              This script is only meant to be used by the GM, only the help will be returned to other players.<br/>
              This script will convert all single-segment paths on dynamic lighting & map layer (on a page or across the entire game)
              that match a specific color into either windows or doors, depending on the chosen command.<br/>
              For example: If the setting for hidden doors is the color green (#00ff00),
              then all single-segment green paths will be converted to a hidden door.<br/><br/>

              <b><u>You can configure the color relationship in the Bio tab of a character created by the script.</u></b>
          </p>
          <p>
              <h4>BEWARE</h4>
              This script won't ask for confirmation, it will convert all single-segment paths on DL & map layer which color correspond to configuration, if you want to limit scope, be sure to read next section.
          </p>
          <p><b>Default configuration :</b></p>
          <p><ul>
              <li>Hidden Doors: #00ff00</li>
              <li>Locked Doors: #ff9900</li>
              <li>Unlocked Doors: #ffff00</li>
              <li>Windows: #00ffff</li>
          </ul></p>
          <h3>Basic Command Syntax</h3>
          <p>
              The script uses a standardized API command syntax. All PathToWindowOrDoor commands will begin with <b>!ptwod</b>. This will then be followed
              by a space a double dash preceding a keyword and options group. This looks like this:
          </p>
          <p>
              <b>!ptwod --keyWord|option1|option2|...</b>
          </p>
          <p>
              For example: By default you will convert on the current page all single-segment green, yellow and orange paths to the new doors
              by using the command <code style="white-space: nowrap">!ptwod --convertDoors|page</code><br/>
              If the <code style="white-space: nowrap">"|page"</code> flag is omitted, then the script will convert all matching paths across the entire game
          </p>
          <hr/>
          <h3>Converting Windows</h3>
          <p>
              Convert windows using the <code style="white-space: nowrap">!ptwod --convertWindows</code> 
              or <code style="white-space: nowrap">!ptwod --convertWindows|page</code> commands
              <h4>Configured Windows segments converted as :</h4>
              <ul><li>Windows color => Roll20 Windows Locked by default</li></ul>
          </p>
          <h3>Converting Doors</h3>
          <p>
              Convert doors using the <code style="white-space: nowrap">!ptwod --convertDoors</code> 
              or <code style="white-space: nowrap">!ptwod --convertDoors|page</code> commands
              <h4>Configured Doors segments converted as :</h4>
              <ul>
                <li>Hidden color => Roll20 Secret doors Locked by default</li>
                <li>Locked color => Roll20 Locked doors</li>
                <li>Unlocked color => Normal Roll20 doors</li>
              </ul>
              <b>All doors are closed by default</b>
          </p>
          <hr/>
          <h3>Special Thanks</h3>
          <p>
              Thanks to Scott C.h, this script is started from his DoorKnocker work which i stripped and adapted to fit my needs and learn a things or two.
          </p>`,
                    settings: `<div>
              <h3>Script Configurations</h3>
                  <h4><br>Color Relationships:</h4>
                  <b>Hidden Doors:</b>${makeButton(`!ptwod --preset|hidden|?{What Color are your Walls|${state.PathToWindowOrDoor.hiddenColor || '#000000'}}`, (state.PathToWindowOrDoor.hiddenColor || '#000000'), (state.PathToWindowOrDoor.hiddenColor || '#000000'), setContrast(hexToRgb((state.PathToWindowOrDoor.hiddenColor || '#000000'))), 'Enter the hex color of your hidden doors')}<br>
                  <b>Locked Doors:</b>${makeButton(`!ptwod --preset|door|?{What Color are your Doors|${state.PathToWindowOrDoor.doorColor}}`, state.PathToWindowOrDoor.doorColor, state.PathToWindowOrDoor.doorColor, setContrast(hexToRgb(state.PathToWindowOrDoor.doorColor)), 'Enter the hex color of your locked doors')}<br>
                  <b>Unlocked Doors:</b>${makeButton(`!ptwod --preset|unlocked|?{What Color are your unlocked Doors|${state.PathToWindowOrDoor.unlockedColor}}`, state.PathToWindowOrDoor.unlockedColor, state.PathToWindowOrDoor.unlockedColor, setContrast(hexToRgb(state.PathToWindowOrDoor.unlockedColor)), 'Enter the hex color of your unlocked doors')}<br>
                  <b>Windows:</b>${makeButton(`!ptwod --preset|window|?{What Color are your Windows|${state.PathToWindowOrDoor.windowColor}}`, state.PathToWindowOrDoor.windowColor, state.PathToWindowOrDoor.windowColor, setContrast(hexToRgb(state.PathToWindowOrDoor.windowColor)), 'Enter the hex color of your windows')}
                  </div>`
                },
                coloring = {
                    'false': ['white', 'black'],
                    'true': ['black', 'white']
                };
            if (debug) log(`ptwod updateHelp 3`);
            if (!cmd) cmd = state.PathToWindowOrDoor.cmd || 'home';
            let navigation =
                `${makeButton(`!ptwod --menu|home`, 'Instructions', ...coloring[`${/home/i.test(cmd)}`], 'Learn how to use the script')}` +
                `${makeButton(`!ptwod --menu|settings`, 'Settings', ...coloring[`${!/home/i.test(cmd)}`], 'Configure the script')}`;

            if (debug) log(`ptwod updateHelp 4`);
            //set handout control
            let newBio = `<h1>PathToWindowOrDoor v${version}</h1>${navigation}<hr>${helpText[cmd].replace(/>\n\s+/g, '>')}`;
            state.PathToWindowOrDoor.cmd = cmd;
            helpCharacter.set({ bio: newBio });
            if (markdown) {
                if (debug) log(`ptwod updateHelp 5?`);
                let markdownHelp = `<h1>PathToWindowOrDoor v${version}</h1><hr>${helpText.home}`;
                markdownHelp = markdownHelp.replace(/\n+\s+|\n+\s+/g, '').replace(/<h(\d)>(.+?)<\/h\d>/g, (match, number, header) => {
                    return `${_.reduce(_.range(number * 1), (memo, string) => {
                        return memo += '#'
                    }, '\r')} ${header}`;
                }).replace(/<p>((?:.|\n)+?)<\/p>/g, '\r$1').replace(/<ul>/g, '').replace(/<\/ul>/g, "\r").replace(/<li>(.+?)<\/li>/g, '\r- $1').replace(/<a href="(.+?)">(.+?)<\/a>/g, "[$2]($1)").replace(/<\/?(i|b)>/g, (match, type) => {
                    let converter = {
                        i: '*',
                        b: '**'
                    };
                    return converter[type];
                }).replace(/<hr>/g, "\r___").replace(/^\r/, '');
                log(`Final markdown:${markdownHelp}`);
            }
        },

        updateDoorColors = function (playerid, selection, type, enteredColor) {
            let color;
            if (state.PathToWindowOrDoor[`${type}Color`]) {
                if (!enteredColor) {
                    if (selection[0]._type === 'path') {
                        enteredColor = getObj('path', selection[0]._id).get('stroke');
                    } else {
                        return;
                    }
                }
                enteredColor.replace(/(#[a-f\d]{6}).*/, (match, hex) => {
                    color = hex;
                });
                if (!color || !/#(?:[a-f\d]{2}){3}$/.test(color)) {
                    return;
                }
                state.PathToWindowOrDoor[`${type}Color`] = color;
                if (state.PathToWindowOrDoor.cmd === 'settings') {
                    updateHelp(playerid, selection, state.PathToWindowOrDoor.cmd);
                }
            }
        },

        setPresets = function (playerid, selection, type, color) {
            if ((!selection && !color) || !playerIsGM(playerid))
                return;
            log(`setPresets type=${type}, color=${color}`);
            if (/^(?:wall|door|unlocked|hidden|window)$/.test(type))
                updateDoorColors(playerid, selection, type, color);
        },

        /**
         * Handles chat input - Needed to rename as it was catching DoorKnocker too ... wtf scope ???
         * Command Syntax: !PathToWindowOrDoor --action,[options]|tracks/lists to affect|tracks/lists to affect|... --action2,[options|tracks/lists to affect|tracks/lists to affect|...
         */
        HandleInput = function (msg_orig) {
            try {
                var msg = _.clone(msg_orig),
                    cmdDetails, args,
                    actionSwitch = {
                        menu: updateHelp,
                        convertwindows: convertAllWindows,
                        convertdoors: convertAllDoors,
                        preset: setPresets
                    };

                if (msg.type !== 'api' || !/^!ptwod/.test(msg.content))
                    return;
                args = msg.content.split(/\s+--/);//splits the message contents into discrete arguments
                if (args[1] && playerIsGM(msg.playerid)) {
                    _.each(_.rest(args, 1), (cmd) => {
                        cmdDetails = cmdExtract(cmd);
                        log(`cmd=${cmd}, cmdDetails=${JSON.stringify(cmdDetails)}`);
                        if (cmdDetails.action && actionSwitch[cmdDetails.action.toLowerCase()]) {
                            actionSwitch[cmdDetails.action.toLowerCase()](msg.playerid, msg.selected, ...cmdDetails.things);
                        } else {
                            sendChat('PathToWindowOrDoor', `/w "${getObj('player', msg.playerid).get('displayname')}" \`\`[Access the control panel](${helpLink})\`\``, null, { noarchive: true });
                        }
                    });
                } else {
                    let player = getObj('player', msg.playerid);
                    let displayName = player.get('displayname');
                    let message = `/w "${displayName}" [Access the control panel](${helpLink})`;
                    sendChat('PathToWindowOrDoor', message);//,null,{noarchive:true});
                }
            } catch (err) {
                sendError(err);
            }
        },

        cmdExtract = function (cmd) {
            var cmdSep = {
                details: {}
            },
                vars, details;

            cmdSep.things = cmd.split('|');
            details = cmdSep.things.shift();
            cmdSep.things = _.map(cmdSep.things, (t) => {
                return t.trim();
            });
            details = details.split(',');
            cmdSep.action = details.shift();
            _.each(details, (d) => {
                vars = d.match(/(.*?)(?:\:|=)(.*)/) || null;
                if (vars) {
                    cmdSep.details[vars[1]] = (vars[1] === 'limit' || vars[1] === 'ignore') ? vars[2].split(/\s+/) : vars[2];
                } else {
                    cmdSep.details[d] = d;
                }
            });
            return cmdSep;
        },

        RegisterEventHandlers = function () {
            on('chat:message', HandleInput);
        };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: RegisterEventHandlers
    };

}());


on("ready", function () {
    'use strict';

    PathToWindowOrDoor.CheckInstall();
    PathToWindowOrDoor.RegisterEventHandlers();
});