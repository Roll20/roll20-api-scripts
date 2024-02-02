var API_Meta = API_Meta || {};
API_Meta.Pingbuddy = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Pingbuddy.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4)); }
}

/*########################
PingBuddy by Keith Curtis, including code adapted from Nick Olivo
Forum thread: https://app.roll20.net/forum/post/11095028/script-ping-buddy
Script repo: https://gist.github.com/keithcurtis1/536c5e575e4ef6ba40a519eca17b392a
v.0.0.1 Initial Script
v.0.0.2 added tooltip behaviors
v.0.0.3 expanded tooltip behaviors and fixed transparency issue
v.0.0.4 pingme and pingmesilent added to tooltip behaviors
v.0.0.5 placing name after !pingme will ping token by name
v.0.0.6 remove capitalization as a concern, fix issue with unassigned tokens
v.0.0.7 Added Help Functions and submitted to One Click
#########################*/

on("ready", function () {
    const version = '0.0.7';
    log('-=> Ping Buddy v' + version + ' is loaded. Help command is !pingbuddy --help');

    const theGM = findObjs({
        type: 'player'
    })
        .find(o => playerIsGM(o.id));



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

    //Stores original GM color, and records any change
    if (!_.has(state, 'pingBuddy')) {
        state.pingBuddy = {
            restoreColor: ((theGM.get("color") !== 'transparent') ? theGM.get("color") : state.pingBuddy.restoreColor)
        };
    }
    on("change:player:color", function () {
        state.pingBuddy.restoreColor = theGM.get("color");
    });



    // When page loads, ping pull to "Player" Token
    on("change:campaign:playerpageid", function () {
        setTimeout(function () {

            pingPlayerToken("", "", true, "");
            //(objID, userID, moveAll, visibleTo) 
        },
            1500);
    });

    // !pingplayer - Finds and Ping Pulls player token
    on("chat:message", function (msg) {
        if (msg.type == "api" && msg.content.indexOf("!pingplayer") == 0) {
            pingPlayerToken();
        }
    });


    // !pingpme - Finds and Ping Pulls first found token belonging to a player


    on("chat:message", function (msg) {
        if (msg.type == "api" && msg.content.indexOf("!pingbuddy --help") == 0) {

            const openSection = `<div style = 'background-color:#ccc; border: 1px solid black; padding:3px; border-radius:15px;margin-top:10px;'>`
            const openHeader = `<div style = 'display: block; background-color:#333; color: #3b0; font-weight: bold; padding:2px; border-radius:20px; text-align:center;'>`;
            const openSubhead = `<div style = 'background-color:#333; color: #ccc; font-weight: bold; padding:2px; border-radius:20px; text-align:center;'>`;
            const openSubheadMargin = `<div style = 'background-color:#333; color: #ccc; font-weight: bold; padding:2px; border-radius:20px; text-align:center; margin-bottom:5px;'>`;
            const openPageHead = `<div style = 'background-color:#aaa; color: #111; font-weight: bold; padding:2px; margin-bottom:6px; border-radius:20px; text-align:center;'>`;
            const openReport = `<div style = 'display: block; position:relative;left: -5px; top: -30px; margin-bottom: -34px; background-color:#888; border-radius:18px; text-decoration:none;color:#000; font-family:Arial; font-size:13px; padding: 8px;'>`;
            const closeReport = `</div>`;
            const makeButton = (label, link) => {
                let finalButton = `<a style='background-color:#333; color:#eee; text-decoration: none; border:1px solid #3b0; border-radius:15px;padding:0px 3px 0px 3px;display:inline-block' href = '${link}'>${label}</a>`;
                return finalButton;
            }


            let helpTitle = openHeader + "Ping Buddy v." + version + "</div>";

            let helpText = `<BR>Ping Buddy adds some extra utilitiy to the ping pull function, beyond what you would get with a long press or a shift-long press.<BR>` +
                `**Follow a Party Token**<BR>` +
                `If you create a token and name it "Party", or set the tooltip to the word "Party", the screen will ping pull to the token whenever it is moved. This allows you to guide players around the map or across an overland map. The ping animataion is temporarily disabled. The circle animation is removed by temporarily setting the GM's player color to transparent, and then reverting it. It is possible if you make too many rapid movements in succession, it won't revert the color before running again and stick the GM color on transparent. If this happens, just re-assign the GM player color manually.<BR>` +
                `If you set the "Party" token to be an invisible token (marking it with an aura only you can see), it allows you to center the player view to any area of the map without a visual cue.<BR>` +
                `If two or more party tokens are on the same page, the screen will ping pull only to the one that was last moved.<BR>` +
                `Another use would be a board or wargame where you want to call attention to the last piece moved. Just make sure "Party" is in the nameplate or the Tooltip. More behaviors are explained below.<BR>` +
                `<BR>` +
                `**Tooltip Codes**<BR>` +
                `Instead of naming the token "Party", you can set the token's tooltip to the word "Party" for the same behavior, and name the token as you will. These will only work if the player is on the page with the player flag. Capitalization does not matter. There are four codes currently:<BR>` +
                `<div style = "margin-left:5px; margin-top:5px;">**Party:** Behavior is same as naming the token "Party". All players will follow the token without animation.<BR>` +
                `**Ping:** Behavior is same as naming the token "Party", but all players will follow the token with animation.<BR>` +
                `**Pingme:** Token will pingpull only the controller. They will see animation, but no one else will be affected.<BR>` +
                `**Pingmesilent:** Token will pingpull only the controller. They will not see animation, and no one else will be affected.<BR></div>` +
                `<BR>` +
                `**Pull Players to the Start of a Page**<BR>` +
                `Whenever the player flag is moved to a page, all players on that page will immediately be ping pulled to the "Party" token. The token may be moved to the gm layer if you wish, and players will be pulled to that part of the map. This is useful for encounter maps that don't start in the upper left corner.<BR>` +
                `<BR>` +
                `**Find a Token**<BR>` +
                `**Find My Token:** If a player types <code>!pingme</code> into chat, the screen will ping pull to the first token it finds that they control. If they control no tokens on the screen, the script will inform you. This is useful for large maps, or if a player loses track of their token in Dynamic Lighting or Fog of War.<BR>` +
                `<BR>` +
                `**Find token by name:** If you type a name after !pingme, separated by a space, the script will find the first occurrence on the page of a token with that name. Ex. <code>!pingme Bob</code> will ping pull the first token it finds named "Bob". Spaces and capitalization count.<BR>` +
                `Pingme commands will only work if the player is on the page with the player flag.<BR>` +
                `${makeButton("Video Demo", "https://youtu.be/8-2YQ4oo4nA")} ${makeButton("Get Invisible Token", "https://wiki.roll20.net/Invisible_Token")}<BR>`;

            sendChat('Ping Buddy', '/w gm ' + openReport + helpTitle + openSection + helpText + closeReport + closeReport, null, { noarchive: true });

        }










    });

    on("chat:message", function (msg) {
        if (msg.type == "api" && msg.content.indexOf("!pingme") == 0) {
            let playerName = findObjs({
                id: msg.playerid
            })[0].get("_displayname");


            if (msg.content.length === 7) {

                let tokens = findObjs({
                    _type: "graphic",
                    layer: "objects",
                    _pageid: Campaign().get("playerpageid")
                });
                if (undefined === tokens) {
                    return;
                }

                let myTokens = [];
                let char = [];
                tokens.forEach(t => {
                    //if (undefined!==t.get("represents")) {
                    char = findObjs({
                        type: 'character',
                        id: t.get("represents")
                    })[0];
                    if (char && char.get('controlledby').includes(msg.playerid)) {
                        myTokens.push(t)
                    }
                    //}
                });

                if (myTokens.length > 0) {
                    let myToken = myTokens[0];
                    sendPing(myToken.get("left"), myToken.get("top"), myToken.get("pageid"), theGM.id, true);
                } else {
                    sendChat("Ping Buddy", `/w "${playerName}" No character belonging to ${playerName} can be found on this page. Make sure that the player flag is on this page as well.`, null, {
                        noarchive: true
                    });
                }
            } else {

                let tokenName = msg.content.replace(/  +/g, ' ').split("pingme ")[1];
                //Future filtering idea
                //let tokenAttr = tokenSearchTerm.split("|")[0];
                //let tokenVal = tokenSearchTerm.split("|")[1];

                let foundToken = findObjs({
                    _type: "graphic",
                    layer: "objects",
                    _pageid: Campaign().get("playerpageid"),
                    name: tokenName
                });
                if (foundToken.length > 0) {
                    foundToken = foundToken[0];
                    sendPing(foundToken.get("left"), foundToken.get("top"), foundToken.get("pageid"), theGM.id, true);
                } else {
                    if (undefined === tokenName) {
                        tokenName = "with that name"
                    };
                    sendChat("Ping Buddy", `/w "${playerName}" No token named ${tokenName} can be found on this page. Make sure that the player flag is on this page as well.`, null, {
                        noarchive: true
                    });

                }
            }
        }
    });




    // Set ping folow behavior
    on("change:graphic", function (obj, prev) {
        if (obj.get("name") === "Party" || obj.get("tooltip").toLowerCase().match(/^(ping|pingme|pingmesilent|party)$/)) {
            let objID = obj.get("_id");
            let behavior = ((obj.get("tooltip").toLowerCase().match(/^(ping|pingme|pingmesilent|party)$/)) ? obj.get("tooltip").toLowerCase() : obj.get("name").toLowerCase());
            let tokenChar = ((obj.get("represents")) ?
                char = findObjs({
                    type: 'character',
                    id: obj.get("represents")
                })[0] : "all");
            //if (!char) {let tokenChar.controlledby = "all"}
            let tokenController = obj.get("controlledby").split(",")[0];



            switch (behavior) {

                // Pulls to Party Token without Ping animation
                case "party":
                    theGM.set("color",
                        "transparent");

                    pingPlayerToken(objID, theGM.id, true,);

                    setTimeout(function () {
                        theGM.set("color", state.pingBuddy.restoreColor);;
                    },
                        1200);
                    break;

                // Pulls to Token with Ping animation
                case "ping":
                    pingPlayerToken(objID, theGM.id, true,);
                    break;

                //pulls to controller position with Ping animation
                case "pingme":
                    pingPlayerToken(objID, tokenController, true, tokenController);
                    break;

                //pulls to controller position without Ping animation
                case "pingmesilent":
                    theGM.set("color",
                        "transparent");

                    pingPlayerToken(objID, theGM.id, true, tokenController);

                    setTimeout(function () {
                        theGM.set("color", state.pingBuddy.restoreColor);;
                    },
                        1200);
                    break;

                default:
                // Nothing happens here
            }


        }

    });


    //Receives ping parameters and performs ping
    function pingPlayerToken(objID, userID, moveAll, visibleTo) {

        //sendChat("Pingbuddy","objID = "+ objID + "<BR>userID =  "+ userID + "<BR>moveAll =  "+ moveAll + "<BR>visibleTo = " + visibleTo);
        tokens = []
        if (objID) {
            tokens = findObjs({
                _id: objID,
                _type: "graphic",
                _pageid: Campaign().get("playerpageid")
            });
        } else {
            tokens = findObjs({
                name: "Party",
                _type: "graphic",
                _pageid: Campaign().get("playerpageid")
            });
        }


        var playerStartToken = tokens[
            0
        ];
        if (playerStartToken === undefined) {
            return;
        }
        sendPing(playerStartToken.get("left"), playerStartToken.get("top"), playerStartToken.get("pageid"), userID, moveAll, visibleTo);
    }
});


{ try { throw new Error(''); } catch (e) { API_Meta.Pingbuddy.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Pingbuddy.offset); } }
