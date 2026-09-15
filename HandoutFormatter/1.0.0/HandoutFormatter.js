// Script:   Handout Formatter
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis

const HandoutFormatter = (() => {
  'use strict';

  // Config

  const COMMAND_NAME = 'formathandout';
  // Internal state storage key only (state[STATE_KEY]) -- never displayed,
  // just needs to match this file's own top-level identifier below.
  const STATE_KEY = 'HandoutFormatter';
  const VERSION = '1.0.0';
  const LAST_UPDATE = 1788393600; // unix timestamp, seconds
  const SCHEMA_VERSION = 0.1;

  const DEBUG = false;

  const PROGRAM_NAME = 'Handout Formatter';
  const PANEL_NAME = 'Handout Formatter';
  const STYLE_SUFFIX = '_css';
  const BUILTIN_TAG = 'formathandout-builtin';
  const EXPORT_HANDOUT_NAME = 'Handout Formatter Styles Export';
  const IMPORT_HANDOUT_NAME = 'Handout Formatter Styles Import';
  const DEV_GAME_PLAYER_ID = '-LPNiC84i6AI7m7NuqlV';
  const isDevGame = () => findObjs({ type: 'player' }).some(p => p.id === DEV_GAME_PLAYER_ID);
  const HELP_HANDOUT_NAME = 'Help: Handout Formatter';
  // Same avatar the other scripts' help handouts use, for a
  // consistent look across the library.
  const HANDOUT_AVATAR = 'https://files.d20.io/images/470559564/QxDbBYEhr6jLMSpm0x42lg/original.png?1767857147';
  const IMAGE_EDITOR_COMMAND = '!imageeditor';
  const IMAGE_EDITOR_THREAD_URL = 'https://app.roll20.net/forum/post/12716858/script-image-editor-format-images-add-captions-and-flow-text-in-roll20-handouts';
  const STYLE_LIBRARY_URL = 'https://github.com/keithcurtis1/roll20-api-scripts/blob/master/HandoutFormatter/style-library.md';
  const styleExportStart = (handoutName) => `##### STYLE: ${handoutName} #####`;
  const STYLE_EXPORT_END = '##### END #####';
  const DIGIT_BUCKET_KEY = '09';
  const OPEN_ICON_URL = 'https://files.d20.io/images/499306760/P0U-RtaBG5HTjvAWOFHfCA/original.webp?178807691';
  const OPEN_ICON_HTML = `<img src="${OPEN_ICON_URL}" width="14" height="14" style="vertical-align:middle;" alt="Open in Roll20">`;
  const bindingTagPrefix = (field) => `formathandout-bound-${field}::`;
  const migrateStyleBindings = (oldName, newName) => {
    ['notes', 'gmnotes'].forEach(field => {
      const prefix = bindingTagPrefix(field);
      const oldTag = `${prefix}${oldName}`;
      const newTag = `${prefix}${newName}`;
      findObjs({ type: 'handout' }).forEach(h => {
        let tags = [];
        try { tags = JSON.parse(h.get('tags') || '[]') || []; } catch (e) { /* ignore */ }
        const idx = tags.indexOf(oldTag);
        if (idx === -1) return;
        tags[idx] = newTag;
        try { h.set('tags', JSON.stringify(tags)); } catch (e) { /* ignore */ }
        Logger.log(`Migrated style binding on "${h.get('name')}" (${field}): "${oldName}" -> "${newName}"`);
      });
    });
  };
  const seedVersionTag = (seed) => `formathandout-seed-${seed.key}-v${seed.seedVersion}`;

  // Built-in styles ship as auto-created "<Name>_css" handouts so built-in
  // and custom styles share one code path (list, parse, apply).
  const BUILTIN_STYLE_SEEDS = [
    {
      key: 'parchment',
      name: 'Parchment',
      seedVersion: 2, // bump only this when Parchment's css text changes
      css:
`container {
  background-image: url('https://i.imgur.com/vjL1blE.jpg');
  color: #3b2c1a;
  font-family: Georgia, 'Palatino Linotype', serif;
  padding: 12px;
  border: 1px solid #c9b183;
}

h1 { color: #5c3a21; font-size: 28px; text-align: center; border-bottom: 2px double #8a6a3f; padding-bottom: 6px; margin: 16px 0 10px 0; }
h2 { color: #5c3a21; font-size: 22px; border-bottom: 1px solid #8a6a3f; padding-bottom: 4px; margin: 16px 0 8px 0; }
h3 { color: #6b4a26; font-size: 19px; font-style: italic; margin: 14px 0 6px 0; }
h4 { color: #6b4a26; font-size: 16px; margin: 12px 0 4px 0; }
h5 { color: #6b4a26; font-size: 14px; margin: 10px 0 4px 0; }
h6 { color: #6b4a26; font-size: 13px; font-variant: small-caps; margin: 10px 0 4px 0; }
p { font-size: 15px; line-height: 1.6; margin: 6px 0; }
blockquote { border-left: 3px dashed #8a6a3f; background-color: #ece0c4; padding: 8px 14px; margin: 10px 0; font-style: italic; color: #4a3820; }
pre { background-color: #e9dcb9; color: #3b2c1a; padding: 8px 10px; border: 1px solid #c9b183; font-family: 'Courier New', monospace; font-size: 13px; }
ol { margin: 6px 0 6px 22px; }
ul { margin: 6px 0 6px 22px; }
li { font-size: 15px; line-height: 1.6; margin: 2px 0; }
strong { color: #5c3a21; }

table { width: 100%; border-collapse: collapse; font-family: Georgia, 'Palatino Linotype', serif; font-size: 14px; color: #3b2c1a; }
tr:first-child { background-color: #e4d5b3; font-weight: bold; border-bottom: 2px solid #8a6a3f; }
tr:nth-child(odd) { background-color: #f4ecd8; }
tr:nth-child(even) { background-color: #ece0c4; }
td { padding: 4px 8px; border: 1px solid #c9b183; text-align: left; }`
    },
    {
      key: 'dnd5e',
      name: '5e',
      seedVersion: 4, // bump only this when 5e's css text changes
      css:
`bg {
    background-image: url('https://i.imgur.com/vjL1blE.jpg');
    padding: 30px;
    padding-top: 1px;
    margin: 0px;
}
p {
    font-family: Georgia;
    font-size: 13px;
    margin-bottom: 0px;
    text-indent: 10px;
    color: #111;
}
p.first-of-type {
    font-family: Georgia;
    font-size: 13px !important;
    margin-bottom: 0px;
    text-indent: 0px!important;
}
ul {
    font-family: Georgia !important;
    font-size: 15px;
    list-style-position: inside;
    padding-left: 5px;
    margin-bottom: 0px;
    text-indent: -5px;
    color: #111;
}
li {
    font-family: Georgia !important;
    font-size: 15px;
    list-style-position: inside;
    margin-bottom: 0px;
    text-indent: -5px;
}
h1 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D !important;
    font-weight: bolder;
    font-variant: small-caps;
    text-transform: capitalize;
    font-size: 42px;
    margin-top: 20px;
    margin-bottom: 4px;
    padding-top: 40px;
    clear: both;
}
h2 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D!important;
    font-weight: bolder;
    font-variant: small-caps;
    text-transform: capitalize;
    line-height: 80%;
    margin-top: 10px;
    font-size: 28px;
}
h3 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D!important;
    font-weight: bolder;
    font-variant: small-caps;
    text-transform: capitalize;
    font-size: 24px;
    margin-top: 10px;
    margin-bottom: 2px;
    line-height: 80%;
    border-bottom: 2px solid #c9ad6a;
    clear: both;
}
h4 {
    font-family: 'mrs eaves', 'times new roman', times, baskerville, garamond;
    color: #58170D!important;
    font-variant: small-caps;
    text-transform: capitalize;
    font-size: 24px;
    margin-top: 10px;
    margin-bottom: 2px;
    line-height: 80%;
}
h5 {
    font-family: Verdana, sans-serif !important;
    color: black!important;
    font-variant: small-caps;
    font-size: 16px;
    margin-top: 10px;
    margin-bottom: 8px;
    line-height: 80%;
}
h6 {
    font-family: Verdana, sans-serif !important;
    color: black!important;
    font-variant: small-caps;
    font-style: italic;
    font-size: 14px;
    margin-top: 8px;
    margin-bottom: 6px;
    line-height: 80%;
}
pre {
    font-family: Verdana, sans-serif !important;
    text-align: left;
    float: right;
    margin-left: 6px;
    width: 40%;
    margin-top: 1em;
    margin-bottom: 1em;
    padding: 5px 10px;
    background-color: #e0e5c1;
    border-top: 2px solid;
    border-bottom: 2px solid;
    border-left: 0px solid;
    border-right: 0px solid;
    box-shadow: 1px 4px 14px #888;
    white-space: pre-wrap !important;
    overflow-wrap: break-word !important;
    word-break: normal !important;
}
blockquote {
    font-family: Verdana, sans-serif !important;
    text-align: left;
    margin-left: 15%;
    margin-right: 15%;
    margin-top: 1em;
    margin-bottom: 1em;
    padding: 5px 10px;
    background-color: #e0e5c1;
    border-top: 2px solid;
    border-bottom: 2px solid;
    border-left: 0px solid;
    border-right: 0px solid;
    box-shadow: 1px 4px 14px #888;
}
a:link {
    text-decoration: underline;
    color: #58170D;
}
table {
    width: 100%;
    border: none;
    border-spacing: 0;
    outline: none;
    color: #111;
}
tr {
    width: 100%;
    text-align: left;
    font-family: Verdana, sans-serif;
    font-size: 13px;
    border: 0px solid #ffffff;
}
tr:first-child {
    font-weight: bold;
    background: transparent;
}
tr:nth-child(even) {
    background: transparent;
}
tr:nth-child(odd) {
    background: #E0E5C1;
}
td {
    padding-top: 2px;
    padding-bottom: 2px;
    border: none;
    outline: none;
    text-align: left;
}`
    },
    {
      key: 'book',
      name: 'Book',
      seedVersion: 2, // bump only this when Book's css text changes
      css:
`container {
  background-image: url('https://files.d20.io/images/499387644/qnbekevImRbYAxPEmk1E1A/original.webp?1788122543');
  color: #3a2b18;
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  padding: 20px 26px;
  border: 4px double #5b3d22;
  box-shadow: 0 0 16px rgba(0,0,0,0.35);
}

h1 {
  font-family: 'Della Respira', Georgia, serif;
  color: #4a2f1c;
  font-size: 30px;
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 3px;
  border-bottom: 2px double #8a6a3f;
  padding-bottom: 10px;
  margin: 8px 0 14px 0;
}

h2 {
  font-family: 'Della Respira', Georgia, serif;
  color: #4a2f1c;
  font-size: 22px;
  text-align: center;
  letter-spacing: 1px;
  margin: 16px 0 8px 0;
}

h3, h4, h5, h6 {
  font-family: 'Merriweather', Georgia, serif;
  font-style: italic;
  color: #5b3d22;
  font-size: 16px;
  margin: 12px 0 5px 0;
}

p {
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.7;
  text-indent: 24px;
  margin: 2px 0;
  text-align: justify;
}

p.first-of-type {
  text-indent: 0px !important;
}

blockquote {
  font-family: 'Crimson Text', Georgia, serif;
  font-style: italic;
  font-size: 30px!important;
  line-height:1.4;
  color: #5b3d22;
  border-left: 3px solid #8a6a3f;
  border-right: 3px solid #8a6a3f;
  padding: 8px 16px;
  margin: 30px 8%;
}

pre, code {
  font-family: 'IM Fell DW Pica', Georgia, serif;
  background-color: rgba(0,0,0,0.12);
  color: #3a2b18;
  border: 1px solid #8a6a3f;
  padding: 6px 10px;
  font-size: 14px;
}

ol, ul { margin: 6px 0 6px 30px; }
li {
  font-family: 'Crimson Text', Georgia, 'Times New Roman', serif;
  font-size: 16px;
  line-height: 1.6;
}

strong { color: #4a2f1c; }
em { color: #5b3d22; }
s { color: #9c8a68; }

a { color: #6e4326; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Crimson Text', Georgia, serif;
  font-size: 15px;
  color: #3a2b18;
}
tr:first-child { background-color: rgba(0,0,0,0.12); font-weight: bold; border-bottom: 2px double #8a6a3f; }
tr:nth-child(odd) { background-color: rgba(0,0,0,0.05); }
tr:nth-child(even) { background-color: transparent; }
td, th {
  font-family: 'Crimson Text', Georgia, serif;
  padding: 5px 9px;
  border: 1px solid #8a6a3f;
  text-align: left;
}`
    },
    {
      key: 'computer',
      name: 'Computer',
      seedVersion: 1,
      css:
`container {
  background-color: #0a0f0a;
  background-image: repeating-linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 2px, transparent 3px);
  color: #33ff66;
  font-family: 'Lucida Console', 'Courier New', monospace;
  padding: 16px 18px;
  border: 2px solid #1f5c33;
  box-shadow: 0 0 18px rgba(51,255,102,0.25);
}

h1 {
  font-family: 'Contrail One', 'Lucida Console', monospace;
  color: #9dffb8;
  font-size: 24px;
  text-transform: uppercase;
  letter-spacing: 3px;
  border-bottom: 1px solid #1f5c33;
  padding-bottom: 6px;
  margin: 4px 0 10px 0;
}

h2 {
  font-family: 'Contrail One', 'Lucida Console', monospace;
  color: #9dffb8;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 10px 0 6px 0;
}

h3, h4, h5, h6 {
  font-family: 'Lucida Console', 'Courier New', monospace;
  color: #9dffb8;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 8px 0 4px 0;
}

p {
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
  margin: 6px 0;
}

blockquote {
  font-family: 'Lucida Console', 'Courier New', monospace;
  color: #ffcf5c;
  background-color: #1a1206;
  border-left: 3px solid #ffcf5c;
  padding: 6px 10px;
  margin: 10px 0;
  font-size: 13px;
}

pre, code {
  font-family: 'Lucida Console', 'Courier New', monospace;
  background-color: #001a08;
  color: #33ff66;
  border: 1px solid #1f5c33;
  padding: 8px 10px;
  font-size: 13px;
  line-height: 1.5;
}

ol, ul { margin: 6px 0 6px 26px; }
li {
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 14px;
  line-height: 1.6;
}

strong { color: #9dffb8; }
em { color: #74e896; }
s { color: #4a7a5a; }

a { color: #6cf0ff; text-decoration: underline; }

table {
  width: 100%;
  border-collapse: collapse;
  font-family: 'Lucida Console', 'Courier New', monospace;
  font-size: 13px;
  color: #33ff66;
}
tr:first-child { background-color: #123c1e; color: #9dffb8; font-weight: bold; }
tr:nth-child(odd) { background-color: #0a0f0a; }
tr:nth-child(even) { background-color: #0f180f; }
td, th {
  font-family: 'Lucida Console', 'Courier New', monospace;
  padding: 4px 8px;
  border: 1px solid #1f5c33;
  text-align: left;
}`
    }
  ];

  // CSS (Centralized Styles -- the tool's own panel chrome,
  // NOT the target-handout skins parsed from "<Name>_css" handouts)

  const Gray = {
    headerBg: '#2a2a2a',
    headerText: '#e4e4e4',
    columnBg: '#828282',
    panelBg: '#9e9e9e',
    controlBg: '#c8c8c8',
    border: '#767676',
    text: '#000000',
    textDisabled: '#8a8a8a',
    disabledBg: '#b5b5b5',
    disabledBorder: '#a0a0a0'
  };

  const CSS = {
    wrapper: `border:1px solid ${Gray.border}; border-radius:4px; overflow:hidden; font-family:Arial,sans-serif;`,
    header: `background-color:${Gray.headerBg}; color:${Gray.headerText}; padding:6px 10px;`,
    headerTable: 'width:100%; border-collapse:collapse; border-spacing:0; border:0; margin:0;',
    headerLeft: 'text-align:left; vertical-align:middle; border:0;',
    headerRight: 'text-align:right; vertical-align:middle; border:0;',
    title: 'font-size:18px; font-weight:bold; margin:0;',
    layoutTable: 'width:100%; table-layout:fixed; border-collapse:collapse; border-spacing:0; border:0; margin:0;',
    listCell: `width:224px; max-width:224px; vertical-align:top; background-color:${Gray.columnBg}; border:0; border-right:1px solid ${Gray.border}; padding:6px; color:${Gray.text};`,
    // Transparent on purpose -- see the Gray comment above.
    previewCell: 'vertical-align:top; padding:8px; border:0;',
    handoutRowWrap: 'margin:2px 0; white-space:nowrap;',
    handoutLink: `display:inline-block; width:172px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:middle; padding:4px 6px; line-height:16px; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; border:1px solid ${Gray.border}; border-right:none; border-radius:3px 0 0 3px; font-size:12px;`,
    handoutLinkActive: 'display:inline-block; width:172px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; vertical-align:middle; padding:4px 6px; line-height:16px; color:#fff; text-decoration:none; background-color:#822000; border:1px solid #822000; border-right:none; border-radius:3px 0 0 3px; font-size:12px; font-weight:bold;',
    openBtn: `display:inline-block; width:20px; text-align:center; vertical-align:middle; padding:4px 0; line-height:16px; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; border:1px solid ${Gray.border}; border-radius:0 3px 3px 0; font-size:12px;`,
    button: `display:inline-block; padding:3px 8px; margin:2px 3px 2px 0; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; border:1px solid ${Gray.border}; border-radius:3px; font-size:12px;`,
    buttonActive: 'display:inline-block; padding:3px 8px; margin:2px 3px 2px 0; color:#fff; text-decoration:none; background-color:#822000; border:1px solid #822000; border-radius:3px; font-size:12px; font-weight:bold;',
    buttonPrimary: 'display:inline-block; padding:4px 10px; margin:0 4px 0 0; vertical-align:middle; color:#fff; text-decoration:none; background-color:#2e7d32; border:1px solid #1b5e20; border-radius:3px; font-size:13px; font-weight:bold;',
    buttonDanger: 'display:inline-block; padding:4px 10px; margin:0 4px 0 0; vertical-align:middle; color:#fff; text-decoration:none; background-color:#b71c1c; border:1px solid #7f0000; border-radius:3px; font-size:13px; font-weight:bold;',
    buttonWarning: 'display:inline-block; padding:3px 6px; margin:2px 0 2px 2px; color:#fff; text-decoration:none; background-color:#b8860b; border:1px solid #7a5a06; border-radius:3px; font-size:11px;',
    buttonWarningLg: 'display:inline-block; padding:4px 10px; margin:0 4px 0 0; vertical-align:middle; color:#fff; text-decoration:none; background-color:#b8860b; border:1px solid #7a5a06; border-radius:3px; font-size:13px; font-weight:bold;',
    buttonNeutralLg: `display:inline-block; padding:4px 10px; margin:0 4px 0 0; vertical-align:middle; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; border:1px solid ${Gray.border}; border-radius:3px; font-size:13px; font-weight:bold;`,
    buttonActiveLg: 'display:inline-block; padding:4px 10px; margin:0 4px 0 0; vertical-align:middle; color:#fff; text-decoration:none; background-color:#822000; border:1px solid #822000; border-radius:3px; font-size:13px; font-weight:bold;',
    toolbarBtn: `display:inline-block; vertical-align:middle; padding:2px 5px; margin:0 3px 2px 0; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; border:1px solid ${Gray.border}; border-radius:2px; font-size:10px;`,
    toolbarBtnActive: 'display:inline-block; vertical-align:middle; padding:2px 5px; margin:0 3px 2px 0; color:#fff; text-decoration:none; background-color:#822000; border:1px solid #822000; border-radius:2px; font-size:10px; font-weight:bold;',
    accordionWrap: `border:1px solid ${Gray.border}; border-radius:3px; overflow:hidden; margin:6px 0;`,
    accordionHeader: `display:block; padding:3px 4px; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; font-size:11px; text-transform:uppercase; font-weight:bold;`,
    accordionBody: `background-color:${Gray.panelBg}; border-top:1px solid ${Gray.border}; padding:4px 4px 2px 4px;`,
    letterStripWrap: 'margin:2px 0 6px 0; line-height:16px;',
    letterBtn: `display:inline-block; width:11px; text-align:center; padding:1px 0; margin:0 1.4px 2px 0; font-size:10px; line-height:14px; border:1px solid ${Gray.border}; border-radius:2px; background-color:${Gray.controlBg}; color:${Gray.text}; text-decoration:none;`,
    letterBtnActive: 'display:inline-block; width:11px; text-align:center; padding:1px 0; margin:0 1.4px 2px 0; font-size:10px; line-height:14px; border:1px solid #822000; border-radius:2px; background-color:#822000; color:#fff; text-decoration:none; font-weight:bold;',
    letterBtnDisabled: `display:inline-block; width:11px; text-align:center; padding:1px 0; margin:0 1.4px 2px 0; font-size:10px; line-height:14px; border:1px solid ${Gray.disabledBorder}; border-radius:2px; background-color:${Gray.disabledBg}; color:${Gray.textDisabled};`,
    searchBtn: `display:inline-block; width:11px; text-align:center; padding:1px 0; margin:0 1.4px 2px 0; font-size:10px; line-height:14px; border:1px solid ${Gray.border}; border-radius:2px; background-color:${Gray.controlBg}; color:${Gray.text}; text-decoration:none;`,
    sectionLabel: 'font-size:11px; text-transform:uppercase; color:#000000; margin:8px 0 3px 0; font-weight:bold;',
    sectionLabelInline: 'display:inline-block; vertical-align:middle; font-size:11px; text-transform:uppercase; color:#000000; margin:8px 4px 3px 0; font-weight:bold;',
    previewControlsBox: `background-color:${Gray.columnBg}; border:1px solid ${Gray.border}; border-radius:4px; padding:6px; margin-bottom:8px; color:${Gray.text};`,
    confirmBanner: 'background-color:#fff3cd; border:1px solid #b8860b; border-radius:4px; padding:8px 10px; margin-bottom:8px; color:#5c4400;',
    confirmBannerText: 'font-size:12px; margin-bottom:6px;',
    previewBox: 'border:1px solid #ccc; border-radius:3px; min-height:120px; padding:8px; margin-top:4px;',
    emptyState: 'color:#000000; font-style:italic; padding:20px; text-align:center;',
    sourceBox: 'background-color:#1e1e1e; color:#d4d4d4; font-family:monospace; font-size:11px; white-space:pre-wrap; padding:8px; border-radius:3px; margin-top:4px;',

    helpBtn: `display:inline-block; vertical-align:middle; width:16px; height:16px; text-align:center; line-height:16px; margin-left:6px; color:${Gray.text}; text-decoration:none; background-color:${Gray.controlBg}; border:1px solid ${Gray.border}; border-radius:50%; font-size:11px; font-weight:bold;`,

    whisperCard: `display:block; max-width:280px; font-family:Arial,sans-serif; background-color:${Gray.panelBg}; border:1px solid ${Gray.border}; border-radius:4px; padding:10px; color:${Gray.text};`,
    whisperTitle: `font-size:14px; font-weight:bold; margin-bottom:8px; color:${Gray.text};`,
    whisperBtn: 'display:inline-block; padding:6px 12px; color:#fff; text-decoration:none; background-color:#822000; border:1px solid #822000; border-radius:3px; font-size:13px; font-weight:bold;'
  };

  // Logger

  const Logger = {
    log: (msg) => log(`${PROGRAM_NAME} | ${msg}`),
    debug: (msg) => {
      if (DEBUG) log(`${PROGRAM_NAME} [DEBUG] | ${msg}`);
    },
    error: (msg) => log(`${PROGRAM_NAME} [ERROR] | ${msg}`)
  };

  // State Management

  const State = {

    initialize: () => {
      if (!state[STATE_KEY] || state[STATE_KEY].version !== SCHEMA_VERSION) {

        Logger.log(`Updating Schema to v${SCHEMA_VERSION}`);

        switch (state[STATE_KEY] && state[STATE_KEY].version) {

          case 0.0:
            /* falls through */

          default:
            state[STATE_KEY] = {
              version: SCHEMA_VERSION,
              config: { panelHandoutId: null },
              ui: {}
            };
            break;
        }
      }
      // backfill any missing top-level keys on every load, not just on a
      // schema bump, so new fields added later don't crash old installs
      const s = state[STATE_KEY];
      if (!s.config) s.config = { panelHandoutId: null };
      if (!('panelHandoutId' in s.config)) s.config.panelHandoutId = null;
      if (!s.ui) s.ui = {};
    },

    get: () => state[STATE_KEY],

    uiFor: (playerid) => {
      const s = state[STATE_KEY];
      if (!s.ui[playerid]) {
        s.ui[playerid] = {
          selectedHandoutId: null,
          selectedField: 'notes',
          selectedStyleName: null,
          showSource: false,
          listFilter: 'all',
          nameFilterQuery: '',
          recentIds: [], // most-recently-selected handout ids, newest first, capped at 5
          recentCollapsed: false,
          listCollapsed: false,
          editMode: false,
          confirmSanitize: false
        };
      }
      // backfill for a player UI object created by an older load
      const u = s.ui[playerid];
      if (!u.listFilter) u.listFilter = 'all';
      if (u.nameFilterQuery === undefined) u.nameFilterQuery = '';
      if (!u.recentIds) u.recentIds = [];
      if (u.recentCollapsed === undefined) u.recentCollapsed = false;
      if (u.listCollapsed === undefined) u.listCollapsed = false;
      if (u.editMode === undefined) u.editMode = false;
      if (u.confirmSanitize === undefined) u.confirmSanitize = false;
      return s.ui[playerid];
    }

  };

  const Parser = {

    parse: (content) => {
      const tokens = content.trim().split(/\s+/);
      const command = tokens.shift();

      const args = {};
      let currentKey = null;

      tokens.forEach(token => {

        if (token.startsWith('--')) {
          currentKey = token.replace(/^--/, '');
          args[currentKey] = true;
          return;
        }

        if (currentKey) {
          if (token.includes('|')) {
            const [k, ...rest] = token.split('|');
            args[currentKey] = rest.join('|') || k;
          } else {
            if (args[currentKey] === true) {
              args[currentKey] = token;
            } else {
              args[currentKey] += ` ${token}`;
            }
          }
        }

      });

      return { command, args };
    }

  };

  const VOID_TAGS = ['br', 'img', 'hr', 'col', 'wbr', 'source', 'track', 'area', 'base', 'embed', 'param', 'input'];
  const ALLOWED_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'code',
    'ol', 'ul', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sup', 'sub',
    'span', 'br', 'a', 'img', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'td', 'th'];

  const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9:]*)((?:\s+[a-zA-Z:_-][a-zA-Z0-9:_.-]*(?:\s*=\s*(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s"'=<>`]+))?)*)\s*(\/?)\s*>/g;
  const ATTR_RE = /([a-zA-Z:_-][a-zA-Z0-9:_.-]*)\s*=\s*("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|[^\s"'=<>`]+)/g;

  const HtmlUtil = {

    decodeEntities: (str) => {
      let prev = String(str == null ? '' : str);
      for (let i = 0; i < 10; i++) { // safety cap -- real content never nests this deep
        const next = prev
          .replace(/&amp;/gi, '&')
          .replace(/&lt;/gi, '<')
          .replace(/&gt;/gi, '>')
          .replace(/&quot;/gi, '"')
          .replace(/&#0*39;/gi, '\'')
          .replace(/&apos;/gi, '\'');
        if (next === prev) return next;
        prev = next;
      }
      return prev;
    },

    escapeHtml: (str) => HtmlUtil.decodeEntities(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;'),

    escapeAttr: (str) => HtmlUtil.decodeEntities(str)
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;'),

    htmlToPlainText: (html) => String(html || '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/gi, '&')
      .replace(/&lt;/gi, '<')
      .replace(/&gt;/gi, '>')
      .replace(/&quot;/gi, '"')
      .replace(/&#39;/gi, '\''),

    tokenize: (html) => {
      const tokens = [];
      let lastIndex = 0, m;
      TAG_RE.lastIndex = 0;
      while ((m = TAG_RE.exec(html))) {
        if (m.index > lastIndex) tokens.push({ type: 'text', value: html.slice(lastIndex, m.index) });
        const closing = m[1] === '/';
        const name = m[2].toLowerCase();
        const attrPart = m[3] || '';
        const selfClose = m[4] === '/';
        let type = closing ? 'close' : (selfClose ? 'self' : 'open');
        if (!closing && VOID_TAGS.includes(name)) type = 'self';
        tokens.push({ type, name, attrPart });
        lastIndex = TAG_RE.lastIndex;
      }
      if (lastIndex < html.length) tokens.push({ type: 'text', value: html.slice(lastIndex) });
      return tokens;
    },

    parseAttrs: (attrPart) => {
      const attrs = {};
      let am;
      ATTR_RE.lastIndex = 0;
      while ((am = ATTR_RE.exec(attrPart))) {
        let val = am[2];
        if ((val[0] === '"' && val[val.length - 1] === '"') || (val[0] === '\'' && val[val.length - 1] === '\'')) {
          val = val.slice(1, -1);
        }
        attrs[am[1].toLowerCase()] = val;
      }
      return attrs;
    },

    buildOpenTag: (name, attrs) => {
      const keys = Object.keys(attrs || {});
      const parts = keys.map(k => `${k}="${HtmlUtil.escapeAttr(attrs[k])}"`);
      return `<${name}${parts.length ? ' ' + parts.join(' ') : ''}>`;
    },

    parseStyleDeclarations: (styleStr) => {
      const result = {};
      (styleStr || '').split(';').forEach(decl => {
        const idx = decl.indexOf(':');
        if (idx === -1) return;
        const prop = decl.slice(0, idx).trim().toLowerCase();
        const val = decl.slice(idx + 1).trim();
        if (prop && val) result[prop] = val;
      });
      return result;
    },

    serializeStyleDeclarations: (obj) => Object.keys(obj || {})
      .map(k => `${k}: ${obj[k]}`)
      .join('; ')

  };

  const CssParser = {

    parse: (cssText) => {
      const rules = {};
      if (!cssText) return rules;

      const noComments = cssText.replace(/\/\*[\s\S]*?\*\//g, '');
      const ruleRe = /([^{}]+)\{([^{}]*)\}/g;
      let m;
      while ((m = ruleRe.exec(noComments))) {
        const selectorsPart = m[1].trim();
        const declsPart = m[2].trim();
        if (!selectorsPart) continue;

        const decls = {};
        declsPart.split(';').forEach(pair => {
          const idx = pair.indexOf(':');
          if (idx === -1) return;
          const prop = pair.slice(0, idx).trim().toLowerCase();
          const val = pair.slice(idx + 1).trim();
          if (prop && val) decls[prop] = val;
        });
        if (!Object.keys(decls).length) continue;

        selectorsPart.split(',').forEach(sel => {
          const selName = sel.trim().toLowerCase().replace(/^a:(link|visited|hover|active|focus)$/, 'a');
          if (!selName) return;
          rules[selName] = Object.assign(rules[selName] || {}, decls);
        });
      }

      return rules;
    }

  };

  const STYLE_WHITELIST = {
    p: ['text-align', 'margin-left'],
    span: ['color', 'background-color']
  };

  const NOOP_TRANSPARENT_BG = /rgba?\(\s*0\s*,\s*0\s*,\s*0\s*,\s*0\s*\)/i;

  const CLEANER_BLOCK_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'table', 'blockquote', 'pre'];

  const QUOTE_LIKE_CONTAINERS = ['blockquote', 'pre'];

  const STRIP_IF_EMPTY_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'ul', 'ol', 'blockquote'];

  const filterStyleForTag = (tagName, styleValue) => {
    const allowed = STYLE_WHITELIST[tagName];
    if (!allowed || !styleValue) return '';
    const kept = [];
    styleValue.split(';').forEach(decl => {
      const idx = decl.indexOf(':');
      if (idx === -1) return;
      const prop = decl.slice(0, idx).trim().toLowerCase();
      const val = decl.slice(idx + 1).trim();
      if (!val || allowed.indexOf(prop) === -1) return;
      if (prop === 'background-color' && NOOP_TRANSPARENT_BG.test(val)) return; // Roll20's own "no highlight" artifact
      kept.push(`${prop}: ${val}`);
    });
    return kept.join('; ');
  };

  const Cleaner = {

    clean: (rawHtml) => {
      if (!rawHtml) return '';
      let html = String(rawHtml);

      // Strip comments (also covers Word's conditional comments) and any
      // opaque blocks that shouldn't be unwrapped into visible text.
      html = html.replace(/<!--[\s\S]*?-->/g, '');
      html = html.replace(/<(script|style|head|meta|link|xml)\b[^>]*>[\s\S]*?<\/\1>/gi, '');
      html = html.replace(/<(meta|link)\b[^>]*\/?>/gi, '');

      const tokens = HtmlUtil.tokenize(html);
      const stack = [];
      let out = '';

      const closeOpenHeadings = () => {
        while (stack.length && /^h[1-6]$/.test(stack[stack.length - 1].name)) {
          const top = stack.pop();
          if (top.keep) out += `</${top.name}>`;
        }
      };

      const closeSyntheticParaIfOpen = () => {
        const top = stack[stack.length - 1];
        if (top && top.openP) {
          out += '</p>';
          top.openP = false;
        }
      };

      tokens.forEach(tok => {
        if (tok.type === 'text') {
          const textTop = stack[stack.length - 1];
          if (textTop && QUOTE_LIKE_CONTAINERS.indexOf(textTop.name) !== -1 && !textTop.openP && /\S/.test(tok.value)) {
            out += '<p>';
            textTop.openP = true;
          }
          out += tok.value;
          return;
        }

        if (tok.type === 'close') {
          let matchIdx = -1;
          for (let i = stack.length - 1; i >= 0; i--) {
            if (stack[i].name === tok.name) { matchIdx = i; break; }
          }
          if (matchIdx === -1) return; // stray close tag, nothing to match -- ignore
          while (stack.length > matchIdx) {
            const top = stack.pop();
            if (QUOTE_LIKE_CONTAINERS.indexOf(top.name) !== -1 && top.openP) { out += '</p>'; top.openP = false; }
            if (top.keep) out += `</${top.name}>`;
          }
          return;
        }

        const name = tok.name;

        if (CLEANER_BLOCK_TAGS.indexOf(name) !== -1) {
          closeOpenHeadings();
          closeSyntheticParaIfOpen();
        } else {
          const openTop = stack[stack.length - 1];
          if (openTop && QUOTE_LIKE_CONTAINERS.indexOf(openTop.name) !== -1 && !openTop.openP) {
            out += '<p>';
            openTop.openP = true;
          }
        }

        if (ALLOWED_TAGS.indexOf(name) === -1) {
          if (tok.type === 'open') stack.push({ name, keep: false });
          return;
        }

        const rawAttrs = HtmlUtil.parseAttrs(tok.attrPart);

        if (name === 'img') {
          out += HtmlUtil.buildOpenTag(name, rawAttrs);
          return; // img is a void element (VOID_TAGS) -- always self-closing, never pushed onto the stack
        }

        const finalAttrs = {};

        if (rawAttrs.style) {
          const filtered = filterStyleForTag(name, rawAttrs.style);
          if (filtered) finalAttrs.style = filtered;
        }
        if (name === 'a' && rawAttrs.href) finalAttrs.href = rawAttrs.href;
        if (name === 'td' || name === 'th') {
          ['colspan', 'rowspan'].forEach(a => { if (rawAttrs[a]) finalAttrs[a] = rawAttrs[a]; });
        }

        const keep = !(name === 'span' && Object.keys(finalAttrs).length === 0);

        if (tok.type === 'self') {
          if (keep) out += HtmlUtil.buildOpenTag(name, finalAttrs);
          return;
        }

        if (keep) out += HtmlUtil.buildOpenTag(name, finalAttrs);
        stack.push({ name, keep, openP: false }); // openP only ever meaningful on a blockquote frame

      });

      let result = out;
      STRIP_IF_EMPTY_TAGS.forEach(tag => {
        result = result.replace(new RegExp(`<${tag}>\\s*</${tag}>`, 'g'), '');
      });

      return result.replace(/[ \t]{3,}/g, '  ').trim();
    },

    stripSpanTags: (html) => {
      const str = String(html || '');
      let out = '';
      let lastIndex = 0;
      let m;
      TAG_RE.lastIndex = 0;
      while ((m = TAG_RE.exec(str))) {
        if (m[2].toLowerCase() !== 'span') continue;
        out += str.slice(lastIndex, m.index);
        lastIndex = TAG_RE.lastIndex;
      }
      out += str.slice(lastIndex);
      return out;
    },

    hasSpanTags: (html) => /<span[\s/>]/i.test(String(html || ''))

  };

  const STYLED_TAGS = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'blockquote', 'pre', 'code',
    'ol', 'ul', 'li', 'strong', 'b', 'em', 'i', 'u', 's', 'strike', 'sup', 'sub', 'a'];
  const STYLE_RULE_ALIASES = { b: 'strong', i: 'em', strike: 's' };
  const CONTAINER_ALIASES = ['container', 'body', 'bg'];
  // Block tags that end a "just came from a heading" run, for the
  // p.first-of-type rule below.
  const NON_HEADING_BLOCK_TAGS = ['p', 'ul', 'ol', 'li', 'blockquote', 'pre', 'table'];

  const lookupStyleRule = (styleRules, name) => {
    if (styleRules[name]) return styleRules[name];
    const alias = STYLE_RULE_ALIASES[name];
    if (alias && styleRules[alias]) return styleRules[alias];
    return null;
  };

  const CONTAINER_TEXT_PROPS = ['color', 'font', 'font-family', 'font-size', 'font-style',
    'font-weight', 'font-variant', 'line-height', 'letter-spacing', 'word-spacing',
    'text-align', 'text-transform', 'text-shadow', 'text-decoration'];

  const containerTextProps = (rule) => {
    if (!rule) return null;
    const out = {};
    CONTAINER_TEXT_PROPS.forEach(prop => { if (rule[prop] !== undefined) out[prop] = rule[prop]; });
    return Object.keys(out).length ? out : null;
  };

  const resolveContainerRule = (styleRules) => {
    for (let i = 0; i < CONTAINER_ALIASES.length; i++) {
      if (styleRules[CONTAINER_ALIASES[i]]) return styleRules[CONTAINER_ALIASES[i]];
    }
    return null;
  };

  const mergeStyleAttrs = (rawAttrs, rule) => {
    const existing = HtmlUtil.parseStyleDeclarations(rawAttrs.style || '');
    const merged = Object.assign({}, rule, existing); // element's own props win
    return Object.assign({}, rawAttrs, { style: HtmlUtil.serializeStyleDeclarations(merged) });
  };

  const emitOpenTag = (name, rawAttrs, rule) => rule
    ? HtmlUtil.buildOpenTag(name, mergeStyleAttrs(rawAttrs, rule))
    : HtmlUtil.buildOpenTag(name, rawAttrs);

  const resolveRowRule = (styleRules, rowIndex) => {
    let rule = styleRules.tr ? Object.assign({}, styleRules.tr) : null;
    if (rowIndex === 0 && styleRules['tr:first-child']) {
      return Object.assign({}, rule || {}, styleRules['tr:first-child']);
    }
    const position = rowIndex + 1; // CSS nth-child is 1-based
    const parityKey = position % 2 === 0 ? 'tr:nth-child(even)' : 'tr:nth-child(odd)';
    if (styleRules[parityKey]) {
      return Object.assign({}, rule || {}, styleRules[parityKey]);
    }
    return rule;
  };

  const Styler = {

    applyStyle: (cleanHtml, styleRules) => {
      if (!styleRules) return cleanHtml;
      const tokens = HtmlUtil.tokenize(cleanHtml);
      let out = '';
      let afterHeading = true;
      const tableStack = [];
      const containerRuleStack = [];

      tokens.forEach(tok => {
        if (tok.type === 'text') { out += tok.value; return; }

        if (tok.type === 'close') {
          if (tok.name === 'table') tableStack.pop();
          if (QUOTE_LIKE_CONTAINERS.indexOf(tok.name) !== -1 && containerRuleStack.length) containerRuleStack.pop();
          out += `</${tok.name}>`;
          return;
        }

        const name = tok.name;
        const rawAttrs = HtmlUtil.parseAttrs(tok.attrPart);

        // ---- table-aware handling ----
        if (name === 'table') {
          tableStack.push({ rowIndex: 0 });
          afterHeading = false;
          out += emitOpenTag(name, rawAttrs, styleRules.table || null);
          return;
        }
        if (QUOTE_LIKE_CONTAINERS.indexOf(name) !== -1) {
          const containerRule = lookupStyleRule(styleRules, name);
          afterHeading = false;
          out += emitOpenTag(name, rawAttrs, containerRule); // the container element itself still gets the FULL rule, border/padding/margin included
          if (tok.type === 'open') containerRuleStack.push(containerTextProps(containerRule)); // its inner <p> gets only the text-formatting subset -- see CONTAINER_TEXT_PROPS
          return;
        }
        if (name === 'tr' && tableStack.length) {
          const ctx = tableStack[tableStack.length - 1];
          const rule = resolveRowRule(styleRules, ctx.rowIndex);
          ctx.rowIndex++;
          out += emitOpenTag(name, rawAttrs, rule);
          return;
        }
        if ((name === 'td' || name === 'th') && tableStack.length) {
          const rule = (name === 'th' && styleRules.th) ? styleRules.th : (styleRules.td || null);
          out += emitOpenTag(name, rawAttrs, rule);
          return;
        }

        let rule = STYLED_TAGS.indexOf(name) !== -1 ? lookupStyleRule(styleRules, name) : null;

        if (name === 'p') {
          if (containerRuleStack.length) {
            rule = containerRuleStack[containerRuleStack.length - 1];
          } else if (afterHeading && styleRules['p.first-of-type']) {
            rule = Object.assign({}, rule || {}, styleRules['p.first-of-type']);
          }
          afterHeading = false;
        } else if (/^h[1-6]$/.test(name)) {
          afterHeading = true;
        } else if (NON_HEADING_BLOCK_TAGS.indexOf(name) !== -1) {
          afterHeading = false;
        }

        out += emitOpenTag(name, rawAttrs, rule);
      });

      const containerRule = resolveContainerRule(styleRules);
      if (containerRule) {
        out = `<div style="${HtmlUtil.escapeAttr(HtmlUtil.serializeStyleDeclarations(containerRule))}">${out}</div>`;
      }
      return out;
    }

  };

  const getHandoutField = (handout, field) => new Promise((resolve) => {
    if (!handout) { resolve(''); return; }
    let done = false;
    const timer = setTimeout(() => {
      if (done) return;
      done = true;
      Logger.debug(`getHandoutField timed out for "${handout.get('name')}" [${field}]`);
      resolve('');
    }, 3000);
    try {
      handout.get(field, (val) => {
        if (done) return;
        done = true;
        clearTimeout(timer);
        resolve(val || '');
      });
    } catch (e) {
      if (!done) { done = true; clearTimeout(timer); resolve(''); }
    }
  });

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const TOUCH_MARKER = '​';

  const setHandoutFieldSafe = (handout, field, value) => {
    handout.set(field, value);
    if (field !== 'gmnotes') return Promise.resolve();
    return getHandoutField(handout, 'notes').then(currentNotes => {
      const marked = currentNotes + TOUCH_MARKER;
      handout.set('notes', marked);
      return delay(150)
        .then(() => getHandoutField(handout, 'notes'))
        .then(stillMarked => {
          if (stillMarked === marked) handout.set('notes', currentNotes);
        });
    });
  };

  const computeStyledContent = (rawContent, rawStyleCss) => {
    const cleanHtml = Cleaner.clean(rawContent);
    const styleRules = rawStyleCss ? CssParser.parse(HtmlUtil.htmlToPlainText(rawStyleCss)) : null;
    const styledHtml = styleRules ? Styler.applyStyle(cleanHtml, styleRules) : cleanHtml;
    return { rawContent, cleanHtml, styledHtml };
  };

  // HandoutUtils

  const HandoutUtils = {

    isStyleHandoutName: (name) => /_css$/i.test(String(name || '').trim()),
    styleNameFromHandoutName: (name) => String(name).replace(/_css$/i, '').trim(),

    getTags: (h) => {
      try { return JSON.parse(h.get('tags') || '[]') || []; } catch (e) { return []; }
    },

    setTagsRaw: (h, tags) => {
      try { h.set('tags', JSON.stringify(tags)); } catch (e) { /* ignore */ }
    },

    getBoundStyleName: (h, field) => {
      const prefix = bindingTagPrefix(field);
      const hit = HandoutUtils.getTags(h).find(t => typeof t === 'string' && t.indexOf(prefix) === 0);
      return hit ? hit.slice(prefix.length) : null;
    },

    setBindingTag: (h, field, styleName) => {
      const prefix = bindingTagPrefix(field);
      const tags = HandoutUtils.getTags(h).filter(t => !(typeof t === 'string' && t.indexOf(prefix) === 0));
      tags.push(`${prefix}${styleName}`);
      HandoutUtils.setTagsRaw(h, tags);
    },

    // Called on Remove Styling, and on Apply when the style picked was
    // "(none)" -- same "other tags untouched" guarantee as setBindingTag.
    clearBindingTag: (h, field) => {
      const prefix = bindingTagPrefix(field);
      const tags = HandoutUtils.getTags(h).filter(t => !(typeof t === 'string' && t.indexOf(prefix) === 0));
      HandoutUtils.setTagsRaw(h, tags);
    },

    getPanelHandout: () => {
      const s = State.get();
      let h = s.config.panelHandoutId && getObj('handout', s.config.panelHandoutId);
      if (!h) h = findObjs({ type: 'handout', name: PANEL_NAME })[0];
      if (!h) {
        h = createObj('handout', { name: PANEL_NAME, archived: false });
        Logger.log(`Created panel handout "${PANEL_NAME}"`);
      }
      if (s.config.panelHandoutId !== h.id) s.config.panelHandoutId = h.id;
      return h;
    },

    isUtilityHandoutName: (name) => name === EXPORT_HANDOUT_NAME || name === IMPORT_HANDOUT_NAME || name === HELP_HANDOUT_NAME,

    findOrCreateUtilityHandout: (name) => {
      let h = findObjs({ type: 'handout', name })[0];
      if (!h) {
        h = createObj('handout', { name, archived: false });
        Logger.log(`Created utility handout "${name}"`);
      }
      return h;
    },

    getHelpHandout: () => HandoutUtils.findOrCreateUtilityHandout(HELP_HANDOUT_NAME),

    refreshHelpHandout: () => {
      const h = HandoutUtils.getHelpHandout();
      h.set('notes', buildHelpHtml());
      return h;
    },

    getAllTargetHandouts: () => {
      const panel = HandoutUtils.getPanelHandout();
      return findObjs({ type: 'handout' })
        .filter(h => h.id !== panel.id
          && !HandoutUtils.isStyleHandoutName(h.get('name'))
          && !HandoutUtils.isUtilityHandoutName(h.get('name')))
        .map(h => ({
          id: h.id,
          name: h.get('name'),
          boundNotes: HandoutUtils.getBoundStyleName(h, 'notes'),
          boundGmnotes: HandoutUtils.getBoundStyleName(h, 'gmnotes')
        }))
        .sort((a, b) => a.name.localeCompare(b.name));
    },

    getAllStyleHandouts: () => findObjs({ type: 'handout' })
      .filter(h => HandoutUtils.isStyleHandoutName(h.get('name')))
      .map(h => {
        let tags = [];
        try { tags = JSON.parse(h.get('tags') || '[]') || []; } catch (e) { /* ignore */ }
        const builtin = tags.indexOf(BUILTIN_TAG) !== -1;
        const styleName = HandoutUtils.styleNameFromHandoutName(h.get('name'));
        const matchingSeed = BUILTIN_STYLE_SEEDS.find(s => s.name === styleName);
        const stale = builtin && !!matchingSeed && tags.indexOf(seedVersionTag(matchingSeed)) === -1;
        return { handoutId: h.id, name: styleName, builtin, stale };
      })
      .sort((a, b) => a.name.localeCompare(b.name)),

    getOutOfSyncBindings: (targets, styles) => {
      const bindings = [];
      targets.forEach(t => {
        if (t.boundNotes) bindings.push({ handoutId: t.id, field: 'notes', styleName: t.boundNotes });
        if (t.boundGmnotes) bindings.push({ handoutId: t.id, field: 'gmnotes', styleName: t.boundGmnotes });
      });
      if (!bindings.length) return Promise.resolve([]);

      return Promise.all(bindings.map(b => {
        const handout = getObj('handout', b.handoutId);
        if (!handout) return Promise.resolve(null);
        const styleMeta = styles.find(s => s.name === b.styleName);
        if (!styleMeta) return Promise.resolve(null);
        const styleHandout = getObj('handout', styleMeta.handoutId);

        return Promise.all([
          getHandoutField(handout, b.field),
          getHandoutField(styleHandout, 'notes')
        ]).then(([rawContent, rawStyleCss]) => {
          const { styledHtml } = computeStyledContent(rawContent, rawStyleCss);
          return styledHtml !== String(rawContent || '') ? b : null;
        });
      })).then(results => results.filter(Boolean));
    },

    ensureBuiltinStyles: () => {
      BUILTIN_STYLE_SEEDS.forEach(seed => {
        const handoutName = `${seed.name}${STYLE_SUFFIX}`;
        const existing = findObjs({ type: 'handout', name: handoutName })[0];
        if (existing) {
          const existingTags = HandoutUtils.getTags(existing);
          if (existingTags.indexOf(BUILTIN_TAG) === -1) {
            HandoutUtils.setTagsRaw(existing, existingTags.concat([BUILTIN_TAG, seedVersionTag(seed)]));
            Logger.log(`Adopted existing "${handoutName}" as a built-in style handout`);
          }
          return;
        }

        if (seed.renamedFrom) {
          const oldName = `${seed.renamedFrom}${STYLE_SUFFIX}`;
          const old = findObjs({ type: 'handout', name: oldName })[0];
          const oldTags = old ? HandoutUtils.getTags(old) : [];
          if (old && oldTags.indexOf(BUILTIN_TAG) !== -1) {
            old.set('name', handoutName);
            migrateStyleBindings(seed.renamedFrom, seed.name);
            Logger.log(`Renamed built-in style handout "${oldName}" -> "${handoutName}"`);
            return;
          }
        }

        const h = createObj('handout', {
          name: handoutName,
          notes: `<pre style="white-space:pre-wrap;">${HtmlUtil.escapeHtml(seed.css)}</pre>`
        });
        try { h.set('tags', JSON.stringify([BUILTIN_TAG, seedVersionTag(seed)])); } catch (e) { /* ignore */ }
        Logger.log(`Created built-in style handout "${handoutName}"`);
      });
    },

    refreshBuiltinStyle: (styleName) => {
      const seed = BUILTIN_STYLE_SEEDS.find(s => s.name === styleName);
      if (!seed) return false;
      const handoutName = `${seed.name}${STYLE_SUFFIX}`;
      const h = findObjs({ type: 'handout', name: handoutName })[0];
      if (!h) return false;
      let tags = [];
      try { tags = JSON.parse(h.get('tags') || '[]') || []; } catch (e) { /* ignore */ }
      if (tags.indexOf(BUILTIN_TAG) === -1) return false;
      h.set('notes', `<pre style="white-space:pre-wrap;">${HtmlUtil.escapeHtml(seed.css)}</pre>`);
      try { h.set('tags', JSON.stringify([BUILTIN_TAG, seedVersionTag(seed)])); } catch (e) { /* ignore */ }
      Logger.log(`Refreshed built-in style handout "${handoutName}" to ${seedVersionTag(seed)}`);
      return true;
    }

  };

  // Output

  const Output = {
    send: (who, message) => {
      const target = String(who || '').replace(/\s*\(GM\)\s*$/i, '');
      sendChat(PROGRAM_NAME, `/w "${target}" ${message}`);
    }
  };

  // Renderer -- builds the control-panel handout's HTML:
  // header / left handout list / right field+style+preview panel.

  const pipeArg = (key, value) => `--${key} x|${value}`;

  const Renderer = {

    hasImageEditor: () => typeof state.ImageEditor !== 'undefined',

    buildHeader: (ui, selectedHandout, hasSpanTags) => {
      const actions = selectedHandout ? Renderer.buildActions(ui, hasSpanTags) : '';
      const imageEditorBtn = Renderer.hasImageEditor()
        ? `<span style="margin-left:8px;"><a href="${IMAGE_EDITOR_COMMAND}" style="${CSS.buttonNeutralLg}" title="Open Image Editor to control this handout's image placement, flow, and captions">Image Editor</a></span>`
        : '';
      const fieldToggle = `<span style="margin-left:8px;">${Renderer.buildFieldToggle(ui)}</span>`;
      const helpBtn = `<a href="!${COMMAND_NAME} --help" style="${CSS.helpBtn}" title="${HtmlUtil.escapeHtml(PROGRAM_NAME)} help">?</a>`;
      return `<div style="${CSS.header}">` +
        `<table style="${CSS.headerTable}"><tr>` +
        `<td style="${CSS.headerLeft}">` +
        `<div style="${CSS.title}" title="v${VERSION}">${HtmlUtil.escapeHtml(PROGRAM_NAME)}</div>` +
        `</td>` +
        `<td style="${CSS.headerRight}">${actions}${imageEditorBtn}${fieldToggle}${helpBtn}</td>` +
        `</tr></table></div>`;
    },

    buildHandoutRow: (ui, h) => {
      const active = ui.selectedHandoutId === h.id;
      const nameStyle = active ? CSS.handoutLinkActive : CSS.handoutLink;
      const bound = h.boundNotes || h.boundGmnotes;
      const marker = bound ? ' &#10003;' : '';
      const nameLink = `<a href="!${COMMAND_NAME} --select-handout ${h.id}" style="${nameStyle}">${HtmlUtil.escapeHtml(h.name)}${marker}</a>`;
      const openLink = `<a href="http://journal.roll20.net/handout/${h.id}" style="${CSS.openBtn}" title="Open &quot;${HtmlUtil.escapeHtml(h.name)}&quot; directly in Roll20">${OPEN_ICON_HTML}</a>`;
      return `<div style="${CSS.handoutRowWrap}">${nameLink}${openLink}</div>`;
    },

    buildLetterStrip: (ui, allTargets) => {
      const available = new Set();
      allTargets.forEach(t => {
        const first = String(t.name || '').trim().charAt(0).toUpperCase();
        if (/[0-9]/.test(first)) available.add(DIGIT_BUCKET_KEY);
        else if (/[A-Z]/.test(first)) available.add(first);
      });
      const btn = (key, label) => {
        if (!available.has(key)) return `<span style="${CSS.letterBtnDisabled}">${label}</span>`;
        const active = ui.listFilter === 'letter' && ui.nameFilterQuery === key;
        return `<a href="!${COMMAND_NAME} --letter-filter ${key}" style="${active ? CSS.letterBtnActive : CSS.letterBtn}">${label}</a>`;
      };
      const row1 = 'ABCDEFGHIJKLMN'.split('').map(l => btn(l, l)).join('');
      const row2 = 'OPQRSTUVWXYZ'.split('').map(l => btn(l, l)).join('') + btn(DIGIT_BUCKET_KEY, '#') +
        `<a href="!${COMMAND_NAME} --search ?{Enter search text to filter the handout list}" style="${CSS.searchBtn}" title="Search handout names (contains match)">&#128269;</a>`;
      const clearLabel = ui.nameFilterQuery === DIGIT_BUCKET_KEY ? '#' : ui.nameFilterQuery;
      const clear = (ui.listFilter === 'letter' || ui.listFilter === 'search')
        ? `<div style="margin-bottom:4px;"><a href="!${COMMAND_NAME} --list-filter all" style="${CSS.button}">&#10005; Clear filter${clearLabel ? ` (${HtmlUtil.escapeHtml(clearLabel)})` : ''}</a></div>`
        : '';
      return `<div style="${CSS.letterStripWrap}"><div>${row1}</div><div>${row2}</div></div>${clear}`;
    },

    buildRecentSection: (ui, byId) => {
      const caret = ui.recentCollapsed ? '&#9656;' : '&#9662;';
      const header = `<a href="!${COMMAND_NAME} --toggle-recent" style="${CSS.accordionHeader}">${caret} Most Recent</a>`;
      if (ui.recentCollapsed) return `<div style="${CSS.accordionWrap}">${header}</div>`;
      const ids = (ui.recentIds || []).filter(id => byId.has(id));
      const content = !ids.length
        ? `<div style="${CSS.emptyState}">No recent handouts yet.</div>`
        : ids.map(id => Renderer.buildHandoutRow(ui, byId.get(id))).join('');
      return `<div style="${CSS.accordionWrap}">${header}<div style="${CSS.accordionBody}">${content}</div></div>`;
    },

    buildMainListSection: (ui, allTargets, displayTargets, outOfSyncIds) => {
      const label = ui.listFilter === 'all' ? 'All Handouts' : 'Found Handouts';
      const caret = ui.listCollapsed ? '&#9656;' : '&#9662;';
      const header = `<a href="!${COMMAND_NAME} --toggle-list" style="${CSS.accordionHeader}">${caret} ${label}</a>`;
      if (ui.listCollapsed) return `<div style="${CSS.accordionWrap}">${header}</div>`;
      const strip = Renderer.buildLetterStrip(ui, allTargets);
      let content;
      if (!displayTargets.length) {
        const emptyMsg = ui.listFilter === 'styled' ? 'No styled handouts.'
          : ui.listFilter === 'outOfSync' ? 'Nothing out of sync.'
          : (ui.listFilter === 'letter' || ui.listFilter === 'search') ? `No handouts match "${HtmlUtil.escapeHtml(ui.nameFilterQuery || '')}".`
          : 'No handouts found.';
        content = `${strip}<div style="${CSS.emptyState}">${emptyMsg}</div>`;
      } else {
        content = `${strip}${displayTargets.map(h => Renderer.buildHandoutRow(ui, h)).join('')}`;
      }
      return `<div style="${CSS.accordionWrap}">${header}<div style="${CSS.accordionBody}">${content}</div></div>`;
    },

    buildHandoutList: (ui, allTargets, displayTargets, outOfSyncIds) => {
      const filterBtn = (key, label) => {
        const active = ui.listFilter === key;
        return `<a href="!${COMMAND_NAME} --list-filter ${key}" style="${active ? CSS.toolbarBtnActive : CSS.toolbarBtn}">${label}</a>`;
      };
      const toolbarRow = `<div style="margin-bottom:6px;">` +
        `<a href="!${COMMAND_NAME} --rescan" style="${CSS.toolbarBtn}" title="Rescan the game for handouts">&#8635; Refresh</a>` +
        filterBtn('styled', 'Show Styled') +
        filterBtn('outOfSync', 'Unsynced') +
        `</div>`;
      const syncAll = (ui.listFilter === 'outOfSync' && outOfSyncIds && outOfSyncIds.size)
        ? `<div style="margin-bottom:6px;"><a href="!${COMMAND_NAME} --sync-all" style="${CSS.buttonDanger}">Sync All (${outOfSyncIds.size})</a></div>`
        : '';
      const byId = new Map(allTargets.map(t => [t.id, t]));
      const recentSection = Renderer.buildRecentSection(ui, byId);
      const mainSection = Renderer.buildMainListSection(ui, allTargets, displayTargets, outOfSyncIds);
      return toolbarRow + syncAll + recentSection + mainSection;
    },

    buildFieldToggle: (ui) => {
      const notesStyle = ui.selectedField === 'notes' ? CSS.buttonActiveLg : CSS.buttonNeutralLg;
      const gmStyle = ui.selectedField === 'gmnotes' ? CSS.buttonActiveLg : CSS.buttonNeutralLg;
      return `<a href="!${COMMAND_NAME} --select-field notes" style="${notesStyle}">Notes</a>` +
        `<a href="!${COMMAND_NAME} --select-field gmnotes" style="${gmStyle}">GM Notes</a>`;
    },

    buildStylePicker: (ui, styles, devGame) => {
      const editBtn = `<a href="!${COMMAND_NAME} --toggle-edit-mode" style="${ui.editMode ? CSS.toolbarBtnActive : CSS.toolbarBtn}" title="${ui.editMode ? 'Exit edit mode' : 'Edit mode: style buttons below open their _css handout in Roll20 instead of selecting a preview style'}">Edit</a>`;
      const exportBtn = devGame ? `<a href="!${COMMAND_NAME} --export-styles" style="${CSS.toolbarBtn}" title="Export: copy every style's CSS out to one handout, for handing off to Claude">&#8593; Export</a>` : '';
      const importBtn = devGame ? `<a href="!${COMMAND_NAME} --import-styles" style="${CSS.toolbarBtn}" title="Import: write styles from the &quot;${IMPORT_HANDOUT_NAME}&quot; handout back into their _css handouts">&#8595; Import</a>` : '';
      const header = `<div><span style="${CSS.sectionLabelInline}">Preview Style</span>${editBtn}${exportBtn}${importBtn}</div>`;

      if (!styles.length) {
        return `${header}<div style="${CSS.emptyState}">No style handouts found (expected "&lt;Name&gt;_css").</div>`;
      }
      const items = styles.map(s => {
        const active = ui.selectedStyleName === s.name;
        const btnStyle = active ? CSS.buttonActive : CSS.button;
        const label = ui.editMode
          ? `<a href="http://journal.roll20.net/handout/${s.handoutId}" style="${btnStyle}" title="Open &quot;${HtmlUtil.escapeHtml(s.name)}${STYLE_SUFFIX}&quot; in Roll20 to edit its CSS">${HtmlUtil.escapeHtml(s.name)} ${OPEN_ICON_HTML}</a>`
          : `<a href="!${COMMAND_NAME} ${pipeArg('select-style', s.name)}" style="${btnStyle}">${HtmlUtil.escapeHtml(s.name)}</a>`;
        const refresh = s.stale
          ? `<a href="!${COMMAND_NAME} ${pipeArg('refresh-builtin', s.name)}" style="${CSS.buttonWarning}" title="This built-in's saved CSS predates a script update. Clicking replaces its ENTIRE contents with the current default -- if you've hand-edited this handout, your changes will be lost.">&#8635; update available (overwrites!)</a>`
          : '';
        return label + refresh;
      }).join('');
      const none = `<a href="!${COMMAND_NAME} --select-style none" style="${!ui.selectedStyleName ? CSS.buttonActive : CSS.button}">(none)</a>`;
      return `${header}${none}${items}`;
    },

    buildActions: (ui, hasSpanTags) =>
      `<a href="!${COMMAND_NAME} --apply" style="${CSS.buttonPrimary}">Apply to Handout</a>` +
      `<a href="!${COMMAND_NAME} --remove-styling" style="${CSS.buttonDanger}">Remove Styling</a>` +
      (hasSpanTags && !ui.confirmSanitize
        ? `<a href="!${COMMAND_NAME} --confirm-sanitize" style="${CSS.buttonWarningLg}" title="This handout still has &lt;span&gt; tags in it -- often left over from pasted content, sometimes hiding a stray color or highlight. Sanitize removes just those tags; everything else is left alone.">Sanitize Spans</a>`
        : '') +
      `<a href="!${COMMAND_NAME} --toggle-source" style="${CSS.buttonNeutralLg}">${ui.showSource ? 'Show Preview' : 'View Source'}</a>`,

    buildBody: (ui, allTargets, displayTargets, styles, selectedHandout, previewHtml, outOfSyncIds, rawContent, devGame) => {
      const listHtml = Renderer.buildHandoutList(ui, allTargets, displayTargets, outOfSyncIds);
      const stylePicker = Renderer.buildStylePicker(ui, styles, devGame);
      const hasSpanTags = !!(selectedHandout && Cleaner.hasSpanTags(rawContent));

      const previewLabel = `Preview${selectedHandout ? ' &mdash; ' + HtmlUtil.escapeHtml(selectedHandout.get('name')) + ' (' + ui.selectedField + ')' : ''}`;
      const previewOpenLink = selectedHandout
        ? `<a href="http://journal.roll20.net/handout/${selectedHandout.id}" style="margin-left:6px; ${CSS.openBtn}" title="Open &quot;${HtmlUtil.escapeHtml(selectedHandout.get('name'))}&quot; directly in Roll20">${OPEN_ICON_HTML}</a>`
        : '';
      let previewContent;
      if (!selectedHandout) {
        previewContent = `<div style="${CSS.emptyState}">Select a handout from the list to preview.</div>`;
      } else if (ui.showSource) {
        previewContent = `<div style="${CSS.sourceBox}">${HtmlUtil.escapeHtml(previewHtml)}</div>`;
      } else {
        previewContent = `<div style="${CSS.previewBox}">${previewHtml || `<div style="${CSS.emptyState}">(empty)</div>`}</div>`;
      }

      const previewControls = `<div style="${CSS.previewControlsBox}">${stylePicker}` +
        `<div style="${CSS.sectionLabel}">${previewLabel}${previewOpenLink}</div></div>`;

      let confirmBanner = '';
      if (ui.confirmSanitize && hasSpanTags) {
        const spanCount = (String(rawContent || '').match(/<span[\s/>]/gi) || []).length;
        confirmBanner = `<div style="${CSS.confirmBanner}">` +
          `<div style="${CSS.confirmBannerText}">Remove ${spanCount} &lt;span&gt; tag${spanCount === 1 ? '' : 's'} from this handout? ` +
          `This clears out colors/highlights sometimes hidden in &lt;span&gt; tags by pasted content -- everything else ` +
          `(structure, any style already applied) is left untouched. This can't be undone automatically.</div>` +
          `<a href="!${COMMAND_NAME} --sanitize" style="${CSS.buttonDanger}">Yes, remove spans</a>` +
          `<a href="!${COMMAND_NAME} --cancel-sanitize" style="${CSS.button}">Cancel</a>` +
          `</div>`;
      }
      const rightCell = confirmBanner + previewControls + previewContent;

      return `<div style="${CSS.wrapper}">${Renderer.buildHeader(ui, selectedHandout, hasSpanTags)}` +
        `<table style="${CSS.layoutTable}"><tr>` +
        `<td style="${CSS.listCell}">${listHtml}</td>` +
        `<td style="${CSS.previewCell}">${rightCell}</td>` +
        `</tr></table></div>`;
    }

  };

  // Render / Apply / Remove pipelines

  const computeCleanAndStyled = (ui, targetHandout, styles) => {
    const styleMeta = ui.selectedStyleName && ui.selectedStyleName !== 'none'
      ? styles.find(s => s.name === ui.selectedStyleName) : null;
    const styleHandout = styleMeta ? getObj('handout', styleMeta.handoutId) : null;

    return Promise.all([
      getHandoutField(targetHandout, ui.selectedField),
      getHandoutField(styleHandout, 'notes')
    ]).then(([rawContent, rawStyleCss]) => computeStyledContent(rawContent, rawStyleCss));
  };

  const filterTargetsForDisplay = (targets, ui, outOfSyncIds) => {
    if (ui.listFilter === 'styled') return targets.filter(t => t.boundNotes || t.boundGmnotes);
    if (ui.listFilter === 'outOfSync') return targets.filter(t => outOfSyncIds && outOfSyncIds.has(t.id));
    if (ui.listFilter === 'letter' || ui.listFilter === 'search') {
      const q = ui.nameFilterQuery || '';
      if (!q) return targets;
      if (ui.listFilter === 'letter' && q === DIGIT_BUCKET_KEY) return targets.filter(t => /^[0-9]/.test(t.name));
      const qLower = q.toLowerCase();
      return targets.filter(t => {
        const n = t.name.toLowerCase();
        return ui.listFilter === 'letter' ? n.indexOf(qLower) === 0 : n.indexOf(qLower) !== -1;
      });
    }
    return targets;
  };

  const renderPanelForPlayer = (playerid) => {
    const ui = State.uiFor(playerid);
    const allTargets = HandoutUtils.getAllTargetHandouts();
    const styles = HandoutUtils.getAllStyleHandouts();

    if (ui.selectedHandoutId && !allTargets.some(t => t.id === ui.selectedHandoutId)) {
      ui.selectedHandoutId = null;
    }
    if (ui.selectedStyleName && ui.selectedStyleName !== 'none' && !styles.some(s => s.name === ui.selectedStyleName)) {
      ui.selectedStyleName = null;
    }

    const selectedHandout = ui.selectedHandoutId ? getObj('handout', ui.selectedHandoutId) : null;

    const styledWork = selectedHandout
      ? computeCleanAndStyled(ui, selectedHandout, styles)
      : Promise.resolve({ rawContent: '', cleanHtml: '', styledHtml: '' });

    const outOfSyncWork = ui.listFilter === 'outOfSync'
      ? HandoutUtils.getOutOfSyncBindings(allTargets, styles).then(bindings => new Set(bindings.map(b => b.handoutId)))
      : Promise.resolve(null);

    return Promise.all([styledWork, outOfSyncWork]).then(([{ rawContent, styledHtml }, outOfSyncIds]) => {
      const displayTargets = filterTargetsForDisplay(allTargets, ui, outOfSyncIds);
      const body = Renderer.buildBody(ui, allTargets, displayTargets, styles, selectedHandout, styledHtml, outOfSyncIds, rawContent, isDevGame());
      HandoutUtils.getPanelHandout().set('notes', body);
    }).catch(err => {
      Logger.error(`render failed: ${err}`);
    });
  };

  const applyStyleToHandout = (playerid) => {
    const ui = State.uiFor(playerid);
    if (!ui.selectedHandoutId) return renderPanelForPlayer(playerid);
    const targetHandout = getObj('handout', ui.selectedHandoutId);
    if (!targetHandout) return renderPanelForPlayer(playerid);
    const styles = HandoutUtils.getAllStyleHandouts();
    const field = ui.selectedField;
    const styleName = ui.selectedStyleName;

    return computeCleanAndStyled(ui, targetHandout, styles).then(({ styledHtml }) =>
      setHandoutFieldSafe(targetHandout, field, styledHtml)
    ).then(() => {
      if (styleName && styleName !== 'none') {
        HandoutUtils.setBindingTag(targetHandout, field, styleName);
      } else {
        HandoutUtils.clearBindingTag(targetHandout, field);
      }
      Logger.log(`Applied style "${styleName || '(none)'}" to "${targetHandout.get('name')}" [${field}]`);
      return renderPanelForPlayer(playerid);
    });
  };

  const removeStylingFromHandout = (playerid) => {
    const ui = State.uiFor(playerid);
    if (!ui.selectedHandoutId) return renderPanelForPlayer(playerid);
    const targetHandout = getObj('handout', ui.selectedHandoutId);
    if (!targetHandout) return renderPanelForPlayer(playerid);
    // See applyStyleToHandout's own comment on this snapshot -- same
    // reasoning, same real delay possible underneath setHandoutFieldSafe.
    const field = ui.selectedField;

    return getHandoutField(targetHandout, field).then(rawContent => {
      const cleanHtml = Cleaner.clean(rawContent);
      return setHandoutFieldSafe(targetHandout, field, cleanHtml);
    }).then(() => {
      HandoutUtils.clearBindingTag(targetHandout, field);
      Logger.log(`Removed styling from "${targetHandout.get('name')}" [${field}]`);
      return renderPanelForPlayer(playerid);
    });
  };

  const sanitizeHandout = (playerid) => {
    const ui = State.uiFor(playerid);
    ui.confirmSanitize = false;
    if (!ui.selectedHandoutId) return renderPanelForPlayer(playerid);
    const targetHandout = getObj('handout', ui.selectedHandoutId);
    if (!targetHandout) return renderPanelForPlayer(playerid);
    // See applyStyleToHandout's own comment on this snapshot -- same
    // reasoning, same real delay possible underneath setHandoutFieldSafe.
    const field = ui.selectedField;

    return getHandoutField(targetHandout, field).then(rawContent => {
      const sanitized = Cleaner.stripSpanTags(rawContent);
      return setHandoutFieldSafe(targetHandout, field, sanitized);
    }).then(() => {
      Logger.log(`Sanitized <span> tags from "${targetHandout.get('name')}" [${field}]`);
      return renderPanelForPlayer(playerid);
    });
  };

  const syncOneBinding = (binding, styles) => {
    const handout = getObj('handout', binding.handoutId);
    if (!handout) return Promise.resolve();
    const styleMeta = styles.find(s => s.name === binding.styleName);
    const styleHandout = styleMeta ? getObj('handout', styleMeta.handoutId) : null;

    return Promise.all([
      getHandoutField(handout, binding.field),
      getHandoutField(styleHandout, 'notes')
    ]).then(([rawContent, rawStyleCss]) => {
      const { styledHtml } = computeStyledContent(rawContent, rawStyleCss);
      return setHandoutFieldSafe(handout, binding.field, styledHtml);
    });
  };

  const syncAllOutOfSync = (playerid) => {
    const targets = HandoutUtils.getAllTargetHandouts();
    const styles = HandoutUtils.getAllStyleHandouts();
    return HandoutUtils.getOutOfSyncBindings(targets, styles).then(bindings => {
      if (!bindings.length) return renderPanelForPlayer(playerid);
      return bindings
        .reduce((chain, binding) => chain.then(() => syncOneBinding(binding, styles)), Promise.resolve())
        .then(() => {
          Logger.log(`Sync All: re-applied styling to ${bindings.length} out-of-sync field(s)`);
          return renderPanelForPlayer(playerid);
        });
    });
  };

  const buildHelpHtml = () => {
    const builtinNames = BUILTIN_STYLE_SEEDS.map(s => s.name).sort((a, b) => a.localeCompare(b));

    return `<div>` +
      `<img src="${HANDOUT_AVATAR}" width="70">` +
      `<h1>${HtmlUtil.escapeHtml(PROGRAM_NAME)}</h1>` +

      `<p>${HtmlUtil.escapeHtml(PROGRAM_NAME)} takes the plain text you've already written in a ` +
      `handout's Notes or GM Notes and dresses it up to look like a real prop from your game world ` +
      `&mdash; an old letter, a wanted poster, a torn journal page, whatever fits the scene. You can ` +
      `also use it the other way around: pick one look and apply it handout by handout across your ` +
      `game, so everything matches your game system's theme instead of looking like plain, unstyled ` +
      `text &mdash; the style picker remembers your last choice as you switch handouts, so you're not ` +
      `re-selecting it each time.</p>` +
      `<p>` +
      `Your original writing is never lost or overwritten &mdash; the styling sits on top of it, and can ` +
      `be swapped or removed again at any time.</p>` +

      `<h2>A few things people use it for</h2>` +
      `<ul>` +
      `<li>A handwritten letter or diary page for a journal-keeping character</li>` +
      `<li>A wanted poster, tavern notice, or other in-world prop</li>` +
      `<li>Giving every handout in a game &mdash; not just one &mdash; the same consistent, ` +
      `system-appropriate look</li>` +
      `</ul>` +

      `<h2>Quick start</h2>` +
      `<ol>` +
      `<li>Type <code>!${COMMAND_NAME}</code> in chat, or click the "?" button in the panel, to open ` +
      `the control panel (or just open the "${HtmlUtil.escapeHtml(PANEL_NAME)}" handout directly ` +
      `once it exists).</li>` +
      `<li>Click a handout in the list on the left to select it &mdash; use Recent, the A-Z strip, or ` +
      `Search if the list is long.</li>` +
      `<li>Choose Notes or GM Notes with the toggle in the header.</li>` +
      `<li>Pick a style under "Preview Style" and check the preview at the bottom of the panel &mdash; ` +
      `it shows what the selected handout <i>would</i> look like if it used that style, which is not ` +
      `necessarily the style (if any) it's actually using right now. To see the handout's real, ` +
      `current appearance in Roll20, click the small open icon next to the "Preview" label.</li>` +
      `<li>Click Apply. Remove Styling, or applying a different style, can always change or undo it ` +
      `later.</li>` +
      `</ol>` +

      `<h2>Styles are just handouts</h2>` +
      `<p>Every style is a plain CSS handout named "&lt;Name&gt;${STYLE_SUFFIX}" (for example ` +
      `"Parchment${STYLE_SUFFIX}") &mdash; open it like any other handout to read or edit its CSS ` +
      `directly, no special editor needed. To add a new style yourself, create a handout named ` +
      `"YourStyleName${STYLE_SUFFIX}" and write CSS into its Notes; it shows up in the picker ` +
      `automatically. Currently built in: ${HtmlUtil.escapeHtml(builtinNames.join(', '))}.</p>` +
      `<p><b>Edit Mode:</b> the "Edit" button next to "Preview Style" turns every style button into a ` +
      `direct link to that style's "${STYLE_SUFFIX}" handout, so you can jump straight to editing its ` +
      `CSS instead of hunting for it in the main list. Click it again to go back to normal style ` +
      `selection.</p>` +

      `<h2>Looking for more styles?</h2>` +
      `<p>A growing library of ready-made styles is posted here: ` +
      `<a href="${STYLE_LIBRARY_URL}">Style library</a>.</p>` +

      `<h2>Works well with: Image Editor</h2>` +
      `<p>Image Editor is a separate script that controls how images inside a handout are placed, ` +
      `flow with the text, and get captioned. If you have it installed, an "Image Editor" button ` +
      `appears in this panel's header (between View Source and Notes) to jump straight to it. You ` +
      `can read more about it and download it here: ` +
      `<a href="${IMAGE_EDITOR_THREAD_URL}">Image Editor forum thread</a>.</p>` +

      `<h2>Keeping styled content in sync</h2>` +
      `<p>If a styled handout's Notes/GM Notes gets hand-edited afterward (say, with Roll20's own ` +
      `rich-text toolbar), the stored styling and the source text can drift apart. The panel's ` +
      `"Unsynced" filter finds every handout in that state; "Sync All" re-applies each one's bound ` +
      `style to bring it back in line in one click.</p>` +

      `<h2>New to CSS?</h2>` +
      `<p>Styles are just CSS, so if you'd like to be able to read or tweak them yourself, ` +
      `Codecademy's free course is a good place to start: ` +
      `<a href="https://www.codecademy.com/learn/learn-css">Learn CSS</a>.</p>` +

      `<h2>Typed commands</h2>` +
      `<p><code>!${COMMAND_NAME}</code> &mdash; opens the control panel.<br>` +
      `<code>!${COMMAND_NAME} --help</code> &mdash; opens this help handout.<br>` +
      `Everything else in ${HtmlUtil.escapeHtml(PROGRAM_NAME)} is click-driven from inside the panel ` +
      `itself &mdash; there's no need to memorize or type any other command by hand.</p>` +

      `<p><i>${HtmlUtil.escapeHtml(PROGRAM_NAME)} v${VERSION}</i></p>` +
      `</div>`;
  };

  const buildWhisperCard = (buttonLabel, handoutId) =>
    `<div style="${CSS.whisperCard}">` +
    `<div style="${CSS.whisperTitle}">${HtmlUtil.escapeHtml(PROGRAM_NAME)}</div>` +
    `<a href="http://journal.roll20.net/handout/${handoutId}" style="${CSS.whisperBtn}">${HtmlUtil.escapeHtml(buttonLabel)}</a>` +
    `</div>`;

  const exportStyles = (msg) => {
    const styles = HandoutUtils.getAllStyleHandouts();
    if (!styles.length) {
      Output.send(msg.who, `No "${STYLE_SUFFIX}" style handouts found to export.`);
      return Promise.resolve();
    }
    return Promise.all(styles.map(s => {
      const h = getObj('handout', s.handoutId);
      return getHandoutField(h, 'notes').then(raw => ({
        handoutName: `${s.name}${STYLE_SUFFIX}`,
        css: HtmlUtil.htmlToPlainText(raw).trim()
      }));
    })).then(entries => {
      entries.sort((a, b) => a.handoutName.localeCompare(b.handoutName));
      const blob = entries
        .map(e => `${styleExportStart(e.handoutName)}\n${e.css}\n${STYLE_EXPORT_END}`)
        .join('\n\n');
      const header =
        `Handout Formatter style export -- ${entries.length} style${entries.length === 1 ? '' : 's'}, v${VERSION}.\n` +
        `Copy this whole Notes field and send it to Claude as-is.\n` +
        `To bring updates back from Claude into this game: paste the block Claude sends\n` +
        `back into the "${IMPORT_HANDOUT_NAME}" handout's Notes, then run\n` +
        `!${COMMAND_NAME} --import-styles.\n\n`;
      const exportHandout = HandoutUtils.findOrCreateUtilityHandout(EXPORT_HANDOUT_NAME);
      exportHandout.set('notes', `<pre style="white-space:pre-wrap;">${HtmlUtil.escapeHtml(header + blob)}</pre>`);
      const link = `<a href="http://journal.roll20.net/handout/${exportHandout.id}">${HtmlUtil.escapeHtml(EXPORT_HANDOUT_NAME)}</a>`;
      Output.send(msg.who, `Exported ${entries.length} style${entries.length === 1 ? '' : 's'} to ${link} &mdash; open it, select all, copy, and send it over.`);
    });
  };

  const importStyles = (msg) => {
    const importHandout = findObjs({ type: 'handout', name: IMPORT_HANDOUT_NAME })[0];
    if (!importHandout) {
      Output.send(msg.who, `No "${IMPORT_HANDOUT_NAME}" handout found &mdash; create one and paste the style block into its Notes first.`);
      return Promise.resolve();
    }
    return getHandoutField(importHandout, 'notes').then(raw => {
      const text = HtmlUtil.htmlToPlainText(raw);
      const blockRe = /##### STYLE: (.+?) #####\r?\n([\s\S]*?)\r?\n##### END #####/g;
      const found = [];
      let m;
      while ((m = blockRe.exec(text))) {
        found.push({ name: m[1].trim(), css: m[2].trim() });
      }
      if (!found.length) {
        Output.send(msg.who, `Couldn't find any "##### STYLE: ... #####" blocks in "${IMPORT_HANDOUT_NAME}" &mdash; paste the block Claude sent, unedited, then try again.`);
        return;
      }
      let created = 0, updated = 0;
      const skipped = [];
      found.forEach(f => {
        if (!HandoutUtils.isStyleHandoutName(f.name)) { skipped.push(f.name); return; }
        let h = findObjs({ type: 'handout', name: f.name })[0];
        if (!h) { h = createObj('handout', { name: f.name, archived: false }); created++; }
        else updated++;
        h.set('notes', `<pre style="white-space:pre-wrap;">${HtmlUtil.escapeHtml(f.css)}</pre>`);
      });
      const parts = [];
      if (created) parts.push(`${created} created`);
      if (updated) parts.push(`${updated} updated`);
      let summary = `Import complete: ${parts.join(', ') || 'nothing to do'}.`;
      if (skipped.length) summary += ` Skipped (name doesn't end in "${STYLE_SUFFIX}"): ${skipped.map(n => HtmlUtil.escapeHtml(n)).join(', ')}.`;
      Output.send(msg.who, summary);
    });
  };

  // Commands (Single Root)

  const Commands = {

    root: (msg, parsed) => {
      if (!playerIsGM(msg.playerid)) return;

      const { args } = parsed;
      const playerid = msg.playerid;

      if (args['select-handout']) {
        const ui = State.uiFor(playerid);
        ui.selectedHandoutId = args['select-handout'];
        // A confirmation raised for whichever handout was selected before
        // must never carry over onto this new one (0.15.2).
        ui.confirmSanitize = false;
        ui.recentIds = [ui.selectedHandoutId]
          .concat((ui.recentIds || []).filter(id => id !== ui.selectedHandoutId))
          .slice(0, 5);
        const h = getObj('handout', ui.selectedHandoutId);
        const bound = h ? HandoutUtils.getBoundStyleName(h, ui.selectedField) : null;
        if (bound) ui.selectedStyleName = bound;
        return renderPanelForPlayer(playerid);
      }
      if (args['select-field']) {
        const ui = State.uiFor(playerid);
        ui.selectedField = args['select-field'] === 'gmnotes' ? 'gmnotes' : 'notes';
        ui.confirmSanitize = false; // switching fields means a different piece of content -- see select-handout above
        const h = ui.selectedHandoutId ? getObj('handout', ui.selectedHandoutId) : null;
        const bound = h ? HandoutUtils.getBoundStyleName(h, ui.selectedField) : null;
        if (bound) ui.selectedStyleName = bound;
        return renderPanelForPlayer(playerid);
      }
      if (args['select-style']) {
        State.uiFor(playerid).selectedStyleName = args['select-style'];
        return renderPanelForPlayer(playerid);
      }
      if (args['toggle-edit-mode']) {
        const ui = State.uiFor(playerid);
        ui.editMode = !ui.editMode;
        return renderPanelForPlayer(playerid);
      }
      if (args['refresh-builtin']) {
        const ok = HandoutUtils.refreshBuiltinStyle(args['refresh-builtin']);
        if (!ok) Logger.error(`Refresh requested for "${args['refresh-builtin']}" but it isn't a recognized built-in style handout`);
        return renderPanelForPlayer(playerid);
      }
      if (args['toggle-source']) {
        const ui = State.uiFor(playerid);
        ui.showSource = !ui.showSource;
        return renderPanelForPlayer(playerid);
      }
      if (args['list-filter']) {
        const ui = State.uiFor(playerid);
        const requested = args['list-filter'] === 'outOfSync' ? 'outOfSync' : (args['list-filter'] === 'styled' ? 'styled' : 'all');
        ui.listFilter = ui.listFilter === requested ? 'all' : requested;
        ui.nameFilterQuery = ''; // this filter slot is shared with letter/search -- one active mode at a time
        return renderPanelForPlayer(playerid);
      }
      if (args['letter-filter']) {
        const ui = State.uiFor(playerid);
        const raw = args['letter-filter'];
        const key = (raw === true || !raw) ? '' : String(raw).trim().toUpperCase();
        if (!key) return renderPanelForPlayer(playerid);
        const alreadyActive = ui.listFilter === 'letter' && ui.nameFilterQuery === key;
        if (alreadyActive) {
          ui.listFilter = 'all';
          ui.nameFilterQuery = '';
        } else {
          ui.listFilter = 'letter';
          ui.nameFilterQuery = key;
        }
        ui.listCollapsed = false; // a filter you just set should always be visible
        return renderPanelForPlayer(playerid);
      }
      if (args['search']) {
        const ui = State.uiFor(playerid);
        ui.listFilter = 'search';
        ui.nameFilterQuery = args['search'] === true ? '' : String(args['search']);
        ui.listCollapsed = false;
        return renderPanelForPlayer(playerid);
      }
      if (args['toggle-recent']) {
        const ui = State.uiFor(playerid);
        ui.recentCollapsed = !ui.recentCollapsed;
        return renderPanelForPlayer(playerid);
      }
      if (args['toggle-list']) {
        const ui = State.uiFor(playerid);
        ui.listCollapsed = !ui.listCollapsed;
        return renderPanelForPlayer(playerid);
      }
      if (args['apply']) return applyStyleToHandout(playerid);
      if (args['remove-styling']) return removeStylingFromHandout(playerid);
      if (args['confirm-sanitize']) {
        State.uiFor(playerid).confirmSanitize = true;
        return renderPanelForPlayer(playerid);
      }
      if (args['cancel-sanitize']) {
        State.uiFor(playerid).confirmSanitize = false;
        return renderPanelForPlayer(playerid);
      }
      if (args['sanitize']) return sanitizeHandout(playerid);
      if (args['sync-all']) return syncAllOutOfSync(playerid);
      if (args['export-styles']) return exportStyles(msg);
      if (args['import-styles']) return importStyles(msg);
      if (args['rescan']) return renderPanelForPlayer(playerid);

      if (args['help']) {
        const help = HandoutUtils.getHelpHandout();
        return Output.send(msg.who, buildWhisperCard(`Open ${PROGRAM_NAME} Help`, help.id));
      }

      return renderPanelForPlayer(playerid).then(() => {
        const panel = HandoutUtils.getPanelHandout();
        Output.send(msg.who, buildWhisperCard(`Open ${PROGRAM_NAME}`, panel.id));
      });
    }

  };

  // Input Handler

  const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    const parsed = Parser.parse(msg.content);
    if (parsed.command.toLowerCase() !== `!${COMMAND_NAME}`.toLowerCase()) return;
    Commands.root(msg, parsed);
  };

  // Event Registration

  const registerEventHandlers = () => {
    on('chat:message', handleInput);
  };

  // Initialization

  const checkInstall = () => {
    Logger.log(`v${VERSION} [${new Date(LAST_UPDATE * 1000)}]`);
    State.initialize();
    HandoutUtils.ensureBuiltinStyles();
    HandoutUtils.getPanelHandout();
    HandoutUtils.refreshHelpHandout();
    return true;
  };

  on('ready', () => {
    if (checkInstall()) {
      registerEventHandlers();
    }
  });

  // Public Interface

  return {
    version: VERSION,
    HtmlUtil,
    CssParser,
    Cleaner,
    Styler
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = HandoutFormatter;
}