// Script:   LightMeter
// By:       Keith Curtis
// Contact:  https://app.roll20.net/users/162065/keithcurtis
// Requires: checkLightLevel (which requires Path Math)
//
// Tokens on the Objects layer whose names end in " **", " 🌑", " 🌗" or " 🌕"
// get that suffix updated to show their light level each time they move.
//
// GM command:
//   !lightmeter                  Show current thresholds
//   !lightmeter --dim N          Set the dim light threshold (0-100)
//   !lightmeter --dark N         Set the darkness threshold (0-100)
//   !lightmeter --reset          Restore defaults (dim 50, dark 20)
//   !lightmeter --on             Make selected tokens light sensitive
//   !lightmeter --off            Remove light sensitivity from selected tokens
//                                (--on/--off also accept --ids id1,id2)
//
// Changelog
// 1.0.0 Initial Version

const LightMeter = (() => {
  'use strict';

  const SCRIPT_NAME = 'LightMeter';
  const VERSION = '1.0.0';
  const SCHEMA_VERSION = 1;
  const COMMAND = '!lightmeter';

  const DEFAULTS = { dim: 50, dark: 20 };

  // Suffixes are kept exactly as the original script used them
  const MARKER = {
    unset: ' **',
    dark: ' 🌑',
    dim: ' 🌗',
    bright: ' 🌕'
  };
  const MARKER_RE = / (\*\*|🌑|🌗|🌕)$/u;

  const CSS = {
    box: 'background-color:#1e1e1e;border:1px solid #555;border-radius:4px;padding:6px;color:#ddd;font-size:13px;',
    header: 'background-color:#333;color:#fff;font-weight:bold;padding:3px 5px;margin:-6px -6px 6px -6px;border-radius:4px 4px 0 0;',
    table: 'width:100%;border-collapse:collapse;',
    cell: 'padding:2px 4px;',
    error: 'color:#ff8080;',
    button: 'display:inline-block;color:#fff !important;background-color:#3a5a80 !important;border:1px solid #5a7aa0 !important;border-radius:3px;padding:2px 6px;margin:2px;text-decoration:none;font-size:12px;'
  };

  // ---------- State ----------

  const checkState = () => {
    if (!state[SCRIPT_NAME] || state[SCRIPT_NAME].schemaVersion !== SCHEMA_VERSION) {
      state[SCRIPT_NAME] = {
        schemaVersion: SCHEMA_VERSION,
        config: { ...DEFAULTS }
      };
    }
  };

  const cfg = () => state[SCRIPT_NAME].config;

  // ---------- Output ----------

  const whisperTarget = (playerid) => {
    const player = getObj('player', playerid);
    return player ? player.get('_displayname') : 'gm';
  };

  const whisper = (playerid, html) => {
    if (html.includes('@{')) {
      log(`${SCRIPT_NAME}: outgoing message contains a raw @{ reference and was not sent.`);
      return;
    }
    sendChat(SCRIPT_NAME, `/w "${whisperTarget(playerid)}" ${html}`, null, { noarchive: true });
  };

  const button = (label, command) =>
    `<a style="${CSS.button}" href="${command}">${label}</a>`;

  const panel = (body) =>
    `<div style="${CSS.box}"><div style="${CSS.header}">LightMeter</div>${body}</div>`;

  const showSettings = (playerid, errorText) => {
    const c = cfg();
    const err = errorText ? `<div style="${CSS.error}">${errorText}</div>` : '';
    whisper(playerid, panel(
      err +
      `<table style="${CSS.table}">` +
      `<tr><td style="${CSS.cell}">${MARKER.dark.trim()} Dark</td><td style="${CSS.cell}">0–${c.dark}%</td></tr>` +
      `<tr><td style="${CSS.cell}">${MARKER.dim.trim()} Dim</td><td style="${CSS.cell}">${c.dark + 1}–${c.dim}%</td></tr>` +
      `<tr><td style="${CSS.cell}">${MARKER.bright.trim()} Bright</td><td style="${CSS.cell}">${c.dim + 1}–100%</td></tr>` +
      `</table>` +
      button('Set Dark', `${COMMAND} --dark ?{Darkness threshold (0-100)|${c.dark}}`) +
      button('Set Dim', `${COMMAND} --dim ?{Dim light threshold (0-100)|${c.dim}}`) +
      button('Reset', `${COMMAND} --reset`) +
      `<br>` +
      button('Selected: On', `${COMMAND} --on`) +
      button('Selected: Off', `${COMMAND} --off`)
    ));
  };

  // ---------- Commands ----------

  const parseArgs = (content) => {
    const args = [];
    content.split(/\s+--/).slice(1).forEach(part => {
      const [key, ...rest] = part.trim().split(/\s+/);
      args.push({ key: (key || '').toLowerCase(), value: rest.join(' ') });
    });
    return args;
  };

  const handleInput = (msg) => {
    if (msg.type !== 'api') return;
    if (msg.content.split(/\s+/)[0].toLowerCase() !== COMMAND) return;
    if (msg.playerid !== 'API' && !playerIsGM(msg.playerid)) return;

    const c = cfg();
    const args = parseArgs(msg.content);
    let error = '';

    // --on / --off act on selected tokens (or --ids) and report only errors
    const toggle = args.find(a => a.key === 'on' || a.key === 'off');
    if (toggle) {
      const idArg = args.find(a => a.key === 'ids');
      const ids = idArg
        ? idArg.value.split(/[\s,]+/).filter(Boolean)
        : (msg.selected || []).filter(s => s._type === 'graphic').map(s => s._id);
      const tokens = ids.map(id => getObj('graphic', id))
        .filter(t => t && t.get('_subtype') === 'token');
      if (!tokens.length) {
        showSettings(msg.playerid, 'Select one or more tokens first.');
        return;
      }
      tokens.forEach(t => (toggle.key === 'on' ? enableToken(t) : disableToken(t)));
      return;
    }

    args.forEach(({ key, value }) => {
      if (key === 'reset') {
        Object.assign(c, DEFAULTS);
        return;
      }
      if (key !== 'dim' && key !== 'dark') {
        error = `Unknown option: --${key}`;
        return;
      }
      const n = Number(value);
      if (!Number.isInteger(n) || n < 0 || n > 100) {
        error = `--${key} needs a whole number from 0 to 100.`;
        return;
      }
      const next = { ...c, [key]: n };
      if (next.dark >= next.dim) {
        error = 'The darkness threshold must be lower than the dim threshold.';
        return;
      }
      c[key] = n;
    });

    showSettings(msg.playerid, error);
  };

  // ---------- Light check ----------

  const markerFor = (lightLevel) => {
    const c = cfg();
    if (lightLevel <= c.dark) return MARKER.dark;
    if (lightLevel <= c.dim) return MARKER.dim;
    return MARKER.bright;
  };

  const handleGraphicChange = (obj, prev) => {
    if (obj.get('_subtype') !== 'token' || obj.get('layer') !== 'objects') return;
    if (prev.left === obj.get('left') && prev.top === obj.get('top')) return;

    const name = obj.get('name') || '';
    if (!MARKER_RE.test(name)) return;

    updateToken(obj);
  };

  // Returns the marker for the token's current light, or null if it can't be read
  const currentMarker = (obj) => {
    if (typeof checkLightLevel === 'undefined' || typeof checkLightLevel.isLitBy !== 'function') return null;
    const page = getObj('page', obj.get('_pageid'));
    if (!page || !page.get('dynamic_lighting_enabled')) return null;
    const litBy = checkLightLevel.isLitBy(obj);
    if (!litBy || typeof litBy.total !== 'number') return null;
    return markerFor(Math.round(litBy.total * 100));
  };

  const updateToken = (obj) => {
    const name = obj.get('name') || '';
    const marker = currentMarker(obj);
    if (!marker) return;
    const newName = name.replace(MARKER_RE, '') + marker;
    if (newName !== name) obj.set('name', newName);
  };

  // Adds the marker; shows the light level right away when it can be read
  const enableToken = (obj) => {
    const name = obj.get('name') || '';
    if (MARKER_RE.test(name)) return;
    obj.set('name', name + (currentMarker(obj) || MARKER.unset));
  };

  const disableToken = (obj) => {
    const name = obj.get('name') || '';
    if (!MARKER_RE.test(name)) return;
    obj.set('name', name.replace(MARKER_RE, ''));
  };

  // ---------- Startup ----------

  on('ready', () => {
    checkState();
    on('chat:message', handleInput);
    on('change:graphic', handleGraphicChange);
    if (typeof checkLightLevel === 'undefined') {
      log(`${SCRIPT_NAME} ${VERSION}: checkLightLevel is not installed. Tokens will not be updated until it is.`);
    } else {
      log(`${SCRIPT_NAME} ${VERSION} ready.`);
    }
  });

  return { version: VERSION };
})();
