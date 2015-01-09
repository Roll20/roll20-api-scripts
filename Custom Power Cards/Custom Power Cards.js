// VERSION INFO
var PowerCards_Version = "1.0";

// VARIABLE & FUNCTION DECLARATIONS -- DO NOT ALTER!!
var PowerCardScript = PowerCardScript || {};
var getBrightness = getBrightness || {};
var hexDec = hexDec || {};

// USER CONFIGUATION
    var POWERCARD_DEFAULT_FORMAT = "";
    var POWERCARD_CUSTOM_EMOTE = true;
    var POWERCARD_USE_PLAYER_COLOR = false;
    var POWERCARD_SHOW_ATTACK_DAMAGE_TAGS = true;
    var POWERCARD_SHOW_ATTACK_DAMAGE_INFO = true;
    var POWERCARD_INLINE_ROLL_NO_HIGHLIGHT = false;
    var POWERCARD_INLINE_ROLL_COLOR_OVERRIDE = true;
    
    // ALLOW URLS IN POWERCARDS
    var ALLOW_URLS = false;
    var ALLOW_HIDDEN_URLS = false;
    
    // DEFINE SIZE & COLOR OF POWERCARD BORDER AND IF ROUNDED
    var POWERCARD_BORDER_SIZE = 1;
    var POWERCARD_BORDER_COLOR = "#000000";
    var POWERCARD_ROUNDED_CORNERS = true;
    
    // DEFINE IF CORNER OF INLINE ROLLS ARE ROUNDED
    var POWERCARD_ROUNDED_INLINE_ROLLS = true;
    
    // DEFINE COLORS FOR STANDARD INLINE ROLLS
    var POWERCARD_INLINE_BASE_BORDER = "#87850A";
    var POWERCARD_INLINE_BASE_BACKGROUND = "#FFFEA2";
    var POWERCARD_INLINE_BASE_TEXT_COLOR = "#000000";
    
    // DEFINE COLORS FOR MAXIMUM VALUE ROLLS
    var POWERCARD_INLINE_CRIT_BORDER = "#004400";
    var POWERCARD_INLINE_CRIT_BACKGROUND = "#88CC88";
    var POWERCARD_INLINE_CRIT_TEXT_COLOR = "#004400";

    // DEFINE COLOR FOR MINIMUM VALUE ROLLS
    var POWERCARD_INLINE_FAIL_BORDER = "#660000";
    var POWERCARD_INLINE_FAIL_BACKGROUND = "#FFAAAA";
    var POWERCARD_INLINE_FAIL_TEXT_COLOR = "#660000";
    
    // DEFINE COLORS FOR A ROLL WITH BOTH MINIMUM AND MAXIMUM VALUES IN THE ROLL
    var POWERCARD_INLINE_BOTH_BORDER = "#061539";
    var POWERCARD_INLINE_BOTH_BACKGROUND = "#8FA4D4";
    var POWERCARD_INLINE_BOTH_TEXT_COLOR = "#061539";

on("chat:message", function (msg) {
    // Exit if not an api command
    if (msg.type != "api") return;
    
    // Get the API Chat Command
    msg.who = msg.who.replace(" (GM)", "");
    msg.content = msg.content.replace("(GM) ", "");
    var command = msg.content.split(" ", 1)[0];
    if (command === "!power") {
        PowerCardScript.Process(msg);
    }
    if (command === "!power_version") {
        sendChat("HoneyBadger", "/w " + msg.who + " You are using version " + PowerCards_Version + " of this script.")
    }
});

PowerCardScript.Process = function(msg){
    // DEFINE VARIABLES
    var n = msg.content.split(" --");
    var PowerCard = {};
    var DisplayCard = "";
    var NumberOfAttacks = 1;
    var NumberOfDmgRolls = 1;
    var NumberOfRolls = 1;
    var Tag = "";
    var Content = "";
    var Character = "";

    // MORE USER CONFIGURATION
    // DEFINE COLORS FOR ODD/EVEN ROWS
    var POWERCARD_ODD_ROW_BGCOLOR = "#CEC7B6"; // #CEC7B6 - Default light brown
    var POWERCARD_ODD_ROW_TXCOLOR = "#000000";
    var POWERCARD_EVEN_ROW_BGCOLOR = "#B6AB91"; // #B6AB91 - Default darker brown
    var POWERCARD_EVEN_ROW_TXCOLOR = "#000000";
    
    // SHOW AVATAR/IMAGE IN CUSTOM EMOTES
    var POWERCARD_SHOW_AVATAR = true;
    
    // SET THE DEFAULT FORMAT... Override with --format| in macro
    PowerCard.format = POWERCARD_DEFAULT_FORMAT;
    
    // CREATE POWERCARD OBJECT ARRAY
    n.shift();
    n.forEach(function(token){
        Tag = token.substring(0, token.indexOf("|"));
        Content = token.substring(token.indexOf("|") + 1);
        if (Tag.substring(0, 6).toLowerCase() === "attack") {
            var attacks = parseInt(Tag.substring(6));
            if(attacks && attacks >= NumberOfAttacks) {
                NumberOfAttacks = attacks;
                Tag = "attack";
            }
        } else if (Tag.substring(0, 6).toLowerCase() === "damage") {
            var dmgs = parseInt(Tag.substring(6));
            if(dmgs && dmgs >= NumberOfDmgRolls) {
                NumberOfDmgRolls = dmgs;
                Tag = "damage";
            }
        } else if (Tag.substring(0, 9).toLowerCase() === "multiroll") {
            var mrolls = parseInt(Tag.substring(9));
            if(mrolls && mrolls >= NumberOfRolls) {
                NumberOfRolls = mrolls;
                Tag = "multiroll";
            }
        } else if (Tag.substring(0,5).toLowerCase() === "emote" && Content.charAt(0) === "!") {
            POWERCARD_SHOW_AVATAR = false;
            Content = Content.replace("!", "");
        }
        
        // PARSE FOR INLINE FORMATTING
        var f;
        // LINE BREAK
        if (Content.indexOf("^^") != -1) Content = Content.replace(/\^\^/g, "<br><br>");
        // INDENT FIRST LINE
        if (Content.indexOf("^*") != -1) Content = Content.replace(/\^\*/g, "<span style='margin-left: 1em;'></span>");
        // BOLD
        if (Content.indexOf("**") != -1) {
            // Do stuff...
            f = 1;
            while (Content.indexOf("**") != -1) {
                Content = (f % 2 == 1) ? Content.replace("**", "<b>") : Content.replace("**", "</b>");
                f++;
            }
        }
        // ITALICS
        if (Content.indexOf("__") != -1) {
            // Do stuff...
            f = 1;
            while (Content.indexOf("__") != -1) {
                Content = (f % 2 == 1) ? Content.replace("__", "<i>") : Content.replace("__", "</i>");
                f++;
            }
        }
        // URL
        if (Content.indexOf("@@") != -1 && ALLOW_URLS) {
            if (ALLOW_HIDDEN_URLS) {
                f = 1;
                while (Content.indexOf("@@") != -1) {
                    Content = (f % 2 == 1) ? Content.replace("@@", "<a href='") : Content.replace("@@", "</a>");
                    if (f % 2 == 1) {
                        Content = Content.replace("@@", "<a href='");
                        Content = Content.replace("||", "' style='color:#000; text-decoration: underline;'>");
                    }
                    f++;
                }
            } else {
                while (Content.indexOf("@@") != -1) {
                    Content = (f % 2 == 1) ? Content.replace("@@", "<a>") : Content.replace("@@", "</a>");
                    f++;
                }
            }
        }
        PowerCard[Tag] = Content;
    });
    
    // ERROR CATCH FOR EMPTY EMOTE
    if (PowerCard.emote === "") PowerCard.emote = '" "';
    
    // CREATE CUSTOM EMOTE
    if (PowerCard.charid !== undefined && PowerCard.emote !== undefined && POWERCARD_CUSTOM_EMOTE) {
        Character = getObj("character", PowerCard.charid);
        if (POWERCARD_SHOW_AVATAR) {
            PowerCard.emote = "<div style='display: table-cell; width: 50px;'><img src='" + Character.get("avatar") + "' style='height: 50px; width: 50px;'></img></div><div style='display:table-cell; width: calc(100%-50px); vertical-align: middle; font-size: 12px; font-style: italic; text-align: center;'>" + PowerCard.emote + "</div>";
        } else {
            PowerCard.emote = "<div style='display:block; width: 100%; vertical-align: middle; font-size: 12px; font-style: italic; text-align: center;'>" + PowerCard.emote + "</div>";
        }
    }
    
    // CREATE WHISPER TARGET
    var WhisperTarget = "";
    if (PowerCard.whisper !== undefined) {
        WhisperTarget = (PowerCard.whisper.toLowerCase() == "self") ? msg.who : "gm";
    }
    
    // CREATE TITLE STYLE
    var TitleStyle = " font-family: Georgia; font-size: medium; font-weight: normal; letter-spacing: 0.25px; text-align: center; vertical-align: middle; padding: 2px 0px; margin: 0px 0px 0px -10px; border: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + ";";
    
    // ROUNDED CORNERS ON TOP OF POWER CARD
    TitleStyle += (POWERCARD_ROUNDED_CORNERS) ? " border-radius: 10px 10px 0px 0px;" : "";
    
    // LIST OF PRE-SET TITLE TEXT & BACKGROUND COLORS FOR D&D 4E
    var AtWill = " color: #FFF; background-color: #040;";
    var Encounter = " color: #FFF; background-color: #400;";
    var Daily = " color: #FFF; background-color: #444;";
    var Item = " color: #FFF; background-color: #e58900;";
    var Recharge = " color: #FFF; background-color: #004;";
    
    // SET PowerCard.bgcolor TO PLAYER'S COLOR IF .bgcolor IS EQUAL TO PLAYER
    // THIS OVERRIDES TXCOLOR
    if (PowerCard.bgcolor == "player") {
        PowerCard.bgcolor = getObj("player", msg.playerid).get("color");
        PowerCard.txcolor = (getBrightness(PowerCard.bgcolor) < (255/2)) ? "#FFF" : "#000";
    }
    
    // CHECK FOR PRESET TITLE COLORS
    if (!POWERCARD_USE_PLAYER_COLOR) {
        if (PowerCard.usage !== undefined && PowerCard.txcolor === undefined && PowerCard.bgcolor === undefined) {
            // PRESET TITLE COLORS
            TitleStyle += AtWill;
            if (PowerCard.usage.toLowerCase().indexOf("encounter") != -1) TitleStyle += Encounter;
            if (PowerCard.usage.toLowerCase().indexOf("daily") != -1) TitleStyle += Daily;
            if (PowerCard.usage.toLowerCase().indexOf("item") != -1) TitleStyle += Item;
            if (PowerCard.usage.toLowerCase().indexOf("recharge") != -1) TitleStyle += Recharge;
        } else {
            // CUSTOM TITLECARD TEXT & BACKGROUND COLORS
            TitleStyle += (PowerCard.txcolor !== undefined) ? " color: " + PowerCard.txcolor + ";" : " color: #FFF;";
            TitleStyle += (PowerCard.bgcolor !== undefined) ? " background-color: " + PowerCard.bgcolor + ";" : " background-color: #040;";
        }
    } else {
        // SET TITLE BGCOLOR TO PLAYER COLOR --- OVERRIDES ALL OTHER COLOR OPTIONS ---
        var PlayerBGColor = getObj("player", msg.playerid).get("color");
        var PlayerTXColor = (getBrightness(PlayerBGColor) < (255/2)) ? "#FFF" : "#000";
        TitleStyle += " color: " + PlayerTXColor + "; background-color: " + PlayerBGColor + ";";
    }
        
    // DEFINE .leftsub and .rightsub
    if (PowerCard.leftsub === undefined) PowerCard.leftsub = (PowerCard.usage !== undefined) ? PowerCard.usage : "";
    if (PowerCard.rightsub === undefined) PowerCard.rightsub = (PowerCard.action !== undefined) ? PowerCard.action : "";
    var PowerCardDiamond = (PowerCard.leftsub === "" || PowerCard.rightsub === "") ? "" : " ? ";
    
    // BEGIN DISPLAYCARD CREATION
    PowerCard.title = PowerCard.title ? PowerCard.title.split("|").join("&" + "#013;") : PowerCard.title;
    DisplayCard += "<div style='" + TitleStyle + "' title='" + PowerCard.title + "'>" + PowerCard.name;
    DisplayCard += (PowerCard.leftsub !== "" || PowerCard.rightsub !== "") ? "<br><span style='font-family: Tahoma; font-size: small; font-weight: normal;'>" + PowerCard.leftsub + PowerCardDiamond + PowerCard.rightsub + "</span></div>" : "</div>";
    
    // ROW STYLE VARIABLES
    if (PowerCard.orowbg !== undefined) POWERCARD_ODD_ROW_BGCOLOR = PowerCard.orowbg;
    if (PowerCard.orowtx !== undefined) POWERCARD_ODD_ROW_TXCOLOR = PowerCard.orowtx;
    if (PowerCard.erowbg !== undefined) POWERCARD_EVEN_ROW_BGCOLOR = PowerCard.erowbg;
    if (PowerCard.erowtx !== undefined) POWERCARD_EVEN_ROW_TXCOLOR = PowerCard.erowtx;
    var OddRow = " background-color: " + POWERCARD_ODD_ROW_BGCOLOR + "; color: " + POWERCARD_ODD_ROW_TXCOLOR + ";";
    var EvenRow = " background-color: " + POWERCARD_EVEN_ROW_BGCOLOR + "; color: " + POWERCARD_EVEN_ROW_TXCOLOR + ";";
    var RowStyle = " margin: 0px 0px 0px -10px; padding: 5px; border-left: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + "; border-right: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + "; border-radius: 0px;";
    var RowBackground = OddRow;
    var RowNumber = 1;
    var Indent = 0;
    var KeyCount = 0;
    
    // KEY LOOP
    var Keys = Object.keys(PowerCard);
    var ReservedTags = "attack, damage, multiroll, text";
    var IgnoredTags = "format, emote, name, usage, action, defense, txcolor, bgcolor, leftsub, rightsub, ddn, desc, crit, title, whisper, orowbg, orowtx, erowbg, erowtx, charid, playercolor";
    Keys.forEach(function(Tag){
        Content = PowerCard[Tag];
        if (Tag.charAt(0) === "^") {
            Indent = (parseInt(Tag.charAt(1)) >= 0) ? Tag.charAt(1) : 1;
            Tag = (parseInt(Tag.charAt(1)) >= 0) ? Tag.substring(2) : Tag.substring(1);
            // Reset indent to 0 if ^0 is used... (Thanks to Rob J. on Roll20)
            if (Indent === "0") {
                RowStyle = " margin: 0px 0px 0px -10px; padding: 5px; border-left: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + "; border-right: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + "; border-radius: 0px;";
            } else {
                RowStyle = " margin: 0px 0px 0px -10px; padding: 5px; border-left: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + "; border-right: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + "; border-radius: 0px; padding-left: " + (Indent * 1.5) + "em;";
            }
        }
        
        // CHECK FOR RESERVED & IGNORED TAGS
        if (ReservedTags.indexOf(Tag) != -1) {
            // ATTACK ROLLS
            if (Tag.toLowerCase() == "attack") {
                for(var AttackCount = 0; AttackCount < NumberOfAttacks; AttackCount++){
                    RowBackground = (RowNumber % 2 == 1) ? OddRow : EvenRow;
                    RowNumber += 1;
                    switch (PowerCard.format) {
                        case "dnd4e": {
                            if (AttackCount === 0) {
                                PowerCard[Tag] = PowerCard[Tag].replace("]]", "]] vs " + PowerCard.defense + " ");
                                DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + (POWERCARD_SHOW_ATTACK_DAMAGE_TAGS ? "<b>Attack:</b> " : "") + PowerCard[Tag] + "</div>";
                            } else DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + (POWERCARD_SHOW_ATTACK_DAMAGE_TAGS ? "<b>Attack:</b> " : "") + "$[a" + AttackCount + "] vs " + PowerCard.defense + " </div>";
                            break;
                        }
                        case "dnd5e":
                        case "ddn": {
                            DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + (POWERCARD_SHOW_ATTACK_DAMAGE_TAGS ? "<b>Attack:</b> " : "") + PowerCard[Tag] + " vs Armor Class</div>";
                        break;
                        }
                        default: {
                            if (AttackCount === 0) DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + (POWERCARD_SHOW_ATTACK_DAMAGE_TAGS ? "<b>Attack:</b> " : "") + PowerCard[Tag] + "</div>";
                            else DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + (POWERCARD_SHOW_ATTACK_DAMAGE_TAGS ? "<b>Attack:</b> " : "") + "$[a" + AttackCount + "]</div>";
                        }
                    }
                }
            }
            
            // DAMAGE ROLLS
            if (Tag.toLowerCase() == "damage") {
                for (var DamageCount = 0; DamageCount < NumberOfDmgRolls; DamageCount++) {
                    RowBackground = (RowNumber % 2 == 1) ? OddRow : EvenRow;
                    RowNumber += 1;
                    if (DamageCount === 0) DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + (POWERCARD_SHOW_ATTACK_DAMAGE_TAGS ? "<b>Hit:</b> " : "") + PowerCard[Tag] + "</div>";
                    else DisplayCard += "<div style='" + RowStyle + RowBackground + "'>$[d" + DamageCount + "]</div>";
                }
            }
            
            // MULTIROLLS
            if (Tag.toLowerCase() == "multiroll") {
                for (var MultiRoll = 0; MultiRoll < NumberOfRolls; MultiRoll++) {
                    RowBackground = (RowNumber % 2 == 1) ? OddRow : EvenRow;
                    RowNumber += 1;
                    if (MultiRoll === 0) DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + PowerCard[Tag] + "</div>";
                    else DisplayCard += "<div style='" + RowStyle + RowBackground + "'>$[m" + MultiRoll + "]</div>";
                }
            }
        } else if (IgnoredTags.indexOf(Tag.toLowerCase()) != -1) {
            // Do nothing
        } else {
            if (Tag.toLowerCase().substring(0,4) == "text") {
                RowBackground = (RowNumber % 2 == 1) ? OddRow : EvenRow;
                RowNumber += 1;
                DisplayCard += "<div style='" + RowStyle + RowBackground + "'>" + Content + "</div>";
            } else {
                RowBackground = (RowNumber % 2 == 1) ? OddRow : EvenRow;
                RowNumber += 1;
                DisplayCard += "<div style='" + RowStyle + RowBackground + "'><b>" + Tag + ":</b> " + Content + "</div>";
            }
        }
        KeyCount++;
    });
    
    // ADD ROUNDED CORNERS & BORDER TO BOTTOM OF POWER CARD
    if (POWERCARD_ROUNDED_CORNERS && KeyCount == (Keys.length)) DisplayCard = DisplayCard.replace(/border-radius: 0px;(?!.*border-radius: 0px;)/g, "border-radius: 0px 0px 10px 10px; border-bottom: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + ";");
    if (!POWERCARD_ROUNDED_CORNERS && POWERCARD_BORDER_SIZE) DisplayCard = DisplayCard.replace(/border-radius: 0px;(?!.*border-radius: 0px;)/g, "border-bottom: " + POWERCARD_BORDER_SIZE + "px solid " + POWERCARD_BORDER_COLOR + ";");
    
    // INLINE ROLLS REPLACEMENT
    if (msg.inlinerolls !== undefined) {
        // Process inline rolls...
        for (var i = 0; i < msg.inlinerolls.length; i++){
            var inlinerollValue = buildinline(msg.inlinerolls[i], PowerCard.crit);
            DisplayCard = DisplayCard.replace("$[[" + i + "]]", inlinerollValue);
        }
        
        // Process multirolls...
        var content = PowerCard.attack;
        var idx = content ? content.substring(content.indexOf("$[[") + 3, content.indexOf("]]")) : false;
        var exp = idx && msg.inlinerolls[idx] ? msg.inlinerolls[idx].expression : undefined;
        var attExp = buildExpression(NumberOfAttacks, "a", exp);
        
        content = PowerCard.damage;
        idx = content ? content.substring(content.indexOf("$[[") + 3, content.indexOf("]]")) : false;
        exp = idx && msg.inlinerolls[idx] ? msg.inlinerolls[idx].expression : undefined;
        var dmgExp = buildExpression(NumberOfDmgRolls, "d", exp);
        
        content = PowerCard.multiroll;
        idx = content ? content.substring(content.indexOf("$[[") + 3, content.indexOf("]]")) : false;
        exp = idx && msg.inlinerolls[idx] ? msg.inlinerolls[idx].expression : undefined;
        var mltExp = buildExpression(NumberOfRolls, "m", exp);
        
        // Process multiroll results...
        var rollExp = attExp + ";" + dmgExp + ";" + mltExp;
        sendChat("", rollExp, function(m){
            var i;
            var inlinerollValue;
            for (i = 1; i < NumberOfAttacks; i++){
                inlinerollValue = buildinline(m[0].inlinerolls[i], PowerCard.crit);
                DisplayCard = DisplayCard.replace("$[a" + i + "]", inlinerollValue);
            }
            var dIndex = 1;
            for (i = NumberOfAttacks; i < NumberOfAttacks + NumberOfDmgRolls-1 ; i++){
                inlinerollValue = buildinline(m[0].inlinerolls[i], PowerCard.crit);
                DisplayCard = DisplayCard.replace("$[d" + dIndex++ + "]", inlinerollValue);
            }
            var mIndex = 1;
            for (i = NumberOfAttacks + NumberOfDmgRolls-1; i < NumberOfAttacks+NumberOfDmgRolls+NumberOfRolls-2 ; i++){
                inlinerollValue = buildinline(m[0].inlinerolls[i], PowerCard.crit);
                DisplayCard = DisplayCard.replace("$[m" + mIndex++ + "]", inlinerollValue);
            }
            // SEND OUTPUT TO CHAT
            if (PowerCard.whisper !== undefined) {
                if (PowerCard.emote !== undefined && PowerCard.charid !== undefined && POWERCARD_CUSTOM_EMOTE) {
                    sendChat("", "/desc ");
                    sendChat("", "/direct " + PowerCard.emote);
                } else if (PowerCard.emote !== undefined) {
                    sendChat(msg.who, "/emas " + PowerCard.emote);
                }
                sendChat("Power Card Script", "/w " + WhisperTarget + " " + DisplayCard);
            } else {
                if (PowerCard.emote !== undefined && PowerCard.charid !== undefined && POWERCARD_CUSTOM_EMOTE) {
                    sendChat("", "/desc ");
                    sendChat("", "/direct " + PowerCard.emote + DisplayCard);
                } else if (PowerCard.emote !== undefined) {
                    sendChat(msg.who, "/emas " + PowerCard.emote);
                    sendChat("", "/direct " + DisplayCard);
                } else {
                    sendChat("", "/direct " + DisplayCard);
                }
            }
        });
    } else {
        // NO INLINE ROLLS
        if (PowerCard.whisper !== "no" && PowerCard.whisper !== undefined) {
            if (PowerCard.emote !== undefined && PowerCard.charid !== undefined && POWERCARD_CUSTOM_EMOTE) {
                sendChat("", "/desc ");
                sendChat("", "/direct " + PowerCard.emote);
            } else if (PowerCard.emote !== undefined) {
                sendChat(msg.who, "/emas " + PowerCard.emote);
            }
            sendChat("Power Card Script", "/w " + WhisperTarget + " " + DisplayCard);
        } else {
            if (PowerCard.emote !== undefined && PowerCard.charid !== undefined && POWERCARD_CUSTOM_EMOTE) {
                sendChat("", "/desc ");
                sendChat("", "/direct " + PowerCard.emote + DisplayCard);
            } else if (PowerCard.emote !== undefined) {
                sendChat(msg.who, "/emas " + PowerCard.emote);
                sendChat("", "/direct " + DisplayCard);
            }
        }
    }
};

function buildinline(inlineroll){
    var InlineBorderRadius = (POWERCARD_ROUNDED_INLINE_ROLLS) ? 5 : 0;
    var InlineColorOverride = "";
    var values = [];
    var critRoll = false;
    var failRoll = false;
    var critCheck = false;
    var failCheck = false;
    var highRoll = false;
    var lowRoll = false;
    var noHighlight = false;
    
    inlineroll.results.rolls.forEach(function(roll){
        var result = processRoll(roll, critRoll, failRoll, highRoll, lowRoll, noHighlight);
        if (result.value.toString().indexOf("critsuccess") != -1) critCheck = true;
        if (result.value.toString().indexOf("critfail") != -1) failCheck = true;
        values.push(result.value);
        critRoll = result.critRoll;
        failRoll = result.failRoll;
        highRoll = result.highRoll;
        lowRoll = result.lowRoll;
        noHighlight = result.noHighlight;
    });
    
    // Overrides the default coloring of the inline rolls...
    if (POWERCARD_INLINE_ROLL_COLOR_OVERRIDE) {
        if (critCheck && failCheck) {
            InlineColorOverride = " background-color: " + POWERCARD_INLINE_BOTH_BACKGROUND + "; border-color: " + POWERCARD_INLINE_BOTH_BORDER + "; color: " + POWERCARD_INLINE_BOTH_TEXT_COLOR + ";";
        } else if (critCheck && !failCheck) {
            InlineColorOverride = " background-color: " + POWERCARD_INLINE_CRIT_BACKGROUND + "; border-color: " + POWERCARD_INLINE_CRIT_BORDER + "; color: " + POWERCARD_INLINE_CRIT_TEXT_COLOR + ";";
        } else if (!critCheck && failCheck) {
            InlineColorOverride = " background-color: " + POWERCARD_INLINE_FAIL_BACKGROUND + "; border-color: " + POWERCARD_INLINE_FAIL_BORDER + "; color: " + POWERCARD_INLINE_FAIL_TEXT_COLOR + ";";
        } else {
            InlineColorOverride = " background-color: " + POWERCARD_INLINE_BASE_BACKGROUND + "; border-color: " + POWERCARD_INLINE_BASE_BORDER + "; color: " + POWERCARD_INLINE_BASE_TEXT_COLOR + ";";
        }
    }
    
    // Temporary kludge to get table result...
    if (inlineroll.results.rolls[0].table !== undefined) inlineroll.results.total = inlineroll.results.rolls[0].results[0].tableItem.name;
    
    var rollOut = '<span style="text-align: center; vertical-align: text-middle; display: inline-block; min-width: 1.75em; border-radius: ' + InlineBorderRadius + 'px; padding: 0px 2px; ' + InlineColorOverride + '" title="Rolling ' + inlineroll.expression + ' = ' + values.join("");
    rollOut += '" class="a inlinerollresult showtip tipsy-n';
    rollOut += (critCheck && failCheck ? ' importantroll' : (critCheck ? ' fullcrit' : (failCheck ? ' fullfail' : ''))) + '">' + inlineroll.results.total + '</span>';
    return rollOut;
}


function buildExpression(numRolls, tag, expression){
    var rolls = [];
    for (var i = 1; i < numRolls; i++){
        rolls.push("[[" + expression +"]]");
    }
    return tag + ":" + rolls.join(" ");
}

function processRoll(roll, critRoll, failRoll, highRoll, lowRoll, noHighlight){
    if (roll.type === "C") {
        return {value: " " + roll.text + " "};
    } else if (roll.type === "L") {
        if (roll.text.indexOf("HR") != -1) highRoll = parseInt(roll.text.substring(2));
        else highRoll = false;
        if (roll.text.indexOf("LR") != -1) lowRoll = parseInt(roll.text.substring(2));
        else lowRoll = false;
        if (roll.text.indexOf("NH") != -1) {
            // Blocks highlight on an individual roll...
            noHighlight = true;
        }
        // Remove inline tags to reduce clutter...
        roll.text = roll.text.replace(/HR(\d+)/g, "");
        roll.text = roll.text.replace(/LR(\d+)/g, "");
        roll.text = roll.text.replace(/NH/g, "");
        if (roll.text !== "") roll.text = " [" + roll.text + "] ";
        return {value: roll.text, highRoll:highRoll, lowRoll:lowRoll, noHighlight:noHighlight};
    } else if (roll.type === "M") {
        roll.expr = roll.expr.toString().replace(/\+/g, " + ");
        return {value: roll.expr};
    } else if (roll.type === "R") {
        var rollValues = [];
        roll.results.forEach(function(result){
            if (result.tableItem !== undefined) {
                rollValues.push(result.tableItem.name);
            } else {
                // Reset critRoll and failRoll for next roll...
                critRoll = false;
                failRoll = false;
                // Turn off highlighting if true...
                if (POWERCARD_INLINE_ROLL_NO_HIGHLIGHT || noHighlight) {
                    critRoll = false;
                    failRoll = false;
                } else {
                    if (highRoll !== false && result.v >= highRoll || result.v === roll.sides) critRoll = true;
                    else if (lowRoll !== false && result.v <= lowRoll || result.v === 1) failRoll = true;
                }
                result.v = "<span class='basicdiceroll" + (critRoll ? ' critsuccess' : (failRoll ? ' critfail' : '')) + "'>" + result.v + "</span>";
                rollValues.push(result.v);
            }
        });
        return {value: "(" + rollValues.join(" + ") + ")", critRoll:critRoll, failRoll:failRoll, highRoll:highRoll, lowRoll:lowRoll, noHighlight:noHighlight};
    } else if (roll.type === "G") {
        var grollVal = [];
        roll.rolls.forEach(function(groll){
            groll.forEach(function(groll2){
                var result = processRoll(groll2, highRoll, lowRoll, noHighlight);
                grollVal.push(result.value);
                critRoll = critRoll || result.critRoll;
                failRoll = failRoll || result.failRoll;
                highRoll = highRoll || result.highRoll;
                lowRoll = lowRoll || result.lowRoll;
                noHighlight = noHighlight || result.noHighlight;
                });
            });
        return {value: "{" + grollVal.join(" ") + "}", critRoll:critRoll, failRoll:failRoll, highRoll:highRoll, lowRoll:lowRoll, noHighlight:noHighlight};
        }
    }

function getBrightness(hex) {
hex = hex.replace('#', '');
    var c_r = hexDec(hex.substr(0, 2));
    var c_g = hexDec(hex.substr(2, 2));
    var c_b = hexDec(hex.substr(4, 2));
    return ((c_r * 299) + (c_g * 587) + (c_b * 114)) / 1000;
    }

function hexDec(hex_string) {
hex_string = (hex_string + '').replace(/[^a-f0-9]/gi, '');
    return parseInt(hex_string, 16);
    }