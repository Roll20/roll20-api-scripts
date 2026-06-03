// Script:   Image Editor
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
const imageeditor = (() => {

on("ready", () => {
    'use strict';
 
    const version = '1.0.0';
    log('-=> Image Editor v' + version + ' is loaded. Use !imageeditor to create interface');
    // 1.0.0 Debut

 
    // ==================================================
    // HELP HANDOUT
    // ==================================================
    const HELP_NAME   = 'Help: Image Editor';
    const HELP_AVATAR = 'https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147';
    const HELP_TEXT   = `
<h1>Image Editor Guide</h1>
<p>
The <strong>Image Editor</strong> allows you to select any handout that contains images and modify the style, layout, and properties of those images without manually editing HTML. Changes are written directly back to the handout's notes.
</p>
 
<h2>Getting Started</h2>
<p>Type <code>!imageeditor</code> in chat to open the Image Editor interface. The editor opens as a handout called <strong>Image Editor</strong> in your journal. Only handouts that contain at least one image will appear in the chooser.</p>
 
<h2>Choosing a Handout</h2>
<p>Click the <strong>Choose Handout</strong> button in the top right of the editor. A dropdown will appear listing all handouts that contain images, in alphabetical order. Selecting one will load its images into the editor.</p>
<p>The name of the currently selected handout appears as a link in the header. Below it, if the currently selected image is preceded by a header in the handout, that header will appear as a secondary link which jumps directly to that section of the handout.</p>
 
<h2>Thumbnails Panel</h2>
<p>The left panel shows thumbnails of every image found in the selected handout. Click any thumbnail to load that image into the preview panel and populate the properties panel with its current values. The title of the image, if set, appears below each thumbnail.</p>
 
<h2>Preview Panel</h2>
<p>The center panel shows a large preview of the currently selected image. At the top of the preview panel is a navigation bar with left and right arrow buttons for moving to the previous or next image without scrolling the thumbnail list. The small thumbnails beside the arrows show the adjacent images and are also clickable.</p>
 
<h2>Properties Panel</h2>
<p>The right panel shows the editable properties of the currently selected image. Click any value to open a prompt where you can enter a new value. Leaving the prompt blank will remove that property from the image entirely.</p>
 
<h3>title</h3>
<p>Sets the <code>title</code> attribute of the image tag. This text appears as a tooltip when the user hovers over the image.</p>
 
<h3>url</h3>
<p>Sets the <code>src</code> attribute, replacing the image with a different one at the given URL.</p>
 
<h3>layout</h3>
<p>Applies a float-based layout preset to the image. Options are:</p>
<ul>
<li><strong>left</strong> — floats the image to the left, text wraps around the right.</li>
<li><strong>right</strong> — floats the image to the right, text wraps around the left.</li>
<li><strong>center</strong> — displays the image as a centered block.</li>
<li><strong>none</strong> — removes float and display properties.</li>
</ul>
 
<h3>width / height</h3>
<p>Sets the width or height of the image. Values must be in pixels (e.g. <code>200px</code>) or percent (e.g. <code>50%</code>).</p>
 
<h3>margin</h3>
<p>Sets the margin around the image. Accepts 1 to 4 values in pixels or percent, space-separated, following standard CSS margin shorthand (e.g. <code>8px 16px</code>).</p>
 
<h3>border-radius</h3>
<p>Rounds the corners of the image. Value must be in pixels or percent (e.g. <code>8px</code>).</p>
 
<h2>Presets</h2>
<p>Below the properties are quick-apply preset buttons. Clicking a preset merges a predefined set of style values into the image's existing styles, preserving properties like <code>border-radius</code> that are not part of the preset.</p>
<ul>
<li><strong>Left 30% / 50% / 60%</strong> — floats the image left at the given width with a small right margin.</li>
<li><strong>Right 30% / 50% / 60%</strong> — floats the image right at the given width with a small left margin.</li>
<li><strong>Center</strong> — displays the image as a full-width centered block.</li>
<li><strong>Clear</strong> — removes all inline style information from the image tag, returning it to its unstyled default.</li>
</ul>
 
<h2>Commands</h2>
<ul>
<li><code>!imageeditor</code> — Opens or refreshes the Image Editor interface.</li>
<li><code>!imageeditor --help</code> — Creates or updates this help handout and whispers you a link to it.</li>
</ul>
 
<h2>Notes</h2>
<ul>
<li>The Image Editor cannot be used to edit its own handout.</li>
<li>Only images in the <strong>notes</strong> field of a handout are visible to the editor. Images in gmnotes are not shown.</li>
<li>Style changes are written directly to the handout HTML. Always keep a backup of important handout content.</li>
<li><strong>Large handouts:</strong> If the referenced handout contains a very large amount of content (many images, long text), keep it <strong>closed</strong> while making edits in the Image Editor. Having both handouts open simultaneously while saving changes can cause the browser to become unresponsive.</li>
</ul>
`;
 
    // ==================================================
    // STATE
    // ==================================================
    const checkInstall = () => {
        state.ImageEditor = state.ImageEditor || {
            handoutId:       null,
            selectedIndex:   0,
            // cachedHandoutOptions: array of "Name,id" strings for the picker.
            // Rebuilt only on --choose and --refresh, not on every render.
            cachedHandoutOptions: null
        };
        // Remove legacy fields that should not be in persistent state.
        if (state.ImageEditor.hasOwnProperty('currentImages')) {
            delete state.ImageEditor.currentImages;
        }
        if (state.ImageEditor.hasOwnProperty('editorHandoutId')) {
            delete state.ImageEditor.editorHandoutId;
        }
    };
 
    // ==================================================
    // CONFIG
    // ==================================================
    const Config = {
        editorName: 'Image Editor',
        
        largeHandoutWarningSize: 100000,
 
        properties: {
            width:           { type: 'size' },
            'max-width':     { type: 'size' },
            height:          { type: 'size' },
            'max-height':    { type: 'size' },
            'border-radius': { type: 'size' },
 
            layout: {
                type: 'enum',
                values: ['left', 'right', 'center', 'none']
            },
 
            margin: { type: 'margin' },
 
            title: { type: 'string', attribute: true },
            url:   { type: 'string', attribute: true }
        },
 
        presets: [
            { label: 'Left 30%',  styles: { width: '30%',  float: 'left',  display: 'inline', margin: '0 8px 8px 0' } },
            { label: 'Right 30%', styles: { width: '30%',  float: 'right', display: 'inline', margin: '0 0 8px 8px' } },
            { label: 'Left 50%',  styles: { width: '50%',  float: 'left',  display: 'inline', margin: '0 8px 8px 0' } },
            { label: 'Right 50%', styles: { width: '50%',  float: 'right', display: 'inline', margin: '0 0 8px 8px' } },
            { label: 'Left 60%',  styles: { width: '60%',  float: 'left',  display: 'inline', margin: '0 8px 8px 0' } },
            { label: 'Right 60%', styles: { width: '60%',  float: 'right', display: 'inline', margin: '0 0 8px 8px' } },
            { label: 'Center',    styles: { width: '100%', float: 'none',  display: 'block',  margin: '0 auto' } },
            { label: 'Clear',     styles: null }
        ]
    };
 
    // ==================================================
    // CSS (CENTRALIZED)
    // ==================================================
    const CSS = {
        header:        'font-weight:bold; font-size:18px; padding:8px; color:#ddd;',
        headerRow:     'width:100%; background:#000; border:none; table-layout:fixed;',
        headerCell:    'vertical-align:middle; border:none; background:#000; padding:0 8px;',
        right:         'text-align:right;',
        center:        'text-align:center; color:#ddd; font-weight:bold; font-size:18px;',
 
        table:         'width:100%; background:#000; color:#ccc; border:none; table-layout:fixed;',
 
        td:            'vertical-align:top; padding:10px;',
        tdThumbnail:   'width:205px; vertical-align:top; padding:10px; text-align:center;',
        tdPreview:     'vertical-align:top; padding:10px;',
        tdControl:     'width:205px; vertical-align:top; padding:10px;',
 
        thumb:         'display:block; margin:8px auto 2px auto; width:125px; border:1px solid #444; border-radius:8px; background:transparent;',
        preview:       'max-width:100%; max-height:300px; border:none; background:#111; padding:4px;',
 
        handoutButton: 'text-decoration:none; color:#6ca0ff; background:#222; border:1px solid #444; padding:4px 8px; border-radius:3px; cursor:pointer; font-size:14px;',
        button:        'text-decoration:none; color:#6ca0ff; cursor:pointer;',
 
        label:         'font-weight:bold; color:#aaa;',
        value:         'color:#6ca0ff;',
        muted:         'color:#666;',
 
        panelHeader:   'font-weight:bold; color:#ddd; margin-bottom:8px; border-bottom:1px solid #444; padding-bottom:4px;',
 
        thumbnailPanel:'width:200px; max-height:500px; overflow-y:auto; background:#000; border:none; padding:8px; text-align:center;',
        previewPanel:  'background:#000; border:none; padding:8px; text-align:center;',
        controlPanel:  'width:200px; max-height:500px; overflow-y:auto; background:#000; border:none; padding:8px;',
        previewHeader: 'width:100%; overflow:hidden; border-bottom:1px solid #444; padding-bottom:4px; margin-bottom:8px;',
        navButton:     'text-decoration:none; color:#ddd; font-weight:bold; font-size:16px; padding:0 6px; background:#222; border:1px solid #444; border-radius:3px;',
        navThumb:      'max-height:30px; border:1px solid #444; border-radius:3px; vertical-align:middle; margin:0 2px;',
 
        handoutLink:   'text-decoration:none; color:#fff; font-weight:bold; font-size:14px;',
        headerLink:    'text-decoration:none; color:#aad4f5; font-weight:normal; font-size:11px; display:block; margin-top:3px;',
 
        // Chat launch message (sent when bare !imageeditor is typed)
        launchBox:     'background:#111; border:1px solid #444; border-radius:4px; padding:10px 14px; font-family:sans-serif;',
        launchTitle:   'font-size:15px; font-weight:bold; color:#ddd; margin-bottom:6px;',
        launchLink:    'text-decoration:none; color:#6ca0ff; background:#222; border:1px solid #444; padding:5px 10px; border-radius:3px; font-size:13px; font-weight:bold;',
 
        // Help whisper box — same family as launchBox
        helpLink:      'color:#9fd3ff; font-weight:bold; text-decoration:none;'
    };
 
    // ==================================================
    // UTILITIES
    // ==================================================
    const Utils = {
 
        send:    (msg)       => sendChat('ImageEditor', msg),
        whisper: (who, msg)  => sendChat('ImageEditor', `/w "${who.replace(/ \(GM\)$/,'')}" ${msg}`),
 
        buildEnumQuery: (title, values, current) => {
            const opts = values.map(v => `${v}${v === current ? '*' : ''}`);
            return `?{${title}|${opts.join('|')}}`;
        },
 
        buildSizeQuery:   (title, current) => `?{${title} (px or %)|${current || ''}}`,
        buildMarginQuery: (current)        => `?{Margin (1-4 values px or %)|${current || ''}}`,
 
        // ------------------------------------------------------------------
        // rebuildHandoutCache
        // ------------------------------------------------------------------
        // Asynchronously scans all handouts for images and stores the result
        // in state.ImageEditor.cachedHandoutOptions as an array of "Name,id"
        // strings.  Calls callback() when done (no arguments).
        //
        // Call this ONLY on --choose and --refresh.  All other operations
        // must use the cache directly — never call this on every render.
        // ------------------------------------------------------------------
        rebuildHandoutCache: (callback) => {
            const handouts = findObjs({ type: 'handout' })
                .sort((a, b) => a.get('name').localeCompare(b.get('name')));
 
            if (!handouts.length) {
                state.ImageEditor.cachedHandoutOptions = [];
                callback();
                return;
            }
 
            const results  = [];
            let remaining  = handouts.length;
 
            handouts.forEach(h => {
                h.get('notes', text => {
                    const hasImage = /<img\b[^>]*>/i.test(text || '');
                    if (hasImage) results.push(h);
                    remaining--;
                    if (remaining === 0) {
                        state.ImageEditor.cachedHandoutOptions =
                            results.map(r => `${r.get('name')},${r.id}`);
                        callback();
                    }
                });
            });
        },
 
        // Return the cached picker options, or an empty array if not yet built.
        getCachedOptions: () => state.ImageEditor.cachedHandoutOptions || [],
 
        // Always look up the editor handout by name. This means a rename or
        // deletion is handled gracefully — the script never holds a stale ID.
        // findObjs is an in-memory index lookup and is fast enough to call
        // on every command without caching.
        getEditorHandout: () => {
            const existing = findObjs({ type: 'handout', name: Config.editorName })[0];
            if (existing) return existing;
 
            // Not found — create it fresh.
            log(`[ImageEditor] "${Config.editorName}" handout not found — creating.`);
            return createObj('handout', {
                name: Config.editorName,
                inplayerjournals: 'all'
            });
        },
 
        // ------------------------------------------------------------------
        // findPrecedingHeader
        // ------------------------------------------------------------------
        // Scans the handout HTML for the nearest h1-h4 that appears before
        // the Nth <img> tag (0-based).  Returns { text, level } or null.
        // ------------------------------------------------------------------
        findPrecedingHeader: (html, imgIndex) => {
 
            // Step 1: find the character offset of the target <img> tag.
            const imgRe = /<img\b[^>]*>/gi;
            let count   = 0;
            let imgPos  = -1;
            let m;
 
            while ((m = imgRe.exec(html)) !== null) {
                if (count === imgIndex) { imgPos = m.index; break; }
                count++;
            }
 
            if (imgPos === -1) return null;
 
            // Step 2: find the last h1-h4 whose opening tag starts before imgPos.
            // Work on only the substring before the image for efficiency.
            const before   = html.slice(0, imgPos);
            const headRe   = /<h([1-4])[^>]*>([\s\S]*?)<\/h\1>/gi;
            let lastHeader = null;
            let hm;
 
            while ((hm = headRe.exec(before)) !== null) {
                const text = hm[2].replace(/<[^>]+>/g, '').trim();
                if (text) lastHeader = { text, level: parseInt(hm[1], 10) };
            }
 
            return lastHeader;
        }
    };
 
    // ==================================================
    // COMMAND PARSER
    // ==================================================
    const parseArgs = (content) => {
        const tokens = content.split(/\s+--/).slice(1);
        const args   = {};
 
        tokens.forEach(t => {
            const [key, ...rest] = t.split(/\s+/);
            const body = rest.join(' ');
 
            if (key === 'set') {
                const [prop, ...valParts] = body.split('|');
                const value = valParts.join('|').trim();
                args.set = args.set || [];
                args.set.push({ property: prop.trim(), value });
            } else {
                args[key] = body.trim();
            }
        });
 
        return args;
    };
 
    // ==================================================
    // STYLE ENGINE
    // ==================================================
    const StyleEngine = {
 
        parse: (str) => {
            const o = {};
            if (!str) return o;
            str.split(';').forEach(p => {
                const idx = p.indexOf(':');
                if (idx === -1) return;
                const k = p.slice(0, idx).trim();
                const v = p.slice(idx + 1).trim();
                if (k && v) o[k] = v;
            });
            return o;
        },
 
        serialize: (o) =>
            Object.entries(o).map(([k, v]) => `${k}:${v}`).join('; '),
 
        validateSize: (v) =>
            /^\d+(px|%)$/.test(v) ? v : null,
 
        validateMargin: (v) => {
            v = v.trim().replace(/\s+/g, ' ');
            return /^(\d+(px|%))( \d+(px|%)){0,3}$/.test(v) ? v : null;
        },
 
        applyLayout: (style, layout) => {
            delete style.float;
            delete style.display;
 
            if (layout === 'left')  { style.float = 'left';  style.display = 'inline'; style.margin = '0'; }
            if (layout === 'right') { style.float = 'right'; style.display = 'inline'; style.margin = '0'; }
 
            if (layout === 'center') {
                style.float   = 'none';
                style.display = 'block';
                if (style.margin) {
                    const p = style.margin.split(' ');
                    if (p.length === 1) style.margin = `${p[0]} auto`;
                    if (p.length === 2) style.margin = `${p[0]} auto`;
                    if (p.length === 3) style.margin = `${p[0]} auto ${p[2]}`;
                    if (p.length === 4) style.margin = `${p[0]} auto ${p[2]} auto`;
                } else {
                    style.margin = '0 auto';
                }
            }
            return style;
        }
    };
 
    // ==================================================
    // IMAGE PARSER
    // ==================================================
    const Parser = {
 
        extractImages: (html) => {
            const matches = html.match(/<img\b[^>]*>/gi) || [];
            return matches.map(tag => {
                const get = (a) => {
                    const m = tag.match(new RegExp(`${a}="([^"]*)"`, 'i'));
                    return m ? m[1] : '';
                };
                return { tag, src: get('src'), style: get('style'), title: get('title') };
            });
        },
 
        // Replace the first occurrence of oldTag in html using a literal
        // string search (indexOf + slice) rather than .replace(), which would
        // misinterpret regex special characters in image src URLs.
        replaceImage: (html, oldTag, newTag) => {
            const pos = html.indexOf(oldTag);
            if (pos === -1) return html;
            return html.slice(0, pos) + newTag + html.slice(pos + oldTag.length);
        },
 
        rebuildTag: (img, styleStr) => {
            let t = img.tag
                .replace(/\sstyle="[^"]*"/i,  '')
                .replace(/\stitle="[^"]*"/i,  '')
                .replace(/\ssrc="[^"]*"/i,    '');
            return t.replace('<img',
                `<img style="${styleStr}" title="${img.title || ''}" src="${img.src || ''}"`);
        }
    };
 
    // ==================================================
    // RENDERER
    // ==================================================
    const Renderer = {
 
        header: (handoutName, handoutOptions, headerInfo) => {
 
            const handoutId = state.ImageEditor.handoutId;
 
            let centreContent;
            if (handoutName) {
                const handoutUrl  = `http://journal.roll20.net/handout/${handoutId}`;
                const handoutLink = `<a style="${CSS.handoutLink}" href="${handoutUrl}">${handoutName}</a>`;
                const deepLink    = headerInfo
                    ? `<a style="${CSS.headerLink}" href="${handoutUrl}/#${headerInfo.text}">${headerInfo.text}</a>`
                    : '';
                centreContent = handoutLink + deepLink;
            } else {
                centreContent = `<span style="${CSS.muted}">No Handout Selected</span>`;
            }
 
            const pickerQuery = (handoutOptions && handoutOptions.length)
                ? `?{Select Handout|${handoutOptions.join('|')}}`
                : '?{No handouts with images found|}';
 
            return `
    <table style="${CSS.headerRow}">
        <tr>
            <td style="${CSS.headerCell}">
                <div style="${CSS.header}">Image Editor</div>
            </td>
            <td style="${CSS.headerCell} ${CSS.center}">
                ${centreContent}
            </td>
            <td style="${CSS.headerCell} ${CSS.right}">
                <a style="${CSS.handoutButton}" href="!imageeditor --choose ${pickerQuery}">
                    Choose Handout
                </a>
                                <a style="${CSS.handoutButton}" href="!imageeditor --help">
                    ?
                </a>
            </td>
        </tr>
    </table>`;
        },
 
        thumbs: (images) =>
            images.map((i, idx) => `
                <a href="!imageeditor --select ${idx}">
                    <img src="${i.src}" style="${CSS.thumb}">
                </a>
                <div>${i.title || ''}</div>
            `).join(''),
 
        controls: (img) => {
 
            const style = StyleEngine.parse(img.style);
 
            const control = (name, val, query) =>
                `<div style="margin-bottom:6px;">
                    <span style="${CSS.label}">${name}:</span>
                    <a style="${CSS.button}" href="!imageeditor --set ${name}|${query}">
                        <span style="${CSS.value}">${val || '—'}</span>
                    </a>
                </div>`;
 
            const propOrder = ['title', 'url', 'layout', 'width', 'height', 'margin', 'border-radius'];
 
            const propertyControls = propOrder.map(p => {
                const conf = Config.properties[p];
                if (!conf) return '';
 
                let val = (p === 'title') ? img.title : style[p];
                val = val || '—';
 
                let query = '';
                if (conf.type === 'enum')   query = Utils.buildEnumQuery(p, conf.values, val === '—' ? '' : val);
                if (conf.type === 'size')   query = Utils.buildSizeQuery(p, val === '—' ? '' : val);
                if (conf.type === 'margin') query = Utils.buildMarginQuery(val === '—' ? '' : val);
                if (conf.type === 'string') query = `?{${p}|${val === '—' ? '' : val}}`;
 
                return control(p, val, query);
            }).join('');
 
            const presetButtons = Config.presets.map(p =>
                `<a style="${CSS.button}; display:inline-block; margin-bottom:4px; padding:1px 4px; border:1px solid #444; border-radius:3px; background:#222; width:80px;"
                    href="!imageeditor --preset ${encodeURIComponent(JSON.stringify(p.styles))}">
                    ${p.label}
                </a>`
            ).join(' ');
 
            return propertyControls + `
                <div style="margin-top:12px; border-top:1px solid #444; padding-top:8px;">
                    <div style="${CSS.panelHeader}">Presets</div>
                    ${presetButtons}
                </div>`;
        },
 
        render: (handout, images, handoutOptions, headerInfo) => {
 
            // Clamp idx to valid range — state may hold a stale index from a
            // previous session with more images than the current array has.
            const idx = images.length > 0
                ? Math.max(0, Math.min(state.ImageEditor.selectedIndex || 0, images.length - 1))
                : 0;
            const img = images[idx] || null;
 
            return `
        <div style="background:#000; margin:-30px;">
            ${Renderer.header(handout.get('name'), handoutOptions, headerInfo)}
            <table style="${CSS.table}">
                <tr>
                    <td style="${CSS.tdThumbnail}">
                        <div style="${CSS.thumbnailPanel}">
                            <div style="${CSS.panelHeader}">Thumbnails</div>
                            ${Renderer.thumbs(images)}
                        </div>
                    </td>
                    <td style="${CSS.tdPreview}">
                        <div style="${CSS.previewPanel}">
                            <div style="${CSS.previewHeader}">
                                <span style="float:left;">
                                ${img && idx > 0
                                    ? `<a style="${CSS.navButton}" href="!imageeditor --select ${idx-1}">&lsaquo;</a><a href="!imageeditor --select ${idx-1}"><img src="${images[idx-1].src}" style="${CSS.navThumb}" title="${images[idx-1].title||''}"></a>`
                                    : `<span style="${CSS.navButton}; opacity:0.2;">&lsaquo;</span>`}
                                </span>
                                <span style="float:right;">
                                ${img && idx < images.length - 1
                                    ? `<a href="!imageeditor --select ${idx+1}"><img src="${images[idx+1].src}" style="${CSS.navThumb}" title="${images[idx+1].title||''}"></a><a style="${CSS.navButton}" href="!imageeditor --select ${idx+1}">&rsaquo;</a>`
                                    : `<span style="${CSS.navButton}; opacity:0.2;">&rsaquo;</span>`}
                                </span>
                                <span style="display:block; text-align:center; font-weight:bold; color:#ddd;">Image Preview</span>
                            </div>
                            ${img
                                ? `<img src="${img.src}" style="${CSS.preview};">`
                                : `<div style="color:#666; padding:20px;">No image selected</div>`}
                        </div>
                    </td>
                    <td style="${CSS.tdControl}">
                        <div style="${CSS.controlPanel}">
                            <div style="${CSS.panelHeader}">Properties</div>
                            ${img ? Renderer.controls(img) : '<div style="color:#666;">No image selected</div>'}
                        </div>
                    </td>
                </tr>
            </table>
        </div>`;
        }
    };
 
    // ==================================================
    // RENDER HELPERS
    // ==================================================
    // Central render call used by all command paths.
    // Uses the cached handout options — never rebuilds the list.
    const renderEditor = (handout, notes, images) => {
        const editor      = Utils.getEditorHandout();
        const options     = Utils.getCachedOptions();
        const idx         = state.ImageEditor.selectedIndex || 0;
        const headerInfo  = Utils.findPrecedingHeader(notes, idx);
        editor.set('notes', Renderer.render(handout, images, options, headerInfo));
    };
 
    // Render the empty-state panel (no handout chosen yet) into the editor
    // handout.  Called on script load and whenever the editor needs to show
    // its initial UI so the GM has something to interact with.
    const renderEmptyPanel = () => {
        const editor = Utils.getEditorHandout();
        editor.set('notes', Renderer.render({ get: () => null }, [], Utils.getCachedOptions(), null));
    };
 
    // ==================================================
    // MAIN
    // ==================================================
    const handleInput = (msg) => {
 
        if (msg.type !== 'api') return;
        if (!msg.content.startsWith('!imageeditor')) return;
 
        // ------------------------------------------------------------------
        // Bare command: !imageeditor (no sub-command)
        // Ensure the editor handout exists, then whisper a styled clickable
        // link to it so the GM can open it without hunting through the journal.
        // ------------------------------------------------------------------
        const trimmed = msg.content.trim();
        if (trimmed === '!imageeditor') {
            const editor = Utils.getEditorHandout();
            const url    = `http://journal.roll20.net/handout/${editor.id}`;
            Utils.whisper(msg.who,
                `<div style="${CSS.launchBox}">` +
                `<div style="${CSS.launchTitle}">Image Editor</div>` +
                `<a style="${CSS.launchLink}" href="${url}">Open Image Editor</a>` +
                `</div>`
            );
            // Also ensure the handout has content — renders the empty-state
            // panel if the handout was just created or was previously blank.
            editor.get('notes', notes => {
                if (!notes || !notes.trim()) renderEmptyPanel();
            });
            return;
        }
 
        // ------------------------------------------------------------------
        // --help: create or update the Help: Image Editor handout, whisper link.
        // ------------------------------------------------------------------
        if (trimmed === '!imageeditor --help') {
            let helpHandout = findObjs({ type: 'handout', name: HELP_NAME })[0];
            if (!helpHandout) {
                helpHandout = createObj('handout', {
                    name:     HELP_NAME,
                    archived: false,
                    avatar:   HELP_AVATAR
                });
            }
            helpHandout.set('avatar', HELP_AVATAR);
            helpHandout.set('notes',  HELP_TEXT);
            const helpUrl = `http://journal.roll20.net/handout/${helpHandout.id}`;
            const helpBox =
                `<div style="${CSS.launchBox}">` +
                `<div style="${CSS.launchTitle}">Image Editor Help</div>` +
                `<a style="${CSS.helpLink}" href="${helpUrl}">Open Help Handout</a>` +
                `</div>`;
            sendChat('ImageEditor', `/w gm ${helpBox}`, null, { noarchive: true });
            return;
        }
 
        const args   = parseArgs(msg.content);
        const editor = Utils.getEditorHandout();
 
        // ------------------------------------------------------------------
        // --choose: set new target handout, rebuild the picker cache, render.
        // This is the ONLY path that calls rebuildHandoutCache.
        // ------------------------------------------------------------------
        if (args.choose) {
            state.ImageEditor.handoutId     = args.choose;
            state.ImageEditor.selectedIndex = 0;
 
            const handout = getObj('handout', args.choose);
            if (!handout) {
                editor.set('notes', Renderer.render({ get: () => null }, [], Utils.getCachedOptions(), null));
                return;
            }
 
            Utils.rebuildHandoutCache(() => {
                handout.get('notes', notes => {
                    
                if (notes && notes.length > Config.largeHandoutWarningSize) {
                    Utils.whisper(msg.who,
                        `<div style="${CSS.launchBox}">` +
                        `<div style="${CSS.launchTitle}" style="color:#ffaa44;">⚠ Large Handout Warning</div>` +
                        `<div style="color:#ccc; font-size:12px;">The chosen handout is ${Math.round(notes.length/1000)}k characters. ` +
                        `If you keep it open while editing, your browser may become unresponsive. ` +
                        `It is recommended to <strong>close the referenced handout</strong> before making edits, ` +
                        `then reopen it to review changes.</div>` +
                        `</div>`
                    );
                }
                    
                    const images = Parser.extractImages(notes);
                    if (!images.length) {
                        editor.set('notes',
                            Renderer.header(handout.get('name'), Utils.getCachedOptions(), null) +
                            '<p style="color:#666; padding:8px;">No images found in this handout.</p>'
                        );
                        return;
                    }
                    renderEditor(handout, notes, images);
                });
            });
            return;
        }
 
        // ------------------------------------------------------------------
        // All other commands operate on the already-chosen handout.
        // They use the cached picker list and never scan all handouts.
        // ------------------------------------------------------------------
        const handout = getObj('handout', state.ImageEditor.handoutId);
 
        if (!handout) {
            editor.set('notes', Renderer.render({ get: () => null }, [], Utils.getCachedOptions(), null));
            return;
        }
 
        if (handout.get('name') === Config.editorName) {
            Utils.whisper(msg.who, 'Cannot edit images in the Image Editor handout.');
            return;
        }
 
        handout.get('notes', notes => {
 
            let images = Parser.extractImages(notes);
 
            if (!images.length) {
                editor.set('notes',
                    Renderer.header(handout.get('name'), Utils.getCachedOptions(), null) +
                    '<p style="color:#666; padding:8px;">No images found in this handout.</p>'
                );
                return;
            }
 
            // --select
            if (args.select !== undefined) {
                state.ImageEditor.selectedIndex = Math.max(0,
                    Math.min(images.length - 1, parseInt(args.select)));
            }
 
            let img   = images[state.ImageEditor.selectedIndex];
            let style = StyleEngine.parse(img.style);
 
            // --set
            if (args.set) {
                args.set.forEach(s => {
                    const conf = Config.properties[s.property];
                    if (!conf) return;
                    const value = s.value.trim();
 
                    if (!value) {
                        if (conf.type === 'string') { img.title = ''; }
                        else { delete style[s.property]; }
                        if (s.property === 'layout') style = StyleEngine.applyLayout(style, 'none');
                        return;
                    }
                    if (conf.type === 'size')   { const v = StyleEngine.validateSize(value);   if (v) style[s.property] = v; }
                    if (conf.type === 'margin') { const v = StyleEngine.validateMargin(value); if (v) style.margin = v; }
                    if (conf.type === 'enum') {
                        if (conf.values.includes(value) && s.property === 'layout') {
                            style = StyleEngine.applyLayout(style, value);
                            style.layout = value;
                        }
                    }
                    if (conf.type === 'string') {
                        if (s.property === 'url') img.src = value;
                        else img.title = value;
                    }
                });
 
                const newTag = Parser.rebuildTag(img, StyleEngine.serialize(style));
                notes  = Parser.replaceImage(notes, img.tag, newTag);
                handout.set('notes', notes);
                images = Parser.extractImages(notes);
            }
 
            // Re-fetch img after possible --set update
            img   = images[state.ImageEditor.selectedIndex];
            style = StyleEngine.parse(img.style);
 
            // --preset
            if (args.preset) {
                try {
                    const presetStyles = JSON.parse(decodeURIComponent(args.preset));
                    if (presetStyles === null) {
                        style = {};
                    } else {
                        Object.assign(style, presetStyles);
                    }
                } catch(e) {
                    log('ImageEditor: failed to parse preset — ' + e);
                }
                const newTag = Parser.rebuildTag(img, StyleEngine.serialize(style));
                notes  = Parser.replaceImage(notes, img.tag, newTag);
                handout.set('notes', notes);
                images = Parser.extractImages(notes);
            }
 
            renderEditor(handout, notes, images);
        });
    };
 
    // ==================================================
    checkInstall();
    on('chat:message', handleInput);
 
    // Prime the cache on script load, then render the empty-state panel so
    // the handout has content immediately — even if it was just created.
    Utils.rebuildHandoutCache(() => {
        log('-=> Image Editor: handout cache primed (' +
            (state.ImageEditor.cachedHandoutOptions || []).length + ' handouts with images).');
        // Only write the empty panel if the handout is genuinely blank —
        // don't overwrite a valid session that survived a sandbox restart.
        const editor = Utils.getEditorHandout();
        editor.get('notes', notes => {
            if (!notes || !notes.trim()) renderEmptyPanel();
        });
    });
 
});

})();

