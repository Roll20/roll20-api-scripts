var API_Meta = API_Meta || {};
API_Meta.Faces = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Faces.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}

on('ready', () => {
    const version = '0.1.1';

    on('chat:message', (msg_orig) => {
        let msg = _.clone(msg_orig);
        if (!/^!faces/.test(msg.content) || msg.content.length === 6) {
            return;
        }
    
        const openReport = "<div style='color: #000; border: 1px solid #000; background-color: #ccc; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 2px; font-family: sans-serif; white-space: pre-wrap;'>";
        const closeReport = '</div>';
        const openHeader = "<div style='font-weight:bold; color:#fff; background-color:#404040; margin:0px 3px 3px 0px; padding:3px;'>"
        const closeHeader = `</div>`;
        const openButton = "<div style='clear:left; display:inline-block; height: 87px; text-align:center; background-color:#404040; color: #eee; padding: 2px 2px 0px 2px; border-width:1px; border-style: groove; border-radius:43px 43px 3px 3px; margin-right:3px; overflow: hidden'>";
        const openNotesButton = "<div style='clear:left; display:inline-block; height: 87px; text-align:left;   background-color:#404040; color: #eee; padding: 2px 2px 0px 2px; border-width:1px; border-style: groove; border-radius:40px  3px 3px 3px; margin-right:3px; overflow: hidden'>";
        const closeButton = `</div>`;
        const buttonStyle = `'display: block; text-align:center; padding:0px 5px; margin:10px 0px 0px 0px; color: #eee; background-color:##404040; border-radius:10px'`;
        const helpButtonStyle = `'display: block; text-align:center; padding:0px 5px; margin:4px 0px 0px 0px; color: #eee; background-color:##404040; border-radius:10px'`;
        const noteButtonStyle = `'display: block; float:right; font-size:11px; line-height:11px; text-align:center; padding:0px 2px 0px 6px; margin:2px 0px 0px 2px; color: #333; background-color:#aaa; border-width:0px; border-radius:10px 0px 0px 10px'`;
        const noteDeleteButtonStyle = `'display: block; float:right; font-size:11px; line-height:11px; text-align:center; padding:0px 6px 0px 2px; margin:2px 2px 0px px; color: #333; background-color:#aaa; border-width:0px; border-radius:0px 10px 10px 0px'`;
    
    
        let whom = ((!playerIsGM(msg.playerid)) ? `"${msg.who}"` : "gm ");
        let arg = msg.content.split('!faces ')[1];
        let imgSrc = "";
        let tableName = "";
        let itemName = "";
        let addName = "";
        let argType = "";
        let validTable = true;
        let tokens = [];
        let tokenID = "";
        let newName = "";
        let output = "";
        let noteButtons = "";
        let style = "";
        let filterTerm = "";
        let helpText = {
    
            toc: "This script is designed to provide a quick visual interface for swapping token images and names, as well as for quickly making rollable tables from an existing set of tokens, both simple and multisided. The interface will work for both players and GMs.<BR><HR>" +
                makeHelpButton("Calling faces from Rollable Table", "!faces help2") +
                makeHelpButton("Filtering Results", "!faces help3") +
                makeHelpButton("Calling Faces from Token", "!faces help4") +
                makeHelpButton("Adding a Face", "!faces help5") +
                makeHelpButton("Assigning a Random Face", "!faces help6"),
    
            table: "The script calls names and images from any rollable table that has a name and image for each entry:<BR>" +
                "<img style='max-width:50%;' src='https://s3.amazonaws.com/files.d20.io/images/278951608/i1sRO15kebeQgyFpUeEPkA/original.png'><BR>" +
                "To call up the chat interface, use !faces [tablename]. For the above example:<BR>" +
                "<code>!faces Portraits</code> builds this in chat:<BR>" +
                "<img style='max-width:50%;' src='https://s3.amazonaws.com/files.d20.io/images/278951919/BgDMCm9KTPUGnbXvKFoBsw/original.png'><BR>" +
                "This menu is visible only to the person issuing the command, so it shouldn't spam the interface. The interface is non-persistent as well, so it will not leave litter in the Chat Archive or persist from game to game.<BR>" +
                "Clicking an image will assign that image to any selected token.<BR>" +
                "Clicking the name will likewise change the token's name.",
    
            filter: "After the name of the table, and separated by a space, you can use a the word 'filter' followed by a vertical pipe and one or more keywords.This will only show results from a table if the table item name includes whatever comes after 'filter|'. Multiple keywords can be used. In order for an item to display, it must satisfy all keywords.<BR>" +
                "<i>Example:</i> if you have a table named 'Warriors' that includes:<BR>" +
                "<ul><li>elf archer 1<BR>" +
                "<li>elf archer 2<BR>" +
                "<li>human archer<BR>" +
                "<li>elf wizard<BR>" +
                "<li>dwarf mage<BR></ul>" +
                "<code>!faces Warrior filter|archer</code> will only return entries for<BR>" +
                "<ul><li>elf archer 1<BR>" +
                "<li>elf archer 2<BR>" +
                "<li>human archer</ul>" +
                "<code>!faces Warrior filter|archer elf</code> will only return entries for<BR>" +
                "<ul><li>elf archer 1<BR>" +
                "<li>elf archer 2</ul>" +
                "A good use for this might be a table of commoners that includes elves, humans and dwarves. When you are in a large cosmopolitan area, you might want to choose from the whole table. If you are in the elven forest of Shmothlorien, you might only want the elf entries.<BR>" +
                "<img style='max-width:70%;' src='https://s3.amazonaws.com/files.d20.io/images/307913133/qkpgGRPt_R_azDhw72l6Zw/med.png'>",
    
            token: "If you have an existing rollable token on the VTT, you can select it and type<BR>" +
                "!faces existing<BR>" +
                "This will use the same interface as described above, but the token faces will come from the token if it is a rollable table token. It will not display name or token notes in the dialog box, since those would be identical (it's a single token).<BR>" +
                "<img style='max-width:95%;' src='https://s3.amazonaws.com/files.d20.io/images/307912270/zcBT0z6ZTFICWtTLZ2DZrw/med.png'>",
    
            add: "Clicking the button [Add an image to this table] will prompt the user to target a token on the VTT, and ask for a name. The resulting name and image will form a new entry in the rollable table:<BR>" +
                "<img style='max-width:50%;' src='https://s3.amazonaws.com/files.d20.io/images/278952222/WVkSJkFSvKRmHcxRYbyIAQ/med.png?1649038842'><BR>" +
                "[Display this table] is the same as issuing the !faces command for the rollable table, showing not just the new token face, but all tokens on the rollable table.<BR>" +
                "[Add another image to this table] repeats the process as above.<BR>" +
                "<BR><b>Adding images to a rollable table in bulk</b><BR>" +
                "This method will allow you to grab a token or group of tokens on the VTT and use their faces to create a new rollable table or to append their faces to an existing table. All newly added faces are titled 'Item_1','Item_2', and so on. It will not overwrite existing entries on the table, and it does not check for duplicates. If the table does not exist, it will create one.<BR>" +
                "<img style='max-width:50%;' src='https://s3.amazonaws.com/files.d20.io/images/307911483/e3fpB5Hmi1aIp9RZ3efAPA/med.png'><BR>" +
                "<code>!faces create Commoners</code><BR>" +
                "This will create a table called 'Commoners' if none exists, and add all the faces of any selected tokens to the table. It any of the selected tokens are multi-sided, it will add each face in the token to the table.<BR>" +
                "<img style='max-width:50%;' src='https://s3.amazonaws.com/files.d20.io/images/307911485/9OV78wfbXHoKqrcl-dqoRA/med.png'>",
    
            random: "The title bar of the token images display has a little 'Random Image' button:  <span style='font-family:Pictos'> ; </span>.<BR>If you press this button while selecting one or more tokens, the script will assign random images to each of the selected icons. Currently this only works from images pulled from a rollable table, but in the will eventually also work with images generated by existing rollable token images.<BR>" +
                "<img style='max-width:90%;' src='https://s3.amazonaws.com/files.d20.io/images/308082395/NVeWI8JNLVbU5csxWa3syQ/med.png'>"
        };
    
        const randomImageButton = "<a href = '!faces images/random " + tableName + "' style = 'display:inline-block; float:right; background-color:transparent; border:none; font-family: pictos; color:#ddd'>;</a>";
    
    
        if (msg.content.match(/!faces help(\d)*$/)) {
            let helpKey = msg.content.split("!faces help")[1]
            //if (helpKey === ""){helpKey="toc"};
    
            switch (helpKey) {
                case '1':
                    chatBox('Faces: Help', helpText.toc);
                    break;
                case '2':
                    chatBox('Faces: Assigning images to token from a rollable table', helpText.table);
                    break;
                case '3':
                    chatBox('Faces: Filtering results', helpText.filter);
                    break;
                case '4':
                    chatBox('Faces: Displaying faces on token', helpText.token);
                    break;
                case '5':
                    chatBox('Faces: Adding a face', helpText.add);
                    break;
                case '6':
                    chatBox('Faces: Assigning a random face', helpText.random);
                    break;
                default:
                    chatBox('Faces: Topics', helpText.toc);
            }
            return
        }
    
        if (msg.content.includes("filter|")) {
            filterTerm = msg.content.split(/filter\|/)[1].match(/\b[-?(\w+)?]+\b/gi);
            msg.content = msg.content.split(/ filter\|/)[0];
            arg = msg.content.split('!faces ')[1];
        }
    
    
        if (arg.includes("images/")) {
            argType = "image";
            imgSrc = 'https://s3.amazonaws.com/files.d20.io/' + arg;
    
        } else {
            if (msg.content.includes("!faces add ")) {
                argType = "add";
                addName = msg.content.split(/^!faces add /)[1].split(/ to /)[0];
                tableName = msg.content.split(/^!faces add .* to /)[1].split(/ using /)[0];
                tokenID = msg.content.split(/^!faces add .* using /)[1];
    
            } else {
                if (msg.content.includes("!faces name ")) {
                    argType = "name";
                    newName = msg.content.split(/^!faces name /)[1];
                } else {
                    if (msg.content.includes("!faces tokennote ")) {
                        argType = "tokennote";
                        newName = msg.content.split(/^!faces tokennote /)[1];
                    } else {
                        if (msg.content.includes("!faces tooltip ")) {
                            argType = "tooltip";
                            newName = msg.content.split(/^!faces tooltip /)[1];
                        } else {
                            if (msg.content.includes("!faces compact ")) {
                                argType = "table";
                                style = "compact";
                                tableName = arg.split('compact ')[1];
                            } else {
                                if (msg.content.includes("!faces create ")) {
                                    argType = "create";
                                    tableName = arg.split('create ')[1];
                                } else {
                                    if (msg.content.includes("!faces existing")) {
                                        argType = "tokenFaces";
                                        tableName = "tokenFaces";
                                    } else {
                                        argType = "table";
                                        tableName = arg
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    
    
        function makeImage(url, itemNote) {
            imageCode = url.split('d20.io/')[1].replace(/thumb\.|med\.|max\.|original\./, 'thumb' + '.') || url;
            if (style === 'compact') {
                return `<a href='!faces ${imageCode}' style='width: 35px; height:35px; margin: 0px; padding: 0px; background-color:transparent; border:none'><img src='${url}'></a>`
            } else {
                if (!itemNote) {
                    return `<a href='!faces ${imageCode}' style='width: 70px; height: 70px; margin: 0px; padding: 0px; background-color:transparent; border:none'><img src='${url}'></a>`
                } else {
                    return `<div><a href='!faces ${imageCode}' style='float:left; width: 70px; height: 70px; margin: 0px; padding: 0px; background-color:transparent; border:none'><img src='${url}'></a><div style='display:inline-block; float:left; margin-left:5px; font-size:11px; line-height:12px; height:60px; width:130px;overflow:hidden'>${itemNote}</div></div>`
                }
            }
    
        }
    
        function makeChangeNameButton(name, itemNote) {
            if (!itemNote) {
                return "<div style='clear:both '><a style = 'max-width: 70px;white-space: nowrap;  overflow: hidden;  text-overflow: ellipsis; background-color: transparent; padding: 0px; margin:0px; border:none; color:#eee'        title='" + name + "'      href='!faces name " + name + "'>" + name + "</a></div>"
            } else {
                return "<div style='clear:both '><a style = 'background-color: transparent; padding: 0px; margin:0px; border:none; color:#eee; align:left;' href='!faces name " + name + "'>" + name + "</a><a style = " + noteDeleteButtonStyle + "href = '!faces tooltip -'>x</a><a style = " + noteButtonStyle + "href = '!faces tooltip " + itemNote + "'>tooltip</a><a style = " + noteDeleteButtonStyle + "href = '!faces tokennote -'>x</a><a style = " + noteButtonStyle + "href = '!faces tokennote " + itemNote + "'>notes</a></div>";
            }
        }
    
        function makeNotesArea(note) {
            return '';
        }
    
    
    
        function makeHelpButton(name, link) {
            theButton = "<a style=" + helpButtonStyle + "href='" + link + "'>" + name + "</a>";
    
            //theButton = "<a style='background-color:#303030; color:white; display:inline-block; margin:4px 0px 0px 5px; width:85%; padding: 2px 5px 2px 5px; border:solid; border:0px; border-radius:10px;' href='"+link+"'>"+name+"</a>"
            return theButton;
        }
    
        function chatBox(title, text) {
            if (text) {
                sendChat('Faces', `/w ${whom}` + openReport + openHeader + title + closeHeader + text + closeReport, null, {
                    noarchive: true
                });
            } else {
                sendChat('Faces', `/w ${whom}` + openReport + title + closeReport, null, {
                    noarchive: true
                });
            }
        }
    
        switch (argType) {
            case 'table':
            case 'add':
    
    
                let tables = findObjs({
                    type: 'rollabletable',
                    name: tableName
                });
                if (tables.length < 1) {
                    sendChat('Faces', `/w ${whom}` + openReport + openHeader + tableName + randomImageButton + closeHeader + "No table by this name. For this script to work you must use the name of a table that has an image and name for every table item." + closeReport, null, {
                        noarchive: true
                    });
                    return;
    
                }
    
                tables = tables[0];
    
                let output = "";
                let tableitems = findObjs({
                    type: 'tableitem',
                    _rollabletableid: tables.get('_id'),
                });
    
                if (filterTerm.length > 0) {
                    filterTerm.forEach(ft => {
                        tableitems = tableitems.filter(function(t) {
                            return t.get("name").includes(ft);
                        });
                    });
                }
    
    
                tableitems.forEach(t => {
    
    
                    itemAvatar = t.get('avatar');
                    if (itemAvatar.length < 1) {
                        validTable = false
                    }
                    itemName = t.get(('name')).split('--')[0] || t.get(('name'));
                    itemNote = '';
                    if (t.get('name').includes(' --')) {
                        itemNote = t.get(('name')).split('--')[1];
                    }
                    if (itemNote.length > 1) {
                        noteButtons = `<a style = ${noteButtonStyle} href = '!tooltip'>tooltip</a>`;
                    } else {
                        noteButtons = "";
                    }
                    if (itemName.length < 1) {
                        validTable = false
                    }
                    if (validTable) {
                        output = output + `${((itemNote) ? openNotesButton : openButton)}${makeImage(itemAvatar, itemNote)}<BR>${makeChangeNameButton(itemName, itemNote)}${noteButtons}${closeButton}`;
                    } else {
                        output = "Not a valid table. For this script to work you must use the name of a table that has an image and name for every table item.";
                    }
                });
                if (validTable) {
                    output = output + "<br><a style=" + buttonStyle + "href='!faces add ?{name} to " + tableName + " using &#64;{target|token_id}'> Add an image to this table.</a>"
                }
    
    
                let header = `${openHeader}${tableName}${randomImageButton}${closeHeader}`;
    
                if (argType === "add") {
                    if (tokenID !== "") {
                        tokens = getObj('graphic', tokenID)
                    }
                    if (!tokens.get("imgsrc").includes("marketplace")) {
                        createObj('tableitem', {
                            name: addName,
                            _rollabletableid: tables.get('_id'),
                            avatar: tokens.get("imgsrc"),
                        });
                        output = addName + " added to " + tableName + ".<BR>" + `${openButton}${makeImage(tokens.get("imgsrc"))}<BR>${addName}${closeButton}`;
                        output = output + "<br><a style=" + buttonStyle + "href='!faces " + tableName + "'> Display this table.</a>";
                        output = output + "<a style=" + buttonStyle + "href='!faces add ?{name} to " + tableName + " using &#64;{target|token_id}'> Add another image to this table.</a>";
    
                    } else {
                        output = "API scripts cannot affect marketplace images";
                    }
                }
    
                sendChat('Faces', `/w ${whom}` + openReport + header + output + closeReport, null, {
                    noarchive: true
                });
    
                break;
    
    
    
                //################### Existing Token Faces ###############
            case 'tokenFaces':
                if (undefined !== msg.selected) {
                    token = msg.selected
                        .map(o => getObj('graphic', o._id))
                        .filter(o => undefined !== o)[0]
    
    
                    let sides = token.get("sides");
                    if (sides.length < 1) {
                        sides = token.get("imgsrc")
                    }
    
                    let tableitems = sides.split('|');
                    tableName = "Faces for " + ((token.get('name')) ? (token.get('name')) : "Unnamed Token");
    
                    let output = '';
                    tableitems.forEach(t => {
                        itemAvatar = decodeURIComponent(t);
    
                        itemName = token.get('name');
                        itemNote = '';
                        noteButtons = "";
                        //output = output + `${((itemNote) ? openNotesButton : openButton)}${makeImage(itemAvatar, itemNote)}<BR>${makeChangeNameButton(itemName, itemNote)}${noteButtons}${closeButton}`;
                        output = output + `${((itemNote) ? openNotesButton : openButton.replace("height: 87px","height: 74px"))}${makeImage(itemAvatar)}${closeButton}`;
    
                    });
    
    
    
                    let header = `${openHeader}${tableName}${closeHeader}`;
    
    
                    sendChat('Faces', `/w ${whom}` + openReport + header + output + closeReport, null, {
                        noarchive: true
                    });
    
                }
    
                break;
    
    
                //################### Assign Token Faces ###############
    
            case 'image':
    
                if (undefined !== msg.selected) {
                    tokens = msg.selected
                        .map(o => getObj('graphic', o._id))
                        .filter(o => undefined !== o)
                    let randomImage = 0;
                    tokens.forEach(t => {
                        if (t.get("type") === 'graphic') {
                            if (imgSrc.includes('https://s3.amazonaws.com/files.d20.io/images/random')) {
                                tableName = imgSrc.split('https://s3.amazonaws.com/files.d20.io/images/random ')[1];
                                let tables = findObjs({
                                    type: 'rollabletable',
                                    name: tableName
                                });
                                if (tables.length < 1) {
                                    sendChat('Faces', `/w ${whom}` + openReport + openHeader + tableName + closeHeader + "No table by this name. For this script to work you must use the name of a table that has an image and name for every table item." + closeReport, null, {
                                        noarchive: true
                                    });
                                    return;
                                }
    
                                tables = tables[0];
    
                                tableItems = findObjs({
                                    type: 'tableitem',
                                    _rollabletableid: tables.id
                                });
    
                                randomImage = tableItems[Math.floor(Math.random() * tableItems.length)].get("avatar")
                                    .replace(/thumb\.|med\.|max\.|original\./, 'thumb' + '.');
    
                                newImgSrc = randomImage;
                                t.set("imgsrc", newImgSrc);
    
                            } else {
                                t.set("imgsrc", imgSrc);
                            }
    
                        }
                    });
                } else {
                    sendChat('Faces', `/w ${whom}` + openReport + 'You must select a token you control in order to change the face.' + closeReport, null, {
                        noarchive: true
                    });
                }
    
                break;
            case 'name':
                if (undefined !== msg.selected) {
                    tokens = msg.selected
                        .map(o => getObj('graphic', o._id))
                        .filter(o => undefined !== o)
                    tokens.forEach(t => {
                        if (t.get("type") === 'graphic') {
                            t.set("name", newName);
                        }
                    });
                }
                break;
            case 'tokennote':
                if (newName === '-') {
                    newName = ''
                };
                if (undefined !== msg.selected) {
                    tokens = msg.selected
                        .map(o => getObj('graphic', o._id))
                        .filter(o => undefined !== o)
                    tokens.forEach(t => {
                        if (t.get("type") === 'graphic') {
    
                            t.set({
                                gmnotes: newName
                            });
    
    
                        }
                    });
                }
                break;
            case 'tooltip':
                if (newName === '-') {
                    newName = ''
                };
    
                if (undefined !== msg.selected) {
                    tokens = msg.selected
                        .map(o => getObj('graphic', o._id))
                        .filter(o => undefined !== o)
                    tokens.forEach(t => {
                        if (t.get("type") === 'graphic') {
                            t.set("tooltip", newName);
                        }
                    });
                }
                break;
            case 'create':
                let newTable = tableName;
                let allTables = findObjs({
                    type: 'rollabletable',
                    name: tableName
                });
                let tokenFaces = "";
                let theFace = ""
                let tableFaces = [];
                let i = 0
                if (!msg.selected || msg.selected.length < 1) {
                    sendChat("faces", "/w gm You must select a token with at least one face.");
                    return
                }
    
                tokens = msg.selected
                    .map(o => getObj('graphic', o._id))
                    .filter(o => undefined !== o);
    
                tokens.forEach(t => {
                    if (t.get("type") === 'graphic') {
                        tokenFaces = decodeURIComponent(t.get("sides")).split("|");
                        if (tokenFaces.length === 1) {
                            tokenFaces = t.get("imgsrc").split("|");
                        }
                    }
                    if (allTables.length < 1) {
                        tableName = tableName.replace(" ", "-");
                        chatBox(tableName, "Creating new table.")
    
    
                        createObj('rollabletable', {
                            name: tableName
                        });
                        allTables = findObjs({
                            type: 'rollabletable',
                            name: tableName
                        });
                    }
    
                    if (i < 1) {
                        chatBox("Adding faces.")
                    }
    
                    tableID = allTables[0].get("id");
    
                    tokenFaces.forEach(tf => {
                        i++;
                        createObj('tableitem', {
                            name: 'Item_' + i,
                            avatar: tf,
                            _rollabletableid: tableID
                        });
                    });
                });
    
    
                break;
            default:
                log(`nothing happens here.`);
        }
    });
    log('Faces v' + version + ' is ready! --offset ' + API_Meta.Faces.offset + ' -- Use the command !faces [Rollable Table Name] to get started');
});
