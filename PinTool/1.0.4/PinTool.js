// Script:   PinTool
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta ||
{}; //eslint-disable-line no-var
API_Meta.PinTool = {
    offset: Number.MAX_SAFE_INTEGER,
    lineCount: -1
};
{
    try
    {
        throw new Error('');
    }
    catch (e)
    {
        API_Meta.PinTool.offset = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - 6);
    }
}

on("ready", () =>
{

    const version = '1.0.4'; //version number set here
    log('-=> PinTool v' + version + ' is loaded. Use !pintool --help for documentation.');
    //1.0.4 Huge update: Added advanced customization, pin style library, auto numbering
    //1.0.3 Normalized headers with html entities, Added more transformation options on --set: math, and words for scale
    //1.0.2 Cleaned up Help Documentation. Added basic control panel
    //1.0.1 Added burndown to many parts to account for timeouts - Thanks to the Aaron
    //1.0.0 Debut


    // ============================================================
    // HELPERS
    // ============================================================

    const scriptName = "PinTool";
    const PINTOOL_HELP_NAME = "Help: PinTool";
    const PINTOOL_HELP_AVATAR = "https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147";
    const ICON_SPRITE_URL = "https://files.d20.io/images/477999554/bETqvktx8A9TszRZBnmDWg/original.png?1772436951";
    const ICON_SIZE = 40; // original sprite slice size
    const ICON_DISPLAY_SIZE = 20; // rendered size (50%)


    const helpButton = `<div style = "float:right; style: inline-block; margin-top:-6px;">` + messageButton("?", "!pintool --help") +`</div>`; 
    const PINTOOL_HELP_TEXT = `
<h1>PinTool Script Help</h1>

<p>
PinTool provides bulk creation, inspection, and modification of <strong>map pins</strong>.
It also provides commands for conversion of old-style note tokens to new
<strong>map pins</strong>.
</p>

<ul>
  <li>Modify pin properties in bulk</li>
  <li>Target selected pins, all pins on a page, or explicit pin IDs</li>
  <li>Convert map tokens into structured handouts</li>
  <li>Place map pins onto the map automatically from a specified handout and header level</li>
  <li>Display images directly into chat</li>
</ul>

<p><strong>Base Command:</strong> <code>!pintool</code></p>

<h2>Primary Commands</h2>

<ul>
  <li><code>--set</code> — Modify properties on one or more pins (selected pins, or all pins on a page).</li>
  <li><code>--convert</code> — Convert map tokens into a handout. Can optionally replace existing token pins upon creation.</li>
  <li><code>--place</code> — Places pins on the map based on a specified handout and header level.</li>
  <li><code>--purge</code> — Removes all tokens on the map similar to the selected token, or pins similar to the selected pin.</li>
  <li><code>--help</code> — Open this help handout.</li>
  <li><code>--library</code> — Browse and copy saved pin styles from the Pin Library page.</li>
<li><code>--transform</code> — Apply transformations to pins (currently supports automatic text icon generation).</li>
</ul>

<hr>

<h2>Set Command</h2>

<p><strong>Format:</strong></p>
<pre>
!pintool --set property|value [property|value ...] [filter|target]
</pre>

<p>All supplied properties apply to every pin matched by the filter.</p>

<h3>Filter Options</h3>

<ul>
  <li><code>filter|selected</code> — (default) Selected pins</li>
  <li><code>filter|all</code> — All pins on the current page</li>
  <li><code>filter|ID ID ID</code> — Space-separated list of pin IDs</li>
</ul>

<h3>Settable Properties</h3>

<p>
Values are case-sensitive unless otherwise noted.
Values indicated by <code>""</code> mean no value.
Do not type quotation marks.
See examples at the end of this document.
</p>

<h4>Position</h4>
<ul>
  <li><code>x</code> — Horizontal position on page, in pixels</li>
  <li><code>y</code> — Vertical position on page, in pixels</li>
</ul>

<h4>Text &amp; Content</h4>
<ul>
  <li><code>title</code> — Title text displayed on the pin</li>
  <li><code>notes</code> — Notes content associated with the pin</li>
  <li><code>tooltipImage</code> — Roll20 image identifier (URL)</li>
</ul>

<h4>Links</h4>
<ul>
  <li><code>link</code> — ID of the linked handout or object</li>
  <li><code>linkType</code> — <code>handout</code> or <code>""</code></li>
  <li><code>subLink</code> — Header identifier within the handout</li>
  <li><code>subLinkType</code> — <code>headerPlayer</code>, <code>headerGM</code>, or <code>""</code></li>
</ul>

<h4>Visibility</h4>
<ul>
  <li><code>visibleTo</code> — Overall visibility: <code>all</code> or <code>""</code></li>
  <li><code>tooltipVisibleTo</code> — Tooltip visibility</li>
  <li><code>nameplateVisibleTo</code> — Nameplate visibility</li>
  <li><code>imageVisibleTo</code> — Image visibility</li>
  <li><code>notesVisibleTo</code> — Notes visibility</li>
  <li><code>gmNotesVisibleTo</code> — GM Notes visibility</li>
</ul>

<h4>Notes Behavior</h4>
<ul>
  <li>
    <code>autoNotesType</code> — Controls blockquote-based player visibility:
    <code>blockquote</code> or <code>""</code>
  </li>
</ul>

<h4>Appearance</h4>
<ul>
  <li><code>scale</code> — Range: <code>0.25</code> – <code>2.0</code></li>
  <li>Preset sizes: <code>teeny</code>, <code>tiny</code>, <code>small</code>, <code>medium</code>, <code>large</code>, <code>huge</code>, <code>gigantic</code></li>
  <li><code>bgColor</code> — Background color (hex rgb or rgba for transparency) or <code>transparent</code>)</li>
  <li><code>shape</code> — <code>teardrop</code>, <code>circle</code>, <code>diamond</code>, <code>square</code></li>
  <li><code>tooltipImageSize</code> — <code>small</code>, <code>medium</code>, <code>large</code>, <code>xl</code></li>
  <li><strong>Display Mode</strong></li>
  <li><code>customizationType</code> — <code>icon</code> or <code>image</code></li>
  <li><code>icon</code> — Icon preset identifier</li>
  <li><code>pinImage</code> — Roll20 image URL for custom pin image</li>
  <li><code>useTextIcon</code> — <code>true</code> or <code>false</code></li>
  <li><code>iconText</code> — Up to 3 characters displayed as a text icon</li>
  <p><em>Note, setting icon, iconText, or pinImage will automatically change the customizationType to match.</em></p>

</ul>

<h4>State</h4>
<ul>
  <li><code>imageDesynced</code> — true / false</li>
  <li><code>notesDesynced</code> — true / false</li>
  <li><code>gmNotesDesynced</code> — true / false</li>
</ul>

<hr>

<h2>Convert Command</h2>

<p>
The <strong>convert</strong> command builds or updates a handout by extracting data
from map tokens.
</p>

<p><strong>Format:</strong></p>
<pre>
!pintool --convert key|value key|value ...
</pre>

<p>
A single token must be selected.
All tokens on the same page that represent the
<strong>same character</strong> are processed.
All note pins must represent a common character.
</p>

<h3>Required Arguments</h3>

<ul>
  <li>
    <code>name|h1–h5</code><br>
    Header level used for each token’s name.
  </li>
  <li>
    <code>title|string</code><br>
    Name of the handout to create or update. May contain spaces.
  </li>
</ul>

<h3>Optional Arguments</h3>

<ul>
  <li><code>gmnotes|format</code></li>
  <li><code>tooltip|format</code></li>
  <li><code>bar1_value|format</code></li>
  <li><code>bar1_max|format</code></li>
  <li><code>bar2_value|format</code></li>
  <li><code>bar2_max|format</code></li>
  <li><code>bar3_value|format</code></li>
  <li><code>bar3_max|format</code></li>
</ul>

<p><strong>Format</strong> may be:</p>
<ul>
  <li><code>h1–h6</code></li>
  <li><code>blockquote</code></li>
  <li><code>code</code></li>
  <li><code>normal</code></li>
</ul>

<h3>Behavior Flags</h3>

<ul>
  <li>
    <code>supernotesGMText|true</code><br>
    Wraps GM Notes text before a visible separator (<code>-----</code>) in a blockquote.
    If no separator exists, the entire section is wrapped.
  </li>
  <li>
    <code>imagelinks|true</code><br>
    Adds clickable <code>[Image]</code> links after images that send them to chat.
  </li>
    <li>
    <code>replace|true</code><br>
    Places a pin at the location of every token note, linked to the handout. Afterward, you can delete either pins or tokens with the <code>purge [pins/tokens]</code> command.
  </li>
</ul>

<h3>Convert Rules</h3>

<ul>
  <li>Argument order is preserved and controls output order.</li>
  <li><code>title|</code> values may contain spaces.</li>
  <li>Images in notes can be converted to inline image links. Inline images in pins are not supported at this time</li>
  <li>Only tokens on the same page representing the same character are included.</li>
</ul>

<hr>

<h2>Place Command</h2>

<p>
The <strong>place</strong> command creates or replaces map pins on the current page
based on headers found in an existing handout.
</p>

<p><strong>Format:</strong></p>
<pre>
!pintool --place name|h1–h4 handout|Exact Handout Name
</pre>

<h3>Required Arguments</h3>

<ul>
  <li>
    <code>name|h1–h4</code><br>
    Header level to scan for in the handout.
  </li>
  <li>
    <code>handout|string</code><br>
    Exact, case-sensitive name of an existing handout. Must be unique.
  </li>
</ul>




<h3>Behavior</h3>

<ul>
  <li>Both <strong>Notes</strong> and <strong>GM Notes</strong> are scanned.</li>
  <li>Notes headers create pins with <code>subLinkType|headerPlayer</code>.</li>
  <li>GM Notes headers create pins with <code>subLinkType|headerGM</code>.</li>
  <li>Existing pins for matching headers are replaced and retain position.</li>
  <li>New pins are placed left-to-right across the top grid row.</li>
  <li>Pins use the same default properties as <code>--convert replace|true</code>.</li>
</ul>

<h3>Notes</h3>

<ul>
  <li>Handout names may contain spaces.</li>
  <li>If no matching headers are found, no pins are created.</li>
  <li>If more than one handout matches, the command aborts.</li>
</ul>

<hr>

<h2>Purge Command</h2>

<p>
The <strong>purge</strong> command removes all tokens on the map similar to the selected token (i.e. that represent the same character), or pins similar to the selected pin (i.e. that are linked to the same handout).
</p>

<p><strong>Format:</strong></p>
<pre>
!pintool --purge tokens
</pre>

<h3>Required Arguments</h3>

<ul>
  <li>
    <code>tokens</code> or <code>pins</code><br>
  </li>
</ul>

<hr>

<h2>Transform Command</h2>

<p>
The <strong>transform</strong> command applies derived transformations to pins
or transfers image data between pins and graphics.
</p>

<p><strong>Formats:</strong></p>
<pre>
!pintool --transform autotext [filter|target]
!pintool --transform imageto|pin
!pintool --transform imageto|graphic
</pre>

<h3>Supported Transforms</h3>

<ul>
  <li>
    <code>autotext</code><br>
    Derives up to 3 characters from the pin’s title (or <code>subLink</code> if the title is empty)
    and converts the pin into a text icon.
  </li>

  <li>
    <code>imageto|pin</code><br>
    Copies the image from a selected graphic to a selected pin,
    setting the pin to use <code>customizationType|image</code>.
  </li>

  <li>
    <code>imageto|graphic</code><br>
    Copies the stored image from a selected pin to a selected graphic.
  </li>
</ul>

<h3>Autotext Behavior</h3>

<p>
Text is derived from the first alphanumeric characters found in the
pin’s <code>title</code>. If the title is empty, <code>subLink</code> is used instead.
If no valid characters are found, the pin is not modified.
</p>

<p>
The <code>filter|</code> argument controls which pins are processed
and follows the same targeting rules as the <code>--set</code> command.
</p>

<h3>Image Transfer Behavior</h3>

<ul>
  <li>Exactly <strong>one pin</strong> and <strong>one graphic</strong> must be selected.</li>
  <li>The direction of transfer is determined by the command argument.</li>
  <li>No filter options apply to image transfers.</li>
  <li>If the required objects are not selected, the command aborts with an error.</li>
</ul>

<hr>

<h2>Pin Library</h2>

<p>
The <strong>library</strong> command allows you to browse and copy saved pin styles
from a dedicated page named <strong>Pin Library</strong>.
</p>

<p><strong>Format:</strong></p>
<pre>
!pintool --library
!pintool --library keyword|keyword
</pre>

<h3>Setup</h3>

<ul>
  <li>Create a page named exactly <strong>Pin Library</strong>.</li>
  <li>Create pins on that page configured with the styles you want to reuse.</li>
  <li>Add keywords to each pin title in square brackets:</li>
</ul>

<pre>
Camp [travel, wilderness]
Battle [combat, viking]
Treasure [loot]
</pre>

<h3>Behavior</h3>

<ul>
  <li><code>!pintool --library</code> lists all available keywords.</li>
  <li>Selecting a keyword displays matching pin styles.</li>
  <li>Clicking a style copies its appearance to selected pins.</li>
  <li>Position, title, notes, and links are not overwritten.</li>
</ul>

<p>
If the Pin Library page does not exist or contains no valid keyworded pins,
the command will display an error.
</p>

<hr>

<h2>Example Macros</h2>

<ul>
  <li><code>!pintool --set scale|1</code><br>Sets selected pin to size Medium</li>
  <li><code>!pintool --set scale|1 filter|all</code><br>Sets all pins on page to size Medium</li>
  <li><code>!pintool --set scale|1 filter|-123456789abcd -123456789abce -123456789abcf </code><br>Sets 3 specific pins on page to size Medium</li>
  <li><code>!pintool --set title|Camp notesVisibleTo|all</code><br>Sets title on selected custom pin and makes notes visible to all</li>
  <li><code>!pintool --set autoNotesType|</code><br>changes blockquote behavior on pins.</li>
  <li><code>!pintool --convert name|h2 title|Goblin Notes gmnotes|blockquote</code><br>Good all-purpose conversion command</li>
<li><code>!pintool --set bgColor|#307bb8 shape|circle</code><br>Sets selected pin color and shape</li>
<li><code>!pintool --set pinImage|https://... </code><br>Sets custom pin image</li>
<li><code>!pintool --transform autotext</code><br>Generates 3-letter text icons from titles</li>
<li><code>!pintool --transform imageto|pin</code><br>Copies the image from a selected graphic to a selected pin</li>
<li><code>!pintool --transform imageto|graphic</code><br>Copies the image stored on a pin to a selected graphic</li>
<li><code>!pintool --library</code><br>Browse saved pin styles</li>
<li><code>!pintool --set x|?{Input scale transformation using +-/&#42; number} y|?{Input scale transformation using +-/&#42; number}</code><br>Use when you have scaled a page and wish all of the pins to scale porportionately, preserving their spatial relationships</li>




</ul>

<hr>

<h2>General Rules</h2>

<ul>
  <li>All commands are GM-only.</li>
  <li>Read-only attributes (such as <code>_type</code> and <code>_pageid</code>) cannot be modified.</li>
  <li>Invalid values abort the entire command.</li>
</ul>
`;

    const ICON_ORDER = [
        "base-dot",
        "base-castle",
        "base-skullSimple",
        "base-spartanHelm",
        "base-radioactive",
        "base-heart",
        "base-star",
        "base-starSign",
        "base-pin",
        "base-speechBubble",
        "base-file",
        "base-plus",
        "base-circleCross",
        "base-dartBoard",
        "base-badge",
        "base-flagPin",
        "base-crosshair",
        "base-scrollOpen",
        "base-diamond",
        "base-photo",
        "base-fourStarShort",
        "base-circleStar",
        "base-lock",
        "base-crown",
        "base-leaf",
        "base-signpost",
        "base-beer",
        "base-compass",
        "base-video",
        "base-key",
        "base-chest",
        "base-village",
        "base-swordUp",
        "base-house",
        "base-house2",
        "base-church",
        "base-government",
        "base-blacksmith",
        "base-stable",
        "base-gear",
        "base-bridge",
        "base-mountain",
        "base-exclamation",
        "base-question"
    ];




    let sender;

    const getPageForPlayer = (playerid) =>
    {
        let player = getObj('player', playerid);
        if(playerIsGM(playerid))
        {
            return player.get('lastpage') || Campaign().get('playerpageid');
        }

        let psp = Campaign().get('playerspecificpages');
        if(psp[playerid])
        {
            return psp[playerid];
        }

        return Campaign().get('playerpageid');
    };

    function handleHelp(msg)
    {
        if(msg.type !== "api") return;

        let handout = findObjs(
        {
            _type: "handout",
            name: PINTOOL_HELP_NAME
        })[0];

        if(!handout)
        {
            handout = createObj("handout",
            {
                name: PINTOOL_HELP_NAME,
                archived: false
            });
            handout.set("avatar", PINTOOL_HELP_AVATAR);
        }

        handout.set("notes", PINTOOL_HELP_TEXT);

        const link = `http://journal.roll20.net/handout/${handout.get("_id")}`;

        const box = `
<div style="background:#111; padding:10px; border:1px solid #555; border-radius:6px; color:#eee;">
  <div style="font-size:110%; font-weight:bold; margin-bottom:5px;">PinTool Help</div>
  <a href="${link}" target="_blank" style="color:#9fd3ff; font-weight:bold;">Open Help Handout</a>
</div>`.trim().replace(/\r?\n/g, '');

        sendChat("PinTool", `/w gm ${box}`, null, {noarchive: true});
    }


const hSpace = `<div style = "width:5px; display:inline-block;"></div>`;

    function getCSS()
    {
        return {
            messageContainer: "background:#1e1e1e;" +
                "border:1px solid #888;" +
                "border-radius:6px;" +
                "padding:6px;" +
                "margin:4px 0;" +
                "font-family:Arial, sans-serif;" +
                "color:#ddd;",

            messageTitle: "font-weight:bold;" +
                "font-size:14px;" +
                "margin-bottom:6px;" +
                "color:#fff;",

            messageButton: "display:inline-block;" +
                "padding:2px 6px;" +
                "margin:2px 4px 2px 0;" +
                "border-radius:4px;" +
                "background:#333;" +
                "border:1px solid #555;" +
                "color:#9fd3ff;" +
                "text-decoration:none;" +
                "font-weight:bold;" +
                "font-size:12px;" +
                "white-space:nowrap;",

            sectionLabel: "display:block;" +
                "margin-top:6px;" +
                "font-weight:bold;" +
                "color:#ccc;",

            panel: "background:#ccc;" +
                "border:1px solid #444;" +
                "border-radius:6px;" +
                "padding:6px 4px 6px 6px;" +
                "margin:4px 0;" +
                "font-family:Arial, sans-serif;" +
                "color:#111;",

            iconSpriteButton: "display:inline-block;" +
                "width:40px;" +
                "height:40px;" +
                "background-color:#000;" + // force black behind transparent png
                "background-repeat:no-repeat;" +
                "background-size:1760px 40px;" +
                "border:1px solid #555;" +
                "border-radius:2px;" +
                "margin:1px;" +
                "padding:0;" +
                "line-height:0;" +
                "font-size:0;" +
                "text-decoration:none;" +
                "vertical-align:top;",

            panelButtonLeft: "display:inline-block;" +
                "padding:2px 6px;" +
                "border-radius:6px;" +
                "background:#333;" +
                "border:1px solid #555;" +
                "border-right:none;" +
                "color:#9fd3ff;" +
                "text-decoration:none;" +
                "font-size:12px;" +
                "margin:0 2px 4px 0px;",

            panelButtonAll: "display:inline-block;" +
                "padding:2px 6px;" +
                "border-radius:0 14px 14px 0;" +
                "background:#222;" +
                "border:1px solid #555;" +
                "color:#9fd3ff;" +
                "text-decoration:none;" +
                "font-size:11px;" +
                "font-weight:bold;" +
                "margin-right:10px;" +
                "margin-bottom:4px;",

            colorButton: "display:inline-block;" +
                "width:20px;" +
                "height:20px;" +
                "border:1px solid #555;" +
                "border-radius:2px;" +
                "margin:1px;" +
                "padding:0;" +
                "vertical-align:middle;" +
                "text-decoration:none;",

            libraryPinButton: "display:block;" +
                "margin:4px 0;" +
                "padding:2px;" +
                "border-radius:4px;" +
                "background:#2a2a2a;" +
                "border:1px solid #555;" +
                "color:#fff;" +
                "text-decoration:none;" +
                "font-size:12px;" +
                "white-space:nowrap;",

            libraryPinVisual: "display:inline-block;" +
                "width:35px;" +
                "height:35px;" +
                "margin-right:6px;" +
                "vertical-align:middle;" +
                "border:1px solid #555;" +
                "border-radius:4px;" +
                "background-color:#000;",

            libraryPinText: "display:inline-block;" +
                "vertical-align:middle;" +
                "margin-left:6px;"
        };
    }

    function splitButton(label, command)
    {
        const css = getCSS();

        return (
            `<a href="${command}" style="${css.panelButtonLeft}">${label}</a>` // +
            //`<a href="${command} filter|all" style="${css.panelButtonAll}">++</a>`
        );
    }

    function iconSpriteButton(index, iconValue)
    {
        const offsetX = -(index * ICON_DISPLAY_SIZE);

        return `
        <div style="
            display:inline-block;
            margin:-1px;
            border:1px solid #555;
            border-radius:2px;
            width:${ICON_DISPLAY_SIZE}px;
            height:${ICON_DISPLAY_SIZE}px;
            background-color:black;
            overflow:hidden;
        ">
            <a href="!pintool --set icon|${iconValue}" 
               title="${iconValue}"
               style="
                   display:block;
                   width:100%;
                   height:100%;
                   background-color:black;
                   background-image:url('${ICON_SPRITE_URL}');
                   background-repeat:no-repeat;
                   background-size:${ICON_DISPLAY_SIZE * 44}px ${ICON_DISPLAY_SIZE}px !important;
                   background-position:${offsetX}px 0px !important;
                   transform:scale(0.5);
                   transform-origin:top left;
                   border:none !important;
                   padding:0 !important;
                   margin:0 !important;
                   text-decoration:none !important;
               ">
            </a>
        </div>
    `;
    }

    function messageButton(label, command)
    {
        const css = getCSS();

        return (
            `<a href="${command}" style="${css.messageButton}">${label}</a>`
        );
    }

    function showControlPanel()
    {
        const css = getCSS();

        const colors = [
            "#242424", "#307bb8", "#721211", "#e59a00", "#b40f69", "#2d0075", "#e26608", "#588b02", "#bb1804",
            "#ffffff", "#000000"
        ];

        const colorButtons = colors.map((c, i) =>
            (i === colors.length - 2 ? "<br>" : "") +
            `<a href="!pintool --set bgColor|${c}" style="${css.colorButton}background-color:${c};"></a>`
        ).join('');

        const panel =
            `<div style="${css.panel}">` +

            // SIZE
            `<div><strong>Size</strong><br>` +
            splitButton("Teeny", "!pintool --set scale|teeny") +
            splitButton("Tiny", "!pintool --set scale|tiny") +
            splitButton("S", "!pintool --set scale|small") +
            splitButton("M", "!pintool --set scale|medium") +
            splitButton("L", "!pintool --set scale|large") +
            splitButton("Huge", "!pintool --set scale|huge") +
            splitButton("Gig", "!pintool --set scale|gigantic") +
            `</div>` +

            // VISIBILITY
            `<div style="margin-top:6px;"><strong>Visible</strong><br>` +
            splitButton("GM", "!pintool --set visibleTo|") +
            splitButton("All", "!pintool --set visibleTo|all") +
            hSpace +
            splitButton("Show Name", "!pintool --set nameplateVisibleTo|all") +
            splitButton("Hide Name", "!pintool --set nameplateVisibleTo|") +
            `</div>` +

            // BLOCKQUOTE
            `<div style="margin-top:6px;"><strong>Blockquote as player text</strong><br>` +
            splitButton("On", "!pintool --set autoNotesType|blockquote") +
            splitButton("Off", "!pintool --set autoNotesType|") +
            `</div>` +
            
            
            // TOOLTIP IMAGE
            `<div style="margin-top:6px;"><strong>Tooltip Image</strong><br>` +
            splitButton("Custom", "!pintool --set tooltipImage|?{Roll20 Image URL}") +
            splitButton("On", "!pintool --set imageVisibleTo|all") +
            splitButton("Off", "!pintool --set imageVisibleTo|") +
            hSpace +
            splitButton("S", "!pintool --set tooltipImageSize|small") +
            splitButton("M", "!pintool --set tooltipImageSize|medium") +
            splitButton("L", "!pintool --set tooltipImageSize|large") +
            splitButton("XL", "!pintool --set tooltipImageSize|xl") +
            `</div>` +

            // DISPLAY SYNC
            `<div style="margin-top:6px;"><strong>Display</strong><br>` +
            splitButton("From Handout", "!pintool --set imageDesynced|false imageVisibleTo|") +
            splitButton("Custom", "!pintool --set imageDesynced|true imageVisibleTo|all") +
            `</div>` +

                        // CUSTOMIZATION MODE
            `<div style="margin-top:6px;"><strong>Customization Mode</strong><br>` +
            splitButton("Icon", "!pintool --set customizationType|icon") +
            splitButton("Image", "!pintool --set customizationType|image") +
            splitButton("Text", "!pintool --set useTextIcon|true") +
            splitButton("Set Text", "!pintool --set iconText|?{Input up to 3 characters}") + `<br>` +
            splitButton("Pin Text from Title", "!pintool --transform autotext") +


            `</div>` +


            // ICON QUICK PICKS
            `<div style="margin-top:6px;"><strong>Icon Presets</strong><br>` +
            ICON_ORDER.map((icon, i) => iconSpriteButton(i, icon)).join("") +
            `</div>` +

            // PIN IMAGE
            /*
            `<div style="margin-top:6px;"><strong>Pin Image</strong><br>` +
            splitButton("Set Pin Image", "!pintool --set pinImage|?{Roll20 Image URL}") +
            splitButton("Clear Image", "!pintool --set pinImage| customizationType|icon") +
            `</div>` +
            */

            // SHAPE
            `<div style="margin-top:6px; min-height:50px;"><strong>Appearance: </strong>Shape, Color, Image<br>` +
            splitButton("Teardrop", "!pintool --set shape|teardrop") +
            splitButton("Circle", "!pintool --set shape|circle") +
            splitButton("Diamond", "!pintool --set shape|diamond") +
            splitButton("Square", "!pintool --set shape|square") + `</div>` +
            //`</div>` +

            // BACKGROUND COLOR
            //`<div style="margin-top:6px;"><strong>Pin Colors</strong><br>` +
            `<div style = "min-height:55px;">` +
            colorButtons +
            splitButton("Transparent", "!pintool --set bgColor|transparent") +
            splitButton("Custom Color", "!pintool --set bgColor|?{Enter custom color (hex or transparent)}") +
            `</div>` +
            
            `<strong>Pin Image: </strong>` +
            splitButton("Set", "!pintool --set pinImage|?{Roll20 Image URL}") +
            splitButton("Clear", "!pintool --set pinImage| customizationType|icon") +
            splitButton("From Graphic", "!pintool --transform imageto|pin") +


            // Pin LIbrary
            `<div style="margin-top:6px;"><strong>Utilities </strong>` + `<br>` +
            messageButton("Style Library", "!pintool --library") +
            //`</div>` +
/*
            // SCALE PLACEMENT
            `<div style="margin-top:6px;"><strong>Scale Pin Placement on Page</strong><br>Use when you have scaled the page and map and want to scale pin placement across the page to match.<br>` +
            splitButton("Scale Placement", "!pintool --set x|?{Input scale transformation using +-/&#42; number} y|?{Input scale transformation using +-/&#42; number}") +
            `</div>` +
*/
            // PLACE FROM HANDOUT
            //`<div style="margin-top:6px;"><strong>Place Pins from Handout</strong><br>` +
            messageButton("Place from Handout", "!pintool --place handout|?{Exact Handout Name} name|?{Choose Header Level for Map Pins|h1,h1|h2,h2|h3,h3|h4,h4}") +
            `</div>` +

            `</div>`;

        sendStyledMessage(
            "PinTool Control Panel"  + helpButton,
            panel
        );
    }


function deriveAutoText(str)
{
    if(!str) return "";

    // Keep alphanumeric only
    const cleaned = (str.match(/[A-Za-z0-9]/g) || []).join("");

    return cleaned.substring(0, 3);
}



    function handlePurge(msg, args)
    {
        if(!args.length) return;

        const mode = args[0];
        if(mode !== "tokens" && mode !== "pins") return;

        const confirmed = args.includes("--confirm");

        // --------------------------------
        // CONFIRM PATH (no selection)
        // --------------------------------
        if(confirmed)
        {
            let charId, handoutId, pageId;

            args.forEach(a =>
            {
                if(a.startsWith("char|")) charId = a.slice(5);
                if(a.startsWith("handout|")) handoutId = a.slice(8);
                if(a.startsWith("page|")) pageId = a.slice(5);
            });

            if(!pageId) return;

            /* ===== PURGE TOKENS (CONFIRM) ===== */
            if(mode === "tokens" && charId)
            {
                const char = getObj("character", charId);
                if(!char) return;

                const charName = char.get("name") || "Unknown Character";

                const targets = findObjs(
                {
                    _type: "graphic",
                    _subtype: "token",
                    _pageid: pageId,
                    represents: charId
                });

                if(!targets.length) return;

                targets.forEach(t => t.remove());

                sendStyledMessage(`Deleted ${targets.length} token(s) for "${_.escape(charName)}".`);
            }

            /* ===== PURGE PINS (CONFIRM) ===== */
            if(mode === "pins" && handoutId)
            {
                const handout = getObj("handout", handoutId);
                if(!handout) return;

                const handoutName = handout.get("name") || "Unknown Handout";

                const targets = findObjs(
                {
                    _type: "pin",
                    _pageid: pageId
                }).filter(p => p.get("link") === handoutId);

                if(!targets.length) return;

                const count = targets.length;

                const burndown = () =>
                {
                    let p = targets.shift();
                    if(p)
                    {
                        p.remove();
                        setTimeout(burndown, 0);
                    }
                    else
                    {
sendStyledMessage(
    `Deleted ${count} pin(s) linked to "${_.escape(handoutName)}".`
);
                    }
                };
                burndown();
            }

            return;
        }

        // --------------------------------
        // INITIAL PATH (requires selection)
        // --------------------------------
        if(!msg.selected || msg.selected.length !== 1) return;

        const sel = msg.selected[0];

        /* ===============================
           PURGE TOKENS (INITIAL)
           =============================== */
        if(mode === "tokens" && sel._type === "graphic")
        {
            const token = getObj("graphic", sel._id);
            if(!token) return;

            const charId = token.get("represents");
            if(!charId) return;

            const pageId = token.get("_pageid");
            const char = getObj("character", charId);
            const charName = char?.get("name") || "Unknown Character";

            const targets = findObjs(
            {
                _type: "graphic",
                _subtype: "token",
                _pageid: pageId,
                represents: charId
            });

            if(!targets.length) return;

            sendStyledMessage(
                "Confirm Purge",
                `
    <div>
        <div>
            This will permanently delete <strong>${targets.length}</strong> token(s)
        </div>
        <div>
            representing <strong>${_.escape(charName)}</strong> on this page.
        </div>

        <div style="margin-top:8px;">
            <strong>This cannot be undone.</strong>
        </div>

        <div style="margin-top:10px;">
            <a href="!pintool --purge tokens --confirm char|${charId} page|${pageId}">
                Click here to confirm
            </a>
        </div>
    </div>
    `
            );

            return;
        }

        /* ===============================
           PURGE PINS (INITIAL)
           =============================== */
        if(mode === "pins" && sel._type === "pin")
        {
            const pin = getObj("pin", sel._id);
            if(!pin) return;

            const handoutId = pin.get("link");
            if(!handoutId) return;

            const pageId = pin.get("_pageid");
            const handout = getObj("handout", handoutId);
            const handoutName = handout?.get("name") || "Unknown Handout";

            const targets = findObjs(
            {
                _type: "pin",
                _pageid: pageId
            }).filter(p => p.get("link") === handoutId);

            if(!targets.length) return;

            sendStyledMessage(
                "Confirm Purge",
                `<p>This will permanently delete <strong>${targets.length}</strong> pin(s)<br>
             linked to handout <strong>${_.escape(handoutName)}</strong>.</p>
             <p><strong>This cannot be undone.</strong></p>
             <p>
               <a href="!pintool --purge pins --confirm handout|${handoutId} page|${pageId}">
                 Click here to confirm
               </a>
             </p>`
            );
            return;
        }
    }



    function normalizeForChat(html)
    {
        return String(html).replace(/\r\n|\r|\n/g, "").trim();
    }

    const sendStyledMessage = (titleOrMessage, messageOrUndefined, isPublic = false) =>
    {
        const css = getCSS();
        let title, message;

        if(messageOrUndefined === undefined)
        {
            title = scriptName;
            message = titleOrMessage;
        }
        else
        {
            title = titleOrMessage || scriptName;
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
            {
                noarchive: true
            }
        );
    };

    function sendError(msg)
    {
        sendStyledMessage("PinTool — Error", msg);
    }

    function sendWarning(msg)
    {
        sendStyledMessage("PinTool — Warning", msg);
    }


//Pin library functions

       function parseLibraryTitle(title)
        {
            const match = title.match(/\[(.*?)\]/);
            if(!match) return null;

            const keywordBlock = match[1];
            const keywords = keywordBlock
                .split(',')
                .map(k => k.trim().toLowerCase())
                .filter(k => k.length);

            const cleanTitle = title.replace(/\s*\[.*?\]\s*/, '').trim();

            return {
                cleanTitle,
                keywords
            };
        }

        function getLibraryPage()
        {
            return findObjs(
            {
                _type: "page",
                name: "Pin Library"
            })[0];
        }


function showLibraryKeywords()
{
    const css = getCSS();
    const page = getLibraryPage();

    if(!page) {
        sendError("Pin Library page not found. Create a page named 'Pin Library' and add pins with keywords. See !pintool --help for details.");
        return;
    }

    const pins = findObjs(
    {
        _type: "pin",
        _pageid: page.id
    });

    const keywordSet = new Set();

    pins.forEach(pin =>
    {
        const parsed = parseLibraryTitle(pin.get("title"));
        if(!parsed) return;

        parsed.keywords.forEach(k => keywordSet.add(k));
    });

    const keywords = Array.from(keywordSet).sort();

    if(keywords.length === 0) {
        sendError("No pins with keywords found on the Pin Library page. See !pintool --help to create them.");
        return;
    }

    const mid = Math.ceil(keywords.length / 2);
    const leftColumn  = keywords.slice(0, mid);
    const rightColumn = keywords.slice(mid);

    let rows = "";

    for(let i = 0; i < mid; i++)
    {
        const left = leftColumn[i]
            ? `<a href="!pintool --library keyword|${leftColumn[i]}" style="${css.messageButton}">${leftColumn[i]}</a>`
            : "";

        const right = rightColumn[i]
            ? `<a href="!pintool --library keyword|${rightColumn[i]}" style="${css.messageButton}">${rightColumn[i]}</a>`
            : "";

        rows += `<tr>
<td style="vertical-align:top;">${left}</td>
<td style="vertical-align:top;">${right}</td>
</tr>`;
    }

    const buttons = `<table style="width:100%;">${rows}</table>`;

    const output =
        `<div style="${css.messageContainer}">
        <div style="${css.messageTitle}">Pin Library${helpButton}</div>
        <div style="${css.panel}">
            ${buttons}
        </div>
<div style="text-align:right;">
${messageButton("Main Menu", "!pintool")}
</div>
</div>`.trim().replace(/\r?\n/g, '');

    sendChat("PinTool", `/w gm ${output}`, null, {noarchive: true});
}


function buildLibraryPinButton(pin) {
    const css = getCSS();
    const title = pin.get("title");
    const parsed = parseLibraryTitle(title);
    if (!parsed) return "";

    const cleanTitle = parsed.cleanTitle;

    const useTextIcon = pin.get("useTextIcon");
    const customizationType = pin.get("customizationType");
    const pinImage = pin.get("pinImage");
    const icon = pin.get("icon");
    const bgColor = pin.get("bgColor") || "#000";
    const iconText = pin.get("iconText");

    let visual = "";

    // Base styles for the visual div
    const baseStyle = `
        width:35px;
        height:35px;
        display:inline-block;
        vertical-align:middle;
        border-radius:4px;
        text-align:center;
        line-height:35px;
        font-weight:bold;
        overflow:hidden;
        background-size: auto 100%;
    `;

    if (useTextIcon === true && iconText) {
        // Text Icon
        visual = `<div style="${baseStyle} background:${bgColor}; color:#fff;">${iconText.substring(0,3)}</div>`;
    } 
    else if (customizationType === "image" && pinImage) {
        // Image pin — always light neutral gray behind
        const grayBg = "#eee";
        visual = `<div style="${baseStyle}
            background:${grayBg};
            background-image:url('${pinImage}');
            background-size:cover;
            background-position:center;">
        </div>`;
    } 
else if (customizationType === "icon" && icon) {
    const iconIndex = ICON_ORDER.indexOf(icon);
    const totalIcons = ICON_ORDER.length;
    const bgPosPercent = (iconIndex / (totalIcons - 1)) * 100;

    visual = `<div style="${baseStyle}
        background:${bgColor};
        background-image:url('${ICON_SPRITE_URL}');
        background-repeat:no-repeat;
        background-size:auto 88%;
        background-position:${bgPosPercent}% center;">
    </div>`;
}
    else {
        // Only color
        visual = `<div style="padding:5px;"><div style="${baseStyle} background:${bgColor};"></div></div>`;
    }

    return `<a href="!pintool --library copy|${pin.id}" style="${css.libraryPinButton}">
        ${visual}
        <span style="${css.libraryPinText}">${cleanTitle}</span>
    </a>`;
}


        function showLibraryKeywordResults(keyword)
        {
            const css = getCSS();
            const page = getLibraryPage();
            if(!page) return;

            const lower = keyword.toLowerCase();

            const pins = findObjs(
            {
                _type: "pin",
                _pageid: page.id
            });

            const matches = pins.filter(pin =>
            {
                const parsed = parseLibraryTitle(pin.get("title"));
                if(!parsed) return false;
                return parsed.keywords.includes(lower);
            });

            matches.sort((a, b) =>
            {
                const pa = parseLibraryTitle(a.get("title"));
                const pb = parseLibraryTitle(b.get("title"));
                return pa.cleanTitle.localeCompare(pb.cleanTitle);
            });

            const buttons = matches.map(buildLibraryPinButton).join("");

            const output =
                `<div style="${css.messageContainer}">
            <div style="${css.messageTitle}">Keyword: ${keyword}${helpButton}</div>
                <div style="${css.panel}">
            ${buttons}
        </div>
<div style = "text-align:right;">
${splitButton("Change Keyword", "!pintool --library")}
            ${splitButton("Main Menu", "!pintool")}
            </div>
            </div>`.trim().replace(/\r?\n/g, '');

            sendChat("PinTool", `/w gm ${output}`, null, {noarchive: true});
        }


        function copyLibraryPinToSelection(pinId, selected)
        {
            const libraryPin = getObj("pin", pinId);
            if(!libraryPin) return;

            const targets = (selected || [])
                .map(s => getObj(s._type, s._id))
                .filter(o => o && o.get("_type") === "pin");

            if(!targets.length)
            {
                sendStyledMessage("No pins selected.");
                return;
            }

            const props = libraryPin.attributes;

            targets.forEach(target =>
            {
                Object.keys(props).forEach(key =>
                {
                    if([
                            "title",
                            "link",
                            "linkType",
                            "subLink",
                            "subLinkType",
                            "_id",
                            "_type",
                            "x",
                            "y",
                            "notes",
                            "gmNotes",
                            "y",
                            "y",
                            "_pageid"
                        ].includes(key)) return;

                    target.set(key, props[key]);
                });
            });
        }









    // ============================================================
    // IMAGE → CHAT
    // ============================================================
    const isValidRoll20Image = (url) =>
    {
        return typeof url === 'string' && url.includes('files.d20.io/images');
    };


    function handleImageToChat(encodedUrl)
    {
        let url = encodedUrl.trim().replace(/^(https?)!!!/i, (_, p) => `${p}://`);
        if(!/^https?:\/\//i.test(url))
        {
            return sendError("Invalid image URL.");
        }

        const isRoll20Image = isValidRoll20Image(url);

        let buttons =
            `<a href="!pintool --imagetochatall|${encodedUrl}" ` +
            `style="display:inline-block;padding:2px 8px;background:#444;color:#fff;border-radius:4px;text-decoration:none;">` +
            `Send to All</a>`;

        if(isRoll20Image)
        {
            buttons +=
                ` <a href="!pintool --set tooltipImage|${encodedUrl.trim().replace(/^(https?)!!!/i, (_, p) => `${p}://`)}" ` +
                `style="display:inline-block;padding:2px 8px;background:#444;color:#fff;border-radius:4px;text-decoration:none;">` +
                `Place image in Pin</a>`;
        }

        const imageHtml =
            `<div style="text-align:center;">` +
            `<img src="${url}" style="max-width:100%;max-height:600px;">` +
            `<div style="margin-top:6px;">${buttons}</div>` +
            `</div>`;

        sendChat(
            "PinTool",
            `/w "${sender}" ${imageHtml}`,
            null,
            {
                noarchive: true
            }
        );
    }



    function handleImageToChatAll(encodedUrl)
    {
        let url = encodedUrl.trim().replace(/^(https?)!!!/i, (_, p) => `${p}://`);
        if(!/^https?:\/\//i.test(url)) return sendError("Invalid image URL.");

        sendChat(
            "PinTool", `<div style="text-align:center;"><img src="${url}" style="max-width:100%;max-height:600px;"></div>`,
            null,
            {
                noarchive: true
            });
    }

    // ============================================================
    // SET MODE (pins)
    // ============================================================

    const SCALE_PRESETS = {
        teeny: 0.25,
        tiny: 0.5,
        small: 0.75,
        medium: 1,
        large: 1.25,
        huge: 1.5,
        gigantic: 2
    };


    const PIN_SET_PROPERTIES = {
        x: "number",
        y: "number",
        title: "string",
        notes: "string",

        tooltipImage: "roll20image",
        pinImage: "roll20image",

        link: "string",
        linkType: ["", "handout"],
        subLink: "string",
        subLinkType: ["", "headerPlayer", "headerGM"],

        visibleTo: ["", "all"],
        tooltipVisibleTo: ["", "all"],
        nameplateVisibleTo: ["", "all"],
        imageVisibleTo: ["", "all"],
        notesVisibleTo: ["", "all"],
        gmNotesVisibleTo: ["", "all"],
        autoNotesType: ["", "blockquote"],

        scale:
        {
            min: 0.25,
            max: 2.0
        },

        imageDesynced: "boolean",
        notesDesynced: "boolean",
        gmNotesDesynced: "boolean",

        bgColor: "color",
        shape: ["teardrop", "circle", "diamond", "square"],

        customizationType: ["icon", "image"],
        icon: [
            "base-dot", "base-castle", "base-skullSimple", "base-spartanHelm",
            "base-radioactive", "base-heart", "base-star", "base-starSign",
            "base-pin", "base-speechBubble", "base-file", "base-plus",
            "base-circleCross", "base-dartBoard", "base-badge", "base-flagPin",
            "base-crosshair", "base-scrollOpen", "base-diamond", "base-photo",
            "base-fourStarShort", "base-circleStar", "base-lock", "base-crown",
            "base-leaf", "base-signpost", "base-beer", "base-compass", "base-video",
            "base-key", "base-chest", "base-village", "base-swordUp", "base-house",
            "base-house2", "base-church", "base-government", "base-blacksmith",
            "base-stable", "base-gear", "base-bridge", "base-mountain",
            "base-exclamation", "base-question"
        ],

        useTextIcon: "boolean",
        iconText: "string",

        tooltipImageSize: ["small", "medium", "large", "xl"]
    };


    function handleSet(msg, tokens)
    {
        const flags = {};
        let filterRaw = "";

        for(let i = 0; i < tokens.length; i++)
        {
            const t = tokens[i];
            const idx = t.indexOf("|");
            if(idx === -1) continue;

            const key = t.slice(0, idx);
            let val = t.slice(idx + 1);

            if(key === "filter")
            {
                const parts = [val];
                let j = i + 1;
                while(j < tokens.length && !tokens[j].includes("|"))
                {
                    parts.push(tokens[j++]);
                }
                filterRaw = parts.join(" ").trim();
                i = j - 1;
                continue;
            }

            if(!PIN_SET_PROPERTIES.hasOwnProperty(key))
                return sendError(`Unknown pin property, or improper capitalization: ${key}`);

            const parts = [val];
            let j = i + 1;
            while(j < tokens.length && !tokens[j].includes("|"))
            {
                parts.push(tokens[j++]);
            }

            flags[key] = parts.join(" ").trim();
            i = j - 1;
        }

        if(!Object.keys(flags).length)
            return sendError("No valid properties supplied to --set.");




        const pageId = getPageForPlayer(msg.playerid);
        /*
            (Campaign().get("playerspecificpages") || {})[msg.playerid] ||
            Campaign().get("playerpageid");
*/

let pins = [];

// Default / selected
if(!filterRaw || filterRaw === "selected")
{
    if(!msg.selected?.length)
        return sendError("No pins selected.");

    pins = msg.selected
        .map(s => getObj("pin", s._id))
        .filter(p => p && p.get("_pageid") === pageId);
}

// Explicit all (UNCHANGED)
else if(filterRaw === "all")
{
    pins = findObjs({
        _type: "pin",
        _pageid: pageId
    });
}

// Property-based filter (NEW)
else if(PIN_SET_PROPERTIES.hasOwnProperty(filterRaw))
{
    if(!msg.selected?.length)
        return sendError("Select a reference pin for property-based filtering.");

    const reference = getObj("pin", msg.selected[0]._id);
    if(!reference || reference.get("_pageid") !== pageId)
        return sendError("Reference pin must be on the current page.");

    const referenceValue = reference.get(filterRaw);

    pins = findObjs({
        _type: "pin",
        _pageid: pageId
    }).filter(p => p.get(filterRaw) === referenceValue);
}

// Explicit IDs (UNCHANGED)
else
{
    pins = filterRaw.split(/\s+/)
        .map(id => getObj("pin", id))
        .filter(p => p && p.get("_pageid") === pageId);
}

        if(!pins.length)
            return sendWarning("Filter matched no pins on the current page.");

        try
        {
            const queue = pins.map(p => p.id);
            const BATCH_SIZE = 10;

            const processBatch = () =>
            {
                const slice = queue.splice(0, BATCH_SIZE);

                slice.forEach(id =>
                {
                    const p = getObj("pin", id);
                    if(!p) return;

                    const updates = {};

                    const originalCustomization = p.get("customizationType") || "icon";
                    let newCustomization = originalCustomization;
                    let revertingFromText = false;

                    Object.entries(flags).forEach(([key, raw]) =>
                    {
                        const spec = PIN_SET_PROPERTIES[key];
                        let value = raw;

                        // Boolean
                        if(spec === "boolean")
                        {
                            value = raw === "true";
                        }

                        // Roll20 image validation
                        else if(spec === "roll20image")
                        {
                            if(value && !isValidRoll20Image(value)) throw 0;
                        }

                        // Color validation
// Color normalization + validation
else if(spec === "color")
{
    value = value.trim();

    // Allow transparent unchanged
    if(value.toLowerCase() === "transparent")
    {
        value = "transparent";
    }
    else
    {
        // If no leading # but looks like 6 or 8 hex digits, add it
        if(!value.startsWith("#") && /^[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value))
        {
            value = "#" + value;
        }

        // Now validate final format strictly
        if(!/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value))
            throw 0;
    }
}

                        // Simple numeric
                        else if(spec === "number")
                        {
                            const current = Number(p.get(key));
                            const opMatch = raw.match(/^([+\-*/])\s*(-?\d*\.?\d+)$/);

                            if(opMatch)
                            {
                                const op = opMatch[1];
                                const operand = Number(opMatch[2]);
                                if(isNaN(operand)) throw 0;

                                if(op === "+") value = current + operand;
                                else if(op === "-") value = current - operand;
                                else if(op === "*") value = current * operand;
                                else if(op === "/")
                                {
                                    if(operand === 0) throw 0;
                                    value = current / operand;
                                }
                            }
                            else
                            {
                                value = Number(raw);
                                if(isNaN(value)) throw 0;
                            }
                        }

                        // Enumerated
                        else if(Array.isArray(spec))
                        {
                            if(!spec.includes(value)) throw 0;
                        }

                        // Bounded numeric
                        else if(typeof spec === "object")
                        {
                            const current = Number(p.get(key));
                            const lower = spec.min;
                            const upper = spec.max;

                            const preset = SCALE_PRESETS[raw.toLowerCase()];
                            if(preset !== undefined)
                            {
                                value = preset;
                            }
                            else
                            {
                                const opMatch = raw.match(/^([+\-*/])\s*(-?\d*\.?\d+)$/);

                                if(opMatch)
                                {
                                    const op = opMatch[1];
                                    const operand = Number(opMatch[2]);
                                    if(isNaN(operand)) throw 0;

                                    if(op === "+") value = current + operand;
                                    else if(op === "-") value = current - operand;
                                    else if(op === "*") value = current * operand;
                                    else if(op === "/")
                                    {
                                        if(operand === 0) throw 0;
                                        value = current / operand;
                                    }
                                }
                                else
                                {
                                    value = Number(raw);
                                    if(isNaN(value)) throw 0;
                                }
                            }

                            value = Math.max(lower, Math.min(upper, value));
                        }

                        // ---- Behavioral Rules ----

                        if(key === "pinImage")
                        {
                            if(value)
                                newCustomization = "image";
                        }

if(key === "icon")
{
    newCustomization = "icon";
    updates.useTextIcon = false;
}

if(key === "iconText")
{
    if(value === "")
    {
        // Explicitly set blank text icon
        value = "";
    }
    else
    {
        // Preserve exactly what the user entered
        // Only enforce 3-character limit
        value = value.substring(0, 3);
    }

    updates.useTextIcon = true;
}


if(key === "useTextIcon")
{
    if(value === true)
    {
        newCustomization = "icon";  // text icons are a variation of icon mode
    }
    else
    {
        revertingFromText = true;
    }
}

if(key === "customizationType")
{
    newCustomization = value;

    if(value === "icon")
        updates.useTextIcon = false;
}

                        updates[key] = value;
                    });

                    // Final mode resolution (last flag wins)
                    if(revertingFromText)
                    {
                        updates.customizationType = originalCustomization;
                    }
                    else
                    {
                        updates.customizationType = newCustomization;
                    }

                    // Prevent empty image mode
                    if(updates.customizationType === "image")
                    {
                        const finalImage = updates.pinImage ?? p.get("pinImage");
                        if(!finalImage)
                            updates.customizationType = "icon";
                    }

                    p.set(updates);
                    p.set(
                    {
                        layer: p.get("layer")
                    });

                });

                if(queue.length)
                {
                    setTimeout(processBatch, 0);
                }
            };

            processBatch();
        }
        catch
        {
            return sendError("Invalid value supplied to --set.");
        }


        //sendStyledMessage("PinTool — Success", `Updated ${pins.length} pin(s).`);
    }

function deriveAutoText(pin)
{
    if(!pin) return "";

    const title = (pin.get("title") || "").trim();
    const subLink = (pin.get("subLink") || "").trim();

    const source = title || subLink;
    if(!source) return "";

    // Remove leading non-alphanumeric characters
    const trimmed = source.replace(/^[^A-Za-z0-9]+/, "");

    // Capture first contiguous alphanumeric run
    const match = trimmed.match(/^[A-Za-z0-9]+/);

    if(!match) return "";

    return match[0].substring(0, 3);
}


function handleTransform(msg, argString)
{
    if(!argString)
        return sendError("No transform specified.");

    const tokens = argString.split(/\s+/);
    const transformType = tokens[0].toLowerCase();

    // ------------------------------------------------------------
    // Image Transfer (graphic <-> pin)
    // ------------------------------------------------------------

    if(transformType.startsWith("imageto|"))
    {
        const direction = transformType.split("|")[1];

        if(!msg.selected || msg.selected.length !== 2)
        {
            return sendStyledMessage(
                "Image Transfer",
                "Usage: !pintool --transform imageto|pin OR imageto|graphic<br>" +
                "Select exactly <b>one pin</b> and <b>one graphic</b>."
            );
        }

        let graphic = null;
        let pin = null;

        msg.selected.forEach(s =>
        {
            const obj = getObj(s._type, s._id);
            if(!obj) return;

            if(s._type === "graphic") graphic = obj;
            if(s._type === "pin") pin = obj;
        });

        if(!graphic || !pin)
        {
            return sendStyledMessage(
                "Image Transfer",
                "Selection must contain exactly <b>one pin</b> and <b>one graphic</b>."
            );
        }

        if(direction === "pin")
        {
            const img = graphic.get("imgsrc");

            if(!img)
            {
                return sendStyledMessage(
                    "Image Transfer",
                    "The selected graphic does not contain a usable image."
                );
            }

            pin.set({
                pinImage: img,
                customizationType: "image"
            });

            return;
        }

        if(direction === "graphic")
        {
            const img = pin.get("pinImage");

            if(!img)
            {
                return sendStyledMessage(
                    "Image Transfer",
                    "The selected pin does not contain a stored image."
                );
            }

            graphic.set("imgsrc", img);
            return;
        }

        return sendStyledMessage(
            "Image Transfer",
            "Usage: !pintool --transform imageto|pin OR imageto|graphic"
        );
    }

    // ------------------------------------------------------------
    // Existing Transform Logic
    // ------------------------------------------------------------

    if(transformType !== "autotext")
        return sendError(`Unknown transform: ${transformType}`);

    // ---- Parse filter ----

    let filterRaw = "";

    const filterMatch = argString.match(/filter\|(.+)/i);
    if(filterMatch)
        filterRaw = filterMatch[1].trim();

    const pageId = getPageForPlayer(msg.playerid);

    let pins = [];

    // Default / selected
    if(!filterRaw || filterRaw === "selected")
    {
        if(!msg.selected?.length)
            return sendError("No pins selected.");

        pins = msg.selected
            .map(s => getObj("pin", s._id))
            .filter(p => p && p.get("_pageid") === pageId);
    }

    // Explicit all (UNCHANGED)
    else if(filterRaw === "all")
    {
        pins = findObjs({
            _type: "pin",
            _pageid: pageId
        });
    }

    // Property-based filter (NEW)
    else if(PIN_SET_PROPERTIES.hasOwnProperty(filterRaw))
    {
        if(!msg.selected?.length)
            return sendError("Select a reference pin for property-based filtering.");

        const reference = getObj("pin", msg.selected[0]._id);
        if(!reference || reference.get("_pageid") !== pageId)
            return sendError("Reference pin must be on the current page.");

        const referenceValue = reference.get(filterRaw);

        pins = findObjs({
            _type: "pin",
            _pageid: pageId
        }).filter(p => p.get(filterRaw) === referenceValue);
    }

    // Explicit IDs (UNCHANGED)
    else
    {
        pins = filterRaw.split(/\s+/)
            .map(id => getObj("pin", id))
            .filter(p => p && p.get("_pageid") === pageId);
    }

    if(!pins.length)
        return sendWarning("Transform matched no pins on the current page.");

    const queue = pins.map(p => p.id);
    const BATCH_SIZE = 10;

    const processBatch = () =>
    {
        const slice = queue.splice(0, BATCH_SIZE);

        slice.forEach(id =>
        {
            const p = getObj("pin", id);
            if(!p) return;

            const derived = deriveAutoText(p);

            if(!derived) return;

            p.set({
                customizationType: "icon",
                useTextIcon: true,
                iconText: derived
            });

            // force refresh
            p.set({ layer: p.get("layer") });
        });

        if(queue.length)
            setTimeout(processBatch, 0);
    };

    processBatch();
}


    // ============================================================
    // CONVERT MODE (tokens → handout)
    // ============================================================

    function sendConvertHelp()
    {
        sendStyledMessage(
            "PinTool — Convert",
            "<b>Usage</b><br>!pintool --convert name|h2 title|My Handout [options]"
        );
    }

    // ============================================================
    // CONVERT MODE
    // ============================================================

    function handleConvert(msg, tokens)
    {

        if(!tokens.length)
        {
            sendConvertHelp();
            return;
        }

        // ---------------- Parse convert specs (greedy tail preserved) ----------------
        const flags = {};
        const orderedSpecs = [];

        for(let i = 0; i < tokens.length; i++)
        {
            const t = tokens[i];
            const idx = t.indexOf("|");
            if(idx === -1) continue;

            const key = t.slice(0, idx).toLowerCase();
            let val = t.slice(idx + 1);

            const parts = [val];
            let j = i + 1;

            while(j < tokens.length)
            {
                const next = tokens[j];
                if(next.indexOf("|") !== -1) break;
                parts.push(next);
                j++;
            }

            val = parts.join(" ");
            flags[key] = val;
            orderedSpecs.push(
            {
                key,
                val
            });
            i = j - 1;
        }

        // ---------------- Required args ----------------
        if(!flags.title) return sendError("--convert requires title|<string>");
        if(!flags.name) return sendError("--convert requires name|h1–h5");

        const nameMatch = flags.name.match(/^h([1-5])$/i);
        if(!nameMatch) return sendError("name must be h1 through h5");

        const nameHeaderLevel = parseInt(nameMatch[1], 10);
        const minAllowedHeader = Math.min(nameHeaderLevel + 1, 6);

        const supernotes = flags.supernotesgmtext === "true";
        const imagelinks = flags.imagelinks === "true";
        const replace = flags.replace === "true"; // NEW

        // ---------------- Token validation ----------------
        if(!msg.selected || !msg.selected.length)
        {
            sendError("Please select a token.");
            return;
        }

        const selectedToken = getObj("graphic", msg.selected[0]._id);
        if(!selectedToken) return sendError("Invalid token selection.");

        const pageId = getPageForPlayer(msg.playerid);
        const charId = selectedToken.get("represents");
        if(!charId) return sendError("Selected token does not represent a character.");

        const tokensOnPage = findObjs(
        {
            _type: "graphic",
            _subtype: "token",
            _pageid: pageId,
            represents: charId
        });

        if(!tokensOnPage.length)
        {
            sendError("No matching map tokens found.");
            return;
        }

        // ---------------- Helpers ----------------
        const decodeUnicode = str =>
            str.replace(/%u[0-9A-Fa-f]{4}/g, m =>
                String.fromCharCode(parseInt(m.slice(2), 16))
            );

        function decodeNotes(raw)
        {
            if(!raw) return "";
            let s = decodeUnicode(raw);
            try
            {
                s = decodeURIComponent(s);
            }
            catch
            {
                try
                {
                    s = unescape(s);
                }
                catch (e)
                {
                    log(e);
                }
            }
            return s.replace(/^<div[^>]*>/i, "").replace(/<\/div>$/i, "").trim();
        }

        function normalizeVisibleText(html)
        {
            return html
                .replace(/<br\s*\/?>/gi, "\n")
                .replace(/<\/p\s*>/gi, "\n")
                .replace(/<[^>]+>/g, "")
                .replace(/&nbsp;/gi, " ")
                .replace(/\s+/g, " ")
                .trim();
        }

        function applyBlockquoteSplit(html)
        {
            const blocks = html.match(/<p[\s\S]*?<\/p>/gi);
            if(!blocks) return `<blockquote>${html}</blockquote>`;

            const idx = blocks.findIndex(
                b => normalizeVisibleText(b) === "-----"
            );

            // NEW: no separator → everything is player-visible
            if(idx === -1)
            {
                return `<blockquote>${blocks.join("")}</blockquote>`;
            }

            // Separator exists → split as before
            const player = blocks.slice(0, idx).join("");
            const gm = blocks.slice(idx + 1).join("");

            return `<blockquote>${player}</blockquote>\n${gm}`;
        }


        function downgradeHeaders(html)
        {
            return html
                .replace(/<\s*h[1-2]\b[^>]*>/gi, "<h3>")
                .replace(/<\s*\/\s*h[1-2]\s*>/gi, "</h3>");
        }

        function encodeProtocol(url)
        {
            return url.replace(/^(https?):\/\//i, "$1!!!");
        }

        function convertImages(html)
        {
            if(!html) return html;

            html = html.replace(
                /\[([^\]]*)\]\((https?:\/\/[^\s)]+)\)/gi,
                (m, alt, url) =>
                {
                    const enc = encodeProtocol(url);
                    let out =
                        `<img src="${url}" alt="${_.escape(alt)}" style="max-height:300px;display:block;margin:0.5em auto;">`;
                    if(imagelinks)
                    {
                        out += `<br><a href="!pintool --imagetochat|${enc}">[Image]</a>`;
                    }
                    return out;
                }
            );

            if(imagelinks)
            {
                html = html.replace(
                    /(<img\b[^>]*\bsrc=["']([^"']+)["'][^>]*>)(?![\s\S]*?\[Image\])/gi,
                    (m, img, url) =>
                    `${img}<br><a href="!pintool --imagetochat|${encodeProtocol(url)}">[Image]</a>`
                );
            }

            return html;
        }

        function applyFormat(content, format)
        {
            if(/^h[1-6]$/.test(format))
            {
                const lvl = Math.max(parseInt(format[1], 10), minAllowedHeader);
                return `<h${lvl}>${content}</h${lvl}>`;
            }
            if(format === "blockquote") return `<blockquote>${content}</blockquote>`;
            if(format === "code") return `<pre><code>${_.escape(content)}</code></pre>`;
            return content;
        }




 




        // ---------------- Build output ----------------
        const output = [];
        const tokenByName = {}; // NEW: exact name → token
        const pinsToCreateCache = new Set();

        let workTokensOnPage = tokensOnPage
            .sort((a, b) => (a.get("name") || "").localeCompare(b.get("name") || "", undefined,
            {
                sensitivity: "base"
            }));


        const finishUp = () =>
        {
            // ---------------- Handout creation ----------------
            let h = findObjs(
            {
                _type: "handout",
                name: flags.title
            })[0];
            if(!h) h = createObj("handout",
            {
                name: flags.title
            });

            h.set("notes", output.join("\n"));
            const handoutId = h.id;

            sendStyledMessage(`Handout "${flags.title}" updated.`);
            
            if(!replace) return;

            const skipped = [];
            //        const headerRegex = new RegExp(`<h${nameHeaderLevel}>([\\s\\S]*?)<\\/h${nameHeaderLevel}>`, "gi");

            const headers = [...pinsToCreateCache];

            const replaceBurndown = () =>
            {
                let header = headers.shift();
                if(header)
                {
                    const headerText = _.unescape(header).trim();
                    const token = tokenByName[headerText];

                    if(!token)
                    {
                        skipped.push(headerText);
                        return;
                    }

                    const existingPin = findObjs(
                    {
                        _type: "pin",
                        _pageid: pageId,
                        link: handoutId,
                        subLink: headerText
                    })[0];


                    if(existingPin)
                    {
                        existingPin.set(
                        {
                            x: token.get("left"),
                            y: token.get("top"),
                            link: handoutId,
                            linkType: "handout",
                            subLink: headerText
                        });

                    }
                    else
                    {
                        // Two-step pin creation to avoid desync errors
                        const pin =

                            createObj("pin",
                            {
                                pageid: pageId,
                                x: token.get("left"),
                                y: token.get("top") + 16,
                                link: handoutId,
                                linkType: "handout",
                                subLink: headerText,
                                subLinkType: "headerPlayer",
                                autoNotesType: "blockquote",
                                scale: 1,
                                notesDesynced: false,
                                imageDesynced: false,
                                gmNotesDesynced: false
                            });

                        if(pin)
                        {
                            pin.set(
                            {
                                link: handoutId,
                                linkType: "handout",
                                subLink: headerText
                            });
                        }
                    }
                    setTimeout(replaceBurndown, 0);
                }
                else
                {

                    if(skipped.length)
                    {
                        sendStyledMessage(
                            "Convert: Pins Skipped",
                            `<ul>${skipped.map(s => `<li>${_.escape(s)}</li>`).join("")}</ul>`
                        );
                    }
                    else
                    {
                        sendStyledMessage(
                            "Finished Adding Pins",
                            `Created ${pinsToCreateCache.size} Map Pins.`
                        );
                    }
                }
            };
            replaceBurndown();
        };

        const burndown = () =>
        {
            let token = workTokensOnPage.shift();
            if(token)
            {
                const tokenName = token.get("name") || "";
                tokenByName[tokenName] = token; // exact string match

                output.push(`<h${nameHeaderLevel}>${_.escape(tokenName)}</h${nameHeaderLevel}>`);
                pinsToCreateCache.add(_.escape(tokenName));

                orderedSpecs.forEach(spec =>
                {
                    if(["name", "title", "supernotesgmtext", "imagelinks", "replace"].includes(spec.key)) return;

                    let value = "";
                    if(spec.key === "gmnotes")
                    {
                        value = decodeNotes(token.get("gmnotes") || "");
                        if(supernotes) value = applyBlockquoteSplit(value);
                        value = downgradeHeaders(value);
                        value = convertImages(value);
                    }
                    else if(spec.key === "tooltip")
                    {
                        value = token.get("tooltip") || "";
                    }
                    else if(/^bar[1-3]_(value|max)$/.test(spec.key))
                    {
                        value = token.get(spec.key) || "";
                    }

                    if(value) output.push(applyFormat(value, spec.val));
                });
                setTimeout(burndown, 0);
            }
            else
            {
                finishUp();
            }
        };

        burndown();

    }

    // ============================================================
    // PLACE MODE
    // ============================================================

    function handlePlace(msg, args)
    {

        if(!args.length) return;

        /* ---------------- Parse args ---------------- */
        const flags = {};

        for(let i = 0; i < args.length; i++)
        {
            const t = args[i];
            const idx = t.indexOf("|");
            if(idx === -1) continue;

            const key = t.slice(0, idx).toLowerCase();
            let val = t.slice(idx + 1);

            const parts = [val];
            let j = i + 1;

            while(j < args.length && args[j].indexOf("|") === -1)
            {
                parts.push(args[j]);
                j++;
            }

            flags[key] = parts.join(" ");
            i = j - 1;
        }

        if(!flags.name) return sendError("--place requires name|h1–h4");
        if(!flags.handout) return sendError("--place requires handout|<exact name>");

        const nameMatch = flags.name.match(/^h([1-4])$/i);
        if(!nameMatch) return sendError("name must be h1 through h4");

        const headerLevel = parseInt(nameMatch[1], 10);
        const handoutName = flags.handout;

        /* ---------------- Resolve handout ---------------- */
        const handouts = findObjs(
        {
            _type: "handout",
            name: handoutName
        });
        if(!handouts.length)
            return sendError(`No handout named "${handoutName}" found (case-sensitive).`);
        if(handouts.length > 1)
            return sendError(`More than one handout named "${handoutName}" exists.`);

        const handout = handouts[0];
        const handoutId = handout.id;

        /* ---------------- Page ---------------- */
        const pageId = getPageForPlayer(msg.playerid);

        if(typeof pageId === "undefined")
            return sendError("pageId is not defined.");

        const page = getObj("page", pageId);
        if(!page) return sendError("Invalid pageId.");

        const gridSize = page.get("snapping_increment") * 70 || 70;
        const maxCols = Math.floor((page.get("width") * 70) / gridSize);

        const startX = gridSize / 2;
        const startY = gridSize / 2;

        let col = 0;
        let row = 0;

        /* ---------------- Header extraction ---------------- */
        const headerRegex = new RegExp(
            `<h${headerLevel}>([\\s\\S]*?)<\\/h${headerLevel}>`,
            "gi"
        );

        const headers = []; // { text, subLinkType }

        function extractHeaders(html, subLinkType)
        {
            let m;
            while((m = headerRegex.exec(html)) !== null)
            {
                const raw = m[1];

                const normalized = m[1]
                    // Strip inner tags only
                    .replace(/<[^>]+>/g, "")
                    // Convert literal &nbsp; to real NBSP characters
                    .replace(/&nbsp;/gi, "\u00A0")
                    // Decode a few safe entities (do NOT touch whitespace)
                    .replace(/&amp;/g, "&")
                    .replace(/&lt;/g, "<")
                    .replace(/&gt;/g, ">")
                    .replace(/&quot;/g, "\"")
                    .replace(/&#39;/g, "'")
                    // Trim only edges, preserve internal spacing
                    .trim();


                headers.push(
                {
                    text: normalized,
                    subLinkType
                });
            }
        }



        handout.get("notes", html => extractHeaders(html, "headerPlayer"));
        handout.get("gmnotes", html => extractHeaders(html, "headerGM"));

        if(!headers.length)
            return sendError(`No <b>h${headerLevel}</b> headers found in handout.`);

        /* ---------------- Existing pins ---------------- */
        const existingPins = findObjs(
        {
            _type: "pin",
            _pageid: pageId,
            link: handoutId
        });

        const pinByKey = {};
        existingPins.forEach(p =>
        {
            const key = `${p.get("subLink")}||${p.get("subLinkType") || ""}`;
            pinByKey[key] = p;
        });

        let created = 0;
        let replaced = 0;

        /* ---------------- Placement ---------------- */
        const burndown = () =>
        {
            let h = headers.shift();
            if(h)
            {

                const headerText = h.text;
                const subLinkType = h.subLinkType;
                const key = `${headerText}||${subLinkType}`;

                let x, y;
                const existing = pinByKey[key];

                if(existing)
                {
                    existing.set(
                    {
                        link: handoutId,
                        linkType: "handout",
                        subLink: headerText,
                        subLinkType: subLinkType,
                        autoNotesType: "blockquote",
                        scale: 1,
                        notesDesynced: false,
                        imageDesynced: false,
                        gmNotesDesynced: false
                    });
                    replaced++;
                }
                else
                {
                    x = startX + col * gridSize;

                    // Stagger every other pin in the row by 20px vertically
                    y = startY + row * gridSize + (col % 2 ? 20 : 0);

                    col++;
                    if(col >= maxCols)
                    {
                        col = 0;
                        row++;
                    }


                    // Two-step creation (same defaults as convert)
                    createObj("pin",
                    {
                        pageid: pageId,
                        x: x,
                        y: y,
                        link: handoutId,
                        linkType: "handout",
                        subLink: headerText,
                        subLinkType: subLinkType,
                        autoNotesType: "blockquote",
                        scale: 1,
                        notesDesynced: false,
                        imageDesynced: false,
                        gmNotesDesynced: false
                    });
                    created++;
                }
                setTimeout(burndown, 0);
            }
            else
            {
                /* ---------------- Report ---------------- */
                sendStyledMessage(
                    "Place Pins",
                    `<p><strong>Handout:</strong> ${_.escape(handoutName)}</p>
           <ul>
             <li>Pins created: ${created}</li>
             <li>Pins replaced: ${replaced}</li>
           </ul>`
                );
            }
        };
        burndown();

    }




    // ============================================================
    // CHAT DISPATCH
    // ============================================================

    on("chat:message", msg =>
    {
        if(msg.type !== "api" || !/^!pintool\b/i.test(msg.content)) return;

        sender = msg.who.replace(/\s\(GM\)$/, '');

        const parts = msg.content.trim().split(/\s+/);
        const cmd = parts[1]?.toLowerCase();

        if(parts.length === 1)
        {
            showControlPanel();
            return;
        }

        if(cmd === "--set") return handleSet(msg, parts.slice(2));
        if(cmd === "--convert") return handleConvert(msg, parts.slice(2));
        if(cmd === "--place") return handlePlace(msg, parts.slice(2));
        if(cmd === "--purge") return handlePurge(msg, parts.slice(2));
        if(cmd === "--help") return handleHelp(msg);
        
        

if(cmd === "--library")
{
    // Rebuild everything after --library, preserving spaces
    const argString = msg.content
        .replace(/^!pintool\s+--library\s*/i, "")
        .trim();

    if(!argString)
        return showLibraryKeywords();

    if(argString.startsWith("keyword|"))
        return showLibraryKeywordResults(argString.slice(8));

    if(argString.startsWith("copy|"))
        return copyLibraryPinToSelection(argString.slice(5), msg.selected);

    return sendError("Invalid --library syntax.");
}


        if(cmd?.startsWith("--imagetochat|"))
            return handleImageToChat(parts[1].slice(14));

        if(cmd?.startsWith("--imagetochatall|"))
            return handleImageToChatAll(parts[1].slice(17));
        
        
        if(cmd === "--transform")
        {
            const argString = msg.content
                .replace(/^!pintool\s+--transform\s*/i, "")
                .trim();

            return handleTransform(msg, argString);
        }
        sendError("Unknown subcommand. Use --help.");
    });

});

{
    try
    {
        throw new Error('');
    }
    catch (e)
    {
        API_Meta.PinTool.lineCount = (parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/, '$1'), 10) - API_Meta.PinTool.offset);
    }
}