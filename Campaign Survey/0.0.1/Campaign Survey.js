var API_Meta = API_Meta || {};
API_Meta.Survey = { offset: Number.MAX_SAFE_INTEGER, lineCount: -1 };
{
    try { throw new Error(''); } catch (e) { API_Meta.Survey.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4)); }
}

on('ready', () => {
    const version = '0.0.1';
    log('Campaign Survey v' + version + ' is ready! --offset '+ API_Meta.Survey.offset + ' -- Use the command !survey to get started');
});

on('chat:message', async (msg_orig) => {
    let msg = _.clone(msg_orig);
    if (!/^!survey/.test(msg.content)) {
        return;
    }

    function makeButton(name, link, minwidth) {
        if (minwidth === "f") {
            minwidth = "100%"
        } else {
            if (!minwidth) {
                minwidth = '100'
            }
            if (commands.includes('makehandout') && minwidth > 99) {
                minwidth = minwidth * 2
            }
            minwidth = minwidth + "px"
        }

        if (!name) {
            name = "untitled"
        }
        if (link) {
            return `<a style = '${buttonStyle}; width:${minwidth} !important' href='${link}'>${name}</a>`;
        } else {
            return `<div style = '${buttonStyle}; width:${minwidth}; display:inline-block !important'>${name}</div>`;
        }
    }

    function makeHelpButton(title, helpText) {
        return `<div style = 'float:right '><a style = 'color: red; display:inline-block; padding:0px; margin:0px; background-color:white; border-radius:8px;' href = '!survey --sendtext|${title}|${helpText}'>&nbsp;?&nbsp;</a></div>`
    }

    function makeBox(color, id, name) {
        return `<a href = '!survey --pcs ${id}' style= 'float: left; display:inline-block; height: 20px; width: 20px;  margin-top: 2px; margin-right: 2px; background-color:${color}; border: 1px solid black; clear: both; !important'</a>`;
    }

    function makeImageLink(url) {
        imageCode = url.split('/')[5] + '/' + url.split('/')[6];
        url = url.replace('med.png', 'thumb.png') || url;
        url = url.replace('max.png', 'thumb.png') || url;
        url = url.replace('original.png', 'thumb.png') || url;
        return `<a href = '!survey --url ${imageCode}'><img style = 'max-height: 35px; max-width: 35px; padding: 0px; margin: 0px !important' src = '${url}'</img></a>`;
    }

    const playSound = function(trackName, action) {
        let track = findObjs({
            type: 'jukeboxtrack',
            title: trackName
        })[0];
        if (track) {
            track.set('playing', false);
            track.set('softstop', false);
            if (action === 'play') {
                track.set('playing', true);
            }
            if (action === 'stop') {
                track.set('playing', false);
            }

        } else {
            sendChat('Campaign Survey', '/w gm No Track Found Named ' + trackName);
            log("No track found " + trackName);
        }
    }

    const stopAllSounds = function() {
        let tracks = findObjs({
            type: 'jukeboxtrack',
            playing: true
        });
        if (tracks) {
            _.each(tracks, function(sound) {
                sound.set('playing', false);
            });
        }
    }
    let helpLabel = '';

    const openReport = "<div style='color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; font-family: sans-serif; white-space: pre-wrap;'>";
    const closeReport = '</div>';
    const openHeader = "<div style='font-weight:bold; color:#fff; background-color:#404040; margin-right:3px; padding:3px;'>"
    const closeHeader = `</div>`;
    const buttonStyle = `background-color: #ccc; color: black !important; border-radius: 3px; padding: 2px; margin: 2px 4px 2px 0px; display: inline-block`;

    //wiki links are tinyurl encoded because the wiki will not open a link in a new tab, https://tinyurl.com/mtz43sun = https://wiki.roll20.net/Main_Page is 
    const helpLinks = new Proxy({
        helpCharacters: `A list of all character sheets in a campaign in descending order of complexity. All entries are linked to the sheet so you can quickly open them and investigate. Each character is appended by the number of attributes it contains. This will vary depending on the sheet used, and complexity of the character. Look for exceptionally high outliers, typically spell caster with many spells.`,
        helpCharacterAbilities: `A list of all character sheets in a campaign in descending order of number of abilities (macros resident on character sheets). Abilities can be quite long, but they are still relatively low impact compared to attributes. All entries are linked to the sheet so you can quickly open them and investigate. Each character is appended by the number of abilities it contains. Look for exceptionally high outliers, typically Macro Character Sheets. In this case, a high number of macros is rarely an issue, since this practice serves to consolidate a lot of a games automation in one place. For more information see, <a href='https://tinyurl.com/3jn6jzrr'>Macro Character Sheet</a> in the  <a href='https://tinyurl.com/mtz43sun'>Roll20 Community Wiki</a>.`,
        helpHandouts: `A list of all handouts in a campaign. All entries are linked to the handout so you can quickly open them and investigate. Handouts are very low impact items, and are unlikely to contribute to lag or increased loading time except in extreme numbers.`,
        helpPages: `A list of all pages in a campaign, along with the number of graphics on that page. Graphics are listed as total graphics/count of tokens. Look for exceptionally high count outliers. More graphics = more Firebase items to track. Number of graphics is more likely to be a lag concern on Dynamically Lit pages.`,
        helpLighting: `A list of all dynamically lit pages in a campaign, along with the number of sighted tokens, light-emitting tokens, plus DL paths, and the total number of points in those paths. Simplify when possible. There is overlap in the report, if one token is emitting low and bright light, it is listed in both counts. See <a href='https://help.roll20.net/hc/en-us/articles/360045793374-System-Requirements-Best-Practices'>System Requirements & Best Practices</a> in the Help Center for performance help, or <a href='https://help.roll20.net/hc/en-us/categories/360003712734-Dynamic-Lighting'>Help Center's Dynamic Lighting headquarters</a>. If Dynamic Lighting does not seem to be working, try going through the <a href='https://help.roll20.net/hc/en-us/articles/360044771413-Dynamic-Lighting-Checklist'>Dynamic Lighting Checklist</a>`,
        helpTables: `A list of all tables in a campaign in alphabetical order. All entries are linked to a roll on that table. Clicking on the name will produce a gmroll, clicking on the number of entries will perform an inline roll. Tables are low impact items.`,
        helpTexts: `A list of all text obejcts in a campaign. Text objects are low impact items. There may be some entries for empty texts. This can happen when the user clicks with the text editing tool in error and then abandons the process to do something else. Empty texts are not a serious problem, but in order to clean things up and make it easier not select them by accident. <a href='!survey --deleteemptytexts'>Click here</a> to remove all empty texts. Use with caution.`,
        helpPlayers: `A list of all players in a campaign, along with their player id, and avatar color. Clicking the player color box calls up a character list report formatted like the characters keyword in descending order of complexity, but is limited to characters for whom the player is listed as a controller. Clicking on the player name will take you to their public Roll20 profile page, in case you need to PM them or can't remember what they are called outside of the game.`,
        helpGraphics: `A list of all graphics in a campaign, followed by the number of times they are used. You may occasionally see a 1x and a say, 6x for the same graphic. This likely indicates that an item was dragged in from a marketplace source and used again from the art library. Clicking on the button lists all occurrences of the identified graphic in a campaign, broken out by page. Information on best practices for creating and uploading graphics can be found in <a href='https://help.roll20.net/hc/en-us/articles/360037256634-Best-Practices-for-Files-on-Roll20s'>Best Practices for Files on Roll20</a> in the Help Center`,
        helpDecks: `A list of all card decks in a campaign, along with a card count for each deck. Decks are a relatively low-impact item, unless there are an inordinate number of cards in play on the VTT.`,
        helpMacros: `A list of all macros in a campaign. Each macro will play the macro when clicked. Macros are low impact items.`,
        helpTracks: ` A list of all jukebox tracks in a campaign. Clicking on the track will play the track. Each track name has a button next to it that will stop playing that track. Jukebox tracks are streaming files and will not affect loading time. They are unlikely to contribute to lag, except in cases where there is already low bandwidth.`,
        helpAttributes: `A list of all character attributes in a campaign. This is a <i>very</i> rough indicator of the size of the Firebase DB, when combined with the number of graphics placed on the VTT. A high number will likely affect loading time, and may contribute to lag. Character sheets, and the number of graphics and drawings on the VTT are the greatest contributors to game size.`,
        helpMakeHandout: `Sends the report to a handout named "Campaign Survey Report". You can use this with any other keyword or as the sole keyword. Every category on the campaign overview display has a handout option. There is a button at the bottom of the display to directly open the handout. All reports sent to the handout will update in real time. If you want the name of the campaign to appear at the top of every report, put it in the gmnotes of the Campaign Survey Report handout.`,
        helpCampaign: `If you want the name of the campaign to appear at the top of every report, put it in the gmnotes of the Campaign Survey Report handout.`,
        helpSurvey: `Campaign Survey is a script that tries to give the user a bird-eye view of their campaign, reporting on how much space is taken up by which elements. Some elements have more of an impact on game performance than others, and in general, the script tries to show them in descending order of importance. Information on improving Roll20 performance can be found on <a href='https://help.roll20.net/hc/en-us/articles/4403128607127-Roll20-System-Recommendations'>Roll20 system Recommendations</a> and  <a href='https://help.roll20.net/hc/en-us/articles/360041544654'>Optimizing Roll20 Performance</a>in the Help Center.`,
        helpOverview: `Gives a count of each of the categories. Each category is clickable to send that command to chat or to the report. typiing <b>!survey --overview</b> is the same as typing <b>!survey.</b>`,
        helpHelp: `Displays this help information.<br>If you need specific Roll20 information, the <a href='https://help.roll20.net/'>Help Center</a> is avaiable for all official documentation, and the <a href='https://tinyurl.com/mtz43sun'>Roll20 Community Wiki</a> has a wealth of information contributed by community members, often more technical than the Help Center. If you need to report a bug, or a problem with your game, the best way to get team attention is through filing a <a href='https://roll20.zendesk.com/hc/en-us/requests/new'>Help Center Request</a>. More general help can often be provided by friendly community members on the <a href='https://app.roll20.net/forum/'>Roll20 Forum</a>.`
    }, {
        get: function(target, prop) {
            return target[prop] || 'Invalid property, try again';
        }
    });


    if (msg.content === '!survey' && playerIsGM(msg.playerid)) {
        msg.content = '!survey --overview'
    }
    if (msg.content === '!survey --makehandout' && playerIsGM(msg.playerid)) {
        msg.content = '!survey --overview makehandout'
    }

    let lines = '';
    let sheetURL = 'http://journal.roll20.net/character/';
    let profileURL = 'https://app.roll20.net/users/';
    let tableURL = `!&#10;/roll 1t[`;
    let rows = [];
    let urlCount = 0;

    let characters = findObjs({
        type: 'character'
    }).sort((a, b) => (a.get("name") > b.get("name") ? 1 : -1));

    const getAttrCountByChar = () => findObjs({
            type: 'attribute'
        })
        .map(o => o.get('characterid'))
        .reduce((m, o) => ({
            ...m,
            [o]: (m[o] || 0) + 1
        }), {});

    const getAbilityCountByChar = () => findObjs({
            type: 'ability'
        })
        .map(o => o.get('characterid'))
        .reduce((m, o) => ({
            ...m,
            [o]: (m[o] || 0) + 1
        }), {});

    let CharAttrLookup = getAttrCountByChar();
    let charAbilityLookup = getAbilityCountByChar();

    let handouts = findObjs({
        type: 'handout'
    }).sort((a, b) => (a.get("name") > b.get("name") ? 1 : -1));

    let pages = findObjs({
        type: 'page'
    }).sort((a, b) => (a.get("name") > b.get("name") ? 1 : -1));

    let dlPages = findObjs({
        type: 'page',
        dynamic_lighting_enabled: true
    }).sort((a, b) => (a.get("name") > b.get("name") ? 1 : -1));

    let graphics = findObjs({
        type: 'graphic'
    })

    let texts = findObjs({
        type: 'text'
    });

    let charSorted = [];

    let images = findObjs({
        type: 'graphic'
    }).reduce((m, g) => {
        let imgsrc = g.get('imgsrc');
        //imgsrc = /^(.*)\/(?!=\/)/.exec(imgsrc)[1];
        imgsrc = imgsrc.slice(0, Math.max(imgsrc.indexOf(`?`), 0) || imgsrc.length);
        if (!m.hasOwnProperty(imgsrc)) {
            m[imgsrc] = {
                locations: [],
                getTotalUses: function() {
                    return this.locations.length;
                },
                getUniquePages: function() {
                    return [...new Set(this.locations.map(l => l.pageid))]
                }
            };
        }
        m[imgsrc].locations.push({
            pageid: g.get('_pageid'),
            pagename: findObjs({
                type: 'page',
                id: g.get('_pageid')
            })[0].get('name'),
            layer: g.get('layer')
        });
        return m;
    }, {});

    let imglist = [...new Set(graphics.map(g => g.get('imgsrc')))];

    let tables = findObjs({
        type: 'rollabletable'
    });
    let decks = findObjs({
        type: 'deck'
    });
    let cards = findObjs({
        type: 'card'
    });
    let macros = findObjs({
        type: 'macro'
    }).sort((a, b) => (a.get("name") > b.get("name") ? 1 : -1));

    let tracks = findObjs({
        type: 'jukeboxtrack'
    }).sort((a, b) => (a.get("title") > b.get("title") ? 1 : -1));;

    let attributes = findObjs({
        type: 'attribute'
    });

    let abilities = findObjs({
        type: 'ability'
    });


    let players = findObjs({
        type: 'player'
    });

    let characterList = '';
    let pcList = '';
    let handoutList = '';
    let pageList = '';
    let dlPageList = '';
    let tableList = '';
    let textList = '';
    let deckList = '';
    let cardList = '';
    let macroList = '';
    let trackList = '';
    let playerList = '';
    let graphicList = '';
    let attributeList = '';
    let imageList = '';
    let objectList = '';
    let imgurl = '';
    let imagCode = '';
    let pageObjects = [];
    let myPaths = [];
    let pathSum = 0;
    let trackName = '';
    let args = msg.content.split(/\s--/);
    let commands = args[1].split(/\s+/);

    //Is there a handout?
    let reportHandout = findObjs({
        type: 'handout',
        name: 'Campaign Survey Report'
    });
    reportHandout = reportHandout ? reportHandout[0] : undefined;

    if (!reportHandout) { //if there isn't then make one
        reportHandout = createObj('handout', {
            name: 'Campaign Survey Report',
            archived: false
        });
    }
    
    let campaignTitle = await new Promise((resolve, reject) => {
        reportHandout.get("gmnotes", function(gmnotes) {
            let text = gmnotes.replace(/(<([^>]+)>)/ig, '');
            resolve(text);
        });
    });
    if (!campaignTitle) {
        //campaignTitle =  `Untitled Campaign`;
        campaignTitle = `<a style = 'color: white; display:inline-block; padding:0px; margin:0px; background-color:#404040' href = '!survey --sendtext|Campaign Name|helpCampaign'>Untitled Campaign</a>`;
    }

    let campaignTitleBox = `${openHeader}${campaignTitle}${closeHeader}`

    let handoutURL = 'http://journal.roll20.net/handout/';
    reportHandoutid = reportHandout.get("_id");
    reportHandoutButton = makeButton("Open Campaign Survey Report", handoutURL + reportHandoutid, 214);

    if (msg.content.includes('!survey --sendtext|')) {
        let theTitle = msg.content.split('|')[1];
        let theMessage = msg.content.split('|')[2];

        sendChat('Campaign Survey', `/w gm ${openReport}${openHeader}${theTitle}${closeHeader}${helpLinks[theMessage]}${closeReport}`, null, {
            noarchive: true
        });
        return
    }



    commands.forEach(c => {

        switch (c) {
            case 'characters':
                helpLabel = makeHelpButton('Characters', 'helpCharacters');
                characterList = (characterList === '') ? `${openHeader}Characters: ${helpLabel}${characters.length} items, ${attributes.length} attributes${closeHeader}${characters.map((obj) => { return makeButton(obj.get('name'), sheetURL + obj.get('_id'), 105) + makeButton(findObjs({ type: 'attribute', characterid: obj.id }).length + ' attr', '', 60) }).join('<br>')}<br>` : '';
                lines = lines + characterList;
                break;
            case 'characterattrs':
                helpLabel = makeHelpButton('Characters', 'helpCharacters');
                charSorted = characters.sort((a, b) => ((CharAttrLookup[b.id] || 0) - (CharAttrLookup[a.id] || 0)));
                characterList = (characterList === '') ? `${openHeader}Characters: ${helpLabel}${characters.length} items, ${attributes.length} attributes${closeHeader}Name, Attribute Count, Percent of Total<br>${charSorted.map((obj) => { return makeButton(obj.get('name'), sheetURL + obj.get('_id'), 105) + makeButton(findObjs({ type: 'attribute', characterid: obj.id }).length + ' attr', '', 55) + makeButton(Math.round(findObjs({ type: 'attribute', characterid: obj.id }).length/attributes.length*10000) / 100 + '%', '', 47) }).join('<br>')}<br>` : '';
                lines = lines + characterList;
                break;
            case 'characterabilities':
                helpLabel = makeHelpButton('Characters', 'helpCharacterAbilities');
                charSorted = characters.sort((a, b) => ((charAbilityLookup[b.id] || 0) - (charAbilityLookup[a.id] || 0)));
                characterList = (characterList === '') ? `${openHeader}Characters: ${helpLabel}${characters.length} items, ${abilities.length} abilities${closeHeader}Name, Ability Count, Percent of Total<br>${charSorted.map((obj) => { return makeButton(obj.get('name'), sheetURL + obj.get('_id'), 105) + makeButton(findObjs({ type: 'ability', characterid: obj.id }).length + ' ablt', '', 55) + makeButton(Math.round(findObjs({ type: 'ability', characterid: obj.id }).length/abilities.length*10000) / 100 + '%', '', 47) }).join('<br>')}<br>` : '';
                lines = lines + characterList;
                break;
            case 'handouts':
                helpLabel = makeHelpButton('Handouts', 'helpHandouts');
                handoutList = (handoutList === '') ? `${openHeader}Handouts: ${helpLabel}${handouts.length} items${closeHeader}${handouts.map((obj) => { return makeButton(obj.get('name'), handoutURL + obj.get('_id'), 205) }).join('<br>')}<br>` : '';
                lines = lines + handoutList;
                break;
            case 'pages':
                helpLabel = makeHelpButton('Pages', 'helpPages');
                pageList = `${openHeader}Pages: ${helpLabel}${pages.length} items${closeHeader}Name, Total Graphics-Tokens<BR>`
                pages.forEach(p => {
                    pageList = pageList + makeButton(p.get("name"), "", 150) + makeButton(findObjs({
                        type: 'graphic',
                        _pageid: p.get("_id")
                    }).length + "-" + (findObjs({
                        type: 'graphic',
                        _pageid: p.get("_id")
                    }).length - findObjs({
                        type: 'graphic',
                        represents: '',
                        _pageid: p.get("_id")
                    }).length), '', 60) + "<BR>"
                });
                lines = lines + pageList;
                break;

            case 'lighting':
                helpLabel = makeHelpButton('Dynamic Lighting Pages', 'helpLighting');
                pageList = `${openHeader}Dynamic Lighting Pages: ${helpLabel}${dlPages.length} items${closeHeader}Sighted, Lights (low/bright), DL paths<BR>`
                dlPages.forEach(p => {
                    pathSum = 0;
                    myPaths = findObjs({
                        type: 'path',
                        _pageid: p.get("_id"),
                        layer: 'walls'
                    })
                    myPaths.forEach(pt => {
                        pathSum = pathSum + JSON.parse(pt.get("path")).length;
                    })
                    pageObjects = findObjs({
                        type: 'graphic',
                        _pageid: p.get("_id")
                    });
                    pageList = pageList + makeButton(p.get("name"), "", 'f') + '<BR>' +
                        '<div style="display:inline-block"><b>Sighted:</b> ' + findObjs({
                            type: 'graphic',
                            _pageid: p.get("_id"),
                            has_bright_light_vision: true
                        }).length + ' <b>Lights: </b>' +
                        findObjs({
                            type: 'graphic',
                            _pageid: p.get("_id"),
                            emits_low_light: true
                        }).length + '/' +
                        findObjs({
                            type: 'graphic',
                            _pageid: p.get("_id"),
                            emits_bright_light: true
                        }).length + '</div> <div style="display:inline-block"><b>Paths: </b>' +
                        myPaths.length + ' paths, ' + pathSum + ' points</div><br>'
                });
                lines = lines + pageList;
                break;

            case 'tables':
                helpLabel = makeHelpButton('Rollable Tables', 'helpTables');
                tableList = (tableList === '') ? `${openHeader}Rollable Tables: ${helpLabel}${tables.length} items${closeHeader}${tables.map((obj) => { return makeButton(obj.get('name'), '!&#10;&#47;' + "gmroll 1t[" + obj.get('name') + "]", 160) + makeButton(findObjs({ type: 'tableitem', _rollabletableid: obj.get("_id") }).length + ' items', '!&#10;&#47;' + "w gm [[1t[" + obj.get('name') + "]]]", 65) }).join('<br>')}<br>` : '';
                lines = lines + tableList;
                break;

            case 'texts':
                helpLabel = makeHelpButton('Text Objects', 'helpTexts');
                textList = (textList === '') ? `${openHeader}Text Objects: ${helpLabel}${texts.length} items${closeHeader}${texts.map((obj) => { return makeButton('<b>'+getObj('page',obj.get('_pageid')).get('name') + '</b> <i>(' + obj.get('layer') + ')</i>: "' + obj.get('text').replace(/(\r\n|\n|\r)/gm,"<br>")+'"', '', 'f') }).join('<br>')}<br>` : '';
                lines = lines + textList;
                break;

            case 'deleteemptytexts':
                helpLabel = helpTexts;
                let emptyTexts = [];
                texts.forEach(t => {
                    if (t.get("text") === '') {
                        t.remove()
                    }
                });
                textList = "All empty text objects have been removed.<br>";
                lines = lines + textList;
                break;

            case 'decks':
                helpLabel = makeHelpButton('Decks', 'helpDecks');
                deckList = `${openHeader}Decks: ${helpLabel}${decks.length} items${closeHeader}Name <i>(click to display in handout)</i>,<br>Card Count<i>(click to display in chat)</i><BR>`
                decks.forEach(d => {
                    deckList = deckList + makeButton(d.get("name"), "!survey --cards " + d.get("_id") + " makehandout", 100) + makeButton(findObjs({
                        type: 'card',
                        _deckid: d.get("_id")
                    }).length + " cards", "!survey --cards " + d.get("_id"), 80) + "<br>"
                });
                lines = lines + deckList;
                break;

            case 'cards':
                let deckID = ((msg.content.split('cards ')[1]));
                deckID = deckID.split(" ")[0] || deckID;
                let theDeck=findObjs({
                    type: 'deck',
                    _id: deckID
                })[0]
                let deckName = theDeck.get("name");
                let deckCards = findObjs({
                    type: 'card',
                    _deckid: deckID
                });
                cardList = (cardList === '') ? `${openHeader}Cards of ${deckName}:${closeHeader}` + makeButton('Back' + '<br><img style= "max-width:70px; max-height:100px;" src="' + theDeck.get('avatar')+ '">','',70) + `${deckCards.map((obj) => { return makeButton(obj.get('name') + '<br><img style= "max-width:70px; max-height:100px;" src="' + obj.get('avatar')+ '">','',70) }).join(' ')}<br>` : '';
                lines = lines + cardList;
                break;

            case 'macros':
                helpLabel = makeHelpButton('Macros', 'helpMacros');
                macroList = (macroList === '') ? `${openHeader}Macros: ${helpLabel}${macros.length} items${closeHeader}${macros.map((obj) => { return makeButton(obj.get('name'),"!&#10;#"+obj.get('name'),210) }).join('<br>')}<br>` : '';
                lines = lines + macroList;
                break;

            case 'tracks':
                helpLabel = makeHelpButton('Jukebox Tracks', 'helpTracks');
                trackList = (trackList === '') ? `${openHeader}Jukebox Tracks: ${helpLabel}${tracks.length} items${closeHeader}Tracks will play when clicked.<BR>${tracks.map((obj) => { return makeButton(obj.get('title'), '!survey --playtrack ' + obj.get('title'), 185) + makeButton('stop', '!survey --stoptrack ' + obj.get('title'), 30) }).join('<br>')}<br>` : '';
                lines = lines + trackList;
                break;

            case 'playtrack':
                trackName = ((msg.content.split('playtrack ')[1]));
                playSound(trackName, "play")
                break;

            case 'stoptrack':
                trackName = ((msg.content.split('stoptrack ')[1]));
                playSound(trackName, "stop")
                break;

            case 'graphics':
                helpLabel = makeHelpButton('Image usage', 'helpGraphics');
                imageList = (imageList === '') ? `${openHeader}Image usage: ${helpLabel}${graphics.length} items${closeHeader}` : '';

                Object.keys(images).forEach(g => {
                    rows.push(`<div style= 'width: 65px; height: 38px; background-color: #aaa; border-radius: 3px; padding: 2px; margin: 2px; display: inline-block !important'>${images[g].getTotalUses()} x ${makeImageLink(g)}</div>`);
                });
                imageList = imageList + rows.reverse().join(' ');
                lines = lines + imageList;
                break;

            case 'attributes':
                helpLabel = makeHelpButton('Character Attributes', 'helpAttributes');
                charSorted = characters.sort((a, b) => ((CharAttrLookup[b.id] || 0) - (CharAttrLookup[a.id] || 0)));
                characterList = (characterList === '') ? `${openHeader}Characters: ${helpLabel}${characters.length} items, ${attributes.length} attributes${closeHeader}Name, Attribute Count, Percent of Total<br>${charSorted.map((obj) => { return makeButton(obj.get('name'), sheetURL + obj.get('_id'), 105) + makeButton(findObjs({ type: 'attribute', characterid: obj.id }).length + ' attr', '', 55) + makeButton(Math.round(findObjs({ type: 'attribute', characterid: obj.id }).length/attributes.length*10000) / 100 + '%', '', 47) }).join('<br>')}<br>` : '';
                lines = lines + attributeList;
                break;

            case 'abilities':
                helpLabel = makeHelpButton('Character Abilities', 'helpAbilities');
                charAbilitySorted = characters.sort((a, b) => ((charAbilityLookup[b.id] || 0) - (charAbilityLookup[a.id] || 0)));
                characterList = (characterList === '') ? `${openHeader}Characters: ${helpLabel}${characters.length} items, ${abilities.length} abilities${closeHeader}${charAbilitySorted.map((obj) => { return makeButton(obj.get('name'), sheetURL + obj.get('_id'), 155) + findObjs({ type: 'ability', characterid: obj.id }).length + ' abilities' }).join('<br>')}<br>` : '';
                lines = lines + abilityList;
                break;

            case 'pcs':
                helpLabel = makeHelpButton('Controlled by', 'helpCharacters');
                let playerID = ((msg.content.split('pcs ')[1]))
                let playerName = getObj('player', playerID).get('_displayname');
                charSorted = characters.sort((a, b) => ((CharAttrLookup[b.id] || 0) - (CharAttrLookup[a.id] || 0)));
                pcSorted = [];
                charSorted.forEach(c => {
                    if (c.get('controlledby').includes(playerID)) {
                        pcSorted.push(c)
                    };
                });
                characterList = (characterList === '') ? `${openHeader}Controlled by ${playerName}${closeHeader}${pcSorted.map((obj) => { return makeButton(obj.get('name'), sheetURL + obj.get('_id'), 155) + findObjs({ type: 'attribute', characterid: obj.id }).length + ' attr' }).join('<br>')}<br>` : '';
                lines = lines + characterList;
                break;


            case 'url':
                let urlCode = ((msg.content.split('url ')[1]))

                imgurl = 'https://s3.amazonaws.com/files.d20.io/images/' + urlCode + '/thumb.png';
                pageList = `${makeImageLink(imgurl)}${openHeader}Count Per Page:${closeHeader} <BR>`;

                pages.forEach(p => {
                    pageList = pageList + `<div style = 'width: 75%; background-color: #aaa; border-radius: 3px; padding: 2px; margin: 2px; display: inline-block !important'> ${p.get("name")}</div>`;
                    urlList = findObjs({
                        type: 'graphic',
                        _pageid: p.get("_id"),
                    });
                    urlCount = 0;
                    urlList.forEach(u => {
                        if (u.get('imgsrc').includes(urlCode)) {
                            urlCount++
                        }
                    });
                    pageList = pageList + urlCount + '</span><br>';
                });

                lines = lines + pageList;
                break;

            case 'objects':
                helpLabel = makeHelpButton('Character Attributes', 'helpAttributes');
                objectList = (objectList === '') ? `${openHeader}All Objects:${closeHeader}${getAllObjs().length}` : '';
                lines = lines + objectList;
                break;

            case 'players':
                helpLabel = makeHelpButton('Players', 'helpPlayers');
                playerList = (playerList === '') ? `${openHeader}Players: ${helpLabel}${players.length} items${closeHeader}Click on the player color box for a list of characters controlled by that player. Click on the player name to open a new tab showing their Roll20 public profile.<BR>${players.map((obj) => { return makeBox(obj.get('color'), obj.get('_id'), obj.get('_displayname')) + makeButton(obj.get('_displayname'), profileURL + obj.get('_d20userid'), 175) + '<BR><div style = "width: 27px; display: inline-block;"></div>id: ' + (obj.get('_id')) }).join('<br>')}<br>` : '';
                lines = lines + playerList;
                break;
 
            case 'help':
                let argumentButtonWidth = 90;
                helpText = `${openHeader}Campaign Survey Help${closeHeader}${helpLinks['helpSurvey']} The <b>!survey</b> command can be followed by " --" and one or more of the following keywords:<br><br>` +
                    `<b>${makeButton('characters', '!survey --characterattrs', argumentButtonWidth)}</b> ${helpLinks['helpCharacters']}<br>` +
                    `<b>${makeButton('attributes', '!survey --attributes', argumentButtonWidth)}</b> ${helpLinks['helpAttributes']}<br>` +
                    `<b>${makeButton('abilities', '!survey --abilities', argumentButtonWidth)}</b> ${helpLinks['helpCharacterAbilities']}<br>` +
                    `<b>${makeButton('pages', '!survey --pages', argumentButtonWidth)}</b> ${helpLinks['helpPages']}<br>` +
                    `<b>${makeButton('lighting', '!survey --lighting', argumentButtonWidth)}</b> ${helpLinks['helpLighting']}<br>` +
                    `<b>${makeButton('graphics', '!survey --graphics', argumentButtonWidth)}</b> ${helpLinks['helpGraphics']}<br>` +
                    `<b>${makeButton('handouts', '!survey --handouts', argumentButtonWidth)}</b> ${helpLinks['helpHandouts']}<br>` +
                    `<b>${makeButton('macros', '!survey --macros', argumentButtonWidth)}</b> ${helpLinks['helpMacros']}<br>` +
                    `<b>${makeButton('tables', '!survey --tables', argumentButtonWidth)}</b> ${helpLinks['helpTables']}<br>` +
                    `<b>${makeButton('texts', '!survey --texts', argumentButtonWidth)}</b> ${helpLinks['helpTexts']}<br>` +
                    `<b>${makeButton('decks', '!survey --decks', argumentButtonWidth)}</b> ${helpLinks['helpDecks']}<br>` +
                    `<b>${makeButton('tracks', '!survey --tracks', argumentButtonWidth)}</b> ${helpLinks['helpTracks']}<br>` +
                    `<b>${makeButton('players', '!survey --players', argumentButtonWidth)}</b> ${helpLinks['helpPlayers']}<br>` +
                    `<b>${makeButton('makehandout', '!survey --makehandout', argumentButtonWidth)}</b> ${helpLinks['helpMakeHandout']}<br>` +
                    `<b>${makeButton('overview', '!survey --overview', argumentButtonWidth)}</b> <i>(optional)</i> gives a count of each of the categories. Each category is clickable to send that command to chat or to the report. typiing <b>!survey --overview</b>, is the same as typing <b>!survey.</b><br>` +
                    `<b>${makeButton('Help', '!survey --help', argumentButtonWidth)}</b> ${helpLinks['helpHelp']}`;
                lines = lines + helpText;
                break;

            case 'overview':
                characterButton = makeButton(characters.length + " characters", "!survey --characterattrs", 150) + makeButton("handout", "!survey --characterattrs makehandout", 55);
                attributeButton = makeButton("<i> • " + attributes.length + " attributes", "!survey --characterattrs</i>", 150) + makeButton("handout", "!survey --characterattrs makehandout", 55);
                abilityButton = makeButton("<i> • " + abilities.length + " abilities", "!survey --characterabilities</i>", 150) + makeButton("handout", "!survey --characterabilities makehandout", 55);
                pageButton = makeButton(pages.length + " pages", "!survey --pages", 150) + makeButton("handout", "!survey --pages makehandout", 55);
                dlPageButton = makeButton("<i> • " + dlPages.length + " lighting", "!survey --lighting</i>", 150) + makeButton("handout", "!survey --lighting makehandout", 55);
                graphicButton = makeButton("<i> • " + graphics.length + " graphics", "!survey --graphics", 150) + makeButton("handout", "!survey --graphics makehandout", 55);
                handoutButton = makeButton(handouts.length + " handouts", "!survey --handouts", 150) + makeButton("handout", "!survey --handouts makehandout", 55);
                macroButton = makeButton(macros.length + " macros", "!survey --macros", 150) + makeButton("handout", "!survey --macros makehandout", 55);
                tableButton = makeButton(tables.length + " tables", "!survey --tables", 150) + makeButton("handout", "!survey --tables makehandout", 55);
                textButton = makeButton(texts.length + " texts", "!survey --texts", 150) + makeButton("handout", "!survey --texts makehandout", 55);
                deckButton = makeButton(decks.length + " decks", "!survey --decks", 150) + makeButton("handout", "!survey --decks makehandout", 55);
                trackButton = makeButton(tracks.length + " jukebox tracks", "!survey --tracks", 150) + makeButton("handout", "!survey --tracks makehandout", 55);
                playerButton = makeButton(players.length + " players", "!survey --players</i>", 150) + makeButton("handout", "!survey --players makehandout", 55);
                everythingButton = makeButton("Entire Campaign", "!survey --characters handouts pages tables decks macros tracks players graphics", 150) + makeButton("handout", "!survey --characters handouts pages tables decks macros tracks players makehandout", 55);
                helpButton = makeButton("Help", "!survey --help", 150) + makeButton("handout", "!survey --help makehandout", 55);
                let infoButton = `<a style = 'float: right' href = '!survey --sendtext|${helpLabel}'')'>Help</a>`;
                helpLabel = `<div style = 'float:right; display:inline-block; background-color:white; border-radius:8px;'><a style = 'color: red' href = '!survey --help'>&nbsp;?&nbsp;</a></div>`

                lines = `${openHeader}Campaign Survey:${closeHeader}${characterButton}<br>${attributeButton}<br>${abilityButton}<br>${pageButton}<br>${dlPageButton}<br>${graphicButton}<br>${handoutButton}<br>${macroButton}<br>${tableButton}<br>${textButton}<br>${deckButton}<br>${trackButton}<br>${playerButton}<br>${everythingButton}<br>${helpButton}<br>${reportHandoutButton}`;
                break;
            default:
        }
    });

    if (lines) {
        if (commands.includes('makehandout')) {

            lines = campaignTitleBox + lines;

            reportHandout.get("notes", function(notes) {
                reportHandout.set("notes", lines);
            });
        } else {
            sendChat("Campaign Survey", `/w gm ${openReport}${campaignTitleBox}${lines}${closeReport}`, null, {
                noarchive: true
            });

        }
    }

});
