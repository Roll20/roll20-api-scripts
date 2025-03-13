//NEEDED CHANGES
// https://app.roll20.net/private_message/m/6013942/reporter-api/#message-6014434
// Referende the disabled Dev copy. I think I started making Jumpgate 5e2024 changes.

// Reporter
// Last Updated: 2021-03-26
// A script to report token and character calls in a list.
// Syntax is !report --[t|token_attribute] [c|character_attribute]... ---macro code for each character
var API_Meta = API_Meta || {};
API_Meta.Reporter = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
}; {
    try {
        throw new Error('');
    } catch (e) {
        API_Meta.Reporter.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - (4));
    }
}


on('ready', function () {
    if (!_.has(state, 'Reporter')) {
        state.Reporter = {
            sheet: 'Other',
        };
        message = 'Welcome to Reporter! If this is your first time running it, the script is set to assume that no sheet is being used. Reporter will run much better if you choose which sheet you are using. Currently the D&D 5th Edition by Roll20 Sheet and Pathfinder 2 by Roll20 are fully supported. You may have diminished capability with other sheets<BR><BR>[D&D 5th Edition by Roll20](!report --config|D&D 5th Edition by Roll20)<BR>[D&D 5E Shaped](!report --config|D&D 5E Shaped)<BR>[Pathfinder First Edition by Roll20](!report --config|Pathfinder First Edition by Roll20)<BR>[Pathfinder Second Edition by Roll20](!report --config|Pathfinder Second Edition by Roll20)<BR>[Other](!report --config|Other)';
        sendChat('Reporter', '/w gm &{template:default}{{ =' + message + '}}');
    }
});




on('ready', () => {
    const version = '1.1.9'; //version number set here
    log('-=> Reporter v' + version + ' is loaded. Internal commands of !RPping, !RPpage-mod, !RPechochat, and !RPchangelayer are used in code.');
    //sendChat('Reporter', '/w gm Ready');

    const L = (o) => Object.keys(o).forEach(k => log(`${k} is ${o[k]}`));
    const tokenChar = '<span style="color: #fff; font-weight: bold; background-color: #b30000; padding:0px 2px; margin-right:3px;">T</span>';
    const characterChar = '<span style="color: #fff; font-weight: bold; background-color: #004080; padding:0px 2px; margin-right:3px;">C</span>';
    const GMChar = '<span style="color: #CBE1EE; font-weight: bold; background-color: #0b7bb8; padding:0px 2px; margin-right:3px;border-radius:2px;">GM</span>';
    const TKChar = '<span style="color: #CBDCD2; font-weight: bold; background-color: #106837; padding:0px 2px; margin-right:3px;border-radius:2px;">TK</span>';
    const DLChar = '<span style="color: #eee; font-weight: bold; background-color: #cc8900; padding:0px 2px; margin-right:3px;border-radius:2px;">DL</span>';
    const MPChar = '<span style="color: #F1C5DF; font-weight: bold; background-color: #e7339d; padding:0px 2px; margin-right:3px;border-radius:2px;">MP</span>';
    const menuChar = `<a href='!report --menu' style='float:right; decoration:none; background-color: transparent; border: none; color: #fff; padding:0px 2px; font-family: pictos; margin-top:1px; margin-right:1px; !important'>l</a>`;
    const printChar = '<span style="color: #000">P</a>';
    const printButtonStyle = "'float:right; color: #000; font-weight:bold; color: white;text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000; font-family: pictos; border:none; background-color: transparent; padding:0px 2px; margin-right:3px !important'";
    const notesButtonStyle = "'float:right; color: white; font-size: smaller; font-weight:bold; border:none; background-color: #999; padding:0px 2px; margin-right:3px; border-radius:2px; !important'";
    const rowButtonStyle = "'float:right; font-size: smaller; border:none; display:inline-block; overflow: hidden; !important'";
    const buttonStyle = "'background-color: transparent;padding: 0px;color: #ce0f69;display: inline-block;border: none; !important'";
    const headerButtonStyle = '"background-color: #ccc; padding: 0px 3px; border-radius:2px;color: black; display: inline-block;border: none; !important"';
    const openHeader = "<div style='font-weight:bold; color:#fff; background-color:#404040; margin-right:3px; padding:3px;'>"
    const closeHeader = '</div>';
    const closeReport = '</div>';
    const linkBox = "<img src = 'https://s3.amazonaws.com/files.d20.io/images/227379729/jnwjD5rKjjr9QqGiy8EATg/original.png'";
    const baseOpenReport = "<div style='color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
    let sheet = state.Reporter.sheet;
    let openReport = baseOpenReport;
    
    function makeButton(name, link) {
        return '<a style = ' + buttonStyle + ' href="' + link + '">' + name + '</a>';
    }


function toDeci(fraction) {
    if(undefined === fraction){return "0 or undefined"};
    fraction = fraction.toString();
    var result,wholeNum=0, frac, deci=0;
    if(fraction.search('/') >=0){
        if(fraction.search('-') >=0){
            wholeNum = fraction.split('-');
            frac = wholeNum[1];
            wholeNum = parseInt(wholeNum,10);
        }else{
            frac = fraction;
        }
        if(fraction.search('/') >=0){
            frac =  frac.split('/');
            deci = parseInt(frac[0], 10) / parseInt(frac[1], 10);
        }
        result = wholeNum+deci;
    }else{
        result = fraction
    }

    return result;
}


    let actionButtons = [];

    L({ sheet });




    let npcLookup = undefined;
    // This sections swaps npc and pc sheet attributes as needed on the Pathfinder Second Edition by Roll20 and D&D 5th Edition by Roll20 Sheet
    switch (sheet) {
        case "Pathfinder Second Edition by Roll20":
            npcLookup = {
                ["ac"]: "armor_class",
                ["repeating_senses_$0_sense"]: 'senses'
            }
            break;
        case "Pathfinder First Edition by Roll20":
            npcLookup = {
                ["race"]: "npc_type",
                ["level"]: "npc_cr"
            }
            break;
        case "D&D 5E Shaped":
            npcLookup = {
                ["name"]: "name",
            }
            break;
        case "D&D 5th Edition by Roll20":
            npcLookup = {
                ["name"]: "npc_name",
                ["ac"]: "npc_ac",
                ["level"]: "npc_challenge",
                ["passive_wisdom"]: "npc_senses"
            }
            break;
        default:
            npcLookup = { ["name"]: "name" }
    }


    const pcLookup = Object.keys(npcLookup).reduce((m, k) => ({
        [npcLookup[k]]: k,
        ...m
    }), {});

    const npcSwap = (attribute, npc) => {
        if (undefined !== npc) {
            let l = ("1" === npc) ? npcLookup : pcLookup;
            //if (sheet === "Pathfinder Second Edition by Roll20" && attribute === "name") l[attribute] = "name";
            return l[attribute] || attribute;
        }
        return attribute;
    };



    //Uncomment out this line for Prod
    function menu() {
        sendChat('Reporter', '/w gm ' + openReport + openHeader + menuChar +
            '**Reporter Menu**<BR>' +
            closeHeader + '<div style =   "padding-left: 10px; text-indent: -10px; "> ' +
            "Use the commands below for specialized tasks. you can use the text of the commands as presented in other macros, or just click on the buttons in this menu.<BR>" +
            makeButton("!report --vision ---vision", "!report --vision ---vision") + ' - Use this command to check the vision of selected tokens. If you have no selected tokens, it will return a report of all tokens on the Token/Objects layer.<BR>' +
            makeButton("!report|vision", "!report|vision") + ' - Shorthand for the above command. *--vision* and *---vision* are special keywords that can be used as substitutes in any reporter macro.<BR>' +
            makeButton("!report --light ---light", "!report --light ---light") + ' - Use this command to check the lighting of selected tokens. If you have no selected tokens, it will return a report of all tokens on the Token/Objects layer.<BR>' +
            makeButton("!report --light ---lightplus", "!report --light ---lightplus") + ' - A more detailed version of the above, with most common light sources.<BR>' +
            makeButton("!report|light", "!report|light") + ' - Shorthand for the above command. *--light*, *---light* and *---lightplus* are special keywords that can be used as substitutes in any reporter macro.<BR>' +
            makeButton("!report|help", "!report --help") + ' - Use this command display the documentation for the Reporter script. Also accepts *!report --help*<BR>' +
            makeButton("!report|mapkeys", "!report|mapkeys") + ' - Use this command to display a list of all objects on the gm layer that represent a character called *Map Key* You can use this to navigate around a map quickly and call up any token notes that might be placed in the Map Key tokens.<BR>' +
            makeButton("!report|mapkeys_sorted", "!report|mapkeys_sorted") + ' - As above, but sorted alphabetically.<BR>' +
            makeButton("!report|pcs-detail", "!report|pcs-detail") + ' - A detailed display of all PCs on the map.<BR>' +
            makeButton("!report|pcs", "!report|pcs") + ' - A compact display of all PCs on the map.<BR>' +
            makeButton("!report|npcs-detail", "!report|npcs-detail") + ' - A detailed display of all NPCs on the map.<BR>' +
            makeButton("!report|npcs-actions", "!report|npcs-actions") + ' - A compact display of all NPCs on the map with most token action buttons displayed. Works very well with the Token Action Maker script.<BR>' +
            makeButton("!report|tracker", "!report|tracker") + ' - A compact display of all characters in the Turn Tracker.<BR>' +
            makeButton("!report|tracker-actions", "!report|tracker-actions") + ' - A  display of all characters in the Turn Tracker with most token action buttons displayed.<BR>' +
            makeButton("!report|report", "!report --report") + ' - How to read the report. Also accepts *!report --report*' +
            makeButton("!report --config|sheet", "!report --config|sheet") + ' - Configure reporter to a particular sheet.' +
            '</div>' +
            closeReport, null, {
            noarchive: true
        });
    }
    //menu();

    function cleanup(attribute) {
        if (undefined !== attribute) {
            return attribute.toString().toLowerCase()
        } else {
            return attribute
        }
    }
    function sendMessage(message) {
        sendChat('Reporter', '/w gm ' + baseOpenReport + message + closeReport, null, { noarchive: true });

    }

    function help() {
        sendChat('Reporter', '/w gm ' + openReport + openHeader + menuChar +
            '**Reporter**' + '<BR>' +
            `<span style='font-weight:normal;'>Documentation for v.${version}</span>${closeHeader}` + '<BR>' +
            `${makeButton('How to read the report', '!report --report')}` + '<BR>' +
            `Reporter is a script that reads the tokens on the board that are associated with character sheets and builds a report of them in the chat, returning selected values from either the token settings or the character sheets they are associated with. You can either select a set of tokens to work with, or if you select *no* tokens, it will assume all tokens on the Object/Token layer. This behavior can be altered using *keywords*, described below. The basic syntax is:` + '<BR>' +
            '<BR>' +
            `<code>!report --[queries] ---[buttonline] ----[keywords]</code>` + '<BR>' +
            '<BR>' +
            `**Queries**` + '<BR>' +
            `Queries are constructed using` + '<BR>' +
            `<code>t|attribute</code> to poll a token attribute` + '<BR>' +
            `<code>c|attribute</code> to poll a character sheet attribute` + '<BR>' +
            '<BR>' +
            `*Examples*` + '<BR>' +
            `<code>--t|name</code> would return a report of all selected token names` + '<BR>' +
            `<code>--c|strength</code> would return a report of all strength values on the character sheets of the selected tokens` + '<BR>' +
            '<BR>' +
            `For character sheets, the script will try to pull a value from the character journal first, and if that does not exist, the installed character sheet.` + '<BR>' +
            '<BR>' +
            `*Aliases*` + '<BR>' +
            `There are times in the report when you would not like 'has_bright_light_vision' in the report. You can substitute an alias for the attribute name that will display in chat. For this, just add another pipe after the query and type an alias.` + '<BR>' +
            '<BR>' +
            `For example, if a token has 60 feet of Night Vision:` + '<BR>' +
            `<code>t|night_vision_distance</code>` + '<BR>' +
            `might produce:` + '<BR>' +
            `${tokenChar}: night_vision_distance = 60` + '<BR>' +
            `but` + '<BR>' +
            `<code>t|night_vision_distance?NV</code>` + '<BR>' +
            `would yield:` + '<BR>' +
            `${tokenChar}: NV= 60` + '<BR>' +
            '<BR>' +
            `**Buttonline**` + '<BR>' +
            `The buttonline is a string containing text and Ability or API Command buttons. These are formed using the normal syntax for such things with a few exceptions.` + '<BR>' +
            `In order to keep the Roll20 parser from resolving queries and attribute calls before the script gets them, they need to be written slightly differently.` + '<BR>' +
            `Examples:` + '<BR>' +
            `<code>@{token|name}</code> is written as <code>A{token|name}</code>` + '<BR>' +
            `<code>?{question|default_answer}</code> is written as <code>Q{question|default_answer}</code>` + '<BR>' +
            '<BR>' +
            `Further, for a handful of scripts, the Reporter API will attempt to parse the code so that each buttonline refers to the specific token being reported on. Currently Token Mod, ChatSetAttr, and Supernotes are supported.` + '<BR>' +
            '<BR>' +
            `**Filters**` + '<BR>' +
            `There are four types of operator.` + '<BR>' +
            `<code>+</code> only includes the token/character pairs that matches the query` + '<BR>' +
            `<code>-</code> excludes any token/character pair that exactly matches the query` + '<BR>' +
            `<code>~</code> only includes any character that is a partial match for the query` + '<BR>' +
            `<code>^</code> excludes any character that is a partial match for the query` + '<BR>' +
            `thus:` + '<BR>' +
            `<code>!report||-|c|name|Goblin</code> will return all tokens that are not represented by the Goblin character sheet.` + '<BR>' +
            `<code>!report||~|c|name|Goblin</code> will return any tokens that are represented by the Goblin or Hobgoblin character sheet.` + '<BR>' +
            `<code>!report||-|c|npc|1||+|t|</code> has_night_vision|true will exclude all NPCs (leaving only PCs), and then only return those that have nightvision set.` + '<BR>' +

            +'<BR>' +
            `Filters do not support an alias, because they are never displayed in the final report.` + '<BR>' +
            `Filters are executed sequentially, with each filter working on the result from the last, so some logic is required for best results.` + '<BR>' +
            `Filters are case insensitive.` + '<BR>' +
            `There is as yet, no way to test for an empty, or undefined value.` + '<BR>' +
            '<BR>' +
            `**Special Codes**` + '<BR>' +
            `Reporter contains a few special codes for common cases, to make macro writing easier. You can put thes in place of normal commands:` + '<BR>' +
            `<code>--vision</code>as the Query will replace any declared query line with one designed to report most vision situations. It will give values for whether the token has sight, night vision and what the distance of any night vision is.` + '<BR>' +
            `<code>---vision</code> as the Buttonline will replace any declared button line with a buttonline designed to handle most cases of vision and darkvision.` + '<BR>' +
            `<code>--light</code> as the Query will replace any declared query line with one designed to report most lighting situations. It will give values for the amount of light, distance and what type.` + '<BR>' +
            `<code>---light</code> as the Buttonline will replace any declared button line with a buttonline designed to handle most cases of lighting.` + '<BR>' +
            `<code>---actions</code> as the Buttonline will replace any declared button line with a buttonline made up of the token action buttons associate with the character. This is designed for synergy with the Token Action Maker script, but is not essential. Not that the token actions created by this command cannot contain roll templates and will not convert the %{selected|commandname} structure. this requires very careful parsing and is best avoided. It should work flawlessly with Token Action Maker commands, with the exception of the "Check" and "Save" buttons, for the reasons just mentioned.` + '<BR>' +
            '<BR>' +
            '**Keywords**' + '<BR>' +
            'keywords change the overall appearance or scope of the report. They are separated from the rest of the report by four dashes and must come at the end.' + '<BR>' +
            '<code>layer|[gmlayer|objects|map|walls|tracker|all]</code> will constrain the report to a particular layer or all layers at once, so long as no tokens are selected. If any tokens are selected, Reporter will default to the layer the selected tokens are on. This makes it easier for instance to check the vision settings of tokens on the token layer and the gmlayer simultaneously, or to ping pull to note tokens on the gm layer without switching manually to that layer.  ' + '<BR>' +
            'If the layer keyword all is used the report will be on all token/character pairs on all layers. In this case, a layer character will appear on each subhead line of the report to let you know which layer the token is on. ' + '<BR>' +
            'If the layer keyword tracker is used the report will be on all token/character pairs on the Turn Tracker as if it were a layer. In this case, a layer character will appear on each subhead line of the report to let you know which layer the token is on. If you click on the layer token, it will switch the token from the GM/Notes layer to the  Token/Objects layer and back.' + '<BR>' +
            '<code>compact|[true|false]</code> (default=false): The compact mode shows the token image at half size, and eliminates the second line of the report subhead, since it is not always desired. You may have a very large report you want to see better, or you may be using a sheet that does not support the default values. Currently the second line of the subhead only references the D&D 5th Edition by Roll20 Sheet. ' + '<BR>' +
            '<code>showheader|[true|false]</code> (default=true): This will control whether the header will display at the top of the report. ' + '<BR>' +
            '<code>showfooter|[true|false]</code> (default=true): This will control whether the footer will display at the bottom of the report. ' + '<BR>' +
            '<code>printbutton|[true|false]</code> (default=true): This will control whether the print button will display on each line of the report. ' + '<BR>' +
            '<code>notesbutton|[true|false]</code> (default=false): This will control whether a notes button will display on each line of the report. This notes button will return the token notes for the token on that line. The visibility of the notes button is controlled by the visibility keyword. If the visibility is "gm", it will use a !gmnote command, if the If the visibility is "whisper", it will use a !selftnote command, and if the visibility is "all", it will use a !pcnote command. ' + '<BR>' +
            '<code>visibility|[gm|whisper|all]</code> (default=gm): This will determine how the report is presented. "gm" is whispered to the gm, "whisper" is whispered to the user who sent the command, "all" is posted openly for all to see. ' + '<BR>' +
            '<code>showfooter|[true|false]</code> (default=true): This will control whether the footer will display at the bottom of the report. ' + '<BR>' +
            '<code>source|[true|false]</code> (default=true): if source is set to false, the C and T characters that show whether an attribute comes fromthe token or the sheet will not be displayed. Use this is they are a distraction. ' + '<BR>' +
            `<code>charactersheetlink|[true|false]</code> (default=true): if this keyword is set to false, the link to open the token's corresponding character sheet will not display ` + '<BR>' +
            '<code>subtitle|[true|false]</code> (default=true): if this keyword is set to false, the line directly below the character name will not display. (This is also the default in Compact mode). This may be desirable if not using the D&D 5th Edition by Roll20 Sheet. ' + '<BR>' +
            '<code>ignoreselected|[true|false]</code> (default=false): if this keyword is set to true, the search will not be preset to whichever tokens are selected. The report will run as if no tokens were selected, following whatever layer criteria might have been specified. ' + '<BR>' +
            '<code>npcsubstitutions[true|false]</code> (default=true): if this keyword is set to false, the script will not automatically substitute npc attributes for their PC counterparts (ex: npc_senses for passive_wisdom).This is good for sheets that are not the D&D 5th Edition by Roll20 Sheet. ' + '<BR>' +
            '<code>sort|attribute</code> (default is the raw order): This keyword will sort the final list. Most of the sorts are confined to the token attributes, since they require internal code and if they refer to a sheet may return poor or no results if the sheet does not have the proper attributes. Currently the following values can be sorted on:  ' + '<BR>' +
            'charName: character name. Sheet must have a "name" attribute.<BR>' +
            '<ul><li>charNameI: character name, inverse order. Sheet must have a "name" attribute.' + '<BR>' +
            '<li>tokenName: token name' + '<BR>' +
            '<li>tokenNameI: token name, inverse order.' + '<BR>' +
            '<li>bar1: token bar1 value' + '<BR>' +
            '<li>bar1I: token bar1 value, inverse order.' + '<BR>' +
            '<li>bar2: token bar2 value' + '<BR>' +
            '<li>bar2I: token bar2 value, inverse order.' + '<BR>' +
            '<li>bar3: token bar3 value' + '<BR>' +
            '<li>bar3I: token bar3 value, inverse order.' + '<BR>' +
            '<li>cr - Challenge Rating. D&D 5th Edition by Roll20 Sheet only' + '<BR>' +
            '<li>crI - Challenge Rating, inverse order. D&D 5th Edition by Roll20 Sheet only</UL>' + '<BR>' +
            '<code>title|Title|</code> If this is present in the keywords, the string in between pipes will be placed at the top of the report. If you only want the custom title to display, be sure turn off the header with showheader|false. The title must be placed between two pipes. title|My Title| will work. title|My Title will break.' + '<BR>' +
            '<b>Supernotes Buttons</b>' + '<BR>' +
            'These are small buttons that will appear on each line of the report that call up Supernotes commands. These buttons require Supernotes to be installed (Available from the Roll20 One Click installer). If Supernotes is not installed, the buttons will still display but will have no effect. If the report is in the Chat tab, the notes will display in the chat tab, and if the report is set to be in a handout, the notes will in the handout, directly below the report. This can be used to create a handout that can run a report and display notes below. An example use could be a handout that can read map pins and display the notes for each map pin, making an interactive city guide.' + '<BR>' +
            '<code>tokennotesbutton|[true|false]</code>  (default=false): If this keyword is set to true, the report will place a small shortcut button to return the contents of the reported tokens GM Notes field.' + '<BR>' +
            '<code>charnotesbutton|[true|false]</code>  (default=false): If this keyword is set to true, the report will place a small shortcut button to return the contents of the GM Notes field of the character assigned to the reported token.' + '<BR>' +
            '<code>biobutton|[true|false]</code>  (default=false): If this keyword is set to true, the report will place a small shortcut button to return the contents of the Bio Notes field of the character assigned to the reported token.' + '<BR>' +
            '<code>avatarbutton|[true|false]</code>  (default=false): If this keyword is set to true, the report will place a small shortcut button to return the Avatar of the character assigned to the reported token.' + '<BR>' +
            '<code>tooltipbutton|[true|false]</code>  (default=false): If this keyword is set to true, the report will place a small shortcut button to return contents of the reported tokens Tooltips field.' + '<BR>' +
            '<code>imagebutton|[true|false]</code>  (default=false): If this keyword is set to true, the report will place a small shortcut button to return images from the Bio field of the character assigned to the reported token.' + '<BR>' +
            closeReport, null, {
            noarchive: true
        });
    }

    function readingReport() {
        sendChat('Reporter', '/w gm ' + openReport + openHeader + menuChar +
            '**Reading the Report**<BR><span style="font-weight:normal;">Here is how to read and use the reported information</span><BR>' +
            closeHeader +
            '**Header.** The header of the report will list the range of tokens being reported, by name, followed by the count.<The second line of the header tells you which layer the tokens are on. "TK" for Token Layer, GM for GM/Notes Layer and so on. It will then list the major DL settings for that layer. The header is repeated as a footer, for easy reading on long reports.<BR>' +
            '<BR>' +
            '<BR>' +
            '**Report Line.** The report line of each item will show an image of the token, followed by its token name and the associated character sheet name. If the character sheet is a renamed NPC statblock. ex. If Captain Hero is using the Veteran sheet, it will note this. It will also not if any of the characters have the PC flag.<BR>' +
            'The second line of the report will display the creature type for NPCs or the class and level for PCs. This is specific to the D&D 5th Edition by Roll20 Sheet and will probably return *undefined* on other sheets. This is a feature in development.<BR>' +
            '<BR>' +
            'Click on:' +
            '<BR>' +
            '*Token image* - Ping pull all players to the token\'s location.' +
            '<BR>' +
            '*Token Name* - Ping pull only GM to the token\'s location. Invisible to players.' +
            '<BR>' +
            '*Character Name* -  Opens the associated character sheet.' +
            '<BR>' +
            '<BR>' +
            `Then follows a list of the attributes being requested.<BR>${tokenChar}indicates a token attribute.<BR>${characterChar}indicates a character attribute.<BR>` +
            '<BR>' +
            '**Button Line.** This is the list of commands that can be performed on each token. If it is a token-mod command, ChatSetAttr, or Supernotes command, it will be specific to that token. Refer to Button Line documentation above for details.<BR>' +
            '<BR>' +
            '**Special Buttons.** There are a few buttons that appear in the report, at various places on the right side.<BR>' +
            '☰ will call up the report script menu<BR>' +
            '⟲ will repeat the command that created the report, in case you want to confirm that changes were made.<BR>' +
            `<span style='font-family:pictos; !important'>w</span> will echo to the chat whatever is on that line: Token name on a report line, or Page name on the page line of the header.<BR>` +
            closeReport, null, {
            noarchive: true
        });
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


    const decodeUnicode = (str) => str.replace(/%u[0-9a-fA-F]{2,4}/g, (m) => String.fromCharCode(parseInt(m.slice(2), 16)));

    const TCSort = {
        identity: () => 0,
        charName: (a, b) => (a.character.get('name').toString().toLowerCase() < b.character.get('name').toString().toLowerCase() ? -1 : 0),
        charNameI: (a, b) => (a.character.get('name').toString().toLowerCase() > b.character.get('name').toString().toLowerCase() ? -1 : 0),
        tokenName: (a, b) => (a.token.get('name').toString().toLowerCase() < b.token.get('name').toString().toLowerCase() ? -1 : 0),
        tokenNameI: (a, b) => (a.token.get('name').toString().toLowerCase() > b.token.get('name').toString().toLowerCase() ? -1 : 0),
        bar1: (a, b) => (a.token.get('bar1_value').toString().toLowerCase() < b.token.get('bar1_value').toString().toLowerCase() ? -1 : 0),
        bar1I: (a, b) => (a.token.get('bar1_value').toString().toLowerCase() > b.token.get('bar1_value').toString().toLowerCase() ? -1 : 0),
        bar2: (a, b) => (a.token.get('bar2_value').toString().toLowerCase() < b.token.get('bar2_value').toString().toLowerCase() ? -1 : 0),
        bar2I: (a, b) => (a.token.get('bar2_value').toString().toLowerCase() > b.token.get('bar2_value').toString().toLowerCase() ? -1 : 0),
        bar3: (a, b) => (a.token.get('bar3_value').toString().toLowerCase() < b.token.get('bar3_value').toString().toLowerCase() ? -1 : 0),
        bar3I: (a, b) => (a.token.get('bar3_value').toString().toLowerCase() > b.token.get('bar3_value').toString().toLowerCase() ? -1 : 0),
        bar1_max: (a, b) => (a.token.get('bar1_max').toString().toLowerCase() < b.token.get('bar1_max').toString().toLowerCase() ? -1 : 0),
        bar1_maxI: (a, b) => (a.token.get('bar1_max').toString().toLowerCase() > b.token.get('bar1_max').toString().toLowerCase() ? -1 : 0),
        bar2_max: (a, b) => (a.token.get('bar2_max').toString().toLowerCase() < b.token.get('bar2_max').toString().toLowerCase() ? -1 : 0),
        bar2_maxI: (a, b) => (a.token.get('bar2_max').toString().toLowerCase() > b.token.get('bar2_max').toString().toLowerCase() ? -1 : 0),
        bar3_max: (a, b) => (a.token.get('bar3_max').toString().toLowerCase() < b.token.get('bar3_max').toString().toLowerCase() ? -1 : 0),
        bar3_maxI: (a, b) => (a.token.get('bar3_max').toString().toLowerCase() > b.token.get('bar3_max').toString().toLowerCase() ? -1 : 0),
        currentside: (a, b) => (a.token.get('currentSide').toString().toLowerCase()*1 < b.token.get('currentSide').toString().toLowerCase()*1 ? -1 : 0),
        currentsideI: (a, b) => (a.token.get('currentSide').toString().toLowerCase()*1 > b.token.get('currentSide').toString().toLowerCase()*1 ? -1 : 0),
        cr: (a, b) => toDeci((getAttrByName(a.character.get('_id'), "npc_challenge")) < toDeci(getAttrByName(b.character.get('_id'), "npc_challenge")) ? -1 : 0),
        crI: (a, b) => toDeci((getAttrByName(a.character.get('_id'), "npc_challenge")) > toDeci(getAttrByName(b.character.get('_id'), "npc_challenge")) ? -1 : 0)
    };

    //cleanup(getAttrByName(o.character.get('_id'), "CR"))).toString().toLowerCase()


    on('chat:message', (msg) => { //this is a fat rrow function. The argument is msg



        //       if ('api' === msg.type && /!report\b/i.test(msg.content) && msg.selected) {
        if ('api' === msg.type && /!report\b/i.test(msg.content)) {
            //            const repeatChar = `<a href='${msg.content}' style='float:right; decoration:none; background-color: transparent; border: none; color: #fff; padding:0px 2px; margin-right:3px; !important'>⟲</a>`;

            //Set sheet
            if (msg.content.includes("!report --config|")) {

                switch (msg.content) {
                    case "!report --config|dnd5e":
                    case "!report --config|D&D 5th Edition by Roll20":
                        state.Reporter.sheet = "D&D 5th Edition by Roll20"
                        sheet = state.Reporter.sheet;
                        sendMessage('Sheet is now set to <BR><B>' + sheet + '</B>')
                        break;
                    case "!report --config|shaped":
                    case "!report --config|D&D 5E Shaped":
                        state.Reporter.sheet = "D&D 5E Shaped"
                        sheet = state.Reporter.sheet;
                        sendMessage('Sheet is now set to <BR><B>' + sheet + '</B>')
                        break;
                    case "!report --config|pf2":
                    case "!report --config|Pathfinder Second Edition by Roll20":
                        state.Reporter.sheet = "Pathfinder Second Edition by Roll20";
                        sheet = state.Reporter.sheet;
                        sendMessage('Sheet is now set to <BR><B>' + sheet + '</B>')
                        break;
                    case "!report --config|pf1":
                    case "!report --config|Pathfinder First Edition by Roll20":
                        state.Reporter.sheet = "Pathfinder First Edition by Roll20";
                        sheet = state.Reporter.sheet;
                        sendMessage('Sheet is now set to <BR><B>' + sheet + '</B>')
                        break;
                    case "!report --config|sheet":

                        message = 'The current sheet is:<BR><B>' + state.Reporter.sheet + '</B><BR>Currently the character sheets listed below are fully supported. For other sheets, choose "Other". This will disable the few sheet-specific shortcuts.<BR><BR>[D&D 5th Edition by Roll20](!report --config|D&D 5th Edition by Roll20)<BR>[D&D 5E Shaped](!report --config|D&D 5E Shaped)<BR>[Pathfinder First Edition by Roll20](!report --config|Pathfinder First Edition by Roll20)<BR>[Pathfinder Second Edition by Roll20](!report --config|Pathfinder Second Edition by Roll20)<BR>[Other](!report --config|Other)';
                        sendChat('Reporter', '/w gm &{template:default}{{ =' + message + '}}');
                        //                        sendChat('Reporter', '/w gm Current sheet is ' + state.Reporter.sheet  + '<BR>If this is incorrect. choose a supported sheet or choose "Other"<BR>[D&D 5th Edition by Roll20](!report --config|D&D 5th Edition by Roll20)<BR>[Pathfinder by Roll20](!report --config|Pathfinder Second Edition by Roll20)<BR>[Other](!report --config|other)');
                        break;
                    default:
                        state.Reporter.sheet = "Other"
                        sheet = state.Reporter.sheet;
                        sendMessage('Sheet is now set to <BR><B>' + sheet + '</B>')
                }

                return;
            }


            let toWhom = '/w gm ';
            let buttonLine = '';
            let currentLayer = "";
            let compact = false;
            let minimal = false;
            let showFooter = true;
            let customTitle = '';
            let showHeader = true;
            let allLayers = false;
            let source = true;
            let isPrintbutton = false;
            let isTokenNotesButton = false;
            let isTokenImageButton = false;
            let isCharNotesButton = false;
            let isBioButton = false;
            let isAvatarButton = false;
            let isImageButton = false;
            let isTooltipButton = false;
            let isLayerButton = true;
            let printButton = "";
            let ignoreSelected = false;
            let characterSheetLink = true;
            let characterSheetButton = false;
            let subTitle = true;
            let npcSubstitutions = true;
            let hideEmpty = false;
            let sortTerm = 'identity';
            let tokenGraphicHeight = 18;
            let secondline = "";
            let differentName = "";
            let prefix = "";
            let isNPC = "";
            let showPageInfo = false;
            let pageInfo = "";
            let displayNotes = false;
            let scrolling = false;
            let sidebar = false;
            //resets this value
            openReport = "<div style='color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";


            let testChar = findObjs({
                type: 'character'
            });


            //intercept shorthand phrases that replace entire calls
            switch (msg.content) {
                case '!report|mapkeys':
                    mapKeyChar = findObjs({
                        type: 'character',
                        name: 'Map Key'
                    })[0];

                    if (mapKeyChar) {
                        mapKey = mapKeyChar.get('_id');
                        msg.content = `!report||+|t|represents|${mapKey} ---  ---- layer|gmlayer compact|true charactersheetlink|false notesbutton|true showprintbutton|false title|Map Keys| tokennotesbutton|true ignoreselected|true showheader|false `;
                        //if (reportName){msg.content = `${msg.content} handout|${reportName}|`};
                    } else {
                        msg.content = `!report||+|t|thereisnocharacterbythisname`
                    }
                    break;
                case '!report|mapkeys_sorted':
                    mapKeyChar = findObjs({
                        type: 'character',
                        name: 'Map Key'
                    })[0];
                    if (mapKeyChar) {
                        mapKey = mapKeyChar.get('_id');
                        msg.content = `!report||+|t|represents|${mapKey} ---  ---- layer|gmlayer compact|true sort|tokenName charactersheetlink|false notesbutton|true showprintbutton|false title|Map Keys| tokennotesbutton|true ignoreselected|true showheader|false `;
                        //if (reportName){msg.content = `${msg.content} handout|${reportName}|`};
                    } else {
                        msg.content = `!report||+|t|thereisnocharacterbythisname`
                    }
                    break;

                case '!report|pcs-detail':

                    switch (sheet) {
                        case 'Other':
                            msg.content = `!report||+|t|thereisnocharacterbythisname`
                            sendChat('Reporter', toWhom + openReport + sheet + 'This command only works on a supported sheet. Click here to choose a supported sheet or forego using this preset command<BR>[Configure](!report --config|sheet)' + closeReport, null, { noarchive: true });
                            break;
                        case 'D&D 5E Shaped':
                            msg.content = `!report||+|c|is_npc|0 --c|strength,|Str c|dexterity,|Dex c|constitution|Con c|intelligence,|Int c|wisdom,|Wis c|charisma#|Cha c|hp,|hp c|ac,|AC c|gp|GP ---vision ---- showfooter|false showheader|false printbutton|false hideempty|true source|false title|PCs Detail|`;
                            break;
                        case 'Pathfinder First Edition by Roll20':
                            msg.content = `!report||+|c|npc|0 --detail ---vision ---- showfooter|false showheader|false printbutton|false hideempty|true source|false title|PCs Detail|`;
                            break;
                        case 'Pathfinder Second Edition by Roll20':
                            msg.content = `!report||-|c|sheet_type|npc --detail ---vision ---- showfooter|false showheader|false printbutton|false hideempty|true source|false title|PCs Detail|`;
                            break;
                        case 'D&D 5th Edition by Roll20':
                            msg.content = `!report||+|c|npc|0 --c|strength,|Str c|dexterity,|Dex c|constitution|Con c|intelligence,|Int c|wisdom,|Wis c|charisma#|Cha c|hp,|hp c|ac,|AC c|gp|GP ---vision ---- showfooter|false showheader|false printbutton|false hideempty|true source|false title|PCs Detail|`;
                            break;
                        default:
                            break;
                    }
                    break;



                case '!report|pcs':
                    switch (sheet) {
                        case 'Other':
                            msg.content = `!report||+|t|thereisnocharacterbythisname`
                            sendChat('Reporter', toWhom + openReport + sheet + 'This command only works on a supported sheet. Click here to choose a supported sheet or forego using this preset command<BR>[Configure](!report --config|sheet)' + closeReport, null, { noarchive: true });
                            break;
                        case 'D&D 5E Shaped':
                            msg.content = `!report||+|c|is_npc|0 ---- title|PC Directory| sort|bar1 compact|true showheader|false showfooter|false layer|objects charactersheetbutton|true  ignoreselected|true printbutton|false`;
                            break;
                        case 'Pathfinder First Edition by Roll20':
                            msg.content = `!report||+|c|npc|0 ---- title|PC Directory| sort|bar1 compact|true showheader|false showfooter|false layer|objects charactersheetbutton|true ignoreselected|true printbutton|false`;
                            break;
                        case 'Pathfinder Second Edition by Roll20':
                            msg.content = `!report||-|c|sheet_type|npc ---- title|PC Directory| sort|bar1 compact|true showheader|false showfooter|false layer|objects charactersheetbutton|true ignoreselected|true printbutton|false`;
                            break;
                        case 'D&D 5th Edition by Roll20':
                            msg.content = `!report||+|c|npc|0 ---- title|PC Directory| sort|bar1 compact|true showheader|false showfooter|false layer|objects charactersheetbutton|true  ignoreselected|true printbutton|false`;
                            break;
                        default:
                            break;
                    }
                    break;


                case '!report|npcs-detail':
                    switch (sheet) {
                        case 'Other':
                            msg.content = `!report||+|t|thereisnocharacterbythisname`
                            sendChat('Reporter', toWhom + openReport + sheet + 'This command only works on a supported sheet. Click here to choose a supported sheet or forego using this preset command<BR>[Configure](!report --config|sheet)' + closeReport, null, { noarchive: true });
                            break;
                        case 'Pathfinder First Edition by Roll20':
                            msg.content = `!report||+|c|npc|1 --detail  ---vision ---- showfooter|false showheader|false printbutton|false hideempty|true source|false title|NPCs Detail|`;
                            break;
                        case 'Pathfinder Second Edition by Roll20':
                            msg.content = `!report||+|c|sheet_type|npc --detail  ---vision ---- showfooter|false showheader|false printbutton|false hideempty|true source|false title|NPCs Detail|`;
                            break;
                        case 'D&D 5E Shaped':
                            msg.content = `!report||-|c|is_npc|0 --detail   ---- showfooter|false  showheader|false source|false printbutton|false hideempty|true charactersheetbutton|true title|NPCs Detail| `;
                            break;
                        case 'D&D 5th Edition by Roll20':
                            msg.content = `!report||-|c|npc|0 --detail   ---- showfooter|false  showheader|false source|false printbutton|false hideempty|true charactersheetbutton|true title|NPCs Detail| `;
                            break;
                        default:
                            break;
                    }
                    break;

                case '!report|npcs-actions':
                    switch (sheet) {
                        case 'Other':
                            msg.content = `!report||+|t|thereisnocharacterbythisname`
                            sendChat('Reporter', toWhom + openReport + sheet + 'This command only works on a supported sheet. Click here to choose a supported sheet or forego using this preset command<BR>[Configure](!report --config|sheet)' + closeReport, null, { noarchive: true });
                            break;
                        case 'Pathfinder First Edition by Roll20':
                            msg.content = `!report||+|c|npc|1 --  ---actions ---- showfooter|false  showheader|false source|false printbutton|false compact|true charactersheetbutton|true title|NPC Actions| `;
                            break;
                        case 'Pathfinder Second Edition by Roll20':
                            msg.content = `!report||+|c|sheet_type|npc --  ---actions ---- showfooter|false  showheader|false source|false printbutton|false compact|true charactersheetbutton|true title|NPC Actions| `;
                            break;
                        case 'D&D 5th Edition by Roll20':
                            msg.content = `!report||-|c|npc|0 --  ---actions ---- showfooter|false  showheader|false source|false printbutton|false compact|true charactersheetbutton|true title|NPC Actions| `;
                            break;
                        case 'D&D 5E Shaped':
                            msg.content = `!report||-|c|is_npc|0 --  ---actions ---- showfooter|false  showheader|false source|false printbutton|false compact|true charactersheetbutton|true title|NPC Actions| `;
                            break;
                        default:
                            break;
                    }
                    break;

                case '!report|tracker':
                    msg.content = `!report --t|statusmarkers|- ---- showfooter|false showheader|false source|false title|Tracker Compact| layer|tracker compact|true hideempty|true charactersheetbutton|true `;
                    break;
                case '!report|tracker-actions':
                    msg.content = `!report -- ---actions ---- showfooter|false showheader|false source|false title|Tracker Actions| layer|tracker compact|true charactersheetbutton|true `;
                    break;
                case '!report|light':
                    msg.content = `!report --light ---lightplus ----showsource|false`;
                    break;
                case '!report|vision':
                    msg.content = `!report --vision ---vision ----showsource|false`;
                    break;
                case '!report|help':
                    msg.content = `!report --help`;
                    break;
                case '!report|menu':
                    msg.content = `!report --menu`;
                    break;
                case '!report|report':
                    msg.content = `!report --report`;
                    break;

                default:
            }
            //                            sendChat('Reporter', toWhom + openReport + msg.content  + closeReport, null, { noarchive: true });




            if (msg.content === "!report --mapkeys") {
                mapKeyChar = findObjs({
                    type: 'character',
                    name: 'Map Key'
                })[0];
                mapKey = mapKeyChar.get('_id');
                msg.content = `!report||+|t|represents|${mapKey} ---  ---- layer|gmlayer compact|true sort|tokennameI charactersheetlink|false notesbutton|true showprintbutton|false title|Map Keys| tokennotesbutton|true ignoreselected|true showheader|false `;
                if (reportName) { msg.content = `${msg.content} handout|${reportName}` };
            }


            //  ################## Keywords
            let keywords = msg.content.split(/\s+----/)[1] || "";
            let reportName = "";
            if (keywords) {
                if (keywords.includes("layer|")) {
                    currentLayer = keywords.split(/layer\|/)[1].split(/\s+/)[0] || "";
                }
                if (!("map objects walls gmlayer all tracker").includes(currentLayer) && undefined !== currentLayer) {
                    currentLayer = ""
                }

                compact = ((keywords.includes("compact|true")) ? true : false);
                minimal = ((keywords.includes("minimal|")) ? true : false);
                showFooter = ((keywords.includes("showfooter|false")) ? false : true);
                showHeader = ((keywords.includes("showheader|false")) ? false : true);
                showPageInfo = ((keywords.includes("showpageinfo|true")) ? true : false);
                customTitle = ((keywords.includes("title|")) ? keywords.match(/title\|.*?\|/).toString().split("|")[1] : '');
                customTitle = ((keywords.includes("overtitle|")) ? keywords.match(/title\|.*?\|/).toString().split("|")[1] : customTitle);
                source = ((keywords.includes("source|false")) ? false : true);
                isPrintbutton = ((keywords.includes("printbutton|true")) ? true : false);
                isTokenNotesButton = ((keywords.includes("tokennotesbutton|true")) ? true : false);
                isTokenNotesRow = ((keywords.includes("tokennotesrow|true")) ? true : false);
                isTokenImageButton = ((keywords.includes("tokenbutton|true")) ? true : false);
                isCharNotesButton = ((keywords.includes("charnotesbutton|true")) ? true : false);
                isBioButton = ((keywords.includes("biobutton|true")) ? true : false);
                isAvatarButton = ((keywords.includes("avatarbutton|true")) ? true : false);
                isTooltipButton = ((keywords.includes("tooltipbutton|true")) ? true : false);
                isLayerButton = ((keywords.includes("layerbutton|false")) ? false : true);
                isImageButton = ((keywords.includes("imagebutton|true")) ? true : false);
                subTitle = ((keywords.includes("subtitle|false")) ? false : true);
                ignoreSelected = ((keywords.includes("ignoreselected|true")) || (keywords.includes("layer|tracker")) ? true : false);
                toWhom = ((keywords.includes("visibility|whisper")) ? '/w ' + msg.who : '/w gm ');
                toWhom = ((keywords.includes("visibility|all")) ? '' : toWhom);
                noteRecipient = ((keywords.includes("visibility|all")) ? '!pcnote' : '!gmnote');
                noteRecipient = ((keywords.includes("visibility|whisper")) ? '!selfnote' : noteRecipient);
                npcSubstitutions = ((keywords.includes("npcsubstitutions|false")) ? false : true);
                hideEmpty = ((keywords.includes("hideempty|true")) ? true : false);
                characterSheetLink = ((keywords.includes("charactersheetlink|false")) ? false : true);
                characterSheetButton = ((keywords.includes("charactersheetbutton|true")) ? true : false);
                displayNotes = ((keywords.includes("displaynotes|true")) ? true : false);
                scrolling = ((keywords.includes("scrolling|")) ? keywords.match(/(?<=scrolling\|)\d*/g) : false);
                sidebar = ((keywords.includes("sidebar|")) ? keywords.match(/(?<=sidebar\|)left|right/) : false);
                sortTerm = ((keywords.includes("sort|")) ? keywords.split("sort|")[1].split(" ")[0] : 'identity');
                reportName = ((keywords.match(/handout\|.*?\|/)) ? keywords.match(/handout\|.*?\|/).toString().split("|")[1] : "");
                if (keywords.includes("minimal|")) {
                    showHeader = false;
                    showFooter = false;
                    compact=true;
                    source = false;
                    characterSheetButton = true;
                    characterSheetLink = true;
                    hideEmpty = true;
                    if (!customTitle && !keywords.includes("minimal|true")) {
                        
customTitle = keywords.match(/minimal\|.*?$/).toString().split("|")[1];
                    } else {
                    customTitle = ((!customTitle) ? "Report" : customTitle);}
}
                
                
                
                if (keywords.includes("overtitle|")) {
                    showHeader = false;
                    showFooter = false
                }
            }

            // ##### Assign selected if no tokens are selected
            if (msg.selected && ignoreSelected === false) {
                allLayers = false

                selection = msg.selected
                    .map(o => getObj('graphic', o._id))
                    .filter(o => undefined !== o)
            } else {
                if (currentLayer === 'all' || currentLayer === 'tracker') {
                    allLayers = true

                    selection = findObjs({
                        type: 'graphic',
                        pageid: getPageForPlayer(msg.playerid),
                        //layer: currentLayer || 'objects'
                    });
                } else {
                    allLayers = false

                    selection = findObjs({
                        type: 'graphic',
                        pageid: getPageForPlayer(msg.playerid),
                        layer: currentLayer || 'objects'
                    });

                }
            }

            //gathers from tracker
            var turnorder;
            if (Campaign().get("turnorder") == "") turnorder = []; //NOTE: We check to make sure that the turnorder isn't just an empty string first. If it is treat it like an empty array.
            else turnorder = JSON.parse(Campaign().get("turnorder"));

            let tselection = turnorder
                .map(o => getObj('graphic', o.id))
                .filter(o => undefined !== o)



            const repeatChar = `<a href='${msg.content}' style='float:right; decoration:none; background-color: transparent; border: none; color: #fff; padding:0px 2px; font-family: pictos; margin-right:1px; !important'>1</a>`;

            const args = msg.content.split(/\s+--/);

            buttonLine = '';
            let buttonCode = msg.content.split(/\s+---/)[1] //.split(/\s+----/)[0]; //gets everything between --- and ----
            buttonCode = ((buttonCode && buttonCode.includes(" ----")) ? buttonCode.split(/\s+----/)[0] : buttonCode); //gets everything between --- and ----
            if (undefined !== buttonCode) {
                if (buttonCode.substring(0, 2) === "- ") {
                    buttonCode = ""
                }
            }

            // Default buttonLines
            switch (buttonCode) {
                case 'vision':
                    buttonLine = '**Vision** [Off](!token-mod --set bright_vision|false has_night_vision|false)|[On](!token-mod --set bright_vision|true) **Night** [Off](!token-mod --set has_night_vision|false bright_vision|false)|[On](!token-mod --set bright_vision|true night_vision|true)|[Distance](!token-mod --set has_night_vision|true night_vision_distance|Q{Set night vision distance|60})'; // | **[SET DEFAULT TOKEN](!token-mod --set defaulttoken)**';
                    break;
                case 'udl':
                    buttonLine = '**Vision** [Off](!token-mod --set bright_vision|false has_night_vision|false)|[On](!token-mod --set bright_vision|true) **Night** [Off](!token-mod --set has_night_vision|false bright_vision|false)|[On](!token-mod --set bright_vision|true night_vision|true)|[Distance](!token-mod --set has_night_vision|true night_vision_distance|Q{Set night vision distance|60})';
                    break;
                case 'lightplus':
                    //Low Light requires Bright Light to be on, even if the distance is 0
                    buttonLine = '[Off](!token-mod --set emits_bright_light|off emits_low_light|off has_directional_bright_light|false has_directional_dim_light|false directional_bright_light_total|360 directional_dim_light_total|360) | [On](!token-mod --set emits_bright_light|on emits_low_light|on light_angle|360) | [Spot](!token-mod --set emits_bright_light|on bright_light_distance|5 low_light_distance|0 light_angle|360) | [Candle](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|2 low_light_distance|5 light_angle|360) | [Lamp](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|15 low_light_distance|15 light_angle|360) | [Torch](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|20 low_light_distance|20 light_angle|360) | [Hooded Lantern](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|30 low_light_distance|30 light_angle|360) | [Bullseye Lantern](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|60 has_directional_bright_light|true has_directional_dim_light|true directional_bright_light_total|60 directional_dim_light_total|60) | [*Light*](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|20 low_light_distance|20 light_angle|360) | [*Daylight*](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|60 low_light_distance|60 light_angle|360) | [*Dancing*](!token-mod --set emits_bright_light|off emits_low_light|on bright_light_distance|0 low_light_distance|10 light_angle|360) | [*Faerie Fire*](!token-mod --set emits_bright_light|off emits_low_light|on bright_light_distance|0 low_light_distance|10 statusmarkers|purple light_angle|360) | [*Gem of Brightness*](!token-mod --set emits_bright_light|on emits_low_light|on bright_light_distance|30 low_light_distance|30 light_angle|360)';
                    break;
                case 'light':
                    //Low Light requires Bright Light to be on, even if the distance is 0
                    buttonLine = '**Bright** [On](!token-mod --set emits_bright_light|on)|[Off](!token-mod --set emits_bright_light|off)|[Distance](!token-mod --set bright_light_distance|Q{Distance?|0}) - **Low** [On](!token-mod --set emits_low_light|on)|[Off](!token-mod --set emits_low_light|off)|[Distance](!token-mod --set low_distance|Q{Distance?|0})';
                    break;
                default:
                    buttonLine = buttonCode;
            }




            //WIP Set Filters   
            let filters = (args[0].split(/\|\|/));

            let bob = filters.shift();
            let theFilter = (args[0].split(/[+-]/))[1];
            let theFilter2 = (args[0].split(/[+-]/))[2] || "bob";
            let filterOption = '';
            let filterTerm = '';
            let filterValue = '';
            if (args[0].includes('!report||-')) filterOption = 'exclude';
            if (args[0].includes('!report||+')) filterOption = 'restrict';



            //Creating variables for an array of ids and an array of names.
            let idList = [];
            let nameList = [];
            let lines = '';
            let charType = '';
            let pageData = [];
            let layerChar = "";


            let value = "";

            selection = ((currentLayer === "tracker") ? tselection : selection)
            let TCData = selection
                .filter(t => t.get('represents').length)
                .map(t => ({
                    token: t,
                    character: getObj('character', t.get('represents'))
                }))
                .filter(o => undefined !== o.character);



            let filterTCData = TCData;
            let newTCData = [];

            filters.forEach(f => {



                // Filter
                if (f) {
                    filterOption = f.split(/\|/)[0];
                    if (filterOption === "-") filterOption = 'omit';
                    if (filterOption === "+") filterOption = 'restrict';
                    if (filterOption === "~") filterOption = 'include';
                    if (filterOption === "^") filterOption = 'exclude';

                    target = f.split(/\|/)[1];
                    attribute = f.split(/\|/)[2];
                    filterValue = f.split(/\|/)[3];

                    if (!filterValue) {
                        filterValue = " "
                    }
                    if (filterValue === "!") {
                        filterValue = ""
                    }

                    if (filterValue !== 'all') {
                        if (target === 't') {
                            if (filterOption === "omit") filterTCData = TCData.filter(o => cleanup(o.token.get(attribute)) !== cleanup(filterValue)); //WORKS
                            if (filterOption === "restrict") filterTCData = TCData.filter(o => cleanup(o.token.get(attribute)) === cleanup(filterValue)); //WORKS
                            if (filterOption === "include") filterTCData = TCData.filter(o => cleanup(o.token.get(attribute)).includes(cleanup(filterValue))); //WORKS
                            if (filterOption === "exclude") filterTCData = TCData.filter(o => !cleanup(o.token.get(attribute)).includes(cleanup(filterValue))); //WORKS
                        } else {
                            //log('WE ARE IN CHARACTER TERRITORY - ATTRIBUTE OR PROPERTY');
                            if (filterOption === "omit") filterTCData = TCData.filter(o => cleanup((o.character.get(attribute)) || cleanup(getAttrByName(o.character.get('_id'), attribute))) !== cleanup(filterValue));
                            if (filterOption === "restrict") filterTCData = TCData.filter(o => cleanup((o.character.get(attribute)) || cleanup(getAttrByName(o.character.get('_id'), attribute))) === cleanup(filterValue));
                            if (filterOption === "include") filterTCData = TCData.filter(o => cleanup((o.character.get(attribute)) || (cleanup(getAttrByName(o.character.get('_id'), attribute)))).includes(cleanup(filterValue)));
                            if (filterOption === "exclude") filterTCData = TCData.filter(o => !cleanup((o.character.get(attribute)) || !(cleanup(getAttrByName(o.character.get('_id'), attribute)))).includes(cleanup(filterValue)));
                        }
                    }
                    TCData = filterTCData
                }
            });

            //log("Number of tokens after filtering = " + TCData.length); 
            

if (scrolling){
        openReport = "<div style='max-height:" + scrolling +"px; overflow-x:hidden; color: #000; border: 1px solid #000; background-color: #fff; box-shadow: 0 0 3px #000; display: block; text-align: left; font-size: 13px; padding: 5px; margin-bottom: 0.25em; font-family: sans-serif; white-space: pre-wrap;'>";
}
if (sidebar){
    openReport = ((sidebar.includes('left')) ? openReport.replace('color: #000','color: #000; width:30%; float:left; margin-right:10px;') : openReport.replace('color: #000','color: #000; width:30%; float:right; margin-left:5px;'))
}


            if (TCData.length > 0) {
                pageData = (getObj('page', TCData[0].token.get('_pageid')));
                let pageName = pageData.get('name');
                let countChar = "  <span style = 'float:right; color:#aaa;'>(" + TCData.length + ")</span>";

                let header = openHeader + menuChar + repeatChar + countChar + TCData[0].token.get('name') + " - " + TCData[TCData.length - 1].token.get('name') + closeHeader;


                currentLayer = currentLayer || TCData[0].token.get('layer');
                switch (currentLayer) {
                    case "gmlayer":
                        layerChar = GMChar;
                        break;
                    case "map":
                        layerChar = MPChar;
                        break;
                    case "walls":
                        layerChar = DLChar;
                        break;
                    default:
                        layerChar = TKChar;
                }
                layerChar = ((isLayerButton) ? layerChar : '');

                if (showPageInfo) {
                    pageInfo = "<div style='color:#fff; background-color:#404040; margin-right:3px%; padding:3px;'><a style = " + printButtonStyle + " href='!RPechochat --" + pageData.get('name') + "'>w</a><b>" + layerChar + pageData.get('name') + "</b><BR>DL: " + ((pageData.get('dynamic_lighting_enabled')) ? '<a href="!RPpage-mod --dynamic_lighting_enabled|false" style = ' + headerButtonStyle + '>On</a>' : '<a href="!RPpage-mod --dynamic_lighting_enabled|true" style = ' + headerButtonStyle + '>Off</a>') + " | Day: " + ((pageData.get('daylight_mode_enabled')) ? '<a href="!RPpage-mod --daylight_mode_enabled|false" style = ' + headerButtonStyle + '>On</a>' : '<a href="!RPpage-mod --daylight_mode_enabled|true" style = ' + headerButtonStyle + '>Off</a>') + " | Opacity: " + '<a href="!RPpage-mod --daylightModeOpacity|?{Input value between 0 and 100?|100}" style = ' + headerButtonStyle + '>' + (pageData.get('daylightModeOpacity') * 100) + "%</a></a></i></div>";
                } else {
                    pageInfo = ''
                }



                let attributes = []
                if (undefined !== args[1]) {
                    let attributeLine = args[1];

                    switch (attributeLine) {
                        case "vision":


                            switch (sheet) {
                                case "D&D 5th Edition by Roll20":
                                    attributes = ['t|has_bright_light_vision.|Vision', 't|has_night_vision,|Night|NV', 't|night_vision_distance|NV-dist', 'c|npc_senses|Perc.'];
                                    break;
                                case "D&D 5E Shaped":
                                    attributes = ['t|has_bright_light_vision.|Vision', 't|has_night_vision,|Night|NV', 't|night_vision_distance|NV-dist', 'c|senses_string|Perc.'];
                                    break;
                                case "Pathfinder First Edition by Roll20":
                                    attributes = ['t|has_bright_light_vision.|Vision', 't|has_night_vision,|Night|NV', 't|night_vision_distance|NV-dist', 'c|senses|Senses'];
                                    break;
                                case "Pathfinder Second Edition by Roll20":
                                    attributes = ['t|has_bright_light_vision.|Vision', 't|has_night_vision,|Night|NV', 't|night_vision_distance|NV-dist', 'c|repeating_senses_$0_sense|Senses'];
                                    break;
                                default:
                                    attributes = ['t|has_bright_light_vision.|Vision', 't|has_night_vision,|Night|NV', 't|night_vision_distance|NV-dist'];
                            }










                            break;
                        case "light":
                            attributes = ['t|emits_bright_light,|Bright|Bright', 't|bright_light_distance|distance', 't|emits_low_light,|Low', 't|low_light_distance|distance'];
                            break;
                        case "detail":

                            switch (sheet) {
                                case "D&D 5th Edition by Roll20":
                                    attributes = ['c|strength.|St', 'c|dexterity.|Dx', 'c|constitution,|Cn', 't|bar1_value|hp', 'c|intelligence.|In', 'c|wisdom.|Ws', 'c|charisma,|Ch', 'c|ac|AC', 'c|npc_senses|Senses'];
                                    break;
                                case "D&D 5E Shaped":
                                    attributes = ['c|strength.|St', 'c|dexterity.|Dx', 'c|constitution|Cn', 't|bar1_value|hp', 'c|intelligence.|In', 'c|wisdom.|Ws', 'c|charisma,|Ch', 'c|ac|AC', 'c|npc_senses|Senses'];
                                    break;
                                case "Pathfinder First Edition by Roll20":
                                    attributes = ['c|strength,|Str', 'c|dexterity,|Dex ', 'c|constitution|Con', 'c|intelligence,|Int', 'c|wisdom,|Wis', 'c|charisma|Cha', 'c|ac.|AC', 'c|ac_touch.|t', 'c|ac_flatfooted.|ff', 't|bar1|hp', 'c|senses|Senses'];
                                    break;
                                case "Pathfinder Second Edition by Roll20":
                                    attributes = ['c|strength,|Str', 'c|dexterity,|Dex ', 'c|constitution.|Con', 't|bar1|hp', 'c|intelligence,|Int', 'c|wisdom,|Wis', 'c|charisma.|Cha', 'c|armor_class#|AC', 'c|repeating_senses_$0_sense|Senses'];
                                    break;
                                default:
                                    attributes = args[1].split(/\s+/)
                            }
                            keywords = keywords + " source|false ";
                            source = false;




                            break;
                        default:
                            attributes = args[1].split(/\s+/)
                    }
                } else {
                    attributes[0] = "t|_id|token_ID"
                }

                //calls up non-report responses like help, menu and possibly config eventually
                switch (attributes[0]) {
                    case "help":
                        help();
                        break;
                    case "menu":
                        menu();
                        break;
                    case "report":
                        readingReport()
                        break;
                    default:



                        //log('attributes = ' + JSON.stringify(attributes));
                        let attribute = []
                        let customTag = "";
                        let attributeValue = '';
                        let npcattributeValue = '';
                        let attributeList = [];
                        let name = "";
                        target = 'character';
                        let tId = "";
                        let cId = "";
                        let separator = "";

                        //### Sorting




                        let sorter = TCSort.identity;
                        switch (sortTerm) {
                            case "charName":
                                sorter = TCSort.charName;
                                break;
                            case "charNameI":
                                sorter = TCSort.charNameI;
                                break;
                            case "tokenName":
                                sorter = TCSort.tokenName;
                                break;
                            case "tokenNameI":
                                sorter = TCSort.tokenNameI;
                                break;
                            case "bar1":
                                sorter = TCSort.bar1;
                                break;
                            case "bar1I":
                                sorter = TCSort.bar1I;
                                break;
                            case "bar2":
                                sorter = TCSort.bar2;
                                break;
                            case "bar2I":
                                sorter = TCSort.bar2I;
                                break;
                            case "bar3":
                                sorter = TCSort.bar3;
                                break;
                            case "bar3I":
                                sorter = TCSort.bar3I;
                                break;
                            case "bar1_max":
                                sorter = TCSort.bar1_max;
                                break;
                            case "bar1_maxI":
                                sorter = TCSort.bar1_maxI;
                                break;
                            case "bar2_max":
                                sorter = TCSort.bar2_max;
                                break;
                            case "bar2_maxI":
                                sorter = TCSort.bar2_maxI;
                                break;
                            case "bar3_max":
                                sorter = TCSort.bar3_max;
                                break;
                            case "bar3_maxI":
                                sorter = TCSort.bar3_maxI;
                                break;
                             case "currentside":
                                sorter = TCSort.currentside;
                                break;
                             case "currentsideI":
                                sorter = TCSort.currentsideI;
                                break;
                           case "cr":
                                sorter = TCSort.cr;
                                break;
                            case "crI":
                                sorter = TCSort.crI;
                                break;
                            default:
                                sorter = sorter = TCSort.identity
                        }
                        TCData = TCData.sort(sorter);

                        TCData.forEach(tc => {
                            //log('tc = ' + JSON.stringify(tc));
                            //log('tc.token = ' + JSON.stringify(tc.token));

                            name = tc.token.get('name');
                            tId = tc.token.get('_id');
                            cId = tc.character.get('_id');


                            if (buttonCode === 'actions') {
                                buttonLine = '';
                                actionList = findObjs({
                                    type: 'ability',
                                    _characterid: cId
                                });
                                actionList.forEach(a => {
                                    if (a.get('istokenaction')) {
                                        actionName = a.get('name');
                                        actionName = actionName.replace(/\s\(/g, "-");
                                        actionName = actionName.replace(/\)/g, "");
                                        actionId = a.get('_id');
                                        if (actionName !== "Check" && actionName !== "Save") {
                                            buttonLine = buttonLine + '[' + actionName + '](~' + cId + '|' + actionId + ') | ';
                                        }

                                    }
                                })
                                buttonLine = buttonLine.replace(/\|\s*$/, "");
                            }




                            if (buttonLine) {
                                newbuttonLine = buttonLine.replace(/!token-mod --/g, "!token-mod --ignore-selected --ids " + tId + " --")
                                    .replace(/!pcnote/g, "!pcnote --id" + tId)
                                    .replace(/!gmnote/g, "!gmnote --id" + tId)
                                    .replace(/!selfnote/g, "!selfnote --id" + tId)
                                    .replace(/!setattr/g, "!setattr --charid " + cId)
                                    .replace(/!modattr/g, "!modattr --charid " + cId)
                                    .replace(/!modbattr/g, "!modbattr --charid " + cId)
                                    .replace(/(\[.*?\])(\(.*?\))+/g, "$2$1")
                                    .replace(/(\()+/g, "<a style =" + buttonStyle + " href = '")
                                    .replace(/(\)\[)+/g, "'>")
                                    .replace(/(\])+/g, "</a>")
                                    .replace('Q{selected|token_name}', tc.token.get('name'))
                                    .replace('A{selected|token_name}', tc.token.get('name'))
                                    .replace(/\/n/g, '<BR>')
                                    .replace(/Q{/g, '?{')
                                    //.replace(/P{/g, '%{')
                                    //.replace(/tokID/g, tId)
                                    //.replace(/charID/g, cId)
                                    //.replace(/tokname/g, tc.token.get('name'))
                                    //.replace(/charname/g, npcSwap(attribute, getAttrByName(tc.character.get('_id'), 'npc_name')))
                                    .replace(/A{/g, '&#64;{');
                            } else {
                                newbuttonLine = "";
                            }


                            // ######## report subheader
                            function specificLayer(id) {
                                if (allLayers) {
                                    let layer = tc.token.get("layer");
                                    layer = ((isLayerButton) ? layer : 'nobutton');
                                    switch (layer) {
                                        case "gmlayer":
                                            return `<a href='!RPchangelayer ${tc.token.get("_id")}' style ='background-color: transparent; padding: 0px; color: #ce0f69; display: inline-block; border: none; float:right !important'>${GMChar}</a>`;
                                            break;
                                        case "map":
                                            return "<span style ='display:inline-block; float:right !important'>" + MPChar + "</span>";
                                            break;
                                        case "walls":
                                            return "<span style ='display:inline-block; float:right !important'>" + DLChar + "</span>";
                                            break;
                                        case "nobutton":
                                            return "";
                                            break;
                                        default:
                                            return `<a href='!RPchangelayer ${tc.token.get("_id")}' style ='background-color: transparent; padding: 0px; color: #ce0f69; display: inline-block; border: none; float:right !important'>${TKChar}</a>`;
                                    }
                                } else {
                                    return ""
                                }
                            }
                            let notesHandout = ((reportName) ? ` handout|${reportName}| ` : ``)
                            characterSheet = ((characterSheetLink) ? "<i> - <a style = " + buttonStyle + "href='http://journal.roll20.net/character/" + tc.character.get('_id') + "'>" + tc.character.get('name') + "</a></i>" : ""); //" <a style = " + buttonStyle + "href='http://journal.roll20.net/character/" + tc.character.get('_id') + "'>&#128442;</a>"
                            characterSheet = ((characterSheetButton) ? "</i> <a title = '" + tc.character.get('name') + "' style = " + buttonStyle + "href='http://journal.roll20.net/character/" + tc.character.get('_id') + "'><b>" + linkBox + "</b></a>" : characterSheet); //" <a style = " + buttonStyle + "href='http://journal.roll20.net/character/" + tc.character.get('_id') + "'>&#128442;</a>"
                            printButton = ((isPrintbutton) ? "<a style = " + printButtonStyle + "title = 'print to chat' href='!RPechochat --" + tc.token.get('name') + "'>w</a>" : "");
                            tokenNotesButton = ((isTokenNotesButton) ? "<a style = " + notesButtonStyle + "title = 'token notes'  href='" + noteRecipient + notesHandout + " --id" + tc.token.get('_id') + "'>T</a>" : "");
                            tokenNotesRow = ((isTokenNotesRow) ? "<a style = " + rowButtonStyle + "title = 'token notes'  href='" + noteRecipient + notesHandout + " --id" + tc.token.get('_id') + "'><img src ='https://files.d20.io/images/30616033/HzIFwCZvFUEhv0D5E3Nk6A/thumb.png'style = 'float:right; width:100px; background-repeat: repeat-x; height:10px; !important'></a>" : "");
                            charNotesButton = ((isCharNotesButton) ? "<a style = " + notesButtonStyle + " href='" + noteRecipient + notesHandout + " --charnote --id" + tc.token.get('_id') + "'>C</a>" : "");
                            bioButton = ((isBioButton) ? "<a style = " + notesButtonStyle + "title = 'bio' href='" + noteRecipient + notesHandout + " --bio --id" + tc.token.get('_id') + "'>B</a>" : "");
                            avatarButton = ((isAvatarButton) ? "<a style = " + notesButtonStyle + "title = 'avatar'  href='" + noteRecipient + notesHandout + " --avatar --id" + tc.token.get('_id') + "'>A</a>" : "");
                            imageButton = ((isImageButton) ? "<a style = " + notesButtonStyle + "title = 'token image'  href='" + noteRecipient + notesHandout + " --image --id" + tc.token.get('_id') + "'>&thinsp;I&thinsp;</a>" : "");
                            tooltipButton = ((isTooltipButton) ? "<a title = '" + tc.token.get('tooltip').replace(/'/g, '&apos;') + "' style = " + notesButtonStyle + " href='" + noteRecipient + notesHandout + " --tooltip --id" + tc.token.get('_id') + "'>tt</a>" : "");
                            tokenImageButton = ((isTokenImageButton) ? "<a title = 'token image' style = 'float:right; decoration:none; background-color: transparent; border: none; color: #999; padding:0px; font-family: pictos; margin-right:3px; !important'" + " href='" + noteRecipient + notesHandout + " --tokenimage --id" + tc.token.get('_id') + "'>L</a>" : "");
                            //tokenImageButton = ((isTokenImageButton) ? "<a style = 'float:right; opacity: 0.5'  href='" + noteRecipient + " --tokenimage --id" + tc.token.get('_id') + "'><img src='" + tc.token.get('imgsrc') + "' alt='token image' width='18' height='18'></a>" : "");



                            noteButtons = tokenNotesRow + tokenImageButton + tokenNotesButton + charNotesButton + bioButton + avatarButton + tooltipButton + imageButton;

                            if (compact === false) {
                                tokenGraphicHeight = 37;
                                switch (sheet) {
                                    case "D&D 5th Edition by Roll20":
                                        secondline = ((subTitle) ? "&#10;<span style='display: block; font-size:12px; line-height:1; color:#aaa'>" + ((getAttrByName(tc.character.get('_id'), 'npc_type')) ? getAttrByName(tc.character.get('_id'), 'npc_type') : getAttrByName(tc.character.get('_id'), 'class_display')) + '</span>' : "");
                                        break;
                                    case "D&D 5E Shaped":
                                        secondline = ((subTitle) ? "&#10;<span style='display: block; font-size:12px; line-height:1; color:#aaa'>" + ((getAttrByName(tc.character.get('_id'), 'is_npc') === '1') ? getAttrByName(tc.character.get('_id'), 'type') : getAttrByName(tc.character.get('_id'), 'class_and_level')) + '</span>' : "");
                                        break;
                                    case "Pathfinder First Edition by Roll20":
                                        secondline = ((subTitle) ? "&#10;<span style='display: block; font-size:12px; line-height:1; color:#aaa'>" + ((getAttrByName(tc.character.get('_id'), 'npc')) ? getAttrByName(tc.character.get('_id'), 'npc_type') : getAttrByName(tc.character.get('_id'), 'race') + ", " + getAttrByName(tc.character.get('_id'), 'class')) + '</span>' : "");
                                        break;
                                    case "Pathfinder Second Edition by Roll20":
                                        secondline = ((subTitle) ? "&#10;<span style='display: block; font-size:12px; line-height:1; color:#aaa'>" + ((getAttrByName(tc.character.get('_id'), 'npc_type')) ? getAttrByName(tc.character.get('_id'), 'npc_type') + ", " + getAttrByName(tc.character.get('_id'), 'traits') : getAttrByName(tc.character.get('_id'), 'class') + " - " + getAttrByName(tc.character.get('_id'), 'level') + ", background: " + getAttrByName(tc.character.get('_id'), 'background')) + '</span>' : "");
                                        break;
                                    case "Other":
                                        secondline = "";
                                        break;
                                    default:
                                        secondline = ((subTitle) ? "&#10;<span style='display: block; font-size:12px; line-height:1; color:#aaa'>" + ((getAttrByName(tc.character.get('_id'), 'npc_type')) ? getAttrByName(tc.character.get('_id'), 'npc_type') : getAttrByName(tc.character.get('_id'), 'class_display')) + '</span>' : "");
                                }
                            }
                            /*
                                                  switch (sheet) {
                                                    case 'Other':
                                                        break;
                                                    case 'Pathfinder Second Edition by Roll20':
                                                        break;
                                                    case 'D&D 5th Edition by Roll20':
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                */


                            switch (sheet) {
                                case 'Other':
                                    differentName = "";
                                    break;
                                case 'Pathfinder First Edition by Roll20':
                                    differentName = ((getAttrByName(cId, 'npc') !== 1) ? " </i><span style ='color:#eee; float:right; background:#999; margin-right:2px; padding:0px 1px !important'> PC </span><i>" : "");
                                    break;
                                case 'Pathfinder Second Edition by Roll20':
                                    differentName = ((getAttrByName(cId, 'sheet_type') !== "npc") ? " </i><span style ='color:#eee; float:right; background:#999; margin-right:2px; padding:0px 1px !important'> PC </span><i>" : "");
                                    break;
                                case 'D&D 5E Shaped':
                                    differentName = ((characterSheetLink) ? ((tc.character.get('name') !== getAttrByName(cId, 'character_name')) ? " </i><span style ='color:#eee; float:right; background:#999; margin-right:2px; padding:0px 1px !important'> " + ((getAttrByName(cId, 'character_name') !== '') ? "<span title='" + getAttrByName(cId, 'character_name') + "'>NPC</span>" : 'PC') + " </span><i>" : "") : "");
                                    break;
                                case 'D&D 5th Edition by Roll20':
                                    differentName = ((characterSheetLink) ? ((tc.character.get('name') !== getAttrByName(cId, 'npc_name')) ? " </i><span style ='color:#eee; float:right; background:#999; margin-right:2px; padding:0px 1px !important'> " + ((getAttrByName(cId, 'npc_name') !== '') ? "<span title='" + getAttrByName(cId, 'npc_name') + "'>NPC</span>" : 'PC') + " </span><i>" : "") : "");
                                    break;
                                default:
                                    differentName = "";
                                    break;
                            }



                            if (allLayers === true) {
                                lines = lines + "<div style='background-color: #eee; margin-top:6px; min-height:" + tokenGraphicHeight + "px; padding: 0px 5px;'><div style = 'float:left;'><a style = " + buttonStyle + " href='!RPpingall " + tc.token.get('_id') + "'><img style = 'height:" + tokenGraphicHeight + "px;float:left;margin-right:5px;margin-bottom:-5px;' src='" + tc.token.get('imgsrc') + "'></img></a></div>" + printButton + noteButtons + "<b>" + specificLayer(tc.token.get('_id')) + "<a style = " + buttonStyle + " href='!RPpinggm " + tc.token.get('_id') + "'>" + tc.token.get('name') + "</a></b>" + differentName + characterSheet + secondline + "</div>";
                            } else {
                                lines = lines + "<div style='background-color: #eee; margin-top:6px; min-height:" + tokenGraphicHeight + "px; padding: 0px 5px;'><div style = 'float:left;'><a style = " + buttonStyle + " href='!RPpingall " + tc.token.get('_id') + "'><img style = 'height:" + tokenGraphicHeight + "px;float:left;margin-right:5px;margin-bottom:-5px;' src='" + tc.token.get('imgsrc') + "'></img></a></div>" + printButton + noteButtons + "<b><a style = " + buttonStyle + " href='!RPpinggm " + tc.token.get('_id') + "'>" + tc.token.get('name') + "</a></b>" + differentName + characterSheet + secondline + "</div>";
                            }


                            if (attributes[0].match(/^[t|c]\|/)) {
                                attributes.forEach(a => {
                                    attribute = a.split(/\|/)[1];
                                    //detmermine whether to have each attribute on a line or several across a line
                                    separator = "<BR>";

                                    switch (attribute.charAt(attribute.length - 1)) {
                                        case ",": //three spaces
                                            attribute = attribute.substring(0, attribute.length - 1);
                                            separator = "&nbsp;&nbsp;&nbsp; ";
                                            break;
                                        case ".": //three spaces
                                            attribute = attribute.substring(0, attribute.length - 1);
                                            separator = "<span style='color:#aaa'> &vert; </span>";
                                            break;
                                        case "#": //horzontal space between rows
                                            attribute = attribute.substring(0, attribute.length - 1);
                                            separator = "<p style='margin: 1px; padding: 1px'></p>";
                                            break;
                                        case "-":
                                            attribute = attribute.substring(0, attribute.length - 1);
                                            separator = "<div style='margin: 2px 0px 2px 0px; padding: 0.5px; max-height: 1px; min-height: 1px; background-color: #eee; line-height: 10px !important'></div>";
                                            //separator = "<hr style='margin: 0em, padding: 0px, max-height 2px, line-height: 1px, background-color:#000'></hr>";
                                            break;
                                        default:
                                            attribute = attribute;
                                            separator = "<BR>";
                                    }



                                    //attribute = ((tc.character.get('npc')) === 1) ? attribute : npcSwap(attribute); //accounts for differently named attributesbetween pc and npc
                                    switch (sheet) {
                                        case "Pathfinder First Edition by Roll20": //three spaces
                                            attribute = ((npcSubstitutions) ? npcSwap(attribute, ((getAttrByName(tc.character.get('_id'), 'npc')) === "1" ? "1" : "0")) : attribute); //accounts for differently named attributesbetween pc and npc
                                            break;
                                        case "Pathfinder Second Edition by Roll20": //three spaces
                                            attribute = ((npcSubstitutions) ? npcSwap(attribute, ((getAttrByName(tc.character.get('_id'), 'sheet_type')) === "npc" ? "1" : "0")) : attribute); //accounts for differently named attributesbetween pc and npc
                                            break;
                                        case 'D&D 5th Edition by Roll20':
                                            isNPC = getAttrByName(tc.character.get('_id'), 'npc');
                                            isNPC = ((isNPC) ? isNPC.toString() : '1');
                                            attribute = ((npcSubstitutions) ? npcSwap(attribute, isNPC) : attribute); //accounts for differently named attributesbetween pc and npc
                                            break;
                                        case 'D&D 5E Shaped':
                                            isNPC = getAttrByName(tc.character.get('_id'), 'is_npc');
                                            isNPC = ((isNPC) ? isNPC.toString() : '1');
                                            attribute = ((npcSubstitutions) ? npcSwap(attribute, isNPC) : attribute); //accounts for differently named attributesbetween pc and npc
                                            break;
                                        default:
                                            attribute = attribute; //accounts for differently named attributesbetween pc and npc
                                    }
                                    target = a.split(/\|/)[0];
                                    customTag = a.split(/\|/)[2];


                                    if (attribute === "bar1" || attribute === "bar2" || attribute === "bar3") {
                                        value = tc.token.get(attribute + "_value") + "/" + tc.token.get(attribute + "_max")
                                    } else {
                                        if (target === 't') {
                                            value = tc.token.get(attribute);
                                        } else {

                                            if (undefined === tc.character.get(attribute)) {
                                                value = getAttrByName(cId, attribute);
                                            } else {
                                                value = tc.character.get(attribute);

                                            }


                                        }
                                    }

                                    if (source) {
                                        charType = (target === "t") ? tokenChar + '&#160;' : characterChar + '&#160;';
                                    } else {
                                        charType = "";
                                    }

                                    // #########Corrects for status markers
                                    if (attribute === "statusmarkers") {
                                        value = value.replace(/::\d\d\d\d\d/g, "");
                                        value = ((value.charAt(0) === ',') ? value.substring(1) : value);
                                    }
                                    
                                    // #########Corrects for token gmnotes
                                    if (attribute.match(/gmnotes|bio|notes/)) {
                                        try {
                                            value = unescape(decodeUnicode(value));
                                            value = value.replace(/\[.*?\]\((.*?\.(jpg|jpeg|png|gif))\)/g, `<img style=" max-width:100px; max-height: 200px; float:right; padding-top:0px; margin-bottom:5px; margin-left:5px" src="$1">`);
                                        }
                                        catch(err) {
                                            value = value
                                        }
                                    }
                                    
                                    // #########Corrects for status markers
                                    if (attribute === "page" || attribute === "pagename") {
                                        value = getObj('page', tc.token.get("_pageid")).get("name");
                                    }
                                    
                                    //Corrects for returns
                                    if (undefined !== value && typeof value === "string") {
                                        value = value.replace(/\n/g, '<BR>')
                                    }

                                    //sets prefix for each attribute report
                                    if (customTag) {
                                        if (customTag !== "-") {
                                            prefix = '<i>' + customTag + ': </i>'
                                        } else
                                            prefix = ''
                                    } else {
                                        prefix = '<i>' + attribute + ': </i>'
                                    }
                                    //############### TEST THIS FOR PROBLEMS ON MANY REPORT TYPES
                                    if (hideEmpty && (value === '' || undefined === value)) { } else {
                                        lines = lines + charType + prefix + value + separator;
                                    }


                                    //let attributeline = ((atrribute !== "-") ? attribute + ': ' : '') + value + separator;

                                    let attributeline = attribute + ': ' + value + separator;
                                });
                            }
                            lines = lines + newbuttonLine;

                        });

                        lines = openReport + "<span style = 'display:inline-block; width:100%;'>" + ((customTitle) ? openHeader + menuChar + repeatChar + countChar + customTitle + closeHeader : "") + ((showHeader) ? header + pageInfo : "") + "</span>" + lines + ((showFooter) ? header + pageInfo : "") + closeReport;
                }
                if (lines) {
                    //L({ reportName });
                    if (reportName) {


                        let reportHandout = findObjs({
                            type: 'handout',
                            name: reportName
                        });
                        reportHandout = reportHandout ? reportHandout[0] : undefined;



                        if (!reportHandout) {
                            reportHandout = createObj('handout', {
                                name: reportName,
                                archived: false
                            });
                            let reportHandoutid = reportHandout.get("_id");
                            sendChat('Reporter', toWhom + openReport + `Reporter has created a handout named <b>${reportName}</b>. <BR>Click <a href="http://journal.roll20.net/handout/${reportHandoutid}">here</a> to open.` + closeReport, null, {
                                noarchive: true
                            });


                        }





                        if (reportHandout) {

                            if (reportHandout) {
                                reportHandout.get("notes", function (notes) {
                                    //L({notes});
                                    if (notes.includes('<hr>')) {
                                        notes = notes.split('<hr>')[0] + '<hr>';
                                    } else {
                                        notes = '<hr>'
                                    }
                                    
                                    reportHandout.set("gmnotes", '')//+ ((displayNotes) ? "<hr>" : ""))
                                    reportHandout.set("notes", notes + lines  + '<!---End Report--->')//+ ((displayNotes) ? "<hr>" : ""))
                                });
                            }
                        } else {
                            sendChat('Reporter', toWhom + openReport + `No handout named ${reportName} was found.` + closeReport, null, {
                                noarchive: true
                            });

                        }
                    } else {

                        sendChat("Reporter", toWhom + lines + '<!---End Report--->' , null, {
                            noarchive: true
                        });
                    }



                }
            } else {
                sendChat('Reporter', toWhom + baseOpenReport + `No viable tokens found.` + closeReport, null, {
                    noarchive: true
                });



            }
        }

    });

    //##################################
    //Ping
    //##################################
    on('chat:message', (msg) => {
        if ('api' !== msg.type) {
            return;
        }

        var cmdName = /!RPping[gm|all]/;
        var msgTxt = msg.content;

        //if (msg.type == "api" && msgTxt.match(cmdName) && playerIsGM(msg.playerid)) {
        if (msg.type == "api" && msgTxt.match(cmdName)) {
            let args = msg.content.split(/\s+/);
            let token_ID = args[1];

            token = getObj('graphic', token_ID);
            if (token) {
                page = getObj('page', token.get('_pageid'));
                if (msgTxt.includes('RPpingall')) {
                    sendPing(token.get("left"), token.get("top"), page.get('_id'), msg.playerid, true);
                } else {
                    sendPing(token.get("left"), token.get("top"), page.get('_id'), msg.playerid, true, msg.playerid);
                }
            } else {
                sendChat('Reporter', '/w gm ' + openReport + `That token does not seem to exist. Perhaps it was deleted or the id is incorrect.` + closeReport, null, {
                    noarchive: true
                });

            }
        };

    });



    //##################################
    //page-mod Work in Progress
    //##################################

    on('chat:message', (msg) => {
        if ('api' !== msg.type) {
            return;
        }

        var cmdName = "!RPpage-mod";
        var msgTxt = msg.content;
        let pageAttribute = '';
        let pageValue = '';
        let pageData = getObj('page', getPageForPlayer(msg.playerid));
        let lines = '';


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

        if (msg.type == "api" && msgTxt.indexOf(cmdName) !== -1 && playerIsGM(msg.playerid)) {
            let args = msg.content.split(/\s--/);
            let commands = args[1].split(/\s+/);



            commands.forEach(c => {
                pageAttribute = c.split(/\|/)[0];
                pageValue = c.split(/\|/)[1];
                //#################### Handling cases  ########################
                //sendChat('Reporter', '/w gm pageAttribute is ' + pageAttribute + '<BR>pageValue is' + pageValue);
                if (pageAttribute === 'fog_opacity') {
                    if (pageValue >= 1 && pageValue <= 100) {
                        pageValue = pageValue / 100;
                    } else {
                        sendChat('Reporter', '/w gm ' + openReport + pageValue + ' is not a valid value for ' + pageAttribute + ' It has been set to 35%.' + closeReport, null, {
                            noarchive: true
                        });
                        //                        sendChat('Reporter', '/w gm ' + pageValue + ' is not a valid value for ' + pageAttribute + ' It has been set to 35');
                        pageValue = "0.35";
                    }
                }

                if (pageAttribute === 'daylightModeOpacity') {
                    if (pageValue >= 1 && pageValue <= 100) {
                        pageValue = pageValue / 100;
                    } else {
                        sendChat('Reporter', '/w gm ' + openReport + pageValue + ' is not a valid value for ' + pageAttribute + ' It has been set to 100%.' + closeReport, null, {
                            noarchive: true
                        });
                        pageValue = 1.0;
                    }
                }


                if (pageAttribute === 'dynamic_lighting_enabled') {
                    if (pageValue === "false" || pageValue === "true") {
                        stringToBoolean(pageValue);
                        //log('2 pageValue is now ' + pageValue);
                    } else {
                        sendChat('Reporter', '/w gm ' + openReport + pageValue + ' is not a valid value for ' + pageAttribute + ' It has been set to false.' + closeReport, null, {
                            noarchive: true
                        });
                        //                        sendChat('Reporter', '/w gm ' + pageValue + ' is not a valid value for ' + pageAttribute + ' It has been set to false.');
                        pageValue = false;
                    }
                }

                if (pageAttribute === 'daylight_mode_enabled') {
                    if (pageValue === "false" || pageValue === "true") {
                        (pageValue === 'true') ? true : false;
                    } else {
                        pageValue = false;
                        sendChat('Reporter', '/w gm ' + openReport + pageValue + ' is not a valid value for ' + pageAttribute + ' It has been set to false.' + closeReport, null, {
                            noarchive: true
                        });
                    }
                }

                //log(pageAttribute + ' is ' + pageData.get(pageAttribute));
                //log(pageAttribute + ' requested' + pageValue);
                if (pageValue === "false") {
                    pageData.set(pageAttribute, false);

                } else {
                    pageData.set(pageAttribute, pageValue);
                    pageData.set('force_lighting_refresh', true);

                }

                //pageData.set(pageAttribute, pageValue);
                //pageData.set(pageAttribute, pageValue)
                //log(pageAttribute + ' is now ' + pageData.get(pageAttribute));
                lines = lines + pageAttribute + ' has been changed to ' + (pageAttribute === "fog_opacity" ? pageValue * 100 + "%" : pageValue) + '<BR>';

            });

            sendChat('Reporter', '/w gm ' + openReport + lines + '<!---End Report--->' + closeReport, null, {
                noarchive: true
            });

        };
    });
    //log("-=> !RPpage-mod command loaded <=-")

    //##################################
    //EchoChat
    //##################################


    on('chat:message', (msg) => {
        if ('api' !== msg.type) {
            return;
        }

        var cmdName = "!RPechochat";
        var msgTxt = msg.content;

        if (msg.type == "api" && msgTxt.indexOf(cmdName) !== -1 && playerIsGM(msg.playerid)) {

            let args = msg.content.split(/\s--/);
            sendChat('echochat', '/w gm ' + args[1]);
        };
    });
    //log("-=> !RPechochat command loaded (!RPechochat) <=-")



    //##################################
    //Changelayer
    //##################################


    on('chat:message', (msg) => {
        if ('api' !== msg.type) {
            return;
        }

        var cmdName = /!RPchangelayer/;
        var msgTxt = msg.content;

        if (msg.type == "api" && msgTxt.match(cmdName) && playerIsGM(msg.playerid)) {
            let args = msg.content.split(/\s+/);
            let token_ID = args[1];
            //log('token id is ' + token_ID);
            token = getObj('graphic', token_ID);


            if (token.get('layer') === "gmlayer") {
                token.set('layer', 'objects')
            } else {
                token.set('layer', 'gmlayer')
            }


        };

    });
    //log("-=> !RPchangelayer command loaded (!RPchangelayer [token_id]) <=-")

});


{ try { throw new Error(''); } catch (e) { API_Meta.Reporter.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.Reporter.offset); } }
