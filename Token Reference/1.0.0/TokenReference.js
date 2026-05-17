// Script:   Token Reference
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis


var TokenReference = TokenReference || (() => {
    'use strict';

    const version = '1.0.0';
    log('-=> Token Reference v' + version + ' is loaded. Use !tokenref <name> to send to chat');
    // 1.0.0 Debut



    const PAGE_NAME = 'Token Page';

    // =========================
    // Centralized CSS
    // =========================
    const CSS = {
        container: 'background-image: url(https://files.d20.io/images/459209464/Gvxg3OZzRhp_4sK7NnZhXw/original.jpg);border:1px solid #444;border-radius:6px;padding:10px;max-width:420px;font-family:Arial, sans-serif;',
        header: 'font-size:16px;font-weight:bold;color:#111;margin-bottom:8px;border-bottom:1px solid #555;padding-bottom:4px;',
        row: 'margin:6px 0;color:#111;',
        label: 'font-weight:bold;color:#111;',
        image: 'display:block;float:right;margin:-20px -5px 4px 6px;border:none;max-width:100px;height:auto;',
        link: 'color:#bf2489;text-decoration:none;font-weight:bold;',
        linkInline: 'color:#bf2489!important;font-weight:bolder;text-decoration:none!important;padding:0; background-color:transparent!important;',
        gmnotes: 'background-image:url("https://files.d20.io/images/480824890/ugCopgV2Prz1IOswa8XnfA/original.jpg?1774393520");border:1px solid #333;padding:6px;margin-top:6px;white-space:pre-wrap;color:#ccc;'
    };

    const isGM = (playerid) => playerIsGM(playerid);

    const getPage = () => findObjs({
        type: 'page',
        name: PAGE_NAME
    })[0];

    const findTokenByName = (pageId, name) => {
        const search = name.trim().toLowerCase();

        return findObjs({
            type: 'graphic',
            subtype: 'token',
            _pageid: pageId
        }).find(t => {
            const n = t.get('name');
            return n && n.toLowerCase() === search;
        });
    };

    // =========================
    // LINK PROCESSOR (FIXED)
    // =========================
    const processInlineLinks = (content) => {
        if (!content || typeof content !== 'string') return content;

        let out = content;

        // --- STEP 0: Protect image markdown links ---
        // Store them temporarily so we don't modify them
        const imageLinks = [];
        out = out.replace(
            /\[([^\]]+)\]\((https?:\/\/[^)\s]+\.(?:png|jpg|jpeg|gif|webp))\)/gi,
            (match) => {
                imageLinks.push(match);
                return `%%IMG_LINK_${imageLinks.length - 1}%%`;
            }
        );

        // --- STEP 1: Convert Markdown links (non-image only, including API commands) ---
        out = out.replace(
            /\[([^\]\n]+)\]\(([^)\s]+)\)/gi,
            (match, label, link) => {
                const trimmedLink = link.trim();

                // Skip image links (by extension)
                if (/\.(png|jpg|jpeg|gif|webp|svg)$/i.test(trimmedLink)) {
                    return match; // leave unchanged
                }

                // Build styled anchor (supports URLs AND API commands like !cmd)
                return `<a href="${trimmedLink}" style="${CSS.linkInline}">${label.trim()}</a>`;
            }
        );

        // --- STEP 2: Normalize existing <a> tags ---
        out = out.replace(
            /<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi,
            (match, href, text) => {
                const label = text && text.trim() ? text.trim() : href;
                return `<a href="${href}" style="${CSS.linkInline}">${label}</a>`;
            }
        );

        // --- STEP 3: Restore image markdown links ---
        out = out.replace(/%%IMG_LINK_(\d+)%%/g, (match, i) => imageLinks[i]);

        return out;
    };

    // =========================
    // GM NOTES DECODER
    // =========================
    // =========================
// GM NOTES DECODER (with punctuation normalization)
// =========================
const decodeGMNotes = (notes, playerid) => {
    if (!notes) return '';

    try {

        // --- Normalize “fancy” punctuation ---
let decoded = notes
    // Fix %uXXXX Unicode sequences (common for curly quotes)
    .replace(/%u2018|%u2019/g, "'")   // curly single quotes → straight
    .replace(/%u201C|%u201D/g, '"')   // curly double quotes → straight
    // Also fix literal curly quotes that somehow slipped through
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/–/g, '-')               // en dash → hyphen
    .replace(/—/g, '--')              // em dash → double hyphen
    .replace(/…/g, '...')             // ellipsis → three dots
    .replace(/[•◦]/g, '*')            // bullets → asterisk
    .replace(/[‛‟]/g, "'");           // rare single quotes → straight apostrophe

decoded = decodeURIComponent(decoded);

        // Normalize line breaks
        decoded = decoded.replace(/\\n/gi, '<br>');

        // Truncate for players only
        if (!playerIsGM(playerid)) {
            const splitIndex = decoded.indexOf('-----');
            if (splitIndex !== -1) {
                decoded = decoded.substring(0, splitIndex);
            }
        }

        // Process links BEFORE stripping HTML
        decoded = processInlineLinks(decoded);

        return decoded.trim();
    } catch (e) {
        return processInlineLinks(notes);
    }
};

    // =========================
    // BUILD OUTPUT HTML
    // =========================
    const buildOutput = (token, playerid) => {
        const name = token.get('name') || 'Unnamed Token';
        const img = token.get('imgsrc');

        const charId = token.get('represents');
        let charLink = 'None';

        if (charId) {
            const character = getObj('character', charId);
            const cname = character.get('name');
            if (character) {
                const url = `https://journal.roll20.net/character/${charId}`;
// Show actual character name for GMs, "Character Sheet" for PCs
        const label = isGM(playerid) ? cname : 'Character Sheet';
        charLink = `<a href="${url}" style="${CSS.link}">${label}</a>`;            }
        }

        // Pass playerid to decodeGMNotes
        const gmnotes = decodeGMNotes(token.get('gmnotes'), playerid);

        let report = `
            <div style="${CSS.container}">
                <img src="${img}" style="${CSS.image}" />
                <div style="${CSS.header}">${name}</div>
                <div style="${CSS.row}">
                     ${charLink}
                </div>
                <div style="${CSS.row}">
                    <div style="${CSS.gmnotes}">${gmnotes || 'None'}</div>
                </div>
            </div>
        `.replace(/\r\n|\r|\n/g, "").trim();

        return report;
    };


const showHelp = (playerid, who) => {
    const help = `
        <div style="${CSS.container}">
            <div style="${CSS.header}">TokenReference Help</div>

            <div style="${CSS.row}">
                <span style="${CSS.label}">Command:</span><br>
                <code>!tokenref &lt;token name&gt;</code>
            </div>

            <div style="${CSS.row}">
                Displays a formatted reference card for a token on a page named 
                <b>"${PAGE_NAME}"</b>. The primary use of this script is for
                providing links in handouts. By putting the command into the
                link of text in handout, you can send a reference to an 
                established PC or NPC to chat.
            </div>

            <div style="${CSS.row}">
                <span style="${CSS.label}">Behavior:</span><br>
                • Matches token names exactly (case-insensitive)<br>
                • Shows token image and GM notes<br>
                • GM notes are truncated at <code>-----</code> for players. This conforms with the Supernotes script behavior.<br>
                • Markdown-style links are converted to clickable links
            </div>

            <div style="${CSS.row}">
                <span style="${CSS.label}">GM Features:</span><br>
                • Sees full GM notes<br>
                • Character link shows actual character name
            </div>

            <div style="${CSS.row}">
                <span style="${CSS.label}">Player Features:</span><br>
                • Sees truncated notes (if applicable)<br>
                • Character link labeled "Character Sheet"
                • If player does not have permissions, they cannot open the link.
            </div>

            <div style="${CSS.row}">
                <span style="${CSS.label}">Example:</span><br>
                <code>!tokenref Goblin Scout</code>
            </div>
        </div>
    `.replace(/\r\n|\r|\n/g, "").trim();

    let whisperTo = who;
    if (isGM(playerid)) whisperTo = 'GM';
    whisperTo = whisperTo.replace(/"/g, '\\"');

    sendChat('TokenRef', `/w "${whisperTo}" ${help}`);
};


    // =========================
    // HANDLE INPUT
    // =========================
    const handleInput = (msg) => {
        if (msg.type !== 'api') return;
if (!msg.content.startsWith('!tokenref')) return;

// Help command
if (msg.content.trim() === '!tokenref' || msg.content.includes('--help')) {
    showHelp(msg.playerid, msg.who);
    return;
}
        const name = msg.content.replace('!tokenref ', '').trim();
        if (!name) return;

        const page = getPage();
        if (!page) {
            sendChat('TokenRef', '/w gm Token Page not found.');
            return;
        }

        const token = findTokenByName(page.id, name);
        if (!token) {
            sendChat('TokenRef', `/w gm No exact match found for "${name}".`);
            return;
        }

        // Pass playerid to buildOutput
        const output = buildOutput(token, msg.playerid);
        let whisperTo = msg.who;
        if (isGM(msg.playerid)) whisperTo = 'GM'; // Roll20 wants "GM" as whisper
        whisperTo = whisperTo.replace(/"/g, '\\"'); // escape quotes in player name
        sendChat('TokenRef', `/w "${whisperTo}" ${output}`);
    };

    const registerEventHandlers = () => {
        on('chat:message', handleInput);
    };

    return {
        registerEventHandlers
    };
})();

on('ready', () => {
    TokenReference.registerEventHandlers();
});