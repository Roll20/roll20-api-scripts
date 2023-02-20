var API_Meta = API_Meta || {};
API_Meta.dltool = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.dltool.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (7));
    }
}

on('ready', () => {
    const version = '1.0.0'; //version number set here
    log('-=> Dynamic Lighting Tool v' + version + ' is loaded. Base command is !dltool');

    on('chat:message', (msg) => {
        if ('api' !== msg.type) {
            return;
        }


        const getPageForPlayer = (playerid) => {
            let player = getObj('player', playerid);
            if (playerIsGM(playerid)) {
                return player.get('lastpage') || Campaign().get('playerpageid');
            }

            let psp = Campaign().get('playerspecificpages');
            if (psp[playerid]) {
                return psp[playerid];
            }

            return Campaign().get('playerpageid');
        };

        const L = (o) => Object.keys(o).forEach(k => log(`${k} is ${o[k]}`));
        const decodeUnicode = (str) => str.replace(/%u[0-9a-fA-F]{2,4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));


        var cmdName = "!dltool";
        var msgTxt = msg.content;
        let theCommand = '';
        let theOption = '';
        let pageData = getObj('page', getPageForPlayer(msg.playerid));
        let lines = '';
        let pageInfo = '';
        let tokenInfo = '';
        let lightInfo = '';
        let tokenData = '';
        let repeatCommand = `&#10;!dltool`
        if (msg.content.match(/report\|light/m)) { repeatCommand = `&#10;!dltool --report|light` }
        if (msg.content.match(/report\|vision/m)) { repeatCommand = `&#10;!dltool --report|vision` }
        if (msg.content.match(/report\|page/m)) { repeatCommand = `&#10;!dltool --report|page` }


        const onButtonSmall = `<div style = 'background-color:#3b0; height:14px; width:25px; position: relative; top:2px; display: inline-block; border-radius:10px;'><div style = 'background-color:white; height:10px; width:10px; margin:2px 2px 2px 13px;display: inline-block;border-radius:10px'></div></div>`;
        const offButtonSmall = `<div style = 'background-color:#888; height:14px; width:25px; position: relative; top:2px; display: inline-block; border-radius:10px;'><div style = 'background-color:white; height:10px; width:10px; margin:2px 12px 2px 2px;display: inline-block;border-radius:10px'></div></div>`;
        const onButtonLarge = `<div style = 'background-color:#3b0; height:18px; width:30px; position: relative; top:2px; display: inline-block; border-radius:10px'><div style = 'background-color:white; height:14px; width:14px; margin:2px 2px 2px 14px;display: inline-block;border-radius:10px'></div></div>`;
        const offButtonLarge = `<div style = 'background-color:#888; height:18px; width:30px; position: relative; top:2px; display: inline-block; border-radius:10px'><div style = 'background-color:white; height:14px; width:14px; margin:2px 16px 2px 2px;display: inline-block;border-radius:10px'></div></div>`;
        let offStyle = `'background-color:#333; color:#ccc; text-decoration: none; text-transform: uppercase; font-weight:bold; font-size: 10px; border:0px solid transparent; border-radius:3px; margin: 2px 2px; padding:1px 6px; display:inline-block'`;
        let onStyle = `'background-color:#3b0; color:#fff; text-decoration: none; text-transform: uppercase; font-weight:bold; font-size: 10px; border:0px solid transparent; border-radius:3px; margin: 2px 3px; padding:1px 6px; display:inline-block'`;
        let disableStyle = `'background-color:#888; color:#fff; text-decoration: none; text-transform: uppercase; font-weight:bold; font-size: 10px; border:0px solid transparent; border-radius:3px; margin: 2px 3px; padding:1px 6px; display:inline-block'`;
        const openSection = `<div style = 'background-color:#ccc; border: 1px solid black; padding:3px; border-radius:15px;margin-top:10px;'>`
        const openHeader = `<div style = 'display: block; background-color:#333; color: #3b0; font-weight: bold; padding:2px; border-radius:20px; text-align:center;'>`;
        const openSubhead = `<div style = 'background-color:#333; color: #ccc; font-weight: bold; padding:2px; border-radius:20px; text-align:center;'>`;
        const openSubheadMargin = `<div style = 'background-color:#333; color: #ccc; font-weight: bold; padding:2px; border-radius:20px; text-align:center; margin-bottom:5px;'>`;
        const openPageHead = `<div style = 'background-color:#aaa; color: #111; font-weight: bold; padding:2px; margin-bottom:6px; border-radius:20px; text-align:center;'>`;
        const openReport = `<div style = 'display: block; position:relative;left: -5px; top: -30px; margin-bottom: -34px; background-color:#888; border-radius:18px; text-decoration:none;color:#000; font-family:Arial; font-size:13px; padding: 8px;'>`;
        const closeReport = `</div>`;



        const stop = `<div style = "background-color: red;    display:inline-block; height:8px; width:8px; margin: 6px 4px 0px 0px; border: 1px solid #111 "></div>`;
        const caution = `<div style = "background-color:#ffbf00; display:inline-block; height:8px; width:8px; margin: 6px 4px 0px 0px; border: 1px solid #111 "></div>`;
        const go = `<div style = "background-color: #3b0;   display:inline-block; height:8px; width:8px; margin: 6px 4px 0px 0px; border: 1px solid #111 "></div>`;
        const brightnessChar = `<span style = 'font-family: pictos;'>y</span>`;
        const HR = `<div style="width:100%; height:1px; background-color:#fff; margin:5px 0px;"></div>`;
        const spacer = `<div style="width:100%; height:1px; background-color:transparent; margin:5px 0px;"></div>`;


        //BUTTON: TOGGLE FOR PAGE PROPERTIES
        const toggle = (size, value, pageProperty) => {
            let toggleButton = '';
            if (size === "large" && (value === true || value === "true" || value === "basic")) {
                toggleButton = onButtonLarge;
            }
            if (size === "large" && value === false) {
                toggleButton = offButtonLarge
            }
            if (size === "small" && (value === true || value === "true" || value === "basic")) {
                toggleButton = onButtonSmall
            }
            if (size === "small" && value === false) {
                toggleButton = offButtonSmall
            }

            if (undefined === pageProperty) {
                pageProperty = '';
            }
            let finalButton = `<a style='background-color:transparent; border:0px solid transparent; padding:0px;' href = '!dltool --${pageProperty}|${((value === "true") ? "false" : "true")}${repeatCommand} --report'>${toggleButton}</a>`;
            if (pageProperty === "explorer_mode") {
                finalButton = `<a style='background-color:transparent; border:0px solid transparent; padding:0px;' href = '!dltool --${pageProperty}|${((value === "basic") ? "off" : "basic")}${repeatCommand} --report'>${((value === "basic") ? onButtonSmall : offButtonSmall)}</a>`;
            }
            return finalButton;
        };

        //BUTTON: TOGGLE FOR TOKEN PROPERTIES
        const toggleToken = (value, tokenProperty, offCode, onCode) => {
            let toggleButton = '';
            if (value === true || value === "true" || value === "on") {
                toggleButton = onButtonSmall;
                buttonCode = offCode;
            } else {
                toggleButton = offButtonSmall;
                buttonCode = onCode;
            }

            if (undefined === tokenProperty) {
                tokenProperty = '';
            }
            let finalButton = `<a style='background-color:transparent; border:0px solid transparent; padding:0px;' href = '${buttonCode}${repeatCommand} --report'>${toggleButton}</a>`;
            return finalButton;
        };


        //BUTTON: GENERIC FOR DLTOOL
        const dlButton = (label, link) => {
            let finalButton = `<a style='background-color:#333; color:#eee; text-decoration: none; border:1px solid #3b0; border-radius:15px;padding:0px 3px 0px 3px;display:inline-block' href = '${link}'>${label}</a>`;
            return finalButton;
        }

        //BUTTON: SMALL INLINE BUTTON
        const dlSmallButton = (label, link) => {
            let finalButton = `<a style='background-color:#333; color:#eee; text-decoration: none; border:1px solid #3b0; border-radius:15px;padding:0px 3px 0px 3px;display:inline-block; font-size:9px' href = '${link}'>${label}</a>`;
            return finalButton;
        }

        //BUTTON: TOKEN LIGHT PRESETS
        const lightButton = (label, dimLight, brightLight, arc, onCode) => {
            let totalLight = dimLight + brightLight;
            let finalButton = ``;
            let conditionalStyle = onStyle;
            let conditonalLink = `!token-mod --set emits_bright_light|off emits_low_light|off light_angle|360${repeatCommand} --report`;
            if (tokenData.get("low_light_distance") === totalLight && tokenData.get("bright_light_distance") === brightLight && tokenData.get("limit_field_of_vision_total") === arc) {
                if (tokenData.get("emits_bright_light") === false) {
                    conditionalStyle = disableStyle;
                    conditonalLink = "!token-mod --set emits_bright_light|on emits_low_light|on light_angle|360" + repeatCommand + " --report";
                }
                finalButton = `<a style=${conditionalStyle} href = '${conditonalLink}'><span title = "dim light ${dimLight}ft. bright light ${brightLight} ft.">${label}</span></a>`;
            } else {
                finalButton = `<a style=${offStyle} href = '${onCode}${repeatCommand} --report'><span title = "dim light ${dimLight}ft. bright light ${brightLight} ft.">${label}</span></a>`;
            }
            return finalButton;
        }





        const visionButton = (label, has_bright_light_vision, has_night_vision, night_vision_distance, hoverText) => {
            let finalButton = ``;
            let conditionalStyle = onStyle;
            let conditonalLink = `!token-mod --set emits_bright_light|off emits_low_light|off light_angle|360${repeatCommand} --report`;


            if (tokenData.get("has_bright_light_vision") === has_bright_light_vision && tokenData.get("has_night_vision") === has_night_vision && tokenData.get("night_vision_distance") === night_vision_distance) {
                conditonalLink = "!token-mod --set has_bright_light_vision|false has_night_vision|false " + repeatCommand;
                finalButton = `<a style=${onStyle} href = '${conditonalLink}'><span title = "${hoverText}">${label}</span></a>`;
            } else {
                conditonalLink = "!token-mod --set has_bright_light_vision|" + has_bright_light_vision + " has_night_vision|" + has_night_vision + " night_vision_distance|" + night_vision_distance + ((night_vision_distance === 60) ? " night_vision_effect|nocturnal" : " ") + repeatCommand;
                finalButton = `<a style=${offStyle} href = '${conditonalLink}'><span title = "${hoverText}">${label}</span></a>`;

            }



            return finalButton;
        }


        //BUTTON: DAYLIGHT PRESETS
        const daylightButton = (label, value, code) => {
            let finalButton = "";
            let conditionalStyle = onStyle

            if (pageData.get("daylightModeOpacity") * 100 === value) {
                if (pageData.get("daylight_mode_enabled") === false) {
                    conditionalStyle = disableStyle;
                }

                finalButton = `<a style=${conditionalStyle} href = '${code}${repeatCommand} --report'>${label}</a>`;
            } else {
                finalButton = `<a style=${offStyle} href = '${code}${repeatCommand} --report'>${label}</a>`;
            }
            return finalButton;
        }




        //SET VALUE BUTTON FOR ANY
        const setValue = (value, property, setCode) => {

            //Edge cases and Roll20 bug correctors
            if (value === '') {
                value = "0"
            }
            if (value === null) {
                value = "None"
            }
            if (value === undefined) {
                value = "&nbsp;-&nbsp;"
            }
            let openTitle = "";
            let closeTitle = "";
            if (property === "night_vision_effect") {
                let mode = tokenData.get("night_vision_effect");
                switch (value) {
                    case "None":
                        openTitle = `<span title = "The token sees everything within the night vision range as bright light.">`;
                        closeTitle = `</span>`;
                        break;
                    case "Nocturnal":
                        openTitle = `<span title = "Nocturnal Vision is a mode that mimics DnD5e and PF2e rules for Darkvision. When enabled, tokens will have Low Light in No Light areas, and Low Light areas will appear Brightly Lit.">`;
                        closeTitle = `</span>`;
                        break;
                    default:
                        let dimmingDistance = parseFloat(tokenData.get('night_vision_effect').replace(/^Dimming_/, '')) || 0;
                        dimmingDistance = Math.round(dimmingDistance * tokenData.get('night_vision_distance'));
                        openTitle = `<span title = "Dimming causes the vision area of the selected token to become dim Night Vision. ${dimmingDistance} feet of Dimming will have the inner ${dimmingDistance} feet of Night Vision appear bright while any amount left over will appear dim from that distance onward to the end of the night vision area.">`;
                        closeTitle = `</span><BR>` +
                            `<div style = text-align:right;">Dimming Distance starts at: ${openTitle}<a style='background-color:#333; min-width: 15px; text-align:right; color:#eee; border:1px solid #3b0; border-radius:3px;padding:0px 3px 0px 3px;display:inline-block' href = '!token-mod --set night_vision_effect|dimming|?{Set dimming dropoff distance in feet|${dimmingDistance}} ${repeatCommand} --report'>${dimmingDistance}</a>${closeTitle}</div>`;
                        value = "Dimming";
                }
            }

            if (property === "fog_opacity" || property === "daylightModeOpacity" || property === "dim_light_opacity") {
                value = value * 100;//for display. We want the user to see percentages, not decimals
            }



            let finalButton = `${openTitle}<a style='background-color:#333; min-width: 15px; text-align:right; color:#eee; border:1px solid #3b0; border-radius:3px;padding:0px 3px 0px 3px;display:inline-block' href = '${setCode} ${repeatCommand} --report'>${value}</a>${closeTitle}`;
            return finalButton;
        };

        //GENERATES A LABEL WITH HOVERTEXT
        const label = (phrase, helptext) => {
            let finalLabel = `<span title = "${helptext}">${phrase}</span>`
            return finalLabel;
        };


        //GENERATES PICTOS CHARACTER
        const pictos = (character, color) => {
            let pictosChar = `<span style = "font-family:pictos; ${((undefined !== color) ? 'color:' + color : '')}">${character}</span>`
            return pictosChar;
        };

        //GENERATES Arc of Light
        const lightArc = (degrees) => {
            let imgPosition = `style= "position:relative; top:-2px;" `;
            let finalButton = "";
            if (degrees < 361) { finalButton = `<img ${imgPosition} src = "https://s3.amazonaws.com/files.d20.io/images/327269160/8sw7NxlV05adop79r5f2qQ/original.png?1676017045">` }
            if (degrees < 290) { finalButton = `<img ${imgPosition} src = "https://s3.amazonaws.com/files.d20.io/images/327269162/d4MO9b-lpqOgNJvpxGsavQ/original.png?1676017045">` }
            if (degrees < 220) { finalButton = `<img ${imgPosition} src = "https://s3.amazonaws.com/files.d20.io/images/327269161/qM3QHPQRvXsIQadDpqTo4Q/original.png?1676017045">` }
            if (degrees < 150) { finalButton = `<img ${imgPosition} src = "https://s3.amazonaws.com/files.d20.io/images/327269163/zfqabEQXAHPqV9wPCfuK6g/original.png?1676017045">` }
            if (degrees === 0) { finalButton = `<img ${imgPosition} src = "https://s3.amazonaws.com/files.d20.io/images/327269159/ieyV_MAZgBQfRS4e4PhjAw/original.png?1676017044">` }


            return finalButton;
        }


        //BECAUSE ROLL20
        const stringToBoolean = function (string) {
            switch (string.toLowerCase().trim()) {
                case "true":
                case "yes":
                case "1":
                    return true;
                case "false":
                case "no":
                case "0":
                case null:
                    return false;
                default:
                    return Boolean(string);
            }
        }

        //UTILITY INFO BLOCK
        const utilityInfo = openSection +
            ((tokenData !== '') ? dlButton("Why can't this token see?", "!dltool --report|checklist") : dlButton("Why can't this token see?", "!dltool --report|checklist")) +
            dlButton("Other things to check for", "!dltool --checklist") +
            dlButton("Help Center", "https&#58;\/\/help.roll20.net\/hc/en-us\/articles\/360045793374-Dynamic-Lighting-Requirements-Best-Practices") + `&nbsp;&nbsp;` +
            dlButton(" DL Report ", "!dltool --report") + `&nbsp;|&nbsp;` + dlButton("Vision", "!dltool --report|vision") + dlButton("Light", "!dltool --report|light") + dlButton("Page", "!dltool --report|page") +
            `</div>`;


        //MESSAGE HANDLING
        if (msg.type == "api" && msgTxt.indexOf(cmdName) !== -1 && playerIsGM(msg.playerid)) {
            let APIMessage = msg.content;
            if (APIMessage === "!dltool" || APIMessage === "!dltools") { APIMessage = "!dltool --report" }
            let args = APIMessage.split(/\s--/);
            let commands = args[1].split(/\s+/);
            let theMessage = args[2];
            let checkLightButton = "";
            if (msg.selected) {
                tokenData = getObj('graphic', msg.selected[0]._id)
            }


            commands.forEach(c => {
                theCommand = c.split(/\|/)[0];
                theOption = c.split(/\|/)[1];

                //CASES FOR COMMANDS

                switch (theCommand) {

                    //CASE - REPORT
                    case 'report':

                        //FULL REPORT

                        //VISION SECTON
                        if (tokenData !== '') {
                            let lightData = '';
                            if (typeof checkLightLevel != "undefined") {
                                lightData = checkLightLevel.isLitBy(tokenData.get("id"));
                                checkLightButton = HR +
                                    "<b>" + `<span title="This is the amount of light currently falling on the token. Without night vision, a token needs to have a light source in order to be able to see. A zero value means the token is in darkness.">` + "Token is in " + (lightData.total * 100).toFixed() + "% total light</span></b>&nbsp;" +
                                    dlButton("Full Report", "!checklight");

                            } else {
                                let scriptLoc = 'https&#58;//app.roll20.net/forum/post/11124325/script-checklightlevel-check-the-current-level-of-light-on-a-to';
                                checkLightButton = '<br>' + dlButton("Check Amount of Light on the Token", "!dltool --message --If you want this functionality, you will need to install checkLightLevel, an external script by Oosh. You can find it in One Click install on your Mod page.");
                            }
                            let controllerNames = "";
                            let controllers = '';
                            let char = false;
                            if (tokenData.get("represents")) {
                                char = ((tokenData.get("represents")) ? getObj("character", tokenData.get("represents")) : false);
                            } else {
                                char = false;
                            }
                            if (char) {
                                controllers = char.get("controlledby").split(",");
                                if (char.get("controlledby")) {
                                    controllers.forEach(c => {
                                        controllerNames = controllerNames + ((c === "all") ? "All players" : getObj("player", c).get("_displayname")) + " • ";
                                    });
                                }
                            } else {
                                controllers = tokenData.get("controlledby").split(",");
                                if (tokenData.get("controlledby")) {
                                    controllers.forEach(c => {
                                        controllerNames = controllerNames + ((c === "all") ? "All players" : getObj("player", c).get("_displayname")) + " • ";
                                    });

                                }
                            }


                            controllerNames = controllerNames + "•"
                            controllerNames = controllerNames.split(" • •")[0].replace(/\s•\s/g, ", ").replace(/•/, "");
                            if (controllerNames === '') (controllerNames = "None (GM only by default)");
                            let tokenName = (tokenData.get("name") || "unnamed");

                            //REGULAR REPORT
                            tokenInfo =
                                openSection +
                                openSubhead + 'Token Vision</div>' +
                                openPageHead + '&quot;' + tokenName + '&quot; <span style ="font-size:12px; font-weight:normal;">' + ((char) ? ' (' + char.get("name") + ')' : '<span title = "This token does not represent a character">(generic)</span>') + '</span><BR><span style = "font-size=10px; font-weight:normal;" title="This is a list of people who control this token. If a name is not here, no player but the GM can use this token\'s vision settings.">Controllers: ' + controllerNames + '</span></div>' +
                                toggleToken(tokenData.get("has_bright_light_vision"), "has_bright_light_vision", "!token-mod --set has_bright_light_vision|off has_night_vision|off", "!token-mod --set has_bright_light_vision|on has_limit_field_of_vision|false") + ' <span title = "If this is on, the token has vision enabled. It will still need either Night Vision, or a nearby lightsource, otherwise it will see only blackness. A GM can test this by selecting the token and pressing Cntrl/Cmd-L. This is only an approximation. For true testing, it is recommended to use a Dummy Account. You can find out more about this in the Roll20 wiki. NOTE: Sometimes default values in token light can cause a token to see nothing regardless. Try toggling a light preset for this token on and off."> <b>Vision</b></span> &nbsp;' + '<BR>' +
                                toggleToken(tokenData.get("has_night_vision"), "has_night_vision", "!token-mod --set has_bright_light_vision|on has_night_vision|off", "!token-mod --set has_bright_light_vision|on has_night_vision|on  night_vision_effect|nocturnal") + ' <span title = "This defaults to night vision with the Nocturnal settin. No distance is set. Choose that in the fields to the right.">Night Vision</span> ' +
                                setValue(tokenData.get("night_vision_distance"), "night_vision_distance", "!token-mod --set has_bright_light_vision|on has_night_vision|on night_vision_effect|nocturnal night_vision_distance|?{Input new Night Vision distance in feet}") + "ft " +
                                "Mode: " + setValue(tokenData.get("night_vision_effect"), "night_vision_effect", "!token-mod --set night_vision_effect|?{Choose Mode|None,None|Nocturnal,Nocturnal|Dimming,Dimming } ") +
                                checkLightButton + HR +
                                `<b>${label("Vision Presets:", "These buttons will handle the most common vision cases for DnD 5e.")} <b><br>` +
                                visionButton("normal", true, false, tokenData.get("night_vision_distance"), "Standard vision for humans and other characters without darkvision") + " | " + visionButton("Darkvision 60ft", true, true, 60, "Standard darkvision for most characters with this trait") + visionButton("90", true, true, 90, "Many monsters have 90ft of darkvision. Example: Trolls or Night Hags") + visionButton("120", true, true, 120, "Enhanced darkvision used by races such as Drow or Duergar") +
                                `</div>`;


                            //CHECKLIST REPORT

                            let lightOnTOken = ((lightData) ? lightData.total : -1);

                            checklistTokenInfo =
                                openSection +
                                openSubhead + 'Token Vision Checklist</div>' +

                                ((tokenData.get("has_bright_light_vision")) ? label(`${go}<b>${tokenName}</b> has vision, but may require a light source. ` + ((lightData) ? `${tokenName} is in ${(lightData.total * 100).toFixed()}% total light` : ''), `Although this token has sight, it still may require a light source from itself or an outside source, or for page settings to grant daylight.`) : label(`<b>${stop}${tokenName}</b> has its vision turned off. It cannot see.`, `Without sight turned on, a token cannot utilize dynamic lighting. This is the recommended setting for most NPCs. Too many tokens with sight on the VTT can lead to confusing areas of apparent brightness for the GM`)) + `<BR>` +


                                ((tokenData.get("night_vision_distance") !== 0)
                                    ?
                                    ((tokenData.get("has_night_vision")) ? label(`<b>${go}${tokenName}</b> has ${tokenData.get("night_vision_distance")}ft of Night Vision, and does not require a light source`, `You may still need to check if it has a non-zero distance on its night vision. Certain modes may affect how it interacts with existing light. For instance, Nocturnal mode can change dim light to bright within the token\'s Night Vision range.`) : label(`<b>${caution}${tokenName}</b> has Night Vision turned off. It cannot see without a light source.`, `Night Vision allows a token to see without a light source.`))
                                    :
                                    ((tokenData.get("has_night_vision")) ? label(`${stop}<b>${tokenName}</b> has Night Vision, but the distance is set for ${tokenData.get("night_vision_distance")}ft. It can see light sources, but if you wish it to see in the dark, you must specify a distance.`, `Certain modes may affect how it interacts with existing light. For instance, Nocturnal mode can change dim light to bright within the token\'s Night Vision range.`) : label(`<b>${caution}${tokenName}</b> has Night Vision turned off. It cannot see without a light source.`, `Night Vision allows a token to see without a light source.`))
                                ) + `<BR>` +


                                ((tokenData.get("represents")) ?
                                    ((controllerNames !== "None (GM only by default)")
                                        ?
                                        `${go}This token represents the character <b>${char.get("name")}</b>, and is under the control of the following players: <b>${controllerNames}</b>. They are the only ones who can use this token for dynamic lighting.`
                                        :
                                        label(`${caution}This token represents the character <b>${char.get("name")}</b>, but has no specified controller. Only the GM can use it for dynamic lighting vision, and by pressing cmd/ctrl-L.`, `It does not represent a character sheet. If you are setting up a PC, be sure to assign the sheet to the token before saving this as the default token for the sheet. Saving as default should always be the last step. If this is meant to be an NPC it is fine as-is, but you may want to consider assigning control to the GM to avoid some transparency issues when using Exploration Mode.`))
                                    :
                                    ((controllerNames !== "None (GM only by default)")
                                        ?
                                        `${caution}This generic token is under the control of the following players: <b>${controllerNames}</b>. They are the only ones who can use this token for dynamic lighting. It does not represent a character sheet. If you are setting up a PC, be sure to make all settings and assign the sheet to the token <i>before</i> saving this as the default token for the sheet. Saving as default should always be the last step.`
                                        :
                                        `${caution}This token has no specified controller. Only the GM can use it for dynamic lighting vision, by pressing cmd/ctrl-L.`)
                                ) + `<BR>` +
                                ((tokenData.get("lightColor") !== "transparent" && tokenData.get("has_night_vision")) ? label(`${caution}<b>${tokenName}</b> is emitting tinted light, but also has Night Vision. Night Vision trumps tinted light, and the color will not appear within its limits.`, `Colored light should be used sparingly. It interacts in unexpected ways with other light sources and with night vision. Colored vision is not recommended.`) + `<BR>` : ``) +


                                ((tokenData.get("layer") === "walls") ? `${caution}This token is on the Dynamic Lighting layer. Dynamic Lighting will work for the GM by using Cmd/Ctrl-L, but players are only able to access tokens on the Token/Objects layer. Light emitted by tokens on the Dynamic Lighting Layer can be seen by tokens on the Token/Objects layer.<BR>` : '') +
                                ((tokenData.get("layer") === "gmlayer") ? `${stop}This token is on the GM layer. Dynamic Lighting will not function on the GM layer, nor will any light sources provide light. Players are only able to access tokens on the Token/Objects layer<BR>` : '') +
                                ((tokenData.get("layer") === "map") ? `${caution}This token is on the Map layer. Dynamic Lighting will work for the GM by using Cmd/Ctrl-L. Light emitted by tokens on the Dynamic Lighting Layer can be seen by tokens on the Token/Objects layer. Players are only able to access tokens on the Token/Objects layer<BR>` : '') +
                                ((pageData.get("dynamic_lighting_enabled")) ? `${go}Dynamic Lighting is on. All Dynamic Lighting features should be available.` : `${stop}Dynamic Lighting is <b>OFF</b>. No Dynamic Lighting features will function until this is turned on.`) + `<br>` +
                                ((pageData.get("dynamic_lighting_enabled") && pageData.get("daylight_mode_enabled")) ? `${go}Daylight Mode is on. No tokens need a specific light source. Daylight Opacity level has been set for ${Math.round(pageData.get("daylightModeOpacity") * 100)}%. Low levels indicate a darker overall light.` : ((lightOnTOken === 0) ? stop : caution) + `Daylight Mode is off. Any token without Night Vision will need to have line of sight to a specific light source. ` + ((lightData) ? `<b>${tokenName}</b> is in ${(lightData.total * 100).toFixed()}% total light` : '')) + `<br>` +



                                dlButton("Token settings don't stick?", "!dltool --default") +



                                `${HR}<b>Key:</b><br>` +
                                `${go} No problem.<BR>` +
                                `${caution} Caution. This may give problems in some circumstances.<BR>` +
                                `${stop} Problem that will likely prevent this token from using Dynamic Lighting.<BR>` +
                                `</div>`;


                        } else {
                            tokenInfo = "No token is selected";
                            checklistTokenInfo = "No token is selected. Please select a token and try again.";
                        }


                        //LIGHT SECTON
                        if (tokenData !== '') {

                            let char = ((tokenData.get("represents")) ? getObj("character", tokenData.get("represents")) : false);
                            lightInfo = openSection +
                                openSubhead + 'Token Light</div>' +
                                spacer.replace(`margin:5px`, `margin:2px`) +
                                toggleToken(tokenData.get("emits_bright_light"), "emits_bright_light", "!token-mod --set emits_bright_light|off emits_low_light|off light_angle|360", "!token-mod --set emits_bright_light|on emits_low_light|on light_angle|360") + ' <span title = "This toggles whether or not the selected token emits light. You can set those values below, and they will persist and be restored if lighting is turned off and back on."><b>Light</b></span> &nbsp;' +
                                `<div style= "float:right; margin: 2px 5px 0px 0px; "><div title="This is a graph which shows the proportion of bright to dim light" style = "width: 60px; height:12px; background-image: linear-gradient(to right, #aaa, #999, #444); display:inline-block; border: 1px solid #111"><div style = "width:${(Number(tokenData.get("bright_light_distance")) / Number(tokenData.get("low_light_distance"))) * 100}%; height:12px; background-image: linear-gradient(to right, #eee, #ccc);"></div></div></div>` + '<BR>' +
                                spacer.replace(`margin:5px`, `margin:1px`) +
                                'Bright: <span title="The amount of bright light emitted by this token. Bright light is generated from the center of the token.">' + setValue(tokenData.get("bright_light_distance"), "bright_light_distance", "!token-mod --set emits_bright_light|on bright_light_distance|?{Input Bright light in feet}") + "</span>ft " +
                                '&nbsp;|&nbsp;Dim: <span title="The amount of dim light emitted by this token. Dim light begins at the end of the brght light range.">' + setValue(tokenData.get("low_light_distance") - tokenData.get("bright_light_distance"), "low_light_distance", "!token-mod --set emits_low_light|on low_light_distance|?{Input Bright light in feet}") + "</span>ft " +
                                `<span title="this is the brightness of the dim light emitted by the token. 75% is the default.">Intensity: </span>${setValue(tokenData.get("dim_light_opacity"), "dim_light_opacity", "!token-mod --set dim_light_opacity|?{Set Brightness of Dim light|75}")}%` +


                                `<br>` + HR +

                                toggleToken(tokenData.get("has_limit_field_of_vision"), "has_limit_field_of_vision", "!token-mod --set has_limit_field_of_vision|off", "!token-mod --set has_limit_field_of_vision|on") + ' <span title = "This toggles whether or not the selected token emits light. You can set those values below, and they will persist and be restored if lighting is turned off and back on.">Directional Light</span> &nbsp;' +
                                `&nbsp;<span title="Arc of Light.">` + setValue(tokenData.get("limit_field_of_vision_total"), "limit_field_of_vision_total", "!token-mod --set limit_field_of_vision_total|?{Input arc of light in degrees}") + "</span>° Arc " +
                                lightArc(tokenData.get("limit_field_of_vision_total")) + '<BR>' +

                                `<div style="margin-top:0px; display:inline-block">` +
                                '<span title="Use this sparingly, as light colors can interact in unpredicatble ways. Tinting vision is not recommended, since the interaction is problematic.">Color:' + setValue(tokenData.get("lightColor"), "lightColor", "!token-mod --set lightColor|?{Use sparingly. Input in hex, rgb or hsv format.|transparent}") + "</span> " +
                                `<div style ="display:inline-block; width: 18px; height:14px; position:relative; top:1px; border: 1px solid #111; border-radius:3px; margin-top:1px; margin-left: -2px; background-color:${tokenData.get('lightColor')}">&nbsp;</div>` +
                                '&nbsp;&nbsp;<span title="This should be at 100% in most cases. Some systems, like Pathfinder, and D&D 4e have Low Light Vision, which can increase the effective light of a light source for that token. For example, a token with a light multiplier of 200 would see the light from a campfire as twice as big than a token with the default 100 would.">Multiplier:' + setValue(tokenData.get("light_sensitivity_multiplier"), "light_sensitivity_multiplier", "!token-mod --set light_sensitivity_multiplier|?{Sometimes called Low Light Vision. 100% is recommended for most RPG systems|100}") + "%</span> " +
                                `</div>` + `<br>` +

                                HR +
                                `<b>${label("Light Presets: ", "Presets for most common cases. These are geared toward 5e definitions, but are simple to redefine in the code. Clicking a preset name will also toggle the state of light being on or off. The preset will restored if you toggle the master token light switch off and on.")}</b><br>` +
                                lightButton("Spotlight", 0, 5, 360, "!token-mod --set emits_bright_light|on bright_light_distance|5 low_light_distance|0 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("Candle", 5, 2, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|2 low_light_distance|5 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("Lamp", 15, 15, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|15 low_light_distance|15 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("Torch", 20, 20, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|20 low_light_distance|20 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("Hooded Lantern", 30, 30, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|30 low_light_distance|30 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("Bullseye Lantern", 60, 60, 90, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|60 low_light_distance|60 has_limit_field_of_vision|on limit_field_of_vision_total|90 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("<i>Light<i>", 20, 20, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|20 low_light_distance|20 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("<i>Daylight<i>", 60, 60, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|60 low_light_distance|60 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("<i>Dancing Light<i>", 10, 0, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|0 low_light_distance|10 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("<i>Faerie Fire<i>", 10, 0, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|0 low_light_distance|10 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                lightButton("<i>Flametongue<i>", 40, 40, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|40 low_light_distance|40 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
//                                lightButton("<i>Gem of Brightness<i>", 30, 30, 360, "!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|30 low_light_distance|30 has_limit_field_of_vision|off limit_field_of_vision_total|360 dim_light_opacity|" + tokenData.get("dim_light_opacity")) +
                                `</div>`;
                        } else {
                            tokenInfo = "No token is selected";
                        }


                        //PAGE SECTON
                        pageInfo =
                            openSection +
                            openSubhead + 'Dynamic Lighting for Page</div>' +
                            openPageHead + '&quot;' + pageData.get("name") + '&quot;</div>' +
                            toggle("small", pageData.get("dynamic_lighting_enabled"), "dynamic_lighting_enabled") + '<span title = "Toggling this setting to off will toggle off all settings below, but they will return to their previous state when you turn Dynamic Lighting back on."> <b>Dynamic Lighting</b></span>' + '<BR>' +
                            '<span title = "This is how dark unlit areas appear to the GM. Keeping this value very low will lead to less confusion. Many Night Vision using tokens in one area can make that area look brightly lit.">GM Dark Opacity: </span>' +
                            setValue(pageData.get("fog_opacity"), "fog_opacity", "!dltool-mod --fog_opacity|?&#123;Input value between 0 and 100?|100}") + "% <BR>" +

                            toggle("small", pageData.get("daylight_mode_enabled"), "daylight_mode_enabled") + ' <span title = "When Daylight Mode is on, tokens with Vision do not need specific light sources in able to see. You can adjust the amount of daylight to simulate fog, twilight, a moonlit night or a shadowiy interior. Higher values are brighter.">Day Mode</span> &nbsp;' +
                            setValue(pageData.get("daylightModeOpacity"), "daylightModeOpacity", "!dltool-mod --daylightModeOpacity|?&#123;Input value between 0 and 100?|100}") + "%<BR>" +

                            toggle("small", pageData.get("lightrestrictmove"), "lightrestrictmove") + ' <span title = "Due to a bug in the Roll20 Mod system, you must open and close page settings for this to take effect. NOTE: Since this setting also affects the legacy lighting system, it is on the first tab of the Page Settings panel.">Barriers Restrict Movement <span style="font-family:pictos; color:#444">i</span></span>' + '<BR>' +
                            toggle("small", pageData.get("lightupdatedrop"), "lightupdatedrop") + ' <span title = "When Update on Drop is turned on, a token\'s view does not change while it is being moved, but only when that move is completed. This can keep players from scouting a map surreptitiously. Turning this on can also help performance, as the system does not need to continuously update.">Update on Drop</span>' + '<BR>' +
                            toggle("small", pageData.get("explorer_mode"), "explorer_mode") + ' <span title = "Explorer Mode will keep previously seen areas visible in a darkened gray style. It will not display tokens that cannot currently be seen. Commonly called Fog of War in video games. Turning this off can improve performance if lag is noticed.">Explorer Mode</span>' + '<BR>' +
                            HR + `<b>${label("Daylight Presets:", "When Daylight Mode is on, tokens with Vision do not need specific light sources in able to see. These presets simulate regular daylight, a moonlit night, and a starlit night. Can also be used for buildings or dungeons with dim interiors.")} <b>` +
                            `<span style = "Full brightness over entire map. Simulates a normal day.">` + daylightButton("Day", 100, "!dltool --daylight_mode_enabled|true" + repeatCommand + " --daylightModeOpacity|100") + `</span>` +
                            `<span style = "Half brightness over entire map. Simulates a bright moonlit night.">` + daylightButton("Moon", 50, "!dltool --daylight_mode_enabled|true" + repeatCommand + " --daylightModeOpacity|50") + `</span>` +
                            `<span style = "20% brightness over entire map. Simulates a clear, moonless night.">` + daylightButton("Star", 20, "!dltool --daylight_mode_enabled|true" + repeatCommand + " --daylightModeOpacity|20") + `</span>` +
                            `</div>`;


                        //Determines which report to send
                        if (undefined === theOption) {
                            lines = openHeader + 'Dynamic Lighting Tool' + `</div>` +
                                tokenInfo + lightInfo + pageInfo + utilityInfo +
                                '</div>';
                        } else {

                            switch (theOption) {
                                case "vision":
                                    lines = openHeader + 'Dynamic Lighting Tool' + `</div>` +
                                        tokenInfo + utilityInfo +
                                        '</div>';
                                    break;
                                case "light":
                                    lines = openHeader + 'Dynamic Lighting Tool' + `</div>` +
                                        lightInfo + utilityInfo +
                                        '</div>';
                                    break;
                                case "page":
                                    lines = openHeader + 'Dynamic Lighting Tool' + `</div>` +
                                        pageInfo + utilityInfo +
                                        '</div>';
                                    break;
                                default:
                                    lines = openHeader + 'Dynamic Lighting Tool' + `</div>` +
                                        checklistTokenInfo + utilityInfo +
                                        '</div>';
                            }
                        }


                        sendChat('DL Tool', '/w gm ' + openReport + lines + closeReport, null, {
                            noarchive: true
                        });
                        break;



                    //GENERIC MESSSAGE
                    case 'message':
                        if (undefined !== theMessage) {
                            theMessage = '<span style ="margin: 2px 10px 2px 10px; color:#111">' + theMessage + '</span>';
                            sendChat('DLTool', '/w gm ' + openSection + theMessage + closeReport, null, {
                                noarchive: true
                            });

                        }
                        break;


                    case 'default':

                        theMessage = `${openHeader}Dynamic Lighting Tool</div>${openSection}${openSubhead}Saving a Default Token</div>${spacer}Sometimes, users can become frustrated when they set up a token perfectly, but the next time they pull it from the Journal Tab, none of the settings seem to have saved.<br>Setting a default token is like taking a snapshot of a token exactly as it is, and saving it to the character journal. Any changes you make to a token on the VTT will not affect the default token at all.<br><span style ="font-size:16px; font-weight:bold">Therefore, setting the journal's default token must always be done as the <i>last</i> step.</span></div>` +
                            `${openSection}${openSubhead}Two Methods to Save a Default Token</div>${spacer}<b>1) From the Token Settings</b><br>Open the Token Settings panel for the token. Click the "Update Default Token" button.<br>${spacer}<b>2) From the Journal</b><br>Open the journal for the character the token represents. Click the "Edit" button in the upper right corner. On the edit screen, there are three buttons.<br><b>${pictos('L')} Edit Token Properties: </b>This calls up the Token Settings panel for making other changes you wish to become new defaults.</b><br><b>${pictos('L')} Use Selected Token: </b>Sets the selected token as the new default token for that journal.<br><b>${pictos('L')} Apply Token Defaults: </b>This overwrites all tokens in play that represent this character to the new defaults. <i>Caution:</i> if you have edited tokens on the board (say, by numbering them), this can overwrite those changes.</div>`

                        //theMessage = '' + theMessage + '</span>';
                        sendChat('DLTool', '/w gm ' + openReport + theMessage + utilityInfo + closeReport, null, {
                            noarchive: true
                        });


                        break;


                    case 'checklist':
                        let VS = `<div style="height:8px">&nbsp;</div>`; //Vertical spacer
                        theMessage = `<BR>Check that token is not blocked off by DL lines from seeing the immediate surroundings.${VS}If testing with the player present, make sure the player is looking at their token\'s immediate area. Shift-Click and hold on the token to pull the player\'s view to that area. Check the permission settings manually or with with the report to ensure they have control over the token.${VS}Check that the player has not been <i>Split from the Party</i> (Check the Help Center if this is unfamiliar)${VS}If Fog of War or Explorable Darkness (Dynamic Lighting feature that lets the token retain a memory of map areas it has seen) is being used, check that the area the token is in has been cleared. Both of these can be cleared using the darkness tool on the control palette to the left.${VS}Try toggling a light source preset on and off. Sometimes unset default values can cause a DL glitch.${VS}Can you see a rotating cube in <a style = "color:##7e2d40; background-color:transparent; padding:0px;" href="https&#58;\/\/get.webgl.org">this URL</a>? If not, the browser needs to be WebGL compatible (99%+ are).<br><br>${HR}<b>Golden Rule: If things don't seem to be working or responding properly,<br>1) Open and close the token settings manually, and/or 2) Reload the game.</b> `;

                        theMessage = `${openSubhead}Other things to check for</div><span style ="margin: 2px 10px 2px 10px; color:#111">` + theMessage + '</span>';

                        if (msg.selected) {
                            tokenData = getObj('graphic', msg.selected[0]._id)
                        }



                        sendChat('DLTool', '/w gm ' + openReport + openHeader + 'Dynamic Lighting Tool</div>' + openSection + theMessage + closeReport + utilityInfo + closeReport, null, {
                            noarchive: true
                        });
                        break;


                    case 'fog_opacity':
                        if (theOption >= 1 && theOption <= 100) {
                            theOption = theOption / 100;
                        } else {
                            if (theOption === "0") {
                                theOption = 0;
                            } else {
                                theOption = 1.0;
                            }
                        }
                        break;

                    case 'daylightModeOpacity':
                        if (theOption >= 1 && theOption <= 100) {
                            theOption = theOption / 100;
                        } else {
                            if (theOption === "0") {
                                theOption = 0;
                            } else {
                                theOption = 1.0;
                            }
                        }
                        pageData.set('force_lighting_refresh', true);

                        break;

                    case 'dynamic_lighting_enabled':
                        if (theOption === "false" || theOption === "true") {
                            stringToBoolean(theOption);
                        } else {
                            sendChat('DLTool', '/w gm ' + openReport + theOption + ' is not a valid value for ' + theCommand + ' It has been set to false.' + closeReport, null, {
                                noarchive: true
                            });
                            theOption = false;
                        }
                        pageData.set('force_lighting_refresh', true);
                        break;

                    case 'daylight_mode_enabled':
                        if (theOption === "false" || theOption === "true") {
                            (theOption === 'true') ? true : false;
                        } else {
                            theOption = false;
                            sendChat('DLTool', '/w gm ' + openReport + theOption + ' is not a valid value for ' + theCommand + ' It has been set to false.' + closeReport, null, {
                                noarchive: true
                            });
                            pageData.set('force_lighting_refresh', true);
                        }
                        break;

                    case 'lightrestrictmove':
                        if (theOption === "false" || theOption === "true") {
                            (theOption === 'true') ? "true" : "false";
                        } else {
                            theOption = false;
                            sendChat('DLTool', '/w gm ' + openReport + theOption + ' is not a valid value for ' + theCommand + ' It has been set to false.' + closeReport, null, {
                                noarchive: true
                            });
                        }
                        pageData.set('force_lighting_refresh', true);

                        break;

                    case 'lightupdatedrop':
                        if (theOption === "false" || theOption === "true") {
                            (theOption === 'true') ? true : false;
                        } else {
                            theOption = false;
                            sendChat('DLTool', '/w gm ' + openReport + theOption + ' is not a valid value for ' + theCommand + ' It has been set to false.' + closeReport, null, {
                                noarchive: true
                            });
                        }
                        break;

                    case 'explorer_mode':
                        if (theOption === "off" || theOption === "basic") {
                            (theOption === 'basic') ? 'basic' : 'off';
                        } else {
                            theOption = 'off';
                            sendChat('DLTool', '/w gm ' + openReport + theOption + ' is not a valid value for ' + theCommand + ' It has been set to false.' + closeReport, null, {
                                noarchive: true
                            });
                        }
                        break;

                    default:
                    // Nothing here. :)
                }

                if (theOption === "false") {
                    pageData.set(theCommand, false);
                    pageData.set('force_lighting_refresh', true);

                } else {
                    pageData.set(theCommand, theOption);
                    pageData.set('force_lighting_refresh', true);
                }
            });
        };
    });
});

{
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.dltool.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.dltool.offset);
    }
}
