// Script:   Wiki
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis

const wiki = (() => {
    'use strict';
    const version = '1.0.0'; //version number set here
    log('-=> Wiki v' + version + ' is loaded. Use "!wiki" to start.');
    //1.0.0 Debut

    const scriptName          = "Wiki";
    const VIEWPORT_HANDOUT_NAME = "Wiki - GM";
    const WIKI_HANDOUT_NAME   = "Wiki - Player";

    /* ============================================================
     * STATE
     * ============================================================ */

    const STATE_DEFAULTS = () => (
    {
        mode:               "handout",
        selectedHandout:    null,
        selectedHeaderLevel: 1,
        showBelow:          false,
        currentPage:        null,
        navBack:            [],
        navForward:         [],
        filters:
        {
            handout: { h5: [], h6: [] },
            pins:    { h5: [], h6: [] }
        },
        keywordData:
        {
            handout: { h5: [], h6: [] },
            pins:    { h5: [], h6: [] }
        },
        currentItemType:        null,
        currentItemId:          null,
        currentList:            [],
        currentIndex:           -1,
        _lastPinId:             null,
        _handoutSelectorCache:  null,
        displayHTML:            ""
    });

    const initializeState = () =>
    {
        state.Wiki        = state.Wiki        || {};
        state.Wiki.gm     = state.Wiki.gm     || STATE_DEFAULTS();
        state.Wiki.player = state.Wiki.player || STATE_DEFAULTS();

        const ensurePartition = (p) =>
        {
            p.filters             = p.filters             || {};
            p.filters.handout     = p.filters.handout     || { h5:[], h6:[] };
            p.filters.pins        = p.filters.pins        || { h5:[], h6:[] };
            p.keywordData         = p.keywordData         || {};
            p.keywordData.handout = p.keywordData.handout || { h5:[], h6:[] };
            p.keywordData.pins    = p.keywordData.pins    || { h5:[], h6:[] };
            if(!Array.isArray(p.navBack))     p.navBack     = [];
            if(!Array.isArray(p.navForward))  p.navForward  = [];
            if(!Array.isArray(p.currentList)) p.currentList = [];
            if(typeof p.currentIndex !== "number")        p.currentIndex           = -1;
            if(typeof p._lastPinId === 'undefined')       p._lastPinId             = null;
            if(typeof p._handoutSelectorCache === 'undefined') p._handoutSelectorCache = null;
            p.displayHTML = p.displayHTML || "";
        };

        ensurePartition(state.Wiki.gm);
        ensurePartition(state.Wiki.player);
    };

    const getState = (isGM = true) => isGM ? state.Wiki.gm : state.Wiki.player;

    /* ============================================================
     * CONSTANTS
     * ============================================================ */

    const WIKI_HOME_HANDOUT_NAME = "Wiki Home";
    const WIKI_HOME_DEFAULT_TEXT = `
<h1>Welcome to the Wiki</h1>
<p>This is your campaign Wiki home page. Edit this handout to customize it.</p>
<p>You can use this handout as a landing page for players, with links to other handouts, lore, and campaign information.</p>
<h2>Getting Started</h2>
<p>To navigate the Wiki:</p>
<ul>
<li>Use the <strong>HANDOUTS</strong> button to switch to handout browsing mode.</li>
<li>Use the <strong>PINS</strong> button to browse map pins on the current page.</li>
<li>Select a handout from the left panel to read it.</li>
<li>Use the header level buttons (H1–H4) to filter by section depth.</li>
</ul>
`;

    /* ============================================================
     * CSS — module-level constant, never rebuilt
     * ============================================================ */

    const CSS =
    {
        container:      "width:100%; min-height:600px;font-family:Arial, sans-serif;border:4px solid #422c26;",
        header:         "background:#422c26; color:#ddd; font-family: Nunito, Arial, sans-serif; font-weight:bold; text-align:left; font-size:20px; padding:4px;",
        layoutTable:    "width:100%; border-collapse:collapse; table-layout:fixed;",
        leftPanel:      "background:#422c26; width:220px; vertical-align:top; padding:4px; box-sizing:border-box;",
        rightPanel:     "vertical-align:top; padding:6px; box-sizing:border-box;",

        modeRow:        "display:table; width:100%; border-collapse:separate; border-spacing:4px 0; margin-bottom:4px; padding:0;",
        modeRowButton:  "display:table-cell; width:1%; font-weight:bold; text-align:center; padding:6px 8px; border:none; border-radius:4px; background:#6B3728; text-decoration:none; color:#ddd; font-size:12px; box-sizing:border-box; cursor:pointer;",

        headerRow:       "display:table; width:100%; margin-bottom:4px;",
        headerRowButton: "display:table-cell; width:1%; text-align:center; padding:4px; border:1px solid #444; background:#cfb080; text-decoration:none; color:#222; font-size:12px; box-sizing:border-box;",

        handoutButton:  "display:block; width:calc(100% - 15px); margin:4px 0; padding:6px; border:1px solid #444; border-radius:4px; background:#cfb080; text-decoration:none; color:black; font-size:12px; box-sizing:border-box;",
        listButton:     "display:block; width:100%; margin:0; padding:4px; border:1px solid #444; border-radius:4px; background:#cfb080; text-decoration:none; color:black; font-size:12px; box-sizing:border-box;",
        listButtonBase: "display:block; width:180px; margin:2px 0; padding:4px; border-radius:4px; text-decoration:none; color:#222; font-size:12px; box-sizing:border-box;",

        pinRowTable:    "width:100%; border-collapse:collapse; margin:0px 0;border-style:none;",
        pinMainCell:    "width:100px; padding:0 2px 0 0;border-style:none;",
        pinPingCell:    "width:28px; height:15px; text-align:center; padding:0; font-family:pictos;border-style:none;",

        pinPingButton:   "display:inline-block; width:10px; background:transparent; border:none; font-family:pictos; font-size:16px; text-decoration:none; color:#cfb080; cursor:pointer;",
        pinPingButtonGM: "display:inline-block; width:10px; background:transparent; border:none; font-family:pictos; font-size:16px; text-decoration:none; color:#ddd; cursor:pointer;",

        h1Button:   "background:#a47148; border:1px solid #8c5e3b; font-weight:bolder; margin-left:0px;",
        h2Button:   "background:#c28b5a; border:1px solid #a47148; font-weight:bold; margin-left:5px;",
        h3Button:   "background:#d9a873; border:1px solid #c28b5a; font-weight:normal; margin-left:10px;",
        h4Button:   "background:#f0c98f; border:1px solid #d9a873; font-weight:lighter; margin-left:15px;",

        h1ButtonGM: "background:#666; border:1px solid #666; font-weight:bolder; margin-left:0px;",
        h2ButtonGM: "background:#777; border:1px solid #777; font-weight:bold; margin-left:5px;",
        h3ButtonGM: "background:#888; border:1px solid #888; font-weight:normal; margin-left:10px;",
        h4ButtonGM: "background:#999; border:1px solid #999; font-weight:lighter; margin-left:15px;",

        keywordRow:    "text-align:left; margin:2px 0;color:#eee; font-weight:bold; background-color:#422c26;",
        keywordButton: "display:inline-block; padding:1px 2px; margin:1px; border-radius:4px; border-style:none; background:#f0c98f; color:#111; font-size:10px; cursor:pointer;",

        controlBar:    "background:#2e1f1a; padding:6px; border-bottom:1px solid #111; text-align:center;",
        controlButton: "display:inline-block; margin:0 3px; padding:4px 8px; background:#6B3728; color:#ddd !important; border-radius:4px; text-decoration:none; font-size:12px;font-weight:bold;",

        messageContainer: 'background-color:#222; color:#ccc; Border: solid 1px #444; border-radius:5px; padding:10px; position:relative; top:-15px; left:-5px; font-family: Nunito, Arial, sans-serif;',
        messageTitle:     'color:#ddd; margin-bottom:13px; font-size:16px; text-transform: capitalize; text-align:center;',
        messageButton:    'background:#444; color:#ccc; border-radius:4px; padding:2px 6px; margin-right:2px; display:inline-block; vertical-align:middle'
    };

    const getCSS = () => CSS;

    /* ============================================================
     * UTILITIES
     * ============================================================ */

    const getPageForPlayer = (playerid) =>
    {
        if(!playerid) return Campaign().get('playerpageid');
        const player = getObj('player', playerid);
        if(!player)   return Campaign().get('playerpageid');

        if(playerIsGM(playerid))
            return player.get('lastpage') || Campaign().get('playerpageid');

        const psp = Campaign().get('playerspecificpages');
        if(psp && psp[playerid]) return psp[playerid];

        return Campaign().get('playerpageid');
    };

    const withTimeout = (promise, ms = 5000, label = '') =>
        Promise.race([
            promise,
            new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms)
            )
        ]);

    const sendStyledMessage = (titleOrMessage, messageOrUndefined, isPublic = false) =>
    {
        const css = getCSS();
        let title, message;

        if(messageOrUndefined === undefined)
        {
            title   = scriptName;
            message = titleOrMessage;
        }
        else
        {
            title   = titleOrMessage || scriptName;
            message = messageOrUndefined;
        }

        message = String(message).replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            (_, label, command) =>
            `<a href="${command}" style="${css.messageButton}">${label}</a>`
        );

        const html =
            `<div style="${css.messageContainer}">
                <div style="${css.messageTitle}">${title}</div>
                ${message}
            </div>`;

        sendChat(
            scriptName,
            `${isPublic ? "" : "/w gm "}${normalizeForChat(html)}`,
            null,
            { noarchive: true }
        );
    };

    const makeButton      = (label, command, style) => `<a href="${command}" style="${style}">${label}</a>`;
    const normalizeForChat = (html) => html.replace(/\r?\n/g, '');

    const helpButton = `<a style="float:right; color:#ddd; font-family:Nunito, Arial, sans-serif; font-weight:bold; font-size:20px; padding:0px;" href="!wiki --help">?</a>`;
    const homeButton = `<a style="float:right; color:#ddd; font-family:Nunito, Arial, sans-serif; font-weight:bold; font-size:20px; padding:0px 6px 0px 0px;" href="!wiki --home">&#8962;</a>`;

    /* ============================================================
     * HELP HANDOUT
     * ============================================================ */

    const WIKI_HELP_NAME   = "Help: Wiki";
    const WIKI_HELP_AVATAR = "https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147";

const WIKI_HELP_TEXT = `
<h1>Wiki Interface Guide</h1>

<p>
The <strong>Wiki</strong> provides a unified interface for browsing campaign
information. Instead of opening multiple journal entries or searching through
pins on the map, the Wiki lets you navigate everything from one panel using
buttons and filters.
</p>

<p>
The Wiki has two separate handouts:
</p>

<ul>
<li><strong>Wiki - GM</strong> — the full GM interface, accessible only to the GM</li>
<li><strong>Wiki - Player</strong> — the player-facing interface, shared with all players</li>
</ul>

<p>
Both are updated automatically when you interact with the Wiki.
The GM sees all content including GM Notes; players see only content from
handouts shared with them, and only the player-facing portion of pin descriptions.
</p>

<hr>

<h2>Getting Started</h2>

<p>
Type <strong>!wiki</strong> in chat to open the Wiki. A link to the
<strong>Wiki - GM</strong> handout will be whispered to you. Players who type
<strong>!wiki</strong> receive a link to <strong>Wiki - Player</strong>.
</p>

<p>
The interface is divided into two main areas:
</p>

<ul>
<li><strong>Navigation Panel</strong> — the left panel, listing items you can open</li>
<li><strong>Content Panel</strong> — the right panel, showing the currently viewed content</li>
</ul>

<hr>

<h2>Wiki Home</h2>

<p>
Typing <strong>!wiki</strong> always returns to the Wiki Home handout.
The home button (<strong>&#8962;</strong>) in the top-right corner of the
interface does the same. Navigating home clears the Back and Forward history.
</p>

<p>
<strong>Wiki Home</strong> is a regular handout shared with all players.
Edit it freely to create a campaign landing page. Links to other handouts
inside Wiki Home will open directly in the Wiki panel when clicked.
</p>

<h3>Background Image</h3>

<p>
You can set a background image for the entire Wiki interface by adding an
image URL as a tag on the Wiki Home handout. The URL must begin with
<strong>https://</strong>. If multiple URL tags are present, the first one
is used. The background will tile across the interface container.
</p>

<hr>

<h2>Handout Mode</h2>

<p>
Handout Mode lets you read handouts in the content panel.
Select a handout using the chooser button at the top of the navigation panel.
The currently active mode button is outlined.
</p>

<p>
When a handout is selected, its full contents are displayed and all headers
appear in the navigation list. Click any header button to jump to that section.
The currently viewed section is outlined in the navigation list.
</p>

<h3>Header Level Buttons</h3>

<ul>
<li><strong>All</strong> — shows the entire handout and lists all headers at the highest available level</li>
<li><strong>H1–H4</strong> — filters the navigation list to show only headers at that level</li>
<li><strong><span style="font-family:Pictos">{</span></strong> — when active, also shows headers below the selected level</li>
</ul>

<h3>GM Notes Headers</h3>

<p>
For the GM, headers from the handout's <strong>GM Notes</strong> field also
appear in the navigation list, shown in grey to distinguish them from the
brown Notes headers. Clicking a grey header loads that GM Notes section into
the content panel. In the content panel, Notes and GM Notes content are
separated by a horizontal rule.
</p>

<h3>Handout Avatars</h3>

<p>
If a handout has an avatar image set, it is displayed at the top of the
content panel when viewing the full handout in All mode.
</p>

<h3>Handout Links</h3>

<p>
Links to other Roll20 handouts inside your content are automatically
rewritten so that clicking them opens the target handout directly in the
Wiki panel, rather than in a separate browser tab.
</p>

<h3>Using Keywords (H5–H6)</h3>

<p>
Keywords are optional tags used to filter sections.
Create them by adding <strong>H5</strong> or <strong>H6</strong> headers
inside a handout.
</p>

<p>Example:</p>

<pre>
H2  Abandoned Mine
H5  dungeon
H6  goblins
</pre>

<p>
Clicking a keyword button filters the navigation list to show only sections
containing that keyword. Multiple keywords can be active at once.
Use <strong>Clear All</strong> to remove active filters.
</p>

<hr>

<h2>Pin Mode</h2>

<p>
Pin Mode lists all map pins on the current page, sorted alphabetically.
The currently active mode button is outlined. The currently selected pin
is outlined in the navigation list.
</p>

<p>
Selecting a pin loads its content into the content panel.
Switching back to Handout Mode and then returning to Pin Mode will
restore the last viewed pin automatically.
</p>

<h3>Where Pin Content Comes From</h3>

<ul>
<li><strong>Direct notes</strong> — text stored directly on the pin</li>
<li><strong>A linked handout section</strong> — content pulled from a specific header in a handout, including GM Notes headers</li>
</ul>

<h3>Player Visibility in Pin Mode</h3>

<p>
For pins linked to a handout, content is separated using a
<strong>blockquote</strong>. Players see only the content inside the
blockquote. Everything after it is GM-only. The GM sees all content
with a horizontal rule separating the two sections.
</p>

<p>
Pins without a blockquote show no content to players.
</p>

<p>
Use <strong>!wiki --audit-pins</strong> to scan the current page for
player-visible linked pins that are not correctly configured. Use the
<strong>Fix</strong> and <strong>Fix All</strong> buttons in the audit
report to correct them automatically.
</p>

<h3>Ping Buttons</h3>

<p>
Each pin entry in the navigation list includes two
<span style="font-family:pictos;">@</span> buttons.
The same buttons also appear in the content panel header when a pin is selected.
</p>

<ul>
<li><strong>Gold <span style="font-family:pictos;">@</span></strong> — pings the pin location for all players</li>
<li><strong>Grey <span style="font-family:pictos;">@</span></strong> — pings the pin location for the GM only</li>
</ul>

<hr>

<h2>Content Panel Buttons</h2>

<p>
The control bar above the content panel provides navigation and action buttons.
</p>

<ul>
<li><strong>&#9664; Back</strong> — returns to the previously viewed handout or section (GM and players)</li>
<li><strong>Forward &#9654;</strong> — moves forward through history after going Back (GM and players)</li>
<li><strong>&#10005; History</strong> — clears all Back and Forward history (GM and players)</li>
<li><strong>Previous / Next</strong> — steps through the filtered navigation list sequentially</li>
<li><strong>Edit</strong> — opens the source handout for editing (GM only)</li>
<li><strong>Send to Chat</strong> — sends the current content to GM chat. Does not filter GM-only content. (GM only)</li>
<li><strong>Pintool</strong> — opens the Pintool interface if installed, in Pin Mode (GM only)</li>
</ul>

<p>
Back and Forward track navigation across different handouts and sections.
Previous and Next step through the current filtered list without affecting history.
GM and player Back/Forward histories are tracked independently.
</p>

<hr>

<h2>Player Access</h2>

<p>
Players type <strong>!wiki</strong> in chat to receive a link to
<strong>Wiki - Player</strong>. The interface updates automatically when
they interact with it. Players have their own independent navigation history.
</p>

<p>
Players can see handouts that have been shared with them via Roll20's
journal permissions. The GM can also grant access to any handout by
tagging it <strong>wiki+</strong>, regardless of journal permissions.
</p>

<hr>

<h2>Handout Tags</h2>

<ul>
<li><strong>wiki+</strong> — makes a handout visible to players in the Wiki chooser, regardless of journal permissions</li>
<li><strong>wiki-</strong> — hides a handout from the Wiki chooser entirely. The Wiki - GM and Wiki - Player interface handouts are tagged this way automatically.</li>
</ul>

<p>
Tags are set in the handout's Edit mode using the Tags field.
</p>

<hr>

<h2>Commands Reference</h2>

<ul>
<li><strong>!wiki</strong> — open the Wiki and go to Wiki Home</li>
<li><strong>!wiki --help</strong> — open this help document</li>
<li><strong>!wiki --audit-pins</strong> — scan current page for misconfigured player-visible pins</li>
</ul>

<hr>

<h2>Tips for Organizing Your Campaign</h2>

<ul>
<li>Use <strong>H1–H4</strong> in handouts for structure and navigation.</li>
<li>Use <strong>H5–H6</strong> as keyword tags for filtering.</li>
<li>Keep keywords short and consistent across handouts.</li>
<li>Use blockquotes in linked pin sections to mark the player/GM boundary.</li>
<li>Set handout avatars to give locations and topics a visual identity.</li>
<li>Edit <strong>Wiki Home</strong> with links to your most-used handouts as a campaign dashboard.</li>
<li>Add an image URL as a tag on Wiki Home to set a background texture for the interface.</li>
<li>Use <strong>wiki+</strong> to share specific handouts with players without changing journal permissions.</li>
<li>Use <strong>wiki-</strong> to hide utility or system handouts from the chooser.</li>
</ul>
`;

    function handleWikiHelp(msg)
    {
        if(msg.type !== "api") return;

        let handout = findObjs({ _type: "handout", name: WIKI_HELP_NAME })[0];

        if(!handout)
        {
            handout = createObj("handout",
            {
                name:     WIKI_HELP_NAME,
                archived: false,
                avatar:   WIKI_HELP_AVATAR,
            });
        }

        handout.set("avatar", WIKI_HELP_AVATAR);
        handout.set("notes",  WIKI_HELP_TEXT);

        const link = `http://journal.roll20.net/handout/${handout.get("_id")}`;
        const box  = `<div style="background:#111;padding:10px;border:1px solid #555;border-radius:6px;color:#eee;"><div style="font-size:110%;font-weight:bold;margin-bottom:5px;">Wiki Help</div><a href="${link}" target="_blank" style="color:#9fd3ff;font-weight:bold;">Open Help Handout</a></div>`;

        sendChat("Wiki", `/w gm ${box}`, null, { noarchive: true });
    }

    /* ============================================================
     * WIKI HOME
     * ============================================================ */

const getWikiBackgroundURL = () =>
{
    const homeHandout = findObjs({ _type: 'handout', name: WIKI_HOME_HANDOUT_NAME })[0];
    if(!homeHandout) return null;

    let tags = [];
    try
    {
        const raw = homeHandout.get('tags');
        if(Array.isArray(raw))                  tags = raw;
        else if(typeof raw === 'string' && raw) tags = JSON.parse(raw);
    }
    catch(e) {}

    return tags.find(t => /^https?:\/\//i.test(t)) || null;
};

    const getOrCreateWikiHome = () =>
    {
        let handout = findObjs({ _type: 'handout', name: WIKI_HOME_HANDOUT_NAME })[0];

        if(!handout)
        {
            handout = createObj('handout',
            {
                name:             WIKI_HOME_HANDOUT_NAME,
                inplayerjournals: 'all',
                archived:         false
            });

            if(handout) handout.set('notes', WIKI_HOME_DEFAULT_TEXT);
        }

        return handout;
    };

    /* ============================================================
     * LINK REWRITING
     * ============================================================ */

    const rewriteHandoutLinks = (html) =>
    {
        if(!html) return html;

        html = html.replace(
            /href="http:\/\/journal\.roll20\.net\/handout\/([^"#/]+)\/?(?:#([^"]+))?"/g,
            (match, handoutId, anchor) =>
            {
                if(anchor)
                {
                    const decoded = decodeURIComponent(anchor);
                    return `href="!wiki --selectHandout ${handoutId} --show ${encodeURIComponent(decoded)}"`;
                }
                return `href="!wiki --selectHandout ${handoutId}"`;
            }
        );

        html = html.replace(
            /href="(https:\/\/app\.roll20\.net\/compendium\/[^"]+)"/g,
            (match, url) =>
            {
                try   { return `href="${decodeURIComponent(url)}"`; }
                catch(e) { return `href="${url.replace(/%27/g,"'").replace(/%20/g," ").replace(/%28/g,"(").replace(/%29/g,")")}"` ; }
            }
        );

        return html;
    };

    /* ============================================================
     * CORE ASYNC HELPERS
     * ============================================================ */

    const getHandoutAvatarHTML = (handoutId) =>
    {
        const handout = getObj('handout', handoutId);
        if(!handout) return "";

        const avatar = handout.get('avatar');
        if(!avatar || avatar === '' || avatar === 'https://s3.amazonaws.com/files.d20.io/images/4277467/iKYSQhLKGRCLZuyBbZHbeA/thumb.jpg?1401938539')
            return "";

        return `<img src="${avatar}" style="max-width:100%; height:auto; display:block; margin:0 auto 8px auto;">`;
    };

    const getHandoutSectionHTML = (handoutId, headerText = null, field = 'notes', isGM = false) =>
    {
        return withTimeout(new Promise(resolve =>
        {
            const handout = getObj('handout', handoutId);
            if(!handout) return resolve(null);

            handout.get(field, notes =>
            {
                if(!notes) notes = "";

                if(isGM && field !== 'gmnotes')
                {
                    const assembleSection = (notesContent, gmNotesContent) =>
                    {
                        if(!notesContent && !gmNotesContent) return null;

                        let result = notesContent;

                        if(/<\/blockquote>/i.test(result))
                        {
                            result = result.replace(
                                /(<\/blockquote>)([\s\S]+)?/i,
                                (m, closing, after) => closing + (after ? `<hr>${after}` : '')
                            );
                        }

                        const cleanGmNotes = (gmNotesContent || "")
                            .replace(/\r?\n/g, '')
                            .replace(/^null$/i, '')
                            .trim();

                        if(cleanGmNotes) result += `<hr>${cleanGmNotes}`;

                        return result.replace(/\r?\n/g, '');
                    };

                    withTimeout(new Promise(resolveGM =>
                    {
                        handout.get('gmnotes', gmNotes =>
                        {
                            gmNotes = (gmNotes && gmNotes !== 'undefined') ? gmNotes : "";
                            resolveGM(gmNotes);
                        });
                    }), 1000, `gmnotes ${handoutId}`)
                    .then(gmNotes =>
                    {
                        if(!headerText || headerText === '__all__')
                            return resolve(assembleSection(notes, gmNotes));

                        const section   = extractSection(notes, headerText);
                        const gmSection = gmNotes ? extractSection(gmNotes, headerText) : "";

                        if(!section && !gmSection) return resolve(null);

                        resolve(assembleSection(section || "", gmSection || ""));
                    })
                    .catch(e =>
                    {
                        log(`Wiki: gmnotes timeout for ${handoutId}: ${e}`);

                        if(!headerText || headerText === '__all__')
                            return resolve(notes.replace(/\r?\n/g, '') || null);

                        const section = extractSection(notes, headerText);
                        resolve(section ? section.replace(/\r?\n/g, '') : null);
                    });
                }
                else
                {
                    const processContent = (content) =>
                    {
                        if(!content) return null;

                        if(!isGM && /<\/blockquote>/i.test(content))
                        {
                            const blockquoteEnd = content.search(/<\/blockquote>/i);
                            return content.slice(0, blockquoteEnd + '</blockquote>'.length)
                                .replace(/\r?\n/g, '');
                        }

                        return content.replace(/\r?\n/g, '');
                    };

                    if(!headerText || headerText === '__all__')
                        return resolve(processContent(notes));

                    resolve(processContent(extractSection(notes, headerText)));
                }
            });
        }), 5000, `getHandoutSectionHTML ${handoutId}`)
        .catch(e =>
        {
            log(`Wiki: getHandoutSectionHTML timeout for ${handoutId}: ${e}`);
            return null;
        });
    };

    /* ============================================================
     * NAVIGATION STATE
     * ============================================================ */

    const pushNavState = (destinationHandoutId, isGM = true) =>
    {
        const s = getState(isGM);

        if(!s.currentItemType || !s.selectedHandout) return;

        const top = s.navBack[s.navBack.length - 1];
        if(top && top.handoutId === s.selectedHandout && top.headerText === s.currentItemId) return;

        s.navBack.push(
        {
            handoutId:  s.selectedHandout,
            headerText: s.currentItemId || null
        });

        s.navForward = [];
    };

    /* ============================================================
     * PARSING & EXTRACTION
     * ============================================================ */

    const normalizeWord = (word) => word.toLowerCase().replace(/[^\w]/g, '');

    const parseArgs = (content) =>
    {
        const args  = {};
        const regex = /--([^\s]+)(?:\s+([^]*?))?(?=\s+--|$)/g;
        let match;

        while((match = regex.exec(content)) !== null)
        {
            const key = match[1];
            let raw   = (match[2] || "").trim();

            if(raw.startsWith('"') && raw.endsWith('"')) raw = raw.slice(1, -1);

            args[key] = raw || true;
        }

        return args;
    };

    const extractHeaders = (html, level) =>
    {
        const regex   = new RegExp(`<h${level}\\b[^>]*>([\\s\\S]*?)<\\/h${level}>`, 'gi');
        const results = [];
        let match;

        while((match = regex.exec(html)) !== null)
            results.push(match[1].replace(/<[^>]+>/g, '').trim());

        return results;
    };

    const getFilteredHeaders = (html, level, stateObj) =>
    {
        let headers = extractHeaders(html, level);
        const f     = stateObj.filters.handout;
        const levelKey = level === 5 ? 'h5' : 'h6';

        if(!f[levelKey].length) return headers;

        return headers.filter(h =>
            f[levelKey].every(word => normalizeWord(h).includes(word))
        );
    };

    const extractSection = (content, headerText) =>
    {
        if(!content) return null;

        const headerRegex = /<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>/gi;
        let match;

        while((match = headerRegex.exec(content)) !== null)
        {
            const level    = parseInt(match[1][1], 10);
            const stripped = match[2].replace(/<[^>]+>/g, '').trim();

            if(stripped === headerText)
            {
                const start     = match.index;
                const remainder = content.slice(headerRegex.lastIndex);
                const stopRegex = new RegExp(`<h([1-${level}])\\b`, 'i');
                const stop      = stopRegex.exec(remainder);
                const end       = stop ? headerRegex.lastIndex + stop.index : content.length;

                return content.slice(start, end);
            }
        }

        return null;
    };

    const extractKeywords = (html, level) =>
    {
        const headers = extractHeaders(html, level);
        const words   = new Set();

        headers.forEach(text =>
        {
            const cleaned = text
                .replace(/&nbsp;/gi, ' ')
                .replace(/\u00A0/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            cleaned.split(' ').forEach(w =>
            {
                const n = normalizeWord(w);
                if(n) words.add(n);
            });
        });

        return Array.from(words).sort();
    };

    const getHighestHeaderLevel = (html) =>
    {
        for(let i = 1; i <= 4; i++)
        {
            if(new RegExp(`<h${i}\\b`, 'i').test(html)) return i;
        }
        return 1;
    };

    /* ============================================================
     * PIN KEYWORDS & FILTERING
     * ============================================================ */

const buildPinKeywords = async (playerid, isGM = true) =>
{
    const s      = getState(isGM);
    const pageid = getPageForPlayer(playerid);
    if(!pageid) return;

    const pins = findObjs({ _type: 'pin', _pageid: pageid });
    const h5   = new Set();
    const h6   = new Set();

    const processedHandouts = new Set();

    for(const p of pins)
    {
        if(!p.get('link')) continue;

        const handoutId = p.get('link');
        if(processedHandouts.has(handoutId)) continue;
        processedHandouts.add(handoutId);

        const handout = getObj('handout', handoutId);
        if(!handout) continue;

        const content = await withTimeout(new Promise(resolve =>
        {
            handout.get('notes', notes =>
            {
                resolve((notes && notes !== 'undefined') ? notes : "");
            });
        }), 3000, `buildPinKeywords notes ${handoutId}`).catch(() => "");

        extractKeywords(content, 5).forEach(w => h5.add(w));
        extractKeywords(content, 6).forEach(w => h6.add(w));
    }

    s.keywordData.pins.h5 = Array.from(h5).sort();
    s.keywordData.pins.h6 = Array.from(h6).sort();
};

const filterPins = async (pins, isGM = true) =>
{
    const s            = getState(isGM);
    const result       = [];
    const contentCache = {};

    for(const p of pins)
    {
        if(p.get('linkType') !== 'handout')
        {
            if(!s.filters.pins.h5.length && !s.filters.pins.h6.length)
                result.push(p);
            continue;
        }

        const handoutId = p.get('link');
        const subHeader = p.get('subLink');
        const field     = p.get('subLinkType') === 'headerGM' ? 'gmnotes' : 'notes';
        const f         = s.filters.pins;

        if(!f.h5.length && !f.h6.length)
        {
            result.push(p);
            continue;
        }

        // Fetch the entire handout field to search within it
        const cacheKey = `${handoutId}:${field}`;
        if(!contentCache[cacheKey])
        {
            const handout = getObj('handout', handoutId);
            if(handout)
            {
                contentCache[cacheKey] = await withTimeout(new Promise(resolve =>
                {
                    handout.get(field, notes =>
                    {
                        resolve((notes && notes !== 'undefined') ? notes : "");
                    });
                }), 3000, `filterPins ${field} ${handoutId}`).catch(() => "");
            }
            else
            {
                contentCache[cacheKey] = "";
            }
        }

        // Extract just the pinned section from the full handout content
        const fullContent   = contentCache[cacheKey];
        const sectionContent = subHeader ? (extractSection(fullContent, subHeader) || "") : fullContent;

        const h5Words = extractKeywords(sectionContent, 5);
        const h6Words = extractKeywords(sectionContent, 6);

        const passH5 = !f.h5.length || f.h5.some(x => h5Words.includes(x));
        const passH6 = !f.h6.length || f.h6.some(x => h6Words.includes(x));

        if(passH5 && passH6) result.push(p);
    }

    return result;
};
    /* ============================================================
     * PIN LIST BUILDER
     * ============================================================ */

const buildPinList = async (playerid, isGM = true) =>
{
    const s      = getState(isGM);
    const css    = getCSS();
    const pageid = getPageForPlayer(playerid);
    s.currentPage = pageid;

    if(!pageid) return "No pins found.";

    let pins = findObjs({ _type: 'pin', _pageid: pageid })
        .filter(p => isGM || p.get('visibleTo') === 'all');

    if(!pins.length) return "No pins found.";

    pins = await filterPins(pins, isGM);
    if(!pins.length) return "No pins found.";

    pins.sort((a, b) =>
    {
        const titleA = (a.get('title') || a.get('subLink') || "(unnamed)")
            .replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').trim().toLowerCase();
        const titleB = (b.get('title') || b.get('subLink') || "(unnamed)")
            .replace(/&nbsp;/gi, ' ').replace(/\u00A0/g, ' ').trim().toLowerCase();
        return titleA.localeCompare(titleB, undefined, { sensitivity: 'base' });
    });

    let html        = "";
    let orderedPins = [];

    for(const p of pins)
    {
        orderedPins.push(p.id);

        const title       = p.get('title') || p.get('subLink') || "(unnamed)";
        const isActive    = s.currentItemType === "pin" && s.currentItemId === p.id;
        const activeStyle = isActive ? " outline:2px solid #ddd; outline-offset:1px;" : "";

        const mainButton   = makeButton(title, `!wiki --show-pin ${p.id}`,    css.listButton + activeStyle);
        const pingButton   = makeButton("@",   `!wiki --ping-pin ${p.id}`,    css.pinPingButton);
        const pingButtonGM = makeButton("@",   `!wiki --ping-pin-gm ${p.id}`, css.pinPingButtonGM);

        html += `<table style="${css.pinRowTable}"><tr><td style="${css.pinMainCell}">${mainButton}</td><td style="${css.pinPingCell}">${pingButton}${isGM ? pingButtonGM : ""}</td></tr></table>`;
    }

    s.currentList = orderedPins;
    return html;
};

    /* ============================================================
     * UI BUILDERS
     * ============================================================ */

    const buildHandoutSelector = (isGM = true) =>
    {
        const css = getCSS();
        const s   = getState(isGM);

        if(!s._handoutSelectorCache)
        {
            s._handoutSelectorCache = findObjs({ _type: 'handout' })
                .filter(h =>
                {
                    let tags = [];
                    try
                    {
                        const raw = h.get('tags');
                        if(Array.isArray(raw))                  tags = raw;
                        else if(typeof raw === 'string' && raw) tags = JSON.parse(raw);
                    }
                    catch(e) {}

                    if(tags.includes('wiki-')) return false;
                    return isGM || h.get('inplayerjournals') || tags.includes('wiki+');
                })
                .sort((a, b) => a.get('name').localeCompare(b.get('name')))
                .map(h => ({ name: h.get('name'), id: h.id }));
        }

        const query = "?{Select Handout|" +
            s._handoutSelectorCache.map(h => `${h.name},${h.id}`).join("|") +
            "}";

        const label = s.selectedHandout ?
            getObj('handout', s.selectedHandout)?.get('name') :
            "Choose Handout";

        return makeButton(label, `!wiki --selectHandout ${query}`, css.handoutButton);
    };

const buildModeRow = (isGM = true) =>
{
    const css  = getCSS();
    const s    = getState(isGM);
    const active = "outline:2px solid #ddd; outline-offset:1px;";

    return `<div style="${css.modeRow}">
        ${makeButton("HANDOUTS", "!wiki --mode handout", css.modeRowButton + (s.mode === "handout" ? active : ""))}
        ${makeButton("PINS",     "!wiki --mode pins",    css.modeRowButton + (s.mode === "pins"    ? active : ""))}
    </div>`;
};

    const buildHeaderRow = (isGM = true) =>
    {
        const css = getCSS();
        const s   = getState(isGM);
        let buttons = makeButton(`All`, `!wiki --level 0`, css.headerRowButton);

        for(let i = 1; i <= 4; i++)
            buttons += makeButton(`h${i}`, `!wiki --level ${i}`, css.headerRowButton);

        const belowLabel = s.showBelow ?
            `<span style="font-family:Pictos">}</span>` :
            `<span style="font-family:Pictos">{</span>`;

        buttons += makeButton(belowLabel, `!wiki --below ${s.showBelow ? "false" : "true"}`, css.headerRowButton);

        return `<div style="${css.headerRow}">${buttons}</div>`;
    };

    const buildKeywordRow = (level, isGM = true) =>
    {
        try
        {
            const css  = getCSS();
            const s    = getState(isGM);
            const mode = s.mode === "pins" ? "pins" : "handout";

            s.keywordData[mode]        = s.keywordData[mode]        || {};
            s.filters[mode]            = s.filters[mode]            || {};
            s.keywordData[mode][level] = s.keywordData[mode][level] || [];
            s.filters[mode][level]     = s.filters[mode][level]     || [];

            const words = s.keywordData[mode][level];
            let html = "";

            if(words.length)
            {
                html += `${level} Keywords: `;
                html += makeButton("Clear All", `!wiki --clear-${level}`, css.keywordButton);

                words.forEach(k =>
                {
                    const active = s.filters[mode][level].includes(k);
                    html += makeButton(k, `!wiki --filter-${level} ${k}`,
                        `${css.keywordButton}${active ? ' font-weight:bold; background:#aaa;' : ''}`);
                });
            }

            return `<div style="${css.keywordRow}" data-level="${level}">${html}</div>`;
        }
        catch(e)
        {
            log(`Wiki buildKeywordRow ERROR: ${e}`);
            return "";
        }
    };

const buildHeaderList = (htmlContent, isGM = true) =>
{
    const css = getCSS();
    const s   = getState(isGM);
    if(!s.selectedHandout) return "";

    const effectiveLevel = s.selectedHeaderLevel === 0
        ? getHighestHeaderLevel((htmlContent || "") + (isGM ? (s._cachedGmNotes || "") : ""))
        : s.selectedHeaderLevel;

    const buildButtons = (html, field, isGMField) =>
    {
        if(!html) return { buttons: "", headers: [] };

        const headerRegex    = /<(h[1-4])\b[^>]*>([\s\S]*?)<\/\1>/gi;
        let match;
        let buttons          = "";
        const orderedHeaders = [];

        while((match = headerRegex.exec(html)) !== null)
        {
            const level = parseInt(match[1][1], 10);
            const text  = match[2].replace(/<[^>]+>/g, '').trim();
            if(!text) continue;

            if(s.showBelow ? level < effectiveLevel : level !== effectiveLevel) continue;

            const start       = match.index;
            const remainder   = html.slice(headerRegex.lastIndex);
            const stopRegex   = new RegExp(`<h([1-${level}])\\b`, 'i');
            const stop        = stopRegex.exec(remainder);
            const end         = stop ? headerRegex.lastIndex + stop.index : html.length;
            const sectionHTML = html.slice(start, end);
            const sectionH5   = extractKeywords(sectionHTML, 5);
            const sectionH6   = extractKeywords(sectionHTML, 6);
            const f           = s.filters.handout;
            const passH5      = !f.h5.length || f.h5.some(x => sectionH5.includes(x));
            const passH6      = !f.h6.length || f.h6.some(x => sectionH6.includes(x));
            if(!passH5 || !passH6) continue;

            orderedHeaders.push({ text, field });

            const encoded     = encodeURIComponent(text);
            const fieldArg    = isGMField ? ` --field gmnotes` : '';
            const isActive    = s.currentItemType === "header" && s.currentItemId === text && s.mode === "handout";
            const activeStyle = isActive ? " outline:2px solid #ddd; outline-offset:1px;" : "";

            let levelStyle = "";
            switch(level)
            {
                case 1: levelStyle = isGMField ? css.h1ButtonGM : css.h1Button; break;
                case 2: levelStyle = isGMField ? css.h2ButtonGM : css.h2Button; break;
                case 3: levelStyle = isGMField ? css.h3ButtonGM : css.h3Button; break;
                case 4: levelStyle = isGMField ? css.h4ButtonGM : css.h4Button; break;
            }

            buttons += makeButton(text, `!wiki --show ${encoded}${fieldArg}`, css.listButtonBase + levelStyle + activeStyle);
        }

        return { buttons, headers: orderedHeaders };
    };

    const notesResult = buildButtons(htmlContent, 'notes', false);
    let allButtons    = notesResult.buttons;
    let allHeaders    = notesResult.headers;

    if(isGM && s.selectedHandout)
    {
        const handout = getObj('handout', s.selectedHandout);
        if(handout)
        {
            const gmContent = s._cachedGmNotes || "";
            const gmResult  = buildButtons(gmContent, 'gmnotes', true);
            allButtons += gmResult.buttons;
            allHeaders  = allHeaders.concat(gmResult.headers);
        }
    }

    s.currentList = allHeaders;
    return allButtons;
};

    const buildLeftPanel = async (htmlContent, playerid, isGM = true) =>
    {
        const s   = getState(isGM);
        let html  = buildModeRow(isGM);

        if(s.mode === "handout")
        {
            html += buildHandoutSelector(isGM);
            html += buildHeaderRow(isGM);
            html += `<div style="max-height:500px; overflow-y:auto;">`;
            html += buildHeaderList(htmlContent, isGM);
            html += `</div>`;
        }
        else if(s.mode === "pins")
        {
            html += `<div style="max-height:500px; overflow-y:auto;">`;
            html += await buildPinList(playerid, isGM);
            html += `</div>`;
        }

        return html;
    };

    const buildHeaderHTML = (isGM = true) =>
    {
        const css   = getCSS();
        const title = isGM ? scriptName : "Wiki";
        let html    = `<div style="${css.header}">${title}${isGM ? helpButton : ""}${homeButton}</div>`;
        html += buildKeywordRow('h5', isGM);
        html += buildKeywordRow('h6', isGM);
        return html;
    };

    const buildControlBar = (isGM = true) =>
    {
        const s   = getState(isGM);
        const css = getCSS();

        if(!s.currentItemType || !s.displayHTML) return "";

        let buttons = "";




        if(s.navBack.length && s.mode !== "pins")
            buttons += makeButton("&#9664; Back", "!wiki --nav-back", css.controlButton);

        if((s.navBack.length || s.navForward.length) && s.mode !== "pins")
            buttons += makeButton("&#10005; History", "!wiki --nav-clear", css.controlButton);

        if(s.navForward.length && s.mode !== "pins")
            buttons += makeButton("Forward &#9654;", "!wiki --nav-forward", css.controlButton);

        if(s.currentIndex >= 0)
        {
            buttons += makeButton("Previous", "!wiki --prev", css.controlButton);
            buttons += makeButton("Next",     "!wiki --next", css.controlButton);
        }

        // Ping buttons for currently focused pin
        if(s.mode === "pins" && s.currentItemType === "pin" && s.currentItemId)
        {
            const pin = getObj("pin", s.currentItemId);
            if(pin)
            {
                if(isGM)
                    buttons += makeButton("@", `!wiki --ping-pin-gm ${s.currentItemId}`, css.pinPingButtonGM + "float:right; margin-left:10px;font-size:24px;");
            }                buttons += makeButton("@", `!wiki --ping-pin ${s.currentItemId}`,    css.pinPingButton + "float:right; margin-left:10px;font-size:24px;");
        }

        if(isGM)
        {
            if(s.currentItemType === "header")
            {
                const url = `http://journal.roll20.net/handout/${s.selectedHandout}`;
                buttons += `<a href="${url}" style="${css.controlButton}"><span style="color:#eee!important; font-size:12px;">Open</span></a>`;//span necessary to override Roll20 default text color styling.

            }
            else if(s.currentItemType === "pin")
            {
                const pin = getObj("pin", s.currentItemId);

                if(pin && pin.get("link"))
                {
                    const url = `http://journal.roll20.net/handout/${pin.get("link")}`;
                buttons += `<a href="${url}" style="${css.controlButton}"><span style="color:#eee!important; font-size:12px;">Open</span></a>`;//span necessary to override Roll20 default text color styling.

                }
                else
                {
                    buttons += makeButton("Edit", "!wiki --edit", css.controlButton);
                }
            }

           if(s.mode === "pins" && (
    (typeof pintool !== 'undefined') ||
    (typeof API_Meta !== 'undefined' && API_Meta.PinTool)
))
                {buttons += makeButton("Pintool", "!wiki --pintool", css.controlButton)};

            /*
            if(s.mode !== "pins"){
                let handoutForDisplay = getObj("handout", s.selectedHandout);
                buttons += `<div style = "float:left; display:inline-block; font-size:16px; color:#eee; font-weight:bold;")>${handoutForDisplay.get("name")}</div>`;
            }
            */

            buttons += `<span style ="margin-left:15px; color:#eee;">Send to Chat: </span>`;
            buttons += makeButton("GM", "!wiki --send-chat", css.controlButton);
            buttons += makeButton("Players", "!wiki --send-chat-players", css.controlButton);
            //buttons += makeButton("Send to Chat", "!wiki --send-chat", css.controlButton);
        }

        return `<div style="${css.controlBar}">${buttons}</div>`;
    };

const buildViewportHTML = async (htmlContent, playerid, isGM = true) =>
{
    const css      = getCSS();
    const s        = getState(isGM);
    const leftHTML  = await buildLeftPanel(htmlContent, playerid, isGM);
    const headerHTML = buildHeaderHTML(isGM);
    const controlBar = buildControlBar(isGM);

    const bgURL          = getWikiBackgroundURL();
    const containerStyle = bgURL
        ? css.container + `background-image:url(${bgURL}); background-repeat:repeat;`
        : css.container;

    let html = `<div style="${containerStyle}">`;
    html += headerHTML;
    html += `<table style="${css.layoutTable}"><tr>`;
    html += `<td style="${css.leftPanel}">${leftHTML}</td>`;
    html += `<td style="${css.rightPanel}">${controlBar}${s.displayHTML || ""}</td>`;

    return html;
};
    /* ============================================================
     * VIEWPORT HANDOUT UPDATE
     * ============================================================ */

    const updateViewportHandout = async (htmlContent = "", playerid, isGM = true) =>
    {
        try
        {
            const targetName = isGM ? VIEWPORT_HANDOUT_NAME : WIKI_HANDOUT_NAME;
            let handout      = findObjs({ _type: 'handout', name: targetName })[0];

            if(!handout)
            {
                handout = createObj('handout', { name: targetName });
                if(!handout)
                {
                    log(`!wiki ERROR: Could not create handout "${targetName}"`);
                    return;
                }
                handout.set('tags', JSON.stringify(['wiki-']));
                if(!isGM) handout.set('inplayerjournals', 'all');
            }

            let viewportHTML = "";
            try
            {
                viewportHTML = await buildViewportHTML(htmlContent, playerid, isGM);
            }
            catch(err)
            {
                log(`!wiki ERROR: buildViewportHTML threw: ${err}`);
                viewportHTML = htmlContent;
            }

            if(handout && handout.id)
                handout.set({ notes: viewportHTML });
            else
                log(`!wiki ERROR: handout is invalid or missing id`);
        }
        catch(e)
        {
            log(`!wiki ERROR: updateViewportHandout unexpected error: ${e}`);
        }
    };

    /* ============================================================
     * ON READY
     * ============================================================ */

    on('ready', async () =>
    {
        initializeState();

        // Invalidate handout selector cache on any handout change
        on('change:handout', () =>
        {
            state.Wiki.gm._handoutSelectorCache     = null;
            state.Wiki.player._handoutSelectorCache = null;
        });

        await new Promise(resolve => setTimeout(resolve, 2000));

        const homeHandout = getOrCreateWikiHome();
        if(!homeHandout) return;

        const gmState = state.Wiki.gm;
        gmState.mode  = "handout";

        try
        {
            const content = await new Promise(resolve =>
            {
                homeHandout.get('notes', async notes =>
                {
                    await withTimeout(new Promise(resolveGM =>
                    {
                        homeHandout.get('gmnotes', gmContent =>
                        {
                            gmState._cachedGmNotes = (gmContent && gmContent !== 'undefined' && gmContent !== 'null')
                                ? gmContent : "";
                            resolveGM();
                        });
                    }), 1000, 'cachedGmNotes ready').catch(() => { gmState._cachedGmNotes = ""; });

                    resolve(notes);
                });
            });

            gmState.selectedHandout      = homeHandout.id;
            gmState.selectedHeaderLevel  = 0;
            gmState.currentList          = [];
            gmState.currentIndex         = -1;
            gmState.currentItemType      = "header";
            gmState.currentItemId        = '__all__';
            gmState.navBack              = [];
            gmState.navForward           = [];
            gmState.displayHTML          = rewriteHandoutLinks(
                getHandoutAvatarHTML(homeHandout.id) +
                (await getHandoutSectionHTML(homeHandout.id, '__all__', 'notes', true) || "")
            );

            await updateViewportHandout(content, null, true);
            log('Wiki: initialised to home page');
        }
        catch(e)
        {
            log(`Wiki: on('ready') error: ${e}`);
        }
    });


const getWikiBackgroundStyle = () =>
{
    const bgURL = getWikiBackgroundURL();
    return bgURL
        ? `background-image:url(${bgURL}); background-repeat:repeat;`
        : "background-color:#ccc;";
};

    /* ============================================================
     * CHAT HANDLER
     * ============================================================ */

    on('chat:message', async msg =>
    {
        if(msg.type !== 'api' || !msg.content.startsWith('!wiki'))
            return;

        initializeState();
        const isGM = playerIsGM(msg.playerid);
        const s    = isGM ? state.Wiki.gm : state.Wiki.player;
        const args = parseArgs(msg.content);

        if(args.help)
        {
            if(isGM) handleWikiHelp(msg);
            return;
        }

        s.currentPage = getPageForPlayer(msg.playerid);

        // =====================================================
        // PLAIN !wiki  →  ALWAYS GO TO WIKI HOME
        // =====================================================
        if(!msg.content.includes('--'))
        {
            const homeHandout = getOrCreateWikiHome();
            if(homeHandout) args.selectHandout = homeHandout.id;

            const targetName    = isGM ? VIEWPORT_HANDOUT_NAME : WIKI_HANDOUT_NAME;
            const outputHandout = findObjs({ _type: 'handout', name: targetName })[0];

            if(outputHandout)
            {
                const openURL = `http://journal.roll20.net/handout/${outputHandout.id}`;

                if(isGM)
                {
                    sendStyledMessage(targetName, `[Open the GM Wiki](${openURL})`);
                }
                else
                {
                    const css = getCSS();
                    sendChat(
                        scriptName,
                        `/w "${msg.who}" <div style="${css.messageContainer}"><div style="${css.messageTitle}">Wiki</div><a href="${openURL}" style="${css.messageButton}">Open the Wiki</a></div>`,
                        null, { noarchive: true }
                    );
                }
            }
            // Fall through to --selectHandout block
        }

        // --- home button ---
        if(args.home)
        {
            const homeHandout = getOrCreateWikiHome();
            if(homeHandout) args.selectHandout = homeHandout.id;
        }

        // --- mode switch ---
        if(args.mode)
        {
            s.mode = args.mode;

            if(s.mode === "pins")
            {
                await buildPinKeywords(msg.playerid, isGM);

                const lastPinId = s._lastPinId;
                if(lastPinId)
                {
                    const pin = getObj('pin', lastPinId);
                    if(pin)
                    {
                        let content = "";

                        if(pin.get('link'))
                        {
                            const handoutId     = pin.get('link');
                            const subHeader     = pin.get('subLink');
                            const field         = pin.get('subLinkType') === 'headerGM' ? 'gmnotes' : 'notes';
                            const resolvedField = (!isGM && field === 'gmnotes') ? 'notes' : field;

                            content = await getHandoutSectionHTML(handoutId, subHeader, resolvedField, isGM)
                                || "(empty linked handout)";

                            if(pin.get('autoNotesType') === 'blockquote')
                            {
                                if(isGM)
                                {
                                    content = content.replace(/(<\/blockquote>)([\s\S]+)/i, '$1<hr>$2');
                                }
                                else
                                {
                                    const blockquoteEnd = content.search(/<\/blockquote>/i);
                                    content = blockquoteEnd !== -1
                                        ? content.slice(0, blockquoteEnd + '</blockquote>'.length)
                                        : "(no player-visible content)";
                                }
                            }
                            else if(!isGM)
                            {
                                content = "(no player-visible content)";
                            }
                        }
                        else
                        {
                            const notes       = pin.get('notes')   || "";
                            const gmNotes     = pin.get('gmNotes') || "";
                            const safeNotes   = notes   === "undefined" ? "" : notes;
                            const safeGmNotes = gmNotes === "undefined" ? "" : gmNotes;
                            content = safeNotes + (safeGmNotes ? "<hr>" + safeGmNotes : "");
                            if(!content.trim()) content = "(empty pin)";
                        }

                        s.currentItemType = "pin";
                        s.currentItemId   = pin.id;
                        s.currentIndex    = s.currentList.indexOf(pin.id);
                        s.displayHTML     = rewriteHandoutLinks(content);
                    }
                }

                await updateViewportHandout("", msg.playerid, isGM);
                return;
            }
            else if(s.mode === "handout" && s.selectedHandout)
            {
                const handout = getObj('handout', s.selectedHandout);
                if(handout)
                {
                    await new Promise(resolve =>
                    {
                        handout.get('notes', async content =>
                        {
                            await withTimeout(new Promise(resolveGM =>
                            {
                                handout.get('gmnotes', gmContent =>
                                {
                                    s._cachedGmNotes = (gmContent && gmContent !== 'undefined' && gmContent !== 'null')
                                        ? gmContent : "";
                                    resolveGM();
                                });
                            }), 1000, 'cachedGmNotes modeSwitch').catch(() => { s._cachedGmNotes = ""; });

                            if(s.currentItemId && s.currentItemId !== '__all__' && s.currentItemType === 'header')
                            {
                                const field    = s._currentField || 'notes';
                                const restored = await getHandoutSectionHTML(s.selectedHandout, s.currentItemId, field, isGM);

                                if(restored)
                                {
                                    s.displayHTML = rewriteHandoutLinks(restored);
                                }
                                else
                                {
                                    s.currentItemId = '__all__';
                                    s.currentIndex  = -1;
                                    s.displayHTML   = rewriteHandoutLinks(
                                        getHandoutAvatarHTML(s.selectedHandout) +
                                        (await getHandoutSectionHTML(s.selectedHandout, '__all__', 'notes', isGM) || "")
                                    );
                                }
                            }
                            else
                            {
                                s.currentItemType = "header";
                                s.currentItemId   = '__all__';
                                s.currentIndex    = -1;
                                s.displayHTML     = rewriteHandoutLinks(
                                    getHandoutAvatarHTML(s.selectedHandout) +
                                    (await getHandoutSectionHTML(s.selectedHandout, '__all__', 'notes', isGM) || "")
                                );
                            }

                            await updateViewportHandout(content, msg.playerid, isGM);
                            resolve();
                        });
                    });
                }
                return;
            }
        }

        // --- handout selection ---
        if(args.selectHandout)
        {
            const homeHandout     = getOrCreateWikiHome();
            const isHomeNavigation = homeHandout && args.selectHandout === homeHandout.id;

            if(args.selectHandout !== s.selectedHandout && !isHomeNavigation)
                pushNavState(args.selectHandout, isGM);

            if(isHomeNavigation)
            {
                s.navBack    = [];
                s.navForward = [];
            }

            s.selectedHandout = args.selectHandout;
            const handout     = getObj('handout', s.selectedHandout);

            if(handout)
            {
                await new Promise(resolve =>
                {
                    handout.get('notes', async content =>
                    {
                        s.selectedHeaderLevel    = 0;
                        s.keywordData.handout.h5 = extractKeywords(content, 5);
                        s.keywordData.handout.h6 = extractKeywords(content, 6);
                        s.filters.handout.h5     = [];
                        s.filters.handout.h6     = [];

                        await withTimeout(new Promise(resolveGM =>
                        {
                            handout.get('gmnotes', gmContent =>
                            {
                                s._cachedGmNotes = (gmContent && gmContent !== 'undefined' && gmContent !== 'null')
                                    ? gmContent : "";
                                resolveGM();
                            });
                        }), 1000, 'cachedGmNotes selectHandout').catch(() => { s._cachedGmNotes = ""; });

                        if(!args.show)
                        {
                            s.currentList     = [];
                            s.currentIndex    = -1;
                            s.currentItemType = "header";
                            s.currentItemId   = '__all__';
                            s.displayHTML     = rewriteHandoutLinks(
                                getHandoutAvatarHTML(s.selectedHandout) +
                                (await getHandoutSectionHTML(s.selectedHandout, '__all__', 'notes', isGM) || "")
                            );

                            await updateViewportHandout(content, msg.playerid, isGM);
                        }

                        resolve();
                    });
                });
            }

            if(!args.show) return;
        }

        // --- header level ---
if(args.level)
{
    s.selectedHeaderLevel = parseInt(args.level, 10);

    if(s.selectedHandout)
    {
        const handout = getObj('handout', s.selectedHandout);
        if(handout)
        {
            handout.get('notes', async content =>
            {
                if(s.selectedHeaderLevel === 0)
                {
                    s.currentList     = [];
                    s.currentIndex    = -1;
                    s.currentItemType = "header";
                    s.currentItemId   = '__all__';
                    s.displayHTML     = rewriteHandoutLinks(
                        getHandoutAvatarHTML(s.selectedHandout) +
                        (await getHandoutSectionHTML(s.selectedHandout, '__all__', 'notes', isGM) || "")
                    );
                }
                await updateViewportHandout(content, msg.playerid, isGM);
            });
        }
        return;
    }
}

        // --- below toggle ---
        if(args.hasOwnProperty('below'))
        {
            s.showBelow = (args.below === "true");
            if(s.selectedHandout)
            {
                const handout = getObj('handout', s.selectedHandout);
                if(handout)
                {
                    await new Promise(resolve =>
                    {
                        handout.get('notes', async content =>
                        {
                            await updateViewportHandout(content, msg.playerid, isGM);
                            resolve();
                        });
                    });
                }
            }
            return;
        }

        // --- previous ---
        if(args.prev)
        {
            if(s.currentItemType === "header" && s.selectedHandout)
            {
                const handout = getObj('handout', s.selectedHandout);
                if(handout)
                {
                    const fullContent = await new Promise(resolve => handout.get('notes', resolve));
                    s.currentList = getFilteredHeaders(fullContent, s.selectedHeaderLevel, s);
                }
            }

            if(s.currentIndex > 0)
            {
                s.currentIndex--;
                const target      = s.currentList[s.currentIndex];
                const targetText  = target.text  || target;
                const targetField = target.field || 'notes';

                if(s.currentItemType === "header")
                {
                    args.show  = encodeURIComponent(targetText);
                    args.field = targetField;
                }
                else
                {
                    args['show-pin'] = target;
                }
            }
        }

        // --- next ---
        if(args.next)
        {
            if(s.currentItemType === "header" && s.selectedHandout)
            {
                const handout = getObj('handout', s.selectedHandout);
                if(handout)
                {
                    const fullContent = await new Promise(resolve => handout.get('notes', resolve));
                    s.currentList = getFilteredHeaders(fullContent, s.selectedHeaderLevel, s);
                }
            }

            if(s.currentIndex < s.currentList.length - 1)
            {
                s.currentIndex++;
                const target      = s.currentList[s.currentIndex];
                const targetText  = target.text  || target;
                const targetField = target.field || 'notes';

                if(s.currentItemType === "header")
                {
                    args.show  = encodeURIComponent(targetText);
                    args.field = targetField;
                }
                else
                {
                    args['show-pin'] = target;
                }
            }
        }

        // --- show a header ---
        if(args.show && s.selectedHandout)
        {
            const headerText = decodeURIComponent(args.show);
            const field      = args.field === 'gmnotes' ? 'gmnotes' : 'notes';
            const handout    = getObj('handout', s.selectedHandout);

            if(handout)
            {
                const fullContent = await new Promise(resolve => handout.get('notes', resolve));

                const crossHandout = args.selectHandout && args.selectHandout !== s.selectedHandout;
                if(!crossHandout && s.currentItemId !== headerText)
                    pushNavState(s.selectedHandout, isGM);

                s.currentList     = getFilteredHeaders(fullContent, s.selectedHeaderLevel, s);
                s.currentIndex    = s.currentList.findIndex(item => (item.text || item) === headerText);
                s.currentItemType = "header";
                s.currentItemId   = headerText;
                s.displayHTML     = rewriteHandoutLinks(
                    await getHandoutSectionHTML(s.selectedHandout, headerText, field, isGM)
                    || "Section not found."
                );

                await updateViewportHandout(fullContent, msg.playerid, isGM);
            }

            return;
        }

        // --- clear history ---
        if(args['nav-clear'])
        {
            s.navBack    = [];
            s.navForward = [];
            if(isGM)
                sendStyledMessage("Navigation history cleared.");
            else
                sendChat(scriptName, `/w "${msg.who}" Navigation history cleared.`, null, { noarchive: true });
            return;
        }

        // --- show a pin ---
        if(args['show-pin'])
        {
            const pin = getObj('pin', args['show-pin']);
            if(pin)
            {
                let content = "";

                if(pin.get('link'))
                {
                    const handoutId     = pin.get('link');
                    const subHeader     = pin.get('subLink');
                    const field         = pin.get('subLinkType') === 'headerGM' ? 'gmnotes' : 'notes';
                    const resolvedField = (!isGM && field === 'gmnotes') ? 'notes' : field;

                    content = await getHandoutSectionHTML(handoutId, subHeader, resolvedField, isGM)
                        || "(empty linked handout)";

                    if(pin.get('autoNotesType') === 'blockquote')
                    {
                        if(isGM)
                        {
                            content = content.replace(/(<\/blockquote>)([\s\S]+)/i, '$1<hr>$2');
                        }
                        else
                        {
                            const blockquoteEnd = content.search(/<\/blockquote>/i);
                            content = blockquoteEnd !== -1
                                ? content.slice(0, blockquoteEnd + '</blockquote>'.length)
                                : "(no player-visible content)";
                        }
                    }
                    else if(!isGM)
                    {
                        content = "(no player-visible content)";
                    }
                }

                s.displayHTML     = rewriteHandoutLinks(content);
                s.currentItemType = "pin";
                s.currentItemId   = pin.id;
                s._lastPinId      = pin.id;
                s.currentIndex    = s.currentList.indexOf(pin.id);

                await updateViewportHandout("", msg.playerid, isGM);
            }

            return;
        }

        // --- audit pins ---
        if(args['audit-pins'])
        {
            if(!isGM) return;

            const pageid = getPageForPlayer(msg.playerid);
            if(!pageid)
            {
                sendStyledMessage("Audit Pins", "No current page found.");
                return;
            }

            const pins   = findObjs({ _type: 'pin', _pageid: pageid });
            const issues = [];

            for(const p of pins)
            {
                const title     = p.get('title') || p.get('subLink') || p.id;
                const visibleTo = p.get('visibleTo');
                const link      = p.get('link');
                const autoNotes = p.get('autoNotesType');

                if(visibleTo === 'all' && link && autoNotes !== 'blockquote')
                    issues.push({ id: p.id, title });
            }

            if(!issues.length)
            {
                sendStyledMessage("Audit Pins", "No issues found on this page. All player-visible linked pins have autoNotesType set correctly.");
                return;
            }

            const css  = getCSS();
            let body   = `<b>${issues.length} issue(s) found on this page:</b><br><br>`;

            issues.forEach(issue =>
            {
                body += `${makeButton("Fix", `!wiki --fix-pin ${issue.id}`, css.messageButton)} <b>${issue.title}</b> — autoNotesType not set to "blockquote"<br>`;
            });

            const allIds = issues.map(i => i.id).join(',');
            body += `<br>${makeButton("Fix All", `!wiki --fix-pin-all ${allIds}`, css.messageButton)} Fix all ${issues.length} pins on this page`;

            sendStyledMessage("Audit Pins", body);
            return;
        }

        // --- fix pin ---
        if(args['fix-pin'])
        {
            if(!isGM) return;
            const pin = getObj('pin', args['fix-pin']);
            if(pin)
            {
                pin.set('autoNotesType', 'blockquote');
                sendStyledMessage("Audit Pins", `Fixed: <b>${pin.get('title') || pin.get('subLink') || pin.id}</b>`);
            }
            return;
        }

        // --- fix pin all ---
        if(args['fix-pin-all'])
        {
            if(!isGM) return;
            const ids = args['fix-pin-all'].split(',');
            let fixed = 0;
            ids.forEach(id =>
            {
                const pin = getObj('pin', id.trim());
                if(pin) { pin.set('autoNotesType', 'blockquote'); fixed++; }
            });
            sendStyledMessage("Audit Pins", `Fixed ${fixed} pin(s) on this page.`);
            return;
        }

        // --- ping a pin ---
        if(args['ping-pin'])
        {
            const pin = getObj('pin', args['ping-pin']);
            if(pin) sendPing(pin.get('x'), pin.get('y'), pin.get('_pageid'), msg.playerid, true);
            return;
        }

        // --- ping a pin gm ---
        if(args['ping-pin-gm'])
        {
            const pin = getObj('pin', args['ping-pin-gm']);
            if(pin) sendPing(pin.get('x'), pin.get('y'), pin.get('_pageid'), "", true, msg.playerid);
            return;
        }

        // --- edit ---
        if(args.edit)
        {
            if(s.currentItemType === "header")
            {
                sendChat("", `/w gm <a href="http://journal.roll20.net/handout/${s.selectedHandout}">Open Handout</a>`);
            }
            else if(s.currentItemType === "pin")
            {
                const pin = getObj("pin", s.currentItemId);
                if(pin && pin.get("linkType") === "handout")
                    sendChat("", `/w gm <a href="http://journal.roll20.net/handout/${pin.get("link")}">Open Handout</a>`);
            }
            return;
        }

        // --- send to chat ---
if(args['send-chat'] && s.displayHTML)
{
    const bgStyle = getWikiBackgroundStyle();
    sendChat("", `/w gm <div style="padding:10px; border:1px solid #444; border-radius:5px; ${bgStyle}">${s.displayHTML}</div>`);
    return;
}
        
if(args['send-chat-players'] && s.selectedHandout)
{
    if(!isGM) return;

    // Build player-safe content using the same logic as the player wiki
    let playerContent = "";

    if(s.currentItemType === "pin" && s.currentItemId)
    {
        const pin = getObj('pin', s.currentItemId);
        if(pin && pin.get('link'))
        {
            const handoutId     = pin.get('link');
            const subHeader     = pin.get('subLink');
            const field         = pin.get('subLinkType') === 'headerGM' ? 'gmnotes' : 'notes';
            const resolvedField = field === 'gmnotes' ? 'notes' : field;

            playerContent = await getHandoutSectionHTML(handoutId, subHeader, resolvedField, false)
                || "(no player-visible content)";

            if(pin.get('autoNotesType') === 'blockquote')
            {
                const blockquoteEnd = playerContent.search(/<\/blockquote>/i);
                if(blockquoteEnd !== -1)
                    playerContent = playerContent.slice(0, blockquoteEnd + '</blockquote>'.length);
                else
                    playerContent = "(no player-visible content)";
            }
        }
    }
    else if(s.currentItemType === "header" && s.selectedHandout)
    {
        const headerText = s.currentItemId === '__all__' ? null : s.currentItemId;
        playerContent    = await getHandoutSectionHTML(s.selectedHandout, headerText || '__all__', 'notes', false)
            || "(no player-visible content)";
    }

    if(!playerContent)
    {
        sendStyledMessage("Send to Players", "No player-visible content to send.");
        return;
    }

    const bgStyle = getWikiBackgroundStyle();
    sendChat(
        scriptName,
        `<div style="padding:10px; border:1px solid #444; border-radius:5px; ${bgStyle}">${rewriteHandoutLinks(playerContent)}</div>`
    );
    return;
}

        // --- pintool ---
        if(args.pintool)
        {
            sendChat("", "!pintool");
            return;
        }

        // --- filter keywords (toggle) ---
        let filtersChanged = false;
        const mode = s.mode === "pins" ? "pins" : "handout";

        ['h5', 'h6'].forEach(level =>
        {
            if(args[`filter-${level}`])
            {
                const word = normalizeWord(args[`filter-${level}`]);
                const idx  = s.filters[mode][level].indexOf(word);
                if(idx === -1) s.filters[mode][level].push(word);
                else           s.filters[mode][level].splice(idx, 1);
                filtersChanged = true;
            }

            if(args[`clear-${level}`])
            {
                s.filters[mode][level] = [];
                filtersChanged = true;
            }
        });

        if(filtersChanged && s.selectedHandout)
        {
            const handout = getObj('handout', s.selectedHandout);
            if(handout)
            {
                const content = await new Promise(resolve => handout.get('notes', resolve));
                s.displayHTML = "";
                await updateViewportHandout(content, msg.playerid, isGM);
            }
            return;
        }

        // --- nav back ---
        if(args['nav-back'] && s.navBack.length)
        {
            s.navForward.push({ handoutId: s.selectedHandout, headerText: s.currentItemId || null });

            const target      = s.navBack.pop();
            s.selectedHandout = target.handoutId;

            const handout = getObj('handout', s.selectedHandout);
            if(handout)
            {
                await new Promise(resolve =>
                {
                    handout.get('notes', async content =>
                    {
                        s.keywordData.handout.h5 = extractKeywords(content, 5);
                        s.keywordData.handout.h6 = extractKeywords(content, 6);

                        let restoredLevel = 1;
                        if(target.headerText)
                        {
                            for(let i = 1; i <= 4; i++)
                            {
                                if(extractHeaders(content, i).includes(target.headerText))
                                {
                                    restoredLevel = i;
                                    break;
                                }
                            }
                        }
                        else
                        {
                            restoredLevel = getHighestHeaderLevel(content);
                        }

                        s.selectedHeaderLevel = restoredLevel;
                        s.currentList         = getFilteredHeaders(content, s.selectedHeaderLevel, s);
                        s.currentIndex        = target.headerText ? s.currentList.indexOf(target.headerText) : 0;
                        s.currentItemType     = "header";
                        s.currentItemId       = target.headerText || s.currentList[0] || null;
                        s.displayHTML         = rewriteHandoutLinks(
                            await getHandoutSectionHTML(s.selectedHandout, s.currentItemId, 'notes', isGM) || ""
                        );

                        await updateViewportHandout(content, msg.playerid, isGM);
                        resolve();
                    });
                });
            }
            return;
        }

        // --- nav forward ---
        if(args['nav-forward'] && s.navForward.length)
        {
            s.navBack.push({ handoutId: s.selectedHandout, headerText: s.currentItemId || null });

            const target      = s.navForward.pop();
            s.selectedHandout = target.handoutId;

            const handout = getObj('handout', s.selectedHandout);
            if(handout)
            {
                await new Promise(resolve =>
                {
                    handout.get('notes', async content =>
                    {
                        s.keywordData.handout.h5 = extractKeywords(content, 5);
                        s.keywordData.handout.h6 = extractKeywords(content, 6);

                        let restoredLevel = 1;
                        if(target.headerText)
                        {
                            for(let i = 1; i <= 4; i++)
                            {
                                if(extractHeaders(content, i).includes(target.headerText))
                                {
                                    restoredLevel = i;
                                    break;
                                }
                            }
                        }
                        else
                        {
                            restoredLevel = getHighestHeaderLevel(content);
                        }

                        s.selectedHeaderLevel = restoredLevel;
                        s.currentList         = getFilteredHeaders(content, s.selectedHeaderLevel, s);
                        s.currentIndex        = target.headerText ? s.currentList.indexOf(target.headerText) : 0;
                        s.currentItemType     = "header";
                        s.currentItemId       = target.headerText || s.currentList[0] || null;
                        s.displayHTML         = rewriteHandoutLinks(
                            await getHandoutSectionHTML(s.selectedHandout, s.currentItemId, 'notes', isGM) || ""
                        );

                        await updateViewportHandout(content, msg.playerid, isGM);
                        resolve();
                    });
                });
            }
            return;
        }

        // --- default update (only when no other arg was handled) ---
        if(s.selectedHandout &&
           !args.selectHandout && !args.show    && !args.home  &&
           !args.level         && !args.mode    && !args.below &&
           !args['nav-back']   && !args['nav-forward'] && !args['nav-clear'] &&
           !args.prev          && !args.next    && !args['show-pin'] &&
           !args.edit          && !args['send-chat']   && !args.pintool &&
           !args['audit-pins'] && !args['fix-pin']     && !args['fix-pin-all'] &&
           !args['ping-pin']   && !args['ping-pin-gm'] && !args['filter-h5'] &&
           !args['filter-h6']  && !args['clear-h5']    && !args['clear-h6'])
        {
            const handout = getObj('handout', s.selectedHandout);
            if(handout)
            {
                handout.get('notes', async content =>
                {
                    await updateViewportHandout(content, msg.playerid, isGM);
                });
                return;
            }
        }

        await updateViewportHandout("", msg.playerid, isGM);
    });

})();

