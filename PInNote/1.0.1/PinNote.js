// Script:   PinNote
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.PinNote={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PinNote.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}


(() => {
    'use strict';

    const version = '1.0.1'; //version number set here
    log('-=> PinNote v' + version + ' is loaded.');
    //Changelog
    //1.0.1 gmtext fix
    //1.0.0 Debut 


    const SCRIPT_NAME = 'PinNote';

    const isGMPlayer = (playerid) => playerIsGM(playerid);

    const getTemplate = (name) => {
        if (typeof Supernotes_Templates === 'undefined') {
            return null;
        }
        if (!name) return Supernotes_Templates.generic;
        const key = name.toLowerCase();
        return Supernotes_Templates[key] || Supernotes_Templates.generic;
    };

    const sendGenericError = (msg, text) => {
        if (typeof Supernotes_Templates === 'undefined') return;

        const t = Supernotes_Templates.generic;
        sendChat(
            SCRIPT_NAME,
            t.boxcode +
            t.titlecode + SCRIPT_NAME +
            t.textcode + text +
            '</div></div>' +
            t.footer +
            '</div>'
        );
    };


const normalizeHTML = (html) => {
    if (!html) return html;

    return html
        .replace(/\r\n/g, '')   // Windows line endings
        .replace(/\n/g, '')     // Unix line endings
        .replace(/\r/g, '');    // Old Mac line endings
};


    /* ============================================================
     * HEADER COLOR ENFORCEMENT
     * ============================================================ */

    const enforceHeaderColor = (html, template) => {
        if (!html) return html;

        const colorMatch = template.textcode.match(/color\s*:\s*([^;"]+)/i);
        if (!colorMatch) return html;

        const colorValue = colorMatch[1].trim();

        return html.replace(
            /<(h[1-4])\b([^>]*)>/gi,
            (match, tag, attrs) => {

                if (/style\s*=/i.test(attrs)) {
                    return `<${tag}${attrs.replace(
                        /style\s*=\s*["']([^"']*)["']/i,
                        (m, styleContent) =>
                            `style="${styleContent}; color: ${colorValue};"`
                    )}>`;
                }

                return `<${tag}${attrs} style="color: ${colorValue};">`;
            }
        );
    };

    /* ============================================================ */

    const parseArgs = (content) => {
        const args = {};
        content.replace(/--([^|]+)\|([^\s]+)/gi, (_, k, v) => {
            args[k.toLowerCase()] = v.toLowerCase();
            return '';
        });
        return args;
    };

    const extractHandoutSection = ({ handout, subLink, subLinkType }) => {
        return new Promise((resolve) => {

            if (!handout) return resolve(null);

            if (!subLink) {
                const field = subLinkType === 'headerGM' ? 'gmnotes' : 'notes';
                handout.get(field, (content) => resolve(content || null));
                return;
            }

            if (!['headerplayer', 'headergm'].includes(subLinkType?.toLowerCase())) {
                return resolve(null);
            }

            const field = subLinkType.toLowerCase() === 'headergm'
                ? 'gmnotes'
                : 'notes';

            handout.get(field, (content) => {
                if (!content) return resolve(null);

                const headerRegex = /<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/gi;
                let match;

                while ((match = headerRegex.exec(content)) !== null) {
                    const tagName = match[1];
                    const innerHTML = match[2];
                    const stripped = innerHTML.replace(/<[^>]+>/g, '');

                    if (stripped === subLink) {
                        const level = parseInt(tagName[1], 10);
                        const startIndex = match.index;

                        const remainder = content.slice(headerRegex.lastIndex);

                        const stopRegex = new RegExp(
                            `<h([1-${level}])\\b[^>]*>`,
                            'i'
                        );

                        const stopMatch = stopRegex.exec(remainder);

                        const endIndex = stopMatch
                            ? headerRegex.lastIndex + stopMatch.index
                            : content.length;

                        return resolve(content.slice(startIndex, endIndex));
                    }
                }

                resolve(null);
            });
        });
    };

    const transformBlockquoteMode = (html) => {

        const blockRegex = /<blockquote\b[^>]*>([\s\S]*?)<\/blockquote>/gi;

        let match;
        let lastIndex = 0;
        let playerContent = '';
        let gmContent = '';
        let found = false;

        while ((match = blockRegex.exec(html)) !== null) {
            found = true;
            gmContent += html.slice(lastIndex, match.index);
            playerContent += match[1];
            lastIndex = blockRegex.lastIndex;
        }

        gmContent += html.slice(lastIndex);

        if (!found) {
            return { player: '', gm: html };
        }

        return { player: playerContent, gm: gmContent };
    };

    on('chat:message', async (msg) => {
        if (msg.type !== 'api' || !msg.content.startsWith('!pinnote')) return;

        if (typeof Supernotes_Templates === 'undefined') {
            sendChat(SCRIPT_NAME, `/w gm PinNote requires Supernotes_Templates to be loaded.`);
            return;
        }

        const args = parseArgs(msg.content);
        const isGM = isGMPlayer(msg.playerid);

        if (!msg.selected || msg.selected.length === 0)
            return sendGenericError(msg, 'No pin selected.');

        const sel = msg.selected.find(s => s._type === 'pin');
        if (!sel)
            return sendGenericError(msg, 'Selected object is not a pin.');

        const pin = getObj('pin', sel._id);
        if (!pin)
            return sendGenericError(msg, 'Selected pin could not be resolved.');

        const isSynced =
            !pin.get('notesDesynced') &&
            !pin.get('gmNotesDesynced') &&
            !pin.get('imageDesynced');

        const linkType = pin.get('linkType');

        /* ============================================================
         * LINKED HANDOUT MODE
         * ============================================================ */

        if (isSynced && linkType === 'handout') {

            const handoutId = pin.get('link');
            const subLink = pin.get('subLink');
            const subLinkType = pin.get('subLinkType');
            const autoNotesType = pin.get('autoNotesType');

            const handout = getObj('handout', handoutId);
            if (!handout)
                return sendGenericError(msg, 'Linked handout not found.');

            let extracted = await extractHandoutSection({
                handout,
                subLink,
                subLinkType
            });

            if (!extracted)
                return sendGenericError(msg, 'Requested section not found in handout.');

            const template = getTemplate(args.template);
            if (!template) return;

            const sender = pin.get('title') || SCRIPT_NAME;
            const titleText = subLink || sender;

            if (subLink) {
                const headerStripRegex = /^<h[1-4]\b[^>]*>[\s\S]*?<\/h[1-4]>/i;
                extracted = extracted.replace(headerStripRegex, '');
            }

            let to = (args.to || 'pc').toLowerCase();
            if (!isGM) to = 'pc';

            let whisperPrefix = '';
            const extractingGM = subLinkType?.toLowerCase() === 'headergm';

            let visibleContent = extracted;
            let gmBlock = '';

            if (autoNotesType === 'blockquote') {

                const transformed = transformBlockquoteMode(extracted);

                visibleContent = enforceHeaderColor(transformed.player, template);

                if (transformed.gm && to !== 'pc') {
                    gmBlock =
                        `<div style=${template.whisperStyle}>` +
                        enforceHeaderColor(transformed.gm, template) +
                        `</div>`;
                }

            } else {
                visibleContent = enforceHeaderColor(visibleContent, template);
            }

            if (extractingGM) {
                whisperPrefix = '/w gm ';
            } else if (to === 'gm') {
                whisperPrefix = '/w gm ';
            } else if (to === 'self') {
                whisperPrefix = `/w "${msg.who}" `;
            }

            const html =
                template.boxcode +
                template.titlecode + titleText +
                template.textcode +
                (visibleContent || '') +
                gmBlock +
                '</div></div>' +
                template.footer +
                '</div>';

           sendChat(sender, whisperPrefix + normalizeHTML(html));

            return;
        }

        /* ============================================================
         * CUSTOM PIN MODE
         * ============================================================ */

        if (
            !pin.get('notesDesynced') &&
            !pin.get('gmNotesDesynced') &&
            !pin.get('imageDesynced')
        ) {
            return sendGenericError(
                msg,
                'This pin is not desynced from its linked handout.'
            );
        }

        const notes = (pin.get('notes') || '').trim();
        if (!notes)
            return sendGenericError(msg, 'This pin has no notes to display.');

        let to = (args.to || 'pc').toLowerCase();
        if (!isGM) to = 'pc';

        let whisperPrefix = '';
        if (to === 'gm') whisperPrefix = '/w gm ';
        else if (to === 'self') whisperPrefix = `/w "${msg.who}" `;

        const template = getTemplate(args.template);
        if (!template) return;

        const sender = pin.get('title') || SCRIPT_NAME;

        let imageBlock = '';
        const tooltipImage = pin.get('tooltipImage');
        if (tooltipImage) {
            imageBlock =
                `<img src="${tooltipImage}" ` +
                `style="max-width:100%; max-height:400px; display:block; margin-bottom:8px;">`;
        }

        const coloredNotes = enforceHeaderColor(notes, template);

        let gmBlock = '';
        if (isGM && to !== 'pc' && pin.get('gmNotes')) {
            gmBlock =
                `<div style=${template.whisperStyle}>` +
                enforceHeaderColor(pin.get('gmNotes'), template) +
                `</div>`;
        }

        const html =
            template.boxcode +
            template.titlecode + sender +
            template.textcode +
            imageBlock +
            coloredNotes +
            gmBlock +
            '</div></div>' +
            template.footer +
            '</div>';

        sendChat(sender, whisperPrefix + normalizeHTML(html));

    });

})();

{try{throw new Error('');}catch(e){API_Meta.PinNote.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.PinNote.offset);}}
