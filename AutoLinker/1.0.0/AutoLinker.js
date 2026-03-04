// Script:   AutoLinker
// By:       Keith Curtis and Mik Holmes
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta||{};
API_Meta.AutoLinker={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.AutoLinker.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

on("ready", () => {
    'use strict';

    const version = '1.0.0';
    log('-=> AutoLinker v' + version + ' is loaded. Type "!autolinker --help" for examples.');
    //Changelog
    //1.0.0 Debut 

    let eventLockout = false;

const autolink = (str, obj) => {
    const regex = /\[(?:([^\]|]*)|([^|]*)\|([^\]|]*))\]/g;
    if (!str) str = "";

    return str.replace(regex, (all, oneWord, link, text) => {

        // =====================================================
        // HEADER LINK WITHOUT PIPE
        // [Handout#Header]
        // =====================================================
        if (oneWord && oneWord.includes("#")) {

            if (!obj || obj.get("_type") !== "handout") return all;

            const parts = oneWord.split("#");
            const handoutName = parts[0].trim();
            const headerText = parts[1] ? parts[1].trim() : "";
            if (!headerText) return all;

            let targetID = null;

            if (handoutName === "") {
                targetID = obj.get("id");
            } else {
                const found = findObjs(
                    { _type: "handout", name: handoutName },
                    { caseInsensitive: true }
                );
                if (found && found[0]) targetID = found[0].get("id");
                else return all;
            }

            const cleanHeader = headerText.replace(/<[^>]*>/g, "");
            const encodedHeader = cleanHeader.replace(/ /g, "%20");
            const url = `http://journal.roll20.net/handout/${targetID}/#${encodedHeader}`;

            // Display text defaults to header text
            return `<a href='${url}'>${cleanHeader}</a>`;
        }

        // =====================================================
        // SINGLE WORD MODE (namespace links)
        // =====================================================
        if (oneWord && oneWord.includes(":")) {
            const spell = oneWord.split(":");
            switch (spell[0]) {
                case "5e":
                    return `<i><a href='https://roll20.net/compendium/dnd5e/${spell[1]}'>${spell[1]}</a></i>`;
                case "pf2":
                    return `<i><a href='https://roll20.net/compendium/pf2/${spell[1]}'>${spell[1]}</a></i>`;
                case "gr":
                    return `<a href="\`/gmroll ${spell[1]}">${spell[1]}</a>`;
                case "r":
                    return `<a href="\`/roll ${spell[1]}">${spell[1]}</a>`;
                case "sot-quote":
                    return `<div style="${styles.sot.quote}">${spell[1]}</div>`;
                default:
                    return all;
            }
        }

        // =====================================================
        // PIPE MODE
        // =====================================================
        if (link && text) {

            // HEADER LINK WITH PIPE
            // [Handout#Header|Text]
            if (obj && obj.get("_type") === "handout" && link.includes("#")) {

                const parts = link.split("#");
                const handoutName = parts[0].trim();
                const headerText = parts[1] ? parts[1].trim() : "";
                if (!headerText) return all;

                let targetID = null;

                if (handoutName === "") {
                    targetID = obj.get("id");
                } else {
                    const found = findObjs(
                        { _type: "handout", name: handoutName },
                        { caseInsensitive: true }
                    );
                    if (found && found[0]) targetID = found[0].get("id");
                    else return all;
                }

                const cleanHeader = headerText.replace(/<[^>]*>/g, "");
                const encodedHeader = cleanHeader.replace(/ /g, "%20");
                const url = `http://journal.roll20.net/handout/${targetID}/#${encodedHeader}`;

                return `<a href='${url}'>${text}</a>`;
            }

            // NAMESPACE LINKS WITH PIPE
            if (link.includes(":")) {
                const spell = link.split(":");
                switch (spell[0]) {
                    case "5e":
                        return `<i><a href='https://roll20.net/compendium/dnd5e/${spell[1]}'>${text}</a></i>`;
                    case "pf2":
                        return `<i><a href='https://roll20.net/compendium/pf2/${spell[1]}'>${text}</a></i>`;
                    default:
                        return all;
                }
            }

            // JOURNAL LINKS
            const targetObj = findObjs({ name: link }, { caseInsensitive: true });
            if (targetObj[0]) {
                const targetID = targetObj[0].get("id");
                const targetType = targetObj[0].get("type");

                if (targetType === "handout")
                    return `<a href='http://journal.roll20.net/handout/${targetID}'>${text}</a>`;
                else if (targetType === "character")
                    return `<a href='http://journal.roll20.net/character/${targetID}'>${text}</a>`;
            }
        }

        return all;
    });
};

    const runAutolink = (obj, field) => {
        if (!eventLockout) {
            eventLockout = true;

            obj.get(field, str => {
                const newText = autolink(str, obj);
                if (newText !== str) obj.set(field, newText);
                eventLockout = false;
            });
        }
    };


/* ============================================================
 * AUTOLINKER HELP
 * Triggered by: !autolinker --help
 * ============================================================ */

const showAutoLinkerHelp = function(playerid) {

    let helpText =
        "<p><span style='font-weight:bold; font-size:24px;'>Autolinker Help</span></p>" +
        "<p>Some examples of the autolinker functionality. These can be used on the notes/gmnotes of any handout or character.</p>" +
        "<p>Please note that this script works after you save changes to a handout, " +
        "but the handout often reloads before the script is finished. Closing and reopening the handout, or clicking Edit again, should give it enough time to properly link things.</p>" +
        "<p><code>[goblin|Jimmy]</code> will make a link with the text 'Jimmy' to the 'goblin' handout.</p>" +
        "<p><code>[5e:fireball]</code> will link to the 5e compendium page for fireball.</p>" +
        "<p><code>[5e:wall of fire|the wall]</code> will make a link with the text 'the wall' to the 5e compendium page for wall of fire</p>" +
        "<p>Currently <code>5e:</code> and <code>pf2:</code> will link to their respective compendiums.</p>" +
        "<p><b>Handout Header linking:</b></p>" +
        "<p>To link to specific headers in a handout (handouts only) use the # character.</p>" +
        "<p><code>[Dungeon of Doom#6. Zombie Chorus|See Room 6]</code> will link the header '6. Zombie Chorus' in the handout 'Dungeon of Doom', with the display text 'See Room 6'.</p>" +
        "<p>If the link goes to a header in the same handout, you do not need to specify the handout:</p>" +
        "<p><code>[#6. Zombie Chorus|See Room 6]</code> will link the header '6. Zombie Chorus' in the same handout, with the display text 'See Room 6'.</p>" +
        "<p>If you do not need the display text of the link to be different from the text of the header, you can omit that part as well:</p>" +
        "<p><code>[#6. Zombie Chorus]</code> will link the header '6. Zombie Chorus' in the same handout, with the display text '6. Zombie Chorus'.</p>";

    let styledDiv =
        "<div style='background-color:#bbb; padding:12px; border-radius:10px; border:2px solid #888; color:#111'>" +
        helpText +
        "</div>";

    let player = getObj("player", playerid);
    if (player) {
        sendChat("AutoLinker", "/w \"" + player.get("_displayname") + "\" " + styledDiv);
    }
};


/* ============================================================
 * CHAT HANDLER
 * ============================================================ */

on("chat:message", function(msg) {
    if (msg.type !== "api") return;

    if (msg.content.trim() === "!autolinker --help") {
        showAutoLinkerHelp(msg.playerid);
    }
});



    const registerEventHandlers = () => {
        on('change:handout:notes', obj => runAutolink(obj, "notes"));
        on('change:handout:gmnotes', obj => runAutolink(obj, "gmnotes"));
        on('change:character:bio', obj => runAutolink(obj, "bio"));
        on('change:character:gmnotes', obj => runAutolink(obj, "gmnotes"));
    };

    registerEventHandlers();
});

{try{throw new Error('');}catch(e){API_Meta.AutoLinker.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.AutoLinker.offset);}}