// Script:   Fix Turnorder
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.fixTurnorder={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.fixTurnorder.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

on('chat:message', (msg) => {
    if (msg.type !== 'api') return;
    if (!playerIsGM(msg.playerid)) return;

    const scriptName = 'FixTurnOrder';

    /* ---------- helpers ---------- */

    const normalizeForChat = (html) =>
        html.trim().replace(/\r?\n/g, '');

    const Pictos = (char) =>
        `<span style="font-family:'Pictos';">${char}</span>`;

const getCSS = () => ({
    box: "background:#bababa;border:2px solid #666;border-radius:8px;padding:8px;font-size:12px;color:#222;",
    playerBanner: "background:#d6d6d6;border:2px solid #555;border-radius:8px;padding:6px 8px;margin-bottom:6px;line-height:24px;white-space:nowrap;",
    playerBannerImage: "height:24px;width:auto;vertical-align:middle;margin-right:6px;",
    playerBannerText: "font-size:16px;font-weight:bold;vertical-align:middle;",
    header: "font-weight:bold;margin-bottom:6px;",
    groupBox: "background:#555;border:1px solid #666;border-radius:8px;padding:6px 8px;margin:8px 0;color:#eee;",
    groupHeader: "font-weight:bold;margin:4px 0;color:#eee;",
    pageRow: "background:#d0d0d0;border:1px solid #777;border-radius:6px;padding:4px 6px;margin:4px 0;",
    tokenRow: "background:#e6e6e6;border:1px solid #999;border-radius:6px;padding:4px 6px;margin:3px 0;",
    rowItem: "color:#111;display:inline-block;vertical-align:middle;white-space:nowrap;font-weight:bold",
    trashButton: "display:inline-block;margin-right:6px;padding:2px 6px;background:#a44;color:#eee;text-decoration:none;border-radius:4px;font-size:12px;",
    tokenImage: "display:inline-block;max-height:35px;max-width:35px;border-radius:4px;margin-right:6px;vertical-align:middle;",
    tokenName: "font-weight:bold;color:#111;display:inline-block;vertical-align:middle;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;",
    footer: "margin-top:10px;text-align:right;",
    confirmButton: "font-weight:bold;padding:3px 8px;background:#156616;color:#eee;text-decoration:none;border-radius:4px;font-size:11px;",
    messageContainer: "background:#dcdcdc;border:3px solid #666;border-radius:8px;padding:8px;font-size:12px;color:#222;",
    messageTitle: "font-size:16px;font-weight:bold;margin-bottom:4px;",
    messageButton: "padding:2px 6px;background:#777;color:#eee;text-decoration:none;border-radius:4px;font-size:11px;"
});


    const PLAYER_FLAG_SRC = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjkiIGhlaWdodD0iMzUiIHZpZXdCb3g9IjAgMCAyOSAzNSIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTI4IDM0TDE1IDI0LjRMMiAzNFYzLjZDMiAyLjcyIDIuOTc1IDIgNC4xNjY2NyAySDI1LjgzMzNDMjcuMDI1IDIgMjggMi43MiAyOCAzLjZWMzRaIiBzdHJva2U9IiMwQzBDMEMiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTI3IDMzTDE0IDIzLjRMMSAzM1YyLjZDMSAxLjcyIDEuOTc1IDEgMy4xNjY2NyAxSDI0LjgzMzNDMjYuMDI1IDEgMjcgMS43MiAyNyAyLjZWMzNaIiBmaWxsPSIjRkZCQzMzIiBzdHJva2U9IiM5OTY3MDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGQ9Ik01LjUgM0M2LjMyODQzIDMgNyAzLjQ0NzcyIDcgNEw3IDIzQzcgMjMuNTUyMyA2LjMyODQzIDI0IDUuNSAyNEM0LjY3MTU3IDI0IDQgMjMuNTUyMyA0IDIzTDQgNEM0IDMuNDQ3NzIgNC42NzE1NyAzIDUuNSAzWiIgZmlsbD0iI0ZGREQ5OSIvPgo8L3N2Zz4K`;

    const sendHTML = (html) => {
        sendChat(scriptName, normalizeForChat(html), null, { noarchive: true });
    };

    const sendStyledMessage = (titleOrMessage, messageOrUndefined, isPublic = false) => {
        const css = getCSS();
        let title, message;

        if (messageOrUndefined === undefined) {
            title = scriptName;
            message = titleOrMessage;
        } else {
            title = titleOrMessage || scriptName;
            message = messageOrUndefined;
        }

        message = String(message).replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            (_, label, command) =>
                `<a href="${command}" style="${css.messageButton}">${label}</a>`
        );

        const html =
            `<div style="${css.messageContainer}">` +
                `<div style="${css.messageTitle}">${title}</div>` +
                `${message}` +
            `</div>`;

        sendChat(scriptName, `${isPublic ? '' : '/w gm '}${normalizeForChat(html)}`, null, { noarchive: true });
    };

    const getPageForPlayer = (playerid) => {
        const player = getObj('player', playerid);
        if (playerIsGM(playerid)) return player.get('lastpage') || Campaign().get('playerpageid');
        const psp = Campaign().get('playerspecificpages');
        if (psp && psp[playerid]) return psp[playerid];
        return Campaign().get('playerpageid');
    };

    /* ---------- routing ---------- */

    const args = msg.content.trim().split(/\s+/);
    if (args[0] !== '!fixturnorder') return;

    const playerPageId = Campaign().get('playerpageid');
    const gmPageId = getPageForPlayer(msg.playerid);

    /* ---------- deletions ---------- */

    if (args.length > 1) {
        if (gmPageId !== playerPageId) return;

let turnorderRaw = Campaign().get('turnorder');
if (!turnorderRaw || turnorderRaw === "") {
    sendStyledMessage('This Turnorder looks correct.');
    return;
}
        let turnorder = JSON.parse(turnorderRaw);
        let modified = false;

        if (args[1] === '--delete' && args[2]) {
            const token = getObj('graphic', args[2]);
            const page = token && getObj('page', token.get('pageid'));
            const before = turnorder.length;
            turnorder = turnorder.filter(e => e.id !== args[2]);
            modified = turnorder.length !== before;

            if (modified && token) {
                sendStyledMessage(`Turn for "${token.get('name') || 'Unnamed Token'}" from page "${page ? page.get('name') : 'Unknown Page'}" was deleted.`);
            }
        }

        if (args[1] === '--deletepage' && args[2]) {
            const page = getObj('page', args[2]);
            const before = turnorder.length;

            turnorder = turnorder.filter(e => {
                if (!e.id || e.id === '-1') return true;
                const t = getObj('graphic', e.id);
                return !t || t.get('pageid') !== args[2];
            });

            modified = turnorder.length !== before;

            if (modified) {
                sendStyledMessage(`All turns from page "${page ? page.get('name') : 'Unknown Page'}" were deleted.`);
            }
        }

        if (modified) Campaign().set('turnorder', JSON.stringify(turnorder));
        return;
    }

    /* ---------- page mismatch ---------- */

    if (gmPageId !== playerPageId) {
        const gmPage = getObj('page', gmPageId);
        const playerPage = getObj('page', playerPageId);
sendStyledMessage(
    'Page Mismatch',
    `You are viewing "${(gmPage && gmPage.get('name')) || 'Unknown Page'}", but the player ribbon is on "${(playerPage && playerPage.get('name')) || 'Unknown Page'}". Switch pages before running this command.`
);
        return;
    }

    /* ---------- scan + UI ---------- */

    let turnorderRaw = Campaign().get('turnorder');
    if (!turnorderRaw) {
        sendStyledMessage('This Turnorder looks correct.');
        return;
    }

    const turnorder = JSON.parse(turnorderRaw);
    const tokensByPage = {};
    const pageNames = {};
    const css = getCSS();

    turnorder.forEach(e => {
        if (!e.id || e.id === '-1') return;
        const t = getObj('graphic', e.id);
        if (!t || t.get('pageid') === playerPageId) return;
        const pid = t.get('pageid');
        tokensByPage[pid] = tokensByPage[pid] || [];
        tokensByPage[pid].push(t);
        if (!pageNames[pid]) {
            const p = getObj('page', pid);
            pageNames[pid] = p ? p.get('name') : 'Unknown Page';
        }
    });

    const pageIds = Object.keys(tokensByPage);
    if (!pageIds.length) {
        sendStyledMessage('This Turnorder looks correct.');
        return;
    }

const playerPage = getObj('page', playerPageId);
const currentPageName = playerPage ? playerPage.get('name') : 'Unknown Page';



let html = `<div style="${css.box}">`;
html += `<div style="${css.header}">The following tokens are in the turn order, but not on the current player page:</div>`;
html += `<div style="${css.playerBanner}"><img src="${PLAYER_FLAG_SRC}" style="${css.playerBannerImage}"><span style="${css.playerBannerText}">${currentPageName}</span></div>`;

pageIds.forEach(pid => {

    html += `<div style="${css.groupBox}">`;

    html += `<div style="${css.groupHeader}">Delete all turns from this page:</div>`;
    html +=
        `<div style="${css.pageRow}">` +
            `<a href="!fixturnorder --deletepage ${pid}" style="${css.trashButton}">${Pictos('#')}</a>` +
            `<span style="${css.rowItem}">${pageNames[pid]}</span>` +
        `</div>`;

    html += `<div style="${css.groupHeader}">Delete individual off-page turns:</div>`;

    tokensByPage[pid].forEach(t => {
        html +=
            `<div style="${css.tokenRow}">` +
                `<a href="!fixturnorder --delete ${t.id}" style="${css.trashButton}">${Pictos('#')}</a>` +
                `<img src="${t.get('imgsrc')}" style="${css.tokenImage}">` +
                `<span style="${css.tokenName}">${t.get('name') || 'Unnamed Token'}</span>` +
            `</div>`;
    });

    html += `</div>`;
});

html += `<div style="${css.footer}"><a href="!fixturnorder" style="${css.confirmButton}">Check again?</a></div></div>`;


    sendHTML(html);
});

{try{throw new Error('');}catch(e){API_Meta.fixTurnorder.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.fixTurnorder.offset);}}
