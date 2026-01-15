// Script:   PinTool
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
var API_Meta = API_Meta||{}; //eslint-disable-line no-var
API_Meta.PinTool={offset:Number.MAX_SAFE_INTEGER,lineCount:-1};
{try{throw new Error('');}catch(e){API_Meta.PinTool.offset=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-6);}}

on("ready", () =>
{

    const version = '1.0.1'; //version number set here
    log('-=> PinTool v' + version + ' is loaded. Use !pintool --help for documentation.');
    //1.0.1 Added burndown to many parts to account for timeouts - Thanks to the Aaron
    //1.0.0 Debut


    // ============================================================
    // HELPERS
    // ============================================================

    const scriptName = "PinTool";
    const PINTOOL_HELP_NAME = "Help: PinTool";
    const PINTOOL_HELP_AVATAR = "https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147";

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
</ul>

<h3>Convert Rules</h3>

<ul>
  <li>Arguments are not prefixed with <code>--</code>.</li>
  <li>Argument order is preserved and controls output order.</li>
  <li><code>title|</code> values may contain spaces.</li>
  <li>Images in notes are converted to inline image links.</li>
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

<h2>Example Macros</h2>

<ul>
  <li><code>!pintool --set scale|1</code><br>Sets selected pin to size Medium</li>
  <li><code>!pintool --set scale|1 filter|all</code><br>Sets all pins on page to size Medium</li>
  <li><code>!pintool --set scale|1 filter|-123456789abcd -123456789abce -123456789abcf </code><br>Sets 3 specific pins on page to size Medium</li>
  <li><code>!pintool --set title|Camp notesVisibleTo|all</code><br>Sets title on selected custom pin and makes notes visible to all</li>
  <li><code>!pintool --set autoNotesType|</code><br>changes blockquote behavior on pins.</li>
  <li><code>!pintool --convert name|h2 title|Goblin Notes gmnotes|blockquote</code><br>Good all-purpose conversion command</li>
</ul>

<hr>

<h2>General Rules</h2>

<ul>
  <li>All commands are GM-only.</li>
  <li>Read-only attributes (such as <code>_type</code> and <code>_pageid</code>) cannot be modified.</li>
  <li>Invalid values abort the entire command.</li>
</ul>
`;

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

        sendChat("PinTool", `/w gm ${box}`);
    }


    function getCSS()
    {
        return {
            messageContainer: "background:#1e1e1e;" +
                "border:1px solid #444;" +
                "border-radius:6px;" +
                "padding:8px;" +
                "margin:4px 0;" +
                "font-family:Arial, sans-serif;" +
                "color:#ddd;",
            messageTitle: "font-weight:bold;" +
                "font-size:13px;" +
                "margin-bottom:6px;" +
                "color:#fff;",
            messageButton: "display:inline-block;" +
                "padding:2px 6px;" +
                "margin:2px 0;" +
                "border-radius:4px;" +
                "background:#333;" +
                "border:1px solid #555;" +
                "color:#9fd3ff;" +
                "text-decoration:none;" +
                "font-size:12px;"
        };
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

                sendChat(
                    "PinTool",
                    `/w gm ✅ Deleted ${targets.length} token(s) for "${_.escape(charName)}".`
                );
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

                const burndown = () => {
                  let p = targets.shift();
                  if(p){
                    p.remove();
                    setTimeout(burndown,0);
                  } else {
                    sendChat(
                      "PinTool",
                      `/w gm ✅ Deleted ${count} pin(s) linked to "${_.escape(handoutName)}".`
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

    // ============================================================
    // IMAGE → CHAT
    // ============================================================

    function handleImageToChat(encodedUrl)
    {
        let url = encodedUrl.trim().replace(/^(https?)!!!/i, (_, p) => `${p}://`);
        if(!/^https?:\/\//i.test(url)) return sendError("Invalid image URL.");

        sendChat(
            "PinTool",
            `/direct <div style="text-align:center;">
                <img src="${url}" style="max-width:100%;max-height:600px;">
             </div>`
        );
    }

    // ============================================================
    // SET MODE (pins)
    // ============================================================

    const PIN_SET_PROPERTIES = {
        x: "number",
        y: "number",
        title: "string",
        notes: "string",
        image: "string",
        tooltipImage: "string",
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
        gmNotesDesynced: "boolean"
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

        if(!filterRaw || filterRaw === "selected")
        {
            if(!msg.selected?.length) return sendError("No pins selected.");
            pins = msg.selected
                .map(s => getObj("pin", s._id))
                .filter(p => p && p.get("_pageid") === pageId);
        }
        else if(filterRaw === "all")
        {
            pins = findObjs(
            {
                _type: "pin",
                _pageid: pageId
            });
        }
        else
        {
            pins = filterRaw.split(/\s+/)
                .map(id => getObj("pin", id))
                .filter(p => p && p.get("_pageid") === pageId);
        }

        if(!pins.length)
            return sendWarning("Filter matched no pins on the current page.");

        const updates = {};
        try
        {
            Object.entries(flags).forEach(([key, raw]) =>
            {
                const spec = PIN_SET_PROPERTIES[key];
                let value = raw;

                if(spec === "boolean") value = raw === "true";
                else if(spec === "number") value = Number(raw);
                else if(Array.isArray(spec) && !spec.includes(value)) throw 0;
                else if(!Array.isArray(spec) && typeof spec === "object")
                {
                    value = Number(raw);
                    if(value < spec.min || value > spec.max) throw 0;
                }
                updates[key] = value;
            });
        }
        catch
        {
            return sendError("Invalid value supplied to --set.");
        }
        pins.forEach(p => p.set(updates));
        sendStyledMessage("PinTool — Success", `Updated ${pins.length} pin(s).`);
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


    const finishUp = () => {
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

      sendChat("PinTool", `/w gm Handout "${flags.title}" updated.`);

      if(!replace) return;

      const skipped = [];
//        const headerRegex = new RegExp(`<h${nameHeaderLevel}>([\\s\\S]*?)<\\/h${nameHeaderLevel}>`, "gi");
      
      const headers = [...pinsToCreateCache];

      const replaceBurndown = () => {
        let header = headers.shift();
        if( header ) {
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
          setTimeout(replaceBurndown,0);
        } else {

          if(skipped.length)
          {
            sendStyledMessage(
              "Convert: Pins Skipped",
              `<ul>${skipped.map(s => `<li>${_.escape(s)}</li>`).join("")}</ul>`
            );
          } else {
            sendStyledMessage(
              "Finished Adding Pins",
              `Created ${pinsToCreateCache.size} Map Pins.`
            );
          }
        }
      };
      replaceBurndown();
    };

    const burndown = ()=>{
      let token = workTokensOnPage.shift();
      if(token) {
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
        setTimeout(burndown,0);
      } else {
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
        headers.push(
          {
            text: _.unescape(m[1]).trim(),
            subLinkType
          });
      }
    }

    handout.get("notes", html => extractHeaders(html, "headerPlayer"));
    handout.get("gmnotes", html => extractHeaders(html, "headerGM"));

    if(!headers.length)
      return sendError(`No <h${headerLevel}> headers found in handout.`);

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
    const burndown = () => {
      let h = headers.shift();
      if(h) {

        const headerText = h.text;
        const subLinkType = h.subLinkType;
        const key = `${headerText}||${subLinkType}`;

        let x, y;
        const existing = pinByKey[key];

        if(existing)
        {
          existing.set({
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
        setTimeout(burndown,0);
      } else {
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

        const parts = msg.content.trim().split(/\s+/);
        const cmd = parts[1]?.toLowerCase();

        if(cmd === "--set") return handleSet(msg, parts.slice(2));
        if(cmd === "--convert") return handleConvert(msg, parts.slice(2));
        if(cmd === "--place") return handlePlace(msg, parts.slice(2));
        if(cmd === "--purge") return handlePurge(msg, parts.slice(2));
        if(cmd === "--help") return handleHelp(msg);
        if(cmd?.startsWith("--imagetochat|"))
            return handleImageToChat(parts[1].slice(14));

        sendError("Unknown subcommand. Use --help.");
    });
});

{try{throw new Error('');}catch(e){API_Meta.PinTool.lineCount=(parseInt(e.stack.split(/\n/)[1].replace(/^.*:(\d+):.*$/,'$1'),10)-API_Meta.PinTool.offset);}}
